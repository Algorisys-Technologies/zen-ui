import { jsx as n, jsxs as f } from "react/jsx-runtime";
import * as s from "react";
import { createElement as w } from "react";
import { cn as v } from "./index145.js";
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
], E = s.lazy(
  () => import("./index187.js").then((t) => ({ default: t.default }))
);
class j extends s.Component {
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
const M = ({ height: t }) => /* @__PURE__ */ f(
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
), O = ({
  value: t,
  onChange: r,
  language: p = "plaintext",
  theme: l,
  fontSize: h = 14,
  readOnly: c = !1,
  height: z = "24rem",
  minimap: u = !1,
  lineNumbers: b = !0,
  onRun: m,
  options: x,
  onMount: i,
  loading: o,
  className: y
}) => {
  const [e, N] = s.useState(l ?? "light");
  s.useEffect(() => {
    if (l) {
      N(l);
      return;
    }
    const a = () => {
      const C = document.documentElement.getAttribute("data-theme");
      N(C === "dark" ? "dark" : "light");
    };
    a();
    const d = new MutationObserver(a);
    return d.observe(document.documentElement, { attributes: !0, attributeFilter: ["data-theme"] }), () => d.disconnect();
  }, [l]);
  const g = s.useRef(m);
  g.current = m;
  const k = s.useCallback(
    (a, d) => {
      g.current && d?.KeyMod && d?.KeyCode && a.addCommand(d.KeyMod.CtrlCmd | d.KeyCode.Enter, () => {
        g.current?.(a.getValue() ?? "");
      }), i?.(a, d);
    },
    [i]
  );
  return /* @__PURE__ */ n(
    "div",
    {
      className: v(
        "zen-w-full zen-overflow-hidden zen-rounded-zen-md zen-border zen-border-zen-border",
        y
      ),
      children: /* @__PURE__ */ n(j, { fallback: /* @__PURE__ */ n(M, { height: z }), children: /* @__PURE__ */ n(
        s.Suspense,
        {
          fallback: o ?? /* @__PURE__ */ n(
            "div",
            {
              style: { height: z },
              className: "zen-flex zen-items-center zen-justify-center zen-text-sm zen-text-zen-muted-fg",
              children: "Loading editor…"
            }
          ),
          children: /* @__PURE__ */ n(
            E,
            {
              height: z,
              language: p,
              theme: e === "dark" ? "vs-dark" : "vs",
              value: t,
              onChange: (a) => r?.(a ?? ""),
              onMount: k,
              options: {
                fontSize: h,
                readOnly: c,
                minimap: { enabled: u },
                lineNumbers: b ? "on" : "off",
                scrollBeyondLastLine: !1,
                automaticLayout: !0,
                tabSize: 2,
                ...x
              }
            }
          )
        }
      ) })
    }
  );
}, K = ({
  files: t,
  activePath: r,
  defaultActivePath: p,
  onActivePathChange: l,
  onFileChange: h,
  toolbar: c,
  className: z,
  height: u = "24rem",
  ...b
}) => {
  const [m, x] = s.useState(p ?? t[0]?.path ?? ""), i = r ?? m, o = t.find((e) => e.path === i) ?? t[0], y = (e) => {
    x(e), l?.(e);
  };
  return /* @__PURE__ */ f(
    "div",
    {
      className: v(
        "zen-flex zen-w-full zen-overflow-hidden zen-rounded-zen-md zen-border zen-border-zen-border",
        z
      ),
      children: [
        /* @__PURE__ */ n(
          "nav",
          {
            "aria-label": "Files",
            className: "zen-w-48 zen-shrink-0 zen-overflow-y-auto zen-border-e zen-border-zen-border zen-bg-zen-muted",
            style: { height: u },
            children: /* @__PURE__ */ n("ul", { className: "zen-m-0 zen-list-none zen-p-1", children: t.map((e) => /* @__PURE__ */ n("li", { children: /* @__PURE__ */ f(
              "button",
              {
                type: "button",
                "aria-current": e.path === i ? "true" : void 0,
                onClick: () => y(e.path),
                className: v(
                  "zen-flex zen-w-full zen-items-center zen-gap-1 zen-rounded-zen-sm zen-px-2 zen-py-1 zen-text-start zen-text-xs",
                  "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
                  e.path === i ? "zen-bg-zen-background zen-font-medium zen-text-zen-foreground" : "zen-text-zen-muted-fg hover:zen-text-zen-foreground"
                ),
                children: [
                  /* @__PURE__ */ n("span", { className: "zen-min-w-0 zen-flex-1 zen-truncate", children: e.path }),
                  e.readOnly ? /* @__PURE__ */ n(
                    "span",
                    {
                      className: "zen-shrink-0 zen-rounded-zen-sm zen-bg-zen-muted zen-px-1 zen-text-[0.625rem] zen-text-zen-muted-fg",
                      title: "Read only",
                      children: "RO"
                    }
                  ) : null
                ]
              }
            ) }, e.path)) })
          }
        ),
        /* @__PURE__ */ f("div", { className: "zen-flex zen-min-w-0 zen-flex-1 zen-flex-col", children: [
          c ? /* @__PURE__ */ n("div", { className: "zen-flex zen-items-center zen-gap-2 zen-border-b zen-border-zen-border zen-px-2 zen-py-1", children: c }) : null,
          /* @__PURE__ */ w(
            O,
            {
              ...b,
              height: u,
              key: o?.path,
              value: o?.content ?? "",
              language: o?.language,
              readOnly: o?.readOnly,
              onChange: (e) => o && h?.(o.path, e),
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
  O as CodeEditor,
  K as IDEWindow
};
//# sourceMappingURL=index110.js.map
