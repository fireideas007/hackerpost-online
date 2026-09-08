export const metadata = {
  title: "AI Security Model Leaderboard (2026) | HackerPost.online",
  description: "Authoritative cybersecurity evaluations of frontier LLMs & open-weights models across vulnerability patching, autonomous threat hunting, prompt injection defense, and exploit synthesis.",
  alternates: {
    canonical: "/benchmarks",
  },
  openGraph: {
    title: "AI Security Model Leaderboard (2026) | HackerPost",
    description: "Authoritative cybersecurity evaluations ranking Claude 3.7 Sonnet, GPT-4o, and CyberSec Llama across 5 rigorous threat vectors.",
    url: "/benchmarks",
    siteName: "HackerPost.online",
    images: [
      {
        url: "/ai-benchmark-card.svg",
        width: 1200,
        height: 630,
        alt: "HackerPost AI Security Model Leaderboard 2026"
      }
    ],
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    site: "@HackerPost2",
    creator: "@HackerPost2",
    title: "AI Security Model Leaderboard (2026) | HackerPost",
    description: "Authoritative cybersecurity evaluations ranking Claude 3.7 Sonnet, GPT-4o, and CyberSec Llama across 5 rigorous threat vectors.",
    images: ["/ai-benchmark-card.svg"]
  }
};

export default function BenchmarksLayout({ children }) {
  return children;
}
