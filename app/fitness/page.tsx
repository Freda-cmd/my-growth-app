"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

type Post = {
  text: string;
  images: string[];
  videos: string[];
  time: string;
};

export default function FitnessPage() {
  const [text, setText] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [videos, setVideos] = useState<string[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [previewImg, setPreviewImg] = useState<string | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);

  const [menu, setMenu] = useState<{
    x: number;
    y: number;
    postIndex: number;
    imgIndex?: number;
    videoIndex?: number;
  } | null>(null);

  const [confirmState, setConfirmState] = useState<{
    show: boolean;
    message: string;
    onConfirm: () => void;
  }>({ show: false, message: "", onConfirm: () => {} });

  useEffect(() => {
    const saved = localStorage.getItem("fitness_posts");
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

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);

    const uploadedUrls: string[] = [];
    for (const file of files) {
      const fileName = safeName(file);
      const { error } = await supabase.storage.from("images").upload(fileName, file);
      if (error) { alert("图片上传失败: " + error.message); continue; }
      const { data } = supabase.storage.from("images").getPublicUrl(fileName);
      uploadedUrls.push(data.publicUrl);
    }
    setImages([...images, ...uploadedUrls]);
    setUploading(false);
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);

    const uploadedUrls: string[] = [];
    for (const file of files) {
      const fileName = `videos/${safeName(file)}`;
      const { error } = await supabase.storage.from("images").upload(fileName, file);
      if (error) { alert("视频上传失败: " + error.message); continue; }
      const { data } = supabase.storage.from("images").getPublicUrl(fileName);
      uploadedUrls.push(data.publicUrl);
    }
    setVideos([...videos, ...uploadedUrls]);
    setUploading(false);
  };

  const handlePublish = () => {
    if (!text && images.length === 0 && videos.length === 0) return;

    if (editingIndex !== null) {
      const updated = [...posts];
      updated[editingIndex] = { text, images, videos, time: new Date().toLocaleString() };
      setPosts(updated);
      localStorage.setItem("fitness_posts", JSON.stringify(updated));
      setEditingIndex(null);
    } else {
      const newPost: Post = { text, images, videos, time: new Date().toLocaleString() };
      const newPosts = [newPost, ...posts];
      setPosts(newPosts);
      localStorage.setItem("fitness_posts", JSON.stringify(newPosts));
    }
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
        localStorage.setItem("fitness_posts", JSON.stringify(newPosts));
        setConfirmState({ show: false, message: "", onConfirm: () => {} });
      },
    });
  };

  const deleteImage = (postIndex: number, imgIndex: number) => {
    setConfirmState({
      show: true,
      message: "确定删除这张图片吗？",
      onConfirm: () => {
        const newPosts = [...posts];
        newPosts[postIndex].images = newPosts[postIndex].images.filter((_, i) => i !== imgIndex);
        setPosts(newPosts);
        localStorage.setItem("fitness_posts", JSON.stringify(newPosts));
        setConfirmState({ show: false, message: "", onConfirm: () => {} });
      },
    });
  };

  const deleteVideo = (postIndex: number, videoIndex: number) => {
    setConfirmState({
      show: true,
      message: "确定删除这个视频吗？",
      onConfirm: () => {
        const newPosts = [...posts];
        newPosts[postIndex].videos = newPosts[postIndex].videos.filter((_, i) => i !== videoIndex);
        setPosts(newPosts);
        localStorage.setItem("fitness_posts", JSON.stringify(newPosts));
        setConfirmState({ show: false, message: "", onConfirm: () => {} });
      },
    });
  };

  const handleEdit = (index: number) => {
    const post = posts[index];
    setText(post.text);
    setImages(post.images || []);
    setVideos(post.videos || []);
    setEditingIndex(index);
  };

  const handleContextMenu = (e: React.MouseEvent, postIndex: number, imgIndex?: number, videoIndex?: number) => {
    e.preventDefault();
    setMenu({ x: e.clientX, y: e.clientY, postIndex, imgIndex, videoIndex });
  };

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>🏋️ 健身记录</h1>

      {/* 编辑区 */}
      <div style={styles.editor}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="记录你的变化..."
          style={styles.textarea}
          maxLength={2000}
        />
        <small style={{ color: "#aaa", fontSize: "12px", textAlign: "right", display: "block", marginBottom: 12 }}>
          {text.length} / 2000
        </small>

        <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" as const }}>
          <label style={styles.uploadBtn}>
            上传图片
            <input type="file" hidden multiple accept="image/*" onChange={handleUpload} />
          </label>
          <label style={{ ...styles.uploadBtn, background: "#f0e6ff", color: "#7c3aed", borderColor: "#d8b4fe" }}>
            上传视频
            <input type="file" hidden multiple accept="video/*" onChange={handleVideoUpload} />
          </label>
          {uploading && <span style={{ fontSize: "13px", color: "#888" }}>上传中...</span>}
        </div>

        <div style={styles.preview}>
          {images.map((img, i) => (
            <div key={i} style={{ position: "relative" }}>
              <img src={img} onClick={() => setPreviewImg(img)} style={styles.img} />
              <span onClick={() => setImages(images.filter((_, index) => index !== i))} style={styles.close}>×</span>
              <a href={img} download style={styles.downloadBtn} title="下载" onClick={(e: any) => { e.stopPropagation(); }}>⬇</a>
            </div>
          ))}
          {videos.map((v, i) => (
            <div key={i} style={{ position: "relative" }}>
              <video src={v} controls width="320" height="240" preload="auto" playsInline style={styles.video} />
              <span onClick={() => setVideos(videos.filter((_, index) => index !== i))} style={styles.close}>×</span>
              <a href={v} download style={styles.downloadBtn} title="下载" onClick={(e: any) => { e.stopPropagation(); }}>⬇</a>
            </div>
          ))}
        </div>

        <button onClick={handlePublish} style={styles.publishBtn}>
          {editingIndex !== null ? "💾 更新记录" : "✨ 发布记录"}
        </button>
        {editingIndex !== null && (
          <button
            onClick={() => { setEditingIndex(null); setText(""); setImages([]); setVideos([]); }}
            style={styles.cancelBtn}
          >取消编辑</button>
        )}
      </div>

      {/* 空状态 */}
      {posts.length === 0 && (
        <div style={styles.empty}>
          <p style={{ fontSize: "40px", margin: "0 0 12px 0" }}>🏋️</p>
          <p style={{ fontSize: "16px", color: "#999", margin: 0 }}>开始记录你的健身之旅吧～</p>
        </div>
      )}

      {/* 列表 */}
      {posts.map((p, index) => (
        <div key={index} style={styles.card}>
          <p onContextMenu={(e) => handleContextMenu(e, index)} style={styles.postText}>{p.text}</p>

          <div style={styles.preview}>
            {(p.images || []).map((img, i) => (
              <div key={i} style={{ position: "relative" }}>
                <img
                  src={img}
                  onClick={() => setPreviewImg(img)}
                  onContextMenu={(e) => handleContextMenu(e, index, i)}
                  style={styles.img}
                />
                <a href={img} download style={styles.downloadBtn} title="下载" onClick={(e: any) => e.stopPropagation()}>⬇</a>
              </div>
            ))}
            {(p.videos || []).map((v, i) => (
              <div key={i} style={{ position: "relative" }}>
                <video
                  src={v} controls width="320" height="240" preload="auto" playsInline onContextMenu={(e) => handleContextMenu(e, index, undefined, i)}
                  style={styles.video}
                />
                <a href={v} download style={styles.downloadBtn} title="下载" onClick={(e: any) => e.stopPropagation()}>⬇</a>
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
          borderRadius: "10px", boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
          overflow: "hidden", zIndex: 999,
        }}>
          <div style={styles.menuItem} onClick={() => { handleEdit(menu.postIndex); setMenu(null); }}>✏️ 编辑</div>
          {menu.imgIndex !== undefined ? (
            <div style={styles.menuItem} onClick={() => { deleteImage(menu.postIndex, menu.imgIndex!); setMenu(null); }}>🗑 删除图片</div>
          ) : menu.videoIndex !== undefined ? (
            <div style={styles.menuItem} onClick={() => { deleteVideo(menu.postIndex, menu.videoIndex!); setMenu(null); }}>🗑 删除视频</div>
          ) : (
            <div style={styles.menuItem} onClick={() => { deletePost(menu.postIndex); setMenu(null); }}>🗑 删除记录</div>
          )}
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
      {previewImg && (
        <div style={styles.overlay} onClick={() => setPreviewImg(null)}>
          <img src={previewImg} style={styles.bigImg} />
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    background: "linear-gradient(135deg, #e8f0fe 0%, #eef4ff 50%, #f0f5ff 100%)",
    minHeight: "100vh",
    padding: "40px",
    fontFamily: "'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif",
  },
  title: {
    fontSize: "28px",
    marginBottom: "24px",
    color: "#2563eb",
    fontWeight: 700,
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
    border: "1px solid #d0dff0",
    padding: "14px",
    fontSize: "15px",
    outline: "none",
    resize: "vertical",
    fontFamily: "inherit",
  },
  uploadBtn: {
    display: "inline-block",
    padding: "8px 18px",
    borderRadius: "20px",
    border: "1px solid #93c5fd",
    background: "#eff6ff",
    color: "#2563eb",
    fontSize: "13px",
    cursor: "pointer",
    transition: "all 0.2s",
    userSelect: "none" as const,
  },
  preview: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap" as const,
    marginTop: "14px",
  },
  img: {
    width: "120px",
    height: "120px",
    objectFit: "cover",
    background: "#f0f5ff",
    borderRadius: "10px",
    cursor: "pointer",
    border: "1px solid #d0dff0",
    transition: "transform 0.2s",
  },
  video: {
    maxWidth: "320px",
    maxHeight: "240px",
    borderRadius: "10px",
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
  close: {
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
    marginTop: "16px",
    padding: "10px 28px",
    background: "linear-gradient(135deg, #4a90e2, #60a5fa)",
    color: "#fff",
    borderRadius: "24px",
    border: "none",
    fontSize: "15px",
    cursor: "pointer",
    fontWeight: 600,
    transition: "all 0.2s",
  },
  cancelBtn: {
    marginTop: "16px",
    marginLeft: "10px",
    padding: "10px 20px",
    background: "transparent",
    color: "#999",
    borderRadius: "24px",
    border: "1px solid #ddd",
    fontSize: "14px",
    cursor: "pointer",
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
    color: "#aaa",
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
