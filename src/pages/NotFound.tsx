import { Link, useLocation } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import Seo from "@/components/Seo";

const NotFound = () => {
  const location = useLocation();
  const { t, lang } = useLanguage();

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <Seo
        title={lang === "gr" ? "Σελίδα Δεν Βρέθηκε" : "Page Not Found"}
        description={
          lang === "gr"
            ? "Η σελίδα που αναζητάτε δεν βρέθηκε."
            : "The page you are looking for could not be found."
        }
        path={location.pathname}
        noindex
        lang={lang}
      />
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">
          {t("notFound.message")}
        </p>
        <Link to="/" className="text-primary underline hover:text-primary/90">
          {t("notFound.backHome")}
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
