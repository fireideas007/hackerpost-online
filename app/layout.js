import "./globals.css";
import Header from "./components/Header";
import Ticker from "./components/Ticker";
import Footer from "./components/Footer";

export const metadata = {
  title: "HyperLocal.AI | Verified Hyperlocal News Feed",
  description: "Verified news and alerts aggregated from trusted public registries and local agencies, rewritten by AI to prevent plagiarism and localized to your neighborhood.",
  metadataBase: new URL("http://localhost:3000"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "HyperLocal.AI | Verified Hyperlocal News Feed",
    description: "Verified news and alerts aggregated from trusted public registries and local agencies, rewritten by AI to prevent plagiarism and localized to your neighborhood.",
    url: "/",
    siteName: "HyperLocal.AI",
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
