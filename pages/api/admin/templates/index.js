import { withAdmin } from "lib/admin-auth";
import {
  cleanTemplateInput,
  createTemplate,
  listTemplates,
} from "lib/video-templates";

// GET 全部模板 (含停用), POST 新增
export default withAdmin(async (req, res) => {
  if (req.method === "GET") {
    return res.status(200).json({ items: await listTemplates({ includeDisabled: true }) });
  }
  if (req.method === "POST") {
    const { data, error } = cleanTemplateInput(req.body);
    if (error) return res.status(400).json({ detail: error });
    return res.status(201).json({ item: await createTemplate(data) });
  }
  res.status(405).json({ detail: "Method not allowed" });
});
