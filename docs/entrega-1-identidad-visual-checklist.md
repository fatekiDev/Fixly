# Primera entrega: checklist de rúbrica

## 1. Identidad visual y sistema de diseño

### Hecho

- [x] Aumentar a 16 sp el texto de cuerpo, las descripciones, instrucciones, errores y estados vacíos de la app móvil.
- [x] Mantener tamaños compactos para etiquetas, metadatos y controles, que forman parte de la escala visual secundaria.

### Pendiente

- [ ] Conseguir o preparar el logo en formato vectorial y comprobar que se lea bien a 48 px.
- [ ] Preparar el ícono final en 1024 × 1024 y la imagen de splash; actualizar `mobile/app.json` para usar los recursos finales. Actualmente apunta al PNG cuadrado de 500 × 500.
- [ ] Documentar los códigos HEX de la paleta y justificar los colores primario, secundario, neutros y semánticos.
- [ ] Revisar las combinaciones reales de texto e íconos para WCAG AA. Sobre blanco, el cian (`#22D3EE`), éxito (`#22C55E`), advertencia (`#F59E0B`) y peligro (`#EF4444`) no alcanzan 4,5:1 como texto normal; elegir combinaciones accesibles para esos usos.
- [ ] Definir y guardar en Figma o Penpot los estilos reutilizables de color y la escala tipográfica para títulos, cuerpo y etiquetas.
- [ ] Verificar visualmente el logo y la escala tipográfica en las pantallas principales y en tamaños pequeños.

## 2. Estructura y flujo

### Hecho

- [x] Documentar las pestañas, rutas, pantallas de detalle y accesos desde notificaciones en el [mapa de navegación](./entrega-1-mapa-de-navegacion.md).
- [x] Preparar un borrador narrativo de cinco viñetas para el storyboard:
  1. Una estudiante va camino a clases, nota una silla inestable en una sala y lleva el teléfono en una mano.
  2. Abre Fixly y entra a “Nueva” para fotografiar el problema.
  3. Completa título, descripción y área responsable; publica la alerta.
  4. El encargado de esa área recibe el caso en su bandeja y lo acepta.
  5. La estudiante revisa el seguimiento y ve el caso resuelto y el cierre aprobado.

### Pendiente

- [ ] Convertir el borrador en un storyboard visual de 4 a 6 viñetas, incluyendo contexto, problema, uso móvil y resolución.
- [ ] Preparar wireframes de baja fidelidad en escala de grises para el flujo principal, con jerarquía visual y zonas de alcance del pulgar.
- [ ] Usar marcos consistentes de 390 × 844 pt; los wireframes actuales sirven como referencia visual, pero son diseños a color. Los PNG existentes de la secuencia del miembro son [alertas](./wireframes/M1-Mis-alertas.png), [nueva alerta](./wireframes/M2-Nueva-alerta.png) y [detalle](./wireframes/M3-Detalle-de-alerta.png). M1 mide 780 × 1656 px y M2/M3 780 × 1688 px.

## 3. Implementación frontend móvil

### Verificado en código

- [x] Expo SDK 58 está instalado (`expo` `~58.0.26`).
- [x] El flujo principal del miembro tiene alertas, creación de alerta y detalle con navegación real y ruta dinámica.
- [x] Las listas principales usan `FlatList`; las pantallas de alertas, bandeja, bitácora, moderación y usuarios fueron adaptadas para evitar listas dentro de `ScrollView`.
- [x] Los formularios usan `TextInput` controlados; las acciones usan `Pressable`.
- [x] Las pantallas usan `StyleSheet` y Flexbox; hay componentes reutilizables con props y tema central en `mobile/src/constants/theme.ts`.
- [x] `npm run lint` y `npx tsc --noEmit` pasan.

### Pendiente

- [ ] Ejecutar y revisar el flujo en un teléfono o emulador; todavía no se ha hecho una prueba visual de ejecución.
- [ ] Confirmar que colores y tipografías de `theme.ts` coincidan con los estilos definitivos de Figma/Penpot.
- [ ] Para probar notificaciones push remotas en Android se requiere un development build: [Expo SDK 58: Notifications](https://docs.expo.dev/versions/v58.0.0/sdk/notifications/). La revisión de funcionamiento en dispositivo queda pendiente.

## 4. Prototipo de alta fidelidad y ergonomía

### Hecho en la app

- [x] Hay una barra de pestañas y flujos de detalle con acción para volver, además de zonas seguras para notch y barra de gestos.
- [x] Los botones principales muestran estado presionado/deshabilitado y ahora pueden mostrar indicador de carga; el login, registro, publicación, moderación, revisión de cierre y acciones del encargado usan ese estado.
- [x] Se aumentaron a 48 dp o más los botones principales, pestañas, filtros, selector de área/urgencia, acciones de encabezado y navegación de regreso.
- [x] Hay respuestas de carga, error y vacío en las listas y operaciones principales; los formularios validan campos requeridos antes de enviar.

### Pendiente

- [ ] Enlazar en Figma/Penpot un prototipo navegable de las pantallas principales y verificar el recorrido completo.
- [ ] Ordenar el archivo de diseño con páginas, marcos y componentes nombrados; crear componentes con variantes y estados (presionado, deshabilitado, cargando, error y vacío).
- [ ] Revisar el prototipo en dispositivo para confirmar alcance cómodo del pulgar, áreas táctiles y zonas seguras en distintos tamaños.
- [ ] Hacer una pasada explícita de heurísticas de Nielsen: visibilidad del estado, prevención de errores y consistencia entre pantallas.
