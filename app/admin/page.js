"use client";

import { useState, useEffect } from "react";
import { 
  Radio, 
  FileText, 
  ShieldCheck, 
  ShieldAlert, 
  Cpu, 
  RefreshCw, 
  TrendingDown, 
  CheckCircle2, 
  Trash2, 
  ExternalLink,
  Flame,
  TrendingUp,
  AlertTriangle,
  Terminal,
  Activity
} from "lucide-react";

export default function AdminDashboard() {
  const [rawArticles, setRawArticles] = useState([]);
  const [publishedArticles, setPublishedArticles] = useState([]);
  const [trendingSearches, setTrendingSearches] = useState([]);
  const [selectedRaw, setSelectedRaw] = useState(null);
  
  // Ingest Form States
  const [targetScope, setTargetScope] = useState("");
  const [severity, setSeverity] = useState("High");
  const [cveId, setCveId] = useState("");
  const [affectedProduct, setAffectedProduct] = useState("");
  const [disclosureStatus, setDisclosureStatus] = useState("Patched");
  const [disclosureDate, setDisclosureDate] = useState("");

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
          const sorted = getSortedRawArticles(data.raw, data.trending || []);
          handleSelectRaw(sorted[0]);
        }
      }
    } catch (err) {
      showNotice("error", "Failed to load threat dashboard.");
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleSelectRaw = (raw) => {
    setSelectedRaw(raw);
    setTargetScope(raw.defaultZipCode || raw.cve || "");
    
    // Auto-extract metadata from raw content using regex heuristics
    const extractedCve = raw.cve || raw.content.match(/CVE-\d{4}-\d{4,7}/)?.[0] || "";
    setCveId(extractedCve);

    let extractedSev = raw.severity || "Medium";
    if (/critical|9\.\d/i.test(raw.content + raw.title)) extractedSev = "Critical";
    else if (/high|8\.\d|7\.\d/i.test(raw.content + raw.title)) extractedSev = "High";
    setSeverity(extractedSev);

    const extractedProduct = raw.affectedProduct || raw.content.match(/OpenSSH|VMware|ESXi|Windows Kernel|Apache/i)?.[0] || "";
    setAffectedProduct(extractedProduct);

    setDisclosureStatus(raw.disclosureStatus || "Patched");
    setDisclosureDate(new Date().toISOString().split('T')[0]);

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
        showNotice("success", "Simulated threat search stream populated!");
        fetchDashboardData();
      }
    } catch (err) {
      showNotice("error", "Failed to populate search stream.");
    }
  };

  const handleAiAuditAndRewrite = async () => {
    if (!selectedRaw) return;
    if (!targetScope.trim()) {
      showNotice("error", "Please provide a target threat scope / CVE ID.");
      return;
    }

    setProcessing(true);
    try {
      const res = await fetch(
        `/api/news/process?rawId=${selectedRaw.id}&location=${encodeURIComponent(targetScope)}`
      );
      const data = await res.json();
      if (data.success) {
        setProcessResult(data);
        setEditedTitle(data.rewrittenArticle.title);
        setEditedContent(data.rewrittenArticle.content);
        showNotice("success", "AI threat analysis and sanitization completed.");
      } else {
        showNotice("error", data.error || "Analysis failed.");
      }
    } catch (err) {
      showNotice("error", "Error contacting the advisory generator.");
    } finally {
      setProcessing(false);
    }
  };

  const handlePublish = async () => {
    if (!selectedRaw || !processResult) return;
    if (!editedTitle.trim() || !editedContent.trim()) {
      showNotice("error", "Advisory title or content cannot be empty.");
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
          location: targetScope, // Map scope to location for compatibility
          sourceUrl: selectedRaw.sourceUrl,
          similarityScore: processResult.rewrittenPlagiarism.score,
          
          // Enhanced cybersecurity metadata attributes
          severity,
          cve: cveId || targetScope,
          affectedProduct,
          disclosureStatus,
          disclosureDate
        })
      });
      const data = await res.json();
      if (data.success) {
        showNotice("success", "Security advisory published to feed!");
        setSelectedRaw(null);
        setProcessResult(null);
        fetchDashboardData();
      } else {
        showNotice("error", data.error || "Failed to publish advisory.");
      }
    } catch (err) {
      showNotice("error", "Network error during publish.");
    }
  };

  const handleDeletePublished = async (id) => {
    if (!confirm("Are you sure you want to retract this published advisory?")) return;
    
    try {
      const res = await fetch(`/api/news?deleteId=${id}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (data.success) {
        showNotice("success", "Advisory retracted successfully.");
        fetchDashboardData();
      } else {
        showNotice("error", "Failed to retract advisory.");
      }
    } catch (err) {
      showNotice("error", "Network error during retraction.");
    }
  };

  const getScoreColor = (score) => {
    if (score > 35) return "danger";
    if (score > 15) return "warning";
    return "success";
  };

  const getSortedRawArticles = (articlesList = rawArticles, trending = trendingSearches) => {
    return [...articlesList].map(raw => {
      const cveMatch = trending.find(t => t.term === raw.defaultZipCode?.toUpperCase());
      const catMatch = trending.find(t => t.term === raw.category?.toUpperCase());
      
      const searchCount = (cveMatch ? cveMatch.count : 0) + (catMatch ? catMatch.count : 0);
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
      {/* Alert Notifications */}
      {notification && (
        <div 
          style={{
            position: "fixed",
            top: "20px",
            right: "20px",
            zIndex: 1000,
            padding: "16px 24px",
            borderRadius: "var(--radius-sm)",
            boxShadow: "var(--shadow-lg)",
            color: "#000000",
            backgroundColor: notification.type === "success" ? "hsl(var(--success))" : "hsl(var(--danger))",
            fontWeight: 800,
            display: "flex",
            alignItems: "center",
            gap: "10px"
          }}
        >
          {notification.type === "success" ? <CheckCircle2 size={20} /> : <ShieldAlert size={20} />}
          {notification.text}
        </div>
      )}

      {/* Dashboard Title Banner */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px", flexWrap: "wrap", gap: "20px" }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: 800, letterSpacing: "-0.5px", textTransform: "uppercase" }}>
            Threat Ingestion Hub
          </h1>
          <p style={{ color: "hsl(var(--muted-foreground))", fontSize: "14px" }}>
            Audit incoming registry bulletins, analyze exploit code structures, and sanitize threat reports for safe public indexing.
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button 
            onClick={handleSeedSearches} 
            className="btn btn-secondary"
            style={{ display: "flex", alignItems: "center", gap: "6px", border: "1px solid hsl(var(--primary))", color: "hsl(var(--primary))" }}
            title="Populates mock security analyst searches to simulate demand prioritization"
          >
            <TrendingUp size={14} />
            Simulate Threat Queries
          </button>
          <button 
            onClick={fetchDashboardData} 
            className="btn btn-secondary"
            style={{ display: "flex", alignItems: "center", gap: "6px" }}
          >
            <RefreshCw size={14} />
            Fetch Threat Feeds
          </button>
        </div>
      </div>

      {/* Demand Analytics Panel */}
      <div className="admin-panel" style={{ marginBottom: "32px", maxHeight: "none" }}>
        <div className="panel-header" style={{ background: "linear-gradient(135deg, hsla(var(--primary), 0.05), transparent)" }}>
          <h2 className="panel-title" style={{ fontSize: "14px" }}>
            <Activity size={18} style={{ color: "hsl(var(--primary))" }} />
            Threat Search Frequency & Intelligence Telemetry
          </h2>
          <span style={{ fontSize: "10px", fontWeight: 800, padding: "2px 8px", borderRadius: "2px", backgroundColor: "hsla(var(--success), 0.1)", color: "hsl(var(--success))" }}>
            REALTIME LOGS
          </span>
        </div>
        <div className="panel-body" style={{ padding: "20px 24px" }}>
          {trendingSearches.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <p style={{ fontSize: "13px", color: "hsl(var(--muted-foreground))" }}>
                Top threat queries monitored across the interface. The ingestion backlog automatically prioritizes incoming bulletins matching these scopes.
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
                      borderRadius: "var(--radius-sm)", 
                      fontSize: "12px", 
                      border: "1px solid hsl(var(--border))",
                      fontWeight: 700,
                      fontFamily: "var(--font-mono)"
                    }}
                  >
                    <Flame size={14} style={{ color: idx === 0 ? "hsl(var(--danger))" : "hsl(var(--warning))" }} />
                    <span>{t.term}</span>
                    <span style={{ background: "rgba(0,0,0,0.3)", padding: "2px 6px", borderRadius: "var(--radius-sm)", fontSize: "10px", color: "hsl(var(--primary))" }}>
                      {t.count} logs
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "10px 0", color: "hsl(var(--muted-foreground))", fontSize: "13px" }}>
              <p>Threat log stream empty. Click <b>"Simulate Threat Queries"</b> to seed reader activities.</p>
            </div>
          )}
        </div>
      </div>

      <div className="admin-grid">
        {/* Ingested Feeds List */}
        <div className="admin-panel">
          <div className="panel-header">
            <h2 className="panel-title">
              <Radio size={18} style={{ color: "hsl(var(--primary))" }} />
              Ingested Vulnerability Registry ({sortedRawList.length})
            </h2>
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
                    <span className="ingest-time" style={{ fontFamily: "var(--font-mono)" }}>
                      {new Date(raw.publishedAt).toLocaleTimeString()}
                    </span>
                  </div>
                  
                  {raw.isTrending && (
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "9px", fontWeight: 800, color: "#000000", backgroundColor: "hsl(var(--danger))", padding: "2px 8px", borderRadius: "2px", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.2px" }}>
                      <Flame size={10} />
                      High Query Frequency ({raw.searchCount} hits)
                    </div>
                  )}

                  <h3 className="ingest-title" style={{ marginTop: raw.isTrending ? "4px" : "0" }}>{raw.title}</h3>
                  <div className="ingest-footer">
                    <span className="trust-badge">
                      <ShieldCheck size={14} />
                      Verify Index: {raw.providerTrustScore}%
                    </span>
                    <span style={{ fontSize: "12px", color: "hsl(var(--primary))", fontWeight: 800, display: "flex", alignItems: "center", gap: "4px", textTransform: "uppercase" }}>
                      Audit Payload →
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <FileText className="empty-state-icon" />
                <p>Registry buffers cleared.</p>
              </div>
            )}
          </div>
        </div>

        {/* Audit Sandbox Panel */}
        <div className="admin-panel">
          <div className="panel-header">
            <h2 className="panel-title">
              <Cpu size={18} style={{ color: "hsl(var(--warning))" }} />
              Advisory Audit Sandbox
            </h2>
          </div>

          <div className="panel-body">
            {selectedRaw ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {/* 1. Raw Article Details */}
                <div style={{ background: "hsl(var(--muted))", padding: "16px", borderRadius: "var(--radius-sm)", border: "1px solid hsl(var(--border))" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <span style={{ fontSize: "11px", fontWeight: 800, textTransform: "uppercase", color: "hsl(var(--muted-foreground))" }}>
                      Original Registry Telemetry
                    </span>
                    <a href={selectedRaw.sourceUrl} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "11px", color: "hsl(var(--primary))", fontWeight: 700 }}>
                      Source Link <ExternalLink size={10} />
                    </a>
                  </div>
                  <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "8px" }}>{selectedRaw.title}</h3>
                  <p style={{ fontSize: "13px", color: "hsl(var(--muted-foreground))", maxHeight: "100px", overflowY: "auto", fontFamily: "var(--font-mono)", lineHeight: 1.6 }}>
                    {selectedRaw.content}
                  </p>
                </div>

                {/* 2. Ingest Parameters */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div>
                    <label className="sandbox-label">Threat Scope / Target Tag</label>
                    <input 
                      type="text" 
                      placeholder="e.g. CVE-2026-3829" 
                      value={targetScope}
                      onChange={(e) => setTargetScope(e.target.value)}
                      className="sandbox-input"
                      style={{ marginBottom: 0, height: "38px" }}
                    />
                  </div>
                  <div>
                    <label className="sandbox-label">Severity Level</label>
                    <select 
                      value={severity} 
                      onChange={(e) => setSeverity(e.target.value)}
                      className="sandbox-input"
                      style={{ height: "38px", background: "hsl(var(--background))" }}
                    >
                      <option value="Critical">Critical</option>
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>
                  <div>
                    <label className="sandbox-label">CVE Identification</label>
                    <input 
                      type="text" 
                      placeholder="CVE-XXXX-XXXX" 
                      value={cveId}
                      onChange={(e) => setCveId(e.target.value)}
                      className="sandbox-input"
                      style={{ marginBottom: 0, height: "38px", fontFamily: "var(--font-mono)" }}
                    />
                  </div>
                  <div>
                    <label className="sandbox-label">Affected Vendor / Product</label>
                    <input 
                      type="text" 
                      placeholder="e.g. OpenSSH Server" 
                      value={affectedProduct}
                      onChange={(e) => setAffectedProduct(e.target.value)}
                      className="sandbox-input"
                      style={{ marginBottom: 0, height: "38px" }}
                    />
                  </div>
                  <div>
                    <label className="sandbox-label">Disclosure Status</label>
                    <select 
                      value={disclosureStatus} 
                      onChange={(e) => setDisclosureStatus(e.target.value)}
                      className="sandbox-input"
                      style={{ height: "38px", background: "hsl(var(--background))" }}
                    >
                      <option value="Patched">Patched (Fix Ready)</option>
                      <option value="Mitigated">Mitigated (Workaround)</option>
                      <option value="Disclosed">Disclosed (Zero-Day)</option>
                      <option value="Under Review">Under Review</option>
                    </select>
                  </div>
                  <div>
                    <label className="sandbox-label">Disclosure Date</label>
                    <input 
                      type="date" 
                      value={disclosureDate}
                      onChange={(e) => setDisclosureDate(e.target.value)}
                      className="sandbox-input"
                      style={{ height: "38px", background: "hsl(var(--background))" }}
                    />
                  </div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <button 
                    onClick={handleAiAuditAndRewrite}
                    disabled={processing}
                    className="btn btn-primary"
                    style={{ height: "42px", width: "100%" }}
                  >
                    {processing ? (
                      <span className="sandbox-loading-pulse">Sanitizing Exploits & Auditing...</span>
                    ) : (
                      "Run Advisory Audit & Sanitization"
                    )}
                  </button>
                </div>

                {/* 3. AI Rewrite Editor */}
                {processResult && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginTop: "10px" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                      <div className={`scorecard scorecard-${getScoreColor(processResult.originalPlagiarism.score)}`} style={{ margin: 0, flexDirection: "column", alignItems: "center", textAlign: "center", padding: "16px" }}>
                        <div className="score-circle" style={{ width: "48px", height: "48px", fontSize: "16px" }}>
                          {processResult.originalPlagiarism.score}%
                        </div>
                        <div style={{ marginTop: "6px" }}>
                          <div style={{ fontWeight: 800, fontSize: "12px", textTransform: "uppercase" }}>Registry Overlap</div>
                        </div>
                      </div>

                      <div className={`scorecard scorecard-${getScoreColor(processResult.rewrittenPlagiarism.score)}`} style={{ margin: 0, flexDirection: "column", alignItems: "center", textAlign: "center", padding: "16px", background: "hsla(var(--success), 0.08)" }}>
                        <div className="score-circle" style={{ width: "48px", height: "48px", fontSize: "16px", borderColor: "hsl(var(--success))", color: "hsl(var(--success))" }}>
                          {processResult.rewrittenPlagiarism.score}%
                        </div>
                        <div style={{ marginTop: "6px" }}>
                          <div style={{ fontWeight: 800, fontSize: "12px", textTransform: "uppercase", color: "hsl(var(--success))" }}>Sanitized Diffs</div>
                        </div>
                      </div>
                    </div>

                    {processResult.originalPlagiarism.overlappingPhrases.length > 0 && (
                      <div>
                        <span className="sandbox-label" style={{ color: "hsl(var(--danger))", display: "flex", alignItems: "center", gap: "4px" }}>
                          <ShieldAlert size={14} />
                          Flagged Raw Payload Strings (Bypassed in Sanitization):
                        </span>
                        <div className="overlaps-list" style={{ marginTop: "6px" }}>
                          {processResult.originalPlagiarism.overlappingPhrases.map((phrase, i) => (
                            <div key={i} className="overlap-phrase">
                              {phrase}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="sandbox-label">Sanitized Advisory Title</label>
                      <input 
                        type="text" 
                        className="sandbox-input"
                        value={editedTitle}
                        onChange={(e) => setEditedTitle(e.target.value)}
                        style={{ height: "40px" }}
                      />

                      <label className="sandbox-label">Markdown Bulletin (Safe-View Scanned)</label>
                      <textarea 
                        className="sandbox-textarea"
                        value={editedContent}
                        onChange={(e) => setEditedContent(e.target.value)}
                        style={{ height: "200px", fontFamily: "var(--font-mono)", fontSize: "12px" }}
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
                          style={{ background: "hsl(var(--success))", color: "#000000" }}
                        >
                          Publish Verified Bulletin
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="empty-state">
                <Cpu className="empty-state-icon" style={{ strokeWidth: 1.5 }} />
                <h3 style={{ fontSize: "16px", fontWeight: 800, textTransform: "uppercase" }}>Audit Sandbox Idle</h3>
                <p style={{ fontSize: "13px" }}>
                  Select an ingested raw telemetry stream from the left registry to start analysis. The audit subsystem will scan for payload blocks and prepare disclosure reports.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Retract Advisories list */}
      <div className="admin-panel" style={{ marginTop: "40px", maxHeight: "none" }}>
        <div className="panel-header">
          <h2 className="panel-title">
            <FileText size={18} />
            Published Advisory Index ({publishedArticles.length})
          </h2>
        </div>
        <div className="panel-body" style={{ overflowX: "auto" }}>
          {publishedArticles.length > 0 ? (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid hsl(var(--border))", textAlign: "left", color: "hsl(var(--muted-foreground))" }}>
                  <th style={{ padding: "12px" }}>Advisory Title</th>
                  <th style={{ padding: "12px" }}>CVE Identification</th>
                  <th style={{ padding: "12px" }}>Affected Product</th>
                  <th style={{ padding: "12px" }}>Severity</th>
                  <th style={{ padding: "12px" }}>Disclosure Status</th>
                  <th style={{ padding: "12px", textAlign: "center" }}>Retract</th>
                </tr>
              </thead>
              <tbody>
                {publishedArticles.map((art) => (
                  <tr key={art.id} style={{ borderBottom: "1px solid hsl(var(--border))" }}>
                    <td style={{ padding: "12px", fontWeight: 700 }}>{art.title}</td>
                    <td style={{ padding: "12px", fontFamily: "var(--font-mono)" }}>{art.cve || "N/A"}</td>
                    <td style={{ padding: "12px" }}>{art.affectedProduct || "N/A"}</td>
                    <td style={{ padding: "12px", fontWeight: 800, color: art.severity === "Critical" ? "hsl(var(--danger))" : art.severity === "High" ? "hsl(var(--warning))" : "hsl(var(--primary))" }}>
                      {art.severity || "Medium"}
                    </td>
                    <td style={{ padding: "12px" }}>
                      <span style={{ background: "rgba(255,255,255,0.05)", border: "1px solid hsl(var(--border))", padding: "2px 8px", borderRadius: "2px", fontWeight: 700 }}>
                        {art.disclosureStatus || "Patched"}
                      </span>
                    </td>
                    <td style={{ padding: "12px", textAlign: "center" }}>
                      <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                        <a href={`/news/${art.id}`} target="_blank" rel="noopener noreferrer" className="btn btn-secondary" style={{ padding: "6px 10px", fontSize: "11px" }}>
                          View
                        </a>
                        <button 
                          onClick={() => handleDeletePublished(art.id)}
                          className="btn btn-danger" 
                          style={{ padding: "6px 10px", fontSize: "11px" }}
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
              <p>No active bulletins published yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
