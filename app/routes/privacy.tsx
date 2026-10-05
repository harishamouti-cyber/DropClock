import { Page, Layout, Card, Text, BlockStack } from "@shopify/polaris";
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";

export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

export default function PrivacyPolicy() {
  return (
    <Page title="Privacy Policy" subtitle="Last updated: October 2026">
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingMd">
                1. Data Collection & Minimization
              </Text>
              <Text as="p" variant="bodyMd">
                DropClock operates on a strict data-minimization principle. We collect and process only the minimal store configuration data necessary to provide accurate delivery countdowns and dispatch estimates:
              </Text>
              <ul className="list-disc pl-5 space-y-1 text-sm text-zinc-700">
                <li>Store primary domain and shop ID</li>
                <li>Warehouse timezone and UTC offset</li>
                <li>Cutoff hours, lead handling days, and operating day schedules</li>
                <li>Merchant-defined blackout calendar dates and product tag override rules</li>
              </ul>

              <Text as="h2" variant="headingMd">
                2. Zero Protected Customer Data (Zero PCD)
              </Text>
              <Text as="p" variant="bodyMd">
                DropClock does <strong>NOT</strong> request, collect, store, or sell any Protected Customer Data (PCD) or Personally Identifiable Information (PII). We do not record individual customer names, email addresses, phone numbers, shipping addresses, or payment card details.
              </Text>

              <Text as="h2" variant="headingMd">
                3. Storefront Performance & Cookies
              </Text>
              <Text as="p" variant="bodyMd">
                Our storefront countdown blocks are rendered via native Shopify Theme App Extensions (Liquid). DropClock uses zero third-party tracking pixels, zero analytics cookies, and zero cross-site trackers. All visitor interactions with the countdown timer occur entirely client-side.
              </Text>

              <Text as="h2" variant="headingMd">
                4. GDPR & CPRA Compliance
              </Text>
              <Text as="p" variant="bodyMd">
                DropClock fully implements mandatory Shopify GDPR and CPRA compliance webhooks:
              </Text>
              <ul className="list-disc pl-5 space-y-1 text-sm text-zinc-700">
                <li><strong>Customer Data Request:</strong> Validated via HMAC. We confirm zero stored customer records.</li>
                <li><strong>Customer Redaction:</strong> Validated via HMAC. No customer records exist to redact.</li>
                <li><strong>Shop Redaction:</strong> When a store uninstalls or requests deletion, all tenant configurations and session tokens are purged atomically from our database within 48 hours.</li>
              </ul>

              <Text as="h2" variant="headingMd">
                5. Contact Information
              </Text>
              <Text as="p" variant="bodyMd">
                For questions regarding this Privacy Policy or data handling practices, please contact our privacy compliance team at <a href="mailto:privacy@dropclock.app" className="text-emerald-700 underline">privacy@dropclock.app</a>.
              </Text>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
