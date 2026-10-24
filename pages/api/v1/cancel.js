import { getApiHost } from "lib/comfyui";

// 取消生成: 排隊中的從佇列刪除, 執行中的中斷
// 前端離開頁面時用 navigator.sendBeacon 呼叫, 只接受 POST
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ detail: "Method not allowed" });
  }

  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      body = {};
    }
  }
  const id = body?.id;
  if (typeof id !== "string" || !/^[\w-]+$/.test(id)) {
    return res.status(400).json({ detail: "參數錯誤" });
  }
  const API_HOST = getApiHost();

  try {
    const queueRes = await fetch(`${API_HOST}/queue`);
    if (!queueRes.ok) {
      console.log("img2video cancel: /queue unavailable---------", queueRes.status);
      return res.status(503).json({ detail: "主機未開放取消功能" });
    }
    const queue = await queueRes.json();
    const headers = { "Content-Type": "application/json" };

    if (queue.queue_pending?.some((item) => item[1] === id)) {
      await fetch(`${API_HOST}/queue`, {
        method: "POST",
        headers,
        body: JSON.stringify({ delete: [id] }),
      });
      console.log("img2video cancel: deleted from queue---------", id);
      return res.status(200).json({ cancelled: "queued" });
    }

    // 確認正在執行的是這個任務才中斷, 避免中斷到別人的任務
    if (queue.queue_running?.some((item) => item[1] === id)) {
      await fetch(`${API_HOST}/interrupt`, {
        method: "POST",
        headers,
        body: JSON.stringify({ prompt_id: id }),
      });
      console.log("img2video cancel: interrupted---------", id);
      return res.status(200).json({ cancelled: "running" });
    }

    res.status(200).json({ cancelled: null });
  } catch (error) {
    console.log("img2video cancel err---------", error);
    res.status(500).json({ detail: "伺服器維護中,請稍後!" });
  }
}
