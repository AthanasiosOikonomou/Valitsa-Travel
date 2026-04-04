import { NavLink } from "react-router-dom";
import { LayoutDashboard, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

export function AdminSidebar() {
  const { t } = useLanguage();
  return (
    <aside className="flex h-full w-56 flex-col border-r border-slate-200 bg-white text-slate-900 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-100">
      <div className="flex items-center gap-2 border-b border-slate-200 px-5 py-5 dark:border-white/10">
        <Sparkles className="h-6 w-6 shrink-0 text-primary" aria-hidden />
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-slate-500 dark:text-zinc-400">
            Valitsa
          </p>
          <p className="text-sm font-semibold">Admin</p>
        </div>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-3">
        <NavLink
          to="/admin/dashboard"
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              isActive
                ? "border border-primary/35 bg-primary/10 text-slate-900 dark:text-zinc-100"
                : "text-slate-600 hover:bg-slate-100 dark:text-zinc-300 dark:hover:bg-white/5",
            )
          }
        >
          <LayoutDashboard className="h-4 w-4 opacity-80" />
          {t("admin.dashboardTitle")}
        </NavLink>
      </nav>
    </aside>
  );
}
