export const THEME_STORAGE_KEY = "yummi-color-theme";

// Runs before the page is painted; only the explicit saved light theme opts in.
export const themeInitializationScript = `(() => {
  let theme = "dark";
  try { if (localStorage.getItem("${THEME_STORAGE_KEY}") === "light") theme = "light"; } catch {}
  document.documentElement.dataset.theme = theme;
})();`;

export function toggleTheme() {
  const theme = document.documentElement.dataset.theme === "light" ? "dark" : "light";
  document.documentElement.dataset.theme = theme;
  try { localStorage.setItem(THEME_STORAGE_KEY, theme); } catch { /* The theme still works for this page. */ }
}
