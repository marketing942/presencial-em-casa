/* =========================================================
   CPPEM · PRESENCIAL EM CASA — script
   ========================================================= */
(function () {
  'use strict';

  var ENDPOINT = 'https://script.google.com/macros/s/AKfycbxdFplWVSfhTjvyIA7HIWb645xRjGNhBVhTdTf5UMjo0lSpW_A_jCuys0qB4uImKXPQ/exec?aba=CASA';
  var ABA = 'CASA';
  var WHATSAPP = 'https://wa.me/5581973105354?text=Quero%20quero%20come%C3%A7ar%20minha%20prepara%C3%A7%C3%A3o%20com%20o%20presencial%20em%20casa!%20%F0%9F%94%A5%F0%9F%92%80';

  /* ---------- ano ---------- */
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- header sticky + barra de progresso + parallax ---------- */
  var header = document.getElementById('header');
  var progress = document.getElementById('progress');
  var heroBg = document.getElementById('heroBg');
  var ticking = false;

  function render() {
    var y = window.scrollY;
    header.classList.toggle('is-stuck', y > 40);

    var max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';

    if (!reduced && heroBg && y < window.innerHeight * 1.2) {
      heroBg.style.transform = 'scale(1.06) translateY(' + (y * 0.18) + 'px)';
    }
    ticking = false;
  }
  function onScroll() {
    if (!ticking) { ticking = true; requestAnimationFrame(render); }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  render();

  /* ---------- reveal on scroll (com escalonamento) ---------- */
  var targets = document.querySelectorAll('.section__head, .card, .steps li, .split__copy, .split__media, .final__inner');
  Array.prototype.forEach.call(targets, function (el) { el.classList.add('reveal'); });

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      var i = 0;
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.style.transitionDelay = (i++ * 90) + 'ms';
        e.target.classList.add('is-visible');
        io.unobserve(e.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px' });
    Array.prototype.forEach.call(targets, function (el) { io.observe(el); });
  } else {
    Array.prototype.forEach.call(targets, function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- brilho seguindo o cursor nos cards ---------- */
  Array.prototype.forEach.call(document.querySelectorAll('.card'), function (card) {
    card.addEventListener('mousemove', function (e) {
      var r = card.getBoundingClientRect();
      card.style.setProperty('--mx', ((e.clientX - r.left) / r.width) * 100 + '%');
      card.style.setProperty('--my', ((e.clientY - r.top) / r.height) * 100 + '%');
    });
  });

  /* ---------- partículas douradas na hero ---------- */
  var sparks = document.getElementById('sparks');
  if (sparks && !reduced) {
    for (var s = 0; s < 16; s++) {
      var p = document.createElement('i');
      p.className = 'spark';
      p.style.left = (Math.random() * 100) + '%';
      p.style.bottom = (Math.random() * 45) + '%';
      p.style.animationDuration = (7 + Math.random() * 8).toFixed(1) + 's';
      p.style.animationDelay = (Math.random() * 9).toFixed(1) + 's';
      p.style.transform = 'scale(' + (0.5 + Math.random()).toFixed(2) + ')';
      sparks.appendChild(p);
    }
  }

  /* ---------- modal ---------- */
  var modal = document.getElementById('modal');
  var lastFocus = null;

  function openModal() {
    lastFocus = document.activeElement;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    var first = document.getElementById('nome');
    if (first) setTimeout(function () { first.focus(); }, 60);
  }

  function closeModal() {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  }

  Array.prototype.forEach.call(document.querySelectorAll('.js-open'), function (btn) {
    btn.addEventListener('click', openModal);
  });
  Array.prototype.forEach.call(modal.querySelectorAll('[data-close]'), function (el) {
    el.addEventListener('click', closeModal);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
  });

  /* ---------- validação ---------- */
  var form = document.getElementById('leadForm');
  var submitBtn = document.getElementById('submitBtn');
  var btnLabel = submitBtn.querySelector('.btn__label');
  var spinner = submitBtn.querySelector('.spinner');

  function setError(name, msg) {
    var input = form.elements[name];
    var slot = form.querySelector('[data-err="' + name + '"]');
    if (slot) slot.textContent = msg || '';
    input.classList.toggle('is-invalid', !!msg);
  }

  function validate() {
    var ok = true;
    var nome = form.elements.nome.value.trim();
    var email = form.elements.email.value.trim();
    var zap = form.elements.whatsapp.value.trim();

    if (nome.length < 3 || nome.indexOf(' ') === -1) {
      setError('nome', 'Informe seu nome completo.'); ok = false;
    } else setError('nome', '');

    if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(email)) {
      setError('email', 'Informe um e-mail válido.'); ok = false;
    } else setError('email', '');

    var digits = zap.replace(/\D/g, '');
    if (digits.length < 10 || digits.length > 13) {
      setError('whatsapp', 'Informe seu WhatsApp com DDD.'); ok = false;
    } else setError('whatsapp', '');

    return ok;
  }

  ['nome', 'email', 'whatsapp'].forEach(function (n) {
    form.elements[n].addEventListener('input', function () {
      if (form.elements[n].classList.contains('is-invalid')) validate();
    });
  });

  function loading(state) {
    submitBtn.disabled = state;
    spinner.hidden = !state;
    btnLabel.textContent = state ? 'ENVIANDO...' : 'QUERO FALAR COM A EQUIPE';
  }

  /* ---------- envio ---------- */
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!validate()) {
      var bad = form.querySelector('.is-invalid');
      if (bad) bad.focus();
      return;
    }

    loading(true);

    var payload = {
      aba: ABA,        // janela/aba CASA dentro da planilha
      janela: ABA,
      sheet: ABA,
      tab: ABA,
      pagina: 'Presencial em Casa',
      produto: 'Presencial em Casa',
      nome: form.elements.nome.value.trim(),
      email: form.elements.email.value.trim(),
      whatsapp: form.elements.whatsapp.value.trim(),
      origem: window.location.href,
      data: new Date().toLocaleString('pt-BR')
    };

    var params = new URLSearchParams(payload).toString();

    function go() { window.location.href = WHATSAPP; }

    // no-cors: o Apps Script grava normalmente, a resposta não é lida.
    var send = fetch(ENDPOINT, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
      body: params
    });

    // rede lenta/offline não pode travar o lead: redireciona em no máx. 6s
    var timeout = new Promise(function (res) { setTimeout(res, 6000); });

    Promise.race([send.catch(function () {}), timeout]).then(go);
  });
})();
