import {
  adminConfigured,
  checkPassword,
  clearAdminCookie,
  setAdminCookie,
} from "lib/admin-auth";

// POST { password } 登入, DELETE 登出
export default function handler(req, res) {
  if (req.method === "DELETE") {
    clearAdminCookie(res);
    return res.status(200).json({ ok: true });
  }
  if (req.method !== "POST") {
    return res.status(405).json({ detail: "Method not allowed" });
  }
  if (!adminConfigured()) {
    return res.status(503).json({ detail: "尚未設定 ADMIN_PASSWORD" });
  }
  if (!checkPassword(req.body?.password)) {
    return res.status(401).json({ detail: "密碼錯誤" });
  }
  setAdminCookie(res);
  res.status(200).json({ ok: true });
}
