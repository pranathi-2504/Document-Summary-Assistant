import test from "node:test";
import assert from "node:assert/strict";
import { MAX_FILE_SIZE_BYTES, validateDocumentFile } from "../src/lib/file-validation";

function createFile(name: string, type: string, size: number): File {
  const content = new Uint8Array(size);
  return new File([content], name, { type });
}

test("accepts valid PDF file", () => {
  const file = createFile("report.pdf", "application/pdf", 1024);
  const result = validateDocumentFile(file);
  assert.equal(result.valid, true);
  assert.equal(result.error, null);
});

test("rejects unsupported file type", () => {
  const file = createFile("notes.txt", "text/plain", 512);
  const result = validateDocumentFile(file);
  assert.equal(result.valid, false);
  assert.match(result.error ?? "", /PDF, PNG, JPG, or JPEG/);
});

test("rejects oversized files", () => {
  const file = createFile("huge.pdf", "application/pdf", MAX_FILE_SIZE_BYTES + 1);
  const result = validateDocumentFile(file);
  assert.equal(result.valid, false);
  assert.match(result.error ?? "", /smaller than 10 MB/);
});
