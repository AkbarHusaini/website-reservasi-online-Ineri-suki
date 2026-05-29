import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const DIRS = ['./public/images', './public/gambar'];

async function compressImage(filePath) {
  const dir = path.dirname(filePath);
  const ext = path.extname(filePath).toLowerCase();
  const filename = path.basename(filePath, ext);
  const newFilePath = path.join(dir, `${filename}.webp`);

  if (!fs.existsSync(filePath)) return;

  const originalSize = fs.statSync(filePath).size;
  console.log(`\nProcessing ${filename}${ext} (Original size: ${(originalSize / 1024).toFixed(2)} KB)...`);

  try {
    let pipeline = sharp(filePath);
    
    const metadata = await pipeline.metadata();
    if (metadata.width > 1200) {
      pipeline = pipeline.resize({ width: 1200, withoutEnlargement: true });
    }

    await pipeline
      .webp({ quality: 80, effort: 6 })
      .toFile(newFilePath);

    if (filePath !== newFilePath) {
      fs.unlinkSync(filePath);
    }

    const newSize = fs.statSync(newFilePath).size;
    const savings = ((originalSize - newSize) / originalSize * 100).toFixed(2);
    console.log(`Success! New size: ${(newSize / 1024).toFixed(2)} KB (Saved ${savings}%)`);
  } catch (err) {
    console.error(`Error compressing ${filename}${ext}:`, err);
  }
}

async function run() {
  console.log('Starting image compression to WebP...');

  for (const dir of DIRS) {
    if (!fs.existsSync(dir)) continue;
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const ext = path.extname(file).toLowerCase();
      if (['.png', '.jpg', '.jpeg'].includes(ext)) {
        await compressImage(path.join(dir, file));
      }
    }
  }

  console.log('\nAll compressions finished.');
}

run();
