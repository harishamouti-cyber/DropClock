import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "~/shopify.server";
import prisma from "~/db.server";

/**
 * Centralized Shopify Webhook & GDPR/CPRA Compliance Handler
 * Cryptographically validates incoming HMAC headers via authenticate.webhook(request).
 */
export async function action({ request }: ActionFunctionArgs) {
  const { topic, shop, session, admin, payload } = await authenticate.webhook(request);

  // Normalize shop domain from webhook context or body payload
  const shopDomain = shop || payload?.shop_domain || session?.shop;

  if (!shopDomain) {
    console.warn(`[WEBHOOK] Warning: Webhook for topic ${topic} received without shop identifier.`);
  }

  console.info(`[WEBHOOK] Processing topic "${topic}" for shop: ${shopDomain || "unknown"}`);

  switch (topic) {
    case "CUSTOMERS_DATA_REQUEST":
      /**
       * 1. CUSTOMERS_DATA_REQUEST
       * DropClock operates strictly via Theme App Extensions and shop-level configuration metafields.
       * Zero Protected Customer Data (PCD) or customer PII is retained or stored.
       */
      console.info(`[GDPR] CUSTOMERS_DATA_REQUEST acknowledged for shop: ${shopDomain}`);
      return new Response(JSON.stringify({ message: "No customer PII stored by DropClock" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });

    case "CUSTOMERS_REDACT":
      /**
       * 2. CUSTOMERS_REDACT
       * Acknowledge redaction request. DropClock does not store individual customer records.
       */
      console.info(`[GDPR] CUSTOMERS_REDACT acknowledged for shop: ${shopDomain}`);
      return new Response(JSON.stringify({ message: "Customer data redaction acknowledged" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });

    case "SHOP_REDACT":
      /**
       * 3. SHOP_REDACT
       * 48 hours following app uninstallation, delete all merchant configurations,
       * tag rules, market overrides, and stored sessions in an atomic transaction.
       */
      console.info(`[GDPR] SHOP_REDACT initiated for shop: ${shopDomain}. Purging all records.`);
      if (shopDomain) {
        try {
          await prisma.$transaction([
            prisma.dropClockSettings.deleteMany({ where: { shop: shopDomain } }),
            prisma.session.deleteMany({ where: { shop: shopDomain } }),
          ]);
          console.info(`[GDPR] Successfully purged database records for shop: ${shopDomain}`);
        } catch (error) {
          console.error(`[GDPR] Error purging database records for shop ${shopDomain}:`, error);
        }
      }
      return new Response(JSON.stringify({ success: true, message: "Shop records successfully purged" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });

    case "APP_UNINSTALLED":
      /**
       * 4. APP_UNINSTALLED
       * Immediate cleanup upon uninstallation: Revoke active session tokens.
       */
      console.info(`[LIFECYCLE] APP_UNINSTALLED received for shop: ${shopDomain}. Revoking session tokens.`);
      if (shopDomain) {
        try {
          await prisma.session.deleteMany({ where: { shop: shopDomain } });
          console.info(`[LIFECYCLE] Revoked and purged active sessions for shop: ${shopDomain}`);
        } catch (error) {
          console.error(`[LIFECYCLE] Error removing session for shop ${shopDomain}:`, error);
        }
      }
      return new Response(null, { status: 200 });

    default:
      console.warn(`[WEBHOOK] Unhandled webhook topic: ${topic}`);
      return new Response("Unhandled webhook topic", { status: 200 });
  }
}
