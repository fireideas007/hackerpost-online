"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  ShieldCheck, 
  Search, 
  Sun, 
  Moon, 
  Menu, 
  X, 
  Sparkles, 
  Send,
  Building,
  FileText
} from "lucide-react";

export default function Header() {
  // Default to clean corporate light theme
  const [theme, setTheme] = useState("light");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);
    document.documentElement.setAttribute("data-theme", savedTheme);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
  };

  const handleHeaderSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/?q=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  const formattedDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  return (
    <div className="header-wrapper">
      {/* Top Utility Masthead Bar */}
      <div className="top-telemetry-bar">
        <div className="container top-telemetry-content">
          <div className="telemetry-item">
            <span style={{ fontWeight: 600 }}>{formattedDate}</span>
            <span className="telemetry-divider">|</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
              <span className="live-pulse-dot"></span>
              <span>Enterprise Cybersecurity Wire · Real-Time Disclosures</span>
            </span>
          </div>

          <div className="telemetry-actions">
            <Link href="/advertise" className="top-bar-link">
              <span>Media Kit &amp; PR Wire</span>
            </Link>
            <span className="telemetry-divider">|</span>
            <Link href="/consult" className="top-bar-link">
              <span>Hackproof CISO Advisory</span>
            </Link>
            <span className="telemetry-divider">|</span>
            <Link href="/b2b" className="top-bar-link">
              <span>API Feed</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Journal Masthead */}
      <header className="container header">
        {/* Brand Logo */}
        <Link href="/" className="logo" aria-label="HackerPost.online Home">
          <div className="logo-icon-box">
            <ShieldCheck size={22} />
          </div>
          <div className="logo-text-group">
            <span className="logo-main">HackerPost</span>
            <span className="logo-domain">Enterprise Cybersecurity &amp; SecTech Journal</span>
          </div>
        </Link>

        {/* Desktop Search & Actions */}
        <div className="header-actions">
          {/* Quick Search Form */}
          <form onSubmit={handleHeaderSearch} className="header-search-form">
            <Search size={14} className="header-search-icon" />
            <input
              type="text"
              placeholder="Search CVE, vendor, deal..."
              className="header-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>

          {/* Submit Pitch CTA */}
          <Link 
            href="/submit" 
            className="btn btn-primary"
            style={{ fontSize: "12px", padding: "6px 14px", height: "36px" }}
          >
            <span>Pitch a Story</span>
          </Link>

          {/* Theme Toggle Button */}
          <button 
            onClick={toggleTheme} 
            className="theme-toggle-btn"
            aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
            title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
          >
            {theme === "light" ? <Moon size={15} /> : <Sun size={15} />}
          </button>

          {/* Mobile Menu Trigger */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="mobile-menu-toggle"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      {/* Primary News Navigation Bar */}
      <div style={{ borderTop: "1px solid hsl(var(--border))", background: "hsl(var(--background))" }}>
        <div className="container">
          <nav className="desktop-nav" aria-label="Primary Navigation" style={{ padding: "4px 0" }}>
            <Link 
              href="/" 
              className={`nav-link ${pathname === "/" ? "active" : ""}`}
            >
              All News
            </Link>
            
            <Link 
              href="/?category=Zero-Days" 
              className="nav-link"
            >
              Zero-Days &amp; CVEs
            </Link>

            <Link 
              href="/?category=Ransomware" 
              className="nav-link"
            >
              Ransomware
            </Link>

            <Link 
              href="/?category=SecTech%20%26%20Startups" 
              className="nav-link"
            >
              SecTech &amp; Deals
            </Link>

            <Link 
              href="/benchmarks" 
              className={`nav-link ${pathname === "/benchmarks" ? "active" : ""}`}
            >
              AI Security Benchmarks
            </Link>

            <Link 
              href="/consult" 
              className={`nav-link ${pathname === "/consult" ? "active" : ""}`}
            >
              CISO Advisory Desk
            </Link>

            <Link 
              href="/advertise" 
              className={`nav-link ${pathname === "/advertise" ? "active" : ""}`}
            >
              Media Kit &amp; PR Wire
            </Link>

            <Link 
              href="/b2b" 
              className={`nav-link ${pathname === "/b2b" ? "active" : ""}`}
            >
              API Sandbox
            </Link>
          </nav>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="mobile-drawer">
          <form onSubmit={handleHeaderSearch} style={{ marginBottom: "8px", position: "relative" }}>
            <Search size={14} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "hsl(var(--muted-foreground))" }} />
            <input
              type="text"
              placeholder="Search CVE, startup, vendor..."
              className="header-search-input"
              style={{ width: "100%", height: "40px" }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>

          <Link 
            href="/" 
            className={`mobile-nav-link ${pathname === "/" ? "active" : ""}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            All News
          </Link>
          <Link 
            href="/?category=Zero-Days" 
            className="mobile-nav-link"
            onClick={() => setMobileMenuOpen(false)}
          >
            Zero-Days &amp; CVEs
          </Link>
          <Link 
            href="/?category=SecTech%20%26%20Startups" 
            className="mobile-nav-link"
            onClick={() => setMobileMenuOpen(false)}
          >
            SecTech &amp; Deals
          </Link>
          <Link 
            href="/benchmarks" 
            className={`mobile-nav-link ${pathname === "/benchmarks" ? "active" : ""}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            AI Security Benchmarks
          </Link>
          <Link 
            href="/consult" 
            className={`mobile-nav-link ${pathname === "/consult" ? "active" : ""}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            CISO Advisory Desk
          </Link>
          <Link 
            href="/advertise" 
            className={`mobile-nav-link ${pathname === "/advertise" ? "active" : ""}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Media Kit &amp; PR Wire
          </Link>
          <Link 
            href="/submit" 
            className={`mobile-nav-link ${pathname === "/submit" ? "active" : ""}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Submit Press Release
          </Link>
        </div>
      )}
    </div>
  );
}
