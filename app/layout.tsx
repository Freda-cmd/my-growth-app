import "./globals.css";

export const metadata = {
  title: "MIMI SPACE",
  description: "记录日常与成长",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh">
      <body className="bg-[#f8f8f8] text-gray-800 antialiased">

        {/* 🌿 顶部导航（极简 + 高级感） */}
        <nav className="fixed top-0 left-0 w-full flex justify-center gap-10 py-5 text-sm z-50 backdrop-blur-md bg-white/40">
          <a href=" " className="hover:opacity-60 transition">首页</a >
          <a href="/blog" className="hover:opacity-60 transition">日常</a >
          <a href="/fitness" className="hover:opacity-60 transition">健身</a >
          <a href="/about" className="hover:opacity-60 transition">关于</a >
        </nav>

        {/* 页面内容 */}
        <main className="pt-20">
          {children}
        </main>

      </body>
    </html>
  );
}