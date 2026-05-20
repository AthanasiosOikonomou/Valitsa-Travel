import { Link } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";

export function AdminSessionExpiredBanner() {
  const { t } = useLanguage();

  return (
    <div
      role="alert"
      className="sticky top-0 z-50 border-b border-amber-300/80 bg-amber-50 px-4 py-3 text-amber-950 dark:border-amber-700/50 dark:bg-amber-950/90 dark:text-amber-50"
    >
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-start gap-2">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
          <p className="text-sm font-medium leading-snug">
            {t("admin.sessionExpiredEditingBanner")}
          </p>
        </div>
        <Button asChild size="sm" variant="outline" className="shrink-0">
          <Link to="/admin/login">{t("admin.sessionExpiredSignInAgain")}</Link>
        </Button>
      </div>
    </div>
  );
}
