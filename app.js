let userHistory = [];
let currentUser = null;

// Marca el link activo
document.getElementById('nav-principal')?.classList.add('activo');

async function loadUser() {
  const btn  = document.getElementById('btn');
  const icon = document.getElementById('icon');

  icon.classList.add('spinning');
  btn.disabled = true;

  try {
    // Llama al backend propio en vez de randomuser.me directamente
    const res  = await fetch('https://localhost:7299/api/usuarios?cantidad=1');
    const data = await res.json();

    // El backend devuelve el array directo, sin "results"
    const u = data[0];

    const user = {
      fullName: u.nombre,
      gender:   u.genero,
      city:     u.ciudad,
      email:    u.correo,
      phone:    u.celular,
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
  if (user.gender === 'male') {
    badge.textContent = 'Masculino';
    badge.className = 'badge badge-male';
  } else {
    badge.textContent = 'Femenino';
    badge.className = 'badge badge-female';
  }

  document.getElementById('city').textContent  = user.city;
  document.getElementById('email').textContent = user.email;
  document.getElementById('phone').textContent = user.phone;

  // Sin foto — se muestran las iniciales del usuario
  const iniciales = `${user.fullName.split(' ')[0][0]}${user.fullName.split(' ')[1][0]}`;
  const wrap = document.getElementById('avatar-wrap');
  wrap.innerHTML = `<div class="avatar-iniciales">${iniciales}</div>`;
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

  dropdown.innerHTML = results.map((u) => `
    <div class="search-item" onclick="selectUser(${userHistory.indexOf(u)})">
      <div class="search-avatar-iniciales">
        ${u.fullName.split(' ')[0][0]}${u.fullName.split(' ')[1][0]}
      </div>
      <div class="search-info">
        <span class="search-name">${u.fullName}</span>
        <span class="search-email">${u.email}</span>
      </div>
    </div>
  `).join('');

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