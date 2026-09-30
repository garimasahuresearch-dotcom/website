(function () {
  'use strict';

  /* Site assistant: answers only from this website's own content.
     No external AI — intents are matched by keywords, papers by title search. */

  var root = document.querySelector('.chat');
  if (!root) return;
  var data = window.GS_DATA || { pubs: [], citationsByYear: [], typeLabel: {} };
  var pubs = data.pubs;

  var launcher = root.querySelector('.chat__launcher');
  var panel = root.querySelector('.chat__panel');
  var log = root.querySelector('.chat__log');
  var pillsEl = root.querySelector('.chat__pills');
  var form = root.querySelector('.chat__form');
  var input = root.querySelector('.chat__input');
  var closeBtn = root.querySelector('.chat__close');

  var SCHOLAR = 'https://scholar.google.com/citations?user=YL_8bloAAAAJ&hl=en';
  var ORCID = 'https://orcid.org/0000-0001-6913-7273';
  var LINKEDIN = 'https://www.linkedin.com/in/garima-sahu-a16772131';

  var DEFAULT_PILLS = ['Who is Garima?', 'Research areas', 'Latest publications', 'Most cited work', 'Teaching experience', 'How to collaborate'];

  /* ---------- helpers ---------- */
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function link(href, text) { return '<a href="' + href + '" target="_blank" rel="noopener">' + text + '</a>'; }
  function go(id, text) { return '<a href="' + id + '" data-goto>' + text + '</a>'; }
  function pubHref(p) { return p.doi ? 'https://doi.org/' + p.doi : 'https://scholar.google.com/scholar?q=' + encodeURIComponent(p.title); }
  function pubItem(p) {
    return '<li>' + link(pubHref(p), esc(p.title)) + '<small>' + p.y + ' · ' + esc(p.venue) + (p.cites ? ' · ' + p.cites + ' citations' : '') + '</small></li>';
  }
  function pubList(list, max) { return '<ul class="chat__pubs">' + list.slice(0, max || 4).map(pubItem).join('') + '</ul>'; }
  function totalCites() { return data.citationsByYear.reduce(function (a, d) { return a + d[1]; }, 0); }
  function matchPubs(re) { return pubs.filter(function (p) { return re.test(p.title + ' ' + p.venue); }); }

  /* ---------- knowledge ---------- */
  var intents = [
    { id: 'greet', w: 1, keys: ['hi', 'hello', 'hey', 'namaste', 'good morning', 'good evening', 'hii'],
      answer: function () { return 'Hi! I’m the assistant for Garima Sahu’s website. Ask me about her research, publications, teaching or how to get in touch.'; },
      pills: DEFAULT_PILLS },

    { id: 'about', w: 1.2, keys: ['who is garima', 'who is she', 'about garima', 'about her', 'introduce', 'bio', 'background', 'tell me about her', 'garima', 'sahu'],
      answer: function () {
        return '<b>Garima Sahu</b> is an Assistant Professor at the <b>United Institute of Pharmacy, Prayagraj</b>. She works in pharmacognosy and natural products: extracting and characterising plant compounds, and turning them into therapies for diabetes, chronic wounds, inflammation and the nervous system. ' + go('#about', 'Read the About section →');
      },
      pills: ['Research areas', 'Teaching experience', 'Most cited work'] },

    { id: 'research', w: 1, keys: ['research', 'area', 'areas', 'focus', 'interest', 'work on', 'field', 'pharmacognosy', 'natural product', 'specialis', 'specializ', 'topics'],
      answer: function () {
        return 'Her work spans six areas:<ol class="chat__ol"><li>Natural products &amp; pharmacognosy</li><li>Diabetic wound healing (PLGA nanofiber scaffolds)</li><li>Metabolic &amp; endocrine disorders: diabetes, obesity, PCOS</li><li>Herbal neuropharmacology</li><li>Infection, gut &amp; cancer: COVID-19, probiotics</li><li>Food &amp; nutrition science: ghee standards, <i>Centella asiatica</i></li></ol>' + go('#research', 'See the research slides →');
      },
      pills: ['Diabetic wound healing', 'Latest publications', 'How to collaborate'] },

    { id: 'wound', w: 3, keys: ['wound', 'diabetic', 'diabetes', 'nanofiber', 'nanofibre', 'plga', 'scaffold', 'healing'],
      answer: function () {
        return 'Her recent work loads plant extracts into bioinspired <b>PLGA nanofiber scaffolds</b> that heal diabetic wounds through anti-inflammatory and antioxidant effects, tested in vitro and in vivo. Related papers:' + pubList(matchPubs(/wound|diabet|nanofib/i), 4);
      },
      pills: ['Latest publications', 'Research areas', 'How to collaborate'] },

    { id: 'latest', w: 4, keys: ['latest', 'recent', 'new', 'newest', '2026', 'current work', 'currently'],
      answer: function () {
        var list = pubs.slice().sort(function (a, b) { return b.y - a.y; });
        return 'Her most recent publications:' + pubList(list, 4) + go('#publications', 'All publications →');
      },
      pills: ['Most cited work', 'Book chapters', 'Research areas'] },

    { id: 'cited', w: 3, keys: ['cited', 'citation', 'citations', 'impact', 'h-index', 'h index', 'hindex', 'i10', 'most', 'popular', 'famous', 'best paper', 'top paper'],
      answer: function () {
        var top = pubs.filter(function (p) { return p.cites; }).sort(function (a, b) { return b.cites - a.cites; });
        return 'On Google Scholar she has <b>38 citations</b>, an <b>h-index of 3</b> and an i10-index of 1. Citations have grown fastest in 2025–26. Most cited:' + pubList(top, 3) + link(SCHOLAR, 'Open Google Scholar ↗');
      },
      pills: ['Latest publications', 'Publications count', 'Research areas'] },

    { id: 'pubs', w: 1.5, keys: ['publication', 'publications', 'paper', 'papers', 'article', 'journal', 'published', 'how many', 'count', 'list'],
      answer: function () {
        var n = function (t) { return pubs.filter(function (p) { return p.type === t; }).length; };
        return 'This site lists <b>' + pubs.length + ' selected works</b>: ' + n('journal') + ' research articles, ' + n('review') + ' reviews and ' + n('chapter') + ' book chapters (Google Scholar indexes about 20). ' + go('#publications', 'Browse and filter them →') + ' or ' + link(SCHOLAR, 'see the full list on Scholar ↗') + '.';
      },
      pills: ['Latest publications', 'Most cited work', 'Book chapters'] },

    { id: 'chapters', w: 2, keys: ['chapter', 'chapters', 'book', 'books', 'springer', 'elsevier', 'crc', 'publisher', 'apple academic'],
      answer: function () {
        return 'She has written book chapters for Springer, Elsevier, CRC Press and Apple Academic Press, among others:' + pubList(pubs.filter(function (p) { return p.type === 'chapter'; }), 5);
      },
      pills: ['Latest publications', 'Most cited work', 'How to collaborate'] },

    { id: 'teaching', w: 1.5, keys: ['experience', 'teach', 'teaching', 'job', 'work at', 'works at', 'professor', 'college', 'institute', 'united', 'bharat', 'meerut', 'prayagraj', 'career', 'faculty', 'where does'],
      answer: function () {
        return '<ul class="chat__ul"><li><b>2023 – present:</b> Assistant Professor, United Institute of Pharmacy, Prayagraj</li><li><b>2018 – 2023:</b> Assistant Professor, Bharat Institute of Technology, Meerut</li></ul>That’s over 8 years teaching pharmacy, alongside her research and writing. ' + go('#experience', 'See Experience →');
      },
      pills: ['Research areas', 'How to collaborate', 'Contact'] },

    { id: 'education', w: 2, keys: ['education', 'phd', 'ph.d', 'degree', 'qualification', 'qualified', 'm.pharm', 'mpharm', 'b.pharm', 'bpharm', 'studied', 'university'],
      answer: function () {
        return 'Her education details aren’t listed on this website yet, so I can’t answer that reliably. You could ask her directly using the ' + go('#contact', 'contact form') + '.';
      },
      pills: ['Teaching experience', 'Research areas', 'Contact'] },

    { id: 'collab', w: 2, keys: ['collaborate', 'collaboration', 'work with', 'lecture', 'guest', 'student', 'project', 'supervise', 'invite', 'hire', 'consult', 'partner'],
      answer: function () {
        return 'Garima is open to <b>research collaborations, book chapters, guest lectures and student projects</b> in pharmacognosy and natural products. The quickest way is the ' + go('#contact', 'contact form') + '. Pick a topic and leave a short note.';
      },
      pills: ['Contact', 'Research areas', 'Profiles'] },

    { id: 'contact', w: 2, keys: ['contact', 'email', 'mail', 'reach', 'message', 'connect', 'get in touch', 'phone', 'number', 'call', 'whatsapp'],
      answer: function () {
        return 'You can reach her through the ' + go('#contact', 'contact form on this page') + ' or on ' + link(LINKEDIN, 'LinkedIn ↗') + '. The site doesn’t list a public phone number or email address.';
      },
      pills: ['How to collaborate', 'Profiles', 'Who is Garima?'] },

    { id: 'profiles', w: 2.5, keys: ['orcid', 'scholar', 'linkedin', 'profile', 'profiles', 'google scholar', 'social'],
      answer: function () {
        return 'Her profiles:<ul class="chat__ul"><li>' + link(SCHOLAR, 'Google Scholar ↗') + '</li><li>' + link(ORCID, 'ORCID 0000-0001-6913-7273 ↗') + '</li><li>' + link(LINKEDIN, 'LinkedIn ↗') + '</li></ul>';
      },
      pills: ['Most cited work', 'Contact', 'Research areas'] },

    { id: 'thanks', w: 1, keys: ['thanks', 'thank you', 'thx', 'bye', 'great', 'nice', 'cool', 'ok', 'okay', 'shukriya', 'dhanyavad'],
      answer: function () { return 'Happy to help! Anything else about Garima’s work?'; },
      pills: DEFAULT_PILLS }
  ];

  var STOP = /^(what|which|does|about|with|from|have|has|her|she|the|and|for|are|any|your|this|that|tell|show|give|list|papers?|work|works|research|study|studies|some|more|into|like)$/;

  function normalise(q) { return (' ' + q.toLowerCase().replace(/[^a-z0-9\s\-\.]/g, ' ').replace(/\s+/g, ' ') + ' '); }

  function score(intent, q) {
    var s = 0;
    intent.keys.forEach(function (k) {
      var hit = k.length <= 3 ? q.indexOf(' ' + k + ' ') !== -1 : q.indexOf(k) !== -1;
      if (hit) s += k.length;
    });
    return s * intent.w;
  }

  function topicSearch(q) {
    var words = q.trim().split(' ').filter(function (w) { return w.length >= 4 && !STOP.test(w); });
    if (!words.length) return [];
    return pubs.map(function (p) {
      var hay = (p.title + ' ' + p.venue).toLowerCase();
      var s = words.reduce(function (a, w) { return a + (hay.indexOf(w.replace(/s$/, '')) !== -1 ? 1 : 0); }, 0);
      return { p: p, s: s };
    }).filter(function (x) { return x.s > 0; }).sort(function (a, b) { return b.s - a.s || b.p.y - a.p.y; }).map(function (x) { return x.p; });
  }

  function respond(raw) {
    var q = normalise(raw);
    var best = null, bestScore = 0;
    intents.forEach(function (it) { var s = score(it, q); if (s > bestScore) { best = it; bestScore = s; } });

    var found = topicSearch(q);
    // A specific paper topic beats a weak generic intent ("papers on propolis").
    if (found.length && (!best || bestScore < 12 || best.id === 'pubs' || best.id === 'research' || best.id === 'about')) {
      return { html: 'Here’s what I found on this site about that:' + pubList(found, 4), pills: ['Latest publications', 'Research areas', 'How to collaborate'] };
    }
    if (best) return { html: best.answer(), pills: best.pills };
    return {
      html: 'I can only answer questions about Garima Sahu and what’s on this website: her research, publications, teaching and how to contact her. Try one of these:',
      pills: DEFAULT_PILLS
    };
  }

  /* ---------- UI ---------- */
  function scrollLog() { log.scrollTop = log.scrollHeight; }

  function addMsg(who, html) {
    var el = document.createElement('div');
    el.className = 'msg msg--' + who;
    if (who === 'user') el.textContent = html; else el.innerHTML = html;
    log.appendChild(el);
    scrollLog();
    return el;
  }

  function setPills(list) {
    pillsEl.innerHTML = '';
    list.forEach(function (t) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'chat__pill'; b.textContent = t;
      b.addEventListener('click', function () { ask(t); });
      pillsEl.appendChild(b);
    });
  }

  var busy = false;
  function ask(text) {
    text = text.trim();
    if (!text || busy) return;
    busy = true;
    addMsg('user', text);
    input.value = '';
    pillsEl.innerHTML = '';
    var typing = addMsg('bot', '<span class="typing"><i></i><i></i><i></i></span>');
    setTimeout(function () {
      var r = respond(text);
      typing.innerHTML = r.html;
      setPills(r.pills || DEFAULT_PILLS);
      scrollLog();
      busy = false;
    }, 450 + Math.random() * 350);
  }

  var started = false;
  function open() {
    panel.hidden = false;
    root.classList.add('is-open');
    launcher.setAttribute('aria-expanded', 'true');
    if (!started) {
      started = true;
      addMsg('bot', 'Hi! 👋 I can tell you about <b>Garima Sahu</b>: her research, publications, teaching and how to reach her. What would you like to know?');
      setPills(DEFAULT_PILLS);
    }
    setTimeout(function () { if (window.matchMedia('(hover: hover)').matches) input.focus(); }, 250);
  }
  function close() {
    root.classList.remove('is-open');
    launcher.setAttribute('aria-expanded', 'false');
    setTimeout(function () { if (!root.classList.contains('is-open')) panel.hidden = true; }, 350);
  }

  launcher.addEventListener('click', function () { root.classList.contains('is-open') ? close() : open(); });
  closeBtn.addEventListener('click', close);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && root.classList.contains('is-open')) close(); });
  document.querySelectorAll('[data-open-chat]').forEach(function (b) { b.addEventListener('click', open); });

  form.addEventListener('submit', function (e) { e.preventDefault(); ask(input.value); });

  // In-site links inside answers scroll the page; close the panel on small screens.
  log.addEventListener('click', function (e) {
    var a = e.target.closest('a[data-goto]');
    if (!a) return;
    e.preventDefault();
    var target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    if (window.innerWidth < 700) close();
    if (window.GS_LENIS) window.GS_LENIS.scrollTo(target, { duration: 1.4 });
    else target.scrollIntoView({ behavior: 'smooth' });
  });
})();
