import { createComponent as m, memo as j, template as $, use as ie, insert as d, effect as _, setAttribute as u, setStyleProperty as O, className as B, delegateEvents as se } from "solid-js/web";
import { mergeProps as ce, Show as H, createSignal as D, createMemo as W, For as A, onCleanup as ue } from "solid-js";
import { CHART_PALETTE as ve, toSlices as he, arcPath as de, formatPercent as ee, describeSlices as fe } from "./index101.js";
import { cn as I } from "./index106.js";
var ze = /* @__PURE__ */ $("<svg><line stroke=var(--zen-color-border)></svg>", !1, !0, !1), ge = /* @__PURE__ */ $("<svg role=img><line stroke=var(--zen-color-border)>"), me = /* @__PURE__ */ $('<div><div class="zen-flex zen-flex-wrap zen-items-center zen-justify-center zen-gap-4"style=height:28px>'), xe = /* @__PURE__ */ $('<svg><line stroke=var(--zen-color-border) stroke-dasharray="3 3"></svg>', !1, !0, !1), be = /* @__PURE__ */ $("<svg><text text-anchor=end dominant-baseline=middle font-size=12 fill=var(--zen-color-muted-fg)></svg>", !1, !0, !1), ye = /* @__PURE__ */ $("<svg><text text-anchor=middle font-size=12 fill=var(--zen-color-muted-fg)></svg>", !1, !0, !1), Me = /* @__PURE__ */ $("<svg><path fill-opacity=0.2 stroke=none></svg>", !1, !0, !1), $e = /* @__PURE__ */ $("<svg><path fill=none stroke-width=2 stroke-linecap=round stroke-linejoin=round></svg>", !1, !0, !1), we = /* @__PURE__ */ $("<svg><rect></svg>", !1, !0, !1), ke = /* @__PURE__ */ $("<svg><circle r=3.5 stroke=var(--zen-color-background) stroke-width=1.5></svg>", !1, !0, !1), _e = /* @__PURE__ */ $('<span class="zen-inline-flex zen-items-center zen-gap-1.5 zen-text-xs zen-text-zen-muted-fg"><span class="zen-inline-block zen-h-2 zen-w-2 zen-rounded-zen-full">'), Ce = /* @__PURE__ */ $('<div class="zen-pointer-events-none zen-absolute zen-top-2 zen-z-10 zen-min-w-24 zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-background zen-p-2 zen-text-xs zen-shadow-md"><div class="zen-mb-1 zen-font-medium zen-text-zen-foreground">'), Se = /* @__PURE__ */ $('<div class="zen-flex zen-items-center zen-gap-1.5 zen-text-zen-muted-fg"><span class="zen-inline-block zen-h-2 zen-w-2 zen-rounded-zen-full"></span><span></span><span class="zen-ml-auto zen-font-medium zen-text-zen-foreground">'), Pe = /* @__PURE__ */ $('<div><svg width=100% viewBox="0 0 100 100"role=img></svg><div class="zen-flex zen-flex-wrap zen-items-center zen-justify-center zen-gap-3 zen-text-xs">'), Ne = /* @__PURE__ */ $("<svg><path stroke=var(--zen-color-background) stroke-width=0.75></svg>", !1, !0, !1), Ee = /* @__PURE__ */ $("<div><span class=zen-font-medium></span> <span class=zen-text-zen-muted-fg> · "), Le = /* @__PURE__ */ $('<span class="zen-inline-flex zen-cursor-default zen-items-center zen-gap-1.5"><span aria-hidden=true class="zen-inline-block zen-h-2 zen-w-2 zen-rounded-zen-full"></span><span class=zen-text-zen-muted-fg>'), pe = /* @__PURE__ */ $("<table class=zen-sr-only><caption>Chart data</caption><thead><tr><th scope=col></th><th scope=col>Value</th><th scope=col>Share</th></tr></thead><tbody>"), He = /* @__PURE__ */ $("<tr><th scope=row></th><td></td><td>");
const U = ve, M = {
  top: 12,
  right: 12,
  bottom: 24,
  left: 44
}, te = 28, Te = 5, Q = (e, h) => {
  const b = Math.floor(Math.log10(e)), s = e / Math.pow(10, b);
  let k;
  return h ? k = s < 1.5 ? 1 : s < 3 ? 2 : s < 7 ? 5 : 10 : k = s <= 1 ? 1 : s <= 2 ? 2 : s <= 5 ? 5 : 10, k * Math.pow(10, b);
}, Y = (e, h) => {
  let b = e, s = h;
  (!Number.isFinite(b) || !Number.isFinite(s)) && (b = 0, s = 1), b === s && (b = b === 0 ? 0 : b - Math.abs(b) * 0.5, s = s === 0 ? 1 : s + Math.abs(s) * 0.5);
  const k = Q(Q(s - b, !1) / (Te - 1), !0), T = Math.floor(b / k) * k, N = Math.ceil(s / k) * k, C = [];
  for (let p = T; p <= N + k / 2; p += k)
    C.push(Number(p.toPrecision(12)));
  return {
    min: T,
    max: N,
    ticks: C
  };
}, Ae = (e) => {
  const h = Math.abs(e);
  return h >= 1e9 ? `${Number((e / 1e9).toPrecision(3))}B` : h >= 1e6 ? `${Number((e / 1e6).toPrecision(3))}M` : h >= 1e3 ? `${Number((e / 1e3).toPrecision(3))}k` : `${Number(e.toPrecision(6))}`;
}, Re = (e) => {
  const h = ce({
    type: "line",
    height: 300
  }, e);
  return m(H, {
    get when() {
      return j(() => h.type !== "pie")() && h.type !== "donut";
    },
    get fallback() {
      return m(We, h);
    },
    get children() {
      return m(Fe, h);
    }
  });
};
Re.displayName = "Chart";
const Fe = (e) => {
  const [h, b] = D(0), [s, k] = D(null);
  let T;
  const N = (o) => {
    T = o;
    const c = new ResizeObserver((r) => {
      const v = r[0]?.contentRect.width ?? o.clientWidth;
      b(v);
    });
    c.observe(o), b(o.clientWidth), ue(() => c.disconnect());
  }, C = (o, c) => o.color ?? U[c % U.length], p = (o) => o.label ?? o.key, f = () => Math.max(0, e.height - te), x = () => Math.max(0, h() - M.left - M.right), g = () => Math.max(0, f() - M.top - M.bottom), y = (o, c) => {
    const r = Number(o?.[c]);
    return Number.isFinite(r) ? r : null;
  }, S = W(() => {
    const o = [];
    for (const t of e.data)
      for (const l of e.series) {
        const n = y(t, l.key);
        n !== null && o.push(n);
      }
    if (o.length === 0) return Y(0, 1);
    const c = Math.min(...o), r = Math.max(...o), v = e.type !== "line";
    return Y(v ? Math.min(0, c) : c, v ? Math.max(0, r) : r);
  }), P = (o) => {
    const {
      min: c,
      max: r
    } = S(), v = r - c || 1;
    return M.top + g() * (1 - (o - c) / v);
  }, F = () => e.data.length > 0 ? x() / e.data.length : x(), E = (o) => {
    const c = e.data.length;
    return e.type === "bar" ? M.left + F() * (o + 0.5) : c <= 1 ? M.left + x() / 2 : M.left + x() * o / (c - 1);
  }, ne = (o) => {
    let c = "", r = !1;
    return e.data.forEach((v, t) => {
      const l = y(v, o);
      if (l === null) {
        r = !1;
        return;
      }
      c += `${r ? "L" : "M"}${E(t)} ${P(l)} `, r = !0;
    }), c.trim();
  }, re = (o) => {
    const c = e.data.map((n, a) => ({
      i: a,
      v: y(n, o)
    })).filter((n) => n.v !== null);
    if (c.length === 0) return "";
    const {
      min: r,
      max: v
    } = S(), t = P(Math.min(Math.max(0, r), v));
    return `${c.map((n, a) => `${a === 0 ? "M" : "L"}${E(n.i)} ${P(n.v)}`).join(" ")} L${E(c[c.length - 1].i)} ${t} L${E(c[0].i)} ${t} Z`;
  }, le = W(() => {
    const o = e.data.length;
    if (o === 0) return 1;
    const c = Math.max(1, Math.floor(x() / 60));
    return Math.max(1, Math.ceil(o / c));
  }), ae = (o) => {
    if (!T || e.data.length === 0) return null;
    const c = o - T.getBoundingClientRect().left, r = e.data.length;
    if (e.type === "bar") {
      const t = Math.floor((c - M.left) / (F() || 1));
      return t >= 0 && t < r ? t : null;
    }
    if (r === 1) return 0;
    const v = Math.round((c - M.left) / (x() || 1) * (r - 1));
    return Math.min(r - 1, Math.max(0, v));
  }, oe = W(() => {
    const o = s();
    if (o === null) return null;
    const c = e.data[o];
    return c ? {
      x: String(c[e.xKey] ?? ""),
      items: e.series.map((r, v) => ({
        label: p(r),
        color: C(r, v),
        value: c[r.key]
      }))
    } : null;
  });
  return (() => {
    var o = me(), c = o.firstChild;
    return ie(N, o), d(o, m(H, {
      get when() {
        return h() > 0;
      },
      get children() {
        var r = ge(), v = r.firstChild;
        return r.addEventListener("mouseleave", () => k(null)), r.$$mousemove = (t) => k(ae(t.clientX)), d(r, m(A, {
          get each() {
            return S().ticks;
          },
          children: (t) => [(() => {
            var l = xe();
            return _((n) => {
              var a = M.left, i = M.left + x(), z = P(t), w = P(t);
              return a !== n.e && u(l, "x1", n.e = a), i !== n.t && u(l, "x2", n.t = i), z !== n.a && u(l, "y1", n.a = z), w !== n.o && u(l, "y2", n.o = w), n;
            }, {
              e: void 0,
              t: void 0,
              a: void 0,
              o: void 0
            }), l;
          })(), (() => {
            var l = be();
            return d(l, () => Ae(t)), _((n) => {
              var a = M.left - 8, i = P(t);
              return a !== n.e && u(l, "x", n.e = a), i !== n.t && u(l, "y", n.t = i), n;
            }, {
              e: void 0,
              t: void 0
            }), l;
          })()]
        }), v), d(r, m(A, {
          get each() {
            return e.data;
          },
          children: (t, l) => m(H, {
            get when() {
              return l() % le() === 0;
            },
            get children() {
              var n = ye();
              return d(n, () => String(t[e.xKey] ?? "")), _((a) => {
                var i = E(l()), z = M.top + g() + 16;
                return i !== a.e && u(n, "x", a.e = i), z !== a.t && u(n, "y", a.t = z), a;
              }, {
                e: void 0,
                t: void 0
              }), n;
            }
          })
        }), null), d(r, m(H, {
          get when() {
            return j(() => s() !== null)() && e.type !== "bar";
          },
          get children() {
            var t = ze();
            return _((l) => {
              var n = E(s()), a = E(s()), i = M.top, z = M.top + g();
              return n !== l.e && u(t, "x1", l.e = n), a !== l.t && u(t, "x2", l.t = a), i !== l.a && u(t, "y1", l.a = i), z !== l.o && u(t, "y2", l.o = z), l;
            }, {
              e: void 0,
              t: void 0,
              a: void 0,
              o: void 0
            }), t;
          }
        }), null), d(r, m(A, {
          get each() {
            return e.series;
          },
          children: (t, l) => {
            const n = () => C(t, l());
            return m(H, {
              get when() {
                return e.type === "bar";
              },
              get fallback() {
                return [m(H, {
                  get when() {
                    return e.type === "area";
                  },
                  get children() {
                    var a = Me();
                    return _((i) => {
                      var z = re(t.key), w = n();
                      return z !== i.e && u(a, "d", i.e = z), w !== i.t && u(a, "fill", i.t = w), i;
                    }, {
                      e: void 0,
                      t: void 0
                    }), a;
                  }
                }), (() => {
                  var a = $e();
                  return _((i) => {
                    var z = ne(t.key), w = n();
                    return z !== i.e && u(a, "d", i.e = z), w !== i.t && u(a, "stroke", i.t = w), i;
                  }, {
                    e: void 0,
                    t: void 0
                  }), a;
                })()];
              },
              get children() {
                return m(A, {
                  get each() {
                    return e.data;
                  },
                  children: (a, i) => {
                    const z = () => y(a, t.key), w = () => F() * 0.7 / Math.max(1, e.series.length), K = () => E(i()) - F() * 0.7 / 2 + w() * l(), G = () => {
                      const {
                        min: R,
                        max: L
                      } = S();
                      return P(Math.min(Math.max(0, R), L));
                    };
                    return m(H, {
                      get when() {
                        return z() !== null;
                      },
                      get children() {
                        var R = we();
                        return _((L) => {
                          var V = K(), X = Math.min(P(z()), G()), Z = Math.max(0, w()), q = Math.abs(G() - P(z())), J = n();
                          return V !== L.e && u(R, "x", L.e = V), X !== L.t && u(R, "y", L.t = X), Z !== L.a && u(R, "width", L.a = Z), q !== L.o && u(R, "height", L.o = q), J !== L.i && u(R, "fill", L.i = J), L;
                        }, {
                          e: void 0,
                          t: void 0,
                          a: void 0,
                          o: void 0,
                          i: void 0
                        }), R;
                      }
                    });
                  }
                });
              }
            });
          }
        }), null), d(r, m(H, {
          get when() {
            return j(() => s() !== null)() && e.type !== "bar";
          },
          get children() {
            return m(A, {
              get each() {
                return e.series;
              },
              children: (t, l) => {
                const n = () => y(e.data[s()] ?? {}, t.key);
                return m(H, {
                  get when() {
                    return n() !== null;
                  },
                  get children() {
                    var a = ke();
                    return _((i) => {
                      var z = E(s()), w = P(n()), K = C(t, l());
                      return z !== i.e && u(a, "cx", i.e = z), w !== i.t && u(a, "cy", i.t = w), K !== i.a && u(a, "fill", i.a = K), i;
                    }, {
                      e: void 0,
                      t: void 0,
                      a: void 0
                    }), a;
                  }
                });
              }
            });
          }
        }), null), _((t) => {
          var l = h(), n = f(), a = `${e.type} chart`, i = M.left, z = M.left + x(), w = M.top + g(), K = M.top + g();
          return l !== t.e && u(r, "width", t.e = l), n !== t.t && u(r, "height", t.t = n), a !== t.a && u(r, "aria-label", t.a = a), i !== t.o && u(v, "x1", t.o = i), z !== t.i && u(v, "x2", t.i = z), w !== t.n && u(v, "y1", t.n = w), K !== t.s && u(v, "y2", t.s = K), t;
        }, {
          e: void 0,
          t: void 0,
          a: void 0,
          o: void 0,
          i: void 0,
          n: void 0,
          s: void 0
        }), r;
      }
    }), c), d(c, m(A, {
      get each() {
        return e.series;
      },
      children: (r, v) => (() => {
        var t = _e(), l = t.firstChild;
        return d(t, () => p(r), null), _((n) => O(l, "background-color", C(r, v()))), t;
      })()
    })), d(o, m(H, {
      get when() {
        return oe();
      },
      children: (r) => (() => {
        var v = Ce(), t = v.firstChild;
        return d(t, () => r().x), d(v, m(A, {
          get each() {
            return r().items;
          },
          children: (l) => (() => {
            var n = Se(), a = n.firstChild, i = a.nextSibling, z = i.nextSibling;
            return d(i, () => l.label), d(z, () => String(l.value ?? "—")), _((w) => O(a, "background-color", l.color)), n;
          })()
        }), null), _((l) => {
          var n = E(s()) > h() / 2 ? "auto" : `${Math.min(E(s()) + 12, Math.max(0, h() - 8))}px`, a = E(s()) > h() / 2 ? `${Math.max(0, h() - E(s()) + 12)}px` : "auto";
          return n !== l.e && O(v, "left", l.e = n), a !== l.t && O(v, "right", l.t = a), l;
        }, {
          e: void 0,
          t: void 0
        }), v;
      })()
    }), null), _((r) => {
      var v = I("zen-relative zen-w-full", e.class), t = `${e.height}px`;
      return v !== r.e && B(o, r.e = v), t !== r.t && O(o, "height", r.t = t), r;
    }, {
      e: void 0,
      t: void 0
    }), o;
  })();
}, Ke = 40, Oe = 22, We = (e) => {
  const [h, b] = D(null), s = W(() => e.series[0] ? he(e.data, e.xKey, e.series[0].key, e.colors ?? U) : []), k = () => e.type === "donut" ? "Donut chart" : "Pie chart", T = () => Math.max(0, e.height - te);
  return (() => {
    var N = Pe(), C = N.firstChild, p = C.nextSibling;
    return d(C, m(A, {
      get each() {
        return s();
      },
      children: (f, x) => (() => {
        var g = Ne();
        return g.addEventListener("mouseleave", () => b(null)), g.addEventListener("mouseenter", () => b(x())), _((y) => {
          var S = de(50, 50, Ke, e.type === "donut" ? Oe : 0, f.startAngle, f.endAngle), P = f.color, F = h() === null || h() === x() ? 1 : 0.45;
          return S !== y.e && u(g, "d", y.e = S), P !== y.t && u(g, "fill", y.t = P), F !== y.a && u(g, "opacity", y.a = F), y;
        }, {
          e: void 0,
          t: void 0,
          a: void 0
        }), g;
      })()
    })), d(N, m(H, {
      get when() {
        return j(() => h() !== null)() && s()[h()];
      },
      children: (f) => (() => {
        var x = Ee(), g = x.firstChild, y = g.nextSibling, S = y.nextSibling, P = S.firstChild;
        return d(g, () => f().label), d(S, () => f().value, P), d(S, () => ee(f().percent), null), _(() => B(x, I("zen-pointer-events-none zen-absolute zen-left-1/2 zen-top-2 -zen-translate-x-1/2", "zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-background", "zen-px-2 zen-py-1 zen-text-xs zen-text-zen-foreground zen-shadow-md"))), x;
      })()
    }), p), d(p, m(A, {
      get each() {
        return s();
      },
      children: (f, x) => (() => {
        var g = Le(), y = g.firstChild, S = y.nextSibling;
        return g.addEventListener("mouseleave", () => b(null)), g.addEventListener("mouseenter", () => b(x())), d(S, () => f.label), _((P) => O(y, "background-color", f.color)), g;
      })()
    })), d(N, m(je, {
      get slices() {
        return s();
      },
      get labelHeader() {
        return e.xKey;
      }
    }), null), _((f) => {
      var x = I("zen-relative zen-w-full", e.class), g = `${e.height}px`, y = T(), S = fe(s(), k());
      return x !== f.e && B(N, f.e = x), g !== f.t && O(N, "height", f.t = g), y !== f.a && u(C, "height", f.a = y), S !== f.o && u(C, "aria-label", f.o = S), f;
    }, {
      e: void 0,
      t: void 0,
      a: void 0,
      o: void 0
    }), N;
  })();
}, je = (e) => (() => {
  var h = pe(), b = h.firstChild, s = b.nextSibling, k = s.firstChild, T = k.firstChild, N = s.nextSibling;
  return d(T, () => e.labelHeader), d(N, m(A, {
    get each() {
      return e.slices;
    },
    children: (C) => (() => {
      var p = He(), f = p.firstChild, x = f.nextSibling, g = x.nextSibling;
      return d(f, () => C.label), d(x, () => C.value), d(g, () => ee(C.percent)), p;
    })()
  })), h;
})();
se(["mousemove"]);
export {
  Re as Chart
};
//# sourceMappingURL=index100.js.map
