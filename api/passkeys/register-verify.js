const { method, jsonBody, setSession } = require("../_lib/auth");
const { consumeChallenge, verifyRegistration } = require("../_lib/webauthn");

module.exports = async function handler(req, res) {
  if (!method(req, res, "POST")) return;
  try {
    const body = jsonBody(req);
    const name = typeof body.name === "string" ? body.name.trim() : "";
    if (!body.response || !body.challengeId || !name) return res.status(400).json({ error: "등록 요청이 올바르지 않습니다." });
    const challengeRows = await require("../_lib/db").query`SELECT id, challenge, user_id FROM challenges WHERE id = ${body.challengeId} AND purpose = 'registration'`;
    const challengeRecord = challengeRows[0];
    if (!challengeRecord) return res.status(400).json({ error: "등록 요청이 만료되었거나 이미 사용되었습니다." });
    const challenge = await consumeChallenge(body.challengeId, "registration", challengeRecord.user_id);
    if (!challenge) return res.status(400).json({ error: "등록 요청이 만료되었거나 이미 사용되었습니다." });
    const result = await verifyRegistration(body.response, challenge, challengeRecord.user_id, name);
    if (!result) return res.status(400).json({ error: "패스키 등록을 검증하지 못했습니다." });
    setSession(res, challengeRecord.user_id);
    res.status(200).json({ verified: true, userId: challengeRecord.user_id, ...result });
  } catch (error) {
    const requestId = require("node:crypto").randomUUID().slice(0, 8);
    console.error(`REGISTER_VERIFY_ERROR id=${requestId} name=${error.name || "Error"} code=${error.code || "-"} message=${error.message}`);
    res.status(error.code === "23505" ? 409 : 400).json({
      error: error.code === "23505" ? "이미 등록된 패스키입니다." : `패스키 등록을 검증하지 못했습니다. (오류 ID: ${requestId})`,
    });
  }
};
