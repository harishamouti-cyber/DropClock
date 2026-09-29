import { useState, useMemo, useEffect } from "react";
import { useSubmit, useNavigation } from "@remix-run/react";
import { Page } from "@shopify/polaris";
import { SaveBar } from "@shopify/app-bridge-react";

export interface StudioSettings {
  id?: string;
  shop: string;
  cutoffHour: number;
  cutoffMinute: number;
  leadDays: number;
  workingDays: string;
  presetStyle: string;
  primaryColor: string;
  bgColor: string;
  textColor: string;
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
}

// Crisp 15px Monochrome Lucide Icons with 1.75 stroke-width
const ClockIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const TruckIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
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
}: DropClockStudioProps) {
  const submit = useSubmit();
  const navigation = useNavigation();

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

  // Form State
  const [cutoffHour, setCutoffHour] = useState(settings.cutoffHour);
  const [cutoffMinute, setCutoffMinute] = useState(settings.cutoffMinute);
  const [leadDays, setLeadDays] = useState(settings.leadDays);
  const [presetStyle, setPresetStyle] = useState(settings.presetStyle || "capsule");
  const [primaryColor, setPrimaryColor] = useState(settings.primaryColor || "#008060");
  const [bgColor, setBgColor] = useState(settings.bgColor || "#F4F6F8");
  const [textColor, setTextColor] = useState(settings.textColor || "#202223");
  const [workingDays, setWorkingDays] = useState<number[]>(() => {
    try {
      return JSON.parse(settings.workingDays || "[1,2,3,4,5]");
    } catch {
      return [1, 2, 3, 4, 5];
    }
  });

  // Calculate Form Dirty State for App Bridge SaveBar
  const isDirty = useMemo(() => {
    return (
      cutoffHour !== settings.cutoffHour ||
      cutoffMinute !== settings.cutoffMinute ||
      leadDays !== settings.leadDays ||
      presetStyle !== settings.presetStyle ||
      primaryColor.toLowerCase() !== (settings.primaryColor || "").toLowerCase() ||
      bgColor.toLowerCase() !== (settings.bgColor || "").toLowerCase() ||
      textColor.toLowerCase() !== (settings.textColor || "").toLowerCase() ||
      JSON.stringify(workingDays) !== settings.workingDays
    );
  }, [cutoffHour, cutoffMinute, leadDays, presetStyle, primaryColor, bgColor, textColor, workingDays, settings]);

  const handleDiscard = () => {
    setCutoffHour(settings.cutoffHour);
    setCutoffMinute(settings.cutoffMinute);
    setLeadDays(settings.leadDays);
    setPresetStyle(settings.presetStyle || "capsule");
    setPrimaryColor(settings.primaryColor || "#008060");
    setBgColor(settings.bgColor || "#F4F6F8");
    setTextColor(settings.textColor || "#202223");
    try {
      setWorkingDays(JSON.parse(settings.workingDays || "[1,2,3,4,5]"));
    } catch {
      setWorkingDays([1, 2, 3, 4, 5]);
    }
    safeHideSaveBar();
  };

  const handleSave = () => {
    const formData = new FormData();
    formData.append("cutoffHour", cutoffHour.toString());
    formData.append("cutoffMinute", cutoffMinute.toString());
    formData.append("leadDays", leadDays.toString());
    formData.append("presetStyle", presetStyle);
    formData.append("primaryColor", primaryColor);
    formData.append("bgColor", bgColor);
    formData.append("textColor", textColor);
    formData.append("workingDays", JSON.stringify(workingDays));
    submit(formData, { method: "post" });
    safeHideSaveBar();
  };

  const toggleDay = (day: number) => {
    setWorkingDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day).sort() : [...prev, day].sort()
    );
  };

  // Real-Time Countdown Calculations with Warehouse Timezone
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const preview = useMemo(() => {
    const warehouseUtcOffsetMs = (timezoneOffsetMinutes || 0) * 60 * 1000;
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

    // Calculate Delivery Arrival Date
    let delivery = new Date(warehouseNow);
    if (isPastCutoff) {
      delivery.setDate(delivery.getDate() + 1);
    }
    let transitLeft = leadDays;
    while (transitLeft > 0 || !workingDays.includes(delivery.getDay())) {
      delivery.setDate(delivery.getDate() + 1);
      if (workingDays.includes(delivery.getDay())) {
        transitLeft--;
      }
    }

    const options: Intl.DateTimeFormatOptions = { weekday: "short", month: "short", day: "numeric" };
    const formattedArrival = delivery.toLocaleDateString("en-US", options);

    return {
      hours,
      minutes,
      seconds,
      isPastCutoff,
      formattedArrival,
    };
  }, [now, cutoffHour, cutoffMinute, leadDays, workingDays, timezoneOffsetMinutes]);

  const timezoneLabel = useMemo(() => {
    const hours = Math.floor(Math.abs(timezoneOffsetMinutes) / 60);
    const sign = timezoneOffsetMinutes >= 0 ? "+" : "-";
    return `${ianaTimezone} (UTC${sign}${hours})`;
  }, [ianaTimezone, timezoneOffsetMinutes]);

  return (
    <Page fullWidth>
      {/* App Bridge Native SaveBar (strictly guarded for embedded Shopify Admin iframe) */}
      {!isStandalone && isEmbedded && (
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
      )}

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
        {/* Top Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingBottom: "18px",
            borderBottom: "1px solid #1f1f23",
            marginBottom: "24px",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <h1
                style={{
                  fontSize: "1.25rem",
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
                  color: isStandalone ? "#a1a1aa" : "#10b981",
                  backgroundColor: isStandalone ? "rgba(161, 161, 170, 0.1)" : "rgba(16, 185, 129, 0.1)",
                  border: isStandalone ? "1px solid rgba(161, 161, 170, 0.2)" : "1px solid rgba(16, 185, 129, 0.2)",
                  padding: "2px 8px",
                  borderRadius: "9999px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <span
                  style={{
                    width: "5px",
                    height: "5px",
                    borderRadius: "50%",
                    backgroundColor: isStandalone ? "#a1a1aa" : "#10b981",
                  }}
                />
                {isStandalone ? "Sandbox Preview Mode" : "Shopify Edge CDN Active"}
              </span>
            </div>
            <p style={{ fontSize: "0.8125rem", color: "#71717a", margin: "4px 0 0 0" }}>
              {isStandalone
                ? "Interactive sandbox environment. Changes simulate live storefront countdown arithmetic."
                : "Live shipping cutoff arithmetic and real-time storefront capsule preview."}
            </p>
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
                  borderRadius: "8px",
                  padding: "8px 14px",
                  fontSize: "0.8125rem",
                  fontWeight: "500",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  transition: "all 0.15s ease",
                }}
              >
                Reset Changes
              </button>
            )}
            {!isStandalone && (
              <a
                href={`https://${shop}/admin/themes/current/editor?context=apps&template=product&addAppBlockId=dropclock-extension/dropclock_pill`}
                target="_blank"
                rel="noreferrer"
                style={{
                  backgroundColor: "#18181b",
                  color: "#fafafa",
                  border: "1px solid #27272a",
                  borderRadius: "8px",
                  padding: "8px 14px",
                  fontSize: "0.8125rem",
                  fontWeight: "500",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  boxShadow: "inset 0 1px 0 0 rgba(255,255,255,0.05)",
                }}
              >
                Theme Customizer ↗
              </a>
            )}
          </div>
        </div>

        {/* 21st.dev Split-Pane Studio Layout */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(340px, 440px) 1fr",
            gap: "28px",
            alignItems: "start",
          }}
        >
          {/* LEFT PANE: Precision Parameter Controls */}
          <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
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
                  {timezoneLabel} • Syncs with Settings
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

            {/* 2. Lead Time Selector */}
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
                  marginBottom: leadDays > 2 ? "12px" : "0",
                }}
              >
                {[
                  { label: "Same Day", val: 0 },
                  { label: "1 Day", val: 1 },
                  { label: "2 Days", val: 2 },
                  { label: "Custom", val: leadDays > 2 ? leadDays : 3 },
                ].map((item) => {
                  const isCustom = item.label === "Custom";
                  const active = isCustom ? leadDays > 2 : leadDays === item.val;
                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => setLeadDays(item.val)}
                      style={{
                        padding: "7px 4px",
                        borderRadius: "6px",
                        border: "none",
                        backgroundColor: active ? "#27272a" : "transparent",
                        color: active ? "#fafafa" : "#71717a",
                        fontSize: "0.75rem",
                        fontWeight: "600",
                        cursor: "pointer",
                      }}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>

              {leadDays > 2 && (
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "10px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <button
                      type="button"
                      onClick={() => setLeadDays((d) => Math.max(0, d - 1))}
                      style={{
                        width: "28px",
                        height: "28px",
                        borderRadius: "6px",
                        border: "1px solid #27272a",
                        backgroundColor: "#18181b",
                        color: "#fafafa",
                        cursor: "pointer",
                      }}
                    >
                      -
                    </button>
                    <span
                      style={{
                        width: "36px",
                        textAlign: "center",
                        fontWeight: "600",
                        fontFamily: "monospace",
                        color: "#fafafa",
                      }}
                    >
                      {leadDays}
                    </span>
                    <button
                      type="button"
                      onClick={() => setLeadDays((d) => d + 1)}
                      style={{
                        width: "28px",
                        height: "28px",
                        borderRadius: "6px",
                        border: "1px solid #27272a",
                        backgroundColor: "#18181b",
                        color: "#fafafa",
                        cursor: "pointer",
                      }}
                    >
                      +
                    </button>
                  </div>
                  <span style={{ fontSize: "0.8125rem", color: "#71717a" }}>
                    Business days transit lead time
                  </span>
                </div>
              )}
            </div>

            {/* 3. Operating Days */}
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

            {/* 4. Color Tokens & Brand Presets */}
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

              {/* Swatch Pickers with Circular Preview */}
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
                      <span
                        style={{
                          fontSize: "0.75rem",
                          fontFamily: "monospace",
                          color: "#fafafa",
                          textTransform: "uppercase",
                        }}
                      >
                        {val}
                      </span>
                      <label
                        style={{
                          width: "22px",
                          height: "22px",
                          borderRadius: "50%",
                          backgroundColor: val,
                          border: "2px solid #3f3f46",
                          cursor: "pointer",
                          display: "inline-block",
                          position: "relative",
                          overflow: "hidden",
                        }}
                      >
                        <input
                          type="color"
                          value={val}
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
            {/* Top Window Chrome */}
            <div
              style={{
                backgroundColor: "#18181b",
                borderBottom: "1px solid #27272a",
                padding: "10px 16px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
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
                  yourstore.com/products/minimalist-heavyweight-tee
                </span>
              </div>
            </div>

            {/* Canvas Surface with Refined Dot Grid */}
            <div
              style={{
                padding: "36px 24px",
                backgroundImage: "radial-gradient(#27272a 1px, transparent 1px)",
                backgroundSize: "16px 16px",
                backgroundColor: "#09090b",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {/* Authentic DTC Product Card */}
              <div
                style={{
                  maxWidth: "420px",
                  width: "100%",
                  backgroundColor: "#ffffff",
                  color: "#18181b",
                  borderRadius: "14px",
                  padding: "24px",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                {/* Mock Apparel Image Frame */}
                <div
                  style={{
                    width: "100%",
                    height: "180px",
                    backgroundColor: "#f4f4f5",
                    borderRadius: "10px",
                    marginBottom: "18px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#a1a1aa",
                  }}
                >
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25">
                    <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z" />
                  </svg>
                </div>

                {/* Stock Status & Title */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                  <span style={{ fontSize: "0.6875rem", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.06em", color: "#008060" }}>
                    ● In Stock · Ships Promptly
                  </span>
                  <span style={{ fontSize: "0.75rem", color: "#71717a" }}>SKU: DC-101</span>
                </div>

                <h3
                  style={{
                    fontSize: "1.125rem",
                    fontWeight: "700",
                    margin: "0 0 6px 0",
                    color: "#09090b",
                    letterSpacing: "-0.02em",
                  }}
                >
                  Minimalist Heavyweight Tee
                </h3>

                <div
                  style={{
                    fontSize: "1.125rem",
                    fontWeight: "700",
                    color: "#09090b",
                    marginBottom: "16px",
                  }}
                >
                  $42.00
                </div>

                {/* THE LIVE DYNAMIC DROCLOCK CAPSULE IN SITU */}
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
                  {/* Top Line: Real-time Cutoff Countdown */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      fontSize: "0.8125rem",
                      fontWeight: "600",
                      lineHeight: "1.3",
                    }}
                  >
                    <span
                      style={{
                        width: "6px",
                        height: "6px",
                        borderRadius: "50%",
                        backgroundColor: primaryColor,
                        display: "inline-block",
                      }}
                    />
                    <span>Order in next</span>
                    <span
                      style={{
                        color: primaryColor,
                        fontFamily: "monospace",
                        fontWeight: "700",
                      }}
                    >
                      {preview.hours}h {preview.minutes}m {preview.seconds}s
                    </span>
                    <span>for {preview.isPastCutoff ? "tomorrow's" : "today's"} dispatch</span>
                  </div>

                  {/* Bottom Line: Estimated Delivery ETA (Single line, fixed baseline) */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "baseline",
                      gap: "6px",
                      fontSize: "0.75rem",
                      opacity: 0.85,
                      whiteSpace: "nowrap",
                    }}
                  >
                    <span style={{ color: primaryColor, display: "inline-flex", transform: "translateY(2px)" }}>
                      <TruckIcon />
                    </span>
                    <span>
                      Estimated Delivery: <strong style={{ color: textColor }}>{preview.formattedArrival}</strong>
                    </span>
                  </div>
                </div>

                {/* Mock Add to Cart Button */}
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
                  Add to Cart
                </button>
              </div>
            </div>

            {/* Merchant-Centric Performance Footer */}
            <div
              style={{
                backgroundColor: "#18181b",
                borderTop: "1px solid #27272a",
                padding: "12px 18px",
                display: "flex",
                justifyContent: "space-around",
                alignItems: "center",
                fontSize: "0.75rem",
                color: "#a1a1aa",
                fontWeight: "500",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ color: "#10b981" }}>⚡</span>
                <span>0ms Storefront Drag</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ color: "#10b981" }}>✓</span>
                <span>Native CDN Delivery</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ color: "#10b981" }}>✓</span>
                <span>Lighthouse Score: 100/100</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Page>
  );
}
