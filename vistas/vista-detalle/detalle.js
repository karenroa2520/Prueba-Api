const API_BASE = 'https://localhost:7299';

const AVATAR_COLORS = ['av-0','av-1','av-2','av-3','av-4','av-5','av-6','av-7'];

function getAvatarColor(id) {
  const num = parseInt(String(id).replace(/\D/g, '')) || 0;
  return AVATAR_COLORS[num % AVATAR_COLORS.length];
}

function getIniciales(primerNombre, primerApellido) {
  const n = (primerNombre ?? '').trim();
  const a = (primerApellido ?? '').trim();
  if (n && a) return `${n[0]}${a[0]}`.toUpperCase();
  if (n)      return n[0].toUpperCase();
  return '?';
}

function val(v) {
  return (v && String(v).trim()) ? String(v).trim() : '—';
}

async function cargarDetalle() {
  const params = new URLSearchParams(window.location.search);
  const id     = params.get('id');

  if (!id) {
    mostrarError('No se especificó un ID de usuario en la URL.');
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/api/usuarios/detalle/${encodeURIComponent(id)}`);

    if (res.status === 404) {
      mostrarError(`No se encontró ningún usuario con ID: ${id}`);
      return;
    }

    if (!res.ok) {
      mostrarError(`Error del servidor: ${res.status}`);
      return;
    }

    const u = await res.json();
    renderDetalle(u);

  } catch (e) {
    console.error('Error al cargar detalle:', e);
    mostrarError('No se pudo conectar con el servidor. Verifica que la API esté corriendo.');
  }
}

function renderDetalle(u) {
  const avatar = document.getElementById('det-avatar');
  avatar.textContent = getIniciales(u.primerNombre, u.primerApellido);
  avatar.classList.add(getAvatarColor(u.noIdentificacion));

  const nombreMostrado = `${u.primerNombre ?? ''} ${u.primerApellido ?? ''}`.trim() || 'Sin nombre';
  document.getElementById('det-nombre').textContent = nombreMostrado;
  document.getElementById('det-id').textContent     = `ID: ${u.noIdentificacion ?? 'N/A'}`;
  document.title = `Detalle — ${nombreMostrado}`;

  document.getElementById('det-identificacion').textContent  = val(u.noIdentificacion);
  document.getElementById('det-nombre-completo').textContent = val(u.nombreCompleto);
  document.getElementById('det-direccion').textContent       = val(u.direccion);
  document.getElementById('det-email').textContent           = val(u.email);
  document.getElementById('det-telefono1').textContent       = val(u.telefono1);
  document.getElementById('det-telefono2').textContent       = val(u.telefono2);
  document.getElementById('det-pais').textContent            = val(u.pais);
  document.getElementById('det-departamento').textContent    = val(u.departamento);
  document.getElementById('det-ciudad').textContent          = val(u.ciudad);
  document.getElementById('det-barrio').textContent          = val(u.barrio);

  document.getElementById('estado-carga').style.display  = 'none';
  document.getElementById('detalle-card').style.display  = 'block';
}

function mostrarError(msg) {
  document.getElementById('estado-carga').style.display  = 'none';
  document.getElementById('error-msg').textContent       = msg;
  document.getElementById('estado-error').style.display  = 'flex';
}

cargarDetalle();