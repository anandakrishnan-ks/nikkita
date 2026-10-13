/**
 * Nikki Advisory — site enhancements (after theme main.js)
 * 1) Mobile nav: chevron toggles one-level submenu; label links navigate
 * 2) Custom cursor: replaces broken theme main.js cursor (DOMContentLoaded + matrix bugs)
 * 3) Fluid desktop wheel scrolling with touch and reduced-motion safeguards
 */
(function ($) {
  // Guard against invalid usage of jQuery .load to prevent TypeError when url is not a string
  if ($ && $.fn && typeof $.fn.load === "function") {
    var _originalLoad = $.fn.load;
    $.fn.load = function (url, params, callback) {
      if (typeof url !== "string") {
        // If url is not a string, skip the call to avoid errors
        return this;
      }
      return _originalLoad.apply(this, arguments);
    };
  }

  "use strict";

  /* ---------- Mobile nav ---------- */
  function unbindThemeDropdownHandlers() {
    $(document).off("click", ".responsive-menu .dropdown-item");
    $(document).off("click", ".responsive-menu .dropdown-item.dropdown-active");
    $(document).off("click", ".responsive-menu .dropdown-item-inner");
  }

  function toggleItem($item) {
    if (!$item || !$item.length) return;
    var opening = !$item.hasClass("dropdown-active");

    $(".responsive-menu > nav > ul > li.dropdown-item")
      .not($item)
      .removeClass("dropdown-active");

    if (opening) {
      $item.addClass("dropdown-active");
    } else {
      $item.removeClass("dropdown-active");
    }
  }

  $(function () {
    unbindThemeDropdownHandlers();

    $(document).on(
      "click",
      ".responsive-menu .menu-toggle-icon, .responsive-menu li.dropdown-item > i.las",
      function (e) {
        e.preventDefault();
        e.stopPropagation();
        var $item = $(this).closest("li.dropdown-item");
        toggleItem($item);
      }
    );

    $(document).on("click", ".responsive-menu li.dropdown-item > a", function (e) {
      e.stopPropagation();
    });
  });
})(jQuery);

/* ---------- Custom cursor (vanilla — no jQuery dependency for motion) ---------- */
(function () {
  "use strict";

  function preferReducedMotion() {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function isTouchUi() {
    return (
      window.matchMedia &&
      window.matchMedia("(hover: none), (pointer: coarse)").matches
    );
  }

  function initCustomCursor() {
    var dot = document.getElementById("custom-cursor");
    var ring = document.getElementById("custom-cursor-inner");
    if (!dot || !ring) return;

    // Disable broken theme handlers if they bound anything
    try {
      if (window.jQuery) {
        window.jQuery(document).off("mousemove.customCursor");
      }
    } catch (e) {}

    if (isTouchUi() || preferReducedMotion()) {
      dot.style.display = "none";
      ring.style.display = "none";
      document.documentElement.classList.remove("has-custom-cursor");
      return;
    }

    document.documentElement.classList.add("has-custom-cursor");

    var mouseX = window.innerWidth / 2;
    var mouseY = window.innerHeight / 2;
    var ringX = mouseX;
    var ringY = mouseY;
    var visible = false;
    var hovering = false;
    var raf = 0;

    function setVisible(on) {
      visible = on;
      if (on) {
        document.documentElement.classList.add("has-custom-cursor");
      }
    }

    function applyHover(on) {
      hovering = !!on;
      dot.classList.toggle("zoom", hovering);
      ring.classList.toggle("zoom", hovering);
    }

    function isInteractive(el) {
      if (!el || el.nodeType !== 1) return false;
      return !!el.closest(
        "a, button, .theme-btn, input, textarea, select, label, summary, .menu-toggle-icon, [role='button'], .swiper-button-next, .swiper-button-prev, .swiper-pagination-bullet"
      );
    }

    window.addEventListener(
      "mousemove",
      function (e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
        if (!visible) setVisible(true);
      },
      { passive: true }
    );

    document.addEventListener(
      "mouseover",
      function (e) {
        if (isInteractive(e.target)) applyHover(true);
      },
      true
    );

    document.addEventListener(
      "mouseout",
      function (e) {
        if (isInteractive(e.target)) {
          // leaving interactive → check relatedTarget
          if (!isInteractive(e.relatedTarget)) applyHover(false);
        }
      },
      true
    );

    document.addEventListener("mouseleave", function () {
      setVisible(false);
      document.documentElement.classList.remove("has-custom-cursor");
    });

    document.addEventListener("mouseenter", function () {
      setVisible(true);
    });

    function frame() {
      // Dot tracks instantly; ring eases slightly
      ringX += (mouseX - ringX) * 0.28;
      ringY += (mouseY - ringY) * 0.28;

      var dotHalf = hovering ? 6 : 4;
      var ringHalf = hovering ? 24 : 17;

      // Use translate3d from top-left origin (CSS left/top = 0)
      dot.style.transform =
        "translate3d(" +
        (mouseX - dotHalf) +
        "px," +
        (mouseY - dotHalf) +
        "px,0)";
      ring.style.transform =
        "translate3d(" +
        (ringX - ringHalf) +
        "px," +
        (ringY - ringHalf) +
        "px,0)";

      raf = window.requestAnimationFrame(frame);
    }

    raf = window.requestAnimationFrame(frame);

    // Keep sizes in sync if CSS changes zoom dims
    window.addEventListener(
      "resize",
      function () {
        /* no-op: halves derived from hover state each frame */
      },
      { passive: true }
    );
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initCustomCursor);
  } else {
    initCustomCursor();
  }
})();

/* ---------- Fluid desktop wheel scrolling ---------- */
(function () {
  "use strict";

  function prefersReducedMotion() {
    return (
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  }

  function hasFinePointer() {
    return (
      !window.matchMedia ||
      window.matchMedia("(hover: hover) and (pointer: fine)").matches
    );
  }

  function initFluidScroll() {
    if (prefersReducedMotion() || !hasFinePointer()) return;

    var currentY = window.scrollY || window.pageYOffset || 0;
    var targetY = currentY;
    var frameId = 0;

    function pageLimit() {
      return Math.max(
        0,
        document.documentElement.scrollHeight - window.innerHeight
      );
    }

    function clamp(value, min, max) {
      return Math.min(max, Math.max(min, value));
    }

    function nestedScrollerCanMove(node, delta) {
      var element = node && node.nodeType === 1 ? node : node.parentElement;

      while (element && element !== document.body) {
        var style = window.getComputedStyle(element);
        var scrollable = /(auto|scroll)/.test(style.overflowY);

        if (scrollable && element.scrollHeight > element.clientHeight + 1) {
          if (delta < 0 && element.scrollTop > 0) return true;
          if (
            delta > 0 &&
            element.scrollTop + element.clientHeight < element.scrollHeight - 1
          ) {
            return true;
          }
        }

        element = element.parentElement;
      }

      return false;
    }

    function finishAt(position) {
      if (frameId) window.cancelAnimationFrame(frameId);
      frameId = 0;
      currentY = position;
      targetY = position;
      document.documentElement.classList.remove("is-smooth-wheel");
    }

    function animate() {
      var distance = targetY - currentY;
      currentY += distance * 0.14;

      if (Math.abs(distance) < 0.5) {
        currentY = targetY;
        window.scrollTo(0, currentY);
        finishAt(currentY);
        return;
      }

      window.scrollTo(0, currentY);
      frameId = window.requestAnimationFrame(animate);
    }

    function onWheel(event) {
      if (
        event.defaultPrevented ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        prefersReducedMotion() ||
        !hasFinePointer()
      ) {
        return;
      }

      if (
        event.target.closest &&
        event.target.closest("input, textarea, select, [contenteditable='true']")
      ) {
        return;
      }

      var delta = event.deltaY;
      if (!delta || Math.abs(delta) <= Math.abs(event.deltaX)) return;

      if (event.deltaMode === 1) delta *= 32;
      if (event.deltaMode === 2) delta *= window.innerHeight;
      if (nestedScrollerCanMove(event.target, delta)) return;

      delta = clamp(delta, -220, 220);

      if (!frameId) {
        currentY = window.scrollY || window.pageYOffset || 0;
        targetY = currentY;
      }

      var nextTarget = clamp(targetY + delta, 0, pageLimit());
      if (nextTarget === targetY) return;

      event.preventDefault();
      targetY = nextTarget;
      document.documentElement.classList.add("is-smooth-wheel");

      if (!frameId) frameId = window.requestAnimationFrame(animate);
    }

    function syncToViewport() {
      if (!frameId) {
        currentY = window.scrollY || window.pageYOffset || 0;
        targetY = currentY;
      }
    }

    function stopForDirectInput() {
      if (frameId) {
        finishAt(window.scrollY || window.pageYOffset || 0);
      }
    }

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("scroll", syncToViewport, { passive: true });
    window.addEventListener("resize", syncToViewport, { passive: true });
    window.addEventListener("keydown", stopForDirectInput);
    window.addEventListener("pointerdown", stopForDirectInput, { passive: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initFluidScroll);
  } else {
    initFluidScroll();
  }
})();
