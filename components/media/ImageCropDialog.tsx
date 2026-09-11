"use client";

import { useCallback, useEffect, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import "react-easy-crop/react-easy-crop.css";
import { X } from "lucide-react";
import { Button } from "@/components/alignui/button";
import { getCroppedImageFile } from "@/lib/media/crop-image";
import { IMAGE_CROP, type ImageCropPreset } from "@/constants/image-crop";
import { LIMITS } from "@/constants/limits";

type Props = {
  open: boolean;
  file: File | null;
  preset: ImageCropPreset;
  title?: string;
  onCancel: () => void;
  onComplete: (file: File, previewUrl: string) => void;
};

export function ImageCropDialog({
  open,
  file,
  preset,
  title = "Crop image",
  onCancel,
  onComplete,
}: Props) {
  const spec = IMAGE_CROP[preset];
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState<Area | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !file) {
      setImageSrc(null);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCroppedArea(null);
      setError(null);
      setBusy(false);
      return;
    }

    const url = URL.createObjectURL(file);
    setImageSrc(url);
    return () => URL.revokeObjectURL(url);
  }, [open, file]);

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedArea(pixels);
  }, []);

  async function handleApply() {
    if (!imageSrc || !croppedArea || !file) return;
    setBusy(true);
    setError(null);
    try {
      const cropped = await getCroppedImageFile({
        imageSrc,
        crop: croppedArea,
        outputWidth: spec.width,
        outputHeight: spec.height,
        fileName: file.name,
        mimeType: spec.mime,
        quality: spec.quality,
      });
      if (cropped.size > LIMITS.maxUploadBytes) {
        setError("Cropped image is still too large. Zoom in a bit or pick a smaller file.");
        setBusy(false);
        return;
      }
      const previewUrl = URL.createObjectURL(cropped);
      onComplete(cropped, previewUrl);
    } catch {
      setError("Could not crop this image. Please try another photo.");
    } finally {
      setBusy(false);
    }
  }

  if (!open || !file) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-ink/55 p-0 sm:items-center sm:p-6">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="image-crop-title"
        className="flex max-h-[100dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl border border-line bg-surface shadow-2xl sm:max-h-[90vh] sm:rounded-3xl"
      >
        <div className="flex items-start justify-between gap-3 border-b border-line px-4 py-3 sm:px-5">
          <div>
            <h2 id="image-crop-title" className="font-display text-base font-bold text-ink">
              {title}
            </h2>
            <p className="mt-0.5 text-[11px] text-muted">
              Drag to frame · pinch or use the slider to zoom · exports at {spec.label}
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full p-1.5 text-muted hover:bg-cream-2 hover:text-ink"
            aria-label="Close cropper"
          >
            <X size={18} />
          </button>
        </div>

        <div className="relative h-[min(52vh,420px)] w-full bg-ink">
          {imageSrc ? (
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={spec.aspect}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
              showGrid
              objectFit="contain"
            />
          ) : null}
        </div>

        <div className="space-y-3 border-t border-line px-4 py-4 sm:px-5">
          <label className="block space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wide text-muted">Zoom</span>
            <input
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full accent-navy"
            />
          </label>

          {error ? <p className="text-xs text-red-600">{error}</p> : null}

          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="ghost" disabled={busy} onClick={onCancel} className="rounded-xl">
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              disabled={busy || !croppedArea}
              onClick={() => void handleApply()}
              className="rounded-xl"
            >
              {busy ? "Cropping…" : "Use this crop"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
