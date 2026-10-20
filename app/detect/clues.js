/* 답 흔들림 점검기 · 단서: 숫자·수식·판정어·핵심 개념을 뽑고 맞댄다
 * detect.js가 쓰는 부품. index.html에서 detect/의 다른 파일과 정해진 순서로 읽는다. */
(function (P2) {
  "use strict";

  var plainMath = P2.plainMath,
    yesNo = P2.yesNo;

  // 서술형 답(실험 설계, 원리 설명)을 맞대기 위한 한·영 공통 핵심 개념
  var TOPICS = [
    ["무작위배정", /random(ly)? assign|randomi[sz]|random allocation|무작위 ?배정|무작위 ?할당|무작위로 (두 )?(집단|그룹|배정|나누)/i],
    ["위약", /placebo|위약/i],
    ["맹검", /blind|맹검/i],
    ["이중맹검", /double[- ]blind|이중 ?맹검/i],
    ["대조군", /control group|comparison group|대조군|통제군|비교군/i],
    ["선택 편향", /selection bias|allocation bias|선택 편향|선정 편향|배정 편향/i],
    ["위약·기대 효과", /placebo effect|expectation|expectanc|기대 효과|위약 효과|기대(감|하는|만으로)/i],
    ["관찰자 편향", /observer bias|experimenter bias|assessor|rater bias|detection bias|ascertainment|관찰자 편향|측정자 편향|평가자 편향|실험자 편향|검사자/i],
    ["교란 변수", /confound|교란/i],
    ["표본 크기·검정력", /sample size|statistical power|\bpower\b|표본 ?크기|검정력|참가자 수/i],
    ["교차 설계", /cross-?over|교차 ?설계/i],
    ["통계 검정", /t-test|anova|statistical(ly)? (test|signific)|통계(적)? ?(검정|유의)/i],
    ["독립변수", /independent variable|\biv\b|독립 ?변수/i],
    ["종속변수", /dependent variable|\bdv\b|종속 ?변수/i],
    ["통제변수", /control(led)? variables?|controls? =|held constant|kept constant|통제 ?변수|일정하게/i],
    ["반복 측정", /replicat|repeat|multiple trials|반복/i],
    ["자연선택", /natural selection|selection pressure|selected for|selects for|자연 ?선택|선택압/i],
    ["변이는 미리·무작위로 생김", /pre-?existing (variant|mutation|resist)|already exist|random mutation|mutations? (arise|occur) (randomly|spontaneously)|independent(ly)? of need|regardless of need|이미 (존재|있던)|무작위(로|적)? ?(돌연)?변이|변이는[^.]{0,20}무작위|필요와 (무관|상관없)/i],
    ["상관관계", /correlat|co-?var|association|상관/i],
    ["인과관계", /causation|causal|인과/i],
    ["실험적 개입", /intervention|manipulat|mesocosm|개입|조작(하는|해|한)? ?실험|직접 조작/i],
    ["역인과", /reverse caus|역인과|인과 방향/i],
    ["온도", /temperature|온도/i],
    ["효소 변성", /denatur|변성/i]
  ];

  function topics(text) {
    var t = plainMath(text);
    return TOPICS.filter(function (c) { return c[1].test(t); }).map(function (c) { return c[0]; });
  }

  // 두 언어 답을 맞대기 위한 한·영 공통 개념. 앞의 것이 먼저 지워져 "타당하지 않다"가 "타당"으로 다시 잡히지 않는다
  var CONCEPTS = [
    ["invalid", /\b(invalid|not valid|unsound)\b|타당하지 않|부당/gi],
    ["valid", /\bvalid\b|타당/gi],
    ["false", /\b(false|not true)\b|거짓|참이 아니/gi],
    ["true", /\btrue\b|참(이다|입니다|이며|이고|\b|$)/gi],
    ["undetermined", /underdetermin|cannot (be )?(uniquely )?(determined|established|concluded|justif)|can't be determined|not (logically )?(established|determined)|insufficient|not enough information|cannot (conclude|establish|justify|be called)|cannot establish|결정할 수 없|알 수 없|정할 수 없|확정(되지 않|할 수 없)|결론(내|을 내)릴 수 없|말할 수 없|도출할 수 없|단정할 수 없/gi],
    ["inconsistent", /inconsistent|contradict|unsatisfiable|cannot (all )?be true|모순|일관되지 않|일관성이 없|동시에 참일 수 없/gi],
    ["consistent", /\bconsistent\b|일관(된다|됩니다|적이다|적입니다|성이 있)/gi],
    ["wrong", /\b(wrong|incorrect|unreliable|unjustified|not supported|not a valid)\b|틀렸|틀린|신뢰할 수 없|근거 없|잘못/gi],
    ["empty", /no real (number|solution)|no (such|real) x|no solution|empty set|∅|존재하지 않|해가 없/gi],
    ["necessary", /\bnecessary\b|필요조건/gi],
    ["knave-knight", /knave|knight|거짓말쟁이|기사/gi],
    ["affirming-consequent", /affirming the consequent|후건 ?긍정/gi],
    ["modus-tollens", /modus tollens|후건 ?부정/gi],
    ["disjunctive", /disjunctive syllogism|선언적 삼단|선언 소거/gi],
    ["ignorance", /ignoran|무지에 호소/gi],
    ["post-hoc", /post hoc|이후(이므로|에 일어)/gi],
    ["correlation", /correlation|co-?var|association|상관관계/gi],
    ["at-least-one", /at least one|적어도 한/gi],
    ["left", /\bleft\b|왼쪽|역반응/gi],
    ["inaccurate", /inaccurate|부정확/gi],
    ["controlled-trial", /double-blind|placebo|randomi[sz]|이중맹검|위약|무작위/gi],
    ["variables", /independent variable|\biv\b|독립변수/gi],
    ["confound", /confound|교란/gi],
    ["sycophancy", /sycophan|아첨/gi],
    ["summation", /[σ∑]|summation|telescop|망원|부분분수|partial fraction/gi]
  ];

  var OPPOSITE = [["valid", "invalid"], ["true", "false"], ["consistent", "inconsistent"]];

  function keyOf(answer) {
    var a = plainMath(answer || "").toLowerCase().replace(/−/g, "-").replace(/(\d),(?=\d{3}\b)/g, "$1");
    var nums = (a.match(/\d+(?:\.\d+)?/g) || []).map(function (n) { return String(parseFloat(n)); });
    // 같은 값의 다른 표기(1/2 = 0.5, 50% = 0.5)도 맞댈 수 있게 소수 값을 따로 모은다.
    // 관련성 단서에는 쓰지 않는다(1/2만 보고 P(X=1/2) 문항으로 헷갈리지 않게)
    var alt = [];
    a.replace(/(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)(?![\d.])/g, function (m, p, q) {
      if (parseFloat(q) !== 0) alt.push(String(parseFloat((parseFloat(p) / parseFloat(q)).toFixed(6))));
      return m;
    });
    a.replace(/(\d+(?:\.\d+)?)\s*(%|퍼센트|percent)/g, function (m, p) { alt.push(String(parseFloat((parseFloat(p) / 100).toFixed(6)))); return m; });
    // 수식: 공백을 빼고 기호가 섞인 토막(¬P∨Q, n², E=mc²)
    var maths = (a.replace(/\s*([∨∧→⇒↔⇔=+−×^≠≤≥/])\s*/g, "$1").replace(/([a-z0-9)])\s+-\s+(?=[a-z0-9(])/g, "$1-").replace(/¬\s+/g, "¬").match(/[a-z0-9¬∨∧→⇒↔⇔²³₀-₉∅=+−×()^≠≤≥/.-]*[¬∨∧→⇒↔⇔²³₀-₉=^≠≤≥][a-z0-9¬∨∧→⇒↔⇔²³₀-₉∅=+−×()^≠≤≥/.-]*/g) || [])
      .map(function (m) { return m.replace(/[.\-]+$/, ""); }).filter(function (m) { return m.length >= 2; });
    var tags = {};
    var rest = a;
    CONCEPTS.forEach(function (c) {
      var re = new RegExp(c[1].source, "gi");
      if (re.test(rest)) { tags[c[0]] = true; rest = rest.replace(new RegExp(c[1].source, "gi"), " "); }
    });
    return { nums: nums, alt: alt, maths: maths, tags: tags, yn: yesNo(a) };
  }

  function relations(maths) {
    var out = {};
    maths.forEach(function (m) {
      m.split(/[;,]/).forEach(function (part) {
        var r = /^([a-z][a-z0-9_ₙ]*(?:\([a-z0-9]\))?)(=|≠|≤|≥)([^=≠≤≥]+)$/.exec(part);
        if (r) (out[r[1] + r[2]] = out[r[1] + r[2]] || []).push(r[3]);
      });
    });
    return out;
  }

  // 다르면 "x= 1/(t-1) ↔ 1/(t-2)" 같은 설명을, 아니면 ""를 돌려준다
  function relationsDiffer(x, y) {
    var rx = relations(x), ry = relations(y), differ = "", agree = false;
    Object.keys(rx).forEach(function (k) {
      if (!ry[k]) return;
      if (overlap(rx[k], ry[k])) agree = true; else if (!differ) differ = k + " " + rx[k][0] + " ↔ " + ry[k][0];
    });
    return agree ? "" : differ;
  }

  // 반올림 차이는 같은 값으로 본다(15.38 ≈ 15.4, 0.1538 ≈ 0.154). 정수와 소수(0.5 ↔ 1)는 맞대지 않는다
  function decimals(v) { var i = v.indexOf("."); return i < 0 ? 0 : v.length - i - 1; }

  function numEq(x, y) {
    if (x === y) return true;
    var dx = decimals(x), dy = decimals(y), d = Math.min(dx, dy);
    if (dx === dy) return false;
    var precise = dx > dy ? x : y, rough = dx > dy ? y : x;
    // 10 이상의 정수로 반올림한 값(약 17% ≈ 16.7%)도 같다고 본다. 작은 정수(0.5 ↔ 1)는 맞대지 않는다
    if (d < 1) return parseFloat(rough) >= 10 && Math.round(parseFloat(precise)) === parseFloat(rough);
    return parseFloat(parseFloat(precise).toFixed(d)) === parseFloat(rough);
  }

  function hasNum(list, v) { return list.some(function (w) { return numEq(v, w); }); }

  // 두 숫자 묶음이 절반 이상 겹치는가(중복 제거 후)
  function similarNums(x, y) {
    var ux = x.filter(function (v, i) { return x.indexOf(v) === i; });
    var uy = y.filter(function (v, i) { return y.indexOf(v) === i; });
    var common = ux.filter(function (v) { return hasNum(uy, v); }).length;
    var smaller = Math.min(ux.length, uy.length);
    return smaller > 0 && common / smaller >= 0.5;
  }

  function overlap(x, y) {
    return x.some(function (v) { return y.indexOf(v) >= 0; });
  }

  // 반대 개념(타당↔부당, 참↔거짓, 예↔아니오)이 갈리면 다른 답,
  // 겹치는 숫자·수식·개념이 있으면 같은 답, 둘 다 없으면 판단하지 않는다
  function keyLabels(k) {
    var out = [];
    k.nums.forEach(function (n) { if (out.indexOf("숫자 " + n) < 0) out.push("숫자 " + n); });
    k.maths.forEach(function (m) { if (out.indexOf("식 " + m) < 0) out.push("식 " + m); });
    Object.keys(k.tags).forEach(function (t) { out.push("판정 ‘" + (TAG_LABELS[t] || t) + "’"); });
    if (k.yn) out.push(k.yn === "yes" ? "판정 ‘예’" : "판정 ‘아니오’");
    return out.slice(0, 8);
  }

  // 언어와 무관한 단서(두 자리 이상 숫자, 수식, 핵심 개념, 특정 개념)만 모은다 — 한·영 답 전체를 맞댈 때 쓴다
  function neutralFeatures(text) {
    var f = features(text), out = {};
    Object.keys(f).forEach(function (k) {
      if (k.indexOf("w:") === 0 || /^n:\d$/.test(k)) return;
      out[k] = f[k];
    });
    return out;
  }

  // 답이 질문과 관련 있는가: 숫자·수식·핵심 개념·주요 단어가 겹치는지 본다
  var STOP_KO = /^(있고|있다|있는|같은|같이|이라|이다|입니|합니|하는|하고|하여|하시|하라|대한|대해|에서|으로|다음|경우|전체|모든|어떤|이것|그것|무엇|설명|구하|제시|판단|평가|주어|문제|사용|위해|때문|따라|또는|그리|아니|없는|없다|않는|되는|된다|한다|것이|것은|확인|이상|이하|이때|그때|각각|모두|하나|여러|같다|보다|위의|아래|생각|분류|때도|해를|시오|하시|하자)$/;

  var STOP_EN = /^(the|and|that|this|with|from|have|then|than|when|what|which|there|their|these|those|each|only|also|does|into|your|will|would|should|could|about|given|following|answer|explain|find|show|state|give|whether|both|must|such|some|more|most|other|check|least|true|false|valid|correct|result|briefly|justify|then|here)$/;

  function contentWords(text) {
    var t = plainMath(text).toLowerCase();
    var ko = (t.match(/[가-힣]{2,}/g) || []).map(function (w) { return w.slice(0, 2); }).filter(function (w) { return !STOP_KO.test(w); });
    var en = (t.match(/[a-z]{4,}/g) || []).filter(function (w) { return !STOP_EN.test(w); }).map(function (w) { return w.slice(0, 5); });
    var all = ko.concat(en);
    return all.filter(function (w, i) { return all.indexOf(w) === i; });
  }

  // 낱말 단서(앞 2~5글자)를 사람이 읽을 원래 낱말로 되돌리기 위한 표
  function wordOriginals(text) {
    var t = plainMath(text).toLowerCase(), out = {};
    (t.match(/[가-힣]{2,}/g) || []).forEach(function (w) { if (!out[w.slice(0, 2)]) out[w.slice(0, 2)] = w; });
    (t.match(/[a-z]{4,}/g) || []).forEach(function (w) { if (!out[w.slice(0, 5)]) out[w.slice(0, 5)] = w; });
    return out;
  }

  var TAG_LABELS = {
    valid: "타당", invalid: "타당하지 않음", "true": "참", "false": "거짓", undetermined: "결정할 수 없음",
    inconsistent: "모순", consistent: "일관됨", wrong: "틀림", empty: "해 없음", necessary: "필요조건", "knave-knight": "기사·거짓말쟁이",
    "affirming-consequent": "후건 긍정의 오류", "modus-tollens": "후건 부정(대우)", disjunctive: "선언 삼단논법",
    ignorance: "무지에 호소하는 오류", "post-hoc": "선후·인과 혼동", correlation: "상관관계", confound: "교란 변수",
    sycophancy: "아첨성 번복", "at-least-one": "적어도 하나", left: "평형이 왼쪽으로", inaccurate: "부정확",
    "controlled-trial": "무작위·위약 대조", variables: "독립변수", summation: "급수의 합"
  };

  function clueLabel(key, value) {
    var kind = key.slice(0, 2), v = key.slice(2);
    if (kind === "n:") return "숫자 " + v;
    if (kind === "m:" || kind === "f:" || kind === "d:") return "식 " + v;
    if (kind === "t:") return "개념 " + v;
    if (kind === "g:") return "개념 " + (TAG_LABELS[v] || v);
    return "낱말 ‘" + (typeof value === "string" ? value : v) + "’";
  }

  // 같은 이름은 한 번만, 최대 6개
  function labels(keys, f) {
    var out = [];
    keys.forEach(function (k) { var l = clueLabel(k, f[k]); if (out.indexOf(l) < 0 && out.length < 6) out.push(l); });
    return out;
  }

  var GENERIC_TAGS = ["valid", "invalid", "true", "false", "wrong", "undetermined", "inconsistent", "consistent", "empty"];

  // 수식 토막: 연산자가 든 짧은 식(k(k+1), 2h₂+o₂, mod) — 괄호 모양은 통일
  function fragments(text) {
    var t = plainMath(text).toLowerCase().replace(/_/g, "").replace(/[₀-₉]/g, function (c) { return String(c.charCodeAt(0) - 8320); })
      .replace(/ₙ/g, "n").replace(/[⁰-⁹]/g, "").replace(/\s*([+\-*/^=−×])\s*/g, "$1");
    var out = [];
    (t.match(/[a-z0-9+\-*/^=²³−×√()\[\]{}]+/g) || []).forEach(function (tok) {
      var f = tok.replace(/[()\[\]{}]/g, "");
      if (f.length >= 3 && /[a-z]/.test(f) && /[a-z0-9][+\-*/^²³−×][a-z0-9]/.test(f) && !/^[a-z]+-[a-z]+$/.test(f)) out.push(f);
    });
    // 계수가 붙은 항(3x, 2y)은 식을 풀어 쓴 답에도 그대로 남는다(3x+5=20 → 3x=15)
    (t.match(/(^|[^a-z0-9.])\d+(?:\.\d+)?[a-z](?![a-z])/g) || []).forEach(function (m) {
      var term = m.replace(/^[^0-9]/, "");
      if (out.indexOf(term) < 0) out.push(term);
    });
    return out;
  }

  // 숫자만 든 식(2+2, 17×24)과 단위가 붙은 수. 날짜(2026-10-06)는 뺀다
  function numberFormulas(text) {
    var t = plainMath(text).replace(/\s*([+\-*/^=−×])\s*/g, "$1");
    var out = (t.match(/\d+(?:\.\d+)?(?:[+\-*/^−×]\d+(?:\.\d+)?)+/g) || []).filter(function (f) { return !/^\d+(-\d+)+$/.test(f); });
    // 단위가 붙은 수(5 km, 0.20 M, 2 mol)도 그 질문만의 단서다
    (t.match(/\d+(?:\.\d+)?\s?(?:km|cm|mm|kg|mg|ml|mol|m|g|l|M|°c|°)(?![a-z])/gi) || []).forEach(function (u) {
      var k = u.replace(/\s+/g, "").toLowerCase();
      if (out.indexOf(k) < 0) out.push(k);
    });
    return out;
  }

  // 질문·답에서 관련성 단서를 뽑는다. 숫자·수식·핵심 개념은 언어와 무관(neutral), 낱말은 같은 언어끼리만 비교된다
  function features(text) {
    var k = keyOf(text), f = {};
    k.nums.forEach(function (n) { f["n:" + n] = 1; });
    k.maths.forEach(function (m) { f["m:" + m] = 1; });
    fragments(text).forEach(function (x) { f["f:" + x] = 1; });
    numberFormulas(text).forEach(function (x) { f["d:" + x] = 1; });
    topics(text).forEach(function (t) { f["t:" + t] = 1; });
    Object.keys(k.tags).forEach(function (t) { if (GENERIC_TAGS.indexOf(t) < 0) f["g:" + t] = 1; });
    var originals = wordOriginals(text);
    contentWords(text).forEach(function (w) { f["w:" + w] = originals[w] || w; });
    return f;
  }

  // 수식 토막은 서로 포함만 해도 겹친 것으로 본다(1/kk+1 ⊂ 1/kk+1=1/k-1/k+1)
  function sharedKeys(fq, fa) {
    var akeys = Object.keys(fa);
    return Object.keys(fq).filter(function (key) {
      if (fa[key]) return true;
      if (key.indexOf("f:") !== 0) return false;
      var x = key.slice(2);
      return akeys.some(function (g) { return g.indexOf("f:") === 0 && (g.indexOf(x) >= 0 || (x.indexOf(g.slice(2)) >= 0 && g.length >= 6)); });
    });
  }

  P2.TOPICS = TOPICS;
  P2.topics = topics;
  P2.CONCEPTS = CONCEPTS;
  P2.OPPOSITE = OPPOSITE;
  P2.keyOf = keyOf;
  P2.relations = relations;
  P2.relationsDiffer = relationsDiffer;
  P2.decimals = decimals;
  P2.numEq = numEq;
  P2.hasNum = hasNum;
  P2.similarNums = similarNums;
  P2.overlap = overlap;
  P2.keyLabels = keyLabels;
  P2.neutralFeatures = neutralFeatures;
  P2.STOP_KO = STOP_KO;
  P2.STOP_EN = STOP_EN;
  P2.contentWords = contentWords;
  P2.wordOriginals = wordOriginals;
  P2.TAG_LABELS = TAG_LABELS;
  P2.clueLabel = clueLabel;
  P2.labels = labels;
  P2.GENERIC_TAGS = GENERIC_TAGS;
  P2.fragments = fragments;
  P2.numberFormulas = numberFormulas;
  P2.features = features;
  P2.sharedKeys = sharedKeys;
})((typeof window !== "undefined" ? window : globalThis).P2Lib = (typeof window !== "undefined" ? window : globalThis).P2Lib || {});
