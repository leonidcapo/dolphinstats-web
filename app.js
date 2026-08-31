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

  // Pricing CTAs open the chat widget
  document.querySelectorAll('.precio-cta').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      openChat();
    });
  });

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

  if (inviteCard) {
    setTimeout(function () {
      if (!inviteDismissed()) showInvite();
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
