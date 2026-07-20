"use client";

// Catches an error thrown by the root layout itself (rare -- app/error.js
// handles everything else). Must render its own <html>/<body> and can't
// rely on Provider/Tailwind having mounted, hence plain inline styles.
export default function GlobalError({ reset }) {
  return (
    <html>
      <body
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
          background: "#ffffff",
          color: "#3a3a3a",
          padding: "1rem",
        }}
      >
        <div style={{ textAlign: "center", maxWidth: "28rem" }}>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 700, marginBottom: "0.75rem" }}>
            Something went wrong
          </h1>
          <p style={{ marginBottom: "1.5rem", color: "#7a7a7a" }}>
            That&apos;s on us, not you. Please try again.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              background: "#30b4fc",
              color: "#ffffff",
              border: "none",
              borderRadius: "0.375rem",
              padding: "0.625rem 1.25rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
