import React, { useState } from "react";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  useDroppable,
  useDraggable,
} from "@dnd-kit/core";
import { Icons } from "./Icons";

// Draggable card — uses useDraggable (NOT useSortable)
function DraggableCard({ task, c, onEdit, onDelete }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: task.id,
    data: { column: task.column },
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        opacity: isDragging ? 0.25 : 1,
        transition: "opacity 0.15s",
      }}
    >
      <div
        style={{
          background: c.bgCard,
          border: `1px solid ${c.borderLight}`,
          borderRadius: 10,
          padding: "10px 12px",
          display: "flex",
          alignItems: "flex-start",
          gap: 8,
        }}
      >
        {/* Drag handle */}
        <div
          {...attributes}
          {...listeners}
          style={{
            color: c.textMuted, paddingTop: 2, cursor: "grab",
            flexShrink: 0, touchAction: "none",
          }}
        >
          <Icons.GripVertical />
        </div>
        <div style={{ flex: 1, minWidth: 0, cursor: "pointer" }} onClick={() => onEdit(task)}>
          <div style={{ fontSize: 13, fontWeight: 600, color: c.text }}>
            {task.title}
          </div>
          {task.subtitle && (
            <div style={{ fontSize: 11, color: c.textMuted, marginTop: 2 }}>
              {task.subtitle}
            </div>
          )}
        </div>
        <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
          <button
            onClick={() => onEdit(task)}
            style={{
              background: "none", border: "none", color: c.textMuted,
              cursor: "pointer", padding: 2, display: "flex",
            }}
          >
            <Icons.Edit />
          </button>
          <button
            onClick={() => onDelete(task.id)}
            style={{
              background: "none", border: "none", color: c.textMuted,
              cursor: "pointer", padding: 2, display: "flex",
            }}
          >
            <Icons.Trash />
          </button>
        </div>
      </div>
    </div>
  );
}

// Drag overlay
function CardOverlay({ task, c }) {
  return (
    <div style={{
      background: c.bgCard,
      border: `1px solid ${c.accent}`,
      borderRadius: 10,
      padding: "10px 12px",
      boxShadow: `0 12px 40px rgba(0,0,0,0.3)`,
      width: 220,
      cursor: "grabbing",
      transform: "rotate(2deg) scale(1.03)",
    }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: c.text }}>{task.title}</div>
      {task.subtitle && (
        <div style={{ fontSize: 11, color: c.textMuted, marginTop: 2 }}>{task.subtitle}</div>
      )}
    </div>
  );
}

// Droppable column
function DroppableColumn({ column, tasks, c, onAddTask, onEdit, onDelete, isOver }) {
  const { setNodeRef } = useDroppable({ id: column.id });

  const colorMap = {
    textMuted: c.textMuted, amber: c.amber, green: c.green,
    blue: c.blue, red: c.red, purple: c.purple,
  };
  const dotColor = colorMap[column.colorKey] || c.textMuted;

  return (
    <div style={{ flex: 1, minWidth: 200 }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        marginBottom: 12, justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: dotColor }} />
          <span style={{
            fontSize: 12, fontWeight: 700, textTransform: "uppercase",
            letterSpacing: 1.2, color: c.textSecondary,
          }}>
            {column.title}
          </span>
          <span style={{
            fontSize: 11, fontWeight: 600, color: c.textMuted,
            background: c.bgKanban, borderRadius: 8, padding: "1px 7px",
          }}>
            {tasks.length}
          </span>
        </div>
        <button
          onClick={() => onAddTask(column.id)}
          style={{
            background: "none", border: "none", color: c.textMuted,
            cursor: "pointer", padding: 2, display: "flex",
          }}
        >
          <Icons.Plus />
        </button>
      </div>
      <div
        ref={setNodeRef}
        style={{
          display: "flex", flexDirection: "column", gap: 8,
          minHeight: 80,
          background: isOver ? `${c.accent}0a` : c.bgKanban,
          borderRadius: 10, padding: 8,
          border: isOver ? `2px dashed ${c.accent}66` : "2px solid transparent",
          transition: "all 0.2s ease",
        }}
      >
        {tasks.map((task) => (
          <DraggableCard
            key={task.id}
            task={task}
            c={c}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
        {tasks.length === 0 && (
          <div style={{
            fontSize: 12, color: c.textMuted, textAlign: "center",
            padding: "20px 0", fontStyle: "italic",
          }}>
            Drop tasks here
          </div>
        )}
      </div>
    </div>
  );
}

// Custom collision detection: find the closest droppable column center
function closestColumnCollision(args) {
  const { droppableContainers, pointerCoordinates } = args;
  if (!pointerCoordinates) return [];

  let closest = null;
  let minDist = Infinity;

  for (const container of droppableContainers) {
    const rect = container.rect.current;
    if (!rect) continue;
    // Only match column droppables (not task droppables)
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dist = Math.abs(pointerCoordinates.x - centerX);
    // Also check if pointer Y is within reasonable range of column
    const yInRange = pointerCoordinates.y >= rect.top - 50 &&
                     pointerCoordinates.y <= rect.bottom + 50;
    if (dist < minDist && yInRange) {
      minDist = dist;
      closest = container;
    }
  }

  return closest ? [{ id: closest.id }] : [];
}

// Sort toolbar
function SortBar({ sortBy, sortDir, onSortChange, c, filterText, onFilterChange, sortOptions }) {
  const options = sortOptions || [
    { id: "title", label: "Title" },
    { id: "date", label: "Due Date" },
  ];

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10, marginBottom: 14,
      flexWrap: "wrap",
    }}>
      {/* Filter input */}
      <div style={{
        display: "flex", alignItems: "center", gap: 6,
        background: c.bgKanban, borderRadius: 8, padding: "5px 10px",
        border: `1px solid ${c.border}`, flex: "0 1 200px",
      }}>
        <Icons.Search />
        <input
          value={filterText}
          onChange={(e) => onFilterChange(e.target.value)}
          placeholder="Filter tasks..."
          style={{
            background: "none", border: "none", outline: "none",
            fontSize: 12, color: c.text, fontFamily: "inherit", width: "100%",
          }}
        />
        {filterText && (
          <button onClick={() => onFilterChange("")} style={{
            background: "none", border: "none", color: c.textMuted,
            cursor: "pointer", padding: 0, display: "flex",
          }}>
            <Icons.X />
          </button>
        )}
      </div>

      {/* Sort buttons */}
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <span style={{ color: c.textMuted, marginRight: 2 }}><Icons.Sort /></span>
        {options.map((opt) => {
          const isActive = sortBy === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => {
                if (isActive && sortDir === "desc") {
                  // Third click: deselect
                  onSortChange(null, "asc");
                } else if (isActive) {
                  onSortChange(opt.id, "desc");
                } else {
                  onSortChange(opt.id, "asc");
                }
              }}
              style={{
                padding: "4px 10px", borderRadius: 6, fontSize: 11,
                fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                border: isActive ? `1.5px solid ${c.accent}` : `1px solid ${c.border}`,
                background: isActive ? c.accentGlow : "transparent",
                color: isActive ? c.accentLight : c.textMuted,
                display: "flex", alignItems: "center", gap: 3,
                transition: "all 0.15s",
              }}
            >
              {opt.label}
              {isActive && (sortDir === "asc" ? <Icons.ArrowUp /> : <Icons.ArrowDown />)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Main Kanban Board
export default function KanbanBoard({
  columns, tasks, onTasksChange, c,
  onAddTask, onEditTask, onDeleteTask,
  sortOptions,
}) {
  const [activeId, setActiveId] = useState(null);
  const [overColumnId, setOverColumnId] = useState(null);
  const [sortBy, setSortBy] = useState(null);
  const [sortDir, setSortDir] = useState("asc");
  const [filterText, setFilterText] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  // Apply filter
  const filteredTasks = filterText.trim()
    ? tasks.filter((t) =>
        t.title.toLowerCase().includes(filterText.toLowerCase()) ||
        (t.subtitle || "").toLowerCase().includes(filterText.toLowerCase()) ||
        (t.type || "").toLowerCase().includes(filterText.toLowerCase())
      )
    : tasks;

  // Apply sort within each column
  function sortTasks(columnTasks) {
    if (!sortBy) return columnTasks;
    const sorted = [...columnTasks].sort((a, b) => {
      let cmp = 0;
      if (sortBy === "title") {
        cmp = (a.title || "").localeCompare(b.title || "");
      } else if (sortBy === "date") {
        const da = a.dueDate || "9999-99-99";
        const db = b.dueDate || "9999-99-99";
        cmp = da.localeCompare(db);
      } else if (sortBy === "type") {
        cmp = (a.type || "other").localeCompare(b.type || "other");
      }
      return sortDir === "desc" ? -cmp : cmp;
    });
    return sorted;
  }

  const activeTask = activeId ? tasks.find((t) => t.id === activeId) : null;

  function handleDragStart(event) {
    setActiveId(event.active.id);
  }

  function handleDragOver(event) {
    const { over } = event;
    if (!over) {
      setOverColumnId(null);
      return;
    }
    // over.id is always a column id thanks to our custom collision detection
    setOverColumnId(over.id);
  }

  function handleDragEnd(event) {
    const { active, over } = event;
    setActiveId(null);
    setOverColumnId(null);

    if (!over) return;

    const draggedTask = tasks.find((t) => t.id === active.id);
    if (!draggedTask) return;

    const targetColumn = over.id; // always a column id

    // Only update if actually moving to a different column
    if (draggedTask.column !== targetColumn) {
      const updated = tasks.map((t) =>
        t.id === active.id ? { ...t, column: targetColumn } : t
      );
      onTasksChange(updated);
    }
  }

  function handleDragCancel() {
    setActiveId(null);
    setOverColumnId(null);
  }

  return (
    <div>
      <SortBar
        sortBy={sortBy}
        sortDir={sortDir}
        onSortChange={(by, dir) => { setSortBy(by); setSortDir(dir); }}
        filterText={filterText}
        onFilterChange={setFilterText}
        c={c}
        sortOptions={sortOptions}
      />
      <DndContext
        sensors={sensors}
        collisionDetection={closestColumnCollision}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div style={{ display: "flex", gap: 16 }}>
          {columns.map((col) => (
            <DroppableColumn
              key={col.id}
              column={col}
              tasks={sortTasks(filteredTasks.filter((t) => t.column === col.id))}
              c={c}
              onAddTask={onAddTask}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
              isOver={overColumnId === col.id && activeId !== null}
            />
          ))}
        </div>
        <DragOverlay dropAnimation={null}>
          {activeTask ? <CardOverlay task={activeTask} c={c} /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
