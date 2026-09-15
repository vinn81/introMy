const { query } = require("../_lib/db");
const { method, readSession } = require("../_lib/auth");
const { credentialsByUser } = require("../_lib/webauthn");

module.exports = async function handler(req, res) {
  if (!method(req, res, "GET")) return;
  try {
    const session = readSession(req);
    const countRows = await query`SELECT COUNT(*)::int AS count FROM credentials`;
    const credentials = session ? await credentialsByUser(session.userId) : [];
    let user = null;
    if (session) {
      const rows = await query`SELECT id, display_name FROM users WHERE id = ${session.userId}`;
      user = rows[0] ? { id: rows[0].id, displayName: rows[0].display_name } : null;
    }
    res.status(200).json({
      authenticated: Boolean(session && user),
      user,
      setupAvailable: process.env.INITIAL_SETUP !== "false" && Number(countRows[0]?.count || 0) === 0,
      passkeys: credentials.map((credential) => ({ name: credential.name, createdAt: credential.created_at })),
    });
  } catch (error) {
    console.error(`AUTH_STATUS_ERROR ${error.message}`);
    res.status(500).json({ error: "인증 상태를 확인하지 못했습니다." });
  }
};
