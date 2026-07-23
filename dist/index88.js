import { template as v, spread as j, mergeProps as F, insert as x, createComponent as M, effect as c, className as H, setAttribute as E, delegateEvents as B } from "solid-js/web";
import { mergeProps as I, splitProps as U, createSignal as Y, createMemo as S, Show as P } from "solid-js";
import { cn as D } from "./index106.js";
var q = /* @__PURE__ */ v("<span class=zen-text-zen-muted-fg>:"), G = /* @__PURE__ */ v('<input type=text inputmode=numeric pattern=[0-9]* maxlength=2 class="zen-h-9 zen-w-10 zen-inline-flex zen-items-center zen-justify-center zen-text-sm zen-tabular-nums zen-bg-transparent zen-border zen-border-zen-border zen-rounded-zen-sm zen-text-center focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring"aria-label=Seconds>'), J = /* @__PURE__ */ v("<button type=button>"), K = /* @__PURE__ */ v("<input type=hidden>"), L = /* @__PURE__ */ v('<div><input type=text inputmode=numeric pattern=[0-9]* maxlength=2 class="zen-h-9 zen-w-10 zen-inline-flex zen-items-center zen-justify-center zen-text-sm zen-tabular-nums zen-bg-transparent zen-border zen-border-zen-border zen-rounded-zen-sm zen-text-center focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring"aria-label=Hours><span class=zen-text-zen-muted-fg>:</span><input type=text inputmode=numeric pattern=[0-9]* maxlength=2 class="zen-h-9 zen-w-10 zen-inline-flex zen-items-center zen-justify-center zen-text-sm zen-tabular-nums zen-bg-transparent zen-border zen-border-zen-border zen-rounded-zen-sm zen-text-center focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring"aria-label=Minutes>');
const d = (l) => l.toString().padStart(2, "0"), k = {
  h: null,
  m: null,
  s: null
}, Q = (l, m) => {
  if (!l) return k;
  const n = /^(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?$/.exec(l.trim());
  if (!n) return k;
  const f = Number(n[1]), z = Number(n[2]), g = n[3] !== void 0 ? Number(n[3]) : 0;
  return f < 0 || f > 23 || z < 0 || z > 59 || g < 0 || g > 59 ? k : {
    h: f,
    m: z,
    s: m ? g : 0
  };
}, R = (l, m) => {
  if (!(l.h === null || l.m === null))
    return m ? `${d(l.h)}:${d(l.m)}:${d(l.s ?? 0)}` : `${d(l.h)}:${d(l.m)}`;
}, C = (l) => l === null ? null : l % 12 || 12, W = (l) => l === null || l < 12 ? "AM" : "PM", O = (l, m) => {
  const n = l % 12;
  return m === "PM" ? n + 12 : n;
}, ne = (l) => {
  const m = I({
    format: "24h",
    showSeconds: !1,
    minuteStep: 1
  }, l), [n, f] = U(m, ["value", "defaultValue", "onValueChange", "format", "showSeconds", "minuteStep", "disabled", "readOnly", "name", "id", "class", "aria-label"]), z = () => n.value !== void 0, [g, V] = Y(n.defaultValue), A = S(() => z() ? n.value : g()), i = S(() => Q(A(), !!n.showSeconds)), $ = (r) => {
    const s = R(r, !!n.showSeconds);
    z() || V(s), n.onValueChange?.(s);
  }, b = (r) => {
    const s = r === null ? null : Math.max(0, Math.min(23, r));
    $({
      ...i(),
      h: s
    });
  }, y = (r) => {
    const s = r === null ? null : Math.max(0, Math.min(59, r));
    $({
      ...i(),
      m: s
    });
  }, N = (r) => {
    const s = r === null ? null : Math.max(0, Math.min(59, r));
    $({
      ...i(),
      s
    });
  }, p = S(() => W(i().h)), _ = () => {
    const r = i();
    if (r.h === null) return;
    const s = p() === "AM" ? "PM" : "AM";
    b(O(C(r.h) ?? 12, s));
  }, w = (r, s, h, a, e = 1) => {
    n.readOnly || n.disabled || (r.key === "ArrowUp" ? (r.preventDefault(), h(s === null ? 0 : (s + e) % (a + 1))) : r.key === "ArrowDown" ? (r.preventDefault(), h(s === null ? a : (s - e + a + 1) % (a + 1))) : r.key === "Backspace" && h(null));
  };
  return (() => {
    var r = L(), s = r.firstChild, h = s.nextSibling, a = h.nextSibling;
    return j(r, F(f, {
      get id() {
        return n.id;
      },
      get class() {
        return D("zen-inline-flex zen-items-center zen-gap-1", n.class);
      },
      role: "group",
      get "aria-label"() {
        return n["aria-label"] ?? "Time";
      }
    }), !1, !0), s.$$keydown = (e) => w(e, i().h, (t) => {
      n.format === "12h" && t !== null ? b(O((t - 1 + 12) % 12 + 1, p())) : b(t === null ? null : t % 24);
    }, 23), s.$$input = (e) => {
      const t = e.currentTarget.value.replace(/\D/g, "");
      if (t === "") {
        b(null);
        return;
      }
      const o = Number(t);
      if (n.format === "12h") {
        const u = Math.max(1, Math.min(12, o));
        b(O(u, p()));
      } else
        b(Math.min(23, o));
    }, a.$$keydown = (e) => w(e, i().m, y, 59, n.minuteStep), a.$$input = (e) => {
      const t = e.currentTarget.value.replace(/\D/g, "");
      if (t === "") {
        y(null);
        return;
      }
      y(Math.min(59, Number(t)));
    }, x(r, M(P, {
      get when() {
        return n.showSeconds;
      },
      get children() {
        return [q(), (() => {
          var e = G();
          return e.$$keydown = (t) => w(t, i().s, N, 59), e.$$input = (t) => {
            const o = t.currentTarget.value.replace(/\D/g, "");
            N(o === "" ? null : Math.min(59, Number(o)));
          }, c((t) => {
            var o = n.disabled, u = n.readOnly;
            return o !== t.e && (e.disabled = t.e = o), u !== t.t && (e.readOnly = t.t = u), t;
          }, {
            e: void 0,
            t: void 0
          }), c(() => e.value = i().s === null ? "" : d(i().s)), e;
        })()];
      }
    }), null), x(r, M(P, {
      get when() {
        return n.format === "12h";
      },
      get children() {
        var e = J();
        return e.$$click = _, x(e, p), c((t) => {
          var o = n.disabled || n.readOnly, u = D("zen-h-9 zen-px-2 zen-text-xs zen-font-medium zen-rounded-zen-sm zen-border zen-border-zen-border zen-bg-transparent zen-cursor-pointer", "hover:zen-bg-zen-muted", "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring");
          return o !== t.e && (e.disabled = t.e = o), u !== t.t && H(e, t.t = u), t;
        }, {
          e: void 0,
          t: void 0
        }), e;
      }
    }), null), x(r, M(P, {
      get when() {
        return n.name;
      },
      get children() {
        var e = K();
        return c(() => E(e, "name", n.name)), c(() => e.value = A() ?? ""), e;
      }
    }), null), c((e) => {
      var t = n.disabled, o = n.readOnly, u = n.disabled, T = n.readOnly;
      return t !== e.e && (s.disabled = e.e = t), o !== e.t && (s.readOnly = e.t = o), u !== e.a && (a.disabled = e.a = u), T !== e.o && (a.readOnly = e.o = T), e;
    }, {
      e: void 0,
      t: void 0,
      a: void 0,
      o: void 0
    }), c(() => s.value = i().h === null ? "" : n.format === "12h" ? d(C(i().h)) : d(i().h)), c(() => a.value = i().m === null ? "" : d(i().m)), r;
  })();
};
B(["input", "keydown", "click"]);
export {
  ne as TimePicker
};
//# sourceMappingURL=index88.js.map
