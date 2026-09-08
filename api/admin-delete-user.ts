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
 * 관리자(ADMIN_EMAIL)만 호출 가능. 지정한 uid의 라운드 기록과 계정을 완전히 삭제한다.
 * 관리자 본인 uid는 실수 방지를 위해 여기서 삭제할 수 없게 막는다(설정의 회원 탈퇴 이용).
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

  const targetUid = typeof req.body?.uid === 'string' ? req.body.uid : '';
  if (!targetUid) {
    res.status(400).json({ error: '삭제할 사용자 uid가 필요합니다.' });
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
    if (decoded.uid === targetUid) {
      res.status(400).json({ error: '관리자 본인 계정은 여기서 삭제할 수 없습니다. 설정 화면의 회원 탈퇴를 이용해주세요.' });
      return;
    }

    const db = getFirestore(app);
    const roundsSnap = await db.collection('users').doc(targetUid).collection('rounds').get();
    const batchSize = 400;
    for (let i = 0; i < roundsSnap.docs.length; i += batchSize) {
      const batch = db.batch();
      roundsSnap.docs.slice(i, i + batchSize).forEach((d) => batch.delete(d.ref));
      await batch.commit();
    }
    await db.collection('users').doc(targetUid).delete().catch(() => undefined);
    await auth.deleteUser(targetUid);

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('[admin-delete-user]', err);
    res.status(500).json({ error: '사용자를 삭제하지 못했습니다.' });
  }
}
