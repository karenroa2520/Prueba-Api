document.getElementById('nav-listado')?.classList.add('activo');

let usuariosListado = [];
let allUsers = [];

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
  tbody.innerHTML = '<tr><td colspan="5" class="listado-empty">Cargando...</td></tr>';

  try {
    // Solo llama la API una vez
    if (allUsers.length === 0) {
      const res = await fetch("https://localhost:7299/api/usuarios");
      allUsers = await res.json();
    }

    // Selecciona 'cantidad' usuarios aleatorios sin repetir
    const shuffled = [...allUsers].sort(() => Math.random() - 0.5);
    usuariosListado = shuffled.slice(0, cantidad);

    renderListado(usuariosListado);

  } catch (e) {
    tbody.innerHTML = '<tr><td colspan="5" class="listado-empty">Error al cargar usuarios.</td></tr>';
    console.error('Error:', e);
  }

  icon.classList.remove('spinning');
  btn.disabled = false;
}

function renderListado(usuarios) {
  const tbody = document.getElementById('listado-body');
  tbody.innerHTML = '';

  if (usuarios.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="listado-empty">Sin resultados.</td></tr>';
    return;
  }

  usuarios.forEach(u => {
    const fullName  = `${u.primerNombre ?? ''} ${u.primerApellido ?? ''}`.trim();
    const partes    = fullName.split(/\s+/);
    const iniciales = partes.length >= 2
      ? `${partes[0][0]}${partes[1][0]}`
      : partes[0]?.[0] ?? '?';

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><div class="listado-avatar-iniciales">${iniciales.toUpperCase()}</div></td>
      <td class="listado-name">${fullName}</td>
      <td>${u.direccion ?? 'Sin dirección'}</td>
      <td>${u.email ?? 'Sin correo'}</td>
      <td>${u.telefono1 ?? 'Sin teléfono'}</td>
    `;
    tbody.appendChild(tr);
  });
}

function handleSearchListado(event) {
  const query = event.target.value.toLowerCase().trim();

  if (!query) {
    renderListado(usuariosListado);
    return;
  }

  const filtrados = usuariosListado.filter(u => {
    const fullName = `${u.primerNombre ?? ''} ${u.primerApellido ?? ''}`.toLowerCase();
    return fullName.includes(query) || (u.email ?? '').toLowerCase().includes(query);
  });

  renderListado(filtrados);
}

loadListado();