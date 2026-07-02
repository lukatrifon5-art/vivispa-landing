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

// Carousels (reviews, services, ...): auto-advance + manual arrows, pause on hover
document.querySelectorAll('.carousel-wrap').forEach(wrap => {
  const carouselTrack = wrap.querySelector('.carousel-track');
  if (!carouselTrack) return;
  const prevBtn = wrap.querySelector('.carousel-arrow.prev');
  const nextBtn = wrap.querySelector('.carousel-arrow.next');
  const step = () => {
    const item = carouselTrack.firstElementChild;
    if (!item) return 0;
    const gap = parseFloat(getComputedStyle(carouselTrack).columnGap) || 0;
    return item.getBoundingClientRect().width + gap;
  };

  const scrollNext = () => {
    const maxScroll = carouselTrack.scrollWidth - carouselTrack.clientWidth;
    if (carouselTrack.scrollLeft >= maxScroll - 4) {
      carouselTrack.scrollTo({ left: 0, behavior: 'smooth' });
    } else {
      carouselTrack.scrollBy({ left: step(), behavior: 'smooth' });
    }
  };
  const scrollPrev = () => {
    if (carouselTrack.scrollLeft <= 4) {
      carouselTrack.scrollTo({ left: carouselTrack.scrollWidth, behavior: 'smooth' });
    } else {
      carouselTrack.scrollBy({ left: -step(), behavior: 'smooth' });
    }
  };

  if (nextBtn) nextBtn.addEventListener('click', scrollNext);
  if (prevBtn) prevBtn.addEventListener('click', scrollPrev);

  const intervalMs = parseInt(wrap.dataset.interval, 10) || 2500;
  let autoplay = setInterval(scrollNext, intervalMs);
  wrap.addEventListener('mouseenter', () => clearInterval(autoplay));
  wrap.addEventListener('mouseleave', () => { autoplay = setInterval(scrollNext, intervalMs); });
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
