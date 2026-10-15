import { readFile, writeFile, mkdir, access } from 'node:fs/promises';
import { enrichCatalog } from '../data/comparison.js';

const original = JSON.parse(await readFile('data/seed-products.json', 'utf8'));
let source;
try {
  source = JSON.parse(await readFile('data/catalog-source-products.json', 'utf8'));
} catch {
  const response = await fetch('https://dummyjson.com/products?limit=0', { signal: AbortSignal.timeout(30000) });
  if (!response.ok) throw new Error(`Catalog source: HTTP ${response.status}`);
  source = (await response.json()).products;
}
const groups = [
  { category: 'Elektronik', ids: [78, 81, 82, 99, 100, 102, 103, 104, 107, 123, 125, 128], specs: ['Pilihan gadget', 'Untuk keseharian', 'Desain praktis'], copy: 'Lengkapi rutinitas digitalmu dengan perangkat yang pas. Pilihan untuk bekerja, menikmati hiburan, dan tetap terhubung dalam aktivitas sehari-hari.' },
  { category: 'Fashion', ids: [83, 85, 86, 87, 163, 164, 172, 173, 175, 176, 177], specs: ['Gaya harian', 'Mudah dipadukan', 'Pilihan fashion'], copy: 'Detail yang membuat gaya harian terasa lebih personal. Padukan dengan koleksi favoritmu untuk kerja, jalan santai, atau momen spesial.' },
  { category: 'Rumah', ids: [13, 44, 45, 48, 51, 52, 53, 59, 65, 66, 71, 73], specs: ['Untuk rumah', 'Praktis digunakan', 'Pilihan living'], copy: 'Beri ruang buat keseharian yang lebih nyaman. Barang pilihan untuk melengkapi sudut rumah, merapikan rutinitas, dan menikmati waktu di rumah.' },
  { category: 'Kecantikan', ids: [1, 2, 3, 4, 5, 6, 8, 118, 119, 120], specs: ['Perawatan harian', 'Koleksi beauty', 'Untuk rutinitasmu'], copy: 'Temukan pilihan untuk ritual merawat diri. Lengkapi rutinitas harian dengan produk beauty yang sesuai selera dan kebutuhanmu.' },
  { category: 'Olahraga', ids: [90, 140, 146, 147, 151, 152, 153], specs: ['Untuk aktivitas', 'Perlengkapan olahraga', 'Pilihan sport'], copy: 'Bikin waktu bergerak jadi lebih seru. Pilih perlengkapan untuk latihan, bermain bersama teman, dan mengikuti aktivitas favoritmu.' },
  { category: 'Makanan', ids: [27, 29, 32, 34, 38], specs: ['Kebutuhan dapur', 'Pilihan harian', 'Untuk dinikmati'], copy: 'Lengkapi stok favorit di rumah. Pilihan untuk menemani sarapan, jeda di tengah hari, dan momen berkumpul bersama orang terdekat.' },
  { category: 'Hobi', ids: [109, 110, 111], specs: ['Untuk kreasi', 'Pendukung foto & video', 'Mudah dibawa'], copy: 'Ikuti rasa ingin tahu dan buat sesuatu yang baru. Pilihan perlengkapan untuk mengabadikan momen, bereksperimen, dan menikmati hobi kreatifmu.' },
];
const originalKeywords = {
  headphones: 'headphone headset audio musik suara', watch: 'jam tangan arloji', bag: 'tas wanita bahu', camera: 'kamera foto instan fotografi',
  sneakers: 'sepatu lari olahraga', perfume: 'parfum wangi aroma', lamp: 'lampu meja kamar', sunglasses: 'kacamata hitam', chair: 'kursi sofa duduk',
  coffee: 'kopi cangkir gelas', smartwatch: 'jam pintar tangan arloji', backpack: 'tas ransel punggung laptop',
};
const names = {
  13: 'Meja Samping African Cherry', 44: 'Bingkai Foto Family Tree', 45: 'Tanaman Dekorasi Rumah', 48: 'Spatula Bambu',
  51: 'Blender Dapur', 52: 'Wajan Carbon Steel', 53: 'Talenan Kayu', 59: 'Gelas Bening', 65: 'Kotak Makan Everyday',
  66: 'Microwave Oven', 71: 'Panci Stainless dengan Tutup Kaca', 73: 'Rak Bumbu Dapur', 83: 'Kemeja Kotak Biru & Hitam',
  85: 'Kemeja Plaid Pria', 86: 'Kemeja Lengan Pendek', 87: 'Kemeja Check Pria', 163: 'Summer Dress', 164: 'Gray Everyday Dress',
  172: 'Blue Everyday Handbag', 173: 'Heshe Leather Bag', 175: 'White Faux Leather Backpack', 176: 'Black Everyday Handbag',
  177: 'Black Evening Gown', 140: 'Bola Basket', 146: 'Shuttlecock Feather', 147: 'Bola Sepak', 151: 'Bola Tenis',
  152: 'Raket Tenis', 153: 'Bola Voli', 27: 'Madu dalam Jar', 29: 'Jus Buah', 32: 'Susu Harian', 34: 'Nescafe Coffee',
  38: 'Beras Pilihan', 109: 'Monopod Kamera', 110: 'Selfie Ring Light', 111: 'Selfie Stick Monopod',
};
const categoryKeywords = {
  laptops: 'laptop komputer notebook', smartphones: 'handphone hp ponsel smartphone',
  'mens-shirts': 'kemeja baju pakaian pria', tops: 'dress gaun baju pakaian wanita',
  'womens-bags': 'tas wanita', 'womens-dresses': 'gaun dress pakaian wanita',
  fragrances: 'parfum wangi aroma', 'skin-care': 'perawatan tubuh skincare',
  'mens-shoes': 'sepatu sneakers olahraga', furniture: 'furnitur perabot meja',
  'home-decoration': 'dekorasi rumah', 'kitchen-accessories': 'dapur',
};
const productKeywords = {
  99: 'speaker audio suara', 100: 'earphone audio musik', 102: 'charger pengisi daya nirkabel',
  103: 'speaker audio suara', 104: 'charger pengisi daya', 107: 'earphone audio musik',
  44: 'bingkai foto pajangan', 45: 'tanaman hias pajangan', 48: 'spatula masak',
  51: 'blender jus', 52: 'wajan masak', 53: 'talenan papan potong', 59: 'gelas minum',
  65: 'kotak bekal makan', 66: 'microwave oven masak', 71: 'panci masak', 73: 'rak bumbu',
  1: 'maskara rias kosmetik makeup', 2: 'riasan mata kosmetik makeup', 3: 'bedak kosmetik makeup',
  4: 'lipstik bibir kosmetik makeup', 5: 'kuteks cat kuku kosmetik makeup',
  118: 'sabun tangan', 119: 'sabun mandi', 120: 'losion lotion pelembap',
  140: 'bola basket', 146: 'kok bulutangkis badminton', 147: 'bola sepak',
  151: 'bola tenis', 152: 'raket tenis', 153: 'bola voli',
  27: 'madu', 29: 'jus minuman', 32: 'susu minuman', 34: 'kopi minuman', 38: 'beras',
  109: 'kamera foto video tripod monopod', 110: 'lampu foto video konten', 111: 'tongkat selfie foto video',
  175: 'ransel punggung backpack',
};
const categories = [
  { name: 'Elektronik', slug: 'elektronik', label: 'Elektronik', symbol: 'headphones', color: '#edf0e7', subtitle: 'Teman keseharian', description: 'Gadget dan perangkat untuk kerja, hiburan, dan semua yang ada di antaranya.' },
  { name: 'Fashion', slug: 'fashion', label: 'Fashion', symbol: 'bag', color: '#f8eee7', subtitle: 'Gaya versi kamu', description: 'Dari outfit harian sampai detail kecil yang bikin gayamu terasa personal.' },
  { name: 'Rumah', slug: 'rumah', label: 'Rumah & Living', symbol: 'plant', color: '#edf1e4', subtitle: 'Sudut paling nyaman', description: 'Lengkapi rumah dengan barang yang praktis, hangat, dan enak dilihat.' },
  { name: 'Kecantikan', slug: 'kecantikan', label: 'Kecantikan', symbol: 'bottle', color: '#f5edf0', subtitle: 'Rawat diri sendiri', description: 'Pilihan beauty dan perawatan untuk menemani ritual harianmu.' },
  { name: 'Olahraga', slug: 'olahraga', label: 'Olahraga', symbol: 'shoe', color: '#edf0f5', subtitle: 'Terus bergerak', description: 'Temukan perlengkapan untuk langkah aktif, latihan, dan permainan favoritmu.' },
  { name: 'Hobi', slug: 'hobi', label: 'Hobi & Kreatif', symbol: 'camera', color: '#f4efe3', subtitle: 'Ikuti rasa ingin tahu', description: 'Perlengkapan untuk bereksperimen, membuat konten, dan menyimpan cerita.' },
  { name: 'Makanan', slug: 'makanan', label: 'Makanan & Minuman', symbol: 'coffee', color: '#f3ebdf', subtitle: 'Isi ulang favoritmu', description: 'Kebutuhan dapur dan teman sarapan, untuk stok kecil yang bikin hari lebih baik.' },
];

const products = original.map((product, index) => ({
  ...product, image: `/assets/${product.image}.jpg`, images: [`/assets/${product.image}.jpg`], keywords: originalKeywords[product.id],
  stock: product.stock || 24 + index, location: ['Jakarta Selatan', 'Bandung', 'Surabaya'][index % 3],
  merchant: `${product.brand} Official`, created: 100 + index, demo: true,
}));
await mkdir('assets/products', { recursive: true });
await mkdir('data', { recursive: true });
let index = 0;
for (const group of groups) {
  for (const id of group.ids) {
    const item = source.find((product) => product.id === id);
    if (!item) throw new Error(`Missing product ${id}`);
    const slug = item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const images = [];
    for (let imageIndex = 0; imageIndex < Math.min(3, item.images.length); imageIndex++) {
      const asset = `/assets/products/${slug}-${imageIndex + 1}.webp`;
      try { await access(`.${asset}`); } catch {
        const response = await fetch(item.images[imageIndex], { signal: AbortSignal.timeout(30000) });
        if (!response.ok) throw new Error(`Image ${id}: HTTP ${response.status}`);
        await writeFile(`.${asset}`, Buffer.from(await response.arrayBuffer()));
      }
      images.push(asset);
    }
    const price = Math.ceil(item.price * 14000 / 1000) * 1000;
    const discount = Math.max(10, Math.round(item.discountPercentage));
    products.push({
      id: slug, name: names[id] || item.title, brand: item.brand || ['KALA GOODS', 'SEDARI', 'RUMAH RASA'][index % 3],
      category: group.category, price, oldPrice: Math.ceil(price / (1 - discount / 100) / 1000) * 1000,
      rating: Math.round(item.rating * 10) / 10, sold: 80 + ((id * 47) % 2340), stock: Math.max(5, item.stock),
      image: images[0], images, contain: true, badge: index % 5 === 0 ? 'NEW FIND' : index % 7 === 0 ? 'PILIHAN KALA' : '',
      specs: group.specs, description: group.copy, keywords: `${group.category.toLowerCase()} ${categoryKeywords[item.category] || ''} ${productKeywords[id] || ''} ${item.tags.join(' ')}`,
      location: ['Jakarta Selatan', 'Bandung', 'Surabaya', 'Tangerang'][index % 4], merchant: `${item.brand || 'KALA GOODS'} Store`,
      created: 120 + index, demo: true, source: { provider: 'DummyJSON', id: item.id },
    });
    index++;
    if (index % 10 === 0) console.log(`Prepared ${index} additional products`);
  }
}
await writeFile('data/products.js', `// Sample catalog. Prices and availability are illustrative.\nimport { enrichCatalog } from './comparison.js';\nimport { enrichProductKnowledge } from './product-knowledge.js';\nexport const categories = ${JSON.stringify(categories, null, 2)};\n\nconst baseProducts = ${JSON.stringify(products, null, 2)};\n\nexport const products = enrichProductKnowledge(enrichCatalog(baseProducts));\n`);
await writeFile('data/catalog-source.json', JSON.stringify({ provider: 'DummyJSON', url: 'https://dummyjson.com/docs/products', selectedIds: groups.flatMap((group) => group.ids), count: enrichCatalog(products).length, note: 'Sample prices in IDR; no live exchange rate or inventory.' }, null, 2));
await writeFile('data/catalog-source-products.json', JSON.stringify(source.filter((product) => groups.some((group) => group.ids.includes(product.id))), null, 2));
console.log(`Catalog ready: ${enrichCatalog(products).length} products, ${categories.length} categories.`);
