(function () {
  'use strict';

  /* ---- Supabase ---- */
  const SUPABASE_URL = 'https://hvynpslokgslpmekqwmg.supabase.co';
  const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2eW5wc2xva2dzbHBtZWtxd21nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3NjQwMjgsImV4cCI6MjA5NDM0MDAyOH0.ZlwsneuKHDEeYHNktEqq15Sk-iZt-vQsOeGMHXggbK0';
  var supabase = null;
  if (typeof supabaseClient !== 'undefined') {
    supabase = supabaseClient.createClient(SUPABASE_URL, SUPABASE_KEY);
  }

  /* ---- Load Sample Jobs from Supabase ---- */
  function loadJobs() {
    var grid = document.getElementById('listingsGrid');
    if (!grid || !supabase) return;

    supabase
      .from('jobs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(4)
      .then(function (result) {
        if (result.error || !result.data || result.data.length === 0) {
          grid.innerHTML = '<div class="listing-card__loading">No sample listings available right now.</div>';
          return;
        }

        grid.innerHTML = '';
        result.data.forEach(function (job, i) {
          var card = document.createElement('div');
          card.className = 'listing-card';
          card.style.transitionDelay = (i * 0.1) + 's';
          card.innerHTML =
            '<div class="listing-card__title">' + escapeHtml(job.title) + '</div>' +
            '<div class="listing-card__meta">' +
              '<span class="listing-card__tag"><strong>Country:</strong> ' + escapeHtml(job.country) + '</span>' +
              '<span class="listing-card__tag"><strong>Salary:</strong> ' + escapeHtml(job.salary) + '</span>' +
              '<span class="listing-card__tag"><strong>Type:</strong> ' + escapeHtml(job.type) + '</span>' +
              '<span class="listing-card__tag"><strong>Eligibility:</strong> ' + escapeHtml(job.eligibility) + '</span>' +
            '</div>' +
            '<div class="listing-card__school">' + escapeHtml(job.school) + '</div>';

          grid.appendChild(card);

          // Fade in with delay
          setTimeout(function () { card.classList.add('is-visible'); }, i * 100);
        });
      });
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  /* ---- Count Signups & Update Spot Counter ---- */
  function loadSpotCount() {
    var spotEl = document.getElementById('spotCount');
    if (!spotEl || !supabase) return;

    supabase
      .from('waitlist')
      .select('id', { count: 'exact', head: true })
      .then(function (result) {
        if (result.error) return;
        var count = result.count || 0;
        var remaining = Math.max(0, 15 - count);
        spotEl.textContent = '— only ' + remaining + ' of 15 beta spots left';
        if (remaining <= 0) {
          spotEl.textContent = '— beta is full. Join the waitlist for the public launch.';
        }
      });
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
        var offset = 70;
        var pos = target.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top: pos, behavior: 'smooth' });
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
      var top = s.offsetTop;
      var height = s.offsetHeight;
      if (scrollY >= top && scrollY < top + height) {
        current = s.getAttribute('id');
      }
    });
    navLinkEls.forEach(function (link) {
      link.style.color = '';
      if (link.getAttribute('href') === '#' + current) {
        link.style.color = 'var(--color-ink-strong)';
      }
    });
  }

  window.addEventListener('scroll', updateActiveLink);

  /* ---- Scroll Fade-in ---- */
  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    document.querySelectorAll('.fade-in').forEach(function (el) { observer.observe(el); });
  } else {
    document.querySelectorAll('.fade-in').forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---- Handle Payment Result on Page Load ---- */
  var params = new URLSearchParams(window.location.search);
  if (params.get('payment') === 'success') {
    var form = document.getElementById('waitlistForm');
    var success = document.getElementById('waitlistSuccess');
    if (form && success) {
      form.style.display = 'none';
      success.classList.add('is-visible');
      // Refresh spot count after signup
      loadSpotCount();
    }
  } else if (params.get('payment') === 'cancelled') {
    var notice = document.getElementById('cancelledNotice');
    if (notice) { notice.style.display = 'block'; }
    if (window.history.replaceState) {
      window.history.replaceState({}, '', window.location.pathname);
    }
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

      if (!name) { alert('Please enter your name.'); return; }
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        alert('Please enter a valid email address.');
        return;
      }

      submitBtn.classList.add('btn--loading');
      submitBtn.textContent = 'Opening checkout...';

      // Insert into Supabase waitlist directly
      if (supabase) {
        supabase
          .from('waitlist')
          .insert({ name: name, email: email })
          .then(function (result) {
            if (result.error) {
              if (result.error.code === '23505') {
                alert('This email is already on the waitlist!');
                submitBtn.classList.remove('btn--loading');
                submitBtn.textContent = 'Get Beta Access \u2014 $1';
                return;
              }
            }
            // Show success regardless (duplicate also ok)
            form.style.display = 'none';
            success.classList.add('is-visible');
            loadSpotCount();
          });
      } else {
        // Fallback
        form.style.display = 'none';
        success.classList.add('is-visible');
      }
    });
  }
})();
