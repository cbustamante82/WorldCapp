# WorldCapp — Álbum Mundial 2026

Aplicación web **local-first** para controlar el avance del álbum Panini del Mundial 2026
(objetivo: 112 páginas, 980 láminas, 68 especiales). Toda la información de progreso se
guarda en el navegador del usuario; no hay servidor.

## Stack

- **React + Vite** — interfaz y bundler.
- **Tailwind CSS** — estilos (tokens de diseño en `tailwind.config.js` e `src/index.css`).
- **Recharts** — gráficos de la Vista Progreso.
- **Dexie.js sobre IndexedDB** — persistencia local-first (ver nota abajo).
- **React Router** — navegación entre las tres vistas.

### Nota sobre la persistencia (Dexie ≠ MySQL)

La especificación pedía "Dexie.js sobre MySQL". Dexie.js es una capa sobre **IndexedDB**
del navegador, **no** sobre MySQL. Esa es justamente la pieza que hace la app *local-first*:
los datos viven en el equipo del usuario sin servidor. MySQL es un motor de servidor y no
puede ser la persistencia local de una app de navegador.

Por eso aquí se usa **Dexie + IndexedDB**. Si más adelante quieres sincronizar el progreso a
un backend MySQL, eso sería una **capa de servidor adicional** (API + base remota) que se
añadiría sin tocar el modelo local actual.

## Cómo ejecutar

Requiere Node.js 18+.

```bash
cd C:\Code\WorldCapp
npm install
npm run dev
```

Vite abrirá `http://localhost:5173`.

Para compilar producción: `npm run build` y previsualizar con `npm run preview`.

## Las tres vistas

1. **Álbum** (`/`) — render fiel de la distribución física: cada página es una hoja con sus
   huecos. Click en un hueco vacío lo marca como *pegada*; click en un cromo pegado suma una
   *repetida*. Cada lámina muestra número, nombre, posición en la hoja, página y sección.
2. **Progreso** (`/progreso`) — pegadas, repetidas y faltantes; donut de avance, barras por
   sección y por selección, y un listado filtrable y exportable a CSV / JSON.
3. **Exploración** (`/exploracion`) — filtros por tipo de lámina y por país, y ranking de las
   figuras más relevantes de los últimos 4 años.

## Modelo de datos

Los **datos fijos del álbum** están separados del **progreso personal**:

| Entidad          | Archivo                     | Naturaleza                         |
| ---------------- | --------------------------- | ---------------------------------- |
| `SECCION`        | `src/data/secciones.js`     | Catálogo fijo                      |
| `SELECCION`      | `src/data/selecciones.js`   | Catálogo fijo                      |
| `TIPO_LAMINA`    | `src/data/tiposLamina.js`   | Catálogo fijo                      |
| `PAGINA`+`LAMINA`| `src/data/laminas.js`       | Catálogo fijo (distribución)       |
| `FIGURA_RANKING` | `src/data/figuraRanking.js` | Catálogo fijo (1:N por jugador)    |
| `ESTADO_COLECCION` | tabla Dexie `estadoColeccion` | **Progreso personal** (mutable) |

El catálogo se siembra en IndexedDB una vez (ver `src/db/db.js`, `seedCatalog`). Lo único que
el usuario modifica es `estadoColeccion` (campos `pegada` y `repetidas`). `FIGURA_RANKING` se
enlaza a `LAMINA` por `laminaId` y admite varias fuentes/años por jugador.

## Sección piloto y cómo escalar a 980 láminas

Tal como se pidió, primero se valida el **flujo completo** con una **sección piloto**
(`src/data/laminas.js`: 2 selecciones de muestra, 40 láminas). Los nombres de jugadores son
**datos de muestra representativos** y deben reemplazarse por el plantel oficial.

Para escalar al álbum completo, **la estructura no cambia**; solo se añaden datos:

1. Agregar selecciones en `src/data/selecciones.js`.
2. Agregar secciones en `src/data/secciones.js`.
3. Agregar páginas y láminas en `src/data/laminas.js` (mismo formato: `positionInSheet`,
   `pageId`, `sectionId`, `seleccionId`, `tipoId`).
4. Subir `CATALOG_VERSION` en `src/db/db.js` para resembrar el catálogo (no borra el progreso).

## Convenciones

- Código (variables, archivos): **inglés**.
- Comentarios y UI: **español**.
- Ediciones incrementales que preservan el texto existente.
