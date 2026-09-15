🌐 Personal Portfolio Checklist

포트폴리오 공개 전, 대상·공개 범위·근거·반응형 화면·접근성·상호작용을 점검하기 위한 체크리스트입니다.

📌 목차

카드 1 — 대상과 공개 범위

카드 2 — 말이 아니라 근거

카드 3 — 두 화면의 첫인상

카드 4 — 실제 결함 세 개

카드 5 — 나와 연결된 상호작용

짧은 확인 방법

AI와 나의 판단

🎯 카드 1 — 대상과 공개 범위

하는 일

누구에게 무엇을 보여줄지 정하고 공개·비공개 범위를 먼저 나눕니다.

대상과 목적

이 포트폴리오는 채용 담당자와 포트폴리오 방문자에게
나의 전공, 학습 경험, 관심 분야와 강점을 보여주기 위한 페이지입니다.

공개 범위

✅ 공개할 것

이름 및 전공

주소 및 상세 거주 정보

관심 분야와 현재 학습 활동

🔒 공개하지 않을 것

전화번호 및 개인 연락처

강점, 프로젝트 및 학습 경험

비밀번호·토큰 등 비밀 정보

공개 주소

https://intro-my-nine.vercel.app

확인

새 시크릿 창에서 로그인·인증 없이 접속되는지 확인

공개할 정보 3개 이상 작성

공개하지 않을 정보 3개 이상 작성

🧩 카드 2 — 말이 아니라 근거

하는 일

강점 3개를 상황 → 행동 → 결과로 작성하고 공개 가능한 근거를 연결합니다.

1. 꾸준함

상황
운영체제 전공 수업에서 페이지 교체 알고리즘이 잘 이해되지 않았습니다.

행동
그냥 넘어가지 않고 웹 자료를 찾아보고 선배들에게 질문하며 여러 방식으로 개념을 다시 확인했습니다.

결과
결국 페이지 교체 알고리즘을 스스로 설명할 수 있을 정도로 이해하고 내 지식으로 만들 수 있었습니다.

2. 도전 정신

상황
팀 프로젝트 중 문제의 분기점을 설계하는 활동을 팀원들이 어려워했습니다.

행동
직접 나서서 여러 분기점을 만들고 팀원들에게 하나씩 확인받으며 내용을 보완했습니다.

결과
팀에서 사용할 수 있는 분기 구조를 완성하고 다음 작업을 진행할 수 있었습니다.

3. 문제 해결력

상황
네트워크 실습 중 라우터 설정 오류로 서로 다른 네트워크 간 통신이 되지 않았습니다.

행동
여러 설정을 한꺼번에 바꾸지 않고 인터페이스와 라우팅 설정을 하나씩 확인하며 문제 원인을 좁혀갔습니다.

결과
잘못된 설정을 찾아 수정했고 최종적으로 네트워크 간 통신에 성공했습니다.

공개 가능한 근거

정보처리기사 자격 취득

GitHub 학습 및 프로젝트 기록

🖥️ 카드 3 — 두 화면의 첫인상

하는 일

1366×768과 1920×1080 두 기준 해상도에서 첫 화면과 가로 넘침을 검사합니다.

1366×768 검사

소개 영역 확인

현재 학습 활동 확인

근거(Evidence) 표시 여부 확인

가로 넘침 여부 확인

1920×1080 검사

소개 영역 확인

현재 학습 활동 확인

근거(Evidence) 표시 여부 확인

가로 넘침 여부 확인

수정 내용

첫 화면에서 소개·활동·근거를 확인할 수 있도록
핵심 정보 영역에 Evidence 정보를 추가했습니다.

최종 확인 문장

1366×768과 1920×1080에서 소개·현재 활동·근거가 스크롤 전 첫 화면에서 확인되며 가로 넘침이 발생하지 않는지 최종 배포 화면에서 확인합니다.

🛠️ 카드 4 — 실제 결함 세 개

하는 일

링크·키보드·제목·명암·콘솔을 확인하고 실제로 발견한 결함을 수정합니다.

1. 제목 단계 문제

수정 전

수정 후

페이지의 대표 제목이 h2로 시작하여 h1 제목이 존재하지 않았습니다.

대표 제목을 h1으로 변경하여 h1 → h2 → h3 순서의 제목 구조를 만들었습니다.

2. 텍스트 명암 대비 문제

수정 전

수정 후

보조 텍스트 색상의 배경 대비가 일반 텍스트 기준 4.5:1보다 낮았습니다.

보조 텍스트 색상을 더 어둡게 변경하여 일반 글자의 대비 기준을 충족하도록 수정했습니다.

3. CSS 문법 오류

수정 전

수정 후

strength-card의 CSS에 불필요한 역슬래시(\)가 포함되어 다음 CSS 선언이 정상 적용되지 않을 수 있었습니다.

불필요한 역슬래시를 제거하여 CSS 선언이 정상 적용되도록 수정했습니다.

추가 검사

모든 링크가 선언한 주소로 열리는지 확인

Tab 키로 주요 기능을 순서대로 이동할 수 있는지 확인

Enter와 Space로 강점 펼치기 기능이 작동하는지 확인

브라우저 콘솔의 빨간 오류가 0건인지 확인

🖱️ 카드 5 — 나와 연결된 상호작용

하는 일

강점 소개와 연결된 펼치기 상호작용을 마우스와 키보드 모두에서 사용할 수 있도록 구성합니다.

상호작용

나를 보여주는 3가지의 각 강점 카드에서
자세히 보기 버튼을 누르면 상황·행동·결과가 펼쳐집니다.

마우스 확인

자세히 보기 버튼을 클릭하면 해당 강점 내용이 펼쳐지고 버튼 문구가 접기로 변경됩니다.

키보드 확인

Tab 키로 버튼에 이동한 뒤 Enter 또는 Space를 누르면 마우스와 동일하게 내용이 펼쳐지고 접힙니다.

움직임 줄이기

prefers-reduced-motion 설정을 적용하여 사용자가 운영체제에서 움직임 감소를 선택한 경우 애니메이션과 전환 효과가 최소화되도록 구성했습니다.

개인정보 및 비밀값 확인

주소 및 상세 거주 정보 없음

전화번호 및 개인 연락처 없음

비밀번호·토큰·API 키 원문 없음

배포 전 Git 기록과 제출물에서도 비밀값이 없는지 최종 확인

✅ 짧은 확인 방법

항목

확인 방법

위치

포트폴리오의 나를 보여주는 3가지 영역

행동

페이지 접속 → 자세히 보기 선택 → 키보드 Tab·Enter로 동일 기능 확인

통과 모습

선택한 강점의 내용만 펼쳐지고 접기로 변경되며 키보드에서도 동일하게 작동함

안 될 때 모습

다른 강점까지 함께 펼쳐지거나 버튼이 작동하지 않고 키보드로 선택할 수 없음

🤖 AI와 나의 판단

구분

내용

AI에게 맡긴 일

페이지 구조와 디자인 개선, 반응형 화면 및 상호작용 코드 작성에 도움을 받았습니다.

직접 판단한 일

포트폴리오에 공개할 정보와 공개하지 않을 정보, 강점과 실제 경험 내용은 직접 선택했습니다.

AI 제안을 따르지 않은 일

AI가 제안한 내용 중 실제 경험과 맞지 않거나 불필요하게 개인적인 내용은 사용하지 않았습니다.

---

## Vercel 배포와 패스키 설정

기존 `index.html` 기반 공개 페이지는 그대로 Vercel에 배포되고, 인증 API만 Vercel Functions(`/api/*`)로 실행됩니다. 패스키, challenge, 비공개 자료는 로컬 파일이 아니라 외부 PostgreSQL에 저장됩니다.

### 로컬 확인

```bash
npm install
npx vercel dev
```

로컬 `.env`는 `.env.example`을 참고합니다. `DATABASE_URL`은 Neon PostgreSQL 연결 문자열이어야 하며, 로컬 SQLite나 Vercel 파일 시스템에 의존하지 않습니다.

Neon 콘솔의 SQL Editor에서 [db/schema.sql](db/schema.sql) 전체를 실행하면 필요한 테이블, 인덱스, owner 계정, 가상 private 샘플 3개가 생성됩니다. 패스키 credential과 challenge는 SQL 파일에 넣지 않고 등록/로그인 API가 런타임에 저장합니다.

### Vercel Environment Variables

Vercel Project Settings > Environment Variables에 다음 값을 Production과 필요한 Preview 환경에 등록합니다.

```env
DATABASE_URL=postgresql://...
SESSION_SECRET=[32자 이상 임의의 값]
RP_NAME=김가빈의 포트폴리오
RP_ID=your-production-domain.vercel.app
EXPECTED_ORIGIN=https://your-production-domain.vercel.app
ALLOWED_ORIGINS=https://your-production-domain.vercel.app
NODE_ENV=production
INITIAL_SETUP=true
TEST_MODE=false
```

실제 Production URL이 `https://example.vercel.app`이면 `RP_ID=example.vercel.app`, `EXPECTED_ORIGIN=https://example.vercel.app`으로 설정합니다. 커스텀 도메인을 사용하면 `RP_ID`는 해당 도메인, `EXPECTED_ORIGIN`은 정확한 HTTPS origin으로 바꿉니다. 요청의 `Origin`을 그대로 신뢰하지 않고 `ALLOWED_ORIGINS`에 명시된 값만 사용합니다.

Preview URL을 테스트하려면 해당 Preview origin을 `ALLOWED_ORIGINS`에 명시적으로 추가하고, 그 Preview hostname에 맞는 `RP_ID`를 별도 Preview 환경 변수로 설정합니다. 모든 `*.vercel.app`을 와일드카드로 허용하지 않습니다.

### 최초 패스키 등록

1. `DATABASE_URL`을 연결한 상태로 `INITIAL_SETUP=true`로 Production 배포합니다.
2. Production URL의 `나만의 공간`에서 첫 패스키를 등록합니다.
3. 등록 확인 후 `INITIAL_SETUP=false`로 변경하고 재배포합니다.
4. 이후 패스키 추가는 로그인된 세션에서만 가능합니다.

운영에서는 항상 `TEST_MODE=false`를 사용합니다. 실제 패스키 등록·로그인은 Windows Hello, Touch ID 또는 보안 키가 필요합니다. 배포 후에는 공개 첫 화면, 최초 등록, 로그아웃 후 `401`, 로그인 후 private 카드 표시, 두 번째 패스키 추가/삭제, 마지막 패스키 삭제 차단 순서로 확인합니다.

---

## 로컬 실행

이 프로젝트는 공개 포트폴리오를 Express가 제공하고, `나만의 공간`은 서버 세션과 WebAuthn 패스키로 보호합니다. 비공개 자료는 서버 전용 코드와 SQLite DB에서만 관리하며 HTML이나 브라우저 JavaScript에 미리 넣지 않습니다.

### 설치 및 환경 설정

```bash
npm install
copy .env.example .env
```

`.env`에서 `SESSION_SECRET`을 충분히 긴 임의 값으로 바꾸고, 로컬 개발에서는 다음 설정을 사용합니다.

```env
RP_ID=localhost
EXPECTED_ORIGIN=http://localhost:3000
INITIAL_SETUP=true
TEST_MODE=false
```

### 실행과 최초 등록

```bash
npm start
```

브라우저에서 `http://localhost:3000`을 열고 `나만의 공간`으로 이동합니다. 최초 설정 상태에서 패스키 이름을 입력한 뒤 `첫 패스키 등록`을 선택합니다. 등록이 끝나면 서버 세션이 생성되고 비공개 자료와 패스키 관리가 표시됩니다.

로그인 상태에서 `패스키 추가`로 두 번째 패스키를 등록할 수 있습니다. 마지막 하나는 삭제할 수 없습니다. `로그아웃` 후에는 세션이 폐기되고 비공개 자료가 화면에서 제거됩니다.

### TEST_MODE 두 계정 검증

개발 환경에서만 다음처럼 설정하면 `owner-test`와 `other-test` 계정이 초기 등록 대상으로 생깁니다.

```env
INITIAL_SETUP=true
TEST_MODE=true
```

운영 UI에는 계정 선택을 노출하지 않습니다. API 테스트에서 초기 등록/로그인 요청에 `x-test-user: owner-test` 또는 `x-test-user: other-test` 헤더를 붙여 각 계정의 패스키를 등록할 수 있습니다. 로그인 후 `GET /api/accounts/:userId/private`는 현재 세션 사용자와 경로의 사용자가 다르면 `403`을 반환합니다.

### 보안 동작 확인

```bash
curl -i http://localhost:3000/api/private
curl -i http://localhost:3000/api/auth/status
```

로그인하지 않은 private API는 `401`이어야 합니다. 등록/로그인 options를 연속으로 요청하면 각각 다른 challenge가 생성되며, 같은 verify 요청을 다시 보내면 challenge가 이미 사용된 것으로 거절됩니다. 실제 패스키 인증과 삭제된 패스키 재로그인은 브라우저의 Windows Hello, Touch ID 또는 Android 패스키로 직접 확인해야 합니다.

### 운영 배포

운영에서는 HTTPS origin과 도메인에 맞춰 다음을 설정합니다.

```env
NODE_ENV=production
RP_ID=example.com
EXPECTED_ORIGIN=https://example.com
INITIAL_SETUP=false
TEST_MODE=false
SESSION_SECRET=long-random-production-secret
```

`RP_ID`는 origin의 등록 가능한 도메인이고 `EXPECTED_ORIGIN`은 실제 페이지의 정확한 HTTPS origin이어야 합니다. `.env`, SQLite DB, 세션 DB 파일은 Git에 포함하지 않습니다. 상세 구현과 수동 검증 기록은 [AUTH_IMPLEMENTATION.md](AUTH_IMPLEMENTATION.md), 제출 양식은 [SUBMISSION.md](SUBMISSION.md)에 있습니다.
