/* 답 흔들림 점검기 · 글 다루기: 문장 나누기, 인용 가리기, LaTeX 풀기, 입력 거름망
 * detect.js가 쓰는 부품. index.html에서 detect/의 다른 파일과 정해진 순서로 읽는다. */
(function (P2) {
  "use strict";

  function sentences(text) {
    return text.split(/(?<=[.!?。])\s+|\n+/).map(function (s) { return s.trim(); }).filter(Boolean);
  }

  function snippet(text, idx, len) {
    var start = Math.max(0, idx - 40);
    var end = Math.min(text.length, idx + (len || 0) + 80);
    return (start > 0 ? "…" : "") + text.slice(start, end).replace(/\s+/g, " ").trim() + (end < text.length ? "…" : "");
  }

  var YES = /(^|[^a-z가-힣])(yes|예|네)([^a-z가-힣]|$)/i;

  var NO = /(^|[^a-z가-힣])(no|아니오|아니요)([^a-z가-힣]|$)/i;

  function yesNo(s) {
    var y = YES.test(s), n = NO.test(s);
    if (y && !n) return "yes";
    if (n) return "no";
    return null;
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
    // 한 줄짜리 답("정답은 72가지입니다.")도 결론·근거를 볼 수 있으므로 받는다. 너무 짧은 글자 토막만 거른다
    if (!/[0-9a-z가-힣]/i.test(t) || (t.length < 4 && !/\d/.test(t))) return { ok: false, reason: "short" };
    var nonSpace = t.replace(/\s+/g, "");
    var letters = (nonSpace.match(/[a-z가-힣ㄱ-ㅎㅏ-ㅣ]/gi) || []).length;
    // 수식이 많은 답도 글자가 4분의 1은 넘는다(논문 답 240개 중 최저 0.39)
    // 짧은 계산 답("17×24=388. Since 17×20=340 …")은 글자보다 숫자가 많아도 등식이 있으면 답으로 읽는다
    var equation = /\d\s*[=×x*+\/−-]\s*\d[\s\S]*=|\d\s*=\s*\d/.test(t) && letters >= 3;
    // 짧은 값 답("13", "5000 m", "답: 2/3")은 글자가 적어도 받는다
    if (letters / nonSpace.length < 0.25 && !equation && !(t.length <= 40 && /\d/.test(t))) return { ok: false, reason: "noletters" };
    // 한 글자 토막 연타(a s d f …). 숫자·기호·대문자 변수(P, Q, T, F)는 식·진리표에 흔하므로 세지 않는다
    var oneChar = words.filter(function (w) { return /^[a-z가-힣ㄱ-ㅎㅏ-ㅣ]$/.test(w); }).length;
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
    if (words.length < 3 && t.length > 40) return { ok: false, reason: "gibberish" };
    return { ok: true };
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

  function uniq(xs) { return xs.filter(function (v, i) { return xs.indexOf(v) === i; }); }

  function short(t) {
    t = String(t || "").replace(/\s+/g, " ").trim();
    return t.length > 50 ? t.slice(0, 50) + "…" : (t || "없음");
  }

  function hangulShare(text) {
    var h = (text.match(/[가-힣]/g) || []).length, l = (text.match(/[a-z]/gi) || []).length;
    return h + l ? h / (h + l) : 0;
  }

  P2.sentences = sentences;
  P2.snippet = snippet;
  P2.maskQuotes = maskQuotes;
  P2.checkInput = checkInput;
  P2.plainMath = plainMath;
  P2.hangulShare = hangulShare;
  P2.uniq = uniq;
  P2.short = short;
  P2.YES = YES;
  P2.NO = NO;
  P2.yesNo = yesNo;
})((typeof window !== "undefined" ? window : globalThis).P2Lib = (typeof window !== "undefined" ? window : globalThis).P2Lib || {});
