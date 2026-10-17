/** Shared mainland-page FAQ, lead-form, and conversion tracking behavior. */
(function () {
  "use strict";

  function track(eventName, details) {
    var pageRoot = document.querySelector(".mainland-redesign");
    var payload = Object.assign(
      {
        event: eventName,
        page_type:
          (pageRoot && pageRoot.getAttribute("data-page-type")) ||
          "mainland_service",
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
        if (indicator && indicator.classList.contains("faq-indicator")) {
          indicator.classList.toggle("la-plus", !opening);
          indicator.classList.toggle("la-minus", opening);
        } else if (indicator) {
          indicator.textContent = opening ? "−" : "+";
        }
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

      form.addEventListener("submit", function (event) {
        var interestField = form.querySelector('[name="business_interest"]');
        var activityField = form.querySelector('[name="proposed_activity"]');
        var requirementField = form.querySelector('[name="requirement"]');
        var licenceField = form.querySelector('[name="preferred_licence"]');
        var trapField = form.querySelector('[name="company_site"]');

        if (trapField && trapField.value.trim()) {
          event.preventDefault();
          return;
        }

        // A mailto form hands the enquiry to the visitor's email app; the site
        // cannot confirm that the message was actually sent.
        var isEmailHandoff = /^mailto:/i.test(form.getAttribute("action") || "");
        track(isEmailHandoff ? "enquiry_handoff" : "generate_lead", {
          form_name: form.getAttribute("data-lead-form"),
          business_interest: interestField ? interestField.value : "Mainland",
          facility_requirement: form.elements.facility_requirement
            ? form.elements.facility_requirement.value || "not_specified"
            : "not_applicable",
          preferred_licence: licenceField ? licenceField.value : "not_provided",
          qualification_status:
            (activityField && activityField.value.trim()) ||
            (requirementField && requirementField.value.trim())
              ? "qualified_intent"
              : "basic_enquiry",
        });
      });
    });
})();
