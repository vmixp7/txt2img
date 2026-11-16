import { Pool } from "pg";

// 連線字串放在 .env.local 的 DATABASE_URL
// 例: postgres://user:pass@host:5432/txt2img (雲端資料庫可加 ?sslmode=require)
// dev 熱重載會重新載入模組, 存在 global 避免連線池越開越多
const pool =
  global.__pgPool ||
  new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 5,
  });
if (process.env.NODE_ENV !== "production") global.__pgPool = pool;

export const query = (text, params) => pool.query(text, params);

// 交易: fn 收到 client, 出錯自動 rollback
export async function transaction(fn) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

// 遮掉連線字串裡的密碼
const maskUrl = (text) =>
  String(text).replace(/(:\/\/[^:/@\s]+:)[^@\s]*@/g, "$1***@");

// 目前設定的資料庫位置 (不含密碼), 例: txt2img@postgres:5432/txt2img
export function describeDbTarget() {
  const raw = process.env.DATABASE_URL;
  if (!raw) return null;
  try {
    const u = new URL(raw);
    return `${decodeURIComponent(u.username)}@${u.hostname}:${u.port || 5432}${u.pathname}`;
  } catch {
    return "(格式錯誤)";
  }
}

// 把資料庫錯誤翻成看得懂的原因 (給後台顯示, 不含密碼)
export function explainDbError(error) {
  const target = describeDbTarget();
  if (!target) return "沒有設定 DATABASE_URL,請在 .env.local 加上後重新部署";
  if (target === "(格式錯誤)") {
    return "DATABASE_URL 格式錯誤,密碼若含 @ : / # 等特殊字元需改掉或做網址編碼";
  }
  const at = `(目前設定: ${target})`;
  switch (error?.code) {
    case "ECONNREFUSED":
      return `連不上資料庫,主機或 port 錯誤,或 postgres 沒有啟動 ${at}`;
    case "ENOTFOUND":
    case "EAI_AGAIN":
      return `找不到資料庫主機名稱 ${at}`;
    case "ETIMEDOUT":
      return `連線資料庫逾時,請檢查防火牆或 Security Group ${at}`;
    case "28P01":
      return `資料庫密碼錯誤: DATABASE_URL 的密碼與資料庫不一致 (資料庫只在第一次建立時套用 POSTGRES_PASSWORD) ${at}`;
    case "28000":
      return `資料庫帳號不存在或不允許登入 ${at}`;
    case "3D000":
      return `資料庫不存在,請確認 DATABASE_URL 最後的資料庫名稱與 POSTGRES_DB 相同 ${at}`;
    case "42501":
      return `資料庫帳號沒有建表或讀寫權限 ${at}`;
    default:
      return `資料庫錯誤: ${maskUrl(error?.message || error)} ${error?.code ? `[${error.code}] ` : ""}${at}`;
  }
}

export default pool;
