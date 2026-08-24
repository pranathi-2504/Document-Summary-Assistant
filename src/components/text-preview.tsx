"use client";

import { useMemo, useState } from "react";
import { Copy, CopyCheck, FileSearch } from "lucide-react";
import { getWordCount } from "@/lib/utils";
import type { ExtractionMethod } from "@/types/summary";

interface TextPreviewProps {
  text: string;
  pageCount: number;
  method: ExtractionMethod;
  usedOcrFallback: boolean;
}

export function TextPreview({ text, pageCount, method, usedOcrFallback }: TextPreviewProps) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const stats = useMemo(
    () => ({
      words: getWordCount(text),
      chars: text.length,
    }),
    [text],
  );

  const copyText = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Extracted Text</h3>
          <p className="mt-1 text-xs text-slate-600">
            {pageCount} page{pageCount !== 1 ? "s" : ""} • {stats.words.toLocaleString()} words •{" "}
            {stats.chars.toLocaleString()} characters
          </p>
          <p className="mt-1 text-xs font-medium text-slate-700">
            Method: {method === "pdf-text" ? "PDF Text Extraction" : "OCR"}
            {usedOcrFallback ? " (scanned PDF fallback)" : ""}
          </p>
        </div>
        <button
          type="button"
          onClick={copyText}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
        >
          {copied ? <CopyCheck className="size-4 text-emerald-600" /> : <Copy className="size-4" />}
          {copied ? "Copied!" : "Copy extracted text"}
        </button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
        <div
          className={`overflow-y-auto whitespace-pre-wrap text-sm text-slate-700 ${expanded ? "max-h-[26rem]" : "max-h-52"}`}
        >
          {text}
        </div>
      </div>

      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-indigo-700 transition hover:text-indigo-800"
      >
        <FileSearch className="size-4" />
        {expanded ? "Collapse preview" : "Expand preview"}
      </button>
    </section>
  );
}
