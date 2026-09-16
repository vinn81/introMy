const { method, jsonBody } = require("../_lib/auth");
const { userById, credentialsByUser, authenticationOptions, requestTestUser } = require("../_lib/webauthn");

module.exports = async function handler(req, res) {
  if (!method(req, res, "POST")) return;
  try {
    const body = jsonBody(req);
    const userId = requestTestUser(req) || body.userId || "owner";
    const user = await userById(userId);
    if (!user) return res.status(404).json({ error: "사용자를 찾을 수 없습니다." });
    const credentials = await credentialsByUser(userId);
    if (!credentials.length) return res.status(404).json({ error: "등록된 패스키가 없습니다." });
    res.status(200).json(await authenticationOptions(userId));
  } catch (error) {
    console.error(`AUTH_OPTIONS_ERROR ${error.message}`);
    res.status(500).json({ error: "패스키 인증 옵션을 만들지 못했습니다." });
  }
};
