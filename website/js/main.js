(function () {
  'use strict';

  /* ---- Supabase ---- */
  const SUPABASE_URL = 'https://hvynpslokgslpmekqwmg.supabase.co';
  const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2eW5wc2xva2dzbHBtZWtxd21nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3NjQwMjgsImV4cCI6MjA5NDM0MDAyOH0.ZlwsneuKHDEeYHNktEqq15Sk-iZt-vQsOeGMHXggbK0';
  var supabase = null;
  if (typeof supabaseClient !== 'undefined') {
    supabase = supabaseClient.createClient(SUPABASE_URL, SUPABASE_KEY);
  }

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

  /* ---- Waitlist Form (Supabase) ---- */
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
      submitBtn.textContent = 'Joining...';

      if (supabase) {
        supabase
          .from('waitlist')
          .insert({ name: name, email: email })
          .then(function (result) {
            submitBtn.classList.remove('btn--loading');
            submitBtn.textContent = 'Join the Waitlist';
            if (result.error) {
              if (result.error.code === '23505') {
                alert('This email is already on the waitlist!');
              } else {
                alert('Something went wrong. Please try again.');
              }
              return;
            }
            form.style.display = 'none';
            success.classList.add('is-visible');
          });
      } else {
        // Fallback: show success without backend
        submitBtn.classList.remove('btn--loading');
        submitBtn.textContent = 'Join the Waitlist';
        form.style.display = 'none';
        success.classList.add('is-visible');
      }
    });
  }
})();
