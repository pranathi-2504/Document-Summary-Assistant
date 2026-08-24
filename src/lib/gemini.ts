import "server-only";
import { GoogleGenerativeAI } from "@google/generative-ai";
import type { SummaryLength, SummaryResult } from "@/types/summary";
import { parseSummaryResponse } from "@/lib/summary-parser";

const SUMMARY_STYLE_GUIDE: Record<SummaryLength, string> = {
  short: "Write a very concise summary in 3-5 sentences.",
  medium: "Write a balanced summary in 1-3 short paragraphs.",
  long: "Write a detailed but focused multi-paragraph summary with meaningful context.",
};

function buildPrompt(text: string, summaryLength: SummaryLength): string {
  return `You are an expert document analyst.

Task:
1. Analyze only the supplied document text.
2. Do not invent facts not present in the text.
3. Preserve important names, numbers, dates, and conclusions.
4. If information is uncertain or unclear, explicitly state the uncertainty.
5. Keep the language clear, direct, and non-repetitive.
6. ${SUMMARY_STYLE_GUIDE[summaryLength]}
7. Improvement suggestions must be practical and relevant to clarity, structure, completeness, readability, or actionable next steps.
8. If the document is already strong, acknowledge that and provide only meaningful suggestions.

Return ONLY valid JSON in this exact shape:
{
  "title": "short descriptive title",
  "summary": "string",
  "keyPoints": ["string", "string", "string"],
  "mainIdeas": ["string", "string"],
  "improvementSuggestions": ["string", "string"]
}

Document text:
"""${text}"""`;
}

export async function generateSummaryWithGemini(
  text: string,
  summaryLength: SummaryLength,
  apiKey: string,
): Promise<SummaryResult> {
  const client = new GoogleGenerativeAI(apiKey);
  const model = client.getGenerativeModel({ model: "gemini-3.6-flash" });

  const result = await model.generateContent(buildPrompt(text, summaryLength));
  const rawResponse = result.response.text();
  return parseSummaryResponse(rawResponse);
}
