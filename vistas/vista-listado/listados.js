// Marca el link "Listado" como activo en la navegación
document.getElementById('nav-listado')?.classList.add('activo');

// Usuarios actualmente visibles en la tabla
let usuariosListado = [];
// Todos los usuarios traídos de la API (se cargan una sola vez)
let allUsers = [];
// Posición actual en el array para saber desde dónde mostrar el siguiente bloque
let currentOffset = 0;

// Paleta de clases CSS para los colores de los avatares
const AVATAR_COLORS = ['av-0','av-1','av-2','av-3','av-4','av-5','av-6','av-7'];

// Devuelve una clase de color basada en el número de identificación del usuario
// Así cada usuario siempre tiene el mismo color de avatar
function getAvatarColor(id) {
  const num = parseInt(String(id).replace(/\D/g,'')) || 0; // Extrae solo los dígitos del ID
  return AVATAR_COLORS[num % AVATAR_COLORS.length];        // Usa módulo para elegir un color de la paleta
}

// Valida que la cantidad ingresada sea un número válido entre 1 y 200
function validarCantidad(val) {
  if (!val || isNaN(val) || val <= 0) {
    // Muestra alerta si el valor no es un número positivo
    Swal.fire({ icon: 'warning', title: 'Cantidad inválida', text: 'Ingresa un número mayor a 0.', confirmButtonColor: '#1a1a1a' });
    return false;
  }
  if (val > 200) {
    // Muestra alerta si supera el límite permitido
    Swal.fire({ icon: 'error', title: 'Límite superado', text: 'No puedes cargar más de 200 usuarios a la vez.', confirmButtonColor: '#1a1a1a' });
    return false;
  }
  return true;
}

// Carga y muestra los usuarios en la tabla
async function loadListado() {
  const btn      = document.getElementById('btn-listado');
  const icon     = document.getElementById('icon-listado');
  const tbody    = document.getElementById('listado-body');
  const inputVal = parseInt(document.getElementById('cantidad-input').value); // Cantidad ingresada por el usuario

  // Si la cantidad no es válida, detiene la ejecución
  if (!validarCantidad(inputVal)) return;

  // Activa el ícono girando y deshabilita el botón mientras carga
  icon.classList.add('spinning');
  btn.disabled = true;
  // Muestra mensaje de carga en la tabla mientras espera la respuesta
  tbody.innerHTML = '<tr><td colspan="6" class="listado-empty">Cargando...</td></tr>';

  try {
    if (allUsers.length === 0) {
      // Primera carga: trae todos los usuarios de la API
      const res = await fetch("https://localhost:7299/api/usuarios");
      allUsers = await res.json();
      currentOffset = 0; // Empieza desde el principio
    } else {
      // Cargas siguientes: avanza el offset para mostrar el siguiente bloque
      // El módulo (%) hace que cuando llega al final vuelva al inicio
      currentOffset = (currentOffset + inputVal) % allUsers.length;
    }

    // Selecciona 'inputVal' usuarios en orden desde el offset actual
    usuariosListado = [];
    for (let i = 0; i < inputVal; i++) {
      usuariosListado.push(allUsers[(currentOffset + i) % allUsers.length]);
    }

    renderListado(usuariosListado);

  } catch (e) {
    // Muestra mensaje de error en la tabla si falla la petición
    tbody.innerHTML = '<tr><td colspan="6" class="listado-empty">Error al cargar usuarios.</td></tr>';
    console.error('Error:', e);
  }

  // Detiene el ícono girando y rehabilita el botón
  icon.classList.remove('spinning');
  btn.disabled = false;
}

// Construye y muestra las filas de la tabla con los datos de los usuarios
function renderListado(usuarios) {
  const tbody = document.getElementById('listado-body');
  tbody.innerHTML = '';

  if (usuarios.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="listado-empty">Sin resultados.</td></tr>';
    return;
  }

  usuarios.forEach(u => {
    // Construye el nombre completo, si no tiene nombre muestra "Sin nombre"
    const fullName   = `${u.primerNombre ?? ''} ${u.primerApellido ?? ''}`.trim() || 'Sin nombre';

    // Divide el nombre en partes para extraer las iniciales
    const partes     = fullName.split(/\s+/);
    const iniciales  = partes.length >= 2
      ? `${partes[0][0]}${partes[1][0]}`  // Toma la primera letra de cada palabra
      : partes[0]?.[0] ?? '?';            // Si solo hay una palabra, toma su inicial

    // Obtiene el color del avatar según el ID del usuario
    const colorClass = getAvatarColor(u.noIdentificacion);

    // Crea la fila y le asigna el HTML con los datos del usuario
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><div class="listado-avatar-iniciales ${colorClass}">${iniciales.toUpperCase()}</div></td>
      <td class="listado-name">${fullName}</td>
      <td class="listado-id">${u.noIdentificacion ?? '—'}</td>
      <td>${u.direccion ?? '—'}</td>
      <td style="color:#6b7280;">${u.email ?? '—'}</td>
      <td>${u.telefono1 ?? '—'}</td>
      <td>
        <a href="/vistas/vista-detalle/detalle.html?id=${u.noIdentificacion}" class="btn-detalle-tabla">
          Ver detalles
        </a>
      </td>`;

    // Agrega la fila a la tabla
    tbody.appendChild(tr);
  });
}

// Filtra las filas visibles según lo que el usuario escribe en el buscador
function handleSearchListado(event) {
  const query = event.target.value.toLowerCase().trim();

  // Si el buscador está vacío, muestra todos los usuarios del bloque actual
  if (!query) { renderListado(usuariosListado); return; }

  // Filtra por nombre completo o correo
  const filtrados = usuariosListado.filter(u => {
    const fullName = `${u.primerNombre ?? ''} ${u.primerApellido ?? ''}`.toLowerCase();
    return fullName.includes(query) || (u.email ?? '').toLowerCase().includes(query);
  });

  renderListado(filtrados);
}

// Ejecuta la carga inicial al abrir la página
loadListado();