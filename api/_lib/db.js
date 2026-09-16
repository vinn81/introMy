const { neon } = require("@neondatabase/serverless");

function getSql() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required for Vercel production APIs.");
  }
  return neon(process.env.DATABASE_URL);
}

async function ensureSchema() {
  // db/schema.sql is the single source of truth for the Neon PostgreSQL schema.
  // Schema creation and migration must be applied to Neon outside the request runtime.
  return true;
}

async function query(strings, ...values) {
  await ensureSchema();
  return getSql()(strings, ...values);
}

module.exports = { ensureSchema, getSql, query };
