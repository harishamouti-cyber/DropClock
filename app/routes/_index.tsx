import type { LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Link } from "@remix-run/react";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");
  if (shop) {
    throw redirect(`/app?${url.searchParams.toString()}`);
  }
  return null;
}

export default function Index() {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#090d16",
        color: "#f8fafc",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "2rem 1.5rem",
        boxSizing: "border-box",
      }}
    >
      {/* Header */}
      <header
        style={{
          maxWidth: "1100px",
          width: "100%",
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingBottom: "2rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              backgroundColor: "#10b981",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 20px rgba(16, 185, 129, 0.4)",
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#090d16"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <span style={{ fontSize: "1.25rem", fontWeight: "700", letterSpacing: "-0.02em" }}>
            DropClock
          </span>
        </div>

        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <Link
            to="/preview"
            style={{
              color: "#94a3b8",
              textDecoration: "none",
              fontSize: "0.9rem",
              fontWeight: "500",
              transition: "color 0.2s",
            }}
          >
            Live Preview
          </Link>
          <Link
            to="/auth/login"
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.08)",
              color: "#f8fafc",
              padding: "0.5rem 1rem",
              borderRadius: "8px",
              textDecoration: "none",
              fontSize: "0.9rem",
              fontWeight: "500",
              border: "1px solid rgba(255, 255, 255, 0.12)",
            }}
          >
            Merchant Login
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main
        style={{
          maxWidth: "900px",
          width: "100%",
          margin: "0 auto",
          textAlign: "center",
          padding: "3rem 1rem",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            backgroundColor: "rgba(16, 185, 129, 0.12)",
            border: "1px solid rgba(16, 185, 129, 0.3)",
            color: "#34d399",
            padding: "0.35rem 0.85rem",
            borderRadius: "9999px",
            fontSize: "0.85rem",
            fontWeight: "600",
            marginBottom: "1.5rem",
          }}
        >
          <span
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              backgroundColor: "#10b981",
              boxShadow: "0 0 8px #10b981",
            }}
          />
          0ms Storefront Drag • Built for Shopify
        </div>

        <h1
          style={{
            fontSize: "clamp(2.5rem, 5vw, 4rem)",
            fontWeight: "800",
            lineHeight: "1.1",
            letterSpacing: "-0.03em",
            margin: "0 0 1.25rem 0",
            background: "linear-gradient(180deg, #ffffff 0%, #94a3b8 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Order Cutoff Countdown & Estimated Delivery ETA
        </h1>

        <p
          style={{
            fontSize: "1.15rem",
            color: "#94a3b8",
            maxWidth: "680px",
            margin: "0 auto 2.5rem auto",
            lineHeight: "1.6",
          }}
        >
          Engineered for high-converting Shopify merchants. Zero external network calls, 100% Theme App Extension architecture, dynamic inventory awareness, and warehouse timezone sync.
        </p>

        {/* Action Buttons */}
        <div
          style={{
            display: "flex",
            gap: "1rem",
            justifyContent: "center",
            flexWrap: "wrap",
            marginBottom: "4rem",
          }}
        >
          <Link
            to="/preview"
            style={{
              backgroundColor: "#10b981",
              color: "#090d16",
              padding: "0.85rem 1.75rem",
              borderRadius: "10px",
              textDecoration: "none",
              fontWeight: "700",
              fontSize: "1rem",
              boxShadow: "0 10px 25px -5px rgba(16, 185, 129, 0.4)",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            Launch Interactive Preview
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>

          <Link
            to="/auth/login"
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.06)",
              color: "#f8fafc",
              padding: "0.85rem 1.75rem",
              borderRadius: "10px",
              textDecoration: "none",
              fontWeight: "600",
              fontSize: "1rem",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            Install on Shopify Store
          </Link>
        </div>

        {/* Feature Highlights Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "1.25rem",
            textAlign: "left",
          }}
        >
          <div
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.03)",
              border: "1px solid rgba(255, 255, 255, 0.07)",
              borderRadius: "14px",
              padding: "1.5rem",
            }}
          >
            <div style={{ color: "#10b981", marginBottom: "0.75rem", fontWeight: "700" }}>
              ⚡ 0ms Network Latency
            </div>
            <div style={{ fontSize: "0.9rem", color: "#94a3b8", lineHeight: "1.5" }}>
              Reads directly from Shopify CDN shop metafields. Zero external scripts or slow third-party API dependencies.
            </div>
          </div>

          <div
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.03)",
              border: "1px solid rgba(255, 255, 255, 0.07)",
              borderRadius: "14px",
              padding: "1.5rem",
            }}
          >
            <div style={{ color: "#38bdf8", marginBottom: "0.75rem", fontWeight: "700" }}>
              📦 Out-of-Stock Suppress
            </div>
            <div style={{ fontSize: "0.9rem", color: "#94a3b8", lineHeight: "1.5" }}>
              Automatically hides the timer or switches to a gentle backorder arrival notice when items sell out.
            </div>
          </div>

          <div
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.03)",
              border: "1px solid rgba(255, 255, 255, 0.07)",
              borderRadius: "14px",
              padding: "1.5rem",
            }}
          >
            <div style={{ color: "#a855f7", marginBottom: "0.75rem", fontWeight: "700" }}>
              🌍 Multi-Market Offsets
            </div>
            <div style={{ fontSize: "0.9rem", color: "#94a3b8", lineHeight: "1.5" }}>
              Native Shopify country code localization applies transit leads per region without IP geolocation lag.
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer
        style={{
          maxWidth: "1100px",
          width: "100%",
          margin: "0 auto",
          paddingTop: "2rem",
          borderTop: "1px solid rgba(255, 255, 255, 0.06)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: "0.85rem",
          color: "#64748b",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div>DropClock © 2026. Built for Shopify App Store.</div>
        <div style={{ display: "flex", gap: "1.5rem" }}>
          <Link to="/preview" style={{ color: "#64748b", textDecoration: "none" }}>
            Demo Preview
          </Link>
          <Link to="/auth/login" style={{ color: "#64748b", textDecoration: "none" }}>
            Login
          </Link>
        </div>
      </footer>
    </div>
  );
}
