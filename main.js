(function () {
  'use strict';

  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';

  /* ---------- Data (Google Scholar + ORCID, Oct 2026) ---------- */
  var citationsByYear = [
    [2018, 1], [2019, 3], [2020, 1], [2021, 3], [2022, 3],
    [2023, 4], [2024, 3], [2025, 10], [2026, 9]
  ];

  var pubs = [
    { y: 2026, type: 'journal', title: 'Phytoextract-loaded bioinspired PLGA nanofibrous scaffold promotes diabetic wound healing via anti-inflammatory and antioxidant effects in in vitro and in vivo experimental models', authors: 'G Sahu, M Maurya, S Sharma, VK Kushwaha, A Mukerjee, B Mishra', venue: 'Journal of Molecular Histology 57 (5)' },
    { y: 2026, type: 'review', title: 'Polycystic Ovary Syndrome: An insight into pathophysiology, current management, and emerging therapeutic approaches', authors: 'G Sahu, AK Goyal', venue: 'Current Opinion in Pharmacology' },
    { y: 2026, type: 'journal', title: 'Geographic and botanical determinants of propolis: variability in chemical constituents and antimicrobial effects', authors: 'M Maurya, G Sahu, MS Hussain, A Islam, B Bhattacharjee, SB Mishra, et al.', venue: 'Plant Biosystems 160 (3)', cites: 3, doi: '10.1007/s44473-026-00125-5' },
    { y: 2026, type: 'chapter', title: 'Recent advances in bioinspired polymeric nanofiber for the treatment of inflammatory diseases', authors: 'G Sahu, M Maurya, H Pandey, SB Mishra', venue: 'Nanofiber Therapeutics, Elsevier', doi: '10.1016/b978-0-443-27745-0.00011-9' },
    { y: 2026, type: 'chapter', title: 'Flavonoids: sources, extraction, purification and characterization', authors: 'G Sahu', venue: 'The Potential Role of Flavonoids in Mitigating Inflammatory Disorders' },
    { y: 2025, type: 'journal', title: 'Praecitrullus fistulosus fruit extract ameliorates type II diabetic complications in rats: in silico, in vitro, and in vivo investigation', authors: 'SB Mishra, J Verma, G Sahu, N Gupta', venue: 'Sciences of Pharmacy 4 (1)', cites: 6, doi: '10.58920/sciphar0401291' },
    { y: 2025, type: 'review', title: 'Efficacy of current therapeutic interventions in diabetic wound healing', authors: 'G Sahu, M Maurya, SB Mishra', venue: 'Diabetes Technology and Obesity Medicine 1 (1)', doi: '10.1089/dtom.2024.0007' },
    { y: 2025, type: 'chapter', title: 'The interaction of dietary polyphenols with drug metabolism and disposition', authors: 'G Sahu, M Maurya, R Tiwari, SB Mishra', venue: 'Dietary Polyphenols for Infectious Diseases' },
    { y: 2025, type: 'chapter', title: 'Probiotics and their potential effects on cancer management', authors: 'G Sahu, A Mukerjee, S Ashique, H Sharma', venue: 'The Role of Probiotics in Cancer Management, Apple Academic Press' },
    { y: 2024, type: 'chapter', title: 'Medicinal and nutritional importance of Centella asiatica in human health', authors: 'G Sahu, P Goswami, T Taj, R Pal, S Ashique, M Bhowmick, P Bhowmick, et al.', venue: 'Medicinal Plants and their Bioactive Compounds in Human Health, Springer', cites: 2, doi: '10.1007/978-981-97-6895-0_12' },
    { y: 2024, type: 'review', title: 'An insight to novel corona virus — pathogenesis, replication and effects on children, cancer, diabetic patients and on pregnant women', authors: 'S Ashique, T Khatun, N Sandhu, V Mittal, A Upadhyay, G Sahu', venue: 'Authorea (preprint)', doi: '10.22541/au.170666395.58585711/v1' },
    { y: 2023, type: 'chapter', title: 'Standards and labeling of ghee and ghee-derived products', authors: 'C Bharti, G Sahu, S Gohri, A Waziri, MS Alam', venue: 'Ghee: Chemistry, Technology, and Health Aspects, CRC Press', cites: 1, doi: '10.1201/9781003228608-2' },
    { y: 2022, type: 'review', title: '‘Convalescent Plasma’ — an effective treatment option to prevent emerging nCOVID-19: a review', authors: 'S Ashique, T Khatun, G Sahu, A Upadhyay, A Adhana, S Kumar, et al.', venue: 'Infectious Disorders – Drug Targets 22 (8)', cites: 3, doi: '10.2174/1871526522666220425103031' },
    { y: 2018, type: 'review', title: 'Role of herbal drugs on neurotransmitters for treating various CNS disorders: a review', authors: 'T Dubey, G Sahu, S Kumari, BS Yadav, AN Sahu', venue: 'Indian Journal of Traditional Knowledge 17 (1)', cites: 20 }
  ];
  var typeLabel = { journal: 'Research article', review: 'Review', chapter: 'Book chapter' };

  /* ---------- Theme ---------- */
  function setTheme(t) {
    root.setAttribute('data-theme', t);
    try { localStorage.setItem('theme', t); } catch (e) {}
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', t === 'dark' ? '#0b0c10' : '#f3f3f1');
  }
  document.querySelector('.theme-toggle').addEventListener('click', function () {
    setTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
  });
  setTheme(root.getAttribute('data-theme') || 'light');

  /* ---------- Mobile menu ---------- */
  var menuBtn = document.querySelector('.menu-btn');
  function closeMenu() {
    document.body.classList.remove('menu-open');
    menuBtn.setAttribute('aria-expanded', 'false');
    if (lenis) lenis.start();
  }
  menuBtn.addEventListener('click', function () {
    var open = document.body.classList.toggle('menu-open');
    menuBtn.setAttribute('aria-expanded', String(open));
    if (lenis) open ? lenis.stop() : lenis.start();
  });
  document.querySelectorAll('.menu__links a').forEach(function (a) { a.addEventListener('click', closeMenu); });

  document.getElementById('year').textContent = new Date().getFullYear();

  /* ---------- Chart ---------- */
  var bars = document.getElementById('chartBars');
  var max = Math.max.apply(null, citationsByYear.map(function (d) { return d[1]; }));
  citationsByYear.forEach(function (d) {
    var el = document.createElement('div');
    el.className = 'bar';
    el.innerHTML = '<div class="bar__fill" style="height:' + Math.max(6, (d[1] / max) * 88) + '%"><b>' + d[1] + '</b></div><small>’' + String(d[0]).slice(2) + '</small>';
    bars.appendChild(el);
  });

  /* ---------- Publications ---------- */
  var list = document.getElementById('pubList');
  function esc(s) { return s.replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  pubs.forEach(function (p) {
    var href = p.doi ? 'https://doi.org/' + p.doi : 'https://scholar.google.com/scholar?q=' + encodeURIComponent(p.title);
    var li = document.createElement('li');
    li.className = 'pub';
    li.dataset.type = p.type;
    li.innerHTML =
      '<a href="' + href + '" target="_blank" rel="noopener">' +
        '<span class="pub__year">' + p.y + '</span>' +
        '<div class="pub__main"><h3 class="pub__title">' + esc(p.title) + '</h3>' +
        '<p class="pub__authors">' + esc(p.authors).replace(/\bG Sahu\b/, '<b>G Sahu</b>') + '</p></div>' +
        '<div class="pub__venue"><span class="pub__type">' + typeLabel[p.type] + '</span><br>' + esc(p.venue) + '</div>' +
        '<span class="pub__cites">' + (p.cites ? p.cites + ' <span>cited</span>' : '<span>—</span>') + '</span>' +
        '<span class="pub__arrow" aria-hidden="true">↗</span>' +
      '</a>';
    list.appendChild(li);
  });

  var filters = document.querySelectorAll('.filter');
  filters.forEach(function (f) {
    var type = f.dataset.filter;
    f.querySelector('sup').textContent = type === 'all' ? pubs.length : pubs.filter(function (p) { return p.type === type; }).length;
    f.addEventListener('click', function () {
      filters.forEach(function (x) { x.classList.toggle('is-active', x === f); x.setAttribute('aria-selected', String(x === f)); });
      var shown = [];
      list.querySelectorAll('.pub').forEach(function (li) {
        var on = type === 'all' || li.dataset.type === type;
        li.classList.toggle('is-hidden', !on);
        if (on) shown.push(li);
      });
      if (hasGsap && !reduceMotion) {
        gsap.fromTo(shown, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.04, ease: 'power3.out' });
      }
      if (hasGsap) ScrollTrigger.refresh();
    });
  });

  /* ---------- Fallback without GSAP ---------- */
  var loader = document.querySelector('.loader');
  if (!hasGsap || reduceMotion) {
    loader.classList.add('is-done');
    document.querySelectorAll('.stat__num').forEach(function (n) { n.textContent = n.dataset.count; });
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  /* ---------- Smooth scroll ---------- */
  var lenis = null;
  if (typeof window.Lenis !== 'undefined') {
    lenis = new Lenis({ duration: 1.15, easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); } });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var id = a.getAttribute('href');
        var target = id === '#top' ? 0 : document.querySelector(id);
        if (target === null) return;
        e.preventDefault();
        lenis.scrollTo(target, { duration: 1.4 });
      });
    });
  }

  /* ---------- Nav hide/show ---------- */
  var nav = document.querySelector('.nav');
  var lastY = 0;
  ScrollTrigger.create({
    start: 0, end: 'max',
    onUpdate: function (self) {
      var y = self.scroll();
      nav.classList.toggle('is-scrolled', y > 40);
      nav.classList.toggle('is-hidden', y > 300 && y > lastY && !document.body.classList.contains('menu-open'));
      lastY = y;
    }
  });
  document.querySelectorAll('section[id]').forEach(function (sec) {
    var link = document.querySelector('.nav__links a[href="#' + sec.id + '"]');
    if (!link) return;
    ScrollTrigger.create({
      trigger: sec, start: 'top 50%', end: 'bottom 50%',
      onToggle: function (self) { link.classList.toggle('is-active', self.isActive); }
    });
  });

  /* ---------- Preloader + hero intro ---------- */
  document.body.classList.add('is-loading');
  gsap.set('.hero__name .line__inner', { yPercent: 110 });
  gsap.set('.reveal-up', { y: 30, opacity: 0 });
  gsap.set('.reveal-fade', { opacity: 0 });
  gsap.set('.nav', { y: -30, opacity: 0 });
  gsap.set('.hero__bg', { scale: 1.25 });

  var counter = { v: 0 };
  var countEl = document.getElementById('loaderCount');
  var intro = gsap.timeline({
    onComplete: function () {
      loader.classList.add('is-done');
      document.body.classList.remove('is-loading');
      ScrollTrigger.refresh();
    }
  });
  intro
    .to(counter, { v: 100, duration: 1.6, ease: 'power2.inOut', onUpdate: function () { countEl.textContent = Math.round(counter.v); } })
    .to('.loader__inner', { opacity: 0, y: -20, duration: 0.4, ease: 'power2.in' })
    .to('.loader__bg', { scaleY: 0, duration: 1, ease: 'expo.inOut' }, '-=0.1')
    .to('.hero__bg', { scale: 1, duration: 1.8, ease: 'expo.out' }, '-=0.7')
    .to('.hero__name .line__inner', { yPercent: 0, duration: 1.4, ease: 'expo.out' }, '<0.1')
    .to('.nav', { y: 0, opacity: 1, duration: 1, ease: 'expo.out' }, '<0.3')
    .to('.reveal-up', { y: 0, opacity: 1, duration: 1, stagger: 0.08, ease: 'expo.out' }, '<0.1')
    .to('.reveal-fade', { opacity: 1, duration: 1 }, '<0.3');

  /* ---------- Hero parallax ---------- */
  var heroTl = gsap.timeline({ scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  heroTl
    .to('.hero__name', { yPercent: -60, ease: 'none' }, 0)
    .to('.hero__intro', { y: -140, opacity: 0, ease: 'none' }, 0)
    .to('.hero__vertical', { y: 120, opacity: 0, ease: 'none' }, 0)
    .to('.hero__bg .blob--mint', { y: 160, ease: 'none' }, 0)
    .to('.hero__bg .blob--violet', { y: -120, x: -60, ease: 'none' }, 0)
    .to('.hero__bg .blob--blue', { scale: 1.3, ease: 'none' }, 0);

  /* Mouse-reactive gradient */
  if (window.matchMedia('(hover: hover)').matches) {
    var qx = gsap.quickTo('.hero__bg .blob--teal', 'x', { duration: 2, ease: 'power3.out' });
    var qy = gsap.quickTo('.hero__bg .blob--teal', 'y', { duration: 2, ease: 'power3.out' });
    var hx = gsap.quickTo('.hero__bg .blob--haze', 'x', { duration: 2.4, ease: 'power3.out' });
    document.querySelector('.hero').addEventListener('mousemove', function (e) {
      var nx = e.clientX / window.innerWidth - 0.5, ny = e.clientY / window.innerHeight - 0.5;
      qx(nx * 140); qy(ny * 100); hx(nx * -120);
    });
  }

  /* ---------- Statement word reveal ---------- */
  document.querySelectorAll('[data-split]').forEach(function (el) {
    var words = el.textContent.trim().split(/\s+/);
    el.innerHTML = words.map(function (w) { return '<span class="w">' + w + '</span>'; }).join(' ');
    gsap.fromTo(el.querySelectorAll('.w'), { opacity: 0.14 }, {
      opacity: 1, stagger: 0.05, ease: 'none',
      scrollTrigger: { trigger: el, start: 'top 80%', end: 'bottom 45%', scrub: true }
    });
  });

  /* ---------- Generic reveals ---------- */
  gsap.utils.toArray('.label, .h2, .about__text, .chart, .filters, .more-link, .contact__sub').forEach(function (el) {
    gsap.from(el, { y: 40, opacity: 0, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 88%' } });
  });
  gsap.from('.stat', { y: 40, opacity: 0, duration: 1, stagger: 0.1, ease: 'expo.out', scrollTrigger: { trigger: '.stats', start: 'top 85%' } });
  gsap.from('.pub', { y: 30, opacity: 0, duration: 0.9, stagger: 0.05, ease: 'expo.out', scrollTrigger: { trigger: '.pub-list', start: 'top 85%' } });
  gsap.from('.contact__title .line__inner', { yPercent: 110, duration: 1.3, stagger: 0.12, ease: 'expo.out', scrollTrigger: { trigger: '.contact__title', start: 'top 85%' } });
  gsap.from('.big-link', { y: 30, opacity: 0, duration: 1, stagger: 0.08, ease: 'expo.out', scrollTrigger: { trigger: '.contact__links', start: 'top 90%' } });

  /* Counters */
  document.querySelectorAll('.stat__num').forEach(function (n) {
    var o = { v: 0 };
    gsap.to(o, {
      v: +n.dataset.count, duration: 2, ease: 'power3.out',
      scrollTrigger: { trigger: n, start: 'top 90%' },
      onUpdate: function () { n.textContent = Math.round(o.v); }
    });
  });

  /* Chart bars grow */
  gsap.from('.bar__fill', { scaleY: 0, duration: 1.2, stagger: 0.06, ease: 'expo.out', scrollTrigger: { trigger: '.chart', start: 'top 85%' } });

  /* Marquee skew with scroll velocity */
  var skewTo = gsap.quickTo('.marquee__track', 'skewX', { duration: 0.6, ease: 'power3.out' });
  ScrollTrigger.create({
    trigger: '.marquee', start: 'top bottom', end: 'bottom top',
    onUpdate: function (self) { skewTo(gsap.utils.clamp(-12, 12, self.getVelocity() / -250)); }
  });
  gsap.to('.marquee', { x: -120, ease: 'none', scrollTrigger: { trigger: '.marquee', start: 'top bottom', end: 'bottom top', scrub: true } });

  /* ---------- Research: pinned horizontal slides ---------- */
  var mm = gsap.matchMedia();
  mm.add('(min-width: 861px)', function () {
    var track = document.querySelector('.research__track');
    function dist() { return Math.max(0, track.scrollWidth - window.innerWidth); }
    var tween = gsap.to(track, {
      x: function () { return -dist(); }, ease: 'none',
      scrollTrigger: {
        trigger: '.research', start: 'top top', end: function () { return '+=' + dist(); },
        pin: true, scrub: 1, invalidateOnRefresh: true, anticipatePin: 1
      }
    });
    gsap.utils.toArray('.rcard__art span').forEach(function (s) {
      gsap.fromTo(s, { xPercent: 30 }, {
        xPercent: -30, ease: 'none',
        scrollTrigger: { trigger: s.closest('.rcard'), containerAnimation: tween, start: 'left right', end: 'right left', scrub: true }
      });
    });
    return function () { gsap.set(track, { clearProps: 'transform' }); };
  });
  gsap.from('.rcard', { opacity: 0, scale: 0.94, duration: 1.2, stagger: 0.08, ease: 'expo.out', scrollTrigger: { trigger: '.research__track', start: 'top 90%' } });

  /* ---------- Experience: stacking slides ---------- */
  var cards = gsap.utils.toArray('.exp__card');
  cards.forEach(function (card, i) {
    card.style.setProperty('--i', i);
    if (i === cards.length - 1) return;
    gsap.to(card, {
      scale: 0.9 + i * 0.02, opacity: 0.5, ease: 'none',
      scrollTrigger: { trigger: cards[i + 1], start: 'top bottom', end: 'top ' + (96 + (i + 1) * 26) + 'px', scrub: true }
    });
  });
  gsap.utils.toArray('.exp__art').forEach(function (a) {
    gsap.fromTo(a, { scale: 1.08 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: a, start: 'top bottom', end: 'bottom top', scrub: true } });
  });

  /* Contact gradient parallax */
  gsap.to('.contact__bg .blob--violet', { y: 160, ease: 'none', scrollTrigger: { trigger: '.contact', start: 'top bottom', end: 'bottom top', scrub: true } });
  gsap.to('.contact__bg .blob--mint', { y: -140, ease: 'none', scrollTrigger: { trigger: '.contact', start: 'top bottom', end: 'bottom top', scrub: true } });

  /* ---------- Cursor + magnetic ---------- */
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    var cursor = document.querySelector('.cursor');
    var cx = gsap.quickTo(cursor, 'x', { duration: 0.5, ease: 'power3.out' });
    var cy = gsap.quickTo(cursor, 'y', { duration: 0.5, ease: 'power3.out' });
    window.addEventListener('mousemove', function (e) { cx(e.clientX); cy(e.clientY); });
    var label = cursor.querySelector('.cursor__label');
    function bindCursor(sel, text) {
      document.querySelectorAll(sel).forEach(function (el) {
        el.addEventListener('mouseenter', function () { label.textContent = text; gsap.to(cursor, { scale: 1, opacity: 1, duration: 0.4, ease: 'expo.out' }); });
        el.addEventListener('mouseleave', function () { gsap.to(cursor, { scale: 0, opacity: 0, duration: 0.3 }); });
      });
    }
    bindCursor('.pub a', 'Read ↗');
    bindCursor('.rcard', 'Scroll ↓');

    document.querySelectorAll('.magnetic').forEach(function (el) {
      var mx = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'elastic.out(1, 0.4)' });
      var my = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'elastic.out(1, 0.4)' });
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        mx((e.clientX - r.left - r.width / 2) * 0.35);
        my((e.clientY - r.top - r.height / 2) * 0.35);
      });
      el.addEventListener('mouseleave', function () { mx(0); my(0); });
    });
  }

  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
