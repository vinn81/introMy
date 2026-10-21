/* 답 흔들림 점검기 · 결론 찾기: 최종 답 뽑기, 답이 끊겼는지, 결론 표시
 * detect.js가 쓰는 부품. index.html에서 detect/의 다른 파일과 정해진 순서로 읽는다. */
(function (P2) {
  "use strict";

  var sentences = P2.sentences,
    plainMath = P2.plainMath,
    short = P2.short;

  // 결론을 밝힌 흔적: '답/결론' 표시, 결론 접속어, 등식, 판정 표현(타당·참·틀림·결정 불가 등)
  var CONCLUSION_HINT = /(final answer|answer|verdict|conclusion|therefore|thus|hence|\bso\b|the result|in short|in summary|summary|최종|정답|정리|요약|답[은:：]|결론|따라서|그러므로|그래서|결과적으로|=|타당|부당|\b(in)?valid\b|\b(true|false|correct|incorrect|wrong)\b|참이|거짓|맞습니다|맞다|틀렸|틀린|옳|오류|fallacy|\berror\b|cannot be|불가능|결정할 수|알 수 없|^\s*(yes|no|예|아니오|아니요)\b)/im;

  // 두 문장 이하의 짧은 답("프랑스의 수도는 파리입니다.")은 답 전체가 결론이다
  function isShortAnswer(text) {
    var t = String(text).trim();
    return t.length <= 200 && sentences(t).length <= 2;
  }

  function conclusionBy(text, tp) {
    var m = CONCLUSION_HINT.exec(text);
    if (m) return m[0].trim() === "=" ? "등식(=)으로 답을 냄" : "결론 표시 ‘" + m[0].trim() + "’";
    if (tp.length >= 3) return "핵심 개념 " + tp.length + "개(" + tp.slice(0, 4).join(", ") + ")를 다룬 서술형 답";
    if (isShortAnswer(text)) return "두 문장 이하의 짧은 답이라 답 전체를 결론으로 봄";
    return "";
  }

  function lastSentence(text) {
    var parts = plainMath(text).replace(/[*#>]/g, "").split(/(?<=[.!?。])\s+|\n+/).map(function (x) { return x.trim(); }).filter(Boolean);
    var l = parts.length ? parts[parts.length - 1] : "";
    return l.length > 80 ? l.slice(0, 80) + "…" : l;
  }

  // 콜론이 붙은 표시("답: …")이거나, 표시만 있는 제목 줄("## 최종 답", "### 결론")
  // 결론 표시 앞에 붙는 꾸밈: 제목(#), 인용(>), 목록 기호, 굵은 글씨(**), 이모지(✅ 📌 👉 🎯 등)
  var LEAD = "^(?:[\\s>*#\\-•·✅✔☑👉➡★☆▶▷■□●◆◇※\\uFE0F]|[\\uD83C-\\uDBFF][\\uDC00-\\uDFFF])*\\**\\s*";
  // 콜론이 붙은 표시("답: …")이거나, 표시만 있는 제목 줄("## 최종 답", "### ✅ Final Answer")
  var ANSWER_LABEL = new RegExp(LEAD + "(the final answers?|final answers?|correct(?:ed)? answers?|short answer|answer|최종 답변|최종 정답|최종 답|올바른 답|바른 답|정답|해답|답)\\s*\\**\\s*([:：]\\s*\\**\\s*|$)", "i");
  var CONCLUSION_LABEL = new RegExp(LEAD + "(verdict|conclusion|summary|in summary|final result|bottom line|tl;?dr|key takeaway|최종 평가|최종 결론|최종 정리|한 ?줄 요약|핵심 요약|결론|정리|요약|핵심|요점)\\s*\\**\\s*([:：.]\\s*\\**\\s*|$)", "i");
  // 답을 밝히는 문장("정답은 23입니다", "23이 정답입니다", "∴ x = 23", "The final answer is …", "요컨대 …")
  // "결론적으로·정리하면" 같은 맺는 말은 문장 맨 앞에 올 때만 센다("조건을 정리하면 …"은 결론이 아니다)
  var ANSWER_PHRASE = /(the final answer is|the answer is|정답은|최종 답은|(?:이|가) 정답|∴|^\W*(?:결론적으로|요컨대|요약하면|정리하면|한마디로|in short|in conclusion|to summarize|in summary)\b)/i;
  // "the answer is determinate", "정답은 유일하다"처럼 답의 성질만 말하는 문장은 답을 밝힌 것이 아니다
  var NOT_A_VALUE = /(the (?:final )?answer is|정답은|답은)\s*(?:\w+ly\s+)?(determinate|unique|well-defined|correct|wrong|clear|consistent|valid|유일|명확|분명|확정)/i;
  // 결론이 아닌 맺음 인사("도움이 되었길 바라요", "Let me know if …")
  var CLOSING = /(도움이 되|궁금한 (점|게)|더 (필요|알고)|물어보세요|말씀해 ?주세요|알려 ?주세요|드릴게요|드릴까요|let me know|hope (this|that) helps|feel free|happy to help|if you(?:'d| would)? like|want me to)/i;

  var CONCLUDING = /^(따라서|그러므로|그래서|결론적으로|즉,|정답은|답은|최종적으로|therefore|thus|hence|so,? |in conclusion|the answer is|the smallest|the result is)/i;

  function cleanLine(l) {
    return l.replace(/[*#]/g, "").replace(/^[\s>-]+/, "").trim();
  }

  function labeled(lines, re) {
    for (var i = lines.length - 1; i >= 0; i--) {
      var m = re.exec(lines[i]);
      if (!m) continue;
      var rest = lines[i].slice(m[0].length).replace(/\*/g, "").trim();
      // 표시 줄이 비어 있으면 이어지는 줄(최대 3줄, 다음 제목 전까지)이 답이다
      if (rest.length <= 1) {
        var parts = [];
        // 맺음 인사("도움이 되었길 바라요")가 나오면 거기서 멈춘다
        for (var j = i + 1; j < lines.length && parts.length < 3 && !/^\s*#/.test(lines[j]) && !CLOSING.test(lines[j]); j++) parts.push(cleanLine(lines[j]));
        rest = parts.join(" / ");
      }
      if (rest.length > 1) return rest;
    }
    return "";
  }

  function afterFlip(text) {
    var bolds = (text.match(/\*\*([^*\n]{2,160})\*\*/g) || []).map(function (b) { return b.replace(/\*/g, "").trim(); })
      .filter(function (b) { return !/[:：]$/.test(b); });
    return bolds.join(" · ").slice(0, 160);
  }

  function concluding(lines) {
    for (var i = lines.length - 1; i >= 0; i--) {
      var l = cleanLine(lines[i]);
      if (CLOSING.test(l)) continue;
      // 결론 문장 하나만 쓴다(한 문단에 뒤따르는 풀이 문장의 숫자가 최종 답에 섞이지 않게)
      // 한 줄에 결론 접속어가 여럿이면 마지막 것("…, so a platypus lays eggs. Therefore both … are correct.")
      var inLine = l.match(/(따라서|그러므로|\b(?:therefore|thus|hence|so))[ ,][^.。]*[.。]?/gi) || [""];
      var hit = CONCLUDING.test(l) ? l.split(/(?<=[.!?。])\s+/)[0] : inLine[inLine.length - 1];
      if (hit) return hit + (/[:：]$/.test(hit) && lines[i + 1] ? " " + cleanLine(lines[i + 1]) : "");
    }
    return "";
  }

  // 답을 밝히는 문장(가장 마지막 것). 물음표로 끝나는 문장(질문을 다시 적은 것)과 맺음 인사는 뺀다
  function answerPhrase(lines) {
    for (var i = lines.length - 1; i >= 0; i--) {
      var parts = cleanLine(lines[i]).split(/(?<=[.!。])\s+/);
      for (var k = parts.length - 1; k >= 0; k--) {
        var sent = parts[k].trim();
        if (sent.length > 1 && ANSWER_PHRASE.test(sent) && !/[?？]$/.test(sent) && !CLOSING.test(sent) && !NOT_A_VALUE.test(sent)) return sent;
      }
    }
    return "";
  }

  // source: 최종 답을 어디서 찾았는지("boxed" | "label" | "phrase" | "equation" | "bold" | "concluding" | "last-line")
  function findFinal(raw) {
    var boxed = [];
    String(raw).replace(/\\boxed\s*\{((?:[^{}]|\{(?:[^{}]|\{[^{}]*\})*\})*)\}/g, function (m, inner) { boxed.push(inner); return m; });
    if (boxed.length) return { text: plainMath(boxed.join(" / ")).trim().slice(0, 160), source: "boxed" };
    var text = plainMath(raw);
    var lines = text.split(/\n+/).filter(function (l) { return l.trim() && !/^[\s|:-]+$/.test(l); });
    var a = labeled(lines, ANSWER_LABEL) || labeled(lines, CONCLUSION_LABEL), source = "label";
    if (!a) { a = answerPhrase(lines); source = "phrase"; }
    if (!a) {
      // 답 뒤쪽(마지막 40%)에 따로 줄을 잡은 식($$…$$, \[…\])이 있으면 마지막 식의 '= 값'이 결론이다
      // ("$$\frac{90}{585} = \frac{2}{13} \approx 15.38\%$$" 뒤에 해설 한 문단). 풀이 중간의 굵은 값보다 먼저 본다
      var disp = null, dre = /\$\$([\s\S]+?)\$\$|\\\[([\s\S]+?)\\\]/g, dm;
      while ((dm = dre.exec(raw))) disp = { at: dm.index, body: dm[1] || dm[2] };
      if (disp && disp.at >= String(raw).length * 0.6) {
        var eq = plainMath("$$" + disp.body.replace(/\\approx/g, " ≈ ").replace(/\\%/g, "%") + "$$").replace(/\s+/g, " ").trim();
        var cut = Math.max(eq.lastIndexOf("="), eq.lastIndexOf("≈"));
        var val = cut >= 0 ? eq.slice(cut + 1).replace(/[.,]\s*$/, "").trim() : "";
        if (/\d/.test(val)) { a = val; source = "equation"; }
      }
    }
    if (!a) {
      source = "bold";
      // 숫자가 든 굵은 글씨 중 마지막 것. "Step 1." "2단계" "(3) 이중 맹검" 같은 순서 제목은 뺀다
      // 제목 줄("#### **방법 1: 관찰을 통한 풀이**")의 굵은 글씨도 제목이라 뺀다
      var bolds = (text.replace(/^\s*#.*$/gm, "").match(/\*\*([^*\n]{2,160})\*\*/g) || []).map(function (b) { return b.replace(/\*/g, "").trim(); });
      for (var i = bolds.length - 1; i >= 0 && !a; i--) if (/\d/.test(bolds[i]) && !/[:：]$/.test(bolds[i]) && !/^(step|case|part|\d+\s*단계|단계|경우)\b/i.test(bolds[i]) && !/^\(\d+\)\s/.test(bolds[i])) a = bolds[i];
    }
    if (!a) { a = concluding(lines); source = "concluding"; }
    if (!a) {
      // 마지막 줄로 대신하되, 맺음 인사 줄은 건너뛴다
      var rest = lines.filter(function (l) { return !CLOSING.test(l); });
      a = rest.length ? cleanLine(rest[rest.length - 1]) : (lines.length ? cleanLine(lines[lines.length - 1]) : "");
      // 긴 문단이면 앞이 아니라 끝 문장들을 남긴다(결론은 문단 끝에 온다: "… The birth year cannot be determined.")
      if (a.length > 160) {
        var sents = a.split(/(?<=[.!?。])\s+/), tail = "";
        for (var k = sents.length - 1; k >= 0 && (tail ? sents[k].length + 1 + tail.length : 0) <= 160; k--) tail = tail ? sents[k] + " " + tail : sents[k];
        a = tail;
      }
      source = "last-line";
    }
    return { text: a.replace(/\s+/g, " ").trim().slice(0, 160), source: source };
  }

  function finalAnswer(raw) { return findFinal(raw).text; }

  // 답이 문장 중간에서 끝났는가(복사하다 만 답). 마침표·닫는 기호·한국어 종결 어미·짧은 등식 줄로 끝나면 끝난 것으로 본다
  function looksCut(raw) {
    var trimmed = String(raw || "").replace(/\s+$/, "");
    // 굵은 글씨를 닫고 끝난 줄("- 전압: **8 V**")은 끝난 답이다
    if (!trimmed || /\*\*$/.test(trimmed)) return false;
    // 식·코드 블록을 열고 닫지 않은 채 끝났으면($$ … , \[ … , ``` …) 중간에 끊긴 답이다
    var count = function (re) { return (trimmed.match(re) || []).length; };
    if (count(/\$\$/g) % 2 === 1 || count(/\\\[/g) > count(/\\\]/g) || count(/```/g) % 2 === 1) return true;
    var t = trimmed.replace(/[*_]+$/, "");
    if (/[.!?。…)\]}>|$`'"”’»~✓✔∎□■]$/.test(t)) return false;
    if (/(다|요|음|함|임|됨|까|죠|오|네|군)$/.test(t)) return false;
    var last = t.split(/\n/).pop().trim();
    // 한글 없이 등식만 있는 짧은 줄("x = 23", "Answer: x = 23")로 끝나면 끝난 답이다
    if (last.length <= 40 && /=/.test(last) && !/[가-힣]/.test(last)) return false;
    // "따라서 답은 23", "정답: 0.20 M"처럼 '은·는·이·가·:' 뒤의 값으로 끝나면 끝난 답이다
    if (/(은|는|이|가|\bis|\bare|\bequals|[:：=])\s*[-+]?\d[\d.,/]*\s*(%|°|[a-zA-Z]{1,3})?$/.test(last)) return false;
    // 목록·굵은 표시로 시작하는 요약 줄이 조사·어미가 아닌 말로 끝나면 끝난 답이다("* **(b) 압력 상승:** 정반응 (오른쪽)으로 이동")
    if (/^([*\-•·]|\d+[.)])\s|^\*\*/.test(last) && /[가-힣]$/.test(t) && !/(은|는|이|가|을|를|에|의|로|와|과|도|고|며|면|서|지|게|나)$/.test(t)) return false;
    return true;
  }

  // 최종 답으로 읽은 글을 믿을 수 있는가. 표시("답:", \boxed, 굵은 숫자)로 찾았으면 믿고,
  // 결론 접속어로 찾았으면 답이 끊기지 않았을 때만, 마지막 줄로 대신했으면 한 문단짜리 짧은 답일 때만 믿는다
  // (여러 문단으로 풀어 가다 멈춘 답의 마지막 줄은 결론이 아니라 풀이 중간이다)
  function finalReliable(raw, source, cut) {
    if (source === "boxed" || source === "label" || source === "bold" || source === "equation" || source === "flip") return true;
    if (cut) return false;
    if (source === "last-line") return String(raw).split(/\n+/).filter(function (l) { return l.trim(); }).length <= 1;
    return true;
  }

  // 답의 첫 문장(제목·번호 목차 줄은 건너뜀)과 마지막 결론 문장을 함께 본다
  function lead(text) {
    var all = plainMath(text).split(/\n+/);
    var lines = all.map(function (l) { return l.replace(/[*#>]/g, "").trim(); })
      .filter(function (l) { return l && !/^\d+[.)]\s*\S{0,20}$/.test(l) && !/^[|:-\s]+$/.test(l); });
    return ((lines.length ? lines[0].slice(0, 200) : "") + "\n" + concluding(all)).trim();
  }

  P2.CONCLUSION_HINT = CONCLUSION_HINT;
  P2.isShortAnswer = isShortAnswer;
  P2.conclusionBy = conclusionBy;
  P2.lastSentence = lastSentence;
  P2.ANSWER_LABEL = ANSWER_LABEL;
  P2.CONCLUSION_LABEL = CONCLUSION_LABEL;
  P2.CONCLUDING = CONCLUDING;
  P2.cleanLine = cleanLine;
  P2.labeled = labeled;
  P2.afterFlip = afterFlip;
  P2.concluding = concluding;
  P2.findFinal = findFinal;
  P2.finalAnswer = finalAnswer;
  P2.looksCut = looksCut;
  P2.finalReliable = finalReliable;
  P2.lead = lead;
})((typeof window !== "undefined" ? window : globalThis).P2Lib = (typeof window !== "undefined" ? window : globalThis).P2Lib || {});
