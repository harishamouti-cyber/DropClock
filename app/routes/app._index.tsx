import { useState, useMemo, useEffect } from "react";
import { json, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useSubmit, useNavigation, useActionData } from "@remix-run/react";
import { Page, Box, Banner } from "@shopify/polaris";
import { SaveBar } from "@shopify/app-bridge-react";
import { authenticate, DROPCLOCK_PRO_MONTHLY } from "~/shopify.server";
import prisma from "~/db.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const { session, admin, billing } = await authenticate.admin(request);

  await billing.require({
    plans: [DROPCLOCK_PRO_MONTHLY],
    isTest: process.env.NODE_ENV !== "production",
    onFailure: async () =>
      billing.request({
        plan: DROPCLOCK_PRO_MONTHLY,
        isTest: process.env.NODE_ENV !== "production",
      }),
  });

  let settings = await prisma.dropClockSettings.findUnique({
    where: { shop: session.shop },
  });

  if (!settings) {
    settings = await prisma.dropClockSettings.create({
      data: { shop: session.shop },
    });
  }

  const shopQuery = await admin.graphql(`
    query GetShopTimezoneAndId {
      shop {
        id
        ianaTimezone
        timezoneOffsetMinutes
      }
    }
  `);
  const shopResult = await shopQuery.json();
  const shopData = shopResult?.data?.shop || {};
  const ianaTimezone = shopData.ianaTimezone || "UTC";
  const timezoneOffsetMinutes = shopData.timezoneOffsetMinutes ?? 0;

  return json({
    settings,
    shop: session.shop,
    ianaTimezone,
    timezoneOffsetMinutes,
  });
}

export async function action({ request }: ActionFunctionArgs) {
  const { admin, session, billing } = await authenticate.admin(request);

  await billing.require({
    plans: [DROPCLOCK_PRO_MONTHLY],
    isTest: process.env.NODE_ENV !== "production",
    onFailure: async () =>
      billing.request({
        plan: DROPCLOCK_PRO_MONTHLY,
        isTest: process.env.NODE_ENV !== "production",
      }),
  });

  const formData = await request.formData();

  const cutoffHour = parseInt(formData.get("cutoffHour") as string, 10) || 14;
  const cutoffMinute = parseInt(formData.get("cutoffMinute") as string, 10) || 0;
  const leadDays = parseInt(formData.get("leadDays") as string, 10) || 2;
  const primaryColor = (formData.get("primaryColor") as string) || "#10b981";
  const bgColor = (formData.get("bgColor") as string) || "#18181b";
  const textColor = (formData.get("textColor") as string) || "#fafafa";
  const presetStyle = (formData.get("presetStyle") as string) || "capsule";
  const workingDaysRaw = (formData.get("workingDays") as string) || "[1,2,3,4,5]";

  const updated = await prisma.dropClockSettings.upsert({
    where: { shop: session.shop },
    update: {
      cutoffHour,
      cutoffMinute,
      leadDays,
      primaryColor,
      bgColor,
      textColor,
      presetStyle,
      workingDays: workingDaysRaw,
    },
    create: {
      shop: session.shop,
      cutoffHour,
      cutoffMinute,
      leadDays,
      primaryColor,
      bgColor,
      textColor,
      presetStyle,
      workingDays: workingDaysRaw,
    },
  });

  const shopQuery = await admin.graphql(`
    query GetShopTimezoneAndId {
      shop {
        id
        ianaTimezone
        timezoneOffsetMinutes
      }
    }
  `);
  const shopResult = await shopQuery.json();
  const shopGid = shopResult?.data?.shop?.id;
  const ianaTimezone = shopResult?.data?.shop?.ianaTimezone || "UTC";
  const timezoneOffsetMinutes = shopResult?.data?.shop?.timezoneOffsetMinutes ?? 0;

  const metafieldPayload = {
    cutoffHour: updated.cutoffHour,
    cutoffMinute: updated.cutoffMinute,
    leadDays: updated.leadDays,
    timezoneOffsetMinutes,
    ianaTimezone,
    workingDays: JSON.parse(updated.workingDays || "[1,2,3,4,5]"),
    blackoutDates: JSON.parse(updated.blackoutDates || "[]"),
    tagRulesJson: JSON.parse(updated.tagRulesJson || "[]"),
    marketOverrides: JSON.parse(updated.marketOverrides || "{}"),
    presetStyle: updated.presetStyle,
    primaryColor: updated.primaryColor,
    bgColor: updated.bgColor,
    textColor: updated.textColor,
  };

  if (shopGid) {
    await admin.graphql(
      `#graphql
      mutation SetDropClockMetafield($metafields: [MetafieldsSetInput!]!) {
        metafieldsSet(metafields: $metafields) {
          userErrors {
            field
            message
          }
        }
      }`,
      {
        variables: {
          metafields: [
            {
              ownerId: shopGid,
              namespace: "dropclock",
              key: "settings",
              type: "json",
              value: JSON.stringify(metafieldPayload),
            },
          ],
        },
      }
    );
  }

  return json({
    success: true,
    settings: updated,
  });
}

// Crisp Lucide SVG Icons (15px, stroke-width: 1.75)
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

const SlidersIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" y1="21" x2="4" y2="14" />
    <line x1="4" y1="10" x2="4" y2="3" />
    <line x1="12" y1="21" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12" y2="3" />
    <line x1="20" y1="21" x2="20" y2="16" />
    <line x1="20" y1="12" x2="20" y2="3" />
    <line x1="1" y1="14" x2="7" y2="14" />
    <line x1="9" y1="8" x2="15" y2="8" />
    <line x1="17" y1="16" x2="23" y2="16" />
  </svg>
);

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export default function StudioIndex() {
  const { settings, shop, ianaTimezone, timezoneOffsetMinutes } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const submit = useSubmit();
  const navigation = useNavigation();

  // Parameter State
  const [cutoffHour, setCutoffHour] = useState(settings.cutoffHour);
  const [cutoffMinute, setCutoffMinute] = useState(settings.cutoffMinute);
  const [leadDays, setLeadDays] = useState(settings.leadDays);
  const [leadMode, setLeadMode] = useState<"1" | "2" | "3" | "custom">(
    [1, 2, 3].includes(settings.leadDays) ? (String(settings.leadDays) as "1" | "2" | "3") : "custom"
  );
  const [workingDays, setWorkingDays] = useState<number[]>(() => {
    try {
      return JSON.parse(settings.workingDays || "[1,2,3,4,5]");
    } catch {
      return [1, 2, 3, 4, 5];
    }
  });
  const [presetStyle, setPresetStyle] = useState<"capsule" | "border" | "minimal">(
    (settings.presetStyle as "capsule" | "border" | "minimal") || "capsule"
  );
  const [primaryColor, setPrimaryColor] = useState(settings.primaryColor || "#10b981");
  const [bgColor, setBgColor] = useState(settings.bgColor || "#18181b");
  const [textColor, setTextColor] = useState(settings.textColor || "#fafafa");

  // Dirty State Detection for SaveBar
  const isDirty = useMemo(() => {
    return (
      cutoffHour !== settings.cutoffHour ||
      cutoffMinute !== settings.cutoffMinute ||
      leadDays !== settings.leadDays ||
      presetStyle !== settings.presetStyle ||
      primaryColor !== settings.primaryColor ||
      bgColor !== settings.bgColor ||
      textColor !== settings.textColor ||
      JSON.stringify(workingDays) !== settings.workingDays
    );
  }, [cutoffHour, cutoffMinute, leadDays, presetStyle, primaryColor, bgColor, textColor, workingDays, settings]);

  const handleDiscard = () => {
    setCutoffHour(settings.cutoffHour);
    setCutoffMinute(settings.cutoffMinute);
    setLeadDays(settings.leadDays);
    setLeadMode([1, 2, 3].includes(settings.leadDays) ? (String(settings.leadDays) as "1" | "2" | "3") : "custom");
    setPresetStyle((settings.presetStyle as "capsule" | "border" | "minimal") || "capsule");
    setPrimaryColor(settings.primaryColor || "#10b981");
    setBgColor(settings.bgColor || "#18181b");
    setTextColor(settings.textColor || "#fafafa");
    try {
      setWorkingDays(JSON.parse(settings.workingDays || "[1,2,3,4,5]"));
    } catch {
      setWorkingDays([1, 2, 3, 4, 5]);
    }
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
  };

  const toggleDay = (day: number) => {
    setWorkingDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()
    );
  };

  // Real-Time Hardware-Grade Live Preview Calculations
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const previewData = useMemo(() => {
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

    // Calculate Delivery Date
    let delivery = new Date(warehouseNow);
    let daysAdded = isPastCutoff ? 1 : 0;
    let targetWorkingDays = leadDays;

    while (targetWorkingDays > 0 || !workingDays.includes(delivery.getDay())) {
      delivery.setDate(delivery.getDate() + 1);
      if (workingDays.includes(delivery.getDay())) {
        targetWorkingDays--;
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

  const daysLabels = [
    { label: "M", day: 1 },
    { label: "T", day: 2 },
    { label: "W", day: 3 },
    { label: "T", day: 4 },
    { label: "F", day: 5 },
    { label: "S", day: 6 },
    { label: "S", day: 0 },
  ];

  return (
    <Page fullWidth>
      {/* App Bridge SaveBar */}
      <SaveBar open={isDirty}>
        <button variant="primary" onClick={handleSave} disabled={navigation.state === "submitting"}>
          {navigation.state === "submitting" ? "Syncing to Edge CDN..." : "Save & Sync"}
        </button>
        <button onClick={handleDiscard}>Discard</button>
      </SaveBar>

      <div
        style={{
          minHeight: "calc(100vh - 4rem)",
          backgroundColor: "#09090b",
          color: "#fafafa",
          fontFamily: 'Geist, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          margin: "-20px",
          padding: "24px 32px",
          boxSizing: "border-box",
        }}
      >
        {/* Studio Top Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingBottom: "20px",
            borderBottom: "1px solid #1f1f23",
            marginBottom: "24px",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <h1 style={{ fontSize: "1.25rem", fontWeight: "600", margin: 0, letterSpacing: "-0.02em" }}>
                DropClock Studio
              </h1>
              <span
                style={{
                  fontSize: "0.6875rem",
                  fontWeight: "500",
                  color: "#10b981",
                  backgroundColor: "rgba(16, 185, 129, 0.1)",
                  border: "1px solid rgba(16, 185, 129, 0.2)",
                  padding: "2px 8px",
                  borderRadius: "9999px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <span style={{ width: "5px", height: "5px", borderRadius: "50%", backgroundColor: "#10b981" }} />
                Shopify CDN Live
              </span>
            </div>
            <p style={{ fontSize: "0.8125rem", color: "#71717a", margin: "4px 0 0 0" }}>
              Configure shipping deadline arithmetic and preview real-time storefront response.
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
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
              Open Theme Editor ↗
            </a>
            <button
              onClick={handleSave}
              disabled={!isDirty || navigation.state === "submitting"}
              style={{
                backgroundColor: isDirty ? "#fafafa" : "#27272a",
                color: isDirty ? "#09090b" : "#71717a",
                border: "none",
                borderRadius: "8px",
                padding: "8px 16px",
                fontSize: "0.8125rem",
                fontWeight: "600",
                cursor: isDirty ? "pointer" : "default",
                transition: "all 0.15s ease",
              }}
            >
              {navigation.state === "submitting" ? "Syncing..." : isDirty ? "Save Changes" : "Saved"}
            </button>
          </div>
        </div>

        {/* 21st.dev Split-Pane Studio Layout */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(340px, 420px) 1fr",
            gap: "28px",
            alignItems: "start",
          }}
        >
          {/* LEFT PANE: Precision Parameter Controls */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "20px",
            }}
          >
            {/* Cutoff Time Control */}
            <div
              style={{
                backgroundColor: "#121215",
                border: "1px solid #1f1f23",
                borderRadius: "12px",
                padding: "20px",
                boxShadow: "inset 0 1px 0 0 rgba(255,255,255,0.03)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <ClockIcon />
                  <span style={{ fontSize: "0.875rem", fontWeight: "600", color: "#fafafa" }}>
                    Fulfillment Cutoff
                  </span>
                </div>
                <span
                  style={{
                    fontSize: "0.75rem",
                    color: "#a1a1aa",
                    backgroundColor: "#18181b",
                    border: "1px solid #27272a",
                    padding: "3px 8px",
                    borderRadius: "6px",
                    fontFamily: "monospace",
                  }}
                >
                  {ianaTimezone}
                </span>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8125rem", color: "#71717a", marginBottom: "8px" }}>
                  <span>Daily Dispatch Deadline</span>
                  <span style={{ color: "#fafafa", fontWeight: "600", fontFamily: "monospace" }}>
                    {cutoffHour.toString().padStart(2, "0")}:{cutoffMinute.toString().padStart(2, "0")} (24h)
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="23"
                  value={cutoffHour}
                  onChange={(e) => setCutoffHour(parseInt(e.target.value, 10))}
                  style={{
                    width: "100%",
                    accentColor: "#10b981",
                    cursor: "pointer",
                  }}
                />
              </div>

              {/* Minute Steppers */}
              <div style={{ display: "flex", gap: "6px" }}>
                {[0, 15, 30, 45].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setCutoffMinute(m)}
                    style={{
                      flex: 1,
                      padding: "6px",
                      borderRadius: "6px",
                      border: cutoffMinute === m ? "1px solid #10b981" : "1px solid #27272a",
                      backgroundColor: cutoffMinute === m ? "rgba(16, 185, 129, 0.1)" : "#18181b",
                      color: cutoffMinute === m ? "#10b981" : "#a1a1aa",
                      fontSize: "0.75rem",
                      fontWeight: "500",
                      cursor: "pointer",
                      fontFamily: "monospace",
                    }}
                  >
                    :{m.toString().padStart(2, "0")}
                  </button>
                ))}
              </div>
            </div>

            {/* Lead Time & Transit Handling */}
            <div
              style={{
                backgroundColor: "#121215",
                border: "1px solid #1f1f23",
                borderRadius: "12px",
                padding: "20px",
                boxShadow: "inset 0 1px 0 0 rgba(255,255,255,0.03)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
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
                  marginBottom: leadMode === "custom" ? "12px" : "0",
                }}
              >
                {(["1", "2", "3", "custom"] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => {
                      setLeadMode(mode);
                      if (mode !== "custom") setLeadDays(parseInt(mode, 10));
                    }}
                    style={{
                      padding: "6px",
                      borderRadius: "6px",
                      border: "none",
                      backgroundColor: leadMode === mode ? "#27272a" : "transparent",
                      color: leadMode === mode ? "#fafafa" : "#71717a",
                      fontSize: "0.75rem",
                      fontWeight: "600",
                      cursor: "pointer",
                    }}
                  >
                    {mode === "custom" ? "Custom" : `${mode} Day`}
                  </button>
                ))}
              </div>

              {leadMode === "custom" && (
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={leadDays}
                    onChange={(e) => setLeadDays(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    style={{
                      width: "80px",
                      backgroundColor: "#18181b",
                      border: "1px solid #27272a",
                      borderRadius: "6px",
                      padding: "6px 10px",
                      color: "#fafafa",
                      fontSize: "0.8125rem",
                      outline: "none",
                    }}
                  />
                  <span style={{ fontSize: "0.8125rem", color: "#71717a" }}>business days in transit</span>
                </div>
              )}
            </div>

            {/* Operating Working Days */}
            <div
              style={{
                backgroundColor: "#121215",
                border: "1px solid #1f1f23",
                borderRadius: "12px",
                padding: "20px",
                boxShadow: "inset 0 1px 0 0 rgba(255,255,255,0.03)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
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
                {daysLabels.map(({ label, day }) => {
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
                        border: active ? "1px solid rgba(16, 185, 129, 0.4)" : "1px solid #27272a",
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

            {/* Style Preset Selector */}
            <div
              style={{
                backgroundColor: "#121215",
                border: "1px solid #1f1f23",
                borderRadius: "12px",
                padding: "20px",
                boxShadow: "inset 0 1px 0 0 rgba(255,255,255,0.03)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
                <SlidersIcon />
                <span style={{ fontSize: "0.875rem", fontWeight: "600", color: "#fafafa" }}>
                  Style Preset
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {[
                  { id: "capsule", title: "Minimal Pill", desc: "Rounded capsule container with soft borders" },
                  { id: "border", title: "Border Line", desc: "Clean card with high-contrast accent indicator" },
                  { id: "minimal", title: "Subtle Text", desc: "Lightweight typographic layout without background" },
                ].map((preset) => {
                  const selected = presetStyle === preset.id;
                  return (
                    <div
                      key={preset.id}
                      onClick={() => setPresetStyle(preset.id as any)}
                      style={{
                        padding: "12px",
                        borderRadius: "8px",
                        border: selected ? "1px solid #10b981" : "1px solid #27272a",
                        backgroundColor: selected ? "rgba(16, 185, 129, 0.05)" : "#18181b",
                        cursor: "pointer",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <div style={{ fontSize: "0.8125rem", fontWeight: "600", color: selected ? "#10b981" : "#fafafa" }}>
                          {preset.title}
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "#71717a", marginTop: "2px" }}>
                          {preset.desc}
                        </div>
                      </div>
                      {selected && (
                        <div style={{ color: "#10b981" }}>
                          <CheckIcon />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT PANE: The "Hardware-Grade" Real-Time Preview */}
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
            {/* Mock Browser Top Bar */}
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
                <span style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#ef4444" }} />
                <span style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#eab308" }} />
                <span style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#22c55e" }} />
                <span
                  style={{
                    marginLeft: "12px",
                    fontSize: "0.75rem",
                    color: "#71717a",
                    fontFamily: "monospace",
                  }}
                >
                  storefront.myshopify.com/products/leather-cardholder
                </span>
              </div>

              {/* Hardware Diagnostic Pill */}
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  backgroundColor: "#09090b",
                  border: "1px solid #27272a",
                  padding: "3px 10px",
                  borderRadius: "9999px",
                  fontSize: "0.6875rem",
                  fontFamily: "monospace",
                  color: "#a1a1aa",
                }}
              >
                <span style={{ width: "5px", height: "5px", borderRadius: "50%", backgroundColor: "#10b981" }} />
                <span>Edge CDN: 0ms</span>
                <span style={{ color: "#3f3f46" }}>|</span>
                <span>Payload: 2.1kb</span>
                <span style={{ color: "#3f3f46" }}>|</span>
                <span style={{ color: "#34d399" }}>Lighthouse: 100/100</span>
              </div>
            </div>

            {/* Product Page Canvas on Dot Grid */}
            <div
              style={{
                padding: "36px",
                backgroundImage: "radial-gradient(#27272a 1px, transparent 1px)",
                backgroundSize: "16px 16px",
                backgroundColor: "#09090b",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  maxWidth: "480px",
                  width: "100%",
                  backgroundColor: "#18181b",
                  border: "1px solid #27272a",
                  borderRadius: "14px",
                  padding: "24px",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
                }}
              >
                {/* Product Metadata */}
                <div style={{ fontSize: "0.75rem", color: "#10b981", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px" }}>
                  In Stock · Ready to Dispatch
                </div>
                <h3 style={{ fontSize: "1.25rem", fontWeight: "600", color: "#fafafa", margin: "0 0 8px 0", letterSpacing: "-0.02em" }}>
                  Minimalist Leather Cardholder
                </h3>
                <div style={{ fontSize: "1.125rem", fontWeight: "700", color: "#fafafa", marginBottom: "18px" }}>
                  $48.00
                </div>

                {/* THE LIVE DROCLOCK CAPSULE IN SITU */}
                <div style={{ marginBottom: "20px" }}>
                  {presetStyle === "capsule" && (
                    <div
                      style={{
                        backgroundColor: "#121215",
                        border: "1px solid #27272a",
                        borderRadius: "10px",
                        padding: "14px 16px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "6px",
                        boxShadow: "inset 0 1px 0 0 rgba(255,255,255,0.03)",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.8125rem", fontWeight: "600", color: "#fafafa" }}>
                        <ClockIcon />
                        <span>Order within</span>
                        <span style={{ color: "#34d399", fontFamily: "monospace", fontWeight: "700" }}>
                          {previewData.hours}h {previewData.minutes}m {previewData.seconds}s
                        </span>
                        <span>for fast dispatch</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.75rem", color: "#a1a1aa" }}>
                        <TruckIcon />
                        <span>
                          Estimated Delivery: <strong style={{ color: "#fafafa" }}>{previewData.formattedArrival}</strong>
                        </span>
                      </div>
                    </div>
                  )}

                  {presetStyle === "border" && (
                    <div
                      style={{
                        backgroundColor: "#121215",
                        border: "1px solid #27272a",
                        borderLeft: "3px solid #10b981",
                        borderRadius: "8px",
                        padding: "12px 14px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "4px",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.8125rem", fontWeight: "600", color: "#fafafa" }}>
                        <ClockIcon />
                        <span>Cutoff Countdown:</span>
                        <span style={{ color: "#34d399", fontFamily: "monospace" }}>
                          {previewData.hours}h {previewData.minutes}m {previewData.seconds}s
                        </span>
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "#a1a1aa", marginLeft: "23px" }}>
                        Arrives by <strong style={{ color: "#fafafa" }}>{previewData.formattedArrival}</strong>
                      </div>
                    </div>
                  )}

                  {presetStyle === "minimal" && (
                    <div style={{ padding: "6px 0", display: "flex", flexDirection: "column", gap: "4px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.8125rem", color: "#a1a1aa" }}>
                        <ClockIcon />
                        <span>
                          Ships today if ordered in <strong style={{ color: "#34d399" }}>{previewData.hours}h {previewData.minutes}m</strong>
                        </span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.75rem", color: "#71717a" }}>
                        <TruckIcon />
                        <span>Expected arrival: {previewData.formattedArrival}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Mock Add to Cart Button */}
                <button
                  type="button"
                  disabled
                  style={{
                    width: "100%",
                    backgroundColor: "#fafafa",
                    color: "#09090b",
                    border: "none",
                    borderRadius: "8px",
                    padding: "12px",
                    fontSize: "0.875rem",
                    fontWeight: "600",
                    cursor: "not-allowed",
                    opacity: 0.9,
                    letterSpacing: "-0.01em",
                  }}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Page>
  );
}
