const M = 0.25, d = 8;
const h = /* @__PURE__ */ new Set([
  "png",
  "jpg",
  "jpeg",
  "gif",
  "webp",
  "avif",
  "bmp",
  "svg",
  "tif",
  "tiff",
  "ico"
]), f = (t) => {
  const n = t.split(";")[0].trim().toLowerCase();
  return n === "application/pdf" ? "pdf" : n.startsWith("image/") ? "image" : "unknown";
}, l = (t, n) => {
  if (n) return f(n);
  if (!t) return "unknown";
  if (t.startsWith("data:")) {
    const i = t.slice(5), c = Math.min(
      ...[i.indexOf(";"), i.indexOf(",")].filter((a) => a >= 0).concat(i.length)
    );
    return f(i.slice(0, c));
  }
  const e = t.split("#")[0].split("?")[0], s = e.slice(e.lastIndexOf("/") + 1), r = s.lastIndexOf(".");
  if (r <= 0) return "unknown";
  const o = s.slice(r + 1).toLowerCase();
  return o === "pdf" ? "pdf" : h.has(o) ? "image" : "unknown";
}, u = (t) => Number.isNaN(t) ? 1 : Math.min(8, Math.max(0.25, t)), m = (t, n) => {
  const e = n >= 0 ? t * 1.25 : t / 1.25;
  return u(Math.round(e * 1e4) / 1e4);
}, O = (t) => Number.isFinite(t) ? (Math.floor(t / 90) * 90 % 360 + 360) % 360 : 0, p = (t, n, e, s = 0) => {
  const r = O(s) % 180 !== 0, o = r ? t.height : t.width, i = r ? t.width : t.height;
  if (o <= 0 || i <= 0 || n.width <= 0 || n.height <= 0) return 1;
  const c = n.width / o, a = e === "width" ? c : Math.min(c, n.height / i);
  return Math.min(1, a);
};
export {
  d as DOCUMENT_ZOOM_MAX,
  M as DOCUMENT_ZOOM_MIN,
  u as clampZoom,
  p as fitScale,
  l as inferDocumentKind,
  O as normalizeRotation,
  m as zoomStep
};
//# sourceMappingURL=index116.js.map
