import { v4 as uuid } from "uuid";

export const CLASS_ITEM_TYPES = [
  { id: "assignment", label: "Assignment", colorKey: "blue" },
  { id: "exam", label: "Exam", colorKey: "red" },
  { id: "reading", label: "Reading", colorKey: "amber" },
  { id: "other", label: "Other", colorKey: "textSecondary" },
];

export const CLASS_KANBAN_COLUMNS = [
  { id: "not_started", title: "Not Started", colorKey: "textMuted" },
  { id: "working", title: "Working", colorKey: "amber" },
  { id: "submitted", title: "Submitted", colorKey: "green" },
];

export const CLASS_COLORS = [
  { id: "blue", label: "Blue" },
  { id: "purple", label: "Purple" },
  { id: "cyan", label: "Cyan" },
  { id: "green", label: "Green" },
  { id: "amber", label: "Amber" },
  { id: "red", label: "Red" },
];

export const DEFAULT_SEMESTERS = [
  {
    id: uuid(),
    name: "Spring 2026",
    active: true,
    classes: [
      {
        id: uuid(),
        name: "CS 571",
        subtitle: "Machine Learning",
        color: "blue",
        items: [
          { id: uuid(), title: "HW 5: Neural Networks", type: "assignment", dueDate: "2026-02-21", column: "working" },
          { id: uuid(), title: "Midterm Exam", type: "exam", dueDate: "2026-02-26", column: "not_started" },
          { id: uuid(), title: "HW 4: SVMs", type: "assignment", dueDate: "2026-02-14", column: "submitted" },
          { id: uuid(), title: "Ch. 8 — Deep Learning", type: "reading", dueDate: "2026-02-20", column: "working" },
          { id: uuid(), title: "HW 6: CNNs", type: "assignment", dueDate: "2026-03-07", column: "not_started" },
        ],
      },
      {
        id: uuid(),
        name: "STAT 502",
        subtitle: "Statistical Methods",
        color: "green",
        items: [
          { id: uuid(), title: "Problem Set 6", type: "assignment", dueDate: "2026-02-23", column: "working" },
          { id: uuid(), title: "Lab Report 3", type: "assignment", dueDate: "2026-03-02", column: "not_started" },
          { id: uuid(), title: "Ch. 12 — Bayesian Methods", type: "reading", dueDate: "2026-02-25", column: "not_started" },
        ],
      },
      {
        id: uuid(),
        name: "CS 595",
        subtitle: "Research Seminar",
        color: "purple",
        items: [
          { id: uuid(), title: "Paper Presentation", type: "other", dueDate: "2026-03-04", column: "not_started" },
          { id: uuid(), title: "Reading Response #4", type: "reading", dueDate: "2026-02-20", column: "working" },
          { id: uuid(), title: "Reading Response #3", type: "reading", dueDate: "2026-02-13", column: "submitted" },
        ],
      },
    ],
  },
  {
    id: uuid(),
    name: "Fall 2025",
    active: false,
    classes: [
      {
        id: uuid(),
        name: "CS 500",
        subtitle: "Algorithms",
        color: "cyan",
        items: [
          { id: uuid(), title: "Final Exam", type: "exam", dueDate: "2025-12-15", column: "submitted" },
          { id: uuid(), title: "HW 8: Dynamic Programming", type: "assignment", dueDate: "2025-12-08", column: "submitted" },
        ],
      },
    ],
  },
];
