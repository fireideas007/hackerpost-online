import { ShieldCheck, Cpu, Terminal } from "lucide-react";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-content">
        <div>
          <p style={{ fontWeight: 800, color: "hsl(var(--foreground))", fontSize: "16px", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            HackerPost.online
          </p>
          <p>© {new Date().getFullYear()} Hackproof Technologies. Sourced from verified public registries.</p>
        </div>
        
        <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <ShieldCheck size={16} style={{ color: "hsl(var(--success))" }} />
            <span>Cryptographic Keys verified</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Cpu size={16} style={{ color: "hsl(var(--primary))" }} />
            <span>CVE Advisory Engine</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Terminal size={16} style={{ color: "hsl(var(--warning))" }} />
            <span>Exploit payload scanned</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
