"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ShieldCheck, 
  Cpu, 
  Terminal, 
  ExternalLink, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  Zap, 
  Lock, 
  Award, 
  Search,
  Layers,
  ArrowRight,
  Sparkles,
  RefreshCw,
  Clock
} from "lucide-react";

export default function BenchmarksPage() {
  const [models, setModels] = useState([]);
  const [entities, setEntities] = useState([]);
  const [selectedType, setSelectedType] = useState("all");
  const [sortBy, setSortBy] = useState("rank");
  const [selectedModel, setSelectedModel] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);

  const fetchBenchmarks = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/benchmarks?type=${selectedType}&sort=${sortBy}`);
      const data = await res.json();
      if (data.success) {
        setModels(data.models);
        setEntities(data.entities);
        if (!selectedModel && data.models.length > 0) {
          setSelectedModel(data.models[0]);
        }
      }
    } catch (err) {
      console.error("Error loading benchmark data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBenchmarks();
  }, [selectedType, sortBy]);

  const handleTriggerSync = async () => {
    try {
      setSyncing(true);
      const res = await fetch("/api/benchmarks/cron?force=true", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setModels(data.models);
        setLastSyncTime(data.lastDailySync);
        if (data.models.length > 0) {
          setSelectedModel(data.models[0]);
        }
      }
    } catch (err) {
      console.error("Error triggering sync:", err);
    } finally {
      setSyncing(false);
    }
  };

  const filteredModels = models.filter(m => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return m.name.toLowerCase().includes(q) || m.provider.toLowerCase().includes(q) || m.type.toLowerCase().includes(q);
  });

  const getScoreColor = (score) => {
    if (score >= 90) return "hsl(var(--success))";
    if (score >= 80) return "hsl(var(--primary))";
    if (score >= 70) return "hsl(var(--warning))";
    return "hsl(var(--danger))";
  };

  return (
    <div className="container" style={{ paddingBottom: "100px", paddingTop: "32px" }}>
      {/* Hero Header */}
      <section style={{ marginBottom: "40px", textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", gap: "10px", alignItems: "center", flexWrap: "wrap", marginBottom: "14px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "6px 14px", borderRadius: "var(--radius-sm)", background: "hsla(var(--primary), 0.1)", border: "1px solid hsla(var(--primary), 0.3)", color: "hsl(var(--primary))", fontSize: "11px", fontWeight: 800, fontFamily: "var(--font-mono)" }}>
            <Award size={14} />
            AUTHORITATIVE SECTECH BENCHMARKS
          </div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "6px 14px", borderRadius: "var(--radius-sm)", background: "hsla(var(--success), 0.1)", border: "1px solid hsla(var(--success), 0.3)", color: "hsl(var(--success))", fontSize: "11px", fontWeight: 800, fontFamily: "var(--font-mono)" }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "currentColor" }} />
            UPDATED DAILY (24H REFRESH CADENCE)
          </div>
        </div>

        <h1 style={{ fontSize: "38px", fontWeight: 900, letterSpacing: "-1px", textTransform: "uppercase", marginBottom: "12px" }}>
          AI Security Model <span style={{ color: "hsl(var(--primary))" }}>Leaderboard</span>
        </h1>
        <p style={{ color: "hsl(var(--muted-foreground))", fontSize: "15px", maxWidth: "760px", margin: "0 auto 24px auto", lineHeight: 1.6 }}>
          Authoritative cybersecurity evaluations of frontier LLMs and open-weights models across vulnerability remediation, autonomous threat hunting, prompt injection defense, and exploit discovery. Sourced directly from trusted benchmarking organizations and refreshed daily.
        </p>

        {/* Manual Refresh / Auto-Sync Telemetry Button */}
        <div style={{ display: "flex", justifyContent: "center", gap: "12px", alignItems: "center", marginBottom: "32px" }}>
          <button
            onClick={handleTriggerSync}
            disabled={syncing}
            className="btn btn-secondary"
            style={{ fontSize: "11px", padding: "6px 16px", height: "34px", display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            <RefreshCw size={13} className={syncing ? "sandbox-loading-pulse" : ""} />
            {syncing ? "Recalibrating Leaderboard..." : "Force Daily Recalibration"}
          </button>
        </div>

        {/* Highlight Stats */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "18px",
          maxWidth: "960px",
          margin: "0 auto"
        }}>
          <div style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", padding: "18px 20px", borderRadius: "var(--radius-sm)", textAlign: "left" }}>
            <div style={{ color: "hsl(var(--muted-foreground))", fontSize: "11px", textTransform: "uppercase", fontWeight: 700, marginBottom: "4px" }}>#1 Ranked SecLLM</div>
            <div style={{ fontSize: "20px", fontWeight: 800, color: "hsl(var(--primary))", fontFamily: "var(--font-mono)" }}>Claude 3.7 Sonnet</div>
            <div style={{ fontSize: "11px", color: "hsl(var(--success))", fontWeight: 700, marginTop: "2px" }}>94.2 Overall Security Index</div>
          </div>
          <div style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", padding: "18px 20px", borderRadius: "var(--radius-sm)", textAlign: "left" }}>
            <div style={{ color: "hsl(var(--muted-foreground))", fontSize: "11px", textTransform: "uppercase", fontWeight: 700, marginBottom: "4px" }}>Core Evaluation Vectors</div>
            <div style={{ fontSize: "20px", fontWeight: 800, color: "hsl(var(--foreground))", fontFamily: "var(--font-mono)" }}>5 Standard Vectors</div>
            <div style={{ fontSize: "11px", color: "hsl(var(--muted-foreground))", marginTop: "2px" }}>Patching, Hunting, Injection, CTF</div>
          </div>
          <div style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", padding: "18px 20px", borderRadius: "var(--radius-sm)", textAlign: "left" }}>
            <div style={{ color: "hsl(var(--muted-foreground))", fontSize: "11px", textTransform: "uppercase", fontWeight: 700, marginBottom: "4px" }}>Trusted Testing Entities</div>
            <div style={{ fontSize: "20px", fontWeight: 800, color: "hsl(var(--success))", fontFamily: "var(--font-mono)" }}>5 Premier Labs</div>
            <div style={{ fontSize: "11px", color: "hsl(var(--muted-foreground))", marginTop: "2px" }}>Meta, MITRE, USENIX, Stanford, OWASP</div>
          </div>
        </div>
      </section>

      {/* Control Bar: Filter Tabs & Sorting */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "16px",
        marginBottom: "24px",
        background: "hsl(var(--card))",
        padding: "16px 20px",
        borderRadius: "var(--radius-sm)",
        border: "1px solid hsl(var(--border))"
      }}>
        {/* Type Filter Buttons */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {[
            { id: "all", label: "All Models" },
            { id: "frontier", label: "Frontier LLMs" },
            { id: "open", label: "Open-Weights" },
            { id: "secops", label: "SecOps Agents" }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedType(tab.id)}
              className={`btn ${selectedType === tab.id ? "btn-primary" : "btn-secondary"}`}
              style={{ fontSize: "11px", padding: "6px 14px", height: "32px" }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Sort */}
        <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ position: "relative", minWidth: "220px" }}>
            <Search size={14} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "hsl(var(--muted-foreground))" }} />
            <input
              type="text"
              placeholder="Search model or provider..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "6px 12px 6px 32px",
                fontSize: "12px",
                background: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius-sm)",
                color: "hsl(var(--foreground))"
              }}
            />
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              padding: "6px 12px",
              fontSize: "12px",
              background: "hsl(var(--background))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "var(--radius-sm)",
              color: "hsl(var(--foreground))",
              cursor: "pointer"
            }}
          >
            <option value="rank">Sort by: Overall Rank</option>
            <option value="overall">Sort by: Security Index</option>
            <option value="hunting">Sort by: Threat Hunting (SIEM)</option>
            <option value="patching">Sort by: Patching (SWE-bench)</option>
            <option value="injection">Sort by: Prompt Injection Defense</option>
          </select>
        </div>
      </div>

      {/* Main Grid: Leaderboard Table & Selected Model Deep-Dive */}
      <div style={{ display: "grid", gridTemplateColumns: "1.8fr 1.2fr", gap: "28px", alignItems: "start" }}>
        {/* Left: Leaderboard Table */}
        <div style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "var(--radius-sm)", overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid hsl(var(--border))", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontWeight: 800, fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Global Cybersecurity Model Matrix (Daily Sync)
            </div>
            <span style={{ fontSize: "11px", color: "hsl(var(--muted-foreground))" }}>
              Showing {filteredModels.length} Models
            </span>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", textAlign: "left" }}>
              <thead>
                <tr style={{ background: "hsl(var(--background))", borderBottom: "1px solid hsl(var(--border))", color: "hsl(var(--muted-foreground))" }}>
                  <th style={{ padding: "10px 14px", width: "40px" }}>#</th>
                  <th style={{ padding: "10px 14px" }}>Model & Provider</th>
                  <th style={{ padding: "10px 14px", textAlign: "center" }}>Security Index</th>
                  <th style={{ padding: "10px 14px", textAlign: "center" }}>Threat Hunting</th>
                  <th style={{ padding: "10px 14px", textAlign: "center" }}>CVE Patching</th>
                  <th style={{ padding: "10px 14px", textAlign: "center" }}>Injection Defense</th>
                </tr>
              </thead>
              <tbody>
                {filteredModels.map((m) => {
                  const isSelected = selectedModel?.id === m.id;
                  return (
                    <tr
                      key={m.id}
                      onClick={() => setSelectedModel(m)}
                      style={{
                        borderBottom: "1px solid hsl(var(--border))",
                        cursor: "pointer",
                        background: isSelected ? "hsla(var(--primary), 0.08)" : "transparent",
                        transition: "background 0.15s ease"
                      }}
                    >
                      <td style={{ padding: "14px", fontWeight: 800, fontFamily: "var(--font-mono)", color: m.rank <= 3 ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))" }}>
                        {m.rank}
                      </td>
                      <td style={{ padding: "14px" }}>
                        <div style={{ fontWeight: 800, fontSize: "13px", color: isSelected ? "hsl(var(--primary))" : "hsl(var(--foreground))" }}>
                          {m.name}
                        </div>
                        <div style={{ display: "flex", gap: "6px", alignItems: "center", marginTop: "3px" }}>
                          <span style={{ fontSize: "10px", color: "hsl(var(--muted-foreground))" }}>{m.provider}</span>
                          <span>•</span>
                          <span style={{ fontSize: "10px", padding: "1px 6px", borderRadius: "2px", background: "rgba(255,255,255,0.05)", border: "1px solid hsl(var(--border))" }}>
                            {m.type}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: "14px", textAlign: "center" }}>
                        <span style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "14px",
                          fontWeight: 900,
                          color: getScoreColor(m.overallScore)
                        }}>
                          {m.overallScore}
                        </span>
                      </td>
                      <td style={{ padding: "14px", textAlign: "center", fontFamily: "var(--font-mono)", fontWeight: 700 }}>
                        {m.metrics.threatHunting}%
                      </td>
                      <td style={{ padding: "14px", textAlign: "center", fontFamily: "var(--font-mono)", fontWeight: 700 }}>
                        {m.metrics.patchingRate}%
                      </td>
                      <td style={{ padding: "14px", textAlign: "center", fontFamily: "var(--font-mono)", fontWeight: 700, color: "hsl(var(--success))" }}>
                        {m.metrics.injectionDefense}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Selected Model Detailed Scorecard */}
        {selectedModel && (
          <div style={{
            background: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "var(--radius-sm)",
            padding: "24px",
            position: "sticky",
            top: "90px"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
              <div>
                <span style={{ 
                  display: "inline-flex", 
                  alignItems: "center", 
                  gap: "4px", 
                  fontSize: "10px", 
                  fontWeight: 800, 
                  color: "hsl(var(--primary))", 
                  background: "hsla(var(--primary), 0.1)", 
                  border: "1px solid hsla(var(--primary), 0.3)",
                  padding: "2px 8px", 
                  borderRadius: "var(--radius-sm)",
                  fontFamily: "var(--font-mono)",
                  marginBottom: "8px"
                }}>
                  RANK #{selectedModel.rank} MODEL PROFILE
                </span>
                <h2 style={{ fontSize: "20px", fontWeight: 800 }}>{selectedModel.name}</h2>
                <div style={{ color: "hsl(var(--muted-foreground))", fontSize: "12px", marginTop: "2px" }}>
                  Provider: <b>{selectedModel.provider}</b> • Context: {selectedModel.contextWindow}
                </div>
              </div>

              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "28px", fontWeight: 900, fontFamily: "var(--font-mono)", color: getScoreColor(selectedModel.overallScore) }}>
                  {selectedModel.overallScore}
                </div>
                <div style={{ fontSize: "10px", textTransform: "uppercase", fontWeight: 700, color: "hsl(var(--muted-foreground))" }}>Security Index</div>
              </div>
            </div>

            {/* Metric Bars */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", margin: "20px 0" }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", fontWeight: 700, marginBottom: "4px" }}>
                  <span>Threat Hunting & SIEM Correlation (MITRE ATT&CK)</span>
                  <span style={{ fontFamily: "var(--font-mono)", color: "hsl(var(--primary))" }}>{selectedModel.metrics.threatHunting}%</span>
                </div>
                <div style={{ height: "6px", background: "hsl(var(--background))", borderRadius: "3px", overflow: "hidden" }}>
                  <div style={{ width: `${selectedModel.metrics.threatHunting}%`, height: "100%", background: "hsl(var(--primary))" }} />
                </div>
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", fontWeight: 700, marginBottom: "4px" }}>
                  <span>Vulnerability Remediation & Patching (SWE-bench Sec)</span>
                  <span style={{ fontFamily: "var(--font-mono)", color: "hsl(var(--primary))" }}>{selectedModel.metrics.patchingRate}%</span>
                </div>
                <div style={{ height: "6px", background: "hsl(var(--background))", borderRadius: "3px", overflow: "hidden" }}>
                  <div style={{ width: `${selectedModel.metrics.patchingRate}%`, height: "100%", background: "hsl(var(--primary))" }} />
                </div>
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", fontWeight: 700, marginBottom: "4px" }}>
                  <span>Exploit Identification & CTF Solving (SEC-bench)</span>
                  <span style={{ fontFamily: "var(--font-mono)", color: "hsl(var(--primary))" }}>{selectedModel.metrics.exploitDetection}%</span>
                </div>
                <div style={{ height: "6px", background: "hsl(var(--background))", borderRadius: "3px", overflow: "hidden" }}>
                  <div style={{ width: `${selectedModel.metrics.exploitDetection}%`, height: "100%", background: "hsl(var(--primary))" }} />
                </div>
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", fontWeight: 700, marginBottom: "4px" }}>
                  <span>Prompt Injection & Jailbreak Defense (CyberSecEval 3)</span>
                  <span style={{ fontFamily: "var(--font-mono)", color: "hsl(var(--success))" }}>{selectedModel.metrics.injectionDefense}%</span>
                </div>
                <div style={{ height: "6px", background: "hsl(var(--background))", borderRadius: "3px", overflow: "hidden" }}>
                  <div style={{ width: `${selectedModel.metrics.injectionDefense}%`, height: "100%", background: "hsl(var(--success))" }} />
                </div>
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", fontWeight: 700, marginBottom: "4px" }}>
                  <span>Insecure Code Emitted (Lower is better)</span>
                  <span style={{ fontFamily: "var(--font-mono)", color: selectedModel.metrics.insecureCodeRate < 4 ? "hsl(var(--success))" : "hsl(var(--warning))" }}>{selectedModel.metrics.insecureCodeRate}%</span>
                </div>
                <div style={{ height: "6px", background: "hsl(var(--background))", borderRadius: "3px", overflow: "hidden" }}>
                  <div style={{ width: `${selectedModel.metrics.insecureCodeRate * 10}%`, height: "100%", background: selectedModel.metrics.insecureCodeRate < 4 ? "hsl(var(--success))" : "hsl(var(--warning))" }} />
                </div>
              </div>
            </div>

            {/* Strengths & Weaknesses */}
            <div style={{ fontSize: "12px", borderTop: "1px solid hsl(var(--border))", paddingTop: "16px", marginTop: "16px" }}>
              <div style={{ fontWeight: 800, fontSize: "11px", textTransform: "uppercase", color: "hsl(var(--success))", marginBottom: "6px" }}>Key Strengths</div>
              <ul style={{ paddingLeft: "16px", display: "flex", flexDirection: "column", gap: "4px", color: "hsl(var(--foreground))", lineHeight: 1.5 }}>
                {selectedModel.primaryStrengths.map((s, idx) => (
                  <li key={idx}>{s}</li>
                ))}
              </ul>
            </div>

            <div style={{ fontSize: "12px", borderTop: "1px solid hsl(var(--border))", paddingTop: "14px", marginTop: "14px" }}>
              <div style={{ fontWeight: 800, fontSize: "11px", textTransform: "uppercase", color: "hsl(var(--muted-foreground))", marginBottom: "4px" }}>Recommended Deployment</div>
              <div style={{ color: "hsl(var(--foreground))", fontWeight: 600 }}>{selectedModel.recommendedUse}</div>
            </div>

            <div style={{ fontSize: "11px", color: "hsl(var(--muted-foreground))", marginTop: "16px", display: "flex", justifyContent: "space-between" }}>
              <span>Evaluated by: <b>{selectedModel.testedBy.join(", ")}</b></span>
              <span>Last Tested: {selectedModel.lastTested}</span>
            </div>
          </div>
        )}
      </div>

      {/* Trusted Benchmarking Entities Section */}
      <section style={{ marginTop: "60px", borderTop: "1px solid hsl(var(--border))", paddingTop: "40px" }}>
        <div style={{ marginBottom: "24px" }}>
          <h2 style={{ fontSize: "20px", fontWeight: 800, textTransform: "uppercase" }}>Trusted Benchmarking Entities & Frameworks</h2>
          <p style={{ color: "hsl(var(--muted-foreground))", fontSize: "13px" }}>
            HackerPost indexes standardized evaluation datasets from accredited cybersecurity and AI safety institutions.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
          {entities.map(entity => (
            <div key={entity.id} style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "var(--radius-sm)", padding: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <h3 style={{ fontSize: "14px", fontWeight: 800 }}>{entity.name}</h3>
                <a href={entity.url} target="_blank" rel="noopener noreferrer" style={{ color: "hsl(var(--primary))" }}>
                  <ExternalLink size={14} />
                </a>
              </div>
              <p style={{ fontSize: "12px", color: "hsl(var(--muted-foreground))", lineHeight: 1.5 }}>
                {entity.description}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
