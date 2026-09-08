"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { 
  ShieldCheck, 
  ShieldAlert, 
  Terminal, 
  Lock, 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  Flame, 
  Building, 
  Mail, 
  User, 
  Server, 
  FileText,
  AlertTriangle,
  Award
} from "lucide-react";

function ConsultContent() {
  const searchParams = useSearchParams();
  const initialThreat = searchParams.get("threat") || "";
  const initialService = searchParams.get("service") || "Zero-Day Attack Surface Audit";

  const [form, setForm] = useState({
    companyName: "",
    contactName: "",
    contactEmail: "",
    role: "Chief Information Security Officer (CISO)",
    infraSize: "1,000 - 5,000 Cloud Nodes",
    serviceNeeded: initialService,
    threatConcern: initialThreat ? `Referred regarding threat advisory: ${initialThreat}` : "",
    urgency: "standard"
  });

  const [submitting, setSubmitting] = useState(false);
  const [successResult, setSuccessResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!form.contactEmail.includes("@")) {
      setErrorMessage("Please enter a valid corporate work email.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/consult", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccessResult(data);
      } else {
        setErrorMessage(data.error || "Failed to submit consultation request. Please try again.");
      }
    } catch (_) {
      setErrorMessage("Network connection error. Please check your connectivity and retry.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container" style={{ padding: "40px 0 100px 0", maxWidth: "1100px" }}>
      {/* Top Breadcrumb */}
      <div style={{ marginBottom: "24px" }}>
        <Link href="/" className="btn btn-secondary" style={{ fontSize: "12px", display: "inline-flex", alignItems: "center", gap: "6px" }}>
          ← Back to Threat Wire
        </Link>
      </div>

      {/* Hero Header */}
      <div style={{
        background: "hsl(var(--muted))",
        border: "1px solid hsl(var(--border))",
        borderRadius: "var(--radius-md)",
        padding: "40px 32px",
        marginBottom: "36px"
      }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", padding: "4px 12px", borderRadius: "var(--radius-xs)", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "hsl(var(--primary))", marginBottom: "14px" }}>
          <ShieldCheck size={14} />
          Hackproof Technologies India Private Limited · Enterprise Advisory Desk
        </div>
        
        <h1 style={{ fontSize: "30px", fontWeight: 800, lineHeight: 1.25, marginBottom: "12px", letterSpacing: "-0.5px", color: "hsl(var(--foreground))" }}>
          Confidential CISO Advisory, Attack Surface Audits &amp; Rapid Zero-Day Remediation
        </h1>
        
        <p style={{ fontSize: "15px", color: "hsl(var(--muted-foreground))", maxWidth: "800px", lineHeight: 1.6, marginBottom: "20px" }}>
          When critical CVEs break, enterprise security teams cannot wait weeks for bureaucratic consulting firms. 
          <b> Hackproof Technologies</b> deploys principal offensive security engineers within hours to map your perimeter, neutralize exploit paths, and ensure SEC &amp; CERT-In compliance.
        </p>

        {/* Enterprise Trust Telemetry Strip */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", paddingTop: "16px", borderTop: "1px solid hsl(var(--border))" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Clock size={16} style={{ color: "hsl(var(--primary))" }} />
            <div>
              <div style={{ fontSize: "13px", fontWeight: 700 }}>4-Hour SLA Response</div>
              <div style={{ fontSize: "11px", color: "hsl(var(--muted-foreground))" }}>Emergency Incident Hotline</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Lock size={16} style={{ color: "hsl(var(--success))" }} />
            <div>
              <div style={{ fontSize: "13px", fontWeight: 700 }}>Strict Mutual NDA</div>
              <div style={{ fontSize: "11px", color: "hsl(var(--muted-foreground))" }}>Encrypted Executive Comms</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Award size={16} style={{ color: "hsl(var(--warning))" }} />
            <div>
              <div style={{ fontSize: "13px", fontWeight: 700 }}>SEC &amp; DORA Aligned</div>
              <div style={{ fontSize: "11px", color: "hsl(var(--muted-foreground))" }}>Boardroom Materiality Reports</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "40px", alignItems: "start" }}>
        {/* Left Column: Core Services & Capabilities */}
        <div>
          <h2 style={{ fontSize: "22px", fontWeight: 800, marginBottom: "20px" }}>
            Enterprise Security Solutions
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Service 1 */}
            <div style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "var(--radius-md)", padding: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "10px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "hsla(var(--danger), 0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "hsl(var(--danger))" }}>
                  <Flame size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: "16px", fontWeight: 700 }}>Zero-Day Attack Surface &amp; Blast Radius Audit</h3>
                  <div style={{ fontSize: "11px", color: "hsl(var(--muted-foreground))" }}>Immediate threat exposure validation</div>
                </div>
              </div>
              <p style={{ fontSize: "13px", color: "hsl(var(--muted-foreground))", lineHeight: 1.6 }}>
                Full automated and manual discovery of your public IP ranges, subdomains, cloud buckets, and API endpoints against the latest zero-days. We identify vulnerable systems before threat actors exploit them.
              </p>
            </div>

            {/* Service 2 */}
            <div style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "var(--radius-md)", padding: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "10px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "hsla(var(--primary), 0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "hsl(var(--primary))" }}>
                  <Terminal size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: "16px", fontWeight: 700 }}>Multi-Cloud &amp; API Penetration Testing</h3>
                  <div style={{ fontSize: "11px", color: "hsl(var(--muted-foreground))" }}>AWS, GCP, Azure &amp; Kubernetes environments</div>
                </div>
              </div>
              <p style={{ fontSize: "13px", color: "hsl(var(--muted-foreground))", lineHeight: 1.6 }}>
                Thorough offensive red-teaming evaluating IAM privilege escalation, lateral movement paths, container escapes, and authentication bypasses with production-safe methodologies.
              </p>
            </div>

            {/* Service 3 */}
            <div style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "var(--radius-md)", padding: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "10px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "hsla(var(--success), 0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "hsl(var(--success))" }}>
                  <FileText size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: "16px", fontWeight: 700 }}>Boardroom Compliance &amp; SEC Form 8-K Readiness</h3>
                  <div style={{ fontSize: "11px", color: "hsl(var(--muted-foreground))" }}>Regulatory risk documentation</div>
                </div>
              </div>
              <p style={{ fontSize: "13px", color: "hsl(var(--muted-foreground))", lineHeight: 1.6 }}>
                Technical and executive risk assessments designed specifically for CISOs presenting to Audit Committees and Board of Directors, ensuring compliance with SEC cyber rules, DORA, and CERT-In mandates.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Confidential CISO Consultation Form */}
        <div style={{
          background: "hsl(var(--card))",
          border: "1px solid hsl(var(--border))",
          borderRadius: "var(--radius-md)",
          padding: "32px",
          boxShadow: "var(--shadow-md)"
        }}>
          {successResult ? (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <CheckCircle2 size={48} style={{ color: "hsl(var(--success))", margin: "0 auto 16px auto" }} />
              <h3 style={{ fontSize: "20px", fontWeight: 800, marginBottom: "12px" }}>
                Advisory Request Confirmed
              </h3>
              <p style={{ fontSize: "13px", color: "hsl(var(--muted-foreground))", lineHeight: 1.6, marginBottom: "20px" }}>
                {successResult.message}
              </p>
              <div style={{ background: "hsla(var(--primary), 0.08)", border: "1px solid hsla(var(--primary), 0.2)", borderRadius: "var(--radius-sm)", padding: "12px", fontSize: "12px", fontFamily: "var(--font-mono)", marginBottom: "24px" }}>
                Tracking ID: {successResult.consultationId}
              </div>
              <Link href="/" className="btn btn-primary" style={{ width: "100%" }}>
                Return to Threat Wire
              </Link>
            </div>
          ) : (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                <ShieldCheck size={20} style={{ color: "hsl(var(--primary))" }} />
                <h3 style={{ fontSize: "18px", fontWeight: 800 }}>Schedule CISO Consultation</h3>
              </div>
              <p style={{ fontSize: "12px", color: "hsl(var(--muted-foreground))", marginBottom: "20px", lineHeight: 1.5 }}>
                Directly connect with a Principal Security Architect at <b>Hackproof Technologies</b>. Initial consultations are 100% confidential under strict NDA.
              </p>

              {errorMessage && (
                <div style={{ background: "hsla(var(--danger), 0.1)", border: "1px solid hsl(var(--danger))", color: "hsl(var(--danger))", padding: "10px 14px", borderRadius: "var(--radius-sm)", fontSize: "12px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <AlertTriangle size={16} />
                  {errorMessage}
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "hsl(var(--muted-foreground))", marginBottom: "6px" }}>
                    Corporate Work Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="ciso@enterprise.com"
                    value={form.contactEmail}
                    onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", background: "hsl(var(--background))", border: "1px solid hsl(var(--border))", borderRadius: "var(--radius-sm)", color: "hsl(var(--foreground))", fontSize: "13px" }}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "hsl(var(--muted-foreground))", marginBottom: "6px" }}>
                      Your Name &amp; Title *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Jane Doe, CISO"
                      value={form.contactName}
                      onChange={(e) => setForm({ ...form, contactName: e.target.value })}
                      style={{ width: "100%", padding: "10px 14px", background: "hsl(var(--background))", border: "1px solid hsl(var(--border))", borderRadius: "var(--radius-sm)", color: "hsl(var(--foreground))", fontSize: "13px" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "hsl(var(--muted-foreground))", marginBottom: "6px" }}>
                      Company / Organization *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Acme Enterprise"
                      value={form.companyName}
                      onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                      style={{ width: "100%", padding: "10px 14px", background: "hsl(var(--background))", border: "1px solid hsl(var(--border))", borderRadius: "var(--radius-sm)", color: "hsl(var(--foreground))", fontSize: "13px" }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "hsl(var(--muted-foreground))", marginBottom: "6px" }}>
                    Service Required
                  </label>
                  <select
                    value={form.serviceNeeded}
                    onChange={(e) => setForm({ ...form, serviceNeeded: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", background: "hsl(var(--background))", border: "1px solid hsl(var(--border))", borderRadius: "var(--radius-sm)", color: "hsl(var(--foreground))", fontSize: "13px" }}
                  >
                    <option value="Zero-Day Attack Surface Audit">Zero-Day Attack Surface Audit</option>
                    <option value="Multi-Cloud & API Penetration Testing">Multi-Cloud &amp; API Penetration Testing</option>
                    <option value="SEC & CERT-In Boardroom Compliance Review">SEC &amp; CERT-In Boardroom Compliance Review</option>
                    <option value="24/7 Red-Team & Emergency Incident Retainer">24/7 Red-Team &amp; Emergency Incident Retainer</option>
                    <option value="Custom Security Engineering Architecture">Custom Security Engineering Architecture</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "hsl(var(--muted-foreground))", marginBottom: "6px" }}>
                    Infrastructure Footprint
                  </label>
                  <select
                    value={form.infraSize}
                    onChange={(e) => setForm({ ...form, infraSize: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", background: "hsl(var(--background))", border: "1px solid hsl(var(--border))", borderRadius: "var(--radius-sm)", color: "hsl(var(--foreground))", fontSize: "13px" }}
                  >
                    <option value="Under 500 Cloud Instances">Under 500 Cloud Instances</option>
                    <option value="500 - 2,500 Cloud Instances">500 - 2,500 Cloud Instances</option>
                    <option value="2,500 - 10,000 Cloud Instances">2,500 - 10,000 Cloud Instances</option>
                    <option value="10,000+ Enterprise Multi-Cloud">10,000+ Enterprise Multi-Cloud</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "hsl(var(--muted-foreground))", marginBottom: "6px" }}>
                    Threat / Vulnerability of Concern
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Specific CVE, exposed system, or upcoming audit deadline..."
                    value={form.threatConcern}
                    onChange={(e) => setForm({ ...form, threatConcern: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", background: "hsl(var(--background))", border: "1px solid hsl(var(--border))", borderRadius: "var(--radius-sm)", color: "hsl(var(--foreground))", fontSize: "13px", resize: "vertical" }}
                  />
                </div>

                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", cursor: "pointer" }}>
                    <input
                      type="radio"
                      name="urgency"
                      checked={form.urgency === "standard"}
                      onChange={() => setForm({ ...form, urgency: "standard" })}
                    />
                    Standard Schedule (24-48h)
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", cursor: "pointer", color: "hsl(var(--danger))", fontWeight: 700 }}>
                    <input
                      type="radio"
                      name="urgency"
                      checked={form.urgency === "urgent"}
                      onChange={() => setForm({ ...form, urgency: "urgent" })}
                    />
                    🚨 Active Incident / 4h SLA
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary"
                  style={{ width: "100%", padding: "12px", fontSize: "13px", fontWeight: 700, marginTop: "8px" }}
                >
                  {submitting ? "Securing Encrypted Dispatch..." : "Request CISO Threat Consultation →"}
                </button>

                <div style={{ fontSize: "10px", color: "hsl(var(--muted-foreground))", textAlign: "center" }}>
                  🔒 Encrypted transmission · Handled strictly under non-disclosure agreements
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ConsultPage() {
  return (
    <Suspense fallback={<div className="container" style={{ padding: "60px 0", textAlign: "center" }}>Loading CISO Consultation Desk...</div>}>
      <ConsultContent />
    </Suspense>
  );
}
