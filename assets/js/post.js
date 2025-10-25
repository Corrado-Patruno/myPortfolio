// Dettaglio articolo: carica e renderizza un singolo post in base allo slug nell'URL.
// - Legge il parametro "slug" da query string
// - Recupera il file JSON corrispondente in `data/posts/<slug>.json`
// - Aggiorna titolo pagina, metadati, immagine di copertina e contenuto
// - Gestisce 404/errore mostrando un messaggio
init();
async function init() {
  const slug = new URL(location.href).searchParams.get("slug");
  if (!slug) return notFound();
  try {
    // Carica un singolo file per post
    const res = await fetch(`data/posts/${encodeURIComponent(slug)}.json`, { cache: "no-store" });
    if (!res.ok) throw new Error("404");
    const post = await res.json();

    document.title = `${post.title} – Blog`;
    document.getElementById("page-title").textContent = post.title;
    const elPost = document.getElementById("post");
    elPost.querySelector(".post-title").textContent = post.title;
    const dateEl = elPost.querySelector(".post-date");
    dateEl.setAttribute("datetime", post.date);
    dateEl.textContent = new Date(post.date).toLocaleDateString("it-IT");
    const tagsEl = elPost.querySelector(".post-tags");
    tagsEl.innerHTML = (post.tags || []).map(t => `<span>#${t}</span>`).join(" ");
    const cover = elPost.querySelector(".post-cover");
    const placeholder = 'assets/img/Coming_Soon.png';
    const imgSrc = (post.cover && String(post.cover).trim()) ? post.cover : placeholder;
    cover.src = imgSrc;
    cover.hidden = false;
    cover.onerror = () => {
      if (cover.src.indexOf(placeholder) === -1) {
        cover.src = placeholder;
      }
    };
    document.getElementById("post-content").innerHTML = post.content;

    // Metadati dinamici Open Graph / Twitter + canonical
    try {
      const origin = location.origin;
      const pageUrl = `${origin}/post.html?slug=${encodeURIComponent(slug)}`;
      const toAbsoluteUrl = (url) => /^(https?:)?\/\//i.test(url) ? url : new URL(url, origin).href;
      const absoluteImage = toAbsoluteUrl(imgSrc);

      // Meta description
      setMetaName('description', String(post.excerpt || ''));

      // Open Graph
      setMetaProp('og:title', `${post.title} – Blog`);
      setMetaProp('og:description', String(post.excerpt || ''));
      setMetaProp('og:image', absoluteImage);
      setMetaProp('og:image:alt', String(post.title || ''));
      setMetaProp('og:url', pageUrl);
      setMetaProp('og:type', 'article');

      // Twitter Card
      setMetaName('twitter:card', 'summary_large_image');
      setMetaName('twitter:title', `${post.title} – Blog`);
      setMetaName('twitter:description', String(post.excerpt || ''));
      setMetaName('twitter:image', absoluteImage);
      setMetaName('twitter:image:alt', String(post.title || ''));

      // Canonical
      const canonicalEl = document.querySelector('link[rel="canonical"]') || (() => {
        const l = document.createElement('link');
        l.setAttribute('rel', 'canonical');
        document.head.appendChild(l);
        return l;
      })();
      canonicalEl.setAttribute('href', pageUrl);
    } catch (_) { /* ignore meta errors */ }
  } catch (e) {
    notFound();
  }
}
/**
 * Mostra un messaggio di non trovato e aggiorna il titolo della pagina.
 */
function notFound() {
  const el = document.getElementById("post");
  if (el) el.innerHTML = "<p>Article not found.</p>";
  document.title = "Article not found";
}

function setMetaProp(property, content) {
  if (content == null) return;
  let el = document.querySelector(`meta[property="${property}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('property', property);
    document.head.appendChild(el);
  }
  el.setAttribute('content', String(content));
}

function setMetaName(name, content) {
  if (content == null) return;
  let el = document.querySelector(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('name', name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', String(content));
}