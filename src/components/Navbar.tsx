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
        className="fixed top-0 w-full z-50 px-6 md:px-10 py-4 flex justify-between items-center backdrop-blur-xl bg-background/80 border-b border-border/50"
      >
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
              className="px-4 py-2.5 rounded-full text-sm font-medium text-foreground-muted hover:text-foreground hover:bg-muted transition-colors duration-200"
            >
              {t(cat.key)}
            </button>
          ))}
        </div>

        <div className="flex gap-2 items-center">
          <button
            onClick={() => setLang(lang === "en" ? "gr" : "en")}
            className="p-3 rounded-full hover:bg-muted transition-colors duration-200 flex items-center gap-1.5 text-sm font-semibold"
            aria-label={t("nav.toggleLanguage")}
          >
            <Globe size={16} />
            <span className="text-xs uppercase">
              {lang === "en" ? "GR" : "EN"}
            </span>
          </button>

          <button
            onClick={onToggleDark}
            className="p-3 rounded-full hover:bg-muted transition-colors duration-200"
            aria-label={t("nav.toggleTheme")}
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="lg:hidden p-3 rounded-full hover:bg-muted transition-colors duration-200"
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
            className="hidden md:block bg-foreground text-background px-6 py-3 rounded-full font-semibold text-sm tracking-wide hover:opacity-90 transition-opacity"
          >
            {t("nav.contactBtn")}
          </button>
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
            className="fixed top-[64px] left-0 right-0 z-[49] bg-background/95 backdrop-blur-xl border-b border-border p-6 lg:hidden"
          >
            <div className="flex flex-col gap-2">
              {navCategories.map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => handleCategoryClick(cat.filter)}
                  className="px-4 py-3 rounded-2xl text-sm font-medium text-foreground hover:bg-muted transition-colors text-left"
                >
                  {t(cat.key)}
                </button>
              ))}
              <button
                onClick={() => {
                  setContactOpen(true);
                  setMenuOpen(false);
                }}
                className="px-4 py-3 rounded-2xl text-sm font-medium text-primary hover:bg-muted transition-colors text-left"
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
