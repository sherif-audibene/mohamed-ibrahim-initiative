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

    document.querySelectorAll('[data-logo]').forEach(img => {
      img.src = 'assets/logo-' + lang + '.png';
    });

    const titles = {
      en: 'Mohamed Ibrahim Initiative — Advancing Young Scientists',
      ar: 'مبادرة محمد إبراهيم — لدعم الجيل القادم من العلماء'
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

      const btn = form.querySelector('button[type="submit"]');
      btn.disabled = true;
      feedback.textContent = dict.formSending;
      feedback.className = 'form-feedback';

      // ponytail: FormSubmit relays to info@ — no backend needed on a static host.
      fetch('https://formsubmit.co/ajax/info@mohamedibrahiminitative.org', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ name, email, _subject: subject, message, _captcha: 'false' })
      })
        .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
        .then(() => {
          feedback.textContent = dict.formSuccess;
          feedback.className = 'form-feedback success';
          form.reset();
        })
        .catch(() => {
          feedback.textContent = dict.formFailed;
          feedback.className = 'form-feedback error';
        })
        .finally(() => { btn.disabled = false; });
    });
  }

  function initCopyEmail() {
    const btn = document.getElementById('copy-email');
    if (!btn) return;
    const label = btn.querySelector('span');

    btn.addEventListener('click', async () => {
      const text = btn.dataset.copy;
      const dict = window.I18N[document.documentElement.lang] || window.I18N.en;
      try {
        // ponytail: execCommand fallback because clipboard API needs a secure context.
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(text);
        } else {
          const ta = document.createElement('textarea');
          ta.value = text;
          ta.setAttribute('readonly', '');
          ta.style.position = 'fixed';
          ta.style.opacity = '0';
          document.body.appendChild(ta);
          ta.select();
          document.execCommand('copy');
          document.body.removeChild(ta);
        }
        label.textContent = dict.copyDone;
      } catch (err) {
        label.textContent = dict.copyFailed;
      }
      setTimeout(() => { label.textContent = dict.copyEmail; }, 2000);
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
    initCopyEmail();
    initYear();
  });
})();
