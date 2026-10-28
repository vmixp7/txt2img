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

// 新紀錄放最前面, isSame 為 true 的舊紀錄移除, 回傳新的清單
export const addHistory = (storageKey, entry, isSame = () => false) => {
  const list = [
    { id: `${Date.now()}`, createdAt: Date.now(), ...entry },
    ...loadHistory(storageKey).filter((h) => !isSame(h)),
  ].slice(0, HISTORY_LIMIT);
  saveHistory(storageKey, list);
  return list;
};
