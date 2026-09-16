const { requireSession, jsonBody } = require("../_lib/auth");
const { query } = require("../_lib/db");

module.exports = async function handler(req, res) {
  const session = requireSession(req, res);
  if (!session) return;
  try {
    if (req.method === "GET") {
      const passkeys = await query`SELECT credential_id, name, created_at FROM credentials WHERE user_id = ${session.userId} ORDER BY created_at ASC`;
      return res.status(200).json({ passkeys: passkeys.map((passkey) => ({ credentialId: passkey.credential_id, name: passkey.name, createdAt: passkey.created_at })) });
    }
    if (req.method === "POST") {
      const body = jsonBody(req);
      if (!body.name) return res.status(400).json({ error: "패스키 이름을 입력해 주세요." });
      return res.status(400).json({ error: "등록 options API를 먼저 호출해야 합니다." });
    }
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "허용되지 않은 메서드입니다." });
  } catch (error) {
    console.error(`PASSKEYS_LIST_ERROR ${error.message}`);
    return res.status(500).json({ error: "패스키 목록을 불러오지 못했습니다." });
  }
};
