import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';

// Firebase 프로젝트 설정값은 .env(.env.local)에 넣고 여기서는 읽기만 합니다.
// 루트의 .env.example 파일을 복사해서 .env.local로 만든 뒤 값을 채워주세요.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// 환경변수가 하나라도 비어 있으면(로컬에서 .env.local을 안 만들었거나,
// Vercel 프로젝트 설정에 6개 값을 등록하지 않은 경우) Firebase SDK가
// 화면에 아무 안내 없이 조용히 실패하기 쉽다. 어떤 값이 비어 있는지
// 콘솔에 명확히 남기고, 앱(App.tsx)에서 이 값을 확인해 설정 안내
// 화면을 보여줄 수 있도록 export 한다.
const missingFirebaseKeys = Object.entries(firebaseConfig)
  .filter(([, value]) => !value)
  .map(([key]) => key);

export const isFirebaseConfigured = missingFirebaseKeys.length === 0;

if (!isFirebaseConfigured) {
  console.error(
    `[firebase] 다음 환경변수가 설정되지 않았습니다: ${missingFirebaseKeys.join(', ')}\n` +
      '로컬 개발: .env.example을 .env.local로 복사한 뒤 Firebase 콘솔 값을 채워주세요.\n' +
      'Vercel 배포: 프로젝트 Settings > Environment Variables에 동일한 6개 값을 등록한 뒤 다시 배포해주세요.',
  );
}

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

// 일부 네트워크 환경(방화벽/보안 프로그램/확장 프로그램)에서 Firestore의 기본 실시간
// 연결 방식이 막혀 요청이 응답 없이 멈추는 경우가 있어, 막히면 자동으로 long polling
// 방식으로 전환되도록 설정합니다.
// 골프장처럼 신호가 약한 곳에서도 화면 조회/스코어 입력이 멈추지 않도록 IndexedDB
// 오프라인 캐시도 함께 켭니다. 연결이 돌아오면 쌓인 변경사항이 자동으로 동기화됩니다.
export const db = initializeFirestore(app, {
  experimentalAutoDetectLongPolling: true,
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
});
