import { Navigate, Outlet } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminAuth } from "@/admin/hooks/useAdminAuth";

export function AdminGuard() {
  const { ready, session, isAdmin } = useAdminAuth();

  if (!ready) {
    return (
      <div className="min-h-screen bg-background p-8">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="mt-4 h-96 w-full max-w-4xl" />
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
