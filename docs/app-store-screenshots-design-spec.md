# DropClock — Shopify App Store Screenshot Creative Direction & Design Specifications
**Resolution:** 1600 × 900 px (16:9 Landscape) · **Target:** Shopify App Store Listing (5 Core Carousel Slides) · **Design System:** Polaris 2026 / Shopify Pine Dark

---

## Global Design Language & Theme Standards

- **Canvas Size:** 1600 × 900 px (Exported at 2x: 3200 × 1800 px for ultra-sharp Retina displays).
- **Core Color Palette:**
  - **Shopify Pine / Emerald:** `#008060` (Primary brand accent, progress bars, active badges)
  - **Deep Slate / Obsidian Background:** Radial gradient from `rgb(13, 61, 44)` (top-right highlight) to `rgb(6, 25, 18)` (mid) to `rgb(3, 13, 9)` (deep base)
  - **Card Surface:** `#FFFFFF` with `box-shadow: 0 24px 48px -12px rgba(0, 0, 0, 0.35)` and `border: 1px solid rgba(255, 255, 255, 0.15)`
  - **Text Primary (on dark):** `#FFFFFF` (Weight: 800 ExtraBold for headlines)
  - **Text Secondary (on dark):** `#94A3B8` / `#CBD5E1` (Weight: 400 Regular for sub-copy)
  - **Text Primary (on light cards):** `#0F172A` (Weight: 700 Bold for UI headers)
- **Safe Zone:** 60px padding on all edges to ensure zero clipping on mobile App Store carousels.

---

## Screenshot 1: The High-Urgency PDP Countdown (Core Value)

### 1. Headline & Copy
- **Benefit Headline (Max 5 Words):** `Turn Browsers Into Buyers`
- **Supporting Sub-copy (1 Sentence):** `Dynamic same-day dispatch countdowns create authentic purchase urgency right at the moment of decision.`
- **Pill Tag:** `LIVE ON PRODUCT PAGES`

### 2. Visual Composition & Layout
- **Layout Split:**
  - **Left 42% (Typography Column):**
    - Category Tag: `STOREFRONT CONVERSION ENGINE` in `#10B981` (tracking +0.1em, 13px uppercase)
    - Headline: `Turn Browsers Into Buyers` (52px ExtraBold, line-height 1.15)
    - Sub-copy: 19px `#94A3B8`, line-height 1.5
    - Feature Bullets:
      - ⚡ *Real-Time Cutoff Stepper (Hours & Minutes)*
      - 📦 *Dynamic Calendar Delivery ETA Calculation*
      - 🎨 *100% Brand Token & CSS Typography Matching*
  - **Right 58% (Multi-Device Storefront Mockup):**
    - Desktop browser card floating at `rotateY(-8deg) rotateX(4deg)` with ambient emerald glow behind it (`#008060` with 60px blur).
    - Nested Mobile iPhone viewport overlay (375 × 667 scaled) overlapping the bottom-right corner at `rotateZ(-2deg)` to show responsive mobile parity.

### 3. Detailed UI Focus & Micro-Copy
- **Desktop PDP Mockup:**
  - Product: *Classic Boxy Crewneck — Charcoal Gray* (`$42.00`)
  - Variant selector: `[ S ] [ M (Selected) ] [ L ] [ XL ]`
  - **DropClock Countdown Capsule (Directly above "Add to Cart"):**
    - Background: `#F0FDF4` (Emerald-50) with 1px border `#BBF7D0`
    - Icon: Pulsing emerald clock mark (`#008060`)
    - Primary Text: `Order within 2h 15m for same-day dispatch` (Bold `#0F172A`, timer in `#008060`)
    - ETA Sub-line: `⚡ Dispatches Today · Estimated Delivery: Wednesday, Oct 7` (`#047857`)
  - Action Button: Full-width black `#000000` "Add to Cart" button with bold white text.

### 4. Floating Callout Badge
- Frosted glass callout anchored with an emerald indicator line to the capsule:
  - Text: `Zero-CLS Injection · Renders with 0ms visual shift`

---

## Screenshot 2: Cart Drawer Free Shipping Upsell (AOV Booster)

### 1. Headline & Copy
- **Benefit Headline (Max 5 Words):** `Boost Average Order Value`
- **Supporting Sub-copy (1 Sentence):** `Motivate shoppers to add more items with real-time free express delivery tiers and live subtotal sync.`
- **Pill Tag:** `SLIDE-OUT CART DRAWER`

### 2. Visual Composition & Layout
- **Layout Split:**
  - **Left 40% (Typography Column):**
    - Category Tag: `AOV & CART EXPANSION` in `#10B981`
    - Headline: `Boost Average Order Value` (52px ExtraBold)
    - Sub-copy: `Motivate shoppers to add more items with real-time free express delivery tiers.`
    - Highlight Badges: `+18.4% Average Order Value lift observed across pilot stores`
  - **Right 60% (Full Slide-Out Cart Mockup):**
    - Centered, high-contrast slide-out cart drawer overlay (`width: 520px`) floating against a dark backdrop with subtle glassmorphic backdrop filter (`blur(20px)`).

### 3. Detailed UI Focus & Micro-Copy
- **Cart Drawer Header:**
  - `Your Cart (2 items)` with close cross icon.
- **Dynamic Tier Progress Bar (Prominently Highlighted with Glow):**
  - Banner Box: `#F8FAFC` rounded container with subtle border `#E2E8F0`.
  - Copy: `Add $14.05 more to unlock Free Express Delivery` (`$14.05` highlighted in `#008060` bold).
  - Progress Bar Track: `#E2E8F0` track with smooth `#008060` (Shopify Pine) fill bar at **81% width**.
  - Real-time notification tag below: `⚡ 81% Reached — Order within 2h 40m for same-day dispatch`
- **Line Items:**
  - Item 1: *Classic Boxy Crewneck* · `$42.00`
  - Item 2: *Merino Wool Ribbed Socks* · `$18.95`
- **Order Breakdown:**
  - Subtotal: `$60.95`
  - Standard Delivery: `$5.99`
  - Total: `$66.94`
  - Checkout Button: `#008060` emerald button reading `Checkout · $66.94 →`

### 4. Floating Callout Badge
- Glassmorphic card callout pointing to the progress bar:
  - Icon: 📈
  - Headline: `Multi-Tier Dynamic Thresholds`
  - Copy: `Set $50, $75, or $100 tiers with automatic currency matching`

---

## Screenshot 3: DropClock Studio Control Center (Simplicity)

### 1. Headline & Copy
- **Benefit Headline (Max 5 Words):** `Granular Fulfillment Control`
- **Supporting Sub-copy (1 Sentence):** `Set cutoff hours, lead times, and operating schedules in under 60 seconds with live preview sandboxing.`
- **Pill Tag:** `EMBEDDED POLARIS STUDIO`

### 2. Visual Composition & Layout
- **Layout Split:**
  - **Top Bar (Full Width Header Strip):**
    - App Header: `DropClock: Built for Shopify Native Admin Experience`
    - Headline: `Granular Fulfillment Control` (48px ExtraBold, centered or aligned left with 24px sub-copy)
  - **Center & Bottom (Split Admin Dashboard Workspace):**
    - An elevated, ultra-crisp mockup of the DropClock Studio interface (`width: 1400px`, `height: 640px`) floating over an ambient obsidian matrix.

### 3. Detailed UI Focus & Micro-Copy
- **Admin Navigation Bar:**
  - Official DropClock SVG Logo + `DropClock Studio`
  - Badges: `[ Dawn 15.0 (Active) ]` (Emerald) and `[ Settings Synced ]` (Slate)
  - Primary Action: `[ Add to Theme Editor ]` button (Emerald solid)
- **Left Sidebar Controls (Configuration Panel):**
  - Card 1: **Daily Dispatch Cutoff**
    - Stepper set to: `14:00` (2:00 PM EST)
    - Explanatory caption: *"Orders before 14:00 ship today. Orders after roll to next business day."*
  - Card 2: **Operating Days & Transit Lead Time**
    - Day Selector: `[M] [T] [W] [T] [F]` active in emerald; `[S] [S]` inactive in gray.
    - Transit Lead Time: Slider set to `2 Business Days`.
  - Card 3: **Free Shipping Threshold**
    - Input: `$75.00 USD`
- **Right Sandbox (Live Storefront Preview Canvas):**
  - Surface Selector Tabs: `[ Product Page (Active) ] [ Cart Drawer ] [ Order Status ]`
  - Live preview widget rendering the exact calculated ETA: `Order within 2h 15m · Delivered Wednesday, Oct 7`.

### 4. Floating Callout Badge
- Emerald badge hovering over the operating days selector:
  - `Smart Calendar Math: Skips non-working weekends & warehouse blackout dates automatically`

---

## Screenshot 4: Post-Purchase SLA & Trust (Retention)

### 1. Headline & Copy
- **Benefit Headline (Max 5 Words):** `Build Unmatched Delivery Trust`
- **Supporting Sub-copy (1 Sentence):** `Eliminate "Where is my order?" support tickets with clear, automated post-purchase fulfillment tracking.`
- **Pill Tag:** `ORDER STATUS & THANK YOU PAGE`

### 2. Visual Composition & Layout
- **Layout Split:**
  - **Left 42% (Typography Column):**
    - Category Tag: `POST-PURCHASE RETENTION` in `#10B981`
    - Headline: `Build Unmatched Delivery Trust` (52px ExtraBold)
    - Sub-copy: `Eliminate "Where is my order?" support tickets with clear fulfillment tracking.`
    - Metrics Callout:
      - `↓ 42% WISMO Support Inquiries` (Where Is My Order)
      - `↑ 99.4% On-Time Delivery Expectation Accuracy`
  - **Right 58% (Thank You Page Order Confirmation Card):**
    - Clean Shopify Thank You page container (`width: 600px`) featuring the order confirmation banner and the DropClock 3-step SLA fulfillment tracker.

### 3. Detailed UI Focus & Micro-Copy
- **Order Header:**
  - `Order #1084 Confirmed · Thank you, Alexander!`
  - Sub-text: `A confirmation email has been sent to alexander@example.com`
- **DropClock 3-Step Geometric Status Tracker:**
  - **Step 1 (Order Placed):**
    - Circle: Solid green checkmark badge `✓` (`#10B981`)
    - Label: `Order Placed`
    - Timestamp: `Today, 10:24 AM`
    - Connector Line: Solid green connector bar to Step 2.
  - **Step 2 (Dispatched Today):**
    - Circle: Emerald pulsing clock indicator (`#008060`) with animated pulse ring.
    - Label: `Dispatched Today by 14:00`
    - Timestamp: `Packaging in warehouse`
    - Connector Line: Dashed zinc connector bar to Step 3.
  - **Step 3 (Estimated Arrival):**
    - Circle: Neutral transit plane/truck icon in soft slate `#64748B`.
    - Label: `Estimated Arrival`
    - Date: **Wednesday, Oct 7** (Bold `#0F172A`)
- **Carrier Guarantee Tag:**
  - `Carrier tracking number and delivery SMS will be dispatched automatically once scanned.`

### 4. Floating Callout Badge
- Frosted glass callout with checkmark:
  - `Zero Customer Anxiety · Transparent fulfillment SLAs from checkout to doorstep`

---

## Screenshot 5: 1-Click Theme Integration & Zero CLS (Performance)

### 1. Headline & Copy
- **Benefit Headline (Max 5 Words):** `Zero Code. Zero Slowdown.`
- **Supporting Sub-copy (1 Sentence):** `100% Theme App Extension with zero layout shift (CLS), sub-5KB payload, and clean 1-click uninstallation.`
- **Pill Tag:** `BUILT FOR SHOPIFY COMPLIANT`

### 2. Visual Composition & Layout
- **Layout Split:**
  - **Left 42% (Typography Column):**
    - Category Tag: `THEME ARCHITECTURE & SPEED` in `#10B981`
    - Headline: `Zero Code. Zero Slowdown.` (52px ExtraBold)
    - Sub-copy: `100% Theme App Extension with zero layout shift (CLS) and clean uninstall.`
    - Performance KPI Cards:
      - 🚀 `Sub-5KB Payload` — Vanilla JavaScript with zero external dependencies
      - ⚡ `Zero CLS` — Pre-allocated CSS height prevents annoying layout shift
      - 🛡️ `Zero Code Leftovers` — Completely removed when uninstalled
  - **Right 58% (Dawn Theme Customizer & Speed Inspector View):**
    - Mockup of the Shopify Online Store 2.0 Theme Editor sidebar alongside a Google Lighthouse Performance gauge showing a green **99** score.

### 3. Detailed UI Focus & Micro-Copy
- **Shopify Theme Customizer Sidebar:**
  - Section: `Product Information`
  - Block Hierarchy:
    - ▾ Title
    - ▾ Price
    - ▾ Variant Picker
    - 🟢 **DropClock Countdown Pill** (Active, highlighted with an emerald selection ring)
    - ▾ Buy Buttons
- **Inspector Block Settings:**
  - Display Style: `[ Capsule Pill ▾ ]`
  - Show Cutoff Timer: `[ Checked ✓ ]`
  - Show Estimated Arrival: `[ Checked ✓ ]`
- **Floating Lighthouse Performance Badge (Top-Right):**
  - Circular Green Speedometer: `99` (Performance)
  - Scores: `FCP: 0.4s · LCP: 0.8s · CLS: 0.000`

### 4. Floating Callout Badge
- Frosted glass shield badge:
  - `Built for Shopify Certified · Zero theme.liquid modifications guaranteed`

---

## Summary Table: App Store Carousel Sequencing

| Slide # | Headline (Max 5 Words) | Core Objective | Key Visual Element |
| :---: | :--- | :--- | :--- |
| **01** | `Turn Browsers Into Buyers` | Core Purchase Urgency | Storefront PDP countdown capsule above Add to Cart |
| **02** | `Boost Average Order Value` | AOV Expansion | Slide-out cart drawer Free Shipping progress bar (81%) |
| **03** | `Granular Fulfillment Control` | Ease of Setup | Polaris admin studio with cutoff steppers & active days |
| **04** | `Build Unmatched Delivery Trust` | Post-Purchase Retention | 3-step geometric order status timeline tracker |
| **05** | `Zero Code. Zero Slowdown.` | Performance & BFS Quality | Theme Editor app block & Lighthouse 99 Performance gauge |
