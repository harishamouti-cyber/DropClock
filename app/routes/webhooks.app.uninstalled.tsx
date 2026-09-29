import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "~/shopify.server";
import prisma from "~/db.server";

/**
 * App Uninstalled Lifecycle Webhook
 * Removes stored sessions when the merchant uninstalls DropClock.
 */
export async function action({ request }: ActionFunctionArgs) {
  const { shop, session, topic } = await authenticate.webhook(request);

  console.info(`[LIFECYCLE] Received ${topic} for shop ${shop}`);

  if (session) {
    await prisma.session.deleteMany({ where: { shop } });
  }

  return new Response();
}
