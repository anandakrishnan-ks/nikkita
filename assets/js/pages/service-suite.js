/** Shared service-suite conversion behavior. A success event requires a confirmed endpoint response. */
(function () {
  "use strict";

  var root = document.querySelector(".service-suite");
  if (!root) return;

  function track(eventName, details) {
    var payload = Object.assign(
      { event: eventName, page_type: "service", landing_page: location.pathname },
      details || {},
    );
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(payload);
    document.dispatchEvent(new CustomEvent("nikki:tracking", { detail: payload }));
  }

  root.querySelectorAll("[data-sv-cta]").forEach(function (link) {
    link.addEventListener("click", function () {
      track("cta_click", {
        cta_name: link.getAttribute("data-sv-cta"),
        cta_destination: link.getAttribute("href"),
      });
    });
  });

  root.querySelectorAll("[data-sv-form]").forEach(function (form) {
    var started = false;
    var params = new URLSearchParams(location.search);
    var source = form.querySelector('[name="lead_source"]');
    var landing = form.querySelector('[name="landing_page"]');
    if (source) source.value = params.get("utm_source") || document.referrer || "direct";
    if (landing) landing.value = location.href;

    form.addEventListener("input", function () {
      if (started) return;
      started = true;
      track("form_start", { form_name: form.dataset.svForm });
    });

  });
})();
