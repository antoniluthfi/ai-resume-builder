import { ResumeData } from "@/types/resume";

const PHOTO_SIZE_PX = 400;
const PHOTO_JPEG_QUALITY = 0.85;
export const MAX_PHOTO_FILE_BYTES = 10 * 1024 * 1024;

/**
 * Center-crops the image to a square and downsizes it to a small JPEG data URL,
 * so it stays light enough for localStorage and saved versions.
 */
export async function fileToResumePhoto(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  try {
    const side = Math.min(bitmap.width, bitmap.height);
    const size = Math.min(PHOTO_SIZE_PX, side);
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas is not supported");
    // JPEG has no alpha; paint white so transparent PNGs don't turn black.
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, size, size);
    ctx.drawImage(bitmap, (bitmap.width - side) / 2, (bitmap.height - side) / 2, side, side, 0, 0, size, size);
    return canvas.toDataURL("image/jpeg", PHOTO_JPEG_QUALITY);
  } finally {
    bitmap.close();
  }
}

export function photoDataUrlToBytes(dataUrl: string): Uint8Array {
  const binary = atob(dataUrl.slice(dataUrl.indexOf(",") + 1));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

/** The photo is useless to the LLM and would waste tokens, so drop it from API payloads. */
export function withoutPhoto(resume: ResumeData): ResumeData {
  if (!resume.personalInfo.photo) return resume;
  const personalInfo = { ...resume.personalInfo };
  delete personalInfo.photo;
  return { ...resume, personalInfo };
}
