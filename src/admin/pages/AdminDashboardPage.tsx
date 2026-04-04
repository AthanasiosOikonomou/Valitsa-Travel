import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Map, Inbox } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const trips = useQuery({
    queryKey: ["admin-stats-trips"],
    queryFn: async () => {
      const { count, error } = await supabase.from("trips").select("*", { count: "exact", head: true });
      if (error) throw error;
      return count ?? 0;
    },
  });

  const leads = useQuery({
    queryKey: ["admin-stats-inquiries"],
    queryFn: async () => {
      const { count, error } = await supabase.from("inquiries").select("*", { count: "exact", head: true });
      if (error) throw error;
      return count ?? 0;
    },
  });

  return (
    <div className="space-y-8">
      <p className="text-sm text-muted-foreground">{t("admin.dashboardSubtitle")}</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => navigate("/admin/trips")}
          className={cn(
            "rounded-2xl border border-violet-500/20 bg-card text-left shadow-sm transition-all",
            "hover:border-violet-500/45 hover:bg-violet-950/25 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50",
          )}
          aria-label={t("admin.widgetTripsHint")}
        >
          <Card className="border-0 bg-transparent shadow-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-semibold">{t("admin.widgetTrips")}</CardTitle>
              <Map className="h-5 w-5 text-violet-400" aria-hidden />
            </CardHeader>
            <CardContent>
              {trips.isLoading ? (
                <Skeleton className="h-10 w-20" />
              ) : (
                <p className="text-3xl font-bold tabular-nums tracking-tight">{trips.data}</p>
              )}
            </CardContent>
          </Card>
        </button>
        <button
          type="button"
          onClick={() => navigate("/admin/leads")}
          className={cn(
            "rounded-2xl border border-violet-500/20 bg-card text-left shadow-sm transition-all",
            "hover:border-violet-500/45 hover:bg-violet-950/25 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50",
          )}
          aria-label={t("admin.widgetInquiriesHint")}
        >
          <Card className="border-0 bg-transparent shadow-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-semibold">{t("admin.widgetInquiries")}</CardTitle>
              <Inbox className="h-5 w-5 text-violet-400" aria-hidden />
            </CardHeader>
            <CardContent>
              {leads.isLoading ? (
                <Skeleton className="h-10 w-20" />
              ) : (
                <p className="text-3xl font-bold tabular-nums tracking-tight">{leads.data}</p>
              )}
            </CardContent>
          </Card>
        </button>
      </div>
    </div>
  );
}
