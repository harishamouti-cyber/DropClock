import type { LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Form, Link } from "@remix-run/react";
import { useState } from "react";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");
  if (shop) {
    throw redirect(`/app?${url.searchParams.toString()}`);
  }
  return null;
}

const ClockIcon = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const TruckIcon = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="1" y="3" width="15" height="13" />
    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
    <circle cx="5.5" cy="18.5" r="2.5" />
    <circle cx="18.5" cy="18.5" r="2.5" />
  </svg>
);

const ShieldCheckIcon = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <polyline points="9 12 11 14 15 10" />
  </svg>
);

const GlobeIcon = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

export default function Index() {
  const [shopDomain, setShopDomain] = useState("");

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#09090b",
        color: "#fafafa",
        fontFamily:
          'Geist, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "2rem 1.5rem",
        boxSizing: "border-box",
      }}
    >
      {/* Top Navigation */}
      <header
        style={{
          maxWidth: "1040px",
          width: "100%",
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingBottom: "1.5rem",
          borderBottom: "1px solid #18181b",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
          <div
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "6px",
              backgroundColor: "#18181b",
              border: "1px solid #27272a",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fafafa",
            }}
          >
            <ClockIcon />
          </div>
          <span
            style={{
              fontSize: "0.9375rem",
              fontWeight: "600",
              letterSpacing: "-0.02em",
              color: "#fafafa",
            }}
          >
            DropClock
          </span>
          <span
            style={{
              fontSize: "0.6875rem",
              fontWeight: "500",
              color: "#71717a",
              backgroundColor: "#18181b",
              padding: "0.15rem 0.45rem",
              borderRadius: "4px",
              border: "1px solid #27272a",
              marginLeft: "0.25rem",
            }}
          >
            v1.0.0
          </span>
        </div>

        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <Link
            to="/preview"
            style={{
              color: "#a1a1aa",
              textDecoration: "none",
              fontSize: "0.8125rem",
              fontWeight: "500",
              transition: "color 0.15s ease",
            }}
          >
            Interactive Studio
          </Link>
          <a
            href="https://shopify.dev/docs/apps/online-store/theme-app-extensions"
            target="_blank"
            rel="noreferrer"
            style={{
              color: "#71717a",
              textDecoration: "none",
              fontSize: "0.8125rem",
              fontWeight: "400",
            }}
          >
            Documentation
          </a>
        </div>
      </header>

      {/* Hero & Authentication Gateway */}
      <main
        style={{
          maxWidth: "760px",
          width: "100%",
          margin: "0 auto",
          textAlign: "center",
          padding: "4rem 1rem",
        }}
      >
        {/* Subtle Status Pill */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            backgroundColor: "#18181b",
            border: "1px solid #27272a",
            padding: "0.3rem 0.75rem",
            borderRadius: "9999px",
            fontSize: "0.75rem",
            fontWeight: "500",
            color: "#a1a1aa",
            marginBottom: "2rem",
            boxShadow: "inset 0 1px 0 0 rgba(255,255,255,0.05)",
          }}
        >
          <span
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              backgroundColor: "#10b981",
            }}
          />
          Edge CDN Architecture • Zero Storefront TBT Drag
        </div>

        <h1
          style={{
            fontSize: "clamp(2.25rem, 4.5vw, 3.25rem)",
            fontWeight: "600",
            lineHeight: "1.15",
            letterSpacing: "-0.03em",
            margin: "0 0 1rem 0",
            color: "#fafafa",
          }}
        >
          Precision Shipping Cutoffs &amp; Delivery ETA
        </h1>

        <p
          style={{
            fontSize: "1rem",
            color: "#71717a",
            maxWidth: "540px",
            margin: "0 auto 2.5rem auto",
            lineHeight: "1.6",
            letterSpacing: "-0.01em",
          }}
        >
          Engineered for high-volume Shopify storefronts. Zero external network calls, 100% Theme App Extension delivery, and multi-market transit awareness.
        </p>

        {/* 1-Click Store Domain Input (OAuth Handshake) */}
        <div
          style={{
            maxWidth: "460px",
            margin: "0 auto 3.5rem auto",
          }}
        >
          <Form
            method="post"
            action="/auth/login"
            style={{
              display: "flex",
              gap: "0.5rem",
              backgroundColor: "#18181b",
              padding: "0.35rem",
              borderRadius: "10px",
              border: "1px solid #27272a",
              boxShadow: "inset 0 1px 0 0 rgba(255,255,255,0.04), 0 4px 20px rgba(0,0,0,0.4)",
            }}
          >
            <input
              type="text"
              name="shop"
              placeholder="my-store.myshopify.com"
              value={shopDomain}
              onChange={(e) => setShopDomain(e.target.value)}
              required
              style={{
                flex: "1",
                backgroundColor: "transparent",
                border: "none",
                outline: "none",
                color: "#fafafa",
                padding: "0.6rem 0.85rem",
                fontSize: "0.875rem",
                fontFamily: "inherit",
              }}
            />
            <button
              type="submit"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                backgroundColor: "#fafafa",
                color: "#09090b",
                border: "none",
                borderRadius: "7px",
                padding: "0.55rem 0.95rem",
                fontSize: "0.8125rem",
                fontWeight: "600",
                cursor: "pointer",
                transition: "opacity 0.15s ease",
              }}
            >
              Sign In
              <ArrowRightIcon />
            </button>
          </Form>

          <div
            style={{
              marginTop: "0.75rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "0.75rem",
              color: "#71717a",
              padding: "0 0.25rem",
            }}
          >
            <span>Enter your `.myshopify.com` domain to manage settings</span>
            <Link
              to="/preview"
              style={{
                color: "#a1a1aa",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.25rem",
              }}
            >
              Open Studio Demo <ArrowRightIcon />
            </Link>
          </div>
        </div>

        {/* Minimal Monochromatic Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "1rem",
            textAlign: "left",
          }}
        >
          <div
            style={{
              backgroundColor: "#121215",
              border: "1px solid #1f1f23",
              borderRadius: "10px",
              padding: "1.25rem",
              boxShadow: "inset 0 1px 0 0 rgba(255,255,255,0.03)",
            }}
          >
            <div
              style={{
                color: "#a1a1aa",
                marginBottom: "0.5rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                fontSize: "0.8125rem",
                fontWeight: "600",
              }}
            >
              <ClockIcon /> 0ms Edge Binding
            </div>
            <div style={{ fontSize: "0.8125rem", color: "#71717a", lineHeight: "1.5" }}>
              Reads directly from Shopify Global Edge CDN shop metafields. Zero external scripts injected.
            </div>
          </div>

          <div
            style={{
              backgroundColor: "#121215",
              border: "1px solid #1f1f23",
              borderRadius: "10px",
              padding: "1.25rem",
              boxShadow: "inset 0 1px 0 0 rgba(255,255,255,0.03)",
            }}
          >
            <div
              style={{
                color: "#a1a1aa",
                marginBottom: "0.5rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                fontSize: "0.8125rem",
                fontWeight: "600",
              }}
            >
              <GlobeIcon /> Multi-Market Aware
            </div>
            <div style={{ fontSize: "0.8125rem", color: "#71717a", lineHeight: "1.5" }}>
              Applies country-level handling and transit lead times with zero client-side geolocation latency.
            </div>
          </div>

          <div
            style={{
              backgroundColor: "#121215",
              border: "1px solid #1f1f23",
              borderRadius: "10px",
              padding: "1.25rem",
              boxShadow: "inset 0 1px 0 0 rgba(255,255,255,0.03)",
            }}
          >
            <div
              style={{
                color: "#a1a1aa",
                marginBottom: "0.5rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                fontSize: "0.8125rem",
                fontWeight: "600",
              }}
            >
              <ShieldCheckIcon /> Stock Auto-Suppress
            </div>
            <div style={{ fontSize: "0.8125rem", color: "#71717a", lineHeight: "1.5" }}>
              Instantly transitions out-of-stock and backordered variants without flashing or layout shift.
            </div>
          </div>
        </div>
      </main>

      {/* Refined Minimal Footer */}
      <footer
        style={{
          maxWidth: "1040px",
          width: "100%",
          margin: "0 auto",
          paddingTop: "1.5rem",
          borderTop: "1px solid #18181b",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: "0.75rem",
          color: "#52525b",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div>DropClock • Production Theme App Extension Infrastructure</div>
        <div style={{ display: "flex", gap: "1.25rem" }}>
          <Link to="/preview" style={{ color: "#71717a", textDecoration: "none" }}>
            Studio Demo
          </Link>
          <a
            href="https://partners.shopify.com"
            target="_blank"
            rel="noreferrer"
            style={{ color: "#71717a", textDecoration: "none" }}
          >
            Shopify Partners
          </a>
        </div>
      </footer>
    </div>
  );
}
