const $ = s => document.querySelector(s);
const FRIENDS = ["Laura Gómez", "Carlos Ruiz", "Sofía Marín",
  "Juan Pérez", "Valentina Ríos"];
const REACTS = ["Me gusta", "Me encanta", "Me divierte"];
const read = (k, d) => JSON.parse(localStorage.getItem(k)) || d;
const write = (k, v) => localStorage.setItem(k, JSON.stringify(v));
const save = () => write("rs_posts", posts);
const esc = t => String(t).replace(/[&<>"]/g,
  c => "&#" + c.charCodeAt(0) + ";");
let user = read("rs_user", null);
let posts = read("rs_posts", seed());
function seed() {
  return ["¡Hola! Hoy aprendí Flexbox.", "Mi paisaje favorito."].map(
    (t, i) => ({ id: i + 1, author: FRIENDS[i], email: "", text: t,
      date: Date.now() - (i + 1) * 36e5, react: {}, comments: [],
      img: i ? "https://picsum.photos/id/1015/600/300" : "" }));
}
function setMode(reg) {
  $("#tabLogin").classList.toggle("on", !reg);
  $("#tabReg").classList.toggle("on", reg);
  $("#name").hidden = !reg; $("#name").required = reg;
  $("#authBtn").textContent = reg ? "Crear cuenta" : "Entrar";
}
const start = () => { $("#auth").hidden = !!user;
  $("#app").hidden = !user; if (user) render(); };
function postHTML(p) {
  const rx = REACTS.map(r => {
    const n = Object.values(p.react).filter(v => v == r).length;
    const on = p.react[user.email] == r ? " on" : "";
    return `<button class="rx${on}" data-a="react" data-id="${p.id}"` +
      ` data-r="${r}">${r} ${n}</button>`;
  }).join("");
  const cm = p.comments.map(c => `<div class="cm"><b>${esc(c.author)}` +
    `</b> ${esc(c.text)}</div>`).join("");
  const btn = (a, t) => `<button data-a="${a}" data-id="${p.id}">${t}` +
    `</button>`;
  const ctl = p.email === user.email ? `<span class="acts">` +
    btn("edit", "Editar") + btn("del", "Eliminar") + `</span>` : "";
  const img = p.img ? `<img src="${esc(p.img)}" alt="">` : "";
  return `<article class="card post"><div class="ph">
    <span class="av">${p.author[0]}</span><div><b>${esc(p.author)}</b>
    <small>${new Date(p.date).toLocaleString()}</small></div>${ctl}</div>
    <p>${esc(p.text)}</p>${img}<div>${rx}</div>${cm}
    <form class="cf" data-id="${p.id}"><input required
    placeholder="Escribe un comentario..."><button class="btn">Enviar
    </button></form></article>`;
}
function render() {
  const q = $("#search").value.trim().toLowerCase();
  const list = posts.filter(p =>
    (p.text + " " + p.author).toLowerCase().includes(q));
  $("#feed").innerHTML = list.length ? list.map(postHTML).join("")
    : '<p class="card">No hay publicaciones.</p>';
  const mine = posts.filter(p => p.email === user.email).length;
  $("#profile").innerHTML = `<div class="av big">${user.name[0]}</div>
    <h3>${esc(user.name)}</h3><p>${esc(user.email)}</p><p>
    <b>${mine}</b> publicaciones</p>`;
  $("#friends").innerHTML = FRIENDS.map(f => `<li><span class="av">
    ${f[0]}</span>${f}</li>`).join("");
}
$("#tabLogin").onclick = () => setMode(false);
$("#tabReg").onclick = () => setMode(true);
$("#authForm").onsubmit = e => {
  e.preventDefault();
  const email = $("#email").value.trim().toLowerCase();
  const name = $("#name").value.trim() || email.split("@")[0];
  user = { name, email }; write("rs_user", user);
  e.target.reset(); start();
};
$("#logout").onclick = () => { localStorage.removeItem("rs_user");
  user = null; start(); };
$("#search").oninput = render;
$("#postForm").onsubmit = e => {
  e.preventDefault();
  posts.unshift({ id: Date.now(), author: user.name, email: user.email,
    text: $("#postText").value.trim(), img: $("#postImg").value.trim(),
    date: Date.now(), react: {}, comments: [] });
  save(); e.target.reset(); render();
};
$("#feed").onclick = e => {
  const b = e.target.closest("button");
  if (!b || !b.dataset.a) return;
  const p = posts.find(x => x.id == b.dataset.id), r = b.dataset.r;
  if (b.dataset.a == "react") {
    if (p.react[user.email] == r) delete p.react[user.email];
    else p.react[user.email] = r;
  } else if (b.dataset.a == "edit") {
    const t = prompt("Editar publicación:", p.text);
    if (t && t.trim()) p.text = t.trim();
  } else if (confirm("¿Eliminar esta publicación?")) {
    posts = posts.filter(x => x !== p);
  }
  save(); render();
};
$("#feed").onsubmit = e => {
  e.preventDefault();
  const p = posts.find(x => x.id == e.target.dataset.id);
  const t = e.target.elements[0].value.trim();
  if (t) p.comments.push({ author: user.name, text: t });
  save(); render();
};