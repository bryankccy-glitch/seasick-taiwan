import type { Metadata } from "next";
import "./globals.css";
import "./theme.css";
import "./ocean-assistant.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { THEME_BOOTSTRAP } from "@/lib/theme";

const basePath = process.env.GITHUB_PAGES === "true" ? "/seasick-taiwan" : "";

export const metadata: Metadata = {
  title: "SeaSick Taiwan｜台灣出海暈船風險",
  description: "從臺灣港口、海域與個人條件，評估暈船風險與最佳出海時段。",
  icons: {
    icon: `${basePath}/favicon.svg`,
    shortcut: `${basePath}/favicon.svg`,
  },
  referrer: "strict-origin-when-cross-origin",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-Hant" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP }} />
        <meta
          httpEquiv="Content-Security-Policy"
          content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; upgrade-insecure-requests"
        />
      </head>
      <body className="antialiased"><ThemeProvider>{children}</ThemeProvider></body>
    </html>
  );
}
