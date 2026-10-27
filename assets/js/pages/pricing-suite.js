/** Pricing enquiry behavior. A lead is confirmed only after an accepted endpoint response. */
(function () {
  "use strict";
  var root = document.querySelector(".pricing-suite");
  if (!root) return;

  function track(eventName, details) {
    var payload = Object.assign({ event: eventName, page_type: "pricing", landing_page: location.pathname }, details || {});
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(payload);
    document.dispatchEvent(new CustomEvent("nikki:tracking", { detail: payload }));
  }

  root.querySelectorAll("[data-pc-cta]").forEach(function (link) {
    link.addEventListener("click", function () {
      track("cta_click", { cta_name: link.dataset.pcCta, cta_destination: link.getAttribute("href") });
    });
  });

  root.querySelectorAll("[data-pc-form]").forEach(function (form) {
    var started = false;
    var params = new URLSearchParams(location.search);
    var source = form.querySelector('[name="lead_source"]');
    var landing = form.querySelector('[name="landing_page"]');
    function fillAttribution() {
      if (source) source.value = params.get("utm_source") || document.referrer || "direct";
      if (landing) landing.value = location.href;
    }
    fillAttribution();
    form.addEventListener("input", function () {
      if (started) return;
      started = true;
      track("form_start", { form_name: form.dataset.pcForm });
    });
  });
})();
