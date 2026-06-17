/**
 * Shared helpers for the Bilder pipeline (copy/rename, WebP, S3).
 */

import {
  DeleteObjectsCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { createInterface } from "node:readline/promises";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { basename, dirname, extname, join } from "node:path";
import { stdin as input, stdout as output } from "node:process";
import sharp from "sharp";

export const ORG_PREFIXES = ["Stadt Freiburg", "ADFC"];

export const IMAGE_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
  ".bmp",
  ".tiff",
  ".tif",
  ".webp",
]);

const WEBP_MAX_BYTES = 1024 * 1024;
const WEBP_EFFORT = 6;
const WEBP_INITIAL_QUALITY = 72;
const WEBP_MIN_QUALITY = 55;
const WEBP_MAX_DIMENSION = 2400;
const WEBP_MIN_DIMENSION = 960;

function formatSize(bytes) {
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

/**
 * Convert an image to WebP, targeting <= 1 MB via lower quality, max effort,
 * and progressive downscaling when needed.
 */
export async function convertImageToWebp(srcPath, destPath) {
  const meta = await sharp(srcPath).metadata();
  const needsResize =
    (meta.width ?? 0) > WEBP_MAX_DIMENSION ||
    (meta.height ?? 0) > WEBP_MAX_DIMENSION;
  let dimensionLimit = needsResize ? WEBP_MAX_DIMENSION : null;
  const outputName = basename(destPath);

  while (true) {
    for (let quality = WEBP_INITIAL_QUALITY; quality >= WEBP_MIN_QUALITY; quality -= 5) {
      let pipeline = sharp(srcPath).rotate();
      if (dimensionLimit) {
        pipeline = pipeline.resize({
          width: dimensionLimit,
          height: dimensionLimit,
          fit: "inside",
          withoutEnlargement: true,
        });
      }
      const buffer = await pipeline
        .webp({ quality, effort: WEBP_EFFORT })
        .toBuffer();

      if (buffer.length <= WEBP_MAX_BYTES) {
        writeFileSync(destPath, buffer);
        const resizeNote = dimensionLimit ? `, max ${dimensionLimit}px` : "";
        console.log(
          `Converted: ${outputName} (${formatSize(buffer.length)}, quality ${quality}${resizeNote})`,
        );
        return;
      }
    }

    if (!dimensionLimit) {
      dimensionLimit = WEBP_MAX_DIMENSION;
    } else {
      dimensionLimit = Math.floor(dimensionLimit * 0.85);
    }

    if (dimensionLimit < WEBP_MIN_DIMENSION) {
      let pipeline = sharp(srcPath).rotate().resize({
        width: WEBP_MIN_DIMENSION,
        height: WEBP_MIN_DIMENSION,
        fit: "inside",
        withoutEnlargement: true,
      });
      const buffer = await pipeline
        .webp({ quality: WEBP_MIN_QUALITY, effort: WEBP_EFFORT })
        .toBuffer();
      writeFileSync(destPath, buffer);
      console.warn(
        `Warning: ${outputName} is ${formatSize(buffer.length)} after max compression (target < 1 MB)`,
      );
      return;
    }
  }
}

export function loadEnvFile(filePath) {
  if (!existsSync(filePath)) return;
  let text = readFileSync(filePath, "utf8");
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    if (!key) continue;
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) {
      process.env[key] = val;
    }
  }
}

export function parseFolderName(folderName) {
  const parsed = tryParseFolderName(folderName);
  if (!parsed) {
    throw new Error(
      `Folder "${folderName}" does not start with a known organization (${ORG_PREFIXES.join(", ")}).`,
    );
  }
  return parsed;
}

export function tryParseFolderName(folderName) {
  for (const org of ORG_PREFIXES) {
    if (folderName === org) {
      console.warn(
        `Skipping folder "${folderName}": no author name after organization.`,
      );
      return null;
    }
    if (folderName.startsWith(`${org} `)) {
      const authorName = folderName.slice(org.length + 1).trim();
      if (!authorName) {
        console.warn(
          `Skipping folder "${folderName}": no author name after organization.`,
        );
        return null;
      }
      return { authorOrganization: org, authorName, folderLabel: folderName };
    }
  }
  return {
    authorOrganization: "",
    authorName: folderName,
    folderLabel: folderName,
  };
}

export function ensureDir(dir) {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

export function listAuthorFolders(sourceDir) {
  if (!existsSync(sourceDir)) {
    throw new Error(`Source directory does not exist: ${sourceDir}`);
  }
  return readdirSync(sourceDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith("."))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b, "de"));
}

export function listImageFiles(dir) {
  return readdirSync(dir, { withFileTypes: true })
    .filter(
      (entry) =>
        entry.isFile() &&
        IMAGE_EXTENSIONS.has(extname(entry.name).toLowerCase()),
    )
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b, "de"));
}

function padIndex(index, total) {
  const width = total >= 100 ? 3 : 2;
  return String(index).padStart(width, "0");
}

/**
 * Copy each author folder to staging/renamed and rename images inside the copy.
 * Returns flat list of { renamedPath, authorOrganization, authorName, folderLabel, filename }.
 */
export function copyAndRenameFolders({
  sourceDir,
  renamedDir,
  dryRun,
  limit,
}) {
  ensureDir(renamedDir);
  const authorFolders = listAuthorFolders(sourceDir);
  const results = [];

  for (const folderName of authorFolders) {
    const parsed = tryParseFolderName(folderName);
    if (!parsed) continue;
    const { authorOrganization, authorName, folderLabel } = parsed;
    const srcFolder = join(sourceDir, folderName);
    const destFolder = join(renamedDir, folderLabel);

    if (!dryRun && existsSync(destFolder)) {
      rmSync(destFolder, { recursive: true, force: true });
    }
    if (!dryRun) {
      ensureDir(destFolder);
    }

    const images = listImageFiles(srcFolder);

    for (let i = 0; i < images.length; i++) {
      if (limit !== undefined && results.length >= limit) {
        return results;
      }

      const ext = extname(images[i]);
      const index = padIndex(i + 1, images.length);
      const filename = `${folderLabel} ${index}${ext}`;
      const destPath = join(destFolder, filename);

      if (dryRun) {
        console.log(`[dry-run] copy ${join(srcFolder, images[i])} -> ${destPath}`);
      } else {
        copyFileSync(join(srcFolder, images[i]), destPath);
        console.log(`Renamed copy: ${filename}`);
      }

      results.push({
        renamedPath: destPath,
        authorOrganization,
        authorName,
        folderLabel,
        filename,
      });
    }
  }

  return results;
}

/**
 * Copy renamed folders to staging/webp and convert images to WebP.
 */
export async function convertToWebpFolders({
  renamedDir,
  webpDir,
  dryRun,
  limit,
}) {
  ensureDir(webpDir);
  const authorFolders = listAuthorFolders(renamedDir);
  const results = [];

  for (const folderName of authorFolders) {
    const parsed = tryParseFolderName(folderName);
    if (!parsed) continue;
    const { authorOrganization, authorName, folderLabel } = parsed;
    const srcFolder = join(renamedDir, folderName);
    const destFolder = join(webpDir, folderLabel);

    if (!dryRun && existsSync(destFolder)) {
      rmSync(destFolder, { recursive: true, force: true });
    }
    if (!dryRun) {
      ensureDir(destFolder);
    }

    const images = listImageFiles(srcFolder);

    for (const imageName of images) {
      if (limit !== undefined && results.length >= limit) {
        return results;
      }

      const baseName = imageName.replace(/\.[^.]+$/, "");
      const webpFilename = `${baseName}.webp`;
      const srcPath = join(srcFolder, imageName);
      const destPath = join(destFolder, webpFilename);

      if (dryRun) {
        console.log(`[dry-run] convert ${srcPath} -> ${destPath}`);
      } else {
        await convertImageToWebp(srcPath, destPath);
      }

      results.push({
        webpPath: destPath,
        authorOrganization,
        authorName,
        folderLabel,
        filename: webpFilename,
      });
    }
  }

  return results;
}

export function collectWebpFiles(webpDir, limit) {
  const authorFolders = listAuthorFolders(webpDir);
  const results = [];

  for (const folderName of authorFolders) {
    const parsed = tryParseFolderName(folderName);
    if (!parsed) continue;
    const { authorOrganization, authorName } = parsed;
    const folderPath = join(webpDir, folderName);
    const images = listImageFiles(folderPath).filter((name) =>
      name.toLowerCase().endsWith(".webp"),
    );

    for (const filename of images) {
      if (limit !== undefined && results.length >= limit) {
        return results;
      }
      results.push({
        webpPath: join(folderPath, filename),
        authorOrganization,
        authorName,
        filename,
      });
    }
  }

  return results;
}

export async function promptCredentials() {
  const accessKeyId = process.env.S3_ACCESS_KEY_ID?.trim();
  const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY?.trim();
  if (accessKeyId && secretAccessKey) {
    return { accessKeyId, secretAccessKey };
  }

  const rl = createInterface({ input, output });
  try {
    const promptedAccessKey =
      accessKeyId ||
      (await rl.question("S3 Access Key ID: ")).trim();
    const promptedSecret =
      secretAccessKey ||
      (await rl.question("S3 Secret Access Key: ")).trim();
    if (!promptedAccessKey || !promptedSecret) {
      throw new Error("S3 credentials are required.");
    }
    return {
      accessKeyId: promptedAccessKey,
      secretAccessKey: promptedSecret,
    };
  } finally {
    rl.close();
  }
}

export function createS3Client({ endpoint, credentials }) {
  const endpointUrl = endpoint.replace(/\/$/, "");
  return new S3Client({
    endpoint: endpointUrl,
    region: "nbg1",
    credentials,
    forcePathStyle: false,
  });
}

export function buildPublicUrl({ bucket, endpoint, key }) {
  const host = endpoint.replace(/^https?:\/\//, "").replace(/\/$/, "");
  return `https://${bucket}.${host}/${key}`;
}

/** S3 user metadata values must be US-ASCII; encode UTF-8 names for headers. */
export function encodeS3MetadataValue(value) {
  if (/^[\x20-\x7E]*$/.test(value)) return value;
  return `utf8:${encodeURIComponent(value)}`;
}

export async function uploadImages({
  s3,
  bucket,
  endpoint,
  prefix,
  webpDir,
  dryRun,
  limit,
  manifestPath,
}) {
  const files = collectWebpFiles(webpDir, limit);
  const manifest = [];

  for (const file of files) {
    const key = `${prefix}${file.filename}`;
    const url = buildPublicUrl({ bucket, endpoint, key });

    if (dryRun) {
      console.log(`[dry-run] upload ${file.webpPath} -> s3://${bucket}/${key}`);
    } else {
      const body = readFileSync(file.webpPath);
      const metadata = { authorName: encodeS3MetadataValue(file.authorName) };
      if (file.authorOrganization) {
        metadata.authorOrganization = encodeS3MetadataValue(
          file.authorOrganization,
        );
      }
      await s3.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          Body: body,
          ContentType: "image/webp",
          Metadata: metadata,
        }),
      );
      console.log(`Uploaded: ${key}`);
    }

    const entry = {
      url,
      authorName: file.authorName,
      filename: file.filename,
    };
    if (file.authorOrganization) {
      entry.authorOrganization = file.authorOrganization;
    }
    manifest.push(entry);
  }

  manifest.sort((a, b) => {
    const org = (a.authorOrganization ?? "").localeCompare(
      b.authorOrganization ?? "",
      "de",
    );
    if (org !== 0) return org;
    const name = a.authorName.localeCompare(b.authorName, "de");
    if (name !== 0) return name;
    return a.filename.localeCompare(b.filename, "de");
  });

  const manifestKey = `${prefix}manifest.json`;
  const manifestJson = JSON.stringify(manifest, null, 2);

  if (dryRun) {
    console.log(
      `[dry-run] upload manifest (${manifest.length} entries) -> s3://${bucket}/${manifestKey}`,
    );
    console.log(`[dry-run] write local manifest -> ${manifestPath}`);
  } else {
    await s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: manifestKey,
        Body: manifestJson,
        ContentType: "application/json",
        CacheControl: "no-cache",
      }),
    );
    ensureDir(dirname(manifestPath));
    writeFileSync(manifestPath, manifestJson, "utf8");
    console.log(
      `Uploaded manifest: ${manifestKey} (${manifest.length} image(s))`,
    );
    console.log(`Wrote local manifest: ${manifestPath}`);
  }

  return manifest;
}

export async function confirmAction(message) {
  const rl = createInterface({ input, output });
  try {
    const answer = (await rl.question(`${message} Type "yes" to continue: `))
      .trim()
      .toLowerCase();
    return answer === "yes";
  } finally {
    rl.close();
  }
}

export async function cleanBucket({
  s3,
  bucket,
  prefix,
  deleteAll,
  dryRun,
  skipConfirm,
}) {
  const effectivePrefix = deleteAll ? "" : prefix;
  const keys = [];
  let continuationToken;

  do {
    const response = await s3.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: effectivePrefix || undefined,
        ContinuationToken: continuationToken,
      }),
    );
    for (const item of response.Contents ?? []) {
      if (item.Key) keys.push(item.Key);
    }
    continuationToken = response.IsTruncated
      ? response.NextContinuationToken
      : undefined;
  } while (continuationToken);

  if (keys.length === 0) {
    console.log("Bucket is already empty for the selected scope.");
    return;
  }

  const scopeLabel = deleteAll
    ? `entire bucket "${bucket}"`
    : `prefix "${effectivePrefix}" in bucket "${bucket}"`;
  console.log(`Found ${keys.length} object(s) to delete in ${scopeLabel}.`);

  if (!skipConfirm && !dryRun) {
    const confirmed = await confirmAction(
      `This will permanently delete ${keys.length} object(s).`,
    );
    if (!confirmed) {
      console.log("Aborted.");
      return;
    }
  }

  if (dryRun) {
    for (const key of keys) {
      console.log(`[dry-run] delete s3://${bucket}/${key}`);
    }
    return;
  }

  for (let i = 0; i < keys.length; i += 1000) {
    const batch = keys.slice(i, i + 1000);
    await s3.send(
      new DeleteObjectsCommand({
        Bucket: bucket,
        Delete: {
          Objects: batch.map((Key) => ({ Key })),
          Quiet: true,
        },
      }),
    );
  }

  console.log(`Deleted ${keys.length} object(s).`);
}
