/* Programación Web Creativa II · Taller: Lista de tareas
   Autores: Jhonnier Santiago Giraldo y Darién Alonso */

const form = document.getElementById("formTarea");
const input = document.getElementById("inputTarea");
const lista = document.getElementById("listaTareas");
const mensajeVacio = document.getElementById("mensajeVacio");
const CLAVE = "tareas"; // nombre con el que se guarda en localStorage

// Recupera las tareas guardadas; si no hay datos válidos, devuelve []
// Valida que sea un arreglo y descarta elementos que no sean tareas
function cargarTareas() {
  try {
    const datos = JSON.parse(localStorage.getItem(CLAVE));
    if (!Array.isArray(datos)) return [];
    return datos
      .filter((t) => t && typeof t.texto === "string")
      .map((t, i) => ({
        id: Number.isFinite(t.id) ? t.id : Date.now() + i,
        texto: t.texto,
        completada: Boolean(t.completada),
      }));
  } catch { return []; }
}
let tareas = cargarTareas();

// Genera un id que no se repita aunque se agreguen tareas en el mismo milisegundo
function nuevoId() {
  let id = Date.now();
  while (tareas.some((t) => t.id === id)) id++;
  return id;
}

// Guarda en localStorage y vuelve a dibujar la lista
function actualizar() {
  try { localStorage.setItem(CLAVE, JSON.stringify(tareas)); }
  catch { /* sin almacenamiento disponible: la lista sigue funcionando en memoria */ }
  mostrarTareas();
}

function mostrarTareas() {
  lista.innerHTML = "";
  mensajeVacio.hidden = tareas.length > 0; // visible solo si no hay tareas

  tareas.forEach((tarea) => {
    const item = document.createElement("li");
    item.className = tarea.completada ? "completada" : "";

    const casilla = document.createElement("input");
    casilla.type = "checkbox";
    casilla.checked = tarea.completada;
    casilla.setAttribute("aria-label", "Marcar como completada: " + tarea.texto);
    casilla.onchange = () => { tarea.completada = !tarea.completada; actualizar(); };

    const texto = document.createElement("span");
    texto.textContent = tarea.texto; // textContent evita insertar HTML

    const borrar = document.createElement("button");
    borrar.className = "eliminar";
    borrar.textContent = "Eliminar";
    borrar.setAttribute("aria-label", "Eliminar tarea: " + tarea.texto);
    borrar.onclick = () => {
      tareas = tareas.filter((t) => t.id !== tarea.id);
      actualizar();
    };

    item.append(casilla, texto, borrar);
    lista.appendChild(item);
  });
}

form.addEventListener("submit", (evento) => {
  evento.preventDefault();
  const texto = input.value.trim();
  if (texto === "") return;
  tareas.push({ id: nuevoId(), texto, completada: false });
  actualizar();
  form.reset();
  input.focus();
});

mostrarTareas(); // muestra las tareas al cargar la página
