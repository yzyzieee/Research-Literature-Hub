import type { Metadata } from "next";
import { LangProvider, T } from "@/lib/i18n";
import GuestModeBanner from "@/components/GuestModeBanner";
import SiteHeader from "@/components/SiteHeader";
import packageJson from "@/package.json";
import "./globals.css";

export const metadata: Metadata = {
  title: "Research Literature Hub",
  description: "A paper-first research literature management and LLM-context hub for research groups.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const repo = process.env.NEXT_PUBLIC_GITHUB_REPO;
  return (
    <html lang="en">
      <body>
        <LangProvider>
          <SiteHeader repo={repo} />
          <GuestModeBanner />
          <main className="container">{children}</main>
          <footer className="footer">
            <span><T k="footer" /></span>
            <span className="app-version">v{packageJson.version}</span>
          </footer>
        </LangProvider>
      </body>
    </html>
  );
}
