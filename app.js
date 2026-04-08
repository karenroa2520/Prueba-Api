async function loadUser() {
  const btn = document.getElementById('btn');
  const icon = document.getElementById('icon');

  icon.classList.add('spinning');
  btn.disabled = true;

  try {
    const res = await fetch('https://randomuser.me/api/?results=1');
    const data = await res.json();
    const u = data.results[0];

    const fullName = `${u.name.first} ${u.name.last}`;
    const gender = u.gender;
    const city = u.location.city;
    const email = u.email;
    const phone = u.cell;
    const photo = u.picture.large;

    document.getElementById('name').textContent = fullName;

    const badge = document.getElementById('gender-badge');
    if (gender === 'male') {
      badge.textContent = 'Masculino';
      badge.className = 'badge badge-male';
    } else {
      badge.textContent = 'Femenino';
      badge.className = 'badge badge-female';
    }

    document.getElementById('city').textContent = city;
    document.getElementById('email').textContent = email;
    document.getElementById('phone').textContent = phone;

    const wrap = document.getElementById('avatar-wrap');
    wrap.innerHTML = `<img class="avatar" src="${photo}" alt="Foto de ${fullName}" />`;

  } catch (e) {
    document.getElementById('name').textContent = 'Error al cargar datos';
    console.error('Error:', e);
  }

  icon.classList.remove('spinning');
  btn.disabled = false;
}

loadUser();