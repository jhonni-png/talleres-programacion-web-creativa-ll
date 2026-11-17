const cv = document.getElementById("juego"), c = cv.getContext("2d"), W = cv.width, H = cv.height, rnd = Math.random, teclas = {};
const estrellas = Array.from({ length: 50 }, () => ({ x: rnd() * W, y: rnd() * H, v: 0.5 + rnd() * 2 }));
let estado = "inicio", pausa = false, jug, balas, enemigos, balasEn, items, parts, puntos, vidas, nivel, tiempo, ult = 0, acc = 0;
let record = Number(localStorage.getItem("novaRecord")) || 0;
const choca = (a, b) => Math.abs(a.x - b.x) < (a.w + b.w) / 2 && Math.abs(a.y - b.y) < (a.h + b.h) / 2;
const rect = (o, col) => { c.fillStyle = col; c.fillRect(o.x - o.w / 2, o.y - o.h / 2, o.w, o.h); };
const texto = (s, y, tam, col) => {
  c.fillStyle = col; c.font = "bold " + tam + "px Arial"; c.textAlign = "center"; c.fillText(s, W / 2, y);
};
function iniciar() {
  jug = { x: W / 2, y: H - 50, w: 34, h: 30, cd: 0, inv: 0, doble: 0 };
  balas = []; enemigos = []; balasEn = []; items = []; parts = [];
  puntos = 0; vidas = 3; nivel = 1; tiempo = 0; pausa = false; estado = "jugando";
}
function explosion(x, y, col) {
  for (let i = 0; i < 14; i++) parts.push({ x, y, vx: (rnd() - 0.5) * 6, vy: (rnd() - 0.5) * 6, vida: 30, col });
}
function perder() {
  explosion(jug.x, jug.y, "#38bdf8"); vidas--; jug.inv = 100; balasEn = []; enemigos = enemigos.filter(e => !choca(e, jug));
  if (vidas <= 0) { estado = "fin"; record = Math.max(record, puntos); localStorage.setItem("novaRecord", record); }
}
function actualizar() {
  tiempo++; jug.cd--; jug.inv--; jug.doble--;
  estrellas.forEach(s => { s.y += s.v; if (s.y > H) s.y = 0; });
  jug.x += 5 * ((teclas.ArrowRight || teclas.KeyD ? 1 : 0) - (teclas.ArrowLeft || teclas.KeyA ? 1 : 0));
  jug.x = Math.max(20, Math.min(W - 20, jug.x));
  if (teclas.Space && jug.cd <= 0) {
    const d = jug.doble > 0; jug.cd = d ? 9 : 14;
    balas.push({ x: jug.x - (d ? 10 : 0), y: jug.y - 18, w: 4, h: 12, v: -9 });
    if (d) balas.push({ x: jug.x + 10, y: jug.y - 18, w: 4, h: 12, v: -9 });
  }
  if (tiempo % Math.max(22, 70 - nivel * 6) === 0)
    enemigos.push({ x: 30 + rnd() * (W - 60), y: -20, w: 32, h: 28, v: 1 + nivel * 0.25, f: rnd() * 100, cd: 40 + rnd() * 60,
      vida: nivel > 2 && rnd() < 0.3 ? 2 : 1 });
  [balas, balasEn].forEach(l => l.forEach(b => b.y += b.v));
  items.forEach(i => i.y += 2); parts.forEach(p => { p.x += p.vx; p.y += p.vy; p.vida--; });
  enemigos.forEach(e => {
    e.y += e.v; e.x += Math.sin((tiempo + e.f) / 25) * 1.5;
    if (--e.cd <= 0) { balasEn.push({ x: e.x, y: e.y + 16, w: 6, h: 12, v: 3.5 + nivel * 0.3 }); e.cd = 90 + rnd() * 80; }
    balas.forEach(b => {
      if (b.fin || e.fin || !choca(b, e)) return;
      b.fin = true;
      if (--e.vida > 0) return;
      e.fin = true; puntos += 10; explosion(e.x, e.y, "#f97316");
      if (rnd() < 0.15) items.push({ x: e.x, y: e.y, w: 18, h: 18 });
    });
  });
  items.forEach(i => { if (choca(i, jug)) { i.fin = true; jug.doble = 400; puntos += 25; } });
  if (jug.inv <= 0 && (balasEn.some(b => choca(b, jug)) || enemigos.some(e => choca(e, jug)))) perder();
  balas = balas.filter(b => !b.fin && b.y > -20); enemigos = enemigos.filter(e => !e.fin && e.y < H + 30);
  balasEn = balasEn.filter(b => b.y < H + 20); items = items.filter(i => !i.fin && i.y < H + 20);
  parts = parts.filter(p => p.vida > 0);
  nivel = 1 + Math.floor(puntos / 150);
}
function dibujar() {
  c.fillStyle = "#020617"; c.fillRect(0, 0, W, H); c.fillStyle = "#94a3b8"; estrellas.forEach(s => c.fillRect(s.x, s.y, 2, 2));
  if (estado === "inicio") {
    texto("NOVA DEFENDER", 220, 38, "#38bdf8"); texto("Récord: " + record, 260, 18, "#facc15");
    texto("Pulsa Enter para jugar", 300, 18, "#fff");
    return;
  }
  if (jug.inv <= 0 || Math.floor(jug.inv / 5) % 2) {
    c.fillStyle = "#38bdf8"; c.beginPath(); c.moveTo(jug.x, jug.y - 16);
    c.lineTo(jug.x + 17, jug.y + 14); c.lineTo(jug.x - 17, jug.y + 14); c.fill();
  }
  balas.forEach(b => rect(b, "#facc15")); balasEn.forEach(b => rect(b, "#f43f5e"));
  enemigos.forEach(e => rect(e, e.vida > 1 ? "#a855f7" : "#22c55e"));
  items.forEach(i => { c.fillStyle = "#fde047"; c.beginPath(); c.arc(i.x, i.y, 9, 0, 7); c.fill(); });
  parts.forEach(p => { c.globalAlpha = p.vida / 30; rect({ x: p.x, y: p.y, w: 4, h: 4 }, p.col); });
  c.globalAlpha = 1; c.font = "bold 15px Arial"; c.fillStyle = "#fff";
  c.textAlign = "left"; c.fillText("Puntos: " + puntos + "  Nivel: " + nivel, 10, 22);
  c.textAlign = "right"; c.fillText("Vidas: " + vidas, W - 10, 22);
  if (estado === "fin") {
    texto("GAME OVER", 240, 42, "#f43f5e"); texto("Puntos: " + puntos + " | Récord: " + record, 280, 18, "#fff");
    texto("Enter para reiniciar", 315, 16, "#94a3b8");
  }
  if (pausa) texto("PAUSA", H / 2, 40, "#fff");
}
function bucle(ms) {
  acc = Math.min(acc + ms - ult, 100); ult = ms;
  for (; acc >= 16.67; acc -= 16.67) if (estado === "jugando" && !pausa) actualizar();
  dibujar(); requestAnimationFrame(bucle);
}
addEventListener("keydown", e => {
  teclas[e.code] = true;
  if (["Space", "ArrowLeft", "ArrowRight"].includes(e.code)) e.preventDefault();
  if (e.code === "Enter" && estado !== "jugando") iniciar();
  if (e.code === "KeyP" && estado === "jugando") pausa = !pausa;
});
addEventListener("keyup", e => teclas[e.code] = false);
requestAnimationFrame(bucle);
Instrucciones para ejecutar el pr