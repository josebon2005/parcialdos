// ===== Helpers =====
const $  = (s,c=document)=>c.querySelector(s);
const $$ = (s,c=document)=>Array.from(c.querySelectorAll(s));
const fmt = new Intl.NumberFormat('es-GT');

// ===== Secciones y navegación =====
const sections = {
    home: $('#home'), videos: $('#videos'), channels: $('#channels'), subs: $('#subs'), history: $('#history')
};

function ensureWatchGrid(){
    const main = $('main');
    let wrap = $('.watch-grid', main);
    if(!wrap){
        wrap = document.createElement('div');
        wrap.className = 'watch-grid';
        main.appendChild(wrap);
    }
    // home a la izquierda, videos a la derecha
    if(sections.home.parentElement !== wrap) wrap.appendChild(sections.home);
    if(sections.videos.parentElement !== wrap) wrap.appendChild(sections.videos);
}

function setWatchLayout(){
    ensureWatchGrid();
    sections.home.classList.remove('hidden');
    sections.videos.classList.remove('hidden');
    sections.channels.classList.add('hidden');
    sections.subs.classList.add('hidden');
    sections.history.classList.add('hidden');
    $$('.nav-link').forEach(b=>b.classList.toggle('active', b.dataset.section==='home'));
    $('#content').focus();
}
function showSection(id){
    if(id==='home'){ setWatchLayout(); return; }
    const wrap = $('.watch-grid'); if(wrap){ $('main').appendChild(sections.home); $('main').appendChild(sections.videos); wrap.remove(); }
    Object.values(sections).forEach(s=>s.classList.add('hidden'));
    sections[id]?.classList.remove('hidden');
    $$('.nav-link').forEach(b=>b.classList.toggle('active', b.dataset.section===id));
    $('#content').focus();
}
$$('.nav-link').forEach(btn=>btn.addEventListener('click',()=>showSection(btn.dataset.section)));
$('#btnToggleSidebar').addEventListener('click',()=>$('.layout').classList.toggle('sidebar-collapsed'));

// ===== Datos =====
const videos = [
    { id:'v1', title:'RCP básica en adultos', channel:'Hospital Central',   views:1289000, time:'12:03', tag:'Urgencias' },
    { id:'v2', title:'Tomar presión arterial correctamente', channel:'Clínica Esperanza', views:845000, time:'09:18', tag:'Enfermería' },
    { id:'v3', title:'Nutrición para diabéticos: mitos y verdades', channel:'NutriSalud', views:2310000, time:'14:55', tag:'Nutrición' },
    { id:'v4', title:'Suturas: tipos y cuándo usarlas', channel:'Médicos al Día', views:520000, time:'07:42', tag:'Cirugía' },
    { id:'v5', title:'Fisioterapia de hombro en casa', channel:'RehabPro', views:1712000, time:'11:10', tag:'Rehabilitación' },
    { id:'v6', title:'Interpretación de RX de tórax', channel:'Imagenología GT', views:980000, time:'16:21', tag:'Diagnóstico' }
];
const channels = [
    { id:'c1', name:'Hospital Central', subs:120_000 },
    { id:'c2', name:'Clínica Esperanza', subs:58_200 },
    { id:'c3', name:'NutriSalud', subs:201_400 },
    { id:'c4', name:'Médicos al Día', subs:76_050 },
    { id:'c5', name:'RehabPro', subs:89_900 },
    { id:'c6', name:'Imagenología GT', subs:43_700 }
];

let currentVideo = videos[0];

// ===== Renders =====
function renderPlayer(v){
    sections.home.innerHTML = `
    <div class="player" aria-label="Reproductor">
      <div class="hud">
        <div class="hud-left">
          <button class="hud-btn">🔇</button>
          <span class="hud-time">0:03 / ${v.time}:00</span>
        </div>
        <div class="hud-right">
          <button class="hud-btn">⚙</button>
          <button class="hud-btn">▭</button>
          <button class="hud-btn">⛶</button>
        </div>
      </div>
      <div class="progress-wrap"><div class="progress"></div></div>
    </div>

    <div class="video-title">${v.title}</div>

    <div class="channel-row">
      <div class="channel-left">
        <img src="https://i.pravatar.cc/48?u=${encodeURIComponent(v.channel)}" alt="${v.channel}">
        <div>
          <div style="font-weight:800">${v.channel}</div>
          <div class="meta">${fmt.format(v.views)} vistas • ${v.tag}</div>
        </div>
      </div>
      <div class="actions">
        <button class="pill" id="btnLike">👍 ${Math.floor(v.views/1000)}K</button>
        <button class="pill">💬</button>
        <button class="pill">↗ Compartir</button>
        <button class="pill">⬇ Descargar</button>
        <button class="pill">✂ Acortar</button>
        <button class="pill primary" id="btnSubMain" data-channel="${v.channel}">Suscribirse</button>
      </div>
    </div>
  `;
}

function renderChips(){
    // fila de chips como en YT
    const vSec = sections.videos;
    const chips = document.createElement('div');
    chips.className = 'chips';
    chips.innerHTML = `
    <button class="chip active" data-filter="all">Todo</button>
    <button class="chip" data-filter="recent">Subido recientemente</button>
  `;
    vSec.prepend(chips);
    chips.addEventListener('click',(e)=>{
        const b = e.target.closest('.chip'); if(!b) return;
        $$('.chip', chips).forEach(c=>c.classList.remove('active'));
        b.classList.add('active');
        const filter = b.dataset.filter;
        if(filter==='recent'){
            // ejemplo: mostrar 3 primeros como “recientes”
            renderSuggestions(videos.slice(0,3));
        }else{
            renderSuggestions(videos);
        }
    });
}

function renderSuggestions(list = videos){
    const grid = $('#videoGrid'); grid.innerHTML='';
    list.forEach(v=>{
        const a = document.createElement('article'); a.className='sugg'; a.dataset.vid=v.id;
        a.innerHTML = `
      <div class="s-thumb">🧑‍⚕️<span class="s-dur">${v.time}</span></div>
      <div>
        <div class="s-title">${v.title}</div>
        <div class="s-meta">${v.channel} • ${fmt.format(v.views)} vistas</div>
        <div class="s-row">
          <button class="btn btn-outline btnPlay">Reproducir</button>
          <button class="btn btn-outline btnDelete">Eliminar</button>
        </div>
      </div>
    `;
        grid.appendChild(a);
    });
}

// ===== Búsqueda como YT (filtra sugerencias) =====
$('#searchForm').addEventListener('submit',(e)=>{
    e.preventDefault();
    const q = $('#searchInput').value.trim().toLowerCase();
    const filtered = videos.filter(v =>
        v.title.toLowerCase().includes(q) ||
        v.channel.toLowerCase().includes(q) ||
        v.tag.toLowerCase().includes(q)
    );
    renderSuggestions(filtered);
    setWatchLayout();
});
window.addEventListener('keydown',ev=>{
    if(ev.key==='/'){ ev.preventDefault(); $('#searchInput').focus(); }
});

// Agregar / Eliminar tarjetas desde botones de la sección Videos (siguen visibles)
$('#btnAgregarVideo').addEventListener('click', ()=>{
    const title = prompt('Título del video:');
    const channel = prompt('Nombre del canal:');
    const tag = prompt('Etiqueta (Urgencias, Nutrición, etc.)') || 'General';
    try{
        if(!title || !channel) throw new Error('Título y canal son obligatorios.');
        const nv = { id:'v'+(Math.random()*1e6|0), title, channel, views:0, time:'05:00', tag };
        videos.unshift(nv);
        renderSuggestions(videos);
        setWatchLayout();
    }catch(err){ alert('⚠️ '+err.message); }
});
$('#btnEliminarUltimo').addEventListener('click',()=>{
    if(!videos.length) return;
    videos.pop();
    renderSuggestions(videos);
});

// Delegación en sugerencias: reproducir / eliminar
$('#videoGrid').addEventListener('click',(e)=>{
    const card = e.target.closest('.sugg'); if(!card) return;
    const v = videos.find(x=>x.id===card.dataset.vid);
    if(e.target.classList.contains('btnDelete')){ card.remove(); return; }
    if(e.target.classList.contains('btnPlay')){
        currentVideo = v; renderPlayer(currentVideo); setWatchLayout();
        alert('▶️ Reproduciendo: '+v.title); // historial real en Commit 4
    }
});

// Dark mode + voice
$('#btnDarkMode').addEventListener('click',(e)=>{
    document.body.classList.toggle('light');
    const p=e.currentTarget.getAttribute('aria-pressed')==='true'; e.currentTarget.setAttribute('aria-pressed', String(!p));
});
$('#voiceBtn').addEventListener('click',()=>alert('🎤 Búsqueda por voz (demo)'));

// Inicial
renderPlayer(currentVideo);
renderSuggestions(videos);
renderChips();
setWatchLayout();
