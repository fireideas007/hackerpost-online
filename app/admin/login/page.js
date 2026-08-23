"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Lock, User, Key, ShieldAlert, CheckCircle2, ArrowRight, ShieldCheck, Bot, Radio } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/agent";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingExistingAuth, setCheckingExistingAuth] = useState(true);

  useEffect(() => {
    // If already authenticated, forward to redirectUrl
    const checkToken = async () => {
      const savedToken = localStorage.getItem("hp_editor_token");
      if (savedToken) {
        try {
          const res = await fetch("/api/auth", {
            headers: { "Authorization": `Bearer ${savedToken}` }
          });
          const data = await res.json();
          if (data.authenticated) {
            router.push(redirectUrl);
            return;
          }
        } catch (_) {}
      }
      setCheckingExistingAuth(false);
    };
    checkToken();
  }, [redirectUrl, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password.trim() || loading) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim() || "admin",
          password: password.trim()
        })
      });

      const data = await res.json();
      if (data.success && data.token) {
        localStorage.setItem("hp_editor_token", data.token);
        router.push(redirectUrl);
      } else {
        setError(data.error || "Authentication failed. Invalid administrator credentials.");
      }
    } catch (err) {
      setError("Network error contacting authentication service.");
    } finally {
      setLoading(false);
    }
  };

  if (checkingExistingAuth) {
    return (
      <div className="container flex-center" style={{ minHeight: "70vh", flexDirection: "column", gap: "16px" }}>
        <Lock size={36} className="sandbox-loading-pulse" style={{ color: "hsl(var(--primary))" }} />
        <p style={{ fontSize: "13px", fontFamily: "var(--font-mono)", color: "hsl(var(--muted-foreground))" }}>
          Verifying security clearance tokens...
        </p>
      </div>
    );
  }

  return (
    <div className="container" style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
      <div style={{
        width: "100%",
        maxWidth: "460px",
        background: "hsl(var(--card))",
        border: "1px solid hsl(var(--border))",
        borderRadius: "var(--radius-md)",
        padding: "36px",
        boxShadow: "var(--shadow-lg)",
        position: "relative",
        overflow: "hidden"
      }}>
        {/* Cyber top accent bar */}
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
            <Lock size={24} />
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
            RESTRICTED ADMIN ACCESS
          </span>

          <h1 style={{ fontSize: "24px", fontWeight: 800, textTransform: "uppercase", marginTop: "12px", letterSpacing: "-0.5px" }}>
            HackerPost Newsroom
          </h1>
          <p style={{ fontSize: "13px", color: "hsl(var(--muted-foreground))", marginTop: "6px" }}>
            Sign in with authorized administrator credentials to manage the publishing agent and threat ingestion pipeline.
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

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <div>
            <label className="sandbox-label" style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
              <User size={13} style={{ color: "hsl(var(--primary))" }} />
              Admin Username / Email
            </label>
            <input
              type="text"
              placeholder="admin"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="sandbox-input"
              style={{ height: "46px", fontSize: "13px" }}
              autoFocus
            />
          </div>

          <div>
            <label className="sandbox-label" style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
              <Key size={13} style={{ color: "hsl(var(--primary))" }} />
              Security Password / Passcode
            </label>
            <input
              type="password"
              placeholder="Enter security passcode..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="sandbox-input"
              style={{ height: "46px", fontFamily: "var(--font-mono)", fontSize: "13px", letterSpacing: "1px" }}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !password.trim()}
            className="btn btn-primary"
            style={{ width: "100%", height: "46px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginTop: "6px" }}
          >
            {loading ? (
              <span className="sandbox-loading-pulse">Verifying Security Clearance...</span>
            ) : (
              <>
                Authenticate & Open Control Room
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div style={{ marginTop: "24px", paddingTop: "16px", borderTop: "1px solid hsl(var(--border))", textAlign: "center" }}>
          <span style={{ fontSize: "11px", color: "hsl(var(--muted-foreground))" }}>
            Default Admin Passcode: <code style={{ color: "hsl(var(--primary))", background: "hsla(var(--primary), 0.1)", padding: "2px 6px", borderRadius: "3px" }}>ciso-hackerpost-2026</code>
          </span>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={
      <div className="container flex-center" style={{ minHeight: "70vh" }}>
        <Lock size={36} className="sandbox-loading-pulse" style={{ color: "hsl(var(--primary))" }} />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
