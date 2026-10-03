import { json, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { authenticate, requireBillingSafely } from "~/shopify.server";
import prisma from "~/db.server";
import { DropClockStudio } from "~/components/DropClockStudio";

export async function loader({ request }: LoaderFunctionArgs) {
  const { session, admin, billing } = await authenticate.admin(request);

  await requireBillingSafely(billing);

  const defaultSettings = {
    cutoffHour: 14,
    cutoffMinute: 0,
    leadDays: 2,
    workingDays: "[1,2,3,4,5]",
    blackoutDates: "[]",
    tagRules: "[]",
    tagRulesJson: "[]",
    marketOverrides: "{}",
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
    translations: "{}",
  };

  let isNewInstall = false;
  let settings: any = null;

  try {
    const fetchPromise = prisma.dropClockSettings.findUnique({
      where: { shop: session.shop },
    });
    settings = await Promise.race([
      fetchPromise,
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 1500)),
    ]);

    if (!settings) {
      try {
        const createPromise = prisma.dropClockSettings.create({
          data: { shop: session.shop },
        });
        settings = await Promise.race([
          createPromise,
          new Promise<null>((resolve) => setTimeout(() => resolve(null), 1500)),
        ]);
        isNewInstall = true;
      } catch {
        settings = defaultSettings;
      }
    }
  } catch (err) {
    console.warn("[Loader] Prisma bypassed/timed out, using defaults:", err);
    settings = defaultSettings;
  }

  if (!settings) {
    settings = defaultSettings;
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
  const shopGid = shopData.id;
  const ianaTimezone = shopData.ianaTimezone || "UTC";
  const timezoneOffsetMinutes = shopData.timezoneOffsetMinutes ?? 0;

  const parsedBlackouts = (() => {
    try {
      const p = JSON.parse(settings.blackoutDates || "[]");
      return Array.isArray(p) ? p : [];
    } catch {
      return [];
    }
  })();
  const parsedTagRules = (() => {
    try {
      const p = JSON.parse(settings.tagRules || settings.tagRulesJson || "[]");
      return Array.isArray(p) ? p : [];
    } catch {
      return [];
    }
  })();

  const activeWidgetStyle = settings.widgetStyle || settings.presetStyle || "capsule";
  const activeAccentColor = settings.accentColor || settings.primaryColor || "#008060";
  const activeCardBg = settings.cardBg || settings.bgColor || "#F4F6F8";
  const activeLeadText = settings.leadText || "Order within";
  const activeSameDayText = settings.sameDayText || "for same-day dispatch";
  const activeNextDayText = settings.nextDayText || "for tomorrow's dispatch";
  const activeEtaText = settings.etaText || "Estimated Delivery:";

  // Automated Shopify Metastore Sync on Install
  if (isNewInstall && shopGid) {
    const metafieldPayload = {
      cutoffHour: settings.cutoffHour,
      cutoffMinute: settings.cutoffMinute,
      leadDays: settings.leadDays,
      workingDays: JSON.parse(settings.workingDays || "[1,2,3,4,5]"),
      widgetStyle: activeWidgetStyle,
      accentColor: activeAccentColor,
      cardBg: activeCardBg,
      textColor: settings.textColor,
      blackoutDates: parsedBlackouts,
      tagRules: parsedTagRules,
      translations: {
        cutoffPrefix: activeLeadText,
        sameDaySuffix: activeSameDayText,
        nextDaySuffix: activeNextDayText,
        deliveryPrefix: activeEtaText,
      },
      ianaTimezone,
      timezoneOffsetMinutes,
      // Backward compatibility aliases
      presetStyle: activeWidgetStyle,
      primaryColor: activeAccentColor,
      bgColor: activeCardBg,
      tagRulesJson: parsedTagRules,
      marketOverrides: JSON.parse(settings.marketOverrides || "{}"),
      leadText: activeLeadText,
      sameDayText: activeSameDayText,
      nextDayText: activeNextDayText,
      etaText: activeEtaText,
    };

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
    settings: {
      ...settings,
      widgetStyle: activeWidgetStyle,
      accentColor: activeAccentColor,
      cardBg: activeCardBg,
      presetStyle: activeWidgetStyle,
      primaryColor: activeAccentColor,
      bgColor: activeCardBg,
      leadText: activeLeadText,
      sameDayText: activeSameDayText,
      nextDayText: activeNextDayText,
      etaText: activeEtaText,
    },
    shop: session.shop,
    ianaTimezone,
    timezoneOffsetMinutes,
    extensionId: process.env.SHOPIFY_DROPCLOCK_EXTENSION_ID || "6ccfac9a-9e01-8c6b-a21e-2c7474d1188e729b0378",
  });
}

export async function action({ request }: ActionFunctionArgs) {
  const { admin, session, billing } = await authenticate.admin(request);

  await requireBillingSafely(billing);

  const formData = await request.formData();

  const cutoffHour = parseInt(formData.get("cutoffHour") as string, 10) || 14;
  const cutoffMinute = parseInt(formData.get("cutoffMinute") as string, 10) || 0;
  const leadDays = parseInt(formData.get("leadDays") as string, 10) || 2;
  const widgetStyle = (formData.get("widgetStyle") as string) || (formData.get("presetStyle") as string) || "capsule";
  const accentColor = (formData.get("accentColor") as string) || (formData.get("primaryColor") as string) || "#008060";
  const cardBg = (formData.get("cardBg") as string) || (formData.get("bgColor") as string) || "#F4F6F8";
  const textColor = (formData.get("textColor") as string) || "#202223";
  const leadText = (formData.get("leadText") as string) || (formData.get("cutoffPrefix") as string) || "Order within";
  const sameDayText = (formData.get("sameDayText") as string) || (formData.get("sameDaySuffix") as string) || "for same-day dispatch";
  const nextDayText = (formData.get("nextDayText") as string) || (formData.get("nextDaySuffix") as string) || "for tomorrow's dispatch";
  const etaText = (formData.get("etaText") as string) || (formData.get("deliveryPrefix") as string) || "Estimated Delivery:";
  const workingDaysRaw = (formData.get("workingDays") as string) || "[1,2,3,4,5]";
  const blackoutDatesRaw = (formData.get("blackoutDates") as string) || "[]";
  const tagRulesRaw = (formData.get("tagRules") as string) || (formData.get("tagRulesJson") as string) || "[]";
  const translationsRaw = (formData.get("translations") as string) || JSON.stringify({
    cutoffPrefix: leadText,
    sameDaySuffix: sameDayText,
    nextDaySuffix: nextDayText,
    deliveryPrefix: etaText,
  });

  let updated: any = null;
  const payloadData = {
    cutoffHour,
    cutoffMinute,
    leadDays,
    widgetStyle,
    accentColor,
    cardBg,
    textColor,
    blackoutDates: blackoutDatesRaw,
    tagRules: tagRulesRaw,
    translations: translationsRaw,
    presetStyle: widgetStyle,
    primaryColor: accentColor,
    bgColor: cardBg,
    tagRulesJson: tagRulesRaw,
    leadText,
    sameDayText,
    nextDayText,
    etaText,
    workingDays: workingDaysRaw,
  };

  try {
    const upsertPromise = prisma.dropClockSettings.upsert({
      where: { shop: session.shop },
      update: payloadData,
      create: {
        shop: session.shop,
        ...payloadData,
      },
    });
    updated = await Promise.race([
      upsertPromise,
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 2000)),
    ]);
  } catch (err) {
    console.warn("[Action] Prisma upsert bypassed/failed:", err);
  }

  if (!updated) {
    updated = {
      shop: session.shop,
      ...payloadData,
    };
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
  const shopGid = shopResult?.data?.shop?.id;
  const ianaTimezone = shopResult?.data?.shop?.ianaTimezone || "UTC";
  const timezoneOffsetMinutes = shopResult?.data?.shop?.timezoneOffsetMinutes ?? 0;

  const parsedBlackouts = (() => {
    try {
      const p = JSON.parse(updated.blackoutDates || "[]");
      return Array.isArray(p) ? p : [];
    } catch {
      return [];
    }
  })();
  const parsedTagRules = (() => {
    try {
      const p = JSON.parse(updated.tagRules || updated.tagRulesJson || "[]");
      return Array.isArray(p) ? p : [];
    } catch {
      return [];
    }
  })();

  const metafieldPayload = {
    cutoffHour: updated.cutoffHour,
    cutoffMinute: updated.cutoffMinute,
    leadDays: updated.leadDays,
    workingDays: JSON.parse(updated.workingDays || "[1,2,3,4,5]"),
    widgetStyle: updated.widgetStyle || updated.presetStyle || "capsule",
    accentColor: updated.accentColor || updated.primaryColor || "#008060",
    cardBg: updated.cardBg || updated.bgColor || "#F4F6F8",
    textColor: updated.textColor,
    blackoutDates: parsedBlackouts,
    tagRules: parsedTagRules,
    translations: {
      cutoffPrefix: updated.leadText || leadText,
      sameDaySuffix: updated.sameDayText || sameDayText,
      nextDaySuffix: updated.nextDayText || nextDayText,
      deliveryPrefix: updated.etaText || etaText,
    },
    ianaTimezone,
    timezoneOffsetMinutes,
    // Backward compatibility
    presetStyle: updated.widgetStyle || updated.presetStyle || "capsule",
    primaryColor: updated.accentColor || updated.primaryColor || "#008060",
    bgColor: updated.cardBg || updated.bgColor || "#F4F6F8",
    tagRulesJson: parsedTagRules,
    marketOverrides: JSON.parse(updated.marketOverrides || "{}"),
    leadText: updated.leadText || leadText,
    sameDayText: updated.sameDayText || sameDayText,
    nextDayText: updated.nextDayText || nextDayText,
    etaText: updated.etaText || etaText,
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

export default function DropClockSettingsRoute() {
  const { settings, shop, ianaTimezone, timezoneOffsetMinutes, extensionId } = useLoaderData<typeof loader>();

  return (
    <DropClockStudio
      settings={settings}
      shop={shop}
      ianaTimezone={ianaTimezone}
      timezoneOffsetMinutes={timezoneOffsetMinutes}
      extensionId={extensionId}
    />
  );
}
