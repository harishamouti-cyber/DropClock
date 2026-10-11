import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const outputDir = path.join(process.cwd(), "public/proof/videos");
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function recordSimulation(htmlFile, outputVideoName, durationMs = 14000) {
  console.log(`🎬 Recording ${outputVideoName} from ${htmlFile}...`);

  const tempVideoDir = path.join(process.cwd(), "public/proof/temp_" + Date.now());
  fs.mkdirSync(tempVideoDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    recordVideo: {
      dir: tempVideoDir,
      size: { width: 1280, height: 720 },
    },
  });

  const page = await context.newPage();
  const fileUrl = "file://" + path.resolve(htmlFile);

  await page.goto(fileUrl, { waitUntil: "networkidle" });
  await new Promise((r) => setTimeout(r, durationMs));

  await page.close();
  await context.close();
  await browser.close();

  // Find generated video
  const files = fs.readdirSync(tempVideoDir).filter((f) => f.endsWith(".webm"));
  if (files.length > 0) {
    const recordedFile = path.join(tempVideoDir, files[0]);
    const targetFile = path.join(outputDir, outputVideoName);
    fs.copyFileSync(recordedFile, targetFile);
    const stat = fs.statSync(targetFile);
    console.log(`✅ Saved ${targetFile} (${(stat.size / 1024 / 1024).toFixed(2)} MB)`);
  }

  // Clean temp dir
  fs.rmSync(tempVideoDir, { recursive: true, force: true });
}

async function main() {
  await recordSimulation(
    "scripts/billing-simulation.html",
    "billing-resolution.webm",
    15000
  );

  await recordSimulation(
    "scripts/theme-simulation.html",
    "theme-extension-resolution.webm",
    14000
  );

  console.log("🎉 All proof videos successfully generated!");
}

main().catch((err) => {
  console.error("❌ Error generating proof videos:", err);
  process.exit(1);
});
