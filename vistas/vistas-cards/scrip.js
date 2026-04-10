// Marca el link activo
document.getElementById('nav-cards')?.classList.add('activo');

/**
 * usuariosGaleria
 * Almacena los usuarios cargados en la sesión actual.
 * Se reemplaza completo con cada nueva carga.
 */
let usuariosGaleria = [];

/**
 * loadGaleria
 * Lee la cantidad del input, valida que no supere 50,
 * consume la API y renderiza las cards en el grid.
 */
async function loadGaleria() {
  const btn      = document.getElementById('btn-galeria');
  const icon     = document.getElementById('icon-galeria');
  const grid     = document.getElementById('galeria-grid');
  const inputVal = parseInt(document.getElementById('cantidad-input').value);

  if (inputVal > 50) {
    Swal.fire({
      icon: 'error',
      title: 'Límite superado',
      text: 'No puedes cargar más de 50 usuarios a la vez.',
      confirmButtonColor: '#1a1a1a'
    });
    return;
  }

  const cantidad = (!inputVal || inputVal < 1) ? 6 : inputVal;

  icon.classList.add('spinning');
  btn.disabled = true;
  grid.innerHTML = '';

  try {
    const res  = await fetch(`https://randomuser.me/api/?results=${cantidad}`);
    const data = await res.json();

    usuariosGaleria = data.results;
    renderGaleria(usuariosGaleria);

  } catch (e) {
    grid.innerHTML = '<p style="color:#888; text-align:center; grid-column:1/-1;">Error al cargar usuarios.</p>';
    console.error('Error al consumir la API:', e);
  }

  icon.classList.remove('spinning');
  btn.disabled = false;
}

/**
 * renderGaleria
 * Construye y renderiza las cards en el grid.
 * @param {Array} usuarios - Lista de usuarios a renderizar
 */
function renderGaleria(usuarios) {
  const grid = document.getElementById('galeria-grid');
  grid.innerHTML = '';

  if (usuarios.length === 0) {
    grid.innerHTML = '<p style="color:#888; text-align:center; grid-column:1/-1;">Sin resultados.</p>';
    return;
  }

  usuarios.forEach(u => {
    const fullName    = `${u.name.first} ${u.name.last}`;
    const genderClass = u.gender === 'male' ? 'badge-male' : 'badge-female';
    const genderText  = u.gender === 'male' ? 'Masculino' : 'Femenino';

    const card = document.createElement('div');
    card.className = 'galeria-card';
    card.innerHTML = `
      <div class="avatar-wrap">
        <img class="avatar" src="${u.picture.large}" alt="Foto de ${fullName}" />
      </div>
      <div class="header-info">
        <p class="name">${fullName}</p>
        <span class="badge ${genderClass}">${genderText}</span>
      </div>
      <div class="fields">
        <div class="row">
          <span class="label">Ciudad</span>
          <span class="value">${u.location.city}</span>
        </div>
        <div class="row">
          <span class="label">Correo</span>
          <span class="value">${u.email}</span>
        </div>
        <div class="row">
          <span class="label">Celular</span>
          <span class="value">${u.cell}</span>
        </div>
      </div>
    `;

    grid.appendChild(card);
  });
}

/**
 * handleSearchGaleria
 * Filtra las cards por nombre o correo sobre el caché actual.
 * @param {Event} event - Evento del input de búsqueda
 */
function handleSearchGaleria(event) {
  const query = event.target.value.toLowerCase().trim();

  if (!query) {
    renderGaleria(usuariosGaleria);
    return;
  }

  const filtrados = usuariosGaleria.filter(u =>
    `${u.name.first} ${u.name.last}`.toLowerCase().includes(query) ||
    u.email.toLowerCase().includes(query)
  );

  renderGaleria(filtrados);
}

// Carga inicial
loadGaleria();