const { neon } = require("@neondatabase/serverless");

let schemaPromise;

function getSql() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required for Vercel production APIs.");
  }
  return neon(process.env.DATABASE_URL);
}

async function ensureSchema() {
  if (!schemaPromise) {
    const sql = getSql();
    schemaPromise = (async () => {
      await sql`CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        display_name TEXT NOT NULL
      )`;
      await sql`CREATE TABLE IF NOT EXISTS credentials (
        credential_id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id),
        public_key TEXT NOT NULL,
        counter BIGINT NOT NULL DEFAULT 0,
        transports JSONB NOT NULL DEFAULT '[]'::jsonb,
        name TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )`;
      await sql`CREATE TABLE IF NOT EXISTS challenges (
        id UUID PRIMARY KEY,
        challenge TEXT NOT NULL,
        purpose TEXT NOT NULL CHECK (purpose IN ('registration', 'authentication')),
        user_id TEXT NOT NULL REFERENCES users(id),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        expires_at TIMESTAMPTZ NOT NULL,
        used BOOLEAN NOT NULL DEFAULT FALSE
      )`;
      await sql`CREATE TABLE IF NOT EXISTS private_items (
        id BIGSERIAL PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id),
        kind TEXT NOT NULL,
        title TEXT NOT NULL,
        body TEXT NOT NULL,
        sort_order INTEGER NOT NULL
      )`;
      await sql`INSERT INTO users (id, display_name) VALUES ('owner', 'Portfolio Owner') ON CONFLICT (id) DO NOTHING`;
      if (process.env.TEST_MODE === "true") {
        await sql`INSERT INTO users (id, display_name) VALUES ('owner-test', 'Owner Test'), ('other-test', 'Other Test') ON CONFLICT (id) DO NOTHING`;
      }
      const items = {
        owner: [
          ["프로젝트 메모", "작은 기능을 먼저 검증하고, 확인된 흐름만 다음 단계로 확장한다."],
          ["지원 계획", "관심 직무의 기술 요구사항을 주 단위 학습 목표로 나누어 기록한다."],
          ["개인 회고", "문제를 빠르게 고치는 것보다 원인을 설명할 수 있게 정리하는 습관을 이어간다."],
        ],
        "owner-test": [
          ["프로젝트 메모", "Owner 테스트 계정에서만 보이는 가상의 프로젝트 메모다."],
          ["지원 계획", "Owner 테스트용 가상 지원 계획을 단계별로 점검한다."],
          ["개인 회고", "Owner 테스트용 가상 회고를 다음 실험의 기준으로 남긴다."],
        ],
        "other-test": [
          ["프로젝트 메모", "Other 테스트 계정 전용 가상 프로젝트 메모다."],
          ["지원 계획", "Other 테스트용 가상 지원 계획을 별도로 관리한다."],
          ["개인 회고", "Other 테스트용 가상 회고를 다음 학습에 반영한다."],
        ],
      };
      for (const [userId, userItems] of Object.entries(items)) {
        if (userId !== "owner" && process.env.TEST_MODE !== "true") continue;
        const existing = await sql`SELECT id FROM private_items WHERE user_id = ${userId} LIMIT 1`;
        if (!existing.length) {
          for (const [sortOrder, [kind, body]] of userItems.entries()) {
            await sql`INSERT INTO private_items (user_id, kind, title, body, sort_order) VALUES (${userId}, ${kind}, ${kind}, ${body}, ${sortOrder})`;
          }
        }
      }
    })().catch((error) => {
      schemaPromise = undefined;
      throw error;
    });
  }
  return schemaPromise;
}

async function query(strings, ...values) {
  await ensureSchema();
  return getSql()(strings, ...values);
}

module.exports = { ensureSchema, getSql, query };
