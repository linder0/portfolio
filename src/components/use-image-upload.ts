"use client";

import { useState } from "react";
import { uploadImage } from "@/app/actions";

// The one client-side wrapper around the `uploadImage` server action: wraps
// the file in FormData, tracks the in-flight flag, and resolves to the
// uploaded image's URL (null on failure).
export function useImageUpload(): {
  uploading: boolean;
  upload: (file: File) => Promise<string | null>;
} {
  const [uploading, setUploading] = useState(false);

  const upload = async (file: File): Promise<string | null> => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const result = await uploadImage(formData);
      return "url" in result ? result.url : null;
    } finally {
      setUploading(false);
    }
  };

  return { uploading, upload };
}
