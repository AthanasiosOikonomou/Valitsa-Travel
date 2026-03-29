import {
  useCallback,
  useLayoutEffect,
  useState,
  useSyncExternalStore,
} from "react";
import { ArrowUp } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { instantScrollToTop } from "@/lib/instantScrollToTop";

const SCROLL_THRESHOLD = 200;
const MODAL_BLUR_CLASS = "modal-blur-active";

function subscribeModalBlur(onStoreChange: () => void) {
  if (typeof document === "undefined") return () => {};
  const observer = new MutationObserver(() => onStoreChange());
  observer.observe(document.body, {
    attributes: true,
    attributeFilter: ["class"],
  });
  return () => observer.disconnect();
}

function getModalBlurOpen() {
  if (typeof document === "undefined") return false;
  return document.body.classList.contains(MODAL_BLUR_CLASS);
}

const ScrollUpRail = () => {
  const { t } = useLanguage();
  const overlayOpen = useSyncExternalStore(
    subscribeModalBlur,
    getModalBlurOpen,
    () => false,
  );

  const [scrolledPast, setScrolledPast] = useState(false);

  const updateScroll = useCallback(() => {
    const y =
      window.scrollY ||
      document.documentElement.scrollTop ||
      document.body.scrollTop ||
      0;
    setScrolledPast(y > SCROLL_THRESHOLD);
  }, []);

  useLayoutEffect(() => {
    updateScroll();
  }, [updateScroll]);

  useLayoutEffect(() => {
    window.addEventListener("scroll", updateScroll, { passive: true });
    return () => window.removeEventListener("scroll", updateScroll);
  }, [updateScroll]);

  const visible = scrolledPast && !overlayOpen;

  return (
    <button
      type="button"
      aria-label={t("common.scrollUpAria")}
      onClick={() => instantScrollToTop()}
      className={[
        "scroll-up-rail-shell-pulse",
        "fixed right-4 top-24 z-[60] flex h-12 w-12 items-center justify-center",
        "md:right-6 md:top-28",
        "rounded-full border border-border/60 bg-background/80 backdrop-blur-md",
        "dark:border-white/18 dark:bg-background/75",
        "cursor-pointer select-none transition-opacity duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
        "hover:border-primary/35 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
        visible
          ? "pointer-events-auto opacity-100"
          : "pointer-events-none opacity-0",
      ].join(" ")}
    >
      <ArrowUp
        className="scroll-up-rail-breathe size-5 shrink-0 text-foreground/90"
        aria-hidden
        strokeWidth={2.25}
      />
    </button>
  );
};

export default ScrollUpRail;
