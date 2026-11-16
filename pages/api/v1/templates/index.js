import { DEFAULT_TEMPLATES, listTemplates } from "lib/video-templates";

// 前台圖生影片的模板清單 (只含啟用的, 依後台排序)
export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ detail: "Method not allowed" });
  }
  try {
    const items = await listTemplates();
    res.setHeader("Cache-Control", "no-store");
    res.status(200).json({
      items: items.map(({ id, label, prompt, image }) => ({ id, label, prompt, image })),
    });
  } catch (error) {
    // 資料庫連不上時退回預設模板, 不讓前台壞掉
    console.error("templates err---------", error);
    res.status(200).json({
      items: DEFAULT_TEMPLATES.map((t, i) => ({ id: `default-${i + 1}`, ...t })),
    });
  }
}
