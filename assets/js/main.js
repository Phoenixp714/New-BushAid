// BushAid landing page: shop links, tracking, buy bar, and scroll animations.
(function () {
  'use strict';

  var SHOP_URL = 'https://c0qvns-0y.myshopify.com/products/bushaid-gut-skin-axis-support-capsules';
  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ── Shop links: carry the ad's UTM / click IDs through to Shopify so Meta
  //    attribution survives the hop from this page to the store.
  var incoming = new URLSearchParams(location.search);
  var forward = new URLSearchParams();
  incoming.forEach(function (v, k) {
    if (/^utm_|^(fbclid|gclid|ttclid)$/.test(k)) forward.set(k, v);
  });
  var qs = forward.toString();
  var shopHref = SHOP_URL + (qs ? '?' + qs : '');
  document.querySelectorAll('[data-shop]').forEach(function (a) { a.href = shopHref; });

  // ── Tracking
  function track(name, data) {
    try { if (window.fbq) window.fbq('trackCustom', name, data); } catch (e) {}
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-shop], [data-track]');
    if (!a) return;
    if (a.hasAttribute('data-shop')) {
      track('ShopClick', {
        placement: a.getAttribute('data-shop'),
        value: parseFloat(a.getAttribute('data-value')) || undefined,
        currency: 'USD',
      });
    } else {
      track('CTAClick', { placement: a.getAttribute('data-track') });
    }
  });

  // ── Mobile buy bar: show once the hero button is off-screen, hide while the
  //    pricing section or footer is visible.
  var bar = document.querySelector('.buybar');
  var heroCta = document.querySelector('.hero-cta');
  var offer = document.getElementById('shop');
  var footer = document.querySelector('.footer');
  if (bar && heroCta && 'IntersectionObserver' in window) {
    var state = { hero: true, offer: false, footer: false };
    var barLink = bar.querySelector('a');
    var update = function () {
      var show = !state.hero && !state.offer && !state.footer;
      bar.classList.toggle('is-visible', show);
      bar.setAttribute('aria-hidden', show ? 'false' : 'true');
      barLink.tabIndex = show ? 0 : -1;
    };
    var watch = function (el, key) {
      new IntersectionObserver(function (entries) {
        state[key] = entries[0].isIntersecting;
        update();
      }).observe(el);
    };
    watch(heroCta, 'hero');
    watch(offer, 'offer');
    watch(footer, 'footer');
  }

  // ── Animations (GSAP + ScrollTrigger). Everything below is optional polish:
  //    if the libraries fail to load, the page is fully readable as-is.
  var gsap = window.gsap, ScrollTrigger = window.ScrollTrigger;
  window.__animReady = true;
  if (!gsap || !ScrollTrigger || reduceMotion) {
    root.classList.remove('anim');
    return;
  }
  gsap.registerPlugin(ScrollTrigger);

  // Hero intro
  gsap.to('[data-hero]', { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.07 });

  // Section reveals
  ScrollTrigger.batch('[data-reveal]', {
    start: 'top 88%',
    once: true,
    onEnter: function (batch) {
      gsap.to(batch, { opacity: 1, y: 0, duration: 1, ease: 'power3.out', stagger: 0.12, overwrite: true });
    },
  });

  // Gentle image parallax
  gsap.utils.toArray('[data-parallax]').forEach(function (img) {
    gsap.fromTo(img, { yPercent: 0 }, {
      yPercent: -12, ease: 'none',
      scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true },
    });
  });

  // 1930: count backwards from today as the section scrolls in
  var yearEl = document.querySelector('[data-year]');
  if (yearEl) {
    var now = new Date().getFullYear();
    var yr = { v: now };
    yearEl.textContent = now;
    gsap.to(yr, {
      v: 1930, ease: 'power2.inOut',
      scrollTrigger: { trigger: '.year', start: 'top 75%', end: 'center 45%', scrub: 0.6 },
      onUpdate: function () { yearEl.textContent = Math.round(yr.v); },
    });
  }

  // Timeline line fills as you read
  var tl = document.querySelector('[data-timeline]');
  if (tl) {
    tl.style.setProperty('--tl', 0);
    gsap.to(tl, {
      '--tl': 1, ease: 'none',
      scrollTrigger: { trigger: tl, start: 'top 70%', end: 'bottom 60%', scrub: true },
    });
  }

  // Comparison checkmarks pop in
  gsap.from('.compare .yes, .compare .no', {
    scale: 0, duration: 0.5, ease: 'back.out(2.2)', stagger: 0.07,
    scrollTrigger: { trigger: '.compare', start: 'top 75%', once: true },
  });

  // Inside: sticky stage, bottle turns (bottle.js) while ingredients step through
  var inside = document.querySelector('.inside');
  var cards = gsap.utils.toArray('.ing');
  var dots = gsap.utils.toArray('.ing-dots span');
  if (inside && cards.length) {
    root.classList.add('scrolly');
    var active = -1;
    var setActive = function (i) {
      if (i === active) return;
      active = i;
      cards.forEach(function (c, n) { c.classList.toggle('is-active', n === i); });
      dots.forEach(function (d, n) { d.classList.toggle('is-active', n === i); });
    };
    setActive(0);
    ScrollTrigger.create({
      trigger: inside, start: 'top top', end: 'bottom bottom',
      onUpdate: function (self) {
        setActive(Math.min(cards.length - 1, Math.floor(self.progress * cards.length)));
      },
    });
  }

  // Re-measure trigger positions once web fonts and images have settled, since
  // late font swaps reflow the text and shift every section below.
  ScrollTrigger.refresh();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
