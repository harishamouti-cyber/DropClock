import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "~/shopify.server";

/**
 * Mandatory GDPR Webhook: customers/redact
 * Shopify sends this webhook when a customer requests their data to be deleted.
 * DropClock does not store any customer records or PII.
 */
export async function action({ request }: ActionFunctionArgs) {
  const { topic, shop } = await authenticate.webhook(request);

  console.info(`[GDPR] Received ${topic} for shop ${shop}`);

  // DropClock stores no customer PII to redact. Acknowledge receipt with 200.
  return new Response(
    JSON.stringify({
      success: true,
      message: "No customer records exist in DropClock to redact.",
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
}
