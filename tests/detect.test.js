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

test("고른 문항과 상관없는 글은 관련 없음", () => {
  const m01 = ITEMS.find((it) => it.id === "M01");
  assert.equal(P.relevance([m01.kr, m01.en], "오늘 점심은 김치찌개를 먹었는데 정말 맛있었고 날씨도 좋았습니다.", DECOYS).status, "unrelated");
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

test("문항 속 AI의 틀린 답 30개: 답으로 읽고, 그 문항과 관련 있다고 보며, 문항의 기준 정답과 다르다고 모두 잡는다", () => {
  const WRONG = require("./wrong-answers.js");
  WRONG.forEach((w) => {
    const it = ITEMS.find((x) => x.id === w.id);
    const label = w.id + " " + w.lang;
    assert.equal(P.checkInput(w.wrong).ok, true, label + " 입력");
    assert.equal(P.relevance([it.kr, it.en], w.wrong, DECOYS).status, "related", label + " 관련성");
    // 앱과 같이 문항의 기준 정답(data.js)으로, 그리고 문항 속 원래 질문의 정답으로도 맞댄다
    assert.equal(P.matchReference(P.analyze(w.wrong), it.answer, window.P2_CLAIMS[w.id]).status, "mismatch", label + " 문항 기준 정답");
    assert.equal(P.matchReference(P.analyze(w.wrong), w.reference, window.P2_CLAIMS[w.id]).status, "mismatch", label + " 원래 질문 정답");
  });
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

test("정답 값 대조: 최종 문장에 값이 없어도 답 전체에서 찾고, 반올림·분수 표기는 같은 값", () => {
  const e12 = ITEMS.find((it) => it.id === "E12");
  const st = (t) => P.matchReference(P.analyze(t), e12.answer, null).status;
  assert.equal(st("민감도가 99%이므로 실제 질병일 확률도 99%입니다. 따라서 이 AI의 답은 맞습니다."), "mismatch");
  assert.equal(st("양성일 때 실제 질병일 확률은 약 16.7%입니다."), "match");
  assert.equal(st("계산하면 1/6 정도입니다. 따라서 AI 답은 틀렸습니다."), "match");
  assert.notEqual(st("베이즈 정리로 계산하면 실제 질병일 확률은 약 17%입니다. 따라서 AI의 99%는 틀렸습니다."), "mismatch");
});

test("복사하다 만 답: 풀이 중간을 최종 답으로 읽어 '다른 답'이나 '기준 정답과 다름'으로 단정하지 않는다", () => {
  const m01 = ITEMS.find((it) => it.id === "M01");
  const en = P.analyze(window.P2_EXAMPLES.find((e) => e.id === "M01").en.text);
  const full = "조건을 정리하면 x ≡ 2 (mod 3), x ≡ 3 (mod 5), x ≡ 2 (mod 7)입니다.\n\n첫째와 셋째 조건에서 3과 7이 서로소이므로 x ≡ 2 (mod 21)이고, x = 21k + 2 꼴입니다.\n\nk = 0이면 x = 2인데, 2를 5로 나눈 나머지는 2라서 둘째 조건을 만족하지 않습니다.\n\nk = 1이면 x = 23이고, 23을 5로 나눈 나머지는 3이므로 세 조건을 모두 만족합니다.\n\n따라서 가장 작은 양의 정수 x는 **23**입니다.";
  assert.equal(P.compare(en, P.analyze(full)).sameAnswer, true);
  // 두 번째 문단 이후 어디서 끊어도 '다른 답'이 되지 않는다
  for (let n = full.indexOf("첫째") + 10; n < full.length; n += 7) {
    const cut = P.analyze(full.slice(0, n));
    assert.notEqual(P.compare(en, cut).sameAnswer, false, "끊은 위치 " + n);
    assert.notEqual(P.matchReference(cut, m01.answer, null).status, "mismatch", "끊은 위치 " + n);
  }
  const mid = P.analyze(full.slice(0, 140));
  assert.equal(mid.cut, true);
  assert.equal(P.compare(en, mid).mode, "cut");
  // 끝난 답은 끊긴 것으로 보지 않는다
  ["따라서 가장 작은 양의 정수는 23", "The answer is 23", "x = 23", "중국인의 나머지 정리를 쓰면 x = 23입니다"].forEach((t) => assert.equal(P.analyze(t).cut, false, t));
});

test("반대말로 바뀐 풀이: 같은 언어로 복사해 고친 답은 바뀐 자리를 찾고, 언어가 다르면 뚜렷이 반대로 기울 때만 잡는다", () => {
  const kr = "온도를 높이면 평형은 흡열 방향으로 이동하므로 생성물이 증가한다.\n압력을 높이면 기체 분자 수가 적은 쪽으로 이동해 수득률이 증가한다.\n따라서 두 조건 모두 생성물이 증가한다.";
  const swapped = kr.split("증가").join("감소");
  const c = P.compare(P.analyze(kr), P.analyze(swapped));
  assert.equal(c.sameAnswer, false);
  assert.ok(c.direction.length && /증가.*감소|감소.*증가/.test(c.direction[0]));
  // 똑같은 답끼리는 그대로 같은 답
  assert.notEqual(P.compare(P.analyze(kr), P.analyze(kr)).sameAnswer, false);
  // 언어가 다른 두 답: 한쪽은 '증가'로, 다른 쪽은 'decrease'로 뚜렷이 기울면 반대
  const en = "Raising the temperature shifts the equilibrium toward the endothermic side, so the product decreases.\nRaising the pressure also decreases the yield.\nTherefore the product decreases in both cases.";
  const c2 = P.compare(P.analyze(kr), P.analyze(en));
  assert.equal(c2.sameAnswer, false);
  assert.ok(/증가·감소/.test(c2.direction[0]));
});

test("여러 AI 말투의 결론 찾기(형식 견본): 이모지 제목·한 줄 요약·정답 문장·∴·boxed를 찾고 맺음 인사는 건너뛴다", () => {
  const STYLES = require("./answer-styles.js");
  STYLES.forEach((s) => {
    const a = P.analyze(s.text);
    if (s.expect) {
      assert.ok(a.finalAnswer.indexOf(s.expect) >= 0, s.style + " → " + a.finalAnswer);
      if (s.avoid) assert.ok(a.finalAnswer.indexOf(s.avoid) < 0, s.style + " → " + a.finalAnswer);
      // 맞는 답이므로 기준 정답과 '다르다'고 해서는 안 된다
      const it = ITEMS.find((x) => x.id === s.item);
      assert.notEqual(P.matchReference(a, it.answer, window.P2_CLAIMS[s.item]).status, "mismatch", s.style);
    } else {
      assert.equal(a.finalReliable, false, s.style + " (결론이 없는 답)");
    }
  });
  // 답의 성질만 말하는 문장("the answer is determinate")은 답을 밝힌 문장이 아니므로 굵게 쓴 답을 이기지 못한다
  assert.equal(P.analyze("17 × 24 = **408**\n\nThe problem gives enough information, and the answer is determinate.").finalAnswer, "408");
});

test("판정의 근거 표시: 값·식으로 갈리면 강함, 개념·방향 낱말 수면 보통, 판정하지 않으면 '판정 안 함'", () => {
  const ex = window.P2_EXAMPLES.find((e) => e.id === "M01");
  assert.equal(P.compare(P.analyze(ex.en.text), P.analyze(ex.kr.text)).confidence, "high");
  assert.equal(P.compare(P.analyze("따라서 답은 4입니다."), P.analyze("Therefore the answer is 5.")).confidence, "high");
  const kr = "온도를 높이면 생성물이 증가한다.\n압력을 높여도 수득률이 증가한다.\n따라서 생성물이 증가한다.";
  const en = "Raising the temperature decreases the product.\nRaising the pressure also decreases the yield.\nTherefore the product decreases.";
  assert.equal(P.compare(P.analyze(kr), P.analyze(en)).confidence, "medium");
  const m01 = ITEMS.find((it) => it.id === "M01");
  assert.equal(P.matchReference(P.analyze("따라서 답은 38입니다. 조건을 확인했습니다."), m01.answer, null).confidence, "high");
  assert.equal(P.matchReference(P.analyze("k = 0이면 x = 2인데,\n\n2를 5로 나눈 나머지는"), m01.answer, null).confidence, "low");
});
