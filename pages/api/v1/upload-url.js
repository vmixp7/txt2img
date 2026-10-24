import { v4 as uuidv4 } from "uuid";
import { getUploadUrl, IMG2VIDEO_PREFIX } from "lib/s3";

const allowedTypes = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ detail: "Method not allowed" });
  }

  const { contentType } = req.body || {};
  const ext = allowedTypes[contentType];
  if (!ext) {
    return res.status(400).json({ detail: "不支援的圖片格式" });
  }

  try {
    const key = `${IMG2VIDEO_PREFIX}${uuidv4()}.${ext}`;
    const uploadUrl = await getUploadUrl(key, contentType);
    res.status(200).json({ key, uploadUrl });
  } catch (error) {
    console.error("getUploadUrl err---------", error);
    res.status(500).json({ detail: "無法取得上傳網址" });
  }
}
