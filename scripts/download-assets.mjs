import { mkdir, writeFile } from 'node:fs/promises';

const photos = {
  headphones: ['1505740420928-5e560c06d30e', 650],
  watch: ['1523275335684-37898b6baf30', 650],
  bag: ['1548036328-c9fa89d128fa', 650],
  camera: ['1526170375885-4d8ecf77b99f', 650],
  sneakers: ['1542291026-7eec264c27ff', 650],
  perfume: ['1541643600914-78b084683601', 650],
  lamp: ['1507473885765-e6ed057f782c', 650],
  sunglasses: ['1511499767150-a48a237f0083', 650],
  chair: ['1598300042247-d088f8ab3a91', 650],
  coffee: ['1514432324607-a09d9b4aefdd', 650],
  smartwatch: ['1546868871-7041f2a55e12', 650],
  backpack: ['1553062407-98eeb64c6a62', 650],
  'hero-room': ['1490312278390-ab64016e0aa9', 900],
  'promo-home': ['1616486338812-3dadae4b4ace', 650],
  'editorial-style': ['1490481651871-ab68de25d43d', 1000],
};

await mkdir('assets/fonts', { recursive: true });
for (const [name, [photo, width]] of Object.entries(photos)) {
  const response = await fetch(`https://images.unsplash.com/photo-${photo}?w=${width}&q=80&fit=crop`, { signal: AbortSignal.timeout(30000) });
  if (!response.ok) throw new Error(`${name}: HTTP ${response.status}`);
  await writeFile(`assets/${name}.jpg`, Buffer.from(await response.arrayBuffer()));
  console.log(`Saved ${name}.jpg`);
}

const response = await fetch('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap', {
  headers: { 'User-Agent': 'Mozilla/5.0 Chrome/120.0.0.0 Safari/537.36' },
  signal: AbortSignal.timeout(30000),
});
if (!response.ok) throw new Error(`Font CSS: HTTP ${response.status}`);
let css = await response.text();
const urls = [...new Set([...css.matchAll(/url\((https:[^)]+)\)/g)].map((match) => match[1]))];
for (let index = 0; index < urls.length; index++) {
  const fontResponse = await fetch(urls[index], { signal: AbortSignal.timeout(30000) });
  if (!fontResponse.ok) throw new Error(`Font ${index}: HTTP ${fontResponse.status}`);
  const extension = new URL(urls[index]).pathname.split('.').pop();
  const path = `font-${index}.${extension}`;
  await writeFile(`assets/fonts/${path}`, Buffer.from(await fontResponse.arrayBuffer()));
  css = css.replaceAll(urls[index], `./${path}`);
}
await writeFile('assets/fonts/fonts.css', css);
console.log(`Saved ${urls.length} local font files.`);
