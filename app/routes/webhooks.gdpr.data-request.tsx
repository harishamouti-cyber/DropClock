import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "~/shopify.server";

/**
 * Mandatory GDPR Webhook: customers/data_request
 * Shopify sends this webhook when a customer requests their stored data.
 * DropClock operates strictly on shop-level metafields and does NOT store any Customer PII or Protected Customer Data (PCD).
 */
export async function action({ request }: ActionFunctionArgs) {
  const { topic, shop, payload } = await authenticate.webhook(request);

  console.info(`[GDPR] Received ${topic} for shop ${shop}`);

  // DropClock stores 0 customer records. Return HTTP 200 with standard compliance payload.
  return new Response(
    JSON.stringify({
      message: "DropClock does not collect or store personal customer data.",
      shop,
      customer_id: payload?.customer?.id || null,
      data: {},
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
}
