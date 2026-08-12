"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sun, Moon, Newspaper, Radio, Code2 } from "lucide-react";

export default function Header() {
  const [theme, setTheme] = useState("light");
  const pathname = usePathname();

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
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
          <Newspaper size={28} className="logo-icon" style={{ color: "hsl(var(--primary))" }} />
          <span>HyperLocal.AI</span>
        </Link>

        <nav className="nav-links">
          <Link 
            href="/" 
            className={`nav-link ${pathname === "/" ? "active" : ""}`}
          >
            Home Feed
          </Link>
          <Link 
            href="/admin" 
            className={`nav-link ${pathname === "/admin" ? "active" : ""}`}
            style={{ display: "flex", alignItems: "center", gap: "6px" }}
          >
            <Radio size={16} className="sandbox-loading-pulse" style={{ color: "hsl(var(--danger))" }} />
            AI Ingestion Dashboard
          </Link>
          <Link 
            href="/b2b" 
            className={`nav-link ${pathname === "/b2b" ? "active" : ""}`}
            style={{ display: "flex", alignItems: "center", gap: "6px" }}
          >
            <Code2 size={16} />
            Developer API
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

