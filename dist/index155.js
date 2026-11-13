import { jsxs as v, jsx as w } from "react/jsx-runtime";
import * as d from "react";
import { useLocale as b } from "./index90.js";
import { cn as A } from "./index197.js";
const C = "https://embed.diagrams.net/?embed=1&proto=json&spin=1&ui=min&libraries=1", J = "https://www.yappydraw.com/", L = "__yappy", B = (r) => {
  try {
    return JSON.parse(r);
  } catch {
    return r;
  }
}, W = ({
  provider: r = "drawio",
  value: s = "",
  onChange: u,
  onSave: f,
  onReady: m,
  onError: x,
  src: M,
  sandbox: N = "allow-scripts allow-same-origin allow-popups allow-forms allow-downloads",
  height: I = "32rem",
  title: k,
  className: P
}) => {
  const Y = b(), O = k ?? Y.t("diagramCanvas.diagramEditor"), p = M ?? (r === "yappydraw" ? J : C), g = d.useRef(null), o = d.useRef({ onChange: u, onSave: f, onReady: m, onError: x });
  o.current = { onChange: u, onSave: f, onReady: m, onError: x };
  const a = d.useRef(s);
  a.current = s;
  const i = d.useMemo(() => {
    try {
      return new URL(p, typeof window > "u" ? "http://localhost" : window.location.href).origin;
    } catch {
      return "";
    }
  }, [p]);
  return d.useEffect(() => {
    const y = () => g.current?.contentWindow, S = (e) => {
      if (typeof e.data != "string") return;
      let t;
      try {
        t = JSON.parse(e.data);
      } catch {
        return;
      }
      const n = (l) => y()?.postMessage(JSON.stringify(l), i || "*");
      t.event === "init" ? (n({ action: "load", xml: a.current, autosave: 1 }), o.current.onReady?.()) : t.event === "autosave" && typeof t.xml == "string" ? o.current.onChange?.(t.xml) : t.event === "save" && typeof t.xml == "string" && (o.current.onSave?.(t.xml), n({ action: "status", modified: !1 }));
    };
    let T = 0;
    const c = /* @__PURE__ */ new Map();
    let z = 0, E = "";
    const h = (e, t = []) => new Promise((n) => {
      const l = ++T;
      c.set(l, n), y()?.postMessage({ [L]: !0, id: l, method: e, args: t }, i || "*"), setTimeout(() => {
        c.delete(l) && n({ ok: !1, error: `Yappy.${e} timed out` });
      }, 4e3);
    }), U = (e) => {
      const t = e.data;
      if (!t || typeof t != "object" || t[L] !== !0 || !("ok" in t)) return;
      const n = c.get(t.id);
      n && (c.delete(t.id), n(t));
    }, j = async () => {
      for (let e = 0; e < 20 && !(await h("__ping")).ok; e++) {
        if (e === 19) {
          o.current.onError?.(
            "YappyDraw did not answer. Its deployment must allowlist this origin — see VITE_EMBED_ALLOWED_ORIGINS."
          );
          return;
        }
        await new Promise((n) => setTimeout(n, 250));
      }
      if (a.current) {
        const e = await h("loadDocument", [B(a.current)]);
        !e.ok && e.error && o.current.onError?.(e.error);
      }
      o.current.onReady?.(), E = a.current, z = window.setInterval(async () => {
        const e = await h("getDocument");
        if (!e.ok) return;
        const t = typeof e.result == "string" ? e.result : JSON.stringify(e.result);
        t && t !== E && (E = t, o.current.onChange?.(t));
      }, 1500);
    }, R = (e) => {
      i && e.origin !== i || e.source === y() && (r === "drawio" ? S(e) : U(e));
    };
    window.addEventListener("message", R);
    const D = () => {
      r === "yappydraw" && j();
    }, _ = g.current;
    return _?.addEventListener("load", D), () => {
      _?.removeEventListener("load", D), window.removeEventListener("message", R), z && clearInterval(z), c.clear();
    };
  }, [i, r, p]), /* @__PURE__ */ w(
    "iframe",
    {
      ref: g,
      src: p,
      title: O,
      style: { height: I },
      sandbox: N,
      className: A(
        "zen-w-full zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-background",
        P
      )
    }
  );
}, K = ({
  label: r,
  actions: s,
  className: u,
  ...f
}) => {
  const m = b();
  return /* @__PURE__ */ v("div", { className: A("zen-flex zen-w-full zen-flex-col zen-gap-2", u), children: [
    /* @__PURE__ */ v("div", { className: "zen-flex zen-items-center zen-gap-2", children: [
      /* @__PURE__ */ w("span", { className: "zen-text-sm zen-font-medium zen-text-zen-foreground", children: r ?? m.t("diagramCanvas.systemDesign") }),
      s ? /* @__PURE__ */ w("span", { className: "zen-ms-auto zen-flex zen-gap-2", children: s }) : null
    ] }),
    /* @__PURE__ */ w(W, { ...f })
  ] });
};
export {
  K as ArchitectureDraw,
  C as DEFAULT_DIAGRAM_EMBED_URL,
  J as DEFAULT_YAPPYDRAW_EMBED_URL,
  W as DiagramCanvas
};
//# sourceMappingURL=index155.js.map
