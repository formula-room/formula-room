// Optimises a Grand Prix photograph for the homepage hero.
//
//   node scripts/optimize-grand-prix-image.mjs "<photo.jpg>" <circuitId> [season]
//
// Writes public/images/grand-prix/<circuitId>.webp (or <season>-<circuitId>.webp),
// at most 2880 px wide, high-quality WebP, colour profile kept. Next.js then serves
// smaller sizes per device automatically. Add the printed line to
// lib/data/grand-prix-hero-images.ts.
import path from "node:path";
import fs from "node:fs";
import sharp from "sharp";

const [input, circuitId, season] = process.argv.slice(2);
if (!input || !circuitId) {
  console.error('Usage: node scripts/optimize-grand-prix-image.mjs "<photo>" <circuitId> [season]');
  process.exit(1);
}

const name = season ? `${season}-${circuitId}` : circuitId;
const outDir = path.join(process.cwd(), "public", "images", "grand-prix");
const output = path.join(outDir, `${name}.webp`);
fs.mkdirSync(outDir, { recursive: true });

const meta = await sharp(input).metadata();
if ((meta.width ?? 0) < 1920) {
  console.warn(`Warning: the photo is only ${meta.width}px wide; 2560px or more looks best on large screens.`);
}

await sharp(input)
  .rotate()
  .resize({ width: 2880, withoutEnlargement: true })
  .webp({ quality: 84, smartSubsample: true })
  .withMetadata()
  .toFile(output);

const out = await sharp(output).metadata();
console.log(`Saved ${path.relative(process.cwd(), output)} (${out.width}x${out.height}, ${Math.round(fs.statSync(output).size / 1024)} KB)`);
console.log("Add this line to GRAND_PRIX_HERO_IMAGES in lib/data/grand-prix-hero-images.ts:");
const key = season ? `"${season}:${circuitId}"` : /^[a-z_][a-z0-9_]*$/.test(circuitId) ? circuitId : `"${circuitId}"`;
console.log(`  ${key}: { src: "/images/grand-prix/${name}.webp", alt: "Describe the photo", tone: "bright" },`);
