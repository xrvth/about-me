/* ============================================================
   Julia Ziemba :: portfolio behaviour
   No dependencies. Everything degrades gracefully without JS.
   ============================================================ */
(() => {
  'use strict';

  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Theme ──────────────────────────────────────────────── */
  const root = document.documentElement;
  const STORE_KEY = 'jz-theme';

  const savedTheme = (() => {
    try { return localStorage.getItem(STORE_KEY); } catch { return null; }
  })();
  if (savedTheme) root.dataset.theme = savedTheme;

  $('#themeToggle')?.addEventListener('click', () => {
    const next = root.dataset.theme === 'light' ? 'dark' : 'light';
    root.dataset.theme = next;
    try { localStorage.setItem(STORE_KEY, next); } catch { /* private mode */ }
  });

  /* ── Header state + scroll progress ─────────────────────── */
  const header   = $('#siteHeader');
  const progress = $('#scrollBar');

  const onScroll = () => {
    const y = window.scrollY;
    header?.classList.toggle('is-stuck', y > 24);
    if (progress) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ── Mobile menu ────────────────────────────────────────── */
  const burger = $('#burger');
  const nav    = $('#nav');

  const closeMenu = () => {
    nav?.classList.remove('is-open');
    burger?.setAttribute('aria-expanded', 'false');
  };

  burger?.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', String(open));
  });
  $$('.nav__link').forEach(a => a.addEventListener('click', closeMenu));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });

  /* ── Reveal on scroll ───────────────────────────────────── */
  const revealables = $$('.reveal');

  if ('IntersectionObserver' in window && !reduced) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (!entry.isIntersecting) return;
        // small stagger for siblings entering together
        entry.target.style.transitionDelay = `${Math.min(i * 70, 350)}ms`;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    revealables.forEach(el => io.observe(el));
  } else {
    revealables.forEach(el => el.classList.add('is-in'));
  }

  /* ── Skill meters ───────────────────────────────────────── */
  // Read data-v once and hand it to CSS as --w; the fill animates on .is-in.
  $$('.meters li').forEach(li => {
    li.style.setProperty('--w', `${li.dataset.v || 0}%`);
  });

  /* ── Animated hero counters ─────────────────────────────── */
  const counters = $$('[data-count]');

  const runCounter = (el) => {
    const target = Number(el.dataset.count);
    const suffix = el.dataset.suffix ?? '';
    if (!Number.isFinite(target) || reduced) { el.textContent = target + suffix; return; }

    const duration = 1100;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  if ('IntersectionObserver' in window) {
    const cio = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        runCounter(e.target);
        cio.unobserve(e.target);
      });
    }, { threshold: 0.6 });
    counters.forEach(el => cio.observe(el));
  }

  /* ── Active section highlighting ────────────────────────── */
  const sections  = $$('main section[id]');
  const navLinks  = $$('.nav__link');
  const railLinks = $$('.rail a');

  const setActive = (id) => {
    navLinks.forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === `#${id}`));
    railLinks.forEach(a => a.classList.toggle('is-active', a.dataset.rail === id));
  };

  if ('IntersectionObserver' in window && sections.length) {
    const sio = new IntersectionObserver((entries) => {
      // pick the entry closest to the top of the viewport that is visible
      const visible = entries.filter(e => e.isIntersecting)
                             .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (visible[0]) setActive(visible[0].target.id);
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
    sections.forEach(s => sio.observe(s));
  }

  /* ── Character card tilt ────────────────────────────────── */
  const tiltEl = $('[data-tilt]');
  if (tiltEl && !reduced && window.matchMedia('(hover: hover)').matches) {
    const MAX = 7;
    tiltEl.addEventListener('pointermove', (e) => {
      const r = tiltEl.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width  - 0.5;
      const py = (e.clientY - r.top)  / r.height - 0.5;
      tiltEl.style.transform =
        `rotateY(${px * MAX}deg) rotateX(${-py * MAX}deg) translateZ(0)`;
    });
    tiltEl.addEventListener('pointerleave', () => { tiltEl.style.transform = ''; });
  }

  /* ── Contact form → mailto ──────────────────────────────── */
  const form   = $('#contactForm');
  const status = $('#formStatus');
  const EMAIL  = 'juliamariaziemba@gmail.com';

  form?.addEventListener('submit', (e) => {
    e.preventDefault();

    const fields = ['#cf-name', '#cf-subject', '#cf-msg'].map(s => $(s));
    let ok = true;
    fields.forEach(f => {
      const bad = !f.value.trim();
      f.closest('.field')?.classList.toggle('is-bad', bad);
      if (bad) ok = false;
    });

    if (!ok) {
      if (status) status.textContent = 'Please fill in all three fields.';
      return;
    }

    const [name, subject, message] = fields.map(f => f.value.trim());
    const body = `${message}\n\n- ${name}`;
    const href = `mailto:${EMAIL}` +
                 `?subject=${encodeURIComponent(subject)}` +
                 `&body=${encodeURIComponent(body)}`;

    window.location.href = href;
    if (status) status.textContent = 'Opening your mail app…';
    toast('Draft handed to your mail app ✉');
  });

  /* ── Back to top ────────────────────────────────────────── */
  $('#toTop')?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
  });

  /* ── Year ───────────────────────────────────────────────── */
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ── Toast helper ───────────────────────────────────────── */
  let toastTimer;
  function toast(msg) {
    const el = $('#toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('is-on'), 2600);
  }

  /* ── Ambient sparks ─────────────────────────────────────── */
  const canvas = $('#sparks');
  if (canvas && !reduced) {
    const ctx = canvas.getContext('2d');
    let w, h, dpr, particles = [], raf;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.width  = Math.floor(innerWidth  * dpr);
      h = canvas.height = Math.floor(innerHeight * dpr);
      canvas.style.width  = innerWidth  + 'px';
      canvas.style.height = innerHeight + 'px';

      const count = Math.min(Math.round(innerWidth / 22), 70);
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: (Math.random() * 1.6 + 0.4) * dpr,
        vy: -(Math.random() * 0.28 + 0.06) * dpr,
        vx: (Math.random() - 0.5) * 0.16 * dpr,
        a: Math.random() * 0.5 + 0.15,
        tw: Math.random() * Math.PI * 2
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (const p of particles) {
        p.y += p.vy;
        p.x += p.vx;
        p.tw += 0.02;
        if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; }
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;

        const alpha = p.a * (0.6 + 0.4 * Math.sin(p.tw));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(79, 227, 255, ${alpha})`;
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };

    resize();
    draw();
    addEventListener('resize', resize);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) cancelAnimationFrame(raf);
      else raf = requestAnimationFrame(draw);
    });
  }

  /* ── Konami easter egg ──────────────────────────────────── */
  const SEQ = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
  let pos = 0;
  document.addEventListener('keydown', (e) => {
    const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    pos = (key === SEQ[pos]) ? pos + 1 : (key === SEQ[0] ? 1 : 0);
    if (pos === SEQ.length) {
      pos = 0;
      root.classList.toggle('party');
      toast(root.classList.contains('party') ? '★ 5-star pull! party mode on' : 'party mode off');
    }
  });

  /* ── Console hello ──────────────────────────────────────── */
  console.log(
    '%c hi! %c you found the console. that\'s very QA of you. love, julia',
    'background:#4FE3FF;color:#04070f;font-weight:700;padding:2px 6px;border-radius:4px',
    'color:#7683b3'
  );
})();
