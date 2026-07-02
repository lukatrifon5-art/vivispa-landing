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
  const secondsPerCard = 1;

  const sizeTrack = () => {
    const count = visibleCount();
    const cardWidth = (wrap.clientWidth - gap * (count - 1)) / count;
    track.style.setProperty('--card-width', cardWidth + 'px');
    track.style.setProperty('--marquee-duration', (originalItems.length * secondsPerCard) + 's');
  };
  sizeTrack();
  window.addEventListener('resize', sizeTrack);

  const nudge = (dir) => {
    const anim = track.getAnimations()[0];
    if (!anim) return;
    anim.currentTime = (anim.currentTime || 0) + dir * secondsPerCard * 1000;
  };
  if (nextBtn) nextBtn.addEventListener('click', () => nudge(1));
  if (prevBtn) prevBtn.addEventListener('click', () => nudge(-1));
});

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
