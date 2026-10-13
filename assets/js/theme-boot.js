/**
 * Nikki Advisory — Next.js client-navigation re-init.
 * Original theme scripts (main.js / site.js) still load and run on first paint.
 * This helper re-runs Swiper / AOS / counters after App Router navigations.
 */
(function () {
  "use strict";

  var heroItems = [
    { title: "DUBAI", desc: "" },
    { title: "SAUDI ARABIA", desc: "" },
    { title: "BAHRAIN", desc: "" },
  ];

  window.nikkiInitTheme = function nikkiInitTheme() {
    var heroEl = document.querySelector(".hero-slide-container");
    if (typeof window.Swiper === "function") {
      if (heroEl && heroEl.swiper && typeof heroEl.swiper.destroy === "function") {
        try {
          heroEl.swiper.destroy(true, true);
        } catch (e) {}
      }
      if (heroEl) {
        window.__nikkiHeroSwiper = new window.Swiper(".hero-slide-container", {
          loop: true,
          speed: 1000,
          parallax: true,
          autoplay: {
            delay: 5500,
            disableOnInteraction: false,
          },
          fadeEffect: { crossFade: true },
          effect: "fade",
          watchSlidesProgress: true,
          pagination: {
            el: ".hero-slider-thumbnail",
            clickable: true,
            renderBullet: function (index, className) {
              var item = heroItems[index] || { title: "", desc: "" };
              return (
                '<div class="thumb-content ' +
                className +
                '"><span>' +
                item.title +
                "</span><h1>" +
                item.desc +
                "</h1></div>"
              );
            },
          },
        });
      }
    }

    if (typeof window.AOS !== "undefined" && window.AOS.init) {
      window.AOS.init({ once: true, duration: 500 });
      if (typeof window.AOS.refreshHard === "function") {
        window.AOS.refreshHard();
      }
    }

    if (window.jQuery && window.jQuery.fn && window.jQuery.fn.counterUp) {
      var $counters = window.jQuery(".counter");
      if ($counters.length) {
        $counters.counterUp({ delay: 10, time: 2000 });
      }
    }
  };
})();
