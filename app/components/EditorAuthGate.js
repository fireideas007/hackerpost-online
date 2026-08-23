"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Lock, CheckCircle2, Bot, Radio, Award, LogOut, ShieldAlert } from "lucide-react";

export default function EditorAuthGate({ children, title = "Editor Access Gate" }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const checkToken = async () => {
      const savedToken = localStorage.getItem("hp_editor_token");
      if (!savedToken) {
        setCheckingAuth(false);
        router.push(`/admin/login?redirect=${encodeURIComponent(pathname)}`);
        return;
      }

      try {
        const res = await fetch("/api/auth", {
          headers: { "Authorization": `Bearer ${savedToken}` }
        });
        const data = await res.json();
        if (data.authenticated) {
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem("hp_editor_token");
          router.push(`/admin/login?redirect=${encodeURIComponent(pathname)}`);
        }
      } catch (_) {
        localStorage.removeItem("hp_editor_token");
        router.push(`/admin/login?redirect=${encodeURIComponent(pathname)}`);
      } finally {
        setCheckingAuth(false);
      }
    };

    checkToken();
  }, [pathname, router]);

  const handleLogout = () => {
    localStorage.removeItem("hp_editor_token");
    setIsAuthenticated(false);
    router.push("/");
  };

  if (checkingAuth) {
    return (
      <div className="container flex-center" style={{ minHeight: "70vh", flexDirection: "column", gap: "16px" }}>
        <Lock size={40} className="sandbox-loading-pulse" style={{ color: "hsl(var(--primary))" }} />
        <p style={{ fontSize: "13px", fontFamily: "var(--font-mono)", color: "hsl(var(--muted-foreground))" }}>
          Verifying administrator security clearance...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container flex-center" style={{ minHeight: "70vh", flexDirection: "column", gap: "16px" }}>
        <ShieldAlert size={40} style={{ color: "hsl(var(--danger))" }} />
        <h2 style={{ fontSize: "18px", fontWeight: 800 }}>Redirecting to Admin Login Portal...</h2>
      </div>
    );
  }

  return (
    <>
      {/* Admin Backend Sub-Navigation Bar */}
      <div style={{
        background: "rgba(10, 14, 23, 0.95)",
        borderBottom: "1px solid hsl(var(--border))",
        padding: "10px 0",
        fontSize: "12px",
        position: "sticky",
        top: 0,
        zIndex: 90,
        backdropFilter: "blur(8px)"
      }}>
        <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontFamily: "var(--font-mono)", color: "hsl(var(--success))", fontWeight: 800, fontSize: "11px" }}>
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "currentColor" }} />
              ADMIN CLEARANCE ACTIVE
            </span>

            <nav style={{ display: "flex", gap: "8px" }}>
              <Link
                href="/agent"
                className={`btn ${pathname === "/agent" ? "btn-primary" : "btn-secondary"}`}
                style={{ fontSize: "11px", padding: "4px 12px", height: "28px", display: "inline-flex", alignItems: "center", gap: "6px" }}
              >
                <Bot size={13} />
                AI Agent Command Room
              </Link>
              <Link
                href="/admin"
                className={`btn ${pathname === "/admin" ? "btn-primary" : "btn-secondary"}`}
                style={{ fontSize: "11px", padding: "4px 12px", height: "28px", display: "inline-flex", alignItems: "center", gap: "6px" }}
              >
                <Radio size={13} />
                Threat Ingestion Hub
              </Link>
            </nav>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button
              onClick={handleLogout}
              className="btn btn-secondary"
              style={{
                fontSize: "11px",
                padding: "4px 12px",
                height: "28px",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                color: "hsl(var(--danger))",
                borderColor: "hsla(var(--danger), 0.3)"
              }}
              title="Lock Admin Session"
            >
              <LogOut size={12} />
              Sign Out
            </button>
          </div>
        </div>
      </div>
      {children}
    </>
  );
}
