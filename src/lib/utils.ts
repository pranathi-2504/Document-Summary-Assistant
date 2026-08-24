import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { SummaryResult } from "@/types/summary";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return "0 B";
  if (bytes === 0) return "0 B";

  const units = ["B", "KB", "MB", "GB"];
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** exponent;
  return `${value.toFixed(exponent === 0 ? 0 : 1)} ${units[exponent]}`;
}

export function getWordCount(text: string): number {
  return text
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

export function buildDownloadContent(result: SummaryResult, summaryLength: string): string {
  return `# ${result.title}

Summary length: ${summaryLength.toUpperCase()}
Generated with AI

## Summary
${result.summary}

## Key Points
${result.keyPoints.map((point) => `- ${point}`).join("\n")}

## Main Ideas
${result.mainIdeas.map((idea) => `- ${idea}`).join("\n")}

## Improvement Suggestions
${result.improvementSuggestions.map((suggestion) => `- ${suggestion}`).join("\n")}
`;
}

export function stripNullChars(value: string): string {
  return value.replace(/\u0000/g, "");
}
