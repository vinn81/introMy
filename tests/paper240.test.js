// 논문 본실험 답 240개(재현 패키지의 claude_raw_responses.csv + scoring_r2_qc.csv)로 규칙 전체를 확인한다
const test = require("node:test");
const assert = require("node:assert/strict");
const P = require("../app/detect.js");
global.window = {};
require("../app/data.js");

const ITEMS = window.P2_ITEMS;
const DECOYS = ITEMS.map((it) => [it.kr, it.en]);
// 답 240개는 저장소에 넣지 않는다. 로컬에 tests/fixtures/p2bench-240.json을 두거나
// P2BENCH_FIXTURE 환경 변수로 경로를 주면 돌고, 없으면 이 파일의 테스트는 건너뛴다
const fs = require("node:fs");
const path = require("node:path");
const FIXTURE = process.env.P2BENCH_FIXTURE || path.join(__dirname, "fixtures", "p2bench-240.json");
const ANSWERS = fs.existsSync(FIXTURE) ? JSON.parse(fs.readFileSync(FIXTURE, "utf8")) : null;
const skip = ANSWERS ? false : "논문 답 240개 파일이 없어 건너뜀(tests/fixtures/p2bench-240.json)";
const itemOf = (qid) => ITEMS.find((it) => it.id === qid);

test("240개 모두 입력 거름망을 통과하고 결론이 있는 답으로 읽힌다", { skip }, () => {
  assert.equal(ANSWERS.length, 240);
  ANSWERS.forEach((a) => {
    assert.equal(P.checkInput(a.text).ok, true, a.run);
    assert.equal(P.analyze(a.text).hasConclusion, true, a.run);
  });
});

test("감점 4건은 논문 점수와 같게, 만점 236건은 오탐 없이 100점", { skip }, () => {
  const fp = [];
  ANSWERS.forEach((a) => {
    const an = P.analyze(a.text);
    const s = P.score(an.signals.map((x) => x.id), false).total;
    if (a.score < 100) assert.equal(s, a.score, a.run);
    else if (an.signals.length) fp.push(a.run);
  });
  assert.deepEqual(fp, []);
});

test("자기 질문과 짝지으면 237개 이상 관련 있음", { skip }, () => {
  const related = ANSWERS.filter((a) => {
    const it = itemOf(a.qid);
    return P.relevance([it.kr, it.en], a.text, DECOYS).status === "related";
  }).length;
  assert.ok(related >= 237, "related " + related);
});

test("다른 59문항 질문과 짝지으면 0.5% 이하만 관련 있음으로 통과", { skip }, () => {
  let passed = 0;
  ANSWERS.forEach((a) => {
    ITEMS.forEach((o) => {
      if (o.id !== a.qid && P.relevance([o.kr, o.en], a.text, DECOYS).status === "related") passed++;
    });
  });
  assert.ok(passed / (240 * 59) <= 0.005, "passed " + passed);
});

test("앱 기준(기준 정답 일치로 관련성을 올리는 것 포함)으로도 다른 문항 질문과의 잘못된 통과가 0.5% 이하", { skip }, () => {
  let passed = 0;
  ANSWERS.forEach((a) => {
    const an = P.analyze(a.text);
    ITEMS.forEach((o) => {
      if (o.id === a.qid) return;
      const r = P.relevance([o.kr, o.en], a.text, DECOYS);
      const ref = P.matchReference(an, o.answer);
      // app.js run()과 같은 규칙: 'other'가 아니면 기준 정답과의 강한 일치로 관련 있음이 된다
      if (r.status === "related" || (r.reason !== "other" && ref.status === "match" && ref.strong)) passed++;
    });
  });
  assert.ok(passed / (240 * 59) <= 0.005, "passed " + passed);
});

test("최종 답이 모두 맞은 240개 중 기준 정답과 '다르다'고 잘못 대조되는 답은 없다", { skip }, () => {
  const wrong = ANSWERS.filter((a) => P.matchReference(P.analyze(a.text), itemOf(a.qid).answer).status === "mismatch").map((a) => a.run);
  assert.deepEqual(wrong, []);
});

test("한·영 짝 120개는 '다른 답'이나 '판정 보류' 없이 115쌍 이상 같은 답", { skip }, () => {
  const groups = {};
  ANSWERS.forEach((a) => { (groups[a.model + a.qid] = groups[a.model + a.qid] || {})[a.lang] = a; });
  const pairs = Object.values(groups);
  assert.equal(pairs.length, 120);
  let same = 0;
  pairs.forEach((g) => {
    const c = P.compare(P.analyze(g.EN.text), P.analyze(g.KR.text));
    assert.ok(c.sameAnswer === true || c.sameAnswer === "partial", g.EN.qid + " " + g.EN.model + " " + c.sameAnswer);
    if (c.sameAnswer === true) same++;
  });
  assert.ok(same >= 115, "same " + same);
});
