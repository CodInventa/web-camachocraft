# Camacho Remodeling — Sitio web

Sitio estático, bilingüe (inglés / español), listo para **GitHub Pages**. Sin frameworks ni dependencias: HTML + CSS + JavaScript.

- **Páginas:** Inicio, Servicios, Galería de Proyectos, Nosotros, Contacto / Presupuesto Gratis y 404.
- **Idioma:** selector EN | ES en el menú. Detecta el idioma del navegador, recuerda la elección y acepta `?lang=es` en la URL.
- **SEO:** títulos y descripciones por página, Open Graph, datos estructurados `HomeAndConstructionBusiness`, `sitemap.xml` y `robots.txt`.
- **Estrategia, paleta, copy en espejo y guía UX:** ver [`docs/GUIA-DEL-SITIO.md`](docs/GUIA-DEL-SITIO.md).

## ⚠️ Antes de publicar: datos del negocio

El teléfono, el correo y el horario son **marcadores de posición**. Edita el bloque `CONFIG` al inicio de [`src/build.mjs`](src/build.mjs):

```js
const CONFIG = {
  phoneDisplay: "(580) 555-0199",      // teléfono real
  phoneE164: "+15805550199",
  whatsapp: "15805550199",
  email: "info@camachoremodeling.com", // correo real
  siteUrl: "https://codinventa.github.io/web-camachocraft/",
  formEndpoint: "",                    // opcional, ver abajo
  ...
};
```

El horario de atención está en la sección `CONTACT` del mismo archivo.

## Cómo editar textos

**Todos los textos están en `src/build.mjs`**, cada uno en inglés y español:

```js
t("home.hero.title", "Fall in Love With Your Home Again.", "Vuelve a Enamorarte de tu Casa.")
```

Después de editar, regenera las páginas:

```bash
node src/build.mjs
```

> Los archivos `*.html`, `assets/js/i18n.js` y `assets/js/config.js` se generan desde ese script. GitHub Actions lo vuelve a ejecutar en cada push, así que **no edites el HTML a mano**: los cambios se perderían.

## Publicar en GitHub Pages

1. Sube el repositorio a GitHub (rama `main`).
2. En GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Cada push a `main` ejecuta `.github/workflows/pages.yml`, que genera y publica el sitio.
4. URL: `https://codinventa.github.io/web-camachocraft/`

**Dominio propio (opcional):** crea un archivo `CNAME` con el dominio (ej. `camachoremodeling.com`), configura el DNS según la [guía de GitHub](https://docs.github.com/pages/configuring-a-custom-domain-for-your-github-pages-site) y actualiza `siteUrl` en `CONFIG`.

## Formulario de presupuesto

GitHub Pages no ejecuta código de servidor. El formulario funciona de dos maneras:

- **Sin configurar (por defecto):** abre la app de correo del visitante con la solicitud ya redactada para `CONFIG.email`.
- **Recomendado:** crea un formulario gratis en [Formspree](https://formspree.io), copia su URL (`https://formspree.io/f/xxxxxx`) en `CONFIG.formEndpoint` y regenera. Las solicitudes te llegarán directo al correo, sin que el visitante salga de la página.

## Fotos

- Las imágenes optimizadas están en `assets/img/` (`nombre.jpg` de 1600 px y `nombre-800.jpg` para móvil).
- La carpeta `tmp/` (fotos y videos originales de WhatsApp) está en `.gitignore` y no se publica.
- Para agregar una foto a la galería: guarda las dos versiones en `assets/img/` y añade una entrada al arreglo `GALLERY` en `src/build.mjs`.

### Antes y Después

La galería incluye un comparador deslizante listo para usar (sección `#before-after`, oculta por ahora porque todavía no hay fotos del "antes"). Para activarlo:

1. Toma la foto del "antes" y del "después" **desde el mismo punto y con el mismo encuadre** (horizontal 4:3).
2. Guárdalas como `assets/img/<nombre>-before.jpg` y `assets/img/<nombre>-after.jpg`.
3. En `src/build.mjs`, descomenta el bloque `.ba-slider` de ejemplo (uno por par) y quita el atributo `hidden` de la sección.

## Vista previa local

```bash
node src/build.mjs
```

```bash
npx serve .
```

## Estructura

```
├── index.html, services.html, gallery.html, about.html, contact.html, 404.html   (generados)
├── assets/
│   ├── css/styles.css
│   ├── js/main.js        menú, galería, lightbox, formulario, antes/después
│   ├── js/i18n.js        diccionario ES + motor de idioma (generado)
│   ├── js/config.js      datos de contacto para el JS (generado)
│   └── img/              fotos optimizadas + favicon
├── src/build.mjs         ← fuente única de textos y datos
├── docs/GUIA-DEL-SITIO.md
└── .github/workflows/pages.yml
```
