import { useEffect, useMemo, useRef, useState } from "react";

interface CaptchaFieldProps {
  onTokenChange: (token: string) => void;
  error?: string;
}

const TURNSTILE_SCRIPT =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
const RECAPTCHA_SCRIPT =
  "https://www.google.com/recaptcha/api.js?render=explicit";

const NARROW_MQ = "(max-width: 480px)";

function getInitialTurnstileSize(): "compact" | "flexible" {
  if (typeof window === "undefined") return "flexible";
  return window.matchMedia(NARROW_MQ).matches ? "compact" : "flexible";
}

const loadScript = (src: string, id: string) => {
  const existing = document.getElementById(id) as HTMLScriptElement | null;
  if (existing) {
    if (existing.dataset.loaded === "true") return Promise.resolve();
    return new Promise<void>((resolve, reject) => {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener(
        "error",
        () => reject(new Error(`Failed to load ${src}`)),
        { once: true },
      );
    });
  }

  return new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.id = id;
    script.src = src;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      script.dataset.loaded = "true";
      resolve();
    };
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(script);
  });
};

const CaptchaField = ({ onTokenChange, error }: CaptchaFieldProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | number | null>(null);
  const tokenHandlerRef = useRef(onTokenChange);

  const [turnstileSize, setTurnstileSize] = useState<
    "compact" | "flexible"
  >(getInitialTurnstileSize);

  const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY?.trim();
  const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY?.trim();

  const provider = useMemo<"turnstile" | "recaptcha" | null>(() => {
    if (turnstileSiteKey) return "turnstile";
    if (recaptchaSiteKey) return "recaptcha";
    return null;
  }, [recaptchaSiteKey, turnstileSiteKey]);

  useEffect(() => {
    tokenHandlerRef.current = onTokenChange;
  }, [onTokenChange]);

  useEffect(() => {
    const mq = window.matchMedia(NARROW_MQ);
    const onChange = () =>
      setTurnstileSize(mq.matches ? "compact" : "flexible");
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const emitToken = (token: string) => {
    tokenHandlerRef.current(token);
  };

  useEffect(() => {
    emitToken("");

    if (!provider || !containerRef.current) {
      return;
    }

    let isCancelled = false;

    const renderCaptcha = async () => {
      try {
        if (provider === "turnstile") {
          await loadScript(TURNSTILE_SCRIPT, "turnstile-script");
          if (isCancelled || !window.turnstile || !containerRef.current) return;

          widgetIdRef.current = window.turnstile.render(containerRef.current, {
            sitekey: turnstileSiteKey || "",
            callback: (token: string) => emitToken(token),
            "expired-callback": () => emitToken(""),
            "error-callback": () => emitToken(""),
            theme: "auto",
            size: turnstileSize,
          });
          return;
        }

        await loadScript(RECAPTCHA_SCRIPT, "recaptcha-script");
        if (isCancelled || !window.grecaptcha || !containerRef.current) return;

        widgetIdRef.current = window.grecaptcha.render(containerRef.current, {
          sitekey: recaptchaSiteKey || "",
          callback: (token: string) => emitToken(token),
          "expired-callback": () => emitToken(""),
          "error-callback": () => emitToken(""),
          theme: "light",
        });
      } catch {
        emitToken("");
      }
    };

    void renderCaptcha();

    return () => {
      isCancelled = true;
      emitToken("");

      if (provider === "turnstile" && window.turnstile && widgetIdRef.current) {
        window.turnstile.remove(widgetIdRef.current as string);
      }

      if (
        provider === "recaptcha" &&
        window.grecaptcha &&
        widgetIdRef.current !== null
      ) {
        window.grecaptcha.reset(widgetIdRef.current as number);
      }

      widgetIdRef.current = null;
      if (containerRef.current) containerRef.current.innerHTML = "";
    };
  }, [provider, recaptchaSiteKey, turnstileSiteKey, turnstileSize]);

  if (!provider) {
    return (
      <p className="text-xs text-red-500" role="alert">
        CAPTCHA is not configured. Please set a site key.
      </p>
    );
  }

  return (
    <div className="space-y-1 pt-2">
      <div className="flex w-full min-w-0 justify-center overflow-hidden sm:justify-start">
        <div ref={containerRef} className="w-full min-w-0 max-w-full" />
      </div>
      {error ? (
        <p className="text-xs text-red-500" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
};

export default CaptchaField;
