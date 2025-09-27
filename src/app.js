// Commit 1: wiring básico y helpers
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

const sections = {
    home: $('#home'),
    videos: $('#videos'),
    channels: $('#channels'),
    subs: $('#subs'),
    history: $('#history')
};

function showSection(id) {
    Object.values(sections).forEach(s => s.classList.add('hidden'));
    sections[id]?.classList.remove('hidden');
    $$('.nav-link').forEach(b => b.classList.toggle('active', b.dataset.section === id));
    // Enfocar contenido para accesibilidad
    $('#content').focus();
}

// Navegación lateral
$$('.nav-link').forEach(btn => {
    btn.addEventListener('click', () => showSection(btn.dataset.section));
});

// Toggle sidebar (móvil)
$('#btnToggleSidebar').addEventListener('click', () => {
    $('.layout').classList.toggle('sidebar-collapsed');
});

// Tips mostrar/ocultar (DOM)
$('#btnMostrarTips').addEventListener('click', () => $('#tips').hidden = false);
$('#btnOcultarTips').addEventListener('click', () => $('#tips').hidden = true);

// Búsqueda (no implementa lógica aún, se añade en commits siguientes)
$('#searchForm').addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Búsqueda activada (se implementa en Commit 3)');
});

// Dark mode toggle (mejorado en Commit 4)
$('#btnDarkMode').addEventListener('click', (e) => {
    document.body.classList.toggle('light');
    const pressed = e.currentTarget.getAttribute('aria-pressed') === 'true';
    e.currentTarget.setAttribute('aria-pressed', String(!pressed));
});

// Atajo “/” para enfocar búsqueda
window.addEventListener('keydown', (ev) => {
    if (ev.key === '/') {
        ev.preventDefault();
        $('#searchInput').focus();
    }
});

// Por defecto, mostrar Home
showSection('home');
