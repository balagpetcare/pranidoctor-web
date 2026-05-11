import type { Area } from "react-easy-crop";

import { canvasToBlob, createImage, drawImageToCanvas, getSafePixelRatio } from "./cropUtils";

export type CropImageOptions = Readonly<{
  mimeType?: string;
  quality?: number;
  pixelRatio?: number;
}>;

export async function cropImageToBlob(
  imageSrc: string,
  pixelCrop: Area,
  options: CropImageOptions = {},
): Promise<Blob> {
  const mimeType = options.mimeType ?? "image/jpeg";
  const quality = options.quality ?? 0.92;
  const pixelRatio = getSafePixelRatio(options.pixelRatio);
  const image = await createImage(imageSrc);
  const canvas = drawImageToCanvas(image, pixelCrop, pixelRatio);
  return canvasToBlob(canvas, mimeType, quality);
}
