document.getElementById('nav-cards')?.classList.add('activo');

let usuariosGaleria = [];
let allUsers = [];

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
    // Solo llama la API una vez
    if (allUsers.length === 0) {
      const res = await fetch("https://localhost:7299/api/usuarios");
      allUsers = await res.json();
    }

    // Selecciona 'cantidad' usuarios aleatorios sin repetir
    const shuffled = [...allUsers].sort(() => Math.random() - 0.5);
    usuariosGaleria = shuffled.slice(0, cantidad);

    renderGaleria(usuariosGaleria);

  } catch (e) {
    grid.innerHTML = '<p style="color:#888; text-align:center; grid-column:1/-1;">Error al cargar usuarios.</p>';
    console.error('Error:', e);
  }

  icon.classList.remove('spinning');
  btn.disabled = false;
}

function renderGaleria(usuarios) {
  const grid = document.getElementById('galeria-grid');
  grid.innerHTML = '';

  if (usuarios.length === 0) {
    grid.innerHTML = '<p style="color:#888; text-align:center; grid-column:1/-1;">Sin resultados.</p>';
    return;
  }

  usuarios.forEach(u => {
    const fullName = `${u.primerNombre ?? ''} ${u.primerApellido ?? ''}`.trim();
    const partes   = fullName.split(/\s+/);
    const iniciales = partes.length >= 2
      ? `${partes[0][0]}${partes[1][0]}`
      : partes[0]?.[0] ?? '?';

    const card = document.createElement('div');
    card.className = 'galeria-card';
    card.innerHTML = `
      <div class="avatar-wrap">
        <div class="avatar-iniciales">${iniciales.toUpperCase()}</div>
      </div>
      <div class="header-info">
        <p class="name">${fullName}</p>
      </div>
      <div class="fields">
        <div class="row">
          <span class="label">Dirección</span>
          <span class="value">${u.direccion ?? 'Sin dirección'}</span>
        </div>
        <div class="row">
          <span class="label">Correo</span>
          <span class="value">${u.email ?? 'Sin correo'}</span>
        </div>
        <div class="row">
          <span class="label">Teléfono</span>
          <span class="value">${u.telefono1 ?? 'Sin teléfono'}</span>
        </div>
      </div>
    `;

    grid.appendChild(card);
  });
}

function handleSearchGaleria(event) {
  const query = event.target.value.toLowerCase().trim();

  if (!query) {
    renderGaleria(usuariosGaleria);
    return;
  }

  const filtrados = usuariosGaleria.filter(u => {
    const fullName = `${u.primerNombre ?? ''} ${u.primerApellido ?? ''}`.toLowerCase();
    return fullName.includes(query) || (u.email ?? '').toLowerCase().includes(query);
  });

  renderGaleria(filtrados);
}

loadGaleria();