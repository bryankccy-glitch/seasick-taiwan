import type { Metadata } from "next";
import "./globals.css";

const basePath = process.env.GITHUB_PAGES === "true" ? "/seasick-taiwan" : "";

export const metadata: Metadata = {
  title: "SeaSick Taiwan｜台灣出海暈船風險",
  description: "從臺灣港口、海域與個人條件，評估暈船風險與最佳出海時段。",
  icons: {
    icon: `${basePath}/favicon.svg`,
    shortcut: `${basePath}/favicon.svg`,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-Hant">
      <body className="antialiased">{children}</body>
    </html>
  );
}
