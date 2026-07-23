import { template as h, spread as ne, mergeProps as re, insert as a, createComponent as v, use as A, effect as I, setAttribute as z, className as oe, setStyleProperty as q, delegateEvents as ie } from "solid-js/web";
import { splitProps as se, createSignal as D, untrack as C, createEffect as k, on as _, Show as y, onCleanup as x, For as j } from "solid-js";
import { cn as J } from "./index103.js";
import { arrowStep as le } from "./index112.js";
import "./index25.js";
var ce = /* @__PURE__ */ h('<h2 class="zen-m-0 zen-min-w-0 zen-truncate zen-text-base zen-font-semibold">'), de = /* @__PURE__ */ h('<div class="zen-ml-auto zen-flex zen-shrink-0 zen-items-center zen-gap-2">'), ae = /* @__PURE__ */ h('<div class="zen-flex zen-shrink-0 zen-items-center zen-gap-3 zen-border-b zen-border-zen-border zen-px-6 zen-py-3">'), ue = /* @__PURE__ */ h('<div class="zen-border-b zen-border-zen-border zen-px-6 zen-py-4">'), fe = /* @__PURE__ */ h('<nav class="zen-sticky zen-top-0 zen-z-10 zen-flex zen-h-11 zen-items-stretch zen-gap-1 zen-overflow-x-auto zen-border-b zen-border-zen-border zen-bg-zen-background zen-px-4">'), ze = /* @__PURE__ */ h('<div><div class="zen-min-h-0 zen-flex-1 zen-overflow-y-auto"><div aria-hidden=true>'), he = /* @__PURE__ */ h('<span aria-hidden=true class="zen-absolute zen-inset-x-2 zen-bottom-0 zen-h-0.5 zen-rounded-zen-full zen-bg-zen-primary">'), ve = /* @__PURE__ */ h("<button type=button>"), me = /* @__PURE__ */ h('<section class="zen-border-b zen-border-zen-border zen-px-6 zen-py-5"><h3 class="zen-m-0 zen-mb-3 zen-text-sm zen-font-semibold zen-uppercase zen-tracking-wide zen-text-zen-muted-fg">'), be = /* @__PURE__ */ h('<section class="zen-mt-4 zen-border-t zen-border-zen-border zen-pt-4 first:zen-mt-0 first:zen-border-t-0 first:zen-pt-0"><h4 class="zen-m-0 zen-mb-2 zen-text-sm zen-font-semibold">');
const ge = () => typeof window < "u" && typeof window.matchMedia == "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, $e = (Q) => {
  const [r, U] = se(Q, ["sections", "selectedSectionId", "defaultSelectedSectionId", "onSelectedSectionChange", "header", "title", "showAnchorBar", "anchorBarLabel", "class", "children"]);
  let S, E;
  const g = /* @__PURE__ */ new Map(), O = /* @__PURE__ */ new Map(), R = () => r.showAnchorBar ?? !0, T = () => r.sections[0]?.id, [W, F] = D(C(() => r.defaultSelectedSectionId ?? r.sections[0]?.id)), K = () => r.selectedSectionId ?? W();
  let p = C(() => r.selectedSectionId ?? r.defaultSelectedSectionId ?? r.sections[0]?.id), H = !1, M = null;
  const N = (e) => {
    F(e), r.onSelectedSectionChange?.(e);
  }, [w, L] = D(0);
  k(_(R, () => {
    const e = E;
    if (!e) {
      L(0);
      return;
    }
    if (L(e.offsetHeight), typeof ResizeObserver > "u") return;
    const o = new ResizeObserver(() => L(e.offsetHeight));
    o.observe(e), x(() => o.disconnect());
  }));
  const [X, Y] = D(0);
  k(_([() => r.sections, w], () => {
    const e = S, o = r.sections[r.sections.length - 1]?.id, l = o ? g.get(o) : void 0;
    if (!e || !l) return;
    const d = () => Y(Math.max(0, e.clientHeight - l.offsetHeight - C(w)));
    if (d(), typeof ResizeObserver > "u") return;
    const n = new ResizeObserver(d);
    n.observe(e), n.observe(l), x(() => n.disconnect());
  })), k(_([() => r.sections, w], () => {
    const e = S;
    if (console.log("DBG io effect root?", !!e), !e || typeof IntersectionObserver > "u") return;
    const o = r.sections, l = o.map((t) => g.get(t.id)).filter((t) => !!t);
    if (!l.length) return;
    const d = /* @__PURE__ */ new Set(), n = new IntersectionObserver((t) => {
      for (const i of t) {
        const s = i.target.dataset.sectionId;
        s && (i.isIntersecting ? d.add(s) : d.delete(s));
      }
      if (H) return;
      const u = o.find((i) => d.has(i.id))?.id;
      !u || u === p || (console.log("DBG spy commit:", u, "was", p), p = u, N(u));
    }, {
      root: e,
      // The extra pixel decides the bottom of the scroller, where the last
      // section's top and its predecessor's bottom land on the line together.
      rootMargin: `-${C(w) + 1}px 0px 0px 0px`,
      threshold: 0
    });
    l.forEach((t) => n.observe(t)), M = () => {
      l.forEach((t) => {
        n.unobserve(t), n.observe(t);
      });
    }, x(() => {
      M = null, n.disconnect();
    });
  }));
  const G = (e, o) => {
    const l = g.get(e), d = S;
    if (console.log("DBG goTo", e, "el?", !!l, "root?", !!d, "keys", [...g.keys()].join(",")), !l || !d) return;
    p = e, o.notify ? N(e) : F(e), H = !0;
    let n = 0;
    const t = () => {
      d.removeEventListener("scroll", u), window.clearTimeout(n), H = !1, M?.();
    }, u = () => {
      window.clearTimeout(n), n = window.setTimeout(t, 120);
    };
    d.addEventListener("scroll", u), n = window.setTimeout(t, 1e3), l.scrollIntoView({
      block: "start",
      behavior: o.animate && !ge() ? "smooth" : "auto"
    });
  };
  let P = !1;
  k(_(w, (e) => {
    if (console.log("DBG init run: h=", e, "didInit=", P, "sel=", r.selectedSectionId, "spyId=", p), P || R() && e === 0) return;
    P = !0;
    const o = r.selectedSectionId ?? r.defaultSelectedSectionId;
    console.log("DBG init deciding: id=", o, "firstId=", T()), !(!o || o === T()) && G(o, {
      animate: !1,
      notify: !1
    });
  })), k(_(() => r.selectedSectionId, (e) => {
    e !== void 0 && e !== p && G(e, {
      animate: !0,
      notify: !1
    });
  }));
  const [Z, V] = D(null), ee = () => Z() ?? K() ?? T(), B = (e) => {
    V(e), O.get(e)?.focus();
  }, te = (e, o) => {
    const l = r.sections, d = l.length - 1, n = le(e.key, e.currentTarget);
    n === 1 ? (e.preventDefault(), B(l[o === d ? 0 : o + 1].id)) : n === -1 ? (e.preventDefault(), B(l[o === 0 ? d : o - 1].id)) : e.key === "Home" ? (e.preventDefault(), B(l[0].id)) : e.key === "End" && (e.preventDefault(), B(l[d].id));
  };
  return (() => {
    var e = ze(), o = e.firstChild, l = o.firstChild;
    ne(e, re({
      get class() {
        return J("zen-flex zen-h-full zen-flex-col zen-overflow-hidden zen-bg-zen-background zen-text-zen-foreground", r.class);
      }
    }, U), !1, !0), a(e, v(y, {
      get when() {
        return r.title || r.children;
      },
      get children() {
        var n = ae();
        return a(n, v(y, {
          get when() {
            return r.title;
          },
          get children() {
            var t = ce();
            return a(t, () => r.title), t;
          }
        }), null), a(n, v(y, {
          get when() {
            return r.children;
          },
          get children() {
            var t = de();
            return a(t, () => r.children), t;
          }
        }), null), n;
      }
    }), o);
    var d = S;
    return typeof d == "function" ? A(d, o) : S = o, a(o, v(y, {
      get when() {
        return r.header;
      },
      get children() {
        var n = ue();
        return a(n, () => r.header), n;
      }
    }), l), a(o, v(y, {
      get when() {
        return R();
      },
      get children() {
        var n = fe();
        return A((t) => {
          E = t, x(() => {
            E = void 0;
          });
        }, n), a(n, v(j, {
          get each() {
            return r.sections;
          },
          children: (t, u) => {
            const i = () => K() === t.id;
            return (() => {
              var s = ve();
              return s.$$click = () => G(t.id, {
                animate: !0,
                notify: !0
              }), s.$$keydown = (c) => te(c, u()), s.addEventListener("focus", () => V(t.id)), A((c) => {
                O.set(t.id, c), x(() => O.delete(t.id));
              }, s), a(s, () => t.title, null), a(s, v(y, {
                get when() {
                  return i();
                },
                get children() {
                  return he();
                }
              }), null), I((c) => {
                var f = t.id, m = i() ? "true" : void 0, b = ee() === t.id ? 0 : -1, $ = J("zen-relative zen-flex zen-shrink-0 zen-cursor-pointer zen-items-center zen-whitespace-nowrap zen-border-0 zen-bg-transparent zen-px-3 zen-text-sm zen-transition-colors", "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-inset focus-visible:zen-ring-zen-ring", i() ? "zen-font-semibold zen-text-zen-primary" : "zen-text-zen-muted-fg hover:zen-text-zen-foreground");
                return f !== c.e && z(s, "data-anchor-id", c.e = f), m !== c.t && z(s, "aria-current", c.t = m), b !== c.a && z(s, "tabindex", c.a = b), $ !== c.o && oe(s, c.o = $), c;
              }, {
                e: void 0,
                t: void 0,
                a: void 0,
                o: void 0
              }), s;
            })();
          }
        })), I(() => z(n, "aria-label", r.anchorBarLabel ?? "Object page sections")), n;
      }
    }), l), a(o, v(j, {
      get each() {
        return r.sections;
      },
      children: (n) => (() => {
        var t = me(), u = t.firstChild;
        return A((i) => {
          g.set(n.id, i), x(() => g.delete(n.id));
        }, t), a(u, () => n.title), a(t, () => n.content, null), a(t, v(j, {
          get each() {
            return n.subSections;
          },
          children: (i) => (() => {
            var s = be(), c = s.firstChild;
            return a(c, () => i.title), a(s, () => i.content, null), I((f) => {
              var m = i.id, b = `${i.id}-title`, $ = `${i.id}-title`;
              return m !== f.e && z(s, "id", f.e = m), b !== f.t && z(s, "aria-labelledby", f.t = b), $ !== f.a && z(c, "id", f.a = $), f;
            }, {
              e: void 0,
              t: void 0,
              a: void 0
            }), s;
          })()
        }), null), I((i) => {
          var s = n.id, c = n.id, f = `${n.id}-title`, m = `${w()}px`, b = `${n.id}-title`;
          return s !== i.e && z(t, "id", i.e = s), c !== i.t && z(t, "data-section-id", i.t = c), f !== i.a && z(t, "aria-labelledby", i.a = f), m !== i.o && q(t, "scroll-margin-top", i.o = m), b !== i.i && z(u, "id", i.i = b), i;
        }, {
          e: void 0,
          t: void 0,
          a: void 0,
          o: void 0,
          i: void 0
        }), t;
      })()
    }), l), I((n) => q(l, "height", `${X()}px`)), e;
  })();
};
ie(["keydown", "click"]);
export {
  $e as ObjectPageLayout
};
//# sourceMappingURL=index19.js.map
