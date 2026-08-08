import { jsxs as L, jsx as p } from "react/jsx-runtime";
import * as d from "react";
import { cn as b } from "./index143.js";
const T = "https://embed.diagrams.net/?embed=1&proto=json&spin=1&ui=min&libraries=1", U = "https://www.yappydraw.com/", v = "__yappy", j = (r) => {
  try {
    return JSON.parse(r);
  } catch {
    return r;
  }
}, J = ({
  provider: r = "drawio",
  value: o = "",
  onChange: u,
  onSave: f,
  onReady: h,
  onError: x,
  src: A,
  sandbox: M = "allow-scripts allow-same-origin allow-popups allow-forms allow-downloads",
  height: N = "32rem",
  title: I = "Diagram editor",
  className: k
}) => {
  const m = A ?? (r === "yappydraw" ? U : T), w = d.useRef(null), s = d.useRef({ onChange: u, onSave: f, onReady: h, onError: x });
  s.current = { onChange: u, onSave: f, onReady: h, onError: x };
  const a = d.useRef(o);
  a.current = o;
  const i = d.useMemo(() => {
    try {
      return new URL(m, typeof window > "u" ? "http://localhost" : window.location.href).origin;
    } catch {
      return "";
    }
  }, [m]);
  return d.useEffect(() => {
    const g = () => w.current?.contentWindow, P = (e) => {
      if (typeof e.data != "string") return;
      let t;
      try {
        t = JSON.parse(e.data);
      } catch {
        return;
      }
      const n = (l) => g()?.postMessage(JSON.stringify(l), i || "*");
      t.event === "init" ? (n({ action: "load", xml: a.current, autosave: 1 }), s.current.onReady?.()) : t.event === "autosave" && typeof t.xml == "string" ? s.current.onChange?.(t.xml) : t.event === "save" && typeof t.xml == "string" && (s.current.onSave?.(t.xml), n({ action: "status", modified: !1 }));
    };
    let S = 0;
    const c = /* @__PURE__ */ new Map();
    let y = 0, z = "";
    const E = (e, t = []) => new Promise((n) => {
      const l = ++S;
      c.set(l, n), g()?.postMessage({ [v]: !0, id: l, method: e, args: t }, i || "*"), setTimeout(() => {
        c.delete(l) && n({ ok: !1, error: `Yappy.${e} timed out` });
      }, 4e3);
    }), Y = (e) => {
      const t = e.data;
      if (!t || typeof t != "object" || t[v] !== !0 || !("ok" in t)) return;
      const n = c.get(t.id);
      n && (c.delete(t.id), n(t));
    }, O = async () => {
      for (let e = 0; e < 20 && !(await E("__ping")).ok; e++) {
        if (e === 19) {
          s.current.onError?.(
            "YappyDraw did not answer. Its deployment must allowlist this origin — see VITE_EMBED_ALLOWED_ORIGINS."
          );
          return;
        }
        await new Promise((n) => setTimeout(n, 250));
      }
      if (a.current) {
        const e = await E("loadDocument", [j(a.current)]);
        !e.ok && e.error && s.current.onError?.(e.error);
      }
      s.current.onReady?.(), z = a.current, y = window.setInterval(async () => {
        const e = await E("getDocument");
        if (!e.ok) return;
        const t = typeof e.result == "string" ? e.result : JSON.stringify(e.result);
        t && t !== z && (z = t, s.current.onChange?.(t));
      }, 1500);
    }, R = (e) => {
      i && e.origin !== i || e.source === g() && (r === "drawio" ? P(e) : Y(e));
    };
    window.addEventListener("message", R);
    const D = () => {
      r === "yappydraw" && O();
    }, _ = w.current;
    return _?.addEventListener("load", D), () => {
      _?.removeEventListener("load", D), window.removeEventListener("message", R), y && clearInterval(y), c.clear();
    };
  }, [i, r, m]), /* @__PURE__ */ p(
    "iframe",
    {
      ref: w,
      src: m,
      title: I,
      style: { height: N },
      sandbox: M,
      className: b(
        "zen-w-full zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-background",
        k
      )
    }
  );
}, C = ({
  label: r = "System design",
  actions: o,
  className: u,
  ...f
}) => /* @__PURE__ */ L("div", { className: b("zen-flex zen-w-full zen-flex-col zen-gap-2", u), children: [
  /* @__PURE__ */ L("div", { className: "zen-flex zen-items-center zen-gap-2", children: [
    /* @__PURE__ */ p("span", { className: "zen-text-sm zen-font-medium zen-text-zen-foreground", children: r }),
    o ? /* @__PURE__ */ p("span", { className: "zen-ms-auto zen-flex zen-gap-2", children: o }) : null
  ] }),
  /* @__PURE__ */ p(J, { ...f })
] });
export {
  C as ArchitectureDraw,
  T as DEFAULT_DIAGRAM_EMBED_URL,
  U as DEFAULT_YAPPYDRAW_EMBED_URL,
  J as DiagramCanvas
};
//# sourceMappingURL=index106.js.map
