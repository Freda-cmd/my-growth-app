"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Field = { name: string; unit: string };
type RecordItem = {
  date: string;
  values: Record<string, string>;
  note: string;
  hiddenNote?: string;
  colors?: Record<string, string>;
};
type Goal = {
  id: string;
  title: string;
  fields: Field[];
  records: RecordItem[];
  parent_id: string | null;
  created_at: string;
};

const CHART_COLORS = [
  "#e91e63", "#2196f3", "#4caf50", "#ff9800", "#9c27b0",
  "#00bcd4", "#ff5722", "#607d8b", "#795548", "#cddc39",
];
const NOTE_COLORS = [
  "#333", "#e91e63", "#2196f3", "#4caf50", "#ff9800", "#9c27b0", "#795548",
];

export default function ReviewPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [errorMsg, setErrorMsg] = useState("");

  // Navigation: "projects" | "phases" | "detail"
  const [view, setView] = useState<"projects" | "phases" | "detail">("projects");
  const [selectedProject, setSelectedProject] = useState<Goal | null>(null);
  const [selectedPhase, setSelectedPhase] = useState<Goal | null>(null);

  // Create project modal
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState("");

  // Create phase modal
  const [showCreatePhase, setShowCreatePhase] = useState(false);
  const [newPhaseTitle, setNewPhaseTitle] = useState("");
  const [newPhaseFields, setNewPhaseFields] = useState<Field[]>([{ name: "", unit: "" }]);

  // Add record form
  const [recordDate, setRecordDate] = useState(new Date().toISOString().slice(0, 10));
  const [recordValues, setRecordValues] = useState<Record<string, string>>({});
  const [recordNote, setRecordNote] = useState("");
  const [editingRecordIdx, setEditingRecordIdx] = useState<number | null>(null);

  // Right-click context menu
  const [ctxMenu, setCtxMenu] = useState<{
    x: number; y: number; recordIdx: number; fieldName: string;
  } | null>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [editingHiddenNote, setEditingHiddenNote] = useState<number | null>(null);

  // Confirm modal
  const [confirmState, setConfirmState] = useState<{
    show: boolean; message: string; onConfirm: () => void;
  }>({ show: false, message: "", onConfirm: () => {} });

  useEffect(() => { fetchGoals(); }, []);
  useEffect(() => {
    const close = () => { setCtxMenu(null); setShowColorPicker(false); };
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, []);

  // ─── Fetch ───
  const fetchGoals = async () => {
    const { data, error } = await supabase
      .from("review_goals")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) { setErrorMsg("加载失败: " + error.message); return; }
    const formatted: Goal[] = (data || []).map((item: any) => ({
      id: item.id,
      title: item.title,
      fields: item.fields || [],
      records: item.records || [],
      parent_id: item.parent_id ?? null,
      created_at: item.created_at,
    }));
    setGoals(formatted);
    setErrorMsg("");
  };

  // ─── Projects ───
  const projects = goals.filter((g) => !g.parent_id);

  const createProject = async () => {
    if (!newProjectTitle.trim()) return;
    const { error } = await supabase.from("review_goals").insert([{
      title: newProjectTitle.trim(),
      fields: [],
      records: [],
      parent_id: null,
      progress: 0,
      status: "doing",
    }]);
    if (error) { setErrorMsg("创建失败: " + error.message); return; }
    setNewProjectTitle("");
    setShowCreateProject(false);
    setErrorMsg("");
    await fetchGoals();
  };

  // ─── Phases ───
  const phases = selectedProject
    ? goals.filter((g) => g.parent_id === selectedProject.id)
    : [];

  const createPhase = async () => {
    if (!newPhaseTitle.trim() || !selectedProject) return;
    const validFields = newPhaseFields.filter((f) => f.name.trim());
    const { error } = await supabase.from("review_goals").insert([{
      title: newPhaseTitle.trim(),
      fields: validFields,
      records: [],
      parent_id: selectedProject.id,
      progress: 0,
      status: "doing",
    }]);
    if (error) { setErrorMsg("创建失败: " + error.message); return; }
    setNewPhaseTitle("");
    setNewPhaseFields([{ name: "", unit: "" }]);
    setShowCreatePhase(false);
    setErrorMsg("");
    await fetchGoals();
  };

  // ─── Delete ───
  const deleteGoal = (goal: Goal) => {
    setConfirmState({
      show: true,
      message: goal.parent_id
        ? `删除阶段「${goal.title}」及其所有记录？`
        : `删除项目「${goal.title}」及其所有阶段与记录？`,
      onConfirm: async () => {
        if (!goal.parent_id) {
          // Delete project + all its phases
          const phaseIds = goals.filter((g) => g.parent_id === goal.id).map((g) => g.id);
          if (phaseIds.length > 0) {
            await supabase.from("review_goals").delete().in("id", phaseIds);
          }
        }
        const { error } = await supabase.from("review_goals").delete().eq("id", goal.id);
        setConfirmState({ show: false, message: "", onConfirm: () => {} });
        if (error) { setErrorMsg("删除失败: " + error.message); return; }
        if (view === "detail" && selectedPhase?.id === goal.id) {
          setView("phases");
          setSelectedPhase(null);
        }
        if (view === "phases" && selectedProject?.id === goal.id) {
          setView("projects");
          setSelectedProject(null);
        }
        fetchGoals();
      },
    });
  };

  // ─── Navigation ───
  const goToPhases = (project: Goal) => {
    setSelectedProject(project);
    setSelectedPhase(null);
    setView("phases");
    setErrorMsg("");
  };

  const goToDetail = (phase: Goal) => {
    setSelectedPhase(phase);
    setView("detail");
    setRecordDate(new Date().toISOString().slice(0, 10));
    setRecordValues({});
    setRecordNote("");
    setEditingRecordIdx(null);
    setEditingHiddenNote(null);
    setErrorMsg("");
  };

  const goBack = () => {
    if (view === "detail") {
      setView("phases");
      setSelectedPhase(null);
    } else if (view === "phases") {
      setView("projects");
      setSelectedProject(null);
    }
    setErrorMsg("");
  };

  // ─── Records CRUD ───
  const refreshPhase = async (phaseId: string) => {
    await fetchGoals();
    // Keep selectedPhase in sync
    const { data } = await supabase.from("review_goals").select("*").eq("id", phaseId).single();
    if (data) {
      setSelectedPhase({
        id: data.id,
        title: data.title,
        fields: data.fields || [],
        records: data.records || [],
        parent_id: data.parent_id ?? null,
        created_at: data.created_at,
      });
    }
  };

  const submitRecord = async () => {
    if (!selectedPhase) return;
    // Check at least one field has value or note
    const hasValue = selectedPhase.fields.some((f) => recordValues[f.name]?.trim());
    if (!hasValue && !recordNote.trim()) return;

    const record: RecordItem = {
      date: recordDate,
      values: { ...recordValues },
      note: recordNote,
    };

    let updatedRecords = [...selectedPhase.records];
    if (editingRecordIdx !== null) {
      updatedRecords[editingRecordIdx] = record;
    } else {
      updatedRecords = [...updatedRecords, record];
    }

    const { error } = await supabase
      .from("review_goals")
      .update({ records: updatedRecords })
      .eq("id", selectedPhase.id);

    if (error) { setErrorMsg("保存失败: " + error.message); return; }

    setRecordDate(new Date().toISOString().slice(0, 10));
    setRecordValues({});
    setRecordNote("");
    setEditingRecordIdx(null);
    setErrorMsg("");
    await refreshPhase(selectedPhase.id);
  };

  const deleteRecord = (recordIdx: number) => {
    if (!selectedPhase) return;
    setConfirmState({
      show: true,
      message: "确定删除这条记录吗？",
      onConfirm: async () => {
        const updated = selectedPhase.records.filter((_, i) => i !== recordIdx);
        const { error } = await supabase
          .from("review_goals")
          .update({ records: updated })
          .eq("id", selectedPhase.id);
        setConfirmState({ show: false, message: "", onConfirm: () => {} });
        if (error) { setErrorMsg("删除失败: " + error.message); return; }
        await refreshPhase(selectedPhase.id);
      },
    });
  };

  const editRecord = (recordIdx: number) => {
    if (!selectedPhase) return;
    const r = selectedPhase.records[recordIdx];
    setRecordDate(r.date);
    setRecordValues(r.values || {});
    setRecordNote(r.note);
    setEditingRecordIdx(recordIdx);
  };

  const updateHiddenNote = async (recordIdx: number, hiddenNote: string) => {
    if (!selectedPhase) return;
    const updated = [...selectedPhase.records];
    updated[recordIdx] = { ...updated[recordIdx], hiddenNote };
    const { error } = await supabase
      .from("review_goals")
      .update({ records: updated })
      .eq("id", selectedPhase.id);
    if (error) { setErrorMsg("保存失败: " + error.message); return; }
    await refreshPhase(selectedPhase.id);
    setEditingHiddenNote(null);
  };

  const updateCellColor = async (recordIdx: number, fieldName: string, color: string) => {
    if (!selectedPhase) return;
    const updated = [...selectedPhase.records];
    const rec = { ...updated[recordIdx] };
    rec.colors = { ...(rec.colors || {}), [fieldName]: color };
    updated[recordIdx] = rec;
    const { error } = await supabase
      .from("review_goals")
      .update({ records: updated })
      .eq("id", selectedPhase.id);
    if (error) { setErrorMsg("保存失败: " + error.message); return; }
    await refreshPhase(selectedPhase.id);
    setCtxMenu(null);
    setShowColorPicker(false);
  };

  // ─── Export CSV ───
  const exportCSV = (phase: Goal) => {
    const sorted = [...phase.records].reverse();
    const allFields = phase.fields;
    let csv = "﻿日期," + allFields.map((f) => `${f.name}${f.unit ? "(" + f.unit + ")" : ""}`).join(",") + ",评语\n";
    sorted.forEach((r) => {
      const vals = allFields.map((f) => r.values?.[f.name] ?? "").join(",");
      csv += `${r.date},${vals},"${(r.note || "").replace(/"/g, '""')}"\n`;
    });
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${phase.title}_数据.csv`;
    a.click();
  };

  // ─── Chart ───
  const detectNumericFields = (phase: Goal): Field[] => {
    return phase.fields.filter((f) =>
      phase.records.some((r) => {
        const v = r.values?.[f.name];
        return v !== undefined && v !== "" && !isNaN(Number(v));
      })
    );
  };

  const renderChart = (phase: Goal) => {
    const records = [...phase.records]; // chronological order
    const numFields = detectNumericFields(phase);
    if (records.length < 2 || numFields.length === 0) return null;

    const W = 600, H = 240, PAD = { top: 16, right: 16, bottom: 36, left: 52 };
    const iW = W - PAD.left - PAD.right;
    const iH = H - PAD.top - PAD.bottom;

    let gMin = Infinity, gMax = -Infinity;
    numFields.forEach((f) => {
      records.forEach((r) => {
        const v = Number(r.values?.[f.name]);
        if (!isNaN(v)) { if (v < gMin) gMin = v; if (v > gMax) gMax = v; }
      });
    });
    if (!isFinite(gMin)) return null;
    const range = gMax - gMin || 1;

    const toX = (i: number) => PAD.left + (i / Math.max(records.length - 1, 1)) * iW;
    const toY = (v: number) => PAD.top + iH - ((v - gMin) / range) * iH;

    const tickCount = 4;
    const rawStep = range / tickCount;
    const mag = Math.pow(10, Math.floor(Math.log10(rawStep)));
    const niceStep = rawStep / mag >= 5 ? 5 * mag : rawStep / mag >= 2 ? 2 * mag : mag;
    const niceMin = Math.floor(gMin / niceStep) * niceStep;
    const ticks = Array.from({ length: tickCount + 1 }, (_, i) => niceMin + niceStep * i).filter((v) => v <= gMax + niceStep * 0.5);

    return (
      <div style={{ marginBottom: "18px", overflowX: "auto" }}>
        <svg width={W} height={H} style={{ display: "block" }}>
          {ticks.map((val, t) => (
            <g key={t}>
              <line x1={PAD.left} y1={toY(val)} x2={W - PAD.right} y2={toY(val)} stroke="#eee" strokeWidth={0.5} />
              <text x={PAD.left - 8} y={toY(val) + 4} textAnchor="end" fontSize="10" fill="#999">{val.toFixed(1)}</text>
            </g>
          ))}
          {records.map((r, i) => {
            const step = Math.max(1, Math.ceil(records.length / 8));
            if (i % step !== 0 && i !== records.length - 1) return null;
            return (
              <text key={i} x={toX(i)} y={H - 6} textAnchor="middle" fontSize="9" fill="#999">
                {r.date.slice(5)}
              </text>
            );
          })}
          {numFields.map((f, fi) => {
            const color = CHART_COLORS[fi % CHART_COLORS.length];
            const pairs: [number, number][] = [];
            records.forEach((r, i) => {
              const v = Number(r.values?.[f.name]);
              if (!isNaN(v)) pairs.push([toX(i), toY(v)]);
            });
            if (pairs.length < 2) return null;
            return (
              <g key={fi}>
                <polyline points={pairs.map(([x, y]) => `${x},${y}`).join(" ")} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" />
                {pairs.map(([cx, cy], i) => (
                  <circle key={i} cx={cx} cy={cy} r={3} fill={color} />
                ))}
              </g>
            );
          })}
        </svg>
        <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", marginTop: "4px" }}>
          {numFields.map((f, fi) => (
            <span key={fi} style={{ fontSize: "12px", color: CHART_COLORS[fi % CHART_COLORS.length] }}>
              ● {f.name}{f.unit ? ` (${f.unit})` : ""}
            </span>
          ))}
        </div>
      </div>
    );
  };

  // ─── RENDER ───
  return (
    <div style={styles.page}>
      <div style={styles.overlay} />
      <div style={styles.content}>
        {/* Header */}
        <div style={styles.header}>
          {view !== "projects" && (
            <button onClick={goBack} style={styles.backBtn}>← 返回</button>
          )}
          <h1 style={styles.title}>
            {view === "projects" && "🧠 目标复盘"}
            {view === "phases" && (selectedProject?.title || "")}
            {view === "detail" && (selectedPhase?.title || "")}
          </h1>
        </div>

        {/* Error */}
        {errorMsg && (
          <div style={styles.errorBar}>
            <span>{errorMsg}</span>
            <span onClick={() => setErrorMsg("")} style={{ cursor: "pointer", marginLeft: 10 }}>×</span>
          </div>
        )}

        {/* ── VIEW: Projects ── */}
        {view === "projects" && (
          <>
            <button onClick={() => setShowCreateProject(true)} style={styles.createBtn}>+ 创建新项目</button>
            <p style={styles.subtitle}>管理你的长期目标，每个项目下可以创建多个阶段</p>

            {projects.length === 0 && (
              <div style={styles.empty}>
                <p style={{ fontSize: 40, margin: "0 0 12px 0" }}>📋</p>
                <p style={{ fontSize: 16, color: "#999", margin: 0 }}>还没有项目，创建第一个吧～</p>
                <p style={{ fontSize: 13, color: "#bbb", margin: "8px 0 0 0" }}>健身减脂 · 投资理财 · 学英语 · 项目复盘 · 一切皆可追踪</p>
              </div>
            )}

            <div style={styles.cardGrid}>
              {projects.map((p) => {
                const phaseCount = goals.filter((g) => g.parent_id === p.id).length;
                return (
                  <div key={p.id} style={styles.projectCard} onClick={() => goToPhases(p)}>
                    <div style={styles.projectCardTop}>
                      <h3 style={styles.projectTitle}>{p.title}</h3>
                      <span
                        onClick={(e) => { e.stopPropagation(); deleteGoal(p); }}
                        style={styles.deleteIcon}
                        title="删除"
                      >🗑</span>
                    </div>
                    <div style={styles.projectMeta}>
                      <span>{phaseCount} 个阶段</span>
                      <span style={{ marginLeft: 12, color: "#bbb" }}>
                        创建于 {p.created_at ? new Date(p.created_at).toLocaleDateString("zh-CN") : "-"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* ── VIEW: Phases ── */}
        {view === "phases" && selectedProject && (
          <>
            <button onClick={() => setShowCreatePhase(true)} style={styles.createBtn}>+ 创建新阶段</button>
            <p style={styles.subtitle}>为「{selectedProject.title}」添加阶段目标，每个阶段有独立的跟踪字段和数据</p>

            {phases.length === 0 && (
              <div style={styles.empty}>
                <p style={{ fontSize: 32, margin: "0 0 12px 0" }}>📌</p>
                <p style={{ fontSize: 15, color: "#999", margin: 0 }}>还没有阶段，创建第一个阶段目标吧～</p>
              </div>
            )}

            {phases.map((phase, idx) => {
              const lastRecord = phase.records.length > 0
                ? phase.records[phase.records.length - 1]
                : null;
              return (
                <div key={phase.id} style={styles.phaseCard} onClick={() => goToDetail(phase)}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={styles.phaseNum}>阶段{idx + 1}</span>
                    <div style={{ flex: 1 }}>
                      <h3 style={styles.phaseTitle}>{phase.title}</h3>
                      <div style={styles.phaseMeta}>
                        <span>{phase.records.length} 条记录</span>
                        {lastRecord && (
                          <span style={{ marginLeft: 10, color: "#bbb" }}>最新: {lastRecord.date}</span>
                        )}
                        <span style={{ marginLeft: 10, color: "#bbb" }}>
                          创建于 {phase.created_at ? new Date(phase.created_at).toLocaleDateString("zh-CN") : "-"}
                        </span>
                      </div>
                    </div>
                    <span style={{ fontSize: 14, color: "#ccc" }}>▶</span>
                  </div>
                  {/* Fields preview */}
                  {phase.fields.length > 0 && (
                    <div style={{ marginTop: 10, marginLeft: 50 }}>
                      {phase.fields.map((f) => (
                        <span key={f.name} style={styles.fieldTag}>
                          {f.name}{f.unit ? `(${f.unit})` : ""}
                        </span>
                      ))}
                    </div>
                  )}
                  <span
                    onClick={(e) => { e.stopPropagation(); deleteGoal(phase); }}
                    style={{ ...styles.deleteIcon, position: "absolute", top: 14, right: 14 }}
                    title="删除"
                  >🗑</span>
                </div>
              );
            })}
          </>
        )}

        {/* ── VIEW: Detail ── */}
        {view === "detail" && selectedPhase && (
          <div style={styles.detailWrap}>
            {/* Chart */}
            {renderChart(selectedPhase)}

            {/* Add / Edit Record */}
            <div style={styles.addRecordBox}>
              <h4 style={styles.sectionTitle}>
                {editingRecordIdx !== null ? "✏️ 编辑记录" : "➕ 添加记录"}
              </h4>

              {/* Date */}
              <div style={styles.fieldRow}>
                <span style={styles.fieldLabel}>日期</span>
                <input
                  type="date"
                  value={recordDate}
                  onChange={(e) => setRecordDate(e.target.value)}
                  style={styles.fieldInput}
                />
              </div>

              {/* Fields */}
              {selectedPhase.fields.map((f) => (
                <div key={f.name} style={styles.fieldRow}>
                  <span style={styles.fieldName}>{f.name}</span>
                  <input
                    value={recordValues[f.name] ?? ""}
                    onChange={(e) => setRecordValues({ ...recordValues, [f.name]: e.target.value })}
                    style={styles.fieldValue}
                    placeholder="数据"
                  />
                  <span style={styles.fieldUnit}>{f.unit || "-"}</span>
                </div>
              ))}

              {/* Note */}
              <div style={{ marginTop: 12 }}>
                <textarea
                  placeholder="评语（可选）"
                  value={recordNote}
                  onChange={(e) => setRecordNote(e.target.value)}
                  style={{ ...styles.fieldInput, width: "100%", height: 56, resize: "vertical" }}
                />
              </div>

              <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
                <button onClick={submitRecord} style={styles.primaryBtn}>
                  {editingRecordIdx !== null ? "💾 更新记录" : "✨ 添加记录"}
                </button>
                {editingRecordIdx !== null && (
                  <button
                    onClick={() => {
                      setEditingRecordIdx(null);
                      setRecordDate(new Date().toISOString().slice(0, 10));
                      setRecordValues({});
                      setRecordNote("");
                    }}
                    style={styles.cancelBtn}
                  >取消编辑</button>
                )}
              </div>
            </div>

            {/* Records Table */}
            <div style={styles.tableHeader}>
              <h4 style={styles.sectionTitle}>📋 记录列表（{selectedPhase.records.length} 条）</h4>
              <button onClick={() => exportCSV(selectedPhase)} style={styles.exportBtn}>📤 导出 CSV</button>
            </div>

            {selectedPhase.records.length === 0 ? (
              <div style={{ textAlign: "center", padding: 30, color: "#aaa", fontSize: 13 }}>
                暂无记录，往上添加第一条吧 ↑
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>日期</th>
                      {selectedPhase.fields.map((f) => (
                        <th key={f.name} style={styles.th}>{f.name}{f.unit ? `(${f.unit})` : ""}</th>
                      ))}
                      <th style={styles.th}>评语</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...selectedPhase.records].reverse().map((r, displayIdx) => {
                      const realIdx = selectedPhase.records.length - 1 - displayIdx;
                      return (
                        <tr
                          key={displayIdx}
                          style={displayIdx % 2 === 0 ? { background: "rgba(255,255,255,0.5)" } : { background: "rgba(0,0,0,0.02)" }}
                        >
                          <td
                            style={{ ...styles.td, color: r.colors?.["日期"] || "#444" }}
                            onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); setCtxMenu({ x: e.clientX, y: e.clientY, recordIdx: realIdx, fieldName: "日期" }); setShowColorPicker(false); }}
                          >{r.date}</td>
                          {selectedPhase.fields.map((f) => (
                            <td
                              key={f.name}
                              style={{ ...styles.td, color: r.colors?.[f.name] || "#444" }}
                              onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); setCtxMenu({ x: e.clientX, y: e.clientY, recordIdx: realIdx, fieldName: f.name }); setShowColorPicker(false); }}
                            >
                              {r.values?.[f.name] ?? "-"}
                            </td>
                          ))}
                          <td
                            style={{ ...styles.td, maxWidth: 160, whiteSpace: "pre-wrap", fontSize: 12, color: r.colors?.["评语"] || "#444" }}
                            onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); setCtxMenu({ x: e.clientX, y: e.clientY, recordIdx: realIdx, fieldName: "评语" }); setShowColorPicker(false); }}
                          >
                            {r.note || "-"}
                            {r.hiddenNote && (
                              <span style={{ fontSize: 10, color: "#999", display: "block", marginTop: 4, fontStyle: "italic" }}>
                                🔒 {r.hiddenNote}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Right-click context menu */}
            {ctxMenu && selectedPhase && (
              <div
                style={{
                  position: "fixed",
                  top: ctxMenu.y,
                  left: ctxMenu.x,
                  background: "#fff",
                  borderRadius: 12,
                  boxShadow: "0 8px 30px rgba(0,0,0,0.18)",
                  zIndex: 1001,
                  overflow: "hidden",
                  minWidth: 170,
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div style={styles.menuItem} onClick={() => { editRecord(ctxMenu.recordIdx); setCtxMenu(null); }}>
                  ✏️ 编辑记录
                </div>
                <div style={styles.menuItem} onClick={() => { deleteRecord(ctxMenu.recordIdx); setCtxMenu(null); }}>
                  🗑 删除记录
                </div>
                <div
                  style={styles.menuItem}
                  onClick={() => {
                    setEditingHiddenNote(ctxMenu.recordIdx);
                    setCtxMenu(null);
                  }}
                >
                  📝 隐藏备注
                </div>
                <div
                  style={styles.menuItem}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowColorPicker(!showColorPicker);
                  }}
                >
                  🎨 文字颜色
                </div>
                {showColorPicker && (
                  <div style={{ display: "flex", gap: 6, padding: "8px 14px", flexWrap: "wrap", borderTop: "1px solid #f0f0f0" }}>
                    {NOTE_COLORS.map((c) => (
                      <div
                        key={c}
                        onClick={() => updateCellColor(ctxMenu.recordIdx, ctxMenu.fieldName, c)}
                        style={{
                          width: 22, height: 22, borderRadius: "50%",
                          background: c, cursor: "pointer",
                          border: c === "#333" ? "2px solid #ddd" : "2px solid transparent",
                          boxSizing: "border-box",
                        }}
                        title={c}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Hidden note modal */}
            {editingHiddenNote !== null && selectedPhase && (
              <div style={styles.modalOverlay} onClick={() => setEditingHiddenNote(null)}>
                <div style={styles.smallModal} onClick={(e) => e.stopPropagation()}>
                  <p style={{ margin: "0 0 10px 0", fontWeight: 600, fontSize: 14, color: "#5b3b75" }}>📝 隐藏备注</p>
                  <textarea
                    autoFocus
                    placeholder="这个备注不会直接显示在表格中..."
                    defaultValue={selectedPhase.records[editingHiddenNote]?.hiddenNote || ""}
                    style={{ ...styles.pairInput, width: "100%", height: 70, resize: "vertical" }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && e.ctrlKey) {
                        updateHiddenNote(editingHiddenNote, (e.target as HTMLTextAreaElement).value);
                      }
                    }}
                    id="hiddenNoteInput"
                  />
                  <div style={{ display: "flex", gap: 8, marginTop: 12, justifyContent: "flex-end" }}>
                    <button onClick={() => setEditingHiddenNote(null)} style={styles.modalCancelBtn}>取消</button>
                    <button
                      onClick={() => {
                        const val = (document.getElementById("hiddenNoteInput") as HTMLTextAreaElement)?.value || "";
                        updateHiddenNote(editingHiddenNote, val);
                      }}
                      style={styles.primaryBtn}
                    >保存</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Create Project Modal ── */}
        {showCreateProject && (
          <div style={styles.modalOverlay} onClick={() => setShowCreateProject(false)}>
            <div style={styles.createModal} onClick={(e) => e.stopPropagation()}>
              <h3 style={{ margin: "0 0 16px 0", color: "#5b3b75", fontSize: 18 }}>新建项目</h3>
              <input
                autoFocus
                style={{ ...styles.pairInput, width: "100%", fontSize: 15, padding: 12 }}
                placeholder="项目名称（如：健身减脂、投资理财、学英语）"
                value={newProjectTitle}
                onChange={(e) => setNewProjectTitle(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") createProject(); }}
              />
              <p style={{ fontSize: 12, color: "#aaa", margin: "6px 0 0 0" }}>创建后可在项目下添加多个阶段目标</p>
              <div style={{ display: "flex", gap: 10, marginTop: 20, justifyContent: "flex-end" }}>
                <button onClick={() => { setShowCreateProject(false); setNewProjectTitle(""); }} style={styles.modalCancelBtn}>取消</button>
                <button onClick={createProject} style={styles.primaryBtn}>创建</button>
              </div>
            </div>
          </div>
        )}

        {/* ── Create Phase Modal ── */}
        {showCreatePhase && (
          <div style={styles.modalOverlay} onClick={() => setShowCreatePhase(false)}>
            <div style={styles.createModal} onClick={(e) => e.stopPropagation()}>
              <h3 style={{ margin: "0 0 16px 0", color: "#5b3b75", fontSize: 18 }}>新建阶段目标</h3>
              <input
                autoFocus
                style={{ ...styles.pairInput, width: "100%", fontSize: 15, padding: 12, marginBottom: 14 }}
                placeholder="阶段名称"
                value={newPhaseTitle}
                onChange={(e) => setNewPhaseTitle(e.target.value)}
              />
              <p style={{ fontSize: 13, color: "#7c5ac9", margin: "0 0 8px 0", fontWeight: 600 }}>跟踪字段（可选，后续也可添加）</p>
              <p style={{ fontSize: 12, color: "#aaa", margin: "0 0 10px 0" }}>定义你要记录的数据项，例如：体重、腰围、收益、学习时长</p>
              {newPhaseFields.map((f, i) => (
                <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "center" }}>
                  <input
                    placeholder="字段名"
                    value={f.name}
                    onChange={(e) => {
                      const cp = [...newPhaseFields];
                      cp[i].name = e.target.value;
                      setNewPhaseFields(cp);
                    }}
                    style={{ ...styles.pairInput, flex: 1 }}
                  />
                  <input
                    placeholder=""
                    value={f.unit}
                    onChange={(e) => {
                      const cp = [...newPhaseFields];
                      cp[i].unit = e.target.value;
                      setNewPhaseFields(cp);
                    }}
                    style={{ ...styles.pairInput, flex: 1 }}
                  />
                  {newPhaseFields.length > 1 && (
                    <span
                      onClick={() => setNewPhaseFields(newPhaseFields.filter((_, j) => j !== i))}
                      style={{ cursor: "pointer", color: "#ff6b81", fontSize: 18, flexShrink: 0 }}
                    >×</span>
                  )}
                </div>
              ))}
              <button
                onClick={() => setNewPhaseFields([...newPhaseFields, { name: "", unit: "" }])}
                style={styles.addFieldBtn}
              >+ 添加字段</button>
              <div style={{ display: "flex", gap: 10, marginTop: 20, justifyContent: "flex-end" }}>
                <button onClick={() => { setShowCreatePhase(false); setNewPhaseFields([{ name: "", unit: "" }]); }} style={styles.modalCancelBtn}>取消</button>
                <button onClick={createPhase} style={styles.primaryBtn}>创建阶段</button>
              </div>
            </div>
          </div>
        )}

        {/* ── Confirm Modal ── */}
        {confirmState.show && (
          <div style={styles.modalOverlay} onClick={() => setConfirmState({ show: false, message: "", onConfirm: () => {} })}>
            <div style={styles.confirmModal} onClick={(e) => e.stopPropagation()}>
              <p style={{ margin: "0 0 20px 0", fontSize: 15, color: "#333" }}>{confirmState.message}</p>
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button onClick={() => setConfirmState({ show: false, message: "", onConfirm: () => {} })} style={styles.modalCancelBtn}>取消</button>
                <button onClick={confirmState.onConfirm} style={styles.modalConfirmBtn}>确定</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(to bottom, #f7f2ff, #efe4ff, #e8d9ff)",
    position: "relative",
    overflow: "hidden",
    padding: "40px",
    fontFamily: "'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif",
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
    maxWidth: 900,
    margin: "0 auto",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    marginBottom: 8,
  },
  backBtn: {
    padding: "7px 16px",
    borderRadius: 20,
    border: "1px solid #d5c8e8",
    background: "rgba(255,255,255,0.6)",
    cursor: "pointer",
    fontSize: 13,
    color: "#7c5ac9",
    fontWeight: 500,
    flexShrink: 0,
  },
  title: {
    fontSize: 30,
    color: "#5b3b75",
    fontWeight: 700,
    margin: 0,
    letterSpacing: "-0.5px",
  },
  subtitle: {
    fontSize: 13,
    color: "#8b7aaa",
    marginTop: 4,
    marginBottom: 20,
  },
  errorBar: {
    background: "#fff0f0",
    border: "1px solid #ffb8b8",
    color: "#c0392b",
    padding: "10px 16px",
    borderRadius: 12,
    marginBottom: 16,
    fontSize: 13,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  createBtn: {
    padding: "12px 24px",
    borderRadius: 24,
    border: "none",
    background: "linear-gradient(135deg, #9f7aea, #b794f4)",
    color: "#fff",
    cursor: "pointer",
    fontSize: 15,
    fontWeight: 600,
    marginBottom: 6,
  },
  empty: {
    textAlign: "center" as const,
    padding: "60px 20px",
    background: "rgba(255,255,255,0.5)",
    borderRadius: 20,
    marginTop: 10,
  },

  // ── Project Cards ──
  cardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
    gap: 16,
    marginTop: 20,
  },
  projectCard: {
    background: "rgba(255,255,255,0.6)",
    backdropFilter: "blur(20px)",
    borderRadius: 20,
    padding: "24px",
    cursor: "pointer",
    boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
    transition: "transform 0.2s, box-shadow 0.2s",
    position: "relative",
  },
  projectCardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  projectTitle: {
    margin: 0,
    fontSize: 18,
    color: "#5b3b75",
    fontWeight: 600,
  },
  projectMeta: {
    marginTop: 12,
    fontSize: 13,
    color: "#888",
  },
  deleteIcon: {
    cursor: "pointer",
    fontSize: 14,
    opacity: 0.5,
    padding: "4px 8px",
    flexShrink: 0,
  },

  // ── Phase Cards ──
  phaseCard: {
    background: "rgba(255,255,255,0.6)",
    backdropFilter: "blur(20px)",
    borderRadius: 20,
    padding: "18px 24px",
    marginBottom: 12,
    cursor: "pointer",
    boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
    transition: "transform 0.2s, box-shadow 0.2s",
    position: "relative",
  },
  phaseNum: {
    background: "#9f7aea",
    color: "#fff",
    padding: "4px 10px",
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 600,
    flexShrink: 0,
  },
  phaseTitle: {
    margin: 0,
    fontSize: 16,
    color: "#5b3b75",
    fontWeight: 600,
  },
  phaseMeta: {
    marginTop: 4,
    fontSize: 12,
    color: "#888",
  },
  fieldTag: {
    display: "inline-block",
    background: "rgba(159,122,234,0.1)",
    color: "#7c5ac9",
    padding: "3px 10px",
    borderRadius: 10,
    fontSize: 12,
    marginRight: 6,
    marginBottom: 4,
  },

  // ── Detail ──
  detailWrap: {
    marginTop: 10,
  },
  sectionTitle: {
    margin: 0,
    color: "#5b3b75",
    fontSize: 15,
    fontWeight: 600,
  },
  addRecordBox: {
    background: "rgba(255,255,255,0.6)",
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
  },
  pairInput: {
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #e0d8f0",
    background: "rgba(255,255,255,0.95)",
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box" as const,
    fontFamily: "inherit",
  },
  fieldRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  fieldName: {
    flex: 1,
    fontSize: 14,
    color: "#5b3b75",
    fontWeight: 500,
    textAlign: "right" as const,
    paddingRight: 4,
  },
  fieldValue: {
    flex: 2,
    padding: "10px 12px",
    borderRadius: 10,
    border: "none",
    background: "rgba(255,255,255,0.85)",
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box" as const,
    fontFamily: "inherit",
  },
  fieldUnit: {
    flex: 1,
    fontSize: 13,
    color: "#888",
    textAlign: "left" as const,
    paddingLeft: 4,
  },
  primaryBtn: {
    padding: "10px 22px",
    borderRadius: 20,
    border: "none",
    background: "#9f7aea",
    color: "#fff",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 600,
  },
  cancelBtn: {
    padding: "10px 20px",
    borderRadius: 20,
    border: "1px solid #ddd",
    background: "#fff",
    cursor: "pointer",
    fontSize: 14,
    color: "#999",
  },

  // ── Table ──
  tableHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  table: {
    width: "100%",
    borderCollapse: "collapse" as const,
    fontSize: 13,
  },
  th: {
    textAlign: "left" as const,
    padding: "10px 12px",
    borderBottom: "2px solid #e0d8f0",
    color: "#5b3b75",
    fontWeight: 600,
    fontSize: 12,
    whiteSpace: "nowrap" as const,
  },
  td: {
    padding: "8px 12px",
    borderBottom: "1px solid #efe8f8",
    color: "#444",
    cursor: "default",
  },
  exportBtn: {
    padding: "7px 16px",
    borderRadius: 16,
    border: "none",
    background: "#7c5ac9",
    color: "#fff",
    cursor: "pointer",
    fontSize: 12,
    fontWeight: 500,
  },

  // ── Context Menu ──
  menuItem: {
    padding: "10px 18px",
    cursor: "pointer",
    fontSize: 14,
    transition: "background 0.15s",
    whiteSpace: "nowrap" as const,
    userSelect: "none" as const,
  },

  // ── Modals ──
  modalOverlay: {
    position: "fixed" as const,
    top: 0, left: 0, width: "100%", height: "100%",
    background: "rgba(0,0,0,0.4)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  createModal: {
    background: "#fff",
    padding: "28px 32px",
    borderRadius: 20,
    boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
    width: "90%",
    maxWidth: 520,
    maxHeight: "80vh",
    overflowY: "auto" as const,
  },
  confirmModal: {
    background: "#fff",
    padding: "28px 32px",
    borderRadius: 16,
    boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
    minWidth: 320,
  },
  smallModal: {
    background: "#fff",
    padding: "22px 26px",
    borderRadius: 16,
    boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
    width: "90%",
    maxWidth: 400,
  },
  modalCancelBtn: {
    padding: "8px 20px",
    borderRadius: 20,
    border: "1px solid #ddd",
    background: "#fff",
    cursor: "pointer",
    fontSize: 14,
    color: "#666",
  },
  modalConfirmBtn: {
    padding: "8px 20px",
    borderRadius: 20,
    border: "none",
    background: "#ff6b81",
    color: "#fff",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 500,
  },
  addFieldBtn: {
    background: "transparent",
    border: "1px dashed #b794f4",
    padding: "6px 14px",
    borderRadius: 14,
    color: "#7c5ac9",
    cursor: "pointer",
    fontSize: 13,
    marginTop: 4,
  },
};
