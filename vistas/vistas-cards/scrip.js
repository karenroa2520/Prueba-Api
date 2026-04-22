// Marca el link "Cards" como activo en la navegación
document.getElementById('nav-cards')?.classList.add('activo');

// Usuarios actualmente visibles en la galería
let usuariosGaleria = [];
// Todos los usuarios traídos de la API (se cargan una sola vez)
let allUsers = [];
// Posición actual en el array para saber desde dónde mostrar el siguiente bloque
let currentOffset = 0;

// Paleta de clases CSS para los colores de los avatares
const AVATAR_COLORS = ['av-0','av-1','av-2','av-3','av-4','av-5','av-6','av-7'];

// Devuelve una clase de color basada en el número de identificación del usuario
// Así cada usuario siempre tiene el mismo color de avatar
function getAvatarColor(id) {
  const num = parseInt(String(id).replace(/\D/g,'')) || 0; // Extrae solo los dígitos del ID
  return AVATAR_COLORS[num % AVATAR_COLORS.length];        // Usa módulo para elegir un color de la paleta
}

// Valida que la cantidad ingresada sea un número válido entre 1 y 50
function validarCantidad(val) {
  if (!val || isNaN(val) || val <= 0) {
    // Muestra alerta si el valor no es un número positivo
    Swal.fire({ icon: 'warning', title: 'Cantidad inválida', text: 'Ingresa un número mayor a 0.', confirmButtonColor: '#1a1a1a' });
    return false;
  }
  if (val > 50) {
    // Muestra alerta si supera el límite permitido
    Swal.fire({ icon: 'error', title: 'Límite superado', text: 'No puedes cargar más de 50 usuarios a la vez.', confirmButtonColor: '#1a1a1a' });
    return false;
  }
  return true;
}

// Carga y muestra los usuarios en la galería
async function loadGaleria() {
  const btn      = document.getElementById('btn-galeria');
  const icon     = document.getElementById('icon-galeria');
  const grid     = document.getElementById('galeria-grid');
  const inputVal = parseInt(document.getElementById('cantidad-input').value); // Cantidad ingresada por el usuario

  // Si la cantidad no es válida, detiene la ejecución
  if (!validarCantidad(inputVal)) return;

  // Activa el ícono girando y deshabilita el botón mientras carga
  icon.classList.add('spinning');
  btn.disabled = true;
  grid.innerHTML = ''; // Limpia el grid antes de renderizar

  try {
    if (allUsers.length === 0) {
      // Primera carga: trae todos los usuarios de la API
      const res = await fetch("https://localhost:7299/api/usuarios");
      allUsers = await res.json();
      currentOffset = 0; // Empieza desde el principio
    } else {
      // Cargas siguientes: avanza el offset para mostrar el siguiente bloque
      currentOffset = (currentOffset + inputVal) % allUsers.length;
    }

    // Selecciona 'inputVal' usuarios en orden desde el offset actual
    // El módulo (%) hace que cuando llega al final vuelva al inicio
    usuariosGaleria = [];
    for (let i = 0; i < inputVal; i++) {
      usuariosGaleria.push(allUsers[(currentOffset + i) % allUsers.length]);
    }

    renderGaleria(usuariosGaleria);

  } catch (e) {
    // Muestra mensaje de error en el grid si falla la petición
    grid.innerHTML = '<p style="color:#9ca3af; text-align:center; grid-column:1/-1; padding:2rem;">Error al cargar usuarios.</p>';
    console.error('Error:', e);
  }

  // Detiene el ícono girando y rehabilita el botón
  icon.classList.remove('spinning');
  btn.disabled = false;
}

// Construye y muestra las cards en el grid
function renderGaleria(usuarios) {
  const grid = document.getElementById('galeria-grid');
  grid.innerHTML = '';

  if (usuarios.length === 0) {
    grid.innerHTML = '<p style="color:#9ca3af; text-align:center; grid-column:1/-1; padding:2rem;">Sin resultados.</p>';
    return;
  }

  usuarios.forEach(u => {
    // Construye el nombre completo, si no tiene nombre muestra "Sin nombre"
    const fullName   = `${u.primerNombre ?? ''} ${u.primerApellido ?? ''}`.trim() || 'Sin nombre';

    // Divide el nombre en partes para extraer las iniciales
    const partes     = fullName.split(/\s+/);
    const iniciales  = partes.length >= 2
      ? `${partes[0][0]}${partes[1][0]}`  // Toma la primera letra de cada palabra
      : partes[0]?.[0] ?? '?';            // Si solo hay una palabra, toma su inicial

    // Obtiene el color del avatar según el ID del usuario
    const colorClass = getAvatarColor(u.noIdentificacion);

    // Crea el elemento div de la card y le asigna el HTML con los datos del usuario
    const card = document.createElement('div');
    card.className = 'galeria-card';
    card.innerHTML = `
      <div class="avatar-iniciales ${colorClass}">${iniciales.toUpperCase()}</div>
      <div class="header-info" style="text-align:center;">
        <p class="name">${fullName}</p>
        <span class="id-badge">ID: ${u.noIdentificacion ?? 'N/A'}</span>
      </div>
      <div class="fields">
        <div class="row">
          <span class="label">Dirección</span>
          <span class="value">${u.direccion ?? '—'}</span>
        </div>
        <div class="row">
          <span class="label">Correo</span>
          <span class="value">${u.email ?? '—'}</span>
        </div>
        <div class="row">
          <span class="label">Teléfono</span>
          <span class="value">${u.telefono1 ?? '—'}</span>
        </div>
      </div>
      <a href="/vistas/vista-detalle/detalle.html?id=${u.noIdentificacion}" class="btn-detalle-card">
        👁 Ver detalles
      </a>`;

    // Agrega la card al grid
    grid.appendChild(card);
  });
}

// Filtra las cards visibles según lo que el usuario escribe en el buscador
function handleSearchGaleria(event) {
  const query = event.target.value.toLowerCase().trim();

  // Si el buscador está vacío, muestra todos los usuarios del bloque actual
  if (!query) { renderGaleria(usuariosGaleria); return; }

  // Filtra por nombre completo o correo
  const filtrados = usuariosGaleria.filter(u => {
    const fullName = `${u.primerNombre ?? ''} ${u.primerApellido ?? ''}`.toLowerCase();
    return fullName.includes(query) || (u.email ?? '').toLowerCase().includes(query);
  });

  renderGaleria(filtrados);
}

// Ejecuta la carga inicial al abrir la página
loadGaleria();