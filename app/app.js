/* 답 흔들림 점검기 — 화면 동작. 계산은 detect.js(P2Check)가 맡는다. */
(function () {
  "use strict";

  var P = window.P2Check;
  var EXAMPLES = window.P2_EXAMPLES || [];
  var ITEMS = window.P2_ITEMS || [];
  var MAX_LEN = 20000;
  // 관련성 확인에서 '다른 질문'으로 쓰는 P2-Bench 60문항(한국어·영어)
  var DECOYS = ITEMS.map(function (it) { return [it.kr, it.en]; });

  var $ = function (id) { return document.getElementById(id); };
  var state = { analysis: null, checked: {}, analysisB: null, reference: null, relevance: null };

  function setNote(id, text, isError) {
    var el = $(id);
    el.textContent = text || "";
    el.classList.toggle("error", !!isError);
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  var INPUT_MESSAGES = {
    empty: "답이 비어 있습니다. AI 답을 붙여 넣거나 논문 예시를 불러오세요.",
    short: "답이 너무 짧아 흔들림을 볼 수 없습니다. 풀이까지 포함한 답 전체를 넣어 주세요.",
    noletters: "글자보다 기호·숫자가 대부분이라 답으로 읽을 수 없습니다. AI가 쓴 문장 답을 넣어 주세요.",
    repeated: "같은 글자나 문장이 되풀이된 입력이라 점검하지 않았습니다. AI 답 원문을 넣어 주세요.",
    gibberish: "읽을 수 있는 문장이 아닌 것 같아 점검하지 않았습니다. AI 답 원문을 넣어 주세요."
  };

  function readAnswer(id, noteId) {
    var text = $(id).value || "";
    var check = P.checkInput(text);
    if (!check.ok) {
      setNote(noteId, INPUT_MESSAGES[check.reason] || INPUT_MESSAGES.gibberish, true);
      return null;
    }
    if (text.length > MAX_LEN) {
      setNote(noteId, "답이 길어 앞쪽 " + MAX_LEN.toLocaleString() + "자만 점검했습니다.", false);
      return text.slice(0, MAX_LEN);
    }
    setNote(noteId, "");
    return text;
  }

  // ---------- 1단계: 불러오기 ----------
  function fillSelects() {
    EXAMPLES.forEach(function (ex, i) {
      var o = document.createElement("option");
      o.value = String(i);
      o.textContent = ex.id + " · " + ex.label + " (" + ex.model + ", 영어 답 " + ex.en.score + "점)";
      $("example-select").appendChild(o);
    });
    var groups = {};
    ITEMS.forEach(function (it, i) {
      if (!groups[it.category]) {
        groups[it.category] = document.createElement("optgroup");
        groups[it.category].label = it.category;
        $("item-select").appendChild(groups[it.category]);
      }
      var o = document.createElement("option");
      o.value = String(i);
      o.textContent = it.id + " · " + it.kr.slice(0, 48) + (it.kr.length > 48 ? "…" : "");
      groups[it.category].appendChild(o);
    });
  }

  function showReference(answer) {
    state.reference = answer || null;
    $("reference").hidden = !answer;
    $("reference").textContent = answer ? "P2-Bench 기준 정답: " + answer : "";
  }

  function loadExample() {
    var ex = EXAMPLES[Number($("example-select").value)];
    if (!ex) return;
    $("item-select").value = "";
    toggleCopy(false);
    $("question").value = ex.questionEN;
    $("answer").value = ex.en.text;
    $("answer-b").value = ex.kr.text;
    showReference(ex.answer);
    setNote("input-note", "논문 " + ex.en.run + " 응답을 불러왔습니다. 논문 채점: " + ex.en.score + "점. 3단계에는 같은 문항의 한국어 답(" + ex.kr.score + "점)을 넣어 두었습니다.");
    run();
  }

  function toggleCopy(on) {
    $("copy-kr").disabled = !on;
    $("copy-en").disabled = !on;
  }

  function pickItem() {
    var it = ITEMS[Number($("item-select").value)];
    if (!it || $("item-select").value === "") { toggleCopy(false); return; }
    $("example-select").value = "";
    toggleCopy(true);
    $("question").value = it.kr;
    $("answer").value = "";
    $("answer-b").value = "";
    showReference(it.answer);
    setNote("input-note", "질문을 복사해 내 AI에게 물은 뒤, 받은 답을 아래 칸에 붙여 넣으세요. 3단계에서 쓸 수 있게 다른 언어로도 물어 두면 좋습니다.");
  }

  function copyItem(lang) {
    var it = ITEMS[Number($("item-select").value)];
    if (!it) return;
    var text = lang === "kr" ? it.kr : it.en;
    var done = function () { setNote("input-note", (lang === "kr" ? "한국어" : "영어") + " 질문을 복사했습니다. 내 AI에게 붙여 넣어 물어보세요."); };
    var fail = function () {
      $("question").value = text;
      $("question").select();
      setNote("input-note", "복사 권한이 없어 질문 칸에 넣고 선택해 두었습니다. Ctrl+C(⌘C)로 복사하세요.");
    };
    try {
      if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(done, fail);
      else fail();
    } catch (e) { fail(); }
  }

  // ---------- 2단계: 점검 ----------
  // P2-Bench 문항이면 한국어·영어 질문을 함께 써서, 다른 언어로 물은 답도 관련성을 확인할 수 있게 한다
  function questionForRelevance() {
    var q = ($("question").value || "").trim();
    for (var i = 0; i < ITEMS.length; i++) {
      if (ITEMS[i].kr === q || ITEMS[i].en === q) return [ITEMS[i].kr, ITEMS[i].en];
    }
    return [q];
  }

  function hideResult() {
    state.analysis = null;
    $("result-empty").hidden = false;
    $("result-body").hidden = true;
    $("compare-body").hidden = true;
  }

  function run() {
    try {
      if (!($("question").value || "").trim()) {
        setNote("input-note", "질문을 넣어 주세요. 답이 그 질문에 대한 것인지 먼저 확인한 뒤 점수를 매깁니다.", true);
        hideResult();
        return;
      }
      var text = readAnswer("answer", "input-note");
      if (text === null) {
        hideResult();
        return;
      }
      state.analysis = P.analyze(text);
      state.relevance = P.relevance(questionForRelevance(), text, DECOYS);
      $("relevance-ok").checked = false;
      state.checked = {};
      state.analysis.signals.forEach(function (s) { state.checked[s.id] = true; });
      $("wrong-answer").checked = false;
      renderResult();
      $("result-empty").hidden = true;
      $("result-body").hidden = false;
      if ($("answer-b").value.trim()) compare(true);
      if (document.activeElement && document.activeElement.id === "run") {
        $("step-2").scrollIntoView({ behavior: "smooth", block: "start" });
      }
    } catch (e) {
      setNote("input-note", "점검 중 문제가 생겼습니다. 답을 다시 붙여 넣어 주세요.", true);
    }
  }

  function renderResult() {
    var a = state.analysis;
    var ids = Object.keys(state.checked).filter(function (k) { return state.checked[k]; });
    var wrong = $("wrong-answer").checked;
    var s = P.score(ids, wrong);

    $("score-total").textContent = s.total;
    var scoreBox = $("score-total").parentNode;
    scoreBox.className = "score " + (wrong ? "bad" : s.total === 100 ? "ok" : "warn");

    $("rubric").innerHTML = P.RUBRIC.map(function (r) {
      var v = s.parts[r.key];
      var cls = v === 0 ? "zero" : v < r.max ? "lost" : "";
      return '<div class="bar ' + cls + '"><span>' + r.label + '</span><span class="track"><span class="fill" style="width:' + (v / r.max * 100) + '%"></span></span><span class="pts">' + v + " / " + r.max + "</span></div>";
    }).join("");

    var detected = {};
    a.signals.forEach(function (sg) { detected[sg.id] = sg; });
    $("signals").innerHTML = Object.keys(P.SIGNALS).map(function (id) {
      var sig = P.SIGNALS[id];
      var hit = detected[id];
      var on = !!state.checked[id];
      return '<div class="signal' + (on ? " on" : "") + '"><label>' +
        '<input type="checkbox" data-signal="' + id + '"' + (on ? " checked" : "") + " />" +
        "<span><b>" + sig.title + "</b><span class=\"code\">" + sig.code + "</span>" +
        (hit ? '<span class="auto">자동 탐지</span>' : "") +
        "<p>" + sig.why + "</p>" +
        '<p class="paper">' + sig.paper + "</p>" +
        (hit ? "<blockquote>" + escapeHtml(hit.evidence) + "</blockquote>" : "") +
        "</span></label></div>";
    }).join("");

    var title, text;
    var rel = state.relevance || { status: "related" };
    var offTopic = rel.status !== "related" && !$("relevance-ok").checked;
    var noConclusion = !offTopic && !a.hasConclusion && ids.length === 0 && !wrong;
    $("relevance-box").hidden = rel.status === "related";
    $("rubric").hidden = noConclusion || offTopic;
    $("scored-part").hidden = offTopic;
    if (offTopic) {
      $("score-total").textContent = "—";
      scoreBox.className = "score";
      if (rel.status === "unrelated" && rel.reason === "other") {
        var other = rel.other ? rel.other[0] : "";
        title = "다른 질문에 대한 답으로 보여 점수를 매기지 않았습니다";
        text = "이 답은 넣은 질문보다 P2-Bench의 다른 문항 “" + (other.length > 60 ? other.slice(0, 60) + "…" : other) + "”과 숫자·수식·핵심 낱말이 훨씬 많이 겹칩니다. 질문과 답을 짝지어 넣었는지 확인하세요.";
      } else if (rel.status === "unrelated") {
        title = "질문과 관련 없는 답으로 보여 점수를 매기지 않았습니다";
        text = "질문의 숫자·수식·핵심 낱말이 답에 거의 나오지 않습니다. 흔들림이 없다고 100점을 주면 엉뚱한 글도 만점이 되므로 점수를 보류했습니다. 다른 질문의 답을 넣지 않았는지 확인하세요.";
      } else {
        title = "질문과 답의 언어가 달라 관련성을 확인하지 못했습니다";
        text = "질문을 답과 같은 언어로 넣으면 다시 확인합니다. P2-Bench 문항을 골랐다면 한·영 질문을 함께 봅니다.";
      }
    } else if (noConclusion) {
      $("score-total").textContent = "—";
      scoreBox.className = "score";
      title = "결론을 찾지 못해 점수를 매기지 않았습니다";
      text = "‘따라서’, ‘답:’, ‘~이다’처럼 결론을 밝힌 문장이 없습니다. 이 앱은 질문에 답한 글을 점검합니다. AI 답 전체를 넣었는지 확인하세요.";
    } else if (wrong) {
      title = "최종 답이 틀렸습니다";
      text = "흔들림을 따지기 전에 답 자체를 쓰면 안 됩니다. 기준 자료로 정답을 확인하세요.";
    } else if (ids.length === 0) {
      title = "흔들림 신호가 없습니다";
      text = "논문 240개 중 236개가 이런 답이었습니다. 그래도 점수는 ‘흔들림이 없다’는 뜻일 뿐, 정답 확인을 대신하지는 않습니다.";
    } else {
      title = "최종 답은 맞아도 흔들린 답입니다";
      text = "논문의 감점 4건과 같은 모양입니다. 평균 점수로는 0.18점 차이지만, 이런 답을 그대로 옮기면 틀린 첫 줄이나 근거 없는 추측까지 함께 옮기게 됩니다.";
    }
    $("verdict-title").textContent = title;
    $("verdict-text").textContent = text;

    var next = [];
    if (offTopic) next.push("질문 칸에 AI에게 실제로 한 질문을, 답 칸에 그 질문의 답을 넣었는지 확인하세요. 맞다면 위의 확인 칸을 체크하면 점수를 매깁니다.");
    if (wrong) next.push("기준 정답이나 교재·공식 자료로 답을 다시 확인하세요.");
    ids.forEach(function (id) { next.push(P.SIGNALS[id].next); });
    if (state.reference && !wrong) next.push("기준 정답(" + state.reference + ")과 최종 답이 같은지 직접 보세요. 다르면 위의 ‘최종 답 자체가 틀렸다’를 체크하세요.");
    next.push("3단계: 같은 질문을 다른 언어로 물어 두 답을 비교하세요. 논문에서는 흔들림이 한쪽 언어에서만 나왔습니다.");
    $("next").innerHTML = next.map(function (n) { return "<li>" + escapeHtml(n) + "</li>"; }).join("");
  }

  // ---------- 3단계: 비교 ----------
  function describe(an, rel, confirmed) {
    if (rel && rel.status !== "related" && !confirmed) return rel.status === "unrelated" ? "질문과 관련 없어 보임 · 점수 보류" : "질문과 언어가 달라 관련성 미확인";
    if (!an.hasConclusion && !an.signals.length) return "결론을 찾지 못함 · 점수 보류";
    if (!an.signals.length) return "흔들림 신호 없음 · 100점";
    var s = P.score(an.signals.map(function (x) { return x.id; }), false);
    return "신호 " + an.signals.length + "개(" + an.signals.map(function (x) { return P.SIGNALS[x.id].title; }).join(", ") + ") · " + s.total + "점";
  }

  function compare(silent) {
    try {
      if (!state.analysis) {
        if (!$("answer").value.trim()) {
          setNote("compare-note", "먼저 1단계에 답을 넣고 점검하세요.", true);
          return;
        }
        run();
        if (!state.analysis) {
          setNote("compare-note", "1단계 답을 점검할 수 없습니다. 1단계 칸의 안내를 확인하세요.", true);
          return;
        }
      }
      var textB = readAnswer("answer-b", "compare-note");
      if (textB === null) { $("compare-body").hidden = true; return; }
      state.analysisB = P.analyze(textB);
      state.relevanceB = P.relevance(questionForRelevance(), textB, DECOYS);
      $("final-a").value = state.analysis.finalAnswer || "";
      $("final-b").value = state.analysisB.finalAnswer || "";
      $("meta-a").textContent = describe(state.analysis, state.relevance, $("relevance-ok").checked);
      $("meta-b").textContent = describe(state.analysisB, state.relevanceB, false);
      $("compare-body").hidden = false;
      renderPair();
      if (!silent) $("compare-body").scrollIntoView({ behavior: "smooth", block: "nearest" });
    } catch (e) {
      setNote("compare-note", "비교 중 문제가 생겼습니다. 두 답을 다시 넣어 주세요.", true);
    }
  }

  function renderPair() {
    // 사용자가 최종 답 칸을 고쳤으면 그 칸만 보고, 그대로면 답의 첫 문장도 함께 본다
    // 최종 답 칸을 고치면 서술형 개념 비교 대신 고친 칸끼리만 비교한다
    var untouched = $("final-a").value === state.analysis.finalAnswer && $("final-b").value === state.analysisB.finalAnswer;
    var a = { finalAnswer: $("final-a").value, lead: untouched ? state.analysis.lead : "", topics: untouched ? state.analysis.topics : [], signals: state.analysis.signals };
    var b = { finalAnswer: $("final-b").value, lead: untouched ? state.analysisB.lead : "", topics: untouched ? state.analysisB.topics : [], signals: state.analysisB.signals };
    var c = P.compare(a, b);
    var cls, head, body, extra = "";
    var aOff = state.relevance && state.relevance.status !== "related" && !$("relevance-ok").checked;
    var bOff = state.relevanceB && state.relevanceB.status === "unrelated";
    if (aOff || bOff) {
      cls = "unknown";
      head = (aOff ? "1단계 답" : "다른 언어 답") + "이 질문과 관련 없어 보여 비교하지 않았습니다.";
      body = "두 답 모두 같은 질문에 대한 답이어야 비교할 수 있습니다. " + (aOff ? "2단계의 확인 칸을 체크했거나 질문을 고친 뒤 다시 비교하세요." : "다른 언어 답 칸에 같은 질문을 언어만 바꿔 물은 답을 넣어 주세요.");
    } else if (c.mode === "topics") {
      var t = c.topics;
      var chips = function (label, list) {
        return list.length ? "<p><b>" + label + "</b> " + list.map(escapeHtml).join(" · ") + "</p>" : "";
      };
      extra = chips("두 답 모두:", t.both) + chips("1단계 답에만:", t.onlyA) + chips("다른 언어 답에만:", t.onlyB);
      var shaky = c.aSignals + c.bSignals > 0;
      if (c.sameAnswer === true) {
        cls = shaky ? "warn" : "ok";
        head = "서술형 답: 두 언어가 같은 핵심 개념을 다뤘습니다" + (shaky ? "만 흔들림 신호가 있습니다." : ".");
        body = shaky ? "개념은 같으니 흔들림 신호가 없는 쪽 설명을 쓰세요." : "한 줄 정답이 없는 문항이라 핵심 개념이 얼마나 겹치는지로 비교했습니다. 언어를 바꿔도 같은 내용을 설명했습니다.";
      } else {
        cls = "warn";
        head = "서술형 답: 핵심 개념이 일부만 겹칩니다.";
        body = "같은 질문인데 언어에 따라 다룬 내용이 달랐습니다. 한쪽에만 있는 개념은 다른 쪽 답에서 빠진 부분일 수 있으니, 두 답을 합쳐 보거나 빠진 개념을 AI에게 다시 물어보세요.";
      }
    } else if (c.sameAnswer === false) {
      cls = "bad"; head = "두 답의 최종 답이 다릅니다.";
      body = "언어만 바꿨는데 답이 달라졌다면 둘 다 그대로 믿지 마세요. 기준 자료로 확인하거나 AI에게 두 답의 차이를 설명하게 하세요.";
    } else if (c.sameAnswer === null) {
      cls = "unknown"; head = "최종 답을 자동으로 맞대기 어렵습니다.";
      body = "한 줄로 정리되는 결론도, 비교할 만한 핵심 개념도 찾지 못했습니다. 위 두 칸에 각 답의 결론을 짧게(예: 23, 타당하다, invalid, 결정할 수 없다) 적으면 바로 다시 비교합니다. 흔들림 신호: 1단계 답 " + c.aSignals + "개, 다른 언어 답 " + c.bSignals + "개.";
    } else if (c.aSignals === 0 && c.bSignals === 0) {
      cls = "ok"; head = "두 언어 모두 같은 답, 흔들림 없음.";
      body = "논문에서 Opus가 60쌍 모두 보인 모양입니다. 이 답은 언어를 바꿔도 안정적입니다.";
    } else if (c.aSignals > 0 && c.bSignals > 0) {
      cls = "warn"; head = "최종 답은 같지만 두 답 모두 흔들렸습니다.";
      body = "결론만 가져가고 풀이는 직접 다시 확인하세요.";
    } else {
      cls = "warn";
      head = "최종 답은 같지만 " + (c.aSignals > 0 ? "1단계 답" : "다른 언어 답") + "만 흔들렸습니다.";
      body = "논문에서 Sonnet이 보인 4쌍과 같은 모양입니다(한국어 쪽 만점, 영어 쪽만 감점). 흔들리지 않은 " + (c.aSignals > 0 ? "다른 언어 답" : "1단계 답") + "의 풀이를 쓰세요.";
    }
    $("pair-verdict").className = "pair-verdict " + cls;
    $("pair-verdict").innerHTML = escapeHtml(head) + "<p>" + escapeHtml(body) + "</p>" + extra;
  }

  // ---------- 연결 ----------
  function clearAll() {
    ["question", "answer", "answer-b", "final-a", "final-b"].forEach(function (id) { $(id).value = ""; });
    $("example-select").value = "";
    $("item-select").value = "";
    toggleCopy(false);
    showReference(null);
    state = { analysis: null, checked: {}, analysisB: null, reference: null, relevance: null, relevanceB: null };
    $("result-empty").hidden = false;
    $("result-body").hidden = true;
    $("compare-body").hidden = true;
    setNote("input-note", "");
    setNote("compare-note", "");
  }

  function init() {
    if (!P) {
      document.body.insertAdjacentHTML("afterbegin", '<p style="padding:12px;background:#fdecea">detect.js를 불러오지 못했습니다. 폴더 안의 파일이 모두 있는지 확인하세요.</p>');
      return;
    }
    fillSelects();
    $("example-select").addEventListener("change", loadExample);
    $("item-select").addEventListener("change", pickItem);
    $("copy-kr").addEventListener("click", function () { copyItem("kr"); });
    $("copy-en").addEventListener("click", function () { copyItem("en"); });
    $("run").addEventListener("click", run);
    $("clear").addEventListener("click", clearAll);
    $("compare").addEventListener("click", function () { compare(false); });
    $("final-a").addEventListener("input", function () { if (state.analysisB) renderPair(); });
    $("final-b").addEventListener("input", function () { if (state.analysisB) renderPair(); });
    $("wrong-answer").addEventListener("change", function () { if (state.analysis) renderResult(); });
    $("relevance-ok").addEventListener("change", function () {
      if (!state.analysis) return;
      renderResult();
      if (state.analysisB) {
        $("meta-a").textContent = describe(state.analysis, state.relevance, $("relevance-ok").checked);
        renderPair();
      }
    });
    $("signals").addEventListener("change", function (e) {
      var id = e.target && e.target.getAttribute("data-signal");
      if (!id) return;
      state.checked[id] = e.target.checked;
      renderResult();
    });
  }

  init();
})();
