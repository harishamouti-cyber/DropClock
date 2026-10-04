const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const options = [
  {
    id: "option-1",
    name: "Precision Chrono-Drop",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512" fill="none">
      <defs>
        <radialGradient id="bg1" cx="50%" cy="30%" r="70%">
          <stop offset="0%" stop-color="#009973"/>
          <stop offset="100%" stop-color="#004d3a"/>
        </radialGradient>
        <linearGradient id="drop1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#a7f3d0"/>
          <stop offset="100%" stop-color="#34d399"/>
        </linearGradient>
      </defs>
      <rect width="512" height="512" rx="110" fill="url(#bg1)"/>
      <!-- Outer Dial -->
      <circle cx="256" cy="275" r="145" stroke="#ffffff" stroke-width="26" stroke-linecap="round"/>
      <!-- Top Crown Drop -->
      <path d="M256 55 C256 55 205 118 205 152 C205 180 228 202 256 202 C284 202 307 180 307 152 C307 118 256 55 256 55 Z" fill="url(#drop1)"/>
      <!-- Cutoff Tick Indicator at 2 o'clock -->
      <line x1="335" y1="196" x2="355" y2="176" stroke="#a7f3d0" stroke-width="20" stroke-linecap="round"/>
      <!-- Clock Hands -->
      <line x1="256" y1="275" x2="256" y2="190" stroke="#ffffff" stroke-width="24" stroke-linecap="round"/>
      <line x1="256" y1="275" x2="320" y2="312" stroke="#ffffff" stroke-width="24" stroke-linecap="round"/>
      <!-- Pivot Center -->
      <circle cx="256" cy="275" r="16" fill="#a7f3d0"/>
    </svg>`
  },
  {
    id: "option-2",
    name: "Velocity Radar Arc",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512" fill="none">
      <defs>
        <linearGradient id="bg2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#18181b"/>
          <stop offset="100%" stop-color="#09090b"/>
        </linearGradient>
        <linearGradient id="arc2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#10b981"/>
          <stop offset="100%" stop-color="#008060"/>
        </linearGradient>
      </defs>
      <rect width="512" height="512" rx="110" fill="url(#bg2)"/>
      <!-- Glowing Background Halo -->
      <circle cx="256" cy="256" r="170" fill="#008060" opacity="0.15"/>
      <!-- Background track -->
      <circle cx="256" cy="256" r="145" stroke="#27272a" stroke-width="28"/>
      <!-- Countdown Progress Arc (approx 75% complete) -->
      <path d="M 256 111 A 145 145 0 1 1 153 153" stroke="url(#arc2)" stroke-width="28" stroke-linecap="round"/>
      <!-- Cutoff Pulse Marker -->
      <circle cx="256" cy="111" r="22" fill="#10b981"/>
      <circle cx="256" cy="111" r="12" fill="#ffffff"/>
      <!-- Fast Forward / Velocity Arrow Hands -->
      <path d="M 230 200 L 295 256 L 230 312" stroke="#ffffff" stroke-width="30" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M 180 216 L 235 256 L 180 296" stroke="#10b981" stroke-width="22" stroke-linecap="round" stroke-linejoin="round" opacity="0.8"/>
    </svg>`
  },
  {
    id: "option-3",
    name: "Geometric Monogram D",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512" fill="none">
      <defs>
        <linearGradient id="bg3" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#008060"/>
          <stop offset="100%" stop-color="#005e46"/>
        </linearGradient>
      </defs>
      <rect width="512" height="512" rx="110" fill="url(#bg3)"/>
      <!-- Iconic 'D' Monogram Clock -->
      <!-- Vertical Timer Stem (Droplet shape integrated) -->
      <rect x="110" y="116" width="46" height="280" rx="23" fill="#ffffff"/>
      <!-- Top Droplet Notch on the D -->
      <path d="M133 72 C133 72 110 98 110 114 C110 126 120 136 133 136 C146 136 156 126 156 114 C156 98 133 72 133 72 Z" fill="#6ee7b7"/>
      <!-- Curved D Semi-Circle Arc acting as Clock Dial -->
      <path d="M 140 136 C 290 136 376 186 376 256 C 376 326 290 376 140 376" stroke="#ffffff" stroke-width="44" stroke-linecap="round"/>
      <!-- Clock Hands inside the D -->
      <line x1="230" y1="256" x2="230" y2="195" stroke="#6ee7b7" stroke-width="26" stroke-linecap="round"/>
      <line x1="230" y1="256" x2="295" y2="256" stroke="#ffffff" stroke-width="26" stroke-linecap="round"/>
      <circle cx="230" cy="256" r="16" fill="#6ee7b7"/>
    </svg>`
  },
  {
    id: "option-4",
    name: "Express Delivery Parcel Clock",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512" fill="none">
      <defs>
        <linearGradient id="bg4" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#f0fdf4"/>
          <stop offset="100%" stop-color="#dcfce7"/>
        </linearGradient>
        <linearGradient id="boxFront" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#008060"/>
          <stop offset="100%" stop-color="#004d3a"/>
        </linearGradient>
      </defs>
      <rect width="512" height="512" rx="110" fill="url(#bg4)"/>
      <rect x="2" y="2" width="508" height="508" rx="108" stroke="#86efac" stroke-width="6"/>
      <!-- Main Badge Container -->
      <rect x="106" y="106" width="300" height="300" rx="60" fill="url(#boxFront)"/>
      <!-- Integrated Clock Face -->
      <circle cx="256" cy="256" r="95" stroke="#ffffff" stroke-width="18"/>
      <!-- Top Delivery Wing / Drop Tape -->
      <path d="M256 66 L276 106 L236 106 Z" fill="#008060"/>
      <!-- Clock hands pointing at Same-Day Cutoff -->
      <line x1="256" y1="256" x2="256" y2="198" stroke="#a7f3d0" stroke-width="18" stroke-linecap="round"/>
      <line x1="256" y1="256" x2="305" y2="280" stroke="#ffffff" stroke-width="18" stroke-linecap="round"/>
      <circle cx="256" cy="256" r="14" fill="#a7f3d0"/>
      <!-- Express Dispatch Lightning Flash on Corner -->
      <path d="M 335 125 L 365 170 L 342 173 L 360 215 L 320 178 L 340 174 Z" fill="#facc15" stroke="#ca8a04" stroke-width="3"/>
    </svg>`
  },
  {
    id: "option-5",
    name: "Minimalist Cutoff Capsule",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512" fill="none">
      <defs>
        <linearGradient id="bg5" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#008060"/>
          <stop offset="100%" stop-color="#00664d"/>
        </linearGradient>
        <linearGradient id="pill5" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="100%" stop-color="#f4f4f5"/>
        </linearGradient>
      </defs>
      <rect width="512" height="512" rx="110" fill="url(#bg5)"/>
      <!-- Central Horizontal Pill / Capsule (Storefront widget shape) -->
      <rect x="76" y="166" width="360" height="180" rx="90" fill="url(#pill5)" filter="drop-shadow(0 14px 28px rgba(0,0,0,0.22))"/>
      <!-- Circular Stopwatch Embedded on Left of Pill -->
      <circle cx="166" cy="256" r="58" stroke="#18181b" stroke-width="14"/>
      <!-- Stopwatch Top Push-button -->
      <line x1="166" y1="184" x2="166" y2="174" stroke="#18181b" stroke-width="12" stroke-linecap="round"/>
      <!-- Mini Hands -->
      <line x1="166" y1="256" x2="166" y2="222" stroke="#008060" stroke-width="12" stroke-linecap="round"/>
      <line x1="166" y1="256" x2="194" y2="268" stroke="#18181b" stroke-width="12" stroke-linecap="round"/>
      <circle cx="166" cy="256" r="9" fill="#008060"/>
      <!-- Urgency Delivery Wave / Cutoff Dash on Right of Pill -->
      <rect x="250" y="234" width="130" height="16" rx="8" fill="#008060"/>
      <rect x="250" y="262" width="85" height="14" rx="7" fill="#a1a1aa"/>
      <circle cx="395" cy="242" r="8" fill="#10b981"/>
    </svg>`
  }
];

(async () => {
  const browser = await chromium.launch();
  for (const opt of options) {
    const page = await browser.newPage({ viewport: { width: 512, height: 512 } });
    await page.setContent(`<!DOCTYPE html><html><body style="margin:0;padding:0;background:transparent">${opt.svg}</body></html>`);
    const pngPath = path.join(__dirname, `${opt.id}.png`);
    const svgPath = path.join(__dirname, `${opt.id}.svg`);
    fs.writeFileSync(svgPath, opt.svg);
    await page.screenshot({ path: pngPath, clip: { x: 0, y: 0, width: 512, height: 512 } });
    console.log(`Generated ${opt.name} -> ${pngPath}`);
  }
  await browser.close();
  console.log("All 5 options generated successfully!");
})();
