/* ==========================================================================
   GIRAFFE 1on1 SA - main.js
   Page behaviour runs first and never needs GSAP, so the nav, jump links and
   enquiry form still work if the animation library fails to load.
   ========================================================================== */

(() => {
  'use strict';

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  /* ------------------------------------------------------------------
     Where enquiries go. Set this to the business enquiry inbox's form
     endpoint and the form is live; nothing else needs to change.
       Formspree  'https://formspree.io/f/xxxxxxxx'
       Basin      'https://usebasin.com/f/xxxxxxxx'
       Vercel fn  '/api/enquiry'
     While it is null the form validates and shows its success state
     without sending anything.
     ------------------------------------------------------------------ */
  const FORM_ENDPOINT = null;

  /* ------------------------------------------------------------------
     Nav: solid as soon as the page moves, so the logo never slides over the headline
     ------------------------------------------------------------------ */
  const nav = $('#nav');
  const setNav = () => nav.classList.toggle('is-scrolled', window.scrollY > 40);
  window.addEventListener('scroll', setNav, { passive: true });
  setNav();

  /* ------------------------------------------------------------------
     Jump links. An Enquire now button with data-package also ticks that
     package in the form.
     ------------------------------------------------------------------ */
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const href = a.getAttribute('href');
    e.preventDefault();
    if (a.dataset.package) {
      const radio = $(`input[data-key="${a.dataset.package}"]`);
      if (radio) { radio.checked = true; radio.dispatchEvent(new Event('change', { bubbles: true })); }
    }
    const top = href === '#top' ? 0 : $(href).getBoundingClientRect().top + window.scrollY - nav.offsetHeight + 1;
    window.scrollTo({ top, behavior: reduced ? 'auto' : 'smooth' });
  });

  /* ------------------------------------------------------------------
     Experience panels: one open at a time. A mouse opens them on hover after
     a short pause, so sweeping across the row does not flicker. Below 900px
     the CSS turns them into a carousel and the tabs are hidden.
     ------------------------------------------------------------------ */
  const panels = $$('.panel');
  const openPanel = (panel) => panels.forEach(p => {
    p.classList.toggle('is-open', p === panel);
    $('.panel__tab', p).setAttribute('aria-expanded', String(p === panel));
  });
  panels.forEach(p => {
    let hover;
    $('.panel__tab', p).addEventListener('click', () => openPanel(p));
    p.addEventListener('pointerenter', (e) => {
      if (e.pointerType === 'mouse') hover = setTimeout(() => openPanel(p), 110);
    });
    p.addEventListener('pointerleave', () => clearTimeout(hover));
  });

  /* ------------------------------------------------------------------
     Carousel arrows, shown below 900px. Swiping and the buttons share one
     position: it updates as soon as a button is pressed, and resyncs once
     a swipe settles.
     ------------------------------------------------------------------ */
  const rail = $('.trail__panels');
  const arrows = $$('.trail__arrow');
  const count = $('[data-count]');
  let current = 0;
  let swipeTimer;

  const panelLeft = (i) => rail.scrollLeft + panels[i].getBoundingClientRect().left
    - rail.getBoundingClientRect().left - parseFloat(getComputedStyle(rail).paddingLeft);

  const showPosition = () => {
    count.textContent = current + 1;
    arrows[0].disabled = current === 0;
    arrows[1].disabled = current === panels.length - 1;
  };

  arrows.forEach(btn => btn.addEventListener('click', () => {
    current = Math.min(panels.length - 1, Math.max(0, current + Number(btn.dataset.dir)));
    showPosition();
    rail.scrollTo({ left: panelLeft(current), behavior: reduced ? 'auto' : 'smooth' });
  }));

  rail.addEventListener('scroll', () => {
    clearTimeout(swipeTimer);
    swipeTimer = setTimeout(() => {
      const atEnd = rail.scrollLeft >= rail.scrollWidth - rail.clientWidth - 2;
      const distance = panels.map((_, i) => Math.abs(panelLeft(i) - rail.scrollLeft));
      current = atEnd ? panels.length - 1 : distance.indexOf(Math.min(...distance));
      showPosition();
    }, 140);
  }, { passive: true });

  /* ------------------------------------------------------------------
     Enquiry form
     ------------------------------------------------------------------ */
  const form = $('#enquiryForm');
  const status = $('#formStatus');
  const submit = $('button[type="submit"]', form);
  const group = $('[data-required-group]', form);

  /* No enquiries for dates already gone */
  const now = new Date();
  $('#f-date').min = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);

  const setError = (field, message) => {
    field.classList.toggle('is-invalid', Boolean(message));
    const slot = $('.field__error', field);
    if (slot) slot.textContent = message || '';
  };

  const validate = () => {
    let first = null;
    const fail = (field, message, el) => { setError(field, message); if (!first) first = el; };

    if ($('input:checked', group)) setError(group, '');
    else fail(group, 'Please choose a package', $('input', group));

    $$('.field:not([data-required-group])', form).forEach(field => {
      const input = $('input', field);
      const value = input.value.trim();
      let message = '';
      if (input.required && !value) message = 'This one is needed';
      else if (input.type === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) message = 'That email does not look right';
      else if (input.type === 'date' && value && value < input.min) message = 'Please choose a date from today onwards';
      else if (input.id === 'f-adults' && value && Number($('#f-adults').value) + Number($('#f-children').value) < 1) message = 'Please add at least one guest';
      if (message) fail(field, message, input); else setError(field, '');
    });

    if (first) first.focus({ preventScroll: true });
    if (first) first.closest('.field').scrollIntoView({ block: 'center', behavior: reduced ? 'auto' : 'smooth' });
    return !first;
  };

  const clearOnEdit = (e) => {
    const field = e.target.closest('.field');
    if (field && field.classList.contains('is-invalid')) setError(field, '');
  };
  form.addEventListener('input', clearOnEdit);
  form.addEventListener('change', clearOnEdit);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    status.className = 'form__status';
    if (!validate()) return;

    submit.disabled = true;
    const done = (ok, message) => {
      submit.disabled = false;
      status.className = 'form__status ' + (ok ? 'is-ok' : 'is-err');
      status.textContent = message;
      status.scrollIntoView({ block: 'nearest', behavior: reduced ? 'auto' : 'smooth' });
      if (ok) form.reset();
    };

    const thanks = 'Thank you! Our team will respond with availability, package information and pricing.';
    if (!FORM_ENDPOINT) {
      done(true, thanks + ' (Preview only: no inbox is connected yet, so nothing was sent.)');
      return;
    }
    try {
      const res = await fetch(FORM_ENDPOINT, { method: 'POST', headers: { Accept: 'application/json' }, body: new FormData(form) });
      if (!res.ok) throw new Error(res.status);
      done(true, thanks);
    } catch (err) {
      done(false, 'Something went wrong sending that. Please call us on 073 609 2670 and we will sort it out.');
    }
  });

  /* ==================================================================
     MOTION: only when the user allows it and GSAP has loaded.
     Same vocabulary as the main site. Each element gets one animation.
     ================================================================== */
  if (reduced || !window.gsap || !window.ScrollTrigger) return;

  gsap.registerPlugin(ScrollTrigger);
  if (window.SplitText) gsap.registerPlugin(SplitText);
  gsap.defaults({ ease: 'power3.out', duration: 1 });
  ScrollTrigger.config({ ignoreMobileResize: true });

  /* Hero load */
  $$('.hero__line').forEach(l => { l.innerHTML = `<span class="hero__line-in">${l.innerHTML}</span>`; });
  gsap.timeline()
    .fromTo('.hero__img', { scale: 1.1 }, { scale: 1, duration: 2.4, ease: 'power2.out' }, 0)
    .from('.hero__kicker', { y: 18, opacity: 0, duration: .8 }, .3)
    .from('.hero__line-in', { yPercent: 110, duration: 1.1, stagger: .12, ease: 'power4.out' }, .4)
    .from('.hero__sub', { y: 18, opacity: 0, duration: .8 }, .8)
    .from('.hero .btn', { y: 18, opacity: 0, duration: .7 }, .95);

  gsap.to('.hero__img', {
    yPercent: 10, ease: 'none',
    scrollTrigger: { trigger: '#top', start: 'top top', end: 'bottom top', scrub: true }
  });

  /* Scroll reveals */
  $$('[data-reveal]').forEach(el => {
    gsap.from(el, { y: 36, opacity: 0, duration: 1.05, scrollTrigger: { trigger: el, start: 'top 90%', once: true } });
  });
  $$('[data-reveal-group]').forEach(group => {
    gsap.from(group.children, {
      y: 36, opacity: 0, duration: 1, stagger: .1,
      clearProps: 'transform,opacity',
      scrollTrigger: { trigger: group, start: 'top 88%', once: true }
    });
  });

  /* Headings rise line by line. Split after the fonts land, or the line
     breaks are measured against the fallback font. */
  const revealLines = (el) => {
    if (!window.SplitText) {
      gsap.from(el, { y: 36, opacity: 0, scrollTrigger: { trigger: el, start: 'top 90%', once: true } });
      return;
    }
    const split = new SplitText(el, { type: 'lines', mask: 'lines', linesClass: 'sline' });
    gsap.from(split.lines, {
      yPercent: 118, duration: 1.05, ease: 'power4.out', stagger: .085,
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      onComplete: () => split.revert()
    });
  };
  const settle = () => { $$('[data-reveal-lines]').forEach(revealLines); ScrollTrigger.refresh(); };
  if (document.fonts?.ready) document.fonts.ready.then(settle); else settle();
  window.addEventListener('load', () => ScrollTrigger.refresh());

  /* Re-measure when the page changes height (late images, form messages),
     so trigger points never go stale and leave content unrevealed. */
  let lastHeight = document.documentElement.scrollHeight;
  let refreshTimer;
  const checkHeight = () => {
    const h = document.documentElement.scrollHeight;
    if (Math.abs(h - lastHeight) < 2) return;
    lastHeight = h;
    clearTimeout(refreshTimer);
    refreshTimer = setTimeout(() => ScrollTrigger.refresh(), 150);
  };
  if ('ResizeObserver' in window) new ResizeObserver(checkHeight).observe(document.body);
  document.addEventListener('load', (e) => { if (e.target.tagName === 'IMG') checkHeight(); }, true);
  document.addEventListener('click', () => setTimeout(checkHeight, 400), true);
})();
