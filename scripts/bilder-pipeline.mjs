/**
 * Bilder pipeline: copy/rename source images, convert to WebP, upload to S3.
 *
 * Prerequisites (one-time on the bucket):
 * - Allow public GetObject for uploaded images and manifest.json.
 * - Add a CORS rule allowing GET from your site origin (e.g. https://roll-mit.de,
 *   http://localhost:3000) so the Angular app can fetch manifest.json.
 *
 * Source folders are named "<Org> <Name>" (e.g. "ADFC Andreas Prinz") or just
 * "<Name>" when no organization applies (e.g. "Toni"). Unknown org-only folders
 * without an author name are skipped with a warning.
 * Originals in the source directory are never modified; all work happens in staging.
 *
 * Test workflow:
 *   1. npm run bilder:test          # process 5 images and upload (prompts for S3 keys)
 *   2. npm run dev                  # open http://localhost:3000/bilder
 *   3. npm run bilder:clean         # remove test uploads (confirms with "yes")
 *   4. npm run bilder:process       # full upload
 *
 * Usage:
 *   node scripts/bilder-pipeline.mjs              # full pipeline
 *   node scripts/bilder-pipeline.mjs --limit 5    # test with 5 images
 *   node scripts/bilder-pipeline.mjs --clean      # delete objects under bilder/
 *   node scripts/bilder-pipeline.mjs --clean --all  # delete entire bucket contents
 *   node scripts/bilder-pipeline.mjs --dry-run    # preview without writing
 *   node scripts/bilder-pipeline.mjs --skip-upload  # rename + webp only
 */

import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import process from "node:process";
import {
  cleanBucket,
  convertToWebpFolders,
  copyAndRenameFolders,
  createS3Client,
  loadEnvFile,
  promptCredentials,
  uploadImages,
} from "./lib/bilder-utils.mjs";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
loadEnvFile(join(repoRoot, ".env"));

function parseArgs(argv) {
  const options = {
    sourceDir:
      process.env.BILDER_SOURCE_DIR?.trim() ||
      "/Users/jenoe/Documents/Roll mit/Bilder",
    stagingDir:
      process.env.BILDER_STAGING_DIR?.trim() ||
      "/Users/jenoe/Documents/Roll mit/Bilder-staging",
    endpoint:
      process.env.S3_ENDPOINT?.trim() ||
      "https://nbg1.your-objectstorage.com",
    bucket: process.env.S3_BUCKET?.trim() || "roll-mit-2026",
    prefix: process.env.S3_PREFIX?.trim() || "bilder/",
    manifestPath: join(repoRoot, "public", "bilder-manifest.json"),
    limit: undefined,
    dryRun: false,
    skipRename: false,
    skipWebp: false,
    skipUpload: false,
    clean: false,
    deleteAll: false,
    yes: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    switch (arg) {
      case "--source":
        options.sourceDir = argv[++i];
        break;
      case "--staging":
        options.stagingDir = argv[++i];
        break;
      case "--limit":
        options.limit = Number(argv[++i]);
        if (!Number.isFinite(options.limit) || options.limit < 1) {
          throw new Error("--limit requires a positive number.");
        }
        break;
      case "--dry-run":
        options.dryRun = true;
        break;
      case "--skip-rename":
        options.skipRename = true;
        break;
      case "--skip-webp":
        options.skipWebp = true;
        break;
      case "--skip-upload":
        options.skipUpload = true;
        break;
      case "--clean":
        options.clean = true;
        break;
      case "--all":
        options.deleteAll = true;
        break;
      case "--yes":
        options.yes = true;
        break;
      default:
        throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (!options.prefix.endsWith("/")) {
    options.prefix += "/";
  }

  return options;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const renamedDir = join(options.stagingDir, "renamed");
  const webpDir = join(options.stagingDir, "webp");

  if (options.clean) {
    const credentials = await promptCredentials();
    const s3 = createS3Client({
      endpoint: options.endpoint,
      credentials,
    });
    await cleanBucket({
      s3,
      bucket: options.bucket,
      prefix: options.prefix,
      deleteAll: options.deleteAll,
      dryRun: options.dryRun,
      skipConfirm: options.yes,
    });
    return;
  }

  console.log(`Source:  ${options.sourceDir}`);
  console.log(`Staging: ${options.stagingDir}`);
  if (options.limit) {
    console.log(`Limit:   ${options.limit} image(s)`);
  }
  if (options.dryRun) {
    console.log("Dry run: no files written, no uploads.");
  }

  if (!options.skipRename) {
    console.log("\n--- Step 1: Copy and rename ---");
    const renamed = copyAndRenameFolders({
      sourceDir: options.sourceDir,
      renamedDir,
      dryRun: options.dryRun,
      limit: options.limit,
    });
    console.log(`Prepared ${renamed.length} renamed image(s).`);
  }

  if (!options.skipWebp) {
    console.log("\n--- Step 2: Convert to WebP ---");
    const webp = await convertToWebpFolders({
      renamedDir,
      webpDir,
      dryRun: options.dryRun,
      limit: options.limit,
    });
    console.log(`Prepared ${webp.length} WebP image(s).`);
  }

  if (!options.skipUpload) {
    console.log("\n--- Step 3: Upload to S3 ---");
    const credentials = await promptCredentials();
    const s3 = createS3Client({
      endpoint: options.endpoint,
      credentials,
    });
    const manifest = await uploadImages({
      s3,
      bucket: options.bucket,
      endpoint: options.endpoint,
      prefix: options.prefix,
      webpDir,
      dryRun: options.dryRun,
      limit: options.limit,
      manifestPath: options.manifestPath,
    });
    console.log(`Upload complete. ${manifest.length} image(s) in manifest.`);
  }

  console.log("\nDone.");
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
