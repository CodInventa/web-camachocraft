#!/usr/bin/env node
/* ==========================================================================
   Camacho Remodeling — static site generator (zero dependencies)

   Every visible text lives here once, in English AND Spanish:
       t("key", "English text", "Texto en español")
   Running `node src/build.mjs` writes the final HTML pages to the repo root
   and the Spanish dictionary to assets/js/i18n.js. GitHub Actions runs this
   automatically on every push, so you only edit this file.
   ========================================================================== */

import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

/* --------------------------------------------------------------------------
   BUSINESS INFO — update here, then rebuild.
   -------------------------------------------------------------------------- */
const CONFIG = {
  name: "Camacho Remodeling",
  phoneDisplay: "(580) 555-0199",       // TODO: real phone number
  phoneE164: "+15805550199",            // TODO: same number, E.164 format
  whatsapp: "15805550199",              // TODO: WhatsApp number, digits only
  email: "info@camachoremodeling.com",  // TODO: real email
  city: "Guymon",
  region: "OK",
  siteUrl: "https://codinventa.github.io/web-camachocraft/", // change if you add a custom domain
  formEndpoint: "",                     // optional Formspree/Getform URL (see README)
  towns: ["Guymon", "Hooker", "Goodwell", "Texhoma", "Tyrone", "Hardesty", "Boise City"]
};

/* --------------------------------------------------------------------------
   i18n helpers
   -------------------------------------------------------------------------- */
const ES = {};
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
/** register a string and return the English version */
function t(key, en, es) {
  if (ES[key] !== undefined && ES[key] !== es) throw new Error(`i18n key reused with different text: ${key}`);
  ES[key] = es;
  return en;
}
/** <tag data-i18n="key">English</tag> */
const T = (tag, key, en, es, attrs = "") => `<${tag}${attrs ? " " + attrs : ""} data-i18n="${key}">${t(key, en, es)}</${tag}>`;
/** translatable attributes: A(["alt","key","en","es"], ["title", ...]) */
function A(...pairs) {
  const out = pairs.map(([attr, key, en, es]) => `${attr}="${esc(t(key, en, es))}"`);
  return `${out.join(" ")} data-i18n-attr="${pairs.map(([attr, key]) => `${attr}:${key}`).join(";")}"`;
}

/* --------------------------------------------------------------------------
   Icons (Lucide-style, 24px stroke)
   -------------------------------------------------------------------------- */
const P = {
  check: '<path d="M20 6 9 17l-5-5"/>',
  phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>',
  mail: '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
  chat: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
  pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/>',
  home: '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  sparkles: '<path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/>',
  calendar: '<rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/><path d="m9 16 2 2 4-4"/>',
  clipboard: '<rect width="8" height="4" x="8" y="2" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4M12 16h4M8 11h.01M8 16h.01"/>',
  hammer: '<path d="m15 12-8.5 8.5a2.12 2.12 0 0 1-3-3L12 9"/><path d="M17.64 15 22 10.64"/><path d="m20.91 11.7-1.25-1.25a2 2 0 0 1-.59-1.42V7.83a2 2 0 0 0-.59-1.42l-2.83-2.83a5 5 0 0 0-7.07 0l3.54 3.54a2 2 0 0 1 .59 1.42v1.2a2 2 0 0 0 .59 1.41l1.25 1.25"/>',
  arrow: '<path d="M5 12h14M12 5l7 7-7 7"/>',
  left: '<path d="m15 18-6-6 6-6"/>',
  right: '<path d="m9 18 6-6-6-6"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  roller: '<rect width="16" height="6" x="2" y="2" rx="2"/><path d="M10 16v-2a2 2 0 0 1 2-2h8a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect width="4" height="6" x="8" y="16" rx="1"/>',
  layers: '<path d="m12 2 10 5-10 5L2 7z"/><path d="m2 17 10 5 10-5"/><path d="m2 12 10 5 10-5"/>',
  door: '<path d="M13 4h3a2 2 0 0 1 2 2v14"/><path d="M2 20h3M13 20h9"/><path d="M10 12v.01"/><path d="M13 4.56v16.16a1 1 0 0 1-1.24.97L5 20V5.56a2 2 0 0 1 1.51-1.94l4-1A2 2 0 0 1 13 4.56Z"/>',
  bath: '<path d="M9 6 6.5 3.5a1.5 1.5 0 0 0-1-.5C4.68 3 4 3.68 4 4.5V17a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5"/><path d="M2 12h20"/><path d="M7 19v2M17 19v2"/>',
  kitchen: '<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>',
  heart: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
  award: '<circle cx="12" cy="8" r="6"/><path d="M15.48 12.89 17 22l-5-3-5 3 1.52-9.11"/>',
  lang: '<path d="m5 8 6 6M4 14l6-6 2-3M2 5h12M7 2h1M22 22l-5-10-5 10M14 18h6"/>',
  file: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4M16 13H8M16 17H8M10 9H8"/>',
  lock: '<rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  bulb: '<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5M9 18h6M10 22h4"/>',
  wrench: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>'
};
const icon = (name, cls = "") => `<svg${cls ? ` class="${cls}"` : ""} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[name]}</svg>`;

const LOGO = `<svg class="brand-mark" viewBox="0 0 48 48" aria-hidden="true"><rect width="48" height="48" rx="12" fill="#16222E"/><path d="M10 22 24 11l14 11" fill="none" stroke="#EAA56F" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M30.06 27.5A7 7 0 1 0 30.06 34.5" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round"/></svg>`;

/* image helper with responsive srcset */
const img = (name, alt, { w = 1600, h = 1204, sizes = "(max-width: 800px) 100vw, 50vw", eager = false, cls = "" } = {}) =>
  `<img src="assets/img/${name}-800.jpg" srcset="assets/img/${name}-800.jpg 800w, assets/img/${name}.jpg ${w}w" sizes="${sizes}" width="${w}" height="${h}" ${alt}${eager ? ' fetchpriority="high"' : ' loading="lazy"'} decoding="async"${cls ? ` class="${cls}"` : ""}>`;

/* --------------------------------------------------------------------------
   Shared copy
   -------------------------------------------------------------------------- */
const CTA_ESTIMATE = () => T("span", "cta.estimate", "Get My Free Estimate", "Solicitar Presupuesto Gratis");
const CTA_SHORT = () => T("span", "cta.estimateShort", "Free Estimate", "Presupuesto Gratis");

const NAV = [
  { file: "index.html", key: "nav.home", en: "Home", es: "Inicio" },
  { file: "services.html", key: "nav.services", en: "Services", es: "Servicios" },
  { file: "gallery.html", key: "nav.gallery", en: "Project Gallery", es: "Galería de Proyectos" },
  { file: "about.html", key: "nav.about", en: "About Us", es: "Nosotros" },
  { file: "contact.html", key: "nav.contact", en: "Contact", es: "Contacto" }
];

const phoneLink = (cls = "", inner = null) =>
  `<a href="tel:${CONFIG.phoneE164}"${cls ? ` class="${cls}"` : ""}>${inner ?? CONFIG.phoneDisplay}</a>`;

/* --------------------------------------------------------------------------
   Layout
   -------------------------------------------------------------------------- */
function head(p) {
  const url = CONFIG.siteUrl + (p.file === "index.html" ? "" : p.file);
  const ogImage = CONFIG.siteUrl + "assets/img/" + (p.ogImage || "kitchen-open-concept") + ".jpg";
  const title = t(`${p.id}.title`, p.title[0], p.title[1]);
  const desc = t(`${p.id}.desc`, p.desc[0], p.desc[1]);
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
${p.base ? `<base href="${p.base}">\n` : ""}<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title data-i18n="${p.id}.title">${title}</title>
<meta name="description" content="${esc(desc)}" data-i18n-attr="content:${p.id}.desc">
<meta name="theme-color" content="#16222E">
<script>document.documentElement.classList.add("js")</script>
<link rel="canonical" href="${url}">
<link rel="alternate" hreflang="en" href="${url}">
<link rel="alternate" hreflang="es" href="${url}?lang=es">
<link rel="alternate" hreflang="x-default" href="${url}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${CONFIG.name}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${ogImage}">
<meta property="og:locale" content="en_US">
<meta property="og:locale:alternate" content="es_US">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="assets/img/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Manrope:wght@600;700;800&display=swap">
<link rel="stylesheet" href="assets/css/styles.css">
${p.headExtra || ""}</head>
<body>
${T("a", "a11y.skip", "Skip to content", "Saltar al contenido", 'class="skip-link" href="#main"')}
`;
}

function header(active) {
  const links = NAV.map((n) =>
    `<li><a href="${n.file}"${n.file === active ? ' aria-current="page"' : ""} data-i18n="${n.key}">${t(n.key, n.en, n.es)}</a></li>`
  ).join("\n          ");
  return `<header class="site-header">
  <div class="container header-inner">
    <a class="brand" href="index.html" ${A(["aria-label", "a11y.home", `${CONFIG.name} — Home`, `${CONFIG.name} — Inicio`])}>
      ${LOGO}
      <span class="brand-text"><strong>Camacho</strong><small>Remodeling</small></span>
    </a>
    <nav class="main-nav" id="main-nav" ${A(["aria-label", "a11y.mainNav", "Main navigation", "Navegación principal"])}>
      <ul>
          ${links}
      </ul>
      <a class="btn btn-primary nav-cta" href="contact.html">${CTA_SHORT()}</a>
      <p class="nav-drawer-extra">${T("span", "nav.callUs", "Prefer to talk? Call us:", "¿Prefieres hablar? Llámanos:")} ${phoneLink()}</p>
    </nav>
    <div class="header-actions">
      <div class="lang-switch" role="group" aria-label="Language / Idioma">
        <button type="button" data-lang="en" aria-pressed="true" lang="en" title="English">EN</button>
        <button type="button" data-lang="es" aria-pressed="false" lang="es" title="Español">ES</button>
      </div>
      <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="main-nav">
        <span class="bars" aria-hidden="true"></span>${T("span", "nav.menu", "Menu", "Menú", 'class="sr-only"')}
      </button>
    </div>
  </div>
</header>
`;
}

function ctaBand() {
  return `<section class="cta-band">
  <div class="container">
    ${T("h2", "ctaBand.title", "Ready to Love Your Home Again?", "¿Listo para Volver a Enamorarte de tu Casa?")}
    ${T("p", "ctaBand.text", "Tell us about your project and get a free, no-obligation estimate from a local family you can trust.", "Cuéntanos sobre tu proyecto y recibe un presupuesto gratis y sin compromiso de una familia local en la que puedes confiar.")}
    <div class="hero-ctas">
      <a class="btn btn-lg" href="contact.html">${CTA_ESTIMATE()} ${icon("arrow")}</a>
      <a class="btn btn-lg btn-ghost" href="tel:${CONFIG.phoneE164}">${icon("phone")} ${CONFIG.phoneDisplay}</a>
    </div>
  </div>
</section>
`;
}

function footer() {
  const svc = [
    ["services.html#kitchens", "footer.s.kitchens", "Kitchen Remodeling", "Remodelación de Cocinas"],
    ["services.html#bathrooms", "footer.s.bathrooms", "Bathroom Remodeling", "Remodelación de Baños"],
    ["services.html#painting", "footer.s.painting", "Interior Painting", "Pintura Interior"],
    ["services.html#flooring", "footer.s.flooring", "Flooring Installation", "Instalación de Pisos"],
    ["services.html#carpentry", "footer.s.carpentry", "Doors, Trim & Closets", "Puertas, Molduras y Clósets"]
  ].map(([h, k, en, es]) => `<li><a href="${h}" data-i18n="${k}">${t(k, en, es)}</a></li>`).join("\n          ");
  const nav = NAV.map((n) => `<li><a href="${n.file}" data-i18n="${n.key}">${t(n.key, n.en, n.es)}</a></li>`).join("\n          ");
  return `<footer class="site-footer">
  <div class="container">
    <div class="footer-grid">
      <div>
        <a class="brand" href="index.html" aria-label="${CONFIG.name}">${LOGO}<span class="brand-text"><strong>Camacho</strong><small>Remodeling</small></span></a>
        ${T("p", "footer.blurb", "Family-owned home remodeling serving Guymon and the Oklahoma Panhandle. Honest work, clean finishes, guaranteed.", "Remodelación de casas, negocio familiar al servicio de Guymon y el Panhandle de Oklahoma. Trabajo honesto, acabados limpios y garantizados.")}
      </div>
      <nav aria-label="Footer">
        ${T("h3", "footer.explore", "Explore", "Explorar")}
        <ul>
          ${nav}
        </ul>
      </nav>
      <div>
        ${T("h3", "footer.services", "Services", "Servicios")}
        <ul>
          ${svc}
        </ul>
      </div>
      <div>
        ${T("h3", "footer.contact", "Contact", "Contacto")}
        <ul class="footer-contact">
          <li>${icon("phone")}${phoneLink()}</li>
          <li>${icon("mail")}<a href="mailto:${CONFIG.email}">${CONFIG.email}</a></li>
          <li>${icon("pin")}<span>${CONFIG.city}, Oklahoma</span></li>
          <li>${icon("lang")}${T("span", "footer.bilingual", "We speak English &amp; Spanish", "Hablamos inglés y español")}</li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <span>© <span data-year>${new Date().getFullYear()}</span> ${CONFIG.name}. ${T("span", "footer.rights", "All rights reserved.", "Todos los derechos reservados.")}</span>
      ${T("span", "footer.made", "Proudly local to Guymon, OK.", "Orgullosamente de Guymon, OK.")}
    </div>
  </div>
</footer>

<div class="mobile-bar" aria-label="Quick actions">
  <a class="btn btn-outline" href="tel:${CONFIG.phoneE164}">${icon("phone")} ${T("span", "cta.call", "Call", "Llamar")}</a>
  <a class="btn" href="contact.html">${CTA_SHORT()}</a>
</div>

<script src="assets/js/config.js"></script>
<script src="assets/js/i18n.js"></script>
<script src="assets/js/main.js"></script>
</body>
</html>
`;
}

const page = (p, body) => head(p) + header(p.file) + `<main id="main">\n${body}\n</main>\n` + footer();

function pageHero({ id, image, eyebrow, title, lead, crumb }) {
  return `<section class="page-hero">
  <div class="hero-media">${img(image, 'alt="" role="presentation"', { sizes: "100vw", eager: true })}</div>
  <div class="container">
    <ol class="breadcrumbs" aria-label="Breadcrumb">
      <li><a href="index.html" data-i18n="nav.home">${t("nav.home", "Home", "Inicio")}</a></li>
      <li aria-current="page" data-i18n="${crumb[0]}">${t(crumb[0], crumb[1], crumb[2])}</li>
    </ol>
    ${T("p", `${id}.hero.eyebrow`, eyebrow[0], eyebrow[1], 'class="eyebrow"')}
    ${T("h1", `${id}.hero.title`, title[0], title[1])}
    ${T("p", `${id}.hero.lead`, lead[0], lead[1], 'class="lead"')}
  </div>
</section>`;
}

/* --------------------------------------------------------------------------
   Data
   -------------------------------------------------------------------------- */
const GALLERY = [
  { f: "kitchen-open-concept", cat: "kitchen living", c: ["Kitchen", "Cocina"], en: "Open-concept kitchen with black island &amp; shaker cabinets", es: "Cocina abierta con isla negra y gabinetes estilo shaker" },
  { f: "bathroom-tub-shower", cat: "bathroom", c: ["Bathroom", "Baño"], en: "New tub-shower surround &amp; recessed lighting", es: "Bañera-ducha nueva e iluminación empotrada" },
  { f: "living-room-fireplace", cat: "living", c: ["Living Space", "Sala"], en: "Bright living room with light oak plank floors", es: "Sala luminosa con piso de tablones de roble claro", portrait: true },
  { f: "bathroom-vanity", cat: "bathroom finish", c: ["Bathroom", "Baño"], en: "Vanity, framed mirror &amp; matte-black fixtures", es: "Tocador, espejo con marco y grifería negro mate" },
  { f: "living-room-lvp", cat: "living finish", c: ["Living Space", "Sala"], en: "Living room with new luxury vinyl plank &amp; fresh paint", es: "Sala con piso vinílico de lujo y pintura nueva" },
  { f: "bedroom-corner-windows", cat: "bedroom finish", c: ["Bedroom", "Recámara"], en: "Bedroom with natural pine window casing", es: "Recámara con marcos de ventana en pino natural" },
  { f: "living-room-archway", cat: "living", c: ["Living Space", "Sala"], en: "Kitchen-to-living view with new flooring throughout", es: "Vista de cocina a sala con piso nuevo en toda la casa", portrait: true },
  { f: "master-bedroom-doors", cat: "bedroom finish", c: ["Bedroom", "Recámara"], en: "Primary suite with new six-panel doors &amp; trim", es: "Recámara principal con puertas de seis paneles y molduras nuevas" },
  { f: "bedroom-window-trim", cat: "bedroom finish", c: ["Bedroom", "Recámara"], en: "Fresh paint, new carpet &amp; custom window trim", es: "Pintura nueva, alfombra nueva y molduras de ventana a medida" },
  { f: "bedroom-hall-view", cat: "bedroom living", c: ["Bedroom", "Recámara"], en: "New carpet &amp; paint flowing into the kitchen", es: "Alfombra y pintura nuevas con vista a la cocina", portrait: true },
  { f: "bedroom-closet-doors", cat: "bedroom finish", c: ["Paint &amp; Trim", "Pintura y Molduras"], en: "Bi-fold closet doors with crisp white casing", es: "Puertas plegables de clóset con marco blanco impecable" },
  { f: "bedroom-door-lighting", cat: "bedroom finish", c: ["Paint &amp; Trim", "Pintura y Molduras"], en: "Smooth-finished walls, new door &amp; ceiling light", es: "Paredes bien terminadas, puerta nueva y lámpara de techo" },
  { f: "laundry-room", cat: "finish", c: ["Laundry", "Lavandería"], en: "Laundry room refresh with new flooring &amp; trim", es: "Lavandería renovada con piso y molduras nuevas" },
  { f: "closet-shelving", cat: "finish", c: ["Closets", "Clósets"], en: "Closet with new shelf, rod &amp; casing", es: "Clóset con repisa, barra y marco nuevos" }
];

/* --------------------------------------------------------------------------
   HOME
   -------------------------------------------------------------------------- */
const homeJsonLd = `<script type="application/ld+json">${JSON.stringify({
  "@context": "https://schema.org",
  "@type": "HomeAndConstructionBusiness",
  name: CONFIG.name,
  image: CONFIG.siteUrl + "assets/img/kitchen-open-concept.jpg",
  url: CONFIG.siteUrl,
  telephone: CONFIG.phoneE164,
  email: CONFIG.email,
  priceRange: "$$",
  address: { "@type": "PostalAddress", addressLocality: CONFIG.city, addressRegion: CONFIG.region, addressCountry: "US" },
  areaServed: CONFIG.towns.map((n) => ({ "@type": "City", name: `${n}, OK` })),
  knowsLanguage: ["en", "es"],
  makesOffer: ["Kitchen remodeling", "Bathroom remodeling", "Interior painting", "Flooring installation", "Whole-home remodeling"].map((s) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name: s } }))
})}</script>
<link rel="preload" as="image" href="assets/img/kitchen-open-concept-800.jpg" imagesrcset="assets/img/kitchen-open-concept-800.jpg 800w, assets/img/kitchen-open-concept.jpg 1600w" imagesizes="100vw">
`;

const valueCards = [
  ["clock", "home.v1", ["On Time, Every Time", "Puntuales, Siempre"], ["We show up when we say we will, keep you updated, and finish on the schedule we agree on together.", "Llegamos cuando decimos, te mantenemos informado y terminamos en el plazo que acordamos juntos."]],
  ["users", "home.v2", ["Local &amp; Family-Owned", "Negocio Familiar y Local"], ["We live and work in Guymon. Our family name is on every job — and our neighbors are our customers.", "Vivimos y trabajamos en Guymon. Nuestro apellido está en cada trabajo, y nuestros vecinos son nuestros clientes."]],
  ["sparkles", "home.v3", ["Clean, Precise Finishes", "Acabados Limpios y Precisos"], ["Straight lines, tight seams, crisp paint edges. We clean up every day so your home stays livable while we work.", "Líneas rectas, uniones perfectas y bordes de pintura nítidos. Limpiamos a diario para que tu casa siga habitable mientras trabajamos."]],
  ["shield", "home.v4", ["Guaranteed Workmanship", "Trabajo Garantizado"], ["Clear written estimates, no surprise charges, and a workmanship guarantee that stands behind every project.", "Presupuestos claros por escrito, sin cargos sorpresa y una garantía de mano de obra que respalda cada proyecto."]]
];

const serviceCards = [
  {
    id: "kitchens", img: "kitchen-open-concept", k: "home.s1",
    tag: ["Most Requested", "Lo Más Solicitado"],
    title: ["Kitchen Remodeling", "Remodelación de Cocinas"],
    text: ["The heart of your home, reimagined. New cabinets, countertops, islands, sinks, lighting and flooring — designed around the way your family cooks and gathers.", "El corazón de tu hogar, renovado. Gabinetes, encimeras, islas, fregaderos, iluminación y pisos nuevos, diseñados según cómo cocina y convive tu familia."],
    list: [["Cabinets &amp; islands", "Gabinetes e islas"], ["Countertops &amp; backsplash", "Encimeras y salpicaderos"], ["Lighting, sinks &amp; fixtures", "Iluminación, fregaderos y grifería"]]
  },
  {
    id: "bathrooms", img: "bathroom-vanity", k: "home.s2",
    tag: ["Bright &amp; Easy-Care", "Luminoso y Práctico"],
    title: ["Bathroom Remodeling", "Remodelación de Baños"],
    text: ["Turn a dated bathroom into a bright, easy-to-clean retreat. Tub and shower surrounds, vanities, mirrors, fixtures and ventilation installed with care.", "Convierte un baño anticuado en un espacio luminoso y fácil de limpiar. Bañeras, duchas, tocadores, espejos, grifería y ventilación instalados con cuidado."],
    list: [["Tub &amp; shower surrounds", "Bañeras y duchas"], ["Vanities, mirrors &amp; fixtures", "Tocadores, espejos y grifería"], ["Lighting &amp; ventilation", "Iluminación y ventilación"]]
  },
  {
    id: "whole-home", img: "living-room-lvp", k: "home.s3",
    tag: ["Full Transformation", "Transformación Total"],
    title: ["Whole-Home Remodeling", "Remodelación de Espacios Completos"],
    text: ["Give every room a fresh start. Interior painting, durable flooring, doors, trim and lighting — coordinated by one team from start to finish.", "Dale un nuevo comienzo a cada habitación. Pintura interior, pisos resistentes, puertas, molduras e iluminación, coordinados por un solo equipo de principio a fin."],
    list: [["Interior painting", "Pintura interior"], ["Flooring: LVP &amp; carpet", "Pisos: vinílico y alfombra"], ["Doors, trim &amp; closets", "Puertas, molduras y clósets"]]
  }
];

const steps = (prefix) => [
  [`${prefix}.p1`, ["Free Consultation", "Consulta Gratis"], ["We visit your home, listen to your goals, take measurements and talk budget — honestly, with zero pressure.", "Visitamos tu casa, escuchamos lo que quieres, tomamos medidas y hablamos de presupuesto con honestidad y sin presión."]],
  [`${prefix}.p2`, ["Design &amp; Plan", "Diseño y Plan"], ["You get a clear written estimate with materials, timeline and price. We help you choose finishes that fit your style and budget.", "Recibes un presupuesto claro por escrito con materiales, plazos y precio. Te ayudamos a elegir acabados según tu estilo y presupuesto."]],
  [`${prefix}.p3`, ["Build", "Construcción"], ["Our crew gets to work — protecting your home, cleaning up daily and keeping you updated until the final walkthrough.", "Nuestro equipo se pone manos a la obra: protegemos tu casa, limpiamos a diario y te mantenemos informado hasta la revisión final."]]
];

const stepsHtml = (prefix) => `<ol class="steps">
      ${steps(prefix).map(([k, h, p], i) => `<li class="step reveal">
        <span class="step-num" aria-hidden="true">${i + 1}</span>
        ${T("h3", `${k}.title`, h[0], h[1])}
        ${T("p", `${k}.text`, p[0], p[1])}
      </li>`).join("\n      ")}
    </ol>`;

const faqs = [
  ["home.faq1", ["Are your estimates really free?", "¿El presupuesto es realmente gratis?"], ["Yes. We visit your home, measure, and give you a detailed written estimate at no cost and with no obligation.", "Sí. Visitamos tu casa, medimos y te entregamos un presupuesto detallado por escrito, sin costo y sin compromiso."]],
  ["home.faq2", ["Do you take on smaller projects?", "¿Hacen proyectos pequeños?"], ["Absolutely. From painting a single room to a complete renovation, no job is too small to do right.", "Claro que sí. Desde pintar una sola habitación hasta una remodelación completa, ningún trabajo es demasiado pequeño para hacerlo bien."]],
  ["home.faq3", ["Can I live in my home during the remodel?", "¿Puedo seguir viviendo en mi casa durante la obra?"], ["In most cases, yes. We protect floors and furniture, control dust, and clean up at the end of every workday.", "En la mayoría de los casos, sí. Protegemos pisos y muebles, controlamos el polvo y limpiamos al final de cada jornada."]],
  ["home.faq4", ["Do you speak Spanish?", "¿Hablan español?"], ["Sí. Our family is bilingual, so you can talk through every detail in the language you're most comfortable with.", "Sí. Somos una familia bilingüe, así que puedes hablar de cada detalle en el idioma con el que te sientas más cómodo."]],
  ["home.faq5", ["What does your guarantee cover?", "¿Qué cubre su garantía?"], ["We stand behind our workmanship. If something we installed isn't right, we come back and make it right. The details are spelled out in your written estimate.", "Respaldamos nuestra mano de obra. Si algo que instalamos no quedó bien, regresamos y lo corregimos. Los detalles se especifican en tu presupuesto por escrito."]]
];

const home = page(
  {
    id: "home", file: "index.html",
    title: ["Camacho Remodeling | Kitchen & Bath Remodeling in Guymon, OK", "Camacho Remodeling | Remodelación de Cocinas y Baños en Guymon, OK"],
    desc: ["Family-owned home remodeling in Guymon, OK. Kitchens, bathrooms, painting, flooring and whole-home renovations with clean finishes and a workmanship guarantee. Free estimates.", "Remodelación de casas en Guymon, OK, por una empresa familiar. Cocinas, baños, pintura, pisos y renovaciones completas con acabados limpios y garantía de mano de obra. Presupuesto gratis."],
    headExtra: homeJsonLd
  },
  `
<!-- HERO -->
<section class="hero">
  <div class="hero-media">${img("kitchen-open-concept", A(["alt", "home.hero.alt", "Remodeled open-concept kitchen with white shaker cabinets, black island and new vinyl plank floors in Guymon, OK", "Cocina abierta remodelada con gabinetes blancos estilo shaker, isla negra y piso vinílico nuevo en Guymon, OK"]), { sizes: "100vw", eager: true })}</div>
  <div class="container">
    <div class="hero-content">
      ${T("p", "home.hero.eyebrow", "Family-Owned · Guymon, Oklahoma", "Empresa Familiar · Guymon, Oklahoma", 'class="eyebrow"')}
      ${T("h1", "home.hero.title", "Fall in Love With Your Home <em>Again.</em>", "Vuelve a Enamorarte de tu <em>Casa.</em>", 'class="h-display"')}
      ${T("p", "home.hero.lead", "Kitchens, bathrooms, flooring and full-home remodels for Guymon and the Oklahoma Panhandle — delivered on schedule, finished clean, and backed by our workmanship guarantee.", "Cocinas, baños, pisos y remodelaciones completas en Guymon y el Panhandle de Oklahoma — entregadas a tiempo, con acabados impecables y respaldadas por nuestra garantía de mano de obra.", 'class="lead"')}
      <div class="hero-ctas">
        <a class="btn btn-lg" href="contact.html">${CTA_ESTIMATE()} ${icon("arrow")}</a>
        <a class="btn btn-lg btn-ghost" href="gallery.html">${T("span", "cta.seeWork", "See Our Work", "Ver Nuestros Proyectos")}</a>
      </div>
      <p class="hero-note">${icon("lock")}${T("span", "home.hero.note", "Fast reply · No pressure · No obligation", "Respuesta rápida · Sin presión · Sin compromiso")}</p>
      <ul class="trust-chips">
        <li>${icon("check")}${T("span", "chip.free", "Free in-home estimates", "Presupuestos gratis a domicilio")}</li>
        <li>${icon("check")}${T("span", "chip.family", "Family-owned &amp; local", "Empresa familiar y local")}</li>
        <li>${icon("check")}${T("span", "chip.guarantee", "Workmanship guarantee", "Garantía de mano de obra")}</li>
        <li>${icon("check")}${T("span", "chip.bilingual", "Hablamos Español", "We speak English")}</li>
      </ul>
    </div>
  </div>
</section>

<!-- TRUST BAR -->
<section class="trust-bar" ${A(["aria-label", "home.trust.label", "Why homeowners trust us", "Por qué confían en nosotros"])}>
  <div class="container">
    <ul>
      <li>${icon("file")}<span><strong data-i18n="home.t1.t">${t("home.t1.t", "Written Estimates", "Presupuestos por Escrito")}</strong><span data-i18n="home.t1.d">${t("home.t1.d", "Clear price, no surprises", "Precio claro, sin sorpresas")}</span></span></li>
      <li>${icon("calendar")}<span><strong data-i18n="home.t2.t">${t("home.t2.t", "On-Schedule", "Puntualidad")}</strong><span data-i18n="home.t2.d">${t("home.t2.d", "We respect your time", "Respetamos tu tiempo")}</span></span></li>
      <li>${icon("sparkles")}<span><strong data-i18n="home.t3.t">${t("home.t3.t", "Daily Clean-Up", "Limpieza Diaria")}</strong><span data-i18n="home.t3.d">${t("home.t3.d", "Your home, respected", "Tu casa, respetada")}</span></span></li>
      <li>${icon("award")}<span><strong data-i18n="home.t4.t">${t("home.t4.t", "Guaranteed Work", "Trabajo Garantizado")}</strong><span data-i18n="home.t4.d">${t("home.t4.d", "We make it right", "Lo dejamos perfecto")}</span></span></li>
    </ul>
  </div>
</section>

<!-- VALUE PROPOSITION -->
<section class="section">
  <div class="container">
    <div class="section-head section-head--center reveal">
      ${T("p", "home.why.eyebrow", "Why Camacho", "Por Qué Camacho", 'class="eyebrow"')}
      ${T("h2", "home.why.title", "Why Guymon Homeowners Choose Camacho", "Por Qué las Familias de Guymon Eligen a Camacho", 'class="h-section"')}
      ${T("p", "home.why.lead", "Remodeling is personal. You're trusting us with the place your family lives — so we treat every project as if it were our own home.", "Remodelar es algo personal. Nos confías el lugar donde vive tu familia, por eso tratamos cada proyecto como si fuera nuestra propia casa.", 'class="lead"')}
    </div>
    <div class="grid grid-4">
      ${valueCards.map(([ic, k, h, p]) => `<article class="card reveal">
        <div class="icon-badge">${icon(ic)}</div>
        ${T("h3", `${k}.title`, h[0], h[1])}
        ${T("p", `${k}.text`, p[0], p[1])}
      </article>`).join("\n      ")}
    </div>
  </div>
</section>

<!-- SERVICES -->
<section class="section section--sand" id="services">
  <div class="container">
    <div class="section-head section-head--center reveal">
      ${T("p", "home.svc.eyebrow", "What We Do", "Lo Que Hacemos", 'class="eyebrow"')}
      ${T("h2", "home.svc.title", "Remodeling Services Built Around Your Home", "Servicios de Remodelación a la Medida de tu Hogar", 'class="h-section"')}
      ${T("p", "home.svc.lead", "From a single-room refresh to a complete renovation, one trusted team handles it all.", "Desde renovar una habitación hasta una remodelación completa, un solo equipo de confianza se encarga de todo.", 'class="lead"')}
    </div>
    <div class="grid grid-3">
      ${serviceCards.map((s) => `<article class="service-card reveal">
        <div class="media">
          ${img(s.img, `alt="" role="presentation"`, { sizes: "(max-width: 860px) 100vw, 33vw" })}
          ${T("span", `${s.k}.tag`, s.tag[0], s.tag[1], 'class="tag"')}
        </div>
        <div class="body">
          ${T("h3", `${s.k}.title`, s.title[0], s.title[1])}
          ${T("p", `${s.k}.text`, s.text[0], s.text[1])}
          <ul class="check-list">
            ${s.list.map((l, i) => T("li", `${s.k}.l${i}`, l[0], l[1])).join("\n            ")}
          </ul>
          <a class="link-arrow" href="services.html#${s.id}">${T("span", "cta.learnMore", "Learn more", "Ver más")} ${icon("arrow")}</a>
        </div>
      </article>`).join("\n      ")}
    </div>
    <div class="chips">
      <span class="chip">${icon("roller")}${T("span", "chipsvc.paint", "Interior Painting", "Pintura Interior")}</span>
      <span class="chip">${icon("layers")}${T("span", "chipsvc.floor", "Flooring", "Pisos")}</span>
      <span class="chip">${icon("door")}${T("span", "chipsvc.doors", "Doors &amp; Trim", "Puertas y Molduras")}</span>
      <span class="chip">${icon("bulb")}${T("span", "chipsvc.light", "Lighting Upgrades", "Mejoras de Iluminación")}</span>
      <span class="chip">${icon("wrench")}${T("span", "chipsvc.repair", "Repairs &amp; Punch Lists", "Reparaciones y Detalles")}</span>
    </div>
  </div>
</section>

<!-- RECENT WORK -->
<section class="section">
  <div class="container">
    <div class="section-head reveal">
      ${T("p", "home.work.eyebrow", "Recent Projects", "Proyectos Recientes", 'class="eyebrow"')}
      ${T("h2", "home.work.title", "Real Homes. Real Results.", "Casas Reales. Resultados Reales.", 'class="h-section"')}
      ${T("p", "home.work.lead", "Every photo on this site is a project completed by our team here in the Oklahoma Panhandle.", "Cada foto de este sitio es un proyecto terminado por nuestro equipo aquí en el Panhandle de Oklahoma.", 'class="lead"')}
    </div>
    <div class="mosaic reveal">
      <a href="gallery.html">${img("kitchen-open-concept", 'alt="" role="presentation"', { sizes: "(max-width: 860px) 100vw, 50vw" })}${T("span", "gcat.kitchen", "Kitchen", "Cocina")}</a>
      <a href="gallery.html">${img("bathroom-tub-shower", 'alt="" role="presentation"', { sizes: "(max-width: 860px) 50vw, 25vw" })}${T("span", "gcat.bathroom", "Bathroom", "Baño")}</a>
      <a href="gallery.html">${img("living-room-archway", 'alt="" role="presentation"', { w: 1204, h: 1600, sizes: "(max-width: 860px) 50vw, 25vw" })}${T("span", "gcat.flooring", "Flooring", "Pisos")}</a>
      <a href="gallery.html">${img("bedroom-corner-windows", 'alt="" role="presentation"', { sizes: "(max-width: 860px) 100vw, 25vw" })}${T("span", "gcat.paintTrim", "Paint &amp; Trim", "Pintura y Molduras")}</a>
    </div>
    <div class="section-foot">
      <a class="btn btn-outline" href="gallery.html">${T("span", "cta.fullGallery", "View the Full Gallery", "Ver la Galería Completa")} ${icon("arrow")}</a>
    </div>
  </div>
</section>

<!-- PROCESS -->
<section class="section section--ink">
  <div class="container">
    <div class="section-head section-head--center reveal">
      ${T("p", "home.proc.eyebrow", "How It Works", "Cómo Trabajamos", 'class="eyebrow"')}
      ${T("h2", "home.proc.title", "Your Remodel in 3 Simple Steps", "Tu Remodelación en 3 Pasos Sencillos", 'class="h-section"')}
      ${T("p", "home.proc.lead", "A clear process means no stress and no surprises — just a beautiful result.", "Un proceso claro significa cero estrés y cero sorpresas, solo un resultado hermoso.", 'class="lead"')}
    </div>
    ${stepsHtml("proc")}
    <div class="section-foot">
      <a class="btn btn-lg" href="contact.html">${T("span", "cta.startStep1", "Start With Step 1 — It's Free", "Empieza con el Paso 1 — Es Gratis")} ${icon("arrow")}</a>
    </div>
  </div>
</section>

<!-- ABOUT TEASER -->
<section class="section">
  <div class="container split">
    <div class="split-media reveal">
      ${img("tools-workbench", A(["alt", "home.about.alt", "The Camacho Remodeling crew's tools ready for the next job", "Las herramientas del equipo de Camacho Remodeling listas para el próximo trabajo"]))}
      <div class="badge-float">${icon("heart")}<span><strong data-i18n="home.about.badge.t">${t("home.about.badge.t", "Family-run", "Negocio familiar")}</strong><span data-i18n="home.about.badge.d">${t("home.about.badge.d", "Rooted in Guymon, OK", "Con raíces en Guymon, OK")}</span></span></div>
    </div>
    <div class="reveal">
      ${T("p", "home.about.eyebrow", "Who We Are", "Quiénes Somos", 'class="eyebrow"')}
      ${T("h2", "home.about.title", "A Family Name You Can Trust", "Un Apellido en el que Puedes Confiar", 'class="h-section"')}
      ${T("p", "home.about.p1", "Camacho Remodeling is a family business rooted in Guymon. We started with a simple belief: homeowners deserve contractors who answer the phone, show up on time, and take pride in the details nobody else notices.", "Camacho Remodeling es un negocio familiar con raíces en Guymon. Empezamos con una idea sencilla: los dueños de casa merecen contratistas que contesten el teléfono, lleguen a tiempo y se enorgullezcan de los detalles que nadie más nota.", 'class="lead"')}
      <ul class="check-list">
        ${T("li", "home.about.l1", "Honest advice — even when it means a smaller job", "Consejos honestos, aunque eso signifique un trabajo más pequeño")}
        ${T("li", "home.about.l2", "The same crew from day one to final walkthrough", "El mismo equipo desde el primer día hasta la revisión final")}
        ${T("li", "home.about.l3", "Bilingual service in English and Spanish", "Atención bilingüe en inglés y español")}
      </ul>
      <a class="btn btn-outline" href="about.html">${T("span", "cta.meet", "Meet the Family", "Conoce a la Familia")} ${icon("arrow")}</a>
    </div>
  </div>
</section>

<!-- SERVICE AREA -->
<section class="section section--sand" style="padding-block: clamp(40px, 6vw, 64px)">
  <div class="container area">
    ${T("h2", "area.title", "Proudly serving Guymon &amp; the Oklahoma Panhandle", "Con orgullo servimos a Guymon y al Panhandle de Oklahoma")}
    <ul class="town-list">
      ${CONFIG.towns.map((n) => `<li>${icon("pin")}${n}</li>`).join("\n      ")}
      <li>${icon("pin")}${T("span", "area.more", "&amp; nearby", "y alrededores")}</li>
    </ul>
  </div>
</section>

<!-- FAQ -->
<section class="section">
  <div class="container">
    <div class="section-head section-head--center reveal">
      ${T("p", "home.faq.eyebrow", "Questions", "Preguntas", 'class="eyebrow"')}
      ${T("h2", "home.faq.title", "Frequently Asked Questions", "Preguntas Frecuentes", 'class="h-section"')}
    </div>
    <div class="faq">
      ${faqs.map(([k, q, a], i) => `<details${i === 0 ? " open" : ""}>
        ${T("summary", `${k}.q`, q[0], q[1])}
        ${T("p", `${k}.a`, a[0], a[1])}
      </details>`).join("\n      ")}
    </div>
  </div>
</section>

${ctaBand()}`
);

/* --------------------------------------------------------------------------
   SERVICES
   -------------------------------------------------------------------------- */
const serviceDetails = [
  {
    id: "kitchens", img: "kitchen-open-concept", icon: "kitchen", k: "svc.kitchen",
    title: ["Kitchen Remodeling", "Remodelación de Cocinas"],
    lead: ["Your kitchen is where mornings start and families gather. We design and build kitchens that look stunning, work hard and fit your budget.", "Tu cocina es donde empiezan las mañanas y se reúne la familia. Diseñamos y construimos cocinas que se ven espectaculares, funcionan de verdad y se ajustan a tu presupuesto."],
    list: [["Cabinet installation &amp; islands", "Instalación de gabinetes e islas"], ["Countertops, sinks &amp; faucets", "Encimeras, fregaderos y grifería"], ["Backsplash &amp; wall finishes", "Salpicaderos y acabados de pared"], ["Lighting &amp; appliance fit-up", "Iluminación y acomodo de electrodomésticos"], ["Open-concept layouts", "Diseños de concepto abierto"], ["Durable, water-resistant flooring", "Pisos resistentes al agua"]]
  },
  {
    id: "bathrooms", img: "bathroom-tub-shower", icon: "bath", k: "svc.bath",
    title: ["Bathroom Remodeling", "Remodelación de Baños"],
    lead: ["From a quick guest-bath refresh to a full primary-bath makeover, we create clean, bright spaces that are easy to maintain and built to last.", "Desde renovar un baño de visitas hasta transformar por completo el baño principal, creamos espacios limpios, luminosos, fáciles de mantener y hechos para durar."],
    list: [["Tub &amp; shower surrounds", "Bañeras y duchas"], ["Vanities, tops &amp; mirrors", "Tocadores, cubiertas y espejos"], ["Faucets, hardware &amp; accessories", "Grifería, herrajes y accesorios"], ["Recessed lighting &amp; exhaust fans", "Iluminación empotrada y extractores"], ["Moisture-resistant paint &amp; flooring", "Pintura y pisos resistentes a la humedad"], ["Accessibility upgrades", "Mejoras de accesibilidad"]]
  },
  {
    id: "painting", img: "bedroom-door-lighting", icon: "roller", k: "svc.paint",
    title: ["Interior Painting", "Pintura Interior"],
    lead: ["Fresh paint is the fastest way to transform a home. Careful prep, quality paint and crisp cut lines give every room a flawless, long-lasting finish.", "La pintura nueva es la forma más rápida de transformar una casa. Preparación cuidadosa, pintura de calidad y cortes nítidos le dan a cada habitación un acabado impecable y duradero."],
    list: [["Walls, ceilings &amp; trim", "Paredes, techos y molduras"], ["Drywall patching &amp; texture repair", "Resanes de tablaroca y reparación de textura"], ["Doors &amp; cabinets", "Puertas y gabinetes"], ["Color guidance", "Asesoría de color"], ["Furniture &amp; floor protection", "Protección de muebles y pisos"], ["Spotless clean-up", "Limpieza impecable"]]
  },
  {
    id: "flooring", img: "living-room-fireplace", imgW: 1204, imgH: 1600, icon: "layers", k: "svc.floor",
    title: ["Flooring Installation", "Instalación de Pisos"],
    lead: ["Beautiful floors tie a home together. We install luxury vinyl plank and carpet with level transitions, tight seams and clean baseboards.", "Unos pisos hermosos le dan unidad a toda la casa. Instalamos piso vinílico de lujo y alfombra con transiciones niveladas, uniones perfectas y zoclos limpios."],
    list: [["Luxury vinyl plank (LVP)", "Piso vinílico de lujo (LVP)"], ["Carpet for bedrooms", "Alfombra para recámaras"], ["Subfloor prep &amp; leveling", "Preparación y nivelación del subsuelo"], ["Baseboards &amp; transitions", "Zoclos y transiciones"], ["Old flooring removal", "Retiro de piso viejo"], ["Whole-home continuity", "Continuidad en toda la casa"]]
  },
  {
    id: "carpentry", img: "bedroom-closet-doors", icon: "door", k: "svc.carp",
    title: ["Doors, Trim &amp; Closets", "Puertas, Molduras y Clósets"],
    lead: ["The finishing details make the difference. New doors, window casing, baseboards and closet systems give your home a polished, custom look.", "Los detalles finales marcan la diferencia. Puertas nuevas, marcos de ventana, zoclos y clósets le dan a tu casa un aspecto pulido y a la medida."],
    list: [["Interior &amp; bi-fold doors", "Puertas interiores y plegables"], ["Window &amp; door casing", "Marcos de ventanas y puertas"], ["Baseboards &amp; crown details", "Zoclos y molduras decorativas"], ["Closet shelving &amp; rods", "Repisas y barras para clósets"], ["Hardware upgrades", "Cambio de herrajes"], ["Laundry-room refresh", "Renovación de lavanderías"]]
  }
];

const services = page(
  {
    id: "services", file: "services.html",
    title: ["Remodeling Services in Guymon, OK | Camacho Remodeling", "Servicios de Remodelación en Guymon, OK | Camacho Remodeling"],
    desc: ["Kitchen and bathroom remodeling, interior painting, flooring installation, doors, trim and closets in Guymon and the Oklahoma Panhandle. Free written estimates.", "Remodelación de cocinas y baños, pintura interior, instalación de pisos, puertas, molduras y clósets en Guymon y el Panhandle de Oklahoma. Presupuestos gratis por escrito."],
    ogImage: "bathroom-tub-shower"
  },
  `${pageHero({
    id: "services", image: "living-room-lvp", crumb: ["nav.services", "Services", "Servicios"],
    eyebrow: ["Our Services", "Nuestros Servicios"],
    title: ["Remodeling Services in Guymon, OK", "Servicios de Remodelación en Guymon, OK"],
    lead: ["One trusted local team for kitchens, bathrooms, paint, floors and every finishing detail in between.", "Un solo equipo local de confianza para cocinas, baños, pintura, pisos y cada detalle de acabado."]
  })}

<section class="section">
  <div class="container">
    <nav class="service-nav reveal" ${A(["aria-label", "svc.jump", "Jump to a service", "Ir a un servicio"])}>
      ${serviceDetails.map((s) => `<a class="chip" href="#${s.id}">${icon(s.icon)}<span data-i18n="${s.k}.title">${t(`${s.k}.title`, s.title[0], s.title[1])}</span></a>`).join("\n      ")}
    </nav>
  </div>
  <div class="container" style="margin-top: clamp(48px, 7vw, 80px)">
    ${serviceDetails.map((s, i) => `<article class="service-detail split${i % 2 ? " split--reverse" : ""}" id="${s.id}">
      <div class="split-media reveal">
        ${img(s.img, `alt="" role="presentation"`, { w: s.imgW || 1600, h: s.imgH || 1204 })}
      </div>
      <div class="reveal">
        <div class="icon-badge">${icon(s.icon)}</div>
        <h2 data-i18n="${s.k}.title">${t(`${s.k}.title`, s.title[0], s.title[1])}</h2>
        ${T("p", `${s.k}.lead`, s.lead[0], s.lead[1], 'class="lead"')}
        <ul class="check-list grid-2" style="display:grid; gap:.6rem 1.5rem">
          ${s.list.map((l, j) => T("li", `${s.k}.l${j}`, l[0], l[1])).join("\n          ")}
        </ul>
        <a class="btn" href="contact.html?service=${s.id}">${T("span", "cta.quoteThis", "Get a Free Quote for This", "Cotizar Este Servicio Gratis")} ${icon("arrow")}</a>
      </div>
    </article>`).join("\n    ")}
  </div>
</section>

<section class="section section--ink">
  <div class="container">
    <div class="section-head section-head--center reveal">
      ${T("p", "home.proc.eyebrow", "How It Works", "Cómo Trabajamos", 'class="eyebrow"')}
      ${T("h2", "home.proc.title", "Your Remodel in 3 Simple Steps", "Tu Remodelación en 3 Pasos Sencillos", 'class="h-section"')}
    </div>
    ${stepsHtml("proc")}
  </div>
</section>

${ctaBand()}`
);

/* --------------------------------------------------------------------------
   GALLERY
   -------------------------------------------------------------------------- */
const filters = [
  ["all", "gal.f.all", "All Projects", "Todos"],
  ["kitchen", "gal.f.kitchen", "Kitchens", "Cocinas"],
  ["bathroom", "gal.f.bathroom", "Bathrooms", "Baños"],
  ["living", "gal.f.living", "Living &amp; Floors", "Salas y Pisos"],
  ["bedroom", "gal.f.bedroom", "Bedrooms", "Recámaras"],
  ["finish", "gal.f.finish", "Paint, Trim &amp; Doors", "Pintura, Molduras y Puertas"]
];

const gallery = page(
  {
    id: "gallery", file: "gallery.html",
    title: ["Project Gallery | Camacho Remodeling — Guymon, OK", "Galería de Proyectos | Camacho Remodeling — Guymon, OK"],
    desc: ["See real kitchen, bathroom, flooring and painting projects completed by Camacho Remodeling in Guymon and the Oklahoma Panhandle.", "Mira proyectos reales de cocinas, baños, pisos y pintura terminados por Camacho Remodeling en Guymon y el Panhandle de Oklahoma."],
    ogImage: "living-room-lvp"
  },
  `${pageHero({
    id: "gallery", image: "bathroom-tub-shower", crumb: ["nav.gallery", "Project Gallery", "Galería de Proyectos"],
    eyebrow: ["Our Work", "Nuestro Trabajo"],
    title: ["Craftsmanship You Can See", "Calidad que se Nota"],
    lead: ["Browse completed projects from homes across the Oklahoma Panhandle. Tap any photo to view it larger.", "Explora proyectos terminados en casas de todo el Panhandle de Oklahoma. Toca cualquier foto para verla en grande."]
  })}

<section class="section">
  <div class="container">
    <div class="filters" role="group" ${A(["aria-label", "gal.filterLabel", "Filter projects", "Filtrar proyectos"])}>
      ${filters.map(([v, k, en, es], i) => `<button type="button" data-filter="${v}" aria-pressed="${i === 0}" data-i18n="${k}">${t(k, en, es)}</button>`).join("\n      ")}
    </div>
    <div class="gallery-grid">
      ${GALLERY.map((g, i) => `<figure class="gallery-item" data-cat="${g.cat}" data-full="assets/img/${g.f}.jpg">
        <button type="button" ${A(["aria-label", `gal.open${i}`, `View larger: ${g.en.replace(/&amp;/g, "&")}`, `Ver en grande: ${g.es.replace(/&amp;/g, "&")}`])}>
          ${img(g.f, A(["alt", `gal.i${i}`, g.en.replace(/&amp;/g, "&"), g.es.replace(/&amp;/g, "&")]), { w: g.portrait ? 1204 : 1600, h: g.portrait ? 1600 : 1204, sizes: "(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 400px" })}
        </button>
        <figcaption><small data-i18n="gcat.${g.c[0].replace(/\W+/g, "")}">${t(`gcat.${g.c[0].replace(/\W+/g, "")}`, g.c[0], g.c[1])}</small><span data-i18n="gal.c${i}">${t(`gal.c${i}`, g.en, g.es)}</span></figcaption>
      </figure>`).join("\n      ")}
    </div>
  </div>
</section>

<!--
  BEFORE / AFTER — ready to use.
  1. Save each pair as assets/img/<name>-before.jpg and assets/img/<name>-after.jpg (same framing, 4:3).
  2. Copy a .ba-slider block per pair and remove the "hidden" attribute from this section.
-->
<section class="section section--sand" id="before-after" hidden>
  <div class="container">
    <div class="section-head section-head--center">
      ${T("p", "gal.ba.eyebrow", "Transformations", "Transformaciones", 'class="eyebrow"')}
      ${T("h2", "gal.ba.title", "Before &amp; After", "Antes y Después", 'class="h-section"')}
      ${T("p", "gal.ba.lead", "Drag the slider to see the difference.", "Desliza para ver la diferencia.", 'class="lead"')}
    </div>
    <div class="ba-grid">
      <!--
      <div class="ba-slider">
        <img src="assets/img/kitchen-after.jpg" alt="Kitchen after remodel" class="ba-after">
        <img src="assets/img/kitchen-before.jpg" alt="Kitchen before remodel" class="ba-before">
        <span class="ba-label ba-label--before" data-i18n="gal.ba.before">Before</span>
        <span class="ba-label ba-label--after" data-i18n="gal.ba.after">After</span>
        <span class="ba-handle"></span>
        <input type="range" min="0" max="100" value="50" aria-label="Before / after comparison">
      </div>
      -->
    </div>
  </div>
</section>
${(t("gal.ba.before", "Before", "Antes"), t("gal.ba.after", "After", "Después"), "")}
<div class="lightbox" aria-hidden="true" role="dialog" aria-modal="true" ${A(["aria-label", "gal.viewer", "Photo viewer", "Visor de fotos"])}>
  <button class="lb-btn lb-close" type="button" ${A(["aria-label", "gal.close", "Close", "Cerrar"])}>${icon("x")}</button>
  <button class="lb-btn lb-prev" type="button" ${A(["aria-label", "gal.prev", "Previous photo", "Foto anterior"])}>${icon("left")}</button>
  <figure><img src="" alt=""><figcaption></figcaption></figure>
  <button class="lb-btn lb-next" type="button" ${A(["aria-label", "gal.next", "Next photo", "Foto siguiente"])}>${icon("right")}</button>
</div>

${ctaBand()}`
);

/* --------------------------------------------------------------------------
   ABOUT
   -------------------------------------------------------------------------- */
const values = [
  ["heart", "about.v1", ["Honesty First", "Honestidad Ante Todo"], ["Straight answers, fair prices and written estimates. If a project doesn't make sense for you, we'll tell you.", "Respuestas claras, precios justos y presupuestos por escrito. Si un proyecto no te conviene, te lo diremos."]],
  ["hammer", "about.v2", ["Pride in Craftsmanship", "Orgullo por el Oficio"], ["We sweat the details — level floors, tight joints, clean caulk lines and paint that looks factory-finished.", "Cuidamos cada detalle: pisos nivelados, uniones precisas, sellados limpios y pintura con acabado de fábrica."]],
  ["home", "about.v3", ["Respect for Your Home", "Respeto por tu Hogar"], ["We protect your floors and furniture, keep the site tidy and treat your family like our own.", "Protegemos tus pisos y muebles, mantenemos el área ordenada y tratamos a tu familia como a la nuestra."]],
  ["users", "about.v4", ["Rooted in Community", "Comprometidos con la Comunidad"], ["Guymon is home. Our reputation is built one neighbor, one referral and one finished project at a time.", "Guymon es nuestro hogar. Nuestra reputación se construye vecino a vecino, recomendación a recomendación y proyecto a proyecto."]]
];

const about = page(
  {
    id: "about", file: "about.html",
    title: ["About Us | Camacho Remodeling — Family-Owned in Guymon, OK", "Nosotros | Camacho Remodeling — Empresa Familiar en Guymon, OK"],
    desc: ["Meet Camacho Remodeling, a bilingual, family-owned remodeling company in Guymon, OK, known for honest work, punctuality and clean, guaranteed finishes.", "Conoce a Camacho Remodeling, empresa familiar y bilingüe de remodelación en Guymon, OK, reconocida por su trabajo honesto, puntualidad y acabados limpios y garantizados."],
    ogImage: "tools-workbench"
  },
  `${pageHero({
    id: "about", image: "living-room-archway", crumb: ["nav.about", "About Us", "Nosotros"],
    eyebrow: ["Our Story", "Nuestra Historia"],
    title: ["Family-Owned. Guymon-Proud.", "Negocio Familiar. Orgullo de Guymon."],
    lead: ["We're not a franchise or a call center — we're your neighbors, and we build every project like it's our own home.", "No somos una franquicia ni un centro de llamadas: somos tus vecinos, y hacemos cada proyecto como si fuera nuestra propia casa."]
  })}

<section class="section">
  <div class="container split">
    <div class="split-media reveal">
      ${img("tools-workbench", A(["alt", "home.about.alt", "The Camacho Remodeling crew's tools ready for the next job", "Las herramientas del equipo de Camacho Remodeling listas para el próximo trabajo"]))}
      <div class="badge-float">${icon("lang")}<span><strong data-i18n="about.badge.t">${t("about.badge.t", "Bilingual team", "Equipo bilingüe")}</strong><span data-i18n="about.badge.d">${t("about.badge.d", "English &amp; Español", "Español e inglés")}</span></span></div>
    </div>
    <div class="reveal">
      ${T("p", "about.story.eyebrow", "Who We Are", "Quiénes Somos", 'class="eyebrow"')}
      ${T("h2", "about.story.title", "Built on Hard Work and a Handshake", "Construido con Trabajo Duro y Palabra de Honor", 'class="h-section"')}
      ${T("p", "about.story.p1", "Camacho Remodeling is a family-run business based in Guymon, Oklahoma. What started as helping friends and neighbors fix up their homes grew into a full remodeling company — built entirely on word of mouth.", "Camacho Remodeling es un negocio familiar con base en Guymon, Oklahoma. Lo que empezó como ayudar a amigos y vecinos a arreglar sus casas se convirtió en una empresa de remodelación completa, construida por completo gracias a las recomendaciones.")}
      ${T("p", "about.story.p2", "Today we transform kitchens, bathrooms and entire homes across the Oklahoma Panhandle. Our approach hasn't changed: show up on time, communicate clearly, do the job right the first time, and leave every home cleaner than we found it.", "Hoy transformamos cocinas, baños y casas completas en todo el Panhandle de Oklahoma. Nuestra forma de trabajar no ha cambiado: llegar a tiempo, comunicarnos con claridad, hacer bien el trabajo a la primera y dejar cada casa más limpia de como la encontramos.")}
      <blockquote class="quote-block">
        ${T("p", "about.quote", "“Our last name goes on every project. That's why we never cut corners.”", "“Nuestro apellido va en cada proyecto. Por eso nunca tomamos atajos.”", 'style="margin:0"')}
        ${T("cite", "about.quote.by", "— The Camacho Family", "— La Familia Camacho")}
      </blockquote>
    </div>
  </div>
</section>

<section class="section section--sand">
  <div class="container">
    <div class="section-head section-head--center reveal">
      ${T("p", "about.values.eyebrow", "Our Values", "Nuestros Valores", 'class="eyebrow"')}
      ${T("h2", "about.values.title", "What You Can Count On", "Con Lo Que Puedes Contar", 'class="h-section"')}
    </div>
    <div class="grid grid-4">
      ${values.map(([ic, k, h, p]) => `<article class="card reveal">
        <div class="icon-badge">${icon(ic)}</div>
        ${T("h3", `${k}.title`, h[0], h[1])}
        ${T("p", `${k}.text`, p[0], p[1])}
      </article>`).join("\n      ")}
    </div>
  </div>
</section>

<section class="section">
  <div class="container split split--reverse">
    <div class="split-media reveal">
      ${img("kitchen-open-concept", 'alt="" role="presentation"')}
    </div>
    <div class="reveal">
      ${T("p", "about.promise.eyebrow", "Our Promise", "Nuestra Promesa", 'class="eyebrow"')}
      ${T("h2", "about.promise.title", "The Camacho Commitment", "El Compromiso Camacho", 'class="h-section"')}
      <ul class="values-list">
        <li><div class="icon-badge">${icon("file")}</div><div>${T("h3", "about.c1.t", "A clear, written estimate", "Un presupuesto claro y por escrito")}${T("p", "about.c1.d", "You'll know the scope, materials, timeline and price before any work begins.", "Conocerás el alcance, los materiales, los plazos y el precio antes de empezar.")}</div></li>
        <li><div class="icon-badge">${icon("chat")}</div><div>${T("h3", "about.c2.t", "Communication you can rely on", "Comunicación en la que puedes confiar")}${T("p", "about.c2.d", "Calls and texts returned promptly, with updates at every stage — in English or Spanish.", "Respondemos llamadas y mensajes a tiempo, con avances en cada etapa, en inglés o en español.")}</div></li>
        <li><div class="icon-badge">${icon("sparkles")}</div><div>${T("h3", "about.c3.t", "A clean, protected home", "Una casa limpia y protegida")}${T("p", "about.c3.d", "Floor protection, dust control and a full clean-up at the end of every day.", "Protección de pisos, control de polvo y limpieza completa al final de cada día.")}</div></li>
        <li><div class="icon-badge">${icon("shield")}</div><div>${T("h3", "about.c4.t", "Work that's guaranteed", "Un trabajo garantizado")}${T("p", "about.c4.d", "If something we installed isn't right, we come back and make it right.", "Si algo que instalamos no quedó bien, regresamos y lo corregimos.")}</div></li>
      </ul>
    </div>
  </div>
</section>

${ctaBand()}`
);

/* --------------------------------------------------------------------------
   CONTACT
   -------------------------------------------------------------------------- */
const svcOptions = [
  ["kitchens", "form.svc.kitchen", "Kitchen", "Cocina"],
  ["bathrooms", "form.svc.bath", "Bathroom", "Baño"],
  ["painting", "form.svc.paint", "Painting", "Pintura"],
  ["flooring", "form.svc.floor", "Flooring", "Pisos"],
  ["carpentry", "form.svc.carp", "Doors &amp; Trim", "Puertas y Molduras"],
  ["whole-home", "form.svc.whole", "Whole Home", "Casa Completa"],
  ["other", "form.svc.other", "Other", "Otro"]
];
const timeline = [
  ["", "form.time.pick", "Select one…", "Selecciona una opción…"],
  ["ASAP", "form.time.asap", "As soon as possible", "Lo antes posible"],
  ["1-3 months", "form.time.1to3", "In 1–3 months", "En 1 a 3 meses"],
  ["3-6 months", "form.time.3to6", "In 3–6 months", "En 3 a 6 meses"],
  ["Just planning", "form.time.plan", "Just planning / getting ideas", "Solo planeando / buscando ideas"]
];
const contactPref = [
  ["Call", "form.pref.call", "Call", "Llamada"],
  ["Text", "form.pref.text", "Text", "Mensaje de texto"],
  ["WhatsApp", "form.pref.wa", "WhatsApp", "WhatsApp"],
  ["Email", "form.pref.email", "Email", "Correo"]
];

const contact = page(
  {
    id: "contact", file: "contact.html",
    title: ["Free Estimate | Contact Camacho Remodeling — Guymon, OK", "Presupuesto Gratis | Contacta a Camacho Remodeling — Guymon, OK"],
    desc: ["Request your free, no-obligation remodeling estimate in Guymon, OK. Call, text, WhatsApp or send us your project details online. Hablamos español.", "Solicita tu presupuesto de remodelación gratis y sin compromiso en Guymon, OK. Llámanos, escríbenos por mensaje o WhatsApp, o envíanos los detalles de tu proyecto en línea."]
  },
  `${pageHero({
    id: "contact", image: "kitchen-open-concept", crumb: ["nav.contact", "Contact", "Contacto"],
    eyebrow: ["Free Estimate", "Presupuesto Gratis"],
    title: ["Let's Talk About Your Project", "Hablemos de tu Proyecto"],
    lead: ["Tell us a little about what you have in mind. We'll get back to you quickly to schedule your free in-home consultation.", "Cuéntanos un poco sobre lo que tienes en mente. Te responderemos pronto para agendar tu consulta gratis a domicilio."]
  })}

<section class="section">
  <div class="container contact-layout">
    <div class="form-card reveal" id="estimate">
      ${T("h2", "form.title", "Request Your Free Estimate", "Solicita tu Presupuesto Gratis")}
      ${T("p", "form.intro", "It takes less than a minute. Fields marked * are required.", "Toma menos de un minuto. Los campos con * son obligatorios.")}
      <form id="estimate-form" novalidate>
        <div class="form-grid">
          <div class="field">
            <label for="f-name">${T("span", "form.name", "Full name", "Nombre completo")} *</label>
            <input id="f-name" name="name" type="text" autocomplete="name" required enterkeyhint="next" ${A(["placeholder", "form.name.ph", "e.g. Maria Lopez", "ej. María López"])}>
          </div>
          <div class="field">
            <label for="f-phone">${T("span", "form.phone", "Phone", "Teléfono")} *</label>
            <input id="f-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" required enterkeyhint="next" placeholder="(580) 000-0000" pattern="(?:\\D*\\d){7,}\\D*">
          </div>
          <div class="field">
            <label for="f-email">${T("span", "form.email", "Email", "Correo electrónico")} ${T("span", "form.optional", "(optional)", "(opcional)", 'class="opt"')}</label>
            <input id="f-email" name="email" type="email" inputmode="email" autocomplete="email" enterkeyhint="next" ${A(["placeholder", "form.email.ph", "you@example.com", "tu@correo.com"])}>
          </div>
          <div class="field">
            <label for="f-city">${T("span", "form.city", "City", "Ciudad")}</label>
            <input id="f-city" name="city" type="text" autocomplete="address-level2" value="Guymon" enterkeyhint="next">
          </div>
          <fieldset class="field full">
            ${T("legend", "form.project", "What would you like to remodel?", "¿Qué te gustaría remodelar?")}
            <div class="pill-options">
              ${svcOptions.map(([v, k, en, es]) => `<label><input type="checkbox" name="service" value="${v}"><span data-i18n="${k}">${t(k, en, es)}</span></label>`).join("\n              ")}
            </div>
          </fieldset>
          <div class="field">
            <label for="f-time">${T("span", "form.timeline", "When would you like to start?", "¿Cuándo te gustaría empezar?")}</label>
            <select id="f-time" name="timeline">
              ${timeline.map(([v, k, en, es]) => `<option value="${v}" data-i18n="${k}">${t(k, en, es)}</option>`).join("\n              ")}
            </select>
          </div>
          <fieldset class="field">
            ${T("legend", "form.pref", "Best way to reach you", "Mejor forma de contactarte")}
            <div class="pill-options">
              ${contactPref.map(([v, k, en, es], i) => `<label><input type="radio" name="contact_pref" value="${v}"${i === 0 ? " checked" : ""}><span data-i18n="${k}">${t(k, en, es)}</span></label>`).join("\n              ")}
            </div>
          </fieldset>
          <div class="field full">
            <label for="f-msg">${T("span", "form.message", "Tell us about your project", "Cuéntanos sobre tu proyecto")} ${T("span", "form.optional", "(optional)", "(opcional)", 'class="opt"')}</label>
            <textarea id="f-msg" name="message" rows="4" enterkeyhint="send" ${A(["placeholder", "form.message.ph", "Room size, what you'd like to change, budget range, photos you can text us…", "Tamaño del espacio, qué te gustaría cambiar, rango de presupuesto, fotos que nos puedas enviar…"])}></textarea>
          </div>
          <div class="hp-field" aria-hidden="true"><label>Leave empty <input type="text" name="_gotcha" tabindex="-1" autocomplete="off"></label></div>
        </div>
        <div class="form-foot">
          <button class="btn btn-lg btn-block" type="submit">${T("span", "form.submit", "Send My Free Estimate Request", "Enviar Solicitud de Presupuesto Gratis")} ${icon("arrow")}</button>
          <small>${icon("lock")}${T("span", "form.privacy", "Your information stays private. We never share or sell it.", "Tu información es privada. Nunca la compartimos ni la vendemos.")}</small>
        </div>
        <div class="form-status" role="status" aria-live="polite"></div>
      </form>
      ${(t("form.success", "Thank you! We received your request and will contact you shortly.", "¡Gracias! Recibimos tu solicitud y te contactaremos muy pronto."),
        t("form.error", "Something went wrong. Please call us or try again.", "Algo salió mal. Llámanos o inténtalo de nuevo."),
        t("form.mailto", "Your email app should open with your request ready to send. Prefer to talk? Call or text us anytime.", "Tu aplicación de correo debería abrirse con tu solicitud lista para enviar. ¿Prefieres hablar? Llámanos o envíanos un mensaje."),
        "")}
    </div>

    <aside class="contact-side reveal">
      <a class="contact-item" href="tel:${CONFIG.phoneE164}">
        <div class="icon-badge">${icon("phone")}</div>
        <div><small data-i18n="contact.call">${t("contact.call", "Call us", "Llámanos")}</small><strong>${CONFIG.phoneDisplay}</strong></div>
      </a>
      <a class="contact-item" href="https://wa.me/${CONFIG.whatsapp}" target="_blank" rel="noopener">
        <div class="icon-badge">${icon("chat")}</div>
        <div><small data-i18n="contact.wa">${t("contact.wa", "Text or WhatsApp", "Mensaje o WhatsApp")}</small><strong data-i18n="contact.wa.cta">${t("contact.wa.cta", "Send us photos of your space", "Envíanos fotos de tu espacio")}</strong></div>
      </a>
      <a class="contact-item" href="mailto:${CONFIG.email}">
        <div class="icon-badge">${icon("mail")}</div>
        <div><small data-i18n="contact.email">${t("contact.email", "Email", "Correo")}</small><strong>${CONFIG.email}</strong></div>
      </a>
      <div class="contact-item" style="align-items:flex-start">
        <div class="icon-badge">${icon("clock")}</div>
        <div style="flex:1">
          <small data-i18n="contact.hours">${t("contact.hours", "Business hours", "Horario de atención")}</small>
          <ul class="hours">
            <li><span data-i18n="contact.h.wk">${t("contact.h.wk", "Mon – Fri", "Lun – Vie")}</span><span>8:00 – 6:00</span></li>
            <li><span data-i18n="contact.h.sat">${t("contact.h.sat", "Saturday", "Sábado")}</span><span>9:00 – 2:00</span></li>
            <li><span data-i18n="contact.h.sun">${t("contact.h.sun", "Sunday", "Domingo")}</span><span data-i18n="contact.h.closed">${t("contact.h.closed", "Closed", "Cerrado")}</span></li>
          </ul>
        </div>
      </div>
      <div class="map-embed">
        <iframe src="https://www.google.com/maps?q=Guymon,+OK&amp;z=12&amp;output=embed" loading="lazy" referrerpolicy="no-referrer-when-downgrade" ${A(["title", "contact.map", "Map of Guymon, Oklahoma", "Mapa de Guymon, Oklahoma"])}></iframe>
      </div>
    </aside>
  </div>
</section>`
);

/* --------------------------------------------------------------------------
   404
   -------------------------------------------------------------------------- */
const notFound = page(
  {
    id: "nf", file: "404.html", base: new URL(CONFIG.siteUrl).pathname,
    title: ["Page Not Found | Camacho Remodeling", "Página No Encontrada | Camacho Remodeling"],
    desc: ["The page you're looking for doesn't exist.", "La página que buscas no existe."]
  },
  `<section class="not-found">
  <div class="container">
    <p class="big">404</p>
    ${T("h1", "nf.h", "This room is still under construction.", "Esta habitación aún está en obra.", 'class="h-section"')}
    ${T("p", "nf.p", "The page you're looking for doesn't exist or has moved.", "La página que buscas no existe o fue movida.", 'class="lead" style="margin-inline:auto"')}
    <div class="hero-ctas" style="justify-content:center; margin-top:1.5rem">
      <a class="btn" href="index.html">${T("span", "nf.home", "Back to Home", "Volver al Inicio")}</a>
      <a class="btn btn-outline" href="contact.html">${CTA_SHORT()}</a>
    </div>
  </div>
</section>`
);

/* --------------------------------------------------------------------------
   i18n runtime (written with the Spanish dictionary)
   -------------------------------------------------------------------------- */
const i18nRuntime = `/* AUTO-GENERATED by src/build.mjs — edit texts there, not here. */
(function () {
  "use strict";
  var ES = ${JSON.stringify(ES, null, 1)};
  var KEY = "cr-lang";
  var originals = new WeakMap();
  var current = "en";

  function saved(v) {
    try { if (v) localStorage.setItem(KEY, v); return localStorage.getItem(KEY); } catch (e) { return null; }
  }
  function initial() {
    var q = new URLSearchParams(location.search).get("lang");
    if (q === "es" || q === "en") return q;
    var s = saved();
    if (s === "es" || s === "en") return s;
    return (navigator.language || "en").toLowerCase().indexOf("es") === 0 ? "es" : "en";
  }
  function entry(el) {
    var o = originals.get(el);
    if (!o) { o = { attrs: {} }; originals.set(el, o); }
    return o;
  }
  function apply(lang) {
    current = lang;
    document.documentElement.lang = lang;
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var o = entry(el);
      if (o.html === undefined) o.html = el.innerHTML;
      var k = el.getAttribute("data-i18n");
      el.innerHTML = lang === "es" && ES[k] != null ? ES[k] : o.html;
    });
    document.querySelectorAll("[data-i18n-attr]").forEach(function (el) {
      var o = entry(el);
      el.getAttribute("data-i18n-attr").split(";").forEach(function (pair) {
        var i = pair.indexOf(":");
        var attr = pair.slice(0, i), k = pair.slice(i + 1);
        if (!(attr in o.attrs)) o.attrs[attr] = el.getAttribute(attr);
        el.setAttribute(attr, lang === "es" && ES[k] != null ? ES[k] : o.attrs[attr]);
      });
    });
    document.querySelectorAll("[data-lang]").forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.getAttribute("data-lang") === lang));
    });
  }
  function set(lang) {
    apply(lang);
    saved(lang);
    var url = new URL(location.href);
    if (url.searchParams.has("lang")) { url.searchParams.delete("lang"); history.replaceState(null, "", url); }
  }

  window.I18N = {
    t: function (k) { return current === "es" ? ES[k] : null; },
    set: set,
    get lang() { return current; }
  };

  var start = initial();
  if (start !== "en") apply(start);
  document.querySelectorAll("[data-lang]").forEach(function (b) {
    b.addEventListener("click", function () { set(b.getAttribute("data-lang")); });
  });
})();
`;

const configJs = `/* AUTO-GENERATED by src/build.mjs — edit CONFIG there, not here. */
window.SITE = ${JSON.stringify({ email: CONFIG.email, phoneE164: CONFIG.phoneE164, formEndpoint: CONFIG.formEndpoint }, null, 2)};
`;

/* --------------------------------------------------------------------------
   Write files
   -------------------------------------------------------------------------- */
const out = (rel, content) => {
  const p = join(ROOT, rel);
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, content, "utf8");
  console.log("  wrote", rel);
};

out("index.html", home);
out("services.html", services);
out("gallery.html", gallery);
out("about.html", about);
out("contact.html", contact);
out("404.html", notFound);
out("assets/js/i18n.js", i18nRuntime);
out("assets/js/config.js", configJs);
out("robots.txt", `User-agent: *\nAllow: /\n\nSitemap: ${CONFIG.siteUrl}sitemap.xml\n`);
out("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${["", "services.html", "gallery.html", "about.html", "contact.html"].map((f) => `  <url><loc>${CONFIG.siteUrl}${f}</loc></url>`).join("\n")}
</urlset>
`);
console.log(`\nDone. ${Object.keys(ES).length} translated strings.`);
