import { z } from "zod";
import { generateSummaryWithGemini } from "@/lib/gemini";
import type { SummaryLength } from "@/types/summary";

const requestSchema = z.object({
  text: z.string().trim().min(50).max(120_000),
  summaryLength: z.enum(["short", "medium", "long"]),
});

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return Response.json(
        {
          success: false,
          error: "AI summarization is not configured. Add GEMINI_API_KEY to your environment variables.",
        },
        { status: 503 },
      );
    }

    const body = await request.json();
    const parsed = requestSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        {
          success: false,
          error: "Please provide extracted document text and a valid summary length.",
        },
        { status: 400 },
      );
    }

    const { text, summaryLength } = parsed.data as { text: string; summaryLength: SummaryLength };
    const summary = await generateSummaryWithGemini(text, summaryLength, apiKey);

    return Response.json({ success: true, data: summary }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown server error";
    console.error("Summarization failed:", message);

    return Response.json(
      {
        success: false,
        error: "We couldn't generate the summary right now. Please try again.",
      },
      { status: 502 },
    );
  }
}
