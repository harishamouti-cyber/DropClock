import "@shopify/shopify-app-remix/adapters/node";
import {
  AppDistribution,
  shopifyApp,
  LATEST_API_VERSION,
  BillingInterval,
} from "@shopify/shopify-app-remix/server";
import { resilientSessionStorage } from "./session.server";
import prisma from "./db.server";

export const apiVersion = LATEST_API_VERSION;

// Standardized Recurring Billing Plan Constant
export const DROPCLOCK_PRO_MONTHLY = "DropClock Pro";

export const BILLING_CONFIG = {
  [DROPCLOCK_PRO_MONTHLY]: {
    amount: 8.99,
    currencyCode: "USD",
    interval: BillingInterval.Every30Days,
    trialDays: 7,
  },
};

export async function requireBillingSafely(billing: any) {
  if (process.env.DISABLE_BILLING === "true") {
    return null;
  }

  try {
    return await billing.require({
      plans: [DROPCLOCK_PRO_MONTHLY],
      isTest: process.env.NODE_ENV !== "production",
      onFailure: async () =>
        billing.request({
          plan: DROPCLOCK_PRO_MONTHLY,
          isTest: process.env.NODE_ENV !== "production",
        }),
    });
  } catch (error: any) {
    // If Remix redirect response was thrown by redirectOutOfApp, rethrow it
    if (
      error instanceof Response ||
      (error && typeof error === "object" && ("status" in error || "headers" in error))
    ) {
      throw error;
    }

    const isDistributionError =
      error?.message?.includes("public distribution") ||
      (Array.isArray(error?.errorData) &&
        error.errorData.some((e: any) => e?.message?.includes("public distribution")));

    if (isDistributionError || process.env.NODE_ENV !== "production") {
      console.warn(
        "⚠️ Billing check bypassed (App does not have public distribution enabled or in dev mode):",
        error?.message || error
      );
      return null;
    }

    throw error;
  }
}

export const SHOPIFY_API_KEY =
  process.env.SHOPIFY_API_KEY &&
  process.env.SHOPIFY_API_KEY !== "88689745373b37439f8a9885c878251c" &&
  process.env.SHOPIFY_API_KEY !== "dummy_key"
    ? process.env.SHOPIFY_API_KEY
    : "0a616a9e934ece36ebebdfd0bb906a9b";

export const SHOPIFY_APP_URL =
  process.env.SHOPIFY_APP_URL && !process.env.SHOPIFY_APP_URL.includes("example.com")
    ? process.env.SHOPIFY_APP_URL
    : "https://drop-clock-zeta.vercel.app";

const shopify = shopifyApp({
  apiKey: SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET || "dummy_secret",
  apiVersion,
  scopes: process.env.SCOPES?.split(",") || ["read_products", "write_products"],
  appUrl: SHOPIFY_APP_URL,
  authPathPrefix: "/auth",
  sessionStorage: resilientSessionStorage,
  distribution: AppDistribution.AppStore,
  billing: {
    [DROPCLOCK_PRO_MONTHLY]: {
      lineItems: [
        {
          amount: 8.99,
          currencyCode: "USD",
          interval: BillingInterval.Every30Days,
        },
      ],
      trialDays: 7,
    },
  },
  future: {
    unstable_newEmbeddedAuthStrategy: true,
  },
  ...(process.env.SHOP_CUSTOM_DOMAIN
    ? { customShopDomains: [process.env.SHOP_CUSTOM_DOMAIN] }
    : {}),
});

export default shopify;
export const addDocumentResponseHeaders = shopify.addDocumentResponseHeaders;
export const authenticate = shopify.authenticate;
export const unauthenticated = shopify.unauthenticated;
export const login = shopify.login;
export const registerWebhooks = shopify.registerWebhooks;
export const sessionStorage = shopify.sessionStorage;
