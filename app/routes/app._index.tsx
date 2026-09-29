import { json, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { authenticate, DROPCLOCK_PRO_MONTHLY } from "~/shopify.server";
import prisma from "~/db.server";
import { DropClockStudio } from "~/components/DropClockStudio";

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

  let isNewInstall = false;
  let settings = await prisma.dropClockSettings.findUnique({
    where: { shop: session.shop },
  });

  if (!settings) {
    settings = await prisma.dropClockSettings.create({
      data: { shop: session.shop },
    });
    isNewInstall = true;
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

  // Automated Shopify Metastore Sync on Install
  if (isNewInstall && shopGid) {
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
        const p = JSON.parse(settings.tagRulesJson || "[]");
        return Array.isArray(p) ? p : [];
      } catch {
        return [];
      }
    })();

    const metafieldPayload = {
      cutoffHour: settings.cutoffHour,
      cutoffMinute: settings.cutoffMinute,
      leadDays: settings.leadDays,
      timezoneOffsetMinutes,
      ianaTimezone,
      workingDays: JSON.parse(settings.workingDays || "[1,2,3,4,5]"),
      blackoutDates: parsedBlackouts,
      tagRules: parsedTagRules,
      tagRulesJson: parsedTagRules,
      marketOverrides: JSON.parse(settings.marketOverrides || "{}"),
      presetStyle: settings.presetStyle,
      primaryColor: settings.primaryColor,
      bgColor: settings.bgColor,
      textColor: settings.textColor,
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
    settings,
    shop: session.shop,
    ianaTimezone,
    timezoneOffsetMinutes,
    extensionId: process.env.SHOPIFY_DROPCLOCK_EXTENSION_ID || "6ccfac9a-9e01-8c6b-a21e-2c7474d1188e729b0378",
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
  const primaryColor = (formData.get("primaryColor") as string) || "#008060";
  const bgColor = (formData.get("bgColor") as string) || "#F4F6F8";
  const textColor = (formData.get("textColor") as string) || "#202223";
  const presetStyle = (formData.get("presetStyle") as string) || "capsule";
  const workingDaysRaw = (formData.get("workingDays") as string) || "[1,2,3,4,5]";
  const blackoutDatesRaw = (formData.get("blackoutDates") as string) || "[]";
  const tagRulesRaw = (formData.get("tagRules") as string) || (formData.get("tagRulesJson") as string) || "[]";

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
      blackoutDates: blackoutDatesRaw,
      tagRulesJson: tagRulesRaw,
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
      blackoutDates: blackoutDatesRaw,
      tagRulesJson: tagRulesRaw,
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
      const p = JSON.parse(updated.tagRulesJson || "[]");
      return Array.isArray(p) ? p : [];
    } catch {
      return [];
    }
  })();

  const metafieldPayload = {
    cutoffHour: updated.cutoffHour,
    cutoffMinute: updated.cutoffMinute,
    leadDays: updated.leadDays,
    timezoneOffsetMinutes,
    ianaTimezone,
    workingDays: JSON.parse(updated.workingDays || "[1,2,3,4,5]"),
    blackoutDates: parsedBlackouts,
    tagRules: parsedTagRules,
    tagRulesJson: parsedTagRules,
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

export default function AppIndex() {
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
