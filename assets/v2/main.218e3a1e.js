/* Matter Settle: theme toggle, mobile menu, copy buttons, contact draft. No dependencies, nothing sent anywhere.
   Everything here is an enhancement: every page works with JavaScript off. */
(function () {
  'use strict';
  var CONTACT_EMAIL = 'settleyourmatter@gmail.com';
  var root = document.documentElement;
  var STORE = 'ms-theme';
  var PAGE_COLOUR = { dark: '#0B0C0D', light: '#F1F2EE' };

  /* ---- Theme ---- */
  function current() {
    var t = root.getAttribute('data-theme');
    if (t === 'light' || t === 'dark') return t;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }
  function labelTheme(btn) {
    var next = current() === 'dark' ? 'light' : 'dark';
    btn.setAttribute('aria-label', 'Switch to ' + next + ' theme');
    btn.setAttribute('title', 'Switch to ' + next + ' theme');
  }
  function paintBar(theme) {
    document.querySelectorAll('meta[name="theme-color"]').forEach(function (m) { m.setAttribute('content', PAGE_COLOUR[theme]); });
  }
  var themeBtn = document.querySelector('.theme-btn');
  if (themeBtn) {
    labelTheme(themeBtn);
    if (root.hasAttribute('data-theme')) paintBar(current());
    themeBtn.addEventListener('click', function () {
      var next = current() === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem(STORE, next); } catch (e) { /* private mode: theme lasts for this page only */ }
      labelTheme(themeBtn);
      paintBar(next);
    });
  }

  /* ---- Mobile menu: closes on Escape, on a click outside, and when focus leaves the navigation ---- */
  var menuBtn = document.querySelector('.menu-btn');
  var nav = menuBtn && menuBtn.closest('nav');
  var menu = menuBtn && document.getElementById(menuBtn.getAttribute('aria-controls'));
  function isOpen() { return menuBtn.getAttribute('aria-expanded') === 'true'; }
  function setMenu(open) {
    menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    menu.classList.toggle('is-open', open);
  }
  if (menu && nav) {
    menuBtn.addEventListener('click', function () { setMenu(!isOpen()); });
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape' || !isOpen()) return;
      var inside = menu.contains(document.activeElement) || document.activeElement === menuBtn;
      setMenu(false);
      if (inside) menuBtn.focus();
    });
    document.addEventListener('click', function (e) {
      if (isOpen() && !menu.contains(e.target) && !menuBtn.contains(e.target)) setMenu(false);
    });
    /* Focus moving out of the navigation closes the panel, so it can never cover the focused element (WCAG 2.4.11). */
    document.addEventListener('focusin', function (e) {
      if (isOpen() && !nav.contains(e.target)) setMenu(false);
    });
    window.addEventListener('resize', function () {
      if (window.matchMedia('(min-width: 66rem)').matches) setMenu(false);
    });
  }

  /* ---- Print: open every <details> so the answers print, then put them back ---- */
  var wasOpen = [];
  window.addEventListener('beforeprint', function () {
    wasOpen = [];
    document.querySelectorAll('details').forEach(function (d) { wasOpen.push(d.open); d.open = true; });
  });
  window.addEventListener('afterprint', function () {
    document.querySelectorAll('details').forEach(function (d, i) { d.open = !!wasOpen[i]; });
  });

  /* ---- Copy buttons ---- */
  function say(status, text, error) {
    if (!status) return;
    status.textContent = text;
    status.classList.toggle('is-error', !!error);
  }
  function copyText(text, status, done, failed) {
    function ok() { say(status, done, false); }
    function fail() { say(status, failed, true); }
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(ok, fail);
      return;
    }
    var ta = document.createElement('textarea');
    ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    try { if (document.execCommand('copy')) ok(); else fail(); } catch (e) { fail(); }
    document.body.removeChild(ta);
  }
  function statusFor(btn) { return document.getElementById(btn.getAttribute('data-status')); }
  document.querySelectorAll('[data-copy-address]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      copyText(CONTACT_EMAIL, statusFor(btn), 'Address copied: ' + CONTACT_EMAIL,
        'Could not copy. Select the address and copy it by hand.');
    });
  });
  document.querySelectorAll('[data-copy-from]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var src = document.getElementById(btn.getAttribute('data-copy-from'));
      if (src) copyText(src.textContent, statusFor(btn), 'Copied. Paste it into your own document.',
        'Could not copy. Select the text and copy it by hand.');
    });
  });

  /* ---- Contact page: the form opens the visitor's email app with the draft; after that, show the fallback ---- */
  var form = document.querySelector('.mail-form');
  if (form) {
    var subject = form.querySelector('[name="subject"]');
    var body = form.querySelector('[name="body"]');
    var fallback = document.getElementById('fallback');
    var crlf = function (s) { return s.replace(/\r?\n/g, '\r\n'); };
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var s = subject && subject.value.trim() ? subject.value.trim() : 'Enquiry: ';
      window.location.href = 'mailto:' + CONTACT_EMAIL + '?subject=' + encodeURIComponent(s) +
        '&body=' + encodeURIComponent(crlf(body ? body.value : ''));
      if (fallback) fallback.classList.add('is-shown');
    });
    var copyMsg = form.querySelector('[data-copy-message]');
    if (copyMsg) {
      copyMsg.addEventListener('click', function () {
        var s = subject && subject.value.trim() ? 'Subject: ' + subject.value.trim() + '\n\n' : '';
        copyText(s + (body ? body.value : ''), statusFor(copyMsg), 'Message copied. Paste it into an email to ' + CONTACT_EMAIL + '.',
          'Could not copy. Select the message and copy it by hand.');
      });
    }
  }
})();
