// Fictional product profiles for the comparison demo, not manufacturer specifications.
export const comparisonGroups = [
  { id: 'headphone-wireless', label: 'Headphone wireless', symbol: 'headphones', category: 'Elektronik', segment: 'Over-ear · Rp350–550 ribu', description: 'Untuk musik, kerja, dan perjalanan. Pilih antara baterai, ANC, dan harga.', fields: [
    { key: 'connection', label: 'Koneksi' }, { key: 'driverMm', label: 'Ukuran driver', unit: 'mm' },
    { key: 'batteryHours', label: 'Baterai hingga', unit: 'jam' }, { key: 'anc', label: 'Active noise cancelling', type: 'boolean' },
    { key: 'multipoint', label: 'Dua perangkat sekaligus', type: 'boolean' }, { key: 'weightG', label: 'Berat', unit: 'g' },
    { key: 'wired', label: 'Mode kabel audio', type: 'boolean' }, { key: 'warrantyMonths', label: 'Garansi contoh', unit: 'bulan' },
  ] },
  { id: 'smartwatch-harian', label: 'Smartwatch harian', symbol: 'user', category: 'Elektronik', segment: 'Aktivitas harian · Rp450–700 ribu', description: 'Lihat perbedaan layar, baterai, GPS, dan fitur panggilan.', fields: [
    { key: 'screenType', label: 'Jenis layar' }, { key: 'screenInches', label: 'Ukuran layar', unit: 'inci' },
    { key: 'batteryDays', label: 'Baterai hingga', unit: 'hari' }, { key: 'gps', label: 'GPS bawaan', type: 'boolean' },
    { key: 'calls', label: 'Panggilan Bluetooth', type: 'boolean' }, { key: 'waterResistance', label: 'Ketahanan air' },
    { key: 'weightG', label: 'Berat tanpa tali', unit: 'g' }, { key: 'warrantyMonths', label: 'Garansi contoh', unit: 'bulan' },
  ] },
  { id: 'blender-dapur', label: 'Blender dapur', symbol: 'plant', category: 'Rumah', segment: 'Blender meja · Rp400–700 ribu', description: 'Sesuaikan kapasitas, daya listrik, dan material jar dengan dapurmu.', fields: [
    { key: 'capacityL', label: 'Kapasitas jar', unit: 'liter' }, { key: 'powerW', label: 'Daya listrik', unit: 'watt' },
    { key: 'jarMaterial', label: 'Material jar' }, { key: 'speeds', label: 'Pilihan kecepatan' },
    { key: 'pulse', label: 'Mode pulse', type: 'boolean' }, { key: 'grinder', label: 'Gelas penggiling', type: 'boolean' },
    { key: 'weightKg', label: 'Berat', unit: 'kg' }, { key: 'warrantyMonths', label: 'Garansi contoh', unit: 'bulan' },
  ] },
  { id: 'sepatu-lari', label: 'Sepatu lari harian', symbol: 'shoe', category: 'Olahraga', segment: 'Jalan & lari santai · Rp300–450 ribu', description: 'Bandingkan bobot, bantalan, material, dan pilihan ukuran.', fields: [
    { key: 'upper', label: 'Material upper' }, { key: 'midsole', label: 'Bantalan midsole' },
    { key: 'outsole', label: 'Material outsole' }, { key: 'weightG', label: 'Berat per sepatu', unit: 'g' },
    { key: 'dropMm', label: 'Heel drop', unit: 'mm' }, { key: 'sizes', label: 'Rentang ukuran' },
    { key: 'reflective', label: 'Detail reflektif', type: 'boolean' }, { key: 'fit', label: 'Bentuk fit' },
  ] },
];

const profile = (group, positioning, useCase, attributes, strengths, tradeoffs) => ({ group, positioning, useCase, attributes, strengths, tradeoffs, source: { type: 'demo', note: 'Spesifikasi dan kelebihan merupakan skenario ilustrasi, bukan hasil pengujian.' } });
export const comparisonProfiles = {
  headphones: profile('headphone-wireless', 'Seimbang buat sehari-hari', 'Kerja dari rumah & musik',
    { connection: 'Bluetooth 5.3', driverMm: 40, batteryHours: 30, anc: false, multipoint: true, weightG: 220, wired: true, warrantyMonths: 12 },
    ['Bisa terhubung ke laptop dan HP sekaligus', 'Tetap bisa dipakai lewat kabel audio'], ['Belum punya ANC untuk meredam suara sekitar']),
  'audia-focus-one': profile('headphone-wireless', 'Fokus di perjalanan', 'Komuter & ruang ramai',
    { connection: 'Bluetooth 5.3', driverMm: 40, batteryHours: 40, anc: true, multipoint: true, weightG: 265, wired: true, warrantyMonths: 12 },
    ['ANC tersedia untuk meredam suara sekitar', 'Baterai paling lama dalam kelompok demo ini'], ['Harga dan bobot lebih tinggi dibanding dua alternatif']),
  'ritme-lite': profile('headphone-wireless', 'Ringan di budget', 'Musik & pemakaian santai',
    { connection: 'Bluetooth 5.3', driverMm: 40, batteryHours: 24, anc: false, multipoint: false, weightG: 185, wired: false, warrantyMonths: 6 },
    ['Harga paling rendah dalam kelompok demo ini', 'Bobot paling ringan dari tiga pilihan'], ['Tidak ada ANC, multipoint, atau mode kabel']),
  smartwatch: profile('smartwatch-harian', 'Teman rutinitas aktif', 'Notifikasi & aktivitas harian',
    { screenType: 'IPS', screenInches: 1.69, batteryDays: 7, gps: false, calls: true, waterResistance: 'IP68', weightG: 31, warrantyMonths: 12 },
    ['Bisa menerima panggilan Bluetooth', 'Baterai contoh hingga tujuh hari'], ['GPS membutuhkan koneksi ke HP']),
  'fitra-pulse': profile('smartwatch-harian', 'Layar & tracking lebih lengkap', 'Aktivitas luar ruang',
    { screenType: 'AMOLED', screenInches: 1.78, batteryDays: 5, gps: true, calls: true, waterResistance: '5 ATM', weightG: 35, warrantyMonths: 12 },
    ['GPS bawaan tanpa mengandalkan GPS HP', 'Layar AMOLED tersedia'], ['Baterai lebih singkat dan harga lebih tinggi']),
  'nadi-endure': profile('smartwatch-harian', 'Jarang isi ulang', 'Tracking sederhana & baterai',
    { screenType: 'IPS', screenInches: 1.83, batteryDays: 10, gps: false, calls: false, waterResistance: 'IP68', weightG: 28, warrantyMonths: 6 },
    ['Baterai paling lama dalam kelompok demo ini', 'Harga lebih rendah dan layar lebih besar'], ['Tidak ada GPS bawaan atau panggilan Bluetooth']),
  'boxed-blender': profile('blender-dapur', 'Ukuran pas buat harian', 'Jus & bumbu dapur',
    { capacityL: 1.5, powerW: 350, jarMaterial: 'Plastik bebas BPA', speeds: 2, pulse: true, grinder: true, weightKg: 1.8, warrantyMonths: 12 },
    ['Ada gelas penggiling untuk bumbu', 'Kapasitas menengah dengan daya 350 watt'], ['Pilihan kecepatan lebih sedikit dari Dapur Rasa Mix']),
  'dapur-rasa-mix': profile('blender-dapur', 'Porsi lebih besar', 'Persiapan minuman keluarga',
    { capacityL: 2, powerW: 500, jarMaterial: 'Kaca', speeds: 5, pulse: true, grinder: true, weightKg: 3.2, warrantyMonths: 24 },
    ['Jar dua liter dan lima pilihan kecepatan', 'Garansi contoh paling panjang dalam kelompok ini'], ['Daya, harga, dan bobot paling tinggi']),
  'sedari-blend-mini': profile('blender-dapur', 'Ringkas untuk dapur kecil', 'Porsi satu sampai dua orang',
    { capacityL: 1.2, powerW: 300, jarMaterial: 'Plastik bebas BPA', speeds: 2, pulse: true, grinder: false, weightKg: 1.3, warrantyMonths: 12 },
    ['Bobot ringan dan daya listrik lebih rendah', 'Harga paling rendah dalam kelompok demo ini'], ['Jar lebih kecil dan tanpa gelas penggiling']),
  sneakers: profile('sepatu-lari', 'Serba bisa tiap hari', 'Jalan & lari santai',
    { upper: 'Mesh breathable', midsole: 'EVA', outsole: 'Karet', weightG: 250, dropMm: 8, sizes: '36–44', reflective: false, fit: 'Regular' },
    ['Rentang ukuran mulai dari 36', 'Upper mesh untuk aktivitas harian'], ['Belum punya detail reflektif']),
  'pace-daily-run': profile('sepatu-lari', 'Ringan untuk bergerak', 'Lari santai & jalan sore',
    { upper: 'Engineered mesh', midsole: 'EVA ringan', outsole: 'Karet', weightG: 225, dropMm: 6, sizes: '38–45', reflective: true, fit: 'Regular' },
    ['Bobot paling ringan dalam kelompok demo ini', 'Ada detail reflektif'], ['Harga lebih tinggi dan ukuran dimulai dari 38']),
  'tapak-flex-run': profile('sepatu-lari', 'Fit lebih lega', 'Kaki lebar & jalan harian',
    { upper: 'Knit', midsole: 'EVA', outsole: 'Karet', weightG: 275, dropMm: 8, sizes: '37–44', reflective: false, fit: 'Wide' },
    ['Pilihan fit lebih lebar', 'Harga paling rendah dalam kelompok demo ini'], ['Bobot paling tinggi dan tidak ada detail reflektif']),
};

const additions = [
  { id: 'audia-focus-one', name: 'Focus One ANC Headphones', brand: 'AUDIA', category: 'Elektronik', price: 529000, oldPrice: 699000, rating: 4.7, sold: 420, description: 'Headphone over-ear dalam skenario demo untuk fokus saat perjalanan, dengan ANC, multipoint, dan baterai hingga 40 jam.', keywords: 'headphone headset audio wireless musik anc' },
  { id: 'ritme-lite', name: 'Lite Wireless Headphones', brand: 'RITME', category: 'Elektronik', price: 359000, oldPrice: 459000, rating: 4.5, sold: 580, description: 'Pilihan headphone demo dengan bobot ringan dan harga lebih terjangkau. Cocok untuk menjelajahi kompromi fitur dalam perbandingan.', keywords: 'headphone headset audio wireless musik' },
  { id: 'fitra-pulse', name: 'Pulse AMOLED Smartwatch', brand: 'FITRA', category: 'Elektronik', price: 699000, oldPrice: 849000, rating: 4.7, sold: 310, description: 'Smartwatch konsep dengan layar AMOLED, GPS bawaan, dan panggilan Bluetooth. Spesifikasi disiapkan untuk demo perbandingan.', keywords: 'jam pintar tangan arloji smartwatch gps' },
  { id: 'nadi-endure', name: 'Endure Everyday Smartwatch', brand: 'NADI', category: 'Elektronik', price: 459000, oldPrice: 599000, rating: 4.6, sold: 470, description: 'Smartwatch konsep yang memprioritaskan baterai panjang, layar besar, dan fitur aktivitas sederhana dengan harga lebih rendah.', keywords: 'jam pintar tangan arloji smartwatch baterai' },
  { id: 'dapur-rasa-mix', name: 'Mix Glass Blender 2L', brand: 'DAPUR RASA', category: 'Rumah', price: 699000, oldPrice: 849000, rating: 4.8, sold: 260, description: 'Blender konsep untuk porsi keluarga dengan jar kaca dua liter, lima kecepatan, dan gelas penggiling. Data untuk demo.', keywords: 'blender dapur jus masak kaca' },
  { id: 'sedari-blend-mini', name: 'Blend Mini Blender 1.2L', brand: 'SEDARI', category: 'Rumah', price: 429000, oldPrice: 549000, rating: 4.5, sold: 360, description: 'Blender konsep yang ringkas untuk porsi kecil, dengan konsumsi daya dan bobot lebih rendah. Data untuk demo.', keywords: 'blender dapur jus mini' },
  { id: 'pace-daily-run', name: 'Daily Run Mesh Sneakers', brand: 'PACE', category: 'Olahraga', price: 429000, oldPrice: 549000, rating: 4.8, sold: 620, description: 'Sepatu konsep untuk lari santai dengan upper mesh, bantalan ringan, dan detail reflektif. Ukuran dan bobot merupakan contoh.', keywords: 'sepatu lari olahraga sneakers running' },
  { id: 'tapak-flex-run', name: 'Flex Run Wide Sneakers', brand: 'TAPAK', category: 'Olahraga', price: 319000, oldPrice: 429000, rating: 4.6, sold: 540, description: 'Sepatu konsep dengan fit lebar dan upper knit, untuk mencoba perbandingan berdasarkan bentuk kaki dan budget.', keywords: 'sepatu lari olahraga sneakers running lebar' },
];

export function enrichCatalog(baseProducts) {
  const newProducts = additions.map((product, index) => ({ ...product, image: `/assets/competitors/${product.id}.svg`, images: [`/assets/competitors/${product.id}.svg`], contain: true, illustration: true, stock: 24, location: ['Jakarta Selatan', 'Bandung'][index % 2], merchant: `${product.brand} Demo Store`, created: 200 + index, demo: true, badge: 'PILIHAN SEJENIS', specs: [] }));
  return [...baseProducts, ...newProducts].map((product) => {
    const comparison = comparisonProfiles[product.id];
    if (!comparison) return product;
    const group = comparisonGroups.find((item) => item.id === comparison.group);
    const specs = group.fields.slice(0, 3).map((field) => `${field.label}: ${formatComparisonValue(comparison.attributes[field.key], field)}`);
    return { ...product, comparison, specs };
  });
}

export function formatComparisonValue(value, field = {}) {
  if (value === null || value === undefined) return 'Belum tersedia';
  if (field.type === 'boolean') return value ? 'Ada' : 'Tidak ada';
  const formatted = typeof value === 'number' ? new Intl.NumberFormat('id-ID', { maximumFractionDigits: 2 }).format(value) : String(value);
  return `${formatted}${field.unit ? ` ${field.unit}` : ''}`;
}
