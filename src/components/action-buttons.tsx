"use client";

import { useState } from "react";
import { Check, Copy, Download, FilePlus } from "lucide-react";
import type { SummaryLength, SummaryResult } from "@/types/summary";
import { buildDownloadContent } from "@/lib/utils";

interface ActionButtonsProps {
  result: SummaryResult;
  summaryLength: SummaryLength;
  onReset: () => void;
}

export function ActionButtons({ result, summaryLength, onReset }: ActionButtonsProps) {
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);

  const allContent = buildDownloadContent(result, summaryLength);

  const copySummary = async () => {
    await navigator.clipboard.writeText(result.summary);
    setCopiedSummary(true);
    window.setTimeout(() => setCopiedSummary(false), 1400);
  };

  const copyAll = async () => {
    await navigator.clipboard.writeText(allContent);
    setCopiedAll(true);
    window.setTimeout(() => setCopiedAll(false), 1400);
  };

  const download = () => {
    const blob = new Blob([allContent], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "document-summary.md";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:flex lg:flex-wrap">
      <button
        type="button"
        onClick={copySummary}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 lg:w-auto"
      >
        {copiedSummary ? <Check className="size-4 text-emerald-600" /> : <Copy className="size-4" />}
        {copiedSummary ? "Copied!" : "Copy Summary"}
      </button>
      <button
        type="button"
        onClick={copyAll}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 lg:w-auto"
      >
        {copiedAll ? <Check className="size-4 text-emerald-600" /> : <Copy className="size-4" />}
        {copiedAll ? "Copied!" : "Copy All"}
      </button>
      <button
        type="button"
        onClick={download}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 lg:w-auto"
      >
        <Download className="size-4" />
        Download Summary
      </button>
      <button
        type="button"
        onClick={onReset}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 lg:w-auto"
      >
        <FilePlus className="size-4" />
        New Document
      </button>
    </div>
  );
}
