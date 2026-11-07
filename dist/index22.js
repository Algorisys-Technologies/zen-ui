import { jsx as c, jsxs as $ } from "react/jsx-runtime";
import * as v from "react";
import { encodeBarcode as C, encodeQr as w, qrPath as E } from "./index169.js";
import { useLocale as b } from "./index90.js";
import { cn as x } from "./index160.js";
const B = ({ value: s, ecc: r, size: t = 128, quietZone: o = 4, minVersion: n, label: a, className: i }) => {
  const l = b(), e = v.useMemo(() => w(s, { ecc: r, minVersion: n }), [s, r, n]);
  if (!e.ok)
    return /* @__PURE__ */ c(k, { size: `${t}px`, message: e, what: l.t("barcode.qrCode"), className: i });
  const d = e.size + o * 2;
  return /* @__PURE__ */ $(
    "svg",
    {
      role: "img",
      "aria-label": a ?? l.t("barcode.qrCode"),
      "data-version": e.version,
      "data-ecc": e.ecc,
      width: t,
      height: t,
      viewBox: `0 0 ${d} ${d}`,
      shapeRendering: "crispEdges",
      className: x("zen-block zen-shrink-0", i),
      children: [
        /* @__PURE__ */ c("rect", { width: d, height: d, fill: "var(--zen-code-light)" }),
        /* @__PURE__ */ c("path", { d: E(e.modules, o), fill: "var(--zen-code-dark)" })
      ]
    }
  );
}, p = { code128: "Code 128", ean13: "EAN-13", code39: "Code 39" }, j = ({
  value: s,
  format: r = "code128",
  height: t = 64,
  moduleWidth: o = 2,
  showText: n = !0,
  quietZone: a = 10,
  label: i,
  className: l
}) => {
  const e = v.useMemo(() => C(s, r), [s, r]);
  if (!e.ok)
    return /* @__PURE__ */ c(k, { size: `${t}px`, message: e, what: p[r], className: l });
  const d = Math.max(10, o * 6), h = (e.length + a * 2) * o, z = t + (n ? d + o * 2 : 0);
  let g = a, f = "";
  return e.widths.forEach((m, u) => {
    u % 2 === 0 && (f += `M${g * o} 0h${m * o}v${t}h${-m * o}z`), g += m;
  }), /* @__PURE__ */ $(
    "svg",
    {
      role: "img",
      "aria-label": i ?? `${p[r]} ${e.text}`,
      width: h,
      height: z,
      viewBox: `0 0 ${h} ${z}`,
      shapeRendering: "crispEdges",
      className: x("zen-block zen-shrink-0", l),
      children: [
        /* @__PURE__ */ c("rect", { width: h, height: z, fill: "var(--zen-code-light)" }),
        /* @__PURE__ */ c("path", { d: f, fill: "var(--zen-code-dark)" }),
        n && /* @__PURE__ */ c(
          "text",
          {
            x: h / 2,
            y: t + o + d,
            textAnchor: "middle",
            fontSize: String(d),
            fontFamily: "var(--zen-font-mono)",
            fill: "var(--zen-code-dark)",
            "aria-hidden": "true",
            children: e.text
          }
        )
      ]
    }
  );
}, k = ({
  size: s,
  message: r,
  what: t,
  className: o
}) => {
  const n = b(), a = r.code ? n.t(`barcode.error.${r.code}`, r.values) : r.error, i = n.t("barcode.noCode", { what: t, message: a });
  return /* @__PURE__ */ c(
    "span",
    {
      role: "img",
      "aria-label": i,
      title: a,
      style: { minHeight: s },
      className: x(
        "zen-inline-flex zen-max-w-full zen-items-center zen-justify-center zen-rounded-zen-sm zen-border zen-border-dashed zen-border-zen-error zen-p-2 zen-text-center zen-text-xs zen-text-zen-error",
        o
      ),
      children: i
    }
  );
};
export {
  j as Barcode,
  B as QRCode
};
//# sourceMappingURL=index22.js.map
