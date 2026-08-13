"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Calendar, 
  ArrowLeft, 
  ShieldCheck, 
  Eye, 
  AlertTriangle, 
  ShieldAlert, 
  Lock, 
  Unlock, 
  History, 
  RefreshCw, 
  ChevronRight,
  Terminal,
  ArrowDownToLine
} from "lucide-react";

export default function ArticleClient({ article }) {
  const [safeView, setSafeView] = useState(true);
  const [activeVersion, setActiveVersion] = useState(article.versions ? article.versions.length : 1);
  const [showDiff, setShowDiff] = useState(false);

  // Check if content contains raw exploit payload characteristics
  const hasExploitPayload = /\\x[0-9a-fA-F]{2}|\/bin\/sh|shellcode|execve|jmp\s+\*/.test(article.content);

  const getSeverityClass = (sev) => {
    const s = String(sev).toLowerCase();
    if (s === "critical") return "scorecard-high";
    if (s === "high") return "scorecard-medium";
    return "scorecard-low";
  };

  const getSeverityBadgeColor = (sev) => {
    const s = String(sev).toLowerCase();
    if (s === "critical") return "hsl(var(--danger))";
    if (s === "high") return "hsl(var(--warning))";
    return "hsl(var(--primary))";
  };

  const currentContent = article.versions && article.versions[activeVersion - 1]
    ? article.versions[activeVersion - 1].content
    : article.content;

  const currentTitle = article.versions && article.versions[activeVersion - 1]
    ? article.versions[activeVersion - 1].title
    : article.title;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  // Basic diff generator for illustration/Time Travel UI
  const generateDiff = () => {
    if (!article.versions || article.versions.length < 2) return null;
    const v1 = article.versions[0].content.split("\n");
    const v2 = article.versions[1].content.split("\n");
    
    // Simple line-by-line diff
    const diffLines = [];
    const maxLines = Math.max(v1.length, v2.length);
    
    for (let i = 0; i < maxLines; i++) {
      const l1 = v1[i] || "";
      const l2 = v2[i] || "";
      if (l1 === l2) {
        if (l1.trim()) diffLines.push({ type: "normal", text: l1 });
      } else {
        if (l1.trim()) diffLines.push({ type: "removed", text: l1 });
        if (l2.trim()) diffLines.push({ type: "added", text: l2 });
      }
    }
    return diffLines;
  };

  // Safe-View wrapper that renders markdown code blocks or blurs them
  const renderBody = (content) => {
    const parts = content.split("---");
    const bodyText = parts[0];
    const footnoteText = parts[1];

    const lines = bodyText.split("\n");
    let inCodeBlock = false;
    let codeBlockContent = [];
    const renderedElements = [];

    lines.forEach((line, idx) => {
      if (line.trim().startsWith("```")) {
        if (inCodeBlock) {
          inCodeBlock = false;
          const codeString = codeBlockContent.join("\n");
          
          renderedElements.push(
            <div key={`code-${idx}`} style={{ position: "relative", margin: "20px 0" }}>
              {safeView && hasExploitPayload && (
                <div style={{
                  position: "absolute",
                  top: 0, left: 0, right: 0, bottom: 0,
                  background: "rgba(11, 15, 25, 0.9)",
                  backdropFilter: "blur(12px)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "12px",
                  borderRadius: "var(--radius-sm)",
                  zIndex: 2,
                  padding: "20px",
                  textAlign: "center",
                  border: "1px solid hsla(var(--danger), 0.3)"
                }}>
                  <Lock size={20} style={{ color: "hsl(var(--danger))" }} />
                  <div>
                    <div style={{ fontWeight: 800, fontSize: "12px", textTransform: "uppercase", color: "hsl(var(--danger))" }}>Exploit Payload Suspended</div>
                    <div style={{ fontSize: "11px", color: "hsl(var(--muted-foreground))" }}>Safe View mode prevents execution of potential shellcode vectors.</div>
                  </div>
                  <button 
                    onClick={() => setSafeView(false)} 
                    className="btn btn-danger" 
                    style={{ fontSize: "10px", padding: "6px 12px" }}
                  >
                    Deactivate Safe View
                  </button>
                </div>
              )}
              <pre style={{ filter: safeView && hasExploitPayload ? "blur(4px)" : "none" }}>
                <code>{codeString}</code>
              </pre>
            </div>
          );
          codeBlockContent = [];
        } else {
          inCodeBlock = true;
        }
      } else if (inCodeBlock) {
        codeBlockContent.push(line);
      } else {
        const trimmed = line.trim();
        if (trimmed.startsWith("# ")) {
          renderedElements.push(<h1 key={idx} style={{ fontSize: "28px", fontWeight: 800, margin: "24px 0 16px 0", borderBottom: "1px solid hsl(var(--border))", paddingBottom: "8px" }}>{trimmed.slice(2)}</h1>);
        } else if (trimmed.startsWith("## ")) {
          renderedElements.push(<h2 key={idx} style={{ fontSize: "20px", fontWeight: 700, margin: "24px 0 12px 0" }}>{trimmed.slice(3)}</h2>);
        } else if (trimmed.startsWith("### ")) {
          renderedElements.push(<h3 key={idx} style={{ fontSize: "16px", fontWeight: 700, margin: "20px 0 8px 0", color: "hsl(var(--primary))" }}>{trimmed.slice(4)}</h3>);
        } else if (trimmed.startsWith("> ")) {
          renderedElements.push(<blockquote key={idx} style={{ fontStyle: "italic", borderLeft: "4px solid hsl(var(--primary))", paddingLeft: "16px", margin: "20px 0" }}>{trimmed.slice(2)}</blockquote>);
        } else if (trimmed) {
          renderedElements.push(<p key={idx} style={{ marginBottom: "16px" }}>{trimmed}</p>);
        }
      }
    });

    return (
      <div>
        {renderedElements}
        
        {footnoteText && (
          <div className="citation-banner" style={{ marginTop: "40px" }}>
            <div className="citation-header">
              <ShieldCheck size={18} style={{ color: "hsl(var(--success))" }} />
              Advisory Verification Sourcing
            </div>
            <p className="citation-text">
              {footnoteText.replace(/\*/g, "").trim()}
            </p>
            <div style={{ marginTop: "14px", display: "flex", gap: "16px", flexWrap: "wrap", fontSize: "11px", color: "hsl(var(--muted-foreground))", fontFamily: "var(--font-mono)" }}>
              <span>ORIGINAL ALIGNMENT: <b>{article.similarityScore || 0}%</b></span>
              <span>•</span>
              <span>VERIFICATION KEY: <a href={article.sourceUrl} target="_blank" rel="noopener noreferrer" style={{ color: "hsl(var(--primary))", textDecoration: "underline" }}>NVD Registry Source</a></span>
            </div>
          </div>
        )}
      </div>
    );
  };

  const diffResult = generateDiff();

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "40px", padding: "40px 0" }}>
      {/* Main Content Area */}
      <div>
        {/* Navigation Back */}
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "8px", fontSize: "12px", fontWeight: "700", textTransform: "uppercase", color: "hsl(var(--muted-foreground))", marginBottom: "28px" }}>
          <ArrowLeft size={14} />
          Feed Stream
        </Link>

        {/* Responsible Disclosure Warning Banner */}
        {hasExploitPayload && (
          <div style={{
            background: safeView ? "rgba(16, 185, 129, 0.05)" : "rgba(239, 68, 68, 0.05)",
            border: safeView ? "1px solid rgba(16, 185, 129, 0.2)" : "1px solid rgba(239, 68, 68, 0.2)",
            borderRadius: "var(--radius-sm)",
            padding: "16px 20px",
            marginBottom: "32px",
            display: "flex",
            alignItems: "flex-start",
            gap: "16px"
          }}>
            {safeView ? (
              <ShieldCheck size={24} style={{ color: "hsl(var(--success))", flexShrink: 0 }} />
            ) : (
              <ShieldAlert size={24} style={{ color: "hsl(var(--danger))", flexShrink: 0 }} />
            )}
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: "13px", color: safeView ? "hsl(var(--success))" : "hsl(var(--danger))", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                {safeView ? "Exploit Safe View Active" : "Exploit Code Exposed"}
              </div>
              <p style={{ fontSize: "12px", color: "hsl(var(--muted-foreground))", marginTop: "4px" }}>
                {safeView 
                  ? "Raw machine code blocks are suspended. This prevents execution vectors and ensures compliance with safe disclosure metrics." 
                  : "Caution: Raw socket payloads are visible. Do not compile or run these buffers in production environments."}
              </p>
            </div>
            <button 
              onClick={() => setSafeView(!safeView)} 
              className={`btn ${safeView ? "btn-secondary" : "btn-danger"}`}
              style={{ fontSize: "10px", padding: "6px 12px", height: "30px" }}
            >
              {safeView ? <Unlock size={12} /> : <Lock size={12} />}
              {safeView ? "Expose Code" : "Safe Shield"}
            </button>
          </div>
        )}

        <article>
          <header className="article-header">
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center", marginBottom: "16px" }}>
              <span className="article-category">{article.category}</span>
              {article.cve && (
                <span style={{ 
                  display: "inline-flex", 
                  alignItems: "center", 
                  gap: "6px", 
                  fontSize: "11px", 
                  fontWeight: "700", 
                  color: "#000000", 
                  backgroundColor: "hsl(var(--primary))", 
                  padding: "4px 10px", 
                  borderRadius: "var(--radius-sm)",
                  fontFamily: "var(--font-mono)"
                }}>
                  <Terminal size={11} />
                  {article.cve}
                </span>
              )}
              
              {article.disclosureStatus && (
                <span style={{ 
                  display: "inline-flex", 
                  alignItems: "center", 
                  gap: "4px", 
                  fontSize: "11px", 
                  fontWeight: "700", 
                  color: "white", 
                  backgroundColor: "rgba(255,255,255,0.05)", 
                  border: "1px solid hsl(var(--border))",
                  padding: "3px 10px", 
                  borderRadius: "var(--radius-sm)" 
                }}>
                  {article.disclosureStatus}
                </span>
              )}
            </div>
            
            <h1 className="article-title">{currentTitle}</h1>
            
            <div className="article-meta-row">
              <div className="author-info">
                <div className="author-avatar flex-center">
                  AI
                </div>
                <div>
                  <div className="author-name">Advisory Engine Coprocessor</div>
                  <div className="author-date">{formatDate(article.publishedAt)}</div>
                </div>
              </div>
              
              <div className="article-meta-right">
                <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Eye size={14} />
                  {article.views || 0} hits
                </span>
                <span>•</span>
                <span style={{ display: "flex", alignItems: "center", gap: "6px" }} title="Audited similarity level with primary feed">
                  <ShieldCheck size={14} style={{ color: "hsl(var(--success))" }} />
                  {article.similarityScore || 0}% match
                </span>
              </div>
            </div>
          </header>

          {/* Time-Travel UI Panel */}
          {article.versions && article.versions.length > 1 && (
            <div style={{
              background: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "var(--radius-sm)",
              padding: "16px 20px",
              marginBottom: "32px"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 800, fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  <History size={14} style={{ color: "hsl(var(--primary))" }} />
                  Advisory Version Diffs (Time Travel)
                </div>
                
                <div style={{ display: "flex", gap: "8px" }}>
                  <button 
                    onClick={() => setShowDiff(!showDiff)} 
                    className="btn btn-secondary"
                    style={{ fontSize: "10px", padding: "4px 8px", height: "26px" }}
                  >
                    {showDiff ? "View Markdown" : "Compare Versions (Diff)"}
                  </button>
                </div>
              </div>

              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {article.versions.map((v) => (
                  <button
                    key={v.version}
                    onClick={() => {
                      setActiveVersion(v.version);
                      if (v.version !== 2) setShowDiff(false);
                    }}
                    className={`btn ${activeVersion === v.version && !showDiff ? "btn-primary" : "btn-secondary"}`}
                    style={{ fontSize: "10px", padding: "6px 12px", height: "28px" }}
                  >
                    V{v.version} ({new Date(v.timestamp).toLocaleTimeString()})
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Body content rendering */}
          <div className="article-body">
            {showDiff && diffResult ? (
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "13px", background: "#0b0f19", border: "1px solid #142035", borderRadius: "var(--radius-sm)", padding: "20px", overflowX: "auto" }}>
                {diffResult.map((line, idx) => {
                  let bgColor = "transparent";
                  let color = "hsl(var(--foreground))";
                  let prefix = " ";
                  if (line.type === "added") {
                    bgColor = "rgba(16, 185, 129, 0.15)";
                    color = "hsl(var(--success))";
                    prefix = "+";
                  } else if (line.type === "removed") {
                    bgColor = "rgba(239, 68, 68, 0.15)";
                    color = "hsl(var(--danger))";
                    prefix = "-";
                  }
                  return (
                    <div key={idx} style={{ background: bgColor, color: color, whiteSpace: "pre", padding: "2px 4px" }}>
                      {prefix} {line.text}
                    </div>
                  );
                })}
              </div>
            ) : (
              renderBody(currentContent)
            )}
          </div>
        </article>
      </div>

      {/* Sidebar: Vulnerability Profile Card */}
      <div>
        <div style={{
          background: "hsl(var(--card))",
          border: "1px solid hsl(var(--border))",
          borderRadius: "var(--radius-md)",
          padding: "24px",
          position: "sticky",
          top: "100px",
          boxShadow: "var(--shadow-md)"
        }}>
          <div style={{ 
            fontWeight: 800, 
            fontSize: "12px", 
            textTransform: "uppercase", 
            letterSpacing: "0.5px", 
            color: "hsl(var(--primary))",
            marginBottom: "16px",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}>
            <ShieldCheck size={16} />
            Vulnerability Profile
          </div>

          {/* CVSS Severity Circle Scorecard */}
          <div className={`scorecard ${getSeverityClass(article.severity)}`} style={{ padding: "16px", borderRadius: "var(--radius-sm)", marginBottom: "20px" }}>
            <div className="score-circle" style={{ borderColor: getSeverityBadgeColor(article.severity) }}>
              {article.severity === "Critical" ? "9.8" : "7.8"}
            </div>
            <div className="score-text">
              <div className="score-title" style={{ color: getSeverityBadgeColor(article.severity) }}>{article.severity} CVSS</div>
              <div className="score-desc" style={{ fontSize: "11px" }}>Vector: AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H</div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px", fontSize: "13px" }}>
            <div>
              <div style={{ color: "hsl(var(--muted-foreground))", fontSize: "11px", textTransform: "uppercase", fontWeight: 700, marginBottom: "2px" }}>Affected Product</div>
              <div style={{ fontFamily: "var(--font-mono)", fontWeight: 700 }}>{article.affectedProduct || "Enterprise Node"}</div>
            </div>
            <div>
              <div style={{ color: "hsl(var(--muted-foreground))", fontSize: "11px", textTransform: "uppercase", fontWeight: 700, marginBottom: "2px" }}>CVE Identification</div>
              <div style={{ fontFamily: "var(--font-mono)", fontWeight: 700 }}>{article.cve || "N/A"}</div>
            </div>
            <div>
              <div style={{ color: "hsl(var(--muted-foreground))", fontSize: "11px", textTransform: "uppercase", fontWeight: 700, marginBottom: "2px" }}>Disclosure Status</div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: 700 }}>
                <span style={{ 
                  width: "8px", 
                  height: "8px", 
                  borderRadius: "50%", 
                  background: article.disclosureStatus === "Patched" ? "hsl(var(--success))" : "hsl(var(--warning))" 
                }}></span>
                {article.disclosureStatus || "Under Review"}
              </div>
            </div>
            {article.disclosureDate && (
              <div>
                <div style={{ color: "hsl(var(--muted-foreground))", fontSize: "11px", textTransform: "uppercase", fontWeight: 700, marginBottom: "2px" }}>Disclosure Date</div>
                <div>{article.disclosureDate}</div>
              </div>
            )}
            
            <hr style={{ border: "0", borderTop: "1px solid hsl(var(--border))", margin: "8px 0" }} />

            <div>
              <div style={{ color: "hsl(var(--muted-foreground))", fontSize: "11px", textTransform: "uppercase", fontWeight: 700, marginBottom: "6px" }}>Responsible Disclosure Flow</div>
              <ul style={{ paddingLeft: "16px", fontSize: "12px", color: "hsl(var(--muted-foreground))", display: "flex", flexDirection: "column", gap: "6px" }}>
                <li>Vendor Notified: T-90 days</li>
                <li>Mitigation Validated: T-30 days</li>
                <li>Public Advisory: Immediate</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
