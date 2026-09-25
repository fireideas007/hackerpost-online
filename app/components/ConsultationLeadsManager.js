"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  ShieldAlert, 
  ShieldCheck, 
  Clock, 
  Building, 
  User, 
  Mail, 
  FileText, 
  CheckCircle2, 
  Trash2, 
  Search, 
  Download, 
  RefreshCw, 
  AlertCircle, 
  ChevronDown, 
  ChevronUp, 
  MessageSquare, 
  Flame,
  ExternalLink,
  Layers,
  Check
} from "lucide-react";

export default function ConsultationLeadsManager() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [urgencyFilter, setUrgencyFilter] = useState("all");
  
  // Expanded lead IDs for notes / details
  const [expandedId, setExpandedId] = useState(null);
  const [editingNotesId, setEditingNotesId] = useState(null);
  const [noteText, setNoteText] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  
  // Notification banner
  const [notice, setNotice] = useState(null);

  const showNotice = (type, text) => {
    setNotice({ type, text });
    setTimeout(() => setNotice(null), 4000);
  };

  const fetchLeads = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const res = await fetch("/api/consult", { credentials: "same-origin" });
      const data = await res.json();
      if (data.success) {
        setLeads(data.consultations || []);
        if (isManual) showNotice("success", "Consultation leads refreshed.");
      } else {
        showNotice("error", data.error || "Failed to load leads.");
      }
    } catch (_) {
      showNotice("error", "Network error loading consultation leads.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("hp_editor_token") : null;
    
    // Optimistic UI update
    setLeads(prev => prev.map(item => item.id === id ? { ...item, status: newStatus } : item));

    try {
      const res = await fetch("/api/consult", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ id, status: newStatus })
      });

      const data = await res.json();
      if (data.success) {
        showNotice("success", `Lead updated to ${newStatus.replace("_", " ")}`);
      } else {
        showNotice("error", data.error || "Failed to update status.");
        fetchLeads(); // rollback
      }
    } catch (_) {
      showNotice("error", "Network error updating status.");
      fetchLeads();
    }
  };

  const handleSaveNotes = async (id) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("hp_editor_token") : null;
    setSavingNote(true);

    try {
      const res = await fetch("/api/consult", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ id, notes: noteText })
      });

      const data = await res.json();
      if (data.success) {
        setLeads(prev => prev.map(item => item.id === id ? { ...item, notes: noteText } : item));
        setEditingNotesId(null);
        showNotice("success", "Audit notes saved.");
      } else {
        showNotice("error", data.error || "Failed to save notes.");
      }
    } catch (_) {
      showNotice("error", "Network error saving notes.");
    } finally {
      setSavingNote(false);
    }
  };

  const handleDeleteLead = async (id, companyName) => {
    if (!window.confirm(`Permanently remove lead from "${companyName || 'Enterprise'}"?`)) {
      return;
    }

    const token = typeof window !== "undefined" ? localStorage.getItem("hp_editor_token") : null;
    try {
      const res = await fetch("/api/consult", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ id })
      });

      const data = await res.json();
      if (data.success) {
        setLeads(prev => prev.filter(item => item.id !== id));
        showNotice("success", "Lead removed.");
      } else {
        showNotice("error", data.error || "Failed to delete lead.");
      }
    } catch (_) {
      showNotice("error", "Network error deleting lead.");
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (leads.length === 0) return;
    const headers = ["ID", "Company", "Contact Name", "Email", "Role", "Infrastructure Size", "Service Needed", "Threat Concern", "Urgency", "Status", "Submitted At", "Notes"];
    
    const rows = leads.map(l => [
      `"${l.id || ""}"`,
      `"${(l.companyName || "").replace(/"/g, '""')}"`,
      `"${(l.contactName || "").replace(/"/g, '""')}"`,
      `"${(l.contactEmail || "").replace(/"/g, '""')}"`,
      `"${(l.role || "").replace(/"/g, '""')}"`,
      `"${(l.infraSize || "").replace(/"/g, '""')}"`,
      `"${(l.serviceNeeded || "").replace(/"/g, '""')}"`,
      `"${(l.threatConcern || "").replace(/"/g, '""')}"`,
      `"${l.urgency || "standard"}"`,
      `"${l.status || "new_inquiry"}"`,
      `"${l.submittedAt || ""}"`,
      `"${(l.notes || "").replace(/"/g, '""')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `hackerpost_ciso_leads_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Metrics computation
  const metrics = useMemo(() => {
    const total = leads.length;
    const urgent = leads.filter(l => l.urgency === "urgent").length;
    const newInquiries = leads.filter(l => !l.status || l.status === "new_inquiry").length;
    const contacted = leads.filter(l => l.status === "contacted").length;
    const scheduled = leads.filter(l => l.status === "audit_scheduled").length;
    const closed = leads.filter(l => l.status === "closed").length;
    return { total, urgent, newInquiries, contacted, scheduled, closed };
  }, [leads]);

  // Filtered leads
  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      // Search filter
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchCompany = (lead.companyName || "").toLowerCase().includes(term);
        const matchContact = (lead.contactName || "").toLowerCase().includes(term);
        const matchEmail = (lead.contactEmail || "").toLowerCase().includes(term);
        const matchThreat = (lead.threatConcern || "").toLowerCase().includes(term);
        const matchService = (lead.serviceNeeded || "").toLowerCase().includes(term);
        if (!matchCompany && !matchContact && !matchEmail && !matchThreat && !matchService) {
          return false;
        }
      }

      // Status filter
      if (statusFilter !== "all") {
        if (statusFilter === "new_inquiry") {
          if (lead.status && lead.status !== "new_inquiry") return false;
        } else if (lead.status !== statusFilter) {
          return false;
        }
      }

      // Urgency filter
      if (urgencyFilter !== "all" && lead.urgency !== urgencyFilter) {
        return false;
      }

      return true;
    });
  }, [leads, searchTerm, statusFilter, urgencyFilter]);

  return (
    <div style={{ paddingBottom: "60px" }}>
      {/* Toast Notification */}
      {notice && (
        <div style={{
          position: "fixed",
          top: "20px",
          right: "20px",
          zIndex: 9999,
          padding: "12px 20px",
          borderRadius: "var(--radius-sm)",
          boxShadow: "var(--shadow-lg)",
          color: notice.type === "success" ? "#000000" : "#ffffff",
          backgroundColor: notice.type === "success" ? "hsl(var(--success))" : "hsl(var(--danger))",
          fontWeight: 700,
          fontSize: "13px",
          display: "flex",
          alignItems: "center",
          gap: "8px"
        }}>
          {notice.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          {notice.text}
        </div>
      )}

      {/* Header Controls */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px", marginBottom: "24px" }}>
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", padding: "4px 10px", borderRadius: "var(--radius-xs)", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "hsl(var(--primary))", marginBottom: "8px" }}>
            <ShieldCheck size={14} />
            Confidential Executive Leads Desk
          </div>
          <h2 style={{ fontSize: "24px", fontWeight: 800, letterSpacing: "-0.5px", margin: 0 }}>
            Audit &amp; CISO Consultation Pipeline
          </h2>
          <p style={{ color: "hsl(var(--muted-foreground))", fontSize: "13px", marginTop: "4px" }}>
            Enterprise security leaders who requested Zero-Day Attack Surface Audits, Penetration Testing, or Emergency CISO Consultations.
          </p>
        </div>

        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <button
            onClick={() => fetchLeads(true)}
            disabled={refreshing}
            className="btn btn-secondary"
            style={{ fontSize: "12px", height: "36px", display: "inline-flex", alignItems: "center", gap: "6px" }}
            title="Refresh pipeline leads"
          >
            <RefreshCw size={14} className={refreshing ? "sandbox-loading-pulse" : ""} />
            {refreshing ? "Syncing..." : "Refresh"}
          </button>

          <button
            onClick={handleExportCSV}
            disabled={leads.length === 0}
            className="btn btn-secondary"
            style={{ fontSize: "12px", height: "36px", display: "inline-flex", alignItems: "center", gap: "6px" }}
            title="Export leads to CSV"
          >
            <Download size={14} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Telemetry KPI Strip */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
        gap: "14px",
        marginBottom: "28px"
      }}>
        {/* Total Inquiries */}
        <div style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "var(--radius-sm)", padding: "16px" }}>
          <div style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "hsl(var(--muted-foreground))", marginBottom: "4px" }}>
            Total Inquiries
          </div>
          <div style={{ fontSize: "24px", fontWeight: 800, color: "hsl(var(--foreground))" }}>
            {metrics.total}
          </div>
        </div>

        {/* 4-Hour Urgent SLA */}
        <div style={{ background: "hsl(var(--card))", border: "1px solid hsla(var(--danger), 0.4)", borderRadius: "var(--radius-sm)", padding: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
            <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "hsl(var(--danger))" }}>
              Emergency 4h SLA
            </span>
            <Flame size={14} style={{ color: "hsl(var(--danger))" }} />
          </div>
          <div style={{ fontSize: "24px", fontWeight: 800, color: "hsl(var(--danger))" }}>
            {metrics.urgent}
          </div>
        </div>

        {/* New / Unaddressed */}
        <div style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "var(--radius-sm)", padding: "16px" }}>
          <div style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "hsl(var(--primary))", marginBottom: "4px" }}>
            New Inquiries
          </div>
          <div style={{ fontSize: "24px", fontWeight: 800, color: "hsl(var(--primary))" }}>
            {metrics.newInquiries}
          </div>
        </div>

        {/* Contacted */}
        <div style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "var(--radius-sm)", padding: "16px" }}>
          <div style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "hsl(var(--warning))", marginBottom: "4px" }}>
            Contacted
          </div>
          <div style={{ fontSize: "24px", fontWeight: 800, color: "hsl(var(--warning))" }}>
            {metrics.contacted}
          </div>
        </div>

        {/* Audit Scheduled */}
        <div style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "var(--radius-sm)", padding: "16px" }}>
          <div style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "hsl(var(--success))", marginBottom: "4px" }}>
            Audit Scheduled
          </div>
          <div style={{ fontSize: "24px", fontWeight: 800, color: "hsl(var(--success))" }}>
            {metrics.scheduled}
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div style={{
        background: "hsl(var(--card))",
        border: "1px solid hsl(var(--border))",
        borderRadius: "var(--radius-sm)",
        padding: "16px",
        marginBottom: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "14px"
      }}>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          {/* Search Input */}
          <div style={{ flex: "1 1 280px", position: "relative" }}>
            <Search size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "hsl(var(--muted-foreground))" }} />
            <input
              type="text"
              placeholder="Search company, CISO name, email, threat, or service..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="sandbox-input"
              style={{ width: "100%", paddingLeft: "36px", height: "38px", fontSize: "13px" }}
            />
          </div>

          {/* Urgency Filter */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "12px", color: "hsl(var(--muted-foreground))", fontWeight: 600 }}>SLA:</span>
            <select
              value={urgencyFilter}
              onChange={(e) => setUrgencyFilter(e.target.value)}
              className="sandbox-input"
              style={{ height: "38px", fontSize: "12px", padding: "0 10px" }}
            >
              <option value="all">All Urgencies</option>
              <option value="urgent">Emergency 4-Hour SLA</option>
              <option value="standard">Standard Schedule (24-48h)</option>
            </select>
          </div>
        </div>

        {/* Status Pill Filters */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ fontSize: "12px", color: "hsl(var(--muted-foreground))", fontWeight: 600, marginRight: "4px" }}>Status:</span>
          {[
            { id: "all", label: "All Leads", count: metrics.total },
            { id: "new_inquiry", label: "New Inquiry", count: metrics.newInquiries },
            { id: "contacted", label: "Contacted", count: metrics.contacted },
            { id: "audit_scheduled", label: "Audit Scheduled", count: metrics.scheduled },
            { id: "closed", label: "Closed", count: metrics.closed }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              style={{
                fontSize: "11px",
                fontWeight: 700,
                padding: "4px 10px",
                borderRadius: "var(--radius-xs)",
                border: statusFilter === tab.id ? "1px solid hsl(var(--primary))" : "1px solid hsl(var(--border))",
                background: statusFilter === tab.id ? "hsla(var(--primary), 0.15)" : "transparent",
                color: statusFilter === tab.id ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                transition: "all 0.15s ease"
              }}
            >
              {tab.label}
              <span style={{
                background: "hsl(var(--muted))",
                padding: "1px 5px",
                borderRadius: "8px",
                fontSize: "10px"
              }}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Leads List */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <RefreshCw size={28} className="sandbox-loading-pulse" style={{ color: "hsl(var(--primary))", margin: "0 auto 12px auto" }} />
          <p style={{ fontSize: "13px", color: "hsl(var(--muted-foreground))", fontFamily: "var(--font-mono)" }}>
            Decrypting and loading consultation inquiries...
          </p>
        </div>
      ) : filteredLeads.length === 0 ? (
        <div style={{
          background: "hsl(var(--card))",
          border: "1px dashed hsl(var(--border))",
          borderRadius: "var(--radius-md)",
          padding: "50px 20px",
          textAlign: "center"
        }}>
          <ShieldAlert size={36} style={{ color: "hsl(var(--muted-foreground))", margin: "0 auto 12px auto" }} />
          <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "6px" }}>No Consultation Leads Found</h3>
          <p style={{ fontSize: "13px", color: "hsl(var(--muted-foreground))", maxWidth: "450px", margin: "0 auto" }}>
            {searchTerm || statusFilter !== "all" || urgencyFilter !== "all"
              ? "No leads match the active search query or filter criteria. Try clearing filters."
              : "No executive consultation inquiries have been submitted yet."}
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {filteredLeads.map((lead) => {
            const isUrgent = lead.urgency === "urgent";
            const isEditingNote = editingNotesId === lead.id;

            return (
              <div
                key={lead.id}
                style={{
                  background: "hsl(var(--card))",
                  border: isUrgent ? "1px solid hsla(var(--danger), 0.4)" : "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius-sm)",
                  padding: "18px 20px",
                  boxShadow: "var(--shadow-sm)",
                  transition: "border-color 0.2s ease"
                }}
              >
                {/* Top Row: Company Name, Badges & Status Selector */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", marginBottom: "12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                    <h3 style={{ fontSize: "17px", fontWeight: 800, margin: 0, color: "hsl(var(--foreground))", display: "flex", alignItems: "center", gap: "8px" }}>
                      <Building size={16} style={{ color: "hsl(var(--primary))" }} />
                      {lead.companyName || "Confidential Enterprise"}
                    </h3>

                    {/* Urgency Badge */}
                    {isUrgent ? (
                      <span style={{
                        fontSize: "10px",
                        fontWeight: 800,
                        padding: "3px 8px",
                        borderRadius: "var(--radius-xs)",
                        background: "hsla(var(--danger), 0.15)",
                        color: "hsl(var(--danger))",
                        border: "1px solid hsla(var(--danger), 0.3)",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px"
                      }}>
                        <Flame size={12} />
                        EMERGENCY 4-HOUR SLA
                      </span>
                    ) : (
                      <span style={{
                        fontSize: "10px",
                        fontWeight: 700,
                        padding: "3px 8px",
                        borderRadius: "var(--radius-xs)",
                        background: "hsl(var(--muted))",
                        color: "hsl(var(--muted-foreground))",
                        border: "1px solid hsl(var(--border))"
                      }}>
                        STANDARD SCHEDULE
                      </span>
                    )}

                    <span style={{ fontSize: "11px", color: "hsl(var(--muted-foreground))", fontFamily: "var(--font-mono)" }}>
                      ID: {lead.id}
                    </span>
                  </div>

                  {/* Status Dropdown */}
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "11px", fontWeight: 700, color: "hsl(var(--muted-foreground))" }}>Pipeline Status:</span>
                    <select
                      value={lead.status || "new_inquiry"}
                      onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                      className="sandbox-input"
                      style={{
                        height: "32px",
                        fontSize: "12px",
                        fontWeight: 700,
                        padding: "0 8px",
                        borderRadius: "var(--radius-xs)",
                        background: lead.status === "audit_scheduled" ? "hsla(var(--success), 0.15)" :
                                    lead.status === "contacted" ? "hsla(var(--warning), 0.15)" :
                                    lead.status === "closed" ? "hsl(var(--muted))" : "hsla(var(--primary), 0.15)",
                        borderColor: lead.status === "audit_scheduled" ? "hsl(var(--success))" :
                                     lead.status === "contacted" ? "hsl(var(--warning))" :
                                     lead.status === "closed" ? "hsl(var(--border))" : "hsl(var(--primary))"
                      }}
                    >
                      <option value="new_inquiry">● New Inquiry</option>
                      <option value="contacted">● Contacted / Scoping</option>
                      <option value="audit_scheduled">● Audit Scheduled</option>
                      <option value="closed">● Closed / Archived</option>
                    </select>
                  </div>
                </div>

                {/* Middle Grid: Contact details & Service Scope */}
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                  gap: "12px",
                  padding: "12px 14px",
                  background: "hsl(var(--muted))",
                  borderRadius: "var(--radius-xs)",
                  border: "1px solid hsl(var(--border))",
                  fontSize: "12px",
                  marginBottom: "12px"
                }}>
                  <div>
                    <div style={{ color: "hsl(var(--muted-foreground))", fontSize: "11px", fontWeight: 600 }}>CONTACT EXECUTIVE</div>
                    <div style={{ fontWeight: 700, marginTop: "2px", display: "flex", alignItems: "center", gap: "6px" }}>
                      <User size={13} style={{ color: "hsl(var(--primary))" }} />
                      {lead.contactName || "Executive Officer"}
                      <span style={{ color: "hsl(var(--muted-foreground))", fontWeight: 400 }}>({lead.role || "CISO"})</span>
                    </div>
                    <div style={{ marginTop: "4px" }}>
                      <a
                        href={`mailto:${lead.contactEmail}?subject=${encodeURIComponent(`Hackproof Technologies CISO Response: ${lead.serviceNeeded || 'Audit Inquiry'}`)}`}
                        style={{ color: "hsl(var(--primary))", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "4px", fontWeight: 600 }}
                      >
                        <Mail size={12} />
                        {lead.contactEmail}
                      </a>
                    </div>
                  </div>

                  <div>
                    <div style={{ color: "hsl(var(--muted-foreground))", fontSize: "11px", fontWeight: 600 }}>SERVICE REQUESTED</div>
                    <div style={{ fontWeight: 700, marginTop: "2px" }}>
                      {lead.serviceNeeded || "Zero-Day Attack Surface Audit"}
                    </div>
                    <div style={{ color: "hsl(var(--muted-foreground))", fontSize: "11px", marginTop: "2px" }}>
                      Infrastructure: <b>{lead.infraSize || "Enterprise Cloud Scope"}</b>
                    </div>
                  </div>

                  <div>
                    <div style={{ color: "hsl(var(--muted-foreground))", fontSize: "11px", fontWeight: 600 }}>SUBMITTED AT</div>
                    <div style={{ fontWeight: 600, marginTop: "2px" }}>
                      {lead.submittedAt ? new Date(lead.submittedAt).toLocaleString() : "Recent"}
                    </div>
                    {lead.updatedAt && (
                      <div style={{ color: "hsl(var(--muted-foreground))", fontSize: "10px", marginTop: "2px" }}>
                        Last updated: {new Date(lead.updatedAt).toLocaleTimeString()}
                      </div>
                    )}
                  </div>
                </div>

                {/* Threat Concern / Advisory Reference */}
                {lead.threatConcern && (
                  <div style={{
                    fontSize: "12px",
                    background: "hsla(var(--primary), 0.05)",
                    border: "1px solid hsla(var(--primary), 0.2)",
                    borderRadius: "var(--radius-xs)",
                    padding: "10px 14px",
                    marginBottom: "12px",
                    lineHeight: 1.5
                  }}>
                    <span style={{ fontWeight: 700, color: "hsl(var(--foreground))", marginRight: "6px" }}>
                      Threat Advisory / Scope Concern:
                    </span>
                    <span style={{ color: "hsl(var(--foreground))" }}>
                      {lead.threatConcern}
                    </span>
                  </div>
                )}

                {/* Internal Notes Display & Editor */}
                {lead.notes && !isEditingNote && (
                  <div style={{
                    fontSize: "12px",
                    background: "hsla(var(--warning), 0.08)",
                    border: "1px solid hsla(var(--warning), 0.25)",
                    borderRadius: "var(--radius-xs)",
                    padding: "8px 12px",
                    marginBottom: "12px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}>
                    <div>
                      <span style={{ fontWeight: 700, color: "hsl(var(--warning))", marginRight: "6px" }}>
                        Internal Notes:
                      </span>
                      <span>{lead.notes}</span>
                    </div>
                    <button
                      onClick={() => { setEditingNotesId(lead.id); setNoteText(lead.notes || ""); }}
                      className="btn btn-secondary"
                      style={{ fontSize: "11px", height: "24px", padding: "0 8px" }}
                    >
                      Edit Note
                    </button>
                  </div>
                )}

                {isEditingNote && (
                  <div style={{ marginBottom: "12px", background: "hsl(var(--muted))", padding: "12px", borderRadius: "var(--radius-xs)" }}>
                    <label style={{ fontSize: "11px", fontWeight: 700, display: "block", marginBottom: "6px" }}>
                      Update Internal Consultation Notes:
                    </label>
                    <textarea
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      placeholder="e.g., Scheduled technical call with lead architect for Thursday 2pm EST..."
                      className="sandbox-textarea"
                      style={{ width: "100%", height: "70px", fontSize: "12px", marginBottom: "8px" }}
                    />
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        onClick={() => handleSaveNotes(lead.id)}
                        disabled={savingNote}
                        className="btn btn-primary"
                        style={{ fontSize: "11px", height: "28px", padding: "0 12px" }}
                      >
                        {savingNote ? "Saving..." : "Save Note"}
                      </button>
                      <button
                        onClick={() => setEditingNotesId(null)}
                        className="btn btn-secondary"
                        style={{ fontSize: "11px", height: "28px", padding: "0 12px" }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Bottom Actions Bar */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "10px", borderTop: "1px solid hsl(var(--border))", flexWrap: "wrap", gap: "8px" }}>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <a
                      href={`mailto:${lead.contactEmail}?subject=${encodeURIComponent(`Hackproof Technologies: Enterprise Consultation for ${lead.companyName || 'Threat Audit'}`)}`}
                      className="btn btn-primary"
                      style={{ fontSize: "11px", padding: "4px 10px", height: "28px", display: "inline-flex", alignItems: "center", gap: "6px" }}
                    >
                      <Mail size={12} />
                      Email Lead Directly
                    </a>

                    {!lead.notes && !isEditingNote && (
                      <button
                        onClick={() => { setEditingNotesId(lead.id); setNoteText(""); }}
                        className="btn btn-secondary"
                        style={{ fontSize: "11px", padding: "4px 10px", height: "28px", display: "inline-flex", alignItems: "center", gap: "6px" }}
                      >
                        <MessageSquare size={12} />
                        Add Internal Note
                      </button>
                    )}
                  </div>

                  <div>
                    <button
                      onClick={() => handleDeleteLead(lead.id, lead.companyName)}
                      className="btn btn-secondary"
                      style={{
                        fontSize: "11px",
                        padding: "4px 10px",
                        height: "28px",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        color: "hsl(var(--danger))",
                        borderColor: "hsla(var(--danger), 0.3)"
                      }}
                      title="Permanently remove lead"
                    >
                      <Trash2 size={12} />
                      Delete Lead
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
