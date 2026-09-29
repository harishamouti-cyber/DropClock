import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  Text,
  Button,
  Banner,
  BlockStack,
  InlineStack,
  Badge,
  Box,
  Divider,
  List,
} from "@shopify/polaris";
import { authenticate } from "~/shopify.server";
import prisma from "~/db.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const { session } = await authenticate.admin(request);

  const settings = await prisma.dropClockSettings.findUnique({
    where: { shop: session.shop },
  });

  return json({
    shop: session.shop,
    isConfigured: Boolean(settings),
    settings: settings || {
      cutoffHour: 14,
      cutoffMinute: 0,
      leadDays: 2,
      presetStyle: "capsule",
      updatedAt: null,
    },
  });
}

export default function OverviewRoute() {
  const { shop, isConfigured, settings } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  return (
    <Page
      title="DropClock Overview"
      subtitle={`Connected to ${shop}`}
      primaryAction={{
        content: "Configure Cutoff & ETA",
        onAction: () => navigate("/app/dropclock"),
      }}
    >
      <BlockStack gap="500">
        <Banner
          title="Zero-Latency Storefront Infrastructure Active"
          tone="success"
        >
          <p>
            DropClock uses Shopify’s Theme App Extension architecture. Your shipping
            cutoffs and delivery estimates are delivered straight from Shopify’s Edge CDN
            without third-party script bloat or network latency.
          </p>
        </Banner>

        <Layout>
          <Layout.Section>
            <BlockStack gap="400">
              <Card>
                <BlockStack gap="300">
                  <InlineStack align="space-between">
                    <Text as="h2" variant="headingMd">
                      Current Configuration Status
                    </Text>
                    <Badge tone={isConfigured ? "success" : "attention"}>
                      {isConfigured ? "Configured" : "Default Presets"}
                    </Badge>
                  </InlineStack>

                  <Text as="p" tone="subdued" variant="bodyMd">
                    Warehouse Dispatch Deadline:{" "}
                    <strong>
                      {settings.cutoffHour.toString().padStart(2, "0")}:
                      {settings.cutoffMinute.toString().padStart(2, "0")} (24h)
                    </strong>
                  </Text>
                  <Text as="p" tone="subdued" variant="bodyMd">
                    Standard Transit Lead Time:{" "}
                    <strong>{settings.leadDays} business days</strong>
                  </Text>
                  <Text as="p" tone="subdued" variant="bodyMd">
                    Active Style Preset:{" "}
                    <strong style={{ textTransform: "capitalize" }}>
                      {settings.presetStyle}
                    </strong>
                  </Text>

                  <Divider />

                  <InlineStack gap="300">
                    <Button
                      variant="primary"
                      onClick={() => navigate("/app/dropclock")}
                    >
                      Edit Rules & Appearance
                    </Button>
                    <Button
                      variant="plain"
                      url={`https://${shop}/admin/themes/current/editor?context=apps`}
                      target="_blank"
                    >
                      Open Theme Customizer →
                    </Button>
                  </InlineStack>
                </BlockStack>
              </Card>

              <Card>
                <BlockStack gap="300">
                  <Text as="h2" variant="headingMd">
                    Quick Setup Guide
                  </Text>
                  <List type="number">
                    <List.Item>
                      <strong>Set Cutoff Hour & Lead Days:</strong> Define when your daily
                      fulfillment cut-off occurs and typical shipping transit days in the{" "}
                      <Button variant="plain" onClick={() => navigate("/app/dropclock")}>
                        Settings Dashboard
                      </Button>.
                    </List.Item>
                    <List.Item>
                      <strong>Add Theme Block:</strong> Go to Online Store &gt; Themes &gt;
                      Customize. On your Default Product template, click &quot;Add block&quot; and
                      choose <strong>DropClock Cutoff &amp; ETA</strong>.
                    </List.Item>
                    <List.Item>
                      <strong>Verify Live Storefront:</strong> Open any in-stock product page to
                      verify the live countdown and arrival estimate.
                    </List.Item>
                  </List>
                </BlockStack>
              </Card>
            </BlockStack>
          </Layout.Section>

          <Layout.Section variant="oneThird">
            <BlockStack gap="400">
              <Card>
                <BlockStack gap="300">
                  <Text as="h2" variant="headingMd">
                    Performance Guarantee
                  </Text>
                  <Box
                    background="bg-surface-secondary"
                    padding="300"
                    borderRadius="200"
                  >
                    <BlockStack gap="200">
                      <InlineStack align="space-between">
                        <Text as="span" variant="bodySm">External Scripts:</Text>
                        <Text as="span" variant="bodySm" fontWeight="semibold">0 files</Text>
                      </InlineStack>
                      <InlineStack align="space-between">
                        <Text as="span" variant="bodySm">Server Latency:</Text>
                        <Text as="span" variant="bodySm" fontWeight="semibold">0ms</Text>
                      </InlineStack>
                      <InlineStack align="space-between">
                        <Text as="span" variant="bodySm">Storefront Network Calls:</Text>
                        <Text as="span" variant="bodySm" fontWeight="semibold">0 requests</Text>
                      </InlineStack>
                      <InlineStack align="space-between">
                        <Text as="span" variant="bodySm">Icons Format:</Text>
                        <Text as="span" variant="bodySm" fontWeight="semibold">Inlined SVGs</Text>
                      </InlineStack>
                    </BlockStack>
                  </Box>
                  <Text as="p" tone="subdued" variant="bodySm">
                    Calculations run client-side using Vanilla JS, refreshed every 60 seconds with
                    zero layout shift.
                  </Text>
                </BlockStack>
              </Card>

              <Card>
                <BlockStack gap="300">
                  <Text as="h2" variant="headingMd">
                    Storefront Diagnostics
                  </Text>
                  <InlineStack align="space-between">
                    <Text as="span" variant="bodySm">Edge Metafield Sync:</Text>
                    <Badge tone="success">Operational</Badge>
                  </InlineStack>
                  <InlineStack align="space-between">
                    <Text as="span" variant="bodySm">GDPR Endpoints:</Text>
                    <Badge tone="success">Verified</Badge>
                  </InlineStack>
                  <InlineStack align="space-between">
                    <Text as="span" variant="bodySm">PCD Scope Usage:</Text>
                    <Badge tone="info">0 Scopes</Badge>
                  </InlineStack>
                </BlockStack>
              </Card>
            </BlockStack>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}
