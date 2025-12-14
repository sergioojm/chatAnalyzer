
## Qué hace la app
La aplicación procesa un ZIP exportado de WhatsApp (archivo `_chat.txt` dentro del ZIP) y genera estadísticas:

# WhatsApp Stats — Vista desplegada

Sitio en producción: [https://sergioojm.github.io/chatAnalyzer/]

Breve:
- Procesa un ZIP exportado de WhatsApp y genera estadísticas por participante y globales.
- Permite filtrar por fechas y autores, ver KPIs, top palabras y descargar un reporte en PDF.

Uso rápido:
1. Abre el enlace de producción arriba.
2. Ajusta el rango de fechas en el header.
3. (Opcional) Introduce autores separados por comas para filtrar.
4. Pulsa "Subir ZIP" y selecciona el ZIP exportado de WhatsApp.
5. Selecciona un participante para ver detalle y descarga el PDF si lo necesitas.

Si quieres, reemplazo `https://sergioojm.github.io/chatAnalyzer/` por la URL exacta si me la indicas.
- `src/hooks/useResponsive.js` — Hook para detectar tamaño de pantalla.

- `src/utils/helpers.js` — Funciones de soporte: parsing, tokenización, construcción de estadísticas y `downloadPdfReport`.

- `src/styles/global.css` — Estilos globales y ajustes responsive.

