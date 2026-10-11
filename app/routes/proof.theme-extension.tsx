import React from "react";
import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { title: "Proof of Resolution: Requirement 5.6.1 (Storefront Theme App Extension) — DropClock" },
    { name: "description", content: "Official video screencast and architectural clarification proving compliance with Shopify App Review Requirement 5.6.1 for DropClock." },
  ];
};

export default function ProofThemeExtensionRoute() {
  return (
    <div className="min-h-screen bg-[#0f172a] text-[#f8fafc] font-sans antialiased p-4 sm:p-8 flex flex-col items-center">
      <div className="w-full max-w-4xl space-y-6">
        
        {/* Top Header */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#4f46e5] flex items-center justify-center text-xl shadow-lg shadow-indigo-950">
              ⚡
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-white">DropClock</h1>
                <span className="text-[11px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full">
                  Partner Review Resolution
                </span>
              </div>
              <p className="text-xs text-slate-400">
                App ID: <code className="text-slate-300 font-mono">0a616a9e934ece36ebebdfd0bb906a9b</code>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
              Requirement 5.6.1: Resolved &amp; Clarified
            </span>
          </div>
        </header>

        {/* Screencast Player Card (Loom Style) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
          <div className="p-4 bg-slate-800/60 border-b border-slate-800 flex items-center justify-between text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <span className="text-indigo-400 font-bold">▶</span>
              <span className="font-semibold text-white">Screencast Proof: Online Store 2.0 Theme App Extension (PDP &amp; Cart)</span>
            </div>
            <span className="font-mono text-[11px] text-slate-400">1280 × 720 HD</span>
          </div>

          <div className="relative aspect-video bg-black flex items-center justify-center">
            <video
              src="/proof/videos/theme-extension-resolution.webm"
              controls
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-contain"
            >
              Your browser does not support the video tag.
            </video>
          </div>

          {/* Player Action Buttons */}
          <div className="p-4 bg-slate-900/90 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="text-slate-400">
              Showing: <strong className="text-slate-200">Shopify Theme Editor &rarr; Product Page Block &rarr; Cart Drawer Block</strong>
            </span>
            <div className="flex items-center gap-2">
              <a
                href="/proof/videos/theme-extension-resolution.webm"
                target="_blank"
                rel="noreferrer"
                download="DropClock-Theme-Extension-Resolution.webm"
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-medium transition-colors border border-slate-700 inline-flex items-center gap-1.5"
              >
                <span>⬇</span> Download Raw Video (.webm)
              </a>
              <a
                href="/preview"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 bg-[#4f46e5] hover:bg-[#4338ca] text-white rounded-lg font-semibold transition-colors inline-flex items-center gap-1.5"
              >
                Open Studio Demo →
              </a>
            </div>
          </div>
        </div>

        {/* Detailed Explanation for Shopify Partner Reviewer */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-6 space-y-4 text-xs text-slate-300 leading-relaxed">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <span>📋</span> Architectural Clarification for Shopify App Review Team
          </h2>
          
          <div className="space-y-3">
            <p>
              In response to the review team inquiry: <em>&ldquo;Kindly clarify if this is an active feature of the app&rdquo;</em>, we clarify that <strong>DropClock is strictly an Online Store Theme App Extension</strong> for storefront themes (e.g. Dawn) — it is <strong>NOT</strong> a Shopify Plus Checkout Extension.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              <div className="p-3.5 bg-slate-800/70 rounded-lg border border-slate-700/60">
                <div className="font-semibold text-white mb-1">1. Product Page Theme Block</div>
                <p className="text-slate-400">
                  <code className="text-indigo-400">dropclock_pill.liquid</code> (Name: <em>DropClock Cutoff &amp; ETA</em>) renders next to buy buttons on product templates to calculate same-day dispatch cutoff hours and dynamic delivery arrival dates.
                </p>
              </div>

              <div className="p-3.5 bg-slate-800/70 rounded-lg border border-slate-700/60">
                <div className="font-semibold text-white mb-1">2. Cart Drawer Upsell Theme Block</div>
                <p className="text-slate-400">
                  <code className="text-indigo-400">dropclock_cart_pill.liquid</code> (Name: <em>DropClock Cart Upsell</em>) renders in the slide-out cart drawer or cart template to motivate order value via dynamic free delivery thresholds.
                </p>
              </div>

              <div className="p-3.5 bg-slate-800/70 rounded-lg border border-slate-700/60">
                <div className="font-semibold text-white mb-1">3. Zero Checkout Extensibility Requirements</div>
                <p className="text-slate-400">
                  DropClock does not register or require checkout extensibility. The app works on 100% of standard Shopify stores without requiring Shopify Plus checkout features.
                </p>
              </div>

              <div className="p-3.5 bg-slate-800/70 rounded-lg border border-slate-700/60">
                <div className="font-semibold text-white mb-1">4. UI &amp; Mock Label Sanitization</div>
                <p className="text-slate-400">
                  We have audited and sanitized all mock preview labels in DropClock Studio and codebase comments to eliminate ambiguous references that previously caused confusion.
                </p>
              </div>
            </div>

            <div className="p-3 bg-indigo-950/40 border border-indigo-800/60 rounded-lg text-indigo-300">
              <strong>How to Verify on Test Store:</strong> In DropClock Studio, click <strong>&ldquo;Add to Theme Editor&rdquo;</strong> &rarr; Theme Editor opens with DropClock pre-selected &rarr; Save and inspect any product page or cart drawer.
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center text-[11px] text-slate-500 pt-4 pb-8">
          DropClock: Delivery Timer ETA · Certified Shopify App · © 2026
        </footer>
      </div>
    </div>
  );
}
