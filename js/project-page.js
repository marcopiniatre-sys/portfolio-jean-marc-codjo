/* Contrôleur de la page dédiée d'étude de cas (projet.html) */
(() => {
  if (localStorage.getItem('jmc-theme') === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  }

  async function initProjectPage() {
    const root = document.getElementById('project-detail-root');
    const params = new URLSearchParams(window.location.search);
    const slug = params.get('slug');

    try {
      const res = await fetch('data/projects.json');
      const projects = await res.json();
      const idx = Math.max(0, projects.findIndex((p) => p.slug === slug));
      const project = projects[idx];
      const next = projects[(idx + 1) % projects.length];

      document.title = `${project.shortTitle} — Jean-Marc CODJO`;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) metaDesc.setAttribute('content', project.excerpt);

      root.innerHTML = `
        <div class="project-tags" style="margin-bottom:14px;">
          ${project.tags.map((t) => `<span class="tag-pill">${t}</span>`).join('')}
        </div>
        <h1 class="section-title" style="margin-bottom:12px;">${project.title}</h1>
        <p style="color:var(--text-secondary);margin-bottom:24px;">
          <strong>Client / Cadre :</strong> ${project.client} · <strong>Période :</strong> ${project.date}
        </p>

        <div class="detail-card" style="padding:16px;">
          <img src="${project.image}" alt="${project.imageAlt}" style="border-radius:16px;width:100%;">
        </div>

        <div class="modal-results-grid" style="margin-bottom:28px;">
          ${project.results.map((r) => `<div class="modal-result-box"><strong>${r.value}</strong><span>${r.label}</span></div>`).join('')}
        </div>

        <div class="detail-card">
          <h2 class="modal-section-h" style="margin-top:0;">1. Contexte &amp; objectifs</h2>
          <p>${project.context}</p>

          <h2 class="modal-section-h">2. Mon rôle</h2>
          <p>${project.role}</p>

          <h2 class="modal-section-h">3. Actions déployées</h2>
          <ul class="modal-list">
            ${project.actions.map((a) => `<li>${a}</li>`).join('')}
          </ul>

          <h2 class="modal-section-h">4. Outils &amp; méthodologies</h2>
          <div class="project-tags" style="margin-top:8px;">
            ${project.tools.map((t) => `<span class="project-kpi-chip">${t}</span>`).join('')}
          </div>
        </div>

        <div style="display:flex;flex-wrap:wrap;gap:14px;align-items:center;justify-content:space-between;">
          <a href="${project.deliverableUrl}" ${project.externalLink ? 'target="_blank" rel="noopener noreferrer"' : 'download'} class="btn-pill btn-pill-green">
            <span>${project.deliverableLabel}</span>
            <span class="btn-circle">${project.externalLink ? '↗' : '↓'}</span>
          </a>

          <a href="projet.html?slug=${encodeURIComponent(next.slug)}" class="btn-pill btn-pill-amber">
            <span>Projet suivant : ${next.shortTitle}</span>
            <span class="btn-circle">→</span>
          </a>
        </div>
      `;
    } catch (e) {
      root.innerHTML = `<p>Impossible de charger cette étude de cas. <a href="index.html">Retour à l'accueil</a>.</p>`;
    }
  }

  document.addEventListener('DOMContentLoaded', initProjectPage);
})();
