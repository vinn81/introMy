/* 답 흔들림 점검기 · 관련성: 답이 고른 문항에 대한 것인지(희귀도 가중 단서 점수)
 * detect.js가 쓰는 부품. index.html에서 detect/의 다른 파일과 정해진 순서로 읽는다. */
(function (P2) {
  "use strict";

  var hangulShare = P2.hangulShare,
    labels = P2.labels,
    features = P2.features,
    sharedKeys = P2.sharedKeys,
    crossFeatures = P2.crossFeatures,
    score = P2.score;

  var idfCache = { src: null, idf: null, n: 0 };

  // 희귀도: 비교용 질문 묶음(P2-Bench 60문항) 가운데 그 단서가 나오는 문항이 적을수록 무겁다
  function idfOf(decoys) {
    if (idfCache.src === decoys) return idfCache;
    var df = {};
    var feats = decoys.map(function (d) {
      // 사전 용어(x:)·약어(a:)의 희귀도도 함께 센다. 기존 단서의 희귀도는 그대로다
      var f = crossFeatures(d.join("\n"));
      Object.keys(f).forEach(function (key) { df[key] = (df[key] || 0) + 1; });
      return d.map(function (dq) { return { f: features(dq), fx: crossFeatures(dq), share: hangulShare(dq) }; });
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

  // 질문과 답의 언어가 다를 때: 사전으로 옮긴 단서는 거칠어 다른 문항과 점수가 붙기 쉬우므로 1.5배까지 허용한다
  // (직접 입력한 질문 12개 × 다른 언어 답: 1.3배면 맞는 답 일부를 놓치고, 1.7배면 잘못 통과가 늘었다)
  var RELEVANCE_MARGIN_CROSS = 1.5;

  // 답이 한국어나 영어인가(그 밖의 언어는 사전이 없어 예전처럼 숫자·수식·개념만 본다)
  function koOrEn(text) {
    var t = String(text), letters = (t.match(/[가-힣a-z]/gi) || []).length, other = (t.match(/[\u3040-\u30ff\u4e00-\u9fff\u0400-\u04ff\u0600-\u06ff]/g) || []).length;
    return letters > 0 && other < letters * 0.2;
  }

  // question: P2-Bench 문항의 [한국어, 영어] 질문(앱은 60문항에 대한 답만 점검한다), decoys: 비교용 60문항([[kr, en], …])
  // question: [한국어, 영어] 질문(P2-Bench 문항) 또는 직접 입력한 질문 하나, decoys: 비교용 60문항([[kr, en], …])
  function relevance(question, answer, decoys) {
    var qs = (Array.isArray(question) ? question : [question]).map(function (q) { return String(q || "").trim(); }).filter(function (q) { return q.length >= 4; });
    if (!qs.length) return { status: "noquestion" };
    decoys = decoys || [];
    var idf = idfOf(decoys);
    var share = hangulShare(answer);
    // 답과 같은 언어인 질문이 하나도 없으면 낱말(w:)은 빼고 언어와 무관한 단서만 쓴다
    var sameLang = qs.filter(function (q) { return Math.abs(hangulShare(q) - share) < 0.5; });
    var neutralOnly = sameLang.length === 0;
    // 한국어 질문 + 영어 답(또는 반대): 한·영 용어 사전과 약어로 낱말 대신 맞댄다
    var cross = neutralOnly && koOrEn(answer);
    var feat = cross ? crossFeatures : features;
    var af = feat(answer);
    var qShare = hangulShare(qs[0]);
    // P2-Bench 문항을 골랐는지(질문이 60문항 가운데 하나와 글자까지 같은지)
    var isItem = decoys.some(function (d) { return qs.some(function (q) { return d.indexOf(q) >= 0; }); });
    var own = 0;
    qs.forEach(function (q) { own = Math.max(own, similarity(feat(q), af, idf, neutralOnly, true)); });
    // 직접 입력한 질문과 사실상 같은 문항(질문끼리 단서가 절반 넘게 겹침)은 '다른 질문'으로 맞대지 않는다
    var qFeats = qs.map(function (q) { return { f: features(q), share: hangulShare(q) }; });
    var selfSim = qFeats.map(function (x) { return similarity(x.f, x.f, idf, false); });
    function sameQuestion(i) {
      return idf.feats[i].some(function (x) {
        return qFeats.some(function (q, j) {
          return Math.abs(q.share - x.share) < 0.5 && selfSim[j] > 0 && similarity(q.f, x.f, idf, false) >= selfSim[j] * 0.5;
        });
      });
    }
    var best = 0, bestId = null, bestF = null;
    decoys.forEach(function (d, i) {
      if (qs.some(function (q) { return d.indexOf(q) >= 0; })) return;
      if (!isItem && sameQuestion(i)) return;
      idf.feats[i].forEach(function (x) {
        // 언어가 다른 질문·답이면, 다른 문항도 질문과 같은 언어 판을 같은 사전 단서로 맞대야 공평하다
        if (cross && Math.abs(x.share - qShare) >= 0.5) return;
        var sim = similarity(cross ? x.fx : x.f, af, idf, neutralOnly || Math.abs(x.share - share) >= 0.5);
        if (sim > best) { best = sim; bestId = d; bestF = cross ? x.fx : x.f; }
      });
    });
    // 판정 근거: 질문의 단서 가운데 답에 나온 것과 안 나온 것(무거운 것부터)
    var qf = {};
    qs.forEach(function (q) { var f = feat(q); Object.keys(f).forEach(function (k) { qf[k] = f[k]; }); });
    var usable = Object.keys(qf).filter(function (k) { return !(neutralOnly && k.indexOf("w:") === 0); });
    var hit = sharedKeys(qf, af).filter(function (k) { return usable.indexOf(k) >= 0; });
    var byWeight = function (x, y) { return weight(y, idf) - weight(x, idf); };
    var margin = cross ? RELEVANCE_MARGIN_CROSS : RELEVANCE_MARGIN;
    var result = {
      score: Math.round(own * 10) / 10, best: Math.round(best * 10) / 10, neutralOnly: neutralOnly, cross: cross, margin: margin,
      found: labels(hit.sort(byWeight), qf),
      missing: labels(usable.filter(function (k) { return hit.indexOf(k) < 0; }).sort(byWeight), qf),
      cluesInQuestion: usable.length
    };
    if (bestF) result.otherFound = labels(sharedKeys(bestF, af).sort(byWeight), bestF);
    // 비슷한 문항끼리는 점수가 붙어 나오므로, 다른 문항이 분명히(1.3배, 언어가 다르면 1.5배 넘게) 더 잘 맞을 때만 '다른 질문의 답'으로 본다
    if (own >= RELEVANCE_FLOOR && best <= own * margin) { result.status = "related"; return result; }
    if (cross) {
      // 사전 용어·숫자·수식·개념 단서가 질문에 2개도 없으면 근거가 부족해 보류한다. 그 밖에는 언어가 같을 때처럼 판정
      if (usable.length < 2) { result.status = "unknown"; return result; }
    } else if (neutralOnly) {
      // 한국어·영어가 아닌 답: 숫자·수식·개념만 볼 수 있다. 질문에 그런 단서가 2개 이상인데 답에 하나도 없으면 관련 없음
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
  P2.RELEVANCE_MARGIN_CROSS = RELEVANCE_MARGIN_CROSS;
  P2.relevance = relevance;
})((typeof window !== "undefined" ? window : globalThis).P2Lib = (typeof window !== "undefined" ? window : globalThis).P2Lib || {});
