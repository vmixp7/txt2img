import getConfig from "next/config";

const { publicRuntimeConfig } = getConfig();

export const getApiHost = () =>
  process.env.NODE_ENV === "production"
    ? publicRuntimeConfig.prodApiHost
    : publicRuntimeConfig.devApiHost;

// 從 history 的 outputs 找出第一個輸出檔 (SaveVideo 可能放在 images / videos / gifs)
export const findOutputFile = (outputs = {}) => {
  for (const output of Object.values(outputs)) {
    for (const field of ["videos", "gifs", "images"]) {
      const file = output[field]?.find((f) => f.filename);
      if (file) return file;
    }
  }
  return null;
};

// 任務執行時間上限 (不含排隊), 超過就中斷
export const RUN_TIMEOUT = {
  txt2img: 30 * 1000,
  img2video: 5 * 60 * 1000,
};

// 中斷執行中的任務, 帶 prompt_id 避免中斷到別人的任務
export const interruptJob = async (apiHost, promptId) => {
  try {
    await fetch(`${apiHost}/interrupt`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt_id: promptId }),
    });
  } catch (error) {
    console.log("interrupt err---------", promptId, error);
  }
};
