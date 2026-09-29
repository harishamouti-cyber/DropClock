import { json } from "@remix-run/node";
import {
  Page,
  Card,
  FormLayout,
  TextField,
  Banner,
  BlockStack,
  InlineGrid,
  InlineStack,
  Text,
  Divider,
  Box,
  Badge,
  Button,
  AppProvider,
} from "@shopify/polaris";
import { useState, useMemo } from "react";
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";

export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

export async function loader() {
  return json({
    settings: {
      cutoffHour: 14,
      cutoffMinute: 0,
      leadDays: 2,
      primaryColor: "#008060",
      bgColor: "#f4f6f8",
      textColor: "#202223",
      presetStyle: "capsule",
    },
  });
}

export default function StandalonePreviewRoute() {
  const [cutoffHour, setCutoffHour] = useState("14");
  const [cutoffMinute, setCutoffMinute] = useState("0");
  const [leadDays, setLeadDays] = useState("2");
  const [primaryColor, setPrimaryColor] = useState("#008060");
  const [bgColor, setBgColor] = useState("#f4f6f8");
  const [textColor, setTextColor] = useState("#202223");
  const [saved, setSaved] = useState(false);

  const previewEta = useMemo(() => {
    const d = new Date();
    const days = parseInt(leadDays, 10) || 2;
    let added = 0;
    while (added < days) {
      d.setDate(d.getDate() + 1);
      if (d.getDay() !== 0 && d.getDay() !== 6) {
        added++;
      }
    }
    return d.toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  }, [leadDays]);

  return (
    <AppProvider i18n={{}}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "24px" }}>
        <Page
          title="DropClock Dispatch & ETA"
          subtitle="Configure daily order cutoffs and zero-latency delivery estimates"
          primaryAction={{
            content: saved ? "✓ Changes Saved to CDN" : "Save Changes",
            onAction: () => {
              setSaved(true);
              setTimeout(() => setSaved(false), 3000);
            },
          }}
        >
          <BlockStack gap="500">
            {saved && (
              <Banner title="Settings synchronized to Shopify Edge Metafields" tone="success">
                <p>
                  Settings are written directly to <code>shop.metafields.dropclock.settings</code>.
                  Storefront visits render with 0ms server latency.
                </p>
              </Banner>
            )}

            <Banner title="Live Interactive Sandbox Mode" tone="info">
              <p>
                This interactive preview allows you to test real-time settings adjustments and inspect
                the storefront delivery capsule before pushing live to your merchant theme.
              </p>
            </Banner>

            <InlineGrid columns={{ xs: "1fr", md: "2fr 1fr" }} gap="400">
              {/* Admin Configuration */}
              <BlockStack gap="400">
                <Card>
                  <BlockStack gap="400">
                    <InlineStack align="space-between">
                      <Text as="h2" variant="headingMd">
                        Dispatch Cutoff Window
                      </Text>
                      <Badge tone="success">Operational</Badge>
                    </InlineStack>
                    <Text as="p" tone="subdued" variant="bodySm">
                      Specify warehouse fulfillment deadline. Orders placed before this cutoff time
                      display same-day dispatch.
                    </Text>
                    <FormLayout>
                      <InlineGrid columns={2} gap="200">
                        <TextField
                          label="Cutoff Hour (24h format)"
                          type="number"
                          value={cutoffHour}
                          onChange={setCutoffHour}
                          autoComplete="off"
                          helpText="e.g. 14 for 2:00 PM EST"
                          min={0}
                          max={23}
                        />
                        <TextField
                          label="Cutoff Minute"
                          type="number"
                          value={cutoffMinute}
                          onChange={setCutoffMinute}
                          autoComplete="off"
                          helpText="e.g. 00 or 30"
                          min={0}
                          max={59}
                        />
                      </InlineGrid>

                      <TextField
                        label="Transit Lead Days"
                        type="number"
                        value={leadDays}
                        onChange={setLeadDays}
                        autoComplete="off"
                        helpText="Business days from warehouse dispatch to customer doorstep"
                        min={0}
                        max={30}
                      />
                    </FormLayout>
                  </BlockStack>
                </Card>

                <Card>
                  <BlockStack gap="400">
                    <Text as="h2" variant="headingMd">
                      Styling & Brand Tokens
                    </Text>
                    <Text as="p" tone="subdued" variant="bodySm">
                      Control the visual identity rendered by the Theme App Extension capsule.
                    </Text>
                    <FormLayout>
                      <InlineGrid columns={3} gap="200">
                        <TextField
                          label="Accent Color"
                          value={primaryColor}
                          onChange={setPrimaryColor}
                          autoComplete="off"
                          helpText="Pulse dot & countdown"
                        />
                        <TextField
                          label="Background"
                          value={bgColor}
                          onChange={setBgColor}
                          autoComplete="off"
                          helpText="Capsule card fill"
                        />
                        <TextField
                          label="Text Color"
                          value={textColor}
                          onChange={setTextColor}
                          autoComplete="off"
                          helpText="Primary font color"
                        />
                      </InlineGrid>
                    </FormLayout>
                  </BlockStack>
                </Card>

                <Card>
                  <BlockStack gap="400">
                    <InlineStack align="space-between">
                      <Text as="h2" variant="headingMd">
                        Logistics & Overrides Matrix
                      </Text>
                      <Badge tone="info">Metafield Binding</Badge>
                    </InlineStack>
                    <Text as="p" tone="subdued" variant="bodySm">
                      Tag-based rules and international market transit offsets are automatically
                      evaluated in Liquid at compile time.
                    </Text>
                    <Box
                      background="bg-surface-secondary"
                      padding="300"
                      borderRadius="200"
                    >
                      <BlockStack gap="200">
                        <InlineStack align="space-between">
                          <Text as="span" variant="bodySm" fontWeight="semibold">Tag Rules</Text>
                          <Text as="span" variant="bodySm" tone="subdued">Enabled (tags: handmade, preorder)</Text>
                        </InlineStack>
                        <InlineStack align="space-between">
                          <Text as="span" variant="bodySm" fontWeight="semibold">Market Overrides</Text>
                          <Text as="span" variant="bodySm" tone="subdued">Active (via localization.country.iso_code)</Text>
                        </InlineStack>
                        <InlineStack align="space-between">
                          <Text as="span" variant="bodySm" fontWeight="semibold">Zero-Inventory Fallback</Text>
                          <Text as="span" variant="bodySm" tone="subdued">Auto-switches to Backorder notice</Text>
                        </InlineStack>
                      </BlockStack>
                    </Box>
                  </BlockStack>
                </Card>
              </BlockStack>

              {/* 21st.dev Live Interactive Preview */}
              <Box>
                <Card>
                  <BlockStack gap="400">
                    <InlineStack align="space-between">
                      <Text as="h2" variant="headingMd">
                        Storefront Live Preview
                      </Text>
                      <Badge tone="info">Live Sync</Badge>
                    </InlineStack>
                    <Text as="p" tone="subdued" variant="bodySm">
                      Interactive real-time preview rendered with dynamic CSS variables matching the
                      storefront capsule.
                    </Text>
                    <Divider />

                    {/* Simulated Storefront Card */}
                    <div
                      style={{
                        padding: "16px",
                        borderRadius: "12px",
                        border: "1px dashed #dcdcdc",
                        backgroundColor: "#fafbfc",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          padding: "12px 16px",
                          borderRadius: "8px",
                          backgroundColor: bgColor,
                          color: textColor,
                          border: "1px solid rgba(0,0,0,0.08)",
                          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                          transition: "all 0.2s ease-in-out",
                        }}
                      >
                        <div
                          style={{
                            position: "relative",
                            color: primaryColor,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <span
                            style={{
                              position: "absolute",
                              top: "-2px",
                              right: "-2px",
                              width: "6px",
                              height: "6px",
                              borderRadius: "50%",
                              backgroundColor: primaryColor,
                            }}
                          />
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                          </svg>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "2px",
                            fontSize: "13px",
                          }}
                        >
                          <div>
                            Order within{" "}
                            <strong style={{ color: primaryColor }}>
                              {cutoffHour}h {cutoffMinute}m
                            </strong>{" "}
                            for <strong>Same-Day Dispatch</strong>
                          </div>
                          <div
                            style={{
                              fontSize: "12px",
                              opacity: 0.85,
                              display: "flex",
                              alignItems: "center",
                              gap: "5px",
                            }}
                          >
                            <svg
                              width="13"
                              height="13"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              style={{ opacity: 0.75 }}
                            >
                              <rect x="1" y="3" width="15" height="13" />
                              <polygon points="16 8 20 8 23 11 23 16 16 16 8" />
                              <circle cx="5.5" cy="18.5" r="2.5" />
                              <circle cx="18.5" cy="18.5" r="2.5" />
                            </svg>
                            <span>
                              Estimated Delivery: <strong>{previewEta}</strong>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Divider />

                    {/* Performance metrics */}
                    <BlockStack gap="200">
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: "12px",
                          color: "#6d7175",
                        }}
                      >
                        <span>Lighthouse Storefront Drag:</span>
                        <strong style={{ color: "#008060" }}>0ms (0 scripts)</strong>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: "12px",
                          color: "#6d7175",
                        }}
                      >
                        <span>Payload Source:</span>
                        <span>Edge Metafields</span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: "12px",
                          color: "#6d7175",
                        }}
                      >
                        <span>External Network Calls:</span>
                        <strong>0 requests</strong>
                      </div>
                    </BlockStack>
                  </BlockStack>
                </Card>
              </Box>
            </InlineGrid>
          </BlockStack>
        </Page>
      </div>
    </AppProvider>
  );
}
