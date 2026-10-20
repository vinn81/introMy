/* 답 흔들림 점검기 — 화면 동작. 계산은 detect.js(P2Check)가 맡는다. */
(function () {
  "use strict";

  var P = window.P2Check;
  var EXAMPLES = window.P2_EXAMPLES || [];
  var ITEMS = window.P2_ITEMS || [];
  var CLAIMS = window.P2_CLAIMS || {};
  var MAX_LEN = 20000;
  // 관련성 확인에서 '다른 질문'으로 쓰는 P2-Bench 60문항(한국어·영어)
  var DECOYS = ITEMS.map(function (it) { return [it.kr, it.en]; });

  var $ = function (id) { return document.getElementById(id); };
  var state = { analysis: null, checked: {}, analysisB: null, reference: null, relevance: null, refCheck: null };
  // 새로고침해도 입력이 남도록 이 탭에만 임시 보관한다(탭을 닫거나 '모두 지우기'를 누르면 지워짐)
  var STORE_KEY = "p2check-input";
  var STORED = ["answer", "answer-b"];

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
      o.textContent = ex.id + " · " + ex.label + " · " + ex.en.score + "점";
      o.title = ex.model + " 영어 답, 논문 채점 " + ex.en.score + "점";
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

  function currentItem() {
    var v = $("item-select").value;
    return v === "" ? null : ITEMS[Number(v)] || null;
  }

  // 고른 문항의 한·영 질문과 기준 정답을 보여 준다(질문은 고칠 수 없다)
  function showItem(it) {
    state.reference = it ? it.answer : null;
    $("question-view").hidden = !it;
    $("question-kr").textContent = it ? it.kr : "";
    $("question-en").textContent = it ? it.en : "";
    $("reference").textContent = it ? "P2-Bench 기준 정답: " + it.answer : "";
  }

  function loadExample() {
    var ex = EXAMPLES[Number($("example-select").value)];
    if (!ex) return;
    var idx = ITEMS.findIndex(function (it) { return it.en === ex.questionEN; });
    $("item-select").value = idx < 0 ? "" : String(idx);
    showItem(currentItem());
    $("answer").value = ex.en.text;
    $("answer-b").value = ex.kr.text;
    saveInput();
    run();
    // run()이 안내 칸을 비우므로 불러온 뒤에 적는다
    if (state.analysis) setNote("input-note", "논문 " + ex.en.run + " 응답을 불러왔습니다. 논문 채점: " + ex.en.score + "점. 3단계에는 같은 문항의 한국어 답(" + ex.kr.score + "점)을 넣어 두었습니다.");
  }

  function pickItem() {
    var it = currentItem();
    $("example-select").value = "";
    showItem(it);
    $("answer").value = "";
    $("answer-b").value = "";
    hideResult();
    setNote("compare-note", "");
    saveInput();
    setNote("input-note", it ? "질문을 복사해 내 AI에게 물은 뒤, 받은 답을 아래 칸에 붙여 넣으세요. 3단계에서 쓸 수 있게 다른 언어로도 물어 두면 좋습니다." : "");
  }

  function copyItem(lang) {
    var it = currentItem();
    if (!it) return;
    var text = lang === "kr" ? it.kr : it.en;
    var name = lang === "kr" ? "한국어" : "영어";
    var done = function () { setNote("input-note", name + " 질문을 복사했습니다. 내 AI에게 붙여 넣어 물어보세요."); };
    // 복사가 막히면 질문 글을 선택해 두고 직접 복사하게 한다
    var fail = function () {
      var range = document.createRange();
      range.selectNodeContents($(lang === "kr" ? "question-kr" : "question-en"));
      var sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
      setNote("input-note", "브라우저가 복사를 막아 " + name + " 질문을 선택해 두었습니다. Ctrl+C(⌘C)로 복사하세요.");
    };
    // 클립보드 API를 못 쓰는 곳(file://, 권한 거부)에서는 숨긴 칸을 만들어 복사한다
    var legacy = function () {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      var ok = false;
      try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
      document.body.removeChild(ta);
      if (ok) done(); else fail();
    };
    try {
      if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(done, legacy);
      else legacy();
    } catch (e) { legacy(); }
  }

  // ---------- 2단계: 점검 ----------
  // 한국어·영어 질문을 함께 써서, 어느 언어로 물은 답이든 관련성을 확인한다
  function questionForRelevance() {
    var it = currentItem();
    return it ? [it.kr, it.en] : [];
  }

  function hideResult() {
    $("result-live").textContent = "";
    state.analysis = null;
    state.analysisB = null;
    $("result-empty").hidden = false;
    $("result-body").hidden = true;
    $("compare-body").hidden = true;
    $("result").classList.remove("stale");
  }

  // 결과를 낸 뒤 입력을 고치면 옛 결과를 흐리게 하고 다시 누르라고 알린다
  function markStale(step) {
    if (step === 1 && !$("result-body").hidden) {
      $("result").classList.add("stale");
      setNote("input-note", "입력이 바뀌었습니다. 결과를 새로 보려면 점검하기를 누르세요.");
    }
    if (!$("compare-body").hidden) {
      $("compare-body").classList.add("stale");
      setNote("compare-note", "입력이 바뀌었습니다. 다시 비교하려면 두 답 비교하기를 누르세요.");
    }
  }

  function saveInput() {
    try {
      var data = { item: $("item-select").value };
      STORED.forEach(function (id) { data[id] = $(id).value; });
      sessionStorage.setItem(STORE_KEY, JSON.stringify(data));
    } catch (e) { /* 저장이 막힌 브라우저에서는 그냥 넘어간다 */ }
  }

  function restoreInput() {
    try {
      var data = JSON.parse(sessionStorage.getItem(STORE_KEY) || "null");
      if (!data || !(data.item || STORED.some(function (id) { return data[id]; }))) return;
      if (data.item && ITEMS[Number(data.item)]) $("item-select").value = data.item;
      showItem(currentItem());
      STORED.forEach(function (id) { if (typeof data[id] === "string") $(id).value = data[id]; });
      setNote("input-note", "이 탭에서 넣었던 입력을 되살렸습니다. 점검하기를 누르면 다시 점검합니다.");
    } catch (e) { /* 저장된 값이 없거나 읽을 수 없으면 빈 칸으로 시작 */ }
  }

  function checkedIds() {
    return Object.keys(state.checked).filter(function (k) { return state.checked[k]; });
  }

  function run() {
    try {
      var item = currentItem();
      if (!item) {
        setNote("input-note", "먼저 위에서 P2-Bench 문항을 고르세요. 이 앱은 논문의 60문항에 대한 답만 점검합니다.", true);
        hideResult();
        $("item-select").focus();
        return;
      }
      var text = readAnswer("answer", "input-note");
      if (text === null) {
        hideResult();
        return;
      }
      state.analysis = P.analyze(text);
      state.relevance = P.relevance(questionForRelevance(), text, DECOYS);
      // 최종 답을 기준 정답과 자동으로 맞댄다(명제의 부정이 정답인 문항은 P2_CLAIMS 규칙도 쓴다)
      state.refCheck = P.matchReference(state.analysis, item.answer, CLAIMS[item.id] || null);
      var ref = state.refCheck;
      // 질문 단서가 적게 겹쳐도 최종 답이 기준 정답과 숫자·식으로 맞으면 이 질문의 답이다
      if (ref && ref.status === "match" && ref.strong && state.relevance.status !== "related" && state.relevance.reason !== "other") {
        state.relevance.status = "related";
        state.relevance.byReference = true;
      }
      $("relevance-ok").checked = false;
      state.checked = {};
      state.analysis.signals.forEach(function (s) { state.checked[s.id] = true; });
      $("wrong-answer").checked = !!(ref && ref.status === "mismatch");
      $("wrong-auto").hidden = !$("wrong-answer").checked;
      $("result").classList.remove("stale");
      renderSignals();
      renderResult();
      $("result-empty").hidden = true;
      $("result-body").hidden = false;
      if ($("answer-b").value.trim()) compare(true);
      else { $("compare-body").hidden = true; setNote("compare-note", ""); }
      if (document.activeElement && document.activeElement.id === "run") {
        $("step-2").scrollIntoView({ behavior: "smooth", block: "start" });
      }
    } catch (e) {
      setNote("input-note", "점검 중 문제가 생겼습니다. 답을 다시 붙여 넣어 주세요.", true);
    }
  }

  // 신호 목록은 점검할 때만 새로 그린다. 체크를 바꿀 때 다시 그리면 키보드 포커스를 잃는다
  function renderSignals() {
    var detected = {};
    state.analysis.signals.forEach(function (sg) { detected[sg.id] = sg; });
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
  }

  function renderResult() {
    var a = state.analysis;
    var ids = checkedIds();
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

    var title, text;
    var rel = state.relevance || { status: "related" };
    var offTopic = rel.status !== "related" && !$("relevance-ok").checked;
    var noConclusion = !offTopic && !a.hasConclusion && ids.length === 0 && !wrong;
    $("relevance-box").hidden = rel.status === "related";
    $("rubric").hidden = noConclusion || offTopic;
    $("scored-part").hidden = offTopic || noConclusion;
    if (offTopic) {
      $("score-total").textContent = "—";
      scoreBox.className = "score";
      if (rel.status === "unrelated" && rel.reason === "other") {
        var other = rel.other ? rel.other[0] : "";
        title = "다른 질문에 대한 답으로 보여 점수를 매기지 않았습니다";
        text = "이 답은 고른 문항보다 P2-Bench의 다른 문항 “" + (other.length > 60 ? other.slice(0, 60) + "…" : other) + "”과 숫자·수식·핵심 낱말이 훨씬 많이 겹칩니다. AI에게 물은 문항을 골랐는지 확인하세요.";
      } else if (rel.status === "unrelated") {
        title = "질문과 관련 없는 답으로 보여 점수를 매기지 않았습니다";
        text = "고른 문항의 숫자·수식·핵심 낱말이 답에 거의 나오지 않습니다. 흔들림이 없다고 100점을 주면 엉뚱한 글도 만점이 되므로 점수를 보류했습니다. 다른 문항의 답을 넣지 않았는지 확인하세요.";
      } else {
        title = "답의 언어로는 관련성을 확인하지 못했습니다";
        text = "이 앱은 한국어·영어 답을 점검합니다. 숫자·수식·개념 단서만으로는 판단할 수 없어 점수를 보류했습니다. 고른 문항의 답이 맞다면 아래 확인 칸을 체크하세요.";
      }
    } else if (noConclusion) {
      $("score-total").textContent = "—";
      scoreBox.className = "score";
      title = "결론을 찾지 못해 점수를 매기지 않았습니다";
      text = "질문과 관련은 있지만, 답을 내린 문장(‘답:’, ‘따라서 …’, 등식, ‘타당하다’ 같은 판정)이 없어 흔들림을 따질 대상이 없습니다. AI 답을 끝까지 넣었는지 확인하세요.";
    } else if (wrong && !$("wrong-auto").hidden) {
      title = "최종 답이 기준 정답과 다릅니다";
      text = "P2-Bench 기준 정답(" + state.reference + ")과 최종 답이 달라 ‘최종 답 자체가 틀렸다’를 자동으로 체크했습니다. 자동 추출이 틀렸다면 직접 확인한 뒤 체크를 끄세요.";
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
    var shown = $("score-total").textContent;
    $("result-live").textContent = "2단계 결과: " + (shown === "—" ? "점수 보류" : shown + "점") + ". " + title;
    $("why").innerHTML = whyStep2(a, rel, offTopic, noConclusion, ids, wrong, s).map(function (w) { return "<li>" + escapeHtml(w) + "</li>"; }).join("");

    var next = [];
    if (noConclusion) next.push("AI 답의 마지막 결론 부분까지 붙여 넣었는지 확인하세요. 답이 결론 없이 끝났다면 AI에게 ‘최종 답을 한 줄로 말해 줘’라고 다시 물어보세요.");
    if (offTopic) next.push("AI에게 실제로 물은 문항을 골랐는지, 답 칸에 그 문항의 답을 넣었는지 확인하세요. 맞다면 위의 확인 칸을 체크하면 점수를 매깁니다.");
    if (wrong) next.push("기준 정답이나 교재·공식 자료로 답을 다시 확인하세요.");
    ids.forEach(function (id) { next.push(P.SIGNALS[id].next); });
    if (state.reference && !wrong && !(state.refCheck && state.refCheck.status === "match")) next.push("기준 정답(" + state.reference + ")과 최종 답이 같은지 직접 보세요. 다르면 위의 ‘최종 답 자체가 틀렸다’를 체크하세요.");
    next.push("3단계: 같은 질문을 다른 언어로 물어 두 답을 비교하세요. 논문에서는 흔들림이 한쪽 언어에서만 나왔습니다.");
    $("next").innerHTML = next.map(function (n) { return "<li>" + escapeHtml(n) + "</li>"; }).join("");
  }

  function short60(t) { t = String(t || ""); return t.length > 60 ? t.slice(0, 60) + "…" : t; }

  function list(xs) { return xs && xs.length ? xs.join(", ") : "없음"; }

  // 2단계 판정 근거: 관련성 → 결론 → 흔들림 신호 → 점수 순서로 무엇을 보고 어떻게 판단했는지 적는다
  function whyStep2(a, rel, offTopic, noConclusion, ids, wrong, s) {
    var w = [];
    if (rel.status === "related" && rel.byReference) {
      w.push("질문의 단서는 답에 적게 나왔지만(관련성 점수 " + rel.score + "), 최종 답이 P2-Bench 기준 정답과 같아 이 질문의 답으로 봤습니다: " + state.refCheck.why.join(", ") + ".");
    } else if (rel.status === "related") {
      w.push("질문과 관련 있음: 질문의 단서 가운데 답에서 찾은 것 — " + list(rel.found) + " (관련성 점수 " + rel.score + ", 2.5 이상이면 관련 있음).");
      w.push("P2-Bench의 다른 문항들과도 같은 계산을 했습니다. 가장 비슷한 다른 문항의 점수: " + rel.best + " — 이 질문 점수(" + rel.score + ")의 1.3배 이하라서 이 질문의 답으로 봤습니다.");
    } else if (rel.status === "unrelated" && rel.reason === "other") {
      w.push("이 질문의 단서 가운데 답에서 찾은 것: " + list(rel.found) + " → 관련성 점수 " + rel.score + ".");
      w.push("그런데 다른 문항의 단서는 답에 더 많이 나옵니다: " + list(rel.otherFound) + " → 점수 " + rel.best + " (이 질문의 1.3배 초과).");
      w.push("이 질문의 단서 중 답에 없는 것: " + list(rel.missing) + ".");
    } else if (rel.status === "unrelated") {
      w.push("질문의 핵심 단서 " + rel.cluesInQuestion + "개 가운데 답에서 찾은 것: " + list(rel.found) + " → 관련성 점수 " + rel.score + " (2.5 미만).");
      w.push("답에 없는 질문의 단서: " + list(rel.missing) + ".");
      if (rel.neutralOnly) w.push("답이 한국어도 영어도 아니어서 낱말은 빼고 숫자·수식·개념만 비교했는데, 그것도 하나도 겹치지 않았습니다.");
    } else if (rel.status === "unknown") {
      w.push("답이 한국어도 영어도 아니어서 낱말은 비교할 수 없어, 언어와 무관한 단서(숫자·수식·핵심 개념)만 비교했습니다.");
      w.push("질문에서 그런 단서는 " + rel.cluesInQuestion + "개 — " + (rel.cluesInQuestion ? "답에서 찾은 것: " + list(rel.found) + " (점수 " + rel.score + ", 2.5 이상 필요)" : "질문이 낱말로만 되어 있어 비교할 단서가 없습니다") + ".");
      w.push("근거 없이 단정하면 엉뚱한 답을 통과시키거나 맞는 답을 막게 되므로 판정을 보류했습니다. 한국어나 영어로 받은 답을 넣거나, 직접 확인했다면 위 확인 칸을 체크하면 됩니다.");
    }
    if (offTopic) {
      w.push("관련성이 확인되지 않은 글에 흔들림 점수를 주면 엉뚱한 글도 100점이 되므로, 점수와 흔들림 신호를 감췄습니다. 위 확인 칸을 체크하면 점수를 매깁니다.");
      return w;
    }
    if (noConclusion) {
      w.push("결론을 밝힌 흔적을 다음과 같이 찾아봤지만 하나도 없었습니다: ‘답:’, ‘결론’, ‘정리’, ‘따라서·그러므로·therefore·so’, 등식(=), 판정어(타당·참·거짓·틀림·결정할 수 없음 등), 핵심 개념 3개 이상.");
      w.push("답의 마지막 문장: “" + (a.lastSentence || "없음") + "”.");
      return w;
    }
    w.push("결론이 있는 답으로 봄: " + (a.conclusionBy || "결론 표시") + ".");
    var ref = state.refCheck;
    if (ref && ref.status === "match") w.push("기준 정답(" + state.reference + ")과 대조: 같음 — " + ref.why.join(", ") + ".");
    else if (ref && ref.status === "mismatch") w.push("기준 정답(" + state.reference + ")과 대조: 다름 — " + ref.why.join(", ") + ". 그래서 ‘최종 답 자체가 틀렸다’를 자동으로 체크했습니다(직접 확인 후 끌 수 있음).");
    else if (ref) w.push("기준 정답(" + state.reference + ")과 자동으로 맞대지 못했습니다. 최종 답과 직접 비교하세요.");
    if (a.signals.length) {
      a.signals.forEach(function (sg) { w.push("자동 탐지 — " + P.SIGNALS[sg.id].title + ": “" + sg.evidence + "”"); });
    } else {
      w.push("흔들림 규칙 세 가지에 걸린 문장이 없습니다: ① 앞의 답을 스스로 고친다는 표현(‘my initial … was premature’, ‘정정합니다’ 등)이나 첫 답과 마지막 답의 예/아니오가 다름, ② ‘알 수 없다’고 한 뒤 ‘probably·아마’ 같은 확신 표현과 숫자를 붙인 추정, ③ ‘모두 맞다’고 한 바로 뒤의 틀림 표시.");
    }
    var lost = P.RUBRIC.filter(function (r) { return s.parts[r.key] < r.max; }).map(function (r) { return r.label + " −" + (r.max - s.parts[r.key]); });
    w.push(lost.length ? "점수 " + s.total + " = 100 − (" + lost.join(", ") + "). 감점 크기는 논문 표 6의 실제 채점과 같습니다." : "100점 = 루브릭 다섯 칸에서 깎인 것이 없다는 뜻입니다. 최종 답이 맞는지는 따로 확인해야 합니다.");
    if (wrong) w.push("‘최종 답 자체가 틀렸다’가 체크되어 최종 답 정확성 40점을 0점으로 했습니다.");
    return w;
  }

  // ---------- 3단계: 비교 ----------
  // ids: 켜진 신호(1단계 답은 사용자가 고친 체크), wrong: 최종 답이 틀렸다는 체크
  function describe(an, rel, confirmed, ids, wrong) {
    ids = ids || an.signals.map(function (x) { return x.id; });
    if (rel && rel.status !== "related" && !confirmed) return rel.status === "unrelated" ? "질문과 관련 없어 보임 · 점수 보류" : "질문과 언어가 달라 관련성 미확인";
    if (!an.hasConclusion && !ids.length && !wrong) return "결론을 찾지 못함 · 점수 보류";
    var s = P.score(ids, !!wrong);
    var head = wrong ? "최종 답 틀림 · " : "";
    if (!ids.length) return head + "흔들림 신호 없음 · " + s.total + "점";
    return head + "신호 " + ids.length + "개(" + ids.map(function (id) { return P.SIGNALS[id].title; }).join(", ") + ") · " + s.total + "점";
  }

  function describeA() {
    return describe(state.analysis, state.relevance, $("relevance-ok").checked, checkedIds(), $("wrong-answer").checked);
  }

  // 2단계 체크를 바꾸면 3단계 비교도 같은 기준으로 다시 보여 준다
  function refreshPair() {
    if (!state.analysisB || $("compare-body").hidden) return;
    $("meta-a").textContent = describeA();
    renderPair();
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
      $("meta-a").textContent = describeA();
      $("meta-b").textContent = describe(state.analysisB, state.relevanceB, false);
      $("compare-body").hidden = false;
      $("compare-body").classList.remove("stale");
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
    var a = { finalAnswer: $("final-a").value, lead: untouched ? state.analysis.lead : "", topics: untouched ? state.analysis.topics : [], text: untouched ? state.analysis.text : "",
      signals: checkedIds().map(function (id) { return { id: id }; }) };
    var b = { finalAnswer: $("final-b").value, lead: untouched ? state.analysisB.lead : "", topics: untouched ? state.analysisB.topics : [], text: untouched ? state.analysisB.text : "", signals: state.analysisB.signals };
    var c = P.compare(a, b);
    var cls, head, body, extra = "";
    var why = (c.why || []).slice();
    var aOff = state.relevance && state.relevance.status !== "related" && !$("relevance-ok").checked;
    var bOff = state.relevanceB && state.relevanceB.status === "unrelated";
    if (aOff || bOff) {
      cls = "unknown";
      head = (aOff ? "1단계 답" : "다른 언어 답") + "이 질문과 관련 없어 보여 비교하지 않았습니다.";
      body = "두 답 모두 같은 질문에 대한 답이어야 비교할 수 있습니다. " + (aOff ? "1단계에서 문항을 맞게 골랐는지 확인하거나, 2단계의 확인 칸을 체크한 뒤 다시 비교하세요." : "다른 언어 답 칸에 같은 질문을 언어만 바꿔 물은 답을 넣어 주세요.");
      var r = aOff ? state.relevance : state.relevanceB;
      why = ["질문의 단서 가운데 이 답에서 찾은 것: " + list(r.found) + " (관련성 점수 " + r.score + ", 2.5 이상 필요).", "답에 없는 질문의 단서: " + list(r.missing) + "."];
      if (r.reason === "other") why.push("다른 문항 “" + short60(r.other ? r.other[0] : "") + "”의 단서가 더 많이 나옵니다: " + list(r.otherFound) + ".");
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
    } else if (c.mode === "whole") {
      var shaky2 = c.aSignals + c.bSignals > 0;
      if (c.sameAnswer === true) {
        cls = shaky2 ? "warn" : "ok";
        head = "두 답의 내용이 같습니다" + (shaky2 ? "만 흔들림 신호가 있습니다." : ".");
        body = "결론이 한 줄로 정리되지 않아 두 답 전체의 숫자·수식·핵심 개념을 맞댔고, 절반 넘게 겹쳤습니다." + (shaky2 ? " 흔들림 신호가 없는 쪽을 쓰세요." : "");
      } else {
        cls = "warn";
        head = "두 답의 내용이 일부만 겹칩니다.";
        body = "결론이 한 줄로 정리되지 않아 두 답 전체의 숫자·수식·핵심 개념을 맞댔는데, 겹친 것이 절반이 안 됩니다. 한쪽에만 있는 내용을 확인하고, 결론을 짧게 적어 다시 비교하면 더 정확합니다.";
      }
    } else if (c.sameAnswer === false) {
      cls = "bad"; head = "두 답의 최종 답이 다릅니다.";
      body = "언어만 바꿨는데 답이 달라졌다면 둘 다 그대로 믿지 마세요. 기준 자료로 확인하거나 AI에게 두 답의 차이를 설명하게 하세요.";
    } else if (c.sameAnswer === null) {
      cls = "unknown"; head = "두 답을 맞댈 단서가 부족해 같다·다르다를 정하지 않았습니다.";
      body = "아래 근거처럼 두 답에서 비교할 숫자·수식·판정·핵심 개념을 충분히 찾지 못했습니다. 틀리게 단정하지 않으려고 판정을 보류했습니다. 위 두 칸에 각 답의 결론을 짧게(예: 23, 타당하다, invalid, 결정할 수 없다) 적으면 바로 다시 비교합니다.";
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
    // 1단계 답을 '최종 답이 틀렸다'로 체크했다면 비교 결과보다 그것을 먼저 알린다
    if ($("wrong-answer").checked && !aOff && !bOff) {
      cls = "bad";
      head = "1단계 답은 최종 답이 틀렸다고 표시되어 있습니다. " + head;
      body += c.sameAnswer === true ? " 다른 언어 답도 같은 답을 냈으니 함께 틀렸을 가능성이 큽니다. 두 답 모두 기준 자료로 확인하세요." : " 다른 언어 답도 그대로 믿지 말고 기준 자료로 확인하세요.";
    }
    $("pair-verdict").className = "pair-verdict " + cls;
    if (!aOff && !bOff) {
      why.push("흔들림 신호: 1단계 답 " + c.aSignals + "개, 다른 언어 답 " + c.bSignals + "개 (논문에서는 흔들림이 한쪽 언어에서만 나왔습니다).");
      if (!untouched) why.unshift("최종 답 칸을 직접 고쳐서, 고친 두 칸끼리만 비교했습니다.");
    }
    var whyHtml = why.length ? '<details class="why" open><summary>왜 이렇게 판정했나요?</summary><ul>' + why.map(function (w) { return "<li>" + escapeHtml(w) + "</li>"; }).join("") + "</ul></details>" : "";
    $("pair-verdict").innerHTML = escapeHtml(head) + "<p>" + escapeHtml(body) + "</p>" + extra + whyHtml;
  }

  // ---------- 연결 ----------
  function clearAll() {
    ["answer", "answer-b", "final-a", "final-b"].forEach(function (id) { $(id).value = ""; });
    $("example-select").value = "";
    $("item-select").value = "";
    showItem(null);
    state = { analysis: null, checked: {}, analysisB: null, reference: null, relevance: null, relevanceB: null, refCheck: null };
    hideResult();
    try { sessionStorage.removeItem(STORE_KEY); } catch (e) { /* 저장이 막힌 브라우저 */ }
    setNote("input-note", "");
    setNote("compare-note", "");
  }

  function init() {
    if (!P) {
      document.body.insertAdjacentHTML("afterbegin", '<p style="padding:12px;background:#fdecea">detect.js를 불러오지 못했습니다. 폴더 안의 파일이 모두 있는지 확인하세요.</p>');
      return;
    }
    // 실행 묶음(ZIP)을 파일로 열었으면 함께 든 paper.pdf를 연다(인터넷 없이도 논문을 볼 수 있게)
    if (location.protocol === "file:") document.querySelector(".paper-link").href = "paper.pdf";
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
    $("wrong-answer").addEventListener("change", function () {
      $("wrong-auto").hidden = true;
      if (!state.analysis) return;
      renderResult();
      refreshPair();
    });
    $("relevance-ok").addEventListener("change", function () {
      if (!state.analysis) return;
      renderResult();
      refreshPair();
    });
    $("signals").addEventListener("change", function (e) {
      var id = e.target && e.target.getAttribute("data-signal");
      if (!id) return;
      state.checked[id] = e.target.checked;
      e.target.closest(".signal").classList.toggle("on", e.target.checked);
      renderResult();
      refreshPair();
    });
    $("answer").addEventListener("input", function () { saveInput(); markStale(1); });
    $("answer-b").addEventListener("input", function () { saveInput(); markStale(3); });
    // Ctrl+Enter(⌘+Enter)로 바로 점검·비교
    var shortcut = function (fn) {
      return function (e) { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) { e.preventDefault(); fn(); } };
    };
    $("answer").addEventListener("keydown", shortcut(run));
    ["answer-b", "final-a", "final-b"].forEach(function (id) { $(id).addEventListener("keydown", shortcut(function () { compare(false); })); });
    restoreInput();
  }

  init();
})();
