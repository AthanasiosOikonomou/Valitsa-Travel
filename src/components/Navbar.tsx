import { Moon, Sun, Globe, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Fragment,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
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

type TripNavSlot =
  | { type: "category"; id: string; filter: string; labelKey: string }
  | { type: "multiday"; id: "multiday" }
  | { type: "seasonal"; id: "seasonal" };

function buildTripNavSlots(includeSeasonal: boolean): TripNavSlot[] {
  const out: TripNavSlot[] = [];
  for (const c of navCategoriesBeforeMultiday) {
    out.push({
      type: "category",
      id: c.filter,
      filter: c.filter,
      labelKey: c.key,
    });
  }
  out.push({ type: "multiday", id: "multiday" });
  for (const c of navCategoriesAfterMultiday) {
    out.push({
      type: "category",
      id: c.filter,
      filter: c.filter,
      labelKey: c.key,
    });
  }
  if (includeSeasonal) out.push({ type: "seasonal", id: "seasonal" });
  return out;
}

const Navbar = ({ darkMode, onToggleDark }: NavbarProps) => {
  const { lang, setLang, t } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [seasonalDropdownOpen, setSeasonalDropdownOpen] = useState(false);
  const [multidayDropdownOpen, setMultidayDropdownOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [morePanelMultidayOpen, setMorePanelMultidayOpen] = useState(false);
  const [morePanelSeasonalOpen, setMorePanelSeasonalOpen] = useState(false);
  const [seasonalAccordionOpen, setSeasonalAccordionOpen] = useState(false);
  const [multidayAccordionOpen, setMultidayAccordionOpen] = useState(false);
  const contactOwnedBlurRef = useRef(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuToggleRef = useRef<HTMLButtonElement>(null);
  const seasonalTriggerRef = useRef<HTMLButtonElement>(null);
  const seasonalPanelRef = useRef<HTMLDivElement>(null);
  const multidayTriggerRef = useRef<HTMLButtonElement>(null);
  const multidayPanelRef = useRef<HTMLDivElement>(null);
  const moreTriggerRef = useRef<HTMLButtonElement>(null);
  const morePanelRef = useRef<HTMLDivElement>(null);
  const desktopNavCellRef = useRef<HTMLDivElement>(null);
  const measureAvailRef = useRef<HTMLDivElement>(null);
  const measureFullRef = useRef<HTMLDivElement>(null);
  const moreMeasureRef = useRef<HTMLButtonElement>(null);
  const [multidayMenuPos, setMultidayMenuPos] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const [isLg, setIsLg] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(min-width: 1024px)").matches
      : false,
  );
  const [visibleSlotCount, setVisibleSlotCount] = useState(99);
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
  const tripNavSlots = useMemo(
    () => buildTripNavSlots(hasSeasonalMenu),
    [hasSeasonalMenu],
  );

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const sync = () => setIsLg(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const navLinkClass =
    "shrink-0 whitespace-nowrap rounded-full px-3 py-2.5 text-sm font-medium leading-normal text-foreground-muted hover:text-foreground hover:bg-white/70 dark:hover:bg-white/5 transition-colors [transition-duration:250ms] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] sm:px-3.5";

  const multidayTriggerClass = cn(
    "inline-flex items-center gap-1 whitespace-nowrap rounded-full px-3 py-2.5 text-sm font-medium leading-normal hover:bg-white/70 dark:hover:bg-white/5 transition-colors [transition-duration:250ms] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] sm:gap-1.5 sm:px-3.5",
  );

  const remeasureDesktopNav = useCallback(() => {
    const n = tripNavSlots.length;
    if (!showTrips || !isLg) {
      setVisibleSlotCount(n);
      return;
    }
    const cell = desktopNavCellRef.current;
    const measureAvail = measureAvailRef.current;
    const measureFull = measureFullRef.current;
    const moreEl = moreMeasureRef.current;
    if (!cell || !measureAvail || !measureFull || !moreEl || n === 0) return;

    const kids = [...measureFull.children];
    if (kids.length < n) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          remeasureDesktopNav();
        });
      });
      return;
    }

    const availCs = getComputedStyle(measureAvail);
    const padX =
      (parseFloat(availCs.paddingLeft) || 0) +
      (parseFloat(availCs.paddingRight) || 0);
    const cellW = cell.getBoundingClientRect().width;
    const avail = Math.max(0, cellW - padX);
    const safety = Math.max(24, Math.ceil(avail * 0.02));
    const budget = Math.max(0, avail - safety);

    const gapCs = getComputedStyle(measureFull);
    const gapRaw = gapCs.columnGap || gapCs.gap || "12px";
    const gapPx = parseFloat(gapRaw.split(/\s+/)[0] || "") || 12;

    const widths = kids.map((el) =>
      Math.ceil((el as HTMLElement).offsetWidth),
    );
    const wMore = Math.ceil(moreEl.offsetWidth);

    let needAll = 0;
    for (let i = 0; i < n; i++) {
      needAll += widths[i];
      if (i > 0) needAll += gapPx;
    }
    if (needAll <= budget) {
      setVisibleSlotCount(n);
      return;
    }

    let best = 0;
    for (let k = n; k >= 0; k--) {
      let sum = 0;
      for (let i = 0; i < k; i++) {
        sum += widths[i];
        if (i > 0) sum += gapPx;
      }
      const needMore = k < n;
      const gapBeforeMore = needMore && k > 0 ? gapPx : 0;
      const total = sum + (needMore ? gapBeforeMore + wMore : 0);
      if (total <= budget) {
        best = k;
        break;
      }
    }
    setVisibleSlotCount(best);
  }, [showTrips, isLg, tripNavSlots]);

  useLayoutEffect(() => {
    let alive = true;
    remeasureDesktopNav();
    const id = requestAnimationFrame(() => {
      if (!alive) return;
      remeasureDesktopNav();
      requestAnimationFrame(() => {
        if (!alive) return;
        remeasureDesktopNav();
      });
    });
    return () => {
      alive = false;
      cancelAnimationFrame(id);
    };
  }, [
    remeasureDesktopNav,
    lang,
    seasonalItems.length,
    multidayDurationDays.length,
  ]);

  useEffect(() => {
    if (!showTrips || !isLg) return;
    const observeEl = desktopNavCellRef.current;
    if (!observeEl) return;
    let alive = true;
    const schedule = () => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (!alive) return;
          remeasureDesktopNav();
        });
      });
    };
    const ro = new ResizeObserver(schedule);
    ro.observe(observeEl);
    window.addEventListener("resize", schedule);
    return () => {
      alive = false;
      ro.disconnect();
      window.removeEventListener("resize", schedule);
    };
  }, [showTrips, isLg, remeasureDesktopNav]);

  useEffect(() => {
    if (!showTrips || !isLg) return;
    if (typeof document === "undefined" || !document.fonts?.ready) return;
    let cancelled = false;
    void document.fonts.ready.then(() => {
      if (cancelled) return;
      requestAnimationFrame(() => {
        if (cancelled) return;
        remeasureDesktopNav();
      });
    });
    return () => {
      cancelled = true;
    };
  }, [showTrips, isLg, lang, remeasureDesktopNav]);

  useLayoutEffect(() => {
    if (!multidayDropdownOpen) {
      setMultidayMenuPos(null);
      return;
    }
    const update = () => {
      const el = multidayTriggerRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      setMultidayMenuPos({ top: r.bottom + 8, left: r.left + r.width / 2 });
    };
    update();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [multidayDropdownOpen, lang, visibleSlotCount]);

  const scrollToPageTop = () => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  };

  const handleCategoryClick = (filter: string) => {
    const targetSearch = `?filter=${filter}`;

    if (pathname === "/trips" && search === targetSearch) {
      window.dispatchEvent(new Event("valitsa:reset-trips-filters"));
      window.dispatchEvent(new Event("valitsa:scroll-trips-top"));
      scrollToPageTop();
      setMenuOpen(false);
      setSeasonalDropdownOpen(false);
      setMultidayDropdownOpen(false);
      setMoreMenuOpen(false);
      return;
    }

    navigate(`/trips${targetSearch}`);

    setMenuOpen(false);
    setSeasonalDropdownOpen(false);
    setMultidayDropdownOpen(false);
    setMoreMenuOpen(false);
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
      setMoreMenuOpen(false);
      return;
    }

    navigate(`/trips${targetSearch}`);
    setMenuOpen(false);
    setSeasonalDropdownOpen(false);
    setMultidayDropdownOpen(false);
    setMoreMenuOpen(false);
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
      setMoreMenuOpen(false);
      return;
    }

    navigate(`/trips${targetSearch}`);
    setMenuOpen(false);
    setMultidayDropdownOpen(false);
    setMultidayAccordionOpen(false);
    setSeasonalDropdownOpen(false);
    setMoreMenuOpen(false);
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
    if (!moreMenuOpen) {
      setMorePanelMultidayOpen(false);
      setMorePanelSeasonalOpen(false);
    }
  }, [moreMenuOpen]);

  useEffect(() => {
    if (!moreMenuOpen) return;

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (
        moreTriggerRef.current?.contains(target) ||
        morePanelRef.current?.contains(target)
      ) {
        return;
      }
      setMoreMenuOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [moreMenuOpen]);

  useEffect(() => {
    if (!menuOpen && !contactOpen && !seasonalDropdownOpen && !multidayDropdownOpen && !moreMenuOpen)
      return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        setContactOpen(false);
        setSeasonalDropdownOpen(false);
        setMultidayDropdownOpen(false);
        setMoreMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [menuOpen, contactOpen, seasonalDropdownOpen, multidayDropdownOpen, moreMenuOpen]);

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

  const isMultidayRoute =
    pathname === "/trips" && new URLSearchParams(search).get("filter") === "multiday";

  const multidaySlotIndex = tripNavSlots.findIndex((s) => s.type === "multiday");
  const multidayInline =
    multidaySlotIndex >= 0 && visibleSlotCount > multidaySlotIndex;

  const renderMeasureSlot = (slot: TripNavSlot) => {
    if (slot.type === "category") {
      return (
        <button
          type="button"
          tabIndex={-1}
          aria-hidden
          className={navLinkClass}
        >
          {t(slot.labelKey)}
        </button>
      );
    }
    if (slot.type === "multiday") {
      return (
        <div className="relative z-[120] shrink-0">
          <button
            type="button"
            tabIndex={-1}
            aria-hidden
            className={cn(
              multidayTriggerClass,
              isMultidayRoute
                ? "text-foreground"
                : "text-foreground-muted hover:text-foreground",
            )}
          >
            {t("nav.multiday")}
            <ChevronDown className="h-4 w-4 shrink-0" aria-hidden />
          </button>
        </div>
      );
    }
    return (
      <div className="relative z-[120] shrink-0">
        <button
          type="button"
          tabIndex={-1}
          aria-hidden
          className={cn(
            multidayTriggerClass,
            "text-foreground-muted hover:text-foreground",
          )}
        >
          {t("nav.seasonal")}
          <ChevronDown className="h-4 w-4 shrink-0" aria-hidden />
        </button>
      </div>
    );
  };

  const renderInlineSlot = (slot: TripNavSlot) => {
    if (slot.type === "category") {
      return (
        <button
          type="button"
          onClick={() => handleCategoryClick(slot.filter)}
          onMouseEnter={prefetchTripsRoute}
          onFocus={prefetchTripsRoute}
          className={navLinkClass}
        >
          {t(slot.labelKey)}
        </button>
      );
    }
    if (slot.type === "multiday") {
      return (
        <div className="relative z-[120] shrink-0">
          <button
            ref={multidayTriggerRef}
            type="button"
            onClick={() => {
              setSeasonalDropdownOpen(false);
              setMoreMenuOpen(false);
              setMultidayDropdownOpen((open) => !open);
            }}
            onMouseEnter={prefetchTripsRoute}
            onFocus={prefetchTripsRoute}
            aria-expanded={multidayDropdownOpen}
            aria-haspopup="menu"
            aria-label={t("nav.multidayAria")}
            className={cn(
              multidayTriggerClass,
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
        </div>
      );
    }
    return (
      <div className="relative z-[120] shrink-0">
        <button
          ref={seasonalTriggerRef}
          type="button"
          onClick={() => {
            setMultidayDropdownOpen(false);
            setMoreMenuOpen(false);
            setSeasonalDropdownOpen((open) => !open);
          }}
          onMouseEnter={prefetchTripsRoute}
          onFocus={prefetchTripsRoute}
          aria-expanded={seasonalDropdownOpen}
          aria-haspopup="menu"
          aria-label={t("nav.seasonalAria")}
          className={cn(
            multidayTriggerClass,
            "text-foreground-muted hover:text-foreground hover:bg-white/70 dark:hover:bg-white/5",
          )}
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
              className="absolute right-0 top-[calc(100%+0.5rem)] z-[140] min-w-[14rem] rounded-2xl border border-foreground/15 bg-white p-2 shadow-lg dark:border-white/15 dark:bg-slate-900"
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
    );
  };

  const morePanelItemClass =
    "flex w-full min-h-[40px] items-center rounded-xl px-4 py-2.5 text-left text-sm font-medium leading-normal text-foreground hover:bg-slate-100 dark:hover:bg-white/10";
  const morePanelDisclosureClass =
    "flex w-full min-h-[40px] items-center justify-between gap-2 rounded-xl px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-foreground-muted hover:bg-slate-100 dark:hover:bg-white/10";

  const renderMorePanelSlot = (slot: TripNavSlot, index: number) => {
    const sectionClass =
      index > 0 ? "border-t border-foreground/10 pt-2 dark:border-white/10" : "";
    if (slot.type === "category") {
      return (
        <button
          key={slot.id}
          type="button"
          role="menuitem"
          onClick={() => handleCategoryClick(slot.filter)}
          className={cn(morePanelItemClass, sectionClass)}
        >
          {t(slot.labelKey)}
        </button>
      );
    }
    if (slot.type === "multiday") {
      return (
        <div key="multiday-more" className={sectionClass}>
          <button
            type="button"
            aria-expanded={morePanelMultidayOpen}
            onClick={() => setMorePanelMultidayOpen((o) => !o)}
            className={morePanelDisclosureClass}
          >
            <span>{t("nav.multiday")}</span>
            <ChevronDown
              className={`h-4 w-4 shrink-0 transition-transform duration-200 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] ${morePanelMultidayOpen ? "rotate-180" : ""}`}
              aria-hidden
            />
          </button>
          {morePanelMultidayOpen ? (
            <>
              <button
                type="button"
                role="menuitem"
                onClick={() => handleMultidayNavigate(null)}
                className={morePanelItemClass}
              >
                {t("nav.multidayAll")}
              </button>
              {multidayDurationDays.map((d) => (
                <button
                  key={d}
                  type="button"
                  role="menuitem"
                  onClick={() => handleMultidayNavigate(d)}
                  className={morePanelItemClass}
                >
                  {t("nav.multidayDaysOption").replace("{n}", String(d))}
                </button>
              ))}
            </>
          ) : null}
        </div>
      );
    }
    return (
      <div key="seasonal-more" className={sectionClass}>
        <button
          type="button"
          aria-expanded={morePanelSeasonalOpen}
          onClick={() => setMorePanelSeasonalOpen((o) => !o)}
          className={morePanelDisclosureClass}
        >
          <span>{t("nav.seasonal")}</span>
          <ChevronDown
            className={`h-4 w-4 shrink-0 transition-transform duration-200 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] ${morePanelSeasonalOpen ? "rotate-180" : ""}`}
            aria-hidden
          />
        </button>
        {morePanelSeasonalOpen
          ? seasonalItems.map((item) => (
              <button
                key={item.key}
                type="button"
                role="menuitem"
                onClick={() => handleSeasonalClick(item.key)}
                className={morePanelItemClass}
              >
                {lang === "gr" ? item.label_el : item.label_en}
              </button>
            ))
          : null}
      </div>
    );
  };

  const moreBtnClass = cn(
    navLinkClass,
    "inline-flex items-center gap-1",
  );

  const overflowSlots = tripNavSlots.slice(visibleSlotCount);

  return (
    <>
      <motion.nav
        initial={{ y: -14, opacity: 0, scale: 0.98 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-2 sm:top-0 left-0 right-0 z-[100] px-2 py-3 sm:px-4 md:px-8 md:py-4 transform-gpu [backface-visibility:hidden]"
      >
        <div
          className={cn(
            "premium-panel navbar-shell mx-auto grid w-full max-w-[min(100%,1800px)] grid-cols-[1fr_auto] items-center gap-3 rounded-[1.75rem] px-3 py-2.5 sm:px-4 md:px-6 md:py-4 bg-white/70 dark:bg-slate-900/65 backdrop-blur-md transform-gpu [backface-visibility:hidden] lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:gap-4",
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

          {showTrips ? (
            <div
              ref={desktopNavCellRef}
              className="relative z-[101] hidden min-w-0 w-full overflow-visible lg:block"
            >
                <div
                  ref={measureAvailRef}
                  className="pointer-events-none absolute left-0 right-0 top-0 -z-10 w-full select-none px-1 opacity-0 sm:px-2"
                  aria-hidden
                >
                  <div
                    ref={measureFullRef}
                    className="flex w-max max-w-none shrink-0 flex-nowrap gap-3"
                  >
                    {tripNavSlots.map((slot) => (
                      <Fragment key={`meas-${slot.id}`}>
                        {renderMeasureSlot(slot)}
                      </Fragment>
                    ))}
                  </div>
                </div>
                <button
                  ref={moreMeasureRef}
                  type="button"
                  tabIndex={-1}
                  className={cn(
                    moreBtnClass,
                    "pointer-events-none absolute left-0 top-0 -z-10 opacity-0",
                  )}
                  aria-hidden
                >
                  {t("nav.more")}
                  <ChevronDown className="h-4 w-4 shrink-0" aria-hidden />
                </button>

                <div className="flex min-w-0 w-full items-center justify-start gap-3 overflow-visible px-1 sm:px-2">
                  {tripNavSlots.slice(0, visibleSlotCount).map((slot) => (
                    <Fragment key={slot.id}>{renderInlineSlot(slot)}</Fragment>
                  ))}
                  {overflowSlots.length > 0 ? (
                    <div className="relative z-[130] shrink-0">
                      <button
                        ref={moreTriggerRef}
                        type="button"
                        onClick={() => {
                          setMultidayDropdownOpen(false);
                          setSeasonalDropdownOpen(false);
                          setMoreMenuOpen((o) => !o);
                        }}
                        aria-expanded={moreMenuOpen}
                        aria-haspopup="menu"
                        aria-label={t("nav.moreAria")}
                        className={moreBtnClass}
                      >
                        {t("nav.more")}
                        <ChevronDown
                          className={`h-4 w-4 shrink-0 transition-transform duration-200 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] ${moreMenuOpen ? "rotate-180" : ""}`}
                          aria-hidden
                        />
                      </button>
                      <AnimatePresence>
                        {moreMenuOpen ? (
                          <motion.div
                            ref={morePanelRef}
                            key="more-nav-dropdown"
                            role="menu"
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{
                              duration: 0.2,
                              ease: [0.22, 1, 0.36, 1],
                            }}
                            className="absolute left-0 top-[calc(100%+0.5rem)] z-[140] max-h-[min(70vh,28rem)] min-w-[16rem] overflow-y-auto rounded-2xl border border-foreground/15 bg-white p-2 shadow-lg dark:border-white/15 dark:bg-slate-900"
                            style={{ boxShadow: "var(--shadow-elev-3)" }}
                          >
                            {overflowSlots.map((slot, index) =>
                              renderMorePanelSlot(slot, index),
                            )}
                          </motion.div>
                        ) : null}
                      </AnimatePresence>
                    </div>
                  ) : null}
                </div>
            </div>
          ) : (
            <div className="hidden min-w-0 lg:block" aria-hidden />
          )}

          <div className="relative z-[200] flex shrink-0 gap-1.5 sm:gap-2 items-center justify-self-end">
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

      {showTrips && typeof document !== "undefined"
        ? createPortal(
            <AnimatePresence>
              {multidayDropdownOpen &&
              multidayMenuPos &&
              isLg &&
              multidayInline ? (
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
                  className="fixed z-[130] min-w-[14rem] rounded-2xl border border-foreground/15 bg-white p-2 shadow-lg dark:border-white/15 dark:bg-slate-900"
                  style={{
                    boxShadow: "var(--shadow-elev-3)",
                    top: multidayMenuPos.top,
                    left: multidayMenuPos.left,
                    transform: "translateX(-50%)",
                  }}
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
                      {t("nav.multidayDaysOption").replace("{n}", String(d))}
                    </button>
                  ))}
                </motion.div>
              ) : null}
            </AnimatePresence>,
            document.body,
          )
        : null}

      <AnimatePresence>
        {menuOpen && !isLg ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            onClick={() => setMenuOpen(false)}
            className="fixed inset-0 z-[48] bg-black/30 backdrop-blur-sm"
            aria-hidden="true"
          />
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {menuOpen && !isLg ? (
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className="fixed top-[92px] left-4 right-4 z-[49] premium-panel rounded-[1.6rem] p-4 transform-gpu [backface-visibility:hidden]"
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
        ) : null}
      </AnimatePresence>

      <ContactModal open={contactOpen} onClose={() => setContactOpen(false)} />
    </>
  );
};

export default Navbar;
