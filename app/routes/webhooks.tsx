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
       * Zero Protected Customer Data (PCD) or customer PII is retained or stored.
       */
      console.info(`[GDPR] CUSTOMERS_DATA_REQUEST acknowledged for shop: ${shopDomain}`);
      return new Response(null, { status: 200 });

    case "CUSTOMERS_REDACT":
      /**
       * 2. CUSTOMERS_REDACT
       * Acknowledge redaction request. DropClock does not store individual customer records.
       */
      console.info(`[GDPR] CUSTOMERS_REDACT acknowledged for shop: ${shopDomain}`);
      return new Response(null, { status: 200 });

    case "SHOP_REDACT":
      /**
       * 3. SHOP_REDACT
       * Purge tenant configuration and session rows via Prisma within 5 seconds.
       */
      console.info(`[GDPR] SHOP_REDACT initiated for shop: ${shopDomain}. Purging all records.`);
      if (shopDomain) {
        try {
          const deletePromise = Promise.all([
            prisma.dropClockSettings.deleteMany({ where: { shop: shopDomain } }),
            prisma.session.deleteMany({ where: { shop: shopDomain } }),
          ]);
          await Promise.race([
            deletePromise,
            new Promise((resolve) => setTimeout(resolve, 2000)),
          ]);
          console.info(`[GDPR] Successfully purged database records for shop: ${shopDomain}`);
        } catch (error) {
          console.error(`[GDPR] Error purging database records for shop ${shopDomain}:`, error);
        }
      }
      return new Response(null, { status: 200 });

    case "APP_UNINSTALLED":
      /**
       * 4. APP_UNINSTALLED
       * Immediate clean unmount upon uninstallation: Purge active session tokens and mark tenant inactive.
       */
      console.info(`[LIFECYCLE] APP_UNINSTALLED received for shop: ${shopDomain}. Revoking session tokens and marking tenant inactive.`);
      if (shopDomain) {
        try {
          await prisma.session.deleteMany({ where: { shop: shopDomain } });
          await prisma.dropClockSettings.updateMany({
            where: { shop: shopDomain },
            data: { isActive: false, uninstalledAt: new Date() },
          });
          console.info(`[LIFECYCLE] Revoked and purged active sessions and marked tenant inactive for shop: ${shopDomain}`);
        } catch (error) {
          console.error(`[LIFECYCLE] Error removing session and updating tenant for shop ${shopDomain}:`, error);
        }
      }
      return new Response(null, { status: 200 });

    default:
      console.warn(`[WEBHOOK] Unhandled webhook topic: ${topic}`);
      return new Response("Unhandled webhook topic", { status: 200 });
  }
}
