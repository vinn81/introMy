# 두 번 실행 비교 (2026-10-08)

새 폴더 두 곳(fresh17, fresh18)에 ZIP의 renew/를 풀고 out/을 지운 뒤 README 2단계 그대로 실행했습니다. 입력: 리추얼 기록 38일, 출석 화면 요약, 제출 현황 T01~T11.

## fresh17
```
사이트 갱신: site-index.html
6bc2a4c63fbef248f5fb2d21dfbcd0cd070b8053196fa2d5a50baf1d6cc3773a  stats.json
bd0707c6c6a8a1416dbce460c1dbd8cfa5ac88d2e582d9e762d4642da02dcee1  candidates.json
1748cd7c96e319a19cd07ea6f8138cbc08ff20187535a3935fa1edcbca848a45  candidates.md
28f3f6253c1a2f9419ea2e8560546219e69ba47bf2d7c67ed4dffe30a466f17b  site-block.html
```

## fresh18
```
사이트 갱신: site-index.html
6bc2a4c63fbef248f5fb2d21dfbcd0cd070b8053196fa2d5a50baf1d6cc3773a  stats.json
bd0707c6c6a8a1416dbce460c1dbd8cfa5ac88d2e582d9e762d4642da02dcee1  candidates.json
1748cd7c96e319a19cd07ea6f8138cbc08ff20187535a3935fa1edcbca848a45  candidates.md
28f3f6253c1a2f9419ea2e8560546219e69ba47bf2d7c67ed4dffe30a466f17b  site-block.html
```

결과: out/ 네 파일과 site-index.html이 바이트 단위로 같습니다(diff 차이 없음).
