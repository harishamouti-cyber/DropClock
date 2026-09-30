/**
 * DropClock - Storefront Client-Side Hydration Engine
 * Zero-dependency, zero-CLS countdown calculation and variant event listener.
 * Compliant with "Built for Shopify" performance standards.
 */
(function () {
  "use strict";

  function initDropClock() {
    var wrappers = document.querySelectorAll(".dropclock-wrapper");
    if (!wrappers.length) return;

    wrappers.forEach(function (wrapper) {
      var ds = wrapper.dataset || {};
      var container = wrapper.querySelector(".dc-c");
      var backorder = wrapper.querySelector(".dc-b");
      var countdownEl = wrapper.querySelector(".dc-tc");
      var dispatchEl = wrapper.querySelector(".dc-dt");
      var etaEl = wrapper.querySelector(".dc-et");
      var barFill = wrapper.querySelector(".dc-bf");

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
        if (wrapper.getAttribute("data-available") !== "true") return;

        // Current time adjusted for warehouse timezone
        var storeNow = new Date(Date.now() + tzOffset * 60000);
        var currentMinutes = storeNow.getUTCHours() * 60 + storeNow.getUTCMinutes() + storeNow.getUTCSeconds() / 60;
        var cutoffTargetMinutes = cutoffHour * 60 + cutoffMinute;
        var diffMinutes = cutoffTargetMinutes - currentMinutes;
        var isPastCutoff = diffMinutes <= 0;

        if (isPastCutoff) {
          diffMinutes += 1440; // 24 hours rollover
        }

        if (dispatchEl) {
          dispatchEl.textContent = isPastCutoff ? nextDayText : sameDayText;
        }

        var hours = Math.floor(diffMinutes / 60);
        var mins = Math.floor(diffMinutes % 60);
        if (countdownEl) {
          countdownEl.textContent = hours + "h " + mins + "m";
        }

        // Urgency Progress Bar calculation (start of business 08:00 AM -> cutoff)
        if (barFill) {
          var windowSpan = cutoffTargetMinutes > 480 ? cutoffTargetMinutes - 480 : 480;
          var percent = isPastCutoff ? 0 : Math.max(5, Math.min(100, Math.round((diffMinutes / windowSpan) * 100)));
          barFill.style.width = percent + "%";
        }

        // Soft pulse animation under 60 minutes
        var isUrgent = !isPastCutoff && diffMinutes <= 60;
        wrapper.classList.toggle("dc-urgent", isUrgent);

        // Calculate delivery ETA skipping non-working days & blackout calendar
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

        if (etaEl) {
          etaEl.textContent = etaDate.toLocaleDateString(undefined, {
            timeZone: "UTC",
            weekday: "short",
            month: "short",
            day: "numeric",
          });
        }
      }

      function setAvailability(available) {
        wrapper.setAttribute("data-available", available ? "true" : "false");
        if (container) container.style.display = available ? "flex" : "none";
        if (backorder) backorder.style.display = available ? "none" : "flex";
        if (available) updateCountdown();
      }

      // Variant event listeners for modern themes (Dawn, Prestige, Impulse)
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
      setInterval(updateCountdown, 60000);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initDropClock);
  } else {
    initDropClock();
  }
})();
