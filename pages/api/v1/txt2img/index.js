import getConfig from 'next/config'
const { publicRuntimeConfig } = getConfig()
const ENV  = process.env.NODE_ENV;
let API_HOST = process.env.API_HOST;

const POLL_INTERVAL = 2000;
const MAX_WAIT = 10 * 60 * 1000;

// 任務是否還在 ComfyUI 佇列中 (排隊或執行中)
async function isQueued(prompt_id) {
    const resp = await fetch(`${API_HOST}/queue`);
    if (!resp.ok) return true; // 無法確認時當作還在跑
    const queue = await resp.json();
    return [...(queue.queue_running || []), ...(queue.queue_pending || [])]
        .some(item => item[1] === prompt_id);
}

// 等待任務完成: 只要還在佇列中就繼續等, 被取消或前端斷線就停止
async function getHistory(prompt_id, isAborted) {
    const startTime = Date.now();
    while (Date.now() - startTime < MAX_WAIT) {
        if (isAborted()) {
            throw new Error("Client disconnected");
        }
        const resp = await fetch(`${API_HOST}/history/${prompt_id}`);
        const datas = await resp.json();
        if (Object.keys(datas).length > 0) {
            console.log("getHistory1---------", datas);
            return datas;
        }
        if (!(await isQueued(prompt_id))) {
            // 再確認一次 history, 避免剛好在兩次查詢之間完成
            const resp2 = await fetch(`${API_HOST}/history/${prompt_id}`);
            const datas2 = await resp2.json();
            if (Object.keys(datas2).length > 0) return datas2;
            throw new Error("Job not found (cancelled?)");
        }
        await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL));
    }
    throw new Error("Max wait reached");
}

export default async function handler(req, res) {

  // remnove null and undefined values
  req.body = Object.entries(req.body).reduce(
    (a, [k, v]) => (v == null ? a : ((a[k] = v), a)),
    {}
  );

  if (ENV === 'production') {
    API_HOST = publicRuntimeConfig.prodApiHost
  } else {
    API_HOST = publicRuntimeConfig.devApiHost
  }

  // console.log(`-------------- ${req.body.email} ---------------`);
  // console.log('prompt:', req.body.prompt);
  // delete req.body.email;

  try {
    const headers = {
      "Content-Type": "application/json",
    }
    const response = await fetch(`${API_HOST}/prompt`, {
      method: "POST",
      headers,
      body: JSON.stringify(req.body),
    });
    if (response.status > 201) {
      console.log("sdapi err---------", response.status);
      let error = await response.json();
      res.statusCode = response.status;
      res.end(JSON.stringify({ detail: error.detail }));
      return;
    }
    const prediction = await response.json();
    console.log("prediction1---------", prediction);

    // 前端取消或離開頁面時連線會中斷, 就不用再等
    let clientGone = false;
    res.on("close", () => {
      if (!res.writableEnded) clientGone = true;
    });

    console.log(" --------- history start --------- ");
    const prediction2 = await getHistory(prediction.prompt_id, () => clientGone);
    console.log("--------- history end --------- ");

    // const prediction2 = await response2.json();

    const entry = prediction2[prediction.prompt_id];
    if (entry.status?.status_str === "error") {
      console.log("txt2img execution err---------", JSON.stringify(entry.status.messages));
      return res.status(500).json({ detail: "圖片生成失敗,請重新嘗試" });
    }
    const filename = entry.outputs["48"].images[0].filename;
    console.log("filename--", filename);

    const resjon = {
      url: `${API_HOST}/view?filename=${filename}`,
      filename: filename,
    }
    console.log("resjon---------", resjon);
    res.statusCode = 201;
    res.end(JSON.stringify(resjon));
  } catch (error) {
    console.log("error1---------", error);
    return res.status(500).json({ detail: "伺服器維護中,請稍後!" });
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb",
    },
  },
};
