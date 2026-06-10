# Especificación de Requerimientos de Software (ERS)
## Aplicación de Control de Avance — Álbum Panini Mundial 2026

| Campo | Detalle |
|---|---|
| Proyecto | Álbum Mundial 2026 — App de control de colección |
| Versión del documento | 1.0 |
| Estado | Borrador para validación |
| Tipo de despliegue inicial | Local (local-first, offline) |
| Idioma de la aplicación | Español |

---

## 1. Introducción

### 1.1 Propósito
Este documento define los requerimientos funcionales y no funcionales de una aplicación web local que permite a un coleccionista controlar el avance de su álbum Panini del Mundial 2026. La aplicación reproduce de forma fiel la distribución física del álbum y entrega vistas analíticas sobre el progreso de la colección.

### 1.2 Alcance
La edición 2026 es la más extensa de la historia: 112 páginas, 980 láminas y 68 láminas consideradas especiales, producto de la expansión del torneo de 32 a 48 selecciones. La aplicación debe contemplar esta diversidad (láminas regulares, escudos, fotos de equipo, estadios, sección FWC, especiales brillantes/holográficas/doradas, lámina "00" y extra stickers fuera de numeración).

El despliegue inicial es local y offline. Queda fuera del alcance de esta versión cualquier sincronización entre dispositivos, autenticación de usuarios o backend remoto.

### 1.3 Definiciones
- **Lámina**: cada estampa individual del álbum, identificada por un número.
- **Pegada**: lámina ya adherida en el álbum.
- **Repetida**: ejemplares adicionales de una lámina ya pegada.
- **Faltante**: lámina aún no obtenida.
- **Sección**: agrupación lógica del álbum (introducción, selecciones, estadios, FWC, especiales).
- **Figura relevante**: jugador destacado según rankings de los últimos 4 años.

---

## 2. Descripción general

### 2.1 Perspectiva del producto
Aplicación de página única (SPA) que funciona en navegador, sin servidor de base de datos. Los datos fijos del álbum se cargan desde un archivo semilla; el progreso personal del usuario se persiste localmente en el navegador.

### 2.2 Funciones principales
La aplicación se organiza en tres vistas:
1. Vista Álbum — representación fiel de la distribución física.
2. Vista Progreso — analítica de avance con gráficos y listados.
3. Vista Exploración — navegación por tipo, país y ranking de figuras.

### 2.3 Características de los usuarios
Usuario único, coleccionista, que utiliza la aplicación tanto en computador (gestión y análisis) como en dispositivo móvil (marcado rápido de láminas durante intercambios).

### 2.4 Restricciones
- Operación offline tras la carga inicial.
- Rendimiento fluido con un volumen de aproximadamente 980 a 1.000 ítems.
- Diseño responsive obligatorio.

### 2.5 Supuestos y dependencias
- El dataset de las 980 láminas (número, nombre, página, posición, selección, tipo) se construye a partir del álbum físico, dado que no existe publicado en formato estructurado.
- El ranking de figuras se basa en una lista curada propia (p. ej. Balón de Oro y ranking FIFA de los últimos 4 años).

---

## 3. Requerimientos funcionales

### 3.1 Vista Álbum
- RF-01: Mostrar las láminas organizadas por sección y página, respetando el orden y la posición en la hoja del álbum físico.
- RF-02: Cada lámina debe presentar su número, nombre, posición en la hoja, página y sección.
- RF-03: Permitir marcar una lámina como pegada con una sola interacción.
- RF-04: Permitir incrementar y decrementar la cantidad de repetidas de una lámina.
- RF-05: Diferenciar visualmente las láminas pegadas, faltantes y especiales.
- RF-06: Persistir cada cambio de estado de forma inmediata.

### 3.2 Vista Progreso
- RF-07: Mostrar el total de pegadas, repetidas y faltantes.
- RF-08: Presentar un gráfico de avance general (tipo donut) con el porcentaje completado.
- RF-09: Presentar un gráfico de barras de avance por sección y por selección.
- RF-10: Mostrar un listado filtrable de láminas faltantes.
- RF-11: Mostrar un listado de repetidas disponibles para intercambio.
- RF-12: Permitir exportar el listado de faltantes y de repetidas (p. ej. a texto/CSV).

### 3.3 Vista Exploración
- RF-13: Filtrar láminas por tipo (regular, escudo, equipo, estadio, FWC, especial, extra sticker).
- RF-14: Filtrar láminas por país/selección.
- RF-15: Mostrar un ranking de figuras más relevantes de los últimos 4 años, con su fuente y año.
- RF-16: Permitir navegar desde una figura del ranking a su lámina en la Vista Álbum.

---

## 4. Requerimientos no funcionales

- RNF-01 (Disponibilidad): la aplicación funciona completamente offline tras la carga inicial.
- RNF-02 (Rendimiento): la carga de cualquier vista no debe degradarse con ~1.000 ítems.
- RNF-03 (Usabilidad): interfaz responsive, optimizada para uso táctil en móvil.
- RNF-04 (Persistencia): el progreso del usuario se conserva entre sesiones en el almacenamiento local del navegador.
- RNF-05 (Mantenibilidad): separación estricta entre datos fijos del álbum y datos de progreso personal.
- RNF-06 (Portabilidad): el dataset semilla se gestiona en un archivo editable (JSON/CSV) independiente del código.

---

## 5. Modelo de datos (referencia)

Entidades principales y su relación:
- SECCION (1) — (N) PAGINA
- PAGINA (1) — (N) LAMINA
- SELECCION (1) — (N) LAMINA
- TIPO_LAMINA (1) — (N) LAMINA
- LAMINA (1) — (1) ESTADO_COLECCION
- LAMINA (1) — (N) FIGURA_RANKING

Principio de diseño: los datos del álbum (SECCION, PAGINA, SELECCION, TIPO_LAMINA, LAMINA) son fijos y de solo lectura para el usuario; ESTADO_COLECCION (pegada, repetidas, fecha de actualización) almacena el progreso personal. FIGURA_RANKING admite múltiples fuentes y años para un mismo jugador.

---

## 6. Stack técnico

| Capa | Tecnología | Rol |
|---|---|---|
| Base | React + Vite | Estructura SPA y servidor de desarrollo |
| Estilos | Tailwind CSS | Diseño responsive |
| Gráficos | Recharts | Donut de avance y barras por sección |
| Persistencia | Dexie.js sobre IndexedDB | Almacenamiento local del progreso |
| Navegación | React Router | Ruteo entre las tres vistas |

---

## 7. Plan de implementación por fases

1. Fase A — Esqueleto del proyecto y navegación entre las tres vistas (datos simulados).
2. Fase B — Carga del dataset semilla de una sección piloto y validación del modelo.
3. Fase C — Vista Álbum funcional con marcado de pegadas/repetidas y persistencia.
4. Fase D — Vista Progreso con gráficos y listados exportables.
5. Fase E — Vista Exploración con filtros y ranking de figuras.
6. Fase F — Carga completa de las 980 láminas y ajuste de rendimiento.

---

## 8. Criterios de aceptación (resumen)

- El usuario puede marcar una lámina como pegada y el cambio persiste tras cerrar y reabrir el navegador.
- El porcentaje de avance del donut coincide con la relación pegadas/total.
- El listado de faltantes puede exportarse y refleja exactamente las láminas no pegadas.
- Los filtros por tipo y por país devuelven el subconjunto correcto de láminas.
- La distribución mostrada en la Vista Álbum coincide con el álbum físico para la sección validada.