"use client";

import { useState } from "react";
import { 
  Share2, 
  Copy, 
  Check, 
  ExternalLink, 
  Sparkles, 
  Award,
  Send,
  MessageSquare,
  Eye,
  Download,
  Flame
} from "lucide-react";

export default function BenchmarkSocialShare() {
  const [copied, setCopied] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState(false);

  const benchmarkUrl = "https://hackerpost.online/benchmarks";
  const shareTitle = "AI Security Model Leaderboard (2026) — Authoritative LLM Evaluation";
  const sharePreText = "📊 2026 AI Security Model Leaderboard: Claude 3.7 Sonnet, OpenAI o3-mini, Gemini 2.0 Flash Thinking, and DeepSeek-R1 ranked on CVE patching, prompt injection defense, & exploit synthesis. Check live rankings on @HackerPost2:";
  const hashtags = "AISecurity,CyberSecurity,InfoSec,LLM,GenAI,CISO,HackerPost";

  // Share URLs
  const xShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(sharePreText)}&url=${encodeURIComponent(benchmarkUrl)}&hashtags=${encodeURIComponent(hashtags)}`;
  const linkedinShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(benchmarkUrl)}`;
  const redditShareUrl = `https://reddit.com/submit?url=${encodeURIComponent(benchmarkUrl)}&title=${encodeURIComponent(shareTitle + " | HackerPost")}`;
  const telegramShareUrl = `https://t.me/share/url?url=${encodeURIComponent(benchmarkUrl)}&text=${encodeURIComponent(sharePreText)}`;

  const handleCopyLink = async () => {
    try {
      const fullText = `${sharePreText}\n\n🔗 ${benchmarkUrl}\n#${hashtags.split(',').join(' #')}`;
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(fullText);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = fullText;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  return (
    <div style={{
      background: "hsl(var(--card))",
      border: "1px solid hsl(var(--border))",
      borderRadius: "var(--radius-sm)",
      padding: "20px 24px",
      margin: "24px 0",
      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", marginBottom: "16px" }}>
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "11px", fontWeight: 700, color: "hsl(var(--primary))", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "4px" }}>
            <Share2 size={13} />
            Syndicate &amp; Share Intelligence
          </div>
          <h3 style={{ fontSize: "16px", fontWeight: 800, margin: 0, letterSpacing: "-0.3px", color: "hsl(var(--foreground))" }}>
            Share 2026 AI Security Leaderboard
          </h3>
        </div>

        {/* View Share Card graphic toggle */}
        <button
          onClick={() => setShowImagePreview(!showImagePreview)}
          className="btn btn-secondary"
          style={{ fontSize: "11px", padding: "6px 14px", height: "32px", display: "inline-flex", alignItems: "center", gap: "6px" }}
        >
          <Eye size={14} style={{ color: "hsl(var(--primary))" }} />
          {showImagePreview ? "Hide Infographic Card" : "Preview Infographic Card"}
        </button>
      </div>

      {/* Visual Creative Image Infographic Card Preview */}
      {showImagePreview && (
        <div style={{
          marginBottom: "24px",
          padding: "16px",
          background: "hsl(var(--background))",
          border: "1px solid hsl(var(--border))",
          borderRadius: "var(--radius-sm)",
          textAlign: "center"
        }}>
          <div style={{ position: "relative", maxWidth: "800px", margin: "0 auto", overflow: "hidden", borderRadius: "8px", border: "1px solid hsla(var(--primary), 0.3)" }}>
            <img 
              src="/ai-benchmark-card.svg" 
              alt="HackerPost AI Security Model Leaderboard 2026"
              style={{ width: "100%", height: "auto", display: "block" }}
            />
          </div>
          <div style={{ marginTop: "12px", display: "flex", justifyContent: "center", gap: "12px" }}>
            <a 
              href="/ai-benchmark-card.svg" 
              download="hackerpost-ai-security-benchmarks-2026.svg"
              className="btn btn-secondary" 
              style={{ fontSize: "11px", padding: "6px 14px", display: "inline-flex", alignItems: "center", gap: "6px" }}
            >
              <Download size={13} />
              Download Infographic SVG
            </a>
          </div>
        </div>
      )}

      {/* Pre-text Tweet & Post Preview Box */}
      <div style={{
        background: "hsl(var(--background))",
        border: "1px solid hsl(var(--border))",
        borderRadius: "var(--radius-sm)",
        padding: "14px 16px",
        marginBottom: "20px",
        fontSize: "13px",
        fontFamily: "var(--font-mono)",
        color: "hsl(var(--foreground))",
        lineHeight: 1.6,
        position: "relative"
      }}>
        <div style={{ fontSize: "10px", fontWeight: 700, color: "hsl(var(--muted-foreground))", textTransform: "uppercase", marginBottom: "6px", display: "flex", alignItems: "center", gap: "6px" }}>
          <Sparkles size={11} style={{ color: "hsl(var(--primary))" }} />
          Curated Social Pre-Text:
        </div>
        <p style={{ margin: 0 }}>
          {sharePreText} <span style={{ color: "hsl(var(--primary))" }}>{benchmarkUrl}</span> <span style={{ color: "hsl(var(--muted-foreground))" }}>#{hashtags.split(',').join(' #')}</span>
        </p>
      </div>

      {/* 1-Click Social Share Buttons Row */}
      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
        {/* Share to X (Twitter) */}
        <a 
          href={xShareUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn"
          style={{
            background: "#000000",
            color: "#ffffff",
            border: "1px solid #333333",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "12px",
            fontWeight: 700,
            padding: "8px 16px",
            height: "40px"
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
          Post to X (@HackerPost2)
        </a>

        {/* Share to LinkedIn */}
        <a 
          href={linkedinShareUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn"
          style={{
            background: "#0a66c2",
            color: "#ffffff",
            border: "1px solid #0a66c2",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "12px",
            fontWeight: 700,
            padding: "8px 16px",
            height: "40px"
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.27a1.62 1.62 0 0 0-1.63 1.62c0 .9.73 1.63 1.63 1.63a1.63 1.63 0 0 0 1.63-1.63c0-.9-.73-1.62-1.63-1.62z"/>
          </svg>
          Share on LinkedIn
        </a>

        {/* Share to Reddit */}
        <a 
          href={redditShareUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn"
          style={{
            background: "#ff4500",
            color: "#ffffff",
            border: "1px solid #ff4500",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "12px",
            fontWeight: 700,
            padding: "8px 16px",
            height: "40px"
          }}
        >
          <MessageSquare size={14} />
          Submit to Reddit
        </a>

        {/* Share to Telegram */}
        <a 
          href={telegramShareUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn"
          style={{
            background: "#229ed9",
            color: "#ffffff",
            border: "1px solid #229ed9",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "12px",
            fontWeight: 700,
            padding: "8px 16px",
            height: "40px"
          }}
        >
          <Send size={14} />
          Telegram
        </a>

        {/* Copy Link & Pre-Text Button */}
        <button
          onClick={handleCopyLink}
          className="btn btn-secondary"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "12px",
            fontWeight: 700,
            padding: "8px 16px",
            height: "40px",
            marginLeft: "auto"
          }}
        >
          {copied ? (
            <>
              <Check size={14} style={{ color: "hsl(var(--success))" }} />
              <span style={{ color: "hsl(var(--success))" }}>Pre-Text & Link Copied!</span>
            </>
          ) : (
            <>
              <Copy size={14} />
              Copy Pre-Text & Link
            </>
          )}
        </button>
      </div>
    </div>
  );
}
