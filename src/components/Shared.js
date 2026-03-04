import React from "react";
import { Icons } from "./Icons";

// Calculates days from now to a date string
export function daysUntil(dateStr) {
  if (!dateStr) return 999;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  // Parse as local date to avoid timezone shift
  const [y, m, d] = dateStr.split("-").map(Number);
  const target = new Date(y, m - 1, d);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target - now) / (1000 * 60 * 60 * 24));
}

// Format date for display
export function formatDate(dateStr) {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// Urgency badge with color coding
export function UrgencyBadge({ daysLeft, c }) {
  let color, bg, label;
  if (daysLeft < 0) {
    color = c.red; bg = c.redBg; label = "Overdue";
  } else if (daysLeft <= 2) {
    color = c.red; bg = c.redBg; label = `${daysLeft}d left`;
  } else if (daysLeft <= 7) {
    color = c.amber; bg = c.amberBg; label = `${daysLeft}d left`;
  } else {
    color = c.green; bg = c.greenBg; label = `${daysLeft}d left`;
  }
  return (
    <span style={{
      fontSize: 11, fontWeight: 600, color, background: bg,
      padding: "2px 8px", borderRadius: 10, display: "inline-flex",
      alignItems: "center", gap: 4, whiteSpace: "nowrap",
    }}>
      <Icons.Clock /> {label}
    </span>
  );
}

// Modal overlay
export function Modal({ isOpen, onClose, title, children, c, width = 480 }) {
  if (!isOpen) return null;
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: c.overlay, display: "flex",
        alignItems: "center", justifyContent: "center", zIndex: 1000,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: c.bgSecondary, border: `1px solid ${c.border}`,
          borderRadius: 16, width, maxWidth: "90vw", maxHeight: "85vh",
          overflow: "auto", padding: 28,
        }}
      >
        <div style={{
          display: "flex", justifyContent: "space-between",
          alignItems: "center", marginBottom: 20,
        }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: c.text, margin: 0 }}>{title}</h3>
          <button
            onClick={onClose}
            style={{
              background: "none", border: "none", color: c.textMuted,
              cursor: "pointer", padding: 4, display: "flex",
            }}
          >
            <Icons.X />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// Styled input
export function Input({ label, c, ...props }) {
  return (
    <div style={{ marginBottom: 16 }}>
      {label && (
        <label style={{
          display: "block", fontSize: 12, fontWeight: 600,
          color: c.textSecondary, marginBottom: 6,
        }}>
          {label}
        </label>
      )}
      <input
        {...props}
        style={{
          width: "100%", padding: "10px 14px", fontSize: 14,
          background: c.bgInput, border: `1px solid ${c.border}`,
          borderRadius: 10, color: c.text, outline: "none",
          boxSizing: "border-box",
          ...(props.style || {}),
        }}
      />
    </div>
  );
}

// Styled textarea
export function TextArea({ label, c, ...props }) {
  return (
    <div style={{ marginBottom: 16 }}>
      {label && (
        <label style={{
          display: "block", fontSize: 12, fontWeight: 600,
          color: c.textSecondary, marginBottom: 6,
        }}>
          {label}
        </label>
      )}
      <textarea
        {...props}
        style={{
          width: "100%", padding: "10px 14px", fontSize: 14,
          background: c.bgInput, border: `1px solid ${c.border}`,
          borderRadius: 10, color: c.text, outline: "none",
          resize: "vertical", minHeight: 80, fontFamily: "inherit",
          boxSizing: "border-box",
          ...(props.style || {}),
        }}
      />
    </div>
  );
}

// Button
export function Button({ children, variant = "primary", c, style = {}, ...props }) {
  const styles = {
    primary: {
      background: c.accent, color: "#fff", border: "none",
    },
    secondary: {
      background: "transparent", color: c.textSecondary,
      border: `1px solid ${c.border}`,
    },
    danger: {
      background: c.redBg, color: c.red, border: `1px solid ${c.red}33`,
    },
  };
  return (
    <button
      {...props}
      style={{
        padding: "9px 20px", borderRadius: 10, fontSize: 13,
        fontWeight: 600, cursor: "pointer", display: "inline-flex",
        alignItems: "center", gap: 6, transition: "all 0.15s",
        fontFamily: "inherit",
        ...styles[variant],
        ...style,
      }}
    >
      {children}
    </button>
  );
}

// Color picker for project colors
export function ColorPicker({ value, onChange, colors, c }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{
        display: "block", fontSize: 12, fontWeight: 600,
        color: c.textSecondary, marginBottom: 8,
      }}>
        Color
      </label>
      <div style={{ display: "flex", gap: 8 }}>
        {colors.map((col) => (
          <div
            key={col.id}
            onClick={() => onChange(col.id)}
            style={{
              width: 28, height: 28, borderRadius: "50%",
              background: c[col.id], cursor: "pointer",
              border: value === col.id ? `3px solid ${c.text}` : "3px solid transparent",
              transition: "border 0.15s",
            }}
          />
        ))}
      </div>
    </div>
  );
}
