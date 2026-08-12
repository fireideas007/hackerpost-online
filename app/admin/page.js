"use client";

import { useState, useEffect } from "react";
import { 
  Radio, 
  FileText, 
  ShieldCheck, 
  ShieldAlert, 
  Cpu, 
  MapPin, 
  RefreshCw, 
  TrendingDown, 
  CheckCircle2, 
  Trash2, 
  ExternalLink,
  Flame,
  TrendingUp
} from "lucide-react";

export default function AdminDashboard() {
  const [rawArticles, setRawArticles] = useState([]);
  const [publishedArticles, setPublishedArticles] = useState([]);
  const [trendingSearches, setTrendingSearches] = useState([]);
  const [selectedRaw, setSelectedRaw] = useState(null);
  
  // Sandbox State
  const [targetLocation, setTargetLocation] = useState("");
  const [processing, setProcessing] = useState(false);
  const [processResult, setProcessResult] = useState(null);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedContent, setEditedContent] = useState("");
  
  // Notification State
  const [notification, setNotification] = useState(null);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch("/api/news");
      const data = await res.json();
      if (data.success) {
        setRawArticles(data.raw);
        setPublishedArticles(data.published);
        setTrendingSearches(data.trending || []);
        
        // Auto-select first raw article if none is selected
        if (data.raw.length > 0 && !selectedRaw) {
          // Find if any is trending, pick it first
          const sorted = getSortedRawArticles(data.raw, data.trending || []);
          handleSelectRaw(sorted[0]);
        }
      }
    } catch (err) {
      showNotice("error", "Failed to load dashboard data.");
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleSelectRaw = (raw) => {
    setSelectedRaw(raw);
    setTargetLocation(raw.defaultZipCode || "");
    setProcessResult(null);
    setEditedTitle("");
    setEditedContent("");
  };

  const showNotice = (type, text) => {
    setNotification({ type, text });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleSeedSearches = async () => {
    try {
      const res = await fetch("/api/news?seedSearches=true");
      const data = await res.json();
      if (data.success) {
        showNotice("success", "Simulated visitor search traffic logs populated!");
        fetchDashboardData();
      }
    } catch (err) {
      showNotice("error", "Failed to seed simulated searches.");
    }
  };

  const handleAiAuditAndRewrite = async () => {
    if (!selectedRaw) return;
    if (!targetLocation.trim()) {
      showNotice("error", "Please provide a target hyperlocal location.");
      return;
    }

    setProcessing(true);
    try {
      const res = await fetch(
        `/api/news/process?rawId=${selectedRaw.id}&location=${encodeURIComponent(targetLocation)}`
      );
      const data = await res.json();
      if (data.success) {
        setProcessResult(data);
        setEditedTitle(data.rewrittenArticle.title);
        setEditedContent(data.rewrittenArticle.content);
        showNotice("success", "AI Audit and Rewrite completed successfully.");
      } else {
        showNotice("error", data.error || "Rewriting failed.");
      }
    } catch (err) {
      showNotice("error", "Network error during AI execution.");
    } finally {
      setProcessing(false);
    }
  };

  const handlePublish = async () => {
    if (!selectedRaw || !processResult) return;
    if (!editedTitle.trim() || !editedContent.trim()) {
      showNotice("error", "Article title or content cannot be empty.");
      return;
    }

    try {
      const res = await fetch("/api/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rawId: selectedRaw.id,
          providerName: selectedRaw.providerName,
          originalTitle: selectedRaw.title,
          title: editedTitle,
          content: editedContent,
          category: selectedRaw.category,
          location: targetLocation,
          sourceUrl: selectedRaw.sourceUrl,
          similarityScore: processResult.rewrittenPlagiarism.score
        })
      });
      const data = await res.json();
      if (data.success) {
        showNotice("success", "Article published successfully to the public feed!");
        setSelectedRaw(null);
        setProcessResult(null);
        fetchDashboardData();
      } else {
        showNotice("error", data.error || "Failed to publish article.");
      }
    } catch (err) {
      showNotice("error", "Network error during publish.");
    }
  };

  const handleDeletePublished = async (id) => {
    if (!confirm("Are you sure you want to unpublish this article?")) return;
    
    try {
      const res = await fetch(`/api/news?deleteId=${id}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (data.success) {
        showNotice("success", "Article removed from feed.");
        fetchDashboardData();
      } else {
        showNotice("error", "Failed to delete article.");
      }
    } catch (err) {
      showNotice("error", "Network error during delete.");
    }
  };

  const getScoreColor = (score) => {
    if (score > 35) return "danger";
    if (score > 15) return "warning";
    return "success";
  };

  // Helper to reorder and enrich raw articles based on active trending searches
  const getSortedRawArticles = (articlesList = rawArticles, trending = trendingSearches) => {
    return [...articlesList].map(raw => {
      const zipMatch = trending.find(t => t.term === raw.defaultZipCode?.toUpperCase());
      const catMatch = trending.find(t => t.term === raw.category?.toUpperCase());
      
      const searchCount = (zipMatch ? zipMatch.count : 0) + (catMatch ? catMatch.count : 0);
      const isTrending = searchCount > 0;
      
      return {
        ...raw,
        isTrending,
        searchCount
      };
    }).sort((a, b) => b.searchCount - a.searchCount);
  };

  const sortedRawList = getSortedRawArticles();

  return (
    <div className="container" style={{ paddingBottom: "100px", paddingTop: "40px" }}>
      {/* Notifications */}
      {notification && (
        <div 
          style={{
            position: "fixed",
            top: "20px",
            right: "20px",
            zIndex: 1000,
            padding: "16px 24px",
            borderRadius: "var(--radius-md)",
            boxShadow: "var(--shadow-lg)",
            color: "white",
            backgroundColor: notification.type === "success" ? "hsl(var(--success))" : "hsl(var(--danger))",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: "10px",
            animation: "pulse 0.2s ease"
          }}
        >
          {notification.type === "success" ? <CheckCircle2 size={20} /> : <ShieldAlert size={20} />}
          {notification.text}
        </div>
      )}

      {/* Dashboard Title Banner */}
      <div style={{ display: "flex", justifyContent: "between", alignItems: "center", marginBottom: "32px", flexWrap: "wrap", gap: "20px" }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: 800, letterSpacing: "-0.5px" }}>
            AI News Ingestion Sandbox
          </h1>
          <p style={{ color: "hsl(var(--muted-foreground))", fontSize: "14px" }}>
            Aggregate, audit plagiarism, and prioritize local news based on current search demand.
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button 
            onClick={handleSeedSearches} 
            className="btn btn-secondary"
            style={{ display: "flex", alignItems: "center", gap: "6px", border: "1px solid hsl(var(--primary))", color: "hsl(var(--primary))" }}
            title="Populates database with mock searches to demonstrate high-demand sorting badges"
          >
            <TrendingUp size={14} />
            Simulate Traffic
          </button>
          <button 
            onClick={fetchDashboardData} 
            className="btn btn-secondary"
            style={{ display: "flex", alignItems: "center", gap: "6px" }}
          >
            <RefreshCw size={14} />
            Refetch Ingestion Feeds
          </button>
        </div>
      </div>

      {/* Audience Interest Analytics Panel */}
      <div className="admin-panel" style={{ marginBottom: "32px", maxHeight: "none" }}>
        <div className="panel-header" style={{ background: "linear-gradient(135deg, hsla(var(--primary), 0.05), transparent)" }}>
          <h2 className="panel-title" style={{ fontSize: "16px" }}>
            <TrendingUp size={18} style={{ color: "hsl(var(--primary))" }} />
            Audience Search Intent & Demand Analytics
          </h2>
          <span style={{ fontSize: "10px", fontWeight: 700, padding: "2px 8px", borderRadius: "10px", backgroundColor: "hsl(var(--success-bg))", color: "hsl(var(--success))" }}>
            LIVE METRICS
          </span>
        </div>
        <div className="panel-body" style={{ padding: "20px 24px" }}>
          {trendingSearches.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <p style={{ fontSize: "13px", color: "hsl(var(--muted-foreground))" }}>
                Below are the top search queries logged from reader traffic. The ingestion queue has been automatically sorted, pushing raw drafts matching these locations to the top.
              </p>
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                {trendingSearches.map((t, idx) => (
                  <div 
                    key={idx} 
                    style={{ 
                      display: "flex", 
                      alignItems: "center", 
                      gap: "8px", 
                      background: "hsl(var(--muted))", 
                      padding: "8px 14px", 
                      borderRadius: "20px", 
                      fontSize: "13px", 
                      border: "1px solid hsl(var(--border))",
                      fontWeight: 600
                    }}
                  >
                    <Flame size={14} style={{ color: idx === 0 ? "hsl(var(--danger))" : "hsl(var(--warning))" }} />
                    <span style={{ textTransform: "uppercase" }}>{t.term}</span>
                    <span style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", padding: "1px 6px", borderRadius: "10px", fontSize: "11px", color: "hsl(var(--muted-foreground))" }}>
                      {t.count} searches
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "10px 0", color: "hsl(var(--muted-foreground))", fontSize: "13px" }}>
              <p>No search traffic logged yet. Click <b>"Simulate Traffic"</b> above to populate mock searches and demonstrate demand-driven prioritization.</p>
            </div>
          )}
        </div>
      </div>

      <div className="admin-grid">
        {/* Left Column: Ingestion Log list */}
        <div className="admin-panel">
          <div className="panel-header">
            <h2 className="panel-title">
              <Radio size={18} style={{ color: "hsl(var(--primary))" }} />
              Ingested Registry Feeds ({sortedRawList.length})
            </h2>
            <span style={{ fontSize: "11px", fontWeight: 700, backgroundColor: "hsl(var(--muted))", padding: "4px 8px", borderRadius: "4px" }}>
              VERIFIED SOURCES ONLY
            </span>
          </div>
          
          <div className="panel-body">
            {sortedRawList.length > 0 ? (
              sortedRawList.map((raw) => (
                <div 
                  key={raw.id} 
                  className={`ingest-item ${selectedRaw?.id === raw.id ? "active" : ""}`}
                  onClick={() => handleSelectRaw(raw)}
                >
                  <div className="ingest-header">
                    <span className="ingest-provider">{raw.providerName}</span>
                    <span className="ingest-time">
                      {new Date(raw.publishedAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                    </span>
                  </div>
                  
                  {raw.isTrending && (
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "10px", fontWeight: 800, color: "white", backgroundColor: "hsl(var(--danger))", padding: "2px 8px", borderRadius: "10px", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.2px" }}>
                      <Flame size={10} />
                      High Demand ({raw.searchCount} queries)
                    </div>
                  )}

                  <h3 className="ingest-title" style={{ marginTop: raw.isTrending ? "4px" : "0" }}>{raw.title}</h3>
                  <div className="ingest-footer">
                    <span className="trust-badge">
                      <ShieldCheck size={14} />
                      Trust Score: {raw.providerTrustScore}%
                    </span>
                    <span style={{ fontSize: "12px", color: "hsl(var(--primary))", fontWeight: 700, display: "flex", alignItems: "center", gap: "4px" }}>
                      Select for Audit →
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <FileText className="empty-state-icon" />
                <p>No new ingested articles found in feeds.</p>
              </div>
            )}
          </div>
        </div>


        {/* Right Column: Ingestion Sandbox */}
        <div className="admin-panel">
          <div className="panel-header">
            <h2 className="panel-title">
              <Cpu size={18} style={{ color: "hsl(var(--warning))" }} />
              AI Auditor Sandbox
            </h2>
            {selectedRaw && (
              <span className="trust-badge" style={{ backgroundColor: "hsla(var(--success), 0.1)", padding: "4px 8px", borderRadius: "4px" }}>
                Active Session
              </span>
            )}
          </div>

          <div className="panel-body">
            {selectedRaw ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {/* 1. Raw Article Details */}
                <div style={{ background: "hsl(var(--muted))", padding: "16px", borderRadius: "var(--radius-md)", border: "1px solid hsl(var(--border))" }}>
                  <div style={{ display: "flex", justifyContent: "between", alignItems: "start", marginBottom: "8px" }}>
                    <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "hsl(var(--muted-foreground))" }}>
                      Raw Feed Content (Original Source)
                    </span>
                    <a href={selectedRaw.sourceUrl} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "11px", color: "hsl(var(--primary))" }}>
                      Source Link <ExternalLink size={10} />
                    </a>
                  </div>
                  <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "8px" }}>{selectedRaw.title}</h3>
                  <p style={{ fontSize: "13px", color: "hsl(var(--muted-foreground))", maxHeight: "100px", overflowY: "auto", fontFamily: "var(--font-serif)", lineHeight: 1.6 }}>
                    {selectedRaw.content}
                  </p>
                </div>

                {/* 2. Target Hyperlocal Settings */}
                <div>
                  <label className="sandbox-label">Target Location (Neighborhood/ZIP Code)</label>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <div style={{ position: "relative", flex: 1 }}>
                      <MapPin size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "hsl(var(--muted-foreground))" }} />
                      <input 
                        type="text" 
                        placeholder="e.g. 90210, Beverly Hills" 
                        value={targetLocation}
                        onChange={(e) => setTargetLocation(e.target.value)}
                        className="sandbox-input"
                        style={{ paddingLeft: "36px", marginBottom: 0, height: "42px" }}
                      />
                    </div>
                    <button 
                      onClick={handleAiAuditAndRewrite}
                      disabled={processing}
                      className="btn btn-primary"
                      style={{ height: "42px" }}
                    >
                      {processing ? (
                        <span className="sandbox-loading-pulse">Analyzing...</span>
                      ) : (
                        "Audit & Rewrite"
                      )}
                    </button>
                  </div>
                </div>

                {/* 3. AI Process Result Visuals */}
                {processResult && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginTop: "10px" }}>
                    {/* Visual Plagiarism Comparison */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                      {/* Original Plagiarism Assessment */}
                      <div className={`scorecard scorecard-${getScoreColor(processResult.originalPlagiarism.score)}`} style={{ margin: 0, flexDirection: "column", alignItems: "center", textAlign: "center", padding: "20px" }}>
                        <div className="score-circle">
                          {processResult.originalPlagiarism.score}%
                        </div>
                        <div style={{ marginTop: "10px" }}>
                          <div style={{ fontWeight: 700, fontSize: "14px" }}>Source Duplication</div>
                          <div style={{ fontSize: "11px", opacity: 0.8 }}>Overlap with database</div>
                        </div>
                      </div>

                      {/* Rewritten Post-Audit Assessment */}
                      <div className={`scorecard scorecard-${getScoreColor(processResult.rewrittenPlagiarism.score)}`} style={{ margin: 0, flexDirection: "column", alignItems: "center", textAlign: "center", padding: "20px", background: "hsla(var(--success), 0.08)" }}>
                        <div className="score-circle" style={{ borderColor: "hsl(var(--success))", color: "hsl(var(--success))" }}>
                          {processResult.rewrittenPlagiarism.score}%
                        </div>
                        <div style={{ marginTop: "10px" }}>
                          <div style={{ fontWeight: 700, fontSize: "14px", color: "hsl(var(--success))" }}>Post-AI Overlap</div>
                          <div style={{ fontSize: "11px", opacity: 0.8, color: "hsl(var(--success))" }}>
                            <TrendingDown size={12} style={{ verticalAlign: "middle", marginRight: "2px" }} />
                            Safe for Publication
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Plagiarism highlighting list if any */}
                    {processResult.originalPlagiarism.overlappingPhrases.length > 0 && (
                      <div>
                        <span className="sandbox-label" style={{ color: "hsl(var(--danger))", display: "flex", alignItems: "center", gap: "4px" }}>
                          <ShieldAlert size={14} />
                          Flagged Copied Phrasing in Raw Feed:
                        </span>
                        <div className="overlaps-list">
                          {processResult.originalPlagiarism.overlappingPhrases.map((phrase, i) => (
                            <div key={i} className="overlap-phrase">
                              "... {phrase} ..."
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Editor Form */}
                    <div>
                      <label className="sandbox-label">AI Rewritten Title Draft</label>
                      <input 
                        type="text" 
                        className="sandbox-input"
                        value={editedTitle}
                        onChange={(e) => setEditedTitle(e.target.value)}
                      />

                      <label className="sandbox-label">AI Rewritten Body Draft (Editable)</label>
                      <textarea 
                        className="sandbox-textarea"
                        value={editedContent}
                        onChange={(e) => setEditedContent(e.target.value)}
                      ></textarea>

                      <div style={{ display: "flex", gap: "12px", justifyContent: "end" }}>
                        <button 
                          onClick={() => setProcessResult(null)}
                          className="btn btn-secondary"
                        >
                          Discard
                        </button>
                        <button 
                          onClick={handlePublish}
                          className="btn btn-primary"
                          style={{ background: "hsl(var(--success))" }}
                        >
                          Verify & Publish Report
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="empty-state">
                <Cpu className="empty-state-icon" style={{ strokeWidth: 1.5 }} />
                <h3 style={{ fontSize: "16px", fontWeight: 700 }}>Auditor Sandbox Idle</h3>
                <p style={{ fontSize: "13px" }}>
                  Select a verified registry item from the left panel to begin. The auditor will load, compare text overlaps, run localization, and generate draft rewrites.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Seeding & Published Registry Management */}
      <div className="admin-panel" style={{ marginTop: "40px", maxHeight: "none" }}>
        <div className="panel-header">
          <h2 className="panel-title">
            <FileText size={18} />
            Published Article Index ({publishedArticles.length})
          </h2>
          <span style={{ fontSize: "11px", color: "hsl(var(--muted-foreground))" }}>
            MANAGE LIVE PLATFORM
          </span>
        </div>
        <div className="panel-body" style={{ overflowX: "auto" }}>
          {publishedArticles.length > 0 ? (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid hsl(var(--border))", textAlign: "left", color: "hsl(var(--muted-foreground))" }}>
                  <th style={{ padding: "12px" }}>Title</th>
                  <th style={{ padding: "12px" }}>Provider Source</th>
                  <th style={{ padding: "12px" }}>Location</th>
                  <th style={{ padding: "12px" }}>Plagiarism Index</th>
                  <th style={{ padding: "12px" }}>Date Published</th>
                  <th style={{ padding: "12px", textAlign: "center" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {publishedArticles.map((art) => (
                  <tr key={art.id} style={{ borderBottom: "1px solid hsl(var(--border))" }}>
                    <td style={{ padding: "12px", fontWeight: 600 }}>{art.title}</td>
                    <td style={{ padding: "12px" }}>{art.providerName}</td>
                    <td style={{ padding: "12px" }}>
                      <span style={{ background: "hsla(var(--primary), 0.1)", color: "hsl(var(--primary))", padding: "2px 8px", borderRadius: "10px", fontWeight: 700 }}>
                        {art.location}
                      </span>
                    </td>
                    <td style={{ padding: "12px" }}>
                      <span style={{ color: art.similarityScore > 20 ? "hsl(var(--warning))" : "hsl(var(--success))", fontWeight: 700 }}>
                        {art.similarityScore}%
                      </span>
                    </td>
                    <td style={{ padding: "12px" }}>{new Date(art.publishedAt).toLocaleDateString()}</td>
                    <td style={{ padding: "12px", textAlign: "center" }}>
                      <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                        <a href={`/news/${art.id}`} target="_blank" rel="noopener noreferrer" className="btn btn-secondary" style={{ padding: "6px 10px", fontSize: "12px" }}>
                          View
                        </a>
                        <button 
                          onClick={() => handleDeletePublished(art.id)}
                          className="btn btn-danger" 
                          style={{ padding: "6px 10px", fontSize: "12px" }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">
              <p>No articles published to the public feed yet. Run an audit and publish your first article above.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
