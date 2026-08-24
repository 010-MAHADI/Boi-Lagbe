'use client';

import { useRef, useState } from 'react';
import { ImagePlus, Loader2, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  max?: number;
  error?: string;
}

/** Longest edge of a stored photo, in pixels. */
const MAX_EDGE = 1200;
/** JPEG quality for the re-encoded photo. */
const JPEG_QUALITY = 0.75;

/**
 * Photo picker for the create-listing wizard.
 *
 * Files never leave the browser: each one is drawn onto a canvas, scaled down to
 * `MAX_EDGE` and re-encoded as a JPEG `data:` URL. That keeps the localStorage
 * snapshot small and mirrors what the R2 upload will eventually receive — swap
 * `compress` for a `PUT` to a signed URL and the rest of this component is unchanged.
 */
async function compress(file: File): Promise<string> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('read failed'));
    reader.readAsDataURL(file);
  });

  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('decode failed'));
    img.src = dataUrl;
  });

  const scale = Math.min(1, MAX_EDGE / Math.max(image.width, image.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(image.width * scale);
  canvas.height = Math.round(image.height * scale);

  const ctx = canvas.getContext('2d');
  // No canvas support (or a tainted context) — keep the original bytes.
  if (!ctx) return dataUrl;
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

  return canvas.toDataURL('image/jpeg', JPEG_QUALITY);
}

export default function ImageUploader({ images, onChange, max = 6, error }: ImageUploaderProps) {
  const { t } = useLanguage();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const room = max - images.length;

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setBusy(true);
    try {
      const picked = Array.from(files).slice(0, room);
      const encoded: string[] = [];
      for (const file of picked) {
        try {
          encoded.push(await compress(file));
        } catch {
          // Skip anything the browser cannot decode rather than failing the batch.
        }
      }
      if (encoded.length > 0) onChange([...images, ...encoded]);
    } finally {
      setBusy(false);
      // Allow re-picking the same file after a removal.
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div>
      <div className="grid grid-cols-3 gap-2.5">
        {images.map((src, index) => (
          <div
            key={`${index}-${src.slice(-16)}`}
            className="relative aspect-square rounded-[var(--radius-card)] overflow-hidden border border-border-warm bg-warm-surface"
          >
            {/* A plain <img> — these are local `data:` URLs, nothing to optimize. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={`${t('listing.detail.photo')} ${index + 1}`} className="w-full h-full object-cover" />
            {index === 0 && (
              <span className="absolute bottom-0 inset-x-0 bg-black/55 text-white text-[10px] text-center py-0.5">
                {t('listing.create.step3.photoCover')}
              </span>
            )}
            <button
              type="button"
              onClick={() => onChange(images.filter((_, i) => i !== index))}
              aria-label={t('listing.create.step3.photoRemove')}
              className="absolute top-1 right-1 p-1 rounded-full bg-white/90 text-text-secondary hover:text-error shadow-sm transition-colors cursor-pointer"
            >
              <X size={13} />
            </button>
          </div>
        ))}

        {room > 0 && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className={cn(
              'aspect-square rounded-[var(--radius-card)] border-2 border-dashed border-border-warm bg-warm-surface',
              'flex flex-col items-center justify-center gap-1 text-text-muted',
              'hover:border-primary-200 hover:text-primary transition-colors cursor-pointer disabled:opacity-60'
            )}
          >
            {busy ? <Loader2 size={22} className="animate-spin" /> : <ImagePlus size={22} />}
            <span className="text-[11px] font-medium px-1 text-center leading-tight">
              {t('listing.create.step3.photoAdd')}
            </span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => handleFiles(e.target.files)}
        className="hidden"
      />

      <p className={cn('mt-2 text-xs', error ? 'text-error' : 'text-text-muted')}>
        {error ?? (room === 0 ? t('listing.create.step3.photoMax') : t('listing.create.step3.photosHint'))}
      </p>
    </div>
  );
}
