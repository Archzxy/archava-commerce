# Respons dan waktu tunggu Archava

## Paket upgrade model/service sudah di cloud — 18 Oktober 2026

Source/example default sekarang Gemini 3.8 Live dengan SDK Python 1.8.8,
pengaturan thinking per model dan tool commerce BLOCKING secara eksplisit.
AvatarKit menjadi 1.3.10, LiveKit browser 2.23.0 dan protocol 1.52.1; first-frame,
prewarm, audio streaming, room ownership dan konfirmasi tidak diubah. Env/model
cloud sekarang memilih `gemini-3.8-live` melalui secret versi 3, pada revisi
`dopamine-gemini38-20261018` yang menerima 100% traffic. Readback memastikan hanya
model yang berubah dalam secret; resources, provider dan batas sesi dipertahankan.
Build cloud berhasil sesudah npm 10 bawaan image diselaraskan ke npm 12.2.0 dan
Node 22.23.3. Instalasi/build bersih juga diuji memakai Node 22 yang sebenarnya.

Uji langsung Gemini 3.8 dengan **input teks** menghasilkan audio pertama dalam
536 ms setelah submit (satu sampel; setup 2351 ms). Ini bukan ucapan manusia,
latency avatar/RTC, hasil A/B, atau jaminan respons 536 ms di aplikasi. Percobaan
baseline browser lama berhenti sebelum alokasi sesi sehingga tidak menjadi
pembanding. Simpan percobaan gagal bersama hasil lanjutan; bukti rollout ada di
`.logs/service-rollout-20261018/` pada root store. Lookup metadata sebelumnya
tetap hanya pembacaan dan tidak boleh menggantikan bukti inference ini.

Tiga sesi browser nyata mencapai worker revisi baru dan menampilkan wajah.
Sesi terakhir memakai **input teks**: filter headphone maksimal 500 ribu diterapkan,
preview checkout tampil, canvas/keranjang bertahan dan Chat ditutup. Worker
mencatat receipt filter `applied` 472 ms dan checkout `review_ready` 585 ms.
Tidak ada QR/payment yang dibuat; satu receipt cepat belum menjelaskan timeout
20 detik sebelumnya. Semua call diakhiri HTTP 200, browser ditutup dan room akhir
0/0. Uji filter lewat WAV Indonesia **belum lolos** meskipun input utuh dan audio
remote terdeteksi. Interval deteksi 581 ms tidak memiliki pasangan balasan semantik
tervalidasi dan dikeluarkan dari klaim performa; satu input lain tumpang tindih audio.

Cold browser sempat melewati deadline aset 60 detik tanpa membuat room. Tes jaringan
lebih panjang mencapai kesiapan aset sekitar 145 detik setelah mulai harness;
setelah klik, frame tampil sekitar 2,9 detik. Trace menunjukkan chunk avatar sekitar
7,4 MB dan template publik Spatius 29.289.096 byte terkompresi. Dua QA selanjutnya
memakai salinan template publik yang identik dari cache lokal tes (satu frame 703 ms
setelah klik); ini bukan perbaikan unduhan produksi atau janji startup pertama.
Log revisi baru: tiga worker→ready 3321–4188 ms dan empat audio-frame→playback RPC
881–3870 ms. Sampel campuran kecil tanpa A/B, bukan human E2E; TTFT provider 3.8
belum tersedia/null dalam trace ini, bukan nol. Batas pengukuran dan kasus gagal
harus tetap dicatat bersama hasil yang lulus.

Tes setup SDK memverifikasi request 3.8 tanpa opsi usang, native VAD 300 ms,
21 deklarasi tool yang menunggu hasil dan update konteks tanpa memotong jawaban.
Log tool sekarang mencatat `receiptCode` checkout yang di-allowlist, tanpa order,
receipt token atau input pengunjung. Unknown/timeout tetap tidak terkonfirmasi.
Model TTFT/RPC playback belum menjadi pengukuran human E2E. Tes source/browser
lulus termasuk wajah nyata dan pembayaran sintetis; tidak membuktikan respons
suara lebih cepat. Detail versi, sumber primer, hasil dan prosedur aktivasi ada
di [panduan upgrade](SERVICE_UPGRADE.md). Bukti latency cloud historis di bawah
tetap milik revisinya masing-masing.

## Adaptasi referensi dan startup lokal — 18 Oktober 2026

Perbandingan source Onchain/Platform menemukan preload aset avatar otomatis saat
pengunjung membaca halaman; widget ini sebelumnya menunggu hover/focus/klik.
Source lokal sekarang memuat aset publik saat browser idle (melewati tab tersembunyi
dan mode hemat data), tanpa AvatarView, mic atau room. Setelah klik dan readiness
terbaru lolos, izin mic serta render wajah berjalan bersamaan. Room tetap menunggu
first frame nyata **dan** izin mic. Disconnect membatalkan percobaan; track mic
yang datang terlambat dihentikan tanpa membuat room.

ACK marketplace kini dikirim sesudah worker menerima paket guest/page/revision
yang valid, terpisah dari update history Gemini. Model sync yang tertahan tidak
lagi menahan ACK navigasi; tool konteks sudah dapat membaca state yang diterima.
Ini bukan receipt keranjang/checkout dan tidak membuktikan model selesai membaca
history. Sinkronisasi tetap berjalan, deduplikasi/lock dan cleanup dipertahankan.

Verifikasi baru: 3 catalog + 86 module Node, 35 Python unit, 16 SDK offline,
build, browser belanja 17 skenario pada tiga lebar dan tujuh skenario renderer
Brave lulus. Uji SDK menahan model sync dan tetap menerima ACK revisi tepat;
paket guest asing diabaikan. Uji renderer mencakup preload tanpa mic/room, izin
mic menunggu/ditolak/datangan terlambat, cached-false, graphics recovery, cancel
dan start ulang. Tidak ada room provider atau socket RTC; semua alokasi dicegat.

Satu run lokal setelah aset siap mencatat **528 ms klik harness → callback first
frame**. Ini bukan A/B atau janji cold click, startup call, maupun latency suara.
Screenshot wajah/controls diperiksa. Source referensi WhiteRock memakai Tavus dan
default Gemini 3.1, sehingga persepsi kecepatannya belum membuktikan pengaruh satu
parameter. Prompt commerce ter-render saat perbandingan 35923 karakter dan 21
tool, dibanding 5032–8645 karakter dan 3–6 base tool pada referensi; ukuran source
bukan token count atau bukti penyebab delay. Model/provider/prompt/VAD/audio buffer
tidak diubah. Belum ada uji percakapan provider baru atau rollout perubahan ini;
angka cloud dan gap pengukuran sebelumnya tetap berlaku.

## Riset lanjutan dan pembacaan ulang cloud — 18 Oktober 2026

**Hasil riset, belum perbaikan latency baru.** Pengguna meminta riset internet.
Dokumentasi primer dicocokkan dengan source SDK yang terpasang dan log yang
sudah ada; tidak ada panggilan suara/payment baru, perubahan provider/model,
restart, upgrade dependency atau rollout. Bukti numerik yang sudah disanitasi
ada di `.logs/latency-research-20261018/` pada root store, di luar export modul.

Pembacaan tanggal 18 Oktober mencakup **147 record latency**, empat revisi dan
12 job. Ini campuran QA teks/audio sintetis, greeting, percobaan gagal dan
browser TCP kandidat; bukan benchmark ucapan manusia atau perbandingan A/B.
Readback terbaru memastikan revisi aktivasi Midtrans masih menerima 100% traffic,
VAD 300 ms, 1 vCPU / 2 GiB, service minimum/maksimum satu instance dan CPU tidak
di-throttle di luar HTTP request. CPU/memory pressure belum diukur.

| Tahap | Semua revisi, n: min / median sampel / max | Revisi aktif, n: min / median sampel / max |
| --- | --- | --- |
| Provider TTFT valid | 21: 311 / 715 / 3999 ms | 5: 715 / 1366 / 1539 ms |
| Frame audio pertama → RPC playback Spatius | 25: 825 / 1090 / 2031 ms | 5: 901 / 1873 / 2031 ms |
| Worker masuk job → ready | 12: 2458 / 3104,5 / 5048 ms | 4: 2505 / 3104,5 / 3977 ms |
| Tool prepare checkout | 3: 1178 / 3752 / 20003 ms | 2: 3752 / 11877,5 / 20003 ms |

Median hanya deskripsi sampel tersebut. Tidak ada P95 populasi yang bisa
dipercaya dari sampel kecil dan kondisi berbeda ini. Jangan menjumlahkan kolom
sebagai E2E atau menyimpulkan Midtrans/VAD menyebabkan perubahan antar-revisi.
13 dari 34 record model tidak memiliki TTFT valid dan tidak masuk tabel TTFT.
Nilai 20003 ms cocok dengan deadline checkout receipt 20 detik, tetapi log belum
membuktikan di tahap mana receipt terlambat/hilang. Outcome checkout belum masuk
allowlist logger karena protokolnya memakai `code`, bukan `status`.

Temuan dan urutan tindakan yang disarankan:

1. **Ukur selesai ucapan → output browser lebih dulu.** Pisahkan waktu akhir
   suara input, model audio pertama, pengiriman audio ke Spatius, RPC playback,
   audio browser mulai serta receipt tool. Gunakan ID giliran/request internal
   dan satu clock lokal untuk setiap selisih; jangan kurangkan timestamp browser
   dan worker tanpa sinkronisasi. RPC worker bukan pengukuran speaker fisik,
   dan `LatencyTrace.first_audio` saat ini hanya satu slot tanpa ID giliran;
   interupsi/stream tumpang tindih perlu ditandai agar tidak salah dipasangkan.
   Event `input_speech_stopped` Google plugin 1.7.1 dikirim setelah generation
   selesai, sehingga tidak layak menjadi awal timer selesai bicara.
   [Definisi tahapan LiveKit](https://docs.livekit.io/reference/agents/session-traces/).
2. **Telusuri variasi avatar/RTC dan timeout receipt.** Catat allowlist numeric
   WebRTC RTT, jitter, packet loss, jenis transport terpilih, reconnect dan alasan
   disconnect, tanpa IP/SDP/token. Kegagalan QA sebelumnya memuat channel/transport
   closed sesudah worker ready; belum membuktikan ICE, browser, Cloud Run atau
   provider sebagai akar masalah. Bedakan timeout aplikasi 20 detik dari timeout
   harness yang menunggu jumlah transkrip baru dan state listening. Pertahankan
   UDP/TCP/TURN fallback SDK; percobaan TCP tunggal bukan bukti perlu memaksa TCP.
   [Kebutuhan jaringan LiveKit](https://docs.livekit.io/deploy/admin/firewall/).
3. **Pertahankan streaming dan sinkronisasi avatar yang benar.** Host meneruskan
   tiap frame; plugin 1.7.1 mengirim audio langsung dan `end=True` saat segment
   berakhir, memakai Ogg Opus 20 ms. Tidak ditemukan buffer seluruh kalimat di
   source ini. Attach ke Room milik host memang mengharuskan host memainkan audio;
   `RoomAudioRenderer` tidak otomatis berarti audio ganda. Motion jitter buffer
   RTC adapter 1.1.5 default 80 ms; menonaktifkannya tidak terbukti menghilangkan
   interval RPC 1–2 detik dan dapat merusak kelancaran. Ukur sebelum mengubahnya.
   [Kontrak adapter Spatius](https://docs.spatius.ai/sdk-reference/web-sdk/rtc-adapter),
   [petunjuk streaming Spatius](https://www.spatius.ai/faq/).
4. **Evaluasi VAD 300 vs 500 ms dengan jeda alami Indonesia; jangan turunkan lagi
   berdasarkan dugaan.** Google saat dibaca menyarankan 500–800 ms sebagai
   keseimbangan umum dan memperingatkan cutoff pada nilai terlalu pendek.
   Ini panduan umum, bukan bukti bahwa konfigurasi model 2.5 kita rusak.
   Native Gemini mengendalikan batas giliran di runtime ini; `min_delay=0.15`
   LiveKit bukan tombol untuk menjamin respons terdengar 150 ms. Belum ada
   implementasi client VAD/hybrid yang kompatibilitasnya diuji pada pin saat ini.
   [Google VAD](https://ai.google.dev/gemini-api/docs/live-api/capabilities#understanding-vad-parameters-and-their-impact-on-quality),
   [Gemini turn detection LiveKit](https://docs.livekit.io/agents/models/realtime/gemini/#turn-detection).
5. **Kurangi diam saat aksi lama tanpa mendahului receipt.** Investigasi jalur
   worker request → browser → HTTP → signed receipt → worker ack, terutama
   checkout 20003 ms. Balasan singkat bahwa aksi sedang diproses dapat membantu
   persepsi, tetapi tidak mempercepat API dan tidak boleh mengumumkan sukses.
   Gemini 2.5 mendukung non-blocking tools, namun harus diuji dengan scheduling,
   cancellation, idempotency dan consent yang ada; jangan mengubah seluruh tool
   mutation menjadi paralel. `session.say()` dari contoh pipeline memerlukan
   TTS terpisah bila runtime native audio tidak menyediakan TTS.
   [Google tool behavior](https://ai.google.dev/gemini-api/docs/live-api/tools#asynchronous-function-calling),
   [desain loop tool LiveKit](https://docs.livekit.io/agents/logic/tools/design/#manage-loop-latency).
6. **Evaluasi prompt/model setelah tahap di atas terukur.** Prompt lokal ter-render
   35525 karakter, dengan 21 function tools; ini ukuran source, bukan token count
   atau bukti penyebab delay. Prompt sudah meminta jawaban pendek, context update
   sudah dideduplikasi dan plugin 2.5 mengirim append context tanpa reconnect.
   Hindari lookup berulang bila fakta terbaru sudah ada, tetapi jangan hapus
   katalog, consent atau fakta unknown demi kecepatan. Model Live yang lebih baru
   adalah kandidat benchmark terpisah, bukan drop-in change: panduan saat ini
   mengubah thinking/tool semantics dan source pin kita belum memvalidasinya.
   [Panduan migrasi model Google](https://ai.google.dev/gemini-api/docs/models/gemini-3.8-live).

Region worker Singapore belum membuktikan lokasi media/inference seluruh jalur.
Spatius saat ini menawarkan `ap-northeast`, `us-west`, `cn-beijing`, bukan region
Singapore; SDK memilih otomatis dan dokumentasinya menyarankan membiarkan region
unset dalam penggunaan normal. LiveKit juga menyarankan routing edge otomatis.
Jangan menganggap pindah GCP Jakarta atau pin region menghilangkan delay.
[Region Spatius](https://docs.spatius.ai/api-reference/regions),
[routing LiveKit](https://docs.livekit.io/deploy/admin/regions/).
Minimum instance + CPU selalu aktif sudah mengurangi risiko cold start/CPU idle;
itu bukan bukti kapasitas cukup atau jaminan instance tidak akan diganti.
Timeout HTTP 60 detik tidak mengukur batas koneksi media browser→LiveKit.
[CPU background Cloud Run](https://docs.cloud.google.com/run/docs/configuring/billing-settings).

Rencana ukur berikutnya: izin uji provider terpisah, perangkat/jaringan sama,
giliran tanpa tool dan dengan tool dipisah, greeting/startup dipisah, kalimat
Indonesia dengan jeda, koreksi budget, interupsi, navigasi dan checkout. Catat
P50/P95 setelah sampel memadai beserta turn cutoff, reconnect, timeout dan
receipt outcome; kegagalan tidak boleh dibuang dari laporan. Sasaran awal produk
yang diusulkan untuk percakapan ringan setelah ready: **P50 ≤2 detik, P95 ≤3
detik selesai bicara→output browser**, bukan hasil terverifikasi atau SLA.
Jika ekor latency didominasi avatar/provider, laporkan batas itu sebelum
mengubah provider atau menambah biaya. Source/render lifecycle tetap dipertahankan.

## Tuning sudah diterapkan ke cloud — 18 Oktober 2026

Sesudah audit/persiapan di bawah, pengguna secara eksplisit meminta penerapan
langsung ke cloud. Versi produksi sekarang memakai **native Gemini silence
duration 300 ms** dan log outcome tool. Readback konfigurasi, routing 100%, HTTP
200 dan panggilan provider nyata sudah diverifikasi. Model/suara/thinking,
resource server dan alur first-render avatar dipertahankan.

Dua sesi Brave headed terbatas membuktikan avatar tampil, input audio sintetis
dikenali dan mendapat balasan. Permintaan filter terpisah memperoleh receipt
`applied` (1455 ms), browser membuka kategori Elektronik dengan query headphone
dan batas harga 500000, dan kedua produknya memenuhi budget. Disconnect terakhir
mengembalikan 200; browser uji ditutup dan room produksi tersisa nol.

Runner gabungan pertama tidak menyelesaikan filter yang diminta. Runner lanjutan
keliru hanya menerima rute `/produk`, sehingga melaporkan timeout meskipun rute
kategori dan receipt sebenarnya benar. Laporan asli dipertahankan; pemeriksaan
rute untuk pemakaian berikutnya sudah diperbaiki tanpa panggilan provider ketiga.
Jangan menyatakan kedua runner asli lulus atau menjadikan kegagalan assertion itu
bukti filter aplikasinya rusak. Bukti terperinci ada pada runbook deployment root
store dan artifact lokal, bukan pada export modul.

Lima interval frame audio→RPC playback setelah rollout adalah **954–1342 ms**.
Ini tidak membuktikan peningkatan dibanding sampel lama dengan kondisi berbeda.
Pengukuran selesai bicara→suara terdengar, A/B suara manusia Indonesia dan risiko
memotong jeda alami tetap belum terverifikasi. **300 ms mengatur deteksi diam,
bukan janji jawaban terdengar dalam 300 ms.** Validasi source pada audit sebelumnya
(75 Node / 29 Python / 14 SDK cases dan build) digunakan kembali; sesi cloud ini
tidak menjalankan server produk lokal.

## Pemeriksaan cloud — 18 Oktober 2026

Pembacaan log yang sudah ada, tanpa membuat panggilan provider baru, menemukan
empat panggilan pada revisi cloud yang sama. Tiga berasal dari QA deployment,
termasuk percobaan headless yang gagal; panggilan keempat terjadi sesudahnya.
Timing ini tidak otomatis mewakili keluhan pengguna atau percakapan mikrofon nyata.
Ringkasan numerik tanpa transkrip/identitas tersimpan lokal di
`.logs/latency-review-20261018/cloud-latency-summary.json` pada root store dan tidak
termasuk export modul.

| Tahap yang benar-benar dicatat | Sampel | Rentang |
| --- | ---: | ---: |
| Frame audio model pertama → RPC mulai playback Spatius | 7 | 825–1090 ms |
| Provider TTFT, dari response creation | 5 valid | 311–525 ms |
| Worker mulai job → sesi siap | 4 | 2458–4005 ms |
| Browser update brief | 2 | 131–1151 ms |
| Browser filter katalog | 1 | 5002 ms |
| Browser tampilkan rekomendasi | 1 | 145 ms |
| Pencarian/perbandingan katalog lokal | 2 | 0–1 ms, pembulatan log |

Jalur audio/avatar memberi tambahan terukur sekitar satu detik sebelum RPC
playback, tetapi belum memisahkan jaringan, ingress, pemrosesan provider dan
buffer browser. RPC bukan pengukuran suara fisik speaker. TTFT Gemini tidak
mencakup menunggu akhir ucapan atau seluruh rantai tool; jangan menjumlahkan
rentang dari giliran berbeda menjadi klaim latency selesai bicara→terdengar.
Angka startup job tidak mencakup preload/first render/ticket di browser dan tidak
berulang setiap giliran. Sampel sedikit ini bukan P50/P95/P99 yang representatif.

Filter 5002 ms cocok dengan batas tunggu receipt browser lima detik pada
`AssistantContext.request()`. Ini indikasi outcome tidak diterima tepat waktu,
bukan bukti penyebabnya browser, jaringan atau renderer. Log lama belum menyimpan
status hasil tool; percobaan tersebut bertepatan dengan QA headless yang punya
keterbatasan pointer. Jangan menganggap semua pencarian produk memerlukan lima
detik. Dua fallback RPC playback-finished setelah interupsi juga terlihat; belum
terbukti menyebabkan keluhan jeda awal jawaban. Registrasi worker menyebut
India South; ini lokasi control plane worker, bukan bukti region setiap jalur media.

### Persiapan kandidat sebelum rollout

Sumber kini mendukung **`GEMINI_SILENCE_DURATION_MS`** langsung pada
`RealtimeInputConfig.automatic_activity_detection.silence_duration_ms`, terpisah
dari endpointing LiveKit. Kosong mempertahankan baseline provider. **300 ms**
adalah kandidat A/B, bukan nilai optimum yang sudah terbukti; rentang operator
dibatasi 100–2000 ms. Automatic VAD tetap aktif, sensitivitas lain tetap default,
model/suara/thinking dan kontrak avatar/receipt tidak diganti. Nilai terlalu singkat
bisa memotong jeda berpikir pengguna, sehingga jangan menerapkannya sebagai
"perbaikan terbukti" tanpa pengujian suara.

Pencatat tool kini menyertakan outcome terbatas seperti `applied`, `unknown` atau
`error` tanpa argumen, state, transkrip atau detail exception. Ini membantu
membedakan tunggu receipt dan hasil sukses pada sampel berikutnya. Pengukuran
durasi dan penerusan frame tetap seperti sebelumnya.

Validasi lokal baru: **75 Node tests, 29 Python tests, 14 SDK integration cases dan
build lulus**. SDK Google terpasang menerima serialized native VAD 300 ms;
baseline kosong tetap `NOT_GIVEN`. Ini bukti wiring/config dan perilaku test,
bukan bukti peningkatan latency provider. Tidak ada env privat yang diubah,
panggilan berbayar baru, restart layanan pengguna atau perubahan cloud pada audit
itu; pada saat audit tersebut cloud masih menjalankan baseline deployment.
Penerapan yang kemudian diotorisasi tercatat pada bagian paling atas dokumen ini.

Langkah verifikasi berikutnya: bandingkan baseline dan 300 ms menggunakan kalimat
Indonesia, perangkat/jaringan/model yang sama, termasuk jeda alami dan interupsi.
Catat akhir suara input yang independen dari transkrip, frame audio model pertama,
RPC playback dan awal output browser; pisahkan giliran tool dan tanpa tool.
Jangan memakai `input_speech_stopped` plugin ini sebagai waktu akhir mikrofon:
source Google plugin 1.7.1 menerbitkannya setelah generation selesai. Jangan
mengurangi timeout dengan mengklaim aksi berhasil sebelum receipt.

Rujukan primer: [Gemini automatic VAD](https://ai.google.dev/gemini-api/docs/live-api/capabilities#automatic-vad-configuration),
[LiveKit Gemini turn detection](https://docs.livekit.io/agents/models/realtime/gemini/#turn-detection),
dan [Spatius server integration](https://docs.spatius.ai/livekit-agents/server).
Dokumentasi web saat ini juga memuat model yang lebih baru; wiring di atas diuji
pada SDK lokal dan model baseline yang ada, tanpa migrasi model.

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

Reproduksi terisolasi memakai byte SDK/WASM Onchain yang identik dengan DOPAMINE,
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
