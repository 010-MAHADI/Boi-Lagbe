'use client';

import Image from 'next/image';
import { useState } from 'react';
import { PLACEHOLDER_BOOK_IMAGE } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface ListingImageProps {
  src?: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}

/**
 * A listing photo that never shows a broken frame.
 *
 * Photos come from three places — the seeded mock paths, `data:` URLs produced by
 * ImageUploader, and (later) Cloudflare R2 — so the optimizer is bypassed and any
 * load failure falls back to the placeholder artwork.
 */
export default function ListingImage({
  src,
  alt,
  className,
  sizes = '(max-width: 768px) 50vw, 25vw',
  priority,
}: ListingImageProps) {
  const [failed, setFailed] = useState(false);
  const resolved = !src || failed ? PLACEHOLDER_BOOK_IMAGE : src;

  return (
    <Image
      src={resolved}
      alt={alt}
      fill
      unoptimized
      sizes={sizes}
      priority={priority}
      onError={() => setFailed(true)}
      className={cn('object-cover', className)}
    />
  );
}
