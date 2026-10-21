/* 답 흔들림 점검기 · 흔들림 신호(논문 7장)와 100점 루브릭(논문 표 2·표 6)
 * detect.js가 쓰는 부품. index.html에서 detect/의 다른 파일과 정해진 순서로 읽는다. */
(function (P2) {
  "use strict";

  var sentences = P2.sentences;

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
      // 첫 줄은 "예"로 단정했는데 마지막 문장은 "결정할 수 없다"로 끝남("답: 예, A가 범인입니다. … 따라서 유일하게 결정할 수 없습니다.")
      var lastLine = lines[lines.length - 1].replace(/\*/g, "");
      if (first === "yes" && INSUFFICIENT.test(lastLine)) {
        return { evidence: "첫 답: " + lines[0].replace(/\*/g, "") + " → 마지막 답: " + lastLine };
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

  P2.RUBRIC = RUBRIC;
  P2.SIGNALS = SIGNALS;
  P2.FLIP_PATTERNS = FLIP_PATTERNS;
  P2.LEADING_YN = LEADING_YN;
  P2.leadingYesNo = leadingYesNo;
  P2.detectFlip = detectFlip;
  P2.INSUFFICIENT = INSUFFICIENT;
  P2.CONFIDENT_GUESS = CONFIDENT_GUESS;
  P2.STRONG_GUESS = STRONG_GUESS;
  P2.HEDGE = HEDGE;
  P2.detectOverinfer = detectOverinfer;
  P2.ALL_OK = ALL_OK;
  P2.BAD = BAD;
  P2.detectContradiction = detectContradiction;
  P2.score = score;
})((typeof window !== "undefined" ? window : globalThis).P2Lib = (typeof window !== "undefined" ? window : globalThis).P2Lib || {});
