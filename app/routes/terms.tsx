import { Page, Layout, Card, Text, BlockStack } from "@shopify/polaris";
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";

export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

export default function TermsOfService() {
  return (
    <Page title="Terms of Service" subtitle="Last updated: October 2026">
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingMd">
                1. Acceptance of Terms
              </Text>
              <Text as="p" variant="bodyMd">
                By installing and using DropClock (&ldquo;the App&rdquo;), you agree to be bound by these Terms of Service. If you do not agree to these terms, please uninstall the App immediately.
              </Text>

              <Text as="h2" variant="headingMd">
                2. Subscription & Billing Disclosures
              </Text>
              <Text as="p" variant="bodyMd">
                DropClock Pro is billed through Shopify Managed Billing at <strong>$8.99 USD per month</strong> (every 30 days) following a <strong>7-day free trial</strong>.
              </Text>
              <ul className="list-disc pl-5 space-y-1 text-sm text-zinc-700">
                <li><strong>Trial Period:</strong> During the 7-day trial period, merchants enjoy complete access to all Pro features with zero billing obligation.</li>
                <li><strong>Billing Inception:</strong> Charges begin automatically at the conclusion of the 7-day free trial unless uninstalled prior to expiration.</li>
                <li><strong>Cancellation:</strong> You may cancel anytime by uninstalling DropClock from your Shopify store. No cancellation fees apply.</li>
                <li><strong>Test Store Exemption:</strong> Partner development and test stores are exempt from subscription charges.</li>
              </ul>

              <Text as="h2" variant="headingMd">
                3. Merchant Responsibilities
              </Text>
              <Text as="p" variant="bodyMd">
                Merchants are solely responsible for setting accurate cutoff times, handling lead days, and warehouse operating schedules. DropClock calculates dynamic delivery date estimates based directly on merchant input and courier SLA guidelines.
              </Text>

              <Text as="h2" variant="headingMd">
                4. Service Availability & Performance
              </Text>
              <Text as="p" variant="bodyMd">
                DropClock is engineered for 99.9% uptime with 0ms storefront performance drag, powered by Shopify CDN edge metafield delivery. However, we do not warrant uninterrupted operation during Shopify platform outages.
              </Text>

              <Text as="h2" variant="headingMd">
                5. Limitation of Liability
              </Text>
              <Text as="p" variant="bodyMd">
                To the maximum extent permitted by applicable law, DropClock and its creators shall not be liable for any indirect, incidental, or consequential damages resulting from store fulfillment delays or inaccurate carrier delivery schedules.
              </Text>

              <Text as="h2" variant="headingMd">
                6. Contact & Support
              </Text>
              <Text as="p" variant="bodyMd">
                For questions regarding subscriptions, technical support, or these Terms of Service, contact our support team at <a href="mailto:support@dropclock.app" className="text-emerald-700 underline">support@dropclock.app</a>.
              </Text>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
