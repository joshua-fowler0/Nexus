import React, { useState, useEffect, useCallback } from "react";
import { COLORS } from "./theme";
import storage from "./storage";
import { DEFAULT_PROJECTS } from "./data/defaults";
import { DEFAULT_SEMESTERS } from "./data/classDefaults";
import { DEFAULT_GRAD_APPS } from "./data/gradDefaults";
import { DEFAULT_JOB_APPS } from "./data/jobDefaults";
import Sidebar from "./components/Sidebar";
import HomePage from "./pages/HomePage";
import ProjectsPage from "./pages/ProjectsPage";
import ClassesPage from "./pages/ClassesPage";
import GradAppsPage from "./pages/GradAppsPage";
import JobAppsPage from "./pages/JobAppsPage";
import CalendarPage from "./pages/CalendarPage";
import SettingsPage, { ACCENT_PRESETS, FONT_FAMILIES, FONT_SIZES } from "./pages/SettingsPage";
import SearchOverlay from "./components/SearchOverlay";
import QuickAdd from "./components/QuickAdd";

const DEFAULT_SETTINGS = {
  accentColor: "indigo",
  fontFamily: "dm-sans",
  fontSize: "default",
  showAlertBanner: true,
  showDeadlineList: true,
  maxDeadlines: 10,
};

function applyAccent(colors, accentPreset) {
  if (!accentPreset) return colors;
  return {
    dark: {
      ...colors.dark,
      accent: accentPreset.accent,
      accentLight: accentPreset.accentLight,
      accentGlow: `${accentPreset.accent}26`,
    },
    light: {
      ...colors.light,
      accent: accentPreset.accent,
      accentLight: accentPreset.accentLight,
      accentGlow: `${accentPreset.accent}14`,
    },
  };
}

export default function App() {
  const [isDark, setIsDark] = useState(true);
  const [page, setPage] = useState("home");
  const [projects, setProjects] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [gradApps, setGradApps] = useState([]);
  const [jobApps, setJobApps] = useState([]);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  // For opening a specific item's edit modal when navigating from Home deadlines
  const [pendingOpenItem, setPendingOpenItem] = useState(null);

  function handleOpenItem(deadlineItem) {
    // Navigate to the correct page and pass the item info to open its modal
    if (deadlineItem.type === "project") {
      setPendingOpenItem({ type: "project", projectId: deadlineItem.projectId });
      setPage("projects");
    } else if (deadlineItem.type === "class") {
      setPendingOpenItem({ type: "class", classId: deadlineItem.classId, itemId: deadlineItem.itemId });
      setPage("classes");
    } else if (deadlineItem.type === "gradapp") {
      setPendingOpenItem({ type: "gradapp", schoolId: deadlineItem.schoolId });
      setPage("gradapps");
    } else if (deadlineItem.type === "jobapp") {
      setPendingOpenItem({ type: "jobapp", jobId: deadlineItem.jobId });
      setPage("jobapps");
    }
  }

  // Cmd+K to open search
  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Derived values
  let accentPreset = ACCENT_PRESETS.find((p) => p.id === settings.accentColor) || ACCENT_PRESETS[0];
  // Handle custom color
  if (settings.accentColor === "custom") {
    accentPreset = {
      id: "custom",
      accent: settings.customAccentColor || "#6c5ce7",
      accentLight: settings.customAccentLight || "#8b7cf7",
    };
  }
  const themedColors = applyAccent(COLORS, accentPreset);
  const c = isDark ? themedColors.dark : themedColors.light;

  const fontObj = FONT_FAMILIES.find((f) => f.id === settings.fontFamily) || FONT_FAMILIES[0];
  const fontFamily = fontObj.value;
  const fontScale = (FONT_SIZES.find((f) => f.id === settings.fontSize) || FONT_SIZES[1]).scale;

  // Load font stylesheet
  useEffect(() => {
    if (fontObj.url) {
      const existing = document.querySelector(`link[href="${fontObj.url}"]`);
      if (!existing) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = fontObj.url;
        document.head.appendChild(link);
      }
    }
  }, [fontObj]);

  // Apply font size globally via Electron zoom factor or CSS zoom fallback
  useEffect(() => {
    if (window.electronAPI && window.electronAPI.setZoomFactor) {
      window.electronAPI.setZoomFactor(fontScale);
    } else {
      document.body.style.zoom = String(fontScale);
    }
    return () => {
      if (window.electronAPI && window.electronAPI.setZoomFactor) {
        window.electronAPI.setZoomFactor(1);
      } else {
        document.body.style.zoom = "1";
      }
    };
  }, [fontScale]);

  // Load data
  useEffect(() => {
    async function loadData() {
      try {
        const savedTheme = await storage.get("theme");
        if (savedTheme !== undefined) setIsDark(savedTheme === "dark");

        const savedProjects = await storage.get("projects");
        setProjects(savedProjects && savedProjects.length > 0 ? savedProjects : DEFAULT_PROJECTS);

        const savedSemesters = await storage.get("semesters");
        setSemesters(savedSemesters && savedSemesters.length > 0 ? savedSemesters : DEFAULT_SEMESTERS);

        const savedGradApps = await storage.get("gradApps");
        setGradApps(savedGradApps && savedGradApps.length > 0 ? savedGradApps : DEFAULT_GRAD_APPS);

        const savedJobApps = await storage.get("jobApps");
        setJobApps(savedJobApps || DEFAULT_JOB_APPS);

        const savedSettings = await storage.get("settings");
        if (savedSettings) setSettings({ ...DEFAULT_SETTINGS, ...savedSettings });
      } catch (e) {
        console.error("Failed to load data:", e);
        setProjects(DEFAULT_PROJECTS);
        setSemesters(DEFAULT_SEMESTERS);
        setGradApps(DEFAULT_GRAD_APPS);
        setJobApps(DEFAULT_JOB_APPS);
      }
      setLoaded(true);
    }
    loadData();
  }, []);

  // Persist
  useEffect(() => { if (loaded) storage.set("projects", projects); }, [projects, loaded]);
  useEffect(() => { if (loaded) storage.set("semesters", semesters); }, [semesters, loaded]);
  useEffect(() => { if (loaded) storage.set("gradApps", gradApps); }, [gradApps, loaded]);
  useEffect(() => { if (loaded) storage.set("jobApps", jobApps); }, [jobApps, loaded]);
  useEffect(() => { if (loaded) storage.set("settings", settings); }, [settings, loaded]);
  useEffect(() => { if (loaded) storage.set("theme", isDark ? "dark" : "light"); }, [isDark, loaded]);

  // Export/Import/Reset
  useEffect(() => {
    window._nexusExportData = () => ({
      projects, semesters, gradApps, jobApps, settings,
      theme: isDark ? "dark" : "light",
    });
    window._nexusImportData = (data) => {
      if (data.projects) setProjects(data.projects);
      if (data.semesters) setSemesters(data.semesters);
      if (data.gradApps) setGradApps(data.gradApps);
      if (data.jobApps) setJobApps(data.jobApps);
      if (data.settings) setSettings({ ...DEFAULT_SETTINGS, ...data.settings });
      if (data.theme) setIsDark(data.theme === "dark");
    };
    return () => { delete window._nexusExportData; delete window._nexusImportData; };
  }, [projects, semesters, gradApps, jobApps, settings, isDark]);

  const handleResetData = useCallback(() => {
    setProjects(DEFAULT_PROJECTS);
    setSemesters(DEFAULT_SEMESTERS);
    setGradApps(DEFAULT_GRAD_APPS);
    setJobApps(DEFAULT_JOB_APPS);
    setSettings(DEFAULT_SETTINGS);
    setIsDark(true);
    setPage("home");
  }, []);

  if (!loaded) {
    return (
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        height: "100vh", background: COLORS.dark.bg, color: COLORS.dark.textMuted,
        fontFamily,
      }}>
        Loading...
      </div>
    );
  }

  const brightness = settings.brightness || 100;

  return (
    <div style={{
      display: "flex",
      height: "100%",
      fontFamily,
      filter: brightness !== 100 ? `brightness(${brightness / 100})` : "none",
      background: c.bg,
      color: c.text,
      transition: "background 0.3s, color 0.3s",
    }}>
      <Sidebar
        page={page}
        setPage={setPage}
        isDark={isDark}
        setIsDark={setIsDark}
        c={c}
        settings={settings}
      />

      {/* Main content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ height: (window.electronAPI?.platform === "darwin") ? 28 : 8, WebkitAppRegion: "drag", flexShrink: 0 }} />
        <div style={{ flex: 1, overflow: "auto", padding: "12px 40px 32px" }}>
          {/* Search button — top right */}
          <div style={{
            display: "flex", justifyContent: "flex-end", marginBottom: 8,
          }}>
            <button
              onClick={() => setSearchOpen(true)}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "6px 14px", borderRadius: 8, cursor: "pointer",
                background: c.bgKanban, border: `1px solid ${c.border}`,
                color: c.textMuted, fontSize: 12, fontFamily: "inherit",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              Search
              <span style={{
                fontSize: 10, fontWeight: 600, background: c.bgSecondary,
                padding: "2px 6px", borderRadius: 4, marginLeft: 4,
              }}>⌘K</span>
            </button>
          </div>
          <div style={{ maxWidth: 900, margin: "0 auto" }}>
            {page === "home" && (
              <HomePage
                c={c} setPage={setPage}
                projects={projects} semesters={semesters} gradApps={gradApps} jobApps={jobApps}
                settings={settings}
                onOpenItem={handleOpenItem}
              />
            )}
            {page === "projects" && (
              <ProjectsPage c={c} projects={projects} onProjectsChange={setProjects}
                pendingOpenItem={pendingOpenItem} onClearPending={() => setPendingOpenItem(null)}
                settings={settings}
              />
            )}
            {page === "classes" && (
              <ClassesPage c={c} semesters={semesters} onSemestersChange={setSemesters}
                pendingOpenItem={pendingOpenItem} onClearPending={() => setPendingOpenItem(null)}
                settings={settings}
              />
            )}
            {page === "gradapps" && (
              <GradAppsPage c={c} gradApps={gradApps} onGradAppsChange={setGradApps}
                pendingOpenItem={pendingOpenItem} onClearPending={() => setPendingOpenItem(null)}
              />
            )}
            {page === "jobapps" && (
              <JobAppsPage c={c} jobApps={jobApps} onJobAppsChange={setJobApps}
                pendingOpenItem={pendingOpenItem} onClearPending={() => setPendingOpenItem(null)}
              />
            )}
            {page === "calendar" && (
              <CalendarPage c={c} projects={projects} semesters={semesters} gradApps={gradApps} jobApps={jobApps}
                onNavigate={(pg, item) => { if (item) { setPendingOpenItem(item); } setPage(pg); }}
              />
            )}
            {page === "settings" && (
              <SettingsPage
                c={c} settings={settings}
                onSettingsChange={setSettings} onResetData={handleResetData}
              />
            )}
          </div>
        </div>
      </div>
      {/* Global search overlay */}
      <SearchOverlay
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        c={c}
        projects={projects}
        semesters={semesters}
        gradApps={gradApps}
        onNavigate={(pg) => { setPage(pg); setSearchOpen(false); }}
      />
      {/* Quick-add floating button */}
      <QuickAdd
        c={c}
        projects={projects}
        semesters={semesters}
        gradApps={gradApps}
        onProjectsChange={setProjects}
        onSemestersChange={setSemesters}
        onGradAppsChange={setGradApps}
        onNavigate={setPage}
      />
    </div>
  );
}
