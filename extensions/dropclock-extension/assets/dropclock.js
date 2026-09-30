(function () {
  "use strict";

  function initDropClock() {
    var roots = document.querySelectorAll(".dropclock-widget-root, .dropclock-wrapper");
    if (!roots.length) return;

    roots.forEach(function (root) {
      var ds = root.dataset || {};
      var timerEl = root.querySelector("[data-dc-timer], .dc-timer-val, .dc-tc");
      var etaEl = root.querySelector("[data-dc-eta], .dc-eta-date, .dc-et");
      var subtextEl = root.querySelector("[data-dc-subtext], .dc-subtext, .dc-dt");
      var pillCard = root.querySelector(".dc-pill-card, .dc-c");
      var backorderEl = root.querySelector(".dc-backorder-notice, .dc-b");

      var cutoffHour = parseInt(ds.cutoffHour || "14", 10);
      var cutoffMin = parseInt(ds.cutoffMin != null ? ds.cutoffMin : (ds.cutoffMinute || "0"), 10);
      var leadDays = parseInt(ds.leadDays || "2", 10);
      var sameDayText = ds.samedayText || "for same-day dispatch";
      var nextDayText = ds.nextdayText || "for tomorrow's dispatch";

      function safeParse(str, fallback) {
        try {
          var parsed = JSON.parse(str);
          return parsed != null ? parsed : fallback;
        } catch (e) {
          return fallback;
        }
      }

      var workingDays = safeParse(ds.workingDays, [1, 2, 3, 4, 5]);
      var blackoutDates = safeParse(ds.blackoutDates || ds.blackouts, []);

      if (!Array.isArray(workingDays) || !workingDays.length) workingDays = [1, 2, 3, 4, 5];
      if (!Array.isArray(blackoutDates)) blackoutDates = [];

      function isBlackoutDate(date) {
        var iso = date.toISOString().split("T")[0];
        return blackoutDates.indexOf(iso) !== -1;
      }

      function calculateETA(now) {
        var dispatch = new Date(now);

        var passedCutoff =
          now.getHours() > cutoffHour ||
          (now.getHours() === cutoffHour && now.getMinutes() >= cutoffMin);

        if (passedCutoff) {
          dispatch.setDate(dispatch.getDate() + 1);
        }

        while (!workingDays.includes(dispatch.getDay()) || isBlackoutDate(dispatch)) {
          dispatch.setDate(dispatch.getDate() + 1);
        }

        var arrival = new Date(dispatch);
        var daysAdded = 0;
        while (daysAdded < leadDays) {
          arrival.setDate(arrival.getDate() + 1);
          if (workingDays.includes(arrival.getDay()) && !isBlackoutDate(arrival)) {
            daysAdded++;
          }
        }

        var options = { weekday: "short", month: "short", day: "numeric" };
        return {
          formattedDate: arrival.toLocaleDateString(undefined, options),
          passedCutoff: passedCutoff,
        };
      }

      function updateCountdown() {
        if (root.getAttribute("data-available") === "false") return;

        var now = new Date();
        var target = new Date();
        target.setHours(cutoffHour, cutoffMin, 0, 0);

        var isPast = now > target;
        if (isPast) {
          target.setDate(target.getDate() + 1);
        }

        var diff = target.getTime() - now.getTime();
        var hours = Math.floor(diff / (1000 * 60 * 60));
        var minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((diff % (1000 * 60)) / 1000);

        var h = String(hours).padStart(2, "0");
        var m = String(minutes).padStart(2, "0");
        var s = String(seconds).padStart(2, "0");

        if (timerEl) timerEl.textContent = h + "h " + m + "m " + s + "s";
        if (subtextEl) subtextEl.textContent = isPast ? nextDayText : sameDayText;

        var etaResult = calculateETA(now);
        if (etaEl) etaEl.textContent = etaResult.formattedDate;
      }

      function setStockState(isAvailable) {
        root.setAttribute("data-available", isAvailable ? "true" : "false");
        if (pillCard) pillCard.style.display = isAvailable ? "flex" : "none";
        if (backorderEl) backorderEl.style.display = isAvailable ? "none" : "flex";
        if (isAvailable) updateCountdown();
      }

      // Handle Shopify Variant Switches (events & form changes)
      document.addEventListener("variant:change", function (e) {
        var variant = e && e.detail && (e.detail.variant || e.detail);
        if (variant && variant.available != null) {
          setStockState(Boolean(variant.available));
        }
      });

      document.addEventListener("change", function (event) {
        var target = event.target;
        if (target && (target.name === "id" || target.closest('[data-section-type="product"], form[action*="/cart/add"]'))) {
          var form = target.closest("form") || document.querySelector('form[action*="/cart/add"]');
          if (!form) return;

          setTimeout(function () {
            var submitBtn = form.querySelector('[type="submit"], [name="add"], .product-form__submit');
            var isSoldOut = submitBtn && (submitBtn.disabled || /sold|unavail/i.test(submitBtn.textContent || ""));
            setStockState(!isSoldOut);
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
