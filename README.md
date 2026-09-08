# Happy Golf Scorecard v3.1

골프와 파크골프를 분리 기록하는 통합 스포츠 스코어카드입니다.

# Happy Golf Scorecard v2.0

개인 골퍼용 모바일 우선 골프 스코어카드 웹앱입니다.

## 이번 통합 버전에서 추가된 기능
- 4개 하단 메뉴: 홈 / 라운드 / 분석 / 설정
- 홀별 FIR(페어웨이 적중) 기록
- 홀별 GIR(그린 적중) 기록
- 티박스, 날씨, 코스명 기록
- 최근 10경기 평균
- 워스트 스코어
- 평균 퍼팅
- FIR/GIR 적중률
- 최근 스코어 추세 시각화
- 자동 플레이 코멘트
- updatedAt 기록

## 향후 권장 기능
1. 골프장/코스 마스터 관리
2. 완료 라운드 수정 및 삭제
3. PWA + 오프라인 IndexedDB
4. PDF/이미지 공유
5. Excel/CSV 백업
6. AI 라운드 코칭

## 실행
npm install
npm run dev

## Firebase
기존 .env.example을 참고하여 Firebase 환경변수를 설정합니다.

## 골프장 자동 검색 기능

`src/data/golfCourses.ts`에 내장된 골프장 데이터를 검색하여 골프장명, 지역, 총 홀 수를 자동 설정할 수 있습니다.

전국 전체 데이터 확장 기준은 `GOLF_DATA_SOURCE.md`를 참고하세요.


## 배포용 프로젝트 구조
이 ZIP은 압축을 풀면 바로 프로젝트 루트가 열리도록 구성되어 있습니다.
`node_modules` 폴더는 포함하지 않았습니다. VS Code에서 `npm install` 후 `npm run dev`를 실행하세요.
GitHub/Vercel은 `package.json`을 기준으로 필요한 패키지를 자동 설치합니다.

## v6.0.1 배포 오류 수정
이전 버전(v6.0)은 의존성 잠금 파일 문제로 GitHub/Vercel 업로드(빌드)가 실패했습니다.
자세한 원인과 수정 내역은 `CHANGES_v6.0.1_HOTFIX.md`를 확인하세요. Vercel에 올리기 전에는
`.env.example`의 6개 `VITE_FIREBASE_*` 값을 Vercel 프로젝트의 Environment Variables에
반드시 등록해야 합니다.
