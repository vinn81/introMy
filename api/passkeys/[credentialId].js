const { method, requireSession } = require("../_lib/auth");
const { query } = require("../_lib/db");

module.exports = async function handler(req, res) {
  if (!method(req, res, "DELETE")) return;
  const session = requireSession(req, res);
  if (!session) return;
  try {
    const credentialId = req.query.credentialId;
    const rows = await query`SELECT credential_id FROM credentials WHERE credential_id = ${credentialId} AND user_id = ${session.userId}`;
    if (!rows.length) return res.status(404).json({ error: "패스키를 찾을 수 없습니다." });
    const countRows = await query`SELECT COUNT(*)::int AS count FROM credentials WHERE user_id = ${session.userId}`;
    if (Number(countRows[0].count) <= 1) return res.status(409).json({ error: "계정에 최소 하나의 패스키가 필요합니다." });
    await query`DELETE FROM credentials WHERE credential_id = ${credentialId} AND user_id = ${session.userId}`;
    return res.status(204).end();
  } catch (error) {
    console.error(`PASSKEY_DELETE_ERROR ${error.message}`);
    return res.status(500).json({ error: "패스키를 삭제하지 못했습니다." });
  }
};
