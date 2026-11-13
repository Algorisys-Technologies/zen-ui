import { jsxs as l, jsx as n } from "react/jsx-runtime";
import * as s from "react";
import { useLocale as $ } from "./index90.js";
const y = async (o) => {
  let e;
  try {
    e = await import("./index262.js");
  } catch {
    return o;
  }
  const i = (t, r) => {
    try {
      return (e.default ?? e).renderToString(t, {
        displayMode: r,
        throwOnError: !1
      });
    } catch {
      return r ? `$$${t}$$` : `$${t}$`;
    }
  };
  return o.replace(/\$\$([^$]+)\$\$/g, (t, r) => i(r, !0)).replace(/\$([^$\n]+)\$/g, (t, r) => i(r, !1));
}, b = s.lazy(() => import("jodit-pro-react"));
class v extends s.Component {
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
const R = ({
  value: o = "",
  onChange: e,
  placeholder: i,
  config: t,
  onImageUpload: r,
  math: a,
  className: z
}) => {
  const u = $(), m = s.useRef(r);
  m.current = r;
  const p = s.useMemo(
    () => ({
      readonly: !1,
      placeholder: i ?? "",
      /* Inline code and a code block, which a question bank needs and Jodit
         does not enable by default. */
      controls: {},
      /*
       * Jodit inlines a dropped image as base64 unless told otherwise. That
       * silently multiplies the stored HTML by the size of every image, and the
       * bill arrives later as a slow list page. With a handler, the file goes
       * wherever the caller sends it and only the URL is embedded.
       */
      ...r ? {
        uploader: {
          insertImageAsBase64URI: !1,
          url: "",
          process: void 0,
          defaultHandlerSuccess: void 0,
          customUploader: async (d, c) => {
            for (const g of Array.from(d)) {
              const f = await m.current?.(g);
              f && c(f);
            }
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
      ...t
    }),
    [i, t, r]
  ), [h, x] = s.useState("");
  return s.useEffect(() => {
    if (!a) return;
    let d = !1;
    return y(o).then((c) => {
      d || x(c);
    }), () => {
      d = !0;
    };
  }, [a, o]), /* @__PURE__ */ l("div", { className: z, children: [
    /* @__PURE__ */ n(
      v,
      {
        fallback: (
          /* i18n-ignore-start: a developer install notice (add the peer dependency), not a word for end users */
          /* @__PURE__ */ l("div", { className: "zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-muted zen-p-4 zen-text-sm zen-text-zen-muted-fg", children: [
            /* @__PURE__ */ n("strong", { className: "zen-font-medium zen-text-zen-foreground", children: "RichText needs an optional peer dependency." }),
            " ",
            "Install ",
            /* @__PURE__ */ n("code", { children: "jodit-pro-react" }),
            " to use this component."
          ] })
        ),
        children: /* @__PURE__ */ n(
          s.Suspense,
          {
            fallback: /* @__PURE__ */ n("div", { className: "zen-text-sm zen-text-zen-muted-fg", children: u.t("richText.loadingEditor") }),
            children: /* @__PURE__ */ n(
              b,
              {
                value: o,
                config: p,
                onBlur: (d) => e?.(d)
              }
            )
          }
        )
      }
    ),
    a ? /* @__PURE__ */ l("figure", { className: "zen-mt-2 zen-m-0 zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-muted zen-p-3", children: [
      /* @__PURE__ */ n("figcaption", { className: "zen-mb-1 zen-text-xs zen-font-medium zen-text-zen-muted-fg", children: u.t("richText.preview") }),
      /* @__PURE__ */ n(
        "div",
        {
          className: "zen-text-sm zen-text-zen-foreground",
          dangerouslySetInnerHTML: { __html: h }
        }
      )
    ] }) : null
  ] });
};
R.displayName = "RichText";
export {
  R as RichText,
  y as renderMath
};
//# sourceMappingURL=index186.js.map
