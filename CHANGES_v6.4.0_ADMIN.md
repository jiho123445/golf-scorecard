# v6.4.0 — 회원 관리(관리자) + 회원 탈퇴 기능

## 무엇이 추가되었나

### 1. 회원 탈퇴 (모든 사용자)
- 설정 화면 맨 아래에 "회원 탈퇴" 버튼 추가.
- 두 번의 확인(다이얼로그) 후 진행. 되돌릴 수 없다는 점을 명확히 안내.
- 탈퇴 시 서버(Vercel API)에서 다음 순서로 완전히 삭제:
  1. `users/{uid}/rounds` 컬렉션의 모든 라운드 기록
  2. `users/{uid}` 문서
  3. Firebase Authentication 계정 자체
- 클라이언트 SDK로 계정을 직접 삭제하면 "최근 로그인이 필요합니다" 오류가 자주 나는데, 서버(Admin SDK)에서 처리하므로 이 제약이 없음.

### 2. 회원 관리 (관리자 전용)
- 설정 화면에서 로그인 계정이 관리자 이메일(`VITE_ADMIN_EMAIL`)과 일치할 때만 "▤ 회원 관리" 버튼이 보임.
- 가입된 전체 회원 목록(이메일, 라운드 기록 개수, 가입일)을 보여주고, 회원별로 "삭제" 버튼으로 계정+기록을 완전히 삭제 가능.
- 관리자 본인 계정은 이 화면에서 삭제할 수 없도록 서버에서 차단(실수 방지) — 본인 탈퇴는 설정의 "회원 탈퇴" 버튼을 사용.
- 관리자 권한 검증은 브라우저가 아닌 **서버에서만** 이뤄짐(Firebase ID 토큰을 서버가 직접 검증하고 이메일을 비교). `VITE_ADMIN_EMAIL`은 화면에 버튼을 보여줄지 여부만 결정하는 값이라 노출되어도 안전함.

## 새로 추가된 파일
- `api/delete-own-account.ts` — 본인 계정 탈퇴 처리
- `api/admin-list-users.ts` — 전체 회원 목록 조회 (관리자 전용)
- `api/admin-delete-user.ts` — 특정 회원 삭제 (관리자 전용)
- `src/components/AdminUsers.tsx` — 회원 관리 화면

## 반드시 해야 하는 설정 (배포 전 필수)

### (1) Firebase 서비스 계정 키 발급
1. [Firebase 콘솔](https://console.firebase.google.com) → 해당 프로젝트(golf-scorecard) 선택
2. 좌측 상단 톱니바퀴 → **프로젝트 설정**
3. 상단 탭에서 **서비스 계정** 클릭
4. **새 비공개 키 생성** 클릭 → JSON 파일 다운로드
5. 다운로드한 JSON 파일을 열면 아래 3개 값이 들어있음:
   - `project_id`
   - `client_email`
   - `private_key` (`-----BEGIN PRIVATE KEY-----`로 시작하는 긴 문자열)

> ⚠️ 이 JSON 파일은 계정 전체를 관리할 수 있는 매우 민감한 키입니다. 절대 GitHub에 커밋하거나 남에게 공유하지 마세요.

### (2) Vercel 환경 변수 추가
Vercel 프로젝트 → Settings → Environment Variables 에서 아래 값을 **모두 추가** (Production 환경 체크 필수):

| 변수명 | 값 | 비고 |
|---|---|---|
| `VITE_ADMIN_EMAIL` | 관리자로 쓸 본인 이메일 | 예: jiho123445@gmail.com |
| `ADMIN_EMAIL` | 위와 동일한 이메일 | 서버 전용, 실제 권한 검증에 사용됨 |
| `FIREBASE_ADMIN_PROJECT_ID` | JSON의 `project_id` 값 | |
| `FIREBASE_ADMIN_CLIENT_EMAIL` | JSON의 `client_email` 값 | |
| `FIREBASE_ADMIN_PRIVATE_KEY` | JSON의 `private_key` 값 전체 | 아래 주의사항 참고 |

`FIREBASE_ADMIN_PRIVATE_KEY` 입력 시 주의사항:
- JSON 안에서는 줄바꿈이 `\n` 문자로 되어 있음. **그 형태 그대로** (따옴표 없이) 복사해서 붙여넣으면 코드가 자동으로 실제 줄바꿈으로 변환하므로 그대로 넣으면 됨.
- 값 앞뒤에 큰따옴표(`"`)가 딸려오지 않도록 주의.

설정 후 **Redeploy**(재배포)를 한 번 해줘야 새 환경 변수가 적용됩니다.

### (3) 로컬 개발 시
`.env.example`을 복사해 `.env.local`로 저장한 뒤 동일하게 값을 채우면 로컬에서도 회원 관리 기능을 테스트할 수 있습니다.

## 확인된 사항
- `npm install` → `npm run build`(tsc -b && vite build) 정상 통과
- `npx oxlint` 통과 (기존에도 있던 무관한 경고 몇 개 외 신규 오류 없음)
- `api/*.ts` 3개 파일 별도 타입 검사 통과 (Vercel 배포 시 파일별로 독립 번들링되는 구조 반영)
