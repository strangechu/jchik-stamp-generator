/**
 * Server-side gallery store.
 * Images are saved as PNG files under /.gallery-data/images/
 * Metadata is persisted in /.gallery-data/meta.json (newest first)
 */

import fs from "fs";
import path from "path";

const GALLERY_DIR = path.join(process.cwd(), ".gallery-data");
const IMAGES_DIR = path.join(GALLERY_DIR, "images");
const META_FILE = path.join(GALLERY_DIR, "meta.json");

export const PAGE_SIZE = 10;

export interface GalleryItem {
  id: string;
  scenario: string;
  imageFile: string; // filename only, e.g. "1234567890.png"
  createdAt: string;
}

function ensureDirs() {
  if (!fs.existsSync(GALLERY_DIR)) fs.mkdirSync(GALLERY_DIR, { recursive: true });
  if (!fs.existsSync(IMAGES_DIR)) fs.mkdirSync(IMAGES_DIR, { recursive: true });
}

function loadMeta(): GalleryItem[] {
  ensureDirs();
  try {
    const raw = fs.readFileSync(META_FILE, "utf-8");
    return JSON.parse(raw) as GalleryItem[];
  } catch {
    return [];
  }
}

function saveMeta(items: GalleryItem[]) {
  ensureDirs();
  fs.writeFileSync(META_FILE, JSON.stringify(items, null, 2));
}

/** Save a new image to disk and prepend its metadata. */
export function addGalleryItem(
  scenario: string,
  imageBase64: string,
  mimeType: string
): GalleryItem {
  ensureDirs();

  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const ext = mimeType.includes("jpeg") ? "jpg" : "png";
  const imageFile = `${id}.${ext}`;
  const imagePath = path.join(IMAGES_DIR, imageFile);

  // Write image file
  fs.writeFileSync(imagePath, Buffer.from(imageBase64, "base64"));

  const item: GalleryItem = {
    id,
    scenario,
    imageFile,
    createdAt: new Date().toISOString(),
  };

  const meta = loadMeta();
  meta.unshift(item); // newest first
  saveMeta(meta);

  return item;
}

/** Return paginated metadata (1-based page index). */
export function getGalleryPage(page: number): {
  items: GalleryItem[];
  total: number;
  totalPages: number;
  page: number;
} {
  const all = loadMeta();
  const total = all.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const items = all.slice(start, start + PAGE_SIZE);
  return { items, total, totalPages, page: safePage };
}

/** Return the absolute file path for a given image filename. */
export function getImagePath(imageFile: string): string {
  return path.join(IMAGES_DIR, imageFile);
}
