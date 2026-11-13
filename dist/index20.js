import { jsxs as A, jsx as c, Fragment as ie } from "react/jsx-runtime";
import * as k from "react";
import { useLocale as se } from "./index90.js";
import { cn as C } from "./index197.js";
const E = { h: null, m: null, s: null }, h = (r) => r.toString().padStart(2, "0"), Y = (r, o) => {
  if (!r) return E;
  const l = /^(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?$/.exec(r.trim());
  if (!l) return E;
  const a = Number(l[1]), i = Number(l[2]), z = l[3] !== void 0 ? Number(l[3]) : 0;
  return a < 0 || a > 23 || i < 0 || i > 59 || z < 0 || z > 59 ? E : { h: a, m: i, s: o ? z : 0 };
}, q = (r, o) => {
  if (!(r.h === null || r.m === null) && !(o && r.s === null))
    return o ? `${h(r.h)}:${h(r.m)}:${h(r.s ?? 0)}` : `${h(r.h)}:${h(r.m)}`;
}, T = (r) => r === null || r < 12 ? "AM" : "PM", G = (r) => {
  if (r === null) return null;
  const o = r % 12;
  return o === 0 ? 12 : o;
}, J = (r, o) => {
  const l = r % 12;
  return o === "PM" ? l + 12 : l;
}, oe = k.forwardRef(
  ({
    value: r,
    defaultValue: o,
    onValueChange: l,
    format: a = "24h",
    showSeconds: i = !1,
    minuteStep: z = 1,
    disabled: f,
    readOnly: P,
    name: j,
    id: Q,
    className: X,
    "aria-label": Z,
    "aria-labelledby": _
  }, V) => {
    const u = se(), M = r !== void 0, [O, S] = k.useState(
      () => Y(o, i)
    ), t = M ? Y(r, i) : O, N = k.useCallback(
      (e) => {
        M || S(e), l?.(q(e, i));
      },
      [M, l, i]
    ), m = k.useRef({
      key: null,
      chars: ""
    }), v = k.useRef({}), y = (e) => {
      const n = v.current[e];
      n && n.focus();
    }, U = (e) => {
      e === "h" ? y("m") : e === "m" ? y(i ? "s" : a === "12h" ? "p" : "m") : e === "s" && y(a === "12h" ? "p" : "s");
    }, F = (e, n) => {
      const p = { ...t, [e]: n };
      N(p);
    }, R = (e) => {
      if (t.h === null) {
        N({ ...t, h: e === "AM" ? 0 : 12 });
        return;
      }
      const n = G(t.h) ?? 12;
      N({ ...t, h: J(n, e) });
    }, B = (e) => e === "h" ? a === "12h" ? 12 : 23 : 59, H = (e) => e === "h" && a === "12h" ? 1 : 0, b = a === "12h" ? G(t.h) : t.h, $ = (e, n) => {
      if (f || P) return;
      const p = B(n), x = H(n), re = n === "m" ? z : 1, W = n === "h" ? b : t[n], L = (d) => {
        const s = Math.min(Math.max(d, x), p);
        n === "h" && a === "12h" ? F("h", J(s === 0 ? 12 : s, T(t.h))) : F(n, s);
      };
      if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        e.preventDefault(), m.current = { key: n, chars: "" };
        const d = e.key === "ArrowUp" ? 1 : -1;
        if (W === null)
          L(d > 0 ? x : p);
        else {
          const s = p - x + 1, g = ((W - x + d * re) % s + s) % s + x;
          L(g);
        }
        return;
      }
      if (e.key === "ArrowRight") {
        e.preventDefault(), m.current = { key: null, chars: "" }, U(n);
        return;
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault(), m.current = { key: null, chars: "" }, n === "m" ? y("h") : n === "s" && y("m");
        return;
      }
      if (e.key === "Backspace" || e.key === "Delete") {
        e.preventDefault(), m.current = { key: n, chars: "" }, F(n, null);
        return;
      }
      if (/^[0-9]$/.test(e.key)) {
        e.preventDefault();
        const d = m.current.key === n ? m.current.chars + e.key : e.key, s = d.length > 2 ? d.slice(-2) : d, g = Number(s);
        Number.isFinite(g) && L(g), m.current = { key: n, chars: s };
        const te = s.length === 1 && g * 10 > p;
        (s.length === 2 || te) && (m.current = { key: null, chars: "" }, U(n));
      }
    }, ee = (e) => {
      if (!(f || P)) {
        if (e.key === "ArrowUp" || e.key === "ArrowDown" || e.key === " " || e.key === "Enter") {
          e.preventDefault(), R(T(t.h) === "AM" ? "PM" : "AM");
          return;
        }
        if (e.key === "a" || e.key === "A") {
          e.preventDefault(), R("AM");
          return;
        }
        if (e.key === "p" || e.key === "P") {
          e.preventDefault(), R("PM");
          return;
        }
        e.key === "ArrowLeft" && (e.preventDefault(), y(i ? "s" : "m"));
      }
    }, I = (e) => {
      const n = e === "h" ? b : t[e];
      return n === null ? "––" : h(n);
    }, ne = t.h === null && t.m === null, K = T(t.h), w = (e) => {
      const n = e === "p" ? K : e === "h" ? b : t[e];
      return C(
        "zen-px-1 zen-tabular-nums zen-rounded-zen-sm zen-select-none",
        "focus:zen-outline-none focus-visible:zen-bg-zen-primary-soft focus-visible:zen-text-zen-primary",
        (e === "p" ? ne : n === null) && "zen-text-zen-muted-fg"
      );
    }, D = (e) => () => {
      m.current = { key: e === "p" ? null : e, chars: "" };
    };
    return /* @__PURE__ */ A(
      "div",
      {
        ref: V,
        id: Q,
        role: "group",
        "aria-label": Z ?? u.t("timePicker.label"),
        "aria-labelledby": _,
        "aria-disabled": f || void 0,
        "aria-readonly": P || void 0,
        className: C(
          "zen-inline-flex zen-h-10 zen-items-center zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-background zen-px-3 zen-text-sm",
          "focus-within:zen-ring-2 focus-within:zen-ring-zen-ring focus-within:zen-border-zen-primary",
          f && "zen-opacity-50 zen-cursor-not-allowed zen-pointer-events-none",
          P && "zen-bg-zen-muted",
          X
        ),
        children: [
          /* @__PURE__ */ c(le, {}),
          /* @__PURE__ */ A(
            "div",
            {
              dir: "ltr",
              className: "zen-ml-2 zen-flex zen-items-center zen-gap-0.5 zen-text-zen-foreground",
              children: [
                /* @__PURE__ */ c(
                  "div",
                  {
                    ref: (e) => {
                      v.current.h = e;
                    },
                    tabIndex: f ? -1 : 0,
                    role: "spinbutton",
                    "aria-label": u.t("timePicker.hours"),
                    "aria-valuemin": H("h"),
                    "aria-valuemax": B("h"),
                    "aria-valuenow": b ?? void 0,
                    "aria-valuetext": t.h === null ? "empty" : h(b ?? 0),
                    onKeyDown: (e) => $(e, "h"),
                    onFocus: D("h"),
                    className: w("h"),
                    children: I("h")
                  }
                ),
                /* @__PURE__ */ c("span", { "aria-hidden": !0, className: "zen-text-zen-muted-fg", children: ":" }),
                /* @__PURE__ */ c(
                  "div",
                  {
                    ref: (e) => {
                      v.current.m = e;
                    },
                    tabIndex: f ? -1 : 0,
                    role: "spinbutton",
                    "aria-label": u.t("timePicker.minutes"),
                    "aria-valuemin": 0,
                    "aria-valuemax": 59,
                    "aria-valuenow": t.m ?? void 0,
                    "aria-valuetext": t.m === null ? "empty" : h(t.m),
                    onKeyDown: (e) => $(e, "m"),
                    onFocus: D("m"),
                    className: w("m"),
                    children: I("m")
                  }
                ),
                i && /* @__PURE__ */ A(ie, { children: [
                  /* @__PURE__ */ c("span", { "aria-hidden": !0, className: "zen-text-zen-muted-fg", children: ":" }),
                  /* @__PURE__ */ c(
                    "div",
                    {
                      ref: (e) => {
                        v.current.s = e;
                      },
                      tabIndex: f ? -1 : 0,
                      role: "spinbutton",
                      "aria-label": u.t("timePicker.seconds"),
                      "aria-valuemin": 0,
                      "aria-valuemax": 59,
                      "aria-valuenow": t.s ?? void 0,
                      "aria-valuetext": t.s === null ? "empty" : h(t.s ?? 0),
                      onKeyDown: (e) => $(e, "s"),
                      onFocus: D("s"),
                      className: w("s"),
                      children: I("s")
                    }
                  )
                ] }),
                a === "12h" && /* @__PURE__ */ c(
                  "div",
                  {
                    ref: (e) => {
                      v.current.p = e;
                    },
                    tabIndex: f ? -1 : 0,
                    role: "spinbutton",
                    "aria-label": u.t("timePicker.period"),
                    "aria-valuetext": K === "AM" ? u.t("timePicker.am") : u.t("timePicker.pm"),
                    onKeyDown: ee,
                    onFocus: D("p"),
                    className: C(w("p"), "zen-ml-1 zen-uppercase"),
                    children: K === "AM" ? u.t("timePicker.am") : u.t("timePicker.pm")
                  }
                )
              ]
            }
          ),
          j && /* @__PURE__ */ c(
            "input",
            {
              type: "hidden",
              name: j,
              value: q(t, i) ?? ""
            }
          )
        ]
      }
    );
  }
);
oe.displayName = "TimePicker";
const le = () => /* @__PURE__ */ A(
  "svg",
  {
    width: "14",
    height: "14",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    className: "zen-text-zen-muted-fg",
    "aria-hidden": !0,
    children: [
      /* @__PURE__ */ c("circle", { cx: "12", cy: "12", r: "9" }),
      /* @__PURE__ */ c("polyline", { points: "12 7 12 12 16 14" })
    ]
  }
);
export {
  oe as TimePicker
};
//# sourceMappingURL=index20.js.map
