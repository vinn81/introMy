const { method, jsonBody, setSession } = require("../_lib/auth");
const { credentialById, consumeChallenge, verifyAuthentication } = require("../_lib/webauthn");

module.exports = async function handler(req, res) {
  if (!method(req, res, "POST")) return;
  try {
    const body = jsonBody(req);
    const response = body.response;
    if (!response || !body.challengeId) return res.status(400).json({ error: "인증 요청이 올바르지 않습니다." });
    const credential = await credentialById(response.id);
    if (!credential) return res.status(401).json({ error: "등록된 패스키가 아닙니다." });
    const challenge = await consumeChallenge(body.challengeId, "authentication", credential.user_id);
    if (!challenge) return res.status(401).json({ error: "인증 요청이 만료되었거나 이미 사용되었습니다." });
    if (!(await verifyAuthentication(response, challenge, credential))) return res.status(401).json({ error: "패스키 인증에 실패했습니다." });
    setSession(res, credential.user_id);
    res.status(200).json({ verified: true });
  } catch (error) {
    console.error(`AUTH_VERIFY_ERROR ${error.message}`);
    res.status(401).json({ error: "패스키 인증에 실패했습니다." });
  }
};
