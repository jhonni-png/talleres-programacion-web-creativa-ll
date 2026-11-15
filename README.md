# Talleres de Programación Web Creativa

Colección de talleres, parciales y proyectos del curso de programación web: HTML, CSS y JavaScript puro, sin frameworks ni paso de compilación. Cada proyecto es independiente y se abre directamente desde su `index.html`.

## Estructura

```
├── codigos/        # Proyectos web (una carpeta por proyecto)
│   └── NN_nombre/  # index.html + styles.css + script.js
├── documentos/     # Enunciados y entregas en Word (.docx)
├── .gitignore
└── README.md
```

Las carpetas y archivos siguen el patrón `NN_nombre_en_minusculas`, con guion bajo y sin espacios.

## Cómo ejecutar un proyecto

Abre la carpeta del proyecto y haz doble clic en `index.html`, o usa la extensión **Live Server** de VS Code. También sirve cualquier servidor estático:

```bash
cd codigos/01_culebrita
python3 -m http.server 5500
# luego abre http://localhost:5500
```

## Proyectos (`codigos/`)

| N.º | Carpeta | Proyecto |
|---|---|---|
| 01 | [`01_culebrita`](codigos/01_culebrita) | Juego de la Culebrita |
| 02 | [`02_calculadora`](codigos/02_calculadora) | Calculadora básica |
| 03 | [`03_piedra_papel_tijera`](codigos/03_piedra_papel_tijera) | Piedra, papel o tijera |
| 04 | [`04_adivinar_numero`](codigos/04_adivinar_numero) | Adivina el número |
| 05 | [`05_cronometro`](codigos/05_cronometro) | Cronómetro digital |
| 06 | [`06_lista_tareas`](codigos/06_lista_tareas) | Lista de tareas |
| 07 | [`07_recolector_manzanas`](codigos/07_recolector_manzanas) | El recolector de manzanas |
| 08 | [`08_clima`](codigos/08_clima) | Aplicación del Clima |
| 09 | [`09_gastos_personales`](codigos/09_gastos_personales) | Gestión de Gastos Personales |
| 10 | [`10_sistema_de_evaluacion`](codigos/10_sistema_de_evaluacion) | Sistema de Evaluaciones Interactivas |
| 11 | [`11_carritos_de_compras_interactivos`](codigos/11_carritos_de_compras_interactivos) | TecnoMarket: tienda virtual con carrito |
| 12 | [`12_tablero_kanban`](codigos/12_tablero_kanban) | Tablero Kanban |
| 13 | [`13_juego_de_memoria`](codigos/13_juego_de_memoria) | Memory Quest: juego de memoria |
| 14 | [`14_gestion_de_estudiantes`](codigos/14_gestion_de_estudiantes) | Sistema de Gestión de Estudiantes |
| 15 | [`15_dashboard`](codigos/15_dashboard) | Dashboard de Analítica Empresarial |
| 16 | [`16_ventas`](codigos/16_ventas) | Sistema POS de Ventas e Inventario |
| 17 | [`17_sistema_de_reservas`](codigos/17_sistema_de_reservas) | Sistema de Reservas y Citas |
| 18 | [`18_plataforma_lms`](codigos/18_plataforma_lms) | Aula Caldas LMS |
| 19 | [`19_constructor_visual`](codigos/19_constructor_visual) | WebBuilder: constructor visual de páginas |
| 20 | [`20_juego_carrera_de_carros`](codigos/20_juego_carrera_de_carros) | Neon Turbo: videojuego de carreras |
| 21 | [`21_studio_de_juegos`](codigos/21_studio_de_juegos) | La Aventura de Zipo: videojuego de plataformas 2D |
| 22 | [`22_validacion_formularios`](codigos/22_validacion_formularios) | Ejemplos de validación de formularios (3 ejemplos) |

## Documentos (`documentos/`)

| Archivo | Tema |
|---|---|
| `01_taller_2_dom.docx` | Taller 2: DOM |
| `02_parcial_2.docx` | Parcial 2 |
| `03_taller_gestion_de_eventos_resuelto.docx` | Taller: gestión de eventos |
| `04_parcial_gestion_de_eventos_resuelto.docx` | Parcial: gestión de eventos |
| `05_taller_lista_de_tareas_resuelto.docx` | Taller: lista de tareas |
| `06_taller_recolector_manzanas_resuelto.docx` | Taller: recolector de manzanas |
| `07_taller_persistencia.docx` | Taller: persistencia |
| `08_parcial_persistencia.docx` | Parcial: persistencia |
| `09_taller_consumo_de_datos.docx` | Taller: consumo de datos |
| `10_parcial_consumo_de_datos.docx` | Parcial: consumo de datos |
| `11_taller_validacion_avanzada_de_formularios_resuelto.docx` | Taller: validación avanzada de formularios |
| `12_parcial_validacion_de_formularios_resuelto.docx` | Parcial: validación de formularios |

## Convenciones

- **Proyectos:** `codigos/NN_nombre/` con `index.html`, `styles.css` y `script.js`.
- **Documentos:** `documentos/NN_tipo_tema.docx`, donde el tipo es `taller` o `parcial`.
- **Commits:** mensajes en español, en imperativo y descriptivos (por ejemplo, `Añade proyecto 23_nombre`).
