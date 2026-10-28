export const themeStorageKey = "theme";

// Runs before the first paint, so a saved or system dark theme doesn't flash light first.
export const themeInitScript = `try{document.documentElement.dataset.theme=localStorage.getItem("${themeStorageKey}")||(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light")}catch(e){}`;

export function toggleTheme() {
  const root = document.documentElement;
  const nextTheme = root.dataset.theme === "dark" ? "light" : "dark";
  root.dataset.theme = nextTheme;
  try {
    localStorage.setItem(themeStorageKey, nextTheme);
  } catch {
    // Private windows can block storage; the theme still applies until reload.
  }
}
