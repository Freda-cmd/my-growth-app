"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase";

type RecordItem = {
  date: string;
  weight: number;
  waist: number;
};

type Goal = {
  id: string;
  title: string;
  records: RecordItem[];
};

export default function ReviewPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [title, setTitle] = useState("");

  const [weight, setWeight] = useState("");
  const [waist, setWaist] = useState("");

  // 读取数据库
  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    const { data, error } = await supabase
      .from("review_goals")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.log(error);
      return;
    }

    const formattedGoals: Goal[] = data.map((item: any) => ({
      id: item.id,
      title: item.title,
      records: item.records || [],
    }));

    setGoals(formattedGoals);
  };

  // 创建目标
  const createGoal = async () => {
    if (!title.trim()) return;

    const { error } = await supabase.from("review_goals").insert([
      {
        title: title,
        progress: 0,
        status: "doing",
        records: [],
      },
    ]);

    if (error) {
      console.log(error);
      return;
    }

    setTitle("");

    fetchGoals();
  };

  // 添加记录
  const addRecord = async (goal: Goal) => {
    if (!weight || !waist) return;

    const newRecord = {
      date: new Date().toLocaleDateString(),
      weight: Number(weight),
      waist: Number(waist),
    };

    const updatedRecords = [...goal.records, newRecord];

    const { error } = await supabase
      .from("review_goals")
      .update({
        records: updatedRecords,
      })
      .eq("id", goal.id);

    if (error) {
      console.log(error);
      return;
    }

    setWeight("");
    setWaist("");

    fetchGoals();
  };

  // 删除目标
  const deleteGoal = async (id: string) => {
    const ok = confirm("确定删除这个目标吗？");

    if (!ok) return;

    const { error } = await supabase
      .from("review_goals")
      .delete()
      .eq("id", id);

    if (error) {
      console.log(error);
      return;
    }

    fetchGoals();
  };

  // 导出 CSV
  const exportCSV = () => {
    let csv = "Goal,Date,Weight,Waist\n";

    goals.forEach((g) => {
      g.records.forEach((r) => {
        csv += `${g.title},${r.date},${r.weight},${r.waist}\n`;
      });
    });

    const blob = new Blob([csv], { type: "text/csv" });

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");

    a.href = url;
    a.download = "fitness_data.csv";

    a.click();
  };

  return (
    <div style={styles.page}>
      <div style={styles.overlay}></div>

      <div style={styles.content}>
        <Navbar />

        <h1 style={styles.title}>🧠 自我复盘系统</h1>

        {/* 创建目标 */}
        <div style={styles.createBox}>
          <input
            style={styles.input}
            placeholder="创建目标（如刷脂 / 学英语）"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <button style={styles.button} onClick={createGoal}>
            创建目标
          </button>
        </div>

        <button style={styles.exportBtn} onClick={exportCSV}>
          📤 导出数据
        </button>

        {/* 目标列表 */}
        {goals.map((g) => (
          <div key={g.id} style={styles.card}>
            <div style={styles.cardTop}>
              <h2 style={styles.goalTitle}>{g.title}</h2>

              <button
                style={styles.deleteBtn}
                onClick={() => deleteGoal(g.id)}
              >
                删除
              </button>
            </div>

            {/* 输入数据 */}
            <div style={styles.recordBox}>
              <input
                style={styles.smallInput}
                placeholder="体重 kg"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              />

              <input
                style={styles.smallInput}
                placeholder="腰围 cm"
                value={waist}
                onChange={(e) => setWaist(e.target.value)}
              />

              <button
                style={styles.smallButton}
                onClick={() => addRecord(g)}
              >
                添加记录
              </button>
            </div>

            {/* 数据显示 */}
            <div>
              {g.records.length === 0 ? (
                <div style={styles.empty}>
                  暂无记录
                </div>
              ) : (
                g.records.map((r, idx) => (
                  <div key={idx} style={styles.record}>
                    {r.date} ｜ {r.weight}kg ｜ {r.waist}cm
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles: any = {
  page: {
    minHeight: "100vh",
    background:
      "linear-gradient(to bottom, #f7f2ff, #efe4ff, #e8d9ff)",
    position: "relative",
    overflow: "hidden",
    padding: "40px",
  },

  overlay: {
    position: "absolute",
    inset: 0,
    backdropFilter: "blur(80px)",
    background: "rgba(255,255,255,0.15)",
  },

  content: {
    position: "relative",
    zIndex: 2,
    maxWidth: "900px",
    margin: "0 auto",
  },

  title: {
    fontSize: "42px",
    marginBottom: "30px",
    color: "#5b3b75",
  },

  createBox: {
    display: "flex",
    gap: "10px",
    marginBottom: "20px",
    flexWrap: "wrap",
  },

  input: {
    flex: 1,
    padding: "14px",
    borderRadius: "14px",
    border: "none",
    background: "rgba(255,255,255,0.7)",
    fontSize: "16px",
    minWidth: "220px",
  },

  button: {
    padding: "14px 20px",
    borderRadius: "14px",
    border: "none",
    background: "#9f7aea",
    color: "white",
    cursor: "pointer",
    fontSize: "15px",
  },

  exportBtn: {
    marginBottom: "20px",
    padding: "12px 18px",
    borderRadius: "14px",
    border: "none",
    background: "#7c5ac9",
    color: "white",
    cursor: "pointer",
  },

  card: {
    background: "rgba(255,255,255,0.55)",
    backdropFilter: "blur(20px)",
    padding: "25px",
    borderRadius: "24px",
    marginBottom: "25px",
    boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
  },

  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10px",
    flexWrap: "wrap",
    gap: "10px",
  },

  goalTitle: {
    color: "#5b3b75",
  },

  deleteBtn: {
    border: "none",
    background: "#ff6b81",
    color: "#fff",
    padding: "8px 14px",
    borderRadius: "10px",
    cursor: "pointer",
  },

  recordBox: {
    display: "flex",
    gap: "10px",
    marginTop: "15px",
    marginBottom: "20px",
    flexWrap: "wrap",
  },

  smallInput: {
    padding: "10px",
    borderRadius: "12px",
    border: "none",
    background: "rgba(255,255,255,0.8)",
    minWidth: "120px",
  },

  smallButton: {
    padding: "10px 16px",
    borderRadius: "12px",
    border: "none",
    background: "#8b5cf6",
    color: "white",
    cursor: "pointer",
  },

  record: {
    marginTop: "8px",
    padding: "10px",
    borderRadius: "10px",
    background: "rgba(255,255,255,0.5)",
  },

  empty: {
    color: "#888",
    marginTop: "10px",
  },
};