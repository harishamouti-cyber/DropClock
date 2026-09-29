import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const outputDir = path.join(process.cwd(), "assets/app-store");
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

interface AssetSpec {
  filename: string;
  title: string;
  html: string;
}

const assets: AssetSpec[] = [
  {
    filename: "dropclock-hero-banner.png",
    title: "DropClock App Store Feature Banner (1600x900)",
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
            width: 600px;
            height: 600px;
            background: radial-gradient(circle, rgba(0, 128, 96, 0.35) 0%, transparent 70%);
            top: 150px;
            right: 150px;
            filter: blur(40px);
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
            padding: 8px 16px;
            background: rgba(0, 128, 96, 0.2);
            border: 1px solid #008060;
            border-radius: 999px;
            color: #00d694;
            font-size: 15px;
            font-weight: 600;
            letter-spacing: 0.5px;
            text-transform: uppercase;
            margin-bottom: 28px;
          }
          .badge-dot {
            width: 8px;
            height: 8px;
            background: #00d694;
            border-radius: 50%;
            box-shadow: 0 0 10px #00d694;
          }
          h1 {
            font-size: 64px;
            font-weight: 800;
            line-height: 1.1;
            margin-bottom: 24px;
            letter-spacing: -1px;
            background: linear-gradient(135deg, #ffffff 60%, #9bfad2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }
          p.tagline {
            font-size: 22px;
            line-height: 1.5;
            color: #b3c7be;
            margin-bottom: 40px;
          }
          .stat-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
          }
          .stat-card {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            padding: 20px;
            border-radius: 14px;
          }
          .stat-num {
            font-size: 28px;
            font-weight: 800;
            color: #00d694;
            margin-bottom: 4px;
          }
          .stat-desc {
            font-size: 13px;
            color: #8fa69d;
          }
          .preview-panel {
            width: 580px;
            z-index: 2;
            background: rgba(14, 25, 20, 0.7);
            border: 1px solid rgba(0, 214, 148, 0.3);
            box-shadow: 0 25px 60px rgba(0, 0, 0, 0.6);
            border-radius: 20px;
            padding: 36px;
            backdrop-filter: blur(20px);
          }
          .preview-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 28px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.08);
            padding-bottom: 16px;
          }
          .preview-capsule {
            background: #ffffff;
            color: #1a1a1a;
            border-radius: 12px;
            padding: 18px 24px;
            display: flex;
            align-items: center;
            gap: 16px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.15);
            margin-bottom: 20px;
          }
          .pulse-icon {
            width: 36px;
            height: 36px;
            background: #e6f7f2;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #008060;
            position: relative;
            flex-shrink: 0;
          }
          .pulse-dot {
            position: absolute;
            top: 2px;
            right: 2px;
            width: 8px;
            height: 8px;
            background: #008060;
            border-radius: 50%;
          }
          .capsule-timer {
            font-size: 15px;
            font-weight: 500;
          }
          .capsule-timer strong {
            color: #008060;
            font-weight: 700;
          }
          .capsule-eta {
            font-size: 13px;
            color: #555;
            margin-top: 4px;
            display: flex;
            align-items: center;
            gap: 6px;
          }
        </style>
      </head>
      <body>
        <div class="glow"></div>
        <div class="left-col">
          <div class="badge">
            <span class="badge-dot"></span>
            Shopify App Store Certified · 2026 Ready
          </div>
          <h1>DropClock</h1>
          <p class="tagline">Order Cutoff Countdown Timer & Estimated Delivery Date ETA. Ultra-performant with 0ms storefront speed drag.</p>
          <div class="stat-grid">
            <div class="stat-card">
              <div class="stat-num">0ms</div>
              <div class="stat-desc">Server Latency</div>
            </div>
            <div class="stat-card">
              <div class="stat-num">100%</div>
              <div class="stat-desc">Theme Extension</div>
            </div>
            <div class="stat-card">
              <div class="stat-num">0 PCD</div>
              <div class="stat-desc">GDPR Privacy Compliant</div>
            </div>
          </div>
        </div>
        <div class="preview-panel">
          <div class="preview-header">
            <span style="font-size: 14px; font-weight: 600; color: #00d694;">LIVE STOREFRONT PILL</span>
            <span style="font-size: 12px; color: #8fa69d;">CDN Edge Metafield</span>
          </div>
          <div class="preview-capsule">
            <div class="pulse-icon">
              <span class="pulse-dot"></span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            </div>
            <div>
              <div class="capsule-timer">Order within <strong>3h 42m</strong> for <strong>Same-Day Dispatch</strong></div>
              <div class="capsule-eta">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
                Estimated Delivery: <strong>Thu, Oct 2</strong>
              </div>
            </div>
          </div>
          <div style="font-size: 13px; color: #8fa69d; line-height: 1.6;">
            ✓ Real-time countdown refreshed every 60s<br>
            ✓ Auto-skips weekends and merchant blackout dates<br>
            ✓ Instant switch to backorder pill on out-of-stock
          </div>
        </div>
      </body>
      </html>
    `,
  },
  {
    filename: "dropclock-admin-dashboard.png",
    title: "DropClock Settings Dashboard & Live Preview (1600x900)",
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
            color: #202223;
            padding: 40px 60px;
          }
          .nav {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 30px;
          }
          .title-area h2 { font-size: 28px; font-weight: 700; }
          .title-area p { color: #6d7175; font-size: 14px; margin-top: 4px; }
          .btn-save {
            background: #008060;
            color: white;
            padding: 10px 24px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 14px;
            border: none;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          }
          .grid {
            display: grid;
            grid-template-columns: 2fr 1fr;
            gap: 24px;
          }
          .card {
            background: white;
            border-radius: 12px;
            padding: 24px;
            border: 1px solid #e1e3e5;
            box-shadow: 0 1px 3px rgba(0,0,0,0.04);
            margin-bottom: 24px;
          }
          .card-title {
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 16px;
          }
          .input-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
            margin-bottom: 16px;
          }
          .form-group label {
            display: block;
            font-size: 13px;
            font-weight: 500;
            color: #303030;
            margin-bottom: 6px;
          }
          .form-group input {
            width: 100%;
            padding: 10px 14px;
            border: 1px solid #c9cccf;
            border-radius: 8px;
            font-size: 14px;
            background: #fafbfb;
          }
          .help-text {
            font-size: 12px;
            color: #6d7175;
            margin-top: 4px;
          }
          .preview-box {
            background: #fafbfc;
            border: 1px dashed #c9cccf;
            border-radius: 12px;
            padding: 24px;
            margin-top: 16px;
          }
          .capsule {
            display: flex;
            align-items: center;
            gap: 14px;
            padding: 14px 18px;
            background: #f4f6f8;
            border: 1px solid rgba(0,0,0,0.06);
            border-radius: 8px;
          }
        </style>
      </head>
      <body>
        <div class="nav">
          <div class="title-area">
            <h2>DropClock Dispatch & ETA</h2>
            <p>Configure daily order cutoffs and zero-latency delivery estimates</p>
          </div>
          <button class="btn-save">Save Changes</button>
        </div>
        <div class="grid">
          <div>
            <div class="card">
              <div class="card-title">Dispatch Cutoff Window</div>
              <div class="input-row">
                <div class="form-group">
                  <label>Cutoff Hour (24h format)</label>
                  <input type="text" value="14">
                  <div class="help-text">e.g. 14 for 2:00 PM EST</div>
                </div>
                <div class="form-group">
                  <label>Cutoff Minute</label>
                  <input type="text" value="00">
                  <div class="help-text">e.g. 00 or 30</div>
                </div>
              </div>
              <div class="form-group">
                <label>Transit Lead Days</label>
                <input type="text" value="2">
                <div class="help-text">Business days from warehouse dispatch to customer doorstep</div>
              </div>
            </div>

            <div class="card">
              <div class="card-title">Styling & Brand Tokens</div>
              <div class="input-row" style="grid-template-columns: repeat(3, 1fr);">
                <div class="form-group">
                  <label>Accent Color</label>
                  <input type="text" value="#008060">
                </div>
                <div class="form-group">
                  <label>Background</label>
                  <input type="text" value="#f4f6f8">
                </div>
                <div class="form-group">
                  <label>Text Color</label>
                  <input type="text" value="#202223">
                </div>
              </div>
            </div>
          </div>

          <div>
            <div class="card">
              <div class="card-title">Storefront Live Preview</div>
              <p style="font-size: 13px; color: #6d7175; margin-bottom: 12px;">Real-time preview rendered using pure CSS matching your storefront capsule.</p>
              <div class="preview-box">
                <div class="capsule">
                  <div style="color: #008060;">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                  </div>
                  <div>
                    <div style="font-size: 13px; font-weight: 500;">Order within <strong style="color: #008060;">3h 42m</strong> for <strong>Same-Day Dispatch</strong></div>
                    <div style="font-size: 12px; color: #6d7175; margin-top: 2px;">Estimated Delivery: <strong>Thu, Oct 2</strong></div>
                  </div>
                </div>
              </div>
              <div style="margin-top: 20px; font-size: 13px; color: #6d7175; display: flex; justify-content: space-between;">
                <span>Lighthouse Drag: <strong style="color: #008060;">0ms</strong></span>
                <span>External Scripts: <strong>None</strong></span>
              </div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
  },
  {
    filename: "dropclock-storefront-capsule.png",
    title: "DropClock Zero-Latency Storefront Capsule (1600x900)",
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
            color: #1a1a1a;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 80px;
          }
          .product-card {
            width: 900px;
            background: #ffffff;
            border: 1px solid #eaeaea;
            border-radius: 20px;
            box-shadow: 0 20px 50px rgba(0,0,0,0.06);
            padding: 48px;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
          }
          .product-img {
            background: #f7f7f8;
            border-radius: 14px;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 380px;
            color: #999;
            font-size: 16px;
            font-weight: 500;
          }
          .title { font-size: 26px; font-weight: 700; margin-bottom: 8px; }
          .price { font-size: 22px; font-weight: 600; color: #202223; margin-bottom: 20px; }
          .dropclock-pill {
            background: #f4f6f8;
            border: 1px solid rgba(0,0,0,0.06);
            border-radius: 8px;
            padding: 12px 16px;
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 24px;
          }
          .btn-cart {
            width: 100%;
            background: #111;
            color: white;
            padding: 14px;
            border-radius: 8px;
            font-size: 15px;
            font-weight: 600;
            border: none;
            cursor: pointer;
          }
        </style>
      </head>
      <body>
        <div class="product-card">
          <div class="product-img">
            Premium Leather Weekend Bag
          </div>
          <div>
            <div class="title">Handcrafted Artisan Bag</div>
            <div class="price">$249.00 USD</div>

            <!-- DropClock Capsule Block -->
            <div class="dropclock-pill">
              <div style="color: #008060;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              </div>
              <div>
                <div style="font-size: 13px;">Order within <strong style="color: #008060;">2h 15m</strong> for <strong>Same-Day Dispatch</strong></div>
                <div style="font-size: 12px; color: #666; margin-top: 3px;">Estimated Delivery: <strong>Fri, Oct 3</strong></div>
              </div>
            </div>

            <button class="btn-cart">Add to Cart</button>
            <p style="margin-top: 18px; font-size: 13px; color: #888;">Free 30-day returns · 2-year warranty</p>
          </div>
        </div>
      </body>
      </html>
    `,
  },
  {
    filename: "dropclock-tag-rules-matrix.png",
    title: "DropClock Multi-Market & Tag Logistics (1600x900)",
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
            background: #0b1511;
            color: #ffffff;
            padding: 60px 80px;
          }
          h2 { font-size: 36px; font-weight: 800; margin-bottom: 12px; color: #00d694; }
          p.sub { font-size: 18px; color: #9bb1a8; margin-bottom: 40px; }
          .table-box {
            background: rgba(255, 255, 255, 0.04);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 16px;
            padding: 24px;
          }
          table { width: 100%; border-collapse: collapse; text-align: left; }
          th { padding: 16px; font-size: 14px; text-transform: uppercase; color: #8fa69d; border-bottom: 1px solid rgba(255,255,255,0.1); }
          td { padding: 20px 16px; font-size: 15px; border-bottom: 1px solid rgba(255,255,255,0.06); }
          .tag { display: inline-block; padding: 4px 10px; background: rgba(0, 214, 148, 0.15); border: 1px solid #00d694; color: #00d694; border-radius: 6px; font-size: 13px; }
          .status { color: #00d694; font-weight: 600; }
        </style>
      </head>
      <body>
        <h2>Dynamic Logistics & Multi-Market Matrix</h2>
        <p class="sub">Intelligent tag-based cutoff rules and zero-latency international market detection.</p>
        <div class="table-box">
          <table>
            <thead>
              <tr>
                <th>Condition / Source</th>
                <th>Cutoff Window</th>
                <th>Transit Lead</th>
                <th>Dispatch Target</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Default Standard Products</strong></td>
                <td>14:00 (2:00 PM)</td>
                <td>2 Business Days</td>
                <td>Same-Day Dispatch</td>
                <td><span class="status">● Active</span></td>
              </tr>
              <tr>
                <td><span class="tag">tag: handmade</span></td>
                <td>12:00 (Noon)</td>
                <td>5 Business Days</td>
                <td>Crafting & Dispatch</td>
                <td><span class="status">● Auto-Detected</span></td>
              </tr>
              <tr>
                <td><span class="tag">tag: preorder</span></td>
                <td>Suppressed</td>
                <td>14 Business Days</td>
                <td>Pre-Order Fulfillment</td>
                <td><span class="status">● Auto-Detected</span></td>
              </tr>
              <tr>
                <td><strong>Market: Canada (CA)</strong></td>
                <td>14:00 (2:00 PM)</td>
                <td>+2 Days Transit Offset</td>
                <td>Cross-Border Express</td>
                <td><span class="status">● localization.country</span></td>
              </tr>
              <tr>
                <td><strong>Market: United Kingdom (GB)</strong></td>
                <td>14:00 (2:00 PM)</td>
                <td>+4 Days Transit Offset</td>
                <td>International Air</td>
                <td><span class="status">● localization.country</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </body>
      </html>
    `,
  },
];

async function generate() {
  console.log("=================================================================");
  console.log("  DROPCLOCK APP STORE HIGH-RESOLUTION ASSET PIPELINE (1600x900)  ");
  console.log("=================================================================\n");

  const browser = await chromium.launch({ headless: true });

  for (const asset of assets) {
    const page = await browser.newPage({
      viewport: { width: 1600, height: 900 },
      deviceScaleFactor: 2, // High-DPI Retina output
    });

    await page.setContent(asset.html, { waitUntil: "networkidle" });
    const targetPath = path.join(outputDir, asset.filename);
    await page.screenshot({ path: targetPath, type: "png" });
    await page.close();

    console.log(`✅ Generated: ${asset.filename} (1600x900 @2x Retina) -> ${asset.title}`);
  }

  await browser.close();
  console.log(`\n🎉 All ${assets.length} App Store assets saved successfully in: assets/app-store/`);
}

generate().catch((err) => {
  console.error("Asset generation failed:", err);
  process.exit(1);
});
