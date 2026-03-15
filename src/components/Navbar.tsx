import { Moon, Sun, Globe } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import ContactModal from "@/components/ContactModal";

interface NavbarProps {
  darkMode: boolean;
  onToggleDark: () => void;
}

const navCategories = [
  { key: "nav.daily", filter: "daily" },
  { key: "nav.twoday", filter: "twoday" },
  { key: "nav.internal", filter: "internal" },
  { key: "nav.external", filter: "external" },
];

const Navbar = ({ darkMode, onToggleDark }: NavbarProps) => {
  const { lang, setLang, t } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const navigate = useNavigate();

  const handleCategoryClick = (filter: string) => {
    navigate(`/trips?filter=${filter}`);
    setMenuOpen(false);
  };

  useEffect(() => {
    if (!menuOpen && !contactOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        setContactOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [menuOpen, contactOpen]);

  return (
    <>
      {/* Main nav */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
        className="fixed top-0 left-0 right-0 z-[100] px-4 py-4 md:px-8"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-0 right-0 top-0 h-4 bg-background"
        />
        <div className="premium-panel navbar-shell mx-auto flex w-full max-w-7xl items-center justify-between overflow-hidden rounded-[1.75rem] px-4 py-3 md:px-6 md:py-4">
          <Link to="/" className="shrink-0" aria-label={t("nav.brand")}>
            <img
              src={
                darkMode
                  ? "/branding/navbar/logo-dark.svg"
                  : "/branding/navbar/logo-light.svg"
              }
              alt={t("nav.brand")}
              className="h-11 w-auto"
            />
          </Link>

          {/* Desktop categories */}
          <div className="hidden lg:flex items-center gap-1">
            {navCategories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => handleCategoryClick(cat.filter)}
                className="px-4 py-2.5 rounded-full text-sm font-medium text-foreground-muted hover:text-foreground hover:bg-white/70 dark:hover:bg-white/5 transition-colors duration-200"
              >
                {t(cat.key)}
              </button>
            ))}
          </div>

          <div className="flex gap-2 items-center">
            <button
              onClick={() => setLang(lang === "en" ? "gr" : "en")}
              className="premium-outline-button p-3 flex items-center gap-1.5 text-sm"
              aria-label={t("nav.toggleLanguage")}
            >
              <Globe size={16} />
              <span className="text-xs uppercase">
                {lang === "en" ? "GR" : "EN"}
              </span>
            </button>

            <button
              onClick={onToggleDark}
              className="premium-outline-button p-3"
              aria-label={t("nav.toggleTheme")}
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden premium-outline-button p-3"
              aria-label={t("nav.menu")}
            >
              <div className="flex flex-col gap-1.5">
                <span
                  className={`block w-5 h-0.5 bg-foreground transition-transform duration-200 ${menuOpen ? "translate-y-[4px] rotate-45" : ""}`}
                />
                <span
                  className={`block w-5 h-0.5 bg-foreground transition-transform duration-200 ${menuOpen ? "-translate-y-[4px] -rotate-45" : ""}`}
                />
              </div>
            </button>

            <button
              onClick={() => setContactOpen(true)}
              className="hidden md:inline-flex premium-button-navbar text-sm"
            >
              {t("nav.contactBtn")}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="fixed top-[92px] left-4 right-4 z-[49] premium-panel rounded-[1.6rem] p-4 lg:hidden"
          >
            <div className="flex flex-col gap-2">
              {navCategories.map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => handleCategoryClick(cat.filter)}
                  className="px-4 py-3 rounded-2xl text-sm font-medium text-foreground hover:bg-white/70 dark:hover:bg-white/5 transition-colors text-left"
                >
                  {t(cat.key)}
                </button>
              ))}
              <button
                onClick={() => {
                  setContactOpen(true);
                  setMenuOpen(false);
                }}
                className="px-4 py-3 rounded-2xl text-sm font-medium text-primary hover:bg-white/70 dark:hover:bg-white/5 transition-colors text-left"
              >
                {t("nav.contactBtn")}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ContactModal open={contactOpen} onClose={() => setContactOpen(false)} />
    </>
  );
};

export default Navbar;
