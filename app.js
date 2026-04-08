/**
 * loadUser
 * Consume la API de randomuser.me, extrae los datos del usuario
 * y los renderiza en el DOM. También maneja el estado del botón
 * durante la petición y los posibles errores
 */
async function loadUser() {

  // Referencias al boton y su icono para controlar el estado visual
  const btn = document.getElementById('btn');
  const icon = document.getElementById('icon');

  // Activa la animación de carga y deshabilita el boton
  // para evitar multiples peticiones simultáneas
  icon.classList.add('spinning');
  btn.disabled = true;

  try {
    // Peticion a la API — results=1 trae un solo usuario aleatorio
    const res = await fetch('https://randomuser.me/api/?results=1');
    const data = await res.json();

    // La API devuelve un array "results", tomamos el primer elemento
    const u = data.results[0];

    // --- Extraccion de datos del usuario ---
    const fullName = `${u.name.first} ${u.name.last}`;
    const gender   = u.gender;           // 'male' | 'female'
    const city     = u.location.city;
    const email    = u.email;
    const phone    = u.cell;
    const photo    = u.picture.large;    // URL de la foto en alta resolucion

    // --- Renderizado en el DOM ---

    document.getElementById('name').textContent = fullName;

    // El badge de genero cambia de texto y clase CSS según el valor recibido
    const badge = document.getElementById('gender-badge');
    if (gender === 'male') {
      badge.textContent = 'Masculino';
      badge.className = 'badge badge-male';
    } else {
      badge.textContent = 'Femenino';
      badge.className = 'badge badge-female';
    }

    document.getElementById('city').textContent  = city;
    document.getElementById('email').textContent = email;
    document.getElementById('phone').textContent = phone;

    // Inserta la foto como <img> dentro del contenedor del avatar
    const wrap = document.getElementById('avatar-wrap');
    wrap.innerHTML = `<img class="avatar" src="${photo}" alt="Foto de ${fullName}" />`;

  } catch (e) {
    // Si la peticion falla (sin conexion, error de la API, etc.)
    // se muestra un mensaje visible al usuario y el detalle en consola
    document.getElementById('name').textContent = 'Error al cargar datos';
    console.error('Error al consumir la API:', e);
  }

  // Restaura el boton sin importar si la peticion fue exitosa o no
  icon.classList.remove('spinning');
  btn.disabled = false;
}

// Llama la función al cargar la pagina para mostrar un usuario de inmediato
loadUser();