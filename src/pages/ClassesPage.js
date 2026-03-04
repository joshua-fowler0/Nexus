import React, { useState, useEffect } from "react";
import { v4 as uuid } from "uuid";
import { Icons } from "../components/Icons";
import {
  UrgencyBadge, daysUntil, formatDate,
  Modal, Input, TextArea, Button, ColorPicker,
} from "../components/Shared";
import KanbanBoard from "../components/KanbanBoard";
import {
  CLASS_KANBAN_COLUMNS, CLASS_COLORS, CLASS_ITEM_TYPES,
} from "../data/classDefaults";

// Type badge component
function TypeBadge({ type, c, allTypes }) {
  const types = allTypes || CLASS_ITEM_TYPES;
  const typeInfo = types.find((t) => t.id === type) || types[types.length - 1] || { label: type, colorKey: "textSecondary" };
  const color = c[typeInfo.colorKey] || c.textSecondary;
  const bgMap = {
    blue: c.blueBg, red: c.redBg, amber: c.amberBg,
    textSecondary: c.bgKanban, purple: c.purpleBg,
    green: c.greenBg, cyan: c.blueBg,
  };
  const bg = bgMap[typeInfo.colorKey] || c.bgKanban;
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, textTransform: "uppercase",
      letterSpacing: 0.8, color, background: bg,
      padding: "2px 7px", borderRadius: 6,
    }}>
      {typeInfo.label}
    </span>
  );
}

// Enhanced Kanban card for class items (shows type + due date)
function ClassKanbanCard({ task, c }) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
        <TypeBadge type={task.type} c={c} />
        {task.dueDate && <UrgencyBadge daysLeft={daysUntil(task.dueDate)} c={c} />}
      </div>
      <div style={{ fontSize: 13, fontWeight: 600, color: c.text }}>{task.title}</div>
      {task.dueDate && (
        <div style={{ fontSize: 11, color: c.textMuted, marginTop: 2 }}>
          Due: {formatDate(task.dueDate)}
        </div>
      )}
    </div>
  );
}

// Semester tab selector
function SemesterTabs({ semesters, activeSemesterId, onSelect, onAdd, onEdit, onDelete, c }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 6, marginBottom: 24,
      borderBottom: `1px solid ${c.border}`, paddingBottom: 12, flexWrap: "wrap",
    }}>
      {semesters.map((sem) => (
        <div key={sem.id} style={{ display: "flex", alignItems: "center", gap: 2 }}>
          <button
            onClick={() => onSelect(sem.id)}
            style={{
              padding: "7px 16px", borderRadius: "8px 8px 0 0", fontSize: 13,
              fontWeight: activeSemesterId === sem.id ? 700 : 500, cursor: "pointer",
              border: "none", fontFamily: "inherit",
              background: activeSemesterId === sem.id ? c.accentGlow : "transparent",
              color: activeSemesterId === sem.id ? c.accentLight : c.textSecondary,
              transition: "all 0.15s",
            }}
          >
            {sem.name}
            {sem.active && (
              <span style={{
                fontSize: 9, fontWeight: 700, color: c.green,
                background: c.greenBg, padding: "1px 5px", borderRadius: 4,
                marginLeft: 6, textTransform: "uppercase",
              }}>
                Current
              </span>
            )}
          </button>
          <button
            onClick={() => onEdit(sem)}
            style={{
              background: "none", border: "none", color: c.textMuted,
              cursor: "pointer", padding: 2, display: "flex", fontSize: 10,
            }}
          >
            <Icons.Edit />
          </button>
          {!sem.active && (
            <button
              onClick={() => onDelete(sem.id)}
              style={{
                background: "none", border: "none", color: c.textMuted,
                cursor: "pointer", padding: 2, display: "flex", fontSize: 10,
              }}
            >
              <Icons.Trash />
            </button>
          )}
        </div>
      ))}
      <button
        onClick={onAdd}
        style={{
          padding: "6px 12px", borderRadius: 8, fontSize: 12,
          fontWeight: 600, cursor: "pointer", border: `1px dashed ${c.border}`,
          background: "transparent", color: c.textMuted, fontFamily: "inherit",
          display: "flex", alignItems: "center", gap: 4,
        }}
      >
        <Icons.Plus /> Semester
      </button>
    </div>
  );
}

export default function ClassesPage({ c, semesters, onSemestersChange, pendingOpenItem, onClearPending, settings = {} }) {
  const [activeSemesterId, setActiveSemesterId] = useState(
    () => semesters.find((s) => s.active)?.id || semesters[0]?.id || null
  );
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [showSemesterModal, setShowSemesterModal] = useState(false);
  const [showClassModal, setShowClassModal] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingSemester, setEditingSemester] = useState(null);
  const [editingClass, setEditingClass] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [newItemColumn, setNewItemColumn] = useState("not_started");

  // Form states
  const [semesterForm, setSemesterForm] = useState({ name: "", active: false });
  const [classForm, setClassForm] = useState({ name: "", subtitle: "", color: "blue" });
  const [itemForm, setItemForm] = useState({ title: "", type: "assignment", dueDate: "", notes: "" });

  const activeSemester = semesters.find((s) => s.id === activeSemesterId);
  const classes = activeSemester?.classes || [];
  const selectedClass = classes.find((cls) => cls.id === selectedClassId);

  // Merge default + custom item types
  const allItemTypes = [...CLASS_ITEM_TYPES, ...(settings.customItemTypes || [])];

  // Helper to update semesters immutably
  function updateSemesters(updater) {
    onSemestersChange(updater(semesters));
  }

  function updateActiveSemester(updater) {
    updateSemesters((sems) =>
      sems.map((s) => (s.id === activeSemesterId ? updater(s) : s))
    );
  }

  function updateClass(classId, updater) {
    updateActiveSemester((sem) => ({
      ...sem,
      classes: sem.classes.map((cls) =>
        cls.id === classId ? updater(cls) : cls
      ),
    }));
  }

  // ---- Semester CRUD ----
  function openNewSemester() {
    setEditingSemester(null);
    setSemesterForm({ name: "", active: false });
    setShowSemesterModal(true);
  }

  function openEditSemester(sem) {
    setEditingSemester(sem);
    setSemesterForm({ name: sem.name, active: sem.active });
    setShowSemesterModal(true);
  }

  function saveSemester() {
    if (!semesterForm.name.trim()) return;
    if (editingSemester) {
      updateSemesters((sems) =>
        sems.map((s) => {
          if (s.id === editingSemester.id) {
            return { ...s, name: semesterForm.name, active: semesterForm.active };
          }
          // If this semester is being set as active, deactivate others
          if (semesterForm.active && s.id !== editingSemester.id) {
            return { ...s, active: false };
          }
          return s;
        })
      );
    } else {
      const newSem = {
        id: uuid(),
        name: semesterForm.name,
        active: semesterForm.active,
        classes: [],
      };
      updateSemesters((sems) => {
        let updated = [...sems, newSem];
        if (semesterForm.active) {
          updated = updated.map((s) =>
            s.id === newSem.id ? s : { ...s, active: false }
          );
        }
        return updated;
      });
      setActiveSemesterId(newSem.id);
    }
    setShowSemesterModal(false);
  }

  function deleteSemester(semId) {
    if (!window.confirm("Are you sure you want to delete this semester?")) return;
    updateSemesters((sems) => sems.filter((s) => s.id !== semId));
    if (activeSemesterId === semId) {
      const remaining = semesters.filter((s) => s.id !== semId);
      setActiveSemesterId(remaining[0]?.id || null);
    }
  }

  // ---- Class CRUD ----
  function openNewClass() {
    setEditingClass(null);
    setClassForm({ name: "", subtitle: "", color: "blue" });
    setShowClassModal(true);
  }

  function openEditClass(cls) {
    setEditingClass(cls);
    setClassForm({ name: cls.name, subtitle: cls.subtitle || "", color: cls.color });
    setShowClassModal(true);
  }

  function saveClass() {
    if (!classForm.name.trim()) return;
    if (editingClass) {
      updateClass(editingClass.id, (cls) => ({ ...cls, ...classForm }));
    } else {
      const newCls = { id: uuid(), ...classForm, items: [] };
      updateActiveSemester((sem) => ({
        ...sem,
        classes: [...sem.classes, newCls],
      }));
    }
    setShowClassModal(false);
  }

  function deleteClass(classId) {
    if (!window.confirm("Are you sure you want to delete this class?")) return;
    updateActiveSemester((sem) => ({
      ...sem,
      classes: sem.classes.filter((cls) => cls.id !== classId),
    }));
    if (selectedClassId === classId) setSelectedClassId(null);
  }

  // ---- Item CRUD ----
  function openNewItem(column) {
    setEditingItem(null);
    setNewItemColumn(column);
    setItemForm({ title: "", type: "assignment", dueDate: "", notes: "" });
    setShowItemModal(true);
  }

  function openEditItem(item) {
    setEditingItem(item);
    setItemForm({
      title: item.title, type: item.type || "assignment",
      dueDate: item.dueDate || "", notes: item.notes || "",
      column: item.column || "not_started",
    });
    setShowItemModal(true);
  }

  function saveItem() {
    if (!itemForm.title.trim() || !selectedClassId) return;
    updateClass(selectedClassId, (cls) => {
      if (editingItem) {
        return {
          ...cls,
          items: cls.items.map((it) =>
            it.id === editingItem.id ? { ...it, ...itemForm } : it
          ),
        };
      } else {
        const { column: _col, ...formWithoutColumn } = itemForm;
        return {
          ...cls,
          items: [...cls.items, { id: uuid(), ...formWithoutColumn, column: newItemColumn }],
        };
      }
    });
    setShowItemModal(false);
  }

  function deleteItem(itemId) {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    updateClass(selectedClassId, (cls) => ({
      ...cls,
      items: cls.items.filter((it) => it.id !== itemId),
    }));
  }

  function handleItemsReorder(newItems) {
    updateClass(selectedClassId, (cls) => ({ ...cls, items: newItems }));
  }

  // Handle pending open item from Home page — two-phase approach
  const [pendingItemId, setPendingItemId] = useState(null);

  // Phase 1: set the class and stash the item ID
  useEffect(() => {
    if (pendingOpenItem && pendingOpenItem.type === "class") {
      const { classId, itemId } = pendingOpenItem;
      if (classId) setSelectedClassId(classId);
      if (itemId) setPendingItemId(itemId);
      if (onClearPending) onClearPending();
    }
  }, [pendingOpenItem]);

  // Phase 2: once selectedClassId is set and we have a pending item, open the modal
  useEffect(() => {
    if (pendingItemId && selectedClassId) {
      const allClasses = semesters.find((s) => s.active)?.classes || [];
      const cls = allClasses.find((cl) => cl.id === selectedClassId);
      const item = cls?.items.find((it) => it.id === pendingItemId);
      if (item) {
        openEditItem(item);
      }
      setPendingItemId(null);
    }
  }, [pendingItemId, selectedClassId]);

  // Get fresh references after updates
  const currentClasses = semesters.find((s) => s.id === activeSemesterId)?.classes || [];
  const currentSelectedClass = currentClasses.find((cls) => cls.id === selectedClassId);

  // Stats for header
  const totalItems = currentClasses.reduce((sum, cls) => sum + cls.items.length, 0);
  const upcomingItems = currentClasses.reduce(
    (sum, cls) => sum + cls.items.filter((it) => it.column !== "submitted" && daysUntil(it.dueDate) <= 7).length,
    0
  );

  return (
    <div>
      <div style={{
        display: "flex", justifyContent: "space-between",
        alignItems: "center", marginBottom: 20,
      }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: c.text, margin: 0 }}>Classes</h2>
          <p style={{ fontSize: 13, color: c.textMuted, margin: "4px 0 0" }}>
            {activeSemester ? `${activeSemester.name} — ${currentClasses.length} classes, ${totalItems} items` : "No semesters yet"}
            {upcomingItems > 0 && (
              <span style={{ color: c.amber, marginLeft: 8 }}>
                ({upcomingItems} due within a week)
              </span>
            )}
          </p>
        </div>
        <Button c={c} onClick={openNewClass}>
          <Icons.Plus /> Add Class
        </Button>
      </div>

      {/* Semester Tabs */}
      {semesters.length > 0 && (
        <SemesterTabs
          semesters={semesters}
          activeSemesterId={activeSemesterId}
          onSelect={setActiveSemesterId}
          onAdd={openNewSemester}
          onEdit={openEditSemester}
          onDelete={deleteSemester}
          c={c}
        />
      )}
      {semesters.length === 0 && (
        <div style={{ textAlign: "center", padding: "40px 20px" }}>
          <p style={{ color: c.textMuted, fontSize: 14, marginBottom: 12 }}>
            No semesters yet. Create one to get started.
          </p>
          <Button c={c} onClick={openNewSemester}>
            <Icons.Plus /> Create Semester
          </Button>
        </div>
      )}

      {/* Class Cards */}
      {activeSemester && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 28 }}>
          {currentClasses.map((cls) => {
            const total = cls.items.length;
            const done = cls.items.filter((it) => it.column === "submitted").length;
            const isSelected = selectedClassId === cls.id;
            const nextDue = cls.items
              .filter((it) => it.column !== "submitted" && it.dueDate)
              .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))[0];

            return (
              <div
                key={cls.id}
                onClick={() => setSelectedClassId(cls.id)}
                style={{
                  background: c.bgCard,
                  borderLeft: `1px solid ${isSelected ? c.accent : c.border}`,
                  borderRight: `1px solid ${isSelected ? c.accent : c.border}`,
                  borderBottom: `1px solid ${isSelected ? c.accent : c.border}`,
                  borderTop: `3px solid ${c[cls.color]}`,
                  borderRadius: 14,
                  padding: 18,
                  cursor: "pointer",
                  transition: "all 0.15s",
                  boxShadow: isSelected ? `0 0 0 1px ${c.accent}` : "none",
                }}
              >
                <div style={{
                  display: "flex", justifyContent: "space-between",
                  alignItems: "flex-start", marginBottom: 10,
                }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: c.text }}>
                      {cls.name}
                    </div>
                    {cls.subtitle && (
                      <div style={{ fontSize: 12, color: c.textMuted, marginTop: 2 }}>
                        {cls.subtitle}
                      </div>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 2 }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); openEditClass(cls); }}
                      style={{
                        background: "none", border: "none", color: c.textMuted,
                        cursor: "pointer", padding: 3, display: "flex",
                      }}
                    >
                      <Icons.Edit />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteClass(cls.id); }}
                      style={{
                        background: "none", border: "none", color: c.textMuted,
                        cursor: "pointer", padding: 3, display: "flex",
                      }}
                    >
                      <Icons.Trash />
                    </button>
                  </div>
                </div>
                {/* Item type counts */}
                <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
                  {allItemTypes.map((t) => {
                    const count = cls.items.filter((it) => it.type === t.id).length;
                    if (count === 0) return null;
                    return (
                      <span key={t.id} style={{
                        fontSize: 10, fontWeight: 600, color: c[t.colorKey],
                        background: c.bgKanban, padding: "2px 6px", borderRadius: 4,
                      }}>
                        {count} {t.label}{count > 1 ? "s" : ""}
                      </span>
                    );
                  })}
                </div>
                {/* Progress */}
                {total > 0 && (
                  <>
                    <div style={{
                      background: c.bgKanban, borderRadius: 6, height: 5,
                      overflow: "hidden", marginBottom: 6,
                    }}>
                      <div style={{
                        height: "100%",
                        width: `${(done / total) * 100}%`,
                        background: c[cls.color],
                        borderRadius: 6,
                        transition: "width 0.4s ease",
                      }} />
                    </div>
                    <div style={{
                      display: "flex", justifyContent: "space-between",
                      fontSize: 11, color: c.textMuted,
                    }}>
                      <span>{done}/{total} complete</span>
                      {nextDue && (
                        <span>Next: {formatDate(nextDue.dueDate)}</span>
                      )}
                    </div>
                  </>
                )}
                {total === 0 && (
                  <div style={{ fontSize: 12, color: c.textMuted, fontStyle: "italic" }}>
                    No items yet
                  </div>
                )}
              </div>
            );
          })}
          {currentClasses.length === 0 && (
            <div style={{
              gridColumn: "1 / -1", textAlign: "center", padding: "30px 20px",
              color: c.textMuted, fontSize: 14,
            }}>
              No classes in this semester yet. Click "Add Class" to get started!
            </div>
          )}
        </div>
      )}

      {/* Kanban Board for selected class */}
      {currentSelectedClass && (
        <>
          <div style={{
            display: "flex", alignItems: "center", gap: 10, marginBottom: 16,
          }}>
            <div style={{
              width: 12, height: 12, borderRadius: "50%",
              background: c[currentSelectedClass.color],
            }} />
            <h3 style={{ fontSize: 15, fontWeight: 700, color: c.text, margin: 0 }}>
              {currentSelectedClass.name}
              {currentSelectedClass.subtitle && (
                <span style={{ fontWeight: 400, color: c.textMuted, marginLeft: 8 }}>
                  {currentSelectedClass.subtitle}
                </span>
              )}
            </h3>
          </div>
          <KanbanBoard
            columns={CLASS_KANBAN_COLUMNS.map((col, i) => ({
              ...col,
              title: i === 0 ? (settings.classCol1 || col.title)
                : i === 1 ? (settings.classCol2 || col.title)
                : (settings.classCol3 || col.title),
            }))}
            tasks={currentSelectedClass.items.map((it) => ({
              ...it,
              subtitle: (() => {
                const typeInfo = allItemTypes.find((t) => t.id === it.type);
                const dueStr = it.dueDate ? `Due: ${formatDate(it.dueDate)}` : "";
                const typeStr = typeInfo ? typeInfo.label : "";
                return [typeStr, dueStr].filter(Boolean).join(" · ");
              })(),
            }))}
            onTasksChange={(newTasks) => {
              const updated = newTasks.map((t) => {
                const original = currentSelectedClass.items.find((it) => it.id === t.id);
                return { ...original, column: t.column };
              });
              handleItemsReorder(updated);
            }}
            c={c}
            onAddTask={openNewItem}
            onEditTask={(task) => {
              const original = currentSelectedClass.items.find((it) => it.id === task.id);
              if (original) openEditItem(original);
            }}
            onDeleteTask={deleteItem}
            sortOptions={[
              { id: "title", label: "Title" },
              { id: "date", label: "Due Date" },
              { id: "type", label: "Type" },
            ]}
          />
        </>
      )}

      {/* Semester Modal */}
      <Modal
        isOpen={showSemesterModal}
        onClose={() => setShowSemesterModal(false)}
        title={editingSemester ? "Edit Semester" : "New Semester"}
        c={c}
        width={400}
      >
        <Input
          label="Semester Name"
          c={c}
          value={semesterForm.name}
          onChange={(e) => setSemesterForm({ ...semesterForm, name: e.target.value })}
          placeholder="e.g. Spring 2026"
        />
        <div style={{ marginBottom: 16 }}>
          <label style={{
            display: "flex", alignItems: "center", gap: 8,
            fontSize: 13, color: c.textSecondary, cursor: "pointer",
          }}>
            <input
              type="checkbox"
              checked={semesterForm.active}
              onChange={(e) => setSemesterForm({ ...semesterForm, active: e.target.checked })}
              style={{ accentColor: c.accent }}
            />
            Set as current semester
          </label>
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
          <Button variant="secondary" c={c} onClick={() => setShowSemesterModal(false)}>
            Cancel
          </Button>
          <Button c={c} onClick={saveSemester}>
            {editingSemester ? "Save Changes" : "Create Semester"}
          </Button>
        </div>
      </Modal>

      {/* Class Modal */}
      <Modal
        isOpen={showClassModal}
        onClose={() => setShowClassModal(false)}
        title={editingClass ? "Edit Class" : "New Class"}
        c={c}
        width={440}
      >
        <Input
          label="Class Name"
          c={c}
          value={classForm.name}
          onChange={(e) => setClassForm({ ...classForm, name: e.target.value })}
          placeholder="e.g. CS 571"
        />
        <Input
          label="Subtitle (optional)"
          c={c}
          value={classForm.subtitle}
          onChange={(e) => setClassForm({ ...classForm, subtitle: e.target.value })}
          placeholder="e.g. Machine Learning"
        />
        <ColorPicker
          value={classForm.color}
          onChange={(color) => setClassForm({ ...classForm, color })}
          colors={CLASS_COLORS}
          c={c}
        />
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
          <Button variant="secondary" c={c} onClick={() => setShowClassModal(false)}>
            Cancel
          </Button>
          <Button c={c} onClick={saveClass}>
            {editingClass ? "Save Changes" : "Add Class"}
          </Button>
        </div>
      </Modal>

      {/* Item Modal */}
      <Modal
        isOpen={showItemModal}
        onClose={() => setShowItemModal(false)}
        title={editingItem ? "Edit Item" : "New Item"}
        c={c}
        width={440}
      >
        <Input
          label="Title"
          c={c}
          value={itemForm.title}
          onChange={(e) => setItemForm({ ...itemForm, title: e.target.value })}
          placeholder="e.g. HW 5: Neural Networks"
        />
        {/* Type selector */}
        <div style={{ marginBottom: 16 }}>
          <label style={{
            display: "block", fontSize: 12, fontWeight: 600,
            color: c.textSecondary, marginBottom: 8,
          }}>
            Type
          </label>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {allItemTypes.map((t) => (
              <button
                key={t.id}
                onClick={() => setItemForm({ ...itemForm, type: t.id })}
                style={{
                  padding: "6px 14px", borderRadius: 8, fontSize: 12,
                  fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                  border: itemForm.type === t.id
                    ? `2px solid ${c[t.colorKey]}`
                    : `1px solid ${c.border}`,
                  background: itemForm.type === t.id ? c.bgKanban : "transparent",
                  color: itemForm.type === t.id ? c[t.colorKey] : c.textMuted,
                  transition: "all 0.15s",
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
        <Input
          label="Due Date"
          c={c}
          type="date"
          value={itemForm.dueDate}
          onChange={(e) => setItemForm({ ...itemForm, dueDate: e.target.value })}
        />
        <TextArea
          label="Notes"
          c={c}
          value={itemForm.notes}
          onChange={(e) => setItemForm({ ...itemForm, notes: e.target.value })}
          placeholder="Additional notes, links, instructions..."
          style={{ minHeight: 100 }}
        />
        {editingItem && (
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: c.textSecondary, marginBottom: 6 }}>Status</label>
            <div style={{ display: "flex", gap: 6 }}>
              {CLASS_KANBAN_COLUMNS.map((col, i) => {
                const label = i === 0 ? (settings.classCol1 || col.title)
                  : i === 1 ? (settings.classCol2 || col.title)
                  : (settings.classCol3 || col.title);
                const isActive = itemForm.column === col.id;
                return (
                  <button key={col.id} onClick={() => setItemForm({ ...itemForm, column: col.id })} style={{
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
          <Button variant="secondary" c={c} onClick={() => setShowItemModal(false)}>
            Cancel
          </Button>
          <Button c={c} onClick={saveItem}>
            {editingItem ? "Save Changes" : "Add Item"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
