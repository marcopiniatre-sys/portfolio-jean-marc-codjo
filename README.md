# Portfolio Web — Jean-Marc CODJO

Portfolio dynamique, moderne, responsive et optimisé SEO de **Jean-Marc CODJO** — *Chef de Projet Marketing 360° & Stratégiste SEO*.

## Architecture & Choix Technique

- **HTML5 sémantique + CSS3 Design Tokens (`css/tokens.css`, `css/style.css`) + JavaScript ES6 modulaire (`js/`)**
- **100 % piloté par fichiers JSON (`data/site.json`, `data/projects.json`, `data/articles.json`)** : modifiez votre contenu, vos projets, vos articles ou vos niveaux d'outils sans toucher au code.
- **Zéro dépendance lourde** : temps de chargement ultra-rapide sur connexions moyennes, score Lighthouse > 95, SEO natif (HTML pré-rendu, balisage Hn, Open Graph, Schema.org `Person`, `WebSite`, `Article`, `sitemap.xml`, `robots.txt`).
- **Protection des données** : aucune coordonnée de référence professionnelle affichée publiquement ; e-mail assemblé dynamiquement en JavaScript anti-spam ; champ honeypot sur le formulaire.

---

## Arborescence

```text
portfolio-jean-marc-codjo/
├── index.html                    # Accueil one-page (14 sections)
├── projet.html                   # Page dédiée d'étude de cas (?slug=...)
├── article.html                  # Page dédiée d'article (?slug=...)
├── css/
│   ├── tokens.css                # Palette Bleu & Blanc (#0F2C59 / #2563EB / #FFFFFF), typo, mode sombre
│   └── style.css                 # Composants, responsive mobile-first, animations
├── js/
│   ├── main.js                   # Rendu JSON, filtres, modales, CV, formulaire, FAQ
│   ├── project-page.js           # Contrôleur page projet
│   └── article-page.js           # Contrôleur page article + Schema.org Article
├── data/
│   ├── site.json                 # Identité, services, outils, parcours, certifs, FAQ
│   ├── projects.json             # Études de cas (5 livrables NOXA IT + YouTube Axe de l'Éveil)
│   └── articles.json             # Articles du blog
├── public/
│   ├── cv/CV-Jean-Marc-CODJO.pdf # CV ATS téléchargeable
│   ├── deliverables/             # 5 livrables réels NOXA IT téléchargeables
│   └── images/                   # Portrait intact détouré + studio unicolore + visuels projets
├── robots.txt
├── sitemap.xml
├── vercel.json
└── netlify.toml
```

---

## Prévisualisation locale (sans Node.js requis)

Double-cliquez simplement sur **`OUVRIR_MON_PORTFOLIO.bat`** à la racine du dossier : un serveur local démarre instantanément et ouvre votre portfolio dans votre navigateur sur `http://127.0.0.1:8080/` (aucune installation de Node.js requise).

Alternativement :
1. **Via VS Code Live Server** : clic droit sur `index.html` → *Open with Live Server*.
2. **Ou directement en déployant en 30 secondes sur Netlify Drop / Vercel** (voir ci-dessous).

---

## Comment personnaliser sans toucher au code

### 1. Remplacer le CV PDF
Remplacez simplement le fichier `public/cv/CV-Jean-Marc-CODJO.pdf` par votre nouvelle version en conservant exactement le même nom. Tous les boutons (navbar, hero, à propos, footer, pages détail) serviront automatiquement le nouveau fichier.

### 2. Ajouter un projet ou une étude de cas
Ouvrez `data/projects.json` et ajoutez un objet sur le même modèle :
```json
{
  "slug": "mon-nouveau-projet",
  "number": "07",
  "title": "Titre complet du projet",
  "shortTitle": "Titre court carte",
  "category": "SEO & Contenu",
  "tags": ["SEO & Contenu", "Copywriting"],
  "date": "2026",
  "client": "Nom du client",
  "image": "public/images/projects/mon-visuel.webp",
  "imageAlt": "Description accessible de l'image",
  "excerpt": "Résumé court affiché sur la carte.",
  "context": "Contexte et problématique.",
  "role": "Votre rôle exact.",
  "tools": ["Semrush", "YourTextGuru"],
  "actions": ["Action 1", "Action 2"],
  "results": [{ "value": "+45 %", "label": "Trafic organique" }],
  "deliverableUrl": "https://...",
  "deliverableLabel": "Voir le projet",
  "externalLink": true
}
```

### 3. Ajouter un article de blog
Ouvrez `data/articles.json` et ajoutez un objet contenant `slug`, `title`, `category`, `date`, `dateDisplay`, `readTime`, `image`, `metaDescription`, `excerpt` et `sections` (`heading` + `paragraphs`).
Pour masquer toute la section blog, passez `"showBlog": false` dans `data/site.json`.

### 4. Valider vos niveaux d'outils, chiffres et témoignages
Ouvrez `data/site.json` :
- **Chiffre « Projets réalisés »** : remplacez `"[[À CONFIRMER]]"` dans `about.stats` par votre chiffre exact (ex. `"12+"`, `"numeric": 12`, `"suffix": "+"`, `"placeholder": false`).
- **Niveaux d'outils** : ajustez `proposedLevel` (`Expert`, `Avancé`, `Intermédiaire`) et passez `"validated": true` sur chaque outil dans `tools`.
- **Témoignages** : ajoutez vos avis dans `testimonials: [...]`, ou passez `"showTestimonials": false` pour masquer la section.

### 5. Activer l'envoi réel du formulaire de contact (Formspree — gratuit)
1. Créez un compte gratuit sur [formspree.io](https://formspree.io) et créez un formulaire lié à `marcopiniatre@gmail.com`.
2. Copiez l'URL du formulaire (ex. `https://formspree.io/f/xxxxxxx`).
3. Collez-la dans `data/site.json` → `"formspreeEndpoint": "https://formspree.io/f/xxxxxxx"`.

---

## Déploiement en 1 clic (Gratuit)

### Option A — Vercel (recommandé)
1. Créez un dépôt GitHub et poussez ce dossier.
2. Connectez le dépôt sur [vercel.com](https://vercel.com) → cliquez sur **Deploy** (aucune commande de build nécessaire).
3. Mettez à jour l'URL réelle dans `sitemap.xml`, `robots.txt` et `data/site.json`.

### Option B — Netlify Drop (sans Git)
1. Rendez-vous sur [app.netlify.com/drop](https://app.netlify.com/drop).
2. Glissez-déposez simplement le dossier `portfolio-jean-marc-codjo/`. Votre site est en ligne immédiatement avec HTTPS !
