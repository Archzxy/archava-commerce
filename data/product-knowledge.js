// Public demo knowledge. Source descriptions are curated from the local
// DummyJSON snapshot; comparison facts come from our fictional demo profiles.
// Missing manufacturer details stay unknown rather than being filled from memory.
import { comparisonGroups } from './comparison.js';

const entry = (summary, useCase, facts, unknowns, keywords = '') => ({ summary, useCase, facts, unknowns, keywords });
const sourceKnowledge = {
  78: entry('Laptop Apple MacBook Pro dengan layar 14 inci dan warna Space Grey.', 'Kerja dan hiburan dengan laptop Apple.', ['Laptop', 'Layar 14 inci', 'Space Grey'], ['Generasi chip, RAM, storage, port, dan durasi baterai'], 'laptop notebook macbook'),
  81: entry('Lenovo Yoga 920 adalah laptop 2-in-1 dengan layar sentuh yang bisa diputar untuk penggunaan sebagai tablet.', 'Kerja dan penggunaan bergantian sebagai laptop atau tablet.', ['Laptop 2-in-1', 'Layar sentuh', 'Engsel putar'], ['Varian prosesor, RAM, storage, dan durasi baterai'], 'laptop notebook tablet touchscreen convertible'),
  82: entry('Dell XPS 13 9300 adalah laptop ringkas dengan layar InfinityEdge yang memiliki bezel tipis.', 'Kerja dengan laptop ringkas.', ['Laptop', 'Layar InfinityEdge', 'Desain ringkas'], ['Varian prosesor, RAM, storage, dan resolusi layar'], 'laptop notebook ultrabook'),
  99: entry('Amazon Echo Plus adalah speaker pintar dengan kontrol suara Alexa dan fungsi hub perangkat smart home.', 'Audio dan kontrol perangkat rumah pintar.', ['Speaker pintar', 'Alexa', 'Hub smart home'], ['Generasi, protokol smart home, dan kompatibilitas perangkat tertentu'], 'speaker pintar smart home alexa'),
  100: entry('Apple Airpods adalah earphone wireless dengan pairing praktis dan integrasi Siri dalam data contoh.', 'Mendengarkan audio saat bepergian.', ['Earphone wireless', 'Pairing', 'Integrasi Siri'], ['Generasi AirPods, ANC, codec, dan durasi baterai'], 'earphone earbuds wireless audio siri'),
  102: entry('Apple Airpower Wireless Charger adalah contoh listing alas pengisian daya nirkabel untuk perangkat Apple yang kompatibel.', 'Mencoba pilihan aksesori pengisian daya pada katalog demo.', ['Alas pengisian nirkabel', 'Listing contoh'], ['Produk ini tidak membuktikan ketersediaan ritel; watt dan model perangkat yang didukung tidak tersedia'], 'charger wireless pengisi daya nirkabel'),
  103: entry('Apple HomePod Mini Cosmic Grey adalah speaker pintar ringkas untuk ekosistem Apple.', 'Audio dan penggunaan rumah pintar dalam ekosistem Apple.', ['Speaker pintar', 'Desain ringkas', 'Cosmic Grey'], ['Versi, protokol koneksi, dan kompatibilitas perangkat tertentu'], 'speaker pintar smart home homepod'),
  104: entry('Apple iPhone Charger adalah aksesori pengisian daya untuk iPhone dalam katalog contoh.', 'Mengisi daya iPhone dengan aksesori yang kompatibel.', ['Pengisi daya iPhone'], ['Watt, jenis port, kabel dalam paket, dan model iPhone yang kompatibel'], 'charger pengisi daya iphone'),
  107: entry('Beats Flex Wireless Earphones memiliki earbud magnetik dan baterai hingga 12 jam menurut deskripsi sumber demo.', 'Audio wireless untuk penggunaan harian.', ['Earphone wireless', 'Earbud magnetik', 'Baterai hingga 12 jam'], ['ANC, codec, dan ketahanan air'], 'earphone wireless audio magnetik baterai'),
  123: entry('iPhone 13 Pro adalah smartphone Apple; deskripsi sumber menyebut kamera, chip, dan layar tanpa rincian varian.', 'Komunikasi, foto, dan penggunaan smartphone harian.', ['Smartphone Apple', 'Seri iPhone 13 Pro'], ['Storage, RAM, kondisi unit, kesehatan baterai, dan garansi'], 'hp ponsel smartphone iphone kamera'),
  125: entry('Oppo A57 adalah smartphone kelas menengah dalam deskripsi sumber demo.', 'Komunikasi dan penggunaan smartphone harian.', ['Smartphone Oppo', 'Seri A57'], ['Versi atau tahun, RAM, storage, chipset, dan kapasitas baterai'], 'hp ponsel smartphone oppo'),
  128: entry('Realme C35 adalah smartphone untuk kebutuhan dasar sehari-hari dengan posisi harga terjangkau dalam katalog demo.', 'Komunikasi dan penggunaan smartphone dasar.', ['Smartphone Realme', 'Seri C35'], ['RAM, storage, chipset, kamera, dan kapasitas baterai'], 'hp ponsel smartphone realme'),
  83: entry('Kemeja pria dengan motif kotak biru dan hitam untuk gaya kasual atau semi-formal.', 'Outfit kasual dan semi-formal.', ['Motif kotak', 'Biru dan hitam', 'Kemeja pria'], ['Komposisi kain, ukuran, dan potongan fit'], 'kemeja pria kotak kasual kantor'),
  85: entry('Kemeja pria bermotif plaid dengan gaya kasual.', 'Outfit kasual sehari-hari.', ['Motif plaid', 'Kemeja pria'], ['Komposisi kain, ukuran, dan potongan fit'], 'kemeja pria kotak plaid kasual'),
  86: entry('Kemeja berlengan pendek untuk gaya santai pada cuaca hangat.', 'Outfit santai dan cuaca hangat.', ['Lengan pendek', 'Gaya kasual'], ['Komposisi kain, ukuran, dan potongan fit'], 'kemeja lengan pendek santai'),
  87: entry('Kemeja pria bermotif check yang mudah dipadukan untuk berbagai acara.', 'Outfit harian dengan motif kotak.', ['Motif check', 'Kemeja pria'], ['Komposisi kain, ukuran, dan potongan fit'], 'kemeja pria kotak check'),
  163: entry('Dress musim panas dengan kain ringan dan motif playful menurut deskripsi contoh.', 'Outfit untuk cuaca hangat.', ['Dress', 'Kain ringan', 'Motif playful'], ['Komposisi kain, ukuran, dan panjang dress'], 'dress gaun musim panas'),
  164: entry('Dress berwarna abu-abu netral untuk gaya santai atau lebih rapi.', 'Outfit dengan warna netral untuk berbagai acara.', ['Dress', 'Abu-abu'], ['Komposisi kain, ukuran, dan panjang dress'], 'dress gaun abu abu'),
  172: entry('Tas tangan biru dengan beberapa kompartemen untuk penggunaan harian.', 'Membawa barang harian dengan beberapa ruang penyimpanan.', ['Tas tangan', 'Biru', 'Beberapa kompartemen'], ['Material, dimensi, dan kapasitas'], 'tas tangan handbag biru kompartemen'),
  173: entry('Tas kulit Heshe dengan desain klasik menurut deskripsi sumber contoh.', 'Tas tangan untuk melengkapi outfit.', ['Tas tangan', 'Kulit menurut sumber demo', 'Desain klasik'], ['Jenis kulit, dimensi, dan kapasitas'], 'tas tangan kulit handbag leather'),
  175: entry('Ransel putih berbahan kulit sintetis dengan ruang penyimpanan untuk gaya harian.', 'Membawa barang harian dengan ransel.', ['Ransel', 'Putih', 'Kulit sintetis'], ['Kapasitas liter, dimensi, dan ukuran laptop yang muat'], 'tas ransel backpack putih kulit sintetis'),
  176: entry('Tas tangan hitam dengan desain klasik untuk dipadukan dengan berbagai outfit.', 'Tas tangan harian dengan warna netral.', ['Tas tangan', 'Hitam', 'Desain klasik'], ['Material, dimensi, dan kapasitas'], 'tas tangan handbag hitam'),
  177: entry('Gaun malam hitam untuk acara formal dan momen khusus.', 'Outfit acara formal.', ['Gaun malam', 'Hitam', 'Gaya formal'], ['Komposisi kain, ukuran, dan panjang gaun'], 'gaun dress formal malam'),
  13: entry('Meja samping African Cherry untuk penyimpanan di sisi tempat tidur.', 'Meletakkan dan menyimpan barang di samping tempat tidur.', ['Meja samping', 'Ruang penyimpanan'], ['Material, dimensi, dan batas beban'], 'meja samping kamar tidur penyimpanan'),
  44: entry('Bingkai foto bergaya pohon keluarga dengan beberapa slot foto.', 'Memajang beberapa foto keluarga.', ['Bingkai foto', 'Beberapa slot foto', 'Gaya pohon keluarga'], ['Jumlah slot dan ukuran foto'], 'bingkai foto keluarga pajangan'),
  45: entry('Tanaman dekorasi artifisial untuk menghadirkan tampilan hijau tanpa perawatan tanaman hidup.', 'Dekorasi ruangan.', ['Tanaman artifisial', 'Dekorasi'], ['Material, dimensi, dan isi paket'], 'tanaman hias artifisial palsu dekorasi'),
  48: entry('Spatula bambu untuk membalik, mengaduk, dan menyajikan masakan.', 'Menyiapkan dan menyajikan masakan.', ['Bahan bambu', 'Spatula'], ['Dimensi dan petunjuk perawatan'], 'spatula bambu masak mengaduk'),
  51: entry('Blender untuk jus, smoothies, dan persiapan bumbu; rincian demo tersedia pada profil perbandingan.', 'Jus dan bumbu dapur.', ['Blender meja'], ['Kemampuan menghancurkan es dan petunjuk penggunaan'], 'blender jus smoothie bumbu'),
  52: entry('Wajan carbon steel untuk menumis dan menggoreng.', 'Menumis dan menggoreng masakan.', ['Carbon steel', 'Wajan'], ['Diameter, ketebalan, dan kompatibilitas kompor induksi'], 'wajan tumis menggoreng carbon steel'),
  53: entry('Talenan kayu untuk memotong dan menyiapkan bahan makanan.', 'Persiapan bahan masakan.', ['Talenan', 'Kayu sesuai nama listing'], ['Jenis kayu, dimensi, dan petunjuk perawatan'], 'talenan kayu papan potong'),
  59: entry('Gelas bening untuk berbagai minuman.', 'Menyajikan minuman.', ['Gelas minum', 'Bening'], ['Kapasitas ml, ketahanan panas, dan jumlah dalam paket'], 'gelas minum bening'),
  65: entry('Kotak makan portabel dengan kompartemen untuk memisahkan makanan.', 'Membawa bekal.', ['Kotak makan', 'Kompartemen makanan', 'Portabel'], ['Kapasitas, material, ketahanan bocor, dan keamanan microwave'], 'kotak makan bekal lunch box'),
  66: entry('Microwave oven untuk memanaskan makanan, memasak, dan defrost menurut deskripsi sumber demo.', 'Memanaskan makanan dan defrost.', ['Microwave', 'Pemanasan makanan', 'Defrost'], ['Daya watt, kapasitas liter, dan mode khusus'], 'microwave oven memanaskan defrost'),
  71: entry('Panci dengan tutup kaca untuk merebus dan memasak perlahan; tutupnya membantu melihat isi panci.', 'Merebus dan memasak perlahan.', ['Panci', 'Tutup kaca'], ['Kapasitas, diameter, dan kompatibilitas kompor induksi'], 'panci rebus tutup kaca'),
  73: entry('Rak untuk merapikan bumbu dan menjaga bahan dapur mudah dijangkau.', 'Menyimpan dan merapikan bumbu.', ['Rak bumbu', 'Organizer dapur'], ['Material, dimensi, dan jumlah wadah'], 'rak bumbu organizer dapur'),
  1: entry('Maskara untuk memberi tampilan bulu mata lebih bervolume dan panjang menurut deskripsi sumber contoh.', 'Riasan bulu mata.', ['Maskara', 'Efek volume dan panjang dalam deskripsi demo'], ['Komposisi, ukuran, waterproof, dan izin edar'], 'maskara mascara bulu mata makeup'),
  2: entry('Palet eyeshadow dengan beberapa warna dan cermin bawaan.', 'Riasan mata.', ['Palet eyeshadow', 'Beberapa warna', 'Cermin bawaan'], ['Jumlah shade, komposisi, dan izin edar'], 'eyeshadow palet riasan mata cermin makeup'),
  3: entry('Setting powder bertekstur ringan dan translucent untuk merapikan hasil riasan dengan tampilan matte menurut deskripsi demo.', 'Menyelesaikan riasan wajah.', ['Setting powder', 'Translucent', 'Tampilan matte'], ['Shade, berat, komposisi, dan izin edar'], 'bedak setting powder matte makeup'),
  4: entry('Lipstik merah dengan tekstur creamy menurut deskripsi sumber contoh.', 'Riasan bibir merah.', ['Lipstik', 'Merah', 'Tekstur creamy'], ['Komposisi, ukuran, transferproof, dan izin edar'], 'lipstik lipstick bibir merah makeup'),
  5: entry('Cat kuku merah dengan tampilan glossy menurut deskripsi sumber contoh.', 'Pewarna kuku.', ['Cat kuku', 'Merah', 'Glossy'], ['Komposisi, volume, dan waktu kering terukur'], 'kuteks cat kuku nail polish merah'),
  6: entry('Calvin Klein CK One adalah parfum unisex dengan karakter aroma segar dan bersih dalam deskripsi sumber contoh.', 'Parfum harian dengan karakter aroma segar.', ['Parfum', 'Unisex', 'Segar dan bersih'], ['Volume botol, konsentrasi, ketahanan aroma, dan autentikasi produk'], 'parfum wangi segar unisex'),
  8: entry('Dior J’adore adalah parfum floral; deskripsi sumber menyebut ylang-ylang, mawar, dan jasmine.', 'Parfum dengan karakter floral.', ['Parfum floral', 'Ylang-ylang, mawar, jasmine'], ['Volume botol, konsentrasi, ketahanan aroma, dan autentikasi produk'], 'parfum wangi floral bunga'),
  118: entry('Sabun tangan Attitude Super Leaves untuk membersihkan tangan menurut deskripsi sumber contoh.', 'Membersihkan tangan.', ['Sabun tangan', 'Seri Super Leaves'], ['Komposisi lengkap, volume, dan izin edar'], 'sabun tangan hand soap'),
  119: entry('Body wash Olay Ultra Moisture dengan shea butter dalam deskripsi sumber contoh.', 'Membersihkan tubuh saat mandi.', ['Sabun mandi', 'Shea butter dalam deskripsi demo'], ['Komposisi lengkap, volume, dan izin edar'], 'sabun mandi body wash shea butter'),
  120: entry('Losion Vaseline Men untuk tubuh dan wajah menurut nama serta deskripsi sumber contoh.', 'Perawatan kelembapan tubuh dan wajah.', ['Losion', 'Untuk tubuh dan wajah'], ['Komposisi lengkap, volume, SPF, dan izin edar'], 'losion lotion pelembap tubuh wajah'),
  90: entry('Puma Future Rider Trainers memadukan gaya retro dengan penggunaan kasual sehari-hari.', 'Sepatu kasual harian.', ['Trainers', 'Gaya retro', 'Penggunaan kasual'], ['Ukuran, material, bobot, dan spesifikasi untuk lari'], 'sepatu sneakers trainers kasual retro'),
  140: entry('Bola basket untuk dribbling, shooting, dan passing; sumber contoh menyebut penggunaan indoor dan outdoor.', 'Bermain dan latihan basket.', ['Bola basket', 'Indoor dan outdoor menurut sumber demo'], ['Ukuran nomor bola, material, dan tekanan angin'], 'bola basket basketball'),
  146: entry('Shuttlecock dengan bulu alami menurut deskripsi sumber contoh untuk permainan badminton.', 'Bermain bulutangkis.', ['Shuttlecock', 'Bulu alami menurut sumber demo'], ['Speed, jumlah dalam tabung, dan standar turnamen'], 'kok bulutangkis badminton shuttlecock'),
  147: entry('Bola sepak untuk menendang dan mengoper dalam permainan sepak bola.', 'Bermain dan latihan sepak bola.', ['Bola sepak'], ['Ukuran nomor bola, material, dan standar turnamen'], 'bola sepak football soccer'),
  151: entry('Bola tenis untuk latihan atau permainan dengan raket tenis.', 'Bermain dan latihan tenis.', ['Bola tenis'], ['Jumlah dalam paket, jenis tekanan, dan standar turnamen'], 'bola tenis tennis'),
  152: entry('Raket tenis dengan frame, senar, dan grip dalam deskripsi sumber contoh.', 'Bermain tenis.', ['Raket tenis', 'Frame, senar, dan grip'], ['Bobot, ukuran kepala, ukuran grip, dan tension'], 'raket tenis tennis racket'),
  153: entry('Bola voli untuk passing, setting, dan spike.', 'Bermain dan latihan voli.', ['Bola voli'], ['Ukuran, material, dan standar turnamen'], 'bola voli volleyball'),
  27: entry('Madu dalam jar untuk pemanis minuman atau pelengkap makanan.', 'Menambahkan rasa manis pada makanan dan minuman.', ['Madu', 'Kemasan jar'], ['Berat bersih, komposisi, sertifikasi, dan kedaluwarsa'], 'madu honey pemanis'),
  29: entry('Jus buah sebagai pilihan minuman dalam katalog contoh.', 'Minuman buah.', ['Jus buah'], ['Jenis buah, volume, gula, komposisi, dan kedaluwarsa'], 'jus buah juice minuman'),
  32: entry('Susu untuk diminum atau digunakan dalam resep harian.', 'Minuman dan bahan resep.', ['Susu'], ['Volume, jenis susu, alergen, informasi gizi, dan kedaluwarsa'], 'susu milk minuman'),
  34: entry('Kopi Nescafe untuk pilihan minuman kopi harian dalam katalog contoh.', 'Membuat minuman kopi.', ['Kopi', 'Nama listing Nescafe'], ['Varian, berat, komposisi, dan kedaluwarsa'], 'kopi coffee nescafe minuman'),
  38: entry('Beras untuk bahan nasi dan berbagai masakan harian.', 'Bahan makanan pokok.', ['Beras'], ['Jenis beras, berat, asal, dan informasi kemasan'], 'beras rice nasi'),
  109: entry('Monopod kamera untuk menopang pengambilan foto dan video dengan posisi yang dapat diatur menurut sumber demo.', 'Mendukung pengambilan foto dan video.', ['Monopod', 'Posisi dapat diatur'], ['Batas beban, tinggi, dudukan, dan kompatibilitas kamera'], 'monopod kamera foto video penyangga'),
  110: entry('Lampu LED selfie portabel yang dapat diatur untuk foto dan video call menurut sumber demo.', 'Pencahayaan selfie dan video call.', ['Lampu LED', 'Portabel', 'Dapat diatur'], ['Daya, suhu warna, brightness, dan kompatibilitas dudukan HP'], 'lampu led ring light selfie video call'),
  111: entry('Selfie stick monopod yang dapat diperpanjang dan dilipat untuk foto selfie atau grup.', 'Foto selfie dan grup.', ['Tongkat selfie', 'Dapat diperpanjang', 'Dapat dilipat'], ['Panjang, batas beban, dan kompatibilitas dudukan perangkat'], 'tongkat selfie monopod foto grup'),
};

const seedUses = {
  watch: ['Jam tangan harian.', ['Ketahanan air dan jenis mesin']],
  bag: ['Membawa barang penting untuk kegiatan harian.', ['Dimensi dan kapasitas']],
  camera: ['Foto instan dan koleksi bergaya retro.', ['Jenis film, ukuran cetakan, dan isi paket']],
  perfume: ['Parfum harian dengan aroma floral dan woody.', ['Ketahanan aroma dan komposisi lengkap']],
  lamp: ['Pencahayaan meja dan kamar.', ['Daya watt, suhu warna, dan dimmer']],
  sunglasses: ['Aksesori kacamata untuk gaya harian.', ['Perlindungan UV dan polarisasi']],
  chair: ['Duduk di ruang santai.', ['Dimensi dan batas beban']],
  coffee: ['Menyajikan minuman dengan cangkir keramik.', ['Jumlah cangkir dan kapasitas']],
  backpack: ['Membawa barang harian dan laptop.', ['Ukuran laptop yang muat dan ketahanan air']],
};

export function enrichProductKnowledge(products) {
  return products.map((product) => {
    const curated = sourceKnowledge[product.source?.id];
    const group = comparisonGroups.find((item) => item.id === product.comparison?.group);
    const description = curated?.summary || product.description;
    const specs = group ? product.specs : curated?.facts || product.specs;
    const specifications = group ? group.fields.map((field) => ({ ...field, value: product.comparison.attributes[field.key] })) : specs.map((value) => ({ label: 'Informasi katalog', value }));
    const unknowns = curated?.unknowns || seedUses[product.id]?.[1] || ['Fitur yang tidak tercantum pada profil, kompatibilitas perangkat tertentu, dan hasil pengujian'];
    return {
      ...product, description, specs,
      keywords: `${product.keywords} ${curated?.keywords || ''}`.trim(),
      knowledge: {
        summary: description,
        useCase: product.comparison?.useCase || curated?.useCase || seedUses[product.id]?.[0],
        specifications,
        strengths: product.comparison?.strengths || [],
        tradeoffs: product.comparison?.tradeoffs || [],
        unknowns,
        source: { type: 'demo', origin: group ? 'fictional-comparison-profile' : curated ? 'curated-source-description' : 'demo-catalog-entry', ...(curated ? { provider: 'DummyJSON', id: product.source.id } : {}), note: 'Informasi katalog contoh; bukan spesifikasi pabrikan terverifikasi atau hasil uji.' },
      },
    };
  });
}
