/* ==========================================================================
   Camacho Remodeling — site behavior
   ========================================================================== */

// Business info (email, phone, form endpoint) comes from assets/js/config.js,
// which is generated from CONFIG in src/build.mjs.
const SITE = window.SITE || {};

document.documentElement.classList.add("js");

/* ---------- Header: scroll state + mobile nav ---------- */
function initHeader() {
  const header = document.querySelector(".site-header");
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.getElementById("main-nav");
  const bar = document.querySelector(".mobile-bar");

  const onScroll = () => {
    const y = window.scrollY;
    header && header.classList.toggle("is-scrolled", y > 8);
    bar && bar.classList.toggle("is-visible", y > 420);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  if (!toggle || !nav) return;
  const setOpen = (open) => {
    toggle.setAttribute("aria-expanded", String(open));
    nav.classList.toggle("is-open", open);
    document.body.classList.toggle("nav-open", open);
  };
  toggle.addEventListener("click", () => setOpen(toggle.getAttribute("aria-expanded") !== "true"));
  nav.addEventListener("click", (e) => { if (e.target.closest("a")) setOpen(false); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setOpen(false); });
  window.matchMedia("(min-width: 1141px)").addEventListener("change", (m) => m.matches && setOpen(false));
}

/* ---------- Reveal on scroll ---------- */
function initReveal() {
  const items = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) { items.forEach((i) => i.classList.add("is-in")); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); } });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
  items.forEach((i) => io.observe(i));
}

/* ---------- Gallery: filters + lightbox ---------- */
function initGallery() {
  const grid = document.querySelector(".gallery-grid");
  if (!grid) return;
  const items = [...grid.querySelectorAll(".gallery-item")];
  const filterBtns = document.querySelectorAll(".filters button");

  filterBtns.forEach((btn) => btn.addEventListener("click", () => {
    const f = btn.dataset.filter;
    filterBtns.forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
    items.forEach((it) => { it.hidden = !(f === "all" || it.dataset.cat.split(" ").includes(f)); });
  }));

  const lb = document.querySelector(".lightbox");
  if (!lb) return;
  const lbImg = lb.querySelector("img");
  const lbCap = lb.querySelector("figcaption");
  let current = 0;
  let lastFocus = null;
  const visible = () => items.filter((i) => !i.hidden);

  const show = (idx) => {
    const list = visible();
    current = (idx + list.length) % list.length;
    const it = list[current];
    const img = it.querySelector("img");
    lbImg.src = it.dataset.full || img.src;
    lbImg.alt = img.alt;
    lbCap.textContent = [...it.querySelectorAll("figcaption > *")].map((n) => n.textContent.trim()).join(" · ");
  };
  const open = (it) => {
    lastFocus = document.activeElement;
    show(visible().indexOf(it));
    lb.classList.add("is-open");
    lb.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    lb.querySelector(".lb-close").focus();
  };
  const close = () => {
    lb.classList.remove("is-open");
    lb.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    lastFocus && lastFocus.focus();
  };

  items.forEach((it) => it.querySelector("button").addEventListener("click", () => open(it)));
  lb.querySelector(".lb-close").addEventListener("click", close);
  lb.querySelector(".lb-prev").addEventListener("click", () => show(current - 1));
  lb.querySelector(".lb-next").addEventListener("click", () => show(current + 1));
  lb.addEventListener("click", (e) => { if (e.target === lb) close(); });
  document.addEventListener("keydown", (e) => {
    if (!lb.classList.contains("is-open")) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") show(current - 1);
    if (e.key === "ArrowRight") show(current + 1);
  });
  let startX = null;
  lb.addEventListener("touchstart", (e) => { startX = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener("touchend", (e) => {
    if (startX === null) return;
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 50) show(current + (dx < 0 ? 1 : -1));
    startX = null;
  });
}

/* ---------- Before / After sliders ---------- */
function initBeforeAfter() {
  document.querySelectorAll(".ba-slider").forEach((s) => {
    const range = s.querySelector("input[type=range]");
    const set = (v) => s.style.setProperty("--pos", `${v}%`);
    set(range.value);
    range.addEventListener("input", () => set(range.value));
  });
}

/* ---------- Estimate form ---------- */
function initForm() {
  const form = document.getElementById("estimate-form");
  if (!form) return;
  const status = form.querySelector(".form-status");
  const submit = form.querySelector("button[type=submit]");
  const t = (key, fallback) => (window.I18N ? window.I18N.t(key) : null) || fallback;

  // Pre-select a service from ?service=kitchen
  const pre = new URLSearchParams(location.search).get("service");
  if (pre) {
    const opt = form.querySelector(`input[name="service"][value="${CSS.escape(pre)}"]`);
    if (opt) opt.checked = true;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    status.className = "form-status";
    if (form.querySelector('[name="_gotcha"]').value) return; // bot
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    const data = new FormData(form);
    const services = data.getAll("service").join(", ") || "-";
    const fields = {
      name: data.get("name"),
      phone: data.get("phone"),
      email: data.get("email") || "-",
      city: data.get("city") || "-",
      services,
      timeline: data.get("timeline") || "-",
      contact_pref: data.get("contact_pref") || "-",
      message: data.get("message") || "-",
      language: document.documentElement.lang
    };

    if (SITE.formEndpoint) {
      submit.disabled = true;
      try {
        const res = await fetch(SITE.formEndpoint, {
          method: "POST",
          headers: { Accept: "application/json", "Content-Type": "application/json" },
          body: JSON.stringify({ ...fields, _subject: `New estimate request — ${fields.name}` })
        });
        if (!res.ok) throw new Error(res.statusText);
        form.reset();
        status.textContent = t("form.success", "Thank you! We received your request and will contact you shortly.");
        status.classList.add("is-success");
      } catch (err) {
        status.textContent = t("form.error", "Something went wrong. Please call us or try again.");
        status.classList.add("is-error");
      } finally {
        submit.disabled = false;
      }
      return;
    }

    // Fallback: open the visitor's email app with everything pre-filled.
    const body = [
      `Name: ${fields.name}`,
      `Phone: ${fields.phone}`,
      `Email: ${fields.email}`,
      `City: ${fields.city}`,
      `Project: ${fields.services}`,
      `Timeline: ${fields.timeline}`,
      `Preferred contact: ${fields.contact_pref}`,
      `Language: ${fields.language}`,
      "",
      fields.message
    ].join("\n");
    const href = `mailto:${SITE.email}?subject=${encodeURIComponent(`Free estimate request — ${fields.name}`)}&body=${encodeURIComponent(body)}`;
    window.location.href = href;
    status.textContent = t("form.mailto", "Your email app should open with your request ready to send. Prefer to talk? Call or text us anytime.");
    status.classList.add("is-success");
  });
}

/* ---------- Footer year ---------- */
function initYear() {
  document.querySelectorAll("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));
}

document.addEventListener("DOMContentLoaded", () => {
  initHeader();
  initReveal();
  initGallery();
  initBeforeAfter();
  initForm();
  initYear();
});
