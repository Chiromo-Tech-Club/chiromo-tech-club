import type { Area } from "react-easy-crop";

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener("load", () => resolve(img));
    img.addEventListener("error", () => reject(new Error("Could not load image for cropping.")));
    img.crossOrigin = "anonymous";
    img.src = src;
  });
}

/**
 * Renders the user-selected crop region into a fixed-size canvas and
 * returns a File ready for upload (no server-side re-crop).
 */
export async function getCroppedImageFile(opts: {
  imageSrc: string;
  crop: Area;
  outputWidth: number;
  outputHeight: number;
  fileName: string;
  mimeType?: string;
  quality?: number;
}): Promise<File> {
  const {
    imageSrc,
    crop,
    outputWidth,
    outputHeight,
    fileName,
    mimeType = "image/jpeg",
    quality = 0.92,
  } = opts;

  const image = await loadImage(imageSrc);
  const canvas = document.createElement("canvas");
  canvas.width = outputWidth;
  canvas.height = outputHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not prepare the cropped image.");

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(
    image,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    outputWidth,
    outputHeight,
  );

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Could not save the cropped image."))),
      mimeType,
      quality,
    );
  });

  const base = fileName.replace(/\.[^.]+$/, "") || "image";
  const ext = mimeType === "image/png" ? "png" : mimeType === "image/webp" ? "webp" : "jpg";
  return new File([blob], `${base}-cropped.${ext}`, { type: mimeType });
}
