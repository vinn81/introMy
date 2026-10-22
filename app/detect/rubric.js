/* 답 흔들림 점검기 · 근거 기준 대조: 문항마다 정한 필수 근거를 답이 짚었는지, 틀린 근거를 단정했는지
 * detect.js가 쓰는 부품. index.html에서 detect/의 다른 파일과 정해진 순서로 읽는다. */
(function (P2) {
  "use strict";

  var plainMath = P2.plainMath,
    sentences = P2.sentences,
    maskQuotes = P2.maskQuotes,
    REPORTING = P2.REPORTING;

  // 수식·굵은 글씨·아래 첨자를 걷어내 표현을 찾기 쉽게 한다("$\text{H}_2$" → "H2", "O₂" → "O2")
  function rubricText(text) {
    // 분자·분모에 중괄호가 한 겹 더 있는 분수(\frac{5\cdot 3^{n-1}-1}{2})도 a/b 꼴로 편다
    var t = String(text || "");
    t = t.replace(/\\[dt]?frac\s*(\d)\s*(\d)/g, "$1/$2");  // \tfrac12 → 1/2
    for (var k = 0; k < 2; k++) t = t.replace(/\\[dt]?frac\s*\{((?:[^{}]|\{[^{}]*\})*)\}\s*\{((?:[^{}]|\{[^{}]*\})*)\}/g, "($1)/($2)");
    return plainMath(t.replace(/\\equiv(?![a-z])/gi, "≡").replace(/\\pmod\s*\{?\s*(\d+)\s*\}?/g, " (mod $1)").replace(/\\%/g, "%"))
      .replace(/\*+|__|`/g, "").replace(/[₂]|_\{?2\}?/g, "2").replace(/[₃]|_\{?3\}?/g, "3")
      .replace(/\\[a-z]+\s*|\\[()]/gi, " ").replace(/[ \t]+/g, " ");
  }

  // 표현 하나: 문자열이면 그 정규식, 배열이면 그 안의 정규식이 모두 답에 있어야 한다
  function findPattern(text, p) {
    var parts = Array.isArray(p) ? p : [p], found = [];
    for (var i = 0; i < parts.length; i++) {
      var m = new RegExp(parts[i], "i").exec(text);
      if (!m) return null;
      found.push(m[0].trim());
    }
    return found.join(" … ");
  }

  // 문제 속 주장을 다시 적은 줄("결론: 따라서 정사각형이다. ❌ 오류", "Let P = The shape is a square")은 답의 주장이 아니다
  // (낱말 하나가 아니라 "전제 1:", "Conclusion:" 같은 이름표로 본다. "전제와 추론 모두 문제가 없다"는 답의 주장이다)
  var RESTATED = /(^|[\s(*])(let |(전제|premise|결론|conclusion|주장|claim)\s*\d*\s*\**\s*[:：]|잘못된 (결론|추론)|flawed|❌|✗)/i;
  // raw 표현(부정어가 들어 있어야 하는 틀린 주장, 예: "전제와 추론 모두 문제가 없다")에만 쓰는 좁은 부정·오류 표시
  var NEGATED = /(\bnot\b|n't|wrong|incorrect|false|invalid|fallac|틀|잘못|오류|아니|않|거짓|부당)/i;

  // 주장을 단정하지 않고 전하거나 따지는 문장(“…를 입증하기에 불충분하다”, “…로 환원할 수도 있다”)
  var HEDGED = /(insufficient|to establish|establish that|whether|하는지|인지(도)? |claims? that|concludes? that|(as|is) evidence that|treats?|(으로|로) 여기|간주|reduc(e|ible|ed) to|equivalent to|불충분|입증하기|라는 (주장|결론)|라고 (주장|결론|단정)|환원|동치)/i;

  // 틀린 근거는 부정·오류 표시 없이 단정한 문장에서만 센다("90%는 민감도일 뿐 답이 아니다"는 틀린 근거가 아니다)
  function findClaim(text, p, raw) {
    var lines = maskQuotes(text).split(/\n+/);
    for (var j = 0; j < lines.length; j++) {
      if (RESTATED.test(lines[j])) continue;
      var parts = sentences(lines[j]);
      for (var i = 0; i < parts.length; i++) {
        var sent = parts[i].trim(), m = new RegExp(p, "i").exec(sent);
        var neg = raw === "anchored" ? null : raw ? NEGATED : REPORTING;
        if (m && !(neg && neg.test(sent)) && !HEDGED.test(sent)) return m[0].trim();
      }
    }
    return null;
  }

  // rubric: { must: [{ label, any: [표현…] }], wrong: [{ label, any: [정규식…], raw? }] } (data.js P2_RUBRIC)
  // raw: 주장 자체에 '없다·no' 같은 말이 들어가는 틀린 근거. 넓은 부정어 목록 대신 NEGATED로만 거른다
  // raw: "anchored": 주장 자체가 부정형("타당하지 않다", "Q는 정해지지 않는다")이라 부정어로 거를 수 없는 틀린 판정.
  //   표현을 문장 전체(^…$)에 맞춰 짧은 단정문만 잡는다
  // 돌려주는 값: must(근거마다 hit·evidence), wrong(단정한 틀린 근거), hit·total
  function checkRubric(text, rubric) {
    if (!rubric) return null;
    var t = rubricText(text);
    var must = (rubric.must || []).map(function (pt) {
      var ev = null;
      for (var i = 0; i < pt.any.length && !ev; i++) ev = findPattern(t, pt.any[i]);
      return { label: pt.label, hit: !!ev, evidence: ev || "" };
    });
    var wrong = [];
    (rubric.wrong || []).forEach(function (w) {
      for (var i = 0; i < w.any.length; i++) {
        var ev = findClaim(t, w.any[i], w.raw);
        if (ev) { wrong.push({ label: w.label, evidence: ev }); break; }
      }
    });
    var hit = must.filter(function (m) { return m.hit; }).length;
    return { must: must, wrong: wrong, hit: hit, total: must.length };
  }

  P2.rubricText = rubricText;
  P2.checkRubric = checkRubric;
})((typeof window !== "undefined" ? window : globalThis).P2Lib = (typeof window !== "undefined" ? window : globalThis).P2Lib || {});
