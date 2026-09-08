"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function Ticker() {
  const [tickerItems, setTickerItems] = useState([
    {
      title: "Zero-day remote code execution vulnerability identified in OpenSSH (sshd) [CVE-2026-3829]",
      url: "/news/critical-rce-regression-openssh-sshd-patched-cve-2026-3829",
      tag: "ZERO-DAY"
    },
    {
      title: "Meta Releases CyberSecEval 3: Standardized Benchmarks for AI in Cybersecurity",
      url: "/benchmarks",
      tag: "AI BENCHMARK"
    },
    {
      title: "Cyera Secures $300M Series D to Lead Enterprise AI Data Security (DSPM)",
      url: "/news/cyera-secures-300m-series-d-enterprise-ai-dspm",
      tag: "FINANCING"
    },
    {
      title: "Palo Alto Networks Completes $650M Strategic Acquisition of Agentic Identity Startup",
      url: "/news/palo-alto-networks-completes-650m-acquisition-agentic-identity",
      tag: "M&A"
    }
  ]);

  useEffect(() => {
    fetch("/api/news")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.published && data.published.length > 0) {
          const fresh = data.published.slice(0, 8).map((art) => ({
            title: art.title,
            url: `/news/${art.slug || art.id}`,
            tag: art.category === "Zero-Days" ? "ZERO-DAY" : (art.category === "SecTech & Startups" ? "FINANCING" : "ADVISORY")
          }));
          setTickerItems(fresh);
        }
      })
      .catch((err) => console.log("Ticker fetch error", err));
  }, []);

  return (
    <div className="ticker-wrapper" aria-label="Breaking Threat Intel Marquee">
      <div className="ticker-label">
        BREAKING WIRE
      </div>
      <div className="ticker-content">
        {tickerItems.map((item, idx) => (
          <Link key={idx} href={item.url} className="ticker-item">
            <span className="ticker-dot"></span>
            <span style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", color: item.tag === "ZERO-DAY" ? "hsl(var(--danger))" : "hsl(var(--primary))" }}>
              [{item.tag}]
            </span>
            <span>{item.title}</span>
          </Link>
        ))}
        {/* Duplicate for smooth marquee looping */}
        {tickerItems.map((item, idx) => (
          <Link key={`dup-${idx}`} href={item.url} className="ticker-item">
            <span className="ticker-dot"></span>
            <span style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", color: item.tag === "ZERO-DAY" ? "hsl(var(--danger))" : "hsl(var(--primary))" }}>
              [{item.tag}]
            </span>
            <span>{item.title}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
