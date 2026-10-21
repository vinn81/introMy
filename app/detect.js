/* P2-Bench 답 점검기 — 신호 탐지와 루브릭 계산
 * 논문(P2-Bench, 2026-10-06) 7장 오류 분석의 네 유형을 규칙으로 옮겼다.
 * 브라우저(window.P2Check)와 Node(module.exports) 양쪽에서 쓴다.
 *
 * 규칙은 기능별로 app/detect/에 나뉘어 있다(읽는 순서대로):
 *   text.js      글 다루기 — 문장 나누기, 인용 가리기, LaTeX 풀기, 입력 거름망
 *   clues.js     단서 — 숫자·수식·판정어·핵심 개념 뽑기와 맞대기
 *   signals.js   흔들림 신호(번복·과잉추론·설명 모순)와 100점 루브릭
 *   final.js     결론 찾기 — 최종 답 뽑기, 답이 끊겼는지
 *   compare.js   두 답 비교(3단계)
 *   reference.js 기준 정답 대조(2단계)
 *   relevance.js 답이 고른 문항에 대한 것인지
 * 브라우저는 index.html이 이 순서로 <script>를 읽고, Node는 아래에서 require한다.
 * 규칙마다의 근거와 측정 결과는 app/RULES.md에 있다. */
(function (root) {
  "use strict";

  if (typeof module !== "undefined" && module.exports) {
    ["./detect/text.js", "./detect/clues.js", "./detect/signals.js", "./detect/final.js", "./detect/compare.js", "./detect/reference.js", "./detect/relevance.js"].forEach(function (f) { require(f); });
  }
  var P2 = root.P2Lib;
  if (!P2 || !P2.relevance) throw new Error("detect/의 규칙 파일을 먼저 읽어야 합니다.");

  var snippet = P2.snippet,
    maskQuotes = P2.maskQuotes,
    checkInput = P2.checkInput,
    topics = P2.topics,
    RUBRIC = P2.RUBRIC,
    SIGNALS = P2.SIGNALS,
    detectFlip = P2.detectFlip,
    detectOverinfer = P2.detectOverinfer,
    detectContradiction = P2.detectContradiction,
    score = P2.score,
    CONCLUSION_HINT = P2.CONCLUSION_HINT,
    isShortAnswer = P2.isShortAnswer,
    conclusionBy = P2.conclusionBy,
    lastSentence = P2.lastSentence,
    afterFlip = P2.afterFlip,
    findFinal = P2.findFinal,
    finalAnswer = P2.finalAnswer,
    looksCut = P2.looksCut,
    finalReliable = P2.finalReliable,
    lead = P2.lead,
    compare = P2.compare,
    matchReference = P2.matchReference,
    comparePair = P2.comparePair,
    relevance = P2.relevance;

  function analyze(text) {
    var clean = String(text == null ? "" : text).slice(0, 20000);
    var found = [];
    if (clean.trim().length === 0) return { empty: true, signals: [] };
    var masked = maskQuotes(clean);
    var checks = { flip: detectFlip, overinfer: detectOverinfer, contradiction: detectContradiction };
    Object.keys(checks).forEach(function (id) {
      var hit = checks[id](masked, clean);
      // index·length는 원문에서 걸린 곳(화면에서 표시). 첫 답·마지막 답 비교로 찾은 번복은 위치가 없다
      if (hit) found.push({ id: id, index: hit.index, length: hit.length, evidence: hit.evidence || snippet(clean, hit.index, hit.length) });
    });
    // 핵심 개념을 셋 이상 다룬 서술형 답(실험 설계 등)도 질문에 답한 글로 본다
    var tp = topics(clean);
    // 번복한 답은 첫 줄이 아니라 번복 뒤에 굵게 쓴 답이 최종 답이다
    var flip = null;
    found.forEach(function (x) { if (x.id === "flip") flip = x; });
    var fa = flip && flip.index != null ? afterFlip(clean.slice(flip.index)) : "";
    var ff = findFinal(clean), source = fa ? "flip" : ff.source, cut = looksCut(clean);
    return { empty: false, signals: found, finalAnswer: fa || ff.text, finalSource: source, cut: cut, finalReliable: finalReliable(clean, source, cut), lead: lead(clean), topics: tp, text: clean, hasConclusion: CONCLUSION_HINT.test(clean) || tp.length >= 3 || isShortAnswer(clean),
      conclusionBy: conclusionBy(clean, tp), lastSentence: lastSentence(clean) };
  }

  var api = { relevance: relevance, matchReference: matchReference, RUBRIC: RUBRIC, SIGNALS: SIGNALS, checkInput: checkInput, analyze: analyze, score: score, compare: compare, comparePair: comparePair };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.P2Check = api;
})(typeof window !== "undefined" ? window : globalThis);
