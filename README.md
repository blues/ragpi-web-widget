# Blues Fork of Ragpi Web Widget Integration

> [!NOTE]  
> This is a Blues-maintained fork of the upstream Ragpi project.  
> It includes custom patches required for internal workflows and is not intended to track upstream changes automatically.

Ragpi's Web Widget integration allows you to embed a chat widget on your website, enabling users to ask questions and receive AI-assisted answers directly from your knowledge base. It uses a simple JavaScript script to load the widget, which is protected by google recaptcha v3 to prevent spam and abuse. The widget will connect to the Ragpi API through a lightweight API gateway that will verify the recaptcha token and forward the request to the Ragpi API. This ensures that only valid requests are processed, and it helps to protect your API key from being exposed in the client-side code.

Check out the [Ragpi Web Widget integration documentation](https://docs.ragpi.io/integrations/web-widget) to learn more about how to set up and use the integration.

You can also visit the [Core Ragpi Repo](https://github.com/ragpi/ragpi) to learn more about project.
