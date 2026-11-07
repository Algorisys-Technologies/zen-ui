import { jsx as u, jsxs as C } from "react/jsx-runtime";
import "react";
import { useLocale as y } from "./index90.js";
import { cn as g } from "./index160.js";
const L = {
  primary: "zen-text-zen-primary",
  success: "zen-text-zen-success",
  warning: "zen-text-zen-warning",
  error: "zen-text-zen-error",
  info: "zen-text-zen-info",
  muted: "zen-text-zen-muted-fg"
}, z = ({
  width: r,
  height: t,
  color: e,
  label: n,
  className: c,
  children: m
}) => /* @__PURE__ */ u(
  "svg",
  {
    role: "img",
    "aria-label": n,
    width: r,
    height: t,
    viewBox: `0 0 ${r} ${t}`,
    className: g("zen-inline-block zen-align-middle", L[e], c),
    children: m
  }
), $ = (r) => {
  const t = Math.min(...r), n = Math.max(...r) - t;
  return r.map((c) => n === 0 ? 0.5 : (c - t) / n);
}, j = (r) => {
  if (r.length < 2) return "flat";
  const t = r[0], e = r[r.length - 1];
  return e > t ? "rising" : e < t ? "falling" : "flat";
}, A = ({
  values: r,
  area: t,
  width: e = 80,
  height: n = 24,
  color: c = "primary",
  label: m,
  className: d
}) => {
  const p = y(), o = r ?? [];
  if (o.length === 0) return null;
  const l = 2, i = $(o), s = e - l * 2, a = n - l * 2, M = o.length === 1 ? 0 : s / (o.length - 1), h = i.map((x, f) => [l + f * M, l + (1 - x) * a]);
  return /* @__PURE__ */ C(
    z,
    {
      width: e,
      height: n,
      color: c,
      label: m ?? p.t("microChart.line", { count: o.length, trend: p.t(`microChart.${j(o)}`) }),
      className: d,
      children: [
        t && /* @__PURE__ */ u(
          "polygon",
          {
            points: [
              `${h[0][0]},${n - l}`,
              ...h.map(([x, f]) => `${x},${f}`),
              `${h[h.length - 1][0]},${n - l}`
            ].join(" "),
            fill: "currentColor",
            opacity: "0.15"
          }
        ),
        /* @__PURE__ */ u(
          "polyline",
          {
            points: h.map(([x, f]) => `${x},${f}`).join(" "),
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
}, D = ({
  values: r,
  width: t = 80,
  height: e = 24,
  color: n = "primary",
  label: c,
  baseline: m,
  className: d
}) => {
  const p = y(), o = r ?? [];
  if (o.length === 0) return null;
  const l = 2, i = Math.max(1, (t - l * (o.length - 1)) / o.length);
  let s;
  if (m === "zero") {
    const a = Math.max(0, ...o), M = Math.min(0, ...o), h = a - M || 1, x = a / h * e;
    s = o.map((f, k) => {
      const b = Math.max(f === 0 ? 0 : 2, Math.abs(f) / h * e);
      return { x: k * (i + l), y: f >= 0 ? x - b : x, w: i, h: b };
    });
  } else
    s = $(o).map((M, h) => {
      const x = Math.max(2, M * e);
      return { x: h * (i + l), y: e - x, w: i, h: x };
    });
  return /* @__PURE__ */ u(
    z,
    {
      width: t,
      height: e,
      color: n,
      label: c ?? p.t("microChart.bar", { count: o.length }),
      className: d,
      children: s.map((a, M) => /* @__PURE__ */ u("rect", { x: a.x, y: a.y, width: a.w, height: a.h, fill: "currentColor", rx: "1" }, M))
    }
  );
}, O = ({
  value: r,
  target: t,
  min: e = 0,
  max: n = 100,
  width: c = 80,
  height: m = 12,
  color: d = "primary",
  label: p,
  className: o
}) => {
  const l = y(), i = (s) => {
    const a = n - e;
    return a === 0 ? 0 : Math.min(1, Math.max(0, (s - e) / a));
  };
  return /* @__PURE__ */ C(
    z,
    {
      width: c,
      height: m,
      color: d,
      label: p ?? (t !== void 0 ? l.t("microChart.bulletTarget", { value: r, max: n, target: t }) : l.t("microChart.bullet", { value: r, max: n })),
      className: o,
      children: [
        /* @__PURE__ */ u(
          "rect",
          {
            x: "0",
            y: m / 2 - 3,
            width: c,
            height: "6",
            rx: "3",
            fill: "var(--zen-color-muted)"
          }
        ),
        /* @__PURE__ */ u(
          "rect",
          {
            x: "0",
            y: m / 2 - 3,
            width: i(r) * c,
            height: "6",
            rx: "3",
            fill: "currentColor"
          }
        ),
        t !== void 0 && /* A tick, not a second bar: the target is a line you crossed or did
        not, and drawing it as a bar invites reading it as a quantity. */
        /* @__PURE__ */ u(
          "rect",
          {
            x: Math.min(c - 2, i(t) * c),
            y: "0",
            width: "2",
            height: m,
            fill: "var(--zen-color-foreground)"
          }
        )
      ]
    }
  );
}, R = ({
  from: r,
  to: t,
  width: e = 80,
  height: n = 24,
  color: c,
  label: m,
  className: d
}) => {
  const p = y(), o = t - r, l = c ?? (o > 0 ? "success" : o < 0 ? "error" : "muted"), i = Math.max(Math.abs(r), Math.abs(t), 1), s = (M) => Math.max(2, Math.abs(M) / i * (n - 6)), a = (e - 8) / 2;
  return /* @__PURE__ */ C(
    z,
    {
      width: e,
      height: n,
      color: l,
      label: m ?? p.t("microChart.delta", {
        from: r,
        to: t,
        direction: p.t(o > 0 ? "microChart.up" : o < 0 ? "microChart.down" : "microChart.unchanged"),
        amount: Math.abs(o)
      }),
      className: d,
      children: [
        /* @__PURE__ */ u(
          "rect",
          {
            x: "0",
            y: n - s(r),
            width: a,
            height: s(r),
            rx: "1",
            fill: "var(--zen-color-muted-fg)",
            opacity: "0.5"
          }
        ),
        /* @__PURE__ */ u(
          "rect",
          {
            x: a + 8,
            y: n - s(t),
            width: a,
            height: s(t),
            rx: "1",
            fill: "currentColor"
          }
        )
      ]
    }
  );
}, w = ({
  value: r,
  max: t = 100,
  showValue: e,
  width: n = 40,
  height: c = 40,
  color: m = "primary",
  label: d,
  className: p
}) => {
  const o = y(), l = t === 0 ? 0 : Math.min(1, Math.max(0, r / t)), i = Math.min(n, c), s = i / 2 - 3, a = 2 * Math.PI * s;
  return /* @__PURE__ */ C(
    z,
    {
      width: n,
      height: c,
      color: m,
      label: d ?? o.t("microChart.percent", { value: Math.round(l * 100) }),
      className: p,
      children: [
        /* @__PURE__ */ C("g", { transform: `rotate(-90 ${n / 2} ${c / 2})`, children: [
          /* @__PURE__ */ u(
            "circle",
            {
              cx: n / 2,
              cy: c / 2,
              r: s,
              fill: "none",
              strokeWidth: "3",
              stroke: "var(--zen-color-muted)"
            }
          ),
          /* @__PURE__ */ u(
            "circle",
            {
              cx: n / 2,
              cy: c / 2,
              r: s,
              fill: "none",
              stroke: "currentColor",
              strokeWidth: "3",
              strokeLinecap: "round",
              strokeDasharray: `${a * l} ${a}`
            }
          )
        ] }),
        e && i >= 32 && /* @__PURE__ */ u(
          "text",
          {
            x: n / 2,
            y: c / 2,
            textAnchor: "middle",
            dominantBaseline: "central",
            fontSize: Math.round(i / 3.5),
            fill: "currentColor",
            children: Math.round(l * 100)
          }
        )
      ]
    }
  );
};
export {
  D as MicroBarChart,
  O as MicroBulletChart,
  R as MicroDeltaChart,
  A as MicroLineChart,
  w as MicroRadialChart
};
//# sourceMappingURL=index135.js.map
