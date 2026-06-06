"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function Dashboard() {
  const [fitness, setFitness] = useState<any[]>([]);
  const [daily, setDaily] = useState<any[]>([]);
  const [essay, setEssay] = useState<any[]>([]);
  const [reviewProjects, setReviewProjects] = useState<any[]>([]);
  const [reviewTotalPhases, setReviewTotalPhases] = useState(0);

  useEffect(() => {
    setFitness(JSON.parse(localStorage.getItem("fitness_posts") || "[]"));
    setDaily(JSON.parse(localStorage.getItem("daily_posts") || "[]"));
    setEssay(JSON.parse(localStorage.getItem("essay_posts") || "[]"));

    // Fetch review data from Supabase
    supabase
      .from("review_goals")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) {
          const all = data || [];
          const projects = all.filter((g: any) => !g.parent_id);
          setReviewProjects(projects);
          setReviewTotalPhases(all.filter((g: any) => g.parent_id).length);
        }
      });
  }, []);

  const last = (arr: any[], field = "text") => {
    if (arr.length === 0) return null;
    const item = arr[0];
    return item[field] || item.content || "";
  };

  const totalRecords = daily.length + fitness.length + essay.length + reviewProjects.length;

  const cards = [
    {
      title: "🏋️ 健身",
      count: fitness.length,
      latest: last(fitness)?.slice(0, 30) || "暂无记录",
      href: "/fitness",
      color: "#e6f0ff",
      accent: "#2563eb",
    },
    {
      title: "🌸 日常",
      count: daily.length,
      latest: last(daily)?.slice(0, 30) || "暂无记录",
      href: "/daily",
      color: "#ffe6ef",
      accent: "#d63384",
    },
    {
      title: "📖 随笔",
      count: essay.length,
      latest: last(essay, "content")?.slice(0, 30) || "暂无记录",
      href: "/essay",
      color: "#fff6d6",
      accent: "#b8860b",
    },
    {
      title: "🧠 复盘",
      count: reviewProjects.length,
      latest: reviewProjects.length > 0 ? `${reviewProjects[0].title}（${reviewTotalPhases}个阶段）` : "暂无目标",
      href: "/review",
      color: "#eee6ff",
      accent: "#7c5ac9",
    },
  ];

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>📊 成长仪表盘</h1>
      <p style={styles.sub}>
        共计 {totalRecords} 条记录 · {daily.length + fitness.length + essay.length} 条笔记 · {reviewProjects.length} 个复盘项目
      </p>

      <div style={styles.grid}>
        {cards.map((c) => (
          <Link key={c.href} href={c.href} style={{ ...styles.card, background: c.color, textDecoration: "none" }}>
            <h3 style={{ ...styles.cardTitle, color: c.accent }}>{c.title}</h3>
            <p style={styles.cardCount}>{c.count} 条</p>
            <p style={styles.cardLatest}>
              {c.latest.length > 30 ? c.latest.slice(0, 30) + "..." : c.latest}
            </p>
            <span style={{ fontSize: "12px", color: c.accent, opacity: 0.6 }}>查看详情 →</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    padding: "40px",
    fontFamily: "'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif",
    background: "linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)",
    minHeight: "100vh",
  },
  title: {
    fontSize: "28px",
    marginBottom: "6px",
    color: "#333",
    fontWeight: 700,
  },
  sub: {
    fontSize: "13px",
    color: "#999",
    marginTop: 0,
    marginBottom: "30px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "20px",
    maxWidth: "800px",
  },
  card: {
    padding: "24px",
    borderRadius: "18px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
    transition: "transform 0.2s, box-shadow 0.2s",
    display: "block",
  },
  cardTitle: {
    margin: "0 0 8px 0",
    fontSize: "18px",
    fontWeight: 600,
  },
  cardCount: {
    fontSize: "28px",
    fontWeight: 700,
    margin: "8px 0",
    color: "#333",
  },
  cardLatest: {
    fontSize: "12px",
    color: "#888",
    margin: "8px 0 12px 0",
    whiteSpace: "pre-wrap" as const,
    lineHeight: "1.5",
  },
};
