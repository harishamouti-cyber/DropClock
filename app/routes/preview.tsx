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
      primaryColor: "#008060",
      bgColor: "#F4F6F8",
      textColor: "#202223",
      presetStyle: "capsule",
    },
    shop: "preview-store.myshopify.com",
    ianaTimezone: "America/New_York",
    timezoneOffsetMinutes: -300,
  });
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
          primaryColor: "#008060",
          bgColor: "#F4F6F8",
          textColor: "#202223",
          presetStyle: "capsule",
        }}
        shop="demo-store.myshopify.com"
        ianaTimezone="America/New_York"
        timezoneOffsetMinutes={-300}
        isStandalone={true}
      />
    </AppProvider>
  );
}
