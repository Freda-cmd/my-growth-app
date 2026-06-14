"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Post = {
  text: string;
  images: string[];
  videos: string[];
  time: string;
};

export default function DailyPage() {
  const [text, setText] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [videos, setVideos] = useState<string[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleDownload = async (url: string, filename: string) => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(blobUrl);
    } catch {
      // fallback: open in new tab
      window.open(url, "_blank");
    }
  };

  const [preview, setPreview] = useState<string | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  const [menu, setMenu] = useState<{
    x: number;
    y: number;
    index: number;
  } | null>(null);

  const [confirmState, setConfirmState] = useState<{
    show: boolean;
    message: string;
    onConfirm: () => void;
  }>({ show: false, message: "", onConfirm: () => {} });

  useEffect(() => {
    const saved = localStorage.getItem("daily_posts");
    if (saved) setPosts(JSON.parse(saved));
  }, []);

  useEffect(() => {
    const close = () => setMenu(null);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, []);

  const safeName = (file: File) => {
    const ext = file.name.split(".").pop();
    return `${Date.now()}-${Math.random().toString(36).slice(2, 6)}.${ext}`;
  };

  // 图片上传到 Supabase
  const handleImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);

    const uploaded: string[] = [];
    for (const file of files) {
      const fileName = safeName(file);
      const { error } = await supabase.storage.from("images").upload(fileName, file);
      if (error) { alert("图片上传失败: " + error.message); console.log(error); continue; }
      const { data } = supabase.storage.from("images").getPublicUrl(fileName);
      uploaded.push(data.publicUrl);
    }
    setImages([...images, ...uploaded]);
    setUploading(false);
  };

  // 视频上传到 Supabase (使用 images bucket)
  const handleVideos = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);

    const uploaded: string[] = [];
    for (const file of files) {
      const fileName = `videos/${safeName(file)}`;
      const { error } = await supabase.storage.from("images").upload(fileName, file);
      if (error) { alert("视频上传失败: " + error.message); console.log(error); continue; }
      const { data } = supabase.storage.from("images").getPublicUrl(fileName);
      uploaded.push(data.publicUrl);
    }
    setVideos([...videos, ...uploaded]);
    setUploading(false);
  };

  // 发布 / 更新
  const handlePublish = () => {
    if (!text && images.length === 0 && videos.length === 0) return;

    const newPost: Post = {
      text,
      images,
      videos,
      time: new Date().toLocaleString(),
    };

    let newPosts = [...posts];
    if (editingIndex !== null) {
      newPosts[editingIndex] = newPost;
      setEditingIndex(null);
    } else {
      newPosts = [newPost, ...posts];
    }

    setPosts(newPosts);
    localStorage.setItem("daily_posts", JSON.stringify(newPosts));
    setText("");
    setImages([]);
    setVideos([]);
  };

  const deletePost = (index: number) => {
    setConfirmState({
      show: true,
      message: "确定删除这条记录吗？",
      onConfirm: () => {
        const newPosts = posts.filter((_, i) => i !== index);
        setPosts(newPosts);
        localStorage.setItem("daily_posts", JSON.stringify(newPosts));
        setConfirmState({ show: false, message: "", onConfirm: () => {} });
      },
    });
  };

  const editPost = (index: number) => {
    const p = posts[index];
    setText(p.text);
    setImages(p.images);
    setVideos(p.videos);
    setEditingIndex(index);
  };

  const handleContextMenu = (e: React.MouseEvent, index: number) => {
    e.preventDefault();
    setMenu({ x: e.clientX, y: e.clientY, index });
  };

  const filteredPosts = search
    ? posts.filter((p) => p.text.toLowerCase().includes(search.toLowerCase()))
    : posts;

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>🌸 日常生活记录</h1>

      {/* 输入区 */}
      <div style={styles.editor}>
        <textarea
          placeholder="记录今天发生的事情..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={styles.textarea}
          maxLength={2000}
        />
        <small style={{ color: "#aaa", fontSize: "12px", textAlign: "right", display: "block", marginBottom: 12 }}>
          {text.length} / 2000
        </small>

        <div style={styles.uploadRow}>
          <label style={styles.uploadBtn}>
            上传图片
            <input type="file" hidden multiple accept="image/*" onChange={handleImages} />
          </label>
          <label style={{ ...styles.uploadBtn, background: "#f0e6ff", color: "#7c3aed", borderColor: "#d8b4fe" }}>
            上传视频
            <input type="file" hidden multiple accept="video/*" onChange={handleVideos} />
          </label>
          {uploading && <span style={{ fontSize: "13px", color: "#888" }}>上传中...</span>}
        </div>

        {/* 预览 */}
        <div style={styles.preview}>
          {images.map((img, i) => (
            <div key={i} style={styles.previewItem}>
              <img src={img} onClick={() => setPreview(img)} style={styles.img} />
              <span onClick={() => setImages(images.filter((_, j) => j !== i))} style={styles.closeBtn}>×</span>
              <a href={img} download style={styles.downloadBtn} title="下载">⬇</a>
            </div>
          ))}
          {videos.map((v, i) => (
            <div key={i} style={styles.previewItem}>
              <video src={v} controls width="320" height="240" preload="auto" playsInline style={styles.video} />
              <span onClick={() => setVideos(videos.filter((_, j) => j !== i))} style={styles.closeBtn}>×</span>
              <a href={v} download style={styles.downloadBtn} title="下载">⬇</a>
            </div>
          ))}
        </div>

        <button onClick={handlePublish} style={styles.publishBtn}>
          {editingIndex !== null ? "💾 更新记录" : "✨ 发布日常"}
        </button>
        {editingIndex !== null && (
          <button onClick={() => { setEditingIndex(null); setText(""); setImages([]); setVideos([]); }} style={styles.cancelBtn}>
            取消编辑
          </button>
        )}
      </div>

      {/* 搜索 */}
      {posts.length > 0 && (
        <input
          type="text"
          placeholder="🔍 搜索记录..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={styles.searchInput}
        />
      )}

      {/* 空状态 */}
      {posts.length === 0 && (
        <div style={styles.empty}>
          <p style={{ fontSize: "40px", margin: "0 0 12px 0" }}>📝</p>
          <p style={{ fontSize: "16px", color: "#999", margin: 0 }}>还没有记录，写下今天的第一条吧～</p>
        </div>
      )}

      {/* 列表 */}
      {filteredPosts.map((p, i) => (
        <div
          key={i}
          style={styles.card}
          onContextMenu={(e) => handleContextMenu(e, i)}
        >
          <p style={styles.postText}>{p.text}</p>

          <div style={styles.preview}>
            {p.images.map((img, j) => (
              <div key={j} style={styles.previewItem}>
                <img src={img} onClick={() => setPreview(img)} style={styles.img} />
                <a href={img} download style={styles.downloadBtn} title="下载">⬇</a>
              </div>
            ))}
            {p.videos.map((v, j) => (
              <div key={j} style={styles.previewItem}>
                <video src={v} controls width="320" height="240" preload="auto" playsInline style={styles.video} />
                <a href={v} download style={styles.downloadBtn} title="下载">⬇</a>
              </div>
            ))}
          </div>

          <small style={styles.time}>{p.time}</small>
        </div>
      ))}

      {/* 右键菜单 */}
      {menu && (
        <div style={{
          position: "fixed", top: menu.y, left: menu.x, background: "#fff",
          borderRadius: "10px", boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
          overflow: "hidden", zIndex: 999,
        }}>
          <div style={styles.menuItem} onClick={() => { editPost(menu.index); setMenu(null); }}>✏️ 编辑</div>
          <div style={styles.menuItem} onClick={() => { deletePost(menu.index); setMenu(null); }}>🗑 删除</div>
        </div>
      )}

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

      {/* 图片放大 */}
      {preview && (
        <div style={styles.overlay} onClick={() => setPreview(null)}>
          <img src={preview} style={styles.bigImg} />
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    background: "linear-gradient(135deg, #fff0f5 0%, #fce4ec 50%, #fff5f8 100%)",
    minHeight: "100vh",
    padding: "40px",
    fontFamily: "'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif",
  },
  title: {
    fontSize: "28px",
    marginBottom: "24px",
    color: "#d63384",
    fontWeight: 700,
    letterSpacing: "-0.5px",
  },
  editor: {
    background: "#fff",
    padding: "24px",
    borderRadius: "16px",
    marginBottom: "30px",
    boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
  },
  textarea: {
    width: "100%",
    height: "100px",
    marginBottom: "4px",
    borderRadius: "12px",
    border: "1px solid #f0d0e0",
    padding: "14px",
    fontSize: "15px",
    outline: "none",
    resize: "vertical",
    fontFamily: "inherit",
  },
  uploadRow: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap" as const,
    alignItems: "center",
    marginBottom: "10px",
  },
  uploadBtn: {
    display: "inline-block",
    padding: "8px 18px",
    borderRadius: "20px",
    border: "1px solid #ffb8d4",
    background: "#fff5f8",
    color: "#d63384",
    fontSize: "13px",
    cursor: "pointer",
    transition: "all 0.2s",
    userSelect: "none" as const,
  },
  preview: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap" as const,
    marginTop: "10px",
  },
  previewItem: {
    position: "relative" as const,
  },
  downloadBtn: {
    position: "absolute" as const,
    bottom: "4px",
    right: "4px",
    background: "rgba(0,0,0,0.55)",
    color: "#fff",
    borderRadius: "50%",
    width: "24px",
    height: "24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    textDecoration: "none",
    cursor: "pointer",
    lineHeight: "24px",
    textAlign: "center" as const,
  },
  img: {
    width: "120px",
    height: "120px",
    objectFit: "cover",
    background: "#fff5f8",
    borderRadius: "10px",
    border: "1px solid #ffd6e7",
    cursor: "pointer",
    transition: "transform 0.2s",
  },
  video: {
    maxWidth: "320px",
    maxHeight: "240px",
    borderRadius: "10px",
  },
  closeBtn: {
    position: "absolute" as const,
    top: "-6px",
    right: "-6px",
    background: "#ff6b81",
    color: "#fff",
    borderRadius: "50%",
    width: "20px",
    height: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "13px",
    cursor: "pointer",
    lineHeight: "20px",
    textAlign: "center" as const,
  },
  publishBtn: {
    marginTop: "14px",
    padding: "10px 28px",
    background: "linear-gradient(135deg, #ff69b4, #ff8ec7)",
    color: "#fff",
    borderRadius: "24px",
    border: "none",
    fontSize: "15px",
    cursor: "pointer",
    fontWeight: 600,
    transition: "all 0.2s",
  },
  cancelBtn: {
    marginTop: "14px",
    marginLeft: "10px",
    padding: "10px 20px",
    background: "transparent",
    color: "#999",
    borderRadius: "24px",
    border: "1px solid #ddd",
    fontSize: "14px",
    cursor: "pointer",
  },
  searchInput: {
    width: "100%",
    maxWidth: "400px",
    padding: "10px 18px",
    borderRadius: "24px",
    border: "1px solid #e8d0dc",
    background: "#fff",
    fontSize: "14px",
    outline: "none",
    marginBottom: "20px",
  },
  empty: {
    textAlign: "center" as const,
    padding: "60px 20px",
    background: "rgba(255,255,255,0.7)",
    borderRadius: "16px",
  },
  card: {
    background: "#fff",
    padding: "22px 24px",
    borderRadius: "16px",
    marginBottom: "18px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
    transition: "transform 0.2s, box-shadow 0.2s",
  },
  postText: {
    fontSize: "15px",
    lineHeight: "1.7",
    color: "#333",
    whiteSpace: "pre-wrap" as const,
    margin: "0 0 4px 0",
  },
  time: {
    color: "#bbb",
    marginTop: "12px",
    display: "block",
    fontSize: "12px",
  },
  menuItem: {
    padding: "10px 24px",
    cursor: "pointer",
    fontSize: "14px",
    transition: "background 0.15s",
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
  overlay: {
    position: "fixed" as const,
    top: 0, left: 0, width: "100%", height: "100%",
    background: "rgba(0,0,0,0.75)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  bigImg: {
    maxWidth: "90%",
    maxHeight: "90%",
    borderRadius: "12px",
  },
};
