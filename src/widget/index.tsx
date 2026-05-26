import { createRoot } from "react-dom/client";
import { ChatWidget } from "./ChatWidget";
import "./index.css";

const initWidget = () => {
  const scriptTag =
    document.currentScript ||
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
    />
  );
};

if (document.readyState === "complete") {
  initWidget();
} else {
  document.addEventListener("DOMContentLoaded", initWidget);
}
