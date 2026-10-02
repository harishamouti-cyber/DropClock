/**
 * DropClock Enterprise Client-Side Hydration Engine
 * Multi-surface: Product Page Pill & Cart Drawer Upsell
 */
(function () {
  "use strict";

  function safeParse(str, fallback) {
    if (!str) return fallback;
    try {
      var p = JSON.parse(str);
      return p != null ? p : fallback;
    } catch (e) {
      return fallback;
    }
  }

  function getMarketBuffer(country, overrides) {
    if (!country) return 0;
    var cc = country.toUpperCase();
    if (overrides && typeof overrides[cc] !== "undefined") {
      return parseInt(overrides[cc], 10) || 0;
    }
    if (cc === "US") return 0;
    if (cc === "CA" || cc === "MX" || cc === "PR") return 3;
    return 7;
  }

  function formatMoney(cents, symbol) {
    return (symbol || "$") + (cents / 100).toFixed(2);
  }

  function initProductPills() {
    var roots = document.querySelectorAll(".dropclock-widget-root, .dropclock-wrapper");
    if (!roots.length) return;

    roots.forEach(function (root) {
      var ds = root.dataset || {};
      var timerEl = root.querySelector("[data-dc-timer], .dc-timer-val, .dc-tc");
      var etaEl = root.querySelector("[data-dc-eta], .dc-eta-date, .dc-et");
      var subtextEl = root.querySelector("[data-dc-subtext], .dc-subtext, .dc-dt");
      var barFillEl = root.querySelector("[data-dc-bar-fill], .dc-bar-fill, .dc-bf");

      var cutoffHour = parseInt(ds.cutoffHour || "14", 10);
      var cutoffMin = parseInt(ds.cutoffMin != null ? ds.cutoffMin : (ds.cutoffMinute || "0"), 10);
      var baseLeadDays = parseInt(ds.leadDays || "2", 10);
      var tzOffset = parseInt(ds.timezoneOffset != null ? ds.timezoneOffset : (ds.tzOffset || 0), 10);
      var sameDayText = ds.samedayText || "for same-day dispatch";
      var nextDayText = ds.nextdayText || "for tomorrow's dispatch";

      var workingDays = safeParse(ds.workingDays, [1, 2, 3, 4, 5]);
      var blackoutDates = safeParse(ds.blackoutDates || ds.blackouts, []);
      var marketOverrides = safeParse(ds.marketOverrides, {});
      var currentCountry = ds.currentCountry || "US";

      if (!Array.isArray(workingDays) || !workingDays.length) workingDays = [1, 2, 3, 4, 5];
      if (!Array.isArray(blackoutDates)) blackoutDates = [];

      var effectiveLeadDays = baseLeadDays + getMarketBuffer(currentCountry, marketOverrides);

      function isBlackout(d) {
        var y = d.getUTCFullYear();
        var m = String(d.getUTCMonth() + 1).padStart(2, "0");
        var day = String(d.getUTCDate()).padStart(2, "0");
        return blackoutDates.indexOf(y + "-" + m + "-" + day) !== -1;
      }

      function updateCountdown() {
        if (root.getAttribute("data-available") === "false") return;

        var storeNow = new Date(Date.now() + tzOffset * 60000);
        var curSecs = storeNow.getUTCHours() * 3600 + storeNow.getUTCMinutes() * 60 + storeNow.getUTCSeconds();
        var cutSecs = cutoffHour * 3600 + cutoffMin * 60;
        var diffSecs = cutSecs - curSecs;
        var isPast = diffSecs <= 0;

        if (isPast) diffSecs += 86400;

        var h = String(Math.floor(diffSecs / 3600)).padStart(2, "0");
        var m = String(Math.floor((diffSecs % 3600) / 60)).padStart(2, "0");
        var s = String(Math.floor(diffSecs % 60)).padStart(2, "0");

        if (timerEl) timerEl.textContent = h + "h " + m + "m " + s + "s";
        if (subtextEl) subtextEl.textContent = isPast ? nextDayText : sameDayText;

        if (barFillEl) {
          var totalWindowSecs = 86400;
          var pct = Math.max(5, Math.min(100, Math.round((diffSecs / totalWindowSecs) * 100)));
          barFillEl.style.width = pct + "%";
        }

        // ETA calculation
        var d = new Date(storeNow);
        if (isPast) d.setUTCDate(d.getUTCDate() + 1);
        var left = effectiveLeadDays;
        while (left > 0 || workingDays.indexOf(d.getUTCDay()) === -1 || isBlackout(d)) {
          d.setUTCDate(d.getUTCDate() + 1);
          if (workingDays.indexOf(d.getUTCDay()) !== -1 && !isBlackout(d)) {
            if (left > 0) left--;
          }
        }

        try {
          var formatted = d.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric", timeZone: "UTC" });
          if (etaEl && etaEl.textContent !== formatted) etaEl.textContent = formatted;
        } catch (e) {}
      }

      updateCountdown();
      if (!root._dcInterval) {
        root._dcInterval = setInterval(updateCountdown, 1000);
      }
    });
  }

  function initCartPills() {
    var cartRoots = document.querySelectorAll(".dropclock-cart-pill-root");
    if (!cartRoots.length) return;

    cartRoots.forEach(function (root) {
      var ds = root.dataset || {};
      var timerEl = root.querySelector("[data-dc-cart-timer]");
      var msgEl = root.querySelector("[data-dc-cart-msg]");
      var barEl = root.querySelector("[data-dc-cart-bar]");

      var cutoffHour = parseInt(ds.cutoffHour || "14", 10);
      var cutoffMin = parseInt(ds.cutoffMin || "0", 10);
      var thresholdCents = parseInt(ds.thresholdCents || "7500", 10);
      var cartTotalCents = parseInt(ds.cartTotal || "0", 10);
      var currencySymbol = ds.currencySymbol || "$";
      var tzOffset = parseInt(ds.timezoneOffset || 0, 10);

      function updateCartPill(totalCents) {
        if (typeof totalCents === "number") {
          cartTotalCents = totalCents;
          root.dataset.cartTotal = totalCents;
        }

        var storeNow = new Date(Date.now() + tzOffset * 60000);
        var curSecs = storeNow.getUTCHours() * 3600 + storeNow.getUTCMinutes() * 60 + storeNow.getUTCSeconds();
        var cutSecs = cutoffHour * 3600 + cutoffMin * 60;
        var diffSecs = cutSecs - curSecs;
        var isPast = diffSecs <= 0;
        if (isPast) diffSecs += 86400;

        var h = String(Math.floor(diffSecs / 3600)).padStart(2, "0");
        var m = String(Math.floor((diffSecs % 3600) / 60)).padStart(2, "0");
        var s = String(Math.floor(diffSecs % 60)).padStart(2, "0");
        var timerStr = h + "h " + m + "m " + s + "s";

        if (timerEl) timerEl.textContent = timerStr;

        var diffCents = thresholdCents - cartTotalCents;
        var isQualified = diffCents <= 0;
        var progressPct = Math.min(100, Math.max(0, Math.round((cartTotalCents / thresholdCents) * 100)));

        if (barEl) {
          barEl.style.width = progressPct + "%";
          if (isQualified) {
            barEl.style.backgroundColor = "var(--dc-primary, #008060)";
          }
        }

        if (msgEl) {
          if (isQualified) {
            msgEl.innerHTML = '<span class="dc-qualified-badge font-bold">✓</span> <span class="dc-cart-title font-semibold">Free Express Delivery Qualified</span><div class="dc-cart-countdown text-xs opacity-80">⚡ Ships today if placed within <span class="dc-tabular font-mono">' + timerStr + '</span></div>';
          } else {
            var needed = formatMoney(diffCents, currencySymbol);
            msgEl.innerHTML = '<span class="dc-cart-title">Add <strong class="dc-highlight">' + needed + '</strong> more to unlock Free Express Delivery</span><div class="dc-cart-countdown text-xs opacity-80">Order within <span class="dc-tabular font-mono">' + timerStr + '</span> for today\'s dispatch</div>';
          }
        }
      }

      updateCartPill();
      if (!root._dcCartInterval) {
        root._dcCartInterval = setInterval(updateCartPill, 1000);
      }
      root._updateCartTotal = updateCartPill;
    });
  }

  function syncCartState() {
    fetch("/cart.js")
      .then(function (res) { return res.json(); })
      .then(function (cart) {
        if (cart && typeof cart.total_price === "number") {
          document.querySelectorAll(".dropclock-cart-pill-root").forEach(function (r) {
            if (typeof r._updateCartTotal === "function") {
              r._updateCartTotal(cart.total_price);
            }
          });
        }
      })
      .catch(function () {});
  }

  // Intercept Ajax cart requests
  if (typeof window.fetch === "function") {
    var origFetch = window.fetch;
    window.fetch = function () {
      var promise = origFetch.apply(this, arguments);
      var url = arguments[0];
      if (typeof url === "string" && (url.indexOf("/cart/add") !== -1 || url.indexOf("/cart/change") !== -1 || url.indexOf("/cart/update") !== -1 || url.indexOf("/cart/clear") !== -1)) {
        promise.then(function () { setTimeout(syncCartState, 250); });
      }
      return promise;
    };
  }

  document.addEventListener("DOMContentLoaded", function () {
    initProductPills();
    initCartPills();
  });

  window.addEventListener("shopify:section:load", function () {
    initProductPills();
    initCartPills();
  });

  window.DropClock = {
    init: function () {
      initProductPills();
      initCartPills();
    },
    refreshCart: syncCartState
  };
})();
