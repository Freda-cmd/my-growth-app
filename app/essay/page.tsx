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
    const ok = confirm("是否删除这段江湖随笔？");
    if (!ok) return;

    const newPosts = posts.filter((_, i) => i !== index);
    setPosts(newPosts);
    localStorage.setItem("essay_posts", JSON.stringify(newPosts));
  };

  const handleEdit = (index: number) => {
    setText(posts[index].content);
    setEditIndex(index);
  };

  return (
    <div style={styles.page}>
      {/* 背景水墨层 */}
      <div style={styles.bg}></div>

      <div style={styles.container}>
        <h1 style={styles.title}>📜 随笔</h1>

        {/* 输入区 */}
        <div style={styles.editor}>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="写下此刻的心境..."
            style={styles.textarea}
          />

          <button onClick={handlePublish} style={styles.button}>
            {editIndex !== null ? "更改这一笔" : "落笔成文"}
          </button>
        </div>

        {/* 列表 */}
        {posts.map((p, i) => (
          <div key={i} style={styles.card}>
            <p style={styles.content}>{p.content}</p >

            <small style={styles.time}>{p.time}</small>

            <div style={styles.actions}>
              <button onClick={() => handleEdit(i)}>改</button>
              <button onClick={() => handleDelete(i)}>删</button>
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
    position: "relative",
    fontFamily: "serif",
    overflow: "hidden",
  },

  // 🏔️ 水墨背景
  bg: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundImage: "url('6851c3696001e01435cc0c9642c58752.jpg')",
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
    fontSize: "26px",
    marginBottom: "30px",
    color: "#222",
    letterSpacing: "2px",
  },

  editor: {
    marginBottom: "40px",
  },

  textarea: {
    width: "100%",
    height: "140px",
    border: "none",
    borderBottom: "1px solid #aaa",
    background: "transparent",
    fontSize: "16px",
    outline: "none",
    padding: "10px 0",
    lineHeight: "1.8",
    color: "#222",
  },

  button: {
    marginTop: "15px",
    background: "transparent",
    border: "1px solid #333",
    padding: "6px 14px",
    cursor: "pointer",
    fontSize: "13px",
    letterSpacing: "2px",
  },

  card: {
    marginBottom: "30px",
    paddingBottom: "20px",
    borderBottom: "1px solid rgba(0,0,0,0.1)",
  },

  content: {
    fontSize: "15px",
    lineHeight: "2",
    color: "#222",
  },

  time: {
    display: "block",
    marginTop: "10px",
    fontSize: "12px",
    color: "#888",
  },

  actions: {
    marginTop: "10px",
    display: "flex",
    gap: "10px",
    fontSize: "12px",
  },
};