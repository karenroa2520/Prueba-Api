let userHistory = [];
let currentUser = null;

async function loadUser() {
  const btn = document.getElementById('btn');
  const icon = document.getElementById('icon');

  icon.classList.add('spinning');
  btn.disabled = true;

  try {
    const res = await fetch('https://randomuser.me/api/?results=1');
    const data = await res.json();
    const u = data.results[0];

    const user = {
      fullName: `${u.name.first} ${u.name.last}`,
      gender: u.gender,
      city: u.location.city,
      email: u.email,
      phone: u.cell,
      photo: u.picture.large,
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

  document.getElementById('city').textContent = user.city;
  document.getElementById('email').textContent = user.email;
  document.getElementById('phone').textContent = user.phone;

  const wrap = document.getElementById('avatar-wrap');
  wrap.innerHTML = `<img class="avatar" src="${user.photo}" alt="Foto de ${user.fullName}" />`;
}

function handleSearch(e) {
  const query = e.target.value.trim().toLowerCase();
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

  dropdown.innerHTML = results.map((u, i) => `
    <div class="search-item" onclick="selectUser(${userHistory.indexOf(u)})">
      <img src="${u.photo}" alt="${u.fullName}" class="search-avatar" />
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
  const input = document.getElementById('search-input');
  const dropdown = document.getElementById('search-dropdown');
  if (input) input.value = '';
  if (dropdown) {
    dropdown.innerHTML = '';
    dropdown.classList.remove('visible');
  }
}

// Cerrar dropdown al hacer click fuera
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