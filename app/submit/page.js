"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { 
  Send, 
  Sparkles, 
  Rocket, 
  ShieldCheck, 
  Check, 
  Copy, 
  Award, 
  ExternalLink, 
  Building2, 
  Flame, 
  DollarSign, 
  Clock, 
  FileText,
  Mail,
  Globe,
  AlertCircle
} from "lucide-react";

export default function SubmitStoryPage() {
  return (
    <Suspense fallback={<div className="container" style={{ padding: "80px 0", textAlign: "center", color: "hsl(var(--muted-foreground))" }}>Loading Pitch &amp; Submission Desk...</div>}>
      <SubmitForm />
    </Suspense>
  );
}

function SubmitForm() {
  const searchParams = useSearchParams();
  const claimParam = searchParams.get("claim");

  const [tier, setTier] = useState("FastTrack"); // "Free" | "FastTrack" | "Spotlight"
  const [formData, setFormData] = useState({
    companyName: claimParam || "",
    contactName: "",
    contactEmail: "",
    website: "",
    title: claimParam ? `Verified Company Profile Claim: ${claimParam}` : "",
    type: claimParam ? "claim_profile" : "funding",
    category: "SecTech & Startups",
    fundingAmount: "",
    fundingRound: "Series A",
    summary: "",
    pressReleaseUrl: ""
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [copiedBadge, setCopiedBadge] = useState(false);

  useEffect(() => {
    if (claimParam) {
      setFormData(prev => ({
        ...prev,
        companyName: claimParam,
        title: `Official Profile Verification & Coverage Claim: ${claimParam}`,
        type: "claim_profile"
      }));
    }
  }, [claimParam]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, tier })
      });

      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
      } else {
        setErrorMessage(data.error || "Submission failed. Please check required fields.");
      }
    } catch (err) {
      setErrorMessage("Network error connecting to the submission desk. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const badgeHtml = `<a href="https://hackerpost.online" target="_blank" rel="noopener noreferrer">
  <img src="https://hackerpost.online/badges/verified-sectech-2026.svg" alt="Verified SecTech 2026 on HackerPost" width="280" height="64" />
</a>`;

  const copyBadgeCode = () => {
    navigator.clipboard.writeText(badgeHtml);
    setCopiedBadge(true);
    setTimeout(() => setCopiedBadge(false), 3000);
  };

  return (
    <div className="container" style={{ paddingBottom: "100px", paddingTop: "40px" }}>
      {/* Header Banner */}
      <div style={{ textAlign: "center", maxWidth: "840px", margin: "0 auto 48px auto" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "6px 16px", borderRadius: "9999px", background: "hsla(var(--primary), 0.1)", border: "1px solid hsla(var(--primary), 0.3)", color: "hsl(var(--primary))", fontSize: "11px", fontWeight: 800, fontFamily: "var(--font-mono)", marginBottom: "16px" }}>
          <Sparkles size={13} />
          INBOUND PRESS &amp; FOUNDER SUBMISSION DESK
        </div>

        <h1 style={{ fontSize: "40px", fontWeight: 900, letterSpacing: "-1.2px", lineHeight: 1.15, marginBottom: "14px" }}>
          Get Covered on <span style={{ background: "linear-gradient(135deg, hsl(var(--primary)), #38bdf8 60%, hsl(var(--accent-purple)))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>HackerPost Wire</span>
        </h1>
        <p style={{ color: "hsl(var(--muted-foreground))", fontSize: "16px", lineHeight: 1.6 }}>
          Reach <b>48,000+ CISOs</b>, enterprise security architects, and venture capital partners. Submit your SecTech funding round, product launch, or zero-day security research for editorial review.
        </p>
      </div>

      {submitted ? (
        /* Success State */
        <div style={{
          maxWidth: "680px",
          margin: "0 auto",
          background: "linear-gradient(135deg, hsla(var(--card), 0.9), hsla(var(--background-secondary), 0.8))",
          border: "1px solid hsla(var(--success), 0.4)",
          borderRadius: "var(--radius-lg)",
          padding: "48px 40px",
          textAlign: "center",
          boxShadow: "0 16px 48px rgba(0, 255, 157, 0.08)"
        }}>
          <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "hsla(var(--success), 0.15)", border: "1px solid hsl(var(--success))", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px auto", color: "hsl(var(--success))" }}>
            <Check size={32} />
          </div>
          <h2 style={{ fontSize: "28px", fontWeight: 900, marginBottom: "12px" }}>Story Received by CISO Desk</h2>
          <p style={{ color: "hsl(var(--muted-foreground))", fontSize: "15px", lineHeight: 1.6, marginBottom: "28px" }}>
            Thank you for your submission. Our editorial engine has indexed your pitch. You will receive a verification confirmation email at <b>{formData.contactEmail}</b>.
          </p>

          <div style={{ display: "flex", justifyContent: "center", gap: "12px", flexWrap: "wrap" }}>
            <Link href="/" className="btn btn-primary">
              Return to Threat Wire
            </Link>
            <button 
              onClick={() => { setSubmitted(false); setFormData({ companyName: "", contactName: "", contactEmail: "", website: "", title: "", type: "funding", category: "SecTech & Startups", fundingAmount: "", fundingRound: "Series A", summary: "", pressReleaseUrl: "" }); }}
              className="btn btn-secondary"
            >
              Submit Another Pitch
            </button>
          </div>
        </div>
      ) : (
        /* Submission Form & Tier Selector */
        <div style={{ maxWidth: "960px", margin: "0 auto" }}>
          {/* Tier Selection Cards */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "20px",
            marginBottom: "36px"
          }}>
            {/* Free Tier */}
            <div 
              onClick={() => setTier("Free")}
              style={{
                background: tier === "Free" ? "linear-gradient(135deg, hsla(var(--card), 0.95), hsla(var(--primary), 0.08))" : "hsl(var(--card))",
                border: tier === "Free" ? "2px solid hsl(var(--primary))" : "1px solid hsl(var(--card-border))",
                borderRadius: "var(--radius-md)",
                padding: "24px",
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <span style={{ fontSize: "11px", fontWeight: 800, textTransform: "uppercase", color: "hsl(var(--muted-foreground))" }}>Standard Inbound</span>
                <span style={{ fontFamily: "var(--font-mono)", fontWeight: 900, fontSize: "18px" }}>FREE</span>
              </div>
              <h3 style={{ fontSize: "18px", fontWeight: 800, marginBottom: "8px" }}>Editorial Queue</h3>
              <p style={{ fontSize: "13px", color: "hsl(var(--muted-foreground))", lineHeight: 1.5, marginBottom: "16px" }}>
                Standard editorial evaluation queue. Story reviewed subject to editorial space.
              </p>
              <ul style={{ fontSize: "12px", color: "hsl(var(--muted-foreground))", display: "flex", flexDirection: "column", gap: "6px", listStyle: "none" }}>
                <li style={{ display: "flex", alignItems: "center", gap: "6px" }}><Check size={14} style={{ color: "hsl(var(--success))" }} /> 7–14 Day Review Cadence</li>
                <li style={{ display: "flex", alignItems: "center", gap: "6px" }}><Check size={14} style={{ color: "hsl(var(--success))" }} /> Permanent SEO Archive</li>
              </ul>
            </div>

            {/* Fast-Track Tier */}
            <div 
              onClick={() => setTier("FastTrack")}
              style={{
                background: tier === "FastTrack" ? "linear-gradient(135deg, hsla(var(--card), 0.95), hsla(var(--primary), 0.12))" : "hsl(var(--card))",
                border: tier === "FastTrack" ? "2px solid hsl(var(--primary))" : "1px solid hsl(var(--card-border))",
                borderRadius: "var(--radius-md)",
                padding: "24px",
                cursor: "pointer",
                position: "relative",
                transition: "all 0.2s ease",
                boxShadow: tier === "FastTrack" ? "0 8px 24px rgba(0, 240, 255, 0.15)" : "none"
              }}
            >
              <div style={{ position: "absolute", top: "-10px", right: "20px", background: "linear-gradient(135deg, hsl(var(--primary)), #00c4cc)", color: "#000000", fontSize: "10px", fontWeight: 900, padding: "2px 8px", borderRadius: "4px", letterSpacing: "0.5px" }}>
                RECOMMENDED
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <span style={{ fontSize: "11px", fontWeight: 800, textTransform: "uppercase", color: "hsl(var(--primary))" }}>Guaranteed Coverage</span>
                <span style={{ fontFamily: "var(--font-mono)", fontWeight: 900, fontSize: "18px", color: "hsl(var(--primary))" }}>$299</span>
              </div>
              <h3 style={{ fontSize: "18px", fontWeight: 800, marginBottom: "8px" }}>24H Wire Publication</h3>
              <p style={{ fontSize: "13px", color: "hsl(var(--muted-foreground))", lineHeight: 1.5, marginBottom: "16px" }}>
                Priority CISO review with guaranteed publication on HackerPost within 24 hours.
              </p>
              <ul style={{ fontSize: "12px", color: "hsl(var(--muted-foreground))", display: "flex", flexDirection: "column", gap: "6px", listStyle: "none" }}>
                <li style={{ display: "flex", alignItems: "center", gap: "6px" }}><Check size={14} style={{ color: "hsl(var(--success))" }} /> Guaranteed 24-Hour Turnaround</li>
                <li style={{ display: "flex", alignItems: "center", gap: "6px" }}><Check size={14} style={{ color: "hsl(var(--success))" }} /> Front-Page Wire Spotlight</li>
                <li style={{ display: "flex", alignItems: "center", gap: "6px" }}><Check size={14} style={{ color: "hsl(var(--success))" }} /> Dofollow Corporate Backlink</li>
              </ul>
            </div>

            {/* CISO Spotlight Tier */}
            <div 
              onClick={() => setTier("Spotlight")}
              style={{
                background: tier === "Spotlight" ? "linear-gradient(135deg, hsla(var(--card), 0.95), hsla(var(--accent-purple), 0.15))" : "hsl(var(--card))",
                border: tier === "Spotlight" ? "2px solid hsl(var(--accent-purple))" : "1px solid hsl(var(--card-border))",
                borderRadius: "var(--radius-md)",
                padding: "24px",
                cursor: "pointer",
                transition: "all 0.2s ease",
                boxShadow: tier === "Spotlight" ? "0 8px 24px rgba(139, 92, 246, 0.15)" : "none"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <span style={{ fontSize: "11px", fontWeight: 800, textTransform: "uppercase", color: "hsl(var(--accent-purple))" }}>Full Syndication</span>
                <span style={{ fontFamily: "var(--font-mono)", fontWeight: 900, fontSize: "18px", color: "hsl(var(--accent-purple))" }}>$699</span>
              </div>
              <h3 style={{ fontSize: "18px", fontWeight: 800, marginBottom: "8px" }}>CISO Spotlight + X Broadcast</h3>
              <p style={{ fontSize: "13px", color: "hsl(var(--muted-foreground))", lineHeight: 1.5, marginBottom: "16px" }}>
                Maximum visibility package with top hero placement, social syndication, and newsletter.
              </p>
              <ul style={{ fontSize: "12px", color: "hsl(var(--muted-foreground))", display: "flex", flexDirection: "column", gap: "6px", listStyle: "none" }}>
                <li style={{ display: "flex", alignItems: "center", gap: "6px" }}><Check size={14} style={{ color: "hsl(var(--success))" }} /> Top Hero Magazine Card</li>
                <li style={{ display: "flex", alignItems: "center", gap: "6px" }}><Check size={14} style={{ color: "hsl(var(--success))" }} /> @HackerPost2 Twitter/X Broadcast</li>
                <li style={{ display: "flex", alignItems: "center", gap: "6px" }}><Check size={14} style={{ color: "hsl(var(--success))" }} /> CISO Morning Dispatch Feature</li>
              </ul>
            </div>
          </div>

          {/* Form Card */}
          <div className="glass-card" style={{ padding: "36px" }}>
            {errorMessage && (
              <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 16px", borderRadius: "var(--radius-sm)", background: "hsla(var(--danger), 0.1)", border: "1px solid hsla(var(--danger), 0.3)", color: "hsl(var(--danger))", fontSize: "13px", marginBottom: "24px" }}>
                <AlertCircle size={16} />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {/* Row 1: Company & Contact Name */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", marginBottom: "6px" }}>
                    Company / Organization *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Cyera, Wiz, Palo Alto, or SecLLM Labs"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="newsletter-input"
                    style={{ height: "46px" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", marginBottom: "6px" }}>
                    Contact Name / Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jane Doe (Head of Communications / Founder)"
                    value={formData.contactName}
                    onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                    className="newsletter-input"
                    style={{ height: "46px" }}
                  />
                </div>
              </div>

              {/* Row 2: Email & Website */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", marginBottom: "6px" }}>
                    Corporate Contact Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="press@yourcompany.com"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    className="newsletter-input"
                    style={{ height: "46px" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", marginBottom: "6px" }}>
                    Company Website
                  </label>
                  <input
                    type="url"
                    placeholder="https://yourcompany.com"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="newsletter-input"
                    style={{ height: "46px" }}
                  />
                </div>
              </div>

              {/* Story Headline */}
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", marginBottom: "6px" }}>
                  Announcement / Story Headline *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SecTech Innovator Secures $45M Series B to Automate Cloud DSPM"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="newsletter-input"
                  style={{ height: "46px" }}
                />
              </div>

              {/* Row 3: Deal Details (Funding & Round) */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "20px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", marginBottom: "6px" }}>
                    Story Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="newsletter-input"
                    style={{ height: "46px" }}
                  >
                    <option value="funding">Venture Funding Round</option>
                    <option value="press_release">Product Launch / PR</option>
                    <option value="vulnerability">Zero-Day / Security Research</option>
                    <option value="claim_profile">Claim Existing Profile</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", marginBottom: "6px" }}>
                    Funding Amount (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. $45M or $300M"
                    value={formData.fundingAmount}
                    onChange={(e) => setFormData({ ...formData, fundingAmount: e.target.value })}
                    className="newsletter-input"
                    style={{ height: "46px" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", marginBottom: "6px" }}>
                    Round / Deal Type
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Series B, Seed, M&amp;A"
                    value={formData.fundingRound}
                    onChange={(e) => setFormData({ ...formData, fundingRound: e.target.value })}
                    className="newsletter-input"
                    style={{ height: "46px" }}
                  />
                </div>
              </div>

              {/* Story Content / Summary */}
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", marginBottom: "6px" }}>
                  Executive Summary / Press Release Text *
                </label>
                <textarea
                  required
                  rows={6}
                  placeholder="Paste your press release, architectural highlights, lead investors, CISO takeaways, or vulnerability disclosure summary..."
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  className="newsletter-input"
                  style={{ height: "auto", padding: "14px", resize: "vertical" }}
                />
              </div>

              {/* Press Release URL */}
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", marginBottom: "6px" }}>
                  Official Press Release / Wire Link (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://prnewswire.com/... or https://company.com/blog/..."
                  value={formData.pressReleaseUrl}
                  onChange={(e) => setFormData({ ...formData, pressReleaseUrl: e.target.value })}
                  className="newsletter-input"
                  style={{ height: "46px" }}
                />
              </div>

              {/* Submit Button */}
              <div style={{ marginTop: "12px" }}>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary"
                  style={{ width: "100%", height: "52px", fontSize: "15px" }}
                >
                  <Send size={16} />
                  {submitting ? "Transmitting to CISO Editorial Desk..." : `Submit Pitch (${tier === "Free" ? "Free Review" : tier === "FastTrack" ? "Fast-Track $299" : "Spotlight $699"})`}
                </button>
                <p style={{ fontSize: "11px", color: "hsl(var(--muted-foreground))", textAlign: "center", marginTop: "10px" }}>
                  All submissions are encrypted and reviewed by the HackerPost CISO Editorial Desk. Invoicing provided upon editorial verification.
                </p>
              </div>
            </form>
          </div>

          {/* Viral Trust Badge Embed Section */}
          <div style={{ marginTop: "60px", borderTop: "1px solid hsl(var(--card-border))", paddingTop: "40px" }}>
            <div style={{ marginBottom: "24px", textAlign: "center" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "11px", fontWeight: 800, color: "hsl(var(--primary))", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px" }}>
                <Award size={13} />
                Viral Trust Badges
              </div>
              <h2 style={{ fontSize: "24px", fontWeight: 900 }}>Embed Verified Badge on Your Website</h2>
              <p style={{ color: "hsl(var(--muted-foreground))", fontSize: "14px", maxWidth: "600px", margin: "0 auto" }}>
                Are you a covered SecTech startup or AI benchmark leaderboard contender? Embed our verified SVG badge on your homepage or press page.
              </p>
            </div>

            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "24px",
              background: "hsl(var(--card))",
              border: "1px solid hsl(var(--card-border))",
              borderRadius: "var(--radius-md)",
              padding: "28px"
            }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "14px", background: "hsl(var(--background))", padding: "20px", borderRadius: "var(--radius-sm)", border: "1px solid hsl(var(--card-border))" }}>
                <img src="/badges/verified-sectech-2026.svg" alt="HackerPost Verified SecTech 2026" width="280" height="64" />
                <span style={{ fontSize: "11px", color: "hsl(var(--muted-foreground))" }}>For Covered Startups &amp; Vendors</span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <div style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", marginBottom: "8px", color: "hsl(var(--primary))" }}>
                  1-Click HTML Embed Snippet:
                </div>
                <div style={{ background: "#050811", border: "1px solid hsl(var(--card-border))", borderRadius: "var(--radius-xs)", padding: "12px", fontFamily: "var(--font-mono)", fontSize: "11px", color: "#a5b4fc", overflowX: "auto", marginBottom: "12px" }}>
                  {badgeHtml}
                </div>
                <button
                  onClick={copyBadgeCode}
                  className="btn btn-secondary"
                  style={{ alignSelf: "flex-start", fontSize: "11px", height: "34px", display: "inline-flex", alignItems: "center", gap: "6px" }}
                >
                  {copiedBadge ? (
                    <>
                      <Check size={13} style={{ color: "hsl(var(--success))" }} />
                      <span style={{ color: "hsl(var(--success))" }}>Snippet Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={13} />
                      <span>Copy Embed Code</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
