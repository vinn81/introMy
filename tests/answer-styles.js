// 여러 AI가 결론을 내는 말투를 흉내 낸 형식 견본(실제 답이 아니라, 결론 찾기 규칙의 회귀 테스트용으로 만든 것).
// expect: 최종 답으로 뽑혀야 하는 글(일부), avoid: 최종 답에 들어가면 안 되는 글(풀이 중간의 값 등)
module.exports = [
  {
    style: "ChatGPT식 · 이모지 제목(한국어)", item: "M01",
    text: "좋은 질문이에요! 하나씩 풀어 볼게요.\n\n### 🔍 풀이\n1. x ≡ 2 (mod 3), x ≡ 2 (mod 7) 이므로 x ≡ 2 (mod 21)\n2. x = 21k + 2 를 x ≡ 3 (mod 5)에 넣으면 k ≡ 1 (mod 5)\n3. k = 1 → x = 23\n\n### ✅ 최종 답\nx = 23\n\n도움이 되었길 바라요! 다른 문제도 물어보세요 😊",
    expect: "23", avoid: "도움이"
  },
  {
    style: "ChatGPT식 · 굵은 정답 문장(한국어)", item: "M01",
    text: "조건을 정리하면 다음과 같습니다.\n\n- x를 3으로 나눈 나머지는 2\n- x를 5로 나눈 나머지는 3\n- x를 7로 나눈 나머지는 2\n\n2, 23, 44 … 중에서 5로 나눈 나머지가 3인 가장 작은 수를 찾으면 됩니다.\n\n👉 **정답은 23입니다.**\n\n필요하면 중국인의 나머지 정리로 일반해도 구해 드릴게요.",
    expect: "23", avoid: "44"
  },
  {
    style: "ChatGPT식 · Final Answer 제목(영어)", item: "M01",
    text: "Let's solve the system of congruences step by step.\n\n**Step 1.** From x ≡ 2 (mod 3) and x ≡ 2 (mod 7), x ≡ 2 (mod 21).\n\n**Step 2.** Write x = 21k + 2. Then 21k + 2 ≡ 3 (mod 5) gives k ≡ 1 (mod 5).\n\n**Step 3.** The smallest k is 1, so x = 23.\n\n---\n\n### ✅ Final Answer\n**x = 23**\n\nLet me know if you'd like the general solution!",
    expect: "23", avoid: "Let me know"
  },
  {
    style: "Gemini식 · 결론적으로(한국어)", item: "M01",
    text: "이 문제는 중국인의 나머지 정리를 이용해 풀 수 있습니다.\n\n## 풀이 과정\n\n* **1단계:** 3과 7로 나눈 나머지가 모두 2이므로 x = 21k + 2 꼴입니다.\n* **2단계:** k = 0이면 x = 2인데, 5로 나눈 나머지가 2라서 조건을 만족하지 않습니다.\n* **3단계:** k = 1이면 x = 23이고, 5로 나눈 나머지가 3입니다.\n\n결론적으로, 조건을 모두 만족하는 가장 작은 양의 정수 x는 23입니다.",
    expect: "23", avoid: "x = 2인데"
  },
  {
    style: "Gemini식 · The final answer is(영어, boxed)", item: "M01",
    text: "To find the smallest positive integer x, we combine the congruences.\n\nSince x ≡ 2 (mod 3) and x ≡ 2 (mod 7), we have x ≡ 2 (mod 21). Testing x = 2, 23, 44, … against x ≡ 3 (mod 5), the first that works is 23.\n\nThe final answer is $\\boxed{23}$.",
    expect: "23", avoid: "44"
  },
  {
    style: "DeepSeek식 · 풀이 뒤 Final Answer + boxed(영어)", item: "M01",
    text: "We are asked to find x such that x ≡ 2 (mod 3), x ≡ 3 (mod 5), x ≡ 2 (mod 7).\n\nFirst, x = 21k + 2. Substituting, 21k + 2 ≡ 3 (mod 5), so k ≡ 1 (mod 5). With k = 1, x = 23. Check: 23 = 3·7 + 2, 23 = 5·4 + 3, 23 = 7·3 + 2. ✓\n\n**Final Answer**\n\n$$\\boxed{23}$$",
    expect: "23"
  },
  {
    style: "Perplexity식 · 답을 맨 앞에(영어)", item: "M01",
    text: "The smallest positive integer satisfying all three congruences is **23**.\n\n## Why\n- 23 mod 3 = 2\n- 23 mod 5 = 3\n- 23 mod 7 = 2\n\nBy the Chinese Remainder Theorem, all solutions are x = 23 + 105t.",
    expect: "23", avoid: "105t"
  },
  {
    style: "한국어 · ∴ 기호", item: "M01",
    text: "x = 21k + 2 꼴이다.\n21k + 2 ≡ 3 (mod 5) 에서 k ≡ 1 (mod 5).\nk = 1 대입하면 x = 23.\n∴ 가장 작은 양의 정수 x = 23",
    expect: "23"
  },
  {
    style: "한국어 · ~가 정답입니다", item: "M01",
    text: "3과 7로 나눈 나머지가 2인 수는 2, 23, 44, 65, …입니다.\n이 가운데 5로 나눈 나머지가 3인 수를 찾습니다.\n2는 나머지 2, 23은 나머지 3입니다.\n그러므로 23이 정답입니다.\n참고로 그다음 해는 128입니다.",
    expect: "23이 정답", avoid: "128"
  },
  {
    style: "ChatGPT식 · 한 줄 요약(한국어, 판정형)", item: "E06",
    text: "주어진 추론을 살펴볼게요.\n\n1. 전제: 정사각형이면 직사각형이다. (P → Q)\n2. 전제: 이 도형은 직사각형이 아니다. (¬Q)\n3. 결론: 따라서 정사각형이다. (P)\n\n후건 부정(modus tollens)에 따르면 P → Q와 ¬Q에서 ¬P가 나와야 합니다.\n\n📌 **한 줄 요약:** 올바른 결론은 \"정사각형이 아니다\"이며, 원래 추론은 후건 부정을 잘못 적용한 오류입니다.",
    expect: "정사각형이 아니다"
  },
  {
    style: "Gemini식 · 요약하면(한국어)", item: "S01",
    text: "뉴턴의 운동 제2법칙 F = ma를 이용합니다.\n\n* 알짜힘 F = 6 N\n* 질량 m = 2 kg\n\na = F / m = 6 / 2 = 3\n\n요약하면, 물체의 가속도는 3 m/s²입니다.",
    expect: "3 m/s²"
  },
  {
    style: "ChatGPT식 · Bottom line(영어, 판정형)", item: "L11",
    text: "Let's look at the reasoning.\n\nThe argument observes that event B happened after event A and concludes that A caused B. This is the post hoc fallacy: temporal order alone does not establish causation, and a confounder could explain both.\n\n**Bottom line:** No — the temporal association alone does not establish causation.",
    expect: "does not establish causation"
  },
  {
    style: "질문을 다시 적고 끝나는 풀이(결론 없음)", item: "M01",
    text: "가장 작은 양의 정수 x를 구하는 문제입니다.\n\nx ≡ 2 (mod 3), x ≡ 3 (mod 5), x ≡ 2 (mod 7)을 모두 만족해야 합니다.\n\n먼저 x = 21k + 2 꼴로 놓겠습니다.\n\n그렇다면 k는 무엇일까요?",
    expect: "", avoid: ""
  }
];
