import { useLanguage } from "@/contexts/LanguageContext";
import { brandAssetUrl } from "@/lib/brandAssetUrl";
import { Globe, Mail, Phone, Smartphone } from "lucide-react";

const DEV_LINK = "https://www.linkedin.com/in/ath-oik";

interface SiteFooterProps {
  darkMode: boolean;
  onTermsClick: () => void;
  onAboutClick: () => void;
  onPaymentClick: () => void;
}

const footerLinkClass =
  "text-sm font-medium text-foreground-muted underline decoration-transparent underline-offset-4 transition-colors duration-200 hover:text-foreground hover:decoration-current";

function FooterLegalLink({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <a
      href="#"
      onClick={(event) => {
        event.preventDefault();
        onClick();
      }}
      className={footerLinkClass}
    >
      {label}
    </a>
  );
}

function FooterLegalDivider() {
  return (
    <span
      aria-hidden
      className="select-none text-sm text-foreground-muted/35"
    >
      |
    </span>
  );
}

export function SiteFooter({
  darkMode,
  onTermsClick,
  onAboutClick,
  onPaymentClick,
}: SiteFooterProps) {
  const { t } = useLanguage();
  const footerIconClass = darkMode ? "text-primary" : "text-black";
  const footerIconChipClass = darkMode ? "bg-primary/20" : "bg-black/10";
  const contactLinkClass =
    "flex items-center gap-3 rounded-xl py-1.5 text-sm text-foreground-muted transition-colors duration-200 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40";
  const contactTextClass = "break-words leading-snug";

  return (
    <footer className="border-t border-border/70 px-4 py-10 sm:px-6 md:px-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <div className="premium-panel rounded-[1.8rem] px-5 py-6 ring-1 ring-black/5 sm:px-6 md:px-8 dark:ring-white/10">
          <div className="grid gap-y-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] md:items-start md:gap-x-8">
            <div className="flex flex-col items-center gap-2 md:items-start">
              <img
                src={
                  darkMode
                    ? brandAssetUrl("/branding/navbar/logo-dark.svg")
                    : brandAssetUrl("/branding/navbar/logo-light.svg")
                }
                alt={t("nav.brand")}
                className="h-8 w-auto self-center md:self-start"
                width={378}
                height={60}
                loading="lazy"
                decoding="async"
              />
            </div>

            <div className="grid w-full gap-x-6 gap-y-3 sm:grid-cols-2 sm:gap-y-4 md:justify-self-end md:max-w-[35rem]">
              <a
                href="tel:+302102606248"
                className={contactLinkClass}
              >
                <span
                  className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${footerIconChipClass} ${footerIconClass}`}
                >
                  <Phone className="h-4 w-4" aria-hidden />
                </span>
                <span className={contactTextClass}>+30 210 260 6248</span>
              </a>

              <a
                href="tel:+306937454193"
                className={contactLinkClass}
              >
                <span
                  className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${footerIconChipClass} ${footerIconClass}`}
                >
                  <Smartphone className="h-4 w-4" aria-hidden />
                </span>
                <span className={contactTextClass}>
                  +30 693 745 4193 <wbr />
                  <span className="whitespace-nowrap">(Viber, WhatsApp)</span>
                </span>
              </a>

              <a
                href="mailto:sales@valitsatravel.gr"
                className={contactLinkClass}
              >
                <span
                  className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${footerIconChipClass} ${footerIconClass}`}
                >
                  <Mail className="h-4 w-4" aria-hidden />
                </span>
                <span className={contactTextClass}>sales@valitsatravel.gr</span>
              </a>

              <a
                href="https://valitsatravel.gr"
                target="_blank"
                rel="noopener noreferrer"
                className={contactLinkClass}
              >
                <span
                  className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${footerIconChipClass} ${footerIconClass}`}
                >
                  <Globe className="h-4 w-4" aria-hidden />
                </span>
                <span className={contactTextClass}>valitsatravel.gr</span>
              </a>
            </div>
          </div>
          <div className="mt-4 flex flex-col gap-3 border-t border-border/50 pt-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <nav
              aria-label={t("footer.legalNav")}
              className="flex flex-wrap items-center gap-x-2 gap-y-2"
            >
              <FooterLegalLink
                label={t("nav.about")}
                onClick={onAboutClick}
              />
              <FooterLegalDivider />
              <FooterLegalLink
                label={t("nav.payments")}
                onClick={onPaymentClick}
              />
              <FooterLegalDivider />
              <FooterLegalLink
                label={t("nav.terms")}
                onClick={onTermsClick}
              />
            </nav>
            <p className="text-right text-xs leading-snug text-foreground-muted/70 sm:shrink-0 sm:text-sm">
              {t("footer.rights")}
            </p>
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
