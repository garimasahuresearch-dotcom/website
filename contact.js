(function () {
  'use strict';

  /* ---------- Popup ---------- */
  var modal = document.getElementById('contactModal');
  var form = document.querySelector('.cform');
  if (!modal || !form) return;
  var lastFocus = null;

  function openModal() {
    lastFocus = document.activeElement;
    modal.hidden = false;
    modal.offsetWidth; // commit display before the transition starts
    modal.classList.add('is-open');
    document.documentElement.classList.add('modal-open');
    if (window.GS_LENIS) window.GS_LENIS.stop();
    setTimeout(function () { form.elements.name.focus({ preventScroll: true }); }, 350);
  }
  function closeModal() {
    modal.classList.remove('is-open');
    document.documentElement.classList.remove('modal-open');
    if (window.GS_LENIS) window.GS_LENIS.start();
    setTimeout(function () { if (!modal.classList.contains('is-open')) modal.hidden = true; }, 450);
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }

  // Delegated, so links inside chat answers open it too.
  document.addEventListener('click', function (e) {
    var opener = e.target.closest('[data-open-contact]');
    if (opener) { e.preventDefault(); openModal(); return; }
    if (e.target.closest('[data-close-contact]')) closeModal();
  });
  document.addEventListener('keydown', function (e) {
    if (modal.hidden) return;
    if (e.key === 'Escape') { closeModal(); return; }
    if (e.key !== 'Tab') return;
    var f = modal.querySelectorAll('button, input:not([type=hidden]):not([tabindex="-1"]), textarea, [href]');
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  /* ---------- Form ----------
     Netlify Forms detects the static form at deploy time; we post it with fetch
     so the visitor stays on the page. */
  var status = form.querySelector('.cform__status');
  var button = form.querySelector('button[type="submit"]');
  var label = form.querySelector('.cform__label');

  function setStatus(text, kind) {
    status.textContent = text;
    status.dataset.kind = kind || '';
  }

  function invalid(field, message) {
    field.closest('.field').classList.add('is-invalid');
    setStatus(message, 'error');
    field.focus();
    return false;
  }

  function validate() {
    form.querySelectorAll('.is-invalid').forEach(function (el) { el.classList.remove('is-invalid'); });
    var name = form.elements.name, email = form.elements.email, msg = form.elements.message;
    if (!name.value.trim()) return invalid(name, 'Please add your name.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) return invalid(email, 'Please add a valid email address.');
    if (msg.value.trim().length < 10) return invalid(msg, 'Please write a slightly longer message.');
    return true;
  }

  form.addEventListener('input', function (e) {
    var f = e.target.closest('.field');
    if (f) f.classList.remove('is-invalid');
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!validate()) return;
    button.disabled = true;
    label.textContent = 'Sending…';
    setStatus('', '');

    fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(new FormData(form)).toString()
    })
      .then(function (res) {
        if (!res.ok) throw new Error(res.status);
        form.reset();
        form.classList.add('is-sent');
        label.textContent = 'Message sent';
        setStatus('Thank you — Garima will get back to you soon.', 'ok');
        setTimeout(function () {
          form.classList.remove('is-sent');
          label.textContent = 'Send message';
          button.disabled = false;
        }, 5000);
      })
      .catch(function () {
        label.textContent = 'Send message';
        button.disabled = false;
        setStatus('Couldn’t send right now. Please try again, or reach her on LinkedIn.', 'error');
      });
  });
})();
