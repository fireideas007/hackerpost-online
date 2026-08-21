"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Calendar, ArrowRight, ShieldCheck, Terminal, AlertTriangle, Cpu, Tag, Rocket, Briefcase, DollarSign } from "lucide-react";

export default function NewsFeed({ initialArticles = [] }) {
  const [articles, setArticles] = useState(initialArticles);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = [
    "All", 
    "SecTech & Startups", 
    "AI Benchmarks",
    "M&A & Funding", 
    "Zero-Days", 
    "Ransomware", 
    "Exploits", 
    "Advisories"
  ];

  const refreshFeed = async () => {
    try {
      const url = searchQuery 
        ? `/api/news?location=${encodeURIComponent(searchQuery)}` 
        : `/api/news`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        let filtered = data.published;
        if (selectedCategory !== "All") {
          filtered = filtered.filter(art => art.category === selectedCategory);
        }
        setArticles(filtered);
      }
    } catch (err) {
      console.error("Error refreshing feed:", err);
    }
  };

  useEffect(() => {
    refreshFeed();
  }, [searchQuery, selectedCategory]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    refreshFeed();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  const getSeverityColor = (sev) => {
    const s = String(sev).toLowerCase();
    if (s === "critical") return { text: "hsl(var(--danger))", bg: "hsla(var(--danger), 0.1)", border: "1px solid hsla(var(--danger), 0.3)" };
    if (s === "high") return { text: "hsl(var(--warning))", bg: "hsla(var(--warning), 0.1)", border: "1px solid hsla(var(--warning), 0.3)" };
    if (s === "medium") return { text: "hsl(38, 100%, 50%)", bg: "rgba(251, 191, 36, 0.1)", border: "1px solid rgba(251, 191, 36, 0.3)" };
    return { text: "hsl(var(--primary))", bg: "hsla(var(--primary), 0.1)", border: "1px solid hsla(var(--primary), 0.3)" };
  };

  return (
    <div>
      {/* Search Bar Section */}
      <section className="search-section">
        <div className="container">
          <h1 className="search-title">
            HackerPost — <span>SecTech Intelligence & Startups</span>
          </h1>
          <p className="search-subtitle">
            Real-time intelligence on cybersecurity startups, VC funding rounds, M&A deals, zero-day threat vectors, and enterprise vulnerability disclosures.
          </p>
          
          <form onSubmit={handleSearchSubmit} className="search-box-wrapper" style={{ marginBottom: "30px" }}>
            <div className="search-input-container">
              <Search className="search-input-icon" size={20} />
              <input
                type="text"
                placeholder="Search startups, funding rounds, CVEs, or enterprise vendors (e.g. Series A, Wiz, OpenSSH, ESXi)..."
                className="search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ height: "54px", borderRadius: "8px", padding: "0 28px" }}>
              Search Wire
            </button>
          </form>

          {/* Core Analytics Cards */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "20px",
            maxWidth: "900px",
            margin: "0 auto",
            marginTop: "40px"
          }}>
            <div style={{
              background: "hsla(var(--card), 0.4)",
              border: "1px solid hsl(var(--border))",
              borderRadius: "var(--radius-sm)",
              padding: "16px 20px",
              textAlign: "left"
            }}>
              <div style={{ color: "hsl(var(--muted-foreground))", fontSize: "11px", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.5px", marginBottom: "4px" }}>SecTech Startups Tracked</div>
              <div style={{ fontSize: "24px", fontWeight: 800, color: "hsl(var(--primary))", fontFamily: "var(--font-mono)" }}>840+ Deals</div>
            </div>
            <div style={{
              background: "hsla(var(--card), 0.4)",
              border: "1px solid hsl(var(--border))",
              borderRadius: "var(--radius-sm)",
              padding: "16px 20px",
              textAlign: "left"
            }}>
              <div style={{ color: "hsl(var(--muted-foreground))", fontSize: "11px", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.5px", marginBottom: "4px" }}>Threat & Risk Index</div>
              <div style={{ fontSize: "24px", fontWeight: 800, color: "hsl(var(--danger))", fontFamily: "var(--font-mono)" }}>CRIT / 9.1</div>
            </div>
            <div style={{
              background: "hsla(var(--card), 0.4)",
              border: "1px solid hsl(var(--border))",
              borderRadius: "var(--radius-sm)",
              padding: "16px 20px",
              textAlign: "left"
            }}>
              <div style={{ color: "hsl(var(--muted-foreground))", fontSize: "11px", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.5px", marginBottom: "4px" }}>Verified Feed Sources</div>
              <div style={{ fontSize: "24px", fontWeight: 800, color: "hsl(var(--success))", fontFamily: "var(--font-mono)" }}>7 Premier Wires</div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Pills */}
      <div className="container" style={{ marginTop: "30px" }}>
        <div className="filters-wrapper">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`filter-btn ${selectedCategory === cat ? "active" : ""}`}
            >
              {cat === "SecTech & Startups" && "🚀 "}
              {cat === "AI Benchmarks" && "📊 "}
              {cat === "M&A & Funding" && "💼 "}
              {cat === "Zero-Days" && "🔥 "}
              {cat === "Ransomware" && "🛡️ "}
              {cat}
            </button>
          ))}
        </div>

        {/* News Grid */}
        {articles.length > 0 ? (
          <div className="news-grid">
            {articles.map((art) => {
              const sev = art.severity || "Medium";
              const sevStyle = getSeverityColor(sev);
              const isStartup = art.category === "SecTech & Startups" || art.category === "M&A & Funding" || art.fundingAmount;

              return (
                <article key={art.id} className="news-card">
                  {/* Card Category Header */}
                  <div className="card-image-stub">
                    <span className="card-category-badge" style={{
                      background: isStartup ? "linear-gradient(135deg, hsla(var(--primary), 0.25), rgba(168, 85, 247, 0.25))" : undefined,
                      borderColor: isStartup ? "hsl(var(--primary))" : undefined,
                      color: isStartup ? "#ffffff" : undefined
                    }}>
                      {isStartup && "🚀 "}{art.category}
                    </span>
                    {art.cve && <span className="card-zip-badge">{art.cve}</span>}
                    {isStartup && art.fundingAmount && (
                      <span className="card-zip-badge" style={{ color: "hsl(var(--success))", borderColor: "hsla(var(--success), 0.3)" }}>
                        {art.fundingAmount}
                      </span>
                    )}
                  </div>
                  
                  <div className="card-body">
                    <div className="card-metadata" style={{ gap: "8px", flexWrap: "wrap" }}>
                      <span style={{ 
                        display: "inline-flex", 
                        alignItems: "center", 
                        gap: "6px",
                        padding: "3px 8px",
                        borderRadius: "var(--radius-sm)",
                        fontSize: "11px",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        color: isStartup ? "hsl(var(--primary))" : sevStyle.text,
                        background: isStartup ? "hsla(var(--primary), 0.1)" : sevStyle.bg,
                        border: isStartup ? "1px solid hsla(var(--primary), 0.3)" : sevStyle.border
                      }}>
                        {isStartup ? <Rocket size={11} /> : <AlertTriangle size={11} />}
                        {isStartup ? (art.fundingRound || "Venture Deal") : sev}
                      </span>

                      {art.affectedProduct && (
                        <span style={{ 
                          display: "inline-flex", 
                          alignItems: "center", 
                          gap: "4px",
                          padding: "3px 8px",
                          borderRadius: "var(--radius-sm)",
                          background: "hsl(var(--muted))",
                          border: "1px solid hsl(var(--border))",
                          fontSize: "11px",
                          fontWeight: 500,
                          color: "hsl(var(--foreground))"
                        }}>
                          <Cpu size={11} />
                          {art.affectedProduct}
                        </span>
                      )}

                      <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", marginLeft: "auto" }}>
                        <Calendar size={12} />
                        {formatDate(art.publishedAt)}
                      </span>
                    </div>

                    <h2 className="card-title">
                      <Link href={`/news/${art.id}`}>
                        {art.title}
                      </Link>
                    </h2>
                    
                    <p className="card-excerpt">
                      {art.content.replace(/[#*`>\[\]!]/g, "").slice(0, 160)}...
                    </p>

                    <div className="card-footer" style={{ borderTop: "1px solid hsl(var(--border))", paddingTop: "14px", marginTop: "14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span className="card-provider" style={{ fontSize: "11px", color: "hsl(var(--muted-foreground))" }}>
                        Wire: <b>{art.providerName || "Verified Security Wire"}</b>
                      </span>
                      <Link href={`/news/${art.id}`} className="card-read-more">
                        {isStartup ? "View Deal Brief" : "Full Advisory"} <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">
            <Terminal size={36} className="empty-state-icon" />
            <h3 style={{ fontSize: "18px", fontWeight: 700 }}>No reports matching query</h3>
            <p style={{ color: "hsl(var(--muted-foreground))", marginTop: "8px" }}>
              No intelligence bulletins or startup deals found for &quot;{searchQuery || selectedCategory}&quot;.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
