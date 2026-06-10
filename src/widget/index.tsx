import { createRoot } from "react-dom/client";
import { ChatWidget } from "./ChatWidget";
import { WidgetControls } from "./ChatWidget/types";
// Imported as a string and injected into <head> below. With ESM code-splitting a
// plain `import "./index.css"` would emit a separate .css file that the embed
// <script> never loads; inlining keeps this global rule (it hides the reCAPTCHA
// badge, which lives in the main document, not the widget's shadow root) working.
import globalStyles from "./index.css?inline";

// Capture the embedding <script> synchronously while the bundle executes;
// document.currentScript reads as null once init is deferred into an idle
// callback, so we resolve the reference now and fall back to a query otherwise.
const currentScript = document.currentScript;

// --- Public programmatic API: window.ragpiWidget -----------------------------
// Lets the embedding page open/close the chat panel directly instead of
// synthesizing clicks on the launcher button. The live controls come from the
// mounted ChatWidget via registerControls(); the widget mounts on idle, so calls
// made before then operate on `pendingOpen` — a desired-open state that mirrors
// the imperative contract (toggle flips it, isOpen reflects it) and is applied
// once the widget mounts. This keeps pre-mount calls consistent: toggle()
// twice nets back to closed, and isOpen() reports the queued intent.
let liveControls: WidgetControls | null = null;
let pendingOpen: boolean | null = null; // null = no pre-mount intent expressed

const registerControls = (controls: WidgetControls | null) => {
  liveControls = controls;
  if (controls && pendingOpen !== null) {
    const wantOpen = pendingOpen;
    pendingOpen = null;
    // The widget mounts closed by default, so only an open intent needs applying.
    if (wantOpen) controls.open();
  }
};

const ragpiWidget: WidgetControls = {
  open: () =>
    liveControls ? liveControls.open() : void (pendingOpen = true),
  close: () =>
    liveControls ? liveControls.close() : void (pendingOpen = false),
  toggle: () => {
    if (liveControls) liveControls.toggle();
    else pendingOpen = !(pendingOpen ?? false);
  },
  isOpen: () => (liveControls ? liveControls.isOpen() : (pendingOpen ?? false)),
};

declare global {
  interface Window {
    ragpiWidget?: WidgetControls;
  }
}

window.ragpiWidget = ragpiWidget;
// Fired once the API is attached, for pages that prefer to wait rather than
// call window.ragpiWidget?.open() defensively.
document.dispatchEvent(new CustomEvent("ragpi:ready"));

const initWidget = () => {
  const scriptTag =
    currentScript ||
    document.querySelector(
      "script[data-recaptcha-site-key][data-ragpi-gateway-url]"
    );

  if (!scriptTag) {
    console.error("Widget script tag not found");
    return;
  }

  const recaptchaSiteKey = scriptTag.getAttribute("data-recaptcha-site-key");
  const ragpiGatewayUrl = scriptTag.getAttribute("data-ragpi-gateway-url");
  const ragpiSources = scriptTag.getAttribute("data-ragpi-sources");
  const ragpiSourcesArray = ragpiSources
    ? ragpiSources.split(",").map((source) => source.trim())
    : [];
  const primaryColor =
    scriptTag.getAttribute("data-primary-color") || undefined;
  const secondaryColor =
    scriptTag.getAttribute("data-secondary-color") || undefined;
  const logoUrl = scriptTag.getAttribute("data-logo-url") || undefined;
  const closedIconPosition =
    (scriptTag.getAttribute("data-closed-icon-position") as 'bottom-left' | 'bottom-right') || undefined;
  const enabledAttr = scriptTag.getAttribute("data-enabled");
  const enabled = enabledAttr === null ? true : enabledAttr !== 'false';

  if (!recaptchaSiteKey) {
    console.error("Missing data-recaptcha-site-key attribute");
    return;
  }
  if (!ragpiGatewayUrl) {
    console.error("Missing data-ragpi-gateway-url attribute");
    return;
  }

  if (!document.getElementById("ragpi-widget-global-styles")) {
    const styleTag = document.createElement("style");
    styleTag.id = "ragpi-widget-global-styles";
    styleTag.textContent = globalStyles;
    document.head.appendChild(styleTag);
  }

  const container = document.createElement("div");
  container.id = "ragpi-widget";
  document.body.appendChild(container);

  // reCAPTCHA is no longer injected here. It loads lazily when the user first
  // opens the chat panel (see ChatWidget handleOpenModal / recaptcha.ts), so
  // pages that embed the widget but never open it avoid the script's cost.
  const reactRoot = createRoot(container);
  reactRoot.render(
    <ChatWidget
      recaptchaSiteKey={recaptchaSiteKey}
      ragpiGatewayUrl={ragpiGatewayUrl}
      ragpiSources={ragpiSourcesArray}
      primaryColor={primaryColor}
      secondaryColor={secondaryColor}
      logoUrl={logoUrl}
      closedIconPosition={closedIconPosition}
      enabled={enabled}
      registerControls={registerControls}
    />
  );
};

// Mount during browser idle time so widget init yields to the host page's own
// work, improving Total Blocking Time / Speed Index. The timeout guarantees the
// widget still mounts on a perpetually busy page; browsers without
// requestIdleCallback fall back to a near-immediate timeout.
const scheduleInit = () => {
  if (typeof window.requestIdleCallback === "function") {
    window.requestIdleCallback(initWidget, { timeout: 2000 });
  } else {
    setTimeout(initWidget, 1);
  }
};

if (document.readyState === "complete") {
  scheduleInit();
} else {
  document.addEventListener("DOMContentLoaded", scheduleInit);
}
