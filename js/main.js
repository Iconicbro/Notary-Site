/* Site behavior: accessible tabs (WAI-ARIA pattern), deep links, request form.
   No third-party scripts, no inline handlers — keeps the Content-Security-Policy strict. */
(function () {
  'use strict';

  // ---------- Tabs ----------
  var tabs = Array.prototype.slice.call(document.querySelectorAll('[role="tab"]'));
  var serviceSelect = document.getElementById('f-service');

  function activate(tab, opts) {
    opts = opts || {};
    tabs.forEach(function (t) {
      var selected = t === tab;
      t.setAttribute('aria-selected', String(selected));
      t.tabIndex = selected ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).hidden = !selected;
    });
    if (opts.focus) tab.focus();
    if (serviceSelect) serviceSelect.value = tab.dataset.service || tab.dataset.slug;
    if (opts.updateHash !== false && history.replaceState) {
      history.replaceState(null, '', '#' + tab.dataset.slug);
    }
  }

  tabs.forEach(function (tab, i) {
    tab.addEventListener('click', function () { activate(tab); });
    tab.addEventListener('keydown', function (e) {
      var next = null;
      if (e.key === 'ArrowRight') next = tabs[(i + 1) % tabs.length];
      else if (e.key === 'ArrowLeft') next = tabs[(i - 1 + tabs.length) % tabs.length];
      else if (e.key === 'Home') next = tabs[0];
      else if (e.key === 'End') next = tabs[tabs.length - 1];
      if (next) { e.preventDefault(); activate(next, { focus: true }); }
    });
  });

  // Deep link: /#loan-signing opens that tab
  function fromHash() {
    var slug = location.hash.replace('#', '');
    var match = tabs.filter(function (t) { return t.dataset.slug === slug; })[0];
    if (match) {
      activate(match, { updateHash: false });
      document.getElementById('services').scrollIntoView();
    }
  }
  fromHash();
  window.addEventListener('hashchange', fromHash);

  // Panel CTA buttons preselect the service in the form
  document.querySelectorAll('[data-service]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (serviceSelect) serviceSelect.value = btn.dataset.service;
    });
  });

  // ---------- Flip cards (service front / pricing back) ----------
  document.querySelectorAll('.flip').forEach(function (card) {
    var front = card.querySelector('.front');
    var back = card.querySelector('.back');
    function set(flipped) {
      card.classList.toggle('is-flipped', flipped);
      front.inert = flipped; back.inert = !flipped;
      front.setAttribute('aria-hidden', String(flipped));
      back.setAttribute('aria-hidden', String(!flipped));
    }
    set(false);
    card.addEventListener('click', function (e) {
      if (e.target.closest('a')) return;
      if (window.getSelection && String(window.getSelection()).length) return; // let people select text
      var flipped = !card.classList.contains('is-flipped');
      set(flipped);
      if (e.target.closest('.flip-btn')) (flipped ? back : front).querySelector('.flip-btn').focus();
    });
  });

  // ---------- Request form ----------
  // FORM_ENDPOINT: set to a secure (HTTPS) form-handling endpoint when ready,
  // and add its origin to connect-src / form-action in the CSP meta tag.
  var FORM_ENDPOINT = '';

  var form = document.getElementById('request-form');
  var status = form && form.querySelector('.form-status');

  // Block obviously sensitive data from being typed into the free-text field.
  var SENSITIVE = /\b\d{3}-?\d{2}-?\d{4}\b|\b(?:\d[ -]?){13,19}\b/;

  function setStatus(msg, kind) {
    status.textContent = msg;
    status.className = 'form-status' + (kind ? ' is-' + kind : '');
  }

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var firstInvalid = null;
      Array.prototype.forEach.call(form.elements, function (el) {
        if (!el.willValidate || el.name === 'website') return;
        var ok = el.checkValidity();
        el.setAttribute('aria-invalid', String(!ok));
        if (!ok && !firstInvalid) firstInvalid = el;
      });
      if (firstInvalid) {
        setStatus('Please complete the highlighted fields.', 'error');
        firstInvalid.focus();
        return;
      }
      if (form.website.value) return; // honeypot tripped: silently drop

      var details = form.details.value;
      if (SENSITIVE.test(details)) {
        form.details.setAttribute('aria-invalid', 'true');
        setStatus('It looks like you entered an ID, SSN, or account number. Please remove it — we will send a secure link if we need it.', 'error');
        form.details.focus();
        return;
      }

      if (!FORM_ENDPOINT) {
        setStatus('Thanks! (Draft site: the form is not connected yet, so nothing was sent.)', 'ok');
        return;
      }

      var data = new FormData(form);
      data.delete('website');
      fetch(FORM_ENDPOINT, { method: 'POST', body: data, headers: { Accept: 'application/json' }, credentials: 'omit' })
        .then(function (r) {
          if (!r.ok) throw new Error();
          form.reset();
          setStatus('Thank you — we received your request and will be in touch shortly.', 'ok');
        })
        .catch(function () {
          setStatus('Something went wrong. Please call us instead.', 'error');
        });
    });
  }

  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();

// ---------- Header: hamburger menu + solid background after the hero ----------
(function () {
  'use strict';
  var header = document.querySelector('.site-header');
  var toggle = document.querySelector('.menu-toggle');
  var menu = document.getElementById('site-menu');
  var heroVisual = document.querySelector('.hero-visual');
  if (!header || !toggle || !menu) return;

  function setOpen(open, opts) {
    menu.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    if (open) { var first = menu.querySelector('a'); if (first) first.focus(); }
    else if (opts && opts.returnFocus) toggle.focus();
  }

  toggle.addEventListener('click', function () { setOpen(menu.hidden); });
  menu.addEventListener('click', function (e) { if (e.target.closest('a')) setOpen(false); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !menu.hidden) setOpen(false, { returnFocus: true });
  });
  document.addEventListener('click', function (e) {
    if (!menu.hidden && !e.target.closest('.header-actions')) setOpen(false);
  });

  function onScroll() {
    var limit = heroVisual ? heroVisual.offsetHeight - header.offsetHeight : 10;
    header.classList.toggle('is-scrolled', window.scrollY > limit);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();
})();
