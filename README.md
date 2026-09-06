# 골프 스코어카드 (My Golf Scorecard)

아마추어 개인 골퍼용 심플한 모바일 골프 스코어 기록 웹앱입니다. 라운드 중 스마트폰으로 홀별 스코어를 빠르게 입력하고, 지난 라운드 기록과 평균 스코어를 확인하는 것에만 집중했습니다.

## 포함된 기능 (v1)

- 이메일/비밀번호 로그인 (Firebase Authentication)
- 홈: 평균 스코어 / 최근 5경기 평균 / 베스트 스코어, 새 라운드 시작, 최근 라운드 리스트
- 새 라운드 시작: 날짜·골프장 이름·9/18홀 선택, 홀별 Par 빠른 설정
- 홀별 스코어 입력: 한 화면 한 홀, 큰 +/- 버튼, 퍼팅 입력, 파 대비 자동 계산(버디/파/보기 등), 홀 이동 시 자동 저장
- 전체 스코어카드: OUT/IN/TOTAL 자동 계산 표
- 라운드 종료 요약: 총 스코어, 파 대비, 총 퍼팅
- 라운드 기록: 완료된 라운드 목록 → 탭하면 상세 스코어카드
- 라운드 중 이탈 시 이어하기 (홈 화면에 "진행 중인 라운드 이어하기" 배너)
- Firestore 보안 규칙: 사용자는 자신의 데이터만 읽고 쓸 수 있음

## 이번 버전에서 만들지 않은 기능

PWA/오프라인 동기화, PDF 내보내기, 이미지 카드 공유, 통계 그래프, 목표 관리, 골프장 등록/관리 메뉴, 페어웨이/GIR/벌타 기록, 다크모드는 처음 기획대로 v1에서 제외했습니다. 앱을 써보시고 필요하다고 느끼는 것부터 하나씩 추가하시는 걸 추천드립니다.

## 기술 스택

React + TypeScript (Vite) · Tailwind CSS · Firebase Authentication · Firebase Firestore · Vercel

## 폴더 구조

```
src/
  firebase.ts           Firebase 초기화 (환경변수에서 설정값을 읽음)
  types.ts               Round, Hole 등 타입 정의
  contexts/AuthContext.tsx   로그인 상태 관리
  hooks/useRounds.ts     Firestore 라운드 데이터 구독/생성/저장
  utils/golf.ts          점수 라벨, 합계 계산 등 골프 관련 순수 함수
  components/
    Login.tsx            로그인/회원가입 화면
    Home.tsx              홈 화면
    NewRound.tsx           새 라운드 시작 화면
    HoleEntry.tsx          홀별 스코어 입력 화면 (핵심 화면)
    Scorecard.tsx          전체 스코어카드 표
    RoundSummary.tsx       라운드 종료 요약
    Records.tsx            라운드 기록 목록
    BottomNav.tsx / StatCard.tsx / NumberStepper.tsx / ScreenHeader.tsx  공용 UI 부품
  App.tsx                화면 전환(상태 기계) 및 각 화면 연결
firestore.rules          Firestore 보안 규칙 (사용자별 데이터 분리)
```

## 1. 로컬에서 실행하기

```bash
npm install
npm run dev
```

`http://localhost:5173` 에서 확인할 수 있습니다. 단, Firebase 설정을 먼저 채워야 로그인/저장이 동작합니다 (아래 2번 참고).

## 2. Firebase 프로젝트 설정

1. [Firebase 콘솔](https://console.firebase.google.com)에서 새 프로젝트를 만듭니다. (기존 재단 프로젝트와 별개로, 개인용 새 프로젝트를 만드는 걸 추천드립니다.)
2. **Authentication** → 시작하기 → 로그인 방법에서 **이메일/비밀번호**를 활성화합니다.
3. **Firestore Database** → 데이터베이스 만들기 → 프로덕션 모드로 시작합니다. (리전은 `asia-northeast3(서울)` 추천)
4. 프로젝트 설정(⚙️) → 일반 → "내 앱"에서 웹 앱(</>)을 추가하고, 표시되는 설정값을 복사합니다.
5. 프로젝트 루트의 `.env.example` 파일을 복사해서 `.env.local` 파일을 만들고, 복사한 값을 채워 넣습니다.

```bash
cp .env.example .env.local
# .env.local 파일을 열어 값 입력
```

6. Firestore 보안 규칙 적용: Firebase 콘솔 → Firestore Database → 규칙 탭에 `firestore.rules` 파일 내용을 붙여넣고 게시합니다. (Firebase CLI가 있다면 `firebase deploy --only firestore:rules` 로도 배포 가능합니다.)

> ⚠️ 이 규칙을 반드시 적용해야 합니다. 적용하지 않으면 기본 규칙(모두 차단 또는 개발용 오픈 규칙)이 그대로 남아 앱이 아예 동작하지 않거나, 다른 사람이 내 데이터에 접근할 수 있습니다.

## 3. Vercel에 배포하기

1. 이 프로젝트를 GitHub 저장소로 올립니다.
2. [Vercel](https://vercel.com)에서 New Project → 해당 저장소 선택 (Framework Preset은 자동으로 Vite로 인식됩니다).
3. 배포 설정 화면의 **Environment Variables**에 `.env.local`에 넣었던 `VITE_FIREBASE_*` 값들을 동일하게 등록합니다.
4. Deploy를 누르면 완료됩니다. 이후 코드를 GitHub에 push할 때마다 자동으로 재배포됩니다.
5. 스마트폰 브라우저로 배포된 주소에 접속한 뒤, 브라우저 메뉴에서 "홈 화면에 추가"를 하면 앱처럼 아이콘으로 사용할 수 있습니다. (별도 PWA 설정 없이도 대부분의 모바일 브라우저에서 지원하는 기본 기능입니다.)

## 참고: Google 로그인으로 바꾸고 싶다면

`src/contexts/AuthContext.tsx`와 `src/components/Login.tsx`의 이메일/비밀번호 로그인 부분을 Firebase의 `GoogleAuthProvider` + `signInWithPopup`으로 교체하면 됩니다. Firebase 콘솔의 Authentication → 로그인 방법에서 Google도 함께 활성화해야 합니다.
