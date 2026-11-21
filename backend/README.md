# Fixly API

API REST de Node.js, Express y MongoDB para las cuentas y alertas de Fixly. El cliente móvil todavía usa sus datos locales de demostración; conectar la app con esta API es un siguiente paso.

## Requisitos

- Node.js 20 o superior.
- Docker Desktop con el motor en ejecución para MongoDB local, o una URI de MongoDB Atlas.

## Configuración

Desde `backend/`, inicia MongoDB local. Docker guarda los datos en un volumen persistente y publica el puerto solo en `localhost`:

```powershell
docker compose up -d
docker compose ps
```

La instancia local no requiere usuario ni contraseña y no queda expuesta a la red. Usa una base Atlas para desarrollo compartido o despliegue; no publiques la URI ni credenciales.

Luego configura e inicia la API:

```powershell
Copy-Item .env.example .env
```

Para MongoDB local, `MONGODB_URI=mongodb://127.0.0.1:27017/fixly` ya apunta a la base correcta. Edita `.env` y reemplaza `JWT_SECRET` por una clave aleatoria de al menos 32 caracteres. La API no iniciará con el valor de ejemplo. Puedes generar una clave con:

```powershell
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Instala dependencias e inicia la API:

```powershell
npm install
npm run dev
```

La API queda en `http://localhost:3000`. Confirma la conexión de la API y MongoDB con:

```powershell
Invoke-RestMethod http://localhost:3000/api/health
```

Debe responder `status: ok` y `database: connected`. Si trabajas desde un teléfono con Expo Go, configura la IP local del computador en `EXPO_PUBLIC_API_URL` y en `CLIENT_ORIGINS` cuando uses Expo Web; `localhost` en el teléfono apunta al teléfono, no al computador.

Para detener MongoDB sin borrar los datos:

```powershell
docker compose down
```

Los datos están en un volumen persistente. Para eliminar también la base local y todo su contenido, ejecuta `docker compose down --volumes` desde `backend/`.

## Crear usuarios de gestión

El registro público solo crea miembros. Para dar permisos de encargado o administrador, configura temporalmente `NEW_USER_NAME`, `NEW_USER_EMAIL`, `NEW_USER_PASSWORD` y `NEW_USER_ROLE` en el `.env` local. Para rol `manager`, añade `NEW_USER_AREA` con uno de estos valores: `Aseo`, `TI`, `Mantenimiento` o `Construcción`. Luego ejecuta:

```powershell
npm run create-user
```

Retira esas variables del `.env` después de crear la cuenta. Las contraseñas se guardan usando bcrypt; el endpoint público nunca permite asignar roles privilegiados.

Para cargar las cuentas y alertas demo usadas por la app móvil:

```powershell
npm run seed-demo
```

Las cuentas demo usan clave `1234`. El script no elimina datos existentes y solo crea o actualiza las cuentas y alertas demo.

## Rutas

Todas las respuestas de error usan `{ "error": "..." }`. Las rutas protegidas requieren `Authorization: Bearer <token>`.

| Método | Ruta | Acceso |
|---|---|---|
| GET | `/api/health/live` | Público |
| GET | `/api/health` | Público; estado de MongoDB |
| POST | `/api/auth/register` | Público; crea miembro |
| POST | `/api/auth/login` | Público |
| GET | `/api/auth/me` | Autenticado |
| GET | `/api/alerts` | Autenticado; filtra por rol |
| POST | `/api/alerts` | Miembro |
| GET | `/api/alerts/:id` | Dueño, encargado del área o admin |
| POST | `/api/alerts/:id/accept` | Encargado |
| POST | `/api/alerts/:id/release` | Encargado asignado |
| POST | `/api/alerts/:id/resolve` | Encargado asignado |
| GET | `/api/alerts/moderation/pending` | Admin |
| POST | `/api/alerts/:id/moderation` | Admin; `{ "valid": true|false }` |
| GET | `/api/alerts/closures/pending` | Admin |
| POST | `/api/alerts/:id/review` | Admin; `{ "approved": true|false }` |
| GET | `/api/alerts/points/:userId` | Dueño o admin |

Las imágenes se reciben como URLs `http`/`https`; la carga y almacenamiento de archivos todavía no están implementados. Los puntos se calculan a partir de alertas aprobadas (10 por cierre aprobado).

## Pruebas

```powershell
npm test
npm run test:integration
```

La prueba de integración usa `fixly_test` en MongoDB local (o `MONGODB_TEST_URI` si se define), crea cuentas de prueba únicas, verifica el flujo completo y elimina sus propios registros. No apunta a la base de desarrollo `fixly`.
