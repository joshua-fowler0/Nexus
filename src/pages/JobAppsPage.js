import React, { useState, useEffect } from "react";
import { v4 as uuid } from "uuid";
import { Icons } from "../components/Icons";
import {
  UrgencyBadge, daysUntil, formatDate,
  Modal, Input, TextArea, Button, ColorPicker,
} from "../components/Shared";
import {
  JOB_PIPELINE_COLUMNS, JOB_AVAILABLE_DOCUMENTS, JOB_COLORS,
} from "../data/jobDefaults";

// Document checklist
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
        <div key={doc.id} style={{ display: "flex", alignItems: "center", gap: 6, padding: compact ? "2px 0" : "3px 0" }}>
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
            fontSize: compact ? 11 : 12, color: doc.done ? c.textMuted : c.textSecondary,
            textDecoration: doc.done ? "line-through" : "none",
            flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {doc.label}
          </span>
          {editable && (
            <button onClick={() => onRemove && onRemove(doc.id)} style={{
              background: "none", border: "none", color: c.textMuted,
              cursor: "pointer", padding: 2, display: "flex", fontSize: 10,
            }}>
              <Icons.X />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

// Document picker for the modal
function DocPicker({ requiredDocs, onChange, c }) {
  const [otherName, setOtherName] = useState("");

  const addDoc = (label) => {
    const addedLabels = new Set(requiredDocs.map((d) => d.label));
    if (addedLabels.has(label)) return;
    onChange([...requiredDocs, { id: uuid(), label, done: false }]);
  };

  const removeDoc = (docId) => onChange(requiredDocs.filter((d) => d.id !== docId));

  const toggleDoc = (docId) =>
    onChange(requiredDocs.map((d) => d.id === docId ? { ...d, done: !d.done } : d));

  const addOther = () => {
    const name = otherName.trim();
    if (!name) return;
    addDoc(name);
    setOtherName("");
  };

  const addedLabels = new Set(requiredDocs.map((d) => d.label));

  return (
    <div>
      {requiredDocs.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <DocChecklist requiredDocs={requiredDocs} onToggle={toggleDoc} onRemove={removeDoc} c={c} editable />
        </div>
      )}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
        {JOB_AVAILABLE_DOCUMENTS.map((doc) => {
          const alreadyAdded = addedLabels.has(doc.label);
          return (
            <button key={doc.id} onClick={() => !alreadyAdded && addDoc(doc.label)} style={{
              padding: "4px 10px", borderRadius: 6, fontSize: 11,
              fontWeight: 600, cursor: alreadyAdded ? "default" : "pointer",
              fontFamily: "inherit",
              border: `1px solid ${c.border}`,
              background: alreadyAdded ? c.bgKanban : "transparent",
              color: alreadyAdded ? c.textMuted : c.textSecondary,
              opacity: alreadyAdded ? 0.5 : 1,
              transition: "all 0.15s",
            }}>
              {alreadyAdded ? "✓ " : "+ "}{doc.label}
            </button>
          );
        })}
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <input
          value={otherName} onChange={(e) => setOtherName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addOther()}
          placeholder="Custom document..."
          style={{
            flex: 1, padding: "6px 10px", fontSize: 12,
            background: c.bgInput, border: `1px solid ${c.border}`,
            borderRadius: 8, color: c.text, outline: "none", fontFamily: "inherit",
          }}
        />
        <Button c={c} onClick={addOther} style={{ padding: "6px 12px", fontSize: 11 }}>
          <Icons.Plus /> Add
        </Button>
      </div>
    </div>
  );
}

// Stage badge
function StageBadge({ stage, c }) {
  const col = JOB_PIPELINE_COLUMNS.find((p) => p.id === stage);
  if (!col) return null;
  const color = c[col.colorKey];
  const bgMap = { blue: c.blueBg, amber: c.amberBg, purple: c.purpleBg, green: c.greenBg };
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, textTransform: "uppercase",
      letterSpacing: 0.8, padding: "3px 8px", borderRadius: 6,
      color, background: bgMap[col.colorKey] || c.bgKanban,
    }}>
      {col.title}
    </span>
  );
}

// Pipeline overview
function PipelineOverview({ jobs, onJobClick, c }) {
  return (
    <div style={{ display: "flex", gap: 16, marginBottom: 28 }}>
      {JOB_PIPELINE_COLUMNS.map((col) => {
        const stageJobs = jobs.filter((j) => j.stage === col.id);
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
              }}>{stageJobs.length}</span>
            </div>
            <div style={{
              display: "flex", flexDirection: "column", gap: 8,
              minHeight: 60, background: c.bgKanban, borderRadius: 10, padding: 8,
            }}>
              {stageJobs.map((job) => {
                const docs = job.requiredDocs || [];
                const docsComplete = docs.filter((d) => d.done).length;
                const docsTotal = docs.length;
                return (
                  <div key={job.id} onClick={() => onJobClick(job.id)} style={{
                    background: c.bgCard, border: `1px solid ${c.borderLight}`,
                    borderRadius: 10, padding: "10px 12px",
                    borderLeft: `3px solid ${c[job.color]}`,
                    cursor: "pointer", transition: "all 0.15s",
                  }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: c.text }}>{job.company}</div>
                    <div style={{ fontSize: 11, color: c.textMuted, marginTop: 2 }}>{job.role}</div>
                    {docsTotal > 0 && (
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
                        <div style={{ flex: 1, background: c.bgKanban, borderRadius: 4, height: 4, overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${(docsComplete / docsTotal) * 100}%`, background: c.green, borderRadius: 4 }} />
                        </div>
                        <span style={{ fontSize: 10, color: c.textMuted, whiteSpace: "nowrap" }}>{docsComplete}/{docsTotal}</span>
                      </div>
                    )}
                    {job.deadline && (
                      <div style={{ marginTop: 6 }}><UrgencyBadge daysLeft={daysUntil(job.deadline)} c={c} /></div>
                    )}
                  </div>
                );
              })}
              {stageJobs.length === 0 && (
                <div style={{ fontSize: 12, color: c.textMuted, textAlign: "center", padding: "16px 0", fontStyle: "italic" }}>
                  No jobs
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Comparison notes — job specific
function ComparisonNotes({ job, c }) {
  const sections = [
    { key: "salary", label: "Salary / Comp", color: c.green, bg: c.greenBg },
    { key: "location", label: "Location", color: c.blue, bg: c.blueBg },
    { key: "culture", label: "Culture", color: c.purple, bg: c.purpleBg },
    { key: "growth", label: "Growth", color: c.amber, bg: c.amberBg },
  ];
  if (!sections.some((s) => job[s.key])) return null;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 12 }}>
      {sections.map((s) => {
        if (!job[s.key]) return null;
        return (
          <div key={s.key} style={{ background: s.bg, borderRadius: 8, padding: "8px 10px" }}>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8, color: s.color, marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontSize: 11, color: c.textSecondary, lineHeight: 1.5 }}>{job[s.key]}</div>
          </div>
        );
      })}
    </div>
  );
}

export default function JobAppsPage({ c, jobApps, onJobAppsChange, pendingOpenItem, onClearPending }) {
  const jobs = jobApps || [];

  const [selectedJobId, setSelectedJobId] = useState(null);
  const [showJobModal, setShowJobModal] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [viewMode, setViewMode] = useState("pipeline");

  const [jobForm, setJobForm] = useState({
    company: "", role: "", color: "blue", deadline: "", stage: "interested",
    notes: "", salary: "", location: "", culture: "", growth: "",
    requiredDocs: [],
  });

  // Stats
  const totalJobs = jobs.length;
  const totalDocsComplete = jobs.reduce(
    (sum, j) => sum + (j.requiredDocs || []).filter((d) => d.done).length, 0
  );
  const totalDocsPossible = jobs.reduce(
    (sum, j) => sum + (j.requiredDocs || []).length, 0
  );
  const nearestDeadline = jobs
    .filter((j) => j.deadline && j.stage !== "offer")
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))[0];

  // Handle pending open item from Home page
  const [pendingJobId, setPendingJobId] = useState(null);

  useEffect(() => {
    if (pendingOpenItem && pendingOpenItem.type === "jobapp") {
      const job = jobs.find((j) => j.id === pendingOpenItem.jobId);
      if (job) {
        setSelectedJobId(job.id);
        setViewMode("detail");
        setPendingJobId(job.id);
      }
      if (onClearPending) onClearPending();
    }
  }, [pendingOpenItem]);

  useEffect(() => {
    if (pendingJobId) {
      const job = jobs.find((j) => j.id === pendingJobId);
      if (job) openEditJob(job);
      setPendingJobId(null);
    }
  }, [pendingJobId]);

  function openNewJob() {
    setEditingJob(null);
    setJobForm({
      company: "", role: "", color: "blue", deadline: "", stage: "interested",
      notes: "", salary: "", location: "", culture: "", growth: "",
      requiredDocs: [],
    });
    setShowJobModal(true);
  }

  function openEditJob(job) {
    setEditingJob(job);
    setJobForm({
      company: job.company, role: job.role, color: job.color,
      deadline: job.deadline || "", stage: job.stage,
      notes: job.notes || "", salary: job.salary || "",
      location: job.location || "", culture: job.culture || "", growth: job.growth || "",
      requiredDocs: [...(job.requiredDocs || [])],
    });
    setShowJobModal(true);
  }

  function saveJob() {
    if (!jobForm.company.trim()) return;
    if (editingJob) {
      onJobAppsChange(jobs.map((j) =>
        j.id === editingJob.id ? { ...j, ...jobForm } : j
      ));
    } else {
      onJobAppsChange([...jobs, { id: uuid(), ...jobForm }]);
    }
    setShowJobModal(false);
  }

  function deleteJob(jobId) {
    if (!window.confirm("Are you sure you want to delete this job application?")) return;
    onJobAppsChange(jobs.filter((j) => j.id !== jobId));
    if (selectedJobId === jobId) setSelectedJobId(null);
  }

  function toggleDoc(jobId, docId) {
    onJobAppsChange(jobs.map((j) => {
      if (j.id !== jobId) return j;
      return {
        ...j,
        requiredDocs: (j.requiredDocs || []).map((d) =>
          d.id === docId ? { ...d, done: !d.done } : d
        ),
      };
    }));
  }

  function updateStage(jobId, newStage) {
    onJobAppsChange(jobs.map((j) =>
      j.id === jobId ? { ...j, stage: newStage } : j
    ));
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: c.text, margin: 0 }}>Jobs</h2>
          <p style={{ fontSize: 13, color: c.textMuted, margin: "4px 0 0" }}>
            {totalJobs} job{totalJobs !== 1 ? "s" : ""}
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
          <Button c={c} onClick={openNewJob}><Icons.Plus /> Add Job</Button>
        </div>
      </div>

      {viewMode === "pipeline" && (
        <PipelineOverview jobs={jobs} onJobClick={(id) => { setSelectedJobId(id); setViewMode("detail"); }} c={c} />
      )}

      {viewMode === "detail" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 28 }}>
          {jobs.map((job) => {
            const docs = job.requiredDocs || [];
            const docsComplete = docs.filter((d) => d.done).length;
            const docsTotal = docs.length;
            const days = job.deadline ? daysUntil(job.deadline) : null;
            const isSelected = selectedJobId === job.id;

            return (
              <div key={job.id} onClick={() => setSelectedJobId(isSelected ? null : job.id)} style={{
                background: c.bgCard, border: `1px solid ${isSelected ? c.accent : c.border}`,
                borderRadius: 14, padding: 20, cursor: "pointer", transition: "all 0.15s",
                boxShadow: isSelected ? `0 0 0 1px ${c.accent}` : "none",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 10, height: 10, borderRadius: "50%", background: c[job.color] }} />
                      <div style={{ fontSize: 16, fontWeight: 700, color: c.text }}>{job.company}</div>
                    </div>
                    <div style={{ fontSize: 12, color: c.textMuted, marginTop: 2, marginLeft: 18 }}>
                      {job.role}{job.deadline && ` · Deadline: ${formatDate(job.deadline)}`}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <StageBadge stage={job.stage} c={c} />
                    <button onClick={(e) => { e.stopPropagation(); openEditJob(job); }} style={{ background: "none", border: "none", color: c.textMuted, cursor: "pointer", padding: 4, display: "flex" }}><Icons.Edit /></button>
                    <button onClick={(e) => { e.stopPropagation(); deleteJob(job.id); }} style={{ background: "none", border: "none", color: c.textMuted, cursor: "pointer", padding: 4, display: "flex" }}><Icons.Trash /></button>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 4, marginBottom: 14 }}>
                  {JOB_PIPELINE_COLUMNS.map((col) => (
                    <button key={col.id} onClick={(e) => { e.stopPropagation(); updateStage(job.id, col.id); }} style={{
                      flex: 1, padding: "5px 0", borderRadius: 6, fontSize: 10,
                      fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                      border: job.stage === col.id ? `1.5px solid ${c[col.colorKey]}` : `1px solid ${c.border}`,
                      background: job.stage === col.id ? c.bgKanban : "transparent",
                      color: job.stage === col.id ? c[col.colorKey] : c.textMuted,
                      transition: "all 0.15s", textTransform: "uppercase", letterSpacing: 0.5,
                    }}>{col.title}</button>
                  ))}
                </div>

                {days !== null && <div style={{ marginBottom: 12 }}><UrgencyBadge daysLeft={days} c={c} /></div>}

                {docsTotal > 0 && (
                  <>
                    <div style={{ fontSize: 12, fontWeight: 600, color: c.textSecondary, marginBottom: 8 }}>
                      Documents ({docsComplete}/{docsTotal})
                    </div>
                    <div style={{ marginBottom: 4 }}>
                      <DocChecklist requiredDocs={docs} onToggle={(docId) => toggleDoc(job.id, docId)} c={c} compact={!isSelected} />
                    </div>
                  </>
                )}
                {docsTotal === 0 && (
                  <div style={{ fontSize: 12, color: c.textMuted, fontStyle: "italic", marginBottom: 4 }}>
                    No documents configured — edit to add requirements
                  </div>
                )}

                {job.notes && (
                  <div style={{
                    fontSize: 12, color: c.textSecondary, background: c.bgKanban,
                    borderRadius: 8, padding: "8px 12px", lineHeight: 1.5,
                    fontStyle: "italic", marginTop: 12,
                  }}>{job.notes}</div>
                )}

                {isSelected && <ComparisonNotes job={job} c={c} />}
              </div>
            );
          })}
          {jobs.length === 0 && (
            <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "40px 20px", color: c.textMuted, fontSize: 14 }}>
              No jobs yet. Click "Add Job" to start tracking applications!
            </div>
          )}
        </div>
      )}

      {/* Job Modal */}
      <Modal isOpen={showJobModal} onClose={() => setShowJobModal(false)}
        title={editingJob ? "Edit Job" : "Add Job"} c={c} width={580}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Input label="Company" c={c} value={jobForm.company}
            onChange={(e) => setJobForm({ ...jobForm, company: e.target.value })} placeholder="e.g. Google" />
          <Input label="Role" c={c} value={jobForm.role}
            onChange={(e) => setJobForm({ ...jobForm, role: e.target.value })} placeholder="e.g. Software Engineer" />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Input label="Deadline" c={c} type="date" value={jobForm.deadline}
            onChange={(e) => setJobForm({ ...jobForm, deadline: e.target.value })} />
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: c.textSecondary, marginBottom: 6 }}>Stage</label>
            <select value={jobForm.stage} onChange={(e) => setJobForm({ ...jobForm, stage: e.target.value })}
              style={{ width: "100%", padding: "10px 14px", fontSize: 14, background: c.bgInput, border: `1px solid ${c.border}`, borderRadius: 10, color: c.text, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}>
              {JOB_PIPELINE_COLUMNS.map((col) => (
                <option key={col.id} value={col.id}>{col.title}</option>
              ))}
            </select>
          </div>
        </div>

        <ColorPicker value={jobForm.color} onChange={(color) => setJobForm({ ...jobForm, color })} colors={JOB_COLORS} c={c} />

        <TextArea label="Notes" c={c} value={jobForm.notes}
          onChange={(e) => setJobForm({ ...jobForm, notes: e.target.value })}
          placeholder="General notes about this role..." />

        <div style={{ fontSize: 13, fontWeight: 700, color: c.text, marginBottom: 10, marginTop: 4 }}>Comparison Notes</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <TextArea label="Salary / Comp" c={c} value={jobForm.salary} onChange={(e) => setJobForm({ ...jobForm, salary: e.target.value })} placeholder="Compensation details..." style={{ minHeight: 60 }} />
          <TextArea label="Location" c={c} value={jobForm.location} onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })} placeholder="Office, remote, hybrid..." style={{ minHeight: 60 }} />
          <TextArea label="Culture" c={c} value={jobForm.culture} onChange={(e) => setJobForm({ ...jobForm, culture: e.target.value })} placeholder="Team culture, values..." style={{ minHeight: 60 }} />
          <TextArea label="Growth" c={c} value={jobForm.growth} onChange={(e) => setJobForm({ ...jobForm, growth: e.target.value })} placeholder="Career growth path..." style={{ minHeight: 60 }} />
        </div>

        <div style={{ fontSize: 13, fontWeight: 700, color: c.text, marginBottom: 10, marginTop: 4 }}>Required Documents</div>
        <div style={{ background: c.bgKanban, borderRadius: 10, padding: 14, marginBottom: 16 }}>
          <DocPicker requiredDocs={jobForm.requiredDocs} onChange={(newDocs) => setJobForm({ ...jobForm, requiredDocs: newDocs })} c={c} />
        </div>

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
          <Button variant="secondary" c={c} onClick={() => setShowJobModal(false)}>Cancel</Button>
          <Button c={c} onClick={saveJob}>{editingJob ? "Save Changes" : "Add Job"}</Button>
        </div>
      </Modal>
    </div>
  );
}
