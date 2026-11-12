"use strict";
 
/* =========================================================
   TALLER 16 - DASHBOARD DE ANALÍTICA EMPRESARIAL
   Universidad de Caldas | Programación Web Creativa II
   ========================================================= */
 
/* ---------- 1. DATOS EMPRESARIALES FICTICIOS ---------- */
const ANIO_ACTUAL = 2026;
const ANIO_ANTERIOR = 2025;
const META_CRECIMIENTO = 10; // meta de crecimiento anual en %
 
const MESES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const MESES_CORTOS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
 
const CATEGORIAS = [
  { nombre: "Tecnología", color: "#1d4ed8" },
  { nombre: "Hogar", color: "#06b6d4" },
  { nombre: "Moda", color: "#8b5cf6" },
  { nombre: "Deportes", color: "#16a34a" },
  { nombre: "Salud", color: "#f59e0b" }
];
 
const PRODUCTOS = {
  "Tecnología": [
    { nombre: "Portátil Pro 14", precio: 3200000 },
    { nombre: "Monitor 27 pulgadas", precio: 980000 },
    { nombre: "Teclado mecánico", precio: 240000 },
    { nombre: "Audífonos inalámbricos", precio: 310000 }
  ],
  "Hogar": [
    { nombre: "Aspiradora robot", precio: 1250000 },
    { nombre: "Licuadora industrial", precio: 420000 },
    { nombre: "Lámpara LED de mesa", precio: 95000 },
    { nombre: "Set de cocina", precio: 360000 }
  ],
  "Moda": [
    { nombre: "Chaqueta urbana", precio: 280000 },
    { nombre: "Zapatillas casuales", precio: 230000 },
    { nombre: "Bolso de cuero", precio: 340000 },
    { nombre: "Reloj clásico", precio: 450000 }
  ],
  "Deportes": [
    { nombre: "Bicicleta de montaña", precio: 1800000 },
    { nombre: "Balón profesional", precio: 130000 },
    { nombre: "Kit de pesas", precio: 520000 },
    { nombre: "Tenis de running", precio: 380000 }
  ],
  "Salud": [
    { nombre: "Tensiómetro digital", precio: 180000 },
    { nombre: "Suplemento proteico", precio: 150000 },
    { nombre: "Báscula inteligente", precio: 210000 },
    { nombre: "Masajeador eléctrico", precio: 290000 }
  ]
};
 
const CLIENTES = [
  "Comercial Andina S.A.S.", "Distribuciones El Cafetal", "Grupo Nevado Ltda.", "Inversiones Cumanday",
  "Tecnoservicios del Eje", "Almacenes La Esperanza", "Corporación Alta Montaña", "Suministros Manizales",
  "Inmobiliaria Los Nogales", "Oficentro Caldas", "Ferretería Central", "Papelería Universal",
  "Constructora Río Claro", "Clínica San Rafael", "Hotel Termales del Ruiz", "Cooperativa Cafetera"
];
 
const ESTADOS = ["Pagado", "Pagado", "Pagado", "Pendiente"]; // 75 % pagados
 
// Estacionalidad: factor de ventas esperado para cada mes
const ESTACIONALIDAD = [0.85, 0.8, 0.95, 0.9, 1, 1.05, 1.1, 1, 0.95, 1.05, 1.25, 1.4];
 
/* Generador pseudoaleatorio con semilla: produce siempre los mismos datos */
function crearGenerador(semilla) {
  let a = semilla;
  return function () {
    a |= 0;
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
 
const aleatorio = crearGenerador(2026);
const elegir = (lista) => lista[Math.floor(aleatorio() * lista.length)];
 
function generarTransacciones() {
  const lista = [];
 
  [ANIO_ANTERIOR, ANIO_ACTUAL].forEach((anio) => {
    const factorPrecio = anio === ANIO_ACTUAL ? 1.06 : 1;
    const factorVolumen = anio === ANIO_ACTUAL ? 1.08 : 1;
    let consecutivo = 1;
 
    MESES.forEach((_, indiceMes) => {
      const cantidadRegistros = Math.round((10 + aleatorio() * 6) * ESTACIONALIDAD[indiceMes] * factorVolumen);
 
      for (let i = 0; i < cantidadRegistros; i++) {
        const categoria = elegir(CATEGORIAS).nombre;
        const producto = elegir(PRODUCTOS[categoria]);
        const cantidad = 1 + Math.floor(aleatorio() * 4);
        const dia = 1 + Math.floor(aleatorio() * 28);
        const precioUnitario = Math.round((producto.precio * factorPrecio) / 1000) * 1000;
 
        lista.push({
          id: `TRX-${anio}-${String(consecutivo++).padStart(4, "0")}`,
          fecha: `${anio}-${String(indiceMes + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`,
          anio: anio,
          mes: indiceMes,
          cliente: elegir(CLIENTES),
          categoria: categoria,
          producto: producto.nombre,
          cantidad: cantidad,
          total: precioUnitario * cantidad,
          estado: elegir(ESTADOS)
        });
      }
    });
  });
 
  return lista;
}
 
const transacciones = generarTransacciones();
 
/* ---------- 2. ESTADO DE LA APLICACIÓN Y UTILIDADES ---------- */
const estado = {
  mes: "todos",
  categoria: "todas",
  busqueda: "",
  orden: { clave: "fecha", direccion: "desc" }
};
 
const COLUMNAS = [
  { clave: "id", titulo: "ID", tipo: "texto" },
  { clave: "fecha", titulo: "Fecha", tipo: "texto" },
  { clave: "cliente", titulo: "Cliente", tipo: "texto" },
  { clave: "categoria", titulo: "Categoría", tipo: "texto" },
  { clave: "producto", titulo: "Producto", tipo: "texto" },
  { clave: "cantidad", titulo: "Cant.", tipo: "numero" },
  { clave: "total", titulo: "Total", tipo: "numero" },
  { clave: "estado", titulo: "Estado", tipo: "texto" }
];
 
const COLORES = {
  marino: "#0b1f4d",
  azul: "#2563eb",
  gris: "#94a3b8",
  texto: "#64748b",
  linea: "#e5e9f2"
};
const FUENTE = '"Segoe UI", system-ui, -apple-system, Roboto, Arial, sans-serif';
 
const $ = (id) => document.getElementById(id);
 
const formatoMoneda = new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });
const formatoNumero = new Intl.NumberFormat("es-CO");
 
function formatoDecimal(valor) {
  return valor.toFixed(1).replace(".", ",");
}
 
function formatoPorcentaje(valor) {
  return `${valor > 0 ? "+" : ""}${formatoDecimal(valor)} %`;
}
 
function formatoMillones(valor) {
  return `$ ${(valor / 1000000).toLocaleString("es-CO", { maximumFractionDigits: 1 })} M`;
}
 
function normalizar(texto) {
  return String(texto).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}
 
/* ---------- 3. CÁLCULOS SOBRE LOS DATOS ---------- */
function filtrarPorAnio(anio, opciones = {}) {
  const usarMes = opciones.usarMes !== false;
  const usarCategoria = opciones.usarCategoria !== false;
 
  return transacciones.filter((t) => {
    const cumpleAnio = t.anio === anio;
    const cumpleMes = !usarMes || estado.mes === "todos" || t.mes === Number(estado.mes);
    const cumpleCategoria = !usarCategoria || estado.categoria === "todas" || t.categoria === estado.categoria;
    return cumpleAnio && cumpleMes && cumpleCategoria;
  });
}
 
const sumarVentas = (lista) => lista.reduce((acumulado, t) => acumulado + t.total, 0);
const contarClientes = (lista) => new Set(lista.map((t) => t.cliente)).size;
 
function variacion(actual, anterior) {
  if (anterior === 0) {
    return actual === 0 ? 0 : 100;
  }
  return ((actual - anterior) / anterior) * 100;
}
 
function agruparPorMes(lista) {
  const totales = new Array(12).fill(0);
  lista.forEach((t) => {
    totales[t.mes] += t.total;
  });
  return totales;
}
 
function agruparPorCategoria(lista) {
  return CATEGORIAS.map((c) => ({
    nombre: c.nombre,
    color: c.color,
    total: sumarVentas(lista.filter((t) => t.categoria === c.nombre))
  }));
}
 
function calcularMetricas() {
  const actual = filtrarPorAnio(ANIO_ACTUAL);
  const anterior = filtrarPorAnio(ANIO_ANTERIOR);
 
  const ventas = sumarVentas(actual);
  const ventasAnt = sumarVentas(anterior);
  const pedidos = actual.length;
  const pedidosAnt = anterior.length;
  const clientes = contarClientes(actual);
  const clientesAnt = contarClientes(anterior);
  const ticket = pedidos > 0 ? ventas / pedidos : 0;
  const ticketAnt = pedidosAnt > 0 ? ventasAnt / pedidosAnt : 0;
 
  const metaVentas = ventasAnt * (1 + META_CRECIMIENTO / 100);
  const cumplimiento = metaVentas > 0 ? (ventas / metaVentas) * 100 : 0;
 
  const porMes = agruparPorMes(filtrarPorAnio(ANIO_ACTUAL, { usarMes: false }));
  const indiceMejorMes = porMes.indexOf(Math.max(...porMes));
 
  const porCategoria = agruparPorCategoria(filtrarPorAnio(ANIO_ACTUAL, { usarCategoria: false }));
  const totalCategorias = sumarVentas(filtrarPorAnio(ANIO_ACTUAL, { usarCategoria: false }));
  const lider = porCategoria.reduce((mayor, c) => (c.total > mayor.total ? c : mayor));
 
  const pendientes = actual.filter((t) => t.estado === "Pendiente");
 
  return {
    ventas, ventasAnt, pedidos, pedidosAnt, clientes, clientesAnt,
    ticket, ticketAnt, metaVentas, cumplimiento,
    crecimiento: variacion(ventas, ventasAnt),
    mejorMes: { indice: indiceMejorMes, total: porMes[indiceMejorMes] },
    lider: { nombre: lider.nombre, total: lider.total, participacion: totalCategorias > 0 ? (lider.total / totalCategorias) * 100 : 0 },
    pendientes: { cantidad: pendientes.length, total: sumarVentas(pendientes) }
  };
}
 
/* ---------- 4. INDICADORES (TARJETAS) ---------- */
function mostrarDelta(elemento, valor, unidad, texto) {
  const signo = valor >= 0 ? "+" : "-";
  const cifra = formatoDecimal(Math.abs(valor));
  elemento.className = "delta " + (valor >= 0 ? "up" : "down");
  elemento.textContent = `${signo}${cifra}${unidad} ${texto}`;
}
 
function actualizarIndicadores() {
  const m = calcularMetricas();
  const referencia = `vs ${ANIO_ANTERIOR}`;
 
  $("kpiVentas").textContent = formatoMoneda.format(m.ventas);
  mostrarDelta($("deltaVentas"), variacion(m.ventas, m.ventasAnt), " %", referencia);
 
  $("kpiClientes").textContent = formatoNumero.format(m.clientes);
  mostrarDelta($("deltaClientes"), variacion(m.clientes, m.clientesAnt), " %", referencia);
 
  $("kpiPedidos").textContent = formatoNumero.format(m.pedidos);
  mostrarDelta($("deltaPedidos"), variacion(m.pedidos, m.pedidosAnt), " %", referencia);
 
  $("kpiCrecimiento").textContent = formatoPorcentaje(m.crecimiento);
  $("kpiCrecimiento").className = "kpi-value " + (m.crecimiento >= 0 ? "text-up" : "text-down");
  mostrarDelta($("deltaCrecimiento"), m.crecimiento - META_CRECIMIENTO, " pp", `vs meta de ${META_CRECIMIENTO} %`);
 
  $("cmpTicket").textContent = formatoMoneda.format(m.ticket);
  mostrarDelta($("deltaTicket"), variacion(m.ticket, m.ticketAnt), " %", referencia);
 
  $("cmpMeta").textContent = `${formatoDecimal(m.cumplimiento)} %`;
  const barra = $("barraMeta");
  barra.style.width = `${Math.min(100, m.cumplimiento)}%`;
  barra.classList.toggle("ok", m.cumplimiento >= 100);
  $("textoMeta").textContent = `Meta: ${formatoMoneda.format(m.metaVentas)}`;
 
  $("cmpMes").textContent = MESES[m.mejorMes.indice];
  $("cmpMesValor").textContent = formatoMoneda.format(m.mejorMes.total);
 
  $("cmpCategoria").textContent = m.lider.nombre;
  $("cmpCategoriaValor").textContent = `${formatoDecimal(m.lider.participacion)} % de las ventas`;
}
 
/* ---------- 5. GRÁFICOS CON CANVAS ---------- */
const zonasGraficos = { graficoBarras: [], graficoCircular: [], graficoLineas: [] };
 
function prepararLienzo(id) {
  const canvas = $(id);
  const ratio = window.devicePixelRatio || 1;
  const ancho = canvas.clientWidth;
  const alto = canvas.clientHeight;
 
  canvas.width = Math.round(ancho * ratio);
  canvas.height = Math.round(alto * ratio);
 
  const ctx = canvas.getContext("2d");
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  ctx.clearRect(0, 0, ancho, alto);
  zonasGraficos[id] = [];
 
  return { ctx, ancho, alto };
}
 
function maximoRedondeado(valor) {
  if (valor <= 0) {
    return 1;
  }
  const potencia = Math.pow(10, Math.floor(Math.log10(valor)));
  const fraccion = valor / potencia;
  const paso = fraccion <= 1 ? 1 : fraccion <= 2 ? 2 : fraccion <= 5 ? 5 : 10;
  return paso * potencia;
}
 
function dibujarCuadricula(ctx, ancho, alto, margen, maximo) {
  const areaAlto = alto - margen.sup - margen.inf;
  ctx.font = `12px ${FUENTE}`;
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  ctx.lineWidth = 1;
 
  for (let i = 0; i <= 4; i++) {
    const y = alto - margen.inf - (areaAlto * i) / 4;
    ctx.strokeStyle = i === 0 ? "#cbd5e1" : COLORES.linea;
    ctx.beginPath();
    ctx.moveTo(margen.izq, y);
    ctx.lineTo(ancho - margen.der, y);
    ctx.stroke();
    ctx.fillStyle = COLORES.texto;
    ctx.fillText(formatoMillones((maximo * i) / 4), margen.izq - 10, y);
  }
 
  ctx.textBaseline = "alphabetic";
}
 
function dibujarEtiquetasMeses(ctx, alto, margen, paso) {
  ctx.font = `12px ${FUENTE}`;
  ctx.textAlign = "center";
  ctx.fillStyle = COLORES.texto;
  MESES_CORTOS.forEach((mes, i) => {
    ctx.fillText(mes, margen.izq + paso * i + paso / 2, alto - margen.inf + 20);
  });
}
 
function rectanguloRedondeado(ctx, x, y, ancho, alto, radio) {
  const r = Math.min(radio, ancho / 2, alto);
  ctx.beginPath();
  ctx.moveTo(x, y + alto);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.lineTo(x + ancho - r, y);
  ctx.quadraticCurveTo(x + ancho, y, x + ancho, y + r);
  ctx.lineTo(x + ancho, y + alto);
  ctx.closePath();
}
 
function textoVacio(ctx, ancho, alto) {
  ctx.fillStyle = COLORES.texto;
  ctx.font = `14px ${FUENTE}`;
  ctx.textAlign = "center";
  ctx.fillText("Sin datos para mostrar", ancho / 2, alto / 2);
}
 
/* 5.1 Gráfico de barras: ventas por mes */
function dibujarBarras() {
  const { ctx, ancho, alto } = prepararLienzo("graficoBarras");
  const datos = agruparPorMes(filtrarPorAnio(ANIO_ACTUAL, { usarMes: false }));
  const margen = { sup: 16, der: 12, inf: 34, izq: 66 };
  const maximo = maximoRedondeado(Math.max(...datos));
  const areaAncho = ancho - margen.izq - margen.der;
  const areaAlto = alto - margen.sup - margen.inf;
  const paso = areaAncho / datos.length;
  const anchoBarra = Math.min(42, paso * 0.62);
 
  dibujarCuadricula(ctx, ancho, alto, margen, maximo);
 
  datos.forEach((valor, i) => {
    const alturaBarra = (valor / maximo) * areaAlto;
    const x = margen.izq + paso * i + (paso - anchoBarra) / 2;
    const y = alto - margen.inf - alturaBarra;
    const activo = estado.mes === "todos" || Number(estado.mes) === i;
 
    if (alturaBarra > 0.5) {
      const degradado = ctx.createLinearGradient(0, y, 0, y + alturaBarra);
      degradado.addColorStop(0, activo ? COLORES.azul : "#c7d2fe");
      degradado.addColorStop(1, activo ? COLORES.marino : "#e0e7ff");
      ctx.fillStyle = degradado;
      rectanguloRedondeado(ctx, x, y, anchoBarra, alturaBarra, 7);
      ctx.fill();
    }
 
    zonasGraficos.graficoBarras.push({
      tipo: "rect",
      x: margen.izq + paso * i,
      y: margen.sup,
      ancho: paso,
      alto: areaAlto,
      texto: `${MESES[i]} ${ANIO_ACTUAL}\n${formatoMoneda.format(valor)}`
    });
  });
 
  dibujarEtiquetasMeses(ctx, alto, margen, paso);
}
 
/* 5.2 Gráfico circular (tipo dona): ventas por categoría */
function dibujarCircular() {
  const { ctx, ancho, alto } = prepararLienzo("graficoCircular");
  const datos = agruparPorCategoria(filtrarPorAnio(ANIO_ACTUAL, { usarCategoria: false }));
  const total = datos.reduce((acumulado, d) => acumulado + d.total, 0);
 
  actualizarLeyenda(datos, total);
 
  if (total === 0) {
    textoVacio(ctx, ancho, alto);
    return;
  }
 
  const cx = ancho / 2;
  const cy = alto / 2;
  const radioExterno = Math.min(ancho, alto) / 2 - 14;
  const radioInterno = radioExterno * 0.62;
  let angulo = -Math.PI / 2;
 
  datos.forEach((d) => {
    if (d.total === 0) {
      return;
    }
 
    const barrido = (d.total / total) * Math.PI * 2;
    const seleccionada = estado.categoria === d.nombre;
    const activa = estado.categoria === "todas" || seleccionada;
    const medio = angulo + barrido / 2;
    const ox = seleccionada ? Math.cos(medio) * 8 : 0;
    const oy = seleccionada ? Math.sin(medio) * 8 : 0;
 
    ctx.beginPath();
    ctx.arc(cx + ox, cy + oy, radioExterno, angulo, angulo + barrido);
    ctx.arc(cx + ox, cy + oy, radioInterno, angulo + barrido, angulo, true);
    ctx.closePath();
    ctx.globalAlpha = activa ? 1 : 0.3;
    ctx.fillStyle = d.color;
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.stroke();
 
    zonasGraficos.graficoCircular.push({
      tipo: "sector",
      cx: cx + ox,
      cy: cy + oy,
      rInt: radioInterno,
      rExt: radioExterno,
      inicio: angulo,
      fin: angulo + barrido,
      texto: `${d.nombre}\n${formatoMoneda.format(d.total)} (${formatoDecimal((d.total / total) * 100)} %)`
    });
 
    angulo += barrido;
  });
 
  ctx.textAlign = "center";
  ctx.fillStyle = COLORES.texto;
  ctx.font = `12px ${FUENTE}`;
  ctx.fillText("Total", cx, cy - 6);
  ctx.fillStyle = COLORES.marino;
  ctx.font = `bold 18px ${FUENTE}`;
  ctx.fillText(formatoMillones(total), cx, cy + 16);
}
 
function actualizarLeyenda(datos, total) {
  const lista = $("leyendaCategorias");
  lista.replaceChildren();
 
  datos.forEach((d) => {
    const item = document.createElement("li");
 
    const punto = document.createElement("span");
    punto.className = "dot";
    punto.style.background = d.color;
 
    const nombre = document.createElement("span");
    nombre.className = "legend-name";
    nombre.textContent = d.nombre;
 
    const porcentaje = document.createElement("strong");
    porcentaje.textContent = total > 0 ? `${formatoDecimal((d.total / total) * 100)} %` : "0,0 %";
 
    item.append(punto, nombre, porcentaje);
    lista.appendChild(item);
  });
}
 
/* 5.3 Gráfico de líneas: comparación 2026 frente a 2025 */
function trazarSerie(ctx, puntos, color, discontinua, conArea, base) {
  ctx.save();
 
  if (conArea) {
    const minimoY = Math.min(...puntos.map((p) => p.y));
    const degradado = ctx.createLinearGradient(0, minimoY, 0, base);
    degradado.addColorStop(0, "rgba(37, 99, 235, 0.28)");
    degradado.addColorStop(1, "rgba(37, 99, 235, 0)");
    ctx.beginPath();
    ctx.moveTo(puntos[0].x, base);
    puntos.forEach((p) => ctx.lineTo(p.x, p.y));
    ctx.lineTo(puntos[puntos.length - 1].x, base);
    ctx.closePath();
    ctx.fillStyle = degradado;
    ctx.fill();
  }
 
  ctx.beginPath();
  puntos.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.lineJoin = "round";
  ctx.setLineDash(discontinua ? [7, 6] : []);
  ctx.stroke();
  ctx.setLineDash([]);
 
  puntos.forEach((p) => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 4.5, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = color;
    ctx.stroke();
  });
 
  ctx.restore();
}
 
function dibujarLineas() {
  const { ctx, ancho, alto } = prepararLienzo("graficoLineas");
  const actual = agruparPorMes(filtrarPorAnio(ANIO_ACTUAL, { usarMes: false }));
  const anterior = agruparPorMes(filtrarPorAnio(ANIO_ANTERIOR, { usarMes: false }));
  const margen = { sup: 16, der: 20, inf: 34, izq: 66 };
  const maximo = maximoRedondeado(Math.max(...actual, ...anterior));
  const areaAncho = ancho - margen.izq - margen.der;
  const areaAlto = alto - margen.sup - margen.inf;
  const paso = areaAncho / 12;
  const base = alto - margen.inf;
 
  dibujarCuadricula(ctx, ancho, alto, margen, maximo);
 
  if (estado.mes !== "todos") {
    ctx.fillStyle = "rgba(37, 99, 235, 0.08)";
    ctx.fillRect(margen.izq + paso * Number(estado.mes), margen.sup, paso, areaAlto);
  }
 
  const aPunto = (valor, i) => ({
    x: margen.izq + paso * i + paso / 2,
    y: base - (valor / maximo) * areaAlto
  });
 
  trazarSerie(ctx, anterior.map(aPunto), COLORES.gris, true, false, base);
  trazarSerie(ctx, actual.map(aPunto), COLORES.azul, false, true, base);
  dibujarEtiquetasMeses(ctx, alto, margen, paso);
 
  actual.forEach((valor, i) => {
    zonasGraficos.graficoLineas.push({
      tipo: "rect",
      x: margen.izq + paso * i,
      y: margen.sup,
      ancho: paso,
      alto: areaAlto,
      texto: `${MESES[i]}\n${ANIO_ACTUAL}: ${formatoMoneda.format(valor)}\n${ANIO_ANTERIOR}: ${formatoMoneda.format(anterior[i])}\nVariación: ${formatoPorcentaje(variacion(valor, anterior[i]))}`
    });
  });
}
 
function dibujarGraficos() {
  dibujarBarras();
  dibujarCircular();
  dibujarLineas();
}
 
/* 5.4 Tooltips (información al pasar el mouse) */
function estaDentro(zona, x, y) {
  if (zona.tipo === "rect") {
    return x >= zona.x && x <= zona.x + zona.ancho && y >= zona.y && y <= zona.y + zona.alto;
  }
 
  const dx = x - zona.cx;
  const dy = y - zona.cy;
  const distancia = Math.hypot(dx, dy);
  if (distancia < zona.rInt || distancia > zona.rExt) {
    return false;
  }
 
  let angulo = Math.atan2(dy, dx);
  if (angulo < -Math.PI / 2) {
    angulo += Math.PI * 2;
  }
  return angulo >= zona.inicio && angulo <= zona.fin;
}
 
function configurarTooltips() {
  const tooltip = $("tooltip");
 
  Object.keys(zonasGraficos).forEach((id) => {
    const canvas = $(id);
 
    canvas.addEventListener("mousemove", (evento) => {
      const caja = canvas.getBoundingClientRect();
      const x = evento.clientX - caja.left;
      const y = evento.clientY - caja.top;
      const zona = zonasGraficos[id].find((z) => estaDentro(z, x, y));
 
      if (zona) {
        tooltip.textContent = zona.texto;
        tooltip.style.left = `${evento.clientX + 14}px`;
        tooltip.style.top = `${evento.clientY + 14}px`;
        tooltip.classList.add("visible");
        canvas.style.cursor = "pointer";
      } else {
        tooltip.classList.remove("visible");
        canvas.style.cursor = "default";
      }
    });
 
    canvas.addEventListener("mouseleave", () => tooltip.classList.remove("visible"));
  });
}
 
/* ---------- 6. TABLA DE TRANSACCIONES ---------- */
function construirEncabezado() {
  const fila = $("encabezadoTabla");
  fila.replaceChildren();
 
  COLUMNAS.forEach((columna) => {
    const th = document.createElement("th");
    th.scope = "col";
 
    const boton = document.createElement("button");
    boton.type = "button";
    boton.className = "sort-btn";
    boton.dataset.clave = columna.clave;
    boton.textContent = columna.titulo;
 
    th.appendChild(boton);
    fila.appendChild(th);
  });
 
  fila.addEventListener("click", (evento) => {
    const boton = evento.target.closest(".sort-btn");
    if (boton) {
      ordenarPor(boton.dataset.clave);
    }
  });
}
 
function ordenarPor(clave) {
  if (estado.orden.clave === clave) {
    estado.orden.direccion = estado.orden.direccion === "asc" ? "desc" : "asc";
  } else {
    estado.orden.clave = clave;
    estado.orden.direccion = "asc";
  }
  renderizarTabla();
}
 
function obtenerFilasTabla() {
  const termino = normalizar(estado.busqueda.trim());
  const columna = COLUMNAS.find((c) => c.clave === estado.orden.clave);
  const factor = estado.orden.direccion === "asc" ? 1 : -1;
 
  return filtrarPorAnio(ANIO_ACTUAL)
    .filter((t) => termino === "" || normalizar(`${t.id} ${t.fecha} ${t.cliente} ${t.categoria} ${t.producto} ${t.estado}`).includes(termino))
    .sort((a, b) => {
      if (columna.tipo === "numero") {
        return (a[columna.clave] - b[columna.clave]) * factor;
      }
      return String(a[columna.clave]).localeCompare(String(b[columna.clave]), "es") * factor;
    });
}
 
function renderizarTabla() {
  const filas = obtenerFilasTabla();
  const cuerpo = $("cuerpoTabla");
  const fragmento = document.createDocumentFragment();
 
  filas.forEach((t) => {
    const tr = document.createElement("tr");
 
    COLUMNAS.forEach((columna) => {
      const td = document.createElement("td");
 
      if (columna.clave === "total") {
        td.textContent = formatoMoneda.format(t.total);
        td.classList.add("num");
      } else if (columna.clave === "cantidad") {
        td.textContent = t.cantidad;
        td.classList.add("num");
      } else if (columna.clave === "estado") {
        const insignia = document.createElement("span");
        insignia.className = "badge " + (t.estado === "Pagado" ? "badge-ok" : "badge-wait");
        insignia.textContent = t.estado;
        td.appendChild(insignia);
      } else {
        td.textContent = t[columna.clave];
      }
 
      tr.appendChild(td);
    });
 
    fragmento.appendChild(tr);
  });
 
  if (filas.length === 0) {
    const tr = document.createElement("tr");
    const td = document.createElement("td");
    td.colSpan = COLUMNAS.length;
    td.className = "empty-row";
    td.textContent = "No se encontraron registros con los filtros actuales.";
    tr.appendChild(td);
    fragmento.appendChild(tr);
  }
 
  cuerpo.replaceChildren(fragmento);
 
  document.querySelectorAll(".sort-btn").forEach((boton) => {
    const activo = boton.dataset.clave === estado.orden.clave;
    boton.dataset.direccion = activo ? estado.orden.direccion : "";
    boton.parentElement.setAttribute("aria-sort", activo ? (estado.orden.direccion === "asc" ? "ascending" : "descending") : "none");
  });
 
  $("resumenTabla").textContent = `${formatoNumero.format(filas.length)} registros · Total ${formatoMoneda.format(sumarVentas(filas))}`;
}
 
/* ---------- 7. REPORTE EJECUTIVO ---------- */
function renderizarReporte() {
  const m = calcularMetricas();
  const periodo = estado.mes === "todos" ? `Año ${ANIO_ACTUAL}` : `${MESES[Number(estado.mes)]} de ${ANIO_ACTUAL}`;
  const alcance = estado.categoria === "todas" ? "todas las categorías" : `categoría ${estado.categoria}`;
 
  $("reporteTitulo").textContent = `${periodo} · ${alcance}`;
 
  const lineas = [
    `Las ventas totales fueron ${formatoMoneda.format(m.ventas)}, con una variación de ${formatoPorcentaje(m.crecimiento)} frente a ${ANIO_ANTERIOR}.`,
    `Se registraron ${formatoNumero.format(m.pedidos)} pedidos de ${formatoNumero.format(m.clientes)} clientes distintos.`,
    `El ticket promedio por pedido fue ${formatoMoneda.format(m.ticket)}.`,
    `El cumplimiento de la meta de crecimiento (${META_CRECIMIENTO} %) fue de ${formatoDecimal(m.cumplimiento)} %.`,
    `El mejor mes del año fue ${MESES[m.mejorMes.indice]}, con ${formatoMoneda.format(m.mejorMes.total)}.`,
    `La categoría líder es ${m.lider.nombre}, con ${formatoDecimal(m.lider.participacion)} % de las ventas.`,
    `Hay ${formatoNumero.format(m.pendientes.cantidad)} pedidos pendientes de pago por ${formatoMoneda.format(m.pendientes.total)}.`,
    m.crecimiento >= META_CRECIMIENTO
      ? "Conclusión: el desempeño supera la meta propuesta; se recomienda mantener la estrategia comercial."
      : "Conclusión: el desempeño está por debajo de la meta propuesta; se recomienda revisar precios, promociones y cartera pendiente."
  ];
 
  const lista = $("reporteLista");
  lista.replaceChildren();
  lineas.forEach((texto) => {
    const item = document.createElement("li");
    item.textContent = texto;
    lista.appendChild(item);
  });
}
 
/* ---------- 8. EXPORTACIÓN A CSV ---------- */
function exportarCSV() {
  const filas = obtenerFilasTabla();
 
  if (filas.length === 0) {
    alert("No hay registros para exportar con los filtros actuales.");
    return;
  }
 
  const escapar = (valor) => `"${String(valor).replace(/"/g, '""')}"`;
  const lineas = [
    COLUMNAS.map((c) => escapar(c.titulo)).join(";"),
    ...filas.map((t) => COLUMNAS.map((c) => escapar(t[c.clave])).join(";"))
  ];
 
  const contenido = "\uFEFF" + lineas.join("\r\n");
  const blob = new Blob([contenido], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
 
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = `transacciones_${ANIO_ACTUAL}_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();
  URL.revokeObjectURL(url);
}
 
/* ---------- 9. FILTROS, NAVEGACIÓN E INICIO ---------- */
function actualizarTodo() {
  actualizarIndicadores();
  dibujarGraficos();
  renderizarTabla();
  renderizarReporte();
}
 
function restablecerFiltros() {
  estado.mes = "todos";
  estado.categoria = "todas";
  estado.busqueda = "";
  estado.orden = { clave: "fecha", direccion: "desc" };
 
  $("filtroMes").value = "todos";
  $("filtroCategoria").value = "todas";
  $("buscador").value = "";
 
  actualizarTodo();
}
 
function inicializarFiltros() {
  const selectorMes = $("filtroMes");
  const selectorCategoria = $("filtroCategoria");
 
  selectorMes.add(new Option("Todos los meses", "todos"));
  MESES.forEach((mes, i) => selectorMes.add(new Option(mes, String(i))));
 
  selectorCategoria.add(new Option("Todas las categorías", "todas"));
  CATEGORIAS.forEach((c) => selectorCategoria.add(new Option(c.nombre, c.nombre)));
 
  selectorMes.addEventListener("change", () => {
    estado.mes = selectorMes.value;
    actualizarTodo();
  });
 
  selectorCategoria.addEventListener("change", () => {
    estado.categoria = selectorCategoria.value;
    actualizarTodo();
  });
 
  $("buscador").addEventListener("input", (evento) => {
    estado.busqueda = evento.target.value;
    renderizarTabla();
  });
 
  $("btnReset").addEventListener("click", restablecerFiltros);
  $("btnImprimir").addEventListener("click", () => window.print());
  document.querySelectorAll(".js-exportar").forEach((boton) => boton.addEventListener("click", exportarCSV));
}
 
function inicializarNavegacion() {
  const menu = $("sidebar");
  const capa = $("overlay");
  const enlaces = document.querySelectorAll(".menu-link");
 
  const alternarMenu = (abrir) => {
    menu.classList.toggle("open", abrir);
    capa.classList.toggle("visible", abrir);
  };
 
  $("btnMenu").addEventListener("click", () => alternarMenu(!menu.classList.contains("open")));
  capa.addEventListener("click", () => alternarMenu(false));
  enlaces.forEach((enlace) => enlace.addEventListener("click", () => alternarMenu(false)));
 
  const observador = new IntersectionObserver(
    (entradas) => {
      entradas.forEach((entrada) => {
        if (entrada.isIntersecting) {
          enlaces.forEach((enlace) => {
            enlace.classList.toggle("active", enlace.getAttribute("href") === `#${entrada.target.id}`);
          });
        }
      });
    },
    { rootMargin: "-30% 0px -60% 0px" }
  );
 
  document.querySelectorAll(".section").forEach((seccion) => observador.observe(seccion));
}
 
function mostrarFecha() {
  const texto = new Date().toLocaleDateString("es-CO", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  $("fechaActual").textContent = texto.charAt(0).toUpperCase() + texto.slice(1);
}
 
function iniciar() {
  mostrarFecha();
  inicializarFiltros();
  inicializarNavegacion();
  construirEncabezado();
  configurarTooltips();
  actualizarTodo();
 
  let temporizador;
  window.addEventListener("resize", () => {
    clearTimeout(temporizador);
    temporizador = setTimeout(dibujarGraficos, 150);
  });
}
 
document.addEventListener("DOMContentLoaded", iniciar);