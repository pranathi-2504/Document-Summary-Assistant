"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertCircle, Brain, ScanSearch, Sparkles } from "lucide-react";
import { Header } from "@/components/header";
import { UploadZone } from "@/components/upload-zone";
import { FileCard } from "@/components/file-card";
import { ProcessingStatus } from "@/components/processing-status";
import { TextPreview } from "@/components/text-preview";
import { SummaryOptions } from "@/components/summary-options";
import { SummaryResultPanel } from "@/components/summary-result";
import { validateDocumentFile, isPdfFile } from "@/lib/file-validation";
import { extractTextFromImage, extractTextFromPdf, MAX_OCR_PDF_PAGES } from "@/lib/pdf-extractor";
import type { ExtractedDocument, ProcessingState, SummaryLength, SummarizeApiResponse, SummaryResult } from "@/types/summary";

const AI_PROGRESS_STEPS = [
  "Analyzing document...",
  "Identifying key ideas...",
  "Writing summary...",
  "Finalizing insights...",
];

const initialProcessingState: ProcessingState = {
  stage: "idle",
  message: "Ready to analyze",
  progress: null,
};

export function DocumentSummaryAssistant() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState<ProcessingState>(initialProcessingState);
  const [extracted, setExtracted] = useState<ExtractedDocument | null>(null);
  const [summaryLength, setSummaryLength] = useState<SummaryLength>("medium");
  const [summaryResult, setSummaryResult] = useState<SummaryResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (processing.stage !== "summarizing") return;
    let step = 0;
    const interval = window.setInterval(() => {
      step = (step + 1) % AI_PROGRESS_STEPS.length;
      setProcessing((current) =>
        current.stage === "summarizing"
          ? { ...current, message: AI_PROGRESS_STEPS[step], progress: Math.min(95, (step + 1) * 24) }
          : current,
      );
    }, 1400);

    return () => window.clearInterval(interval);
  }, [processing.stage]);

  const isBusy = useMemo(
    () => ["validating", "reading", "extracting", "ocr", "preparing", "summarizing"].includes(processing.stage),
    [processing.stage],
  );

  const handleReset = () => {
    setSelectedFile(null);
    setProcessing(initialProcessingState);
    setExtracted(null);
    setSummaryResult(null);
    setError(null);
    setNotice(null);
    setSummaryLength("medium");
  };

  const processDocument = async (file: File) => {
    setError(null);
    setNotice(null);
    setSummaryResult(null);
    setExtracted(null);
    setProcessing({ stage: "validating", message: "Validating file...", progress: 5 });

    const validation = validateDocumentFile(file);
    if (!validation.valid) {
      setProcessing({ stage: "error", message: "Validation failed", progress: null });
      setError(validation.error);
      return;
    }

    try {
      const extractedDocument = isPdfFile(file)
        ? await extractTextFromPdf(file, ({ message, progress }) =>
            setProcessing({
              stage: message.toLowerCase().includes("ocr") ? "ocr" : "extracting",
              message,
              progress,
            }),
          )
        : await extractTextFromImage(file, ({ message, progress }) =>
            setProcessing({ stage: "ocr", message, progress }),
          );

      setProcessing({ stage: "preparing", message: "Preparing content...", progress: 96 });

      if (extractedDocument.usedOcrFallback && extractedDocument.pageCount > MAX_OCR_PDF_PAGES) {
        setNotice(
          `Scanned PDF detected. OCR processed the first ${MAX_OCR_PDF_PAGES} pages for performance.`,
        );
      }

      if (extractedDocument.text.trim().length < 50) {
        throw new Error("We couldn't extract readable text from this document.");
      }

      setExtracted(extractedDocument);
      setProcessing({ stage: "ready", message: "Ready to analyze", progress: 100 });
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message.includes("OCR")
            ? "OCR could not process this document. Please try a clearer image."
            : caughtError.message
          : "We couldn't extract readable text from this document.";

      setProcessing({ stage: "error", message: "Processing failed", progress: null });
      setError(message);
    }
  };

  const handleFileSelected = (file: File) => {
    setSelectedFile(file);
    void processDocument(file);
  };

  const generateSummary = async () => {
    if (!extracted?.text || isBusy) return;

    try {
      setError(null);
      setProcessing({ stage: "summarizing", message: AI_PROGRESS_STEPS[0], progress: 10 });

      const response = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: extracted.text,
          summaryLength,
        }),
      });

      const payload = (await response.json()) as SummarizeApiResponse;
      if (!response.ok || !payload.success) {
        throw new Error(payload.success ? "Unable to summarize." : payload.error);
      }

      setSummaryResult(payload.data);
      setProcessing({ stage: "complete", message: "Complete", progress: 100 });
    } catch (caughtError) {
      const message = caughtError instanceof Error ? caughtError.message : "Unexpected summarization error.";
      if (message.toLowerCase().includes("fetch")) {
        setError("Something went wrong while connecting to the summarization service.");
      } else {
        setError(message || "We couldn't generate the summary right now. Please try again.");
      }
      setProcessing({ stage: "ready", message: "Ready to analyze", progress: 100 });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 text-slate-900">
      <Header />
      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <section className="mx-auto max-w-3xl text-center">
          <h1 className="text-balance text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            Turn documents into clear insights.
          </h1>
          <p className="mt-3 text-pretty text-base text-slate-600 sm:text-lg">
            Upload a PDF or scanned image and get an AI-powered summary, key points, and actionable suggestions in
            seconds.
          </p>
        </section>

        <section className="mx-auto mt-8 max-w-4xl space-y-4">
          <UploadZone disabled={isBusy} onFileSelected={handleFileSelected} />

          {!selectedFile ? (
            <div id="how-it-works" className="grid gap-3 sm:grid-cols-3">
              <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <ScanSearch className="mb-2 size-5 text-indigo-600" />
                <h3 className="font-semibold text-slate-900">Extract</h3>
                <p className="mt-1 text-sm text-slate-600">Parse PDF text or apply OCR for scanned documents.</p>
              </article>
              <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <Sparkles className="mb-2 size-5 text-indigo-600" />
                <h3 className="font-semibold text-slate-900">Summarize</h3>
                <p className="mt-1 text-sm text-slate-600">Generate short, medium, or long structured summaries.</p>
              </article>
              <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <Brain className="mb-2 size-5 text-indigo-600" />
                <h3 className="font-semibold text-slate-900">Improve</h3>
                <p className="mt-1 text-sm text-slate-600">Get key points, main ideas, and practical improvements.</p>
              </article>
            </div>
          ) : (
            <FileCard file={selectedFile} status={processing.message} onRemove={handleReset} disabled={isBusy} />
          )}

          {isBusy && <ProcessingStatus label={processing.message} progress={processing.progress} />}

          {notice && (
            <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4 text-sm text-indigo-800" role="status">
              {notice}
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800"
              aria-live="polite"
            >
              <p className="flex items-start gap-2">
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                <span>{error}</span>
              </p>
            </div>
          )}
        </section>

        {extracted && (
          <section className="mx-auto mt-6 max-w-5xl space-y-4">
            <TextPreview
              text={extracted.text}
              pageCount={extracted.pageCount}
              method={extracted.method}
              usedOcrFallback={extracted.usedOcrFallback}
            />
            <SummaryOptions value={summaryLength} onChange={setSummaryLength} disabled={isBusy} />
            <button
              type="button"
              onClick={generateSummary}
              disabled={isBusy || processing.stage === "summarizing"}
              className="inline-flex w-full items-center justify-center rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {processing.stage === "summarizing" ? "Generating summary..." : "Generate AI Summary"}
            </button>
          </section>
        )}

        {summaryResult && (
          <section className="mx-auto mt-8 max-w-5xl">
            <SummaryResultPanel result={summaryResult} summaryLength={summaryLength} onReset={handleReset} />
          </section>
        )}
      </main>
    </div>
  );
}
