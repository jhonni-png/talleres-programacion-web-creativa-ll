* { box-sizing: border-box; margin: 0; padding: 0; }
[hidden] { display: none !important; }
body { font-family: Arial, sans-serif; background: #141414; color: #fff; }
.top { position: sticky; top: 0; z-index: 5; display: flex; flex-wrap: wrap; align-items: center; gap: 10px 24px; padding: 12px 4%; background: #000; }
.logo { color: #e50914; font-size: 1.5rem; letter-spacing: 1px; }
.logo span { color: #fff; }
nav { display: flex; flex: 1; flex-wrap: wrap; gap: 6px; }
.nav-btn, .cat { background: none; border: 0; color: #ccc; cursor: pointer; font-size: .95rem; padding: 6px 12px; border-radius: 4px; }
.nav-btn:hover, .nav-btn.active { background: #333; color: #fff; }
#search { width: 220px; max-width: 100%; padding: 8px 12px; border: 1px solid #555; border-radius: 4px; background: #222; color: #fff; }
.hero { padding: 60px 4%; background: linear-gradient(90deg, #000 15%, transparent), linear-gradient(135deg, #8b0000, #141414); }
.hero h2 { font-size: 2rem; margin-bottom: 8px; }
.hero p { color: #bbb; }
.cats { display: flex; gap: 8px; padding: 16px 4% 0; overflow-x: auto; }
.cat { border: 1px solid #555; white-space: nowrap; }
.cat:hover, .cat.active { background: #e50914; border-color: #e50914; color: #fff; }
main { padding: 16px 4% 40px; }
h3 { margin-bottom: 12px; }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(170px, 1fr)); gap: 16px; }
.card { position: relative; background: #222; border-radius: 6px; overflow: hidden; cursor: pointer; transition: transform .2s; }
.card:hover { transform: scale(1.04); }
.card img { display: block; width: 100%; aspect-ratio: 2 / 3; object-fit: cover; }
.card div { padding: 8px; }
.card h4 { font-size: .95rem; }
.card p { margin-top: 4px; font-size: .78rem; color: #aaa; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
.heart { position: absolute; top: 6px; right: 6px; width: 32px; height: 32px; border: 0; border-radius: 50%; background: rgba(0, 0, 0, .7); color: #888; font-size: 1rem; cursor: pointer; }
.heart.on { color: #e50914; }
.empty { padding: 30px; text-align: center; }
.modal { display: none; position: fixed; inset: 0; z-index: 10; align-items: center; justify-content: center; padding: 12px; background: rgba(0, 0, 0, .85); }
.modal.open { display: flex; }
.box { position: relative; width: 100%; max-width: 720px; max-height: 95vh; overflow-y: auto; background: #181818; border-radius: 8px; }
.box video { display: block; width: 100%; background: #000; }
.info { padding: 16px; }
.info p { margin: 6px 0; font-size: .9rem; color: #ccc; }
.close { position: absolute; top: 6px; right: 8px; z-index: 2; width: 36px; height: 36px; border: 0; border-radius: 50%; background: rgba(0, 0, 0, .6); color: #fff; font-size: 1.6rem; cursor: pointer; }
.btn { margin-top: 8px; padding: 9px 16px; border: 0; border-radius: 4px; background: #e50914; color: #fff; font-weight: bold; cursor: pointer; }
footer { padding: 16px; text-align: center; font-size: .8rem; color: #777; border-top: 1px solid #333; }
@media (max-width: 600px) {
  .hero { padding: 36px 4%; }
  .hero h2 { font-size: 1.4rem; }
  .grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
  nav { flex-basis: 100%; }
  #search { width: 100%; }
}

 script.js
const VIDEO = "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";
const GENEROS = { accion: ["Acción", "#b71c1c"], comedia: ["Comedia", "#e69500"],
  drama: ["Drama", "#1565c0"], terror: ["Terror", "#6a1b9a"], scifi: ["Ciencia ficción", "#00838f"] };
const catalogo = [
  "Operación Relámpago|Película|accion|2024|Un agente frena un atentado.",
  "Ruta Mortal|Serie|accion|2023|Una piloto en carreras ilegales.",
  "Vecinos Ruidosos|Película|comedia|2022|Dos familias, una sola casa.",
  "Oficina Absurda|Serie|comedia|2024|Un trabajo cada vez más absurdo.",
  "Cartas al Mar|Película|drama|2021|Las cartas que nunca llegaron.",
  "Raíces|Serie|drama|2023|Tres generaciones defienden su finca.",
  "La Casa del Lago|Película|terror|2023|Voces en una cabaña vacía.",
  "Noche Eterna|Serie|terror|2024|En un pueblo el sol no vuelve a salir.",
  "Órbita Cero|Película|scifi|2025|Una nave pierde la señal.",
  "Código Nexus|Serie|scifi|2024|Una IA descubre que piensa."
].map((fila, i) => {
  const [titulo, tipo, genero, anio, desc] = fila.split("|");
  return { id: i + 1, titulo, tipo, genero, anio, desc };
});
const $ = (id) => document.getElementById(id);
const estado = { vista: "all", genero: "all", texto: "" };
let favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];
let actual = null;
const esFavorito = (id) => favoritos.includes(id);
function alternarFavorito(id) {
  favoritos = esFavorito(id) ? favoritos.filter((f) => f !== id) : [...favoritos, id];
  localStorage.setItem("favoritos", JSON.stringify(favoritos));
  render();
}
function poster(p) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="450"><rect width="300" height="450" fill="${GENEROS[p.genero][1]}"/><text x="150" y="270" font-size="160" fill="#fff" text-anchor="middle">${p.titulo[0]}</text></svg>`;
  return "data:image/svg+xml," + encodeURIComponent(svg);
}
function filtrar() {
  const t = estado.texto.toLowerCase().trim();
  return catalogo.filter((p) =>
    (estado.vista === "all" || (estado.vista === "fav" ? esFavorito(p.id) : p.tipo === estado.vista)) &&
    (estado.genero === "all" || p.genero === estado.genero) &&
    (p.titulo + " " + p.desc).toLowerCase().includes(t));
}
function render() {
  const lista = filtrar();
  $("grid").innerHTML = "";
  lista.forEach((p) => {
    const card = document.createElement("article");
    card.className = "card";
    card.innerHTML = `<button class="heart ${esFavorito(p.id) ? "on" : ""}">♥</button>
      <img src="${poster(p)}" alt="${p.titulo}">
      <div><h4>${p.titulo}</h4><p>${p.desc}</p></div>`;
    card.querySelector(".heart").addEventListener("click", (e) => {
      e.stopPropagation();
      alternarFavorito(p.id);
    });
    card.addEventListener("click", () => abrir(p));
    $("grid").appendChild(card);
  });
  $("empty").hidden = lista.length > 0;
  if (actual) $("m-fav").textContent = esFavorito(actual.id) ? "Quitar de favoritos" : "Agregar a favoritos";
}
function abrir(p) {
  actual = p;
  $("m-title").textContent = p.titulo;
  $("m-meta").textContent = [p.tipo, GENEROS[p.genero][0], p.anio].join(" · ");
  $("m-desc").textContent = p.desc;
  $("player").poster = poster(p);
  $("player").src = VIDEO;
  $("modal").classList.add("open");
  render();
}
function cerrar() {
  $("player").pause();
  $("modal").classList.remove("open");
  actual = null;
}
function enlazar(selector, clave, atributo) {
  document.querySelectorAll(selector).forEach((b) => b.addEventListener("click", () => {
    document.querySelectorAll(selector).forEach((x) => x.classList.toggle("active", x === b));
    estado[clave] = b.dataset[atributo];
    render();
  }));
}
enlazar(".nav-btn", "vista", "view");
enlazar(".cat", "genero", "genre");
$("search").addEventListener("input", (e) => { estado.texto = e.target.value; render(); });
$("m-fav").addEventListener("click", () => alternarFavorito(actual.id));
$("close").addEventListener("click", cerrar);
render();
