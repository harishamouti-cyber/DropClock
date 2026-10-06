import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const videosDir = path.join(process.cwd(), "public/listing/videos");
if (!fs.existsSync(videosDir)) {
  fs.mkdirSync(videosDir, { recursive: true });
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function record() {
  console.log("🎬 Starting DropClock Automated Screencast Recording...");

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    recordVideo: {
      dir: videosDir,
      size: { width: 1280, height: 720 },
    },
  });

  const page = await context.newPage();

  // Navigate to live preview
  console.log("🌐 Loading DropClock Studio Preview...");
  await page.goto("https://drop-clock-zeta.vercel.app/preview", {
    waitUntil: "networkidle",
    timeout: 30000,
  });

  await sleep(2000);

  // 1. Initial overview
  console.log("👉 Showcase DropClock Studio Header & Badges...");
  await page.mouse.move(200, 40);
  await sleep(1500);

  // 2. Adjust Cutoff Hour
  console.log("👉 Adjusting Cutoff Hour...");
  const plusButtons = await page.$$("button");
  for (const btn of plusButtons) {
    const text = await btn.textContent();
    if (text && text.includes("+")) {
      await btn.click();
      await sleep(1000);
      await btn.click();
      await sleep(1000);
      break;
    }
  }

  // 3. Toggle Operating Days
  console.log("👉 Toggling Operating Days...");
  const dayButtons = await page.$$("button");
  for (const btn of dayButtons) {
    const text = await btn.textContent();
    if (text === "S" || text === "Sa") {
      await btn.click();
      await sleep(1200);
      break;
    }
  }

  // 4. Hover over live countdown pill on product page
  console.log("👉 Inspecting Storefront Product Page Countdown Pill...");
  await page.mouse.move(850, 380, { steps: 20 });
  await sleep(2500);

  // 5. Switch to Cart Drawer tab
  console.log("👉 Switching to Cart Drawer surface...");
  const cartTab = await page.$("button:has-text('Cart Drawer')");
  if (cartTab) {
    await cartTab.click();
    await sleep(2000);

    // Click near subtotal chip if present
    const chips = await page.$$("button");
    for (const chip of chips) {
      const txt = await chip.textContent();
      if (txt && (txt.includes("60.95") || txt.includes("Near"))) {
        await chip.click();
        await sleep(2000);
        break;
      }
    }
  }

  // 6. Switch to Order Status tab
  console.log("👉 Switching to Order Status SLA timeline...");
  const orderTab = await page.$("button:has-text('Order Status')");
  if (orderTab) {
    await orderTab.click();
    await sleep(3000);
  }

  // 7. Toggle Mobile Responsive View
  console.log("👉 Toggling Mobile (375px) responsive preview...");
  const mobileBtn = await page.$("button:has-text('Mobile')");
  if (mobileBtn) {
    await mobileBtn.click();
    await sleep(2500);
    const desktopBtn = await page.$("button:has-text('Desktop')");
    if (desktopBtn) {
      await desktopBtn.click();
      await sleep(1500);
    }
  }

  // 8. Highlight Theme Editor Action
  console.log("👉 Highlighting Add to Theme Editor...");
  const themeBtn = await page.$("button:has-text('Add to Theme Editor')");
  if (themeBtn) {
    const box = await themeBtn.boundingBox();
    if (box) {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 15 });
      await sleep(2000);
    }
  }

  await sleep(2000);

  // Close context to finish writing video
  console.log("💾 Finalizing and saving video stream...");
  await page.close();
  await context.close();
  await browser.close();

  // Find generated video
  const files = fs.readdirSync(videosDir).filter((f) => f.endsWith(".webm"));
  if (files.length > 0) {
    const latestFile = path.join(videosDir, files[files.length - 1]);
    const finalPath = path.join(process.cwd(), "public/listing/dropclock-screencast.webm");
    fs.copyFileSync(latestFile, finalPath);
    const stat = fs.statSync(finalPath);
    console.log(`🎉 Screencast video saved: ${finalPath} (${(stat.size / 1024 / 1024).toFixed(2)} MB)`);
  }
}

record().catch((err) => {
  console.error("❌ Recording error:", err);
  process.exit(1);
});
