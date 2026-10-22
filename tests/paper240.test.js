// 논문 본실험 답 240개(재현 패키지의 claude_raw_responses.csv + scoring_r2_qc.csv)로 규칙 전체를 확인한다
const test = require("node:test");
const assert = require("node:assert/strict");
const P = require("../app/detect.js");
global.window = {};
require("../app/data.js");

const ITEMS = window.P2_ITEMS;
const DECOYS = ITEMS.map((it) => [it.kr, it.en]);
// 답 240개는 저장소에 넣지 않는다. 로컬에 tests/fixtures/p2bench-240.json을 두거나
// P2BENCH_FIXTURE 환경 변수로 경로를 주면 돌고, 없으면 이 파일의 테스트는 건너뛴다
const fs = require("node:fs");
const path = require("node:path");
const FIXTURE = process.env.P2BENCH_FIXTURE || path.join(__dirname, "fixtures", "p2bench-240.json");
const ANSWERS = fs.existsSync(FIXTURE) ? JSON.parse(fs.readFileSync(FIXTURE, "utf8")) : null;
const skip = ANSWERS ? false : "논문 답 240개 파일이 없어 건너뜀(tests/fixtures/p2bench-240.json)";
const itemOf = (qid) => ITEMS.find((it) => it.id === qid);

test("240개 모두 입력 거름망을 통과하고 결론이 있는 답으로 읽힌다", { skip }, () => {
  assert.equal(ANSWERS.length, 240);
  ANSWERS.forEach((a) => {
    assert.equal(P.checkInput(a.text).ok, true, a.run);
    assert.equal(P.analyze(a.text).hasConclusion, true, a.run);
  });
});

test("감점 4건은 논문 점수와 같게, 만점 236건은 오탐 없이 100점", { skip }, () => {
  const fp = [];
  ANSWERS.forEach((a) => {
    const an = P.analyze(a.text);
    const s = P.score(an.signals.map((x) => x.id), false).total;
    if (a.score < 100) assert.equal(s, a.score, a.run);
    else if (an.signals.length) fp.push(a.run);
  });
  assert.deepEqual(fp, []);
});

test("자기 질문과 짝지으면 240개 모두 관련 있음", { skip }, () => {
  const related = ANSWERS.filter((a) => {
    const it = itemOf(a.qid);
    return P.relevance([it.kr, it.en], a.text, DECOYS).status === "related";
  }).length;
  assert.equal(related, 240);
});

test("다른 59문항 질문과 짝지으면 0.5% 이하만 관련 있음으로 통과", { skip }, () => {
  let passed = 0;
  ANSWERS.forEach((a) => {
    ITEMS.forEach((o) => {
      if (o.id !== a.qid && P.relevance([o.kr, o.en], a.text, DECOYS).status === "related") passed++;
    });
  });
  assert.ok(passed / (240 * 59) <= 0.005, "passed " + passed);
});

test("앱 기준(기준 정답 일치로 관련성을 올리는 것 포함)으로도 다른 문항 질문과의 잘못된 통과가 0.5% 이하", { skip }, () => {
  let passed = 0;
  ANSWERS.forEach((a) => {
    const an = P.analyze(a.text);
    ITEMS.forEach((o) => {
      if (o.id === a.qid) return;
      const r = P.relevance([o.kr, o.en], a.text, DECOYS);
      const ref = P.matchReference(an, o.answer);
      // app.js run()과 같은 규칙: 'other'가 아니면 기준 정답과의 강한 일치로 관련 있음이 된다
      // 고른 문항의 필수 근거를 모두 짚으면 관련 있음(더 비슷한 다른 문항의 근거도 모두 짚었으면 제외) — app.js rubricVouches
      const full = (rb) => rb && rb.hit === rb.total && !rb.wrong.length;
      const other = r.other ? ITEMS.find((i) => i.kr === r.other[0]) : null;
      const vouch = full(P.checkRubric(a.text, window.P2_RUBRIC[o.id])) && !(other && full(P.checkRubric(a.text, window.P2_RUBRIC[other.id])));
      if (r.status === "related" || (r.reason !== "other" && ref.status === "match" && ref.strong) || vouch) passed++;
    });
  });
  assert.ok(passed / (240 * 59) <= 0.005, "passed " + passed);
});

test("최종 답이 모두 맞은 240개 중 기준 정답과 '다르다'고 잘못 대조되는 답은 없다", { skip }, () => {
  const wrong = ANSWERS.filter((a) => P.matchReference(P.analyze(a.text), itemOf(a.qid).answer, window.P2_CLAIMS[a.qid]).status === "mismatch").map((a) => a.run);
  assert.deepEqual(wrong, []);
});

test("한·영 짝 120개는 '다른 답'이나 '판정 보류' 없이 115쌍 이상 같은 답", { skip }, () => {
  const groups = {};
  ANSWERS.forEach((a) => { (groups[a.model + a.qid] = groups[a.model + a.qid] || {})[a.lang] = a; });
  const pairs = Object.values(groups);
  assert.equal(pairs.length, 120);
  let same = 0;
  pairs.forEach((g) => {
    const c = P.compare(P.analyze(g.EN.text), P.analyze(g.KR.text));
    assert.ok(c.sameAnswer === true || c.sameAnswer === "partial", g.EN.qid + " " + g.EN.model + " " + c.sameAnswer);
    if (c.sameAnswer === true) same++;
  });
  assert.ok(same >= 115, "same " + same);
});

test("반대말 바꿈: 실제 짝은 하나도 '반대'로 걸지 않고, 같은 언어로 고친 답은 거의 다, 언어가 다른 답은 뚜렷한 것만 잡는다", { skip }, () => {
  const SWAP_KR = [["증가", "감소"], ["늘어", "줄어"], ["높아", "낮아"], ["높은", "낮은"], ["커지", "작아지"], ["큰", "작은"], ["왼쪽", "오른쪽"], ["정반응", "역반응"], ["직렬", "병렬"], ["필요조건", "충분조건"], ["최대", "최소"], ["흡열", "발열"], ["산성", "염기성"], ["상승", "하락"]];
  const SWAP_EN = [["increase", "decrease"], ["higher", "lower"], ["larger", "smaller"], ["left", "right"], ["maximum", "minimum"], ["necessary", "sufficient"], ["endothermic", "exothermic"], ["series", "parallel"]];
  const swap = (t, list) => { let out = t, hits = 0; list.forEach(([x, y]) => { const n = out.split(x).length + out.split(y).length - 2; if (n) { hits += n; out = out.split(x).join("\0").split(y).join(x).split("\0").join(y); } }); return { text: out, hits }; };
  const diff = (x, y) => P.compare(P.analyze(x), P.analyze(y)).sameAnswer === false;
  const g = {};
  ANSWERS.forEach((a) => { (g[a.qid] = g[a.qid] || {})[a.model + a.lang] = a.text; });
  let realBad = 0, cross = 0, crossN = 0, sameKr = 0, sameKrN = 0, sameEn = 0, sameEnN = 0;
  Object.values(g).forEach((v) => {
    ["Opus", "Sonnet"].forEach((m) => {
      const en = v[m + "EN"], kr = v[m + "KR"];
      if (diff(en, kr)) realBad++;
      const sk = swap(kr, SWAP_KR);
      if (sk.hits) { crossN++; sameKrN++; if (diff(en, sk.text)) cross++; if (diff(kr, sk.text)) sameKr++; }
      const se = swap(en, SWAP_EN);
      if (se.hits) { sameEnN++; if (diff(en, se.text)) sameEn++; }
    });
    ["KR", "EN"].forEach((l) => { if (diff(v["Opus" + l], v["Sonnet" + l])) realBad++; });
  });
  assert.equal(realBad, 0, "실제 짝을 '반대'로 건 수");
  assert.equal(sameKr, sameKrN, "같은 언어(한국어)로 고친 답");
  assert.ok(sameEn >= sameEnN - 1, "같은 언어(영어)로 고친 답 " + sameEn + "/" + sameEnN);
  assert.ok(cross >= 9, "언어가 다른 답 " + cross + "/" + crossN);
});

test("근거 기준(60문항): 논문 답 240개 모두 필수 근거를 짚고, 틀린 근거는 흔들린 2개(처음 단정한 답)에서만", { skip }, () => {
  const rows = ANSWERS.filter((a) => window.P2_RUBRIC[a.qid]);
  assert.equal(rows.length, 240);
  const flagged = [];
  rows.forEach((a) => {
    const r = P.checkRubric(a.text, window.P2_RUBRIC[a.qid]);
    assert.equal(r.hit, r.total, a.run);
    if (r.wrong.length) flagged.push(a.run);
  });
  assert.deepEqual(flagged.sort(), ["P2M-02-052", "P2M-02-100"]);
});

test("근거 기준: 질문 글만 넣으면 어느 문항도 통과하지 않고, 다른 문항 답에 대면 '모두 짚음'은 0.5% 이하", { skip }, () => {
  const R = window.P2_RUBRIC;
  ITEMS.forEach((it) => [it.kr, it.en].forEach((q) => {
    const r = P.checkRubric(q, R[it.id]);
    assert.ok(r.hit < r.total && r.wrong.length === 0, it.id);
  }));
  let full = 0, n = 0;
  ANSWERS.forEach((a) => Object.keys(R).forEach((id) => { if (id === a.qid) return; n++; const r = P.checkRubric(a.text, R[id]); if (r.hit === r.total) full++; }));
  assert.ok(full / n <= 0.005, full + "/" + n);
});

test("근거 결과를 반영한 논문 루브릭 점수: 만점 236개는 그대로 100점, 감점 4건은 논문 점수 그대로", { skip }, () => {
  ANSWERS.forEach((a) => {
    const an = P.analyze(a.text), ids = an.signals.map((x) => x.id);
    const s = P.score(ids, false, P.checkRubric(a.text, window.P2_RUBRIC[a.qid])).total;
    assert.equal(s, a.score, a.run);
  });
});
