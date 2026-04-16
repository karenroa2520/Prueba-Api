let userHistory = [];
let currentUser = null;
let allUsers = []; // guardamos todos los usuarios cargados

document.getElementById('nav-principal')?.classList.add('activo');

async function loadUser() {
  const btn  = document.getElementById('btn');
  const icon = document.getElementById('icon');

  icon.classList.add('spinning');
  btn.disabled = true;

  try {
    // Solo llamamos la API una vez y guardamos todos los usuarios
    if (allUsers.length === 0) {
      const res  = await fetch("https://localhost:7299/api/usuarios");
      allUsers = await res.json();
    }

    // Elegimos uno aleatorio
    const u = allUsers[Math.floor(Math.random() * allUsers.length)];

    const user = {
      fullName: `${u.primerNombre ?? ''} ${u.primerApellido ?? ''}`.trim(),
      city:     u.direccion  ?? 'Sin dirección',
      email:    u.email      ?? 'Sin correo',
      phone:    u.telefono1  ?? 'Sin teléfono',
    };

    userHistory.push(user);
    displayUser(user);
    clearSearch();

  } catch (e) {
    document.getElementById('name').textContent = 'Error al cargar datos';
    console.error('Error:', e);
  }

  icon.classList.remove('spinning');
  btn.disabled = false;
}

function displayUser(user) {
  currentUser = user;

  document.getElementById('name').textContent = user.fullName;

  const badge = document.getElementById('gender-badge');
  if (badge) badge.style.display = 'none';

  document.getElementById('city').textContent  = user.city;
  document.getElementById('email').textContent = user.email;
  document.getElementById('phone').textContent = user.phone;

  // Iniciales con split por espacios múltiples
  const partes = user.fullName.trim().split(/\s+/);
  const iniciales = partes.length >= 2
    ? `${partes[0][0]}${partes[1][0]}`
    : partes[0]?.[0] ?? '?';

  const wrap = document.getElementById('avatar-wrap');
  wrap.innerHTML = `<div class="avatar-iniciales">${iniciales.toUpperCase()}</div>`;
}

function handleSearch(e) {
  const query    = e.target.value.trim().toLowerCase();
  const dropdown = document.getElementById('search-dropdown');

  if (!query) {
    dropdown.innerHTML = '';
    dropdown.classList.remove('visible');
    return;
  }

  const results = userHistory.filter(u =>
    u.fullName.toLowerCase().includes(query) ||
    u.email.toLowerCase().includes(query)
  );

  if (results.length === 0) {
    dropdown.innerHTML = `<div class="search-empty">Sin resultados</div>`;
    dropdown.classList.add('visible');
    return;
  }

  dropdown.innerHTML = results.map((u) => {
    const partes = u.fullName.trim().split(/\s+/);
    const iniciales = partes.length >= 2
      ? `${partes[0][0]}${partes[1][0]}`
      : partes[0]?.[0] ?? '?';

    return `
      <div class="search-item" onclick="selectUser(${userHistory.indexOf(u)})">
        <div class="search-avatar-iniciales">${iniciales.toUpperCase()}</div>
        <div class="search-info">
          <span class="search-name">${u.fullName}</span>
          <span class="search-email">${u.email}</span>
        </div>
      </div>
    `;
  }).join('');

  dropdown.classList.add('visible');
}

function selectUser(index) {
  displayUser(userHistory[index]);
  clearSearch();
}

function clearSearch() {
  const input    = document.getElementById('search-input');
  const dropdown = document.getElementById('search-dropdown');
  if (input) input.value = '';
  if (dropdown) {
    dropdown.innerHTML = '';
    dropdown.classList.remove('visible');
  }
}

document.addEventListener('click', (e) => {
  const container = document.getElementById('search-container');
  if (container && !container.contains(e.target)) {
    const dropdown = document.getElementById('search-dropdown');
    if (dropdown) {
      dropdown.innerHTML = '';
      dropdown.classList.remove('visible');
    }
  }
});

loadUser();