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
    return plainMath(String(text || "").replace(/\\equiv(?![a-z])/gi, "≡").replace(/\\pmod\s*\{?\s*(\d+)\s*\}?/g, " (mod $1)").replace(/\\%/g, "%"))
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
  var RESTATED = /(^|[\s(])(let |전제|premise|결론\s*[:：]|conclusion\s*[:：]|주장|claim|ai(의|'s| )|잘못된|flawed|wrong|❌|✗)/i;

  // 틀린 근거는 부정·오류 표시 없이 단정한 문장에서만 센다("90%는 민감도일 뿐 답이 아니다"는 틀린 근거가 아니다)
  function findClaim(text, p) {
    var lines = maskQuotes(text).split(/\n+/);
    for (var j = 0; j < lines.length; j++) {
      if (RESTATED.test(lines[j])) continue;
      var parts = sentences(lines[j]);
      for (var i = 0; i < parts.length; i++) {
        var sent = parts[i].trim(), m = new RegExp(p, "i").exec(sent);
        if (m && !REPORTING.test(sent)) return m[0].trim();
      }
    }
    return null;
  }

  // rubric: { must: [{ label, any: [표현…] }], wrong: [{ label, any: [정규식…] }] } (data.js P2_RUBRIC)
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
        var ev = findClaim(t, w.any[i]);
        if (ev) { wrong.push({ label: w.label, evidence: ev }); break; }
      }
    });
    var hit = must.filter(function (m) { return m.hit; }).length;
    return { must: must, wrong: wrong, hit: hit, total: must.length };
  }

  P2.rubricText = rubricText;
  P2.checkRubric = checkRubric;
})((typeof window !== "undefined" ? window : globalThis).P2Lib = (typeof window !== "undefined" ? window : globalThis).P2Lib || {});
