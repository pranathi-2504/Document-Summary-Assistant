import { z } from "zod";
import type { SummaryResult } from "@/types/summary";

const summarySchema = z.object({
  title: z.string().trim().min(1),
  summary: z.string().trim().min(1),
  keyPoints: z.array(z.string().trim().min(1)).min(1),
  mainIdeas: z.array(z.string().trim().min(1)).min(1),
  improvementSuggestions: z.array(z.string().trim().min(1)).min(1),
});

function parseJsonFromText(raw: string): unknown {
  const stripped = raw.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  const startIndex = stripped.indexOf("{");
  const endIndex = stripped.lastIndexOf("}");
  const candidate = startIndex >= 0 && endIndex > startIndex ? stripped.slice(startIndex, endIndex + 1) : stripped;

  try {
    return JSON.parse(candidate);
  } catch {
    const normalized = candidate
      .replace(/,\s*}/g, "}")
      .replace(/,\s*]/g, "]")
      .replace(/\r/g, "")
      .trim();
    return JSON.parse(normalized);
  }
}

export function parseSummaryResponse(raw: string): SummaryResult {
  const parsed = parseJsonFromText(raw);
  const result = summarySchema.parse(parsed);

  return {
    title: result.title,
    summary: result.summary,
    keyPoints: result.keyPoints,
    mainIdeas: result.mainIdeas,
    improvementSuggestions: result.improvementSuggestions,
  };
}
