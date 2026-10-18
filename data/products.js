// Sample catalog. Prices and availability are illustrative.
import { enrichCatalog } from './comparison.js';
import { enrichProductKnowledge } from './product-knowledge.js';
export const categories = [
  {
    "name": "Elektronik",
    "slug": "elektronik",
    "label": "Elektronik",
    "symbol": "headphones",
    "color": "#E8D8FF",
    "subtitle": "Teman keseharian",
    "description": "Gadget dan perangkat untuk kerja, hiburan, dan semua yang ada di antaranya."
  },
  {
    "name": "Fashion",
    "slug": "fashion",
    "label": "Fashion",
    "symbol": "bag",
    "color": "#FFD8F0",
    "subtitle": "Gaya versi kamu",
    "description": "Dari outfit harian sampai detail kecil yang bikin gayamu terasa personal."
  },
  {
    "name": "Rumah",
    "slug": "rumah",
    "label": "Rumah & Living",
    "symbol": "plant",
    "color": "#EEFFC0",
    "subtitle": "Sudut paling nyaman",
    "description": "Lengkapi rumah dengan barang yang praktis, hangat, dan enak dilihat."
  },
  {
    "name": "Kecantikan",
    "slug": "kecantikan",
    "label": "Kecantikan",
    "symbol": "bottle",
    "color": "#FAD9ED",
    "subtitle": "Rawat diri sendiri",
    "description": "Pilihan beauty dan perawatan untuk menemani ritual harianmu."
  },
  {
    "name": "Olahraga",
    "slug": "olahraga",
    "label": "Olahraga",
    "symbol": "shoe",
    "color": "#E8DDFF",
    "subtitle": "Terus bergerak",
    "description": "Temukan perlengkapan untuk langkah aktif, latihan, dan permainan favoritmu."
  },
  {
    "name": "Hobi",
    "slug": "hobi",
    "label": "Hobi & Kreatif",
    "symbol": "camera",
    "color": "#F1FFC9",
    "subtitle": "Ikuti rasa ingin tahu",
    "description": "Perlengkapan untuk bereksperimen, membuat konten, dan menyimpan cerita."
  },
  {
    "name": "Makanan",
    "slug": "makanan",
    "label": "Makanan & Minuman",
    "symbol": "coffee",
    "color": "#FFE2F2",
    "subtitle": "Isi ulang favoritmu",
    "description": "Kebutuhan dapur dan teman sarapan, untuk stok kecil yang bikin hari lebih baik."
  }
];

const baseProducts = [
  {
    "id": "headphones",
    "name": "Studio Wireless Headphones",
    "brand": "SOUNDROOM",
    "category": "Elektronik",
    "price": 429000,
    "oldPrice": 699000,
    "rating": 4.9,
    "sold": 1240,
    "image": "/assets/headphones.jpg",
    "photo": "1505740420928-5e560c06d30e",
    "badge": "BEST SELLER",
    "stock": 18,
    "progress": 77,
    "specs": [
      "Bluetooth 5.3",
      "30 jam baterai",
      "Over-ear"
    ],
    "description": "Teman untuk lagu favorit, sesi fokus, dan perjalananmu. Headphone dengan bantalan empuk, suara seimbang, serta koneksi wireless yang praktis.",
    "images": [
      "/assets/headphones.jpg"
    ],
    "keywords": "headphone headset audio musik suara",
    "location": "Jakarta Selatan",
    "merchant": "SOUNDROOM Official",
    "created": 100,
    "demo": true
  },
  {
    "id": "watch",
    "name": "Everyday Minimal Watch",
    "brand": "WAKTU",
    "category": "Fashion",
    "price": 279000,
    "oldPrice": 399000,
    "rating": 4.8,
    "sold": 860,
    "image": "/assets/watch.jpg",
    "photo": "1523275335684-37898b6baf30",
    "badge": "PILIHAN DOPAMINE",
    "stock": 24,
    "progress": 61,
    "specs": [
      "Diameter 38 mm",
      "Tali silikon",
      "Unisex"
    ],
    "description": "Jam tangan dengan desain sederhana yang gampang dipadukan dengan gaya harian. Ringan, nyaman, dan siap menemani setiap momen.",
    "images": [
      "/assets/watch.jpg"
    ],
    "keywords": "jam tangan arloji",
    "location": "Bandung",
    "merchant": "WAKTU Official",
    "created": 101,
    "demo": true
  },
  {
    "id": "bag",
    "name": "City Everyday Shoulder Bag",
    "brand": "SORA STUDIO",
    "category": "Fashion",
    "price": 189000,
    "oldPrice": 299000,
    "rating": 4.9,
    "sold": 2150,
    "image": "/assets/bag.jpg",
    "photo": "1548036328-c9fa89d128fa",
    "badge": "TERLARIS",
    "stock": 12,
    "progress": 86,
    "specs": [
      "Kulit sintetis",
      "Tali adjustable",
      "Kompartemen dalam"
    ],
    "description": "Satu tas untuk banyak rencana. Ukuran yang pas buat barang penting, dengan bentuk klasik dan warna yang mudah masuk ke outfit pilihanmu.",
    "images": [
      "/assets/bag.jpg"
    ],
    "keywords": "tas wanita bahu",
    "location": "Surabaya",
    "merchant": "SORA STUDIO Official",
    "created": 102,
    "demo": true
  },
  {
    "id": "camera",
    "name": "Instant Camera — Retro Edition",
    "brand": "MEMORI",
    "category": "Hobi",
    "price": 1299000,
    "oldPrice": 1599000,
    "rating": 4.8,
    "sold": 325,
    "image": "/assets/camera.jpg",
    "photo": "1526170375885-4d8ecf77b99f",
    "badge": "LIMITED FINDS",
    "stock": 8,
    "progress": 70,
    "specs": [
      "Desain retro",
      "Foto instan",
      "Untuk koleksi"
    ],
    "description": "Untuk kamu yang suka menyimpan cerita dengan cara yang berbeda. Sebuah pilihan bergaya retro untuk melengkapi koleksi dan sudut kreatifmu.",
    "images": [
      "/assets/camera.jpg"
    ],
    "keywords": "kamera foto instan fotografi",
    "location": "Jakarta Selatan",
    "merchant": "MEMORI Official",
    "created": 103,
    "demo": true
  },
  {
    "id": "sneakers",
    "name": "Move Everyday Sneakers",
    "brand": "LANGKAH",
    "category": "Olahraga",
    "price": 349000,
    "oldPrice": 499000,
    "rating": 4.9,
    "sold": 1650,
    "image": "/assets/sneakers.jpg",
    "photo": "1542291026-7eec264c27ff",
    "badge": "BEST SELLER",
    "specs": [
      "Ukuran 36–44",
      "Sol ringan",
      "Mesh breathable"
    ],
    "description": "Siap buat langkah santai sampai jadwal yang padat. Sneakers dengan tampilan berani dan sol ringan, untuk menemani hari yang aktif.",
    "images": [
      "/assets/sneakers.jpg"
    ],
    "keywords": "sepatu lari olahraga",
    "stock": 28,
    "location": "Bandung",
    "merchant": "LANGKAH Official",
    "created": 104,
    "demo": true
  },
  {
    "id": "perfume",
    "name": "Daily Eau de Parfum — 50 ml",
    "brand": "AROMA LAB",
    "category": "Kecantikan",
    "price": 159000,
    "oldPrice": 229000,
    "rating": 4.7,
    "sold": 970,
    "image": "/assets/perfume.jpg",
    "photo": "1541643600914-78b084683601",
    "badge": "NEW FIND",
    "specs": [
      "50 ml",
      "Floral & woody",
      "Eau de parfum"
    ],
    "description": "Aroma hangat dengan sentuhan floral yang lembut. Sebuah detail kecil untuk memulai hari dengan perasaan yang lebih baik.",
    "images": [
      "/assets/perfume.jpg"
    ],
    "keywords": "parfum wangi aroma",
    "stock": 29,
    "location": "Surabaya",
    "merchant": "AROMA LAB Official",
    "created": 105,
    "demo": true
  },
  {
    "id": "lamp",
    "name": "Warm Table Lamp",
    "brand": "RUMAH RASA",
    "category": "Rumah",
    "price": 249000,
    "oldPrice": 329000,
    "rating": 4.8,
    "sold": 610,
    "image": "/assets/lamp.jpg",
    "photo": "1507473885765-e6ed057f782c",
    "badge": "PILIHAN DOPAMINE",
    "specs": [
      "Cahaya hangat",
      "Desain minimal",
      "Untuk meja & kamar"
    ],
    "description": "Ciptakan sudut nyaman untuk membaca, bekerja, atau sekadar menikmati malam. Lampu meja dengan siluet sederhana dan karakter yang hangat.",
    "images": [
      "/assets/lamp.jpg"
    ],
    "keywords": "lampu meja kamar",
    "stock": 30,
    "location": "Jakarta Selatan",
    "merchant": "RUMAH RASA Official",
    "created": 106,
    "demo": true
  },
  {
    "id": "sunglasses",
    "name": "Classic Everyday Sunglasses",
    "brand": "SORA STUDIO",
    "category": "Fashion",
    "price": 129000,
    "oldPrice": 179000,
    "rating": 4.8,
    "sold": 1140,
    "image": "/assets/sunglasses.jpg",
    "photo": "1511499767150-a48a237f0083",
    "specs": [
      "Frame ringan",
      "Unisex",
      "Pouch included"
    ],
    "description": "Bentuk klasik untuk gaya yang effortless. Ringan dipakai dan gampang dibawa, dari perjalanan pagi sampai akhir pekan yang panjang.",
    "images": [
      "/assets/sunglasses.jpg"
    ],
    "keywords": "kacamata hitam",
    "stock": 31,
    "location": "Bandung",
    "merchant": "SORA STUDIO Official",
    "created": 107,
    "demo": true
  },
  {
    "id": "chair",
    "name": "Nordic Lounge Chair",
    "brand": "RUMAH RASA",
    "category": "Rumah",
    "price": 899000,
    "oldPrice": 1199000,
    "rating": 4.9,
    "sold": 240,
    "image": "/assets/chair.jpg",
    "photo": "1598300042247-d088f8ab3a91",
    "badge": "NEW FIND",
    "specs": [
      "Gaya Scandinavian",
      "Rangka kayu",
      "Untuk ruang santai"
    ],
    "description": "Satu tempat untuk duduk lebih lama dan menikmati momen pelan. Kursi dengan garis bersih yang menghidupkan ruang favoritmu.",
    "images": [
      "/assets/chair.jpg"
    ],
    "keywords": "kursi sofa duduk",
    "stock": 32,
    "location": "Surabaya",
    "merchant": "RUMAH RASA Official",
    "created": 108,
    "demo": true
  },
  {
    "id": "coffee",
    "name": "Morning Ritual Coffee Set",
    "brand": "SEDARI",
    "category": "Rumah",
    "price": 169000,
    "oldPrice": 219000,
    "rating": 4.8,
    "sold": 430,
    "image": "/assets/coffee.jpg",
    "photo": "1514432324607-a09d9b4aefdd",
    "specs": [
      "Set cangkir",
      "Keramik",
      "Untuk ritual pagi"
    ],
    "description": "Karena pagi yang bagus sering dimulai dari hal sederhana. Set kopi untuk menikmati minuman favorit dengan lebih santai.",
    "images": [
      "/assets/coffee.jpg"
    ],
    "keywords": "kopi cangkir gelas",
    "stock": 33,
    "location": "Jakarta Selatan",
    "merchant": "SEDARI Official",
    "created": 109,
    "demo": true
  },
  {
    "id": "smartwatch",
    "name": "Active Everyday Smartwatch",
    "brand": "SOUNDROOM",
    "category": "Elektronik",
    "price": 549000,
    "oldPrice": 749000,
    "rating": 4.7,
    "sold": 760,
    "image": "/assets/smartwatch.jpg",
    "photo": "1546868871-7041f2a55e12",
    "specs": [
      "Monitor aktivitas",
      "Layar sentuh",
      "Tali adjustable"
    ],
    "description": "Bantu kamu mengikuti ritme harian dengan cara yang simpel. Smartwatch ringkas untuk menemani aktivitas dan menjaga hal penting tetap dekat.",
    "images": [
      "/assets/smartwatch.jpg"
    ],
    "keywords": "jam pintar tangan arloji",
    "stock": 34,
    "location": "Bandung",
    "merchant": "SOUNDROOM Official",
    "created": 110,
    "demo": true
  },
  {
    "id": "backpack",
    "name": "Weekend Adventure Backpack",
    "brand": "LANGKAH",
    "category": "Olahraga",
    "price": 299000,
    "oldPrice": 399000,
    "rating": 4.8,
    "sold": 590,
    "image": "/assets/backpack.jpg",
    "photo": "1553062407-98eeb64c6a62",
    "specs": [
      "20 liter",
      "Kompartemen laptop",
      "Tali empuk"
    ],
    "description": "Bawa rencana besarmu dalam satu tas. Ruang yang cukup, detail yang praktis, dan tampilan yang pas untuk kegiatan sehari-hari.",
    "images": [
      "/assets/backpack.jpg"
    ],
    "keywords": "tas ransel punggung laptop",
    "stock": 35,
    "location": "Surabaya",
    "merchant": "LANGKAH Official",
    "created": 111,
    "demo": true
  },
  {
    "id": "apple-macbook-pro-14-inch-space-grey",
    "name": "Apple MacBook Pro 14 Inch Space Grey",
    "brand": "Apple",
    "category": "Elektronik",
    "price": 28000000,
    "oldPrice": 31112000,
    "rating": 3.7,
    "sold": 1406,
    "stock": 24,
    "image": "/assets/products/apple-macbook-pro-14-inch-space-grey-1.webp",
    "images": [
      "/assets/products/apple-macbook-pro-14-inch-space-grey-1.webp",
      "/assets/products/apple-macbook-pro-14-inch-space-grey-2.webp",
      "/assets/products/apple-macbook-pro-14-inch-space-grey-3.webp"
    ],
    "contain": true,
    "badge": "NEW FIND",
    "specs": [
      "Pilihan gadget",
      "Untuk keseharian",
      "Desain praktis"
    ],
    "description": "Lengkapi rutinitas digitalmu dengan perangkat yang pas. Pilihan untuk bekerja, menikmati hiburan, dan tetap terhubung dalam aktivitas sehari-hari.",
    "keywords": "elektronik laptop komputer notebook  laptops apple",
    "location": "Jakarta Selatan",
    "merchant": "Apple Store",
    "created": 120,
    "demo": true,
    "source": {
      "provider": "DummyJSON",
      "id": 78
    }
  },
  {
    "id": "lenovo-yoga-920",
    "name": "Lenovo Yoga 920",
    "brand": "Lenovo",
    "category": "Elektronik",
    "price": 15400000,
    "oldPrice": 17112000,
    "rating": 2.9,
    "sold": 1547,
    "stock": 40,
    "image": "/assets/products/lenovo-yoga-920-1.webp",
    "images": [
      "/assets/products/lenovo-yoga-920-1.webp",
      "/assets/products/lenovo-yoga-920-2.webp",
      "/assets/products/lenovo-yoga-920-3.webp"
    ],
    "contain": true,
    "badge": "",
    "specs": [
      "Pilihan gadget",
      "Untuk keseharian",
      "Desain praktis"
    ],
    "description": "Lengkapi rutinitas digitalmu dengan perangkat yang pas. Pilihan untuk bekerja, menikmati hiburan, dan tetap terhubung dalam aktivitas sehari-hari.",
    "keywords": "elektronik laptop komputer notebook  laptops",
    "location": "Bandung",
    "merchant": "Lenovo Store",
    "created": 121,
    "demo": true,
    "source": {
      "provider": "DummyJSON",
      "id": 81
    }
  },
  {
    "id": "new-dell-xps-13-9300-laptop",
    "name": "New DELL XPS 13 9300 Laptop",
    "brand": "Dell",
    "category": "Elektronik",
    "price": 21000000,
    "oldPrice": 23864000,
    "rating": 2.7,
    "sold": 1594,
    "stock": 74,
    "image": "/assets/products/new-dell-xps-13-9300-laptop-1.webp",
    "images": [
      "/assets/products/new-dell-xps-13-9300-laptop-1.webp",
      "/assets/products/new-dell-xps-13-9300-laptop-2.webp",
      "/assets/products/new-dell-xps-13-9300-laptop-3.webp"
    ],
    "contain": true,
    "badge": "",
    "specs": [
      "Pilihan gadget",
      "Untuk keseharian",
      "Desain praktis"
    ],
    "description": "Lengkapi rutinitas digitalmu dengan perangkat yang pas. Pilihan untuk bekerja, menikmati hiburan, dan tetap terhubung dalam aktivitas sehari-hari.",
    "keywords": "elektronik laptop komputer notebook  laptops",
    "location": "Surabaya",
    "merchant": "Dell Store",
    "created": 122,
    "demo": true,
    "source": {
      "provider": "DummyJSON",
      "id": 82
    }
  },
  {
    "id": "amazon-echo-plus",
    "name": "Amazon Echo Plus",
    "brand": "Amazon",
    "category": "Elektronik",
    "price": 1400000,
    "oldPrice": 1591000,
    "rating": 5,
    "sold": 2393,
    "stock": 61,
    "image": "/assets/products/amazon-echo-plus-1.webp",
    "images": [
      "/assets/products/amazon-echo-plus-1.webp",
      "/assets/products/amazon-echo-plus-2.webp"
    ],
    "contain": true,
    "badge": "",
    "specs": [
      "Pilihan gadget",
      "Untuk keseharian",
      "Desain praktis"
    ],
    "description": "Lengkapi rutinitas digitalmu dengan perangkat yang pas. Pilihan untuk bekerja, menikmati hiburan, dan tetap terhubung dalam aktivitas sehari-hari.",
    "keywords": "elektronik  speaker audio suara electronics smart speakers",
    "location": "Tangerang",
    "merchant": "Amazon Store",
    "created": 123,
    "demo": true,
    "source": {
      "provider": "DummyJSON",
      "id": 99
    }
  },
  {
    "id": "apple-airpods",
    "name": "Apple Airpods",
    "brand": "Apple",
    "category": "Elektronik",
    "price": 1820000,
    "oldPrice": 2167000,
    "rating": 4.2,
    "sold": 100,
    "stock": 67,
    "image": "/assets/products/apple-airpods-1.webp",
    "images": [
      "/assets/products/apple-airpods-1.webp",
      "/assets/products/apple-airpods-2.webp",
      "/assets/products/apple-airpods-3.webp"
    ],
    "contain": true,
    "badge": "",
    "specs": [
      "Pilihan gadget",
      "Untuk keseharian",
      "Desain praktis"
    ],
    "description": "Lengkapi rutinitas digitalmu dengan perangkat yang pas. Pilihan untuk bekerja, menikmati hiburan, dan tetap terhubung dalam aktivitas sehari-hari.",
    "keywords": "elektronik  earphone audio musik electronics wireless earphones",
    "location": "Jakarta Selatan",
    "merchant": "Apple Store",
    "created": 124,
    "demo": true,
    "source": {
      "provider": "DummyJSON",
      "id": 100
    }
  },
  {
    "id": "apple-airpower-wireless-charger",
    "name": "Apple Airpower Wireless Charger",
    "brand": "Apple",
    "category": "Elektronik",
    "price": 1120000,
    "oldPrice": 1245000,
    "rating": 3.7,
    "sold": 194,
    "stock": 5,
    "image": "/assets/products/apple-airpower-wireless-charger-1.webp",
    "images": [
      "/assets/products/apple-airpower-wireless-charger-1.webp"
    ],
    "contain": true,
    "badge": "NEW FIND",
    "specs": [
      "Pilihan gadget",
      "Untuk keseharian",
      "Desain praktis"
    ],
    "description": "Lengkapi rutinitas digitalmu dengan perangkat yang pas. Pilihan untuk bekerja, menikmati hiburan, dan tetap terhubung dalam aktivitas sehari-hari.",
    "keywords": "elektronik  charger pengisi daya nirkabel electronics wireless chargers",
    "location": "Bandung",
    "merchant": "Apple Store",
    "created": 125,
    "demo": true,
    "source": {
      "provider": "DummyJSON",
      "id": 102
    }
  },
  {
    "id": "apple-homepod-mini-cosmic-grey",
    "name": "Apple HomePod Mini Cosmic Grey",
    "brand": "Apple",
    "category": "Elektronik",
    "price": 1400000,
    "oldPrice": 1708000,
    "rating": 4.6,
    "sold": 241,
    "stock": 27,
    "image": "/assets/products/apple-homepod-mini-cosmic-grey-1.webp",
    "images": [
      "/assets/products/apple-homepod-mini-cosmic-grey-1.webp"
    ],
    "contain": true,
    "badge": "",
    "specs": [
      "Pilihan gadget",
      "Untuk keseharian",
      "Desain praktis"
    ],
    "description": "Lengkapi rutinitas digitalmu dengan perangkat yang pas. Pilihan untuk bekerja, menikmati hiburan, dan tetap terhubung dalam aktivitas sehari-hari.",
    "keywords": "elektronik  speaker audio suara electronics smart speakers",
    "location": "Surabaya",
    "merchant": "Apple Store",
    "created": 126,
    "demo": true,
    "source": {
      "provider": "DummyJSON",
      "id": 103
    }
  },
  {
    "id": "apple-iphone-charger",
    "name": "Apple iPhone Charger",
    "brand": "Apple",
    "category": "Elektronik",
    "price": 280000,
    "oldPrice": 346000,
    "rating": 4.2,
    "sold": 288,
    "stock": 31,
    "image": "/assets/products/apple-iphone-charger-1.webp",
    "images": [
      "/assets/products/apple-iphone-charger-1.webp",
      "/assets/products/apple-iphone-charger-2.webp"
    ],
    "contain": true,
    "badge": "PILIHAN DOPAMINE",
    "specs": [
      "Pilihan gadget",
      "Untuk keseharian",
      "Desain praktis"
    ],
    "description": "Lengkapi rutinitas digitalmu dengan perangkat yang pas. Pilihan untuk bekerja, menikmati hiburan, dan tetap terhubung dalam aktivitas sehari-hari.",
    "keywords": "elektronik  charger pengisi daya electronics chargers",
    "location": "Tangerang",
    "merchant": "Apple Store",
    "created": 127,
    "demo": true,
    "source": {
      "provider": "DummyJSON",
      "id": 104
    }
  },
  {
    "id": "beats-flex-wireless-earphones",
    "name": "Beats Flex Wireless Earphones",
    "brand": "Beats",
    "category": "Elektronik",
    "price": 700000,
    "oldPrice": 778000,
    "rating": 4.2,
    "sold": 429,
    "stock": 50,
    "image": "/assets/products/beats-flex-wireless-earphones-1.webp",
    "images": [
      "/assets/products/beats-flex-wireless-earphones-1.webp"
    ],
    "contain": true,
    "badge": "",
    "specs": [
      "Pilihan gadget",
      "Untuk keseharian",
      "Desain praktis"
    ],
    "description": "Lengkapi rutinitas digitalmu dengan perangkat yang pas. Pilihan untuk bekerja, menikmati hiburan, dan tetap terhubung dalam aktivitas sehari-hari.",
    "keywords": "elektronik  earphone audio musik electronics wireless earphones",
    "location": "Jakarta Selatan",
    "merchant": "Beats Store",
    "created": 128,
    "demo": true,
    "source": {
      "provider": "DummyJSON",
      "id": 107
    }
  },
  {
    "id": "iphone-13-pro",
    "name": "iPhone 13 Pro",
    "brand": "Apple",
    "category": "Elektronik",
    "price": 15400000,
    "oldPrice": 17112000,
    "rating": 4.1,
    "sold": 1181,
    "stock": 56,
    "image": "/assets/products/iphone-13-pro-1.webp",
    "images": [
      "/assets/products/iphone-13-pro-1.webp",
      "/assets/products/iphone-13-pro-2.webp",
      "/assets/products/iphone-13-pro-3.webp"
    ],
    "contain": true,
    "badge": "",
    "specs": [
      "Pilihan gadget",
      "Untuk keseharian",
      "Desain praktis"
    ],
    "description": "Lengkapi rutinitas digitalmu dengan perangkat yang pas. Pilihan untuk bekerja, menikmati hiburan, dan tetap terhubung dalam aktivitas sehari-hari.",
    "keywords": "elektronik handphone hp ponsel smartphone  smartphones apple",
    "location": "Bandung",
    "merchant": "Apple Store",
    "created": 129,
    "demo": true,
    "source": {
      "provider": "DummyJSON",
      "id": 123
    }
  },
  {
    "id": "oppo-a57",
    "name": "Oppo A57",
    "brand": "Oppo",
    "category": "Elektronik",
    "price": 3500000,
    "oldPrice": 3889000,
    "rating": 3.9,
    "sold": 1275,
    "stock": 19,
    "image": "/assets/products/oppo-a57-1.webp",
    "images": [
      "/assets/products/oppo-a57-1.webp",
      "/assets/products/oppo-a57-2.webp",
      "/assets/products/oppo-a57-3.webp"
    ],
    "contain": true,
    "badge": "NEW FIND",
    "specs": [
      "Pilihan gadget",
      "Untuk keseharian",
      "Desain praktis"
    ],
    "description": "Lengkapi rutinitas digitalmu dengan perangkat yang pas. Pilihan untuk bekerja, menikmati hiburan, dan tetap terhubung dalam aktivitas sehari-hari.",
    "keywords": "elektronik handphone hp ponsel smartphone  smartphones oppo",
    "location": "Surabaya",
    "merchant": "Oppo Store",
    "created": 130,
    "demo": true,
    "source": {
      "provider": "DummyJSON",
      "id": 125
    }
  },
  {
    "id": "realme-c35",
    "name": "Realme C35",
    "brand": "Realme",
    "category": "Elektronik",
    "price": 2100000,
    "oldPrice": 2471000,
    "rating": 4.2,
    "sold": 1416,
    "stock": 48,
    "image": "/assets/products/realme-c35-1.webp",
    "images": [
      "/assets/products/realme-c35-1.webp",
      "/assets/products/realme-c35-2.webp",
      "/assets/products/realme-c35-3.webp"
    ],
    "contain": true,
    "badge": "",
    "specs": [
      "Pilihan gadget",
      "Untuk keseharian",
      "Desain praktis"
    ],
    "description": "Lengkapi rutinitas digitalmu dengan perangkat yang pas. Pilihan untuk bekerja, menikmati hiburan, dan tetap terhubung dalam aktivitas sehari-hari.",
    "keywords": "elektronik handphone hp ponsel smartphone  smartphones realme",
    "location": "Tangerang",
    "merchant": "Realme Store",
    "created": 131,
    "demo": true,
    "source": {
      "provider": "DummyJSON",
      "id": 128
    }
  },
  {
    "id": "blue-black-check-shirt",
    "name": "Kemeja Kotak Biru & Hitam",
    "brand": "Fashion Trends",
    "category": "Fashion",
    "price": 420000,
    "oldPrice": 495000,
    "rating": 3.6,
    "sold": 1641,
    "stock": 38,
    "image": "/assets/products/blue-black-check-shirt-1.webp",
    "images": [
      "/assets/products/blue-black-check-shirt-1.webp",
      "/assets/products/blue-black-check-shirt-2.webp",
      "/assets/products/blue-black-check-shirt-3.webp"
    ],
    "contain": true,
    "badge": "",
    "specs": [
      "Gaya harian",
      "Mudah dipadukan",
      "Pilihan fashion"
    ],
    "description": "Detail yang membuat gaya harian terasa lebih personal. Padukan dengan koleksi favoritmu untuk kerja, jalan santai, atau momen spesial.",
    "keywords": "fashion kemeja baju pakaian pria  clothing men's shirts",
    "location": "Jakarta Selatan",
    "merchant": "Fashion Trends Store",
    "created": 132,
    "demo": true,
    "source": {
      "provider": "DummyJSON",
      "id": 83
    }
  },
  {
    "id": "man-plaid-shirt",
    "name": "Kemeja Plaid Pria",
    "brand": "Classic Wear",
    "category": "Fashion",
    "price": 490000,
    "oldPrice": 613000,
    "rating": 3.5,
    "sold": 1735,
    "stock": 82,
    "image": "/assets/products/man-plaid-shirt-1.webp",
    "images": [
      "/assets/products/man-plaid-shirt-1.webp",
      "/assets/products/man-plaid-shirt-2.webp",
      "/assets/products/man-plaid-shirt-3.webp"
    ],
    "contain": true,
    "badge": "",
    "specs": [
      "Gaya harian",
      "Mudah dipadukan",
      "Pilihan fashion"
    ],
    "description": "Detail yang membuat gaya harian terasa lebih personal. Padukan dengan koleksi favoritmu untuk kerja, jalan santai, atau momen spesial.",
    "keywords": "fashion kemeja baju pakaian pria  clothing men's shirts",
    "location": "Bandung",
    "merchant": "Classic Wear Store",
    "created": 133,
    "demo": true,
    "source": {
      "provider": "DummyJSON",
      "id": 85
    }
  },
  {
    "id": "man-short-sleeve-shirt",
    "name": "Kemeja Lengan Pendek",
    "brand": "Casual Comfort",
    "category": "Fashion",
    "price": 280000,
    "oldPrice": 312000,
    "rating": 2.9,
    "sold": 1782,
    "stock": 5,
    "image": "/assets/products/man-short-sleeve-shirt-1.webp",
    "images": [
      "/assets/products/man-short-sleeve-shirt-1.webp",
      "/assets/products/man-short-sleeve-shirt-2.webp",
      "/assets/products/man-short-sleeve-shirt-3.webp"
    ],
    "contain": true,
    "badge": "PILIHAN DOPAMINE",
    "specs": [
      "Gaya harian",
      "Mudah dipadukan",
      "Pilihan fashion"
    ],
    "description": "Detail yang membuat gaya harian terasa lebih personal. Padukan dengan koleksi favoritmu untuk kerja, jalan santai, atau momen spesial.",
    "keywords": "fashion kemeja baju pakaian pria  clothing men's shirts",
    "location": "Surabaya",
    "merchant": "Casual Comfort Store",
    "created": 134,
    "demo": true,
    "source": {
      "provider": "DummyJSON",
      "id": 86
    }
  },
  {
    "id": "men-check-shirt",
    "name": "Kemeja Check Pria",
    "brand": "Urban Chic",
    "category": "Fashion",
    "price": 392000,
    "oldPrice": 441000,
    "rating": 2.7,
    "sold": 1829,
    "stock": 95,
    "image": "/assets/products/men-check-shirt-1.webp",
    "images": [
      "/assets/products/men-check-shirt-1.webp",
      "/assets/products/men-check-shirt-2.webp",
      "/assets/products/men-check-shirt-3.webp"
    ],
    "contain": true,
    "badge": "NEW FIND",
    "specs": [
      "Gaya harian",
      "Mudah dipadukan",
      "Pilihan fashion"
    ],
    "description": "Detail yang membuat gaya harian terasa lebih personal. Padukan dengan koleksi favoritmu untuk kerja, jalan santai, atau momen spesial.",
    "keywords": "fashion kemeja baju pakaian pria  clothing men's shirts",
    "location": "Tangerang",
    "merchant": "Urban Chic Store",
    "created": 135,
    "demo": true,
    "source": {
      "provider": "DummyJSON",
      "id": 87
    }
  },
  {
    "id": "girl-summer-dress",
    "name": "Summer Dress",
    "brand": "SEDARI",
    "category": "Fashion",
    "price": 280000,
    "oldPrice": 346000,
    "rating": 4.8,
    "sold": 721,
    "stock": 43,
    "image": "/assets/products/girl-summer-dress-1.webp",
    "images": [
      "/assets/products/girl-summer-dress-1.webp",
      "/assets/products/girl-summer-dress-2.webp",
      "/assets/products/girl-summer-dress-3.webp"
    ],
    "contain": true,
    "badge": "",
    "specs": [
      "Gaya harian",
      "Mudah dipadukan",
      "Pilihan fashion"
    ],
    "description": "Detail yang membuat gaya harian terasa lebih personal. Padukan dengan koleksi favoritmu untuk kerja, jalan santai, atau momen spesial.",
    "keywords": "fashion dress gaun baju pakaian wanita  clothing girls' dresses",
    "location": "Jakarta Selatan",
    "merchant": "DOPAMINE GOODS Store",
    "created": 136,
    "demo": true,
    "source": {
      "provider": "DummyJSON",
      "id": 163
    }
  },
  {
    "id": "gray-dress",
    "name": "Gray Everyday Dress",
    "brand": "RUMAH RASA",
    "category": "Fashion",
    "price": 490000,
    "oldPrice": 570000,
    "rating": 2.7,
    "sold": 768,
    "stock": 55,
    "image": "/assets/products/gray-dress-1.webp",
    "images": [
      "/assets/products/gray-dress-1.webp",
      "/assets/products/gray-dress-2.webp",
      "/assets/products/gray-dress-3.webp"
    ],
    "contain": true,
    "badge": "",
    "specs": [
      "Gaya harian",
      "Mudah dipadukan",
      "Pilihan fashion"
    ],
    "description": "Detail yang membuat gaya harian terasa lebih personal. Padukan dengan koleksi favoritmu untuk kerja, jalan santai, atau momen spesial.",
    "keywords": "fashion dress gaun baju pakaian wanita  clothing dresses",
    "location": "Bandung",
    "merchant": "DOPAMINE GOODS Store",
    "created": 137,
    "demo": true,
    "source": {
      "provider": "DummyJSON",
      "id": 164
    }
  },
  {
    "id": "blue-women-s-handbag",
    "name": "Blue Everyday Handbag",
    "brand": "Fashionista",
    "category": "Fashion",
    "price": 700000,
    "oldPrice": 854000,
    "rating": 2.9,
    "sold": 1144,
    "stock": 76,
    "image": "/assets/products/blue-women-s-handbag-1.webp",
    "images": [
      "/assets/products/blue-women-s-handbag-1.webp",
      "/assets/products/blue-women-s-handbag-2.webp",
      "/assets/products/blue-women-s-handbag-3.webp"
    ],
    "contain": true,
    "badge": "",
    "specs": [
      "Gaya harian",
      "Mudah dipadukan",
      "Pilihan fashion"
    ],
    "description": "Detail yang membuat gaya harian terasa lebih personal. Padukan dengan koleksi favoritmu untuk kerja, jalan santai, atau momen spesial.",
    "keywords": "fashion tas wanita  fashion accessories handbags",
    "location": "Surabaya",
    "merchant": "Fashionista Store",
    "created": 138,
    "demo": true,
    "source": {
      "provider": "DummyJSON",
      "id": 172
    }
  },
  {
    "id": "heshe-women-s-leather-bag",
    "name": "Heshe Leather Bag",
    "brand": "Heshe",
    "category": "Fashion",
    "price": 1820000,
    "oldPrice": 2023000,
    "rating": 4.9,
    "sold": 1191,
    "stock": 99,
    "image": "/assets/products/heshe-women-s-leather-bag-1.webp",
    "images": [
      "/assets/products/heshe-women-s-leather-bag-1.webp",
      "/assets/products/heshe-women-s-leather-bag-2.webp",
      "/assets/products/heshe-women-s-leather-bag-3.webp"
    ],
    "contain": true,
    "badge": "",
    "specs": [
      "Gaya harian",
      "Mudah dipadukan",
      "Pilihan fashion"
    ],
    "description": "Detail yang membuat gaya harian terasa lebih personal. Padukan dengan koleksi favoritmu untuk kerja, jalan santai, atau momen spesial.",
    "keywords": "fashion tas wanita  fashion accessories leather bags",
    "location": "Tangerang",
    "merchant": "Heshe Store",
    "created": 139,
    "demo": true,
    "source": {
      "provider": "DummyJSON",
      "id": 173
    }
  },
  {
    "id": "white-faux-leather-backpack",
    "name": "White Faux Leather Backpack",
    "brand": "Urban Chic",
    "category": "Fashion",
    "price": 560000,
    "oldPrice": 659000,
    "rating": 3.4,
    "sold": 1285,
    "stock": 39,
    "image": "/assets/products/white-faux-leather-backpack-1.webp",
    "images": [
      "/assets/products/white-faux-leather-backpack-1.webp",
      "/assets/products/white-faux-leather-backpack-2.webp",
      "/assets/products/white-faux-leather-backpack-3.webp"
    ],
    "contain": true,
    "badge": "NEW FIND",
    "specs": [
      "Gaya harian",
      "Mudah dipadukan",
      "Pilihan fashion"
    ],
    "description": "Detail yang membuat gaya harian terasa lebih personal. Padukan dengan koleksi favoritmu untuk kerja, jalan santai, atau momen spesial.",
    "keywords": "fashion tas wanita ransel punggung backpack fashion accessories backpacks",
    "location": "Jakarta Selatan",
    "merchant": "Urban Chic Store",
    "created": 140,
    "demo": true,
    "source": {
      "provider": "DummyJSON",
      "id": 175
    }
  },
  {
    "id": "women-handbag-black",
    "name": "Black Everyday Handbag",
    "brand": "Elegance Collection",
    "category": "Fashion",
    "price": 840000,
    "oldPrice": 955000,
    "rating": 2.9,
    "sold": 1332,
    "stock": 11,
    "image": "/assets/products/women-handbag-black-1.webp",
    "images": [
      "/assets/products/women-handbag-black-1.webp",
      "/assets/products/women-handbag-black-2.webp",
      "/assets/products/women-handbag-black-3.webp"
    ],
    "contain": true,
    "badge": "PILIHAN DOPAMINE",
    "specs": [
      "Gaya harian",
      "Mudah dipadukan",
      "Pilihan fashion"
    ],
    "description": "Detail yang membuat gaya harian terasa lebih personal. Padukan dengan koleksi favoritmu untuk kerja, jalan santai, atau momen spesial.",
    "keywords": "fashion tas wanita  fashion accessories handbags",
    "location": "Bandung",
    "merchant": "Elegance Collection Store",
    "created": 141,
    "demo": true,
    "source": {
      "provider": "DummyJSON",
      "id": 176
    }
  },
  {
    "id": "black-women-s-gown",
    "name": "Black Evening Gown",
    "brand": "SEDARI",
    "category": "Fashion",
    "price": 1820000,
    "oldPrice": 2023000,
    "rating": 3.6,
    "sold": 1379,
    "stock": 25,
    "image": "/assets/products/black-women-s-gown-1.webp",
    "images": [
      "/assets/products/black-women-s-gown-1.webp",
      "/assets/products/black-women-s-gown-2.webp",
      "/assets/products/black-women-s-gown-3.webp"
    ],
    "contain": true,
    "badge": "",
    "specs": [
      "Gaya harian",
      "Mudah dipadukan",
      "Pilihan fashion"
    ],
    "description": "Detail yang membuat gaya harian terasa lebih personal. Padukan dengan koleksi favoritmu untuk kerja, jalan santai, atau momen spesial.",
    "keywords": "fashion gaun dress pakaian wanita  clothing gowns",
    "location": "Surabaya",
    "merchant": "DOPAMINE GOODS Store",
    "created": 142,
    "demo": true,
    "source": {
      "provider": "DummyJSON",
      "id": 177
    }
  },
  {
    "id": "bedside-table-african-cherry",
    "name": "Meja Samping African Cherry",
    "brand": "Furniture Co.",
    "category": "Rumah",
    "price": 4200000,
    "oldPrice": 5186000,
    "rating": 2.9,
    "sold": 691,
    "stock": 64,
    "image": "/assets/products/bedside-table-african-cherry-1.webp",
    "images": [
      "/assets/products/bedside-table-african-cherry-1.webp",
      "/assets/products/bedside-table-african-cherry-2.webp",
      "/assets/products/bedside-table-african-cherry-3.webp"
    ],
    "contain": true,
    "badge": "",
    "specs": [
      "Untuk rumah",
      "Praktis digunakan",
      "Pilihan living"
    ],
    "description": "Beri ruang buat keseharian yang lebih nyaman. Barang pilihan untuk melengkapi sudut rumah, merapikan rutinitas, dan menikmati waktu di rumah.",
    "keywords": "rumah furnitur perabot meja  furniture bedside tables",
    "location": "Tangerang",
    "merchant": "Furniture Co. Store",
    "created": 143,
    "demo": true,
    "source": {
      "provider": "DummyJSON",
      "id": 13
    }
  },
  {
    "id": "family-tree-photo-frame",
    "name": "Bingkai Foto Family Tree",
    "brand": "DOPAMINE GOODS",
    "category": "Rumah",
    "price": 420000,
    "oldPrice": 495000,
    "rating": 4.5,
    "sold": 2148,
    "stock": 77,
    "image": "/assets/products/family-tree-photo-frame-1.webp",
    "images": [
      "/assets/products/family-tree-photo-frame-1.webp"
    ],
    "contain": true,
    "badge": "",
    "specs": [
      "Untuk rumah",
      "Praktis digunakan",
      "Pilihan living"
    ],
    "description": "Beri ruang buat keseharian yang lebih nyaman. Barang pilihan untuk melengkapi sudut rumah, merapikan rutinitas, dan menikmati waktu di rumah.",
    "keywords": "rumah dekorasi rumah bingkai foto pajangan home decor photo frame",
    "location": "Jakarta Selatan",
    "merchant": "DOPAMINE GOODS Store",
    "created": 144,
    "demo": true,
    "source": {
      "provider": "DummyJSON",
      "id": 44
    }
  },
  {
    "id": "house-showpiece-plant",
    "name": "Tanaman Dekorasi Rumah",
    "brand": "SEDARI",
    "category": "Rumah",
    "price": 560000,
    "oldPrice": 623000,
    "rating": 4.7,
    "sold": 2195,
    "stock": 28,
    "image": "/assets/products/house-showpiece-plant-1.webp",
    "images": [
      "/assets/products/house-showpiece-plant-1.webp",
      "/assets/products/house-showpiece-plant-2.webp",
      "/assets/products/house-showpiece-plant-3.webp"
    ],
    "contain": true,
    "badge": "NEW FIND",
    "specs": [
      "Untuk rumah",
      "Praktis digunakan",
      "Pilihan living"
    ],
    "description": "Beri ruang buat keseharian yang lebih nyaman. Barang pilihan untuk melengkapi sudut rumah, merapikan rutinitas, dan menikmati waktu di rumah.",
    "keywords": "rumah dekorasi rumah tanaman hias pajangan home decor artificial plants",
    "location": "Bandung",
    "merchant": "DOPAMINE GOODS Store",
    "created": 145,
    "demo": true,
    "source": {
      "provider": "DummyJSON",
      "id": 45
    }
  },
  {
    "id": "bamboo-spatula",
    "name": "Spatula Bambu",
    "brand": "RUMAH RASA",
    "category": "Rumah",
    "price": 112000,
    "oldPrice": 125000,
    "rating": 3.3,
    "sold": 2336,
    "stock": 37,
    "image": "/assets/products/bamboo-spatula-1.webp",
    "images": [
      "/assets/products/bamboo-spatula-1.webp"
    ],
    "contain": true,
    "badge": "",
    "specs": [
      "Untuk rumah",
      "Praktis digunakan",
      "Pilihan living"
    ],
    "description": "Beri ruang buat keseharian yang lebih nyaman. Barang pilihan untuk melengkapi sudut rumah, merapikan rutinitas, dan menikmati waktu di rumah.",
    "keywords": "rumah dapur spatula masak kitchen tools utensils",
    "location": "Surabaya",
    "merchant": "DOPAMINE GOODS Store",
    "created": 146,
    "demo": true,
    "source": {
      "provider": "DummyJSON",
      "id": 48
    }
  },
  {
    "id": "boxed-blender",
    "name": "Blender Dapur",
    "brand": "DOPAMINE GOODS",
    "category": "Rumah",
    "price": 560000,
    "oldPrice": 623000,
    "rating": 4.6,
    "sold": 137,
    "stock": 9,
    "image": "/assets/products/boxed-blender-1.webp",
    "images": [
      "/assets/products/boxed-blender-1.webp",
      "/assets/products/boxed-blender-2.webp",
      "/assets/products/boxed-blender-3.webp"
    ],
    "contain": true,
    "badge": "",
    "specs": [
      "Untuk rumah",
      "Praktis digunakan",
      "Pilihan living"
    ],
    "description": "Beri ruang buat keseharian yang lebih nyaman. Barang pilihan untuk melengkapi sudut rumah, merapikan rutinitas, dan menikmati waktu di rumah.",
    "keywords": "rumah dapur blender jus kitchen appliances blenders",
    "location": "Tangerang",
    "merchant": "DOPAMINE GOODS Store",
    "created": 147,
    "demo": true,
    "source": {
      "provider": "DummyJSON",
      "id": 51
    }
  },
  {
    "id": "carbon-steel-wok",
    "name": "Wajan Carbon Steel",
    "brand": "SEDARI",
    "category": "Rumah",
    "price": 420000,
    "oldPrice": 467000,
    "rating": 4.1,
    "sold": 184,
    "stock": 40,
    "image": "/assets/products/carbon-steel-wok-1.webp",
    "images": [
      "/assets/products/carbon-steel-wok-1.webp"
    ],
    "contain": true,
    "badge": "PILIHAN DOPAMINE",
    "specs": [
      "Untuk rumah",
      "Praktis digunakan",
      "Pilihan living"
    ],
    "description": "Beri ruang buat keseharian yang lebih nyaman. Barang pilihan untuk melengkapi sudut rumah, merapikan rutinitas, dan menikmati waktu di rumah.",
    "keywords": "rumah dapur wajan masak cookware woks",
    "location": "Jakarta Selatan",
    "merchant": "DOPAMINE GOODS Store",
    "created": 148,
    "demo": true,
    "source": {
      "provider": "DummyJSON",
      "id": 52
    }
  },
  {
    "id": "chopping-board",
    "name": "Talenan Kayu",
    "brand": "RUMAH RASA",
    "category": "Rumah",
    "price": 182000,
    "oldPrice": 203000,
    "rating": 3.7,
    "sold": 231,
    "stock": 14,
    "image": "/assets/products/chopping-board-1.webp",
    "images": [
      "/assets/products/chopping-board-1.webp"
    ],
    "contain": true,
    "badge": "",
    "specs": [
      "Untuk rumah",
      "Praktis digunakan",
      "Pilihan living"
    ],
    "description": "Beri ruang buat keseharian yang lebih nyaman. Barang pilihan untuk melengkapi sudut rumah, merapikan rutinitas, dan menikmati waktu di rumah.",
    "keywords": "rumah dapur talenan papan potong kitchen tools cutting boards",
    "location": "Bandung",
    "merchant": "DOPAMINE GOODS Store",
    "created": 149,
    "demo": true,
    "source": {
      "provider": "DummyJSON",
      "id": 53
    }
  },
  {
    "id": "glass",
    "name": "Gelas Bening",
    "brand": "DOPAMINE GOODS",
    "category": "Rumah",
    "price": 70000,
    "oldPrice": 78000,
    "rating": 4,
    "sold": 513,
    "stock": 46,
    "image": "/assets/products/glass-1.webp",
    "images": [
      "/assets/products/glass-1.webp"
    ],
    "contain": true,
    "badge": "NEW FIND",
    "specs": [
      "Untuk rumah",
      "Praktis digunakan",
      "Pilihan living"
    ],
    "description": "Beri ruang buat keseharian yang lebih nyaman. Barang pilihan untuk melengkapi sudut rumah, merapikan rutinitas, dan menikmati waktu di rumah.",
    "keywords": "rumah dapur gelas minum drinkware glasses",
    "location": "Surabaya",
    "merchant": "DOPAMINE GOODS Store",
    "created": 150,
    "demo": true,
    "source": {
      "provider": "DummyJSON",
      "id": 59
    }
  },
  {
    "id": "lunch-box",
    "name": "Kotak Makan Everyday",
    "brand": "SEDARI",
    "category": "Rumah",
    "price": 182000,
    "oldPrice": 203000,
    "rating": 4.9,
    "sold": 795,
    "stock": 94,
    "image": "/assets/products/lunch-box-1.webp",
    "images": [
      "/assets/products/lunch-box-1.webp"
    ],
    "contain": true,
    "badge": "",
    "specs": [
      "Untuk rumah",
      "Praktis digunakan",
      "Pilihan living"
    ],
    "description": "Beri ruang buat keseharian yang lebih nyaman. Barang pilihan untuk melengkapi sudut rumah, merapikan rutinitas, dan menikmati waktu di rumah.",
    "keywords": "rumah dapur kotak bekal makan kitchen tools storage",
    "location": "Tangerang",
    "merchant": "DOPAMINE GOODS Store",
    "created": 151,
    "demo": true,
    "source": {
      "provider": "DummyJSON",
      "id": 65
    }
  },
  {
    "id": "microwave-oven",
    "name": "Microwave Oven",
    "brand": "RUMAH RASA",
    "category": "Rumah",
    "price": 1260000,
    "oldPrice": 1432000,
    "rating": 4.8,
    "sold": 842,
    "stock": 59,
    "image": "/assets/products/microwave-oven-1.webp",
    "images": [
      "/assets/products/microwave-oven-1.webp",
      "/assets/products/microwave-oven-2.webp",
      "/assets/products/microwave-oven-3.webp"
    ],
    "contain": true,
    "badge": "",
    "specs": [
      "Untuk rumah",
      "Praktis digunakan",
      "Pilihan living"
    ],
    "description": "Beri ruang buat keseharian yang lebih nyaman. Barang pilihan untuk melengkapi sudut rumah, merapikan rutinitas, dan menikmati waktu di rumah.",
    "keywords": "rumah dapur microwave oven masak kitchen appliances microwaves",
    "location": "Jakarta Selatan",
    "merchant": "DOPAMINE GOODS Store",
    "created": 152,
    "demo": true,
    "source": {
      "provider": "DummyJSON",
      "id": 66
    }
  },
  {
    "id": "silver-pot-with-glass-cap",
    "name": "Panci Stainless dengan Tutup Kaca",
    "brand": "DOPAMINE GOODS",
    "category": "Rumah",
    "price": 560000,
    "oldPrice": 623000,
    "rating": 3.2,
    "sold": 1077,
    "stock": 40,
    "image": "/assets/products/silver-pot-with-glass-cap-1.webp",
    "images": [
      "/assets/products/silver-pot-with-glass-cap-1.webp"
    ],
    "contain": true,
    "badge": "",
    "specs": [
      "Untuk rumah",
      "Praktis digunakan",
      "Pilihan living"
    ],
    "description": "Beri ruang buat keseharian yang lebih nyaman. Barang pilihan untuk melengkapi sudut rumah, merapikan rutinitas, dan menikmati waktu di rumah.",
    "keywords": "rumah dapur panci masak cookware pots",
    "location": "Bandung",
    "merchant": "DOPAMINE GOODS Store",
    "created": 153,
    "demo": true,
    "source": {
      "provider": "DummyJSON",
      "id": 71
    }
  },
  {
    "id": "spice-rack",
    "name": "Rak Bumbu Dapur",
    "brand": "SEDARI",
    "category": "Rumah",
    "price": 280000,
    "oldPrice": 319000,
    "rating": 4.9,
    "sold": 1171,
    "stock": 79,
    "image": "/assets/products/spice-rack-1.webp",
    "images": [
      "/assets/products/spice-rack-1.webp"
    ],
    "contain": true,
    "badge": "",
    "specs": [
      "Untuk rumah",
      "Praktis digunakan",
      "Pilihan living"
    ],
    "description": "Beri ruang buat keseharian yang lebih nyaman. Barang pilihan untuk melengkapi sudut rumah, merapikan rutinitas, dan menikmati waktu di rumah.",
    "keywords": "rumah dapur rak bumbu kitchen tools organization",
    "location": "Surabaya",
    "merchant": "DOPAMINE GOODS Store",
    "created": 154,
    "demo": true,
    "source": {
      "provider": "DummyJSON",
      "id": 73
    }
  },
  {
    "id": "essence-mascara-lash-princess",
    "name": "Essence Mascara Lash Princess",
    "brand": "Essence",
    "category": "Kecantikan",
    "price": 140000,
    "oldPrice": 156000,
    "rating": 2.6,
    "sold": 127,
    "stock": 99,
    "image": "/assets/products/essence-mascara-lash-princess-1.webp",
    "images": [
      "/assets/products/essence-mascara-lash-princess-1.webp"
    ],
    "contain": true,
    "badge": "NEW FIND",
    "specs": [
      "Perawatan harian",
      "Koleksi beauty",
      "Untuk rutinitasmu"
    ],
    "description": "Temukan pilihan untuk ritual merawat diri. Lengkapi rutinitas harian dengan produk beauty yang sesuai selera dan kebutuhanmu.",
    "keywords": "kecantikan  maskara rias kosmetik makeup beauty mascara",
    "location": "Tangerang",
    "merchant": "Essence Store",
    "created": 155,
    "demo": true,
    "source": {
      "provider": "DummyJSON",
      "id": 1
    }
  },
  {
    "id": "eyeshadow-palette-with-mirror",
    "name": "Eyeshadow Palette with Mirror",
    "brand": "Glamour Beauty",
    "category": "Kecantikan",
    "price": 280000,
    "oldPrice": 342000,
    "rating": 2.9,
    "sold": 174,
    "stock": 34,
    "image": "/assets/products/eyeshadow-palette-with-mirror-1.webp",
    "images": [
      "/assets/products/eyeshadow-palette-with-mirror-1.webp"
    ],
    "contain": true,
    "badge": "",
    "specs": [
      "Perawatan harian",
      "Koleksi beauty",
      "Untuk rutinitasmu"
    ],
    "description": "Temukan pilihan untuk ritual merawat diri. Lengkapi rutinitas harian dengan produk beauty yang sesuai selera dan kebutuhanmu.",
    "keywords": "kecantikan  riasan mata kosmetik makeup beauty eyeshadow",
    "location": "Jakarta Selatan",
    "merchant": "Glamour Beauty Store",
    "created": 156,
    "demo": true,
    "source": {
      "provider": "DummyJSON",
      "id": 2
    }
  },
  {
    "id": "powder-canister",
    "name": "Powder Canister",
    "brand": "Velvet Touch",
    "category": "Kecantikan",
    "price": 210000,
    "oldPrice": 234000,
    "rating": 4.6,
    "sold": 221,
    "stock": 89,
    "image": "/assets/products/powder-canister-1.webp",
    "images": [
      "/assets/products/powder-canister-1.webp"
    ],
    "contain": true,
    "badge": "",
    "specs": [
      "Perawatan harian",
      "Koleksi beauty",
      "Untuk rutinitasmu"
    ],
    "description": "Temukan pilihan untuk ritual merawat diri. Lengkapi rutinitas harian dengan produk beauty yang sesuai selera dan kebutuhanmu.",
    "keywords": "kecantikan  bedak kosmetik makeup beauty face powder",
    "location": "Bandung",
    "merchant": "Velvet Touch Store",
    "created": 157,
    "demo": true,
    "source": {
      "provider": "DummyJSON",
      "id": 3
    }
  },
  {
    "id": "red-lipstick",
    "name": "Red Lipstick",
    "brand": "Chic Cosmetics",
    "category": "Kecantikan",
    "price": 182000,
    "oldPrice": 207000,
    "rating": 4.4,
    "sold": 268,
    "stock": 91,
    "image": "/assets/products/red-lipstick-1.webp",
    "images": [
      "/assets/products/red-lipstick-1.webp"
    ],
    "contain": true,
    "badge": "",
    "specs": [
      "Perawatan harian",
      "Koleksi beauty",
      "Untuk rutinitasmu"
    ],
    "description": "Temukan pilihan untuk ritual merawat diri. Lengkapi rutinitas harian dengan produk beauty yang sesuai selera dan kebutuhanmu.",
    "keywords": "kecantikan  lipstik bibir kosmetik makeup beauty lipstick",
    "location": "Surabaya",
    "merchant": "Chic Cosmetics Store",
    "created": 158,
    "demo": true,
    "source": {
      "provider": "DummyJSON",
      "id": 4
    }
  },
  {
    "id": "red-nail-polish",
    "name": "Red Nail Polish",
    "brand": "Nail Couture",
    "category": "Kecantikan",
    "price": 126000,
    "oldPrice": 142000,
    "rating": 4.3,
    "sold": 315,
    "stock": 79,
    "image": "/assets/products/red-nail-polish-1.webp",
    "images": [
      "/assets/products/red-nail-polish-1.webp"
    ],
    "contain": true,
    "badge": "",
    "specs": [
      "Perawatan harian",
      "Koleksi beauty",
      "Untuk rutinitasmu"
    ],
    "description": "Temukan pilihan untuk ritual merawat diri. Lengkapi rutinitas harian dengan produk beauty yang sesuai selera dan kebutuhanmu.",
    "keywords": "kecantikan  kuteks cat kuku kosmetik makeup beauty nail polish",
    "location": "Tangerang",
    "merchant": "Nail Couture Store",
    "created": 159,
    "demo": true,
    "source": {
      "provider": "DummyJSON",
      "id": 5
    }
  },
  {
    "id": "calvin-klein-ck-one",
    "name": "Calvin Klein CK One",
    "brand": "Calvin Klein",
    "category": "Kecantikan",
    "price": 700000,
    "oldPrice": 778000,
    "rating": 4.4,
    "sold": 362,
    "stock": 29,
    "image": "/assets/products/calvin-klein-ck-one-1.webp",
    "images": [
      "/assets/products/calvin-klein-ck-one-1.webp",
      "/assets/products/calvin-klein-ck-one-2.webp",
      "/assets/products/calvin-klein-ck-one-3.webp"
    ],
    "contain": true,
    "badge": "NEW FIND",
    "specs": [
      "Perawatan harian",
      "Koleksi beauty",
      "Untuk rutinitasmu"
    ],
    "description": "Temukan pilihan untuk ritual merawat diri. Lengkapi rutinitas harian dengan produk beauty yang sesuai selera dan kebutuhanmu.",
    "keywords": "kecantikan parfum wangi aroma  fragrances perfumes",
    "location": "Jakarta Selatan",
    "merchant": "Calvin Klein Store",
    "created": 160,
    "demo": true,
    "source": {
      "provider": "DummyJSON",
      "id": 6
    }
  },
  {
    "id": "dior-j-adore",
    "name": "Dior J'adore",
    "brand": "Dior",
    "category": "Kecantikan",
    "price": 1260000,
    "oldPrice": 1483000,
    "rating": 3.8,
    "sold": 456,
    "stock": 98,
    "image": "/assets/products/dior-j-adore-1.webp",
    "images": [
      "/assets/products/dior-j-adore-1.webp",
      "/assets/products/dior-j-adore-2.webp",
      "/assets/products/dior-j-adore-3.webp"
    ],
    "contain": true,
    "badge": "",
    "specs": [
      "Perawatan harian",
      "Koleksi beauty",
      "Untuk rutinitasmu"
    ],
    "description": "Temukan pilihan untuk ritual merawat diri. Lengkapi rutinitas harian dengan produk beauty yang sesuai selera dan kebutuhanmu.",
    "keywords": "kecantikan parfum wangi aroma  fragrances perfumes",
    "location": "Bandung",
    "merchant": "Dior Store",
    "created": 161,
    "demo": true,
    "source": {
      "provider": "DummyJSON",
      "id": 8
    }
  },
  {
    "id": "attitude-super-leaves-hand-soap",
    "name": "Attitude Super Leaves Hand Soap",
    "brand": "Attitude",
    "category": "Kecantikan",
    "price": 126000,
    "oldPrice": 154000,
    "rating": 3.2,
    "sold": 946,
    "stock": 94,
    "image": "/assets/products/attitude-super-leaves-hand-soap-1.webp",
    "images": [
      "/assets/products/attitude-super-leaves-hand-soap-1.webp",
      "/assets/products/attitude-super-leaves-hand-soap-2.webp",
      "/assets/products/attitude-super-leaves-hand-soap-3.webp"
    ],
    "contain": true,
    "badge": "PILIHAN DOPAMINE",
    "specs": [
      "Perawatan harian",
      "Koleksi beauty",
      "Untuk rutinitasmu"
    ],
    "description": "Temukan pilihan untuk ritual merawat diri. Lengkapi rutinitas harian dengan produk beauty yang sesuai selera dan kebutuhanmu.",
    "keywords": "kecantikan perawatan tubuh skincare sabun tangan personal care hand soap",
    "location": "Surabaya",
    "merchant": "Attitude Store",
    "created": 162,
    "demo": true,
    "source": {
      "provider": "DummyJSON",
      "id": 118
    }
  },
  {
    "id": "olay-ultra-moisture-shea-butter-body-wash",
    "name": "Olay Ultra Moisture Shea Butter Body Wash",
    "brand": "Olay",
    "category": "Kecantikan",
    "price": 182000,
    "oldPrice": 217000,
    "rating": 4.5,
    "sold": 993,
    "stock": 34,
    "image": "/assets/products/olay-ultra-moisture-shea-butter-body-wash-1.webp",
    "images": [
      "/assets/products/olay-ultra-moisture-shea-butter-body-wash-1.webp",
      "/assets/products/olay-ultra-moisture-shea-butter-body-wash-2.webp",
      "/assets/products/olay-ultra-moisture-shea-butter-body-wash-3.webp"
    ],
    "contain": true,
    "badge": "",
    "specs": [
      "Perawatan harian",
      "Koleksi beauty",
      "Untuk rutinitasmu"
    ],
    "description": "Temukan pilihan untuk ritual merawat diri. Lengkapi rutinitas harian dengan produk beauty yang sesuai selera dan kebutuhanmu.",
    "keywords": "kecantikan perawatan tubuh skincare sabun mandi personal care body wash",
    "location": "Tangerang",
    "merchant": "Olay Store",
    "created": 163,
    "demo": true,
    "source": {
      "provider": "DummyJSON",
      "id": 119
    }
  },
  {
    "id": "vaseline-men-body-and-face-lotion",
    "name": "Vaseline Men Body and Face Lotion",
    "brand": "Vaseline",
    "category": "Kecantikan",
    "price": 140000,
    "oldPrice": 161000,
    "rating": 3.2,
    "sold": 1040,
    "stock": 95,
    "image": "/assets/products/vaseline-men-body-and-face-lotion-1.webp",
    "images": [
      "/assets/products/vaseline-men-body-and-face-lotion-1.webp",
      "/assets/products/vaseline-men-body-and-face-lotion-2.webp",
      "/assets/products/vaseline-men-body-and-face-lotion-3.webp"
    ],
    "contain": true,
    "badge": "",
    "specs": [
      "Perawatan harian",
      "Koleksi beauty",
      "Untuk rutinitasmu"
    ],
    "description": "Temukan pilihan untuk ritual merawat diri. Lengkapi rutinitas harian dengan produk beauty yang sesuai selera dan kebutuhanmu.",
    "keywords": "kecantikan perawatan tubuh skincare losion lotion pelembap personal care body lotion",
    "location": "Jakarta Selatan",
    "merchant": "Vaseline Store",
    "created": 164,
    "demo": true,
    "source": {
      "provider": "DummyJSON",
      "id": 120
    }
  },
  {
    "id": "puma-future-rider-trainers",
    "name": "Puma Future Rider Trainers",
    "brand": "Puma",
    "category": "Olahraga",
    "price": 1260000,
    "oldPrice": 1400000,
    "rating": 4.9,
    "sold": 1970,
    "stock": 90,
    "image": "/assets/products/puma-future-rider-trainers-1.webp",
    "images": [
      "/assets/products/puma-future-rider-trainers-1.webp",
      "/assets/products/puma-future-rider-trainers-2.webp",
      "/assets/products/puma-future-rider-trainers-3.webp"
    ],
    "contain": true,
    "badge": "NEW FIND",
    "specs": [
      "Untuk aktivitas",
      "Perlengkapan olahraga",
      "Pilihan sport"
    ],
    "description": "Bikin waktu bergerak jadi lebih seru. Pilih perlengkapan untuk latihan, bermain bersama teman, dan mengikuti aktivitas favoritmu.",
    "keywords": "olahraga sepatu sneakers olahraga  footwear casual shoes",
    "location": "Bandung",
    "merchant": "Puma Store",
    "created": 165,
    "demo": true,
    "source": {
      "provider": "DummyJSON",
      "id": 90
    }
  },
  {
    "id": "basketball",
    "name": "Bola Basket",
    "brand": "SEDARI",
    "category": "Olahraga",
    "price": 210000,
    "oldPrice": 234000,
    "rating": 4.7,
    "sold": 1980,
    "stock": 75,
    "image": "/assets/products/basketball-1.webp",
    "images": [
      "/assets/products/basketball-1.webp"
    ],
    "contain": true,
    "badge": "",
    "specs": [
      "Untuk aktivitas",
      "Perlengkapan olahraga",
      "Pilihan sport"
    ],
    "description": "Bikin waktu bergerak jadi lebih seru. Pilih perlengkapan untuk latihan, bermain bersama teman, dan mengikuti aktivitas favoritmu.",
    "keywords": "olahraga  bola basket sports equipment basketball",
    "location": "Surabaya",
    "merchant": "DOPAMINE GOODS Store",
    "created": 166,
    "demo": true,
    "source": {
      "provider": "DummyJSON",
      "id": 140
    }
  },
  {
    "id": "feather-shuttlecock",
    "name": "Shuttlecock Feather",
    "brand": "RUMAH RASA",
    "category": "Olahraga",
    "price": 84000,
    "oldPrice": 94000,
    "rating": 2.9,
    "sold": 2262,
    "stock": 95,
    "image": "/assets/products/feather-shuttlecock-1.webp",
    "images": [
      "/assets/products/feather-shuttlecock-1.webp"
    ],
    "contain": true,
    "badge": "",
    "specs": [
      "Untuk aktivitas",
      "Perlengkapan olahraga",
      "Pilihan sport"
    ],
    "description": "Bikin waktu bergerak jadi lebih seru. Pilih perlengkapan untuk latihan, bermain bersama teman, dan mengikuti aktivitas favoritmu.",
    "keywords": "olahraga  kok bulutangkis badminton sports equipment badminton",
    "location": "Tangerang",
    "merchant": "DOPAMINE GOODS Store",
    "created": 167,
    "demo": true,
    "source": {
      "provider": "DummyJSON",
      "id": 146
    }
  },
  {
    "id": "football",
    "name": "Bola Sepak",
    "brand": "DOPAMINE GOODS",
    "category": "Olahraga",
    "price": 252000,
    "oldPrice": 280000,
    "rating": 3.3,
    "sold": 2309,
    "stock": 96,
    "image": "/assets/products/football-1.webp",
    "images": [
      "/assets/products/football-1.webp"
    ],
    "contain": true,
    "badge": "",
    "specs": [
      "Untuk aktivitas",
      "Perlengkapan olahraga",
      "Pilihan sport"
    ],
    "description": "Bikin waktu bergerak jadi lebih seru. Pilih perlengkapan untuk latihan, bermain bersama teman, dan mengikuti aktivitas favoritmu.",
    "keywords": "olahraga  bola sepak sports equipment football",
    "location": "Jakarta Selatan",
    "merchant": "DOPAMINE GOODS Store",
    "created": 168,
    "demo": true,
    "source": {
      "provider": "DummyJSON",
      "id": 147
    }
  },
  {
    "id": "tennis-ball",
    "name": "Bola Tenis",
    "brand": "SEDARI",
    "category": "Olahraga",
    "price": 98000,
    "oldPrice": 112000,
    "rating": 4.1,
    "sold": 157,
    "stock": 28,
    "image": "/assets/products/tennis-ball-1.webp",
    "images": [
      "/assets/products/tennis-ball-1.webp"
    ],
    "contain": true,
    "badge": "PILIHAN DOPAMINE",
    "specs": [
      "Untuk aktivitas",
      "Perlengkapan olahraga",
      "Pilihan sport"
    ],
    "description": "Bikin waktu bergerak jadi lebih seru. Pilih perlengkapan untuk latihan, bermain bersama teman, dan mengikuti aktivitas favoritmu.",
    "keywords": "olahraga  bola tenis sports equipment tennis",
    "location": "Bandung",
    "merchant": "DOPAMINE GOODS Store",
    "created": 169,
    "demo": true,
    "source": {
      "provider": "DummyJSON",
      "id": 151
    }
  },
  {
    "id": "tennis-racket",
    "name": "Raket Tenis",
    "brand": "RUMAH RASA",
    "category": "Olahraga",
    "price": 700000,
    "oldPrice": 875000,
    "rating": 4,
    "sold": 204,
    "stock": 6,
    "image": "/assets/products/tennis-racket-1.webp",
    "images": [
      "/assets/products/tennis-racket-1.webp"
    ],
    "contain": true,
    "badge": "NEW FIND",
    "specs": [
      "Untuk aktivitas",
      "Perlengkapan olahraga",
      "Pilihan sport"
    ],
    "description": "Bikin waktu bergerak jadi lebih seru. Pilih perlengkapan untuk latihan, bermain bersama teman, dan mengikuti aktivitas favoritmu.",
    "keywords": "olahraga  raket tenis sports equipment tennis",
    "location": "Surabaya",
    "merchant": "DOPAMINE GOODS Store",
    "created": 170,
    "demo": true,
    "source": {
      "provider": "DummyJSON",
      "id": 152
    }
  },
  {
    "id": "volleyball",
    "name": "Bola Voli",
    "brand": "DOPAMINE GOODS",
    "category": "Olahraga",
    "price": 168000,
    "oldPrice": 191000,
    "rating": 3.8,
    "sold": 251,
    "stock": 5,
    "image": "/assets/products/volleyball-1.webp",
    "images": [
      "/assets/products/volleyball-1.webp"
    ],
    "contain": true,
    "badge": "",
    "specs": [
      "Untuk aktivitas",
      "Perlengkapan olahraga",
      "Pilihan sport"
    ],
    "description": "Bikin waktu bergerak jadi lebih seru. Pilih perlengkapan untuk latihan, bermain bersama teman, dan mengikuti aktivitas favoritmu.",
    "keywords": "olahraga  bola voli sports equipment volleyball",
    "location": "Tangerang",
    "merchant": "DOPAMINE GOODS Store",
    "created": 171,
    "demo": true,
    "source": {
      "provider": "DummyJSON",
      "id": 153
    }
  },
  {
    "id": "honey-jar",
    "name": "Madu dalam Jar",
    "brand": "SEDARI",
    "category": "Makanan",
    "price": 98000,
    "oldPrice": 114000,
    "rating": 4,
    "sold": 1349,
    "stock": 34,
    "image": "/assets/products/honey-jar-1.webp",
    "images": [
      "/assets/products/honey-jar-1.webp"
    ],
    "contain": true,
    "badge": "",
    "specs": [
      "Kebutuhan dapur",
      "Pilihan harian",
      "Untuk dinikmati"
    ],
    "description": "Lengkapi stok favorit di rumah. Pilihan untuk menemani sarapan, jeda di tengah hari, dan momen berkumpul bersama orang terdekat.",
    "keywords": "makanan  madu condiments",
    "location": "Jakarta Selatan",
    "merchant": "DOPAMINE GOODS Store",
    "created": 172,
    "demo": true,
    "source": {
      "provider": "DummyJSON",
      "id": 27
    }
  },
  {
    "id": "juice",
    "name": "Jus Buah",
    "brand": "RUMAH RASA",
    "category": "Makanan",
    "price": 56000,
    "oldPrice": 64000,
    "rating": 3.9,
    "sold": 1443,
    "stock": 50,
    "image": "/assets/products/juice-1.webp",
    "images": [
      "/assets/products/juice-1.webp"
    ],
    "contain": true,
    "badge": "",
    "specs": [
      "Kebutuhan dapur",
      "Pilihan harian",
      "Untuk dinikmati"
    ],
    "description": "Lengkapi stok favorit di rumah. Pilihan untuk menemani sarapan, jeda di tengah hari, dan momen berkumpul bersama orang terdekat.",
    "keywords": "makanan  jus minuman beverages",
    "location": "Bandung",
    "merchant": "DOPAMINE GOODS Store",
    "created": 173,
    "demo": true,
    "source": {
      "provider": "DummyJSON",
      "id": 29
    }
  },
  {
    "id": "milk",
    "name": "Susu Harian",
    "brand": "DOPAMINE GOODS",
    "category": "Makanan",
    "price": 49000,
    "oldPrice": 57000,
    "rating": 2.6,
    "sold": 1584,
    "stock": 27,
    "image": "/assets/products/milk-1.webp",
    "images": [
      "/assets/products/milk-1.webp"
    ],
    "contain": true,
    "badge": "",
    "specs": [
      "Kebutuhan dapur",
      "Pilihan harian",
      "Untuk dinikmati"
    ],
    "description": "Lengkapi stok favorit di rumah. Pilihan untuk menemani sarapan, jeda di tengah hari, dan momen berkumpul bersama orang terdekat.",
    "keywords": "makanan  susu minuman dairy",
    "location": "Surabaya",
    "merchant": "DOPAMINE GOODS Store",
    "created": 174,
    "demo": true,
    "source": {
      "provider": "DummyJSON",
      "id": 32
    }
  },
  {
    "id": "nescafe-coffee",
    "name": "Nescafe Coffee",
    "brand": "SEDARI",
    "category": "Makanan",
    "price": 112000,
    "oldPrice": 125000,
    "rating": 4.8,
    "sold": 1678,
    "stock": 57,
    "image": "/assets/products/nescafe-coffee-1.webp",
    "images": [
      "/assets/products/nescafe-coffee-1.webp"
    ],
    "contain": true,
    "badge": "NEW FIND",
    "specs": [
      "Kebutuhan dapur",
      "Pilihan harian",
      "Untuk dinikmati"
    ],
    "description": "Lengkapi stok favorit di rumah. Pilihan untuk menemani sarapan, jeda di tengah hari, dan momen berkumpul bersama orang terdekat.",
    "keywords": "makanan  kopi minuman beverages coffee",
    "location": "Tangerang",
    "merchant": "DOPAMINE GOODS Store",
    "created": 175,
    "demo": true,
    "source": {
      "provider": "DummyJSON",
      "id": 34
    }
  },
  {
    "id": "rice",
    "name": "Beras Pilihan",
    "brand": "RUMAH RASA",
    "category": "Makanan",
    "price": 84000,
    "oldPrice": 94000,
    "rating": 3.2,
    "sold": 1866,
    "stock": 59,
    "image": "/assets/products/rice-1.webp",
    "images": [
      "/assets/products/rice-1.webp"
    ],
    "contain": true,
    "badge": "PILIHAN DOPAMINE",
    "specs": [
      "Kebutuhan dapur",
      "Pilihan harian",
      "Untuk dinikmati"
    ],
    "description": "Lengkapi stok favorit di rumah. Pilihan untuk menemani sarapan, jeda di tengah hari, dan momen berkumpul bersama orang terdekat.",
    "keywords": "makanan  beras grains",
    "location": "Jakarta Selatan",
    "merchant": "DOPAMINE GOODS Store",
    "created": 176,
    "demo": true,
    "source": {
      "provider": "DummyJSON",
      "id": 38
    }
  },
  {
    "id": "monopod",
    "name": "Monopod Kamera",
    "brand": "TechGear",
    "category": "Hobi",
    "price": 280000,
    "oldPrice": 312000,
    "rating": 4.4,
    "sold": 523,
    "stock": 48,
    "image": "/assets/products/monopod-1.webp",
    "images": [
      "/assets/products/monopod-1.webp",
      "/assets/products/monopod-2.webp"
    ],
    "contain": true,
    "badge": "",
    "specs": [
      "Untuk kreasi",
      "Pendukung foto & video",
      "Mudah dibawa"
    ],
    "description": "Ikuti rasa ingin tahu dan buat sesuatu yang baru. Pilihan perlengkapan untuk mengabadikan momen, bereksperimen, dan menikmati hobi kreatifmu.",
    "keywords": "hobi  kamera foto video tripod monopod electronics camera accessories",
    "location": "Bandung",
    "merchant": "TechGear Store",
    "created": 177,
    "demo": true,
    "source": {
      "provider": "DummyJSON",
      "id": 109
    }
  },
  {
    "id": "selfie-lamp-with-iphone",
    "name": "Selfie Ring Light",
    "brand": "GadgetMaster",
    "category": "Hobi",
    "price": 210000,
    "oldPrice": 260000,
    "rating": 3.6,
    "sold": 570,
    "stock": 58,
    "image": "/assets/products/selfie-lamp-with-iphone-1.webp",
    "images": [
      "/assets/products/selfie-lamp-with-iphone-1.webp"
    ],
    "contain": true,
    "badge": "",
    "specs": [
      "Untuk kreasi",
      "Pendukung foto & video",
      "Mudah dibawa"
    ],
    "description": "Ikuti rasa ingin tahu dan buat sesuatu yang baru. Pilihan perlengkapan untuk mengabadikan momen, bereksperimen, dan menikmati hobi kreatifmu.",
    "keywords": "hobi  lampu foto video konten electronics selfie accessories",
    "location": "Surabaya",
    "merchant": "GadgetMaster Store",
    "created": 178,
    "demo": true,
    "source": {
      "provider": "DummyJSON",
      "id": 110
    }
  },
  {
    "id": "selfie-stick-monopod",
    "name": "Selfie Stick Monopod",
    "brand": "SnapTech",
    "category": "Hobi",
    "price": 182000,
    "oldPrice": 225000,
    "rating": 3.9,
    "sold": 617,
    "stock": 11,
    "image": "/assets/products/selfie-stick-monopod-1.webp",
    "images": [
      "/assets/products/selfie-stick-monopod-1.webp"
    ],
    "contain": true,
    "badge": "",
    "specs": [
      "Untuk kreasi",
      "Pendukung foto & video",
      "Mudah dibawa"
    ],
    "description": "Ikuti rasa ingin tahu dan buat sesuatu yang baru. Pilihan perlengkapan untuk mengabadikan momen, bereksperimen, dan menikmati hobi kreatifmu.",
    "keywords": "hobi  tongkat selfie foto video electronics selfie accessories",
    "location": "Tangerang",
    "merchant": "SnapTech Store",
    "created": 179,
    "demo": true,
    "source": {
      "provider": "DummyJSON",
      "id": 111
    }
  }
];

export const products = enrichProductKnowledge(enrichCatalog(baseProducts));
