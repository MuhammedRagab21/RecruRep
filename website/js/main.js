(function () {
  'use strict';

  /* ---- Config (injected at build time via Vercel env vars) ---- */
  var cfg = window.__CURRIC_CONFIG__ || (
    console.warn('[Curric] config.js failed to load — using fallback config. Site may not work correctly.'),
    {
      supabaseUrl: 'http://localhost:54321',
      supabaseKey: 'fallback-local-dev-key',
      stripePrice: 199,
      priceLabel: '$1.99',
      maxBetaSpots: 15,
    }
  );

  var SUPABASE_URL = cfg.supabaseUrl;
  var SUPABASE_KEY = cfg.supabaseKey;
  var PRICE_LABEL = cfg.priceLabel;

  /* ---- Supabase REST helpers ---- */
  var sbHeaders = {
    'apikey': SUPABASE_KEY,
    'Authorization': 'Bearer ' + SUPABASE_KEY,
    'Content-Type': 'application/json',
  };

  function sbFetch(method, path, body) {
    var opts = { method: method, headers: sbHeaders };
    if (body) { opts.body = JSON.stringify(body); }
    return fetch(SUPABASE_URL + '/rest/v1/' + path, opts).then(function (r) { return r.json(); });
  }

  /* ---- Load Sample Jobs ---- */
  function loadJobs() {
    var grid = document.getElementById('listingsGrid');
    if (!grid) return;

    sbFetch('GET', 'jobs?select=*&order=created_at.desc&limit=4')
      .then(function (data) {
        if (!data || !data.length) {
          grid.innerHTML = '<div class="listing-card__loading">No sample listings right now.</div>';
          return;
        }
        grid.innerHTML = '';
        data.forEach(function (job, i) {
          var card = document.createElement('div');
          card.className = 'listing-card';
          card.style.transitionDelay = (i * 0.1) + 's';
          card.innerHTML =
            '<div class="listing-card__title">' + esc(job.title) + '</div>' +
            '<div class="listing-card__meta">' +
              '<span class="listing-card__tag"><strong>School:</strong> ' + esc(job.school) + '</span>' +
              '<span class="listing-card__tag"><strong>Salary:</strong> ' + esc(job.salary) + '</span>' +
              '<span class="listing-card__tag"><strong>Type:</strong> ' + esc(job.type) + '</span>' +
              '<span class="listing-card__tag"><strong>Eligibility:</strong> ' + esc(job.eligibility) + '</span>' +
            '</div>' +
            '<div class="listing-card__school">' + esc(job.country) + '</div>';
          grid.appendChild(card);
          setTimeout(function () { card.classList.add('is-visible'); }, i * 100);
        });
      })
      .catch(function () {
        grid.innerHTML = '<div class="listing-card__loading">Could not load listings.</div>';
      });
  }

  /* ---- Spot Counter ---- */
  function loadSpotCount() {
    var spotEl = document.getElementById('spotCount');
    if (!spotEl) return;

    fetch(SUPABASE_URL + '/functions/v1/spot-count')
      .then(function (r) { return r.json(); })
      .then(function (data) {
        var count = data.count || 0;
        var remaining = Math.max(0, cfg.maxBetaSpots - count);
        spotEl.textContent = '\u2014 only ' + remaining + ' of ' + cfg.maxBetaSpots + ' beta spots left';
        if (remaining <= 0) {
          spotEl.textContent = '\u2014 beta is full. Join the waitlist for the public launch.';
        }
      })
      .catch(function () {
        spotEl.textContent = '\u2014 only ' + cfg.maxBetaSpots + ' of ' + cfg.maxBetaSpots + ' beta spots left';
      });
  }

  function esc(str) {
    var d = document.createElement('div');
    d.appendChild(document.createTextNode(str || ''));
    return d.innerHTML;
  }

  loadJobs();
  loadSpotCount();

  /* ---- Mobile Nav ---- */
  var hamburger = document.getElementById('hamburger');
  var navLinks = document.getElementById('navLinks');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', function () {
      this.classList.toggle('is-active');
      navLinks.classList.toggle('is-open');
    });
    navLinks.querySelectorAll('.nav__link').forEach(function (link) {
      link.addEventListener('click', function () {
        hamburger.classList.remove('is-active');
        navLinks.classList.remove('is-open');
      });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && navLinks.classList.contains('is-open')) {
        hamburger.classList.remove('is-active');
        navLinks.classList.remove('is-open');
      }
    });
  }

  /* ---- Smooth Scroll ---- */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var href = this.getAttribute('href');
      if (href === '#' || !href) return;
      var target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        window.scrollTo({ top: target.getBoundingClientRect().top + window.pageYOffset - 70, behavior: 'smooth' });
      }
    });
  });

  /* ---- Active Nav Link ---- */
  var sections = document.querySelectorAll('section[id]');
  var navLinkEls = document.querySelectorAll('.nav__link:not(.nav__cta)');
  function updateActiveLink() {
    var current = '';
    var scrollY = window.pageYOffset + 100;
    sections.forEach(function (s) {
      var top = s.offsetTop, h = s.offsetHeight;
      if (scrollY >= top && scrollY < top + h) current = s.getAttribute('id');
    });
    navLinkEls.forEach(function (link) {
      link.classList.remove('is-active');
      if (link.getAttribute('href') === '#' + current) link.classList.add('is-active');
    });
  }
  window.addEventListener('scroll', updateActiveLink);

  /* ---- Scroll Fade-in ---- */
  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    document.querySelectorAll('.fade-in').forEach(function (el) { observer.observe(el); });
  } else {
    document.querySelectorAll('.fade-in').forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---- Handle Payment Result ---- */
  var params = new URLSearchParams(window.location.search);
  if (params.get('payment') === 'success') {
    sessionStorage.setItem('curric_paid', '1');
    var successForm = document.getElementById('waitlistForm');
    var successMsg = document.getElementById('waitlistSuccess');
    if (successForm && successMsg) {
      successForm.style.display = 'none';
      successMsg.classList.add('is-visible');
      loadSpotCount();
    }
  } else if (params.get('payment') === 'cancelled' && !sessionStorage.getItem('curric_cancelled')) {
    var notice = document.getElementById('cancelledNotice');
    if (notice) {
      notice.style.display = 'block';
      sessionStorage.setItem('curric_cancelled', '1');
    }
    if (window.history.replaceState) {
      window.history.replaceState({}, '', window.location.pathname);
    }
  }

  if (sessionStorage.getItem('curric_paid')) {
    var paidForm = document.getElementById('waitlistForm');
    var paidMsg = document.getElementById('waitlistSuccess');
    if (paidForm && paidMsg) {
      paidForm.style.display = 'none';
      paidMsg.classList.add('is-visible');
    }
  }

  /* ---- Waitlist Form (Stripe Checkout) ---- */
  var form = document.getElementById('waitlistForm');
  var submitBtn = document.getElementById('waitlistSubmit');

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = document.getElementById('name').value.trim();
      var email = document.getElementById('email').value.trim();
      var country = document.getElementById('country').value;

      if (!name) { alert('Please enter your name.'); return; }
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { alert('Please enter a valid email address.'); return; }
      if (!country) { alert('Please select your country.'); return; }

      var cn = document.getElementById('cancelledNotice');
      if (cn) { cn.style.display = 'none'; }

      submitBtn.classList.add('btn--loading');
      submitBtn.textContent = 'Opening checkout...';

      fetch(SUPABASE_URL + '/functions/v1/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name, email: email, country: country }),
      })
        .then(function (res) {
          if (!res.ok) throw new Error('Server error');
          return res.json();
        })
        .then(function (data) {
          if (data.url) {
            window.location.href = data.url;
          } else {
            throw new Error('No checkout URL');
          }
        })
        .catch(function () {
          submitBtn.classList.remove('btn--loading');
          submitBtn.textContent = 'Get Beta Access \u2014 ' + PRICE_LABEL;
          alert('Could not connect to payment. Please try again.');
        });
    });
  }
})();
