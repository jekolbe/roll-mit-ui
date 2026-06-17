import sharp from "sharp";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INPUT_DIR = path.join(__dirname, "..", "public", "in");
const OUTPUT_DIR = path.join(__dirname, "..", "public", "assets");

const IMAGE_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
  ".bmp",
  ".tiff",
  ".tif",
  ".webp",
]);

async function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

async function convertToWebp() {
  await ensureDir(OUTPUT_DIR);

  if (!fs.existsSync(INPUT_DIR)) {
    console.log("Input folder public/in does not exist. Nothing to do.");
    return;
  }

  const entries = fs.readdirSync(INPUT_DIR, { withFileTypes: true });
  const imageFiles = entries.filter(
    (e) =>
      e.isFile() && IMAGE_EXTENSIONS.has(path.extname(e.name).toLowerCase()),
  );

  if (imageFiles.length === 0) {
    console.log("No image files found in public/in.");
    return;
  }

  const converted = [];
  const errors = [];

  for (const file of imageFiles) {
    const inputPath = path.join(INPUT_DIR, file.name);
    const baseName = path.basename(file.name, path.extname(file.name));
    const outputPath = path.join(OUTPUT_DIR, `${baseName}.webp`);

    try {
      await sharp(inputPath)
        // Apply EXIF orientation before writing, so portrait photos stay portrait.
        .rotate()
        .webp({ quality: 85 })
        .toFile(outputPath);
      converted.push({ inputPath, outputPath, name: file.name });
      console.log(`Converted: ${file.name} -> assets/${baseName}.webp`);
    } catch (err) {
      errors.push({ file: file.name, error: err.message });
      console.error(`Error converting ${file.name}:`, err.message);
    }
  }

  if (errors.length > 0) {
    console.error("\nSome conversions failed. Not deleting source images.");
    process.exit(1);
  }

  for (const { inputPath } of converted) {
    fs.unlinkSync(inputPath);
    console.log(`Deleted: ${path.basename(inputPath)}`);
  }

  console.log(
    `\nDone. Converted ${converted.length} image(s) to WebP in public/assets.`,
  );
}

convertToWebp().catch((err) => {
  console.error(err);
  process.exit(1);
});
