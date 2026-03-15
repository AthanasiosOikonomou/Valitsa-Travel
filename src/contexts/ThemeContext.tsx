import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

interface ThemeContextValue {
  darkMode: boolean;
  toggleDark: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  darkMode: true,
  toggleDark: () => {},
});

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      const savedTheme = localStorage.getItem("darkMode");
      return savedTheme === null ? true : savedTheme === "true";
    } catch {
      return true;
    }
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    try {
      localStorage.setItem("darkMode", String(darkMode));
    } catch {}
  }, [darkMode]);

  const toggleDark = () => setDarkMode((prev) => !prev);

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
