import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import { useNavigate } from "react-router-dom";

export default function AdminSettingsPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">Session and account.</p>
      </div>
      <Button
        variant="outline"
        onClick={async () => {
          await supabase.auth.signOut();
          navigate("/admin/login", { replace: true });
        }}
      >
        Sign out
      </Button>
    </div>
  );
}
