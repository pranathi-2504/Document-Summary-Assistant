export type SummaryLength = "short" | "medium" | "long";

export type ExtractionMethod = "pdf-text" | "ocr";

export interface SummaryResult {
  title: string;
  summary: string;
  keyPoints: string[];
  mainIdeas: string[];
  improvementSuggestions: string[];
}

export interface ApiSuccessResponse {
  success: true;
  data: SummaryResult;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
}

export type SummarizeApiResponse = ApiSuccessResponse | ApiErrorResponse;

export interface ExtractedDocument {
  text: string;
  pageCount: number;
  method: ExtractionMethod;
  usedOcrFallback: boolean;
}

export type ProcessingStage =
  | "idle"
  | "validating"
  | "reading"
  | "extracting"
  | "ocr"
  | "preparing"
  | "ready"
  | "summarizing"
  | "complete"
  | "error";

export interface ProcessingState {
  stage: ProcessingStage;
  message: string;
  progress: number | null;
}
