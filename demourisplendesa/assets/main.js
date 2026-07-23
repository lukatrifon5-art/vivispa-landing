// Bare Beauty — interactions, kept minimal and dependency-free.
//   1. Hero load sequence (staggered rise)
//   2. Ghosted background slideshow (slow cross-fade)
//   3. Scroll reveals (fade up once)
//   4. Reviews carousel (auto + arrows + dots + swipe)

(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 1. Hero load sequence ---------- */
  function markLoaded() { document.body.classList.add("loaded"); }
  if (document.readyState === "complete") {
    requestAnimationFrame(markLoaded);
  } else {
    window.addEventListener("load", function () { requestAnimationFrame(markLoaded); });
    // Fallback so content never stays hidden if 'load' is slow.
    setTimeout(markLoaded, 1200);
  }

  /* ---------- 2. Background slideshow ---------- */
  (function slideshow() {
    var box = document.querySelector("[data-slideshow]");
    if (!box || reduceMotion) return;
    var slides = box.querySelectorAll(".hero-slide");
    if (slides.length < 2) return;

    var i = 0;
    setInterval(function () {
      slides[i].classList.remove("is-active");
      i = (i + 1) % slides.length;
      slides[i].classList.add("is-active");
    }, 5200);
  })();

  /* ---------- 3. Scroll reveals ---------- */
  (function reveals() {
    var targets = document.querySelectorAll(".reveal, [data-statement]");
    if (!targets.length) return;

    if (!("IntersectionObserver" in window)) {
      targets.forEach(function (el) { el.classList.add("in-view"); });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );

    targets.forEach(function (el) { observer.observe(el); });
  })();

  /* ---------- 4. Reviews carousel ---------- */
  (function carousel() {
    var root = document.querySelector("[data-carousel]");
    if (!root) return;

    var slides = Array.prototype.slice.call(root.querySelectorAll(".review"));
    var dotsBox = root.querySelector(".car-dots");
    var prev = root.querySelector(".car-prev");
    var next = root.querySelector(".car-next");
    if (slides.length < 2) return;

    var current = 0;
    var timer = null;
    var DELAY = 6000;

    // Build dots
    var dots = slides.map(function (_, idx) {
      var b = document.createElement("button");
      b.className = "car-dot" + (idx === 0 ? " is-active" : "");
      b.type = "button";
      b.setAttribute("role", "tab");
      b.setAttribute("aria-label", "Review " + (idx + 1));
      b.addEventListener("click", function () { go(idx); restart(); });
      dotsBox.appendChild(b);
      return b;
    });

    function go(n) {
      slides[current].classList.remove("is-active");
      dots[current].classList.remove("is-active");
      current = (n + slides.length) % slides.length;
      slides[current].classList.add("is-active");
      dots[current].classList.add("is-active");
    }

    function start() {
      if (reduceMotion) return;
      timer = setInterval(function () { go(current + 1); }, DELAY);
    }
    function restart() { clearInterval(timer); start(); }

    prev.addEventListener("click", function () { go(current - 1); restart(); });
    next.addEventListener("click", function () { go(current + 1); restart(); });

    // Pause on hover (desktop)
    root.addEventListener("mouseenter", function () { clearInterval(timer); });
    root.addEventListener("mouseleave", function () { start(); });

    // Touch swipe
    var x0 = null;
    root.addEventListener("touchstart", function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    root.addEventListener("touchend", function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 40) { go(current + (dx < 0 ? 1 : -1)); restart(); }
      x0 = null;
    }, { passive: true });

    start();
  })();
})();
