'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react';

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error('HackerPost runtime exception caught by Error Boundary:', error);
  }, [error]);

  return (
    <div className="container" style={{ minHeight: "70vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "60px 20px" }}>
      <div style={{
        width: "64px",
        height: "64px",
        borderRadius: "50%",
        backgroundColor: "rgba(245, 158, 11, 0.1)",
        border: "1px solid rgba(245, 158, 11, 0.3)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: "24px",
        color: "hsl(var(--warning))"
      }}>
        <AlertTriangle size={32} />
      </div>

      <div style={{
        fontFamily: "var(--font-mono)",
        fontSize: "12px",
        color: "hsl(var(--warning))",
        textTransform: "uppercase",
        letterSpacing: "2px",
        marginBottom: "8px",
        fontWeight: 700
      }}>
        EXCEPTION_STATUS: TELEMETRY_STREAM_INTERRUPTED
      </div>

      <h1 style={{ fontSize: "26px", fontWeight: 800, marginBottom: "14px", maxWidth: "560px" }}>
        Threat Advisory Temporarily Unavailable
      </h1>

      <p style={{ color: "hsl(var(--muted-foreground))", maxWidth: "480px", fontSize: "14px", lineHeight: 1.6, marginBottom: "28px" }}>
        An unexpected telemetry parsing error occurred while loading this advisory. Our automated recovery routines are actively re-indexing the dispatch.
      </p>

      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center" }}>
        <button
          onClick={() => reset()}
          className="btn btn-primary"
          style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "10px 20px" }}
        >
          <RefreshCw size={15} />
          Reload Advisory
        </button>
        <Link href="/" className="btn btn-secondary" style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "10px 18px" }}>
          <ArrowLeft size={16} />
          Return to Live Wire
        </Link>
      </div>
    </div>
  );
}
