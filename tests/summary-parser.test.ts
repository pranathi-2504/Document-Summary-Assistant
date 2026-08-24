import test from "node:test";
import assert from "node:assert/strict";
import { parseSummaryResponse } from "../src/lib/summary-parser";

test("parses direct json summary response", () => {
  const input = JSON.stringify({
    title: "Meeting Notes",
    summary: "Project timeline and blockers were discussed.",
    keyPoints: ["Timeline updated", "Two blockers identified"],
    mainIdeas: ["Execution planning", "Risk mitigation"],
    improvementSuggestions: ["Add owners to action items"],
  });

  const parsed = parseSummaryResponse(input);
  assert.equal(parsed.title, "Meeting Notes");
  assert.equal(parsed.keyPoints.length, 2);
});

test("parses fenced json summary response", () => {
  const input = `\`\`\`json
{
  "title": "Policy Draft",
  "summary": "The draft defines standards and reporting timelines.",
  "keyPoints": ["Standards defined", "Reporting cycle clarified"],
  "mainIdeas": ["Governance", "Operational clarity"],
  "improvementSuggestions": ["Add examples for edge cases"]
}
\`\`\``;

  const parsed = parseSummaryResponse(input);
  assert.equal(parsed.mainIdeas[0], "Governance");
  assert.equal(parsed.improvementSuggestions.length, 1);
});
