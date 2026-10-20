// 답 흔들림 점검기(app/detect.js) 회귀 테스트 — `npm test`로 실행한다
const test = require("node:test");
const assert = require("node:assert/strict");
const P = require("../app/detect.js");
global.window = {};
require("../app/data.js");

const ITEMS = window.P2_ITEMS;
const EXAMPLES = window.P2_EXAMPLES;
const DECOYS = ITEMS.map((it) => [it.kr, it.en]);
const itemOf = (ex) => ITEMS.find((it) => it.en === ex.questionEN);
const scoreOf = (text) => P.score(P.analyze(text).signals.map((s) => s.id), false).total;
const finalOf = (text) => P.analyze(text).finalAnswer;

test("논문 예시 10개의 점수가 논문 채점과 같다", () => {
  EXAMPLES.forEach((ex) => {
    assert.equal(scoreOf(ex.en.text), ex.en.score, ex.id + " en");
    assert.equal(scoreOf(ex.kr.text), ex.kr.score, ex.id + " kr");
  });
});

test("논문 예시는 자기 질문과 관련 있고, 다른 예시의 질문과는 관련 없다", () => {
  EXAMPLES.forEach((ex) => {
    const it = itemOf(ex);
    ["en", "kr"].forEach((l) => {
      assert.equal(P.relevance([it.kr, it.en], ex[l].text, DECOYS).status, "related", ex.id + " " + l);
      EXAMPLES.filter((o) => o !== ex).forEach((o) => {
        const oi = itemOf(o);
        assert.notEqual(P.relevance([oi.kr, oi.en], ex[l].text, DECOYS).status, "related", ex.id + " " + l + " ↔ " + o.id);
      });
    });
  });
});

test("논문 예시의 한·영 짝은 같은 답으로 비교된다", () => {
  EXAMPLES.forEach((ex) => {
    const c = P.compare(P.analyze(ex.en.text), P.analyze(ex.kr.text));
    assert.equal(c.sameAnswer, true, ex.id);
  });
});

test("논문 예시는 모두 기준 정답과 같다고 대조된다", () => {
  EXAMPLES.forEach((ex) => {
    ["en", "kr"].forEach((l) => assert.equal(P.matchReference(P.analyze(ex[l].text), ex.answer).status, "match", ex.id + " " + l));
  });
});

test("기준 정답과 다른 최종 답은 mismatch, 맞는 짧은 답은 strong match", () => {
  const m01 = ITEMS.find((it) => it.id.indexOf("M01") >= 0) || ITEMS[0];
  assert.equal(P.matchReference(P.analyze("조건을 차례로 확인하면 38이 세 조건을 모두 만족합니다. 따라서 답은 38입니다."), m01.answer).status, "mismatch");
  const ok = P.matchReference(P.analyze("중국인의 나머지 정리를 쓰면 x = 23입니다."), m01.answer);
  assert.equal(ok.status, "match");
  assert.equal(ok.strong, true);
});

test("직접 쓴 짧은 질문과 맞는 답은 관련 있음으로 본다", () => {
  const cases = [
    ["2+2는 얼마인가?", "2+2를 계산하면 4입니다. 따라서 답은 4입니다."],
    ["방정식 3x + 5 = 20을 풀어라.", "3x = 15이므로 x = 5입니다."],
    ["15 × 12는 얼마인가?", "15 × 12 = 180입니다."],
    ["What is the capital of France?", "The capital of France is Paris."],
    ["이 논증은 타당한가? 모든 사람은 죽는다. 소크라테스는 사람이다. 따라서 소크라테스는 죽는다.", "네, 타당합니다. 전제가 참이면 결론도 반드시 참입니다."]
  ];
  cases.forEach(([q, a]) => assert.equal(P.relevance(q, a, DECOYS).status, "related", q));
});

test("질문과 상관없는 글은 여전히 관련 없음", () => {
  assert.equal(P.relevance("2+2는 얼마인가?", "오늘 점심은 김치찌개를 먹었는데 정말 맛있었고 날씨도 좋았습니다.", DECOYS).status, "unrelated");
});

test("짧은 단답도 결론이 있는 답으로 본다", () => {
  assert.equal(P.analyze("프랑스의 수도는 파리입니다.").hasConclusion, true);
  assert.equal(P.analyze("The capital of France is Paris.").hasConclusion, true);
});

test("한 문단 답에서는 결론 문장만 최종 답으로 뽑는다", () => {
  assert.equal(finalOf("따라서 답은 12입니다. 계산 과정에서 3과 4를 곱했습니다."), "따라서 답은 12입니다.");
  const c = P.compare(P.analyze("따라서 답은 12입니다. 계산 과정에서 3과 4를 곱했습니다."), P.analyze("Therefore the answer is 7. We multiplied 3 and 4 and added."));
  assert.equal(c.sameAnswer, false);
});

test("같은 값의 다른 표기는 같은 답", () => {
  const same = (x, y) => P.compare(P.analyze(x), P.analyze(y)).sameAnswer;
  assert.equal(same("답: 0.5", "Answer: 1/2"), true);
  assert.equal(same("답: 50%", "Answer: 0.5"), true);
  assert.equal(same("답: 1,000", "Answer: 1000"), true);
  assert.equal(same("답: x = 2", "Answer: x = -2"), false);
  assert.equal(same("따라서 답은 4입니다.", "Therefore the answer is 5."), false);
});

test("흔들림 신호 오탐 사례", () => {
  const ids = (t) => P.analyze(t).signals.map((s) => s.id);
  assert.deepEqual(ids("Yes. Let me verify step by step. Case 1 holds. Case 2 holds. Final: **No contradiction found**"), []);
  assert.deepEqual(ids("The answer is 7. Both methods are correct; the incorrect approach would be to add instead."), []);
  assert.deepEqual(ids("We cannot determine the exact value without more data. Probably the most important factor is step 2 of the process."), []);
});

test("문항 속 AI의 틀린 답 30개: 답으로 읽고, 질문과 관련 있다고 보며, 모두 기준 정답과 다르다고 잡는다", () => {
  const WRONG = require("./wrong-answers.js");
  const count = { match: 0, mismatch: 0, unknown: 0 };
  WRONG.forEach((w) => {
    assert.equal(P.checkInput(w.wrong).ok, true, w.id + " " + w.lang + " 입력");
    assert.equal(P.relevance(w.question, w.wrong, DECOYS).status, "related", w.id + " " + w.lang + " 관련성");
    count[P.matchReference(P.analyze(w.wrong), w.reference, window.P2_CLAIMS[w.id]).status]++;
  });
  assert.equal(count.match, 0, "틀린 답을 기준 정답과 같다고 본 경우");
  assert.equal(count.mismatch, WRONG.length, "잡은 틀린 답 " + count.mismatch);
});

test("약한 추정(probably) 뒤에 바로 불확실하다고 밝히면 과잉추론 신호가 아니다", () => {
  const ids = (t) => P.analyze(t).signals.map((s) => s.id);
  assert.deepEqual(ids("The birth year cannot be determined. The researcher was probably an adult by 2010, so born before the early 1990s. Even that is a likelihood, not a certainty."), []);
  assert.deepEqual(ids("The birth year cannot be determined. The researcher was almost certainly born well before 2010, probably in the 1960s to 1990."), ["overinfer"]);
});

test("명제 규칙: 부정·오류 표시가 있는 문장이나 인용은 단정으로 보지 않는다", () => {
  const C = window.P2_CLAIMS;
  const st = (t, id) => P.matchReference(P.analyze(t), "ref", C[id]).status;
  assert.equal(st("따라서 정사각형이다.", "E06"), "mismatch");
  assert.notEqual(st("따라서 이 도형은 정사각형이 아니다.", "E06"), "mismatch");
  assert.notEqual(st("원래 결론 “따라서 정사각형이다”는 틀렸고, 올바른 결론은 정사각형이 아니라는 것이다.", "E06"), "mismatch");
  assert.notEqual(st("P(X = 1/2) = 0이며, 이것이 X = 1/2가 불가능한 사건이라는 뜻은 아닙니다.", "M13"), "mismatch");
  assert.equal(st("P(X = 1/2) = 0이므로 X = 1/2는 불가능한 사건이다.", "M13"), "mismatch");
});
