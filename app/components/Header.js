"use client";

import { useState, useEffect, useRef } from "react";
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
  FileText,
  ChevronDown,
  ChevronRight,
  ShieldAlert,
  Cpu,
  Terminal,
  TrendingUp,
  BarChart3,
  Radio,
  Briefcase,
  Award,
  Layers,
  ExternalLink
} from "lucide-react";

// Categorized navigation data modeled after WSJ & Reuters
const NAV_DROPDOWNS = [
  {
    id: "threat-wire",
    label: "Threat Wire",
    icon: ShieldAlert,
    headerTitle: "Cyber Threat Intelligence & Advisories",
    items: [
      {
        title: "Zero-Days & CVE Advisories",
        desc: "Active zero-day flaws, memory safety exploits, and CISA KEV alerts",
        href: "/?category=Zero-Days",
        badge: "Critical"
      },
      {
        title: "Ransomware & Extortion",
        desc: "Enterprise extortion telemetry, leak sites, and incident tracking",
        href: "/?category=Ransomware",
        badge: null
      },
      {
        title: "Supply Chain & OSS Security",
        desc: "Package repository poisoning, dependency backdoors, and SBOM risks",
        href: "/?category=Supply%20Chain",
        badge: null
      },
      {
        title: "Data Breaches & Cloud Leaks",
        desc: "Corporate disclosures, unauthorized telemetry, and API breaches",
        href: "/?category=Data%20Breaches",
        badge: null
      },
      {
        title: "Vulnerabilities & Exploits",
        desc: "Technical PoC analysis, heap regressions, and patch diffing",
        href: "/?category=Exploits",
        badge: null
      }
    ]
  },
  {
    id: "sectech-deals",
    label: "SecTech & Deals",
    icon: TrendingUp,
    headerTitle: "Cyber Venture Capital & M&A",
    items: [
      {
        title: "Venture Capital & Startups",
        desc: "Series A–D funding rounds, seed investments, and unicorn valuations",
        href: "/?category=SecTech%20%26%20Startups",
        badge: "Venture"
      },
      {
        title: "M&A Deals & Consolidations",
        desc: "Platform acquisitions, private equity buyouts, and strategic mergers",
        href: "/?category=M%26A%20%26%20Funding",
        badge: null
      },
      {
        title: "Submit Pitch / Press Release",
        desc: "Syndicate funding announcements or enterprise security news to CISOs",
        href: "/submit",
        badge: "Fast Track"
      }
    ]
  },
  {
    id: "indexes-benchmarks",
    label: "Indexes & Benchmarks",
    icon: BarChart3,
    headerTitle: "Objective Cybersecurity Capability Rankings",
    items: [
      {
        title: "CISO Vendor & Startup Index",
        desc: "Peer-evaluated capability rankings & community endorsements for 16 platforms",
        href: "/leaderboard",
        badge: "CISO Voted"
      },
      {
        title: "AI Security Model Benchmarks",
        desc: "CyberSecEval 3 ratings for Claude, GPT-4o, and Llama on exploit synthesis",
        href: "/benchmarks",
        badge: "Daily Sync"
      }
    ]
  },
  {
    id: "advisory-services",
    label: "Advisory & Feeds",
    icon: Briefcase,
    headerTitle: "Hackproof Enterprise Services",
    items: [
      {
        title: "Hackproof CISO Advisory Desk",
        desc: "Vendor-neutral technical penetration testing, gap analysis, and POC validation",
        href: "/consult",
        badge: "Executive"
      },
      {
        title: "Media Kit & Sponsored Wire",
        desc: "Reach 12,000+ enterprise CISOs and security buyers with sponsored wires",
        href: "/advertise",
        badge: null
      },
      {
        title: "Enterprise Threat Feed API",
        desc: "Low-latency RESTful JSON feeds for enterprise SIEM and SOAR automation",
        href: "/b2b",
        badge: "B2B Feed"
      }
    ]
  }
];

export default function Header() {
  const [theme, setTheme] = useState("light");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [mobileExpandedSection, setMobileExpandedSection] = useState(null);
  const timeoutRef = useRef(null);
  const navRef = useRef(null);

  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);
    document.documentElement.setAttribute("data-theme", savedTheme);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setActiveDropdown(null);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setActiveDropdown(null);
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Close dropdown on route change
  useEffect(() => {
    setActiveDropdown(null);
    setMobileMenuOpen(false);
  }, [pathname]);

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
      setActiveDropdown(null);
    }
  };

  const handleMouseEnter = (id) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setActiveDropdown(id);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 180);
  };

  const formattedDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  return (
    <div className="header-wrapper" ref={navRef}>
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
            <Link href="/leaderboard" className="top-bar-link">
              <span>CISO Vendor Index</span>
            </Link>
            <span className="telemetry-divider">|</span>
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

      {/* Primary News Navigation Bar with Corporate Dropdowns */}
      <div style={{ borderTop: "1px solid hsl(var(--border))", background: "hsl(var(--background))" }}>
        <div className="container">
          <nav className="desktop-nav" aria-label="Primary Navigation">
            {/* Direct Home Link */}
            <Link 
              href="/" 
              className={`nav-link ${pathname === "/" ? "active" : ""}`}
            >
              All News
            </Link>

            {/* Dropdown Menus */}
            {NAV_DROPDOWNS.map((group) => {
              const isOpen = activeDropdown === group.id;

              return (
                <div 
                  key={group.id} 
                  className="nav-dropdown-wrapper"
                  onMouseEnter={() => handleMouseEnter(group.id)}
                  onMouseLeave={handleMouseLeave}
                >
                  <button
                    type="button"
                    className={`nav-dropdown-trigger ${isOpen ? "open" : ""}`}
                    onClick={() => setActiveDropdown(isOpen ? null : group.id)}
                    aria-expanded={isOpen}
                  >
                    <span>{group.label}</span>
                    <ChevronDown size={13} className={`nav-chevron ${isOpen ? "rotated" : ""}`} />
                  </button>

                  {isOpen && (
                    <div className="nav-dropdown-menu">
                      <div className="nav-dropdown-header">
                        <span>{group.headerTitle}</span>
                      </div>
                      <div className="nav-dropdown-list">
                        {group.items.map((item) => (
                          <Link
                            key={item.title}
                            href={item.href}
                            className="nav-dropdown-item"
                            onClick={() => setActiveDropdown(null)}
                          >
                            <div className="nav-dropdown-item-content">
                              <div className="nav-dropdown-item-title">
                                <span>{item.title}</span>
                                {item.badge && (
                                  <span className="nav-dropdown-badge">{item.badge}</span>
                                )}
                              </div>
                              <div className="nav-dropdown-item-desc">
                                {item.desc}
                              </div>
                            </div>
                            <ChevronRight size={13} className="nav-dropdown-item-arrow" />
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Quick Access Highlights on Right Side */}
            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "6px" }}>
              <Link 
                href="/leaderboard" 
                className={`nav-link ${pathname === "/leaderboard" ? "active" : ""}`}
                style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
              >
                <Award size={13} style={{ color: "hsl(var(--primary))" }} />
                <span>CISO Vendor Index</span>
                <span className="nav-badge-new">VOTED</span>
              </Link>

              <Link 
                href="/benchmarks" 
                className={`nav-link ${pathname === "/benchmarks" ? "active" : ""}`}
                style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
              >
                <BarChart3 size={13} style={{ color: "#15803d" }} />
                <span>AI Benchmarks</span>
              </Link>
            </div>
          </nav>
        </div>
      </div>

      {/* Mobile Drawer Menu with Accordion Dropdowns */}
      {mobileMenuOpen && (
        <div className="mobile-drawer">
          <form onSubmit={handleHeaderSearch} style={{ marginBottom: "12px", position: "relative" }}>
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

          {NAV_DROPDOWNS.map((group) => {
            const isExpanded = mobileExpandedSection === group.id;

            return (
              <div key={group.id} style={{ borderBottom: "1px solid hsl(var(--border-subtle))" }}>
                <button
                  type="button"
                  onClick={() => setMobileExpandedSection(isExpanded ? null : group.id)}
                  style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "10px 12px",
                    background: "none",
                    border: "none",
                    color: "hsl(var(--foreground))",
                    fontSize: "14px",
                    fontWeight: 600,
                    cursor: "pointer",
                    textAlign: "left"
                  }}
                >
                  <span>{group.label}</span>
                  <ChevronDown size={15} style={{ transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s ease" }} />
                </button>

                {isExpanded && (
                  <div style={{ paddingLeft: "12px", paddingBottom: "8px", display: "flex", flexDirection: "column", gap: "4px" }}>
                    {group.items.map((item) => (
                      <Link
                        key={item.title}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        style={{
                          padding: "6px 12px",
                          fontSize: "13px",
                          color: "hsl(var(--muted-foreground))",
                          textDecoration: "none",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center"
                        }}
                      >
                        <span>{item.title}</span>
                        {item.badge && (
                          <span className="nav-dropdown-badge">{item.badge}</span>
                        )}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          <div style={{ marginTop: "16px", paddingTop: "12px", borderTop: "1px solid hsl(var(--border))", display: "flex", flexDirection: "column", gap: "8px" }}>
            <Link 
              href="/leaderboard" 
              className="btn btn-primary"
              style={{ justifyContent: "center", fontSize: "12px" }}
              onClick={() => setMobileMenuOpen(false)}
            >
              <Award size={14} />
              <span>CISO Vendor Index</span>
            </Link>
            
            <Link 
              href="/consult" 
              className="btn"
              style={{ justifyContent: "center", fontSize: "12px", border: "1px solid hsl(var(--border))" }}
              onClick={() => setMobileMenuOpen(false)}
            >
              <Briefcase size={14} />
              <span>CISO Advisory Desk</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
