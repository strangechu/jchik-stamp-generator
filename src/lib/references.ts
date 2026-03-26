import fs from "fs";
import path from "path";

const SUPPORTED_EXTENSIONS = [".png", ".jpg", ".jpeg", ".webp"];

const EXT_TO_MIME: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
};

export interface ReferenceImage {
  mimeType: string;
  base64: string;
  filename: string;
}

/**
 * 讀取 /public/references/ 中所有參考圖片，
 * 返回 base64 編碼的圖片資料（用於 Gemini API inline_data）。
 */
export function getReferenceImages(): ReferenceImage[] {
  const refDir = path.join(process.cwd(), "public", "references");

  if (!fs.existsSync(refDir)) {
    return [];
  }

  const files = fs.readdirSync(refDir);
  return files
    .filter((file) => {
      const ext = path.extname(file).toLowerCase();
      return SUPPORTED_EXTENSIONS.includes(ext);
    })
    .sort()
    .map((file) => {
      const ext = path.extname(file).toLowerCase();
      const filePath = path.join(refDir, file);
      const buffer = fs.readFileSync(filePath);
      return {
        mimeType: EXT_TO_MIME[ext] || "image/png",
        base64: buffer.toString("base64"),
        filename: file,
      };
    });
}
