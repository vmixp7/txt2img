import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const Bucket = process.env.S3_BUCKET;

export const IMG2VIDEO_PREFIX = "uploads/";

// 上傳用網址, 5 分鐘有效
export const getUploadUrl = (Key, ContentType) =>
  getSignedUrl(s3, new PutObjectCommand({ Bucket, Key, ContentType }), {
    expiresIn: 300,
  });

// 由伺服器直接上傳 (例如把文生圖結果複製到 S3)
export const putObject = (Key, Body, ContentType) =>
  s3.send(new PutObjectCommand({ Bucket, Key, Body, ContentType }));

// 讀取用網址 (給 ComfyUI), 1 小時有效
export const getReadUrl = (Key) =>
  getSignedUrl(s3, new GetObjectCommand({ Bucket, Key }), { expiresIn: 3600 });
