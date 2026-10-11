import React from "react";
import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { title: "Proof of Resolution: Requirement 1.2.2 (Shopify Billing API) — DropClock" },
    { name: "description", content: "Official video screencast and documentation proving compliance with Shopify App Review Requirement 1.2.2 for DropClock." },
  ];
};

export default function ProofBillingRoute() {
  return (
    <div className="min-h-screen bg-[#0f172a] text-[#f8fafc] font-sans antialiased p-4 sm:p-8 flex flex-col items-center">
      <div className="w-full max-w-4xl space-y-6">
        
        {/* Top Header */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#008060] flex items-center justify-center text-xl shadow-lg shadow-emerald-950">
              ⏱️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-white">DropClock</h1>
                <span className="text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                  Partner Review Resolution
                </span>
              </div>
              <p className="text-xs text-slate-400">
                App ID: <code className="text-slate-300 font-mono">0a616a9e934ece36ebebdfd0bb906a9b</code>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Requirement 1.2.2: Resolved
            </span>
          </div>
        </header>

        {/* Screencast Player Card (Loom Style) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
          <div className="p-4 bg-slate-800/60 border-b border-slate-800 flex items-center justify-between text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <span className="text-emerald-400 font-bold">▶</span>
              <span className="font-semibold text-white">Screencast Proof: Shopify Recurring Billing API &amp; Test Flow</span>
            </div>
            <span className="font-mono text-[11px] text-slate-400">1280 × 720 HD</span>
          </div>

          <div className="relative aspect-video bg-black flex items-center justify-center">
            <video
              src="/proof/videos/billing-resolution.webm"
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
              Showing: <strong className="text-slate-200">Plans &amp; Pricing → Test Mode Recurring Charge Flow → Approval Return</strong>
            </span>
            <div className="flex items-center gap-2">
              <a
                href="/proof/videos/billing-resolution.webm"
                target="_blank"
                rel="noreferrer"
                download="DropClock-Billing-Resolution.webm"
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-medium transition-colors border border-slate-700 inline-flex items-center gap-1.5"
              >
                <span>⬇</span> Download Raw Video (.webm)
              </a>
              <a
                href="/preview"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 bg-[#008060] hover:bg-[#006e52] text-white rounded-lg font-semibold transition-colors inline-flex items-center gap-1.5"
              >
                Open Studio Demo →
              </a>
            </div>
          </div>
        </div>

        {/* Detailed Explanation for Shopify Partner Reviewer */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-6 space-y-4 text-xs text-slate-300 leading-relaxed">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <span>📋</span> Resolution Summary for Shopify App Review Team
          </h2>
          
          <div className="space-y-3">
            <p>
              We have fully resolved <strong>Requirement 1.2.2</strong> by integrating recurring application charges using the official <strong>Shopify Remix Billing API</strong> (<code className="text-emerald-400">@shopify/shopify-app-remix</code>):
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              <div className="p-3.5 bg-slate-800/70 rounded-lg border border-slate-700/60">
                <div className="font-semibold text-white mb-1">1. Dedicated Plans &amp; Pricing Portal</div>
                <p className="text-slate-400">
                  Accessible directly via <code className="text-slate-200">/app/pricing</code> and linked in the App Bridge top navigation bar (<code className="text-slate-200">&lt;NavMenu&gt;</code>) and Studio cards.
                </p>
              </div>

              <div className="p-3.5 bg-slate-800/70 rounded-lg border border-slate-700/60">
                <div className="font-semibold text-white mb-1">2. Two Standardized Plans with 7-Day Trials</div>
                <p className="text-slate-400">
                  <strong className="text-slate-200">DropClock Pro Monthly</strong> ($9.99/30 days) and <strong className="text-slate-200">DropClock Pro Annual</strong> ($89.99/year). Both include a 7-Day Free Trial.
                </p>
              </div>

              <div className="p-3.5 bg-slate-800/70 rounded-lg border border-slate-700/60">
                <div className="font-semibold text-white mb-1">3. Risk-Free Reviewer Test Billing Flow</div>
                <p className="text-slate-400">
                  Every subscription request executes <code className="text-emerald-400">billing.request(&#123; isTest: true &#125;)</code>, triggering Shopify&apos;s native charge approval modal without billing real credit cards.
                </p>
              </div>

              <div className="p-3.5 bg-slate-800/70 rounded-lg border border-slate-700/60">
                <div className="font-semibold text-white mb-1">4. State Persistence &amp; Return Handling</div>
                <p className="text-slate-400">
                  Upon approval, Shopify returns to the app where <code className="text-slate-200">billing.check</code> marks the subscription active and displays the confirmation banner.
                </p>
              </div>
            </div>

            <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-lg text-emerald-300">
              <strong>How to Verify on Test Store:</strong> Launch DropClock &rarr; Click <strong>&ldquo;Plans &amp; Pricing&rdquo;</strong> in the top navigation &rarr; Click <strong>&ldquo;Start 7-Day Free Trial&rdquo;</strong> &rarr; Approve the native Shopify test charge.
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
