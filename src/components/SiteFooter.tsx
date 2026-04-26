import { useLanguage } from "@/contexts/LanguageContext";
import { brandAssetUrl } from "@/lib/brandAssetUrl";

const DEV_LINK = "https://www.linkedin.com/in/ath-oik";

interface SiteFooterProps {
  darkMode: boolean;
  onTermsClick: () => void;
}

export function SiteFooter({ darkMode, onTermsClick }: SiteFooterProps) {
  const { t } = useLanguage();

  return (
    <footer className="border-t border-border/70 px-6 py-16 md:px-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <div className="premium-panel flex flex-col items-center justify-between gap-6 rounded-[1.8rem] px-6 py-8 md:flex-row md:px-8">
          <img
            src={
              darkMode
                ? brandAssetUrl("/branding/navbar/logo-dark.svg")
                : brandAssetUrl("/branding/navbar/logo-light.svg")
            }
            alt={t("nav.brand")}
            className="h-8 w-auto"
            width={378}
            height={60}
            loading="lazy"
            decoding="async"
          />
          <div className="flex items-center gap-6">
            <a
              href="#"
              onClick={(event) => {
                event.preventDefault();
                onTermsClick();
              }}
              className="text-sm text-foreground-muted transition-colors hover:text-foreground"
            >
              {t("nav.terms")}
            </a>
            <p className="text-sm text-foreground-muted">{t("footer.rights")}</p>
          </div>
        </div>

        <p className="text-center text-xs leading-relaxed text-foreground-muted">
          {t("footer.devCreditPrefix")}
          <a
            href={DEV_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-foreground-muted underline-offset-2 transition-colors hover:text-primary hover:underline"
          >
            {t("footer.devName")}
          </a>
        </p>
      </div>
    </footer>
  );
}
