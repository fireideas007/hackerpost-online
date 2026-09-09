"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { 
  Search, 
  Calendar, 
  ArrowRight, 
  ShieldCheck, 
  Terminal, 
  AlertTriangle, 
  Clock,
  TrendingUp,
  X
} from "lucide-react";

export default function NewsFeed({ initialArticles = [] }) {
  const searchParams = useSearchParams();
  const [articles, setArticles] = useState(initialArticles);
  const [customSearchQuery, setCustomSearchQuery] = useState("");
  const [customCategory, setCustomCategory] = useState(null);

  const categories = [
    { label: "All Stories", value: "All" },
    { label: "Zero-Days & CVEs", value: "Zero-Days" },
    { label: "SecTech & Startups", value: "SecTech & Startups" },
    { label: "AI Security Benchmarks", value: "AI Benchmarks" },
    { label: "Ransomware", value: "Ransomware" },
    { label: "Advisories & Exploits", value: "Advisories" }
  ];

  const paramCat = searchParams.get("category");
  const paramQ = searchParams.get("q");

  const selectedCategory = customCategory !== null 
    ? customCategory 
    : (paramCat && categories.some(c => c.value === paramCat) ? paramCat : "All");
  const searchQuery = customSearchQuery || paramQ || "";

  useEffect(() => {
    let isCancelled = false;

    async function loadData() {
      try {
        const url = searchQuery 
          ? `/api/news?location=${encodeURIComponent(searchQuery)}` 
          : `/api/news`;
        const res = await fetch(url);
        const data = await res.json();
        if (!isCancelled && data && data.success) {
          let filtered = data.published;
          if (selectedCategory !== "All") {
            filtered = filtered.filter(art => {
              if (selectedCategory === "Advisories") {
                return art.category === "Advisories" || art.category === "Exploits";
              }
              return art.category === selectedCategory;
            });
          }
          setArticles(filtered);
        }
      } catch (err) {
        console.error("Error refreshing feed:", err);
      }
    }

    loadData();

    return () => {
      isCancelled = true;
    };
  }, [searchQuery, selectedCategory]);

  const formatDate = (dateString) => {
    if (!dateString) return "Recently Disclosed";
    try {
      const d = new Date(dateString);
      return isNaN(d.getTime()) ? "Recently Disclosed" : d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
      });
    } catch (_) {
      return "Recently Disclosed";
    }
  };

  const getSeverityBadge = (sev) => {
    const s = String(sev || "").toLowerCase();
    if (s === "critical") return { text: "CRITICAL", color: "hsl(var(--danger))", bg: "hsl(var(--danger-bg))" };
    if (s === "high") return { text: "HIGH", color: "hsl(var(--warning))", bg: "hsl(var(--warning-bg))" };
    if (s === "medium") return { text: "MEDIUM", color: "#b45309", bg: "rgba(180, 83, 9, 0.08)" };
    return { text: "ADVISORY", color: "hsl(var(--primary))", bg: "hsl(var(--primary-bg))" };
  };

  // Divide into Spotlight Lead and secondary items for the classic front page
  const leadStory = articles.length > 0 ? articles[0] : null;
  const secondaryStories = articles.length > 1 ? articles.slice(1, 4) : [];
  const standardFeed = articles.length > 4 ? articles.slice(4) : (articles.length <= 4 ? articles : []);

  return (
    <div className="container" style={{ padding: "24px 0 80px 0" }}>
      {/* Financial & Threat Telemetry Strip (Bloomberg / Reuters Corporate Style) */}
      <div className="market-telemetry-bar">
        <div className="market-telemetry-item">
          <span className="market-telemetry-label">SecTech Capital:</span>
          <span className="market-telemetry-value">$6.2B+ Tracked (840 Rounds)</span>
        </div>
        <div className="market-telemetry-item">
          <span className="market-telemetry-label">Threat Velocity:</span>
          <span className="market-telemetry-value" style={{ color: "hsl(var(--danger))" }}>CRIT / 9.4 (Active Monitoring)</span>
        </div>
        <div className="market-telemetry-item">
          <span className="market-telemetry-label">SecLLM Benchmark:</span>
          <span className="market-telemetry-value">Claude 3.7 Sonnet (94.2 Score)</span>
        </div>
        <div className="market-telemetry-item">
          <span className="market-telemetry-label">Wire Feeds:</span>
          <span className="market-telemetry-value">12 Verified Intelligence Streams</span>
        </div>
      </div>

      {/* Search status notification if search is active */}
      {searchQuery && (
        <div style={{
          background: "hsl(var(--muted))",
          border: "1px solid hsl(var(--border))",
          borderRadius: "var(--radius-sm)",
          padding: "10px 16px",
          marginBottom: "20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: "13px"
        }}>
          <span>
            Filtering stories for: <b>&quot;{searchQuery}&quot;</b> ({articles.length} stories found)
          </span>
          <button
            onClick={() => setCustomSearchQuery("")}
            style={{
              background: "none",
              border: "none",
              color: "hsl(var(--primary))",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "12px",
              display: "inline-flex",
              alignItems: "center",
              gap: "4px"
            }}
          >
            <X size={14} /> Clear Filter
          </button>
        </div>
      )}

      {/* Editorial Front Page Lead Showcase (Only on unfiltered All Stories view) */}
      {!searchQuery && selectedCategory === "All" && leadStory && (
        <section className="editorial-hero-grid">
          {/* Main Hero Story */}
          <div className="lead-story-card">
            <div>
              {/* Featured Lead Story Thumbnail Banner */}
              {leadStory.imageUrl && (
                <Link href={`/news/${leadStory.slug || leadStory.id}`} className="lead-story-image-wrap">
                  <img 
                    src={leadStory.imageUrl} 
                    alt={leadStory.title}
                    className="lead-story-img"
                    loading="eager"
                    decoding="async"
                  />
                </Link>
              )}

              <div className="lead-story-category">
                {leadStory.category === "Zero-Days" ? "CRITICAL THREAT ADVISORY" : leadStory.category.toUpperCase()}
              </div>

              <Link href={`/news/${leadStory.slug || leadStory.id}`}>
                <h1 className="lead-story-title">
                  {leadStory.title}
                </h1>
              </Link>

              <div className="lead-story-meta">
                <span>By HackerPost Intelligence Wire</span>
                <span>•</span>
                <span>{formatDate(leadStory.publishedAt)}</span>
                <span>•</span>
                <span style={{ color: "hsl(var(--primary))", fontWeight: 600 }}>{leadStory.providerName || "Verified Wire"}</span>
              </div>

              <p className="lead-story-excerpt" style={{ marginTop: "12px" }}>
                {leadStory.content ? leadStory.content.replace(/#[\s\S]*?\n/, "").substring(0, 220).trim() + "..." : "Security intelligence teams have cataloged high-severity advisory telemetry across production infrastructure."}
              </p>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "16px" }}>
              <Link 
                href={`/news/${leadStory.slug || leadStory.id}`}
                className="btn btn-primary"
                style={{ padding: "8px 18px", fontSize: "13px" }}
              >
                Read Full Advisory →
              </Link>

              {leadStory.fundingAmount && (
                <span style={{ fontSize: "12px", fontWeight: 700, color: "hsl(var(--success))" }}>
                  Deal Size: {leadStory.fundingAmount} ({leadStory.fundingRound || "Venture Round"})
                </span>
              )}

              {leadStory.cve && (
                <span style={{ fontSize: "12px", fontWeight: 700, fontFamily: "var(--font-mono)", color: "hsl(var(--foreground))" }}>
                  Tracking: {leadStory.cve}
                </span>
              )}
            </div>
          </div>

          {/* Latest Wire Column */}
          <div className="sidebar-wire-list">
            <div className="sidebar-wire-heading">
              Latest Wire Reports
            </div>

            {secondaryStories.map((story) => (
              <article key={story.id} className="sidebar-wire-item">
                {story.imageUrl && (
                  <Link href={`/news/${story.slug || story.id}`} className="sidebar-wire-thumb-wrap">
                    <img 
                      src={story.imageUrl} 
                      alt={story.title} 
                      className="sidebar-wire-thumb"
                      loading="lazy"
                      decoding="async"
                    />
                  </Link>
                )}
                <div className="sidebar-wire-content">
                  <span className="sidebar-wire-cat">
                    {story.category}
                  </span>
                  <Link href={`/news/${story.slug || story.id}`}>
                    <h3 className="sidebar-wire-title">
                      {story.title}
                    </h3>
                  </Link>
                  <div className="sidebar-wire-meta">
                    {formatDate(story.publishedAt)} · {story.providerName || "Verified Feed"}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Classic Section Filter Navigation Tabs */}
      <div className="news-sections-nav">
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setCustomCategory(cat.value)}
            className={`news-section-btn ${selectedCategory === cat.value ? "active" : ""}`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Main 3-Column News Article Grid */}
      {articles.length === 0 ? (
        <div style={{
          textAlign: "center",
          padding: "60px 20px",
          background: "hsl(var(--card))",
          border: "1px solid hsl(var(--border))",
          borderRadius: "var(--radius-sm)"
        }}>
          <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "8px" }}>No Stories Found</h3>
          <p style={{ fontSize: "13px", color: "hsl(var(--muted-foreground))", marginBottom: "16px" }}>
            No published security dispatches match your filter or search query.
          </p>
          <button
            onClick={() => {
              setCustomCategory("All");
              setCustomSearchQuery("");
            }}
            className="btn btn-secondary"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="news-grid">
          {(selectedCategory === "All" && !searchQuery ? standardFeed : articles).map((article) => {
            const sevBadge = getSeverityBadge(article.severity);
            const isDeal = article.category === "SecTech & Startups" || article.category === "M&A & Funding" || !!article.fundingAmount;

            return (
              <article key={article.id} className="news-card">
                {article.imageUrl ? (
                  <Link href={`/news/${article.slug || article.id}`} className="card-thumbnail-container">
                    <img 
                      src={article.imageUrl} 
                      alt={article.title}
                      className="card-thumbnail-img"
                      loading="lazy"
                      decoding="async"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <div className="card-thumbnail-badges">
                      <span className="card-category-badge">
                        {article.category}
                      </span>

                      {isDeal && article.fundingAmount ? (
                        <span className="card-thumbnail-tag deal">
                          {article.fundingAmount}
                        </span>
                      ) : article.cve ? (
                        <span className="card-thumbnail-tag cve">
                          {article.cve}
                        </span>
                      ) : null}
                    </div>
                  </Link>
                ) : (
                  <div className="card-image-stub">
                    <span className="card-category-badge">
                      {article.category}
                    </span>

                    {isDeal && article.fundingAmount ? (
                      <span style={{ fontSize: "11px", fontWeight: 700, color: "hsl(var(--success))" }}>
                        {article.fundingAmount}
                      </span>
                    ) : article.cve ? (
                      <span style={{ fontSize: "11px", fontWeight: 600, fontFamily: "var(--font-mono)", color: "hsl(var(--muted-foreground))" }}>
                        {article.cve}
                      </span>
                    ) : null}
                  </div>
                )}

                <div className="card-body">
                  <div className="card-metadata">
                    <span>{formatDate(article.publishedAt)}</span>
                    <span>•</span>
                    <span>{article.providerName || "Threat Wire"}</span>
                  </div>

                  <Link href={`/news/${article.slug || article.id}`}>
                    <h2 className="card-title">
                      {article.title}
                    </h2>
                  </Link>

                  <p className="card-excerpt">
                    {article.content 
                      ? article.content.replace(/#[\s\S]*?\n/, "").substring(0, 150).trim() + "..." 
                      : "Verified threat intelligence advisory for security engineering teams."}
                  </p>

                  <div className="card-footer">
                    <span style={{
                      fontSize: "10px",
                      fontWeight: 700,
                      padding: "2px 6px",
                      borderRadius: "var(--radius-xs)",
                      background: sevBadge.bg,
                      color: sevBadge.color
                    }}>
                      {isDeal ? "VERIFIED DEAL" : sevBadge.text}
                    </span>

                    <Link href={`/news/${article.slug || article.id}`} className="card-read-more">
                      <span>Full Story</span>
                      <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
