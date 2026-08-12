import { ShieldCheck, Cpu, Search } from "lucide-react";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-content">
        <div>
          <p style={{ fontWeight: 700, color: "hsl(var(--foreground))", fontSize: "15px", marginBottom: "4px" }}>
            HyperLocal News AI
          </p>
          <p>© {new Date().getFullYear()} Hackproof Technologies. Sourced from verified public registries.</p>
        </div>
        
        <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <ShieldCheck size={16} style={{ color: "hsl(var(--success))" }} />
            <span>Verified Providers Only</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Cpu size={16} style={{ color: "hsl(var(--primary))" }} />
            <span>AI Coprocessor</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Search size={16} style={{ color: "hsl(var(--warning))" }} />
            <span>Plagiarism Scrutinized</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
