import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

export type ThemeName = "light" | "dark" | "custom";
export interface ThemeConfig {
  colorPrimary: string;
}

interface ThemeState {
  currentTheme: ThemeName;
  themes: Record<ThemeName, ThemeConfig>;
  setTheme: (theme: ThemeName) => void;
  toggleTheme: (themeName?: ThemeName) => void;
}

const themes: Record<ThemeName, ThemeConfig> = {
  light: { colorPrimary: "#1677ff" },
  dark: { colorPrimary: "#722ed1" },
  custom: { colorPrimary: "#f5222d" },
};

export const useThemeStore = create<ThemeState>()(
  devtools(
    persist(
      (set, get) => ({
        currentTheme: "light",
        themes,
        setTheme: theme => {
          set({ currentTheme: theme });
          applyThemeToDOM(theme);
        },
        toggleTheme: () => {
          const { currentTheme } = get();
          const next = currentTheme === "light" ? "dark" : "light";
          get().setTheme(next);
        },
      }),
      {
        name: "app-theme", // localStorage key
        onRehydrateStorage: () => state => {
          // 初始化时把主题写到 DOM
          if (state) applyThemeToDOM(state.currentTheme);
        },
      }
    )
  )
);

/* ---------- DOM / CSS 工具函数 ---------- */
function applyThemeToDOM(theme: ThemeName) {
  localStorage.setItem("appTheme", theme);
  const root = document.documentElement;
  root.classList.remove("light", "dark", "custom");
  root.classList.add(theme);
}
