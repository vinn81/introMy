/* 답 흔들림 점검기 · 관련성: 답이 고른 문항에 대한 것인지(희귀도 가중 단서 점수)
 * detect.js가 쓰는 부품. index.html에서 detect/의 다른 파일과 정해진 순서로 읽는다. */
(function (P2) {
  "use strict";

  var hangulShare = P2.hangulShare,
    labels = P2.labels,
    features = P2.features,
    sharedKeys = P2.sharedKeys,
    score = P2.score;

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

  P2.idfCache = idfCache;
  P2.idfOf = idfOf;
  P2.weight = weight;
  P2.similarity = similarity;
  P2.RELEVANCE_FLOOR = RELEVANCE_FLOOR;
  P2.RELEVANCE_MARGIN = RELEVANCE_MARGIN;
  P2.relevance = relevance;
})((typeof window !== "undefined" ? window : globalThis).P2Lib = (typeof window !== "undefined" ? window : globalThis).P2Lib || {});
