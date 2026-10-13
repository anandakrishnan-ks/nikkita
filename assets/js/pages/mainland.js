/** Shared mainland-page FAQ, lead-form, and conversion tracking behavior. */
(function () {
  "use strict";

  function track(eventName, details) {
    var payload = Object.assign(
      {
        event: eventName,
        page_type: "mainland_service",
        landing_page: window.location.pathname,
      },
      details || {},
    );

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(payload);
    document.dispatchEvent(
      new CustomEvent("nikki:tracking", { detail: payload }),
    );
  }

  document
    .querySelectorAll(".mainland-redesign .faq-q")
    .forEach(function (button) {
      button.addEventListener("click", function () {
        var item = button.closest(".faq-item");
        if (!item) return;

        var opening = !item.classList.contains("open");
        item.classList.toggle("open", opening);
        button.setAttribute("aria-expanded", String(opening));

        var indicator = button.lastElementChild;
        if (indicator) indicator.textContent = opening ? "−" : "+";
      });
    });

  document
    .querySelectorAll(".mainland-redesign [data-track-cta]")
    .forEach(function (link) {
      link.addEventListener("click", function () {
        track("cta_click", {
          cta_name: link.getAttribute("data-track-cta"),
          cta_destination: link.getAttribute("href"),
        });
      });
    });

  document
    .querySelectorAll(".mainland-redesign [data-lead-form]")
    .forEach(function (form) {
      var started = false;
      var sourceField = form.querySelector("[data-lead-source]");
      var landingField = form.querySelector("[data-landing-page]");
      var params = new URLSearchParams(window.location.search);

      if (sourceField) {
        sourceField.value =
          params.get("utm_source") || document.referrer || "direct";
      }
      if (landingField) landingField.value = window.location.href;

      form.addEventListener("input", function () {
        if (started) return;
        started = true;
        track("form_start", {
          form_name: form.getAttribute("data-lead-form"),
        });
      });

      form.addEventListener("submit", function () {
        track("generate_lead", {
          form_name: form.getAttribute("data-lead-form"),
          business_interest: "Abu Dhabi Mainland",
        });
      });
    });
})();
