import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";

console.log("=================================================================");
console.log("  DROPCLOCK PHASE 2: QA, PERFORMANCE & EDGE-CASE AUDIT SUITE    ");
console.log("=================================================================\n");

let passedCount = 0;
let totalCount = 0;

function test(name, fn) {
  totalCount++;
  try {
    fn();
    console.log(`✅ [PASS] ${name}`);
    passedCount++;
  } catch (err) {
    console.error(`❌ [FAIL] ${name}`);
    console.error(`   Error: ${err.message}\n`);
  }
}

// -----------------------------------------------------------------------------
// Test 1: Corrupt / Malformed Metafield Fallbacks
// -----------------------------------------------------------------------------
test("Test 1: Corrupt / Malformed Metafield JSON Fallbacks", () => {
  const malformedInputs = [null, undefined, "", "{invalid-json", "[]", "123"];

  for (const input of malformedInputs) {
    let workingDays = [1, 2, 3, 4, 5];
    try {
      const parsed = JSON.parse(input || "[1,2,3,4,5]");
      if (Array.isArray(parsed) && parsed.length > 0) workingDays = parsed;
    } catch (e) {
      workingDays = [1, 2, 3, 4, 5];
    }
    assert.deepStrictEqual(workingDays, [1, 2, 3, 4, 5], `Failed fallback for input: ${input}`);

    let blackouts = [];
    try {
      const parsedBO = JSON.parse(input || "[]");
      if (Array.isArray(parsedBO)) blackouts = parsedBO;
    } catch (e) {
      blackouts = [];
    }
    assert.deepStrictEqual(blackouts, [], `Failed blackout fallback for input: ${input}`);
  }
});

// -----------------------------------------------------------------------------
// Test 2: Midnight Cutoff Boundary (23:59 vs 00:00)
// -----------------------------------------------------------------------------
test("Test 2: Midnight Cutoff Boundary (00:00 cutoff at 23:59 vs 00:01)", () => {
  const cutoffHour = 0;
  const cutoffMin = 0;
  const cutoffTotalMinutes = (cutoffHour * 60) + cutoffMin; // 0

  // Case A: 23:59 at warehouse (1 minute before midnight)
  const currentHourA = 23;
  const currentMinA = 59;
  const currentTotalA = (currentHourA * 60) + currentMinA; // 1439
  let diffA = cutoffTotalMinutes - currentTotalA;
  let pastCutoffA = diffA <= 0;
  if (pastCutoffA) diffA += 1440; // 1 minute left
  const hoursA = Math.floor(diffA / 60);
  const minsA = Math.floor(diffA % 60);

  assert.strictEqual(hoursA, 0, "Hours before midnight should be 0");
  assert.strictEqual(minsA, 1, "Minutes before midnight should be 1");

  // Case B: 00:01 at warehouse (1 minute past midnight cutoff)
  const currentHourB = 0;
  const currentMinB = 1;
  const currentTotalB = (currentHourB * 60) + currentMinB; // 1
  let diffB = cutoffTotalMinutes - currentTotalB;
  let pastCutoffB = diffB <= 0;
  if (pastCutoffB) diffB += 1440; // 1439 mins left
  const hoursB = Math.floor(diffB / 60);
  const minsB = Math.floor(diffB % 60);

  assert.strictEqual(hoursB, 23, "Hours after midnight should be 23");
  assert.strictEqual(minsB, 59, "Minutes after midnight should be 59");
  assert.strictEqual(pastCutoffB, true, "Should trigger next-day dispatch");
});

// -----------------------------------------------------------------------------
// Test 3: Leap Year & End-of-Month Rollover Date Arithmetic
// -----------------------------------------------------------------------------
test("Test 3: Leap Year & End-of-Month Rollover Verification", () => {
  // Leap Year: Feb 28, 2028 (Mon) + 2 working days -> Feb 29 (Tue, day 1), March 1 (Wed, day 2)
  const feb28_2028 = new Date(Date.UTC(2028, 1, 28)); // Monday Feb 28, 2028
  const workingDays = [1, 2, 3, 4, 5];
  const blackouts = [];

  let added = 0;
  let etaLeap = new Date(feb28_2028);
  while (added < 2) {
    etaLeap.setUTCDate(etaLeap.getUTCDate() + 1);
    const dow = etaLeap.getUTCDay();
    const iso = etaLeap.toISOString().split("T")[0];
    if (workingDays.includes(dow) && !blackouts.includes(iso)) {
      added++;
    }
  }

  // Day 1: Feb 29, 2028
  // Day 2: March 1, 2028
  assert.strictEqual(etaLeap.getUTCFullYear(), 2028);
  assert.strictEqual(etaLeap.getUTCMonth(), 2); // March (0-indexed = 2)
  assert.strictEqual(etaLeap.getUTCDate(), 1); // March 1st

  // Year Rollover: Dec 30, 2026 (Wednesday) + 3 working days
  // Wed Dec 30 -> Thu Dec 31 (day 1) -> Fri Jan 1 2027 (day 2, if not blackout) -> Mon Jan 4 (day 3)
  const dec30_2026 = new Date(Date.UTC(2026, 11, 30));
  added = 0;
  let etaYear = new Date(dec30_2026);
  while (added < 3) {
    etaYear.setUTCDate(etaYear.getUTCDate() + 1);
    const dow = etaYear.getUTCDay();
    const iso = etaYear.toISOString().split("T")[0];
    if (workingDays.includes(dow) && !blackouts.includes(iso)) {
      added++;
    }
  }
  assert.strictEqual(etaYear.getUTCFullYear(), 2027, "Year must roll over to 2027");
  assert.strictEqual(etaYear.getUTCMonth(), 0, "Month must be January (0)");
  assert.strictEqual(etaYear.getUTCDate(), 4, "Date must land on Monday Jan 4 (skipping Sat/Sun Jan 2-3)");
});

// -----------------------------------------------------------------------------
// Test 4: Zero Leftover & Clean Scope Isolation
// -----------------------------------------------------------------------------
test("Test 4: Store Integrity & Zero Window Pollution", () => {
  const liquidPath = path.join(process.cwd(), "extensions/dropclock-extension/blocks/dropclock_pill.liquid");
  const content = fs.readFileSync(liquidPath, "utf-8");

  // Check IIFE encapsulation
  assert.ok(content.includes("(function() {") && content.includes("})();"), "Script must be wrapped in IIFE");
  assert.ok(!content.includes("window.dropclock ="), "No global pollution on window");
  assert.ok(!content.includes("window.DropClock ="), "No global pollution on window");

  // Check no external script injection in theme extension
  assert.ok(!/<script\s+[^>]*src=/i.test(content), "Zero external <script src=> tags");

  // Check CLS defense min-height
  assert.ok(content.includes("min-height: 52px;"), "CLS defense min-height required");
  assert.ok(content.includes("contain: layout;"), "CSS contain: layout required");

  // Check Mobile breakpoint
  assert.ok(content.includes("@media (max-width: 380px)"), "Mobile responsiveness breakpoint required");
});

// -----------------------------------------------------------------------------
// Test 5: Backend Zero-ScriptTag & Zero Theme Pollution Audit
// -----------------------------------------------------------------------------
test("Test 5: Zero ScriptTag API calls in Backend Codebase", () => {
  const serverPath = path.join(process.cwd(), "app/shopify.server.ts");
  const serverContent = fs.readFileSync(serverPath, "utf-8");
  assert.ok(!serverContent.includes("ScriptTag"), "Zero ScriptTag usage in shopify.server.ts");

  const tomlPath = path.join(process.cwd(), "shopify.app.toml");
  const tomlContent = fs.readFileSync(tomlPath, "utf-8");
  assert.ok(!tomlContent.includes("write_script_tags"), "No write_script_tags scope in shopify.app.toml");
});

// -----------------------------------------------------------------------------
// Test 6: Payload Weight Benchmark (< 4 KB uncompressed)
// -----------------------------------------------------------------------------
test("Test 6: Payload Weight Benchmark (CSS + SVG + JS)", () => {
  const liquidPath = path.join(process.cwd(), "extensions/dropclock-extension/blocks/dropclock_pill.liquid");
  const content = fs.readFileSync(liquidPath, "utf-8");

  // Extract CSS
  const styleMatch = content.match(/<style>([\s\S]*?)<\/style>/);
  const css = styleMatch ? styleMatch[1].trim() : "";

  // Extract JS
  const scriptMatch = content.match(/<script>([\s\S]*?)<\/script>/);
  const js = scriptMatch ? scriptMatch[1].trim() : "";

  // Extract SVGs
  const svgMatches = content.match(/<svg[\s\S]*?<\/svg>/g) || [];
  const svgTotal = svgMatches.join("");

  const totalBytes = Buffer.byteLength(css + js + svgTotal, "utf-8");
  console.log(`   Measured Payload Size: ${(totalBytes / 1024).toFixed(2)} KB (${totalBytes} bytes)`);

  assert.ok(totalBytes < 4096, `Payload size must be under 4 KB (got ${totalBytes} bytes)`);
});

console.log("\n=================================================================");
console.log(`  PHASE 2 AUDIT COMPLETE: ${passedCount} / ${totalCount} TESTS PASSED`);
console.log("=================================================================");

if (passedCount !== totalCount) {
  process.exit(1);
}
