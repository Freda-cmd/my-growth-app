"use client";

import "./globals.css";
import { usePathname } from "next/navigation";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const linkStyle = (path: string) => ({
    color: pathname === path ? "#d63384" : "#555",
    fontWeight: (pathname === path ? 600 : 400) as any,
    textDecoration: "none",
    padding: "6px 16px",
    borderRadius: "20px",
    background: pathname === path ? "rgba(214,51,132,0.08)" : "transparent",
    transition: "all 0.2s ease",
    fontSize: "14px",
  });

  return (
    <html lang="zh">
      <body className="bg-[#f8f8f8] text-gray-800 antialiased">

        <nav style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          display: "flex",
          justifyContent: "center",
          gap: "12px",
          padding: "18px 0",
          zIndex: 50,
          backdropFilter: "blur(12px)",
          background: "rgba(255,255,255,0.5)",
          borderBottom: "1px solid rgba(0,0,0,0.04)",
        }}>
          <a href="/" style={linkStyle("/")}>首页</a>
          <a href="/daily" style={linkStyle("/daily")}>日常</a>
          <a href="/fitness" style={linkStyle("/fitness")}>健身</a>
          <a href="/essay" style={linkStyle("/essay")}>随笔</a>
          <a href="/review" style={linkStyle("/review")}>复盘</a>
        </nav>

        <main style={{ paddingTop: "80px" }}>
          {children}
        </main>

      </body>
    </html>
  );
}