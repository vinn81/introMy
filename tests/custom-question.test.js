// 직접 입력한 질문(60문항 밖) — 질문과 답의 언어가 달라도 한·영 용어 사전(app/detect/glossary.js)으로 관련성을 판정한다
const test = require("node:test");
const assert = require("node:assert/strict");
const P = require("../app/detect.js");
global.window = {};
require("../app/data.js");

const DECOYS = window.P2_ITEMS.map((it) => [it.kr, it.en]);

// 한국어로 묻고 영어로 받은 답(직접 만든 견본 12개, 2026-10-28). 수학·과학·컴퓨터·경제·역사 분야
const CASES = [
  ["광합성에서 빛의 세기가 산소 발생량에 어떤 영향을 주는지 설명하시오.", "Photosynthesis uses light energy to split water and release oxygen. As light intensity increases, oxygen output rises until CO2 or temperature becomes limiting, so the rate levels off."],
  ["수요가 증가하면 시장 가격은 어떻게 변하는가?", "When demand increases while supply stays the same, the market price rises. Therefore an increase in demand raises the equilibrium price and quantity."],
  ["퀵 정렬의 평균 시간복잡도는 무엇인가?", "Quicksort has an average time complexity of O(n log n), because each partition splits the array roughly in half. In the worst case it is O(n^2)."],
  ["지구 온난화의 주요 원인은 무엇인가?", "The main cause of global warming is the increase of greenhouse gases such as carbon dioxide from burning fossil fuels. Therefore human activity is the primary driver of climate change."],
  ["항생제 내성 세균이 늘어나는 이유를 설명하시오.", "Antibiotic use kills susceptible bacteria, while resistant bacteria with pre-existing mutations survive and reproduce. So natural selection increases the share of resistant bacteria."],
  ["삼각형의 내각의 합은 몇 도인가?", "The sum of the interior angles of a triangle is 180 degrees. Therefore each triangle's angles add up to 180°."],
  ["프랑스 혁명이 일어난 원인을 설명하시오.", "The French Revolution was caused by financial crisis, social inequality between estates, and Enlightenment ideas. Therefore the monarchy lost legitimacy and revolution broke out in 1789."],
  ["재귀 함수에서 기저 조건이 필요한 이유는 무엇인가?", "A recursive function needs a base case so that the recursion stops; without it the function calls itself forever and causes a stack overflow. Therefore the base case guarantees termination."],
  ["인플레이션이 저축에 미치는 영향은?", "Inflation reduces the real value of savings because prices rise faster than the money saved. Therefore savers lose purchasing power unless interest rates exceed inflation."],
  ["물의 끓는점은 해수면에서 섭씨 몇 도인가?", "At sea level, water boils at 100 degrees Celsius. Therefore the boiling point is 100 °C."],
  ["DNA 복제는 세포 주기의 어느 단계에서 일어나는가?", "DNA replication occurs during the S phase of the cell cycle, between G1 and G2. Therefore the answer is the S (synthesis) phase."],
  ["뉴턴의 제2법칙을 설명하시오.", "Newton's second law states that the net force on an object equals its mass times its acceleration, F = ma. Therefore a larger force produces a larger acceleration."]
];

test("한국어 질문 + 영어 답 12개: 모두 관련 있음(사전으로 맞댐)", () => {
  CASES.forEach(([q, a]) => {
    const r = P.relevance([q], a, DECOYS);
    assert.equal(r.status, "related", q);
    assert.equal(r.cross, true, q);
  });
});

test("서로 짝이 안 맞는 132쌍: 잘못 '관련 있음'은 1쌍 이하", () => {
  let wrong = 0;
  CASES.forEach(([q], i) => CASES.forEach(([, a], j) => {
    if (i !== j && P.relevance([q], a, DECOYS).status === "related") wrong++;
  }));
  assert.ok(wrong <= 1, "잘못 통과 " + wrong + "/132");
});

test("영어 질문 + 한국어 답도 사전으로 맞댄다", () => {
  const r = P.relevance(["What is the boiling point of water at sea level in Celsius?"], "해수면에서 물은 섭씨 100도에서 끓는다. 따라서 끓는점은 100°C이다.", DECOYS);
  assert.equal(r.status, "related");
});

test("상관없는 답은 언어가 달라도 관련 없음, 단서 없는 질문은 보류", () => {
  assert.equal(P.relevance([CASES[0][0]], "The capital of France is Paris. Therefore, the final answer is Paris, a city in Europe.", DECOYS).status, "unrelated");
  assert.equal(P.relevance(["이거 뭐야?"], "Photosynthesis uses light energy to split water and release oxygen. Therefore oxygen increases with light.", DECOYS).status, "unknown");
});

test("3단계: 직접 입력한 질문의 한·영 서술형 답은 사전 용어까지 맞대 같은 내용으로 본다", () => {
  const kr = "광합성은 빛 에너지로 물을 분해해 산소를 만든다. 빛의 세기가 세지면 산소 발생량이 늘다가, 이산화탄소나 온도가 제한 요인이 되면 더 늘지 않는다. 따라서 처음엔 비례하다 포화된다.";
  const same = P.compare(P.analyze(CASES[0][1]), P.analyze(kr), { glossary: true });
  assert.equal(same.sameAnswer, true);
  const other = P.compare(P.analyze(CASES[8][1]), P.analyze(kr), { glossary: true });
  assert.notEqual(other.sameAnswer, true);
});
