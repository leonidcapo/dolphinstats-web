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
})();
