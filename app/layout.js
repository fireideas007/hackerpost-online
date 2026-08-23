import "./globals.css";
import Header from "./components/Header";
import Ticker from "./components/Ticker";
import Footer from "./components/Footer";

export const metadata = {
  title: "HackerPost.online | CISO Cyber Threat Intelligence, SecTech & AI Model Benchmarks",
  description: "Real-time cybersecurity intelligence portal for CISOs: zero-day threat advisories, ransomware attack telemetry, SecTech startup funding, M&A deals, and AI security model benchmark rankings.",
  metadataBase: new URL("https://hackerpost.online"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "HackerPost.online | CISO Cyber Threat Intelligence, SecTech & AI Model Benchmarks",
    description: "Real-time cybersecurity intelligence portal for CISOs: zero-day threat advisories, ransomware attack telemetry, SecTech startup funding, M&A deals, and AI security model benchmark rankings.",
    url: "https://hackerpost.online",
    siteName: "HackerPost.online",
    locale: "en_US",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        {/* Navigation Bar */}
        <Header />
        
        {/* Breaking News bulletins ticker */}
        <Ticker />
        
        {/* Main Content Area */}
        <main style={{ flex: 1 }}>
          {children}
        </main>
        
        {/* Platform Footer */}
        <Footer />
      </body>
    </html>
  );
}
