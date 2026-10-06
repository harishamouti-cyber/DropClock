(function () {
  "use strict";

  // Prevent multiple script execution collisions
  if (window.__DropClockInitialized) {
    if (window.DropClock && typeof window.DropClock.init === "function") {
      window.DropClock.init();
    }
    return;
  }
  window.__DropClockInitialized = true;

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

  /**
   * Unified Store Clock Calculator
   * Accurately calculates store wall-clock time honoring IANA Timezone (with DST) or UTC offset.
   */
  function getStoreDate(ianaTz, tzOffsetMinutes) {
    var now = new Date();
    if (ianaTz && ianaTz !== "UTC" && typeof Intl !== "undefined" && Intl.DateTimeFormat) {
      try {
        var str = now.toLocaleString("en-US", { timeZone: ianaTz });
        var parsed = new Date(str);
        if (!isNaN(parsed.getTime())) {
          return parsed;
        }
      } catch (e) {}
    }
    return new Date(Date.now() + (tzOffsetMinutes || 0) * 60000);
  }

  /**
   * Standardized Cutoff Countdown Engine
   * Calculates difference until today's or tomorrow's dispatch cutoff.
   */
  function computeCountdown(cutoffH, cutoffM, storeDate) {
    var curSecs = storeDate.getHours() * 3600 + storeDate.getMinutes() * 60 + storeDate.getSeconds();
    var cutSecs = cutoffH * 3600 + cutoffM * 60;
    var diff = cutSecs - curSecs;
    var passed = diff <= 0;

    if (passed) {
      diff += 86400; // Count down to tomorrow's cutoff
    }

    var hh = String(Math.floor(diff / 3600)).padStart(2, "0");
    var mm = String(Math.floor((diff % 3600) / 60)).padStart(2, "0");
    var ss = String(Math.floor(diff % 60)).padStart(2, "0");

    return {
      passed: passed,
      diff: diff,
      timerFormatted: hh + "h " + mm + "m " + ss + "s",
      timerShort: hh + ":" + mm + ":" + ss,
      percentage: Math.max(5, Math.min(100, Math.round((diff / 86400) * 100))),
    };
  }

  /**
   * Built for Shopify (BFS) Delivery Fulfillment Arrival ETA Engine
   * Computes accurate arrival date honoring operating days, blackout dates, and transit days.
   */
  function computeArrivalETA(storeDate, passed, totalLeadDays, workingDays, blackouts) {
    try {
      var d = new Date(storeDate.getTime());
      if (passed) {
        d.setDate(d.getDate() + 1);
      }

      function isOperating(target) {
        var day = target.getDay();
        var y = target.getFullYear();
        var m = String(target.getMonth() + 1).padStart(2, "0");
        var dayNum = String(target.getDate()).padStart(2, "0");
        var iso = y + "-" + m + "-" + dayNum;
        return workingDays.indexOf(day) !== -1 && blackouts.indexOf(iso) === -1;
      }

      // Advance to next operating dispatch day
      var safetyLimit = 30;
      while (!isOperating(d) && safetyLimit > 0) {
        d.setDate(d.getDate() + 1);
        safetyLimit--;
      }

      // Transit delivery lead days
      var transitLeft = Math.max(1, totalLeadDays);
      safetyLimit = 60;
      while (transitLeft > 0 && safetyLimit > 0) {
        d.setDate(d.getDate() + 1);
        if (isOperating(d)) {
          transitLeft--;
        }
        safetyLimit--;
      }

      return d.toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
      });
    } catch (err) {
      var fallback = new Date(storeDate.getTime() + (totalLeadDays + (passed ? 1 : 0)) * 86400000);
      return fallback.toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
      });
    }
  }

  /**
   * Product Widgets Updater
   */
  function updateProductWidgets() {
    var widgets = document.querySelectorAll(".dropclock-widget-root, .dropclock-wrapper");
    if (!widgets.length) return;

    widgets.forEach(function (el) {
      if (el.getAttribute("data-available") === "false") return;

      var ds = el.dataset || {};
      var timerEl = el.querySelector("[data-dc-timer], .dc-timer-val, .dc-tc");
      var etaEl = el.querySelector("[data-dc-eta], .dc-eta-date, .dc-et");
      var subtextEl = el.querySelector("[data-dc-subtext], .dc-subtext, .dc-dt");
      var barEl = el.querySelector("[data-dc-bar-fill], .dc-bar-fill, .dc-bf");

      var cutoffH = parseInt(ds.cutoffHour || "14", 10);
      var cutoffM = parseInt(ds.cutoffMinute != null ? ds.cutoffMinute : ds.cutoffMin || "0", 10);
      var leadDays = parseInt(ds.leadDays || "2", 10);
      var tzOffset = parseInt(ds.timezoneOffset != null ? ds.timezoneOffset : ds.tzOffset || 0, 10);
      var ianaTz = ds.ianaTz || "UTC";
      var sameDayText = ds.samedayText || "for same-day dispatch";
      var nextDayText = ds.nextdayText || "for tomorrow's dispatch";
      var workingDays = parseJson(ds.workingDays, [1, 2, 3, 4, 5]);
      var blackouts = parseJson(ds.blackoutDates || ds.blackouts, []);
      var marketOverrides = parseJson(ds.marketOverrides, {});
      var country = ds.currentCountry || "US";

      if (!Array.isArray(workingDays) || !workingDays.length) workingDays = [1, 2, 3, 4, 5];
      if (!Array.isArray(blackouts)) blackouts = [];

      var totalLead = leadDays + getCountryLeadDays(country, marketOverrides);
      var storeDate = getStoreDate(ianaTz, tzOffset);
      var cd = computeCountdown(cutoffH, cutoffM, storeDate);

      // 1. Update live countdown timer
      if (timerEl && timerEl.textContent !== cd.timerFormatted) {
        timerEl.textContent = cd.timerFormatted;
      }

      // 2. Update dispatch label (synchronous and consistent)
      var targetSubtext = cd.passed ? nextDayText : sameDayText;
      if (subtextEl && subtextEl.textContent !== targetSubtext) {
        subtextEl.textContent = targetSubtext;
      }

      // 3. Update urgency bar if present
      if (barEl) {
        barEl.style.width = cd.percentage + "%";
      }

      // 4. Update arrival ETA immediately (never left in "Calculating...")
      var etaFormatted = computeArrivalETA(storeDate, cd.passed, totalLead, workingDays, blackouts);
      if (etaEl && etaEl.textContent !== etaFormatted) {
        etaEl.textContent = etaFormatted;
      }
    });
  }

  /**
   * Cart Drawer / Cart Page Pills Updater
   */
  function updateCartPills(customCartTotal) {
    var pills = document.querySelectorAll(".dropclock-cart-pill-root");
    if (!pills.length) return;

    pills.forEach(function (pill) {
      var ds = pill.dataset || {};
      var timerEl = pill.querySelector("[data-dc-timer], [data-dc-cart-timer], .dc-timer-val");
      var etaEl = pill.querySelector("[data-dc-eta], [data-dc-cart-eta], .dc-eta-date");
      var msgEl = pill.querySelector("[data-dc-cart-msg], .dc-cart-content");
      var barEl = pill.querySelector("[data-dc-progress], [data-dc-cart-bar], .dc-threshold-bar");

      var cutoffH = parseInt(ds.cutoffHour || "14", 10);
      var cutoffM = parseInt(ds.cutoffMinute != null ? ds.cutoffMinute : ds.cutoffMin || "0", 10);
      var thresholdCents = parseInt(ds.thresholdCents || "7500", 10);

      var cartTotalCents = typeof customCartTotal === "number"
        ? customCartTotal
        : parseInt(ds.cartTotal || "0", 10);

      if (typeof customCartTotal === "number") {
        pill.dataset.cartTotal = String(customCartTotal);
      }

      var currencySym = ds.currencySymbol || "$";
      var currencyCode = ds.currency || "USD";
      var locale = ds.locale || "en";
      var tzOffset = parseInt(ds.timezoneOffset || 0, 10);
      var ianaTz = ds.ianaTz || "UTC";
      var leadDays = parseInt(ds.leadDays || "2", 10);
      var workingDays = parseJson(ds.workingDays, [1, 2, 3, 4, 5]);
      var blackouts = parseJson(ds.blackouts, []);
      var marketOverrides = parseJson(ds.marketOverrides, {});
      var country = ds.currentCountry || "US";

      if (!Array.isArray(workingDays) || !workingDays.length) workingDays = [1, 2, 3, 4, 5];
      if (!Array.isArray(blackouts)) blackouts = [];

      var totalLead = leadDays + getCountryLeadDays(country, marketOverrides);
      var storeDate = getStoreDate(ianaTz, tzOffset);
      var cd = computeCountdown(cutoffH, cutoffM, storeDate);

      // 1. Update countdown timer
      if (timerEl && timerEl.textContent !== cd.timerFormatted) {
        timerEl.textContent = cd.timerFormatted;
      }

      // 2. Update arrival ETA immediately (never stuck at "Calculating...")
      var etaFormatted = computeArrivalETA(storeDate, cd.passed, totalLead, workingDays, blackouts);
      if (etaEl && etaEl.textContent !== etaFormatted) {
        etaEl.textContent = etaFormatted;
      }

      // 3. Update Free Shipping threshold calculations
      var remainingCents = thresholdCents - cartTotalCents;
      var isQualified = remainingCents <= 0;
      var progressPct = Math.min(100, Math.max(0, Math.round((cartTotalCents / thresholdCents) * 100)));

      if (barEl) {
        barEl.style.width = progressPct + "%";
        if (isQualified) {
          barEl.style.backgroundColor = "var(--dc-primary, #008060)";
        }
      }

      // 4. Update dynamic cart messaging with strictly synchronized dispatch phrasing
      if (msgEl) {
        var dispatchPhrase = cd.passed ? "for tomorrow's dispatch" : "for today's dispatch";
        var shipsPhrase = cd.passed ? "⚡ Ships tomorrow if placed within " : "⚡ Ships today if placed within ";

        if (isQualified) {
          msgEl.innerHTML =
            '<span class="dc-qualified-badge font-bold">✓</span> ' +
            '<span class="dc-cart-title font-semibold text-emerald-800">Free Express Delivery Qualified</span> ' +
            '<span class="dc-cart-sub text-xs opacity-90">— ' +
            shipsPhrase +
            '<strong class="dc-timer-val font-mono" data-dc-timer>' +
            cd.timerFormatted +
            "</strong></span>";
        } else {
          var formattedNeed = formatStoreCurrency(remainingCents, currencyCode, locale, currencySym);
          msgEl.innerHTML =
            '<span class="dc-cart-title">Add <strong class="dc-remaining-amount font-semibold">' +
            formattedNeed +
            "</strong> more to unlock Free Express Delivery</span> " +
            '<span class="dc-cart-sub text-xs opacity-90">— Order within <strong class="dc-timer-val font-mono" data-dc-timer>' +
            cd.timerFormatted +
            "</strong> " +
            dispatchPhrase +
            "</span>";
        }
      }
    });
  }

  /**
   * Unified Master Tick Loop (1-second precision, perfectly synchronized across all widgets)
   */
  function updateAllWidgets() {
    updateProductWidgets();
    updateCartPills();
  }

  /**
   * Live Cart Fetcher
   */
  function fetchLatestCart() {
    fetch("/cart.js")
      .then(function (res) {
        if (!res.ok) throw new Error("Cart fetch failed");
        return res.json();
      })
      .then(function (cart) {
        if (cart && typeof cart.total_price === "number") {
          updateCartPills(cart.total_price);
        }
      })
      .catch(function () {});
  }

  /**
   * Network Interceptors (Capture Ajax Cart Adds, Removals, Drawer Changes)
   */
  if (typeof window.fetch === "function") {
    var originalFetch = window.fetch;
    window.fetch = function () {
      var call = originalFetch.apply(this, arguments);
      var url = arguments[0];
      if (
        typeof url === "string" &&
        (url.indexOf("/cart/add") !== -1 ||
          url.indexOf("/cart/change") !== -1 ||
          url.indexOf("/cart/update") !== -1 ||
          url.indexOf("/cart/clear") !== -1)
      ) {
        call.then(function () {
          setTimeout(fetchLatestCart, 200);
        });
      }
      return call;
    };
  }

  if (typeof window.XMLHttpRequest === "function") {
    var originalOpen = window.XMLHttpRequest.prototype.open;
    window.XMLHttpRequest.prototype.open = function (method, url) {
      if (
        typeof url === "string" &&
        (url.indexOf("/cart/add") !== -1 ||
          url.indexOf("/cart/change") !== -1 ||
          url.indexOf("/cart/update") !== -1 ||
          url.indexOf("/cart/clear") !== -1)
      ) {
        this.addEventListener("load", function () {
          setTimeout(fetchLatestCart, 200);
        });
      }
      return originalOpen.apply(this, arguments);
    };
  }

  /**
   * Variant Stock Availability Shifts (Hides timer & shows backorder badge on out-of-stock variants)
   */
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
            span.textContent = "Backorder Item: Ships as soon as restocked.";
          }
        }
      }
    });
  }

  // Variant change event listeners
  document.addEventListener("change", function (e) {
    if (
      e.target &&
      e.target.matches &&
      e.target.matches('form[action*="/cart/add"] [name="id"], select[name="id"]')
    ) {
      handleVariantAvailability(e.target.value);
    }
  });

  document.addEventListener("theme:variant:change", function (e) {
    if (e.detail && e.detail.variant) {
      handleVariantAvailability(e.detail.variant);
    }
  });

  // Cart update listeners across major Shopify themes
  var cartEvents = ["cart:updated", "cart:refresh", "cart-drawer:updated", "ajaxCart.afterCartLoad", "theme:cart:change"];
  cartEvents.forEach(function (evt) {
    document.addEventListener(evt, fetchLatestCart);
    window.addEventListener(evt, fetchLatestCart);
  });

  // Lifecycle Initialization
  function startEngine() {
    updateAllWidgets();
    if (!window.__DropClockInterval) {
      window.__DropClockInterval = setInterval(updateAllWidgets, 1000);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startEngine);
  } else {
    startEngine();
  }

  window.addEventListener("shopify:section:load", startEngine);

  // Global DropClock API
  window.DropClock = {
    init: startEngine,
    updateAll: updateAllWidgets,
    refreshCart: fetchLatestCart,
    handleVariantShift: handleVariantAvailability,
    formatStoreCurrency: formatStoreCurrency,
  };
})();
