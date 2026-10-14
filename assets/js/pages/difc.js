(function () {
  "use strict";

  document
    .querySelectorAll(".difc-redesign [data-lead-form]")
    .forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var honeypot = form.elements.namedItem("website");
        if (!honeypot || !honeypot.value.trim()) return;

        event.preventDefault();
        event.stopImmediatePropagation();
      });
    });
})();
