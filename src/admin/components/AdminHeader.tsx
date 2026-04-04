import { useLocation, useNavigate } from "react-router-dom";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ChevronDown, LogOut, User } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAdminAuth } from "@/admin/hooks/useAdminAuth";
import { cn } from "@/lib/utils";

function pageTitleKey(pathname: string): string {
  if (pathname.includes("/admin/trips")) return "admin.tripsTitle";
  if (pathname.includes("/admin/leads")) return "admin.leadsTitle";
  return "admin.dashboardTitle";
}

export function AdminHeader() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { t, lang, setLang } = useLanguage();
  const { user } = useAdminAuth();
  const titleKey = pageTitleKey(pathname);
  const email = user?.email ?? "";

  async function signOut() {
    await supabase.auth.signOut();
    navigate("/admin/login", { replace: true });
  }

  return (
    <header className="sticky top-0 z-40 border-b border-violet-500/15 bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-4 px-6">
        <h1 className="truncate text-lg font-semibold tracking-tight text-foreground">
          {t(titleKey)}
        </h1>
        <div className="flex shrink-0 items-center gap-2">
          <div
            className="flex rounded-xl border border-violet-500/25 bg-violet-950/20 p-0.5"
            role="group"
            aria-label={t("admin.language")}
          >
            <button
              type="button"
              onClick={() => setLang("gr")}
              className={cn(
                "rounded-lg px-2.5 py-1 text-xs font-medium transition-colors",
                lang === "gr"
                  ? "bg-violet-600 text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              EL
            </button>
            <button
              type="button"
              onClick={() => setLang("en")}
              className={cn(
                "rounded-lg px-2.5 py-1 text-xs font-medium transition-colors",
                lang === "en"
                  ? "bg-violet-600 text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              EN
            </button>
          </div>
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button
                type="button"
                className="flex max-w-[200px] items-center gap-2 rounded-xl border border-violet-500/25 bg-card px-3 py-2 text-left text-sm text-foreground transition-colors hover:border-violet-500/40 hover:bg-muted/30"
              >
                <User className="h-4 w-4 shrink-0 text-violet-400" aria-hidden />
                <span className="min-w-0 flex-1 truncate text-xs">{email || "—"}</span>
                <ChevronDown className="h-4 w-4 shrink-0 opacity-60" aria-hidden />
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                className="z-[200] min-w-[200px] rounded-xl border border-violet-500/20 bg-popover p-1 text-popover-foreground shadow-elev3"
                sideOffset={6}
                align="end"
              >
                <DropdownMenu.Item
                  className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm outline-none data-[highlighted]:bg-destructive/15 data-[highlighted]:text-destructive"
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
