/** Saudi Arabia enquiry: confirm a lead only after the configured endpoint accepts it. */
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
  var status = form.querySelector("[data-sa-status]");
  var button = form.querySelector('[type="submit"]');
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
        "Business Activity: " + data.business_activity,
        "Requirement: " + (data.requirement || "Not provided"),
        "Jurisdiction: Saudi Arabia",
        "Traffic Source: " + data.lead_source,
        "Landing Page: " + data.landing_page
      ].join("\n");
      var mailto = "mailto:info@nikkiadvisory.com?subject=" + encodeURIComponent("Nikki Advisory Saudi business setup enquiry") + "&body=" + encodeURIComponent(body);
      track("enquiry_handoff", { form_name: form.dataset.saForm, jurisdiction: "Saudi Arabia" });
      status.textContent = "Please send the prepared message in your email app to complete the enquiry. If it does not open, email info@nikkiadvisory.com.";
      location.href = mailto;
      return;
    }

    button.disabled = true;
    status.textContent = "Sending your enquiry…";
    try {
      var response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error("Submission was not accepted");
      track("generate_lead", { form_name: form.dataset.saForm, jurisdiction: "Saudi Arabia" });
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
})();
