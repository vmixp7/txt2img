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
