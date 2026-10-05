# DropClock ⏱️📦

> **Order Cutoff Countdown Timer & Estimated Delivery Date ETA**  
> Built for Shopify — 0ms storefront speed drag, 100% Theme App Extension architecture, multi-market aware, tag-based cutoff rules, out-of-stock auto-suppression, zero external network calls.

---

## ⚡ Key Highlights & Architecture

- **0ms Storefront Speed Drag**: 100% Theme App Extension (`dropclock_pill.liquid`). Zero external scripts, zero CDNs, zero `window` global pollution. Reads directly from Shopify CDN shop metafields (`shop.metafields.dropclock.settings`).
- **Warehouse Timezone Synchronization**: Calculates countdown from UTC timestamp + `timezoneOffsetMinutes` queried via Shopify Admin GraphQL.
- **Dynamic Variant Change Listeners**: Instantly detects variant switching and dynamically updates countdown vs backorder notices without a page reload.
- **Sub-4KB Asset Weight**: Entire inline CSS + SVG icons + JavaScript payload weighs only **3.95 KB** uncompressed (strictly under 4 KB).
- **Core Web Vitals Optimized**: Zero layout shifts with pre-allocated bounding box (`min-height: 52px; contain: layout;`).
- **Shopify App Store Ready**:
  - **App Bridge v4** embedded admin dashboard with native `<SaveBar>`.
  - **Shopify Recurring Billing**: $8.99/mo with a 7-day free trial enforced via `@shopify/shopify-app-remix`.
  - **GDPR / CPRA Compliance**: HMAC-authenticated webhooks for `CUSTOMERS_DATA_REQUEST`, `CUSTOMERS_REDACT`, and `SHOP_REDACT` (atomic database purge).
  - **Minimal Scopes**: Only `read_products,write_products`. Zero Protected Customer Data (PCD) requested.

---

## 🚀 Deploying to Vercel (Production)

DropClock is pre-configured for native Vercel Serverless deployment using `@vercel/remix` and Vite.

### Step 1: Import into Vercel
1. Go to [vercel.com/new](https://vercel.com/new).
2. Connect your GitHub account and import **`harishamouti-cyber/DropClock`**.
3. Vercel automatically detects the **Remix** framework and applies the build settings from [`vercel.json`](./vercel.json):
   - **Build Command**: `npx prisma generate && remix vite:build`
   - **Install Command**: `npm install --legacy-peer-deps`

---

### Step 2: Provision a PostgreSQL Database
DropClock requires a managed PostgreSQL instance for multi-tenant merchant sessions and settings.

#### Option A: Vercel Storage (Neon Postgres) — Recommended
1. In your Vercel Project Dashboard, click the **Storage** tab.
2. Click **Create Database** and select **Postgres (Powered by Neon)**.
3. Select your preferred region (match your primary Shopify merchants or US East).
4. Click **Connect to Project**. Vercel will automatically inject `DATABASE_URL` and `POSTGRES_PRISMA_URL` into your environment variables.

#### Option B: External PostgreSQL (Supabase / Neon / RDS)
1. Create a database instance on Supabase or Neon.
2. Copy the pooled connection string (e.g. `postgresql://user:pass@ep-xyz-pooler.us-east-1.neon.tech/dropclock?sslmode=require`).

---

### Step 3: Configure Vercel Environment Variables

In your Vercel Project Dashboard, go to **Settings > Environment Variables** and add:

| Variable Name | Environments | Value / Description |
| :--- | :--- | :--- |
| `NODE_ENV` | Production, Preview | `production` |
| `SHOPIFY_API_KEY` | Production, Preview | Client ID from Shopify Partners Dashboard |
| `SHOPIFY_API_SECRET` | Production, Preview | Client Secret from Shopify Partners Dashboard |
| `SHOPIFY_APP_URL` | Production | `https://your-dropclock-app.vercel.app` (No trailing slash) |
| `SCOPES` | Production, Preview | `read_products,write_products` |
| `DATABASE_URL` | Production, Preview | Your pooled PostgreSQL connection string (auto-filled if using Vercel Postgres) |

---

### Step 4: Push Prisma Database Schema

Once your database is created, push the schema to create the `Session` and `DropClockSettings` tables:

```bash
# From your local terminal with your production DATABASE_URL:
DATABASE_URL="postgresql://user:pass@host/db?sslmode=require" npx prisma db push
```

---

### Step 5: Configure Shopify Partners Dashboard

1. Log in to [Shopify Partners](https://partners.shopify.com/) and navigate to **Apps > DropClock > Configuration**.
2. **App URL**:
   ```text
   https://your-dropclock-app.vercel.app
   ```
3. **Allowed redirection URL(s)**:
   ```text
   https://your-dropclock-app.vercel.app/auth/callback
   https://your-dropclock-app.vercel.app/auth/shopify/callback
   https://your-dropclock-app.vercel.app/api/auth/callback
   ```
4. **Mandatory GDPR Webhook Endpoints**:
   - Customer data request: `https://your-dropclock-app.vercel.app/webhooks`
   - Customer data deletion: `https://your-dropclock-app.vercel.app/webhooks`
   - Shop data deletion: `https://your-dropclock-app.vercel.app/webhooks`

---

### Step 6: Deploy Theme App Extension to Shopify

Deploy the Theme App Extension to Shopify's CDN:

```bash
shopify app deploy
```
This registers the `dropclock_pill` block version in your Shopify Partners account.

---

## 💻 Local Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/harishamouti-cyber/DropClock.git
   cd DropClock
   ```

2. **Install dependencies:**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Set up local environment variables:**
   ```bash
   cp .env.example .env
   ```

4. **Initialize Prisma client & SQLite/Postgres:**
   ```bash
   npx prisma generate
   ```

5. **Start Shopify local development server:**
   ```bash
   npm run dev
   ```

6. **Interactive Live Preview Route (No Shopify store required):**
   Navigate to `http://localhost:3000/preview` to inspect the 21st.dev-inspired live preview canvas and dynamic countdown controls in isolation.

---

## 🧪 Automated Testing & Audit Commands

| Command | Purpose |
| :--- | :--- |
| `npm run test:preflight` | Runs the 15-point Shopify App Store Compliance & Security Audit |
| `npm run test:audit` | Runs the Phase 2 Core Web Vitals, boundary clock, and sub-4KB payload audit |
| `npm run typecheck` | Validates TypeScript definitions with `tsc` |
| `npm run build` | Compiles the client, SSR server bundle, and Vercel artifacts |
| `npm run generate:listing` | Generates all 5 mandatory App Store listing assets in `public/listing/` via Playwright |
| `npm run prisma:seed` | Seeds default settings into PostgreSQL/SQLite for review and dev stores |

---

## 🏪 Shopify App Store Listing Copy & Metadata

Ready-to-paste assets for the Shopify Partners App Store submission form:

### 1. Basic Information
- **App Name**: DropClock
- **Tagline (Max 100 characters)**:
  `Order Cutoff Countdown Timer & Estimated Delivery ETA. Boost conversion with live urgency.`
- **Key Categories**: Conversion, Orders & Shipping, Store Design
- **Pricing**: $8.99/month with a 7-day free trial. Test stores and reviewer accounts are 100% exempt from charges.

### 2. Search Keywords (Tags)
```text
countdown timer, order cutoff, estimated delivery date, delivery countdown, same day delivery, dispatch timer, free shipping bar, urgency timer, cart drawer countdown, transit eta
```

### 3. Key Features (Bullets)
- **Same-Day Dispatch Countdown**: Real-time warehouse cutoff timer synchronized with shop timezone to drive cart urgency.
- **Dynamic Delivery Date ETAs**: Accurate arrival calculations accounting for warehouse handling days, operating schedules, and blackout dates.
- **Cart Drawer Threshold Upsell**: Live progress bar displaying remaining amount needed for Free Express Delivery.
- **100% Theme App Extension**: Embedded via Shopify OS 2.0 blocks — zero ScriptTags, zero theme code contamination, zero layout shifts (0 CLS).
- **Multi-Currency & Locale Aware**: Automatic formatting for USD, EUR, GBP, CAD, AUD, JPY and local visitor date standards.
- **Tag-Based Cutoff Overrides**: Custom lead times for pre-orders, made-to-order, or warehouse-specific product tags.

### 4. Detailed Description (Markdown for App Store)
```markdown
DropClock turns casual browsers into buyers by answering the #1 question shoppers have before checkout: **"When will my order arrive?"**

### ⚡ Drive Immediate Checkout Velocity
Display an honest, real-time countdown timer directly on your product pages and cart drawer showing exactly how many hours and minutes remain for same-day or next-day dispatch.

### 📦 Key Merchant Advantages:
- **Zero Speed Drag**: Built entirely with Shopify Theme App Extensions (`dropclock_pill.liquid`). Zero external scripts, zero remote tracking pixels, and sub-4KB asset payload.
- **Multi-Surface Storefront Coverage**:
  - *Product Pages*: High-converting countdown capsule with live delivery date.
  - *Cart Drawer & Cart Page*: Dynamic threshold progress bar (e.g. "Add $14.05 more to unlock Free Express Delivery").
  - *Post-Purchase SLA Status*: Visual order tracking timeline for customer reassurance.
- **Intelligent Inventory Awareness**: Automatically suppresses countdowns for out-of-stock items and displays customizable backorder or pre-order notices.
- **Global Markets & Blackout Calendar**: Set custom lead times per international country and mark holidays or warehouse closures so arrival dates are always 100% accurate.

DropClock installs in 30 seconds with 1-click theme customizer integration. No code editing required.
```

---

## 🔍 App Reviewer Test Credentials & Verification Guide

For Shopify App Store Reviewers evaluating DropClock:

1. **Automated Reviewer Billing Exemption**:
   - Any test store or store domain containing `myshopify.com`, `test`, `review`, or `demo` automatically bypasses billing charges in `app/shopify.server.ts`.
   - The app launches directly into **DropClock Studio** with complete administrative and preview functionality.
2. **Reviewer Quick Start Guide**:
   - An in-app informational banner (`App Reviewer Quick Start Guide`) is prominently displayed on the Studio dashboard.
   - Click the preview surface tabs (**Product Page**, **Cart Drawer**, **Order Status**) in the header to evaluate all three customer touchpoints.
   - Adjust the cutoff hour or lead days in the left configuration panel to watch immediate live recalculation of the countdown clock and ETA date strings.
   - Toggle between **USD**, **EUR**, **GBP**, **CAD**, and **JPY** in the preview toolbar to verify multi-currency localization.
3. **Database Seeder**:
   - Run `npm run prisma:seed` to populate standard default configurations for automated headless testing.
4. **Clean Unmount Guarantee**:
   - DropClock leaves **zero residual code** in your merchant theme. Uninstalling the app deactivates the Theme App Extension blocks cleanly without any manual cleanup.

---

## 🖼️ App Store Listing Visual Assets

All 5 required high-resolution listing assets are pre-generated in `public/listing/`:

1. `public/listing/app-icon-1200x1200.png` — 1200×1200px App Icon (no pre-rounded corners, emerald brand mark).
2. `public/listing/key-visual-1600x900.png` — 1600×900px High-resolution hero card (under 3MB).
3. `public/listing/screenshot-1-studio-1600x900.png` — 1600×900px DropClock Studio configuration dashboard.
4. `public/listing/screenshot-2-product-1600x900.png` — 1600×900px Storefront product page with live cutoff capsule.
5. `public/listing/screenshot-3-cart-order-1600x900.png` — 1600×900px Cart drawer threshold upsell & post-purchase SLA.

---

## 🛡️ Security & Zero Protected Customer Data (PCD)

DropClock strictly follows Shopify's data minimization principles:
- **No Customer Data Access**: Only requests `read_products,write_products` scopes.
- **Zero ScriptTag Policy**: Zero runtime script injection. All frontend code is bundled directly into the theme extension block and isolated in an IIFE.
- **Clean Uninstall Webhook**: Webhook `APP_UNINSTALLED` marks settings inactive, sets `uninstalledAt`, and purges merchant sessions atomically.
- **Frame-Ancestors Security**: Embedded requests enforce dynamic CSP `frame-ancestors https://${shop} https://admin.shopify.com` with `X-Frame-Options` stripped for App Bridge compatibility.

---

## 📄 License
UNLICENSED — All rights reserved.

