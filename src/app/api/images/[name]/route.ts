import { get } from "@vercel/blob";
import { IMAGE_PREFIX } from "@/lib/post-store";

// Owner-uploaded images (post bodies, marginalia notes) live in the private
// Blob store, which the browser can't read directly. This route streams them
// out. Names are timestamped on upload, so responses are effectively
// immutable and can be cached hard.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ name: string }> },
) {
  const { name } = await params;
  // The name is a single path segment (sanitized on upload); reject anything
  // that could traverse elsewhere in the store.
  if (!/^[\w.-]+$/.test(name)) {
    return new Response("Not found", { status: 404 });
  }

  const result = await get(`${IMAGE_PREFIX}${name}`, { access: "private" });
  if (!result?.stream) {
    return new Response("Not found", { status: 404 });
  }

  return new Response(result.stream, {
    headers: {
      "Content-Type": result.blob.contentType ?? "application/octet-stream",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
