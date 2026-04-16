"use client";

/**
 * Catches errors in the root layout. Must define its own <html> and <body>
 * (see https://nextjs.org/docs/app/building-your-application/routing/error-handling).
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          fontFamily: "system-ui, sans-serif",
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
          background: "#f7f4ef",
          color: "#1c1917",
        }}
      >
        <h1 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: 12 }}>Something went wrong</h1>
        <p style={{ fontSize: "0.875rem", color: "#57534e", marginBottom: 24, textAlign: "center", maxWidth: 400 }}>
          {error.message || "Please try again."}
        </p>
        <button
          type="button"
          onClick={() => reset()}
          style={{
            padding: "10px 20px",
            borderRadius: 8,
            border: "none",
            background: "#3d6b4f",
            color: "#fff",
            fontSize: "0.875rem",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
