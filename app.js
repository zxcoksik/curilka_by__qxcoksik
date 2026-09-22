(() => {
  const products = Array.isArray(window.PRODUCTS) ? window.PRODUCTS : [];
  const grid = document.getElementById('productGrid');
  const search = document.getElementById('search');
  const categoryBox = document.getElementById('categories');
  const reset = document.getElementById('reset');
  const viewer = document.getElementById('viewer');
  const viewerImg = document.getElementById('viewerImg');
  const viewerTitle = document.getElementById('viewerTitle');
  const viewerClose = document.getElementById('viewerClose');

  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'
  }[c]));

  function getArticle(p) {
    return String(p.article ?? p.articul ?? p.code ?? p.id ?? '').trim();
  }
  function getTitle(p) {
    return p.name ?? p.title ?? p.product ?? ('Артикул ' + getArticle(p));
  }
  function getCategory(p) {
    return p.category ?? p.type ?? p.group ?? '';
  }
  function getImages(p) {
    const article = getArticle(p);
    if (Array.isArray(p.images) && p.images.length) return p.images;
    if (p.image) return [p.image];
    return article ? [`images/${encodeURIComponent(article)}/1.webp`] : [];
  }

  // Try the old flat image name too, so both image layouts work.
  function imageCandidates(p, i) {
    const article = getArticle(p);
    const explicit = getImages(p)[i];
    const out = [];
    if (explicit) out.push(explicit);
    if (article) {
      out.push(`images/${encodeURIComponent(article)}/${i+1}.webp`);
      out.push(`images/${encodeURIComponent(article)}/${i+1}.jpg`);
      out.push(`images/${encodeURIComponent(article)}/${i+1}.jpeg`);
      if (i === 0) {
        out.push(`images/${encodeURIComponent(article)}.webp`);
        out.push(`images/${encodeURIComponent(article)}.jpg`);
        out.push(`images/${encodeURIComponent(article)}.jpeg`);
      }
    }
    return [...new Set(out)];
  }

  const categories = [...new Set(products.map(getCategory).filter(Boolean))].sort();
  if (categoryBox) {
    categoryBox.innerHTML = `<button class="cat active" data-cat="">Все</button>` +
      categories.map(c => `<button class="cat" data-cat="${esc(c)}">${esc(c)}</button>`).join('');
  }

  let activeCat = '';

  function render(list) {
    if (!grid) return;
    grid.innerHTML = '';
    if (!list.length) {
      grid.innerHTML = '<div class="empty">Ничего не найдено</div>';
      return;
    }
    list.forEach((p, idx) => {
      const card = document.createElement('article');
      card.className = 'card';
      const title = getTitle(p);
      const article = getArticle(p);
      card.innerHTML = `
        <div class="photo"><img alt="${esc(title)}" loading="lazy"></div>
        <div class="info">
          <h3>${esc(title)}</h3>
          ${article ? `<div class="article">Артикул: ${esc(article)}</div>` : ''}
          ${getCategory(p) ? `<div class="category">${esc(getCategory(p))}</div>` : ''}
        </div>`;
      const img = card.querySelector('img');
      const candidates = imageCandidates(p, 0);
      let ci = 0;
      const tryNext = () => {
        if (ci >= candidates.length) {
          img.removeAttribute('src');
          img.alt = 'Фото отсутствует';
          img.classList.add('no-photo');
          return;
        }
        img.src = candidates[ci++];
      };
      img.addEventListener('error', tryNext);
      img.addEventListener('click', () => openViewer(p));
      tryNext();
      grid.appendChild(card);
    });
  }

  function openViewer(p) {
    if (!viewer) return;
    viewer.classList.add('open');
    viewerTitle.textContent = getTitle(p);
    const candidates = [];
    const explicit = getImages(p);
    explicit.forEach(x => candidates.push(x));
    for (let i=0;i<10;i++) candidates.push(...imageCandidates(p,i));
    const unique = [...new Set(candidates)];
    let i = 0;
    const next = () => {
      if (i >= unique.length) {
        viewerImg.removeAttribute('src');
        viewerImg.alt = 'Фото отсутствует';
        return;
      }
      viewerImg.onerror = () => { i++; next(); };
      viewerImg.src = unique[i++];
    };
    next();
  }

  function filter() {
    const q = (search?.value || '').trim().toLowerCase();
    const list = products.filter(p => {
      const hay = [getArticle(p), getTitle(p), getCategory(p), JSON.stringify(p)].join(' ').toLowerCase();
      return (!q || hay.includes(q)) && (!activeCat || getCategory(p) === activeCat);
    });
    render(list);
  }

  search?.addEventListener('input', filter);
  reset?.addEventListener('click', () => { if(search) search.value=''; activeCat=''; document.querySelectorAll('.cat').forEach(b=>b.classList.toggle('active', !b.dataset.cat)); filter(); });
  categoryBox?.addEventListener('click', e => {
    const b = e.target.closest('.cat');
    if (!b) return;
    activeCat = b.dataset.cat || '';
    document.querySelectorAll('.cat').forEach(x=>x.classList.toggle('active', x === b));
    filter();
  });
  viewerClose?.addEventListener('click', () => viewer.classList.remove('open'));
  viewer?.addEventListener('click', e => { if (e.target === viewer) viewer.classList.remove('open'); });

  render(products);
})();