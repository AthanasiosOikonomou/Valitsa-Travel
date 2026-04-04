import { NavLink } from "react-router-dom";
import { LayoutDashboard, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

export function AdminSidebar() {
  const { t } = useLanguage();
  return (
    <aside className="flex h-full w-56 flex-col border-r border-violet-500/15 bg-sidebar text-sidebar-foreground">
      <div className="flex items-center gap-2 border-b border-violet-500/15 px-5 py-5">
        <Sparkles className="h-6 w-6 text-violet-400" />
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Valitsa</p>
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
                ? "border border-violet-500/30 bg-violet-950/40 text-sidebar-accent-foreground"
                : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60",
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
