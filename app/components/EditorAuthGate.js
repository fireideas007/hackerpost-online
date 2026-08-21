"use client";

import { useState, useEffect } from "react";
import { Lock, ShieldAlert, Key, CheckCircle2, ArrowRight, Bot } from "lucide-react";

export default function EditorAuthGate({ children, title = "Editor Access Gate" }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkToken = async () => {
      const savedToken = localStorage.getItem("hp_editor_token");
      if (savedToken) {
        try {
          const res = await fetch("/api/auth", {
            headers: { "Authorization": `Bearer ${savedToken}` }
          });
          const data = await res.json();
          if (data.authenticated) {
            setIsAuthenticated(true);
          } else {
            localStorage.removeItem("hp_editor_token");
          }
        } catch (_) {
          localStorage.removeItem("hp_editor_token");
        }
      }
      setCheckingAuth(false);
    };

    checkToken();
  }, []);

  const handleLogin = async (e) => {
    e?.preventDefault();
    if (!passcode.trim() || loading) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode: passcode.trim() })
      });

      const data = await res.json();
      if (data.success && data.token) {
        localStorage.setItem("hp_editor_token", data.token);
        setIsAuthenticated(true);
      } else {
        setError(data.error || "Authentication failed. Invalid passcode.");
      }
    } catch (err) {
      setError("Network error contacting security service.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("hp_editor_token");
    setIsAuthenticated(false);
    setPasscode("");
  };

  if (checkingAuth) {
    return (
      <div className="container flex-center" style={{ minHeight: "70vh", flexDirection: "column", gap: "16px" }}>
        <Lock size={40} className="sandbox-loading-pulse" style={{ color: "hsl(var(--primary))" }} />
        <p style={{ fontSize: "14px", fontFamily: "var(--font-mono)", color: "hsl(var(--muted-foreground))" }}>
          Verifying security clearance tokens...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container" style={{ minHeight: "75vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
        <div style={{
          width: "100%",
          maxWidth: "480px",
          background: "hsl(var(--card))",
          border: "1px solid hsl(var(--border))",
          borderRadius: "var(--radius-md)",
          padding: "36px",
          boxShadow: "var(--shadow-lg)",
          position: "relative",
          overflow: "hidden"
        }}>
          {/* Cyber glowing border top accent */}
          <div style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "3px",
            background: "linear-gradient(90deg, hsl(var(--primary)), hsl(var(--danger)))"
          }} />

          <div style={{ textAlign: "center", marginBottom: "28px" }}>
            <div style={{
              width: "56px",
              height: "56px",
              borderRadius: "50%",
              background: "hsla(var(--primary), 0.1)",
              border: "1px solid hsla(var(--primary), 0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px auto",
              color: "hsl(var(--primary))"
            }}>
              <Lock size={26} />
            </div>

            <span style={{
              fontSize: "10px",
              fontWeight: 800,
              letterSpacing: "1px",
              textTransform: "uppercase",
              padding: "3px 8px",
              borderRadius: "var(--radius-sm)",
              background: "hsla(var(--danger), 0.1)",
              color: "hsl(var(--danger))",
              border: "1px solid hsla(var(--danger), 0.2)",
              fontFamily: "var(--font-mono)"
            }}>
              RESTRICTED NEWSROOM ACCESS
            </span>

            <h2 style={{ fontSize: "22px", fontWeight: 800, textTransform: "uppercase", marginTop: "12px", letterSpacing: "-0.5px" }}>
              {title}
            </h2>
            <p style={{ fontSize: "13px", color: "hsl(var(--muted-foreground))", marginTop: "6px" }}>
              Enter the authorized CISO / Editor Passcode to control the autonomous publishing agent and threat ingestion pipeline.
            </p>
          </div>

          {error && (
            <div style={{
              background: "hsla(var(--danger), 0.1)",
              border: "1px solid hsla(var(--danger), 0.3)",
              color: "hsl(var(--danger))",
              padding: "10px 14px",
              borderRadius: "var(--radius-sm)",
              fontSize: "12px",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "20px"
            }}>
              <ShieldAlert size={16} />
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label className="sandbox-label" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Key size={13} style={{ color: "hsl(var(--primary))" }} />
                Editor Passcode
              </label>
              <input
                type="password"
                placeholder="Enter passcode (e.g. ciso-hackerpost-2026)..."
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                autoFocus
                className="sandbox-input"
                style={{ height: "46px", fontFamily: "var(--font-mono)", fontSize: "13px", letterSpacing: "1px" }}
              />
            </div>

            <button
              type="submit"
              disabled={loading || !passcode.trim()}
              className="btn btn-primary"
              style={{ width: "100%", height: "46px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
            >
              {loading ? (
                <span className="sandbox-loading-pulse">Verifying Security Clearance...</span>
              ) : (
                <>
                  Authorize Session
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div style={{ marginTop: "24px", paddingTop: "16px", borderTop: "1px solid hsl(var(--border))", textAlign: "center" }}>
            <span style={{ fontSize: "11px", color: "hsl(var(--muted-foreground))" }}>
              Default Editor Passcode: <code style={{ color: "hsl(var(--primary))", background: "hsla(var(--primary), 0.1)", padding: "2px 6px", borderRadius: "3px" }}>ciso-hackerpost-2026</code>
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div style={{
        background: "hsla(var(--primary), 0.04)",
        borderBottom: "1px solid hsl(var(--border))",
        padding: "8px 0",
        fontSize: "11px",
        color: "hsl(var(--muted-foreground))"
      }}>
        <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ display: "flex", alignItems: "center", gap: "6px", fontFamily: "var(--font-mono)" }}>
            <CheckCircle2 size={13} style={{ color: "hsl(var(--success))" }} />
            AUTHENTICATED EDITOR SESSION ACTIVE
          </span>
          <button
            onClick={handleLogout}
            style={{
              background: "transparent",
              border: "1px solid hsl(var(--border))",
              color: "hsl(var(--muted-foreground))",
              padding: "2px 8px",
              borderRadius: "var(--radius-sm)",
              fontSize: "10px",
              cursor: "pointer",
              fontWeight: 700
            }}
            title="Lock Newsroom"
          >
            Lock Session / Logout
          </button>
        </div>
      </div>
      {children}
    </>
  );
}
