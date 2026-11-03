const operacionEl = document.getElementById("operacion");
const resultadoEl = document.getElementById("resultado");
const SIMBOLOS = { "+": "+", "-": "\u2212", "*": "\u00D7", "/": "\u00F7" };
let actual = "0";      // número que se está escribiendo
let anterior = "";     // primer operando
let operador = null;   // operación pendiente
let nuevoNumero = false;
let hayError = false;

function mostrar(texto) {
  resultadoEl.textContent = actual;
  resultadoEl.classList.toggle("error", hayError);
  operacionEl.textContent = texto;
}

function limpiar() {
  actual = "0"; anterior = ""; operador = null;
  nuevoNumero = hayError = false;
  mostrar("");
}

function agregarNumero(n) {
  if (hayError) limpiar();
  if (nuevoNumero) {
    if (!operador) operacionEl.textContent = "";
    actual = "0";
    nuevoNumero = false;
  }
  if ((n === "." && actual.includes(".")) || actual.length >= 12) return;
  actual = actual === "0" && n !== "." ? n : actual + n;
  resultadoEl.textContent = actual;
}

function resolver() {
  const a = parseFloat(anterior), b = parseFloat(actual);
  if (operador === "/" && b === 0) {
    actual = "Error: división entre cero";
    anterior = ""; operador = null; hayError = true;
    mostrar("");
    return false;
  }
  const calculo = { "+": a + b, "-": a - b, "*": a * b, "/": a / b };
  actual = String(parseFloat(calculo[operador].toPrecision(10)));
  return true;
}

function elegirOperador(op) {
  if (hayError) return;
  if (operador && !nuevoNumero && !resolver()) return;
  anterior = actual; operador = op; nuevoNumero = true;
  mostrar(anterior + " " + SIMBOLOS[op]);
}

function igual() {
  if (hayError || !operador || nuevoNumero) return;
  const expresion = anterior + " " + SIMBOLOS[operador] + " " + actual + " =";
  if (!resolver()) return;
  operador = null;
  nuevoNumero = true;
  mostrar(expresion);
}

document.querySelector(".teclado").addEventListener("click", function (e) {
  const boton = e.target.closest("button");
  if (!boton) return;
  const { numero, operador: op, accion } = boton.dataset;
  if (numero) agregarNumero(numero);
  else if (op) elegirOperador(op);
  else if (accion === "igual") igual();
  else limpiar();
});