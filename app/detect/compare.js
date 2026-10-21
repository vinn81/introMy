/* 답 흔들림 점검기 · 두 답 비교(3단계): 결론 줄 → 반대말 → 핵심 개념 → 답 전체
 * detect.js가 쓰는 부품. index.html에서 detect/의 다른 파일과 정해진 순서로 읽는다. */
(function (P2) {
  "use strict";

  var hangulShare = P2.hangulShare,
    uniq = P2.uniq,
    short = P2.short,
    topics = P2.topics,
    OPPOSITE = P2.OPPOSITE,
    keyOf = P2.keyOf,
    relationsDiffer = P2.relationsDiffer,
    hasNum = P2.hasNum,
    similarNums = P2.similarNums,
    keyLabels = P2.keyLabels,
    neutralFeatures = P2.neutralFeatures,
    TAG_LABELS = P2.TAG_LABELS,
    labels = P2.labels,
    sharedKeys = P2.sharedKeys,
    finalAnswer = P2.finalAnswer,
    lead = P2.lead;

  // 방향이 반대인 낱말 짝(한·영). 앞의 것(neg)을 먼저 지워 "불가능"이 "가능"으로, "타당하지 않"이 "타당"으로 다시 잡히지 않게 한다
  var DIRECTIONS = [
    { name: "증가·감소", pos: "증가", neg: "감소",
      p: /증가|늘어|늘었|늘리|늘린|커지|커진|커졌|높아|높은|상승|올라가|올라간|\bincreas\w*|\brises?\b|\brising\b|\bgrows?\b|\bhigher\b/gi,
      n: /감소|줄어|줄었|줄이|줄인|작아지|작아진|작아졌|낮아|낮은|하락|내려가|내려간|떨어지|떨어진|\bdecreas\w*|\bfalls?\b|\bfalling\b|\bdeclin\w*|\blower\b|\breduc\w*/gi },
    { name: "왼쪽·오른쪽", pos: "왼쪽", neg: "오른쪽",
      p: /왼쪽|좌측|역반응|\b(?:shifts?|shifted|shifting|moves?|toward|to the) left\b|\bleftward/gi,
      n: /오른쪽|우측|정반응|\b(?:shifts?|shifted|shifting|moves?|toward|to the) right\b|\brightward/gi },
    { name: "크다·작다", pos: "큰", neg: "작은",
      p: /큰 |크다|커서|가장 큰|\blarg(?:e|er|est)\b|\bbigg?(?:er|est)?\b|\bgreatest\b/gi,
      n: /작은 |작다|작아서|가장 작은|\bsmall(?:er|est)?\b|\bleast\b/gi },
    { name: "직렬·병렬", pos: "직렬", neg: "병렬", p: /직렬|\bin series\b|\bseries (?:circuit|connection)/gi, n: /병렬|\bin parallel\b|\bparallel (?:circuit|connection)/gi },
    { name: "필요조건·충분조건", pos: "필요조건", neg: "충분조건", p: /필요 ?조건|necessary condition/gi, n: /충분 ?조건|sufficient condition/gi },
    { name: "최대·최소", pos: "최대", neg: "최소", p: /최대|최댓값|\bmaxim\w*/gi, n: /최소|최솟값|\bminim\w*/gi },
    { name: "흡열·발열", pos: "흡열", neg: "발열", p: /흡열|endotherm\w*/gi, n: /발열|exotherm\w*/gi },
    { name: "타당·부당", pos: "타당", neg: "부당", n: /타당하지 않|타당하지 못|부당|\binvalid\b|\bnot valid\b/gi, p: /타당|\bvalid\b/gi, negFirst: true },
    { name: "참·거짓", pos: "참", neg: "거짓", n: /거짓|\bfalse\b|참이 아니/gi, p: /참(?:이다|입니다|이며|이고|이므로|이라|인)|\btrue\b/gi, negFirst: true }
  ];

  function directionCounts(text) {
    var t = String(text || ""), out = {};
    DIRECTIONS.forEach(function (d) {
      var rest = t, pc, nc;
      if (d.negFirst) { nc = (rest.match(d.n) || []).length; rest = rest.replace(d.n, " "); pc = (rest.match(d.p) || []).length; }
      else { pc = (rest.match(d.p) || []).length; nc = (rest.match(d.n) || []).length; }
      out[d.name] = { pos: pc, neg: nc, d: d };
    });
    return out;
  }

  // 언어가 다른 두 답: 낱말을 한 줄씩 맞댈 수 없으므로, 방향 낱말 수를 센다.
  // 양쪽 모두 그 짝의 낱말이 2번 이상 나오고 한쪽으로 절반 넘게 기울었는데 그 쪽이 서로 반대일 때만 반대 내용으로 본다
  // (논문 한·영 답 120쌍에서 잘못 걸리는 짝이 0이 되는 선. 참·거짓은 진리표 때문에 언어마다 횟수가 달라 최종 답 비교에만 쓴다)
  function directionConflicts(textA, textB) {
    var ca = directionCounts(textA), cb = directionCounts(textB), out = [];
    Object.keys(ca).forEach(function (k) {
      var x = ca[k], y = cb[k], na = x.pos - x.neg, nb = y.pos - y.neg, ta = x.pos + x.neg, tb = y.pos + y.neg;
      if (k === "참·거짓") return;
      if (na * nb < 0 && ta >= 2 && tb >= 2 && Math.abs(na) / ta >= 0.5 && Math.abs(nb) / tb >= 0.5) {
        var lean = function (c, n) { return (n > 0 ? c.d.pos : c.d.neg) + " " + Math.max(c.pos, c.neg) + "번 · " + (n > 0 ? c.d.neg : c.d.pos) + " " + Math.min(c.pos, c.neg) + "번"; };
        out.push(k + ": 1단계 답은 ‘" + (na > 0 ? x.d.pos : x.d.neg) + "’ 쪽(" + lean(x, na) + "), 다른 언어 답은 ‘" + (nb > 0 ? y.d.pos : y.d.neg) + "’ 쪽(" + lean(y, nb) + ")");
      }
    });
    return out;
  }

  // 같은 언어로 된 두 답은 낱말을 한 줄씩 맞댈 수 있다. 같은 자리의 낱말이 아래 반대말 짝으로 바뀌었는지 본다.
  // 바뀐 낱말에서 반대말 부분을 뺀 나머지가 같아야 한다("증가한다" ↔ "감소한다", "가능하다" ↔ "불가능하다")
  var ANTONYMS = [
    ["증가", "감소"], ["늘", "줄"], ["높", "낮"], ["높은", "낮은"], ["큰", "작은"], ["커", "작아"], ["크", "작"], ["많은", "적은"], ["많", "적"],
    ["왼쪽", "오른쪽"], ["좌측", "우측"], ["정반응", "역반응"], ["직렬", "병렬"], ["필요", "충분"], ["최대", "최소"], ["최댓값", "최솟값"],
    ["흡열", "발열"], ["산성", "염기성"], ["상승", "하락"], ["참", "거짓"], ["타당", "부당"], ["있는", "없는"], ["있", "없"], ["가능", "불가능"],
    ["맞는", "틀린"], ["맞", "틀"], ["옳", "그르"], ["같은", "다른"], ["같", "다르"], ["양수", "음수"], ["양성", "음성"], ["이전", "이후"],
    ["앞", "뒤"], ["위", "아래"], ["강", "약"], ["빠르", "느리"], ["빨라", "느려"], ["길", "짧"], ["무겁", "가볍"], ["항상", "결코"],
    ["increas", "decreas"], ["more", "less"], ["higher", "lower"], ["high", "low"], ["larger", "smaller"], ["largest", "smallest"], ["large", "small"],
    ["greater", "less"], ["left", "right"], ["true", "false"], ["valid", "invalid"], ["possible", "impossible"], ["necessary", "sufficient"],
    ["maximum", "minimum"], ["max", "min"], ["positive", "negative"], ["before", "after"], ["above", "below"], ["strong", "weak"],
    ["faster", "slower"], ["same", "different"], ["correct", "incorrect"], ["supported", "unsupported"], ["consistent", "inconsistent"],
    ["can", "cannot"], ["is", "isn't"], ["does", "doesn't"], ["always", "never"], ["rises", "falls"], ["rise", "fall"]
  ];

  function sameLanguage(x, y) {
    var hx = hangulShare(x), hy = hangulShare(y);
    return (hx >= 0.5 && hy >= 0.5) || (hx < 0.2 && hy < 0.2);
  }

  // 두 배열에서 같은 원소의 짝(가장 긴 공통 부분열). 너무 크면 맞대지 않는다
  function lcsPairs(xs, ys) {
    var n = xs.length, m = ys.length;
    if (!n || !m || n * m > 4000000) return [];
    var dp = [];
    for (var i = 0; i <= n; i++) dp.push(new Uint16Array(m + 1));
    for (i = n - 1; i >= 0; i--) for (var j = m - 1; j >= 0; j--) dp[i][j] = xs[i] === ys[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    var out = [];
    i = 0; j = 0;
    while (i < n && j < m) {
      if (xs[i] === ys[j]) { out.push([i, j]); i++; j++; } else if (dp[i + 1][j] >= dp[i][j + 1]) i++; else j++;
    }
    return out;
  }

  // 맞춰진 두 열 사이에서 바뀐 구간(같은 길이로 바뀐 것만)을 원소 짝으로 돌려준다
  function replacedPairs(xs, ys) {
    var pairs = lcsPairs(xs, ys).concat([[xs.length, ys.length]]), out = [], pi = 0, pj = 0;
    pairs.forEach(function (p) {
      if (p[0] - pi === p[1] - pj) for (var k = 0; k < p[0] - pi; k++) out.push([xs[pi + k], ys[pj + k]]);
      pi = p[0] + 1; pj = p[1] + 1;
    });
    return out;
  }

  function wordKey(w) { return w.toLowerCase().replace(/[*_`.,;:!?()[\]{}"'“”‘’]/g, ""); }

  function antonymSwap(wa, wb) {
    for (var i = 0; i < ANTONYMS.length; i++) {
      var x = ANTONYMS[i][0], y = ANTONYMS[i][1];
      if (wa.indexOf(x) >= 0 && wb.indexOf(y) >= 0 && wa.replace(x, "") === wb.replace(y, "")) return true;
      if (wa.indexOf(y) >= 0 && wb.indexOf(x) >= 0 && wa.replace(y, "") === wb.replace(x, "")) return true;
    }
    return false;
  }

  // 두 글의 낱말이 얼마나 같은 순서로 겹치는가(0~1). 따로 쓴 같은 언어 답은 논문 답에서 최대 0.61이었다
  function tokenOverlap(textA, textB) {
    var x = String(textA).split(/\s+/).filter(Boolean), y = String(textB).split(/\s+/).filter(Boolean);
    var n = x.length, m = y.length;
    if (!n || !m || n * m > 4000000) return 0;
    var prev = new Uint16Array(m + 1), cur = new Uint16Array(m + 1), t;
    for (var i = n - 1; i >= 0; i--) {
      for (var j = m - 1; j >= 0; j--) cur[j] = x[i] === y[j] ? prev[j + 1] + 1 : Math.max(prev[j], cur[j + 1]);
      t = prev; prev = cur; cur = t;
    }
    return prev[0] / Math.max(n, m);
  }

  function swappedWords(textA, textB) {
    var la = String(textA).split(/\n/).map(function (l) { return l.trim(); }), lb = String(textB).split(/\n/).map(function (l) { return l.trim(); });
    var found = [];
    replacedPairs(la, lb).forEach(function (lp) {
      var wa = lp[0].split(/\s+/).map(wordKey), wb = lp[1].split(/\s+/).map(wordKey);
      replacedPairs(wa, wb).forEach(function (w) { if (w[0] && w[1] && antonymSwap(w[0], w[1])) found.push("‘" + w[0] + "’ ↔ ‘" + w[1] + "’"); });
    });
    if (!found.length) return [];
    return ["같은 자리의 낱말이 반대말로 바뀜(" + found.length + "곳): " + uniq(found).slice(0, 4).join(", ") + (found.length > 4 ? " 등" : "")];
  }

  // a, b: { finalAnswer, lead, topics, text, signals }
  // 돌려주는 값: sameAnswer(true | false | "partial" | null), mode, why(판정 근거 문장들)
  // 결론 문장을 찾지 못한(답이 중간에 끊긴 듯한) 쪽이 있으면 '다른 답'으로 단정하지 않는다.
  // a·b의 finalReliable이 false일 때만 해당하고, 같은 답이라는 판정은 그대로 둔다
  function compare(a, b) {
    var r = compareCore(a, b);
    var cutA = a.finalReliable === false, cutB = b.finalReliable === false;
    // 같은 자리·방향 낱말이 반대로 바뀐 것은 최종 답과 상관없이 본문에서 찾은 것이라 보류하지 않는다
    var byDirection = r.sameAnswer === false && r.direction && r.direction.length > 0;
    if (!(r.sameAnswer === true || !(cutA || cutB) || byDirection)) {
      var who = cutA && cutB ? "두 답 모두" : cutA ? "1단계 답" : "다른 언어 답";
      r = { sameAnswer: null, mode: "cut", cutA: cutA, cutB: cutB, aSignals: r.aSignals, bSignals: r.bSignals, direction: [],
        why: [who + "에서 결론 문장을 찾지 못했습니다. 끝이 문장 중간이거나, 여러 줄 풀이의 마지막 줄만 있고 ‘답:’·‘따라서’ 같은 결론 표시가 없습니다.",
          "이 상태로 맞대면 풀이 중간의 값(예: k = 0일 때의 x = 2)을 최종 답으로 읽게 되므로 같다·다르다를 정하지 않았습니다."] };
    }
    r.confidence = compareConfidence(r);
    return r;
  }

  // 판정의 근거가 얼마나 단단한가: "high"(최종 답의 값·식·판정어, 같은 자리의 반대말),
  // "medium"(핵심 개념·답 전체 단서, 언어가 다른 답의 방향 낱말 수), "low"(판정하지 않음)
  function compareConfidence(r) {
    if (r.sameAnswer === null) return "low";
    if (r.mode === "topics" || r.mode === "whole" || r.sameAnswer === "partial") return "medium";
    if (r.sameAnswer === false) {
      var crossOnly = r.direction && r.direction.length && r.why.every(function (w) { return /^방향이 반대/.test(w); });
      return crossOnly ? "medium" : "high";
    }
    return "high";
  }

  function compareCore(a, b) {
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
    // 최종 답이 같아 보여도 풀이에서 방향 낱말이 반대로 바뀌었으면 다른 내용이다
    // (같은 언어면 낱말을 한 줄씩 맞대고, 언어가 다르면 방향 낱말이 뚜렷이 반대로 기울 때만)
    // 같은 언어이고 낱말이 80% 넘게 겹치면(한 답을 복사해 고친 답) 한 줄씩 맞대고, 아니면 방향 낱말 수를 센다
    var copied = a.text && b.text && sameLanguage(a.text, b.text) && tokenOverlap(a.text, b.text) >= 0.8;
    var direction = !a.text || !b.text ? [] : copied ? swappedWords(a.text, b.text) : directionConflicts(a.text, b.text).map(function (d) { return "방향이 반대 — " + d; });
    direction.forEach(function (d) { conflicts.push(d); });
    // 값을 여러 개 묻는 문항에서 두 답이 서로 다른 값 하나씩을 최종 답으로 내세운 경우(남는 H₂ 1 mol ↔ 생긴 H₂O 4 mol):
    // 각 최종 답의 숫자가 모두 상대 답 본문에 있으면 갈린 것이 아니라 고른 값이 다른 것이다
    var bodyA = a.text ? keyOf(a.text) : null, bodyB = b.text ? keyOf(b.text) : null;
    var inBody = function (nums, body) { var all = body.nums.concat(body.alt); return uniq(nums).every(function (n) { return hasNum(all, n); }); };
    var picked = bodyA && bodyB && inBody(fa.nums, bodyB) && inBody(fb.nums, bodyA);
    if (fa.nums.length && fb.nums.length && !similarNums(finA, finB) && !shared && !picked) {
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
    var result = { sameAnswer: same, mode: "answer", aSignals: a.signals.length, bSignals: b.signals.length, why: why, direction: direction };

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

  P2.DIRECTIONS = DIRECTIONS;
  P2.directionCounts = directionCounts;
  P2.directionConflicts = directionConflicts;
  P2.ANTONYMS = ANTONYMS;
  P2.sameLanguage = sameLanguage;
  P2.lcsPairs = lcsPairs;
  P2.replacedPairs = replacedPairs;
  P2.wordKey = wordKey;
  P2.antonymSwap = antonymSwap;
  P2.tokenOverlap = tokenOverlap;
  P2.swappedWords = swappedWords;
  P2.compare = compare;
  P2.compareCore = compareCore;
})((typeof window !== "undefined" ? window : globalThis).P2Lib = (typeof window !== "undefined" ? window : globalThis).P2Lib || {});
