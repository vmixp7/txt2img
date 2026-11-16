import { withAdmin } from "lib/admin-auth";
import {
  cleanTemplateInput,
  deleteTemplate,
  updateTemplate,
} from "lib/video-templates";

// PUT 修改 (可只送部分欄位), DELETE 刪除
export default withAdmin(async (req, res) => {
  const id = Number(req.query.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ detail: "參數錯誤" });
  }

  if (req.method === "PUT") {
    const { data, error } = cleanTemplateInput(req.body, { partial: true });
    if (error) return res.status(400).json({ detail: error });
    const item = await updateTemplate(id, data);
    if (!item) return res.status(404).json({ detail: "找不到模板" });
    return res.status(200).json({ item });
  }
  if (req.method === "DELETE") {
    if (!(await deleteTemplate(id))) {
      return res.status(404).json({ detail: "找不到模板" });
    }
    return res.status(200).json({ ok: true });
  }
  res.status(405).json({ detail: "Method not allowed" });
});
