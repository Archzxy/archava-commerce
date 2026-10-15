# Respons dan waktu tunggu Archava

## Pemeriksaan 14 Oktober 2026

Kredensial runtime baru berhasil menjalankan Spatius, menampilkan avatar, dan
mencapai playback audio. Pada satu sesi pengunjung, metrik provider Gemini
berubah antara 686–2039 ms dan frame audio pertama sampai RPC playback Spatius
antara 899–1628 ms. Ini menunjukkan variasi pada kedua tahap, tetapi bukan
pengukuran selesai bicara sampai suara terdengar, dan belum memisahkan beban
provider dari perjalanan jaringan. Region Spatius otomatis memilih
`ap-northeast`; worker LiveKit terdaftar di India South.

## Riset ulang renderer — 15 Oktober 2026

Screenshot terbaru menunjukkan AV-G1 sebelum room dibuat. Itu kode host dari
hasil `AvatarSDK.isDeviceSupported()`, bukan error kredit atau server suara.
Pemeriksaan source SDK 1.3.9 menemukan `probeRenderCapability()` menyimpan hasil
pertama di variabel modul `cached`. Hasil false tidak diperiksa ulang selama
halaman hidup, termasuk setelah pemanggilan `AvatarSDK.cleanup()`. Mengosongkan
promise host saat error tidak mengosongkan cache internal SDK ini. Maka tombol
Coba lagi sebelumnya bisa mengulang false yang sama tanpa mencoba wajah.

Reproduksi terisolasi memakai byte SDK/WASM Onchain yang identik dengan KALA,
Brave headed, avatar publik yang sama, dan tanpa RTC. Fault injection menolak
probe grafis awal, lalu memulihkan akses grafis sebelum membuat view. Hasilnya:

| Kondisi | Pemeriksaan awal | Pemeriksaan setelah pulih | First frame nyata |
| --- | --- | --- | --- |
| Grafis normal | true | true | terlihat, 518×411 |
| Probe awal gagal, grafis dipulihkan | false | false | terlihat, 518×411 |

Kedua kasus membuat nol sesi provider dan nol page error. Ini membuktikan
kelemahan penghalang/retry host, bukan bukti bahwa fault injection itu penyebab
awal pada profil pengguna. Penyebab probe awal pengguna tetap belum terkonfirmasi;
AV-G1 tidak cukup untuk menyatakan pengaturan akselerasi pasti salah.

Penghalang `isDeviceSupported()` dan kode AV-G dihapus. Widget kini memuat asset,
membuat view yang terlihat, dan menunggu `onFirstRendering` dengan deadline
30 detik/cancellation. Baru sesudah wajah siap, widget meminta ticket, membuat
AvatarPlayer, attach, connect dan mengaktifkan mikrofon. Canvas dan Room yang
sama bertahan dari persiapan sampai percakapan. Ticket yang datang setelah
Disconnect langsung diakhiri; gagal render tidak membuat sesi provider.
Coba lagi membuat view baru tanpa bergantung pada probe yang sudah tersimpan.

Urutan first render sebelum player mengikuti dokumentasi resmi. Template lokal
Platform/Onchain yang lama membuat player segera setelah constructor; urutan itu
pernah diikuti secara keliru dan telah dikoreksi. Tidak ada poster PNG, pemaksaan
backend, perubahan quality, edit node_modules, atau pengubahan profil Brave
pengguna. Jika render nyata gagal, AV-R1 menyertakan tahap terakhir yang terbatas;
kode itu tidak menyimpulkan penyebab browser/driver.

Runner host `scripts/avatar-browser.mjs` menguji widget hasil build dengan
asset publik dan seluruh POST sesi diintersep. Ia menguji grafis normal,
probe false, pemulihan grafis dan Coba lagi pada halaman yang sama, serta
Disconnect saat render masih menunggu. Laporan dan screenshot lokal masuk
`.logs/avatar-browser/`. Keempat kasus lulus dan screenshot wajah diperiksa;
pemeriksaan blank canvas SDK tidak melaporkan gambar kosong pada kasus sukses.
Uji ini tidak memakai sesi provider. Uji live terpisah juga lulus: first frame
mendahului POST sesi, canvas yang sama bertahan sampai mikrofon aktif, serta
Chat/minimize/reopen/resize tidak mengganti canvas. Ada satu sesi, satu websocket
LiveKit dan nol page error. Mikrofon sintetis tidak membuktikan kualitas pengenalan
ucapan atau latensi percakapan alami.

Pemeriksaan berikutnya mengulang Disconnect lalu mulai lagi pada halaman yang
sama. View pertama dibuang dan view baru berhasil merender sebelum request sesi
kedua. Dua sesi live berturut-turut lulus, satu websocket per sesi, tanpa page
error; build yang dilayani localhost juga cocok dengan source hasil build dan
tidak memuat penghalang AV-G1 pada entry aktif.

Sumber primer:

- [Spatius LiveKit client](https://docs.spatius.ai/livekit-agents/client): inisialisasi, load, view, tunggu first render, baru player/connect; tidak mensyaratkan isDeviceSupported sebagai penghalang.
- [Spatius RTC adapter](https://docs.spatius.ai/sdk-reference/web-sdk/rtc-adapter): attach ke host-owned Room sebelum connect dan singlePeerConnection false.
- [AvatarKit reference](https://docs.spatius.ai/sdk-reference/web-sdk/reference): pemeriksaan perangkat, callback first render, persyaratan container dan cleanup.
- Source terpasang `@spatius/avatarkit` 1.3.9: `utils/render-capability.ts` menyimpan hasil probe; `AvatarSDK.isDeviceSupported()` memakai hasil itu; `AvatarView` menginisialisasi renderer secara mandiri. Source dependency tidak diubah.

## Hasil pemeriksaan 4 Oktober 2026

Thinking sudah `0` sebelum pemeriksaan. Status `thinking` di LiveKit/UI menunjukkan agent menyiapkan respons; status itu tidak mengukur hidden reasoning Gemini.

Tes langsung memakai **prompt produksi lengkap, knowledge produk, tool asli, model native audio yang sama**, dengan input teks. Angka di bawah mengukur pesan dikirim sampai **frame audio pertama model**, sebelum Spatius dan speaker browser:

| Pertanyaan | Audio pertama model | Waktu sampai seluruh jawaban selesai |
| --- | ---: | ---: |
| Pilihan jam | 2.083 detik | 17.689 detik |
| Baterai dan ANC produk terbuka | 0.994 detik | 12.251 detik |
| Perbandingan headphone, budget Rp500.000 | 1.353 detik | 21.965 detik |

Tiga sampel ini bukan benchmark P95 atau jaminan waktu respons. Pertanyaan pertama dapat menyertakan koneksi model. Durasi seluruh jawaban mencakup audio yang terus dihasilkan; **durasi itu bukan jeda sebelum jawab**. Perbandingan memanggil tool lokal dalam waktu kurang dari 1 ms; perjalanan model sebelum/sesudah tool termasuk pengukuran audio pertama. Lihat [report numerik](latency-evaluation.json).

Pada log sesi sebelumnya, selisih transkrip user yang dikomit sampai Spatius mulai playback sekitar 4,8 detik pada satu giliran tanpa tool. Ini petunjuk adanya jeda pada percakapan, **bukan** pengukuran selesai bicara: transkrip native juga bisa dikomit setelah jawaban sudah mulai. Belum ada angka terpisah yang dapat dipercaya untuk VAD, perjalanan avatar, dan speaker pada sesi tersebut.

Tes avatar terbaru ditolak Spatius dengan `creditsExhausted` / `insufficient credits`: kredit tersisa 4, minimum 10. Ini menggagalkan startup, sehingga tambahan jeda avatar belum bisa diukur ulang. UI sebelumnya bisa terus menunggu ketika worker gagal sebelum guest bergabung.

## Perubahan yang diterapkan

- Worker menyiapkan **satu proses idle** sebelum panggilan, tetap dengan named dispatch. Sebelumnya mode `dev` menyiapkan nol proses, dan satu panggilan tercatat menunggu proses baru sekitar 2,2 detik. Log terbaru menunjukkan proses siap sebelum worker terdaftar; panggilan uji tidak menerima peringatan `no warmed process`.
- Aset Spatius mulai dipreload **saat panel dibuka**. Sebelumnya jalur widget marketplace baru memulai preload setelah tombol Mulai ditekan. Inisialisasi dan aset memakai promise/cache yang sama; preload tidak membuat room, meminta mikrofon, atau memulai sesi avatar berbayar. Browser memverifikasi preload sebelum ada POST sesi.
- Worker menyimpan kode kegagalan startup publik di metadata room. Guest yang datang setelah kegagalan tetap mendapat pesan, lalu UI menutup sesi miliknya. Raw error/credential tidak dikirim ke browser. Browser nyata menampilkan pesan kredit dan mengirim satu permintaan end; tidak menunggu sampai timer sesi berakhir. Batas waktu worker tetap berlaku bila browser tidak pernah bergabung.
- Log per tahap untuk koneksi room/avatar, startup model, frame audio pertama, tool, dan audio-ke-playback. Audio node meneruskan tiap frame tanpa buffer tambahan. Log tidak berisi transkrip, argumen tool, atau kredensial.

Knowledge semua produk, model, suara, thinking, dan provider tetap dipertahankan. Tes prompt diagnostik yang dipersingkat tidak membuktikan bahwa panjang prompt adalah penyebab utama: giliran pertama dapat menyertakan setup model, dan jawaban yang dihasilkan berbeda. Karena itu katalog tidak dipangkas berdasarkan dugaan.

## Parameter dan batas pengukuran

| Bagian | Pengaturan |
| --- | --- |
| Percakapan | Gemini realtime native audio, tanpa pipeline STT → LLM → TTS terpisah |
| Model/suara | `gemini-2.5-flash-native-audio-preview-12-2025`, `Kore`; environment bisa mengganti |
| Thinking | `thinking_budget=0` |
| SDK endpointing | `min_delay=0.15`, `max_delay=0.6` |
| Interruption | Aktif, `min_duration=0.8`, `min_words=1` |
| Native speech detection | Automatic VAD Gemini; tidak diubah dalam pemeriksaan ini |
| Spatius audio | Ogg Opus default, `audio_output=False` untuk output langsung worker |
| Browser | First render → buat player → attach → connect; `singlePeerConnection=false` |

Endpointing SDK bukan janji total jeda atau konfigurasi silence server Gemini. Pada plugin Google terpasang, event `input_speech_stopped` juga dipakai setelah generation selesai; jangan memakainya sebagai waktu akhir suara mikrofon. SDK provider TTFT dihitung setelah response creation, sehingga 324–416 ms di report juga tidak sama dengan waktu user selesai bicara sampai terdengar jawaban. [Metrik LiveKit](https://docs.livekit.io/reference/recipes/metrics_realtime/) dan [VAD Gemini](https://ai.google.dev/gemini-api/docs/live-api/capabilities) menjelaskan bagian pengukuran/pengaturan masing-masing.

Untuk mengulang tes native audio (memerlukan kredit Gemini, tanpa avatar):

```bash
.venv/bin/python backend/evaluate_latency.py --live
```

Report lokal masuk `.logs/latency-evaluation.json`, diabaikan oleh export. Untuk mengukur panggilan lengkap setelah kredit Spatius tersedia, pakai mikrofon nyata dan catat akhir suara input, frame model pertama, serta `[latency] audio_to_playback`. Pisahkan startup klik→siap, giliran selesai bicara→awal suara, dan interupsi→suara berhenti. Uji pada perangkat dan jaringan yang sama; region, koneksi, dan beban provider masih bisa memengaruhi hasil.
