# Blues Fork of Ragpi Web Widget Integration

> [!NOTE]  
> This is a Blues-maintained fork of the upstream Ragpi project.  
> It includes custom patches required for internal workflows and is not intended to track upstream changes automatically.

Ragpi's Web Widget integration allows you to embed a chat widget on your website, enabling users to ask questions and receive AI-assisted answers directly from your knowledge base. It uses a simple JavaScript script to load the widget, which is protected by google recaptcha v3 to prevent spam and abuse. The widget will connect to the Ragpi API through a lightweight API gateway that will verify the recaptcha token and forward the request to the Ragpi API. This ensures that only valid requests are processed, and it helps to protect your API key from being exposed in the client-side code.

Check out the [Ragpi Web Widget integration documentation](https://docs.ragpi.io/integrations/web-widget) to learn more about how to set up and use the integration, noting significant deviations documented below.

You can also visit the [Core Ragpi Repo](https://github.com/ragpi/ragpi) to learn more about project.

## Embedding

Load the widget with a single `<script type="module">` tag:

```html
<script
  type="module"
  src="https://your-cdn.example.com/ragpi-widget.js"
  data-recaptcha-site-key="YOUR_RECAPTCHA_SITE_KEY"
  data-ragpi-gateway-url="https://your-gateway.example.com"
  data-ragpi-sources="source_one,source_two"
></script>
```

> [!IMPORTANT]
> The `type="module"` attribute is required (module scripts are fetched with CORS, so ensure your CDN serves `ragpi-widget.js` and `ragpi-widget-chat-*.js` with appropriate `Access-Control-Allow-Origin` headers). The widget code-splits the chat
> panel into a separate, lazily-loaded file (`ragpi-widget-chat-*.js`) that is
> only fetched the first time a user opens the chat. The entry script references
> that chunk by a path relative to its own URL, which only resolves correctly
> when loaded as a module. **Deploy the whole `dist/` folder together** so the
> chunk sits in the same directory as `ragpi-widget.js`.

### Supported `data-` attributes

| Attribute | Required | Description |
| --- | --- | --- |
| `data-recaptcha-site-key` | ✅ | Google reCAPTCHA v3 site key. |
| `data-ragpi-gateway-url` | ✅ | Base URL of your Ragpi API gateway. |
| `data-ragpi-sources` | | Comma-separated list of knowledge-base sources. |
| `data-primary-color` | | Primary theme color (CSS color value). |
| `data-secondary-color` | | Secondary theme color. |
| `data-logo-url` | | Logo shown in the chat header. |
| `data-closed-icon-position` | | `bottom-left` or `bottom-right` (default). |
| `data-enabled` | | Set to `false` to render nothing. |

## Programmatic API

The widget exposes a global `window.ragpiWidget` object so the host page can
drive the chat panel directly — no need to find and click the launcher button.

```js
window.ragpiWidget.open();    // show the widget (even if hidden) and open the chat panel
window.ragpiWidget.close();   // close the panel (leaves the launcher in place)
window.ragpiWidget.toggle();  // open if closed, close if open
window.ragpiWidget.isOpen();  // → boolean
```

**Calling it is race-safe.** The widget mounts during browser idle time, but you
don't need to wait: an `open()` or `toggle()` call made before the widget has
mounted is queued and replayed automatically once it's ready.

Because the widget loads as a deferred module, `window.ragpiWidget` isn't defined
until the widget's own script executes. If your code might run first, either
guard the call or wait for the `ragpi:ready` event:

```js
// Option A — optional chaining (no-op if the widget script hasn’t executed yet)
window.ragpiWidget?.open();

// Option B — wait for the API to be attached
document.addEventListener("ragpi:ready", () => {
  window.ragpiWidget.open();
});
```

### Events

| Event (on `document`) | Fired when |
| --- | --- |
| `ragpi:ready` | The `window.ragpiWidget` API has been attached. |
| `ragpi:error` | A chat request fails; `event.detail.message` has details. |
