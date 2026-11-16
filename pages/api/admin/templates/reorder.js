import { withAdmin } from "lib/admin-auth";
import { reorderTemplates } from "lib/video-templates";

// PUT { ids: [3, 1, 2, ...] } 依陣列順序重新排序
export default withAdmin(async (req, res) => {
  if (req.method !== "PUT") {
    return res.status(405).json({ detail: "Method not allowed" });
  }
  const { ids } = req.body || {};
  if (
    !Array.isArray(ids) ||
    !ids.every((id) => Number.isInteger(id) && id > 0) ||
    new Set(ids).size !== ids.length
  ) {
    return res.status(400).json({ detail: "參數錯誤" });
  }
  await reorderTemplates(ids);
  res.status(200).json({ ok: true });
});
