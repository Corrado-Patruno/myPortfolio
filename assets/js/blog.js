// Blog index: lista articoli con ricerca, filtro per tag e paginazione
//
// Questo modulo inizializza la pagina Blog fornendo:
// - Ricerca testuale su titolo ed estratto
// - Filtri per tag e categoria (con deep-linking via URL)
// - Ordinamento per data asc/desc
// - Paginazione client-side
// Le funzioni sono commentate per rendere chiaro il flusso e facilitare la manutenzione.

//init() e raccolta del DOM
init();

async function init() {
  const elements = getDomElements();
  if (!elements) return;


  // Stato dell’applicazione (immutabile via riassegnazione, ma mutiamo le proprietà)
  const state = {
    allPosts: [],
    filteredPosts: [],
    pageSize: 6,
    currentPage: 1,
    searchQuery: '',
    selectedTag: '',
    selectedCategory: ''
  };

  // Ripristina stato da URL per consentire deep-linking di ricerca/filtri/pagina
  const params = new URL(location.href).searchParams;
  state.searchQuery = (params.get('q') || '').trim();
  state.selectedTag = (params.get('tag') || '').trim();
  state.selectedCategory = (params.get('cat') || '').trim();
  state.currentPage = Math.max(1, parseInt(params.get('page') || '1', 10));

  // Applica valori iniziali agli input
  elements.searchInput.value = state.searchQuery;

  try {
    // Carica l'indice “leggero” dei post per performance
    const response = await fetch('data/posts-index.json', { cache: 'no-store' });
    state.allPosts = await response.json();

    // Ordina per data discendente, se presente
    state.allPosts.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

    // Costruisci lista tag e dropdown categorie
    if (elements.tagFilter) renderTagOptions(elements.tagFilter, state.allPosts, state.selectedTag);
    if (elements.tagsList) renderTagSidebar(elements.tagsList, state.allPosts, state.selectedTag);
    if (elements.dropdownMenu) renderDropdown(elements.dropdownMenu, state.allPosts, state.selectedCategory);
    
    // Imposta etichetta iniziale del bottone dropdown
    updateDropdownLabel(elements.dropdownBtn, state.selectedCategory);

    applyFiltersAndRender(state, elements);

    // Event listeners: input ricerca, selettori tag/categoria, ordinamento, paginazione
    elements.searchInput.addEventListener('input', () => {
      state.searchQuery = elements.searchInput.value.trim();
      state.currentPage = 1;
      applyFiltersAndRender(state, elements, true);
    });

    if (elements.tagFilter) {
      elements.tagFilter.addEventListener('change', () => {
        state.selectedTag = elements.tagFilter.value;
        state.currentPage = 1;
        applyFiltersAndRender(state, elements, true);
      });
    }

    if (elements.tagsList) {
      elements.tagsList.addEventListener('click', (ev) => {
        const btn = ev.target.closest('[data-tag]');
        if (!btn) return;
        ev.preventDefault();
        ev.stopPropagation();
        state.selectedTag = btn.getAttribute('data-tag');
        state.currentPage = 1;
        applyFiltersAndRender(state, elements, true);
        [...elements.tagsList.querySelectorAll('[data-tag]')].forEach(x => x.classList.toggle('is-active', x === btn));
        // Porta in cima alla pagina dopo il filtro per tag
        window.scrollTo({ top: 0, behavior: 'smooth' });
         // Chiudi eventualmente il menu categorie se aperto
        if (elements.dropdownMenu) elements.dropdownMenu.classList.remove('show');
      });
    }

    if (elements.sortAsc && elements.sortDesc) {
      elements.sortAsc.addEventListener('click', () => {
        elements.sortDesc.classList.remove('is-active');
        elements.sortAsc.classList.add('is-active');
        state.allPosts.sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0));
        applyFiltersAndRender(state, elements, true);
      });

      elements.sortDesc.addEventListener('click', () => {
        elements.sortAsc.classList.remove('is-active');
        elements.sortDesc.classList.add('is-active');
        state.allPosts.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
        applyFiltersAndRender(state, elements, true);
      });
    }

    if (elements.dropdownBtn && elements.dropdownMenu) {
      elements.dropdownBtn.addEventListener('click', () => {
        elements.dropdownMenu.classList.toggle('show');
      });
      elements.dropdownMenu.addEventListener('click', (ev) => {
        const btn = ev.target.closest('[data-category]');
        if (!btn) return;
        state.selectedCategory = btn.getAttribute('data-category');
        state.currentPage = 1;
        applyFiltersAndRender(state, elements, true);
         // Aggiorna etichetta bottone ed evidenziazione menu
        updateDropdownLabel(elements.dropdownBtn, state.selectedCategory);
        renderDropdown(elements.dropdownMenu, state.allPosts, state.selectedCategory);
        elements.dropdownMenu.classList.remove('show');
        // Porta in cima alla pagina dopo il filtro per categoria
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
      document.addEventListener('click', (e) => {
        if (!elements.dropdownBtn.contains(e.target) && !elements.dropdownMenu.contains(e.target)) {
          elements.dropdownMenu.classList.remove('show');
        }
      });
    }

    elements.pagination.addEventListener('click', (ev) => {
      const target = ev.target.closest('[data-page]');
      if (!target) return;
      const page = parseInt(target.getAttribute('data-page'), 10);
      if (!Number.isFinite(page)) return;
      state.currentPage = page;
      applyFiltersAndRender(state, elements, true);
      // Torna completamente in alto
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  } catch (error) {
    console.error('Errore nel caricamento degli articoli:', error);
    elements.list.innerHTML = '<p>Impossibile caricare gli articoli.</p>';
  }
}

/**
 * Raccoglie e valida i riferimenti agli elementi del DOM necessari alla pagina Blog.
 * Ritorna null se gli elementi minimi non sono presenti (search, list, pagination).
 */
function getDomElements() {
  const searchInput = document.getElementById('search-input');
  const tagFilter = document.getElementById('tag-filter');
  const list = document.getElementById('blog-list');
  const pagination = document.getElementById('blog-pagination');
  const tagsList = document.getElementById('blog-tags');
  const sortAsc = document.getElementById('sort-asc');
  const sortDesc = document.getElementById('sort-desc');
  const dropdownBtn = document.getElementById('blog-dropdown');
  const dropdownMenu = document.getElementById('blog-dropdown-menu');
  if (!searchInput || !list || !pagination) return null;
  return { searchInput, tagFilter, list, pagination, tagsList, sortAsc, sortDesc, dropdownBtn, dropdownMenu };
}

/**
 * Popola un elemento <select> con i tag unici presenti nella lista di post.
 * Mantiene selezionato il tag attuale quando presente.
 */
function renderTagOptions(selectEl, posts, selectedTag) {
  const uniqueTags = new Set();
  posts.forEach(p => (p.tags || []).forEach(t => uniqueTags.add(String(t))));
  const options = ['<option value="">All tags</option>'];
  Array.from(uniqueTags).sort((a, b) => a.localeCompare(b, 'it')).forEach(tag => {
    const selected = tag === selectedTag ? ' selected' : '';
    options.push(`<option value="${escapeHtml(tag)}"${selected}>${escapeHtml(tag)}</option>`);
  });
  selectEl.innerHTML = options.join('');
}

/**
 * Renderizza l'elenco dei tag nella sidebar con contatori e stato attivo.
 */
function renderTagSidebar(listEl, posts, selectedTag) {
  const uniqueTags = new Map();
  posts.forEach(p => (p.tags || []).forEach(t => {
    const key = String(t);
    uniqueTags.set(key, (uniqueTags.get(key) || 0) + 1);
  }));
  const items = ['<li><button class="blog__tag-filter' + (selectedTag === '' ? ' is-active' : '') + '" data-tag="">All</button></li>'];
  Array.from(uniqueTags.entries()).sort((a, b) => a[0].localeCompare(b[0], 'it')).forEach(([tag, count]) => {
    const active = tag === selectedTag ? ' is-active' : '';
    items.push(`<li><button class="blog__tag-filter${active}" data-tag="${escapeHtml(tag)}">${escapeHtml(tag)} (${count})</button></li>`);
  });
  listEl.innerHTML = items.join('');
}

/**
 * Renderizza il menu a discesa delle categorie con contatori e stato attivo.
 */
function renderDropdown(menuEl, posts, selectedCategory) {
  const uniqueCategories = new Map();
  posts.forEach(p => {
    const key = String(p.category || 'All');
    uniqueCategories.set(key, (uniqueCategories.get(key) || 0) + 1);
  });
  const items = [];
  Array.from(uniqueCategories.entries())
    .sort((a, b) => a[0].localeCompare(b[0], 'it'))
    .forEach(([cat, count]) => {
      const active = cat === (selectedCategory || 'All') ? ' is-active' : '';
      items.push(`<button class="blog__tag-filter${active}" data-category="${escapeHtml(cat === 'All' ? '' : cat)}">${escapeHtml(cat)} (${count})</button>`);
    });
  // Aggiungi voce 'Tutte' in cima se non presente
  if (!uniqueCategories.has('All')) {
    items.unshift(`<button class="blog__tag-filter${selectedCategory ? '' : ' is-active'}" data-category="">All (${posts.length})</button>`);
  }
  menuEl.innerHTML = items.join('');
}

/**
 * Aggiorna l'etichetta del pulsante dropdown in base alla categoria selezionata.
 */
function updateDropdownLabel(btn, selectedCategory) {
  if (!btn) return;
  const span = btn.querySelector('span');
  if (!span) return;
  span.textContent = (selectedCategory && selectedCategory.length) ? selectedCategory : 'All Categories';
}

/**
 * Applica i filtri correnti (query, tag, categoria), calcola la pagina e aggiorna UI.
 * Se updateUrl=true sincronizza lo stato nell'URL senza ricaricare la pagina.
 */
function applyFiltersAndRender(state, elements, updateUrl = false) {
  const query = state.searchQuery.toLowerCase();
  const tag = state.selectedTag;
  const category = state.selectedCategory;

  state.filteredPosts = state.allPosts.filter(p => {
    const matchesQuery = !query ||
      (p.title && p.title.toLowerCase().includes(query)) ||
      (p.excerpt && p.excerpt.toLowerCase().includes(query));
    const matchesTag = !tag || (p.tags || []).includes(tag);
    const pCat = (p.category || '').toString();
    const matchesCat = !category || pCat === category;
    return matchesQuery && matchesTag && matchesCat;
  });

  const totalPages = Math.max(1, Math.ceil(state.filteredPosts.length / state.pageSize));
  if (state.currentPage > totalPages) state.currentPage = totalPages;

  // Slice pagina corrente
  const start = (state.currentPage - 1) * state.pageSize;
  const pageItems = state.filteredPosts.slice(start, start + state.pageSize);

  renderList(elements.list, pageItems);
  renderPagination(elements.pagination, state.currentPage, totalPages);

  if (updateUrl) updateUrlParams(state);
}

/**
 * Renderizza l'elenco di post come card.
 */
function renderList(container, posts) {
  if (!posts.length) {
    container.innerHTML = '<p>No posts found.</p>';
    return;
  }

  const cards = posts.map(p => {
    const safeTitle = escapeHtml(p.title || 'Untitled');
    const safeExcerpt = escapeHtml(p.excerpt || '');
    const dateStr = p.date ? new Date(p.date).toLocaleDateString('it-IT') : '';
    const url = `post.html?slug=${encodeURIComponent(p.slug)}`;
    const coverSrc = (p.cover && String(p.cover).trim()) ? p.cover : 'assets/img/Coming_Soon.png';
    const cover = `<img class=\"blog__cover\" src=\"${coverSrc}\" alt=\"\" onerror=\"this.onerror=null;this.src='assets/img/Coming_Soon.png'\">`;

    const tagBadges = (p.tags || [])
      .map(t => `<span class="blog__tag">#${escapeHtml(String(t))}</span>`) 
      .join('');

    const catBadge = `<span class=\"blog__cat-badge\">${escapeHtml(p.category || 'All')}</span>`;

    return `
<article class="blog__card">
  ${catBadge}
  ${cover}
  <div class="blog__body">
    <h2 class="blog__title">${safeTitle}</h2>
    <p class="blog__excerpt">${safeExcerpt}</p>
    <div class="blog__meta">
      <time datetime="${p.date || ''}">${dateStr}</time>
      <div class="blog__tags">${tagBadges}</div>
    </div>
    <a class="button blog__read" href="${url}">Read</a>
  </div>
</article>`;
  });

  container.innerHTML = cards.join('');
}

/**
 * Renderizza la paginazione con finestra scorrevole.
 */
function renderPagination(container, currentPage, totalPages) {
  if (totalPages <= 1) { container.innerHTML = ''; return; }

  const items = [];
  const add = (label, page, disabled = false, active = false) => {
    const classes = ['button', 'blog__page-btn'];
    if (active) classes.push('is-active');
    const attrs = [
      `class="${classes.join(' ')}"`,
      disabled ? 'aria-disabled="true"' : `data-page="${page}"`
    ].join(' ');
    items.push(`<button ${attrs}>${label}</button>`);
  };

  add('«', Math.max(1, currentPage - 1), currentPage === 1);

  const windowSize = 5;
  const start = Math.max(1, currentPage - Math.floor(windowSize / 2));
  const end = Math.min(totalPages, start + windowSize - 1);
  for (let p = start; p <= end; p++) add(String(p), p, false, p === currentPage);

  add('»', Math.min(totalPages, currentPage + 1), currentPage === totalPages);

  container.innerHTML = items.join(' ');
}

/**
 * Aggiorna i parametri dell'URL in base allo stato corrente.
 */
function updateUrlParams(state) {
  const url = new URL(location.href);
  const setOrDelete = (key, value) => {
    if (value) url.searchParams.set(key, value);
    else url.searchParams.delete(key);
  };
  setOrDelete('q', state.searchQuery);
  setOrDelete('tag', state.selectedTag);
  setOrDelete('cat', state.selectedCategory);
  url.searchParams.set('page', String(state.currentPage));
  history.replaceState({}, '', url.toString());
}

/**
 * Esegue l'escape dei caratteri speciali per prevenire injection XSS nelle stringhe HTML.
 */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}