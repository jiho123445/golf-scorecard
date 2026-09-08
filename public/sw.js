// 최소한의 서비스워커: 같은 출처(same-origin)의 GET 요청만 다루고,
// Firebase/Firestore로 나가는 요청과 /api/*(서버리스 함수) 요청은 절대
// 가로채지 않는다(데이터가 오래된 캐시로 보이면 안 되기 때문).
const CACHE_NAME = 'happy-golf-v1';
const OFFLINE_URL = '/offline.html';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll([OFFLINE_URL])),
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))),
    ),
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // GET 요청, 같은 출처, /api/ 경로 제외만 다룬다.
  if (req.method !== 'GET' || url.origin !== self.location.origin || url.pathname.startsWith('/api/')) {
    return;
  }

  // 페이지 이동(navigation)은 네트워크 우선, 실패하면 오프라인 안내 페이지.
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).catch(() => caches.match(OFFLINE_URL)),
    );
    return;
  }

  // 정적 자산(JS/CSS/이미지 등)은 캐시 우선, 없으면 네트워크에서 받아 캐시에 채운다.
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req)
        .then((res) => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
          }
          return res;
        })
        .catch(() => cached);
    }),
  );
});
