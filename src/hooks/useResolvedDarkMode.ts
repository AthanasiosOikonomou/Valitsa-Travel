import { useTheme } from "next-themes";

/**
 * True when the UI is dark. While `resolvedTheme` is still undefined on the
 * first client paint, falls back to `html.dark` set by the inline boot script.
 */
export function useResolvedDarkMode(): boolean {
  const { resolvedTheme } = useTheme();
  if (resolvedTheme === "dark") return true;
  if (resolvedTheme === "light") return false;
  if (typeof document !== "undefined") {
    return document.documentElement.classList.contains("dark");
  }
  return false;
}
