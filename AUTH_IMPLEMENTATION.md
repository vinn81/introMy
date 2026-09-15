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

| 확인 항목 | 요청/조건 | 실제 결과 | 응답 예시 |
| --- | --- | --- | --- |
| 로그인하지 않고 private API 요청 | `GET /api/private` | [ ] 확인 전 | status: ____ / body: ____ |
| 다른 사용자 private data 요청 | TEST_MODE에서 다른 `:userId` | [ ] 확인 전 | status: ____ / body: ____ |
| challenge 재사용 | 같은 verify 요청 재전송 | [ ] 확인 전 | status: ____ / body: ____ |
| 패스키 삭제 후 재로그인 | credential 삭제 뒤 브라우저 인증 | [ ] 확인 전 | status: ____ / body: ____ |

문서에 세션 ID, 쿠키, token, credential public key 전문은 기록하지 않습니다. 필요하면 `[REDACTED]`로 표시합니다.

## 5. AI와 나

- AI에게 맡긴 일: 서버 라우트, 클라이언트 WebAuthn 변환, 비공개 영역 UI의 초안 구현.
- 내가 직접 판단한 일: 공개 콘텐츠 유지, 비밀번호 없는 인증, 서버 세션 기준 인가, 실제 개인정보가 아닌 가상 자료 사용.
- AI 제안을 따르지 않은 일: 비공개 자료를 HTML/JavaScript에 미리 넣거나 localStorage로 로그인 상태를 판단하는 방식은 사용하지 않음.

## 6. 아직 못 막은 것

등록된 모든 기기와 동기화된 패스키를 동시에 잃으면 별도의 계정 복구 기능이 없습니다. 운영에서는 최소 두 개 이상의 복구 가능한 패스키를 등록하고, `INITIAL_SETUP=false`로 최초 설정을 종료해야 합니다. 또한 DB 연결 장애가 발생하면 private API를 제공할 수 없으므로 Neon의 백업/접속 정책을 별도로 운영해야 합니다.
