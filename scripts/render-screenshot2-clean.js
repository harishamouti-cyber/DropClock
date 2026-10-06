import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const outputPath = path.join(process.cwd(), "public/listing/screenshot-2-product-1600x900.png");

const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
    body {
      width: 1600px;
      height: 900px;
      background: #ffffff;
      color: #0f172a;
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 0;
      overflow: hidden;
    }

    /* Full-bleed Storefront Navigation Bar */
    .store-nav {
      height: 70px;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 100px;
      background: #ffffff;
    }
    .store-brand {
      font-size: 20px;
      font-weight: 800;
      letter-spacing: -0.5px;
      color: #0f172a;
    }
    .store-links {
      display: flex;
      gap: 32px;
      font-size: 14px;
      font-weight: 500;
      color: #64748b;
    }
    .store-cart-icon {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      font-weight: 600;
      color: #0f172a;
    }

    /* Main Full-Bleed Product Layout */
    .product-stage {
      flex: 1;
      display: grid;
      grid-template-columns: 750px 1fr;
      padding: 50px 100px;
      gap: 80px;
      align-items: center;
      background: #fafafa;
    }

    /* Product Gallery */
    .product-gallery {
      background: #f1f5f9;
      border: 1px solid #e2e8f0;
      border-radius: 24px;
      height: 680px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
    }
    .product-svg {
      width: 320px;
      height: 320px;
      fill: #1e293b;
      filter: drop-shadow(0 20px 30px rgba(0, 0, 0, 0.12));
    }

    /* Product Details */
    .product-details {
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    .stock-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #008060;
      margin-bottom: 12px;
    }
    .product-title {
      font-size: 42px;
      font-weight: 800;
      letter-spacing: -1px;
      line-height: 1.15;
      color: #0f172a;
      margin-bottom: 10px;
    }
    .product-price {
      font-size: 28px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 24px;
    }
    .variant-label {
      font-size: 13px;
      font-weight: 600;
      color: #475569;
      margin-bottom: 10px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .variant-chips {
      display: flex;
      gap: 10px;
      margin-bottom: 28px;
    }
    .chip {
      padding: 10px 20px;
      border-radius: 10px;
      border: 1.5px solid #e2e8f0;
      font-size: 14px;
      font-weight: 600;
      color: #334155;
      background: #ffffff;
    }
    .chip.selected {
      border-color: #008060;
      background: #f0fdf4;
      color: #008060;
    }

    /* THE HERO DROPCLOCK COUNTDOWN PILL */
    .dropclock-pill {
      background: #f0fdf4;
      border: 1.5px solid #86efac;
      border-radius: 14px;
      padding: 18px 22px;
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 24px;
      box-shadow: 0 4px 16px rgba(16, 185, 129, 0.1);
    }
    .pill-icon {
      width: 44px;
      height: 44px;
      background: #ffffff;
      border: 1.5px solid #86efac;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #008060;
      flex-shrink: 0;
      box-shadow: 0 2px 8px rgba(0, 128, 96, 0.15);
    }
    .pill-title {
      font-size: 15px;
      font-weight: 700;
      color: #0f172a;
    }
    .pill-title strong {
      color: #008060;
      font-weight: 800;
    }
    .pill-subtitle {
      font-size: 13px;
      color: #047857;
      margin-top: 3px;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    /* Add to Cart Button */
    .btn-add-to-cart {
      background: #0f172a;
      color: #ffffff;
      border: none;
      border-radius: 14px;
      padding: 20px;
      font-size: 16px;
      font-weight: 700;
      width: 100%;
      cursor: pointer;
      box-shadow: 0 8px 20px rgba(15, 23, 42, 0.18);
    }
  </style>
</head>
<body>
  <!-- Clean Storefront Nav (No browser UI) -->
  <nav class="store-nav">
    <div class="store-brand">DAWN STORE</div>
    <div class="store-links">
      <span>Apparel</span>
      <span>New Arrivals</span>
      <span>Fulfillment</span>
    </div>
    <div class="store-cart-icon">Cart (0)</div>
  </nav>

  <!-- Full-Bleed Product Stage -->
  <div class="product-stage">
    <div class="product-gallery">
      <svg class="product-svg" viewBox="0 0 120 120">
        <path d="M 40 16 C 45 24 75 24 80 16 L 104 28 L 92 46 L 82 40 L 82 100 C 82 102 80 104 78 104 L 42 104 C 40 104 38 102 38 100 L 38 40 L 28 46 L 16 28 Z" />
      </svg>
    </div>

    <div class="product-details">
      <div class="stock-badge">● In Stock · Priority Dispatch</div>
      <h1 class="product-title">Classic Boxy Crewneck</h1>
      <div class="product-price">$42.00 USD</div>

      <div class="variant-label">Select Size</div>
      <div class="variant-chips">
        <div class="chip">S</div>
        <div class="chip selected">M</div>
        <div class="chip">L</div>
        <div class="chip">XL</div>
      </div>

      <!-- THE REAL DROPCLOCK COUNTDOWN PILL -->
      <div class="dropclock-pill">
        <div class="pill-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="#008060" stroke-width="2" />
            <path d="M12 7V12L15 14" stroke="#008060" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            <circle cx="12" cy="3" r="1.5" fill="#008060" />
          </svg>
        </div>
        <div>
          <div class="pill-title">Order within <strong>2h 40m 15s</strong> for same-day dispatch</div>
          <div class="pill-subtitle">
            <span>⚡ Dispatched Today · Estimated Delivery: <strong>Wednesday, Oct 7</strong></span>
          </div>
        </div>
      </div>

      <button class="btn-add-to-cart">Add to Cart • $42.00</button>
    </div>
  </div>
</body>
</html>
`;

async function render() {
  console.log("🚀 Rendering full-bleed Screenshot 2 (no browser/desktop chrome)...");
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
  console.log(`✅ Success! Rendered Screenshot 2: ${outputPath} (${(stats.size / 1024).toFixed(1)} KB)`);
}

render().catch((err) => {
  console.error("❌ Error rendering screenshot 2:", err);
  process.exit(1);
});
