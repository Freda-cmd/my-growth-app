"use client";

import { useState, useEffect } from "react";

type Post = {
  text: string;
  images: string[];
  time: string;
};

export default function FitnessPage() {
  const [text, setText] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [previewImg, setPreviewImg] = useState<string | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const [menu, setMenu] = useState<{
    x: number;
    y: number;
    postIndex: number;
    imgIndex?: number;
  } | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("fitness_posts");
    if (saved) setPosts(JSON.parse(saved));
  }, []);

  useEffect(() => {
    const close = () => setMenu(null);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, []);

  const handleUpload = (e: any) => {
    const files = Array.from(e.target.files);

    const readers = files.map((file: any) => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readers).then((imgs) => {
      setImages([...images, ...imgs]);
    });
  };

  const handlePublish = () => {
    if (!text && images.length === 0) return;

    if (editingIndex !== null) {
      const updated = [...posts];
      updated[editingIndex] = {
        text,
        images,
        time: new Date().toLocaleString(),
      };
      setPosts(updated);
      localStorage.setItem("fitness_posts", JSON.stringify(updated));
      setEditingIndex(null);
    } else {
      const newPost: Post = {
        text,
        images,
        time: new Date().toLocaleString(),
      };
      const newPosts = [newPost, ...posts];
      setPosts(newPosts);
      localStorage.setItem("fitness_posts", JSON.stringify(newPosts));
    }

    setText("");
    setImages([]);
  };

  const deletePost = (index: number) => {
    if (!confirm("确定删除这条记录？")) return;

    const newPosts = posts.filter((_, i) => i !== index);
    setPosts(newPosts);
    localStorage.setItem("fitness_posts", JSON.stringify(newPosts));
  };

  const deleteImage = (postIndex: number, imgIndex: number) => {
    if (!confirm("删除这张图片？")) return;

    const newPosts = [...posts];
    newPosts[postIndex].images = newPosts[postIndex].images.filter(
      (_, i) => i !== imgIndex
    );
    setPosts(newPosts);
    localStorage.setItem("fitness_posts", JSON.stringify(newPosts));
  };

  const handleEdit = (index: number) => {
    const post = posts[index];
    setText(post.text);
    setImages(post.images);
    setEditingIndex(index);
  };

  const handleContextMenu = (
    e: any,
    postIndex: number,
    imgIndex?: number
  ) => {
    e.preventDefault();
    setMenu({
      x: e.clientX,
      y: e.clientY,
      postIndex,
      imgIndex,
    });
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
        />

        <input type="file" multiple onChange={handleUpload} />

        <div style={styles.preview}>
          {images.map((img, i) => (
            <div key={i} style={{ position: "relative" }}>
              <img
                src={img}
                onClick={() => setPreviewImg(img)}
                style={styles.img}
              />
              <span
                onClick={() =>
                  setImages(images.filter((_, index) => index !== i))
                }
                style={styles.close}
              >
                ×
              </span>
            </div>
          ))}
        </div>

        <button onClick={handlePublish} style={styles.button}>
          {editingIndex !== null ? "更新记录" : "发布记录"}
        </button>
      </div>

      {/* 列表 */}
      {posts.map((p, index) => (
        <div key={index} style={styles.card}>
          <p onContextMenu={(e) => handleContextMenu(e, index)}>
            {p.text}
          </p >

          <div style={styles.preview}>
            {(p.images || []).map((img, i) => (
              <img
                key={i}
                src={img}
                onClick={() => setPreviewImg(img)}
                onContextMenu={(e) => handleContextMenu(e, index, i)}
                style={styles.img}
              />
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
            boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
            overflow: "hidden",
            animation: "fadeIn 0.15s ease",
          }}
        >
          <div
            style={styles.menuItem}
            onClick={() => {
              handleEdit(menu.postIndex);
              setMenu(null);
            }}
          >
            ✏️ 编辑
          </div>

          {menu.imgIndex !== undefined ? (
            <div
              style={styles.menuItem}
              onClick={() => {
                deleteImage(menu.postIndex, menu.imgIndex!);
                setMenu(null);
              }}
            >
              🗑 删除图片
            </div>
          ) : (
            <div
              style={styles.menuItem}
              onClick={() => {
                deletePost(menu.postIndex);
                setMenu(null);
              }}
            >
              🗑 删除记录
            </div>
          )}
        </div>
      )}

      {/* 图片放大 */}
      {previewImg && (
        <div style={styles.overlay} onClick={() => setPreviewImg(null)}>
          < img src={previewImg} style={styles.bigImg} />
        </div>
      )}
    </div>
  );
}

const styles: any = {
  page: { background: "#eef4ff", minHeight: "100vh", padding: "40px" },
  title: { fontSize: "28px", marginBottom: "20px" },

  editor: {
    background: "#fff",
    padding: "20px",
    borderRadius: "16px",
    marginBottom: "30px",
  },

  textarea: { width: "100%", height: "100px", marginBottom: "10px" },

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
    background: "#f5f5f5",
    borderRadius: "10px",
    cursor: "pointer",
  },

  button: {
    marginTop: "10px",
    padding: "10px",
    background: "#4a90e2",
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

  time: { color: "#888", marginTop: "10px", display: "block" },

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

  bigImg: { maxWidth: "90%", maxHeight: "90%" },

  close: {
    position: "absolute",
    top: "5px",
    right: "5px",
    background: "red",
    color: "#fff",
    borderRadius: "50%",
    width: "18px",
    height: "18px",
    textAlign: "center",
    cursor: "pointer",
  },
};