/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MAIL_API_URL?: string;
  readonly VITE_TURNSTILE_SITE_KEY?: string;
  readonly VITE_RECAPTCHA_SITE_KEY?: string;
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
