import { getReadUrl, IMG2VIDEO_PREFIX } from "lib/s3";

// 上傳到 S3 的圖片, 例如 uploads/<uuid>.png
const UPLOAD_KEY = new RegExp(`^${IMG2VIDEO_PREFIX}[\\w-]+\\.(png|jpe?g|webp)$`);

// 歷史紀錄的縮圖, 轉址到 S3 的讀取網址
export default async function handler(req, res) {
  const { key } = req.query;
  if (typeof key !== "string" || !UPLOAD_KEY.test(key)) {
    return res.status(400).json({ detail: "參數錯誤" });
  }

  try {
    res.redirect(302, await getReadUrl(key));
  } catch (error) {
    console.log("img2video image err---------", error);
    res.status(500).json({ detail: "伺服器維護中,請稍後!" });
  }
}
