import { getPublishedArticles } from "@/lib/newsStore";
import NewsFeed from "./components/NewsFeed";

// Enable dynamic rendering since database updates can occur via the admin dashboard
export const revalidate = 0;

export default function Home() {
  // Fetch initial articles directly on the server for instant page load and indexing
  const articles = getPublishedArticles();

  return (
    <div style={{ paddingBottom: "80px" }}>
      <NewsFeed initialArticles={articles} />
    </div>
  );
}
