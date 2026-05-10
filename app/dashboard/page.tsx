"use client";

import { useEffect, useState } from "react";

export default function Dashboard() {
  const [fitness, setFitness] = useState<any[]>([]);
  const [daily, setDaily] = useState<any[]>([]);
  const [essay, setEssay] = useState<any[]>([]);
  const [review, setReview] = useState<any[]>([]);

  useEffect(() => {
    setFitness(JSON.parse(localStorage.getItem("fitness_posts") || "[]"));
    setDaily(JSON.parse(localStorage.getItem("daily_posts") || "[]"));
    setEssay(JSON.parse(localStorage.getItem("essay_posts") || "[]"));
    setReview(JSON.parse(localStorage.getItem("reviews") || "[]"));
  }, []);

  const last = (arr: any[]) => (arr.length > 0 ? arr[0] : null);

  const doneRate = () => {
    if (!review.length) return 0;
    const done = review.filter((r) => r.status === "done").length;
    return Math.round((done / review.length) * 100);
  };

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>📊 成长仪表盘</h1>

      <div style={styles.grid}>
        {/* Fitness */}
        <div style={{ ...styles.card, background: "#e6f0ff" }}>
          <h3>🏋️ Fitness</h3>
          <p>记录数：{fitness.length}</p >
          <p>最新：{last(fitness)?.content || "暂无记录"}</p >
        </div>

        {/* Daily */}
        <div style={{ ...styles.card, background: "#ffe6ef" }}>
          <h3>🌸 Daily</h3>
          <p>记录数：{daily.length}</p >
          <p>最新：{last(daily)?.content || "暂无记录"}</p >
        </div>

        {/* Essay */}
        <div style={{ ...styles.card, background: "#fff6d6" }}>
          <h3>📖 Essay</h3>
          <p>随笔数：{essay.length}</p >
          <p>最新：{last(essay)?.content || "暂无记录"}</p >
        </div>

        {/* Review */}
        <div style={{ ...styles.card, background: "#eee6ff" }}>
          <h3>🧠 Review</h3>
          <p>复盘数：{review.length}</p >
          <p>完成率：{doneRate()}%</p >
          <p>最新：{last(review)?.goal || "暂无记录"}</p >
        </div>
      </div>
    </div>
  );
}

const styles: any = {
  page: {
    padding: "40px",
    fontFamily: "sans-serif",
    background: "#fafafa",
    minHeight: "100vh",
  },

  title: {
    fontSize: "26px",
    marginBottom: "20px",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "20px",
  },

  card: {
    padding: "20px",
    borderRadius: "14px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
    cursor: "pointer",
    transition: "0.2s",
  },
};