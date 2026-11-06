"""지원 서류(이력서·자기소개서·경력기술서)를 works/application.docx와 .pdf로 다시 만듭니다.

기존 application.docx의 스타일·글꼴·여백은 그대로 두고 본문(word/document.xml)만 아래 내용으로 바꿉니다.
PDF는 이 PC에 설치된 Microsoft Word로 변환합니다(Windows 전용).

    python scripts/build_application.py           # DOCX와 PDF
    python scripts/build_application.py --no-pdf  # DOCX만
"""
import argparse
import re
import subprocess
import sys
import zipfile
from pathlib import Path
from xml.sax.saxutils import escape

ROOT = Path(__file__).resolve().parent.parent
DOCX = ROOT / "works" / "application.docx"
PDF = ROOT / "works" / "application.pdf"

# ───────── 내용 ─────────

PROFILE = [
    ("이름", "김가빈"),
    ("연락", "github.com/vinn81"),
    ("포트폴리오", "https://intro-my-nine.vercel.app/"),
    ("지원 분야", "네트워크 · 시스템 보안"),
    ("학력", "컴퓨터공학 전공 (학교명은 공개하지 않음)"),
    ("자격", "정보처리기사 · 리눅스마스터 2급 준비 중"),
    ("교육", "SKT ALEPH AI 보안·인프라 과정 · 2026.08 ~ 2026.11 (13주)"),
    ("출석", "확정된 훈련일 38일 중 37일 출석, 결석 1일 (2026-10-08 기준, 내 출석 기록)"),
]

WORKS = [
    ("2026.09", "Half-Security Labs (개인)",
     "VLAN 3개·Cisco ASAv로 망 분리, Snort 3 룰 3/3 실탐지, Wazuh Agent 4/4 Active·24시간 이벤트 384건, 결과보고서 9쪽"),
    ("2026.09", "보안 솔루션 확장 Lab (팀)",
     "내 Zabbix 서버를 팀 Wazuh 서버에 연동해 네 명의 로그를 한 화면에 모으고 결과보고서 작성"),
    ("과정 중", "System Security Lab (팀)",
     "4명 팀의 리눅스 서버 취약점 점검 스크립트 초안 작성"),
    ("2026.10", "보안 Agent 「헤임달」 (방어전)",
     "제로 트러스트 접근 판정·XDR 경보 화면, 13~22단계 코드 검토 10/10 통과, 내 PC 실측 6/6"),
    ("2026.10", "P2-Bench 논문 · 답 흔들림 점검기",
     "다국어 LLM 추론 안정성 비교(응답 240개)와 그 결과를 판정 규칙으로 옮긴 웹 앱"),
    ("2026.10", "CTF 문제 머신 제작", "문제 머신 제작과 동료 테스트"),
    ("2026.08 ~ 2026.09", "개인 소개 사이트 · 패스키 개인 공간",
     "Vercel Functions · Neon PostgreSQL · WebAuthn, 무인증 비공개 API 요청이 401로 거절되는 것 확인"),
]

TOOLS = [
    "네트워크 · 경계: GNS3 · VLAN · Cisco ASAv · ACL · pfSense OpenVPN",
    "탐지 · 관제: Snort 3 · Wazuh · OSSEC · Zabbix · PMM · rsyslog · LogAnalyzer",
    "서버 · 검증: Ubuntu · Rocky Linux · MariaDB · Kali (ping · nmap) · Earth CTF · Shell Script",
    "웹 · 인증: HTML · CSS · JavaScript · Vercel Functions · Neon PostgreSQL · WebAuthn",
]

# 사이트 ‘나에 대해’의 이야기와 같은 문장
STORY_TITLE = "두 번 사라진 화면, 그다음 날들"
STORY = [
    ("2026년 9월 7일 · 무너진 날", [
        "2026년 9월 7일, 공들여 정리해 둔 네트워크 토폴로지가 제 화면에서 두 번 사라졌습니다. GNS3 실습 중 pfSense 관련 메모리 오류로 파일이 손상되고 초기화된 것입니다. 첫 번째에는 다시 하면 된다고 생각했지만, 두 번째에는 표정을 관리하지 못했습니다. 그날 마감 기록의 ‘강점 행동’ 칸에는 ‘못 했다’라고 적었습니다. ‘일부’라는 말로 줄이지 않았습니다. 8월 11일부터 남긴 마감 기록 37일 가운데 ‘못 했다’는 그날 하루뿐입니다.",
    ]),
    ("2026년 9월 9일 · 다시 일어난 날", [
        "이틀 뒤인 9월 9일, 모르는 내용을 검색으로 하나씩 찾아 이어 갔습니다. 실패를 덮으려고 서둘러 답을 붙잡기보다 지금 필요한 설명이 무엇인지 보려 했습니다. 그날 한 동료는 제가 “본인 과제가 아님에도 타인의 과제를 적극적으로 도와준다”고 적어 주었습니다. 표정을 관리하지 못한 사람과 다른 사람의 화면을 함께 들여다본 사람은 이틀 차이의 같은 사람이었습니다.",
        "9월 11일에는 반대로 어디까지 했고 무엇을 모르는지 그대로 말해 도움을 청했고, 9월 14일부터 “여유를 갖되 실수가 많아지지 않도록” 하자는 목표를 세웠습니다.",
        "몸이 아파 수업을 빠진 뒤 9월 21일 돌아와 지난 내용을 따라갔고, 9월 22일 VLAN 오류를 “왜 안 되는지, 어떻게 해결할지”로 나눠 다시 본 끝에 9월 23일 GNS3 개인 과제를 마무리했습니다.",
    ]),
    ("2026년 10월 7일 · 더 나아진 지금", [
        "지금 저는 도움을 받던 자리에서 건네는 자리로 옮겨 가고 있습니다. 10월 7일에는 CTF 문제 머신을 직접 만들었고, 동료 테스트에서 나온 오류를 감추지 않고 “내일 해결해 보자”고 적었습니다. 같은 날 과제 진행이 느린 동료를 응원했고, 하루 전에는 감정적으로 내린 판단으로 실수한 일을 바로 인정하고 사과했습니다.",
        "저는 실패하지 않는 사람이 아닙니다. 실패한 날을 그대로 적고, 다음 날 다시 화면을 켜고, 옆 사람의 화면도 함께 들여다보는 사람입니다. 함께 일하게 된다면, 막히는 날에도 그렇게 하겠습니다.",
    ]),
]

CAREER_INTRO = ("정식 고용 경력은 없습니다. 아래는 교육 과정의 과제 수행 경험이며, 과제 하나당 한 줄로 "
                "역할과 상황·행동·결과를 적었습니다. 근거는 결과보고서·제출 기록·리추얼 기록(날짜)입니다.")
CAREER = [
    (("Half-Security Labs", "2026-09-07 ~ 09-23"), "개인",
     "네트워크 분리부터 탐지·관제까지 혼자 구축·검증해야 함. 9월 7일 pfSense 메모리 오류로 실습 파일이 두 번 손상됨",
     "VLAN 3개와 ASAv로 Inside·DMZ·Outside 분리, Snort 3 룰 3개 작성, Wazuh·OSSEC·Zabbix·PMM 연동. VLAN 인터페이스가 안 올라올 때 원인을 설정·환경으로 나눠 show vlan brief 등으로 단계별 점검. rsyslog·OpenVPN 인증서·Wazuh/OSSEC 경로 충돌을 재설치 없이 해결",
     "Snort 룰 3/3 실탐지, Wazuh Agent 4/4·24시간 이벤트 384건, VLAN 간 ping 성공, 결과보고서 9쪽"),
    (("보안 솔루션 확장 Lab", "2026-09-09 ~ 09-29"), "팀원 (4명)",
     "네 명의 환경 로그를 Wazuh 한 화면에 모아야 함. 9월 11일 결과 기준을 모른 채 진행해 시간을 잃음",
     "어디까지 했고 무엇을 모르는지 말해 도움을 청함. 내 Zabbix 서버를 팀 Wazuh 서버에 클라이언트로 등록하고, 막힌 팀원에게 상황별 명령 정리 자료 공유",
     "9월 29일 동료와 Wazuh 오류 해결, 네 명의 로그 통합과 결과보고서 작성"),
    (("System Security Lab", "과정 중"), "팀원 (4명)",
     "리눅스 서버 취약점 점검 스크립트를 4명이 함께 만들어야 함",
     "실습에서 확인한 내용을 근거로 제안하고 스크립트 초안 작성, 명령어 정리 자료 공유",
     "동료들이 출력 형식·테스트·오류 수정을 맡아 점검 스크립트 완성"),
    (("보안 Agent 「헤임달」", "2026-10 (방어전)"), "개인",
     "제로 트러스트 보안 Agent의 화면을 단계별 코드 검토로 통과해야 함. 실제 SDP 서버 연결은 인증서 발급 대상이 아님",
     "화면 함수 8개 구현(student/extension.mjs). 기기 상태를 확인할 수 없으면 정상으로 보지 않고 접근 거부와 이유를 표시. 내 PC 실측값을 Windows 기본 도구와 대조",
     "13~22단계 10/10 통과, 내 PC 실측 6/6"),
    (("P2-Bench 논문 · 앱", "~ 2026-10-29"), "개인",
     "3개 모델 설계에서 플랫폼 개인화·출력 언어 통제 문제로 교란 가능성 발견",
     "Claude 패밀리 2개 모델 × 2개 언어 × 60문항으로 설계를 좁히고 고정 seed로 층화표본 재검토. 논문의 루브릭을 판정 규칙으로 옮긴 웹 앱 제작",
     "응답 240개 분석한 최종본(2026-10-06). 앱은 다른 문항과 짝지은 검사에서 오통과 30건 → 1건"),
    (("CTF 문제 머신 제작", "2026-10-07"), "개인",
     "직접 만든 CTF 머신이 동료 테스트에서 오류를 냄",
     "오류를 감추지 않고 기록, 동료와 함께 원인을 찾음",
     "테스트로 드러난 오류를 다음 날 해결할 목록으로 정리"),
    (("개인 소개 사이트 · 패스키 개인 공간", "2026-08 ~ 09-16"), "개인",
     "공개 소개와 비공개 자료를 같은 사이트에서 안전하게 나눠야 함",
     "Vercel Functions, Neon PostgreSQL, WebAuthn으로 패스키 로그인과 서버 측 인가를 구현",
     "운영 배포 후 무인증 /api/private 요청이 401로 거절되는 것을 확인"),
]

SOURCES = [
    ("이야기의 장면과 날짜, 숫자", "본인 리추얼 기록 (2026-08-11 ~ 2026-10-08), 갱신 장치 renew/out/stats.json"),
    ("Half-Security Labs", "사이트 works/half-security-labs.pdf (결과보고서 9쪽)"),
    ("보안 Agent 「헤임달」", "사이트 defense/ 페이지 · github.com/vinn81/zero-trust-security-agent"),
    ("논문 · 앱", "사이트 works/paper.pdf (2026-10-06 최종본) · app/"),
    ("사이트 · 패스키 과제", "github.com/vinn81/introMy 의 SUBMISSION.md · AUTH_IMPLEMENTATION.md"),
    ("출석 · 제출", "내 출석 기록 화면 요약(2026-10-08), 내 제출 현황 T01~T11 최종 확인 완료"),
]

# ───────── Word XML (기존 문서와 같은 꼴) ─────────

TBL_PR = ('<w:tblPr><w:tblStyle w:val="TableGrid"/><w:tblW w:type="auto" w:w="0"/><w:tblLayout w:type="fixed"/>'
          '<w:tblLook w:firstColumn="1" w:firstRow="1" w:lastColumn="0" w:lastRow="0" w:noHBand="0" w:noVBand="1" w:val="04A0"/></w:tblPr>')


def run_text(text):
    if isinstance(text, tuple):  # 셀 안 줄바꿈
        return "<w:br/>".join(f"<w:t>{escape(t)}</w:t>" for t in text)
    return f'<w:t xml:space="preserve">{escape(text)}</w:t>'


def para(text, style=None, bold=False):
    ppr = f'<w:pPr><w:pStyle w:val="{style}"/></w:pPr>' if style else ""
    rpr = "<w:rPr><w:b/></w:rPr>" if bold else ""
    return f"<w:p>{ppr}<w:r>{rpr}{run_text(text)}</w:r></w:p>"


def page_break():
    return '<w:p><w:r><w:br w:type="page"/></w:r></w:p>'


def cell(text, width, bold=False):
    b = "<w:b/>" if bold else ""
    return (f'<w:tc><w:tcPr><w:tcW w:type="dxa" w:w="{width}"/></w:tcPr>'
            f'<w:p><w:r/><w:r><w:rPr>{b}<w:sz w:val="19"/></w:rPr>{run_text(text)}</w:r></w:p></w:tc>')


def table(widths, rows, header=None):
    grid = "".join(f'<w:gridCol w:w="{w}"/>' for w in widths)
    out = [f"<w:tbl>{TBL_PR}<w:tblGrid>{grid}</w:tblGrid>"]
    if header:
        out.append("<w:tr>" + "".join(cell(h, w, True) for h, w in zip(header, widths)) + "</w:tr>")
    for r in rows:
        out.append("<w:tr>" + "".join(cell(c, w) for c, w in zip(r, widths)) + "</w:tr>")
    out.append("</w:tbl>")
    return "".join(out)


def body_xml():
    b = [para("이력서", "Title"), table([1984, 7370], PROFILE),
         para("대표 작업", "Heading1"), table([1984, 2835, 4535], WORKS, ("기간", "작업", "한 줄 설명")),
         para("결과로 확인한 도구", "Heading1")]
    b += [para(t) for t in TOOLS]
    b += [page_break(), para("자기소개서", "Title"), para(STORY_TITLE, bold=True)]
    for head, paras in STORY:
        b.append(para(head, "Heading2"))
        b += [para(p) for p in paras]
    b += [page_break(), para("경력기술서", "Title"), para(CAREER_INTRO),
          table([1928, 1134, 2098, 2268, 1928], CAREER, ("과제 · 기간", "역할", "상황", "행동", "결과")),
          para("근거와 출처", "Heading1"), table([2835, 6520], SOURCES, ("내용", "출처"))]
    return "".join(b)


def build_docx():
    with zipfile.ZipFile(DOCX) as z:
        parts = {n: z.read(n) for n in z.namelist()}
        infos = {n: z.getinfo(n) for n in z.namelist()}
    doc = parts["word/document.xml"].decode("utf-8")
    head = doc[: doc.index("<w:body>") + len("<w:body>")]
    sect = re.search(r"<w:sectPr\b.*?</w:sectPr>", doc, re.S).group(0)
    parts["word/document.xml"] = (head + body_xml() + sect + "</w:body></w:document>").encode("utf-8")
    tmp = DOCX.with_suffix(".tmp.docx")
    with zipfile.ZipFile(tmp, "w", zipfile.ZIP_DEFLATED) as z:
        for name, data in parts.items():
            z.writestr(infos[name], data)
    tmp.replace(DOCX)
    print(f"DOCX: {DOCX}")


def build_pdf():
    ps = (
        "$w = New-Object -ComObject Word.Application; $w.Visible = $false; "
        f"$d = $w.Documents.Open('{DOCX}', $false, $true); "
        f"$d.ExportAsFixedFormat('{PDF}', 17); $d.Close($false); $w.Quit()"
    )
    subprocess.run(["powershell", "-NoProfile", "-Command", ps], check=True)
    print(f"PDF: {PDF}")


def main():
    a = argparse.ArgumentParser()
    a.add_argument("--no-pdf", action="store_true")
    args = a.parse_args()
    build_docx()
    if not args.no_pdf:
        build_pdf()


if __name__ == "__main__":
    sys.exit(main())
