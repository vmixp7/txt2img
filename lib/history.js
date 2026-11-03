// 歷史紀錄存在瀏覽器 localStorage, 只保留最近幾筆
export const HISTORY_LIMIT = 10;

export const loadHistory = (storageKey) => {
  try {
    const list = JSON.parse(localStorage.getItem(storageKey));
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
};

export const saveHistory = (storageKey, list) => {
  try {
    localStorage.setItem(storageKey, JSON.stringify(list));
  } catch {}
};

// 新紀錄放最前面, isSame 為 true 的舊紀錄移除 (沿用其最愛狀態), 回傳新的清單
// 最愛 (favorite) 不受 HISTORY_LIMIT 限制
export const addHistory = (storageKey, entry, isSame = () => false) => {
  const old = loadHistory(storageKey);
  const favorite = old.some((h) => isSame(h) && h.favorite);
  let kept = 0;
  const list = [
    { id: `${Date.now()}`, createdAt: Date.now(), ...entry, favorite },
    ...old.filter((h) => !isSame(h)),
  ].filter((h) => h.favorite || kept++ < HISTORY_LIMIT);
  saveHistory(storageKey, list);
  return list;
};
