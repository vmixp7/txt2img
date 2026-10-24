import { Readable } from "stream";
import { getApiHost } from "lib/comfyui";

// 轉送 ComfyUI 的影片, 避免前端直接連 http 的 ComfyUI 主機
export default async function handler(req, res) {
  const { filename, subfolder = "", type = "output", download } = req.query;
  if (
    typeof filename !== "string" ||
    !/^[\w.-]+$/.test(filename) ||
    !/^[\w/-]*$/.test(subfolder) ||
    subfolder.includes("..") ||
    type !== "output"
  ) {
    return res.status(400).json({ detail: "參數錯誤" });
  }

  try {
    const params = new URLSearchParams({ filename, subfolder, type });
    const headers = req.headers.range ? { Range: req.headers.range } : {};
    const response = await fetch(`${getApiHost()}/view?${params}`, { headers });
    if (!response.ok || !response.body) {
      return res.status(response.status).json({ detail: "找不到影片" });
    }

    res.status(response.status);
    for (const name of ["content-type", "content-length", "content-range", "accept-ranges"]) {
      const value = response.headers.get(name);
      if (value) res.setHeader(name, value);
    }
    if (download) {
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    }
    Readable.fromWeb(response.body).pipe(res);
  } catch (error) {
    console.log("img2video video err---------", error);
    res.status(500).json({ detail: "伺服器維護中,請稍後!" });
  }
}

export const config = {
  api: {
    responseLimit: false,
  },
};
