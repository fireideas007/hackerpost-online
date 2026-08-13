"use client";

import { useState } from "react";
import { 
  Key, 
  Terminal, 
  Code2, 
  Play, 
  Copy, 
  Check, 
  Zap, 
  Layers, 
  Server, 
  RefreshCw,
  Cpu,
  ShieldCheck
} from "lucide-react";

export default function B2bDeveloperPortal() {
  const [apiKey, setApiKey] = useState("hp_live_7f98e0b2d3c4e5f6a7b8c9d0e1f");
  const [keyVisible, setKeyVisible] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  
  const [selectedPlan, setSelectedPlan] = useState("Pro");

  // Playground state
  const [activeEndpoint, setActiveEndpoint] = useState("audit"); // "audit" | "rewrite"
  const [inputContent, setInputContent] = useState(
    "A critical regression vulnerability was discovered in the OpenSSH server (sshd) that allows unauthenticated remote code execution. Attackers can execute shellcode via carefully timed connection timeouts."
  );
  const [inputTitle, setInputTitle] = useState("Critical OpenSSH Remote Code Execution Vulnerability");
  const [inputLocation, setInputLocation] = useState("CVE-2026-3829");
  const [inputSource, setInputSource] = useState("GitHub Advisory Database");

  const [loading, setLoading] = useState(false);
  const [apiResponse, setApiResponse] = useState(null);
  
  const [activeSnippetTab, setActiveSnippetTab] = useState("curl"); // "curl" | "js" | "python"

  const handleGenerateKey = () => {
    const chars = "abcdef0123456789";
    let newKey = "hp_live_";
    for (let i = 0; i < 28; i++) {
      newKey += chars[Math.floor(Math.random() * chars.length)];
    }
    setApiKey(newKey);
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const executePlaygroundRequest = async () => {
    setLoading(true);
    setApiResponse(null);

    const targetUrl = activeEndpoint === "audit" ? "/api/b2b/audit" : "/api/b2b/rewrite";
    const payload = activeEndpoint === "audit" 
      ? { content: inputContent }
      : { 
          title: inputTitle, 
          content: inputContent, 
          location: inputLocation, 
          sourceName: inputSource,
          sourceUrl: "https://github.com/advisories/GHSA-openssh-rce-2026" 
        };

    try {
      const res = await fetch(targetUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      setApiResponse(data);
    } catch (err) {
      setApiResponse({ success: false, error: "Network error calling the B2B endpoint: " + err.message });
    } finally {
      setLoading(false);
    }
  };

  const getCurlSnippet = () => {
    if (activeEndpoint === "audit") {
      return `curl -X POST https://api.hackerpost.online/v1/audit \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${apiKey}" \\
  -d '{
    "content": "${inputContent.substring(0, 50)}..."
  }'`;
    } else {
      return `curl -X POST https://api.hackerpost.online/v1/rewrite \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${apiKey}" \\
  -d '{
    "title": "${inputTitle}",
    "content": "${inputContent.substring(0, 50)}...",
    "location": "${inputLocation}",
    "sourceName": "${inputSource}"
  }'`;
    }
  };

  const getJsSnippet = () => {
    if (activeEndpoint === "audit") {
      return `fetch("https://api.hackerpost.online/v1/audit", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer ${apiKey}"
  },
  body: JSON.stringify({
    content: "${inputContent.substring(0, 50)}..."
  })
})
.then(res => res.json())
.then(data => console.log(data));`;
    } else {
      return `fetch("https://api.hackerpost.online/v1/rewrite", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer ${apiKey}"
  },
  body: JSON.stringify({
    title: "${inputTitle}",
    content: "${inputContent.substring(0, 50)}...",
    location: "${inputLocation}",
    sourceName: "${inputSource}"
  })
})
.then(res => res.json())
.then(data => console.log(data));`;
    }
  };

  const getPythonSnippet = () => {
    if (activeEndpoint === "audit") {
      return `import requests

url = "https://api.hackerpost.online/v1/audit"
headers = {
    "Authorization": "Bearer ${apiKey}",
    "Content-Type": "application/json"
}
payload = {
    "content": "${inputContent.substring(0, 50)}..."
}

response = requests.post(url, json=payload, headers=headers)
print(response.json())`;
    } else {
      return `import requests

url = "https://api.hackerpost.online/v1/rewrite"
headers = {
    "Authorization": "Bearer ${apiKey}",
    "Content-Type": "application/json"
}
payload = {
    "title": "${inputTitle}",
    "content": "${inputContent.substring(0, 50)}...",
    "location": "${inputLocation}",
    "sourceName": "${inputSource}"
}

response = requests.post(url, json=payload, headers=headers)
print(response.json())`;
    }
  };

  return (
    <div className="container" style={{ paddingBottom: "100px", paddingTop: "40px" }}>
      {/* Page Hero */}
      <section style={{ textAlign: "center", marginBottom: "48px", background: "radial-gradient(ellipse at top, hsla(var(--primary), 0.08), transparent 70%)", padding: "40px 0", borderRadius: "var(--radius-sm)" }}>
        <span style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", background: "hsla(var(--primary), 0.1)", color: "hsl(var(--primary))", padding: "6px 12px", borderRadius: "2px", marginBottom: "16px", display: "inline-block" }}>
          Threat Syndication Solutions
        </span>
        <h1 style={{ fontSize: "36px", fontWeight: 800, letterSpacing: "-1px", marginBottom: "16px", textTransform: "uppercase" }}>
          Vulnerability Verification & Advisory APIs
        </h1>
        <p style={{ maxWidth: "720px", margin: "0 auto", color: "hsl(var(--muted-foreground))", fontSize: "16px", lineHeight: 1.6 }}>
          Power your cybersecurity dashboards or corporate newsrooms. Programmatically detect exploit signatures, calculate plagiarism overlap metrics, rewrite raw vulnerability disclosures, and generate search-engine-ready JSON-LD schemas.
        </p>
      </section>

      {/* Upper Grid: Keys & Tiers */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "32px", marginBottom: "48px" }}>
        
        {/* API Key Manager Card */}
        <div className="admin-panel" style={{ justifySelf: "stretch" }}>
          <div className="panel-header">
            <h2 className="panel-title">
              <Key size={18} style={{ color: "hsl(var(--primary))" }} />
              Developer Access Keys
            </h2>
          </div>
          <div className="panel-body" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <p style={{ fontSize: "13px", color: "hsl(var(--muted-foreground))" }}>
              Include this private Bearer Key in the HTTP headers (<code style={{ background: "hsl(var(--muted))", padding: "2px 4px", borderRadius: "3px" }}>Authorization: Bearer KEY</code>) to authorize threat intelligence calls.
            </p>
            
            <div style={{ display: "flex", gap: "8px", background: "hsl(var(--background))", border: "1px solid hsl(var(--border))", padding: "10px", borderRadius: "var(--radius-sm)", alignItems: "center" }}>
              <Terminal size={16} style={{ color: "hsl(var(--muted-foreground))", flexShrink: 0 }} />
              <input
                type={keyVisible ? "text" : "password"}
                value={apiKey}
                readOnly
                style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: "13px", fontFamily: "var(--font-mono)", letterSpacing: "1px" }}
              />
              <button 
                onClick={() => setKeyVisible(!keyVisible)}
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: "11px", fontWeight: 700, color: "hsl(var(--primary))", padding: "4px" }}
              >
                {keyVisible ? "Hide" : "Show"}
              </button>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button 
                onClick={handleCopyKey}
                className="btn btn-secondary"
                style={{ flex: 1, padding: "8px 12px", fontSize: "12px", display: "flex", alignItems: "center", gap: "6px" }}
              >
                {copiedKey ? <Check size={14} style={{ color: "hsl(var(--success))" }} /> : <Copy size={14} />}
                {copiedKey ? "Copied!" : "Copy Key"}
              </button>
              <button 
                onClick={handleGenerateKey}
                className="btn btn-secondary"
                style={{ flex: 1, padding: "8px 12px", fontSize: "12px", display: "flex", alignItems: "center", gap: "6px" }}
              >
                <RefreshCw size={14} />
                Rotate Key
              </button>
            </div>
            
            <div style={{ borderTop: "1px solid hsl(var(--border))", paddingTop: "12px", display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "hsl(var(--success))" }}>
              <ShieldCheck size={16} />
              <span>Authentication check passed: Active Sandbox environment.</span>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="admin-panel" style={{ justifySelf: "stretch" }}>
          <div className="panel-header">
            <h2 className="panel-title">
              <Layers size={18} style={{ color: "hsl(var(--warning))" }} />
              API Subscription Packages
            </h2>
          </div>
          <div className="panel-body" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
            
            <div 
              onClick={() => setSelectedPlan("Free")}
              style={{
                border: selectedPlan === "Free" ? "2px solid hsl(var(--primary))" : "1px solid hsl(var(--border))",
                background: selectedPlan === "Free" ? "hsla(var(--primary), 0.02)" : "transparent",
                borderRadius: "var(--radius-sm)", padding: "16px", cursor: "pointer", transition: "all 0.2s"
              }}
            >
              <h3 style={{ fontSize: "14px", fontWeight: 700 }}>Sandbox Free</h3>
              <p style={{ fontSize: "20px", fontWeight: 800, margin: "6px 0" }}>$0 <span style={{ fontSize: "11px", color: "hsl(var(--muted-foreground))" }}>/ mo</span></p>
              <ul style={{ paddingLeft: "0", listStyle: "none", fontSize: "11px", color: "hsl(var(--muted-foreground))", display: "flex", flexDirection: "column", gap: "6px" }}>
                <li>✓ 500 requests / mo</li>
                <li>✓ Basic similarity check</li>
                <li>✓ Standard AI sanitization</li>
                <li>✗ SLA guarantee</li>
              </ul>
            </div>

            <div 
              onClick={() => setSelectedPlan("Pro")}
              style={{
                border: selectedPlan === "Pro" ? "2px solid hsl(var(--primary))" : "1px solid hsl(var(--border))",
                background: selectedPlan === "Pro" ? "hsla(var(--primary), 0.02)" : "transparent",
                borderRadius: "var(--radius-sm)", padding: "16px", cursor: "pointer", transition: "all 0.2s",
                position: "relative"
              }}
            >
              <span style={{ position: "absolute", top: "-10px", right: "10px", background: "hsl(var(--primary))", color: "#000000", fontSize: "9px", padding: "2px 6px", borderRadius: "2px", fontWeight: 800 }}>
                POPULAR
              </span>
              <h3 style={{ fontSize: "14px", fontWeight: 700 }}>SecOps Pro</h3>
              <p style={{ fontSize: "20px", fontWeight: 800, margin: "6px 0" }}>$149 <span style={{ fontSize: "11px", color: "hsl(var(--muted-foreground))" }}>/ mo</span></p>
              <ul style={{ paddingLeft: "0", listStyle: "none", fontSize: "11px", color: "hsl(var(--muted-foreground))", display: "flex", flexDirection: "column", gap: "6px" }}>
                <li>✓ 50k requests / mo</li>
                <li>✓ Precision similarity audit</li>
                <li>✓ Low-latency LLM rewrite</li>
                <li>✓ Schema & JSON-LD exports</li>
              </ul>
            </div>

            <div 
              onClick={() => setSelectedPlan("Enterprise")}
              style={{
                border: selectedPlan === "Enterprise" ? "2px solid hsl(var(--primary))" : "1px solid hsl(var(--border))",
                background: selectedPlan === "Enterprise" ? "hsla(var(--primary), 0.02)" : "transparent",
                borderRadius: "var(--radius-sm)", padding: "16px", cursor: "pointer", transition: "all 0.2s"
              }}
            >
              <h3 style={{ fontSize: "14px", fontWeight: 700 }}>Enterprise</h3>
              <p style={{ fontSize: "20px", fontWeight: 800, margin: "6px 0" }}>Custom</p>
              <ul style={{ paddingLeft: "0", listStyle: "none", fontSize: "11px", color: "hsl(var(--muted-foreground))", display: "flex", flexDirection: "column", gap: "6px" }}>
                <li>✓ Unlimited endpoints</li>
                <li>✓ Exploit scanner sandbox</li>
                <li>✓ Realtime RSS webhooks</li>
                <li>✓ Dedicated 99.99% SLA</li>
              </ul>
            </div>

          </div>
        </div>

      </div>

      {/* Developer API Console */}
      <div className="admin-panel" style={{ maxHeight: "none", display: "flex", flexDirection: "column" }}>
        
        <div className="panel-header" style={{ borderBottom: "1px solid hsl(var(--border))" }}>
          <h2 className="panel-title">
            <Server size={18} style={{ color: "hsl(var(--primary))" }} />
            Threat Playground & Console
          </h2>
          <div style={{ display: "flex", gap: "4px", background: "hsl(var(--muted))", padding: "4px", borderRadius: "4px" }}>
            <button
              onClick={() => { setActiveEndpoint("audit"); setApiResponse(null); }}
              className={`filter-btn ${activeEndpoint === "audit" ? "active" : ""}`}
              style={{ margin: 0, padding: "4px 12px", borderRadius: "2px", fontSize: "11px" }}
            >
              POST /v1/audit
            </button>
            <button
              onClick={() => { setActiveEndpoint("rewrite"); setApiResponse(null); }}
              className={`filter-btn ${activeEndpoint === "rewrite" ? "active" : ""}`}
              style={{ margin: 0, padding: "4px 12px", borderRadius: "2px", fontSize: "11px" }}
            >
              POST /v1/rewrite
            </button>
          </div>
        </div>

        <div className="panel-body" style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "24px", overflowY: "visible" }}>
          
          {/* Playground Inputs */}
          <div>
            <h3 style={{ fontSize: "14px", fontWeight: 700, marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
              <Zap size={15} style={{ color: "hsl(var(--warning))" }} />
              API Parameters Payload
            </h3>
            
            {activeEndpoint === "rewrite" && (
              <>
                <label className="sandbox-label">Raw Title</label>
                <input 
                  type="text" 
                  value={inputTitle} 
                  onChange={(e) => setInputTitle(e.target.value)} 
                  className="sandbox-input"
                />

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div>
                    <label className="sandbox-label">Target CVE / Scope</label>
                    <input 
                      type="text" 
                      value={inputLocation} 
                      onChange={(e) => setInputLocation(e.target.value)} 
                      className="sandbox-input"
                      style={{ fontFamily: "var(--font-mono)" }}
                    />
                  </div>
                  <div>
                    <label className="sandbox-label">Source Brand</label>
                    <input 
                      type="text" 
                      value={inputSource} 
                      onChange={(e) => setInputSource(e.target.value)} 
                      className="sandbox-input"
                    />
                  </div>
                </div>
              </>
            )}

            <label className="sandbox-label">{activeEndpoint === "audit" ? "Content to audit (raw text)" : "Raw Body Text"}</label>
            <textarea
              value={inputContent}
              onChange={(e) => setInputContent(e.target.value)}
              className="sandbox-textarea"
              style={{ height: activeEndpoint === "audit" ? "200px" : "140px" }}
            ></textarea>

            <button 
              onClick={executePlaygroundRequest}
              disabled={loading}
              className="btn btn-primary"
              style={{ width: "100%", height: "46px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
            >
              <Play size={16} />
              {loading ? "Transmitting..." : "Send Request Protocol"}
            </button>

            {/* Integration Snippets */}
            <div style={{ marginTop: "32px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <span className="sandbox-label" style={{ margin: 0, display: "flex", alignItems: "center", gap: "6px" }}>
                  <Code2 size={14} />
                  Client Integration Scripts
                </span>
                
                <div style={{ display: "flex", gap: "4px" }}>
                  {["curl", "js", "python"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveSnippetTab(tab)}
                      style={{
                        padding: "2px 8px", fontSize: "10px", fontWeight: 700, borderRadius: "2px", border: "none", cursor: "pointer",
                        background: activeSnippetTab === tab ? "hsl(var(--primary))" : "hsl(var(--muted))",
                        color: activeSnippetTab === tab ? "#000000" : "hsl(var(--muted-foreground))"
                      }}
                    >
                      {tab === "curl" ? "cURL" : tab === "js" ? "JS (Fetch)" : "Python"}
                    </button>
                  ))}
                </div>
              </div>

              <pre 
                style={{
                  background: "hsl(var(--muted))", padding: "16px", borderRadius: "var(--radius-sm)", border: "1px solid hsl(var(--border))",
                  fontSize: "11px", fontFamily: "var(--font-mono)", overflowX: "auto", color: "hsl(var(--foreground))", whiteSpace: "pre-wrap"
                }}
              >
                {activeSnippetTab === "curl" && getCurlSnippet()}
                {activeSnippetTab === "js" && getJsSnippet()}
                {activeSnippetTab === "python" && getPythonSnippet()}
              </pre>
            </div>

          </div>

          {/* Response Viewer */}
          <div style={{ borderLeft: "1px solid hsl(var(--border))", paddingLeft: "24px", display: "flex", flexDirection: "column", height: "100%" }}>
            <h3 style={{ fontSize: "14px", fontWeight: 700, marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
              <Terminal size={15} style={{ color: "hsl(var(--primary))" }} />
              API Server Response Payload
            </h3>
            
            <div 
              style={{
                flex: 1, background: "hsl(var(--muted))", border: "1px solid hsl(var(--border))", borderRadius: "var(--radius-sm)",
                padding: "16px", fontFamily: "var(--font-mono)", fontSize: "11px", overflowY: "auto", position: "relative",
                maxHeight: "500px", minHeight: "350px", display: "flex", flexDirection: "column"
              }}
            >
              {loading ? (
                <div className="flex-center sandbox-loading-pulse" style={{ flex: 1, flexDirection: "column", gap: "10px" }}>
                  <Cpu size={32} style={{ color: "hsl(var(--primary))" }} />
                  <span style={{ fontWeight: 800 }}>Awaiting server response...</span>
                </div>
              ) : apiResponse ? (
                <pre style={{ margin: 0, whiteSpace: "pre-wrap", overflowX: "auto", color: "hsl(var(--foreground))" }}>
                  {JSON.stringify(apiResponse, null, 2)}
                </pre>
              ) : (
                <div className="flex-center" style={{ flex: 1, flexDirection: "column", gap: "10px", color: "hsl(var(--muted-foreground))", textAlign: "center" }}>
                  <Terminal size={32} style={{ opacity: 0.3 }} />
                  <span>Request console empty.<br />Click "Send Request Protocol" to transmit API payload.</span>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
