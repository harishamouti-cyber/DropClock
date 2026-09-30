/**
 * DropClock - Storefront Client-Side Hydration Engine
 * Zero-dependency, zero-CLS countdown calculation and variant event listener.
 * Compliant with "Built for Shopify" performance standards.
 */
(function () {
  "use strict";

  function initDropClock() {
    var roots = document.querySelectorAll(".dropclock-widget-root, .dropclock-wrapper");
    if (!roots.length) return;

    roots.forEach(function (root) {
      var ds = root.dataset || {};
      var pillCard = root.querySelector(".dc-pill-card, .dc-c");
      var backorderEl = root.querySelector(".dc-backorder-notice, .dc-b");
      var timerValEl = root.querySelector("[data-dc-timer], .dc-timer-val, .dc-tc");
      var subtextEl = root.querySelector("[data-dc-subtext], .dc-subtext, .dc-dt");
      var etaDateEl = root.querySelector("[data-dc-eta], .dc-eta-date, .dc-et");
      var barFillEl = root.querySelector("[data-dc-bar-fill], .dc-bar-fill, .dc-bf");

      var cutoffHour = ds.cutoffHour != null ? parseInt(ds.cutoffHour, 10) : 14;
      var cutoffMinute = ds.cutoffMin != null ? parseInt(ds.cutoffMin, 10) : (ds.cutoffMinute != null ? parseInt(ds.cutoffMinute, 10) : 0);
      var leadDays = parseInt(ds.leadDays, 10) || 2;
      var tzOffset = parseInt(ds.timezoneOffset != null ? ds.timezoneOffset : (ds.tzOffset || 0), 10);
      var sameDayText = ds.samedayText || "for same-day dispatch";
      var nextDayText = ds.nextdayText || "for tomorrow's dispatch";

      function safeJsonParse(val, fallback) {
        try {
          var parsed = JSON.parse(val);
          return parsed != null ? parsed : fallback;
        } catch (e) {
          return fallback;
        }
      }

      var workingDays = safeJsonParse(ds.workingDays, [1, 2, 3, 4, 5]);
      var blackoutDates = safeJsonParse(ds.blackoutDates || ds.blackouts, []);
      var marketOverrides = safeJsonParse(ds.marketOverrides, {});

      if (!Array.isArray(workingDays) || !workingDays.length) workingDays = [1, 2, 3, 4, 5];
      if (!Array.isArray(blackoutDates)) blackoutDates = [];

      if (ds.currentCountry && marketOverrides[ds.currentCountry]) {
        leadDays += parseInt(marketOverrides[ds.currentCountry], 10) || 0;
      }

      function updateCountdown() {
        if (root.getAttribute("data-available") === "false") return;

        var storeNow = new Date(Date.now() + tzOffset * 60000);
        var currentSecs = storeNow.getUTCHours() * 3600 + storeNow.getUTCMinutes() * 60 + storeNow.getUTCSeconds();
        var cutoffSecs = cutoffHour * 3600 + cutoffMinute * 60;
        var diffSecs = cutoffSecs - currentSecs;
        var isPastCutoff = diffSecs <= 0;

        if (isPastCutoff) {
          diffSecs += 86400;
        }

        var h = Math.floor(diffSecs / 3600);
        var m = Math.floor((diffSecs % 3600) / 60);
        var s = Math.floor(diffSecs % 60);

        if (timerValEl) {
          timerValEl.textContent = h + "h " + (m < 10 ? "0" + m : m) + "m " + (s < 10 ? "0" + s : s) + "s";
        }

        if (subtextEl) {
          subtextEl.textContent = isPastCutoff ? nextDayText : sameDayText;
        }

        if (barFillEl) {
          var startSecs = 8 * 3600;
          var windowSecs = cutoffSecs > startSecs ? cutoffSecs - startSecs : 14400;
          var pct = isPastCutoff ? 0 : Math.max(5, Math.min(100, Math.round((diffSecs / windowSecs) * 100)));
          barFillEl.style.width = pct + "%";
        }

        root.classList.toggle("dc-urgent", !isPastCutoff && diffSecs <= 3600);

        var etaDate = new Date(Date.UTC(storeNow.getUTCFullYear(), storeNow.getUTCMonth(), storeNow.getUTCDate()));
        var daysAdded = 0;
        var targetDays = leadDays + (isPastCutoff ? 1 : 0);

        while (daysAdded < targetDays) {
          etaDate.setUTCDate(etaDate.getUTCDate() + 1);
          var dow = etaDate.getUTCDay();
          var isoStr = etaDate.toISOString().split("T")[0];
          if (workingDays.indexOf(dow) !== -1 && blackoutDates.indexOf(isoStr) === -1) {
            daysAdded++;
          }
        }

        if (etaDateEl) {
          etaDateEl.textContent = etaDate.toLocaleDateString(undefined, {
            timeZone: "UTC",
            weekday: "short",
            month: "short",
            day: "numeric",
          });
        }
      }

      function setAvailability(available) {
        root.setAttribute("data-available", available ? "true" : "false");
        if (pillCard) pillCard.style.display = available ? "flex" : "none";
        if (backorderEl) backorderEl.style.display = available ? "none" : "flex";
        if (available) updateCountdown();
      }

      document.addEventListener("variant:change", function (e) {
        var variant = e && e.detail && (e.detail.variant || e.detail);
        if (variant && variant.available != null) {
          setAvailability(Boolean(variant.available));
        }
      });

      document.addEventListener("theme:variant:change", function (e) {
        var variant = e && e.detail && (e.detail.variant || e.detail);
        if (variant && variant.available != null) {
          setAvailability(Boolean(variant.available));
        }
      });

      document.addEventListener("change", function (e) {
        var form = e.target.form || e.target.closest("form") || document.querySelector("form[action*='/cart/add']");
        if (form) {
          setTimeout(function () {
            var submitBtn = form.querySelector('[name="add"], .product-form__submit');
            if (submitBtn) {
              var isSoldOut = submitBtn.disabled || /sold|unavail/i.test(submitBtn.textContent || "");
              setAvailability(!isSoldOut);
            }
          }, 50);
        }
      });

      updateCountdown();
      setInterval(updateCountdown, 1000);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initDropClock);
  } else {
    initDropClock();
  }
})();
