import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { isValidDayForMonth } from "@/lib/departureWindows";

/** Day-of-month chips for departure windows (no react-hook-form; use in modal draft or wire with Controller). */
export function DepartureDayPickerPure({
  month,
  days,
  onDaysChange,
  daysPickLabel,
  allowedDays,
  readOnly,
}: {
  month: number;
  days: number[];
  onDaysChange: (next: number[]) => void;
  daysPickLabel: string;
  /** If set, only these day numbers are selectable (others show disabled). */
  allowedDays?: number[];
  /** When true, selection cannot be changed (e.g. pricing tied to a fixed departure pattern). */
  readOnly?: boolean;
}) {
  const value = Array.isArray(days) ? days : [];
  return (
    <div className="space-y-2 sm:col-span-2">
      <Label>{daysPickLabel}</Label>
      <div className={cn("flex flex-wrap gap-1.5", readOnly && "pointer-events-none")}>
        {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => {
          const allowed =
            allowedDays == null || allowedDays.length === 0 ? null : new Set(allowedDays);
          const outOfAllowlist = allowed != null && !allowed.has(day);
          const disabled =
            !readOnly && (!isValidDayForMonth(month, day) || outOfAllowlist);
          const selected = value.includes(day);
          return (
            <button
              key={day}
              type="button"
              disabled={disabled}
              className={cn(
                "min-h-9 min-w-9 rounded-md border text-xs font-medium transition-colors",
                disabled && "cursor-not-allowed opacity-25",
                selected
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background hover:bg-muted",
              )}
              onClick={() => {
                if (readOnly || disabled) return;
                const next = new Set(value);
                if (next.has(day)) next.delete(day);
                else next.add(day);
                onDaysChange([...next].sort((a, b) => a - b));
              }}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
