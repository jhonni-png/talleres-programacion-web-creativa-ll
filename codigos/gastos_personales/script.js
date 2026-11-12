"use strict";

/* ==========================================================
   Taller 10 - Sistema de Gestión de Gastos Personales
   Universidad de Caldas - Programación Web Creativa II
   ========================================================== */

/* ---------- 1. Constantes y estado de la aplicación ---------- */
const CLAVE_ALMACENAMIENTO = "taller10_gastos_transacciones";
const VALOR_MAXIMO = 999999999;
const TIEMPO_AVISO = 4000;

const CATEGORIAS = {
  ingreso: ["Salario", "Freelance", "Ventas", "Inversiones", "Otros ingresos"],
  gasto: [
    "Alimentación",
    "Transporte",
    "Vivienda",
    "Servicios",
    "Educación",
    "Salud",
    "Entretenimiento",
    "Otros gastos"
  ]
};

const estado = {
  transacciones: [],
  filtroActivo: "todos",
  categoriaFiltro: "todas",
  textoBusqueda: "",
  editandoId: null
};

const formatoMoneda = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2
});

let temporizadorAviso = null;

/* ---------- 2. Referencias al DOM ---------- */
const dom = {
  formulario: document.getElementById("formMovimiento"),
  btnGuardar: document.getElementById("btnGuardar"),
  tituloFormulario: document.getElementById("tituloFormulario"),
  panelFormulario: document.getElementById("tituloFormulario").closest(".panel"),
  descripcion: document.getElementById("descripcion"),
  tipo: document.getElementById("tipo"),
  categoria: document.getElementById("categoria"),
  valor: document.getElementById("valor"),
  fecha: document.getElementById("fecha"),
  btnLimpiar: document.getElementById("btnLimpiar"),
  errores: {
    descripcion: document.getElementById("errorDescripcion"),
    tipo: document.getElementById("errorTipo"),
    categoria: document.getElementById("errorCategoria"),
    valor: document.getElementById("errorValor"),
    fecha: document.getElementById("errorFecha")
  },
  aviso: document.getElementById("aviso"),
  fechaActual: document.getElementById("fechaActual"),
  saldoTotal: document.getElementById("saldoTotal"),
  notaSaldo: document.getElementById("notaSaldo"),
  tarjetaSaldo: document.querySelector(".tarjeta--saldo"),
  totalIngresos: document.getElementById("totalIngresos"),
  totalGastos: document.getElementById("totalGastos"),
  totalMovimientos: document.getElementById("totalMovimientos"),
  filtros: document.getElementById("filtros"),
  tablaContenedor: document.getElementById("tablaContenedor"),
  cuerpoTabla: document.getElementById("cuerpoTabla"),
  mensajeVacio: document.getElementById("mensajeVacio"),
  busqueda: document.getElementById("busqueda"),
  filtroCategoria: document.getElementById("filtroCategoria"),
  listaCategorias: document.getElementById("listaCategorias"),
  mensajeCategoriasVacio: document.getElementById("mensajeCategoriasVacio")
};

/* ---------- 3. Funciones de utilidad ---------- */
function obtenerFechaHoy() {
  const ahora = new Date();
  const anio = ahora.getFullYear();
  const mes = String(ahora.getMonth() + 1).padStart(2, "0");
  const dia = String(ahora.getDate()).padStart(2, "0");
  return `${anio}-${mes}-${dia}`;
}

function formatearFecha(fechaISO) {
  const [anio, mes, dia] = fechaISO.split("-");
  return `${dia}/${mes}/${anio}`;
}

function esFechaValida(texto) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(texto)) {
    return false;
  }
  const [anio, mes, dia] = texto.split("-").map(Number);
  const fecha = new Date(anio, mes - 1, dia);
  return (
    fecha.getFullYear() === anio &&
    fecha.getMonth() === mes - 1 &&
    fecha.getDate() === dia
  );
}

function redondear(numero) {
  return Math.round((numero + Number.EPSILON) * 100) / 100;
}

function normalizarTexto(texto) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function generarId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

/* ---------- 4. LocalStorage: guardar y recuperar ---------- */
function esTransaccionValida(t) {
  return (
    t !== null &&
    typeof t === "object" &&
    typeof t.id === "string" &&
    typeof t.descripcion === "string" &&
    typeof t.valor === "number" &&
    Number.isFinite(t.valor) &&
    t.valor > 0 &&
    (t.tipo === "ingreso" || t.tipo === "gasto") &&
    typeof t.categoria === "string" &&
    typeof t.fecha === "string" &&
    esFechaValida(t.fecha)
  );
}

function cargarTransacciones() {
  try {
    const guardado = localStorage.getItem(CLAVE_ALMACENAMIENTO);
    if (guardado === null) {
      return [];
    }
    const datos = JSON.parse(guardado);
    return Array.isArray(datos) ? datos.filter(esTransaccionValida) : [];
  } catch (error) {
    console.error("No fue posible leer LocalStorage:", error);
    return [];
  }
}

function guardarTransacciones() {
  try {
    localStorage.setItem(
      CLAVE_ALMACENAMIENTO,
      JSON.stringify(estado.transacciones)
    );
    return true;
  } catch (error) {
    console.error("No fue posible guardar en LocalStorage:", error);
    mostrarAviso("No se pudo guardar la información en el navegador.", "error");
    return false;
  }
}

/* ---------- 5. Avisos y mensajes de error ---------- */
function mostrarAviso(texto, tipo) {
  clearTimeout(temporizadorAviso);
  dom.aviso.textContent = texto;
  dom.aviso.className = `aviso aviso--${tipo}`;
  dom.aviso.hidden = false;
  temporizadorAviso = setTimeout(() => {
    dom.aviso.hidden = true;
  }, TIEMPO_AVISO);
}

function mostrarErrores(errores) {
  Object.keys(dom.errores).forEach((campo) => {
    const mensaje = errores[campo] || "";
    const contenedor = dom[campo].closest(".campo");
    dom.errores[campo].textContent = mensaje;
    contenedor.classList.toggle("campo--error", mensaje !== "");
    dom[campo].setAttribute("aria-invalid", mensaje !== "" ? "true" : "false");
  });
}

function limpiarErrorCampo(campo) {
  dom.errores[campo].textContent = "";
  dom[campo].closest(".campo").classList.remove("campo--error");
  dom[campo].setAttribute("aria-invalid", "false");
}

/* ---------- 6. Categorías dependientes del tipo ---------- */
function llenarCategorias(tipo) {
  const lista = CATEGORIAS[tipo];
  dom.categoria.innerHTML = "";

  const inicial = document.createElement("option");
  inicial.value = "";
  inicial.textContent = lista
    ? "Selecciona una categoría"
    : "Primero selecciona el tipo";
  dom.categoria.appendChild(inicial);

  if (lista) {
    lista.forEach((nombre) => {
      const opcion = document.createElement("option");
      opcion.value = nombre;
      opcion.textContent = nombre;
      dom.categoria.appendChild(opcion);
    });
  }
  dom.categoria.disabled = !lista;
}

/* ---------- 7. Validación del formulario ---------- */
function validarFormulario() {
  const errores = {};
  const descripcion = dom.descripcion.value.trim().replace(/\s+/g, " ");
  const tipo = dom.tipo.value;
  const categoria = dom.categoria.value;
  const textoValor = dom.valor.value.trim();
  const fecha = dom.fecha.value;
  let valor = NaN;

  if (descripcion === "") {
    errores.descripcion = "La descripción es obligatoria.";
  } else if (descripcion.length < 3) {
    errores.descripcion = "Escribe al menos 3 caracteres.";
  } else if (descripcion.length > 60) {
    errores.descripcion = "Máximo 60 caracteres.";
  }

  if (dom.valor.validity.badInput) {
    errores.valor = "Ingresa un valor numérico válido.";
  } else if (textoValor === "") {
    errores.valor = "El valor es obligatorio.";
  } else {
    valor = Number(textoValor);
    if (!Number.isFinite(valor)) {
      errores.valor = "Ingresa un valor numérico válido.";
    } else if (valor <= 0) {
      errores.valor = "El valor debe ser mayor que cero.";
    } else if (valor > VALOR_MAXIMO) {
      errores.valor = "El valor es demasiado grande.";
    }
  }

  if (tipo !== "ingreso" && tipo !== "gasto") {
    errores.tipo = "Selecciona el tipo de movimiento.";
  } else if (categoria === "") {
    errores.categoria = "Selecciona una categoría.";
  } else if (!CATEGORIAS[tipo].includes(categoria)) {
    errores.categoria = "La categoría no corresponde al tipo.";
  }

  if (fecha === "") {
    errores.fecha = "La fecha es obligatoria.";
  } else if (!esFechaValida(fecha)) {
    errores.fecha = "La fecha no es válida.";
  } else if (fecha > obtenerFechaHoy()) {
    errores.fecha = "La fecha no puede ser futura.";
  }

  return {
    valido: Object.keys(errores).length === 0,
    errores: errores,
    datos: { descripcion, tipo, categoria, valor: redondear(valor), fecha }
  };
}

/* ---------- 8. Operaciones sobre las transacciones ---------- */
function agregarTransaccion(datos) {
  const nueva = {
    id: generarId(),
    creado: Date.now(),
    descripcion: datos.descripcion,
    tipo: datos.tipo,
    categoria: datos.categoria,
    valor: datos.valor,
    fecha: datos.fecha
  };
  estado.transacciones.push(nueva);
}

function actualizarTransaccion(id, datos) {
  const indice = estado.transacciones.findIndex((t) => t.id === id);
  if (indice === -1) {
    return false;
  }
  const original = estado.transacciones[indice];
  estado.transacciones[indice] = {
    id: original.id,
    creado: original.creado,
    descripcion: datos.descripcion,
    tipo: datos.tipo,
    categoria: datos.categoria,
    valor: datos.valor,
    fecha: datos.fecha
  };
  return true;
}

function eliminarTransaccion(id) {
  const objetivo = estado.transacciones.find((t) => t.id === id);
  if (!objetivo) {
    return;
  }
  const confirmado = window.confirm(
    `¿Deseas eliminar el movimiento "${objetivo.descripcion}"?`
  );
  if (!confirmado) {
    return;
  }
  estado.transacciones = estado.transacciones.filter((t) => t.id !== id);
  if (estado.editandoId === id) {
    salirModoEdicion();
  }
  const guardado = guardarTransacciones();
  renderizarTodo();
  if (guardado) {
    mostrarAviso("Movimiento eliminado correctamente.", "exito");
  }
}

function calcularTotales() {
  const sumar = (tipo) =>
    estado.transacciones
      .filter((t) => t.tipo === tipo)
      .reduce((acumulado, t) => acumulado + t.valor, 0);

  const ingresos = redondear(sumar("ingreso"));
  const gastos = redondear(sumar("gasto"));
  return {
    ingresos: ingresos,
    gastos: gastos,
    saldo: redondear(ingresos - gastos),
    cantidad: estado.transacciones.length
  };
}

function obtenerTransaccionesVisibles() {
  const texto = normalizarTexto(estado.textoBusqueda.trim());

  const lista = estado.transacciones.filter((t) => {
    const coincideTipo =
      estado.filtroActivo === "todos" || t.tipo === estado.filtroActivo;
    const coincideCategoria =
      estado.categoriaFiltro === "todas" ||
      t.categoria === estado.categoriaFiltro;
    const coincideTexto =
      texto === "" || normalizarTexto(t.descripcion).includes(texto);
    return coincideTipo && coincideCategoria && coincideTexto;
  });

  return lista.sort((a, b) => {
    if (a.fecha !== b.fecha) {
      return a.fecha < b.fecha ? 1 : -1;
    }
    return (b.creado || 0) - (a.creado || 0);
  });
}

/* ---------- 9. Renderizado de la interfaz ---------- */
function renderizarResumen() {
  const totales = calcularTotales();
  dom.saldoTotal.textContent = formatoMoneda.format(totales.saldo);
  dom.totalIngresos.textContent = formatoMoneda.format(totales.ingresos);
  dom.totalGastos.textContent = formatoMoneda.format(totales.gastos);
  dom.totalMovimientos.textContent = String(totales.cantidad);

  const negativo = totales.saldo < 0;
  dom.tarjetaSaldo.classList.toggle("saldo-negativo", negativo);
  dom.notaSaldo.textContent = negativo
    ? "Tus gastos superan tus ingresos"
    : "Ingresos menos gastos";
}

function calcularGastosPorCategoria() {
  const porCategoria = estado.transacciones
    .filter((t) => t.tipo === "gasto")
    .reduce((acumulado, t) => {
      acumulado[t.categoria] = (acumulado[t.categoria] || 0) + t.valor;
      return acumulado;
    }, {});

  return Object.entries(porCategoria)
    .map(([categoria, total]) => ({ categoria, total: redondear(total) }))
    .sort((a, b) => b.total - a.total);
}

function renderizarCategorias() {
  const grupos = calcularGastosPorCategoria();
  const totalGastos = grupos.reduce((suma, g) => suma + g.total, 0);

  dom.listaCategorias.innerHTML = "";
  dom.listaCategorias.hidden = grupos.length === 0;
  dom.mensajeCategoriasVacio.hidden = grupos.length > 0;

  grupos.forEach((grupo) => {
    const porcentaje = totalGastos > 0 ? (grupo.total / totalGastos) * 100 : 0;

    const item = document.createElement("div");
    item.className = "categoria";

    const fila = document.createElement("div");
    fila.className = "categoria__fila";

    const nombre = document.createElement("span");
    nombre.className = "categoria__nombre";
    nombre.textContent = grupo.categoria;

    const monto = document.createElement("span");
    monto.className = "categoria__monto";
    const fuerte = document.createElement("strong");
    fuerte.textContent = formatoMoneda.format(grupo.total);
    monto.appendChild(fuerte);
    monto.appendChild(
      document.createTextNode(` · ${porcentaje.toFixed(1).replace(".", ",")} %`)
    );

    fila.appendChild(nombre);
    fila.appendChild(monto);

    const barra = document.createElement("div");
    barra.className = "barra";
    barra.setAttribute("role", "progressbar");
    barra.setAttribute("aria-valuemin", "0");
    barra.setAttribute("aria-valuemax", "100");
    barra.setAttribute("aria-valuenow", porcentaje.toFixed(1));
    barra.setAttribute(
      "aria-label",
      `${grupo.categoria}: ${porcentaje.toFixed(1)} % de los gastos`
    );

    const relleno = document.createElement("div");
    relleno.className = "barra__relleno";
    relleno.style.width = `${porcentaje}%`;
    barra.appendChild(relleno);

    item.appendChild(fila);
    item.appendChild(barra);
    dom.listaCategorias.appendChild(item);
  });
}

function crearCelda(texto, etiqueta, clase) {
  const celda = document.createElement("td");
  celda.setAttribute("data-label", etiqueta);
  celda.textContent = texto;
  if (clase) {
    celda.className = clase;
  }
  return celda;
}

function crearFila(transaccion) {
  const fila = document.createElement("tr");
  const esIngreso = transaccion.tipo === "ingreso";

  if (transaccion.id === estado.editandoId) {
    fila.className = "fila--editando";
  }

  fila.appendChild(crearCelda(formatearFecha(transaccion.fecha), "Fecha"));
  fila.appendChild(crearCelda(transaccion.descripcion, "Descripción"));
  fila.appendChild(crearCelda(transaccion.categoria, "Categoría"));

  const celdaTipo = document.createElement("td");
  celdaTipo.setAttribute("data-label", "Tipo");
  const insignia = document.createElement("span");
  insignia.className = `insignia insignia--${transaccion.tipo}`;
  insignia.textContent = esIngreso ? "Ingreso" : "Gasto";
  celdaTipo.appendChild(insignia);
  fila.appendChild(celdaTipo);

  const signo = esIngreso ? "+ " : "- ";
  fila.appendChild(
    crearCelda(
      signo + formatoMoneda.format(transaccion.valor),
      "Valor",
      `celda-valor valor--${transaccion.tipo}`
    )
  );

  const celdaAccion = document.createElement("td");
  celdaAccion.setAttribute("data-label", "Acción");
  const contenedorAcciones = document.createElement("div");
  contenedorAcciones.className = "acciones-fila";

  const botonEditar = document.createElement("button");
  botonEditar.type = "button";
  botonEditar.className = "btn-editar";
  botonEditar.textContent = "Editar";
  botonEditar.setAttribute("data-id", transaccion.id);
  botonEditar.setAttribute(
    "aria-label",
    `Editar el movimiento ${transaccion.descripcion}`
  );

  const boton = document.createElement("button");
  boton.type = "button";
  boton.className = "btn-eliminar";
  boton.textContent = "Eliminar";
  boton.setAttribute("data-id", transaccion.id);
  boton.setAttribute(
    "aria-label",
    `Eliminar el movimiento ${transaccion.descripcion}`
  );

  contenedorAcciones.appendChild(botonEditar);
  contenedorAcciones.appendChild(boton);
  celdaAccion.appendChild(contenedorAcciones);
  fila.appendChild(celdaAccion);

  return fila;
}

function renderizarTabla() {
  const visibles = obtenerTransaccionesVisibles();
  dom.cuerpoTabla.innerHTML = "";
  visibles.forEach((transaccion) => {
    dom.cuerpoTabla.appendChild(crearFila(transaccion));
  });

  const hayDatos = visibles.length > 0;
  dom.tablaContenedor.hidden = !hayDatos;
  dom.mensajeVacio.hidden = hayDatos;

  if (!hayDatos) {
    dom.mensajeVacio.textContent =
      estado.transacciones.length === 0
        ? "Aún no hay movimientos. Registra tu primer ingreso o gasto."
        : "No hay movimientos que coincidan con los filtros.";
  }
}

function renderizarFiltros() {
  dom.filtros.querySelectorAll("[data-filtro]").forEach((boton) => {
    const activo = boton.dataset.filtro === estado.filtroActivo;
    boton.classList.toggle("activo", activo);
    boton.setAttribute("aria-pressed", String(activo));
  });
}

function renderizarTodo() {
  renderizarResumen();
  renderizarCategorias();
  renderizarFiltros();
  renderizarTabla();
}

/* ---------- 10. Manejadores de eventos ---------- */
function entrarModoEdicion(id) {
  const t = estado.transacciones.find((item) => item.id === id);
  if (!t) {
    return;
  }
  estado.editandoId = id;

  dom.descripcion.value = t.descripcion;
  dom.tipo.value = t.tipo;
  llenarCategorias(t.tipo);
  dom.categoria.value = t.categoria;
  dom.valor.value = String(t.valor);
  dom.fecha.value = t.fecha;
  mostrarErrores({});

  dom.btnGuardar.textContent = "Actualizar movimiento";
  dom.btnLimpiar.textContent = "Cancelar";
  dom.tituloFormulario.textContent = "Editar movimiento";
  dom.panelFormulario.classList.add("panel--editando");

  renderizarTabla();
  dom.panelFormulario.scrollIntoView({ behavior: "smooth", block: "start" });
  dom.descripcion.focus();
}

function salirModoEdicion() {
  estado.editandoId = null;
  dom.btnGuardar.textContent = "Guardar movimiento";
  dom.btnLimpiar.textContent = "Limpiar";
  dom.tituloFormulario.textContent = "Nuevo movimiento";
  dom.panelFormulario.classList.remove("panel--editando");
}

function limpiarFormulario() {
  const estabaEditando = estado.editandoId !== null;
  salirModoEdicion();
  dom.formulario.reset();
  dom.fecha.value = obtenerFechaHoy();
  llenarCategorias("");
  mostrarErrores({});
  if (estabaEditando) {
    renderizarTabla();
  }
}

function manejarEnvio(evento) {
  evento.preventDefault();
  const resultado = validarFormulario();
  mostrarErrores(resultado.errores);

  if (!resultado.valido) {
    mostrarAviso("Revisa los campos marcados en rojo.", "error");
    const primerCampo = Object.keys(resultado.errores)[0];
    dom[primerCampo].focus();
    return;
  }

  const editando = estado.editandoId !== null;
  if (editando) {
    if (!actualizarTransaccion(estado.editandoId, resultado.datos)) {
      mostrarAviso("No se encontró el movimiento que se estaba editando.", "error");
      limpiarFormulario();
      renderizarTodo();
      return;
    }
  } else {
    agregarTransaccion(resultado.datos);
  }
  const guardado = guardarTransacciones();
  limpiarFormulario();
  renderizarTodo();
  if (guardado) {
    mostrarAviso(
      editando
        ? "Movimiento actualizado correctamente."
        : "Movimiento registrado correctamente.",
      "exito"
    );
  }
}

function manejarCambioTipo() {
  llenarCategorias(dom.tipo.value);
  limpiarErrorCampo("tipo");
  limpiarErrorCampo("categoria");
}

function manejarClicFiltros(evento) {
  const boton = evento.target.closest("[data-filtro]");
  if (!boton) {
    return;
  }
  estado.filtroActivo = boton.dataset.filtro;
  renderizarFiltros();
  renderizarTabla();
}

function manejarClicTabla(evento) {
  const botonEditar = evento.target.closest(".btn-editar");
  if (botonEditar) {
    entrarModoEdicion(botonEditar.dataset.id);
    return;
  }
  const boton = evento.target.closest(".btn-eliminar");
  if (!boton) {
    return;
  }
  eliminarTransaccion(boton.dataset.id);
}

function manejarBusqueda() {
  estado.textoBusqueda = dom.busqueda.value;
  renderizarTabla();
}

function manejarFiltroCategoria() {
  estado.categoriaFiltro = dom.filtroCategoria.value;
  renderizarTabla();
}

function llenarFiltroCategorias() {
  dom.filtroCategoria.innerHTML = "";
  const todas = document.createElement("option");
  todas.value = "todas";
  todas.textContent = "Todas las categorías";
  dom.filtroCategoria.appendChild(todas);
  [...CATEGORIAS.ingreso, ...CATEGORIAS.gasto].forEach((nombre) => {
    const opcion = document.createElement("option");
    opcion.value = nombre;
    opcion.textContent = nombre;
    dom.filtroCategoria.appendChild(opcion);
  });
}

function registrarEventos() {
  dom.formulario.addEventListener("submit", manejarEnvio);
  dom.tipo.addEventListener("change", manejarCambioTipo);
  dom.btnLimpiar.addEventListener("click", limpiarFormulario);
  dom.filtros.addEventListener("click", manejarClicFiltros);
  dom.cuerpoTabla.addEventListener("click", manejarClicTabla);
  dom.busqueda.addEventListener("input", manejarBusqueda);
  dom.filtroCategoria.addEventListener("change", manejarFiltroCategoria);

  ["descripcion", "categoria", "valor", "fecha"].forEach((campo) => {
    dom[campo].addEventListener("input", () => limpiarErrorCampo(campo));
    dom[campo].addEventListener("change", () => limpiarErrorCampo(campo));
  });
}

/* ---------- 11. Inicio de la aplicación ---------- */
function iniciar() {
  const hoy = obtenerFechaHoy();
  dom.fecha.max = hoy;
  dom.fecha.value = hoy;
  dom.fechaActual.textContent = new Date().toLocaleDateString("es-CO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  llenarCategorias("");
  llenarFiltroCategorias();
  estado.transacciones = cargarTransacciones();
  registrarEventos();
  renderizarTodo();
}

iniciar();
