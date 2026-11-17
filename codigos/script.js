const $ = s => document.querySelector(s);
const esc = s => new Option(s).innerHTML;
const fmt = n => n.toLocaleString("es-CO",
  {style: "currency", currency: "COP", maximumFractionDigits: 0});
const hoy = (n = 0) =>
  new Date(Date.now() - n * 864e5).toLocaleDateString("sv");
const uid = () => Math.random().toString(36).slice(2, 9);
const LIMITE = 5000000;
const seed = () => ({
  session: null,
  users: [{id: "u1", n: "Ana Prueba", r: "cliente"},
    {id: "u2", n: "Luis Prueba", r: "cliente"},
    {id: "u0", n: "Admin Prueba", r: "admin"}],
  accounts: [{id: "AH-001", u: "u1", t: "Ahorros", b: 2500000},
    {id: "CO-002", u: "u1", t: "Corriente", b: 800000},
    {id: "AH-003", u: "u2", t: "Ahorros", b: 1200000}],
  tx: [[5, "AH-001", "Gasto", 120000, "Mercado"],
    [20, "AH-001", "Ingreso", 3000000, "Salario"],
    [35, "CO-002", "Gasto", 250000, "Servicios"],
    [50, "AH-001", "Gasto", 400000, "Arriendo"],
    [65, "AH-003", "Ingreso", 1500000, "Honorarios"],
    [80, "AH-003", "Gasto", 300000, "Matrícula"]].map(([d, a, k, m, s]) =>
    ({id: uid(), d: hoy(d), a, k, m, s}))
});
let db = JSON.parse(localStorage.getItem("banca") || "null") || seed();
const save = () => localStorage.setItem("banca", JSON.stringify(db));
const mine = () => db.accounts.filter(a => a.u == db.session);
const owner = a => db.users.find(u => u.id == a.u);
function render() {
  const u = db.users.find(x => x.id == db.session);
  $("#login").hidden = !!u; $("#out").hidden = !u;
  $("#app").hidden = !u || u.r == "admin";
  $("#admin").hidden = !u || u.r != "admin";
  $("#who").textContent = u ? u.n : "";
  if (u) u.r == "admin" ? drawAdmin() : drawApp();
}
function drawApp() {
  const A = mine();
  $("#tot").textContent = fmt(A.reduce((s, a) => s + a.b, 0));
  $("#accs").innerHTML = A.map(a => `<div class="card">
    <small>${a.t} · ${a.id}</small><b>${fmt(a.b)}</b></div>`).join("");
  $("#so").innerHTML = A.map(a =>
    `<option value="${a.id}">Origen ${a.id} · ${fmt(a.b)}</option>`).join("");
  $("#sd").innerHTML = db.accounts.map(a => `<option value="${a.id}">
    Destino ${a.id} · ${esc(owner(a).n)}</option>`).join("");
  drawTx();
}
function drawTx() {
  const ids = mine().map(a => a.id), k = $("#fk").value;
  const d1 = $("#f1").value, d2 = $("#f2").value;
  const l = db.tx.filter(x => ids.includes(x.a) && (!k || x.k == k) &&
    (!d1 || x.d >= d1) && (!d2 || x.d <= d2))
    .sort((a, b) => b.d.localeCompare(a.d));
  $("#txs").innerHTML = l.map(x => `<tr><td>${x.d}</td><td>${x.a}</td>
    <td>${esc(x.s)}</td><td class="${x.k}">${x.k == "Gasto" ? "−" : "+"}
    ${fmt(x.m)}</td></tr>`).join("") ||
    "<tr><td colspan=4>Sin movimientos.</td></tr>";
  const g = {}, T = {Ingreso: 0, Gasto: 0};
  l.forEach(x => {
    const m = x.d.slice(0, 7);
    g[m] = g[m] || {Ingreso: 0, Gasto: 0};
    g[m][x.k] += x.m; T[x.k] += x.m;
  });
  const max = Math.max(1, ...Object.values(g).flatMap(v => [v.Ingreso, v.Gasto]));
  $("#sum").innerHTML = `Ingresos: <b class="good">${fmt(T.Ingreso)}</b> ·
    Gastos: <b class="bad">${fmt(T.Gasto)}</b>`;
  $("#chart").innerHTML = Object.keys(g).sort().map(m => `<div class="grp">
    <div class="bars"><i class="in" style="height:${g[m].Ingreso / max * 100}%"
    title="${fmt(g[m].Ingreso)}"></i><i class="out"
    style="height:${g[m].Gasto / max * 100}%" title="${fmt(g[m].Gasto)}"></i>
    </div><small>${m}</small></div>`).join("") || "<p>Sin datos.</p>";
}
function drawAdmin() {
  const tot = db.accounts.reduce((s, a) => s + a.b, 0);
  $("#akp").innerHTML = `Clientes: <b>${db.users.filter(u =>
    u.r == "cliente").length}</b> · Cuentas: <b>${db.accounts.length}</b> ·
    Movimientos: <b>${db.tx.length}</b> · Dinero en el sistema:
    <b>${fmt(tot)}</b>`;
  $("#atab").innerHTML = db.accounts.map(a => `<tr><td>${a.id}</td>
    <td>${esc(owner(a).n)}</td><td>${a.t}</td><td>${fmt(a.b)}</td></tr>`).join("");
  $("#atx").innerHTML = db.tx.slice(0, 10).map(x => `<tr><td>${x.d}</td>
    <td>${x.a}</td><td>${esc(x.s)}</td><td>${x.k}</td><td>${fmt(x.m)}</td></tr>`
  ).join("");
}
$("#lf").addEventListener("submit", e => {
  e.preventDefault();
  const f = Object.fromEntries(new FormData(e.target));
  if (f.pin != "1234") {
    $("#lerr").textContent = "PIN ficticio incorrecto (use 1234)."; return;
  }
  $("#lerr").textContent = ""; e.target.reset();
  db.session = f.u; save(); render();
});
$("#tf").addEventListener("submit", e => {
  e.preventDefault();
  const f = Object.fromEntries(new FormData(e.target)), m = Math.round(+f.m);
  const o = db.accounts.find(a => a.id == f.o);
  const t = db.accounts.find(a => a.id == f.d);
  const err = !o || !t ? "Seleccione cuentas válidas." :
    o == t ? "Origen y destino deben ser distintos." :
    !(m > 0) ? "El monto debe ser mayor que cero." :
    m > LIMITE ? "Supera el límite de " + fmt(LIMITE) + "." :
    m > o.b ? "Saldo insuficiente." : "";
  $("#msg").textContent = err || "Transferencia simulada exitosa: " + fmt(m);
  $("#msg").className = err ? "bad" : "good";
  if (err) return;
  o.b -= m; t.b += m;
  const s = f.s ? " · " + f.s : "";
  db.tx.unshift({id: uid(), d: hoy(), a: o.id, k: "Gasto", m,
    s: "Transferencia a " + t.id + s},
    {id: uid(), d: hoy(), a: t.id, k: "Ingreso", m,
    s: "Transferencia de " + o.id + s});
  save(); e.target.reset(); drawApp();
});
document.addEventListener("click", e => {
  const d = e.target.closest("button")?.dataset || {};
  if (d.out) db.session = null;
  else if (d.reset) { const s = db.session; db = seed(); db.session = s; }
  else return;
  save(); render();
});
["fk", "f1", "f2"].forEach(i => $("#" + i).addEventListener("input", drawTx));
render();