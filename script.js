const MIN = 1;
const MAX = 100;
let numeroSecreto, intentos, juegoTerminado;

const formulario = document.getElementById("formulario");
const entrada = document.getElementById("intento");
const botonProbar = document.getElementById("btn-probar");
const botonNueva = document.getElementById("btn-nueva");
const mensaje = document.getElementById("mensaje");
const contador = document.getElementById("contador");

function mostrarMensaje(texto, tipo) {
  mensaje.textContent = texto;
  mensaje.className = "mensaje " + tipo;
}

function nuevaPartida() {
  numeroSecreto = Math.floor(Math.random() * (MAX - MIN + 1)) + MIN;
  intentos = 0;
  juegoTerminado = false;
  contador.textContent = intentos;
  entrada.value = "";
  entrada.disabled = false;
  botonProbar.disabled = false;
  mostrarMensaje("¡Buena suerte!", "");
  entrada.focus();
}

function evaluarIntento(evento) {
  evento.preventDefault();
  if (juegoTerminado) return;
  const valor = Number(entrada.value);
  const valido = entrada.value.trim() !== "" && Number.isInteger(valor) &&
                 valor >= MIN && valor <= MAX;
  if (!valido) {
    mostrarMensaje("Escribe un número entero entre 1 y 100.", "error");
    return;
  }
  intentos++;
  contador.textContent = intentos;
  if (valor === numeroSecreto) {
    juegoTerminado = true;
    entrada.disabled = true;
    botonProbar.disabled = true;
    const palabra = intentos === 1 ? "intento" : "intentos";
    mostrarMensaje(`🎉 ¡Correcto! Era el ${numeroSecreto}. ` +
                   `Lo lograste en ${intentos} ${palabra}.`, "acierto");
    return;
  }
  if (valor < numeroSecreto) {
    mostrarMensaje(`El ${valor} es bajo. Prueba con un número mayor.`, "mayor");
  } else {
    mostrarMensaje(`El ${valor} es alto. Prueba con un número menor.`, "menor");
  }
  entrada.value = "";
  entrada.focus();
}

formulario.addEventListener("submit", evaluarIntento);
botonNueva.addEventListener("click", nuevaPartida);
nuevaPartida();
