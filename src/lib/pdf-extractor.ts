import type { ExtractedDocument } from "@/types/summary";
import { getWordCount, stripNullChars } from "@/lib/utils";
import { runOcrOnImage, runOcrOnPdf } from "@/lib/ocr";

interface ExtractorProgress {
  message: string;
  progress: number | null;
}

type ExtractorProgressCallback = (state: ExtractorProgress) => void;

interface PdfTextItem {
  str: string;
  transform: number[];
}

const MIN_TEXT_CHARS_FOR_PDF = 200;
const MIN_WORDS_FOR_PDF = 40;
export const MAX_OCR_PDF_PAGES = 15;

function isPdfTextItem(value: unknown): value is PdfTextItem {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<PdfTextItem>;
  return typeof item.str === "string" && Array.isArray(item.transform);
}

function buildReadablePageText(items: PdfTextItem[]): string {
  const lines: string[] = [];
  let currentLine: string[] = [];
  let previousY: number | null = null;

  for (const item of items) {
    const yPosition = item.transform[5];
    const shouldBreakLine = previousY !== null && Math.abs(yPosition - previousY) > 2.2;

    if (shouldBreakLine && currentLine.length > 0) {
      lines.push(currentLine.join(" ").replace(/\s+/g, " ").trim());
      currentLine = [];
    }

    const text = item.str.trim();
    if (text) currentLine.push(text);
    previousY = yPosition;
  }

  if (currentLine.length > 0) {
    lines.push(currentLine.join(" ").replace(/\s+/g, " ").trim());
  }

  return lines.filter(Boolean).join("\n");
}

export async function extractTextFromPdf(
  file: File,
  callback: ExtractorProgressCallback,
): Promise<ExtractedDocument> {
  callback({ message: "Reading PDF document...", progress: 10 });
  const arrayBuffer = await file.arrayBuffer();

  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  if (!pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;
  }

  callback({ message: "Extracting text from PDF...", progress: 20 });
  const loadingTask = pdfjs.getDocument({ data: arrayBuffer, useSystemFonts: true });
  const pdfDocument = await loadingTask.promise;

  const sections: string[] = [];
  for (let pageIndex = 1; pageIndex <= pdfDocument.numPages; pageIndex += 1) {
    const page = await pdfDocument.getPage(pageIndex);
    const textContent = await page.getTextContent();
    const pageItems = textContent.items.reduce<PdfTextItem[]>((accumulator, item) => {
      if (isPdfTextItem(item)) accumulator.push(item);
      return accumulator;
    }, []);
    const pageText = buildReadablePageText(pageItems);

    if (pageText) {
      sections.push(`--- Page ${pageIndex} ---\n${pageText}`);
    }

    callback({
      message: `Extracting text... page ${pageIndex} of ${pdfDocument.numPages}`,
      progress: Math.round((pageIndex / pdfDocument.numPages) * 55) + 20,
    });
  }

  const textFromPdf = stripNullChars(sections.join("\n\n")).trim();
  const canUsePdfText =
    textFromPdf.length >= MIN_TEXT_CHARS_FOR_PDF && getWordCount(textFromPdf) >= MIN_WORDS_FOR_PDF;

  if (canUsePdfText) {
    return {
      text: textFromPdf,
      pageCount: pdfDocument.numPages,
      method: "pdf-text",
      usedOcrFallback: false,
    };
  }

  callback({
    message:
      pdfDocument.numPages > MAX_OCR_PDF_PAGES
        ? `Low extractable text detected. Running OCR on first ${MAX_OCR_PDF_PAGES} pages...`
        : "Low extractable text detected. Running OCR...",
    progress: 75,
  });

  const ocrText = await runOcrOnPdf(pdfDocument, MAX_OCR_PDF_PAGES, callback);

  return {
    text: stripNullChars(ocrText).trim(),
    pageCount: pdfDocument.numPages,
    method: "ocr",
    usedOcrFallback: true,
  };
}

export async function extractTextFromImage(
  file: File,
  callback: ExtractorProgressCallback,
): Promise<ExtractedDocument> {
  callback({ message: "Reading image document...", progress: 5 });
  const text = await runOcrOnImage(file, callback);

  return {
    text: stripNullChars(text).trim(),
    pageCount: 1,
    method: "ocr",
    usedOcrFallback: false,
  };
}
