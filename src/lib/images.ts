/* ---------------------------------------------------------------------------
   Owner-uploaded images (post bodies, marginalia notes) live in the private
   Blob store under a timestamped name. The browser uploads straight to Blob
   (see `components/use-image-upload` and `/api/images/upload`), and images
   are served back through `/api/images/[name]`, which streams them out.
   Client-safe — no server-only imports.
   ------------------------------------------------------------------------- */

export const IMAGE_PREFIX = "content/images/";

// A stored image name: timestamp plus the sanitized original filename. The
// serving route only accepts names matching this shape (one path segment,
// no traversal).
export function imageName(fileName: string): string {
  return `${Date.now()}-${fileName.replace(/[^\w.-]+/g, "-")}`;
}

export function isValidImageName(name: string): boolean {
  return /^[\w.-]+$/.test(name);
}
