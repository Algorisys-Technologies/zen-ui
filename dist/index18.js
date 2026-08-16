import { jsxs as k, jsx as u, Fragment as te } from "react/jsx-runtime";
import * as g from "react";
import { cn as T } from "./index145.js";
const C = { h: null, m: null, s: null }, m = (r) => r.toString().padStart(2, "0"), W = (r, o) => {
  if (!r) return C;
  const l = /^(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?$/.exec(r.trim());
  if (!l) return C;
  const a = Number(l[1]), s = Number(l[2]), y = l[3] !== void 0 ? Number(l[3]) : 0;
  return a < 0 || a > 23 || s < 0 || s > 59 || y < 0 || y > 59 ? C : { h: a, m: s, s: o ? y : 0 };
}, Y = (r, o) => {
  if (!(r.h === null || r.m === null) && !(o && r.s === null))
    return o ? `${m(r.h)}:${m(r.m)}:${m(r.s ?? 0)}` : `${m(r.h)}:${m(r.m)}`;
}, E = (r) => r === null || r < 12 ? "AM" : "PM", q = (r) => {
  if (r === null) return null;
  const o = r % 12;
  return o === 0 ? 12 : o;
}, G = (r, o) => {
  const l = r % 12;
  return o === "PM" ? l + 12 : l;
}, se = g.forwardRef(
  ({
    value: r,
    defaultValue: o,
    onValueChange: l,
    format: a = "24h",
    showSeconds: s = !1,
    minuteStep: y = 1,
    disabled: h,
    readOnly: w,
    name: L,
    id: J,
    className: Q,
    "aria-label": X,
    "aria-labelledby": Z
  }, _) => {
    const A = r !== void 0, [S, V] = g.useState(
      () => W(o, s)
    ), t = A ? W(r, s) : S, N = g.useCallback(
      (e) => {
        A || V(e), l?.(Y(e, s));
      },
      [A, l, s]
    ), c = g.useRef({
      key: null,
      chars: ""
    }), z = g.useRef({}), p = (e) => {
      const n = z.current[e];
      n && n.focus();
    }, j = (e) => {
      e === "h" ? p("m") : e === "m" ? p(s ? "s" : a === "12h" ? "p" : "m") : e === "s" && p(a === "12h" ? "p" : "s");
    }, P = (e, n) => {
      const d = { ...t, [e]: n };
      N(d);
    }, F = (e) => {
      if (t.h === null) {
        N({ ...t, h: e === "AM" ? 0 : 12 });
        return;
      }
      const n = q(t.h) ?? 12;
      N({ ...t, h: G(n, e) });
    }, H = (e) => e === "h" ? a === "12h" ? 12 : 23 : 59, U = (e) => e === "h" && a === "12h" ? 1 : 0, v = a === "12h" ? q(t.h) : t.h, R = (e, n) => {
      if (h || w) return;
      const d = H(n), b = U(n), ne = n === "m" ? y : 1, B = n === "h" ? v : t[n], K = (f) => {
        const i = Math.min(Math.max(f, b), d);
        n === "h" && a === "12h" ? P("h", G(i === 0 ? 12 : i, E(t.h))) : P(n, i);
      };
      if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        e.preventDefault(), c.current = { key: n, chars: "" };
        const f = e.key === "ArrowUp" ? 1 : -1;
        if (B === null)
          K(f > 0 ? b : d);
        else {
          const i = d - b + 1, x = ((B - b + f * ne) % i + i) % i + b;
          K(x);
        }
        return;
      }
      if (e.key === "ArrowRight") {
        e.preventDefault(), c.current = { key: null, chars: "" }, j(n);
        return;
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault(), c.current = { key: null, chars: "" }, n === "m" ? p("h") : n === "s" && p("m");
        return;
      }
      if (e.key === "Backspace" || e.key === "Delete") {
        e.preventDefault(), c.current = { key: n, chars: "" }, P(n, null);
        return;
      }
      if (/^[0-9]$/.test(e.key)) {
        e.preventDefault();
        const f = c.current.key === n ? c.current.chars + e.key : e.key, i = f.length > 2 ? f.slice(-2) : f, x = Number(i);
        Number.isFinite(x) && K(x), c.current = { key: n, chars: i };
        const re = i.length === 1 && x * 10 > d;
        (i.length === 2 || re) && (c.current = { key: null, chars: "" }, j(n));
      }
    }, O = (e) => {
      if (!(h || w)) {
        if (e.key === "ArrowUp" || e.key === "ArrowDown" || e.key === " " || e.key === "Enter") {
          e.preventDefault(), F(E(t.h) === "AM" ? "PM" : "AM");
          return;
        }
        if (e.key === "a" || e.key === "A") {
          e.preventDefault(), F("AM");
          return;
        }
        if (e.key === "p" || e.key === "P") {
          e.preventDefault(), F("PM");
          return;
        }
        e.key === "ArrowLeft" && (e.preventDefault(), p(s ? "s" : "m"));
      }
    }, $ = (e) => {
      const n = e === "h" ? v : t[e];
      return n === null ? "––" : m(n);
    }, ee = t.h === null && t.m === null, I = E(t.h), D = (e) => {
      const n = e === "p" ? I : e === "h" ? v : t[e];
      return T(
        "zen-px-1 zen-tabular-nums zen-rounded-zen-sm zen-select-none",
        "focus:zen-outline-none focus-visible:zen-bg-zen-primary-soft focus-visible:zen-text-zen-primary",
        (e === "p" ? ee : n === null) && "zen-text-zen-muted-fg"
      );
    }, M = (e) => () => {
      c.current = { key: e === "p" ? null : e, chars: "" };
    };
    return /* @__PURE__ */ k(
      "div",
      {
        ref: _,
        id: J,
        role: "group",
        "aria-label": X ?? "Time",
        "aria-labelledby": Z,
        "aria-disabled": h || void 0,
        "aria-readonly": w || void 0,
        className: T(
          "zen-inline-flex zen-h-10 zen-items-center zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-background zen-px-3 zen-text-sm",
          "focus-within:zen-ring-2 focus-within:zen-ring-zen-ring focus-within:zen-border-zen-primary",
          h && "zen-opacity-50 zen-cursor-not-allowed zen-pointer-events-none",
          w && "zen-bg-zen-muted",
          Q
        ),
        children: [
          /* @__PURE__ */ u(ie, {}),
          /* @__PURE__ */ k(
            "div",
            {
              dir: "ltr",
              className: "zen-ml-2 zen-flex zen-items-center zen-gap-0.5 zen-text-zen-foreground",
              children: [
                /* @__PURE__ */ u(
                  "div",
                  {
                    ref: (e) => {
                      z.current.h = e;
                    },
                    tabIndex: h ? -1 : 0,
                    role: "spinbutton",
                    "aria-label": "Hours",
                    "aria-valuemin": U("h"),
                    "aria-valuemax": H("h"),
                    "aria-valuenow": v ?? void 0,
                    "aria-valuetext": t.h === null ? "empty" : m(v ?? 0),
                    onKeyDown: (e) => R(e, "h"),
                    onFocus: M("h"),
                    className: D("h"),
                    children: $("h")
                  }
                ),
                /* @__PURE__ */ u("span", { "aria-hidden": !0, className: "zen-text-zen-muted-fg", children: ":" }),
                /* @__PURE__ */ u(
                  "div",
                  {
                    ref: (e) => {
                      z.current.m = e;
                    },
                    tabIndex: h ? -1 : 0,
                    role: "spinbutton",
                    "aria-label": "Minutes",
                    "aria-valuemin": 0,
                    "aria-valuemax": 59,
                    "aria-valuenow": t.m ?? void 0,
                    "aria-valuetext": t.m === null ? "empty" : m(t.m),
                    onKeyDown: (e) => R(e, "m"),
                    onFocus: M("m"),
                    className: D("m"),
                    children: $("m")
                  }
                ),
                s && /* @__PURE__ */ k(te, { children: [
                  /* @__PURE__ */ u("span", { "aria-hidden": !0, className: "zen-text-zen-muted-fg", children: ":" }),
                  /* @__PURE__ */ u(
                    "div",
                    {
                      ref: (e) => {
                        z.current.s = e;
                      },
                      tabIndex: h ? -1 : 0,
                      role: "spinbutton",
                      "aria-label": "Seconds",
                      "aria-valuemin": 0,
                      "aria-valuemax": 59,
                      "aria-valuenow": t.s ?? void 0,
                      "aria-valuetext": t.s === null ? "empty" : m(t.s ?? 0),
                      onKeyDown: (e) => R(e, "s"),
                      onFocus: M("s"),
                      className: D("s"),
                      children: $("s")
                    }
                  )
                ] }),
                a === "12h" && /* @__PURE__ */ u(
                  "div",
                  {
                    ref: (e) => {
                      z.current.p = e;
                    },
                    tabIndex: h ? -1 : 0,
                    role: "spinbutton",
                    "aria-label": "AM/PM",
                    "aria-valuetext": I,
                    onKeyDown: O,
                    onFocus: M("p"),
                    className: T(D("p"), "zen-ml-1 zen-uppercase"),
                    children: I
                  }
                )
              ]
            }
          ),
          L && /* @__PURE__ */ u(
            "input",
            {
              type: "hidden",
              name: L,
              value: Y(t, s) ?? ""
            }
          )
        ]
      }
    );
  }
);
se.displayName = "TimePicker";
const ie = () => /* @__PURE__ */ k(
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
      /* @__PURE__ */ u("circle", { cx: "12", cy: "12", r: "9" }),
      /* @__PURE__ */ u("polyline", { points: "12 7 12 12 16 14" })
    ]
  }
);
export {
  se as TimePicker
};
//# sourceMappingURL=index18.js.map
