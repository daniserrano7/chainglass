import type { Route } from "./+types/_index";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "ChainGlass - See through your crypto" },
    { name: "description", content: "Multi-chain portfolio tracker for watch-only addresses" },
  ];
}

export default function Index() {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      color: "white",
      padding: "2rem",
    }}>
      <h1 style={{
        fontSize: "4rem",
        margin: "0 0 1rem 0",
        fontWeight: "bold",
        textAlign: "center",
      }}>
        ChainGlass
      </h1>
      <p style={{
        fontSize: "1.5rem",
        margin: "0 0 2rem 0",
        opacity: 0.9,
        textAlign: "center",
      }}>
        See through your crypto
      </p>
      <div style={{
        background: "rgba(255, 255, 255, 0.1)",
        padding: "2rem",
        borderRadius: "1rem",
        backdropFilter: "blur(10px)",
        maxWidth: "600px",
        textAlign: "center",
      }}>
        <p style={{ fontSize: "1.1rem", lineHeight: "1.6", margin: 0 }}>
          Multi-chain portfolio tracker for watch-only addresses.
          <br />
          Track your crypto holdings across multiple chains and ecosystems in one unified dashboard.
        </p>
      </div>
      <div style={{
        marginTop: "3rem",
        fontSize: "0.9rem",
        opacity: 0.7,
      }}>
        Project initialized with React Router v7 + TypeScript + SSR
      </div>
    </div>
  );
}
