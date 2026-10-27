/**
 * Nikki Advisory — site enhancements (after theme main.js)
 * 1) Mobile nav: chevron toggles one-level submenu; label links navigate
 * 2) Fluid desktop wheel scrolling with touch and reduced-motion safeguards
 */
/* Shared WhatsApp contact link, mounted outside page animation wrappers. */
(function () {
  "use strict";

  function mountWhatsApp() {
    if (document.getElementById("nikki-whatsapp")) return;

    var message = "Hi Nikki Advisory, I'm interested in your business setup and advisory services. Could you please guide me on the next steps?";
    var link = document.createElement("a");
    link.id = "nikki-whatsapp";
    link.className = "nikki-whatsapp";
    link.href = "https://wa.me/971521559885?text=" + encodeURIComponent(message);
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.setAttribute("aria-label", "Chat with Nikki Advisory on WhatsApp at +971 52 155 9885 (opens in a new tab)");

    var icon = document.createElement("i");
    icon.className = "lab la-whatsapp";
    icon.setAttribute("aria-hidden", "true");

    var label = document.createElement("span");
    label.className = "nikki-whatsapp__label";
    label.textContent = "Chat on WhatsApp";
    label.setAttribute("aria-hidden", "true");

    link.appendChild(icon);
    link.appendChild(label);
    document.body.appendChild(link);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mountWhatsApp, { once: true });
  } else {
    mountWhatsApp();
  }
})();

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
      .removeClass("dropdown-active")
      .children("button.services-menu-trigger")
      .attr("aria-expanded", "false");

    if (opening) {
      $item.addClass("dropdown-active");
    } else {
      $item.removeClass("dropdown-active");
    }
    $item.children("button.services-menu-trigger").attr("aria-expanded", String(opening));
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

    $(document).on("click", ".responsive-menu li.dropdown-item > button.services-menu-trigger", function (e) {
      e.preventDefault();
      e.stopPropagation();
      toggleItem($(this).closest("li.dropdown-item"));
    });

    var $desktopServices = $(".menu-wrap nav > ul > li.dropdown-item").filter(function () {
      return $(this).children("button.services-menu-trigger").length > 0;
    });
    $desktopServices.on("mouseenter focusin", function () {
      $(this).children("button.services-menu-trigger").attr("aria-expanded", "true");
    });
    $desktopServices.on("mouseleave focusout", function () {
      var item = this;
      setTimeout(function () {
        if (!item.matches(":hover") && !item.matches(":focus-within")) {
          $(item).children("button.services-menu-trigger").attr("aria-expanded", "false");
        }
      }, 0);
    });
  });
})(jQuery);

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
