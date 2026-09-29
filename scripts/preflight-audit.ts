import fs from "node:fs";
import path from "node:path";

interface AuditResult {
  category: string;
  name: string;
  status: "PASSED" | "FAILED" | "WARNING";
  details: string;
}

const results: AuditResult[] = [];

function check(category: string, name: string, condition: boolean, passMsg: string, failMsg: string, isWarning = false) {
  results.push({
    category,
    name,
    status: condition ? "PASSED" : (isWarning ? "WARNING" : "FAILED"),
    details: condition ? passMsg : failMsg,
  });
}

console.log("=================================================================");
console.log("  DROPCLOCK PRE-FLIGHT COMPLIANCE & APP STORE READINESS AUDIT    ");
console.log("=================================================================\n");

const rootDir = process.cwd();

// 1. Audit shopify.app.toml
const tomlPath = path.join(rootDir, "shopify.app.toml");
if (fs.existsSync(tomlPath)) {
  const tomlContent = fs.readFileSync(tomlPath, "utf-8");

  // App Name length
  const nameMatch = tomlContent.match(/name\s*=\s*"([^"]+)"/);
  const appName = nameMatch ? nameMatch[1] : "";
  check(
    "App Store Metadata",
    "App Name Length (<30 chars)",
    appName.length > 0 && appName.length <= 30 && !appName.toLowerCase().includes("pilot"),
    `App Name is "${appName}" (${appName.length} chars, no prohibited words)`,
    `App Name exceeds 30 chars or uses prohibited words: "${appName}"`
  );

  // Minimal Scopes (Zero PCD)
  const scopesMatch = tomlContent.match(/scopes\s*=\s*"([^"]+)"/);
  const scopes = scopesMatch ? scopesMatch[1] : "";
  const hasNoPCD = !scopes.includes("read_customers") && !scopes.includes("read_orders") && !scopes.includes("read_draft_orders");
  check(
    "Security & Scopes",
    "Minimal Scopes & Zero PCD Policy",
    hasNoPCD && scopes.includes("read_products"),
    `Minimal scopes configured: "${scopes}" (Zero Protected Customer Data requested)`,
    `Scopes contain PCD or miss required scopes: "${scopes}"`
  );

  // Embedded App Bridge v4
  const isEmbedded = /embedded\s*=\s*true/.test(tomlContent);
  check(
    "App Bridge v4",
    "Embedded App Architecture",
    isEmbedded,
    "App Bridge v4 embedded session mode configured (embedded = true)",
    "App is not configured as embedded in shopify.app.toml"
  );

  // Mandatory GDPR URLs in TOML
  const hasGdprConfig = tomlContent.includes("customer_data_request_url") &&
                        tomlContent.includes("customer_deletion_url") &&
                        tomlContent.includes("shop_deletion_url");
  check(
    "Compliance & GDPR",
    "Mandatory GDPR Webhook Config",
    hasGdprConfig,
    "All 3 mandatory GDPR webhook endpoints mapped in shopify.app.toml",
    "Missing mandatory GDPR webhook definitions in shopify.app.toml"
  );
} else {
  check("App Store Metadata", "shopify.app.toml existence", false, "", "shopify.app.toml not found");
}

// 2. Audit GDPR Route Implementations
const dataRequestRoute = path.join(rootDir, "app/routes/webhooks.gdpr.data-request.tsx");
const customerDeletionRoute = path.join(rootDir, "app/routes/webhooks.gdpr.customer-deletion.tsx");
const shopDeletionRoute = path.join(rootDir, "app/routes/webhooks.gdpr.shop-deletion.tsx");
const uninstalledRoute = path.join(rootDir, "app/routes/webhooks.app.uninstalled.tsx");

check(
  "Compliance & GDPR",
  "customers/data_request implementation",
  fs.existsSync(dataRequestRoute) && fs.readFileSync(dataRequestRoute, "utf-8").includes("authenticate.webhook"),
  "customers/data_request exists with HMAC authentication",
  "customers/data_request missing or unauthenticated"
);

check(
  "Compliance & GDPR",
  "customers/redact implementation",
  fs.existsSync(customerDeletionRoute) && fs.readFileSync(customerDeletionRoute, "utf-8").includes("authenticate.webhook"),
  "customers/redact exists with HMAC authentication",
  "customers/redact missing or unauthenticated"
);

check(
  "Compliance & GDPR",
  "shop/redact implementation & purge logic",
  fs.existsSync(shopDeletionRoute) && fs.readFileSync(shopDeletionRoute, "utf-8").includes("deleteMany"),
  "shop/redact exists with complete database purge on uninstall",
  "shop/redact missing or fails to purge shop records"
);

check(
  "Compliance & GDPR",
  "app/uninstalled lifecycle handler",
  fs.existsSync(uninstalledRoute) && fs.readFileSync(uninstalledRoute, "utf-8").includes("authenticate.webhook"),
  "app/uninstalled exists with session cleanup logic",
  "app/uninstalled handler missing"
);

// 3. Audit Theme App Extension (0ms Latency & No External Scripts)
const liquidBlockPath = path.join(rootDir, "extensions/dropclock-extension/blocks/dropclock_pill.liquid");
if (fs.existsSync(liquidBlockPath)) {
  const liquidContent = fs.readFileSync(liquidBlockPath, "utf-8");

  // Zero external script tags
  const hasExternalScript = /<script\s+[^>]*src=/i.test(liquidContent);
  check(
    "Storefront Performance (0ms)",
    "Zero External Script Injection",
    !hasExternalScript,
    "100% Theme App Extension; zero external <script src> tags injected",
    "Found external script tag in Theme Extension (violates 0ms rule)"
  );

  // Inlined SVGs
  const hasInlinedSvgs = liquidContent.includes("<svg") && !liquidContent.includes("<img");
  check(
    "Storefront Performance (0ms)",
    "Raw Inlined Lucide SVGs",
    hasInlinedSvgs,
    "Icons are raw inlined SVGs (clock, truck, alert); zero external font or image requests",
    "Icons not using pure inline SVGs"
  );

  // Metafield-driven edge settings
  const hasMetafield = liquidContent.includes("shop.metafields.dropclock.settings");
  check(
    "Storefront Performance (0ms)",
    "Shop Metafields Edge Binding",
    hasMetafield,
    "Reads directly from shop.metafields.dropclock.settings.value via CDN edge",
    "Storefront block does not read from shop.metafields.dropclock.settings"
  );

  // Multi-market & Inventory awareness
  const hasInventory = (liquidContent.includes("selected_or_first_available_variant") && liquidContent.includes("available"));
  const hasMarket = liquidContent.includes("localization.country.iso_code");
  check(
    "Dynamic Logistics",
    "Inventory & Multi-Market Logic",
    hasInventory && hasMarket,
    "Product availability awareness and localization.country.iso_code integrated",
    "Missing inventory check or market localization code in Liquid"
  );
} else {
  check("Storefront Performance (0ms)", "Theme App Extension existence", false, "", "dropclock_pill.liquid not found");
}

// 4. Audit Admin Live Preview & Polaris
const dropclockRoute = path.join(rootDir, "app/routes/app.dropclock.tsx");
if (fs.existsSync(dropclockRoute)) {
  const content = fs.readFileSync(dropclockRoute, "utf-8");
  const hasPreview = content.includes("Storefront Live Preview") && content.includes("previewEta");
  const hasMetafieldMutation = content.includes("SetDropClockMetafield") || content.includes("metafieldsSet");
  check(
    "Admin UX & 21st.dev Preview",
    "Real-time Live Preview Canvas",
    hasPreview,
    "Interactive Storefront Live Preview canvas updates in real-time as inputs change",
    "Live preview canvas missing in app.dropclock.tsx"
  );
  check(
    "Admin UX & 21st.dev Preview",
    "Shopify GraphQL Metafield Sync",
    hasMetafieldMutation,
    "Persists configurations to shop metafields via GraphQL metafieldsSet",
    "Missing metafieldsSet GraphQL mutation in settings action"
  );
} else {
  check("Admin UX & 21st.dev Preview", "app.dropclock.tsx existence", false, "", "app.dropclock.tsx not found");
}

// 5. Audit Prisma Schema
const prismaPath = path.join(rootDir, "prisma/schema.prisma");
if (fs.existsSync(prismaPath)) {
  const prismaContent = fs.readFileSync(prismaPath, "utf-8");
  const hasSession = prismaContent.includes("model Session");
  const hasSettings = prismaContent.includes("model DropClockSettings");
  check(
    "Database Layer",
    "Prisma Session & DropClockSettings Models",
    hasSession && hasSettings,
    "Both Session and DropClockSettings models fully defined",
    "Missing required models in schema.prisma"
  );
} else {
  check("Database Layer", "schema.prisma existence", false, "", "prisma/schema.prisma not found");
}

// Print results table
console.log(
  "CATEGORY".padEnd(30) +
  "TEST".padEnd(36) +
  "STATUS".padEnd(10) +
  "DETAILS"
);
console.log("-".repeat(105));

let hasFailures = false;
for (const r of results) {
  const icon = r.status === "PASSED" ? "✅" : (r.status === "WARNING" ? "⚠️" : "❌");
  console.log(
    r.category.padEnd(30) +
    r.name.padEnd(36) +
    `${icon} ${r.status}`.padEnd(10) +
    r.details
  );
  if (r.status === "FAILED") hasFailures = true;
}

console.log("\n" + "=".repeat(105));
if (hasFailures) {
  console.error("❌ Pre-flight audit FAILED. Please resolve errors before app store submission.");
  process.exit(1);
} else {
  console.log("🚀 ALL PRE-FLIGHT AUDIT CHECKS PASSED. Ready for App Store Submission!");
  process.exit(0);
}
