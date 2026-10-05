import { json } from "@remix-run/node";
import { AppProvider } from "@shopify/polaris";
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";
import { DropClockStudio } from "~/components/DropClockStudio";

export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

export async function loader() {
  return json({
    settings: {
      cutoffHour: 14,
      cutoffMinute: 0,
      leadDays: 2,
      workingDays: "[1,2,3,4,5]",
      blackoutDates: "[\"2026-11-26\", \"2026-12-25\"]",
      tagRules: "[{\"tag\":\"pre-order\",\"leadDays\":14},{\"tag\":\"custom\",\"leadDays\":5}]",
      tagRulesJson: "[{\"tag\":\"pre-order\",\"leadDays\":14},{\"tag\":\"custom\",\"leadDays\":5}]",
      widgetStyle: "capsule",
      presetStyle: "capsule",
      accentColor: "#008060",
      primaryColor: "#008060",
      cardBg: "#F4F6F8",
      bgColor: "#F4F6F8",
      textColor: "#202223",
      leadText: "Order within",
      sameDayText: "for same-day dispatch",
      nextDayText: "for tomorrow's dispatch",
      etaText: "Estimated Delivery:",
      freeShippingThreshold: 75,
    },
    shop: "preview-store.myshopify.com",
    ianaTimezone: "America/New_York",
    timezoneOffsetMinutes: -300,
  });
}

export async function action({ request }: { request: Request }) {
  const formData = await request.formData();
  return json(
    {
      success: true,
      sandbox: true,
      message: "Preview settings updated successfully",
      data: Object.fromEntries(formData),
    },
    { status: 200 }
  );
}

export default function StandalonePreviewRoute() {
  return (
    <AppProvider i18n={{}}>
      <DropClockStudio
        settings={{
          shop: "demo-store.myshopify.com",
          cutoffHour: 14,
          cutoffMinute: 0,
          leadDays: 2,
          workingDays: "[1,2,3,4,5]",
          blackoutDates: "[\"2026-11-26\", \"2026-12-25\"]",
          tagRules: "[{\"tag\":\"pre-order\",\"leadDays\":14},{\"tag\":\"custom\",\"leadDays\":5}]",
          tagRulesJson: "[{\"tag\":\"pre-order\",\"leadDays\":14},{\"tag\":\"custom\",\"leadDays\":5}]",
          widgetStyle: "capsule",
          presetStyle: "capsule",
          accentColor: "#008060",
          primaryColor: "#008060",
          cardBg: "#F4F6F8",
          bgColor: "#F4F6F8",
          textColor: "#202223",
          leadText: "Order within",
          sameDayText: "for same-day dispatch",
          nextDayText: "for tomorrow's dispatch",
          etaText: "Estimated Delivery:",
      freeShippingThreshold: 75,
        }}
        shop="demo-store.myshopify.com"
        ianaTimezone="America/New_York"
        timezoneOffsetMinutes={-300}
        isStandalone={true}
      />
    </AppProvider>
  );
}
