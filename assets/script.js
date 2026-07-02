// Mobile menu toggle
const burger = document.getElementById('burgerBtn');
const mobileMenu = document.getElementById('mobileMenu');
if (burger && mobileMenu) {
  burger.addEventListener('click', () => {
    burger.classList.toggle('open');
    mobileMenu.classList.toggle('open');
  });
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      burger.classList.remove('open');
      mobileMenu.classList.remove('open');
    });
  });
}

// Sticky CTA visibility: hidden over hero and over footer (both have their own CTA)
const stickyCta = document.getElementById('stickyCta');
const heroEl = document.querySelector('.photo-hero');
const footerEl = document.querySelector('footer');
if (stickyCta && heroEl && footerEl) {
  let heroVisible = true;
  let footerVisible = false;
  const updateStickyCta = () => stickyCta.classList.toggle('show', !heroVisible && !footerVisible);

  const heroObserver = new IntersectionObserver(([entry]) => {
    heroVisible = entry.isIntersecting;
    updateStickyCta();
  }, { threshold: 0.1 });
  heroObserver.observe(heroEl);

  const footerObserver = new IntersectionObserver(([entry]) => {
    footerVisible = entry.isIntersecting;
    updateStickyCta();
  }, { threshold: 0.05 });
  footerObserver.observe(footerEl);
}

// Reveal on scroll
const revealEls = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });
revealEls.forEach(el => revealObserver.observe(el));

// Carousels (reviews, services, ...): continuous CSS marquee, truly infinite, never pauses
document.querySelectorAll('.carousel-wrap').forEach(wrap => {
  const track = wrap.querySelector('.carousel-track');
  if (!track) return;
  const prevBtn = wrap.querySelector('.carousel-arrow.prev');
  const nextBtn = wrap.querySelector('.carousel-arrow.next');

  // Duplicate the item set once: the CSS animation moves exactly -50% (one set's
  // width), so the loop point always lines up pixel-perfectly with no JS math.
  const originalItems = Array.from(track.children);
  originalItems.forEach(item => {
    const clone = item.cloneNode(true);
    clone.classList.remove('reveal', 'reveal-delay-1', 'reveal-delay-2', 'reveal-delay-3');
    track.appendChild(clone);
  });

  const visibleCount = () => window.innerWidth <= 760 ? 1 : window.innerWidth <= 960 ? 2 : 3;
  const gap = parseFloat(getComputedStyle(track).columnGap) || 26;
  const secondsPerCard = 2.5;

  // Only touch the animation's CSS custom properties when the width actually
  // changed by a meaningful amount, so mobile browser-chrome resize events
  // (address bar show/hide) don't restart or jitter the marquee needlessly.
  let lastCardWidth = null;
  const sizeTrack = () => {
    const count = visibleCount();
    const cardWidth = (wrap.clientWidth - gap * (count - 1)) / count;
    if (lastCardWidth !== null && Math.abs(cardWidth - lastCardWidth) < 1) return;
    lastCardWidth = cardWidth;
    track.style.setProperty('--card-width', cardWidth + 'px');
    track.style.setProperty('--marquee-duration', (originalItems.length * secondsPerCard) + 's');
  };
  sizeTrack();
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(sizeTrack, 200);
  });

  const nudge = (dir) => {
    const anim = track.getAnimations()[0];
    if (!anim) return;
    const durationMs = parseFloat(getComputedStyle(track).animationDuration) * 1000;
    let next = (anim.currentTime || 0) + dir * secondsPerCard * 1000;
    if (durationMs > 0) {
      // Wrap into [0, durationMs) so it can never go negative and freeze the animation
      next = ((next % durationMs) + durationMs) % durationMs;
    }
    anim.currentTime = next;
  };
  if (nextBtn) nextBtn.addEventListener('click', () => nudge(1));
  if (prevBtn) prevBtn.addEventListener('click', () => nudge(-1));
});

// Booking form: sends the request to a serverless function that notifies the owner on Telegram
const bookingForm = document.getElementById('bookingForm');
if (bookingForm) {
  const statusEl = document.getElementById('bookingStatus');
  const nameInput = document.getElementById('bf-name');
  const phoneInput = document.getElementById('bf-phone');
  const dateInput = document.getElementById('bf-date');
  const nameError = document.getElementById('bf-name-error');
  const phoneError = document.getElementById('bf-phone-error');
  const dateError = document.getElementById('bf-date-error');

  // Never allow picking a date that's already in the past
  const todayISO = new Date().toISOString().split('T')[0];
  dateInput.setAttribute('min', todayISO);

  // Dates the owner has marked as closed (fetched once, checked on every date change)
  let closedDates = [];
  fetch('/api/closed-dates').then((r) => r.json()).then((d) => { closedDates = d.dates || []; }).catch(() => {});

  // Open the native calendar picker straight away instead of making the user
  // aim for the tiny icon or type the date by hand
  const openDatePicker = () => { try { dateInput.showPicker(); } catch (err) {} };
  dateInput.addEventListener('focus', openDatePicker);
  dateInput.addEventListener('click', openDatePicker);

  // Toggle whether the custom "Alege o dată" placeholder or the real value shows
  const syncDateValueState = () => dateInput.classList.toggle('has-value', !!dateInput.value);
  dateInput.addEventListener('change', syncDateValueState);
  syncDateValueState();

  const NAME_RE = /^[A-Za-zĂÂÎȘȚăâîșțŞŢşţ]{2,}(\s+[A-Za-zĂÂÎȘȚăâîșțŞŢşţ]{2,})+$/;
  const PHONE_RE = /^\+373[0-9]{8}$/;

  const validateName = () => {
    const ok = NAME_RE.test(nameInput.value.trim());
    nameError.textContent = ok ? '' : 'Introdu numele și prenumele complet.';
    return ok;
  };
  const validatePhone = () => {
    const digits = phoneInput.value.replace(/[\s()-]/g, '');
    const ok = PHONE_RE.test(digits);
    phoneError.textContent = ok ? '' : 'Format: +373 urmat de 8 cifre (ex: +373 691 23 456).';
    return ok;
  };
  const validateDate = () => {
    if (!dateInput.value) { dateError.textContent = ''; return true; }
    if (dateInput.value < todayISO) {
      dateError.textContent = 'Alege o dată din prezent sau din viitor.';
      return false;
    }
    if (closedDates.includes(dateInput.value)) {
      dateError.textContent = 'Această zi este nelucrătoare. Te rugăm să alegi altă dată.';
      return false;
    }
    dateError.textContent = '';
    return true;
  };

  nameInput.addEventListener('blur', validateName);
  phoneInput.addEventListener('blur', validatePhone);
  dateInput.addEventListener('change', validateDate);

  bookingForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nameOk = validateName();
    const phoneOk = validatePhone();
    const dateOk = validateDate();
    if (!nameOk || !phoneOk || !dateOk) return;

    const submitBtn = bookingForm.querySelector('button[type="submit"]');
    const data = Object.fromEntries(new FormData(bookingForm));

    submitBtn.disabled = true;
    statusEl.textContent = 'Se trimite...';
    statusEl.className = 'booking-status';

    try {
      const response = await fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Eroare necunoscută');
      statusEl.textContent = 'Mulțumim! Te contactăm în curând pentru confirmare.';
      statusEl.classList.add('success');
      bookingForm.reset();
    } catch (err) {
      statusEl.textContent = 'Nu am putut trimite cererea. Sună-ne la +373 608 58 486.';
      statusEl.classList.add('error');
    } finally {
      submitBtn.disabled = false;
    }
  });
}

// Lightbox for gallery pages
const lightbox = document.getElementById('lightbox');
if (lightbox) {
  const lightboxImg = lightbox.querySelector('img');
  const lightboxCaption = lightbox.querySelector('.lightbox-caption');
  const closeBtn = lightbox.querySelector('.lightbox-close');

  document.querySelectorAll('.gallery-item').forEach(item => {
    item.addEventListener('click', () => {
      const img = item.querySelector('img');
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt;
      lightboxCaption.textContent = img.alt;
      lightbox.classList.add('open');
    });
  });

  const closeLightbox = () => lightbox.classList.remove('open');
  closeBtn.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLightbox(); });
}
