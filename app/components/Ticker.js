"use client";

import { useEffect, useState } from "react";
import { AlertCircle } from "lucide-react";

export default function Ticker() {
  const [tickerItems, setTickerItems] = useState([
    "WATER SERVICE BULLETIN: Infrastructure upgrades on Broadway Ave scheduled June 15-19. Motorists expect delays.",
    "AIR QUALITY NOTICE: Fine particle warnings active for county valleys. Residents advised to reduce physical strains.",
    "TRANSIT ADVISORY: Red Line schedules modified this weekend due to critical switches maintenance. Shuttle busses available.",
    "EDUCATION IN BRIEF: High School STEM laboratories expansion funded with $1.2M allocation."
  ]);

  // Optionally fetch latest news to populate ticker dynamically
  useEffect(() => {
    fetch("/api/news")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.published && data.published.length > 0) {
          const titles = data.published.map(
            (art) => `LOCAL BRIEF: ${art.title} in ${art.location}`
          );
          // Prepend default urgent bulletins
          setTickerItems((prev) => [...titles, ...prev]);
        }
      })
      .catch((err) => console.log("Ticker fetch error", err));
  }, []);

  return (
    <div className="ticker-wrapper">
      <div className="ticker-label">
        <AlertCircle size={14} style={{ marginRight: "6px" }} />
        Live Feed
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
