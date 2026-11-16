import { v4 as uuidv4 } from "uuid";
import { withAdmin } from "lib/admin-auth";
import { getUploadUrl, TEMPLATE_PREFIX } from "lib/s3";

const allowedTypes = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

// 模板縮圖上傳到 S3 templates/, 回傳網址給前台顯示
export default withAdmin(async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ detail: "Method not allowed" });
  }
  const ext = allowedTypes[req.body?.contentType];
  if (!ext) return res.status(400).json({ detail: "不支援的圖片格式" });

  const key = `${TEMPLATE_PREFIX}${uuidv4()}.${ext}`;
  const uploadUrl = await getUploadUrl(key, req.body.contentType);
  const imageUrl = `/api/v1/img2video/image?${new URLSearchParams({ key })}`;
  res.status(200).json({ key, uploadUrl, imageUrl });
});
