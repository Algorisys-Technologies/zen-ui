import { jsx as t, jsxs as b } from "react/jsx-runtime";
import * as l from "react";
import { cn as i } from "./index145.js";
const h = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", T = "&copy; OpenStreetMap contributors", L = ({
  center: a,
  zoom: p = 13,
  markers: c = [],
  height: r = 320,
  tileUrl: d = h,
  attribution: m = T,
  className: o
}) => {
  const [s, u] = l.useState(null);
  if (l.useEffect(() => {
    let e = !0;
    return import("react-leaflet").then((n) => {
      e && u(n);
    }).catch(() => {
    }), () => {
      e = !1;
    };
  }, []), !s)
    return /* @__PURE__ */ t(
      "div",
      {
        className: i(
          "zen-flex zen-items-center zen-justify-center zen-rounded-zen-md zen-border zen-border-zen-border zen-text-sm zen-text-zen-muted-fg",
          o
        ),
        style: { height: r },
        children: "Loading map…"
      }
    );
  const { MapContainer: z, TileLayer: f, Marker: x, Popup: y } = s;
  return /* @__PURE__ */ b(
    z,
    {
      center: a,
      zoom: p,
      className: i("zen-rounded-zen-md", o),
      style: { height: r, width: "100%" },
      children: [
        /* @__PURE__ */ t(f, { url: d, attribution: m }),
        c.map((e, n) => /* @__PURE__ */ t(x, { position: e.position, children: e.label ? /* @__PURE__ */ t(y, { children: e.label }) : null }, n))
      ]
    }
  );
};
L.displayName = "Map";
export {
  L as Map
};
//# sourceMappingURL=index135.js.map
