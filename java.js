// ===== 1. Traemos los elementos del HTML =====
const lienzo = document.getElementById("tablero");
const pincel = lienzo.getContext("2d");
const textoPuntos = document.getElementById("puntos");
const textoRecord = document.getElementById("record");
const textoMensaje = document.getElementById("mensaje");
const botonReiniciar = document.getElementById("botonReiniciar");

// ===== 2. Variables del juego =====
const tamanoCelda = 20;                          // cada cuadrito mide 20 px
const totalCeldas = lienzo.width / tamanoCelda;  // 400 / 20 = 20 cuadritos

let culebra;         // lista con los cuadritos del cuerpo
let direccion;       // hacia donde se mueve ahora
let nuevaDireccion;  // hacia donde quiere ir el jugador
let comida;          // posicion de la comida
let puntos;
let record = 0;
let reloj;           // el temporizador del juego
let jugando;
let terminado;

// ===== 3. Preparar una partida nueva =====
function iniciarJuego() {
  clearInterval(reloj);
  culebra = [
    { x: 10, y: 10 },   // cabeza
    { x: 9, y: 10 },
    { x: 8, y: 10 }     // cola
  ];
  direccion = { x: 1, y: 0 };
  nuevaDireccion = { x: 1, y: 0 };
  puntos = 0;
  jugando = false;
  terminado = false;
  textoPuntos.textContent = puntos;
  textoMensaje.textContent = "Presiona una flecha para comenzar";
  crearComida();
  dibujar();
}

// ===== 4. Poner la comida en un lugar libre =====
function crearComida() {
  let libre = false;
  while (!libre) {
    comida = {
      x: Math.floor(Math.random() * totalCeldas),
      y: Math.floor(Math.random() * totalCeldas)
    };
    libre = true;
    for (let i = 0; i < culebra.length; i++) {
      if (culebra[i].x === comida.x && culebra[i].y === comida.y) {
        libre = false;
      }
    }
  }
}

// ===== 5. Mover la culebra (se repite cada 120 milisegundos) =====
function moverCulebra() {
  direccion = nuevaDireccion;
  const cabeza = {
    x: culebra[0].x + direccion.x,
    y: culebra[0].y + direccion.y
  };

  // Choco con una pared?
  if (cabeza.x < 0 || cabeza.x >= totalCeldas ||
      cabeza.y < 0 || cabeza.y >= totalCeldas) {
    terminarJuego();
    return;
  }

  // Choco con su propio cuerpo?
  for (let i = 0; i < culebra.length; i++) {
    if (culebra[i].x === cabeza.x && culebra[i].y === cabeza.y) {
      terminarJuego();
      return;
    }
  }

  culebra.unshift(cabeza);  // agrega la nueva cabeza al inicio

  if (cabeza.x === comida.x && cabeza.y === comida.y) {
    puntos++;                               // se comio la comida
    textoPuntos.textContent = puntos;
    crearComida();
  } else {
    culebra.pop();                          // quita la cola
  }

  dibujar();
}

// ===== 6. Dibujar todo en el tablero =====
function dibujarCuadro(celda, color) {
  pincel.fillStyle = color;
  pincel.fillRect(celda.x * tamanoCelda + 1, celda.y * tamanoCelda + 1,
                  tamanoCelda - 2, tamanoCelda - 2);
}

function dibujar() {
  pincel.fillStyle = "#111111";
  pincel.fillRect(0, 0, lienzo.width, lienzo.height);   // fondo

  dibujarCuadro(comida, "#e74c3c");                     // comida roja

  for (let i = 0; i < culebra.length; i++) {
    if (i === 0) {
      dibujarCuadro(culebra[i], "#a8e063");             // cabeza
    } else {
      dibujarCuadro(culebra[i], "#27ae60");             // cuerpo
    }
  }
}

// ===== 7. Fin del juego =====
function terminarJuego() {
  clearInterval(reloj);
  jugando = false;
  terminado = true;
  if (puntos > record) {
    record = puntos;
    textoRecord.textContent = record;
  }
  textoMensaje.textContent = "Fin del juego. Hiciste " + puntos +
                             " puntos. Presiona Reiniciar";
}

// ===== 8. Controlar la culebra con el teclado =====
function cambiarDireccion(x, y) {
  if (terminado) return;
  if (x === -direccion.x && y === -direccion.y) return;  // no se devuelve

  nuevaDireccion = { x: x, y: y };

  if (!jugando) {                    // primera flecha: arranca el juego
    jugando = true;
    textoMensaje.textContent = "Buena suerte!";
    reloj = setInterval(moverCulebra, 120);
  }
}

document.addEventListener("keydown", function (evento) {
  const tecla = evento.key;

  if (tecla === "ArrowUp" || tecla === "w" || tecla === "W") {
    cambiarDireccion(0, -1);
  } else if (tecla === "ArrowDown" || tecla === "s" || tecla === "S") {
    cambiarDireccion(0, 1);
  } else if (tecla === "ArrowLeft" || tecla === "a" || tecla === "A") {
    cambiarDireccion(-1, 0);
  } else if (tecla === "ArrowRight" || tecla === "d" || tecla === "D") {
    cambiarDireccion(1, 0);
  }

  if (tecla.indexOf("Arrow") === 0) {
    evento.preventDefault();         // evita que la pagina haga scroll
  }
});

// ===== 9. Boton de reiniciar y arranque =====
botonReiniciar.addEventListener("click", function () {
  iniciarJuego();
  botonReiniciar.blur();
});

iniciarJuego();