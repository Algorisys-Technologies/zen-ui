import { jsxs as u, jsx as s } from "react/jsx-runtime";
import * as a from "react";
import { useLocale as R } from "./index90.js";
const v = async (t) => {
  let e;
  try {
    e = await import("./index266.js");
  } catch {
    return t;
  }
  const c = (n, r) => {
    try {
      return (e.default ?? e).renderToString(n, {
        displayMode: r,
        throwOnError: !1
      });
    } catch {
      return r ? `$$${n}$$` : `$${n}$`;
    }
  };
  return t.replace(/\$\$([^$]+)\$\$/g, (n, r) => c(r, !0)).replace(/\$([^$\n]+)\$/g, (n, r) => c(r, !1));
}, g = (t, e) => ({
  success: !e,
  time: "",
  data: {
    files: t,
    isImages: t.map(() => !0),
    baseurl: "",
    messages: e ? [e] : []
  }
}), w = a.lazy(() => import("jodit-pro-react"));
class T extends a.Component {
  state = { error: null };
  static getDerivedStateFromError(e) {
    return { error: e };
  }
  render() {
    const { error: e } = this.state;
    if (!e) return this.props.children;
    if (!/jodit-pro-react|Failed to fetch dynamically imported module/i.test(e.message))
      throw e;
    return this.props.fallback;
  }
}
const E = ({
  value: t = "",
  onChange: e,
  placeholder: c,
  config: n,
  onImageUpload: r,
  math: d,
  className: x
}) => {
  const m = R(), f = a.useRef(r);
  f.current = r;
  const z = !!r, $ = a.useMemo(
    () => ({
      readonly: !1,
      placeholder: c ?? "",
      /* Inline code and a code block, which a question bank needs and Jodit
         does not enable by default. */
      controls: {},
      /*
       * Jodit inlines a dropped or pasted image as base64 unless told
       * otherwise. That silently multiplies the stored HTML by the size of
       * every image, and the bill arrives later as a slow list page. With a
       * handler, the file goes wherever the caller sends it and only the URL is
       * embedded.
       *
       * `customUploadFunction` is Jodit's hook for replacing the transport: it
       * is handed the FormData Jodit built and answers in Jodit's
       * upload-response shape, so Jodit's own success handler inserts the
       * `<img>`. `url` must be non-empty or Jodit never binds drop/paste to the
       * uploader; it is never requested, because the custom function replaces
       * the request. (This used to pass `customUploader` and `url: ""` — an
       * option Jodit does not have, and a url that left drop and paste unbound,
       * so the handler was never called.) Same as the Solid binding.
       */
      ...z ? {
        uploader: {
          insertImageAsBase64URI: !1,
          url: "onImageUpload",
          customUploadFunction: async (i) => {
            const l = Array.from(i.values()).filter(
              (o) => typeof File < "u" && o instanceof File
            ), p = [];
            try {
              for (const o of l) {
                const h = await f.current?.(o);
                h && p.push(h);
              }
            } catch (o) {
              return g([], o instanceof Error ? o.message : String(o));
            }
            return g(p);
          }
        }
      } : { uploader: { insertImageAsBase64URI: !0 } },
      // Jodit's beforeInitHook fetches `<basePath>config.js` when
      // loadExternalConfig is on (its default), so every RichText mount fired a
      // request for a file zen-ui does not ship and never will — a guaranteed 404
      // in the console of any app using it. Nothing reads the response; turning it
      // off removes a failed request per mount and nothing else. A caller who DOES
      // host a jodit config can turn it back on through `config`, since theirs is
      // spread after this.
      loadExternalConfig: !1,
      ...n
    }),
    [c, n, z]
  ), [y, b] = a.useState("");
  return a.useEffect(() => {
    if (!d) return;
    let i = !1;
    return v(t).then((l) => {
      i || b(l);
    }), () => {
      i = !0;
    };
  }, [d, t]), /* @__PURE__ */ u("div", { className: x, children: [
    /* @__PURE__ */ s(
      T,
      {
        fallback: (
          /* i18n-ignore-start: a developer install notice (add the peer dependency), not a word for end users */
          /* @__PURE__ */ u("div", { className: "zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-muted zen-p-4 zen-text-sm zen-text-zen-muted-fg", children: [
            /* @__PURE__ */ s("strong", { className: "zen-font-medium zen-text-zen-foreground", children: "RichText needs an optional peer dependency." }),
            " ",
            "Install ",
            /* @__PURE__ */ s("code", { children: "jodit-pro-react" }),
            " to use this component."
          ] })
        ),
        children: /* @__PURE__ */ s(
          a.Suspense,
          {
            fallback: /* @__PURE__ */ s("div", { className: "zen-text-sm zen-text-zen-muted-fg", children: m.t("richText.loadingEditor") }),
            children: /* @__PURE__ */ s(
              w,
              {
                value: t,
                config: $,
                onBlur: (i) => e?.(i)
              }
            )
          }
        )
      }
    ),
    d ? /* @__PURE__ */ u("figure", { className: "zen-mt-2 zen-m-0 zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-muted zen-p-3", children: [
      /* @__PURE__ */ s("figcaption", { className: "zen-mb-1 zen-text-xs zen-font-medium zen-text-zen-muted-fg", children: m.t("richText.preview") }),
      /* @__PURE__ */ s(
        "div",
        {
          className: "zen-text-sm zen-text-zen-foreground",
          dangerouslySetInnerHTML: { __html: y }
        }
      )
    ] }) : null
  ] });
};
E.displayName = "RichText";
export {
  E as RichText,
  v as renderMath
};
//# sourceMappingURL=index188.js.map
