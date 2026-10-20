#!/usr/bin/env bash
# 답 흔들림 점검기 실행 묶음(p2-check.zip)을 만든다: app/의 화면·규칙 파일과 논문 PDF를 p2-check/ 폴더로 묶는다.
# 저장소 루트에서 실행: bash scripts/build-app-zip.sh
set -euo pipefail
root="$(cd "$(dirname "$0")/.." && pwd)"
work="$(mktemp -d)"
trap 'rm -rf "$work"' EXIT
dest="$work/p2-check"
mkdir -p "$dest/detect"
cp "$root"/app/{index.html,app.css,app.js,data.js,detect.js,README.md,RULES.md} "$dest/"
cp "$root"/app/detect/*.js "$dest/detect/"
cp "$root/works/paper.pdf" "$dest/paper.pdf"
# 같은 내용이면 같은 ZIP이 나오게 날짜를 고정한다
find "$dest" -exec touch -d "2026-10-20 12:00" {} +
rm -f "$root/p2-check.zip"
(cd "$work" && zip -q -X -r "$root/p2-check.zip" p2-check)
echo "p2-check.zip: $(unzip -l "$root/p2-check.zip" | tail -1)"
