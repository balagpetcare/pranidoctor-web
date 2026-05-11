import type { Area } from "react-easy-crop";

export type CropCanvasOptions = Readonly<{
  mimeType?: string;
  quality?: number;
  pixelRatio?: number;
}>;

export function getSafePixelRatio(pixelRatio?: number): number {
  const raw =
    pixelRatio ?? (typeof window !== "undefined" ? window.devicePixelRatio ?? 1 : 1);
  const safe = Number.isFinite(raw) ? raw : 1;
  return Math.min(2, Math.max(1, safe));
}

export function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.decoding = "async";
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (e) => reject(e));
    image.src = url;
  });
}

export function resolveCropSize(pixelCrop: Area, pixelRatio: number) {
  const srcW = Math.max(1, Math.round(pixelCrop.width));
  const srcH = Math.max(1, Math.round(pixelCrop.height));
  const outW = Math.max(1, Math.round(srcW * pixelRatio));
  const outH = Math.max(1, Math.round(srcH * pixelRatio));
  return { srcW, srcH, outW, outH };
}

export function drawImageToCanvas(
  image: HTMLImageElement,
  pixelCrop: Area,
  pixelRatio: number,
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas 2D context unavailable");
  }

  const { outW, outH } = resolveCropSize(pixelCrop, pixelRatio);
  canvas.width = outW;
  canvas.height = outH;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    outW,
    outH,
  );

  return canvas;
}

export function canvasToBlob(
  canvas: HTMLCanvasElement,
  mimeType: string,
  quality: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("canvas.toBlob failed"));
      },
      mimeType,
      quality,
    );
  });
}
