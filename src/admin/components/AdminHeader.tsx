import { useLocation, useNavigate } from "react-router-dom";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, LogOut, Menu, Moon, Sun, User } from "lucide-react";
import { useTheme } from "next-themes";
import { supabase } from "@/lib/supabaseClient";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAdminAuth } from "@/admin/hooks/useAdminAuth";
import { useResolvedDarkMode } from "@/hooks/useResolvedDarkMode";
import { cn } from "@/lib/utils";

function pageTitleKey(pathname: string): string {
  if (pathname.includes("/admin/trips")) return "admin.tripsTitle";
  if (pathname.includes("/admin/leads")) return "admin.leadsTitle";
  return "admin.dashboardTitle";
}

export function AdminHeader({ onMobileNavOpen }: { onMobileNavOpen?: () => void }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { t, lang, setLang } = useLanguage();
  const { user } = useAdminAuth();
  const { setTheme } = useTheme();
  const darkMode = useResolvedDarkMode();
  const titleKey = pageTitleKey(pathname);
  const email = user?.email ?? "";

  async function signOut() {
    await supabase.auth.signOut();
    navigate("/admin/login", { replace: true });
  }

  function toggleTheme() {
    setTheme(darkMode ? "light" : "dark");
  }

  const shellBtn =
    "rounded-xl border border-slate-200 bg-white/90 text-slate-700 shadow-sm backdrop-blur-sm transition-colors hover:border-slate-300 hover:bg-white dark:border-white/10 dark:bg-zinc-900/90 dark:text-zinc-200 dark:hover:border-white/15 dark:hover:bg-zinc-900";

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/85 text-slate-900 backdrop-blur-md dark:border-white/10 dark:bg-zinc-950/85 dark:text-zinc-100">
      <div className="mx-auto flex min-h-14 w-full max-w-6xl items-center justify-between gap-2 px-4 py-2 sm:gap-4 sm:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
          {onMobileNavOpen ? (
            <button
              type="button"
              onClick={onMobileNavOpen}
              className={cn(
                shellBtn,
                "inline-flex shrink-0 md:hidden items-center justify-center rounded-xl min-h-11 min-w-11 p-0",
              )}
              aria-label={t("admin.openMenu")}
            >
              <Menu className="h-5 w-5 text-primary" aria-hidden />
            </button>
          ) : null}
          <h1 className="truncate text-lg font-semibold tracking-tight text-slate-900 dark:text-zinc-100">
            {t(titleKey)}
          </h1>
        </div>
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <div
            className="flex rounded-xl border border-slate-200 bg-white/90 p-0.5 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-zinc-900/90"
            role="group"
            aria-label={t("admin.language")}
          >
            <button
              type="button"
              onClick={() => setLang("gr")}
              className={cn(
                "inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg px-2.5 text-xs font-medium transition-colors sm:min-h-0 sm:min-w-0 sm:py-1",
                lang === "gr"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100",
              )}
            >
              EL
            </button>
            <button
              type="button"
              onClick={() => setLang("en")}
              className={cn(
                "inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg px-2.5 text-xs font-medium transition-colors sm:min-h-0 sm:min-w-0 sm:py-1",
                lang === "en"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100",
              )}
            >
              EN
            </button>
          </div>
          <button
            type="button"
            onClick={toggleTheme}
            className={cn(shellBtn, "relative isolate grid min-h-11 min-w-11 place-items-center overflow-hidden p-0 sm:h-10 sm:w-10")}
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
                  <Sun className="h-[18px] w-[18px] text-primary" aria-hidden />
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
                  <Moon className="h-[18px] w-[18px] text-primary" aria-hidden />
                </motion.span>
              )}
            </AnimatePresence>
          </button>
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button
                type="button"
                className={cn(
                  "flex max-w-[200px] min-h-11 items-center gap-2 rounded-xl px-3 py-2 text-left text-sm transition-colors",
                  shellBtn,
                )}
              >
                <User className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                <span className="min-w-0 flex-1 truncate text-xs">{email || "—"}</span>
                <ChevronDown className="h-4 w-4 shrink-0 opacity-60" aria-hidden />
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                className="z-[200] min-w-[200px] rounded-xl border border-slate-200 bg-white p-1 text-slate-900 shadow-elev3 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-100"
                sideOffset={6}
                align="end"
              >
                <DropdownMenu.Item
                  className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm outline-none data-[highlighted]:bg-red-500/10 data-[highlighted]:text-red-600 dark:data-[highlighted]:text-red-400"
                  onSelect={(e) => {
                    e.preventDefault();
                    void signOut();
                  }}
                >
                  <LogOut className="h-4 w-4" />
                  {t("admin.signOut")}
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
      </div>
    </header>
  );
}
