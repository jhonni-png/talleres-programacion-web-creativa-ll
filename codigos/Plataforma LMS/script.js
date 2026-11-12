/* =====================================================
   Taller 19 - Plataforma educativa LMS
   Programación Web Creativa II - Universidad de Caldas
   JavaScript puro (ES6+), sin bibliotecas externas
   ===================================================== */

"use strict";

/* ---------- 1. CONSTANTES ---------- */
const STORAGE_KEY = "taller19_lms_v1";
const PASS_PERCENT = 70;      // Porcentaje mínimo para aprobar (3.5 / 5.0)
const QUIZ_SECONDS = 300;     // Tiempo máximo por evaluación (5 minutos)

const STUDENT = {
  name: "Camila Rodríguez Gómez",
  program: "Diseño Visual",
  code: "EST-2026-0419"
};

const VIEW_TITLES = {
  dashboard: "Panel del estudiante",
  catalog: "Catálogo de cursos",
  learn: "Módulo de aprendizaje",
  quiz: "Evaluaciones",
  history: "Historial de evaluaciones",
  certificates: "Certificados"
};

/* ---------- 2. DATOS DE DEMOSTRACIÓN ---------- */
const COURSES = [
  {
    id: "html5",
    title: "Fundamentos de HTML5",
    description: "Aprende a estructurar páginas web accesibles con etiquetas semánticas, listas, enlaces y formularios.",
    instructor: "Mg. Laura Beltrán",
    level: "Básico",
    icon: "🌐",
    cover: "linear-gradient(135deg, #0b1b45 0%, #2563eb 60%, #38bdf8 100%)",
    units: [
      {
        id: "u1",
        title: "Unidad 1 · Estructura de un documento",
        lessons: [
          {
            id: "l1",
            title: "¿Qué es HTML5?",
            minutes: 8,
            content: [
              "HTML (HyperText Markup Language) es el lenguaje de marcado que describe la estructura y el significado del contenido de una página web. HTML5 es su versión moderna e incorporó etiquetas semánticas, audio, video y nuevas interfaces de programación.",
              "Un documento HTML se compone de elementos formados por una etiqueta de apertura, un contenido y una etiqueta de cierre. Los navegadores leen ese código y construyen el árbol DOM que luego se muestra en pantalla."
            ],
            points: [
              "HTML define la estructura; CSS define la presentación; JavaScript define el comportamiento.",
              "Todo documento comienza con la declaración `<!DOCTYPE html>`.",
              "Los archivos se guardan con la extensión `.html` y se abren en el navegador."
            ],
            code: "<!DOCTYPE html>\n<html lang=\"es\">\n<head>\n  <meta charset=\"UTF-8\">\n  <title>Mi primera página</title>\n</head>\n<body>\n  <h1>Hola, mundo</h1>\n</body>\n</html>"
          },
          {
            id: "l2",
            title: "Etiquetas semánticas",
            minutes: 10,
            content: [
              "Las etiquetas semánticas describen el rol de cada bloque de la página. Gracias a ellas, los buscadores y los lectores de pantalla comprenden mejor el contenido y los desarrolladores escriben código más legible.",
              "Una página típica usa `<header>` para la cabecera, `<nav>` para los enlaces de navegación, `<main>` para el contenido principal único, `<section>` y `<article>` para agrupar contenido, `<aside>` para información complementaria y `<footer>` para el pie."
            ],
            points: [
              "Usa un solo `<main>` por página.",
              "Evita reemplazar etiquetas semánticas por `<div>` genéricos.",
              "La semántica mejora el SEO y la accesibilidad."
            ]
          }
        ]
      },
      {
        id: "u2",
        title: "Unidad 2 · Contenido y formularios",
        lessons: [
          {
            id: "l3",
            title: "Textos, listas y enlaces",
            minutes: 9,
            content: [
              "Los títulos se escriben con `<h1>` a `<h6>` respetando la jerarquía, y los párrafos con `<p>`. Para agrupar elementos se usan listas no ordenadas `<ul>` y ordenadas `<ol>`, cuyos elementos van dentro de `<li>`.",
              "Los enlaces se crean con la etiqueta `<a>` y el atributo `href`. Con `target=\"_blank\"` se abre el destino en una pestaña nueva; se recomienda añadir `rel=\"noopener\"` por seguridad."
            ],
            points: [
              "Un enlace interno puede apuntar a un identificador: `<a href=\"#contacto\">`.",
              "Las imágenes requieren el atributo `alt` con una descripción.",
              "Las listas deben usarse para contenido que realmente es una lista."
            ],
            code: "<ul>\n  <li><a href=\"index.html\">Inicio</a></li>\n  <li><a href=\"cursos.html\">Cursos</a></li>\n</ul>"
          },
          {
            id: "l4",
            title: "Formularios accesibles",
            minutes: 12,
            content: [
              "Los formularios permiten recoger datos del usuario. Se construyen con `<form>` y controles como `<input>`, `<select>` y `<textarea>`. Cada control debe tener una etiqueta `<label>` asociada mediante el atributo `for`, que coincide con el `id` del campo.",
              "HTML5 ofrece validación nativa con atributos como `required`, `minlength`, `pattern` y tipos de entrada como `email`, `number` o `date`. El navegador impide el envío si los datos no cumplen las reglas."
            ],
            points: [
              "`placeholder` es una pista, no reemplaza a `label`.",
              "`required` obliga a completar el campo.",
              "Agrupa campos relacionados con `<fieldset>` y `<legend>`."
            ],
            code: "<form>\n  <label for=\"correo\">Correo</label>\n  <input type=\"email\" id=\"correo\" name=\"correo\" required>\n  <button type=\"submit\">Enviar</button>\n</form>"
          }
        ]
      }
    ],
    quiz: [
      {
        q: "¿Qué etiqueta define el contenido principal y único de una página?",
        options: ["<section>", "<main>", "<div>", "<aside>"],
        answer: 1,
        feedback: "<main> representa el contenido principal del documento y debe aparecer una sola vez."
      },
      {
        q: "¿Qué declaración indica que el documento usa HTML5?",
        options: ["<!DOCTYPE html>", "<html5>", "<!HTML version=\"5\">", "<meta html5>"],
        answer: 0,
        feedback: "La declaración <!DOCTYPE html> activa el modo estándar de HTML5 en el navegador."
      },
      {
        q: "¿Qué atributo asocia un <label> con un campo de formulario?",
        options: ["name", "for", "href", "value"],
        answer: 1,
        feedback: "El atributo for del label debe coincidir con el id del campo."
      },
      {
        q: "¿Qué atributo impide enviar un formulario con un campo vacío?",
        options: ["placeholder", "disabled", "required", "readonly"],
        answer: 2,
        feedback: "required activa la validación nativa y exige que el campo tenga un valor."
      },
      {
        q: "¿Qué elemento es el adecuado para agrupar los enlaces de navegación principales?",
        options: ["<nav>", "<links>", "<menu-list>", "<footer>"],
        answer: 0,
        feedback: "<nav> es la etiqueta semántica destinada a los bloques de navegación."
      }
    ]
  },
  {
    id: "css3",
    title: "CSS3: Layouts con Flexbox y Grid",
    description: "Domina selectores, modelo de caja y los sistemas de diseño modernos para crear interfaces responsive.",
    instructor: "Ing. Mateo Giraldo",
    level: "Intermedio",
    icon: "🎨",
    cover: "linear-gradient(135deg, #4c1d95 0%, #7c3aed 55%, #38bdf8 120%)",
    units: [
      {
        id: "u1",
        title: "Unidad 1 · Selectores y modelo de caja",
        lessons: [
          {
            id: "l1",
            title: "Selectores y especificidad",
            minutes: 10,
            content: [
              "CSS aplica estilos a los elementos mediante selectores. Existen selectores de etiqueta (`p`), de clase (`.tarjeta`), de identificador (`#menu`), de atributo y pseudoclases como `:hover`.",
              "Cuando varias reglas compiten, el navegador resuelve el conflicto con la especificidad: el identificador pesa más que la clase, y la clase más que la etiqueta. Si hay empate, gana la regla escrita al final."
            ],
            points: [
              "Orden de peso: `#id` > `.clase` > `etiqueta`.",
              "Evita abusar de `!important`.",
              "Usa variables CSS (`--color-principal`) para mantener una paleta coherente."
            ],
            code: ":root {\n  --violeta: #7c3aed;\n}\n.boton {\n  background: var(--violeta);\n  color: white;\n}\n.boton:hover {\n  opacity: 0.85;\n}"
          },
          {
            id: "l2",
            title: "El modelo de caja",
            minutes: 9,
            content: [
              "Todo elemento HTML es una caja rectangular formada, de adentro hacia afuera, por el contenido, el relleno (`padding`), el borde (`border`) y el margen (`margin`).",
              "Con `box-sizing: border-box` el ancho declarado incluye el relleno y el borde, lo que simplifica enormemente los cálculos de diseño."
            ],
            points: [
              "`padding` separa el contenido del borde.",
              "`margin` separa la caja de otras cajas.",
              "Aplica `*, *::before, *::after { box-sizing: border-box; }` al inicio de tus hojas de estilo."
            ]
          }
        ]
      },
      {
        id: "u2",
        title: "Unidad 2 · Layouts modernos",
        lessons: [
          {
            id: "l3",
            title: "Flexbox",
            minutes: 12,
            content: [
              "Flexbox organiza elementos en una dimensión (fila o columna). Se activa con `display: flex` en el contenedor, y sus hijos se convierten en elementos flexibles.",
              "La propiedad `justify-content` alinea los elementos en el eje principal, mientras que `align-items` los alinea en el eje transversal. Con `flex-wrap: wrap` los elementos saltan de línea cuando no caben."
            ],
            points: [
              "`gap` define el espacio entre elementos.",
              "`flex-direction: column` cambia el eje principal.",
              "Ideal para menús, barras y tarjetas alineadas."
            ],
            code: ".barra {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  gap: 1rem;\n}"
          },
          {
            id: "l4",
            title: "CSS Grid",
            minutes: 12,
            content: [
              "CSS Grid organiza el contenido en dos dimensiones: filas y columnas. Se activa con `display: grid` y se definen las columnas con `grid-template-columns`.",
              "La unidad `fr` reparte el espacio disponible en fracciones, y la función `repeat()` evita repetir valores. Combinada con `auto-fit` y `minmax()`, permite crear cuadrículas responsive sin media queries."
            ],
            points: [
              "`grid-template-columns: repeat(3, 1fr)` crea tres columnas iguales.",
              "`grid-column` y `grid-row` permiten que un elemento ocupe varias celdas.",
              "Grid y Flexbox se complementan: Grid para la página, Flexbox para los componentes."
            ],
            code: ".galeria {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));\n  gap: 1rem;\n}"
          }
        ]
      }
    ],
    quiz: [
      {
        q: "¿Qué selector tiene la mayor especificidad?",
        options: [".clase", "#identificador", "p", "*"],
        answer: 1,
        feedback: "El selector de identificador (#) pesa más que los de clase, etiqueta y el universal."
      },
      {
        q: "¿Cuál es el orden del modelo de caja de adentro hacia afuera?",
        options: [
          "Contenido, padding, border, margin",
          "Contenido, margin, border, padding",
          "Margin, border, padding, contenido",
          "Contenido, border, padding, margin"
        ],
        answer: 0,
        feedback: "Las capas son: contenido, relleno (padding), borde (border) y margen (margin)."
      },
      {
        q: "¿Qué declaración activa Flexbox en un contenedor?",
        options: ["flex-wrap: wrap;", "display: flex;", "align-items: center;", "position: flex;"],
        answer: 1,
        feedback: "display: flex convierte al elemento en contenedor flexible."
      },
      {
        q: "¿Qué declaración crea tres columnas de igual tamaño en CSS Grid?",
        options: [
          "grid-template-columns: repeat(3, 1fr);",
          "grid-columns: 3;",
          "display: columns(3);",
          "flex-columns: 1fr 1fr 1fr;"
        ],
        answer: 0,
        feedback: "repeat(3, 1fr) repite tres veces una columna de una fracción del espacio disponible."
      },
      {
        q: "En un contenedor flex en fila, ¿qué propiedad alinea los elementos en el eje transversal?",
        options: ["justify-content", "align-items", "text-align", "float"],
        answer: 1,
        feedback: "align-items controla el eje transversal; justify-content controla el eje principal."
      }
    ]
  },
  {
    id: "js",
    title: "JavaScript ES6+ Esencial",
    description: "Programa la lógica de tus páginas: variables, funciones, manipulación del DOM, eventos y LocalStorage.",
    instructor: "Dra. Sofía Marín",
    level: "Intermedio",
    icon: "⚡",
    cover: "linear-gradient(135deg, #0f172a 0%, #1d4ed8 50%, #a78bfa 110%)",
    units: [
      {
        id: "u1",
        title: "Unidad 1 · Fundamentos del lenguaje",
        lessons: [
          {
            id: "l1",
            title: "Variables y tipos de datos",
            minutes: 9,
            content: [
              "En JavaScript moderno se declaran variables con `let` (valor que puede cambiar) y `const` (valor que no se reasigna). Se evita `var` por su comportamiento de ámbito poco predecible.",
              "Los tipos primitivos son `string`, `number`, `boolean`, `undefined`, `null`, `bigint` y `symbol`. Además existen los objetos y los arrays, que permiten agrupar información compleja."
            ],
            points: [
              "Prefiere `const` por defecto y usa `let` solo si necesitas reasignar.",
              "Los template literals usan comillas invertidas: `Hola ${nombre}`.",
              "Un array de objetos es la estructura ideal para listas de datos."
            ],
            code: "const curso = { titulo: \"JavaScript\", lecciones: 4 };\nlet progreso = 0;\nprogreso = progreso + 25;\nconsole.log(`${curso.titulo}: ${progreso}%`);"
          },
          {
            id: "l2",
            title: "Funciones y arrow functions",
            minutes: 10,
            content: [
              "Una función encapsula un bloque de código reutilizable. Puede declararse con la palabra `function` o mediante una arrow function, que ofrece una sintaxis más corta con el operador `=>`.",
              "Los métodos de array como `map`, `filter`, `find` y `reduce` reciben funciones y permiten transformar listas sin escribir bucles manuales."
            ],
            points: [
              "Una función debe hacer una sola tarea.",
              "`filter` devuelve los elementos que cumplen una condición.",
              "`reduce` acumula una lista en un único valor."
            ],
            code: "const sumar = (a, b) => a + b;\nconst notas = [3.5, 4.2, 5.0];\nconst promedio = notas.reduce(sumar, 0) / notas.length;"
          }
        ]
      },
      {
        id: "u2",
        title: "Unidad 2 · Interacción con el DOM",
        lessons: [
          {
            id: "l3",
            title: "Selección y manipulación del DOM",
            minutes: 11,
            content: [
              "El DOM (Document Object Model) es la representación del documento HTML como un árbol de objetos que JavaScript puede leer y modificar. Para seleccionar elementos se usan `document.querySelector()` y `document.querySelectorAll()`.",
              "Una vez seleccionado un elemento, se puede cambiar su texto con `textContent`, su contenido HTML con `innerHTML`, sus clases con `classList` y sus atributos con `setAttribute`."
            ],
            points: [
              "Usa `textContent` cuando insertes texto escrito por el usuario.",
              "`classList.toggle('activo')` agrega o quita una clase.",
              "`createElement` y `appendChild` construyen nodos nuevos."
            ],
            code: "const titulo = document.querySelector(\"#titulo\");\ntitulo.textContent = \"Bienvenida, Camila\";\ntitulo.classList.add(\"destacado\");"
          },
          {
            id: "l4",
            title: "Eventos y LocalStorage",
            minutes: 12,
            content: [
              "Los eventos permiten reaccionar a las acciones del usuario. Se registran con `addEventListener`, indicando el tipo de evento (`click`, `input`, `submit`) y la función que se ejecutará.",
              "LocalStorage almacena pares clave-valor en el navegador y conserva los datos aunque se recargue la página. Solo guarda texto, por lo que los objetos se convierten con `JSON.stringify` y se recuperan con `JSON.parse`."
            ],
            points: [
              "`localStorage.setItem(clave, valor)` guarda un dato.",
              "`localStorage.getItem(clave)` lo recupera.",
              "Envuelve `JSON.parse` en `try...catch` para evitar errores con datos dañados."
            ],
            code: "const estado = { completadas: [\"l1\", \"l2\"] };\nlocalStorage.setItem(\"progreso\", JSON.stringify(estado));\nconst guardado = JSON.parse(localStorage.getItem(\"progreso\"));"
          }
        ]
      }
    ],
    quiz: [
      {
        q: "¿Qué palabra clave declara una variable cuyo valor no se reasigna?",
        options: ["var", "let", "const", "static"],
        answer: 2,
        feedback: "const declara una referencia que no puede reasignarse."
      },
      {
        q: "¿Cuál de las siguientes es una arrow function válida?",
        options: [
          "const sumar = (a, b) => a + b;",
          "const sumar = (a, b) -> a + b;",
          "function => sumar(a, b) { a + b }",
          "const sumar = fn(a, b) => a + b;"
        ],
        answer: 0,
        feedback: "La sintaxis correcta usa los parámetros, el operador => y la expresión de retorno."
      },
      {
        q: "¿Qué método selecciona el primer elemento que coincide con un selector CSS?",
        options: ["document.getElement()", "document.querySelector()", "document.select()", "document.find()"],
        answer: 1,
        feedback: "document.querySelector() recibe un selector CSS y devuelve el primer elemento coincidente."
      },
      {
        q: "¿Qué instrucción guarda un dato en LocalStorage?",
        options: [
          "localStorage.setItem(clave, valor)",
          "localStorage.saveItem(clave, valor)",
          "localStorage.put(clave, valor)",
          "localStorage.store(clave, valor)"
        ],
        answer: 0,
        feedback: "setItem es el método estándar para almacenar un par clave-valor."
      },
      {
        q: "¿Cómo se convierte un objeto en texto para guardarlo en LocalStorage?",
        options: ["JSON.stringify(objeto)", "objeto.toText()", "JSON.parse(objeto)", "String.json(objeto)"],
        answer: 0,
        feedback: "JSON.stringify serializa el objeto a texto; JSON.parse hace el proceso inverso."
      }
    ]
  },
  {
    id: "ux",
    title: "Diseño de Interfaces UX/UI",
    description: "Aplica principios de experiencia de usuario, jerarquía visual, prototipado y pruebas de usabilidad.",
    instructor: "Dis. Julián Restrepo",
    level: "Avanzado",
    icon: "🧭",
    cover: "linear-gradient(135deg, #1e1b4b 0%, #6d28d9 55%, #22d3ee 125%)",
    units: [
      {
        id: "u1",
        title: "Unidad 1 · Principios de diseño",
        lessons: [
          {
            id: "l1",
            title: "¿Qué son UX y UI?",
            minutes: 8,
            content: [
              "UX (User Experience) estudia la experiencia completa de una persona al usar un producto: qué tan fácil, eficiente y satisfactorio resulta. UI (User Interface) se ocupa de la parte visual e interactiva: colores, tipografías, botones y componentes.",
              "Un buen producto digital necesita ambas disciplinas: una interfaz atractiva que no resuelve el problema del usuario fracasa, y una solución útil con una interfaz confusa tampoco se adopta."
            ],
            points: [
              "UX responde a ¿cómo se siente y qué tan fácil es?",
              "UI responde a ¿cómo se ve y cómo se interactúa?",
              "Todo diseño parte de conocer al usuario y su contexto."
            ]
          },
          {
            id: "l2",
            title: "Jerarquía visual y color",
            minutes: 10,
            content: [
              "La jerarquía visual guía la mirada del usuario hacia lo más importante mediante tamaño, contraste, color, espacio y posición. Los elementos principales deben destacarse y los secundarios apoyarse sin competir.",
              "La paleta de color debe ser limitada y coherente. Las pautas de accesibilidad WCAG recomiendan una relación de contraste mínima de 4.5:1 entre el texto normal y su fondo."
            ],
            points: [
              "Usa un color principal, uno de acento y neutros.",
              "El espacio en blanco mejora la lectura.",
              "No comuniques información solo con el color."
            ]
          }
        ]
      },
      {
        id: "u2",
        title: "Unidad 2 · Prototipado y evaluación",
        lessons: [
          {
            id: "l3",
            title: "Wireframes y prototipos",
            minutes: 10,
            content: [
              "Un wireframe es un esquema de baja fidelidad que muestra la estructura de una pantalla sin detalles gráficos. Sirve para decidir dónde va cada elemento antes de invertir tiempo en el diseño visual.",
              "Un prototipo es una versión navegable que simula la interacción. Puede ser de baja fidelidad (papel o bocetos) o de alta fidelidad (muy parecido al producto final)."
            ],
            points: [
              "Empieza por bocetos rápidos.",
              "Itera varias veces antes de programar.",
              "Prueba el prototipo con usuarios reales."
            ]
          },
          {
            id: "l4",
            title: "Pruebas de usabilidad y accesibilidad",
            minutes: 11,
            content: [
              "Una prueba de usabilidad consiste en observar a personas reales mientras realizan tareas con el producto. Permite detectar obstáculos que el equipo de diseño no percibe.",
              "Las heurísticas de Nielsen son diez principios generales, como la visibilidad del estado del sistema, la prevención de errores y la consistencia. La accesibilidad garantiza que personas con diferentes capacidades puedan usar la interfaz."
            ],
            points: [
              "Con cinco usuarios se descubren la mayoría de problemas graves.",
              "Incluye texto alternativo, foco visible y navegación por teclado.",
              "Documenta los hallazgos y prioriza las correcciones."
            ]
          }
        ]
      }
    ],
    quiz: [
      {
        q: "¿Qué estudia principalmente la experiencia de usuario (UX)?",
        options: [
          "Solo los colores de la interfaz",
          "La experiencia completa de la persona al usar un producto",
          "El lenguaje de programación utilizado",
          "El precio del producto"
        ],
        answer: 1,
        feedback: "UX abarca facilidad, eficiencia y satisfacción en todo el recorrido del usuario."
      },
      {
        q: "¿Qué es un wireframe?",
        options: [
          "Un prototipo final con animaciones",
          "Un lenguaje de maquetación",
          "Un esquema de baja fidelidad de la estructura de una pantalla",
          "Una base de datos de usuarios"
        ],
        answer: 2,
        feedback: "El wireframe muestra la estructura sin detalles gráficos, para decidir la ubicación de los elementos."
      },
      {
        q: "Según WCAG, ¿cuál es la relación de contraste mínima recomendada para texto normal?",
        options: ["1.5:1", "3:1", "4.5:1", "20:1"],
        answer: 2,
        feedback: "El nivel AA exige al menos 4.5:1 para texto de tamaño normal."
      },
      {
        q: "¿Cuál es el objetivo de la jerarquía visual?",
        options: [
          "Hacer que todos los elementos tengan el mismo tamaño",
          "Guiar la mirada del usuario hacia lo más importante",
          "Reducir el número de pantallas",
          "Eliminar el espacio en blanco"
        ],
        answer: 1,
        feedback: "Con tamaño, contraste, color y posición se orienta la atención del usuario."
      },
      {
        q: "¿En qué consiste una prueba de usabilidad?",
        options: [
          "En revisar el código fuente con un validador",
          "En medir la velocidad del servidor",
          "En observar a usuarios reales realizando tareas con el producto",
          "En comparar el diseño con la competencia"
        ],
        answer: 2,
        feedback: "Observar a personas reales permite detectar problemas que el equipo no percibe."
      }
    ]
  }
];

/* ---------- 3. ESTADO Y PERSISTENCIA (LocalStorage) ---------- */
const createDefaultState = () => ({
  enrolled: ["html5", "css3"],
  completed: {},      // { cursoId: ["l1", "l2"] }
  attempts: [],       // historial de evaluaciones
  certificates: {},   // { cursoId: { date, percent, grade, code } }
  lastLesson: {}      // { cursoId: "l3" }
});

function loadState() {
  const base = createDefaultState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return base;
    const data = JSON.parse(raw);
    return {
      enrolled: Array.isArray(data.enrolled) ? data.enrolled : base.enrolled,
      completed: data.completed && typeof data.completed === "object" ? data.completed : {},
      attempts: Array.isArray(data.attempts) ? data.attempts : [],
      certificates: data.certificates && typeof data.certificates === "object" ? data.certificates : {},
      lastLesson: data.lastLesson && typeof data.lastLesson === "object" ? data.lastLesson : {}
    };
  } catch (error) {
    console.warn("No se pudo leer LocalStorage. Se usarán datos nuevos.", error);
    return base;
  }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    toast("No se pudo guardar el progreso en el navegador.", "error");
  }
}

let state = loadState();

/* Estado de la interfaz (no se persiste) */
const ui = {
  view: "dashboard",
  courseId: null,
  lessonId: null,
  quiz: null,        // { courseId, status: "active" | "result", remaining, attempt, details }
  timerId: null,
  certId: null,
  filter: { text: "", level: "all" }
};

/* ---------- 4. UTILIDADES ---------- */
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

function esc(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/* Escapa el texto y convierte `texto` en <code>texto</code> */
function fmt(text) {
  return esc(text).replace(/`([^`]+)`/g, "<code>$1</code>");
}

function getCourse(id) {
  return COURSES.find(course => course.id === id);
}

function getLessons(course) {
  return course.units.flatMap(unit =>
    unit.lessons.map(lesson => ({ ...lesson, unitId: unit.id, unitTitle: unit.title }))
  );
}

function getLesson(course, lessonId) {
  return getLessons(course).find(lesson => lesson.id === lessonId);
}

function getCompleted(courseId) {
  return state.completed[courseId] || [];
}

function isLessonDone(courseId, lessonId) {
  return getCompleted(courseId).includes(lessonId);
}

function courseProgress(course) {
  const total = getLessons(course).length;
  const done = getCompleted(course.id).filter(id => getLessons(course).some(l => l.id === id)).length;
  return { done, total, percent: total ? Math.round((done / total) * 100) : 0 };
}

function getAttempts(courseId) {
  return state.attempts.filter(attempt => attempt.courseId === courseId);
}

function bestAttempt(courseId) {
  return getAttempts(courseId).reduce(
    (best, attempt) => (!best || attempt.percent > best.percent ? attempt : best),
    null
  );
}

function hasPassed(courseId) {
  const best = bestAttempt(courseId);
  return Boolean(best && best.percent >= PASS_PERCENT);
}

function isCourseCompleted(course) {
  return courseProgress(course).percent === 100 && hasPassed(course.id);
}

function isEnrolled(courseId) {
  return state.enrolled.includes(courseId);
}

function toGrade(score, total) {
  return ((score / total) * 5).toFixed(1);
}

function formatDate(iso, withTime = false) {
  const date = new Date(iso);
  const options = withTime
    ? { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }
    : { day: "numeric", month: "long", year: "numeric" };
  return date.toLocaleDateString("es-CO", options);
}

function formatTime(seconds) {
  const m = String(Math.floor(seconds / 60)).padStart(2, "0");
  const s = String(seconds % 60).padStart(2, "0");
  return `${m}:${s}`;
}

function initials(name) {
  return name.split(" ").slice(0, 2).map(part => part[0]).join("").toUpperCase();
}

function progressBar(percent) {
  return `<div class="progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${percent}">
    <span style="width:${percent}%"></span>
  </div>`;
}

function toast(message, type = "info") {
  const box = document.createElement("div");
  box.className = `toast ${type}`;
  box.textContent = message;
  $("#toasts").appendChild(box);
  setTimeout(() => box.classList.add("hide"), 3200);
  setTimeout(() => box.remove(), 3600);
}

function overallProgress() {
  const courses = state.enrolled.map(getCourse).filter(Boolean);
  const totals = courses.reduce(
    (acc, course) => {
      const p = courseProgress(course);
      return { done: acc.done + p.done, total: acc.total + p.total };
    },
    { done: 0, total: 0 }
  );
  return totals.total ? Math.round((totals.done / totals.total) * 100) : 0;
}

/* ---------- 5. CERTIFICADOS ---------- */
function issueCertificateIfEligible(course) {
  if (state.certificates[course.id] || !isCourseCompleted(course)) return false;
  const best = bestAttempt(course.id);
  state.certificates[course.id] = {
    date: new Date().toISOString(),
    percent: best.percent,
    grade: best.grade,
    code: `LMS-${course.id.toUpperCase()}-${Date.now().toString(36).toUpperCase()}`
  };
  saveState();
  toast(`🎓 ¡Certificado generado para "${course.title}"!`, "success");
  return true;
}

/* ---------- 6. NAVEGACIÓN ---------- */
function navigate(view) {
  if (ui.quiz && ui.quiz.status === "active" && view !== "quiz") {
    const leave = confirm("Tienes una evaluación en curso. Si sales se cancelará el intento. ¿Deseas salir?");
    if (!leave) return;
    cancelQuiz();
  }
  if (view === "quiz" && ui.quiz && ui.quiz.status === "result") ui.quiz = null;
  ui.view = view;
  $$(".view").forEach(section => { section.hidden = section.id !== `view-${view}`; });
  $$(".nav-btn").forEach(btn => btn.classList.toggle("active", btn.dataset.view === view));
  $("#pageTitle").textContent = VIEW_TITLES[view];
  closeSidebar();
  renderView(view);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderView(view) {
  const renderers = {
    dashboard: renderDashboard,
    catalog: renderCatalog,
    learn: renderLearn,
    quiz: renderQuiz,
    history: renderHistory,
    certificates: renderCertificates
  };
  renderers[view]();
  renderChrome();
}

function openSidebar() {
  $("#sidebar").classList.add("open");
  $("#overlay").classList.add("show");
}

function closeSidebar() {
  $("#sidebar").classList.remove("open");
  $("#overlay").classList.remove("show");
}

function renderChrome() {
  const percent = overallProgress();
  $("#studentCard").innerHTML = `
    <div class="student-row">
      <span class="avatar" aria-hidden="true">${esc(initials(STUDENT.name))}</span>
      <div class="student-info">
        <strong>${esc(STUDENT.name)}</strong>
        <small>${esc(STUDENT.program)}</small>
      </div>
    </div>
    ${progressBar(percent)}
    <div class="mini-label">Progreso general: ${percent}%</div>`;
  $("#topProgress").textContent = `Progreso general: ${percent}%`;
}

/* ---------- 7. PANEL DEL ESTUDIANTE ---------- */
function buildPendingActivities() {
  const items = [];
  state.enrolled.map(getCourse).filter(Boolean).forEach(course => {
    const lessons = getLessons(course);
    const next = lessons.find(lesson => !isLessonDone(course.id, lesson.id));
    if (next) {
      items.push({
        text: `Completar la lección: ${next.title}`,
        detail: course.title,
        action: "open-lesson",
        courseId: course.id,
        lessonId: next.id,
        label: "Continuar"
      });
    }
    if (!hasPassed(course.id)) {
      items.push({
        text: `Aprobar la evaluación de ${course.title}`,
        detail: `Mínimo ${PASS_PERCENT}% (3.5 / 5.0)`,
        action: "start-quiz",
        courseId: course.id,
        label: "Evaluar"
      });
    }
  });
  return items;
}

function renderDashboard() {
  const enrolledCourses = state.enrolled.map(getCourse).filter(Boolean);
  const completedCourses = enrolledCourses.filter(isCourseCompleted);
  const percent = overallProgress();
  const pending = buildPendingActivities();
  const allLessons = enrolledCourses.reduce((sum, c) => sum + courseProgress(c).total, 0);
  const doneLessons = enrolledCourses.reduce((sum, c) => sum + courseProgress(c).done, 0);
  const attempts = state.attempts;
  const average = attempts.length
    ? (attempts.reduce((sum, a) => sum + Number(a.grade), 0) / attempts.length).toFixed(1)
    : "—";
  const minutesLeft = enrolledCourses.reduce((sum, course) => {
    return sum + getLessons(course)
      .filter(lesson => !isLessonDone(course.id, lesson.id))
      .reduce((m, lesson) => m + lesson.minutes, 0);
  }, 0);

  const courseLines = enrolledCourses.length
    ? enrolledCourses.map(course => {
        const p = courseProgress(course);
        return `
        <div class="course-line">
          <div class="course-line-head">
            <strong>${esc(course.icon)} ${esc(course.title)}</strong>
            <button type="button" class="btn btn-secondary" data-action="open-course" data-course="${course.id}">
              ${p.percent === 0 ? "Comenzar" : "Continuar"}
            </button>
          </div>
          <div class="progress-row">${progressBar(p.percent)}<strong>${p.percent}%</strong></div>
          <small class="muted">${p.done} de ${p.total} lecciones completadas</small>
        </div>`;
      }).join("")
    : `<div class="empty"><h3>Aún no tienes cursos inscritos</h3>
        <p>Explora el catálogo e ingresa a tu primer curso.</p>
        <button type="button" class="btn btn-primary" data-action="nav" data-view="catalog">Ver catálogo</button></div>`;

  const todoItems = pending.length
    ? pending.slice(0, 6).map(item => `
        <li>
          <span class="todo-text">${esc(item.text)}<small>${esc(item.detail)}</small></span>
          <button type="button" class="btn btn-outline" data-action="${item.action}"
            data-course="${item.courseId}" ${item.lessonId ? `data-lesson="${item.lessonId}"` : ""}>${item.label}</button>
        </li>`).join("")
    : `<li><span class="todo-text">🎉 ¡No tienes actividades pendientes!<small>Has completado todo tu plan actual.</small></span></li>`;

  $("#view-dashboard").innerHTML = `
    <div class="hero">
      <div>
        <h2>¡Hola, ${esc(STUDENT.name.split(" ")[0])}! 👋</h2>
        <p>Continúa con tu ruta de aprendizaje. Hoy tienes ${pending.length} actividad${pending.length === 1 ? "" : "es"} pendiente${pending.length === 1 ? "" : "s"} y aproximadamente ${minutesLeft} minutos de contenido por revisar.</p>
        <button type="button" class="btn btn-primary" data-action="nav" data-view="learn">Ir a mis lecciones</button>
      </div>
      <div class="ring" style="--p:${percent}">
        <div class="ring-inner"><div><strong>${percent}%</strong><br><small>progreso</small></div></div>
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat"><span class="stat-icon" aria-hidden="true">📘</span><div><strong>${enrolledCourses.length}</strong><span class="label">Cursos inscritos</span></div></div>
      <div class="stat"><span class="stat-icon" aria-hidden="true">✅</span><div><strong>${completedCourses.length}</strong><span class="label">Cursos completados</span></div></div>
      <div class="stat"><span class="stat-icon" aria-hidden="true">📈</span><div><strong>${percent}%</strong><span class="label">Progreso general</span></div></div>
      <div class="stat"><span class="stat-icon" aria-hidden="true">⏳</span><div><strong>${pending.length}</strong><span class="label">Actividades pendientes</span></div></div>
    </div>

    <div class="dash-grid">
      <div class="stack">
        <article class="card">
          <h3>Mis cursos</h3>
          ${courseLines}
        </article>
        <article class="card">
          <h3>Actividades pendientes</h3>
          <ul class="todo-list">${todoItems}</ul>
        </article>
      </div>
      <aside class="card">
        <h3>Resumen académico</h3>
        <ul class="summary-list">
          <li><span>Estudiante</span><strong>${esc(STUDENT.name)}</strong></li>
          <li><span>Código</span><strong>${esc(STUDENT.code)}</strong></li>
          <li><span>Lecciones completadas</span><strong>${doneLessons} / ${allLessons}</strong></li>
          <li><span>Evaluaciones realizadas</span><strong>${attempts.length}</strong></li>
          <li><span>Evaluaciones aprobadas</span><strong>${attempts.filter(a => a.passed).length}</strong></li>
          <li><span>Promedio de notas</span><strong>${average}${average === "—" ? "" : " / 5.0"}</strong></li>
          <li><span>Certificados obtenidos</span><strong>${Object.keys(state.certificates).length}</strong></li>
        </ul>
      </aside>
    </div>`;
}

/* ---------- 8. CATÁLOGO DE CURSOS ---------- */
function filteredCourses() {
  const text = ui.filter.text.trim().toLowerCase();
  return COURSES.filter(course => {
    const matchText = !text ||
      course.title.toLowerCase().includes(text) ||
      course.description.toLowerCase().includes(text) ||
      course.instructor.toLowerCase().includes(text);
    const matchLevel = ui.filter.level === "all" || course.level === ui.filter.level;
    return matchText && matchLevel;
  });
}

function renderCatalog() {
  $("#view-catalog").innerHTML = `
    <div class="section-head">
      <div>
        <h2>Explora nuestros cursos</h2>
        <p>Inscríbete e inicia tu ruta de aprendizaje. Todos incluyen lecciones, evaluación y certificado.</p>
      </div>
    </div>
    <div class="toolbar">
      <input type="search" id="searchInput" placeholder="Buscar por nombre, descripción o instructor..."
        value="${esc(ui.filter.text)}" aria-label="Buscar cursos">
      <select id="levelFilter" aria-label="Filtrar por nivel">
        ${["all", "Básico", "Intermedio", "Avanzado"].map(level =>
          `<option value="${level}" ${ui.filter.level === level ? "selected" : ""}>${level === "all" ? "Todos los niveles" : level}</option>`
        ).join("")}
      </select>
    </div>
    <div class="course-grid" id="courseGrid"></div>`;
  renderCatalogGrid();
}

function renderCatalogGrid() {
  const list = filteredCourses();
  $("#courseGrid").innerHTML = list.length
    ? list.map(course => {
        const p = courseProgress(course);
        const enrolled = isEnrolled(course.id);
        const status = isCourseCompleted(course) ? "Completado" : enrolled ? "Inscrito" : "";
        return `
        <article class="course-card">
          <div class="cover" style="background:${course.cover}">
            ${status ? `<span class="badge badge-status badge-success">${status}</span>` : ""}
            <span class="badge">${esc(course.level)}</span>
            <span class="cover-icon" aria-hidden="true">${esc(course.icon)}</span>
          </div>
          <div class="course-body">
            <h3>${esc(course.title)}</h3>
            <p>${esc(course.description)}</p>
            <div class="course-meta">
              <span>👩‍🏫 ${esc(course.instructor)}</span>
              <span>📖 ${p.total} lecciones</span>
              <span>🧩 ${course.units.length} unidades</span>
            </div>
            ${enrolled ? `<div class="progress-row">${progressBar(p.percent)}<strong>${p.percent}%</strong></div>` : ""}
            <div class="course-actions">
              <button type="button" class="btn btn-primary btn-block" data-action="open-course" data-course="${course.id}">
                ${enrolled ? "Continuar curso" : "Ingresar al curso"}
              </button>
            </div>
          </div>
        </article>`;
      }).join("")
    : `<div class="empty" style="grid-column:1/-1"><h3>Sin resultados</h3><p>No encontramos cursos con esos criterios.</p></div>`;
}

function openCourse(courseId) {
  const course = getCourse(courseId);
  if (!course) return;
  if (!isEnrolled(courseId)) {
    state.enrolled.push(courseId);
    saveState();
    toast(`Te inscribiste en "${course.title}".`, "success");
  }
  ui.courseId = courseId;
  const remembered = state.lastLesson[courseId];
  const firstPending = getLessons(course).find(l => !isLessonDone(courseId, l.id));
  ui.lessonId = remembered && getLesson(course, remembered)
    ? remembered
    : (firstPending || getLessons(course)[0]).id;
  navigate("learn");
}

/* ---------- 9. MÓDULO DE APRENDIZAJE ---------- */
function renderLearn() {
  const root = $("#view-learn");
  const course = getCourse(ui.courseId);

  if (!course) {
    root.innerHTML = `
      <div class="card empty">
        <h3>Selecciona un curso para comenzar</h3>
        <p>Elige uno de tus cursos inscritos o explora el catálogo.</p>
        <div class="btn-row" style="justify-content:center">
          ${state.enrolled.map(getCourse).filter(Boolean).map(c =>
            `<button type="button" class="btn btn-secondary" data-action="open-course" data-course="${c.id}">${esc(c.icon)} ${esc(c.title)}</button>`
          ).join("")}
          <button type="button" class="btn btn-primary" data-action="nav" data-view="catalog">Ver catálogo</button>
        </div>
      </div>`;
    return;
  }

  const lessons = getLessons(course);
  const index = lessons.findIndex(l => l.id === ui.lessonId);
  const lesson = lessons[index] || lessons[0];
  const prev = lessons[index - 1];
  const next = lessons[index + 1];
  const p = courseProgress(course);
  const done = isLessonDone(course.id, lesson.id);

  state.lastLesson[course.id] = lesson.id;
  saveState();

  const outline = course.units.map(unit => `
    <div class="unit">
      <h4>${esc(unit.title)}</h4>
      ${unit.lessons.map(l => `
        <button type="button" class="lesson-link ${l.id === lesson.id ? "active" : ""} ${isLessonDone(course.id, l.id) ? "done" : ""}"
          data-action="open-lesson" data-course="${course.id}" data-lesson="${l.id}">
          <span class="check" aria-hidden="true">${isLessonDone(course.id, l.id) ? "✓" : ""}</span>
          <span>${esc(l.title)}</span>
        </button>`).join("")}
    </div>`).join("");

  root.innerHTML = `
    <div class="learn-header">
      <h2>${esc(course.icon)} ${esc(course.title)}</h2>
      <div class="progress-row">${progressBar(p.percent)}<strong>${p.percent}%</strong></div>
      <small class="muted">${p.done} de ${p.total} lecciones completadas · Instructor: ${esc(course.instructor)}</small>
    </div>

    <div class="learn-layout">
      <aside class="card outline" aria-label="Contenido del curso">
        <h3>Contenido del curso</h3>
        ${outline}
        <button type="button" class="btn btn-secondary btn-block" data-action="start-quiz" data-course="${course.id}">
          📝 Ir a la evaluación
        </button>
      </aside>

      <article class="card lesson-card">
        <div class="lesson-meta">
          <span class="badge">${esc(lesson.unitTitle)}</span>
          <span class="badge badge-sky">Lección ${index + 1} de ${lessons.length}</span>
          <span class="badge badge-sky">⏱ ${lesson.minutes} min</span>
          ${done ? '<span class="badge badge-success">Completada</span>' : ""}
        </div>
        <h3>${esc(lesson.title)}</h3>
        <div class="lesson-body">
          ${lesson.content.map(par => `<p>${fmt(par)}</p>`).join("")}
          <ul>${lesson.points.map(point => `<li>${fmt(point)}</li>`).join("")}</ul>
          ${lesson.code ? `<pre class="code"><code>${esc(lesson.code)}</code></pre>` : ""}
        </div>
        <div class="lesson-nav">
          <button type="button" class="btn btn-outline" data-action="prev-lesson" ${prev ? "" : "disabled"}>← Anterior</button>
          <div class="center">
            <button type="button" class="btn ${done ? "btn-outline" : "btn-success"}" data-action="toggle-complete">
              ${done ? "Desmarcar como completada" : "✓ Marcar como completada"}
            </button>
          </div>
          ${next
            ? `<button type="button" class="btn btn-primary" data-action="next-lesson">Siguiente →</button>`
            : `<button type="button" class="btn btn-primary" data-action="start-quiz" data-course="${course.id}">Ir a la evaluación →</button>`}
        </div>
      </article>
    </div>`;
}

function goToLesson(offset) {
  const course = getCourse(ui.courseId);
  const lessons = getLessons(course);
  const index = lessons.findIndex(l => l.id === ui.lessonId);
  const target = lessons[index + offset];
  if (!target) return;
  ui.lessonId = target.id;
  renderLearn();
  $("#view-learn").scrollIntoView({ behavior: "smooth", block: "start" });
}

function toggleLessonComplete() {
  const course = getCourse(ui.courseId);
  if (!course || !ui.lessonId) return;
  const list = getCompleted(course.id);
  if (list.includes(ui.lessonId)) {
    state.completed[course.id] = list.filter(id => id !== ui.lessonId);
    toast("Lección desmarcada.", "warn");
  } else {
    state.completed[course.id] = [...list, ui.lessonId];
    toast("¡Lección completada! Tu progreso fue guardado.", "success");
  }
  saveState();
  issueCertificateIfEligible(course);
  renderLearn();
  renderChrome();
}

/* ---------- 10. EVALUACIONES ---------- */
function renderQuiz() {
  const root = $("#view-quiz");
  if (!ui.quiz) return renderQuizHome(root);
  if (ui.quiz.status === "active") return renderQuizActive(root);
  return renderQuizResult(root);
}

function renderQuizHome(root) {
  root.innerHTML = `
    <div class="section-head">
      <div>
        <h2>Evaluaciones disponibles</h2>
        <p>Cada evaluación tiene ${COURSES[0].quiz.length} preguntas de selección múltiple y un tiempo máximo de ${QUIZ_SECONDS / 60} minutos. Se aprueba con ${PASS_PERCENT}% o más.</p>
      </div>
    </div>
    <div class="quiz-list">
      ${COURSES.map(course => {
        const best = bestAttempt(course.id);
        const p = courseProgress(course);
        return `
        <article class="card quiz-card">
          <span class="badge">${esc(course.level)}</span>
          <h3>${esc(course.icon)} ${esc(course.title)}</h3>
          <p class="muted small">${course.quiz.length} preguntas · ${getAttempts(course.id).length} intento(s) · Lecciones: ${p.done}/${p.total}</p>
          ${best
            ? `<p>Mejor nota: <strong>${best.grade} / 5.0</strong> ${best.percent >= PASS_PERCENT ? '<span class="badge badge-success">Aprobada</span>' : '<span class="badge badge-danger">No aprobada</span>'}</p>`
            : `<p class="muted">Aún no has presentado esta evaluación.</p>`}
          <div class="course-actions">
            <button type="button" class="btn btn-primary btn-block" data-action="begin-quiz" data-course="${course.id}">
              ${best ? "Intentar de nuevo" : "Iniciar evaluación"}
            </button>
          </div>
        </article>`;
      }).join("")}
    </div>`;
}

function startQuiz(courseId) {
  const course = getCourse(courseId);
  if (!course) return;
  if (ui.quiz && ui.quiz.status === "active") stopTimer();
  if (!isEnrolled(courseId)) {
    state.enrolled.push(courseId);
    saveState();
  }
  ui.quiz = { courseId, status: "active", remaining: QUIZ_SECONDS, attempt: null, details: [] };
  if (ui.view !== "quiz") {
    ui.view = "quiz";
    $$(".view").forEach(section => { section.hidden = section.id !== "view-quiz"; });
    $$(".nav-btn").forEach(btn => btn.classList.toggle("active", btn.dataset.view === "quiz"));
    $("#pageTitle").textContent = VIEW_TITLES.quiz;
    closeSidebar();
  }
  renderQuiz();
  renderChrome();
  startTimer();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderQuizActive(root) {
  const course = getCourse(ui.quiz.courseId);
  root.innerHTML = `
    <div class="quiz-top">
      <div>
        <h2>Evaluación: ${esc(course.title)}</h2>
        <p class="muted">Responde las ${course.quiz.length} preguntas. Debes contestar todas antes de enviar.</p>
      </div>
      <div class="timer" id="quizTimer" role="timer" aria-live="off">${formatTime(ui.quiz.remaining)}</div>
    </div>
    <form id="quizForm" novalidate>
      ${course.quiz.map((item, i) => `
        <fieldset class="question" id="question-${i}">
          <legend>Pregunta ${i + 1} de ${course.quiz.length}</legend>
          <p><strong>${esc(item.q)}</strong></p>
          ${item.options.map((option, j) => `
            <label class="option">
              <input type="radio" name="q${i}" value="${j}">
              <span>${String.fromCharCode(65 + j)}. ${esc(option)}</span>
            </label>`).join("")}
        </fieldset>`).join("")}
      <div class="btn-row">
        <button type="submit" class="btn btn-primary">Enviar evaluación</button>
        <button type="button" class="btn btn-outline" data-action="cancel-quiz">Cancelar</button>
      </div>
    </form>`;
}

function startTimer() {
  stopTimer();
  ui.timerId = setInterval(() => {
    if (!ui.quiz || ui.quiz.status !== "active") return stopTimer();
    ui.quiz.remaining -= 1;
    const label = $("#quizTimer");
    if (label) {
      label.textContent = formatTime(Math.max(ui.quiz.remaining, 0));
      label.classList.toggle("low", ui.quiz.remaining <= 60);
    }
    if (ui.quiz.remaining <= 0) {
      toast("⏰ Se agotó el tiempo. La evaluación se envió automáticamente.", "warn");
      submitQuiz(true);
    }
  }, 1000);
}

function stopTimer() {
  if (ui.timerId) {
    clearInterval(ui.timerId);
    ui.timerId = null;
  }
}

function cancelQuiz() {
  stopTimer();
  ui.quiz = null;
}

function submitQuiz(forced = false) {
  const course = getCourse(ui.quiz.courseId);
  const form = $("#quizForm");
  const data = new FormData(form);

  /* Validación: todas las preguntas deben estar respondidas */
  const unanswered = course.quiz
    .map((_, i) => i)
    .filter(i => data.get(`q${i}`) === null);

  $$("fieldset.question").forEach(box => box.classList.remove("unanswered"));
  if (unanswered.length && !forced) {
    unanswered.forEach(i => $(`#question-${i}`).classList.add("unanswered"));
    $(`#question-${unanswered[0]}`).scrollIntoView({ behavior: "smooth", block: "center" });
    toast(`Faltan ${unanswered.length} pregunta(s) por responder.`, "error");
    return;
  }

  stopTimer();

  const details = course.quiz.map((item, i) => {
    const raw = data.get(`q${i}`);
    const chosen = raw === null ? null : Number(raw);
    return { question: item.q, options: item.options, chosen, answer: item.answer, correct: chosen === item.answer, feedback: item.feedback };
  });

  const score = details.filter(d => d.correct).length;
  const total = details.length;
  const percent = Math.round((score / total) * 100);
  const attempt = {
    id: Date.now(),
    courseId: course.id,
    score,
    total,
    percent,
    grade: toGrade(score, total),
    passed: percent >= PASS_PERCENT,
    date: new Date().toISOString(),
    seconds: QUIZ_SECONDS - Math.max(ui.quiz.remaining, 0)
  };

  state.attempts.push(attempt);
  saveState();
  issueCertificateIfEligible(course);

  ui.quiz = { courseId: course.id, status: "result", remaining: 0, attempt, details };
  renderQuiz();
  renderChrome();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderQuizResult(root) {
  const { attempt, details, courseId } = ui.quiz;
  const course = getCourse(courseId);
  const progress = courseProgress(course);
  const hasCert = Boolean(state.certificates[course.id]);

  let certMessage = "";
  if (hasCert) {
    certMessage = "🎓 Ya cuentas con el certificado de este curso.";
  } else if (attempt.passed && progress.percent < 100) {
    certMessage = `Aprobaste la evaluación. Completa las ${progress.total - progress.done} lección(es) restante(s) para obtener tu certificado.`;
  } else if (!attempt.passed) {
    certMessage = `Necesitas al menos ${PASS_PERCENT}% para aprobar. ¡Repasa las lecciones e inténtalo de nuevo!`;
  }

  root.innerHTML = `
    <div class="result-hero ${attempt.passed ? "pass" : "fail"}">
      <h2>${attempt.passed ? "¡Evaluación aprobada! 🎉" : "Evaluación no aprobada"}</h2>
      <div class="result-score">${attempt.grade} / 5.0</div>
      <p>${attempt.score} de ${attempt.total} respuestas correctas (${attempt.percent}%) · Tiempo: ${formatTime(attempt.seconds)}</p>
      <p>${esc(certMessage)}</p>
    </div>

    <h3>Retroalimentación</h3>
    ${details.map((d, i) => `
      <div class="feedback ${d.correct ? "ok" : "bad"}">
        <h4>${d.correct ? "✅" : "❌"} Pregunta ${i + 1}: ${esc(d.question)}</h4>
        <p><strong>Tu respuesta:</strong> ${d.chosen === null ? "Sin responder" : esc(d.options[d.chosen])}</p>
        ${d.correct ? "" : `<p><strong>Respuesta correcta:</strong> ${esc(d.options[d.answer])}</p>`}
        <p class="muted">${esc(d.feedback)}</p>
      </div>`).join("")}

    <div class="btn-row">
      <button type="button" class="btn btn-primary" data-action="begin-quiz" data-course="${course.id}">Intentar de nuevo</button>
      <button type="button" class="btn btn-outline" data-action="open-course" data-course="${course.id}">Repasar lecciones</button>
      <button type="button" class="btn btn-outline" data-action="nav" data-view="history">Ver historial</button>
      ${hasCert ? `<button type="button" class="btn btn-success" data-action="view-cert" data-course="${course.id}">Ver certificado</button>` : ""}
    </div>`;
}

/* ---------- 11. HISTORIAL ---------- */
function renderHistory() {
  const rows = [...state.attempts].reverse();
  $("#view-history").innerHTML = `
    <div class="section-head">
      <div>
        <h2>Historial de evaluaciones</h2>
        <p>Registro de todos tus intentos, ordenados del más reciente al más antiguo.</p>
      </div>
    </div>
    <article class="card">
      ${rows.length ? `
      <div class="table-wrap">
        <table class="data">
          <thead>
            <tr><th>#</th><th>Curso</th><th>Fecha</th><th>Aciertos</th><th>Porcentaje</th><th>Nota</th><th>Resultado</th></tr>
          </thead>
          <tbody>
            ${rows.map((a, i) => {
              const course = getCourse(a.courseId);
              return `<tr>
                <td>${rows.length - i}</td>
                <td>${esc(course ? course.title : a.courseId)}</td>
                <td>${formatDate(a.date, true)}</td>
                <td>${a.score} / ${a.total}</td>
                <td>${a.percent}%</td>
                <td><strong>${a.grade}</strong> / 5.0</td>
                <td>${a.passed ? '<span class="badge badge-success">Aprobada</span>' : '<span class="badge badge-danger">No aprobada</span>'}</td>
              </tr>`;
            }).join("")}
          </tbody>
        </table>
      </div>` : `
      <div class="empty">
        <h3>Todavía no hay evaluaciones</h3>
        <p>Cuando presentes una evaluación aparecerá aquí.</p>
        <button type="button" class="btn btn-primary" data-action="nav" data-view="quiz">Ir a evaluaciones</button>
      </div>`}
    </article>`;
}

/* ---------- 12. CERTIFICADOS ---------- */
function renderCertificates() {
  const root = $("#view-certificates");
  const cards = COURSES.map(course => {
    const cert = state.certificates[course.id];
    const p = courseProgress(course);
    const lessonsOk = p.percent === 100;
    const quizOk = hasPassed(course.id);
    return `
    <article class="card cert-status">
      <span class="badge ${cert ? "badge-success" : "badge-warning"}">${cert ? "Disponible" : "En progreso"}</span>
      <h3>${esc(course.icon)} ${esc(course.title)}</h3>
      <ul class="req-list">
        <li class="${lessonsOk ? "ok" : ""}">${lessonsOk ? "✓" : "○"} Completar todas las lecciones (${p.done}/${p.total})</li>
        <li class="${quizOk ? "ok" : ""}">${quizOk ? "✓" : "○"} Aprobar la evaluación (≥ ${PASS_PERCENT}%)</li>
      </ul>
      ${cert
        ? `<button type="button" class="btn btn-primary" data-action="view-cert" data-course="${course.id}">Ver certificado</button>`
        : `<button type="button" class="btn btn-outline" disabled>Certificado bloqueado</button>`}
    </article>`;
  }).join("");

  root.innerHTML = `
    <div class="section-head">
      <div>
        <h2>Mis certificados</h2>
        <p>Completa las lecciones y aprueba la evaluación de cada curso para desbloquear tu certificado.</p>
      </div>
    </div>
    <div class="quiz-list">${cards}</div>
    <div class="certificate-wrap" id="certificateArea">${ui.certId ? certificateMarkup(ui.certId) : ""}</div>`;
}

function certificateMarkup(courseId) {
  const course = getCourse(courseId);
  const cert = state.certificates[courseId];
  if (!course || !cert) return "";
  return `
    <div class="btn-row" style="margin:0 0 1rem">
      <button type="button" class="btn btn-primary" data-action="print-cert">🖨️ Imprimir / Guardar como PDF</button>
      <span class="muted small" style="align-self:center">En el cuadro de impresión elige «Guardar como PDF».</span>
    </div>
    <div class="certificate" id="certificate">
      <div class="cert-border">
        <p class="cert-org">Universidad de Caldas</p>
        <h2>Certificado de Finalización</h2>
        <p>Se certifica que</p>
        <p class="cert-name">${esc(STUDENT.name)}</p>
        <p>ha completado satisfactoriamente el curso</p>
        <p class="cert-course">${esc(course.title)}</p>
        <p>obteniendo una calificación de <strong>${esc(cert.grade)} / 5.0</strong> (${cert.percent}%)</p>
        <div class="cert-footer">
          <div>Fecha de finalización<br><strong>${formatDate(cert.date)}</strong></div>
          <div>Instructor<br><strong>${esc(course.instructor)}</strong></div>
          <div>Programación Web Creativa II<br><strong>Taller 19 · LMS</strong></div>
        </div>
        <p class="cert-code">Código de verificación: ${esc(cert.code)}</p>
        <p class="cert-sim">Documento simulado con fines académicos.</p>
      </div>
    </div>`;
}

function showCertificate(courseId) {
  ui.certId = courseId;
  if (ui.view !== "certificates") {
    navigate("certificates");
  } else {
    renderCertificates();
  }
  setTimeout(() => {
    const area = $("#certificateArea");
    if (area) area.scrollIntoView({ behavior: "smooth", block: "start" });
  }, 150);
}

/* ---------- 13. REINICIO DE DATOS ---------- */
function resetData() {
  if (!confirm("Se borrarán tu progreso, evaluaciones y certificados de demostración. ¿Deseas continuar?")) return;
  stopTimer();
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn("No se pudo limpiar LocalStorage.", error);
  }
  state = createDefaultState();
  ui.courseId = null;
  ui.lessonId = null;
  ui.quiz = null;
  ui.certId = null;
  toast("Datos reiniciados correctamente.", "success");
  ui.view = "dashboard";
  navigate("dashboard");
}

/* ---------- 14. EVENTOS ---------- */
document.addEventListener("click", event => {
  const target = event.target.closest("[data-action]");
  if (!target) return;
  const { action, view, course, lesson } = target.dataset;

  switch (action) {
    case "nav": navigate(view); break;
    case "toggle-sidebar": $("#sidebar").classList.contains("open") ? closeSidebar() : openSidebar(); break;
    case "close-sidebar": closeSidebar(); break;
    case "open-course": openCourse(course); break;
    case "open-lesson":
      ui.courseId = course;
      ui.lessonId = lesson;
      if (ui.view !== "learn") navigate("learn"); else renderLearn();
      break;
    case "prev-lesson": goToLesson(-1); break;
    case "next-lesson": goToLesson(1); break;
    case "toggle-complete": toggleLessonComplete(); break;
    case "begin-quiz":
    case "start-quiz": startQuiz(course); break;
    case "cancel-quiz":
      if (confirm("¿Cancelar la evaluación? Se perderán tus respuestas.")) {
        cancelQuiz();
        renderQuiz();
      }
      break;
    case "view-cert": showCertificate(course); break;
    case "print-cert": window.print(); break;
    case "reset": resetData(); break;
    default: break;
  }
});

document.addEventListener("submit", event => {
  if (event.target.id === "quizForm") {
    event.preventDefault();
    submitQuiz(false);
  }
});

document.addEventListener("input", event => {
  if (event.target.id === "searchInput") {
    ui.filter.text = event.target.value;
    renderCatalogGrid();
  }
});

document.addEventListener("change", event => {
  if (event.target.id === "levelFilter") {
    ui.filter.level = event.target.value;
    renderCatalogGrid();
  }
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape") closeSidebar();
});

/* ---------- 15. INICIO ---------- */
document.addEventListener("DOMContentLoaded", () => {
  renderView("dashboard");
});