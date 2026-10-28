# BHINEKA MOTOR — Website

Website statis responsif untuk BHINEKA MOTOR (bengkel sepeda motor dan jasa bubut di Tangerang). Dibuat menggunakan HTML5, CSS3, dan JavaScript modern tanpa build step.

## Struktur folder

```text
bhineka-motor-website/
├── index.html
├── README.md
├── Dashboard admin terintegrasi di index.html
├── css/
│   └── style.css
├── js/
│   └── main.js
└── assets/
    └── logo-bhineka-motor.jpg
```

## Menjalankan website

1. Ekstrak ZIP.
2. Buka `index.html` di browser. Untuk lingkungan lokal yang lebih konsisten, jalankan server statis dari folder proyek, misalnya `python3 -m http.server 8000`, lalu buka `http://localhost:8000`.
3. Koneksi internet diperlukan untuk font Google, gambar hero ilustratif, dan peta Google Maps.

## Informasi yang sudah dikonfigurasi

- WhatsApp: `087773505223`
- Link chat: `https://wa.me/6287773505223`
- Google Maps, Instagram, dan TikTok sesuai link yang diberikan.
- Logo asli yang disediakan digunakan di navbar, bagian tentang, footer, dan favicon.

## Mengganti foto galeri

Galeri sengaja menggunakan slot, bukan foto bisnis acak atau foto dari bengkel lain. Untuk menampilkan foto asli:

1. Siapkan foto milik BHINEKA MOTOR. Simpan di `assets/`, misalnya `galeri-area-bengkel.webp`.
2. Di `index.html`, cari elemen dengan kelas `gallery-placeholder` pada kartu galeri yang sesuai.
3. Ganti isi placeholder dengan gambar, misalnya:
   `<img src="assets/galeri-area-bengkel.webp" alt="Area bengkel BHINEKA MOTOR di Tangerang" loading="lazy">`
4. Tambahkan aturan CSS berikut agar gambar mengisi kartu:
   `.gallery-placeholder img { width:100%; height:100%; object-fit:cover; position:absolute; inset:0; }`
5. Untuk galeri foto yang sudah tersedia, ubah perilaku dialog di `js/main.js` agar dialog menampilkan file foto yang dipilih. Saat ini dialog berfungsi sebagai penanda slot galeri, bukan lightbox foto.

Foto hero saat ini menggunakan foto ilustrasi eksternal dari Unsplash dan bukan foto BHINEKA MOTOR. Ganti URL pada `.hero-bg` di `css/style.css` dengan foto asli jika tersedia. Foto hero eksternal membutuhkan internet.

## Hal yang perlu dikonfirmasi sebelum dipublikasikan

- Alamat dan jam operasional yang diberikan pemilik sudah ditampilkan: Jl. Raya Cadas Kukun – Kukun Kongsi Baru, Kecamatan Rajeg, Kabupaten Tangerang, Banten; pukul 08.00–21.00.
- Pastikan jenis pekerjaan spesifik dan ketersediaan layanan sebelum menjanjikannya di website.
- Tambahkan testimoni hanya dari pelanggan asli dengan izin yang sesuai.
- Uji tautan, tampilan, dan aksesibilitas pada perangkat nyata serta cek ulang detail bisnis.

## Catatan implementasi

- Tombol WhatsApp mengarah ke nomor internasional `6287773505223` dan membawa pesan awal.
- Menu mobile, tombol kembali ke atas, animasi saat scroll, FAQ, dan dialog galeri mempunyai interaksi JavaScript.
- Embed peta menampilkan pencarian BHINEKA MOTOR di Tangerang; tombol petunjuk arah menggunakan URL Google Maps spesifik yang diberikan.
- Schema `AutoRepair` hanya memakai nama, deskripsi, telepon, media logo, tautan sosial, dan peta. Alamat rinci, jam operasional, rating, dan testimoni tidak dikarang.
- Formulir kontak tidak dibuat karena CTA WhatsApp sudah menyediakan jalur kontak langsung dan tidak membutuhkan backend.

## Form ulasan pelanggan
Bagian ulasan menyediakan form nama, rating bintang, layanan, dan komentar. Saat dikirim, browser membuka WhatsApp dengan isi ulasan agar pelanggan menekan tombol Kirim sendiri. Ini tidak otomatis menerbitkan ulasan di website: pengelola perlu meninjau dan menambahkan ulasan yang disetujui. Untuk publikasi otomatis lintas perangkat diperlukan backend/database atau layanan form yang dikonfigurasi.

Footer menampilkan ikon dan handle WhatsApp, Instagram, TikTok, serta Google Maps. Baris hak cipta ditampilkan sesuai permintaan sebagai `© 2026 BHINEKA MOTOR`.

## Pembaruan visual (2026)
- Ikon WhatsApp dirapikan dengan ukuran, jarak, dan tombol chat mengambang berwarna hijau yang konsisten.
- Tautan Google Maps pada tombol petunjuk arah, ulasan Google Maps, dan footer menggunakan ikon pin peta berwarna.
- Tautan Instagram dan TikTok diberi warna aksen agar mudah dikenali, dengan handle akun tetap ditampilkan.
- Pengecekan: JavaScript lolos `node --check` dan arsip ZIP diuji tanpa error.

## Catatan yang masih membutuhkan data pemilik
- Ganti slot galeri dengan foto asli bengkel dan hasil pekerjaan agar tidak menampilkan foto yang tidak mewakili usaha.
- Alamat dan jam operasional telah ditambahkan berdasarkan informasi pemilik: Jl. Raya Cadas Kukun – Kukun Kongsi Baru, Kecamatan Rajeg, Kabupaten Tangerang, Banten; pukul 08.00–21.00.
- Formulir ulasan saat ini mengirim draf melalui WhatsApp, belum menyimpan atau mempublikasikan ulasan otomatis. Untuk itu diperlukan backend/database.

## Informasi lokasi (pembaruan)
- Nama: BHINEKA MOTOR — Bengkel Motor dan Bubut Rajeg, Tangerang.
- Alamat: Jl. Raya Cadas Kukun – Kukun Kongsi Baru, Kecamatan Rajeg, Kabupaten Tangerang, Banten.
- Jam operasional: 08.00–21.00 (hari buka tidak dispesifikkan).
- Tombol WhatsApp di bagian lokasi memakai tautan chat yang diminta.
- Logo bisnis ditampilkan satu kali di kartu lokasi; ikon Google Maps dan WhatsApp pada tombol tetap memakai ikon layanan masing-masing.

## Catatan galeri dan ulasan
- Galeri menggunakan foto ilustrasi otomotif dari Unsplash melalui URL gambar eksternal; foto tersebut bukan dokumentasi asli BHINEKA MOTOR. Ganti URL gambar pada bagian `#galeri` di `index.html` dengan foto asli bengkel sebelum promosi jika ingin menunjukkan kondisi tempat yang sebenarnya.
- Bagian ulasan menyediakan akses profil Google Maps dan sematan peta. Ulasan Google asli tidak dapat ditarik secara otomatis oleh situs statis ini tanpa API/layanan ulasan yang dikonfigurasi. Jangan menampilkan testimoni atau rating rekaan.
- Formulir ulasan mengirim draf ke WhatsApp pemilik untuk ditinjau.


### Foto otomatis
Foto utama berganti otomatis setiap 1 detik. Galeri juga menampilkan foto ilustrasi dari Unsplash; foto ini bukan dokumentasi asli BHINEKA MOTOR dan dapat diganti dengan foto bengkel sendiri.


## Dashboard admin terintegrasi
Klik tombol **Admin Ulasan** di footer halaman utama untuk membuka dashboard tanpa berpindah ke file lain. Login demo: `admin@bhineka.com` / `admin12345`. Foto galeri asli dari paket sumber dipertahankan.

Catatan: tanpa backend/database, ulasan hanya tersimpan di localStorage browser yang sama; login di sisi browser bukan keamanan server.
