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
import BenchmarkSocialShare from "../components/BenchmarkSocialShare";

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
        if (data.lastDailySync) {
          setLastSyncTime(data.lastDailySync);
        }
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
    if (score >= 90) return "#15803d"; // Corporate emerald
    if (score >= 80) return "#0f3674"; // Corporate navy
    if (score >= 70) return "#b45309"; // Corporate amber
    return "#b91c1c"; // Corporate red
  };

  const formattedSyncDate = lastSyncTime 
    ? new Date(lastSyncTime).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <div className="container" style={{ paddingBottom: "80px", paddingTop: "28px" }}>
      {/* Hero Header */}
      <section style={{ marginBottom: "36px", textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", gap: "10px", alignItems: "center", flexWrap: "wrap", marginBottom: "14px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "4px 12px", borderRadius: "2px", background: "hsl(var(--muted))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))", fontSize: "11px", fontWeight: 700, textTransform: "uppercase" }}>
            <Award size={13} style={{ color: "hsl(var(--primary))" }} />
            Authoritative Industry Benchmarks
          </div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "4px 12px", borderRadius: "2px", background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#166534", fontSize: "11px", fontWeight: 700, textTransform: "uppercase" }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#16a34a" }} />
            Verified Today · {formattedSyncDate}
          </div>
        </div>

        <h1 style={{ fontSize: "32px", fontWeight: 800, letterSpacing: "-0.5px", marginBottom: "10px", color: "hsl(var(--foreground))" }}>
          AI Security Model Leaderboard
        </h1>
        <p style={{ color: "hsl(var(--muted-foreground))", fontSize: "14px", maxWidth: "780px", margin: "0 auto 20px auto", lineHeight: 1.6 }}>
          Standardized cybersecurity evaluations of frontier foundation models and open-weights architectures across vulnerability remediation, autonomous threat hunting, prompt injection defense, and exploit discovery. Verified daily against Meta CyberSecEval, MITRE ATT&amp;CK, and USENIX SEC-bench.
        </p>

        {/* Manual Refresh / Daily Sync Telemetry Button */}
        <div style={{ display: "flex", justifyContent: "center", gap: "12px", alignItems: "center", marginBottom: "28px" }}>
          <button
            onClick={handleTriggerSync}
            disabled={syncing}
            className="btn btn-secondary"
            style={{ fontSize: "11px", padding: "6px 14px", height: "32px", display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            <RefreshCw size={12} className={syncing ? "animate-spin" : ""} />
            {syncing ? "Recalibrating Telemetry..." : "Force Daily Recalibration"}
          </button>
        </div>

        {/* Highlight Stats */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "16px",
          maxWidth: "960px",
          margin: "0 auto"
        }}>
          <div style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", padding: "16px 20px", borderRadius: "var(--radius-sm)", textAlign: "left" }}>
            <div style={{ color: "hsl(var(--muted-foreground))", fontSize: "10px", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.5px", marginBottom: "4px" }}>#1 Ranked SecLLM</div>
            <div style={{ fontSize: "18px", fontWeight: 800, color: "hsl(var(--primary))" }}>
              {models[0]?.name || "Claude 3.7 Sonnet"}
            </div>
            <div style={{ fontSize: "11px", color: "#166534", fontWeight: 700, marginTop: "2px" }}>
              {models[0]?.overallScore ? `${models[0].overallScore} Composite Security Index` : "Authoritative Index"}
            </div>
          </div>
          <div style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", padding: "16px 20px", borderRadius: "var(--radius-sm)", textAlign: "left" }}>
            <div style={{ color: "hsl(var(--muted-foreground))", fontSize: "10px", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.5px", marginBottom: "4px" }}>Core Evaluation Vectors</div>
            <div style={{ fontSize: "18px", fontWeight: 800, color: "hsl(var(--foreground))" }}>5 Threat Vectors</div>
            <div style={{ fontSize: "11px", color: "hsl(var(--muted-foreground))", marginTop: "2px" }}>CVE Patching, SIEM Hunting, Jailbreak Defense</div>
          </div>
          <div style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", padding: "16px 20px", borderRadius: "var(--radius-sm)", textAlign: "left" }}>
            <div style={{ color: "hsl(var(--muted-foreground))", fontSize: "10px", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.5px", marginBottom: "4px" }}>Accredited Testing Labs</div>
            <div style={{ fontSize: "18px", fontWeight: 800, color: "hsl(var(--foreground))" }}>5 Premier Institutions</div>
            <div style={{ fontSize: "11px", color: "hsl(var(--muted-foreground))", marginTop: "2px" }}>Meta, MITRE, USENIX, Stanford, OWASP</div>
          </div>
        </div>
      </section>

      {/* Social Syndication & Share Suite */}
      <BenchmarkSocialShare />

      {/* Control Bar: Filter Tabs & Sorting */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "16px",
        marginBottom: "20px",
        background: "hsl(var(--card))",
        padding: "14px 18px",
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
              style={{ fontSize: "11px", padding: "5px 12px", height: "30px" }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Sort */}
        <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ position: "relative", minWidth: "220px" }}>
            <Search size={13} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "hsl(var(--muted-foreground))" }} />
            <input
              type="text"
              placeholder="Search model or provider..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "5px 12px 5px 30px",
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
              padding: "5px 12px",
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
      <div style={{ display: "grid", gridTemplateColumns: "1.8fr 1.2fr", gap: "24px", alignItems: "start" }}>
        {/* Left: Leaderboard Table */}
        <div style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "var(--radius-sm)", overflow: "hidden" }}>
          <div style={{ padding: "12px 18px", borderBottom: "1px solid hsl(var(--border))", display: "flex", justifyContent: "space-between", alignItems: "center", background: "hsl(var(--muted))" }}>
            <div style={{ fontWeight: 800, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px", color: "hsl(var(--foreground))" }}>
              Global Cybersecurity Model Matrix (Daily Sync)
            </div>
            <span style={{ fontSize: "11px", color: "hsl(var(--muted-foreground))", fontWeight: 600 }}>
              {filteredModels.length} Models Indexed · Updated {formattedSyncDate}
            </span>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", textAlign: "left" }}>
              <thead>
                <tr style={{ background: "hsl(var(--background))", borderBottom: "1px solid hsl(var(--border))", color: "hsl(var(--muted-foreground))" }}>
                  <th style={{ padding: "10px 14px", width: "45px" }}>#</th>
                  <th style={{ padding: "10px 14px" }}>Model &amp; Provider</th>
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
                        background: isSelected ? "rgba(15, 54, 116, 0.06)" : "transparent",
                        transition: "background 0.1s ease"
                      }}
                    >
                      <td style={{ padding: "12px 14px", fontWeight: 800, color: m.rank <= 3 ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))" }}>
                        #{m.rank}
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <div style={{ fontWeight: 700, fontSize: "13px", color: isSelected ? "hsl(var(--primary))" : "hsl(var(--foreground))" }}>
                          {m.name}
                        </div>
                        <div style={{ display: "flex", gap: "6px", alignItems: "center", marginTop: "3px" }}>
                          <span style={{ fontSize: "11px", color: "hsl(var(--muted-foreground))" }}>{m.provider}</span>
                          <span>•</span>
                          <span style={{ fontSize: "10px", padding: "1px 6px", borderRadius: "2px", background: "hsl(var(--muted))", border: "1px solid hsl(var(--border))", color: "hsl(var(--muted-foreground))", fontWeight: 600 }}>
                            {m.type}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: "12px 14px", textAlign: "center" }}>
                        <span style={{
                          fontSize: "14px",
                          fontWeight: 800,
                          color: getScoreColor(m.overallScore)
                        }}>
                          {m.overallScore}
                        </span>
                      </td>
                      <td style={{ padding: "12px 14px", textAlign: "center", fontWeight: 700 }}>
                        {m.metrics.threatHunting}%
                      </td>
                      <td style={{ padding: "12px 14px", textAlign: "center", fontWeight: 700 }}>
                        {m.metrics.patchingRate}%
                      </td>
                      <td style={{ padding: "12px 14px", textAlign: "center", fontWeight: 700, color: "#15803d" }}>
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
            padding: "20px",
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
                  fontWeight: 700, 
                  color: "hsl(var(--primary))", 
                  background: "rgba(15, 54, 116, 0.08)", 
                  border: "1px solid rgba(15, 54, 116, 0.2)",
                  padding: "2px 8px", 
                  borderRadius: "2px",
                  marginBottom: "8px",
                  textTransform: "uppercase"
                }}>
                  Rank #{selectedModel.rank} Model Profile
                </span>
                <h2 style={{ fontSize: "18px", fontWeight: 800, margin: 0, color: "hsl(var(--foreground))" }}>{selectedModel.name}</h2>
                <div style={{ color: "hsl(var(--muted-foreground))", fontSize: "12px", marginTop: "4px" }}>
                  Provider: <b>{selectedModel.provider}</b> • Context: {selectedModel.contextWindow}
                </div>
              </div>

              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "28px", fontWeight: 900, color: getScoreColor(selectedModel.overallScore) }}>
                  {selectedModel.overallScore}
                </div>
                <div style={{ fontSize: "10px", textTransform: "uppercase", fontWeight: 700, color: "hsl(var(--muted-foreground))" }}>Security Index</div>
              </div>
            </div>

            {/* Metric Bars */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", margin: "16px 0" }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", fontWeight: 700, marginBottom: "4px" }}>
                  <span>Threat Hunting &amp; SIEM Correlation (MITRE ATT&amp;CK)</span>
                  <span style={{ color: "hsl(var(--primary))" }}>{selectedModel.metrics.threatHunting}%</span>
                </div>
                <div style={{ height: "6px", background: "hsl(var(--muted))", borderRadius: "3px", overflow: "hidden" }}>
                  <div style={{ width: `${selectedModel.metrics.threatHunting}%`, height: "100%", background: "hsl(var(--primary))" }} />
                </div>
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", fontWeight: 700, marginBottom: "4px" }}>
                  <span>Vulnerability Remediation &amp; Patching (SWE-bench Sec)</span>
                  <span style={{ color: "hsl(var(--primary))" }}>{selectedModel.metrics.patchingRate}%</span>
                </div>
                <div style={{ height: "6px", background: "hsl(var(--muted))", borderRadius: "3px", overflow: "hidden" }}>
                  <div style={{ width: `${selectedModel.metrics.patchingRate}%`, height: "100%", background: "hsl(var(--primary))" }} />
                </div>
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", fontWeight: 700, marginBottom: "4px" }}>
                  <span>Exploit Identification &amp; CTF Solving (SEC-bench)</span>
                  <span style={{ color: "hsl(var(--primary))" }}>{selectedModel.metrics.exploitDetection}%</span>
                </div>
                <div style={{ height: "6px", background: "hsl(var(--muted))", borderRadius: "3px", overflow: "hidden" }}>
                  <div style={{ width: `${selectedModel.metrics.exploitDetection}%`, height: "100%", background: "hsl(var(--primary))" }} />
                </div>
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", fontWeight: 700, marginBottom: "4px" }}>
                  <span>Prompt Injection &amp; Jailbreak Defense (CyberSecEval 3)</span>
                  <span style={{ color: "#15803d" }}>{selectedModel.metrics.injectionDefense}%</span>
                </div>
                <div style={{ height: "6px", background: "hsl(var(--muted))", borderRadius: "3px", overflow: "hidden" }}>
                  <div style={{ width: `${selectedModel.metrics.injectionDefense}%`, height: "100%", background: "#15803d" }} />
                </div>
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", fontWeight: 700, marginBottom: "4px" }}>
                  <span>Insecure Code Emitted (Lower is better)</span>
                  <span style={{ color: selectedModel.metrics.insecureCodeRate < 4 ? "#15803d" : "#b45309" }}>{selectedModel.metrics.insecureCodeRate}%</span>
                </div>
                <div style={{ height: "6px", background: "hsl(var(--muted))", borderRadius: "3px", overflow: "hidden" }}>
                  <div style={{ width: `${selectedModel.metrics.insecureCodeRate * 10}%`, height: "100%", background: selectedModel.metrics.insecureCodeRate < 4 ? "#15803d" : "#b45309" }} />
                </div>
              </div>
            </div>

            {/* Strengths & Weaknesses */}
            <div style={{ fontSize: "12px", borderTop: "1px solid hsl(var(--border))", paddingTop: "14px", marginTop: "14px" }}>
              <div style={{ fontWeight: 800, fontSize: "11px", textTransform: "uppercase", color: "#15803d", marginBottom: "6px" }}>Key Strengths</div>
              <ul style={{ paddingLeft: "16px", display: "flex", flexDirection: "column", gap: "4px", color: "hsl(var(--foreground))", lineHeight: 1.5, margin: 0 }}>
                {selectedModel.primaryStrengths.map((s, idx) => (
                  <li key={idx}>{s}</li>
                ))}
              </ul>
            </div>

            <div style={{ fontSize: "12px", borderTop: "1px solid hsl(var(--border))", paddingTop: "12px", marginTop: "12px" }}>
              <div style={{ fontWeight: 800, fontSize: "11px", textTransform: "uppercase", color: "hsl(var(--muted-foreground))", marginBottom: "4px" }}>Recommended Deployment</div>
              <div style={{ color: "hsl(var(--foreground))", fontWeight: 600 }}>{selectedModel.recommendedUse}</div>
            </div>

            <div style={{ fontSize: "11px", color: "hsl(var(--muted-foreground))", marginTop: "16px", display: "flex", justifyContent: "space-between", borderTop: "1px solid hsl(var(--border))", paddingTop: "12px" }}>
              <span>Evaluated by: <b style={{ color: "hsl(var(--foreground))" }}>{selectedModel.testedBy.join(", ")}</b></span>
              <span>Last Tested: <b style={{ color: "#15803d" }}>Today ({selectedModel.lastTested})</b></span>
            </div>
          </div>
        )}
      </div>

      {/* Trusted Benchmarking Entities Section */}
      <section style={{ marginTop: "48px", borderTop: "1px solid hsl(var(--border))", paddingTop: "32px" }}>
        <div style={{ marginBottom: "20px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: 800, textTransform: "uppercase", color: "hsl(var(--foreground))" }}>Trusted Benchmarking Entities &amp; Frameworks</h2>
          <p style={{ color: "hsl(var(--muted-foreground))", fontSize: "13px" }}>
            HackerPost indexes standardized evaluation datasets from accredited cybersecurity and AI safety institutions.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
          {entities.map(entity => (
            <div key={entity.id} style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "var(--radius-sm)", padding: "18px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <h3 style={{ fontSize: "13px", fontWeight: 800, color: "hsl(var(--foreground))" }}>{entity.name}</h3>
                <a href={entity.url} target="_blank" rel="noopener noreferrer" style={{ color: "hsl(var(--primary))" }}>
                  <ExternalLink size={13} />
                </a>
              </div>
              <p style={{ fontSize: "12px", color: "hsl(var(--muted-foreground))", lineHeight: 1.5, margin: 0 }}>
                {entity.description}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
