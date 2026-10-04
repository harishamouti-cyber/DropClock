import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import type { LinksFunction } from "@remix-run/node";
import tailwindStyles from "./tailwind.css?url";

export const links: LinksFunction = () => [
  { rel: "icon", type: "image/svg+xml", href: "/app-icon.svg" },
  { rel: "icon", type: "image/png", sizes: "512x512", href: "/app-icon-512.png" },
  { rel: "icon", type: "image/png", href: "/app-icon.png" },
  { rel: "apple-touch-icon", href: "/app-icon-512.png" },
  { rel: "stylesheet", href: tailwindStyles },
  { rel: "preconnect", href: "https://cdn.shopify.com/" },
  {
    rel: "stylesheet",
    href: "https://cdn.shopify.com/static/fonts/inter/v4/styles.css",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full overflow-hidden bg-[#f1f2f4]">
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
        <Meta />
        <Links />
      </head>
      <body className="m-0 p-0 h-full overflow-hidden bg-[#f1f2f4] text-zinc-900 font-sans antialiased">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}
