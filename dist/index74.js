import { template as d, insert as n, createComponent as t, memo as Y, effect as f, className as _, setStyleProperty as b, setAttribute as Z, delegateEvents as ee } from "solid-js/web";
import { createSignal as B, createMemo as C, Show as c, For as x } from "solid-js";
import { cn as y } from "./index103.js";
import "./index25.js";
import { planningRange as ne, planningColumns as te, nowPct as re, placeAppointment as ie, layoutLanes as le, shiftPlanningAnchor as O, planningRangeLabel as ae, formatTimeRange as X } from "./index141.js";
import { Button as P } from "./index5.js";
import { Icon as T } from "./index21.js";
var oe = /* @__PURE__ */ d('<div class="zen-flex zen-flex-wrap zen-items-center zen-gap-2"><span class="zen-mx-1 zen-text-sm zen-font-medium zen-text-zen-foreground"></span><div class="zen-ms-auto zen-flex zen-gap-1"role=group aria-label=View>'), se = /* @__PURE__ */ d('<div class="zen-overflow-x-auto zen-rounded-zen-md zen-border zen-border-zen-border"><div class=zen-min-w-[45rem]><div class="zen-flex zen-border-b zen-border-zen-border zen-bg-zen-muted/30"><div class="zen-w-40 zen-shrink-0 zen-border-e zen-border-zen-border zen-px-3 zen-py-2 zen-text-xs zen-font-semibold zen-text-zen-muted-fg">Resource</div><div class="zen-flex zen-flex-1">'), F = /* @__PURE__ */ d("<div>"), ze = /* @__PURE__ */ d('<p class="zen-m-0 zen-py-6 zen-text-center zen-text-sm zen-text-zen-muted-fg">'), de = /* @__PURE__ */ d('<div class="zen-text-[10px] zen-text-zen-muted-fg">'), ue = /* @__PURE__ */ d('<div><div class="zen-text-xs zen-font-medium zen-text-zen-foreground">'), ce = /* @__PURE__ */ d('<div class="zen-truncate zen-text-xs zen-text-zen-muted-fg">'), me = /* @__PURE__ */ d('<div aria-hidden=true class="zen-absolute zen-top-0 zen-bottom-0 zen-w-px zen-bg-zen-error">'), ge = /* @__PURE__ */ d('<div class="zen-flex zen-border-b zen-border-zen-border last:zen-border-b-0"><div class="zen-w-40 zen-shrink-0 zen-border-e zen-border-zen-border zen-px-3 zen-py-2"><div class="zen-truncate zen-text-sm zen-font-medium zen-text-zen-foreground"></div></div><div class="zen-relative zen-flex-1"><div aria-hidden=true class="zen-absolute zen-inset-0 zen-flex">'), fe = /* @__PURE__ */ d('<span class="zen-truncate zen-font-medium">'), he = /* @__PURE__ */ d('<span class="zen-truncate zen-opacity-70">'), pe = /* @__PURE__ */ d("<button type=button style=height:24px><span class=zen-sr-only>");
const ve = {
  default: "zen-bg-zen-muted zen-text-zen-foreground zen-border-zen-border",
  info: "zen-bg-zen-info-soft zen-text-zen-info zen-border-zen-info/40",
  success: "zen-bg-zen-success-soft zen-text-zen-success zen-border-zen-success/40",
  warning: "zen-bg-zen-warning-soft zen-text-zen-warning zen-border-zen-warning/40",
  error: "zen-bg-zen-error-soft zen-text-zen-error zen-border-zen-error/40"
}, be = {
  day: "Day",
  week: "Week",
  month: "Month"
}, H = 30, xe = 3, Se = (i) => {
  const [K, j] = B(i.defaultView ?? "week"), [q, G] = B(i.defaultDate ?? /* @__PURE__ */ new Date()), m = () => i.view ?? K(), h = () => i.date ?? q(), D = () => i.now ?? /* @__PURE__ */ new Date(), J = (o) => {
    i.view === void 0 && j(o), i.onViewChange?.(o);
  }, S = (o) => {
    i.date === void 0 && G(o), i.onDateChange?.(o);
  }, V = C(() => ne(m(), h())), E = C(() => te(m(), h(), {
    now: D()
  })), I = C(() => re(V(), D())), A = C(() => (i.rows ?? []).map((o) => {
    const a = o.appointments.map((l) => ({
      appointment: l,
      placement: ie(l, V())
    })).filter((l) => l.placement !== null), {
      lanes: u,
      laneCount: p
    } = le(a.map((l) => l.appointment));
    return {
      row: o,
      blocks: a.map((l, L) => ({
        ...l,
        lane: u[L]
      })),
      laneCount: Math.max(p, 1)
    };
  }));
  return (
    /* w-full, because the grid is a chart: shrink-wrapped to its content it
       reports a 490px week where the columns are too narrow to read, and the
       caller cannot fix it from outside without knowing the internals. */
    (() => {
      var o = F();
      return n(o, t(c, {
        get when() {
          return Y(() => !i.hideToolbar)() && A().length > 0;
        },
        get children() {
          var a = oe(), u = a.firstChild, p = u.nextSibling;
          return n(a, t(P, {
            variant: "outline",
            size: "sm",
            "aria-label": "Previous",
            onClick: () => S(O(m(), h(), -1)),
            get children() {
              return t(T, {
                name: "chevron-left",
                size: 14,
                class: "rtl:zen-rotate-180"
              });
            }
          }), u), n(a, t(P, {
            variant: "outline",
            size: "sm",
            onClick: () => S(D()),
            children: "Today"
          }), u), n(a, t(P, {
            variant: "outline",
            size: "sm",
            "aria-label": "Next",
            onClick: () => S(O(m(), h(), 1)),
            get children() {
              return t(T, {
                name: "chevron-right",
                size: 14,
                class: "rtl:zen-rotate-180"
              });
            }
          }), u), n(u, () => ae(m(), h())), n(p, t(x, {
            get each() {
              return i.views ?? ["day", "week", "month"];
            },
            children: (l) => t(P, {
              get variant() {
                return m() === l ? "solid" : "outline";
              },
              size: "sm",
              get "aria-pressed"() {
                return m() === l;
              },
              onClick: () => J(l),
              get children() {
                return be[l];
              }
            })
          })), a;
        }
      }), null), n(o, t(c, {
        get when() {
          return A().length > 0;
        },
        get fallback() {
          return (() => {
            var a = ze();
            return n(a, () => i.emptyMessage ?? "No resources"), a;
          })();
        },
        get children() {
          var a = se(), u = a.firstChild, p = u.firstChild, l = p.firstChild, L = l.nextSibling;
          return n(L, t(x, {
            get each() {
              return E();
            },
            children: (z) => (() => {
              var g = ue(), v = g.firstChild;
              return n(v, () => z.label), n(g, t(c, {
                get when() {
                  return z.sublabel;
                },
                get children() {
                  var w = de();
                  return n(w, () => z.sublabel), w;
                }
              }), null), f(() => _(g, y("zen-flex-1 zen-border-e zen-border-zen-border zen-px-1 zen-py-2 zen-text-center last:zen-border-e-0", z.nonWorking && "zen-bg-zen-muted/40", z.today && "zen-bg-zen-primary-soft"))), g;
            })()
          })), n(u, t(x, {
            get each() {
              return A();
            },
            children: (z) => (() => {
              var g = ge(), v = g.firstChild, w = v.firstChild, $ = v.nextSibling, Q = $.firstChild;
              return n(w, () => z.row.title), n(v, t(c, {
                get when() {
                  return z.row.subtitle;
                },
                get children() {
                  var e = ce();
                  return n(e, () => z.row.subtitle), e;
                }
              }), null), n(Q, t(x, {
                get each() {
                  return E();
                },
                children: (e) => (() => {
                  var s = F();
                  return f(() => _(s, y("zen-flex-1 zen-border-e zen-border-zen-border last:zen-border-e-0", e.nonWorking && "zen-bg-zen-muted/30", e.today && "zen-bg-zen-primary-soft/40"))), s;
                })()
              })), n($, t(c, {
                get when() {
                  return I() !== null;
                },
                get children() {
                  var e = me();
                  return f((s) => b(e, "inset-inline-start", `${I()}%`)), e;
                }
              }), null), n($, t(x, {
                get each() {
                  return z.blocks;
                },
                children: (e) => (() => {
                  var s = pe(), U = s.firstChild;
                  return s.$$click = () => i.onAppointmentClick?.(e.appointment, z.row), n(U, () => X(e.appointment.start, e.appointment.end)), n(s, t(c, {
                    get when() {
                      return e.placement.widthPct >= xe;
                    },
                    get children() {
                      return [t(c, {
                        get when() {
                          return e.appointment.icon;
                        },
                        get children() {
                          return t(T, {
                            get name() {
                              return e.appointment.icon;
                            },
                            size: 12,
                            class: "zen-shrink-0"
                          });
                        }
                      }), (() => {
                        var r = fe();
                        return n(r, () => e.appointment.title), r;
                      })(), t(c, {
                        get when() {
                          return e.appointment.subtitle;
                        },
                        get children() {
                          var r = he();
                          return n(r, () => e.appointment.subtitle), r;
                        }
                      })];
                    }
                  }), null), f((r) => {
                    var M = y(
                      "zen-absolute zen-flex zen-items-center zen-gap-1 zen-overflow-hidden zen-rounded-zen-sm zen-border zen-px-1.5 zen-text-start zen-text-xs",
                      "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
                      ve[e.appointment.state ?? "default"],
                      /* Square off the cut edge so a block continuing past
                         the view does not look like it ends there. */
                      e.placement.clippedStart && "zen-rounded-s-none zen-border-s-0",
                      e.placement.clippedEnd && "zen-rounded-e-none zen-border-e-0",
                      i.onAppointmentClick && "hover:zen-brightness-95"
                    ), N = `${e.placement.startPct}%`, W = `${e.placement.widthPct}%`, k = `${e.lane * H + 4}px`, R = `${e.appointment.title} · ${X(e.appointment.start, e.appointment.end)}`;
                    return M !== r.e && _(s, r.e = M), N !== r.t && b(s, "inset-inline-start", r.t = N), W !== r.a && b(s, "width", r.a = W), k !== r.o && b(s, "top", r.o = k), R !== r.i && Z(s, "title", r.i = R), r;
                  }, {
                    e: void 0,
                    t: void 0,
                    a: void 0,
                    o: void 0,
                    i: void 0
                  }), s;
                })()
              }), null), f((e) => b($, "min-height", `${z.laneCount * H + 8}px`)), g;
            })()
          }), null), a;
        }
      }), null), f(() => _(o, y("zen-flex zen-w-full zen-flex-col zen-gap-3", i.class))), o;
    })()
  );
};
ee(["click"]);
export {
  Se as PlanningCalendar
};
//# sourceMappingURL=index74.js.map
