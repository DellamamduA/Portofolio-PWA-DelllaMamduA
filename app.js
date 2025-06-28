// meastikan fitur Service Worker tersedia di browser
if ('serviceWorker' in navigator) {

  // menlankan saat seluruh halaman telah termuat
  window.addEventListener('load', () => {

    // melakukan pendaftaran sw.js sebagai Service Worker
    navigator.serviceWorker.register('sw.js')
      .then(reg => {
        // Jika sukses, tampilkan informasi area cakupan
        console.info('🟢 SW terdaftar dengan sukses pada:', reg.scope);
      })
      .catch(err => {
        // Jika gagal, tampilkan pesan erorr
        console.error('🔴 Gagal mendaftarkan SW:', err);
      });

  });

}
