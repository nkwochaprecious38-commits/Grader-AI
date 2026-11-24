export function subStatus(s: any): { label: string; tone: string } {
  if (s.published) return { label: "Published", tone: "green" };
  if (s.approved) return { label: "Approved", tone: "teal" };
  if (s.manualReview) return { label: "Manual review", tone: "red" };
  if (s.needsTranscription) return { label: "Needs transcription", tone: "amber" };
  if (Object.keys(s.suggestions || {}).length) return { label: "AI suggested", tone: "blue" };
  return { label: "Awaiting grading", tone: "amber" };
}
