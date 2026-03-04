import { v4 as uuid } from "uuid";

export const DEFAULT_PROJECTS = [
  {
    id: uuid(),
    name: "ML Research Paper",
    deadline: "2026-03-15",
    color: "purple",
    notes: "Investigating transformer architectures for time-series forecasting.",
    links: "https://arxiv.org",
    tasks: [
      { id: uuid(), title: "Write abstract", subtitle: "~300 words", column: "todo" },
      { id: uuid(), title: "Literature review section", subtitle: "8 papers to cite", column: "todo" },
      { id: uuid(), title: "Create figures", subtitle: "", column: "todo" },
      { id: uuid(), title: "Run experiments", subtitle: "Batch 3/5 complete", column: "inprogress" },
      { id: uuid(), title: "Methodology section", subtitle: "First draft", column: "inprogress" },
      { id: uuid(), title: "Dataset preparation", subtitle: "", column: "done" },
      { id: uuid(), title: "Model architecture design", subtitle: "", column: "done" },
      { id: uuid(), title: "Set up experiment pipeline", subtitle: "", column: "done" },
    ],
  },
  {
    id: uuid(),
    name: "Portfolio Website",
    deadline: "2026-02-28",
    color: "blue",
    notes: "Personal portfolio site to showcase projects and research.",
    links: "",
    tasks: [
      { id: uuid(), title: "Design homepage layout", subtitle: "", column: "done" },
      { id: uuid(), title: "Build navigation component", subtitle: "", column: "done" },
      { id: uuid(), title: "Projects gallery page", subtitle: "", column: "done" },
      { id: uuid(), title: "About page content", subtitle: "", column: "inprogress" },
      { id: uuid(), title: "Contact form", subtitle: "Use Formspree", column: "inprogress" },
      { id: uuid(), title: "Deploy to Vercel", subtitle: "", column: "todo" },
    ],
  },
  {
    id: uuid(),
    name: "Data Viz Capstone",
    deadline: "2026-04-20",
    color: "cyan",
    notes: "Interactive visualization of climate data trends.",
    links: "",
    tasks: [
      { id: uuid(), title: "Gather climate datasets", subtitle: "NOAA, NASA sources", column: "done" },
      { id: uuid(), title: "Data cleaning pipeline", subtitle: "", column: "inprogress" },
      { id: uuid(), title: "Choose visualization framework", subtitle: "D3 vs Plotly", column: "todo" },
      { id: uuid(), title: "Build interactive charts", subtitle: "", column: "todo" },
      { id: uuid(), title: "Write project report", subtitle: "", column: "todo" },
      { id: uuid(), title: "Prepare presentation", subtitle: "", column: "todo" },
    ],
  },
];

export const KANBAN_COLUMNS = [
  { id: "todo", title: "To Do", colorKey: "textMuted" },
  { id: "inprogress", title: "In Progress", colorKey: "amber" },
  { id: "done", title: "Done", colorKey: "green" },
];

export const PROJECT_COLORS = [
  { id: "purple", label: "Purple" },
  { id: "blue", label: "Blue" },
  { id: "cyan", label: "Cyan" },
  { id: "green", label: "Green" },
  { id: "amber", label: "Amber" },
  { id: "red", label: "Red" },
];
