"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";

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

  const [preview, setPreview] = useState<string | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const [menu, setMenu] = useState<{
    x: number;
    y: number;
    index: number;
  } | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("daily_posts");

    if (saved) {
      setPosts(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    const close = () => setMenu(null);

    window.addEventListener("click", close);

    return () => window.removeEventListener("click", close);
  }, []);

  // 图片上传
  const handleImages = (e: any) => {
    const files = Array.from(e.target.files);

    Promise.all(
      files.map(
        (file: any) =>
          new Promise<string>((res) => {
            const reader = new FileReader();

            reader.onload = () => res(reader.result as string);

            reader.readAsDataURL(file);
          })
      )
    ).then((imgs) => setImages([...images, ...imgs]));
  };

  // 视频上传
  const handleVideos = (e: any) => {
    const files = Array.from(e.target.files);

    Promise.all(
      files.map(
        (file: any) =>
          new Promise<string>((res) => {
            const reader = new FileReader();

            reader.onload = () => res(reader.result as string);

            reader.readAsDataURL(file);
          })
      )
    ).then((vids) => setVideos([...videos, ...vids]));
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

  // 删除整条
  const deletePost = (index: number) => {
    const ok = confirm("确定删除这条记录吗？");

    if (!ok) return;

    const newPosts = posts.filter((_, i) => i !== index);

    setPosts(newPosts);

    localStorage.setItem("daily_posts", JSON.stringify(newPosts));
  };

  // 编辑整条
  const editPost = (index: number) => {
    const p = posts[index];

    setText(p.text);
    setImages(p.images);
    setVideos(p.videos);

    setEditingIndex(index);
  };

  // 右键菜单
  const handleContextMenu = (e: any, index: number) => {
    e.preventDefault();

    setMenu({
      x: e.clientX,
      y: e.clientY,
      index,
    });
  };

  return (
    <div style={styles.page}>
      <Navbar />

      <h1 style={styles.title}>🌸 日常生活记录</h1>

      {/* 输入区 */}
      <div style={styles.editor}>
        <textarea
          placeholder="记录今天发生的事情..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={styles.textarea}
        />

        <div style={{ display: "flex", gap: "10px" }}>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImages}
          />

          <input
            type="file"
            multiple
            accept="video/*"
            onChange={handleVideos}
          />
        </div>

        {/* 预览 */}
        <div style={styles.preview}>
          {images.map((img, i) => (
            <img
              key={i}
              src={img}
              onClick={() => setPreview(img)}
              style={styles.img}
            />
          ))}

          {videos.map((v, i) => (
            <video key={i} src={v} controls style={styles.video} />
          ))}
        </div>

        <button onClick={handlePublish} style={styles.button}>
          {editingIndex !== null ? "更新记录" : "发布日常"}
        </button>
      </div>

      {/* 列表 */}
      {posts.map((p, i) => (
        <div
          key={i}
          style={styles.card}
          onContextMenu={(e) => handleContextMenu(e, i)}
        >
          <p>{p.text}</p >

          <div style={styles.preview}>
            {p.images.map((img, j) => (
              <img
                key={j}
                src={img}
                onClick={() => setPreview(img)}
                style={styles.img}
              />
            ))}

            {p.videos.map((v, j) => (
              <video key={j} src={v} controls style={styles.video} />
            ))}
          </div>

          <small style={styles.time}>{p.time}</small>
        </div>
      ))}

      {/* 右键菜单 */}
      {menu && (
        <div
          style={{
            position: "fixed",
            top: menu.y,
            left: menu.x,
            background: "#fff",
            borderRadius: "10px",
            boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
            overflow: "hidden",
            zIndex: 999,
          }}
        >
          <div
            style={styles.menuItem}
            onClick={() => {
              editPost(menu.index);
              setMenu(null);
            }}
          >
            ✏️ 编辑
          </div>

          <div
            style={styles.menuItem}
            onClick={() => {
              deletePost(menu.index);
              setMenu(null);
            }}
          >
            🗑 删除
          </div>
        </div>
      )}

      {/* 图片放大 */}
      {preview && (
        <div style={styles.overlay} onClick={() => setPreview(null)}>
          < img src={preview} style={styles.bigImg} />
        </div>
      )}
    </div>
  );
}

const styles: any = {
  page: {
    background: "#fff0f5",
    minHeight: "100vh",
    padding: "40px",
  },

  title: {
    fontSize: "28px",
    marginBottom: "20px",
    color: "#d63384",
  },

  editor: {
    background: "#fff",
    padding: "20px",
    borderRadius: "16px",
    marginBottom: "30px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
  },

  textarea: {
    width: "100%",
    height: "100px",
    marginBottom: "10px",
    borderRadius: "10px",
    border: "1px solid #eee",
    padding: "10px",
  },

  preview: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    marginTop: "10px",
  },

  img: {
    width: "120px",
    height: "120px",
    objectFit: "contain",
    background: "#fff5f8",
    borderRadius: "10px",
    border: "1px solid #ffd6e7",
    cursor: "pointer",
  },

  video: {
    width: "200px",
    borderRadius: "10px",
  },

  button: {
    marginTop: "10px",
    padding: "10px",
    background: "#ff69b4",
    color: "#fff",
    borderRadius: "8px",
    border: "none",
  },

  card: {
    background: "#fff",
    padding: "20px",
    borderRadius: "16px",
    marginBottom: "20px",
  },

  time: {
    color: "#aaa",
    marginTop: "10px",
    display: "block",
  },

  menuItem: {
    padding: "10px 20px",
    cursor: "pointer",
  },

  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.7)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },

  bigImg: {
    maxWidth: "90%",
    maxHeight: "90%",
  },
};