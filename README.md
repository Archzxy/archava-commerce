# KALA marketplace demo

Website marketplace multipage berbahasa Indonesia dengan desain orisinal. Dibangun dengan HTML, CSS, JavaScript, dan server Node.js, dengan widget React untuk Archava. Setiap halaman dirender oleh server dan punya URL sendiri; navigasi, refresh, serta tombol back browser bekerja langsung.

## Jalankan

Pada mesin baru, selesaikan [persiapan Archava](#archava) terlebih dahulu. Untuk menjalankan source yang dependensi, environment, dan widget-nya sudah disiapkan:

```bash
npm run dev
```

Buka http://localhost:5173. Gunakan `PORT=3000 npm run dev` untuk port lain. `npm run dev` menjalankan marketplace, API Archava, dan worker Python. Sesi baru dibuka setelah worker terhubung. Untuk marketplace saja, gunakan `npm run dev:web`.

## Halaman

| URL | Halaman |
| --- | --- |
| `/` | Beranda |
| `/produk` | Katalog 80 produk dengan pagination |
| `/produk?q=tas&sort=price-asc` | Contoh pencarian dan pengurutan |
| `/kategori` | Tujuh kategori |
| `/kategori/elektronik` | Produk dalam kategori; tersedia juga fashion, rumah, kecantikan, olahraga, hobi, makanan |
| `/produk/headphones` | Contoh detail produk; semua produk punya URL masing-masing |
| `/promo` | Katalog potongan harga 20% atau lebih |
| `/bandingkan` | Empat kelompok produk sejenis dan pemilihan produk |
| `/bandingkan?produk=headphones,audia-focus-one,ritme-lite` | Contoh perbandingan tiga headphone; URL bisa dibagikan |
| `/favorit` | Favorit tersimpan |
| `/keranjang` | Keranjang dan jumlah barang |
| `/checkout` | Form penerima dan pratinjau pesanan demo |
| `/akun` | Ringkasan favorit dan keranjang di browser |
| `/bantuan` | Panduan dan FAQ |

URL yang tidak tersedia menampilkan halaman 404.

## Fitur

- 80 produk di 7 kategori, dengan aset lokal dan katalog 12 produk per halaman.
- Pencarian nama/merek/kata kunci Indonesia, filter harga dan rating, serta lima urutan produk. Filter dan pagination tersimpan dalam URL.
- Detail produk, galeri foto jika tersedia, tab informasi, jumlah barang, produk terkait, dan beli sekarang.
- Favorit serta keranjang tersimpan di localStorage dan tersedia saat berpindah halaman, refresh, atau membuka tab lain.
- Checkout demo dengan validasi form, pilihan pengiriman contoh, total harga, dan pratinjau pesanan.
- Layout desktop dan mobile, filter mobile, navigasi keyboard, dan status tombol favorit.
- 12 produk yang bisa dibandingkan dalam empat kelompok: headphone wireless, smartwatch harian, blender dapur, dan sepatu lari. Masing-masing kelompok punya tiga merek dengan kebutuhan serupa.
- Pilih 2–3 produk sejenis dari katalog/detail; pilihan tersimpan saat pindah halaman. Tabel menampilkan harga, atribut dengan satuan yang sama, kecocokan penggunaan, kelebihan, dan kompromi.
- Tampilkan hanya perbedaan, hapus/ganti pilihan, salin link perbandingan, dan tambah produk ke keranjang. Tabel bisa dibuka langsung dari URL, termasuk tanpa JavaScript.

Data produk, harga, stok, rating, dan promo adalah contoh. Form checkout hanya menampilkan pratinjau: tidak membuat pesanan, mengirim data penerima, atau memproses pembayaran. Layanan masuk/daftar akun, newsletter, pembayaran, dan pengiriman belum aktif.

## Data dan aset

Foto awal berasal dari [Unsplash](https://unsplash.com/license). Tambahan 60 produk dan foto contoh berasal dari [DummyJSON Products](https://dummyjson.com/docs/products). Harga rupiah merupakan nilai ilustrasi, tanpa kurs atau inventori langsung.

Delapan produk pesaing tambahan adalah konsep merek fiktif dengan ilustrasi SVG lokal. Spesifikasi pada seluruh 12 profil perbandingan adalah skenario demo; tidak diklaim sebagai spesifikasi pabrikan atau hasil uji produk.

Foto dan font Plus Jakarta Sans serta DM Sans disimpan lokal. Katalog dan font menggunakan aset lokal. Percakapan Ava memakai LiveKit, Gemini, dan Spatius setelah pengunjung menekan **Tanya Ava**. Lisensi font ada di `assets/fonts/`.

- `data/products.js`: katalog yang digunakan server dan browser.
- `data/product-knowledge.js`: knowledge khusus setiap produk, dikurasi dari deskripsi sumber lokal dan profil demo. Menandai RAM/varian, kompatibilitas, ukuran, dan fitur lain yang belum tersedia; tidak mengisi rincian pabrikan dari nama model.
- `data/comparison.js`: kelompok, definisi atribut/satuan, profil perbandingan, dan delapan produk konsep. Setiap profil memiliki `group`, `attributes`, `useCase`, `strengths`, `tradeoffs`, serta sumber `demo`. Struktur ini dipakai oleh tabel perbandingan dan tool katalog Archava.
- `data/seed-products.json`: 12 produk awal.
- `data/catalog-source-products.json`: salinan data sumber yang dipilih.
- `node scripts/expand-catalog.mjs`: bangun ulang katalog dari data sumber; hanya mengunduh foto yang belum tersedia.
- `node scripts/download-assets.mjs`: unduh ulang foto awal dengan akses internet.
- `node scripts/draw-competitors.mjs`: bangun ulang delapan ilustrasi SVG secara lokal.

Referensi UX: [Baymard Product Lists & Filtering](https://baymard.com/research/ecommerce-product-lists).


## Archava

Template Archava diadaptasi di `archava/` menjadi Ava, pendamping belanja KALA. Widget tersedia di semua halaman melalui tombol **Tanya Ava**, termasuk tombol khusus di detail produk dan tabel perbandingan. Satu klik membuka panel avatar dan memulai persiapan panggilan; tombol peluncur tersembunyi selama panel terbuka. Kontrol **Mikrofon**, **Chat**, dan **Disconnect** berada di bawah avatar. Chat tertutup secara default dan dapat dibuka tanpa membuat ulang renderer atau panggilan. Saat panggilan aktif, navigasi memuat halaman dari server sambil menjaga widget dan audio tetap terhubung; URL, refresh, dan tombol back tetap tersedia.

Asisten dibekali indeks 80 produk dan membaca snapshot knowledge yang sama dengan storefront: deskripsi khusus produk, kegunaan, spesifikasi beserta satuan, kelebihan/kompromi jika tersedia, dan detail yang belum diketahui. Saat halaman produk berubah, worker otomatis memasukkan knowledge lengkap produk itu ke konteks percakapan dari ID publik yang sudah divalidasi. Asisten juga mencari berdasarkan kata kunci/budget, membandingkan dua atau tiga produk dalam kelompok yang sama, dan bisa membuka halaman produk atau perbandingan. Tool perbandingan menyisihkan produk di atas budget sebelum mengurutkan prioritas baterai, bobot, atau harga. Konteks hanya berisi URL halaman dan ID produk; tidak memuat isi form penerima. Tool keranjang Archava menampilkan preview dan menunggu konfirmasi sebelum menambah barang ke keranjang demo; undo menjaga perubahan manual pada item tetap aman. Tool tidak membuat pesanan. Harga dan spesifikasi tetap berstatus demo.

Env runtime berada di `archava/.env` yang diabaikan Git dan berizin 600. Profil pribadi disimpan di luar proyek. API key LiveKit/Gemini/Spatius digunakan server dan worker; browser hanya menerima konfigurasi publik dan token sesi singkat. Token/ticket disimpan di memori selama sesi. Batas bawaan 120 detik, tiga permulaan sesi per menit, dan sepuluh sesi aktif.

Persiapan pada mesin baru (Node 22.18+, Python 3.12):

```bash
npm ci --prefix archava
python3.12 -m venv archava/.venv
archava/.venv/bin/python -m pip install -r archava/backend/requirements.txt
npm run setup --prefix archava
```

Command setup mempertahankan konfigurasi KALA yang disertakan dan membuat `archava/.env` dengan kredensial kosong. Isi LiveKit, Gemini, dan ID/key Spatius di file itu. Setel `PORT=5180`, `WEB_ORIGIN=http://localhost:5173,http://127.0.0.1:5173`, dan `ENABLE_SESSIONS=true` di env lokal, lalu:

```bash
npm run build
npm run dev
```

Environment dan virtualenv lokal tidak disertakan di Git. Profil pribadi opsional dijelaskan di [panduan environment](archava/docs/ENV_PROFILES.md). Untuk port marketplace lain, sesuaikan WEB_ORIGIN juga. Log runtime lokal yang disamarkan disimpan di `.logs/` dan tidak masuk source/export.

Setelah data katalog berubah, jalankan `npm run build` untuk memperbarui snapshot dan widget. Setelah mengubah worker, restart `npm run dev`.

Pemeriksaan:

```bash
npm test
cd archava
PATH="$PWD/.venv/bin:$PATH" npm run test:agent
.venv/bin/python backend/integration_tools.py
.venv/bin/python backend/integration_worker.py
npm run build
```

Dari root marketplace, `npm run test:browser` menjalankan skenario belanja dengan transport simulasi; pasang Playwright secara terpisah atau set `PLAYWRIGHT_MODULE_PATH` ke modul yang sudah tersedia. `npm run test:avatar` memerlukan runtime lokal, ID avatar publik, browser Brave, dan display grafis; seluruh permintaan alokasi sesi di tes tersebut dicegat sehingga tidak membuat room provider.


### Verifikasi integrasi lokal

- Baseline terbaru: 75 tes Node/integritas knowledge/protokol, 25 tes Python, 13 tes integrasi SDK, dan build TypeScript/Vite lolos.
- Browser: katalog multipage, perbandingan empat kelompok, keranjang/checkout demo, widget desktop/tablet/mobile 320/390, serta pembatasan akses source/env lolos.
- Sesi nyata memakai profil Spatius + Gemini + LiveKit: konteks produk dikonfirmasi, tool katalog/perbandingan dipanggil, dan panggilan tetap hidup saat navigasi ke detail produk. Untuk budget Rp500.000 dan prioritas baterai, tool memilih SOUNDROOM Rp429.000 / 30 jam dengan kompromi tidak ada ANC.
- Renderer menunggu `onFirstRendering` dari `AvatarView` sebelum meminta sesi, membuat player, attach, connect, dan mengaktifkan mikrofon. Tidak ada gerbang pemeriksaan kapabilitas grafis atau poster PNG. Tes renderer mencakup hasil probe negatif yang tersimpan di SDK, retry setelah grafis pulih, pembatalan startup, dan memulai panggilan kedua setelah Disconnect.
- Pada pengujian, koneksi Spatius juga pernah putus dari sisi layanan. UI mengakhiri sesi dan menawarkan mulai ulang jika host/avatar keluar; tidak mengganti provider diam-diam. Integrasi lokal ini belum dinyatakan sebagai deployment produksi.
- Audit jeda historis: thinking 0; tiga pertanyaan input teks menghasilkan audio pertama Gemini sekitar 1–2,1 detik, sebelum avatar. Worker disiapkan lebih dulu, aset avatar dipreload saat panel dibuka, dan kegagalan startup disampaikan melalui metadata room. Dua panggilan live berurutan pada pengujian berikutnya berhasil menampilkan avatar, mempertahankan sesi saat chat dibuka/tutup, mengubah status mikrofon, dan Disconnect. Pengujian memakai mikrofon simulasi serta input teks, bukan percakapan belanja melalui suara manusia. Hasil dan batas pengukuran ada di [audit latency](archava/docs/LATENCY.md) dan [panduan integrasi](archava/docs/INTEGRATION.md).
- Export source `archava/exports/kala-archava.tar.gz` memakai allowlist dan tidak membawa env pribadi, dependensi, build, atau log runtime.

### Knowledge produk Archava

Audit dan bukti uji ada di [audit knowledge produk](archava/docs/product-knowledge-audit.md). Knowledge berasal dari katalog publik lokal; harga dan spesifikasi tetap berstatus demo. Untuk memperbarui, edit `data/product-knowledge.js` atau profil `data/comparison.js`, jalankan `npm run build`, lalu restart worker.

Evaluasi Gemini realtime memakai model worker yang sama, dengan input teks dan konteks halaman buatan. Evaluasi ini melakukan panggilan provider hanya dengan flag eksplisit:

```bash
archava/.venv/bin/python archava/backend/evaluate_shopping.py --live
```

Report lokal disimpan di `archava/.logs/` yang diabaikan Git/export. Evaluasi ini menguji jawaban dan pemakaian knowledge/tool; tidak menguji ASR mikrofon atau rendering avatar.


### Enam fitur pendamping belanja

Archava sekarang memiliki ringkasan kebutuhan yang bisa dikoreksi, filter katalog lewat tool suara, penunjuk kartu/harga/spesifikasi, kartu rekomendasi dengan fakta dan kompromi katalog, keranjang demo dengan preview/konfirmasi/undo, serta ringkasan setelah sesi. Ringkasan kebutuhan dan shortlist tersimpan pada tab yang sama maksimal 24 jam. Saat sesi berakhir, ringkasan ditampilkan sebelum panel untuk melanjutkan percakapan.

Tindakan menunggu receipt browser; timeout berarti hasil belum diketahui. Perintah berulang tidak menambah barang dua kali. Konfirmasi suara diperiksa dari giliran pengguna yang baru setelah pertanyaan konfirmasi, bukan dari argumen model. Tombol konfirmasi juga tersedia. Perubahan kebutuhan membatalkan shortlist dan preview lama.

Panduan, protokol, dan skenario pengujian ada di [fitur pendamping belanja](archava/docs/ASSISTANT_FEATURES.md). Implementasi dan pengujian browser menggunakan transport agent simulasi; percakapan Gemini/Spatius live belum diuji ulang untuk keenam fitur ini. Jalankan ulang runtime setelah perubahan worker.

## Deployment

Repositori memuat storefront, widget, API sesi, dan worker. Command root saat ini menargetkan pengembangan lokal. `archava/Dockerfile` dan `archava/compose.yaml` hanya mengemas modul Archava; keduanya belum mengemas storefront KALA sebagai deployment lengkap. Deployment Google Cloud belum dilakukan. Arsip dari `npm run export --prefix archava` juga hanya membawa modul Archava, bukan seluruh marketplace.


### Peran sales advisor

Prompt Archava diarahkan untuk melayani sekaligus mewakili KALA: menggali kebutuhan, menghubungkan manfaat produk ke kebutuhan pembeli, memilih satu rekomendasi utama, menangani keberatan, dan menawarkan satu langkah berikutnya sesuai kesiapan pembeli. Manfaat toko berasal dari knowledge `store_service`; contoh penjualan dibentuk dari harga, ranking budget, dan kompromi katalog terbaru. Perubahan ini baru diverifikasi pada perakitan prompt, source, dan tes offline, belum pada kepatuhan model live atau peningkatan konversi. Panduan uji ada di [prompting](archava/docs/PROMPTING.md).
