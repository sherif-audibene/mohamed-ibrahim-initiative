(function () {
  'use strict';

  const STORAGE_KEY = 'mi-lang';
  const SUPPORTED = ['en', 'ar'];

  function getInitialLang() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && SUPPORTED.includes(saved)) return saved;
    const nav = (navigator.language || 'en').toLowerCase();
    return nav.startsWith('ar') ? 'ar' : 'en';
  }

  function applyLang(lang) {
    const dict = window.I18N[lang];
    if (!dict) return;

    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';

    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (dict[key] != null) {
        el.innerHTML = dict[key];
      }
    });

    const titles = {
      en: 'Mohamed Ibrahim Initiative — Advancing Young Scientists',
      ar: 'مبادرة محمد إبراهيم — نهضةٌ بالعلماء الشباب'
    };
    document.title = titles[lang];

    const toggle = document.getElementById('lang-toggle');
    if (toggle) {
      const cur = toggle.querySelector('.lang-current');
      const other = toggle.querySelector('.lang-other');
      if (lang === 'ar') {
        cur.textContent = 'ع';
        other.textContent = 'EN';
        toggle.setAttribute('aria-label', 'التبديل إلى الإنجليزية');
      } else {
        cur.textContent = 'EN';
        other.textContent = 'ع';
        toggle.setAttribute('aria-label', 'Switch to Arabic');
      }
    }

    localStorage.setItem(STORAGE_KEY, lang);
  }

  function initLangToggle() {
    const btn = document.getElementById('lang-toggle');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const next = document.documentElement.lang === 'ar' ? 'en' : 'ar';
      applyLang(next);
    });
  }

  function initNavToggle() {
    const btn = document.querySelector('.nav-toggle');
    const list = document.getElementById('nav-list');
    if (!btn || !list) return;
    btn.addEventListener('click', () => {
      const open = list.classList.toggle('open');
      btn.setAttribute('aria-expanded', String(open));
    });
    list.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        list.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  function initReveal() {
    if (!('IntersectionObserver' in window)) return;
    const targets = document.querySelectorAll('.section, .card, .panel, .awardee, .hero-text, .hero-portrait');
    targets.forEach(t => t.classList.add('reveal'));
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    targets.forEach(t => io.observe(t));
  }

  function initForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;
    const feedback = document.getElementById('cf-feedback');

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const lang = document.documentElement.lang;
      const dict = window.I18N[lang] || window.I18N.en;

      const data = new FormData(form);
      const name = (data.get('name') || '').toString().trim();
      const email = (data.get('email') || '').toString().trim();
      const subject = (data.get('subject') || '').toString().trim();
      const message = (data.get('message') || '').toString().trim();

      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      if (!name || !emailOk || !subject || !message) {
        feedback.textContent = dict.formError;
        feedback.className = 'form-feedback error';
        return;
      }

      const body = `Name: ${name}\nEmail: ${email}\n\n${message}`;
      const mailto = `mailto:Info@Mohamedibrahiminitiative.org?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.location.href = mailto;

      feedback.textContent = dict.formSuccess;
      feedback.className = 'form-feedback success';
      form.reset();
    });
  }

  function initYear() {
    const el = document.getElementById('year');
    if (el) el.textContent = new Date().getFullYear();
  }

  document.addEventListener('DOMContentLoaded', () => {
    applyLang(getInitialLang());
    initLangToggle();
    initNavToggle();
    initReveal();
    initForm();
    initYear();
  });
})();
