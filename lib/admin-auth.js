import crypto from "crypto";

// 後台登入: 密碼放在 .env.local 的 ADMIN_PASSWORD
// 登入後發一個帶 HMAC 簽章的 httpOnly cookie, 7 天有效
const COOKIE = "admin_session";
const MAX_AGE = 7 * 24 * 60 * 60;

// 簽章金鑰: 有 ADMIN_SECRET 就用, 否則由密碼推導 (改密碼會讓舊 session 全部失效)
const secret = () =>
  process.env.ADMIN_SECRET ||
  crypto.createHash("sha256").update(`admin:${process.env.ADMIN_PASSWORD}`).digest("hex");

const sign = (value) =>
  crypto.createHmac("sha256", secret()).update(value).digest("base64url");

const safeEqual = (a, b) => {
  const x = Buffer.from(String(a));
  const y = Buffer.from(String(b));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
};

export const adminConfigured = () => Boolean(process.env.ADMIN_PASSWORD);

export const checkPassword = (password) =>
  adminConfigured() &&
  typeof password === "string" &&
  // 先雜湊再比較, 長度不同也不會提早結束
  safeEqual(
    crypto.createHash("sha256").update(password).digest("hex"),
    crypto.createHash("sha256").update(process.env.ADMIN_PASSWORD).digest("hex"),
  );

const cookieAttrs = (maxAge) =>
  [
    `Path=/`,
    `Max-Age=${maxAge}`,
    "HttpOnly",
    "SameSite=Strict",
    process.env.NODE_ENV === "production" ? "Secure" : "",
  ]
    .filter(Boolean)
    .join("; ");

export function setAdminCookie(res) {
  const expires = Math.floor(Date.now() / 1000) + MAX_AGE;
  const value = `${expires}.${sign(String(expires))}`;
  res.setHeader("Set-Cookie", `${COOKIE}=${value}; ${cookieAttrs(MAX_AGE)}`);
}

export function clearAdminCookie(res) {
  res.setHeader("Set-Cookie", `${COOKIE}=; ${cookieAttrs(0)}`);
}

export function isAdmin(req) {
  if (!adminConfigured()) return false;
  const value = req.cookies?.[COOKIE];
  if (!value) return false;
  const [expires, sig] = value.split(".");
  if (!expires || !sig || !safeEqual(sig, sign(expires))) return false;
  return Number(expires) > Date.now() / 1000;
}

// 包住後台 API: 未登入回 401, 錯誤統一處理
export const withAdmin = (handler) => async (req, res) => {
  if (!isAdmin(req)) {
    return res.status(401).json({ detail: "請先登入" });
  }
  try {
    return await handler(req, res);
  } catch (error) {
    console.error("admin api err---------", error);
    res
      .status(error.status || 500)
      .json({ detail: error.status ? error.message : "伺服器錯誤,請稍後再試" });
  }
};
