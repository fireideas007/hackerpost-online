"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Calendar, ArrowRight, ShieldCheck, Terminal, AlertTriangle, Cpu, Tag } from "lucide-react";

export default function NewsFeed({ initialArticles = [] }) {
  const [articles, setArticles] = useState(initialArticles);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = ["All", "Exploits", "Advisories", "Data Breaches", "Ransomware", "Zero-Days"];

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
            HackerPost — <span>Threat Intelligence Portal</span>
          </h1>
          <p className="search-subtitle">
            Search verified vulnerability disclosures, critical security advisories, and ransomware campaign telemetry. Sourced exclusively from validated advisory keys.
          </p>
          
          <form onSubmit={handleSearchSubmit} className="search-box-wrapper" style={{ marginBottom: "30px" }}>
            <div className="search-input-container">
              <Search className="search-input-icon" size={20} />
              <input
                type="text"
                placeholder="Search CVE ID, vendor, or affected product (e.g., CVE-2026, OpenSSH, ESXi)..."
                className="search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ height: "54px", borderRadius: "8px", padding: "0 28px" }}>
              Query DB
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
              <div style={{ color: "hsl(var(--muted-foreground))", fontSize: "11px", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.5px", marginBottom: "4px" }}>Active Monitors</div>
              <div style={{ fontSize: "24px", fontWeight: 800, color: "hsl(var(--primary))", fontFamily: "var(--font-mono)" }}>1,248</div>
            </div>
            <div style={{
              background: "hsla(var(--card), 0.4)",
              border: "1px solid hsl(var(--border))",
              borderRadius: "var(--radius-sm)",
              padding: "16px 20px",
              textAlign: "left"
            }}>
              <div style={{ color: "hsl(var(--muted-foreground))", fontSize: "11px", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.5px", marginBottom: "4px" }}>Threat Index Level</div>
              <div style={{ fontSize: "24px", fontWeight: 800, color: "hsl(var(--danger))", fontFamily: "var(--font-mono)" }}>CRIT / 8.4</div>
            </div>
            <div style={{
              background: "hsla(var(--card), 0.4)",
              border: "1px solid hsl(var(--border))",
              borderRadius: "var(--radius-sm)",
              padding: "16px 20px",
              textAlign: "left"
            }}>
              <div style={{ color: "hsl(var(--muted-foreground))", fontSize: "11px", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.5px", marginBottom: "4px" }}>Verified Registries</div>
              <div style={{ fontSize: "24px", fontWeight: 800, color: "hsl(var(--success))", fontFamily: "var(--font-mono)" }}>100% SEC</div>
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
              return (
                <article key={art.id} className="news-card">
                  {/* Decorative High Tech Grid Header */}
                  <div className="card-image-stub">
                    <span className="card-category-badge">{art.category}</span>
                    {art.cve && <span className="card-zip-badge">{art.cve}</span>}
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
                        color: sevStyle.text,
                        background: sevStyle.bg,
                        border: sevStyle.border
                      }}>
                        <AlertTriangle size={11} />
                        {sev}
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
                      <Link href={`/news/${art.id}`}>{art.title}</Link>
                    </h2>

                    <p className="card-excerpt">
                      {art.content.replace(/#[\s\S]*?\n/, "").replace(/---[\s\S]*$/, "").substring(0, 150).trim()}...
                    </p>

                    <div className="card-footer">
                      <span className="card-provider" title="Official vulnerability authority verified by key signatures">
                        <span className="card-provider-dot"></span>
                        {art.providerName || "NVD Registry"}
                      </span>
                      <Link href={`/news/${art.id}`} className="card-readmore">
                        Analyze Threat
                        <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">
            <Search className="empty-state-icon" />
            <h3 style={{ fontSize: "20px", fontWeight: 700 }}>No Security Records Found</h3>
            <p style={{ maxWidth: "450px", margin: "0 auto" }}>
              No threat intelligence bulletins found matching "{searchQuery}" under category "{selectedCategory}". Try querying standard tags like <b>OpenSSH</b>, <b>ESXi</b>, or <b>Zero-Days</b>.
            </p>
            <button 
              onClick={() => { setSearchQuery(""); setSelectedCategory("All"); }}
              className="btn btn-secondary"
            >
              Reset Query
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
