/* Contrôleur de la page dédiée d'article (article.html) avec Schema.org Article */
(() => {
  if (localStorage.getItem('jmc-theme') === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  }

  async function initArticlePage() {
    const root = document.getElementById('article-detail-root');
    const params = new URLSearchParams(window.location.search);
    const slug = params.get('slug');

    try {
      const res = await fetch('data/articles.json');
      const articles = await res.json();
      const idx = Math.max(0, articles.findIndex((a) => a.slug === slug));
      const article = articles[idx];
      const next = articles[(idx + 1) % articles.length];

      document.title = `${article.title} — Jean-Marc CODJO`;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) metaDesc.setAttribute('content', article.metaDescription);

      // Données structurées Schema.org Article
      const ld = document.createElement('script');
      ld.type = 'application/ld+json';
      ld.textContent = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: article.title,
        description: article.metaDescription,
        datePublished: article.date,
        inLanguage: 'fr-FR',
        author: { '@type': 'Person', name: 'Jean-Marc CODJO' }
      });
      document.head.appendChild(ld);

      root.innerHTML = `
        <div class="article-meta" style="margin-bottom:14px;">
          <span class="tag-pill">${article.category}</span>
          <span>Publié le ${article.dateDisplay}</span>
          <span>· ${article.readTime}</span>
        </div>
        <h1 class="section-title" style="margin-bottom:16px;">${article.title}</h1>
        <p class="section-subtitle" style="margin-bottom:24px;max-width:none;">${article.excerpt}</p>

        <div class="detail-card" style="padding:14px;">
          <img src="${article.image}" alt="${article.title}" style="border-radius:14px;width:100%;">
        </div>

        <div class="detail-card article-content">
          ${article.sections.map((s) => `
            <h2>${s.heading}</h2>
            ${s.paragraphs.map((p) => `<p>${p}</p>`).join('')}
          `).join('')}
        </div>

        <div style="display:flex;flex-wrap:wrap;gap:14px;align-items:center;justify-content:space-between;">
          <a href="index.html#contact" class="btn-pill btn-pill-green">
            <span>Discuter de ce sujet avec moi</span>
            <span class="btn-circle">→</span>
          </a>
          <a href="article.html?slug=${encodeURIComponent(next.slug)}" class="btn-pill btn-pill-outline">
            Article suivant →
          </a>
        </div>
      `;
    } catch (e) {
      root.innerHTML = `<p>Article introuvable. <a href="index.html#articles">Retour aux articles</a>.</p>`;
    }
  }

  document.addEventListener('DOMContentLoaded', initArticlePage);
})();
