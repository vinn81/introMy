#!/usr/bin/env python3
"""새 기록을 넣으면 사이트의 숫자 칸과 능력별 문단 후보를 다시 만드는 장치.

- 표준 라이브러리만 사용합니다. AI 호출이 없으므로 같은 입력이면 같은 결과가 나옵니다.
- 사이트에는 approved.json에 적힌(내가 승인한) 문장만 들어갑니다.

사용: python3 renew.py [--input input] [--out out] [--site ../index.html]
"""
import argparse
import csv
import datetime as dt
import hashlib
import html
import json
import re
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
STATUS = {"실천했다": "실천", "일부 실천했다": "일부", "못 했다": "못함"}


def load_ritual(folder):
    """ritual/*.json(리추얼 기록 내보내기)을 날짜 기준으로 합칩니다. 같은 날짜는 파일 이름 순으로 뒤의 것이 이깁니다."""
    days = {}
    for f in sorted(folder.glob("*.json")):
        for d in json.loads(f.read_text(encoding="utf-8")).get("days", []):
            days[d["date"]] = d
    return [days[k] for k in sorted(days)]


def load_csv(path):
    if not path.exists():
        return None
    with path.open(encoding="utf-8-sig", newline="") as fh:
        return [{k.strip(): (v or "").strip() for k, v in r.items()} for r in csv.DictReader(fh)]


def field(lines, name):
    for s in lines or []:
        if s.startswith(name + ":"):
            return s.split(":", 1)[1].strip()
    return None


def week_no(date, start):
    return (dt.date.fromisoformat(date) - start).days // 7 + 1


def ritual_stats(days, cfg):
    start = dt.date.fromisoformat(cfg["course_start"])
    closed = [d for d in days if d.get("close")]
    status = {d["date"]: STATUS.get(field(d["close"], "강점 행동")) for d in closed}
    miss = [k for k, v in status.items() if v == "못함"]
    # 회복: '못 했다' 다음, 다시 '실천했다'가 나온 첫 기록일까지 걸린 달력 일수
    recover = []
    for m in miss:
        nxt = next((k for k in sorted(status) if k > m and status[k] == "실천"), None)
        if nxt:
            recover.append({"miss": m, "back": nxt,
                            "days": (dt.date.fromisoformat(nxt) - dt.date.fromisoformat(m)).days})
    # 연속: '못 했다' 없이 이어진 마감 기록 수의 최댓값
    best = run = 0
    for k in sorted(status):
        run = 0 if status[k] == "못함" else run + 1
        best = max(best, run)
    weeks = sorted({week_no(d["date"], start) for d in days})
    last_week = week_no(days[-1]["date"], start) if days else 0
    thanks = sum(1 for d in closed for s in d["close"] if s.startswith(("내가 나눈 감사:", "감사일기:")))
    return {
        "기록시작": days[0]["date"] if days else None,
        "기록종료": days[-1]["date"] if days else None,
        "기록일": len(days),
        "마감기록일": len(closed),
        "실천일": sum(v == "실천" for v in status.values()),
        "일부실천일": sum(v == "일부" for v in status.values()),
        "미실천일": len(miss),
        "미실천날짜": miss,
        "회복": recover,
        "최장연속": best,
        "기록주": len(weeks),
        "경과주": last_week,
        "전체주": cfg["total_weeks"],
        "감사기록": thanks,
    }


def attendance_stats(rows, summary):
    """「내 출석 기록」: 날짜별 attendance.csv가 있으면 그것을, 없으면 화면 요약 attendance-summary.json을 씁니다.
    출석률은 출석 화면과 같은 식(출석·공가 ÷ 재적일)으로 다시 계산합니다."""
    if rows is not None:
        count = {}
        for r in rows:
            count[r["status"]] = count.get(r["status"], 0) + 1
        a = {"기준일": max(r["date"] for r in rows), "훈련일": len(rows), "재적일": len(rows),
             **{k: count.get(k, 0) for k in ("출석", "지각", "조퇴", "결석", "공가", "확정전")}}
    elif summary is not None:
        a = {"기준일": summary["기준일"], "훈련일": summary["훈련일"], "재적일": summary["재적일"],
             **{k: summary.get(k, 0) for k in ("출석", "지각", "조퇴", "결석", "공가", "확정전")}}
    else:
        return None
    a["확정일"] = a["재적일"] - a["확정전"]
    a["출석률"] = f"{(a['출석'] + a['공가']) / a['재적일'] * 100:.1f}%" if a["재적일"] else None
    return a


def submission_stats(rows):
    """「내 제출 현황」: submissions.csv의 no,title,submitted_on,status."""
    if rows is None:
        return None
    done = [r for r in rows if r["submitted_on"]]
    nos = sorted(r["no"] for r in rows)
    return {"과제": len(rows), "제출": len(done), "최종확인완료": sum(r["status"] == "최종 확인 완료" for r in rows),
            "범위": f"{nos[0]}~{nos[-1]}" if nos else None, "마지막제출": max((r["submitted_on"] for r in done), default=None)}


def candidates(days, cfg):
    out = []
    for name, words in cfg["abilities"].items():
        found = []
        for d in days:
            for fname in cfg["evidence_fields"]:
                text = field(d.get("open"), fname) or field(d.get("close"), fname)
                if not text or "(이름 가림)" in text:
                    continue
                hits = sorted({w for w in words if w in text})
                if hits:
                    found.append((len(hits), d["date"], fname, text, hits))
        found.sort(key=lambda x: (-x[0], x[1], x[2]))
        for score, date, fname, text, hits in found[:cfg["candidates_per_ability"]]:
            cid = hashlib.sha256(f"{name}|{date}|{fname}".encode()).hexdigest()[:8]
            m, dd = int(date[5:7]), int(date[8:10])
            out.append({"id": cid, "ability": name, "date": date, "evidence": f"리추얼 기록 {date} · {fname}",
                        "quote": text, "keywords": hits,
                        "sentence": f"{m}월 {dd}일, 저는 이렇게 적었습니다. “{text.rstrip('.')}.”"})
    return out


def esc(s):
    return html.escape(str(s), quote=True)


def tile(value, label, source, note=""):
    n = f'<span class="tile-note">{esc(note)}</span>' if note else ""
    return (f'<div class="tile"><b>{esc(value)}</b><span class="tile-label">{esc(label)}</span>'
            f'{n}<span class="tile-src">출처: {esc(source)}</span></div>')


def stats_block(r, att, sub, cfg):
    rng = f"{r['기록시작']} ~ {r['기록종료']}"
    t = [
        tile(f"{r['기록주']}주 / {r['전체주']}주", "기록을 남긴 주", "리추얼 기록", f"{rng}, 지금까지 {r['경과주']}주차"),
        tile(f"{r['기록일']}일", "리추얼을 연 날", "리추얼 기록", rng),
        tile(f"{r['실천일'] + r['일부실천일']}일 / {r['마감기록일']}일", "실천 또는 일부 실천",
             "리추얼 기록", f"실천 {r['실천일']} · 일부 {r['일부실천일']} · 못 했다 {r['미실천일']}"),
        tile(f"{r['최장연속']}일", "‘못 했다’ 없이 이어진 최장 기록", "리추얼 기록"),
        tile(f"{r['감사기록']}건", "동료와 나눈 감사 기록", "리추얼 기록"),
    ]
    if att:
        extra = f" · {cfg['attendance_note']}" if cfg.get("attendance_note") and att["결석"] else ""
        t.append(tile(f"{att['출석']}일 / {att['확정일']}일", "확정된 훈련일 중 출석", f"내 출석 기록 ({att['기준일']} 기준)",
                      f"결석 {att['결석']} · 지각 {att['지각']} · 확정 전 {att['확정전']} · 출석률 {att['출석률']}(재적일 {att['재적일']}일 기준){extra}"))
    if sub:
        t.append(tile(f"{sub['최종확인완료']}건 / {sub['제출']}건", "제출 과제 최종 확인 완료", "내 제출 현황",
                      f"{sub['범위']} · 마지막 제출 {sub['마지막제출']}"))
    pair = ""
    if r["미실천날짜"]:
        back = r["회복"][0] if r["회복"] else None
        b = f" {back['days']}일 뒤인 {back['back']}에 다시 ‘실천했다’를 적었습니다." if back else ""
        pair = (f'<p class="pair">마감 기록 {r["마감기록일"]}일 가운데 ‘못 했다’는 {r["미실천일"]}일, '
                f'<a href="{esc(cfg["pair_scene_anchor"])}">{esc(", ".join(r["미실천날짜"]))}</a>입니다. '
                f'이야기의 첫 장면이 그날입니다.{esc(b)}</p>')
    return '<div class="tiles">' + "".join(t) + "</div>\n" + pair


WEEKDAYS = "월화수목금"
CELL = {"실천": ("done", "실천했다"), "일부": ("part", "일부 실천했다"), "못함": ("miss", "못 했다")}


def calendar_block(days, cfg):
    """13주 × 평일 달력. 칸 하나가 하루이고, 마감 기록의 ‘강점 행동’ 상태를 모양과 밝기로 나타냅니다."""
    start = dt.date.fromisoformat(cfg["course_start"])
    by_date = {d["date"]: STATUS.get(field(d.get("close"), "강점 행동")) if d.get("close") else "열기만" for d in days}
    last = dt.date.fromisoformat(days[-1]["date"])
    cols = ['<li class="cal-week cal-days" aria-hidden="true"><span class="cal-wk">주</span><ol>'
            + "".join(f"<li>{d}</li>" for d in WEEKDAYS) + "</ol></li>"]
    for w in range(cfg["total_weeks"]):
        cells = []
        for i in range(5):
            day = start + dt.timedelta(days=w * 7 + i)
            iso = day.isoformat()
            label = f"{day.month}월 {day.day}일({WEEKDAYS[i]})"
            st = by_date.get(iso)
            first = dt.date.fromisoformat(days[0]["date"])
            if day < first:
                cls, tip = "future", f"{label} · 개강 전"
            elif day > last:
                cls, tip = "future", f"{label} · 아직 오지 않은 날"
            elif st in CELL:
                cls, tip = CELL[st][0], f"{label} · {CELL[st][1]}"
            elif st == "열기만":
                cls, tip = "open", f"{label} · 시작 기록만 있음"
            else:
                cls, tip = "none", f"{label} · 기록 없음(휴일 포함)"
            mark = '<span aria-hidden="true">✕</span>' if cls == "miss" else ""
            cells.append(f'<li class="cal-cell {cls}" data-tip="{esc(tip)}" title="{esc(tip)}">{mark}</li>')
        cols.append(f'<li class="cal-week"><span class="cal-wk">{w + 1}</span><ol>{"".join(cells)}</ol></li>')
    legend = ('<ul class="cal-legend">'
              '<li><i class="cal-cell done"></i>실천했다</li><li><i class="cal-cell part"></i>일부 실천했다</li>'
              '<li><i class="cal-cell miss"><span aria-hidden="true">✕</span></i>못 했다</li>'
              '<li><i class="cal-cell none"></i>기록 없음·휴일</li><li><i class="cal-cell future"></i>남은 날</li></ul>')
    return ('<figure class="calendar"><figcaption><strong>13주 리추얼 달력</strong>'
            '<span>칸 하나가 평일 하루입니다. 마감 기록의 ‘강점 행동’을 그대로 칠했습니다.</span></figcaption>'
            '<div class="cal-scroll"><ol class="cal-grid" aria-label="주차별 평일 기록">' + "".join(cols) + "</ol></div>"
            + legend + "</figure>")


def glance_block(r, att, sub):
    """첫 화면의 ‘한눈에 보기’ 카드."""
    rows = [(f"{r['실천일'] + r['일부실천일']}<small>/{r['마감기록일']}일</small>", "실천 또는 일부 실천", "리추얼 기록")]
    if att:
        rows.append((f"{att['출석']}<small>/{att['확정일']}일</small>", "확정된 훈련일 중 출석", "내 출석 기록"))
    if sub:
        rows.append((f"{sub['최종확인완료']}<small>/{sub['제출']}건</small>", "과제 최종 확인 완료", "내 제출 현황"))
    items = "".join(f'<li><b>{v}</b><span>{esc(l)}</span><em>{esc(src)}</em></li>' for v, l, src in rows)
    return (f'<aside class="glance" aria-label="한눈에 보기"><p class="glance-title">13주 중 {r["경과주"]}주차 · 한눈에</p>'
            f'<ul>{items}</ul><a class="glance-link" href="#numbers">기록 자세히 보기</a></aside>')


def para_block(approved, cands):
    by_id = {c["id"]: c for c in cands}
    rows = []
    for a in approved:
        c = by_id.get(a["id"], {})
        text = a.get("text") or c.get("sentence")
        if not text:
            print(f"경고: 승인 목록의 {a['id']}가 후보에 없어 건너뜁니다.", file=sys.stderr)
            continue
        ability = a.get("ability") or c.get("ability", "")
        src = a.get("evidence") or c.get("evidence", "")
        rows.append(f'<li><span class="chip">{esc(ability)}</span> {esc(text)} <small>근거: {esc(src)}</small></li>')
    return '<ul class="approved">' + "".join(rows) + "</ul>"


def replace_block(page, name, body):
    pat = re.compile(rf"(<!-- renew:{name} -->)(.*?)(<!-- /renew:{name} -->)", re.S)
    if not pat.search(page):
        raise SystemExit(f"사이트 파일에 <!-- renew:{name} --> 표시가 없습니다.")
    return pat.sub(lambda m: m.group(1) + "\n" + body + "\n" + m.group(3), page)


def write(path, text):
    path.write_text(text, encoding="utf-8", newline="\n")
    return hashlib.sha256(text.encode()).hexdigest()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--input", default=str(HERE / "input"))
    ap.add_argument("--out", default=str(HERE / "out"))
    ap.add_argument("--site", default=None, help="숫자 칸과 승인 문단을 바꿔 넣을 index.html")
    a = ap.parse_args()
    inp, out = Path(a.input), Path(a.out)
    cfg = json.loads((HERE / "config.json").read_text(encoding="utf-8"))
    approved = json.loads((HERE / "approved.json").read_text(encoding="utf-8"))

    days = load_ritual(inp / "ritual")
    if not days:
        raise SystemExit("input/ritual/ 폴더에 리추얼 기록 JSON이 없습니다.")
    r = ritual_stats(days, cfg)
    summary = inp / "attendance-summary.json"
    att = attendance_stats(load_csv(inp / "attendance.csv"),
                           json.loads(summary.read_text(encoding="utf-8")) if summary.exists() else None)
    sub = submission_stats(load_csv(inp / "submissions.csv"))
    cands = candidates(days, cfg)

    out.mkdir(parents=True, exist_ok=True)
    stats = {"리추얼 기록": r, "내 출석 기록": att, "내 제출 현황": sub}
    md = ["# 능력별 문단 후보", "", "마음에 드는 후보의 id를 approved.json에 옮기면 사이트에 들어갑니다.", ""]
    for name in cfg["abilities"]:
        md += [f"## {name}", ""]
        md += [f"- `{c['id']}` {c['date']} — {c['quote']}  \n  근거: {c['evidence']} · 키워드: {', '.join(c['keywords'])}"
               for c in cands if c["ability"] == name]
        md.append("")
    block_stats = stats_block(r, att, sub, cfg) + "\n" + calendar_block(days, cfg)
    block_glance = glance_block(r, att, sub)
    block_para = para_block(approved, cands)
    digests = {
        "stats.json": write(out / "stats.json", json.dumps(stats, ensure_ascii=False, indent=2, sort_keys=True) + "\n"),
        "candidates.json": write(out / "candidates.json", json.dumps(cands, ensure_ascii=False, indent=2) + "\n"),
        "candidates.md": write(out / "candidates.md", "\n".join(md)),
        "site-block.html": write(out / "site-block.html", block_glance + "\n" + block_stats + "\n" + block_para + "\n"),
    }
    if a.site:
        site = Path(a.site)
        page = replace_block(site.read_text(encoding="utf-8"), "stats", block_stats)
        page = replace_block(page, "paragraphs", block_para)
        page = replace_block(page, "glance", block_glance)
        write(site, page)
        print(f"사이트 갱신: {site}")
    for k, v in digests.items():
        print(f"{v}  {k}")
    if att is None or sub is None:
        print("알림: 출석 또는 제출 입력이 없어 해당 숫자 칸은 넣지 않았습니다.", file=sys.stderr)


if __name__ == "__main__":
    main()
