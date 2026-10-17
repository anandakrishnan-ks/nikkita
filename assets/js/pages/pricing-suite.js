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
    var status = form.querySelector("[data-pc-status]");
    var button = form.querySelector('[type="submit"]');
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
    form.addEventListener("submit", async function (event) {
      event.preventDefault();
      if (!form.reportValidity()) return;
      if (form.elements.company_site && form.elements.company_site.value.trim()) return;
      var data = Object.fromEntries(new FormData(form).entries());
      var endpoint = form.dataset.endpoint || window.NIKKI_ENQUIRY_ENDPOINT || "";
      status.dataset.state = "";
      if (!endpoint) {
        var body = [
          "Full Name: " + data.name,
          "Phone Number: " + data.phone,
          "Email Address: " + data.email,
          "Preferred Jurisdiction: " + data.jurisdiction,
          "Business Activity: " + data.business_activity,
          "Setup Route: " + data.route,
          "Requirement: " + (data.requirement || "Not provided"),
          "Traffic Source: " + data.lead_source,
          "Landing Page: " + data.landing_page,
        ].join("\n");
        var mailto = "mailto:info@nikkiadvisory.com?subject=" + encodeURIComponent("Nikki Advisory setup quotation — " + data.jurisdiction) + "&body=" + encodeURIComponent(body);
        track("enquiry_handoff", { form_name: form.dataset.pcForm, jurisdiction: data.jurisdiction });
        status.textContent = "Please send the prepared message in your email app to complete the enquiry. If it does not open, email info@nikkiadvisory.com.";
        location.href = mailto;
        return;
      }
      button.disabled = true;
      status.textContent = "Sending your enquiry…";
      try {
        var response = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
        if (!response.ok) throw new Error("Submission was not accepted");
        track("generate_lead", { form_name: form.dataset.pcForm, jurisdiction: data.jurisdiction });
        status.dataset.state = "success";
        status.textContent = "Thank you for contacting Nikki Advisory. Your enquiry has been received, and we will review your requirement and get back to you shortly.";
        form.reset();
        started = false;
        fillAttribution();
      } catch (_) {
        status.dataset.state = "error";
        status.textContent = "We could not confirm your enquiry. Please try again or email info@nikkiadvisory.com.";
      } finally {
        button.disabled = false;
      }
    });
  });
})();
