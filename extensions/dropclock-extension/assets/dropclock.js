(function () {
  "use strict";

  function parseJson(str, fallback) {
    if (!str) return fallback;
    try {
      var val = JSON.parse(str);
      return val != null ? val : fallback;
    } catch (e) {
      return fallback;
    }
  }

  function getCountryLeadDays(country, marketOverrides) {
    if (!country) return 0;
    var c = country.toUpperCase();
    if (marketOverrides && typeof marketOverrides[c] !== "undefined") {
      return parseInt(marketOverrides[c], 10) || 0;
    }
    if (c === "US") return 0;
    if (c === "CA" || c === "MX" || c === "PR") return 3;
    return 7;
  }

  function formatStoreCurrency(centsOrAmount, currencyCode, locale, fallbackSymbol) {
    var isCents = typeof centsOrAmount === "number" && (centsOrAmount >= 100 || Number.isInteger(centsOrAmount));
    var amount = isCents ? centsOrAmount / 100 : Number(centsOrAmount) || 0;
    var code = (currencyCode || "USD").toUpperCase();
    var loc = locale || (typeof navigator !== "undefined" && navigator.language) || "en-US";
    var sym = fallbackSymbol || "$";

    try {
      return new Intl.NumberFormat(loc, {
        style: "currency",
        currency: code,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount);
    } catch (e) {
      return sym + amount.toFixed(2);
    }
  }

  function initProductWidgets() {
    var widgets = document.querySelectorAll(".dropclock-widget-root, .dropclock-wrapper");
    if (!widgets.length) return;

    widgets.forEach(function (el) {
      var ds = el.dataset || {};
      var timerEl = el.querySelector("[data-dc-timer], .dc-timer-val, .dc-tc");
      var etaEl = el.querySelector("[data-dc-eta], .dc-eta-date, .dc-et");
      var subtextEl = el.querySelector("[data-dc-subtext], .dc-subtext, .dc-dt");
      var barEl = el.querySelector("[data-dc-bar-fill], .dc-bar-fill, .dc-bf");

      var cutoffH = parseInt(ds.cutoffHour || "14", 10);
      var cutoffM = parseInt(ds.cutoffMin != null ? ds.cutoffMin : ds.cutoffMinute || "0", 10);
      var leadDays = parseInt(ds.leadDays || "2", 10);
      var tzOffset = parseInt(ds.timezoneOffset != null ? ds.timezoneOffset : ds.tzOffset || 0, 10);
      var sameDay = ds.samedayText || "for same-day dispatch";
      var nextDay = ds.nextdayText || "for tomorrow's dispatch";
      var workingDays = parseJson(ds.workingDays, [1, 2, 3, 4, 5]);
      var blackouts = parseJson(ds.blackoutDates || ds.blackouts, []);
      var marketOverrides = parseJson(ds.marketOverrides, {});
      var country = ds.currentCountry || "US";

      if (!Array.isArray(workingDays) || !workingDays.length) workingDays = [1, 2, 3, 4, 5];
      if (!Array.isArray(blackouts)) blackouts = [];

      var totalLead = leadDays + getCountryLeadDays(country, marketOverrides);

      function isBlackout(date) {
        var y = date.getUTCFullYear();
        var m = String(date.getUTCMonth() + 1).padStart(2, "0");
        var d = String(date.getUTCDate()).padStart(2, "0");
        return blackouts.indexOf(y + "-" + m + "-" + d) !== -1;
      }

      function updateClock() {
        if (el.getAttribute("data-available") === "false") return;

        var now = new Date(Date.now() + tzOffset * 60000);
        var currentSecs = now.getUTCHours() * 3600 + now.getUTCMinutes() * 60 + now.getUTCSeconds();
        var targetSecs = cutoffH * 3600 + cutoffM * 60;
        var diff = targetSecs - currentSecs;
        var passed = diff <= 0;

        if (passed) diff += 86400;

        var hh = String(Math.floor(diff / 3600)).padStart(2, "0");
        var mm = String(Math.floor((diff % 3600) / 60)).padStart(2, "0");
        var ss = String(Math.floor(diff % 60)).padStart(2, "0");

        if (timerEl) timerEl.textContent = hh + "h " + mm + "m " + ss + "s";
        if (subtextEl) subtextEl.textContent = passed ? nextDay : sameDay;

        if (barEl) {
          var pct = Math.max(5, Math.min(100, Math.round((diff / 86400) * 100)));
          barEl.style.width = pct + "%";
        }

        var eta = new Date(now);
        if (passed) eta.setUTCDate(eta.getUTCDate() + 1);

        var daysLeft = totalLead;
        while (daysLeft > 0 || workingDays.indexOf(eta.getUTCDay()) === -1 || isBlackout(eta)) {
          eta.setUTCDate(eta.getUTCDate() + 1);
          if (workingDays.indexOf(eta.getUTCDay()) !== -1 && !isBlackout(eta) && daysLeft > 0) {
            daysLeft--;
          }
        }

        try {
          var formattedEta = eta.toLocaleDateString("en-US", {
            weekday: "long",
            month: "short",
            day: "numeric",
            timeZone: "UTC",
          });
          if (etaEl && etaEl.textContent !== formattedEta) {
            etaEl.textContent = formattedEta;
          }
        } catch (e) {}
      }

      updateClock();
      if (!el._dcInterval) {
        el._dcInterval = setInterval(updateClock, 1000);
      }
    });
  }

  function initCartPills() {
    var pills = document.querySelectorAll(".dropclock-cart-pill-root");
    if (!pills.length) return;

    pills.forEach(function (pill) {
      var ds = pill.dataset || {};
      var timerEl = pill.querySelector("[data-dc-cart-timer]");
      var msgEl = pill.querySelector("[data-dc-cart-msg]");
      var barEl = pill.querySelector("[data-dc-cart-bar]");

      var cutoffH = parseInt(ds.cutoffHour || "14", 10);
      var cutoffM = parseInt(ds.cutoffMin || "0", 10);
      var thresholdCents = parseInt(ds.thresholdCents || "7500", 10);
      var cartTotalCents = parseInt(ds.cartTotal || "0", 10);
      var currencySym = ds.currencySymbol || "$";
      var currencyCode = ds.currency || "USD";
      var locale = ds.locale || "en";
      var tzOffset = parseInt(ds.timezoneOffset || 0, 10);

      function updatePill(newTotalCents) {
        if (typeof newTotalCents === "number") {
          cartTotalCents = newTotalCents;
          pill.dataset.cartTotal = String(newTotalCents);
        }

        var now = new Date(Date.now() + tzOffset * 60000);
        var curSec = now.getUTCHours() * 3600 + now.getUTCMinutes() * 60 + now.getUTCSeconds();
        var cutSec = cutoffH * 3600 + cutoffM * 60;
        var diff = cutSec - curSec;
        var passed = diff <= 0;
        if (passed) diff += 86400;

        var hh = String(Math.floor(diff / 3600)).padStart(2, "0");
        var mm = String(Math.floor((diff % 3600) / 60)).padStart(2, "0");
        var ss = String(Math.floor(diff % 60)).padStart(2, "0");
        var timerStr = hh + "h " + mm + "m " + ss + "s";

        if (timerEl) timerEl.textContent = timerStr;

        var remainingCents = thresholdCents - cartTotalCents;
        var isQualified = remainingCents <= 0;
        var pct = Math.min(100, Math.max(0, Math.round((cartTotalCents / thresholdCents) * 100)));

        if (barEl) {
          barEl.style.width = pct + "%";
          if (isQualified) {
            barEl.style.backgroundColor = "var(--dc-primary, #008060)";
          }
        }

        if (msgEl) {
          if (isQualified) {
            msgEl.innerHTML =
              '<span class="dc-qualified-badge font-bold">✓</span> ' +
              '<span class="dc-cart-title font-semibold">Free Express Delivery Qualified</span>' +
              '<div class="dc-cart-countdown text-xs opacity-80">⚡ Ships today if placed within <span class="dc-tabular font-mono">' +
              timerStr +
              "</span></div>";
          } else {
            var formattedNeed = formatStoreCurrency(remainingCents, currencyCode, locale, currencySym);
            msgEl.innerHTML =
              '<span class="dc-cart-title">Add <strong class="dc-highlight">' +
              formattedNeed +
              "</strong> more to unlock Free Express Delivery</span>" +
              '<div class="dc-cart-countdown text-xs opacity-80">Order within <span class="dc-tabular font-mono">' +
              timerStr +
              "</span> for today's dispatch</div>";
          }
        }
      }

      updatePill();
      if (!pill._dcCartInterval) {
        pill._dcCartInterval = setInterval(updatePill, 1000);
      }
      pill._updateCartTotal = updatePill;
    });
  }

  function fetchLatestCart() {
    fetch("/cart.js")
      .then(function (r) {
        return r.json();
      })
      .then(function (cart) {
        if (cart && typeof cart.total_price === "number") {
          document.querySelectorAll(".dropclock-cart-pill-root").forEach(function (p) {
            if (typeof p._updateCartTotal === "function") {
              p._updateCartTotal(cart.total_price);
            }
          });
        }
      })
      .catch(function () {});
  }

  if (typeof window.fetch === "function") {
    var nativeFetch = window.fetch;
    window.fetch = function () {
      var call = nativeFetch.apply(this, arguments);
      var url = arguments[0];
      if (
        typeof url === "string" &&
        (url.indexOf("/cart/add") !== -1 ||
          url.indexOf("/cart/change") !== -1 ||
          url.indexOf("/cart/update") !== -1 ||
          url.indexOf("/cart/clear") !== -1)
      ) {
        call.then(function () {
          setTimeout(fetchLatestCart, 250);
        });
      }
      return call;
    };
  }

  function handleVariantAvailability(variantOrId) {
    var roots = document.querySelectorAll(".dropclock-widget-root, .dropclock-wrapper");
    if (!roots.length) return;

    var id = typeof variantOrId === "object" ? variantOrId.id : variantOrId;
    var available = typeof variantOrId === "object" ? variantOrId.available !== false : true;

    if (
      typeof variantOrId !== "object" &&
      window.ShopifyAnalytics &&
      window.ShopifyAnalytics.meta &&
      window.ShopifyAnalytics.meta.product &&
      Array.isArray(window.ShopifyAnalytics.meta.product.variants)
    ) {
      var match = window.ShopifyAnalytics.meta.product.variants.find(function (v) {
        return String(v.id) === String(id);
      });
      if (match && typeof match.available === "boolean") {
        available = match.available;
      }
    }

    roots.forEach(function (r) {
      var pill = r.querySelector(".dc-pill-card");
      var backorder = r.querySelector(".dc-backorder-notice");
      if (available) {
        r.setAttribute("data-available", "true");
        if (pill) pill.style.display = "flex";
        if (backorder) backorder.style.display = "none";
      } else {
        r.setAttribute("data-available", "false");
        if (pill) pill.style.display = "none";
        if (backorder) {
          backorder.style.display = "flex";
          var span = backorder.querySelector("span");
          if (span) {
            span.textContent =
              "⚠️ Backorder Item: Ships as soon as restocked (Estimated dispatch in 5-7 days)";
          }
        }
      }
    });
  }

  document.addEventListener("change", function (e) {
    if (e.target && e.target.matches && e.target.matches('form[action*="/cart/add"] [name="id"], select[name="id"]')) {
      handleVariantAvailability(e.target.value);
    }
  });

  document.addEventListener("theme:variant:change", function (e) {
    if (e.detail && e.detail.variant) {
      handleVariantAvailability(e.detail.variant);
    }
  });

  document.addEventListener("DOMContentLoaded", function () {
    initProductWidgets();
    initCartPills();
  });

  window.addEventListener("shopify:section:load", function () {
    initProductWidgets();
    initCartPills();
  });

  window.DropClock = {
    init: function () {
      initProductWidgets();
      initCartPills();
    },
    refreshCart: fetchLatestCart,
    handleVariantShift: handleVariantAvailability,
    formatStoreCurrency: formatStoreCurrency,
  };
})();
