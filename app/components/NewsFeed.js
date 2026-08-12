"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, MapPin, Calendar, ArrowRight, ShieldCheck, FileCheck2 } from "lucide-react";

export default function NewsFeed({ initialArticles = [] }) {
  const [articles, setArticles] = useState(initialArticles);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = ["All", "Transit", "Infrastructure", "Education", "Safety", "Community", "Health"];

  // Fetch updated list if needed
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
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div>
      {/* Search Bar Section */}
      <section className="search-section">
        <div className="container">
          <h1 className="search-title">
            Hyperlocal News, <span>AI Verified & Sourced.</span>
          </h1>
          <p className="search-subtitle">
            Search verified community updates, transit reports, and public health bulletins by neighborhood or ZIP code.
          </p>
          
          <form onSubmit={handleSearchSubmit} className="search-box-wrapper">
            <div className="search-input-container">
              <Search className="search-input-icon" size={20} />
              <input
                type="text"
                placeholder="Enter ZIP code, neighborhood, or city (e.g., 90210, Oakridge)..."
                className="search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ height: "52px", borderRadius: "12px", padding: "0 24px" }}>
              Find Updates
            </button>
          </form>
        </div>
      </section>

      {/* Category Pills */}
      <div className="container" style={{ marginTop: "20px" }}>
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
            {articles.map((art) => (
              <article key={art.id} className="news-card">
                {/* Decorative Visual stub */}
                <div className="card-image-stub">
                  <MapPin size={40} style={{ opacity: 0.15 }} />
                  <span className="card-category-badge">{art.category}</span>
                  <span className="card-zip-badge">{art.location}</span>
                </div>
                
                <div className="card-body">
                  <div className="card-metadata">
                    <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <Calendar size={13} />
                      {formatDate(art.publishedAt)}
                    </span>
                    <span 
                      style={{ 
                        display: "flex", 
                        alignItems: "center", 
                        gap: "4px", 
                        color: art.similarityScore > 20 ? "hsl(var(--warning))" : "hsl(var(--success))" 
                      }}
                      title="Direct similarity audit score compared to raw source text"
                    >
                      <FileCheck2 size={13} />
                      {art.similarityScore}% Similarity
                    </span>
                  </div>

                  <h2 className="card-title">
                    <Link href={`/news/${art.id}`}>{art.title}</Link>
                  </h2>

                  <p className="card-excerpt">
                    {art.content.replace(/---[\s\S]*$/, "").substring(0, 160).trim()}...
                  </p>

                  <div className="card-footer">
                    <span className="card-provider" title="Official provider verified by key encryption checks">
                      <span className="card-provider-dot"></span>
                      {art.providerName}
                    </span>
                    <Link href={`/news/${art.id}`} className="card-readmore">
                      Read Report
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <Search className="empty-state-icon" />
            <h3 style={{ fontSize: "20px", fontWeight: 700 }}>No Hyperlocal Reports Found</h3>
            <p style={{ maxWidth: "400px", margin: "0 auto" }}>
              We couldn't find any published reports matching "{searchQuery}" in category "{selectedCategory}". Try searching for seeded zip codes like <b>90210</b>, <b>10001</b>, or <b>94102</b>.
            </p>
            <button 
              onClick={() => { setSearchQuery(""); setSelectedCategory("All"); }}
              className="btn btn-secondary"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
