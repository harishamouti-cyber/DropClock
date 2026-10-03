import type { HeadersFunction, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, Outlet, useLoaderData, useRouteError } from "@remix-run/react";
import { boundary } from "@shopify/shopify-app-remix/server";
import { AppProvider } from "@shopify/shopify-app-remix/react";
import { NavMenu } from "@shopify/app-bridge-react";
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";
import tailwindStyles from "~/tailwind.css?url";
import { authenticate, SHOPIFY_API_KEY } from "~/shopify.server";

export const links = () => [
  { rel: "stylesheet", href: polarisStyles },
  { rel: "stylesheet", href: tailwindStyles },
];

export async function loader({ request }: LoaderFunctionArgs) {
  await authenticate.admin(request);

  return json({
    apiKey: SHOPIFY_API_KEY,
  });
}

export default function App() {
  const { apiKey } = useLoaderData<typeof loader>();

  return (
    <AppProvider isEmbeddedApp apiKey={apiKey}>
      <NavMenu>
        <Link to="/app" rel="home">
          Overview
        </Link>
        <Link to="/app/dropclock">
          Cutoff & ETA Settings
        </Link>
      </NavMenu>
      <Outlet />
    </AppProvider>
  );
}

// Error boundary for standard Shopify App Bridge authentication errors
export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
