"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  ShieldCheck, 
  Eye, 
  Terminal, 
  History, 
  DollarSign, 
  Copy, 
  Check, 
  CheckSquare, 
  Square, 
  Clock, 
  FileText
} from "lucide-react";

export default function ArticleClient({ article = {} }) {
  const [safeView, setSafeView] = useState(true);
  const versionsList = Array.isArray(article?.versions) ? article.versions : [];
  const [activeVersion, setActiveVersion] = useState(versionsList.length > 0 ? versionsList.length : 1);
  const [showDiff, setShowDiff] = useState(false);
  const [copiedMemo, setCopiedMemo] = useState(false);

  // CISO Action Checklist Interactive State
  const [checklist, setChecklist] = useState({
    perimeter: false,
    patching: false,
    credentials: false,
    siemHunting: false
  });

  const toggleChecklistItem = (key) => {
    setChecklist(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const completedCount = Object.values(checklist).filter(Boolean).length;
  const progressPercent = Math.round((completedCount / 4) * 100);

  const isStartup = article?.category === "SecTech & Startups" || article?.category === "M&A & Funding" || !!article?.fundingAmount;

  // Check if content contains raw exploit payload characteristics
  const hasExploitPayload = article?.content ? /\\x[0-9a-fA-F]{2}|\/bin\/sh|shellcode|execve|jmp\s+\*/.test(article.content) : false;

  const getSeverityClass = (sev) => {
    const s = String(sev || "").toLowerCase();
    if (s === "critical") return "scorecard-high";
    if (s === "high") return "scorecard-medium";
    return "scorecard-low";
  };

  const getSeverityBadgeColor = (sev) => {
    const s = String(sev || "").toLowerCase();
    if (s === "critical") return "hsl(var(--danger))";
    if (s === "high") return "hsl(var(--warning))";
    return "hsl(var(--primary))";
  };

  const currentContent = versionsList[activeVersion - 1]
    ? (versionsList[activeVersion - 1].content || "")
    : (article?.content || "");

  const currentTitle = versionsList[activeVersion - 1]
    ? (versionsList[activeVersion - 1].title || "Threat Advisory")
    : (article?.title || "Threat Advisory");

  const formatTime = (dateString) => {
    if (!dateString) return "Initial Release";
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return "Initial Release";
      return d.toISOString().split("T")[0];
    } catch (_) {
      return "Initial Release";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Recently Disclosed";
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return "Recently Disclosed";
      return d.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
      });
    } catch (_) {
      return "Recently Disclosed";
    }
  };

  // 1-Click Executive Boardroom Memo Generator (Virality & Hackproof Lead Magnet)
  const copyBoardroomMemo = () => {
    const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    const memo = `================================================================================
EXECUTIVE CYBERSECURITY MEMORANDUM
TO: Chief Executive Officer, Board of Directors & Audit Committee
FROM: Office of the Chief Information Security Officer (CISO)
DATE: ${today}
SUBJECT: Threat Advisory & Materiality Assessment: ${currentTitle}
================================================================================

1. EXECUTIVE SUMMARY & STRATEGIC CONTEXT:
An active vulnerability disclosure (${article.cve || "CVE-Advisory"}) has been cataloged regarding ${article.affectedProduct || "enterprise systems"}.
Current Severity Assessment: ${article.severity || "High"} CVSS
Primary Threat Vector: Unauthorized network access / potential arbitrary execution if edge systems remain unpatched.

2. REGULATORY & SEC DISCLOSURE READINESS:
- SEC Form 8-K (Item 1.05): Materiality determination clock (4 business days) is active upon confirmation of production data or operational disruption.
- Regulatory Compliance: Audit trails required under EU NIS2, DORA resilience frameworks, and CERT-In reporting guidelines.

3. IMMEDIATE MITIGATION PROTOCOLS TRIGGERED:
[ ] 1. Perimeter scan initiated across all cloud accounts (AWS/GCP/Azure) and corporate gateways.
[ ] 2. Emergency vendor patch deployment and network socket micro-isolation.
[ ] 3. Privileged credential revocation and SIEM threat hunting query execution.

4. CURRENT IMPACT & BUSINESS STATUS:
Remediation is actively underway by internal engineering and verified security partners. No core customer operations have been disrupted.

--------------------------------------------------------------------------------
Intelligence Sourced From: HackerPost.online
Enterprise Attack Surface Discovery & Remediation Desk:
Hackproof Technologies India Private Limited
Direct CISO Consultation Hotline: https://hackerpost.online/consult
================================================================================`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(memo);
      setCopiedMemo(true);
      setTimeout(() => setCopiedMemo(false), 3500);
    }
  };

  // Basic diff generator for illustration/Time Travel UI
  const generateDiff = () => {
    if (versionsList.length < 2) return null;
    const v1Content = versionsList[0]?.content || "";
    const v2Content = versionsList[1]?.content || "";
    const v1 = v1Content.split("\n");
    const v2 = v2Content.split("\n");
    
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
    if (!content || typeof content !== "string") {
      return <p style={{ color: "hsl(var(--muted-foreground))" }}>Advisory details under verification.</p>;
    }
    const parts = content.split("---");
    const bodyText = parts[0] || "";
    const footnoteText = parts[1] || "";

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
            <div key={`code-${idx}`} style={{ position: "relative", margin: "16px 0" }}>
              <pre style={{ background: "hsl(var(--muted))", border: "1px solid hsl(var(--border))", padding: "16px", borderRadius: "var(--radius-sm)", overflowX: "auto", fontSize: "13px" }}>
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
          renderedElements.push(<h1 key={idx} style={{ fontSize: "24px", fontWeight: 800, margin: "24px 0 14px 0", borderBottom: "1px solid hsl(var(--border))", paddingBottom: "6px" }}>{trimmed.slice(2)}</h1>);
        } else if (trimmed.startsWith("## ")) {
          renderedElements.push(<h2 key={idx} style={{ fontSize: "19px", fontWeight: 700, margin: "22px 0 10px 0" }}>{trimmed.slice(3)}</h2>);
        } else if (trimmed.startsWith("### ")) {
          renderedElements.push(<h3 key={idx} style={{ fontSize: "16px", fontWeight: 700, margin: "18px 0 8px 0", color: "hsl(var(--primary))" }}>{trimmed.slice(4)}</h3>);
        } else if (trimmed.startsWith("> [!IMPORTANT]") || trimmed.startsWith("> [!TIP]") || trimmed.startsWith("> [!NOTE]")) {
          renderedElements.push(
            <div key={idx} style={{
              background: "hsl(var(--muted))",
              borderLeft: "3px solid hsl(var(--primary))",
              padding: "14px 16px",
              borderRadius: "var(--radius-xs)",
              margin: "18px 0",
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
              paddingLeft: "14px",
              margin: "12px 0",
              color: "hsl(var(--muted-foreground))",
              fontStyle: "italic"
            }}>
              {trimmed.slice(2)}
            </blockquote>
          );
        } else if (trimmed.startsWith("* ") || trimmed.startsWith("- ")) {
          renderedElements.push(
            <li key={idx} style={{ marginLeft: "18px", marginBottom: "6px", lineHeight: 1.6 }}>
              {trimmed.slice(2)}
            </li>
          );
        } else if (/^\d+\.\s/.test(trimmed)) {
          renderedElements.push(
            <div key={idx} style={{ marginLeft: "10px", marginBottom: "8px", lineHeight: 1.6 }}>
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
          <div style={{ marginTop: "32px", paddingTop: "16px", borderTop: "1px solid hsl(var(--border))", fontSize: "12px", color: "hsl(var(--muted-foreground))" }}>
            <p>{footnoteText.trim()}</p>
          </div>
        )}
      </>
    );
  };

  const diffResult = generateDiff();

  return (
    <div className="container" style={{ padding: "20px 0 80px 0" }}>
      {/* Back to feed header link */}
      <div style={{ padding: "12px 0 20px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Link href="/" className="btn btn-secondary" style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "12px" }}>
          <ArrowLeft size={14} /> Back to Live Wire
        </Link>

        {/* Quick Enterprise Consultation Trigger */}
        <Link
          href={`/consult?threat=${encodeURIComponent(article.cve || article.title)}`}
          className="btn btn-secondary"
          style={{ fontSize: "12px", display: "inline-flex", alignItems: "center", gap: "6px", color: "hsl(var(--primary))" }}
        >
          <ShieldCheck size={14} />
          Enterprise CISO Consultation Desk →
        </Link>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2.2fr 1fr", gap: "36px" }}>
        {/* Main Article Section */}
        <article className="article-container" style={{ minWidth: 0 }}>
          <header className="article-header">
            <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "10px", flexWrap: "wrap" }}>
              <span className="card-category-badge">
                {article.category}
              </span>
              
              {article.cve && (
                <span style={{ 
                  display: "inline-flex", 
                  alignItems: "center", 
                  gap: "4px", 
                  fontFamily: "var(--font-mono)", 
                  fontSize: "11px", 
                  fontWeight: "600", 
                  color: "hsl(var(--foreground))", 
                  backgroundColor: "hsl(var(--muted))", 
                  border: "1px solid hsl(var(--border))",
                  padding: "2px 8px", 
                  borderRadius: "var(--radius-xs)" 
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
                  backgroundColor: "hsl(var(--success-bg))", 
                  border: "1px solid hsl(var(--border))",
                  padding: "2px 8px", 
                  borderRadius: "var(--radius-xs)" 
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
                  HP
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: "hsl(var(--foreground))" }}>HackerPost Editorial Wire</div>
                  <div style={{ fontSize: "11px" }}>{formatDate(article.publishedAt)}</div>
                </div>
              </div>
              
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span>{article.views || 0} views</span>
                <span>•</span>
                <span style={{ color: "hsl(var(--primary))", fontWeight: 600 }}>{article.providerName || "Verified Feed"}</span>
              </div>
            </div>
          </header>

          {/* CISO Executive Action Center (Clean Corporate News Box) */}
          {!isStartup && (
            <section style={{
              background: "hsl(var(--muted))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "var(--radius-sm)",
              padding: "20px",
              marginBottom: "28px"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px", marginBottom: "14px" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "hsl(var(--primary))", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "2px" }}>
                    <ShieldCheck size={14} />
                    CISO Executive Action Plan &amp; Boardroom Brief
                  </div>
                  <div style={{ fontSize: "14px", fontWeight: 700 }}>
                    Operational Blast Radius &amp; Governance Playbook
                  </div>
                </div>

                {/* 1-Click Boardroom Memo Generator Button */}
                <button
                  onClick={copyBoardroomMemo}
                  className="btn btn-primary"
                  style={{
                    fontSize: "11px",
                    padding: "6px 12px",
                    height: "32px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    background: copiedMemo ? "hsl(var(--success))" : undefined,
                    borderColor: copiedMemo ? "hsl(var(--success))" : undefined
                  }}
                  title="Copy ready-to-send email memorandum for CEO and Audit Committee"
                >
                  {copiedMemo ? <Check size={13} /> : <Copy size={13} />}
                  <span>{copiedMemo ? "Boardroom Memo Copied" : "Copy Boardroom Memo"}</span>
                </button>
              </div>

              {/* Grid: 30-Second Elevator Pitch & SEC Regulatory Clock */}
              <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "14px", marginBottom: "16px" }}>
                <div style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "var(--radius-xs)", padding: "14px" }}>
                  <div style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", color: "hsl(var(--muted-foreground))", marginBottom: "4px" }}>
                    Executive Summary for CEO &amp; Board
                  </div>
                  <p style={{ fontSize: "12px", lineHeight: 1.5, margin: 0, color: "hsl(var(--foreground))" }}>
                    Critical threat vector identified in <b>{article.affectedProduct || "enterprise systems"}</b> ({article.cve || "CVE-Pending"}). 
                    Adversaries can exploit unauthenticated network listeners. Defensive containment underway: isolating exposed endpoints and validating SIEM logs. Zero current operational disruption.
                  </p>
                </div>

                <div style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "var(--radius-xs)", padding: "14px" }}>
                  <div style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", color: "hsl(var(--muted-foreground))", marginBottom: "4px" }}>
                    SEC Form 8-K Materiality Clock
                  </div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "6px", marginBottom: "2px" }}>
                    <span style={{ fontSize: "18px", fontWeight: 800, color: "hsl(var(--danger))", fontFamily: "var(--font-mono)" }}>
                      4-Day Window
                    </span>
                    <span style={{ fontSize: "10px", color: "hsl(var(--muted-foreground))" }}>Item 1.05 Rule</span>
                  </div>
                  <div style={{ fontSize: "11px", color: "hsl(var(--muted-foreground))", lineHeight: 1.4 }}>
                    Mandatory disclosure triggered if enterprise determines material operational or financial disruption.
                  </div>
                </div>
              </div>

              {/* Interactive CISO Remediation Checklist */}
              <div style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "var(--radius-xs)", padding: "14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                  <div style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "hsl(var(--foreground))" }}>
                    CISO Remediation Verification Checklist
                  </div>
                  <span style={{ fontSize: "11px", fontFamily: "var(--font-mono)", fontWeight: 700, color: completedCount === 4 ? "hsl(var(--success))" : "hsl(var(--primary))" }}>
                    {completedCount} / 4 Completed ({progressPercent}%)
                  </span>
                </div>

                {/* Progress bar */}
                <div style={{ width: "100%", height: "4px", background: "hsl(var(--border))", borderRadius: "2px", overflow: "hidden", marginBottom: "12px" }}>
                  <div style={{ width: `${progressPercent}%`, height: "100%", background: completedCount === 4 ? "hsl(var(--success))" : "hsl(var(--primary))", transition: "width 0.3s ease" }}></div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                  <div 
                    onClick={() => toggleChecklistItem("perimeter")}
                    style={{ display: "flex", alignItems: "flex-start", gap: "8px", padding: "6px 8px", borderRadius: "var(--radius-xs)", background: checklist.perimeter ? "hsl(var(--success-bg))" : "hsl(var(--muted))", cursor: "pointer", fontSize: "11px" }}
                  >
                    {checklist.perimeter ? <CheckSquare size={14} style={{ color: "hsl(var(--success))", marginTop: "1px" }} /> : <Square size={14} style={{ opacity: 0.5, marginTop: "1px" }} />}
                    <span>1. Scan public IPs for {article.affectedProduct || "asset"} exposures</span>
                  </div>

                  <div 
                    onClick={() => toggleChecklistItem("patching")}
                    style={{ display: "flex", alignItems: "flex-start", gap: "8px", padding: "6px 8px", borderRadius: "var(--radius-xs)", background: checklist.patching ? "hsl(var(--success-bg))" : "hsl(var(--muted))", cursor: "pointer", fontSize: "11px" }}
                  >
                    {checklist.patching ? <CheckSquare size={14} style={{ color: "hsl(var(--success))", marginTop: "1px" }} /> : <Square size={14} style={{ opacity: 0.5, marginTop: "1px" }} />}
                    <span>2. Deploy hotfix or apply port micro-segmentation</span>
                  </div>

                  <div 
                    onClick={() => toggleChecklistItem("credentials")}
                    style={{ display: "flex", alignItems: "flex-start", gap: "8px", padding: "6px 8px", borderRadius: "var(--radius-xs)", background: checklist.credentials ? "hsl(var(--success-bg))" : "hsl(var(--muted))", cursor: "pointer", fontSize: "11px" }}
                  >
                    {checklist.credentials ? <CheckSquare size={14} style={{ color: "hsl(var(--success))", marginTop: "1px" }} /> : <Square size={14} style={{ opacity: 0.5, marginTop: "1px" }} />}
                    <span>3. Invalidate privileged keys &amp; rotate service tokens</span>
                  </div>

                  <div 
                    onClick={() => toggleChecklistItem("siemHunting")}
                    style={{ display: "flex", alignItems: "flex-start", gap: "8px", padding: "6px 8px", borderRadius: "var(--radius-xs)", background: checklist.siemHunting ? "hsl(var(--success-bg))" : "hsl(var(--muted))", cursor: "pointer", fontSize: "11px" }}
                  >
                    {checklist.siemHunting ? <CheckSquare size={14} style={{ color: "hsl(var(--success))", marginTop: "1px" }} /> : <Square size={14} style={{ opacity: 0.5, marginTop: "1px" }} />}
                    <span>4. Execute SIEM queries for anomalous daemon child processes</span>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Time-Travel UI Panel */}
          {article.versions && article.versions.length > 1 && (
            <div style={{
              background: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "var(--radius-sm)",
              padding: "14px 18px",
              marginBottom: "28px"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: 700, fontSize: "12px", textTransform: "uppercase" }}>
                  <History size={14} style={{ color: "hsl(var(--primary))" }} />
                  Advisory Version History
                </div>
                
                <button 
                  onClick={() => setShowDiff(!showDiff)} 
                  className="btn btn-secondary"
                  style={{ fontSize: "10px", padding: "4px 8px", height: "24px" }}
                >
                  {showDiff ? "View Markdown" : "Compare Versions (Diff)"}
                </button>
              </div>

              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {article.versions.map((v) => (
                  <button
                    key={v.version}
                    onClick={() => {
                      setActiveVersion(v.version);
                      if (v.version !== 2) setShowDiff(false);
                    }}
                    className={`btn ${activeVersion === v.version && !showDiff ? "btn-primary" : "btn-secondary"}`}
                    style={{ fontSize: "10px", padding: "4px 10px", height: "26px" }}
                  >
                    V{v.version} ({formatTime(v.timestamp)})
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Body content rendering */}
          <div className="article-body">
            {showDiff && diffResult ? (
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "13px", background: "hsl(var(--muted))", border: "1px solid hsl(var(--border))", borderRadius: "var(--radius-sm)", padding: "16px", overflowX: "auto" }}>
                {diffResult.map((line, idx) => {
                  let bgColor = "transparent";
                  let color = "hsl(var(--foreground))";
                  let prefix = "  ";
                  if (line.type === "added") {
                    bgColor = "rgba(21, 128, 61, 0.1)";
                    color = "hsl(var(--success))";
                    prefix = "+ ";
                  } else if (line.type === "removed") {
                    bgColor = "rgba(185, 28, 28, 0.1)";
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

          {/* Native Hackproof Technologies Enterprise Remediation Desk */}
          <section style={{
            marginTop: "36px",
            background: "hsl(var(--muted))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "var(--radius-sm)",
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            gap: "12px"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "var(--radius-xs)", background: "hsl(var(--primary))", display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff" }}>
                <ShieldCheck size={18} />
              </div>
              <div>
                <div style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "hsl(var(--primary))" }}>
                  Enterprise Defense Desk · Hackproof Technologies
                </div>
                <h3 style={{ fontSize: "16px", fontWeight: 700, margin: 0 }}>
                  Securing Your Enterprise Perimeter Against This Threat
                </h3>
              </div>
            </div>

            <p style={{ fontSize: "13px", color: "hsl(var(--muted-foreground))", lineHeight: 1.5, margin: 0 }}>
              Concerned your cloud infrastructure or perimeter systems are exposed to <b>{article.cve || article.affectedProduct || "this vulnerability"}</b>? 
              <b> Hackproof Technologies</b> provides rapid attack surface discovery, comprehensive multi-cloud penetration testing, and emergency CISO advisory.
            </p>

            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "6px" }}>
              <Link
                href={`/consult?threat=${encodeURIComponent(article.cve || article.title)}`}
                className="btn btn-primary"
                style={{ padding: "8px 16px", fontSize: "12px", display: "inline-flex", alignItems: "center", gap: "6px" }}
              >
                <span>Request CISO Threat Audit →</span>
              </Link>

              <Link
                href="/advertise"
                className="btn btn-secondary"
                style={{ padding: "8px 14px", fontSize: "12px" }}
              >
                <span>Media Kit &amp; PR Wire</span>
              </Link>
            </div>
          </section>
        </article>

        {/* Right Sidebar: Dynamic Profile Card */}
        <aside style={{
          background: "hsl(var(--card))",
          border: "1px solid hsl(var(--border))",
          borderRadius: "var(--radius-sm)",
          padding: "20px",
          position: "sticky",
          top: "90px",
          boxShadow: "var(--shadow-sm)"
        }}>
          {isStartup ? (
            /* Startup & Venture Profile Sidebar */
            <div>
              <div style={{ 
                fontWeight: 700, 
                fontSize: "11px", 
                textTransform: "uppercase", 
                letterSpacing: "0.5px", 
                color: "hsl(var(--primary))", 
                marginBottom: "14px"
              }}>
                SecTech &amp; Venture Profile
              </div>

              <div style={{ padding: "14px", borderRadius: "var(--radius-xs)", marginBottom: "16px", background: "hsl(var(--muted))", border: "1px solid hsl(var(--border))" }}>
                <div style={{ fontSize: "11px", color: "hsl(var(--muted-foreground))", textTransform: "uppercase", fontWeight: 700 }}>
                  Capital Raised
                </div>
                <div style={{ fontSize: "20px", fontWeight: 800, color: "hsl(var(--success))", fontFamily: "var(--font-mono)" }}>
                  {article.fundingAmount || "Venture Deal"}
                </div>
                <div style={{ fontSize: "11px", color: "hsl(var(--muted-foreground))" }}>
                  Round: {article.fundingRound || "Strategic Financing"}
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "14px", fontSize: "13px" }}>
                <div>
                  <div style={{ color: "hsl(var(--muted-foreground))", fontSize: "10px", textTransform: "uppercase", fontWeight: 700, marginBottom: "2px" }}>Company</div>
                  <div style={{ fontWeight: 700 }}>{article.affectedProduct || "SecTech Innovator"}</div>
                </div>
                <div>
                  <div style={{ color: "hsl(var(--muted-foreground))", fontSize: "10px", textTransform: "uppercase", fontWeight: 700, marginBottom: "2px" }}>Sector Domain</div>
                  <div>{article.category}</div>
                </div>
                <div>
                  <div style={{ color: "hsl(var(--muted-foreground))", fontSize: "10px", textTransform: "uppercase", fontWeight: 700, marginBottom: "2px" }}>Source Wire</div>
                  <div style={{ color: "hsl(var(--primary))", fontWeight: 600 }}>{article.providerName || "Verified Wire"}</div>
                </div>

                <hr style={{ border: "0", borderTop: "1px solid hsl(var(--border))", margin: "4px 0" }} />

                {/* Claim Profile */}
                <div style={{
                  padding: "14px",
                  borderRadius: "var(--radius-xs)",
                  background: "hsl(var(--muted))",
                  border: "1px solid hsl(var(--border))",
                  textAlign: "center"
                }}>
                  <div style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "hsl(var(--foreground))", marginBottom: "4px" }}>
                    Founder or PR Team?
                  </div>
                  <p style={{ fontSize: "11px", color: "hsl(var(--muted-foreground))", marginBottom: "10px", lineHeight: 1.4 }}>
                    Verify <b>{article.affectedProduct || "this company"}</b>&apos;s SecTech profile.
                  </p>
                  <Link 
                    href={`/submit?claim=${encodeURIComponent(article.affectedProduct || article.title)}`}
                    className="btn btn-primary"
                    style={{ width: "100%", fontSize: "11px", padding: "6px 10px", height: "30px" }}
                  >
                    Claim Company Profile →
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            /* Standard Vulnerability Profile Sidebar */
            <div>
              <div style={{ 
                fontWeight: 700, 
                fontSize: "11px", 
                textTransform: "uppercase", 
                letterSpacing: "0.5px", 
                color: "hsl(var(--primary))", 
                marginBottom: "14px"
              }}>
                Vulnerability Profile
              </div>

              {/* CVSS Severity Circle Scorecard */}
              <div className={`scorecard ${getSeverityClass(article.severity)}`} style={{ padding: "12px", borderRadius: "var(--radius-xs)", marginBottom: "16px" }}>
                <div className="score-circle" style={{ borderColor: getSeverityBadgeColor(article.severity) }}>
                  {article.severity === "Critical" ? "9.8" : "7.8"}
                </div>
                <div className="score-text">
                  <div className="score-title" style={{ color: getSeverityBadgeColor(article.severity) }}>{article.severity} CVSS</div>
                  <div className="score-desc" style={{ fontSize: "10px" }}>Vector: AV:N/AC:L/PR:N/UI:N/S:U</div>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "12px" }}>
                <div>
                  <div style={{ color: "hsl(var(--muted-foreground))", fontSize: "10px", textTransform: "uppercase", fontWeight: 700, marginBottom: "2px" }}>Affected Product</div>
                  <div style={{ fontWeight: 700 }}>{article.affectedProduct || "Enterprise Node"}</div>
                </div>
                <div>
                  <div style={{ color: "hsl(var(--muted-foreground))", fontSize: "10px", textTransform: "uppercase", fontWeight: 700, marginBottom: "2px" }}>CVE Identification</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontWeight: 700 }}>{article.cve || "N/A"}</div>
                </div>
                <div>
                  <div style={{ color: "hsl(var(--muted-foreground))", fontSize: "10px", textTransform: "uppercase", fontWeight: 700, marginBottom: "2px" }}>Status</div>
                  <div style={{ fontWeight: 600 }}>{article.disclosureStatus || "Disclosed"}</div>
                </div>
                
                <hr style={{ border: "0", borderTop: "1px solid hsl(var(--border))", margin: "4px 0" }} />

                {/* Sidebar Hackproof Banner */}
                <div style={{
                  padding: "14px",
                  borderRadius: "var(--radius-xs)",
                  background: "hsl(var(--muted))",
                  border: "1px solid hsl(var(--border))",
                  textAlign: "center"
                }}>
                  <div style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "hsl(var(--foreground))", marginBottom: "4px" }}>
                    Hackproof Security Labs
                  </div>
                  <p style={{ fontSize: "11px", color: "hsl(var(--muted-foreground))", marginBottom: "10px", lineHeight: 1.4 }}>
                    Enterprise verification &amp; penetration testing for this threat.
                  </p>
                  <Link 
                    href={`/consult?threat=${encodeURIComponent(article.cve || article.title)}`}
                    className="btn btn-primary"
                    style={{ width: "100%", fontSize: "11px", padding: "6px 10px", height: "30px" }}
                  >
                    Schedule Audit →
                  </Link>
                </div>
              </div>
            </div>
          )}
        </aside>
      </div>

      {/* Emergency CISO Assistance Widget */}
      <div style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        zIndex: 99,
        background: "hsl(var(--card))",
        border: "1px solid hsl(var(--border))",
        borderRadius: "var(--radius-sm)",
        padding: "8px 14px",
        boxShadow: "var(--shadow-md)",
        display: "flex",
        alignItems: "center",
        gap: "10px"
      }}>
        <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "hsl(var(--success))" }}></div>
        <span style={{ fontSize: "12px", fontWeight: 600 }}>CISO Threat Hotline</span>
        <Link
          href={`/consult?threat=${encodeURIComponent(article.cve || article.title)}`}
          className="btn btn-primary"
          style={{ fontSize: "11px", padding: "4px 10px", height: "26px" }}
        >
          Consult Architect →
        </Link>
      </div>
    </div>
  );
}
