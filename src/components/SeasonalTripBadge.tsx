import { useQuery } from "@tanstack/react-query";
import { fetchSeasonalNavItems } from "@/lib/seasonalNavApi";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

type Props = {
  /** `seasonal_configs.seasonal_key` / `trips.seasonal_name` */
  seasonKey: string | null | undefined;
  className?: string;
};

/**
 * Diagonal ribbon in the top-right corner; label from cached `GET /api/seasonal-nav` (same query as Navbar).
 */
export function SeasonalTripBadge({ seasonKey, className }: Props) {
  const { lang, t } = useLanguage();
  const key = seasonKey != null ? String(seasonKey).trim() : "";
  if (!key) return null;

  const { data: items = [] } = useQuery({
    queryKey: ["seasonal-nav"],
    queryFn: fetchSeasonalNavItems,
    staleTime: 5 * 60 * 1000,
  });

  const match = items.find((i) => i.key === key);
  const label =
    match != null
      ? lang === "gr"
        ? match.label_el
        : match.label_en
      : t("card.seasonalFallback");

  return (
    <div
      className={cn(
        "pointer-events-none absolute right-0 top-0 z-20 overflow-hidden",
        "h-[6.5rem] w-[6.5rem] sm:h-[7.5rem] sm:w-[7.5rem]",
        className,
      )}
      data-nosnippet
    >
      {/* Classic 45° corner ribbon: strip sits on the diagonal from top-right */}
      <div
        className={cn(
          "absolute top-[1.35rem] right-[-2.15rem] w-[11rem] rotate-45 sm:top-[1.5rem] sm:right-[-2.25rem]",
          "animate-[pulse_4s_ease-in-out_infinite]",
          "rounded-sm bg-gradient-to-br from-purple-500 via-fuchsia-500/90 to-purple-600 p-[1px]",
          "shadow-[0_0_20px_-4px_rgba(168,85,247,0.45)]",
        )}
      >
        <div
          className={cn(
            "rounded-[3px] border border-white/10 bg-slate-950/60 px-3 py-1.5 text-center backdrop-blur-md",
            "text-[11px] font-semibold leading-tight sm:text-xs",
            "text-cyan-300 [text-shadow:0_0_12px_rgba(34,211,238,0.55),0_0_24px_rgba(34,211,238,0.25)]",
          )}
        >
          <span className="line-clamp-2 break-words">{label}</span>
        </div>
      </div>
    </div>
  );
}
