//  Nama cache yang digunakan untuk menyimpan aset
const CURRENT_CACHE = 'portofolio-DellaPWA';

//  Daftar aset inti (core assets) yang akan disimpan saat instalasi
const CORE_ASSETS = [
  '/index.html',
  '/style.css',
  '/app.js',
  '/profileku.jpg',
  '/profileku1.jpg',
  '/offline.html',
  '/screenshot-desktop.png',
  '/screenshot-mobile.png'
];

// 🔧 Event INSTALL: Dilakukan saat pertama kali service worker dipasang
self.addEventListener('install', event => {
  console.log('[SW] 🔧 Instalasi dimulai...');
  self.skipWaiting(); // Membuat SW langsung aktif tanpa menunggu

  event.waitUntil(
    (async () => {
      const cache = await caches.open(CURRENT_CACHE); // Buka cache sesuai nama
      try {
        await cache.addAll(CORE_ASSETS); // Tambahkan semua aset ke cache
        console.log('[SW] ✅ Semua aset berhasil dicache.');
      } catch (err) {
        console.error('[SW] ❌ Gagal cache beberapa file:', err);
      }
    })()
  );
});

// Event FETCH: Menangani semua permintaan dari browser
self.addEventListener('fetch', event => {
  const request = event.request;

  // Untuk permintaan HTML (navigasi antar halaman)
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then(networkResponse => {
          const responseClone = networkResponse.clone();
          caches.open(CURRENT_CACHE).then(cache => {
            cache.put(request, responseClone); // Simpan salinan HTML ke cache
          });
          return networkResponse; // Tampilkan hasil dari jaringan
        })
        .catch(() => {
          console.warn('[SW] ⚠️ Gagal dari jaringan. Menampilkan fallback offline.');
          return caches.match('/offline.html'); // Fallback jika offline
        })
    );
    return;
  }

  // 👉 Untuk permintaan file selain HTML (gambar, CSS, JS, dll.)
  event.respondWith(
    caches.match(request).then(cachedResponse => {
      if (cachedResponse) {
        return cachedResponse; // Ambil dari cache jika tersedia
      }

      // Jika tidak ada di cache, ambil dari jaringan
      return fetch(request)
        .then(networkResponse => {
          // Jika file dari asal domain sendiri dan metode GET
          if (
            request.method === 'GET' &&
            request.url.startsWith(self.location.origin)
          ) {
            const responseClone = networkResponse.clone();
            caches.open(CURRENT_CACHE).then(cache => {
              cache.put(request, responseClone); // Simpan file ke cache
              console.log(`[SW] ✅ Cache aset: ${request.url}`);
            });
          }
          return networkResponse;
        })
        .catch(err => {
          console.warn(`[SW] ❌ Gagal mengambil dan tidak ada cache: ${request.url}`, err);
        });
    })
  );
});

// 🧹 Event ACTIVATE: Menghapus cache lama agar tidak menumpuk
self.addEventListener('activate', event => {
  console.log('[SW] 🔄 Aktivasi dan membersihkan cache lama...');
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CURRENT_CACHE) {
            console.log(`[SW] 🗑️ Hapus cache lama: ${key}`);
            return caches.delete(key); // Hapus cache yang bukan versi sekarang
          }
        })
      )
    ).then(() => self.clients.claim()) // Segera aktif untuk semua tab
  );
});
