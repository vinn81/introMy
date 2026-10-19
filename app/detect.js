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

  // 결론을 밝힌 흔적: '답/결론' 표시, 결론 접속어, 등식 (논문 답 240개 모두 해당)
  var CONCLUSION_HINT = /(final answer|answer|verdict|conclusion|therefore|thus|hence|\bso\b|the result|in short|최종|정답|답[은:：]|결론|따라서|그러므로|그래서|결과적으로|=)/i;

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
    // 번복한 답은 첫 줄이 아니라 번복 뒤에 굵게 쓴 답이 최종 답이다
    var flip = null;
    found.forEach(function (x) { if (x.id === "flip") flip = x; });
    var fa = flip && flip.index != null ? afterFlip(clean.slice(flip.index)) : "";
    return { empty: false, signals: found, finalAnswer: fa || finalAnswer(clean), lead: lead(clean), hasConclusion: CONCLUSION_HINT.test(clean) };
  }

  // '최종 답/답' 표시 줄 → '결론/평가' 표시 줄 → 숫자가 든 굵은 글씨 순서로 찾는다
  // 콜론이 붙은 표시("답: …")이거나, 표시만 있는 제목 줄("## 최종 답")
  var ANSWER_LABEL = /^[\s>*#-]*\**\s*(final answers?|answer|최종 답|최종 답변|답)\s*\**\s*([:：]\s*\**\s*|$)/i;
  var CONCLUSION_LABEL = /^[\s>*#-]*\**\s*(verdict|conclusion|최종 평가|최종 결론|결론)\s*\**\s*([:：.]\s*\**\s*|$)/i;

  function labeled(lines, re) {
    for (var i = lines.length - 1; i >= 0; i--) {
      var m = re.exec(lines[i]);
      if (!m) continue;
      var rest = lines[i].slice(m[0].length).replace(/\*/g, "").trim();
      // 표시 줄이 비어 있으면 다음 줄이 답이다
      for (var j = i + 1; rest.length <= 1 && j < lines.length && j <= i + 2; j++) rest = lines[j].replace(/[*#]/g, "").replace(/^[\s>-]+/, "").trim();
      if (rest.length > 1) return rest.slice(0, 160);
    }
    return "";
  }

  function afterFlip(text) {
    var bolds = (text.match(/\*\*([^*\n]{2,160})\*\*/g) || []).map(function (b) { return b.replace(/\*/g, "").trim(); })
      .filter(function (b) { return !/[:：]$/.test(b); });
    return bolds.join(" · ").slice(0, 160);
  }

  function finalAnswer(text) {
    var lines = text.split(/\n+/).filter(function (l) { return l.trim() && !/^[\s|:-]+$/.test(l); });
    var a = labeled(lines, ANSWER_LABEL) || labeled(lines, CONCLUSION_LABEL);
    if (a) return a;
    var bolds = (text.match(/\*\*([^*\n]{2,160})\*\*/g) || []).map(function (b) { return b.replace(/\*/g, "").trim(); });
    for (var i = bolds.length - 1; i >= 0; i--) if (/\d/.test(bolds[i]) && !/[:：]$/.test(bolds[i])) return bolds[i];
    return lines[0] ? lines[0].replace(/[*#]/g, "").trim().slice(0, 160) : "";
  }

  // 답의 첫 문장(제목·번호 목차 줄은 건너뜀)
  function lead(text) {
    var lines = text.split(/\n+/).map(function (l) { return l.replace(/[*#>]/g, "").trim(); })
      .filter(function (l) { return l && !/^\d+[.)]\s*\S{0,20}$/.test(l) && !/^[|:-\s]+$/.test(l); });
    return lines.length ? lines[0].slice(0, 200) : "";
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
    var a = (answer || "").toLowerCase();
    var nums = (a.match(/\d+(?:\.\d+)?/g) || []).map(function (n) { return String(parseFloat(n)); });
    // 수식: 공백을 빼고 기호가 섞인 토막(¬P∨Q, n², E=mc²)
    var maths = (a.replace(/\s*([∨∧→⇒=+−×^])\s*/g, "$1").replace(/¬\s+/g, "¬").match(/[a-z0-9¬∨∧→⇒²³₀-₉∅=+−×()^]*[¬∨∧→⇒²³₀-₉=^][a-z0-9¬∨∧→⇒²³₀-₉∅=+−×()^]*/g) || [])
      .filter(function (m) { return m.length >= 2; });
    var tags = {};
    var rest = a;
    CONCEPTS.forEach(function (c) {
      var re = new RegExp(c[1].source, "gi");
      if (re.test(rest)) { tags[c[0]] = true; rest = rest.replace(new RegExp(c[1].source, "gi"), " "); }
    });
    return { nums: nums, maths: maths, tags: tags, yn: yesNo(a) };
  }

  function overlap(x, y) {
    return x.some(function (v) { return y.indexOf(v) >= 0; });
  }

  // 반대 개념(타당↔부당, 참↔거짓, 예↔아니오)이 갈리면 다른 답,
  // 겹치는 숫자·수식·개념이 있으면 같은 답, 둘 다 없으면 판단하지 않는다
  function compare(a, b) {
    var ka = keyOf((a.finalAnswer || "") + "\n" + (a.lead || ""));
    var kb = keyOf((b.finalAnswer || "") + "\n" + (b.lead || ""));
    var conflict = OPPOSITE.some(function (o) {
      var aa = ka.tags[o[0]] && !ka.tags[o[1]], an = ka.tags[o[1]] && !ka.tags[o[0]];
      var ba = kb.tags[o[0]] && !kb.tags[o[1]], bn = kb.tags[o[1]] && !kb.tags[o[0]];
      return (aa && bn) || (an && ba);
    });
    if (ka.yn && kb.yn && ka.yn !== kb.yn) conflict = true;
    // "결정할 수 없다"와 단정한 "예"는 다른 답
    if ((ka.tags.undetermined && !kb.tags.undetermined && kb.yn === "yes") || (kb.tags.undetermined && !ka.tags.undetermined && ka.yn === "yes")) conflict = true;
    var tagsA = Object.keys(ka.tags), tagsB = Object.keys(kb.tags);
    var match = overlap(ka.nums, kb.nums) || overlap(ka.maths, kb.maths) || overlap(tagsA, tagsB) || (ka.yn && ka.yn === kb.yn);
    var numsDiffer = ka.nums.length && kb.nums.length && !overlap(ka.nums, kb.nums) && !overlap(tagsA, tagsB);
    var same = conflict || numsDiffer ? false : (match ? true : null);
    return { sameAnswer: same, aSignals: a.signals.length, bSignals: b.signals.length };
  }

  var api = { RUBRIC: RUBRIC, SIGNALS: SIGNALS, checkInput: checkInput, analyze: analyze, score: score, compare: compare };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.P2Check = api;
})(typeof window !== "undefined" ? window : this);
