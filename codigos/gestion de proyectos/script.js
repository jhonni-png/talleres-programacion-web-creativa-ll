const $ = s => document.querySelector(s);
const esc = s => new Option(s).innerHTML;
const uid = () => Math.random().toString(36).slice(2, 9);
let db = JSON.parse(localStorage.getItem("proyectos") || '{"boards":[]}');
let bid = null, drag = null, edit = null;
const save = () => localStorage.setItem("proyectos", JSON.stringify(db));
const board = () => db.boards.find(b => b.id == bid);
const mkCols = () => ["Pendiente", "En proceso", "Terminado"]
  .map(n => ({id: uid(), n, cards: []}));
function find(id) {
  for (const c of board().cols) {
    const k = c.cards.find(x => x.id == id);
    if (k) return {c, k};
  }
}
function render() {
  $("#home").hidden = !!bid; $("#board").hidden = !bid;
  $("#back").hidden = !bid;
  bid ? drawBoard() : drawHome();
}
function drawHome() {
  $("#boards").innerHTML = db.boards.map(b =>
    `<article class="card" data-open="${b.id}"><h3>${esc(b.n)}</h3>
     <small>${b.cols.length} columnas ·
     ${b.cols.reduce((a, c) => a + c.cards.length, 0)} tareas</small>
     <button data-delb="${b.id}">Eliminar</button></article>`
  ).join("") || "<p>Cree su primer tablero.</p>";
}
function drawBoard() {
  const b = board(), q = $("#q").value.toLowerCase(), p = $("#fp").value;
  const hoy = new Date().toLocaleDateString("sv");
  $("#bt").textContent = b.n;
  $("#cols").innerHTML = b.cols.map(c => {
    const l = c.cards.filter(k => (k.t + k.who).toLowerCase().includes(q)
      && (!p || k.p == p));
    return `<div class="col" data-col="${c.id}">
     <h3>${esc(c.n)} <span>${l.length}</span>
     <button data-delc="${c.id}">✕</button></h3>
     ${l.map(k => `<div class="task p${k.p} ${k.due && k.due < hoy &&
       c.n != "Terminado" ? "late" : ""}" draggable="true" data-id="${k.id}">
       <b>${esc(k.t)}</b>
       <small>👤 ${esc(k.who || "—")} · 📅 ${k.due || "—"} · ${k.p}</small>
       <div><button data-edit="${k.id}">✏️ Editar</button>
       <button data-deli="${k.id}">🗑</button></div></div>`).join("")}
     <button class="add" data-add="${c.id}">+ Añadir tarjeta</button></div>`;
  }).join("");
}
function openM(col, id) {
  edit = {col, id};
  const k = id ? find(id).k : {t: "", who: "", due: "", p: "Media"};
  ["t", "who", "due", "p"].forEach(n => $("#cf").elements[n].value = k[n]);
  $("#m").hidden = false; $("#cf").elements.t.focus();
}
document.addEventListener("submit", e => {
  e.preventDefault();
  const f = Object.fromEntries(new FormData(e.target)), id = e.target.id;
  if (id == "nb") db.boards.push({id: uid(), n: f.n, cols: mkCols()});
  if (id == "nc") board().cols.push({id: uid(), n: f.n, cards: []});
  if (id == "cf") {
    if (edit.id) Object.assign(find(edit.id).k, f);
    else board().cols.find(c => c.id == edit.col).cards.push({id: uid(), ...f});
    $("#m").hidden = true;
  }
  e.target.reset(); save(); render();
});
document.addEventListener("click", e => {
  const el = e.target.closest("button,article");
  const d = el ? el.dataset : {};
  if (d.open) { bid = d.open; $("#q").value = ""; $("#fp").value = ""; }
  else if (d.back) bid = null;
  else if (d.delb) {
    if (!confirm("¿Eliminar el tablero?")) return;
    db.boards = db.boards.filter(b => b.id != d.delb);
  } else if (d.delc) {
    if (!confirm("¿Eliminar la columna y sus tarjetas?")) return;
    board().cols = board().cols.filter(c => c.id != d.delc);
  } else if (d.add) return openM(d.add);
  else if (d.edit) return openM(null, d.edit);
  else if (d.deli) { const f = find(d.deli); f.c.cards.splice(f.c.cards.indexOf(f.k), 1); }
  else if (d.cancel) return $("#m").hidden = true;
  else return;
  save(); render();
});
document.addEventListener("dragstart", e => {
  const t = e.target.closest(".task");
  if (t) { drag = t.dataset.id; e.dataTransfer.setData("text", drag); }
});
document.addEventListener("dragover", e => {
  if (e.target.closest(".col")) e.preventDefault();
});
document.addEventListener("drop", e => {
  const col = e.target.closest(".col");
  if (!col || !drag) return;
  e.preventDefault();
  const f = find(drag), to = board().cols.find(c => c.id == col.dataset.col);
  f.c.cards.splice(f.c.cards.indexOf(f.k), 1);
  to.cards.push(f.k);
  drag = null; save(); render();
});
$("#q").addEventListener("input", render);
$("#fp").addEventListener("change", render);
render();