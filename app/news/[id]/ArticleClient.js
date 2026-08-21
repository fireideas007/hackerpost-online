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
  ArrowDownToLine,
  Rocket,
  Briefcase,
  TrendingUp,
  DollarSign
} from "lucide-react";

export default function ArticleClient({ article }) {
  const [safeView, setSafeView] = useState(true);
  const [activeVersion, setActiveVersion] = useState(article.versions ? article.versions.length : 1);
  const [showDiff, setShowDiff] = useState(false);

  const isStartup = article.category === "SecTech & Startups" || article.category === "M&A & Funding" || article.fundingAmount;

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

  // Markdown renderer supporting callout alert boxes and safe-view code blocks
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
          renderedElements.push(<h1 key={idx} style={{ fontSize: "26px", fontWeight: 800, margin: "24px 0 16px 0", borderBottom: "1px solid hsl(var(--border))", paddingBottom: "8px" }}>{trimmed.slice(2)}</h1>);
        } else if (trimmed.startsWith("## ")) {
          renderedElements.push(<h2 key={idx} style={{ fontSize: "20px", fontWeight: 700, margin: "24px 0 12px 0" }}>{trimmed.slice(3)}</h2>);
        } else if (trimmed.startsWith("### ")) {
          renderedElements.push(<h3 key={idx} style={{ fontSize: "17px", fontWeight: 700, margin: "20px 0 10px 0", color: "hsl(var(--primary))" }}>{trimmed.slice(4)}</h3>);
        } else if (trimmed.startsWith("> [!IMPORTANT]") || trimmed.startsWith("> [!TIP]") || trimmed.startsWith("> [!NOTE]")) {
          // GitHub style alert box
          renderedElements.push(
            <div key={idx} style={{
              background: "hsla(var(--primary), 0.08)",
              borderLeft: "4px solid hsl(var(--primary))",
              padding: "16px 20px",
              borderRadius: "var(--radius-sm)",
              margin: "20px 0",
              fontSize: "13px",
              lineHeight: 1.6
            }}>
              {trimmed.replace(/^>\s*\[!(IMPORTANT|TIP|NOTE)\]/, "").trim()}
            </div>
          );
        } else if (trimmed.startsWith("> ")) {
          renderedElements.push(
            <blockquote key={idx} style={{
              borderLeft: "3px solid hsl(var(--border))",
              paddingLeft: "16px",
              margin: "12px 0",
              color: "hsl(var(--foreground))",
              fontStyle: "italic"
            }}>
              {trimmed.slice(2)}
            </blockquote>
          );
        } else if (trimmed.startsWith("* ") || trimmed.startsWith("- ")) {
          renderedElements.push(
            <li key={idx} style={{ marginLeft: "20px", marginBottom: "6px", lineHeight: 1.6 }}>
              {trimmed.slice(2)}
            </li>
          );
        } else if (/^\d+\.\s/.test(trimmed)) {
          renderedElements.push(
            <div key={idx} style={{ marginLeft: "12px", marginBottom: "8px", lineHeight: 1.6 }}>
              <b>{trimmed.match(/^\d+\./)[0]}</b> {trimmed.replace(/^\d+\.\s*/, "")}
            </div>
          );
        } else if (trimmed) {
          renderedElements.push(<p key={idx} style={{ marginBottom: "16px", lineHeight: 1.7, fontSize: "15px" }}>{trimmed}</p>);
        }
      }
    });

    return (
      <>
        {renderedElements}
        {footnoteText && (
          <div style={{ marginTop: "40px", paddingTop: "20px", borderTop: "1px solid hsl(var(--border))", fontSize: "12px", color: "hsl(var(--muted-foreground))" }}>
            <p>{footnoteText.trim()}</p>
          </div>
        )}
      </>
    );
  };

  const diffResult = generateDiff();

  return (
    <div className="container" style={{ paddingBottom: "100px" }}>
      {/* Back to feed header link */}
      <div style={{ padding: "20px 0" }}>
        <Link href="/" className="btn btn-secondary" style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
          <ArrowLeft size={16} /> Back to Live Feed
        </Link>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2.2fr 1fr", gap: "40px" }}>
        {/* Main Article Section */}
        <article className="article-container" style={{ minWidth: 0 }}>
          <header className="article-header">
            <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "12px", flexWrap: "wrap" }}>
              <span className="card-category-badge" style={{
                background: isStartup ? "linear-gradient(135deg, hsla(var(--primary), 0.25), rgba(168, 85, 247, 0.25))" : undefined,
                borderColor: isStartup ? "hsl(var(--primary))" : undefined,
                color: isStartup ? "#ffffff" : undefined
              }}>
                {isStartup && "🚀 "}{article.category}
              </span>
              
              {article.cve && (
                <span style={{ 
                  display: "inline-flex", 
                  alignItems: "center", 
                  gap: "4px", 
                  fontFamily: "var(--font-mono)", 
                  fontSize: "11px", 
                  fontWeight: "700", 
                  color: "hsl(var(--primary))", 
                  backgroundColor: "hsla(var(--primary), 0.1)", 
                  border: "1px solid hsla(var(--primary), 0.3)",
                  padding: "3px 10px", 
                  borderRadius: "var(--radius-sm)" 
                }}>
                  <Terminal size={11} />
                  {article.cve}
                </span>
              )}

              {isStartup && article.fundingAmount && (
                <span style={{ 
                  display: "inline-flex", 
                  alignItems: "center", 
                  gap: "4px", 
                  fontFamily: "var(--font-mono)", 
                  fontSize: "11px", 
                  fontWeight: "700", 
                  color: "hsl(var(--success))", 
                  backgroundColor: "hsla(var(--success), 0.1)", 
                  border: "1px solid hsla(var(--success), 0.3)",
                  padding: "3px 10px", 
                  borderRadius: "var(--radius-sm)" 
                }}>
                  <DollarSign size={11} />
                  {article.fundingAmount}
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
                  <div className="author-name">HackerPost Newsroom Coprocessor</div>
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
                  let prefix = "  ";
                  if (line.type === "added") {
                    bgColor = "rgba(16, 185, 129, 0.15)";
                    color = "hsl(var(--success))";
                    prefix = "+ ";
                  } else if (line.type === "removed") {
                    bgColor = "rgba(239, 68, 68, 0.15)";
                    color = "hsl(var(--danger))";
                    prefix = "- ";
                  }
                  return (
                    <div key={idx} style={{ background: bgColor, color: color, padding: "2px 4px", whiteSpace: "pre-wrap" }}>
                      {prefix}{line.text}
                    </div>
                  );
                })}
              </div>
            ) : (
              renderBody(currentContent)
            )}
          </div>
        </article>

        {/* Right Sidebar: Dynamic Profile Card */}
        <aside style={{
          background: "hsl(var(--card))",
          border: "1px solid hsl(var(--border))",
          borderRadius: "var(--radius-md)",
          padding: "24px",
          position: "sticky",
          top: "100px",
          boxShadow: "var(--shadow-md)"
        }}>
          {isStartup ? (
            /* Startup & Venture Profile Sidebar */
            <div>
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
                <Rocket size={16} />
                SecTech & Venture Profile
              </div>

              {/* Deal Scorecard */}
              <div className="scorecard scorecard-low" style={{ padding: "16px", borderRadius: "var(--radius-sm)", marginBottom: "20px", background: "hsla(var(--primary), 0.08)", borderColor: "hsla(var(--primary), 0.3)" }}>
                <div className="score-circle" style={{ borderColor: "hsl(var(--primary))", color: "hsl(var(--primary))", fontSize: "14px" }}>
                  🚀
                </div>
                <div className="score-text">
                  <div className="score-title" style={{ color: "hsl(var(--primary))" }}>
                    {article.fundingAmount || "Venture Deal"}
                  </div>
                  <div className="score-desc" style={{ fontSize: "11px" }}>
                    Round: {article.fundingRound || "Strategic Financing"}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "16px", fontSize: "13px" }}>
                <div>
                  <div style={{ color: "hsl(var(--muted-foreground))", fontSize: "11px", textTransform: "uppercase", fontWeight: 700, marginBottom: "2px" }}>Company / Innovator</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "14px" }}>{article.affectedProduct || "SecTech Startup"}</div>
                </div>
                <div>
                  <div style={{ color: "hsl(var(--muted-foreground))", fontSize: "11px", textTransform: "uppercase", fontWeight: 700, marginBottom: "2px" }}>Sector Domain</div>
                  <div style={{ fontWeight: 600 }}>{article.category}</div>
                </div>
                <div>
                  <div style={{ color: "hsl(var(--muted-foreground))", fontSize: "11px", textTransform: "uppercase", fontWeight: 700, marginBottom: "2px" }}>Deal Status</div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: 700, color: "hsl(var(--success))" }}>
                    <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "hsl(var(--success))" }}></span>
                    {article.disclosureStatus || "Confirmed Transaction"}
                  </div>
                </div>
                <div>
                  <div style={{ color: "hsl(var(--muted-foreground))", fontSize: "11px", textTransform: "uppercase", fontWeight: 700, marginBottom: "2px" }}>Primary Wire</div>
                  <div style={{ fontSize: "12px", color: "hsl(var(--primary))", fontWeight: 700 }}>{article.providerName || "Verified Wire"}</div>
                </div>

                <hr style={{ border: "0", borderTop: "1px solid hsl(var(--border))", margin: "8px 0" }} />

                <div>
                  <div style={{ color: "hsl(var(--muted-foreground))", fontSize: "11px", textTransform: "uppercase", fontWeight: 700, marginBottom: "6px" }}>CISO Market Adoption Indicators</div>
                  <ul style={{ paddingLeft: "16px", fontSize: "12px", color: "hsl(var(--muted-foreground))", display: "flex", flexDirection: "column", gap: "6px" }}>
                    <li>High SOC Consolidation ROI</li>
                    <li>Fast 1-Click Multi-Cloud Deploy</li>
                    <li>Zero-Trust & Compliance Ready</li>
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            /* Standard Vulnerability Profile Sidebar */
            <div>
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
          )}
        </aside>
      </div>
    </div>
  );
}
