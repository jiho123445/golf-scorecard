import type { VercelRequest, VercelResponse } from '@vercel/node';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// 이 파일은 Vercel 서버리스 함수 하나마다 독립적으로 번들링되므로,
// 다른 api/*.ts 파일과 코드를 공유하지 않고 초기화 코드를 그대로 복사해 둔다.
// (다른 프로젝트에서 공용 모듈을 import했다가 배포가 깨졌던 경험 때문에 의도적으로 이렇게 함)
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
 * 로그인된 본인 계정을 완전히 삭제한다 (회원 탈퇴).
 * - Authorization: Bearer <Firebase ID 토큰> 으로 본인 확인
 * - users/{uid}/rounds 전체 삭제 → users/{uid} 문서 삭제 → Firebase Auth 계정 삭제 순서로 진행
 * - Admin SDK로 서버에서 직접 삭제하므로, 클라이언트 SDK의 "최근 로그인 필요" 제약을 받지 않는다.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'POST 요청만 허용됩니다.' });
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
    const decoded = await getAuth(app).verifyIdToken(token);
    const uid = decoded.uid;

    const db = getFirestore(app);
    const roundsSnap = await db.collection('users').doc(uid).collection('rounds').get();
    const batchSize = 400;
    for (let i = 0; i < roundsSnap.docs.length; i += batchSize) {
      const batch = db.batch();
      roundsSnap.docs.slice(i, i + batchSize).forEach((d) => batch.delete(d.ref));
      await batch.commit();
    }
    await db.collection('users').doc(uid).delete().catch(() => undefined);
    await getAuth(app).deleteUser(uid);

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('[delete-own-account]', err);
    res.status(500).json({ error: '계정을 삭제하지 못했습니다. 잠시 후 다시 시도해주세요.' });
  }
}
