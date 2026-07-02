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

// Carousels (reviews, services, ...): seamless infinite auto-advance + manual arrows, pause on hover
document.querySelectorAll('.carousel-wrap').forEach(wrap => {
  const carouselTrack = wrap.querySelector('.carousel-track');
  if (!carouselTrack) return;
  const prevBtn = wrap.querySelector('.carousel-arrow.prev');
  const nextBtn = wrap.querySelector('.carousel-arrow.next');

  // Duplicate the item set once so scrolling forward never has to jump backwards visibly
  const originalCount = carouselTrack.children.length;
  Array.from(carouselTrack.children).forEach(item => {
    const clone = item.cloneNode(true);
    clone.classList.remove('reveal', 'reveal-delay-1', 'reveal-delay-2', 'reveal-delay-3');
    carouselTrack.appendChild(clone);
  });

  const step = () => {
    const item = carouselTrack.firstElementChild;
    if (!item) return 0;
    const gap = parseFloat(getComputedStyle(carouselTrack).columnGap) || 0;
    return item.getBoundingClientRect().width + gap;
  };
  const setWidth = () => {
    const firstClone = carouselTrack.children[originalCount];
    return firstClone ? firstClone.offsetLeft - carouselTrack.offsetLeft : carouselTrack.scrollWidth / 2;
  };

  // Once scrolling settles past the original set (into the cloned copy), snap back invisibly.
  // Driven by the scroll event itself (debounced) so it never races with overlapping
  // autoplay ticks or manual arrow clicks.
  let settleTimer;
  carouselTrack.addEventListener('scroll', () => {
    clearTimeout(settleTimer);
    settleTimer = setTimeout(() => {
      const width = setWidth();
      if (carouselTrack.scrollLeft >= width - 2) {
        carouselTrack.scrollTo({ left: carouselTrack.scrollLeft - width, behavior: 'auto' });
      } else if (carouselTrack.scrollLeft < 0) {
        carouselTrack.scrollTo({ left: carouselTrack.scrollLeft + width, behavior: 'auto' });
      }
    }, 120);
  });

  const scrollNext = () => carouselTrack.scrollBy({ left: step(), behavior: 'smooth' });
  const scrollPrev = () => {
    if (carouselTrack.scrollLeft <= 2) {
      carouselTrack.scrollTo({ left: setWidth(), behavior: 'auto' });
    }
    carouselTrack.scrollBy({ left: -step(), behavior: 'smooth' });
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
