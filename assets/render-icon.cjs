// Renders assets/app-icon.svg to the PNG sizes Shopify asks for (1200 listing, 512 fallback).
const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

(async () => {
  const svg = fs.readFileSync(path.join(__dirname, "app-icon.svg"), "utf8");
  const browser = await chromium.launch();
  for (const size of [1200, 512]) {
    const page = await browser.newPage({ viewport: { width: size, height: size } });
    const scaled = svg.replace('width="1200" height="1200"', `width="${size}" height="${size}"`);
    await page.setContent(`<html><body style="margin:0">${scaled}</body></html>`);
    const out = path.join(__dirname, size === 1200 ? "app-icon.png" : `app-icon-${size}.png`);
    await page.screenshot({ path: out, clip: { x: 0, y: 0, width: size, height: size } });
    console.log("wrote", out);
  }
  await browser.close();
})();
