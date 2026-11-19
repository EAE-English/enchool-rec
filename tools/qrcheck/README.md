# 숙제장 QR 자동 점검 (2026-11-06)

1. 학습관리실 DB에서 `books`, `students`, `classes`, `settings` 전부와 점검할 날짜의 `sheets`를 한 폴더에 내려받아요(ArtifactData `out_dir`).
2. 학습관리실 페이지를 Artifact read로 받아 HTML 파일 경로를 알아 둬요.
3. 저장소 루트에서 `python3 -m http.server 8765 --bind 127.0.0.1` (백그라운드)
4. `node tools/qrcheck/listqr.js <학습관리실.html> <DB폴더> <날짜,날짜> q.json`
5. `node tools/qrcheck/runqr.js q.json r.json` — 아이폰 화면, 가짜 마이크, 녹음 숙제는 15초씩 실제 녹음, 선생님께 보내기는 막아 둠(기록 안 남음)
6. `python3 tools/qrcheck/judge.py q.json r.json` — 「됨/안 됨」 요약

## 고장 난 폰 흉내 점검 (2026-11-19 추가 · 정기 점검 때 꼭 같이)

가상 폰은 소리가 늘 잘 끝나요. 그래서 「소리 끝 신호가 안 오는 폰」에서만 멈추는 오류(11/19 세림 쿨본문 입영작 멈춤)를 못 잡았어요.
아래 셋은 일부러 소리를 고장 내 놓고도 화면이 스스로 넘어가는지 봐요. `✗` · `못 감` · `안 넘어감`이 한 줄이라도 나오면 「이상 있음」으로 보고해요.

- `node tools/qrcheck/fault_finish.js` — 쿨톡·쿨보카·쿨본문 마지막 문제 뒤 결과 화면으로 넘어가나
- `node tools/qrcheck/fault_kool.js` — 원어민 음성(TTSA)·기계 목소리가 안 끝나거나, 파일이 안 받아지거나, 재생이 거절돼도 다음으로 가나
- `node tools/qrcheck/fault_rec.js` — 녹음(따라 읽기·역할극): 먼저 듣기 버튼이 되돌아오나, 녹음이 끝 화면까지 가나

이 점검으로도 못 보는 것: 진짜 폰 스피커에서 소리가 나는지, 블루투스 이어폰, 폰 기종별 마이크. 이건 「확인 못 함」으로 적어요.
