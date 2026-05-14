(function () {
  'use strict';

  /* ---- Mobile Nav Toggle ---- */
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
      var href = this.getAttribute('href');
      if (href === '#') return;
      var target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        var navHeight = 64;
        var targetPos = target.getBoundingClientRect().top + window.pageYOffset - navHeight;
        window.scrollTo({ top: targetPos, behavior: 'smooth' });
      }
    });
  });

  /* ---- Active Nav Link ---- */
  var sections = document.querySelectorAll('section[id]');
  var navLinkEls = document.querySelectorAll('.nav__link:not(.nav__link--cta)');

  function updateActiveLink() {
    var current = '';
    var scrollY = window.pageYOffset + 100;

    sections.forEach(function (section) {
      var top = section.offsetTop;
      var height = section.offsetHeight;
      if (scrollY >= top && scrollY < top + height) {
        current = section.getAttribute('id');
      }
    });

    navLinkEls.forEach(function (link) {
      link.classList.remove('nav__link--active');
      if (link.getAttribute('href') === '#' + current) {
        link.classList.add('nav__link--active');
      }
    });
  }

  window.addEventListener('scroll', updateActiveLink);
  updateActiveLink();

  /* ---- FAQ Accordion (close siblings on open) ---- */
  document.querySelectorAll('.faq__item').forEach(function (item) {
    item.addEventListener('toggle', function () {
      if (item.open) {
        document.querySelectorAll('.faq__item').forEach(function (other) {
          if (other !== item && other.open) {
            other.open = false;
          }
        });
      }
    });
  });

  /* ---- IntersectionObserver Fade-in ---- */
  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    document.querySelectorAll('.fade-in').forEach(function (el) {
      observer.observe(el);
    });
  } else {
    document.querySelectorAll('.fade-in').forEach(function (el) {
      el.classList.add('is-visible');
    });
  }

  /* ---- CTA Form Validation + Success ---- */
  var ctaForm = document.getElementById('ctaForm');
  var ctaSuccess = document.getElementById('ctaSuccess');
  var ctaEmail = document.getElementById('ctaEmail');

  if (ctaForm && ctaEmail && ctaSuccess) {
    ctaForm.addEventListener('submit', function (e) {
      e.preventDefault();

      var email = ctaEmail.value.trim();
      ctaEmail.classList.remove('cta-band__input--error');

      if (!email) {
        ctaEmail.classList.add('cta-band__input--error');
        ctaEmail.focus();
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        ctaEmail.classList.add('cta-band__input--error');
        ctaEmail.focus();
        return;
      }

      ctaForm.querySelector('.cta-band__fields').style.display = 'none';
      ctaSuccess.classList.add('cta-band__success--visible');
    });
  }
})();
