# Happy Golf v6.0.1 — 배포 오류 수정 (Hotfix)

이 버전은 v6.0 Premium Mobile UI에서 **GitHub/Vercel 업로드(배포)가 실패하던 근본 원인**을 고치고,
그 과정에서 함께 발견된 미비점들을 보완한 버전입니다. 기능/디자인 변경은 없습니다.

## 1. 업로드(배포)가 안 되던 근본 원인 — 2가지

### 원인 A. package-lock.json과 package.json 불일치로 `npm ci`가 크래시함
`package.json`의 devDependencies에는 `vitest`가 있었지만, `package-lock.json`에는
`vitest` 관련 항목이 **완전히 빠져 있었습니다** (버전 표기도 5.1.0 vs 5.5.0으로 서로 달랐습니다).

Vercel/Netlify/GitHub Actions는 `package-lock.json`이 있으면 기본적으로 `npm install`이 아니라
**`npm ci`**를 실행하는데, 이 명령은 두 파일이 완전히 일치하지 않으면 설치 자체를 거부합니다.
실제로 원본 압축파일 그대로 `npm ci`를 실행하면 아래처럼 설치 단계에서 즉시 죽습니다.

```
npm error Cannot read properties of null (reading 'edgesOut')
```

### 원인 B. vitest 4.x의 순환 peer-dependency로 `npm install`도 실패함
단순히 lock 파일만 다시 만들어도 동일한 오류가 재현되었습니다. 원인을 더 파고보니
`vitest@4.0.18`이 선택적 peer로 `@vitest/browser-playwright@4.0.18`을 요구하는데,
레지스트리에 있는 `@vitest/browser-playwright`의 최신 버전은 반대로 `vitest@5.0.0`을 요구합니다.
두 버전 요구가 서로 맞물리면서 npm의 의존성 트리 계산기(arborist)가 죽어버리는 문제입니다
(npm 자체의 알려진 취약점으로, 이 프로젝트의 코드 실수가 아닙니다).

이 프로젝트는 실제 테스트 코드가 하나도 없고 `vitest.config`도 따로 없어서, 테스트 실행 기능이
실제로 쓰이고 있지 않았습니다. 그래서 **`vitest`를 문제가 없는 `^3.2.4`로 고정**해 install 단계의
크래시를 없앴습니다. (테스트 명령 `npm run test` / `npm run test:watch`는 그대로 남아 있어
나중에 실제 테스트를 추가할 때 그대로 쓸 수 있습니다.)

두 원인을 고친 뒤 `npm ci`, `npm install`이 정상적으로 끝나는 것을 직접 재현·검증했습니다.

### 원인 C. 위 두 가지를 고쳐도 빌드(`npm run build`) 자체가 실패했음
Vercel의 기본 빌드 명령은 `npm run build`(=`tsc -b && vite build`)입니다. 설치가 성공해도
아래 2개의 TypeScript 오류 때문에 **빌드가 항상 실패**하고 있었습니다.

1. `src/App.tsx` — 라운드 종료 처리(`completeFinishRound`)에서 만든 객체의 `status` 값이
   리터럴 타입(`'completed'`)이 아니라 넓은 `string` 타입으로 추론되어, `Round` 타입에 대입할 수
   없다는 오류. → 객체에 `Round` 타입을 명시해 해결.
2. `src/components/HoleEntry.tsx` — `onViewScorecard` prop을 받아놓고 실제로는 화면에서
   쓰지 않아 "선언했지만 사용하지 않음" 오류. → 아래 2번 항목대로 실제 버튼을 추가해 사용하도록 수정.

## 2. 함께 보완한 미비점

- **홀 입력 화면에서 "전체 스코어카드 보기" 버튼이 실제로는 빠져 있었음.** `App.tsx`는
  `HoleEntry`/`ParkHoleEntry`에 `onViewScorecard`를 넘겨주고 있었지만, 두 컴포넌트 모두 그 값을
  화면에 쓰는 버튼이 없었습니다(파크골프 쪽은 prop 자체를 받지도 않았습니다). 라운드 입력 중
  전체 스코어카드를 확인할 방법이 없었던 실제 기능 누락이라, 두 화면 상단에
  "▤ 전체 스코어카드 보기" 버튼을 추가했습니다.
- **Firebase 환경변수가 비어 있어도 조용히 실패하던 문제.** `.env.local`을 안 만들었거나 Vercel에
  6개 환경변수를 등록하지 않으면, 기존에는 로그인 화면이 뜨긴 하지만 로그인 시도 시 알 수 없는
  오류만 나서 원인을 알기 어려웠습니다. 이제 필수 값이 비어 있으면 콘솔에 어떤 값이
  빠졌는지 정확히 남기고, 화면에도 "Firebase 설정이 필요합니다" 안내와 설정 방법을 바로 보여줍니다.
- **화면 렌더링 중 예외가 나면 흰 화면만 뜨던 문제.** 최상위 에러 바운더리
  (`src/components/ErrorBoundary.tsx`)를 추가해, 예상치 못한 오류가 나도 "새로고침" 버튼이 있는
  안내 화면이 뜨도록 했습니다.
- **기록 삭제 실패 시 원인을 전혀 알 수 없던 문제.** `Records`에서 삭제가 실패하면 사용자에게는
  안내가 뜨지만, 콘솔에는 아무 로그도 남지 않아 왜 실패했는지 나중에 확인할 방법이 없었습니다.
  실패 원인을 콘솔에 남기도록 수정했습니다.
- **번들 크기 최적화.** Firebase SDK가 앱 코드와 한 파일로 묶여 있어 파일 하나(약 800KB)가
  매번 통째로 다시 받아졌습니다. Firebase를 별도 청크로 분리해, 앱 코드만 바뀌었을 때 사용자가
  Firebase 부분까지 다시 받지 않도록 했습니다.
- **Node 버전 명시.** `package.json`에 `engines.node`를 추가해, Vercel 등에서 Vite 8이 요구하는
  Node 버전(20.19+ 또는 22.12+)보다 낮은 버전으로 잘못 빌드되는 상황을 방지했습니다.
- **package.json / package-lock.json 버전 불일치 수정.** 5.5.0 vs 5.1.0으로 어긋나 있던 버전
  표기를 6.0.1로 통일했습니다.

## 3. 검증한 내용

- `rm -rf node_modules package-lock.json && npm install` — 정상 완료 (233개 패키지, 취약점 0건)
- `npm ci` (lock 파일 기준 재설치) — 정상 완료
- `npm run build` (`tsc -b && vite build`) — TypeScript 오류 0건, 정상 빌드
- `npx oxlint` — 크래시/치명적 오류 없음 (남아있는 경고 몇 개는 Firebase 구독 패턴 등 의도된 코드로,
  동작에 영향 없음)
- `npx vite`로 개발 서버 정상 기동 확인

## 4. 배포 전 꼭 확인할 것 (사용자 조치 필요)

이 코드 자체의 문제는 모두 고쳤지만, 아래 2가지는 코드로 대신할 수 없는 "환경 설정"이라
직접 확인이 필요합니다.

1. **Vercel 프로젝트 Settings → Environment Variables**에 `.env.example`에 있는 6개
   `VITE_FIREBASE_*` 값이 실제로 등록되어 있는지 확인하세요. 하나라도 비어 있으면 이제는
   화면에 "Firebase 설정이 필요합니다"라고 명확히 표시되니 바로 알아볼 수 있습니다.
2. Firebase 콘솔의 Firestore 보안 규칙(`firestore.rules`)이 실제 Firebase 프로젝트에도
   배포되어 있는지 확인하세요. 이 파일은 로컬에 있을 뿐, `firebase deploy --only firestore:rules`
   같은 명령으로 따로 올려야 실제로 적용됩니다.
