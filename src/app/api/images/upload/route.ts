import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { isAuthenticated } from "@/lib/auth";
import { IMAGE_PREFIX, isValidImageName } from "@/lib/images";

// Image uploads go straight from the browser to the Blob store — the file
// never relays through the server. This route only issues the short-lived
// client token that authorizes one such upload (owner only, image types
// only, confined to the image prefix).
export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return Response.json({ error: "Not signed in." }, { status: 401 });
  }

  const body = (await request.json()) as HandleUploadBody;
  try {
    const result = await handleUpload({
      request,
      body,
      onBeforeGenerateToken: async (pathname) => {
        if (
          !pathname.startsWith(IMAGE_PREFIX) ||
          !isValidImageName(pathname.slice(IMAGE_PREFIX.length))
        ) {
          throw new Error("Invalid upload path.");
        }
        return {
          allowedContentTypes: ["image/*"],
          maximumSizeInBytes: 32 * 1024 * 1024,
        };
      },
    });
    return Response.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed.";
    return Response.json({ error: message }, { status: 400 });
  }
}
