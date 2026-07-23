// Bare Beauty — signature scroll reveal.
// Sections fade up gently the first time they enter the viewport.
// Kept intentionally minimal: no libraries, no heavy animation.

(function () {
  "use strict";

  var targets = document.querySelectorAll(".reveal");
  if (!targets.length) return;

  // No IntersectionObserver (very old browser) → just show everything.
  if (!("IntersectionObserver" in window)) {
    targets.forEach(function (el) { el.classList.add("in-view"); });
    return;
  }

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target); // reveal once, then stop watching
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
  );

  targets.forEach(function (el) { observer.observe(el); });
})();
