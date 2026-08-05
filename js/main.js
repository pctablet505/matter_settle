/* ═══════════════════════════════════════════════════════════════
   Matter Settle — Main JS
   Plain, dependency-free behaviour: no-FOUC theme toggle, scroll
   chrome, reveal-on-scroll, mobile menu/CTA and the contact form.
   Nothing here needs live data — this is a fully static site with no
   numbers to animate. Every function guards on its target element
   existing, so the file is safe to include unchanged on every page.
   ═══════════════════════════════════════════════════════════════ */
'use strict';

const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

document.addEventListener('DOMContentLoaded', boot);

/* Each init runs in its own try/catch so one broken feature can never stop
   the others — in particular, initReveal() must always run or the whole page
   would stay invisible (every .reveal element starts at opacity 0). */
function boot() {
  [
    initTheme,
    initNav,
    initScrollChrome,
    initReveal,
    initMobileMenu,
    initMobileCta,
    initActiveNav,
    initArticleEnhancements,
    initContactForm
  ].forEach(fn => {
    try { fn(); } catch (err) { console.error('[matter-settle] ' + fn.name + ' failed:', err); }
  });

  /* Last-resort safety net: whatever else happened, nothing stays invisible. */
  setTimeout(() => {
    document.querySelectorAll('.reveal:not(.visible)').forEach(el => el.classList.add('visible'));
  }, 1200);
}

/* ═══════════════════════════════════════════════════════════════
   THEME — dark default, persisted
   ═══════════════════════════════════════════════════════════════ */
const THEME_KEY = 'ms-theme';

function currentTheme() {
  return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
}

function setTheme(theme, persist = true) {
  document.documentElement.dataset.theme = theme;
  if (persist) { try { localStorage.setItem(THEME_KEY, theme); } catch (e) {} }
}

function initTheme() {
  // One frame of no-transitions so first paint doesn't cross-fade
  document.body.classList.add('no-transitions');
  requestAnimationFrame(() => requestAnimationFrame(() =>
    document.body.classList.remove('no-transitions')));

  // The visible button is the only way to switch themes. (There used to be a
  // bare "T" keyboard shortcut; it fired during Firefox type-ahead find and
  // inverted the page for no apparent reason.)
  document.querySelectorAll('.theme-toggle').forEach(btn =>
    btn.addEventListener('click', () =>
      setTheme(currentTheme() === 'dark' ? 'light' : 'dark')));
}

/* ═══════════════════════════════════════════════════════════════
   NAV scroll state
   ═══════════════════════════════════════════════════════════════ */
function initNav() {
  const nav = document.getElementById('navbar');
  if (!nav) return;
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 60);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ═══════════════════════════════════════════════════════════════
   SCROLL CHROME — progress bar + back-to-top
   ═══════════════════════════════════════════════════════════════ */
function initScrollChrome() {
  const bar = document.getElementById('scrollProgress');
  const top = document.getElementById('backTop');
  const onScroll = () => {
    if (bar) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + '%';
    }
    if (top) top.classList.toggle('show', window.scrollY > 600);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  if (top) top.addEventListener('click', () =>
    window.scrollTo({ top: 0, behavior: REDUCED_MOTION ? 'auto' : 'smooth' }));
}

/* ═══════════════════════════════════════════════════════════════
   SCROLL REVEAL — fast and un-staggered on purpose: a visitor who
   flicks down the page must never overtake a still-fading element.
   ═══════════════════════════════════════════════════════════════ */
function initReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;
  if (REDUCED_MOTION || !('IntersectionObserver' in window)) {
    els.forEach(el => el.classList.add('visible'));
    return;
  }
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visible');
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.05, rootMargin: '0px 0px -20px 0px' });
  els.forEach(el => obs.observe(el));
}

/* ═══════════════════════════════════════════════════════════════
   MOBILE MENU + smooth anchor scroll
   ═══════════════════════════════════════════════════════════════ */
function initMobileMenu() {
  const btn  = document.getElementById('hamburger');
  const menu = document.getElementById('mobileMenu');

  if (btn && menu) {
    // Backdrop: tap-outside-to-close
    const backdrop = document.createElement('div');
    backdrop.className = 'menu-backdrop';
    document.body.appendChild(backdrop);

    const setOpen = open => {
      menu.classList.toggle('open', open);
      btn.classList.toggle('open', open);
      backdrop.classList.toggle('show', open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    };
    btn.addEventListener('click', () => setOpen(!menu.classList.contains('open')));
    backdrop.addEventListener('click', () => setOpen(false));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') setOpen(false); });
    menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setOpen(false)));
  }

  // Smooth scroll for same-page anchors (runs on every page, menu or not)
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const tgt = document.querySelector(a.getAttribute('href'));
      if (!tgt) return;
      e.preventDefault();
      window.scrollTo({ top: tgt.getBoundingClientRect().top + window.scrollY - 72, behavior: REDUCED_MOTION ? 'auto' : 'smooth' });
    });
  });
}

/* ═══════════════════════════════════════════════════════════════
   STICKY BOTTOM CTA — mobile only, home only. Appears after the
   hero, hides when the contact section is on screen. This is the
   "fast, obvious way to start a conversation" mechanism.
   ═══════════════════════════════════════════════════════════════ */
function initMobileCta() {
  const contact = document.getElementById('contact');
  if (!contact) return;
  if (!window.matchMedia('(max-width: 860px)').matches) return;

  const bar = document.createElement('div');
  bar.id = 'mobileCta';
  bar.innerHTML = '<a href="#contact" class="btn-primary">Start a Conversation</a>';
  document.body.appendChild(bar);
  // Tells the stylesheet to lift #backTop above this bar so they don't overlap.
  document.body.classList.add('has-mobile-cta');

  const hero = document.getElementById('hero');
  let contactInView = false;
  const update = () => {
    const past = window.scrollY > (hero ? hero.offsetHeight * 0.7 : 480);
    bar.classList.toggle('show', past && !contactInView);
  };
  new IntersectionObserver(es => {
    contactInView = es[0].isIntersecting;
    update();
  }, { rootMargin: '-10% 0px -10% 0px' }).observe(contact);
  window.addEventListener('scroll', update, { passive: true });
  update();
}

/* ═══════════════════════════════════════════════════════════════
   ACTIVE NAV HIGHLIGHT (home page sections)
   ═══════════════════════════════════════════════════════════════ */
function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const links    = document.querySelectorAll('.nav-links a[href^="#"]');
  if (!sections.length || !links.length) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      links.forEach(a => a.classList.remove('nav-on'));
      const a = document.querySelector(`.nav-links a[href="#${e.target.id}"]`);
      if (a) a.classList.add('nav-on');
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  sections.forEach(s => obs.observe(s));
}

/* ═══════════════════════════════════════════════════════════════
   ARTICLE ENHANCEMENTS — heading anchors on long-form pages.
   Activates only where .article-prose exists.
   ═══════════════════════════════════════════════════════════════ */
function initArticleEnhancements() {
  const prose = document.querySelector('.article-prose');
  if (!prose) return;
  const headings = [...prose.querySelectorAll('h2, h3')];

  const used = new Set();
  headings.forEach(h => {
    if (!h.id) {
      let slug = h.textContent.trim().toLowerCase()
        .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'section';
      let s = slug, n = 2;
      while (used.has(s)) s = `${slug}-${n++}`;
      used.add(s);
      h.id = s;
    }
  });
}

/* ═══════════════════════════════════════════════════════════════
   CONTACT FORM
   Static hosting means there is no server to post to, so the form
   hands the message to the visitor's own email app via mailto:.
   That fails silently for webmail users and on locked-down machines,
   so we ALWAYS also show the message in a copyable box and leave the
   form on screen. Never hide the form: a lost inquiry is invisible
   to us and the visitor has no way to retry.

   TODO(owner): if you'd rather receive submissions directly, sign up
   for a static-friendly form endpoint (Formspree, Getform or similar)
   and change the <form> to post to it. No build tooling or server is
   needed for that — keep the mailto: link as a visible fallback.
   ═══════════════════════════════════════════════════════════════ */

/* The studio's real inbox. Must stay identical to the address printed in
   index.html (twice) and privacy/index.html — change all four together. */
const CONTACT_EMAIL = 'settleyourmatter@gmail.com';

function initContactForm() {
  const form     = document.getElementById('contactForm');
  const fallback = document.getElementById('formFallback');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    const name = form.elements.name.value.trim();
    const mail = form.elements.email.value.trim();
    const msg  = form.elements.message.value.trim();
    if (!name || !mail) return;

    const subject = `[Matter Settle] Inquiry from ${name}`;
    const body    = `Name: ${name}\nEmail: ${mail}\n\n${msg}`;

    window.location.href = `mailto:${CONTACT_EMAIL}`
      + `?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    if (fallback) {
      const box = document.getElementById('fallbackText');
      if (box) box.value = `To: ${CONTACT_EMAIL}\nSubject: ${subject}\n\n${body}`;
      fallback.hidden = false;
    }
  });

  const copyBtn = document.getElementById('copyBtn');
  const box     = document.getElementById('fallbackText');
  if (copyBtn && box) {
    copyBtn.addEventListener('click', () => {
      box.select();
      let ok = false;
      try { ok = document.execCommand('copy'); } catch (err) { ok = false; }
      if (!ok && navigator.clipboard) {
        navigator.clipboard.writeText(box.value).then(
          () => { copyBtn.textContent = 'Copied'; },
          () => { copyBtn.textContent = 'Select the text and copy it'; }
        );
        return;
      }
      copyBtn.textContent = ok ? 'Copied' : 'Select the text and copy it';
    });
  }
}
