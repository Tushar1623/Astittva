import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import { Sun, Moon, Laptop } from "lucide-react";

const THEME_STORAGE_KEY = "astittva_admin_theme";

const AdminThemeContext = createContext({
  theme: "system", // 'light' | 'dark' | 'system'
  resolvedTheme: "light", // 'light' | 'dark'
  setTheme: () => {},
  toggleTheme: () => {},
});

export function AdminThemeProvider({ children }) {
  // Read saved preference from localStorage, default to 'system'
  const [theme, setThemeState] = useState(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (saved === "light" || saved === "dark" || saved === "system") {
        return saved;
      }
    } catch (e) {
      // localStorage may fail in private mode
    }
    return "system";
  });

  // Track system preference
  const [systemIsDark, setSystemIsDark] = useState(() => {
    if (typeof window === "undefined" || !window.matchMedia) return false;
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return undefined;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e) => setSystemIsDark(e.matches);

    // Modern and legacy event listener fallback
    if (media.addEventListener) {
      media.addEventListener("change", handler);
    } else if (media.addListener) {
      media.addListener(handler);
    }

    return () => {
      if (media.removeEventListener) {
        media.removeEventListener("change", handler);
      } else if (media.removeListener) {
        media.removeListener(handler);
      }
    };
  }, []);

  const setTheme = useCallback((newTheme) => {
    if (newTheme !== "light" && newTheme !== "dark" && newTheme !== "system") {
      newTheme = "system";
    }
    setThemeState(newTheme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch (e) {}
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((current) => {
      let next = "dark";
      if (current === "dark") next = "light";
      else if (current === "light") next = "system";
      else next = "dark";

      try {
        localStorage.setItem(THEME_STORAGE_KEY, next);
      } catch (e) {}
      return next;
    });
  }, []);

  const resolvedTheme = useMemo(() => {
    if (theme === "dark") return "dark";
    if (theme === "light") return "light";
    return systemIsDark ? "dark" : "light";
  }, [theme, systemIsDark]);

  // Keep html/body dataset in sync for portals or external modals
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-admin-theme", resolvedTheme);
    }
  }, [resolvedTheme]);

  const value = useMemo(
    () => ({
      theme,
      resolvedTheme,
      setTheme,
      toggleTheme,
    }),
    [theme, resolvedTheme, setTheme, toggleTheme]
  );

  return (
    <AdminThemeContext.Provider value={value}>
      {children}
    </AdminThemeContext.Provider>
  );
}

export function useAdminTheme() {
  const context = useContext(AdminThemeContext);
  if (!context) {
    throw new Error("useAdminTheme must be used within an AdminThemeProvider");
  }
  return context;
}

/**
 * Standardized Theme Selector Pill for the Admin Header
 * Provides clear Light (Sun), Dark (Moon), and System (Laptop) options.
 */
export function AdminThemeToggle({ className = "", compact = false }) {
  const { theme, resolvedTheme, setTheme } = useAdminTheme();

  const options = [
    { key: "light", label: "Light", icon: Sun },
    { key: "dark", label: "Dark", icon: Moon },
    { key: "system", label: "System", icon: Laptop },
  ];

  if (compact) {
    // Single button that cycles or opens dropdown
    return (
      <div className={`relative inline-flex items-center ${className}`}>
        <button
          type="button"
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          className="p-2 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface-2)] text-[var(--admin-text-primary)] hover:border-[var(--admin-accent)] transition-all cursor-pointer"
          title={`Active theme: ${theme} (${resolvedTheme}). Click to switch.`}
          aria-label="Toggle admin color theme"
          data-testid="admin-theme-toggle-compact"
        >
          {resolvedTheme === "dark" ? (
            <Moon className="w-4 h-4 text-[var(--admin-accent)]" />
          ) : (
            <Sun className="w-4 h-4 text-[var(--admin-accent)]" />
          )}
        </button>
      </div>
    );
  }

  return (
    <div
      role="group"
      aria-label="Theme mode switcher"
      data-testid="admin-theme-switcher"
      className={`inline-flex items-center p-1 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface-2)] shadow-2xs ${className}`}
    >
      {options.map(({ key, label, icon: Icon }) => {
        const isActive = theme === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => setTheme(key)}
            aria-pressed={isActive}
            data-testid={`admin-theme-btn-${key}`}
            title={`Switch to ${label} mode`}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium tracking-wider uppercase rounded-md transition-all cursor-pointer ${
              isActive
                ? "bg-[var(--admin-surface)] text-[var(--admin-text-primary)] font-semibold shadow-xs border border-[var(--admin-border)]"
                : "text-[var(--admin-text-muted)] hover:text-[var(--admin-text-primary)] hover:bg-[var(--admin-surface-hover)]"
            }`}
          >
            <Icon
              className={`w-3.5 h-3.5 ${
                isActive ? "text-[var(--admin-accent)]" : "text-[var(--admin-text-muted)]"
              }`}
              strokeWidth={isActive ? 2 : 1.75}
            />
            <span className="hidden xl:inline">{label}</span>
          </button>
        );
      })}
    </div>
  );
}

export default AdminThemeContext;
