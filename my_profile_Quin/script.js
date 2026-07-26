/* =========================================================
   Mr Lii — portfolio interactions
   Plain JS, no dependencies.
   ========================================================= */

(function () {
    'use strict';

    var header = document.getElementById('siteHeader');
    var toggle = document.getElementById('navToggle');
    var navLinks = document.getElementById('navLinks');

    /* ---------- 1. Sticky header state ---------- */
    function onScroll() {
        header.classList.toggle('is-stuck', window.scrollY > 40);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    /* ---------- 2. Mobile menu ---------- */
    function closeMenu() {
        navLinks.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Open menu');
    }

    toggle.addEventListener('click', function () {
        var open = navLinks.classList.toggle('is-open');
        toggle.setAttribute('aria-expanded', String(open));
        toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });

    // Close after tapping a link, or on Escape.
    navLinks.addEventListener('click', function (e) {
        if (e.target.tagName === 'A') closeMenu();
    });
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeMenu();
    });

    /* ---------- 3. Scroll reveal ---------- */
    var revealables = document.querySelectorAll('.reveal');

    if ('IntersectionObserver' in window) {
        var revealer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('is-visible');
                revealer.unobserve(entry.target);
            });
        }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

        revealables.forEach(function (el, i) {
            // Stagger siblings slightly so grids cascade instead of popping.
            el.style.transitionDelay = (i % 4) * 80 + 'ms';
            revealer.observe(el);
        });
    } else {
        revealables.forEach(function (el) { el.classList.add('is-visible'); });
    }

    /* ---------- 4. Active nav link on scroll ---------- */
    var sections = document.querySelectorAll('section[id]');
    var linkFor = {};
    // The CTA shares #contact with the Contact link — skip it so the plain
    // nav link is the one that gets highlighted.
    navLinks.querySelectorAll('a[href^="#"]:not(.nav-cta)').forEach(function (a) {
        linkFor[a.getAttribute('href').slice(1)] = a;
    });

    if ('IntersectionObserver' in window) {
        var spy = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                var link = linkFor[entry.target.id];
                if (!link) return;
                if (entry.isIntersecting) {
                    Object.keys(linkFor).forEach(function (id) {
                        linkFor[id].classList.remove('is-active');
                    });
                    link.classList.add('is-active');
                }
            });
        }, { rootMargin: '-45% 0px -50% 0px' });

        sections.forEach(function (s) { spy.observe(s); });
    }

    /* ---------- 5. Project filter ---------- */
    var filters = document.getElementById('filters');
    var cards = document.querySelectorAll('#projectGrid .card');
    var emptyNote = document.getElementById('emptyNote');

    if (filters) {
        filters.addEventListener('click', function (e) {
            var btn = e.target.closest('.filter');
            if (!btn) return;

            filters.querySelectorAll('.filter').forEach(function (b) {
                b.classList.toggle('is-active', b === btn);
            });

            var want = btn.dataset.filter;
            var shown = 0;

            cards.forEach(function (card) {
                var match = want === 'all' || card.dataset.cat === want;
                card.classList.toggle('is-hidden', !match);
                if (match) shown++;
            });

            emptyNote.hidden = shown > 0;
        });
    }

    /* ---------- 6. Count-up stats ---------- */
    var counters = document.querySelectorAll('[data-count]');
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function countUp(el) {
        var target = parseInt(el.dataset.count, 10);
        if (isNaN(target) || reduceMotion) return;

        var start = performance.now();
        var duration = 1200;

        function step(now) {
            var p = Math.min((now - start) / duration, 1);
            // ease-out so it decelerates into the final number
            el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
            if (p < 1) requestAnimationFrame(step);
        }
        el.textContent = '0';
        requestAnimationFrame(step);
    }

    if ('IntersectionObserver' in window) {
        var counterObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                countUp(entry.target);
                counterObserver.unobserve(entry.target);
            });
        }, { threshold: 0.6 });

        counters.forEach(function (el) { counterObserver.observe(el); });
    }
})();
