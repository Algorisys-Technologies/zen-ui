import { render as w, createComponent as z, template as p, insert as M, effect as h, className as g, setStyleProperty as f, setAttribute as E, use as A } from "solid-js/web";
import { mergeProps as U, createSignal as y, onMount as P, onCleanup as C, createEffect as b, on as D, Show as k } from "solid-js";
import { cn as L } from "./index103.js";
var F = /* @__PURE__ */ p("<span><code>leaflet</code> is not installed. Run <code>npm install leaflet</code> and import <code>leaflet/dist/leaflet.css</code> to use <code>&lt;Map&gt;</code>."), R = /* @__PURE__ */ p("<div>"), _ = /* @__PURE__ */ p("<div style=width:100%>");
const j = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", q = "&copy; OpenStreetMap contributors", x = (i) => typeof i == "number" ? `${i}px` : i, V = (i) => {
  const n = U({
    zoom: 13,
    markers: [],
    height: 320,
    tileUrl: j,
    attribution: q
  }, i), [s, m] = y("loading"), [S, T] = y(null);
  let c, o = null, u = [];
  const v = () => {
    for (const e of u)
      e.dispose?.(), e.layer.remove();
    u = [];
  };
  return P(async () => {
    let e;
    try {
      e = await import("leaflet");
    } catch {
      m("failed");
      return;
    }
    const t = e?.default ?? e;
    if (!c || typeof t?.map != "function") {
      m("failed");
      return;
    }
    o = t.map(c, {
      center: n.center,
      zoom: n.zoom
    }), t.tileLayer(n.tileUrl, {
      attribution: n.attribution
    }).addTo(o), T(() => t), m("ready"), queueMicrotask(() => o?.invalidateSize());
  }), C(() => {
    v(), o?.remove(), o = null;
  }), b(D(() => [n.center[0], n.center[1], n.zoom], ([e, t, r]) => {
    o && o.setView([e, t], r);
  }, {
    defer: !0
  })), b(() => {
    const e = S(), t = n.markers;
    if (!(!e || !o)) {
      v();
      for (const r of t) {
        const a = e.marker(r.position).addTo(o);
        let l;
        if (r.label !== void 0 && r.label !== null) {
          const d = document.createElement("div");
          l = w(() => r.label, d), a.bindPopup(d);
        }
        u.push({
          layer: a,
          dispose: l
        });
      }
    }
  }), [z(k, {
    get when() {
      return s() !== "ready";
    },
    get children() {
      var e = R();
      return M(e, z(k, {
        get when() {
          return s() === "failed";
        },
        fallback: "Loading map…",
        get children() {
          return F();
        }
      })), h((t) => {
        var r = L("zen-flex zen-items-center zen-justify-center zen-rounded-zen-md zen-border zen-border-zen-border zen-p-4 zen-text-center zen-text-sm", s() === "failed" ? "zen-text-zen-error" : "zen-text-zen-muted-fg", n.class), a = x(n.height), l = s() === "failed" ? "alert" : void 0;
        return r !== t.e && g(e, t.e = r), a !== t.t && f(e, "height", t.t = a), l !== t.a && E(e, "role", t.a = l), t;
      }, {
        e: void 0,
        t: void 0,
        a: void 0
      }), e;
    }
  }), (() => {
    var e = _(), t = c;
    return typeof t == "function" ? A(t, e) : c = e, h((r) => {
      var a = L("zen-rounded-zen-md", n.class), l = x(n.height), d = s() === "ready" ? void 0 : "none";
      return a !== r.e && g(e, r.e = a), l !== r.t && f(e, "height", r.t = l), d !== r.a && f(e, "display", r.a = d), r;
    }, {
      e: void 0,
      t: void 0,
      a: void 0
    }), e;
  })()];
};
export {
  V as Map
};
//# sourceMappingURL=index100.js.map
