/* ==========================================================
   TALLER 12 - CARRITO DE COMPRAS INTERACTIVO
   Universidad de Caldas · Programación Web Creativa II
   ========================================================== */

"use strict";

/* ---------- 1. CONSTANTES ---------- */
const TASA_IVA = 0.19;
const CLAVE_ALMACENAMIENTO = "taller12_carrito_tecnomarket";

/* ---------- 2. CATÁLOGO DE PRODUCTOS (ARRAY DE OBJETOS) ---------- */
const productos = [
  {
    id: 1,
    nombre: "Audífonos Bluetooth Pro",
    descripcion: "Cancelación de ruido, 30 horas de batería y micrófono integrado.",
    precio: 189900,
    categoria: "Audio",
    icono: "🎧",
    fondo: "linear-gradient(135deg, #ff9a3c, #ff6a00)"
  },
  {
    id: 2,
    nombre: "Smartwatch Fit Series",
    descripcion: "Monitor de ritmo cardíaco, GPS y resistencia al agua.",
    precio: 259900,
    categoria: "Wearables",
    icono: "⌚",
    fondo: "linear-gradient(135deg, #3b82f6, #1e3a8a)"
  },
  {
    id: 3,
    nombre: "Teclado Mecánico RGB",
    descripcion: "Switches rojos, iluminación personalizable y diseño compacto.",
    precio: 229900,
    categoria: "Periféricos",
    icono: "⌨️",
    fondo: "linear-gradient(135deg, #8b5cf6, #4c1d95)"
  },
  {
    id: 4,
    nombre: "Mouse Inalámbrico Ergo",
    descripcion: "Diseño ergonómico, sensor de alta precisión y batería recargable.",
    precio: 89900,
    categoria: "Periféricos",
    icono: "🖱️",
    fondo: "linear-gradient(135deg, #14b8a6, #0f766e)"
  },
  {
    id: 5,
    nombre: "Monitor LED 24 pulgadas",
    descripcion: "Resolución Full HD, 75 Hz y entradas HDMI y VGA.",
    precio: 679900,
    categoria: "Pantallas",
    icono: "🖥️",
    fondo: "linear-gradient(135deg, #0ea5e9, #0b2545)"
  },
  {
    id: 6,
    nombre: "Cámara Web Full HD",
    descripcion: "Video a 1080p, enfoque automático y micrófono con reducción de ruido.",
    precio: 149900,
    categoria: "Video",
    icono: "📷",
    fondo: "linear-gradient(135deg, #f43f5e, #9f1239)"
  },
  {
    id: 7,
    nombre: "Parlante Portátil Splash",
    descripcion: "Sonido de 360 grados, resistente al agua y 12 horas de reproducción.",
    precio: 129900,
    categoria: "Audio",
    icono: "🔊",
    fondo: "linear-gradient(135deg, #fbbf24, #d97706)"
  },
  {
    id: 8,
    nombre: "Power Bank 20.000 mAh",
    descripcion: "Carga rápida, dos puertos USB y un puerto USB-C de alta potencia.",
    precio: 119900,
    categoria: "Energía",
    icono: "🔋",
    fondo: "linear-gradient(135deg, #22c55e, #166534)"
  }
];

/* ---------- 3. ESTADO DE LA APLICACIÓN ---------- */
// Cada elemento del carrito tiene la forma: { id: 1, cantidad: 2 }
let carrito = [];
let temporizadorNotificacion = null;

/* ---------- 4. REFERENCIAS AL DOM ---------- */
const listaProductos = document.getElementById("lista-productos");
const contadorCarrito = document.getElementById("contador-carrito");
const btnAbrirCarrito = document.getElementById("btn-abrir-carrito");
const btnCerrarCarrito = document.getElementById("btn-cerrar-carrito");
const btnSeguirComprando = document.getElementById("btn-seguir-comprando");
const panelCarrito = document.getElementById("panel-carrito");
const fondoOscuro = document.getElementById("fondo-oscuro");
const carritoVacio = document.getElementById("carrito-vacio");
const carritoItems = document.getElementById("carrito-items");
const carritoResumen = document.getElementById("carrito-resumen");
const valorSubtotal = document.getElementById("valor-subtotal");
const valorIva = document.getElementById("valor-iva");
const valorTotal = document.getElementById("valor-total");
const btnFinalizar = document.getElementById("btn-finalizar");
const btnVaciar = document.getElementById("btn-vaciar");
const modalCompra = document.getElementById("modal-compra");
const modalNumero = document.getElementById("modal-numero");
const modalDetalle = document.getElementById("modal-detalle");
const modalSubtotal = document.getElementById("modal-subtotal");
const modalIva = document.getElementById("modal-iva");
const modalTotal = document.getElementById("modal-total");
const btnCerrarModal = document.getElementById("btn-cerrar-modal");
const notificacion = document.getElementById("notificacion");

/* ---------- 5. FUNCIONES AUXILIARES ---------- */
function formatearPrecio(valor) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(valor);
}

function buscarProducto(id) {
  return productos.find(function (producto) {
    return producto.id === id;
  });
}

function mostrarNotificacion(mensaje) {
  notificacion.textContent = mensaje;
  notificacion.classList.add("visible");

  clearTimeout(temporizadorNotificacion);
  temporizadorNotificacion = setTimeout(function () {
    notificacion.classList.remove("visible");
  }, 2200);
}

/* ---------- 6. LOCALSTORAGE ---------- */
function guardarCarrito() {
  try {
    localStorage.setItem(CLAVE_ALMACENAMIENTO, JSON.stringify(carrito));
  } catch (error) {
    console.warn("No fue posible guardar el carrito:", error);
  }
}

function cargarCarrito() {
  try {
    const guardado = localStorage.getItem(CLAVE_ALMACENAMIENTO);

    if (!guardado) {
      return [];
    }

    const datos = JSON.parse(guardado);

    if (!Array.isArray(datos)) {
      return [];
    }

    // Se conservan solo los elementos válidos y que existan en el catálogo
    return datos
      .filter(function (item) {
        return (
          item &&
          Number.isInteger(item.id) &&
          Number.isInteger(item.cantidad) &&
          item.cantidad > 0 &&
          buscarProducto(item.id) !== undefined
        );
      })
      .map(function (item) {
        return { id: item.id, cantidad: item.cantidad };
      });
  } catch (error) {
    console.warn("No fue posible leer el carrito guardado:", error);
    return [];
  }
}

/* ---------- 7. RENDERIZADO DEL CATÁLOGO ---------- */
function renderizarProductos() {
  listaProductos.innerHTML = "";

  productos.forEach(function (producto) {
    const tarjeta = document.createElement("article");
    tarjeta.className = "tarjeta";

    tarjeta.innerHTML = `
      <div class="tarjeta__imagen" style="background: ${producto.fondo};">
        <span class="tarjeta__categoria">${producto.categoria}</span>
        <span class="tarjeta__emoji" aria-hidden="true">${producto.icono}</span>
      </div>
      <div class="tarjeta__cuerpo">
        <h3 class="tarjeta__nombre">${producto.nombre}</h3>
        <p class="tarjeta__descripcion">${producto.descripcion}</p>
        <div class="tarjeta__pie">
          <p class="tarjeta__precio">
            ${formatearPrecio(producto.precio)}
            <small>Precio antes de IVA</small>
          </p>
          <button class="btn btn--naranja btn-agregar" type="button" data-id="${producto.id}">
            🛒 Agregar al carrito
          </button>
        </div>
      </div>
    `;

    listaProductos.appendChild(tarjeta);
  });
}

/* ---------- 8. LÓGICA DEL CARRITO ---------- */
function agregarAlCarrito(id) {
  const producto = buscarProducto(id);

  if (!producto) {
    return;
  }

  const existente = carrito.find(function (item) {
    return item.id === id;
  });

  if (existente) {
    existente.cantidad += 1;
  } else {
    carrito.push({ id: id, cantidad: 1 });
  }

  guardarCarrito();
  renderizarCarrito();
  animarContador();
  mostrarNotificacion("✔ " + producto.nombre + " agregado al carrito");
}

function cambiarCantidad(id, cambio) {
  const item = carrito.find(function (elemento) {
    return elemento.id === id;
  });

  if (!item) {
    return;
  }

  item.cantidad += cambio;

  // Si la cantidad llega a cero, el producto se elimina del carrito
  if (item.cantidad <= 0) {
    eliminarProducto(id);
    return;
  }

  guardarCarrito();
  renderizarCarrito();
}

function eliminarProducto(id) {
  carrito = carrito.filter(function (item) {
    return item.id !== id;
  });

  guardarCarrito();
  renderizarCarrito();
  mostrarNotificacion("Producto eliminado del carrito");
}

function vaciarCarrito() {
  if (carrito.length === 0) {
    mostrarNotificacion("El carrito ya está vacío");
    return;
  }

  carrito = [];
  guardarCarrito();
  renderizarCarrito();
  mostrarNotificacion("Carrito vaciado");
}

function contarUnidades() {
  return carrito.reduce(function (acumulado, item) {
    return acumulado + item.cantidad;
  }, 0);
}

function calcularTotales() {
  const subtotal = carrito.reduce(function (acumulado, item) {
    const producto = buscarProducto(item.id);
    return acumulado + producto.precio * item.cantidad;
  }, 0);

  const iva = Math.round(subtotal * TASA_IVA);
  const total = subtotal + iva;

  return { subtotal: subtotal, iva: iva, total: total };
}

/* ---------- 9. RENDERIZADO DEL CARRITO ---------- */
function renderizarCarrito() {
  carritoItems.innerHTML = "";

  carrito.forEach(function (item) {
    const producto = buscarProducto(item.id);
    const subtotalItem = producto.precio * item.cantidad;

    const elemento = document.createElement("li");
    elemento.className = "item";

    elemento.innerHTML = `
      <div class="item__miniatura" style="background: ${producto.fondo};" aria-hidden="true">
        ${producto.icono}
      </div>
      <div class="item__info">
        <p class="item__nombre">${producto.nombre}</p>
        <p class="item__precio">${formatearPrecio(producto.precio)} c/u</p>
        <p class="item__subtotal">${formatearPrecio(subtotalItem)}</p>
      </div>
      <div class="item__acciones">
        <div class="cantidad">
          <button class="cantidad__btn"
            type="button"
            data-accion="disminuir"
            data-id="${producto.id}"
            aria-label="Disminuir cantidad de ${producto.nombre}">−</button>
          <span class="cantidad__valor">${item.cantidad}</span>
          <button class="cantidad__btn"
            type="button"
            data-accion="aumentar"
            data-id="${producto.id}"
            aria-label="Aumentar cantidad de ${producto.nombre}">+</button>
        </div>
        <button class="btn-eliminar"
          type="button"
          data-accion="eliminar"
          data-id="${producto.id}">Eliminar</button>
      </div>
    `;

    carritoItems.appendChild(elemento);
  });

  const hayProductos = carrito.length > 0;
  carritoVacio.hidden = hayProductos;
  carritoItems.hidden = !hayProductos;
  carritoResumen.hidden = !hayProductos;

  const totales = calcularTotales();
  valorSubtotal.textContent = formatearPrecio(totales.subtotal);
  valorIva.textContent = formatearPrecio(totales.iva);
  valorTotal.textContent = formatearPrecio(totales.total);

  contadorCarrito.textContent = contarUnidades();
}

function animarContador() {
  contadorCarrito.classList.remove("animar");
  // Se fuerza un reflujo para poder reiniciar la animación
  void contadorCarrito.offsetWidth;
  contadorCarrito.classList.add("animar");
}

/* ---------- 10. PANEL DEL CARRITO ---------- */
function abrirCarrito() {
  panelCarrito.classList.add("abierto");
  panelCarrito.setAttribute("aria-hidden", "false");
  fondoOscuro.classList.add("visible");
  document.body.classList.add("bloqueado");
}

function cerrarCarrito() {
  panelCarrito.classList.remove("abierto");
  panelCarrito.setAttribute("aria-hidden", "true");
  fondoOscuro.classList.remove("visible");
  document.body.classList.remove("bloqueado");
}

/* ---------- 11. COMPRA SIMULADA ---------- */
function finalizarCompra() {
  if (carrito.length === 0) {
    mostrarNotificacion("Agrega productos antes de finalizar la compra");
    return;
  }

  const totales = calcularTotales();
  const numeroPedido = "#" + Math.floor(100000 + Math.random() * 900000);

  modalDetalle.innerHTML = "";

  carrito.forEach(function (item) {
    const producto = buscarProducto(item.id);
    const linea = document.createElement("li");

    linea.innerHTML = `
      <span>${item.cantidad} × ${producto.nombre}</span>
      <span>${formatearPrecio(producto.precio * item.cantidad)}</span>
    `;

    modalDetalle.appendChild(linea);
  });

  modalNumero.textContent = numeroPedido;
  modalSubtotal.textContent = formatearPrecio(totales.subtotal);
  modalIva.textContent = formatearPrecio(totales.iva);
  modalTotal.textContent = formatearPrecio(totales.total);

  // Se vacía el carrito porque la compra ya fue "realizada"
  carrito = [];
  guardarCarrito();
  renderizarCarrito();
  cerrarCarrito();

  modalCompra.classList.add("visible");
  modalCompra.setAttribute("aria-hidden", "false");
  document.body.classList.add("bloqueado");
}

function cerrarModal() {
  modalCompra.classList.remove("visible");
  modalCompra.setAttribute("aria-hidden", "true");
  document.body.classList.remove("bloqueado");
}

/* ---------- 12. EVENTOS ---------- */
// Delegación de eventos: botones "Agregar al carrito" del catálogo
listaProductos.addEventListener("click", function (evento) {
  const boton = evento.target.closest(".btn-agregar");

  if (boton) {
    agregarAlCarrito(Number(boton.dataset.id));
  }
});

// Delegación de eventos: botones dentro del carrito (+, −, Eliminar)
carritoItems.addEventListener("click", function (evento) {
  const boton = evento.target.closest("button[data-accion]");

  if (!boton) {
    return;
  }

  const id = Number(boton.dataset.id);
  const accion = boton.dataset.accion;

  if (accion === "aumentar") {
    cambiarCantidad(id, 1);
  } else if (accion === "disminuir") {
    cambiarCantidad(id, -1);
  } else if (accion === "eliminar") {
    eliminarProducto(id);
  }
});

btnAbrirCarrito.addEventListener("click", abrirCarrito);
btnCerrarCarrito.addEventListener("click", cerrarCarrito);
fondoOscuro.addEventListener("click", cerrarCarrito);

btnSeguirComprando.addEventListener("click", function () {
  cerrarCarrito();
  document.getElementById("catalogo").scrollIntoView({ behavior: "smooth" });
});

btnVaciar.addEventListener("click", vaciarCarrito);
btnFinalizar.addEventListener("click", finalizarCompra);
btnCerrarModal.addEventListener("click", cerrarModal);

modalCompra.addEventListener("click", function (evento) {
  if (evento.target === modalCompra) {
    cerrarModal();
  }
});

document.addEventListener("keydown", function (evento) {
  if (evento.key === "Escape") {
    cerrarModal();
    cerrarCarrito();
  }
});

/* ---------- 13. INICIALIZACIÓN ---------- */
function iniciarAplicacion() {
  carrito = cargarCarrito();
  renderizarProductos();
  renderizarCarrito();
}

iniciarAplicacion();