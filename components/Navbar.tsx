"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <div style={styles.nav}>
      <Link href="/" style={styles.navItem}>
        🏠 首页
      </Link>

      <Link href="/daily" style={styles.navItem}>
        🌸 日常
      </Link>

      <Link href="/essay" style={styles.navItem}>
        📖 随笔
      </Link>

      <Link href="/fitness" style={styles.navItem}>
        🏋️ 健身
      </Link>

      <Link href="/review" style={styles.navItem}>
        🧠 复盘
      </Link>
    </div>
  );
}

const styles: any = {
  nav: {
    display: "flex",
    gap: "14px",
    marginBottom: "30px",
    flexWrap: "wrap",
  },

  navItem: {
    textDecoration: "none",
    padding: "10px 16px",
    borderRadius: "12px",
    background: "rgba(255,255,255,0.7)",
    color: "#111",
    border: "1px solid rgba(0,0,0,0.06)",
    backdropFilter: "blur(8px)",
  },
};