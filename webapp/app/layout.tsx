import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Audio Research KB | 音频研究知识库",
  description: "Collaborative bilingual research knowledge base for audio / ANC / signal processing",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const repo = process.env.NEXT_PUBLIC_GITHUB_REPO;
  return (
    <html lang="zh-CN">
      <body>
        <header className="topnav">
          <Link href="/" className="brand">🎧 Audio Research KB</Link>
          <nav>
            <Link href="/cards">卡片库 Library</Link>
            <Link href="/pending">审核队列 Review</Link>
            <Link href="/new">新建卡片 New</Link>
            <Link href="/export">导出 Export</Link>
            {repo && (
              <a href={`https://github.com/${repo}`} target="_blank" rel="noreferrer">
                GitHub ↗
              </a>
            )}
          </nav>
        </header>
        <main className="container">{children}</main>
        <footer className="footer">
          PDFs stay in Drive · cards, templates, index and scripts stay in GitHub
        </footer>
      </body>
    </html>
  );
}
