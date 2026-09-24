(function () {
  // Scroll reveal animations
  if ('IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    document.querySelectorAll('.reveal').forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    document.querySelectorAll('.reveal').forEach(function (el) {
      el.classList.add('in-view');
    });
  }

  // Safety net: force-reveal anything still hidden after 4s (e.g. observer failed)
  setTimeout(function () {
    document.querySelectorAll('.reveal:not(.in-view)').forEach(function (el) {
      el.classList.add('in-view');
    });
  }, 4000);

  // FAQ accordion
  document.querySelectorAll('.faq-q').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var expanded = btn.getAttribute('aria-expanded') === 'true';
      document.querySelectorAll('.faq-q').forEach(function (b) {
        b.setAttribute('aria-expanded', 'false');
        b.nextElementSibling.classList.remove('open');
      });
      if (!expanded) {
        btn.setAttribute('aria-expanded', 'true');
        btn.nextElementSibling.classList.add('open');
      }
    });
  });

  // Chat widget
  var btn = document.getElementById('ds-chat-btn');
  var overlay = document.getElementById('ds-chat-overlay');
  var closeBtn = document.getElementById('ds-chat-close');
  var frame = document.getElementById('ds-chat-frame');
  var loaded = false;

  function ensureFrame() {
    if (!loaded && frame) {
      frame.src = frame.src;
      loaded = true;
    }
  }
  function openChat() {
    if (overlay) {
      overlay.classList.add('open');
      ensureFrame();
    }
    markInviteDismissed();
    hideInvite();
  }

  if (btn) {
    btn.addEventListener('click', function () {
      overlay.classList.toggle('open');
      ensureFrame();
      btn.classList.add('ds-settled');
    });
  }
  if (closeBtn) {
    closeBtn.addEventListener('click', function () {
      overlay.classList.remove('open');
    });
  }

  // Bot temporalmente desactivado (reversible): las .precio-cta ahora son
  // links directos a WhatsApp (ver index.html), así que ya no deben
  // interceptar el clic para abrir el chat -- si se reactiva el bot,
  // descomentar este bloque y revertir los href="#" en index.html.
  // document.querySelectorAll('.precio-cta').forEach(function (a) {
  //   a.addEventListener('click', function (e) {
  //     e.preventDefault();
  //     openChat();
  //   });
  // });

  // Chat invite card — aparece una vez por sesión, por tiempo
  var inviteCard = document.getElementById('ds-invite-card');
  var inviteChatBtn = document.getElementById('ds-invite-chat');
  var inviteDismissBtn = document.getElementById('ds-invite-dismiss');
  var inviteCloseBtn = document.getElementById('ds-invite-close');
  var INVITE_DISMISSED_KEY = 'ds_invite_dismissed';
  var INVITE_DELAY_MS = 9000;

  function inviteDismissed() {
    try {
      return sessionStorage.getItem(INVITE_DISMISSED_KEY) === '1';
    } catch (e) {
      return false;
    }
  }
  function markInviteDismissed() {
    try {
      sessionStorage.setItem(INVITE_DISMISSED_KEY, '1');
    } catch (e) {}
  }
  function hideInvite() {
    if (!inviteCard) return;
    inviteCard.classList.remove('ds-visible');
    setTimeout(function () {
      inviteCard.classList.remove('ds-open');
    }, 300);
  }
  function showInvite() {
    if (!inviteCard || inviteDismissed()) return;
    if (overlay && overlay.classList.contains('open')) return;
    inviteCard.classList.add('ds-open');
    requestAnimationFrame(function () {
      inviteCard.classList.add('ds-visible');
    });
  }

  // No mostrar la tarjeta mientras los CTA principales del hero estén visibles
  // (en mobile la tarjeta se superpone justo a esos botones).
  function heroCtasInView() {
    var hc = document.querySelector('.hero-ctas');
    if (!hc) return false;
    var r = hc.getBoundingClientRect();
    var vh = window.innerHeight || document.documentElement.clientHeight;
    return r.bottom > 0 && r.top < vh;
  }

  function tryShowInvite() {
    if (inviteDismissed()) return;
    if (heroCtasInView()) {
      var onScroll = function () {
        if (inviteDismissed()) {
          window.removeEventListener('scroll', onScroll);
          return;
        }
        if (!heroCtasInView()) {
          window.removeEventListener('scroll', onScroll);
          showInvite();
        }
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      return;
    }
    showInvite();
  }

  if (inviteCard) {
    setTimeout(function () {
      tryShowInvite();
    }, INVITE_DELAY_MS);

    if (inviteChatBtn) {
      inviteChatBtn.addEventListener('click', function () {
        markInviteDismissed();
        hideInvite();
        openChat();
      });
    }
    if (inviteDismissBtn) {
      inviteDismissBtn.addEventListener('click', function () {
        markInviteDismissed();
        hideInvite();
      });
    }
    if (inviteCloseBtn) {
      inviteCloseBtn.addEventListener('click', function () {
        markInviteDismissed();
        hideInvite();
      });
    }
    if (btn) {
      btn.addEventListener('click', function () {
        markInviteDismissed();
        hideInvite();
      });
    }
  }
})();

// Novedades carousel — avanza cada 8s, navegable con puntos, se pausa en hover
(function () {
  var track = document.getElementById('novedades-track');
  var dotsWrap = document.getElementById('novedades-dots');
  if (!track || !dotsWrap) return;

  var slides = track.children;
  var count = slides.length;
  if (count < 2) return;

  var NOVEDADES_INTERVAL_MS = 5000;
  var index = 0;
  var timer = null;
  var reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  for (var i = 0; i < count; i++) {
    var dot = document.createElement('button');
    dot.className = 'novedad-dot' + (i === 0 ? ' active' : '');
    dot.type = 'button';
    dot.setAttribute('aria-label', 'Ir a la novedad ' + (i + 1));
    (function (idx) {
      dot.addEventListener('click', function () {
        goTo(idx);
        restart();
      });
    })(i);
    dotsWrap.appendChild(dot);
  }
  var dots = dotsWrap.children;

  function goTo(i) {
    index = i;
    track.style.transform = 'translateX(-' + (index * 100) + '%)';
    for (var j = 0; j < dots.length; j++) {
      dots[j].classList.toggle('active', j === index);
    }
  }
  function next() {
    goTo((index + 1) % count);
  }
  function start() {
    if (reducedMotion) return;
    timer = setInterval(next, NOVEDADES_INTERVAL_MS);
  }
  function stop() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }
  function restart() {
    stop();
    start();
  }

  var wrap = track.parentElement;
  wrap.addEventListener('mouseenter', stop);
  wrap.addEventListener('mouseleave', start);

  start();
})();

// ── Cupos de análisis del mes ────────────────────────────────────────────
// ACTUALIZAR CADA MES con el dato real. Solo se muestra si "mes" coincide con
// el mes actual (así nunca queda un número viejo publicado). Si "disponibles"
// es null, el aviso permanece oculto. Con 0 se muestra lista de espera.
var DS_CUPOS = {
  mes: '2026-09',       // formato AAAA-MM
  disponibles: 5        // número de cupos que realmente quedan este mes
};

(function () {
  var WA = 'https://wa.me/51904106544?text=';
  var MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  var now = new Date();
  var key = now.getFullYear() + '-' + ('0' + (now.getMonth() + 1)).slice(-2);
  var n = DS_CUPOS.disponibles;
  if (DS_CUPOS.mes !== key || typeof n !== 'number' || n < 0) return;
  var mes = MESES[now.getMonth()];
  var icon = '<svg class="ico" aria-hidden="true"><use href="#i-cal"/></svg> ';
  var html;
  if (n === 0) {
    var next = MESES[(now.getMonth() + 1) % 12];
    var msg = 'Hola, quiero unirme a la lista de espera de DolphinStats para ' + next + '.';
    html = icon + 'Cupos de ' + mes + ' completos · <a href="' + WA + encodeURIComponent(msg) + '" target="_blank" rel="noopener noreferrer">Únete a la lista de espera</a>';
  } else {
    html = icon + 'Cupos de análisis para ' + mes + ': ' + (n === 1 ? 'queda <b>1</b>' : 'quedan <b>' + n + '</b>');
  }
  document.querySelectorAll('[data-cupos]').forEach(function (el) {
    el.innerHTML = html;
    el.hidden = false;
  });
})();

// ── Selector de perfil → WhatsApp con mensaje armado ─────────────────────
(function () {
  var dlg = document.getElementById('perfil-dialog');
  if (!dlg || typeof dlg.showModal !== 'function') return; // sin <dialog>: los links siguen yendo a WhatsApp

  document.querySelectorAll('.perfil-card').forEach(function (a) {
    a.href = 'https://wa.me/51904106544?text=' + encodeURIComponent(a.getAttribute('data-msg'));
    a.addEventListener('click', function () { dlg.close(); });
  });
  document.querySelectorAll('.js-perfil').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      dlg.showModal();
    });
  });
  dlg.querySelector('.perfil-close').addEventListener('click', function () { dlg.close(); });
  dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); }); // clic en el fondo
})();

// ── Pestañas desplegables (una abierta por grupo) + enlaces internos ─────
(function () {
  document.querySelectorAll('[data-acc-group]').forEach(function (group) {
    group.addEventListener('toggle', function (e) {
      var d = e.target;
      if (!d.open || !d.classList.contains('acc')) return;
      group.querySelectorAll('details.acc[open]').forEach(function (o) { if (o !== d) o.open = false; });
    }, true);
  });

  function openTarget(id) {
    var el = id && document.getElementById(id);
    if (!el || !el.classList.contains('acc')) return false;
    el.open = true;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return true;
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a || a.getAttribute('href').length < 2) return;
    var id = a.getAttribute('href').slice(1);
    if (openTarget(id)) {
      e.preventDefault();
      if (history.replaceState) history.replaceState(null, '', '#' + id);
    }
  });
  if (location.hash) setTimeout(function () { openTarget(location.hash.slice(1)); }, 0);
})();

// ── Banco de preguntas de investigación ─────────────────────────────────
(function () {
  var root = document.getElementById('quiz');
  var bank = window.DS_BANCO;
  if (!root || !bank || !bank.length) return;

  var LETTERS = ['A', 'B', 'C', 'D', 'E'];
  var order = [];
  var pos = -1;

  function esc(t) {
    return String(t).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function shuffle(arr) {
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
    }
    return arr;
  }
  function nextIndex() {
    pos++;
    if (pos >= order.length) {
      var last = order.length ? order[order.length - 1] : -1;
      order = shuffle(bank.map(function (_, i) { return i; }));
      if (order[0] === last && order.length > 1) { var t = order[0]; order[0] = order[1]; order[1] = t; }
      pos = 0;
    }
    return order[pos];
  }
  function refHtml(r) {
    if (!r || !r.texto) return '';
    var link = r.doi ? ' <a href="https://doi.org/' + esc(r.doi) + '" target="_blank" rel="noopener noreferrer">doi:' + esc(r.doi) + '</a>'
      : (r.pmid ? ' <a href="https://pubmed.ncbi.nlm.nih.gov/' + esc(r.pmid) + '/" target="_blank" rel="noopener noreferrer">PubMed</a>' : '');
    return '<p class="quiz-ref"><b>Referencia:</b> ' + esc(r.texto) + link + '</p>';
  }

  function render() {
    var q = bank[nextIndex()];
    // Se mezclan las opciones: en el banco la correcta no siempre está en la misma posición
    var opts = shuffle(q.opciones.map(function (t, i) { return { t: t, ok: i === q.correcta }; }));
    var answered = false;

    root.innerHTML =
      '<div class="quiz-meta"><span class="quiz-chip">' + esc(q.tema) + '</span><span class="quiz-chip">' + esc(q.nivel) + '</span>' +
      '<span class="quiz-count">' + bank.length + ' preguntas en el banco</span></div>' +
      '<p class="quiz-q">' + esc(q.enunciado) + '</p>' +
      '<div class="quiz-opts" role="group" aria-label="Opciones de respuesta">' +
      opts.map(function (o, i) {
        return '<button type="button" class="quiz-opt" data-i="' + i + '"><span class="k">' + LETTERS[i] + '.</span><span>' + esc(o.t) + '</span></button>';
      }).join('') + '</div><div class="quiz-fb" hidden></div>';

    var fb = root.querySelector('.quiz-fb');
    var btns = root.querySelectorAll('.quiz-opt');
    btns.forEach(function (b) {
      b.addEventListener('click', function () {
        if (answered) return;
        answered = true;
        var chosen = opts[+b.getAttribute('data-i')];
        btns.forEach(function (x, i) {
          x.disabled = true;
          if (opts[i].ok) x.classList.add('ok');
        });
        if (!chosen.ok) b.classList.add('bad');
        fb.innerHTML =
          '<div class="quiz-verdict ' + (chosen.ok ? 'ok' : 'bad') + '">' + (chosen.ok ? '¡Correcto!' : 'No es esa. La respuesta correcta está marcada en verde.') + '</div>' +
          '<p>' + esc(q.fundamento) + '</p>' + refHtml(q.ref) +
          '<div class="quiz-actions"><button type="button" class="btn-primary quiz-next">Otra pregunta →</button>' +
          '<a class="btn-secondary js-perfil-quiz" href="#" role="button">¿Dudas con tu análisis? Escríbenos</a></div>';
        fb.hidden = false;
        fb.querySelector('.quiz-next').addEventListener('click', render);
        fb.querySelector('.js-perfil-quiz').addEventListener('click', function (e) {
          e.preventDefault();
          var dlg = document.getElementById('perfil-dialog');
          if (dlg && dlg.showModal) dlg.showModal();
          else window.open('https://wa.me/51904106544?text=' + encodeURIComponent('Hola, quiero solicitar una asesoria con DolphinStats.'), '_blank', 'noopener');
        });
        fb.querySelector('.quiz-next').focus({ preventScroll: true });
      });
    });
  }
  render();
})();
