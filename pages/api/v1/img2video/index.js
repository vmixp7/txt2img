import { v4 as uuidv4 } from "uuid";
import workflow from "workflows/minimax_h3_r2v.json";
import { getReadUrl, putObject, IMG2VIDEO_PREFIX } from "lib/s3";
import { getApiHost } from "lib/comfyui";

// 文生圖輸出的檔名, 例如 txt2img_1792827950478_00001_.png
const TXT2IMG_FILENAME = /^txt2img_[\w-]+\.(png|jpe?g|webp)$/;

// 從 ComfyUI 取出文生圖結果, 複製到 S3, 回傳 S3 key
const importTxt2img = async (filename) => {
  const params = new URLSearchParams({ filename, subfolder: "", type: "output" });
  const response = await fetch(`${getApiHost()}/view?${params}`);
  if (!response.ok) return null;
  const contentType = response.headers.get("content-type") || "image/png";
  const ext = filename.split(".").pop();
  const key = `${IMG2VIDEO_PREFIX}${uuidv4()}.${ext}`;
  await putObject(key, Buffer.from(await response.arrayBuffer()), contentType);
  return key;
};

// minimax_h3_r2v.json 的節點編號
const NODES = {
  image: "308", // LoadImageFromUrlOrPath
  prompt: "316", // MiniMaxH3ReferenceToVideo
  seed: "303", // Seed (rgthree)
  monitor: "376", // PixaromaMonitor, 介面用節點, 送出前移除
};

// 參考圖鎖定人物外觀, 放在 prompt 最前面
const IDENTITY_LOCK =
  "Identity lock: <Picture 1> control the woman's face, hair, body appearance and clothes\n\n";
// 音訊設定, 使用者自訂 prompt 沒有寫的話補上
const SOUND_SETTINGS = "\n\noverall_soundscape:\nnone\n\nnon_diegetic_music:\nnone";
// 使用者沒有輸入 prompt 時使用
const DEFAULT_PROMPT = "她轉頭微笑,頭髮隨風飄逸";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ detail: "Method not allowed" });
  }

  const { key: uploadedKey, sourceFilename, prompt: userPrompt } = req.body || {};
  const fromTxt2img = typeof sourceFilename === "string" && TXT2IMG_FILENAME.test(sourceFilename);
  const fromUpload =
    typeof uploadedKey === "string" &&
    uploadedKey.startsWith(IMG2VIDEO_PREFIX) &&
    !uploadedKey.includes("..");
  if (!fromTxt2img && !fromUpload) {
    return res.status(400).json({ detail: "圖片參數錯誤" });
  }

  try {
    const key = fromTxt2img ? await importTxt2img(sourceFilename) : uploadedKey;
    if (!key) {
      return res.status(400).json({ detail: "找不到文生圖的圖片,請重新生成" });
    }

    const prompt = JSON.parse(JSON.stringify(workflow));
    prompt[NODES.image].inputs.url_or_path = await getReadUrl(key);
    let text = (typeof userPrompt === "string" && userPrompt.trim()) || DEFAULT_PROMPT;
    if (!text.includes("Identity lock")) text = IDENTITY_LOCK + text;
    if (!text.includes("overall_soundscape")) text += SOUND_SETTINGS;
    prompt[NODES.prompt].inputs.prompt = text;
    prompt[NODES.seed].inputs.seed = Math.floor(Math.random() * 1e15);
    delete prompt[NODES.monitor];

    const response = await fetch(`${getApiHost()}/prompt`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ client_id: "533ef3a3-img2video", prompt }),
    });
    const data = await response.json();
    if (response.status > 201) {
      console.log("img2video comfyui err---------", response.status, data);
      return res.status(response.status).json({ detail: "影片生成失敗,請稍後再試" });
    }

    // key 給前端存進歷史紀錄, 之後可直接重用不必重新上傳
    res.status(201).json({ promptId: data.prompt_id, key });
  } catch (error) {
    console.log("img2video err---------", error);
    res.status(500).json({ detail: "伺服器維護中,請稍後!" });
  }
}
