"use client";

import { useEffect, useState } from "react";

type Post = {
  content: string;
  time: string;
};

export default function EssayPage() {
  const [text, setText] = useState("");
  const [posts, setPosts] = useState<Post[]>([]);
  const [editIndex, setEditIndex] = useState<number | null>(null);

  const [confirmState, setConfirmState] = useState<{
    show: boolean;
    message: string;
    onConfirm: () => void;
  }>({ show: false, message: "", onConfirm: () => {} });

  useEffect(() => {
    const saved = localStorage.getItem("essay_posts");
    if (saved) setPosts(JSON.parse(saved));
  }, []);

  const handlePublish = () => {
    if (!text.trim()) return;

    const newPost: Post = {
      content: text,
      time: new Date().toLocaleString(),
    };

    let newPosts = [...posts];
    if (editIndex !== null) {
      newPosts[editIndex] = newPost;
      setEditIndex(null);
    } else {
      newPosts = [newPost, ...posts];
    }

    setPosts(newPosts);
    localStorage.setItem("essay_posts", JSON.stringify(newPosts));
    setText("");
  };

  const handleDelete = (index: number) => {
    setConfirmState({
      show: true,
      message: "是否删除这段随笔？",
      onConfirm: () => {
        const newPosts = posts.filter((_, i) => i !== index);
        setPosts(newPosts);
        localStorage.setItem("essay_posts", JSON.stringify(newPosts));
        setConfirmState({ show: false, message: "", onConfirm: () => {} });
      },
    });
  };

  const handleEdit = (index: number) => {
    setText(posts[index].content);
    setEditIndex(index);
  };

  return (
    <div style={styles.page}>
      {/* 水墨背景 */}
      <div style={styles.bg} />

      <div style={styles.container}>
        <h1 style={styles.title}>📜 随笔</h1>

        {/* 输入区 */}
        <div style={styles.editor}>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="写下此刻的心境..."
            style={styles.textarea}
            maxLength={2000}
          />
          <small style={styles.charCount}>
            {text.length} / 2000
          </small>

          <button onClick={handlePublish} style={styles.button}>
            {editIndex !== null ? "更改这一笔" : "落笔成文"}
          </button>
          {editIndex !== null && (
            <button
              onClick={() => { setEditIndex(null); setText(""); }}
              style={styles.cancelBtn}
            >取消编辑</button>
          )}
        </div>

        {/* 空状态 */}
        {posts.length === 0 && (
          <div style={styles.empty}>
            <p style={{ fontSize: "36px", margin: "0 0 12px 0" }}>✍️</p>
            <p style={{ fontSize: "15px", color: "#999", margin: 0 }}>提笔写下此刻的心境～</p>
          </div>
        )}

        {/* 列表 */}
        {posts.map((p, i) => (
          <div key={i} style={styles.card}>
            <p style={styles.content}>{p.content}</p>
            <small style={styles.time}>{p.time}</small>

            <div style={styles.actions}>
              <button onClick={() => handleEdit(i)} style={styles.actionBtn}>编辑</button>
              <button onClick={() => handleDelete(i)} style={{ ...styles.actionBtn, color: "#e55b6c" }}>删除</button>
            </div>
          </div>
        ))}
      </div>

      {/* 确认弹窗 */}
      {confirmState.show && (
        <div style={styles.modalOverlay} onClick={() => setConfirmState({ show: false, message: "", onConfirm: () => {} })}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <p style={{ margin: "0 0 20px 0", fontSize: "15px", color: "#333" }}>{confirmState.message}</p>
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button onClick={() => setConfirmState({ show: false, message: "", onConfirm: () => {} })} style={styles.modalCancelBtn}>取消</button>
              <button onClick={confirmState.onConfirm} style={styles.modalConfirmBtn}>确定</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    position: "relative",
    fontFamily: "'Noto Serif SC', 'STSong', 'SimSun', 'Songti SC', serif",
    overflow: "hidden",
  },
  bg: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundImage: "url('/6851c3696001e01435cc0c9642c58752.jpg')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    filter: "grayscale(100%) contrast(1.1)",
    opacity: 0.25,
    zIndex: -1,
  },
  container: {
    padding: "60px",
    maxWidth: "700px",
    margin: "0 auto",
  },
  title: {
    fontSize: "28px",
    marginBottom: "30px",
    color: "#222",
    letterSpacing: "4px",
    fontWeight: 700,
  },
  editor: {
    marginBottom: "40px",
  },
  textarea: {
    width: "100%",
    height: "140px",
    border: "none",
    borderBottom: "2px solid #ccc",
    background: "transparent",
    fontSize: "16px",
    outline: "none",
    padding: "10px 0",
    lineHeight: "1.8",
    color: "#222",
    fontFamily: "inherit",
    resize: "vertical",
  },
  charCount: {
    display: "block",
    textAlign: "right",
    color: "#aaa",
    fontSize: "12px",
    marginTop: "6px",
  },
  button: {
    marginTop: "18px",
    background: "transparent",
    border: "1px solid #333",
    padding: "8px 20px",
    cursor: "pointer",
    fontSize: "14px",
    letterSpacing: "2px",
    borderRadius: "20px",
    transition: "all 0.2s",
    fontFamily: "inherit",
  },
  cancelBtn: {
    marginTop: "18px",
    marginLeft: "10px",
    background: "transparent",
    border: "1px solid #ccc",
    padding: "8px 20px",
    cursor: "pointer",
    fontSize: "13px",
    borderRadius: "20px",
    color: "#999",
    fontFamily: "inherit",
  },
  empty: {
    textAlign: "center" as const,
    padding: "60px 20px",
    opacity: 0.7,
  },
  card: {
    marginBottom: "30px",
    paddingBottom: "24px",
    borderBottom: "1px solid rgba(0,0,0,0.08)",
    transition: "border-color 0.2s",
  },
  content: {
    fontSize: "15px",
    lineHeight: "2",
    color: "#222",
    whiteSpace: "pre-wrap" as const,
    margin: 0,
  },
  time: {
    display: "block",
    marginTop: "12px",
    fontSize: "12px",
    color: "#aaa",
  },
  actions: {
    marginTop: "14px",
    display: "flex",
    gap: "12px",
  },
  actionBtn: {
    background: "transparent",
    border: "1px solid rgba(0,0,0,0.15)",
    padding: "5px 14px",
    cursor: "pointer",
    borderRadius: "14px",
    fontSize: "12px",
    transition: "all 0.2s",
    fontFamily: "inherit",
    color: "#666",
  },
  modalOverlay: {
    position: "fixed" as const,
    top: 0, left: 0, width: "100%", height: "100%",
    background: "rgba(0,0,0,0.4)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modal: {
    background: "#fff",
    padding: "28px 32px",
    borderRadius: "16px",
    boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
    minWidth: "320px",
  },
  modalCancelBtn: {
    padding: "8px 20px",
    borderRadius: "20px",
    border: "1px solid #ddd",
    background: "#fff",
    cursor: "pointer",
    fontSize: "14px",
    color: "#666",
  },
  modalConfirmBtn: {
    padding: "8px 20px",
    borderRadius: "20px",
    border: "none",
    background: "#ff6b81",
    color: "#fff",
    cursor: "pointer",
    fontSize: "14px",
  },
};
