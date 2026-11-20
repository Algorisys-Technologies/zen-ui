import { jsx as n, jsxs as b } from "react/jsx-runtime";
import * as s from "react";
import { createElement as M } from "react";
import { useLocale as N } from "./index90.js";
import { cn as E } from "./index199.js";
const F = [
  "javascript",
  "typescript",
  "python",
  "java",
  "csharp",
  "go",
  "rust",
  "elixir",
  "ruby",
  "php",
  "sql",
  "html",
  "css",
  "json",
  "yaml",
  "markdown",
  "shell",
  "plaintext"
], O = s.lazy(
  () => import("./index258.js").then((t) => {
    const r = t.default;
    return { default: ({
      loaderConfig: d,
      ...c
    }) => (s.useState(() => (d && t.loader.config(d), null)), /* @__PURE__ */ n(r, { ...c })) };
  })
);
class S extends s.Component {
  state = { error: null };
  static getDerivedStateFromError(r) {
    return { error: r };
  }
  render() {
    const r = this.state.error;
    if (!r) return this.props.children;
    if (!/monaco-editor|Failed to fetch dynamically imported module/i.test(r.message)) throw r;
    return this.props.fallback;
  }
}
const L = ({ height: t }) => /* @__PURE__ */ b(
  "div",
  {
    style: { height: t },
    className: "zen-flex zen-items-center zen-justify-center zen-rounded-zen-md zen-border zen-border-dashed zen-border-zen-border zen-p-4 zen-text-center zen-text-sm zen-text-zen-muted-fg",
    children: [
      "CodeEditor needs ",
      /* @__PURE__ */ n("code", { className: "zen-mx-1 zen-font-mono", children: "@monaco-editor/react" }),
      " installed."
    ]
  }
), K = ({
  value: t,
  onChange: r,
  language: m = "plaintext",
  theme: d,
  fontSize: c = 14,
  readOnly: f = !1,
  height: z = "24rem",
  minimap: p = !1,
  lineNumbers: x = !0,
  onRun: i,
  options: y,
  onMount: h,
  loaderConfig: u,
  loading: o,
  className: g
}) => {
  const e = N(), [k, C] = s.useState(d ?? "light");
  s.useEffect(() => {
    if (d) {
      C(d);
      return;
    }
    const a = () => {
      const j = document.documentElement.getAttribute("data-theme");
      C(j === "dark" ? "dark" : "light");
    };
    a();
    const l = new MutationObserver(a);
    return l.observe(document.documentElement, { attributes: !0, attributeFilter: ["data-theme"] }), () => l.disconnect();
  }, [d]);
  const v = s.useRef(i);
  v.current = i;
  const w = s.useCallback(
    (a, l) => {
      v.current && l?.KeyMod && l?.KeyCode && a.addCommand(l.KeyMod.CtrlCmd | l.KeyCode.Enter, () => {
        v.current?.(a.getValue() ?? "");
      }), h?.(a, l);
    },
    [h]
  );
  return /* @__PURE__ */ n(
    "div",
    {
      className: E(
        "zen-w-full zen-overflow-hidden zen-rounded-zen-md zen-border zen-border-zen-border",
        g
      ),
      children: /* @__PURE__ */ n(S, { fallback: /* @__PURE__ */ n(L, { height: z }), children: /* @__PURE__ */ n(
        s.Suspense,
        {
          fallback: o ?? /* @__PURE__ */ n(
            "div",
            {
              style: { height: z },
              className: "zen-flex zen-items-center zen-justify-center zen-text-sm zen-text-zen-muted-fg",
              children: e.t("codeEditor.loadingEditor")
            }
          ),
          children: /* @__PURE__ */ n(
            O,
            {
              height: z,
              language: m,
              theme: k === "dark" ? "vs-dark" : "vs",
              value: t,
              onChange: (a) => r?.(a ?? ""),
              onMount: w,
              loaderConfig: u,
              ...o !== void 0 ? { loading: o } : {},
              options: {
                fontSize: c,
                readOnly: f,
                minimap: { enabled: p },
                lineNumbers: x ? "on" : "off",
                scrollBeyondLastLine: !1,
                automaticLayout: !0,
                tabSize: 2,
                ...y
              }
            }
          )
        }
      ) })
    }
  );
}, G = ({
  files: t,
  activePath: r,
  defaultActivePath: m,
  onActivePathChange: d,
  onFileChange: c,
  toolbar: f,
  className: z,
  height: p = "24rem",
  ...x
}) => {
  const i = N(), [y, h] = s.useState(m ?? t[0]?.path ?? ""), u = r ?? y, o = t.find((e) => e.path === u) ?? t[0], g = (e) => {
    h(e), d?.(e);
  };
  return /* @__PURE__ */ b(
    "div",
    {
      className: E(
        "zen-flex zen-w-full zen-overflow-hidden zen-rounded-zen-md zen-border zen-border-zen-border",
        z
      ),
      children: [
        /* @__PURE__ */ n(
          "nav",
          {
            "aria-label": i.t("codeEditor.files"),
            className: "zen-w-48 zen-shrink-0 zen-overflow-y-auto zen-border-e zen-border-zen-border zen-bg-zen-muted",
            style: { height: p },
            children: /* @__PURE__ */ n("ul", { className: "zen-m-0 zen-list-none zen-p-1", children: t.map((e) => /* @__PURE__ */ n("li", { children: /* @__PURE__ */ b(
              "button",
              {
                type: "button",
                "aria-current": e.path === u ? "true" : void 0,
                onClick: () => g(e.path),
                className: E(
                  "zen-flex zen-w-full zen-items-center zen-gap-1 zen-rounded-zen-sm zen-px-2 zen-py-1 zen-text-start zen-text-xs",
                  "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
                  e.path === u ? "zen-bg-zen-background zen-font-medium zen-text-zen-foreground" : "zen-text-zen-muted-fg hover:zen-text-zen-foreground"
                ),
                children: [
                  /* @__PURE__ */ n("span", { className: "zen-min-w-0 zen-flex-1 zen-truncate", children: e.path }),
                  e.readOnly ? /* @__PURE__ */ n(
                    "span",
                    {
                      className: "zen-shrink-0 zen-rounded-zen-sm zen-bg-zen-muted zen-px-1 zen-text-[0.625rem] zen-text-zen-muted-fg",
                      title: i.t("codeEditor.readOnly"),
                      children: i.t("codeEditor.readOnlyBadge")
                    }
                  ) : null
                ]
              }
            ) }, e.path)) })
          }
        ),
        /* @__PURE__ */ b("div", { className: "zen-flex zen-min-w-0 zen-flex-1 zen-flex-col", children: [
          f ? /* @__PURE__ */ n("div", { className: "zen-flex zen-items-center zen-gap-2 zen-border-b zen-border-zen-border zen-px-2 zen-py-1", children: f }) : null,
          /* @__PURE__ */ M(
            K,
            {
              ...x,
              height: p,
              key: o?.path,
              value: o?.content ?? "",
              language: o?.language,
              readOnly: o?.readOnly,
              onChange: (e) => o && c?.(o.path, e),
              className: "zen-rounded-none zen-border-0"
            }
          )
        ] })
      ]
    }
  );
};
export {
  F as CODE_LANGUAGES,
  K as CodeEditor,
  G as IDEWindow
};
//# sourceMappingURL=index159.js.map
