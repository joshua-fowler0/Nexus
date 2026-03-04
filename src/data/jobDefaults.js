import { v4 as uuid } from "uuid";

export const JOB_PIPELINE_COLUMNS = [
  { id: "interested", title: "Interested", colorKey: "blue" },
  { id: "applied", title: "Applied", colorKey: "amber" },
  { id: "interviewing", title: "Interviewing", colorKey: "purple" },
  { id: "offer", title: "Offer / Closed", colorKey: "green" },
];

export const JOB_AVAILABLE_DOCUMENTS = [
  { id: "resume", label: "Resume" },
  { id: "cover_letter", label: "Cover Letter" },
  { id: "portfolio", label: "Portfolio" },
  { id: "references", label: "References" },
  { id: "transcripts", label: "Transcripts" },
  { id: "work_samples", label: "Work Samples" },
  { id: "linkedin", label: "LinkedIn Updated" },
];

export const JOB_COLORS = [
  { id: "blue", label: "Blue" },
  { id: "purple", label: "Purple" },
  { id: "cyan", label: "Cyan" },
  { id: "green", label: "Green" },
  { id: "amber", label: "Amber" },
  { id: "red", label: "Red" },
];

export const DEFAULT_JOB_APPS = [];
