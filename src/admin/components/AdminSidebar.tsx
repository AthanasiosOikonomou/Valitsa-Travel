import { NavLink } from "react-router-dom";
import { LayoutDashboard, Map, Inbox, Settings, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/trips", label: "Trips", icon: Map },
  { to: "/admin/leads", label: "Leads", icon: Inbox },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminSidebar() {
  return (
    <aside className="flex h-full w-64 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      <div className="flex items-center gap-2 border-b border-sidebar-border px-5 py-5">
        <Sparkles className="h-6 w-6 text-sidebar-primary" />
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Valitsa</p>
          <p className="text-sm font-semibold">Admin</p>
        </div>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-3">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60",
              )
            }
          >
            <Icon className="h-4 w-4 opacity-80" />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
