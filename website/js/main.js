(function () {
  'use strict';

  /* ---- Supabase REST (direct fetch, no client library needed) ---- */
  const SUPABASE_URL = 'https://hvynpslokgslpmekqwmg.supabase.co';
  const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2eW5wc2xva2dzbHBtZWtxd21nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3NjQwMjgsImV4cCI6MjA5NDM0MDAyOH0.ZlwsneuKHDEeYHNktEqq15Sk-iZt-vQsOeGMHXggbK0';
  var sbHeaders = {
    'apikey': SUPABASE_KEY,
    'Authorization': 'Bearer ' + SUPABASE_KEY,
    'Content-Type': 'application/json',
    'Prefer': 'return=minimal'
  };

  function sbFetch(method, table, body) {
    var opts = { method: method, headers: sbHeaders };
    if (body) { opts.body = JSON.stringify(body); }
    return fetch(SUPABASE_URL + '/rest/v1/' + table, opts).then(function (r) { return r.json(); });
  }

  /* ---- Load Sample Jobs from Supabase ---- */
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

  /* ---- Count Signups & Update Spot Counter ---- */
  function loadSpotCount() {
    var spotEl = document.getElementById('spotCount');
    if (!spotEl) return;

    fetch(SUPABASE_URL + '/rest/v1/waitlist?id=select:count&limit=0', {
      headers: sbHeaders
    }).then(function (r) { return r.json(); })
    .then(function (data) {
      var count = data.length || 0;
      var remaining = Math.max(0, 15 - count);
      spotEl.textContent = '\u2014 only ' + remaining + ' of 15 beta spots left';
      if (remaining <= 0) {
        spotEl.textContent = '\u2014 beta is full. Join the waitlist for the public launch.';
      }
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
  }

  /* ---- Smooth Scroll ---- */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var target = document.querySelector(this.getAttribute('href'));
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
      link.style.color = '';
      if (link.getAttribute('href') === '#' + current) link.style.color = 'var(--color-ink-strong)';
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

  /* ---- Waitlist Form ---- */
  var form = document.getElementById('waitlistForm');
  var success = document.getElementById('waitlistSuccess');
  var submitBtn = document.getElementById('waitlistSubmit');

  if (form && success) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = document.getElementById('name').value.trim();
      var email = document.getElementById('email').value.trim();
      var country = document.getElementById('country').value;

      if (!name) { alert('Please enter your name.'); return; }
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { alert('Please enter a valid email address.'); return; }
      if (!country) { alert('Please select your country.'); return; }

      submitBtn.classList.add('btn--loading');
      submitBtn.textContent = 'Signing up...';

      sbFetch('POST', 'waitlist', { name: name, email: email, country: country })
        .then(function (result) {
          submitBtn.classList.remove('btn--loading');
          submitBtn.textContent = 'Get Beta Access \u2014 $1';
          form.style.display = 'none';
          success.classList.add('is-visible');
          loadSpotCount();
        })
        .catch(function () {
          submitBtn.classList.remove('btn--loading');
          submitBtn.textContent = 'Get Beta Access \u2014 $1';
          alert('Something went wrong. Please try again.');
        });
    });
  }
})();
