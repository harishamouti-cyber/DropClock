/**
 * DropClock Enterprise Client-Side Hydration Engine
 * - Multi-surface: Product Page Pill & Cart Drawer Upsell
 * - Smart Geolocation & Shopify Markets Regional Transit Buffers
 * - Real-time Ajax Cart Refresh & Dynamic Variant Change Observer
 * - Zero Layout Shift (CLS-Safe) & Tabular Numerals
 */
(function () {
  "use strict";

  function safeParse(str, fallback) {
    if (!str) return fallback;
    try {
      var parsed = JSON.parse(str);
      return parsed != null ? parsed : fallback;
    } catch (e) {
      return fallback;
    }
  }

  function getMarketTransitBuffer(countryCode, marketOverrides) {
    if (!countryCode) return 0;
    var cc = countryCode.toUpperCase();
    if (marketOverrides && typeof marketOverrides[cc] !== "undefined") {
      return parseInt(marketOverrides[cc], 10) || 0;
    }
    // Domestic (US) -> 0d
    if (cc === "US") return 0;
    // Neighboring North American Markets -> +3d
    if (cc === "CA" || cc === "MX" || cc === "PR") return 3;
    // Rest of World (Europe, Asia-Pacific, etc.) -> +7d
    return 7;
  }

  function formatMoney(cents, symbol) {
    var s = symbol || "$";
    var dollars = (cents / 100).toFixed(2);
    return s + dollars;
  }

  /* -------------------------------------------------------------------------
   * SURFACE 1: PRODUCT PAGE PILL ENGINE
   * ------------------------------------------------------------------------- */
  function initProductPills() {
    var roots = document.querySelectorAll(".dropclock-widget-root, .dropclock-wrapper");
    if (!roots.length) return;

    roots.forEach(function (root) {
      var ds = root.dataset || {};
      var timerEl = root.querySelector("[data-dc-timer], .dc-timer-val, .dc-tc");
      var etaEl = root.querySelector("[data-dc-eta], .dc-eta-date, .dc-et");
      var subtextEl = root.querySelector("[data-dc-subtext], .dc-subtext, .dc-dt");
      var pillCard = root.querySelector(".dc-pill-card, .dc-c");
      var backorderEl = root.querySelector(".dc-backorder-notice, .dc-b");
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

      var effectiveLeadDays = baseLeadDays + getMarketTransitBuffer(currentCountry, marketOverrides);

      function isBlackoutDate(date) {
        var iso = date.toISOString().split("T")[0];
        return blackoutDates.indexOf(iso) !== -1;
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

        var hStr = String(h).padStart(2, "0");
        var mStr = String(m).padStart(2, "0");
        var sStr = String(s).padStart(2, "0");

        if (timerEl) timerEl.textContent = hStr + "h " + mStr + "m " + sStr + "s";
        if (subtextEl) subtextEl.textContent = isPastCutoff ? nextDayText : sameDayText;

        if (barFillEl) {
          var startSecs = 8 * 3600; // 08:00 AM
          var windowSecs = cutoffSecs > startSecs ? cutoffSecs - startSecs : 14400;
          var pct = isPastCutoff ? 0 : Math.max(5, Math.min(100, Math.round((diffSecs / windowSecs) * 100)));
          barFillEl.style.width = pct + "%";
        }

        // Calculate Delivery Arrival Date skipping non-working days & blackout calendar
        var delivery = new Date(Date.UTC(storeNow.getUTCFullYear(), storeNow.getUTCMonth(), storeNow.getUTCDate()));
        if (isPastCutoff) {
          delivery.setUTCDate(delivery.getUTCDate() + 1);
        }

        var transitLeft = effectiveLeadDays;
        while (transitLeft > 0 || workingDays.indexOf(delivery.getUTCDay()) === -1 || isBlackoutDate(delivery)) {
          delivery.setUTCDate(delivery.getUTCDate() + 1);
          if (workingDays.indexOf(delivery.getUTCDay()) !== -1 && !isBlackoutDate(delivery)) {
            if (transitLeft > 0) transitLeft--;
          }
        }

        if (etaEl) {
          etaEl.textContent = delivery.toLocaleDateString(undefined, {
            timeZone: "UTC",
            weekday: "short",
            month: "short",
            day: "numeric",
          });
        }
      }

      function setStockState(isAvailable) {
        root.setAttribute("data-available", isAvailable ? "true" : "false");
        if (pillCard) pillCard.style.display = isAvailable ? "flex" : "none";
        if (backorderEl) backorderEl.style.display = isAvailable ? "none" : "flex";
        if (isAvailable) updateCountdown();
      }

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

  /* -------------------------------------------------------------------------
   * SURFACE 2: SLIDE-OUT CART DRAWER & CART PAGE UPSELL ENGINE
   * ------------------------------------------------------------------------- */
  function initCartPills() {
    var cartRoots = document.querySelectorAll(".dropclock-cart-pill-root, .dc-cart-root");
    if (!cartRoots.length) return;

    cartRoots.forEach(function (cartRoot) {
      var ds = cartRoot.dataset || {};
      var timerEl = cartRoot.querySelector("[data-dc-timer]");
      var etaEl = cartRoot.querySelector("[data-dc-eta]");
      var msgContainer = cartRoot.querySelector("[data-dc-cart-msg]");
      var progressBar = cartRoot.querySelector("[data-dc-progress]");

      var cutoffHour = parseInt(ds.cutoffHour || "14", 10);
      var cutoffMin = parseInt(ds.cutoffMin || "0", 10);
      var thresholdCents = parseInt(ds.thresholdCents || "7500", 10);
      var baseLeadDays = parseInt(ds.leadDays || "2", 10);
      var currencySymbol = ds.currencySymbol || "$";
      var tzOffset = parseInt(ds.timezoneOffset || "0", 10);

      var workingDays = safeParse(ds.workingDays, [1, 2, 3, 4, 5]);
      var blackoutDates = safeParse(ds.blackoutDates || ds.blackouts, []);
      var marketOverrides = safeParse(ds.marketOverrides, {});
      var currentCountry = ds.currentCountry || "US";

      if (!Array.isArray(workingDays) || !workingDays.length) workingDays = [1, 2, 3, 4, 5];
      if (!Array.isArray(blackoutDates)) blackoutDates = [];

      var effectiveLeadDays = baseLeadDays + getMarketTransitBuffer(currentCountry, marketOverrides);

      function isBlackoutDate(date) {
        var iso = date.toISOString().split("T")[0];
        return blackoutDates.indexOf(iso) !== -1;
      }

      function updateCartCountdown() {
        var storeNow = new Date(Date.now() + tzOffset * 60000);
        var currentSecs = storeNow.getUTCHours() * 3600 + storeNow.getUTCMinutes() * 60 + storeNow.getUTCSeconds();
        var cutoffSecs = cutoffHour * 3600 + cutoffMin * 60;
        var diffSecs = cutoffSecs - currentSecs;
        var isPastCutoff = diffSecs <= 0;

        if (isPastCutoff) {
          diffSecs += 86400;
        }

        var h = String(Math.floor(diffSecs / 3600)).padStart(2, "0");
        var m = String(Math.floor((diffSecs % 3600) / 60)).padStart(2, "0");
        var s = String(Math.floor(diffSecs % 60)).padStart(2, "0");

        if (timerEl) timerEl.textContent = h + "h " + m + "m " + s + "s";

        // Expected Arrival
        var delivery = new Date(Date.UTC(storeNow.getUTCFullYear(), storeNow.getUTCMonth(), storeNow.getUTCDate()));
        if (isPastCutoff) {
          delivery.setUTCDate(delivery.getUTCDate() + 1);
        }

        var transitLeft = effectiveLeadDays;
        while (transitLeft > 0 || workingDays.indexOf(delivery.getUTCDay()) === -1 || isBlackoutDate(delivery)) {
          delivery.setUTCDate(delivery.getUTCDate() + 1);
          if (workingDays.indexOf(delivery.getUTCDay()) !== -1 && !isBlackoutDate(delivery)) {
            if (transitLeft > 0) transitLeft--;
          }
        }

        if (etaEl) {
          etaEl.textContent = delivery.toLocaleDateString(undefined, {
            timeZone: "UTC",
            weekday: "short",
            month: "short",
            day: "numeric",
          });
        }
      }

      function refreshCartData(cartTotalCents) {
        var currentTotal = parseInt(cartTotalCents != null ? cartTotalCents : (ds.cartTotal || "0"), 10);
        var remainingCents = thresholdCents - currentTotal;
        var isQualified = remainingCents <= 0;

        var progressPct = Math.min(100, Math.max(0, Math.round((currentTotal / thresholdCents) * 100)));
        if (progressBar) {
          progressBar.style.width = progressPct + "%";
        }

        if (msgContainer) {
          if (isQualified) {
            msgContainer.innerHTML =
              '<span class="dc-qualified-badge">✓</span>' +
              '<span class="dc-cart-title font-semibold" style="color:#065f46">Free Express Delivery Qualified</span>' +
              '<span class="dc-cart-sub"> — Ships today if ordered within <strong class="dc-timer-val" data-dc-timer>--h --m --s</strong></span>';
          } else {
            msgContainer.innerHTML =
              '<span class="dc-cart-title">Add <strong class="dc-remaining-amount" data-dc-remaining>' +
              formatMoney(remainingCents, currencySymbol) +
              '</strong> more to unlock Free Express Delivery</span>' +
              '<span class="dc-cart-sub"> — Order within <strong class="dc-timer-val" data-dc-timer>--h --m --s</strong> for today\'s dispatch</span>';
          }
          timerEl = cartRoot.querySelector("[data-dc-timer]");
        }
        updateCartCountdown();
      }

      // Fetch live cart on load and when Ajax actions occur
      function fetchLiveCart() {
        fetch("/cart.js")
          .then(function (res) { return res.json(); })
          .then(function (cart) {
            if (cart && typeof cart.total_price === "number") {
              refreshCartData(cart.total_price);
            }
          })
          .catch(function () {});
      }

      updateCartCountdown();
      setInterval(updateCartCountdown, 1000);

      // Event listeners for theme drawer updates
      document.addEventListener("cart:updated", fetchLiveCart);
      document.addEventListener("cart:refresh", fetchLiveCart);
    });
  }

  // Intercept Ajax fetch / XHR requests targeting cart endpoints
  function setupAjaxCartInterceptor() {
    if (typeof window.fetch === "function") {
      var origFetch = window.fetch;
      window.fetch = function () {
        var promise = origFetch.apply(this, arguments);
        var url = arguments[0];
        if (typeof url === "string" && (url.indexOf("/cart/add") !== -1 || url.indexOf("/cart/change") !== -1 || url.indexOf("/cart/update") !== -1 || url.indexOf("/cart/clear") !== -1)) {
          promise.then(function () {
            setTimeout(function () {
              document.dispatchEvent(new CustomEvent("cart:refresh"));
            }, 250);
          });
        }
        return promise;
      };
    }
  }

  function initAll() {
    initProductPills();
    initCartPills();
    setupAjaxCartInterceptor();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAll);
  } else {
    initAll();
  }
})();
