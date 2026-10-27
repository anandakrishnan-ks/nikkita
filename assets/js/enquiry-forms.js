(function () {
  'use strict';

  var siteKey = '6LcmK_otAAAAAJ1QL6jqv696ZSiECMfCrgG78paT';
  var endpoint = '/assets/mail/send-enquiry.php';
  var forms = document.querySelectorAll('form[data-enquiry-form]');
  if (!forms.length) return;

  var captcha;
  function loadCaptcha() {
    if (captcha) return captcha;
    captcha = new Promise(function (resolve, reject) {
      var script = document.createElement('script');
      var timeout = window.setTimeout(failed, 15000);
      function failed() {
        window.clearTimeout(timeout);
        script.remove();
        reject(new Error('reCAPTCHA did not load'));
      }
      script.src = 'https://www.google.com/recaptcha/api.js?render=' + encodeURIComponent(siteKey);
      script.async = true;
      script.onload = function () {
        if (!window.grecaptcha) return failed();
        window.grecaptcha.ready(function () {
          window.clearTimeout(timeout);
          resolve(window.grecaptcha);
        });
      };
      script.onerror = failed;
      document.head.appendChild(script);
    });
    // Permit a retry after a network failure and handle prewarming rejections.
    captcha.catch(function () { captcha = null; });
    return captcha;
  }

  function flag(iso) {
    return String.fromCodePoint(127397 + iso.charCodeAt(0), 127397 + iso.charCodeAt(1));
  }

  var countryPickerCount = 0;
  var openCountryPicker = null;

  function addPhoneCodes(form) {
    var phone = form.querySelector('input[name="phone"]');
    if (!phone || !window.NIKKI_COUNTRY_CODES) return;
    var wrap = document.createElement('div');
    wrap.className = 'nikki-phone';
    var select = document.createElement('select');
    select.name = 'dial_code';
    select.className = 'nikki-dial-code';
    select.setAttribute('aria-label', 'Phone country calling code');
    select.autocomplete = 'tel-country-code';
    // Keep the native select as the form value, including countries that share a code.
    select.hidden = true;
    select.tabIndex = -1;
    var control = document.createElement('div');
    control.className = 'nikki-dial-control';
    var trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'nikki-dial-trigger';
    trigger.setAttribute('aria-haspopup', 'dialog');
    trigger.setAttribute('aria-expanded', 'false');
    var label = document.createElement('span');
    label.className = 'nikki-dial-label';
    label.setAttribute('aria-hidden', 'true');
    window.NIKKI_COUNTRY_CODES.forEach(function (country) {
      var option = document.createElement('option');
      option.value = country[2];
      option.textContent = flag(country[0]) + ' ' + country[1] + ' (' + country[2] + ')';
      option.dataset.flag = flag(country[0]);
      option.defaultSelected = country[0] === 'AE';
      option.selected = country[0] === 'AE';
      select.appendChild(option);
    });
    function updateCode() {
      var option = select.options[select.selectedIndex];
      if (!option) return;
      label.textContent = option.dataset.flag + ' ' + option.value;
      control.title = option.textContent;
      trigger.setAttribute('aria-label', 'Country calling code: ' + option.textContent);
    }
    select.addEventListener('change', updateCode);
    phone.parentNode.insertBefore(wrap, phone);
    trigger.appendChild(label);
    control.appendChild(trigger);
    control.appendChild(select);
    wrap.appendChild(control);
    wrap.appendChild(phone);
    updateCode();
    phone.autocomplete = 'tel-national';
    phone.inputMode = 'tel';
    if (!phone.placeholder || /^\+\d/.test(phone.placeholder)) phone.placeholder = 'Your phone number';

    var id = 'nikki-country-' + (++countryPickerCount);
    var popup = document.createElement('div');
    popup.id = id;
    popup.className = 'nikki-country-picker';
    popup.hidden = true;
    popup.setAttribute('role', 'dialog');
    popup.setAttribute('aria-label', 'Choose a country calling code');
    trigger.setAttribute('aria-controls', id);
    var searchLabel = document.createElement('label');
    searchLabel.className = 'nikki-country-search-label';
    searchLabel.htmlFor = id + '-search';
    searchLabel.textContent = 'Search country or calling code';
    var search = document.createElement('input');
    search.id = searchLabel.htmlFor;
    search.className = 'nikki-country-search';
    search.type = 'search';
    search.placeholder = 'Country or code, e.g. India or +91';
    search.autocomplete = 'off';
    search.spellcheck = false;
    search.setAttribute('role', 'combobox');
    search.setAttribute('aria-autocomplete', 'list');
    search.setAttribute('aria-expanded', 'false');
    search.setAttribute('aria-controls', id + '-list');
    var list = document.createElement('ul');
    list.id = id + '-list';
    list.className = 'nikki-country-list';
    list.setAttribute('role', 'listbox');
    list.setAttribute('aria-label', 'Countries and calling codes');
    var summary = document.createElement('p');
    summary.className = 'nikki-country-summary';
    summary.setAttribute('role', 'status');
    popup.appendChild(searchLabel);
    popup.appendChild(search);
    popup.appendChild(list);
    popup.appendChild(summary);
    // A body-level popup avoids clipping inside animated panels and contact cards.
    document.body.appendChild(popup);
    var matches = [];
    var active = -1;

    function normalize(value) {
      return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
    }

    function positionPopup() {
      if (popup.hidden) return;
      var rect = trigger.getBoundingClientRect();
      var viewport = window.visualViewport;
      var viewportTop = viewport ? viewport.offsetTop : 0;
      var viewportHeight = viewport ? viewport.height : window.innerHeight;
      var viewportWidth = document.documentElement.clientWidth;
      var width = Math.min(360, viewportWidth - 24);
      var below = viewportTop + viewportHeight - rect.bottom - 12;
      var above = rect.top - viewportTop - 12;
      var upwards = below < 220 && above > below;
      popup.style.width = width + 'px';
      popup.style.maxHeight = Math.max(140, Math.min(360, upwards ? above : below)) + 'px';
      popup.style.left = Math.max(12, Math.min(rect.left, viewportWidth - width - 12)) + 'px';
      popup.style.top = (upwards ? rect.top - popup.offsetHeight - 6 : rect.bottom + 6) + 'px';
    }

    function setActive(index) {
      active = index;
      Array.prototype.forEach.call(list.children, function (option, i) {
        option.classList.toggle('is-active', i === active);
      });
      var option = list.children[active];
      if (option) {
        search.setAttribute('aria-activedescendant', option.id);
        option.scrollIntoView({ block: 'nearest' });
      } else {
        search.removeAttribute('aria-activedescendant');
      }
    }

    function renderCountries() {
      var query = normalize(search.value);
      var numeric = /^\+?[\d\s()-]+$/.test(query);
      var digits = query.replace(/\D/g, '');
      matches = window.NIKKI_COUNTRY_CODES.map(function (country, index) {
        return { country: country, index: index };
      }).filter(function (item) {
        return !query || (numeric && digits ? item.country[2].slice(1).indexOf(digits) === 0 :
          normalize(item.country[1]).indexOf(query) !== -1 || item.country[0].toLowerCase() === query);
      }).sort(function (first, second) {
        function exact(item) {
          return normalize(item.country[1]) === query || item.country[0].toLowerCase() === query ||
            (numeric && digits && item.country[2] === '+' + digits) ? 1 : 0;
        }
        return exact(second) - exact(first);
      });
      var fragment = document.createDocumentFragment();
      matches.forEach(function (item, index) {
        var option = document.createElement('li');
        option.id = id + '-option-' + index;
        option.className = 'nikki-country-option';
        option.dataset.index = index;
        option.setAttribute('role', 'option');
        option.setAttribute('aria-selected', String(item.index === select.selectedIndex));
        var countryName = document.createElement('span');
        countryName.textContent = flag(item.country[0]) + ' ' + item.country[1];
        var code = document.createElement('span');
        code.className = 'nikki-country-code';
        code.textContent = item.country[2];
        option.appendChild(countryName);
        option.appendChild(code);
        fragment.appendChild(option);
      });
      list.replaceChildren(fragment);
      summary.textContent = matches.length ? matches.length + (matches.length === 1 ? ' country found' : ' countries found') : 'No countries found. Try a country name or calling code.';
      var selected = query ? 0 : matches.findIndex(function (item) { return item.index === select.selectedIndex; });
      setActive(matches.length ? Math.max(0, selected) : -1);
      positionPopup();
    }

    function closePopup(restoreFocus) {
      popup.hidden = true;
      trigger.setAttribute('aria-expanded', 'false');
      search.setAttribute('aria-expanded', 'false');
      if (openCountryPicker === closePopup) openCountryPicker = null;
      if (restoreFocus) trigger.focus();
    }

    function openPopup(query) {
      if (openCountryPicker && openCountryPicker !== closePopup) openCountryPicker(false);
      openCountryPicker = closePopup;
      search.value = query || '';
      popup.hidden = false;
      trigger.setAttribute('aria-expanded', 'true');
      search.setAttribute('aria-expanded', 'true');
      positionPopup();
      renderCountries();
      search.focus({ preventScroll: true });
    }

    function chooseCountry(index) {
      if (!matches[index]) return;
      select.selectedIndex = matches[index].index;
      select.dispatchEvent(new Event('change', { bubbles: true }));
      closePopup(true);
    }

    trigger.addEventListener('click', function () {
      if (popup.hidden) openPopup();
      else closePopup(true);
    });
    trigger.addEventListener('keydown', function (event) {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        openPopup();
      } else if (event.key.length === 1 && event.key !== ' ' && !event.ctrlKey && !event.metaKey && !event.altKey) {
        event.preventDefault();
        openPopup(event.key);
      }
    });
    search.addEventListener('input', renderCountries);
    search.addEventListener('keydown', function (event) {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        if (matches.length) setActive((active + (event.key === 'ArrowDown' ? 1 : -1) + matches.length) % matches.length);
      } else if (event.key === 'Home' && matches.length) {
        event.preventDefault();
        setActive(0);
      } else if (event.key === 'End' && matches.length) {
        event.preventDefault();
        setActive(matches.length - 1);
      } else if (event.key === 'Enter') {
        event.preventDefault();
        chooseCountry(active);
      } else if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        closePopup(true);
      } else if (event.key === 'Tab') {
        event.preventDefault();
        closePopup(false);
        (event.shiftKey ? trigger : phone).focus();
      }
    });
    list.addEventListener('click', function (event) {
      var option = event.target.closest('[role="option"]');
      if (option) chooseCountry(Number(option.dataset.index));
    });
    document.addEventListener('pointerdown', function (event) {
      if (!popup.hidden && !control.contains(event.target) && !popup.contains(event.target)) closePopup(false);
    });
    document.addEventListener('focusin', function (event) {
      if (!popup.hidden && !control.contains(event.target) && !popup.contains(event.target)) closePopup(false);
    });
    window.addEventListener('resize', positionPopup);
    window.addEventListener('scroll', positionPopup, { passive: true, capture: true });
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', positionPopup);
      window.visualViewport.addEventListener('scroll', positionPopup);
    }
    form.addEventListener('reset', function () {
      closePopup(false);
      requestAnimationFrame(updateCode);
    });
  }

  function statusFor(form) {
    var status = form.querySelector('[data-pc-status], [data-sv-status], [data-sa-status], [data-bh-status], #result');
    if (status) return status;
    status = document.createElement('p');
    status.className = 'enquiry-status';
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
    var button = form.querySelector('[type="submit"]');
    (button.closest('.form-submit') || button).insertAdjacentElement('afterend', status);
    return status;
  }

  function setStatus(status, state, message) {
    status.dataset.state = state;
    status.textContent = message;
  }

  forms.forEach(function (form) {
    addPhoneCodes(form);
    form.addEventListener('focusin', loadCaptcha, { once: true });
    form.addEventListener('pointerdown', loadCaptcha, { once: true });
    var status = statusFor(form);
    var button = form.querySelector('[type="submit"]');
    var source = form.querySelector('[name="lead_source"]');
    var landing = form.querySelector('[name="landing_page"]');
    if (source) source.value = new URLSearchParams(location.search).get('utm_source') || document.referrer || 'direct';
    if (landing) landing.value = location.href;

    // Capture before older page handlers that previously opened mailto drafts.
    form.addEventListener('submit', async function (event) {
      event.preventDefault();
      event.stopImmediatePropagation();
      if (button.disabled || !form.reportValidity()) return;
      if ((form.elements.company_site && form.elements.company_site.value) ||
          (form.elements.website && form.elements.website.value)) return;

      var phone = form.querySelector('input[name="phone"]');
      var digits = phone.value.replace(/\D/g, '');
      if (digits.length < 6 || digits.length > 15) {
        setStatus(status, 'error', 'Please enter a valid phone number.');
        phone.focus();
        return;
      }

      button.disabled = true;
      setStatus(status, '', 'Sending your enquiry…');
      try {
        var grecaptcha = await loadCaptcha();
        var token = await grecaptcha.execute(siteKey, { action: 'enquiry' });
        var data = new FormData(form);
        data.set('form_id', form.dataset.leadForm || form.dataset.enquiryForm || 'general-enquiry');
        data.set('g-recaptcha-response', token);
        var response = await fetch(endpoint, { method: 'POST', body: data, credentials: 'same-origin', headers: { 'Accept': 'application/json' } });
        var result = await response.json();
        if (!response.ok || !result.success) throw new Error(result.message || 'The enquiry could not be sent.');
        setStatus(status, 'success', result.message);
        form.reset();
        if (source) source.value = new URLSearchParams(location.search).get('utm_source') || document.referrer || 'direct';
        if (landing) landing.value = location.href;
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({ event: 'generate_lead', form_name: form.dataset.leadForm || form.dataset.enquiryForm, landing_page: location.pathname });
      } catch (error) {
        setStatus(status, 'error', error.message && !/reCAPTCHA|fetch|JSON|Unexpected/i.test(error.message) ? error.message : 'We could not send your enquiry. Please try again or email info@nikkiadvisory.com.');
      } finally {
        button.disabled = false;
      }
    }, true);
  });
})();
