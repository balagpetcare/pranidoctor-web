import { useCallback, useEffect, useRef, useState } from "react";
import type { Area } from "react-easy-crop";

import { cropImageToBlob, type CropImageOptions } from "./cropImage";

export type UseImageCropperOptions = Readonly<{
  open: boolean;
  imageSrc: string;
  showPreview?: boolean;
  previewDebounceMs?: number;
  cropOptions?: CropImageOptions;
}>;

export type UseImageCropperResult = Readonly<{
  crop: { x: number; y: number };
  zoom: number;
  areaPixels: Area | null;
  previewUrl: string | null;
  mediaReady: boolean;
  error: string | null;
  setCrop: (crop: { x: number; y: number }) => void;
  setZoom: (zoom: number) => void;
  setError: (error: string | null) => void;
  onCropComplete: (_area: Area, pixels: Area) => void;
  onMediaLoaded: () => void;
  onMediaError: (message: string) => void;
  resetView: () => void;
  revokePreview: () => void;
  createCroppedBlob: () => Promise<Blob | null>;
}>;

export function useImageCropper(options: UseImageCropperOptions): UseImageCropperResult {
  const {
    open,
    imageSrc,
    showPreview = true,
    previewDebounceMs = 220,
    cropOptions,
  } = options;
  const mountedRef = useRef(true);
  const previewGenRef = useRef(0);
  const previewTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previewUrlRef = useRef<string | null>(null);
  const lastImageRef = useRef<string>("");

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [areaPixels, setAreaPixels] = useState<Area | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [mediaReady, setMediaReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const revokePreview = useCallback(() => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
    setPreviewUrl(null);
  }, []);

  const onCropComplete = useCallback((_area: Area, pixels: Area) => {
    setAreaPixels(pixels);
  }, []);

  const onMediaLoaded = useCallback(() => {
    setMediaReady(true);
    setError(null);
  }, []);

  const onMediaError = useCallback((message: string) => {
    setMediaReady(false);
    setError(message);
  }, []);

  const resetView = useCallback(() => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setError(null);
  }, []);

  const createCroppedBlob = useCallback(async () => {
    if (!areaPixels) return null;
    return cropImageToBlob(imageSrc, areaPixels, cropOptions);
  }, [areaPixels, cropOptions, imageSrc]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!open) {
      if (previewTimer.current) clearTimeout(previewTimer.current);
      previewGenRef.current += 1;
      lastImageRef.current = "";
      queueMicrotask(() => {
        revokePreview();
        setCrop({ x: 0, y: 0 });
        setZoom(1);
        setAreaPixels(null);
        setError(null);
        setMediaReady(false);
      });
    }
  }, [open, revokePreview]);

  useEffect(() => {
    if (!open || !imageSrc) return;
    if (imageSrc === lastImageRef.current) return;
    lastImageRef.current = imageSrc;
    previewGenRef.current += 1;
    queueMicrotask(() => {
      revokePreview();
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setAreaPixels(null);
      setError(null);
      setMediaReady(false);
    });
  }, [open, imageSrc, revokePreview]);

  useEffect(() => {
    if (!open || !showPreview || !areaPixels || !imageSrc || !mediaReady) {
      return;
    }
    const gen = ++previewGenRef.current;
    if (previewTimer.current) clearTimeout(previewTimer.current);
    previewTimer.current = setTimeout(() => {
      void (async () => {
        try {
          const blob = await cropImageToBlob(imageSrc, areaPixels, cropOptions);
          if (!mountedRef.current || gen !== previewGenRef.current) return;
          if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
          const url = URL.createObjectURL(blob);
          previewUrlRef.current = url;
          setPreviewUrl(url);
        } catch {
          if (mountedRef.current && gen === previewGenRef.current) {
            setPreviewUrl(null);
          }
        }
      })();
    }, previewDebounceMs);
    return () => {
      if (previewTimer.current) clearTimeout(previewTimer.current);
    };
  }, [open, showPreview, areaPixels, imageSrc, mediaReady, cropOptions, previewDebounceMs]);

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
        previewUrlRef.current = null;
      }
    };
  }, []);

  return {
    crop,
    zoom,
    areaPixels,
    previewUrl,
    mediaReady,
    error,
    setCrop,
    setZoom,
    setError,
    onCropComplete,
    onMediaLoaded,
    onMediaError,
    resetView,
    revokePreview,
    createCroppedBlob,
  };
}
