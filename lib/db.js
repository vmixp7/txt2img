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

export default pool;
