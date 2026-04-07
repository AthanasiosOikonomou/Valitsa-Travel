/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Optional Node origin for seasonal-config admin API only (no trailing slash), e.g. https://api.example.com */
  readonly VITE_SEASONAL_ADMIN_API_ORIGIN?: string;
  readonly VITE_MAIL_API_URL?: string;
  readonly VITE_TURNSTILE_SITE_KEY?: string;
  readonly VITE_RECAPTCHA_SITE_KEY?: string;
  readonly VITE_SHOW_TRIPS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface Window {
  turnstile?: {
    render: (
      container: HTMLElement,
      options: {
        sitekey: string;
        callback?: (token: string) => void;
        "expired-callback"?: () => void;
        "error-callback"?: () => void;
        theme?: "auto" | "light" | "dark";
        size?: "normal" | "flexible" | "compact";
      },
    ) => string;
    remove: (widgetId: string) => void;
  };
  grecaptcha?: {
    render: (
      container: HTMLElement,
      options: {
        sitekey: string;
        callback?: (token: string) => void;
        "expired-callback"?: () => void;
        "error-callback"?: () => void;
        theme?: "light" | "dark";
      },
    ) => number;
    reset: (widgetId?: number) => void;
  };
}
