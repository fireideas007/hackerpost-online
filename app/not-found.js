import Link from "next/link";
import { ShieldAlert, ArrowLeft, Terminal } from "lucide-react";

export default function NotFound() {
  return (
    <div className="container" style={{ minHeight: "70vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "60px 20px" }}>
      <div style={{
        width: "64px",
        height: "64px",
        borderRadius: "50%",
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        border: "1px solid rgba(239, 68, 68, 0.3)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: "24px",
        color: "hsl(var(--danger))"
      }}>
        <ShieldAlert size={32} />
      </div>

      <div style={{
        fontFamily: "var(--font-mono)",
        fontSize: "12px",
        color: "hsl(var(--danger))",
        textTransform: "uppercase",
        letterSpacing: "2px",
        marginBottom: "8px",
        fontWeight: 700
      }}>
        HTTP_STATUS: 404 // ADVISORY_NOT_FOUND
      </div>

      <h1 style={{ fontSize: "28px", fontWeight: 800, marginBottom: "14px", maxWidth: "600px" }}>
        Intelligence Dispatch Not Located
      </h1>

      <p style={{ color: "hsl(var(--muted-foreground))", maxWidth: "480px", fontSize: "14px", lineHeight: 1.6, marginBottom: "28px" }}>
        The requested threat bulletin, CVE advisory, or intelligence payload could not be verified in the real-time repository. It may have been re-indexed under a canonical SEO slug.
      </p>

      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center" }}>
        <Link href="/" className="btn btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "10px 20px" }}>
          <ArrowLeft size={16} />
          Return to Live Wire
        </Link>
        <Link href="/benchmarks" className="btn btn-secondary" style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "10px 18px" }}>
          <Terminal size={16} />
          AI Security Benchmarks
        </Link>
      </div>
    </div>
  );
}
