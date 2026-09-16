# 인증 구현 기록

## 1. 무엇으로 붙였나

- Vercel Functions가 공개 포트폴리오와 같은 origin의 `/api/*`를 제공합니다.
- `@simplewebauthn/server`가 registration/assertion의 challenge, origin, RP ID, user verification, signature를 검증합니다.
- Neon PostgreSQL이 사용자, WebAuthn credential 공개키, counter, challenge, 비공개 자료를 저장합니다.
- HMAC 서명된 HttpOnly 세션 쿠키를 서버가 검증합니다. 세션 상태는 서버 메모리나 localStorage에 두지 않습니다.

## 2. 왜 그걸 골랐나

서버가 WebAuthn 검증을 전담해야 하므로 검증 로직을 직접 작성하지 않고 검증된 라이브러리를 사용했습니다. Neon PostgreSQL은 Vercel 서버리스 인스턴스가 바뀌어도 credential과 비공개 자료를 유지하며, 서명 쿠키는 별도 세션 스토어 없이도 서버에서 위조 여부를 검증할 수 있습니다.

## 3. 어디를 어떻게 고쳤나

- 패스키 등록: `script.js`의 `startPasskeyRegistration` -> `api/passkeys/register-options.js` -> 브라우저 credential 생성 -> `api/passkeys/register-verify.js`
- 로그인: `script.js`의 `startPasskeyLogin` -> `api/auth/options.js` -> `api/auth/verify.js` -> 서명 세션 쿠키 발급
- 로그아웃: `script.js`의 로그아웃 handler -> `api/auth/logout.js` -> 만료 쿠키 발급
- 비공개 자료 조회: `script.js`의 `loadPrivateItems` -> `api/private.js` -> `requireSession` -> 세션 user ID 기준 Neon 조회

credential에는 ID, 공개키, signature counter, transports, 이름, 등록 날짜만 저장합니다. 개인키는 서버에 저장하거나 전달하지 않습니다.

## 4. 안 열리는 것을 확인한 기록

아래 표는 실제 브라우저 패스키 확인 후 기록하는 자리입니다. 아직 수행하지 않은 항목을 성공으로 표시하지 않습니다.

| 확인 항목 | 요청/조건 | 실제 결과 | 응답 |
| --- | --- | --- | --- |
| 로그인하지 않고 private API 요청 | 운영 `https://intro-my-nine.vercel.app`, Cookie 없이 `GET /api/private` | [x] 2026-09-16 실제 HTTP 호출 | HTTP 401 / `{"error":"인증이 필요합니다."}` |
| 다른 사용자 credential/challenge 조합 | 별도 비운영 Neon DB, `TEST_MODE=true`, options에 `x-test-user: owner-test`, verify에는 other-test의 response와 owner-test의 challengeId | [ ] 확인 전 | status: ____ / body: ____ |
| challenge 재사용 | 같은 verify 요청 재전송 | [ ] 확인 전 | status: ____ / body: ____ |
| 패스키 삭제 후 재로그인 | 동일 사용자 A/B 등록 → A 삭제 → 새로고침 → B 로그인 → private 조회 | [ ] 확인 전 | status: ____ / body: ____ |

Cookie, Set-Cookie, 세션 token, SESSION_SECRET, DATABASE_URL, credential ID/공개키 전문, WebAuthn raw authenticator data는 `[REDACTED]` 처리합니다. 원본 HAR, Copy as fetch/cURL 전체를 제출물에 붙이지 않습니다.

운영에서 추가로 실제 확인한 응답: `GET /` HTTP 200, Cookie 없는 `GET /api/auth/status` HTTP 200 / `{"authenticated":false,"user":null,"setupAvailable":false,"passkeys":[]}`.
이 응답만으로 운영 환경 변수 `INITIAL_SETUP=false` 또는 `TEST_MODE=false`를 확인할 수는 없습니다. Vercel 설정에서 직접 확인해야 합니다.
점검 당시 운영 private/status 응답의 Cache-Control은 `public, max-age=0, must-revalidate`였습니다. 로컬 코드의 `no-store` 보완은 재배포 후 별도 확인이 필요합니다.

### 수동 실행 순서와 기대값 (아래는 실행 결과가 아님)

**A. 성공한 인증 요청 재사용**

1. 사이트 → 나만의 공간 → DevTools Network에서 Preserve log 선택 → 패스키로 들어가기 → 등록된 패스키 인증.
2. `POST /api/auth/verify`가 200 / `{"verified":true}`인지 확인합니다.
3. 해당 요청을 Copy as fetch로 복사하여 같은 탭 Console에서 동일 body로 한 번 재전송합니다. 원본 요청은 로컬에서만 사용하고 공유하지 않습니다.
4. 두 번째 요청의 기대값은 401 / `{"error":"인증 요청이 만료되었거나 이미 사용되었습니다."}`입니다. 새 options나 새 assertion을 만들면 동일 요청 재사용 테스트가 아닙니다.
5. 두 요청의 순서, method/path, 실제 status/body만 위 표에 기록합니다.

**B. 두 패스키 중 하나 삭제 후 로그인**

1. A로 로그인합니다. 최초 계정이라면 첫 패스키 이름에 A를 입력 → 첫 패스키 등록 → 기기 인증합니다.
2. 로그인된 나만의 공간 → 추가 패스키 이름에 B 입력 → 패스키 추가 → A와 다른 인증기/기기에 B를 생성합니다. 동일 동기화 패스키를 두 번 선택하면 두 개 등록이 아닙니다.
3. Network의 `POST /api/passkeys/register-verify` 200 / `verified:true`, `GET /api/passkeys` 200 / `{"passkeys":[...]}`의 항목 수 2를 확인합니다.
4. A 행의 삭제 → `DELETE /api/passkeys/[REDACTED]` 204 / 빈 body → 목록 GET 200 / 항목 수 1(B)을 확인합니다.
5. 새로고침 → `POST /api/auth/logout` 204 / 빈 body → status GET의 `authenticated:false`와 잠금 화면을 확인합니다.
6. 패스키로 들어가기 → B 인증 → verify POST 200 / `{"verified":true}` → `GET /api/private` 200 / `{"items":[...]}`와 카드 표시를 확인합니다.
7. 등록 전후/삭제 후 목록 개수, 강제 로그아웃, B 로그인, private 응답의 실제 결과를 기록합니다. 식별자와 개인 자료는 가립니다.

**C. 다른 사용자 조합 거부 — 비운영 전용**

운영 URL에서는 실행하지 않습니다. 별도 Neon DB에 `db/schema.sql`을 적용하고 하단의 선택적 INSERT를 명시적으로 실행해 owner-test/other-test를 생성합니다. TEST_MODE=true로 설정합니다. Vercel Preview는 VERCEL_ENV=preview여야 하며 production에서는 테스트 헤더가 무시됩니다. 자동 seed/debug API는 없습니다.

비운영 사이트를 연 뒤 DevTools Console에서 다음 보조 함수를 정의합니다. 기존 페이지의 변환/직렬화 함수를 사용하며 결과를 파일에 저장하지 않습니다.

```js
async function testOptions(path, user, body = {}) {
  return requestJSON(path, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-test-user": user },
    body: JSON.stringify(body),
  });
}
async function registerTestUser(user) {
  await requestJSON("/api/auth/logout", { method: "POST", body: "{}" });
  const o = await testOptions("/api/passkeys/register-options", user, { name: user });
  const publicKey = {
    ...o, challenge: base64urlToBuffer(o.challenge),
    user: { ...o.user, id: base64urlToBuffer(o.user.id) },
    excludeCredentials: o.excludeCredentials.map(c => ({ ...c, id: base64urlToBuffer(c.id) })),
  };
  delete publicKey.challengeId;
  const c = await navigator.credentials.create({ publicKey });
  await requestJSON("/api/passkeys/register-verify", {
    method: "POST", body: JSON.stringify({ challengeId: o.challengeId, name: user, response: serializeCreationCredential(c) }),
  });
  return "registered";
}
```

1. `await registerTestUser("owner-test")` 실행 → 기기 인증 → `await registerTestUser("other-test")` 실행 → 다른 패스키 생성. 각 register-verify 200 / `verified:true`를 확인합니다. 로그아웃은 기존 세션이 테스트 헤더보다 우선하는 것을 방지합니다.
2. 다음 코드를 실행해 **owner의 새 challenge를 other의 패스키로 서명**합니다. 단순히 서로 다른 정상 요청을 재사용하는 경우보다 사용자 귀속 검증을 명확하게 확인할 수 있습니다.

```js
await requestJSON("/api/auth/logout", { method: "POST", body: "{}" });
const ownerOptions = await testOptions("/api/auth/options", "owner-test");
const otherOptions = await testOptions("/api/auth/options", "other-test");
const mixedKey = {
  ...ownerOptions,
  challenge: base64urlToBuffer(ownerOptions.challenge),
  allowCredentials: otherOptions.allowCredentials.map(c => ({ ...c, id: base64urlToBuffer(c.id) })),
};
delete mixedKey.challengeId;
const otherCredential = await navigator.credentials.get({ publicKey: mixedKey });
const mixedResult = await fetch("/api/auth/verify", {
  method: "POST", credentials: "same-origin",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ challengeId: ownerOptions.challengeId, response: serializeAuthenticationCredential(otherCredential) }),
});
console.log(mixedResult.status, await mixedResult.json());
```

3. 기대값: 401 / `{"error":"인증 요청이 만료되었거나 이미 사용되었습니다."}`. verify 자체는 x-test-user를 신뢰하지 않고 DB의 credential.user_id와 challenge.user_id를 대조합니다.
4. 이어서 Cookie 없는 private 조회가 401인지 확인합니다. 요청 조건, 실제 status/body를 위 표에 기록하고 Console은 비웁니다.

### 실행 한계

이번 환경에는 연결 가능한 브라우저와 비운영 Neon 설정이 없었습니다. A/B/C는 실행하지 않았으며 사용자께서 이미 확인한 등록/새 challenge 결과와도 구분합니다. 운영에서는 교차 사용자 테스트를 실행하지 않았습니다.

로컬 실제 handler를 임시 HTTP 서버에 연결하여 private/passkeys GET 및 passkey DELETE의 무인증 401, 나머지 인증 라우트의 잘못된 메서드 405, 전체 9개 응답의 `Cache-Control: no-store`를 확인했습니다. TEST_MODE=true에서도 production에서는 테스트 헤더가 무시되고 preview/로컬 개발에서만 허용되는 분기를 실행 확인했습니다. 이 검사는 Neon/WebAuthn 통합 검증을 대신하지 않습니다. package.json에 테스트 스크립트를 추가하지 않았습니다.

## 5. AI와 나

- AI에게 맡긴 일: 서버 라우트, 클라이언트 WebAuthn 변환, 비공개 영역 UI의 초안 구현.
- 내가 직접 판단한 일: 공개 콘텐츠 유지, 비밀번호 없는 인증, 서버 세션 기준 인가, 실제 개인정보가 아닌 가상 자료 사용.
- AI 제안을 따르지 않은 일: 비공개 자료를 HTML/JavaScript에 미리 넣거나 localStorage로 로그인 상태를 판단하는 방식은 사용하지 않음.

## 6. 아직 못 막은 것

등록된 모든 기기와 동기화된 패스키를 동시에 잃으면 별도의 계정 복구 기능이 없습니다. 운영에서는 최소 두 개 이상의 복구 가능한 패스키를 등록하고, `INITIAL_SETUP=false`로 최초 설정을 종료해야 합니다. 또한 DB 연결 장애가 발생하면 private API를 제공할 수 없으므로 Neon의 백업/접속 정책을 별도로 운영해야 합니다.
