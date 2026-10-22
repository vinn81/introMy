#!/usr/bin/env python3
"""Labs 섹션의 실습 구성도(assets/labs/*.svg)를 그린다.

과제 안내도 원본을 그대로 올리지 않고, 노드·링크 구성만 옮겨 사이트 색으로 다시 그린다.
비밀번호·계정 같은 값은 넣지 않는다. 실행: python3 scripts/draw_labs.py
"""
import math
from pathlib import Path
from xml.sax.saxutils import escape

INK = "#2a1d14"
MUTED = "#6e5d50"
LINE = "#b9a594"
ORANGE = "#f5741f"
DEEP = "#e8461c"
RED = "#ff3d20"
AMBER = "#f0a81e"
PAPER = "#fffaf4"
FONT = "'Noto Sans KR','Apple SD Gothic Neo','Malgun Gothic',sans-serif"

OUT = Path(__file__).resolve().parent.parent / "assets" / "labs"

# 노드 모양: (x, y)를 가운데로 그리고, 이름표를 놓을 아래쪽 여백을 돌려준다
def icon(kind, x, y):
    s = []
    if kind == "router":
        s.append(f'<circle cx="{x}" cy="{y}" r="22" fill="{INK}"/>')
        s.append(f'<g stroke="#fff" stroke-width="2.4" stroke-linecap="round" fill="none">'
                 f'<path d="M{x-9} {y-9} L{x+9} {y+9} M{x+9} {y-9} L{x-9} {y+9}"/>'
                 f'<path d="M{x+3} {y-9} H{x+9} V{y-3} M{x-3} {y+9} H{x-9} V{y+3}"/></g>')
        s.append(f'<circle cx="{x}" cy="{y}" r="22" fill="none" stroke="{ORANGE}" stroke-width="2" stroke-dasharray="3 4"/>')
        return "".join(s), 22
    if kind == "switch":
        s.append(f'<rect x="{x-32}" y="{y-12}" width="64" height="24" rx="5" fill="{INK}"/>')
        for i in range(6):
            s.append(f'<rect x="{x-24+i*8.6:.1f}" y="{y-3}" width="5" height="6" rx="1" fill="{AMBER}"/>')
        return "".join(s), 12
    if kind == "l3":
        s.append(f'<rect x="{x-20}" y="{y-20}" width="40" height="40" rx="8" fill="{INK}"/>')
        s.append(f'<text x="{x}" y="{y+5}" text-anchor="middle" font-size="14" font-weight="800" fill="{AMBER}">L3</text>')
        return "".join(s), 20
    if kind == "firewall":
        s.append(f'<rect x="{x-30}" y="{y-20}" width="60" height="40" rx="5" fill="{DEEP}"/>')
        s.append(f'<g stroke="#ffd9c7" stroke-width="1.6"><path d="M{x-30} {y-7} H{x+30} M{x-30} {y+7} H{x+30}"/>'
                 f'<path d="M{x-10} {y-20} V{y-7} M{x+12} {y-20} V{y-7} M{x} {y-7} V{y+7} M{x-20} {y-7} V{y+7} M{x+20} {y-7} V{y+7} M{x-10} {y+7} V{y+20} M{x+12} {y+7} V{y+20}"/></g>')
        return "".join(s), 20
    if kind == "ids":
        s.append(f'<path d="M{x} {y-24} L{x+21} {y-15} V{y+2} C{x+21} {y+14} {x+11} {y+21} {x} {y+25} C{x-11} {y+21} {x-21} {y+14} {x-21} {y+2} V{y-15} Z" fill="{ORANGE}"/>')
        s.append(f'<path d="M{x-8} {y} L{x-2} {y+7} L{x+9} {y-6}" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>')
        return "".join(s), 25
    if kind == "server":
        s.append(f'<rect x="{x-17}" y="{y-24}" width="34" height="48" rx="5" fill="{INK}"/>')
        for i in range(3):
            s.append(f'<rect x="{x-10}" y="{y-15+i*11}" width="20" height="3.5" rx="1.5" fill="{AMBER}"/>')
        s.append(f'<circle cx="{x+8}" cy="{y+17}" r="2.4" fill="{ORANGE}"/>')
        return "".join(s), 24
    if kind == "pc":
        s.append(f'<rect x="{x-22}" y="{y-18}" width="44" height="30" rx="4" fill="{INK}"/>')
        s.append(f'<rect x="{x-17}" y="{y-13}" width="34" height="20" rx="2" fill="{ORANGE}" opacity=".85"/>')
        s.append(f'<rect x="{x-4}" y="{y+12}" width="8" height="6" fill="{INK}"/><rect x="{x-13}" y="{y+17}" width="26" height="4" rx="2" fill="{INK}"/>')
        return "".join(s), 21
    if kind == "laptop":
        s.append(f'<rect x="{x-26}" y="{y-20}" width="52" height="34" rx="4" fill="{INK}"/>')
        s.append(f'<rect x="{x-21}" y="{y-15}" width="42" height="24" rx="2" fill="{ORANGE}" opacity=".85"/>')
        s.append(f'<path d="M{x-34} {y+14} H{x+34} L{x+28} {y+22} H{x-28} Z" fill="{INK}"/>')
        return "".join(s), 22
    if kind == "web":
        s.append(f'<circle cx="{x}" cy="{y}" r="21" fill="#fff" stroke="{INK}" stroke-width="2.4"/>')
        s.append(f'<g fill="none" stroke="{ORANGE}" stroke-width="1.8"><ellipse cx="{x}" cy="{y}" rx="9" ry="21"/>'
                 f'<path d="M{x-21} {y} H{x+21} M{x-18} {y-10} H{x+18} M{x-18} {y+10} H{x+18}"/></g>')
        return "".join(s), 21
    if kind == "attacker":
        s.append(f'<circle cx="{x}" cy="{y}" r="21" fill="{RED}"/>')
        s.append(f'<path d="M{x-11} {y-1} C{x-11} {y-14} {x+11} {y-14} {x+11} {y-1} C{x+11} {y+5} {x+6} {y+6} {x+6} {y+10} H{x-6} C{x-6} {y+6} {x-11} {y+5} {x-11} {y-1} Z" fill="#fff"/>')
        s.append(f'<circle cx="{x-4.5}" cy="{y-2}" r="2.8" fill="{RED}"/><circle cx="{x+4.5}" cy="{y-2}" r="2.8" fill="{RED}"/>')
        return "".join(s), 21
    if kind == "bug":
        s.append(f'<g stroke="{INK}" stroke-width="2.2" stroke-linecap="round"><path d="M{x-18} {y-8} L{x-8} {y-3} M{x-19} {y+4} H{x-9} M{x-17} {y+15} L{x-8} {y+9} M{x+18} {y-8} L{x+8} {y-3} M{x+19} {y+4} H{x+9} M{x+17} {y+15} L{x+8} {y+9}"/></g>')
        s.append(f'<ellipse cx="{x}" cy="{y+4}" rx="10" ry="14" fill="{DEEP}"/><circle cx="{x}" cy="{y-12}" r="6" fill="{INK}"/>')
        return "".join(s), 19
    raise ValueError(kind)


LINK_STYLE = {
    "eth": f'stroke="{LINE}" stroke-width="2.4"',
    "serial": f'stroke="{ORANGE}" stroke-width="3.2"',
    "vpn": f'stroke="{RED}" stroke-width="2.6" stroke-dasharray="7 6"',
    "dash": f'stroke="{MUTED}" stroke-width="1.8" stroke-dasharray="4 5"',
    "attack": f'stroke="{RED}" stroke-width="3" marker-end="url(#arrow)"',
    "both": f'stroke="{MUTED}" stroke-width="2" marker-end="url(#arrow-m)" marker-start="url(#arrow-ms)"',
}


def text(x, y, value, size=14, weight=600, color=INK, anchor="middle", halo=PAPER):
    h = f' paint-order="stroke" stroke="{halo}" stroke-width="5" stroke-linejoin="round"' if halo else ""
    return (f'<text x="{x}" y="{y}" text-anchor="{anchor}" font-size="{size}" font-weight="{weight}" '
            f'fill="{color}"{h}>{escape(value)}</text>')


def diagram(name, width, height, title, zones, nodes, links, notes=()):
    out = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" width="{width}" height="{height}" '
           f'font-family="{FONT}" role="img" aria-label="{escape(title)}">',
           f'<title>{escape(title)}</title>',
           '<defs>'
           f'<marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 Z" fill="{RED}"/></marker>'
           f'<marker id="arrow-m" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 L10 5 L0 10 Z" fill="{MUTED}"/></marker>'
           f'<marker id="arrow-ms" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 Z" fill="{MUTED}"/></marker>'
           '</defs>']
    for z in zones:
        x, y, w, h, label, tone = z
        fill, stroke = {"warm": ("#fdebd3", AMBER), "hot": ("#fde0d6", RED), "soft": ("#f6eee6", LINE)}[tone]
        out.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="20" fill="{fill}" stroke="{stroke}" stroke-width="1.6" stroke-dasharray="6 6"/>')
        out.append(text(x + 18, y + 26, label, 14, 800, DEEP, "start", halo=fill))
    pos = {k: (v[1], v[2]) for k, v in nodes.items()}
    labelled = {k for k, v in nodes.items() if len(v) > 3 and v[3]}
    for a, b, kind, *label in links:
        (x1, y1), (x2, y2) = pos[a], pos[b]
        if kind not in ("eth", "serial"):
            # 화살표·점선 끝이 아이콘과 그 아래 이름표에 묻히지 않게 양 끝을 줄인다
            d = math.hypot(x2 - x1, y2 - y1) or 1
            ux, uy = (x2 - x1) / d, (y2 - y1) / d
            s1 = 30 + (44 if a in labelled and uy > 0.45 else 0)
            s2 = 32 + (44 if b in labelled and uy < -0.45 else 0)
            x1, y1 = x1 + ux * s1, y1 + uy * s1
            x2, y2 = x2 - ux * s2, y2 - uy * s2
        out.append(f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" {LINK_STYLE[kind]} fill="none"/>')
        if label:
            lx, ly = (x1 + x2) / 2, (y1 + y2) / 2
            dx, dy = (label[1] if len(label) > 1 else (0, -8))
            color = DEEP if kind in ("vpn", "attack") else MUTED
            out.append(text(lx + dx, ly + dy, label[0], 12.5, 700, color))
    for key, (kind, x, y, *lab) in nodes.items():
        svg, half = icon(kind, x, y)
        out.append(svg)
        if lab:
            out.append(text(x, y + half + 19, lab[0], 14, 700))
            if len(lab) > 1 and lab[1]:
                out.append(text(x, y + half + 36, lab[1], 12, 500, MUTED))
    for x, y, value, *opt in notes:
        size = opt[0] if opt else 13
        out.append(text(x, y, value, size, 700, DEEP, "start"))
    out.append("</svg>")
    (OUT / f"{name}.svg").write_text("\n".join(out), encoding="utf-8")


def main():
    OUT.mkdir(parents=True, exist_ok=True)

    # 1. 네트워크 보안 기초 통합 Lab
    diagram("network-basic", 1200, 690, "네트워크 보안 기초 통합 Lab 구성도",
        zones=[(20, 40, 600, 610, "EIGRP AS 100", "warm"),
               (650, 40, 530, 200, "OSPF Area 0", "soft"),
               (650, 260, 370, 410, "본사 192.168.200.0/24", "hot"),
               (1040, 260, 140, 410, "지사", "warm")],
        nodes={
            "G": ("pc", 70, 160, "G"),
            "L3": ("l3", 190, 120, "L3 스위치"),
            "SW50": ("switch", 120, 300, "192.168.50.0/24"),
            "RA": ("router", 340, 220, "R1", "HSRP"),
            "RB": ("router", 470, 470, "R2", "HSRP"),
            "SW100": ("switch", 290, 420, ""),
            "A": ("pc", 180, 540, "A"),
            "AS": ("server", 330, 560, "A-S"),
            "RC": ("router", 560, 160, "R3"),
            "RHQ": ("router", 720, 330, "본사 R"),
            "RO": ("router", 760, 130, "R4"),
            "RBR": ("router", 1000, 130, "지사 R", "DHCP · NAT"),
            "SWBR": ("switch", 1100, 340, "172.30.100.0/24"),
            "CS": ("server", 1080, 470, "C-S", "Static NAT 5.5.5.5"),
            "F": ("pc", 1110, 590, "F"),
            "SWH1": ("switch", 730, 470, ""),
            "B": ("pc", 690, 590, "B", "VLAN 20"),
            "BS": ("server", 800, 590, "B-S", "VLAN 30"),
            "SWH2": ("switch", 910, 420, ""),
            "C": ("pc", 960, 530, "C", "VLAN 10"),
            "D": ("pc", 990, 330, "D", "VLAN 20"),
            "E": ("pc", 860, 330, "E", "VLAN 30"),
        },
        links=[("G", "SW50", "eth"), ("SW50", "L3", "eth"), ("L3", "RA", "eth", "6.6.6.0/24"),
               ("RA", "RC", "serial", "1.1.1.0/24"), ("RB", "RC", "serial", "2.2.2.0/24", (24, 0)),
               ("RA", "SW100", "eth"), ("RB", "SW100", "eth", "192.168.100.0/24", (0, 22)),
               ("SW100", "A", "eth"), ("SW100", "AS", "eth"),
               ("RC", "RHQ", "serial", "3.3.3.0/24", (-34, 14)), ("RHQ", "RO", "serial", "4.4.4.0/24", (44, 4)),
               ("RO", "RBR", "serial", "5.5.5.0/24"), ("RBR", "SWBR", "eth"), ("SWBR", "CS", "eth"), ("SWBR", "F", "eth"),
               ("RHQ", "SWH1", "eth"), ("SWH1", "B", "eth"), ("SWH1", "BS", "eth"), ("SWH1", "SWH2", "eth"),
               ("SWH2", "C", "eth"), ("SWH2", "D", "eth"), ("SWH2", "E", "eth"),
               ("RHQ", "RBR", "vpn", "Site-to-Site VPN", (30, 24))],
        notes=[(40, 676, "ACL: A→C-S FTP 차단 · G→C-S WEB 차단 · D→F Ping 차단 · 그 외 허용", 13)])

    # 2. Server Lab
    diagram("server", 1200, 620, "Server Lab 구성도",
        zones=[(20, 150, 300, 300, "Host · Windows 11", "warm"),
               (380, 40, 800, 560, "Guest · Rocky Linux", "soft")],
        nodes={
            "HOST": ("laptop", 170, 290, "Windows 11", "Samba Client"),
            "DNS": ("server", 780, 120, "DNS", "Name Server"),
            "WEB": ("server", 540, 420, "Web / DB", "Loganalyzer · Samba Server"),
            "NFS": ("server", 800, 470, "NFS Server", "Log Client"),
            "FTP": ("server", 1040, 300, "FTP Server", "NFS Client"),
        },
        links=[("HOST", "WEB", "both", "Samba 공유", (0, 22)), ("HOST", "FTP", "both", "HTTPS · SFTP · FTP (도메인)", (0, -14)),
               ("NFS", "FTP", "dash", "NFS", (16, 6)), ("NFS", "WEB", "dash", "로그 전송", (0, -10)),
               ("DNS", "WEB", "dash"), ("DNS", "FTP", "dash"), ("DNS", "NFS", "dash")],
        notes=[(400, 590, "도메인으로 접속 · Loganalyzer에서 로그 확인 · 작업 내용을 웹페이지로 게시", 13)])

    # 3. DB 서버 Lab
    diagram("db", 1200, 560, "DB 서버 Lab 구성도",
        zones=[(20, 40, 700, 490, "DB 모니터링 · Web 연동", "soft"),
               (760, 40, 420, 490, "2인 팀", "warm")],
        nodes={
            "PMM": ("server", 370, 120, "PMM Server", "DB 모니터링"),
            "DB": ("server", 160, 380, "DB Server", "PMM Client"),
            "WEB": ("server", 580, 380, "Web Server", "PMM Client"),
            "SITE": ("web", 970, 220, "팀 웹사이트", "게시판 · 로그인 · 회원가입"),
            "TDB": ("server", 970, 420, "팀 DB", "팀원만 접속"),
        },
        links=[("PMM", "DB", "both"), ("PMM", "WEB", "both"), ("DB", "WEB", "both", "연동", (0, -12)),
               ("SITE", "TDB", "eth")],
        notes=[(40, 520, "SQL: 테이블 필드 추가 · 합계·평균 · 사용자별 권한", 13)])

    # 4. 보안 솔루션 Lab
    diagram("security-solution", 1200, 700, "보안 솔루션 Lab 구성도",
        zones=[(20, 40, 470, 640, "inside", "warm"),
               (690, 40, 490, 230, "DMZ", "soft"),
               (560, 300, 620, 380, "outside", "hot")],
        nodes={
            "FW": ("firewall", 580, 150, "ASAv 방화벽"),
            "R1": ("router", 380, 270, "R1"),
            "SW1": ("switch", 200, 200, "10.10.30.0/24"),
            "WEB3": ("web", 90, 110, "web3"),
            "R2": ("router", 380, 480, "R2"),
            "SW2": ("switch", 230, 560, "10.10.20.0/24"),
            "WEB1": ("web", 90, 470, "web1"),
            "PC1": ("pc", 100, 620, "PC1"),
            "SW4": ("switch", 850, 150, "3.3.3.0/24"),
            "WEB2": ("web", 1000, 90, "web2"),
            "PC2": ("pc", 1060, 190, "PC2"),
            "R3": ("router", 680, 380, "R3"),
            "R4": ("router", 680, 570, "R4"),
            "SW3": ("switch", 860, 600, "192.168.150.0/24"),
            "VPN": ("server", 1010, 420, "pfSense", "VPN 서버 (팀)"),
            "NMS": ("server", 1110, 560, "Zabbix", "NMS 서버 (팀)"),
        },
        links=[("FW", "R1", "eth", "1.1.1.0/24", (-46, 0)), ("R1", "SW1", "eth"), ("SW1", "WEB3", "eth"),
               ("R1", "R2", "serial", "10.10.10.0/24", (-52, 0)), ("R2", "SW2", "eth"), ("SW2", "WEB1", "eth"), ("SW2", "PC1", "eth"),
               ("FW", "SW4", "eth", "dmz 50", (0, -10)), ("SW4", "WEB2", "eth"), ("SW4", "PC2", "eth"),
               ("FW", "R3", "eth", "2.2.2.0/24", (44, 0)), ("R3", "R4", "serial", "192.168.100.0/24", (70, 0)),
               ("R4", "SW3", "eth"), ("SW3", "VPN", "eth"), ("SW3", "NMS", "eth")],
        notes=[(40, 696, "구간별 허용·차단 정책 5개 · web2 → 10.10.30.0 접속 시 DACL 인증", 13)])

    # 5. 보안 솔루션 확장 Lab
    diagram("security-solution-plus", 1200, 640, "보안 솔루션 확장 Lab 구성도",
        zones=[(20, 40, 400, 570, "개인", "warm"),
               (450, 40, 730, 570, "팀", "hot")],
        nodes={
            "PC": ("laptop", 220, 160, "Windows", "OSSEC · Zabbix agent"),
            "OSSEC": ("server", 120, 420, "OSSEC", "HIDS"),
            "ZBX": ("server", 320, 420, "Zabbix", "NMS"),
            "WEB": ("server", 700, 330, "Web Server", "과제 정리 페이지"),
            "SUR": ("ids", 830, 140, "Suricata", "NIDS"),
            "SNO": ("ids", 980, 140, "Snort", "NIPS"),
            "KALI": ("attacker", 1070, 380, "Kali"),
            "PFS": ("firewall", 560, 160, "pfSense", "방화벽 룰"),
            "WAZ": ("server", 640, 520, "Wazuh", "SIEM · 파일 무결성 검사"),
        },
        links=[("PC", "OSSEC", "both"), ("PC", "ZBX", "both"),
               ("KALI", "WEB", "attack", "ICMP · DDoS 테스트", (0, -12)),
               ("SUR", "WEB", "dash", "탐지", (-18, 0)), ("SNO", "WEB", "dash", "차단", (20, 6)),
               ("WAZ", "WEB", "dash", "로그 수집", (44, 0)), ("WAZ", "PFS", "dash")],
        notes=[(470, 600, "Snort·Suricata 룰: ICMP · smurf · UDP Flooding · tcpdump/Wireshark로 확인", 13)])

    # 6. System Security Lab
    diagram("system-security", 1200, 640, "System Security Lab 구성도",
        zones=[(20, 40, 760, 570, "침투 테스트 · 탐지", "warm"),
               (820, 40, 360, 570, "팀", "soft")],
        nodes={
            "KALI": ("attacker", 130, 130, "Kali", "Attacker"),
            "SUR": ("ids", 340, 250, "Suricata", "차단 룰"),
            "SNO": ("ids", 480, 250, "Snort", "탐지 룰"),
            "WEB": ("server", 180, 450, "취약한 웹서버", "HTTPS 로그"),
            "CTF": ("server", 420, 480, "CTF", "Fall · 플래그 획득"),
            "ROCKY": ("server", 660, 450, "Rocky Linux", "firewalld · iptables"),
            "UBU": ("server", 1000, 200, "Ubuntu", "보안관제 시스템"),
            "SCRIPT": ("laptop", 1000, 440, "점검 스크립트", "Shell Script"),
        },
        links=[("KALI", "WEB", "attack"), ("KALI", "CTF", "attack", "Ping", (-20, 0)), ("KALI", "ROCKY", "attack", "/etc/passwd 접근", (110, 60)),
               ("UBU", "ROCKY", "dash", "로그 · 관제", (0, -12)),
               ("SCRIPT", "ROCKY", "dash", "취약점 점검", (0, 20))],
        notes=[(40, 600, "계정 정책: root 원격 접속 제한 · 패스워드 복잡도 · 만료 90일 · SetUID · Sticky Bit", 13)])

    # 7. Full-Security Labs (종합)
    diagram("full-security", 1200, 790, "Full-Security Labs 종합 구성도",
        zones=[(20, 40, 640, 720, "내부망 192.168.0.0/16", "warm"),
               (720, 40, 460, 720, "외부망 10.10.10.0/24", "hot")],
        nodes={
            "SW3": ("switch", 200, 200, ""),
            "PFS": ("server", 330, 100, "pfSense", "원격 VPN"),
            "BUG": ("bug", 80, 110, "악성코드 분석"),
            "CTF": ("server", 80, 310, "CTF", "Earth"),
            "OWASP": ("server", 220, 330, "OWASP"),
            "R2": ("router", 380, 250, "R2"),
            "FW": ("firewall", 470, 370, "ASAv 방화벽"),
            "R1": ("router", 380, 490, "R1"),
            "SW1": ("switch", 220, 560, ""),
            "DNS": ("server", 80, 500, "DNS"),
            "OSSEC": ("server", 80, 650, "OSSEC", "HIDS"),
            "ZBX": ("server", 230, 670, "Zabbix", "NMS"),
            "SW2": ("switch", 460, 600, ""),
            "WAZ": ("server", 590, 500, "Wazuh", "SIEM"),
            "PMM": ("server", 600, 660, "PMM"),
            "WDB": ("server", 420, 690, "Web-DB"),
            "IDS": ("ids", 600, 370, "Snort · Suricata", "NIDS · NIPS"),
            "R3": ("router", 800, 370, "R3"),
            "E1": ("switch", 880, 500, ""),
            "KALI": ("attacker", 880, 630, "Kali", "VLAN 10"),
            "E2": ("switch", 990, 330, ""),
            "AD": ("attacker", 1000, 160, "Attacker-D", "VLAN 30"),
            "AC": ("attacker", 1120, 270, "Attacker-C", "VLAN 20"),
            "E3": ("switch", 1060, 500, ""),
            "AB": ("attacker", 1130, 620, "Attacker-B", "VLAN 30"),
            "AA": ("attacker", 1000, 640, "Attacker-A", "VLAN 10"),
        },
        links=[("SW3", "PFS", "eth"), ("SW3", "BUG", "eth"), ("SW3", "CTF", "eth"), ("SW3", "OWASP", "eth"), ("SW3", "R2", "eth"),
               ("R2", "FW", "eth"), ("FW", "R1", "eth"), ("R1", "SW1", "eth"), ("SW1", "DNS", "eth"), ("SW1", "OSSEC", "eth"),
               ("SW1", "ZBX", "eth"), ("SW1", "SW2", "eth"), ("SW2", "WAZ", "eth"), ("SW2", "PMM", "eth"), ("SW2", "WDB", "eth"),
               ("FW", "IDS", "serial"), ("IDS", "R3", "serial"), ("R3", "E1", "eth"), ("E1", "KALI", "eth"), ("E1", "E2", "eth"),
               ("E2", "AD", "eth"), ("E2", "AC", "eth"), ("E2", "E3", "eth"), ("E3", "AB", "eth"), ("E3", "AA", "eth")],
        notes=[(740, 746, "VLAN 10 Network · VLAN 20 System · VLAN 30 Pentest", 13)])


if __name__ == "__main__":
    main()
