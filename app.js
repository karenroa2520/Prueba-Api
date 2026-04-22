// Historial de usuarios visitados en la sesión actual
let userHistory = [];
// Usuario actualmente visible en pantalla
let currentUser = null;
// Todos los usuarios traídos de la API (se cargan una sola vez)
let allUsers = [];
// Índice del usuario actual dentro de allUsers
let currentIndex = 0;

// Paleta de clases CSS para los colores de los avatares
const AVATAR_COLORS = ['av-0','av-1','av-2','av-3','av-4','av-5','av-6','av-7'];

// Devuelve una clase de color basada en el número de identificación del usuario
// Así cada usuario siempre tiene el mismo color de avatar
function getAvatarColor(id) {
  const num = parseInt(String(id).replace(/\D/g,'')) || 0; // Extrae solo los dígitos del ID
  return AVATAR_COLORS[num % AVATAR_COLORS.length];        // Usa módulo para elegir un color de la paleta
}

// Marca el link "Principal" como activo en la navegación
document.getElementById('nav-principal')?.classList.add('activo');

// Carga el siguiente usuario y lo muestra en pantalla
async function loadUser() {
  const btn  = document.getElementById('btn');
  const icon = document.getElementById('icon');

  // Activa el ícono girando y deshabilita el botón mientras carga
  icon.classList.add('spinning');
  btn.disabled = true;

  try {
    if (allUsers.length === 0) {
      // Primera carga: trae todos los usuarios de la API
      const res = await fetch("https://localhost:7299/api/usuarios?cantidad=200");
      allUsers = await res.json();
      currentIndex = 0; // Empieza desde el primer usuario
    } else {
      // Cargas siguientes: avanza al siguiente usuario en orden
      // El módulo (%) hace que cuando llega al final vuelva al inicio
      currentIndex = (currentIndex + 1) % allUsers.length;
    }

    // Toma el usuario en la posición actual
    const u = allUsers[currentIndex];

    // Construye el objeto usuario con los campos necesarios para la vista
    // '??' muestra un valor por defecto si el campo viene vacío o nulo
    const user = {
      id:       u.noIdentificacion ?? '',
      fullName: `${u.primerNombre ?? ''} ${u.primerApellido ?? ''}`.trim(),
      city:     u.direccion  ?? 'Sin dirección',
      email:    u.email      ?? 'Sin correo',
      phone:    u.telefono1  ?? 'Sin teléfono',
    };

    // Agrega el usuario al historial de búsqueda
    userHistory.push(user);
    displayUser(user);
    clearSearch(); // Limpia el buscador al cargar un nuevo usuario

  } catch (e) {
    // Muestra mensaje de error si falla la petición
    document.getElementById('name').textContent = 'Error al cargar datos';
    console.error('Error:', e);
  }

  // Detiene el ícono girando y rehabilita el botón
  icon.classList.remove('spinning');
  btn.disabled = false;
}

// Muestra los datos del usuario en la tarjeta principal
function displayUser(user) {
  currentUser = user;

  // Muestra el nombre completo
  document.getElementById('name').textContent = user.fullName || 'Sin nombre';

  // Oculta el badge de género ya que no existe en la BD
  const badge = document.getElementById('gender-badge');
  if (badge) badge.style.display = 'none';

  // Rellena los campos de la tarjeta
  document.getElementById('city').textContent  = user.city;
  document.getElementById('email').textContent = user.email;
  document.getElementById('phone').textContent = user.phone;

  // Muestra el número de identificación debajo del nombre
  const idEl = document.getElementById('id-badge');
  if (idEl) idEl.textContent = user.id ? `ID: ${user.id}` : '';

  // Genera las iniciales del nombre para el avatar
  const partes   = user.fullName.trim().split(/\s+/);
  const iniciales = partes.length >= 2
    ? `${partes[0][0]}${partes[1][0]}`  // Primera letra de cada palabra
    : (partes[0]?.[0] ?? '?');          // Si solo hay una palabra, toma su inicial

  // Asigna el color del avatar según el ID del usuario
  const colorClass = getAvatarColor(user.id);

  // Renderiza el avatar con las iniciales y el color correspondiente
  const wrap = document.getElementById('avatar-wrap');
  wrap.innerHTML = `<div class="avatar-iniciales ${colorClass}">${iniciales.toUpperCase()}</div>`;
}

// Filtra el historial de usuarios según lo que se escribe en el buscador
function handleSearch(e) {
  const query    = e.target.value.trim().toLowerCase();
  const dropdown = document.getElementById('search-dropdown');

  // Si el buscador está vacío, oculta el dropdown
  if (!query) {
    dropdown.innerHTML = '';
    dropdown.classList.remove('visible');
    return;
  }

  // Busca en el historial por nombre completo o correo
  const results = userHistory.filter(u =>
    u.fullName.toLowerCase().includes(query) ||
    u.email.toLowerCase().includes(query)
  );

  if (results.length === 0) {
    dropdown.innerHTML = `<div class="search-empty">Sin resultados</div>`;
    dropdown.classList.add('visible');
    return;
  }

  // Construye las opciones del dropdown con avatar, nombre y correo
  dropdown.innerHTML = results.map((u, i) => {
    const partes    = u.fullName.trim().split(/\s+/);
    const iniciales = partes.length >= 2 ? `${partes[0][0]}${partes[1][0]}` : partes[0]?.[0] ?? '?';
    const colorClass = getAvatarColor(u.id);
    return `
      <div class="search-item" onclick="selectUser(${userHistory.indexOf(u)})">
        <div class="search-avatar-iniciales ${colorClass}">${iniciales.toUpperCase()}</div>
        <div class="search-info">
          <span class="search-name">${u.fullName}</span>
          <span class="search-email">${u.email}</span>
        </div>
      </div>`;
  }).join('');

  dropdown.classList.add('visible');
}

// Muestra el usuario seleccionado desde el dropdown del buscador
function selectUser(index) {
  displayUser(userHistory[index]);
  clearSearch();
}

// Limpia el input y oculta el dropdown del buscador
function clearSearch() {
  const input    = document.getElementById('search-input');
  const dropdown = document.getElementById('search-dropdown');
  if (input) input.value = '';
  if (dropdown) { dropdown.innerHTML = ''; dropdown.classList.remove('visible'); }
}

// Cierra el dropdown si el usuario hace clic fuera del buscador
document.addEventListener('click', (e) => {
  const container = document.getElementById('search-container');
  if (container && !container.contains(e.target)) {
    const dropdown = document.getElementById('search-dropdown');
    if (dropdown) { dropdown.innerHTML = ''; dropdown.classList.remove('visible'); }
  }
});



// Redirige a la vista de detalle pasando el ID del usuario actual
function verDetalle() {
  if (!currentUser || !currentUser.id) return;
  window.location.href = `/vistas/vista-detalle/detalle.html?id=${currentUser.id}`;
}

// Ejecuta la carga inicial al abrir la página
loadUser();