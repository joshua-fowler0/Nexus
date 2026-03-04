import React, { useState, useRef, useEffect } from "react";
import { v4 as uuid } from "uuid";
import { Icons } from "./Icons";

export default function QuickAdd({ c, projects, semesters, gradApps, onProjectsChange, onSemestersChange, onGradAppsChange, onNavigate }) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState("pick"); // "pick" | "form"
  const [target, setTarget] = useState(null); // { type, projectId?, classId? }
  const [formData, setFormData] = useState({ title: "", notes: "", dueDate: "" });
  const menuRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
        setStep("pick");
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen]);

  const activeSem = semesters.find((s) => s.active);
  const classes = activeSem?.classes || [];

  function pickTarget(type, id) {
    setTarget({ type, id });
    setFormData({ title: "", notes: "" });
    setStep("form");
  }

  function save() {
    if (!formData.title.trim()) return;

    if (target.type === "project") {
      onProjectsChange(projects.map((p) => {
        if (p.id !== target.id) return p;
        return {
          ...p,
          tasks: [...p.tasks, {
            id: uuid(), title: formData.title, subtitle: "",
            notes: formData.notes, column: "todo",
          }],
        };
      }));
    } else if (target.type === "class") {
      onSemestersChange(semesters.map((sem) => {
        if (!sem.active) return sem;
        return {
          ...sem,
          classes: sem.classes.map((cls) => {
            if (cls.id !== target.id) return cls;
            return {
              ...cls,
              items: [...cls.items, {
                id: uuid(), title: formData.title, type: "assignment",
                notes: formData.notes, dueDate: "", column: "not_started",
              }],
            };
          }),
        };
      }));
    }

    setIsOpen(false);
    setStep("pick");
  }

  return (
    <div ref={menuRef} style={{
      position: "fixed", bottom: 28, right: 28, zIndex: 1000,
    }}>
      {/* Floating menu */}
      {isOpen && (
        <div style={{
          position: "absolute", bottom: 60, right: 0,
          width: 320, background: c.bgCard,
          border: `1px solid ${c.border}`, borderRadius: 14,
          boxShadow: "0 12px 40px rgba(0,0,0,0.35)",
          overflow: "hidden",
        }}>
          {/* Header */}
          <div style={{
            padding: "14px 18px", borderBottom: `1px solid ${c.border}`,
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: c.text }}>
              {step === "pick" ? "Quick Add" : `Add to ${target?.type === "project" ? "Project" : "Class"}`}
            </span>
            {step === "form" && (
              <button onClick={() => setStep("pick")} style={{
                background: "none", border: "none", color: c.textMuted,
                cursor: "pointer", fontSize: 11, fontFamily: "inherit",
              }}>
                ← Back
              </button>
            )}
          </div>

          {/* Step: Pick target */}
          {step === "pick" && (
            <div style={{ padding: 10, maxHeight: 300, overflow: "auto" }}>
              {projects.length > 0 && (
                <div style={{ marginBottom: 8 }}>
                  <div style={{
                    fontSize: 10, fontWeight: 700, textTransform: "uppercase",
                    letterSpacing: 1, color: c.textMuted, padding: "4px 8px",
                  }}>
                    Projects
                  </div>
                  {projects.map((p) => (
                    <div key={p.id} onClick={() => pickTarget("project", p.id)} style={{
                      padding: "8px 12px", borderRadius: 8, cursor: "pointer",
                      display: "flex", alignItems: "center", gap: 8,
                      transition: "background 0.1s",
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = c.bgKanban}
                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                    >
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: c[p.color] || c.purple }} />
                      <span style={{ fontSize: 13, color: c.text, fontWeight: 500 }}>{p.name}</span>
                    </div>
                  ))}
                </div>
              )}
              {classes.length > 0 && (
                <div>
                  <div style={{
                    fontSize: 10, fontWeight: 700, textTransform: "uppercase",
                    letterSpacing: 1, color: c.textMuted, padding: "4px 8px",
                  }}>
                    Classes
                  </div>
                  {classes.map((cls) => (
                    <div key={cls.id} onClick={() => pickTarget("class", cls.id)} style={{
                      padding: "8px 12px", borderRadius: 8, cursor: "pointer",
                      display: "flex", alignItems: "center", gap: 8,
                      transition: "background 0.1s",
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = c.bgKanban}
                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                    >
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: c[cls.color] || c.blue }} />
                      <span style={{ fontSize: 13, color: c.text, fontWeight: 500 }}>{cls.name}</span>
                    </div>
                  ))}
                </div>
              )}
              {projects.length === 0 && classes.length === 0 && (
                <div style={{ padding: "16px 12px", color: c.textMuted, fontSize: 12, textAlign: "center" }}>
                  No projects or classes to add to
                </div>
              )}
            </div>
          )}

          {/* Step: Form */}
          {step === "form" && (
            <div style={{ padding: 14 }}>
              <input
                autoFocus
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                onKeyDown={(e) => { if (e.key === "Enter" && formData.title.trim()) save(); }}
                placeholder={target?.type === "project" ? "Task title..." : "Item title..."}
                style={{
                  width: "100%", padding: "10px 12px", fontSize: 13,
                  background: c.bgInput, border: `1px solid ${c.border}`,
                  borderRadius: 8, color: c.text, outline: "none",
                  boxSizing: "border-box", fontFamily: "inherit", marginBottom: 8,
                }}
              />
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Notes (optional)"
                rows={2}
                style={{
                  width: "100%", padding: "8px 12px", fontSize: 12,
                  background: c.bgInput, border: `1px solid ${c.border}`,
                  borderRadius: 8, color: c.text, outline: "none",
                  boxSizing: "border-box", fontFamily: "inherit",
                  resize: "vertical", marginBottom: 10,
                }}
              />
              <button
                onClick={save}
                disabled={!formData.title.trim()}
                style={{
                  width: "100%", padding: "9px 0", borderRadius: 8,
                  fontSize: 13, fontWeight: 700, cursor: "pointer",
                  fontFamily: "inherit", border: "none",
                  background: formData.title.trim() ? c.accent : c.bgKanban,
                  color: formData.title.trim() ? "#fff" : c.textMuted,
                  transition: "all 0.15s",
                }}
              >
                Add {target?.type === "project" ? "Task" : "Item"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* FAB button */}
      <button
        onClick={() => { setIsOpen(!isOpen); setStep("pick"); }}
        style={{
          width: 50, height: 50, borderRadius: "50%",
          background: `linear-gradient(135deg, ${c.accent}, ${c.accentLight || c.accent})`,
          border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: `0 4px 20px ${c.accent}55`,
          color: "#fff", fontSize: 24,
          transition: "transform 0.2s, box-shadow 0.2s",
          transform: isOpen ? "rotate(45deg)" : "none",
        }}
      >
        <Icons.Plus />
      </button>
    </div>
  );
}
