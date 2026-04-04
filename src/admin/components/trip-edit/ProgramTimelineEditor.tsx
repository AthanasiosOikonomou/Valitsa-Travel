import { Plus, Trash2 } from "lucide-react";
import type { ProgramFormStep } from "@/lib/tripAdminForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type Props = {
  value: ProgramFormStep[];
  onChange: (next: ProgramFormStep[]) => void;
  disabled?: boolean;
  addDayLabel: string;
  daysFieldLabel: string;
  daysPlaceholder?: string;
  dayTitleLabel: string;
  dayDescriptionLabel: string;
  removeDayAriaLabel: string;
  className?: string;
};

export function ProgramTimelineEditor({
  value,
  onChange,
  disabled,
  addDayLabel,
  daysFieldLabel,
  daysPlaceholder,
  dayTitleLabel,
  dayDescriptionLabel,
  removeDayAriaLabel,
  className,
}: Props) {
  const updateAt = (index: number, patch: Partial<ProgramFormStep>) => {
    const next = value.map((row, i) => (i === index ? { ...row, ...patch } : row));
    onChange(next);
  };

  const removeAt = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const addDay = () => {
    const nextDays = value.length === 0 ? "1" : String(value.length + 1);
    onChange([...value, { days: nextDays, title: "", description: "" }]);
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div className="space-y-4">
        {value.map((row, index) => (
          <div
            key={`prog-row-${index}`}
            className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-zinc-900/50"
          >
            <div className="mb-3 flex flex-wrap items-end gap-3">
              <div className="w-28 space-y-1.5 sm:w-32">
                <Label className="text-xs">{daysFieldLabel}</Label>
                <Input
                  disabled={disabled}
                  placeholder={daysPlaceholder}
                  value={row.days}
                  onChange={(e) => updateAt(index, { days: e.target.value })}
                  autoComplete="off"
                />
              </div>
              <div className="min-w-0 flex-1 space-y-1.5">
                <Label className="text-xs">{dayTitleLabel}</Label>
                <Input
                  disabled={disabled}
                  value={row.title}
                  onChange={(e) => updateAt(index, { title: e.target.value })}
                  autoComplete="off"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="shrink-0 border-slate-200 dark:border-white/15"
                disabled={disabled}
                onClick={() => removeAt(index)}
                aria-label={removeDayAriaLabel}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">{dayDescriptionLabel}</Label>
              <textarea
                disabled={disabled}
                value={row.description}
                onChange={(e) => updateAt(index, { description: e.target.value })}
                rows={4}
                className="w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:border-white/10 dark:bg-zinc-950 dark:text-zinc-100"
              />
            </div>
          </div>
        ))}
      </div>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        className="border border-slate-200 dark:border-white/10"
        disabled={disabled}
        onClick={addDay}
      >
        <Plus className="h-4 w-4" />
        {addDayLabel}
      </Button>
    </div>
  );
}
