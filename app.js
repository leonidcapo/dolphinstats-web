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
// Cada mes empieza en "inicioMes" y baja 1 por semana (días 1-7: 5, 8-14: 4,
// 15-21: 3, 22-28: 2, 29+: 1). Es un calendario de capacidad, no un conteo de
// reservas reales: si los cupos se llenan antes (o sobran), fijar "manual"
// para ese mes -- con 0 se muestra la lista de espera.
var DS_CUPOS = {
  inicioMes: 5,
  manual: null          // ej. { mes: '2026-09', disponibles: 2 }
};

(function () {
  var WA = 'https://wa.me/51904106544?text=';
  var MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  var now = new Date();
  var key = now.getFullYear() + '-' + ('0' + (now.getMonth() + 1)).slice(-2);
  var semana = Math.min(Math.ceil(now.getDate() / 7), 5);
  var n = Math.max(1, DS_CUPOS.inicioMes - (semana - 1));
  if (DS_CUPOS.manual && DS_CUPOS.manual.mes === key && typeof DS_CUPOS.manual.disponibles === 'number' && DS_CUPOS.manual.disponibles >= 0) {
    n = DS_CUPOS.manual.disponibles;
  }
  var mes = MESES[now.getMonth()];
  var icon = '<svg class="ico" aria-hidden="true"><use href="#i-cal"/></svg> ';
  var html;
  if (n === 0) {
    var next = MESES[(now.getMonth() + 1) % 12];
    var msg = 'Hola, quiero unirme a la lista de espera de DolphinStats para ' + next + '.';
    html = icon + 'Cupos de ' + mes + ' completos · <a href="' + WA + encodeURIComponent(msg) + '" target="_blank" rel="noopener noreferrer">Únete a la lista de espera</a>';
  } else {
    html = icon + 'Cupos de análisis de ' + mes + ': ' + (n === 1 ? 'queda <b>1</b>' : 'quedan <b>' + n + '</b>');
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

// ── Reto "Pon a prueba tu investigación" (banco de preguntas + rangos) ───
(function () {
  var root = document.getElementById('quiz');
  var bank = window.DS_BANCO;
  if (!root || !bank || !bank.length) return;

  var LETTERS = ['A', 'B', 'C', 'D', 'E'];
  var SITE = 'https://dolphinstats-web.vercel.app/#banco';
  // Rangos por aciertos ÚNICOS (repetir una pregunta ya acertada no suma)
  var RANKS = [
    { name: 'Aficionado', min: 0, icon: 'compass' },
    { name: 'Conocedor', min: 3, icon: 'book' },
    { name: 'Sobresaliente', min: 7, icon: 'star' },
    { name: 'Experto', min: 13, icon: 'trophy' }
  ];
  var STORE = 'ds_quiz_v1';
  var state = { ok: [], answered: 0, streak: 0, best: 0 };
  try {
    var saved = JSON.parse(localStorage.getItem(STORE) || 'null');
    if (saved && Array.isArray(saved.ok)) {
      state = { ok: saved.ok.filter(function (x) { return typeof x === 'string'; }), answered: +saved.answered || 0, streak: +saved.streak || 0, best: +saved.best || 0 };
    }
  } catch (e) {}
  function save() {
    try { localStorage.setItem(STORE, JSON.stringify(state)); } catch (e) {}
  }

  function rankFor(n) {
    var idx = 0;
    RANKS.forEach(function (r, i) { if (n >= r.min) idx = i; });
    return idx;
  }
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

  // Orden: primero las preguntas aún no acertadas, para que el progreso avance
  var order = [];
  var pos = -1;
  function nextIndex() {
    pos++;
    if (pos >= order.length) {
      var last = order.length ? order[order.length - 1] : -1;
      order = shuffle(bank.map(function (_, i) { return i; }));
      order.sort(function (a, b) {
        return (state.ok.indexOf(bank[a].id) > -1 ? 1 : 0) - (state.ok.indexOf(bank[b].id) > -1 ? 1 : 0);
      });
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
  function icon(name) {
    return '<svg class="ico" aria-hidden="true"><use href="#i-' + name + '"/></svg>';
  }

  // ── Encabezado de rango ──
  root.innerHTML = '<div class="quiz-rank" id="quiz-rank"></div><div id="quiz-body"></div>';
  var rankEl = document.getElementById('quiz-rank');
  var bodyEl = document.getElementById('quiz-body');

  function shareText() {
    var r = RANKS[rankFor(state.ok.length)];
    return 'Alcancé el rango ' + r.name + ' (' + state.ok.length + '/' + bank.length + ' aciertos) en el reto «Pon a prueba tu investigación» de DolphinStats. ¿Te animas? ' + SITE;
  }
  function share() {
    // Abre WhatsApp con el texto listo; la persona elige a quién enviarlo
    window.open('https://wa.me/?text=' + encodeURIComponent(shareText()), '_blank', 'noopener');
  }

  function renderRank(upFrom) {
    var n = state.ok.length;
    var i = rankFor(n);
    var cur = RANKS[i];
    var nxt = RANKS[i + 1];
    var pct, sub;
    if (nxt) {
      pct = Math.round(((n - cur.min) / (nxt.min - cur.min)) * 100);
      var falta = nxt.min - n;
      sub = n + ' ' + (n === 1 ? 'acierto' : 'aciertos') + ' · ' + falta + (falta === 1 ? ' más' : ' más') + ' para ' + nxt.name;
    } else {
      pct = 100;
      sub = n + ' de ' + bank.length + ' aciertos · rango máximo';
    }
    rankEl.innerHTML =
      '<span class="quiz-rank-ico">' + icon(cur.icon) + '</span>' +
      '<div class="quiz-rank-info"><div class="quiz-rank-name">' + esc(cur.name) + '</div>' +
      '<div class="quiz-rank-sub">' + esc(sub) + (state.streak > 1 ? ' · racha de ' + state.streak : '') + '</div>' +
      '<div class="quiz-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + pct + '" aria-label="Progreso al siguiente rango"><i style="width:' + pct + '%"></i></div></div>' +
      (n > 0 ? '<button type="button" class="quiz-share">Comparte tu rango</button>' : '<span class="quiz-chip">Reto: ¿qué rango alcanzas?</span>');
    var sb = rankEl.querySelector('.quiz-share');
    if (sb) sb.addEventListener('click', share);
  }

  function render() {
    var q = bank[nextIndex()];
    // Se mezclan las opciones: en el banco la correcta no siempre está en la misma posición
    var opts = shuffle(q.opciones.map(function (t, i) { return { t: t, ok: i === q.correcta }; }));
    var answered = false;

    bodyEl.innerHTML =
      '<div class="quiz-meta"><span class="quiz-chip">' + esc(q.tema) + '</span><span class="quiz-chip">' + esc(q.nivel) + '</span>' +
      '<span class="quiz-count">' + bank.length + ' preguntas en el banco</span></div>' +
      '<p class="quiz-q">' + esc(q.enunciado) + '</p>' +
      '<div class="quiz-opts" role="group" aria-label="Opciones de respuesta">' +
      opts.map(function (o, i) {
        return '<button type="button" class="quiz-opt" data-i="' + i + '"><span class="k">' + LETTERS[i] + '.</span><span>' + esc(o.t) + '</span></button>';
      }).join('') + '</div><div class="quiz-fb" hidden></div>';

    var fb = bodyEl.querySelector('.quiz-fb');
    var btns = bodyEl.querySelectorAll('.quiz-opt');
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

        // Progreso
        var before = rankFor(state.ok.length);
        state.answered++;
        if (chosen.ok) {
          state.streak++;
          if (state.streak > state.best) state.best = state.streak;
          if (state.ok.indexOf(q.id) === -1) state.ok.push(q.id);
        } else {
          state.streak = 0;
        }
        save();
        var after = rankFor(state.ok.length);
        renderRank();

        var up = after > before
          ? '<div class="quiz-up">' + icon(RANKS[after].icon) + ' ¡Subiste a ' + esc(RANKS[after].name) + '!</div>' : '';
        var ctaLabel = after >= 2 ? 'Aplícalo a tu tesis: escríbenos' : '¿Dudas con tu análisis? Escríbenos';
        fb.innerHTML = up +
          '<div class="quiz-verdict ' + (chosen.ok ? 'ok' : 'bad') + '">' + (chosen.ok ? '¡Correcto!' : 'No es esa. La respuesta correcta está marcada en verde.') + '</div>' +
          '<p>' + esc(q.fundamento) + '</p>' + refHtml(q.ref) +
          '<div class="quiz-actions"><button type="button" class="btn-primary quiz-next">Otra pregunta →</button>' +
          '<a class="btn-secondary js-perfil-quiz" href="#" role="button">' + ctaLabel + '</a></div>';
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
  renderRank();
  render();
})();

// ── Equivalente en dólares (tipo de cambio venta SUNAT vía /api/tc) ──────
// Referencial y redondeado a US$ 5. Si el servicio no responde, los US$ quedan ocultos.
(function () {
  var els = document.querySelectorAll('.precio-usd');
  if (!els.length || !window.fetch) return;
  fetch('/api/tc', { headers: { Accept: 'application/json' } })
    .then(function (r) { if (!r.ok) throw new Error('tc'); return r.json(); })
    .then(function (d) {
      var v = Number(d.venta);
      if (!(v > 2 && v < 6)) return;
      els.forEach(function (el) {
        var usd = Math.round(Number(el.getAttribute('data-soles')) / v / 5) * 5;
        el.textContent = '≈ US$ ' + usd.toLocaleString('en-US');
        el.hidden = false;
      });
      var note = document.getElementById('tc-note');
      if (note) {
        var f = d.fecha ? ' (' + String(d.fecha).split('-').reverse().join('/') + ')' : '';
        note.textContent = ' Equivalente en dólares referencial, al tipo de cambio venta SUNAT de S/ ' + v.toFixed(3) + f + '.';
        note.hidden = false;
      }
    })
    .catch(function () {});
})();
