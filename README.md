# introMy

개인 포트폴리오 웹사이트입니다.

프런트엔드는 정적 HTML/CSS/Vanilla JavaScript로 구성되어 있으며, 인증 및 Private Space API는 **Vercel Functions**에서 실행됩니다. 데이터베이스는 **Neon PostgreSQL**을 사용하고, 인증은 **WebAuthn / Passkey** 기반으로 동작합니다.

## Architecture

```text
Browser
├─ index.html
├─ style.css
└─ script.js
     │
     └─ /api/*
          ├─ auth/*
          ├─ passkeys/*
          ├─ private.js
          └─ _lib/*
               ├─ auth.js
               ├─ db.js
               └─ webauthn.js
                    │
                    └─ Neon PostgreSQL
```

## Project Structure

```text
.
├─ index.html
├─ style.css
├─ script.js
├─ assets/
├─ api/
│  ├─ _lib/
│  │  ├─ auth.js
│  │  ├─ db.js
│  │  └─ webauthn.js
│  ├─ auth/
│  ├─ passkeys/
│  └─ private.js
├─ db/
│  └─ schema.sql
├─ .env.example
├─ vercel.json
└─ package.json
```

## Runtime

- Frontend: Static HTML / CSS / Vanilla JavaScript
- API: Vercel Functions
- Database: Neon PostgreSQL
- Authentication: WebAuthn / Passkey
- Session: Signed HTTP-only cookie

별도의 Express 서버나 SQLite 데이터베이스는 사용하지 않습니다.

## Database

데이터베이스 스키마의 **단일 기준(Source of Truth)** 은 `db/schema.sql`입니다.

Neon PostgreSQL 데이터베이스를 구성하거나 스키마를 변경할 때는 `db/schema.sql`을 기준으로 적용합니다.

```text
db/schema.sql
    ↓
Neon PostgreSQL
    ↓
api/_lib/db.js
    ↓
Vercel Functions
```

애플리케이션 런타임에서는 테이블을 자동 생성하거나 스키마를 변경하지 않습니다.

`api/_lib/db.js`의 `ensureSchema()`는 기존 호출부와의 호환성을 위해 유지하지만, 실제 DDL을 실행하지 않는 no-op 함수로 사용합니다.

스키마를 변경해야 하는 경우:

1. `db/schema.sql` 수정
2. Neon PostgreSQL에 변경 내용 적용
3. 애플리케이션 코드에서 변경된 스키마 사용

런타임 코드와 실제 Neon PostgreSQL 스키마 사이에 중복된 스키마 정의를 두지 않습니다.

## Environment Variables

필요한 환경 변수는 `.env.example`을 기준으로 설정합니다.

주요 변수:

- `DATABASE_URL`: Neon PostgreSQL connection string
- `RP_ID`: WebAuthn Relying Party ID
- `RP_NAME`: WebAuthn Relying Party 표시 이름
- `EXPECTED_ORIGIN`: WebAuthn 검증에 사용할 origin
- `ALLOWED_ORIGINS`: 허용 origin 목록
- `SESSION_SECRET`: 세션 서명용 secret
- `INITIAL_SETUP`: 초기 Passkey 등록 허용 여부
- `TEST_MODE`: 필요한 경우 사용하는 테스트/개발 모드 플래그

실제 secret 값은 저장소에 커밋하지 않고 Vercel Environment Variables에서 관리합니다.

## Local Development

의존성을 설치합니다.

```bash
npm install
```

Vercel Functions를 포함해 로컬에서 실행하려면 Vercel CLI를 사용합니다.

```bash
npx vercel dev
```

로컬 환경 변수는 `.env.example`을 참고해 구성합니다.

## Deployment

이 프로젝트는 Vercel 배포를 기준으로 합니다.

1. GitHub 저장소를 Vercel 프로젝트에 연결합니다.
2. Vercel 프로젝트에 필요한 Environment Variables를 등록합니다.
3. Neon PostgreSQL에 `db/schema.sql`을 적용합니다.
4. 실제 배포 도메인에 맞게 WebAuthn 관련 `RP_ID`, `EXPECTED_ORIGIN`, `ALLOWED_ORIGINS`를 설정합니다.
5. Vercel에 배포합니다.

`vercel.json` 설정에 따라 `/api/*` 경로는 Vercel Functions로 실행됩니다.

## Authentication Flow

### Login

```text
POST /api/auth/options
        ↓
navigator.credentials.get()
        ↓
POST /api/auth/verify
        ↓
WebAuthn verification
        ↓
Signed session cookie
```

### Passkey Registration

```text
POST /api/passkeys/register-options
        ↓
navigator.credentials.create()
        ↓
POST /api/passkeys/register-verify
        ↓
Credential stored in Neon PostgreSQL
```

### Private Space

인증된 세션만 `/api/private`의 보호된 데이터에 접근할 수 있습니다.

## Session Behavior

페이지 **새로고침 또는 재접속 시 기존 로그인 상태를 강제로 해제하는 동작은 의도된 정책**입니다.

현재 `script.js`의 페이지 로드 시 로그아웃 처리를 그대로 유지합니다.

따라서 서버 측 세션 쿠키에 유효 시간이 남아 있더라도 페이지를 새로고침하거나 다시 접속한 경우 다시 Passkey 인증이 필요합니다.

## Schema Management Policy

`db/schema.sql`을 데이터베이스 정의의 유일한 기준으로 사용합니다.

- `db/schema.sql`: 실제 Neon PostgreSQL 스키마 정의
- `api/_lib/db.js`: 데이터베이스 연결 및 쿼리 처리
- `ensureSchema()`: 기존 호출부 호환용 no-op
- 런타임 `CREATE TABLE`: 사용하지 않음

이를 통해 애플리케이션 코드와 실제 데이터베이스 스키마의 불일치를 방지합니다.
