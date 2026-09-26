// BushAid landing page: shop links, tracking, buy bar, and scroll animations.
(function () {
  'use strict';

  // ── Store settings ───────────────────────────────────────────────────────
  //  VARIANT_ID: the product's Shopify variant ID. With it, buy buttons go
  //  straight to checkout holding 1, 2 or 3 bottles.
  //  BUNDLE_CODES: the bundle app (AOV.ai) only discounts orders made through its
  //  own widget, so multi-bottle checkout links need a Shopify discount code that
  //  matches the bundle price. Until a code is filled in for a quantity, that
  //  button opens the product page instead, where the bundle app applies savings.
  var SHOP = {
    store: 'https://c0qvns-0y.myshopify.com',
    product: '/products/bushaid-gut-skin-axis-support-capsules',
    VARIANT_ID: '43851217403971',
    BUNDLE_CODES: { 2: 'BUNDLE2', 3: 'BUNDLE3' },
  };
  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ── Shop links: carry the ad's UTM / click IDs through to Shopify so Meta
  //    attribution survives the hop from this page to the store.
  var incoming = new URLSearchParams(location.search);
  var forward = new URLSearchParams();
  incoming.forEach(function (v, k) {
    if (/^utm_|^(fbclid|gclid|ttclid)$/.test(k)) forward.set(k, v);
  });
  function withQuery(url, extra) {
    var q = new URLSearchParams(forward);
    if (extra) Object.keys(extra).forEach(function (k) { q.set(k, extra[k]); });
    var str = q.toString();
    return url + (str ? '?' + str : '');
  }
  function shopLink(qty) {
    var code = SHOP.BUNDLE_CODES[qty];
    if (SHOP.VARIANT_ID && (qty === 1 || (qty > 1 && code))) {
      // Shopify cart permalink: replaces the cart with this bundle and opens
      // checkout, applying the bundle's discount code when there is one
      return withQuery(SHOP.store + '/cart/' + SHOP.VARIANT_ID + ':' + qty, code ? { discount: code } : null);
    }
    return withQuery(SHOP.store + SHOP.product);
  }
  function setShopLink(a) { a.href = shopLink(parseInt(a.getAttribute('data-qty'), 10) || 0); }
  document.querySelectorAll('[data-shop]').forEach(setShopLink);

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

  // ── Ingredient cards: flip to the research and back
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('.ing-flip');
    if (!btn) return;
    var card = btn.closest('.ing');
    var flipped = !card.classList.contains('is-flipped');
    setFlip(card, flipped);
    var face = card.querySelector(flipped ? '.ing-back .ing-flip' : '.ing-front .ing-flip');
    if (face) setTimeout(function () { face.focus({ preventScroll: true }); }, 350);
    if (flipped) track('ResearchFlip', { ingredient: card.querySelector('h3').textContent });
  });
  function setFlip(card, on) {
    card.classList.toggle('is-flipped', on);
    var front = card.querySelector('.ing-front'), back = card.querySelector('.ing-back');
    if (back) back.inert = !on;
    if (front) front.inert = on;
  }

  // ── Quiz: one question at a time, then a personal recommendation
  var PLANS = {
    1: { name: '1 Bottle · 60-day supply', price: '$49.99', value: '49.99', days: 60 },
    2: { name: '2 Bottles · 120-day supply', price: '$90.00', value: '90.00', days: 120, note: 'save 10%' },
    3: { name: '3 Bottles · 180-day supply', price: '$127.50', value: '127.50', days: 180, note: 'save 15%' },
  };
  var quiz = document.querySelector('[data-quiz]');
  if (quiz) {
    var steps = [].slice.call(quiz.querySelectorAll('.quiz-q'));
    var count = quiz.querySelector('.quiz-count');
    var qbar = quiz.querySelector('.quiz-bar span');
    var back = quiz.querySelector('.quiz-back');
    var result = quiz.querySelector('.quiz-result');
    var answers = {}, at = 0;
    var show = function (i) {
      at = i;
      steps.forEach(function (st, n) { st.classList.toggle('is-current', n === i); st.hidden = n !== i; });
      result.hidden = i < steps.length;
      quiz.classList.toggle('is-done', i >= steps.length);
      back.hidden = i === 0 || i >= steps.length;
      count.textContent = i < steps.length ? 'Question ' + (i + 1) + ' of ' + steps.length : 'Your result';
      qbar.style.width = (Math.min(i, steps.length) / steps.length * 100) + '%';
    };
    steps.forEach(function (st, n) {
      st.addEventListener('click', function (e) {
        var opt = e.target.closest('.quiz-opt');
        if (!opt) return;
        [].forEach.call(st.querySelectorAll('.quiz-opt'), function (o) { o.classList.toggle('is-picked', o === opt); });
        answers[st.getAttribute('data-key')] = { score: +opt.getAttribute('data-score'), text: opt.textContent, index: [].indexOf.call(opt.parentNode.children, opt) };
        setTimeout(function () {
          if (n + 1 < steps.length) { show(n + 1); focusFirst(steps[n + 1]); }
          else { finish(); }
        }, 260);
      });
    });
    back.addEventListener('click', function () { if (at > 0) { show(at - 1); focusFirst(steps[at]); } });
    quiz.querySelector('.quiz-restart').addEventListener('click', function () {
      answers = {};
      [].forEach.call(quiz.querySelectorAll('.quiz-opt'), function (o) { o.classList.remove('is-picked'); });
      document.querySelectorAll('[data-plan]').forEach(function (pl) { pl.classList.remove('is-recommended'); });
      show(0); focusFirst(steps[0]);
    });
    var focusFirst = function (st) { var b = st.querySelector('.quiz-opt'); if (b) b.focus({ preventScroll: true }); };
    var sc = function (k) { return answers[k] ? answers[k].score : 0; };

    var finish = function () {
      var score = sc('bloat') + sc('skin') + sc('probiotic') + sc('immune');
      var qty = (sc('duration') === 2 || score >= 6) ? 3 : (sc('duration') === 1 || score >= 3) ? 2 : 1;
      var title = score >= 6 ? 'Your answers point strongly to the gut-skin axis'
        : score >= 3 ? 'Your gut and your skin may be connected'
        : 'Your gut and skin seem to be in fairly good shape';
      var reasons = [];
      if (sc('skin') > 0) reasons.push('Your skin flares with stress or diet changes. That\'s the pattern Stokes & Pillsbury described in 1930. Zinc, vitamin C and hyaluronic acid support the skin side of the axis.');
      if (sc('bloat') > 0) reasons.push('You mentioned bloating after meals. The 5-billion-CFU probiotic blend and prebiotic inulin work on the gut side.');
      if (answers.probiotic && answers.probiotic.index === 2) reasons.push('Your probiotic helped your digestion but not your skin. A digestion-only formula was never built to reach your skin. That gap is why BushAid exists.');
      else if (answers.probiotic && answers.probiotic.index === 1) reasons.push('Your last probiotic didn\'t do much. Most are built for digestion alone, with no zinc or skin support.');
      if (sc('immune') > 0) reasons.push('You get run down more than you\'d like. Zinc and vitamin C also support normal immune function.');
      if (!reasons.length) reasons.push('No big warning signs. If you\'d like to support what\'s already working, one bottle is a gentle place to start.');

      var plan = PLANS[qty];
      quiz.querySelector('.quiz-result-title').textContent = title;
      var ul = quiz.querySelector('.quiz-reasons');
      ul.innerHTML = '';
      reasons.slice(0, 3).forEach(function (r) { var li = document.createElement('li'); li.textContent = r; ul.appendChild(li); });
      quiz.querySelector('.quiz-rec-name').textContent = plan.name + ' — ' + plan.price + (plan.note ? ' (' + plan.note + ')' : '');
      quiz.querySelector('.quiz-rec-why').textContent = qty === 1
        ? 'Enough for a full 60 days, the time skin needs to show real change.'
        : 'Skin renews itself over several weeks, and more slowly with age. ' + plan.days + ' days gives your gut and skin a fair chance to change.';
      var img = quiz.querySelector('.quiz-rec-img');
      img.className = 'quiz-rec-img plan-img plan-img-' + qty;
      img.innerHTML = new Array(qty + 1).join('<img src="assets/img/bottle.webp" width="480" height="860" alt="">');
      var cta = quiz.querySelector('.quiz-rec-cta');
      cta.setAttribute('data-qty', qty);
      cta.setAttribute('data-value', plan.value);
      cta.textContent = 'Get ' + (qty === 1 ? '1 bottle' : qty + ' bottles') + ' — ' + plan.price;
      setShopLink(cta);
      document.querySelectorAll('[data-plan]').forEach(function (pl, i) { pl.classList.toggle('is-recommended', i + 1 === qty); });
      show(steps.length);
      result.focus({ preventScroll: true });
      track('QuizComplete', { score: score, recommended: qty });
    };
    show(0);
  }

  // ── Gut-skin axis diagram: the path draws with scroll, particles travel it
  var axis = (function () {
    var fig = document.querySelector('[data-axis]');
    if (!fig) return null;
    var path = fig.querySelector('.axis-path'), glow = fig.querySelector('.axis-path-glow');
    var len = path.getTotalLength();
    var markers = [].slice.call(fig.querySelectorAll('.axis-marker'));
    var stepsEl = [].slice.call(fig.querySelectorAll('.axis-steps li'));
    var thresholds = markers.map(function (m) { return parseFloat(m.getAttribute('data-at')); });
    markers.forEach(function (m, i) {
      var pt = path.getPointAtLength(len * thresholds[i]);
      m.setAttribute('transform', 'translate(' + pt.x.toFixed(1) + ' ' + pt.y.toFixed(1) + ')');
    });
    var drawn = 1;
    function set(p) {
      drawn = p;
      var off = (len * (1 - p)).toFixed(1);
      [path, glow].forEach(function (el) { el.style.strokeDasharray = len; el.style.strokeDashoffset = off; });
      var on = 0;
      thresholds.forEach(function (t, i) {
        var lit = p >= t - 0.001;
        if (lit) on = i + 1;
        markers[i].classList.toggle('is-on', lit);
        stepsEl[i].classList.toggle('is-on', lit);
      });
      fig.classList.toggle('is-flared', on === markers.length);
    }
    // Particles: only while the figure is on screen, and never with reduced motion
    var g = fig.querySelector('.axis-particles'), dots = [], N = 9, running = false, visibleNow = false;
    if (!reduceMotion) {
      for (var i = 0; i < N; i++) {
        var c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        c.setAttribute('r', i % 3 ? 2.6 : 3.6);
        g.appendChild(c); dots.push(c);
      }
      var loop = function (now) {
        if (!visibleNow) { running = false; return; }
        dots.forEach(function (d, i) {
          var ph = (now / 3200 + i / N) % 1;
          var along = ph * drawn;
          var pt = path.getPointAtLength(len * along);
          d.setAttribute('cx', pt.x.toFixed(1)); d.setAttribute('cy', pt.y.toFixed(1));
          d.style.opacity = drawn < 0.03 ? 0 : Math.min(1, ph * 6, (1 - ph) * 6).toFixed(2);
        });
        requestAnimationFrame(loop);
      };
      new IntersectionObserver(function (en) {
        visibleNow = en[0].isIntersecting;
        if (visibleNow && !running) { running = true; requestAnimationFrame(loop); }
      }).observe(fig);
    }
    set(1);
    return { set: set, fig: fig };
  })();

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

  // Section reveals: on every scroll update, fade in anything whose top has
  // reached 88% of the viewport. Checking positions (not enter events) means a
  // fast fling or a jump link can never leave content stuck invisible.
  var pending = gsap.utils.toArray('[data-reveal]');
  var revealCheck = function () {
    if (!pending.length) return;
    var line = window.innerHeight * 0.88, batch = [];
    pending = pending.filter(function (el) {
      if (el.getBoundingClientRect().top < line) { batch.push(el); return false; }
      return true;
    });
    if (batch.length) gsap.to(batch, { opacity: 1, y: 0, duration: 1, ease: 'power3.out', stagger: 0.12, overwrite: true });
  };
  ScrollTrigger.create({ start: 0, end: 'max', onUpdate: revealCheck, onRefresh: revealCheck });
  revealCheck();

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

  // Gut-skin diagram draws itself as the section scrolls by
  if (axis) {
    axis.set(0);
    var mm = gsap.matchMedia();
    mm.add('(min-width: 900px)', function () {
      ScrollTrigger.create({ trigger: axis.fig.closest('.split'), start: 'top 65%', end: 'bottom 75%', scrub: 0.5,
        onUpdate: function (self) { axis.set(self.progress); } });
    });
    mm.add('(max-width: 899px)', function () {
      ScrollTrigger.create({ trigger: axis.fig, start: 'top 75%', end: 'bottom 80%', scrub: 0.5,
        onUpdate: function (self) { axis.set(self.progress); } });
    });
  }

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
      cards.forEach(function (c, n) {
        c.classList.toggle('is-active', n === i);
        if (n !== i && c.classList.contains('is-flipped')) setFlip(c, false);
      });
      dots.forEach(function (d, n) { d.classList.toggle('is-active', n === i); });
    };
    setActive(0);
    // Cards are stacked on top of each other, so the list needs the tallest card's height
    var list = inside.querySelector('.ing-list');
    var fitList = function () {
      var h = 0;
      cards.forEach(function (c) { h = Math.max(h, c.offsetHeight); });
      list.style.minHeight = h + 'px';
    };
    fitList();
    window.addEventListener('resize', fitList);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitList);
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
