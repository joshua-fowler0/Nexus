import React, { useState } from "react";
import { Icons } from "../components/Icons";
import { Modal, Input, Button } from "../components/Shared";

// Accent color presets
const ACCENT_PRESETS = [
  { id: "indigo", label: "Indigo", accent: "#6c5ce7", accentLight: "#8b7cf7" },
  { id: "blue", label: "Ocean", accent: "#3b82f6", accentLight: "#60a5fa" },
  { id: "teal", label: "Teal", accent: "#0d9488", accentLight: "#2dd4bf" },
  { id: "emerald", label: "Emerald", accent: "#059669", accentLight: "#34d399" },
  { id: "rose", label: "Rose", accent: "#e11d48", accentLight: "#fb7185" },
  { id: "orange", label: "Sunset", accent: "#ea580c", accentLight: "#fb923c" },
  { id: "fuchsia", label: "Fuchsia", accent: "#c026d3", accentLight: "#e879f9" },
  { id: "slate", label: "Slate", accent: "#64748b", accentLight: "#94a3b8" },
  { id: "custom", label: "Custom", accent: null, accentLight: null },
];

const FONT_FAMILIES = [
  { id: "dm-sans", label: "DM Sans", value: "'DM Sans', 'Segoe UI', system-ui, sans-serif" },
  { id: "inter", label: "Inter", value: "'Inter', 'Segoe UI', system-ui, sans-serif", url: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" },
  { id: "jetbrains", label: "JetBrains Mono", value: "'JetBrains Mono', monospace", url: "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700;800&display=swap" },
  { id: "source-sans", label: "Source Sans 3", value: "'Source Sans 3', 'Segoe UI', system-ui, sans-serif", url: "https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@400;500;600;700;800&display=swap" },
  { id: "nunito", label: "Nunito", value: "'Nunito', 'Segoe UI', system-ui, sans-serif", url: "https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&display=swap" },
  { id: "space-grotesk", label: "Space Grotesk", value: "'Space Grotesk', 'Segoe UI', system-ui, sans-serif", url: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap" },
  { id: "outfit", label: "Outfit", value: "'Outfit', 'Segoe UI', system-ui, sans-serif", url: "https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap" },
];

const FONT_SIZES = [
  { id: "compact", label: "Compact", scale: 0.88 },
  { id: "default", label: "Default", scale: 1.0 },
  { id: "comfortable", label: "Comfortable", scale: 1.1 },
  { id: "large", label: "Large", scale: 1.2 },
];

const DEFAULT_DASHBOARD_WIDGETS = [
  { id: "projects", label: "Projects", visible: true },
  { id: "classes", label: "Classes", visible: true },
  { id: "gradapps", label: "Schools", visible: true },
  { id: "jobapps", label: "Jobs", visible: true },
];

// Toggle switch component
function Toggle({ value, onChange, c }) {
  return (
    <div
      onClick={() => onChange(!value)}
      style={{
        width: 44, height: 24, borderRadius: 12, cursor: "pointer",
        background: value ? c.accent : c.border,
        padding: 2, transition: "background 0.2s",
        display: "flex", alignItems: "center", flexShrink: 0,
      }}
    >
      <div style={{
        width: 20, height: 20, borderRadius: "50%", background: "#fff",
        transition: "transform 0.2s",
        transform: value ? "translateX(20px)" : "translateX(0)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
      }} />
    </div>
  );
}

// Section wrapper
function Section({ title, description, children, c }) {
  return (
    <div style={{
      background: c.bgCard, border: `1px solid ${c.border}`,
      borderRadius: 14, padding: 24, marginBottom: 16,
    }}>
      <div style={{ marginBottom: 16 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: c.text, margin: "0 0 4px" }}>
          {title}
        </h3>
        {description && (
          <p style={{ fontSize: 12, color: c.textMuted, margin: 0 }}>{description}</p>
        )}
      </div>
      {children}
    </div>
  );
}

// Settings row
function SettingRow({ label, children, c, noBorder }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "10px 0",
      borderBottom: noBorder ? "none" : `1px solid ${c.borderLight}`,
    }}>
      <span style={{ fontSize: 13, color: c.text }}>{label}</span>
      {children}
    </div>
  );
}

// Inline editable column name
function ColumnNameEditor({ label, value, onChange, c }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0" }}>
      <span style={{ fontSize: 12, color: c.textMuted, width: 90, flexShrink: 0 }}>{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          flex: 1, padding: "6px 10px", fontSize: 13,
          background: c.bgInput, border: `1px solid ${c.border}`,
          borderRadius: 8, color: c.text, outline: "none",
          fontFamily: "inherit",
        }}
      />
    </div>
  );
}

export default function SettingsPage({ c, settings, onSettingsChange, onResetData }) {
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetConfirmText, setResetConfirmText] = useState("");

  function update(key, value) {
    onSettingsChange({ ...settings, [key]: value });
  }

  // Dashboard widget order — merge any newly added widgets
  const savedWidgets = settings.dashboardWidgets || DEFAULT_DASHBOARD_WIDGETS;
  const savedWidgetIds = new Set(savedWidgets.map((w) => w.id));
  const dashboardWidgets = [...savedWidgets, ...DEFAULT_DASHBOARD_WIDGETS.filter((w) => !savedWidgetIds.has(w.id))];

  function moveWidget(idx, dir) {
    const widgets = [...dashboardWidgets];
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= widgets.length) return;
    [widgets[idx], widgets[newIdx]] = [widgets[newIdx], widgets[idx]];
    update("dashboardWidgets", widgets);
  }

  function toggleWidget(idx) {
    const widgets = dashboardWidgets.map((w, i) =>
      i === idx ? { ...w, visible: !w.visible } : w
    );
    update("dashboardWidgets", widgets);
  }

  // Sidebar page order
  const DEFAULT_SIDEBAR_PAGES = [
    { id: "home", label: "Home", visible: true },
    { id: "projects", label: "Projects", visible: true },
    { id: "classes", label: "Classes", visible: true },
    { id: "gradapps", label: "Schools", visible: true },
    { id: "jobapps", label: "Jobs", visible: true },
    { id: "calendar", label: "Calendar", visible: true },
  ];
  const savedSidebar = settings.sidebarPages || DEFAULT_SIDEBAR_PAGES;
  const savedSidebarIds = new Set(savedSidebar.map((p) => p.id));
  const sidebarPages = [...savedSidebar, ...DEFAULT_SIDEBAR_PAGES.filter((p) => !savedSidebarIds.has(p.id))];

  function moveSidebarPage(idx, dir) {
    const pages = [...sidebarPages];
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= pages.length) return;
    [pages[idx], pages[newIdx]] = [pages[newIdx], pages[idx]];
    update("sidebarPages", pages);
  }

  function toggleSidebarPage(idx) {
    const pages = sidebarPages.map((p, i) =>
      i === idx ? { ...p, visible: !p.visible } : p
    );
    update("sidebarPages", pages);
  }

  // Custom color
  const customAccent = settings.customAccentColor || "#6c5ce7";
  const customAccentLight = settings.customAccentLight || "#8b7cf7";

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: c.text, margin: 0 }}>Settings</h2>
        <p style={{ fontSize: 13, color: c.textMuted, margin: "4px 0 0" }}>
          Customize your Nexus Dashboard experience
        </p>
      </div>

      {/* Accent Color */}
      <Section title="Accent Color" description="Primary color for highlights, buttons, and active states" c={c}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: settings.accentColor === "custom" ? 16 : 0 }}>
          {ACCENT_PRESETS.map((preset) => {
            const sel = settings.accentColor === preset.id;
            const displayColor = preset.id === "custom"
              ? customAccent
              : preset.accent;
            const displayColorLight = preset.id === "custom"
              ? customAccentLight
              : preset.accentLight;
            return (
              <div
                key={preset.id}
                onClick={() => update("accentColor", preset.id)}
                style={{
                  display: "flex", flexDirection: "column", alignItems: "center",
                  gap: 6, cursor: "pointer", padding: "8px 12px", borderRadius: 10,
                  border: sel ? `2px solid ${displayColor}` : "2px solid transparent",
                  background: sel ? c.bgKanban : "transparent",
                  transition: "all 0.15s",
                }}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: "50%",
                  background: preset.id === "custom"
                    ? `conic-gradient(#e11d48, #ea580c, #eab308, #22c55e, #3b82f6, #8b5cf6, #e11d48)`
                    : `linear-gradient(135deg, ${displayColor}, ${displayColorLight})`,
                  boxShadow: sel ? `0 0 12px ${displayColor}44` : "none",
                }} />
                <span style={{
                  fontSize: 11, fontWeight: sel ? 700 : 500,
                  color: sel ? c.text : c.textMuted,
                }}>
                  {preset.label}
                </span>
              </div>
            );
          })}
        </div>
        {settings.accentColor === "custom" && (
          <div style={{
            display: "flex", gap: 16, alignItems: "flex-end",
            background: c.bgKanban, borderRadius: 10, padding: 14,
          }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: c.textSecondary, display: "block", marginBottom: 4 }}>
                Primary Color
              </label>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input
                  type="color"
                  value={customAccent}
                  onChange={(e) => update("customAccentColor", e.target.value)}
                  style={{ width: 36, height: 36, border: "none", cursor: "pointer", borderRadius: 8 }}
                />
                <input
                  value={customAccent}
                  onChange={(e) => update("customAccentColor", e.target.value)}
                  placeholder="#6c5ce7"
                  style={{
                    flex: 1, padding: "6px 10px", fontSize: 13,
                    background: c.bgInput, border: `1px solid ${c.border}`,
                    borderRadius: 8, color: c.text, fontFamily: "monospace",
                  }}
                />
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: c.textSecondary, display: "block", marginBottom: 4 }}>
                Light Variant
              </label>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input
                  type="color"
                  value={customAccentLight}
                  onChange={(e) => update("customAccentLight", e.target.value)}
                  style={{ width: 36, height: 36, border: "none", cursor: "pointer", borderRadius: 8 }}
                />
                <input
                  value={customAccentLight}
                  onChange={(e) => update("customAccentLight", e.target.value)}
                  placeholder="#8b7cf7"
                  style={{
                    flex: 1, padding: "6px 10px", fontSize: 13,
                    background: c.bgInput, border: `1px solid ${c.border}`,
                    borderRadius: 8, color: c.text, fontFamily: "monospace",
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </Section>

      {/* Preset Themes */}
      <Section title="Preset Themes" description="One-click theme presets that set accent color, font, and brightness together" c={c}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          {[
            {
              id: "default", label: "Default",
              accent: "indigo", font: "dm-sans", brightness: 100,
              preview: { bg: "#1a1a2e", accent: "#6c5ce7", text: "#e2e2e8" },
            },
            {
              id: "ocean", label: "Ocean Breeze",
              accent: "blue", font: "inter", brightness: 105,
              preview: { bg: "#0f172a", accent: "#3b82f6", text: "#cbd5e1" },
            },
            {
              id: "forest", label: "Forest",
              accent: "emerald", font: "source-sans", brightness: 95,
              preview: { bg: "#0c1a0c", accent: "#059669", text: "#a7f3d0" },
            },
            {
              id: "rose", label: "Rosé",
              accent: "rose", font: "outfit", brightness: 108,
              preview: { bg: "#1a0a10", accent: "#e11d48", text: "#fecdd3" },
            },
            {
              id: "monochrome", label: "Mono",
              accent: "slate", font: "jetbrains", brightness: 100,
              preview: { bg: "#111318", accent: "#64748b", text: "#94a3b8" },
            },
            {
              id: "sunset", label: "Sunset",
              accent: "orange", font: "nunito", brightness: 102,
              preview: { bg: "#1a0f05", accent: "#ea580c", text: "#fed7aa" },
            },
          ].map((theme) => {
            const isActive = settings.activeTheme === theme.id;
            return (
              <div
                key={theme.id}
                onClick={() => {
                  onSettingsChange({
                    ...settings,
                    activeTheme: theme.id,
                    accentColor: theme.accent,
                    fontFamily: theme.font,
                    brightness: theme.brightness,
                  });
                }}
                style={{
                  padding: 14, borderRadius: 10, cursor: "pointer",
                  border: isActive ? `2px solid ${c.accent}` : `1px solid ${c.border}`,
                  background: isActive ? c.accentGlow : "transparent",
                  transition: "all 0.15s",
                }}
              >
                {/* Mini preview */}
                <div style={{
                  height: 36, borderRadius: 6, marginBottom: 8,
                  background: theme.preview.bg,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
                  overflow: "hidden", position: "relative",
                }}>
                  <div style={{ width: 16, height: 4, borderRadius: 2, background: theme.preview.accent }} />
                  <div style={{ width: 24, height: 4, borderRadius: 2, background: theme.preview.text, opacity: 0.5 }} />
                  <div style={{ width: 12, height: 4, borderRadius: 2, background: theme.preview.accent, opacity: 0.5 }} />
                </div>
                <div style={{
                  fontSize: 12, fontWeight: isActive ? 700 : 600,
                  color: isActive ? c.text : c.textSecondary, textAlign: "center",
                }}>
                  {theme.label}
                </div>
              </div>
            );
          })}
        </div>
      </Section>

      {/* Brightness */}
      <Section title="Brightness" description="Adjust the overall brightness of the interface" c={c}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ fontSize: 16 }}>🌙</span>
          <input
            type="range"
            min={60}
            max={140}
            step={5}
            value={settings.brightness || 100}
            onChange={(e) => update("brightness", parseInt(e.target.value))}
            style={{
              flex: 1, height: 6, accentColor: c.accent, cursor: "pointer",
            }}
          />
          <span style={{ fontSize: 16 }}>☀️</span>
          <span style={{
            fontSize: 12, fontWeight: 700, color: c.text,
            minWidth: 40, textAlign: "right",
          }}>
            {settings.brightness || 100}%
          </span>
        </div>
      </Section>

      {/* Clock Style */}
      <Section title="Clock Style" description="Choose how the clock appears on your home dashboard" c={c}>
        <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
          {[
            { id: "digital", label: "Digital", preview: "12:30" },
            { id: "minimal", label: "Minimal", preview: "12:30" },
            { id: "analog", label: "Analog", preview: null },
          ].map((style) => {
            const isActive = (settings.clockStyle || "digital") === style.id;
            return (
              <div
                key={style.id}
                onClick={() => update("clockStyle", style.id)}
                style={{
                  flex: 1, padding: 14, borderRadius: 10, cursor: "pointer",
                  border: isActive ? `2px solid ${c.accent}` : `1px solid ${c.border}`,
                  background: isActive ? c.accentGlow : "transparent",
                  textAlign: "center", transition: "all 0.15s",
                }}
              >
                {/* Preview */}
                <div style={{ height: 36, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 6 }}>
                  {style.id === "digital" && (
                    <span style={{
                      fontSize: 22, fontWeight: 800, color: isActive ? c.text : c.textSecondary,
                      fontVariantNumeric: "tabular-nums", letterSpacing: 2,
                    }}>12:30</span>
                  )}
                  {style.id === "minimal" && (
                    <span style={{
                      fontSize: 16, fontWeight: 600, color: isActive ? c.textSecondary : c.textMuted,
                      letterSpacing: 1,
                    }}>12:30</span>
                  )}
                  {style.id === "analog" && (
                    <svg width="36" height="36" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="16" fill="none" stroke={isActive ? c.textSecondary : c.textMuted} strokeWidth="1.5" />
                      <line x1="18" y1="18" x2="18" y2="8" stroke={isActive ? c.text : c.textSecondary} strokeWidth="2" strokeLinecap="round" />
                      <line x1="18" y1="18" x2="26" y2="18" stroke={isActive ? c.text : c.textSecondary} strokeWidth="1.5" strokeLinecap="round" />
                      <circle cx="18" cy="18" r="2" fill={c.accent} />
                    </svg>
                  )}
                </div>
                <div style={{
                  fontSize: 11, fontWeight: isActive ? 700 : 500,
                  color: isActive ? c.text : c.textMuted,
                }}>{style.label}</div>
              </div>
            );
          })}
        </div>
        <SettingRow label="Show seconds" c={c}>
          <Toggle value={settings.showSeconds || false} onChange={(v) => update("showSeconds", v)} c={c} />
        </SettingRow>
        <SettingRow label="24-hour format" c={c}>
          <Toggle value={settings.clockFormat === "24h"} onChange={(v) => update("clockFormat", v ? "24h" : "12h")} c={c} />
        </SettingRow>
        <SettingRow label="Show clock" c={c} noBorder>
          <Toggle value={settings.showClock !== false} onChange={(v) => update("showClock", v)} c={c} />
        </SettingRow>
      </Section>

      {/* Kanban Column Names */}
      <Section title="Kanban Column Names" description="Customize the column labels in your project and class boards" c={c}>
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: c.textSecondary, marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.8 }}>
            Project Columns
          </div>
          <ColumnNameEditor label="Column 1" value={settings.projectCol1 || "To Do"} onChange={(v) => update("projectCol1", v)} c={c} />
          <ColumnNameEditor label="Column 2" value={settings.projectCol2 || "In Progress"} onChange={(v) => update("projectCol2", v)} c={c} />
          <ColumnNameEditor label="Column 3" value={settings.projectCol3 || "Done"} onChange={(v) => update("projectCol3", v)} c={c} />
        </div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: c.textSecondary, marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.8 }}>
            Class Columns
          </div>
          <ColumnNameEditor label="Column 1" value={settings.classCol1 || "Not Started"} onChange={(v) => update("classCol1", v)} c={c} />
          <ColumnNameEditor label="Column 2" value={settings.classCol2 || "Working"} onChange={(v) => update("classCol2", v)} c={c} />
          <ColumnNameEditor label="Column 3" value={settings.classCol3 || "Submitted"} onChange={(v) => update("classCol3", v)} c={c} />
        </div>
      </Section>

      {/* Class Item Types */}
      <Section title="Class Item Types" description="Add custom item types for class assignments. Default types cannot be removed." c={c}>
        {/* Default types */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
          {[
            { label: "Assignment", colorKey: "blue" },
            { label: "Exam", colorKey: "red" },
            { label: "Reading", colorKey: "amber" },
            { label: "Other", colorKey: "textSecondary" },
          ].map((t) => (
            <span key={t.label} style={{
              padding: "5px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600,
              border: `1px solid ${c[t.colorKey]}44`,
              color: c[t.colorKey], background: `${c[t.colorKey]}15`,
            }}>
              {t.label}
            </span>
          ))}
        </div>
        {/* Custom types */}
        {(settings.customItemTypes || []).map((ct, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "center", gap: 8, marginBottom: 6,
          }}>
            <span style={{
              padding: "5px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600,
              border: `1px solid ${c[ct.colorKey]}44`,
              color: c[ct.colorKey], background: `${c[ct.colorKey]}15`,
              flex: 1,
            }}>
              {ct.label}
            </span>
            <button
              onClick={() => {
                const updated = (settings.customItemTypes || []).filter((_, j) => j !== i);
                update("customItemTypes", updated);
              }}
              style={{
                background: "none", border: "none", color: c.textMuted,
                cursor: "pointer", padding: 4, display: "flex",
              }}
            >
              <Icons.Trash />
            </button>
          </div>
        ))}
        {/* Add new type */}
        <div style={{ display: "flex", gap: 8, marginTop: 10, alignItems: "flex-end" }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: c.textSecondary, display: "block", marginBottom: 4 }}>
              Type Name
            </label>
            <input
              id="new-item-type-name"
              placeholder="e.g. Lab Report"
              style={{
                width: "100%", padding: "7px 10px", fontSize: 13,
                background: c.bgInput, border: `1px solid ${c.border}`,
                borderRadius: 8, color: c.text, outline: "none",
                fontFamily: "inherit", boxSizing: "border-box",
              }}
            />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: c.textSecondary, display: "block", marginBottom: 4 }}>
              Color
            </label>
            <select
              id="new-item-type-color"
              defaultValue="purple"
              style={{
                padding: "7px 10px", fontSize: 13,
                background: c.bgInput, border: `1px solid ${c.border}`,
                borderRadius: 8, color: c.text, fontFamily: "inherit",
              }}
            >
              {["purple", "blue", "cyan", "green", "amber", "red"].map((clr) => (
                <option key={clr} value={clr}>{clr.charAt(0).toUpperCase() + clr.slice(1)}</option>
              ))}
            </select>
          </div>
          <Button c={c} onClick={() => {
            const nameInput = document.getElementById("new-item-type-name");
            const colorSelect = document.getElementById("new-item-type-color");
            const name = nameInput?.value?.trim();
            if (!name) return;
            const id = name.toLowerCase().replace(/\s+/g, "_");
            const existing = settings.customItemTypes || [];
            // Prevent duplicates
            if (existing.some((ct) => ct.id === id)) return;
            update("customItemTypes", [...existing, { id, label: name, colorKey: colorSelect.value }]);
            nameInput.value = "";
          }}>
            Add
          </Button>
        </div>
      </Section>

      {/* Font Family */}
      <Section title="Font Family" description="Typeface used throughout the app" c={c}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {FONT_FAMILIES.map((font) => {
            const sel = settings.fontFamily === font.id;
            if (font.url) {
              const link = document.querySelector(`link[href="${font.url}"]`);
              if (!link) {
                const el = document.createElement("link");
                el.rel = "stylesheet"; el.href = font.url;
                document.head.appendChild(el);
              }
            }
            return (
              <div
                key={font.id}
                onClick={() => update("fontFamily", font.id)}
                style={{
                  padding: "12px 16px", borderRadius: 10, cursor: "pointer",
                  border: sel ? `2px solid ${c.accent}` : `1px solid ${c.border}`,
                  background: sel ? c.accentGlow : "transparent",
                  transition: "all 0.15s",
                }}
              >
                <div style={{
                  fontFamily: font.value, fontSize: 15, fontWeight: 700,
                  color: sel ? c.text : c.textSecondary, marginBottom: 2,
                }}>
                  {font.label}
                </div>
                <div style={{ fontFamily: font.value, fontSize: 12, color: c.textMuted }}>
                  The quick brown fox jumps
                </div>
              </div>
            );
          })}
        </div>
      </Section>

      {/* Font Size */}
      <Section title="Font Size" description="Scales the entire interface proportionally" c={c}>
        <div style={{ display: "flex", gap: 8 }}>
          {FONT_SIZES.map((size) => {
            const sel = settings.fontSize === size.id;
            return (
              <div
                key={size.id}
                onClick={() => update("fontSize", size.id)}
                style={{
                  flex: 1, padding: "12px 16px", borderRadius: 10,
                  cursor: "pointer", textAlign: "center",
                  border: sel ? `2px solid ${c.accent}` : `1px solid ${c.border}`,
                  background: sel ? c.accentGlow : "transparent",
                  transition: "all 0.15s",
                }}
              >
                <div style={{
                  fontSize: 18 * size.scale, fontWeight: 700,
                  color: sel ? c.text : c.textSecondary, marginBottom: 2,
                }}>Aa</div>
                <div style={{ fontSize: 11, color: c.textMuted }}>{size.label}</div>
                <div style={{ fontSize: 10, color: c.textMuted }}>{Math.round(size.scale * 100)}%</div>
              </div>
            );
          })}
        </div>
      </Section>

      {/* Sidebar Pages */}
      <Section title="Sidebar Pages" description="Reorder, show, or hide pages in the sidebar navigation" c={c}>
        {sidebarPages.map((p, i) => (
          <div key={p.id} style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "8px 12px", marginBottom: 4,
            background: c.bgKanban, borderRadius: 8,
          }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <button disabled={i === 0} onClick={() => moveSidebarPage(i, -1)} style={{
                background: "none", border: "none", color: i === 0 ? c.border : c.textMuted,
                cursor: i === 0 ? "default" : "pointer", padding: 0, display: "flex",
              }}><Icons.ArrowUp /></button>
              <button disabled={i === sidebarPages.length - 1} onClick={() => moveSidebarPage(i, 1)} style={{
                background: "none", border: "none", color: i === sidebarPages.length - 1 ? c.border : c.textMuted,
                cursor: i === sidebarPages.length - 1 ? "default" : "pointer", padding: 0, display: "flex",
              }}><Icons.ArrowDown /></button>
            </div>
            <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: c.text }}>{p.label}</span>
            <Toggle value={p.visible} onChange={() => toggleSidebarPage(i)} c={c} />
          </div>
        ))}
      </Section>

      {/* Home Dashboard */}
      <Section title="Home Dashboard" description="Reorder, show, or hide dashboard widgets" c={c}>
        <div style={{ marginBottom: 14 }}>
          {dashboardWidgets.map((w, i) => (
            <div key={w.id} style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "8px 12px", marginBottom: 4,
              background: c.bgKanban, borderRadius: 8,
            }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <button disabled={i === 0} onClick={() => moveWidget(i, -1)} style={{
                  background: "none", border: "none", color: i === 0 ? c.border : c.textMuted,
                  cursor: i === 0 ? "default" : "pointer", padding: 0, display: "flex",
                }}><Icons.ArrowUp /></button>
                <button disabled={i === dashboardWidgets.length - 1} onClick={() => moveWidget(i, 1)} style={{
                  background: "none", border: "none", color: i === dashboardWidgets.length - 1 ? c.border : c.textMuted,
                  cursor: i === dashboardWidgets.length - 1 ? "default" : "pointer", padding: 0, display: "flex",
                }}><Icons.ArrowDown /></button>
              </div>
              <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: c.text }}>{w.label}</span>
              <Toggle value={w.visible} onChange={() => toggleWidget(i)} c={c} />
            </div>
          ))}
        </div>
        <SettingRow label="Show urgent deadline alerts" c={c}>
          <Toggle value={settings.showAlertBanner !== false} onChange={(v) => update("showAlertBanner", v)} c={c} />
        </SettingRow>
        <SettingRow label="Show upcoming deadlines list" c={c}>
          <Toggle value={settings.showDeadlineList !== false} onChange={(v) => update("showDeadlineList", v)} c={c} />
        </SettingRow>
        <SettingRow label="Maximum deadlines shown" c={c} noBorder>
          <select
            value={settings.maxDeadlines || 10}
            onChange={(e) => update("maxDeadlines", parseInt(e.target.value))}
            style={{
              padding: "5px 10px", fontSize: 13,
              background: c.bgInput, border: `1px solid ${c.border}`,
              borderRadius: 8, color: c.text, fontFamily: "inherit",
            }}
          >
            {[5, 8, 10, 15, 20].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </SettingRow>
      </Section>

      {/* Data Management */}
      <Section title="Data Management" description="Export, import, or reset your dashboard data" c={c}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Button variant="secondary" c={c} onClick={() => {
            const data = { exportDate: new Date().toISOString(), version: "2.0" };
            if (window._nexusExportData) Object.assign(data, window._nexusExportData());
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url; a.download = `nexus-backup-${new Date().toISOString().split("T")[0]}.json`;
            a.click(); URL.revokeObjectURL(url);
          }}>
            Export Data
          </Button>
          <Button variant="secondary" c={c} onClick={() => {
            const input = document.createElement("input");
            input.type = "file"; input.accept = ".json";
            input.onchange = (e) => {
              const file = e.target.files[0]; if (!file) return;
              const reader = new FileReader();
              reader.onload = (evt) => {
                try {
                  const data = JSON.parse(evt.target.result);
                  if (window._nexusImportData) window._nexusImportData(data);
                } catch { alert("Invalid backup file."); }
              };
              reader.readAsText(file);
            };
            input.click();
          }}>
            Import Data
          </Button>
          <Button variant="danger" c={c} onClick={() => setShowResetModal(true)}>
            <Icons.Trash /> Reset All Data
          </Button>
        </div>
      </Section>

      {/* About */}
      <Section title="About" c={c}>
        <div style={{ fontSize: 13, color: c.textSecondary, lineHeight: 1.8 }}>
          <div><strong style={{ color: c.text }}>Nexus Dashboard</strong> v2.0.0</div>
          <div>Built with Electron + React</div>
          <div style={{ marginTop: 8, fontSize: 12, color: c.textMuted }}>
            Your productivity command center for projects, classes, and graduate school applications.
          </div>
        </div>
      </Section>

      {/* Reset Modal */}
      <Modal
        isOpen={showResetModal}
        onClose={() => { setShowResetModal(false); setResetConfirmText(""); }}
        title="Reset All Data" c={c} width={420}
      >
        <p style={{ fontSize: 13, color: c.textSecondary, lineHeight: 1.6, margin: "0 0 16px" }}>
          This will permanently delete all your projects, classes, semesters,
          graduate school applications, and settings. This cannot be undone.
        </p>
        <p style={{ fontSize: 13, color: c.red, fontWeight: 600, margin: "0 0 12px" }}>
          Type "RESET" to confirm:
        </p>
        <input
          value={resetConfirmText}
          onChange={(e) => setResetConfirmText(e.target.value)}
          placeholder="Type RESET"
          style={{
            width: "100%", padding: "10px 14px", fontSize: 14,
            background: c.bgInput, border: `1px solid ${c.border}`,
            borderRadius: 10, color: c.text, outline: "none",
            boxSizing: "border-box", fontFamily: "inherit", marginBottom: 16,
          }}
        />
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <Button variant="secondary" c={c} onClick={() => { setShowResetModal(false); setResetConfirmText(""); }}>
            Cancel
          </Button>
          <Button
            variant="danger" c={c}
            onClick={() => {
              if (resetConfirmText === "RESET") {
                onResetData(); setShowResetModal(false); setResetConfirmText("");
              }
            }}
            style={{ opacity: resetConfirmText === "RESET" ? 1 : 0.4 }}
          >
            Reset Everything
          </Button>
        </div>
      </Modal>
    </div>
  );
}

export { ACCENT_PRESETS, FONT_FAMILIES, FONT_SIZES, DEFAULT_DASHBOARD_WIDGETS };
