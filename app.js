(() => {
  const $ = id => document.getElementById(id);
  const state = {q:"", group:"Все", products:PRODUCTS.slice(), custom:{}};

  // Local uploaded images are stored only in this browser.
  try { state.custom = JSON.parse(localStorage.getItem("catalog_custom_images") || "{}"); } catch(e) {}

  const groups = ["Все", ...new Set(PRODUCTS.map(p => p.group).filter(Boolean))];
  const cats = $("categories");

  groups.forEach(g => {
    const b = document.createElement("button");
    b.className = "cat" + (g==="Все" ? " active":"");
    b.textContent = g;
    b.onclick = () => { state.group=g; [...cats.children].forEach(x=>x.classList.remove("active")); b.classList.add("active"); render(); };
    cats.appendChild(b);
  });

  function imageFor(p){ return state.custom[p.article] || p.image || ""; }

  function render(){
    const q=state.q.trim().toLowerCase();
    state.products=PRODUCTS.filter(p => {
      const text=`${p.name} ${p.article} ${p.group} ${p.kind}`.toLowerCase();
      return (state.group==="Все" || p.group===state.group) && (!q || text.includes(q));
    });
    $("heading").textContent=state.group==="Все" ? "Все товары" : state.group;
    $("count").textContent=`Найдено: ${state.products.length}`;
    const grid=$("grid"); grid.innerHTML="";
    state.products.forEach(p=>{
      const c=document.createElement("article"); c.className="card";
      const src=imageFor(p);
      c.innerHTML=`<div class="photo">${src?`<img src="${src}" alt="">`:`<div class="no-photo">Нет фото<br>${p.article}.webp</div>`}</div>
      <div class="body"><div class="kind">${p.kind||""}</div><div class="name">${esc(p.name)}</div>
      <div class="meta">Арт. ${esc(p.article)} · ${esc(p.unit||"шт")}</div><div class="price">${p.price!=null?Number(p.price).toLocaleString("ru-RU")+" ₽":"—"}</div></div>`;
      c.querySelector(".photo").onclick=()=>openViewer(p);
      c.querySelector("img")?.addEventListener("error",e=>{e.currentTarget.parentElement.innerHTML=`<div class="no-photo">Фото не найдено<br>${p.article}.webp</div>`});
      grid.appendChild(c);
    });
  }

  function esc(s){return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));}
  function openViewer(p){
    const src=imageFor(p); if(!src)return;
    $("viewerImg").src=src; $("viewerText").textContent=`${p.name} · ${p.article}`; $("viewer").hidden=false;
  }
  $("closeViewer").onclick=()=>$("viewer").hidden=true;
  $("viewer").onclick=e=>{if(e.target.id==="viewer")$("viewer").hidden=true};
  $("search").oninput=e=>{state.q=e.target.value;render()};
  $("reset").onclick=()=>{state.q="";state.group="Все";$("search").value="";[...cats.children].forEach((x,i)=>x.classList.toggle("active",i===0));render()};

  $("uploadButton").onclick=()=>$("fileInput").click();
  $("fileInput").onchange=e=>{
    const file=e.target.files[0]; if(!file)return;
    const m=prompt("Введи артикул товара, например 00046:");
    if(!m)return;
    const p=PRODUCTS.find(x=>x.article===m.trim());
    if(!p){alert("Такого артикула нет в каталоге.");return;}
    const reader=new FileReader();
    reader.onload=()=>{state.custom[p.article]=reader.result;localStorage.setItem("catalog_custom_images",JSON.stringify(state.custom));render();alert("Фото сохранено в этом браузере.");};
    reader.readAsDataURL(file);
  };
  render();
})();