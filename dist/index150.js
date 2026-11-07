import { jsx as t, jsxs as h } from "react/jsx-runtime";
import * as l from "react";
import { useLocale as T } from "./index90.js";
import { cn as i } from "./index160.js";
const L = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", M = "&copy; OpenStreetMap contributors", E = ({
  center: a,
  zoom: p = 13,
  markers: c = [],
  height: r = 320,
  tileUrl: d = L,
  attribution: m = M,
  className: o
}) => {
  const u = T(), [s, z] = l.useState(null);
  if (l.useEffect(() => {
    let e = !0;
    return import("react-leaflet").then((n) => {
      e && z(n);
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
        children: u.t("map.loading")
      }
    );
  const { MapContainer: f, TileLayer: x, Marker: y, Popup: b } = s;
  return /* @__PURE__ */ h(
    f,
    {
      center: a,
      zoom: p,
      className: i("zen-rounded-zen-md", o),
      style: { height: r, width: "100%" },
      children: [
        /* @__PURE__ */ t(x, { url: d, attribution: m }),
        c.map((e, n) => /* @__PURE__ */ t(y, { position: e.position, children: e.label ? /* @__PURE__ */ t(b, { children: e.label }) : null }, n))
      ]
    }
  );
};
E.displayName = "Map";
export {
  E as Map
};
//# sourceMappingURL=index150.js.map
