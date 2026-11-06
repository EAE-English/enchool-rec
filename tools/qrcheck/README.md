# 숙제장 QR 자동 점검 (2026-11-06)

1. 학습관리실 DB에서 `books`, `students`, `classes`, `settings` 전부와 점검할 날짜의 `sheets`를 한 폴더에 내려받아요(ArtifactData `out_dir`).
2. 학습관리실 페이지를 Artifact read로 받아 HTML 파일 경로를 알아 둬요.
3. 저장소 루트에서 `python3 -m http.server 8765 --bind 127.0.0.1` (백그라운드)
4. `node tools/qrcheck/listqr.js <학습관리실.html> <DB폴더> <날짜,날짜> q.json`
5. `node tools/qrcheck/runqr.js q.json r.json` — 아이폰 화면, 가짜 마이크, 녹음 숙제는 15초씩 실제 녹음, 선생님께 보내기는 막아 둠(기록 안 남음)
6. `python3 tools/qrcheck/judge.py q.json r.json` — 「됨/안 됨」 요약
