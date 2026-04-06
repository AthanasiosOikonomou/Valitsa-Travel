import { Moon, Sun, Globe, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import ContactModal from "@/components/ContactModal";
import { prefetchTripsRoute } from "@/lib/routePrefetch";
import { fetchSeasonalNavItems } from "@/lib/seasonalNavApi";
import { fetchMultidayDurationDays } from "@/lib/multidayNavApi";
import { showTrips } from "@/lib/showTrips";
import { cn } from "@/lib/utils";

interface NavbarProps {
  darkMode: boolean;
  onToggleDark: () => void;
}

const navCategoriesBeforeMultiday = [
  { key: "nav.daily", filter: "daily" },
  { key: "nav.twoday", filter: "twoday" },
];

const navCategoriesAfterMultiday = [
  { key: "nav.internal", filter: "internal" },
  { key: "nav.external", filter: "external" },
];

const buildMultidaySearch = (days: number | null) => {
  const p = new URLSearchParams();
  p.set("filter", "multiday");
  if (days != null) p.set("days", String(days));
  return `?${p.toString()}`;
};

const Navbar = ({ darkMode, onToggleDark }: NavbarProps) => {
  const { lang, setLang, t } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [seasonalDropdownOpen, setSeasonalDropdownOpen] = useState(false);
  const [multidayDropdownOpen, setMultidayDropdownOpen] = useState(false);
  const [seasonalAccordionOpen, setSeasonalAccordionOpen] = useState(false);
  const [multidayAccordionOpen, setMultidayAccordionOpen] = useState(false);
  const contactOwnedBlurRef = useRef(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuToggleRef = useRef<HTMLButtonElement>(null);
  const seasonalTriggerRef = useRef<HTMLButtonElement>(null);
  const seasonalPanelRef = useRef<HTMLDivElement>(null);
  const multidayTriggerRef = useRef<HTMLButtonElement>(null);
  const multidayPanelRef = useRef<HTMLDivElement>(null);
  const { pathname, search } = useLocation();
  const navigate = useNavigate();

  const { data: seasonalItems = [] } = useQuery({
    queryKey: ["seasonal-nav"],
    queryFn: fetchSeasonalNavItems,
    staleTime: 5 * 60 * 1000,
  });

  const { data: multidayDurationDays = [] } = useQuery({
    queryKey: ["multiday-nav-durations"],
    queryFn: fetchMultidayDurationDays,
    staleTime: 5 * 60 * 1000,
    enabled: showTrips,
  });

  const hasSeasonalMenu = showTrips && seasonalItems.length > 0;

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
      setSeasonalDropdownOpen(false);
      setMultidayDropdownOpen(false);
      return;
    }

    // Navigating to a different category — the useLayoutEffect in Trips.tsx
    // will reset filters automatically once initialFilterState recomputes.
    navigate(`/trips${targetSearch}`);

    setMenuOpen(false);
    setSeasonalDropdownOpen(false);
    setMultidayDropdownOpen(false);
  };

  const handleSeasonalClick = (seasonKey: string) => {
    const params = new URLSearchParams(search);
    const targetSearch = `?seasonal=${encodeURIComponent(seasonKey)}`;

    if (pathname === "/trips" && params.get("seasonal") === seasonKey) {
      window.dispatchEvent(new Event("valitsa:reset-trips-filters"));
      window.dispatchEvent(new Event("valitsa:scroll-trips-top"));
      scrollToPageTop();
      setMenuOpen(false);
      setSeasonalDropdownOpen(false);
      setMultidayDropdownOpen(false);
      return;
    }

    navigate(`/trips${targetSearch}`);
    setMenuOpen(false);
    setSeasonalDropdownOpen(false);
    setMultidayDropdownOpen(false);
  };

  const handleMultidayNavigate = (days: number | null) => {
    const targetSearch = buildMultidaySearch(days);

    if (pathname === "/trips" && search === targetSearch) {
      window.dispatchEvent(new Event("valitsa:reset-trips-filters"));
      window.dispatchEvent(new Event("valitsa:scroll-trips-top"));
      scrollToPageTop();
      setMenuOpen(false);
      setMultidayDropdownOpen(false);
      setMultidayAccordionOpen(false);
      setSeasonalDropdownOpen(false);
      return;
    }

    navigate(`/trips${targetSearch}`);
    setMenuOpen(false);
    setMultidayDropdownOpen(false);
    setMultidayAccordionOpen(false);
    setSeasonalDropdownOpen(false);
  };

  useEffect(() => {
    if (!seasonalDropdownOpen) return;

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (
        seasonalTriggerRef.current?.contains(target) ||
        seasonalPanelRef.current?.contains(target)
      ) {
        return;
      }
      setSeasonalDropdownOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [seasonalDropdownOpen]);

  useEffect(() => {
    if (!multidayDropdownOpen) return;

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (
        multidayTriggerRef.current?.contains(target) ||
        multidayPanelRef.current?.contains(target)
      ) {
        return;
      }
      setMultidayDropdownOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [multidayDropdownOpen]);

  useEffect(() => {
    if (!menuOpen && !contactOpen && !seasonalDropdownOpen && !multidayDropdownOpen)
      return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        setContactOpen(false);
        setSeasonalDropdownOpen(false);
        setMultidayDropdownOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [menuOpen, contactOpen, seasonalDropdownOpen, multidayDropdownOpen]);

  useEffect(() => {
    if (!contactOpen) return;

    if (!document.body.classList.contains("modal-blur-active")) {
      document.body.classList.add("modal-blur-active");
      contactOwnedBlurRef.current = true;
    } else {
      contactOwnedBlurRef.current = false;
    }

    return () => {
      if (contactOwnedBlurRef.current) {
        document.body.classList.remove("modal-blur-active");
        contactOwnedBlurRef.current = false;
      }
    };
  }, [contactOpen]);

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

  useEffect(() => {
    if (!menuOpen) {
      setSeasonalAccordionOpen(false);
      setMultidayAccordionOpen(false);
    }
  }, [menuOpen]);

  const navLinkClass =
    "shrink-0 whitespace-nowrap rounded-full px-2.5 py-2.5 text-sm font-medium text-foreground-muted hover:text-foreground hover:bg-white/70 dark:hover:bg-white/5 transition-colors [transition-duration:250ms] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] sm:px-3";

  const isMultidayRoute =
    pathname === "/trips" && new URLSearchParams(search).get("filter") === "multiday";

  return (
    <>
      {/* Main nav */}
      <motion.nav
        initial={{ y: -14, opacity: 0, scale: 0.98 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-2 sm:top-0 left-0 right-0 z-[100] px-2 py-3 sm:px-4 md:px-8 md:py-4 transform-gpu [backface-visibility:hidden]"
      >
        <div
          className={cn(
            "premium-panel navbar-shell mx-auto grid w-full max-w-[min(100%,1800px)] grid-cols-[1fr_auto] items-center gap-3 rounded-[1.75rem] px-3 py-2.5 sm:px-4 md:px-6 md:py-4 bg-white/70 dark:bg-slate-900/65 backdrop-blur-md transform-gpu [backface-visibility:hidden]",
            showTrips && hasSeasonalMenu
              ? "lg:grid-cols-[auto_minmax(0,1fr)_auto_minmax(0,1fr)_auto_auto] lg:gap-4"
              : showTrips
                ? "lg:grid-cols-[auto_minmax(0,1fr)_auto_minmax(0,1fr)_auto] lg:gap-4"
                : "lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:gap-4",
          )}
        >
          <Link
            to="/"
            className="shrink-0 justify-self-start"
            aria-label={t("nav.brand")}
          >
            <img
              src={
                darkMode
                  ? "/branding/navbar/logo-dark.svg"
                  : "/branding/navbar/logo-light.svg"
              }
              alt={t("nav.brand")}
              width={200}
              height={60}
              className="h-9 w-auto sm:h-11"
            />
          </Link>

          {/* Desktop categories: two equal 1fr tracks center the nav — logo→nav matches nav→utilities (or nav→seasonal when present) */}
          {showTrips ? (
            <>
              <div className="hidden min-w-0 lg:block" aria-hidden />
              {/* Split scroll regions so multiday’s absolute panel is not clipped by overflow-y (dropdown sits between columns). */}
              <div className="hidden min-w-0 w-full items-center gap-2 lg:flex">
                <div className="flex min-w-0 flex-1 flex-nowrap items-center justify-end gap-3 overflow-x-auto overscroll-x-contain [scrollbar-width:thin]">
                  {navCategoriesBeforeMultiday.map((cat) => (
                    <button
                      key={cat.key}
                      type="button"
                      onClick={() => handleCategoryClick(cat.filter)}
                      onMouseEnter={prefetchTripsRoute}
                      onFocus={prefetchTripsRoute}
                      className={navLinkClass}
                    >
                      {t(cat.key)}
                    </button>
                  ))}
                </div>
                <div className="relative z-[120] shrink-0">
                  <button
                    ref={multidayTriggerRef}
                    type="button"
                    onClick={() => {
                      setSeasonalDropdownOpen(false);
                      setMultidayDropdownOpen((open) => !open);
                    }}
                    onMouseEnter={prefetchTripsRoute}
                    onFocus={prefetchTripsRoute}
                    aria-expanded={multidayDropdownOpen}
                    aria-haspopup="menu"
                    aria-label={t("nav.multidayAria")}
                    className={cn(
                      "inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-2.5 text-sm font-medium hover:bg-white/70 dark:hover:bg-white/5 transition-colors [transition-duration:250ms] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] sm:gap-1.5 sm:px-3",
                      isMultidayRoute
                        ? "text-foreground"
                        : "text-foreground-muted hover:text-foreground",
                    )}
                  >
                    {t("nav.multiday")}
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 transition-transform duration-200 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] ${multidayDropdownOpen ? "rotate-180" : ""}`}
                      aria-hidden
                    />
                  </button>
                  <AnimatePresence>
                    {multidayDropdownOpen ? (
                      <motion.div
                        key="multiday-nav-dropdown"
                        ref={multidayPanelRef}
                        role="menu"
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{
                          duration: 0.2,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                        className="absolute left-1/2 top-[calc(100%+0.5rem)] z-[130] min-w-[14rem] -translate-x-1/2 rounded-2xl border border-foreground/15 bg-white p-2 shadow-lg dark:border-white/15 dark:bg-slate-900"
                        style={{ boxShadow: "var(--shadow-elev-3)" }}
                      >
                        <button
                          type="button"
                          role="menuitem"
                          onClick={() => handleMultidayNavigate(null)}
                          onMouseEnter={prefetchTripsRoute}
                          onFocus={prefetchTripsRoute}
                          className="flex w-full min-h-[44px] items-center rounded-xl px-4 py-3 text-left text-base font-medium text-foreground hover:bg-slate-100 dark:hover:bg-white/10"
                        >
                          {t("nav.multidayAll")}
                        </button>
                        {multidayDurationDays.map((d) => (
                          <button
                            key={d}
                            type="button"
                            role="menuitem"
                            onClick={() => handleMultidayNavigate(d)}
                            onMouseEnter={prefetchTripsRoute}
                            onFocus={prefetchTripsRoute}
                            className="flex w-full min-h-[44px] items-center rounded-xl px-4 py-3 text-left text-base font-medium text-foreground hover:bg-slate-100 dark:hover:bg-white/10"
                          >
                            {t("nav.multidayDaysOption").replace(
                              "{n}",
                              String(d),
                            )}
                          </button>
                        ))}
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
                <div className="flex min-w-0 flex-1 flex-nowrap items-center justify-start gap-3 overflow-x-auto overscroll-x-contain [scrollbar-width:thin]">
                  {navCategoriesAfterMultiday.map((cat) => (
                    <button
                      key={cat.key}
                      type="button"
                      onClick={() => handleCategoryClick(cat.filter)}
                      onMouseEnter={prefetchTripsRoute}
                      onFocus={prefetchTripsRoute}
                      className={navLinkClass}
                    >
                      {t(cat.key)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="hidden min-w-0 lg:block" aria-hidden />
              {hasSeasonalMenu ? (
                <div className="relative hidden min-w-0 shrink-0 lg:block">
                  <button
                    ref={seasonalTriggerRef}
                    type="button"
                    onClick={() => {
                      setMultidayDropdownOpen(false);
                      setSeasonalDropdownOpen((open) => !open);
                    }}
                    onMouseEnter={prefetchTripsRoute}
                    onFocus={prefetchTripsRoute}
                    aria-expanded={seasonalDropdownOpen}
                    aria-haspopup="menu"
                    aria-label={t("nav.seasonalAria")}
                    className="inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-2.5 text-sm font-medium text-foreground-muted hover:text-foreground hover:bg-white/70 dark:hover:bg-white/5 transition-colors [transition-duration:250ms] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] sm:gap-1.5 sm:px-3"
                  >
                    {t("nav.seasonal")}
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 transition-transform duration-200 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] ${seasonalDropdownOpen ? "rotate-180" : ""}`}
                      aria-hidden
                    />
                  </button>
                  <AnimatePresence>
                    {seasonalDropdownOpen ? (
                      <motion.div
                        key="seasonal-nav-dropdown"
                        ref={seasonalPanelRef}
                        role="menu"
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{
                          duration: 0.2,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                        className="absolute right-0 top-[calc(100%+0.5rem)] z-[110] min-w-[14rem] rounded-2xl border border-foreground/15 bg-white p-2 shadow-lg dark:border-white/15 dark:bg-slate-900"
                        style={{ boxShadow: "var(--shadow-elev-3)" }}
                      >
                        {seasonalItems.map((item) => (
                          <button
                            key={item.key}
                            role="menuitem"
                            type="button"
                            onClick={() => handleSeasonalClick(item.key)}
                            onMouseEnter={prefetchTripsRoute}
                            onFocus={prefetchTripsRoute}
                            className="flex w-full min-h-[44px] items-center rounded-xl px-4 py-3 text-left text-base font-medium text-foreground hover:bg-slate-100 dark:hover:bg-white/10"
                          >
                            {lang === "gr" ? item.label_el : item.label_en}
                          </button>
                        ))}
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
              ) : null}
            </>
          ) : (
            <div className="hidden min-w-0 lg:block" aria-hidden />
          )}

          <div className="flex shrink-0 gap-1.5 sm:gap-2 items-center justify-self-end">
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
              className="premium-outline-button relative isolate grid h-10 w-10 place-items-center overflow-hidden p-0 sm:h-11 sm:w-11"
              aria-label={t("nav.toggleTheme")}
            >
              <AnimatePresence mode="wait" initial={false}>
                {darkMode ? (
                  <motion.span
                    key="sun"
                    initial={{ opacity: 0, rotate: -90, scale: 0.85 }}
                    animate={{ opacity: 1, rotate: 0, scale: 1 }}
                    exit={{ opacity: 0, rotate: 90, scale: 0.85 }}
                    transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute"
                  >
                    <Sun size={18} />
                  </motion.span>
                ) : (
                  <motion.span
                    key="moon"
                    initial={{ opacity: 0, rotate: 90, scale: 0.85 }}
                    animate={{ opacity: 1, rotate: 0, scale: 1 }}
                    exit={{ opacity: 0, rotate: -90, scale: 0.85 }}
                    transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute"
                  >
                    <Moon size={18} />
                  </motion.span>
                )}
              </AnimatePresence>
            </button>

            <button
              ref={menuToggleRef}
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden premium-outline-button p-2.5 sm:p-3"
              aria-label={t("nav.menu")}
            >
              <div className="flex flex-col gap-1.5">
                <span
                  className={`block w-5 h-0.5 bg-foreground transition-transform [transition-duration:250ms] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] ${menuOpen ? "translate-y-[4px] rotate-45" : ""}`}
                />
                <span
                  className={`block w-5 h-0.5 bg-foreground transition-transform [transition-duration:250ms] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] ${menuOpen ? "-translate-y-[4px] -rotate-45" : ""}`}
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
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
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
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className="fixed top-[92px] left-4 right-4 z-[49] premium-panel rounded-[1.6rem] p-4 lg:hidden transform-gpu [backface-visibility:hidden]"
            style={{ boxShadow: "var(--shadow-elev-3)" }}
          >
            <div className="flex flex-col gap-2">
              {showTrips ? (
                <>
                  {navCategoriesBeforeMultiday.map((cat) => (
                    <button
                      key={cat.key}
                      type="button"
                      onClick={() => handleCategoryClick(cat.filter)}
                      className="px-4 py-3 rounded-2xl text-sm font-medium text-foreground hover:bg-white/70 dark:hover:bg-white/5 transition-colors [transition-duration:250ms] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] text-left"
                    >
                      {t(cat.key)}
                    </button>
                  ))}
                  <div className="flex flex-col gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setSeasonalAccordionOpen(false);
                        setMultidayAccordionOpen((open) => !open);
                      }}
                      aria-expanded={multidayAccordionOpen}
                      className="flex w-full items-center justify-between gap-2 rounded-2xl px-4 py-3 text-left text-sm font-medium text-foreground hover:bg-white/70 dark:hover:bg-white/5 transition-colors [transition-duration:250ms] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)]"
                    >
                      <span>{t("nav.multiday")}</span>
                      <ChevronDown
                        className={`h-4 w-4 shrink-0 transition-transform duration-200 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] ${multidayAccordionOpen ? "rotate-180" : ""}`}
                        aria-hidden
                      />
                    </button>
                    {multidayAccordionOpen ? (
                      <div className="ml-3 flex flex-col gap-1 border-l border-foreground/10 pl-3 dark:border-white/10">
                        <button
                          type="button"
                          onClick={() => handleMultidayNavigate(null)}
                          className="rounded-xl px-4 py-2.5 text-left text-sm font-medium text-foreground-muted hover:bg-white/70 hover:text-foreground dark:hover:bg-white/5"
                        >
                          {t("nav.multidayAll")}
                        </button>
                        {multidayDurationDays.map((d) => (
                          <button
                            key={d}
                            type="button"
                            onClick={() => handleMultidayNavigate(d)}
                            className="rounded-xl px-4 py-2.5 text-left text-sm font-medium text-foreground-muted hover:bg-white/70 hover:text-foreground dark:hover:bg-white/5"
                          >
                            {t("nav.multidayDaysOption").replace(
                              "{n}",
                              String(d),
                            )}
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                  {navCategoriesAfterMultiday.map((cat) => (
                    <button
                      key={cat.key}
                      type="button"
                      onClick={() => handleCategoryClick(cat.filter)}
                      className="px-4 py-3 rounded-2xl text-sm font-medium text-foreground hover:bg-white/70 dark:hover:bg-white/5 transition-colors [transition-duration:250ms] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] text-left"
                    >
                      {t(cat.key)}
                    </button>
                  ))}
                </>
              ) : null}
              {hasSeasonalMenu ? (
                <div className="flex flex-col gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setMultidayAccordionOpen(false);
                      setSeasonalAccordionOpen((open) => !open);
                    }}
                    aria-expanded={seasonalAccordionOpen}
                    className="flex w-full items-center justify-between gap-2 rounded-2xl px-4 py-3 text-left text-sm font-medium text-foreground hover:bg-white/70 dark:hover:bg-white/5 transition-colors [transition-duration:250ms] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)]"
                  >
                    <span>{t("nav.seasonal")}</span>
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 transition-transform duration-200 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] ${seasonalAccordionOpen ? "rotate-180" : ""}`}
                      aria-hidden
                    />
                  </button>
                  {seasonalAccordionOpen ? (
                    <div className="ml-3 flex flex-col gap-1 border-l border-foreground/10 pl-3 dark:border-white/10">
                      {seasonalItems.map((item) => (
                        <button
                          key={item.key}
                          type="button"
                          onClick={() => handleSeasonalClick(item.key)}
                          className="rounded-xl px-4 py-2.5 text-left text-sm font-medium text-foreground-muted hover:bg-white/70 hover:text-foreground dark:hover:bg-white/5"
                        >
                          {lang === "gr" ? item.label_el : item.label_en}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              ) : null}
              <button
                onClick={() => {
                  setContactOpen(true);
                  setMenuOpen(false);
                }}
                className="px-4 py-3 rounded-2xl text-sm font-medium text-primary hover:bg-white/70 dark:hover:bg-white/5 transition-colors [transition-duration:250ms] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] text-left"
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
