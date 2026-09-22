(() => {
  const products = Array.isArray(window.PRODUCTS) ? window.PRODUCTS : [];
  const photos = window.PHOTOS || {};
  const grid = document.getElementById('productGrid');
  const search = document.getElementById('search');
  const categoryBox = document.getElementById('categories');
  const reset = document.getElementById('reset');
  const viewer = document.getElementById('viewer');
  const viewerImg = document.getElementById('viewerImg');
  const viewerTitle = document.getElementById('viewerTitle');
  const viewerClose = document.getElementById('viewerClose');

  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const article=p=>String(p.article??p.articul??p.code??p.id??'').trim();
  const title=p=>p.name??p.title??p.product??('Артикул '+article(p));
  const cat=p=>p.category??p.type??p.group??'';
  const imageFor=p=>{
    const a=article(p);
    return photos[a] || (p.image || '');
  };

  const cats=[...new Set(products.map(cat).filter(Boolean))].sort();
  categoryBox.innerHTML='<button class="cat active" data-cat="">Все</button>'+
    cats.map(c=>`<button class="cat" data-cat="${esc(c)}">${esc(c)}</button>`).join('');

  let activeCat='';

  function render(list){
    grid.innerHTML='';
    if(!list.length){grid.innerHTML='<div class="empty">Ничего не найдено</div>';return;}
    list.forEach(p=>{
      const card=document.createElement('article');
      card.className='card';
      card.innerHTML=`<div class="photo"><img alt="${esc(title(p))}"></div>
        <div class="info"><h3>${esc(title(p))}</h3>
        ${article(p)?`<div class="article">Артикул: ${esc(article(p))}</div>`:''}
        ${cat(p)?`<div class="category">${esc(cat(p))}</div>`:''}</div>`;
      const img=card.querySelector('img');
      const src=imageFor(p);
      if(src) img.src=src; else img.classList.add('no-photo');
      img.addEventListener('click',()=>openViewer(p));
      grid.appendChild(card);
    });
  }

  function openViewer(p){
    viewer.classList.add('open');
    viewerTitle.textContent=title(p);
    const src=imageFor(p);
    if(src) viewerImg.src=src; else viewerImg.removeAttribute('src');
  }

  function filter(){
    const q=(search.value||'').trim().toLowerCase();
    render(products.filter(p=>{
      const hay=[article(p),title(p),cat(p),JSON.stringify(p)].join(' ').toLowerCase();
      return (!q||hay.includes(q))&&(!activeCat||cat(p)===activeCat);
    }));
  }

  search.addEventListener('input',filter);
  reset.addEventListener('click',()=>{
    search.value='';activeCat='';
    document.querySelectorAll('.cat').forEach(b=>b.classList.toggle('active',!b.dataset.cat));
    filter();
  });
  categoryBox.addEventListener('click',e=>{
    const b=e.target.closest('.cat');if(!b)return;
    activeCat=b.dataset.cat||'';
    document.querySelectorAll('.cat').forEach(x=>x.classList.toggle('active',x===b));
    filter();
  });
  viewerClose.addEventListener('click',()=>viewer.classList.remove('open'));
  viewer.addEventListener('click',e=>{if(e.target===viewer)viewer.classList.remove('open')});
  render(products);
})();