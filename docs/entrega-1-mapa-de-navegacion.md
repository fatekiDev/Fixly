# Mapa de navegación de Fixly

El acceso a las pantallas depende del rol autenticado. `/home` redirige al inicio correspondiente: miembro, encargado o administrador.

## Entrada y autenticación

```text
Inicio de sesión (/) <--> Crear cuenta (/register)
          |
          +-- autenticación correcta --> /home --> inicio según rol
```
C
## Miembro

La barra inferior contiene las pestañas Alertas, Nueva y Perfil. Las pantallas de detalle se abren sobre el flujo y regresan a Alertas.

```text
Alertas (/member) ------------------> Detalle de alerta (/member/alert/[id])
    |                                               |
    |                                               +--> volver a Alertas
    |
    +-- pestaña Nueva --> Nueva alerta (/member/new-alert)
                              |
                              +-- publicar --> Detalle de la alerta creada
    |
    +-- pestaña Perfil --> Perfil (/member/profile)
```

## Encargado

La barra inferior contiene las pestañas Bandeja y Bitácora.

```text
Bandeja (/manager) -----------------> Detalle de alerta (/manager/alert/[id])
    |                                               |
    |                                               +--> volver a Bandeja
    |
    +-- pestaña Bitácora --> Bitácora (/manager/history)
```

## Administrador

La barra inferior contiene las pestañas Moderación, Usuarios y Perfil. Moderación permite alternar entre publicaciones y cierres pendientes.

```text
Moderación (/admin) ----------------> Revisar cierre (/admin/closure/[id])
    |                                           |
    |                                           +--> volver a Cierres
    |
    +-- pestaña Usuarios --> Usuarios (/admin/users)
    |
    +-- pestaña Perfil --> Perfil (/admin/profile)
    |
    +-- vista Cierres (/admin/closures)
```

## Acceso desde notificaciones

Una notificación puede abrir directamente la pantalla vinculada según destinatario y caso:

- Miembro: detalle de alerta (`/member/alert/[id]`).
- Encargado: detalle de alerta (`/manager/alert/[id]`).
- Administrador: revisión del cierre (`/admin/closure/[id]`).
