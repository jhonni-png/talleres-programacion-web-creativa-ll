const formulario = document.querySelector('#registro');
const resumen = document.querySelector('#resumen');
const estado = document.querySelector('#estado');
const boton = formulario.querySelector('button[type="submit"]');
const campos = [...formulario.elements].filter((el) => el.matches('input'));

const MENSAJES = {
  usuario: {
    valueMissing: 'Escribe un nombre de usuario.',
    tooShort: 'El usuario debe tener al menos 4 caracteres.',
    patternMismatch: 'Usa solo letras, números y guion bajo (_).'
  },
  correo: {
    valueMissing: 'Escribe tu correo electrónico.',
    typeMismatch: 'Escribe un correo con el formato nombre@dominio.com.'
  },
  clave: {
    valueMissing: 'Crea una contraseña.',
    tooShort: 'La contraseña debe tener al menos 8 caracteres.'
  },
  confirmacion: {
    valueMissing: 'Repite la contraseña.',
    noCoincide: 'Las contraseñas no coinciden.'
  }
};
const ORDEN = ['valueMissing', 'typeMismatch', 'patternMismatch', 'tooShort'];

// Devuelve el mensaje de error del campo o una cadena vacía si es correcto
function evaluar(campo) {
  campo.setCustomValidity('');
  const propios = MENSAJES[campo.name];
  if (!campo.validity.valid) {
    const tipo = ORDEN.find((t) => campo.validity[t] && propios[t]);
    return tipo ? propios[tipo] : campo.validationMessage;
  }
  const campoClave = formulario.elements.clave;
  if (campo.name === 'confirmacion' && campo.value !== campoClave.value) {
    return propios.noCoincide;
  }
  return '';
}

// Refleja el estado en el campo: validez, ARIA, mensaje y clases CSS
function mostrar(campo, mensaje) {
  const contenedor = campo.closest('.campo');
  const caja = document.querySelector(`#${campo.id}-msg`);
  const invalido = mensaje !== '';
  campo.setCustomValidity(mensaje);
  campo.setAttribute('aria-invalid', String(invalido));
  caja.textContent = mensaje;
  caja.hidden = !invalido;
  contenedor.classList.toggle('es-invalido', invalido);
  contenedor.classList.toggle('es-valido', !invalido && campo.value !== '');
  return !invalido;
}

function validarCampo(campo) {
  campo.dataset.tocado = 'true';
  return mostrar(campo, evaluar(campo));
}

function limpiar(campo) {
  const contenedor = campo.closest('.campo');
  delete campo.dataset.tocado;
  campo.setCustomValidity('');
  campo.removeAttribute('aria-invalid');
  document.querySelector(`#${campo.id}-msg`).hidden = true;
  contenedor.classList.remove('es-invalido', 'es-valido');
}

// Simula la respuesta de un servidor que rechaza un correo ya registrado
function simularServidor(datos) {
  return new Promise((resolver, rechazar) => {
    setTimeout(() => {
      if (datos.correo.toLowerCase() === 'ocupado@ejemplo.com') {
        rechazar({ campo: 'correo',
          mensaje: 'Este correo ya está registrado. Usa otro o inicia sesión.' });
        return;
      }
      resolver({ ok: true });
    }, 800);
  });
}

async function enviar() {
  const datos = Object.fromEntries(new FormData(formulario));
  boton.disabled = true;
  estado.textContent = 'Enviando...';
  try {
    await simularServidor(datos);
    estado.textContent = 'Cuenta creada correctamente.';
    formulario.reset();
    campos.forEach(limpiar);
  } catch (error) {
    estado.textContent = '';
    const campo = formulario.elements[error.campo];
    campo.dataset.tocado = 'true';
    mostrar(campo, error.mensaje);
    campo.focus();
  } finally {
    boton.disabled = false;
  }
}

for (const campo of campos) {
  campo.addEventListener('blur', () => {
    if (campo.value !== '' || campo.dataset.tocado) validarCampo(campo);
  });
  campo.addEventListener('input', () => {
    if (campo.dataset.tocado) validarCampo(campo);
    const confirmacion = formulario.elements.confirmacion;
    if (campo.name === 'clave' && confirmacion.dataset.tocado) {
      validarCampo(confirmacion);
    }
  });
}

formulario.addEventListener('submit', (evento) => {
  evento.preventDefault();
  estado.textContent = '';
  const invalidos = campos.filter((campo) => !validarCampo(campo));
  if (invalidos.length > 0) {
    resumen.hidden = false;
    resumen.textContent = `Hay ${invalidos.length} campo(s) por corregir.`;
    invalidos.forEach((c) => c.closest('.campo').classList.add('sacudir'));
    invalidos[0].focus();
    return;
  }
  resumen.hidden = true;
  enviar();
});

formulario.addEventListener('animationend', (evento) => {
  evento.target.closest('.campo')?.classList.remove('sacudir');
});
