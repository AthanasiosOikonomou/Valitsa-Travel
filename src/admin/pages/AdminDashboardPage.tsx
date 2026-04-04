import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminDashboardPage() {
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
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Overview of your travel catalog and leads.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Trips</CardTitle>
          </CardHeader>
          <CardContent>
            {trips.isLoading ? <Skeleton className="h-10 w-20" /> : <p className="text-3xl font-bold tabular-nums">{trips.data}</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Inquiries</CardTitle>
          </CardHeader>
          <CardContent>
            {leads.isLoading ? <Skeleton className="h-10 w-20" /> : <p className="text-3xl font-bold tabular-nums">{leads.data}</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
