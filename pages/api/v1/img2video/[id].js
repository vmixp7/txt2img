import { getApiHost, findOutputFile } from "lib/comfyui";

// 查詢生成狀態: queued / running / done / error
export default async function handler(req, res) {
  const { id } = req.query;
  if (!/^[\w-]+$/.test(id)) {
    return res.status(400).json({ detail: "參數錯誤" });
  }
  const API_HOST = getApiHost();

  try {
    const historyRes = await fetch(`${API_HOST}/history/${id}`);
    const history = await historyRes.json();
    const entry = history[id];

    if (entry) {
      if (entry.status?.status_str === "error") {
        console.log("img2video execution err---------", JSON.stringify(entry.status.messages));
        return res.status(200).json({ status: "error", detail: "影片生成失敗,請重新嘗試" });
      }
      const file = findOutputFile(entry.outputs);
      if (!file) {
        return res.status(200).json({ status: "error", detail: "找不到生成的影片" });
      }
      const params = new URLSearchParams({
        filename: file.filename,
        subfolder: file.subfolder || "",
        type: file.type || "output",
      });
      return res.status(200).json({
        status: "done",
        url: `/api/v1/img2video/video?${params}`,
      });
    }

    const queueRes = await fetch(`${API_HOST}/queue`);
    if (queueRes.ok) {
      const queue = await queueRes.json();
      if (queue.queue_running?.some((item) => item[1] === id)) {
        return res.status(200).json({ status: "running" });
      }
      const pending = (queue.queue_pending || []).sort((a, b) => a[0] - b[0]);
      const index = pending.findIndex((item) => item[1] === id);
      if (index >= 0) {
        return res.status(200).json({ status: "queued", position: index + 1 });
      }
      return res.status(404).json({ status: "error", detail: "找不到這個生成任務" });
    }

    // 主機未開放 /queue 時, 只能從 /prompt 取得佇列總數
    const promptRes = await fetch(`${API_HOST}/prompt`);
    const promptInfo = await promptRes.json();
    res.status(200).json({
      status: "pending",
      queueRemaining: promptInfo.exec_info?.queue_remaining ?? null,
    });
  } catch (error) {
    console.log("img2video status err---------", error);
    res.status(500).json({ detail: "伺服器維護中,請稍後!" });
  }
}
