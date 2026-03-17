// ── CURSOR ──────────────────────────────────────────────
const cursor   = document.getElementById('cursor');
const follower = document.getElementById('cursorFollower');
let mouseX = 0, mouseY = 0, followerX = 0, followerY = 0;

document.addEventListener('mousemove', e => {
  mouseX = e.clientX; mouseY = e.clientY;
  cursor.style.left = mouseX + 'px';
  cursor.style.top  = mouseY + 'px';
});
(function af() {
  followerX += (mouseX - followerX) * 0.12;
  followerY += (mouseY - followerY) * 0.12;
  follower.style.left = followerX + 'px';
  follower.style.top  = followerY + 'px';
  requestAnimationFrame(af);
})();
function bindCursorHover() {
  document.querySelectorAll('a, button, .faq-question, .master-card, .gallery-item, .service-card, .srv-card, .news-card').forEach(el => {
    el.addEventListener('mouseenter', () => { cursor.classList.add('hover');    follower.classList.add('hover'); });
    el.addEventListener('mouseleave', () => { cursor.classList.remove('hover'); follower.classList.remove('hover'); });
  });
}
bindCursorHover();

// ── SMOOTH SCROLL ────────────────────────────────────────
const navbar = document.getElementById('navbar');
const ss = { cur: 0, tgt: 0, ease: 0.09 };

function initSmoothScroll() {
  if (window.innerWidth < 768) {
    window.addEventListener('scroll', () => navbar.classList.toggle('scrolled', window.scrollY > 60));
    return;
  }
  document.documentElement.style.overflow = 'hidden';
  document.body.style.overflow = 'hidden';

  const fixed = [cursor, follower,
                 document.getElementById('cookieBanner'),
                 document.getElementById('privacyPopup'),
                 navbar];

  const scroller = document.createElement('div');
  scroller.id = 'smooth-scroller';
  scroller.style.cssText = 'position:fixed;top:0;left:0;width:100%;will-change:transform;';
  Array.from(document.body.childNodes).forEach(n => { if (!fixed.includes(n)) scroller.appendChild(n); });
  document.body.appendChild(scroller);

  function setH() { document.body.style.height = scroller.scrollHeight + 'px'; }
  setH();
  window.addEventListener('resize', setH);

  window.addEventListener('wheel', e => {
    ss.tgt += e.deltaY;
    ss.tgt = Math.max(0, Math.min(ss.tgt, scroller.scrollHeight - window.innerHeight));
  }, { passive: true });

  window.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown') ss.tgt += 120;
    if (e.key === 'ArrowUp')   ss.tgt -= 120;
    if (e.key === 'PageDown')  ss.tgt += window.innerHeight * 0.9;
    if (e.key === 'PageUp')    ss.tgt -= window.innerHeight * 0.9;
    if (e.key === 'Home')      ss.tgt  = 0;
    if (e.key === 'End')       ss.tgt  = scroller.scrollHeight - window.innerHeight;
    ss.tgt = Math.max(0, Math.min(ss.tgt, scroller.scrollHeight - window.innerHeight));
  });

  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      if (id === '#') return;
      const t = scroller.querySelector(id);
      if (t) {
        e.preventDefault();
        ss.tgt = ss.cur + t.getBoundingClientRect().top - 80;
        ss.tgt = Math.max(0, Math.min(ss.tgt, scroller.scrollHeight - window.innerHeight));
      }
    });
  });

  (function raf() {
    ss.cur += (ss.tgt - ss.cur) * ss.ease;
    if (Math.abs(ss.tgt - ss.cur) < 0.05) ss.cur = ss.tgt;
    scroller.style.transform = `translateY(${-ss.cur}px)`;
    navbar.classList.toggle('scrolled', ss.cur > 60);
    requestAnimationFrame(raf);
  })();

  setTimeout(() => {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: 0.08 });
    scroller.querySelectorAll('.fade-up').forEach(el => obs.observe(el));
    bindCursorHover();
  }, 120);

  // Handle hash on load (e.g. from index.html#faq)
  setTimeout(() => {
    const hash = window.location.hash;
    if (hash && hash !== '#') {
      const t = scroller.querySelector(hash);
      if (t) {
        ss.tgt = ss.cur + t.getBoundingClientRect().top - 80;
        ss.tgt = Math.max(0, Math.min(ss.tgt, scroller.scrollHeight - window.innerHeight));
      }
    }
  }, 300);
}
initSmoothScroll();

// ── FADE-UP FALLBACK ─────────────────────────────────────
const fo = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.08 });
document.querySelectorAll('.fade-up').forEach(el => fo.observe(el));

// ── COUNTER ANIMATION ────────────────────────────────────
function animateCounter(el) {
  const target   = parseInt(el.dataset.count);
  const suffix   = el.dataset.suffix || '';
  const duration = 1800;
  const start    = performance.now();
  (function tick(now) {
    const p = Math.min((now - start) / duration, 1);
    const e = 1 - Math.pow(1 - p, 4);
    el.textContent = Math.round(e * target).toLocaleString('ru-RU') + suffix;
    if (p < 1) requestAnimationFrame(tick);
  })(start);
}
const statsBlockFallback = document.querySelector('.intro-stats');
if (statsBlockFallback) {
  const cObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('.stat-num[data-count]').forEach(animateCounter);
        cObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });
  cObs.observe(statsBlockFallback);
}

// ── FAQ ──────────────────────────────────────────────────
function toggleFaq(el) {
  const item   = el.parentElement;
  const isOpen = item.classList.contains('open');
  document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));
  if (!isOpen) item.classList.add('open');
}

// ── COOKIE ───────────────────────────────────────────────
function acceptCookies()  { document.getElementById('cookieBanner').classList.add('hidden'); localStorage.setItem('cookiesAccepted','true'); }
function declineCookies() { document.getElementById('cookieBanner').classList.add('hidden'); localStorage.setItem('cookiesAccepted','false'); }
if (localStorage.getItem('cookiesAccepted')) document.getElementById('cookieBanner').classList.add('hidden');

// ── PRIVACY POPUP ─────────────────────────────────────────
function openPrivacy(e) {
  if (e) e.preventDefault();
  const p = document.getElementById('privacyPopup');
  if (p) p.style.display = 'flex';
}
function closePrivacy() {
  const p = document.getElementById('privacyPopup');
  if (p) p.style.display = 'none';
}
// Bind all privacy links on page
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('a').forEach(a => {
    const txt = a.textContent.toLowerCase();
    const href = a.getAttribute('href') || '';
    if ((txt.includes('конфиденциальн') || txt.includes('privacy')) && (href === '#' || href === '')) {
      a.addEventListener('click', openPrivacy);
    }
  });
  // Close popup on backdrop click
  const popup = document.getElementById('privacyPopup');
  if (popup) {
    popup.addEventListener('click', e => { if (e.target === popup) closePrivacy(); });
  }
});

// ── FORM ─────────────────────────────────────────────────
function submitForm(btn) {
  const orig = btn.textContent;
  btn.textContent = 'Отправляем...'; btn.disabled = true;
  setTimeout(() => {
    btn.textContent = '✓ Заявка отправлена'; btn.style.background = '#2a2a2a';
    setTimeout(() => { btn.textContent = orig; btn.disabled = false; btn.style.background = ''; }, 3000);
  }, 1200);
}

// ── DARK SCROLL ──────────────────────────────────────────
// Change scrollbar color based on background at current scroll position
(function initDarkScroll() {
  const darkBg = ['#0a0a0a', '#111', 'rgb(10, 10, 10)', 'rgb(17, 17, 17)', 'black'];
  function isDarkSection() {
    const y = typeof ss !== 'undefined' ? ss.cur + window.innerHeight * 0.5 : window.scrollY + window.innerHeight * 0.5;
    const el = document.elementFromPoint(window.innerWidth - 8, Math.min(y, document.documentElement.scrollHeight - 1));
    if (!el) return false;
    const bg = getComputedStyle(el).backgroundColor;
    return bg === 'rgb(10, 10, 10)' || bg === 'rgb(17, 17, 17)' || bg === 'rgb(0, 0, 0)';
  }
  let rafId;
  function checkScroll() {
    if (isDarkSection()) {
      document.body.classList.add('dark-scroll');
    } else {
      document.body.classList.remove('dark-scroll');
    }
    rafId = requestAnimationFrame(checkScroll);
  }
  // Start checking
  setTimeout(() => { checkScroll(); }, 500);
})();
