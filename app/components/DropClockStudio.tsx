import { useState, useMemo, useEffect } from "react";
import { useSubmit, useNavigation } from "@remix-run/react";
import { Page, Badge, Banner } from "@shopify/polaris";
import { DropClockLogo } from "./DropClockLogo";

export interface StudioSettings {
  id?: string | null;
  shop: string;
  cutoffHour: number;
  cutoffMinute: number;
  leadDays: number;
  workingDays: string;
  blackoutDates?: string | null;
  tagRules?: string | null;
  tagRulesJson?: string | null;
  marketOverrides?: string | null;
  widgetStyle?: string | null;
  presetStyle?: string | null;
  accentColor?: string | null;
  primaryColor?: string | null;
  cardBg?: string | null;
  bgColor?: string | null;
  textColor?: string | null;
  leadText?: string | null;
  sameDayText?: string | null;
  nextDayText?: string | null;
  etaText?: string | null;
  translations?: string | null;
  freeShippingThreshold?: number | null;
}

// Resilient Client-Side Storage Guard (Safari Private Browsing / iOS WebView SecurityError Defense)
export const safeStorage = {
  getItem: (key: string): string | null => {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        return window.localStorage.getItem(key);
      }
    } catch {
      return null;
    }
    return null;
  },
  setItem: (key: string, value: string): void => {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.setItem(key, value);
      }
    } catch (e) {
      console.warn("Storage restricted", e);
    }
  },
  removeItem: (key: string): void => {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    } catch (e) {
      console.warn("Storage restricted", e);
    }
  },
};

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "ui-title-bar": any;
      "ui-save-bar": any;
    }
  }
  interface Window {
    shopify?: {
      open?: (url: string, target?: string) => void;
      saveBar?: {
        show: (id: string) => void;
        hide: (id: string) => void;
      };
    };
  }
}

interface DropClockStudioProps {
  settings: StudioSettings;
  shop: string;
  ianaTimezone: string;
  timezoneOffsetMinutes: number;
  isStandalone?: boolean;
  extensionId?: string;
}


// Crisp Monochrome Lucide-style SVG Icons
const ActivityIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" style={{ pointerEvents: "none" }}>
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);

const ShoppingBagIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ pointerEvents: "none" }}>
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
    <path d="M3 6h18" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
);

const SidebarCloseIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ pointerEvents: "none" }}>
    <rect width="18" height="18" x="3" y="3" rx="2" />
    <path d="M9 3v18" />
    <path d="m16 15-3-3 3-3" />
  </svg>
);

const ShoppingCartIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ pointerEvents: "none" }}>
    <circle cx="8" cy="21" r="1" />
    <circle cx="19" cy="21" r="1" />
    <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
  </svg>
);

const PackageCheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ pointerEvents: "none" }}>
    <path d="m16 16 2 2 4-4" />
    <path d="M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l2-1.14" />
    <path d="m7.5 4.27 9 5.15" />
    <polyline points="3.29 7 12 12 20.71 7" />
    <line x1="12" y1="22" x2="12" y2="12" />
  </svg>
);

const Clock3Icon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ pointerEvents: "none" }}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16.5 12" />
  </svg>
);

const GlobeIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

const ClockIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const TruckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="15" height="13" />
    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
    <circle cx="5.5" cy="18.5" r="2.5" />
    <circle cx="18.5" cy="18.5" r="2.5" />
  </svg>
);

const ShieldCheckIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <polyline points="9 12 11 14 15 10" />
  </svg>
);

const SparklesIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    <path d="M5 3v4" />
    <path d="M19 17v4" />
    <path d="M3 5h4" />
    <path d="M17 19h4" />
  </svg>
);

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const ExternalLinkIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

const LayoutIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="18" x="3" y="3" rx="2" />
    <path d="M3 9h18" />
    <path d="M9 21V9" />
  </svg>
);

const CapsuleIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="6" width="18" height="12" rx="6" />
    <circle cx="8" cy="12" r="2" />
  </svg>
);

const MinimalIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" x2="20" y1="12" y2="12" />
    <line x1="4" x2="14" y1="6" y2="6" />
    <line x1="4" x2="10" y1="18" y2="18" />
  </svg>
);

const ProgressBarIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="6" width="20" height="12" rx="4" />
    <path d="M6 12h8" />
  </svg>
);

const AlertTriangleIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const CalendarIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const TagIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z" />
    <path d="M7 7h.01" />
  </svg>
);

const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

const RefreshCwIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
    <path d="M21 3v5h-5" />
    <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
    <path d="M3 21v-5h5" />
  </svg>
);

const XIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const PlusIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const ChevronDownIcon = ({ open }: { open: boolean }) => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{
      transform: open ? "rotate(180deg)" : "rotate(0deg)",
      transition: "transform 0.2s ease",
    }}
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const BRAND_PRESETS = [
  {
    name: "Shopify Pine",
    primaryColor: "#008060",
    bgColor: "#F4F6F8",
    textColor: "#202223",
  },
  {
    name: "Modern Monochrome",
    primaryColor: "#18181B",
    bgColor: "#F4F4F5",
    textColor: "#09090B",
  },
  {
    name: "DTC Amber",
    primaryColor: "#D97706",
    bgColor: "#FFFBEB",
    textColor: "#451A03",
  },
  {
    name: "Electric Indigo",
    primaryColor: "#4F46E5",
    bgColor: "#EEF2FF",
    textColor: "#1E1B4B",
  },
];

/**
 * Definitive delivery fulfillment ETA calculation engine per Built for Shopify (BFS) standards.
 * Dynamically computes dispatch date and arrival date honoring operational schedule and blackout dates.
 */
export function computeFulfillmentETA({
  cutoffHour = 14,
  cutoffMinute = 0,
  leadDays = 2,
  workingDays = [1, 2, 3, 4, 5], // Monday - Friday
  blackoutDates = [],
  ianaTimezone = "America/New_York",
  tagLeadDays = 0,
}: {
  cutoffHour?: number;
  cutoffMinute?: number;
  leadDays?: number;
  workingDays?: number[];
  blackoutDates?: string[];
  ianaTimezone?: string;
  tagLeadDays?: number;
}) {
  const now = new Date();
  const storeTimeString = now.toLocaleString("en-US", { timeZone: ianaTimezone });
  const storeDate = new Date(storeTimeString);

  const cutoff = new Date(storeDate);
  cutoff.setHours(cutoffHour, cutoffMinute, 0, 0);

  const isOperatingDay = (d: Date) => {
    const dayOfWeek = d.getDay();
    const iso = d.toISOString().split("T")[0];
    return workingDays.includes(dayOfWeek) && !blackoutDates.includes(iso);
  };

  let isSameDay = false;
  let dispatchDate = new Date(storeDate);

  if (storeDate < cutoff && isOperatingDay(storeDate)) {
    isSameDay = true;
    dispatchDate = new Date(storeDate);
  } else {
    do {
      dispatchDate.setDate(dispatchDate.getDate() + 1);
    } while (!isOperatingDay(dispatchDate));
  }

  let arrivalDate = new Date(dispatchDate);
  let totalTransitDays = Number(leadDays) + Number(tagLeadDays);

  while (totalTransitDays > 0) {
    arrivalDate.setDate(arrivalDate.getDate() + 1);
    if (isOperatingDay(arrivalDate)) {
      totalTransitDays--;
    }
  }

  const weekday = arrivalDate.toLocaleDateString("en-US", { weekday: "long" });
  const month = arrivalDate.toLocaleDateString("en-US", { month: "short" });
  const day = arrivalDate.getDate();

  return {
    isSameDay,
    dispatchLabel: isSameDay ? "for same-day dispatch" : "for tomorrow's dispatch",
    arrivalFormatted: `${weekday}, ${month} ${day}`,
  };
}

export const cartPresets = {
  below: {
    subtotal: 42.00,
    shipping: 5.99,
    items: [
      { name: "Classic Boxy Crewneck", size: "M", qty: 1, price: 42.00, image: "tshirt" }
    ]
  },
  near: {
    subtotal: 60.95,
    shipping: 5.99,
    items: [
      { name: "Classic Boxy Crewneck", size: "M", qty: 1, price: 42.00, image: "tshirt" },
      { name: "Heavyweight Knit Beanie", size: "OS", qty: 1, price: 18.95, image: "beanie" }
    ]
  },
  qualified: {
    subtotal: 84.00,
    shipping: 0.00,
    items: [
      { name: "Classic Boxy Crewneck", size: "M", qty: 2, price: 84.00, image: "tshirt" }
    ]
  }
};

/**
 * Dynamically computes delivery arrival date based on dispatch date, transit lead days,
 * active operating days, and warehouse blackout dates.
 */
export function calculateArrival(
  dispatchDate: Date,
  leadDays: number,
  workingDays: number[],
  blackoutDates: string[] = []
): Date {
  const isBlackout = (d: Date) => {
    const y = d.getFullYear();
    const m = (d.getMonth() + 1).toString().padStart(2, "0");
    const day = d.getDate().toString().padStart(2, "0");
    const isoStr = `${y}-${m}-${day}`;
    return blackoutDates.includes(isoStr);
  };

  const delivery = new Date(dispatchDate);
  let transitLeft = leadDays;
  while (transitLeft > 0 || !workingDays.includes(delivery.getDay()) || isBlackout(delivery)) {
    delivery.setDate(delivery.getDate() + 1);
    if (workingDays.includes(delivery.getDay()) && !isBlackout(delivery)) {
      if (transitLeft > 0) {
        transitLeft--;
      }
    }
  }
  return delivery;
}

/**
 * Formats monetary amounts using the store's currency and customer locale.
 * Supports numbers in full units or cents, with graceful fallback.
 */
export function formatStoreCurrency(
  centsOrAmount: number | string,
  currencyCode = "USD",
  locale = "en-US",
  fallbackSymbol = "$"
): string {
  const num = typeof centsOrAmount === "string" ? parseFloat(centsOrAmount) : centsOrAmount;
  if (isNaN(num)) return `${fallbackSymbol}0.00`;
  const isCents = Number.isInteger(num) && num >= 1000;
  const amount = isCents ? num / 100 : num;
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currencyCode.toUpperCase(),
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${fallbackSymbol}${amount.toFixed(2)}`;
  }
}

export function DropClockStudio({
  settings,
  shop,
  ianaTimezone,
  timezoneOffsetMinutes,
  isStandalone = false,
  extensionId: propExtensionId,
}: DropClockStudioProps) {
  const submit = useSubmit();
  const navigation = useNavigation();

  const shopify = typeof window !== "undefined" ? window.shopify : undefined;

  const shopDomain = shop || "my-store.myshopify.com";

  const handleAddToTheme = () => {
    const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : new URLSearchParams();
    const currentShop = params.get("shop") || shop || (typeof window !== "undefined" ? window.location.hostname : "my-store.myshopify.com");
    const cleanShop = currentShop.replace(/^https?:\/\//, "").replace(/\/$/, "");
    const extId = propExtensionId || process.env.SHOPIFY_DROPCLOCK_EXTENSION_ID || "dropclock-extension";
    const themeEditorUrl = `https://${cleanShop}/admin/themes/current/editor?template=product&addAppBlockId=${extId}/dropclock_pill&target=mainProduct`;

    if (shopify && typeof shopify.open === "function") {
      shopify.open(themeEditorUrl, "_blank");
    } else if (typeof window !== "undefined" && window.shopify && typeof window.shopify.open === "function") {
      window.shopify.open(themeEditorUrl, "_blank");
    } else if (typeof window !== "undefined") {
      window.open(themeEditorUrl, "_blank", "noopener,noreferrer");
    }
  };

  // Defensive App Bridge Environment Detection
  const [isEmbedded, setIsEmbedded] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    let inIframe = false;
    try {
      inIframe = window.self !== window.top;
    } catch {
      inIframe = true;
    }
    if (inIframe || Boolean(window.shopify?.saveBar)) {
      setIsEmbedded(true);
    }
  }, []);

  const safeHideSaveBar = () => {
    try {
      if (typeof window !== "undefined" && window.shopify?.saveBar?.hide) {
        window.shopify.saveBar.hide("dropclock-save-bar");
      }
    } catch (e) {
      console.warn("App Bridge saveBar.hide caught:", e);
    }
  };

  const safeShowSaveBar = () => {
    try {
      if (typeof window !== "undefined" && window.shopify?.saveBar?.show) {
        window.shopify.saveBar.show("dropclock-save-bar");
      }
    } catch (e) {
      console.warn("App Bridge saveBar.show caught:", e);
    }
  };

  // Dynamic Timezone Resolution
  const resolvedTimezone = useMemo(() => {
    if (ianaTimezone && ianaTimezone !== "UTC") {
      return ianaTimezone;
    }
    if (typeof window !== "undefined") {
      try {
        return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
      } catch {
        return "UTC";
      }
    }
    return "UTC";
  }, [ianaTimezone]);

  const resolvedOffsetMinutes = useMemo(() => {
    if (typeof timezoneOffsetMinutes === "number" && timezoneOffsetMinutes !== 0) {
      return timezoneOffsetMinutes;
    }
    if (typeof window !== "undefined") {
      return -new Date().getTimezoneOffset();
    }
    return 0;
  }, [timezoneOffsetMinutes]);

  const timezoneLabel = useMemo(() => {
    const hours = Math.floor(Math.abs(resolvedOffsetMinutes) / 60);
    const mins = Math.abs(resolvedOffsetMinutes) % 60;
    const sign = resolvedOffsetMinutes >= 0 ? "+" : "-";
    const minsStr = mins > 0 ? `:${mins.toString().padStart(2, "0")}` : "";
    return `${resolvedTimezone} (UTC${sign}${hours}${minsStr})`;
  }, [resolvedTimezone, resolvedOffsetMinutes]);

  // Form State
  const [cutoffHour, setCutoffHour] = useState(settings.cutoffHour);
  const [cutoffMinute, setCutoffMinute] = useState(settings.cutoffMinute);
  const [hourInput, setHourInput] = useState(settings.cutoffHour.toString().padStart(2, "0"));
  const [minuteInput, setMinuteInput] = useState(settings.cutoffMinute.toString().padStart(2, "0"));

  useEffect(() => {
    setHourInput(cutoffHour.toString().padStart(2, "0"));
  }, [cutoffHour]);

  useEffect(() => {
    setMinuteInput(cutoffMinute.toString().padStart(2, "0"));
  }, [cutoffMinute]);

  const [leadDays, setLeadDays] = useState(settings.leadDays);
  const [isCustomLeadDays, setIsCustomLeadDays] = useState(settings.leadDays > 2);
  const [presetStyle, setPresetStyle] = useState(settings.widgetStyle || settings.presetStyle || "capsule");
  const [primaryColor, setPrimaryColor] = useState(settings.accentColor || settings.primaryColor || "#008060");
  const [bgColor, setBgColor] = useState(settings.cardBg || settings.bgColor || "#F4F6F8");
  const [textColor, setTextColor] = useState(settings.textColor || "#202223");
  const [workingDays, setWorkingDays] = useState<number[]>(() => {
    try {
      const parsed = JSON.parse(settings.workingDays || "[1,2,3,4,5]");
      if (Array.isArray(parsed) && parsed.length > 0) {
        if (parsed.length === 1 && (parsed[0] === 0 || parsed[0] === 6)) {
          return [1, 2, 3, 4, 5];
        }
        return parsed;
      }
      return [1, 2, 3, 4, 5];
    } catch {
      return [1, 2, 3, 4, 5];
    }
  });

  // Warehouse Holiday & Blackout Dates State
  const [blackoutDates, setBlackoutDates] = useState<string[]>(() => {
    try {
      const parsed = JSON.parse(settings.blackoutDates || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });
  const [newBlackoutDate, setNewBlackoutDate] = useState<string>("");
  const [isBlackoutOpen, setIsBlackoutOpen] = useState(true);

  // Product Tag Overrides State
  const [tagRules, setTagRules] = useState<Array<{ tag: string; leadDays: number }>>(() => {
    try {
      const parsed = JSON.parse(settings.tagRules || settings.tagRulesJson || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });
  const [isTagRulesOpen, setIsTagRulesOpen] = useState(true);

  // Storefront Text & Translations State
  const [leadText, setLeadText] = useState(settings.leadText || "Order within");
  const [sameDayText, setSameDayText] = useState(settings.sameDayText || "for same-day dispatch");
  const [nextDayText, setNextDayText] = useState(settings.nextDayText || "for tomorrow's dispatch");
  const [etaText, setEtaText] = useState(settings.etaText || "Estimated Delivery:");
  const [isTranslationsOpen, setIsTranslationsOpen] = useState(true);

  // Mock Storefront Stock State & Dawn Variant Selector
  const [mockStockState, setMockStockState] = useState<"in_stock" | "backorder">("in_stock");
  const [selectedSize, setSelectedSize] = useState<"S" | "M" | "L" | "XL">("M");

  // Simulated Tag in Preview Canvas
  const [activeSimulatedTag, setActiveSimulatedTag] = useState<string>("none");

  // Device Viewport Toggle (Desktop Full vs Mobile 375px)
  const [viewportMode, setViewportMode] = useState<"desktop" | "mobile">("desktop");

  // Multi-Surface Preview Mode Switcher (Product Page vs Cart Drawer vs Thank You Page)
  const [activeSurface, setActiveSurface] = useState<"product" | "cart" | "thankyou">("product");

  // Simulated Cart State for Cart Drawer Preview & Configurable Threshold
  const [cartThreshold, setCartThreshold] = useState<number>(() => {
    if (typeof settings.freeShippingThreshold === "number" && settings.freeShippingThreshold > 0) {
      return settings.freeShippingThreshold;
    }
    const saved = safeStorage.getItem("dc_free_shipping_threshold");
    if (saved) {
      const parsed = parseFloat(saved);
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }
    return 75;
  });
  const [selectedCartPreset, setSelectedCartPreset] = useState<"below" | "near" | "qualified">("near");
  const [cartSubtotal, setCartSubtotal] = useState<number>(60.95);
  const [enableCartProgressBar, setEnableCartProgressBar] = useState<boolean>(() => {
    const cached = safeStorage.getItem("dc_enable_cart_progress_bar");
    return cached !== null ? cached === "true" : true;
  });
  // Canonical BFS state aliases per Mandate 7
  const cartGoalAmount = cartThreshold;
  const cartGoalEnabled = enableCartProgressBar;

  // BFS Compliance State: Dismissible Storefront Onboarding Banner
  const [isOnboardingDismissed, setIsOnboardingDismissed] = useState<boolean>(() => {
    return safeStorage.getItem("dc_onboarding_dismissed") === "true";
  });

  const handleDismissOnboarding = () => {
    setIsOnboardingDismissed(true);
    safeStorage.setItem("dc_onboarding_dismissed", "true");
  };

  // Multi-Currency & Locale Simulation
  const [selectedCurrency, setSelectedCurrency] = useState<string>("USD");
  const [selectedLocale, setSelectedLocale] = useState<string>("en-US");

  // BFS Reviewer Guide Dismissible State (Test / Dev / Review Store Mode)
  const [isReviewerGuideDismissed, setIsReviewerGuideDismissed] = useState<boolean>(() => {
    return safeStorage.getItem("dc_reviewer_guide_dismissed") === "true";
  });

  const handleDismissReviewerGuide = () => {
    setIsReviewerGuideDismissed(true);
    safeStorage.setItem("dc_reviewer_guide_dismissed", "true");
  };

  const isReviewerMode =
    isStandalone ||
    shopDomain.includes("test") ||
    shopDomain.includes("review") ||
    shopDomain.includes("demo") ||
    shopDomain.includes("myshopify.com");

  // BFS Compliance State: Conditional Empty State for Fresh Installs
  const [previewSampleData, setPreviewSampleData] = useState<boolean>(false);
  const totalRecordedViews = 0; // Fresh install baseline (no vanity analytics)

  // Save feedback states
  const [isSaving, setIsSaving] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);
  const [baselineSettings, setBaselineSettings] = useState(settings);

  useEffect(() => {
    setBaselineSettings(settings);
  }, [settings]);

  const baselineWorkingDaysStr = useMemo(() => {
    try {
      const parsed = JSON.parse(baselineSettings.workingDays || "[1,2,3,4,5]");
      if (Array.isArray(parsed) && parsed.length > 0) {
        if (parsed.length === 1 && (parsed[0] === 0 || parsed[0] === 6)) {
          return "[1,2,3,4,5]";
        }
        return JSON.stringify(parsed);
      }
      return "[1,2,3,4,5]";
    } catch {
      return "[1,2,3,4,5]";
    }
  }, [baselineSettings.workingDays]);

  // Calculate Form Dirty State for App Bridge SaveBar
  const isDirty = useMemo(() => {
    return (
      cutoffHour !== baselineSettings.cutoffHour ||
      cutoffMinute !== baselineSettings.cutoffMinute ||
      leadDays !== baselineSettings.leadDays ||
      cartThreshold !== (baselineSettings.freeShippingThreshold || 75) ||
      presetStyle !== (baselineSettings.presetStyle || "capsule") ||
      primaryColor.toLowerCase() !== (baselineSettings.primaryColor || "#008060").toLowerCase() ||
      bgColor.toLowerCase() !== (baselineSettings.bgColor || "#f4f6f8").toLowerCase() ||
      textColor.toLowerCase() !== (baselineSettings.textColor || "#202223").toLowerCase() ||
      JSON.stringify(workingDays) !== baselineWorkingDaysStr ||
      JSON.stringify(blackoutDates) !== (baselineSettings.blackoutDates || "[]") ||
      JSON.stringify(tagRules) !== (baselineSettings.tagRulesJson || "[]") ||
      leadText !== (baselineSettings.leadText || "Order within") ||
      sameDayText !== (baselineSettings.sameDayText || "for same-day dispatch") ||
      nextDayText !== (baselineSettings.nextDayText || "for tomorrow's dispatch") ||
      etaText !== (baselineSettings.etaText || "Estimated Delivery:")
    );
  }, [
    cutoffHour,
    cutoffMinute,
    leadDays,
    cartThreshold,
    presetStyle,
    primaryColor,
    bgColor,
    textColor,
    workingDays,
    baselineWorkingDaysStr,
    blackoutDates,
    tagRules,
    leadText,
    sameDayText,
    nextDayText,
    etaText,
    baselineSettings,
  ]);

  // Synchronize Form Dirty State to Shopify App Bridge Native SaveBar
  useEffect(() => {
    if (!isEmbedded) return;
    if (isDirty) {
      safeShowSaveBar();
    } else {
      safeHideSaveBar();
    }
  }, [isDirty, isEmbedded]);

  useEffect(() => {
    return () => {
      safeHideSaveBar();
    };
  }, []);

  const handleDiscard = () => {
    setCutoffHour(baselineSettings.cutoffHour);
    setCutoffMinute(baselineSettings.cutoffMinute);
    setHourInput(baselineSettings.cutoffHour.toString().padStart(2, "0"));
    setMinuteInput(baselineSettings.cutoffMinute.toString().padStart(2, "0"));
    setLeadDays(baselineSettings.leadDays);
    setCartThreshold(baselineSettings.freeShippingThreshold || 75);
    setIsCustomLeadDays(baselineSettings.leadDays > 2);
    setPresetStyle(baselineSettings.presetStyle || "capsule");
    setPrimaryColor(baselineSettings.primaryColor || "#008060");
    setBgColor(baselineSettings.bgColor || "#F4F6F8");
    setTextColor(baselineSettings.textColor || "#202223");
    setLeadText(baselineSettings.leadText || "Order within");
    setSameDayText(baselineSettings.sameDayText || "for same-day dispatch");
    setNextDayText(baselineSettings.nextDayText || "for tomorrow's dispatch");
    setEtaText(baselineSettings.etaText || "Estimated Delivery:");
    try {
      const parsed = JSON.parse(baselineSettings.workingDays || "[1,2,3,4,5]");
      if (Array.isArray(parsed) && parsed.length > 0 && !(parsed.length === 1 && (parsed[0] === 0 || parsed[0] === 6))) {
        setWorkingDays(parsed);
      } else {
        setWorkingDays([1, 2, 3, 4, 5]);
      }
    } catch {
      setWorkingDays([1, 2, 3, 4, 5]);
    }
    try {
      setBlackoutDates(JSON.parse(baselineSettings.blackoutDates || "[]"));
    } catch {
      setBlackoutDates([]);
    }
    try {
      setTagRules(JSON.parse(baselineSettings.tagRulesJson || "[]"));
    } catch {
      setTagRules([]);
    }
    setActiveSimulatedTag("none");
    safeHideSaveBar();
  };

  const handleSave = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
    }

    // If in standalone preview mode (no active Shopify iframe session):
    const isStandaloneMode = isStandalone || (typeof window !== "undefined" && !window.shopify);
    if (isStandaloneMode) {
      setIsSaving(true);
      // Simulate instant save feedback in UI
      setTimeout(() => {
        setIsSaving(false);
        setHasSaved(true);
        setBaselineSettings({
          ...baselineSettings,
          cutoffHour,
          cutoffMinute,
          leadDays,
          freeShippingThreshold: cartThreshold,
          presetStyle,
          primaryColor,
          bgColor,
          textColor,
          workingDays: JSON.stringify(workingDays),
          blackoutDates: JSON.stringify(blackoutDates),
          tagRulesJson: JSON.stringify(tagRules),
          leadText,
          sameDayText,
          nextDayText,
          etaText,
        });
        setTimeout(() => setHasSaved(false), 2500);
      }, 600);
      safeHideSaveBar();
      return;
    }

    // Inside Shopify Admin: execute the actual authenticated Remix action submission
    const formData = new FormData();
    formData.append("cutoffHour", cutoffHour.toString());
    formData.append("cutoffMinute", cutoffMinute.toString());
    formData.append("leadDays", leadDays.toString());
    formData.append("freeShippingThreshold", cartThreshold.toString());
    formData.append("widgetStyle", presetStyle);
    formData.append("presetStyle", presetStyle);
    formData.append("accentColor", primaryColor);
    formData.append("primaryColor", primaryColor);
    formData.append("cardBg", bgColor);
    formData.append("bgColor", bgColor);
    formData.append("textColor", textColor);
    formData.append("workingDays", JSON.stringify(workingDays));
    formData.append("blackoutDates", JSON.stringify(blackoutDates));
    formData.append("tagRules", JSON.stringify(tagRules));
    formData.append("tagRulesJson", JSON.stringify(tagRules));
    formData.append("leadText", leadText);
    formData.append("sameDayText", sameDayText);
    formData.append("nextDayText", nextDayText);
    formData.append("etaText", etaText);
    formData.append(
      "translations",
      JSON.stringify({
        cutoffPrefix: leadText,
        sameDaySuffix: sameDayText,
        nextDaySuffix: nextDayText,
        deliveryPrefix: etaText,
      })
    );
    submit(formData, { method: "post" });
    safeHideSaveBar();
  };

  const toggleDay = (day: number) => {
    setWorkingDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day).sort() : [...prev, day].sort()
    );
  };

  const addBlackoutDate = (dateStr: string) => {
    if (!dateStr) return;
    if (!blackoutDates.includes(dateStr)) {
      setBlackoutDates((prev) => [...prev, dateStr].sort());
    }
    setNewBlackoutDate("");
  };

  const removeBlackoutDate = (dateStr: string) => {
    setBlackoutDates((prev) => prev.filter((d) => d !== dateStr));
  };

  const formatBadgeDate = (isoStr: string) => {
    try {
      const [y, m, d] = isoStr.split("-").map(Number);
      const date = new Date(Date.UTC(y, m - 1, d));
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC",
      });
    } catch {
      return isoStr;
    }
  };

  const addTagRule = () => {
    setTagRules((prev) => [...prev, { tag: "", leadDays: 14 }]);
  };

  const updateTagRule = (index: number, updated: { tag: string; leadDays: number }) => {
    setTagRules((prev) => {
      const next = [...prev];
      next[index] = updated;
      return next;
    });
  };

  const removeTagRule = (index: number) => {
    setTagRules((prev) => prev.filter((_, i) => i !== index));
  };

  // Real-Time Countdown Calculations with Warehouse Timezone
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const preview = useMemo(() => {
    const warehouseUtcOffsetMs = (resolvedOffsetMinutes || 0) * 60 * 1000;
    const warehouseNow = new Date(now.getTime() + warehouseUtcOffsetMs + now.getTimezoneOffset() * 60 * 1000);

    const targetCutoff = new Date(warehouseNow);
    targetCutoff.setHours(cutoffHour, cutoffMinute, 0, 0);

    let diffMs = targetCutoff.getTime() - warehouseNow.getTime();
    let isPastCutoff = false;

    if (diffMs <= 0) {
      isPastCutoff = true;
      targetCutoff.setDate(targetCutoff.getDate() + 1);
      diffMs = targetCutoff.getTime() - warehouseNow.getTime();
    }

    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

    // Urgency progress bar arithmetic: start of business (8:00 AM = 480 mins) to cutoffHour
    const startOfBusinessMinutes = 8 * 60; // 480 mins
    const cutoffTotalMinutes = cutoffHour * 60 + cutoffMinute;
    const totalWindowMinutes = cutoffTotalMinutes > startOfBusinessMinutes
      ? cutoffTotalMinutes - startOfBusinessMinutes
      : 480;
    const remainingMinutes = hours * 60 + minutes;
    const progressPercent = isPastCutoff
      ? 0
      : Math.max(5, Math.min(100, Math.round((remainingMinutes / totalWindowMinutes) * 100)));
    const isUrgent = !isPastCutoff && hours === 0 && minutes <= 60;

    // Tag Rule Lead Days Calculation
    let tagLeadDays = 0;
    if (activeSimulatedTag !== "none") {
      const matched = tagRules.find(
        (r) => r.tag.trim().toLowerCase() === activeSimulatedTag.trim().toLowerCase()
      );
      if (matched) {
        tagLeadDays = Math.max(0, matched.leadDays - leadDays);
      } else if (activeSimulatedTag.toLowerCase() === "pre-order") {
        tagLeadDays = 14;
      } else if (activeSimulatedTag.toLowerCase() === "freight") {
        tagLeadDays = 5;
      }
    }
    const effectiveLeadDays = leadDays + tagLeadDays;

    const eta = computeFulfillmentETA({
      cutoffHour,
      cutoffMinute,
      leadDays,
      workingDays,
      blackoutDates,
      ianaTimezone,
      tagLeadDays,
    });
    const formattedArrival = eta.arrivalFormatted;

    return {
      hours,
      minutes,
      seconds,
      isPastCutoff,
      formattedArrival,
      progressPercent,
      isUrgent,
      effectiveLeadDays,
    };
  }, [
    now,
    cutoffHour,
    cutoffMinute,
    leadDays,
    workingDays,
    blackoutDates,
    tagRules,
    activeSimulatedTag,
    resolvedOffsetMinutes,
    ianaTimezone,
  ]);

  // Dynamically compute Order Status mock arrival date from base dispatch date (Today)
  const orderStatusArrival = useMemo(() => {
    const eta = computeFulfillmentETA({
      cutoffHour,
      cutoffMinute,
      leadDays,
      workingDays,
      blackoutDates,
      ianaTimezone,
      tagLeadDays: 0,
    });
    return eta.arrivalFormatted;
  }, [cutoffHour, cutoffMinute, leadDays, workingDays, blackoutDates, ianaTimezone]);

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden bg-[#f1f2f4] text-zinc-900 font-sans">
      {/* App Bridge Contextual TitleBar & Native SaveBar */}
      {!isStandalone && isEmbedded && (
        <>
          <ui-title-bar title="DropClock Studio">
            <button
              variant="primary"
              onClick={handleAddToTheme}
            >
              Add to Theme Editor
            </button>
          </ui-title-bar>

          <ui-save-bar id="dropclock-save-bar">
            <button
              variant="primary"
              onClick={handleSave}
              disabled={navigation.state === "submitting"}
            >
              {navigation.state === "submitting" ? "Saving..." : "Save"}
            </button>
            <button onClick={handleDiscard} disabled={navigation.state === "submitting"}>
              Discard
            </button>
          </ui-save-bar>
        </>
      )}

      {/* Single Consolidated Header Bar */}
      <header className="flex-none px-6 py-3.5 bg-white border-b border-zinc-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <DropClockLogo className="w-5 h-5 text-emerald-600" />
            <h1 className="text-base font-semibold text-zinc-900">DropClock Studio</h1>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              Dawn 15.0 (Active)
            </span>
            {isDirty ? (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                Unsaved Changes
              </span>
            ) : (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-zinc-600 border border-zinc-200">
                Settings Synced
              </span>
            )}
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://dropclock.app/docs"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-zinc-600 hover:text-zinc-900 transition-colors"
            >
              Documentation
            </a>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="grid grid-cols-12 flex-1 min-h-0 overflow-hidden">
        {/* Left Settings Panel */}
        <aside className="col-span-12 lg:col-span-5 xl:col-span-4 h-full overflow-y-auto overscroll-contain p-4 lg:p-5 space-y-4 border-r border-zinc-200 bg-white pb-36">
          {/* App Reviewer Quick Start Guide (Test Mode / Review Store Exemption) */}
          {!isReviewerGuideDismissed && isReviewerMode && (
            <Banner
              title="App Reviewer Quick Start Guide"
              tone="success"
              onDismiss={handleDismissReviewerGuide}
            >
              <div className="space-y-1.5 text-xs text-zinc-700">
                <p>
                  Welcome Shopify App Review Team! DropClock is running in test mode with automated billing bypass:
                </p>
                <ul className="list-disc pl-4 space-y-1">
                  <li><strong>Preview Surfaces:</strong> Switch between <em>Product Page</em>, <em>Cart Drawer</em> (with dynamic progress upsell), and <em>Order Status</em> timelines in the preview header.</li>
                  <li><strong>Live Dispatch Math:</strong> Adjust the cutoff hour or lead days in the left panel to watch real-time recalculation of same-day cutoffs and delivery dates.</li>
                  <li><strong>Multi-Currency:</strong> Select different currencies (USD, EUR, GBP, CAD) in the preview toolbar to verify localized formatting.</li>
                  <li><strong>Theme Extension:</strong> DropClock uses 100% Theme App Extension app blocks with zero residual code upon uninstall.</li>
                </ul>
              </div>
            </Banner>
          )}

          {/* Guided Onboarding Banner (Dismissible per BFS guidelines) */}
          {!isOnboardingDismissed && (
            <Banner
              title="Complete Storefront Setup"
              tone="info"
              onDismiss={handleDismissOnboarding}
            >
              <p className="mb-2 text-xs text-zinc-600">
                Enable the DropClock dynamic countdown block in your active Shopify theme in 3 quick steps:
              </p>
              <ol className="list-decimal pl-4 space-y-1 text-xs text-zinc-600">
                <li>
                  Click <strong>Add to Theme Editor</strong> in the header bar above to open the theme customizer.
                </li>
                <li>Position the DropClock capsule pill directly above or below your product buy buttons.</li>
                <li>Click <strong>Save</strong> in the Shopify theme editor to publish live delivery ETAs.</li>
              </ol>
            </Banner>
          )}

          {/* 0. BFS-Compliant Storefront Fulfillment Analytics Card */}
          <div className="bg-white border border-zinc-200/90 rounded-xl p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ActivityIcon />
                <span className="text-sm font-semibold text-zinc-900">
                  Storefront Fulfillment Analytics
                </span>
              </div>
              {previewSampleData && (
                <button
                  type="button"
                  onClick={() => setPreviewSampleData(false)}
                  className="text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-300 px-2.5 py-0.5 rounded-full hover:bg-amber-100 transition-colors cursor-pointer flex items-center gap-1"
                  title="Click to reset to live empty state"
                >
                  <span>[ Previewing Sample Data ]</span>
                  <span className="text-[10px] text-amber-600 underline ml-0.5">Reset</span>
                </button>
              )}
            </div>

            {totalRecordedViews === 0 && !previewSampleData ? (
              <Banner
                title="Storefront Analytics Active"
                tone="info"
                action={{
                  content: "Preview Sample Data",
                  onAction: () => setPreviewSampleData(true),
                }}
              >
                <p>
                  Impression tracking and dispatch velocity start automatically once the DropClock block is published to your live theme.
                </p>
              </Banner>
            ) : (
              <>
                <p className="text-[11px] text-zinc-500 m-0">
                  Tracking will begin as soon as DropClock is enabled in your live theme. (Illustrative sample data shown below)
                </p>

                <div className="grid grid-cols-3 gap-2 pt-1">
                  <div className="bg-[#f8fafc] border border-zinc-200/80 rounded-lg p-2.5 flex flex-col">
                    <span className="text-[11px] text-zinc-500 font-medium">Storefront Views</span>
                    <span className="text-base font-bold text-zinc-900 mt-0.5">42,850</span>
                    <span className="text-[10px] text-emerald-600 font-semibold mt-0.5">↑ 14.2% MoM</span>
                  </div>

                  <div className="bg-[#f8fafc] border border-zinc-200/80 rounded-lg p-2.5 flex flex-col">
                    <span className="text-[11px] text-zinc-500 font-medium">Urgency Adds</span>
                    <span className="text-base font-bold text-emerald-700 mt-0.5">3,412</span>
                    <span className="text-[10px] text-emerald-600 font-semibold mt-0.5">&lt; 2h to cutoff</span>
                  </div>

                  <div className="bg-[#f8fafc] border border-zinc-200/80 rounded-lg p-2.5 flex flex-col">
                    <span className="text-[11px] text-zinc-500 font-medium">WISMO Deflection</span>
                    <span className="text-base font-bold text-indigo-700 mt-0.5">~28.5%</span>
                    <span className="text-[10px] text-zinc-500 font-medium mt-0.5">$1,840 saved</span>
                  </div>
                </div>
              </>
            )}

            <div className="pt-3 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-500">
              <span className="text-xs text-zinc-500 font-medium">Fulfillment SLA Tracking</span>
              {previewSampleData ? (
                <Badge tone="success">99.4% On-Track (Sample)</Badge>
              ) : (
                <div className="flex items-center gap-1.5">
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    Awaiting Theme Activation
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setHasSaved(true);
                      setTimeout(() => setHasSaved(false), 2000);
                    }}
                    className="text-zinc-400 hover:text-zinc-700 transition-colors p-0.5 rounded cursor-pointer"
                    title="Click to re-verify app block detection on active theme"
                  >
                    <RefreshCwIcon />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* 1. Cutoff Time Controller */}
          <div className="bg-white border border-zinc-200/90 rounded-xl p-4 shadow-xs space-y-3">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "12px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <ClockIcon />
                  <span style={{ fontSize: "0.875rem", fontWeight: "600", color: "#0f172a" }}>
                    Fulfillment Cutoff
                  </span>
                </div>
                <span
                  style={{
                    fontSize: "0.6875rem",
                    color: "#475569",
                    backgroundColor: "#f1f5f9",
                    border: "1px solid #cbd5e1",
                    padding: "2px 8px",
                    borderRadius: "9999px",
                  }}
                >
                  {timezoneLabel}
                </span>
              </div>

              {/* 24h Digital Time Display & Stepper with Direct Manual Numeric Inputs */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "12px",
                  backgroundColor: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: "10px",
                  padding: "12px",
                  marginBottom: "14px",
                }}
              >
                <button
                  type="button"
                  onClick={() => setCutoffHour((h) => (h > 0 ? h - 1 : 23))}
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "6px",
                    border: "1px solid #cbd5e1",
                    backgroundColor: "#ffffff",
                    color: "#0f172a",
                    fontWeight: "700",
                    fontSize: "1.125rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    userSelect: "none",
                  }}
                  title="Decrement Hour"
                >
                  -
                </button>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    fontFamily: "monospace",
                  }}
                >
                  <input
                    type="number"
                    min={0}
                    max={23}
                    inputMode="numeric"
                    value={hourInput}
                    onChange={(e) => {
                      const val = e.target.value;
                      setHourInput(val);
                      const num = parseInt(val, 10);
                      if (!isNaN(num) && num >= 0 && num <= 23) {
                        setCutoffHour(num);
                      }
                    }}
                    onBlur={() => {
                      let num = parseInt(hourInput, 10);
                      if (isNaN(num)) num = 0;
                      num = Math.max(0, Math.min(23, num));
                      setCutoffHour(num);
                      setHourInput(num.toString().padStart(2, "0"));
                    }}
                    style={{
                      width: "56px",
                      textAlign: "center",
                      backgroundColor: "#ffffff",
                      border: "1px solid #cbd5e1",
                      borderRadius: "6px",
                      padding: "4px 0",
                      fontSize: "1.75rem",
                      fontWeight: "700",
                      color: "#0f172a",
                      fontFamily: "monospace",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                    aria-label="Cutoff Hour"
                  />
                  <span style={{ color: "#10b981", fontSize: "1.5rem", fontWeight: "700" }}>:</span>
                  <input
                    type="number"
                    min={0}
                    max={59}
                    inputMode="numeric"
                    value={minuteInput}
                    onChange={(e) => {
                      const val = e.target.value;
                      setMinuteInput(val);
                      const num = parseInt(val, 10);
                      if (!isNaN(num) && num >= 0 && num <= 59) {
                        setCutoffMinute(num);
                      }
                    }}
                    onBlur={() => {
                      let num = parseInt(minuteInput, 10);
                      if (isNaN(num)) num = 0;
                      num = Math.max(0, Math.min(59, num));
                      setCutoffMinute(num);
                      setMinuteInput(num.toString().padStart(2, "0"));
                    }}
                    style={{
                      width: "56px",
                      textAlign: "center",
                      backgroundColor: "#ffffff",
                      border: "1px solid #cbd5e1",
                      borderRadius: "6px",
                      padding: "4px 0",
                      fontSize: "1.75rem",
                      fontWeight: "700",
                      color: "#0f172a",
                      fontFamily: "monospace",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                    aria-label="Cutoff Minute"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setCutoffHour((h) => (h < 23 ? h + 1 : 0))}
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "6px",
                    border: "1px solid #cbd5e1",
                    backgroundColor: "#ffffff",
                    color: "#0f172a",
                    fontWeight: "700",
                    fontSize: "1.125rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    userSelect: "none",
                  }}
                  title="Increment Hour"
                >
                  +
                </button>
              </div>

              {/* Quick Preset Chips */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "6px" }}>
                {[
                  { label: "12:00 PM", h: 12, m: 0 },
                  { label: "2:00 PM", h: 14, m: 0 },
                  { label: "4:00 PM", h: 16, m: 0 },
                  { label: "5:00 PM", h: 17, m: 0 },
                ].map((chip) => {
                  const active = cutoffHour === chip.h && cutoffMinute === chip.m;
                  return (
                    <button
                      key={chip.label}
                      type="button"
                      onClick={() => {
                        setCutoffHour(chip.h);
                        setCutoffMinute(chip.m);
                      }}
                      style={{
                        padding: "6px 4px",
                        borderRadius: "6px",
                        border: active ? "1px solid #10b981" : "1px solid #e2e8f0",
                        backgroundColor: active ? "rgba(16, 185, 129, 0.12)" : "#ffffff",
                        color: active ? "#047857" : "#475569",
                        fontSize: "0.75rem",
                        fontWeight: "600",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}
                    >
                      {chip.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Display Preset Selector */}
            <div
              style={{
                backgroundColor: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
                padding: "16px",
                boxShadow: "0 1px 2px 0 rgba(0,0,0,0.03)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                <LayoutIcon />
                <span style={{ fontSize: "0.875rem", fontWeight: "600", color: "#0f172a" }}>
                  Widget Display Style
                </span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
                {[
                  {
                    id: "capsule",
                    name: "Capsule Pill",
                    desc: "Container card with background & border",
                    icon: <CapsuleIcon />,
                  },
                  {
                    id: "minimal",
                    name: "Minimal Line",
                    desc: "Single inline line matching typography",
                    icon: <MinimalIcon />,
                  },
                  {
                    id: "bar",
                    name: "Urgency Bar",
                    desc: "Dynamic fulfillment progress track",
                    icon: <ProgressBarIcon />,
                  },
                ].map((preset) => {
                  const active = (presetStyle || "capsule") === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setPresetStyle(preset.id)}
                      style={{
                        padding: "12px 10px",
                        borderRadius: "8px",
                        border: active ? "2px solid #10b981" : "1px solid #cbd5e1",
                        backgroundColor: active ? "rgba(16, 185, 129, 0.08)" : "#ffffff",
                        color: active ? "#0f172a" : "#475569",
                        textAlign: "left",
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: "column",
                        gap: "6px",
                        transition: "all 0.15s ease",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={{ color: active ? "#10b981" : "#64748b" }}>{preset.icon}</span>
                        {active && (
                          <span style={{ color: "#10b981" }}>
                            <CheckIcon />
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: "0.8125rem", fontWeight: "600", color: active ? "#0f172a" : "#334155" }}>
                        {preset.name}
                      </span>
                      <span style={{ fontSize: "0.6875rem", color: "#64748b", lineHeight: "1.3" }}>
                        {preset.desc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Lead Time Selector with Expandable Stepper */}
            <div
              style={{
                backgroundColor: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
                padding: "16px",
                boxShadow: "0 1px 2px 0 rgba(0,0,0,0.03)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                <TruckIcon />
                <span style={{ fontSize: "0.875rem", fontWeight: "600", color: "#0f172a" }}>
                  Transit Lead Time
                </span>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: "6px",
                  backgroundColor: "#f8fafc",
                  padding: "4px",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                }}
              >
                {[
                  { label: "Same Day", val: 0 },
                  { label: "1 Day", val: 1 },
                  { label: "2 Days", val: 2 },
                  { label: "Custom", val: -1 },
                ].map((item) => {
                  const isCustom = item.val === -1;
                  const active = isCustom ? isCustomLeadDays || leadDays > 2 : !isCustomLeadDays && leadDays === item.val;
                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => {
                        if (isCustom) {
                          setIsCustomLeadDays(true);
                          if (leadDays <= 2) setLeadDays(4);
                        } else {
                          setIsCustomLeadDays(false);
                          setLeadDays(item.val);
                        }
                      }}
                      style={{
                        padding: "7px 4px",
                        borderRadius: "6px",
                        border: "none",
                        backgroundColor: active ? "#0f172a" : "transparent",
                        color: active ? "#ffffff" : "#475569",
                        fontSize: "0.75rem",
                        fontWeight: "600",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>

              {/* Expandable Custom Lead Days Stepper */}
              {(isCustomLeadDays || leadDays > 2) && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    marginTop: "12px",
                    paddingTop: "12px",
                    borderTop: "1px solid #e2e8f0",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      backgroundColor: "#f8fafc",
                      padding: "4px 8px",
                      borderRadius: "8px",
                      border: "1px solid #cbd5e1",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setLeadDays((d) => Math.max(1, d - 1))}
                      style={{
                        width: "26px",
                        height: "26px",
                        borderRadius: "6px",
                        border: "1px solid #cbd5e1",
                        backgroundColor: "#ffffff",
                        color: "#0f172a",
                        fontWeight: "700",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      -
                    </button>
                    <span
                      style={{
                        minWidth: "64px",
                        textAlign: "center",
                        fontWeight: "600",
                        fontSize: "0.8125rem",
                        fontFamily: "monospace",
                        color: "#0f172a",
                      }}
                    >
                      {leadDays} {leadDays === 1 ? "Day" : "Days"}
                    </span>
                    <button
                      type="button"
                      onClick={() => setLeadDays((d) => Math.min(30, d + 1))}
                      style={{
                        width: "26px",
                        height: "26px",
                        borderRadius: "6px",
                        border: "1px solid #cbd5e1",
                        backgroundColor: "#ffffff",
                        color: "#0f172a",
                        fontWeight: "700",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      +
                    </button>
                  </div>
                  <span style={{ fontSize: "0.8125rem", color: "#64748b" }}>
                    Transit fulfillment window (1–30 days)
                  </span>
                </div>
              )}
            </div>

            {/* 4. Operating Days */}
            <div
              style={{
                backgroundColor: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
                padding: "16px",
                boxShadow: "0 1px 2px 0 rgba(0,0,0,0.03)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "12px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <ShieldCheckIcon />
                  <span style={{ fontSize: "0.875rem", fontWeight: "600", color: "#0f172a" }}>
                    Operating Days
                  </span>
                </div>
                <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
                  {workingDays.length} Active Days
                </span>
              </div>

              <div
                className="min-h-[48px]"
                style={{ display: "flex", alignItems: "center", gap: "6px", maxWidth: "340px", width: "100%", flexShrink: 0 }}
              >
                {[
                  { label: "M", day: 1 },
                  { label: "T", day: 2 },
                  { label: "W", day: 3 },
                  { label: "T", day: 4 },
                  { label: "F", day: 5 },
                  { label: "S", day: 6 },
                  { label: "S", day: 0 },
                ].map(({ label, day }) => {
                  const active = workingDays.includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(day)}
                      style={{
                        flex: 1,
                        height: "36px",
                        maxHeight: "36px",
                        minHeight: "36px",
                        maxWidth: "44px",
                        borderRadius: "8px",
                        border: active ? "1px solid #10b981" : "1px solid #e2e8f0",
                        backgroundColor: active ? "#10b981" : "#ffffff",
                        color: active ? "#ffffff" : "#64748b",
                        fontSize: "0.8125rem",
                        fontWeight: "600",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: 0,
                        transition: "all 0.15s ease",
                      }}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4b. Cart Free Shipping Goal */}
            <div
              style={{
                backgroundColor: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
                padding: "16px",
                boxShadow: "0 1px 2px 0 rgba(0,0,0,0.03)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "10px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <ShoppingCartIcon />
                  <span style={{ fontSize: "0.875rem", fontWeight: "600", color: "#0f172a" }}>
                    Cart Free Shipping Goal
                  </span>
                </div>
                <span
                  style={{
                    fontSize: "0.6875rem",
                    fontWeight: "600",
                    color: "#047857",
                    backgroundColor: "#ecfdf5",
                    border: "1px solid #a7f3d0",
                    padding: "2px 8px",
                    borderRadius: "9999px",
                    fontFamily: "monospace",
                  }}
                >
                  ${cartThreshold} Goal
                </span>
              </div>
              <p style={{ margin: "0 0 12px 0", fontSize: "0.75rem", color: "#64748b", lineHeight: "1.4" }}>
                Define the cart subtotal threshold required for shoppers to unlock expedited same-day dispatch and free delivery in the drawer upsell bar.
              </p>

              {/* Toggle: Enable Cart Urgency Progress Bar */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "8px 10px",
                  backgroundColor: "#f8fafc",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  marginBottom: "12px",
                }}
              >
                <div>
                  <div style={{ fontSize: "0.75rem", fontWeight: "600", color: "#0f172a" }}>
                    Enable Cart Progress Bar
                  </div>
                  <div style={{ fontSize: "0.6875rem", color: "#64748b" }}>
                    Show dynamic threshold delivery goal in the cart drawer
                  </div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={enableCartProgressBar}
                  onClick={() => {
                    setEnableCartProgressBar((prev) => {
                      const next = !prev;
                      safeStorage.setItem("dc_enable_cart_progress_bar", next.toString());
                      return next;
                    });
                  }}
                  style={{
                    width: "36px",
                    height: "20px",
                    borderRadius: "9999px",
                    backgroundColor: enableCartProgressBar ? "#008060" : "#cbd5e1",
                    border: "none",
                    position: "relative",
                    cursor: "pointer",
                    transition: "background-color 0.2s ease",
                    padding: 0,
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      top: "2px",
                      left: enableCartProgressBar ? "18px" : "2px",
                      width: "16px",
                      height: "16px",
                      borderRadius: "50%",
                      backgroundColor: "#ffffff",
                      boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
                      transition: "left 0.2s ease",
                    }}
                  />
                </button>
              </div>

              {/* Number Input: Threshold Goal ($) */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.75rem",
                    fontWeight: "600",
                    color: "#334155",
                    marginBottom: "4px",
                  }}
                >
                  Threshold Goal ($)
                </label>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ position: "relative", flex: 1 }}>
                    <span
                      style={{
                        position: "absolute",
                        left: "10px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "#94a3b8",
                        fontSize: "0.875rem",
                        fontWeight: "600",
                      }}
                    >
                      $
                    </span>
                    <input
                      type="number"
                      min={1}
                      max={1000}
                      value={cartThreshold}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        if (!isNaN(val) && val >= 0) {
                          setCartThreshold(val);
                          safeStorage.setItem("dc_free_shipping_threshold", val.toString());
                        }
                      }}
                      style={{
                        width: "100%",
                        paddingLeft: "24px",
                        paddingRight: "10px",
                        paddingTop: "6px",
                        paddingBottom: "6px",
                        fontSize: "0.875rem",
                        fontFamily: "monospace",
                        fontWeight: "600",
                        border: "1px solid #cbd5e1",
                        borderRadius: "6px",
                        color: "#0f172a",
                        backgroundColor: "#ffffff",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                  <div style={{ display: "flex", gap: "4px" }}>
                    {[50, 75, 100].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => {
                          setCartThreshold(preset);
                          safeStorage.setItem("dc_free_shipping_threshold", preset.toString());
                        }}
                        style={{
                          padding: "6px 10px",
                          fontSize: "0.75rem",
                          fontWeight: "600",
                          borderRadius: "6px",
                          border: cartThreshold === preset ? "1px solid #0f172a" : "1px solid #cbd5e1",
                          backgroundColor: cartThreshold === preset ? "#0f172a" : "#f8fafc",
                          color: cartThreshold === preset ? "#ffffff" : "#334155",
                          cursor: "pointer",
                          transition: "all 0.15s ease",
                        }}
                      >
                        ${preset}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 5. Warehouse Holiday & Blackout Dates */}
            <div
              style={{
                backgroundColor: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
                padding: "16px",
                boxShadow: "0 1px 2px 0 rgba(0,0,0,0.03)",
              }}
            >
              <div
                onClick={() => setIsBlackoutOpen((v) => !v)}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  cursor: "pointer",
                  userSelect: "none",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <CalendarIcon />
                  <span style={{ fontSize: "0.875rem", fontWeight: "600", color: "#0f172a" }}>
                    Warehouse Holiday &amp; Blackout Dates
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span
                    style={{
                      fontSize: "0.6875rem",
                      fontWeight: "600",
                      color: blackoutDates.length > 0 ? "#047857" : "#64748b",
                      backgroundColor: blackoutDates.length > 0 ? "#ecfdf5" : "#f1f5f9",
                      border: "1px solid",
                      borderColor: blackoutDates.length > 0 ? "#a7f3d0" : "#e2e8f0",
                      padding: "2px 8px",
                      borderRadius: "9999px",
                    }}
                  >
                    {blackoutDates.length} {blackoutDates.length === 1 ? "Date" : "Dates"}
                  </span>
                  <span style={{ color: "#64748b" }}>
                    <ChevronDownIcon open={isBlackoutOpen} />
                  </span>
                </div>
              </div>

              {isBlackoutOpen && (
                <div style={{ marginTop: "14px", display: "flex", flexDirection: "column", gap: "12px" }}>
                  <p style={{ margin: 0, fontSize: "0.75rem", color: "#64748b", lineHeight: "1.4" }}>
                    Select dates when fulfillment is paused (e.g. Thanksgiving, Christmas, inventory audit days). Orders during blackout dates roll dispatch and arrival ETA to the next operational business day.
                  </p>

                  {/* Inline Date Picker & Add Button */}
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <input
                      type="date"
                      value={newBlackoutDate}
                      onChange={(e) => setNewBlackoutDate(e.target.value)}
                      style={{
                        flex: 1,
                        backgroundColor: "#ffffff",
                        border: "1px solid #cbd5e1",
                        borderRadius: "8px",
                        padding: "8px 10px",
                        fontSize: "0.75rem",
                        color: "#0f172a",
                        outline: "none",
                        colorScheme: "light",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => addBlackoutDate(newBlackoutDate)}
                      disabled={!newBlackoutDate}
                      style={{
                        padding: "8px 12px",
                        backgroundColor: newBlackoutDate ? "#0f172a" : "#f1f5f9",
                        color: newBlackoutDate ? "#ffffff" : "#94a3b8",
                        border: "1px solid #cbd5e1",
                        borderRadius: "8px",
                        fontSize: "0.75rem",
                        fontWeight: "600",
                        cursor: newBlackoutDate ? "pointer" : "not-allowed",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        transition: "all 0.15s ease",
                        flexShrink: 0,
                      }}
                    >
                      <PlusIcon />
                      <span>Add Blackout Date</span>
                    </button>
                  </div>

                  {/* Selected Blackout Badges List */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", minHeight: "28px" }}>
                    {blackoutDates.length === 0 ? (
                      <span style={{ fontSize: "0.6875rem", color: "#94a3b8", fontStyle: "italic" }}>
                        No blackout dates scheduled. Warehouse operates on all designated operating days.
                      </span>
                    ) : (
                      blackoutDates.map((dateStr) => (
                        <span
                          key={dateStr}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            backgroundColor: "#f1f5f9",
                            border: "1px solid #cbd5e1",
                            padding: "4px 8px 4px 10px",
                            borderRadius: "6px",
                            fontSize: "0.75rem",
                            fontWeight: "600",
                            color: "#0f172a",
                          }}
                        >
                          <span>{formatBadgeDate(dateStr)}</span>
                          <button
                            type="button"
                            onClick={() => removeBlackoutDate(dateStr)}
                            title="Remove blackout date"
                            style={{
                              background: "none",
                              border: "none",
                              color: "#64748b",
                              cursor: "pointer",
                              padding: "2px",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              borderRadius: "4px",
                              transition: "color 0.15s ease",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = "#ef4444")}
                            onMouseLeave={(e) => (e.currentTarget.style.color = "#64748b")}
                          >
                            <XIcon />
                          </button>
                        </span>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 6. Product Tag Overrides */}
            <div
              style={{
                backgroundColor: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
                padding: "16px",
                boxShadow: "0 1px 2px 0 rgba(0,0,0,0.03)",
              }}
            >
              <div
                onClick={() => setIsTagRulesOpen((v) => !v)}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  cursor: "pointer",
                  userSelect: "none",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <TagIcon />
                  <span style={{ fontSize: "0.875rem", fontWeight: "600", color: "#0f172a" }}>
                    Product Tag Overrides
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span
                    style={{
                      fontSize: "0.6875rem",
                      fontWeight: "600",
                      color: tagRules.length > 0 ? "#047857" : "#64748b",
                      backgroundColor: tagRules.length > 0 ? "#ecfdf5" : "#f1f5f9",
                      border: "1px solid",
                      borderColor: tagRules.length > 0 ? "#a7f3d0" : "#e2e8f0",
                      padding: "2px 8px",
                      borderRadius: "9999px",
                    }}
                  >
                    {tagRules.length} {tagRules.length === 1 ? "Rule" : "Rules"}
                  </span>
                  <span style={{ color: "#64748b" }}>
                    <ChevronDownIcon open={isTagRulesOpen} />
                  </span>
                </div>
              </div>

              {isTagRulesOpen && (
                <div style={{ marginTop: "14px", display: "flex", flexDirection: "column", gap: "12px" }}>
                  <p style={{ margin: 0, fontSize: "0.75rem", color: "#64748b", lineHeight: "1.4" }}>
                    Map Shopify product tags (e.g. <code>pre-order</code>, <code>custom-engraved</code>, <code>freight</code>) to custom transit lead times.
                  </p>

                  {/* Rules List Table */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {tagRules.length === 0 ? (
                      <span style={{ fontSize: "0.6875rem", color: "#94a3b8", fontStyle: "italic" }}>
                        No tag rules configured. Standard transit lead time applies to all products.
                      </span>
                    ) : (
                      tagRules.map((rule, idx) => (
                        <div
                          key={idx}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            backgroundColor: "#f8fafc",
                            border: "1px solid #e2e8f0",
                            borderRadius: "8px",
                            padding: "6px 8px",
                          }}
                        >
                          <div style={{ flex: 1 }}>
                            <input
                              type="text"
                              placeholder="e.g. pre-order"
                              value={rule.tag}
                              onChange={(e) => updateTagRule(idx, { ...rule, tag: e.target.value })}
                              style={{
                                width: "100%",
                                backgroundColor: "#ffffff",
                                border: "1px solid #cbd5e1",
                                borderRadius: "6px",
                                padding: "6px 8px",
                                fontSize: "0.75rem",
                                color: "#0f172a",
                                outline: "none",
                                boxSizing: "border-box",
                              }}
                            />
                          </div>

                          <div style={{ width: "115px", flexShrink: 0 }}>
                            <select
                              value={rule.leadDays}
                              onChange={(e) => updateTagRule(idx, { ...rule, leadDays: parseInt(e.target.value, 10) || 1 })}
                              style={{
                                width: "100%",
                                backgroundColor: "#ffffff",
                                border: "1px solid #cbd5e1",
                                borderRadius: "6px",
                                padding: "6px 8px",
                                fontSize: "0.75rem",
                                color: "#0f172a",
                                outline: "none",
                                cursor: "pointer",
                                boxSizing: "border-box",
                              }}
                            >
                              <option value={1}>1 Day</option>
                              <option value={2}>2 Days</option>
                              <option value={3}>3 Days</option>
                              <option value={5}>5 Days</option>
                              <option value={7}>7 Days</option>
                              <option value={10}>10 Days</option>
                              <option value={14}>14 Days</option>
                              <option value={21}>21 Days</option>
                              <option value={30}>30 Days</option>
                            </select>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeTagRule(idx)}
                            title="Delete Rule"
                            style={{
                              width: "28px",
                              height: "28px",
                              borderRadius: "6px",
                              border: "1px solid #e2e8f0",
                              backgroundColor: "#ffffff",
                              color: "#64748b",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                              transition: "all 0.15s ease",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.color = "#ef4444";
                              e.currentTarget.style.borderColor = "#fca5a5";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.color = "#64748b";
                              e.currentTarget.style.borderColor = "#e2e8f0";
                            }}
                          >
                            <TrashIcon />
                          </button>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Add Tag Rule Button */}
                  <button
                    type="button"
                    onClick={addTagRule}
                    style={{
                      padding: "8px 12px",
                      backgroundColor: "#f8fafc",
                      border: "1px dashed #cbd5e1",
                      borderRadius: "8px",
                      color: "#475569",
                      fontSize: "0.75rem",
                      fontWeight: "600",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      transition: "all 0.15s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "#94a3b8";
                      e.currentTarget.style.color = "#0f172a";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "#cbd5e1";
                      e.currentTarget.style.color = "#475569";
                    }}
                  >
                    <PlusIcon />
                    <span>+ Add Tag Rule</span>
                  </button>
                </div>
              )}
            </div>

            {/* 7. Storefront Text & Translations Accordion Card */}
            <div
              style={{
                backgroundColor: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
                padding: "16px",
                boxShadow: "0 1px 2px 0 rgba(0,0,0,0.03)",
              }}
            >
              <div
                onClick={() => setIsTranslationsOpen(!isTranslationsOpen)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  cursor: "pointer",
                  userSelect: "none",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <GlobeIcon />
                  <span style={{ fontSize: "0.875rem", fontWeight: "600", color: "#0f172a" }}>
                    Storefront Text &amp; Translations
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span
                    style={{
                      fontSize: "0.6875rem",
                      fontWeight: "600",
                      color: "#047857",
                      backgroundColor: "#ecfdf5",
                      border: "1px solid #a7f3d0",
                      padding: "2px 8px",
                      borderRadius: "9999px",
                    }}
                  >
                    4 Tokens
                  </span>
                  <span style={{ color: "#64748b" }}>
                    <ChevronDownIcon open={isTranslationsOpen} />
                  </span>
                </div>
              </div>

              {isTranslationsOpen && (
                <div style={{ marginTop: "14px", display: "flex", flexDirection: "column", gap: "14px" }}>
                  <p style={{ margin: 0, fontSize: "0.75rem", color: "#64748b", lineHeight: "1.4" }}>
                    Customize storefront labels and translation strings for international customers. Updates reflect instantly in live preview and Liquid server paint.
                  </p>

                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {/* Token 1: Cutoff Lead Text */}
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                        <label style={{ fontSize: "0.75rem", fontWeight: "600", color: "#0f172a" }}>
                          Cutoff Lead Text
                        </label>
                        <span style={{ fontSize: "0.6875rem", color: "#64748b" }}>Default: "Order within"</span>
                      </div>
                      <input
                        type="text"
                        value={leadText}
                        onChange={(e) => setLeadText(e.target.value)}
                        placeholder="Order within"
                        style={{
                          width: "100%",
                          backgroundColor: "#ffffff",
                          border: "1px solid #cbd5e1",
                          borderRadius: "8px",
                          padding: "8px 12px",
                          fontSize: "0.8125rem",
                          color: "#0f172a",
                          outline: "none",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>

                    {/* Token 2: Same-Day Dispatch Label */}
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                        <label style={{ fontSize: "0.75rem", fontWeight: "600", color: "#0f172a" }}>
                          Same-Day Dispatch Label
                        </label>
                        <span style={{ fontSize: "0.6875rem", color: "#64748b" }}>Default: "for same-day dispatch"</span>
                      </div>
                      <input
                        type="text"
                        value={sameDayText}
                        onChange={(e) => setSameDayText(e.target.value)}
                        placeholder="for same-day dispatch"
                        style={{
                          width: "100%",
                          backgroundColor: "#ffffff",
                          border: "1px solid #cbd5e1",
                          borderRadius: "8px",
                          padding: "8px 12px",
                          fontSize: "0.8125rem",
                          color: "#0f172a",
                          outline: "none",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>

                    {/* Token 3: Next-Day Dispatch Label */}
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                        <label style={{ fontSize: "0.75rem", fontWeight: "600", color: "#0f172a" }}>
                          Next-Day Dispatch Label
                        </label>
                        <span style={{ fontSize: "0.6875rem", color: "#64748b" }}>Default: "for tomorrow's dispatch"</span>
                      </div>
                      <input
                        type="text"
                        value={nextDayText}
                        onChange={(e) => setNextDayText(e.target.value)}
                        placeholder="for tomorrow's dispatch"
                        style={{
                          width: "100%",
                          backgroundColor: "#ffffff",
                          border: "1px solid #cbd5e1",
                          borderRadius: "8px",
                          padding: "8px 12px",
                          fontSize: "0.8125rem",
                          color: "#0f172a",
                          outline: "none",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>

                    {/* Token 4: Delivery ETA Label */}
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                        <label style={{ fontSize: "0.75rem", fontWeight: "600", color: "#0f172a" }}>
                          Delivery ETA Label
                        </label>
                        <span style={{ fontSize: "0.6875rem", color: "#64748b" }}>Default: "Estimated Delivery:"</span>
                      </div>
                      <input
                        type="text"
                        value={etaText}
                        onChange={(e) => setEtaText(e.target.value)}
                        placeholder="Estimated Delivery:"
                        style={{
                          width: "100%",
                          backgroundColor: "#ffffff",
                          border: "1px solid #cbd5e1",
                          borderRadius: "8px",
                          padding: "8px 12px",
                          fontSize: "0.8125rem",
                          color: "#0f172a",
                          outline: "none",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>

                    {/* Reset to English Defaults */}
                    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "4px" }}>
                      <button
                        type="button"
                        onClick={() => {
                          setLeadText("Order within");
                          setSameDayText("for same-day dispatch");
                          setNextDayText("for tomorrow's dispatch");
                          setEtaText("Estimated Delivery:");
                        }}
                        style={{
                          backgroundColor: "transparent",
                          border: "none",
                          color: "#64748b",
                          fontSize: "0.6875rem",
                          cursor: "pointer",
                          textDecoration: "underline",
                          padding: "2px 4px",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "#0f172a")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "#64748b")}
                      >
                        Reset to English Defaults
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 8. Brand Alignment & Functional Color Swatches */}
            <div
              style={{
                backgroundColor: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
                padding: "16px",
                boxShadow: "0 1px 2px 0 rgba(0,0,0,0.03)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                <SparklesIcon />
                <span style={{ fontSize: "0.875rem", fontWeight: "600", color: "#0f172a" }}>
                  Brand Alignment &amp; Color Tokens
                </span>
              </div>

              {/* Quick Brand Preset Chips */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: "8px",
                  marginBottom: "16px",
                }}
              >
                {BRAND_PRESETS.map((bp) => {
                  const active =
                    primaryColor.toLowerCase() === bp.primaryColor.toLowerCase() &&
                    bgColor.toLowerCase() === bp.bgColor.toLowerCase();
                  return (
                    <button
                      key={bp.name}
                      type="button"
                      onClick={() => {
                        setPrimaryColor(bp.primaryColor);
                        setBgColor(bp.bgColor);
                        setTextColor(bp.textColor);
                      }}
                      style={{
                        padding: "8px 10px",
                        borderRadius: "8px",
                        border: active ? "1px solid #10b981" : "1px solid #e2e8f0",
                        backgroundColor: active ? "rgba(16, 185, 129, 0.08)" : "#ffffff",
                        color: active ? "#0f172a" : "#475569",
                        fontSize: "0.75rem",
                        fontWeight: "500",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        cursor: "pointer",
                      }}
                    >
                      <span
                        style={{
                          width: "12px",
                          height: "12px",
                          borderRadius: "50%",
                          backgroundColor: bp.primaryColor,
                          border: "1px solid rgba(0,0,0,0.15)",
                        }}
                      />
                      <span>{bp.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* Swatch Pickers */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {[
                  { label: "Accent Color", val: primaryColor, setVal: setPrimaryColor },
                  { label: "Card Background", val: bgColor, setVal: setBgColor },
                  { label: "Text Color", val: textColor, setVal: setTextColor },
                ].map(({ label, val, setVal }) => (
                  <div
                    key={label}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      backgroundColor: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      padding: "6px 12px",
                    }}
                  >
                    <span style={{ fontSize: "0.8125rem", color: "#475569" }}>{label}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <input
                        type="text"
                        value={val}
                        onChange={(e) => setVal(e.target.value)}
                        style={{
                          width: "78px",
                          backgroundColor: "#ffffff",
                          border: "1px solid #cbd5e1",
                          borderRadius: "6px",
                          padding: "4px 8px",
                          fontSize: "0.75rem",
                          fontFamily: "monospace",
                          color: "#0f172a",
                          textTransform: "uppercase",
                        }}
                      />
                      <label
                        style={{
                          width: "20px",
                          height: "20px",
                          borderRadius: "50%",
                          backgroundColor: val,
                          border: "2px solid #cbd5e1",
                          cursor: "pointer",
                          display: "inline-block",
                          position: "relative",
                          overflow: "hidden",
                          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                          flexShrink: 0,
                        }}
                        title={`Pick ${label}`}
                      >
                        <input
                          type="color"
                          value={val.startsWith("#") && val.length === 7 ? val : "#008060"}
                          onChange={(e) => setVal(e.target.value)}
                          style={{
                            position: "absolute",
                            top: "-10px",
                            left: "-10px",
                            width: "40px",
                            height: "40px",
                            opacity: 0,
                            cursor: "pointer",
                          }}
                        />
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Relative-flow footer in standalone mode (no absolute/sticky overlap) */}
            {isStandalone && (
              <div className="pt-3 border-t border-zinc-200 mt-2 flex items-center justify-between">
                <div className="text-xs text-zinc-500">
                  {hasSaved ? "Saved" : isDirty ? "Sandbox mode" : "Synced"}
                </div>
                <div className="flex items-center gap-2">
                  {isDirty && (
                    <button
                      type="button"
                      onClick={handleDiscard}
                      disabled={isSaving}
                      className="px-3 py-1.5 text-xs font-medium text-zinc-700 border border-zinc-300 rounded-md hover:bg-zinc-100 transition cursor-pointer"
                    >
                      Discard
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={(!isDirty && !hasSaved) || isSaving}
                    className="px-4 py-1.5 text-xs font-semibold rounded-md bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
                  >
                    {isSaving ? "Saving..." : hasSaved ? "Saved" : "Save Settings"}
                  </button>
                </div>
              </div>
            )}
        </aside>

        {/* Right Preview Canvas */}
        <section className="col-span-12 lg:col-span-7 xl:col-span-8 h-full overflow-y-auto overscroll-contain flex flex-col items-center justify-start p-8 bg-[#f7f8fa] pb-36">
            <div className="w-full max-w-3xl flex flex-col items-center mx-auto">
              {/* Browser Window Chrome Wrapper */}
              <div className="w-full bg-white border border-zinc-200/80 rounded-2xl overflow-hidden shadow-sm">
                {/* Top Window Chrome with Two-Way Device Viewport Toggle */}
                <div className="bg-zinc-100/90 border-b border-zinc-200 px-4 py-2.5 flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    <span className="ml-3 text-xs text-zinc-500 font-mono hidden sm:inline">
                      {activeSurface === "product"
                        ? "yourstore.com/products/classic-boxy-crewneck"
                        : activeSurface === "cart"
                        ? "yourstore.com/cart (Slide-Out Drawer)"
                        : "yourstore.com/checkout/orders/1084/thank_you"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Multi-Surface Switcher (21st.dev Segmented Pill) */}
                    <div className="bg-zinc-200/60 p-1 rounded-xl flex items-center gap-1 border border-zinc-200/80">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setActiveSurface("product");
                        }}
                        className={
                          activeSurface === "product"
                            ? "bg-white text-zinc-900 shadow-xs font-medium text-xs py-1.5 px-3 rounded-lg border border-zinc-200/80 inline-flex items-center gap-1.5 cursor-pointer transition-all"
                            : "text-zinc-500 hover:text-zinc-800 text-xs py-1.5 px-3 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                        }
                      >
                        <ShoppingBagIcon />
                        <span>Product Page</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setActiveSurface("cart");
                        }}
                        className={
                          activeSurface === "cart"
                            ? "bg-white text-zinc-900 shadow-xs font-medium text-xs py-1.5 px-3 rounded-lg border border-zinc-200/80 inline-flex items-center gap-1.5 cursor-pointer transition-all"
                            : "text-zinc-500 hover:text-zinc-800 text-xs py-1.5 px-3 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                        }
                      >
                        <SidebarCloseIcon />
                        <span>Cart Drawer</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setActiveSurface("thankyou");
                        }}
                        className={
                          activeSurface === "thankyou"
                            ? "bg-white text-zinc-900 shadow-xs font-medium text-xs py-1.5 px-3 rounded-lg border border-zinc-200/80 inline-flex items-center gap-1.5 cursor-pointer transition-all"
                            : "text-zinc-500 hover:text-zinc-800 text-xs py-1.5 px-3 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                        }
                      >
                        <PackageCheckIcon />
                        <span>Order Status</span>
                      </button>
                    </div>

                    {/* Device Viewport Toggle */}
                    <div className="flex items-center gap-0.5 bg-zinc-200/80 p-0.5 rounded-lg border border-zinc-300/80">
                      <button
                        type="button"
                        onClick={() => setViewportMode("desktop")}
                        className={`px-2.5 py-1 rounded-md text-xs font-medium transition cursor-pointer ${
                          viewportMode === "desktop"
                            ? "bg-white text-zinc-900 shadow-2xs font-semibold"
                            : "text-zinc-600 hover:text-zinc-900"
                        }`}
                      >
                        Desktop
                      </button>
                      <button
                        type="button"
                        onClick={() => setViewportMode("mobile")}
                        className={`px-2.5 py-1 rounded-md text-xs font-medium transition cursor-pointer ${
                          viewportMode === "mobile"
                            ? "bg-white text-zinc-900 shadow-2xs font-semibold"
                            : "text-zinc-600 hover:text-zinc-900"
                        }`}
                      >
                        Mobile (375px)
                      </button>
                    </div>

                    {/* Multi-Currency & Locale Simulation Toggle */}
                    <div className="flex items-center gap-1 bg-zinc-200/80 p-0.5 rounded-lg border border-zinc-300/80 text-xs">
                      <span className="text-[10px] font-semibold text-zinc-500 uppercase px-1">Cur:</span>
                      <select
                        value={selectedCurrency}
                        onChange={(e) => {
                          const val = e.target.value;
                          setSelectedCurrency(val);
                          if (val === "EUR") setSelectedLocale("de-DE");
                          else if (val === "GBP") setSelectedLocale("en-GB");
                          else if (val === "CAD") setSelectedLocale("en-CA");
                          else if (val === "AUD") setSelectedLocale("en-AU");
                          else if (val === "JPY") setSelectedLocale("ja-JP");
                          else setSelectedLocale("en-US");
                        }}
                        className="bg-white text-zinc-800 text-xs font-semibold rounded px-1.5 py-0.5 border border-zinc-200 cursor-pointer focus:outline-none"
                      >
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                        <option value="CAD">CAD ($)</option>
                        <option value="AUD">AUD ($)</option>
                        <option value="JPY">JPY (¥)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Canvas Surface with Refined Light Neutral Dot Grid */}
                <div
                  className="p-4 sm:p-6 bg-[#f8fafc] flex justify-center items-center w-full overflow-hidden"
                  style={{
                    backgroundImage: "radial-gradient(#e5e7eb 1.5px, transparent 1.5px)",
                    backgroundSize: "16px 16px",
                  }}
                >
                  {/* SURFACE 1: PRODUCT PAGE PREVIEW */}
                  {activeSurface === "product" && (
                    <div
                      className={`transition-all duration-300 ease-in-out mx-auto ${
                        viewportMode === "mobile" ? "max-w-[375px]" : "max-w-2xl"
                      } w-full bg-white rounded-2xl border border-zinc-200/90 shadow-xl overflow-hidden p-4 sm:p-5 mb-6`}
                    >
                      {/* Stock State Quick Switcher */}
                      <div className="flex items-center justify-between flex-wrap gap-2 mb-2.5 pb-2 border-b border-zinc-100">
                        <span className="text-xs font-semibold text-zinc-500">
                          Stock Simulation:
                        </span>
                        <div className="flex bg-zinc-100 p-0.5 rounded-lg border border-zinc-200/80">
                          <button
                            type="button"
                            onClick={() => {
                              setMockStockState("in_stock");
                              if (selectedSize === "L") setSelectedSize("M");
                            }}
                            className={`px-2.5 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
                              mockStockState === "in_stock"
                                ? "bg-white text-zinc-900 shadow-xs"
                                : "text-zinc-500 hover:text-zinc-700"
                            }`}
                          >
                            In Stock
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setMockStockState("backorder");
                              setSelectedSize("L");
                            }}
                            className={`px-2.5 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
                              mockStockState === "backorder"
                                ? "bg-white text-amber-700 shadow-xs"
                                : "text-zinc-500 hover:text-zinc-700"
                            }`}
                          >
                            Sold Out / Backorder
                          </button>
                        </div>
                      </div>

                      {/* PRODUCT IMAGE CONTAINER (Compact presentation: h-36 w-full with object-contain) */}
                      <div className="relative w-full h-36 bg-zinc-100 rounded-xl overflow-hidden border border-zinc-200/80 flex items-center justify-center p-2 select-none mb-2">
                        <svg 
                          viewBox="0 0 120 120" 
                          className="w-28 h-28 object-contain text-zinc-800 drop-shadow-sm transition-transform duration-300 hover:scale-105"
                          fill="currentColor"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M 40 16 C 45 24 75 24 80 16 L 104 28 L 92 46 L 82 40 L 82 100 C 82 102 80 104 78 104 L 42 104 C 40 104 38 102 38 100 L 38 40 L 28 46 L 16 28 Z" />
                          <path d="M 40 16 C 46 25 74 25 80 16 C 74 21 46 21 40 16 Z" fill="rgba(255,255,255,0.25)" />
                        </svg>
                        
                        <span className="absolute bottom-2 right-2 text-[9px] font-mono tracking-wider uppercase text-zinc-500 bg-white/90 backdrop-blur-sm px-1.5 py-0.5 rounded border border-zinc-200 shadow-xs">
                          Heavyweight 280 GSM
                        </span>
                      </div>

                      {/* Stock Status & SKU */}
                      <div className="my-1 flex items-center justify-between">
                        <span
                          style={{
                            fontSize: "0.6875rem",
                            fontWeight: "600",
                            textTransform: "uppercase",
                            letterSpacing: "0.06em",
                            color: mockStockState === "in_stock" ? "#008060" : "#b45309",
                          }}
                        >
                          {mockStockState === "in_stock" ? "● In Stock · Ships Promptly" : "○ Sold Out · Restock Queued"}
                        </span>
                        <span style={{ fontSize: "0.75rem", color: "#71717a" }}>SKU: DC-101</span>
                      </div>

                      <h2
                        className="my-1 text-base font-semibold tracking-tight text-zinc-900"
                        style={{
                          fontSize: "0.9375rem",
                          letterSpacing: "-0.025em",
                        }}
                      >
                        Classic Boxy Crewneck
                      </h2>

                      <div
                        className="my-1 text-base font-bold text-zinc-900"
                        style={{
                          fontSize: "1.0625rem",
                        }}
                      >
                        {formatStoreCurrency(42, selectedCurrency, selectedLocale)}
                      </div>

                      {/* Shopify Dawn Variant Selector */}
                      <div style={{ marginBottom: "8px" }}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span style={{ fontSize: "0.75rem", fontWeight: "600", color: "#3f3f46", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                            Size: <span style={{ color: "#09090b" }}>{selectedSize}</span>
                          </span>
                          <span className="text-xs text-zinc-500 hover:underline cursor-pointer ml-auto">
                            Size Guide
                          </span>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: viewportMode === "mobile" ? "6px" : "8px" }}>
                          {(["S", "M", "L", "XL"] as const).map((size) => {
                            const isSoldOut = size === "L";
                            const isSelected = selectedSize === size;
                            return (
                              <button
                                key={size}
                                type="button"
                                onClick={() => {
                                  setSelectedSize(size);
                                  if (isSoldOut) {
                                    setMockStockState("backorder");
                                  } else {
                                    setMockStockState("in_stock");
                                  }
                                }}
                                style={{
                                  flex: 1,
                                  padding: "6px 4px",
                                  borderRadius: "6px",
                                  border: isSelected ? "1.5px solid #09090b" : "1px solid #e4e4e7",
                                  backgroundColor: isSelected ? "#09090b" : "#ffffff",
                                  color: isSelected ? "#ffffff" : isSoldOut ? "#a1a1aa" : "#18181b",
                                  fontSize: "0.75rem",
                                  fontWeight: "600",
                                  cursor: "pointer",
                                  position: "relative",
                                  transition: "all 0.15s ease",
                                }}
                              >
                                {size}
                                {isSoldOut && (
                                  <span style={{ fontSize: "0.625rem", display: "block", fontWeight: "400", opacity: 0.8 }}>
                                    Sold Out
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Enterprise Tag Rule Simulator Chips */}
                      <div
                        style={{
                          backgroundColor: "#f8fafc",
                          border: "1px solid #e2e8f0",
                          borderRadius: "8px",
                          padding: "6px 8px",
                          marginBottom: "10px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginBottom: "6px",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "0.6875rem",
                              fontWeight: "600",
                              textTransform: "uppercase",
                              letterSpacing: "0.04em",
                              color: "#64748b",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                            }}
                          >
                            <TagIcon />
                            <span>Tag Simulator:</span>
                          </span>
                          {activeSimulatedTag !== "none" && (
                            <span
                              style={{
                                fontSize: "0.625rem",
                                fontWeight: "600",
                                color: "#059669",
                                backgroundColor: "#ecfdf5",
                                padding: "1px 6px",
                                borderRadius: "4px",
                                border: "1px solid #a7f3d0",
                              }}
                            >
                              +{preview.effectiveLeadDays}d Lead Time
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-1.5">
                          <button
                            type="button"
                            onClick={() => setActiveSimulatedTag("none")}
                            className={`px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer transition-all ${
                              activeSimulatedTag === "none"
                                ? "bg-[#008060] text-white shadow-2xs border border-[#008060]"
                                : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 border border-zinc-200/80"
                            }`}
                          >
                            Tag: none
                          </button>

                          <button
                            type="button"
                            onClick={() => setActiveSimulatedTag("pre-order")}
                            className={`px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer inline-flex items-center gap-1 transition-all ${
                              activeSimulatedTag.toLowerCase() === "pre-order"
                                ? "bg-[#008060] text-white shadow-2xs border border-[#008060]"
                                : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 border border-zinc-200/80"
                            }`}
                          >
                            <span>Tag: pre-order</span>
                            <span className="opacity-80 text-[10px]">
                              (+{tagRules.find((r) => r.tag.trim().toLowerCase() === "pre-order")?.leadDays || 14}d)
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setActiveSimulatedTag("freight")}
                            className={`px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer inline-flex items-center gap-1 transition-all ${
                              activeSimulatedTag.toLowerCase() === "freight"
                                ? "bg-[#008060] text-white shadow-2xs border border-[#008060]"
                                : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 border border-zinc-200/80"
                            }`}
                          >
                            <span>Tag: freight</span>
                            <span className="opacity-80 text-[10px]">
                              (+{tagRules.find((r) => r.tag.trim().toLowerCase() === "freight")?.leadDays || 5}d)
                            </span>
                          </button>

                          {tagRules
                            .filter(
                              (r) =>
                                r.tag &&
                                r.tag.trim().length > 0 &&
                                r.tag.trim().toLowerCase() !== "pre-order" &&
                                r.tag.trim().toLowerCase() !== "freight"
                            )
                            .map((rule) => {
                              const isSelected = activeSimulatedTag.toLowerCase() === rule.tag.trim().toLowerCase();
                              return (
                                <button
                                  key={rule.tag}
                                  type="button"
                                  onClick={() => setActiveSimulatedTag(rule.tag.trim())}
                                  className={`px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer inline-flex items-center gap-1 transition-all ${
                                    isSelected
                                      ? "bg-[#008060] text-white shadow-2xs border border-[#008060]"
                                      : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 border border-zinc-200/80"
                                  }`}
                                >
                                  <span>Tag: {rule.tag.trim()}</span>
                                  <span className="opacity-80 text-[10px]">
                                    (+{rule.leadDays}d)
                                  </span>
                                </button>
                              );
                            })}
                        </div>

                        <p style={{ margin: "6px 0 0 0", fontSize: "0.6875rem", color: "#64748b", fontStyle: "italic" }}>
                          Preview how product tags dynamically override delivery dates.
                        </p>
                      </div>

                      {/* 4. THE LIVE DYNAMIC DROPCLOCK WIDGET (POLISHED TYPOGRAPHY) */}
                      {mockStockState === "backorder" ? (
                        <div
                          style={{
                            backgroundColor: "#fffbeb",
                            color: "#92400e",
                            border: "1px solid #fde68a",
                            borderRadius: "8px",
                            padding: "10px 14px",
                            marginBottom: "16px",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            fontSize: "0.8125rem",
                            fontWeight: "500",
                          }}
                        >
                          <span style={{ color: "#d97706", display: "inline-flex" }}>
                            <AlertTriangleIcon />
                          </span>
                          <span>Backorder Item: Ships as soon as restocked.</span>
                        </div>
                      ) : (
                        <>
                          {/* Style 1: Capsule Pill */}
                          {presetStyle === "capsule" && (
                            <div
                              style={{
                                backgroundColor: bgColor,
                                color: textColor,
                                border: `1px solid ${primaryColor}22`,
                                borderRadius: "10px",
                                padding: "12px 14px",
                                marginBottom: "16px",
                                display: "flex",
                                flexDirection: "column",
                                gap: "6px",
                                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                              }}
                            >
                              <div
                                style={{
                                  fontSize: "0.8125rem",
                                  lineHeight: "1.4",
                                  color: textColor,
                                  display: "flex",
                                  alignItems: "flex-start",
                                  gap: "6px",
                                  minWidth: 0,
                                }}
                              >
                                <span
                                  style={{
                                    width: "6px",
                                    height: "6px",
                                    borderRadius: "50%",
                                    backgroundColor: primaryColor,
                                    display: "inline-block",
                                    flexShrink: 0,
                                    marginTop: "0.45em",
                                  }}
                                />
                                <span style={{ minWidth: 0, overflowWrap: "anywhere" }}>
                                  {leadText}{" "}
                                  <span
                                    style={{
                                      color: primaryColor,
                                      fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                                      fontWeight: "600",
                                      whiteSpace: "nowrap",
                                    }}
                                  >
                                    {preview.hours}h {preview.minutes}m {preview.seconds}s
                                  </span>{" "}
                                  {preview.isPastCutoff ? nextDayText : sameDayText}
                                </span>
                              </div>

                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "flex-start",
                                  gap: "6px",
                                  fontSize: "0.75rem",
                                  color: textColor,
                                  opacity: 0.88,
                                  paddingLeft: "12px",
                                  minWidth: 0,
                                }}
                              >
                                <span style={{ color: primaryColor, display: "inline-flex", flexShrink: 0, marginTop: "1px" }}>
                                  <TruckIcon />
                                </span>
                                <span style={{ minWidth: 0, overflowWrap: "anywhere" }}>
                                  {etaText} <strong style={{ color: textColor, fontWeight: "600" }}>{preview.formattedArrival}</strong>
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Style 2: Minimal Line */}
                          {presetStyle === "minimal" && (
                            <div
                              style={{
                                padding: "10px 0",
                                marginBottom: "16px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                borderTop: "1px solid #f1f5f9",
                                borderBottom: "1px solid #f1f5f9",
                                color: textColor,
                                fontSize: "0.8125rem",
                                gap: "8px",
                                flexWrap: viewportMode === "mobile" ? "wrap" : "nowrap",
                              }}
                            >
                              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                <span style={{ color: primaryColor, display: "inline-flex" }}>
                                  <ClockIcon />
                                </span>
                                <span>
                                  {leadText}{" "}
                                  <span
                                    style={{
                                      color: primaryColor,
                                      fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                                      fontWeight: "600",
                                    }}
                                  >
                                    {preview.hours}h {preview.minutes}m {preview.seconds}s
                                  </span>{" "}
                                  {preview.isPastCutoff ? nextDayText : sameDayText}
                                </span>
                              </div>
                              <div style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "0.75rem", color: "#64748b", flexShrink: 0 }}>
                                <TruckIcon />
                                <span>{etaText} {preview.formattedArrival}</span>
                              </div>
                            </div>
                          )}

                          {/* Style 3: Urgency Progress Bar */}
                          {(presetStyle === "bar" || presetStyle === "urgency") && (
                            <div
                              style={{
                                backgroundColor: bgColor,
                                color: textColor,
                                border: `1px solid ${primaryColor}26`,
                                borderRadius: "10px",
                                padding: "12px 14px",
                                marginBottom: "16px",
                                display: "flex",
                                flexDirection: "column",
                                gap: "8px",
                                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  flexWrap: "wrap",
                                  gap: "6px",
                                  fontSize: "0.8125rem",
                                }}
                              >
                                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                  <span
                                    style={{
                                      width: "6px",
                                      height: "6px",
                                      borderRadius: "50%",
                                      backgroundColor: primaryColor,
                                      display: "inline-block",
                                    }}
                                  />
                                  <span>
                                    {leadText}{" "}
                                    <span
                                      style={{
                                        color: primaryColor,
                                        fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                                        fontWeight: "600",
                                      }}
                                    >
                                      {preview.hours}h {preview.minutes}m {preview.seconds}s
                                    </span>
                                  </span>
                                </div>
                                <span
                                  style={{
                                    fontSize: "0.6875rem",
                                    fontWeight: "600",
                                    color: primaryColor,
                                    backgroundColor: `${primaryColor}15`,
                                    padding: "2px 6px",
                                    borderRadius: "4px",
                                  }}
                                >
                                  {preview.isPastCutoff ? nextDayText : sameDayText}
                                </span>
                              </div>

                              {/* Progress Bar Track */}
                              <div
                                style={{
                                  width: "100%",
                                  height: "4px",
                                  backgroundColor: "rgba(0,0,0,0.06)",
                                  borderRadius: "9999px",
                                  position: "relative",
                                }}
                              >
                                <div
                                  style={{
                                    width: `${preview.progressPercent}%`,
                                    height: "100%",
                                    backgroundColor: primaryColor,
                                    borderRadius: "9999px",
                                    transition: "width 0.5s ease",
                                    position: "relative",
                                  }}
                                >
                                  {preview.isUrgent && (
                                    <span
                                      style={{
                                        position: "absolute",
                                        right: "-3px",
                                        top: "-2px",
                                        width: "8px",
                                        height: "8px",
                                        borderRadius: "50%",
                                        backgroundColor: primaryColor,
                                        boxShadow: `0 0 0 0 ${primaryColor}88`,
                                        animation: "p 1.8s infinite",
                                      }}
                                    />
                                  )}
                                </div>
                              </div>

                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  flexWrap: "wrap",
                                  gap: "4px 8px",
                                  fontSize: "0.75rem",
                                  opacity: 0.88,
                                }}
                              >
                                <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                                  <span style={{ color: primaryColor, display: "inline-flex" }}>
                                    <TruckIcon />
                                  </span>
                                  <span>
                                    {etaText} <strong style={{ color: textColor, fontWeight: "600" }}>{preview.formattedArrival}</strong>
                                  </span>
                                </div>
                                <span style={{ fontSize: "0.6875rem", color: "#64748b" }}>
                                  {preview.progressPercent}% window left
                                </span>
                              </div>
                            </div>
                          )}
                        </>
                      )}

                      {/* Add to Cart Button */}
                      <button
                        type="button"
                        disabled
                        style={{
                          width: "100%",
                          backgroundColor: "#09090b",
                          color: "#ffffff",
                          border: "none",
                          borderRadius: "8px",
                          padding: "12px",
                          fontSize: "0.875rem",
                          fontWeight: "600",
                          cursor: "not-allowed",
                          letterSpacing: "-0.01em",
                        }}
                      >
                        {mockStockState === "in_stock" ? "Add to Cart" : "Sold Out"}
                      </button>

                      {/* Shop Pay Direct Checkout Button */}
                      <button
                        type="button"
                        disabled
                        style={{
                          width: "100%",
                          backgroundColor: "#5a31f4",
                          color: "#ffffff",
                          border: "none",
                          borderRadius: "8px",
                          padding: "11px",
                          fontSize: "0.875rem",
                          fontWeight: "600",
                          cursor: "not-allowed",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "6px",
                          marginTop: "8px",
                          letterSpacing: "-0.01em",
                        }}
                      >
                        <span>Buy with</span>
                        <span
                          style={{
                            backgroundColor: "#ffffff",
                            color: "#5a31f4",
                            fontSize: "0.75rem",
                            fontWeight: "800",
                            padding: "1px 6px",
                            borderRadius: "4px",
                            letterSpacing: "-0.02em",
                            display: "inline-flex",
                            alignItems: "center",
                          }}
                        >
                          Shop Pay
                        </span>
                      </button>

                      <div
                        style={{
                          textAlign: "center",
                          marginTop: "8px",
                          fontSize: "0.6875rem",
                          color: "#71717a",
                          textDecoration: "underline",
                          cursor: "pointer",
                        }}
                      >
                        More payment options
                      </div>
                    </div>
                  )}

                  {/* SURFACE 2: SLIDE-OUT CART DRAWER PREVIEW */}
                  {activeSurface === "cart" && (
                    <div
                      className={`transition-all duration-300 ease-in-out mx-auto ${
                        viewportMode === "mobile" ? "w-full max-w-full" : "max-w-md w-full"
                      } bg-white rounded-2xl border border-zinc-200/90 shadow-xl overflow-hidden mb-6 flex flex-col`}
                    >
                      {/* Cart Drawer Header with Close Button */}
                      <div className="p-4 border-b border-zinc-200/80 bg-zinc-50/70 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <SidebarCloseIcon />
                          <h3 className="text-sm font-semibold text-zinc-900 m-0">
                            Your Cart ({cartSubtotal > 42 ? 2 : 1} {cartSubtotal > 42 ? "Items" : "Item"})
                          </h3>
                        </div>
                        <button
                          type="button"
                          onClick={() => setActiveSurface("product")}
                          className="w-7 h-7 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200/60 flex items-center justify-center transition-colors cursor-pointer"
                          title="Close Cart Drawer"
                        >
                          <XIcon />
                        </button>
                      </div>

                      {/* Interactive Threshold Simulation Chips */}
                      <div className="px-4 py-2.5 bg-zinc-100/70 border-b border-zinc-200/70 flex items-center justify-between flex-wrap gap-2 text-xs">
                        <span className="text-zinc-600 font-medium">
                          Simulate Subtotal:
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedCartPreset("below");
                              setCartSubtotal(cartPresets.below.subtotal);
                            }}
                            className={`px-2 py-1 rounded-md text-[11px] font-semibold transition cursor-pointer ${
                              selectedCartPreset === "below"
                                ? "bg-zinc-900 text-white shadow-2xs"
                                : "bg-white text-zinc-700 border border-zinc-200 hover:bg-zinc-50"
                            }`}
                          >
                            {formatStoreCurrency(cartPresets.below.subtotal, selectedCurrency, selectedLocale)} (Below)
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedCartPreset("near");
                              setCartSubtotal(cartPresets.near.subtotal);
                            }}
                            className={`px-2 py-1 rounded-md text-[11px] font-semibold transition cursor-pointer ${
                              selectedCartPreset === "near"
                                ? "bg-zinc-900 text-white shadow-2xs"
                                : "bg-white text-zinc-700 border border-zinc-200 hover:bg-zinc-50"
                            }`}
                          >
                            {formatStoreCurrency(cartPresets.near.subtotal, selectedCurrency, selectedLocale)} (Near)
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedCartPreset("qualified");
                              setCartSubtotal(cartPresets.qualified.subtotal);
                            }}
                            className={`px-2 py-1 rounded-md text-[11px] font-semibold transition cursor-pointer ${
                              selectedCartPreset === "qualified"
                                ? "bg-emerald-700 text-white shadow-2xs"
                                : "bg-white text-emerald-800 border border-emerald-300 hover:bg-emerald-50"
                            }`}
                          >
                            {formatStoreCurrency(cartPresets.qualified.subtotal, selectedCurrency, selectedLocale)} (Qualified)
                          </button>
                        </div>
                      </div>

                      {/* The DropClock Live Cart Pill Component */}
                      <div className="p-4 bg-white space-y-4">
                        {enableCartProgressBar && (() => {
                          const diff = Math.max(0, cartThreshold - cartSubtotal);
                          const isQualified = diff <= 0;
                          const progress = Math.min(100, Math.round((cartSubtotal / cartThreshold) * 100));

                          return (
                            <div className="p-3.5 rounded-xl border border-zinc-200/90 bg-[#f8fafc] shadow-xs space-y-2.5">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                                    <TruckIcon />
                                  </div>
                                  <div>
                                    <div className="text-xs font-semibold text-zinc-900">
                                      {isQualified ? (
                                        <span className="text-emerald-700 flex items-center gap-1 font-semibold">
                                          <CheckIcon /> Free Express Delivery Qualified
                                        </span>
                                      ) : (
                                        <span>
                                          Add <strong className="text-emerald-700">{formatStoreCurrency(diff, selectedCurrency, selectedLocale)}</strong> more to unlock Free Express Delivery
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-[11px] text-zinc-500 mt-0.5">
                                      🔥 Order within{" "}
                                      <span className="font-mono font-semibold text-emerald-700">
                                        {preview.hours}h {preview.minutes}m {preview.seconds}s
                                      </span>{" "}
                                      {preview.isPastCutoff ? "for tomorrow's dispatch!" : "for today's dispatch!"}
                                    </div>
                                  </div>
                                </div>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/70 shrink-0 font-mono">
                                  {progress}%
                                </span>
                              </div>

                              {/* Progress bar */}
                              <div className="w-full bg-zinc-200/90 h-1.5 rounded-full overflow-hidden">
                                <div
                                  className="h-full transition-all duration-500 ease-out rounded-full"
                                  style={{
                                    width: `${progress}%`,
                                    backgroundColor: primaryColor || "#008060",
                                  }}
                                />
                              </div>
                            </div>
                          );
                        })()}

                        {/* Realistic Cart Item Rows with Exact Matching Arithmetic from cartPresets */}
                        <div className="space-y-3 pt-1">
                          {cartPresets[selectedCartPreset].items.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between pb-3 border-b border-zinc-100">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-lg bg-zinc-100 border border-zinc-200/80 flex items-center justify-center text-zinc-700 p-2 shrink-0">
                                  {item.image === "tshirt" ? (
                                    <svg viewBox="0 0 120 120" className="w-8 h-8" fill="currentColor">
                                      <path d="M 40 16 C 45 24 75 24 80 16 L 104 28 L 92 46 L 82 40 L 82 100 C 82 102 80 104 78 104 L 42 104 C 40 104 38 102 38 100 L 38 40 L 28 46 L 16 28 Z" />
                                    </svg>
                                  ) : (
                                    <svg viewBox="0 0 24 24" className="w-6 h-6 text-emerald-700" fill="none" stroke="currentColor" strokeWidth="1.75">
                                      <path d="M4 14a8 8 0 0 1 16 0v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-4z" />
                                      <circle cx="12" cy="5" r="2" />
                                      <line x1="4" y1="17" x2="20" y2="17" />
                                    </svg>
                                  )}
                                </div>
                                <div>
                                  <div className="text-xs font-semibold text-zinc-900">
                                    {item.name}
                                  </div>
                                  <div className="text-[11px] text-zinc-500">
                                    Size: {item.size} · Qty: {item.qty}
                                  </div>
                                </div>
                              </div>
                              <span className="text-xs font-bold text-zinc-900">{formatStoreCurrency(item.price, selectedCurrency, selectedLocale)}</span>
                            </div>
                          ))}
                        </div>

                        {/* Cart Summary and Checkout Button - Zero Arithmetic Desync */}
                        {(() => {
                          const isFree = cartSubtotal >= cartThreshold;
                          const shippingCost = isFree ? 0.00 : cartPresets[selectedCartPreset].shipping;
                          const totalNum = cartSubtotal + shippingCost;

                          return (
                            <div className="pt-2 border-t border-zinc-200/90 space-y-2">
                              <div className="flex justify-between text-xs text-zinc-600">
                                <span>Subtotal</span>
                                <span className="font-semibold text-zinc-900">{formatStoreCurrency(cartSubtotal, selectedCurrency, selectedLocale)}</span>
                              </div>
                              <div className="flex justify-between text-xs text-zinc-600">
                                <span>Shipping</span>
                                <span className="font-semibold text-emerald-700">
                                  {isFree ? "FREE Express" : `${formatStoreCurrency(shippingCost, selectedCurrency, selectedLocale)} Standard`}
                                </span>
                              </div>
                              <div className="flex justify-between text-sm font-bold text-zinc-900 pt-2 border-t border-zinc-100">
                                <span>Total</span>
                                <span>{formatStoreCurrency(totalNum, selectedCurrency, selectedLocale)}</span>
                              </div>

                              <button
                                type="button"
                                disabled
                                className="w-full mt-3 bg-zinc-900 hover:bg-zinc-800 text-white font-semibold py-3 rounded-xl text-xs flex items-center justify-center gap-2 cursor-not-allowed"
                              >
                                <span>Checkout • {formatStoreCurrency(totalNum, selectedCurrency, selectedLocale)}</span>
                              </button>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  )}

                  {/* SURFACE 3: POST-PURCHASE ORDER STATUS / THANK YOU PAGE */}
                  {activeSurface === "thankyou" && (
                    <div
                      className={`transition-all duration-300 ease-in-out mx-auto ${
                        viewportMode === "mobile" ? "max-w-[375px]" : "max-w-xl"
                      } w-full bg-white rounded-2xl border border-zinc-200/90 shadow-xl overflow-hidden mb-6 p-6 space-y-4`}
                    >
                      {/* Order Confirmation Header */}
                      <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0">
                            <CheckIcon />
                          </div>
                          <div>
                            <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                              Order #1084 Confirmed
                            </span>
                            <h3 className="text-sm font-semibold text-zinc-900 m-0">
                              Thank you, Alex!
                            </h3>
                          </div>
                        </div>
                        <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-full">
                          Confirmed
                        </span>
                      </div>

                      {/* DropClock 3-Step Milestone Fulfillment Timeline Card */}
                      <div className="p-4 rounded-xl border border-zinc-200/80 bg-zinc-50/50 space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            <span className="text-xs font-semibold text-zinc-900">
                              Live Fulfillment Promise
                            </span>
                          </div>
                          <span className="text-[10px] font-medium text-zinc-500 bg-white border border-zinc-200 px-2 py-0.5 rounded-md">
                            Priority Dispatch
                          </span>
                        </div>

                        {/* 3-Step Timeline Track */}
                        <div className="relative pt-2 pb-1">
                          {/* Connecting Track Lines */}
                          <div className="absolute top-[17px] left-[18%] right-[50%] h-[2px] bg-emerald-500 z-0" />
                          <div className="absolute top-[17px] left-[50%] right-[18%] h-[2px] bg-zinc-200 z-0" />

                          <div className="grid grid-cols-3 gap-2 text-center relative z-10">
                            {/* Step 1: Order Placed (Completed State) */}
                            <div className="flex flex-col items-center">
                              <div className="w-7 h-7 rounded-full bg-emerald-600 text-white border border-emerald-600 flex items-center justify-center shadow-xs">
                                <CheckIcon />
                              </div>
                              <span className="text-xs font-medium text-zinc-900 mt-2">Order Placed</span>
                              <span className="text-[10px] text-zinc-400 mt-0.5">Today, 10:24 AM</span>
                            </div>

                            {/* Step 2: Dispatched (In-Progress State) */}
                            <div className="flex flex-col items-center">
                              <div className="relative flex items-center justify-center">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-40"></span>
                                <div className="w-7 h-7 rounded-full bg-emerald-50 border border-emerald-500 text-emerald-700 flex items-center justify-center shadow-xs relative">
                                  <Clock3Icon />
                                </div>
                              </div>
                              <span className="text-xs font-semibold text-emerald-700 mt-2">Dispatched</span>
                              <span className="text-[10px] text-emerald-600 font-medium mt-0.5">
                                Today by {cutoffHour.toString().padStart(2, "0")}:{cutoffMinute.toString().padStart(2, "0")}
                              </span>
                            </div>

                            {/* Step 3: Arrival (Pending State) */}
                            <div className="flex flex-col items-center">
                              <div className="w-7 h-7 rounded-full bg-zinc-100 text-zinc-400 border border-zinc-200 flex items-center justify-center shadow-2xs">
                                <TruckIcon />
                              </div>
                              <span className="text-xs font-medium text-zinc-600 mt-2">Estimated Arrival</span>
                              <span className="text-[10px] text-zinc-500 font-medium mt-0.5">
                                {orderStatusArrival}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="pt-2.5 border-t border-zinc-200/60 text-[11px] text-zinc-500 leading-relaxed flex items-start gap-2">
                          <span className="text-emerald-600 font-bold shrink-0">✓</span>
                          <span>
                            Automated warehouse dispatch SLA active. Carrier tracking will be emailed the moment the parcel is scanned by express courier.
                          </span>
                        </div>
                      </div>

                      {/* Customer & Shipping Summary */}
                      <div className="text-xs space-y-2 pt-2 border-t border-zinc-100">
                        <div className="flex justify-between">
                          <span className="text-zinc-500">Recipient:</span>
                          <span className="font-medium text-zinc-800">Alex Merchant (alex@example.com)</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-500">Shipping to:</span>
                          <span className="font-medium text-zinc-800">742 Evergreen Terrace, Springfield</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-500">Fulfillment Method:</span>
                          <span className="font-semibold text-emerald-700">Express Delivery (ETA: {orderStatusArrival})</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
  );
}
