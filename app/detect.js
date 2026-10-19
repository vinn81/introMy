/* P2-Bench 답 점검기 — 신호 탐지와 루브릭 계산
 * 논문(P2-Bench, 2026-10-06) 7장 오류 분석의 네 유형을 규칙으로 옮겼다.
 * 브라우저(window.P2Check)와 Node(module.exports) 양쪽에서 쓴다. */
(function (root) {
  "use strict";

  // 논문 3.3 표 2: 100점 루브릭
  var RUBRIC = [
    { key: "accuracy", label: "최종 답 정확성", max: 40 },
    { key: "reasoning", label: "추론 과정", max: 25 },
    { key: "condition", label: "조건 검토", max: 15 },
    { key: "error", label: "오류 인정·검증", max: 10 },
    { key: "clarity", label: "설명 명확성", max: 10 }
  ];

  // 논문 7장 표 6의 실제 감점을 신호별 기본 감점으로 사용
  var SIGNALS = {
    flip: {
      code: "LOG / COND + 자기수정",
      title: "처음 단정을 뒤에서 뒤집음",
      why: "첫 답을 단정한 뒤 풀이 중에 스스로 고쳤습니다. 최종 답은 맞을 수 있지만 첫 줄만 읽으면 틀린 답을 가져가게 됩니다.",
      paper: "논문 L15·S05 사례(각 97점): 추론 과정 −2, 설명 명확성 −1",
      deduct: { reasoning: 2, clarity: 1 },
      next: "첫 줄이 아니라 맨 마지막 결론을 옮겨 적으세요. 같은 질문을 새 대화에서 다시 물어 첫 줄부터 같은 답이 나오는지 확인하세요."
    },
    overinfer: {
      code: "OVER + UNC",
      title: "정보가 부족하다고 해 놓고 추측을 덧붙임",
      why: "‘알 수 없다’는 판단은 맞았지만 그 뒤에 자료가 지지하지 않는 구체적 추정을 확신 표현과 함께 붙였습니다.",
      paper: "논문 E15 사례(96점): 추론·조건·오류 인정·설명 각 −1",
      deduct: { reasoning: 1, condition: 1, error: 1, clarity: 1 },
      next: "추측 문장은 빼고 ‘알 수 없다’까지만 쓰세요. 추정이 꼭 필요하면 AI에게 ‘어떤 가정을 썼는지 적어 달라’고 다시 물으세요."
    },
    contradiction: {
      code: "설명 내부 모순",
      title: "설명 안에서 앞뒤 문장이 어긋남",
      why: "‘모두 맞다’고 쓴 바로 뒤에 틀린 부분을 지적하는 식으로, 결론은 맞는데 설명 일부가 서로 부딪칩니다.",
      paper: "논문 E01 사례(99점): 설명 명확성 −1",
      deduct: { clarity: 1 },
      next: "답을 옮길 때 어긋난 문장은 고쳐 쓰세요. 남에게 설명할 자료라면 이 부분을 직접 다시 확인하세요."
    }
  };

  function sentences(text) {
    return text.split(/(?<=[.!?。])\s+|\n+/).map(function (s) { return s.trim(); }).filter(Boolean);
  }

  function snippet(text, idx, len) {
    var start = Math.max(0, idx - 40);
    var end = Math.min(text.length, idx + (len || 0) + 80);
    return (start > 0 ? "…" : "") + text.slice(start, end).replace(/\s+/g, " ").trim() + (end < text.length ? "…" : "");
  }

  // 1) 번복: 스스로 앞의 답을 고쳤다는 말이 있거나, 첫 답과 마지막 답의 예/아니오가 다르다
  var FLIP_PATTERNS = [
    /\bmy (initial|opening|first|earlier)\b[^.\n]{0,40}\b(was|is) (premature|wrong|incorrect|mistaken)/i,
    /\bcorrecting my (opening|initial|first|earlier)/i,
    /\b(i|we) (was|were) wrong\b/i,
    /\b(scratch that|on second thought|let me correct|correction:)/i,
    /\bnot [^,.\n]{1,30}, correcting\b/i,
    /(앞서|처음에?)\s*(제가|내가|쓴|적은|말한|답한)[^.\n]{0,30}(잘못|성급|틀렸)/,
    /(정정합니다|정정하겠습니다|바로잡습니다|바로잡겠습니다)/
  ];

  var YES = /(^|[^a-z가-힣])(yes|예|네)([^a-z가-힣]|$)/i;
  var NO = /(^|[^a-z가-힣])(no|아니오|아니요)([^a-z가-힣]|$)/i;

  function yesNo(s) {
    var y = YES.test(s), n = NO.test(s);
    if (y && !n) return "yes";
    if (n) return "no";
    return null;
  }

  function detectFlip(text, original) {
    for (var i = 0; i < FLIP_PATTERNS.length; i++) {
      var m = FLIP_PATTERNS[i].exec(text);
      if (m) return { index: m.index, length: m[0].length };
    }
    var lines = sentences(original);
    if (lines.length >= 3) {
      var first = yesNo(lines[0].replace(/\*/g, ""));
      var lastBold = original.match(/\*\*[^*\n]{1,120}\*\*/g);
      var last = lastBold ? yesNo(lastBold[lastBold.length - 1].replace(/\*/g, "")) : null;
      if (first && last && first !== last) {
        return { evidence: "첫 답: " + lines[0].replace(/\*/g, "") + " → 마지막 답: " + lastBold[lastBold.length - 1].replace(/\*/g, "") };
      }
    }
    return null;
  }

  // 2) 과잉추론: '정보 부족/결정 불가'를 말한 뒤 확신 섞인 추정을 덧붙인다
  var INSUFFICIENT = /(insufficient|not enough information|cannot be (uniquely )?determined|can(?:no|')t determine|undetermin|알 수 없|결정할 수 없|확정할 수 없|판단할 수 없|정보가 부족|정보 부족)/i;
  var CONFIDENT_GUESS = /(almost certainly|most likely|very likely|probably|presumably|in all likelihood|거의 확실|틀림없이|아마도?|십중팔구)/i;

  function detectOverinfer(text) {
    var m = INSUFFICIENT.exec(text);
    if (!m) return null;
    var re = new RegExp(CONFIDENT_GUESS.source, "gi");
    re.lastIndex = m.index;
    var g;
    while ((g = re.exec(text))) {
      // 논문 E15처럼 '구체적' 추정(숫자·연도)이 같은 문장에 붙은 경우만 본다
      var sentEnd = text.slice(g.index).search(/[.!?。\n]/);
      var sent = text.slice(g.index, g.index + (sentEnd < 0 ? 200 : sentEnd));
      if (/\d/.test(sent)) return { index: g.index, length: sent.length };
    }
    return null;
  }

  // 3) 설명 모순: '모두 맞다'는 문장 가까이에 틀렸다는 표시가 있다
  var ALL_OK = /(\b(both|all)\b[^.\n]{0,40}\b(are|is)\b[^.\n]{0,10}\b(correct|right|fine|valid)\b|(둘 다|모두|전부)[^.\n]{0,20}(맞|옳|정확))/i;
  var BAD = /(✘|✗|❌|\bwrong\b|\bincorrect\b|\bnot correct\b|틀렸|틀린|잘못)/i;

  function detectContradiction(text) {
    var m = ALL_OK.exec(text);
    if (!m) return null;
    var window = text.slice(m.index + m[0].length, m.index + m[0].length + 160);
    var b = BAD.exec(window);
    if (!b) return null;
    return { index: m.index, length: m[0].length + b.index + b[0].length };
  }

  // 인용한 남의 문장("I was wrong" 등)은 답 자신의 말이 아니므로 같은 길이의 공백으로 가린다
  function maskQuotes(text) {
    return text.replace(/"[^"\n]{0,300}"|“[^”\n]{0,300}”|‘[^’\n]{0,300}’|「[^」\n]{0,300}」/g, function (q) {
      return q.replace(/[^\n]/g, " ");
    });
  }

  // 답으로 읽을 수 있는 글인지 먼저 본다. 통과하지 못하면 점수를 매기지 않는다
  function checkInput(text) {
    var t = String(text == null ? "" : text).slice(0, 20000).trim();
    if (!t) return { ok: false, reason: "empty" };
    var words = t.split(/\s+/).filter(Boolean);
    if (t.length < 15) return { ok: false, reason: "short" };
    var nonSpace = t.replace(/\s+/g, "");
    var letters = (nonSpace.match(/[a-z가-힣ㄱ-ㅎㅏ-ㅣ]/gi) || []).length;
    // 수식이 많은 답도 글자가 4분의 1은 넘는다(논문 답 240개 중 최저 0.39)
    if (letters / nonSpace.length < 0.25) return { ok: false, reason: "noletters" };
    var oneChar = words.filter(function (w) { return w.length === 1; }).length;
    if (words.length >= 8 && oneChar / words.length > 0.6) return { ok: false, reason: "gibberish" };
    // 같은 글자가 길게 이어지거나(ㅋㅋㅋ…, aaaa…), 같은 토막을 되풀이한 글
    if (/([a-z0-9가-힣ㄱ-ㅎㅏ-ㅣ])\1{14,}/i.test(nonSpace)) return { ok: false, reason: "repeated" };
    var counts = {}, top = 0;
    var tokens = words.filter(function (w) { return /[a-z0-9가-힣]/i.test(w); });
    tokens.forEach(function (w) { counts[w] = (counts[w] || 0) + 1; top = Math.max(top, counts[w]); });
    var distinct = Object.keys(counts).length;
    if (tokens.length >= 12 && (distinct / tokens.length < 0.25 || top / tokens.length > 0.3)) return { ok: false, reason: "repeated" };
    for (var size = 2; size <= 40; size++) {
      var unit = nonSpace.slice(0, size);
      if (nonSpace.length >= size * 4 && nonSpace.split(unit).join("").length < nonSpace.length * 0.2) return { ok: false, reason: "repeated" };
    }
    // 자모만 친 글(ㅁㄴㅇㄹ), 띄어쓰기 없는 긴 영문 덩어리, 모음 없는 영문 토막(키보드 연타)
    var jamo = (nonSpace.match(/[ㄱ-ㅎㅏ-ㅣ]/g) || []).length;
    if (jamo / Math.max(1, letters) > 0.3) return { ok: false, reason: "gibberish" };
    // 소문자 영단어만 본다(HCl, PQ 같은 기호·화학식은 빼고)
    var latin = words.filter(function (w) { return !/[\\${}_^]/.test(w); }).map(function (w) { return w.replace(/[^a-z]/gi, ""); })
      .filter(function (w) { return w.length >= 4 && w === w.toLowerCase(); });
    if (latin.length >= 4) {
      var odd = latin.filter(function (w) {
        return w.length > 20 || !/[aeiouy]/.test(w) || /[bcdfghjklmnpqrstvwxz]{6,}/.test(w);
      }).length;
      if (odd / latin.length > 0.3) return { ok: false, reason: "gibberish" };
    }
    if (latin.length < 5 && nonSpace.length > 40 && /^[a-z]+$/i.test(nonSpace)) return { ok: false, reason: "gibberish" };
    if (words.length < 3) return { ok: false, reason: t.length > 40 ? "gibberish" : "short" };
    return { ok: true };
  }

  // 결론을 밝힌 흔적: '답/결론' 표시, 결론 접속어, 등식, 판정 표현(타당·참·틀림·결정 불가 등)
  var CONCLUSION_HINT = /(final answer|answer|verdict|conclusion|therefore|thus|hence|\bso\b|the result|in short|in summary|summary|최종|정답|정리|요약|답[은:：]|결론|따라서|그러므로|그래서|결과적으로|=|타당|부당|\b(in)?valid\b|\b(true|false|correct|incorrect|wrong)\b|참이|거짓|맞습니다|맞다|틀렸|틀린|옳|오류|fallacy|\berror\b|cannot be|불가능|결정할 수|알 수 없|^\s*(yes|no|예|아니오|아니요)\b)/im;

  function analyze(text) {
    var clean = String(text == null ? "" : text).slice(0, 20000);
    var found = [];
    if (clean.trim().length === 0) return { empty: true, signals: [] };
    var masked = maskQuotes(clean);
    var checks = { flip: detectFlip, overinfer: detectOverinfer, contradiction: detectContradiction };
    Object.keys(checks).forEach(function (id) {
      var hit = checks[id](masked, clean);
      if (hit) found.push({ id: id, index: hit.index, evidence: hit.evidence || snippet(clean, hit.index, hit.length) });
    });
    // 핵심 개념을 셋 이상 다룬 서술형 답(실험 설계 등)도 질문에 답한 글로 본다
    var tp = topics(clean);
    // 번복한 답은 첫 줄이 아니라 번복 뒤에 굵게 쓴 답이 최종 답이다
    var flip = null;
    found.forEach(function (x) { if (x.id === "flip") flip = x; });
    var fa = flip && flip.index != null ? afterFlip(clean.slice(flip.index)) : "";
    return { empty: false, signals: found, finalAnswer: fa || finalAnswer(clean), lead: lead(clean), topics: tp, hasConclusion: CONCLUSION_HINT.test(clean) || tp.length >= 3 };
  }

  // '최종 답/답' 표시 줄 → '결론/평가' 표시 줄 → 숫자가 든 굵은 글씨 순서로 찾는다
  // LaTeX로 쓴 수식을 읽을 수 있는 한 줄로 바꾼다($$…$$ 블록, \frac, \neq, \boxed 등)
  function plainMath(text) {
    var t = String(text || "");
    t = t.replace(/\$\$([\s\S]*?)\$\$|\\\[([\s\S]*?)\\\]/g, function (m, a, b) {
      return " " + String(a || b || "").replace(/\\\\\s*/g, "; ").replace(/\s*\n\s*/g, " ").trim() + " ";
    });
    for (var k = 0; k < 3; k++) t = t.replace(/\\[dt]?frac\s*\{([^{}]*)\}\s*\{([^{}]*)\}/g, "($1)/($2)");
    t = t.replace(/\(([a-z0-9.]+)\)\//gi, "$1/").replace(/\/\(([a-z0-9.]+)\)/gi, "/$1");
    t = t.replace(/\\(boxed|text|mathrm|mathbf|operatorname)\s*\{([^{}]*)\}/g, "$2");
    t = t.replace(/\\neq?\b|\\ne\b/g, "≠").replace(/\\leq?\b/g, "≤").replace(/\\geq?\b/g, "≥")
      .replace(/\\cdot\b/g, "·").replace(/\\times\b/g, "×").replace(/\\to\b|\\rightarrow\b/g, "→")
      .replace(/\\Rightarrow\b|\\implies\b/g, "⇒").replace(/\\neg\b|\\lnot\b/g, "¬")
      .replace(/\\lor\b|\\vee\b/g, "∨").replace(/\\land\b|\\wedge\b/g, "∧").replace(/\\emptyset\b|\\varnothing\b/g, "∅")
      .replace(/\\(begin|end)\{[a-z*]+\}/g, " ").replace(/\\(left|right)\b/g, "")
      .replace(/\\(q?quad|[,;:! ])/g, " ").replace(/\\\\/g, "; ").replace(/\\[a-z]+/gi, "")
      .replace(/\$/g, "").replace(/\^\{?2\}?/g, "²").replace(/\^\{?3\}?/g, "³").replace(/[{}]/g, "");
    return t.replace(/[ \t]+/g, " ");
  }

  // 콜론이 붙은 표시("답: …")이거나, 표시만 있는 제목 줄("## 최종 답", "### 결론")
  var ANSWER_LABEL = /^[\s>*#-]*\**\s*(final answers?|answer|최종 답|최종 답변|정답|답)\s*\**\s*([:：]\s*\**\s*|$)/i;
  var CONCLUSION_LABEL = /^[\s>*#-]*\**\s*(verdict|conclusion|summary|in summary|final result|최종 평가|최종 결론|최종 정리|결론|정리|요약)\s*\**\s*([:：.]\s*\**\s*|$)/i;
  // 결론을 이끄는 문장(가장 마지막 것을 쓴다)
  var CONCLUDING = /^(따라서|그러므로|그래서|결론적으로|즉,|정답은|답은|최종적으로|therefore|thus|hence|so,? |in conclusion|the answer is|the smallest|the result is)/i;

  function cleanLine(l) {
    return l.replace(/[*#]/g, "").replace(/^[\s>-]+/, "").trim();
  }

  function labeled(lines, re) {
    for (var i = lines.length - 1; i >= 0; i--) {
      var m = re.exec(lines[i]);
      if (!m) continue;
      var rest = lines[i].slice(m[0].length).replace(/\*/g, "").trim();
      // 표시 줄이 비어 있으면 이어지는 줄(최대 3줄, 다음 제목 전까지)이 답이다
      if (rest.length <= 1) {
        var parts = [];
        for (var j = i + 1; j < lines.length && parts.length < 3 && !/^\s*#/.test(lines[j]); j++) parts.push(cleanLine(lines[j]));
        rest = parts.join(" / ");
      }
      if (rest.length > 1) return rest;
    }
    return "";
  }

  function afterFlip(text) {
    var bolds = (text.match(/\*\*([^*\n]{2,160})\*\*/g) || []).map(function (b) { return b.replace(/\*/g, "").trim(); })
      .filter(function (b) { return !/[:：]$/.test(b); });
    return bolds.join(" · ").slice(0, 160);
  }

  function concluding(lines) {
    for (var i = lines.length - 1; i >= 0; i--) {
      var l = cleanLine(lines[i]);
      var hit = CONCLUDING.test(l) ? l : (l.match(/(따라서|그러므로|therefore|thus|hence|so)[ ,][^.。]*[.。]?/i) || [""])[0];
      if (hit) return hit + (/[:：]$/.test(hit) && lines[i + 1] ? " " + cleanLine(lines[i + 1]) : "");
    }
    return "";
  }

  function finalAnswer(raw) {
    var boxed = [];
    String(raw).replace(/\\boxed\s*\{((?:[^{}]|\{(?:[^{}]|\{[^{}]*\})*\})*)\}/g, function (m, inner) { boxed.push(inner); return m; });
    if (boxed.length) return plainMath(boxed.join(" / ")).trim().slice(0, 160);
    var text = plainMath(raw);
    var lines = text.split(/\n+/).filter(function (l) { return l.trim() && !/^[\s|:-]+$/.test(l); });
    var a = labeled(lines, ANSWER_LABEL) || labeled(lines, CONCLUSION_LABEL);
    if (!a) {
      var bolds = (text.match(/\*\*([^*\n]{2,160})\*\*/g) || []).map(function (b) { return b.replace(/\*/g, "").trim(); });
      for (var i = bolds.length - 1; i >= 0 && !a; i--) if (/\d/.test(bolds[i]) && !/[:：]$/.test(bolds[i])) a = bolds[i];
    }
    a = a || concluding(lines) || (lines.length ? cleanLine(lines[lines.length - 1]) : "");
    return a.replace(/\s+/g, " ").trim().slice(0, 160);
  }

  // 답의 첫 문장(제목·번호 목차 줄은 건너뜀)과 마지막 결론 문장을 함께 본다
  function lead(text) {
    var all = plainMath(text).split(/\n+/);
    var lines = all.map(function (l) { return l.replace(/[*#>]/g, "").trim(); })
      .filter(function (l) { return l && !/^\d+[.)]\s*\S{0,20}$/.test(l) && !/^[|:-\s]+$/.test(l); });
    return ((lines.length ? lines[0].slice(0, 200) : "") + "\n" + concluding(all)).trim();
  }

  function score(signalIds, wrongAnswer) {
    var parts = {};
    RUBRIC.forEach(function (r) { parts[r.key] = r.max; });
    signalIds.forEach(function (id) {
      var d = SIGNALS[id] && SIGNALS[id].deduct;
      if (!d) return;
      Object.keys(d).forEach(function (k) { parts[k] = Math.max(0, parts[k] - d[k]); });
    });
    if (wrongAnswer) parts.accuracy = 0;
    var total = 0;
    Object.keys(parts).forEach(function (k) { total += parts[k]; });
    return { parts: parts, total: total };
  }

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
    ["undetermined", /cannot (be )?(uniquely )?(determined|established|concluded|justif)|can't be determined|not (logically )?(established|determined)|insufficient|not enough information|cannot (conclude|establish|justify|be called)|cannot establish|결정할 수 없|알 수 없|정할 수 없|확정(되지 않|할 수 없)|결론(내|을 내)릴 수 없|말할 수 없|도출할 수 없|단정할 수 없/gi],
    ["inconsistent", /inconsistent|contradict|unsatisfiable|cannot (all )?be true|모순|일관되지 않|동시에 참일 수 없/gi],
    ["wrong", /\b(wrong|incorrect|unreliable|unjustified|not supported|not a valid)\b|틀렸|틀린|신뢰할 수 없|근거 없|잘못/gi],
    ["empty", /no real number|empty set|∅|존재하지 않/gi],
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
    ["sycophancy", /sycophan|아첨/gi]
  ];
  var OPPOSITE = [["valid", "invalid"], ["true", "false"]];

  function keyOf(answer) {
    var a = plainMath(answer || "").toLowerCase().replace(/−/g, "-").replace(/(\d),(?=\d{3}\b)/g, "$1");
    var nums = (a.match(/\d+(?:\.\d+)?/g) || []).map(function (n) { return String(parseFloat(n)); });
    // 수식: 공백을 빼고 기호가 섞인 토막(¬P∨Q, n², E=mc²)
    var maths = (a.replace(/\s*([∨∧→⇒=+−×^≠≤≥/])\s*/g, "$1").replace(/([a-z0-9)])\s+-\s+(?=[a-z0-9(])/g, "$1-").replace(/¬\s+/g, "¬").match(/[a-z0-9¬∨∧→⇒²³₀-₉∅=+−×()^≠≤≥/.-]*[¬∨∧→⇒²³₀-₉=^≠≤≥][a-z0-9¬∨∧→⇒²³₀-₉∅=+−×()^≠≤≥/.-]*/g) || [])
      .map(function (m) { return m.replace(/[.\-]+$/, ""); }).filter(function (m) { return m.length >= 2; });
    var tags = {};
    var rest = a;
    CONCEPTS.forEach(function (c) {
      var re = new RegExp(c[1].source, "gi");
      if (re.test(rest)) { tags[c[0]] = true; rest = rest.replace(new RegExp(c[1].source, "gi"), " "); }
    });
    return { nums: nums, maths: maths, tags: tags, yn: yesNo(a) };
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

  function relationsDiffer(x, y) {
    var rx = relations(x), ry = relations(y), differ = false, agree = false;
    Object.keys(rx).forEach(function (k) {
      if (!ry[k]) return;
      if (overlap(rx[k], ry[k])) agree = true; else differ = true;
    });
    return differ && !agree;
  }

  // 두 숫자 묶음이 절반 이상 겹치는가(중복 제거 후)
  function similarNums(x, y) {
    var ux = x.filter(function (v, i) { return x.indexOf(v) === i; });
    var uy = y.filter(function (v, i) { return y.indexOf(v) === i; });
    var common = ux.filter(function (v) { return uy.indexOf(v) >= 0; }).length;
    var smaller = Math.min(ux.length, uy.length);
    return smaller > 0 && common / smaller >= 0.5;
  }

  function overlap(x, y) {
    return x.some(function (v) { return y.indexOf(v) >= 0; });
  }

  // 반대 개념(타당↔부당, 참↔거짓, 예↔아니오)이 갈리면 다른 답,
  // 겹치는 숫자·수식·개념이 있으면 같은 답, 둘 다 없으면 판단하지 않는다
  function compare(a, b) {
    // 갈림(반대 개념·다른 숫자)은 최종 답 칸만 보고, 같음은 첫 문장·결론 문장까지 함께 본다
    var fa = keyOf(a.finalAnswer), fb = keyOf(b.finalAnswer);
    var ka = keyOf((a.finalAnswer || "") + "\n" + (a.lead || ""));
    var kb = keyOf((b.finalAnswer || "") + "\n" + (b.lead || ""));
    var conflict = OPPOSITE.some(function (o) {
      var aa = fa.tags[o[0]] && !fa.tags[o[1]], an = fa.tags[o[1]] && !fa.tags[o[0]];
      var ba = fb.tags[o[0]] && !fb.tags[o[1]], bn = fb.tags[o[1]] && !fb.tags[o[0]];
      return (aa && bn) || (an && ba);
    });
    if (fa.yn && fb.yn && fa.yn !== fb.yn) conflict = true;
    // "결정할 수 없다"와 단정한 "예"는 다른 답
    if ((fa.tags.undetermined && !fb.tags.undetermined && fb.yn === "yes") || (fb.tags.undetermined && !fa.tags.undetermined && fa.yn === "yes")) conflict = true;
    var tagsA = Object.keys(ka.tags), tagsB = Object.keys(kb.tags);
    var shared = overlap(ka.maths, kb.maths) || overlap(tagsA, tagsB);
    var match = shared || similarNums(ka.nums, kb.nums) || (ka.yn && ka.yn === kb.yn);
    // 같은 변수에 다른 값을 준 식(x=1/(t-1) ↔ x=1/(t-2), t≠1 ↔ t≠2)이 있거나, 숫자가 절반도 안 겹치면 다른 답
    var mathsDiffer = relationsDiffer(fa.maths, fb.maths);
    var numsDiffer = fa.nums.length && fb.nums.length && !similarNums(fa.nums, fb.nums) && !shared;
    var same = conflict || mathsDiffer || numsDiffer ? false : (match ? true : null);
    var result = { sameAnswer: same, mode: "answer", aSignals: a.signals.length, bSignals: b.signals.length };
    // 한 줄 최종 답이 없거나 핵심 개념이 많은 서술형 답은 개념을 얼마나 똑같이 다뤘는지로 본다
    var ta = a.topics || [], tb = b.topics || [];
    if (same !== false && Math.min(ta.length, tb.length) >= (same === null ? 3 : 4)) {
      var both = ta.filter(function (t) { return tb.indexOf(t) >= 0; });
      result.mode = "topics";
      result.topics = {
        both: both,
        onlyA: ta.filter(function (t) { return tb.indexOf(t) < 0; }),
        onlyB: tb.filter(function (t) { return ta.indexOf(t) < 0; })
      };
      // 서술형은 '틀린 답'이 아니라 다룬 내용이 갈린 것이므로 false 대신 "partial"
      result.sameAnswer = both.length / (ta.length + tb.length - both.length) >= 0.6 ? true : "partial";
    }
    return result;
  }

  var api = { RUBRIC: RUBRIC, SIGNALS: SIGNALS, checkInput: checkInput, analyze: analyze, score: score, compare: compare };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.P2Check = api;
})(typeof window !== "undefined" ? window : this);
