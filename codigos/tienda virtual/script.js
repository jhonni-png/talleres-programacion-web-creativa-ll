const PRODUCTS=[
[1,'Audífonos Bluetooth','Tecnología',129900,'headphones','30 h batería'],
[2,'Portátil 14 pulgadas','Tecnología',1399000,'laptop','16 GB RAM'],
[3,'Cafetera espresso','Hogar',189000,'espresso,machine','15 bares'],
[4,'Chaqueta impermeable','Moda',159900,'jacket','Con capucha'],
[5,'Zapatillas de running','Deportes',249900,'sneakers','Amortiguadas'],
[6,'Libro JavaScript moderno','Libros',89900,'book','Guía de ES6']
].map(([id,n,c,p,k,d])=>({id,n,c,p,k,d}));
const $=s=>document.querySelector(s);
const fmt=n=>'$'+n.toLocaleString('es-CO');
const esc=s=>s.replace(/[&<>"']/g,c=>'&#'+c.charCodeAt(0)+';');
const find=id=>PRODUCTS.find(p=>p.id===id);
const SHIP=12000,FREE=200000,MAXQ=10,MAXP=1500000;
const CATS=['Todas',...new Set(PRODUCTS.map(p=>p.c))];
const f={cat:'Todas',q:'',max:MAXP};
let cart=[];try{cart=JSON.parse(localStorage.cart26)
.filter(i=>find(i.id)&&i.q>0)}catch(e){}
const img=p=>`<img src="https://loremflickr.com/400/300/${p.k}\
?lock=${p.id}" alt="${p.n}" onerror="this.removeAttribute('src')">`;
const row=(a,b,c='tot')=>`<div class="${c}"><span>${a}</span>\
<span>${b}</span></div>`;
function totals(){
const sub=cart.reduce((s,i)=>s+find(i.id).p*i.q,0);
const ship=sub===0||sub>=FREE?0:SHIP;
return{sub,ship,total:sub+ship,n:cart.reduce((s,i)=>s+i.q,0)}}
const rows=t=>row('Subtotal',fmt(t.sub))+row('Envío',
t.ship?fmt(t.ship):'Gratis')+row('Total',fmt(t.total),'tot big');
const lines=()=>cart.map(i=>row(i.q+' x '+find(i.id).n,
fmt(find(i.id).p*i.q))).join('');
const renderSum=()=>$('#sum').innerHTML=
'<h3>Resumen del pedido</h3>'+lines()+rows(totals());
function go(v){
if(v==='checkout'&&!cart.length)v='cartView';
document.querySelectorAll('.view').forEach(x=>x.hidden=x.id!==v);
if(v==='cartView')renderCart();if(v==='checkout')renderSum()}
function renderCats(){
$('#cats').innerHTML=CATS.map(c=>
`<button data-cat="${c}">${c}</button>`).join('');
$('#catSel').innerHTML=CATS.map(c=>`<option>${c}</option>`).join('')}
function renderGrid(){
const l=PRODUCTS.filter(p=>(f.cat==='Todas'||p.c===f.cat)
&&p.p<=f.max&&(p.n+' '+p.c).toLowerCase().includes(f.q));
$('#pv').textContent=fmt(f.max);$('#catSel').value=f.cat;
document.querySelectorAll('#cats button').forEach(b=>
b.classList.toggle('on',b.dataset.cat===f.cat));
$('#grid').innerHTML=l.map(p=>`<article class="card">${img(p)}\
<small>${p.c}</small><h3>${p.n}</h3><b class="price">\
${fmt(p.p)}</b><div class="acts"><button class="btn alt" \
data-det="${p.id}">Detalles</button><button class="btn" \
data-add="${p.id}">Agregar</button></div></article>`).join('')
||'<p>No hay resultados.</p>'}
function detail(id){
const p=find(id);
$('#mbox').innerHTML=`<button class="x" data-close>&times;\
</button>${img(p)}<div><small>${p.c}</small><h2>${p.n}</h2>\
<p>${p.d}</p><p class="price">${fmt(p.p)}</p><button class="btn" \
data-add="${p.id}">Agregar al carrito</button></div>`;
$('#modal').hidden=false}
function renderCart(){
$('#cartBox').innerHTML=!cart.length?'<div class="box">Tu carrito \
está vacío.</div>':cart.map(i=>{const p=find(i.id);
return `<div class="cartrow">${img(p)}<b>${p.n}</b><div class="qty">\
<button data-qty="${p.id}" data-d="-1">-</button>\
<span>${i.q}</span><button data-qty="${p.id}" data-d="1">+\
</button></div><b>${fmt(p.p*i.q)}</b><button class="btn alt" \
data-del="${p.id}">Eliminar</button></div>`}).join('')+`<div \
class="box">${rows(totals())}<br><button class="btn" \
data-go="checkout">Finalizar compra</button></div>`}
function update(){
localStorage.setItem('cart26',JSON.stringify(cart));
$('#count').textContent=totals().n;
if(!$('#cartView').hidden)renderCart();
if(!$('#checkout').hidden)renderSum()}
function qty(id,d){
let i=cart.find(x=>x.id===id);
if(!i)cart.push(i={id,q:0});
i.q=Math.max(1,Math.min(MAXQ,i.q+d));update()}
document.addEventListener('click',e=>{
if(e.target.id==='modal')$('#modal').hidden=true;
const t=e.target.closest('[data-go],[data-cat],[data-det],\
[data-add],[data-qty],[data-del],[data-close]');
if(!t)return;const d=t.dataset;
if(d.go){e.preventDefault();go(d.go)}
else if(d.cat){f.cat=d.cat;go('home');renderGrid()}
else if(d.det)detail(+d.det);
else if(d.add){qty(+d.add,1);$('#modal').hidden=true}
else if(d.qty)qty(+d.qty,+d.d);
else if(d.del){cart=cart.filter(x=>x.id!==+d.del);update()}
else $('#modal').hidden=true});
$('#q').oninput=e=>{f.q=e.target.value.toLowerCase().trim();
if($('#home').hidden)go('home');renderGrid()};
$('#catSel').onchange=e=>{f.cat=e.target.value;renderGrid()};
$('#price').oninput=e=>{f.max=+e.target.value;renderGrid()};
$('#form').onsubmit=e=>{
e.preventDefault();
const d=Object.fromEntries(new FormData(e.target));
$('#doneBox').innerHTML=`<h2>¡Pedido confirmado!</h2><p>Gracias, \
<b>${esc(d.nombre)}</b>. Pedido: <b>PED-${Date.now()%1e8}</b></p>\
<br>${lines()}${rows(totals())}\
<p><small>Compra simulada: no se realizó ningún cobro.</small></p>\
<button class="btn" data-go="home">Seguir comprando</button>`;
cart=[];e.target.reset();update();go('done')};