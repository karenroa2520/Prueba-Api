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
 * consume el backend y renderiza las cards en el grid.
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
    // Llama al backend propio en vez de randomuser.me directamente
    const res  = await fetch(`https://localhost:7299/api/usuarios?cantidad=${cantidad}`);
    const data = await res.json();

    // El backend devuelve el array directo, sin "results"
    usuariosGaleria = data;

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
    // El backend ya devuelve los campos en español
    const fullName    = u.nombre;
    const genderClass = u.genero === 'male' ? 'badge-male' : 'badge-female';
    const genderText  = u.genero === 'male' ? 'Masculino' : 'Femenino';

    // Iniciales para el avatar ya que el backend no devuelve foto
    const iniciales = `${fullName.split(' ')[0][0]}${fullName.split(' ')[1][0]}`;

    const card = document.createElement('div');
    card.className = 'galeria-card';
    card.innerHTML = `
      <div class="avatar-wrap">
        <div class="avatar-iniciales">${iniciales}</div>
      </div>
      <div class="header-info">
        <p class="name">${fullName}</p>
        <span class="badge ${genderClass}">${genderText}</span>
      </div>
      <div class="fields">
        <div class="row">
          <span class="label">Ciudad</span>
          <span class="value">${u.ciudad}</span>
        </div>
        <div class="row">
          <span class="label">Correo</span>
          <span class="value">${u.correo}</span>
        </div>
        <div class="row">
          <span class="label">Celular</span>
          <span class="value">${u.celular}</span>
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
    u.nombre.toLowerCase().includes(query) ||
    u.correo.toLowerCase().includes(query)
  );

  renderGaleria(filtrados);
}

// Carga inicial
loadGaleria();