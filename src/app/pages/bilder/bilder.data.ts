export interface BilderManifestEntry {
  url: string;
  authorName: string;
  authorOrganization?: string;
  filename: string;
}

export const BILDER_MANIFEST_URL =
  'https://roll-mit-2026.nbg1.your-objectstorage.com/bilder/manifest.json';

export const BILDER_MANIFEST_FALLBACK_URL = '/bilder-manifest.json';
