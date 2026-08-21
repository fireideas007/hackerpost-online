"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Bot, 
  Send, 
  Play, 
  ShieldCheck, 
  ShieldAlert, 
  Activity, 
  Terminal, 
  Cpu, 
  Sliders, 
  RefreshCw, 
  Flame, 
  CheckCircle2, 
  Clock, 
  Sparkles,
  Zap,
  Lock,
  Radio,
  FileCheck2,
  Settings
} from "lucide-react";
import EditorAuthGate from "../components/EditorAuthGate";

export default function AgentCommandCenter() {
  const [agentState, setAgentState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [runningCycle, setRunningCycle] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [sendingChat, setSendingChat] = useState(false);
  const [notification, setNotification] = useState(null);
  const [logFilter, setLogFilter] = useState("all");
  const chatBottomRef = useRef(null);

  const fetchAgentStatus = async () => {
    try {
      const res = await fetch("/api/agent");
      const data = await res.json();
      if (data.success) {
        setAgentState(data.state);
      }
    } catch (err) {
      console.error("Error fetching agent state:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgentStatus();
    // Auto-refresh state every 8 seconds
    const interval = setInterval(fetchAgentStatus, 8000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [agentState?.chatHistory]);

  const showNotice = (type, text) => {
    setNotification({ type, text });
    setTimeout(() => setNotification(null), 5000);
  };

  // Run autonomous cycle on demand
  const handleExecuteCycle = async () => {
    setRunningCycle(true);
    try {
      const res = await fetch("/api/agent/cycle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trigger: "manual-command-center" })
      });
      const data = await res.json();
      if (data.success) {
        showNotice("success", `Autonomous cycle complete! Scraped: ${data.scrapedCount}, Published: ${data.publishedCount}, Queued: ${data.queuedCount}`);
        fetchAgentStatus();
      } else {
        showNotice("error", data.error || "Cycle failed.");
      }
    } catch (err) {
      showNotice("error", "Error executing agent cycle: " + err.message);
    } finally {
      setRunningCycle(false);
    }
  };

  // Send conversational steering command
  const handleSendChat = async (messageToSend = null) => {
    const text = messageToSend || chatInput;
    if (!text || !text.trim() || sendingChat) return;

    setSendingChat(true);
    if (!messageToSend) setChatInput("");

    try {
      const res = await fetch("/api/agent/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text })
      });
      const data = await res.json();
      if (data.success) {
        setAgentState(data.state);
        showNotice("success", "Directive applied to Agent.");
        if (data.cycleOutput) {
          showNotice("success", `Agent launched immediate cycle: ${data.cycleOutput.publishedCount} published!`);
        }
      } else {
        showNotice("error", data.error || "Failed to process directive.");
      }
    } catch (err) {
      showNotice("error", "Error sending directive: " + err.message);
    } finally {
      setSendingChat(false);
    }
  };

  // Update policy state
  const handleUpdatePolicy = async (updates) => {
    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates)
      });
      const data = await res.json();
      if (data.success) {
        setAgentState(data.state);
        showNotice("success", "Policy guardrails updated.");
      }
    } catch (err) {
      showNotice("error", "Failed to update policy.");
    }
  };

  const quickDirectives = [
    "Focus on VMware and Windows zero-days",
    "Set plagiarism threshold to 10%",
    "Enable full autonomous publishing",
    "Disable auto-publish (Switch to Supervised Mode)",
    "Run an immediate CISA crawl & ingest"
  ];

  const filteredLogs = agentState?.logs?.filter(log => {
    if (logFilter === "all") return true;
    return log.type === logFilter;
  }) || [];

  if (loading || !agentState) {
    return (
      <div className="container flex-center" style={{ minHeight: "60vh", flexDirection: "column", gap: "16px" }}>
        <Bot size={48} className="sandbox-loading-pulse" style={{ color: "hsl(var(--primary))" }} />
        <h2 style={{ fontSize: "18px", fontWeight: 700 }}>Connecting to Aegis AI Editor Engine...</h2>
      </div>
    );
  }

  return (
    <EditorAuthGate title="Aegis AI Agent Command Room">
      <div className="container" style={{ paddingBottom: "100px", paddingTop: "40px" }}>
      {/* Toast Notification */}
      {notification && (
        <div 
          style={{
            position: "fixed",
            top: "24px",
            right: "24px",
            zIndex: 1000,
            padding: "14px 22px",
            borderRadius: "var(--radius-sm)",
            boxShadow: "var(--shadow-lg)",
            color: "#000000",
            backgroundColor: notification.type === "success" ? "hsl(var(--success))" : "hsl(var(--danger))",
            fontWeight: 800,
            fontSize: "13px",
            display: "flex",
            alignItems: "center",
            gap: "10px"
          }}
        >
          {notification.type === "success" ? <CheckCircle2 size={18} /> : <ShieldAlert size={18} />}
          {notification.text}
        </div>
      )}

      {/* Header Banner */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px", flexWrap: "wrap", gap: "20px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
            <span style={{ 
              display: "inline-flex", 
              alignItems: "center", 
              gap: "6px", 
              padding: "4px 10px", 
              borderRadius: "var(--radius-sm)", 
              background: "hsla(var(--primary), 0.1)", 
              border: "1px solid hsla(var(--primary), 0.3)",
              color: "hsl(var(--primary))",
              fontSize: "11px",
              fontWeight: 800,
              fontFamily: "var(--font-mono)"
            }}>
              <Bot size={13} />
              AI AGENT CONTROL ROOM
            </span>
            <span style={{ 
              display: "inline-flex", 
              alignItems: "center", 
              gap: "6px", 
              padding: "4px 10px", 
              borderRadius: "var(--radius-sm)", 
              background: agentState.autoPublish ? "hsla(var(--success), 0.1)" : "hsla(var(--warning), 0.1)", 
              border: `1px solid ${agentState.autoPublish ? "hsla(var(--success), 0.3)" : "hsla(var(--warning), 0.3)"}`,
              color: agentState.autoPublish ? "hsl(var(--success))" : "hsl(var(--warning))",
              fontSize: "11px",
              fontWeight: 800,
              fontFamily: "var(--font-mono)"
            }}>
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "currentColor" }} />
              {agentState.mode.toUpperCase()} MODE
            </span>
          </div>
          <h1 style={{ fontSize: "32px", fontWeight: 800, letterSpacing: "-0.75px", textTransform: "uppercase" }}>
            Aegis AI Editor-in-Chief
          </h1>
          <p style={{ color: "hsl(var(--muted-foreground))", fontSize: "14px", maxWidth: "680px" }}>
            Autonomous CISO-grade intelligence engine: harvests global telemetry from CISA, The Hacker News, BleepingComputer, & GitHub, synthesizes executive threat briefings, and auto-publishes breaking bulletins.
          </p>

          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "12px" }}>
            <span style={{ fontSize: "11px", fontWeight: 700, color: "hsl(var(--muted-foreground))", alignSelf: "center", marginRight: "4px" }}>
              ACTIVE THREAT FEEDS:
            </span>
            {["CISA Advisories", "The Hacker News", "BleepingComputer", "GitHub Advisories"].map((source, idx) => (
              <span 
                key={idx}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  padding: "2px 8px",
                  borderRadius: "var(--radius-sm)",
                  background: "hsla(var(--success), 0.08)",
                  border: "1px solid hsla(var(--success), 0.25)",
                  color: "hsl(var(--success))",
                  fontSize: "10px",
                  fontWeight: 700,
                  fontFamily: "var(--font-mono)"
                }}
              >
                <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "currentColor" }} />
                {source}
              </span>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <button 
            onClick={handleExecuteCycle}
            disabled={runningCycle}
            className="btn btn-primary"
            style={{ height: "46px", padding: "0 22px", display: "flex", alignItems: "center", gap: "8px" }}
          >
            {runningCycle ? (
              <span className="sandbox-loading-pulse">Harvesting & Synthesizing...</span>
            ) : (
              <>
                <Zap size={16} />
                Run Multi-Feed Cycle Now
              </>
            )}
          </button>
        </div>
      </div>

      {/* Telemetry HUD Cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: "18px",
        marginBottom: "36px"
      }}>
        <div style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", padding: "18px 20px", borderRadius: "var(--radius-md)" }}>
          <div style={{ fontSize: "11px", fontWeight: 800, color: "hsl(var(--muted-foreground))", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px", display: "flex", alignItems: "center", gap: "6px" }}>
            <Activity size={14} style={{ color: "hsl(var(--success))" }} />
            Engine Status
          </div>
          <div style={{ fontSize: "22px", fontWeight: 800, color: "hsl(var(--success))", fontFamily: "var(--font-mono)" }}>
            ONLINE (Active)
          </div>
          <div style={{ fontSize: "11px", color: "hsl(var(--muted-foreground))", marginTop: "4px" }}>
            Last run: {new Date(agentState.metrics.lastRunTime).toLocaleTimeString()}
          </div>
        </div>

        <div style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", padding: "18px 20px", borderRadius: "var(--radius-md)" }}>
          <div style={{ fontSize: "11px", fontWeight: 800, color: "hsl(var(--muted-foreground))", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px", display: "flex", alignItems: "center", gap: "6px" }}>
            <FileCheck2 size={14} style={{ color: "hsl(var(--primary))" }} />
            Total Bulletins Published
          </div>
          <div style={{ fontSize: "22px", fontWeight: 800, color: "hsl(var(--primary))", fontFamily: "var(--font-mono)" }}>
            {agentState.metrics.totalPublished} Articles
          </div>
          <div style={{ fontSize: "11px", color: "hsl(var(--muted-foreground))", marginTop: "4px" }}>
            Audited {agentState.metrics.totalAudited} incoming feeds
          </div>
        </div>

        <div style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", padding: "18px 20px", borderRadius: "var(--radius-md)" }}>
          <div style={{ fontSize: "11px", fontWeight: 800, color: "hsl(var(--muted-foreground))", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px", display: "flex", alignItems: "center", gap: "6px" }}>
            <ShieldCheck size={14} style={{ color: "hsl(var(--warning))" }} />
            Max Plagiarism Gate
          </div>
          <div style={{ fontSize: "22px", fontWeight: 800, color: "hsl(var(--warning))", fontFamily: "var(--font-mono)" }}>
            &lt; {agentState.maxPlagiarismThreshold}% Max
          </div>
          <div style={{ fontSize: "11px", color: "hsl(var(--muted-foreground))", marginTop: "4px" }}>
            Avg corpus similarity: {agentState.metrics.avgSimilarity}%
          </div>
        </div>

        <div style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", padding: "18px 20px", borderRadius: "var(--radius-md)" }}>
          <div style={{ fontSize: "11px", fontWeight: 800, color: "hsl(var(--muted-foreground))", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px", display: "flex", alignItems: "center", gap: "6px" }}>
            <Flame size={14} style={{ color: "hsl(var(--danger))" }} />
            Priority Focus
          </div>
          <div style={{ fontSize: "13px", fontWeight: 700, color: "hsl(var(--foreground))", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {agentState.focusTags.slice(0, 2).join(", ")} +{agentState.focusTags.length - 2}
          </div>
          <div style={{ fontSize: "11px", color: "hsl(var(--muted-foreground))", marginTop: "4px" }}>
            Min Severity: {agentState.minSeverity}
          </div>
        </div>
      </div>

      {/* Main Command Center Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1.15fr 1fr", gap: "32px" }}>
        
        {/* Left Column: Steering Terminal & Policy Matrix */}
        <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
          
          {/* Conversational Steering Console */}
          <div className="admin-panel" style={{ maxHeight: "none" }}>
            <div className="panel-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 className="panel-title" style={{ fontSize: "14px" }}>
                <Terminal size={16} style={{ color: "hsl(var(--primary))" }} />
                Conversational Steering Console
              </h2>
              <span style={{ fontSize: "10px", fontWeight: 800, color: "hsl(var(--muted-foreground))", fontFamily: "var(--font-mono)" }}>
                INTERACTIVE NLP LINK
              </span>
            </div>

            <div className="panel-body" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
              
              {/* Chat Message Stream */}
              <div style={{ 
                height: "320px", 
                overflowY: "auto", 
                display: "flex", 
                flexDirection: "column", 
                gap: "14px", 
                padding: "12px", 
                background: "hsl(var(--background))", 
                borderRadius: "var(--radius-sm)", 
                border: "1px solid hsl(var(--border))" 
              }}>
                {agentState.chatHistory?.map((msg) => (
                  <div 
                    key={msg.id}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignSelf: msg.sender === "human" ? "flex-end" : "flex-start",
                      maxWidth: "85%"
                    }}
                  >
                    <div style={{ 
                      fontSize: "10px", 
                      fontWeight: 800, 
                      color: msg.sender === "human" ? "hsl(var(--primary))" : "hsl(var(--success))",
                      marginBottom: "4px",
                      textTransform: "uppercase",
                      fontFamily: "var(--font-mono)",
                      alignSelf: msg.sender === "human" ? "flex-end" : "flex-start"
                    }}>
                      {msg.sender === "human" ? "👤 Human Editor" : "🤖 Aegis Agent"}
                    </div>
                    <div style={{
                      background: msg.sender === "human" ? "hsla(var(--primary), 0.12)" : "hsl(var(--muted))",
                      border: `1px solid ${msg.sender === "human" ? "hsla(var(--primary), 0.3)" : "hsl(var(--border))"}`,
                      color: "hsl(var(--foreground))",
                      padding: "10px 14px",
                      borderRadius: "var(--radius-sm)",
                      fontSize: "13px",
                      lineHeight: 1.5,
                      whiteSpace: "pre-wrap"
                    }}>
                      {msg.text}
                    </div>
                    <div style={{ fontSize: "9px", color: "hsl(var(--muted-foreground))", marginTop: "3px", alignSelf: msg.sender === "human" ? "flex-end" : "flex-start" }}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </div>
                  </div>
                ))}
                <div ref={chatBottomRef} />
              </div>

              {/* Quick Directive Chips */}
              <div>
                <div style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "hsl(var(--muted-foreground))", marginBottom: "8px" }}>
                  Quick Directive Direct Commands:
                </div>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  {quickDirectives.map((d, i) => (
                    <button
                      key={i}
                      onClick={() => handleSendChat(d)}
                      disabled={sendingChat}
                      style={{
                        background: "hsla(var(--muted), 0.8)",
                        border: "1px solid hsl(var(--border))",
                        color: "hsl(var(--muted-foreground))",
                        padding: "4px 10px",
                        borderRadius: "var(--radius-sm)",
                        fontSize: "11px",
                        cursor: "pointer",
                        fontWeight: 600,
                        transition: "all 0.2s"
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "hsl(var(--primary))"; e.currentTarget.style.color = "hsl(var(--foreground))"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "hsl(var(--border))"; e.currentTarget.style.color = "hsl(var(--muted-foreground))"; }}
                    >
                      + {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat Input Field */}
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSendChat(); }}
                style={{ display: "flex", gap: "10px", marginTop: "4px" }}
              >
                <input 
                  type="text"
                  placeholder="Give human editorial instructions to the Agent (e.g., 'Focus on zero-days', 'Run cycle now')..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  disabled={sendingChat}
                  className="sandbox-input"
                  style={{ marginBottom: 0, height: "46px" }}
                />
                <button
                  type="submit"
                  disabled={sendingChat || !chatInput.trim()}
                  className="btn btn-primary"
                  style={{ height: "46px", padding: "0 18px", flexShrink: 0 }}
                >
                  <Send size={15} />
                  Steer
                </button>
              </form>

            </div>
          </div>

          {/* Policy Matrix & Editorial Guardrails */}
          <div className="admin-panel" style={{ maxHeight: "none" }}>
            <div className="panel-header">
              <h2 className="panel-title" style={{ fontSize: "14px" }}>
                <Sliders size={16} style={{ color: "hsl(var(--warning))" }} />
                Agent Policy & Safety Guardrails
              </h2>
            </div>
            
            <div className="panel-body" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "20px" }}>
              
              {/* Autonomy Mode Switch */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "hsl(var(--muted))", padding: "14px 18px", borderRadius: "var(--radius-sm)", border: "1px solid hsl(var(--border))" }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: "13px", textTransform: "uppercase" }}>Autonomous Auto-Publishing</div>
                  <div style={{ fontSize: "12px", color: "hsl(var(--muted-foreground))" }}>When active, rewrites scoring below threshold publish instantly without human intervention.</div>
                </div>
                <button 
                  onClick={() => handleUpdatePolicy({ 
                    autoPublish: !agentState.autoPublish, 
                    mode: !agentState.autoPublish ? "autonomous" : "supervised" 
                  })}
                  className={`btn ${agentState.autoPublish ? "btn-primary" : "btn-secondary"}`}
                  style={{ fontSize: "11px", padding: "6px 14px" }}
                >
                  {agentState.autoPublish ? "ENABLED" : "SUPERVISED"}
                </button>
              </div>

              {/* Sliders Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label className="sandbox-label">Max Allowed Plagiarism (%): <b>{agentState.maxPlagiarismThreshold}%</b></label>
                  <input 
                    type="range"
                    min="5"
                    max="35"
                    value={agentState.maxPlagiarismThreshold}
                    onChange={(e) => handleUpdatePolicy({ maxPlagiarismThreshold: parseInt(e.target.value, 10) })}
                    style={{ width: "100%", accentColor: "hsl(var(--primary))" }}
                  />
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "hsl(var(--muted-foreground))" }}>
                    <span>5% (Strict)</span>
                    <span>35% (Relaxed)</span>
                  </div>
                </div>

                <div>
                  <label className="sandbox-label">Minimum Ingestion Severity</label>
                  <select
                    value={agentState.minSeverity}
                    onChange={(e) => handleUpdatePolicy({ minSeverity: e.target.value })}
                    className="sandbox-input"
                    style={{ height: "38px", background: "hsl(var(--background))" }}
                  >
                    <option value="Critical">Critical Only (CVSS 9.0+)</option>
                    <option value="High">High & Critical (CVSS 7.0+)</option>
                    <option value="Medium">Medium and Above (CVSS 4.0+)</option>
                    <option value="Low">All Severities</option>
                  </select>
                </div>
              </div>

              {/* Focus Tags */}
              <div>
                <label className="sandbox-label">Priority Threat Tags (Rank Boosters)</label>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "6px" }}>
                  {agentState.focusTags?.map((tag, idx) => (
                    <span 
                      key={idx}
                      style={{
                        background: "hsla(var(--primary), 0.1)",
                        border: "1px solid hsla(var(--primary), 0.3)",
                        color: "hsl(var(--primary))",
                        padding: "3px 10px",
                        borderRadius: "var(--radius-sm)",
                        fontSize: "11px",
                        fontWeight: 700,
                        fontFamily: "var(--font-mono)"
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Custom Standing Directive */}
              <div>
                <label className="sandbox-label">Active Standing Directive</label>
                <textarea 
                  value={agentState.customDirective || ""}
                  onChange={(e) => handleUpdatePolicy({ customDirective: e.target.value })}
                  className="sandbox-textarea"
                  style={{ height: "70px", fontSize: "12px", fontFamily: "var(--font-mono)", marginBottom: 0 }}
                  placeholder="Enter high-level instructions to anchor the AI agent's editorial perspective..."
                />
              </div>

            </div>
          </div>

        </div>

        {/* Right Column: Live Agent Reasoning & Thought Log Stream */}
        <div className="admin-panel" style={{ maxHeight: "none", display: "flex", flexDirection: "column" }}>
          <div className="panel-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 className="panel-title" style={{ fontSize: "14px" }}>
              <Radio size={16} className="sandbox-loading-pulse" style={{ color: "hsl(var(--danger))" }} />
              Live Agent Reasoning & Activity Log
            </h2>
            <div style={{ display: "flex", gap: "4px" }}>
              {["all", "publish", "decision", "scrape", "steer"].map(filter => (
                <button
                  key={filter}
                  onClick={() => setLogFilter(filter)}
                  style={{
                    padding: "3px 8px",
                    borderRadius: "2px",
                    border: "none",
                    fontSize: "10px",
                    fontWeight: 700,
                    cursor: "pointer",
                    textTransform: "uppercase",
                    background: logFilter === filter ? "hsl(var(--primary))" : "hsl(var(--muted))",
                    color: logFilter === filter ? "#000000" : "hsl(var(--muted-foreground))"
                  }}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="panel-body" style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "12px", maxHeight: "850px", overflowY: "auto" }}>
            {filteredLogs.length > 0 ? (
              filteredLogs.map(log => {
                let badgeColor = "hsl(var(--muted-foreground))";
                let badgeBg = "hsl(var(--muted))";
                let icon = <Activity size={12} />;

                if (log.type === "publish") {
                  badgeColor = "hsl(var(--success))";
                  badgeBg = "hsla(var(--success), 0.1)";
                  icon = <CheckCircle2 size={12} />;
                } else if (log.type === "decision") {
                  badgeColor = "hsl(var(--primary))";
                  badgeBg = "hsla(var(--primary), 0.1)";
                  icon = <Cpu size={12} />;
                } else if (log.type === "scrape") {
                  badgeColor = "hsl(var(--warning))";
                  badgeBg = "hsla(var(--warning), 0.1)";
                  icon = <Terminal size={12} />;
                } else if (log.type === "steer") {
                  badgeColor = "#a855f7";
                  badgeBg = "rgba(168, 85, 247, 0.1)";
                  icon = <Bot size={12} />;
                }

                return (
                  <div 
                    key={log.id}
                    style={{
                      background: "hsl(var(--background))",
                      border: log.type === "publish" ? "1px solid hsla(var(--success), 0.3)" : "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius-sm)",
                      padding: "12px 14px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "6px"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        padding: "2px 6px",
                        borderRadius: "var(--radius-sm)",
                        background: badgeBg,
                        color: badgeColor,
                        fontSize: "9px",
                        fontWeight: 800,
                        textTransform: "uppercase",
                        fontFamily: "var(--font-mono)"
                      }}>
                        {icon}
                        {log.type}
                      </span>
                      <span style={{ fontSize: "10px", color: "hsl(var(--muted-foreground))", fontFamily: "var(--font-mono)" }}>
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </div>
                    <div style={{ fontSize: "12px", color: "hsl(var(--foreground))", lineHeight: 1.5 }}>
                      {log.message}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="empty-state" style={{ padding: "40px 0" }}>
                <Activity className="empty-state-icon" />
                <p>No activity logs found for filter "{logFilter}".</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </EditorAuthGate>
  );
}
