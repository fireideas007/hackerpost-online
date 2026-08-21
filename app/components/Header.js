"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sun, Moon, ShieldAlert, Radio, Code2, Bot, Award } from "lucide-react";

export default function Header() {
  const [theme, setTheme] = useState("dark");
  const pathname = usePathname();

  // Load theme from localStorage on mount (default to dark)
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "dark";
    setTheme(savedTheme);
    document.documentElement.setAttribute("data-theme", savedTheme);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
  };

  return (
    <div className="header-wrapper">
      <header className="container header">
        <Link href="/" className="logo">
          <ShieldAlert size={28} className="logo-icon" style={{ color: "hsl(var(--primary))" }} />
          <span>HackerPost<span>.online</span></span>
        </Link>

        <nav className="nav-links">
          <Link 
            href="/" 
            className={`nav-link ${pathname === "/" ? "active" : ""}`}
          >
            Threat Feed
          </Link>
          <Link 
            href="/benchmarks" 
            className={`nav-link ${pathname === "/benchmarks" ? "active" : ""}`}
            style={{ display: "flex", alignItems: "center", gap: "6px" }}
          >
            <Award size={15} style={{ color: "hsl(var(--warning))" }} />
            AI Benchmarks
            <span style={{ fontSize: "9px", padding: "1px 5px", borderRadius: "2px", background: "hsla(var(--warning), 0.15)", color: "hsl(var(--warning))", border: "1px solid hsla(var(--warning), 0.3)", fontWeight: 800 }}>
              NEW
            </span>
          </Link>
          <Link 
            href="/agent" 
            className={`nav-link ${pathname === "/agent" ? "active" : ""}`}
            style={{ display: "flex", alignItems: "center", gap: "6px" }}
          >
            <Bot size={16} style={{ color: "hsl(var(--primary))" }} />
            AI Agent
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "hsl(var(--success))", boxShadow: "0 0 6px hsl(var(--success))" }} />
          </Link>
          <Link 
            href="/admin" 
            className={`nav-link ${pathname === "/admin" ? "active" : ""}`}
            style={{ display: "flex", alignItems: "center", gap: "6px" }}
          >
            <Radio size={16} className="sandbox-loading-pulse" style={{ color: "hsl(var(--danger))" }} />
            Ingestion Hub
          </Link>
          <Link 
            href="/b2b" 
            className={`nav-link ${pathname === "/b2b" ? "active" : ""}`}
            style={{ display: "flex", alignItems: "center", gap: "6px" }}
          >
            <Code2 size={16} />
            Integrations
          </Link>
          
          <button 
            onClick={toggleTheme} 
            className="theme-toggle" 
            aria-label="Toggle dark/light mode"
            title="Toggle Theme"
          >
            {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
          </button>
        </nav>
      </header>
    </div>
  );
}
