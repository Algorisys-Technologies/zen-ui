import { createComponent as v, template as d, effect as u, setAttribute as a, insert as k, memo as B } from "solid-js/web";
import { mergeProps as x, Show as w, For as L } from "solid-js";
import { cn as j } from "./index103.js";
var A = /* @__PURE__ */ d("<svg role=img>"), F = /* @__PURE__ */ d("<svg><polygon fill=currentColor opacity=0.15></svg>", !1, !0, !1), O = /* @__PURE__ */ d("<svg><polyline fill=none stroke=currentColor stroke-width=1.5 stroke-linecap=round stroke-linejoin=round></svg>", !1, !0, !1), P = /* @__PURE__ */ d("<svg><rect fill=currentColor rx=1></svg>", !1, !0, !1), R = /* @__PURE__ */ d("<svg><rect x=0 height=6 rx=3 fill=var(--zen-color-muted)></svg>", !1, !0, !1), D = /* @__PURE__ */ d("<svg><rect x=0 height=6 rx=3 fill=currentColor></svg>", !1, !0, !1), H = /* @__PURE__ */ d("<svg><rect y=0 width=2 fill=var(--zen-color-foreground)></svg>", !1, !0, !1), I = /* @__PURE__ */ d("<svg><rect x=0 rx=1 fill=var(--zen-color-muted-fg) opacity=0.5></svg>", !1, !0, !1), V = /* @__PURE__ */ d("<svg><rect rx=1 fill=currentColor></svg>", !1, !0, !1), W = /* @__PURE__ */ d("<svg><g><circle fill=none stroke-width=3 stroke=var(--zen-color-muted)></circle><circle fill=none stroke=currentColor stroke-width=3 stroke-linecap=round></svg>", !1, !0, !1), q = /* @__PURE__ */ d("<svg><text text-anchor=middle dominant-baseline=central fill=currentColor></svg>", !1, !0, !1);
const E = {
  primary: "zen-text-zen-primary",
  success: "zen-text-zen-success",
  warning: "zen-text-zen-warning",
  error: "zen-text-zen-error",
  info: "zen-text-zen-info",
  muted: "zen-text-zen-muted-fg"
}, M = (s) => (() => {
  var t = A();
  return k(t, () => s.children), u((o) => {
    var c = s.label, i = s.width, e = s.height, n = `0 0 ${s.width} ${s.height}`, r = j("zen-inline-block zen-align-middle", E[s.color], s.class);
    return c !== o.e && a(t, "aria-label", o.e = c), i !== o.t && a(t, "width", o.t = i), e !== o.a && a(t, "height", o.a = e), n !== o.o && a(t, "viewBox", o.o = n), r !== o.i && a(t, "class", o.i = r), o;
  }, {
    e: void 0,
    t: void 0,
    a: void 0,
    o: void 0,
    i: void 0
  }), t;
})(), S = (s) => {
  const t = Math.min(...s), c = Math.max(...s) - t;
  return s.map((i) => c === 0 ? 0.5 : (i - t) / c);
}, G = (s) => {
  if (s.length < 2) return "flat";
  const t = s[0], o = s[s.length - 1];
  return o > t ? "rising" : o < t ? "falling" : "flat";
}, Q = (s) => {
  const t = x({
    width: 80,
    height: 24,
    color: "primary"
  }, s), o = 2, c = () => {
    const e = t.values ?? [];
    if (e.length === 0) return [];
    const n = S(e), r = t.width - o * 2, h = t.height - o * 2, l = e.length === 1 ? 0 : r / (e.length - 1);
    return n.map((g, m) => [o + m * l, o + (1 - g) * h]);
  }, i = () => t.label ?? `Line chart, ${t.values?.length ?? 0} points, ${G(t.values ?? [])}`;
  return v(w, {
    get when() {
      return c().length > 0;
    },
    get children() {
      return v(M, {
        get width() {
          return t.width;
        },
        get height() {
          return t.height;
        },
        get color() {
          return t.color;
        },
        get label() {
          return i();
        },
        get class() {
          return t.class;
        },
        get children() {
          return [v(w, {
            get when() {
              return t.area;
            },
            get children() {
              var e = F();
              return u(() => a(e, "points", [`${c()[0][0]},${t.height - o}`, ...c().map(([n, r]) => `${n},${r}`), `${c()[c().length - 1][0]},${t.height - o}`].join(" "))), e;
            }
          }), (() => {
            var e = O();
            return u(() => a(e, "points", c().map(([n, r]) => `${n},${r}`).join(" "))), e;
          })()];
        }
      });
    }
  });
}, T = (s) => {
  const t = x({
    width: 80,
    height: 24,
    color: "primary"
  }, s), o = 2, c = () => {
    const i = t.values ?? [];
    if (i.length === 0) return [];
    const e = S(i), n = Math.max(1, (t.width - o * (i.length - 1)) / i.length);
    return e.map((r, h) => {
      const l = Math.max(2, r * t.height);
      return {
        x: h * (n + o),
        y: t.height - l,
        w: n,
        h: l
      };
    });
  };
  return v(w, {
    get when() {
      return c().length > 0;
    },
    get children() {
      return v(M, {
        get width() {
          return t.width;
        },
        get height() {
          return t.height;
        },
        get color() {
          return t.color;
        },
        get label() {
          return t.label ?? `Bar chart, ${t.values?.length ?? 0} bars`;
        },
        get class() {
          return t.class;
        },
        get children() {
          return v(L, {
            get each() {
              return c();
            },
            children: (i) => (() => {
              var e = P();
              return u((n) => {
                var r = i.x, h = i.y, l = i.w, g = i.h;
                return r !== n.e && a(e, "x", n.e = r), h !== n.t && a(e, "y", n.t = h), l !== n.a && a(e, "width", n.a = l), g !== n.o && a(e, "height", n.o = g), n;
              }, {
                e: void 0,
                t: void 0,
                a: void 0,
                o: void 0
              }), e;
            })()
          });
        }
      });
    }
  });
}, U = (s) => {
  const t = x({
    width: 80,
    height: 12,
    color: "primary",
    min: 0,
    max: 100
  }, s), o = (i) => {
    const e = t.max - t.min;
    return e === 0 ? 0 : Math.min(1, Math.max(0, (i - t.min) / e));
  }, c = () => t.label ?? `${t.value} of ${t.max}` + (t.target !== void 0 ? `, target ${t.target}` : "");
  return v(M, {
    get width() {
      return t.width;
    },
    get height() {
      return t.height;
    },
    get color() {
      return t.color;
    },
    get label() {
      return c();
    },
    get class() {
      return t.class;
    },
    get children() {
      return [(() => {
        var i = R();
        return u((e) => {
          var n = t.height / 2 - 3, r = t.width;
          return n !== e.e && a(i, "y", e.e = n), r !== e.t && a(i, "width", e.t = r), e;
        }, {
          e: void 0,
          t: void 0
        }), i;
      })(), (() => {
        var i = D();
        return u((e) => {
          var n = t.height / 2 - 3, r = o(t.value) * t.width;
          return n !== e.e && a(i, "y", e.e = n), r !== e.t && a(i, "width", e.t = r), e;
        }, {
          e: void 0,
          t: void 0
        }), i;
      })(), v(w, {
        get when() {
          return t.target !== void 0;
        },
        get children() {
          var i = H();
          return u((e) => {
            var n = Math.min(t.width - 2, o(t.target) * t.width), r = t.height;
            return n !== e.e && a(i, "x", e.e = n), r !== e.t && a(i, "height", e.t = r), e;
          }, {
            e: void 0,
            t: void 0
          }), i;
        }
      })];
    }
  });
}, X = (s) => {
  const t = x({
    width: 80,
    height: 24
  }, s), o = () => t.to - t.from, c = () => t.color ?? (o() > 0 ? "success" : o() < 0 ? "error" : "muted"), i = () => Math.max(Math.abs(t.from), Math.abs(t.to), 1), e = (r) => Math.max(2, Math.abs(r) / i() * (t.height - 6)), n = () => (t.width - 8) / 2;
  return v(M, {
    get width() {
      return t.width;
    },
    get height() {
      return t.height;
    },
    get color() {
      return c();
    },
    get label() {
      return t.label ?? `${t.from} to ${t.to}, ${o() > 0 ? "up" : o() < 0 ? "down" : "unchanged"} ${Math.abs(o())}`;
    },
    get class() {
      return t.class;
    },
    get children() {
      return [(() => {
        var r = I();
        return u((h) => {
          var l = t.height - e(t.from), g = n(), m = e(t.from);
          return l !== h.e && a(r, "y", h.e = l), g !== h.t && a(r, "width", h.t = g), m !== h.a && a(r, "height", h.a = m), h;
        }, {
          e: void 0,
          t: void 0,
          a: void 0
        }), r;
      })(), (() => {
        var r = V();
        return u((h) => {
          var l = n() + 8, g = t.height - e(t.to), m = n(), f = e(t.to);
          return l !== h.e && a(r, "x", h.e = l), g !== h.t && a(r, "y", h.t = g), m !== h.a && a(r, "width", h.a = m), f !== h.o && a(r, "height", h.o = f), h;
        }, {
          e: void 0,
          t: void 0,
          a: void 0,
          o: void 0
        }), r;
      })()];
    }
  });
}, Y = (s) => {
  const t = x({
    width: 40,
    height: 40,
    color: "primary",
    max: 100
  }, s), o = () => t.max === 0 ? 0 : Math.min(1, Math.max(0, t.value / t.max)), c = () => Math.min(t.width, t.height), i = () => c() / 2 - 3, e = () => 2 * Math.PI * i();
  return v(M, {
    get width() {
      return t.width;
    },
    get height() {
      return t.height;
    },
    get color() {
      return t.color;
    },
    get label() {
      return t.label ?? `${Math.round(o() * 100)} percent`;
    },
    get class() {
      return t.class;
    },
    get children() {
      return [(() => {
        var n = W(), r = n.firstChild, h = r.nextSibling;
        return u((l) => {
          var g = `rotate(-90 ${t.width / 2} ${t.height / 2})`, m = t.width / 2, f = t.height / 2, b = i(), y = t.width / 2, z = t.height / 2, C = i(), $ = `${e() * o()} ${e()}`;
          return g !== l.e && a(n, "transform", l.e = g), m !== l.t && a(r, "cx", l.t = m), f !== l.a && a(r, "cy", l.a = f), b !== l.o && a(r, "r", l.o = b), y !== l.i && a(h, "cx", l.i = y), z !== l.n && a(h, "cy", l.n = z), C !== l.s && a(h, "r", l.s = C), $ !== l.h && a(h, "stroke-dasharray", l.h = $), l;
        }, {
          e: void 0,
          t: void 0,
          a: void 0,
          o: void 0,
          i: void 0,
          n: void 0,
          s: void 0,
          h: void 0
        }), n;
      })(), v(w, {
        get when() {
          return B(() => !!t.showValue)() && c() >= 32;
        },
        get children() {
          var n = q();
          return k(n, () => Math.round(o() * 100)), u((r) => {
            var h = t.width / 2, l = t.height / 2, g = String(Math.round(c() / 3.5));
            return h !== r.e && a(n, "x", r.e = h), l !== r.t && a(n, "y", r.t = l), g !== r.a && a(n, "font-size", r.a = g), r;
          }, {
            e: void 0,
            t: void 0,
            a: void 0
          }), n;
        }
      })];
    }
  });
};
export {
  T as MicroBarChart,
  U as MicroBulletChart,
  X as MicroDeltaChart,
  Q as MicroLineChart,
  Y as MicroRadialChart
};
//# sourceMappingURL=index77.js.map
