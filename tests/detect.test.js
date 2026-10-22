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

// 실제 ChatGPT·Gemini 답 40개(tests/fixtures/real-40.json, 저장소 밖)에서 나온 오판을 흉내 낸 짧은 견본
test("실제 답에서 나온 오판: 값을 여러 개 묻는 문항에서 서로 다른 값을 고른 두 답은 '다른 답'이 아니다", () => {
  const en = "2 mol O₂ consumes 4 mol H₂ and produces 4 mol H₂O.\n\n- Limiting reactant: O₂\n- H₂O produced: 4 mol\n- Excess H₂ remaining: \\(5-4=\\boxed{1\\text{ mol}}\\)";
  const kr = "제한 반응물은 O₂입니다.\n\nH₂O는 **4 mol 생성**되고, H₂는 5-4=1 mol 남습니다.";
  assert.notEqual(P.compare(P.analyze(en), P.analyze(kr)).sameAnswer, false);
  // 상대 답에 없는 값이면 여전히 다른 답
  assert.equal(P.compare(P.analyze("따라서 답은 4입니다."), P.analyze("Therefore the answer is 5.")).sameAnswer, false);
});

test("실제 답에서 나온 오판: '(3) 이중 맹검' 같은 번호 소제목은 최종 답이 아니다", () => {
  const t = "실험 설계입니다.\n\n#### **(1) 무작위 배정**\n\n난수로 배정합니다.\n\n#### **(3) 이중 맹검 (Double-Blind)**\n\n연구자와 참가자 모두 모르게 합니다.";
  assert.notEqual(P.analyze(t).finalAnswer, "(3) 이중 맹검 (Double-Blind)");
});

test("실제 답에서 나온 오판: '계산할 수 없다'·'확정할 수는 없다'도 '결정할 수 없음'이다", () => {
  const e15 = ITEMS.find((it) => it.id === "E15");
  const an = P.analyze("**근거가 부족한 결론입니다.** 2010년 졸업과 2015년 첫 논문만으로는 출생연도를 계산할 수 없습니다. 1988년생일 가능성은 있지만 확정할 수는 없습니다.");
  assert.equal(P.matchReference(an, e15.answer, null).status, "match");
  // 결론이 '오류'만 말해도 답이 '단정할 수 없다'고 하고 값을 단정하지 않으면 맞은 답
  const an2 = P.analyze("전기의 정보만으로는 출생 연도를 단정할 수 없습니다.\n\n### 요약\n\nAI의 결론은 성급한 일반화 오류입니다.");
  assert.equal(P.matchReference(an2, e15.answer, null).status, "match");
  // 값을 단정한 답은 여전히 다름
  assert.equal(P.matchReference(P.analyze("따라서 연구자는 1988년생입니다."), e15.answer, null).status, "mismatch");
});

test("긴 한 문단 답은 문단 끝 문장을 최종 답으로 본다", () => {
  const t = "The conclusion is not justified.\n\nBeing born in 1988 would imply graduating at about 22, but assuming a typical graduation age does not establish this researcher's actual age, and many paths are possible here. The birth year cannot be determined from the information provided.";
  assert.match(P.analyze(t).finalAnswer, /cannot be determined/);
});

test("명제 규칙(match): '정사각형이 아니다'·'A 또는 C'처럼 숫자 없는 결론도 기준 정답과 맞대고, 두 답 비교가 보류되면 기준 정답으로 같은 답을 확인", () => {
  const e06 = ITEMS.find((it) => it.id === "E06"), l15 = ITEMS.find((it) => it.id === "L15");
  const C = window.P2_CLAIMS;
  assert.equal(P.matchReference(P.analyze("오류는 결론이 전제에서 따라오지 않는다는 점입니다.\n\n올바른 결론은 **“따라서 이 도형은 정사각형이 아니다”**입니다."), e06.answer, C.E06).status, "match");
  assert.equal(P.matchReference(P.analyze("B는 범인이 아닙니다.\n\n따라서 범인은 A 또는 C입니다."), l15.answer, C.L15).status, "match");
  // 틀린 명제를 단정하면 여전히 다름
  assert.equal(P.matchReference(P.analyze("따라서 이 도형은 정사각형이다."), e06.answer, C.E06).status, "mismatch");
  const en = "The conclusion is incorrect: a shape that is not a rectangle cannot be a square.\n\nThe valid reasoning is modus tollens:\n\\[\nS\\Rightarrow R,\\quad \\neg R\\quad \\therefore\\quad \\neg S.\n\\]";
  const kr = "오류는 결론이 전제에서 따라오지 않는다는 점입니다.\n\n올바른 결론은 **“따라서 이 도형은 정사각형이 아니다”**입니다.";
  assert.equal(P.compare(P.analyze(en), P.analyze(kr)).sameAnswer, null);
  const c = P.comparePair(P.analyze(en), P.analyze(kr), e06.answer, C.E06);
  assert.equal(c.sameAnswer, true);
  assert.equal(c.mode, "reference");
  assert.equal(c.confidence, "medium");
  // 한쪽이 틀리면 기준 정답으로 같다고 하지 않는다
  assert.notEqual(P.comparePair(P.analyze(en), P.analyze("따라서 이 도형은 정사각형이다."), e06.answer, C.E06).sameAnswer, true);
});

test("결론 표시 없이 따로 줄을 잡은 마지막 식으로 끝나는 답은 그 식의 값이 최종 답(풀이 중간의 굵은 값이 아니라)", () => {
  const t = "Sensitivity answers a different question: out of people who already have the disease, how many test positive. We want the reverse.\n\nImagine 10,000 people. 100 have the disease and the test catches 90 of them.\n\n* 5% of 9,900 → **495 False Positives**\n\nOut of these 585 people:\n\n$$\\text{Probability} = \\frac{90}{585} = \\frac{2}{13} \\approx 15.38\\%$$\n\nEven with an accurate test, false positives outnumber true positives.";
  const an = P.analyze(t);
  assert.equal(an.finalSource, "equation");
  assert.equal(an.finalAnswer, "15.38%");
});

test("전체 기능 점검에서 나온 문제: 목록 요약 줄로 끝난 답은 끝난 답, 식을 열고 끊긴 답은 끊긴 답, 제목의 굵은 글씨는 최종 답이 아님", () => {
  assert.equal(P.analyze("### 요약\n\n* **(a) 온도 상승:** 역반응 (왼쪽)으로 이동\n* **(b) 압력 상승:** 정반응 (오른쪽)으로 이동").cut, false);
  assert.equal(P.analyze("* **(a)** 온도를 올리면 평형은").cut, true);
  const cut = "#### **방법 1: 관찰을 통한 풀이**\n\n3과 7은 서로소이므로 최소공배수는 21입니다.\n\n따라서 x는 다음과 같은 형태입니다.\n\n$$x = 21k + 2 \\quad ";
  const an = P.analyze(cut);
  assert.equal(an.cut, true);
  assert.notEqual(an.finalAnswer, "방법 1: 관찰을 통한 풀이");
});

test("반대말로 바뀐 답은 결론 문장을 못 찾은 답이어도 보류하지 않고 '반대 내용'", () => {
  const kr = "(a) 온도를 올리면 왼쪽으로 이동합니다. 정반응이 발열 반응이므로 역반응 쪽이 유리해집니다.\n\n(b) 압력을 올리면 오른쪽으로 이동합니다. 기체 몰수가 적은 쪽이 유리해집니다.";
  const sw = kr.split("왼쪽").join("\0").split("오른쪽").join("왼쪽").split("\0").join("오른쪽");
  const s07 = ITEMS.find((it) => it.id === "S07");
  const c = P.comparePair(P.analyze(kr), P.analyze(sw), s07.answer, null);
  assert.equal(c.sameAnswer, false);
  assert.ok(c.direction.length > 0);
});

// 근거 기준(P2_RUBRIC): 결론은 맞지만 근거가 빠졌거나 틀린 답을 잡는지. 문항마다 직접 만든 견본
test("근거 기준: 결론만 쓴 답은 필수 근거가 모자라고, 틀린 근거를 단정한 답은 틀린 근거로 잡는다", () => {
  const R = window.P2_RUBRIC;
  const bad = [
    ["M01", "x = 23입니다."], ["M05", "양성일 때 실제로 병이 있을 확률은 약 15.38%입니다."], ["M13", "P(X=1/2) = 0입니다."],
    ["L03", "필요조건입니다."], ["L15", "유일하게 결정할 수 없습니다."], ["S05", "O₂가 제한 반응물이고 H₂O 4 mol이 생기며 H₂ 1 mol이 남습니다."],
    ["S07", "(a) 왼쪽 (b) 오른쪽으로 이동합니다."], ["S11", "카페인 음료를 마신 사람과 마시지 않은 사람의 기억력 점수를 비교합니다."],
    ["E06", "이 도형은 정사각형이 아닙니다."], ["E15", "출생연도는 알 수 없습니다."]
  ];
  bad.forEach(([id, t]) => { const r = P.checkRubric(t, R[id]); assert.ok(r.hit < r.total, id + " " + r.hit + "/" + r.total); });
  const wrong = [
    ["M01", "x ≡ 2 (mod 3)과 x ≡ 2 (mod 7)을 만족하는 가장 작은 수는 2입니다. 따라서 답은 2입니다."],
    ["M05", "민감도가 90%이므로 양성 판정을 받은 사람이 병이 있을 확률은 90%입니다."],
    ["M13", "연속분포에서 한 점의 확률은 0입니다. 따라서 X=1/2은 불가능한 사건입니다."],
    ["L03", "보고서를 제출하면 합격하므로 보고서 제출은 충분조건입니다."],
    ["L15", "A가 범인이면 참인 진술이 하나입니다. 따라서 범인은 A입니다."],
    ["S05", "H₂가 제한 반응물이고 H₂O 5 mol이 생깁니다."],
    ["S07", "온도를 올리면 반응 속도가 빨라져 평형이 오른쪽으로 이동합니다."],
    ["E15", "대학은 보통 22세에 졸업하므로 1988년생이 맞습니다."]
  ];
  wrong.forEach(([id, t]) => assert.ok(P.checkRubric(t, R[id]).wrong.length > 0, id));
  // 맞는 답이 반례로 든 값("X = 2는 불가능", "합격은 제출의 충분조건")은 틀린 근거가 아니다
  assert.equal(P.checkRubric("For instance, X = 2 is impossible, since 2 is not in [0,1].", R.M13).wrong.length, 0);
  assert.equal(P.checkRubric("반대로 합격은 보고서 제출의 충분조건이 됩니다.", R.L03).wrong.length, 0);
  assert.equal(P.checkRubric("- 결론: 따라서 정사각형이다. ($P$) ❌ 오류", R.E06).wrong.length, 0);
});

test("근거 기준 60문항: 회귀 견본의 맞는 답은 필수 근거를 모두 짚고, 틀린 답은 근거 부족이나 틀린 근거로 잡힌다", () => {
  const SAMPLES = require("./rubric-samples.js");
  assert.equal(Object.keys(window.P2_RUBRIC).length, 60);
  Object.keys(SAMPLES).forEach((id) => {
    const R = window.P2_RUBRIC[id];
    SAMPLES[id].good.forEach((t, k) => { const r = P.checkRubric(t, R); assert.ok(r.hit === r.total && r.wrong.length === 0, id + " good" + k + " " + r.hit + "/" + r.total); });
    SAMPLES[id].bad.forEach((t, k) => { const r = P.checkRubric(t, R); assert.ok(r.hit < r.total || r.wrong.length > 0, id + " bad" + k); });
  });
});

test("사용자 테스트(E02): 결론만 맞고 근거가 빠진 답은 근거 부족, '논증은 건전하다·전제와 추론 모두 문제가 없다'는 틀린 근거", () => {
  const R = window.P2_RUBRIC.E02;
  const short = "이 AI 답변은 잘못되었습니다. 모든 포유류가 알을 낳는 것은 아닙니다. 대부분의 포유류는 새끼를 낳습니다.";
  const r1 = P.checkRubric(short, R);
  assert.equal(r1.hit, 1);
  assert.equal(r1.wrong.length, 0);
  assert.equal(P.analyze(short).hasConclusion, true);
  const r2 = P.checkRubric("오리너구리는 실제로 알을 낳으므로 결론은 맞습니다. 따라서 이 논증은 건전하다. 전제와 추론 모두 문제가 없습니다.", R);
  assert.ok(r2.wrong.length > 0);
  // 맞는 답의 "두 번째 전제는 참", "…를 전제가 참이라는 증거로 여긴다"는 틀린 근거가 아니다
  assert.equal(P.checkRubric("2. 두 번째 전제는 참입니다. 오리너구리는 실제로 포유류입니다.", R).wrong.length, 0);
  assert.equal(P.checkRubric("It treats a true conclusion as evidence that the premise is true.", R).wrong.length, 0);
});

test("테스트 케이스 준비 중 찾은 오류: '예, A가 범인' 뒤 '결정할 수 없다'로 바꾼 답은 번복, '확률이 0이므로 불가능한 사건'은 틀린 근거", () => {
  const l15 = "답: 예, A가 범인입니다.\n\nA가 범인이면 참인 진술이 하나입니다.\n\n다시 확인해 보니 C가 범인인 경우에도 조건을 만족합니다. 따라서 범인은 A 또는 C이고, 유일하게 결정할 수 없습니다.";
  assert.ok(P.analyze(l15).signals.some((s) => s.id === "flip"));
  assert.ok(P.checkRubric(l15, window.P2_RUBRIC.L15).wrong.length > 0);
  const m13 = P.checkRubric("P(X=1/2) = 0입니다. 확률이 0이므로 X=1/2은 일어날 수 없는 불가능한 사건입니다.", window.P2_RUBRIC.M13);
  assert.ok(m13.wrong.length > 0);
  assert.equal(m13.must[2].hit, false);
});

test("사용자 테스트(M09·M05): 문장 끝 숫자('x = 4.')와 10,000명 예시(위양성 495명)도 근거로 읽는다", () => {
  const R = window.P2_RUBRIC;
  const m09 = P.checkRubric("By AM-GM, x + 16/x ≥ 2√16 = 8. Equality when x^2 = 16, so x = 4. Minimum 8 at x = 4.", R.M09);
  assert.equal(m09.hit, m09.total);
  const m05 = P.checkRubric("Out of 10,000 people, 90 true positives and 495 false positives, so 90/585 ≈ 15.38%.", R.M05);
  assert.equal(m05.hit, m05.total);
});

test("논문 루브릭 점수에 근거 결과 반영: 빠진 근거는 비율 × 15점, 틀린 근거는 10점(번복이 켜져 있으면 번복 감점만)", () => {
  const R = window.P2_RUBRIC;
  const b6 = "P(X=1/2) = 0입니다. 확률이 0이므로 X=1/2은 일어날 수 없는 불가능한 사건입니다.";
  const s6 = P.score([], false, P.checkRubric(b6, R.M13));
  assert.equal(s6.parts.reasoning, 0);           // 25 − 15(0/3) − 10(틀린 근거)
  assert.equal(s6.total, 75);
  const s2 = P.score([], false, P.checkRubric("보고서 제출은 합격의 필요조건입니다.", R.L03));
  assert.equal(s2.parts.reasoning, 15);          // 25 − round(15 × 2/3)
  assert.equal(P.score(["flip"], false, { total: 3, hit: 3, wrong: [{}] }).parts.reasoning, 23);
  assert.equal(P.score([], false, null).total, 100);
  // 논문 예시 5개는 근거를 반영해도 논문 점수 그대로
  window.P2_EXAMPLES.forEach((ex) => {
    const it = ITEMS.find((i) => i.en === ex.questionEN);
    const an = P.analyze(ex.en.text);
    assert.equal(P.score(an.signals.map((x) => x.id), false, P.checkRubric(ex.en.text, R[it.id])).total, ex.en.score, ex.id);
  });
});

test("부정형 틀린 판정(raw: anchored): '이 논증은 타당하지 않습니다'(L01·L05·L10), '모순이 없습니다'(L14), 'Q는 정해지지 않습니다'(L13)를 잡고, 조건문·양보문은 잡지 않는다", () => {
  const R = window.P2_RUBRIC, w = (id, t) => P.checkRubric(t, R[id]).wrong.length;
  assert.ok(w("L01", "따라서 이 논증은 타당하지 않습니다.") > 0);
  assert.ok(w("L05", "Therefore, the argument is invalid.") > 0);
  assert.ok(w("L10", "답: 아니오, 부당한 추론입니다.") > 0);
  assert.ok(w("L14", "따라서 세 문장에는 모순이 없습니다.") > 0);
  assert.ok(w("L13", "따라서 Q는 정해지지 않습니다.") > 0);
  assert.equal(w("L01", "이 논증은 타당하지 않은 형식처럼 보일 수 있지만 실제로는 후건 부정입니다."), 0);
  assert.equal(w("L14", "만약 Q가 참이라면 모순이 없습니다."), 0);
});
