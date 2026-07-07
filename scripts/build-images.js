/*
 * Optimise les photos du couple pour un chargement rapide (mobile 3G/4G au Cameroun).
 * - Redimensionne, recompresse et exporte des JPEG legers dans public/assets/images.
 * - Utilise "sharp" si disponible ; sinon copie simplement les fichiers d'origine.
 *
 * Lancement : npm run images
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'images');
const OUT = path.join(ROOT, 'public', 'assets', 'images');

// Correspondance fichier source -> role dans le site.
// (Modifiable : changez simplement le nom du fichier source a gauche.)
const MAP = [
  { src: 'ce905d6f-ddf8-497d-a349-b1bc086e3e3e.jpeg', out: 'poster',    role: 'hero',    trim: false },
  { src: 'da4bcb6b-4752-4bf5-9328-b7d2a37c3b26.jpeg', out: 'story-1',   role: 'story',   crop: { left: 0, top: 430, width: 900, height: 1125 } },
  { src: '0c0b36c1-68e1-4ee3-bd7e-9abcef77c875.jpeg', out: 'story-2',   role: 'story',   crop: { left: 0, top: 560, width: 736, height: 610 } },
  { src: 'da4bcb6b-4752-4bf5-9328-b7d2a37c3b26.jpeg', out: 'gallery-1', role: 'gallery', trim: false },
  { src: '1c9152f5-2c58-495c-a476-7afb233d7eb4.jpeg', out: 'gallery-2', role: 'gallery', trim: false },
  { src: '5f6bcb73-60bd-48f4-bd1e-2b67c53ea633.jpeg', out: 'gallery-3', role: 'gallery', trim: false },
  { src: '2c0b7dc9-4840-40e5-984a-f82f22571483.jpeg', out: 'gallery-4', role: 'gallery', trim: false },
  { src: 'ce7acf15-506f-4fbe-9f4e-2a14f5ddf377.jpeg', out: 'gallery-5', role: 'gallery', trim: false },
  { src: 'ce905d6f-ddf8-497d-a349-b1bc086e3e3e.jpeg', out: 'gallery-6', role: 'gallery', trim: false },
  { src: '0c0b36c1-68e1-4ee3-bd7e-9abcef77c875.jpeg', out: 'gallery-7', role: 'gallery', crop: { left: 0, top: 560, width: 736, height: 610 } },
];

const SIZES = {
  hero:    { width: 1500, quality: 74 },
  story:   { width: 1000, quality: 74 },
  gallery: { width: 1080, quality: 74 },
};

fs.mkdirSync(OUT, { recursive: true });

let sharp = null;
try { sharp = require('sharp'); } catch (_) { sharp = null; }

async function run() {
  if (!sharp) {
    console.log('[images] sharp indisponible -> copie des fichiers d\'origine (non optimises).');
    for (const m of MAP) {
      const from = path.join(SRC, m.src);
      const to = path.join(OUT, m.out + '.jpg');
      if (fs.existsSync(from)) fs.copyFileSync(from, to);
      else console.warn('[images] introuvable :', m.src);
    }
    console.log('[images] Termine (copie simple).');
    return;
  }

  for (const m of MAP) {
    const from = path.join(SRC, m.src);
    if (!fs.existsSync(from)) { console.warn('[images] introuvable :', m.src); continue; }
    const cfg = SIZES[m.role];
    let img = sharp(from).rotate(); // respecte l'orientation EXIF
    if (m.crop) img = img.extract(m.crop); // recadrage manuel (retire les bandes de la capture video)
    else if (m.trim) img = img.trim({ threshold: 20 }); // retire les bandes noires uniformes
    const to = path.join(OUT, m.out + '.jpg');
    await img
      .resize({ width: cfg.width, withoutEnlargement: true })
      .jpeg({ quality: cfg.quality, mozjpeg: true, progressive: true })
      .toFile(to);
    const kb = Math.round(fs.statSync(to).size / 1024);
    console.log('[images] ' + m.out + '.jpg  (' + kb + ' Ko)');
  }
  console.log('[images] Termine (optimise avec sharp).');
}

run().catch(function (e) { console.error(e); process.exit(1); });
