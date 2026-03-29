import {
  useCallback,
  useLayoutEffect,
  useState,
  type RefObject,
} from "react";
import { ArrowUp } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { smoothScrollElementToTop } from "@/lib/instantScrollToTop";

const SCROLL_THRESHOLD = 200;

type ModalScrollUpButtonProps = {
  scrollContainerRef: RefObject<HTMLElement | null>;
};

/** Matches the main ScrollUpRail control; scrolls the modal’s own scroll container. */
const ModalScrollUpButton = ({ scrollContainerRef }: ModalScrollUpButtonProps) => {
  const { t } = useLanguage();
  const [visible, setVisible] = useState(false);

  const updateScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    setVisible(el.scrollTop > SCROLL_THRESHOLD);
  }, [scrollContainerRef]);

  useLayoutEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    updateScroll();
    el.addEventListener("scroll", updateScroll, { passive: true });
    return () => el.removeEventListener("scroll", updateScroll);
  }, [scrollContainerRef, updateScroll]);

  return (
    <button
      type="button"
      aria-label={t("common.scrollUpAria")}
      onClick={(e) => {
        e.stopPropagation();
        smoothScrollElementToTop(scrollContainerRef.current);
      }}
      className={[
        "scroll-up-rail-shell-pulse",
        "pointer-events-auto absolute bottom-5 right-4 z-30 flex h-14 w-14 items-center justify-center",
        "sm:bottom-6 sm:right-5",
        "rounded-full border-0 bg-background/80 backdrop-blur-md shadow-elev1",
        "dark:bg-background/75",
        "cursor-pointer select-none transition-[opacity,box-shadow] duration-elev ease-material",
        "hover:text-foreground focus-visible:outline-none focus-visible:shadow-lg",
        visible
          ? "opacity-100"
          : "pointer-events-none opacity-0",
      ].join(" ")}
    >
      <ArrowUp
        className="scroll-up-rail-breathe size-6 shrink-0 text-foreground/90"
        aria-hidden
        strokeWidth={2.4}
      />
    </button>
  );
};

export default ModalScrollUpButton;
