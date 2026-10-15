# Audit knowledge produk — KALA / Archava

Tanggal: 4 Oktober 2026. Model yang diuji: `gemini-2.5-flash-native-audio-preview-12-2025`, sama dengan worker lokal.

## Temuan

1. Ringkasan awal model menjelaskan toko dan jumlah produk. Model tidak menerima daftar barang pada awal sesi.
2. Sebanyak 60 listing tambahan menggunakan deskripsi dan tiga highlight generik per kategori. Detail produk seperti Beats Flex menjadi hilang meskipun deskripsi sumber lokal memuatnya.
3. Tool konteks halaman mengirim nama, harga, dan ID. Sesudah ditambah highlight, model masih bisa menganggap tiga highlight itu sebagai seluruh pengetahuan produk dan mengatakan ANC/multipoint belum diketahui.
4. Model pernah mengirim `headphones` / `wireless headphones` sebagai kategori. Kategori katalog yang benar adalah `Elektronik`; pencarian lama mengembalikan kosong tanpa menjelaskan filter yang salah.
5. Instruksi tool penjelasan website bertabrakan dengan instruksi tool produk. Dalam evaluasi, model juga sempat mencampur kompromi RITME ke rekomendasi SOUNDROOM.

## Perubahan

- Seluruh 80 produk memiliki `knowledge`: ringkasan khusus item, kegunaan, spesifikasi/fakta yang tercatat, kelebihan dan kompromi jika tersedia, rincian yang belum diketahui, serta sumber berstatus demo.
- Sebanyak 60 deskripsi sumber dikurasi dari snapshot DummyJSON lokal. Profil fiktif perbandingan tetap menjadi sumber atribut 12 produk pembanding. Hasil akhirnya: 59 profil memakai deskripsi sumber, 12 memakai profil perbandingan, dan 9 memakai data katalog awal.
- Storefront dan asisten membaca data yang sama. `data/product-knowledge.js` memperkaya katalog; script sync menghasilkan `archava/config/catalog.json`. Template Archava tetap dapat berjalan dari snapshot itu tanpa mengimpor folder induk.
- Prompt dibekali indeks seluruh produk: ID, nama, merek, harga, kategori, highlight, dan kelompok perbandingan. Tool merchandise dipisahkan dari tool informasi fitur website.
- Halaman detail dan pilihan perbandingan menyediakan knowledge lengkap. Worker memasukkan snapshot knowledge ke history Gemini saat menerima revisi halaman yang valid. Ini tidak memicu ucapan baru. Revisi usang tidak mengganti konteks terbaru; ACK tetap memakai pasangan halaman/revisi yang ditangkap.
- Browser tetap mengirim route dan ID yang dibatasi, bukan deskripsi, instruksi, atau form pribadi. Seluruh fakta tambahan diambil worker dari snapshot katalog lokal.
- Filter kategori dibatasi enum yang sesuai katalog. Filter tidak valid menghasilkan error/retry dengan budget yang sama, sehingga kegagalan filter tidak berubah menjadi klaim barang tidak tersedia.
- Ranking budget/baterai/bobot/harga menghasilkan `recommendedProduct`, berisi fakta dan kompromi kandidat tersebut. Respons perbandingan dipadatkan agar profil kandidat mudah dibedakan. Bobot blender menggunakan kilogram, sesuai data kelompoknya.
- Rincian model yang tidak tercatat tetap tidak diketahui: misalnya chip/RAM MacBook, generasi AirPods, proteksi UV kacamata, serta watt/port charger. Nama listing tidak membuktikan spesifikasi atau ketersediaan produk nyata.

Kontrak tool memakai deskripsi parameter, enum, dan validasi server, sejalan dengan [panduan function calling Google](https://ai.google.dev/gemini-api/docs/function-calling#best-practices).

## Verifikasi

- 59 tes Node: 3 integritas knowledge/snapshot dan 56 tes aplikasi/protokol.
- 14 tes Python guardrail/katalog, termasuk recovery kategori yang salah, fakta produk di luar kelompok perbandingan, bool/satuan, dan ranking budget.
- 10 tes integrasi SDK: 5 tool/schema/sinkronisasi knowledge, 5 lifecycle worker/ACK/expiry/provider.
- Build TypeScript/Vite lolos. Browser multipage dan widget desktop/mobile lolos; module knowledge publik dapat dimuat dan tidak memicu error browser.
- Delapan skenario diuji pada Gemini realtime dengan input teks. Skenario budget diuji ulang setelah respons rekomendasi dipadatkan; report mencatat tahap pengujian tiap kasus.

| Skenario | Fakta/hasil yang diperiksa |
| --- | --- |
| Penemuan headphone | Tiga alternatif dikenal, perbedaan dijawab dari tool perbandingan |
| Produk yang sedang dibuka | SOUNDROOM: 30 jam, multipoint tersedia, ANC tidak ada |
| Budget dan follow-up | Rp500 ribu + baterai: SOUNDROOM Rp429 ribu/30 jam; alternatif lebih murah RITME Rp359 ribu/24 jam; fitur tidak tertukar |
| Komuter dengan ANC | Budget Rp600 ribu: AUDIA dengan ANC dan 40 jam |
| Produk di luar kelompok comparison | Beats Flex: baterai 12 jam dan earbud magnetik |
| Detail yang tidak tersedia | RAM/chip MacBook tidak diisi dari tebakan |
| Pergantian halaman | Beats Flex 12 jam berubah ke SOUNDROOM 30 jam/tanpa ANC dalam sesi yang sama |
| Blender | Blender Dapur: 1,5 liter, 350 watt, gelas penggiling tersedia |

Jawaban publik dan panggilan tool dari skenario buatan tersedia dalam `product-knowledge-evaluation.json`. Evaluator opt-in ada di `backend/evaluate_shopping.py`; flag `--live` diperlukan untuk melakukan panggilan provider. Tidak ada provider call di unit tests.

## Batas hasil

Harga, stok, rating, klaim deskripsi, dan spesifikasi tetap data demo. Snapshot DummyJSON bukan bukti spesifikasi pabrikan. Evaluasi ini memakai input teks dan konteks halaman buatan; ASR mikrofon dan avatar tidak diuji ulang dalam audit knowledge ini. Sebuah pengujian awal sempat mendapat internal error 1011 dari Gemini; kasus tersebut berhasil pada pengujian berikutnya. Hasil skenario ini tidak menjamin semua jawaban model akan selalu benar.

## Memperbarui knowledge

1. Edit data katalog awal, `data/product-knowledge.js`, atau `data/comparison.js` sesuai fakta yang tersedia.
2. Jalankan `npm run build` dari root untuk memperbarui snapshot publik dan widget.
3. Jalankan tes dan restart worker lokal agar snapshot/prompt baru dimuat.
4. Untuk mengecek jawaban model, jalankan `archava/.venv/bin/python archava/backend/evaluate_shopping.py --live`. Report mentah masuk folder log lokal yang tidak diekspor.
