const OPCIONES = {
  piedra: { icono: "\u270A", nombre: "Piedra", vence: "tijera" },
  papel: { icono: "\u270B", nombre: "Papel", vence: "piedra" },
  tijera: { icono: "\u270C\uFE0F", nombre: "Tijera", vence: "papel" }
};

let puntosUsuario = 0;
let puntosPC = 0;
const botones = document.querySelectorAll(".opcion");
const puntosUsuarioEl = document.getElementById("puntos-usuario");
const puntosPCEl = document.getElementById("puntos-pc");
const eleccionUsuarioEl = document.getElementById("eleccion-usuario");
const eleccionPCEl = document.getElementById("eleccion-pc");
const mensajeEl = document.getElementById("mensaje");

function eleccionComputadora() {
  const claves = Object.keys(OPCIONES);
  return claves[Math.floor(Math.random() * claves.length)];
}

function obtenerResultado(usuario, pc) {
  if (usuario === pc) return "empata";
  return OPCIONES[usuario].vence === pc ? "gana" : "pierde";
}

function mostrarEleccion(elemento, clave) {
  elemento.textContent = OPCIONES[clave].icono + " " + OPCIONES[clave].nombre;
}

function jugar(usuario) {
  const pc = eleccionComputadora();
  const resultado = obtenerResultado(usuario, pc);

  mostrarEleccion(eleccionUsuarioEl, usuario);
  mostrarEleccion(eleccionPCEl, pc);
  if (resultado === "gana") {
    puntosUsuario++;
    mensajeEl.textContent = "¡Ganaste esta ronda!";
  } else if (resultado === "pierde") {
    puntosPC++;
    mensajeEl.textContent = "La computadora gana esta ronda.";
  } else {
    mensajeEl.textContent = "¡Empate!";
  }

  mensajeEl.className = "mensaje " + resultado;
  puntosUsuarioEl.textContent = puntosUsuario;
  puntosPCEl.textContent = puntosPC;
}

function reiniciarMarcador() {
  puntosUsuario = 0;
  puntosPC = 0;
  puntosUsuarioEl.textContent = 0;
  puntosPCEl.textContent = 0;
  eleccionUsuarioEl.textContent = "?";
  eleccionPCEl.textContent = "?";
  mensajeEl.textContent = "¡Haz tu jugada!";
  mensajeEl.className = "mensaje";
}

botones.forEach(function (boton) {
  boton.addEventListener("click", function () {
    jugar(boton.dataset.eleccion);
  });
});

document.getElementById("reiniciar").addEventListener("click", reiniciarMarcador);