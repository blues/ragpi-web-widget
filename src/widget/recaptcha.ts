// Lazy loader for Google reCAPTCHA v3. The api.js script adds ~800ms of
// main-thread work, so we defer injecting it until the user actually opens the
// chat panel instead of loading it on every page that embeds the widget.

declare global {
  interface Window {
    grecaptcha: {
      ready: (callback: () => void) => void;
      execute: (
        siteKey: string,
        options: { action: string }
      ) => Promise<string>;
    };
  }
}

let loadPromise: Promise<void> | null = null;

/**
 * Inject the reCAPTCHA v3 script. Idempotent: the script is appended at most
 * once and repeated calls return the same in-flight/resolved promise. Resolves
 * once the script has loaded and grecaptcha.ready() has fired, so callers can
 * safely execute() afterwards. If the host page already provides grecaptcha,
 * no script is injected.
 */
export const loadRecaptcha = (siteKey: string): Promise<void> => {
  if (loadPromise) return loadPromise;

  loadPromise = new Promise<void>((resolve, reject) => {
    if (window.grecaptcha) {
      window.grecaptcha.ready(() => resolve());
      return;
    }

    const script = document.createElement("script");
    script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      window.grecaptcha.ready(() => resolve());
    };
    script.onerror = () => {
      // Allow a later attempt (e.g. on send) to retry the injection.
      loadPromise = null;
      reject(new Error("Failed to load reCAPTCHA script"));
    };
    document.head.appendChild(script);
  });

  return loadPromise;
};

/**
 * Ensure reCAPTCHA is loaded, then execute it to obtain a token. Safe to call
 * before loadRecaptcha() has resolved — it awaits the load first rather than
 * failing if the script is still in flight.
 */
export const executeRecaptcha = (
  siteKey: string,
  action: string
): Promise<string> =>
  loadRecaptcha(siteKey).then(() =>
    window.grecaptcha.execute(siteKey, { action })
  );
