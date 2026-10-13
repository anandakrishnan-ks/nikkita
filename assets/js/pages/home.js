(function () {
  "use strict";

  var reducedMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reducedMotion || !("IntersectionObserver" in window)) return;

  document.documentElement.classList.add("js-home-reveal");

  function initHomeReveals() {
    var items = document.querySelectorAll(".home-page [data-home-reveal]");
    if (!items.length) return;

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8%", threshold: 0.12 }
    );

    items.forEach(function (item) {
      observer.observe(item);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initHomeReveals);
  } else {
    initHomeReveals();
  }
})();
