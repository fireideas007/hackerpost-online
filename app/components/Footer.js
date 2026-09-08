"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  ShieldAlert, 
  ShieldCheck, 
  Cpu, 
  Terminal, 
  Lock, 
  ArrowUp, 
  Mail, 
  Check, 
  Sparkles, 
  Radio, 
  Code2, 
  Award, 
  Rocket, 
  ExternalLink,
  Flame,
  Building,
  FileText
} from "lucide-react";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubscribed(true);
      setEmail("");
    }, 600);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="footer-container">
      <div className="container">
        {/* Newsletter Subscription Strip */}
        <div className="footer-newsletter-card">
          <div className="newsletter-info">
            <div className="newsletter-tag">
              <Sparkles size={14} style={{ color: "hsl(var(--warning))" }} />
              <span>CISO MORNING DISPATCH</span>
            </div>
            <h3 className="newsletter-title">Subscribe to Real-Time Threat Intelligence</h3>
            <p className="newsletter-desc">
              Get curated zero-day disclosures, CVE exploit analysis, and SecTech venture deals delivered to your inbox every morning. No spam, strictly actionable intelligence.
            </p>
          </div>

          <div className="newsletter-form-box">
            {subscribed ? (
              <div className="newsletter-success">
                <Check size={18} style={{ color: "hsl(var(--success))" }} />
                <span>Subscription confirmed. You will receive tomorrow&apos;s morning dispatch.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="newsletter-form">
                <div className="newsletter-input-wrapper">
                  <Mail size={16} className="newsletter-icon" />
                  <input
                    type="email"
                    placeholder="ciso@enterprise.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="newsletter-input"
                  />
                </div>
                <button type="submit" disabled={loading} className="btn btn-primary newsletter-submit">
                  {loading ? "Subscribing..." : "Join 48,000+ Readers"}
                </button>
              </form>
            )}
            <div className="newsletter-disclaimer">
              Encrypted delivery • 1-click unsubscribe anytime
            </div>
          </div>
        </div>

        {/* Multi-Column Main Footer Links */}
        <div className="footer-grid">
          {/* Brand Column */}
          <div className="footer-col footer-col-brand">
            <Link href="/" className="logo" style={{ marginBottom: "16px", display: "inline-flex" }}>
              <div className="logo-icon-box">
                <ShieldAlert size={22} className="logo-icon" />
              </div>
              <div className="logo-text-group">
                <span className="logo-main">HackerPost</span>
                <span className="logo-domain">.online</span>
              </div>
            </Link>
            <p className="footer-brand-desc">
              The premier cybersecurity intelligence wire for CISOs, security researchers, and SecOps engineering teams. Providing real-time threat telemetry, AI security model benchmarks, and SecTech venture funding analytics.
            </p>
            <div className="footer-status-pill">
              <span className="live-pulse-dot"></span>
              <span>Telemetry Engine: Operational</span>
            </div>
          </div>

          {/* Column 1: Threat Intelligence */}
          <div className="footer-col">
            <h4 className="footer-heading">Threat Intelligence</h4>
            <ul className="footer-links">
              <li>
                <Link href="/" className="footer-link">
                  <Radio size={13} />
                  <span>Live Threat Wire</span>
                </Link>
              </li>
              <li>
                <Link href="/?category=Zero-Days" className="footer-link">
                  <Flame size={13} style={{ color: "hsl(var(--danger))" }} />
                  <span>Zero-Day Advisories</span>
                </Link>
              </li>
              <li>
                <Link href="/?category=Ransomware" className="footer-link">
                  <span>Ransomware Telemetry</span>
                </Link>
              </li>
              <li>
                <Link href="/?category=Exploits" className="footer-link">
                  <span>Exploit Signatures</span>
                </Link>
              </li>
              <li>
                <Link href="/?category=Advisories" className="footer-link">
                  <span>Enterprise CVE Index</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: SecTech & AI Research */}
          <div className="footer-col">
            <h4 className="footer-heading">SecTech &amp; AI Research</h4>
            <ul className="footer-links">
              <li>
                <Link href="/benchmarks" className="footer-link">
                  <Award size={13} style={{ color: "hsl(var(--warning))" }} />
                  <span>AI Security Benchmarks</span>
                </Link>
              </li>
              <li>
                <Link href="/?category=SecTech%20%26%20Startups" className="footer-link">
                  <Rocket size={13} style={{ color: "hsl(var(--primary))" }} />
                  <span>Startup Funding Rounds</span>
                </Link>
              </li>
              <li>
                <Link href="/?category=M%26A%20%26%20Funding" className="footer-link">
                  <span>M&amp;A &amp; Private Equity</span>
                </Link>
              </li>
              <li>
                <Link href="/benchmarks" className="footer-link">
                  <span>LLM Red-Teaming Index</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Media Kit & Syndication */}
          <div className="footer-col">
            <h4 className="footer-heading">Sponsorship &amp; Wire</h4>
            <ul className="footer-links">
              <li>
                <Link href="/advertise" className="footer-link">
                  <Sparkles size={13} style={{ color: "hsl(var(--warning))" }} />
                  <span>Media Kit &amp; Packages</span>
                </Link>
              </li>
              <li>
                <Link href="/advertise" className="footer-link">
                  <span>Verified PR Wire ($299)</span>
                </Link>
              </li>
              <li>
                <Link href="/advertise" className="footer-link">
                  <span>CISO Executive Spotlight</span>
                </Link>
              </li>
              <li>
                <Link href="/submit" className="footer-link">
                  <Rocket size={13} style={{ color: "hsl(var(--primary))" }} />
                  <span>Submit Story Pitch</span>
                </Link>
              </li>
              <li>
                <Link href="/b2b" className="footer-link">
                  <Code2 size={13} />
                  <span>Threat Verification API</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Hackproof Enterprise Solutions */}
          <div className="footer-col">
            <h4 className="footer-heading">Hackproof Enterprise</h4>
            <ul className="footer-links">
              <li>
                <Link href="/consult" className="footer-link">
                  <ShieldCheck size={13} style={{ color: "hsl(var(--primary))" }} />
                  <span>CISO Advisory Desk</span>
                </Link>
              </li>
              <li>
                <Link href="/consult" className="footer-link">
                  <span>Zero-Day Attack Audits</span>
                </Link>
              </li>
              <li>
                <Link href="/consult" className="footer-link">
                  <span>Cloud Penetration Testing</span>
                </Link>
              </li>
              <li>
                <Link href="/consult" className="footer-link">
                  <span>SEC Form 8-K Readiness</span>
                </Link>
              </li>
              <li>
                <Link href="/api/news" target="_blank" className="footer-link">
                  <span>Raw JSON Wire Feed</span>
                  <ExternalLink size={11} style={{ opacity: 0.6 }} />
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Security Telemetry Badge Strip */}
        <div className="footer-telemetry-strip">
          <div className="telemetry-badge">
            <ShieldCheck size={16} style={{ color: "hsl(var(--success))" }} />
            <span>SHA-256 Verified Feed</span>
          </div>
          <div className="telemetry-badge">
            <Cpu size={16} style={{ color: "hsl(var(--primary))" }} />
            <span>CVE Advisory Engine Coprocessor</span>
          </div>
          <div className="telemetry-badge">
            <Terminal size={16} style={{ color: "hsl(var(--warning))" }} />
            <span>Exploit Payload Sandbox Isolated</span>
          </div>
          <div className="telemetry-badge">
            <Lock size={16} style={{ color: "hsl(var(--primary))" }} />
            <span>Strict TLS 1.3 Transport</span>
          </div>
        </div>

        {/* Bottom Legal & Back to Top Strip */}
        <div className="footer-bottom-bar">
          <div className="footer-copyright">
            <p>© {new Date().getFullYear()} Hackproof Technologies India Private Limited. All rights reserved.</p>
            <p className="footer-subtext">Sourced from verified public registries, NVD, CISA KEV, and global cybersecurity research teams.</p>
          </div>

          <button onClick={scrollToTop} className="footer-back-to-top" aria-label="Back to top">
            <span>Back to top</span>
            <ArrowUp size={15} />
          </button>
        </div>
      </div>
    </footer>
  );
}
