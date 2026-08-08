import { jsxs as l, jsx as n } from "react/jsx-runtime";
import * as s from "react";
const x = async (o) => {
  let e;
  try {
    e = await import("./index188.js");
  } catch {
    return o;
  }
  const a = (t, r) => {
    try {
      return (e.default ?? e).renderToString(t, {
        displayMode: r,
        throwOnError: !1
      });
    } catch {
      return r ? `$$${t}$$` : `$${t}$`;
    }
  };
  return o.replace(/\$\$([^$]+)\$\$/g, (t, r) => a(r, !0)).replace(/\$([^$\n]+)\$/g, (t, r) => a(r, !1));
}, $ = s.lazy(() => import("jodit-pro-react"));
class y extends s.Component {
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
const b = ({
  value: o = "",
  onChange: e,
  placeholder: a,
  config: t,
  onImageUpload: r,
  math: i,
  className: f
}) => {
  const u = s.useRef(r);
  u.current = r;
  const z = s.useMemo(
    () => ({
      readonly: !1,
      placeholder: a ?? "",
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
              const m = await u.current?.(g);
              m && c(m);
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
    [a, t, r]
  ), [p, h] = s.useState("");
  return s.useEffect(() => {
    if (!i) return;
    let d = !1;
    return x(o).then((c) => {
      d || h(c);
    }), () => {
      d = !0;
    };
  }, [i, o]), /* @__PURE__ */ l("div", { className: f, children: [
    /* @__PURE__ */ n(
      y,
      {
        fallback: /* @__PURE__ */ l("div", { className: "zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-muted zen-p-4 zen-text-sm zen-text-zen-muted-fg", children: [
          /* @__PURE__ */ n("strong", { className: "zen-font-medium zen-text-zen-foreground", children: "RichText needs an optional peer dependency." }),
          " ",
          "Install ",
          /* @__PURE__ */ n("code", { children: "jodit-pro-react" }),
          " to use this component."
        ] }),
        children: /* @__PURE__ */ n(
          s.Suspense,
          {
            fallback: /* @__PURE__ */ n("div", { className: "zen-text-sm zen-text-zen-muted-fg", children: "Loading editor…" }),
            children: /* @__PURE__ */ n(
              $,
              {
                value: o,
                config: z,
                onBlur: (d) => e?.(d)
              }
            )
          }
        )
      }
    ),
    i ? /* @__PURE__ */ l("figure", { className: "zen-mt-2 zen-m-0 zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-muted zen-p-3", children: [
      /* @__PURE__ */ n("figcaption", { className: "zen-mb-1 zen-text-xs zen-font-medium zen-text-zen-muted-fg", children: "Preview" }),
      /* @__PURE__ */ n(
        "div",
        {
          className: "zen-text-sm zen-text-zen-foreground",
          dangerouslySetInnerHTML: { __html: p }
        }
      )
    ] }) : null
  ] });
};
b.displayName = "RichText";
export {
  b as RichText,
  x as renderMath
};
//# sourceMappingURL=index132.js.map
