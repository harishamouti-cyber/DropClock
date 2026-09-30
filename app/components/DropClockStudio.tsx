import { useState, useMemo, useEffect } from "react";
import { useSubmit, useNavigation } from "@remix-run/react";
import { Page } from "@shopify/polaris";
import { SaveBar, TitleBar } from "@shopify/app-bridge-react";

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
}

declare global {
  interface Window {
    shopify?: {
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

  // Shopify Deep-Link Theme Customizer Protocol
  // Format: https://{shop}/admin/themes/current/editor?template=product&addAppBlockId={extension_id}/{block_handle}&target=mainProduct
  const shopDomain = shop || "my-store.myshopify.com";
  // Block handle from extensions/dropclock-extension/blocks/dropclock_pill.liquid
  const themeEditorDeepLink = `https://${shopDomain}/admin/themes/current/editor?template=product&activateAppId=${
    propExtensionId || (typeof process !== "undefined" && process?.env?.SHOPIFY_DROPCLOCK_EXTENSION_ID) || "6ccfac9a-9e01-8c6b-a21e-2c7474d1188e729b0378"
  }`;

  // Defensive App Bridge Environment Detection
  const [isEmbedded, setIsEmbedded] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && Boolean(window.shopify?.saveBar)) {
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
  const [leadDays, setLeadDays] = useState(settings.leadDays);
  const [isCustomLeadDays, setIsCustomLeadDays] = useState(settings.leadDays > 2);
  const [presetStyle, setPresetStyle] = useState(settings.widgetStyle || settings.presetStyle || "capsule");
  const [primaryColor, setPrimaryColor] = useState(settings.accentColor || settings.primaryColor || "#008060");
  const [bgColor, setBgColor] = useState(settings.cardBg || settings.bgColor || "#F4F6F8");
  const [textColor, setTextColor] = useState(settings.textColor || "#202223");
  const [workingDays, setWorkingDays] = useState<number[]>(() => {
    try {
      return JSON.parse(settings.workingDays || "[1,2,3,4,5]");
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

  // Save feedback states
  const [isSaving, setIsSaving] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);
  const [baselineSettings, setBaselineSettings] = useState(settings);

  useEffect(() => {
    setBaselineSettings(settings);
  }, [settings]);

  // Calculate Form Dirty State for App Bridge SaveBar
  const isDirty = useMemo(() => {
    return (
      cutoffHour !== baselineSettings.cutoffHour ||
      cutoffMinute !== baselineSettings.cutoffMinute ||
      leadDays !== baselineSettings.leadDays ||
      presetStyle !== (baselineSettings.presetStyle || "capsule") ||
      primaryColor.toLowerCase() !== (baselineSettings.primaryColor || "").toLowerCase() ||
      bgColor.toLowerCase() !== (baselineSettings.bgColor || "").toLowerCase() ||
      textColor.toLowerCase() !== (baselineSettings.textColor || "").toLowerCase() ||
      JSON.stringify(workingDays) !== (baselineSettings.workingDays || "[1,2,3,4,5]") ||
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
    presetStyle,
    primaryColor,
    bgColor,
    textColor,
    workingDays,
    blackoutDates,
    tagRules,
    leadText,
    sameDayText,
    nextDayText,
    etaText,
    baselineSettings,
  ]);

  const handleDiscard = () => {
    setCutoffHour(baselineSettings.cutoffHour);
    setCutoffMinute(baselineSettings.cutoffMinute);
    setLeadDays(baselineSettings.leadDays);
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
      setWorkingDays(JSON.parse(baselineSettings.workingDays || "[1,2,3,4,5]"));
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

    // Tag Rule Resolution for Simulation
    let effectiveLeadDays = leadDays;
    if (activeSimulatedTag !== "none") {
      const matched = tagRules.find(
        (r) => r.tag.trim().toLowerCase() === activeSimulatedTag.trim().toLowerCase()
      );
      if (matched) {
        effectiveLeadDays = matched.leadDays;
      }
    }

    // Helper to test if a candidate date is a blackout date (YYYY-MM-DD in warehouse time)
    const isBlackout = (d: Date) => {
      const y = d.getFullYear();
      const m = (d.getMonth() + 1).toString().padStart(2, "0");
      const day = d.getDate().toString().padStart(2, "0");
      const isoStr = `${y}-${m}-${day}`;
      return blackoutDates.includes(isoStr);
    };

    // Calculate Delivery Arrival Date
    let delivery = new Date(warehouseNow);
    if (isPastCutoff) {
      delivery.setDate(delivery.getDate() + 1);
    }
    let transitLeft = effectiveLeadDays;
    while (transitLeft > 0 || !workingDays.includes(delivery.getDay()) || isBlackout(delivery)) {
      delivery.setDate(delivery.getDate() + 1);
      if (workingDays.includes(delivery.getDay()) && !isBlackout(delivery)) {
        if (transitLeft > 0) {
          transitLeft--;
        }
      }
    }

    const options: Intl.DateTimeFormatOptions = { weekday: "long", month: "short", day: "numeric" };
    const formattedArrival = delivery.toLocaleDateString("en-US", options);

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
  ]);

  return (
    <Page fullWidth>
      {/* App Bridge Contextual TitleBar & Native SaveBar */}
      {!isStandalone && isEmbedded && (
        <>
          <TitleBar title="DropClock Studio">
            <button
              variant="primary"
              onClick={() => window.open(themeEditorDeepLink, "_blank")}
            >
              Add to Theme Editor
            </button>
            <button
              onClick={() =>
                window.open("https://github.com/harishamouti-cyber/DropClock#readme", "_blank")
              }
            >
              Documentation
            </button>
          </TitleBar>

          <SaveBar id="dropclock-save-bar" open={isDirty}>
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
          </SaveBar>
        </>
      )}

      <style>{`
        @media (max-width: 1023px) {
          .dropclock-studio-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      <div
        style={{
          minHeight: "calc(100vh - 4rem)",
          backgroundColor: "#09090b",
          color: "#fafafa",
          fontFamily:
            'Geist, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          margin: "-20px",
          padding: "24px 32px",
          boxSizing: "border-box",
        }}
      >
        {/* 2. CLEAN HEADER (SCRUBBED OF JARGON & PROMOTIONS) */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingBottom: "16px",
            borderBottom: "1px solid #1f1f23",
            marginBottom: "24px",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1
              style={{
                fontSize: "1.1875rem",
                fontWeight: "600",
                letterSpacing: "-0.02em",
                margin: 0,
                color: "#fafafa",
              }}
            >
              DropClock Studio
            </h1>

            <span
              style={{
                fontSize: "0.6875rem",
                fontWeight: "500",
                color: "#a1a1aa",
                backgroundColor: "#18181b",
                border: "1px solid #27272a",
                padding: "2px 8px",
                borderRadius: "9999px",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <span
                style={{
                  width: "5px",
                  height: "5px",
                  borderRadius: "50%",
                  backgroundColor: "#10b981",
                }}
              />
              Dawn 15.0 (Active Theme)
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {isStandalone && isDirty && (
              <button
                type="button"
                onClick={handleDiscard}
                style={{
                  backgroundColor: "#27272a",
                  color: "#fafafa",
                  border: "1px solid #3f3f46",
                  borderRadius: "6px",
                  padding: "7px 12px",
                  fontSize: "0.75rem",
                  fontWeight: "500",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                Reset Changes
              </button>
            )}

            <a
              href={themeEditorDeepLink}
              target="_blank"
              rel="noreferrer"
              style={{
                backgroundColor: "#18181b",
                color: "#fafafa",
                border: "1px solid #27272a",
                borderRadius: "6px",
                padding: "7px 14px",
                fontSize: "0.8125rem",
                fontWeight: "500",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                boxShadow: "inset 0 1px 0 0 rgba(255,255,255,0.05)",
                transition: "all 0.15s ease",
              }}
            >
              <span>Add to Theme Editor</span>
              <ExternalLinkIcon />
            </a>
          </div>
        </div>

        {/* 21st.dev Split-Pane Studio Layout (Collapsing cleanly to single-column under 1024px) */}
        <div
          className="dropclock-studio-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(340px, 440px) 1fr",
            gap: "28px",
            alignItems: "start",
          }}
        >
          {/* 3. LEFT PANE: Modular Parameter Controls (Scrollable Container) */}
          <div
            className="overflow-y-auto max-h-[calc(100vh-80px)] pr-2 pb-16"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "18px",
              maxHeight: "calc(100vh - 80px)",
              overflowY: "auto",
              paddingRight: "8px",
              paddingBottom: "64px",
            }}
          >
            {/* 1. Cutoff Time Controller */}
            <div
              style={{
                backgroundColor: "#121215",
                border: "1px solid #1f1f23",
                borderRadius: "12px",
                padding: "18px",
                boxShadow: "inset 0 1px 0 0 rgba(255,255,255,0.03)",
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
                  <ClockIcon />
                  <span style={{ fontSize: "0.875rem", fontWeight: "600", color: "#fafafa" }}>
                    Fulfillment Cutoff
                  </span>
                </div>
                <span
                  style={{
                    fontSize: "0.6875rem",
                    color: "#a1a1aa",
                    backgroundColor: "#18181b",
                    border: "1px solid #27272a",
                    padding: "2px 8px",
                    borderRadius: "9999px",
                  }}
                >
                  {timezoneLabel}
                </span>
              </div>

              {/* 24h Digital Time Display & Stepper */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                  backgroundColor: "#18181b",
                  border: "1px solid #27272a",
                  borderRadius: "10px",
                  padding: "14px",
                  marginBottom: "14px",
                }}
              >
                <button
                  type="button"
                  onClick={() => setCutoffHour((h) => (h > 0 ? h - 1 : 23))}
                  style={{
                    width: "30px",
                    height: "30px",
                    borderRadius: "6px",
                    border: "1px solid #27272a",
                    backgroundColor: "#27272a",
                    color: "#fafafa",
                    fontWeight: "700",
                    fontSize: "1rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  -
                </button>
                <div
                  style={{
                    fontSize: "2rem",
                    fontWeight: "700",
                    fontFamily: "monospace",
                    letterSpacing: "0.05em",
                    color: "#fafafa",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <span>{cutoffHour.toString().padStart(2, "0")}</span>
                  <span style={{ color: "#10b981", margin: "0 4px" }}>:</span>
                  <span>{cutoffMinute.toString().padStart(2, "0")}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setCutoffHour((h) => (h < 23 ? h + 1 : 0))}
                  style={{
                    width: "30px",
                    height: "30px",
                    borderRadius: "6px",
                    border: "1px solid #27272a",
                    backgroundColor: "#27272a",
                    color: "#fafafa",
                    fontWeight: "700",
                    fontSize: "1rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
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
                        border: active ? "1px solid #10b981" : "1px solid #27272a",
                        backgroundColor: active ? "rgba(16, 185, 129, 0.12)" : "#18181b",
                        color: active ? "#34d399" : "#a1a1aa",
                        fontSize: "0.75rem",
                        fontWeight: "500",
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
                backgroundColor: "#121215",
                border: "1px solid #1f1f23",
                borderRadius: "12px",
                padding: "18px",
                boxShadow: "inset 0 1px 0 0 rgba(255,255,255,0.03)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                <LayoutIcon />
                <span style={{ fontSize: "0.875rem", fontWeight: "600", color: "#fafafa" }}>
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
                        border: active ? "1px solid #10b981" : "1px solid #27272a",
                        backgroundColor: active ? "rgba(16, 185, 129, 0.08)" : "#18181b",
                        color: active ? "#fafafa" : "#a1a1aa",
                        textAlign: "left",
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: "column",
                        gap: "6px",
                        transition: "all 0.15s ease",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={{ color: active ? "#10b981" : "#71717a" }}>{preset.icon}</span>
                        {active && (
                          <span style={{ color: "#10b981" }}>
                            <CheckIcon />
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: "0.8125rem", fontWeight: "600", color: active ? "#fafafa" : "#e4e4e7" }}>
                        {preset.name}
                      </span>
                      <span style={{ fontSize: "0.6875rem", color: "#71717a", lineHeight: "1.3" }}>
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
                backgroundColor: "#121215",
                border: "1px solid #1f1f23",
                borderRadius: "12px",
                padding: "18px",
                boxShadow: "inset 0 1px 0 0 rgba(255,255,255,0.03)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                <TruckIcon />
                <span style={{ fontSize: "0.875rem", fontWeight: "600", color: "#fafafa" }}>
                  Transit Lead Time
                </span>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: "6px",
                  backgroundColor: "#18181b",
                  padding: "4px",
                  borderRadius: "8px",
                  border: "1px solid #27272a",
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
                        backgroundColor: active ? "#27272a" : "transparent",
                        color: active ? "#fafafa" : "#71717a",
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
                    borderTop: "1px solid #1f1f23",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      backgroundColor: "#18181b",
                      padding: "4px 8px",
                      borderRadius: "8px",
                      border: "1px solid #27272a",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setLeadDays((d) => Math.max(1, d - 1))}
                      style={{
                        width: "26px",
                        height: "26px",
                        borderRadius: "6px",
                        border: "1px solid #27272a",
                        backgroundColor: "#27272a",
                        color: "#fafafa",
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
                        color: "#fafafa",
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
                        border: "1px solid #27272a",
                        backgroundColor: "#27272a",
                        color: "#fafafa",
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
                  <span style={{ fontSize: "0.8125rem", color: "#71717a" }}>
                    Transit fulfillment window (1–30 days)
                  </span>
                </div>
              )}
            </div>

            {/* 4. Operating Days */}
            <div
              style={{
                backgroundColor: "#121215",
                border: "1px solid #1f1f23",
                borderRadius: "12px",
                padding: "18px",
                boxShadow: "inset 0 1px 0 0 rgba(255,255,255,0.03)",
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
                  <span style={{ fontSize: "0.875rem", fontWeight: "600", color: "#fafafa" }}>
                    Operating Days
                  </span>
                </div>
                <span style={{ fontSize: "0.75rem", color: "#71717a" }}>
                  {workingDays.length} Active Days
                </span>
              </div>

              <div style={{ display: "flex", gap: "6px" }}>
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
                        aspectRatio: "1",
                        borderRadius: "8px",
                        border: active ? "1px solid rgba(16, 185, 129, 0.5)" : "1px solid #27272a",
                        backgroundColor: active ? "rgba(16, 185, 129, 0.12)" : "#18181b",
                        color: active ? "#34d399" : "#52525b",
                        fontSize: "0.8125rem",
                        fontWeight: "600",
                        cursor: "pointer",
                      }}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 5. Warehouse Holiday & Blackout Dates */}
            <div
              style={{
                backgroundColor: "#121215",
                border: "1px solid #1f1f23",
                borderRadius: "12px",
                padding: "18px",
                boxShadow: "inset 0 1px 0 0 rgba(255,255,255,0.03)",
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
                  <span style={{ fontSize: "0.875rem", fontWeight: "600", color: "#fafafa" }}>
                    Warehouse Holiday &amp; Blackout Dates
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span
                    style={{
                      fontSize: "0.6875rem",
                      fontWeight: "500",
                      color: blackoutDates.length > 0 ? "#10b981" : "#71717a",
                      backgroundColor: blackoutDates.length > 0 ? "rgba(16, 185, 129, 0.1)" : "#18181b",
                      border: "1px solid",
                      borderColor: blackoutDates.length > 0 ? "rgba(16, 185, 129, 0.25)" : "#27272a",
                      padding: "2px 8px",
                      borderRadius: "9999px",
                    }}
                  >
                    {blackoutDates.length} {blackoutDates.length === 1 ? "Date" : "Dates"}
                  </span>
                  <span style={{ color: "#71717a" }}>
                    <ChevronDownIcon open={isBlackoutOpen} />
                  </span>
                </div>
              </div>

              {isBlackoutOpen && (
                <div style={{ marginTop: "14px", display: "flex", flexDirection: "column", gap: "12px" }}>
                  <p style={{ margin: 0, fontSize: "0.75rem", color: "#a1a1aa", lineHeight: "1.4" }}>
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
                        backgroundColor: "#18181b",
                        border: "1px solid #27272a",
                        borderRadius: "8px",
                        padding: "8px 10px",
                        fontSize: "0.75rem",
                        color: "#fafafa",
                        outline: "none",
                        colorScheme: "dark",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => addBlackoutDate(newBlackoutDate)}
                      disabled={!newBlackoutDate}
                      style={{
                        padding: "8px 12px",
                        backgroundColor: newBlackoutDate ? "#27272a" : "#1c1c1f",
                        color: newBlackoutDate ? "#fafafa" : "#52525b",
                        border: "1px solid #27272a",
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
                      <span style={{ fontSize: "0.6875rem", color: "#52525b", fontStyle: "italic" }}>
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
                            backgroundColor: "#18181b",
                            border: "1px solid #27272a",
                            padding: "4px 8px 4px 10px",
                            borderRadius: "6px",
                            fontSize: "0.75rem",
                            fontWeight: "500",
                            color: "#e4e4e7",
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
                              color: "#71717a",
                              cursor: "pointer",
                              padding: "2px",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              borderRadius: "4px",
                              transition: "color 0.15s ease",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = "#ef4444")}
                            onMouseLeave={(e) => (e.currentTarget.style.color = "#71717a")}
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
                backgroundColor: "#121215",
                border: "1px solid #1f1f23",
                borderRadius: "12px",
                padding: "18px",
                boxShadow: "inset 0 1px 0 0 rgba(255,255,255,0.03)",
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
                  <span style={{ fontSize: "0.875rem", fontWeight: "600", color: "#fafafa" }}>
                    Product Tag Overrides
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span
                    style={{
                      fontSize: "0.6875rem",
                      fontWeight: "500",
                      color: tagRules.length > 0 ? "#10b981" : "#71717a",
                      backgroundColor: tagRules.length > 0 ? "rgba(16, 185, 129, 0.1)" : "#18181b",
                      border: "1px solid",
                      borderColor: tagRules.length > 0 ? "rgba(16, 185, 129, 0.25)" : "#27272a",
                      padding: "2px 8px",
                      borderRadius: "9999px",
                    }}
                  >
                    {tagRules.length} {tagRules.length === 1 ? "Rule" : "Rules"}
                  </span>
                  <span style={{ color: "#71717a" }}>
                    <ChevronDownIcon open={isTagRulesOpen} />
                  </span>
                </div>
              </div>

              {isTagRulesOpen && (
                <div style={{ marginTop: "14px", display: "flex", flexDirection: "column", gap: "12px" }}>
                  <p style={{ margin: 0, fontSize: "0.75rem", color: "#a1a1aa", lineHeight: "1.4" }}>
                    Map Shopify product tags (e.g. <code>pre-order</code>, <code>custom-engraved</code>, <code>freight</code>) to custom transit lead times.
                  </p>

                  {/* Rules List Table */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {tagRules.length === 0 ? (
                      <span style={{ fontSize: "0.6875rem", color: "#52525b", fontStyle: "italic" }}>
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
                            backgroundColor: "#18181b",
                            border: "1px solid #27272a",
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
                                backgroundColor: "#27272a",
                                border: "1px solid #3f3f46",
                                borderRadius: "6px",
                                padding: "6px 8px",
                                fontSize: "0.75rem",
                                color: "#fafafa",
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
                                backgroundColor: "#27272a",
                                border: "1px solid #3f3f46",
                                borderRadius: "6px",
                                padding: "6px 8px",
                                fontSize: "0.75rem",
                                color: "#fafafa",
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
                              border: "1px solid #27272a",
                              backgroundColor: "transparent",
                              color: "#71717a",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                              transition: "all 0.15s ease",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.color = "#ef4444";
                              e.currentTarget.style.borderColor = "#7f1d1d";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.color = "#71717a";
                              e.currentTarget.style.borderColor = "#27272a";
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
                      backgroundColor: "#18181b",
                      border: "1px dashed #27272a",
                      borderRadius: "8px",
                      color: "#a1a1aa",
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
                      e.currentTarget.style.borderColor = "#3f3f46";
                      e.currentTarget.style.color = "#fafafa";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "#27272a";
                      e.currentTarget.style.color = "#a1a1aa";
                    }}
                  >
                    <PlusIcon />
                    <span>+ Add Tag Rule</span>
                  </button>
                </div>
              )}
            </div>

            {/* 6. Storefront Text & Translations Accordion Card */}
            <div
              style={{
                backgroundColor: "#121215",
                border: "1px solid #1f1f23",
                borderRadius: "12px",
                padding: "18px",
                boxShadow: "inset 0 1px 0 0 rgba(255,255,255,0.03)",
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
                  <span style={{ fontSize: "0.875rem", fontWeight: "600", color: "#fafafa" }}>
                    Storefront Text &amp; Translations
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span
                    style={{
                      fontSize: "0.6875rem",
                      fontWeight: "500",
                      color: "#10b981",
                      backgroundColor: "rgba(16, 185, 129, 0.1)",
                      border: "1px solid rgba(16, 185, 129, 0.25)",
                      padding: "2px 8px",
                      borderRadius: "9999px",
                    }}
                  >
                    4 Tokens
                  </span>
                  <span style={{ color: "#71717a" }}>
                    <ChevronDownIcon open={isTranslationsOpen} />
                  </span>
                </div>
              </div>

              {isTranslationsOpen && (
                <div style={{ marginTop: "14px", display: "flex", flexDirection: "column", gap: "14px" }}>
                  <p style={{ margin: 0, fontSize: "0.75rem", color: "#a1a1aa", lineHeight: "1.4" }}>
                    Customize storefront labels and translation strings for international customers. Updates reflect instantly in live preview and Liquid server paint.
                  </p>

                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {/* Token 1: Cutoff Lead Text */}
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                        <label style={{ fontSize: "0.75rem", fontWeight: "500", color: "#fafafa" }}>
                          Cutoff Lead Text
                        </label>
                        <span style={{ fontSize: "0.6875rem", color: "#71717a" }}>Default: "Order within"</span>
                      </div>
                      <input
                        type="text"
                        value={leadText}
                        onChange={(e) => setLeadText(e.target.value)}
                        placeholder="Order within"
                        style={{
                          width: "100%",
                          backgroundColor: "#18181b",
                          border: "1px solid #27272a",
                          borderRadius: "8px",
                          padding: "8px 12px",
                          fontSize: "0.8125rem",
                          color: "#fafafa",
                          outline: "none",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>

                    {/* Token 2: Same-Day Dispatch Label */}
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                        <label style={{ fontSize: "0.75rem", fontWeight: "500", color: "#fafafa" }}>
                          Same-Day Dispatch Label
                        </label>
                        <span style={{ fontSize: "0.6875rem", color: "#71717a" }}>Default: "for same-day dispatch"</span>
                      </div>
                      <input
                        type="text"
                        value={sameDayText}
                        onChange={(e) => setSameDayText(e.target.value)}
                        placeholder="for same-day dispatch"
                        style={{
                          width: "100%",
                          backgroundColor: "#18181b",
                          border: "1px solid #27272a",
                          borderRadius: "8px",
                          padding: "8px 12px",
                          fontSize: "0.8125rem",
                          color: "#fafafa",
                          outline: "none",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>

                    {/* Token 3: Next-Day Dispatch Label */}
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                        <label style={{ fontSize: "0.75rem", fontWeight: "500", color: "#fafafa" }}>
                          Next-Day Dispatch Label
                        </label>
                        <span style={{ fontSize: "0.6875rem", color: "#71717a" }}>Default: "for tomorrow's dispatch"</span>
                      </div>
                      <input
                        type="text"
                        value={nextDayText}
                        onChange={(e) => setNextDayText(e.target.value)}
                        placeholder="for tomorrow's dispatch"
                        style={{
                          width: "100%",
                          backgroundColor: "#18181b",
                          border: "1px solid #27272a",
                          borderRadius: "8px",
                          padding: "8px 12px",
                          fontSize: "0.8125rem",
                          color: "#fafafa",
                          outline: "none",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>

                    {/* Token 4: Delivery ETA Label */}
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                        <label style={{ fontSize: "0.75rem", fontWeight: "500", color: "#fafafa" }}>
                          Delivery ETA Label
                        </label>
                        <span style={{ fontSize: "0.6875rem", color: "#71717a" }}>Default: "Estimated Delivery:"</span>
                      </div>
                      <input
                        type="text"
                        value={etaText}
                        onChange={(e) => setEtaText(e.target.value)}
                        placeholder="Estimated Delivery:"
                        style={{
                          width: "100%",
                          backgroundColor: "#18181b",
                          border: "1px solid #27272a",
                          borderRadius: "8px",
                          padding: "8px 12px",
                          fontSize: "0.8125rem",
                          color: "#fafafa",
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
                          color: "#71717a",
                          fontSize: "0.6875rem",
                          cursor: "pointer",
                          textDecoration: "underline",
                          padding: "2px 4px",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "#fafafa")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "#71717a")}
                      >
                        Reset to English Defaults
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 7. Brand Alignment & Functional Color Swatches */}
            <div
              style={{
                backgroundColor: "#121215",
                border: "1px solid #1f1f23",
                borderRadius: "12px",
                padding: "18px",
                boxShadow: "inset 0 1px 0 0 rgba(255,255,255,0.03)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                <SparklesIcon />
                <span style={{ fontSize: "0.875rem", fontWeight: "600", color: "#fafafa" }}>
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
                        border: active ? "1px solid #10b981" : "1px solid #27272a",
                        backgroundColor: active ? "rgba(16, 185, 129, 0.08)" : "#18181b",
                        color: active ? "#fafafa" : "#a1a1aa",
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
                          border: "1px solid rgba(255,255,255,0.2)",
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
                      backgroundColor: "#18181b",
                      border: "1px solid #27272a",
                      borderRadius: "8px",
                      padding: "6px 12px",
                    }}
                  >
                    <span style={{ fontSize: "0.8125rem", color: "#a1a1aa" }}>{label}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <input
                        type="text"
                        value={val}
                        onChange={(e) => setVal(e.target.value)}
                        style={{
                          width: "78px",
                          backgroundColor: "#27272a",
                          border: "1px solid #3f3f46",
                          borderRadius: "6px",
                          padding: "4px 8px",
                          fontSize: "0.75rem",
                          fontFamily: "monospace",
                          color: "#fafafa",
                          textTransform: "uppercase",
                        }}
                      />
                      <label
                        style={{
                          width: "20px",
                          height: "20px",
                          borderRadius: "50%",
                          backgroundColor: val,
                          border: "2px solid #52525b",
                          cursor: "pointer",
                          display: "inline-block",
                          position: "relative",
                          overflow: "hidden",
                          boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
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

            {/* 3. DOCKED BOTTOM ACTION BAR (CLEAN, NO OVERLAPPING) */}
            <div
              style={{
                position: "sticky",
                bottom: 0,
                backgroundColor: "#09090b",
                borderTop: "1px solid #1f1f23",
                paddingTop: "14px",
                paddingBottom: "8px",
                marginTop: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: "0.8125rem", fontWeight: "600", color: "#fafafa" }}>
                  {hasSaved ? "Settings Saved" : isDirty ? "Unsaved Changes" : "Settings Synced"}
                </span>
                <span style={{ fontSize: "0.6875rem", color: hasSaved ? "#34d399" : isDirty ? "#34d399" : "#71717a" }}>
                  {hasSaved
                    ? "Settings saved successfully"
                    : isDirty
                    ? isStandalone
                      ? "Ready to test in sandbox"
                      : "Staged in Shopify Admin SaveBar"
                    : "Active on Shopify Edge CDN"}
                </span>
              </div>

              {isStandalone ? (
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  {isDirty && (
                    <button
                      type="button"
                      onClick={handleDiscard}
                      disabled={isSaving}
                      style={{
                        backgroundColor: "transparent",
                        color: "#a1a1aa",
                        border: "1px solid #27272a",
                        borderRadius: "6px",
                        padding: "7px 12px",
                        fontSize: "0.75rem",
                        fontWeight: "500",
                        cursor: "pointer",
                      }}
                    >
                      Discard
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={(!isDirty && !hasSaved) || isSaving}
                    style={{
                      backgroundColor: hasSaved ? "#059669" : isDirty ? "#10b981" : "#27272a",
                      color: isDirty || hasSaved ? "#09090b" : "#71717a",
                      border: "none",
                      borderRadius: "6px",
                      padding: "7px 16px",
                      fontSize: "0.75rem",
                      fontWeight: "600",
                      cursor: (isDirty || hasSaved) && !isSaving ? "pointer" : "not-allowed",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      transition: "all 0.15s ease",
                    }}
                  >
                    {isSaving ? (
                      "Saving..."
                    ) : hasSaved ? (
                      <>
                        <CheckIcon />
                        <span>Settings Saved</span>
                      </>
                    ) : (
                      <>
                        <CheckIcon />
                        <span>Save Settings</span>
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span
                    style={{
                      fontSize: "0.6875rem",
                      color: isDirty ? "#10b981" : "#71717a",
                      backgroundColor: isDirty ? "rgba(16, 185, 129, 0.1)" : "#18181b",
                      border: `1px solid ${isDirty ? "rgba(16, 185, 129, 0.25)" : "#27272a"}`,
                      padding: "4px 10px",
                      borderRadius: "6px",
                      fontWeight: "500",
                    }}
                  >
                    {isDirty ? "● SaveBar Active Above" : "✓ Edge Metastore Synchronized"}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT PANE: Realistic DTC Storefront Canvas */}
          <div
            style={{
              position: "sticky",
              top: "24px",
              backgroundColor: "#121215",
              border: "1px solid #1f1f23",
              borderRadius: "16px",
              overflow: "hidden",
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.5)",
            }}
          >
            {/* Top Window Chrome with Two-Way Device Viewport Toggle */}
            <div
              style={{
                backgroundColor: "#18181b",
                borderBottom: "1px solid #27272a",
                padding: "10px 16px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "10px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ width: "9px", height: "9px", borderRadius: "50%", backgroundColor: "#ef4444" }} />
                <span style={{ width: "9px", height: "9px", borderRadius: "50%", backgroundColor: "#eab308" }} />
                <span style={{ width: "9px", height: "9px", borderRadius: "50%", backgroundColor: "#22c55e" }} />
                <span
                  style={{
                    marginLeft: "12px",
                    fontSize: "0.6875rem",
                    color: "#71717a",
                    fontFamily: "monospace",
                  }}
                >
                  yourstore.com/products/classic-boxy-crewneck
                </span>
              </div>

              {/* Device Viewport Toggle */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "2px",
                  backgroundColor: "#27272a",
                  padding: "2px",
                  borderRadius: "6px",
                }}
              >
                <button
                  type="button"
                  onClick={() => setViewportMode("desktop")}
                  style={{
                    padding: "3px 8px",
                    borderRadius: "4px",
                    border: "none",
                    fontSize: "0.6875rem",
                    fontWeight: "500",
                    cursor: "pointer",
                    backgroundColor: viewportMode === "desktop" ? "#3f3f46" : "transparent",
                    color: viewportMode === "desktop" ? "#fafafa" : "#a1a1aa",
                    transition: "all 0.15s ease",
                  }}
                >
                  Desktop
                </button>
                <button
                  type="button"
                  onClick={() => setViewportMode("mobile")}
                  style={{
                    padding: "3px 8px",
                    borderRadius: "4px",
                    border: "none",
                    fontSize: "0.6875rem",
                    fontWeight: "500",
                    cursor: "pointer",
                    backgroundColor: viewportMode === "mobile" ? "#3f3f46" : "transparent",
                    color: viewportMode === "mobile" ? "#fafafa" : "#a1a1aa",
                    transition: "all 0.15s ease",
                  }}
                >
                  Mobile (375px)
                </button>
              </div>
            </div>

            {/* Canvas Surface with Refined Dot Grid */}
            <div
              style={{
                padding: "32px 24px",
                backgroundImage: "radial-gradient(#27272a 1px, transparent 1px)",
                backgroundSize: "16px 16px",
                backgroundColor: "#09090b",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {/* Authentic Shopify Dawn Product Card Mock */}
              <div
                className={`transition-all duration-300 ease-in-out mx-auto ${
                  viewportMode === "mobile" ? "max-w-[375px]" : "max-w-xl"
                }`}
                style={{
                  maxWidth: viewportMode === "mobile" ? "375px" : "576px",
                  width: "100%",
                  backgroundColor: "#ffffff",
                  color: "#18181b",
                  borderRadius: "14px",
                  padding: "24px",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  transition: "max-width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  margin: "0 auto",
                }}
              >
                {/* Stock State Quick Switcher */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "14px",
                    paddingBottom: "10px",
                    borderBottom: "1px solid #f1f5f9",
                  }}
                >
                  <span style={{ fontSize: "0.75rem", fontWeight: "600", color: "#64748b" }}>
                    Stock Simulation:
                  </span>
                  <div
                    style={{
                      display: "flex",
                      backgroundColor: "#f1f5f9",
                      padding: "3px",
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setMockStockState("in_stock");
                        if (selectedSize === "L") setSelectedSize("M");
                      }}
                      style={{
                        padding: "4px 10px",
                        borderRadius: "6px",
                        border: "none",
                        fontSize: "0.6875rem",
                        fontWeight: "600",
                        cursor: "pointer",
                        backgroundColor: mockStockState === "in_stock" ? "#ffffff" : "transparent",
                        color: mockStockState === "in_stock" ? "#0f172a" : "#64748b",
                        boxShadow: mockStockState === "in_stock" ? "0 1px 2px rgba(0,0,0,0.06)" : "none",
                        transition: "all 0.15s ease",
                      }}
                    >
                      In Stock
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMockStockState("backorder");
                        setSelectedSize("L");
                      }}
                      style={{
                        padding: "4px 10px",
                        borderRadius: "6px",
                        border: "none",
                        fontSize: "0.6875rem",
                        fontWeight: "600",
                        cursor: "pointer",
                        backgroundColor: mockStockState === "backorder" ? "#ffffff" : "transparent",
                        color: mockStockState === "backorder" ? "#b45309" : "#64748b",
                        boxShadow: mockStockState === "backorder" ? "0 1px 2px rgba(0,0,0,0.06)" : "none",
                        transition: "all 0.15s ease",
                      }}
                    >
                      Sold Out / Backorder
                    </button>
                  </div>
                </div>

                {/* PRODUCT IMAGE CONTAINER - NO EXTERNAL URLS ALLOWED */}
                <div
                  className="relative w-full aspect-[4/3] bg-zinc-100 rounded-xl overflow-hidden border border-zinc-200/80 flex items-center justify-center p-6 select-none"
                  style={{
                    position: "relative",
                    width: "100%",
                    aspectRatio: "4 / 3",
                    backgroundColor: "#f4f4f5",
                    borderRadius: "12px",
                    overflow: "hidden",
                    border: "1px solid rgba(228, 228, 231, 0.8)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "24px",
                    userSelect: "none",
                    marginBottom: "16px",
                  }}
                >
                  <svg 
                    viewBox="0 0 120 120" 
                    className="w-32 h-32 text-zinc-800 drop-shadow-sm transition-transform duration-300 hover:scale-105"
                    fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{
                      width: "128px",
                      height: "128px",
                      color: "#27272a",
                      filter: "drop-shadow(0 1px 2px rgba(0, 0, 0, 0.08))",
                      transition: "transform 300ms ease",
                    }}
                  >
                    {/* Clean Streetwear Boxy T-Shirt Vector */}
                    <path d="M 40 16 C 45 24 75 24 80 16 L 104 28 L 92 46 L 82 40 L 82 100 C 82 102 80 104 78 104 L 42 104 C 40 104 38 102 38 100 L 38 40 L 28 46 L 16 28 Z" />
                    {/* Subtle Neck Collar Highlight */}
                    <path d="M 40 16 C 46 25 74 25 80 16 C 74 21 46 21 40 16 Z" fill="rgba(255,255,255,0.25)" />
                  </svg>
                  
                  <span
                    className="absolute bottom-2.5 right-2.5 text-[10px] font-mono tracking-wider uppercase text-zinc-500 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded border border-zinc-200 shadow-xs"
                    style={{
                      position: "absolute",
                      bottom: "10px",
                      right: "10px",
                      fontSize: "10px",
                      fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                      letterSpacing: "0.05em",
                      textTransform: "uppercase",
                      color: "#71717a",
                      backgroundColor: "rgba(255, 255, 255, 0.9)",
                      backdropFilter: "blur(4px)",
                      WebkitBackdropFilter: "blur(4px)",
                      padding: "2px 8px",
                      borderRadius: "4px",
                      border: "1px solid #e4e4e7",
                      boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                    }}
                  >
                    Heavyweight 280 GSM
                  </span>
                </div>

                {/* Stock Status & Title */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
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
                  className="text-base font-semibold tracking-tight text-zinc-900"
                  style={{
                    fontSize: "1rem",
                    fontWeight: "600",
                    margin: "0 0 6px 0",
                    color: "#18181b",
                    letterSpacing: "-0.025em",
                  }}
                >
                  Classic Boxy Crewneck
                </h2>

                <div
                  style={{
                    fontSize: "1.125rem",
                    fontWeight: "700",
                    color: "#09090b",
                    marginBottom: "14px",
                  }}
                >
                  $42.00
                </div>

                {/* Shopify Dawn Variant Selector */}
                <div style={{ marginBottom: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <span style={{ fontSize: "0.75rem", fontWeight: "600", color: "#3f3f46", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                      Size: <span style={{ color: "#09090b" }}>{selectedSize}</span>
                    </span>
                    <span style={{ fontSize: "0.6875rem", color: "#71717a", textDecoration: "underline", cursor: "pointer" }}>
                      Size Guide
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
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
                            padding: "8px 4px",
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
                    padding: "8px 10px",
                    marginBottom: "14px",
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

                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    <button
                      type="button"
                      onClick={() => setActiveSimulatedTag("none")}
                      style={{
                        padding: "3px 8px",
                        borderRadius: "6px",
                        border: activeSimulatedTag === "none" ? "1.5px solid #0f172a" : "1px solid #cbd5e1",
                        backgroundColor: activeSimulatedTag === "none" ? "#0f172a" : "#ffffff",
                        color: activeSimulatedTag === "none" ? "#ffffff" : "#475569",
                        fontSize: "0.6875rem",
                        fontWeight: "600",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}
                    >
                      Tag: none
                    </button>

                    {tagRules
                      .filter((r) => r.tag && r.tag.trim().length > 0)
                      .map((rule) => {
                        const isSelected = activeSimulatedTag.toLowerCase() === rule.tag.trim().toLowerCase();
                        return (
                          <button
                            key={rule.tag}
                            type="button"
                            onClick={() => setActiveSimulatedTag(rule.tag.trim())}
                            style={{
                              padding: "3px 8px",
                              borderRadius: "6px",
                              border: isSelected ? "1.5px solid #008060" : "1px solid #cbd5e1",
                              backgroundColor: isSelected ? "#008060" : "#ffffff",
                              color: isSelected ? "#ffffff" : "#334155",
                              fontSize: "0.6875rem",
                              fontWeight: "600",
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "3px",
                              transition: "all 0.15s ease",
                              boxShadow: isSelected ? "0 1px 2px rgba(0,128,96,0.2)" : "none",
                            }}
                          >
                            <span>Tag: {rule.tag.trim()}</span>
                            <span style={{ opacity: 0.85, fontSize: "0.625rem" }}>
                              (+{rule.leadDays}d)
                            </span>
                          </button>
                        );
                      })}
                  </div>
                </div>

                {/* 4. THE LIVE DYNAMIC DROPCLOCK WIDGET (POLISHED TYPOGRAPHY) */}
                {mockStockState === "backorder" ? (
                  /* Gentle Backorder Notice Pill */
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
                        {/* Natural Inline Flow */}
                        <div
                          style={{
                            fontSize: "0.8125rem",
                            lineHeight: "1.4",
                            color: textColor,
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
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
                            </span>{" "}
                            {preview.isPastCutoff ? nextDayText : sameDayText}
                          </span>
                        </div>

                        {/* Estimated Delivery with Clean Alignment */}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            fontSize: "0.75rem",
                            color: textColor,
                            opacity: 0.88,
                            paddingLeft: "12px",
                          }}
                        >
                          <span style={{ color: primaryColor, display: "inline-flex", flexShrink: 0 }}>
                            <TruckIcon />
                          </span>
                          <span>
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
            </div>
          </div>
        </div>
      </div>
    </Page>
  );
}
