/* ==========================================================
   LA AVENTURA DE ZIPO - Videojuego de plataformas 2D
   Universidad de Caldas | Programación Web Creativa II
   Docente: Andrés Felipe Osorio Quintero
   Tecnologías: HTML5, CSS3 y JavaScript puro (Canvas API)
   ========================================================== */
"use strict";
 
/* ----------------------------------------------------------
   1. CONSTANTES DEL JUEGO
   ---------------------------------------------------------- */
const CANVAS_W = 960;          // ancho lógico del canvas
const CANVAS_H = 540;          // alto lógico del canvas
const WORLD_WIDTH = 5600;      // ancho total del nivel
const GROUND_Y = 460;          // altura de la superficie del suelo
 
const GRAVITY = 2000;          // aceleración hacia abajo (px/s²)
const JUMP_VELOCITY = -760;    // velocidad inicial del salto (px/s)
const JUMP_CUT_SPEED = 300;    // permite saltos cortos al soltar la tecla
const MOVE_SPEED = 290;        // velocidad horizontal máxima (px/s)
const MAX_FALL_SPEED = 1100;   // velocidad máxima de caída (px/s)
const COYOTE_TIME = 0.1;       // margen para saltar justo al salir de un borde
const JUMP_BUFFER_TIME = 0.12; // margen para recordar un salto pulsado antes de aterrizar
 
const START_LIVES = 3;
const INVULNERABLE_TIME = 1.6; // segundos de protección tras reaparecer
const COIN_POINTS = 100;
const ENEMY_POINTS = 200;
const BONUS_PER_LIFE = 500;
const EXTRA_LIFE_COINS = 20;   // cada 20 monedas se gana una vida
 
/* ----------------------------------------------------------
   2. REFERENCIAS AL DOM
   ---------------------------------------------------------- */
const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");
 
const ui = {
  score: document.getElementById("hud-score"),
  coins: document.getElementById("hud-coins"),
  lives: document.getElementById("hud-lives"),
  screenMenu: document.getElementById("screen-menu"),
  screenWin: document.getElementById("screen-win"),
  screenOver: document.getElementById("screen-over"),
  winScore: document.getElementById("win-score"),
  winCoins: document.getElementById("win-coins"),
  overScore: document.getElementById("over-score")
};
 
/* ----------------------------------------------------------
   3. ESTADO DEL JUEGO
   ---------------------------------------------------------- */
let gameState = "menu";        // "menu", "playing", "won", "lost"
let player = null;
let level = null;              // { solids, coins, enemies, spikes, goal }
let cameraX = 0;
let animTime = 0;              // tiempo acumulado para las animaciones
let score = 0;
let coinCount = 0;
let lives = START_LIVES;
 
// Estado de las teclas y botones táctiles
const input = { left: false, right: false, jump: false, jumpPressed: false };
 
// Nubes del fondo (posiciones fijas calculadas una sola vez)
const CLOUDS = [];
for (let i = 0; i < 14; i++) {
  CLOUDS.push({
    x: i * 210 + (i * 97) % 120,
    y: 40 + (i * 53) % 130,
    s: 0.8 + (i % 3) * 0.3
  });
}
 
/* ----------------------------------------------------------
   4. FUNCIONES AUXILIARES
   ---------------------------------------------------------- */
function rectsOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x &&
         a.y < b.y + b.h && a.y + a.h > b.y;
}
 
function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
 
function fillRoundRect(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  ctx.fill();
}
 
function fillCircle(x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}
 
/* ----------------------------------------------------------
   5. CONSTRUCCIÓN DEL NIVEL
   Cada vez que se reinicia el juego se crea un nivel nuevo,
   así las monedas y los enemigos vuelven a aparecer.
   ---------------------------------------------------------- */
function buildLevel() {
  const lv = { solids: [], coins: [], enemies: [], spikes: [], goal: null };
 
  // --- Funciones para construir el escenario ---
  function addGround(x, w) {
    lv.solids.push({ x: x, y: GROUND_Y, w: w, h: CANVAS_H - GROUND_Y, type: "ground" });
  }
 
  function addPlatform(x, y, w) {
    lv.solids.push({ x: x, y: y, w: w, h: 20, type: "platform" });
  }
 
  function addCrates(x, count) {
    for (let i = 0; i < count; i++) {
      lv.solids.push({ x: x, y: GROUND_Y - 40 * (i + 1), w: 40, h: 40, type: "crate" });
    }
  }
 
  function addSpikes(x, count) {
    for (let i = 0; i < count; i++) {
      lv.spikes.push({ x: x + i * 40, y: GROUND_Y - 22, w: 40, h: 22 });
    }
  }
 
  function addCoinRow(x, y, count, gap) {
    for (let i = 0; i < count; i++) {
      lv.coins.push({ x: x + i * (gap || 40), y: y, taken: false, phase: i * 0.7 });
    }
  }
 
  function addCoinArc(x, y, count, gap, height) {
    for (let i = 0; i < count; i++) {
      const t = count > 1 ? i / (count - 1) : 0;
      lv.coins.push({
        x: x + i * gap,
        y: y - Math.sin(Math.PI * t) * height,
        taken: false,
        phase: i * 0.7
      });
    }
  }
 
  function addEnemy(x, surfaceY, minX, maxX, speed) {
    lv.enemies.push({
      x: x, y: surfaceY - 30, w: 38, h: 30,
      minX: minX, maxX: maxX, speed: speed, dir: 1,
      state: "alive", deadTimer: 0, phase: x * 0.01
    });
  }
 
  // --- Suelo (con 4 abismos de 140 px) ---
  addGround(0, 1200);
  addGround(1340, 960);
  addGround(2440, 960);
  addGround(3540, 960);
  addGround(4640, 960);
 
  // --- Zona 1: inicio ---
  addPlatform(380, 350, 140);
  addPlatform(600, 290, 140);
  addPlatform(820, 350, 160);
  addCoinRow(150, 420, 4);
  addCoinRow(410, 320, 3);
  addCoinRow(630, 260, 3);
  addCoinRow(860, 320, 3);
  addCoinArc(1150, 410, 6, 45, 70);
  addEnemy(750, GROUND_Y, 700, 1000, 70);
 
  // --- Zona 2: cajas y pinchos ---
  addCrates(1430, 1);
  addSpikes(1620, 2);
  addPlatform(1740, 350, 150);
  addPlatform(1950, 350, 110);
  addPlatform(2120, 290, 130);
  addCoinRow(1760, 320, 4);
  addCoinRow(1970, 320, 3);
  addCoinRow(2140, 260, 3);
  addEnemy(1750, 350, 1740, 1890, 60);
  addEnemy(1960, GROUND_Y, 1900, 2150, 80);
  addCoinArc(2260, 410, 6, 45, 70);
 
  // --- Zona 3: escalera de cajas ---
  addCrates(2540, 1);
  addCrates(2580, 2);
  addCrates(2620, 1);
  addSpikes(2860, 2);
  addPlatform(2960, 350, 140);
  addPlatform(3140, 300, 140);
  lv.coins.push({ x: 2560, y: 390, taken: false, phase: 0 });
  lv.coins.push({ x: 2600, y: 350, taken: false, phase: 1 });
  lv.coins.push({ x: 2640, y: 390, taken: false, phase: 2 });
  addCoinRow(2990, 320, 3);
  addCoinRow(3170, 270, 3);
  addEnemy(2700, GROUND_Y, 2670, 2840, 60);
  addEnemy(3000, GROUND_Y, 2960, 3300, 90);
  addCoinArc(3360, 410, 6, 45, 70);
 
  // --- Zona 4: escalera de plataformas ---
  addSpikes(3570, 2);
  addPlatform(3650, 360, 120);
  addPlatform(3820, 300, 120);
  addPlatform(4000, 240, 120);
  addPlatform(4180, 320, 140);
  addCrates(4380, 2);
  addCoinRow(3670, 330, 3);
  addCoinRow(3840, 270, 3);
  addCoinRow(4020, 210, 3);
  addCoinRow(4200, 290, 3);
  addEnemy(3850, GROUND_Y, 3830, 3980, 60);
  addEnemy(4100, GROUND_Y, 4000, 4330, 90);
  addCoinArc(4460, 410, 6, 45, 70);
 
  // --- Zona 5: recta final ---
  addSpikes(4800, 3);
  addCrates(5000, 2);
  addCrates(5040, 2);
  addPlatform(5120, 350, 140);
  addCoinArc(4790, 410, 6, 25, 80);
  addCoinRow(5140, 320, 3);
  addCoinRow(5300, 420, 4);
  addEnemy(5160, GROUND_Y, 5120, 5360, 100);
 
  // --- Meta ---
  lv.goal = { x: 5440, y: 200, w: 40, h: GROUND_Y - 200 };
 
  return lv;
}
 
/* ----------------------------------------------------------
   6. JUGADOR
   ---------------------------------------------------------- */
function createPlayer() {
  return {
    x: 80, y: GROUND_Y - 44,   // posición (esquina superior izquierda)
    w: 30, h: 44,              // tamaño de la caja de colisión
    vx: 0, vy: 0,              // velocidades
    prevY: GROUND_Y - 44,      // posición vertical del cuadro anterior
    onGround: false,
    facing: 1,                 // 1 = derecha, -1 = izquierda
    coyote: 0,
    jumpBuffer: 0,
    invulnerable: 0
  };
}
 
function respawnPlayer() {
  player = createPlayer();
  player.invulnerable = INVULNERABLE_TIME;
  cameraX = 0;
}
 
/* ----------------------------------------------------------
   7. CONTROL DEL JUEGO (inicio, reinicio, fin)
   ---------------------------------------------------------- */
function resetGame() {
  score = 0;
  coinCount = 0;
  lives = START_LIVES;
  level = buildLevel();
  respawnPlayer();
  player.invulnerable = 0;
  updateHud();
}
 
function startGame() {
  resetGame();
  gameState = "playing";
  ui.screenMenu.classList.add("hidden");
  ui.screenWin.classList.add("hidden");
  ui.screenOver.classList.add("hidden");
}
 
function updateHud() {
  ui.score.textContent = score;
  ui.coins.textContent = coinCount;
  ui.lives.textContent = lives > 0 ? "♥".repeat(lives) : "0";
}
 
function loseLife() {
  lives--;
  updateHud();
  if (lives <= 0) {
    gameState = "lost";
    ui.overScore.textContent = score;
    ui.screenOver.classList.remove("hidden");
  } else {
    respawnPlayer();
  }
}
 
function hurtPlayer() {
  if (player.invulnerable > 0) return;
  loseLife();
}
 
function winGame() {
  gameState = "won";
  score += lives * BONUS_PER_LIFE;
  updateHud();
  ui.winScore.textContent = score;
  ui.winCoins.textContent = coinCount;
  ui.screenWin.classList.remove("hidden");
}
 
/* ----------------------------------------------------------
   8. FÍSICA Y COLISIONES
   Se mueve el jugador por ejes separados (primero X y luego Y)
   para saber exactamente por qué lado chocó.
   ---------------------------------------------------------- */
function moveHorizontal(p, dt) {
  p.x += p.vx * dt;
  p.x = clamp(p.x, 0, WORLD_WIDTH - p.w);
 
  for (const s of level.solids) {
    if (rectsOverlap(p, s)) {
      if (p.vx > 0) {
        p.x = s.x - p.w;       // chocó con el lado izquierdo del sólido
      } else if (p.vx < 0) {
        p.x = s.x + s.w;       // chocó con el lado derecho del sólido
      }
      p.vx = 0;
    }
  }
}
 
function moveVertical(p, dt) {
  p.prevY = p.y;
  p.y += p.vy * dt;
  p.onGround = false;
 
  for (const s of level.solids) {
    if (rectsOverlap(p, s)) {
      if (p.vy > 0) {
        p.y = s.y - p.h;       // aterriza sobre el sólido
        p.onGround = true;
      } else if (p.vy < 0) {
        p.y = s.y + s.h;       // se golpea la cabeza
      }
      p.vy = 0;
    }
  }
}
 
/* ----------------------------------------------------------
   9. ACTUALIZACIÓN DE LA LÓGICA (se ejecuta en cada cuadro)
   ---------------------------------------------------------- */
function updatePlayer(dt) {
  const p = player;
 
  // 1. Movimiento horizontal con aceleración suave
  const dir = (input.right ? 1 : 0) - (input.left ? 1 : 0);
  const smoothing = p.onGround ? 14 : 8;
  p.vx += (dir * MOVE_SPEED - p.vx) * Math.min(1, smoothing * dt);
  if (dir === 0 && Math.abs(p.vx) < 5) p.vx = 0;
  if (dir !== 0) p.facing = dir;
 
  // 2. Salto (con tiempo "coyote" y memoria de salto)
  if (input.jumpPressed) {
    p.jumpBuffer = JUMP_BUFFER_TIME;
    input.jumpPressed = false;
  }
  p.jumpBuffer -= dt;
  p.coyote -= dt;
  if (p.onGround) p.coyote = COYOTE_TIME;
 
  if (p.jumpBuffer > 0 && p.coyote > 0) {
    p.vy = JUMP_VELOCITY;
    p.jumpBuffer = 0;
    p.coyote = 0;
    p.onGround = false;
  }
 
  // Si se suelta la tecla durante la subida, el salto es más corto
  if (!input.jump && p.vy < -JUMP_CUT_SPEED) {
    p.vy = -JUMP_CUT_SPEED;
  }
 
  // 3. Gravedad
  p.vy = Math.min(p.vy + GRAVITY * dt, MAX_FALL_SPEED);
 
  // 4. Mover y resolver colisiones con plataformas
  moveHorizontal(p, dt);
  moveVertical(p, dt);
 
  // 5. Temporizador de invulnerabilidad
  if (p.invulnerable > 0) p.invulnerable -= dt;
 
  // 6. Caída al abismo
  if (p.y > CANVAS_H + 120) {
    loseLife();
  }
}
 
function updateCoins() {
  const box = { x: 0, y: 0, w: 26, h: 26 };
  for (const c of level.coins) {
    if (c.taken) continue;
    box.x = c.x - 13;
    box.y = c.y - 13;
    if (rectsOverlap(player, box)) {
      c.taken = true;
      score += COIN_POINTS;
      coinCount++;
      if (coinCount % EXTRA_LIFE_COINS === 0) lives++;
      updateHud();
    }
  }
}
 
function updateEnemies(dt) {
  for (const e of level.enemies) {
    if (e.state === "dead") {
      e.deadTimer -= dt;
      continue;
    }
 
    // Patrulla entre minX y maxX
    e.x += e.dir * e.speed * dt;
    if (e.x <= e.minX) { e.x = e.minX; e.dir = 1; }
    if (e.x + e.w >= e.maxX) { e.x = e.maxX - e.w; e.dir = -1; }
 
    if (!rectsOverlap(player, e)) continue;
 
    // ¿El jugador cae desde arriba? Entonces derrota al enemigo
    const cameFromAbove = player.vy > 0 && player.prevY + player.h <= e.y + 12;
    if (cameFromAbove) {
      e.state = "dead";
      e.deadTimer = 0.4;
      player.vy = JUMP_VELOCITY * 0.6;   // pequeño rebote
      score += ENEMY_POINTS;
      updateHud();
    } else {
      hurtPlayer();
      if (gameState !== "playing") return;
    }
  }
}
 
function updateSpikes() {
  for (const s of level.spikes) {
    const hitbox = { x: s.x + 8, y: s.y + 6, w: s.w - 16, h: s.h - 6 };
    if (rectsOverlap(player, hitbox)) {
      hurtPlayer();
      return;
    }
  }
}
 
function updateCamera(dt) {
  const target = player.x + player.w / 2 - CANVAS_W * 0.4;
  cameraX += (target - cameraX) * Math.min(1, 6 * dt);
  cameraX = clamp(cameraX, 0, WORLD_WIDTH - CANVAS_W);
}
 
function update(dt) {
  updatePlayer(dt);
  if (gameState !== "playing") return;
 
  updateCoins();
  updateEnemies(dt);
  if (gameState !== "playing") return;
 
  updateSpikes();
  if (gameState !== "playing") return;
 
  updateCamera(dt);
 
  if (rectsOverlap(player, level.goal)) {
    winGame();
  }
}
 
/* ----------------------------------------------------------
   10. DIBUJO DEL ESCENARIO
   ---------------------------------------------------------- */
function drawCloud(x, y, s) {
  ctx.fillStyle = "rgba(255, 255, 255, 0.92)";
  fillCircle(x, y, 22 * s);
  fillCircle(x + 26 * s, y - 10 * s, 28 * s);
  fillCircle(x + 56 * s, y, 22 * s);
  fillRoundRect(x - 22 * s, y, 100 * s, 22 * s, 11 * s);
}
 
function drawMountains(parallax, heights, color, snowColor) {
  const scroll = cameraX * parallax;
  const startIndex = Math.floor(scroll / 420);
  const offset = scroll % 420;
 
  for (let i = 0; i <= 3; i++) {
    const h = heights[(startIndex + i) % heights.length];
    const baseX = i * 420 - offset;
 
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(baseX - 60, GROUND_Y);
    ctx.lineTo(baseX + 210, GROUND_Y - h);
    ctx.lineTo(baseX + 480, GROUND_Y);
    ctx.closePath();
    ctx.fill();
 
    if (snowColor) {
      ctx.fillStyle = snowColor;
      ctx.beginPath();
      ctx.moveTo(baseX + 210, GROUND_Y - h);
      ctx.lineTo(baseX + 210 - h * 0.18, GROUND_Y - h + h * 0.22);
      ctx.lineTo(baseX + 210 + h * 0.18, GROUND_Y - h + h * 0.22);
      ctx.closePath();
      ctx.fill();
    }
  }
}
 
function drawBackground() {
  // Cielo
  const sky = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
  sky.addColorStop(0, "#4fb3ff");
  sky.addColorStop(0.7, "#bfe9ff");
  sky.addColorStop(1, "#fff6d6");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
 
  // Sol
  ctx.fillStyle = "rgba(255, 230, 120, 0.35)";
  fillCircle(820, 90, 62);
  ctx.fillStyle = "#ffe066";
  fillCircle(820, 90, 42);
 
  // Nubes (se mueven lento: efecto de profundidad)
  for (const c of CLOUDS) {
    const x = c.x - cameraX * 0.3;
    if (x > -150 && x < CANVAS_W + 150) drawCloud(x, c.y, c.s);
  }
 
  // Montañas lejanas y cercanas
  drawMountains(0.25, [230, 300, 190], "#8fb2e0", "#ffffff");
  drawMountains(0.5, [140, 190, 120], "#5fa86a", null);
}
 
function drawGround(s, x) {
  ctx.fillStyle = "#8d5a2b";
  ctx.fillRect(x, s.y, s.w, s.h);
 
  ctx.fillStyle = "#74481f";
  for (let dx = 20; dx < s.w; dx += 70) {
    ctx.fillRect(x + dx, s.y + 30 + (dx % 3) * 8, 22, 8);
  }
 
  ctx.fillStyle = "#4caf50";
  ctx.fillRect(x, s.y, s.w, 14);
  ctx.fillStyle = "#7bd35f";
  ctx.fillRect(x, s.y, s.w, 5);
}
 
function drawPlatform(s, x) {
  ctx.fillStyle = "#c7773b";
  ctx.fillRect(x, s.y, s.w, s.h);
  ctx.fillStyle = "#e9a15d";
  ctx.fillRect(x, s.y, s.w, 5);
  ctx.fillStyle = "#8a4f22";
  for (let dx = 20; dx < s.w; dx += 20) {
    ctx.fillRect(x + dx, s.y + 5, 2, s.h - 5);
  }
  ctx.fillRect(x, s.y + s.h - 3, s.w, 3);
}
 
function drawCrate(s, x) {
  ctx.fillStyle = "#b9772e";
  ctx.fillRect(x, s.y, s.w, s.h);
  ctx.strokeStyle = "#6d4116";
  ctx.lineWidth = 3;
  ctx.strokeRect(x + 1.5, s.y + 1.5, s.w - 3, s.h - 3);
  ctx.beginPath();
  ctx.moveTo(x + 4, s.y + 4);
  ctx.lineTo(x + s.w - 4, s.y + s.h - 4);
  ctx.moveTo(x + s.w - 4, s.y + 4);
  ctx.lineTo(x + 4, s.y + s.h - 4);
  ctx.stroke();
}
 
function drawSolids() {
  for (const s of level.solids) {
    const x = s.x - cameraX;
    if (x > CANVAS_W || x + s.w < 0) continue;   // fuera de la pantalla
    if (s.type === "ground") drawGround(s, x);
    else if (s.type === "platform") drawPlatform(s, x);
    else drawCrate(s, x);
  }
}
 
function drawSpikes() {
  for (const s of level.spikes) {
    const x = s.x - cameraX;
    if (x > CANVAS_W || x + s.w < 0) continue;
    for (let i = 0; i < 2; i++) {
      const bx = x + i * 20;
      ctx.fillStyle = "#aab4c0";
      ctx.beginPath();
      ctx.moveTo(bx, s.y + s.h);
      ctx.lineTo(bx + 10, s.y);
      ctx.lineTo(bx + 20, s.y + s.h);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#4d5764";
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }
}
 
function drawCoins() {
  for (const c of level.coins) {
    if (c.taken) continue;
    const x = c.x - cameraX;
    if (x < -20 || x > CANVAS_W + 20) continue;
 
    const bob = Math.sin(animTime * 3 + c.phase) * 3;
    const width = Math.abs(Math.cos(animTime * 4 + c.phase)) * 11 + 3;
 
    ctx.fillStyle = "#e0a100";
    ctx.beginPath();
    ctx.ellipse(x, c.y + bob, width + 2, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffd43b";
    ctx.beginPath();
    ctx.ellipse(x, c.y + bob, width, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fff3a6";
    ctx.beginPath();
    ctx.ellipse(x - width * 0.25, c.y + bob - 3, Math.max(1, width * 0.3), 5, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}
 
function drawGoal() {
  const g = level.goal;
  const x = g.x + 16 - cameraX;
  if (x < -100 || x > CANVAS_W + 100) return;
 
  // Base y mástil
  ctx.fillStyle = "#6d4116";
  ctx.fillRect(x - 16, GROUND_Y - 20, 40, 20);
  ctx.fillStyle = "#d9dee5";
  ctx.fillRect(x, g.y, 8, g.h);
  ctx.fillStyle = "#ffd43b";
  fillCircle(x + 4, g.y - 4, 9);
 
  // Bandera ondulante
  const wave = Math.sin(animTime * 5) * 6;
  ctx.fillStyle = "#e63946";
  ctx.beginPath();
  ctx.moveTo(x + 8, g.y + 6);
  ctx.quadraticCurveTo(x + 40, g.y + 6 + wave, x + 72, g.y + 26);
  ctx.quadraticCurveTo(x + 40, g.y + 30 - wave, x + 8, g.y + 50);
  ctx.closePath();
  ctx.fill();
}
 
function drawEnemy(e) {
  const x = e.x - cameraX;
  if (x < -60 || x > CANVAS_W + 60) return;
 
  const cx = x + e.w / 2;
  const bottom = e.y + e.h;
 
  // Enemigo derrotado: queda aplastado un instante
  if (e.state === "dead") {
    if (e.deadTimer > 0) {
      ctx.fillStyle = "#8e44ad";
      ctx.beginPath();
      ctx.ellipse(cx, bottom - 4, e.w / 2 + 6, 5, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    return;
  }
 
  // Cuerpo con efecto de "gelatina"
  const squish = Math.sin(animTime * 8 + e.phase) * 3;
  const w = e.w + squish;
  const h = e.h - squish;
 
  ctx.fillStyle = "#8e44ad";
  ctx.beginPath();
  ctx.ellipse(cx, bottom - 4, w / 2, h - 4, 0, Math.PI, 0);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#b06ad1";
  ctx.beginPath();
  ctx.ellipse(cx - 6, bottom - h + 6, 6, 3, -0.4, 0, Math.PI * 2);
  ctx.fill();
 
  // Patitas
  const step = Math.sin(animTime * 12 + e.phase) * 3;
  ctx.fillStyle = "#4a235a";
  fillRoundRect(cx - 14 + step, bottom - 6, 12, 6, 3);
  fillRoundRect(cx + 2 - step, bottom - 6, 12, 6, 3);
 
  // Ojos (miran hacia donde camina)
  ctx.fillStyle = "#ffffff";
  fillCircle(cx - 7, bottom - h * 0.55, 6);
  fillCircle(cx + 7, bottom - h * 0.55, 6);
  ctx.fillStyle = "#1b1b1b";
  fillCircle(cx - 7 + e.dir * 2, bottom - h * 0.55, 3);
  fillCircle(cx + 7 + e.dir * 2, bottom - h * 0.55, 3);
 
  // Cejas de enojo
  ctx.strokeStyle = "#1b1b1b";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - 13, bottom - h * 0.55 - 9);
  ctx.lineTo(cx - 3, bottom - h * 0.55 - 5);
  ctx.moveTo(cx + 13, bottom - h * 0.55 - 9);
  ctx.lineTo(cx + 3, bottom - h * 0.55 - 5);
  ctx.stroke();
}
 
function drawEnemies() {
  for (const e of level.enemies) drawEnemy(e);
}
 
function drawPlayer() {
  const p = player;
 
  // Parpadeo mientras es invulnerable
  if (p.invulnerable > 0 && Math.floor(p.invulnerable * 10) % 2 === 0) return;
 
  const moving = p.onGround && Math.abs(p.vx) > 25;
  const step = moving ? Math.sin(animTime * 18) : 0;
  const inAir = !p.onGround;
 
  ctx.save();
  ctx.translate(Math.round(p.x - cameraX + p.w / 2), Math.round(p.y));
  ctx.scale(p.facing, 1);                     // voltea según la dirección
 
  // Bufanda (ondea con el movimiento)
  const tail = moving ? -10 - Math.abs(step) * 4 : -8;
  ctx.fillStyle = "#e63946";
  ctx.beginPath();
  ctx.moveTo(-10, 24);
  ctx.lineTo(tail - 8, 24 + (inAir ? -4 : 4) + step * 2);
  ctx.lineTo(-10, 31);
  ctx.closePath();
  ctx.fill();
 
  // Piernas
  ctx.fillStyle = "#2b3a67";
  const legA = inAir ? 5 : step * 6;
  const legB = inAir ? -3 : -step * 6;
  fillRoundRect(-11 + legA, p.h - 12, 10, 12, 3);
  fillRoundRect(1 + legB, p.h - 12, 10, 12, 3);
 
  // Cuerpo
  ctx.fillStyle = "#1fb6a6";
  fillRoundRect(-13, 22, 26, 17, 6);
  ctx.fillStyle = "#e63946";
  fillRoundRect(-14, 20, 28, 6, 3);
 
  // Cabeza
  ctx.fillStyle = "#ffd9a8";
  fillRoundRect(-14, 2, 28, 22, 8);
 
  // Casco naranja con visera
  ctx.fillStyle = "#ff8c1a";
  fillRoundRect(-16, -3, 32, 12, 6);
  ctx.fillStyle = "#e06f00";
  fillRoundRect(4, 5, 16, 4, 2);
 
  // Ojo
  ctx.fillStyle = "#ffffff";
  fillCircle(5, 14, 4.5);
  ctx.fillStyle = "#1b1b1b";
  fillCircle(6.5, 14, 2.2);
 
  ctx.restore();
}
 
function render() {
  ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
  drawBackground();
  drawSolids();
  drawSpikes();
  drawCoins();
  drawGoal();
  drawEnemies();
  drawPlayer();
}
 
/* ----------------------------------------------------------
   11. CICLO PRINCIPAL (requestAnimationFrame)
   ---------------------------------------------------------- */
let lastTime = 0;
 
function gameLoop(timestamp) {
  // dt = segundos transcurridos desde el cuadro anterior (máx. 1/30 s)
  const dt = Math.min((timestamp - lastTime) / 1000, 1 / 30) || 0;
  lastTime = timestamp;
  animTime += dt;
 
  if (gameState === "playing") {
    update(dt);
  }
  render();
 
  requestAnimationFrame(gameLoop);
}
 
/* ----------------------------------------------------------
   12. ENTRADA: TECLADO, BOTONES Y CONTROLES TÁCTILES
   ---------------------------------------------------------- */
function setKey(code, isDown) {
  switch (code) {
    case "ArrowLeft":
      input.left = isDown;
      return true;
    case "ArrowRight":
      input.right = isDown;
      return true;
    case "Space":
    case "KeyW":
    case "ArrowUp":
      if (isDown && !input.jump) input.jumpPressed = true;
      input.jump = isDown;
      return true;
    default:
      return false;
  }
}
 
window.addEventListener("keydown", function (e) {
  if (setKey(e.code, true)) e.preventDefault();
 
  if (e.code === "KeyR" && (gameState === "won" || gameState === "lost")) {
    startGame();
  }
});
 
window.addEventListener("keyup", function (e) {
  if (setKey(e.code, false)) e.preventDefault();
});
 
window.addEventListener("blur", function () {
  input.left = false;
  input.right = false;
  input.jump = false;
});
 
// Botones de pantalla (quitamos el foco para que la barra espaciadora no los active)
["btn-start", "btn-restart-win", "btn-restart-over"].forEach(function (id) {
  const button = document.getElementById(id);
  button.addEventListener("click", function () {
    button.blur();
    startGame();
  });
});
 
// Controles táctiles
function bindTouchButton(id, code) {
  const button = document.getElementById(id);
 
  function press(e) {
    e.preventDefault();
    button.classList.add("pressed");
    setKey(code, true);
  }
 
  function release(e) {
    e.preventDefault();
    button.classList.remove("pressed");
    setKey(code, false);
  }
 
  button.addEventListener("pointerdown", press);
  button.addEventListener("pointerup", release);
  button.addEventListener("pointercancel", release);
  button.addEventListener("pointerleave", release);
  button.addEventListener("contextmenu", function (e) { e.preventDefault(); });
}
 
bindTouchButton("touch-left", "ArrowLeft");
bindTouchButton("touch-right", "ArrowRight");
bindTouchButton("touch-jump", "Space");
 
/* ----------------------------------------------------------
   13. INICIO
   ---------------------------------------------------------- */
resetGame();                        // prepara el nivel para mostrarlo detrás del menú
requestAnimationFrame(gameLoop);