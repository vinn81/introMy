/* 답 흔들림 점검기 · 기준 정답 대조(2단계): 값·식·판정어·명제 규칙
 * detect.js가 쓰는 부품. index.html에서 detect/의 다른 파일과 정해진 순서로 읽는다. */
(function (P2) {
  "use strict";

  var sentences = P2.sentences,
    maskQuotes = P2.maskQuotes,
    uniq = P2.uniq,
    topics = P2.topics,
    keyOf = P2.keyOf,
    hasNum = P2.hasNum,
    TAG_LABELS = P2.TAG_LABELS,
    finalAnswer = P2.finalAnswer,
    lead = P2.lead,
    compare = P2.compare;

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

  // claim.match: 기준 정답의 명제를 그대로 말하는 표현("정사각형이 아니다", "A 또는 C"). 최종 답이나 첫 문장에 있으면 맞은 답이다.
  // 따옴표 속 문장("올바른 결론은 ‘…아니다’입니다")도 답을 밝힌 것이므로 가리지 않는다
  function claimMatch(an, claim) {
    if (!claim || !claim.match) return "";
    var m = new RegExp(claim.match, "i").exec(String(an.finalAnswer || "") + "\n" + String(an.lead || ""));
    return m ? "기준 정답의 명제 ‘" + claim.right + "’를 최종 답에서 확인(‘" + m[0].trim() + "’)" : "";
  }

  // 답의 최종 답이 P2-Bench 기준 정답과 같은지 본다.
  // 돌려주는 값: status("match" | "mismatch" | "unknown"), strong(숫자·식·특정 개념으로 맞았는지), why
  // 결론 문장을 찾지 못한 답은 기준 정답과 '다르다'고 단정하지 않는다(복사하다 만 답을 틀린 답으로 보지 않게)
  // confidence: "high"(값·식·판정어·명제 규칙으로 갈림이나 일치가 분명), "medium"(간접 근거), "low"(맞대지 못함)
  function matchReference(an, reference, claim) {
    var r = matchReferenceCore(an, reference, claim);
    if (r.status === "mismatch" && an && an.finalReliable === false) {
      r = { status: "unknown", cut: true, why: ["결론 문장을 찾지 못해 기준 정답과 맞대지 않았습니다(답이 중간에 끊겼을 수 있음)"] };
    }
    if (r.status === "unknown") r.confidence = "low";
    else if (r.status === "match") r.confidence = r.strong ? "high" : "medium";
    // '결정 불가'인데 값을 단정함, 답 전체에 정답 값이 없음 → 간접 근거
    else r.confidence = r.why.some(function (w) { return /그런 말 없이|답 어디에도/.test(w); }) ? "medium" : "high";
    return r;
  }

  function matchReferenceCore(an, reference, claim) {
    if (!an || !reference) return { status: "unknown", why: [] };
    var claimed = claimCheck(an, claim);
    if (claimed) return { status: "mismatch", why: [claimed] };
    var said = claimMatch(an, claim);
    if (said) return { status: "match", strong: false, why: [said] };
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
      // 최종 답은 '틀림·오류'만 말해도, 답이 기준 정답과 같은 '결정할 수 없음' 등을 말하고 값을 단정하지 않았으면 맞은 답이다
      var same = refNo.filter(function (t) { return whole.tags[t]; });
      if (same.length && !claimed) return { status: "match", strong: false, why: ["기준 정답과 같이 ‘" + same.map(function (t) { return TAG_LABELS[t]; }).join("·") + "’이라고 말하고, 값을 단정하지 않음"] };
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

  // 두 답 비교(compare)가 맞댈 단서를 못 찾아 보류했어도, 두 답이 각각 기준 정답과 맞으면 같은 답이다
  // (결론이 LaTeX 수식 줄로 끝난 답, "A 또는 C"처럼 숫자·판정어가 없는 결론). 갈렸다는 판정은 바꾸지 않는다
  function comparePair(a, b, reference, claim) {
    var c = compare(a, b);
    if (c.sameAnswer !== null || !reference) return c;
    var ra = matchReferenceCore(a, reference, claim), rb = matchReferenceCore(b, reference, claim);
    if (ra.status !== "match" || rb.status !== "match") return c;
    return { sameAnswer: true, mode: "reference", aSignals: c.aSignals, bSignals: c.bSignals, direction: [], confidence: "medium",
      why: ["두 답에서 직접 맞댈 단서는 부족했지만, 두 답 모두 기준 정답과 같습니다", "1단계 답: " + (ra.why[0] || "기준 정답과 같음"), "다른 언어 답: " + (rb.why[0] || "기준 정답과 같음")] };
  }

  P2.REPORTING = REPORTING;
  P2.comparePair = comparePair;
  P2.claimCheck = claimCheck;
  P2.claimMatch = claimMatch;
  P2.matchReference = matchReference;
  P2.matchReferenceCore = matchReferenceCore;
})((typeof window !== "undefined" ? window : globalThis).P2Lib = (typeof window !== "undefined" ? window : globalThis).P2Lib || {});
