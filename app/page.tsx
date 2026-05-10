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

        <p style={styles.sub}>
          记录 · 生活 · 思考 · 成长
        </p >

        {/* 四模块入口 */}
        <div style={styles.grid}>
          <Link href="/fitness" style={styles.card}>
            🏋️ 健身
          </Link>

          <Link href="/daily" style={styles.card}>
            🌸 日常
          </Link>

          <Link href="/essay" style={styles.card}>
            📖 随笔
          </Link>

          <Link href="/review" style={styles.card}>
            🧠 复盘
          </Link>
        </div>
      </div>
    </div>
  );
}

const styles: any = {
  container: {
    position: "relative",
    height: "100vh",
    overflow: "hidden",
    fontFamily: "serif",
  },

  // 🖼️ 背景图（改成你的 public 图片路径）
  bg: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundImage: "url('/056bd4116c56010f7394b5d986510b66.png')", // 👈 改这里
    backgroundSize: "cover",
    backgroundPosition: "center",
    zIndex: -3,
  },

  // 🌫️ 高级遮罩（轻柔氛围）
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(255,255,255,0.35)",
    backdropFilter: "blur(8px)",
    zIndex: -2,
  },

  // 🐱 极简线条猫耳（重点）
  cat: {
    position: "absolute",
  top: "30px",
  left: "30px",
  width: "34px",
  height: "22px",

  borderTop: "2px solid rgba(255,255,255,1)",
  borderLeft: "2px solid rgba(255,255,255,1)",
  borderRight: "2px solid rgba(255,255,255,1)",
  borderRadius: "12px 12px 0 0",

  opacity: 1,
  zIndex: 20,

  // 👇 加一点“发光感”，保证在背景上能看到
  boxShadow: "0 0 10px rgba(255,255,255,0.4)",
  },

  content: {
    position: "relative",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },

  title: {
    fontSize: "44px",
    marginBottom: "10px",
    letterSpacing: "-1px",
    color: "#111",
  },

  sub: {
    marginBottom: "40px",
    color: "#444",
    fontSize: "14px",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "18px",
  },

  card: {
    width: "150px",
    padding: "18px",
    textAlign: "center",
    borderRadius: "14px",
    textDecoration: "none",
    color: "#111",
    background: "rgba(255,255,255,0.55)",
    border: "1px solid rgba(0,0,0,0.08)",
    backdropFilter: "blur(10px)",
    fontSize: "15px",
  },
};