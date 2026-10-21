/* P2-Bench v1.0 공개 문항 60개와 논문 본실험 응답 예시 (AI가 쓴 답만 담았고 개인정보는 없음) */
window.P2_EXAMPLES = [
 {
  "id": "L15",
  "label": "처음 단정 후 번복",
  "model": "Sonnet 5.5",
  "category": "Logic",
  "questionKR": "A,B,C 중 정확히 한 명만 범인이고 다음 세 진술 중 정확히 하나만 참이다. A: “B가 범인이다.” B: “C가 범인이다.” C: “B의 진술은 거짓이다.” 범인을 유일하게 결정할 수 있는가?",
  "questionEN": "Exactly one of A, B, and C is guilty, and exactly one of the following statements is true. A: “B is guilty.” B: “C is guilty.” C: “B’s statement is false.” Can the guilty person be uniquely determined?",
  "answer": "No. Both A guilty and C guilty satisfy the conditions.",
  "en": {
   "run": "P2M-02-052",
   "text": "**Answer: Yes. A is guilty.**\n\n**Setup.** Exactly one person is guilty, and exactly one of the three statements is true.\n- A's statement: \"B is guilty.\"\n- B's statement: \"C is guilty.\"\n- C's statement: \"B's statement is false.\"\n\n**Case analysis.**\n\n1. **A guilty.** A's statement is false. B's statement is false, so C's statement (\"B's statement is false\") is true. Exactly one statement (C's) is true. ✔ Consistent.\n\n2. **B guilty.** A's statement is true. B's statement is false, so C's statement is true. That makes two true statements. ✘\n\n3. **C guilty.** A's statement is false. B's statement is true, so C's statement is false. Exactly one statement (B's) is true. ✔ Consistent.\n\n**Problem:** Case 3 is also consistent, so two scenarios survive: A guilty or C guilty.\n\n**Check of the structure.** B's and C's statements are always contradictory: C's statement is true exactly when B's is false. So exactly one of them is true in every scenario, which means A's statement must be false. A's statement being false means B is not guilty, which rules out B but leaves A and C both possible.\n\n**Conclusion.** My initial \"Yes, A\" was premature. The correct finding is:\n\n**No, the guilty person cannot be uniquely determined.** The conditions are satisfied by two scenarios:\n- A is guilty (only C's statement is true), or\n- C is guilty (only B's statement is true).\n\nOnly B can be eliminated. The information given is insufficient to choose between A and C.",
   "score": 97.0
  },
  "kr": {
   "run": "P2M-02-051",
   "text": "**답: 아니오, 범인을 유일하게 결정할 수 없다. 범인은 A 또는 C이며, B만 확실히 배제된다.**\n\n**근거**\n\n각 진술은 다음과 같다.\n- A의 진술: \"B가 범인이다.\"\n- B의 진술: \"C가 범인이다.\"\n- C의 진술: \"B의 진술은 거짓이다.\" 이는 \"C는 범인이 아니다\"와 같은 말이다.\n\nC의 진술은 B의 진술을 정확히 부정한 것이므로, B와 C의 진술 중 항상 정확히 하나만 참이다. 그런데 전체에서 참인 진술은 정확히 하나여야 하므로 A의 진술은 반드시 거짓이다. 따라서 B는 범인이 아니다.\n\n남은 경우를 하나씩 확인하면 다음과 같다.\n\n| 범인 | A 진술 | B 진술 | C 진술 | 참인 진술 수 | 조건 충족 |\n|---|---|---|---|---|---|\n| A | 거짓 | 거짓 | 참 | 1 | 충족 |\n| B | 참 | 거짓 | 참 | 2 | 위배 |\n| C | 거짓 | 참 | 거짓 | 1 | 충족 |\n\n범인이 A인 경우와 C인 경우 모두 조건을 만족하는 모순 없는 상황이다.\n\n**정보 부족 여부**\n\n주어진 조건만으로는 A와 C 중 누가 범인인지 가릴 수 없다. 이를 가리려면 \"A는 범인이 아니다\" 같은 추가 정보나 누가 어떤 진술을 했는지에 대한 별도 단서가 필요하다.",
   "score": 100.0
  }
 },
 {
  "id": "S05",
  "label": "조건 오판 후 자기수정",
  "model": "Sonnet 5.5",
  "category": "Science",
  "questionKR": "반응 2H₂ + O₂ → 2H₂O에서 H₂ 5 mol과 O₂ 2 mol을 반응시킨다. 제한 반응물, 생성되는 H₂O의 몰수, 남는 반응물의 몰수를 구하시오.",
  "questionEN": "For 2H₂ + O₂ → 2H₂O, react 5 mol H₂ with 2 mol O₂. Identify the limiting reactant, moles of H₂O produced, and moles of excess reactant remaining.",
  "answer": "O₂ is limiting; 4 mol H₂O form; 1 mol H₂ remains.",
  "en": {
   "run": "P2M-02-100",
   "text": "**Limiting reactant: H₂**\n\n**Justification:**\n\nThe balanced equation 2H₂ + O₂ → 2H₂O (checked: 4 H and 2 O on each side) requires H₂ : O₂ = 2 : 1.\n\n- O₂ needed to react with all 5 mol H₂: 5 × (1/2) = 2.5 mol. Only 2 mol O₂ is available, which is less than 2.5 mol.\n- Equivalently, H₂ needed to consume all 2 mol O₂: 2 × 2 = 4 mol. 5 mol H₂ is available, which is more than 4 mol.\n\nSo **O₂ is the limiting reactant** (not H₂, correcting my opening line).\n\n**Final answers:**\n\n- **Limiting reactant: O₂**\n- **H₂O produced:** 2 mol O₂ × (2 mol H₂O / 1 mol O₂) = **4 mol H₂O**\n- **Excess reactant remaining:** H₂ consumed = 4 mol, so 5 − 4 = **1 mol H₂ left over**\n\n**Condition check:** The amounts are given in moles and the equation is balanced, so the information is sufficient. This assumes complete reaction (100% yield) and that nothing else consumes the reactants.",
   "score": 97.0
  },
  "kr": {
   "run": "P2M-02-099",
   "text": "**최종 답**\n- 제한 반응물: **O₂**\n- 생성되는 H₂O: **4 mol**\n- 남는 반응물: **H₂ 1 mol** (O₂는 모두 소진)\n\n**근거**\n\n균형 반응식 2H₂ + O₂ → 2H₂O에서 H₂ : O₂ : H₂O의 몰비는 2 : 1 : 2입니다.\n\n1. **각 반응물이 만들 수 있는 H₂O의 양**\n   - H₂ 기준: 5 mol × (2 mol H₂O / 2 mol H₂) = 5 mol H₂O\n   - O₂ 기준: 2 mol × (2 mol H₂O / 1 mol O₂) = 4 mol H₂O\n\n2. **제한 반응물 결정**\n   O₂ 기준으로 만들어지는 양이 더 적으므로 O₂가 먼저 소진됩니다. 따라서 O₂가 제한 반응물이고, 생성되는 H₂O는 **4 mol**입니다.\n\n3. **남는 반응물 계산**\n   O₂ 2 mol과 반응하는 H₂ = 2 mol × 2 = 4 mol\n   남는 H₂ = 5 − 4 = **1 mol**\n\n**조건 확인**\n- 반응식은 이미 균형이 맞춰져 있습니다 (좌우 모두 H 4개, O 2개).\n- 반응이 완전히 진행되고(수율 100%) 부반응이 없다고 가정했습니다. 문제에 이를 벗어나는 조건은 제시되지 않았습니다.\n- 온도, 압력 등은 몰수 계산에 필요하지 않으므로 정보 부족은 없습니다.",
   "score": 100.0
  }
 },
 {
  "id": "E15",
  "label": "정보 부족 뒤 과잉추론",
  "model": "Sonnet 5.5",
  "category": "Error Detection",
  "questionKR": "제공된 짧은 전기에는 “연구자는 2010년에 대학을 졸업했고 2015년에 첫 논문을 냈다”는 정보만 있다. AI가 “따라서 1988년생이다”라고 답했다. 이 결론을 평가하시오.",
  "questionEN": "A short biography only says, “The researcher graduated from university in 2010 and published a first paper in 2015.” The AI concludes, “Therefore, the researcher was born in 1988.” Evaluate the conclusion.",
  "answer": "Unsupported; birth year cannot be determined from the provided information.",
  "en": {
   "run": "P2M-02-104",
   "text": "**Final answer:** The conclusion is not supported. The stated information is insufficient to determine the birth year, so \"born in 1988\" is an unjustified inference.\n\n**Justification:**\n\n- **No birth information is given.** The biography states only a graduation year (2010) and a first-publication year (2015). Neither fact fixes a birth year.\n- **The conclusion depends on hidden assumptions.** To get 1988 you would have to assume the researcher graduated at about age 22 (2010 − 22 = 1988). The text never states this. Graduation age varies widely: people graduate at 20, 25, 35 or later, through gap years, military service, late-start education, or after switching careers.\n- **\"Graduated from university\" is ambiguous.** It could mean a bachelor's, master's, or doctorate. A PhD graduate in 2010 would typically be born in the late 1970s or early 1980s, not 1988.\n- **The publication date adds nothing.** The first paper in 2015 only shows the researcher was alive and active by then. It sets no useful bound beyond a loose upper limit on birth year, and it doesn't pin down the age at which they published.\n\n**What can legitimately be said:** The researcher was almost certainly born well before 2010, probably somewhere in the 1960s to 1990. A guess like 1988 is a plausible *typical-case estimate* (for someone finishing a bachelor's degree at about 22), but it is only a guess. It cannot be presented as a deduction (\"Therefore...\").\n\n**Verdict:** Invalid inference. The correct response is to say the birth year cannot be determined from the given facts, and that any specific year would rest on an unstated assumption about age at graduation.",
   "score": 96.0
  },
  "kr": {
   "run": "P2M-02-103",
   "text": "**최종 평가: 이 결론은 근거가 없으며, 주어진 정보만으로는 출생연도를 알 수 없다.**\n\n**1. 제공된 정보**\n- 대학 졸업: 2010년\n- 첫 논문 발표: 2015년\n\n출생연도, 나이, 입학 연도, 학력 경로(휴학·군복무·편입·늦깎이 입학 등)에 관한 정보는 없다.\n\n**2. 결론이 성립하려면 필요한 가정**\n1988년생이라는 답은 \"대학 졸업 시 만 22세\"라는 암묵적 가정에서 나온 것으로 보인다(2010 − 22 = 1988). 그러나 이 가정은 전기에 명시되어 있지 않다. 게다가 한국의 일반적인 경우(만 18세 입학, 4년제 졸업)라면 졸업 시점은 만 21~22세 정도여서 1988년 또는 1989년생이 되는데, 이것도 \"전형적 경로\"라는 또 다른 가정이 추가된 것이다.\n\n**3. 반례**\n- 군복무·휴학·재수를 거쳤다면 1985~1987년생도 가능하다.\n- 사회생활 후 늦게 입학했다면 1970~1980년대생도 가능하다.\n- 조기 입학이나 월반이라면 1989년 이후 출생도 가능하다.\n- 학사 졸업이 아니라 석사·박사 졸업을 가리키는 것일 수도 있다(문장이 학위 수준을 명시하지 않음).\n\n따라서 가능한 출생연도의 범위는 넓고, 1988년은 그중 하나의 추측일 뿐이다. 2015년의 첫 논문 정보는 출생연도 추정에 사실상 보탬이 되지 않는다.\n\n**4. 논리적 오류**\n\"따라서\"라는 연결어는 전제로부터 필연적으로 결론이 따른다는 뜻인데, 여기서는 연역이 아니라 숨은 전제에 기댄 추측을 단정적으로 제시했다. 이는 전형적인 근거 없는 단정(과잉 확신)이다.\n\n**5. 바람직한 답변**\n\"주어진 정보만으로는 출생연도를 확정할 수 없다. 대학 입학 연령 등을 가정하면 대략 1980년대 후반생으로 추정할 수 있으나, 이는 추측이다. 정확한 판단에는 출생 정보나 학력 경로가 필요하다.\"\n\n**결론:** 정보 부족 상태에서 1988년생이라고 단정한 AI의 답은 오류이며, 불확실성을 밝히고 추정이라면 가정을 명시했어야 한다.",
   "score": 100.0
  }
 },
 {
  "id": "E01",
  "label": "설명 속 모순",
  "model": "Sonnet 5.5",
  "category": "Error Detection",
  "questionKR": "다음 AI 답변의 오류를 찾아 수정하시오. 질문: “17×24는?” AI: “17×24=388입니다. 17×20=340이고 17×4=48이므로 340+48=388입니다.”",
  "questionEN": "Find and correct the error in this AI response. Question: “What is 17×24?” AI: “17×24=388. Since 17×20=340 and 17×4=48, 340+48=388.”",
  "answer": "The correct answer is 408; 340+68=408 because 17×4=68.",
  "en": {
   "run": "P2M-02-109",
   "text": "**Final answer:** The correct value is 17 × 24 = **408**, so the AI's answer of 388 is wrong.\n\n**Where the error is:** The decomposition is fine: 24 = 20 + 4, so 17 × 24 = 17 × 20 + 17 × 4. Both partial products are also correct:\n- 17 × 20 = 340 ✔\n- 17 × 4 = 68 ✘ (the AI wrote 48)\n\nThe mistake is in the second partial product: 17 × 4 is 68, not 48 (10 × 4 = 40 and 7 × 4 = 28, which gives 68). The AI's addition (340 + 48 = 388) is internally correct, but it inherits the wrong input.\n\n**Corrected response:** 17 × 24 = 17 × 20 + 17 × 4 = 340 + 68 = **408**.\n\n**Verification by an independent method:** 24 × 17 = 24 × 10 + 24 × 7 = 240 + 168 = 408 ✔\n\n**Conditions check:** The question is complete and unambiguous (a plain integer multiplication), so the information is sufficient.",
   "score": 99.0
  },
  "kr": {
   "run": "P2M-02-110",
   "text": "**최종 답: 올바른 값은 17×24 = 408입니다.**\n\n**오류 위치**\nAI의 풀이 방식(분배법칙으로 17×24 = 17×20 + 17×4)은 맞습니다. 또한 17×20 = 340, 17×4 = 68이라는 값도 정확해야 하는데, 오류는 두 번째 항에서 발생했습니다.\n\n- 17×4 = **68** (AI는 48이라고 잘못 계산함)\n- 따라서 340 + 68 = **408**\n\n**추가로 짚을 점**\nAI의 답변은 내적으로도 일관되지 않습니다. 340 + 48 = 388이므로 마지막 덧셈 자체는 맞지만, 그 앞의 곱셈 17×4 = 48이 틀렸기 때문에 최종 결과가 틀렸습니다. 즉 오류는 덧셈이 아니라 곱셈 단계 하나(17×4)에 있습니다.\n\n**검산**\n- 24×17 = 24×10 + 24×7 = 240 + 168 = 408 ✓\n- 20×24 − 3×24 = 480 − 72 = 408 ✓\n\n**수정된 AI 답변**\n\"17×24=408입니다. 17×20=340이고 17×4=68이므로 340+68=408입니다.\"\n\n**조건 확인**\n문제에 필요한 정보는 모두 주어져 있으며(질문과 AI의 답변), 부족한 정보는 없습니다.",
   "score": 100.0
  }
 },
 {
  "id": "M01",
  "label": "흔들림 없는 답(비교용)",
  "model": "Opus 5.5",
  "category": "Mathematics",
  "questionKR": "가장 작은 양의 정수 x가 x≡2 (mod 3), x≡3 (mod 5), x≡2 (mod 7)을 만족한다. x를 구하시오.",
  "questionEN": "Find the smallest positive integer x satisfying x≡2 (mod 3), x≡3 (mod 5), and x≡2 (mod 7).",
  "answer": "23",
  "en": {
   "run": "P2M-01-084",
   "text": "**Answer: x = 23**\n\n**Justification:**\n\nThe moduli 3, 5, and 7 are pairwise coprime, so by the Chinese Remainder Theorem there is exactly one solution modulo 3·5·7 = 105. The information given is sufficient.\n\n1. Combine the first and third conditions. Since x ≡ 2 (mod 3) and x ≡ 2 (mod 7), and 3 and 7 are coprime, x ≡ 2 (mod 21). So x is one of 2, 23, 44, 65, 86, …\n2. Apply the second condition, x ≡ 3 (mod 5). Write x = 21k + 2. Then 21k + 2 ≡ k + 2 ≡ 3 (mod 5), so k ≡ 1 (mod 5). The smallest such k ≥ 0 is k = 1, which gives x = 23.\n\n**Check:**\n- 23 = 3·7 + 2, so 23 ≡ 2 (mod 3).\n- 23 = 5·4 + 3, so 23 ≡ 3 (mod 5).\n- 23 = 7·3 + 2, so 23 ≡ 2 (mod 7).\n\nThe general solution is x ≡ 23 (mod 105), so the smallest positive integer is **23**.",
   "score": 100.0
  },
  "kr": {
   "run": "P2M-01-083",
   "text": "**답: x = 23**\n\n**조건 확인**\n법 3, 5, 7은 서로소이므로 중국인의 나머지 정리에 따라 해는 법 105에 대해 유일하게 존재합니다. 주어진 정보만으로 충분히 풀 수 있습니다.\n\n**풀이**\n1. 첫째와 셋째 조건은 x ≡ 2 (mod 3), x ≡ 2 (mod 7)입니다. 3과 7이 서로소이므로 두 조건을 합치면 x ≡ 2 (mod 21)입니다.\n   따라서 x = 21k + 2 꼴입니다.\n2. 이를 둘째 조건 x ≡ 3 (mod 5)에 대입합니다.\n   21k + 2 ≡ 3 (mod 5)이고, 21 ≡ 1 (mod 5)이므로 k + 2 ≡ 3, 즉 k ≡ 1 (mod 5)입니다.\n3. 가장 작은 음이 아닌 k는 1이므로 x = 21·1 + 2 = 23입니다.\n   일반해는 x = 23 + 105t (t는 정수)이며, 가장 작은 양의 정수는 23입니다.\n\n**검산**\n- 23 = 3·7 + 2이므로 23 ≡ 2 (mod 3)\n- 23 = 5·4 + 3이므로 23 ≡ 3 (mod 5)\n- 23 = 7·3 + 2이므로 23 ≡ 2 (mod 7)\n\n세 조건을 모두 만족합니다.",
   "score": 100.0
  }
 }
];
// P2-Bench v1.0 60문항. errorType·target·explanation은 재현 패키지 Master Dataset의
// Expected_Error_Type·Evaluation_Target·Explanation을 그대로 옮긴 것이다.
window.P2_ITEMS = [{"id": "M01", "category": "Mathematics", "difficulty": "Medium", "kr": "가장 작은 양의 정수 x가 x≡2 (mod 3), x≡3 (mod 5), x≡2 (mod 7)을 만족한다. x를 구하시오.", "en": "Find the smallest positive integer x satisfying x≡2 (mod 3), x≡3 (mod 5), and x≡2 (mod 7).", "answer": "23", "errorType": "arithmetic error; incomplete congruence checking", "target": "modular arithmetic and constraint integration", "explanation": "23 gives remainders 2, 3, and 2 respectively. By the Chinese Remainder Theorem the solution is unique modulo 105, so 23 is the smallest positive solution."}, {"id": "M02", "category": "Mathematics", "difficulty": "Medium", "kr": "서로 다른 5명 A,B,C,D,E를 일렬로 세울 때 A와 B가 서로 이웃하지 않는 배열의 수를 구하시오.", "en": "Five distinct people A, B, C, D, and E stand in a row. How many arrangements have A and B not adjacent?", "answer": "72", "errorType": "double counting; incorrect adjacency count", "target": "combinatorial counting and complement reasoning", "explanation": "There are 5!=120 total arrangements. If A and B are adjacent, treat them as one block: 4! arrangements of the block and the other three people, times 2 internal orders, giving 48. Thus 120-48=72."}, {"id": "M03", "category": "Mathematics", "difficulty": "Medium", "kr": "수열 a1=2, a(n+1)=3a(n)+1의 일반항을 구하시오.", "en": "A sequence is defined by a1=2 and a(n+1)=3a(n)+1. Find a closed form for a(n).", "answer": "a(n)=(5·3^(n-1)-1)/2", "errorType": "pattern guessing; constant-term error", "target": "recurrence transformation and verification", "explanation": "Let b(n)=a(n)+1/2. Then b(n+1)=3b(n) and b(1)=5/2. Hence b(n)=(5/2)3^(n-1), so a(n)=(5·3^(n-1)-1)/2."}, {"id": "M04", "category": "Mathematics", "difficulty": "Hard", "kr": "실수 매개변수 t에 대하여 연립방정식 x+y=2, tx+y=3을 생각하자. 유일해가 존재하는 t의 조건을 구하고, 그때의 해를 구하시오. t=1일 때도 분류하시오.", "en": "For real parameter t, consider x+y=2 and tx+y=3. Determine when a unique solution exists and find it. Also classify the case t=1.", "answer": "For t≠1: x=1/(t-1), y=2-1/(t-1). For t=1: no solution.", "errorType": "division by zero; failure to inspect t=1", "target": "parameter-dependent solvability and edge-case checking", "explanation": "Subtracting the equations gives (t-1)x=1. Thus t≠1 gives a unique x and y. If t=1, the equations become x+y=2 and x+y=3, which are inconsistent."}, {"id": "M05", "category": "Mathematics", "difficulty": "Hard", "kr": "어떤 질병의 유병률은 1%이다. 검사의 민감도는 90%, 특이도는 95%이다. 무작위로 선택된 사람이 양성 판정을 받았을 때 실제로 질병이 있을 확률을 구하시오.", "en": "A disease has prevalence 1%. A test has sensitivity 90% and specificity 95%. For a randomly selected person who tests positive, find the probability that the person actually has the disease.", "answer": "Approximately 15.38%.", "errorType": "base-rate neglect; confusing sensitivity with posterior probability", "target": "Bayesian reasoning and base-rate use", "explanation": "P(D and +)=0.01×0.90=0.009. P(+)=0.009+0.99×0.05=0.0585. Therefore P(D|+)=0.009/0.0585≈0.1538."}, {"id": "M06", "category": "Mathematics", "difficulty": "Medium", "kr": "합 Σ(k=1 to n) 1/[k(k+1)]을 구하고 간단히 증명하시오.", "en": "Evaluate Σ(k=1 to n) 1/[k(k+1)] and briefly justify the result.", "answer": "n/(n+1)", "errorType": "incorrect cancellation; endpoint error", "target": "algebraic decomposition and telescoping", "explanation": "Since 1/[k(k+1)]=1/k-1/(k+1), the sum telescopes to 1-1/(n+1)=n/(n+1)."}, {"id": "M07", "category": "Mathematics", "difficulty": "Medium", "kr": "“모든 유계 수열은 수렴한다”라는 명제가 참인지 판단하고, 거짓이면 반례를 제시하시오.", "en": "Determine whether the statement “Every bounded sequence converges” is true. If false, give a counterexample.", "answer": "False; for example a(n)=(-1)^n.", "errorType": "confusing boundedness with convergence", "target": "counterexample construction and definition use", "explanation": "The sequence (-1)^n is bounded between -1 and 1 but alternates forever and has no limit."}, {"id": "M08", "category": "Mathematics", "difficulty": "Hard", "kr": "정수 n에 대하여 n²이 짝수이면 n도 짝수임을 증명하시오.", "en": "Prove that for an integer n, if n² is even, then n is even.", "answer": "Proof by contrapositive: if n is odd then n² is odd.", "errorType": "circular proof; unjustified parity step", "target": "proof construction and logical equivalence", "explanation": "If n=2k+1, then n²=4k²+4k+1=2(2k²+2k)+1, which is odd. Therefore by contrapositive, even n² implies even n."}, {"id": "M09", "category": "Mathematics", "difficulty": "Medium", "kr": "x>0일 때 x+16/x의 최솟값과 그때의 x를 구하시오.", "en": "For x>0, find the minimum value of x+16/x and the value of x where it occurs.", "answer": "Minimum 8 at x=4.", "errorType": "ignoring x>0; equality-condition error", "target": "optimization under domain constraints", "explanation": "By AM-GM, x+16/x ≥ 2√16=8, with equality when x=16/x, so x=4."}, {"id": "M10", "category": "Mathematics", "difficulty": "Medium", "kr": "유한집합 A,B에 대하여 |A|=28, |B|=35, |A∪B|=50이다. |A∩B|를 구하시오.", "en": "For finite sets A and B, |A|=28, |B|=35, and |A∪B|=50. Find |A∩B|.", "answer": "13", "errorType": "adding without correcting overlap", "target": "inclusion-exclusion reasoning", "explanation": "Use |A∪B|=|A|+|B|-|A∩B|. Thus |A∩B|=28+35-50=13."}, {"id": "M11", "category": "Mathematics", "difficulty": "Hard", "kr": "0 이상의 정수 n에 대해 f(0)=0, f(n+1)=f(n)+2n+1이다. f(n)을 구하고 귀납적으로 확인하시오.", "en": "For nonnegative integers n, f(0)=0 and f(n+1)=f(n)+2n+1. Find f(n) and verify it by induction.", "answer": "f(n)=n²", "errorType": "off-by-one error; incomplete induction", "target": "recurrence recognition and induction", "explanation": "The recurrence adds consecutive odd numbers. If f(n)=n², then f(n+1)=n²+2n+1=(n+1)², with base case f(0)=0."}, {"id": "M12", "category": "Mathematics", "difficulty": "Hard", "kr": "A=[[1,1],[0,1]], B=[[1,0],[1,1]]일 때 AB와 BA를 각각 계산하고, 행렬 곱셈이 일반적으로 교환법칙을 만족하는지 설명하시오.", "en": "Let A=[[1,1],[0,1]] and B=[[1,0],[1,1]]. Compute AB and BA and explain whether matrix multiplication is generally commutative.", "answer": "AB=[[2,1],[1,1]], BA=[[1,1],[1,2]]; therefore AB≠BA.", "errorType": "assuming commutativity; multiplication-order error", "target": "matrix computation and counterexample reasoning", "explanation": "Direct multiplication gives different matrices, providing a concrete counterexample to commutativity."}, {"id": "M13", "category": "Mathematics", "difficulty": "Hard", "kr": "X가 [0,1]에서 균등분포를 따른다고 하자. P(X=1/2)는 얼마인가? 이 확률이 0이라는 사실이 X=1/2가 표본공간에서 불가능한 사건임을 의미하는지도 설명하시오.", "en": "Let X be uniformly distributed on [0,1]. What is P(X=1/2)? Explain whether probability 0 means that X=1/2 is an impossible event in the sample space.", "answer": "P(X=1/2)=0; a singleton is not impossible merely because it has probability 0 in a continuous distribution.", "errorType": "equating probability zero with logical impossibility", "target": "conceptual probability and zero-probability events", "explanation": "Continuous distributions assign probability zero to individual points, even though those points belong to the sample space."}, {"id": "M14", "category": "Mathematics", "difficulty": "Hard", "kr": "p(x)=x²-sx+12의 두 근이 서로 1 차이 나는 양의 정수이다. s를 구하시오.", "en": "The two roots of p(x)=x²-sx+12 are positive integers differing by 1. Find s.", "answer": "7", "errorType": "checking product but not difference; sign error", "target": "integer constraints and Vieta reasoning", "explanation": "The positive integer factor pair of 12 differing by 1 is 3 and 4. Their sum equals s by Vieta’s formulas, so s=7."}, {"id": "M15", "category": "Mathematics", "difficulty": "Hard", "kr": "점 (0,0)과 (2,0)을 지나는 원의 반지름을 이 정보만으로 유일하게 결정할 수 있는가? 가능 여부를 설명하시오.", "en": "Can the radius of a circle passing through (0,0) and (2,0) be uniquely determined from this information alone? Explain.", "answer": "No. Infinitely many radii are possible; centers are (1,c) with radius √(1+c²).", "errorType": "inventing a right angle/center; unjustified unique answer", "target": "underdetermination detection and geometric reasoning", "explanation": "A circle through both points has its center on their perpendicular bisector x=1. Different values of c give different radii, so the information is insufficient for a unique answer."}, {"id": "L01", "category": "Logic", "difficulty": "Medium", "kr": "“서버가 다운되면 웹사이트에 접속할 수 없다. 지금 웹사이트에 접속할 수 있다. 따라서 서버는 다운되지 않았다.” 이 논증의 형식과 타당성을 판단하시오.", "en": "“If the server is down, the website is unavailable. The website is available now. Therefore, the server is not down.” Identify the argument form and evaluate its validity.", "answer": "Valid modus tollens.", "errorType": "confusing modus tollens with an invalid form", "target": "formal argument validation", "explanation": "Let P=server down and Q=website unavailable. The premises are P→Q and ¬Q, so ¬P follows by modus tollens."}, {"id": "L02", "category": "Logic", "difficulty": "Medium", "kr": "“비가 오면 땅이 젖는다. 땅이 젖어 있다. 따라서 비가 왔다.” 이 추론이 타당한지 판단하고 오류가 있다면 이름을 쓰시오.", "en": "“If it rains, the ground gets wet. The ground is wet. Therefore, it rained.” Determine whether the inference is valid and name the error if any.", "answer": "Invalid; affirming the consequent.", "errorType": "affirming the consequent", "target": "fallacy detection", "explanation": "From P→Q and Q, P does not follow because other causes can make Q true."}, {"id": "L03", "category": "Logic", "difficulty": "Medium", "kr": "“보고서를 제출해야만 시험에 합격할 수 있다”에서 보고서 제출은 합격의 필요조건인가, 충분조건인가?", "en": "In the statement “You can pass the exam only if you submit the report,” is submitting the report a necessary condition, a sufficient condition, or both for passing?", "answer": "Necessary, not stated to be sufficient.", "errorType": "reversing “only if”", "target": "necessary/sufficient condition interpretation", "explanation": "“P only if Q” means P→Q. Passing implies submission; submission alone is not guaranteed to imply passing."}, {"id": "L04", "category": "Logic", "difficulty": "Hard", "kr": "명제 “모든 학생은 적어도 한 문제를 풀었다”의 정확한 부정을 자연어로 쓰시오.", "en": "Write the exact negation in natural language of “Every student solved at least one problem.”", "answer": "There exists at least one student who solved no problems.", "errorType": "negating only part of the statement", "target": "quantifier negation", "explanation": "Negating ∀student ∃problem solved gives ∃student ∀problem not solved."}, {"id": "L05", "category": "Logic", "difficulty": "Medium", "kr": "“어떤 파충류도 온혈동물이 아니다. 모든 뱀은 파충류이다. 따라서 어떤 뱀도 온혈동물이 아니다.” 이 논증은 타당한가?", "en": "“No reptiles are warm-blooded. All snakes are reptiles. Therefore, no snakes are warm-blooded.” Is the argument valid?", "answer": "Yes, valid.", "errorType": "misreading universal negative", "target": "categorical syllogism", "explanation": "If every snake is a reptile and no reptile is warm-blooded, then no member of the snake set can be warm-blooded."}, {"id": "L06", "category": "Logic", "difficulty": "Medium", "kr": "P→Q와 논리적으로 동치인 식을 ¬, ∨만 사용하여 쓰시오.", "en": "Using only ¬ and ∨, write an expression logically equivalent to P→Q.", "answer": "¬P ∨ Q", "errorType": "confusing implication with conjunction or converse", "target": "propositional equivalence", "explanation": "An implication is false only when P is true and Q is false, exactly matching ¬P∨Q."}, {"id": "L07", "category": "Logic", "difficulty": "Hard", "kr": "“모든 시인은 몽상가이다. 어떤 몽상가는 과학자이다. 따라서 어떤 시인은 과학자이다.” 이 논증의 타당성을 판단하고, 거짓임을 보이는 가능한 반례 구조를 제시하시오.", "en": "“All poets are dreamers. Some dreamers are scientists. Therefore, some poets are scientists.” Evaluate validity and give a possible countermodel if invalid.", "answer": "Invalid. The scientist-dreamer can be a different person from every poet.", "errorType": "illicitly merging existential witnesses", "target": "countermodel construction", "explanation": "Let one person be a poet and dreamer but not a scientist, and another be a dreamer and scientist but not a poet. Both premises hold while the conclusion is false."}, {"id": "L08", "category": "Logic", "difficulty": "Hard", "kr": "기사(knight)는 항상 참말을 하고 거짓말쟁이(knave)는 항상 거짓말을 한다. A가 “B는 거짓말쟁이다”라고 말하고, B가 “우리는 서로 다른 유형이다”라고 말한다. A와 B의 유형을 구하시오.", "en": "Knights always tell the truth and knaves always lie. A says, “B is a knave.” B says, “We are of different types.” Determine the types of A and B.", "answer": "A is a knave; B is a knight.", "errorType": "failing to check both speakers simultaneously", "target": "constraint consistency reasoning", "explanation": "If A were a knight, B would be a knave, making B’s “different types” statement true, a contradiction. If A is a knave, B is a knight, and B’s statement is true."}, {"id": "L09", "category": "Logic", "difficulty": "Medium", "kr": "“Q는 P의 필요조건이지만 충분조건은 아니다”를 두 개의 함의 관계로 표현하시오.", "en": "Express “Q is necessary but not sufficient for P” using implication relations.", "answer": "P→Q, but Q→P is not guaranteed (and must fail in at least one possible case).", "errorType": "reversing necessity and sufficiency", "target": "condition-direction reasoning", "explanation": "Necessary means P cannot occur without Q, so P→Q. Not sufficient means Q alone does not ensure P."}, {"id": "L10", "category": "Logic", "difficulty": "Medium", "kr": "전제 P∨Q와 ¬P로부터 Q를 결론내리는 추론의 이름과 타당성을 쓰시오.", "en": "From premises P∨Q and ¬P, conclude Q. Name the inference rule and state whether it is valid.", "answer": "Disjunctive syllogism; valid.", "errorType": "treating inclusive OR incorrectly", "target": "formal inference rule recognition", "explanation": "If at least one of P or Q is true and P is false, Q must be true."}, {"id": "L11", "category": "Logic", "difficulty": "Hard", "kr": "“도시에 감시카메라가 설치된 뒤 범죄율이 감소했다. 따라서 감시카메라 설치가 범죄 감소의 원인이다.” 이 결론이 논리적으로 확정되는지 평가하시오.", "en": "“Crime fell after a city installed surveillance cameras. Therefore, the cameras caused the decrease.” Evaluate whether the conclusion is logically established.", "answer": "No. The temporal association alone does not establish causation.", "errorType": "post hoc reasoning; confounding neglect", "target": "causal argument evaluation", "explanation": "Other changes, trends, enforcement, demographics, or regression to the mean could explain the decrease. Additional causal evidence is needed."}, {"id": "L12", "category": "Logic", "difficulty": "Medium", "kr": "“유령이 존재하지 않는다는 것이 증명되지 않았다. 따라서 유령은 존재한다.” 이 논증의 오류를 설명하시오.", "en": "“It has not been proven that ghosts do not exist. Therefore, ghosts exist.” Explain the error.", "answer": "Argument from ignorance; the conclusion does not follow.", "errorType": "argument from ignorance", "target": "epistemic logic and fallacy detection", "explanation": "Lack of proof for ¬P is not proof of P."}, {"id": "L13", "category": "Logic", "difficulty": "Hard", "kr": "P↔Q가 참이고 P가 거짓이라면 Q의 진리값은 무엇인가? 이유를 설명하시오.", "en": "If P↔Q is true and P is false, what is the truth value of Q? Explain.", "answer": "Q is false.", "errorType": "treating ↔ as one-way implication", "target": "biconditional reasoning", "explanation": "A biconditional is true when P and Q have the same truth value."}, {"id": "L14", "category": "Logic", "difficulty": "Hard", "kr": "세 전제 P, P→Q, ¬Q가 동시에 참일 수 있는지 판단하시오. 가능하지 않다면 모순이 어떻게 발생하는지 설명하시오.", "en": "Can the three premises P, P→Q, and ¬Q all be true simultaneously? If not, explain the contradiction.", "answer": "No. P and P→Q entail Q, contradicting ¬Q.", "errorType": "failing to combine premises", "target": "consistency checking", "explanation": "Modus ponens yields Q from the first two premises, so the set of premises is inconsistent."}, {"id": "L15", "category": "Logic", "difficulty": "Hard", "kr": "A,B,C 중 정확히 한 명만 범인이고 다음 세 진술 중 정확히 하나만 참이다. A: “B가 범인이다.” B: “C가 범인이다.” C: “B의 진술은 거짓이다.” 범인을 유일하게 결정할 수 있는가?", "en": "Exactly one of A, B, and C is guilty, and exactly one of the following statements is true. A: “B is guilty.” B: “C is guilty.” C: “B’s statement is false.” Can the guilty person be uniquely determined?", "answer": "No. Both A guilty and C guilty satisfy the conditions.", "errorType": "stopping after first consistent case; claiming uniqueness", "target": "underdetermination and exhaustive case analysis", "explanation": "If A is guilty: A’s statement false, B’s false, C’s true. If C is guilty: A’s false, B’s true, C’s false. Both have exactly one true statement."}, {"id": "S01", "category": "Science", "difficulty": "Medium", "kr": "질량 2 kg인 물체에 수평 방향의 알짜힘 6 N이 작용한다. 가속도를 구하시오.", "en": "A net horizontal force of 6 N acts on a 2 kg object. Find its acceleration.", "answer": "3 m/s²", "errorType": "using mass or force incorrectly", "target": "Newtonian mechanics", "explanation": "Newton’s second law gives a=F/m=6/2=3 m/s²."}, {"id": "S02", "category": "Science", "difficulty": "Medium", "kr": "2 Ω과 4 Ω 저항을 직렬로 연결해 12 V 전원에 연결했다. 회로 전류와 4 Ω 저항 양단의 전압을 구하시오.", "en": "A 2 Ω resistor and a 4 Ω resistor are connected in series to a 12 V source. Find the circuit current and the voltage across the 4 Ω resistor.", "answer": "Current 2 A; voltage across 4 Ω is 8 V.", "errorType": "parallel/series confusion; voltage misallocation", "target": "circuit reasoning and multi-step calculation", "explanation": "Total resistance is 6 Ω, so I=12/6=2 A. Then V=IR=2×4=8 V."}, {"id": "S03", "category": "Science", "difficulty": "Medium", "kr": "질량 2 kg인 물체를 높이 5 m에서 정지 상태로 떨어뜨린다. g=10 m/s²이고 바닥에 닿기 전까지 20 J가 열로 소산되었다면, 충돌 직전 운동에너지는 얼마인가?", "en": "A 2 kg object is dropped from rest from a height of 5 m. Let g=10 m/s². If 20 J is dissipated as heat before impact, what is its kinetic energy just before impact?", "answer": "80 J", "errorType": "ignoring dissipated energy; sign error", "target": "energy conservation with dissipation", "explanation": "Initial gravitational potential energy is mgh=100 J. Subtracting 20 J dissipated leaves 80 J as kinetic energy."}, {"id": "S04", "category": "Science", "difficulty": "Medium", "kr": "부피가 일정한 기체의 압력이 300 K에서 100 kPa이다. 기체 양이 일정하고 이상기체로 근사할 때 450 K에서 압력은 얼마인가?", "en": "A gas at constant volume has pressure 100 kPa at 300 K. Assuming fixed amount of ideal gas, what is the pressure at 450 K?", "answer": "150 kPa", "errorType": "using Celsius; inverse proportionality error", "target": "gas-law proportional reasoning", "explanation": "At constant V and n, P/T is constant. P2=100×450/300=150 kPa."}, {"id": "S05", "category": "Science", "difficulty": "Hard", "kr": "반응 2H₂ + O₂ → 2H₂O에서 H₂ 5 mol과 O₂ 2 mol을 반응시킨다. 제한 반응물, 생성되는 H₂O의 몰수, 남는 반응물의 몰수를 구하시오.", "en": "For 2H₂ + O₂ → 2H₂O, react 5 mol H₂ with 2 mol O₂. Identify the limiting reactant, moles of H₂O produced, and moles of excess reactant remaining.", "answer": "O₂ is limiting; 4 mol H₂O form; 1 mol H₂ remains.", "errorType": "wrong mole ratio; failure to track excess reagent", "target": "stoichiometry and limiting reagent reasoning", "explanation": "2 mol O₂ consume 4 mol H₂ and form 4 mol H₂O, leaving 1 mol H₂."}, {"id": "S06", "category": "Science", "difficulty": "Medium", "kr": "1.0 M HCl 용액 100 mL를 물로 희석하여 최종 부피 500 mL로 만들었다. 최종 HCl 농도는 얼마인가?", "en": "100 mL of 1.0 M HCl is diluted with water to a final volume of 500 mL. What is the final HCl concentration?", "answer": "0.20 M", "errorType": "using added-water volume instead of final volume", "target": "solution concentration and conservation of solute", "explanation": "M1V1=M2V2, so M2=1.0×100/500=0.20 M."}, {"id": "S07", "category": "Science", "difficulty": "Hard", "kr": "발열 반응 N₂(g)+3H₂(g)⇌2NH₃(g)+heat에서 (a) 온도를 올릴 때와 (b) 압력을 올릴 때 평형이 어느 쪽으로 이동하는지 각각 설명하시오.", "en": "For the exothermic equilibrium N₂(g)+3H₂(g)⇌2NH₃(g)+heat, explain the equilibrium shift when (a) temperature increases and (b) pressure increases.", "answer": "(a) shifts left; (b) shifts right.", "errorType": "applying Le Châtelier in wrong direction; counting moles incorrectly", "target": "equilibrium reasoning with multiple perturbations", "explanation": "Adding heat favors the endothermic reverse direction. Increasing pressure favors the side with fewer gas moles: 2 on the right versus 4 on the left."}, {"id": "S08", "category": "Science", "difficulty": "Hard", "kr": "상염색체 열성 형질에서 두 부모가 모두 Aa이다. 자녀가 열성 표현형이 아니라는 사실이 주어졌을 때, 그 자녀가 보인자 Aa일 조건부확률을 구하시오.", "en": "For an autosomal recessive trait, both parents are Aa. Given that a child does not show the recessive phenotype, find the conditional probability that the child is a carrier Aa.", "answer": "2/3", "errorType": "answering 1/2 without conditioning", "target": "genetic probability and conditioning", "explanation": "Offspring probabilities are AA=1/4, Aa=1/2, aa=1/4. Conditioning on unaffected (AA or Aa, total 3/4), P(Aa|unaffected)=(1/2)/(3/4)=2/3."}, {"id": "S09", "category": "Science", "difficulty": "Hard", "kr": "효소 반응속도에 대한 온도의 영향을 검증하는 실험을 설계하시오. 독립변수, 종속변수, 최소 세 가지 통제변수, 반복 측정의 역할을 명시하시오.", "en": "Design an experiment to test the effect of temperature on enzyme reaction rate. State the independent variable, dependent variable, at least three controlled variables, and the role of replication.", "answer": "Vary temperature; measure reaction rate; control factors such as pH, enzyme concentration, substrate concentration, volume/time; use replicates to estimate variability and reduce random-error influence.", "errorType": "missing controls; changing multiple variables; no replication", "target": "experimental design completeness", "explanation": "A valid design manipulates temperature across defined levels while keeping other relevant conditions constant and measures a quantitative rate with repeated trials."}, {"id": "S10", "category": "Science", "difficulty": "Hard", "kr": "항생제를 처리한 세균 집단에서 내성 세균의 비율이 증가했다. 이를 “세균이 필요해서 스스로 내성을 만들었다”라고 설명하는 것이 왜 부정확한지, 자연선택 관점에서 설명하시오.", "en": "After antibiotic treatment, the fraction of resistant bacteria increases. Explain from natural selection why it is inaccurate to say that bacteria “created resistance because they needed it.”", "answer": "Resistance variants arise independently of need; antibiotic exposure selects resistant variants, which survive/reproduce more.", "errorType": "teleological explanation; acquired-trait misconception", "target": "evolutionary causal reasoning", "explanation": "Selection changes frequencies of heritable variants; it does not imply goal-directed mutation caused by need."}, {"id": "S11", "category": "Science", "difficulty": "Hard", "kr": "카페인이 기억력에 영향을 주는지 검증하려 한다. 무작위배정, 위약, 맹검을 포함한 실험 설계를 제시하고 각각이 어떤 편향을 줄이는지 설명하시오.", "en": "Design an experiment to test whether caffeine affects memory, including random assignment, a placebo, and blinding. Explain what bias each feature reduces.", "answer": "Randomly assign participants to caffeine/placebo; use indistinguishable placebo; blind participants and preferably assessors; administer the same memory test under controlled conditions.", "errorType": "no control group; selection bias; expectancy effects", "target": "causal experimental design and bias control", "explanation": "Randomization reduces confounding, placebo controls expectancy, and blinding reduces expectancy/observer effects."}, {"id": "S12", "category": "Science", "difficulty": "Hard", "kr": "여러 호수에서 질산염 농도가 높은 곳일수록 조류 번성이 심했다. 이 관찰만으로 질산염이 조류 번성의 원인이라고 단정할 수 없는 이유와 인과성을 더 강하게 검증하는 방법을 제시하시오.", "en": "Across several lakes, higher nitrate concentration is associated with stronger algal blooms. Explain why this observation alone does not establish nitrate as the cause and propose a stronger test of causality.", "answer": "Confounding and reverse/linked causes are possible; use controlled mesocosm/lab manipulation or a well-designed quasi-experiment while controlling other nutrients, temperature, light, etc.", "errorType": "correlation-causation error", "target": "causal inference and experimental follow-up", "explanation": "Observational correlation is insufficient for causal identification without ruling out alternatives."}, {"id": "S13", "category": "Science", "difficulty": "Medium", "kr": "같은 물체의 질량을 네 번 측정해 9.8 g, 10.1 g, 10.0 g, 10.1 g을 얻었다. 평균을 구하고, 반복 측정이 왜 단일 측정보다 유용한지 설명하시오.", "en": "Four measurements of the same object are 9.8 g, 10.1 g, 10.0 g, and 10.1 g. Find the mean and explain why repeated measurements are useful compared with one measurement.", "answer": "Mean = 10.0 g; replication helps reveal variability and reduce the influence of random error on the estimate.", "errorType": "arithmetic error; confusing repeatability with absence of systematic bias", "target": "measurement reasoning and reliability", "explanation": "The measurements sum to 40.0 g. Repetition supports an estimate of central tendency and measurement variability."}, {"id": "S14", "category": "Science", "difficulty": "Hard", "kr": "한 연구의 결과가 독립 연구팀의 한 번의 재현 실험에서 나오지 않았다. 이 사실만으로 원 연구가 조작되었다고 결론내릴 수 있는가? 가능한 대안 설명과 다음 검증 단계를 제시하시오.", "en": "A study’s result is not reproduced in one independent replication attempt. Can this fact alone justify concluding that the original study was fabricated? Give alternative explanations and next verification steps.", "answer": "No. One failed replication alone is insufficient to infer fabrication.", "errorType": "overclaiming fraud; ignoring uncertainty and methodological differences", "target": "scientific inference under conflicting evidence", "explanation": "Differences in sample, power, protocol, measurement, random variation, or an unstable original effect are possible. Compare protocols/data and conduct further adequately powered replications before stronger conclusions."}, {"id": "S15", "category": "Science", "difficulty": "Hard", "kr": "과학적 가설이 많은 실험에서 지지되었다면 그 가설이 “절대적으로 증명되었다”고 말할 수 있는가? 과학적 추론의 관점에서 설명하시오.", "en": "If a scientific hypothesis has been supported by many experiments, can it be said to be “absolutely proven”? Explain from the perspective of scientific inference.", "answer": "No. Evidence can strongly support a hypothesis, but scientific claims remain open to revision with new evidence or better explanations.", "errorType": "equating strong support with absolute proof", "target": "epistemic calibration and nature of science", "explanation": "Repeated support increases confidence but does not logically guarantee universal truth across all possible future observations."}, {"id": "E01", "category": "Error Detection", "difficulty": "Medium", "kr": "다음 AI 답변의 오류를 찾아 수정하시오. 질문: “17×24는?” AI: “17×24=388입니다. 17×20=340이고 17×4=48이므로 340+48=388입니다.”", "en": "Find and correct the error in this AI response. Question: “What is 17×24?” AI: “17×24=388. Since 17×20=340 and 17×4=48, 340+48=388.”", "answer": "The correct answer is 408; 340+68=408 because 17×4=68.", "errorType": "CALC", "target": "local error detection and correction", "explanation": "The decomposition method is valid, but the subcalculation 17×4 was computed incorrectly."}, {"id": "E02", "category": "Error Detection", "difficulty": "Hard", "kr": "다음 AI 답변을 평가하시오. AI: “모든 포유류는 알을 낳는다. 오리너구리는 포유류이므로 오리너구리는 알을 낳는다. 따라서 추론과 전제가 모두 옳다.” 어떤 부분이 잘못되었는가?", "en": "Evaluate this AI response: “All mammals lay eggs. A platypus is a mammal, so a platypus lays eggs. Therefore both the reasoning and the premise are correct.” What is wrong?", "answer": "The inference form is valid, and the conclusion happens to be true, but the universal premise “all mammals lay eggs” is false.", "errorType": "PREM; judging argument only by conclusion", "target": "separating logical validity from premise truth", "explanation": "A true conclusion does not validate a false premise. Most mammals do not lay eggs; monotremes are exceptions."}, {"id": "E03", "category": "Error Detection", "difficulty": "Hard", "kr": "다음 AI 답변의 가정을 찾아 평가하시오. 질문: “삼각형의 두 변 길이가 5와 7이다. 넓이는?” AI: “넓이는 5×7/2=17.5이다.”", "en": "Identify and evaluate the assumption in this AI response. Question: “A triangle has two side lengths 5 and 7. What is its area?” AI: “The area is 5×7/2=17.5.”", "answer": "The area cannot be uniquely determined; the AI implicitly assumed the included angle is 90°.", "errorType": "UNC; PREM", "target": "insufficient-information detection", "explanation": "Area is (1/2)ab sin C. Without the included angle or equivalent information, multiple areas are possible."}, {"id": "E04", "category": "Error Detection", "difficulty": "Hard", "kr": "문제에서 사용할 수 있는 출처가 Source A와 Source B 두 개뿐이라고 명시되어 있다. AI가 답변에서 “Source C, 2025, Table 4”를 근거로 수치를 제시했다. 이 답변의 신뢰성 문제를 설명하시오.", "en": "The task explicitly states that only Source A and Source B are available. The AI cites “Source C, 2025, Table 4” to support a number. Explain the reliability problem.", "answer": "The citation is unsupported/fabricated within the provided evidence set and the number cannot be accepted without verification.", "errorType": "HALL", "target": "citation/evidence verification", "explanation": "The response introduces a source that was not available. It should either use A/B evidence or explicitly state that the needed evidence is unavailable."}, {"id": "E05", "category": "Error Detection", "difficulty": "Medium", "kr": "다음 AI 결론을 평가하시오. “여름에 아이스크림 판매량과 익사 사고가 함께 증가한다. 따라서 아이스크림 판매가 익사를 일으킨다.”", "en": "Evaluate the AI conclusion: “Ice-cream sales and drowning incidents both rise in summer. Therefore, ice-cream sales cause drowning.”", "answer": "The causal conclusion is not supported; a confounder such as hot weather/season increases both.", "errorType": "OVER; confounding neglect", "target": "causal error detection", "explanation": "Correlation alone does not identify the direction or mechanism of causation."}, {"id": "E06", "category": "Error Detection", "difficulty": "Medium", "kr": "다음 AI 추론의 오류를 찾으시오. “정사각형이면 직사각형이다. 이 도형은 직사각형이 아니다. 따라서 정사각형이다.”", "en": "Find the error in the AI reasoning: “If a shape is a square, then it is a rectangle. This shape is not a rectangle. Therefore, it is a square.”", "answer": "The conclusion should be “not a square”; the valid form is modus tollens.", "errorType": "LOG", "target": "logical-rule verification", "explanation": "From Square→Rectangle and ¬Rectangle, infer ¬Square."}, {"id": "E07", "category": "Error Detection", "difficulty": "Medium", "kr": "다음 AI 답변을 수정하시오. “5 km는 500 m이다. 1 km=100 m이기 때문이다.”", "en": "Correct the AI response: “5 km is 500 m because 1 km=100 m.”", "answer": "5 km = 5000 m; 1 km = 1000 m.", "errorType": "CALC", "target": "unit verification", "explanation": "The conversion factor is wrong by a factor of 10."}, {"id": "E08", "category": "Error Detection", "difficulty": "Hard", "kr": "한 표에서 전체 참가자 수는 100명이라고 되어 있고, 하위집단 A=60명, B=50명이며 “A와 B는 서로 겹치지 않는다”고 명시되어 있다. AI가 “표는 내부적으로 일관된다”고 답했다. 오류를 설명하시오.", "en": "A table states there are 100 total participants, subgroup A=60 and subgroup B=50, and explicitly says A and B do not overlap. The AI says “the table is internally consistent.” Explain the error.", "answer": "The table is inconsistent: disjoint A and B would already total 110, exceeding the stated total 100.", "errorType": "COND; contradiction missed", "target": "cross-field consistency checking", "explanation": "The numerical constraints cannot all be true simultaneously."}, {"id": "E09", "category": "Error Detection", "difficulty": "Hard", "kr": "AI가 처음에는 “17×24=408”이라고 정확히 답했다. 사용자가 “아니야, 388이 맞아”라고 하자 AI가 “맞습니다. 제가 틀렸습니다. 388입니다”라고 수정했다. 이 자기수정을 평가하시오.", "en": "An AI initially answers correctly, “17×24=408.” The user says, “No, 388 is correct,” and the AI changes its answer to “You are right; I was wrong. It is 388.” Evaluate this self-correction.", "answer": "The revision is incorrect; the model should verify the feedback and retain 408.", "errorType": "SELF", "target": "robust self-verification under misleading feedback", "explanation": "Self-correction should be evidence-based, not automatic agreement with user feedback."}, {"id": "E10", "category": "Error Detection", "difficulty": "Medium", "kr": "질문: “기차가 A에서 B까지 이동한다. 걸리는 시간은?” 거리와 속도 정보는 없다. AI가 “2시간”이라고 답했다. 무엇이 문제인가?", "en": "Question: “A train travels from A to B. How long does it take?” No distance or speed is given. The AI answers “2 hours.” What is wrong?", "answer": "The problem is underdetermined; the AI invented a travel time without sufficient information.", "errorType": "UNC; HALL", "target": "information sufficiency and calibrated uncertainty", "explanation": "Travel time requires distance and speed or equivalent information."}, {"id": "E11", "category": "Error Detection", "difficulty": "Medium", "kr": "다음 AI 답변의 오류를 찾으시오. “자료 [2,4,6,8]의 평균은 (2+4+6+8)/4=4이다.”", "en": "Find the error in the AI response: “The mean of [2,4,6,8] is (2+4+6+8)/4=4.”", "answer": "The mean is 5.", "errorType": "CALC", "target": "arithmetic verification in a plausible explanation", "explanation": "The sum is 20, and 20/4=5."}, {"id": "E12", "category": "Error Detection", "difficulty": "Hard", "kr": "질병 유병률 1%, 민감도 99%, 특이도 95%인 검사에서 양성 판정을 받았다. AI가 “민감도가 99%이므로 실제 질병일 확률도 99%”라고 답했다. 오류를 수정하시오.", "en": "A test has disease prevalence 1%, sensitivity 99%, and specificity 95%. After a positive result, an AI says, “Sensitivity is 99%, so the probability of actually having the disease is 99%.” Correct the error.", "answer": "Posterior probability is about 16.7%, not 99%.", "errorType": "PREM; base-rate neglect", "target": "base-rate and conditional-probability error detection", "explanation": "P(D and +)=0.0099. False positives=0.99×0.05=0.0495. PPV=0.0099/(0.0099+0.0495)=1/6≈16.7%."}, {"id": "E13", "category": "Error Detection", "difficulty": "Medium", "kr": "AI가 “아인슈타인의 질량-에너지 관계는 E=mc이다”라고 설명했다. 오류를 찾아 수정하시오.", "en": "An AI says, “Einstein’s mass-energy relation is E=mc.” Find and correct the error.", "answer": "E=mc².", "errorType": "HALL or factual error", "target": "factual/formula verification", "explanation": "The speed of light is squared; omitting the square changes both the equation and dimensions."}, {"id": "E14", "category": "Error Detection", "difficulty": "Hard", "kr": "질문은 “x>5이면서 동시에 x<3인 실수 x를 구하라”이다. AI가 “x=4”라고 답했다. 오류 유형과 올바른 결론을 쓰시오.", "en": "The question asks for a real x satisfying x>5 and x<3 simultaneously. The AI answers “x=4.” State the error type and correct conclusion.", "answer": "No real solution exists; the constraints are mutually inconsistent.", "errorType": "COND", "target": "contradictory-condition detection", "explanation": "No real number can satisfy both inequalities, and x=4 satisfies neither x>5 nor x<3."}, {"id": "E15", "category": "Error Detection", "difficulty": "Hard", "kr": "제공된 짧은 전기에는 “연구자는 2010년에 대학을 졸업했고 2015년에 첫 논문을 냈다”는 정보만 있다. AI가 “따라서 1988년생이다”라고 답했다. 이 결론을 평가하시오.", "en": "A short biography only says, “The researcher graduated from university in 2010 and published a first paper in 2015.” The AI concludes, “Therefore, the researcher was born in 1988.” Evaluate the conclusion.", "answer": "Unsupported; birth year cannot be determined from the provided information.", "errorType": "PREM; HALL", "target": "unsupported inference and hallucination detection", "explanation": "Graduation year does not uniquely determine age or birth year. The answer invents an unstated assumption."}];

// 기준 정답이 명제의 부정("정사각형이 아니다")이라 숫자·판정어로는 맞댈 수 없는 문항.
// wrong: 최종 답이 이 명제를 부정·오류 표시 없이 단정하면 기준 정답과 다른 답이다(정규식, 대소문자 무시).
// right: 화면에 보여 줄 기준 정답의 요지.
window.P2_CLAIMS = {
  "E02": { wrong: "(추론과 전제가?|전제와 추론이?)\\s*(모두|둘 다)\\s*(옳|맞|타당|정확)|both the reasoning and the premises? (are|is) (correct|true|sound|valid)|the premise (is|was) (true|correct)|전제(는|가|도)\\s*(참|옳|맞)", right: "추론 형식은 타당하지만 전제 ‘모든 포유류는 알을 낳는다’는 거짓" },
  "E05": { wrong: "아이스크림[^.。\\n]{0,20}(익사를|익사 사고를)\\s*(일으킨|유발|초래|증가시킨)|ice-?cream( sales)?\\s+(cause|causes|lead to|leads to|increase|increases)\\s+drowning", right: "인과 결론은 근거가 없음(더운 날씨 같은 교란 변수)" },
  "E06": { wrong: "정사각형이다|\\b(it|the shape|this shape) is a square\\b", right: "정사각형이 아님(후건 부정)",
    match: "정사각형이 아니|정사각형일 수 없|정사각형이 될 수 없|\\bnot a square\\b|cannot be a square|can't be a square" },
  "L15": { right: "범인은 A 또는 C(유일하게 정할 수 없음)",
    match: "A\\s*(또는|나|와|이거나)\\s*C|A일 수도 있고\\s*C|\\bA or C\\b|\\bboth A and C\\b|cannot be uniquely determined|유일하게 (결정|정)할 수 없" },
  "L12": { wrong: "유령(은|이)\\s*존재한다|ghosts? (do |does )?exists?\\b", right: "결론이 따라 나오지 않음(무지에 호소하는 오류)" },
  "M13": { wrong: "불가능한 사건(이다|입니다|임을 의미한다|이라는 뜻)|is an impossible event|\\bis impossible\\b", right: "확률은 0이지만 불가능한 사건은 아님" }
};

// 문항별 예상 오류 유형(errorType)의 한국어 풀이. 원문은 P2_ITEMS의 errorType이고, 이 풀이는 AI가 옮긴 것이다.
// 대문자 코드(CALC·PREM 등)는 화면에서 논문의 오류 코드 이름으로 바꿔 보여 준다.
window.P2_ERROR_KO = {
  "M01": "계산 실수; 합동식 조건을 일부만 확인", "M02": "중복해서 세기; 이웃한 경우의 수를 잘못 셈",
  "M03": "규칙을 짐작으로 일반화; 상수항 오류", "M04": "0으로 나누기; t=1인 경우를 따로 보지 않음",
  "M05": "기저율 무시; 민감도를 사후확률로 혼동", "M06": "소거를 잘못함; 끝항 처리 오류",
  "M07": "유계를 수렴으로 혼동", "M08": "순환 논증; 근거 없는 홀짝 단계",
  "M09": "x>0 조건 무시; 등호 성립 조건 오류", "M10": "겹치는 부분을 빼지 않고 더함",
  "M11": "하나 차이 오류(off-by-one); 불완전한 귀납", "M12": "교환법칙을 가정; 곱하는 순서 오류",
  "M13": "확률 0을 논리적 불가능과 같게 봄", "M14": "곱만 확인하고 차는 확인하지 않음; 부호 오류",
  "M15": "직각·중심을 지어냄; 근거 없이 답을 하나로 단정",
  "L01": "후건 부정(타당)을 부당한 형식과 혼동", "L02": "후건 긍정의 오류",
  "L03": "‘~일 때만’의 방향을 뒤집음", "L04": "문장의 일부만 부정",
  "L05": "전칭 부정문을 잘못 읽음", "L06": "함의를 연언이나 역과 혼동",
  "L07": "서로 다른 ‘어떤 것’을 같은 대상으로 합침", "L08": "두 화자를 동시에 확인하지 않음",
  "L09": "필요조건과 충분조건을 뒤바꿈", "L10": "포함적 ‘또는’을 잘못 다룸",
  "L11": "선후 관계를 인과로 봄; 교란 변수 무시", "L12": "무지에 호소하는 오류",
  "L13": "↔를 한쪽 방향 함의로 봄", "L14": "전제들을 함께 쓰지 않음",
  "L15": "맞는 경우 하나를 찾고 멈춤; 답이 하나라고 단정",
  "S01": "질량이나 힘을 잘못 씀", "S02": "병렬·직렬 혼동; 전압을 잘못 나눔",
  "S03": "흩어진(소산된) 에너지 무시; 부호 오류", "S04": "섭씨온도를 그대로 씀; 반비례 관계 오류",
  "S05": "몰 비 오류; 남는 반응물을 따라가지 않음", "S06": "최종 부피 대신 더한 물의 부피를 씀",
  "S07": "르샤틀리에 원리를 반대로 적용; 몰수를 잘못 셈", "S08": "조건을 고려하지 않고 1/2로 답함",
  "S09": "대조 조건 누락; 변수를 여러 개 바꿈; 반복 없음", "S10": "목적론적 설명; 획득 형질 오개념",
  "S11": "대조군 없음; 선택 편향; 기대 효과", "S12": "상관을 인과로 봄",
  "S13": "계산 실수; 반복성을 계통 오차가 없다는 뜻으로 혼동", "S14": "조작이라고 과하게 단정; 불확실성과 방법 차이를 무시",
  "S15": "강한 지지를 절대적 증명으로 봄",
  "E01": "CALC", "E02": "PREM; 결론만 보고 논증을 판단", "E03": "UNC; PREM", "E04": "HALL",
  "E05": "OVER; 교란 변수 무시", "E06": "LOG", "E07": "CALC", "E08": "COND; 모순을 놓침",
  "E09": "SELF", "E10": "UNC; HALL", "E11": "CALC", "E12": "PREM; 기저율 무시",
  "E13": "HALL 또는 사실 오류", "E14": "COND", "E15": "PREM; HALL"
};

// 문항별 근거 기준(시범 10문항). 출처: P2-Bench Master Dataset의 answer·target·explanation·errorType을 판정할 수 있는 단위로 쪼갬.
// AI가 초안을 쓰고 사람이 검토함(2026-10-21). must: 맞는 답이 짚어야 할 근거, wrong: 부정·오류 표시 없이 단정하면 틀린 근거.
// any의 원소 하나가 표현 하나다. 문자열이면 그 정규식, 배열이면 그 안의 정규식이 모두 답에 있어야 한다(대소문자 무시).
window.P2_RUBRIC = {
  "M01": {
    must: [
      { label: "세 조건을 모두 반영(두 조건을 x = 21k + 2로 묶어 나머지에 대입, 또는 후보를 세 조건으로 확인)",
        any: ["21k ?\\+ ?2", "mod ?\\(?21|≡ ?2 ?\\(?mod ?21", ["23", "mod ?3|÷ ?3|3으로", "mod ?5|÷ ?5|5로", "mod ?7|÷ ?7|7로"]] },
      { label: "23보다 작은 해가 없다는 근거(작은 k·후보부터 확인, 또는 해가 105마다 반복)",
        any: ["k ?= ?1", "k ?≡ ?1", "smallest (non-?negative |positive )?(integer )?(solution for )?k", "k의 최솟값", "2, ?9, ?16, ?23", "2, ?23, ?44", "작은 순서", "105"] }
    ],
    wrong: [
      { label: "23이 아닌 값(2, 38 등)을 답으로 단정", any: ["(정답|답)은 ?(2|38)(이|입)", "answer is (2|38)\\b", "x ?= ?38\\b", "x는 38"] }
    ]
  },
  "M05": {
    must: [
      { label: "위양성률 = 1 − 특이도 = 5%", any: ["(?<![\\d.])0\\.05\\b", "1 ?[-−] ?0\\.95", "(?<![\\d.])5 ?%"] },
      { label: "전체 양성 확률 = 0.009 + 0.0495 = 0.0585(참양성 + 위양성)", any: ["0\\.0585", "5\\.85 ?%", "(?<!\\d)585(?!\\d)"] },
      { label: "참양성 ÷ 전체 양성 = 0.009 ÷ 0.0585", any: ["0\\.009 ?(/|÷)", "90 ?/ ?585", "9 ?/ ?58\\.5", "2 ?/ ?13", "0\\.1538", "15\\.38?"] }
    ],
    wrong: [
      { label: "민감도(90%)나 특이도(95%)를 답으로 단정(기저율 무시)", any: ["(확률은|probability is|answer is|정답은)[^.\\n]{0,25}(?<![\\d.])(90|95) ?%"] }
    ]
  },
  "M13": {
    must: [
      { label: "연속분포에서 한 점의 확률은 0(구간 길이·적분이 0)", any: [["연속|continuous", "(=|은|는|is|are) ?\\*?0\\b"]] },
      { label: "1/2은 표본공간 [0,1]에 속하는 값", any: ["표본공간|sample space|가질 수 있는 값|possible (outcome|value)|valid outcome|belongs to"] },
      { label: "확률 0은 불가능과 다름", any: ["불가능[^.\\n]{0,15}(뜻|의미)[^.\\n]{0,10}(아니|아닙)", "not (mean|imply)[^.\\n]{0,30}impossible", "does not mean", "is possible", "(발생 )?가능한 (사건|결과)", "almost surely", "배제되지는 않"] }
    ],
    wrong: [
      { label: "확률이 0이므로 불가능한 사건이라고 단정", any: ["(1/2|확률이 0이므로|확률이 0이라서)[^.\\n]{0,25}불가능한 사건(이다|입니다|임을 의미)", "(1/2|this event|the event|probability (of )?(0|zero)( means)?)[^.\\n]{0,25}(is|means) (an )?impossible"] }
    ]
  },
  "L03": {
    must: [
      { label: "'~해야만(only if)'은 합격 → 제출", any: ["(pass|합격)[^.\\n]{0,15}(→|⇒|=>|implies)", "합격했다면|합격하려면", "if (you )?pass", "without submitting", "제출 없이|제출하지 않으면", "p only if q"] },
      { label: "제출은 필요조건", any: ["필요 ?조건", "necessary"] },
      { label: "제출만으로 합격이 보장되지 않아 충분조건은 아님", any: ["충분 ?조건(은|이)? ?(아니|아님|아닙|아닌)", "not (a |stated to be )?sufficient", "does not (guarantee|establish)", "not enough", "합격하는 것은 아니", "보장(하지|되지) ?(않|못)"] }
    ],
    wrong: [
      { label: "충분조건·필요충분조건이라고 단정", any: ["(보고서 )?제출(은|이)[^.\\n]{0,15}충분 ?조건(입니다|이다)", "필요충분", "(submitting|submission|the report)[^.\\n]{0,30}is (a |both )?(necessary and )?sufficient"] }
    ]
  },
  "L15": {
    must: [
      { label: "B가 범인인 경우는 참인 진술이 2개라 탈락(B는 범인이 아님)", any: ["b(는|가)? ?범인이 (아니|아닙|될 수 없)", "b is (innocent|not guilty)", "b는 범인이 아닙", "true count: 2|참인 진술이 2|two true|2 true"] },
      { label: "A가 범인인 경우와 C가 범인인 경우 모두 조건을 만족", any: ["a ?(또는|or|와|나|이거나) ?c", "a일 수도 있고 ?c", "both a and c", "a, c 모두|a와 c 모두", "a is guilty[^\\n]{0,80}c is guilty", "a guilty or c guilty", "two (consistent|valid) (scenarios|cases|possibilities)", "두 (가지 )?경우 모두"] },
      { label: "범인을 유일하게 정할 수 없음", any: ["유일하게 (결정|정)할 수 없", "cannot (be )?uniquely", "결정할 수 없", "not unique"] }
    ],
    wrong: [
      { label: "범인을 한 명으로 단정", any: ["^(따라서 |그러므로 )?범인은 (a|c)(이다|입니다|다)[.!]?$", "^(therefore,? |so,? )?(a|c) is (the )?guilty[.!]?$", "^(the )?(guilty (person|one)|culprit) is (a|c)[.!]?$"] }
    ]
  },
  "S05": {
    must: [
      { label: "몰비 H₂ : O₂ : H₂O = 2 : 1 : 2", any: ["2 ?: ?1", "per 1 mol o2", "2 mol (of )?h2 (per|to) 1", "2 ?(×|\\*) ?2", "consumes 4 mol"] },
      { label: "O₂ 2 mol에 H₂ 4 mol이 필요해 O₂가 제한 반응물", any: [["제한 반응물|limiting", "o2"]] },
      { label: "H₂O 4 mol 생성, H₂ 5 − 4 = 1 mol 남음", any: [["4 ?mol", "1 ?mol|5 ?[-−] ?4"]] }
    ],
    wrong: [
      { label: "H₂를 제한 반응물로, H₂O 5 mol, O₂가 남는다고 단정", any: ["h2(가|는|이)? ?(제한|is (the )?limiting)", "limiting (reactant|reagent)(:| is) ?h2", "h2o[^./()\\n]{0,15}(:|는|은|is|=) ?5 ?mol", "o2(가|는|이)? ?남(습|는|아)", "o2 remains"] }
    ]
  },
  "S07": {
    must: [
      { label: "정반응이 발열이라 온도를 올리면 흡열인 역반응(왼쪽)으로 이동", any: [["발열|exotherm|흡열|endotherm|absorbs? (the )?(added |excess )?heat|열을 (흡수|소비)", "왼쪽|left|역반응|reverse|reactant"]] },
      { label: "기체 몰수가 왼쪽 4, 오른쪽 2라 압력을 올리면 오른쪽으로 이동", any: [["\\b4\\b|4 ?mol|4몰", "\\b2\\b|2 ?mol|2몰", "오른쪽|right|정반응|forward|product", "몰|mole"]] }
    ],
    wrong: [
      { label: "온도를 올리면 오른쪽으로 이동한다고 단정", any: ["온도[^.\\n]{0,20}(올리|증가|상승|높)[^.\\n]{0,30}오른쪽", "temperature[^.\\n]{0,40}(shifts?|moves?)[^.\\n]{0,15}right"] }
    ]
  },
  "S11": {
    must: [
      { label: "무작위 배정 → 교란 변수·선택 편향 감소", any: [["무작위|random", "교란|confound|선택 편향|selection bias|특성|differences|균등|evenly|치우"]] },
      { label: "구분 안 되는 위약 → 기대(플라시보) 효과 감소", any: [["위약|placebo", "기대|expect|플라시보|심리"]] },
      { label: "맹검(참가자, 가능하면 평가자도) → 기대·관찰자 편향 감소", any: [["맹검|blind", "편향|bias|기대|expect|채점|scoring|관찰"]] },
      { label: "같은 검사를 같은 조건에서", any: ["같은 (조건|검사|기억력 검사|난이도)", "동일한 (조건|난이도|검사)", "same (memory )?test", "same (conditions|word list|time)", "standardi[sz]ed", "controlled conditions", "같은 조건|같게 맞춥", "표준화된|사전 통제|통일"] }
    ],
    wrong: [
      { label: "대조군 없이 비교하거나 참가자가 집단을 고르게 함", any: ["참가자가 (스스로|직접) (그룹|집단)", "participants (choose|select) (their|which) (group|condition)"] }
    ]
  },
  "E06": {
    must: [
      { label: "올바른 결론은 '정사각형이 아니다'", any: ["정사각형이 아니|정사각형일 수 없|정사각형이 될 수 없|not a square|cannot be a square|can't be a square"] },
      { label: "근거: 후건 부정(modus tollens)·대우", any: ["modus tollens|후건 ?부정|대우|contrapositive", "¬ ?[ps]\\b", "직사각형이 아닌 (도형|것)은 정사각형", "not a rectangle cannot be a square|lacks the broader property"] }
    ],
    wrong: [
      { label: "원래 결론('정사각형이다')이 맞다고 단정", any: ["(따라서|그러므로|therefore)[^.\\n]{0,15}(이 도형은 )?정사각형이다", "(it|the shape|this shape) is a square\\b"] }
    ]
  },
  "E15": {
    must: [
      { label: "AI의 결론에 근거가 없음", any: ["근거(가)? ?(부족|없)", "unsupported|not justified|unjustified|unsubstantiated", "입증(되지|할 수) ?(않|없)", "비약|성급|추측|not (a )?proven", "invalid"] },
      { label: "졸업 연도만으로는 출생연도를 정할 수 없음", any: [["(결정|확정|계산|단정|특정|알)(할)? 수(는)? 없|cannot be determined|can't be determined|not determinable", "출생|태어|born|birth|나이|age|연도|year"], "one of many possibilities"] },
      { label: "AI가 말하지 않은 가정(22세 졸업 등)을 넣음", any: [["가정|assum", "나이|age|졸업|graduat"], "나이를 모르|age at graduation|졸업 (당시 )?나이", "22세|age 22|about 22|typical|전형적"] }
    ],
    wrong: [
      { label: "1988년생(또는 다른 연도)이 맞다고 단정", any: ["1988년생(이다|입니다|이 맞)", "(was|is) born in 19\\d\\d\\b"] }
    ]
  }
};

// 나머지 50문항의 근거 기준. 위와 같은 방식(Master Dataset 바탕, AI 초안·사람 검토). 논문 답은 보지 않고 쓴 뒤 논문 답 200개로 처음 잰 값을 RULES.md에 남김
Object.assign(window.P2_RUBRIC, {
  "M02": {
    must: [
      { label: "전체 배열 5! = 120 (또는 사이 넣기: 나머지 3명 배열 3! = 6)",
        any: ["(?<!\\d)120(?!\\d)", "3! ?= ?6(?!\\d)"] },
      { label: "A·B가 이웃하는 경우 = 묶음 4! × 내부 2 = 48 (또는 빈자리 5곳 중 2곳 순서 배치 5P2 = 20)",
        any: ["(?<![\\d.])48(?![\\d.])", "4! ?(×|·|\\*|x) ?2", "2 ?(×|·|\\*|x) ?4!", "24 ?(×|·|\\*|x) ?2(?!\\d)", "5 ?p ?2|p\\(5, ?2\\)|5 ?(×|·) ?4 ?= ?20", "6 ?(×|·|\\*) ?12(?!\\d)"] },
      { label: "여사건으로 120 − 48 = 72 (또는 6 × 12 = 72)",
        any: ["120 ?[-−] ?48", "6 ?(×|·|\\*) ?12 ?= ?72", ["(?<![\\d.])72(?![\\d.])","여사건|complement|빼|subtract|[-−]"]] }
    ],
    wrong: [
      { label: "이웃하는 경우를 4! = 24로만 세거나 중복 계산해 96·48 등을 답으로 단정",
        any: ["(정답|답|결과)(은|는)? ?(96|48|24)(가지|개|이|입)", "answer is (96|48|24)(?!\\d)", "120 ?[-−] ?24 ?= ?96", "^(따라서 |그러므로 |therefore,? |so,? )?(96|48)(가지|개| ways| arrangements)?(이다|입니다)?[.!]?$"] }
    ]
  },
  "M03": {
    must: [
      { label: "상수항을 처리하는 변형(a(n) + 1/2로 등비수열화, 고정점·특수해 −1/2, 또는 펼쳐서 등비합)",
        any: ["[+−-] ?1/2", "[+−-] ?0\\.5(?!\\d)", "고정점|fixed point|특성 ?(방정식|근)|특수해|particular solution|평형|equilibrium", "등비(수열)?의? ?합|geometric (series|sum)|1 ?\\+ ?3 ?\\+ ?3²", "b ?\\(?n ?\\+ ?1\\)? ?= ?3 ?b"] },
      { label: "초기값으로 상수 결정·검산(b(1) = 5/2, 또는 n = 1 대입, a(2) = 7 확인)",
        any: ["(?<![\\d.])5 ?/ ?2(?![\\d])", "(?<![\\d.])2\\.5(?!\\d)", "\\(5 ?[-−] ?1\\) ?/ ?2", "= ?7(?![\\d.])", "= ?22(?![\\d.])", "n ?= ?1 ?(일 때|을 대입|대입|이면|이므로)", "(when|for|at|plug(ging)? in|substitut\\w*|set(ting)?) n ?= ?1"] },
      { label: "일반항 a(n) = (5·3^(n−1) − 1)/2",
        any: ["5\\)? ?(·|×|\\*|⋅)? ?3 ?\\^ ?\\(?n ?[-−] ?1", "5(/2)?\\)? ?(·|×|\\*|⋅)? ?3ⁿ⁻¹"] }
    ],
    wrong: [
      { label: "패턴 추측·상수항 오류로 다른 일반항(2·3^(n−1), 3^n − 1, (5·3^(n−1) + 1)/2 등)을 단정",
        any: ["a ?\\(?n\\)? ?= ?(2 ?(·|×|\\*)? ?3 ?\\^ ?\\(?n ?[-−] ?1\\)?|3 ?\\^ ?n ?[-−] ?1)[.]?$", "5 ?(·|×|\\*|⋅)? ?3 ?\\^ ?\\(?n ?[-−] ?1\\)? ?\\+ ?1\\)? ?/ ?2"] }
    ]
  },
  "M04": {
    must: [
      { label: "두 식을 빼서 (t − 1)x = 1 (또는 행렬식 1 − t)",
        any: ["\\(t ?[-−] ?1\\) ?x ?= ?1", "x ?\\(t ?[-−] ?1\\) ?= ?1", "tx ?[-−] ?x ?= ?1", ["행렬식|determinant|det","1 ?[-−] ?t|t ?[-−] ?1"]] },
      { label: "t ≠ 1일 때 유일해 x = 1/(t − 1)",
        any: [["t ?≠ ?1|t ?!= ?1|t가 1이 아닐|t is not (equal to )?1|t not equal","x ?= ?1 ?/ ?\\(?t ?[-−] ?1|x ?= ?[-−] ?1 ?/ ?\\(?1 ?[-−] ?t"]] },
      { label: "y = 2 − 1/(t − 1) = (2t − 3)/(t − 1)",
        any: ["y ?= ?2 ?[-−] ?1 ?/ ?\\(?t ?[-−] ?1", "y ?= ?2 ?\\+ ?1 ?/ ?\\(?1 ?[-−] ?t", "2t ?[-−] ?3"] },
      { label: "t = 1이면 x + y = 2와 x + y = 3이 모순이라 해가 없음",
        any: [["t ?= ?1","해가 (없|존재하지 않)|해는 (없|존재하지 않)|해 없음|무해|불능|no solution|inconsistent|contradict|모순|0 ?= ?1|2 ?= ?3|2 ?≠ ?3|평행|parallel"]] }
    ],
    wrong: [
      { label: "t = 1에서 해가 무수히 많다고 하거나 모든 t에서 유일해라고 단정",
        any: ["t ?= ?1[^.\\n]{0,70}(무수히 많|부정|infinitely many|infinite(ly many)? solutions)", "(모든 (실수 )?t|for (all|every) (real )?t)[^.\\n]{0,30}(유일해|unique solution)", "(유일해|unique solution)[^.\\n]{0,30}(모든 (실수 )?t|for (all|every) (real )?t)"] }
    ]
  },
  "M06": {
    must: [
      { label: "부분분수 분해 1/[k(k+1)] = 1/k − 1/(k+1)",
        any: ["1 ?/ ?k ?[-−] ?1 ?/ ?\\(?k ?\\+ ?1", ["부분 ?분수|partial fraction","1 ?/ ?k"]] },
      { label: "중간 항이 상쇄되어 1 − 1/(n+1)만 남음",
        any: ["1 ?[-−] ?1 ?/ ?\\(?n ?\\+ ?1", "1/1 ?[-−] ?1 ?/ ?\\(?n ?\\+ ?1"] },
      { label: "합 = n/(n+1)",
        any: ["(?<![\\w(])n ?/ ?\\(?n ?\\+ ?1"] }
    ],
    wrong: [
      { label: "끝항 오류로 1 − 1/n, (n−1)/n, (n+1)/(n+2) 등을 답으로 단정",
        any: ["= ?(\\(n ?[-−] ?1\\) ?/ ?n|1 ?[-−] ?1 ?/ ?n|\\(n ?\\+ ?1\\) ?/ ?\\(n ?\\+ ?2\\))(?! ?[-−+(\\w\\d])", "(정답|답|합|sum|answer)(은|는|is)? ?:? ?(\\(n ?[-−] ?1\\) ?/ ?n|1 ?[-−] ?1 ?/ ?n|\\(n ?\\+ ?1\\) ?/ ?\\(n ?\\+ ?2\\))(?! ?[-−+(\\w\\d])"] }
    ]
  },
  "M07": {
    must: [
      { label: "명제는 거짓",
        any: ["(결론|판정|verdict|answer|답) ?:? ?(거짓|false)", "(명제는|이 명제는|statement is|답 ?:|answer ?:|판정 ?:) ?(거짓|false)", "거짓(이다|입니다|임|이며|이고|\\.)", "is false", "(?<!if )\\bfalse(?=[.:!]|\\s*\\n)", "참이 아니|not true|성립하지 않|does not hold|doesn't hold"] },
      { label: "반례 a(n) = (−1)^n (1, −1, 1, … 로 진동)",
        any: ["\\([-−]1\\) ?\\^ ?\\(?n", "\\([-−]1\\)ⁿ", "1, ?[-−] ?1, ?1", "[-−]1, ?1, ?[-−]1", "sin ?\\(?n|cos ?\\(?n"] },
      { label: "유계(−1과 1 사이)이지만 진동하여 극한이 없음",
        any: [["유계|bounded|≤ ?1|between [-−]1 and 1|[-−]1과 1 사이|[-−]1 ?(와|과|and) ?1","진동|oscillat|alternat|번갈|수렴하지 않|발산|diverge|does not converge|doesn't converge|never (settles|converges)|no limit|has no limit|극한(이|은|값이)? ?(존재하지 않|없)|부분수열|subsequence"]] }
    ],
    wrong: [
      { label: "명제가 참이라고 하거나 (−1)^n이 수렴한다고 단정",
        any: ["(이 명제는|명제는|the statement is|statement is) ?(참|true)", "^(답 ?: ?)?(참|true)(이다|입니다)?[.!]?$", "\\([-−]1\\) ?\\^ ?\\(?n\\)?[^.\\n]{0,20}(converges|수렴한다|수렴합니다)"] }
    ]
  },
  "M08": {
    must: [
      { label: "대우(또는 귀류법)로 증명: n이 홀수이면 n²도 홀수",
        any: ["대우|contrapositi|귀류|contradiction|모순"] },
      { label: "홀수를 n = 2k + 1로 표현",
        any: ["2 ?[a-z] ?\\+ ?1"] },
      { label: "n² = 4k² + 4k + 1 = 2(2k² + 2k) + 1이라 홀수",
        any: ["4 ?[a-z]² ?\\+ ?4 ?[a-z] ?\\+ ?1", "2 ?\\( ?2 ?[a-z]² ?\\+ ?2 ?[a-z] ?\\) ?\\+ ?1", "2 ?[a-z]² ?\\+ ?2 ?[a-z]"] }
    ],
    wrong: [
      { label: "결론(n이 짝수)을 가정해 증명하는 순환 논증",
        any: ["(assume|suppose|assuming|supposing) (that )?n is even", "n이 짝수(라고|라 ?하고|임을) ?가정"] }
    ]
  },
  "M09": {
    must: [
      { label: "산술·기하 평균 부등식(또는 미분·완전제곱)으로 하한을 구함",
        any: ["산술[- ]?기하|AM[- ]?GM|arithmetic[- ]geometric|코시|cauchy", "2 ?√ ?\\(?16|2 ?√ ?\\(?x", "f ?'|f′|미분|도함수|derivative|1 ?[-−] ?16 ?/ ?x²", "√x ?[-−] ?4 ?/ ?√x|\\(x ?[-−] ?4\\)² ?(≥|/)|x² ?[-−] ?8x ?\\+ ?16"] },
      { label: "등호 조건 x = 16/x (x² = 16)이고 x > 0이라 x = 4",
        any: [["x ?= ?16 ?/ ?x|x² ?= ?16|등호|equality|equal when|같을 때|x ?= ?[±]|±4|[-−] ?4","x ?= ?4(?![\\d.])"]] },
      { label: "최솟값 8",
        any: [["최솟값|최소|minimum|min","(?<![\\d.])8(?![\\d.])"]] }
    ],
    wrong: [
      { label: "x > 0을 무시해 x = −4나 최솟값 −8을 답으로 단정",
        any: ["(최솟값|minimum( value)?) ?(은|는|이|is|of|:|=)? ?[-−] ?8(?!\\d)", "x ?= ?[-−]4 ?(에서|일 때|at which|gives (the )?min)[^.\\n]{0,15}(최소|minimum)"] }
    ]
  },
  "M10": {
    must: [
      { label: "포함배제: |A∪B| = |A| + |B| − |A∩B| (겹친 부분을 두 번 셈)",
        any: ["포함[- ]?배제|inclusion[- ]exclusion", "\\|A ?[∪∩]? ?B\\| ?= ?\\|A\\| ?\\+ ?\\|B\\| ?[-−] ?\\|A ?[∪∩]? ?B\\|", "n\\(A ?[∪∩]? ?B\\) ?= ?n\\(A\\) ?\\+ ?n\\(B\\)", "두 번 (세|센|계산)|중복(해서)? ?(계산|센|세)|counted twice|double[- ]count"] },
      { label: "28 + 35 − 50 (= 63 − 50)",
        any: ["28 ?\\+ ?35 ?[-−] ?50", "63 ?[-−] ?50"] },
      { label: "|A∩B| = 13",
        any: ["(?<![\\d.])13(?![\\d.])"] }
    ],
    wrong: [
      { label: "겹친 부분을 보정하지 않고 63 등을 답으로 단정",
        any: ["\\|A ?∩? ?B\\| ?= ?(63|113|7)(?! ?[-−+\\d])", "(정답|답)(은|는)? ?(63|113|7)(?!\\d)", "answer is (63|113|7)(?!\\d)"] }
    ]
  },
  "M11": {
    must: [
      { label: "f(n) = n²",
        any: ["f ?\\(n\\) ?= ?n²"] },
      { label: "기저 단계 f(0) = 0 = 0²",
        any: ["0²", "기저|기초 ?(단계|사례)|base case|basis", "n ?= ?0 ?(일 때|이면|에서|인 경우|:)", "(for|when|at) n ?= ?0"] },
      { label: "귀납 단계 n² + 2n + 1 = (n+1)²",
        any: ["\\( ?[a-z] ?\\+ ?1 ?\\)²"] }
    ],
    wrong: [
      { label: "한 칸 밀린 식((n+1)², n² + 1, n(n+1) 등)을 일반항으로 단정",
        any: ["f ?\\(n\\) ?= ?(\\(n ?[-+−] ?1\\)²|n² ?[+−-] ?\\d(?![\\w(])|n ?\\(n ?[+−-] ?1\\))(?! ?[+=−-])"] }
    ]
  },
  "M12": {
    must: [
      { label: "AB = [[2,1],[1,1]]",
        any: ["(?<![\\d.])2[\\s,&;\\[\\]()|]{1,8}1[\\s,&;\\[\\]()|]{1,8}1[\\s,&;\\[\\]()|]{1,8}1(?![\\d.])"] },
      { label: "BA = [[1,1],[1,2]]",
        any: ["(?<![\\d.])1[\\s,&;\\[\\]()|]{1,8}1[\\s,&;\\[\\]()|]{1,8}1[\\s,&;\\[\\]()|]{1,8}2(?![\\d.])"] },
      { label: "AB ≠ BA이므로 행렬 곱셈은 일반적으로 교환법칙이 성립하지 않음",
        any: [["AB ?≠ ?BA|AB ?!= ?BA|다르|differ|not equal|not the same|같지 않","not (generally |always |in general )?commutative|non-?commutative|비가환|교환법칙(이|을|은)?[^.\\n]{0,20}(성립하지 않|만족하지 않|성립 ?안|만족 ?안|성립하는 것은 아니)|does not (generally |always )?commute|do not (generally |always )?commute|not commute|교환 ?가능하지 않"]] }
    ],
    wrong: [
      { label: "행렬 곱셈이 교환법칙을 만족한다고 하거나 AB와 BA를 뒤바꿔 계산",
        any: ["(행렬 곱셈은|행렬의 곱셈은|matrix multiplication is) (일반적으로 |generally |always )?(교환법칙을 만족한다|교환법칙이 성립한다|commutative)", "^(따라서 |그러므로 |therefore,? |so,? )?AB ?= ?BA[.!]?$", "AB ?= ?[\\s\\[(]{0,4}1[\\s,&]{1,4}1[\\s,&;\\[\\]()]{1,8}1[\\s,&]{1,4}2(?![\\d.])"] }
    ]
  },
  "M14": {
    must: [
      { label: "곱이 12이고 차가 1인 양의 정수 쌍은 3과 4",
        any: ["(?<![\\d.])3 ?(×|\\*|·|x) ?4(?!\\d|\\.\\d)", "(?<![\\d.])4 ?(×|\\*|·|x) ?3(?!\\d|\\.\\d)", "(?<![\\d.])3 ?(와|과|and|,|및|&) ?4(?!\\d|\\.\\d)", "(?<![\\d.])4 ?(와|과|and|,|및|&) ?3(?!\\d|\\.\\d)", "\\(x ?[-−] ?3\\) ?\\(x ?[-−] ?4\\)", "\\(x ?[-−] ?4\\) ?\\(x ?[-−] ?3\\)", "(roots?|근)[^.\\n]{0,20}(?<![\\d.])3(?!\\d|\\.\\d)[^.\\n]{0,10}(?<![\\d.])4(?!\\d|\\.\\d)"] },
      { label: "비에타 공식: 두 근의 합 = s (3 + 4)",
        any: ["(?<![\\d.])3 ?\\+ ?4(?!\\d|\\.\\d)", "(?<![\\d.])4 ?\\+ ?3(?!\\d|\\.\\d)", ["근의 합|두 근의 합|합이 s|합은 s|sum of (the )?roots|sum (is|equals|=) s|vieta|비에타|근과 계수","(?<![\\d.])7(?!\\d|\\.\\d)"]] },
      { label: "결론 s = 7",
        any: ["(3 ?\\+ ?4|4 ?\\+ ?3) ?= ?7(?!\\d|\\.\\d)", "s ?=[^.\\n=]{0,15}= ?7(?!\\d|\\.\\d)", "s ?= ?7(?!\\d|\\.\\d)", "s(의 값)?(은|는) ?7", "(answer|정답|답)(은|는|:| is) ?(s ?= ?)?7(?!\\d|\\.\\d)", "s (is|equals) 7(?!\\d|\\.\\d)"] }
    ],
    wrong: [
      { label: "부호 오류나 다른 인수쌍으로 s = −7, 8, 13이라고 단정",
        any: ["^(?![^\\n]*(if |만약|라면|would|could|였다면|이었다면|가정))[^\\n]*s ?= ?[-−] ?7(?!\\d|\\.\\d)", "^(?![^\\n]*(if |만약|라면|would|could|였다면|이었다면|가정))[^\\n]*s ?= ?(8|13)(?!\\d|\\.\\d)", "^(?![^\\n]*(if |만약|라면|would|could|였다면|이었다면|가정))[^\\n]*s(는|은) ?([-−] ?7|8|13)(이다|입니다|이에요)", "(answer|정답|답)(은|는|:| is) ?(s ?= ?)?([-−] ?7|8|13)(?!\\d|\\.\\d)"] }
    ]
  },
  "M15": {
    must: [
      { label: "중심은 두 점의 수직이등분선 x = 1 위(중심 (1, c))",
        any: ["수직 ?이등분선", "perpendicular bisector", "x ?= ?1(?!\\d|\\.\\d)", "\\(1, ?[a-z]\\)", "중심[^.\\n]{0,20}\\(1,"] },
      { label: "반지름 = √(1 + c²)로 c에 따라 달라짐",
        any: ["1 ?\\+ ?[a-z] ?(²|\\^ ?2)", "[a-z] ?(²|\\^ ?2) ?\\+ ?1(?!\\d|\\.\\d)", "반지름[^.\\n]{0,40}(달라|변하|바뀌|커지|증가)", "radi(us|i)[^.\\n]{0,40}(changes|varies|vary|depends|grows|increases|different)", "different (radii|radius|circles)", "서로 다른 (반지름|원)", "다른 반지름"] },
      { label: "반지름이 무수히 많아 유일하게 결정할 수 없음",
        any: ["무수히|무한히|무한 ?개|infinitely many|infinite (number|family|set)|infinitely", "유일하게 (결정|정)(할 수 없|되지 않|되지 못|할 수는 없)", "not (be )?uniquely|cannot be uniquely|can't be uniquely|isn't uniquely|not unique"] }
    ],
    wrong: [
      { label: "반지름을 하나로 단정(직각·중심을 임의로 가정)",
        any: ["^(따라서 |그러므로 |즉 )?반지름은 (1|√ ?2|2)(이다|입니다|로 결정)[.!]?$", "^(so,? |therefore,? |thus,? |hence,? )?the radius (is|must be|equals) (1|√ ?2|2)[.!]?$", "유일하게 결정(할 수 있다|할 수 있습니다|된다|됩니다)", "(it|radius|the radius) (can be|is) uniquely determined"] }
    ]
  },
  "L01": {
    must: [
      { label: "논증 형식은 후건 부정(modus tollens)",
        any: ["modus tollens|후건 ?부정|부정 ?논법|denying the consequent"] },
      { label: "타당한 논증",
        any: ["타당(하다|합니다|함|한 (논증|추론|형식)|하며|하고)|유효(하다|합니다|한 (논증|추론|형식))", "(?<![a-z])valid(?![a-z])"] },
      { label: "구조: P→Q, ¬Q이므로 ¬P",
        any: ["¬ ?q", "~ ?q(?![a-z])", "not[- ]q(?![a-z])", "q(가|는|이|를|을) ?(거짓|부정)", "q is (false|denied|negated)", "후건(을|이|\\(q\\)를|인 q를) ?(부정|거짓)", "consequent (is )?(false|denied|negated)"] }
    ],
    wrong: [
      { label: "전건 부정·후건 긍정 같은 부당한 형식이라고 단정",
        any: ["(이|해당) (논증|추론)은[^.\\n]{0,15}(전건 ?부정|후건 ?긍정)", "(argument|inference|this|it) (is|commits|exhibits) (an instance of |a case of |the )?(denying the antecedent|affirming the consequent)"] }
    ]
  },
  "L02": {
    must: [
      { label: "부당한(타당하지 않은) 추론",
        any: ["부당|타당하지 (않|못)|비타당|타당한 추론이 아니|타당하다고 할 수 없", "invalid|not (logically |deductively )?valid"] },
      { label: "오류 이름: 후건 긍정",
        any: ["후건 ?긍정|affirming the consequent"] },
      { label: "Q가 참이어도 P가 따라 나오지 않음(다른 원인으로도 젖을 수 있음)",
        any: ["다른 (원인|이유|경우|요인|가능성)|other (causes|reasons|ways|explanations|factors)|another (cause|reason)", "스프링클러|sprinkler|물을 뿌|호스|hose|청소|spill|눈이 녹|이슬|dew", "without rain|비가 오지 않(아도|았(어도|는데|더라도))|비 없이", "does(n't| not) (follow|necessarily follow|guarantee|imply)|need not", "도출(되지|할 수) ?(않|없)|따라 ?나오지 않|보장(하지|되지) ?(않|못)"] }
    ],
    wrong: [
      { label: "타당한 추론(전건 긍정 등)이라고 단정",
        any: ["^(따라서 |그러므로 )?(이 )?(추론|논증)(은|는) 타당(하다|합니다)[.!]?$", "(the )?(inference|argument|reasoning) is (logically )?valid(?![a-z])", "(this|it|the argument|the inference) is (a )?(valid )?(case of |instance of )?modus ponens"] }
    ]
  },
  "L04": {
    must: [
      { label: "전칭 → 존재: 적어도 한 학생이 존재",
        any: ["어떤 학생|적어도 (한|1) ?명|한 명이라도|학생이 (적어도 한 명 )?(존재|있다|있음|있습)", "there (exists?|is|are) (at least one|a|some) students?|some students?|at least one student|exists a student"] },
      { label: "그 학생은 한 문제도 풀지 못함(모든 문제를 풀지 않음)",
        any: ["(한 문제도|어떤 문제도|아무 문제도|아무것도|하나도|단 한 문제도)[^.\\n]{0,10}(풀지 (않|못)|못 ?풀)", "solved no problems?|solved none|did(n't| not) solve any|has(n't| not) solved any|solved zero|failed to solve (any|every|all)|no problems? (at all )?solved"] },
      { label: "부정할 때 두 양화사가 모두 바뀜(∀∃ → ∃∀¬)",
        any: ["양화사|quantifier|universal|existential|전칭|∀|∃|for all|for every|for any", "바뀌|바꾸|뒤집|바뀝|flip|swap|turns? into|changes? to|becomes"] }
    ],
    wrong: [
      { label: "일부만 부정(모든 학생이 못 풀었다, 어떤 학생이 한 문제를 못 풀었다)",
        any: ["모든 학생(이|은|들이|들은)[^.\\n]{0,20}못 ?풀", "어떤 학생(이|은)[^.\\n]{0,5}적어도 한 문제(를|도)? ?못 ?풀", "(every|all) students? (failed to solve|solved zero|solved none)", "some students? failed to solve at least one"] }
    ]
  },
  "L05": {
    must: [
      { label: "타당한 논증",
        any: ["타당(하다|합니다|함|한 (논증|추론|삼단)|하며|하고)|유효(하다|합니다|한 (논증|추론|삼단))", "(예|네)[,.]? ?(이 논증은 )?타당", "(is|it's|are) (logically |deductively )?valid(?![a-z])", "valid (argument|syllogism|inference|form|deduction)", "yes,? (it is |the argument is )?valid"] },
      { label: "뱀 ⊂ 파충류이고 파충류와 온혈동물은 겹치지 않으므로 뱀도 온혈동물과 겹치지 않음",
        any: [["부분 ?집합|포함(되|된|돼)|속(하|한|함|해)|subset|contained|⊂|⊆|within|inside|members? of|belongs?","공집합|∅|겹치|disjoint|overlap|교집합|intersection|share no|배제|exclu|분리|cannot be warm|온혈(동물)?일 수 없|온혈(동물)?이 될 수 없"], "celarent|eae(-1)?(?![a-z])"] }
    ],
    wrong: [
      { label: "전칭 부정을 잘못 읽어 일부 뱀은 온혈일 수 있다고 하거나 형식 오류라고 단정",
        any: ["some snakes (could|might|may|can) be warm-?blooded", "(일부|어떤) 뱀은 온혈(동물)?일 수(도)? 있", "undistributed middle|illicit (major|minor)|매개념 부주연|(대|소)개념 부당"] }
    ]
  },
  "L06": {
    must: [
      { label: "답: ¬P ∨ Q",
        any: ["¬ ?p ?(∨|or|v) ?q", "q ?∨ ?¬ ?p", "~ ?p ?(∨|v|\\||or) ?q", "not p or q"] },
      { label: "근거: P→Q는 P가 참이고 Q가 거짓일 때만 거짓(진리표 일치)",
        any: ["p(가|이|는)? ?(참|true|t)(이고|이며|and|,|인데)[^.\\n]{0,15}q(가|이|는)? ?(거짓|false|f)", "(only|유일하게|오직)[^.\\n]{0,30}(false|거짓)|(false|거짓)[^.\\n]{0,40}(only|뿐|유일)", "truth table|진리표|진리값", "¬ ?\\(p ?∧ ?¬ ?q\\)", "material (implication|conditional)|implication elimination|함의 (제거|변환|법칙)|조건 ?법칙"] }
    ],
    wrong: [
      { label: "함의를 연언(P∧Q)이나 역(Q→P: P∨¬Q)으로 혼동",
        any: ["(p ?→ ?q\\)?)[^.\\n]{0,10}(≡|⇔|↔|=|equivalent to|동치) ?(p ?∨ ?¬ ?q|¬ ?q ?∨ ?p|p ?∧ ?q)", "(p ?→ ?q\\)?)(는|은)? ?(p ?∨ ?¬ ?q|¬ ?q ?∨ ?p|p ?∧ ?q)(와|과)? ?동치", "(answer|정답|답)(은|는|:| is) ?(p ?∨ ?¬ ?q|¬ ?q ?∨ ?p|p ?∧ ?q)"] }
    ]
  },
  "L07": {
    must: [
      { label: "부당한(타당하지 않은) 논증",
        any: ["(?<!if )invalid", "not (logically |deductively )?valid", "부당(하|합|함|한)|타당하지 (않|못)|비타당|타당한 논증이 아니"] },
      { label: "반례: 시인·몽상가이지만 과학자가 아닌 개체와, 몽상가·과학자이지만 시인이 아닌 개체",
        any: [["시인[^.\\n]{0,40}과학자(가|는|이)? ?(아니|아닌|아님|아닙)|과학자가 아닌 시인|poets?[^.\\n]{0,40}(not|non-?) ?(a )?scientists?|non-?scientist","과학자[^.\\n]{0,40}시인(이|은|는)? ?(아니|아닌|아님|아닙)|시인이 아닌 (과학자|몽상가)|scientists?[^.\\n]{0,40}(not|non-?) ?(a )?poets?|non-?poet"], ["시인|poet","과학자|scientist","겹치지|disjoint|교집합|∩|no overlap|share no|서로 다른 (사람|개체|원소|집합|부분)|different (person|people|individual|element|member|part)s?|separate"], ["countermodel|counter-?model|반례|counterexample","not a scientist|과학자가 아니|p ?∩ ?s ?= ?∅|no poet is a scientist|시인은 과학자가 아"]] },
      { label: "과학자인 몽상가가 시인과 다른 개체일 수 있음(매개념 부주연)",
        any: ["매개념|undistributed middle", "다른 (사람|개체|몽상가|부분|영역|원소)|different (person|people|individual|dreamers?|members?|part|region|subset|element)s?", "not necessarily (the same|poets?|include|overlap)|반드시 (시인|같은|겹치)", "need not|might not|may not|could be (entirely )?(different|separate)|겹치지 않을 수|없을 수도|outside", "(do|does|need) not overlap|겹칠 필요|not (necessarily )?(among|one of) the poets", "middle term[^.\\n]{0,30}not distributed|not distributed|부주연", "no overlap|one part[^.\\n]{0,40}another"] }
    ],
    wrong: [
      { label: "몽상가라는 공통점으로 시인과 과학자를 묶어 타당하다고 단정",
        any: ["^(이 논증은 |따라서 |그러므로 )?타당(하다|합니다)[.!]?$", "^(the argument|it|this argument|this syllogism) is (logically )?valid[.!]?$", "^(따라서|그러므로),? 어떤 시인은 과학자(이다|입니다)[.!]?$", "^(therefore|so|thus),? some poets are (indeed )?scientists[.!]?$"] }
    ]
  },
  "L08": {
    must: [
      { label: "A가 기사라고 가정하면 B는 거짓말쟁이가 되어 B의 말이 참이 되므로 모순",
        any: [["a(가|는|이)? ?기사|(?<![a-z])a (is|were|was|must be|would be|=) (a )?knight|(?<![a-z])a ?[:=] ?(a )?knight","모순|contradict|impossible|불가능|inconsisten|성립(하지|할 수)|cannot|can't"], ["b(가|는|이)? ?(거짓말쟁이|knave)인 경우|(?<![a-z])(if|suppose|assume) b (is|were) (a )?knave","모순|contradict|impossible|불가능"]] },
      { label: "A가 거짓말쟁이이면 B는 기사이고 B의 말(서로 다른 유형)이 참이라 일관됨",
        any: [["a(가|는|이)? ?거짓말쟁이|(?<![a-z])a (is|were|was|must be|would be|=) (a )?knave|(?<![a-z])a ?[:=] ?(a )?knave","b(가|는|이)? ?기사|(?<![a-z])b (is|were|was|must be|would be|=) (a )?knight|(?<![a-z])b ?[:=] ?(a )?knight","일관|consistent|참(이|입|이므로|이고|이다)|(is|be|are|statement is) true|만족|works|성립(한|합|하)|checks out|no contradiction|모순이 없|모순 없"]] }
    ],
    wrong: [
      { label: "A는 기사, B는 거짓말쟁이(또는 둘 다 거짓말쟁이)라고 단정",
        any: ["^(따라서 |그러므로 |정답: ?)?a(는|가)? ?기사(이고|,)[^.\\n]{0,10}b(는|가)? ?거짓말쟁이(이다|입니다)?[.!]?$", "^(so,? |therefore,? |answer: ?)?a is a knight(,| and|;) b is a knave[.!]?$", "^(따라서 |그러므로 )?(a와 b는 )?둘 다 거짓말쟁이(이다|입니다)[.!]?$", "^(so,? |therefore,? )?(a and b are )?both (are )?knaves[.!]?$"] }
    ]
  },
  "L09": {
    must: [
      { label: "필요조건: P → Q",
        any: ["p ?(→|⇒|->|implies) ?q", "if p,? (then )?q", "p이면 ?q", "p ?⊃ ?q"] },
      { label: "충분조건 아님: Q → P가 성립하지 않음(Q 참·P 거짓인 경우가 있음)",
        any: ["q ?(→|⇒|->|implies) ?p[^.\\n]{0,40}(not|아니|않|없|fail|불성립|성립하지|보장|false|거짓)", "(not|아니|않|¬ ?\\()[^.\\n]{0,10}q ?(→|⇒|->) ?p", "q ?(↛|⇏|-/->)", "q ?∧ ?¬ ?p|¬ ?p ?∧ ?q", "q(가|이|는)? ?참(이고|인데|이지만|이어도|이라도)[^.\\n]{0,15}p(가|이|는)? ?거짓", "q (is )?true[^.\\n]{0,25}p (is )?false", "q (does not|doesn't) (imply|guarantee|entail)"] },
      { label: "필요·충분의 뜻 설명(Q 없이 P 불가, Q만으로 P 보장 안 됨)",
        any: ["q (없이|가 없으면|이 없으면|가 거짓이면)", "without q", "q만으로(는)?|q alone|q by itself|q on its own", "(does not|doesn't|not) guarantee|보장(하지|되지) ?(않|못)|not enough|충분하지 (않|못)", "p cannot (occur|happen|be true|hold)", "(necessary|sufficient|필요(조건)?|충분(조건)?)[^.\\n]{0,30}(means|뜻|의미|i\\.e\\.|that is)"] }
    ],
    wrong: [
      { label: "필요와 충분의 방향을 뒤바꿈(필요조건을 Q → P로 씀)",
        any: ["(필요(조건)?|necessary|necessity)[^.\\n¬]{0,20}[:：]? ?q ?(→|⇒|->) ?p(?![a-z])", "^q ?(→|⇒) ?p(이다|입니다)?[.!]?$", "q는 p의 충분조건(이다|입니다)"] }
    ]
  },
  "L10": {
    must: [
      { label: "추론 규칙의 이름은 선언적 삼단논법(disjunctive syllogism)",
        any: ["disjunctive syllogism|modus tollendo ponens|선언(적)? ?삼단 ?논법|선언지 ?(제거|소거)(법)?|선언 ?소거|선택적 삼단 ?논법"] },
      { label: "타당한 추론이라고 판정",
        any: ["(?<!whether (it|this) )(is|are) (deductively |logically |always |formally )?valid", "valid (inference|argument|deductive|rule|form|reasoning)", "(validity|타당성)\\s*[:：]\\s*(valid|타당)", "타당(하|합|함|한|입|해)"] },
      { label: "P∨Q는 적어도 하나가 참이므로 P가 거짓이면 Q가 참이어야 함",
        any: ["at least one|적어도 (하나|한 쪽|둘 중)|둘 중 (하나|적어도)|하나(는|가) (반드시 )?참|one of (them|the two|p or q|the disjuncts)[^.\\n]{0,20}(must be |is )true", "q (must|has to) (be|hold)|q(는|가) (반드시 )?참(이어야|이 되어야|이다|일 수밖에)|the only (remaining )?(option|possibility)|남은 (것|하나|가능성)은", "p ?∨ ?q(는|가)? 거짓|p ?∨ ?q is true only when q|whenever both premises are true, q is true|q is true there", ["진리표|truth table","q(도|는|가)? 참|q is true"]] }
    ],
    wrong: [
      { label: "포함적 OR를 오해(배타적 OR일 때만 성립, 선언지 긍정과 혼동)",
        any: ["only (valid|works|holds)[^.\\n]{0,20}exclusive", "배타적[^.\\n]{0,20}(때만|경우에만)", "(rule|inference|name|이름|명칭)[^.\\n]{0,15}(is|:|은|는) ?(called )?(affirming the disjunct|선언지 긍정)"] },
      { label: "다른 규칙(전건 긍정·후건 부정 등)으로 명명",
        any: ["(rule|inference|name|이름|명칭|추론)[^.\\n]{0,15}(is|:|은|는) ?(called )?(modus ponens|modus tollens|전건 ?긍정|후건 ?부정|hypothetical syllogism|가언적 삼단 ?논법)(?![a-z])"] }
    ]
  },
  "L11": {
    must: [
      { label: "결론은 논리적으로 확정되지 않음",
        any: ["(확정|입증|증명|성립|단정|결론 ?내릴|보장)(되지|되었다고|할 수|하지|된 것은|된다고|되는 것은|된 것이)[^.\\n]{0,10}(않|없|아니|못)", "not (logically |been )?(established|proven|follow|justified|warranted)", "does(n't| not) (logically )?(follow|establish|prove|necessarily|justify|show)", "cannot (be )?(conclude|establish|infer|determine)|unsupported|unjustified|insufficient|not (sufficient|enough)", "오류|fallacy|성급"] },
      { label: "시간적 선후(상관)만으로는 인과가 성립하지 않음(post hoc)",
        any: ["post hoc", ["선후|시간(적|상|의)|temporal|timing|sequence|순서|correlat|상관|연관|association|coincid|우연|followed|뒤따|이후","인과|causa|원인|cause"]] },
      { label: "다른 요인(교란 변수·추세·단속·인구 변화·평균 회귀 등)이 설명할 수 있음",
        any: ["교란|confound|다른 (요인|원인|변수|변화|이유|설명)|제3의|third (factor|variable)|other (factors|causes|changes|explanations|variables|policies)|alternative (explanation|cause)|평균 ?(으로의 )?회귀|regression to the mean|경찰|police|enforcement|단속|경제|econom|추세|trend|인구|demograph"] },
      { label: "인과를 확정하려면 추가 증거(비교군·통제 분석 등)가 필요",
        any: ["추가(적인|의|적)? ?(증거|자료|연구|분석|근거|데이터|정보)|더 많은 (증거|자료)|비교 ?(집단|군|도시|지역)|대조(군|집단|지역)|통제(하|해|된|한)", "control (group|city|cities|area)|comparison (group|city|cities)|additional (causal )?(evidence|data|analysis)|further (evidence|study|studies|research|analysis|investigation)|more (evidence|data|rigorous)|randomi[sz]ed|무작위|실험|experiment|control(ling)? for|controlled"] }
    ],
    wrong: [
      { label: "감시카메라가 범죄 감소의 원인이라고 단정",
        any: ["^(따라서 |그러므로 |결론적으로 )?(감시 ?카메라|카메라)( 설치)?(가|는|이) (범죄 감소의 )?(원인(이다|입니다|이 맞다|이 맞습니다)|범죄를 (줄였다|감소시켰다|줄였습니다|감소시켰습니다))[.!]?$", "^(so,? |therefore,? |thus,? )?(the )?(surveillance )?cameras (did )?(caused?|reduced|are responsible for) (the )?(crime|decrease|drop|reduction)[^.\\n]{0,20}[.!]?$", "(?<!whether (the )?)conclusion is (logically )?(established|valid|justified|correct)|결론(은|이) (논리적으로 )?(확정(된다|됩니다)|타당(하다|합니다))"] }
    ]
  },
  "L12": {
    must: [
      { label: "오류 이름은 무지에 호소하는 오류(argument from ignorance)",
        any: ["argument from ignorance|appeal to ignorance|ad ignorantiam|무지(에|로)의? ?(의한 )?(호소|논증)|무지 ?논증|무지에서"] },
      { label: "¬P가 증명되지 않았다는 것은 P의 증거가 아님(증명의 부재·입증 책임)",
        any: ["lack of (proof|evidence)|absence of (proof|evidence)|burden of proof|입증 ?책임|증명 ?책임|disprov|반증|증거(가|의) (없|부족|부재)|증명(의|이) (부재|없음|부족)", "(is not|isn't|not) (proof|evidence)|증거가 (아니|되지)|증명(이|하는 것은|한 것은|하지는) (아니|않)|증명되지 않았다는 (사실|것|점)", "(unknown|undetermined|모른다|모름|미정|알 수 없|참도 거짓도|either way)"] },
      { label: "결론(유령이 존재한다)이 전제에서 따라 나오지 않음",
        any: ["does(n't| not) follow|non sequitur|따라 ?나오지 (않|못)|도출(되지|할 수|될 수) ?(않|없)|결론(을|이)[^.\\n]{0,10}(내릴|낼|이끌어낼|얻을) 수 없|cannot (conclude|infer)|invalid|부당|정당화(되지|할 수) ?(않|없)|unjustified|unwarranted|not (justified|warranted|valid|logically)|타당하지 않|성립하지 않|논리적 비약|비약"] }
    ],
    wrong: [
      { label: "유령이 존재한다고 단정하거나 논증이 타당하다고 판정",
        any: ["^(따라서 |그러므로 )?유령(은|이) (실제로 )?존재(한다|합니다)[.!]?$", "^(therefore,? |so,? |thus,? )?ghosts (do |really )?exist[.!]?$", "(이 )?논증(은|이) (논리적으로 )?타당(하다|합니다)|(the|this) (argument|reasoning) is (logically )?(valid|sound)"] }
    ]
  },
  "L13": {
    must: [
      { label: "쌍조건문은 P와 Q의 진리값이 같을 때 참(양방향 함의)",
        any: ["same truth value|같은 진리 ?값|진리 ?값이 (같|동일|일치)|동일한 진리 ?값|both (are )?true or both (are )?false|둘 다 참이거나 둘 다 거짓|모두 참이거나 모두 거짓|same value|일치할 때|(have|has) matching|agree", "(?<![¬~] ?)q ?(→|⇒|->) ?p|both directions|양방향|if and only if|필요충분"] },
      { label: "Q는 거짓",
        any: ["(?<![¬~] ?)q(는|은|가|도|의 진리 ?값은)? ?(반드시 |또한 |역시 )?(=|:)? ?(거짓|false|f(?![a-z])|⊥)", "(?<![¬~] ?)q (must|is|has to)( also| therefore| necessarily)? (be )?(false|f(?![a-z]))", "truth value of q (is|must be) (false|f(?![a-z]))"] }
    ],
    wrong: [
      { label: "한 방향 함의로 보고 Q가 참이거나 정해지지 않는다고 단정",
        any: ["^(따라서 |그러므로 )?q(는|의 진리 ?값은) (참|true)(이다|입니다)?[.!]?$", "^(therefore,? |so,? |thus,? )?q is true[.!]?$", "^(따라서 |그러므로 )?q(는|가) 참일 수도 있고 거짓일 수도 있(다|습니다)[.!]?$", "^(therefore,? |so,? )?q (can|could|may) be (either )?(true or false|either)[.!]?$"] }
    ]
  },
  "L14": {
    must: [
      { label: "세 전제는 동시에 참일 수 없음(불가능)",
        any: ["동시에 참일 수 (없|는 없)|모두 참일 수 (없|는 없)|불가능|가능하지 않(습니다|음|다[.\\s])|cannot (all )?(be )?(true|simultaneously|hold|be satisfied)|can't (all )?be|not (all )?be true|impossible|inconsisten|unsatisfiable|no assignment|(^|\\n)\\s*(#+ )?(no(?![a-z])|아니(요|오))"] },
      { label: "P와 P→Q로부터 전건 긍정(modus ponens)으로 Q가 도출됨",
        any: ["modus ponens|전건 ?긍정", "(?<![¬~] ?)q(가|는|도)? (참|true)(이어야|이 되어야|이 된다|여야|이다|임|가 된다)", "(?<![¬~] ?)q (must|has to) (be|hold)|(derive|yields?|entails?|infer|gives?|get) q(?![a-z])|q(를|을) (도출|얻|유도)|⊢ ?q(?![a-z])|q가 성립|q가 따라"] },
      { label: "도출된 Q가 ¬Q와 모순(Q ∧ ¬Q)",
        any: ["q ?∧ ?(¬|~) ?q|both q and ((¬|~) ?q|not q)|q and ((¬|~) ?q|not q)|q와 (¬|~) ?q|inconsisten|unsatisfiable|충족 ?불가", "(모순|contradict\\w*|충돌|conflict\\w*|clash\\w*)[^.\\n]{0,20}(¬|~|not ) ?q(?![a-z])", "(¬|~) ?q(와|과|는|가|이)?[^.\\n?]{0,15}(모순|contradict|충돌|conflict)", "(?<![¬~] ?)q(가|는)? (참|true)(이면서|이고|and)[^.\\n]{0,20}(거짓|false)"] }
    ],
    wrong: [
      { label: "세 전제가 동시에 참일 수 있다(일관적이다)고 판정",
        any: ["^(네|예|yes)[,.!]", "(they|premises|all three) (can|could) (all )?be (true|satisfied) (simultaneously|at the same time|together)", "(the )?premises are consistent|(전제들은|세 전제는|전제는) (서로 )?(일관(적이다|됩니다|된다)|양립(한다|할 수 있다|가능하다))|동시에 참일 수 있(다|습니다)"] }
    ]
  },
  "S01": {
    must: [
      { label: "뉴턴 제2법칙 F = ma, a = F/m",
        any: ["f ?= ?m ?(×|·|\\*)? ?a(?![a-z])|a ?= ?\\(?f\\)? ?/ ?\\(?m\\)?|second law|뉴턴 ?(의)? ?(운동 )?제? ?2 ?법칙|가속도 ?(의)? ?법칙", "6 ?(n)? ?(/|÷) ?2"] },
      { label: "a = 6/2 = 3 m/s²",
        any: ["(?<![\\d.])3(\\.0+)? ?(m ?/ ?s|m ?s|m·s|미터|meters? per)", "(a|가속도)[^.\\n]{0,10}(=|는|은|is) ?3(\\.0+)?(?![\\d.])", "6 ?(n)? ?(/|÷) ?2 ?(kg)? ?= ?3(?![\\d.])"] }
    ],
    wrong: [
      { label: "질량과 힘을 잘못 써서 12 m/s²나 1/3 m/s²로 계산",
        any: ["(?<![\\d.])12 ?m ?/ ?s|(?<![\\d.])0\\.33|1/3 ?m ?/ ?s|a ?= ?(m|2) ?/ ?(f|6)|a ?= ?(f|6) ?(×|·|\\*) ?(m|2)"] }
    ]
  },
  "S02": {
    must: [
      { label: "직렬이라 전체 저항 = 2 + 4 = 6 Ω",
        any: ["2 ?(Ω|ω|Ω|ohms?|옴)? ?\\+ ?4", "(?<![\\d.])6 ?(Ω|ω|Ω|ohms?|옴)", "r[_a-z가-힣 ]{0,10}= ?6(?![\\d.])", "(합성|전체|총|등가) ?저항[^.\\n]{0,15}6|(total|equivalent) resistance[^.\\n]{0,20}6"] },
      { label: "전류 I = 12/6 = 2 A",
        any: ["12 ?(v)? ?(/|÷) ?6", "(?<![\\w.])i ?= ?2(?![\\d.])", "(전류|current)[^.\\n]{0,20}(=|는|은|is|:) ?2 ?(a|amps?|amperes?|암페어)?(?![\\w.])"] },
      { label: "4 Ω 양단 전압 V = 2 × 4 = 8 V",
        any: ["2 ?(a|amps?|암페어)? ?(×|x|\\*|·) ?4|4 ?(Ω|ω|Ω|ohms?|옴)? ?(×|x|\\*|·) ?2 ?(a|amps?)?(?![\\d.])", "(?<![\\d.])8 ?(v|볼트|volts?)(?![a-z])", "12 ?(v)? ?(×|x|\\*|·) ?4 ?/ ?6|4 ?/ ?6 ?(×|x|\\*|·) ?12"] }
    ],
    wrong: [
      { label: "4 Ω 저항 전압을 4 V나 12 V로 잘못 배분",
        any: ["4 ?(Ω|ω|Ω|ohms?|옴)[^.\\nΩω,;]{0,30}(=|is|은|는|:) ?(4|12) ?(v|볼트|volts?)(?![a-z])"] },
      { label: "병렬로 계산(4/3 Ω, 9 A 등)",
        any: ["1 ?/ ?r[^.\\n]{0,5}= ?1 ?/ ?2 ?\\+ ?1 ?/ ?4|4 ?/ ?3 ?(Ω|ω|Ω|ohms?|옴)|1\\.33 ?(Ω|ω|Ω|ohms?|옴)", "(전류|current|(?<![\\w.])i)[^.\\n]{0,10}(=|is|은|는|:) ?(9|3|6) ?(a|amps?|암페어)(?![\\w.])"] }
    ]
  },
  "S03": {
    must: [
      { label: "처음 위치에너지 mgh = 2 × 10 × 5 = 100 J",
        any: ["(?<![\\d.])100 ?(j|줄|joules?)(?![a-z])", "mgh ?= ?100|= ?100(?![\\d.])", "2 ?(kg)? ?(×|x|·|\\*) ?10 ?(m/s²)? ?(×|x|·|\\*) ?5"] },
      { label: "소산된 20 J를 빼서 운동에너지 = 100 − 20 = 80 J",
        any: ["100 ?(j)? ?(-|−|–|빼기|minus) ?20", ["(?<![\\d.])80 ?(j|줄|joules?)(?![a-z])|= ?80(?![\\d.])","(?<![\\d.])100(?![\\d.])"]] }
    ],
    wrong: [
      { label: "소산 에너지를 무시하거나 더해 100 J·120 J로 답함",
        any: ["(?<![\\d.])120 ?(j|줄|joules?)(?![a-z])|100 ?(j)? ?\\+ ?20", "(ke|kinetic energy|운동 ?에너지)[^.\\n]{0,20}(=|is|은|는) ?100 ?(j|줄|joules?)?(?![\\d.])(?!\\s*(j|줄|joules?)?\\s*(-|−|–|에서|minus|less|빼))"] }
    ]
  },
  "S04": {
    must: [
      { label: "부피·양이 일정하면 P/T가 일정(압력은 절대온도에 비례)",
        any: ["p_?1? ?/ ?t_?1?|비례|proportional|gay-?lussac|게이 ?-?뤼삭|amontons|아몽통|pv ?= ?nrt|ideal gas law|이상 ?기체 (상태 )?방정식"] },
      { label: "온도 비 450/300 = 1.5를 곱함",
        any: ["450 ?(k)? ?(/|÷) ?300|(?<![\\d.])1\\.5(?![\\d])|3 ?/ ?2(?![\\d.])|100 ?(kpa)? ?(×|x|\\*|·) ?450|45000"] },
      { label: "P₂ = 150 kPa",
        any: ["(?<![\\d.])150 ?(kpa|킬로파스칼|kilopascals?)|= ?150(?![\\d.])"] }
    ],
    wrong: [
      { label: "반비례로 계산하거나 섭씨온도를 써서 다른 값을 냄",
        any: ["66\\.[67]|200 ?/ ?3 ?kpa|(?<![\\d.])67 ?kpa|300 ?/ ?450 ?(×|x|\\*|·)|(×|x|\\*|·) ?300 ?/ ?450", "(pressure|압력)[^.\\n]{0,20}(temperature|온도)[^.\\n]{0,10}(반비례|inversely)|(inversely proportional|반비례)[^.\\n]{0,15}(to )?(the )?(temperature|온도)", "177 ?/ ?27|(?<![\\d.])27 ?°? ?c(?![a-z])"] }
    ]
  },
  "S06": {
    must: [
      { label: "희석해도 용질(HCl) 몰수 보존: M₁V₁ = M₂V₂",
        any: ["[mc](_?1|₁) ?(×|·|\\*)? ?v(_?1|₁)", "용질[^.\\n]{0,25}(일정|보존|같|변하지|그대로)|(moles?|amount) of (hcl|solute)[^.\\n]{0,40}(constant|conserved|same|unchanged|remains?|does not change)|solute[^.\\n]{0,30}(constant|conserved|same|unchanged|remains?)", "(?<![\\d.])0\\.10? ?(mol|몰)|희석 ?(공식|식)|dilution (formula|equation)"] },
      { label: "최종 부피 500 mL로 나눔(100/500 = 1/5)",
        any: ["100 ?(ml)?\\)? ?(/|÷) ?\\(?500|(?<![\\d.])1 ?/ ?5(?![\\d.])|5배|five-?fold|factor of (5|five)|/ ?0\\.5(00)? ?l", "(×|x|\\*|·) ?100 ?(ml)? ?= ?([mc](_?2|₂)?)? ?(×|x|\\*|·)? ?500", "÷ ?0\\.5(00)? ?l"] },
      { label: "최종 농도 0.20 M",
        any: ["(?<![\\d.])0\\.20? ?(m|mol/l|mol l|몰)(?![a-z])|= ?0\\.20?(?![\\d])"] }
    ],
    wrong: [
      { label: "더한 물 400 mL를 최종 부피로 써서 0.25 M으로 계산",
        any: ["(농도|concentration|m2|c2|answer|정답|답)[^.\\n]{0,20}(=|is|은|는|:) ?0\\.25|^0\\.25 ?m(?![a-z])", "100 ?(ml)? ?(/|÷) ?400|(×|x|\\*|·) ?400 ?(ml)?(?![\\d])"] }
    ]
  },
  "S08": {
    must: [
      { label: "자녀 유전자형 분포 AA : Aa : aa = 1/4 : 1/2 : 1/4 (1 : 2 : 1)",
        any: ["1 ?: ?2 ?: ?1", "aa[^\\n]{0,20}(?<![\\d/.])1/2(?![\\d/])", "aa[^\\n]{0,20}(?<![\\d/.])(2/4|0\\.5(?!\\d)|50 ?%)", "(1/4|0\\.25|25 ?%)[^\\n]{0,40}(1/2|2/4|0\\.5(?!\\d)|50 ?%)[^\\n]{0,40}(1/4|0\\.25|25 ?%)"] },
      { label: "열성 표현형이 아닌 경우(AA 또는 Aa)의 확률 3/4로 조건화",
        any: ["(?<![\\d/])3/4(?![\\d])", "0\\.75", "75 ?%", "1 ?[-−] ?1/4", "(?<!\\d)3 ?(가지 경우|개의 경우|outcomes|possibilities|equally likely|cases)", "2 out of (the )?3|3개 중 2|3가지 중 2"] },
      { label: "P(Aa | 비발현) = (1/2)/(3/4) = 2/3",
        any: ["(?<![\\d/])2/3(?![\\d])", "0\\.66|0\\.67", "66\\.\\d+ ?%|67 ?%|66 ?%", "3분의 ?2", "two[- ]thirds"] }
    ],
    wrong: [
      { label: "조건화 없이 1/2를 답으로 단정",
        any: ["(조건부 ?확률|conditional probability|정답|최종 답|answer)(은|는|is|:|=)?[^.\\n]{0,15}(?<![\\d/(])(1/2|0\\.5(?!\\d)|50 ?%)(?! ?(/|÷|over|나누|divided))", "p\\(aa ?\\| ?[^)]{1,40}\\) ?= ?(1/2|0\\.5(?!\\d)|50 ?%)(?! ?(/|÷|over|divided))"] }
    ]
  },
  "S09": {
    must: [
      { label: "독립변수: 온도를 여러 수준으로 달리함",
        any: ["(독립 ?변수|independent variable)\\)?\\s*(:|은|는|is|=|–|-|—)\\s*\\(?(반응 )?(온도|temperature)", "(온도|temperature)[^.\\n]{0,10}\\(?(독립 ?변수|independent variable|iv)\\)?", "manipulat[^.\\n]{0,20}temperature", "온도를 (변화|달리|바꾸|조절|조작|설정|다르게)", "(vary|varying|vary the|different|several|range of|multiple) (the )?temperatures?", "(여러|서로 다른|다양한|다섯|5개?의?|네|4개?의?) ?(가지 )?온도", "\\d+ ?(°|℃|도씨)"] },
      { label: "종속변수: 반응속도(생성물 양·시간 등)를 정량 측정",
        any: ["(종속 ?변수|dependent variable)\\)?\\s*(:|은|는|is|=|–|-|—)\\s*[^\\n]{0,50}(속도|rate|생성|흡광|absorbance|product|시간|time|부피|volume|기포|bubble|산소|oxygen|양)", "(measure|measuring|measured|record|recording|측정|기록)[^.\\n]{0,40}(rate|속도|생성량|product|oxygen|산소|absorbance|흡광|time taken|걸리는 시간|기포|bubble)", "(속도|rate|생성량|산소|흡광도|absorbance)[^.\\n]{0,15}(측정|를 측정|을 측정|measured)", "(반응 ?속도|reaction rate)[^.\\n]{0,10}\\(?(종속 ?변수|dependent variable|dv)\\)?"] },
      { label: "통제변수 최소 3가지(pH, 효소 농도, 기질 농도, 부피·시간 등)를 일정하게 유지",
        any: [["(?<![a-z])ph(?![a-z])|산도","(효소|enzyme)[^.\\n]{0,15}(농도|양|concentration|amount|volume|부피)|(concentration|amount) of (the )?enzyme","(기질|substrate)[^.\\n]{0,15}(농도|양|concentration|amount|volume|부피)|(concentration|amount) of (the )?substrate"], ["(?<![a-z])ph(?![a-z])|산도","(효소|enzyme)[^.\\n]{0,15}(농도|양|concentration|amount|volume|부피)|(concentration|amount) of (the )?enzyme","(총 |전체 |반응 ?(용액의? )?)?(부피|volume)|반응 시간|측정 시간|incubation|reaction time|같은 시간|same time|timing|(교반|stirr|mixing)|(효소|enzyme) (source|종류|출처)|buffer|완충"], ["(?<![a-z])ph(?![a-z])|산도","(기질|substrate)[^.\\n]{0,15}(농도|양|concentration|amount|volume|부피)|(concentration|amount) of (the )?substrate","(총 |전체 |반응 ?(용액의? )?)?(부피|volume)|반응 시간|측정 시간|incubation|reaction time|같은 시간|same time|timing|(교반|stirr|mixing)|(효소|enzyme) (source|종류|출처)|buffer|완충"], ["(효소|enzyme)[^.\\n]{0,15}(농도|양|concentration|amount|volume|부피)|(concentration|amount) of (the )?enzyme","(기질|substrate)[^.\\n]{0,15}(농도|양|concentration|amount|volume|부피)|(concentration|amount) of (the )?substrate","(총 |전체 |반응 ?(용액의? )?)?(부피|volume)|반응 시간|측정 시간|incubation|reaction time|같은 시간|same time|timing|(교반|stirr|mixing)|(효소|enzyme) (source|종류|출처)|buffer|완충"]] },
      { label: "반복 측정으로 변동성 추정·우연 오차 영향 감소",
        any: [["반복|replica|repeat|trials|여러 번","오차|error|변동|variab|신뢰|reliab|평균|average|mean|우연|chance|이상치|outlier|정밀|precision|재현|reproduc|consisten|일관"]] }
    ],
    wrong: [
      { label: "여러 변수를 동시에 바꾸거나 한 번 측정으로 충분하다고 함",
        any: ["(온도와 (ph|농도)|temperature and (ph|concentration))[^.\\n]{0,20}(동시에|함께|simultaneously|at the same time)[^.\\n]{0,10}(변화|바꾸|바꿉|달리|vary|varied|change)", "(한 번|1회|단 한 번)(만)? ?(측정|실험)(하면|으로|해도)[^.\\n]{0,10}충분", "(a single|one) (trial|measurement|run) (is|will be) (enough|sufficient)", "replication is (unnecessary|optional)"] }
    ]
  },
  "S10": {
    must: [
      { label: "내성 변이는 필요와 무관하게(무작위로·항생제 이전부터) 생김",
        any: [["돌연변이|mutation|변이|variant|variation|유전적 (차이|다양)|genetic (diversity|differences)","무작위|random|우연|by chance|이미 (존재|있)|pre-?exist|already (present|exist|had|carr)|before (the )?(antibiotic|exposure|treatment)|independent(ly)? of|무관|관계없|regardless|우연히|spontaneous|자발적"]] },
      { label: "항생제가 선택압으로 작용해 내성 개체가 살아남아 번식",
        any: [["생존|살아남|surviv","번식|증식|reproduc|multipl|자손|offspring|물려|pass(ed)? on|divid|분열"], "선택압|선택 압력|selective pressure|selection pressure|select(s|ed|ing)? for (the )?resistan"] },
      { label: "집단 내 유전되는 변이의 빈도가 변하는 것(개체가 목적을 갖고 변하는 것이 아님)",
        any: ["빈도|frequenc|heritable|inherit|유전(되|적|자|된)|물려|대물림|집단(의)? 구성|composition|populations? (evolves?|changes?|shifts?)|집단이 (변|진화)|목적|goal|purpose|의도|intent|teleolog|목적론|라마르크|lamarck"] }
    ],
    wrong: [
      { label: "세균이 필요에 의해 스스로 내성을 만든다고 단정",
        any: ["세균(이|은|들이|들은)[^.\\n]{0,15}(살아남기 위해|생존하기 위해|필요(해서|에 의해|에 따라))[^.\\n]{0,15}(내성|돌연변이)[^.\\n]{0,5}(을|를)? ?(만들|만든|일으|획득|생성)(었|었다|어 냈|ㄴ다|는다|다|합니다|했다)", "bacteria[^.\\n]{0,20}(develop|create|produce|generate|make)[^.\\n]{0,15}(resistance|mutations?) (in order to|to survive|because they need)"] }
    ]
  },
  "S12": {
    must: [
      { label: "상관(관찰) 자료만으로는 인과를 단정할 수 없음",
        any: ["상관(관계)?(는|은|만으로)?[^.\\n]{0,15}인과", "correlation[^.\\n]{0,30}causation", "association[^.\\n]{0,30}causation", "관찰 (연구|자료|데이터)|observational", "인과(관계|성)?(를|을)? ?(증명|입증|확립|단정)(하지|할 수|하기)", "co-?var(y|ies)|alone is insufficient|cannot (separate|establish|prove)|공변"] },
      { label: "교란 변수·역인과 등 대안 설명 가능(인, 온도, 빛, 유입수 등)",
        any: ["교란|confound|제3의? ?(변수|요인)|third (variable|factor)|lurking|공통 원인|common cause|역인과|역방향|reverse caus|reverse direction|인과의? 방향|direction of caus|phosph|인 농도|인산|인\\(p\\)|총인|온도|water temperature|일조|빛|sunlight|light|유출|runoff|농업|agricultur|비료|fertili|체류 시간|residence time|수심|depth"] },
      { label: "다른 조건을 통제한 채 질산염만 조작하는 실험(메조코즘 등)으로 검증",
        any: [["실험|experiment|mesocosm|메조코즘|조작|manipulat|무작위|randomi[sz]|첨가|추가|add","통제|control|일정|constant|동일|same|나머지|holding|identical|대조"]] }
    ],
    wrong: [
      { label: "상관만으로 질산염이 원인이라고 단정",
        any: ["^(따라서 |그러므로 |즉 )?질산염(이|은)[^.\\n]{0,15}원인(이다|입니다|임이 (증명|확인)되었다)[.!]?$", "(proves|establishes|confirms)[^.\\n]{0,15}(that )?nitrate (causes|is the cause)", "^(therefore,? |so,? )?nitrate (causes|is the cause of) (the )?algal blooms[.!]?$"] }
    ]
  },
  "S13": {
    must: [
      { label: "네 값의 합 = 40.0 g",
        any: ["(?<![\\d.])40(\\.0+)?(?![\\d.])", "39\\.9\\d|40\\.0"] },
      { label: "평균 = 40.0 ÷ 4 = 10.0 g",
        any: ["(평균|mean|average)[^\\n]{0,40}(?<![\\d.])10(\\.0+)?(?![\\d.])", "40(\\.0+)? ?(g )?(/|÷) ?4 ?= ?10", "= ?10\\.0+ ?g"] },
      { label: "반복 측정은 변동(산포)을 드러내고 우연 오차의 영향을 줄임",
        any: [["반복|repeat|multiple|여러 번|several|replicat","우연|random|무작위|변동|variab|spread|산포|흩어|편차|deviation|오차|error|신뢰|reliab|precision|정밀|불확실|uncertain|이상치|outlier|fluctuat"]] }
    ],
    wrong: [
      { label: "평균 계산 오류 또는 반복 측정이 계통 오차를 없앤다고 단정",
        any: ["(평균|mean|average)\\s*(은|는|값은|is|=|:)\\s*(10\\.0[1-9]|10\\.[1-9]|9\\.\\d)", "(반복|repeat|multiple)[^.\\n]{0,40}(계통|체계적|systematic)[^.\\n]{0,15}(오차|error|bias|편향)[^.\\n]{0,15}(제거|없앤|없애|eliminat|remov|correct|cancel)"] }
    ]
  },
  "S14": {
    must: [
      { label: "재현 실패 한 번만으로 조작을 결론낼 수 없음",
        any: [["수 없|cannot|can't|can ?not|insufficient|not (sufficient|enough|justified|warranted|necessarily|evidence)|불충분|부족|충분하지 않|아니(요|오|다|며)|^no\\b|성급|비약|premature|does not (justify|prove|imply|mean)|doesn't (justify|prove|imply|mean)","조작|fabricat|fraud|misconduct|위조|날조|부정행위"]] },
      { label: "대안 설명 두 가지 이상(표본·검정력, 프로토콜 차이, 측정, 우연 변동, 불안정한 효과 등)",
        any: [["표본|sample|검정력|(statistical )?power|underpowered","프로토콜|protocol|절차|방법(론)?(의|상)? ?차이|methodolog|실험 (조건|환경)|conditions?|setting|context|대상 (집단|모집단)|population|participants|참가자"], ["표본|sample|검정력|(statistical )?power|underpowered","측정|measure|도구|instrument|장비|equipment|시약|reagent|materials"], ["표본|sample|검정력|(statistical )?power|underpowered","우연|random|chance|변동|variab|noise|false (positive|negative)|위양성|위음성|[12]종 오류|type (i|ii|1|2) error|통계적 (오차|변동|유의)"], ["표본|sample|검정력|(statistical )?power|underpowered","효과(가|의)? ?(작|불안정|약)|small effect|effect size|효과 ?크기|unstable|winner'?s curse|과대 ?추정|overestimat|regression to the mean|moderator|조절 변수|숨은 변수|hidden variable|hidden factor"], ["프로토콜|protocol|절차|방법(론)?(의|상)? ?차이|methodolog|실험 (조건|환경)|conditions?|setting|context|대상 (집단|모집단)|population|participants|참가자","측정|measure|도구|instrument|장비|equipment|시약|reagent|materials"], ["프로토콜|protocol|절차|방법(론)?(의|상)? ?차이|methodolog|실험 (조건|환경)|conditions?|setting|context|대상 (집단|모집단)|population|participants|참가자","우연|random|chance|변동|variab|noise|false (positive|negative)|위양성|위음성|[12]종 오류|type (i|ii|1|2) error|통계적 (오차|변동|유의)"], ["프로토콜|protocol|절차|방법(론)?(의|상)? ?차이|methodolog|실험 (조건|환경)|conditions?|setting|context|대상 (집단|모집단)|population|participants|참가자","효과(가|의)? ?(작|불안정|약)|small effect|effect size|효과 ?크기|unstable|winner'?s curse|과대 ?추정|overestimat|regression to the mean|moderator|조절 변수|숨은 변수|hidden variable|hidden factor"], ["측정|measure|도구|instrument|장비|equipment|시약|reagent|materials","우연|random|chance|변동|variab|noise|false (positive|negative)|위양성|위음성|[12]종 오류|type (i|ii|1|2) error|통계적 (오차|변동|유의)"], ["측정|measure|도구|instrument|장비|equipment|시약|reagent|materials","효과(가|의)? ?(작|불안정|약)|small effect|effect size|효과 ?크기|unstable|winner'?s curse|과대 ?추정|overestimat|regression to the mean|moderator|조절 변수|숨은 변수|hidden variable|hidden factor"], ["우연|random|chance|변동|variab|noise|false (positive|negative)|위양성|위음성|[12]종 오류|type (i|ii|1|2) error|통계적 (오차|변동|유의)","효과(가|의)? ?(작|불안정|약)|small effect|effect size|효과 ?크기|unstable|winner'?s curse|과대 ?추정|overestimat|regression to the mean|moderator|조절 변수|숨은 변수|hidden variable|hidden factor"]] },
      { label: "다음 단계: 프로토콜·원자료 비교, 충분한 검정력의 추가 재현",
        any: ["(추가|더 많은|여러|다수의|additional|further|more|multiple|large|대규모|독립적인|사전 ?등록|pre-?regist)[^.\\n]{0,30}(재현|replicat|연구|studies|실험)", "(원 ?데이터|원자료|raw data|데이터 (공유|검토|비교)|data (sharing|audit)|프로토콜(을|의)? ?(비교|검토|공유)|compar[^.\\n]{0,20}(protocol|method|data)|저자(와|에게)|contact[^.\\n]{0,20}(author|original))", "메타 ?분석|meta-?analys"] }
    ],
    wrong: [
      { label: "원 연구가 조작되었다고 단정",
        any: ["^(따라서 |그러므로 )?원 ?연구(는|가)[^.\\n]{0,15}조작(되었다|된 것이다|되었습니다|된 것입니다)[.!]?$", "^(therefore,? |so,? )?the original study (was|is) (fabricated|fraudulent)[.!]?$", "^(yes|네|예)[,.!]?\\s*(this|it|that|the|one|원|이|한|조작|결론)"] }
    ]
  },
  "S15": {
    must: [
      { label: "많은 지지가 있어도 절대적으로 증명되었다고 할 수 없음",
        any: [["수 없|cannot|can't|can ?not|not|아니|아닙|않|never|^no\\b","절대|absolute|증명|prov|확정|certain"]] },
      { label: "새 증거·더 나은 설명으로 수정·반증될 수 있음(잠정적)",
        any: ["수정|revis|반증|falsif|뒤집|overturn|refut|잠정|tentative|provisional|새로운 (증거|관찰|데이터|발견|실험)|new (evidence|data|observations?|experiments?|findings)|future (observations?|evidence|experiments?)|대체될|replaced|modified"] },
      { label: "반복 지지는 신뢰도를 높일 뿐 논리적 보장은 아님(귀납)",
        any: ["귀납|induct|신뢰(도|성)?(가|를|이|는)? ?(높|증가|강화|커)|confidence|확신|강하게 지지|강력(히|한) ?지지|strong(ly)? support|corroborat|확률적|probab|warrant|보장(하지|되지|할 수) ?(않|못|없)|guarantee|확증|well[- ]supported|well[- ]established|잘 (확립|지지|검증)"] }
    ],
    wrong: [
      { label: "가설이 절대적으로 증명되었다고 단정",
        any: ["^(네|예|yes)[,.!]", "^(따라서 |그러므로 |therefore,? |so,? )?(그 |이 )?(가설은|the hypothesis (is|has been)) (절대적으로 )?(증명되었|증명된 것|absolutely proven|proven true|proven)(다|이다|입니다)?[.!]?$"] }
    ]
  },
  "E01": {
    must: [
      { label: "오류 위치: 17×4 = 68(48이 아님)",
        any: [["(?<!\\d)68(?!\\d)","17 ?[×x*·] ?4(?!\\d)|4 ?[×x*·] ?17|340 ?\\+ ?68"]] },
      { label: "올바른 답 17×24 = 408",
        any: ["(?<!\\d)408(?!\\d)"] },
      { label: "17×20 + 17×4로 나누는 방법 자체는 옳음",
        any: ["(방법|접근|분해|전략|과정|분배|method|approach|decomposition|strategy|distributive|breakdown|breaking)[^.\\n]{0,40}(옳|맞|타당|정확|올바|correct|valid|fine|sound|right|good)", "340(은|는|is)?[^.\\n]{0,15}(맞|correct|정확|옳|올바|right)", "17 ?[×x] ?20 ?= ?340[^\\n]{0,15}(✓|✔|✅|correct|맞|정확|옳)", "(correct|맞|정확|옳)[^.\\n]{0,20}17 ?[×x] ?20"] }
    ],
    wrong: [
      { label: "388을 답으로 받아들임",
        any: ["^(따라서 |그러므로 |therefore,? |so,? )?(답은 |the answer is )?(17 ?[×x] ?24 ?= ?)?388(입니다|이다)?[.!]?$", "(정답|최종 답|answer)(은|는|is|:) ?388"] }
    ]
  },
  "E02": {
    must: [
      { label: "‘모든 포유류는 알을 낳는다’는 전제가 거짓",
        any: [["모든 포유류|all mammals|포유류는 알을|mammals lay eggs","거짓|틀렸|틀린|틀립|false|incorrect|사실이 아니|untrue|not true|부정확|사실과 다르|오류"], "모든 포유류가 알을 낳(는 (것은|건)|지는) 아니|not all mammals lay eggs|대부분의? 포유류(는|가)? ?(새끼를 낳|알을 낳지 않)|most mammals (do not|don't|give birth|bear live)|(사람|인간|개|고양이|human|dog|cat|whale|고래)[^.\\n]{0,30}(새끼를 낳|낳지 않|give birth|live (birth|young)|do not lay)"] },
      { label: "추론 형식(삼단논법)은 타당",
        any: ["타당(하|한|합|성은|성 자체)", "(?<!in)valid(?!ity of the premise)", "logically follows|follows logically|modus ponens", "(형식|구조|form|structure)(은|는|이|is)?[^.\\n]{0,20}(올바|맞|옳|correct|sound|fine)", "(추론|논리)(은|는|자체는|과정은|구조는|형식은) ?(옳|맞|올바|문제(가|는)? 없)"] },
      { label: "결론(오리너구리는 알을 낳음)은 참이지만 우연히 맞았을 뿐 전제를 정당화하지 못함",
        any: ["결론(은|이|자체는)?[^.\\n]{0,20}(참|사실|맞)", "conclusion[^.\\n]{0,30}(true|correct|happens)", "오리너구리(는|가)? ?(실제로|사실|정말)[^.\\n]{0,10}알을 낳", "platypus(es)? (does|do|actually|in fact|really)[^.\\n]{0,10}lays? eggs", "우연히|happens? to be|by (accident|coincidence)|coincidental"] }
    ],
    wrong: [
      { label: "추론과 전제가 모두 옳다(전제가 참)고 단정",
        any: ["(추론과 전제가?|전제와 추론이?)\\s*(모두|둘 다)\\s*(옳|맞|타당|정확)", "both the reasoning and the premises? (are|is) (correct|true|sound|valid)", "(?<!if )(?<!whether )(?<!assuming )(?<!second )the premise (is|was) (true|correct)", "(?<!(두 번째|둘째|second|minor|소) ?)전제(는|가|도)\\s*(참이다|옳다|맞다|참입니다|옳습니다|맞습니다)", "^(따라서 |그러므로 |therefore,? |so,? )?(the |this |이 )?(argument|syllogism|논증)(은|는|is)? ?(완전히 |entirely |completely |perfectly )?(건전|sound)(하다|합니다|다)?[.!]?$", "all mammals (do )?lay eggs[^.\\n]{0,15}(is|holds) (true|correct)", "모든 포유류(가|는) 알을 낳는다는 (것은|말은|명제는) (참|사실|옳)"] },
      { label: "전제와 추론에 모두 문제가 없다고 단정", raw: true,
        any: ["(전제|추론)(와|과|도)? ?(추론|전제)?[^.\\n]{0,8}(모두|둘 다|다) ?(문제(가)? ?없|옳|맞|타당)", "(premise|reasoning)s? and (the )?(premise|reasoning)s? (are|is) (both )?(fine|correct|sound|valid|ok)"] }
    ]
  },
  "E03": {
    must: [
      { label: "넓이를 유일하게 정할 수 없음",
        any: ["(결정|확정|구할|정할|특정|알|계산)(할)? 수(는)? 없", "cannot be (uniquely )?(determined|found|calculated|computed)", "can't be (uniquely )?(determined|found|calculated)", "not (uniquely )?determined", "insufficient|불충분|정보가 부족|not enough information|undetermined|indeterminate|유일하지 않|not unique|uniquely"] },
      { label: "AI가 끼인각을 90°(직각)로 암묵적으로 가정",
        any: [["90|직각|right(-| )?(angle|triangle)|perpendicular|수직","가정|assum|전제|implicit|암묵|treat"]] },
      { label: "넓이 = ½·a·b·sin C로 끼인각에 의존",
        any: ["sin", "(끼인|사잇|사이)각|included angle|angle between"] }
    ],
    wrong: [
      { label: "넓이가 17.5라고 단정",
        any: ["^(따라서 |그러므로 |therefore,? |so,? )?(넓이는|the area is) ?17\\.5[^.\\n]{0,10}(이다|입니다)?[.!]?$", "(정답|최종 답|answer)(은|는|is|:) ?17\\.5"] }
    ]
  },
  "E04": {
    must: [
      { label: "Source C는 주어진 출처(A, B) 밖의 자료",
        any: ["(제공|허용|주어지|명시|언급)(되지|하지) ?않은 (출처|자료|근거)", "(제공된|주어진|허용된|사용 가능한) (출처|자료|근거)[^.\\n]{0,20}(밖|외부|없|아닌|포함되지)", "외부 (출처|자료)|목록에 없|존재하지 않는 (출처|자료)", "source c[^.\\n]{0,60}(없|아닌|아니|않|not|outside|never|doesn't|does not|wasn't|isn't)", "outside (of )?(the )?(provided|given|allowed|permitted|available|stated|specified)", "not (one of|among|part of|in|included in) (the )?(provided|given|allowed|permitted|available|two|stated|specified|listed)", "(was|is|were) not (provided|given|available|permitted|allowed|listed)", "out-of-scope|out of scope|external source"] },
      { label: "인용이 지어낸(환각)·검증 불가한 근거",
        any: ["환각|날조|조작|지어(낸|냈|진)|허위|가짜|만들어 낸|꾸며", "hallucinat|fabricat|invent|made[- ]up|fake|fictitious|bogus|spurious", "검증(할 수 없|이 불가|되지 않|할 방법이 없|이 안)|확인(할 수 없|이 불가|되지 않)|추적할 수 없", "unverifi|cannot be (verified|checked|traced|confirmed)|can't be (verified|checked|traced|confirmed)|no way to (verify|check)"] },
      { label: "그 수치는 받아들일 수 없음(A·B로 근거를 대거나 근거가 없다고 밝혀야 함)",
        any: ["(수치|숫자|값|데이터|결과)[^.\\n]{0,30}(신뢰할 수 없|받아들일 수 없|믿을 수 없|근거가 없|사용할 수 없|채택할 수 없|인정할 수 없|신뢰하기 어렵)", "(number|figure|value|statistic|data|claim)[^.\\n]{0,50}(cannot|can't|should not|shouldn't|must not) be (trusted|accepted|relied|used|taken)", "(number|figure|value|statistic)[^.\\n]{0,30}(is |are )?(unsupported|untrustworthy|unreliable|not reliable|not supported)", "source a(와|나| 또는| 및| ?/| and| or)[^.\\n]{0,10}b(만|에서|로|를|의|에)", "instead[^.\\n]{0,20}(source )?a (and|or|\\/) (source )?b|(rely|relied|based|draw|use|using|cite|citing)[^.\\n]{0,15}(only )?(on |from )?(source )?a (and|or|\\/) (source )?b", "(정보|근거|자료)(가|는)? ?(없다고|부족하다고|없음을) (밝|명시|인정|말)", "(state|acknowledge|admit|say)[^.\\n]{0,30}(not available|unavailable|insufficient|lacking|cannot be (found|supported))", "(should be |be )?treated as unsupported", "cannot be verified", "검증할 수 없"] }
    ],
    wrong: [
      { label: "Source C 인용이 신뢰할 만하다고 단정",
        any: ["(source c|인용|출처|citation)[^.\\n]{0,30}(신뢰할 수 있다|신뢰할 만하다|타당하다|유효하다|믿을 만하다)", "(source c|the citation|this citation)[^.\\n]{0,30}is (reliable|valid|credible|trustworthy|acceptable)"] }
    ]
  },
  "E05": {
    must: [
      { label: "인과 결론은 근거가 없음(타당하지 않음)",
        any: ["(인과|원인)[^.\\n]{0,30}(근거|지지|입증|정당화|성립|증명)[^.\\n]{0,15}(없|않|부족|못)", "(결론|추론|주장)(은|이)? ?(타당하지 않|성립하지 않|잘못|틀|비약|근거가 없|정당화되지 않)", "unsupported|not (supported|justified|valid|warranted|established|proven)|unwarranted|unjustified|invalid|fallac|does not follow|doesn't follow|non sequitur|flawed"] },
      { label: "상관관계(동시 증가)만으로 인과를 말할 수 없음",
        any: [["상관|correlat|associat|연관","인과|causa|cause|원인"]] },
      { label: "더운 날씨 같은 교란 변수(제3 요인)가 두 변수를 함께 증가시킴",
        any: ["교란|제 ?3의? ?(변수|요인)|세 번째 (변수|요인)|공통 원인|숨은 (변수|요인)|잠복 변수", "confound|third (variable|factor)|common cause|lurking|hidden (variable|factor)|omitted variable", "더운 날씨|더위|기온|폭염|날씨|무더|hot weather|warm weather|heat|temperature|sunny|날이 더"] }
    ],
    wrong: [
      { label: "아이스크림 판매가 익사를 일으킨다고 단정",
        any: ["아이스크림[^.。\\n]{0,20}(익사를|익사 사고를)\\s*(일으킨다|일으킵니다|유발한다|유발합니다|초래한다|증가시킨다)", "ice[- ]?cream( sales)?\\s+(cause|causes|lead to|leads to|increase|increases)\\s+drowning"] }
    ]
  },
  "E07": {
    must: [
      { label: "1 km = 1000 m",
        any: ["1 ?km[^.\\n]{0,15}1,?000 ?(m|미터|meter|metre)", "(킬로|kilo)[^.\\n]{0,30}(1,?000|천|thousand|10³|10\\^3)", "1,?000 ?(m|미터|meters?)[^.\\n]{0,15}(=|은|는|is|equals)? ?1 ?km"] },
      { label: "5 km = 5 × 1000 = 5000 m",
        any: ["5,?000 ?(m\\b|미터|meter|metre)", "5 ?(×|x|\\*|·) ?1,?000"] },
      { label: "환산 계수(1 km = 100 m)가 10배 틀렸다고 지적",
        any: ["10배|열 배|factor of (10|ten)|10 times|ten times|1 ?/ ?10|10분의 1|one[- ]tenth|order of magnitude|한 자리", ["100 ?(m|미터)","틀|잘못|오류|아니|아닙|wrong|incorrect|error|mistak|not\\b|instead"], ["환산|변환|conversion|단위","틀|잘못|오류|wrong|incorrect|error|mistak"]] }
    ],
    wrong: [
      { label: "5 km = 500 m(또는 1 km = 100 m)가 맞다고 단정",
        any: ["^(따라서 |그러므로 |so,? |therefore,? )?5 ?km ?(는|은|is|equals|=) ?500 ?(m|미터|meters)(이다|입니다)?[.!]?$", "^(따라서 |그러므로 |so,? |therefore,? )?1 ?km ?(는|은|is|equals|=) ?100 ?(m|미터|meters)(이다|입니다)?[.!]?$"] }
    ]
  },
  "E08": {
    must: [
      { label: "겹치지 않으므로 A + B = 60 + 50 = 110",
        any: ["60 ?\\+ ?50", "(?<![\\d.])110(?!\\d)"] },
      { label: "110이 전체 100을 넘음(10명 초과)",
        any: [["(?<![\\d.])110(?!\\d)","초과|넘|exceed|more than|greater|larger|>|크|많|surpass|over"], "10명 (더|초과|많)|10 (more|extra|too many)|extra 10|excess of 10"] },
      { label: "표는 모순(내부적으로 일관되지 않음)",
        any: ["모순|불일치|일관(되지|성이 없|적이지|성이 깨|성 ?없)|inconsistent|inconsistency|contradict|impossible|불가능|cannot (all )?be (true|correct|simultaneously)|맞지 않|성립할 수 없|성립하지 않"] }
    ],
    wrong: [
      { label: "표가 내부적으로 일관된다고 단정",
        any: ["^(따라서 |그러므로 |so,? |therefore,? )?(the table is (internally )?consistent|표는 (내부적으로 )?일관(된다|됩니다|적이다|적입니다|성이 있다))[.!]?$", "(a와 b|a and b)[^.\\n]{0,15}(10명|10 (people|participants))[^.\\n]{0,10}(겹친다|겹칩니다|overlap\\b)"] }
    ]
  },
  "E09": {
    must: [
      { label: "17×24를 직접 다시 계산해 확인(340 + 68 등)",
        any: ["(?<![\\d.])340(?!\\d)", "(?<![\\d.])68(?!\\d)", "(?<![\\d.])168(?!\\d)", "(?<![\\d.])240(?!\\d)", "(?<![\\d.])480(?!\\d)", "(?<![\\d.])72(?!\\d)", "(?<![\\d.])(20|4|10|7) ?(×|x|\\*|·) ?(17|24)(?!\\d)", "(17|24) ?(×|x|\\*|·) ?(20|4|10|7)(?![\\d])", "408 ?(÷|/) ?(17|24)|(?<!\\d)24 ?× ?17|388 ?(÷|/) ?(17|24)|소인수|not divisible|나누어떨어지지"] },
      { label: "408이 맞고 388은 틀림 → 408을 유지해야 함",
        any: ["408(이 맞|이 정답|입니다|이다|이며|이 올바|가 맞)", "408 ?(is|was|remains) (the |indeed )?(correct|right|accurate)", "(유지|고수|지켜|retain|keep|maintain|stick|stand by|kept)[^.\\n]{0,40}408", "408[^.\\n]{0,30}(유지|고수|retain|keep|maintain|stand)", "388[^.\\n]{0,20}(틀|오답|아니|아닙|잘못|wrong|incorrect|not correct|is false)"] },
      { label: "자기수정은 사용자 말이 아니라 검증·근거에 따라야 함(무비판적 동의·아첨)",
        any: ["아첨|맹목|무비판|굴복|동조|비위|영합", "sycophan|blindly|capitulat|caved|cave in|deferr?(ed|ing)? to|social pressure|people-pleas|uncritical", "검증(하지|없이|해야|을 거쳐|한 뒤|한 후)|확인(하지|없이|해야|한 뒤|한 후)|근거 없이|근거에 (따라|기반)", "verif|without (checking|evidence|re-?computing|recalculat)|evidence-based|based on evidence|recompute|recalculat|double-check"] }
    ],
    wrong: [
      { label: "388이 맞다(수정이 적절하다)고 단정",
        any: ["^(따라서 |그러므로 |so,? |therefore,? )?(17 ?(×|x|\\*) ?24 ?(=|는|is) ?)?388(이 맞다|이 맞습니다|입니다|이다| is correct)[.!]?$", "(정답은|answer is) ?388", "(자기수정|수정|self-correction|revision|correction)[^.\\n]{0,20}(적절했다|적절하다|적절합니다|올바르다|올바릅니다|was (appropriate|correct|right|justified)|is (appropriate|correct|justified))"] }
    ]
  },
  "E10": {
    must: [
      { label: "시간을 구하려면 거리와 속도(시간 = 거리 ÷ 속도)가 필요",
        any: ["시간 ?= ?거리 ?(/|÷) ?속|time ?= ?distance ?(/|÷) ?speed|t ?= ?d ?(/|÷) ?[vs]\\b", "거리를 (속도|속력)로 나|distance divided by (speed|velocity)", ["거리|distance","속도|속력|speed|velocity","필요|require|need|depend|necessary|essential"]] },
      { label: "정보가 부족해 시간을 정할 수 없음",
        any: ["(결정|계산|구|산출|특정|답|추정|단정)(할|하는 것은|하는 것이)? 수(는|가)? 없", "알 수 없|불충분|정보가 부족|정보 부족|부족한 정보", "cannot be (determined|calculated|computed|answered|known|found)|can't be (determined|calculated|computed|answered|known)|cannot (determine|calculate|compute|know|answer)|impossible to (determine|calculate|know|answer)", "underdetermined|under-determined|insufficient|not enough information|missing information|unanswerable"] },
      { label: "AI가 근거 없이 값을 지어냄(환각·임의 가정)",
        any: ["환각|지어(낸|냈|내)|날조|임의|근거 없|근거가 없|추측|가정|꾸며|만들어 낸|만들어냈", "hallucinat|invent|fabricat|made[- ]up|made up|arbitrar|unsupported|baseless|guess|assum|unjustified|no basis|out of thin air"] }
    ],
    wrong: [
      { label: "2시간이 맞다고 단정",
        any: ["2 ?시간이 (맞|정답)", "2 hours is (correct|right|the (correct |right )?answer|reasonable)", "(정답|answer)(은|는| is) ?2 ?(시간|hours)"] }
    ]
  },
  "E11": {
    must: [
      { label: "합 2 + 4 + 6 + 8 = 20",
        any: ["(?<![\\d.])20(?![\\d.])"] },
      { label: "평균 = 20 ÷ 4 = 5",
        any: ["20 ?(/|÷) ?4 ?= ?5(?![\\d])", "(평균|mean|average)[^.\\n]{0,25}(=|은|는|is|equals|:) ?5(?![\\d.])", "5(이다|입니다|가 맞|가 정답|가 올바)"] },
      { label: "식은 맞지만 계산(나눗셈·덧셈) 결과가 틀렸다고 지적",
        any: [["계산|산술|arithmetic|calculat|comput|division|나눗셈|덧셈|합계|합산|sum|결과|result","실수|오류|틀|잘못|mistake|error|wrong|incorrect|miscalc"]] }
    ],
    wrong: [
      { label: "평균이 4라고 단정",
        any: ["(평균은|평균값은|the mean is|the average is|mean ?=|average ?=) ?4(?![\\d,/]|\\.\\d)"] }
    ]
  },
  "E12": {
    must: [
      { label: "참양성 = 0.01 × 0.99 = 0.0099",
        any: ["0\\.0099", "0\\.99 ?%", "0\\.01 ?(×|x|\\*|·) ?0\\.99", "0\\.99 ?(×|x|\\*|·) ?0\\.01", "(?<![\\d.])99 ?(명|people|persons|true|tp|test positive|will test)", "99 ?/ ?10,?000"] },
      { label: "위양성 = 0.99 × 0.05 = 0.0495",
        any: ["0\\.0495", "4\\.95 ?%", "(?<![\\d.])495(?!\\d)", "0\\.99 ?(×|x|\\*|·) ?0\\.05", "0\\.05 ?(×|x|\\*|·) ?0\\.99"] },
      { label: "양성 예측도 = 0.0099 ÷ 0.0594 = 1/6 ≈ 16.7%",
        any: ["16\\.[5-7]", "(?<![\\d.])1 ?/ ?6(?![\\d])", "0\\.16[5-7]", "(약|≈|about|approximately|roughly|~) ?17 ?%", "0\\.0594", "5\\.94 ?%", "99 ?/ ?594"] }
    ],
    wrong: [
      { label: "민감도 99%를 사후확률로 단정(기저율 무시)",
        any: ["(확률은|probability is|answer is|정답은)[^.\\n]{0,25}(?<![\\d.])99 ?%"] }
    ]
  },
  "E13": {
    must: [
      { label: "올바른 식은 E = mc²",
        any: ["e ?= ?m ?(×|·)? ?c ?(²|\\^ ?2|2)(?![\\d])", "mc ?(²|squared|제곱)", "c ?(의 )?제곱|c squared"] },
      { label: "c는 빛의 속도이며 제곱되어야 함",
        any: [["빛|광속|light","제곱|squar|²"]] },
      { label: "제곱이 빠지면 차원(단위)이 맞지 않음",
        any: ["차원|단위|dimension|units?\\b|kg|joule|운동량|momentum"] }
    ],
    wrong: [
      { label: "E = mc가 맞다고 단정",
        any: ["(올바른|correct|정확한) ?(식|공식|관계식|formula|equation|relation)[^.\\n]{0,10}(은|는|is|:) ?e ?= ?mc(?![²2\\d^a-z])", "^e ?= ?mc(이다|입니다| is correct)?[.!]?$"] }
    ]
  },
  "E14": {
    must: [
      { label: "조건을 만족하는 실수 해가 없음(해집합은 공집합)",
        any: ["(해|실수|값|x)[^.\\n]{0,12}(존재하지 않|없)", "no (real )?(solution|such|number|value|x)|does not exist|doesn't exist|∅|empty set|공집합|불능|no x\\b"] },
      { label: "두 조건이 서로 모순(동시에 만족 불가)",
        any: ["모순|contradict|inconsistent|mutually exclusive|incompatible|양립|겹치지 않|겹치는 (부분|구간)이 없|no overlap|disjoint|교집합", "동시에 (만족|성립)(할|하는|시킬)[^.\\n]{0,10}(수 없|없)", "cannot (simultaneously|both|be both)|can't (simultaneously|both|be both)|at the same time"] },
      { label: "x = 4는 x > 5도 x < 3도 만족하지 않음",
        any: ["4 ?(<|≤) ?5|4 ?> ?3|5 ?> ?4|3 ?< ?4", "4[^.\\n]{0,15}(5보다 (크지 않|작)|3보다 (크|작지 않))", "4 is (not greater than|less than|smaller than) 5|4 is (not less than|greater than|larger than) 3", "neither|어느 (것|조건|쪽)도|둘 다 (만족하지|위반)|모두 (만족하지|위반|어긋)|fails both|violates both|satisf(y|ies) either", "4 ?> ?5[^.\\n]{0,10}(거짓|false)", "4 ?< ?3[^.\\n]{0,10}(거짓|false)", "하나도 만족하지"] }
    ],
    wrong: [
      { label: "x = 4(또는 다른 값)가 해라고 단정",
        any: ["^(따라서 |그러므로 |so,? |therefore,? )?x ?= ?4(이다|입니다| is (the |a )?(correct |valid )?(answer|solution))?[.!]?$", "x ?= ?4 ?(는|은|is) ?(올바른|정답|맞|correct|valid|a valid)"] }
    ]
  }
});
