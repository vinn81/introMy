const { clearSession, method } = require("../_lib/auth");

module.exports = async function handler(req, res) {
  if (!method(req, res, "POST")) return;
  clearSession(res);
  res.status(204).end();
};
