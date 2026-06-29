const $ = (s) => document.querySelector(s);

function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2200);
}

function renderHome() {
  const { user, categories, recipes, chefs } = MOCK;

  $('#user-name').textContent = user.name;
  $('#user-sub').textContent = user.subtitle;
  $('#user-avatar').src = user.avatar;

  $('#categories').innerHTML = categories
    .map(
      (c) => `
    <div class="cat-item">
      <div class="cat-circle" data-label="${c.label}">
        <img src="${c.image}" alt="${c.label}" />
      </div>
    </div>`
    )
    .join('');

  $('#popular-list').innerHTML = recipes
    .map(
      (r) => `
    <article class="popular-card" data-id="${r.id}">
      <div class="popular-img-wrap">
        <img src="${r.image}" alt="${r.title}" />
        <div class="rating-badge"><span class="star">★</span> ${r.rating} (${r.reviews})</div>
        <button class="heart-btn ${r.saved ? 'saved' : ''}" data-heart="${r.id}">♡</button>
      </div>
      <div class="popular-body">
        <div class="popular-title-row">
          <h4>${r.title}</h4>
          ${r.vegetarian ? '<div class="veg-badge"></div>' : ''}
        </div>
        <div class="popular-footer">
          <span>⏱ ${r.time}</span>
          <span class="dot">·</span>
          <span>${r.difficulty}</span>
          <span class="dot">·</span>
          <span>by ${r.chef}</span>
        </div>
      </div>
    </article>`
    )
    .join('');

  $('#chefs').innerHTML = chefs
    .map((c) => `<div class="chef-item"><img src="${c.avatar}" alt="${c.name}" /><span>${c.name}</span></div>`)
    .join('');

  document.querySelectorAll('.popular-card').forEach((card) => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('.heart-btn')) return;
      renderDetail(MOCK.popular);
      document.getElementById('phone-detail')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  });

  document.querySelectorAll('.heart-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = parseInt(btn.dataset.heart, 10);
      const recipe = MOCK.recipes.find((r) => r.id === id);
      if (recipe) {
        recipe.saved = !recipe.saved;
        btn.classList.toggle('saved', recipe.saved);
        btn.textContent = recipe.saved ? '❤' : '♡';
        toast(recipe.saved ? 'Added to Favourites' : 'Removed from Favourites');
      }
    });
  });
}

function renderDetail(recipe) {
  const r = recipe || MOCK.popular;

  $('#detail-hero-img').src = r.image;
  $('#detail-cat').textContent = r.category || 'Pasta';
  $('#detail-rating').textContent = r.detailRating || r.rating;
  $('#detail-title').textContent = r.title;
  $('#detail-veg').style.display = r.vegetarian ? 'flex' : 'none';
  $('#detail-desc').textContent = r.description;
  $('#detail-time').textContent = r.time;
  $('#detail-cuisine').textContent = r.cuisine || 'Italian';

  if (r.author) {
    $('#author-avatar').src = r.author.avatar;
    $('#author-name').textContent = r.author.name;
    $('#author-role').textContent = r.author.role;
  }

  $('#gallery').innerHTML = (r.gallery || [r.image])
    .map(
      (img, i) =>
        `<div class="gallery-thumb ${i === 0 ? 'active' : ''}" data-src="${img}"><img src="${img}" alt="" /></div>`
    )
    .join('');

  $('#gallery').querySelectorAll('.gallery-thumb').forEach((thumb) => {
    thumb.addEventListener('click', () => {
      $('#gallery').querySelectorAll('.gallery-thumb').forEach((t) => t.classList.remove('active'));
      thumb.classList.add('active');
      $('#detail-hero-img').src = thumb.dataset.src;
    });
  });

  $('#detail-ingredients').innerHTML = r.ingredients.map((i) => `<li>${i}</li>`).join('');

  let expanded = false;
  $('#read-more').onclick = () => {
    expanded = !expanded;
    $('#detail-desc').textContent = expanded ? r.descriptionFull || r.description : r.description;
    $('#read-more').textContent = expanded ? 'Read less' : 'Read more';
  };
}

document.addEventListener('DOMContentLoaded', () => {
  renderHome();
  renderDetail(MOCK.popular);

  $('#search-input')?.addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase();
    document.querySelectorAll('.popular-card').forEach((card) => {
      const title = card.querySelector('h4').textContent.toLowerCase();
      card.style.display = title.includes(q) ? '' : 'none';
    });
  });

  $('#watch-btn')?.addEventListener('click', () => toast('Watch Videos — mock UI'));
  $('#back-btn')?.addEventListener('click', () => {
    document.getElementById('phone-home')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
  $('#detail-heart')?.addEventListener('click', () => toast('Saved to Favourites'));
});
