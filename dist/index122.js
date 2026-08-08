import { jsx as x, jsxs as $ } from "react/jsx-runtime";
import "react";
import { cn as z } from "./index143.js";
const C = {
  primary: "zen-text-zen-primary",
  success: "zen-text-zen-success",
  warning: "zen-text-zen-warning",
  error: "zen-text-zen-error",
  info: "zen-text-zen-info",
  muted: "zen-text-zen-muted-fg"
}, h = ({
  width: r,
  height: n,
  color: e,
  label: t,
  className: o,
  children: s
}) => /* @__PURE__ */ x(
  "svg",
  {
    role: "img",
    "aria-label": t,
    width: r,
    height: n,
    viewBox: `0 0 ${r} ${n}`,
    className: z("zen-inline-block zen-align-middle", C[e], o),
    children: s
  }
), y = (r) => {
  const n = Math.min(...r), t = Math.max(...r) - n;
  return r.map((o) => t === 0 ? 0.5 : (o - n) / t);
}, b = (r) => {
  if (r.length < 2) return "flat";
  const n = r[0], e = r[r.length - 1];
  return e > n ? "rising" : e < n ? "falling" : "flat";
}, j = ({
  values: r,
  area: n,
  width: e = 80,
  height: t = 24,
  color: o = "primary",
  label: s,
  className: m
}) => {
  const c = r ?? [];
  if (c.length === 0) return null;
  const l = 2, p = y(c), i = e - l * 2, a = t - l * 2, d = c.length === 1 ? 0 : i / (c.length - 1), u = p.map((f, M) => [l + M * d, l + (1 - f) * a]);
  return /* @__PURE__ */ $(
    h,
    {
      width: e,
      height: t,
      color: o,
      label: s ?? `Line chart, ${c.length} points, ${b(c)}`,
      className: m,
      children: [
        n && /* @__PURE__ */ x(
          "polygon",
          {
            points: [
              `${u[0][0]},${t - l}`,
              ...u.map(([f, M]) => `${f},${M}`),
              `${u[u.length - 1][0]},${t - l}`
            ].join(" "),
            fill: "currentColor",
            opacity: "0.15"
          }
        ),
        /* @__PURE__ */ x(
          "polyline",
          {
            points: u.map(([f, M]) => `${f},${M}`).join(" "),
            fill: "none",
            stroke: "currentColor",
            strokeWidth: "1.5",
            strokeLinecap: "round",
            strokeLinejoin: "round"
          }
        )
      ]
    }
  );
}, v = ({
  values: r,
  width: n = 80,
  height: e = 24,
  color: t = "primary",
  label: o,
  className: s
}) => {
  const m = r ?? [];
  if (m.length === 0) return null;
  const c = 2, l = y(m), p = Math.max(1, (n - c * (m.length - 1)) / m.length), i = l.map((a, d) => {
    const u = Math.max(2, a * e);
    return { x: d * (p + c), y: e - u, w: p, h: u };
  });
  return /* @__PURE__ */ x(
    h,
    {
      width: n,
      height: e,
      color: t,
      label: o ?? `Bar chart, ${m.length} bars`,
      className: s,
      children: i.map((a, d) => /* @__PURE__ */ x("rect", { x: a.x, y: a.y, width: a.w, height: a.h, fill: "currentColor", rx: "1" }, d))
    }
  );
}, B = ({
  value: r,
  target: n,
  min: e = 0,
  max: t = 100,
  width: o = 80,
  height: s = 12,
  color: m = "primary",
  label: c,
  className: l
}) => {
  const p = (i) => {
    const a = t - e;
    return a === 0 ? 0 : Math.min(1, Math.max(0, (i - e) / a));
  };
  return /* @__PURE__ */ $(
    h,
    {
      width: o,
      height: s,
      color: m,
      label: c ?? `${r} of ${t}` + (n !== void 0 ? `, target ${n}` : ""),
      className: l,
      children: [
        /* @__PURE__ */ x(
          "rect",
          {
            x: "0",
            y: s / 2 - 3,
            width: o,
            height: "6",
            rx: "3",
            fill: "var(--zen-color-muted)"
          }
        ),
        /* @__PURE__ */ x(
          "rect",
          {
            x: "0",
            y: s / 2 - 3,
            width: p(r) * o,
            height: "6",
            rx: "3",
            fill: "currentColor"
          }
        ),
        n !== void 0 && /* A tick, not a second bar: the target is a line you crossed or did
        not, and drawing it as a bar invites reading it as a quantity. */
        /* @__PURE__ */ x(
          "rect",
          {
            x: Math.min(o - 2, p(n) * o),
            y: "0",
            width: "2",
            height: s,
            fill: "var(--zen-color-foreground)"
          }
        )
      ]
    }
  );
}, W = ({
  from: r,
  to: n,
  width: e = 80,
  height: t = 24,
  color: o,
  label: s,
  className: m
}) => {
  const c = n - r, l = o ?? (c > 0 ? "success" : c < 0 ? "error" : "muted"), p = Math.max(Math.abs(r), Math.abs(n), 1), i = (d) => Math.max(2, Math.abs(d) / p * (t - 6)), a = (e - 8) / 2;
  return /* @__PURE__ */ $(
    h,
    {
      width: e,
      height: t,
      color: l,
      label: s ?? `${r} to ${n}, ${c > 0 ? "up" : c < 0 ? "down" : "unchanged"} ${Math.abs(c)}`,
      className: m,
      children: [
        /* @__PURE__ */ x(
          "rect",
          {
            x: "0",
            y: t - i(r),
            width: a,
            height: i(r),
            rx: "1",
            fill: "var(--zen-color-muted-fg)",
            opacity: "0.5"
          }
        ),
        /* @__PURE__ */ x(
          "rect",
          {
            x: a + 8,
            y: t - i(n),
            width: a,
            height: i(n),
            rx: "1",
            fill: "currentColor"
          }
        )
      ]
    }
  );
}, S = ({
  value: r,
  max: n = 100,
  showValue: e,
  width: t = 40,
  height: o = 40,
  color: s = "primary",
  label: m,
  className: c
}) => {
  const l = n === 0 ? 0 : Math.min(1, Math.max(0, r / n)), p = Math.min(t, o), i = p / 2 - 3, a = 2 * Math.PI * i;
  return /* @__PURE__ */ $(
    h,
    {
      width: t,
      height: o,
      color: s,
      label: m ?? `${Math.round(l * 100)} percent`,
      className: c,
      children: [
        /* @__PURE__ */ $("g", { transform: `rotate(-90 ${t / 2} ${o / 2})`, children: [
          /* @__PURE__ */ x(
            "circle",
            {
              cx: t / 2,
              cy: o / 2,
              r: i,
              fill: "none",
              strokeWidth: "3",
              stroke: "var(--zen-color-muted)"
            }
          ),
          /* @__PURE__ */ x(
            "circle",
            {
              cx: t / 2,
              cy: o / 2,
              r: i,
              fill: "none",
              stroke: "currentColor",
              strokeWidth: "3",
              strokeLinecap: "round",
              strokeDasharray: `${a * l} ${a}`
            }
          )
        ] }),
        e && p >= 32 && /* @__PURE__ */ x(
          "text",
          {
            x: t / 2,
            y: o / 2,
            textAnchor: "middle",
            dominantBaseline: "central",
            fontSize: Math.round(p / 3.5),
            fill: "currentColor",
            children: Math.round(l * 100)
          }
        )
      ]
    }
  );
};
export {
  v as MicroBarChart,
  B as MicroBulletChart,
  W as MicroDeltaChart,
  j as MicroLineChart,
  S as MicroRadialChart
};
//# sourceMappingURL=index122.js.map
