import { getChartKind as k, selectionAt as F, buildChartOption as L } from "./index184.js";
const R = ["#2a78d6", "#eb6834", "#1baf7a", "#eda100", "#e87ba4", "#008300", "#6250d6", "#e34948"];
function S(e) {
  const n = getComputedStyle(e), t = (u, o) => n.getPropertyValue(u).trim() || o, l = t("--zen-color-foreground", "#343434");
  return {
    palette: R.map((u, o) => t(`--zen-chart-${o + 1}`, u)),
    foreground: l,
    muted: t("--zen-color-muted-fg", l),
    border: t("--zen-color-border", "#D5D5D5"),
    background: t("--zen-color-background", "#ffffff"),
    surface: t("--zen-color-muted", "#F5F5F5"),
    positive: t("--zen-chart-positive", t("--zen-color-success", "#1A7A1E")),
    negative: t("--zen-chart-negative", t("--zen-color-error", "#CE1010")),
    fontFamily: t("--zen-font-sans", n.fontFamily)
  };
}
let y;
const p = /* @__PURE__ */ new Set();
function x() {
  return y ??= Promise.all([
    import("echarts/core"),
    import("echarts/components").then(({ TooltipComponent: e, LegendComponent: n, AriaComponent: t }) => [
      e,
      n,
      t
    ]),
    import("echarts/renderers").then(({ SVGRenderer: e, CanvasRenderer: n }) => [e, n])
  ]).then(([e, n, t]) => (e.use([...n, ...t]), e)).catch((e) => {
    throw y = void 0, e;
  }), y;
}
async function D(e, n = {}) {
  const t = await x(), l = n.selectable ?? (() => n.onSelect !== void 0), u = n.renderer ?? "svg";
  let o, b = /* @__PURE__ */ new Set(), g = !1, h, w = 0;
  const v = () => {
    if (g || !h) return;
    const { spec: r, base: s, extra: c } = h, i = {
      ...s,
      theme: S(e),
      rtl: getComputedStyle(e).direction === "rtl",
      width: e.clientWidth || void 0
    }, a = L(r, i, c), m = l() ? "pointer" : "default", f = Array.isArray(a.series) ? a.series : a.series ? [a.series] : [];
    a.series = f.map((d) => ({ cursor: m, ...d })), o?.setOption(a, { notMerge: !0 });
  }, z = () => {
    cancelAnimationFrame(w), w = requestAnimationFrame(v);
  }, E = () => {
    o?.dispose(), o = t.init(e, void 0, { renderer: u }), b = new Set(p), o.on("click", (s) => {
      if (!n.onSelect || !l() || !h || s.seriesId?.startsWith("__")) return;
      const c = F(h.spec, s.dataIndex, s.seriesId);
      c && n.onSelect(c);
    });
    const r = o.getZr();
    r.on("mousemove", () => {
      l() || r.setCursorStyle("default");
    });
  }, C = new ResizeObserver(() => {
    g || (o?.resize(), z());
  });
  C.observe(e);
  const A = new MutationObserver(z);
  for (let r = e; r; r = r.parentElement)
    A.observe(r, { attributes: !0, attributeFilter: ["data-theme", "dir", "class", "style"] });
  return {
    async render(r, s, c) {
      const i = k(r.type);
      if (!i) throw new Error(`AnalyticChart: unknown type "${r.type}".`);
      p.has(i.id) || (t.use(await i.modules()), p.add(i.id)), !g && ((!o || !b.has(i.id)) && E(), h = { spec: r, base: s, extra: c }, v());
    },
    async toPng() {
      if (!o) throw new Error("AnalyticChart: nothing drawn yet");
      const r = S(e).background;
      if (u === "canvas") return o.getDataURL({ type: "png", pixelRatio: 2, backgroundColor: r });
      const s = e.querySelector("svg");
      if (!s) throw new Error("AnalyticChart: nothing drawn yet");
      const c = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(s)], { type: "image/svg+xml" })), i = new Image();
      i.src = c;
      try {
        await i.decode();
      } finally {
        URL.revokeObjectURL(c);
      }
      const a = document.createElement("canvas"), m = e.clientWidth, f = e.clientHeight;
      a.width = m * 2, a.height = f * 2;
      const d = a.getContext("2d");
      if (!d) throw new Error("AnalyticChart: no 2D canvas to export with");
      return d.scale(2, 2), d.fillStyle = r, d.fillRect(0, 0, m, f), d.drawImage(i, 0, 0, m, f), a.toDataURL("image/png");
    },
    dispose() {
      g = !0, cancelAnimationFrame(w), C.disconnect(), A.disconnect(), o?.dispose();
    }
  };
}
export {
  D as createChartController,
  S as readChartTheme
};
//# sourceMappingURL=index261.js.map
