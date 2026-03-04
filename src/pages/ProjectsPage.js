import React, { useState, useEffect } from "react";
import { v4 as uuid } from "uuid";
import { Icons } from "../components/Icons";
import {
  UrgencyBadge, daysUntil, formatDate,
  Modal, Input, TextArea, Button, ColorPicker,
} from "../components/Shared";
import KanbanBoard from "../components/KanbanBoard";
import { KANBAN_COLUMNS, PROJECT_COLORS } from "../data/defaults";

export default function ProjectsPage({ c, projects, onProjectsChange, pendingOpenItem, onClearPending, settings = {} }) {
  const [selectedProject, setSelectedProject] = useState(null);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [newTaskColumn, setNewTaskColumn] = useState("todo");
  const [showArchived, setShowArchived] = useState(false);

  // Project form state
  const [projectForm, setProjectForm] = useState({
    name: "", deadline: "", color: "purple", notes: "", links: "",
  });

  // Task form state
  const [taskForm, setTaskForm] = useState({ title: "", subtitle: "", notes: "" });

  // ---- Project CRUD ----
  function openNewProject() {
    setEditingProject(null);
    setProjectForm({ name: "", deadline: "", color: "purple", notes: "", links: "" });
    setShowProjectModal(true);
  }

  function openEditProject(proj) {
    setEditingProject(proj);
    setProjectForm({
      name: proj.name,
      deadline: proj.deadline,
      color: proj.color,
      notes: proj.notes || "",
      links: proj.links || "",
    });
    setShowProjectModal(true);
  }

  function saveProject() {
    if (!projectForm.name.trim()) return;
    if (editingProject) {
      const updated = projects.map((p) =>
        p.id === editingProject.id ? { ...p, ...projectForm } : p
      );
      onProjectsChange(updated);
      if (selectedProject?.id === editingProject.id) {
        setSelectedProject({ ...selectedProject, ...projectForm });
      }
    } else {
      const newProj = {
        id: uuid(),
        ...projectForm,
        tasks: [],
      };
      onProjectsChange([...projects, newProj]);
    }
    setShowProjectModal(false);
  }

  function deleteProject(projId) {
    onProjectsChange(projects.filter((p) => p.id !== projId));
    if (selectedProject?.id === projId) setSelectedProject(null);
  }

  function toggleArchiveProject(projId) {
    const updated = projects.map((p) =>
      p.id === projId ? { ...p, archived: !p.archived } : p
    );
    onProjectsChange(updated);
    if (selectedProject?.id === projId) setSelectedProject(null);
  }

  // ---- Task CRUD ----
  function openNewTask(column) {
    setEditingTask(null);
    setNewTaskColumn(column);
    setTaskForm({ title: "", subtitle: "", notes: "" });
    setShowTaskModal(true);
  }

  function openEditTask(task) {
    setEditingTask(task);
    setTaskForm({
      title: task.title, subtitle: task.subtitle || "",
      notes: task.notes || "", column: task.column || "todo",
    });
    setShowTaskModal(true);
  }

  function saveTask() {
    if (!taskForm.title.trim() || !selectedProject) return;
    const updated = projects.map((p) => {
      if (p.id !== selectedProject.id) return p;
      if (editingTask) {
        return {
          ...p,
          tasks: p.tasks.map((t) =>
            t.id === editingTask.id ? { ...t, ...taskForm } : t
          ),
        };
      } else {
        const { column: _col, ...formWithoutColumn } = taskForm;
        return {
          ...p,
          tasks: [...p.tasks, { id: uuid(), ...formWithoutColumn, column: newTaskColumn }],
        };
      }
    });
    onProjectsChange(updated);
    // Update local selected project reference
    setSelectedProject(updated.find((p) => p.id === selectedProject.id));
    setShowTaskModal(false);
  }

  function deleteTask(taskId) {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    const updated = projects.map((p) => {
      if (p.id !== selectedProject.id) return p;
      return { ...p, tasks: p.tasks.filter((t) => t.id !== taskId) };
    });
    onProjectsChange(updated);
    setSelectedProject(updated.find((p) => p.id === selectedProject.id));
  }

  function handleTasksReorder(newTasks) {
    const updated = projects.map((p) => {
      if (p.id !== selectedProject.id) return p;
      return { ...p, tasks: newTasks };
    });
    onProjectsChange(updated);
    setSelectedProject(updated.find((p) => p.id === selectedProject.id));
  }

  // Handle pending open item from Home page
  useEffect(() => {
    if (pendingOpenItem && pendingOpenItem.type === "project") {
      const proj = projects.find((p) => p.id === pendingOpenItem.projectId);
      if (proj) {
        setSelectedProject(proj);
      }
      if (onClearPending) onClearPending();
    }
  }, [pendingOpenItem]);

  // Get live project data
  const currentProject = selectedProject
    ? projects.find((p) => p.id === selectedProject.id)
    : null;

  const activeProjects = projects.filter((p) => !p.archived);
  const archivedProjects = projects.filter((p) => p.archived);
  const displayedProjects = showArchived ? archivedProjects : activeProjects;

  return (
    <div>
      <div style={{
        display: "flex", justifyContent: "space-between",
        alignItems: "center", marginBottom: 24,
      }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: c.text, margin: 0 }}>Projects</h2>
          <p style={{ fontSize: 13, color: c.textMuted, margin: "4px 0 0" }}>
            {activeProjects.length} active{archivedProjects.length > 0 ? ` · ${archivedProjects.length} archived` : ""}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {archivedProjects.length > 0 && (
            <button
              onClick={() => { setShowArchived(!showArchived); setSelectedProject(null); }}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "7px 14px", borderRadius: 8, fontSize: 12,
                fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                border: showArchived ? `1.5px solid ${c.accent}` : `1px solid ${c.border}`,
                background: showArchived ? c.accentGlow : "transparent",
                color: showArchived ? c.accentLight : c.textMuted,
                transition: "all 0.15s",
              }}
            >
              <Icons.Archive /> {showArchived ? "Active" : "Archived"}
            </button>
          )}
          <Button c={c} onClick={openNewProject}>
            <Icons.Plus /> New Project
          </Button>
        </div>
      </div>

      {/* Project Cards Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 28 }}>
        {displayedProjects.map((p) => {
          const totalTasks = p.tasks.length;
          const doneTasks = p.tasks.filter((t) => t.column === "done").length;
          const days = daysUntil(p.deadline);
          const isSelected = currentProject?.id === p.id;

          return (
            <div
              key={p.id}
              onClick={() => setSelectedProject(p)}
              style={{
                background: c.bgCard,
                border: `1px solid ${isSelected ? c.accent : c.border}`,
                borderRadius: 14,
                padding: 20,
                cursor: "pointer",
                transition: "all 0.15s",
                boxShadow: isSelected ? `0 0 0 1px ${c.accent}` : "none",
              }}
            >
              <div style={{
                display: "flex", justifyContent: "space-between",
                alignItems: "flex-start", marginBottom: 14,
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{
                    display: "flex", alignItems: "center", gap: 8,
                  }}>
                    <div style={{
                      width: 10, height: 10, borderRadius: "50%",
                      background: c[p.color], flexShrink: 0,
                    }} />
                    <div style={{ fontSize: 15, fontWeight: 700, color: c.text }}>
                      {p.name}
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: c.textMuted, marginTop: 4, marginLeft: 18 }}>
                    Deadline: {formatDate(p.deadline)}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                  {!p.archived && <UrgencyBadge daysLeft={days} c={c} />}
                  {p.archived && (
                    <span style={{
                      fontSize: 10, fontWeight: 700, textTransform: "uppercase",
                      color: c.textMuted, background: c.bgKanban,
                      padding: "3px 8px", borderRadius: 6,
                    }}>Archived</span>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleArchiveProject(p.id); }}
                    style={{
                      background: "none", border: "none", color: c.textMuted,
                      cursor: "pointer", padding: 4, display: "flex",
                    }}
                    title={p.archived ? "Unarchive" : "Archive"}
                  >
                    <Icons.Archive />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); openEditProject(p); }}
                    style={{
                      background: "none", border: "none", color: c.textMuted,
                      cursor: "pointer", padding: 4, display: "flex",
                    }}
                  >
                    <Icons.Edit />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); if (window.confirm("Are you sure you want to delete this project?")) deleteProject(p.id); }}
                    style={{
                      background: "none", border: "none", color: c.textMuted,
                      cursor: "pointer", padding: 4, display: "flex",
                    }}
                  >
                    <Icons.Trash />
                  </button>
                </div>
              </div>
              {/* Progress bar */}
              {totalTasks > 0 && (
                <>
                  <div style={{
                    background: c.bgKanban, borderRadius: 6, height: 6,
                    overflow: "hidden", marginBottom: 8,
                  }}>
                    <div style={{
                      height: "100%",
                      width: `${(doneTasks / totalTasks) * 100}%`,
                      background: c[p.color],
                      borderRadius: 6,
                      transition: "width 0.4s ease",
                    }} />
                  </div>
                  <div style={{ fontSize: 12, color: c.textSecondary }}>
                    {doneTasks}/{totalTasks} tasks complete
                  </div>
                </>
              )}
              {totalTasks === 0 && (
                <div style={{ fontSize: 12, color: c.textMuted, fontStyle: "italic" }}>
                  No tasks yet — click to add some
                </div>
              )}
            </div>
          );
        })}
        {displayedProjects.length === 0 && (
          <div style={{
            gridColumn: "1 / -1", textAlign: "center", padding: "40px 20px",
            color: c.textMuted, fontSize: 14,
          }}>
            {showArchived
              ? "No archived projects"
              : 'No projects yet. Click "New Project" to get started!'}
          </div>
        )}
      </div>

      {/* Kanban Board for selected project */}
      {currentProject && (
        <>
          <div style={{
            display: "flex", alignItems: "center", gap: 12, marginBottom: 16,
          }}>
            <div style={{
              width: 12, height: 12, borderRadius: "50%",
              background: c[currentProject.color],
            }} />
            <h3 style={{ fontSize: 15, fontWeight: 700, color: c.text, margin: 0 }}>
              {currentProject.name} — Task Board
            </h3>
          </div>
          {/* Notes & Links */}
          {(currentProject.notes || currentProject.links) && (
            <div style={{
              background: c.bgKanban, borderRadius: 10, padding: "12px 16px",
              marginBottom: 16, fontSize: 12, color: c.textSecondary, lineHeight: 1.6,
            }}>
              {currentProject.notes && <div>{currentProject.notes}</div>}
              {currentProject.links && (
                <div style={{ marginTop: 4, color: c.blue, wordBreak: "break-all" }}>
                  {currentProject.links}
                </div>
              )}
            </div>
          )}
          <KanbanBoard
            columns={KANBAN_COLUMNS.map((col, i) => ({
              ...col,
              title: i === 0 ? (settings.projectCol1 || col.title)
                : i === 1 ? (settings.projectCol2 || col.title)
                : (settings.projectCol3 || col.title),
            }))}
            tasks={currentProject.tasks}
            onTasksChange={handleTasksReorder}
            c={c}
            onAddTask={openNewTask}
            onEditTask={openEditTask}
            onDeleteTask={deleteTask}
          />
        </>
      )}

      {/* Project Modal */}
      <Modal
        isOpen={showProjectModal}
        onClose={() => setShowProjectModal(false)}
        title={editingProject ? "Edit Project" : "New Project"}
        c={c}
      >
        <Input
          label="Project Name"
          c={c}
          value={projectForm.name}
          onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
          placeholder="e.g. ML Research Paper"
        />
        <Input
          label="Deadline"
          c={c}
          type="date"
          value={projectForm.deadline}
          onChange={(e) => setProjectForm({ ...projectForm, deadline: e.target.value })}
        />
        <ColorPicker
          value={projectForm.color}
          onChange={(color) => setProjectForm({ ...projectForm, color })}
          colors={PROJECT_COLORS}
          c={c}
        />
        <TextArea
          label="Notes"
          c={c}
          value={projectForm.notes}
          onChange={(e) => setProjectForm({ ...projectForm, notes: e.target.value })}
          placeholder="Project description, goals, context..."
        />
        <Input
          label="Links / Resources"
          c={c}
          value={projectForm.links}
          onChange={(e) => setProjectForm({ ...projectForm, links: e.target.value })}
          placeholder="https://..."
        />
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
          <Button variant="secondary" c={c} onClick={() => setShowProjectModal(false)}>
            Cancel
          </Button>
          <Button c={c} onClick={saveProject}>
            {editingProject ? "Save Changes" : "Create Project"}
          </Button>
        </div>
      </Modal>

      {/* Task Modal */}
      <Modal
        isOpen={showTaskModal}
        onClose={() => setShowTaskModal(false)}
        title={editingTask ? "Edit Task" : "New Task"}
        c={c}
        width={440}
      >
        <Input
          label="Task Title"
          c={c}
          value={taskForm.title}
          onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
          placeholder="e.g. Write introduction section"
        />
        <Input
          label="Subtitle / Details (optional)"
          c={c}
          value={taskForm.subtitle}
          onChange={(e) => setTaskForm({ ...taskForm, subtitle: e.target.value })}
          placeholder="e.g. ~500 words"
        />
        <TextArea
          label="Notes"
          c={c}
          value={taskForm.notes}
          onChange={(e) => setTaskForm({ ...taskForm, notes: e.target.value })}
          placeholder="Additional notes, links, references..."
          style={{ minHeight: 100 }}
        />
        {editingTask && (
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: c.textSecondary, marginBottom: 6 }}>Status</label>
            <div style={{ display: "flex", gap: 6 }}>
              {KANBAN_COLUMNS.map((col, i) => {
                const label = i === 0 ? (settings.projectCol1 || col.title)
                  : i === 1 ? (settings.projectCol2 || col.title)
                  : (settings.projectCol3 || col.title);
                const isActive = taskForm.column === col.id;
                return (
                  <button key={col.id} onClick={() => setTaskForm({ ...taskForm, column: col.id })} style={{
                    flex: 1, padding: "6px 0", borderRadius: 6, fontSize: 11,
                    fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                    border: isActive ? `1.5px solid ${c[col.colorKey]}` : `1px solid ${c.border}`,
                    background: isActive ? `${c[col.colorKey]}18` : "transparent",
                    color: isActive ? c[col.colorKey] : c.textMuted,
                    transition: "all 0.15s",
                  }}>{label}</button>
                );
              })}
            </div>
          </div>
        )}
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
          <Button variant="secondary" c={c} onClick={() => setShowTaskModal(false)}>
            Cancel
          </Button>
          <Button c={c} onClick={saveTask}>
            {editingTask ? "Save Changes" : "Add Task"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
