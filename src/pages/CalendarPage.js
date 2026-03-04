import React, { useState } from "react";
import { Icons } from "../components/Icons";
import { daysUntil, formatDate } from "../components/Shared";

// Helper: get all deadlines from all sections
function collectDeadlines(projects, semesters, gradApps, jobApps) {
  const items = [];

  projects.filter((p) => !p.archived).forEach((p) => {
    if (p.deadline) {
      const incomplete = p.tasks.filter((t) => t.column !== "done").length;
      const allDone = p.tasks.length > 0 && incomplete === 0;
      items.push({
        id: p.id, date: p.deadline, title: p.name,
        subtitle: allDone ? "All tasks complete" : `${incomplete} tasks remaining`,
        section: "projects", color: "purple",
        done: allDone,
      });
    }
  });

  const activeSem = semesters.find((s) => s.active);
  (activeSem?.classes || []).forEach((cls) => {
    cls.items
      .filter((it) => it.dueDate)
      .forEach((it) => {
        items.push({
          id: it.id, date: it.dueDate, title: it.title,
          subtitle: `${cls.name} · ${it.type || "item"}`,
          section: "classes", color: "blue",
          type: it.type,
          done: it.column === "submitted",
          classId: cls.id,
        });
      });
  });

  gradApps
    .filter((s) => s.deadline)
    .forEach((s) => {
      items.push({
        id: s.id, date: s.deadline, title: `${s.name} — ${s.program}`,
        subtitle: `Grad App · ${s.stage}`,
        section: "gradapps", color: "cyan",
        done: s.stage === "decision",
        schoolId: s.id,
      });
    });

  (jobApps || [])
    .filter((j) => j.deadline)
    .forEach((j) => {
      items.push({
        id: j.id, date: j.deadline, title: `${j.company} — ${j.role}`,
        subtitle: `Job App · ${j.stage}`,
        section: "jobapps", color: "amber",
        done: j.stage === "offer",
        jobId: j.id,
      });
    });

  return items;
}

// Hover tooltip for calendar items
function CalendarTooltip({ item, c, style }) {
  const dotColor = c[item.color] || c.textMuted;
  return (
    <div style={{
      position: "absolute", zIndex: 100,
      background: c.bgCard, border: `1px solid ${c.border}`,
      borderRadius: 10, padding: "10px 14px", width: 220,
      boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
      pointerEvents: "none",
      ...style,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: dotColor, flexShrink: 0 }} />
        <div style={{ fontSize: 13, fontWeight: 700, color: c.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {item.title}
        </div>
      </div>
      <div style={{ fontSize: 11, color: c.textMuted, marginBottom: 4 }}>{item.subtitle}</div>
      <div style={{ fontSize: 11, color: c.textSecondary }}>
        {formatDate(item.date)}
        {item.done && <span style={{ color: c.green, fontWeight: 600, marginLeft: 6 }}>✓ Complete</span>}
      </div>
      <div style={{ fontSize: 10, color: c.textMuted, marginTop: 6, fontStyle: "italic" }}>Click to open</div>
    </div>
  );
}

// Monthly calendar grid
function MonthGrid({ year, month, deadlines, c, today, onItemClick }) {
  const [hoverItem, setHoverItem] = useState(null);
  const [hoverPos, setHoverPos] = useState({ x: 0, y: 0 });
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDow = firstDay.getDay(); // 0=Sun
  const daysInMonth = lastDay.getDate();

  const prevMonthLast = new Date(year, month, 0).getDate();

  const weeks = [];
  let dayNum = 1;
  let nextMonthDay = 1;

  for (let w = 0; w < 6; w++) {
    const week = [];
    for (let d = 0; d < 7; d++) {
      const cellIdx = w * 7 + d;
      if (cellIdx < startDow) {
        // Previous month
        week.push({ day: prevMonthLast - startDow + d + 1, inMonth: false, date: null });
      } else if (dayNum > daysInMonth) {
        // Next month
        week.push({ day: nextMonthDay++, inMonth: false, date: null });
      } else {
        const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
        week.push({ day: dayNum, inMonth: true, date: dateStr });
        dayNum++;
      }
    }
    weeks.push(week);
    if (dayNum > daysInMonth && w >= 3) break;
  }

  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  // Build deadline map
  const deadlineMap = {};
  deadlines.forEach((d) => {
    if (!deadlineMap[d.date]) deadlineMap[d.date] = [];
    deadlineMap[d.date].push(d);
  });

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div>
      {/* Day headers */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 1,
        marginBottom: 4,
      }}>
        {dayNames.map((d) => (
          <div key={d} style={{
            textAlign: "center", fontSize: 11, fontWeight: 700,
            color: c.textMuted, padding: "8px 0",
            textTransform: "uppercase", letterSpacing: 1,
          }}>
            {d}
          </div>
        ))}
      </div>

      {/* Week rows */}
      {weeks.map((week, wi) => (
        <div key={wi} style={{
          display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 1,
        }}>
          {week.map((cell, di) => {
            const items = cell.date ? (deadlineMap[cell.date] || []) : [];
            const isToday = cell.date === todayStr;
            const isPast = cell.date && cell.date < todayStr && cell.inMonth;
            const days = cell.date ? daysUntil(cell.date) : null;

            return (
              <div
                key={di}
                style={{
                  minHeight: 90, padding: "4px 6px",
                  background: isToday ? c.accentGlow : c.bgCard,
                  border: `1px solid ${isToday ? c.accent : c.borderLight}`,
                  borderRadius: 6,
                  opacity: cell.inMonth ? 1 : 0.35,
                }}
              >
                <div style={{
                  fontSize: 12, fontWeight: isToday ? 800 : 500,
                  color: isToday ? c.accentLight : isPast ? c.textMuted : c.text,
                  marginBottom: 4,
                  display: "flex", alignItems: "center", gap: 4,
                }}>
                  {isToday && (
                    <div style={{
                      width: 6, height: 6, borderRadius: "50%",
                      background: c.accent,
                    }} />
                  )}
                  {cell.day}
                </div>
                {items.slice(0, 3).map((item, i) => {
                  const dotColor = c[item.color] || c.textMuted;
                  const urgent = days !== null && days <= 2 && days >= 0 && !item.done;
                  return (
                    <div
                      key={i}
                      onClick={(e) => { e.stopPropagation(); onItemClick && onItemClick(item); }}
                      onMouseEnter={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setHoverPos({ x: rect.right + 8, y: rect.top });
                        setHoverItem(item);
                      }}
                      onMouseLeave={() => setHoverItem(null)}
                      style={{
                        fontSize: 10, fontWeight: 600, lineHeight: 1.3,
                        color: item.done ? c.textMuted : urgent ? c.red : c.textSecondary,
                        padding: "2px 4px", marginBottom: 2,
                        background: item.done ? `${c.textMuted}10` : urgent ? c.redBg : `${dotColor}15`,
                        borderRadius: 4,
                        borderLeft: `2px solid ${item.done ? c.textMuted : dotColor}`,
                        overflow: "hidden", textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        textDecoration: item.done ? "line-through" : "none",
                        cursor: "pointer", position: "relative",
                      }}
                    >
                      {item.title}
                    </div>
                  );
                })}
                {items.length > 3 && (
                  <div style={{ fontSize: 9, color: c.textMuted, padding: "0 4px" }}>
                    +{items.length - 3} more
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}

      {/* Hover popup */}
      {hoverItem && (
        <CalendarTooltip
          item={hoverItem}
          c={c}
          style={{
            position: "fixed",
            left: Math.min(hoverPos.x, window.innerWidth - 240),
            top: Math.max(hoverPos.y - 10, 8),
          }}
        />
      )}
    </div>
  );
}

// Agenda/timeline view — vertical list grouped by week
function AgendaView({ deadlines, c, today, onItemClick }) {
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  // Sort by date
  const sorted = [...deadlines].sort((a, b) => a.date.localeCompare(b.date));

  // Group by week
  function getWeekStart(dateStr) {
    const d = new Date(dateStr + "T00:00:00");
    const day = d.getDay();
    const diff = d.getDate() - day;
    const ws = new Date(d.setDate(diff));
    return `${ws.getFullYear()}-${String(ws.getMonth() + 1).padStart(2, "0")}-${String(ws.getDate()).padStart(2, "0")}`;
  }

  const groups = {};
  sorted.forEach((item) => {
    const ws = getWeekStart(item.date);
    if (!groups[ws]) groups[ws] = [];
    groups[ws].push(item);
  });

  const weekKeys = Object.keys(groups).sort();

  if (weekKeys.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "40px 20px", color: c.textMuted, fontSize: 14 }}>
        No upcoming deadlines to display
      </div>
    );
  }

  const dayFormatter = new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric" });
  const weekFormatter = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {weekKeys.map((ws) => {
        const weekEnd = new Date(ws + "T00:00:00");
        weekEnd.setDate(weekEnd.getDate() + 6);
        const weekLabel = `${weekFormatter.format(new Date(ws + "T00:00:00"))} — ${weekFormatter.format(weekEnd)}`;

        return (
          <div key={ws}>
            <div style={{
              fontSize: 12, fontWeight: 700, color: c.textSecondary,
              textTransform: "uppercase", letterSpacing: 1, marginBottom: 10,
              paddingBottom: 6, borderBottom: `1px solid ${c.border}`,
            }}>
              {weekLabel}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {groups[ws].map((item) => {
                const days = daysUntil(item.date);
                const isPast = item.date < todayStr;
                const isToday = item.date === todayStr;
                const urgent = days <= 2 && days >= 0;
                const dotColor = c[item.color] || c.textMuted;

                return (
                  <div key={item.id} onClick={() => onItemClick && onItemClick(item)} style={{
                    display: "flex", alignItems: "center", gap: 14,
                    padding: "12px 16px", background: c.bgCard,
                    border: `1px solid ${isToday ? c.accent : c.borderLight}`,
                    borderRadius: 10, borderLeft: `3px solid ${item.done ? c.textMuted : dotColor}`,
                    opacity: isPast && !isToday ? 0.5 : item.done ? 0.6 : 1,
                    cursor: onItemClick ? "pointer" : "default",
                    transition: "all 0.1s",
                  }}>
                    {/* Date column */}
                    <div style={{
                      width: 56, textAlign: "center", flexShrink: 0,
                    }}>
                      <div style={{
                        fontSize: 20, fontWeight: 800,
                        color: urgent ? c.red : isToday ? c.accent : c.text,
                      }}>
                        {new Date(item.date + "T00:00:00").getDate()}
                      </div>
                      <div style={{
                        fontSize: 10, fontWeight: 600, color: c.textMuted,
                        textTransform: "uppercase",
                      }}>
                        {dayFormatter.format(new Date(item.date + "T00:00:00")).split(",")[0]}
                      </div>
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: 13, fontWeight: 600, color: item.done ? c.textMuted : c.text,
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                        textDecoration: item.done ? "line-through" : "none",
                      }}>
                        {item.title}
                      </div>
                      <div style={{ fontSize: 11, color: c.textMuted, marginTop: 2 }}>
                        {item.subtitle}
                      </div>
                    </div>

                    {/* Badge */}
                    <div style={{
                      flexShrink: 0, display: "flex", flexDirection: "column",
                      alignItems: "flex-end", gap: 4,
                    }}>
                      {item.done ? (
                        <span style={{
                          fontSize: 10, fontWeight: 700,
                          padding: "2px 8px", borderRadius: 6,
                          color: c.green, background: c.greenBg,
                        }}>✓ Done</span>
                      ) : (
                        <span style={{
                          fontSize: 10, fontWeight: 700, textTransform: "uppercase",
                          padding: "2px 8px", borderRadius: 6,
                          color: item.section === "projects" ? c.purple
                            : item.section === "classes" ? c.blue
                            : item.section === "jobapps" ? c.amber : c.cyan,
                          background: item.section === "projects" ? c.purpleBg
                            : item.section === "classes" ? c.blueBg
                            : item.section === "jobapps" ? c.amberBg : c.blueBg,
                        }}>
                          {item.section === "projects" ? "Project"
                            : item.section === "classes" ? (item.type || "Class")
                            : item.section === "jobapps" ? "Job" : "School"}
                        </span>
                      )}
                      {!isPast && (
                        <span style={{
                          fontSize: 11, fontWeight: 700,
                          color: urgent ? c.red : days <= 7 ? c.amber : c.green,
                        }}>
                          {isToday ? "Today" : days === 1 ? "Tomorrow" : `${days}d`}
                        </span>
                      )}
                      {isPast && (
                        <span style={{ fontSize: 11, fontWeight: 600, color: c.textMuted }}>
                          Past
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Section filter chips
function FilterChips({ filters, onToggle, c }) {
  const chips = [
    { id: "projects", label: "Projects", color: c.purple },
    { id: "classes", label: "Classes", color: c.blue },
    { id: "gradapps", label: "Schools", color: c.cyan },
    { id: "jobapps", label: "Jobs", color: c.amber },
  ];
  return (
    <div style={{ display: "flex", gap: 6 }}>
      {chips.map((chip) => {
        const active = filters.includes(chip.id);
        return (
          <button
            key={chip.id}
            onClick={() => onToggle(chip.id)}
            style={{
              padding: "5px 12px", borderRadius: 8, fontSize: 11,
              fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
              border: active ? `1.5px solid ${chip.color}` : `1px solid ${c.border}`,
              background: active ? `${chip.color}18` : "transparent",
              color: active ? chip.color : c.textMuted,
              transition: "all 0.15s",
            }}
          >
            {chip.label}
          </button>
        );
      })}
    </div>
  );
}

export default function CalendarPage({ c, projects, semesters, gradApps, jobApps, onNavigate }) {
  const today = new Date();
  const [viewMode, setViewMode] = useState("month"); // "month" or "agenda"
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [filters, setFilters] = useState(["projects", "classes", "gradapps", "jobapps"]);

  const allDeadlines = collectDeadlines(projects, semesters, gradApps, jobApps);
  const filteredDeadlines = allDeadlines.filter((d) => filters.includes(d.section));

  function handleItemClick(item) {
    if (!onNavigate) return;
    if (item.section === "projects") onNavigate("projects", { type: "project", projectId: item.id });
    else if (item.section === "classes") onNavigate("classes", { type: "class", classId: item.classId, itemId: item.id });
    else if (item.section === "gradapps") onNavigate("gradapps", { type: "gradapp", schoolId: item.id });
    else if (item.section === "jobapps") onNavigate("jobapps", { type: "jobapp", jobId: item.id });
  }

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  function prevMonth() {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  }

  function nextMonth() {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  }

  function goToday() {
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
  }

  function toggleFilter(id) {
    setFilters((f) =>
      f.includes(id) ? f.filter((x) => x !== id) : [...f, id]
    );
  }

  // For agenda: show items in a 2-month window around current month
  const agendaStart = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-01`;
  const endMonth = currentMonth + 2;
  const endYear = endMonth > 12 ? currentYear + 1 : currentYear;
  const agendaEnd = `${endYear}-${String(((endMonth - 1) % 12) + 1).padStart(2, "0")}-31`;
  const agendaDeadlines = filteredDeadlines.filter((d) => d.date >= agendaStart && d.date <= agendaEnd);

  return (
    <div>
      {/* Header */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        marginBottom: 20,
      }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: c.text, margin: 0 }}>Calendar</h2>
          <p style={{ fontSize: 13, color: c.textMuted, margin: "4px 0 0" }}>
            {filteredDeadlines.length} deadline{filteredDeadlines.length !== 1 ? "s" : ""} across all sections
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <FilterChips filters={filters} onToggle={toggleFilter} c={c} />
          <div style={{
            display: "flex", background: c.bgKanban, borderRadius: 8,
            border: `1px solid ${c.border}`, overflow: "hidden",
          }}>
            {[
              { id: "month", label: "Month" },
              { id: "agenda", label: "Agenda" },
            ].map((mode) => (
              <button
                key={mode.id}
                onClick={() => setViewMode(mode.id)}
                style={{
                  padding: "6px 14px", fontSize: 12, fontWeight: 600,
                  border: "none", cursor: "pointer", fontFamily: "inherit",
                  background: viewMode === mode.id ? c.accentGlow : "transparent",
                  color: viewMode === mode.id ? c.accentLight : c.textMuted,
                  transition: "all 0.15s",
                }}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Month navigation */}
      <div style={{
        display: "flex", alignItems: "center", gap: 12, marginBottom: 20,
      }}>
        <button onClick={prevMonth} style={{
          background: c.bgCard, border: `1px solid ${c.border}`, borderRadius: 8,
          padding: "6px 10px", cursor: "pointer", color: c.textSecondary,
          display: "flex", fontFamily: "inherit",
        }}>
          ←
        </button>
        <h3 style={{
          fontSize: 18, fontWeight: 700, color: c.text, margin: 0,
          minWidth: 200, textAlign: "center",
        }}>
          {monthNames[currentMonth]} {currentYear}
        </h3>
        <button onClick={nextMonth} style={{
          background: c.bgCard, border: `1px solid ${c.border}`, borderRadius: 8,
          padding: "6px 10px", cursor: "pointer", color: c.textSecondary,
          display: "flex", fontFamily: "inherit",
        }}>
          →
        </button>
        <button onClick={goToday} style={{
          background: c.accentGlow, border: `1px solid ${c.accent}`, borderRadius: 8,
          padding: "5px 14px", cursor: "pointer", color: c.accentLight,
          fontSize: 12, fontWeight: 600, fontFamily: "inherit",
        }}>
          Today
        </button>
      </div>

      {/* Views */}
      {viewMode === "month" && (
        <MonthGrid
          year={currentYear}
          month={currentMonth}
          deadlines={filteredDeadlines}
          c={c}
          today={today}
          onItemClick={handleItemClick}
        />
      )}
      {viewMode === "agenda" && (
        <AgendaView
          deadlines={agendaDeadlines}
          c={c}
          today={today}
          onItemClick={handleItemClick}
        />
      )}
    </div>
  );
}
