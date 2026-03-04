import React from "react";
import { Icons } from "./Icons";

const ALL_NAV_ITEMS = [
  { id: "home", icon: <Icons.Home />, label: "Home" },
  { id: "projects", icon: <Icons.Folder />, label: "Projects" },
  { id: "classes", icon: <Icons.Book />, label: "Classes" },
  { id: "gradapps", icon: <Icons.GradCap />, label: "Schools" },
  { id: "jobapps", icon: <Icons.Briefcase />, label: "Jobs" },
  { id: "calendar", icon: <Icons.Calendar />, label: "Calendar" },
];

const DEFAULT_SIDEBAR_PAGES = [
  { id: "home", visible: true },
  { id: "projects", visible: true },
  { id: "classes", visible: true },
  { id: "gradapps", visible: true },
  { id: "jobapps", visible: true },
  { id: "calendar", visible: true },
];

export default function Sidebar({ page, setPage, isDark, setIsDark, c, settings = {} }) {
  const isMac = window.electronAPI?.platform === "darwin";
  const savedPages = settings.sidebarPages || DEFAULT_SIDEBAR_PAGES;
  const savedIds = new Set(savedPages.map((p) => p.id));
  const sidebarPages = [...savedPages, ...DEFAULT_SIDEBAR_PAGES.filter((p) => !savedIds.has(p.id))];
  const navItemMap = Object.fromEntries(ALL_NAV_ITEMS.map((n) => [n.id, n]));
  // Build visible nav items in user-defined order
  const navItems = sidebarPages
    .filter((sp) => sp.visible && navItemMap[sp.id])
    .map((sp) => navItemMap[sp.id]);

  return (
    <div
      style={{
        width: 180,
        background: c.bgSecondary,
        borderRight: `1px solid ${c.border}`,
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        transition: "background 0.3s",
      }}
    >
      {/* Title bar clearance zone — draggable, no content */}
      <div style={{
        height: isMac ? 48 : 36,
        WebkitAppRegion: "drag",
        flexShrink: 0,
      }} />

      {/* Logo — sits below traffic lights */}
      <div style={{
        padding: "0 16px 16px",
        borderBottom: `1px solid ${c.border}`,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 28, height: 28, borderRadius: 8,
              background: `linear-gradient(135deg, ${c.accent}, ${c.purple})`,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontSize: 14, fontWeight: 800, flexShrink: 0,
            }}
          >
            ◆
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: c.text, letterSpacing: -0.3 }}>
              Nexus
            </div>
            <div style={{
              fontSize: 9, color: c.textMuted, fontWeight: 600,
              textTransform: "uppercase", letterSpacing: 1.2,
            }}>
              Dashboard
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div style={{ padding: "12px 8px", flex: 1 }}>
        {navItems.map((item) => (
          <div
            key={item.id}
            onClick={() => setPage(item.id)}
            style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "9px 12px", borderRadius: 8, marginBottom: 2,
              cursor: "pointer", transition: "all 0.15s",
              background: page === item.id ? c.accentGlow : "transparent",
              color: page === item.id ? c.accentLight : c.textSecondary,
              fontWeight: page === item.id ? 700 : 500,
              fontSize: 13,
            }}
          >
            {item.icon}
            {item.label}
          </div>
        ))}
      </div>

      {/* Bottom controls */}
      <div style={{ padding: "10px 12px", borderTop: `1px solid ${c.border}` }}>
        <div
          onClick={() => setPage("settings")}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "7px 10px", borderRadius: 8, cursor: "pointer",
            color: page === "settings" ? c.accentLight : c.textMuted,
            background: page === "settings" ? c.accentGlow : "transparent",
            fontSize: 12, fontWeight: page === "settings" ? 700 : 500,
            transition: "all 0.15s",
          }}
        >
          <Icons.Settings />
          <span>Settings</span>
        </div>
        <div
          onClick={() => setIsDark(!isDark)}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "7px 10px", borderRadius: 8, cursor: "pointer",
            color: c.textMuted, fontSize: 12, marginTop: 2,
          }}
        >
          {isDark ? <Icons.Sun /> : <Icons.Moon />}
          <span>{isDark ? "Light Mode" : "Dark Mode"}</span>
        </div>
      </div>
    </div>
  );
}

export { ALL_NAV_ITEMS, DEFAULT_SIDEBAR_PAGES };
