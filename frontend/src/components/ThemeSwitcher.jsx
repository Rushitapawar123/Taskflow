import { useState } from "react";
import { useTheme, themes } from "../context/ThemeContext";

function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-9 h-9 rounded-full border-2 flex items-center justify-center"
        style={{ borderColor: "var(--color-border)" }}
        title="Change theme"
      >
        🎨
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div
            className="absolute right-0 mt-2 rounded-xl shadow-lg p-3 z-20 w-48"
            style={{ backgroundColor: "var(--color-surface)", border: "1px solid var(--color-border)" }}
          >
            <p className="text-xs font-medium mb-2" style={{ color: "var(--color-text-muted)" }}>
              Choose theme
            </p>
            <div className="grid grid-cols-3 gap-2">
              {themes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setTheme(t.id);
                    setOpen(false);
                  }}
                  className={`flex flex-col items-center gap-1 p-2 rounded-lg transition ${
                    theme === t.id ? "ring-2 ring-offset-1" : ""
                  }`}
                  style={{ ringColor: t.color }}
                >
                  <div
                    className="w-6 h-6 rounded-full border"
                    style={{ backgroundColor: t.color, borderColor: "var(--color-border)" }}
                  />
                  <span className="text-[10px]" style={{ color: "var(--color-text)" }}>
                    {t.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default ThemeSwitcher;