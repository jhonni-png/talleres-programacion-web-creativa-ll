const $ = s => document.querySelector(s);
const fmt = n => "$" + n.toLocaleString("es-CO");
const esc = s => new Option(s).innerHTML;
const ENVIO = 4000, PASO = 5000;
const ESTADOS = ["Recibido", "Preparando", "En camino", "Entregado"];
const R = [
 {id:1, n:"Burger Andina", c:"Hamburguesas", e:"🍔", t:25,
  d:"Hamburguesas de res.", m:"Clásica,18000;Doble,24000;Papas,7000"},
 {id:2, n:"Pizzería Roma", c:"Pizza", e:"🍕", t:35,
  d:"Pizza artesanal.", m:"Margarita,22000;Pepperoni,26000;Soda,4500"},
 {id:3, n:"Sushi Kyoto", c:"Sushi", e:"🍣", t:40,
  d:"Rollos y nigiris frescos.", m:"Rollo,28000;Nigiri x6,24000;Gyozas,15000"},
 {id:4, n:"Dulce Tentación", c:"Postres", e:"🍰", t:20,
  d:"Postres y café.", m:"Brownie,9000;Cheesecake,12000;Café,4000"},
 {id:5, n:"Verde Vivo", c:"Saludable", e:"🥗", t:25,
  d:"Ensaladas, bowls y jugos.", m:"Ensalada,17000;Bowl,21000;Jugo,7000"},
 {id:6, n:"Sabor Cafetero", c:"Colombiana", e:"🍲", t:45,
  d:"Cocina cafetera.", m:"Bandeja,28000;Ajiaco,22000;Arepa,10000"}
];
R.forEach(r => r.m = r.m.split(";").map((x, i) => {
  const [n, p] = x.split(",");
  return {id: r.id * 10 + i, n, p: +p, r: r.n};
}));
let cart = JSON.parse(localStorage.getItem("cart") || "[]");
let cat = "Todas", track = null;
const orders = () => JSON.parse(localStorage.getItem("pedidos") || "[]");
const est = o => Math.min(3, Math.floor((Date.now() - o.t) / PASO));
const save = () => {
  localStorage.setItem("cart", JSON.stringify(cart));
  $("#cnt").textContent = cart.reduce((a, i) => a + i.q, 0);
};
function show(v) {
  document.querySelectorAll(".view").forEach(s => s.hidden = s.id !== v);
  if (v == "catalogo") drawCat(); if (v == "carrito") drawCart();
  if (v == "historial") drawHist(); if (v == "seguimiento") drawTrack();
}
function drawCat() {
  const q = $("#q").value.toLowerCase();
  const cats = ["Todas", ...new Set(R.map(r => r.c))];
  $("#filtros").innerHTML = cats.map(c =>
    `<button class="chip ${c == cat ? "on" : ""}" data-c="${c}">${c}</button>`
  ).join("");
  const l = R.filter(r => (cat == "Todas" || r.c == cat) &&
    (r.n + r.d + r.c).toLowerCase().includes(q));
  $("#rests").innerHTML = l.map(r =>
    `<article class="card" data-r="${r.id}">
      <div class="img" style="background:hsl(${r.id * 57},70%,85%)">${r.e}</div>
      <h3>${r.n}</h3><small>${r.c} · ⏱ ${r.t} min</small><p>${r.d}</p>
    </article>`).join("") || "<p>Sin resultados.</p>";
}
function openMenu(id) {
  const r = R.find(x => x.id == id);
  $("#mt").textContent = r.e + " " + r.n;
  $("#md").textContent = r.d;
  $("#prods").innerHTML = r.m.map(p =>
    `<div class="card"><h3>${p.n}</h3><b>${fmt(p.p)}</b>
     <button data-add="${p.id}">Agregar</button></div>`).join("");
  show("menu");
}
function add(id) {
  const p = R.flatMap(r => r.m).find(x => x.id == id);
  const i = cart.find(x => x.id == id);
  i ? i.q++ : cart.push({...p, q: 1}); save();
}
function chg(id, d) {
  const i = cart.find(x => x.id == id);
  if ((i.q += d) < 1) cart = cart.filter(x => x !== i);
  save(); drawCart();
}
const del = id => {
  cart = cart.filter(x => x.id != id); save(); drawCart();
};
function calc() {
  const s = cart.reduce((a, i) => a + i.p * i.q, 0), e = s ? ENVIO : 0;
  return {s, e, t: s + e};
}
function drawCart() {
  const {s, e, t} = calc();
  $("#items").innerHTML = cart.map(i =>
    `<div class="row"><span>${i.n}<small>${i.r}</small></span>
     <span><button data-m="${i.id}" data-d="-1">−</button> ${i.q}
     <button data-m="${i.id}" data-d="1">+</button></span>
     <b>${fmt(i.p * i.q)}</b><button data-del="${i.id}">🗑</button></div>`
  ).join("") || "<p>El carrito está vacío.</p>";
  $("#tot").innerHTML = `Subtotal: ${fmt(s)}<br>Domicilio: ${fmt(e)}
    <br><b>Total: ${fmt(t)}</b>`;
  $("#f").hidden = !cart.length;
}
$("#f").addEventListener("submit", ev => {
  ev.preventDefault(); const c = calc();
  const o = {id: "P" + String(Date.now()).slice(-6), t: Date.now(),
    items: cart, sub: c.s, env: c.e, total: c.t,
    ...Object.fromEntries(new FormData(ev.target))};
  localStorage.setItem("pedidos", JSON.stringify([o, ...orders()]));
  cart = []; save(); ev.target.reset();
  track = o.id; show("seguimiento");
});
function drawTrack() {
  const o = orders().find(x => x.id == track);
  if (!o) return;
  const s = est(o);
  const x = Math.min(88, (Date.now() - o.t) / (3 * PASO) * 88);
  $("#trk").innerHTML = `<h2>✅ Pedido ${o.id} confirmado</h2>
    <p>${esc(o.nombre)}, llegará a ${esc(o.direccion)}, ${esc(o.ciudad)}.
    Total: <b>${fmt(o.total)}</b></p>
    <ol class="steps">${ESTADOS.map((n, i) =>
      `<li class="${i <= s ? "ok" : ""}">${n}</li>`).join("")}</ol>
    <div class="road"><span style="left:${x}%">🛵</span><i>🏠</i></div>
    <p>Estado actual: <b>${ESTADOS[s]}</b></p>`;
}
function drawHist() {
  $("#hist").innerHTML = orders().map(o => {
    const s = est(o), f = new Date(o.t).toLocaleString();
    return `<div class="card"><b>${o.id}</b> ${f}
      <span>${o.items.map(i => i.q + "× " + i.n).join(", ")}</span>
      <span>${fmt(o.total)} <b class="tag s${s}">${ESTADOS[s]}</b></span>
      <button data-t="${o.id}">Seguir pedido</button></div>`;
  }).join("") || "<p>Aún no hay pedidos.</p>";
}
document.addEventListener("click", e => {
  const el = e.target.closest("button,article");
  const d = el ? el.dataset : {};
  if (d.v) show(d.v);
  else if (d.c) { cat = d.c; drawCat(); }
  else if (d.add) add(+d.add);
  else if (d.m) chg(+d.m, +d.d);
  else if (d.del) del(+d.del);
  else if (d.r) openMenu(+d.r);
  else if (d.t) { track = d.t; show("seguimiento"); }
  else if (d.clear) { localStorage.removeItem("pedidos"); drawHist(); }
});
$("#q").addEventListener("input", drawCat);
setInterval(() => { drawTrack(); drawHist(); }, 1000);
save(); show("inicio");