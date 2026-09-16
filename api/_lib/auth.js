const crypto = require("node:crypto");

const COOKIE_NAME = "portfolio_session";
const SESSION_TTL_SECONDS = 8 * 60 * 60;

function config() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) throw new Error("SESSION_SECRET must contain at least 32 characters.");
  const origins = (process.env.ALLOWED_ORIGINS || process.env.EXPECTED_ORIGIN || "http://localhost:3000")
    .split(",")
    .map((origin) => origin.trim().replace(/\/$/, ""))
    .filter(Boolean);
  return {
    secret,
    origins,
    rpID: process.env.RP_ID || "localhost",
    rpName: process.env.RP_NAME || "Portfolio",
  };
}

function expectedOrigins() {
  return config().origins;
}

function sign(value) {
  return crypto.createHmac("sha256", config().secret).update(value).digest("base64url");
}

function encodeSession(userId) {
  const payload = Buffer.from(JSON.stringify({
    userId,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  })).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

function parseCookies(header = "") {
  return Object.fromEntries(header.split(";").map((part) => part.trim().split("=")).filter(([key, value]) => key && value));
}

function readSession(req) {
  const value = parseCookies(req.headers.cookie)[COOKIE_NAME];
  if (!value) return null;
  const [payload, signature] = value.split(".");
  if (!payload || !signature) return null;
  const expected = sign(payload);
  if (signature.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return data.exp > Math.floor(Date.now() / 1000) ? data : null;
  } catch {
    return null;
  }
}

function setSession(res, userId) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  res.setHeader("Set-Cookie", `${COOKIE_NAME}=${encodeSession(userId)}; Max-Age=${SESSION_TTL_SECONDS}; Path=/; HttpOnly; SameSite=Lax${secure}`);
}

function clearSession(res) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  res.setHeader("Set-Cookie", `${COOKIE_NAME}=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax${secure}`);
}

function requireSession(req, res) {
  res.setHeader("Cache-Control", "no-store");
  const session = readSession(req);
  if (!session) {
    res.status(401).json({ error: "인증이 필요합니다." });
    return null;
  }
  return session;
}

function method(req, res, expected) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== expected) {
    res.setHeader("Allow", expected);
    res.status(405).json({ error: "허용되지 않은 메서드입니다." });
    return false;
  }
  return true;
}

function jsonBody(req) {
  if (!req.body) return {};
  if (typeof req.body === "object") return req.body;
  try { return JSON.parse(req.body); } catch { return {}; }
}

module.exports = {
  clearSession,
  config,
  expectedOrigins,
  jsonBody,
  method,
  readSession,
  requireSession,
  setSession,
};
