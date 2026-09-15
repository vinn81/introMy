-- introMy / Neon PostgreSQL schema
-- Run this file once in the Neon SQL Editor.
-- Do not store WebAuthn private keys here. The application stores only credential public keys.

BEGIN;

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS credentials (
  credential_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  public_key TEXT NOT NULL,
  counter BIGINT NOT NULL DEFAULT 0 CHECK (counter >= 0),
  transports JSONB NOT NULL DEFAULT '[]'::jsonb,
  name TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 80),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS challenges (
  id UUID PRIMARY KEY,
  challenge TEXT NOT NULL,
  purpose TEXT NOT NULL CHECK (purpose IN ('registration', 'authentication')),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS private_items (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kind TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  UNIQUE (user_id, kind)
);

CREATE INDEX IF NOT EXISTS credentials_user_id_idx
  ON credentials (user_id);

CREATE INDEX IF NOT EXISTS challenges_lookup_idx
  ON challenges (id, purpose, user_id, used, expires_at);

CREATE INDEX IF NOT EXISTS private_items_user_order_idx
  ON private_items (user_id, sort_order);

INSERT INTO users (id, display_name)
VALUES ('owner', 'Portfolio Owner')
ON CONFLICT (id) DO NOTHING;

INSERT INTO private_items (user_id, kind, title, body, sort_order)
VALUES
  (
    'owner',
    '프로젝트 메모',
    '프로젝트 메모',
    '작은 기능을 먼저 검증하고, 확인된 흐름만 다음 단계로 확장한다.',
    0
  ),
  (
    'owner',
    '지원 계획',
    '지원 계획',
    '관심 직무의 기술 요구사항을 주 단위 학습 목표로 나누어 기록한다.',
    1
  ),
  (
    'owner',
    '개인 회고',
    '개인 회고',
    '문제를 빠르게 고치는 것보다 원인을 설명할 수 있게 정리하는 습관을 이어간다.',
    2
  )
ON CONFLICT (user_id, kind) DO NOTHING;

COMMIT;

-- Optional TEST_MODE setup. Enable only in a non-production Neon database or
-- when TEST_MODE=true. The application also creates these users automatically.
-- INSERT INTO users (id, display_name) VALUES
--   ('owner-test', 'Owner Test'),
--   ('other-test', 'Other Test')
-- ON CONFLICT (id) DO NOTHING;
