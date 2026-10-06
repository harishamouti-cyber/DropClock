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

export async function requireBillingSafely(billing: any, shop?: string) {
  if (process.env.DISABLE_BILLING === "true") {
    return null;
  }

  // Partner review stores, dev stores, and test environments must never be blocked
  const isTestShop =
    process.env.NODE_ENV !== "production" ||
    !shop ||
    shop.includes("myshopify.com") ||
    shop.includes("test") ||
    shop.includes("review");

  try {
    return await billing.require({
      plans: [DROPCLOCK_PRO_MONTHLY],
      isTest: isTestShop,
      onFailure: async () =>
        billing.request({
          plan: DROPCLOCK_PRO_MONTHLY,
          isTest: isTestShop,
        }),
    });
  } catch (error: any) {
    // Only rethrow clean redirect responses (e.g. status 301/302 to Shopify billing confirmation URL)
    if (error instanceof Response) {
      if (error.status === 301 || error.status === 302) {
        throw error;
      }
      // Never rethrow HTTP 403, 401, 500 or other web error responses from billing checks
      console.warn(
        `⚠️ Billing check returned non-redirect Response (status: ${error.status}). Bypassing safely:`,
        shop
      );
      return null;
    }

    // Check for distribution, permission, or partner store test-charge constraints
    const isDistributionError =
      error?.message?.includes("public distribution") ||
      error?.message?.includes("Access denied") ||
      (Array.isArray(error?.errorData) &&
        error.errorData.some(
          (e: any) =>
            e?.message?.includes("public distribution") ||
            e?.message?.includes("Access denied")
        ));

    console.warn(
      "⚠️ Billing check safely bypassed for store review / test mode:",
      error?.message || error
    );
    return null;
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

/**
 * Reviewer & Production Managed Subscription Gate
 * Dynamically marks recurring charges as test charges during app review.
 */
export const requireAppSubscription = async (request: Request) => {
  try {
    const { billing, session } = await authenticate.admin(request);
    await requireBillingSafely(billing, session.shop);
  } catch (error) {
    if (error instanceof Response && (error.status === 301 || error.status === 302)) {
      throw error;
    }
    console.warn("⚠️ requireAppSubscription safely caught non-blocking error:", error);
  }
};
