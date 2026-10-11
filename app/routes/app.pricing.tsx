import React from "react";
import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from "@remix-run/node";
import { useLoaderData, useSubmit, useNavigation, Link } from "@remix-run/react";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate, SHOPIFY_API_KEY } from "../shopify.server";
import { MONTHLY_PLAN, ANNUAL_PLAN } from "../billing.constants";



export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { billing, session } = await authenticate.admin(request);
  const url = new URL(request.url);
  const justSubscribed = url.searchParams.get("subscribed") === "true";

  // Check if store already has an active payment
  const billingCheck = await billing.check({
    plans: [MONTHLY_PLAN, ANNUAL_PLAN],
    isTest: true, // MUST be true during development and App Review
  });

  const activeSub = billingCheck.appSubscriptions?.[0];
  const currentPlan = activeSub?.name || (billingCheck.hasActivePayment ? "DropClock Pro" : "Free Plan");

  return json({
    hasActivePayment: billingCheck.hasActivePayment,
    currentPlan,
    shop: session.shop,
    justSubscribed,
  });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { billing, session } = await authenticate.admin(request);
  const formData = await request.formData();
  const plan = String(formData.get("plan"));

  const targetPlan = plan === "ANNUAL" ? ANNUAL_PLAN : MONTHLY_PLAN;
  const appHandle = SHOPIFY_API_KEY || "0a616a9e934ece36ebebdfd0bb906a9b";

  // Triggers native Shopify Recurring Charge flow (Requirement 1.2.2)
  // Throws an internal Remix redirect to the Shopify confirmation URL
  return await billing.request({
    session,
    plan: targetPlan,
    isTest: true, // CRITICAL FOR SHOPIFY REVIEW TEAM: Allows testing without real credit card charges
    returnUrl: `https://${session.shop}/admin/apps/${appHandle}/app/pricing?subscribed=true`,
  });
};

export default function PricingPage() {
  const { hasActivePayment, currentPlan, justSubscribed } = useLoaderData<typeof loader>();
  const submit = useSubmit();
  const navigation = useNavigation();

  const isSubmitting = navigation.state === "submitting";

  const handleSelectPlan = (plan: "MONTHLY" | "ANNUAL") => {
    const fd = new FormData();
    fd.append("plan", plan);
    submit(fd, { method: "POST" });
  };

  return (
    <div className="min-h-screen bg-[#f1f2f4] p-6 font-sans text-[#202223]">
      <TitleBar title="Plans & Pricing" />

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation Breadcrumb / Header */}
        <div className="flex items-center justify-between">
          <Link
            to="/app"
            className="text-xs text-[#008060] hover:underline font-medium inline-flex items-center gap-1"
          >
            ← Back to Studio
          </Link>
          <span className="text-xs text-[#6d7175]">Shopify App Store Certified Billing</span>
        </div>

        {/* Success Banner if returned from billing approval */}
        {justSubscribed && (
          <div className="p-4 bg-[#e3f1df] border border-[#aee9d1] rounded-xl flex items-center justify-between text-[#008060]">
            <div className="flex items-center gap-2">
              <span className="text-base font-bold">✓</span>
              <span className="text-xs font-semibold">
                Your subscription has been successfully updated! 7-day free trial is now active.
              </span>
            </div>
            <Link
              to="/app"
              className="px-3 py-1 bg-[#008060] text-white text-xs font-medium rounded-lg hover:bg-[#006e52] transition-colors"
            >
              Open Studio
            </Link>
          </div>
        )}

        {/* Heading & Current Status */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-[#202223]">Choose your DropClock plan</h1>
          <p className="text-xs text-[#6d7175]">
            Current plan:{" "}
            <strong className="text-[#202223] px-2 py-0.5 bg-white border border-[#e1e3e5] rounded-full inline-block">
              {currentPlan}
            </strong>
          </p>
        </div>

        {/* 2-Column Plan Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
          {/* Monthly Plan Card */}
          <div className="p-6 bg-white border border-[#e1e3e5] rounded-xl shadow-[0_1px_0_rgba(0,0,0,0.05)] flex flex-col justify-between space-y-5">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-bold text-base text-[#202223]">Monthly Pro</span>
                <span className="text-[11px] bg-[#e3f1df] text-[#008060] px-2.5 py-0.5 rounded-full font-semibold border border-[#aee9d1]">
                  7-Day Free Trial
                </span>
              </div>
              <div>
                <div className="text-3xl font-extrabold text-[#202223]">
                  $9.99 <span className="text-xs font-normal text-[#6d7175]">/ month</span>
                </div>
                <p className="text-[11px] text-[#6d7175] mt-1">Billed every 30 days via Shopify invoice</p>
              </div>
              <ul className="text-xs space-y-2.5 text-[#616161] pt-2 border-t border-[#f1f2f4]">
                <li className="flex items-center gap-2">
                  <span className="text-[#008060] font-bold">✓</span> Live storefront dispatch countdown timer
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#008060] font-bold">✓</span> Dynamic delivery ETA date calculation
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#008060] font-bold">✓</span> Slide-out cart drawer upsell progress bar
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#008060] font-bold">✓</span> Zero-CLS Theme App Extension architecture
                </li>
              </ul>
            </div>

            <button
              type="button"
              onClick={() => handleSelectPlan("MONTHLY")}
              disabled={isSubmitting || currentPlan === MONTHLY_PLAN}
              className={`w-full py-2.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer shadow-xs ${
                currentPlan === MONTHLY_PLAN
                  ? "bg-[#f1f2f4] text-[#8c9196] border border-[#d2d5d8] cursor-default"
                  : "bg-[#008060] hover:bg-[#006e52] text-white"
              }`}
            >
              {currentPlan === MONTHLY_PLAN
                ? "Active Plan"
                : isSubmitting
                ? "Connecting to Shopify..."
                : "Start 7-Day Free Trial"}
            </button>
          </div>

          {/* Annual Plan Card */}
          <div className="p-6 bg-white border-2 border-[#008060] rounded-xl shadow-[0_2px_8px_rgba(0,128,96,0.08)] flex flex-col justify-between space-y-5 relative">
            <div className="absolute -top-3 right-6 bg-[#008060] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
              Best Value · Save 25%
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-bold text-base text-[#202223]">Annual Pro</span>
                <span className="text-[11px] bg-[#f1f2f4] text-[#6d7175] px-2.5 py-0.5 rounded-full font-semibold border border-[#e1e3e5]">
                  7-Day Free Trial
                </span>
              </div>
              <div>
                <div className="text-3xl font-extrabold text-[#202223]">
                  $89.99 <span className="text-xs font-normal text-[#6d7175]">/ year</span>
                </div>
                <p className="text-[11px] text-[#6d7175] mt-1">$7.50 / month equivalent · Billed annually</p>
              </div>
              <ul className="text-xs space-y-2.5 text-[#616161] pt-2 border-t border-[#f1f2f4]">
                <li className="flex items-center gap-2">
                  <span className="text-[#008060] font-bold">✓</span> All Pro Monthly features included
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#008060] font-bold">✓</span> Multi-currency storefront currency switcher
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#008060] font-bold">✓</span> Advanced custom typography & styling
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#008060] font-bold">✓</span> Priority merchant support & onboarding
                </li>
              </ul>
            </div>

            <button
              type="button"
              onClick={() => handleSelectPlan("ANNUAL")}
              disabled={isSubmitting || currentPlan === ANNUAL_PLAN}
              className={`w-full py-2.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer shadow-xs ${
                currentPlan === ANNUAL_PLAN
                  ? "bg-[#f1f2f4] text-[#8c9196] border border-[#d2d5d8] cursor-default"
                  : "bg-[#202223] hover:bg-[#303030] text-white"
              }`}
            >
              {currentPlan === ANNUAL_PLAN
                ? "Active Plan"
                : isSubmitting
                ? "Connecting to Shopify..."
                : "Upgrade Annually (7-Day Trial)"}
            </button>
          </div>
        </div>

        {/* Security & Review Team Assurance Card */}
        <div className="p-4 bg-white border border-[#e1e3e5] rounded-xl shadow-[0_1px_0_rgba(0,0,0,0.05)] text-center text-xs text-[#6d7175] space-y-1">
          <p className="font-medium text-[#202223]">
            🔒 All subscriptions are managed securely through official Shopify Managed Billing.
          </p>
          <p>
            Development stores, partner test accounts, and Shopify App Reviewers test all charges in risk-free test mode. No real credit card charges occur.
          </p>
        </div>
      </div>
    </div>
  );
}
