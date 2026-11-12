"use strict";

/* ===================================================================
   NEON TURBO - Videojuego de carreras de carros (Canvas API)
   Universidad de Caldas - Programación Web Creativa II
   =================================================================== */

/* ---------- 1. CONSTANTES DE CONFIGURACIÓN ---------- */
const ANCHO_CANVAS = 480;
const ALTO_CANVAS = 720;
const CANTIDAD_CARRILES = 4;
const MARGEN_CARRETERA = 40;
const ANCHO_CARRETERA = ANCHO_CANVAS - MARGEN_CARRETERA * 2;
const ANCHO_CARRIL = ANCHO_CARRETERA / CANTIDAD_CARRILES;

const ANCHO_CARRO = 52;
const ALTO_CARRO = 96;
const VELOCIDAD_LATERAL = 340;

const VIDAS_INICIALES = 3;
const VELOCIDAD_INICIAL = 260;
const VELOCIDAD_MAXIMA = 700;
const VELOCIDAD_MENU = 160;
const ACELERACION = 10;
const SEGUNDOS_POR_NIVEL = 10;
const TIEMPO_INVULNERABLE = 1.6;
const PUNTOS_POR_ESQUIVAR = 10;
const CLAVE_RECORD = "neonTurbo.record";

const COLOR_JUGADOR = "#00e5ff";
const COLORES_ENEMIGOS = ["#ff3b6b", "#ffd23f", "#3ddc97", "#a259ff", "#ff8c42", "#e8ecff"];

/* ---------- 2. REFERENCIAS AL DOM ---------- */
const lienzo = document.getElementById("lienzo");
const ctx = lienzo.getContext("2d");

const hud = {
  puntos: document.getElementById("hud-puntos"),
  velocidad: document.getElementById("hud-velocidad"),
  distancia: document.getElementById("hud-distancia"),
  vidas: document.getElementById("hud-vidas"),
  record: document.getElementById("hud-record")
};

const pantallas = {
  inicio: document.getElementById("pantalla-inicio"),
  pausa: document.getElementById("pantalla-pausa"),
  gameOver: document.getElementById("pantalla-gameover")
};

const resumen = {
  puntos: document.getElementById("go-puntos"),
  distancia: document.getElementById("go-distancia"),
  tiempo: document.getElementById("go-tiempo"),
  nivel: document.getElementById("go-nivel"),
  record: document.getElementById("go-record"),
  insignia: document.getElementById("go-insignia")
};

const botones = {
  iniciar: document.getElementById("boton-iniciar"),
  reanudar: document.getElementById("boton-reanudar"),
  reiniciar: document.getElementById("boton-reiniciar"),
  pausa: document.getElementById("boton-pausa"),
  izquierda: document.getElementById("boton-izquierda"),
  derecha: document.getElementById("boton-derecha")
};

/* ---------- 3. VARIABLES DE ESTADO DEL JUEGO ---------- */
// Estados posibles: "inicio", "jugando", "pausa" y "gameover"
const juego = {
  estado: "inicio",
  puntos: 0,
  distancia: 0,
  tiempo: 0,
  vidas: VIDAS_INICIALES,
  velocidad: VELOCIDAD_MENU,
  nivel: 1,
  record: 0,
  esNuevoRecord: false,
  temporizadorAparicion: 0,
  intervaloAparicion: 1.2,
  invulnerable: 0,
  sacudida: 0,
  destello: 0,
  mensajeNivel: 0,
  desplazamientoCarretera: 0,
  desplazamientoEscenario: 0,
  relojGlobal: 0
};

const jugador = {
  x: 0,
  y: 0,
  ancho: ANCHO_CARRO,
  alto: ALTO_CARRO,
  inclinacion: 0
};

const entrada = {
  izquierdaTeclado: false,
  derechaTeclado: false,
  izquierdaTactil: false,
  derechaTactil: false
};

let enemigos = [];
let particulas = [];
let textosFlotantes = [];
let lineasVelocidad = [];
let factoresCarril = [];
let temporizadorGameOver = null;
let marcaTiempoAnterior = 0;

/* ---------- 4. FUNCIONES AUXILIARES ---------- */
function mostrar(elemento) {
  elemento.classList.remove("oculto");
}

function ocultar(elemento) {
  elemento.classList.add("oculto");
}

function numeroAleatorio(minimo, maximo) {
  return minimo + Math.random() * (maximo - minimo);
}

function centroDeCarril(indiceCarril) {
  return MARGEN_CARRETERA + indiceCarril * ANCHO_CARRIL + ANCHO_CARRIL / 2;
}

function formatearTiempo(segundos) {
  const minutos = Math.floor(segundos / 60);
  const resto = Math.floor(segundos % 60);
  return String(minutos).padStart(2, "0") + ":" + String(resto).padStart(2, "0");
}

function direccionHorizontal() {
  const haciaIzquierda = entrada.izquierdaTeclado || entrada.izquierdaTactil;
  const haciaDerecha = entrada.derechaTeclado || entrada.derechaTactil;
  return (haciaDerecha ? 1 : 0) - (haciaIzquierda ? 1 : 0);
}

function limpiarEntrada() {
  entrada.izquierdaTeclado = false;
  entrada.derechaTeclado = false;
  entrada.izquierdaTactil = false;
  entrada.derechaTactil = false;
  botones.izquierda.classList.remove("activo");
  botones.derecha.classList.remove("activo");
}

/* ---------- 5. PERSISTENCIA DEL RÉCORD (localStorage) ---------- */
function cargarRecord() {
  try {
    const guardado = parseInt(localStorage.getItem(CLAVE_RECORD), 10);
    return Number.isFinite(guardado) ? guardado : 0;
  } catch (error) {
    return 0;
  }
}

function guardarRecord(valor) {
  try {
    localStorage.setItem(CLAVE_RECORD, String(valor));
  } catch (error) {
    // Si el navegador bloquea localStorage, el juego continúa sin guardar.
  }
}

/* ---------- 6. PREPARACIÓN Y CONTROL DE LA PARTIDA ---------- */
function crearLineaVelocidad(yInicial) {
  const largo = numeroAleatorio(30, 90);
  return {
    x: numeroAleatorio(MARGEN_CARRETERA + 10, ANCHO_CANVAS - MARGEN_CARRETERA - 10),
    y: yInicial - largo,
    largo: largo
  };
}

function reiniciarVariables() {
  juego.puntos = 0;
  juego.distancia = 0;
  juego.tiempo = 0;
  juego.vidas = VIDAS_INICIALES;
  juego.velocidad = VELOCIDAD_INICIAL;
  juego.nivel = 1;
  juego.esNuevoRecord = false;
  juego.temporizadorAparicion = 0;
  juego.intervaloAparicion = 1.2;
  juego.invulnerable = 0;
  juego.sacudida = 0;
  juego.destello = 0;
  juego.mensajeNivel = 0;

  jugador.x = (ANCHO_CANVAS - ANCHO_CARRO) / 2;
  jugador.y = ALTO_CANVAS - ALTO_CARRO - 50;
  jugador.inclinacion = 0;

  enemigos = [];
  particulas = [];
  textosFlotantes = [];
  lineasVelocidad = [];
  for (let i = 0; i < 16; i++) {
    lineasVelocidad.push(crearLineaVelocidad(numeroAleatorio(0, ALTO_CANVAS)));
  }

  // Cada carril tiene su propia velocidad relativa: el tráfico no se mueve igual.
  factoresCarril = [];
  for (let i = 0; i < CANTIDAD_CARRILES; i++) {
    factoresCarril.push(numeroAleatorio(0.5, 0.72));
  }

  limpiarEntrada();
}

function prepararMenu() {
  reiniciarVariables();
  juego.estado = "inicio";
  juego.velocidad = VELOCIDAD_MENU;
}

function iniciarPartida() {
  clearTimeout(temporizadorGameOver);
  reiniciarVariables();
  juego.estado = "jugando";
  ocultar(pantallas.inicio);
  ocultar(pantallas.pausa);
  ocultar(pantallas.gameOver);
  actualizarHud();
}

function pausarPartida() {
  if (juego.estado !== "jugando") return;
  juego.estado = "pausa";
  limpiarEntrada();
  mostrar(pantallas.pausa);
}

function reanudarPartida() {
  if (juego.estado !== "pausa") return;
  juego.estado = "jugando";
  ocultar(pantallas.pausa);
}

function alternarPausa() {
  if (juego.estado === "jugando") {
    pausarPartida();
  } else if (juego.estado === "pausa") {
    reanudarPartida();
  }
}

function manejarEspacio() {
  if (juego.estado === "inicio") {
    iniciarPartida();
  } else if (juego.estado === "jugando" || juego.estado === "pausa") {
    alternarPausa();
  } else if (juego.estado === "gameover") {
    // Solo se reinicia cuando la pantalla de Game Over ya es visible.
    if (!pantallas.gameOver.classList.contains("oculto")) {
      iniciarPartida();
    }
  }
}

function terminarPartida() {
  juego.estado = "gameover";
  limpiarEntrada();

  const puntosFinales = Math.floor(juego.puntos);
  juego.esNuevoRecord = puntosFinales > juego.record;
  if (juego.esNuevoRecord) {
    juego.record = puntosFinales;
    guardarRecord(puntosFinales);
  }

  resumen.puntos.textContent = puntosFinales;
  resumen.distancia.textContent = Math.floor(juego.distancia) + " m";
  resumen.tiempo.textContent = formatearTiempo(juego.tiempo);
  resumen.nivel.textContent = juego.nivel;
  resumen.record.textContent = juego.record;
  if (juego.esNuevoRecord) {
    mostrar(resumen.insignia);
  } else {
    ocultar(resumen.insignia);
  }

  actualizarHud();

  // Pequeña pausa para que se vea la explosión antes del cartel.
  temporizadorGameOver = setTimeout(function () {
    mostrar(pantallas.gameOver);
  }, 900);
}

/* ---------- 7. ACTUALIZACIÓN DEL JUEGO (LÓGICA) ---------- */
function actualizar(dt) {
  juego.relojGlobal += dt;
  if (juego.estado === "pausa") return;

  if (juego.estado === "jugando") {
    actualizarPartida(dt);
  } else {
    actualizarAmbiente(dt);
  }

  actualizarParticulas(dt);
  actualizarTextosFlotantes(dt);
  actualizarTemporizadoresVisuales(dt);
}

function actualizarPartida(dt) {
  juego.tiempo += dt;
  actualizarNivel();
  actualizarVelocidad(dt);
  actualizarJugador(dt);
  actualizarAparicionEnemigos(dt);
  actualizarEnemigos(dt);
  detectarColisiones();
  if (juego.estado !== "jugando") return;

  actualizarPuntuacion(dt);
  actualizarEscenario(dt, juego.velocidad);
  crearEstela();
  actualizarHud();
}

// En el menú y en Game Over la escena sigue viva, pero sin jugador activo.
function actualizarAmbiente(dt) {
  if (juego.estado === "inicio") {
    juego.velocidad = VELOCIDAD_MENU;
  } else {
    juego.velocidad = Math.max(0, juego.velocidad - 500 * dt);
    actualizarEnemigos(dt);
  }
  actualizarEscenario(dt, juego.velocidad);
}

function actualizarNivel() {
  const nuevoNivel = 1 + Math.floor(juego.tiempo / SEGUNDOS_POR_NIVEL);
  if (nuevoNivel > juego.nivel) {
    juego.nivel = nuevoNivel;
    juego.mensajeNivel = 2;
  }
}

function actualizarVelocidad(dt) {
  juego.velocidad = Math.min(VELOCIDAD_MAXIMA, juego.velocidad + ACELERACION * dt);
}

function actualizarJugador(dt) {
  const direccion = direccionHorizontal();
  jugador.x += direccion * VELOCIDAD_LATERAL * dt;

  // Límites de la carretera: el carro nunca sale del asfalto.
  const limiteIzquierdo = MARGEN_CARRETERA + 10;
  const limiteDerecho = ANCHO_CANVAS - MARGEN_CARRETERA - ANCHO_CARRO - 10;
  jugador.x = Math.max(limiteIzquierdo, Math.min(limiteDerecho, jugador.x));

  // El carro se inclina suavemente hacia el lado en que gira.
  const inclinacionObjetivo = direccion * 0.14;
  jugador.inclinacion += (inclinacionObjetivo - jugador.inclinacion) * Math.min(1, dt * 12);
}

function actualizarPuntuacion(dt) {
  juego.puntos += juego.velocidad * dt * 0.05;
  juego.distancia += (juego.velocidad * dt) / 20;
}

function actualizarEscenario(dt, velocidad) {
  juego.desplazamientoCarretera = (juego.desplazamientoCarretera + velocidad * dt) % 80;
  juego.desplazamientoEscenario = (juego.desplazamientoEscenario + velocidad * dt) % 360;

  lineasVelocidad.forEach(function (linea) {
    linea.y += velocidad * 1.6 * dt;
    if (linea.y > ALTO_CANVAS) {
      const nueva = crearLineaVelocidad(0);
      linea.x = nueva.x;
      linea.y = nueva.y;
      linea.largo = nueva.largo;
    }
  });
}

function actualizarTemporizadoresVisuales(dt) {
  juego.invulnerable = Math.max(0, juego.invulnerable - dt);
  juego.sacudida = Math.max(0, juego.sacudida - dt);
  juego.destello = Math.max(0, juego.destello - dt);
  juego.mensajeNivel = Math.max(0, juego.mensajeNivel - dt);
}

/* ---------- 8. VEHÍCULOS ENEMIGOS ---------- */
function calcularIntervaloAparicion() {
  const base = Math.max(0.42, 1.25 - (juego.nivel - 1) * 0.08);
  return base * numeroAleatorio(0.8, 1.2);
}

function actualizarAparicionEnemigos(dt) {
  juego.temporizadorAparicion += dt;
  if (juego.temporizadorAparicion >= juego.intervaloAparicion) {
    if (crearEnemigo()) {
      juego.temporizadorAparicion = 0;
      juego.intervaloAparicion = calcularIntervaloAparicion();
    }
  }
}

// Devuelve true si logró crear un enemigo y false si no había espacio seguro.
function crearEnemigo() {
  const enemigosCerca = enemigos.filter(function (e) {
    return e.y < ALTO_CARRO * 2.6;
  });

  const carrilesLibres = [];
  for (let i = 0; i < CANTIDAD_CARRILES; i++) {
    const ocupado = enemigosCerca.some(function (e) {
      return e.carril === i;
    });
    if (!ocupado) carrilesLibres.push(i);
  }

  // Nunca se bloquean todos los carriles: siempre hay una salida.
  const enBandaSuperior = enemigos.filter(function (e) {
    return e.y < 260;
  }).length;
  if (carrilesLibres.length === 0 || enBandaSuperior >= CANTIDAD_CARRILES - 1) {
    return false;
  }

  const carril = carrilesLibres[Math.floor(Math.random() * carrilesLibres.length)];
  enemigos.push({
    carril: carril,
    x: centroDeCarril(carril) - ANCHO_CARRO / 2,
    y: -ALTO_CARRO - 10,
    ancho: ANCHO_CARRO,
    alto: ALTO_CARRO,
    color: COLORES_ENEMIGOS[Math.floor(Math.random() * COLORES_ENEMIGOS.length)],
    factor: factoresCarril[carril],
    esquivado: false
  });
  return true;
}

function actualizarEnemigos(dt) {
  enemigos.forEach(function (enemigo) {
    enemigo.y += juego.velocidad * enemigo.factor * dt;

    // Si el enemigo ya quedó atrás del jugador sin chocar, se premia la esquiva.
    if (!enemigo.esquivado && enemigo.y > jugador.y + jugador.alto) {
      enemigo.esquivado = true;
      if (juego.estado === "jugando") {
        juego.puntos += PUNTOS_POR_ESQUIVAR;
        const textoX = enemigo.x + enemigo.ancho / 2;
        const textoY = jugador.y + jugador.alto;
        crearTextoFlotante(textoX, textoY, "+" + PUNTOS_POR_ESQUIVAR, "#ffd23f");
      }
    }
  });

  enemigos = enemigos.filter(function (enemigo) {
    return enemigo.y < ALTO_CANVAS + 40;
  });
}

/* ---------- 9. COLISIONES ---------- */
// Colisión entre rectángulos (AABB) con un margen de tolerancia.
function colisionan(a, b) {
  const margen = 8;
  return (
    a.x + margen < b.x + b.ancho - margen &&
    a.x + a.ancho - margen > b.x + margen &&
    a.y + margen < b.y + b.alto - margen &&
    a.y + a.alto - margen > b.y + margen
  );
}

function detectarColisiones() {
  if (juego.invulnerable > 0) return;
  for (let i = 0; i < enemigos.length; i++) {
    if (colisionan(jugador, enemigos[i])) {
      manejarChoque(enemigos[i]);
      break;
    }
  }
}

function manejarChoque(enemigo) {
  enemigos = enemigos.filter(function (e) {
    return e !== enemigo;
  });

  juego.vidas -= 1;
  juego.invulnerable = TIEMPO_INVULNERABLE;
  juego.sacudida = 0.45;
  juego.destello = 0.25;
  juego.velocidad = Math.max(VELOCIDAD_INICIAL, juego.velocidad * 0.7);

  const puntoX = (jugador.x + enemigo.x + ANCHO_CARRO) / 2;
  const puntoY = (jugador.y + enemigo.y + ALTO_CARRO) / 2;
  crearExplosion(puntoX, puntoY, enemigo.color, 32);

  if (juego.vidas <= 0) {
    juego.vidas = 0;
    crearExplosion(jugador.x + ANCHO_CARRO / 2, jugador.y + ALTO_CARRO / 2, COLOR_JUGADOR, 50);
    terminarPartida();
  }
}

/* ---------- 10. PARTÍCULAS Y TEXTOS FLOTANTES ---------- */
function crearParticula(x, y, vx, vy, vida, tamano, color) {
  if (particulas.length > 400) particulas.shift();
  particulas.push({
    x: x,
    y: y,
    vx: vx,
    vy: vy,
    vida: vida,
    vidaMaxima: vida,
    tamano: tamano,
    color: color
  });
}

function crearExplosion(x, y, color, cantidad) {
  for (let i = 0; i < cantidad; i++) {
    const angulo = Math.random() * Math.PI * 2;
    const rapidez = numeroAleatorio(80, 400);
    const colorParticula = i % 3 === 0 ? "#ffd23f" : color;
    crearParticula(
      x,
      y,
      Math.cos(angulo) * rapidez,
      Math.sin(angulo) * rapidez,
      numeroAleatorio(0.5, 1.1),
      numeroAleatorio(2, 7),
      colorParticula
    );
  }
}

function crearEstela() {
  if (Math.random() > 0.7) return;
  const x = jugador.x + ANCHO_CARRO * numeroAleatorio(0.25, 0.75);
  const y = jugador.y + ALTO_CARRO;
  const vx = numeroAleatorio(-20, 20);
  const vy = numeroAleatorio(120, 220);
  crearParticula(x, y, vx, vy, 0.35, numeroAleatorio(3, 6), "#ff7a18");
}

function actualizarParticulas(dt) {
  particulas.forEach(function (p) {
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vx *= 0.98;
    p.vida -= dt;
  });
  particulas = particulas.filter(function (p) {
    return p.vida > 0;
  });
}

function crearTextoFlotante(x, y, texto, color) {
  textosFlotantes.push({ x: x, y: y, texto: texto, color: color, vida: 0.9 });
}

function actualizarTextosFlotantes(dt) {
  textosFlotantes.forEach(function (t) {
    t.y -= 50 * dt;
    t.vida -= dt;
  });
  textosFlotantes = textosFlotantes.filter(function (t) {
    return t.vida > 0;
  });
}

/* ---------- 11. PANEL DE INFORMACIÓN (HUD) ---------- */
function actualizarHud() {
  const puntos = Math.floor(juego.puntos);
  hud.puntos.textContent = puntos;
  hud.velocidad.textContent = Math.round(juego.velocidad / 3);
  hud.distancia.textContent = Math.floor(juego.distancia) + " m";
  hud.vidas.textContent = "♥".repeat(juego.vidas) + "♡".repeat(VIDAS_INICIALES - juego.vidas);
  hud.record.textContent = Math.max(juego.record, puntos);
}

/* ---------- 12. DIBUJO EN CANVAS ---------- */
function trazarRectanguloRedondeado(x, y, ancho, alto, radio) {
  ctx.beginPath();
  ctx.moveTo(x + radio, y);
  ctx.lineTo(x + ancho - radio, y);
  ctx.quadraticCurveTo(x + ancho, y, x + ancho, y + radio);
  ctx.lineTo(x + ancho, y + alto - radio);
  ctx.quadraticCurveTo(x + ancho, y + alto, x + ancho - radio, y + alto);
  ctx.lineTo(x + radio, y + alto);
  ctx.quadraticCurveTo(x, y + alto, x, y + alto - radio);
  ctx.lineTo(x, y + radio);
  ctx.quadraticCurveTo(x, y, x + radio, y);
  ctx.closePath();
}

function rellenarRedondeado(x, y, ancho, alto, radio, color) {
  trazarRectanguloRedondeado(x, y, ancho, alto, radio);
  ctx.fillStyle = color;
  ctx.fill();
}

function dibujarFondo() {
  ctx.fillStyle = "#07080f";
  ctx.fillRect(-30, -30, ANCHO_CANVAS + 60, ALTO_CANVAS + 60);
}

function dibujarEscenarioLateral() {
  // Zonas laterales con un resplandor de neón junto a la carretera.
  const izquierda = ctx.createLinearGradient(MARGEN_CARRETERA, 0, 0, 0);
  izquierda.addColorStop(0, "rgba(0, 229, 255, 0.28)");
  izquierda.addColorStop(1, "rgba(0, 229, 255, 0)");
  ctx.fillStyle = "#0b0f1d";
  ctx.fillRect(-30, -30, MARGEN_CARRETERA + 30, ALTO_CANVAS + 60);
  ctx.fillStyle = izquierda;
  ctx.fillRect(0, -30, MARGEN_CARRETERA, ALTO_CANVAS + 60);

  const derecha = ctx.createLinearGradient(ANCHO_CANVAS - MARGEN_CARRETERA, 0, ANCHO_CANVAS, 0);
  derecha.addColorStop(0, "rgba(255, 46, 147, 0.28)");
  derecha.addColorStop(1, "rgba(255, 46, 147, 0)");
  ctx.fillStyle = "#0b0f1d";
  ctx.fillRect(ANCHO_CANVAS - MARGEN_CARRETERA, -30, MARGEN_CARRETERA + 30, ALTO_CANVAS + 60);
  ctx.fillStyle = derecha;
  ctx.fillRect(ANCHO_CANVAS - MARGEN_CARRETERA, -30, MARGEN_CARRETERA, ALTO_CANVAS + 60);

  // Bordillos rojos y blancos que se desplazan.
  const desplazamientoBordillo = juego.desplazamientoEscenario % 60;
  for (let y = -60 + desplazamientoBordillo; y < ALTO_CANVAS; y += 60) {
    ctx.fillStyle = "#e63946";
    ctx.fillRect(MARGEN_CARRETERA - 10, y, 10, 30);
    ctx.fillRect(ANCHO_CANVAS - MARGEN_CARRETERA, y, 10, 30);
    ctx.fillStyle = "#f1f1f1";
    ctx.fillRect(MARGEN_CARRETERA - 10, y + 30, 10, 30);
    ctx.fillRect(ANCHO_CANVAS - MARGEN_CARRETERA, y + 30, 10, 30);
  }

  // Farolas a los costados.
  const desplazamientoFarola = juego.desplazamientoEscenario % 180;
  for (let y = -180 + desplazamientoFarola; y < ALTO_CANVAS + 20; y += 180) {
    dibujarFarola(16, y + 90);
    dibujarFarola(ANCHO_CANVAS - 16, y + 90);
  }
}

function dibujarFarola(x, y) {
  const brillo = ctx.createRadialGradient(x, y, 0, x, y, 30);
  brillo.addColorStop(0, "rgba(255, 210, 63, 0.45)");
  brillo.addColorStop(1, "rgba(255, 210, 63, 0)");
  ctx.fillStyle = brillo;
  ctx.fillRect(x - 30, y - 30, 60, 60);
  ctx.fillStyle = "#ffd23f";
  ctx.beginPath();
  ctx.arc(x, y, 4, 0, Math.PI * 2);
  ctx.fill();
}

function dibujarCarretera() {
  const bordeDerecho = ANCHO_CANVAS - MARGEN_CARRETERA;
  const asfalto = ctx.createLinearGradient(MARGEN_CARRETERA, 0, bordeDerecho, 0);
  asfalto.addColorStop(0, "#1a1d2b");
  asfalto.addColorStop(0.5, "#272b3d");
  asfalto.addColorStop(1, "#1a1d2b");
  ctx.fillStyle = asfalto;
  ctx.fillRect(MARGEN_CARRETERA, -30, ANCHO_CARRETERA, ALTO_CANVAS + 60);

  // Líneas continuas en los bordes de la carretera.
  ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
  ctx.fillRect(MARGEN_CARRETERA + 4, -30, 4, ALTO_CANVAS + 60);
  ctx.fillRect(ANCHO_CANVAS - MARGEN_CARRETERA - 8, -30, 4, ALTO_CANVAS + 60);

  // Líneas divisorias animadas entre carriles.
  ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
  for (let carril = 1; carril < CANTIDAD_CARRILES; carril++) {
    const x = MARGEN_CARRETERA + carril * ANCHO_CARRIL;
    for (let y = -80 + juego.desplazamientoCarretera; y < ALTO_CANVAS; y += 80) {
      ctx.fillRect(x - 3, y, 6, 40);
    }
  }
}

function dibujarLineasVelocidad() {
  const factor = Math.min(1, juego.velocidad / VELOCIDAD_MAXIMA);
  ctx.strokeStyle = "rgba(255, 255, 255, " + (0.05 + factor * 0.25) + ")";
  ctx.lineWidth = 2;
  lineasVelocidad.forEach(function (linea) {
    ctx.beginPath();
    ctx.moveTo(linea.x, linea.y);
    ctx.lineTo(linea.x, linea.y + linea.largo * (0.5 + factor));
    ctx.stroke();
  });
}

function dibujarCarro(x, y, ancho, alto, color, esJugador) {
  ctx.save();
  ctx.translate(x, y);

  // Sombra proyectada sobre el asfalto.
  rellenarRedondeado(5, 8, ancho, alto, 12, "rgba(0, 0, 0, 0.35)");

  // Ruedas.
  ctx.fillStyle = "#050509";
  [0.12, 0.66].forEach(function (proporcion) {
    ctx.fillRect(-5, alto * proporcion, 8, alto * 0.2);
    ctx.fillRect(ancho - 3, alto * proporcion, 8, alto * 0.2);
  });

  // Carrocería (con resplandor si es el carro del jugador).
  if (esJugador) {
    ctx.shadowColor = color;
    ctx.shadowBlur = 22;
  }
  rellenarRedondeado(0, 0, ancho, alto, 12, color);
  ctx.shadowBlur = 0;
  ctx.shadowColor = "transparent";

  // Reflejos laterales para dar volumen.
  rellenarRedondeado(2, 4, ancho * 0.18, alto - 8, 8, "rgba(255, 255, 255, 0.22)");
  rellenarRedondeado(ancho * 0.78, 4, ancho * 0.2, alto - 8, 8, "rgba(0, 0, 0, 0.22)");

  // Franjas deportivas exclusivas del jugador.
  if (esJugador) {
    ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
    ctx.fillRect(ancho * 0.4, 0, ancho * 0.07, alto);
    ctx.fillRect(ancho * 0.53, 0, ancho * 0.07, alto);
  }

  // Parabrisas, techo y luneta trasera.
  rellenarRedondeado(ancho * 0.15, alto * 0.2, ancho * 0.7, alto * 0.2, 6, "#0f1a2b");
  rellenarRedondeado(ancho * 0.2, alto * 0.22, ancho * 0.22, alto * 0.15, 4, "rgba(120,220,255,0.35)");
  rellenarRedondeado(ancho * 0.18, alto * 0.42, ancho * 0.64, alto * 0.22, 6, "rgba(0,0,0,0.28)");
  rellenarRedondeado(ancho * 0.17, alto * 0.67, ancho * 0.66, alto * 0.12, 5, "#0f1a2b");

  // Faros delanteros y luces traseras.
  ctx.fillStyle = "#fff7c2";
  ctx.fillRect(ancho * 0.08, 3, ancho * 0.24, 5);
  ctx.fillRect(ancho * 0.68, 3, ancho * 0.24, 5);
  ctx.fillStyle = "#ff2a2a";
  ctx.fillRect(ancho * 0.08, alto - 8, ancho * 0.26, 5);
  ctx.fillRect(ancho * 0.66, alto - 8, ancho * 0.26, 5);

  ctx.restore();
}

function dibujarEnemigos() {
  enemigos.forEach(function (enemigo) {
    dibujarCarro(enemigo.x, enemigo.y, enemigo.ancho, enemigo.alto, enemigo.color, false);
  });
}

function dibujarJugador() {
  if (juego.estado === "gameover") return;

  const parpadeando = juego.invulnerable > 0 && Math.floor(juego.relojGlobal * 14) % 2 === 0;
  const centroX = jugador.x + ANCHO_CARRO / 2;
  const centroY = jugador.y + ALTO_CARRO / 2;

  ctx.save();

  // Haz de luz de los faros.
  const haz = ctx.createLinearGradient(0, jugador.y, 0, jugador.y - 220);
  haz.addColorStop(0, "rgba(255, 244, 180, 0.28)");
  haz.addColorStop(1, "rgba(255, 244, 180, 0)");
  ctx.fillStyle = haz;
  ctx.beginPath();
  ctx.moveTo(jugador.x + 8, jugador.y);
  ctx.lineTo(jugador.x + ANCHO_CARRO - 8, jugador.y);
  ctx.lineTo(jugador.x + ANCHO_CARRO + 30, jugador.y - 220);
  ctx.lineTo(jugador.x - 30, jugador.y - 220);
  ctx.closePath();
  ctx.fill();

  // Inclinación del carro al girar.
  ctx.translate(centroX, centroY);
  ctx.rotate(jugador.inclinacion);
  ctx.translate(-centroX, -centroY);

  if (parpadeando) ctx.globalAlpha = 0.35;
  dibujarCarro(jugador.x, jugador.y, ANCHO_CARRO, ALTO_CARRO, COLOR_JUGADOR, true);

  ctx.restore();
}

function dibujarParticulas() {
  particulas.forEach(function (p) {
    ctx.globalAlpha = Math.max(0, p.vida / p.vidaMaxima);
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x - p.tamano / 2, p.y - p.tamano / 2, p.tamano, p.tamano);
  });
  ctx.globalAlpha = 1;
}

function dibujarTextosFlotantes() {
  ctx.font = "bold 20px Consolas, 'Courier New', monospace";
  ctx.textAlign = "center";
  textosFlotantes.forEach(function (t) {
    ctx.globalAlpha = Math.max(0, Math.min(1, t.vida / 0.5));
    ctx.fillStyle = t.color;
    ctx.fillText(t.texto, t.x, t.y);
  });
  ctx.globalAlpha = 1;
}

function dibujarVineta() {
  const vineta = ctx.createRadialGradient(
    ANCHO_CANVAS / 2, ALTO_CANVAS / 2, ALTO_CANVAS * 0.35,
    ANCHO_CANVAS / 2, ALTO_CANVAS / 2, ALTO_CANVAS * 0.75
  );
  vineta.addColorStop(0, "rgba(0, 0, 0, 0)");
  vineta.addColorStop(1, "rgba(0, 0, 0, 0.5)");
  ctx.fillStyle = vineta;
  ctx.fillRect(-30, -30, ANCHO_CANVAS + 60, ALTO_CANVAS + 60);
}

function dibujarMensajeNivel() {
  if (juego.mensajeNivel <= 0) return;
  const transparencia = Math.min(1, juego.mensajeNivel);
  const escala = 1 + Math.sin(juego.relojGlobal * 8) * 0.04;

  ctx.save();
  ctx.globalAlpha = transparencia;
  ctx.translate(ANCHO_CANVAS / 2, ALTO_CANVAS * 0.3);
  ctx.scale(escala, escala);
  ctx.textAlign = "center";
  ctx.font = "italic 52px Impact, 'Arial Black', sans-serif";
  ctx.shadowColor = "#00e5ff";
  ctx.shadowBlur = 24;
  ctx.fillStyle = "#ffffff";
  ctx.fillText("NIVEL " + juego.nivel, 0, 0);
  ctx.restore();
}

function dibujarDestello() {
  if (juego.destello <= 0) return;
  ctx.fillStyle = "rgba(255, 255, 255, " + juego.destello * 2 + ")";
  ctx.fillRect(0, 0, ANCHO_CANVAS, ALTO_CANVAS);
}

function dibujar() {
  ctx.save();
  if (juego.sacudida > 0) {
    const intensidad = juego.sacudida * 18;
    ctx.translate((Math.random() - 0.5) * intensidad, (Math.random() - 0.5) * intensidad);
  }

  dibujarFondo();
  dibujarEscenarioLateral();
  dibujarCarretera();
  dibujarLineasVelocidad();
  dibujarEnemigos();
  dibujarJugador();
  dibujarParticulas();
  dibujarTextosFlotantes();
  dibujarVineta();

  ctx.restore();

  dibujarMensajeNivel();
  dibujarDestello();
}

/* ---------- 13. BUCLE PRINCIPAL (requestAnimationFrame) ---------- */
function bucle(marcaTiempo) {
  if (!marcaTiempoAnterior) marcaTiempoAnterior = marcaTiempo;
  // dt = segundos transcurridos desde el cuadro anterior (con tope de 0.05 s).
  const dt = Math.min(Math.max((marcaTiempo - marcaTiempoAnterior) / 1000, 0), 0.05);
  marcaTiempoAnterior = marcaTiempo;

  actualizar(dt);
  dibujar();
  requestAnimationFrame(bucle);
}

/* ---------- 14. ENTRADA: TECLADO, BOTONES Y PANTALLA TÁCTIL ---------- */
function manejarTeclaPresionada(evento) {
  if (evento.code === "Space") {
    evento.preventDefault();
    if (!evento.repeat) manejarEspacio();
    return;
  }

  const tecla = evento.key.toLowerCase();
  if (tecla === "arrowleft" || tecla === "a") {
    entrada.izquierdaTeclado = true;
    evento.preventDefault();
  } else if (tecla === "arrowright" || tecla === "d") {
    entrada.derechaTeclado = true;
    evento.preventDefault();
  } else if (tecla === "p" && !evento.repeat) {
    alternarPausa();
  }
}

function manejarTeclaSoltada(evento) {
  if (evento.code === "Space") {
    evento.preventDefault();
    return;
  }

  const tecla = evento.key.toLowerCase();
  if (tecla === "arrowleft" || tecla === "a") {
    entrada.izquierdaTeclado = false;
  } else if (tecla === "arrowright" || tecla === "d") {
    entrada.derechaTeclado = false;
  }
}

function vincularBotonTactil(boton, propiedad) {
  function activar(evento) {
    evento.preventDefault();
    entrada[propiedad] = true;
    boton.classList.add("activo");
  }

  function desactivar() {
    entrada[propiedad] = false;
    boton.classList.remove("activo");
  }

  boton.addEventListener("pointerdown", activar);
  boton.addEventListener("pointerup", desactivar);
  boton.addEventListener("pointercancel", desactivar);
  boton.addEventListener("pointerleave", desactivar);
  boton.addEventListener("contextmenu", function (evento) {
    evento.preventDefault();
  });
}

function vincularBotonAccion(boton, accion) {
  boton.addEventListener("click", function () {
    accion();
    boton.blur();
  });
}

// Ajusta la resolución interna del canvas para que se vea nítido en cualquier pantalla.
function ajustarResolucion() {
  const rectangulo = lienzo.getBoundingClientRect();
  const densidad = window.devicePixelRatio || 1;
  const escala = Math.max(1, (rectangulo.width * densidad) / ANCHO_CANVAS);
  lienzo.width = Math.round(ANCHO_CANVAS * escala);
  lienzo.height = Math.round(ALTO_CANVAS * escala);
  ctx.setTransform(escala, 0, 0, escala, 0, 0);
}

/* ---------- 15. INICIALIZACIÓN ---------- */
function iniciar() {
  juego.record = cargarRecord();
  prepararMenu();
  ajustarResolucion();
  actualizarHud();

  window.addEventListener("resize", ajustarResolucion);
  document.addEventListener("keydown", manejarTeclaPresionada);
  document.addEventListener("keyup", manejarTeclaSoltada);
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) pausarPartida();
  });

  vincularBotonAccion(botones.iniciar, iniciarPartida);
  vincularBotonAccion(botones.reanudar, reanudarPartida);
  vincularBotonAccion(botones.reiniciar, iniciarPartida);
  vincularBotonAccion(botones.pausa, alternarPausa);
  vincularBotonTactil(botones.izquierda, "izquierdaTactil");
  vincularBotonTactil(botones.derecha, "derechaTactil");

  requestAnimationFrame(bucle);
}

iniciar();