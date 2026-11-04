(function () {
  "use strict";
  var cfg = window.FLOWNET_CONFIG || {};

  /* Mobile navigation */
  var toggle = document.getElementById("nav-toggle");
  var links = document.getElementById("nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    links.addEventListener("click", function (e) {
      if (e.target.closest("a")) { links.classList.remove("open"); toggle.setAttribute("aria-expanded", "false"); }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && links.classList.contains("open")) { links.classList.remove("open"); toggle.setAttribute("aria-expanded", "false"); toggle.focus(); }
    });
  }

  /* Booking link: shown only when configured */
  if (cfg.bookingUrl) {
    var els = document.querySelectorAll("[data-booking]");
    for (var i = 0; i < els.length; i++) { els[i].classList.add("on"); var a = els[i].querySelector("a"); if (a) a.href = cfg.bookingUrl; }
  }

  /* Contact form */
  var form = document.getElementById("consult-form");
  if (!form) return;
  var loadedAt = Date.now();
  var statusEl = document.getElementById("form-status");
  var submitBtn = document.getElementById("submit-btn");
  var DUP_WINDOW = 10 * 60 * 1000;
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  var rules = {
    fullName: function (v) { return v.trim().length >= 2 ? "" : "Enter your full name."; },
    businessName: function (v) { return v.trim().length >= 2 ? "" : "Enter your business name."; },
    email: function (v) { return EMAIL_RE.test(v.trim()) ? "" : "Enter a valid email address, like name@company.com."; },
    website: function (v) {
      v = v.trim(); if (!v) return "";
      try { var u = new URL(/^https?:\/\//i.test(v) ? v : "https://" + v); return u.hostname.indexOf(".") > 0 ? "" : "Enter a valid web address."; }
      catch (e) { return "Enter a valid web address."; }
    },
    industry: function (v) { return v ? "" : "Choose the closest industry."; },
    employees: function (v) { return v ? "" : "Choose a team size."; },
    challenge: function (v) { return v.trim().length >= 15 ? "" : "Describe the task or process in a sentence or two (at least 15 characters)."; },
    consent: function (_v, el) { return el.checked ? "" : "Tick the box so we can reply to your enquiry."; }
  };

  function fieldWrap(el) { return el.closest(".field"); }
  function setError(name, msg) {
    var el = form.elements[name]; if (!el) return;
    var wrap = fieldWrap(el), err = document.getElementById("err-" + name);
    if (wrap) wrap.classList.toggle("invalid", !!msg);
    if (err) err.textContent = msg;
    el.setAttribute("aria-invalid", msg ? "true" : "false");
  }
  function validateField(name) {
    var el = form.elements[name]; if (!el || !rules[name]) return "";
    var msg = rules[name](el.value || "", el); setError(name, msg); return msg;
  }
  Object.keys(rules).forEach(function (name) {
    var el = form.elements[name]; if (!el) return;
    el.addEventListener("blur", function () { validateField(name); });
    el.addEventListener(el.type === "checkbox" || el.tagName === "SELECT" ? "change" : "input", function () { if (fieldWrap(el).classList.contains("invalid")) validateField(name); });
  });

  function show(msg) { statusEl.textContent = msg; }
  function dupKey(email, challenge) { return "fn_sent_" + (email.toLowerCase() + "|" + challenge.trim().slice(0, 80)).replace(/\s+/g, " "); }
  function recentlySent(key) { try { var t = parseInt(localStorage.getItem(key) || "0", 10); return t && Date.now() - t < DUP_WINDOW; } catch (e) { return false; } }
  function markSent(key) { try { localStorage.setItem(key, String(Date.now())); } catch (e) { /* storage unavailable */ } }

  function done() {
    form.hidden = true;
    var ok = document.getElementById("form-success"); ok.hidden = false;
    ok.setAttribute("tabindex", "-1"); ok.focus();
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault(); show("");
    var first = null;
    Object.keys(rules).forEach(function (name) { var m = validateField(name); if (m && !first) first = form.elements[name]; });
    if (first) { first.focus(); return; }

    /* Spam checks: a filled honeypot or an instant submit gets a silent success and nothing is sent. */
    if (form.elements.contact_me_by_fax.value || Date.now() - loadedAt < 3000) { done(); return; }

    var data = {};
    ["fullName", "businessName", "email", "website", "industry", "employees", "challenge", "tools", "budget", "notes"].forEach(function (k) { data[k] = (form.elements[k].value || "").trim(); });
    data.consent = true;
    data.submittedAt = new Date().toISOString();
    data.sourcePage = location.pathname;

    var key = dupKey(data.email, data.challenge);
    if (recentlySent(key)) { done(); return; }

    if (!cfg.webhookUrl) {
      if (window.console) console.warn("FlowNet: no webhookUrl set in js/config.js, so the enquiry was not sent.");
      show("We couldn't send your request right now. Please try again shortly.");
      return;
    }

    submitBtn.disabled = true; submitBtn.firstElementChild.textContent = "Sending…";
    var ctl = ("AbortController" in window) ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctl) ctl.abort(); }, 15000);
    fetch(cfg.webhookUrl, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data), signal: ctl ? ctl.signal : undefined })
      .then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); markSent(key); done(); })
      .catch(function () { show("We couldn't send your request right now. Please check your connection and try again, or try again later."); })
      .then(function () { clearTimeout(timer); submitBtn.disabled = false; submitBtn.firstElementChild.textContent = "Request a free consultation"; });
  });
})();
