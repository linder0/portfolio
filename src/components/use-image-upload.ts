"use client";

import { useState } from "react";
import { upload as uploadToBlob } from "@vercel/blob/client";
import { IMAGE_PREFIX, imageName } from "@/lib/images";

/* ---------------------------------------------------------------------------
   Image upload — the one client-side path for putting a photo in the store.
   Two things keep it fast:
   - The photo is downscaled and re-encoded in the browser first (a full-res
     phone photo is 5-15MB; a 2000px WebP is a fraction of that).
   - The bytes go straight from the browser to Vercel Blob, authorized by a
     short-lived token from /api/images/upload — no relay through the server
     (and no server-action body-size cap).
   ------------------------------------------------------------------------- */

// Longest edge after downscaling — comfortably above the widest the site
// ever renders an image, so nothing visibly degrades.
const MAX_DIMENSION = 2000;

// Already-small files upload fast and may be crisp hand-optimized assets;
// leave them untouched.
const SKIP_BELOW_BYTES = 300 * 1024;

// Formats safe to rasterize and re-encode. GIFs (animation) and SVGs
// (vectors) would be destroyed by a canvas round-trip; upload those as-is.
const RECOMPRESSABLE = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/heic",
  "image/heif",
  "image/tiff",
  "image/bmp",
]);

// Downscale to MAX_DIMENSION and re-encode as WebP. Falls back to the
// original file whenever that wouldn't help (small file, exotic format the
// browser can't decode, or a re-encode that came out bigger).
async function compressImage(
  file: File,
): Promise<{ body: Blob; name: string }> {
  const original = { body: file as Blob, name: file.name };
  if (!RECOMPRESSABLE.has(file.type) || file.size < SKIP_BELOW_BYTES) {
    return original;
  }

  try {
    const bitmap = await createImageBitmap(file, {
      imageOrientation: "from-image",
    });
    const scale = Math.min(
      1,
      MAX_DIMENSION / Math.max(bitmap.width, bitmap.height),
    );
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const context = canvas.getContext("2d");
    if (!context) return original;
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/webp", 0.82),
    );
    if (!blob || blob.size >= file.size) return original;
    return { body: blob, name: file.name.replace(/\.\w+$/, "") + ".webp" };
  } catch {
    return original;
  }
}

export function useImageUpload(): {
  uploading: boolean;
  upload: (file: File) => Promise<string | null>;
} {
  const [uploading, setUploading] = useState(false);

  const upload = async (file: File): Promise<string | null> => {
    setUploading(true);
    try {
      const { body, name } = await compressImage(file);
      const stored = imageName(name);
      await uploadToBlob(`${IMAGE_PREFIX}${stored}`, body, {
        access: "private",
        contentType: body.type,
        handleUploadUrl: "/api/images/upload",
      });
      return `/api/images/${stored}`;
    } catch {
      return null;
    } finally {
      setUploading(false);
    }
  };

  return { uploading, upload };
}
