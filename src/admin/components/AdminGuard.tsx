import { Navigate, Outlet } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminAuth } from "@/admin/hooks/useAdminAuth";

export function AdminGuard() {
  const { ready, session, isAdmin } = useAdminAuth();

  if (!ready) {
    return (
      <div className="min-h-screen bg-slate-50 p-8 dark:bg-zinc-950">
        <Skeleton className="h-10 w-64 bg-slate-200 dark:bg-zinc-800" />
        <Skeleton className="mt-4 h-96 w-full max-w-4xl bg-slate-200 dark:bg-zinc-800" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/admin/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
