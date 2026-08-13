"use client";

import { useEffect, useState } from "react";
import { ShieldAlert } from "lucide-react";

export default function Ticker() {
  const [tickerItems, setTickerItems] = useState([
    "CRITICAL ALERT: Zero-day remote code execution vulnerability identified in OpenSSH (sshd) under active scan telemetry.",
    "THREAT BULLETIN: Active ransomware campaign targeting VMware ESXi hypervisors. Mitigation recommended immediately.",
    "BREACH LOG: Enterprise transactional database leak exposed. Incident response teams active.",
    "INTEL BRIEF: Cyber group Storm-1204 observed deploying double-free kernel exploits in local systems."
  ]);

  useEffect(() => {
    fetch("/api/news")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.published && data.published.length > 0) {
          const titles = data.published.map(
            (art) => `THREAT BULLETIN: ${art.title} [${art.cve || art.location || "UNTAGGED"}]`
          );
          setTickerItems((prev) => [...titles, ...prev]);
        }
      })
      .catch((err) => console.log("Ticker fetch error", err));
  }, []);

  return (
    <div className="ticker-wrapper">
      <div className="ticker-label">
        <ShieldAlert size={14} style={{ marginRight: "6px" }} />
        Threat Stream
      </div>
      <div className="ticker-content">
        {tickerItems.map((item, idx) => (
          <div key={idx} className="ticker-item">
            <span className="ticker-dot"></span>
            {item}
          </div>
        ))}
        {/* Duplicate items for infinite scroll feel */}
        {tickerItems.map((item, idx) => (
          <div key={`dup-${idx}`} className="ticker-item">
            <span className="ticker-dot"></span>
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}
