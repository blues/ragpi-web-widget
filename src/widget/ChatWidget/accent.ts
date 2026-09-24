/*
 * The widget's accent — the fill of the three action buttons (the prompt bar's
 * arrow, the chat send button, and the floating "show widget" button) and the
 * color of the glyph drawn on them.
 *
 * Configured with the `data-accent-color`, `data-accent-text-color` and
 * `data-accent-ring-color` script attributes, which ChatWidget turns into the
 * `--ragpi-accent*` custom properties on its shadow host. Those properties are
 * namespaced so a host page's own variables can't leak into the widget, and a
 * page may also set them directly in CSS on `#ragpi-widget` if it prefers.
 *
 * The fallbacks are the widget's long-standing defaults, so an embed that sets
 * none of these renders exactly as it always has.
 */
export const ACCENT = "var(--ragpi-accent, rgba(62, 90, 255, 0.8))";

// The disabled send button: the accent at half its opacity. With the default
// accent that is rgba(62, 90, 255, 0.4), the value this replaced.
export const ACCENT_DISABLED = `color-mix(in srgb, ${ACCENT} 50%, transparent)`;

export const ACCENT_TEXT = "var(--ragpi-accent-text, #ffffff)";
