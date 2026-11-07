import { jsx as n, jsxs as p } from "react/jsx-runtime";
import * as s from "react";
import { createElement as j } from "react";
import { useLocale as k } from "./index90.js";
import { cn as E } from "./index160.js";
const D = [
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
], M = s.lazy(
  () => import("./index217.js").then((t) => ({ default: t.default }))
);
class O extends s.Component {
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
const S = ({ height: t }) => /* @__PURE__ */ p(
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
), L = ({
  value: t,
  onChange: r,
  language: h = "plaintext",
  theme: l,
  fontSize: b = 14,
  readOnly: u = !1,
  height: c = "24rem",
  minimap: m = !1,
  lineNumbers: x = !0,
  onRun: i,
  options: y,
  onMount: f,
  loading: z,
  className: o
}) => {
  const g = k(), [e, N] = s.useState(l ?? "light");
  s.useEffect(() => {
    if (l) {
      N(l);
      return;
    }
    const d = () => {
      const w = document.documentElement.getAttribute("data-theme");
      N(w === "dark" ? "dark" : "light");
    };
    d();
    const a = new MutationObserver(d);
    return a.observe(document.documentElement, { attributes: !0, attributeFilter: ["data-theme"] }), () => a.disconnect();
  }, [l]);
  const v = s.useRef(i);
  v.current = i;
  const C = s.useCallback(
    (d, a) => {
      v.current && a?.KeyMod && a?.KeyCode && d.addCommand(a.KeyMod.CtrlCmd | a.KeyCode.Enter, () => {
        v.current?.(d.getValue() ?? "");
      }), f?.(d, a);
    },
    [f]
  );
  return /* @__PURE__ */ n(
    "div",
    {
      className: E(
        "zen-w-full zen-overflow-hidden zen-rounded-zen-md zen-border zen-border-zen-border",
        o
      ),
      children: /* @__PURE__ */ n(O, { fallback: /* @__PURE__ */ n(S, { height: c }), children: /* @__PURE__ */ n(
        s.Suspense,
        {
          fallback: z ?? /* @__PURE__ */ n(
            "div",
            {
              style: { height: c },
              className: "zen-flex zen-items-center zen-justify-center zen-text-sm zen-text-zen-muted-fg",
              children: g.t("codeEditor.loadingEditor")
            }
          ),
          children: /* @__PURE__ */ n(
            M,
            {
              height: c,
              language: h,
              theme: e === "dark" ? "vs-dark" : "vs",
              value: t,
              onChange: (d) => r?.(d ?? ""),
              onMount: C,
              options: {
                fontSize: b,
                readOnly: u,
                minimap: { enabled: m },
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
}, F = ({
  files: t,
  activePath: r,
  defaultActivePath: h,
  onActivePathChange: l,
  onFileChange: b,
  toolbar: u,
  className: c,
  height: m = "24rem",
  ...x
}) => {
  const i = k(), [y, f] = s.useState(h ?? t[0]?.path ?? ""), z = r ?? y, o = t.find((e) => e.path === z) ?? t[0], g = (e) => {
    f(e), l?.(e);
  };
  return /* @__PURE__ */ p(
    "div",
    {
      className: E(
        "zen-flex zen-w-full zen-overflow-hidden zen-rounded-zen-md zen-border zen-border-zen-border",
        c
      ),
      children: [
        /* @__PURE__ */ n(
          "nav",
          {
            "aria-label": i.t("codeEditor.files"),
            className: "zen-w-48 zen-shrink-0 zen-overflow-y-auto zen-border-e zen-border-zen-border zen-bg-zen-muted",
            style: { height: m },
            children: /* @__PURE__ */ n("ul", { className: "zen-m-0 zen-list-none zen-p-1", children: t.map((e) => /* @__PURE__ */ n("li", { children: /* @__PURE__ */ p(
              "button",
              {
                type: "button",
                "aria-current": e.path === z ? "true" : void 0,
                onClick: () => g(e.path),
                className: E(
                  "zen-flex zen-w-full zen-items-center zen-gap-1 zen-rounded-zen-sm zen-px-2 zen-py-1 zen-text-start zen-text-xs",
                  "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
                  e.path === z ? "zen-bg-zen-background zen-font-medium zen-text-zen-foreground" : "zen-text-zen-muted-fg hover:zen-text-zen-foreground"
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
        /* @__PURE__ */ p("div", { className: "zen-flex zen-min-w-0 zen-flex-1 zen-flex-col", children: [
          u ? /* @__PURE__ */ n("div", { className: "zen-flex zen-items-center zen-gap-2 zen-border-b zen-border-zen-border zen-px-2 zen-py-1", children: u }) : null,
          /* @__PURE__ */ j(
            L,
            {
              ...x,
              height: m,
              key: o?.path,
              value: o?.content ?? "",
              language: o?.language,
              readOnly: o?.readOnly,
              onChange: (e) => o && b?.(o.path, e),
              className: "zen-rounded-none zen-border-0"
            }
          )
        ] })
      ]
    }
  );
};
export {
  D as CODE_LANGUAGES,
  L as CodeEditor,
  F as IDEWindow
};
//# sourceMappingURL=index120.js.map
