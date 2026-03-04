import React, { useState, useEffect } from "react";
import { v4 as uuid } from "uuid";
import { Icons } from "../components/Icons";
import {
  UrgencyBadge, daysUntil, formatDate,
  Modal, Input, TextArea, Button, ColorPicker,
} from "../components/Shared";
import {
  GRAD_PIPELINE_COLUMNS, AVAILABLE_DOCUMENTS, SCHOOL_COLORS,
} from "../data/gradDefaults";

// Helper: migrate old docs format ({ sop: true, lor1: false }) to new requiredDocs array
function migrateDocs(school) {
  if (school.requiredDocs) return school;
  if (!school.docs) return { ...school, requiredDocs: [] };
  const requiredDocs = Object.entries(school.docs)
    .filter(([_, included]) => included !== undefined)
    .map(([key, done]) => {
      const avail = AVAILABLE_DOCUMENTS.find((d) => d.id === key);
      return { id: uuid(), label: avail ? avail.label : key, done: !!done };
    });
  const { docs, ...rest } = school;
  return { ...rest, requiredDocs };
}

// Document checklist — renders a school's requiredDocs
function DocChecklist({ requiredDocs, onToggle, onRemove, c, compact = false, editable = false }) {
  if (!requiredDocs || requiredDocs.length === 0) {
    return (
      <div style={{ fontSize: 12, color: c.textMuted, fontStyle: "italic", padding: "4px 0" }}>
        No required documents
      </div>
    );
  }
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: compact ? "1fr 1fr" : "1fr 1fr 1fr",
      gap: compact ? 4 : 6,
    }}>
      {requiredDocs.map((doc) => (
        <div
          key={doc.id}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: compact ? "2px 0" : "3px 0",
          }}
        >
          <div
            onClick={() => onToggle && onToggle(doc.id)}
            style={{
              width: 18, height: 18, borderRadius: 5, flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: doc.done ? c.greenBg : c.bgKanban,
              border: `1.5px solid ${doc.done ? c.green : c.border}`,
              color: c.green, transition: "all 0.15s",
              cursor: onToggle ? "pointer" : "default",
            }}
          >
            {doc.done && <Icons.Check />}
          </div>
          <span style={{
            fontSize: compact ? 10 : 11, flex: 1,
            color: doc.done ? c.textSecondary : c.textMuted,
          }}>
            {doc.label}
          </span>
          {editable && onRemove && (
            <button
              onClick={() => onRemove(doc.id)}
              style={{
                background: "none", border: "none", color: c.textMuted,
                cursor: "pointer", padding: 1, display: "flex", opacity: 0.6,
              }}
            >
              <Icons.X />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

// Document picker for the modal — lets you add from the master list + custom Other
function DocPicker({ requiredDocs, onChange, c }) {
  const [otherName, setOtherName] = useState("");

  // Which master docs are already added?
  const addedLabels = new Set(requiredDocs.map((d) => d.label));

  function addDoc(label) {
    onChange([...requiredDocs, { id: uuid(), label, done: false }]);
  }

  function removeDoc(docId) {
    onChange(requiredDocs.filter((d) => d.id !== docId));
  }

  function toggleDoc(docId) {
    onChange(requiredDocs.map((d) =>
      d.id === docId ? { ...d, done: !d.done } : d
    ));
  }

  function addOther() {
    const name = otherName.trim();
    if (!name) return;
    onChange([...requiredDocs, { id: uuid(), label: name, done: false }]);
    setOtherName("");
  }

  return (
    <div>
      {/* Current required docs with remove buttons */}
      <div style={{ marginBottom: 14 }}>
        <div style={{
          fontSize: 12, fontWeight: 600, color: c.textSecondary, marginBottom: 8,
        }}>
          Required Documents ({requiredDocs.length})
        </div>
        {requiredDocs.length === 0 ? (
          <div style={{ fontSize: 12, color: c.textMuted, fontStyle: "italic", padding: "4px 0" }}>
            No documents added yet — select from the list below
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {requiredDocs.map((doc) => (
              <div key={doc.id} style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "6px 10px", background: c.bgKanban,
                borderRadius: 8,
              }}>
                <div
                  onClick={() => toggleDoc(doc.id)}
                  style={{
                    width: 18, height: 18, borderRadius: 5, flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: doc.done ? c.greenBg : c.bgCard,
                    border: `1.5px solid ${doc.done ? c.green : c.border}`,
                    color: c.green, cursor: "pointer",
                  }}
                >
                  {doc.done && <Icons.Check />}
                </div>
                <span style={{ fontSize: 12, color: c.text, flex: 1 }}>{doc.label}</span>
                <button
                  onClick={() => removeDoc(doc.id)}
                  style={{
                    background: "none", border: "none", color: c.textMuted,
                    cursor: "pointer", padding: 2, display: "flex",
                  }}
                >
                  <Icons.Trash />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add from master list */}
      <div style={{
        fontSize: 12, fontWeight: 600, color: c.textSecondary, marginBottom: 8,
      }}>
        Add Documents
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
        {AVAILABLE_DOCUMENTS.map((doc) => {
          const alreadyAdded = addedLabels.has(doc.label);
          return (
            <button
              key={doc.id}
              onClick={() => !alreadyAdded && addDoc(doc.label)}
              disabled={alreadyAdded}
              style={{
                padding: "5px 12px", borderRadius: 8, fontSize: 11,
                fontWeight: 600, cursor: alreadyAdded ? "default" : "pointer",
                fontFamily: "inherit",
                border: `1px solid ${alreadyAdded ? c.border : c.accent}`,
                background: alreadyAdded ? c.bgKanban : "transparent",
                color: alreadyAdded ? c.textMuted : c.accentLight,
                opacity: alreadyAdded ? 0.5 : 1,
                transition: "all 0.15s",
              }}
            >
              {alreadyAdded ? "✓ " : "+ "}{doc.label}
            </button>
          );
        })}
      </div>

      {/* Add custom Other */}
      <div style={{
        display: "flex", gap: 8, alignItems: "flex-end",
      }}>
        <div style={{ flex: 1 }}>
          <label style={{
            display: "block", fontSize: 11, fontWeight: 600,
            color: c.textSecondary, marginBottom: 4,
          }}>
            Other (custom document)
          </label>
          <input
            value={otherName}
            onChange={(e) => setOtherName(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") addOther(); }}
            placeholder="e.g. Video Essay, Research Proposal..."
            style={{
              width: "100%", padding: "8px 12px", fontSize: 13,
              background: c.bgInput, border: `1px solid ${c.border}`,
              borderRadius: 8, color: c.text, outline: "none",
              boxSizing: "border-box", fontFamily: "inherit",
            }}
          />
        </div>
        <button
          onClick={addOther}
          style={{
            padding: "8px 16px", borderRadius: 8, fontSize: 12,
            fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
            border: `1px solid ${c.accent}`, background: c.accentGlow,
            color: c.accentLight, marginBottom: 0, height: 37,
            display: "flex", alignItems: "center", gap: 4,
          }}
        >
          <Icons.Plus /> Add
        </button>
      </div>
    </div>
  );
}

// Stage badge
function StageBadge({ stage, c }) {
  const col = GRAD_PIPELINE_COLUMNS.find((p) => p.id === stage);
  if (!col) return null;
  const color = c[col.colorKey];
  const bgMap = { blue: c.blueBg, amber: c.amberBg, purple: c.purpleBg, green: c.greenBg };
  return (
    <span style={{
      fontSize: 11, fontWeight: 600, color,
      background: bgMap[col.colorKey] || c.bgKanban,
      padding: "3px 10px", borderRadius: 10, textTransform: "capitalize",
    }}>
      {col.title}
    </span>
  );
}

// Pipeline overview
function PipelineOverview({ schools, onSchoolClick, c }) {
  return (
    <div style={{ display: "flex", gap: 16, marginBottom: 28 }}>
      {GRAD_PIPELINE_COLUMNS.map((col) => {
        const stageSchools = schools.filter((s) => s.stage === col.id);
        const color = c[col.colorKey];
        return (
          <div key={col.id} style={{ flex: 1, minWidth: 140 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: color }} />
              <span style={{
                fontSize: 12, fontWeight: 700, textTransform: "uppercase",
                letterSpacing: 1.2, color: c.textSecondary,
              }}>{col.title}</span>
              <span style={{
                fontSize: 11, fontWeight: 600, color: c.textMuted,
                background: c.bgKanban, borderRadius: 8, padding: "1px 7px",
              }}>{stageSchools.length}</span>
            </div>
            <div style={{
              display: "flex", flexDirection: "column", gap: 8,
              minHeight: 60, background: c.bgKanban, borderRadius: 10, padding: 8,
            }}>
              {stageSchools.map((school) => {
                const docs = school.requiredDocs || [];
                const docsComplete = docs.filter((d) => d.done).length;
                const docsTotal = docs.length;
                return (
                  <div key={school.id} onClick={() => onSchoolClick(school.id)} style={{
                    background: c.bgCard, border: `1px solid ${c.borderLight}`,
                    borderRadius: 10, padding: "10px 12px",
                    borderLeft: `3px solid ${c[school.color]}`,
                    cursor: "pointer", transition: "all 0.15s",
                  }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: c.text }}>{school.name}</div>
                    <div style={{ fontSize: 11, color: c.textMuted, marginTop: 2 }}>{school.program}</div>
                    {docsTotal > 0 && (
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
                        <div style={{ flex: 1, background: c.bgKanban, borderRadius: 4, height: 4, overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${(docsComplete / docsTotal) * 100}%`, background: c.green, borderRadius: 4 }} />
                        </div>
                        <span style={{ fontSize: 10, color: c.textMuted, whiteSpace: "nowrap" }}>{docsComplete}/{docsTotal}</span>
                      </div>
                    )}
                    {school.deadline && (
                      <div style={{ marginTop: 6 }}><UrgencyBadge daysLeft={daysUntil(school.deadline)} c={c} /></div>
                    )}
                  </div>
                );
              })}
              {stageSchools.length === 0 && (
                <div style={{ fontSize: 12, color: c.textMuted, textAlign: "center", padding: "16px 0", fontStyle: "italic" }}>
                  No schools
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Comparison notes
function ComparisonNotes({ school, c }) {
  const sections = [
    { key: "pros", label: "Pros", color: c.green, bg: c.greenBg },
    { key: "cons", label: "Cons", color: c.red, bg: c.redBg },
    { key: "fit", label: "Fit", color: c.blue, bg: c.blueBg },
    { key: "funding", label: "Funding", color: c.amber, bg: c.amberBg },
  ];
  if (!sections.some((s) => school[s.key])) return null;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 12 }}>
      {sections.map((s) => {
        if (!school[s.key]) return null;
        return (
          <div key={s.key} style={{ background: s.bg, borderRadius: 8, padding: "8px 10px" }}>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8, color: s.color, marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontSize: 11, color: c.textSecondary, lineHeight: 1.5 }}>{school[s.key]}</div>
          </div>
        );
      })}
    </div>
  );
}

export default function GradAppsPage({ c, gradApps, onGradAppsChange, pendingOpenItem, onClearPending }) {
  // Migrate any old-format schools on first render
  const schools = gradApps.map(migrateDocs);
  if (schools.some((s, i) => s !== gradApps[i])) {
    // Trigger a one-time migration save
    setTimeout(() => onGradAppsChange(schools), 0);
  }

  const [selectedSchoolId, setSelectedSchoolId] = useState(null);
  const [showSchoolModal, setShowSchoolModal] = useState(false);
  const [editingSchool, setEditingSchool] = useState(null);
  const [viewMode, setViewMode] = useState("pipeline");

  const [schoolForm, setSchoolForm] = useState({
    name: "", program: "", color: "blue", deadline: "", stage: "researching",
    notes: "", pros: "", cons: "", fit: "", funding: "",
    requiredDocs: [],
  });

  // Stats
  const totalSchools = schools.length;
  const totalDocsComplete = schools.reduce(
    (sum, s) => sum + (s.requiredDocs || []).filter((d) => d.done).length, 0
  );
  const totalDocsPossible = schools.reduce(
    (sum, s) => sum + (s.requiredDocs || []).length, 0
  );
  const nearestDeadline = schools
    .filter((s) => s.deadline && s.stage !== "decision")
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))[0];

  // CRUD
  // Handle pending open item from Home page
  const [pendingSchoolId, setPendingSchoolId] = useState(null);

  useEffect(() => {
    if (pendingOpenItem && pendingOpenItem.type === "gradapp") {
      const school = schools.find((s) => s.id === pendingOpenItem.schoolId);
      if (school) {
        setSelectedSchoolId(school.id);
        setViewMode("detail");
        setPendingSchoolId(school.id);
      }
      if (onClearPending) onClearPending();
    }
  }, [pendingOpenItem]);

  useEffect(() => {
    if (pendingSchoolId) {
      const school = schools.find((s) => s.id === pendingSchoolId);
      if (school) openEditSchool(school);
      setPendingSchoolId(null);
    }
  }, [pendingSchoolId]);

  function openNewSchool() {
    setEditingSchool(null);
    setSchoolForm({
      name: "", program: "", color: "blue", deadline: "", stage: "researching",
      notes: "", pros: "", cons: "", fit: "", funding: "",
      requiredDocs: [],
    });
    setShowSchoolModal(true);
  }

  function openEditSchool(school) {
    setEditingSchool(school);
    setSchoolForm({
      name: school.name, program: school.program, color: school.color,
      deadline: school.deadline || "", stage: school.stage,
      notes: school.notes || "", pros: school.pros || "",
      cons: school.cons || "", fit: school.fit || "", funding: school.funding || "",
      requiredDocs: [...(school.requiredDocs || [])],
    });
    setShowSchoolModal(true);
  }

  function saveSchool() {
    if (!schoolForm.name.trim()) return;
    if (editingSchool) {
      onGradAppsChange(schools.map((s) =>
        s.id === editingSchool.id ? { ...s, ...schoolForm } : s
      ));
    } else {
      onGradAppsChange([...schools, { id: uuid(), ...schoolForm }]);
    }
    setShowSchoolModal(false);
  }

  function deleteSchool(schoolId) {
    if (!window.confirm("Are you sure you want to delete this school?")) return;
    onGradAppsChange(schools.filter((s) => s.id !== schoolId));
    if (selectedSchoolId === schoolId) setSelectedSchoolId(null);
  }

  function toggleDoc(schoolId, docId) {
    onGradAppsChange(schools.map((s) => {
      if (s.id !== schoolId) return s;
      return {
        ...s,
        requiredDocs: (s.requiredDocs || []).map((d) =>
          d.id === docId ? { ...d, done: !d.done } : d
        ),
      };
    }));
  }

  function updateStage(schoolId, newStage) {
    onGradAppsChange(schools.map((s) =>
      s.id === schoolId ? { ...s, stage: newStage } : s
    ));
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: c.text, margin: 0 }}>Schools</h2>
          <p style={{ fontSize: 13, color: c.textMuted, margin: "4px 0 0" }}>
            {totalSchools} school{totalSchools !== 1 ? "s" : ""}
            {totalDocsPossible > 0 && <span> · {totalDocsComplete}/{totalDocsPossible} documents ready</span>}
            {nearestDeadline && <span style={{ color: c.amber }}> · Next deadline: {formatDate(nearestDeadline.deadline)}</span>}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ display: "flex", background: c.bgKanban, borderRadius: 8, border: `1px solid ${c.border}`, overflow: "hidden" }}>
            {["pipeline", "detail"].map((mode) => (
              <button key={mode} onClick={() => setViewMode(mode)} style={{
                padding: "6px 14px", fontSize: 12, fontWeight: 600,
                border: "none", cursor: "pointer", fontFamily: "inherit",
                background: viewMode === mode ? c.accentGlow : "transparent",
                color: viewMode === mode ? c.accentLight : c.textMuted,
                transition: "all 0.15s", textTransform: "capitalize",
              }}>
                {mode === "pipeline" ? "Pipeline" : "Details"}
              </button>
            ))}
          </div>
          <Button c={c} onClick={openNewSchool}><Icons.Plus /> Add School</Button>
        </div>
      </div>

      {/* Pipeline View */}
      {viewMode === "pipeline" && (
        <PipelineOverview schools={schools} onSchoolClick={(id) => { setSelectedSchoolId(id); setViewMode("detail"); }} c={c} />
      )}

      {/* Detail View */}
      {viewMode === "detail" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 28 }}>
          {schools.map((school) => {
            const docs = school.requiredDocs || [];
            const docsComplete = docs.filter((d) => d.done).length;
            const docsTotal = docs.length;
            const days = school.deadline ? daysUntil(school.deadline) : null;
            const isSelected = selectedSchoolId === school.id;

            return (
              <div key={school.id} onClick={() => setSelectedSchoolId(isSelected ? null : school.id)} style={{
                background: c.bgCard, border: `1px solid ${isSelected ? c.accent : c.border}`,
                borderRadius: 14, padding: 20, cursor: "pointer", transition: "all 0.15s",
                boxShadow: isSelected ? `0 0 0 1px ${c.accent}` : "none",
              }}>
                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 10, height: 10, borderRadius: "50%", background: c[school.color] }} />
                      <div style={{ fontSize: 16, fontWeight: 700, color: c.text }}>{school.name}</div>
                    </div>
                    <div style={{ fontSize: 12, color: c.textMuted, marginTop: 2, marginLeft: 18 }}>
                      {school.program}{school.deadline && ` · Deadline: ${formatDate(school.deadline)}`}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <StageBadge stage={school.stage} c={c} />
                    <button onClick={(e) => { e.stopPropagation(); openEditSchool(school); }} style={{ background: "none", border: "none", color: c.textMuted, cursor: "pointer", padding: 4, display: "flex" }}><Icons.Edit /></button>
                    <button onClick={(e) => { e.stopPropagation(); deleteSchool(school.id); }} style={{ background: "none", border: "none", color: c.textMuted, cursor: "pointer", padding: 4, display: "flex" }}><Icons.Trash /></button>
                  </div>
                </div>

                {/* Stage selector */}
                <div style={{ display: "flex", gap: 4, marginBottom: 14 }}>
                  {GRAD_PIPELINE_COLUMNS.map((col) => (
                    <button key={col.id} onClick={(e) => { e.stopPropagation(); updateStage(school.id, col.id); }} style={{
                      flex: 1, padding: "5px 0", borderRadius: 6, fontSize: 10,
                      fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                      border: school.stage === col.id ? `1.5px solid ${c[col.colorKey]}` : `1px solid ${c.border}`,
                      background: school.stage === col.id ? c.bgKanban : "transparent",
                      color: school.stage === col.id ? c[col.colorKey] : c.textMuted,
                      transition: "all 0.15s", textTransform: "uppercase", letterSpacing: 0.5,
                    }}>{col.title}</button>
                  ))}
                </div>

                {days !== null && <div style={{ marginBottom: 12 }}><UrgencyBadge daysLeft={days} c={c} /></div>}

                {/* Document Checklist */}
                {docsTotal > 0 && (
                  <>
                    <div style={{ fontSize: 12, fontWeight: 600, color: c.textSecondary, marginBottom: 8 }}>
                      Documents ({docsComplete}/{docsTotal})
                    </div>
                    <div style={{ marginBottom: 4 }}>
                      <DocChecklist
                        requiredDocs={docs}
                        onToggle={(docId) => toggleDoc(school.id, docId)}
                        c={c}
                        compact={!isSelected}
                      />
                    </div>
                  </>
                )}
                {docsTotal === 0 && (
                  <div style={{ fontSize: 12, color: c.textMuted, fontStyle: "italic", marginBottom: 4 }}>
                    No documents configured — edit to add requirements
                  </div>
                )}

                {school.notes && (
                  <div style={{
                    fontSize: 12, color: c.textSecondary, background: c.bgKanban,
                    borderRadius: 8, padding: "8px 12px", lineHeight: 1.5,
                    fontStyle: "italic", marginTop: 12,
                  }}>{school.notes}</div>
                )}

                {isSelected && <ComparisonNotes school={school} c={c} />}
              </div>
            );
          })}
          {schools.length === 0 && (
            <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "40px 20px", color: c.textMuted, fontSize: 14 }}>
              No schools yet. Click "Add School" to start tracking applications!
            </div>
          )}
        </div>
      )}

      {/* School Modal */}
      <Modal isOpen={showSchoolModal} onClose={() => setShowSchoolModal(false)}
        title={editingSchool ? "Edit School" : "Add School"} c={c} width={580}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Input label="School Name" c={c} value={schoolForm.name}
            onChange={(e) => setSchoolForm({ ...schoolForm, name: e.target.value })} placeholder="e.g. MIT" />
          <Input label="Program" c={c} value={schoolForm.program}
            onChange={(e) => setSchoolForm({ ...schoolForm, program: e.target.value })} placeholder="e.g. CS PhD" />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Input label="Deadline" c={c} type="date" value={schoolForm.deadline}
            onChange={(e) => setSchoolForm({ ...schoolForm, deadline: e.target.value })} />
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: c.textSecondary, marginBottom: 6 }}>Stage</label>
            <select value={schoolForm.stage} onChange={(e) => setSchoolForm({ ...schoolForm, stage: e.target.value })}
              style={{ width: "100%", padding: "10px 14px", fontSize: 14, background: c.bgInput, border: `1px solid ${c.border}`, borderRadius: 10, color: c.text, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}>
              {GRAD_PIPELINE_COLUMNS.map((col) => (
                <option key={col.id} value={col.id}>{col.title}</option>
              ))}
            </select>
          </div>
        </div>

        <ColorPicker value={schoolForm.color} onChange={(color) => setSchoolForm({ ...schoolForm, color })} colors={SCHOOL_COLORS} c={c} />

        <TextArea label="Notes" c={c} value={schoolForm.notes}
          onChange={(e) => setSchoolForm({ ...schoolForm, notes: e.target.value })}
          placeholder="General notes about this school..." />

        <div style={{ fontSize: 13, fontWeight: 700, color: c.text, marginBottom: 10, marginTop: 4 }}>Comparison Notes</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <TextArea label="Pros" c={c} value={schoolForm.pros} onChange={(e) => setSchoolForm({ ...schoolForm, pros: e.target.value })} placeholder="Strengths..." style={{ minHeight: 60 }} />
          <TextArea label="Cons" c={c} value={schoolForm.cons} onChange={(e) => setSchoolForm({ ...schoolForm, cons: e.target.value })} placeholder="Drawbacks..." style={{ minHeight: 60 }} />
          <TextArea label="Fit" c={c} value={schoolForm.fit} onChange={(e) => setSchoolForm({ ...schoolForm, fit: e.target.value })} placeholder="How well does this match?" style={{ minHeight: 60 }} />
          <TextArea label="Funding" c={c} value={schoolForm.funding} onChange={(e) => setSchoolForm({ ...schoolForm, funding: e.target.value })} placeholder="Funding details..." style={{ minHeight: 60 }} />
        </div>

        {/* Document Picker */}
        <div style={{ fontSize: 13, fontWeight: 700, color: c.text, marginBottom: 10, marginTop: 4 }}>Required Documents</div>
        <div style={{ background: c.bgKanban, borderRadius: 10, padding: 14, marginBottom: 16 }}>
          <DocPicker
            requiredDocs={schoolForm.requiredDocs}
            onChange={(newDocs) => setSchoolForm({ ...schoolForm, requiredDocs: newDocs })}
            c={c}
          />
        </div>

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
          <Button variant="secondary" c={c} onClick={() => setShowSchoolModal(false)}>Cancel</Button>
          <Button c={c} onClick={saveSchool}>{editingSchool ? "Save Changes" : "Add School"}</Button>
        </div>
      </Modal>
    </div>
  );
}
