import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const listingDir = path.join(process.cwd(), "public/listing");
if (!fs.existsSync(listingDir)) {
  fs.mkdirSync(listingDir, { recursive: true });
}

const assets = [
  // 1. App Icon 1200x1200 (Square, NO pre-rounded corners, Shopify applies radius)
  {
    filename: "app-icon-1200x1200.png",
    width: 1200,
    height: 1200,
    title: "DropClock App Store Icon 1200x1200",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            width: 1200px;
            height: 1200px;
            background: #008060;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
          }
          .icon-container {
            width: 720px;
            height: 720px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          svg {
            width: 100%;
            height: 100%;
            filter: drop-shadow(0 20px 30px rgba(0, 0, 0, 0.15));
          }
        </style>
      </head>
      <body>
        <div class="icon-container">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <!-- Clock Dial Ring -->
            <circle cx="12" cy="12" r="9" stroke="#ffffff" stroke-width="1.75" stroke-linecap="round" />
            <!-- Hands Pointing to Cutoff -->
            <path d="M12 7V12L15 14" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            <!-- Transit Droplet Crown Notch -->
            <circle cx="12" cy="3" r="1.5" fill="#ffffff" />
          </svg>
        </div>
      </body>
      </html>
    `,
  },

  // 2. Key Visual 1600x900 (High-Resolution Hero Card < 3MB)
  {
    filename: "key-visual-1600x900.png",
    width: 1600,
    height: 900,
    title: "DropClock App Store Key Visual 1600x900",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
          body {
            width: 1600px;
            height: 900px;
            background: radial-gradient(circle at 80% 20%, #0d3d2c 0%, #061912 60%, #030d09 100%);
            color: #ffffff;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 80px 100px;
            overflow: hidden;
            position: relative;
          }
          .glow {
            position: absolute;
            width: 700px;
            height: 700px;
            background: radial-gradient(circle, rgba(0, 128, 96, 0.4) 0%, transparent 70%);
            top: 100px;
            right: 100px;
            filter: blur(50px);
            z-index: 1;
          }
          .left-col {
            max-width: 680px;
            z-index: 2;
          }
          .badge {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 8px 18px;
            background: rgba(0, 128, 96, 0.25);
            border: 1px solid #008060;
            border-radius: 999px;
            color: #00d694;
            font-size: 14px;
            font-weight: 700;
            letter-spacing: 0.5px;
            text-transform: uppercase;
            margin-bottom: 24px;
          }
          .badge-dot {
            width: 8px;
            height: 8px;
            background: #00d694;
            border-radius: 50%;
            box-shadow: 0 0 10px #00d694;
          }
          h1 {
            font-size: 68px;
            font-weight: 800;
            line-height: 1.05;
            margin-bottom: 20px;
            letter-spacing: -1.5px;
            background: linear-gradient(135deg, #ffffff 60%, #9bfad2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }
          p.tagline {
            font-size: 21px;
            line-height: 1.5;
            color: #c4d7cf;
            margin-bottom: 36px;
          }
          .stat-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 16px;
          }
          .stat-card {
            background: rgba(255, 255, 255, 0.06);
            border: 1px solid rgba(255, 255, 255, 0.12);
            backdrop-filter: blur(12px);
            padding: 18px 20px;
            border-radius: 14px;
          }
          .stat-num {
            font-size: 26px;
            font-weight: 800;
            color: #00d694;
            margin-bottom: 4px;
          }
          .stat-desc {
            font-size: 12px;
            color: #9cb2a9;
            font-weight: 500;
          }
          .preview-panel {
            width: 580px;
            z-index: 2;
            background: rgba(14, 25, 20, 0.75);
            border: 1px solid rgba(0, 214, 148, 0.35);
            box-shadow: 0 30px 70px rgba(0, 0, 0, 0.6);
            border-radius: 24px;
            padding: 36px;
            backdrop-filter: blur(20px);
          }
          .preview-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 24px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            padding-bottom: 16px;
          }
          .preview-capsule {
            background: #ffffff;
            color: #0f172a;
            border-radius: 14px;
            padding: 18px 20px;
            display: flex;
            align-items: center;
            gap: 16px;
            box-shadow: 0 12px 30px rgba(0,0,0,0.25);
            margin-bottom: 16px;
          }
          .pulse-icon {
            width: 40px;
            height: 40px;
            background: #e6f7f2;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #008060;
            flex-shrink: 0;
          }
          .capsule-timer {
            font-size: 14px;
            font-weight: 600;
            color: #0f172a;
          }
          .capsule-timer strong {
            color: #008060;
            font-weight: 700;
          }
          .capsule-eta {
            font-size: 12px;
            color: #64748b;
            margin-top: 4px;
            display: flex;
            align-items: center;
            gap: 6px;
          }
          .cart-card {
            background: #ffffff;
            border-radius: 14px;
            padding: 18px 20px;
            color: #0f172a;
          }
          .progress-bar-bg {
            background: #e2e8f0;
            height: 6px;
            border-radius: 999px;
            overflow: hidden;
            margin-top: 10px;
          }
          .progress-bar-fill {
            background: #008060;
            width: 81%;
            height: 100%;
            border-radius: 999px;
          }
        </style>
      </head>
      <body>
        <div class="glow"></div>
        <div class="left-col">
          <div class="badge">
            <span class="badge-dot"></span>
            Built for Shopify Certified · 2026 Engine
          </div>
          <h1>DropClock</h1>
          <p class="tagline">Automated Shipping Cutoff Countdown Timer, Multi-Tier Cart Progress & Estimated Delivery Date ETA. Zero CLS with 0ms storefront drag.</p>
          <div class="stat-grid">
            <div class="stat-card">
              <div class="stat-num">0 ms</div>
              <div class="stat-desc">Server-Side Latency</div>
            </div>
            <div class="stat-card">
              <div class="stat-num">100%</div>
              <div class="stat-desc">Native Theme Extension</div>
            </div>
            <div class="stat-card">
              <div class="stat-num">0 PCD</div>
              <div class="stat-desc">Zero Customer Data Policy</div>
            </div>
          </div>
        </div>
        <div class="preview-panel">
          <div class="preview-header">
            <span style="font-size: 13px; font-weight: 700; color: #00d694; text-transform: uppercase; letter-spacing: 0.5px;">LIVE STOREFRONT PILL</span>
            <span style="font-size: 12px; color: #9cb2a9;">Dawn 15.0 · Instant CDN</span>
          </div>
          <div class="preview-capsule">
            <div class="pulse-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 15 14"></polyline></svg>
            </div>
            <div>
              <div class="capsule-timer">Order within <strong>2h 40m 15s</strong> for <strong>Same-Day Dispatch</strong></div>
              <div class="capsule-eta">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
                Estimated Delivery: <strong>Wednesday, Oct 7</strong>
              </div>
            </div>
          </div>
          <div class="cart-card">
            <div style="display: flex; justify-content: space-between; align-items: center; font-size: 12px; font-weight: 600;">
              <span>Add <strong style="color: #008060;">$14.05</strong> more for Free Express Delivery</span>
              <span style="color: #008060; font-family: monospace;">81%</span>
            </div>
            <div class="progress-bar-bg">
              <div class="progress-bar-fill"></div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
  },

  // 3. Screenshot 1: Studio Admin Configuration (1600x900)
  {
    filename: "screenshot-1-studio-1600x900.png",
    width: 1600,
    height: 900,
    title: "DropClock Studio Admin Configuration View",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
          body {
            width: 1600px;
            height: 900px;
            background: #f1f2f4;
            color: #0f172a;
            display: flex;
            flex-direction: column;
          }
          header {
            background: #ffffff;
            border-bottom: 1px solid #e2e8f0;
            padding: 16px 36px;
            display: flex;
            align-items: center;
            justify-content: space-between;
          }
          .logo-group {
            display: flex;
            align-items: center;
            gap: 12px;
          }
          .title { font-size: 16px; font-weight: 700; color: #0f172a; }
          .badge-active {
            padding: 3px 10px;
            background: #ecfdf5;
            color: #047857;
            border: 1px solid #a7f3d0;
            border-radius: 999px;
            font-size: 12px;
            font-weight: 600;
          }
          .badge-synced {
            padding: 3px 10px;
            background: #f1f5f9;
            color: #475569;
            border: 1px solid #cbd5e1;
            border-radius: 999px;
            font-size: 12px;
            font-weight: 600;
          }
          .btn-theme {
            background: #008060;
            color: white;
            padding: 9px 18px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 13px;
            border: none;
          }
          main {
            display: grid;
            grid-template-columns: 520px 1fr;
            flex: 1;
            overflow: hidden;
          }
          aside {
            background: #ffffff;
            border-right: 1px solid #e2e8f0;
            padding: 24px;
            display: flex;
            flex-direction: column;
            gap: 16px;
          }
          .card {
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 18px;
            box-shadow: 0 1px 2px rgba(0,0,0,0.03);
          }
          .card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;
          }
          .card-title { font-size: 13px; font-weight: 700; color: #0f172a; }
          .day-grid {
            display: flex;
            gap: 6px;
            margin-top: 10px;
          }
          .day-btn {
            width: 36px;
            height: 36px;
            border-radius: 8px;
            border: 1px solid #10b981;
            background: #10b981;
            color: white;
            font-size: 13px;
            font-weight: 700;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .day-btn.inactive {
            border: 1px solid #e2e8f0;
            background: white;
            color: #64748b;
          }
          section {
            background: #f8fafc;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 40px;
          }
          .preview-frame {
            width: 580px;
            background: white;
            border: 1px solid #e2e8f0;
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.06);
            padding: 30px;
          }
        </style>
      </head>
      <body>
        <header>
          <div class="logo-group">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="#008060" stroke-width="1.75"/><path d="M12 7V12L15 14" stroke="#008060" stroke-width="2"/><circle cx="12" cy="3" r="1.5" fill="#008060"/></svg>
            <span class="title">DropClock Studio</span>
            <span class="badge-active">Dawn 15.0 (Active)</span>
            <span class="badge-synced">Settings Synced</span>
          </div>
          <button class="btn-theme">Add to Theme Editor</button>
        </header>
        <main>
          <aside>
            <div class="card">
              <div class="card-header">
                <span class="card-title">Daily Dispatch Cutoff</span>
                <span style="font-size: 12px; font-weight: 600; color: #008060;">14:00 (EST)</span>
              </div>
              <p style="font-size: 12px; color: #64748b;">Orders placed prior to 14:00 ship today. Orders placed after roll forward to the next business day.</p>
            </div>
            <div class="card">
              <div class="card-header">
                <span class="card-title">Operating Days & Transit Lead Time</span>
                <span style="font-size: 12px; font-weight: 600; color: #008060;">2 Business Days</span>
              </div>
              <div class="day-grid">
                <div class="day-btn">M</div>
                <div class="day-btn">T</div>
                <div class="day-btn">W</div>
                <div class="day-btn">T</div>
                <div class="day-btn">F</div>
                <div class="day-btn inactive">S</div>
                <div class="day-btn inactive">S</div>
              </div>
            </div>
            <div class="card">
              <div class="card-header">
                <span class="card-title">Cart Free Shipping Goal</span>
                <span style="font-size: 12px; font-weight: 600; color: #008060;">$75.00 Threshold</span>
              </div>
              <p style="font-size: 12px; color: #64748b;">Dynamic upsell progress bar in cart drawer encouraging shoppers to increase AOV.</p>
            </div>
          </aside>
          <section>
            <div class="preview-frame">
              <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 14px;">Real-Time Canvas Simulation</div>
              <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
                <div style="display: flex; align-items: center; gap: 12px;">
                  <div style="width: 32px; height: 32px; border-radius: 50%; background: #e6f7f2; display: flex; align-items: center; justify-content: center; color: #008060;">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 15 14"/></svg>
                  </div>
                  <div>
                    <div style="font-size: 14px; font-weight: 600; color: #0f172a;">Order within <strong style="color: #008060;">2h 40m 15s</strong> for same-day dispatch</div>
                    <div style="font-size: 12px; color: #64748b; margin-top: 3px;">Estimated Delivery: <strong style="color: #0f172a;">Wednesday, Oct 7</strong></div>
                  </div>
                </div>
              </div>
              <div style="border-top: 1px solid #e2e8f0; padding-top: 16px; font-size: 12px; color: #64748b;">
                SLA Guarantee: Fully synchronized with carrier APIs and warehouse blackout schedules.
              </div>
            </div>
          </section>
        </main>
      </body>
      </html>
    `,
  },

  // 4. Screenshot 2: Storefront Product Page Preview (1600x900)
  {
    filename: "screenshot-2-product-1600x900.png",
    width: 1600,
    height: 900,
    title: "DropClock Storefront Product Page View",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
          body {
            width: 1600px;
            height: 900px;
            background: #ffffff;
            color: #0f172a;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 60px;
          }
          .browser-mock {
            width: 1200px;
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 20px;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.12);
            overflow: hidden;
          }
          .browser-nav {
            background: #f8fafc;
            border-bottom: 1px solid #e2e8f0;
            padding: 12px 20px;
            display: flex;
            align-items: center;
            gap: 12px;
          }
          .dots { display: flex; gap: 6px; }
          .dot { width: 10px; height: 10px; border-radius: 50%; }
          .url-bar {
            background: white;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 4px 16px;
            font-size: 12px;
            color: #64748b;
            flex: 1;
            max-width: 450px;
          }
          .store-content {
            display: grid;
            grid-template-columns: 1fr 1fr;
            padding: 50px 70px;
            gap: 60px;
            align-items: center;
          }
          .prod-img {
            background: #f4f6f8;
            border-radius: 16px;
            height: 480px;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 1px solid #e2e8f0;
          }
          .prod-details h2 { font-size: 32px; font-weight: 700; margin-bottom: 8px; }
          .price { font-size: 24px; font-weight: 600; color: #0f172a; margin-bottom: 20px; }
          .dropclock-pill {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 18px 20px;
            margin-bottom: 24px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.02);
          }
          .btn-add {
            background: #0f172a;
            color: white;
            width: 100%;
            padding: 16px;
            border-radius: 12px;
            font-size: 15px;
            font-weight: 700;
            border: none;
          }
        </style>
      </head>
      <body>
        <div class="browser-mock">
          <div class="browser-nav">
            <div class="dots">
              <div class="dot" style="background:#ff5f56;"></div>
              <div class="dot" style="background:#ffbd2e;"></div>
              <div class="dot" style="background:#27c93f;"></div>
            </div>
            <div class="url-bar">https://dropclock-store.myshopify.com/products/classic-boxy-crewneck</div>
          </div>
          <div class="store-content">
            <div class="prod-img">
              <svg viewBox="0 0 120 120" style="width: 220px; height: 220px; fill: #1e293b;">
                <path d="M 40 16 C 45 24 75 24 80 16 L 104 28 L 92 46 L 82 40 L 82 100 C 82 102 80 104 78 104 L 42 104 C 40 104 38 102 38 100 L 38 40 L 28 46 L 16 28 Z" />
              </svg>
            </div>
            <div class="prod-details">
              <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #008060;">● In Stock · Ships Promptly</span>
              <h2>Classic Boxy Crewneck</h2>
              <div class="price">$42.00 USD</div>
              <div class="dropclock-pill">
                <div style="display: flex; align-items: center; gap: 10px;">
                  <span style="width: 8px; height: 8px; border-radius: 50%; background: #008060;"></span>
                  <span style="font-size: 14px; font-weight: 600; color: #0f172a;">Order within <strong style="color: #008060;">2h 40m 15s</strong> for same-day dispatch</span>
                </div>
                <div style="display: flex; align-items: center; gap: 6px; font-size: 12px; color: #64748b; margin-top: 6px;">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
                  Estimated Delivery: <strong style="color: #0f172a;">Wednesday, Oct 7</strong>
                </div>
              </div>
              <button class="btn-add">Add to Cart</button>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
  },

  // 5. Screenshot 3: Cart Drawer & Order Status SLA (1600x900)
  {
    filename: "screenshot-3-cart-order-1600x900.png",
    width: 1600,
    height: 900,
    title: "DropClock Cart Drawer & Post-Purchase Order Status SLA",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
          body {
            width: 1600px;
            height: 900px;
            background: #f1f2f4;
            color: #0f172a;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 40px;
            gap: 40px;
          }
          .card-panel {
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.06);
            width: 580px;
            padding: 36px;
          }
          .panel-title {
            font-size: 16px;
            font-weight: 700;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            justify-content: space-between;
          }
          .step-row {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 16px;
            text-align: center;
            position: relative;
            margin: 30px 0;
          }
          .step-circle {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            margin: 0 auto 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            font-weight: 700;
          }
          .circle-done { background: #008060; color: white; }
          .circle-active { background: #ecfdf5; border: 2px solid #008060; color: #008060; }
          .circle-pending { background: #f1f5f9; border: 1px solid #cbd5e1; color: #94a3b8; }
          .progress-track {
            background: #e2e8f0;
            height: 6px;
            border-radius: 999px;
            overflow: hidden;
            margin: 12px 0;
          }
          .progress-bar-inner {
            background: #008060;
            width: 81%;
            height: 100%;
          }
        </style>
      </head>
      <body>
        <!-- Left: Slide-out Cart Drawer Preview -->
        <div class="card-panel">
          <div class="panel-title">
            <span>Slide-Out Cart Drawer Upsell</span>
            <span style="font-size: 12px; font-weight: 600; color: #008060;">Subtotal: $60.95</span>
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 18px; margin-bottom: 20px;">
            <div style="display: flex; justify-content: space-between; font-size: 13px; font-weight: 600;">
              <span>Add <strong style="color: #008060;">$14.05</strong> more for Free Express Delivery</span>
              <span style="color: #008060; font-family: monospace;">81%</span>
            </div>
            <div class="progress-track">
              <div class="progress-bar-inner"></div>
            </div>
            <div style="font-size: 11px; color: #64748b; margin-top: 6px;">
              ⚡ Order within 2h 40m for same-day dispatch
            </div>
          </div>
          <div style="border-top: 1px solid #f1f5f9; padding-top: 16px; font-size: 13px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span style="color: #64748b;">Subtotal (2 items)</span>
              <span style="font-weight: 600;">$60.95</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span style="color: #64748b;">Standard Shipping</span>
              <span style="font-weight: 600; color: #008060;">$5.99</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-weight: 700; font-size: 15px; border-top: 1px solid #e2e8f0; padding-top: 10px;">
              <span>Total</span>
              <span>$66.94</span>
            </div>
          </div>
        </div>

        <!-- Right: Post-Purchase Order Status Timeline -->
        <div class="card-panel">
          <div class="panel-title">
            <span>Post-Purchase Fulfillment SLA</span>
            <span style="font-size: 12px; font-weight: 600; color: #008060;">Order #1084 Confirmed</span>
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 20px;">
            <div style="font-size: 12px; font-weight: 700; color: #0f172a; margin-bottom: 8px;">Automated Delivery Milestones</div>
            <div class="step-row">
              <div>
                <div class="step-circle circle-done">✓</div>
                <div style="font-size: 12px; font-weight: 600;">Order Placed</div>
                <div style="font-size: 10px; color: #94a3b8;">Today 10:24 AM</div>
              </div>
              <div>
                <div class="step-circle circle-active">◷</div>
                <div style="font-size: 12px; font-weight: 700; color: #008060;">Dispatched</div>
                <div style="font-size: 10px; color: #008060; font-weight: 600;">Today by 14:00</div>
              </div>
              <div>
                <div class="step-circle circle-pending">✈</div>
                <div style="font-size: 12px; font-weight: 600; color: #64748b;">Estimated Arrival</div>
                <div style="font-size: 10px; color: #64748b; font-weight: 600;">Wednesday, Oct 7</div>
              </div>
            </div>
            <div style="border-top: 1px solid #e2e8f0; padding-top: 12px; font-size: 11px; color: #64748b; line-height: 1.5;">
              ✓ Carrier tracking updates emailed automatically upon dispatch.
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
  },
];

async function generateAll() {
  console.log("🚀 Launching Chromium for App Store Listing Assets generation...");
  const browser = await chromium.launch();

  for (const asset of assets) {
    const page = await browser.newPage({
      viewport: { width: asset.width, height: asset.height },
      deviceScaleFactor: 1,
    });

    await page.setContent(asset.html);
    const outputPath = path.join(listingDir, asset.filename);

    await page.screenshot({
      path: outputPath,
      clip: { x: 0, y: 0, width: asset.width, height: asset.height },
    });

    const stats = fs.statSync(outputPath);
    console.log(`✅ Generated: ${asset.filename} (${asset.width}x${asset.height}) - ${(stats.size / 1024).toFixed(1)} KB`);
    await page.close();
  }

  await browser.close();
  console.log("✨ All 5 App Store listing assets generated successfully in public/listing/!");
}

generateAll().catch((err) => {
  console.error("❌ Error generating listing assets:", err);
  process.exit(1);
});
