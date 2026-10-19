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
      var lastBold = original.match(/\*\*[^*]{1,120}\*\*/g);
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
    return { empty: false, signals: found, finalAnswer: fa || finalAnswer(clean) };
  }

  // '최종 답/답' 표시 줄 → '결론/평가' 표시 줄 → 숫자가 든 굵은 글씨 순서로 찾는다
  var ANSWER_LABEL = /^[\s>*#-]*\**\s*(final answers?|answer|최종 답|최종 답변|답)\s*\**\s*[:：]\s*\**\s*/i;
  var CONCLUSION_LABEL = /^[\s>*#-]*\**\s*(verdict|conclusion|최종 평가|최종 결론|결론)\s*\**\s*[:：]\s*\**\s*/i;

  function labeled(lines, re) {
    for (var i = lines.length - 1; i >= 0; i--) {
      var m = re.exec(lines[i]);
      if (!m) continue;
      var rest = lines[i].slice(m[0].length).replace(/\*/g, "").trim();
      if (rest.length > 1) return rest.slice(0, 160);
    }
    return "";
  }

  function afterFlip(text) {
    var bolds = (text.match(/\*\*([^*]{2,160})\*\*/g) || []).map(function (b) { return b.replace(/\*/g, "").trim(); })
      .filter(function (b) { return !/[:：]$/.test(b); });
    return bolds.join(" · ").slice(0, 160);
  }

  function finalAnswer(text) {
    var lines = text.split(/\n+/);
    var a = labeled(lines, ANSWER_LABEL) || labeled(lines, CONCLUSION_LABEL);
    if (a) return a;
    var bolds = (text.match(/\*\*([^*]{2,160})\*\*/g) || []).map(function (b) { return b.replace(/\*/g, "").trim(); });
    for (var i = 0; i < bolds.length; i++) if (/\d/.test(bolds[i]) && !/[:：]$/.test(bolds[i])) return bolds[i];
    return lines[0] ? lines[0].replace(/[*#]/g, "").trim().slice(0, 160) : "";
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

  // 핵심 수치(답의 숫자·예/아니오)만 뽑아 두 언어 답을 비교
  function keyOf(answer) {
    var a = (answer || "").toLowerCase();
    var nums = (a.match(/-?\d+(?:\.\d+)?/g) || []).join(",");
    return { nums: nums, yn: yesNo(a) };
  }

  // 숫자가 하나라도 겹치거나 예/아니오가 같으면 같은 답으로 본다
  function compare(a, b) {
    var ka = keyOf(a.finalAnswer), kb = keyOf(b.finalAnswer);
    var sameNums = null;
    if (ka.nums && kb.nums) {
      var setB = kb.nums.split(",");
      sameNums = ka.nums.split(",").some(function (n) { return setB.indexOf(n) >= 0; });
    }
    var sameYn = ka.yn && kb.yn ? ka.yn === kb.yn : null;
    var same = sameNums === false || sameYn === false ? false : (sameNums || sameYn ? true : null);
    return { sameAnswer: same, aSignals: a.signals.length, bSignals: b.signals.length };
  }

  var api = { RUBRIC: RUBRIC, SIGNALS: SIGNALS, analyze: analyze, score: score, compare: compare };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.P2Check = api;
})(typeof window !== "undefined" ? window : this);
