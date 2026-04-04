import { forwardRef } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  TRANSPORT_MODE_SLUGS,
  transportLabelForSlug,
  type TransportModeSlug,
} from "@/lib/tripTransportModes";

type Lang = "en" | "gr";

type Props = {
  value: TransportModeSlug[];
  onChange: (next: TransportModeSlug[]) => void;
  lang: Lang;
  disabled?: boolean;
  placeholder: string;
  menuLabel: string;
  id?: string;
  className?: string;
  "aria-invalid"?: boolean;
};

function toggleSlug(list: TransportModeSlug[], slug: TransportModeSlug): TransportModeSlug[] {
  if (list.includes(slug)) return list.filter((s) => s !== slug);
  return [...list, slug];
}

export const TransportMultiSelect = forwardRef<HTMLButtonElement, Props>(function TransportMultiSelect(
  {
    value,
    onChange,
    lang,
    disabled,
    placeholder,
    menuLabel,
    id,
    className,
    "aria-invalid": ariaInvalid,
  },
  ref,
) {
  const summary =
    value.length === 0
      ? placeholder
      : value.map((s) => transportLabelForSlug(s, lang)).join(", ");

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Button
          ref={ref}
          type="button"
          variant="outline"
          id={id}
          disabled={disabled}
          aria-invalid={ariaInvalid}
          className={cn(
            "h-auto min-h-11 w-full justify-between gap-2 whitespace-normal rounded-xl border-slate-200 px-3 py-2 text-left text-base font-normal md:text-sm dark:border-white/10",
            value.length === 0 && "text-slate-500 dark:text-zinc-500",
            ariaInvalid && "border-destructive/60 ring-2 ring-destructive/30",
            className,
          )}
        >
          <span className="line-clamp-2 flex-1">{summary}</span>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-60" aria-hidden />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="z-[110] min-w-[var(--radix-dropdown-menu-trigger-width)] rounded-xl border border-slate-200 bg-white p-1 shadow-lg dark:border-white/10 dark:bg-zinc-900"
          sideOffset={4}
          align="start"
          aria-label={menuLabel}
        >
          <div className="px-2 py-1.5 text-xs font-medium text-slate-500 dark:text-zinc-400">
            {menuLabel}
          </div>
          {TRANSPORT_MODE_SLUGS.map((slug) => {
            const checked = value.includes(slug);
            return (
              <DropdownMenu.CheckboxItem
                key={slug}
                className="flex min-h-11 cursor-pointer select-none items-center gap-2 rounded-lg px-3 py-2 text-base text-slate-900 outline-none data-[highlighted]:bg-slate-100 md:text-sm dark:text-zinc-100 dark:data-[highlighted]:bg-zinc-800"
                checked={checked}
                onSelect={(e) => e.preventDefault()}
                onCheckedChange={() => onChange(toggleSlug(value, slug))}
              >
                <span
                  className={cn(
                    "flex h-4 w-4 shrink-0 items-center justify-center rounded border border-slate-300 dark:border-white/20",
                    checked && "border-primary bg-primary text-primary-foreground",
                  )}
                  aria-hidden
                >
                  {checked ? "✓" : ""}
                </span>
                {transportLabelForSlug(slug, lang)}
              </DropdownMenu.CheckboxItem>
            );
          })}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
});
