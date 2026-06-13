import type { Metadata } from "next";
import { LangProvider, T } from "@/lib/i18n";
import SiteHeader from "@/components/SiteHeader";
import packageJson from "@/package.json";
import "./globals.css";

export const metadata: Metadata = {
  title: "Audio Research KB",
  description: "Collaborative knowledge base for audio / ANC / signal processing",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const repo = process.env.NEXT_PUBLIC_GITHUB_REPO;
  const gated = Boolean(process.env.APP_PASSWORD);
  return (
    <html lang="en">
      <body>
        <LangProvider>
          <SiteHeader repo={repo} gated={gated} />
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
