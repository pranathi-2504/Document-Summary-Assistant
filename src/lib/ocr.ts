interface OcrProgress {
  message: string;
  progress: number | null;
}

type OcrProgressCallback = (progress: OcrProgress) => void;

const OCR_LANGUAGE = "eng";

interface PdfPageLike {
  getViewport: (params: { scale: number }) => { width: number; height: number };
  render: (params: {
    canvasContext: CanvasRenderingContext2D;
    viewport: unknown;
    canvas: HTMLCanvasElement;
  }) => { promise: Promise<unknown> };
}

interface PdfDocumentLike {
  numPages: number;
  getPage: (pageNumber: number) => Promise<PdfPageLike>;
}

async function createOcrWorker(callback: OcrProgressCallback) {
  const Tesseract = await import("tesseract.js");
  return Tesseract.createWorker(OCR_LANGUAGE, 1, {
    logger: (message) => {
      if (message.status === "recognizing text") {
        callback({
          message: `Recognizing text... ${Math.round(message.progress * 100)}%`,
          progress: message.progress * 100,
        });
      }
    },
  });
}

export async function runOcrOnImage(file: File, callback: OcrProgressCallback): Promise<string> {
  callback({ message: "Preparing OCR...", progress: 0 });
  const worker = await createOcrWorker(callback);

  try {
    const result = await worker.recognize(file);
    callback({ message: "Finalizing...", progress: 100 });
    return result.data.text.trim();
  } finally {
    await worker.terminate();
  }
}

export async function runOcrOnPdf(
  pdfDocument: unknown,
  maxPages: number,
  callback: OcrProgressCallback,
): Promise<string> {
  const documentRef = pdfDocument as PdfDocumentLike;
  const pageLimit = Math.min(documentRef.numPages, maxPages);
  const worker = await createOcrWorker(callback);
  const sections: string[] = [];

  callback({
    message: `Running OCR on ${pageLimit} page${pageLimit > 1 ? "s" : ""}...`,
    progress: 0,
  });

  try {
    for (let pageIndex = 1; pageIndex <= pageLimit; pageIndex += 1) {
      const page = await documentRef.getPage(pageIndex);
      const viewport = page.getViewport({ scale: 1.6 });
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");

      if (!context) {
        throw new Error("Unable to initialize OCR canvas context.");
      }

      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);

      await page.render({ canvasContext: context, viewport, canvas }).promise;
      callback({
        message: `Recognizing page ${pageIndex} of ${pageLimit}...`,
        progress: Math.round(((pageIndex - 1) / pageLimit) * 100),
      });

      const recognized = await worker.recognize(canvas);
      const pageText = recognized.data.text.trim();
      if (pageText) {
        sections.push(`--- Page ${pageIndex} ---\n${pageText}`);
      }

      canvas.width = 0;
      canvas.height = 0;
    }
  } finally {
    await worker.terminate();
  }

  callback({ message: "Finalizing...", progress: 100 });
  return sections.join("\n\n");
}
