import { v4 as uuid } from "uuid";

export const GRAD_PIPELINE_COLUMNS = [
  { id: "researching", title: "Researching", colorKey: "blue" },
  { id: "preparing", title: "Preparing", colorKey: "amber" },
  { id: "submitted", title: "Submitted", colorKey: "purple" },
  { id: "decision", title: "Decision", colorKey: "green" },
];

// Master list of common documents — used as a picker menu
export const AVAILABLE_DOCUMENTS = [
  { id: "sop", label: "Statement of Purpose" },
  { id: "personal_statement", label: "Personal Statement" },
  { id: "lor1", label: "Letter of Rec #1" },
  { id: "lor2", label: "Letter of Rec #2" },
  { id: "lor3", label: "Letter of Rec #3" },
  { id: "cv", label: "CV / Resume" },
  { id: "transcripts", label: "Transcripts" },
  { id: "gre", label: "GRE Scores" },
  { id: "diversity", label: "Diversity Statement" },
];

export const SCHOOL_COLORS = [
  { id: "red", label: "Red" },
  { id: "blue", label: "Blue" },
  { id: "purple", label: "Purple" },
  { id: "cyan", label: "Cyan" },
  { id: "green", label: "Green" },
  { id: "amber", label: "Amber" },
];

// Each school now has requiredDocs: array of { id, label, done }
// This allows per-school customization and custom "Other" docs
export const DEFAULT_GRAD_APPS = [
  {
    id: uuid(),
    name: "MIT",
    program: "CS PhD",
    color: "red",
    deadline: "2026-12-15",
    stage: "researching",
    requiredDocs: [
      { id: uuid(), label: "Statement of Purpose", done: true },
      { id: uuid(), label: "Letter of Rec #1", done: true },
      { id: uuid(), label: "Letter of Rec #2", done: false },
      { id: uuid(), label: "Letter of Rec #3", done: false },
      { id: uuid(), label: "CV / Resume", done: true },
      { id: uuid(), label: "Transcripts", done: true },
      { id: uuid(), label: "GRE Scores", done: true },
    ],
    notes: "Strong ML group. Prof. Smith's lab ideal fit. Funding guaranteed for PhD students.",
    pros: "World-class faculty, excellent funding, strong industry connections",
    cons: "Extremely competitive, high cost of living in Boston",
    fit: "Research interests align perfectly with 3+ faculty members",
    funding: "Full tuition + stipend for all PhD students",
  },
  {
    id: uuid(),
    name: "Stanford",
    program: "CS PhD",
    color: "red",
    deadline: "2026-12-01",
    stage: "researching",
    requiredDocs: [
      { id: uuid(), label: "Statement of Purpose", done: false },
      { id: uuid(), label: "Personal Statement", done: false },
      { id: uuid(), label: "Letter of Rec #1", done: true },
      { id: uuid(), label: "Letter of Rec #2", done: false },
      { id: uuid(), label: "Letter of Rec #3", done: false },
      { id: uuid(), label: "CV / Resume", done: true },
      { id: uuid(), label: "Transcripts", done: true },
      { id: uuid(), label: "Diversity Statement", done: false },
    ],
    notes: "HAI institute. Need to tailor SOP for NLP focus.",
    pros: "HAI institute, Silicon Valley location, interdisciplinary",
    cons: "Very competitive, expensive area, large cohort",
    fit: "NLP research group is a strong match",
    funding: "Full funding for PhD, additional fellowship opportunities",
  },
  {
    id: uuid(),
    name: "CMU",
    program: "MLD PhD",
    color: "purple",
    deadline: "2026-12-08",
    stage: "researching",
    requiredDocs: [
      { id: uuid(), label: "Statement of Purpose", done: false },
      { id: uuid(), label: "Letter of Rec #1", done: false },
      { id: uuid(), label: "Letter of Rec #2", done: false },
      { id: uuid(), label: "Letter of Rec #3", done: false },
      { id: uuid(), label: "Transcripts", done: true },
      { id: uuid(), label: "Video Essay", done: false },
    ],
    notes: "Machine Learning Dept. Smaller cohort. Requires video essay.",
    pros: "Dedicated ML department, small cohort, strong placement record",
    cons: "Pittsburgh weather, fewer industry partnerships nearby",
    fit: "MLD program is uniquely tailored to ML research",
    funding: "Full tuition + competitive stipend",
  },
  {
    id: uuid(),
    name: "UC Berkeley",
    program: "EECS PhD",
    color: "blue",
    deadline: "2026-12-15",
    stage: "researching",
    requiredDocs: [
      { id: uuid(), label: "Statement of Purpose", done: false },
      { id: uuid(), label: "Personal Statement", done: false },
      { id: uuid(), label: "Letter of Rec #1", done: false },
      { id: uuid(), label: "Letter of Rec #2", done: false },
      { id: uuid(), label: "Letter of Rec #3", done: false },
      { id: uuid(), label: "CV / Resume", done: false },
      { id: uuid(), label: "Transcripts", done: false },
    ],
    notes: "BAIR lab. Bay area location is a plus.",
    pros: "BAIR lab, Bay Area, strong AI community, public university tuition",
    cons: "Large program, housing crisis in Berkeley, bureaucratic",
    fit: "BAIR research aligns well, multiple potential advisors",
    funding: "Varies — GSR/GSI appointments typical",
  },
];
