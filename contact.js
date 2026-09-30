(function () {
  'use strict';

  // Netlify Forms: the static form is detected at deploy time; we post it with fetch
  // so the visitor stays on the page.
  var form = document.querySelector('.cform');
  if (!form) return;
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
