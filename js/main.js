/* ==========================================================================
   MAIN.JS — Portfolio Jean-Marc CODJO
   Piloté par JSON (data/site.json, data/projects.json, data/articles.json)
   ========================================================================== */

(() => {
  const ICONS = {
    search: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>',
    pen: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 1 1 3 3L7 19l-4 1 1-4Z"/></svg>',
    compass: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>',
    play: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="2" y="5" width="20" height="14" rx="4"/><polygon points="10 9 16 12 10 15 10 9" fill="currentColor"/></svg>',
    megaphone: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/></svg>',
    briefcase: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>'
  };

  let siteData = null;
  let projectsData = [];
  let articlesData = [];
  let activeCategory = 'Tous';
  let toastTimer = null;

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  function showToast(message, isError = false) {
    const toast = $('#toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.toggle('is-error', isError);
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 4000);
  }

  /* ------------------------------------------------------------------------
     THÈME CLAIR / SOMBRE
     ------------------------------------------------------------------------ */
  function initTheme() {
    const saved = localStorage.getItem('jmc-theme');
    if (saved === 'dark') document.documentElement.setAttribute('data-theme', 'dark');

    const btn = $('#theme-toggle');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      if (isDark) {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('jmc-theme', 'light');
      } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('jmc-theme', 'dark');
      }
    });
  }

  /* ------------------------------------------------------------------------
     NAVBAR SCROLL, ANCRE ACTIVE & MENU MOBILE
     ------------------------------------------------------------------------ */
  function initNavigation() {
    const header = $('#site-header');
    const burger = $('#burger-btn');
    const closeBtn = $('#close-menu-btn');
    const mobileMenu = $('#mobile-menu');

    const progressBar = $('#scroll-progress');
    const backTopBtn = $('#back-to-top');

    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      if (header) header.classList.toggle('is-scrolled', y > 30);
      if (backTopBtn) backTopBtn.classList.toggle('is-visible', y > 520);
      if (progressBar) {
        const docH = document.documentElement.scrollHeight - window.innerHeight;
        const pct = docH > 0 ? Math.min(100, Math.max(0, (y / docH) * 100)) : 0;
        progressBar.style.width = `${pct}%`;
      }
    }, { passive: true });

    backTopBtn?.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    const openMenu = () => {
      mobileMenu?.classList.add('is-open');
      mobileMenu?.setAttribute('aria-hidden', 'false');
      burger?.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    };

    const closeMenu = () => {
      mobileMenu?.classList.remove('is-open');
      mobileMenu?.setAttribute('aria-hidden', 'true');
      burger?.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    };

    burger?.addEventListener('click', openMenu);
    closeBtn?.addEventListener('click', closeMenu);
    mobileMenu?.addEventListener('click', (e) => {
      if (e.target === mobileMenu) closeMenu();
    });
    $$('.mobile-nav-list a').forEach((a) => a.addEventListener('click', closeMenu));

    // Lien actif selon la section visible
    const sections = $$('main section[id]');
    const navLinks = $$('.nav-links a');
    if ('IntersectionObserver' in window && sections.length) {
      const obs = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            navLinks.forEach((link) => {
              link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
            });
          }
        });
      }, { rootMargin: '-35% 0px -55% 0px' });
      sections.forEach((sec) => obs.observe(sec));
    }
  }

  /* ------------------------------------------------------------------------
     EMAIL ANTI-SPAM (ASSEMBLÉ EN JAVASCRIPT)
     ------------------------------------------------------------------------ */
  function initObfuscatedEmail(emailParts) {
    const email = `${emailParts.user}@${emailParts.domain}`;
    const contactLink = $('#email-contact-link');
    const contactVal = $('#email-contact-value');
    const footerEmailIcon = $('#footer-email-icon');
    const footerEmailText = $('#footer-email-text');

    if (contactLink && contactVal) {
      contactLink.href = `mailto:${email}`;
      contactVal.textContent = email;
    }
    if (footerEmailIcon) {
      footerEmailIcon.href = `mailto:${email}`;
    }
    if (footerEmailText) {
      footerEmailText.innerHTML = `<a href="mailto:${email}">${email}</a>`;
    }
  }

  /* ------------------------------------------------------------------------
     TÉLÉCHARGEMENT DU CV (FEEDBACK + CONTRÔLE EXISTENCE + ANALYTICS)
     ------------------------------------------------------------------------ */
  function initCvButtons() {
    $$('.btn-cv').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        e.preventDefault();
        const url = btn.getAttribute('href');
        const filename = btn.getAttribute('download') || 'CV-Jean-Marc-CODJO.pdf';
        const source = btn.getAttribute('data-cv-source') || 'unknown';
        const labelEl = btn.querySelector('.cv-btn-label');
        const originalText = labelEl ? labelEl.textContent : '';

        btn.classList.add('is-loading');
        if (labelEl) labelEl.textContent = 'Téléchargement en cours…';

        try {
          const res = await fetch(url, { method: 'HEAD' });
          if (!res.ok) throw new Error('Fichier CV introuvable');

          // Analytics (GA4 / GTM / compteur local)
          const count = Number(localStorage.getItem('jmc-cv-downloads') || 0) + 1;
          localStorage.setItem('jmc-cv-downloads', String(count));
          if (typeof window.gtag === 'function') {
            window.gtag('event', 'cv_download', { event_category: 'engagement', event_label: source });
          }
          if (Array.isArray(window.dataLayer)) {
            window.dataLayer.push({ event: 'cv_download', source });
          }

          // Déclencher le téléchargement réel
          const link = document.createElement('a');
          link.href = url;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          link.remove();

          showToast('Votre téléchargement du CV (PDF ATS) a démarré.');
        } catch (err) {
          showToast('Impossible de récupérer le fichier CV pour le moment. Contactez-moi directement pour le recevoir.', true);
        } finally {
          setTimeout(() => {
            btn.classList.remove('is-loading');
            if (labelEl) labelEl.textContent = originalText;
          }, 900);
        }
      });
    });
  }

  /* ------------------------------------------------------------------------
     RENDU DES SECTIONS PILOTÉES PAR JSON
     ------------------------------------------------------------------------ */
  function renderMarquee(items) {
    const html = [...items, ...items]
      .map((t) => `<span class="marquee-item">${t}<span class="marquee-star" aria-hidden="true">✱</span></span>`)
      .join('');
    const top = $('#marquee-top');
    const bottom = $('#marquee-bottom');
    if (top) top.innerHTML = html;
    if (bottom) bottom.innerHTML = html;
  }

  function renderServices(services) {
    const grid = $('#services-grid');
    if (!grid) return;
    grid.innerHTML = services.map((s) => `
      <article class="service-card reveal">
        <span class="service-icon" aria-hidden="true">${ICONS[s.icon] || ICONS.compass}</span>
        <h3>${s.title}</h3>
        <p>${s.short}</p>
        <button type="button" class="service-link" data-service-id="${s.id}">
          <span>En savoir plus</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
        </button>
      </article>
    `).join('');

    $$('[data-service-id]', grid).forEach((btn) => {
      btn.addEventListener('click', () => {
        const srv = services.find((x) => x.id === btn.dataset.serviceId);
        if (srv) openServiceModal(srv);
      });
    });
  }

  function renderAbout(about) {
    const pillsEl = $('#about-pills');
    const paraEl = $('#about-paragraphs');
    const statsEl = $('#about-stats');

    if (pillsEl) {
      pillsEl.innerHTML = about.pills.map((p) => `<span class="about-pill">${p}</span>`).join('');
    }
    if (paraEl) {
      paraEl.innerHTML = about.paragraphs.map((p) => `<p>${p}</p>`).join('');
    }
    if (statsEl) {
      statsEl.innerHTML = about.stats.map((st) => `
        <div class="stat-box ${st.placeholder ? 'is-placeholder' : ''}">
          <div class="stat-value" ${st.numeric !== null ? `data-counter="${st.numeric}" data-suffix="${st.suffix}"` : ''}>
            ${st.value}
          </div>
          <div class="stat-label">${st.label}</div>
        </div>
      `).join('');
    }
  }

  function renderTools(tools) {
    const grid = $('#tools-grid');
    if (!grid) return;
    grid.innerHTML = tools.map((t, i) => {
      const segs = t.segments || 2;
      const bars = [1, 2, 3].map((n) => `<span class="tool-bar-seg ${n <= segs ? 'is-filled' : ''}"></span>`).join('');
      return `
        <article class="tool-card reveal" style="transition-delay:${(i % 4) * 55}ms;">
          <span class="tool-logo" style="background:${t.color};" aria-hidden="true">${t.abbr}</span>
          <h3 class="tool-name">${t.name}</h3>
          <span class="tool-cat">${t.category}</span>
          <div class="tool-bars" aria-hidden="true">${bars}</div>
          <span class="tool-level">${t.proposedLevel}</span>
        </article>
      `;
    }).join('');
  }

  function renderProjectFilters() {
    const bar = $('#project-filters');
    if (!bar) return;
    const cats = ['Tous', ...new Set(projectsData.map((p) => p.category))];
    bar.innerHTML = cats.map((c) => `
      <button type="button" class="filter-btn ${c === activeCategory ? 'active' : ''}" role="tab" aria-selected="${c === activeCategory}" data-filter="${c}">
        ${c}
      </button>
    `).join('');

    $$('.filter-btn', bar).forEach((btn) => {
      btn.addEventListener('click', () => {
        activeCategory = btn.dataset.filter;
        renderProjectFilters();
        renderProjects();
      });
    });
  }

  function renderProjects() {
    const grid = $('#projects-grid');
    if (!grid) return;
    const list = activeCategory === 'Tous'
      ? projectsData
      : projectsData.filter((p) => p.category === activeCategory || p.tags.includes(activeCategory));

    // Affichage ultra-épuré en menu dépliant : on voit uniquement le titre court (ex. "Audit 360°"), les détails apparaissent dynamiquement au clic
    grid.innerHTML = list.map((p, idx) => `
      <article class="project-accordion-item reveal is-visible" data-project-slug="${p.slug}">
        <button type="button" class="project-accordion-trigger" aria-expanded="false" aria-controls="proj-panel-${idx}">
          <div class="project-accordion-left">
            <span class="project-num-badge" aria-hidden="true">${p.number}</span>
            <div class="project-accordion-heading">
              <h3 class="project-accordion-title">${p.shortTitle}</h3>
              <div class="project-accordion-meta">
                <span class="tag-pill">${p.category}</span>
              </div>
            </div>
          </div>
          <span class="project-toggle-icon" aria-hidden="true">+</span>
        </button>

        <div class="project-accordion-panel" id="proj-panel-${idx}">
          <div class="project-accordion-body">
            <div class="project-detail-layout">
              <div>
                <div class="project-detail-visual">
                  <img src="${p.image}" alt="${p.imageAlt}" loading="lazy" width="800" height="520">
                </div>
                <div class="modal-results-grid" style="margin-top:14px;grid-template-columns:repeat(2,1fr);">
                  ${p.results.map((r) => `<div class="modal-result-box"><strong>${r.value}</strong><span>${r.label}</span></div>`).join('')}
                </div>
              </div>

              <div>
                <p style="font-size:0.88rem;color:var(--text-secondary);margin-bottom:10px;">
                  <strong>Cadre / Client :</strong> ${p.client}
                </p>
                <h4 class="modal-section-h" style="margin-top:4px;">Contexte &amp; enjeu</h4>
                <p style="font-size:0.92rem;">${p.context}</p>

                <h4 class="modal-section-h">Mon rôle</h4>
                <p style="font-size:0.92rem;">${p.role}</p>

                <h4 class="modal-section-h">Actions clés</h4>
                <ul class="modal-list">
                  ${p.actions.map((a) => `<li>${a}</li>`).join('')}
                </ul>

                <h4 class="modal-section-h">Outils &amp; méthodes</h4>
                <div class="project-tags" style="margin-top:6px;">
                  ${p.tools.map((t) => `<span class="project-kpi-chip">${t}</span>`).join('')}
                </div>
              </div>
            </div>

            <div class="project-actions">
              <a href="${p.deliverableUrl}" ${p.externalLink ? 'target="_blank" rel="noopener noreferrer"' : 'download'} class="btn-pill btn-pill-green">
                <span>${p.deliverableLabel}</span>
                <span class="btn-circle" aria-hidden="true">${p.externalLink ? '↗' : '↓'}</span>
              </a>
              <a href="projet.html?slug=${encodeURIComponent(p.slug)}" class="btn-pill btn-pill-outline">
                Ouvrir la page dédiée →
              </a>
            </div>
          </div>
        </div>
      </article>
    `).join('');

    // Logique du menu dépliant (un clic déplie/replie en douceur)
    $$('.project-accordion-item', grid).forEach((item) => {
      const btn = $('.project-accordion-trigger', item);
      const panel = $('.project-accordion-panel', item);
      btn.addEventListener('click', () => {
        const wasOpen = item.classList.contains('is-open');
        $$('.project-accordion-item', grid).forEach((other) => {
          other.classList.remove('is-open');
          $('.project-accordion-trigger', other).setAttribute('aria-expanded', 'false');
          $('.project-accordion-panel', other).style.maxHeight = '0px';
        });
        if (!wasOpen) {
          item.classList.add('is-open');
          btn.setAttribute('aria-expanded', 'true');
          panel.style.maxHeight = `${panel.scrollHeight + 40}px`;
        }
      });
    });
  }

  function renderJourney(education, experience, certs, languages) {
    const eduEl = $('#education-timeline');
    const expEl = $('#experience-timeline');
    const certsEl = $('#certs-grid');
    const langsEl = $('#langs-list');

    if (eduEl) {
      eduEl.innerHTML = education.map((e) => `
        <div class="timeline-item">
          <span class="timeline-period">${e.period}</span>
          <h4 class="timeline-title">${e.title}</h4>
          <div class="timeline-org">${e.institution}</div>
          <p class="timeline-desc">${e.details}</p>
        </div>
      `).join('');
    }

    if (expEl) {
      expEl.innerHTML = experience.map((x) => `
        <div class="timeline-item">
          <span class="timeline-period">${x.period}</span>
          <h4 class="timeline-title">${x.title}</h4>
          <div class="timeline-org">${x.company}</div>
          <p class="timeline-desc">${x.details}</p>
        </div>
      `).join('');
    }

    if (certsEl) {
      certsEl.innerHTML = certs.map((c) => `
        <article class="cert-badge">
          <div class="cert-top">
            <span class="cert-cat">${c.category}</span>
            <span class="cert-date">${c.date}</span>
          </div>
          <h4 class="cert-title">${c.title}</h4>
          <div class="cert-issuer">${c.issuer}</div>
          ${c.verifyUrl
            ? `<a href="${c.verifyUrl}" target="_blank" rel="noopener noreferrer" class="cert-verify">Vérifier le certificat (${c.code}) ↗</a>`
            : (c.code ? `<span class="cert-verify" style="opacity:.8;">Réf. : ${c.code}</span>` : '')
          }
        </article>
      `).join('');
    }

    if (langsEl) {
      langsEl.innerHTML = languages.map((l) => `
        <span class="lang-pill"><strong>${l.name}</strong> — ${l.level}</span>
      `).join('');
    }
  }

  function renderMethod(steps) {
    const grid = $('#method-grid');
    if (!grid) return;
    grid.innerHTML = steps.map((s) => `
      <article class="method-card ${s.highlighted ? 'is-highlighted' : ''} reveal">
        <span class="method-step">${s.step}</span>
        <h3>${s.title}</h3>
        <p class="method-summary">${s.summary}</p>
        <ul class="method-points">
          ${s.points.map((pt) => `<li><span class="method-check" aria-hidden="true">✓</span><span>${pt}</span></li>`).join('')}
        </ul>
      </article>
    `).join('');
  }

  function renderTestimonials(config, testimonials) {
    const section = $('#temoignages');
    const box = $('#testimonials-container');
    if (!section || !box) return;

    if (!config.showTestimonials) {
      section.style.display = 'none';
      return;
    }

    if (!testimonials || testimonials.length === 0) {
      box.innerHTML = `
        <div class="testimonials-placeholder">
          <h3>[[TÉMOIGNAGES À FOURNIR PAR JEAN-MARC]]</h3>
          <p>
            Cette section est volontairement laissée sans faux avis. Dès que vous aurez recueilli vos recommandations clients ou LinkedIn (HONADI AGENCIES, KPAMEMA SARL, SEMJuice, créateurs YouTube), ajoutez-les dans <code>data/site.json</code> — ou passez <code>"showTestimonials": false</code> pour masquer instantanément ce bloc.
          </p>
        </div>
      `;
      return;
    }

    box.innerHTML = `
      <div class="services-grid">
        ${testimonials.map((t) => `
          <blockquote class="service-card">
            <p style="font-style:italic;">« ${t.quote} »</p>
            <footer style="font-weight:700;margin-top:8px;">${t.author} <span style="font-weight:500;color:var(--text-secondary);">— ${t.role}</span></footer>
          </blockquote>
        `).join('')}
      </div>
    `;
  }

  function renderArticles(config, articles) {
    const section = $('#articles');
    const grid = $('#blog-grid');
    if (!section || !grid) return;

    if (!config.showBlog || !articles.length) {
      section.style.display = 'none';
      return;
    }

    grid.innerHTML = articles.map((a) => `
      <article class="article-card reveal">
        <a href="article.html?slug=${encodeURIComponent(a.slug)}" class="article-thumb" aria-label="${a.title}">
          <img src="${a.image}" alt="${a.title}" loading="lazy" width="800" height="520">
        </a>
        <div class="article-body">
          <div class="article-meta">
            <span class="tag-pill">${a.category}</span>
            <span>${a.dateDisplay}</span>
            <span>· ${a.readTime}</span>
          </div>
          <h3><a href="article.html?slug=${encodeURIComponent(a.slug)}">${a.title}</a></h3>
          <p>${a.excerpt}</p>
          <a href="article.html?slug=${encodeURIComponent(a.slug)}" class="project-link-btn" style="margin-top:4px;">Lire l'article →</a>
        </div>
      </article>
    `).join('');
  }

  function renderFaq(faqs) {
    const list = $('#faq-list');
    if (!list) return;
    list.innerHTML = faqs.map((item, idx) => `
      <div class="faq-item ${idx === 0 ? 'is-open' : ''}">
        <button type="button" class="faq-trigger" aria-expanded="${idx === 0}" aria-controls="faq-panel-${idx}">
          <span>${item.question}</span>
          <span class="faq-plus" aria-hidden="true">+</span>
        </button>
        <div class="faq-panel" id="faq-panel-${idx}" style="${idx === 0 ? 'max-height:360px;' : ''}">
          <div class="faq-answer">${item.answer}</div>
        </div>
      </div>
    `).join('');

    $$('.faq-item', list).forEach((item) => {
      const btn = $('.faq-trigger', item);
      const panel = $('.faq-panel', item);
      btn.addEventListener('click', () => {
        const wasOpen = item.classList.contains('is-open');
        $$('.faq-item', list).forEach((other) => {
          other.classList.remove('is-open');
          $('.faq-trigger', other).setAttribute('aria-expanded', 'false');
          $('.faq-panel', other).style.maxHeight = '0px';
        });
        if (!wasOpen) {
          item.classList.add('is-open');
          btn.setAttribute('aria-expanded', 'true');
          panel.style.maxHeight = `${panel.scrollHeight + 16}px`;
        }
      });
    });
  }

  /* ------------------------------------------------------------------------
     MODALES (ÉTUDE DE CAS & SERVICE)
     ------------------------------------------------------------------------ */
  function openModal(html) {
    const backdrop = $('#modal-backdrop');
    const body = $('#modal-body');
    if (!backdrop || !body) return;
    body.innerHTML = html;
    backdrop.classList.add('is-open');
    backdrop.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    $('#modal-close')?.focus();
  }

  function closeModal() {
    const backdrop = $('#modal-backdrop');
    if (!backdrop) return;
    backdrop.classList.remove('is-open');
    backdrop.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function initModalEvents() {
    $('#modal-close')?.addEventListener('click', closeModal);
    $('#modal-backdrop')?.addEventListener('click', (e) => {
      if (e.target.id === 'modal-backdrop') closeModal();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeModal();
    });
  }

  function openServiceModal(service) {
    openModal(`
      <span class="tag-pill" style="margin-bottom:12px;display:inline-block;">Service</span>
      <h2 id="modal-title" style="font-size:1.55rem;font-weight:800;margin-bottom:10px;">${service.title}</h2>
      <p style="color:var(--text-secondary);margin-bottom:16px;">${service.short}</p>
      <h3 class="modal-section-h">Livrables &amp; interventions inclus</h3>
      <ul class="modal-list">
        ${service.deliverables.map((d) => `<li>${d}</li>`).join('')}
      </ul>
      <div style="margin-top:24px;display:flex;flex-wrap:wrap;gap:12px;">
        <a href="#contact" class="btn-pill btn-pill-green" onclick="document.getElementById('modal-close').click();">
          <span>Discuter de ce service</span>
          <span class="btn-circle">→</span>
        </a>
      </div>
    `);
  }

  function openProjectModal(project) {
    const idx = projectsData.findIndex((p) => p.slug === project.slug);
    const nextProj = projectsData[(idx + 1) % projectsData.length];

    openModal(`
      <div class="project-tags" style="margin-bottom:12px;">
        ${project.tags.map((t) => `<span class="tag-pill">${t}</span>`).join('')}
      </div>
      <h2 id="modal-title" style="font-size:1.45rem;font-weight:800;line-height:1.25;margin-bottom:6px;">${project.title}</h2>
      <p style="font-size:0.88rem;color:var(--text-secondary);margin-bottom:16px;">
        <strong>Client / Cadre :</strong> ${project.client} · ${project.date}
      </p>
      <img src="${project.image}" alt="${project.imageAlt}" style="border-radius:16px;margin-bottom:16px;border:1px solid var(--border);">

      <div class="modal-results-grid">
        ${project.results.map((r) => `<div class="modal-result-box"><strong>${r.value}</strong><span>${r.label}</span></div>`).join('')}
      </div>

      <h3 class="modal-section-h">Contexte &amp; enjeu</h3>
      <p style="font-size:0.93rem;">${project.context}</p>

      <h3 class="modal-section-h">Mon rôle</h3>
      <p style="font-size:0.93rem;">${project.role}</p>

      <h3 class="modal-section-h">Actions réalisées</h3>
      <ul class="modal-list">
        ${project.actions.map((a) => `<li>${a}</li>`).join('')}
      </ul>

      <h3 class="modal-section-h">Outils &amp; méthodologies</h3>
      <div class="project-tags" style="margin-bottom:20px;">
        ${project.tools.map((t) => `<span class="project-kpi-chip">${t}</span>`).join('')}
      </div>

      <div style="display:flex;flex-wrap:wrap;gap:12px;align-items:center;justify-content:space-between;padding-top:16px;border-top:1px solid var(--border);">
        <div style="display:flex;flex-wrap:wrap;gap:10px;">
          <a href="${project.deliverableUrl}" ${project.externalLink ? 'target="_blank" rel="noopener noreferrer"' : 'download'} class="btn-pill btn-pill-green">
            <span>${project.deliverableLabel}</span>
            <span class="btn-circle">${project.externalLink ? '↗' : '↓'}</span>
          </a>
          <a href="projet.html?slug=${encodeURIComponent(project.slug)}" class="btn-pill btn-pill-outline">Page dédiée</a>
        </div>
        <button type="button" class="project-link-btn" id="next-project-modal-btn">
          Projet suivant (${nextProj.number}) →
        </button>
      </div>
    `);

    $('#next-project-modal-btn')?.addEventListener('click', () => openProjectModal(nextProj));
  }

  /* ------------------------------------------------------------------------
     FORMULAIRE DE CONTACT (VALIDATION + ANTI-SPAM + FORMSPREE READY)
     ------------------------------------------------------------------------ */
  function initContactForm(config) {
    const form = $('#contact-form');
    const feedback = $('#form-feedback');
    const submitBtn = $('#contact-submit');
    if (!form || !feedback) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      feedback.className = 'form-feedback';
      feedback.textContent = '';

      // Anti-spam honeypot
      if ($('#website', form)?.value.trim()) {
        form.reset();
        return;
      }

      const name = $('#name', form).value.trim();
      const email = $('#email', form).value.trim();
      const subject = $('#subject', form).value.trim();
      const message = $('#message', form).value.trim();

      if (!name || !email || !subject || message.length < 15) {
        feedback.classList.add('is-error');
        feedback.textContent = 'Merci de renseigner tous les champs obligatoires (message de 15 caractères minimum).';
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        feedback.classList.add('is-error');
        feedback.textContent = 'Veuillez saisir une adresse e-mail valide.';
        return;
      }

      submitBtn.disabled = true;

      try {
        if (config.formspreeEndpoint) {
          const res = await fetch(config.formspreeEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify({ name, email, subject, message })
          });
          if (!res.ok) throw new Error('Erreur serveur');
          feedback.classList.add('is-success');
          feedback.textContent = `Merci ${name} ! Votre message a bien été envoyé. Je vous répondrai rapidement.`;
          form.reset();
        } else {
          // Mode local / avant configuration Formspree : confirmation + ouverture mailto optionnelle
          feedback.classList.add('is-success');
          feedback.textContent = `Merci ${name} ! Votre demande est validée (mode aperçu local : renseignez votre endpoint Formspree dans data/site.json pour activer l'envoi automatique, ou écrivez directement sur WhatsApp).`;
          form.reset();
        }
      } catch (err) {
        feedback.classList.add('is-error');
        feedback.textContent = "L'envoi a échoué momentanément. Vous pouvez me joindre directement sur WhatsApp (+229 01 66 57 88 80) ou par e-mail.";
      } finally {
        submitBtn.disabled = false;
      }
    });
  }

  /* ------------------------------------------------------------------------
     ANIMATIONS AU SCROLL & COMPTEURS ANIMÉS
     ------------------------------------------------------------------------ */
  function initRevealAndCounters() {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const reveals = $$('.reveal');

    if (reduced || !('IntersectionObserver' in window)) {
      reveals.forEach((el) => el.classList.add('is-visible'));
      return;
    }

    const revealObs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    reveals.forEach((el) => revealObs.observe(el));

    // Compteurs animés
    const counters = $$('[data-counter]');
    const counterObs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = Number(el.dataset.counter);
        const suffix = el.dataset.suffix || '';
        const duration = 900;
        const start = performance.now();

        const tick = (now) => {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          el.textContent = `${Math.round(target * eased)}${suffix}`;
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        counterObs.unobserve(el);
      });
    }, { threshold: 0.5 });

    counters.forEach((c) => counterObs.observe(c));

    // 3D Tilt + Spotlight interactif sur les cartes + rotation dynamique Hero
    initDynamicMotion();
  }

  function initDynamicMotion() {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 1. Rotation fluide des expertises dans le Hero
    const tickerEl = $('#hero-ticker-word');
    if (tickerEl) {
      const roles = [
        'Gestion de Projets Marketing 360°',
        'Stratégie SEO & Architecture Éditoriale',
        'Copywriting Orienté Conversion',
        'Croissance & Monétisation YouTube',
        'Acquisition Digitale & Développement B2B'
      ];
      let idx = 0;
      setInterval(() => {
        tickerEl.classList.add('is-switching');
        setTimeout(() => {
          idx = (idx + 1) % roles.length;
          tickerEl.textContent = roles[idx];
          tickerEl.classList.remove('is-switching');
        }, 260);
      }, 2800);
    }

    if (reduced || window.matchMedia('(pointer: coarse)').matches) return;

    // 2. Effet 3D Tilt + reflet lumineux dynamique au passage de la souris
    const cards = $$('.service-card, .tool-card, .cert-badge, .method-card, .article-card');
    cards.forEach((card) => {
      card.classList.add('tilt-card');
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const rx = ((y / rect.height) - 0.5) * -7;
        const ry = ((x / rect.width) - 0.5) * 7;
        card.style.setProperty('--mx', `${x}px`);
        card.style.setProperty('--my', `${y}px`);
        card.style.transform = `perspective(700px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) translateY(-5px)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });

    // 3. Boutons pilules légèrement magnétiques au survol
    $$('.btn-pill').forEach((btn) => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const dx = (e.clientX - (rect.left + rect.width / 2)) * 0.14;
        const dy = (e.clientY - (rect.top + rect.height / 2)) * 0.18;
        btn.style.transform = `translate(${dx.toFixed(1)}px, ${(dy - 2).toFixed(1)}px)`;
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
      });
    });
  }

  /* ------------------------------------------------------------------------
     INITIALISATION GLOBALE
     ------------------------------------------------------------------------ */
  async function boot() {
    initTheme();
    initNavigation();
    initModalEvents();
    initCvButtons();

    const yearEl = $('#current-year');
    if (yearEl) yearEl.textContent = String(new Date().getFullYear());

    try {
      const [siteRes, projRes, artRes] = await Promise.all([
        fetch('data/site.json'),
        fetch('data/projects.json'),
        fetch('data/articles.json')
      ]);

      siteData = await siteRes.json();
      projectsData = await projRes.json();
      articlesData = await artRes.json();

      initObfuscatedEmail(siteData.identity.emailParts);
      renderMarquee(siteData.marquee);
      renderServices(siteData.services);
      renderAbout(siteData.about);
      renderTools(siteData.tools);
      renderProjectFilters();
      renderProjects();
      renderJourney(siteData.education, siteData.experience, siteData.certifications, siteData.languages);
      renderMethod(siteData.method);
      renderTestimonials(siteData.config, siteData.testimonials);
      renderArticles(siteData.config, articlesData);
      renderFaq(siteData.faq);
      initContactForm(siteData.config);
      initRevealAndCounters();
    } catch (err) {
      console.error('Erreur de chargement des données JSON:', err);
      showToast('Ouvrez le portfolio via un serveur local (ex. Vercel, Netlify ou Live Server) pour charger les données JSON.', true);
    }
  }

  document.addEventListener('DOMContentLoaded', boot);
})();
