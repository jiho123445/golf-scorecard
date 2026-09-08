import type { VercelRequest, VercelResponse } from '@vercel/node';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// 다른 api/*.ts 파일과 코드를 공유하지 않고 초기화 코드를 그대로 복사해 둔다.
function adminApp() {
  if (getApps().length) return getApps()[0]!;
  return initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: (process.env.FIREBASE_ADMIN_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    }),
  });
}

/**
 * 관리자(ADMIN_EMAIL)만 호출 가능. 가입된 전체 사용자 목록과, 각자의 라운드 기록 개수를 돌려준다.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'GET 요청만 허용됩니다.' });
    return;
  }

  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
  if (!token) {
    res.status(401).json({ error: '로그인이 필요합니다.' });
    return;
  }

  try {
    const app = adminApp();
    const auth = getAuth(app);
    const decoded = await auth.verifyIdToken(token);
    if (!process.env.ADMIN_EMAIL || decoded.email !== process.env.ADMIN_EMAIL) {
      res.status(403).json({ error: '관리자만 접근할 수 있습니다.' });
      return;
    }

    const db = getFirestore(app);
    const list = await auth.listUsers(1000);

    const users = await Promise.all(
      list.users.map(async (u) => {
        let roundCount = 0;
        try {
          const countSnap = await db.collection('users').doc(u.uid).collection('rounds').count().get();
          roundCount = countSnap.data().count;
        } catch {
          roundCount = 0;
        }
        return {
          uid: u.uid,
          email: u.email ?? '',
          createdAt: u.metadata.creationTime,
          lastSignInAt: u.metadata.lastSignInTime,
          disabled: u.disabled,
          roundCount,
        };
      }),
    );

    users.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
    res.status(200).json({ users });
  } catch (err) {
    console.error('[admin-list-users]', err);
    res.status(500).json({ error: '사용자 목록을 불러오지 못했습니다.' });
  }
}
