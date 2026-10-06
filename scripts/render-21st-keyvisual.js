import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const outputPath = path.join(process.cwd(), "public/listing/key-visual-1600x900.png");

const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'SF Pro Display', Helvetica, Arial, sans-serif; }
    body {
      width: 1600px;
      height: 900px;
      background: #09090b;
      color: #ffffff;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 60px 80px;
      overflow: hidden;
      position: relative;
    }

    /* 21st.dev Background Ambient Lighting & Micro-Dot Grid */
    .bg-grid {
      position: absolute;
      inset: 0;
      background-image: radial-gradient(rgba(255, 255, 255, 0.07) 1px, transparent 1px);
      background-size: 28px 28px;
      pointer-events: none;
      z-index: 1;
      mask-image: radial-gradient(ellipse 90% 80% at 50% 20%, #000 40%, transparent 90%);
      -webkit-mask-image: radial-gradient(ellipse 90% 80% at 50% 20%, #000 40%, transparent 90%);
    }
    .ambient-glow-top {
      position: absolute;
      top: -100px;
      left: 50%;
      transform: translateX(-50%);
      width: 900px;
      height: 450px;
      background: radial-gradient(circle, rgba(16, 185, 129, 0.16) 0%, transparent 70%);
      filter: blur(60px);
      pointer-events: none;
      z-index: 1;
    }
    .ambient-glow-side {
      position: absolute;
      bottom: -150px;
      right: 100px;
      width: 600px;
      height: 400px;
      background: radial-gradient(circle, rgba(0, 128, 96, 0.18) 0%, transparent 70%);
      filter: blur(80px);
      pointer-events: none;
      z-index: 1;
    }

    /* Top Navigation / Brand Header Bar */
    header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: relative;
      z-index: 2;
    }
    .brand-group {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .brand-logo {
      width: 36px;
      height: 36px;
      background: #008060;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 0 20px rgba(0, 128, 96, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.25);
    }
    .brand-title {
      font-size: 24px;
      font-weight: 800;
      letter-spacing: -0.5px;
      color: #ffffff;
    }
    .header-tagline {
      font-size: 13px;
      font-weight: 500;
      color: #94a3b8;
      letter-spacing: 0.3px;
    }

    /* Main Showcase Canvas (2-Column 21st.dev Bento Architecture) */
    main {
      display: grid;
      grid-template-columns: 520px 1fr;
      gap: 40px;
      align-items: center;
      position: relative;
      z-index: 2;
      margin-top: 20px;
    }

    /* Left Column: Hero Headline & Studio Controls */
    .left-col {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    .headline-group h1 {
      font-size: 46px;
      font-weight: 800;
      line-height: 1.12;
      letter-spacing: -1.2px;
      margin-bottom: 12px;
      background: linear-gradient(180deg, #ffffff 30%, #94a3b8 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .headline-group p {
      font-size: 17px;
      line-height: 1.5;
      color: #94a3b8;
    }

    /* Real DropClock Studio Controls Card */
    .studio-card {
      background: rgba(18, 18, 22, 0.85);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 18px;
      padding: 22px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.08);
      backdrop-filter: blur(16px);
    }
    .card-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 14px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.07);
      padding-bottom: 10px;
    }
    .card-top-title {
      font-size: 13px;
      font-weight: 700;
      color: #e2e8f0;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .studio-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-bottom: 14px;
    }
    .studio-field {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 12px;
      padding: 12px 14px;
    }
    .field-label {
      font-size: 11px;
      color: #64748b;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 6px;
    }
    .field-value {
      font-size: 15px;
      font-weight: 700;
      color: #10b981;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .days-row {
      display: flex;
      gap: 6px;
      margin-top: 6px;
    }
    .day-chip {
      width: 26px;
      height: 26px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: 700;
    }
    .day-chip.active {
      background: #008060;
      color: #ffffff;
      box-shadow: 0 0 10px rgba(0, 128, 96, 0.4);
    }
    .day-chip.inactive {
      background: rgba(255, 255, 255, 0.05);
      color: #475569;
    }

    /* Right Column: Layered Real Storefront & Cart & SLA Panels */
    .right-col {
      display: grid;
      grid-template-columns: 1.15fr 1fr;
      gap: 20px;
      align-items: start;
    }

    /* Real Product Page Mockup */
    .pdp-card {
      background: #ffffff;
      color: #0f172a;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 25px 60px rgba(0, 0, 0, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.15);
    }
    .browser-bar {
      background: #f8fafc;
      border-bottom: 1px solid #e2e8f0;
      padding: 10px 14px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .browser-dots {
      display: flex;
      gap: 5px;
    }
    .b-dot {
      width: 9px;
      height: 9px;
      border-radius: 50%;
    }
    .b-dot.red { background: #ff5f56; }
    .b-dot.yellow { background: #ffbd2e; }
    .b-dot.green { background: #27c93f; }
    .browser-url {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 3px 10px;
      font-size: 11px;
      color: #64748b;
      flex: 1;
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
    }
    .pdp-body {
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    .pdp-hero-row {
      display: flex;
      gap: 14px;
      align-items: center;
    }
    .pdp-thumb {
      width: 72px;
      height: 72px;
      background: #f1f5f9;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #334155;
    }
    .pdp-meta-title {
      font-size: 15px;
      font-weight: 700;
      color: #0f172a;
      line-height: 1.25;
    }
    .pdp-price {
      font-size: 17px;
      font-weight: 800;
      color: #0f172a;
      margin-top: 4px;
    }
    .pdp-stock-tag {
      font-size: 11px;
      color: #047857;
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }

    /* THE REAL DROPCLOCK COUNTDOWN PILL */
    .dropclock-pill {
      background: #f0fdf4;
      border: 1.5px solid #86efac;
      border-radius: 12px;
      padding: 12px 14px;
      display: flex;
      align-items: center;
      gap: 12px;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.08);
      position: relative;
    }
    .pill-icon {
      width: 32px;
      height: 32px;
      background: #ffffff;
      border: 1px solid #86efac;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #008060;
      flex-shrink: 0;
      box-shadow: 0 2px 6px rgba(0, 128, 96, 0.15);
    }
    .pill-text-primary {
      font-size: 12.5px;
      font-weight: 600;
      color: #0f172a;
    }
    .pill-text-primary strong {
      color: #008060;
      font-weight: 700;
    }
    .pill-text-secondary {
      font-size: 11px;
      color: #047857;
      margin-top: 2px;
      font-weight: 500;
    }
    .btn-cart {
      background: #0f172a;
      color: #ffffff;
      border: none;
      border-radius: 10px;
      padding: 12px;
      font-size: 13px;
      font-weight: 600;
      text-align: center;
      cursor: pointer;
    }

    /* Stack on Right: Cart Upsell & Order Status SLA */
    .stack-col {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    /* Real Cart Drawer Progress Card */
    .cart-drawer-card {
      background: rgba(18, 18, 22, 0.9);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 18px;
      padding: 18px 20px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(16px);
    }
    .cart-header {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      font-weight: 600;
      color: #94a3b8;
      margin-bottom: 12px;
    }
    .progress-box {
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      padding: 12px 14px;
    }
    .progress-title-row {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      font-weight: 600;
      color: #f1f5f9;
      margin-bottom: 8px;
    }
    .progress-title-row strong {
      color: #34d399;
    }
    .progress-track {
      background: rgba(255, 255, 255, 0.1);
      height: 6px;
      border-radius: 999px;
      overflow: hidden;
    }
    .progress-fill {
      background: linear-gradient(90deg, #008060, #10b981);
      width: 81%;
      height: 100%;
      border-radius: 999px;
      box-shadow: 0 0 12px rgba(16, 185, 129, 0.6);
    }
    .progress-sub {
      font-size: 10.5px;
      color: #94a3b8;
      margin-top: 6px;
    }

    /* Real 3-Step Order Status Timeline Card */
    .timeline-card {
      background: rgba(18, 18, 22, 0.9);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 18px;
      padding: 18px 20px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(16px);
    }
    .timeline-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 14px;
      font-size: 12px;
      font-weight: 700;
      color: #f1f5f9;
    }
    .timeline-steps {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
      text-align: center;
      position: relative;
    }
    .step-node {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
    }
    .step-circle {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: 700;
    }
    .step-circle.done {
      background: #008060;
      color: #ffffff;
      box-shadow: 0 0 12px rgba(0, 128, 96, 0.5);
    }
    .step-circle.active {
      background: rgba(16, 185, 129, 0.2);
      border: 1.5px solid #10b981;
      color: #34d399;
      box-shadow: 0 0 12px rgba(16, 185, 129, 0.4);
    }
    .step-circle.pending {
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.15);
      color: #64748b;
    }
    .step-name {
      font-size: 11px;
      font-weight: 600;
      color: #e2e8f0;
    }
    .step-meta {
      font-size: 9.5px;
      color: #94a3b8;
    }

    /* Bottom Trust & Compliance Bar */
    footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: relative;
      z-index: 2;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      padding-top: 16px;
    }
    .footer-tags {
      display: flex;
      gap: 20px;
      font-size: 12px;
      color: #94a3b8;
    }
    .footer-tag {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .footer-tag strong {
      color: #ffffff;
    }
    .store-badge {
      font-size: 12px;
      color: #64748b;
    }
  </style>
</head>
<body>
  <div class="bg-grid"></div>
  <div class="ambient-glow-top"></div>
  <div class="ambient-glow-side"></div>

  <!-- Header -->
  <header>
    <div class="brand-group">
      <div class="brand-logo">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" stroke="#ffffff" stroke-width="1.75" />
          <path d="M12 7V12L15 14" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          <circle cx="12" cy="3" r="1.5" fill="#ffffff" />
        </svg>
      </div>
      <div class="brand-title">DropClock</div>
    </div>
    <div class="header-tagline">
      Shopify Storefront Fulfillment Engine
    </div>
  </header>

  <!-- Main Showcase Bento Grid -->
  <main>
    <!-- Left: Product Story & Studio Controls -->
    <div class="left-col">
      <div class="headline-group">
        <h1>Turn Fulfillment Speed Into Sales Urgency</h1>
        <p>Live storefront cutoff countdowns, dynamic calendar arrival dates, and multi-tier cart drawer expansion.</p>
      </div>

      <!-- Real DropClock Studio Controls -->
      <div class="studio-card">
        <div class="card-top">
          <div class="card-top-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2"><circle cx="12" cy="12" r="9"/><polyline points="12 6 12 12 15 14"/></svg>
            <span>DropClock Studio Configuration</span>
          </div>
          <span style="font-size: 11px; color: #34d399; font-weight: 600;">Dawn 15.0 Active · Synced</span>
        </div>

        <div class="studio-grid">
          <div class="studio-field">
            <div class="field-label">Daily Dispatch Cutoff</div>
            <div class="field-value">14:00 (EST)</div>
          </div>
          <div class="studio-field">
            <div class="field-label">Transit Lead Time</div>
            <div class="field-value">2 Business Days</div>
          </div>
        </div>

        <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 12px; padding: 12px 14px;">
          <div class="field-label">Active Warehouse Operating Days</div>
          <div class="days-row">
            <div class="day-chip active">M</div>
            <div class="day-chip active">T</div>
            <div class="day-chip active">W</div>
            <div class="day-chip active">T</div>
            <div class="day-chip active">F</div>
            <div class="day-chip inactive">S</div>
            <div class="day-chip inactive">S</div>
            <span style="font-size: 11px; color: #94a3b8; margin-left: 8px; align-self: center;">Weekends excluded automatically</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Right: Real App Surfaces (Product Page, Cart Drawer, Order SLA) -->
    <div class="right-col">
      <!-- Real Storefront Product Page Card -->
      <div class="pdp-card">
        <div class="browser-bar">
          <div class="browser-dots">
            <div class="b-dot red"></div>
            <div class="b-dot yellow"></div>
            <div class="b-dot green"></div>
          </div>
          <div class="browser-url">rankpilot-store.myshopify.com/products/classic-boxy-crewneck</div>
        </div>
        <div class="pdp-body">
          <div class="pdp-hero-row">
            <div class="pdp-thumb">
              <svg viewBox="0 0 120 120" width="46" height="46" fill="currentColor">
                <path d="M 40 16 C 45 24 75 24 80 16 L 104 28 L 92 46 L 82 40 L 82 100 C 82 102 80 104 78 104 L 42 104 C 40 104 38 102 38 100 L 38 40 L 28 46 L 16 28 Z" />
              </svg>
            </div>
            <div>
              <div class="pdp-stock-tag">● In Stock · Ships Promptly</div>
              <div class="pdp-meta-title">Classic Boxy Crewneck</div>
              <div class="pdp-price">$42.00 USD</div>
            </div>
          </div>

          <!-- THE REAL DROPCLOCK COUNTDOWN PILL -->
          <div class="dropclock-pill">
            <div class="pill-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="#008060" stroke-width="2" />
                <path d="M12 7V12L15 14" stroke="#008060" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                <circle cx="12" cy="3" r="1.5" fill="#008060" />
              </svg>
            </div>
            <div>
              <div class="pill-text-primary">Order within <strong>2h 40m 15s</strong> for same-day dispatch</div>
              <div class="pill-text-secondary">⚡ Dispatches Today · Delivered by <strong>Wednesday, Oct 7</strong></div>
            </div>
          </div>

          <button class="btn-cart">Add to Cart • $42.00</button>
        </div>
      </div>

      <!-- Real Cart Drawer & Order SLA Stack -->
      <div class="stack-col">
        <!-- Real Cart Drawer Progress Card -->
        <div class="cart-drawer-card">
          <div class="cart-header">
            <span>Slide-Out Cart Drawer</span>
            <span style="color: #34d399; font-weight: 700;">Subtotal: $60.95</span>
          </div>
          <div class="progress-box">
            <div class="progress-title-row">
              <span>Add <strong>$14.05</strong> for Free Express Delivery</span>
              <span style="font-family: monospace; color: #34d399;">81%</span>
            </div>
            <div class="progress-track">
              <div class="progress-fill"></div>
            </div>
            <div class="progress-sub">⚡ 81% goal reached · 2 items in cart</div>
          </div>
        </div>

        <!-- Real 3-Step Order Status Timeline Card -->
        <div class="timeline-card">
          <div class="timeline-header">
            <span>Post-Purchase Fulfillment SLA</span>
            <span style="font-size: 11px; color: #34d399;">Order #1084</span>
          </div>
          <div class="timeline-steps">
            <div class="step-node">
              <div class="step-circle done">✓</div>
              <div class="step-name">Placed</div>
              <div class="step-meta">10:24 AM</div>
            </div>
            <div class="step-node">
              <div class="step-circle active">◷</div>
              <div class="step-name" style="color: #34d399;">Dispatched</div>
              <div class="step-meta">Today 14:00</div>
            </div>
            <div class="step-node">
              <div class="step-circle pending">✈</div>
              <div class="step-name">Delivered</div>
              <div class="step-meta">Wed, Oct 7</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>

  <!-- Footer Proof Bar -->
  <footer>
    <div class="footer-tags">
      <div class="footer-tag">⚡ <strong>Real-Time Cutoff:</strong> Same-day dispatch countdown timers</div>
      <div class="footer-tag">📦 <strong>Dynamic ETA:</strong> Calendar delivery dates based on working days</div>
      <div class="footer-tag">🛒 <strong>Cart Upsell:</strong> Free Express Shipping progress bar tiers</div>
    </div>
    <div class="store-badge">Native Theme App Extension</div>
  </footer>
</body>
</html>
`;

async function render() {
  console.log("🚀 Launching Chromium to render authentic 21st.dev DropClock Key Visual...");
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1600, height: 900 },
    deviceScaleFactor: 1,
  });

  await page.setContent(html);
  await page.screenshot({
    path: outputPath,
    clip: { x: 0, y: 0, width: 1600, height: 900 },
  });

  await browser.close();
  const stats = fs.statSync(outputPath);
  console.log(`✅ Success! Rendered: ${outputPath} (${(stats.size / 1024).toFixed(1)} KB)`);
}

render().catch((err) => {
  console.error("❌ Error rendering key visual:", err);
  process.exit(1);
});
