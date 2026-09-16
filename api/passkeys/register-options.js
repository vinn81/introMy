const { method, jsonBody, readSession } = require("../_lib/auth");
const { query } = require("../_lib/db");
const { credentialsByUser, registrationOptions, requestTestUser, userById } = require("../_lib/webauthn");

module.exports = async function handler(req, res) {
  if (!method(req, res, "POST")) return;
  try {
    const body = jsonBody(req);
    const name = typeof body.name === "string" ? body.name.trim() : "";
    if (!name || name.length > 80) return res.status(400).json({ error: "패스키 이름을 입력해 주세요." });
    const session = readSession(req);
    const totalRows = await query`SELECT COUNT(*)::int AS count FROM credentials`;
    const setupAvailable = process.env.INITIAL_SETUP !== "false" && Number(totalRows[0]?.count || 0) === 0;
    const requestedTestUser = requestTestUser(req);
    const userId = session?.userId || requestedTestUser || "owner";
    const user = await userById(userId);
    if (!user) return res.status(404).json({ error: "사용자를 찾을 수 없습니다." });
    const credentials = await credentialsByUser(userId);
    const accountSetup = setupAvailable || (process.env.TEST_MODE === "true" && requestedTestUser && credentials.length === 0);
    if (!accountSetup && session?.userId !== userId) return res.status(403).json({ error: "로그인 후 패스키를 추가할 수 있습니다." });
    res.status(200).json(await registrationOptions(userId, credentials));
  } catch (error) {
    console.error(`REGISTER_OPTIONS_ERROR ${error.message}`);
    res.status(500).json({ error: "패스키 등록 옵션을 만들지 못했습니다." });
  }
};
