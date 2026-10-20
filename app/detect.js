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

  // 답 표시("Answer:", "답:")를 걷어낸 뒤 문장이 "Yes." "아니오,"처럼 예/아니오 한 마디로 시작할 때만 그 답으로 본다
  // ("No contradiction found"의 No는 답이 아니다)
  var LEADING_YN = /^(?:(?:final answers?|answer|최종 답|정답|답|결론|conclusion)\s*[:：]\s*)?(yes|no|예|네|아니오|아니요)(?=\s*[.,!:;)—–-]|\s*$)/i;

  function leadingYesNo(s) {
    var m = LEADING_YN.exec(String(s).replace(/\*/g, "").trim());
    if (!m) return null;
    return /^(yes|예|네)$/i.test(m[1]) ? "yes" : "no";
  }

  function detectFlip(text, original) {
    for (var i = 0; i < FLIP_PATTERNS.length; i++) {
      var m = FLIP_PATTERNS[i].exec(text);
      if (m) return { index: m.index, length: m[0].length };
    }
    var lines = sentences(original);
    if (lines.length >= 3) {
      var first = leadingYesNo(lines[0]);
      var lastBold = original.match(/\*\*[^*\n]{1,120}\*\*/g);
      var last = lastBold ? leadingYesNo(lastBold[lastBold.length - 1]) : null;
      if (first && last && first !== last) {
        return { evidence: "첫 답: " + lines[0].replace(/\*/g, "") + " → 마지막 답: " + lastBold[lastBold.length - 1].replace(/\*/g, "") };
      }
    }
    return null;
  }

  // 2) 과잉추론: '정보 부족/결정 불가'를 말한 뒤 확신 섞인 추정을 덧붙인다
  var INSUFFICIENT = /(insufficient|not enough information|cannot be (uniquely )?determined|can(?:no|')t determine|undetermin|알 수 없|결정할 수 없|확정할 수 없|판단할 수 없|정보가 부족|정보 부족)/i;
  var CONFIDENT_GUESS = /(almost certainly|most likely|very likely|probably|presumably|in all likelihood|거의 확실|틀림없이|아마도?|십중팔구)/i;
  // 강한 확신 표현은 그대로 신호, 약한 표현(probably·아마)은 바로 뒤에서 불확실하다고 밝히면 신호가 아니다(논문 P2M-01-052는 만점)
  var STRONG_GUESS = /(almost certainly|most likely|very likely|in all likelihood|거의 확실|틀림없이|십중팔구)/i;
  var HEDGE = /(not a certainty|likelihood, not|only an? (guess|estimate|assumption)|not certain|uncertain|추측일 뿐|추정일 뿐|가정일 뿐|확실하지 않|불확실)/i;

  function detectOverinfer(text) {
    var m = INSUFFICIENT.exec(text);
    if (!m) return null;
    var re = new RegExp(CONFIDENT_GUESS.source, "gi");
    re.lastIndex = m.index;
    var g;
    while ((g = re.exec(text))) {
      // 논문 E15처럼 '구체적' 추정(연도·두 자리 이상 숫자)이 같은 문장에 붙은 경우만 본다
      // ("step 2", "case 1" 같은 순서 번호는 추정이 아니다)
      var sentEnd = text.slice(g.index).search(/[.!?。\n]/);
      var sent = text.slice(g.index, g.index + (sentEnd < 0 ? 200 : sentEnd));
      if (!/\d{2,}/.test(sent.replace(/\b(step|case|part|item|line|단계|번째)\s*\d+/gi, ""))) continue;
      if (!STRONG_GUESS.test(g[0])) {
        var rest = text.slice(g.index + (sentEnd < 0 ? 200 : sentEnd));
        var next = rest.replace(/^[.!?。\s]+/, "").split(/(?<=[.!?。])\s+|\n+/)[0] || "";
        if (HEDGE.test(sent) || HEDGE.test(next)) continue;
      }
      return { index: g.index, length: sent.length };
    }
    return null;
  }

  // 3) 설명 모순: '모두 맞다'는 문장 가까이에 틀렸다는 표시가 있다
  var ALL_OK = /(\b(both|all)\b[^.\n]{0,40}\b(are|is)\b[^.\n]{0,10}\b(correct|right|fine|valid)\b|(둘 다|모두|전부)[^.\n]{0,20}(맞|옳|정확))/i;
  // 틀림 표시는 기호(✘)나 서술어("is wrong", "틀렸다")만 센다. "the incorrect approach would be" 같은 가정 속 명사구는 뺀다
  var BAD = /(✘|✗|❌|\b(is|are|was|were|be|looks|seems)\s+(actually\s+|in fact\s+)?(wrong|incorrect|not correct)\b|틀렸|틀립니다|틀리다|잘못(되|됐|했|이다|입니다))/i;

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
    // 짧은 계산 답("17×24=388. Since 17×20=340 …")은 글자보다 숫자가 많아도 등식이 있으면 답으로 읽는다
    var equation = /\d\s*[=×x*+\/−-]\s*\d[\s\S]*=|\d\s*=\s*\d/.test(t) && letters >= 3;
    if (letters / nonSpace.length < 0.25 && !equation) return { ok: false, reason: "noletters" };
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

  // 두 문장 이하의 짧은 답("프랑스의 수도는 파리입니다.")은 답 전체가 결론이다
  function isShortAnswer(text) {
    var t = String(text).trim();
    return t.length <= 200 && sentences(t).length <= 2;
  }

  function conclusionBy(text, tp) {
    var m = CONCLUSION_HINT.exec(text);
    if (m) return m[0].trim() === "=" ? "등식(=)으로 답을 냄" : "결론 표시 ‘" + m[0].trim() + "’";
    if (tp.length >= 3) return "핵심 개념 " + tp.length + "개(" + tp.slice(0, 4).join(", ") + ")를 다룬 서술형 답";
    if (isShortAnswer(text)) return "두 문장 이하의 짧은 답이라 답 전체를 결론으로 봄";
    return "";
  }

  function lastSentence(text) {
    var parts = plainMath(text).replace(/[*#>]/g, "").split(/(?<=[.!?。])\s+|\n+/).map(function (x) { return x.trim(); }).filter(Boolean);
    var l = parts.length ? parts[parts.length - 1] : "";
    return l.length > 80 ? l.slice(0, 80) + "…" : l;
  }

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
    return { empty: false, signals: found, finalAnswer: fa || finalAnswer(clean), lead: lead(clean), topics: tp, text: clean, hasConclusion: CONCLUSION_HINT.test(clean) || tp.length >= 3 || isShortAnswer(clean),
      conclusionBy: conclusionBy(clean, tp), lastSentence: lastSentence(clean) };
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
      .replace(/\\Leftrightarrow\b|\\leftrightarrow\b|\\iff\b/g, "↔").replace(/\\sum\b/g, "Σ")
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
      // 결론 문장 하나만 쓴다(한 문단에 뒤따르는 풀이 문장의 숫자가 최종 답에 섞이지 않게)
      // 한 줄에 결론 접속어가 여럿이면 마지막 것("…, so a platypus lays eggs. Therefore both … are correct.")
      var inLine = l.match(/(따라서|그러므로|\b(?:therefore|thus|hence|so))[ ,][^.。]*[.。]?/gi) || [""];
      var hit = CONCLUDING.test(l) ? l.split(/(?<=[.!?。])\s+/)[0] : inLine[inLine.length - 1];
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

  // a, b: { finalAnswer, lead, topics, text, signals }
  // 돌려주는 값: sameAnswer(true | false | "partial" | null), mode, why(판정 근거 문장들)
  function compare(a, b) {
    // 갈림(반대 개념·다른 숫자)은 최종 답 칸만 보고, 같음은 첫 문장·결론 문장까지 함께 본다
    var fa = keyOf(a.finalAnswer), fb = keyOf(b.finalAnswer);
    var ka = keyOf((a.finalAnswer || "") + "\n" + (a.lead || ""));
    var kb = keyOf((b.finalAnswer || "") + "\n" + (b.lead || ""));
    var why = [];
    var conflicts = [];
    OPPOSITE.forEach(function (o) {
      var aa = fa.tags[o[0]] && !fa.tags[o[1]], an = fa.tags[o[1]] && !fa.tags[o[0]];
      var ba = fb.tags[o[0]] && !fb.tags[o[1]], bn = fb.tags[o[1]] && !fb.tags[o[0]];
      if (aa && bn) conflicts.push("1단계 답은 ‘" + TAG_LABELS[o[0]] + "’, 다른 언어 답은 ‘" + TAG_LABELS[o[1]] + "’");
      if (an && ba) conflicts.push("1단계 답은 ‘" + TAG_LABELS[o[1]] + "’, 다른 언어 답은 ‘" + TAG_LABELS[o[0]] + "’");
    });
    if (fa.yn && fb.yn && fa.yn !== fb.yn) conflicts.push("1단계 답은 ‘" + (fa.yn === "yes" ? "예" : "아니오") + "’, 다른 언어 답은 ‘" + (fb.yn === "yes" ? "예" : "아니오") + "’");
    // "결정할 수 없다"와 단정한 "예"는 다른 답
    if (fa.tags.undetermined && !fb.tags.undetermined && fb.yn === "yes") conflicts.push("1단계 답은 ‘결정할 수 없음’, 다른 언어 답은 ‘예’로 단정");
    if (fb.tags.undetermined && !fa.tags.undetermined && fa.yn === "yes") conflicts.push("1단계 답은 ‘예’로 단정, 다른 언어 답은 ‘결정할 수 없음’");
    var tagsA = Object.keys(ka.tags), tagsB = Object.keys(kb.tags);
    var sharedMaths = ka.maths.filter(function (m, i) { return kb.maths.indexOf(m) >= 0 && ka.maths.indexOf(m) === i; });
    var sharedTags = tagsA.filter(function (t) { return tagsB.indexOf(t) >= 0; });
    var shared = sharedMaths.length > 0 || sharedTags.length > 0;
    var numsA = ka.nums.concat(ka.alt), numsB = kb.nums.concat(kb.alt);
    var finA = fa.nums.concat(fa.alt), finB = fb.nums.concat(fb.alt);
    var numsSimilar = similarNums(numsA, numsB);
    var ynSame = ka.yn && ka.yn === kb.yn;
    var match = shared || numsSimilar || ynSame;
    // 같은 변수에 다른 값을 준 식(x=1/(t-1) ↔ x=1/(t-2), t≠1 ↔ t≠2)이 있거나, 숫자가 절반도 안 겹치면 다른 답
    var relDiff = relationsDiffer(fa.maths, fb.maths);
    if (relDiff) conflicts.push("같은 변수에 다른 값: " + relDiff);
    if (fa.nums.length && fb.nums.length && !similarNums(finA, finB) && !shared) {
      conflicts.push("최종 답의 숫자가 다름: " + uniq(fa.nums).join(", ") + " ↔ " + uniq(fb.nums).join(", "));
    }
    var same = conflicts.length ? false : (match ? true : null);
    if (same === false) why = conflicts;
    if (same === true) {
      if (sharedMaths.length) why.push("두 답에 같은 식이 있음: " + sharedMaths.slice(0, 3).join(", "));
      if (sharedTags.length) why.push("두 답의 판정이 같음: " + sharedTags.map(function (t) { return "‘" + (TAG_LABELS[t] || t) + "’"; }).join(", "));
      if (numsSimilar) why.push("두 답의 숫자가 절반 이상 겹침: " + uniq(numsA).filter(function (n) { return hasNum(numsB, n); }).slice(0, 5).join(", "));
      if (ynSame) why.push("두 답 모두 ‘" + (ka.yn === "yes" ? "예" : "아니오") + "’로 답함");
    }
    var result = { sameAnswer: same, mode: "answer", aSignals: a.signals.length, bSignals: b.signals.length, why: why };

    // 한 줄 최종 답이 없거나 핵심 개념이 많은 서술형 답은 개념을 얼마나 똑같이 다뤘는지로 본다
    var ta = a.topics || [], tb = b.topics || [];
    if (same !== false && Math.min(ta.length, tb.length) >= (same === null ? 3 : 4)) {
      var both = ta.filter(function (t) { return tb.indexOf(t) >= 0; });
      var ratio = both.length / (ta.length + tb.length - both.length);
      result.mode = "topics";
      result.topics = {
        both: both,
        onlyA: ta.filter(function (t) { return tb.indexOf(t) < 0; }),
        onlyB: tb.filter(function (t) { return ta.indexOf(t) < 0; })
      };
      // 서술형은 '틀린 답'이 아니라 다룬 내용이 갈린 것이므로 false 대신 "partial"
      result.sameAnswer = ratio >= 0.6 ? true : "partial";
      result.why = ["핵심 개념 " + (ta.length + tb.length - both.length) + "개 중 " + both.length + "개를 두 답이 함께 다룸(" + Math.round(ratio * 100) + "%, 60% 이상이면 같은 내용으로 봄)"];
      return result;
    }

    // 결론 줄로 판정이 안 되면 두 답 전체에서 언어와 무관한 단서(숫자·수식·개념)를 맞댄다
    if (same === null && a.text && b.text) {
      var na = neutralFeatures(a.text), nb = neutralFeatures(b.text);
      var la = Object.keys(na), lb = Object.keys(nb);
      var common = sharedKeys(na, nb);
      var denom = Math.min(la.length, lb.length);
      if (denom >= 2) {
        var r = common.length / denom;
        result.mode = "whole";
        result.sameAnswer = r >= 0.5 ? true : "partial";
        result.why = [
          "결론 줄에서 맞댈 숫자·판정을 찾지 못해 두 답 전체의 숫자·수식·개념을 맞댐",
          "단서가 적은 쪽(" + denom + "개) 기준 " + common.length + "개가 겹침(" + Math.round(r * 100) + "%, 50% 이상이면 같은 내용으로 봄)",
          common.length ? "겹친 단서: " + labels(common, na).join(", ") : "겹친 단서 없음"
        ];
        var onlyA = la.filter(function (k) { return common.indexOf(k) < 0; }), onlyB = lb.filter(function (k) { return sharedKeys(nb, na).indexOf(k) < 0; });
        if (r < 0.5) {
          if (onlyA.length) result.why.push("1단계 답에만: " + labels(onlyA, na).join(", "));
          if (onlyB.length) result.why.push("다른 언어 답에만: " + labels(onlyB, nb).join(", "));
        }
        return result;
      }
    }
    if (same === null) {
      result.why = [
        "1단계 최종 답 ‘" + short(a.finalAnswer) + "’에서 찾은 단서: " + (keyLabels(fa).join(", ") || "없음"),
        "다른 언어 최종 답 ‘" + short(b.finalAnswer) + "’에서 찾은 단서: " + (keyLabels(fb).join(", ") || "없음"),
        "두 답 전체에서도 언어와 무관한 단서(두 자리 이상 숫자·수식·핵심 개념)가 각각 2개 이상 있어야 맞댈 수 있는데, " +
          (a.text && b.text ? "1단계 답 " + Object.keys(neutralFeatures(a.text)).length + "개, 다른 언어 답 " + Object.keys(neutralFeatures(b.text)).length + "개뿐입니다" : "최종 답 칸을 직접 고쳐 전체 비교를 건너뛰었습니다")
      ];
    }
    return result;
  }

  // 한 문장 안에 부정·오류 표시가 있으면 그 명제를 단정한 것이 아니라 고치거나 비판한 것이다
  var REPORTING = /(\bnot\b|n't|\bno\b|\bnever\b|wrong|incorrect|unsupported|unjustified|unwarranted|invalid|fallac|error|mistak|cannot|아니|아닙|아님|아냐|않|없|틀|오류|잘못|근거 ?없|부당|비약|성급)/i;

  // claim: { wrong, right } — 기준 정답이 명제의 부정이라 숫자·판정어로 맞댈 수 없는 문항(data.js P2_CLAIMS)
  function claimCheck(an, claim) {
    if (!claim || !claim.wrong) return "";
    var re = new RegExp(claim.wrong, "i");
    var parts = sentences(maskQuotes(String(an.finalAnswer || "")));
    for (var i = 0; i < parts.length; i++) {
      var m = re.exec(parts[i]);
      if (m && !REPORTING.test(parts[i])) return "기준 정답은 ‘" + claim.right + "’인데, 최종 답은 부정이나 오류 표시 없이 ‘" + m[0].trim() + "’라고 단정함";
    }
    return "";
  }

  // 답의 최종 답이 P2-Bench 기준 정답과 같은지 본다.
  // 돌려주는 값: status("match" | "mismatch" | "unknown"), strong(숫자·식·특정 개념으로 맞았는지), why
  function matchReference(an, reference, claim) {
    if (!an || !reference) return { status: "unknown", why: [] };
    var claimed = claimCheck(an, claim);
    if (claimed) return { status: "mismatch", why: [claimed] };
    // 기준 정답 속 "not 99%"처럼 부정된 값은 정답이 아니므로 뺀다
    var refText = String(reference).replace(/\b(not|rather than)\s+[^,;.]*?\d[^,;.]*/gi, " ");
    // 첫 마디에 숫자가 있으면 그것이 정답 값이다("The correct answer is 408; 340+68=408 because …"의 뒤는 해설)
    var head = refText.split(/[;；.。]\s/)[0];
    var refMain = keyOf(head).nums.length ? head : refText;
    var c = compare({ finalAnswer: an.finalAnswer, lead: an.lead, topics: [], text: "", signals: [] }, { finalAnswer: refMain, lead: "", topics: [], text: "", signals: [] });
    var fa = keyOf((an.finalAnswer || "") + "\n" + (an.lead || "")), fr = keyOf(refText);
    // 기준 정답이 '결정할 수 없음·해 없음·모순'인데, 답은 어디서도 그렇게 말하지 않고 값이나 '일관됨'을 단정하면 다른 답
    var refNo = ["undetermined", "empty", "inconsistent"].filter(function (t) { return fr.tags[t]; });
    if (refNo.length) {
      var whole = keyOf(an.text || ((an.finalAnswer || "") + "\n" + (an.lead || "")));
      var admits = ["undetermined", "empty", "inconsistent", "wrong"].some(function (t) { return whole.tags[t]; });
      var claim = keyOf(an.finalAnswer || "");
      var claimed = claim.maths.length ? "식 " + claim.maths[0] : claim.nums.length ? "값 " + claim.nums.join(", ") : claim.tags.consistent ? "‘일관됨’" : "";
      if (!admits && claimed) {
        return { status: "mismatch", why: ["기준 정답은 ‘" + refNo.map(function (t) { return TAG_LABELS[t]; }).join("·") + "’인데, 이 답은 그런 말 없이 " + claimed + "을 단정함"] };
      }
    }
    // 기준 정답은 해설 문장이 붙어 있어("…; the valid form is …") 판정어는 첫 마디로만 맞댄다
    var numberConflict = c.sameAnswer === false && c.why.some(function (w) { return /^(최종 답의 숫자가 다름|같은 변수에 다른 값)/.test(w); });
    if (c.sameAnswer === false && !numberConflict) {
      var c2 = compare({ finalAnswer: an.finalAnswer, lead: an.lead, topics: [], text: "", signals: [] }, { finalAnswer: head, lead: "", topics: [], text: "", signals: [] });
      if (c2.sameAnswer !== false) return { status: "unknown", why: [] };
    }
    if (c.sameAnswer === false) {
      // 최종 답을 잘못 뽑았을 수도 있으니, 기준 정답의 숫자가 답 본문에 모두 나오면 단정하지 않는다
      var body = keyOf(an.text || "").nums, refNums = uniq(fr.nums);
      if (refNums.length && refNums.every(function (n) { return hasNum(body, n); })) return { status: "unknown", why: [] };
      return { status: "mismatch", why: c.why };
    }
    // 정답 값: 기준 정답 첫 마디의 두 자리 이상 숫자·소수와 그 환산값(16.7% → 0.167)
    var mainKey = keyOf(refMain);
    var isBig = function (n) { return n.length >= 2 || n.indexOf(".") >= 0; };
    var mainBig = uniq(mainKey.nums).filter(isBig), mainVals = mainBig.concat(mainKey.alt);
    var hasMain = function (list) { return mainVals.some(function (n) { return hasNum(list, n); }); };
    var finalKey = keyOf(an.finalAnswer || ""), finalBig = uniq(finalKey.nums).filter(isBig);
    var bodyKey = keyOf(an.text || ""), bodyNums = bodyKey.nums.concat(bodyKey.alt);
    // 최종 문장에 값이 없으면("따라서 이 AI의 답은 맞습니다") 답 전체에서 정답 값을 찾는다
    if (c.sameAnswer !== false && mainBig.length && !finalBig.length && !hasMain(bodyNums)) {
      return { status: "mismatch", why: ["답 어디에도 기준 정답의 값 " + mainBig.join(", ") + "이 없음"] };
    }
    if (c.sameAnswer !== true) return { status: "unknown", why: [] };
    // 판정어(틀렸다 등)가 같아도 정답 값이 최종 답에 없고 다른 값만 있으면 다른 답(408 ↔ 388)
    if (mainBig.length && finalBig.length && !hasMain(finalBig) && !hasMain(bodyNums)) {
      return { status: "mismatch", why: ["최종 답의 값 " + finalBig.join(", ") + "이 기준 정답의 값 " + mainBig.join(", ") + "과 다름"] };
    }
    // 강한 일치: 기준 정답의 두 자리 이상 숫자·소수가 모두 최종 답에 있거나, 세 글자 이상 같은 식이 있을 때.
    // 개념어(교란 변수·상관관계)만 같은 것은 비슷한 다른 문항에도 흔해 강한 근거로 보지 않는다
    var big = uniq(fr.nums).filter(function (n) { return n.length >= 2 || n.indexOf(".") >= 0; });
    var finNums = fa.nums.concat(fa.alt);
    var finBig = uniq(fa.nums).filter(function (n) { return n.length >= 2 || n.indexOf(".") >= 0; });
    var strong = (big.length > 0 && big.every(function (n) { return hasNum(finNums, n); }) &&
        finBig.filter(function (n) { return hasNum(big, n); }).length * 2 >= finBig.length) ||
      fa.maths.some(function (m) { return m.length >= 3 && fr.maths.indexOf(m) >= 0; });
    // 최종 답이 '틀림·해 없음·결정 불가'를 말하는데 기준 정답은 아니면, 같은 식은 남의 틀린 답을 인용한 것이다
    if (["wrong", "empty", "undetermined", "inconsistent"].some(function (t) { return fa.tags[t] && !fr.tags[t]; })) strong = false;
    return { status: "match", strong: strong, why: c.why };
  }

  function uniq(xs) { return xs.filter(function (v, i) { return xs.indexOf(v) === i; }); }

  function short(t) {
    t = String(t || "").replace(/\s+/g, " ").trim();
    return t.length > 50 ? t.slice(0, 50) + "…" : (t || "없음");
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

  function hangulShare(text) {
    var h = (text.match(/[가-힣]/g) || []).length, l = (text.match(/[a-z]/gi) || []).length;
    return h + l ? h / (h + l) : 0;
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

  var idfCache = { src: null, idf: null, n: 0 };

  // 희귀도: 비교용 질문 묶음(P2-Bench 60문항) 가운데 그 단서가 나오는 문항이 적을수록 무겁다
  function idfOf(decoys) {
    if (idfCache.src === decoys) return idfCache;
    var df = {};
    var feats = decoys.map(function (d) {
      var f = features(d.join("\n"));
      Object.keys(f).forEach(function (key) { df[key] = (df[key] || 0) + 1; });
      return d.map(function (dq) { return { f: features(dq), share: hangulShare(dq) }; });
    });
    idfCache = { src: decoys, idf: df, n: decoys.length, feats: feats };
    return idfCache;
  }

  // 한 자리 숫자는 어디에나 나오므로 반만, 수식 토막은 그 질문에만 있는 경우가 많아 1.5배로 친다
  function weight(key, idf) {
    var df = idf.idf[key] || 0;
    var w = Math.log((idf.n + 1) / (df + 1)) + 0.2;
    if (/^n:\d$/.test(key)) w *= 0.5;
    if (key.indexOf("f:") === 0 || key.indexOf("d:") === 0) w *= 1.5;
    return w;
  }

  // digits: 숫자만 든 식(d:)도 셀지. 넣은 질문에만 쓰고 다른 문항과 맞댈 때는 뺀다
  // (17×24를 다루는 두 문항처럼 숫자 식이 겹치는 문항끼리 헷갈리지 않게)
  function similarity(qf, af, idf, neutralOnly, digits) {
    var total = 0;
    sharedKeys(qf, af).forEach(function (key) {
      if (neutralOnly && key.indexOf("w:") === 0) return;
      if (!digits && key.indexOf("d:") === 0) return;
      total += weight(key, idf);
    });
    return total;
  }

  var RELEVANCE_FLOOR = 2.5;
  var RELEVANCE_MARGIN = 1.3;

  // question: P2-Bench 문항의 [한국어, 영어] 질문(앱은 60문항에 대한 답만 점검한다), decoys: 비교용 60문항([[kr, en], …])
  function relevance(question, answer, decoys) {
    var qs = (Array.isArray(question) ? question : [question]).map(function (q) { return String(q || "").trim(); }).filter(function (q) { return q.length >= 4; });
    if (!qs.length) return { status: "noquestion" };
    decoys = decoys || [];
    var idf = idfOf(decoys);
    var af = features(answer);
    var share = hangulShare(answer);
    // 답과 같은 언어인 질문이 하나도 없으면 언어와 무관한 단서만 쓴다
    var sameLang = qs.filter(function (q) { return Math.abs(hangulShare(q) - share) < 0.5; });
    var neutralOnly = sameLang.length === 0;
    var own = 0;
    qs.forEach(function (q) { own = Math.max(own, similarity(features(q), af, idf, neutralOnly, true)); });
    var best = 0, bestId = null, bestF = null;
    decoys.forEach(function (d, i) {
      if (qs.some(function (q) { return d.indexOf(q) >= 0; })) return;
      idf.feats[i].forEach(function (x) {
        var sim = similarity(x.f, af, idf, neutralOnly || Math.abs(x.share - share) >= 0.5);
        if (sim > best) { best = sim; bestId = d; bestF = x.f; }
      });
    });
    // 판정 근거: 질문의 단서 가운데 답에 나온 것과 안 나온 것(무거운 것부터)
    var qf = {};
    qs.forEach(function (q) { var f = features(q); Object.keys(f).forEach(function (k) { qf[k] = f[k]; }); });
    var usable = Object.keys(qf).filter(function (k) { return !(neutralOnly && k.indexOf("w:") === 0); });
    var hit = sharedKeys(qf, af).filter(function (k) { return usable.indexOf(k) >= 0; });
    var byWeight = function (x, y) { return weight(y, idf) - weight(x, idf); };
    var result = {
      score: Math.round(own * 10) / 10, best: Math.round(best * 10) / 10, neutralOnly: neutralOnly,
      found: labels(hit.sort(byWeight), qf),
      missing: labels(usable.filter(function (k) { return hit.indexOf(k) < 0; }).sort(byWeight), qf),
      cluesInQuestion: usable.length
    };
    if (bestF) result.otherFound = labels(sharedKeys(bestF, af).sort(byWeight), bestF);
    // 비슷한 문항끼리는 점수가 붙어 나오므로, 다른 문항이 분명히(1.3배 넘게) 더 잘 맞을 때만 '다른 질문의 답'으로 본다
    if (own >= RELEVANCE_FLOOR && best <= own * RELEVANCE_MARGIN) { result.status = "related"; return result; }
    // 언어가 달라 숫자·수식·개념만 볼 수 있을 때: 질문에 그런 단서가 2개 이상인데 답에 하나도 없으면 관련 없음으로 판정
    if (neutralOnly) {
      if (usable.length >= 2 && hit.length === 0) { result.status = "unrelated"; result.reason = "weak"; return result; }
      result.status = "unknown";
      return result;
    }
    if (own >= RELEVANCE_FLOOR) { result.status = "unrelated"; result.reason = "other"; result.other = bestId; return result; }
    result.status = "unrelated";
    result.reason = "weak";
    return result;
  }

  var api = { relevance: relevance, matchReference: matchReference, RUBRIC: RUBRIC, SIGNALS: SIGNALS, checkInput: checkInput, analyze: analyze, score: score, compare: compare };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.P2Check = api;
})(typeof window !== "undefined" ? window : this);
