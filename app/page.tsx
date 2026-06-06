"use client";

import Link from "next/link";

export default function Home() {
  return (
    <div style={styles.container}>
      {/* 背景图 */}
      <div style={styles.bg} />
      {/* 高级感遮罩 */}
      <div style={styles.overlay} />
      {/* 极简线条猫耳 */}
      <div style={styles.cat} />
      {/* 内容 */}
      <div style={styles.content}>
        <h1 style={styles.title}>My Journal</h1>
        <p style={styles.sub}>记录 · 生活 · 思考 · 成长</p>

        {/* 四模块入口 */}
        <div style={styles.grid}>
          <Link href="/fitness" style={styles.card}>
            <span style={styles.cardIcon}>🏋️</span>
            <span style={styles.cardLabel}>健身</span>
          </Link>
          <Link href="/daily" style={styles.card}>
            <span style={styles.cardIcon}>🌸</span>
            <span style={styles.cardLabel}>日常</span>
          </Link>
          <Link href="/essay" style={styles.card}>
            <span style={styles.cardIcon}>📖</span>
            <span style={styles.cardLabel}>随笔</span>
          </Link>
          <Link href="/review" style={styles.card}>
            <span style={styles.cardIcon}>🧠</span>
            <span style={styles.cardLabel}>复盘</span>
          </Link>
        </div>
      </div>

      {/* Animation keyframes via style tag */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes breathe {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: "relative",
    height: "100vh",
    overflow: "hidden",
    fontFamily: "'Segoe UI', 'PingFang SC', 'Microsoft YaHei', serif",
  },
  bg: {
    position: "absolute",
    top: 0, left: 0,
    width: "100%", height: "100%",
    backgroundImage: "url('/056bd4116c56010f7394b5d986510b66.png')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    zIndex: -3,
  },
  overlay: {
    position: "absolute",
    top: 0, left: 0,
    width: "100%", height: "100%",
    background: "rgba(255,255,255,0.35)",
    backdropFilter: "blur(8px)",
    zIndex: -2,
  },
  cat: {
    position: "absolute",
    top: "30px", left: "30px",
    width: "34px", height: "22px",
    borderTop: "2px solid rgba(255,255,255,1)",
    borderLeft: "2px solid rgba(255,255,255,1)",
    borderRight: "2px solid rgba(255,255,255,1)",
    borderRadius: "12px 12px 0 0",
    opacity: 1,
    zIndex: 20,
    boxShadow: "0 0 10px rgba(255,255,255,0.4)",
    animation: "breathe 3s ease-in-out infinite",
  },
  content: {
    position: "relative",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    animation: "fadeInUp 0.8s ease-out",
  },
  title: {
    fontSize: "48px",
    marginBottom: "10px",
    letterSpacing: "-2px",
    color: "#111",
    fontWeight: 300,
  },
  sub: {
    marginBottom: "44px",
    color: "#555",
    fontSize: "14px",
    letterSpacing: "4px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "18px",
  },
  card: {
    width: "150px",
    padding: "22px 18px",
    textAlign: "center",
    borderRadius: "16px",
    textDecoration: "none",
    color: "#111",
    background: "rgba(255,255,255,0.5)",
    border: "1px solid rgba(0,0,0,0.06)",
    backdropFilter: "blur(10px)",
    fontSize: "15px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
    transition: "transform 0.3s ease, box-shadow 0.3s ease, background 0.3s ease",
  },
  cardIcon: {
    fontSize: "28px",
    transition: "transform 0.3s ease",
  },
  cardLabel: {
    fontWeight: 500,
  },
};
