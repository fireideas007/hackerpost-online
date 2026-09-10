"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ShieldCheck, 
  Award, 
  TrendingUp, 
  Search, 
  Filter, 
  ExternalLink, 
  ChevronUp, 
  ChevronDown, 
  Check, 
  Sparkles, 
  Building2, 
  Zap, 
  Layers, 
  Lock, 
  Cpu, 
  ArrowRight,
  PlusCircle,
  X,
  Send,
  HelpCircle,
  BarChart3
} from "lucide-react";

export default function LeaderboardPage() {
  const [vendors, setVendors] = useState([]);
  const [domains, setDomains] = useState([]);
  const [selectedDomain, setSelectedDomain] = useState("All Domains");
  const [sortBy, setSortBy] = useState("rank");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [totalVoters, setTotalVoters] = useState(1420);
  const [expandedVendorId, setExpandedVendorId] = useState(null);
  const [userVotes, setUserVotes] = useState({});
  const [votingId, setVotingId] = useState(null);
  
  // Nomination modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [nomForm, setNomForm] = useState({
    companyName: "",
    website: "",
    category: "Emerging High-Growth Startups",
    founderEmail: "",
    valuationOrFunding: "",
    differentiator: ""
  });
  const [nomSubmitting, setNomSubmitting] = useState(false);
  const [nomMessage, setNomMessage] = useState(null);

  // Load user previous votes from localStorage
  useEffect(() => {
    try {
      const savedVotes = localStorage.getItem("hackerpost_ciso_votes");
      if (savedVotes) {
        setUserVotes(JSON.parse(savedVotes));
      }
    } catch (_) {}
  }, []);

  // Fetch vendor data from API
  const fetchVendors = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedDomain && selectedDomain !== "All Domains") {
        params.append("category", selectedDomain);
      }
      if (sortBy) params.append("sort", sortBy);
      if (searchQuery.trim()) params.append("q", searchQuery.trim());

      const res = await fetch(`/api/vendors?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setVendors(data.vendors);
        if (data.domains) setDomains(data.domains);
        if (data.totalVoters) setTotalVoters(data.totalVoters);
      }
    } catch (err) {
      console.error("Failed to load vendor leaderboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, [selectedDomain, sortBy, searchQuery]);

  // Handle 1-click CISO endorsement
  const handleVote = async (vendorId, e) => {
    e.stopPropagation();
    if (userVotes[vendorId] || votingId === vendorId) return;

    try {
      setVotingId(vendorId);

      // Optimistic UI update
      setVendors(prev => prev.map(v => {
        if (v.id === vendorId) {
          return {
            ...v,
            upvotes: (v.upvotes || 0) + 1,
            endorsementsCount: (v.endorsementsCount || 0) + 1,
            cisoScore: Math.min(99.9, Math.round((v.cisoScore + 0.2) * 10) / 10)
          };
        }
        return v;
      }));

      const newVotes = { ...userVotes, [vendorId]: true };
      setUserVotes(newVotes);
      try {
        localStorage.setItem("hackerpost_ciso_votes", JSON.stringify(newVotes));
      } catch (_) {}

      // Server persistence
      const res = await fetch("/api/vendors/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vendorId, voteType: "up" })
      });
      const resData = await res.json();
      if (resData.success && resData.totalVoters) {
        setTotalVoters(resData.totalVoters);
      }
    } catch (err) {
      console.error("Error voting:", err);
    } finally {
      setVotingId(null);
    }
  };

  // Submit startup nomination
  const handleNominationSubmit = async (e) => {
    e.preventDefault();
    if (!nomForm.companyName.trim() || !nomForm.founderEmail.trim()) {
      setNomMessage({ type: "error", text: "Please enter Company Name and Submitter Email." });
      return;
    }

    try {
      setNomSubmitting(true);
      const res = await fetch("/api/vendors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nomForm)
      });
      const data = await res.json();
      if (data.success) {
        setNomMessage({ type: "success", text: "Nomination received! Our editorial team reviews submissions within 24 hours." });
        setNomForm({
          companyName: "",
          website: "",
          category: "Emerging High-Growth Startups",
          founderEmail: "",
          valuationOrFunding: "",
          differentiator: ""
        });
      } else {
        setNomMessage({ type: "error", text: data.message || "Failed to submit nomination." });
      }
    } catch (err) {
      setNomMessage({ type: "error", text: "Server error submitting nomination." });
    } finally {
      setNomSubmitting(false);
    }
  };

  const topThree = vendors.slice(0, 3);

  return (
    <div className="container" style={{ paddingBottom: "80px", paddingTop: "24px" }}>
      {/* Editorial Breadcrumb & Meta */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "hsl(var(--muted-foreground))" }}>
          <Link href="/" style={{ color: "inherit", textDecoration: "none" }}>HackerPost Home</Link>
          <span>/</span>
          <span style={{ color: "hsl(var(--foreground))", fontWeight: 600 }}>CISO Vendor Index</span>
          <span>/</span>
          <span>Q3 2026 Capability Matrix</span>
        </div>

        <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(21, 128, 61, 0.08)", color: "#15803d", padding: "4px 10px", borderRadius: "100px", fontSize: "11px", fontWeight: 700 }}>
          <span className="live-pulse-dot" style={{ background: "#15803d" }}></span>
          <span>VERIFIED CISO PEER RANKINGS · {totalVoters.toLocaleString()} VOTES TALLIED</span>
        </div>
      </div>

      {/* Header Banner */}
      <div style={{ borderBottom: "2px solid hsl(var(--foreground))", paddingBottom: "16px", marginBottom: "24px" }}>
        <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 800, lineHeight: 1.15, margin: "0 0 8px 0", letterSpacing: "-0.5px" }}>
          CISO Cybersecurity Capability Leaderboard
        </h1>
        <p style={{ margin: 0, fontSize: "14px", color: "hsl(var(--muted-foreground))", maxWidth: "850px", lineHeight: 1.5 }}>
          Peer-evaluated cybersecurity capability ratings and enterprise community endorsements. Ranked by autonomous threat remediation, false positive resistance, integration depth, and CISO community sentiment.
        </p>
      </div>

      {/* Hackproof Advisory Inbound Funnel */}
      <div className="hackproof-lead-box" style={{ 
        background: "linear-gradient(135deg, rgba(15, 54, 116, 0.04) 0%, rgba(15, 54, 116, 0.08) 100%)",
        border: "1px solid rgba(15, 54, 116, 0.2)",
        borderRadius: "var(--radius-sm)",
        padding: "16px 20px",
        marginBottom: "28px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "16px"
      }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "14px", maxWidth: "720px" }}>
          <div style={{ background: "hsl(var(--primary))", color: "#fff", width: "36px", height: "36px", borderRadius: "var(--radius-xs)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: "2px" }}>
            <ShieldCheck size={20} />
          </div>
          <div>
            <div style={{ fontSize: "13px", fontWeight: 700, color: "hsl(var(--primary))", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Enterprise Procurement Due Diligence
            </div>
            <div style={{ fontSize: "13px", color: "hsl(var(--foreground))", marginTop: "2px", lineHeight: 1.4 }}>
              <strong>Procuring enterprise security solutions?</strong> Hackproof Advisory provides vendor-neutral technical penetration testing, architecture gap analysis, and POC validation for CISOs.
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <Link href="/consult" style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            background: "hsl(var(--primary))",
            color: "#fff",
            padding: "8px 16px",
            borderRadius: "var(--radius-xs)",
            fontSize: "12px",
            fontWeight: 700,
            textDecoration: "none",
            whiteSpace: "nowrap"
          }}>
            <span>Book CISO Advisory</span>
            <ArrowRight size={14} />
          </Link>

          <button 
            onClick={() => setModalOpen(true)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              background: "transparent",
              color: "hsl(var(--foreground))",
              border: "1px solid hsl(var(--border))",
              padding: "8px 14px",
              borderRadius: "var(--radius-xs)",
              fontSize: "12px",
              fontWeight: 600,
              cursor: "pointer"
            }}
          >
            <PlusCircle size={14} />
            <span>Nominate Startup</span>
          </button>
        </div>
      </div>

      {/* Top 3 Spotlight Podium */}
      {selectedDomain === "All Domains" && !searchQuery && topThree.length === 3 && (
        <div style={{ marginBottom: "32px" }}>
          <div style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.6px", color: "hsl(var(--muted-foreground))", marginBottom: "12px" }}>
            Current Capability Podium · Top Enterprise Selections
          </div>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
            {topThree.map((v, idx) => {
              const badgeColors = [
                { bg: "#fef3c7", text: "#92400e", border: "#f59e0b", label: "GOLD MEDAL · #1 RANKED" },
                { bg: "#f1f5f9", text: "#475569", border: "#94a3b8", label: "SILVER MEDAL · #2 RANKED" },
                { bg: "#ffedd5", text: "#9a3412", border: "#f97316", label: "BRONZE MEDAL · #3 RANKED" }
              ];
              const badge = badgeColors[idx];

              return (
                <div key={v.id} style={{
                  background: "hsl(var(--card))",
                  border: `1px solid ${badge.border}`,
                  borderRadius: "var(--radius-sm)",
                  padding: "16px",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.03)"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                    <span style={{ 
                      fontSize: "10px", 
                      fontWeight: 800, 
                      padding: "2px 8px", 
                      borderRadius: "100px", 
                      background: badge.bg, 
                      color: badge.text,
                      border: `1px solid ${badge.border}` 
                    }}>
                      {badge.label}
                    </span>

                    <span style={{ fontSize: "11px", fontWeight: 700, color: "hsl(var(--muted-foreground))" }}>
                      {v.category.split("&")[0].trim()}
                    </span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                    <div style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "var(--radius-xs)",
                      background: "hsl(var(--foreground))",
                      color: "hsl(var(--background))",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 800,
                      fontSize: "14px"
                    }}>
                      {v.logoText}
                    </div>

                    <div>
                      <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700 }}>{v.name}</h3>
                      <div style={{ fontSize: "11px", color: "hsl(var(--muted-foreground))" }}>{v.valuationOrFunding}</div>
                    </div>

                    <div style={{ marginLeft: "auto", textAlign: "right" }}>
                      <div style={{ fontSize: "20px", fontWeight: 800, color: "hsl(var(--primary))", fontFamily: "var(--font-serif)" }}>
                        {v.cisoScore}
                      </div>
                      <div style={{ fontSize: "9px", color: "hsl(var(--muted-foreground))", textTransform: "uppercase" }}>Index Score</div>
                    </div>
                  </div>

                  <p style={{ fontSize: "12px", color: "hsl(var(--muted-foreground))", margin: "0 0 14px 0", lineHeight: 1.4 }}>
                    {v.primaryDifferentiator}
                  </p>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "10px", borderTop: "1px solid hsl(var(--border))" }}>
                    <span style={{ fontSize: "11px", color: "hsl(var(--muted-foreground))" }}>
                      <strong>{v.upvotes}</strong> CISO Endorsements
                    </span>

                    <button
                      onClick={(e) => handleVote(v.id, e)}
                      disabled={!!userVotes[v.id]}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        background: userVotes[v.id] ? "rgba(21, 128, 61, 0.1)" : "hsl(var(--foreground))",
                        color: userVotes[v.id] ? "#15803d" : "hsl(var(--background))",
                        border: userVotes[v.id] ? "1px solid #15803d" : "none",
                        padding: "5px 10px",
                        borderRadius: "var(--radius-xs)",
                        fontSize: "11px",
                        fontWeight: 700,
                        cursor: userVotes[v.id] ? "default" : "pointer"
                      }}
                    >
                      {userVotes[v.id] ? <Check size={12} /> : <ChevronUp size={12} />}
                      <span>{userVotes[v.id] ? "Endorsed" : "Endorse"}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filter Tabs & Search Controls */}
      <div style={{ 
        background: "hsl(var(--card))", 
        border: "1px solid hsl(var(--border))", 
        borderRadius: "var(--radius-sm)", 
        padding: "16px",
        marginBottom: "20px" 
      }}>
        {/* Domain Category Filter Tabs */}
        <div style={{ display: "flex", gap: "6px", overflowX: "auto", paddingBottom: "12px", borderBottom: "1px solid hsl(var(--border))", marginBottom: "14px" }}>
          {(domains.length > 0 ? domains : [
            "All Domains",
            "Cloud Security & DSPM",
            "Autonomous SOC & AI Defense",
            "Identity Threat Defense (ITDR)",
            "Endpoint Protection & XDR",
            "AppSec & DevSecOps",
            "Emerging High-Growth Startups"
          ]).map((dom) => (
            <button
              key={dom}
              onClick={() => setSelectedDomain(dom)}
              style={{
                background: selectedDomain === dom ? "hsl(var(--foreground))" : "transparent",
                color: selectedDomain === dom ? "hsl(var(--background))" : "hsl(var(--muted-foreground))",
                border: "1px solid " + (selectedDomain === dom ? "hsl(var(--foreground))" : "hsl(var(--border))"),
                borderRadius: "var(--radius-xs)",
                padding: "6px 12px",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "all 0.15s ease"
              }}
            >
              {dom}
            </button>
          ))}
        </div>

        {/* Search Bar & Sort Dropdowns */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: "1 1 260px", maxWidth: "420px" }}>
            <Search size={14} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "hsl(var(--muted-foreground))" }} />
            <input
              type="text"
              placeholder="Search vendor, capability, tag (e.g. DSPM, XDR, Wiz)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "7px 10px 7px 32px",
                borderRadius: "var(--radius-xs)",
                border: "1px solid hsl(var(--border))",
                background: "hsl(var(--background))",
                color: "hsl(var(--foreground))",
                fontSize: "12px"
              }}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "11px", color: "hsl(var(--muted-foreground))", fontWeight: 600 }}>SORT BY:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                padding: "6px 10px",
                borderRadius: "var(--radius-xs)",
                border: "1px solid hsl(var(--border))",
                background: "hsl(var(--background))",
                color: "hsl(var(--foreground))",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer"
              }}
            >
              <option value="rank">Overall CISO Rank</option>
              <option value="endorsements">Most CISO Endorsements</option>
              <option value="autonomy">Remediation Autonomy</option>
              <option value="precision">False Positive Resistance</option>
              <option value="integration">Enterprise Integration</option>
              <option value="value">Value / ROI Ratio</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Leaderboard Table Matrix */}
      <div style={{
        background: "hsl(var(--card))",
        border: "1px solid hsl(var(--border))",
        borderRadius: "var(--radius-sm)",
        overflow: "hidden"
      }}>
        {loading ? (
          <div style={{ padding: "48px 24px", textAlign: "center", color: "hsl(var(--muted-foreground))" }}>
            <div style={{ display: "inline-block", width: "24px", height: "24px", border: "2px solid hsl(var(--border))", borderTopColor: "hsl(var(--primary))", borderRadius: "50%", animation: "spin 0.8s linear infinite", marginBottom: "12px" }}></div>
            <div style={{ fontSize: "13px", fontWeight: 600 }}>Tallying verified CISO capability rankings...</div>
          </div>
        ) : vendors.length === 0 ? (
          <div style={{ padding: "48px 24px", textAlign: "center", color: "hsl(var(--muted-foreground))" }}>
            <Building2 size={32} style={{ margin: "0 auto 12px auto", opacity: 0.5 }} />
            <div style={{ fontSize: "14px", fontWeight: 600, color: "hsl(var(--foreground))" }}>No vendors match your search criteria.</div>
            <div style={{ fontSize: "12px", marginTop: "4px" }}>Try changing the domain filter or search keyword.</div>
            <button 
              onClick={() => { setSelectedDomain("All Domains"); setSearchQuery(""); }}
              style={{ marginTop: "12px", padding: "6px 12px", fontSize: "12px", borderRadius: "var(--radius-xs)", border: "1px solid hsl(var(--border))", background: "transparent", cursor: "pointer" }}
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
              <thead>
                <tr style={{ background: "rgba(0,0,0,0.02)", borderBottom: "1px solid hsl(var(--border))", color: "hsl(var(--muted-foreground))", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  <th style={{ padding: "12px 16px", width: "70px" }}>Rank</th>
                  <th style={{ padding: "12px 16px" }}>Company / Platform</th>
                  <th style={{ padding: "12px 16px" }}>Domain Category</th>
                  <th style={{ padding: "12px 16px", width: "220px" }}>Capability Scorecard</th>
                  <th style={{ padding: "12px 16px", textAlign: "center", width: "110px" }}>CISO Index</th>
                  <th style={{ padding: "12px 16px", textAlign: "right", width: "160px" }}>CISO Voting</th>
                </tr>
              </thead>
              <tbody>
                {vendors.map((v) => {
                  const isExpanded = expandedVendorId === v.id;
                  const isEndorsed = !!userVotes[v.id];

                  return (
                    <tr 
                      key={v.id}
                      onClick={() => setExpandedVendorId(isExpanded ? null : v.id)}
                      style={{ 
                        borderBottom: "1px solid hsl(var(--border))",
                        background: isExpanded ? "rgba(15, 54, 116, 0.02)" : "transparent",
                        cursor: "pointer",
                        transition: "background 0.15s ease"
                      }}
                      className="vendor-table-row"
                    >
                      {/* Rank */}
                      <td style={{ padding: "14px 16px", fontWeight: 800, color: v.rank <= 3 ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))", fontSize: "14px" }}>
                        #{v.rank}
                      </td>

                      {/* Company Name & Stage */}
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "var(--radius-xs)",
                            background: "hsl(var(--foreground))",
                            color: "hsl(var(--background))",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 800,
                            fontSize: "12px",
                            flexShrink: 0
                          }}>
                            {v.logoText}
                          </div>

                          <div>
                            <div style={{ fontWeight: 700, color: "hsl(var(--foreground))", display: "flex", alignItems: "center", gap: "6px" }}>
                              <span>{v.name}</span>
                              {v.verifiedCisoChoice && (
                                <span title="Verified CISO Choice (Top Decile Endorsement)" style={{ color: "#15803d", display: "inline-flex" }}>
                                  <ShieldCheck size={14} />
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: "11px", color: "hsl(var(--muted-foreground))" }}>
                              {v.valuationOrFunding} · {v.headquarters}
                            </div>
                          </div>
                        </div>

                        {/* Expandable summary snippet if clicked */}
                        {isExpanded && (
                          <div style={{ marginTop: "12px", padding: "12px", background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "var(--radius-xs)", fontSize: "12px", lineHeight: 1.5 }}>
                            <div style={{ fontWeight: 700, color: "hsl(var(--foreground))", marginBottom: "4px" }}>CISO Executive Verdict:</div>
                            <p style={{ margin: "0 0 8px 0", color: "hsl(var(--muted-foreground))" }}>{v.cisoVerdict}</p>
                            
                            <div style={{ fontWeight: 700, color: "hsl(var(--foreground))", marginBottom: "4px" }}>Core Technical Differentiator:</div>
                            <p style={{ margin: "0 0 10px 0", color: "hsl(var(--muted-foreground))" }}>{v.primaryDifferentiator}</p>

                            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                              {v.tags?.map(tag => (
                                <span key={tag} style={{ fontSize: "10px", fontWeight: 600, padding: "2px 8px", background: "rgba(0,0,0,0.05)", borderRadius: "100px", color: "hsl(var(--muted-foreground))" }}>
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Domain */}
                      <td style={{ padding: "14px 16px" }}>
                        <span style={{ 
                          fontSize: "11px", 
                          fontWeight: 600, 
                          padding: "3px 8px", 
                          borderRadius: "var(--radius-xs)", 
                          background: "rgba(15, 54, 116, 0.06)", 
                          color: "hsl(var(--primary))",
                          whiteSpace: "nowrap"
                        }}>
                          {v.category}
                        </span>
                      </td>

                      {/* Micro Capability Meters */}
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px" }}>
                            <span style={{ color: "hsl(var(--muted-foreground))" }}>Autonomy:</span>
                            <strong>{v.autonomyScore}%</strong>
                          </div>
                          <div style={{ width: "100%", height: "4px", background: "rgba(0,0,0,0.06)", borderRadius: "2px", overflow: "hidden" }}>
                            <div style={{ width: `${v.autonomyScore}%`, height: "100%", background: "#15803d" }}></div>
                          </div>

                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px" }}>
                            <span style={{ color: "hsl(var(--muted-foreground))" }}>Precision:</span>
                            <strong>{v.precisionScore}%</strong>
                          </div>
                          <div style={{ width: "100%", height: "4px", background: "rgba(0,0,0,0.06)", borderRadius: "2px", overflow: "hidden" }}>
                            <div style={{ width: `${v.precisionScore}%`, height: "100%", background: "#0f3674" }}></div>
                          </div>
                        </div>
                      </td>

                      {/* CISO Composite Index */}
                      <td style={{ padding: "14px 16px", textAlign: "center" }}>
                        <div style={{ 
                          display: "inline-block", 
                          padding: "4px 10px", 
                          borderRadius: "var(--radius-xs)", 
                          background: v.cisoScore >= 90 ? "rgba(21, 128, 61, 0.08)" : "rgba(15, 54, 116, 0.06)",
                          color: v.cisoScore >= 90 ? "#15803d" : "hsl(var(--primary))",
                          fontFamily: "var(--font-serif)",
                          fontSize: "15px",
                          fontWeight: 800
                        }}>
                          {v.cisoScore}
                        </div>
                      </td>

                      {/* CISO Voting & Endorsement Button */}
                      <td style={{ padding: "14px 16px", textAlign: "right" }}>
                        <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
                          <button
                            onClick={(e) => handleVote(v.id, e)}
                            disabled={isEndorsed || votingId === v.id}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "6px",
                              background: isEndorsed ? "rgba(21, 128, 61, 0.1)" : "hsl(var(--foreground))",
                              color: isEndorsed ? "#15803d" : "hsl(var(--background))",
                              border: isEndorsed ? "1px solid #15803d" : "none",
                              padding: "6px 12px",
                              borderRadius: "var(--radius-xs)",
                              fontSize: "11px",
                              fontWeight: 700,
                              cursor: isEndorsed ? "default" : "pointer",
                              transition: "all 0.15s ease",
                              whiteSpace: "nowrap"
                            }}
                          >
                            {isEndorsed ? <Check size={12} /> : <ChevronUp size={12} />}
                            <span>{isEndorsed ? "Endorsed" : "Endorse"}</span>
                          </button>

                          <div style={{ fontSize: "10px", color: "hsl(var(--muted-foreground))" }}>
                            ▲ {v.upvotes} CISO Votes
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Corporate Methodology & Sponsorship Footer Box */}
      <div style={{ 
        marginTop: "32px", 
        borderTop: "1px solid hsl(var(--border))", 
        paddingTop: "24px",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: "24px"
      }}>
        <div>
          <h4 style={{ fontSize: "13px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 8px 0" }}>
            Evaluation Methodology
          </h4>
          <p style={{ fontSize: "12px", color: "hsl(var(--muted-foreground))", lineHeight: 1.5, margin: 0 }}>
            Rankings are updated dynamically based on real-time enterprise telemetry and peer voting. Composite score is 65% weighted by validated technical benchmarks (Autonomy, False-Positive Resistance, Integration Depth, and ROI) and 35% by verified executive CISO endorsements.
          </p>
        </div>

        <div>
          <h4 style={{ fontSize: "13px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 8px 0" }}>
            Vendor Profile Claim &amp; PR Wire
          </h4>
          <p style={{ fontSize: "12px", color: "hsl(var(--muted-foreground))", lineHeight: 1.5, margin: "0 0 10px 0" }}>
            Are you a cybersecurity founder or corporate communications director? Claim your company profile to add verified technical whitepapers, or syndicate news releases to our executive subscriber base.
          </p>
          <div style={{ display: "flex", gap: "10px" }}>
            <Link href="/advertise" style={{ fontSize: "12px", fontWeight: 700, color: "hsl(var(--primary))", textDecoration: "none" }}>
              Media Kit &amp; Wire Placement →
            </Link>
            <span style={{ color: "hsl(var(--border))" }}>|</span>
            <Link href="/consult" style={{ fontSize: "12px", fontWeight: 700, color: "hsl(var(--primary))", textDecoration: "none" }}>
              Request Independent Audit →
            </Link>
          </div>
        </div>
      </div>

      {/* Nomination Modal */}
      {modalOpen && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.5)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
          zIndex: 9999
        }}>
          <div style={{
            background: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "var(--radius-sm)",
            width: "100%",
            maxWidth: "520px",
            padding: "24px",
            boxShadow: "0 12px 32px rgba(0,0,0,0.15)",
            position: "relative"
          }}>
            <button
              onClick={() => { setModalOpen(false); setNomMessage(null); }}
              style={{ position: "absolute", top: "16px", right: "16px", background: "none", border: "none", cursor: "pointer", color: "hsl(var(--muted-foreground))" }}
            >
              <X size={18} />
            </button>

            <h3 style={{ margin: "0 0 4px 0", fontSize: "18px", fontWeight: 800, fontFamily: "var(--font-serif)" }}>
              Nominate a Cybersecurity Startup
            </h3>
            <p style={{ margin: "0 0 16px 0", fontSize: "12px", color: "hsl(var(--muted-foreground))" }}>
              Submit an emerging security venture or claim an existing platform for inclusion in the HackerPost CISO Index.
            </p>

            {nomMessage && (
              <div style={{
                padding: "10px 12px",
                borderRadius: "var(--radius-xs)",
                fontSize: "12px",
                fontWeight: 600,
                marginBottom: "14px",
                background: nomMessage.type === "success" ? "rgba(21, 128, 61, 0.1)" : "rgba(220, 38, 38, 0.1)",
                color: nomMessage.type === "success" ? "#15803d" : "#dc2626",
                border: `1px solid ${nomMessage.type === "success" ? "#15803d" : "#dc2626"}`
              }}>
                {nomMessage.text}
              </div>
            )}

            <form onSubmit={handleNominationSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", marginBottom: "4px" }}>
                  Company Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Security"
                  value={nomForm.companyName}
                  onChange={(e) => setNomForm({ ...nomForm, companyName: e.target.value })}
                  style={{ width: "100%", padding: "8px 10px", borderRadius: "var(--radius-xs)", border: "1px solid hsl(var(--border))", background: "hsl(var(--background))", color: "hsl(var(--foreground))", fontSize: "12px" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", marginBottom: "4px" }}>
                    Website URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://company.com"
                    value={nomForm.website}
                    onChange={(e) => setNomForm({ ...nomForm, website: e.target.value })}
                    style={{ width: "100%", padding: "8px 10px", borderRadius: "var(--radius-xs)", border: "1px solid hsl(var(--border))", background: "hsl(var(--background))", color: "hsl(var(--foreground))", fontSize: "12px" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", marginBottom: "4px" }}>
                    Category Domain
                  </label>
                  <select
                    value={nomForm.category}
                    onChange={(e) => setNomForm({ ...nomForm, category: e.target.value })}
                    style={{ width: "100%", padding: "8px 10px", borderRadius: "var(--radius-xs)", border: "1px solid hsl(var(--border))", background: "hsl(var(--background))", color: "hsl(var(--foreground))", fontSize: "12px" }}
                  >
                    <option>Emerging High-Growth Startups</option>
                    <option>Cloud Security & DSPM</option>
                    <option>Autonomous SOC & AI Defense</option>
                    <option>Identity Threat Defense (ITDR)</option>
                    <option>Endpoint Protection & XDR</option>
                    <option>AppSec & DevSecOps</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", marginBottom: "4px" }}>
                    Submitter Work Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="founder@company.com"
                    value={nomForm.founderEmail}
                    onChange={(e) => setNomForm({ ...nomForm, founderEmail: e.target.value })}
                    style={{ width: "100%", padding: "8px 10px", borderRadius: "var(--radius-xs)", border: "1px solid hsl(var(--border))", background: "hsl(var(--background))", color: "hsl(var(--foreground))", fontSize: "12px" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", marginBottom: "4px" }}>
                    Funding / Valuation
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. $15M Series A"
                    value={nomForm.valuationOrFunding}
                    onChange={(e) => setNomForm({ ...nomForm, valuationOrFunding: e.target.value })}
                    style={{ width: "100%", padding: "8px 10px", borderRadius: "var(--radius-xs)", border: "1px solid hsl(var(--border))", background: "hsl(var(--background))", color: "hsl(var(--foreground))", fontSize: "12px" }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", marginBottom: "4px" }}>
                  Primary Technical Differentiator
                </label>
                <textarea
                  rows={3}
                  placeholder="Explain why this platform outperforms legacy competitors in autonomous remediation, false positive reduction, or integration speed..."
                  value={nomForm.differentiator}
                  onChange={(e) => setNomForm({ ...nomForm, differentiator: e.target.value })}
                  style={{ width: "100%", padding: "8px 10px", borderRadius: "var(--radius-xs)", border: "1px solid hsl(var(--border))", background: "hsl(var(--background))", color: "hsl(var(--foreground))", fontSize: "12px", resize: "vertical" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" }}>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  style={{ padding: "8px 14px", borderRadius: "var(--radius-xs)", border: "1px solid hsl(var(--border))", background: "transparent", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={nomSubmitting}
                  style={{ padding: "8px 18px", borderRadius: "var(--radius-xs)", border: "none", background: "hsl(var(--primary))", color: "#fff", fontSize: "12px", fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px" }}
                >
                  {nomSubmitting ? "Submitting..." : "Submit Nomination"}
                  <Send size={12} />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
