import React, { useState, useEffect } from "react";
import { Icons } from "../components/Icons";
import { UrgencyBadge, daysUntil, formatDate } from "../components/Shared";

// Clock component with multiple styles
function ClockWidget({ c, settings }) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  if (settings.showClock === false) return null;

  const is12h = settings.clockFormat !== "24h";
  let hours = time.getHours();
  const minutes = time.getMinutes().toString().padStart(2, "0");
  const seconds = time.getSeconds().toString().padStart(2, "0");
  let ampm = "";

  if (is12h) {
    ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
  }
  const hoursStr = is12h ? hours.toString() : hours.toString().padStart(2, "0");

  const dateStr = time.toLocaleDateString("en-US", {
    weekday: "short", month: "short", day: "numeric",
  });

  const clockStyle = settings.clockStyle || "digital";

  // Analog clock
  if (clockStyle === "analog") {
    const h = time.getHours() % 12;
    const m = time.getMinutes();
    const s = time.getSeconds();
    const hourDeg = (h + m / 60) * 30;
    const minDeg = (m + s / 60) * 6;
    const secDeg = s * 6;
    const size = 80;
    const cx = size / 2;

    return (
      <div style={{ textAlign: "right" }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle cx={cx} cy={cx} r={cx - 2} fill="none" stroke={c.border} strokeWidth="2" />
          {/* Hour markers */}
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = (i * 30 - 90) * (Math.PI / 180);
            const inner = cx - 8;
            const outer = cx - 3;
            return (
              <line
                key={i}
                x1={cx + inner * Math.cos(angle)} y1={cx + inner * Math.sin(angle)}
                x2={cx + outer * Math.cos(angle)} y2={cx + outer * Math.sin(angle)}
                stroke={c.textMuted} strokeWidth={i % 3 === 0 ? 2 : 1}
              />
            );
          })}
          {/* Hour hand */}
          <line
            x1={cx} y1={cx}
            x2={cx + 20 * Math.cos((hourDeg - 90) * Math.PI / 180)}
            y2={cx + 20 * Math.sin((hourDeg - 90) * Math.PI / 180)}
            stroke={c.text} strokeWidth="2.5" strokeLinecap="round"
          />
          {/* Minute hand */}
          <line
            x1={cx} y1={cx}
            x2={cx + 28 * Math.cos((minDeg - 90) * Math.PI / 180)}
            y2={cx + 28 * Math.sin((minDeg - 90) * Math.PI / 180)}
            stroke={c.text} strokeWidth="1.5" strokeLinecap="round"
          />
          {/* Second hand */}
          {settings.showSeconds !== false && (
            <line
              x1={cx} y1={cx}
              x2={cx + 30 * Math.cos((secDeg - 90) * Math.PI / 180)}
              y2={cx + 30 * Math.sin((secDeg - 90) * Math.PI / 180)}
              stroke={c.accent} strokeWidth="1" strokeLinecap="round"
            />
          )}
          <circle cx={cx} cy={cx} r="2.5" fill={c.accent} />
        </svg>
        <div style={{ fontSize: 11, color: c.textMuted, marginTop: 4, fontWeight: 500 }}>
          {dateStr}
        </div>
      </div>
    );
  }

  // Minimal clock
  if (clockStyle === "minimal") {
    return (
      <div style={{ textAlign: "right" }}>
        <div style={{
          fontSize: 18, fontWeight: 600, color: c.textSecondary,
          fontVariantNumeric: "tabular-nums", letterSpacing: 1,
        }}>
          {hoursStr}:{minutes}
          {settings.showSeconds && (
            <span style={{ fontSize: 14, opacity: 0.7 }}>:{seconds}</span>
          )}
          {is12h && (
            <span style={{ fontSize: 10, color: c.textMuted, marginLeft: 3 }}>{ampm}</span>
          )}
        </div>
        <div style={{ fontSize: 11, color: c.textMuted, fontWeight: 500 }}>
          {dateStr}
        </div>
      </div>
    );
  }

  // Default: digital
  return (
    <div style={{ textAlign: "right" }}>
      <div style={{
        fontSize: 28, fontWeight: 800, color: c.text,
        fontVariantNumeric: "tabular-nums", letterSpacing: 2,
        lineHeight: 1,
      }}>
        {hoursStr}
        <span style={{ opacity: 0.4, margin: "0 2px" }}>:</span>
        {minutes}
        {settings.showSeconds && (
          <>
            <span style={{ opacity: 0.4, margin: "0 2px" }}>:</span>
            <span style={{ fontSize: 20 }}>{seconds}</span>
          </>
        )}
        {is12h && (
          <span style={{
            fontSize: 12, fontWeight: 600, color: c.textMuted,
            marginLeft: 4, letterSpacing: 0.5,
          }}>
            {ampm}
          </span>
        )}
      </div>
      <div style={{
        fontSize: 11, color: c.textMuted, marginTop: 2,
        fontWeight: 500,
      }}>
        {dateStr}
      </div>
    </div>
  );
}

export default function HomePage({ c, setPage, projects, semesters = [], gradApps = [], jobApps = [], settings = {}, onOpenItem }) {
  const allDeadlines = [];

  // Project deadlines (exclude archived and fully completed)
  projects.filter((p) => !p.archived).forEach((p) => {
    const days = daysUntil(p.deadline);
    const totalTasks = p.tasks.length;
    const doneTasks = p.tasks.filter((t) => t.column === "done").length;
    if (totalTasks > 0 && doneTasks === totalTasks) return; // all done, skip
    const inProgress = p.tasks.filter((t) => t.column === "inprogress").length;
    let status = "todo";
    if (inProgress > 0 || doneTasks > 0) status = "inprogress";
    allDeadlines.push({
      title: p.name, context: "Projects",
      daysLeft: days, type: "project", status,
      statusLabel: status === "inprogress" ? (settings.projectCol2 || "In Progress")
        : (settings.projectCol1 || "To Do"),
      projectId: p.id,
    });
  });

  // Class deadlines (active semester — exclude submitted/finished items)
  const activeSemester = semesters.find((s) => s.active);
  const activeClasses = activeSemester?.classes || [];

  activeClasses.forEach((cls) => {
    cls.items
      .filter((it) => it.dueDate && it.column !== "submitted")
      .forEach((it) => {
        const statusMap = {
          not_started: settings.classCol1 || "Not Started",
          working: settings.classCol2 || "Working",
        };
        allDeadlines.push({
          title: it.title,
          context: `${cls.name}${cls.subtitle ? ` — ${cls.subtitle}` : ""}`,
          daysLeft: daysUntil(it.dueDate), type: "class", itemType: it.type,
          status: it.column, statusLabel: statusMap[it.column] || it.column,
          classId: cls.id, itemId: it.id,
        });
      });
  });

  // Grad app deadlines (exclude decision stage)
  gradApps
    .filter((s) => s.deadline && s.stage !== "decision")
    .forEach((s) => {
      allDeadlines.push({
        title: `${s.name} — ${s.program}`, context: "Schools",
        daysLeft: daysUntil(s.deadline), type: "gradapp", stage: s.stage,
        status: s.stage, statusLabel: s.stage,
        schoolId: s.id,
      });
    });

  // Job app deadlines (exclude offer/closed stage)
  jobApps
    .filter((j) => j.deadline && j.stage !== "offer")
    .forEach((j) => {
      allDeadlines.push({
        title: `${j.company} — ${j.role}`, context: "Jobs",
        daysLeft: daysUntil(j.deadline), type: "jobapp", stage: j.stage,
        status: j.stage, statusLabel: j.stage,
        jobId: j.id,
      });
    });

  allDeadlines.sort((a, b) => a.daysLeft - b.daysLeft);

  // Stats (exclude archived projects)
  const nonArchivedProjects = projects.filter((p) => !p.archived);
  const activeProjectCount = nonArchivedProjects.length;
  const inProgressTasks = nonArchivedProjects.reduce(
    (sum, p) => sum + p.tasks.filter((t) => t.column === "inprogress").length, 0
  );
  const upcomingClassItems = activeClasses.reduce(
    (sum, cls) => sum + cls.items.filter(
      (it) => it.column !== "submitted" && it.dueDate && daysUntil(it.dueDate) <= 7
    ).length, 0
  );
  const totalClassItems = activeClasses.reduce((sum, cls) => sum + cls.items.length, 0);
  const totalSchools = gradApps.length;
  const docsProgress = gradApps.length > 0
    ? (() => {
        const total = gradApps.reduce((sum, s) => sum + (s.requiredDocs || []).length, 0);
        if (total === 0) return 0;
        const done = gradApps.reduce((sum, s) => sum + (s.requiredDocs || []).filter((d) => d.done).length, 0);
        return Math.round((done / total) * 100);
      })()
    : 0;

  // Job Apps stats
  const totalJobApps = jobApps.length;
  const jobInterviewing = jobApps.filter((j) => j.stage === "interviewing").length;
  const jobOffers = jobApps.filter((j) => j.stage === "offer").length;

  const urgentDeadlines = allDeadlines.filter((d) => d.daysLeft <= 3 && d.daysLeft >= 0);
  const maxDeadlines = settings.maxDeadlines || 10;

  const hour = new Date().getHours();
  let greeting = "Good morning";
  if (hour >= 12 && hour < 17) greeting = "Good afternoon";
  if (hour >= 17) greeting = "Good evening";

  return (
    <div>
      {/* Header with greeting + clock */}
      <div style={{
        display: "flex", justifyContent: "space-between",
        alignItems: "flex-start", marginBottom: 28,
      }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: c.text, margin: 0 }}>
            {greeting} ✦
          </h2>
          <p style={{ fontSize: 14, color: c.textMuted, margin: "6px 0 0" }}>
            Here's your productivity overview for today.
          </p>
        </div>
        <ClockWidget c={c} settings={settings} />
      </div>

      {/* Alert Banner */}
      {settings.showAlertBanner !== false && urgentDeadlines.length > 0 && (
        <div style={{
          background: c.redBg, border: `1px solid ${c.red}33`, borderRadius: 12,
          padding: "14px 18px", marginBottom: 24, display: "flex",
          alignItems: "center", gap: 10, flexWrap: "wrap",
        }}>
          <span style={{ color: c.red }}><Icons.AlertTriangle /></span>
          <span style={{ fontSize: 13, color: c.red, fontWeight: 600 }}>
            {urgentDeadlines.length} deadline{urgentDeadlines.length > 1 ? "s" : ""} within 3 days
          </span>
          <span style={{ fontSize: 12, color: c.textMuted, marginLeft: 8 }}>
            {urgentDeadlines.slice(0, 4).map((d) => `${d.title} (${d.daysLeft}d)`).join(" · ")}
          </span>
        </div>
      )}

      {/* Summary Cards */}
      {(() => {
        const allWidgets = {
          projects: {
            icon: <Icons.Folder />, label: "Projects",
            stat: `${activeProjectCount} active`,
            detail: `${inProgressTasks} tasks in progress`,
            color: c.purple, page: "projects",
          },
          classes: {
            icon: <Icons.Book />, label: "Classes",
            stat: `${activeClasses.length} classes`,
            detail: upcomingClassItems > 0 ? `${upcomingClassItems} due this week` : `${totalClassItems} total items`,
            color: c.blue, page: "classes",
          },
          gradapps: {
            icon: <Icons.GradCap />, label: "Schools",
            stat: `${totalSchools} school${totalSchools !== 1 ? "s" : ""}`,
            detail: `${docsProgress}% docs complete`,
            color: c.cyan, page: "gradapps",
          },
          jobapps: {
            icon: <Icons.Briefcase />, label: "Jobs",
            stat: `${totalJobApps} job${totalJobApps !== 1 ? "s" : ""}`,
            detail: jobInterviewing > 0 ? `${jobInterviewing} interviewing` : jobOffers > 0 ? `${jobOffers} offer${jobOffers !== 1 ? "s" : ""}` : "Track your applications",
            color: c.amber, page: "jobapps",
          },
        };
        const defaultOrder = [
          { id: "projects", visible: true },
          { id: "classes", visible: true },
          { id: "gradapps", visible: true },
          { id: "jobapps", visible: true },
        ];
        // Merge: keep saved order but append any new widgets not yet in saved settings
        const saved = settings.dashboardWidgets || defaultOrder;
        const savedIds = new Set(saved.map((w) => w.id));
        const widgetOrder = [...saved, ...defaultOrder.filter((w) => !savedIds.has(w.id))];
        const visibleWidgets = widgetOrder.filter((w) => w.visible && allWidgets[w.id]);
        const cols = visibleWidgets.length || 1;

        return (
          <div style={{
            display: "grid",
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gap: 16, marginBottom: 28,
          }}>
            {visibleWidgets.map((w) => {
              const item = allWidgets[w.id];
              return (
                <div
                  key={w.id}
                  onClick={() => setPage(item.page)}
                  style={{
                    background: c.bgCard, border: `1px solid ${c.border}`,
                    borderRadius: 14, padding: 20, cursor: "pointer",
                    transition: "all 0.2s", position: "relative", overflow: "hidden",
                  }}
                >
                  <div style={{
                    position: "absolute", top: -20, right: -20,
                    width: 80, height: 80, borderRadius: "50%",
                    background: item.color, opacity: 0.06,
                  }} />
                  <div style={{
                    display: "flex", alignItems: "center", gap: 10,
                    marginBottom: 12, color: item.color,
                  }}>
                    {item.icon}
                    <span style={{
                      fontSize: 13, fontWeight: 700,
                      textTransform: "uppercase", letterSpacing: 0.8,
                    }}>{item.label}</span>
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: c.text, marginBottom: 4 }}>
                    {item.stat}
                  </div>
                  <div style={{ fontSize: 12, color: c.textMuted }}>{item.detail}</div>
                  <div style={{
                    display: "flex", justifyContent: "flex-end",
                    marginTop: 8, color: c.textMuted,
                  }}>
                    <Icons.ChevronRight />
                  </div>
                </div>
              );
            })}
          </div>
        );
      })()}

      {/* Upcoming Deadlines */}
      {settings.showDeadlineList !== false && (
        <>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: c.text, marginBottom: 14 }}>
            Upcoming Deadlines
          </h3>

          <div style={{
            background: c.bgCard, border: `1px solid ${c.border}`,
            borderRadius: 14, overflow: "hidden",
          }}>
            {allDeadlines.length === 0 ? (
              <div style={{
                padding: "24px 18px", textAlign: "center",
                color: c.textMuted, fontSize: 13,
              }}>
                No upcoming deadlines — nice work!
              </div>
            ) : (
              allDeadlines.slice(0, maxDeadlines).map((d, i) => (
                <div
                  key={i}
                  onClick={() => {
                    if (onOpenItem) {
                      onOpenItem(d);
                    } else {
                      if (d.type === "project") setPage("projects");
                      else if (d.type === "class") setPage("classes");
                      else if (d.type === "gradapp") setPage("gradapps");
                      else if (d.type === "jobapp") setPage("jobapps");
                    }
                  }}
                  style={{
                    display: "flex", alignItems: "center",
                    padding: "14px 18px", cursor: "pointer",
                    borderBottom: i < Math.min(allDeadlines.length, maxDeadlines) - 1
                      ? `1px solid ${c.borderLight}` : "none",
                    gap: 12, transition: "background 0.1s",
                  }}
                >
                  <div style={{
                    color: d.type === "class" ? c.blue
                      : d.type === "gradapp" ? c.cyan
                      : d.type === "jobapp" ? c.amber : c.purple,
                  }}>
                    {d.type === "gradapp" ? <Icons.GradCap /> : d.type === "project" ? <Icons.Folder /> : d.type === "jobapp" ? <Icons.Briefcase /> : <Icons.FileText />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: c.text }}>{d.title}</div>
                    <div style={{ fontSize: 11, color: c.textMuted }}>{d.context}</div>
                  </div>
                  {/* Status badge */}
                  <span style={{
                    fontSize: 10, fontWeight: 600,
                    padding: "2px 7px", borderRadius: 4, flexShrink: 0,
                    color: d.status === "done" || d.status === "submitted" || d.status === "decision"
                      ? c.green : d.status === "inprogress" || d.status === "working"
                      ? c.amber : c.textMuted,
                    background: d.status === "done" || d.status === "submitted" || d.status === "decision"
                      ? c.greenBg : d.status === "inprogress" || d.status === "working"
                      ? c.amberBg : c.bgKanban,
                  }}>
                    {d.statusLabel}
                  </span>
                  {d.itemType && (
                    <span style={{
                      fontSize: 10, fontWeight: 600, textTransform: "uppercase",
                      color: d.itemType === "exam" ? c.red : d.itemType === "reading" ? c.amber : c.blue,
                      background: d.itemType === "exam" ? c.redBg : d.itemType === "reading" ? c.amberBg : c.blueBg,
                      padding: "2px 6px", borderRadius: 4, flexShrink: 0,
                    }}>
                      {d.itemType}
                    </span>
                  )}
                  <UrgencyBadge daysLeft={d.daysLeft} c={c} />
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
