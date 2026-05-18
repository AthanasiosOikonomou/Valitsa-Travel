import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Facebook,
  Link2,
  MessageCircle,
  Send,
  Share2,
} from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  buildPublicTripShareUrl,
  canUseNativeShare,
  formatShareLinkDisplay,
  getTripShareTargets,
  isLocalDevOrigin,
  isMobileShareDevice,
  type TripShareLang,
} from "@/lib/tripShare";
import { cn } from "@/lib/utils";

interface TripShareSectionProps {
  tripId: string;
  tripTitle: string;
  tripImage?: string | null;
  scrollContainerRef?: RefObject<HTMLElement | null>;
  className?: string;
}

const openExternal = (href: string) => {
  window.open(href, "_blank", "noopener,noreferrer");
};

const SCROLL_PADDING_PX = 24;

function scrollSharePanelIntoView(
  scrollContainer: HTMLElement,
  trigger: HTMLElement,
  panel: HTMLElement | null,
) {
  const containerRect = scrollContainer.getBoundingClientRect();
  const target = panel ?? trigger;
  const targetRect = target.getBoundingClientRect();

  if (targetRect.bottom > containerRect.bottom - SCROLL_PADDING_PX) {
    const delta = targetRect.bottom - containerRect.bottom + SCROLL_PADDING_PX;
    scrollContainer.scrollTo({
      top: scrollContainer.scrollTop + delta,
      behavior: "smooth",
    });
    return;
  }

  if (targetRect.top < containerRect.top + SCROLL_PADDING_PX) {
    const delta = targetRect.top - containerRect.top - SCROLL_PADDING_PX;
    scrollContainer.scrollTo({
      top: scrollContainer.scrollTop + delta,
      behavior: "smooth",
    });
  }
}

function TripSharePanel({
  open,
  onClose,
  tripId,
  tripTitle,
  tripImage,
  anchorRef,
  scrollContainerRef,
}: {
  open: boolean;
  onClose: () => void;
  tripId: string;
  tripTitle: string;
  tripImage?: string | null;
  anchorRef: RefObject<HTMLElement | null>;
  scrollContainerRef?: RefObject<HTMLElement | null>;
}) {
  const { t, lang } = useLanguage();
  const panelRef = useRef<HTMLDivElement>(null);
  const shareLang = lang as TripShareLang;
  const isMobile = isMobileShareDevice();

  const targets = getTripShareTargets({
    title: tripTitle,
    tripId,
    lang: shareLang,
  });

  const linkPreview = formatShareLinkDisplay(
    isLocalDevOrigin() ? buildPublicTripShareUrl(tripId) : targets.url,
  );

  const previewImage = tripImage?.trim() || null;

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (panelRef.current?.contains(target)) return;
      if (anchorRef.current?.contains(target)) return;
      onClose();
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose, anchorRef]);

  useEffect(() => {
    if (!open) return;

    const runScroll = () => {
      const container = scrollContainerRef?.current;
      const trigger = anchorRef.current;
      const panel = panelRef.current;
      if (!container || !trigger) return;

      scrollSharePanelIntoView(container, trigger, panel);
      panel?.focus({ preventScroll: true });
    };

    requestAnimationFrame(() => {
      requestAnimationFrame(runScroll);
    });
  }, [open, anchorRef, scrollContainerRef]);

  const handleCopy = async () => {
    const copyUrl = isLocalDevOrigin() ? buildPublicTripShareUrl(tripId) : targets.url;
    if (isLocalDevOrigin()) {
      toast.info(t("detail.shareProductionOnlyPreview"));
    }
    try {
      await navigator.clipboard.writeText(copyUrl);
      toast.success(t("detail.linkCopied"));
      onClose();
    } catch {
      toast.error(t("detail.copyLinkFailed"));
    }
  };

  const handleNativeShare = async () => {
    if (!canUseNativeShare()) return;
    try {
      await navigator.share(targets.native);
      onClose();
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      toast.error(t("detail.shareFailed"));
    }
  };

  const menuItems: Array<{
    key: string;
    label: string;
    icon: typeof Link2;
    onClick: () => void;
    hidden?: boolean;
    disabled?: boolean;
  }> = [
    {
      key: "copy",
      label: t("detail.copyLink"),
      icon: Link2,
      onClick: () => void handleCopy(),
    },
    {
      key: "native",
      label: t("detail.shareNative"),
      icon: Share2,
      onClick: () => void handleNativeShare(),
      hidden: !canUseNativeShare(),
    },
    {
      key: "whatsapp",
      label: t("detail.shareWhatsApp"),
      icon: Send,
      onClick: () => {
        openExternal(targets.whatsapp);
        onClose();
      },
    },
    {
      key: "viber",
      label: t("detail.shareViber"),
      icon: MessageCircle,
      onClick: () => {
        openExternal(targets.viber);
        onClose();
      },
    },
    {
      key: "facebook",
      label: t("detail.shareFacebookPost"),
      icon: Facebook,
      onClick: () => {
        if (isLocalDevOrigin()) {
          toast.info(t("detail.shareFacebookUsesLive"));
        }
        openExternal(targets.facebookPost);
        onClose();
      },
    },
    {
      key: "messenger",
      label: t("detail.shareMessenger"),
      icon: MessageCircle,
      onClick: () => {
        openExternal(targets.messenger);
        onClose();
      },
      hidden: !isMobile,
    },
  ];

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          ref={panelRef}
          role="dialog"
          tabIndex={-1}
          aria-label={t("detail.sharePanelTitle")}
          initial={{ opacity: 0, y: 8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.98 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="absolute left-0 right-0 top-[calc(100%+0.75rem)] z-[70] overflow-hidden rounded-2xl border border-border/80 bg-background shadow-xl outline-none"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="border-b border-border/70 bg-muted/30 p-4">
            <p className="label-ui mb-3 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-foreground-muted">
              {t("detail.sharePanelTitle")}
            </p>
            <div className="flex gap-3">
              {previewImage ? (
                <img
                  src={previewImage}
                  alt=""
                  className="h-20 w-28 shrink-0 rounded-xl object-cover"
                />
              ) : (
                <div className="flex h-20 w-28 shrink-0 items-center justify-center rounded-xl bg-muted text-foreground-muted">
                  <Share2 size={24} aria-hidden />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-base font-semibold leading-snug text-foreground">
                  {tripTitle}
                </p>
                <p className="mt-2 text-xs text-foreground-muted">
                  {t("detail.shareLinkPreview")}:{" "}
                  <span className="break-all font-medium text-primary">{linkPreview}</span>
                </p>
              </div>
            </div>
          </div>

          <div className="max-h-[min(50vh,20rem)] overflow-y-auto p-2">
            {!isMobile ? (
              <p className="px-3 py-2 text-xs leading-relaxed text-foreground-muted">
                {t("detail.shareMessengerDesktopHint")}
              </p>
            ) : null}
            {menuItems
              .filter((item) => !item.hidden)
              .map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.key}
                    type="button"
                    disabled={item.disabled}
                    onClick={(e) => {
                      e.stopPropagation();
                      item.onClick();
                    }}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-xl px-3 py-3 text-left text-sm font-medium transition-colors",
                      item.disabled
                        ? "cursor-not-allowed opacity-50"
                        : "text-foreground hover:bg-muted/80",
                    )}
                  >
                    <Icon size={18} className="shrink-0 text-primary" aria-hidden />
                    <span className="min-w-0 flex-1">{item.label}</span>
                  </button>
                );
              })}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

/** Prominent share CTA + cloud panel for trip detail (under tags). */
export function TripShareSection({
  tripId,
  tripTitle,
  tripImage,
  scrollContainerRef,
  className,
}: TripShareSectionProps) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpen(false), []);

  return (
    <div ref={triggerRef} className={cn("relative mb-8", className)}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((prev) => !prev);
        }}
        className="premium-outline-button flex min-h-[3rem] w-full items-center justify-center gap-2.5 rounded-2xl px-5 py-3.5 text-base font-semibold"
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <Share2 size={20} className="shrink-0 text-primary" aria-hidden />
        {t("detail.shareWithFriend")}
      </button>

      <TripSharePanel
        open={open}
        onClose={close}
        tripId={tripId}
        tripTitle={tripTitle}
        tripImage={tripImage}
        anchorRef={triggerRef}
        scrollContainerRef={scrollContainerRef}
      />
    </div>
  );
}
