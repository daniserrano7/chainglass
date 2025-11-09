import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ThemeProvider } from "./lib/theme/ThemeContext";

// Import theme CSS
import themeStyles from "./lib/theme/theme.css?url";

export const links = () => [
  { rel: "stylesheet", href: themeStyles },
];

export default function Root() {
  return (
    <html lang="en" className="antialiased">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="bg-background text-text-primary font-sans antialiased">
        <ThemeProvider>
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </ThemeProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
