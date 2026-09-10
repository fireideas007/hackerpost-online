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
  Activity,
  Share2,
  Send,
  Sparkles,
  Key,
  Settings,
  X,
  Check,
  RotateCw
} from "lucide-react";
import EditorAuthGate from "../components/EditorAuthGate";

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
  const [scraping, setScraping] = useState(false);

  // Social / X Broadcasting & Handle Configuration State
  const [socialLogs, setSocialLogs] = useState([]);
  const [socialInfo, setSocialInfo] = useState({ handle: "@HackerPost2", isLiveConfigured: false, isVerified: false, mode: "simulated" });
  const [broadcastingId, setBroadcastingId] = useState(null);
  const [showTwitterModal, setShowTwitterModal] = useState(false);
  const [twitterForm, setTwitterForm] = useState({
    handle: "",
    apiKey: "",
    apiSecret: "",
    accessToken: "",
    accessSecret: "",
    autoPost: true
  });
  const [testingConnection, setTestingConnection] = useState(false);
  const [savingTwitter, setSavingTwitter] = useState(false);
  const [syncingAll, setSyncingAll] = useState(false);

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

  const fetchSocialLogs = async () => {
    try {
      const res = await fetch("/api/social/logs");
      const data = await res.json();
      if (data.success) {
        setSocialLogs(data.logs || []);
        setSocialInfo({
          handle: data.handle || "@HackerPost2",
          isLiveConfigured: !!data.isLiveConfigured,
          isVerified: !!data.isVerified,
          mode: data.mode || "simulated",
          config: data.config || null
        });
        if (data.config) {
          setTwitterForm({
            handle: data.config.handle || "",
            apiKey: data.config.apiKeySnippet || "",
            apiSecret: data.config.hasApiSecret ? "••••••••••••••••" : "",
            accessToken: data.config.accessTokenSnippet || "",
            accessSecret: data.config.hasAccessSecret ? "••••••••••••••••" : "",
            autoPost: typeof data.config.autoPost === "boolean" ? data.config.autoPost : true
          });
        }
      }
    } catch (_) {}
  };

  const handleBroadcastToX = async (articleId) => {
    setBroadcastingId(articleId);
    try {
      const res = await fetch("/api/social/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleId, force: true })
      });
      const data = await res.json();
      if (data.success) {
        showNotice("success", `Broadcasted to X (${data.broadcast?.handle || socialInfo.handle}) with dynamic hashtags!`);
        fetchSocialLogs();
        fetchDashboardData();
      } else {
        showNotice("error", data.error || "Failed to broadcast to X.");
      }
    } catch (err) {
      showNotice("error", "Error connecting to X syndication engine.");
    } finally {
      setBroadcastingId(null);
    }
  };

  const handleTestTwitterConnection = async () => {
    setTestingConnection(true);
    try {
      const res = await fetch("/api/social/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      const data = await res.json();
      if (data.success) {
        showNotice("success", `Twitter Verified! Authenticated as ${data.result?.handle} (${data.result?.user?.name || ""})`);
        fetchSocialLogs();
      } else {
        showNotice("error", `Verification Failed: ${data.result?.error || data.error || "Please check credentials."}`);
      }
    } catch (err) {
      showNotice("error", "Failed to contact Twitter verification endpoint.");
    } finally {
      setTestingConnection(false);
    }
  };

  const handleSaveTwitterConfig = async (e) => {
    if (e) e.preventDefault();
    setSavingTwitter(true);
    try {
      const res = await fetch("/api/social/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          handle: twitterForm.handle,
          apiKey: twitterForm.apiKey,
          apiSecret: twitterForm.apiSecret,
          accessToken: twitterForm.accessToken,
          accessSecret: twitterForm.accessSecret,
          autoPost: twitterForm.autoPost,
          verifyNow: true
        })
      });
      const data = await res.json();
      if (data.success) {
        showNotice("success", "Twitter handle and configuration updated!");
        if (data.verification?.success) {
          showNotice("success", `Verified handle: ${data.verification.handle}`);
        } else if (data.verification?.error) {
          showNotice("error", `Saved, but verification warned: ${data.verification.error}`);
        }
        setShowTwitterModal(false);
        fetchSocialLogs();
      } else {
        showNotice("error", data.error || "Failed to save Twitter configuration.");
      }
    } catch (err) {
      showNotice("error", "Network error saving Twitter settings.");
    } finally {
      setSavingTwitter(false);
    }
  };

  const handleSyncAllToX = async () => {
    setSyncingAll(true);
    try {
      const res = await fetch("/api/social/sync-all", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ limit: 15, force: false })
      });
      const data = await res.json();
      if (data.success) {
        showNotice("success", data.message || `Syndicated ${data.count} articles to X!`);
        fetchDashboardData();
        fetchSocialLogs();
      } else {
        showNotice("error", data.error || "Failed to syndicate unposted articles.");
      }
    } catch (err) {
      showNotice("error", "Network error during bulk syndication.");
    } finally {
      setSyncingAll(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    fetchSocialLogs();
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

  const handleScrapeLive = async () => {
    setScraping(true);
    try {
      const res = await fetch("/api/news/scrape");
      const data = await res.json();
      if (data.success) {
        if (data.insertedCount === 0) {
          showNotice("success", "CISA Scrape complete: backlogs are already up to date.");
        } else {
          showNotice("success", `Scraped live CISA advisories! Ingested ${data.insertedCount} new alerts.`);
        }
        fetchDashboardData();
      } else {
        showNotice("error", data.error || "Scraper failed.");
      }
    } catch (err) {
      showNotice("error", "Error connecting to the scraper subsystem.");
    } finally {
      setScraping(false);
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
    <EditorAuthGate title="Threat Ingestion Hub">
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
            onClick={handleScrapeLive} 
            disabled={scraping}
            className="btn btn-primary"
            style={{ display: "flex", alignItems: "center", gap: "6px" }}
          >
            {scraping ? (
              <span className="sandbox-loading-pulse">Scraping CISA...</span>
            ) : (
              <>
                <Terminal size={14} />
                Scrape Live Alerts
              </>
            )}
          </button>
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
        <div className="panel-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
          <h2 className="panel-title">
            <FileText size={18} />
            Published Advisory Index ({publishedArticles.length})
          </h2>
          <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
            <button
              onClick={handleSyncAllToX}
              disabled={syncingAll}
              className="btn btn-secondary"
              style={{ fontSize: "11px", padding: "5px 12px", display: "inline-flex", alignItems: "center", gap: "6px" }}
              title="Broadcast all unposted articles to X"
            >
              <Send size={12} color="hsl(var(--primary))" />
              {syncingAll ? "Syndicating..." : "Syndicate Unposted to X"}
            </button>
            <button 
              onClick={() => setShowTwitterModal(true)}
              className="btn btn-secondary"
              style={{ fontSize: "11px", padding: "5px 12px", display: "inline-flex", alignItems: "center", gap: "6px" }}
            >
              <Share2 size={12} color="hsl(var(--primary))" />
              Connected Handle: <b>{socialInfo.handle}</b>
              <Settings size={11} />
            </button>
          </div>
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
                  <th style={{ padding: "12px", textAlign: "center" }}>Actions &amp; X Syndication</th>
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
                      <div style={{ display: "flex", gap: "6px", justifyContent: "center", alignItems: "center", flexWrap: "wrap" }}>
                        {art.tweetUrl ? (
                          <a 
                            href={art.tweetUrl} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="btn btn-secondary" 
                            style={{ padding: "5px 8px", fontSize: "11px", display: "inline-flex", alignItems: "center", gap: "4px", color: "hsl(var(--primary))", borderColor: "hsla(var(--primary), 0.4)" }}
                            title="View published tweet on X"
                          >
                            <CheckCircle2 size={12} color="hsl(var(--primary))" />
                            Live on X
                            <ExternalLink size={9} />
                          </a>
                        ) : art.xStatus === "simulated" ? (
                          <span 
                            style={{ fontSize: "10px", padding: "3px 6px", background: "rgba(255,255,255,0.05)", border: "1px dashed hsl(var(--border))", borderRadius: "3px", color: "hsl(var(--muted-foreground))" }}
                            title="Simulated broadcast in sandbox"
                          >
                            Simulated
                          </span>
                        ) : null}

                        <button
                          onClick={() => handleBroadcastToX(art.id)}
                          disabled={broadcastingId === art.id}
                          className="btn btn-secondary"
                          style={{ padding: "5px 8px", fontSize: "11px", display: "inline-flex", alignItems: "center", gap: "4px" }}
                          title="Broadcast this advisory to X with smart hashtags"
                        >
                          <Share2 size={12} color="hsl(var(--primary))" />
                          {broadcastingId === art.id ? "Posting..." : "Post to X"}
                        </button>
                        <a href={`/news/${art.slug || art.id}`} target="_blank" rel="noopener noreferrer" className="btn btn-secondary" style={{ padding: "5px 8px", fontSize: "11px" }}>
                          View
                        </a>
                        <button 
                          onClick={() => handleDeletePublished(art.id)}
                          className="btn btn-danger" 
                          style={{ padding: "5px 8px", fontSize: "11px" }}
                        >
                          <Trash2 size={12} />
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

      {/* X (Twitter) Social Syndication Monitor */}
      <div className="admin-panel" style={{ marginTop: "30px", maxHeight: "none" }}>
        <div className="panel-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <Share2 size={18} color="hsl(var(--primary))" />
            <h2 className="panel-title" style={{ margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
              X (Twitter) Autonomous Broadcast Feed &middot;{" "}
              <a 
                href={`https://x.com/${socialInfo.handle.replace('@', '')}`}
                target="_blank" 
                rel="noopener noreferrer"
                style={{ color: "hsl(var(--primary))", fontFamily: "var(--font-mono)", textDecoration: "underline" }}
              >
                {socialInfo.handle}
              </a>
            </h2>
            {socialInfo.isVerified ? (
              <span style={{ fontSize: "10px", background: "rgba(0,255,100,0.15)", border: "1px solid rgba(0,255,100,0.4)", color: "hsl(var(--success))", padding: "2px 8px", borderRadius: "3px", fontWeight: 800, letterSpacing: "0.5px" }}>
                ● LIVE &amp; VERIFIED
              </span>
            ) : socialInfo.isLiveConfigured ? (
              <span style={{ fontSize: "10px", background: "rgba(255,190,0,0.15)", border: "1px solid rgba(255,190,0,0.4)", color: "hsl(var(--warning))", padding: "2px 8px", borderRadius: "3px", fontWeight: 800, letterSpacing: "0.5px" }}>
                ● CONFIGURED (UNVERIFIED)
              </span>
            ) : (
              <span style={{ fontSize: "10px", background: "rgba(255,255,255,0.08)", border: "1px solid hsl(var(--border))", color: "hsl(var(--muted-foreground))", padding: "2px 8px", borderRadius: "3px", fontWeight: 700 }}>
                ○ SIMULATION / SANDBOX
              </span>
            )}
          </div>
          
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <button 
              onClick={() => setShowTwitterModal(true)} 
              className="btn btn-primary" 
              style={{ padding: "6px 12px", fontSize: "11px", display: "inline-flex", alignItems: "center", gap: "6px" }}
            >
              <Key size={12} /> Connect Twitter Handle
            </button>
            
            {socialInfo.isLiveConfigured && (
              <button 
                onClick={handleTestTwitterConnection} 
                disabled={testingConnection}
                className="btn btn-secondary" 
                style={{ padding: "6px 12px", fontSize: "11px", display: "inline-flex", alignItems: "center", gap: "6px" }}
                title="Verify credentials directly with Twitter API v2"
              >
                <Activity size={12} color="hsl(var(--primary))" />
                {testingConnection ? "Testing..." : "Test Connection"}
              </button>
            )}

            <button 
              onClick={handleSyncAllToX} 
              disabled={syncingAll}
              className="btn btn-secondary" 
              style={{ padding: "6px 12px", fontSize: "11px", display: "inline-flex", alignItems: "center", gap: "6px" }}
              title="Broadcast all unposted articles to X feed"
            >
              <Send size={12} color="hsl(var(--primary))" />
              {syncingAll ? "Broadcasting..." : "Syndicate Unposted"}
            </button>

            <button onClick={fetchSocialLogs} className="btn btn-secondary" style={{ padding: "6px 10px", fontSize: "11px" }}>
              <RefreshCw size={11} /> Refresh
            </button>
          </div>
        </div>

        <div className="panel-body">
          {!socialInfo.isLiveConfigured && (
            <div style={{
              background: "rgba(0, 255, 100, 0.04)",
              border: "1px dashed hsla(var(--primary), 0.35)",
              borderRadius: "6px",
              padding: "16px 20px",
              marginBottom: "20px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "12px"
            }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 700, fontSize: "13px", color: "hsl(var(--primary))", marginBottom: "4px" }}>
                  <Sparkles size={14} /> Connect Your Official Twitter / X Handle
                </div>
                <p style={{ margin: 0, fontSize: "12px", color: "hsl(var(--muted-foreground))", maxWidth: "680px" }}>
                  Every post published on HackerPost is automatically synthesized with CISO threat tags (<code>#ZeroDay #CyberSecurity #InfoSec</code>) and can be broadcasted live to your Twitter feed. Connect your API credentials below to switch from sandbox simulation to live syndication.
                </p>
              </div>
              <button 
                onClick={() => setShowTwitterModal(true)}
                className="btn btn-primary"
                style={{ fontSize: "12px", padding: "8px 16px", display: "inline-flex", alignItems: "center", gap: "6px" }}
              >
                <Key size={13} /> Link Handle &amp; API Keys
              </button>
            </div>
          )}

          <p style={{ fontSize: "12px", color: "hsl(var(--muted-foreground))", marginBottom: "16px" }}>
            Every published threat briefing and venture deal is automatically synthesized, tagged with high-authority cybersecurity hashtags (<code>#CyberSecurity #ZeroDay #CISO #Ransomware #SecTech</code>), and syndicated to <a href={`https://x.com/${socialInfo.handle.replace('@', '')}`} target="_blank" rel="noopener noreferrer" style={{ color: "hsl(var(--primary))", textDecoration: "underline" }}>{socialInfo.handle}</a>.
          </p>

          {socialLogs.length > 0 ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: "16px" }}>
              {socialLogs.slice(0, 6).map((log) => (
                <div key={log.id} style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "6px", padding: "14px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px", fontSize: "11px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span style={{ color: "hsl(var(--primary))", fontWeight: 700 }}>{log.handle}</span>
                        {log.status === "published" ? (
                          <span style={{ fontSize: "9px", background: "rgba(0,255,100,0.15)", color: "hsl(var(--success))", padding: "1px 5px", borderRadius: "2px", fontWeight: 700 }}>LIVE</span>
                        ) : (
                          <span style={{ fontSize: "9px", background: "rgba(255,255,255,0.08)", color: "hsl(var(--muted-foreground))", padding: "1px 5px", borderRadius: "2px", fontWeight: 700 }}>SIMULATED</span>
                        )}
                      </div>
                      <span style={{ color: "hsl(var(--muted-foreground))" }}>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p style={{ fontSize: "12px", lineHeight: "1.5", whiteSpace: "pre-wrap", fontFamily: "var(--font-sans)", margin: "0 0 10px 0" }}>
                      {log.tweetText}
                    </p>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid hsl(var(--border))", paddingTop: "8px", marginTop: "8px", fontSize: "11px" }}>
                    <span style={{ color: "hsl(var(--muted-foreground))" }}>
                      {log.charCount}/280 chars &middot; {log.hashtags?.length || 0} tags
                    </span>
                    <a href={log.tweetUrl || `https://x.com/${socialInfo.handle.replace('@', '')}`} target="_blank" rel="noopener noreferrer" style={{ color: "hsl(var(--primary))", display: "inline-flex", alignItems: "center", gap: "3px", textDecoration: "none" }}>
                      View on X <ExternalLink size={10} />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state" style={{ padding: "24px" }}>
              <p style={{ fontSize: "13px", color: "hsl(var(--muted-foreground))" }}>
                No recent social broadcasts recorded yet. Auto-publishing or clicking &quot;Post to X&quot; on any advisory will populate the stream.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Twitter / X Connection Settings Modal */}
      {showTwitterModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          backgroundColor: "rgba(0, 0, 0, 0.85)",
          backdropFilter: "blur(4px)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 2000,
          padding: "20px"
        }}>
          <div style={{
            background: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
            width: "100%",
            maxWidth: "600px",
            maxHeight: "90vh",
            overflowY: "auto",
            boxShadow: "0 20px 50px rgba(0,0,0,0.7)",
            padding: "24px 28px"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid hsl(var(--border))", paddingBottom: "14px", marginBottom: "18px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Share2 size={20} color="hsl(var(--primary))" />
                <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 800 }}>Connect Twitter (X) Handle</h3>
              </div>
              <button 
                onClick={() => setShowTwitterModal(false)}
                style={{ background: "transparent", border: "none", color: "hsl(var(--muted-foreground))", cursor: "pointer", padding: "4px" }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: "12px", color: "hsl(var(--muted-foreground))", marginBottom: "20px", lineHeight: "1.5" }}>
              Link your official Twitter account to enable automated syndication. Every news post will be formatted with high-authority security tags and broadcasted via Twitter API v2.
            </p>

            <form onSubmit={handleSaveTwitterConfig}>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "6px" }}>
                  Twitter / X Handle
                </label>
                <input 
                  type="text"
                  placeholder="@YourTwitterHandle"
                  className="sandbox-input"
                  value={twitterForm.handle}
                  onChange={(e) => setTwitterForm({ ...twitterForm, handle: e.target.value })}
                  style={{ height: "38px", fontFamily: "var(--font-mono)" }}
                  required
                />
              </div>

              <div style={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))", borderRadius: "6px", padding: "14px", marginBottom: "18px" }}>
                <div style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "hsl(var(--primary))", marginBottom: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <Key size={12} /> Twitter API v2 OAuth 1.0a Credentials
                </div>

                <div style={{ marginBottom: "12px" }}>
                  <label style={{ display: "block", fontSize: "11px", color: "hsl(var(--muted-foreground))", marginBottom: "4px" }}>
                    API Key (Consumer Key)
                  </label>
                  <input 
                    type="text"
                    placeholder="Enter API Key"
                    className="sandbox-input"
                    value={twitterForm.apiKey}
                    onChange={(e) => setTwitterForm({ ...twitterForm, apiKey: e.target.value })}
                    style={{ height: "36px", fontSize: "12px", fontFamily: "var(--font-mono)" }}
                  />
                </div>

                <div style={{ marginBottom: "12px" }}>
                  <label style={{ display: "block", fontSize: "11px", color: "hsl(var(--muted-foreground))", marginBottom: "4px" }}>
                    API Key Secret (Consumer Secret)
                  </label>
                  <input 
                    type="password"
                    placeholder="Enter API Key Secret"
                    className="sandbox-input"
                    value={twitterForm.apiSecret}
                    onChange={(e) => setTwitterForm({ ...twitterForm, apiSecret: e.target.value })}
                    style={{ height: "36px", fontSize: "12px", fontFamily: "var(--font-mono)" }}
                  />
                </div>

                <div style={{ marginBottom: "12px" }}>
                  <label style={{ display: "block", fontSize: "11px", color: "hsl(var(--muted-foreground))", marginBottom: "4px" }}>
                    Access Token
                  </label>
                  <input 
                    type="text"
                    placeholder="Enter Access Token"
                    className="sandbox-input"
                    value={twitterForm.accessToken}
                    onChange={(e) => setTwitterForm({ ...twitterForm, accessToken: e.target.value })}
                    style={{ height: "36px", fontSize: "12px", fontFamily: "var(--font-mono)" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "11px", color: "hsl(var(--muted-foreground))", marginBottom: "4px" }}>
                    Access Token Secret
                  </label>
                  <input 
                    type="password"
                    placeholder="Enter Access Token Secret"
                    className="sandbox-input"
                    value={twitterForm.accessSecret}
                    onChange={(e) => setTwitterForm({ ...twitterForm, accessSecret: e.target.value })}
                    style={{ height: "36px", fontSize: "12px", fontFamily: "var(--font-mono)" }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
                <input 
                  type="checkbox"
                  id="autoPostCheckbox"
                  checked={twitterForm.autoPost}
                  onChange={(e) => setTwitterForm({ ...twitterForm, autoPost: e.target.checked })}
                  style={{ width: "16px", height: "16px", accentColor: "hsl(var(--primary))", cursor: "pointer" }}
                />
                <label htmlFor="autoPostCheckbox" style={{ fontSize: "13px", cursor: "pointer", fontWeight: 600 }}>
                  Automatically broadcast every newly published article to X
                </label>
              </div>

              {/* Developer guide collapsible tip */}
              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid hsl(var(--border))", borderRadius: "6px", padding: "12px 14px", marginBottom: "20px", fontSize: "11px", color: "hsl(var(--muted-foreground))" }}>
                <b style={{ color: "hsl(var(--foreground))" }}>Quick Setup Guide:</b>
                <ol style={{ margin: "6px 0 0 0", paddingLeft: "16px", lineHeight: "1.6" }}>
                  <li>Open <a href="https://developer.x.com" target="_blank" rel="noopener noreferrer" style={{ color: "hsl(var(--primary))", textDecoration: "underline" }}>developer.x.com</a> and sign in with your handle.</li>
                  <li>In your Project / App settings, set <b>User authentication settings</b> to <b>Read and Write</b> (OAuth 1.0a).</li>
                  <li>Under <b>Keys and tokens</b>, generate Consumer Keys &amp; Authentication Tokens.</li>
                  <li>Paste the keys above and click <b>Save &amp; Test Connection</b>.</li>
                </ol>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                <button
                  type="button"
                  onClick={handleTestTwitterConnection}
                  disabled={testingConnection}
                  className="btn btn-secondary"
                  style={{ fontSize: "12px", display: "inline-flex", alignItems: "center", gap: "6px" }}
                >
                  <Activity size={13} color="hsl(var(--primary))" />
                  {testingConnection ? "Verifying with Twitter..." : "Test Connection"}
                </button>

                <div style={{ display: "flex", gap: "10px" }}>
                  <button 
                    type="button" 
                    onClick={() => setShowTwitterModal(false)}
                    className="btn btn-secondary"
                    style={{ fontSize: "12px" }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={savingTwitter}
                    className="btn btn-primary"
                    style={{ fontSize: "12px", display: "inline-flex", alignItems: "center", gap: "6px" }}
                  >
                    <Check size={13} />
                    {savingTwitter ? "Saving & Verifying..." : "Save & Connect"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  </EditorAuthGate>
  );
}
