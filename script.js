/* =========================================================
   CPPEM · PRESENCIAL EM CASA — script
   ========================================================= */
(function () {
  'use strict';

  var ENDPOINT = 'https://script.google.com/macros/s/AKfycbxdFplWVSfhTjvyIA7HIWb645xRjGNhBVhTdTf5UMjo0lSpW_A_jCuys0qB4uImKXPQ/exec?aba=CASA';
  var ABA = 'CASA';
  var WHATSAPP = 'https://checkout.cppem.com.br/pay/presencial-em-casa-carreiras-policiais-01';

  /* =========================================================
     Tracking de Lead — PixelX / GTM   (ver TRACKING.md)

     REGRA DE OURO: exatamente UM emissor de Lead.

     🔴 CAUSA DO LEAD INDO PARA TODAS AS TAGS META

     Este site está em Modelo B: quem dispara é o `send_event` daqui. E um
     `send_event` é NÃO-ROTEADO — ele não passa por regra de conversão nenhuma,
     então a PixelX o entrega pelo padrão da conta, que é TODOS os destinos.
     Daí o Lead aparecer nas três tags Meta.

     Nas landings que estão certas (captura-cppem, pmpe, ManyChat, aniversário,
     colégio, mentoria) quem dispara é a REGRA DO PAINEL, vinculada ao id opaco
     no <form>. A regra tem destino configurado, e é isso que faz a conversão
     chegar só onde deve.

     O mesmo mecanismo explica o sintoma oposto visto no PMPE (§8.7), onde o
     send_event não chegava a NENHUMA tag: sem roteamento, o destino é o padrão
     da conta — que pode ser tudo ou nada. Nunca é o destino certo por acaso.

     ➜ CORREÇÃO (2 passos, precisa do painel):
        1. Cadastrar este formulário no painel da PixelX e pegar o id opaco.
        2. Trocar o id do <form> no index.html por esse valor, e mudar
           LEAD_MODE para 'painel' aqui embaixo.
       Feito isso, o send_event para de ser chamado e a regra roteia sozinha.

     ⚠ Enquanto LEAD_MODE continuar 'site', o Lead segue indo para todas as
       tags. Trocar para 'painel' ANTES de cadastrar no painel zera o Lead —
       não faça um sem o outro.
     ========================================================= */
  var LEAD_MODE = 'site';          // 'site' (Modelo B) | 'painel' (Modelo A)
  var PHONE_MODE = 'celular_br';   // 'celular_br' | 'celular_ou_fixo_br' | 'internacional'
  var REDIRECT_DELAY_MS = 1500;    // §7.6 — abaixo de ~1s começa a perder eventos
  var PIXEL_TIMEOUT_MS = 3000;     // §8.5 — espera o pixel_x_app ficar pronto

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

  /* ---------- telefone e Lead (ver TRACKING.md) ---------- */

  /* §7.7 — conta DÍGITOS, não caracteres, e remove o "+55" pelo "+" literal
     antes de contar. A máscara da PixelX escreve "+{55}" como texto fixo, e
     esses dois dígitos mascaram números incompletos: "+55 (81) 9996-741"
     soma 11 dígitos e passaria por um teste ingênuo de "11 dígitos".
     Remover pelos dígitos seria ambíguo — o DDD 55 existe (Santa Maria/RS). */
  function phoneDigitsNacional(v) {
    return String(v || '').trim().replace(/^\+\s*55\s*/, '').replace(/\D/g, '');
  }

  function isPhone(v) {
    var d = phoneDigitsNacional(v);

    if (PHONE_MODE === 'celular_ou_fixo_br') return d.length === 10 || d.length === 11;
    if (PHONE_MODE === 'internacional')      return d.length >= 8 && d.length <= 15;

    return d.length === 11 && d[2] === '9';   // celular_br (padrão)
  }

  /* E.164: Meta e Google casam telefone por esse formato. Sem o código do
     país, "81999967415" vira "+81999967415" — que é Japão — e o match falha. */
  function toE164(v) {
    var d = phoneDigitsNacional(v);
    if (d.length > 11 && d.indexOf('55') === 0) d = d.slice(2);
    return d ? '+55' + d : '';
  }

  /* §8.5 — pixel_x_app é criado pelo GTM e o start() dela é async. Em conexão
     lenta o objeto pode não existir na hora do envio; sem esta espera o Lead
     some sem erro nenhum. */
  function waitForPixel(timeoutMs) {
    return new Promise(function (resolve) {
      function pronto() {
        return window.pixel_x_app && typeof window.pixel_x_app.send_event === 'function';
      }
      if (pronto()) return resolve(true);

      var inicio = Date.now();
      var t = setInterval(function () {
        if (pronto()) {
          clearInterval(t);
          resolve(true);
        } else if (Date.now() - inicio > (timeoutMs || PIXEL_TIMEOUT_MS)) {
          clearInterval(t);
          console.warn('[tracking] pixel_x_app não ficou pronto a tempo; Lead não enviado.');
          resolve(false);
        }
      }, 100);
    });
  }

  /* Emissor ÚNICO de Lead. A guarda cobre duplo clique, listener duplicado e
     script incluído duas vezes. */
  var leadEnviado = false;

  function trackLead(dados) {
    if (LEAD_MODE !== 'site') return Promise.resolve(false);

    if (leadEnviado) {
      console.warn('[tracking] Lead já enviado nesta página; ignorando.');
      return Promise.resolve(false);
    }
    leadEnviado = true;

    return waitForPixel().then(function (ok) {
      if (!ok) return false;

      return window.pixel_x_app.send_event({
        event_name: 'Lead',
        lead_name: dados.nome || '',
        lead_email: String(dados.email || '').trim().toLowerCase(),
        lead_phone: toE164(dados.whatsapp)
      }).then(function () {
        console.log('[tracking] Lead enviado.');
        return true;
      });
    }).catch(function (err) {
      console.error('[tracking] send_event falhou:', err);
      leadEnviado = false;          // libera para nova tentativa
      return false;
    });
  }

  /* Superfície de diagnóstico no console (§10) e ponto de entrada para
     formulários sem submit nativo (§8.3):
       cppemTracking.state()            -> modo, se já enviou, se o pixel está pronto
       cppemTracking.isPhone('...')     -> testa a regra de telefone
       cppemTracking.toE164('...')      -> confere a normalização
       cppemTracking.trackLead({...})   -> dispara o Lead manualmente */
  window.cppemTracking = {
    trackLead: trackLead,
    isPhone: isPhone,
    toE164: toE164,
    state: function () {
      return {
        leadMode: LEAD_MODE,
        leadEnviado: leadEnviado,
        pixelPronto: !!(window.pixel_x_app && window.pixel_x_app.send_event)
      };
    }
  };
  window.trackLead = trackLead;

  /* ---------- validação ---------- */
  var PIXELX_ID = 'lead_form_presencial_em_casa';   // trocar pelo id do painel

  var form = document.getElementById(PIXELX_ID);

  /* Referências explícitas em vez de form.elements[...]: com name="name", o
     acesso nomeado colide com a propriedade nativa HTMLFormElement.name —
     mesma família de armadilha do §7.3. */
  var nomeInput = document.getElementById('lead_name');
  var emailInput = document.getElementById('lead_email');
  var telefoneInput = document.getElementById('lead_phone');
  var submitBtn = document.getElementById('lead_submit');
  var btnLabel = submitBtn.querySelector('.btn__label');
  var spinner = submitBtn.querySelector('.spinner');

  var CAMPOS = { name: nomeInput, email: emailInput, phone: telefoneInput };

  /* Falha barulhenta em vez de silenciosa (§8.1). */
  if (!form) {
    console.error('[tracking] Formulário "' + PIXELX_ID + '" não encontrado.');
  }

  function setError(key, msg) {
    var input = CAMPOS[key];
    var slot = form.querySelector('[data-error-for="' + key + '"]');
    if (slot) slot.textContent = msg || '';
    if (input) input.classList.toggle('is-invalid', !!msg);
  }

  function validate() {
    var ok = true;
    var nome = nomeInput.value.trim();
    var email = emailInput.value.trim();
    var zap = telefoneInput.value.trim();

    if (nome.length < 3 || nome.indexOf(' ') === -1) {
      setError('name', 'Informe seu nome completo.'); ok = false;
    } else setError('name', '');

    if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(email)) {
      setError('email', 'Informe um e-mail válido.'); ok = false;
    } else setError('email', '');

    if (!isPhone(zap)) {
      setError('phone', 'Informe seu WhatsApp com DDD — ex: (81) 90000-0000.'); ok = false;
    } else setError('phone', '');

    return ok;
  }

  Object.keys(CAMPOS).forEach(function (k) {
    CAMPOS[k].addEventListener('input', function () {
      if (CAMPOS[k].classList.contains('is-invalid')) validate();
    });
  });

  function loading(state) {
    submitBtn.disabled = state;
    spinner.hidden = !state;
    btnLabel.textContent = state ? 'ENVIANDO...' : 'QUERO FALAR COM A EQUIPE';
  }

  /* ---------- envio ---------- */
  var enviado = false;   // guarda de idempotência

  function enviar() {
    if (enviado) return;
    enviado = true;

    loading(true);

    var payload = {
      aba: ABA,        // janela/aba CASA dentro da planilha
      janela: ABA,
      sheet: ABA,
      tab: ABA,
      pagina: 'Presencial em Casa',
      produto: 'Presencial em Casa',
      /* As CHAVES abaixo continuam nome/email/whatsapp de propósito: são as
         colunas da planilha (aba CASA). Só a origem dos valores mudou. */
      nome: nomeInput.value.trim(),
      email: emailInput.value.trim(),
      whatsapp: telefoneInput.value.trim(),
      origem: window.location.href,
      data: new Date().toLocaleString('pt-BR')
    };

    // 1. Lead primeiro, antes de qualquer coisa que tire o visitante da página.
    //    No modo 'painel' isto não faz nada.
    trackLead(payload);

    // 2. Planilha em fire-and-forget: com no-cors não dá para ler a resposta,
    //    então esperar não garante nada — só atrasaria o visitante.
    var params = new URLSearchParams(payload).toString();
    fetch(ENDPOINT, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
      body: params
    }).catch(function (err) {
      console.error('[Form] Falha ao salvar na planilha (segue o redirect):', err);
    });

    // 3. §7.6 — piso de 1500ms antes de navegar. O Promise.race anterior
    //    redirecionava assim que o fetch no-cors resolvia (~200ms), e nesse
    //    tempo o evento de conversão não chega a sair.
    setTimeout(function () {
      window.location.href = WHATSAPP;
    }, REDIRECT_DELAY_MS);
  }

  /* PRIMEIRA BARREIRA — no clique do botão, fase de captura (§7.8).
     Se os dados forem inválidos, o preventDefault cancela a ação padrão do
     botão e o navegador NUNCA chega a disparar o evento "submit". O Enter
     também passa por aqui, via submissão implícita. */
  if (submitBtn) {
    submitBtn.addEventListener('click', function (e) {
      if (!validate()) e.preventDefault();
    }, true);
  }

  /* SEGUNDA BARREIRA — "submit" capturado no DOCUMENT, em fase de captura (§7.8).
     Roda SEMPRE antes de qualquer listener registrado no <form>, inclusive o
     que a PixelX instala de dentro de um start() assíncrono.

     - Inválido            -> stopImmediatePropagation: o evento morre aqui e
                              nenhum Lead é registrado com dado ruim.
     - Válido, modo 'site' -> também morre aqui; quem dispara o Lead somos nós.
     - Válido, modo painel -> propaga, e só a regra do painel dispara. */
  document.addEventListener('submit', function (e) {
    if (e.target !== form) return;

    e.preventDefault();

    if (!validate()) {
      e.stopImmediatePropagation();
      var bad = form.querySelector('.is-invalid');
      if (bad) bad.focus();
      return;
    }

    if (LEAD_MODE === 'site') e.stopImmediatePropagation();

    enviar();
  }, true);
})();
