const MIME_TO_EXTENSION: Record<string, string> = {
  "image/avif": "avif",
  "image/gif": "gif",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/svg+xml": "svg",
  "image/webp": "webp",
};

/**
 * Returns a file extension for a given mime type.
 * Falls back to "bin" for unknown/invalid input.
 */
export function getImageExtension(contentType: string) {
  const normalized = contentType.toLowerCase().trim().split(";")[0];
  return MIME_TO_EXTENSION[normalized] ?? "bin";
}
