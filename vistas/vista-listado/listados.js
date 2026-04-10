// Marca el link activo
document.getElementById('nav-listado')?.classList.add('activo');

/**
 * usuariosListado
 * Almacena los usuarios cargados en la sesión actual del listado.
 * Se reemplaza completo con cada nueva carga.
 */
let usuariosListado = [];

/**
 * loadListado
 * Lee la cantidad del input, valida que no supere 200,
 * consume la API y renderiza las filas en la tabla.
 */
async function loadListado() {
  const btn      = document.getElementById('btn-listado');
  const icon     = document.getElementById('icon-listado');
  const tbody    = document.getElementById('listado-body');
  const inputVal = parseInt(document.getElementById('cantidad-input').value);

  if (inputVal > 200) {
    Swal.fire({
      icon: 'error',
      title: 'Límite superado',
      text: 'No puedes cargar más de 200 usuarios a la vez.',
      confirmButtonColor: '#1a1a1a'
    });
    return;
  }

  const cantidad = (!inputVal || inputVal < 1) ? 10 : inputVal;

  icon.classList.add('spinning');
  btn.disabled = true;
  tbody.innerHTML = '<tr><td colspan="6" class="listado-empty">Cargando...</td></tr>';

  try {
    const res  = await fetch(`https://randomuser.me/api/?results=${cantidad}`);
    const data = await res.json();

    usuariosListado = data.results;
    renderListado(usuariosListado);

  } catch (e) {
    tbody.innerHTML = '<tr><td colspan="6" class="listado-empty">Error al cargar usuarios.</td></tr>';
    console.error('Error al consumir la API:', e);
  }

  icon.classList.remove('spinning');
  btn.disabled = false;
}

/**
 * renderListado
 * Construye y renderiza las filas de la tabla.
 * @param {Array} usuarios - Lista de usuarios a renderizar
 */
function renderListado(usuarios) {
  const tbody = document.getElementById('listado-body');
  tbody.innerHTML = '';

  if (usuarios.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="listado-empty">Sin resultados.</td></tr>';
    return;
  }

  usuarios.forEach(u => {
    const fullName    = `${u.name.first} ${u.name.last}`;
    const genderClass = u.gender === 'male' ? 'badge-male' : 'badge-female';
    const genderText  = u.gender === 'male' ? 'Masculino' : 'Femenino';

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><img class="listado-avatar" src="${u.picture.medium}" alt="Foto de ${fullName}" /></td>
      <td class="listado-name">${fullName}</td>
      <td><span class="badge ${genderClass}">${genderText}</span></td>
      <td>${u.location.city}</td>
      <td>${u.email}</td>
      <td>${u.cell}</td>
    `;

    tbody.appendChild(tr);
  });
}

/**
 * handleSearchListado
 * Filtra las filas por nombre o correo sobre el caché actual.
 * @param {Event} event - Evento del input de búsqueda
 */
function handleSearchListado(event) {
  const query = event.target.value.toLowerCase().trim();

  if (!query) {
    renderListado(usuariosListado);
    return;
  }

  const filtrados = usuariosListado.filter(u =>
    `${u.name.first} ${u.name.last}`.toLowerCase().includes(query) ||
    u.email.toLowerCase().includes(query)
  );

  renderListado(filtrados);
}

// Carga inicial
loadListado();