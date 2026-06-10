import { ChatWidget } from "./widget/ChatWidget";

// Dev-only playground served by `npm run dev`. The shipped widget is built from
// src/widget/index.tsx — this file is not part of that bundle.
function App() {
  const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
  const ragpiGatewayUrl = import.meta.env.VITE_RAGPI_GATEWAY_URL;
  const ragpiSources = import.meta.env.VITE_RAGPI_SOURCES;
  const ragpiSourcesArray = ragpiSources ? ragpiSources.split(",") : [];

  return (
    <ChatWidget
      recaptchaSiteKey={recaptchaSiteKey}
      ragpiGatewayUrl={ragpiGatewayUrl}
      ragpiSources={ragpiSourcesArray}
    />
  );
}

export default App;
