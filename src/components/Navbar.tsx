import { Moon, Sun, Globe } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
  const menuRef = useRef<HTMLDivElement>(null);
  const menuToggleRef = useRef<HTMLButtonElement>(null);
  const { pathname, search } = useLocation();
  const navigate = useNavigate();

  const scrollToPageTop = () => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  };

  const handleCategoryClick = (filter: string) => {
    const targetSearch = `?filter=${filter}`;

    if (pathname === "/trips" && search === targetSearch) {
      // Already on this category — reset any extra filters the user applied, then scroll to top.
      window.dispatchEvent(new Event("valitsa:reset-trips-filters"));
      window.dispatchEvent(new Event("valitsa:scroll-trips-top"));
      scrollToPageTop();
      setMenuOpen(false);
      return;
    }

    // Navigating to a different category — the useLayoutEffect in Trips.tsx
    // will reset filters automatically once initialFilterState recomputes.
    navigate(`/trips${targetSearch}`);

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

  useEffect(() => {
    if (!menuOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      const clickedMenu = menuRef.current?.contains(target);
      const clickedToggle = menuToggleRef.current?.contains(target);

      if (!clickedMenu && !clickedToggle) {
        setMenuOpen(false);
      }
    };

    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [menuOpen]);

  return (
    <>
      {/* Main nav */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
        className="fixed top-2 sm:top-0 left-0 right-0 z-[100] px-2 py-3 sm:px-4 md:px-8 md:py-4"
      >
        <div className="premium-panel navbar-shell mx-auto flex w-full max-w-7xl items-center justify-between rounded-[1.75rem] px-3 py-2.5 sm:px-4 md:px-6 md:py-4">
          <Link to="/" className="shrink-0" aria-label={t("nav.brand")}>
            <img
              src={
                darkMode
                  ? "/branding/navbar/logo-dark.svg"
                  : "/branding/navbar/logo-light.svg"
              }
              alt={t("nav.brand")}
              className="h-9 w-auto sm:h-11"
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

          <div className="flex shrink-0 gap-1.5 sm:gap-2 items-center">
            <button
              onClick={() => setLang(lang === "en" ? "gr" : "en")}
              className="premium-outline-button p-2.5 sm:p-3 flex items-center gap-1 text-sm"
              aria-label={t("nav.toggleLanguage")}
            >
              <Globe size={16} />
              <span className="text-xs uppercase">
                {lang === "en" ? "GR" : "EN"}
              </span>
            </button>

            <button
              onClick={onToggleDark}
              className="premium-outline-button p-2.5 sm:p-3"
              aria-label={t("nav.toggleTheme")}
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <button
              ref={menuToggleRef}
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden premium-outline-button p-2.5 sm:p-3"
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

      {/* Mobile menu backdrop */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setMenuOpen(false)}
            className="fixed inset-0 z-[48] bg-black/30 backdrop-blur-sm lg:hidden"
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="fixed top-[92px] left-4 right-4 z-[49] premium-panel rounded-[1.6rem] p-4 lg:hidden"
            style={{ boxShadow: "0 20px 60px -10px rgba(0, 0, 0, 0.7)" }}
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
