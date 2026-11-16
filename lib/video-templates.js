import { query, transaction } from "lib/db";

// 資料庫是空的時候寫入的預設模板 (原本寫死在 pages/img2video/index.js)
export const DEFAULT_TEMPLATES = [
  {
    label: "模板一",
    image: "/images/prompt_01.png",
    prompt:
      "一個帥氣的男生與女生熱情擁抱接吻，女生雙手環抱男生的脖子，男生雙手環抱女生的腰部，兩人緊緊貼在一起，嘴唇交纏，舌頭互相探索對方的口腔，眼神充滿愛意和渴望。鏡頭開始從側面拍攝，緩慢特寫畫面佔滿兩個人的臉，捕捉兩人深情的眼神交流。影片採用電影級的燈光和色彩，細膩呈現皮膚質感和服裝紋理，營造出浪漫而性感的氛圍。",
  },
  {
    label: "模板二",
    image: "/images/prompt_02.png",
    prompt:
      "女生雙手五指張開抓住胸部下緣，手掌緊貼胸部時用力抓胸部，手指在胸部按壓出凹陷，由下往上旋轉搓揉胸部，，扭腰擺臀，嘴巴微微張開，舌尖由左向右舔上嘴唇，性感的眼神",
  },
  {
    label: "模板三",
    image: "/images/prompt_03.png",
    prompt:
      "都市街道，有行人與車輛。女孩對鏡頭微笑後轉身，以正常偏慢到中等速度持續走路，全程不停。鏡頭極低角度接近地面從後方跟隨，清楚拍攝她優雅的步伐。精確在第3秒時鏡頭快速推進，鎖定她圓潤豐滿的臀部做特寫跟拍，並全程維持臀部特寫直到結束。自然光線、電影感運鏡、高細節、真實質感、柔和膚色、寫實風格。",
  },
  {
    label: "模板四",
    image: "/images/prompt_04.png",
    prompt:
      "女孩走上現代化的辦公樓梯。鏡頭從她正後方由下往上低角度拍攝，保持屁股在畫面的中間，隨著她一步步攀爬。最後，她轉過頭，回頭看向鏡頭，眼神中流露出一種微妙而誘人的魅力。影片採用電影級的燈光，逼真的肌膚和布料紋理，細節豐富，營造出優雅而性感的氛圍。",
  },
  {
    label: "模板五",
    image: "/images/prompt_05.png",
    prompt:
      "一位女生對鏡頭微笑後走1步自然站在往上的手扶梯上。鏡頭從她正後方貼地由下往上低角度拍攝，保持屁股在畫面的上方，女生雙腿稍微張開，鏡頭移動到裙底正下方90度角仰拍，隱約露出一點點白色超薄細邊丁字褲。柔和自然光線、真實皮膚與布料質感、連續流暢運鏡、高細節、寫實風格。",
  },
  {
    label: "模板六",
    image: "/images/prompt_06.png",
    prompt:
      "整段影片從第一幀開始就維持極低角度仰拍手機視角，鏡頭貼地並沿著地面滑動往上拍。現代便利商店，年輕女生走兩步到飲料冷藏櫃。走路兩步過程中，鏡頭貼地從下方緩慢跟進。當她彎下腰拿最下層飲料時，鏡頭鎖定在她屁股正下方，從正下方往上拍攝裙底的超薄細邊白色丁字褲。柔和螢光燈、真實皮膚、自然動作、強烈手持晃動、寫實風格。",
  },
];

const COLUMNS =
  "id, label, prompt, image, sort_order AS \"sortOrder\", enabled, updated_at AS \"updatedAt\"";

// 第一次使用時建表並寫入預設模板, 之後每個 process 只檢查一次
let schemaReady = null;
export function ensureSchema() {
  if (!schemaReady) {
    schemaReady = transaction(async (db) => {
      // 多個 process 同時啟動時只讓一個建表
      await db.query("SELECT pg_advisory_xact_lock(727001)");
      await db.query(`
        CREATE TABLE IF NOT EXISTS video_templates (
          id          SERIAL PRIMARY KEY,
          label       TEXT NOT NULL,
          prompt      TEXT NOT NULL,
          image       TEXT NOT NULL DEFAULT '',
          sort_order  INTEGER NOT NULL DEFAULT 0,
          enabled     BOOLEAN NOT NULL DEFAULT TRUE,
          created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
          updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
        )
      `);
      const { rows } = await db.query(
        "SELECT count(*)::int AS n FROM video_templates",
      );
      if (rows[0].n === 0) {
        for (const [i, t] of DEFAULT_TEMPLATES.entries()) {
          await db.query(
            "INSERT INTO video_templates (label, prompt, image, sort_order) VALUES ($1, $2, $3, $4)",
            [t.label, t.prompt, t.image, i + 1],
          );
        }
      }
    }).catch((error) => {
      schemaReady = null; // 下次再試
      throw error;
    });
  }
  return schemaReady;
}

// 前台用: 只列出啟用的
export async function listTemplates({ includeDisabled = false } = {}) {
  await ensureSchema();
  const { rows } = await query(
    `SELECT ${COLUMNS} FROM video_templates
     ${includeDisabled ? "" : "WHERE enabled"}
     ORDER BY sort_order, id`,
  );
  return rows;
}

// 驗證並整理後台送來的欄位, 回傳 { data } 或 { error }
export function cleanTemplateInput(body, { partial = false } = {}) {
  const data = {};
  const { label, prompt, image, enabled } = body || {};
  if (label !== undefined || !partial) {
    if (typeof label !== "string" || !label.trim()) return { error: "請輸入名稱" };
    if (label.length > 50) return { error: "名稱最多 50 字" };
    data.label = label.trim();
  }
  if (prompt !== undefined || !partial) {
    if (typeof prompt !== "string" || !prompt.trim()) return { error: "請輸入 Prompt" };
    if (prompt.length > 5000) return { error: "Prompt 最多 5000 字" };
    data.prompt = prompt.trim();
  }
  if (image !== undefined) {
    if (typeof image !== "string" || image.length > 1000) return { error: "圖片網址錯誤" };
    data.image = image.trim();
  }
  if (enabled !== undefined) {
    if (typeof enabled !== "boolean") return { error: "啟用狀態錯誤" };
    data.enabled = enabled;
  }
  return { data };
}

export async function createTemplate(data) {
  await ensureSchema();
  // 新模板排在最後
  const { rows } = await query(
    `INSERT INTO video_templates (label, prompt, image, enabled, sort_order)
     VALUES ($1, $2, $3, $4,
       (SELECT COALESCE(MAX(sort_order), 0) + 1 FROM video_templates))
     RETURNING ${COLUMNS}`,
    [data.label, data.prompt, data.image || "", data.enabled ?? true],
  );
  return rows[0];
}

export async function updateTemplate(id, data) {
  await ensureSchema();
  const keys = Object.keys(data);
  if (keys.length === 0) return null;
  const sets = keys.map((k, i) => `${k} = $${i + 2}`);
  const { rows } = await query(
    `UPDATE video_templates SET ${sets.join(", ")}, updated_at = now()
     WHERE id = $1 RETURNING ${COLUMNS}`,
    [id, ...keys.map((k) => data[k])],
  );
  return rows[0] || null;
}

export async function deleteTemplate(id) {
  await ensureSchema();
  const { rowCount } = await query("DELETE FROM video_templates WHERE id = $1", [id]);
  return rowCount > 0;
}

// ids 為新的排列順序 (需包含全部模板)
export async function reorderTemplates(ids) {
  await ensureSchema();
  await transaction(async (db) => {
    const { rows } = await db.query("SELECT id FROM video_templates FOR UPDATE");
    const existing = new Set(rows.map((r) => r.id));
    if (ids.length !== existing.size || !ids.every((id) => existing.has(id))) {
      const error = new Error("排序資料已過期,請重新整理後再試");
      error.status = 409;
      throw error;
    }
    await db.query(
      `UPDATE video_templates t SET sort_order = o.ord, updated_at = now()
       FROM unnest($1::int[]) WITH ORDINALITY AS o(id, ord)
       WHERE t.id = o.id`,
      [ids],
    );
  });
}
