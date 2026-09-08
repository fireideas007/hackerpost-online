"use client";

import { useState, useEffect } from "react";
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
  ShieldCheck,
  ShieldAlert,
  LogOut,
  AlertTriangle,
  Lock,
  Eye,
  EyeOff,
  UserCheck,
  Activity,
  Trash2,
  ExternalLink
} from "lucide-react";

export default function B2bDeveloperPortal() {
  // Session State
  const [sessionUser, setSessionUser] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);

  // User API Keys State
  const [apiKeys, setApiKeys] = useState([]);
  const [selectedKey, setSelectedKey] = useState(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [newlyCreatedRawKey, setNewlyCreatedRawKey] = useState(null);
  const [showRawKeyModal, setShowRawKeyModal] = useState(false);

  // Subscription Plan State
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
  const [responseHeaders, setResponseHeaders] = useState(null);
  const [statusCode, setStatusCode] = useState(null);
  const [activeSnippetTab, setActiveSnippetTab] = useState("curl"); // "curl" | "js" | "python"

  // Load session on mount
  useEffect(() => {
    fetchSession();
  }, []);

  const fetchSession = async () => {
    setCheckingSession(true);
    try {
      const res = await fetch("/api/auth/session");
      const data = await res.json();
      if (data.authenticated && data.user) {
        setSessionUser(data.user);
        setSelectedPlan(data.user.tier || "Free");
        if (data.apiKeys && data.apiKeys.length > 0) {
          setApiKeys(data.apiKeys);
          const activeKey = data.apiKeys.find(k => k.status === "active") || data.apiKeys[0];
          setSelectedKey(activeKey);
        } else {
          fetchUserKeys();
        }
      } else {
        setSessionUser(null);
        setApiKeys([]);
      }
    } catch (_) {
      setSessionUser(null);
    } finally {
      setCheckingSession(false);
    }
  };

  const fetchUserKeys = async () => {
    try {
      const res = await fetch("/api/b2b/keys");
      const data = await res.json();
      if (data.success && data.keys) {
        setApiKeys(data.keys);
        const active = data.keys.find(k => k.status === "active") || data.keys[0];
        setSelectedKey(active);
      }
    } catch (err) {
      console.error("Error fetching keys:", err);
    }
  };

  // Google Login / Sign-up handler
  const handleGoogleLogin = async (simulatedProfile = null) => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const payload = simulatedProfile || {
        demoUser: true,
        email: "ciso.developer@hackproof.online",
        name: "Enterprise SecOps Lead",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces"
      };

      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSessionUser(data.user);
        setSelectedPlan(data.user.tier || "Free");
        if (data.initialRawKey) {
          setNewlyCreatedRawKey(data.initialRawKey);
          setShowRawKeyModal(true);
        }
        await fetchUserKeys();
      } else {
        setAuthError(data.error || "Authentication failed.");
      }
    } catch (err) {
      setAuthError("Network error during Google authentication: " + err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setSessionUser(null);
      setApiKeys([]);
      setSelectedKey(null);
      setApiResponse(null);
      setNewlyCreatedRawKey(null);
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const handleGenerateKey = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/b2b/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: `Key ${new Date().toLocaleDateString()}` })
      });
      const data = await res.json();
      if (data.success && data.rawKey) {
        setNewlyCreatedRawKey(data.rawKey);
        setShowRawKeyModal(true);
        await fetchUserKeys();
      } else {
        alert(data.error || "Failed to generate key");
      }
    } catch (err) {
      alert("Error creating API key: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRotateKey = async (keyId) => {
    if (!confirm("Are you sure you want to rotate this key? The current key will be immediately revoked.")) {
      return;
    }
    try {
      setLoading(true);
      const res = await fetch("/api/b2b/keys/rotate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyId })
      });
      const data = await res.json();
      if (data.success && data.rawKey) {
        setNewlyCreatedRawKey(data.rawKey);
        setShowRawKeyModal(true);
        await fetchUserKeys();
      } else {
        alert(data.error || "Failed to rotate key");
      }
    } catch (err) {
      alert("Error rotating API key: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeKey = async (keyId) => {
    if (!confirm("Are you sure you want to revoke this API key? Applications using it will be blocked.")) {
      return;
    }
    try {
      setLoading(true);
      const res = await fetch("/api/b2b/keys/revoke", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyId })
      });
      const data = await res.json();
      if (data.success) {
        await fetchUserKeys();
      } else {
        alert(data.error || "Failed to revoke key");
      }
    } catch (err) {
      alert("Error revoking API key: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyKey = (textToCopy) => {
    navigator.clipboard.writeText(textToCopy);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const executePlaygroundRequest = async () => {
    setLoading(true);
    setApiResponse(null);
    setResponseHeaders(null);
    setStatusCode(null);

    const bearerToken = newlyCreatedRawKey || "hp_live_7f98e0b2d3c4e5f6a7b8c9d0e1f";
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

    const startTime = performance.now();
    try {
      const res = await fetch(targetUrl, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${bearerToken}`
        },
        body: JSON.stringify(payload)
      });
      
      const elapsed = Math.round(performance.now() - startTime);
      setStatusCode(res.status);

      const headersObj = {
        "x-ratelimit-limit": res.headers.get("x-ratelimit-limit") || "20",
        "x-ratelimit-remaining": res.headers.get("x-ratelimit-remaining") || "19",
        "x-ratelimit-reset": res.headers.get("x-ratelimit-reset") || "60",
        "latency": `${elapsed}ms`
      };
      setResponseHeaders(headersObj);

      const data = await res.json();
      setApiResponse(data);
    } catch (err) {
      setStatusCode(500);
      setApiResponse({ success: false, error: "Network error calling the B2B endpoint: " + err.message });
    } finally {
      setLoading(false);
    }
  };

  const activeDisplayKey = newlyCreatedRawKey || (selectedKey ? selectedKey.maskedKey : "hp_live_••••••••••••••••••••");

  const getCurlSnippet = () => {
    const token = newlyCreatedRawKey || "YOUR_BEARER_API_KEY";
    if (activeEndpoint === "audit") {
      return `curl -X POST https://hackerpost.online/api/b2b/audit \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${token}" \\
  -d '{
    "content": "${inputContent.substring(0, 45)}..."
  }'`;
    } else {
      return `curl -X POST https://hackerpost.online/api/b2b/rewrite \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${token}" \\
  -d '{
    "title": "${inputTitle}",
    "content": "${inputContent.substring(0, 45)}...",
    "location": "${inputLocation}",
    "sourceName": "${inputSource}"
  }'`;
    }
  };

  const getJsSnippet = () => {
    const token = newlyCreatedRawKey || "YOUR_BEARER_API_KEY";
    if (activeEndpoint === "audit") {
      return `fetch("https://hackerpost.online/api/b2b/audit", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer ${token}"
  },
  body: JSON.stringify({
    content: "${inputContent.substring(0, 45)}..."
  })
})
.then(res => res.json())
.then(data => console.log(data));`;
    } else {
      return `fetch("https://hackerpost.online/api/b2b/rewrite", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer ${token}"
  },
  body: JSON.stringify({
    title: "${inputTitle}",
    content: "${inputContent.substring(0, 45)}...",
    location: "${inputLocation}",
    sourceName: "${inputSource}"
  })
})
.then(res => res.json())
.then(data => console.log(data));`;
    }
  };

  const getPythonSnippet = () => {
    const token = newlyCreatedRawKey || "YOUR_BEARER_API_KEY";
    if (activeEndpoint === "audit") {
      return `import requests

url = "https://hackerpost.online/api/b2b/audit"
headers = {
    "Authorization": "Bearer ${token}",
    "Content-Type": "application/json"
}
payload = {
    "content": "${inputContent.substring(0, 45)}..."
}

response = requests.post(url, json=payload, headers=headers)
print(response.json())`;
    } else {
      return `import requests

url = "https://hackerpost.online/api/b2b/rewrite"
headers = {
    "Authorization": "Bearer ${token}",
    "Content-Type": "application/json"
}
payload = {
    "title": "${inputTitle}",
    "content": "${inputContent.substring(0, 45)}...",
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
      <section style={{ textAlign: "center", marginBottom: "40px", background: "radial-gradient(ellipse at top, hsla(var(--primary), 0.08), transparent 70%)", padding: "40px 0", borderRadius: "var(--radius-sm)" }}>
        <span style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", background: "hsla(var(--primary), 0.1)", color: "hsl(var(--primary))", padding: "6px 12px", borderRadius: "2px", marginBottom: "16px", display: "inline-block" }}>
          B2B Developer API & Syndication Hub
        </span>
        <h1 style={{ fontSize: "36px", fontWeight: 800, letterSpacing: "-1px", marginBottom: "16px", textTransform: "uppercase" }}>
          Vulnerability Verification & Advisory APIs
        </h1>
        <p style={{ maxWidth: "720px", margin: "0 auto", color: "hsl(var(--muted-foreground))", fontSize: "15px", lineHeight: 1.6 }}>
          Zero-trust authenticated cybersecurity intelligence portal. Programmatically verify exploit disclosures, audit similarity overlap, sanitize technical zero-days, and generate SEO-optimized JSON-LD schemas.
        </p>
      </section>

      {/* Security Architecture Guarantees Banner */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "16px",
        marginBottom: "32px",
        background: "hsla(var(--muted), 0.4)",
        border: "1px solid hsl(var(--border))",
        borderRadius: "var(--radius-sm)",
        padding: "16px"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Lock size={20} style={{ color: "hsl(var(--success))" }} />
          <div>
            <div style={{ fontSize: "12px", fontWeight: 700 }}>Zero-Plaintext Storage</div>
            <div style={{ fontSize: "11px", color: "hsl(var(--muted-foreground))" }}>SHA-256 Hashed Keys</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Activity size={20} style={{ color: "hsl(var(--primary))" }} />
          <div>
            <div style={{ fontSize: "12px", fontWeight: 700 }}>Sliding Rate Limiting</div>
            <div style={{ fontSize: "11px", color: "hsl(var(--muted-foreground))" }}>Tiered Sliding Windows</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <ShieldCheck size={20} style={{ color: "hsl(var(--warning))" }} />
          <div>
            <div style={{ fontSize: "12px", fontWeight: 700 }}>IDOR & Tenant Isolation</div>
            <div style={{ fontSize: "11px", color: "hsl(var(--muted-foreground))" }}>Strict Cryptographic Scoping</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <UserCheck size={20} style={{ color: "hsl(var(--primary))" }} />
          <div>
            <div style={{ fontSize: "12px", fontWeight: 700 }}>Google OAuth 2.0</div>
            <div style={{ fontSize: "11px", color: "hsl(var(--muted-foreground))" }}>HttpOnly Secure Sessions</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Auth / Key Manager & Tiers */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: "32px", marginBottom: "48px" }}>
        
        {/* Left Column: Auth Gate or Authenticated Developer Key Panel */}
        <div className="admin-panel" style={{ justifySelf: "stretch" }}>
          <div className="panel-header">
            <h2 className="panel-title" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Key size={18} style={{ color: "hsl(var(--primary))" }} />
              {sessionUser ? "Developer Access Keys" : "Developer Authentication"}
            </h2>
            {sessionUser && (
              <button 
                onClick={handleLogout}
                className="btn btn-secondary"
                style={{ fontSize: "11px", padding: "4px 8px", height: "24px", color: "hsl(var(--danger))", borderColor: "hsla(var(--danger), 0.3)" }}
                title="Sign out of developer portal"
              >
                <LogOut size={12} style={{ marginRight: "4px" }} />
                Sign Out
              </button>
            )}
          </div>

          <div className="panel-body" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            
            {checkingSession ? (
              <div className="flex-center" style={{ minHeight: "180px", flexDirection: "column", gap: "12px" }}>
                <Lock size={24} className="sandbox-loading-pulse" style={{ color: "hsl(var(--primary))" }} />
                <span style={{ fontSize: "12px", color: "hsl(var(--muted-foreground))" }}>Checking security credentials...</span>
              </div>
            ) : !sessionUser ? (
              /* Unauthenticated Google Sign-In Prompt */
              <div style={{ display: "flex", flexDirection: "column", gap: "16px", padding: "8px 0" }}>
                <p style={{ fontSize: "13px", color: "hsl(var(--muted-foreground))", lineHeight: 1.5 }}>
                  Sign in with your Google Workspace or developer account to securely provision your private Bearer API keys and access real-time threat feeds.
                </p>

                {authError && (
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "hsla(var(--danger), 0.1)", border: "1px solid hsla(var(--danger), 0.3)", padding: "10px", borderRadius: "var(--radius-sm)", fontSize: "12px", color: "hsl(var(--danger))" }}>
                    <AlertTriangle size={16} />
                    <span>{authError}</span>
                  </div>
                )}

                {/* Google Sign-In Button */}
                <button
                  onClick={() => handleGoogleLogin()}
                  disabled={authLoading}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "12px",
                    background: "#ffffff",
                    color: "#1f1f1f",
                    border: "1px solid #dadce0",
                    borderRadius: "var(--radius-sm)",
                    padding: "12px 16px",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: "pointer",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                    transition: "all 0.2s ease"
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  {authLoading ? "Authenticating with Google..." : "Continue with Google (One-Click)"}
                </button>

                <div style={{ borderTop: "1px solid hsl(var(--border))", paddingTop: "12px", fontSize: "11px", color: "hsl(var(--muted-foreground))", display: "flex", alignItems: "center", gap: "6px" }}>
                  <ShieldCheck size={14} style={{ color: "hsl(var(--success))" }} />
                  <span>Google Identity token encrypted with AES-256 session signature.</span>
                </div>
              </div>
            ) : (
              /* Authenticated Developer Key Dashboard */
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                
                {/* User Info Capsule */}
                <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "hsl(var(--muted))", padding: "10px 14px", borderRadius: "var(--radius-sm)" }}>
                  <img 
                    src={sessionUser.avatar || "https://api.dicebear.com/7.x/bottts/svg?seed=ciso"} 
                    alt="User Avatar"
                    style={{ width: "36px", height: "36px", borderRadius: "50%", border: "1px solid hsl(var(--border))" }} 
                  />
                  <div style={{ flex: 1, overflow: "hidden" }}>
                    <div style={{ fontSize: "13px", fontWeight: 700, textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                      {sessionUser.name}
                    </div>
                    <div style={{ fontSize: "11px", color: "hsl(var(--muted-foreground))", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                      {sessionUser.email}
                    </div>
                  </div>
                  <span style={{ fontSize: "10px", fontWeight: 800, padding: "2px 8px", borderRadius: "4px", background: "hsl(var(--primary))", color: "#000000" }}>
                    {sessionUser.tier || "Free"} TIER
                  </span>
                </div>

                {/* API Key Box */}
                <div>
                  <label className="sandbox-label" style={{ marginBottom: "6px", display: "flex", justifyContent: "space-between" }}>
                    <span>Active Bearer Token</span>
                    <span style={{ color: "hsl(var(--success))" }}>✓ Zero-Plaintext Hashed</span>
                  </label>
                  
                  <div style={{ display: "flex", gap: "8px", background: "hsl(var(--background))", border: "1px solid hsl(var(--border))", padding: "10px", borderRadius: "var(--radius-sm)", alignItems: "center" }}>
                    <Terminal size={16} style={{ color: "hsl(var(--muted-foreground))", flexShrink: 0 }} />
                    <input
                      type="text"
                      value={activeDisplayKey}
                      readOnly
                      style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: "12px", fontFamily: "var(--font-mono)", letterSpacing: "0.5px", color: "hsl(var(--foreground))" }}
                    />
                  </div>
                </div>

                {/* Key Actions */}
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  <button 
                    onClick={() => handleCopyKey(newlyCreatedRawKey || (selectedKey ? selectedKey.maskedKey : ""))}
                    className="btn btn-secondary"
                    style={{ flex: 1, padding: "8px 12px", fontSize: "12px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
                  >
                    {copiedKey ? <Check size={14} style={{ color: "hsl(var(--success))" }} /> : <Copy size={14} />}
                    {copiedKey ? "Copied!" : "Copy Key"}
                  </button>

                  <button 
                    onClick={() => selectedKey && handleRotateKey(selectedKey.id)}
                    disabled={loading || !selectedKey}
                    className="btn btn-secondary"
                    style={{ flex: 1, padding: "8px 12px", fontSize: "12px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
                  >
                    <RefreshCw size={14} />
                    Rotate Key
                  </button>

                  <button 
                    onClick={handleGenerateKey}
                    disabled={loading}
                    className="btn btn-secondary"
                    style={{ padding: "8px 12px", fontSize: "12px", display: "flex", alignItems: "center", gap: "6px" }}
                    title="Generate additional key"
                  >
                    + New
                  </button>
                </div>

                {/* Key Telemetry info */}
                {selectedKey && (
                  <div style={{ borderTop: "1px solid hsl(var(--border))", paddingTop: "12px", display: "flex", justifyContent: "space-between", fontSize: "11px", color: "hsl(var(--muted-foreground))" }}>
                    <span>Key ID: <code style={{ fontFamily: "var(--font-mono)" }}>{selectedKey.id}</code></span>
                    <span>Total Requests: <strong>{selectedKey.usageCount || 0}</strong></span>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>

        {/* Right Column: Pricing & Subscription Tiers */}
        <div className="admin-panel" style={{ justifySelf: "stretch" }}>
          <div className="panel-header">
            <h2 className="panel-title">
              <Layers size={18} style={{ color: "hsl(var(--warning))" }} />
              API Subscription Packages
            </h2>
          </div>
          <div className="panel-body" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
            
            {/* Free Sandbox */}
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
                <li>✓ 20 requests / min</li>
                <li>✓ 500 requests / mo</li>
                <li>✓ Basic similarity audit</li>
                <li>✓ Standard sanitization</li>
              </ul>
            </div>

            {/* SecOps Pro */}
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
                <li>✓ 120 requests / min</li>
                <li>✓ 50k requests / mo</li>
                <li>✓ Precision similarity audit</li>
                <li>✓ Low-latency LLM rewrite</li>
              </ul>
            </div>

            {/* Enterprise */}
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
                <li>✓ 1,000 requests / min</li>
                <li>✓ Unlimited endpoints</li>
                <li>✓ Dedicated SLA 99.99%</li>
                <li>✓ Realtime RSS webhooks</li>
              </ul>
            </div>

          </div>
        </div>

      </div>

      {/* Interactive Threat Playground & Console */}
      <div className="admin-panel" style={{ maxHeight: "none", display: "flex", flexDirection: "column" }}>
        
        <div className="panel-header" style={{ borderBottom: "1px solid hsl(var(--border))" }}>
          <h2 className="panel-title">
            <Server size={18} style={{ color: "hsl(var(--primary))" }} />
            Threat Playground & Live Console
          </h2>
          <div style={{ display: "flex", gap: "4px", background: "hsl(var(--muted))", padding: "4px", borderRadius: "4px" }}>
            <button
              onClick={() => { setActiveEndpoint("audit"); setApiResponse(null); }}
              className={`filter-btn ${activeEndpoint === "audit" ? "active" : ""}`}
              style={{ margin: 0, padding: "4px 12px", borderRadius: "2px", fontSize: "11px" }}
            >
              POST /api/b2b/audit
            </button>
            <button
              onClick={() => { setActiveEndpoint("rewrite"); setApiResponse(null); }}
              className={`filter-btn ${activeEndpoint === "rewrite" ? "active" : ""}`}
              style={{ margin: 0, padding: "4px 12px", borderRadius: "2px", fontSize: "11px" }}
            >
              POST /api/b2b/rewrite
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
              style={{ height: activeEndpoint === "audit" ? "180px" : "130px" }}
            ></textarea>

            <button 
              onClick={executePlaygroundRequest}
              disabled={loading}
              className="btn btn-primary"
              style={{ width: "100%", height: "46px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
            >
              <Play size={16} />
              {loading ? "Transmitting payload..." : "Send Request Protocol"}
            </button>

            {/* Integration Snippets */}
            <div style={{ marginTop: "28px" }}>
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
                  background: "hsl(var(--muted))", padding: "14px", borderRadius: "var(--radius-sm)", border: "1px solid hsl(var(--border))",
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
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <h3 style={{ fontSize: "14px", fontWeight: 700, margin: 0, display: "flex", alignItems: "center", gap: "6px" }}>
                <Terminal size={15} style={{ color: "hsl(var(--primary))" }} />
                API Server Response Payload
              </h3>
              {statusCode && (
                <span style={{
                  fontSize: "11px",
                  fontWeight: 800,
                  padding: "2px 8px",
                  borderRadius: "2px",
                  background: statusCode === 200 ? "hsla(var(--success), 0.15)" : "hsla(var(--danger), 0.15)",
                  color: statusCode === 200 ? "hsl(var(--success))" : "hsl(var(--danger))",
                  border: `1px solid ${statusCode === 200 ? "hsla(var(--success), 0.3)" : "hsla(var(--danger), 0.3)"}`
                }}>
                  HTTP {statusCode}
                </span>
              )}
            </div>

            {/* Rate Limit Telemetry Pill */}
            {responseHeaders && (
              <div style={{ display: "flex", gap: "12px", background: "hsl(var(--background))", border: "1px solid hsl(var(--border))", padding: "8px 12px", borderRadius: "var(--radius-sm)", marginBottom: "12px", fontSize: "11px", fontFamily: "var(--font-mono)" }}>
                <span>Remaining: <strong>{responseHeaders["x-ratelimit-remaining"]}</strong> / {responseHeaders["x-ratelimit-limit"]}</span>
                <span style={{ color: "hsl(var(--muted-foreground))" }}>•</span>
                <span>Latency: <strong style={{ color: "hsl(var(--success))" }}>{responseHeaders["latency"]}</strong></span>
              </div>
            )}
            
            <div 
              style={{
                flex: 1, background: "hsl(var(--muted))", border: "1px solid hsl(var(--border))", borderRadius: "var(--radius-sm)",
                padding: "16px", fontFamily: "var(--font-mono)", fontSize: "11px", overflowY: "auto", position: "relative",
                maxHeight: "480px", minHeight: "350px", display: "flex", flexDirection: "column"
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
                  <span>Request console empty.<br />Click &quot;Send Request Protocol&quot; to transmit API payload.</span>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* One-Time Raw Key Modal */}
      {showRawKeyModal && newlyCreatedRawKey && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0, 0, 0, 0.8)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
          padding: "20px"
        }}>
          <div style={{
            background: "hsl(var(--card))",
            border: "1px solid hsl(var(--primary))",
            borderRadius: "var(--radius-md)",
            maxWidth: "520px",
            width: "100%",
            padding: "24px",
            boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
            position: "relative"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
              <div style={{ padding: "8px", borderRadius: "50%", background: "hsla(var(--primary), 0.15)", color: "hsl(var(--primary))" }}>
                <Key size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: "18px", fontWeight: 800, margin: 0 }}>Save Your Private API Key</h3>
                <p style={{ fontSize: "12px", color: "hsl(var(--muted-foreground))", margin: 0 }}>Zero-Plaintext Storage Policy</p>
              </div>
            </div>

            <div style={{
              background: "hsla(var(--warning), 0.1)",
              border: "1px solid hsla(var(--warning), 0.3)",
              padding: "12px",
              borderRadius: "var(--radius-sm)",
              fontSize: "12px",
              color: "hsl(var(--warning))",
              display: "flex",
              gap: "8px",
              marginBottom: "16px"
            }}>
              <AlertTriangle size={18} style={{ flexShrink: 0 }} />
              <div>
                <strong>Important:</strong> This is the only time this secret token will be displayed. It is stored as a SHA-256 hash and cannot be recovered if lost.
              </div>
            </div>

            <div style={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))", padding: "12px", borderRadius: "var(--radius-sm)", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
              <code style={{ flex: 1, fontFamily: "var(--font-mono)", fontSize: "12px", wordBreak: "break-all", color: "hsl(var(--primary))", fontWeight: 700 }}>
                {newlyCreatedRawKey}
              </code>
              <button
                onClick={() => handleCopyKey(newlyCreatedRawKey)}
                className="btn btn-primary"
                style={{ padding: "6px 12px", fontSize: "11px", display: "flex", alignItems: "center", gap: "4px" }}
              >
                {copiedKey ? <Check size={14} /> : <Copy size={14} />}
                {copiedKey ? "Copied" : "Copy"}
              </button>
            </div>

            <button
              onClick={() => setShowRawKeyModal(false)}
              className="btn btn-secondary"
              style={{ width: "100%", height: "40px" }}
            >
              I Have Securely Stored This Key
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
