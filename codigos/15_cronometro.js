// Elementos de la pantalla y de los botones
const minutos = document.getElementById("min");
const segundos = document.getElementById("seg");
const centesimas = document.getElementById("cen");
const btnIniciar = document.getElementById("btnIniciar");
const btnPausar = document.getElementById("btnPausar");
const btnContinuar = document.getElementById("btnContinuar");
const btnReiniciar = document.getElementById("btnReiniciar");
const botones = [btnIniciar, btnPausar, btnContinuar, btnReiniciar];
 
let intervalo = null; // null = no hay temporizador activo
let inicio = 0;       // instante en que arrancó el tramo actual
let acumulado = 0;    // milisegundos guardados antes de la pausa
 
const dosDigitos = (n) => String(n).padStart(2, "0");
 
function mostrarTiempo(ms) {
  const cent = Math.floor(ms / 10);
  minutos.textContent = dosDigitos(Math.floor(cent / 6000));
  segundos.textContent = dosDigitos(Math.floor(cent / 100) % 60);
  centesimas.textContent = dosDigitos(cent % 100);
}
 
// Habilita (true) o deshabilita (false) cada botón, en orden
function estadoBotones(...estados) {
  botones.forEach((boton, i) => (boton.disabled = !estados[i]));
}
 
function arrancar() { // sirve para Iniciar y para Continuar
  if (intervalo !== null) return; // evita temporizadores duplicados
  inicio = Date.now();
  intervalo = setInterval(() => {
    mostrarTiempo(acumulado + Date.now() - inicio);
  }, 10);
  estadoBotones(false, true, false, true);
}
 
function pausar() {
  if (intervalo === null) return;
  acumulado += Date.now() - inicio; // guarda el tiempo transcurrido
  clearInterval(intervalo);
  intervalo = null;
  estadoBotones(false, false, true, true);
}
 
function reiniciar() {
  clearInterval(intervalo);
  intervalo = null;
  acumulado = 0;
  mostrarTiempo(0);
  estadoBotones(true, false, false, false);
}
 
btnIniciar.addEventListener("click", arrancar);
btnPausar.addEventListener("click", pausar);
btnContinuar.addEventListener("click", arrancar);
btnReiniciar.addEventListener("click", reiniciar);