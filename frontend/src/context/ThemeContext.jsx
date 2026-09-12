import { createContext, useContext, useState, useEffect } from "react";

export const themes = [
  { id: "light", name: "Light", color: "#3b82f6" },
  { id: "dark", name: "Dark", color: "#111827" },
  { id: "ocean", name: "Ocean", color: "#06b6d4" },
  { id: "forest", name: "Forest", color: "#22c55e" },
  { id: "sunset", name: "Sunset", color: "#f97316" },
  { id: "purple", name: "Purple", color: "#a855f7" },
];

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "light";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}