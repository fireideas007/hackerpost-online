"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { 
  Sparkles, 
  Send, 
  CheckCircle2, 
  Rocket, 
  Award, 
  Users, 
  TrendingUp, 
  ShieldCheck, 
  DollarSign, 
  Clock, 
  Check, 
  ExternalLink, 
  Flame, 
  FileText,
  Building,
  CreditCard,
  Layers,
  ChevronRight,
  ArrowRight
} from "lucide-react";

function AdvertiseContent() {
  const searchParams = useSearchParams();
  const initialTier = searchParams.get("tier") || "Spotlight";

  const [selectedTier, setSelectedTier] = useState(initialTier);
  const [impressionsSlider, setImpressionsSlider] = useState(25000);

  const [form, setForm] = useState({
    companyName: "",
    contactName: "",
    contactEmail: "",
    website: "",
    title: "",
    summary: "",
    pressReleaseUrl: "",
    category: "SecTech & Startups",
    tier: initialTier,
    paymentMethod: "invoice",
    type: "sponsorship"
  });

  const [submitting, setSubmitting] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const tiers = [
    {
      id: "Free",
      name: "Standard Wire",
      price: "$0",
      period: "queued",
      badge: "Community",
      desc: "Basic editorial submission queued for discretionary newsroom review.",
      features: [
        "Standard editorial queue (3-5 business days)",
        "Organic syndication if selected",
        "Community feed attribution",
        "No guaranteed placement"
      ]
    },
    {
      id: "FastTrack",
      name: "Verified PR Wire",
      price: "$299",
      period: "one-time",
      badge: "Fast-Track",
      desc: "Guaranteed 2-hour publishing and Google News indexing for funding & product launches.",
      features: [
        "Guaranteed 2-hour publishing turnaround",
        "Google News & CISO feed syndication",
        "Permanent do-follow corporate backlink",
        "Verified SecTech editorial badge",
        "Syndication to HackerPost X wire"
      ]
    },
    {
      id: "Spotlight",
      name: "CISO Executive Spotlight",
      price: "$699",
      period: "one-time",
      badge: "Most Popular",
      highlight: true,
      desc: "Prime front-page hero placement and direct delivery to 48,000+ CISO subscribers.",
      features: [
        "Hero Spotlight on HackerPost for 48 hours",
        "Direct delivery in CISO Morning Dispatch newsletter",
        "Executive Q&A or Technical Deep-Dive synthesis",
        "Social broadcast across all syndication channels",
        "Detailed executive engagement analytics report"
      ]
    },
    {
      id: "Takeover",
      name: "Category Exclusivity",
      price: "$1,299",
      period: "/ month",
      badge: "High Intent",
      desc: "Exclusive header banner and sponsor attribution across entire threat category.",
      features: [
        "Exclusive banner on Zero-Days or AI Benchmark pages",
        "Direct outbound CISO click tracking",
        "Guaranteed 100,000+ monthly targeted views",
        "2 Sponsored Press Releases included per month",
        "Dedicated account manager & fast-track desk"
      ]
    }
  ];

  const handleTierSelect = (tierId) => {
    setSelectedTier(tierId);
    setForm(prev => ({ ...prev, tier: tierId }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!form.contactEmail.includes("@")) {
      setErrorMessage("Please provide a valid corporate work email.");
      return;
    }

    if (!form.title || form.title.length < 5) {
      setErrorMessage("Please provide a descriptive campaign headline (minimum 5 characters).");
      return;
    }

    if (!form.summary || form.summary.length < 20) {
      setErrorMessage("Please provide campaign details or press release text (minimum 20 characters).");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          tier: selectedTier
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccessData(data);
      } else {
        setErrorMessage(data.error || "Failed to process sponsorship booking. Please retry.");
      }
    } catch (_) {
      setErrorMessage("Network error. Please check your connectivity and retry.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container" style={{ padding: "40px 0 100px 0", maxWidth: "1160px" }}>
      {/* Top Breadcrumb */}
      <div style={{ marginBottom: "20px" }}>
        <Link href="/" className="btn btn-secondary" style={{ fontSize: "12px", display: "inline-flex", alignItems: "center", gap: "6px" }}>
          ← Back to Threat Feed
        </Link>
      </div>

      {/* Hero Header */}
      <div style={{
        background: "hsl(var(--muted))",
        border: "1px solid hsl(var(--border))",
        borderRadius: "var(--radius-md)",
        padding: "40px 32px",
        marginBottom: "36px",
        textAlign: "center"
      }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", padding: "4px 12px", borderRadius: "var(--radius-xs)", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "hsl(var(--primary))", marginBottom: "14px" }}>
          HackerPost Executive Media Kit &amp; Wire Distribution
        </div>

        <h1 style={{ fontSize: "32px", fontWeight: 800, lineHeight: 1.2, marginBottom: "12px", letterSpacing: "-0.5px", color: "hsl(var(--foreground))" }}>
          Reach 48,000+ Enterprise CISOs &amp; Security Leaders
        </h1>

        <p style={{ fontSize: "15px", color: "hsl(var(--muted-foreground))", maxWidth: "760px", margin: "0 auto 28px auto", lineHeight: 1.6 }}>
          HackerPost is the authoritative threat wire where Chief Information Security Officers, security researchers, and enterprise architects look every morning. 
          Publish your venture funding, product breakthrough, or security benchmark with guaranteed corporate distribution.
        </p>

        {/* Audience Metrics */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "16px",
          background: "hsl(var(--card))",
          border: "1px solid hsl(var(--border))",
          borderRadius: "var(--radius-sm)",
          padding: "20px",
          maxWidth: "960px",
          margin: "0 auto"
        }}>
          <div>
            <div style={{ fontSize: "24px", fontWeight: 800, color: "hsl(var(--primary))", fontFamily: "var(--font-mono)" }}>48,000+</div>
            <div style={{ fontSize: "12px", fontWeight: 700, marginTop: "2px" }}>CISO Subscribers</div>
            <div style={{ fontSize: "11px", color: "hsl(var(--muted-foreground))" }}>Morning Dispatch Readers</div>
          </div>
          <div>
            <div style={{ fontSize: "24px", fontWeight: 800, color: "hsl(var(--warning))", fontFamily: "var(--font-mono)" }}>180,000+</div>
            <div style={{ fontSize: "12px", fontWeight: 700, marginTop: "2px" }}>Monthly Advisory Hits</div>
            <div style={{ fontSize: "11px", color: "hsl(var(--muted-foreground))" }}>CVE &amp; Threat Lookups</div>
          </div>
          <div>
            <div style={{ fontSize: "24px", fontWeight: 800, color: "hsl(var(--success))", fontFamily: "var(--font-mono)" }}>840+</div>
            <div style={{ fontSize: "12px", fontWeight: 700, marginTop: "2px" }}>SecTech Startups Tracked</div>
            <div style={{ fontSize: "11px", color: "hsl(var(--muted-foreground))" }}>Venture Funding Index</div>
          </div>
          <div>
            <div style={{ fontSize: "24px", fontWeight: 800, color: "hsl(var(--foreground))", fontFamily: "var(--font-mono)" }}>94%</div>
            <div style={{ fontSize: "12px", fontWeight: 700, marginTop: "2px" }}>Enterprise Decision Makers</div>
            <div style={{ fontSize: "11px", color: "hsl(var(--muted-foreground))" }}>Fortune 500 &amp; Global 2000</div>
          </div>
        </div>
      </div>

      {/* Pricing & Packages Grid */}
      <div style={{ marginBottom: "50px" }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <h2 style={{ fontSize: "28px", fontWeight: 800, marginBottom: "8px" }}>
            Transparent Self-Serve Packages
          </h2>
          <p style={{ fontSize: "14px", color: "hsl(var(--muted-foreground))" }}>
            No endless sales demos. Instant booking with corporate invoicing or credit card checkout.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px" }}>
          {tiers.map((tier) => {
            const isSelected = selectedTier === tier.id;
            return (
              <div
                key={tier.id}
                onClick={() => handleTierSelect(tier.id)}
                style={{
                  background: isSelected ? "linear-gradient(180deg, hsla(var(--primary), 0.1) 0%, hsl(var(--card)) 100%)" : "hsl(var(--card))",
                  border: isSelected ? "2px solid hsl(var(--primary))" : tier.highlight ? "1px solid hsla(var(--primary), 0.4)" : "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius-md)",
                  padding: "24px",
                  display: "flex",
                  flexDirection: "column",
                  position: "relative",
                  cursor: "pointer",
                  transition: "transform 0.2s ease, border-color 0.2s ease",
                  boxShadow: isSelected ? "0 8px 24px hsla(var(--primary), 0.2)" : "var(--shadow-sm)"
                }}
              >
                {tier.badge && (
                  <div style={{
                    position: "absolute",
                    top: "12px",
                    right: "12px",
                    background: tier.highlight ? "hsl(var(--primary))" : "hsla(var(--muted), 0.4)",
                    color: tier.highlight ? "#000" : "hsl(var(--foreground))",
                    fontSize: "10px",
                    fontWeight: 800,
                    textTransform: "uppercase",
                    padding: "3px 8px",
                    borderRadius: "100px"
                  }}>
                    {tier.badge}
                  </div>
                )}

                <h3 style={{ fontSize: "17px", fontWeight: 800, marginBottom: "6px" }}>{tier.name}</h3>
                <div style={{ display: "flex", alignItems: "baseline", gap: "4px", marginBottom: "12px" }}>
                  <span style={{ fontSize: "32px", fontWeight: 900, fontFamily: "var(--font-mono)", color: "hsl(var(--foreground))" }}>
                    {tier.price}
                  </span>
                  <span style={{ fontSize: "12px", color: "hsl(var(--muted-foreground))" }}>{tier.period}</span>
                </div>

                <p style={{ fontSize: "12px", color: "hsl(var(--muted-foreground))", lineHeight: 1.5, marginBottom: "20px", minHeight: "36px" }}>
                  {tier.desc}
                </p>

                <div style={{ borderTop: "1px solid hsl(var(--border))", paddingTop: "16px", marginBottom: "20px", flexGrow: 1 }}>
                  <div style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "hsl(var(--muted-foreground))", marginBottom: "10px" }}>
                    Included Features:
                  </div>
                  <ul style={{ padding: 0, margin: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "8px" }}>
                    {tier.features.map((feat, idx) => (
                      <li key={idx} style={{ fontSize: "12px", display: "flex", alignItems: "flex-start", gap: "8px" }}>
                        <Check size={14} style={{ color: "hsl(var(--primary))", marginTop: "2px", flexShrink: 0 }} />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={() => handleTierSelect(tier.id)}
                  className={`btn ${isSelected ? "btn-primary" : "btn-secondary"}`}
                  style={{ width: "100%", fontSize: "12px", fontWeight: 700 }}
                >
                  {isSelected ? "Selected ✓" : "Select Package"}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive CISO Reach & ROI Calculator */}
      <div style={{
        background: "hsl(var(--card))",
        border: "1px solid hsl(var(--border))",
        borderRadius: "var(--radius-md)",
        padding: "32px",
        marginBottom: "50px"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
          <TrendingUp size={20} style={{ color: "hsl(var(--primary))" }} />
          <h3 style={{ fontSize: "18px", fontWeight: 800 }}>Interactive CISO Reach &amp; Enterprise Pipeline Calculator</h3>
        </div>

        <p style={{ fontSize: "13px", color: "hsl(var(--muted-foreground))", marginBottom: "24px" }}>
          Estimate your enterprise audience impressions and potential CISO pipeline reach on HackerPost.online:
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "32px", alignItems: "center" }}>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <span style={{ fontSize: "13px", fontWeight: 700 }}>Desired Monthly CISO Impressions</span>
              <span style={{ fontSize: "14px", fontWeight: 800, fontFamily: "var(--font-mono)", color: "hsl(var(--primary))" }}>
                {impressionsSlider.toLocaleString()} impressions
              </span>
            </div>
            <input
              type="range"
              min="5000"
              max="150000"
              step="5000"
              value={impressionsSlider}
              onChange={(e) => setImpressionsSlider(Number(e.target.value))}
              style={{ width: "100%", accentColor: "hsl(var(--primary))" }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "hsl(var(--muted-foreground))", marginTop: "4px" }}>
              <span>5,000</span>
              <span>75,000</span>
              <span>150,000+</span>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", background: "hsla(var(--primary), 0.05)", border: "1px solid hsla(var(--primary), 0.2)", borderRadius: "var(--radius-sm)", padding: "16px" }}>
            <div>
              <div style={{ fontSize: "11px", textTransform: "uppercase", color: "hsl(var(--muted-foreground))", fontWeight: 700 }}>Estimated CISO Engagements</div>
              <div style={{ fontSize: "22px", fontWeight: 900, color: "hsl(var(--foreground))", fontFamily: "var(--font-mono)" }}>
                {Math.round(impressionsSlider * 0.045).toLocaleString()}
              </div>
            </div>
            <div>
              <div style={{ fontSize: "11px", textTransform: "uppercase", color: "hsl(var(--muted-foreground))", fontWeight: 700 }}>Avg Enterprise Pipeline</div>
              <div style={{ fontSize: "22px", fontWeight: 900, color: "hsl(var(--success))", fontFamily: "var(--font-mono)" }}>
                ${Math.round(impressionsSlider * 0.85).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Form & Self-Serve Checkout */}
      <div style={{
        background: "hsl(var(--card))",
        border: "1px solid hsl(var(--border))",
        borderRadius: "var(--radius-md)",
        padding: "36px",
        boxShadow: "var(--shadow-md)"
      }}>
        {successData ? (
          <div style={{ textAlign: "center", padding: "30px 0" }}>
            <CheckCircle2 size={56} style={{ color: "hsl(var(--success))", margin: "0 auto 16px auto" }} />
            <h2 style={{ fontSize: "26px", fontWeight: 800, marginBottom: "12px" }}>
              Sponsorship &amp; PR Order Confirmed!
            </h2>
            <p style={{ fontSize: "15px", color: "hsl(var(--muted-foreground))", maxWidth: "600px", margin: "0 auto 20px auto", lineHeight: 1.6 }}>
              {successData.message}
            </p>

            <div style={{
              background: "hsla(var(--primary), 0.08)",
              border: "1px solid hsla(var(--primary), 0.3)",
              borderRadius: "var(--radius-sm)",
              padding: "16px",
              maxWidth: "500px",
              margin: "0 auto 24px auto",
              fontFamily: "var(--font-mono)",
              fontSize: "13px"
            }}>
              <div>Submission ID: <b>{successData.submissionId}</b></div>
              <div>Selected Tier: <b>{selectedTier}</b></div>
              <div>Review SLA: <b>Guaranteed within 2 Hours</b></div>
            </div>

            <Link href="/" className="btn btn-primary" style={{ padding: "12px 28px", fontSize: "14px" }}>
              Return to Live Wire
            </Link>
          </div>
        ) : (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
              <div>
                <h3 style={{ fontSize: "22px", fontWeight: 800, marginBottom: "4px" }}>
                  Instant Inbound Submission &amp; Invoice Request
                </h3>
                <p style={{ fontSize: "13px", color: "hsl(var(--muted-foreground))", margin: 0 }}>
                  Selected Package: <b style={{ color: "hsl(var(--primary))" }}>{tiers.find(t => t.id === selectedTier)?.name} ({tiers.find(t => t.id === selectedTier)?.price})</b>
                </p>
              </div>

              <div style={{ display: "flex", gap: "8px" }}>
                <span style={{ fontSize: "11px", fontWeight: 700, padding: "4px 10px", borderRadius: "var(--radius-sm)", background: "hsla(var(--success), 0.15)", color: "hsl(var(--success))" }}>
                  ⚡ Instant Queue
                </span>
                <span style={{ fontSize: "11px", fontWeight: 700, padding: "4px 10px", borderRadius: "var(--radius-sm)", background: "hsla(var(--primary), 0.15)", color: "hsl(var(--primary))" }}>
                  Google News Indexed
                </span>
              </div>
            </div>

            {errorMessage && (
              <div style={{ background: "hsla(var(--danger), 0.1)", border: "1px solid hsl(var(--danger))", color: "hsl(var(--danger))", padding: "12px 16px", borderRadius: "var(--radius-sm)", fontSize: "13px", marginBottom: "20px" }}>
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "hsl(var(--muted-foreground))", marginBottom: "6px" }}>
                    Company / Vendor Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Wiz, Cyera, Snyk, etc."
                    value={form.companyName}
                    onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", background: "hsl(var(--background))", border: "1px solid hsl(var(--border))", borderRadius: "var(--radius-sm)", color: "hsl(var(--foreground))", fontSize: "13px" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "hsl(var(--muted-foreground))", marginBottom: "6px" }}>
                    Corporate Website URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://yourcompany.com"
                    value={form.website}
                    onChange={(e) => setForm({ ...form, website: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", background: "hsl(var(--background))", border: "1px solid hsl(var(--border))", borderRadius: "var(--radius-sm)", color: "hsl(var(--foreground))", fontSize: "13px" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "hsl(var(--muted-foreground))", marginBottom: "6px" }}>
                    Contact Name &amp; Role *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Jane Smith (VP Marketing / PR Lead)"
                    value={form.contactName}
                    onChange={(e) => setForm({ ...form, contactName: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", background: "hsl(var(--background))", border: "1px solid hsl(var(--border))", borderRadius: "var(--radius-sm)", color: "hsl(var(--foreground))", fontSize: "13px" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "hsl(var(--muted-foreground))", marginBottom: "6px" }}>
                    Corporate Work Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="press@yourcompany.com"
                    value={form.contactEmail}
                    onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", background: "hsl(var(--background))", border: "1px solid hsl(var(--border))", borderRadius: "var(--radius-sm)", color: "hsl(var(--foreground))", fontSize: "13px" }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "hsl(var(--muted-foreground))", marginBottom: "6px" }}>
                  Press Release / Announcement Headline *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Security Raises $35M Series B to Transform Cloud Identity Defense"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  style={{ width: "100%", padding: "10px 14px", background: "hsl(var(--background))", border: "1px solid hsl(var(--border))", borderRadius: "var(--radius-sm)", color: "hsl(var(--foreground))", fontSize: "13px" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "hsl(var(--muted-foreground))", marginBottom: "6px" }}>
                    Sector Category
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", background: "hsl(var(--background))", border: "1px solid hsl(var(--border))", borderRadius: "var(--radius-sm)", color: "hsl(var(--foreground))", fontSize: "13px" }}
                  >
                    <option value="SecTech & Startups">SecTech &amp; Startups</option>
                    <option value="M&A & Funding">M&amp;A &amp; Funding</option>
                    <option value="AI Benchmarks">AI Benchmarks &amp; Red-Teaming</option>
                    <option value="Zero-Days">Zero-Day Defense</option>
                    <option value="Advisories">Enterprise Advisory</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "hsl(var(--muted-foreground))", marginBottom: "6px" }}>
                    Existing PR Link / Pitch Deck URL (Optional)
                  </label>
                  <input
                    type="url"
                    placeholder="https://prnewswire.com/... or Google Doc link"
                    value={form.pressReleaseUrl}
                    onChange={(e) => setForm({ ...form, pressReleaseUrl: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", background: "hsl(var(--background))", border: "1px solid hsl(var(--border))", borderRadius: "var(--radius-sm)", color: "hsl(var(--foreground))", fontSize: "13px" }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "hsl(var(--muted-foreground))", marginBottom: "6px" }}>
                  Press Release Content &amp; Strategic Takeaway *
                </label>
                <textarea
                  rows={5}
                  required
                  placeholder="Paste your press release text, key quotes from founders, lead investors, and technical differentiators..."
                  value={form.summary}
                  onChange={(e) => setForm({ ...form, summary: e.target.value })}
                  style={{ width: "100%", padding: "10px 14px", background: "hsl(var(--background))", border: "1px solid hsl(var(--border))", borderRadius: "var(--radius-sm)", color: "hsl(var(--foreground))", fontSize: "13px", resize: "vertical" }}
                />
              </div>

              {/* Payment Method Preference */}
              {selectedTier !== "Free" && (
                <div style={{ background: "hsla(var(--muted), 0.3)", padding: "16px", borderRadius: "var(--radius-sm)" }}>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "hsl(var(--muted-foreground))", marginBottom: "8px" }}>
                    Payment &amp; Invoicing Preference
                  </label>
                  <div style={{ display: "flex", gap: "20px" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", cursor: "pointer" }}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="invoice"
                        checked={form.paymentMethod === "invoice"}
                        onChange={() => setForm({ ...form, paymentMethod: "invoice" })}
                      />
                      <span>Corporate Net-30 Invoice (Auto-Sent to Email)</span>
                    </label>
                    <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", cursor: "pointer" }}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="card"
                        checked={form.paymentMethod === "card"}
                        onChange={() => setForm({ ...form, paymentMethod: "card" })}
                      />
                      <span>Instant Corporate Card Checkout (Stripe)</span>
                    </label>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary"
                style={{ padding: "14px", fontSize: "14px", fontWeight: 800, marginTop: "8px" }}
              >
                {submitting ? "Processing Inbound Wire..." : `Submit Campaign for ${selectedTier} Package →`}
              </button>

              <div style={{ fontSize: "11px", color: "hsl(var(--muted-foreground))", textAlign: "center" }}>
                🔒 HackerPost Editorial Standards Apply · 100% Inbound Verification · No Outbound Sales Pressure
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdvertisePage() {
  return (
    <Suspense fallback={<div className="container" style={{ padding: "60px 0", textAlign: "center" }}>Loading HackerPost Media Kit...</div>}>
      <AdvertiseContent />
    </Suspense>
  );
}
