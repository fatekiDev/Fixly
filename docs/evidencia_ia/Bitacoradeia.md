# Registro de Uso de Inteligencia Artificial — Proyecto Fixly

Este documento detalla el uso de herramientas de Inteligencia Artificial (GitHub Copilot en Visual Studio Code) durante el desarrollo de la aplicación móvil **Fixly**, incluyendo las decisiones técnicas tomadas y la evidencia visual de los procesos realizados.

## 1. Herramientas Utilizadas
* **Asistente IA:** GitHub Copilot (VS Code)
* **Modelo:** Copilot Fusion
* **Propósito:** Auditoría inicial de stack tecnológico, migración de arquitectura móvil, configuración de proyecto base y validación de calidad de código.

---

## 2. Casos Destacados de Interacción

### Caso 1: Diagnóstico inicial y auditoría de dependencias
* **Contexto / Prompt:** Se consultó sobre las tecnologías y dependencias instaladas actualmente en el repositorio para verificar el estado inicial del proyecto.
* **Respuesta / Acción de la IA:** La IA inspeccionó la estructura del directorio (`pubspec.yaml`, carpeta `lib/`) y confirmó que el proyecto estaba construido originalmente en **Flutter (Dart)**, detallando sus dependencias principales (como `cupertino_icons` y `flutter_lints`) y el estado del árbol de trabajo.
* **Resultado:** Confirmación de la necesidad de migrar hacia el stack requerido por el equipo.

---

### Caso 2: Migración limpia de Flutter a React Native con Expo
* **Contexto / Prompt:** Se solicitó eliminar la base existente en Flutter e inicializar un proyecto limpio desde cero utilizando **React Native con Expo**, dejando una estructura mínima sin código de ejemplo.
* **Respuesta / Acción de la IA:** El asistente respaldó los archivos necesarios (`docs/` y configuración de Git), eliminó los directorios de Flutter, inicializó la aplicación con `npx create-expo-app@latest` (Expo SDK 58) y ejecutó `npm run reset-project` para mover la plantilla inicial a `app-example/` y dejar lista la carpeta `app/`.
* **Resultado:** Base limpia en TypeScript con Expo Router configurada y lista para comenzar a desarrollar vistas.


---

### Caso 3: Configuración de TypeScript y validación de Linter
* **Contexto / Prompt:** Se pidió verificar que la compilación estática y las reglas de estilo funcionaran correctamente tras el reinicio del proyecto.
* **Respuesta / Acción de la IA:** Al ejecutar `npx tsc --noEmit`, la IA detectó que los archivos residuales en `app-example/` generaban errores de tipado. Actualizó el archivo `tsconfig.json` para excluir dicha carpeta (`"exclude": ["app-example"]`) y validó nuevamente tanto TypeScript como ESLint (`npm run lint`).
* **Resultado:** Proyecto libre de errores de compilación y linting (`0 errors, 0 warnings`).


> Captura de la ejecución limpia de `npx tsc --noEmit` y `npm run lint` sin errores.*
![Validación de TypeScript y ESLint](docs/evidencia_ia/cap1.png)

---

### Caso 4: Planificación de arquitectura y pantalla de Login
* **Contexto / Prompt:** Se solicitó definir la estructura de carpetas del proyecto (`src/`), establecer la paleta de colores y desarrollar la pantalla de inicio de sesión (*Login*) con cuentas de prueba basándose en los *wireframes* de `docs/wireframes`.
* **Respuesta / Acción de la IA:** La IA procedió a revisar los *wireframes* existentes en el repositorio para alinear el diseño visual y la arquitectura de componentes antes de implementar la interfaz.
* **Resultado:** Inicio de la fase de construcción de interfaz y flujo de autenticación.

> **[ESPACIO PARA CAPTURA 4]**
> *Descripción sugerida: Captura de la pantalla de Login en el emulador o vista previa de la estructura de carpetas implementada.*
![Implementación de Login y estructura](docs/evidencia_ia/cap2.png)

---

## 3. Conclusiones y Validación Humana
* **Supervisión:** Cada comando ejecutado por el agente en terminal (eliminación de archivos de Flutter, creación de app Expo y modificación de configuración) fue revisado y aprobado manualmente.
* **Impacto:** El uso del asistente permitió reducir significativamente el tiempo de configuración inicial del entorno y asegurar una base tipada y validada antes de escribir la lógica de negocio.