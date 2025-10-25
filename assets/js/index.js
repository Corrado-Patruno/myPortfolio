/*=============== HOME: SEZIONI INTERATTIVE ===============*/
// Questo file contiene gli script specifici della home page:
// - Modali delle esperienze (apri/chiudi)
// - Inizializzazione Swiper per testimonial e works
// - Pulsante scroll-up (solo se non gestito globalmente)
// - Tabella "Ultimi post" con fetch dei dati

/*=============== SERVICES MODAL ===============*/
try {
    const modal = document.querySelectorAll('.services__modal');
    const modalButton = document.querySelectorAll('.services__button');
    const modalClose = document.querySelectorAll('.services__modal-close');

    const activateModal = (modalIndex) => {
        if (modal[modalIndex]) modal[modalIndex].classList.add('active-modal');
    };

    const closeAllModals = () => {
        modal.forEach((m) => m.classList.remove('active-modal'));
    };

    // Apri modal al click sul bottone "Learn More"
    modalButton.forEach((btn, i) => btn.addEventListener('click', () => activateModal(i)));
    
    // Chiudi modal al click sulla X
    modalClose.forEach((closeBtn) => closeBtn.addEventListener('click', closeAllModals));
    
    // Chiudi modal cliccando fuori (sul backdrop)
    modal.forEach((m) => {
        m.addEventListener('click', (e) => {
            // Se clicco direttamente sul modal (backdrop), non sul contenuto interno
            if (e.target === m) {
                closeAllModals();
            }
        });
    });
} catch (_) { /* no-op */ }

/*=============== SWIPER TESTIMONIAL ===============*/
try {
    const swiperTestimonial = new Swiper('.testimonial__swiper', {
        loop: true,
        spaceBetween: 32,
        grabCursor: true,
        pagination: {
            el: '.swiper-pagination1',
            dynamicBullets: true,
            clickable: true,
        },
    });
    // Works experience
    const swiper = new Swiper('.mySwiper', {
        slidesPerView: 3,
        spaceBetween: 30,
        grabCursor: true,
        pagination: { el: '.swiper-pagination2', dynamicBullets: true, clickable: true },
        navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
        breakpoints: {
            '@0.00': { slidesPerView: 1, spaceBetween: 10 },
            '@0.60': { slidesPerView: 2, spaceBetween: 10 },
            '@0.75': { slidesPerView: 2, spaceBetween: 20 },
            '@1.00': { slidesPerView: 3, spaceBetween: 30 },
            '@1.50': { slidesPerView: 3, spaceBetween: 30 },
        },
    });
} catch (_) { /* no-op */ }

// Nota: la visibilità dello scroll-up è già gestita globalmente in assets/js/main.js

/*=============== HOME BLOG: LATEST POSTS ===============*/
// Carica e renderizza gli ultimi post del blog nella tabella in home.
function loadHomeLatestPosts() {
    try {
        const tbody = document.getElementById('home-blog-tbody');
        const emptyEl = document.getElementById('home-blog-empty');
        const table = document.getElementById('home-blog-table');
        if (!tbody) return; // se non siamo in home o sezione non presente

        if (emptyEl) { emptyEl.textContent = 'Caricamento articoli…'; emptyEl.hidden = false; }
        if (table) { table.setAttribute('aria-busy', 'true'); table.hidden = false; }
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="4">Caricamento articoli…</td></tr>';
        }

        const bust = 't=' + Date.now();
        fetch('./data/posts-index.json?' + bust, { cache: 'no-store' })
            .then(res => { if (!res.ok) throw new Error('HTTP ' + res.status); return res.json(); })
            .catch(() => fetch('./data/posts.json?' + bust, { cache: 'no-store' }).then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); }))
            .then(posts => {
                if (!Array.isArray(posts)) throw new Error('Formato non valido');
                // Sort by date desc and pick the latest 5
                posts.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
                const latest = posts.slice(0, 5);

                if (!latest.length) {
                    if (tbody) tbody.innerHTML = '';
                    if (emptyEl) { emptyEl.textContent = 'Nessun articolo disponibile.'; emptyEl.hidden = false; }
                    if (table) { table.hidden = false; }
                    return;
                }

                const rows = latest.map(p => {
                     const title = escapeHtml(p.title || 'Untitled');
                    const dateStr = p.date ? new Date(p.date).toLocaleDateString('it-IT') : '';
                    const cat = escapeHtml(p.category || '');
                    const url = `post.html?slug=${encodeURIComponent(p.slug)}`;
                    return `<tr>
                        <td data-label="Titolo"><a href="${url}">${title}</a></td>
                        <td data-label="Data">${dateStr}</td>
                        <td data-label="Categoria">${cat}</td>
                        <td data-label=" "><a class="button" href="${url}">Read</a></td>
                    </tr>`;
                });
                tbody.innerHTML = rows.join('');
                 if (emptyEl) emptyEl.hidden = true;
                if (table) table.hidden = false;
            })
            .catch(() => {
                if (tbody) tbody.innerHTML = '';
                if (emptyEl) {
                    emptyEl.textContent = 'No posts available.';
                    emptyEl.hidden = false;
                }
                if (table) table.hidden = false;
            });
            
        // always clear busy state
        const clearBusy = () => { if (table) table.removeAttribute('aria-busy'); };
        window.addEventListener('load', clearBusy);
        setTimeout(clearBusy, 1500);

        // Utility: escape per prevenire injection in HTML costruito via stringhe
        function escapeHtml(str) {
            return String(str)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
        }
    } catch (e) {
        // no-op
    }
}

// Esegui quando il DOM è pronto, evitando che eventuali errori sopra blocchino questa sezione
try {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadHomeLatestPosts);
    } else {
        loadHomeLatestPosts();
    }
} catch (_) { loadHomeLatestPosts(); }