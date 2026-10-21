// 실제 ChatGPT·Gemini 답 40개(10문항 × 한·영 × 2개 AI, 모두 맞은 답)로 규칙을 확인한다
const test = require("node:test");
const assert = require("node:assert/strict");
const P = require("../app/detect.js");
global.window = {};
require("../app/data.js");

// 답은 저장소에 넣지 않는다. 로컬에 tests/fixtures/real-40.json을 두거나 P2REAL_FIXTURE로 경로를 주면 돌고, 없으면 건너뛴다
const fs = require("node:fs");
const path = require("node:path");
const FIXTURE = process.env.P2REAL_FIXTURE || path.join(__dirname, "fixtures", "real-40.json");
const DATA = fs.existsSync(FIXTURE) ? JSON.parse(fs.readFileSync(FIXTURE, "utf8")) : null;
const skip = DATA ? false : "실제 답 40개 파일이 없어 건너뜀(tests/fixtures/real-40.json)";
const ITEMS = window.P2_ITEMS;
const DECOYS = ITEMS.map((it) => [it.kr, it.en]);
const itemOf = (id) => ITEMS.find((it) => it.id === id);
const answers = () => DATA.answers;
const byId = () => Object.fromEntries(answers().map((a) => [a.id, a]));

test("실제 답 40개: 흔들림 신호 오탐 없음, 모두 자기 질문과 관련 있음", { skip }, () => {
  assert.equal(answers().length, 40);
  answers().forEach((a) => {
    const an = P.analyze(a.text);
    assert.deepEqual(an.signals.map((s) => s.id), [], a.id);
    assert.equal(P.relevance([itemOf(a.item).kr, itemOf(a.item).en], a.text, DECOYS).status, "related", a.id);
  });
});

test("실제 답 40개: 기준 정답과 '다르다'는 0개, 맞음 38개 이상", { skip }, () => {
  const st = answers().map((a) => P.matchReference(P.analyze(a.text), itemOf(a.item).answer, window.P2_CLAIMS[a.item]).status);
  assert.equal(st.filter((s) => s === "mismatch").length, 0);
  assert.ok(st.filter((s) => s === "match").length >= 38, "match " + st.filter((s) => s === "match").length);
});

test("실제 답 짝 40쌍(한·영, ChatGPT·Gemini): '다른 답'은 0쌍, 같은 답 39쌍 이상", { skip }, () => {
  const A = byId();
  let same = 0;
  [...new Set(answers().map((a) => a.item))].forEach((i) => {
    [["chatgpt_en", "chatgpt_kr"], ["gemini_en", "gemini_kr"], ["chatgpt_kr", "gemini_kr"], ["chatgpt_en", "gemini_en"]].forEach(([x, y]) => {
      const c = P.comparePair(P.analyze(A[i + "_" + x].text), P.analyze(A[i + "_" + y].text), itemOf(i).answer, window.P2_CLAIMS[i]);
      assert.notEqual(c.sameAnswer, false, i + " " + x + " " + y);
      if (c.sameAnswer === true) same++;
    });
  });
  assert.ok(same >= 39, "same " + same);
});

test("반박 답 4개(틀린 값을 우긴 뒤 AI가 다시 쓴 답, 모두 원래 답을 지킴): 흔들림 신호 없음, 기준 정답과 같음, 원래 답과 같은 답", { skip: DATA && DATA.pushback ? false : "반박 답이 없어 건너뜀" }, () => {
  const A = byId();
  DATA.pushback.forEach((x) => {
    const an = P.analyze(x.text), it = itemOf(x.item), claim = window.P2_CLAIMS[x.item];
    assert.deepEqual(an.signals.map((s) => s.id), [], x.id);
    assert.equal(P.matchReference(an, it.answer, claim).status, "match", x.id);
    const orig = A[x.item + "_" + x.ai + "_" + x.lang];
    assert.equal(P.comparePair(P.analyze(orig.text), an, it.answer, claim).sameAnswer, true, x.id);
  });
});
