// 근거 기준(P2_RUBRIC) 회귀 견본: 문항마다 AI가 쓴 맞는 답 2개(good: 짧은 한국어·긴 영어)와 틀린 답 2개(bad: 결론만·흔한 오류).
// 실제 답이 아니라, 나머지 50문항 기준을 쓸 때 함께 만든 것(2026-10-21). good은 필수 근거를 모두 짚고, bad는 근거가 모자라거나 틀린 근거가 걸려야 한다.
module.exports = {
  "M02": {
    good: [
      "전체 배열은 5! = 120가지입니다. A와 B를 한 묶음으로 보면 4! × 2 = 48가지가 이웃하는 경우입니다. 따라서 120 − 48 = 72가지입니다.",
      "## Approach: Complementary Counting\n\n**Step 1 – Total arrangements.** Without restrictions, $5! = 120$.\n\n**Step 2 – A and B adjacent.**\n- Glue A and B into a single block, so we arrange 4 units: $4! = 24$.\n- Inside the block, A and B can be ordered in 2 ways.\n- Adjacent arrangements: $4! \\times 2 = 48$.\n\n**Step 3 – Subtract.**\n$$120 - 48 = 72$$\n\n### Cross-check (gap method)\nArrange C, D, E first: $3! = 6$. There are 4 gaps, and we place A and B in two different gaps in order: $4 \\times 3 = 12$. Total $6 \\times 12 = 72$.\n\n**Answer: 72**"
    ],
    bad: [
      "정답은 72가지입니다.",
      "A와 B를 하나로 묶으면 4! = 24가지이므로 이웃하는 경우는 24가지입니다. 120 − 24 = 96. 따라서 답은 96가지입니다."
    ]
  },
  "M03": {
    good: [
      "양변에 1/2을 더하면 a(n+1) + 1/2 = 3(a(n) + 1/2)입니다. b(n) = a(n) + 1/2로 두면 b(1) = 5/2인 공비 3의 등비수열이므로 b(n) = (5/2)·3^(n-1), 따라서 a(n) = (5·3^(n-1) − 1)/2입니다.",
      "## Solving the Recurrence\n\n### 1. Find the fixed point\nSolve $c = 3c + 1$, giving $c = -\\frac{1}{2}$.\n\n### 2. Shift the sequence\nLet $b_n = a_n + \\frac{1}{2}$. Then\n$$b_{n+1} = a_{n+1} + \\tfrac12 = 3a_n + \\tfrac32 = 3b_n.$$\nSo $b_n$ is geometric with ratio 3 and $b_1 = 2 + \\frac{1}{2} = \\frac{5}{2}$.\n\n### 3. Closed form\n$$a_n = \\frac{5}{2}\\cdot 3^{n-1} - \\frac{1}{2} = \\frac{5\\cdot 3^{n-1}-1}{2}$$\n\n### 4. Verification\n- $n=1$: $(5-1)/2 = 2$ ✓\n- $n=2$: $(15-1)/2 = 7$, and $3\\cdot 2 + 1 = 7$ ✓"
    ],
    bad: [
      "a(n) = (5·3^(n-1) − 1)/2",
      "처음 몇 항이 2, 7, 22, 67이니 매번 3배씩 늘어난다. 그러므로 일반항은 다음과 같다.\na(n) = 2·3^(n-1)"
    ]
  },
  "M04": {
    good: [
      "두 식을 빼면 (t−1)x = 1입니다. t ≠ 1이면 x = 1/(t−1), y = 2 − 1/(t−1)로 유일해입니다. t = 1이면 x+y=2와 x+y=3이 모순이므로 해가 없습니다.",
      "## Analysis\n\n### Elimination\nSubtract the first equation from the second:\n$$(tx + y) - (x + y) = 3 - 2 \\implies (t-1)x = 1.$$\n\n### Case 1: $t \\neq 1$\nWe can divide by $t-1$:\n- $x = \\frac{1}{t-1}$\n- $y = 2 - x = 2 - \\frac{1}{t-1} = \\frac{2t-3}{t-1}$\n\nThe solution is **unique**.\n\n### Case 2: $t = 1$\nThe system becomes $x + y = 2$ and $x + y = 3$, i.e. $0 = 1$ after subtraction. The lines are parallel and distinct, so there is **no solution** (inconsistent)."
    ],
    bad: [
      "t ≠ 1이면 유일해, t = 1이면 해가 없다.",
      "Subtracting gives (t-1)x = 1, so x = 1/(t-1) and y = 2 - 1/(t-1).\nWhen t = 1 the two equations describe the same line, so there are infinitely many solutions."
    ]
  },
  "M06": {
    good: [
      "1/[k(k+1)] = 1/k − 1/(k+1)이므로 합하면 중간 항이 모두 지워져 1 − 1/(n+1) = n/(n+1)입니다.",
      "## Evaluating the Sum\n\n### Partial fractions\n$$\\frac{1}{k(k+1)} = \\frac{1}{k} - \\frac{1}{k+1}$$\n\n### Telescoping\n$$\\sum_{k=1}^{n}\\left(\\frac{1}{k} - \\frac{1}{k+1}\\right) = \\left(1 - \\frac12\\right) + \\left(\\frac12 - \\frac13\\right) + \\cdots + \\left(\\frac1n - \\frac{1}{n+1}\\right)$$\nEvery intermediate term cancels, leaving\n$$1 - \\frac{1}{n+1} = \\frac{n}{n+1}.$$\n\n**Check:** $n=1$ gives $1/2$, matching $\\frac{1}{1\\cdot 2}$."
    ],
    bad: [
      "답: n/(n+1)",
      "1/[k(k+1)] = 1/k − 1/(k+1)로 쪼개면 대부분 상쇄되고 처음과 끝이 남아 합 = 1 − 1/n"
    ]
  },
  "M07": {
    good: [
      "거짓입니다. 반례로 a(n) = (−1)^n은 −1과 1 사이에 있어 유계이지만 −1과 1을 번갈아 진동하므로 수렴하지 않습니다.",
      "## Verdict: **False**\n\n### Counterexample\nConsider $a_n = (-1)^n$: the terms are $-1, 1, -1, 1, \\dots$\n\n- **Bounded:** $|a_n| \\le 1$ for all $n$.\n- **Not convergent:** the sequence alternates between $-1$ and $1$. The even-indexed subsequence tends to $1$ while the odd-indexed subsequence tends to $-1$, so there is no single limit.\n\n### Note\nBoundedness is necessary for convergence, but not sufficient (Bolzano–Weierstrass only guarantees a convergent *subsequence*)."
    ],
    bad: [
      "False. Counterexample exists.",
      "유계인 수열은 위아래로 막혀 있으므로 결국 한 값에 모인다. 따라서 이 명제는 참이다."
    ]
  },
  "M08": {
    good: [
      "대우를 증명한다. n이 홀수이면 n = 2k+1이고 n² = 4k² + 4k + 1 = 2(2k² + 2k) + 1이므로 홀수이다. 따라서 n²이 짝수이면 n도 짝수이다.",
      "## Proof by Contrapositive\n\nThe statement \"if $n^2$ is even then $n$ is even\" is equivalent to its **contrapositive**: if $n$ is odd, then $n^2$ is odd.\n\n### Step 1\nLet $n$ be odd, so $n = 2k + 1$ for some integer $k$.\n\n### Step 2\n$$n^2 = (2k+1)^2 = 4k^2 + 4k + 1 = 2(2k^2 + 2k) + 1.$$\nSince $2k^2 + 2k$ is an integer, $n^2$ is odd.\n\n### Conclusion\nThe contrapositive holds, hence if $n^2$ is even, $n$ is even. $\\blacksquare$"
    ],
    bad: [
      "n²이 짝수이면 n도 짝수이다. 증명 끝.",
      "Assume n is even, so n = 2k. Then n² = 4k² = 2(2k²) is even. Hence the statement holds."
    ]
  },
  "M09": {
    good: [
      "산술·기하 평균에 의해 x + 16/x ≥ 2√16 = 8이고, 등호는 x = 16/x, 즉 x = 4일 때 성립합니다. 최솟값은 8입니다.",
      "## Minimizing $f(x) = x + \\frac{16}{x}$ for $x > 0$\n\n### Method 1: AM–GM\nSince $x > 0$ and $\\frac{16}{x} > 0$:\n$$x + \\frac{16}{x} \\ge 2\\sqrt{x\\cdot\\frac{16}{x}} = 2\\sqrt{16} = 8.$$\nEquality holds when $x = \\frac{16}{x}$, i.e. $x^2 = 16$. Because $x>0$, $x = 4$.\n\n### Method 2: Calculus\n$f'(x) = 1 - \\frac{16}{x^2} = 0 \\Rightarrow x = 4$ (the root $-4$ is excluded), and $f''(4) > 0$.\n\n**Minimum value: 8, attained at x = 4.**"
    ],
    bad: [
      "최솟값 8, x = 4",
      "f'(x) = 1 - 16/x² = 0 gives x = ±4. f(-4) = -8 is smaller than f(4) = 8, so the minimum value is -8 at x = -4."
    ]
  },
  "M10": {
    good: [
      "|A∪B| = |A| + |B| − |A∩B|이므로 |A∩B| = 28 + 35 − 50 = 13입니다.",
      "## Inclusion–Exclusion\n\n### Principle\nWhen we add $|A| + |B|$, elements in both sets are counted twice:\n$$|A \\cup B| = |A| + |B| - |A \\cap B|.$$\n\n### Solve\n$$|A \\cap B| = |A| + |B| - |A\\cup B| = 28 + 35 - 50 = 63 - 50 = 13.$$\n\n**Answer: 13**"
    ],
    bad: [
      "13",
      "A와 B를 합치면 28 + 35 = 63이다. 그러므로 답은 63이다."
    ]
  },
  "M11": {
    good: [
      "f(n) = n²입니다. n = 0일 때 f(0) = 0 = 0²이고, f(n) = n²이라 하면 f(n+1) = n² + 2n + 1 = (n+1)²이므로 귀납적으로 성립합니다.",
      "## Finding $f(n)$\n\nComputing a few values: $f(1)=1$, $f(2)=4$, $f(3)=9$ — sums of consecutive odd numbers. Conjecture: $f(n) = n^2$.\n\n## Proof by Induction\n\n### Base case\n$n = 0$: $f(0) = 0 = 0^2$ ✓\n\n### Inductive step\nAssume $f(k) = k^2$. Then\n$$f(k+1) = f(k) + 2k + 1 = k^2 + 2k + 1 = (k+1)^2.$$\n\nBy induction, $f(n) = n^2$ for all $n \\ge 0$."
    ],
    bad: [
      "f(n) = n²",
      "f(1)=1, f(2)=4, f(3)=9 이므로 n번째 항은 다음과 같다.\nf(n) = (n+1)²"
    ]
  },
  "M12": {
    good: [
      "AB = [[2,1],[1,1]], BA = [[1,1],[1,2]]로 AB ≠ BA입니다. 따라서 행렬 곱셈은 일반적으로 교환법칙이 성립하지 않습니다.",
      "## Computing the Products\n\n### $AB$\n$$AB = \\begin{pmatrix}1&1\\\\0&1\\end{pmatrix}\\begin{pmatrix}1&0\\\\1&1\\end{pmatrix} = \\begin{pmatrix}2&1\\\\1&1\\end{pmatrix}$$\n\n### $BA$\n$$BA = \\begin{pmatrix}1&0\\\\1&1\\end{pmatrix}\\begin{pmatrix}1&1\\\\0&1\\end{pmatrix} = \\begin{pmatrix}1&1\\\\1&2\\end{pmatrix}$$\n\n## Conclusion\n- $AB \\neq BA$\n- This single counterexample shows matrix multiplication is **not commutative** in general (though some pairs, like a matrix and the identity, do commute)."
    ],
    bad: [
      "AB ≠ BA, so matrix multiplication is not commutative.",
      "AB = [[1,1],[1,2]] and BA = [[1,1],[1,2]].\nTherefore AB = BA."
    ]
  },
  "M14": {
    good: [
      "두 근의 곱은 12이고 차가 1인 양의 정수 쌍은 3과 4입니다. 비에타 공식에 따라 두 근의 합이 s이므로 \\( s = 3 + 4 = 7 \\)입니다.",
      "## Step 1: Vieta's formulas\nFor $p(x) = x^2 - sx + 12$, the roots $r_1, r_2$ satisfy:\n- $r_1 r_2 = 12$\n- $r_1 + r_2 = s$\n\n## Step 2: Integer factor pairs of 12\n| Pair | Difference |\n|---|---|\n| 1 × 12 | 11 |\n| 2 × 6 | 4 |\n| 3 × 4 | 1 |\n\nOnly **3 × 4** differs by 1, so the roots are 3 and 4.\n\n## Step 3: Compute s\n$$s = r_1 + r_2 = 3 + 4 = 7$$\n\n**Answer: s = 7**"
    ],
    bad: [
      "s = 7",
      "곱이 12이고 차가 1인 두 수는 -3과 -4이므로 근의 합에서 부호를 반영하면 s = -7입니다."
    ]
  },
  "M15": {
    good: [
      "아니요. 두 점을 지나는 원의 중심은 수직이등분선 x=1 위의 (1, c)이고 반지름은 \\( \\sqrt{1+c^2} \\)이라 c에 따라 달라집니다. 따라서 반지름은 무수히 많아 유일하게 결정할 수 없습니다.",
      "## Short answer\n**No.** The radius is not uniquely determined.\n\n## Reasoning\n- Any circle through $(0,0)$ and $(2,0)$ has its center equidistant from both points, so the center lies on the **perpendicular bisector** $x = 1$.\n- Write the center as $(1, c)$. Then\n$$r = \\sqrt{(1-0)^2 + (c-0)^2} = \\sqrt{1 + c^2}.$$\n- As $c$ varies over all real numbers, the radius varies over $[1, \\infty)$.\n\n## Conclusion\nThere are infinitely many such circles with different radii; the minimum radius is 1 (when $c = 0$), but two points alone do not fix the radius."
    ],
    bad: [
      "No, it cannot be determined.",
      "두 점 사이의 거리가 2이므로 이 선분이 지름이다. 중심은 (1,0)이다.\n따라서 반지름은 1이다."
    ]
  },
  "L01": {
    good: [
      "P: 서버가 다운됨, Q: 웹사이트 접속 불가라 하면 전제는 \\(P \\to Q\\), \\(\\neg Q\\)이고 결론은 \\(\\neg P\\)입니다. 이는 후건 부정(modus tollens)으로 타당한 논증입니다.",
      "## Symbolization\n- $P$: the server is down\n- $Q$: the website is unavailable\n\n## Structure\n1. $P \\rightarrow Q$\n2. $\\neg Q$ (the website is available)\n3. Therefore $\\neg P$\n\n## Evaluation\nThis is **modus tollens** (denying the consequent). If $P$ were true, $Q$ would have to be true, contradicting premise 2. So the argument is **valid**."
    ],
    bad: [
      "Valid modus tollens.",
      "이 논증은 전건 부정의 형식이므로 결론이 반드시 따라 나온다고 볼 수 있다."
    ]
  },
  "L02": {
    good: [
      "타당하지 않습니다. 후건 긍정의 오류입니다. 스프링클러 등 다른 원인으로도 땅이 젖을 수 있으므로 땅이 젖었다고 해서 비가 왔다는 결론이 따라 나오지 않습니다.",
      "## Form\n- Premise 1: $P \\rightarrow Q$ (rain → wet ground)\n- Premise 2: $Q$ (the ground is wet)\n- Conclusion: $P$ (it rained)\n\n## Verdict\nThe inference is **invalid**. It commits the fallacy of **affirming the consequent**.\n\n## Why\nThe ground can be wet for other reasons, such as a sprinkler or a burst pipe. So $Q$ being true does not guarantee $P$."
    ],
    bad: [
      "Invalid; affirming the consequent.",
      "비가 오면 땅이 젖고 실제로 땅이 젖어 있으니 비가 온 것이 맞다.\n따라서 이 추론은 타당하다."
    ]
  },
  "L04": {
    good: [
      "부정하면 양화사가 바뀌어 '모든'은 '어떤'으로, '적어도 한 문제'는 '모든 문제를 풀지 않음'이 됩니다. 따라서 \"한 문제도 풀지 못한 학생이 적어도 한 명 있다\"입니다.",
      "## Formalization\n$$\\forall s \\, \\exists p \\; \\text{Solved}(s,p)$$\n\n## Negation\nNegating flips each quantifier: the universal becomes existential and the existential becomes universal.\n$$\\exists s \\, \\forall p \\; \\neg \\text{Solved}(s,p)$$\n\n## Natural language\n**There exists at least one student who solved no problems.**"
    ],
    bad: [
      "There is a student who solved no problems.",
      "모든 학생이 한 문제를 못 풀었다."
    ]
  },
  "L05": {
    good: [
      "네, 타당합니다. 뱀은 모두 파충류 집합에 포함되고 파충류와 온혈동물은 겹치지 않으므로, 어떤 뱀도 온혈동물일 수 없습니다.",
      "## Structure\n- Major premise: No reptiles are warm-blooded (E)\n- Minor premise: All snakes are reptiles (A)\n- Conclusion: No snakes are warm-blooded (E)\n\nThis is the classic **Celarent (EAE-1)** form.\n\n## Set view\n- Snakes $\\subseteq$ Reptiles\n- Reptiles $\\cap$ Warm-blooded $= \\emptyset$\n- Therefore Snakes $\\cap$ Warm-blooded $= \\emptyset$\n\n## Verdict\nYes, the argument is **valid**."
    ],
    bad: [
      "Yes, valid.",
      "모든 뱀이 파충류라고 해도 일부 뱀은 온혈동물일 수도 있다. 매개념 부주연이 생긴다."
    ]
  },
  "L06": {
    good: [
      "\\( P \\to Q \\equiv \\neg P \\lor Q \\). 함의는 P가 참이고 Q가 거짓일 때만 거짓이며, \\(\\neg P \\lor Q\\)도 그 경우에만 거짓이므로 진리표가 같습니다.",
      "## Answer\n$$P \\rightarrow Q \\equiv \\neg P \\lor Q$$\n\n## Truth table check\n| P | Q | P→Q | ¬P∨Q |\n|---|---|---|---|\n| T | T | T | T |\n| T | F | F | F |\n| F | T | T | T |\n| F | F | T | T |\n\nBoth columns are false only when P is true and Q is false, so they are equivalent."
    ],
    bad: [
      "¬P ∨ Q",
      "P→Q는 P∨¬Q와 동치이다. 결론을 보면 Q가 있으면 P도 있어야 하기 때문이다."
    ]
  },
  "L07": {
    good: [
      "부당합니다. 반례: 갑은 시인이자 몽상가지만 과학자가 아니고, 을은 몽상가이자 과학자지만 시인이 아닙니다. 과학자인 몽상가가 시인과 다른 사람일 수 있으므로 두 전제는 참이고 결론은 거짓입니다.",
      "## Verdict\nThe argument is **invalid** (undistributed middle).\n\n## Countermodel\n- Individual $a$: poet, dreamer, **not a scientist**\n- Individual $b$: dreamer, scientist, **not a poet**\n\n## Check\n- All poets are dreamers: only $a$ is a poet, and $a$ is a dreamer. ✓\n- Some dreamers are scientists: $b$. ✓\n- Some poets are scientists: no poet is a scientist. ✗\n\nThe dreamers who are scientists may be entirely different individuals from the poets, so the premises do not force any overlap."
    ],
    bad: [
      "Invalid.",
      "모든 시인은 몽상가이고 어떤 몽상가는 과학자이므로 그 몽상가 중에 시인이 들어 있다.\n따라서 어떤 시인은 과학자이다."
    ]
  },
  "L08": {
    good: [
      "A가 기사라면 B는 거짓말쟁이이고, 그러면 B의 말 '서로 다른 유형'이 참이 되어 모순입니다. A가 거짓말쟁이이면 B는 기사이고 B의 말이 참이므로 일관됩니다. 따라서 A는 거짓말쟁이, B는 기사입니다.",
      "## Case 1: A is a knight\n- Then A's statement is true, so B is a knave.\n- A knight and a knave are different types, so B's statement would be true.\n- But a knave cannot say something true, which is a **contradiction**.\n\n## Case 2: A is a knave\n- A's statement is false, so B is a knight.\n- They are of different types, so B's statement is true, which is consistent with B being a knight.\n\n## Answer\n**A is a knave; B is a knight.**"
    ],
    bad: [
      "A is a knave; B is a knight.",
      "A는 B가 거짓말쟁이라고 말했으니 그대로 믿으면 된다.\n따라서 A는 기사이고 B는 거짓말쟁이이다."
    ]
  },
  "L09": {
    good: [
      "Q가 P의 필요조건이라는 것은 Q 없이는 P가 성립할 수 없다는 뜻이므로 \\(P \\to Q\\)입니다. 충분조건이 아니므로 \\(Q \\to P\\)는 성립하지 않으며, Q만으로는 P가 보장되지 않습니다.",
      "## Necessary condition\n\"Q is necessary for P\" means P cannot occur without Q:\n$$P \\rightarrow Q$$\n\n## Not sufficient\n\"Q is not sufficient for P\" means Q alone does not guarantee P:\n$$\\neg (Q \\rightarrow P)$$\nThat is, there is at least one case where Q is true and P is false ($Q \\land \\neg P$).\n\n## Summary\n- $P \\rightarrow Q$ holds\n- $Q \\rightarrow P$ is not guaranteed"
    ],
    bad: [
      "P → Q, ¬(Q → P)",
      "필요조건: Q → P 이다. 반대 방향 P → Q 는 성립하지 않는다."
    ]
  },
  "L10": {
    good: [
      "이 추론은 선언적 삼단논법입니다. P∨Q가 참이면 P와 Q 중 적어도 하나는 참인데, ¬P로 P가 거짓이므로 Q가 참이어야 합니다. 따라서 타당한 추론입니다.",
      "## Identifying the Inference\n\nThe argument has the form:\n\n$$P lor Q,quad \neg P ;\u000bdash; Q$$\n\n### Name of the Rule\n- This is **Disjunctive Syllogism** (also called *modus tollendo ponens*).\n\n### Validity\n- The disjunction \\(P \\lor Q\\) (inclusive OR) asserts that **at least one** of \\(P\\) or \\(Q\\) is true.\n- The second premise \\(\\neg P\\) tells us \\(P\\) is false.\n- Hence the only remaining possibility is that \\(Q\\) is true.\n\n| P | Q | P∨Q | ¬P | Q |\n|---|---|---|---|---|\n| F | T | T | T | T |\n\nThe only row where both premises are true has Q true, so the inference is **valid**.\n\n**Conclusion:** Disjunctive syllogism; the argument is deductively valid."
    ],
    bad: [
      "선언적 삼단논법이며 타당하다.",
      "This inference is called modus ponens. Since we are given ¬P and P∨Q, we can get Q, so it is valid."
    ]
  },
  "L11": {
    good: [
      "아니요, 확정되지 않습니다. 카메라 설치 뒤 범죄가 줄었다는 시간적 선후만으로는 인과 관계가 입증되지 않습니다(post hoc 오류). 같은 시기 경찰 단속 강화, 경제 상황, 평균 회귀 같은 다른 요인이 원인일 수 있으므로 비교 도시 같은 추가 증거가 필요합니다.",
      "## Evaluation of the Causal Claim\n\n### Verdict\nThe conclusion is **not logically established**.\n\n### Why\n- **Post hoc reasoning:** The argument infers causation purely from temporal sequence — crime fell *after* installation. Correlation in time does not establish causation.\n- **Confounding factors:** Other changes could explain the drop:\n  - increased police enforcement or new policies,\n  - economic improvement or demographic shifts,\n  - a pre-existing downward trend,\n  - regression to the mean if cameras were installed after an unusual spike.\n\n### What Would Be Needed\nTo support a causal claim we would need additional evidence, e.g. a **comparison group** of similar cities without cameras, data on pre-installation trends, or a study controlling for these variables.\n\n**Bottom line:** The temporal association alone is insufficient; the causal conclusion does not follow."
    ],
    bad: [
      "아니요, 확정되지 않습니다.",
      "카메라 설치 직후 범죄율이 줄었으므로 둘 사이의 관련성은 분명하다.\n따라서 감시카메라 설치가 범죄 감소의 원인이다."
    ]
  },
  "L12": {
    good: [
      "이 논증은 무지에 호소하는 오류입니다. 유령이 없다는 것이 증명되지 않았다는 사실은 유령이 있다는 증거가 아닙니다. 따라서 결론은 전제에서 따라 나오지 않습니다.",
      "## Identifying the Fallacy\n\n### Name\nThis is the **argument from ignorance** (*argumentum ad ignorantiam*).\n\n### Structure\n- Premise: \\(\\neg P\\) has not been proven (no one has shown ghosts don't exist).\n- Conclusion: \\(P\\) is true (ghosts exist).\n\n### Why It Fails\n- A **lack of proof** for \\(\\neg P\\) is not proof of \\(P\\). The question simply remains unknown.\n- The burden of proof lies with the person making the positive claim.\n- The same pattern could \"prove\" contradictory claims, which shows it is unreliable.\n\n**Conclusion:** The conclusion does not follow from the premise; the argument is invalid."
    ],
    bad: [
      "Argument from ignorance.",
      "유령이 존재하지 않는다는 반증이 아직 나오지 않았으므로 유령의 존재 가능성은 열려 있다.\n따라서 유령은 존재한다."
    ]
  },
  "L13": {
    good: [
      "Q는 거짓입니다. P↔Q는 P와 Q의 진리값이 같을 때만 참인데, P가 거짓이므로 Q도 거짓이어야 합니다.",
      "## Truth Value of Q\n\n### The Biconditional\nA biconditional \\(P \\leftrightarrow Q\\) means \\((P \\to Q) \\land (Q \\to P)\\). It is true **exactly when P and Q have the same truth value**.\n\n| P | Q | P↔Q |\n|---|---|---|\n| T | T | T |\n| T | F | F |\n| F | T | F |\n| F | F | T |\n\n### Applying the Premises\n- \\(P \\leftrightarrow Q\\) is true.\n- \\(P\\) is false.\n- The only row with P false and P↔Q true is the last one.\n\n**Answer:** Q must be false."
    ],
    bad: [
      "Q는 거짓이다.",
      "P↔Q에서 P가 거짓이면 P→Q는 자동으로 참이므로 Q에 대한 제약이 없다.\nQ는 참이다."
    ]
  },
  "L14": {
    good: [
      "동시에 참일 수 없습니다. P와 P→Q가 참이면 전건 긍정으로 Q가 참이 됩니다. 그런데 ¬Q가 참이면 Q는 거짓이므로 Q ∧ ¬Q라는 모순이 생깁니다.",
      "## Consistency Check\n\n### Short Answer\n**No** — the three premises are inconsistent.\n\n### Derivation\n1. \\(P\\) (premise)\n2. \\(P \\to Q\\) (premise)\n3. From 1 and 2 by **modus ponens**: \\(Q\\)\n4. \\(\\neg Q\\) (premise)\n5. Lines 3 and 4 give \\(Q \\land \\neg Q\\), a contradiction.\n\n### Truth-Table View\n- For P→Q to be true while P is true, Q must be true.\n- But ¬Q requires Q to be false.\n- No assignment satisfies all three, so the set is unsatisfiable."
    ],
    bad: [
      "No, they cannot all be true.",
      "Yes, they can all be true at the same time. Each premise is about a different statement, so we can assign P true and Q false independently."
    ]
  },
  "S01": {
    good: [
      "뉴턴 제2법칙 F = ma에서 a = F/m = 6/2 = 3 m/s²입니다.",
      "## Finding the Acceleration\n\n### Given\n- Net force: \\(F = 6\\,\\text{N}\\)\n- Mass: \\(m = 2\\,\\text{kg}\\)\n\n### Principle\nNewton's second law:\n$$F = ma \\quad\\Rightarrow\\quad a = \\frac{F}{m}$$\n\n### Calculation\n$$a = \\frac{6\\,\\text{N}}{2\\,\\text{kg}} = 3\\,\\text{m/s}^2$$\n\n**Answer:** The acceleration is **3 m/s²** in the direction of the net force."
    ],
    bad: [
      "가속도는 3입니다.",
      "Using F = ma, a = F × m = 6 × 2 = 12 m/s²."
    ]
  },
  "S02": {
    good: [
      "직렬이므로 전체 저항은 2 + 4 = 6 Ω입니다. 전류 I = 12/6 = 2 A이고, 4 Ω 양단 전압은 V = 2 × 4 = 8 V입니다.",
      "## Series Circuit Analysis\n\n### Step 1: Equivalent Resistance\nIn series, resistances add:\n$$R_{total} = 2\\,\\Omega + 4\\,\\Omega = 6\\,\\Omega$$\n\n### Step 2: Current\nBy Ohm's law:\n$$I = \\frac{V}{R_{total}} = \\frac{12}{6} = 2\\,\\text{A}$$\nThe same current flows through both resistors.\n\n### Step 3: Voltage Across the 4 Ω Resistor\n$$V_4 = I R = 2\\,\\text{A} \\times 4\\,\\Omega = 8\\,\\text{V}$$\n\n(Check: the 2 Ω resistor drops 4 V, and 4 V + 8 V = 12 V.)\n\n**Answer:** Current = 2 A; voltage across 4 Ω = 8 V."
    ],
    bad: [
      "전류 2 A, 전압 8 V.",
      "Treating the resistors in parallel, 1/R = 1/2 + 1/4 so R = 4/3 Ω. The current is 9 A, and the voltage across the 4 Ω resistor is 12 V."
    ]
  },
  "S03": {
    good: [
      "처음 위치에너지는 mgh = 2×10×5 = 100 J입니다. 20 J가 열로 소산되었으므로 운동에너지는 100 − 20 = 80 J입니다.",
      "## Energy Accounting\n\n### Initial Energy\nThe object starts at rest, so all its energy is gravitational potential energy:\n$$U = mgh = 2 \\times 10 \\times 5 = 100\\,\\text{J}$$\n\n### Energy Losses\n- Heat dissipated before impact: \\(20\\,\\text{J}\\)\n\n### Kinetic Energy at Impact\nBy energy conservation including dissipation:\n$$K = U - Q = 100\\,\\text{J} - 20\\,\\text{J} = 80\\,\\text{J}$$\n\n**Answer:** The kinetic energy just before impact is **80 J**."
    ],
    bad: [
      "Kinetic energy just before impact is 80 J.",
      "위치에너지 mgh = 100 J가 모두 운동에너지로 바뀐다. 운동에너지는 100 J이다."
    ]
  },
  "S04": {
    good: [
      "부피가 일정하므로 압력은 절대온도에 비례합니다(P/T 일정). P₂ = 100 × 450/300 = 150 kPa입니다.",
      "## Constant-Volume Gas Problem\n\n### Principle\nFor a fixed amount of ideal gas at constant volume, **Gay-Lussac's law** holds:\n$$\\frac{P_1}{T_1} = \\frac{P_2}{T_2}$$\n\n### Given\n- \\(P_1 = 100\\,\\text{kPa}\\), \\(T_1 = 300\\,\\text{K}\\)\n- \\(T_2 = 450\\,\\text{K}\\)\n\n### Solve\n$$P_2 = P_1 \\times \\frac{T_2}{T_1} = 100 \\times \\frac{450}{300} = 100 \\times 1.5$$\n\n**Answer:** \\(P_2 = 150\\,\\text{kPa}\\)"
    ],
    bad: [
      "Final pressure: 150 kPa.",
      "압력은 온도에 반비례하므로 P₂ = 100 × 300/450 ≈ 66.7 kPa이다."
    ]
  },
  "S06": {
    good: [
      "희석해도 HCl 몰수는 그대로이므로 M₁V₁ = M₂V₂를 씁니다. M₂ = 1.0 × 100/500 = 0.20 M입니다.",
      "## Dilution Calculation\n\n### Key Idea\nAdding water does not change the amount of solute — the **moles of HCl remain constant**:\n$$M_1V_1 = M_2V_2$$\n\n### Given\n- \\(M_1 = 1.0\\,\\text{M}\\), \\(V_1 = 100\\,\\text{mL}\\)\n- Final volume \\(V_2 = 500\\,\\text{mL}\\) (total, not the water added)\n\n### Solve\n$$M_2 = \\frac{1.0 \\times 100}{500} = 0.20\\,\\text{M}$$\n\n(Moles of HCl: 0.10 mol, now spread over 0.500 L.)\n\n**Answer:** **0.20 M**"
    ],
    bad: [
      "최종 농도는 0.20 M이다.",
      "Water added is 400 mL, so M2 = 1.0 × 100/400. The final concentration is 0.25 M."
    ]
  },
  "S08": {
    good: [
      "Aa × Aa 교배에서 자녀는 AA : Aa : aa = 1/4 : 1/2 : 1/4 입니다.\n열성 표현형이 아니므로 aa는 제외되고, 남은 확률은 1/4 + 1/2 = 3/4입니다.\n따라서 \\( P(Aa \\mid \\text{비발현}) = \\frac{1/2}{3/4} = \\frac{2}{3} \\) 입니다.",
      "## Setting up the cross\n\nFor the cross $Aa \\times Aa$, the Punnett square gives:\n\n| Genotype | Probability |\n|---|---|\n| AA | $\\frac{1}{4}$ |\n| Aa | $\\frac{1}{2}$ |\n| aa | $\\frac{1}{4}$ |\n\n## Conditioning on the phenotype\n\n- We are told the child is **unaffected**, so the outcome **aa is excluded**.\n- The probability of being unaffected is $P(AA) + P(Aa) = \\frac{1}{4} + \\frac{1}{2} = \\frac{3}{4}$.\n\n## Bayes / conditional probability\n\n$$P(Aa \\mid \\text{unaffected}) = \\frac{P(Aa)}{P(\\text{unaffected})} = \\frac{1/2}{3/4} = \\frac{2}{3}$$\n\n**Answer:** The conditional probability is $\\frac{2}{3} \\approx 0.667$."
    ],
    bad: [
      "답: 2/3",
      "Aa × Aa에서 자녀가 Aa일 확률은 1/2이다. 열성 표현형이 아니라는 정보는 상관없으므로 조건부 확률은 1/2이다."
    ]
  },
  "S09": {
    good: [
      "- 독립변수: 온도 (예: 20, 30, 40, 50 °C)\n- 종속변수: 반응속도 (1분당 생성되는 산소 기포 수 측정)\n- 통제변수: pH, 효소 농도, 기질 농도, 반응 용액 부피\n- 반복: 온도마다 3회 이상 반복해 평균을 내고, 우연 오차와 변동을 줄입니다.",
      "## Experimental Design: Temperature and Enzyme Activity\n\n### Independent Variable\n- **Temperature**, set at several levels (e.g., $10^\\circ$C, $20^\\circ$C, $30^\\circ$C, $40^\\circ$C, $50^\\circ$C) using water baths.\n\n### Dependent Variable\n- **Reaction rate**, measured as the volume of oxygen produced per minute (catalase + H$_2$O$_2$), or the change in absorbance over time.\n\n### Controlled Variables\n1. **pH** — use the same buffer (pH 7).\n2. **Enzyme concentration** — identical volume and concentration of catalase in every tube.\n3. **Substrate concentration** — same concentration of hydrogen peroxide.\n4. **Total volume and reaction time** — same total volume and the same measurement window.\n\n### Role of Replication\n- Run **at least three trials** per temperature.\n- Replicates let us estimate **variability** and compute a mean, reducing the influence of **random error** and revealing outliers.\n\n### Procedure Summary\nPre-incubate enzyme and substrate at each temperature, mix, and record the oxygen produced."
    ],
    bad: [
      "온도를 바꿔가며 효소 반응을 관찰하면 됩니다.",
      "Independent variable: temperature. Dependent variable: reaction rate.\nWe will change temperature and pH at the same time to see a bigger effect.\nA single trial is enough because the enzyme behaves consistently."
    ]
  },
  "S10": {
    good: [
      "항생제를 쓰기 전부터 세균 집단에는 무작위 돌연변이로 생긴 내성 변이가 이미 존재했습니다. 항생제는 민감한 세균을 죽이고, 내성 세균이 살아남아 번식하면서 집단 내 내성 유전자의 빈도가 높아진 것입니다. 세균이 필요를 느껴 내성을 만든 것이 아닙니다.",
      "## Why \"they created resistance because they needed it\" is wrong\n\n### 1. Variation comes first, and it is random\n- Mutations arise **randomly**, as copying errors during DNA replication.\n- Some resistant variants were **already present before the antibiotic** was applied; the mutation rate is independent of need.\n\n### 2. The antibiotic acts as a selective pressure\n- Susceptible cells are killed.\n- Resistant cells **survive and reproduce**, passing the resistance gene to their offspring.\n\n### 3. What actually changes is the population\n- Natural selection changes the **frequency** of heritable variants in the population.\n- Individual bacteria have no goal or intent; the explanation \"because they needed it\" is **teleological** (and Lamarckian).\n\n**Conclusion:** Resistance increases through selection on pre-existing random variation, not through need-driven creation."
    ],
    bad: [
      "세균이 스스로 내성을 만들었다는 설명은 부정확하다.",
      "항생제에 노출되면 세균은 살아남기 위해 내성을 만든다. 그래서 내성 세균이 많아진다.\nBacteria develop resistance in order to survive the antibiotic."
    ]
  },
  "S12": {
    good: [
      "상관관계는 인과관계를 의미하지 않습니다. 인 농도, 수온, 일조량, 농업 유출수 같은 교란 변수가 질산염과 조류 모두에 영향을 줄 수 있고, 역인과도 가능합니다. 다른 조건을 동일하게 통제한 메조코즘에 질산염만 첨가하는 실험으로 검증해야 합니다.",
      "## Why the Observation Is Not Enough\n\n### Correlation vs. causation\n- The data are **observational**: correlation does not establish causation.\n\n### Alternative explanations\n- **Confounding variables:** phosphorus, water temperature, light, and agricultural runoff could raise both nitrate and algal growth.\n- **Reverse causation / linked causes:** algal decomposition can change nutrient cycling.\n\n## A Stronger Test\n1. Set up **mesocosms** (enclosures) in one lake.\n2. Randomly assign them to nitrate addition vs. **control**, keeping phosphorus, light and temperature **constant**.\n3. Measure chlorophyll-a over several weeks with replicates.\n\nIf only the nitrate-enriched units bloom, causality is much better supported."
    ],
    bad: [
      "질산염이 원인이라고 단정할 수 없다.",
      "The pattern across lakes proves that nitrate causes algal blooms.\nTherefore, nitrate is the cause of algal blooms."
    ]
  },
  "S13": {
    good: [
      "합: 9.8 + 10.1 + 10.0 + 10.1 = 40.0 g, 평균 = 40.0 / 4 = 10.0 g입니다.\n반복 측정을 하면 값의 변동(산포)을 확인할 수 있고, 우연 오차의 영향을 줄여 더 신뢰할 수 있는 추정값을 얻습니다.",
      "## Calculating the Mean\n\n$$\\bar{x} = \\frac{9.8 + 10.1 + 10.0 + 10.1}{4} = \\frac{40.0}{4} = 10.0\\ \\text{g}$$\n\n## Why Repeat Measurements?\n\n- **Reveals variability:** a single reading cannot show the spread; here values range from 9.8 to 10.1 g.\n- **Reduces random error:** averaging multiple readings cancels random fluctuations, giving a more precise estimate.\n- **Detects outliers:** 9.8 g stands out slightly.\n- **Caveat:** repetition does not remove systematic error (e.g., a miscalibrated balance).\n\n**Mean = 10.0 g.**"
    ],
    bad: [
      "평균은 10.0 g이다.",
      "The mean is 10.05 g. Repeated measurements eliminate systematic error, so the result is exact."
    ]
  },
  "S14": {
    good: [
      "아니요, 한 번의 재현 실패만으로 원 연구가 조작되었다고 결론낼 수 없습니다. 표본 크기·검정력 부족, 프로토콜 차이, 우연한 변동, 원래 효과가 작았을 가능성이 있습니다. 원자료와 프로토콜을 비교하고, 검정력이 충분한 추가 재현 연구를 해야 합니다.",
      "## Short Answer\n**No.** A single failed replication is insufficient evidence to conclude fabrication.\n\n## Alternative Explanations\n- **Statistical power / sample size:** the replication may have been underpowered.\n- **Protocol differences:** subtle changes in methodology, population, or setting.\n- **Measurement differences:** different instruments or reagents.\n- **Random variation:** the original could be a false positive, or the replication a false negative.\n- **Unstable or small effect:** effect size may have been overestimated.\n\n## Next Verification Steps\n1. Compare protocols and request the raw data from the original authors.\n2. Conduct additional, pre-registered, adequately powered replications.\n3. Consider a meta-analysis of all attempts."
    ],
    bad: [
      "조작 여부는 알 수 없다.",
      "Yes, this shows the original study was fabricated.\nTherefore, the original study was fabricated."
    ]
  },
  "S15": {
    good: [
      "아니요, 절대적으로 증명되었다고 말할 수 없습니다. 많은 실험의 지지는 신뢰도를 높이지만, 귀납적 추론은 논리적 보장을 주지 못하며 새로운 증거가 나오면 가설은 수정되거나 반증될 수 있습니다.",
      "## Can a Well-Supported Hypothesis Be \"Absolutely Proven\"?\n\n**No.**\n\n### The problem of induction\n- Repeated confirmations are **inductive** evidence: they increase our **confidence** but do not logically guarantee truth for all future cases.\n\n### Falsifiability\n- A single robust contrary observation could **falsify** the hypothesis (Popper).\n- Scientific knowledge is **tentative** and open to **revision** when new evidence or better explanations appear (e.g., Newtonian mechanics refined by relativity).\n\n### Conclusion\nA hypothesis can be strongly supported and well established, but not absolutely proven."
    ],
    bad: [
      "과학은 계속 발전한다.",
      "Yes, after many experiments the hypothesis is absolutely proven.\nTherefore, the hypothesis is proven."
    ]
  },
  "E01": {
    good: [
      "AI의 분해 방법(17×20 + 17×4)은 맞지만 17×4를 48로 잘못 계산했습니다. 17×4 = 68이므로 340 + 68 = 408입니다.",
      "## Error Analysis\n\n### What the AI did right\n- The decomposition approach is valid: $17 \\times 24 = 17 \\times 20 + 17 \\times 4$.\n- $17 \\times 20 = 340$ ✓ correct.\n\n### The mistake\n- The AI wrote $17 \\times 4 = 48$, but actually $17 \\times 4 = 68$.\n\n### Corrected calculation\n$$17 \\times 24 = 340 + 68 = 408$$\n\n**Final answer: 408**"
    ],
    bad: [
      "정답은 408입니다.",
      "17×20=340, 17×4=48 so the answer is 388.\nThe answer is 388."
    ]
  },
  "E02": {
    good: [
      "추론 형식(삼단논법)은 타당하지만, 전제 '모든 포유류는 알을 낳는다'는 거짓입니다. 대부분의 포유류는 알을 낳지 않습니다. 오리너구리가 알을 낳는다는 결론은 우연히 참일 뿐, 결론이 참이라고 전제가 옳아지지는 않습니다.",
      "## Evaluation\n\n### 1. Logical form\n- The argument is a standard syllogism (All M are E; P is M; therefore P is E).\n- The form is **valid**: the conclusion follows logically from the premises.\n\n### 2. Truth of the premise\n- \"All mammals lay eggs\" is **false**. Most mammals (humans, dogs, whales) give birth to live young; only monotremes lay eggs.\n\n### 3. The conclusion\n- The conclusion \"a platypus lays eggs\" **happens to be true**, but a true conclusion does not make a false premise true.\n\n### Verdict\nThe AI is wrong to say both are correct: the reasoning is valid but **unsound** because the premise is false."
    ],
    bad: [
      "AI의 답변에는 문제가 있다.",
      "All mammals lay eggs is true, and the conclusion follows for the platypus.\nThe argument is sound."
    ]
  },
  "E03": {
    good: [
      "AI는 두 변 사이의 끼인각이 90°(직각)라고 암묵적으로 가정했습니다. 넓이 = 1/2·5·7·sin C 이므로 끼인각을 모르면 넓이를 하나로 정할 수 없습니다.",
      "## The Hidden Assumption\n\n- The AI computed $\\frac{5 \\times 7}{2}$, which is only valid if the two sides are **perpendicular**.\n- It implicitly **assumed a right angle** between the sides.\n\n## General Formula\n\n$$\\text{Area} = \\frac{1}{2}ab\\sin C = \\frac{35}{2}\\sin C$$\n\n- Since the included angle $C$ is not given, $0 < \\text{Area} \\le 17.5$.\n\n## Conclusion\nThe area **cannot be uniquely determined** from the given information; 17.5 is only the maximum possible area."
    ],
    bad: [
      "넓이를 구할 수 없다.",
      "Using base 5 and height 7, the area is 17.5.\nThe answer is 17.5."
    ]
  },
  "E04": {
    good: [
      "Source C는 문제에서 제공된 출처(A, B)에 포함되지 않은 자료입니다. 따라서 이 인용은 지어낸(환각) 근거일 가능성이 높고 검증할 수 없습니다. 그 수치는 신뢰할 수 없으며, Source A와 B에서 근거를 찾거나 필요한 정보가 없다고 밝혀야 합니다.",
      "## Reliability Problem\n\n**Short answer:** The citation is outside the permitted evidence set, so it is likely *fabricated* (a hallucinated citation).\n\n### Why it matters\n- The task says only Source A and Source B exist; \"Source C, 2025, Table 4\" is **not one of the provided sources**.\n- Because it cannot be traced, the citation **cannot be verified**.\n- Any number attached to it \\( x \\) is therefore unsupported: the number cannot be accepted without verification.\n\n### What the AI should do\n1. Rely only on Source A and Source B.\n2. If neither contains the figure, explicitly state that the needed evidence is unavailable."
    ],
    bad: [
      "신뢰성에 문제가 있습니다.",
      "Source C, 2025, Table 4는 구체적인 연도와 표 번호를 제시하므로 출처가 명확합니다. 따라서 이 인용은 신뢰할 수 있다."
    ]
  },
  "E05": {
    good: [
      "이 결론은 타당하지 않습니다. 두 변수는 상관관계가 있을 뿐 인과관계가 입증되지 않았습니다. 더운 날씨(교란 변수)가 아이스크림 판매와 수영·익사를 함께 늘립니다.",
      "## Evaluation\n\n### 1. Correlation vs. causation\n- Both quantities rise together, which shows a **correlation**, not causation.\n\n### 2. Confounding variable\n- A **third variable** — hot weather / high temperature — increases ice-cream sales *and* the number of people swimming, which raises drownings.\n$$\\text{Heat} \\Rightarrow \\text{Ice cream},\\quad \\text{Heat} \\Rightarrow \\text{Swimming} \\Rightarrow \\text{Drowning}$$\n\n### Verdict\nThe causal conclusion is **unsupported**; it is a classic confounding fallacy."
    ],
    bad: [
      "결론이 이상합니다.",
      "여름에 둘 다 증가했으므로 아이스크림 판매가 익사를 유발한다. Ice cream sales cause drowning, since people eat ice cream and then swim with full stomachs."
    ]
  },
  "E07": {
    good: [
      "1 km = 1000 m이므로 5 km = 5 × 1000 = 5000 m입니다. AI는 1 km를 100 m로 잘못 써서 10배 작게 계산했습니다.",
      "## Correction\n\n### Identify the error\n- The AI used the conversion \\( 1\\,\\text{km} = 100\\,\\text{m} \\), which is **incorrect**.\n- The prefix *kilo* means \\(10^3\\): \\( 1\\,\\text{km} = 1000\\,\\text{m} \\).\n\n### Correct calculation\n$$5\\,\\text{km} \\times 1000\\,\\tfrac{\\text{m}}{\\text{km}} = 5000\\,\\text{m}$$\n\n### Summary\nThe conversion factor was off by a factor of 10; **5 km = 5,000 m**."
    ],
    bad: [
      "5000 m",
      "1 km = 100 m.\n5 km는 500 m이다."
    ]
  },
  "E08": {
    good: [
      "A와 B가 겹치지 않으면 합은 60 + 50 = 110명인데, 전체 100명을 초과합니다. 따라서 표는 모순이며 내부적으로 일관되지 않습니다.",
      "## Analysis\n\n### Constraints\n- Total: \\( N = 100 \\)\n- Disjoint subgroups: \\( |A \\cup B| = |A| + |B| \\)\n\n### Check\n$$|A| + |B| = 60 + 50 = 110 > 100$$\n\n- The disjoint subgroups alone exceed the stated total by 10 participants.\n\n### Conclusion\nThe table is **inconsistent** — these numerical constraints cannot all be true simultaneously. The AI missed a contradiction."
    ],
    bad: [
      "표에 문제가 있다.",
      "A and B have 10 people overlap, so it works out.\nThe table is internally consistent."
    ]
  },
  "E09": {
    good: [
      "17×24 = 17×20 + 17×4 = 340 + 68 = 408이므로 408이 맞고 388은 틀립니다. 사용자의 말을 검증 없이 받아들인 것은 아첨이며, 408을 유지해야 했습니다.",
      "## Evaluation of the Self-Correction\n\n### Re-verify the arithmetic\n$$17 \\times 24 = 17 \\times 20 + 17 \\times 4 = 340 + 68 = 408$$\n\n### Assessment\n- The original answer was correct; 388 is **incorrect**.\n- The AI changed its answer without re-computing — a sycophantic capitulation to user pressure.\n\n### What should happen\n- Self-correction must be evidence-based: verify the feedback, then **retain 408**."
    ],
    bad: [
      "수정은 잘못되었습니다.",
      "사용자가 지적했으니 AI의 자기수정은 적절했다.\nSo 388 is correct."
    ]
  },
  "E10": {
    good: [
      "시간을 구하려면 거리와 속도가 필요한데 둘 다 주어지지 않아 정보가 부족합니다. 따라서 걸리는 시간은 결정할 수 없고, AI의 '2시간'은 근거 없이 지어낸 값입니다.",
      "## What Is Wrong\n\n### Required information\n- Travel time follows $t = d / v$, so it **requires** both distance and speed.\n\n### The problem is underdetermined\n- With neither value given, the time **cannot be determined**.\n\n### The AI's error\n- \"2 hours\" is **made up** — the AI hallucinated a value instead of saying the information is insufficient."
    ],
    bad: [
      "답이 잘못되었다.",
      "보통 기차 속도는 시속 100 km이고 거리는 200 km 정도이니 정답은 2시간이다."
    ]
  },
  "E11": {
    good: [
      "2+4+6+8 = 20이고 20/4 = 5이므로 평균은 5입니다. 식은 맞지만 마지막 나눗셈 계산이 틀렸습니다.",
      "## Finding the Error\n\n### Step 1: Sum\n$$2 + 4 + 6 + 8 = 20$$\n\n### Step 2: Divide\n$$\\frac{20}{4} = 5$$\n\n### Diagnosis\n- The formula \\(\\bar{x} = \\frac{\\sum x_i}{n}\\) is right, but the arithmetic result is **wrong**.\n- **Correct mean = 5.**"
    ],
    bad: [
      "평균은 5이다.",
      "The sum is 16 and 16/4 = 4, so the mean is 4."
    ]
  },
  "E12": {
    good: [
      "참양성 = 0.01×0.99 = 0.0099, 위양성 = 0.99×0.05 = 0.0495입니다. 따라서 0.0099/(0.0099+0.0495) = 1/6 ≈ 16.7%이며 99%가 아닙니다.",
      "## Correcting the Base-Rate Error\n\n### Step 1: True positives\n$$P(D \\cap +) = 0.01 \\times 0.99 = 0.0099$$\n\n### Step 2: False positives\n$$P(\\neg D \\cap +) = 0.99 \\times 0.05 = 0.0495$$\n\n### Step 3: PPV\n$$P(D\\mid +) = \\frac{0.0099}{0.0099 + 0.0495} = \\frac{0.0099}{0.0594} \\approx 0.167$$\n\n### Conclusion\n- Sensitivity is \\(P(+\\mid D)\\), not \\(P(D\\mid +)\\).\n- The posterior probability is about **16.7%**."
    ],
    bad: [
      "99%가 아니다.",
      "민감도가 99%이고 검사가 정확하므로 확률은 99%입니다."
    ]
  },
  "E13": {
    good: [
      "올바른 식은 E=mc²입니다. c는 빛의 속도이고 제곱되어야 하며, 제곱이 빠지면 단위(차원)가 에너지와 맞지 않습니다.",
      "## Correction\n\n### The correct relation\n$$E = mc^2$$\n\n### Explanation\n- \\(c\\) is the **speed of light**, and it must be *squared*.\n- Dimensional check: \\(m c^2\\) has units \\(\\text{kg}\\cdot\\text{m}^2/\\text{s}^2 = \\text{J}\\), whereas \\(mc\\) has units of momentum.\n\n### Summary\nOmitting the square changes both the equation and its dimensions."
    ],
    bad: [
      "E=mc²",
      "아인슈타인 식은 질량과 속도의 곱이므로 올바른 식은 E=mc 이다."
    ]
  },
  "E14": {
    good: [
      "x>5인 수는 모두 3보다 크므로 두 조건은 모순이고, 이를 만족하는 실수 x는 존재하지 않습니다. x=4는 4<5이고 4>3이라 어느 조건도 만족하지 않습니다.",
      "## Error Type and Correct Conclusion\n\n### Error type\n- **Contradictory-condition error (COND)**: the AI ignored that the constraints are mutually exclusive.\n\n### Analysis\n- $(5, \\infty) \\cap (-\\infty, 3) = \\emptyset$\n- \\(x = 4\\): \\(4 > 5\\) is false and \\(4 < 3\\) is false — it satisfies **neither** condition.\n\n### Correct conclusion\nThere is **no real solution**; the solution set is empty."
    ],
    bad: [
      "해가 없음.",
      "4는 3과 5 사이에 있으므로 x=4는 올바른 답이다.\nx = 4."
    ]
  }
};
