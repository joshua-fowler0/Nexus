import React, { useState, useEffect, useRef } from "react";
import { Icons } from "./Icons";
import { daysUntil, formatDate } from "./Shared";

export default function SearchOverlay({ isOpen, onClose, c, projects, semesters, gradApps, onNavigate }) {
  const [query, setQuery] = useState("");
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIdx(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Build search index
  const results = [];
  const q = query.toLowerCase().trim();

  if (q.length > 0) {
    // Projects
    projects.forEach((p) => {
      if (p.name.toLowerCase().includes(q) || (p.notes || "").toLowerCase().includes(q)) {
        results.push({
          type: "project", icon: <Icons.Folder />, color: c.purple,
          title: p.name, subtitle: `Project · ${p.tasks.length} tasks`,
          action: () => onNavigate("projects"),
        });
      }
      p.tasks.forEach((t) => {
        if (t.title.toLowerCase().includes(q)) {
          results.push({
            type: "task", icon: <Icons.FileText />, color: c.purple,
            title: t.title, subtitle: `Task in ${p.name}`,
            action: () => onNavigate("projects"),
          });
        }
      });
    });

    // Classes
    const activeSem = semesters.find((s) => s.active);
    (activeSem?.classes || []).forEach((cls) => {
      if (cls.name.toLowerCase().includes(q) || (cls.subtitle || "").toLowerCase().includes(q)) {
        results.push({
          type: "class", icon: <Icons.Book />, color: c.blue,
          title: `${cls.name}${cls.subtitle ? ` — ${cls.subtitle}` : ""}`,
          subtitle: `Class · ${cls.items.length} items`,
          action: () => onNavigate("classes"),
        });
      }
      cls.items.forEach((it) => {
        if (it.title.toLowerCase().includes(q)) {
          results.push({
            type: "item", icon: <Icons.FileText />, color: c.blue,
            title: it.title,
            subtitle: `${it.type} in ${cls.name}${it.dueDate ? ` · Due ${formatDate(it.dueDate)}` : ""}`,
            action: () => onNavigate("classes"),
          });
        }
      });
    });

    // Grad Apps
    gradApps.forEach((s) => {
      if (s.name.toLowerCase().includes(q) || (s.program || "").toLowerCase().includes(q) || (s.notes || "").toLowerCase().includes(q)) {
        results.push({
          type: "school", icon: <Icons.GradCap />, color: c.cyan,
          title: `${s.name} — ${s.program}`,
          subtitle: `Grad App · ${s.stage}${s.deadline ? ` · Deadline ${formatDate(s.deadline)}` : ""}`,
          action: () => onNavigate("gradapps"),
        });
      }
    });
  }

  // Clamp selected index
  const clampedIdx = Math.min(selectedIdx, results.length - 1);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    function handleKey(e) {
      if (e.key === "Escape") { onClose(); return; }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIdx((i) => Math.min(i + 1, results.length - 1));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIdx((i) => Math.max(i - 1, 0));
      }
      if (e.key === "Enter" && results.length > 0) {
        e.preventDefault();
        results[clampedIdx]?.action();
        onClose();
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, results, clampedIdx, onClose]);

  // Reset selection on query change
  useEffect(() => { setSelectedIdx(0); }, [query]);

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)",
        display: "flex", justifyContent: "center", paddingTop: 120,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 560, maxHeight: 460, background: c.bgCard,
          border: `1px solid ${c.border}`, borderRadius: 16,
          boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
          display: "flex", flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Search input */}
        <div style={{
          display: "flex", alignItems: "center", gap: 12,
          padding: "16px 20px", borderBottom: `1px solid ${c.border}`,
        }}>
          <span style={{ color: c.textMuted }}><Icons.Search /></span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search projects, classes, tasks, schools..."
            style={{
              flex: 1, background: "none", border: "none", outline: "none",
              fontSize: 15, color: c.text, fontFamily: "inherit",
            }}
          />
          <span style={{
            fontSize: 10, color: c.textMuted, background: c.bgKanban,
            padding: "3px 8px", borderRadius: 6, fontWeight: 600,
          }}>
            ESC
          </span>
        </div>

        {/* Results */}
        <div style={{ flex: 1, overflow: "auto", padding: "8px 0" }}>
          {q.length === 0 && (
            <div style={{ padding: "24px 20px", textAlign: "center", color: c.textMuted, fontSize: 13 }}>
              Start typing to search across all sections
            </div>
          )}
          {q.length > 0 && results.length === 0 && (
            <div style={{ padding: "24px 20px", textAlign: "center", color: c.textMuted, fontSize: 13 }}>
              No results for "{query}"
            </div>
          )}
          {results.slice(0, 20).map((r, i) => (
            <div
              key={i}
              onClick={() => { r.action(); onClose(); }}
              onMouseEnter={() => setSelectedIdx(i)}
              style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "10px 20px", cursor: "pointer",
                background: i === clampedIdx ? c.accentGlow : "transparent",
                transition: "background 0.1s",
              }}
            >
              <span style={{ color: r.color, flexShrink: 0 }}>{r.icon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 13, fontWeight: 600, color: c.text,
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>
                  {r.title}
                </div>
                <div style={{ fontSize: 11, color: c.textMuted }}>{r.subtitle}</div>
              </div>
              {i === clampedIdx && (
                <span style={{ fontSize: 10, color: c.textMuted }}>↵</span>
              )}
            </div>
          ))}
        </div>

        {/* Footer hints */}
        {results.length > 0 && (
          <div style={{
            padding: "10px 20px", borderTop: `1px solid ${c.border}`,
            display: "flex", gap: 16, justifyContent: "center",
          }}>
            {[
              { label: "navigate", keys: "↑↓" },
              { label: "open", keys: "↵" },
              { label: "close", keys: "esc" },
            ].map((h) => (
              <span key={h.label} style={{ fontSize: 11, color: c.textMuted }}>
                <span style={{
                  background: c.bgKanban, padding: "2px 6px", borderRadius: 4,
                  fontSize: 10, fontWeight: 600, marginRight: 4,
                }}>{h.keys}</span>
                {h.label}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
