import React, { createContext, useContext, useState, useEffect } from "react";

type Theme = "light" | "dark";
export type BrandTheme = "indigo" | "emerald" | "violet" | "amber" | "rose" | "midnight";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  brandTheme: BrandTheme;
  setBrandTheme: (brand: BrandTheme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem("theme");
    return (saved as Theme) || "light";
  });

  const [brandTheme, setBrandTheme] = useState<BrandTheme>(() => {
    const saved = localStorage.getItem("brandTheme");
    return (saved as BrandTheme) || "indigo";
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    const root = window.document.documentElement;
    // Remove all previous brand classes
    root.classList.remove("theme-indigo", "theme-emerald", "theme-violet", "theme-amber", "theme-rose", "theme-midnight");
    root.classList.add(`theme-${brandTheme}`);
    localStorage.setItem("brandTheme", brandTheme);
  }, [brandTheme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, brandTheme, setBrandTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within a ThemeProvider");
  return context;
};
