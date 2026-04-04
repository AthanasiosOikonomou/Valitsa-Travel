import { Plus, Trash2 } from "lucide-react";
import type { ProgramFormStep } from "@/lib/tripAdminForm";
import { RichTextEditor } from "@/admin/components/RichTextEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type Props = {
  value: ProgramFormStep[];
  onChange: (next: ProgramFormStep[]) => void;
  disabled?: boolean;
  t: (key: string) => string;
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
  t,
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
            <div className="mb-3 md:hidden">
              <div className="flex items-end gap-2">
                <div className="min-w-0 flex-1 space-y-1.5">
                  <Label className="text-xs">{daysFieldLabel}</Label>
                  <Input
                    disabled={disabled}
                    placeholder={daysPlaceholder}
                    value={row.days}
                    onChange={(e) => updateAt(index, { days: e.target.value })}
                    autoComplete="off"
                    className="min-h-11 text-base"
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-11 w-11 shrink-0 border-slate-200 dark:border-white/15"
                  disabled={disabled}
                  onClick={() => removeAt(index)}
                  aria-label={removeDayAriaLabel}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="mt-3 space-y-1.5">
                <Label className="text-xs">{dayTitleLabel}</Label>
                <Input
                  disabled={disabled}
                  value={row.title}
                  onChange={(e) => updateAt(index, { title: e.target.value })}
                  autoComplete="off"
                  className="min-h-11 text-base"
                />
              </div>
            </div>
            <div className="mb-3 hidden items-end gap-3 md:flex">
              <div className="w-40 shrink-0 space-y-1.5">
                <Label className="text-xs">{daysFieldLabel}</Label>
                <Input
                  disabled={disabled}
                  placeholder={daysPlaceholder}
                  value={row.days}
                  onChange={(e) => updateAt(index, { days: e.target.value })}
                  autoComplete="off"
                  className="min-h-11 text-base md:text-sm"
                />
              </div>
              <div className="min-w-0 flex-1 space-y-1.5">
                <Label className="text-xs">{dayTitleLabel}</Label>
                <Input
                  disabled={disabled}
                  value={row.title}
                  onChange={(e) => updateAt(index, { title: e.target.value })}
                  autoComplete="off"
                  className="min-h-11 text-base md:text-sm"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-11 w-11 shrink-0 border-slate-200 dark:border-white/15"
                disabled={disabled}
                onClick={() => removeAt(index)}
                aria-label={removeDayAriaLabel}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">{dayDescriptionLabel}</Label>
              <RichTextEditor
                value={row.description}
                onChange={(html) => updateAt(index, { description: html })}
                t={t}
                disabled={disabled}
              />
            </div>
          </div>
        ))}
      </div>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        className="min-h-11 border border-slate-200 px-4 dark:border-white/10"
        disabled={disabled}
        onClick={addDay}
      >
        <Plus className="h-4 w-4" />
        {addDayLabel}
      </Button>
    </div>
  );
}
