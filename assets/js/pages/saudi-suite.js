/** Saudi Arabia enquiry: CTA and form-start tracking; submission is handled by enquiry-forms.js. */
(function () {
  "use strict";
  var root = document.querySelector(".saudi-suite");
  if (!root) return;

  function track(eventName, details) {
    var payload = Object.assign({ event: eventName, page_type: "saudi_business_setup", landing_page: location.pathname }, details || {});
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(payload);
    document.dispatchEvent(new CustomEvent("nikki:tracking", { detail: payload }));
  }

  root.querySelectorAll("[data-sa-cta]").forEach(function (link) {
    link.addEventListener("click", function () {
      track("cta_click", { cta_name: link.dataset.saCta, cta_destination: link.getAttribute("href") });
    });
  });

  var form = root.querySelector("[data-sa-form]");
  if (!form) return;
  var source = form.querySelector('[name="lead_source"]');
  var landing = form.querySelector('[name="landing_page"]');
  var params = new URLSearchParams(location.search);
  var started = false;

  function fillAttribution() {
    if (source) source.value = params.get("utm_source") || document.referrer || "direct";
    if (landing) landing.value = location.href;
  }
  fillAttribution();

  form.addEventListener("input", function () {
    if (started) return;
    started = true;
    track("form_start", { form_name: form.dataset.saForm });
  });

})();
