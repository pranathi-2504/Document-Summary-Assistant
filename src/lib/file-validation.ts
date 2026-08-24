const SUPPORTED_MIME_TYPES = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/jpg",
]);

const SUPPORTED_EXTENSIONS = [".pdf", ".png", ".jpg", ".jpeg"];
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

export interface ValidationResult {
  valid: boolean;
  error: string | null;
}

export function validateDocumentFile(file: File): ValidationResult {
  if (!file) {
    return { valid: false, error: "Please choose a document to upload." };
  }

  const fileName = file.name.toLowerCase();
  const hasSupportedExtension = SUPPORTED_EXTENSIONS.some((ext) => fileName.endsWith(ext));

  if (!hasSupportedExtension || !SUPPORTED_MIME_TYPES.has(file.type.toLowerCase())) {
    return {
      valid: false,
      error: "Please upload a PDF, PNG, JPG, or JPEG file.",
    };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: "File is too large. Please upload a file smaller than 10 MB.",
    };
  }

  return { valid: true, error: null };
}

export function isPdfFile(file: File): boolean {
  return file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
}
