import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "~/shopify.server";
import prisma from "~/db.server";

/**
 * Mandatory GDPR Webhook: shop/redact
 * Shopify sends this webhook 48 hours after a store owner uninstalls an app,
 * requesting deletion of all shop-specific database records.
 */
export async function action({ request }: ActionFunctionArgs) {
  const { topic, shop } = await authenticate.webhook(request);

  console.info(`[GDPR] Received ${topic} for shop ${shop}. Purging shop records.`);

  try {
    // Delete all local DropClock settings and sessions for this shop
    await prisma.dropClockSettings.deleteMany({
      where: { shop },
    });

    await prisma.session.deleteMany({
      where: { shop },
    });

    console.info(`[GDPR] Successfully purged all records for shop ${shop}`);
  } catch (error) {
    console.error(`[GDPR] Error purging records for shop ${shop}:`, error);
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
