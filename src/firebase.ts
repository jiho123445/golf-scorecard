import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';

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

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

// 일부 네트워크 환경(방화벽/보안 프로그램/확장 프로그램)에서 Firestore의 기본 실시간
// 연결 방식이 막혀 요청이 응답 없이 멈추는 경우가 있어, 막히면 자동으로 long polling
// 방식으로 전환되도록 설정합니다.
export const db = initializeFirestore(app, {
  experimentalAutoDetectLongPolling: true,
});
