/*
 * Browny service worker – cho phép mở app khi không có mạng.
 * - Lần đầu mở (có mạng): tải sẵn toàn bộ trang và dữ liệu vào bộ nhớ đệm.
 * - Những lần sau: mở ngay từ bộ nhớ đệm, đồng thời tải bản mới ở nền
 *   (bản cập nhật sẽ hiện ở lần mở tiếp theo).
 * - Font Google được lưu lại khi tải lần đầu. Clip YouTube không lưu được nên phần Luyện nghe vẫn cần mạng.
 * Đổi VERSION mỗi khi đổi danh sách file để xoá bộ đệm cũ.
 */
const VERSION = 'browny-v1';
const CORE = [
  './', 'index.html', 'questions.js', 'rewards.js',
  'listening.html', 'reading.html', 'reading-data.js', 'vocab.html', 'vocab-data.js',
  'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png', 'favicon-32.png',
];
const FONT_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com'];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(VERSION).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;
  const isFont = FONT_HOSTS.includes(url.hostname);
  if (!sameOrigin && !isFont) return; // YouTube and everything else go straight to the network

  // Stale-while-revalidate: answer from cache, refresh the cache in the background.
  event.respondWith(caches.open(VERSION).then(async cache => {
    const cached = await cache.match(req, { ignoreSearch: sameOrigin });
    const network = fetch(req).then(res => {
      if (res && (res.ok || res.type === 'opaque')) cache.put(req, res.clone());
      return res;
    }).catch(() => null);
    if (cached) { event.waitUntil(network); return cached; }
    const res = await network;
    if (res) return res;
    // Offline and never cached: fall back to the home page for page navigations.
    if (req.mode === 'navigate') return (await cache.match('index.html')) || Response.error();
    return Response.error();
  }));
});
