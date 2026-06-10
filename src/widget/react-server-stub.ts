// react-shadow statically imports `renderToString` from "react-dom/server" but
// only invokes it when its <ShadowRoot ssr> mode is enabled. This widget always
// renders client-side (no `ssr` prop), so that code path is never reached. Under
// the Preact alias, "react-dom/server" would otherwise drag in
// preact-render-to-string; this stub keeps it out of the bundle. If SSR is ever
// introduced, swap this alias for the real renderer.
export function renderToString(): string {
  return "";
}

export function renderToStaticMarkup(): string {
  return "";
}

export default { renderToString, renderToStaticMarkup };
