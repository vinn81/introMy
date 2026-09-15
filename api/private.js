const { method, requireSession } = require("./_lib/auth");
const { query } = require("./_lib/db");

module.exports = async function handler(req, res) {
  if (!method(req, res, "GET")) return;
  const session = requireSession(req, res);
  if (!session) return;
  try {
    const items = await query`SELECT kind, title, body FROM private_items WHERE user_id = ${session.userId} ORDER BY sort_order ASC`;
    res.status(200).json({ items });
  } catch (error) {
    console.error(`PRIVATE_READ_ERROR ${error.message}`);
    res.status(500).json({ error: "개인 공간을 불러오지 못했습니다." });
  }
};
