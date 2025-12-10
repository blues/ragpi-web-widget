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

  if (!window.grecaptcha) {
    const script = document.createElement("script");
    script.src = `https://www.google.com/recaptcha/api.js?render=${recaptchaSiteKey}`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }

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
    />
  );
};

if (document.readyState === "complete") {
  initWidget();
} else {
  document.addEventListener("DOMContentLoaded", initWidget);
}
