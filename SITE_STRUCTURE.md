# 網站結構規劃 - AI美女生成

## 📋 頁面架構

```
網站首頁 (/)
├── 工具頁面 (/) - txt2img 生成工具
├── Blog (/blog)
│   ├── 文章列表頁 (/blog)
│   └── 文章詳情頁 (/blog/[slug])
├── 關於我們 (/about) - 網站介紹與功能說明
├── 使用條款 (/terms) - Terms of Use
└── 隱私政策 (/privacy)
```

## 🗂️ 文件結構

```
pages/
├── index.js              # 主頁 - AI 圖片生成工具
├── about.js              # 關於我們
├── terms.js              # 使用條款 (Terms of Use)
├── privacy.js            # 隱私政策
├── blog/
│   ├── index.js          # Blog 列表頁
│   └── [slug].js         # Blog 文章詳情頁
components/
├── Navbar.js             # 導航欄組件
├── Footer.js             # 已存在
└── BlogCard.js           # Blog 文章卡片組件
data/
└── blog-posts.js         # Blog 文章數據（靜態或可改為 API）
```

## 🧭 導航結構

```
頂部導航欄:
┌───────────────────────────────────────────────────────────────────┐
│ AI美女生成  |  工具  |  Blog  |  關於我們  |  Terms of Use  |  隱私政策  │
└───────────────────────────────────────────────────────────────────┘
```

## 📝 Blog 功能

### Blog 列表頁 (/blog)
- 顯示所有文章卡片
- 包含：標題、摘要、發布日期、縮圖
- 簡單的卡片式布局

### Blog 詳情頁 (/blog/[slug])
- 文章標題
- 發布日期
- 文章內容（支持 Markdown）
- 返回 Blog 列表按鈕

## 📊 數據結構

### Blog 文章數據格式
```javascript
{
  slug: "post-url-slug",
  title: "文章標題",
  excerpt: "文章摘要...",
  content: "完整文章內容（支持 Markdown）",
  coverImage: "/images/blog/cover.jpg",
  date: "2025-11-30",
  author: "作者名稱"
}
```

## 🎨 設計要點

1. **簡約風格**：保持與現有頁面一致的簡潔設計
2. **響應式**：使用 Tailwind CSS 確保移動端友好
3. **統一導航**：所有頁面共用同一個導航欄
4. **快速載入**：Blog 使用靜態生成（SSG）提升性能

## 🚀 實作優先級

1. ✅ 創建導航組件
2. ✅ 創建 Blog 列表頁
3. ✅ 創建 Blog 詳情頁
4. ✅ 添加示範文章數據
5. ✅ 更新所有頁面添加導航

## 📌 頁面連結

- 首頁工具: `/`
- Blog 列表: `/blog`
- 文章詳情: `/blog/how-to-use-ai-generator`
- 關於我們: `/about`
- 使用條款: `/terms`
- 隱私政策: `/privacy`
