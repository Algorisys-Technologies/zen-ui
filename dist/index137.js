import { createComponent as Z, memo as le } from "solid-js/web";
import { mergeProps as ie, createContext as ee, createEffect as P, untrack as A, createSignal as re, onMount as X, onCleanup as _, batch as L, useContext as te } from "solid-js";
import { createStore as ae } from "solid-js/store";
var Y = class {
  x;
  y;
  width;
  height;
  constructor(t) {
    this.x = Math.floor(t.x), this.y = Math.floor(t.y), this.width = Math.floor(t.width), this.height = Math.floor(t.height);
  }
  get rect() {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height
    };
  }
  get left() {
    return this.x;
  }
  get top() {
    return this.y;
  }
  get right() {
    return this.x + this.width;
  }
  get bottom() {
    return this.y + this.height;
  }
  get center() {
    return {
      x: this.x + this.width * 0.5,
      y: this.y + this.height * 0.5
    };
  }
  get corners() {
    return {
      topLeft: {
        x: this.left,
        y: this.top
      },
      topRight: {
        x: this.right,
        y: this.top
      },
      bottomRight: {
        x: this.left,
        y: this.bottom
      },
      bottomLeft: {
        x: this.right,
        y: this.bottom
      }
    };
  }
}, R = (t) => {
  let a = new Y(t.getBoundingClientRect());
  const {
    transform: e
  } = getComputedStyle(t);
  return e && (a = ce(a, e)), a;
}, ce = (t, a) => {
  let e, o;
  if (a.startsWith("matrix3d(")) {
    const s = a.slice(9, -1).split(/, /);
    e = +s[12], o = +s[13];
  } else if (a.startsWith("matrix(")) {
    const s = a.slice(7, -1).split(/, /);
    e = +s[4], o = +s[5];
  } else
    e = 0, o = 0;
  return new Y({
    ...t,
    x: t.x - e,
    y: t.y - o
  });
}, E = () => ({
  x: 0,
  y: 0
}), V = (t, a) => t.x === a.x && t.y === a.y, K = (t, a) => new Y({
  ...t,
  x: t.x + a.x,
  y: t.y + a.y
}), de = (t, a) => Math.sqrt(Math.pow(t.x - a.x, 2) + Math.pow(t.y - a.y, 2)), ue = (t, a) => {
  const e = Math.max(t.top, a.top), o = Math.max(t.left, a.left), s = Math.min(t.right, a.right), d = Math.min(t.bottom, a.bottom), u = s - o, v = d - e;
  if (o < s && e < d) {
    const f = t.width * t.height, I = a.width * a.height, m = u * v;
    return m / (f + I - m);
  }
  return 0;
}, U = (t, a) => t.x === a.x && t.y === a.y && t.width === a.width && t.height === a.height, Oe = (t, a, e) => {
  const o = t.transformed.center, s = {
    distance: 1 / 0,
    droppable: null
  };
  for (const d of a) {
    const u = de(o, d.layout.center);
    u < s.distance ? (s.distance = u, s.droppable = d) : u === s.distance && d.id === e.activeDroppableId && (s.droppable = d);
  }
  return s.droppable;
}, ge = (t, a, e) => {
  const o = t.transformed, s = {
    ratio: 0,
    droppable: null
  };
  for (const d of a) {
    const u = ue(o, d.layout);
    u > s.ratio ? (s.ratio = u, s.droppable = d) : u > 0 && u === s.ratio && d.id === e.activeDroppableId && (s.droppable = d);
  }
  return s.droppable;
}, oe = ee(), we = (t) => {
  const a = ie({
    collisionDetector: ge
  }, t), [e, o] = ae({
    draggables: {},
    droppables: {},
    sensors: {},
    active: {
      draggableId: null,
      get draggable() {
        return e.active.draggableId !== null ? e.draggables[e.active.draggableId] : null;
      },
      droppableId: null,
      get droppable() {
        return e.active.droppableId !== null ? e.droppables[e.active.droppableId] : null;
      },
      sensorId: null,
      get sensor() {
        return e.active.sensorId !== null ? e.sensors[e.active.sensorId] : null;
      },
      overlay: null
    }
  }), s = (r, n, l) => {
    r.substring(0, r.length - 1), A(() => e[r][n]) && o(r, n, "transformers", l.id, l);
  }, d = (r, n, l) => {
    r.substring(0, r.length - 1), A(() => e[r][n]) && A(() => e[r][n].transformers[l]) && o(r, n, "transformers", l, void 0);
  }, u = ({
    id: r,
    node: n,
    layout: l,
    data: x
  }) => {
    const c = e.draggables[r], i = {
      id: r,
      node: n,
      layout: l,
      data: x,
      _pendingCleanup: !1
    };
    let b;
    if (!c)
      Object.defineProperties(i, {
        transformers: {
          enumerable: !0,
          configurable: !0,
          writable: !0,
          value: {}
        },
        transform: {
          enumerable: !0,
          configurable: !0,
          get: () => {
            if (e.active.overlay)
              return E();
            const h = Object.values(e.draggables[r].transformers);
            return h.sort((k, N) => k.order - N.order), h.reduce((k, N) => N.callback(k), E());
          }
        },
        transformed: {
          enumerable: !0,
          configurable: !0,
          get: () => K(e.draggables[r].layout, e.draggables[r].transform)
        }
      });
    else if (e.active.draggableId === r && !e.active.overlay) {
      const h = {
        x: c.layout.x - l.x,
        y: c.layout.y - l.y
      }, k = "addDraggable-existing-offset", N = c.transformers[k], J = N ? N.callback(h) : h;
      b = {
        id: k,
        order: 100,
        callback: (Q) => ({
          x: Q.x + J.x,
          y: Q.y + J.y
        })
      }, F(() => d("draggables", r, k));
    }
    L(() => {
      o("draggables", r, i), b && s("draggables", r, b);
    }), e.active.draggable && w();
  }, v = (r) => {
    A(() => e.draggables[r]) && (o("draggables", r, "_pendingCleanup", !0), queueMicrotask(() => f(r)));
  }, f = (r) => {
    if (e.draggables[r]?._pendingCleanup) {
      const n = e.active.draggableId === r;
      L(() => {
        n && o("active", "draggableId", null), o("draggables", r, void 0);
      });
    }
  }, I = ({
    id: r,
    node: n,
    layout: l,
    data: x
  }) => {
    const c = e.droppables[r], i = {
      id: r,
      node: n,
      layout: l,
      data: x,
      _pendingCleanup: !1
    };
    c || Object.defineProperties(i, {
      transformers: {
        enumerable: !0,
        configurable: !0,
        writable: !0,
        value: {}
      },
      transform: {
        enumerable: !0,
        configurable: !0,
        get: () => {
          const b = Object.values(e.droppables[r].transformers);
          return b.sort((h, k) => h.order - k.order), b.reduce((h, k) => k.callback(h), E());
        }
      },
      transformed: {
        enumerable: !0,
        configurable: !0,
        get: () => K(e.droppables[r].layout, e.droppables[r].transform)
      }
    }), o("droppables", r, i), e.active.draggable && w();
  }, m = (r) => {
    A(() => e.droppables[r]) && (o("droppables", r, "_pendingCleanup", !0), queueMicrotask(() => p(r)));
  }, p = (r) => {
    if (e.droppables[r]?._pendingCleanup) {
      const n = e.active.droppableId === r;
      L(() => {
        n && o("active", "droppableId", null), o("droppables", r, void 0);
      });
    }
  }, D = ({
    id: r,
    activators: n
  }) => {
    o("sensors", r, {
      id: r,
      activators: n,
      coordinates: {
        origin: {
          x: 0,
          y: 0
        },
        current: {
          x: 0,
          y: 0
        },
        get delta() {
          return {
            x: e.sensors[r].coordinates.current.x - e.sensors[r].coordinates.origin.x,
            y: e.sensors[r].coordinates.current.y - e.sensors[r].coordinates.origin.y
          };
        }
      }
    });
  }, O = (r) => {
    if (!A(() => e.sensors[r]))
      return;
    const n = e.active.sensorId === r;
    L(() => {
      n && o("active", "sensorId", null), o("sensors", r, void 0);
    });
  }, y = ({
    node: r,
    layout: n
  }) => {
    const l = e.active.overlay, x = {
      node: r,
      layout: n
    };
    l || Object.defineProperties(x, {
      id: {
        enumerable: !0,
        configurable: !0,
        get: () => e.active.draggable?.id
      },
      data: {
        enumerable: !0,
        configurable: !0,
        get: () => e.active.draggable?.data
      },
      transformers: {
        enumerable: !0,
        configurable: !0,
        get: () => Object.fromEntries(Object.entries(e.active.draggable ? e.active.draggable.transformers : {}).filter(([c]) => c !== "addDraggable-existing-offset"))
      },
      transform: {
        enumerable: !0,
        configurable: !0,
        get: () => {
          const c = Object.values(e.active.overlay ? e.active.overlay.transformers : []);
          return c.sort((i, b) => i.order - b.order), c.reduce((i, b) => b.callback(i), E());
        }
      },
      transformed: {
        enumerable: !0,
        configurable: !0,
        get: () => e.active.overlay ? K(e.active.overlay.layout, e.active.overlay.transform) : new Y({
          x: 0,
          y: 0,
          width: 0,
          height: 0
        })
      }
    }), o("active", "overlay", x);
  }, M = () => o("active", "overlay", null), g = (r, n) => {
    L(() => {
      o("sensors", r, "coordinates", {
        origin: {
          ...n
        },
        current: {
          ...n
        }
      }), o("active", "sensorId", r);
    });
  }, C = (r) => {
    const n = e.active.sensorId;
    n && o("sensors", n, "coordinates", "current", {
      ...r
    });
  }, j = () => o("active", "sensorId", null), T = (r, n) => {
    const l = {};
    for (const c of Object.values(e.sensors))
      if (c)
        for (const [i, b] of Object.entries(c.activators))
          l[i] ??= [], l[i].push({
            sensor: c,
            activator: b
          });
    const x = {};
    for (const c in l) {
      let i = c;
      n && (i = `on${c}`), x[i] = (b) => {
        for (const {
          activator: h
        } of l[c]) {
          if (e.active.sensor)
            break;
          h(b, r);
        }
      };
    }
    return x;
  }, w = () => {
    let r = !1;
    const n = Object.values(e.draggables), l = Object.values(e.droppables), x = e.active.overlay;
    return L(() => {
      const c = /* @__PURE__ */ new WeakMap();
      for (const i of n)
        if (i) {
          const b = i.layout;
          c.has(i.node) || c.set(i.node, R(i.node));
          const h = c.get(i.node);
          U(b, h) || (o("draggables", i.id, "layout", h), r = !0);
        }
      for (const i of l)
        if (i) {
          const b = i.layout;
          c.has(i.node) || c.set(i.node, R(i.node));
          const h = c.get(i.node);
          U(b, h) || (o("droppables", i.id, "layout", h), r = !0);
        }
      if (x) {
        const i = x.layout, b = R(x.node);
        U(i, b) || (o("active", "overlay", "layout", b), r = !0);
      }
    }), r;
  }, S = () => {
    const r = e.active.overlay ?? e.active.draggable;
    if (r) {
      const n = a.collisionDetector(r, Object.values(e.droppables), {
        activeDroppableId: e.active.droppableId
      }), l = n ? n.id : null;
      e.active.droppableId !== l && o("active", "droppableId", l);
    }
  }, q = (r) => {
    const n = {
      id: "sensorMove",
      order: 0,
      callback: (l) => e.active.sensor ? {
        x: l.x + e.active.sensor.coordinates.delta.x,
        y: l.y + e.active.sensor.coordinates.delta.y
      } : l
    };
    w(), L(() => {
      o("active", "draggableId", r), s("draggables", r, n);
    }), S();
  }, W = () => {
    const r = A(() => e.active.draggableId);
    L(() => {
      r !== null && d("draggables", r, "sensorMove"), o("active", ["draggableId", "droppableId"], null);
    }), w();
  }, G = (r) => {
    P(() => {
      const n = e.active.draggable;
      n && A(() => r({
        draggable: n
      }));
    });
  }, $ = (r) => {
    P(() => {
      const n = e.active.draggable;
      if (n) {
        const l = A(() => e.active.overlay);
        Object.values(l ? l.transform : n.transform), A(() => r({
          draggable: n,
          overlay: l
        }));
      }
    });
  }, H = (r) => {
    P(() => {
      const n = e.active.draggable, l = e.active.droppable;
      n && A(() => r({
        draggable: n,
        droppable: l,
        overlay: e.active.overlay
      }));
    });
  }, F = (r) => {
    P(({
      previousDraggable: n,
      previousDroppable: l,
      previousOverlay: x
    }) => {
      const c = e.active.draggable, i = c ? e.active.droppable : null, b = c ? e.active.overlay : null;
      return !c && n && A(() => r({
        draggable: n,
        droppable: l,
        overlay: x
      })), {
        previousDraggable: c,
        previousDroppable: i,
        previousOverlay: b
      };
    }, {
      previousDraggable: null,
      previousDroppable: null,
      previousOverlay: null
    });
  };
  $(() => S()), a.onDragStart && G(a.onDragStart), a.onDragMove && $(a.onDragMove), a.onDragOver && H(a.onDragOver), a.onDragEnd && F(a.onDragEnd);
  const se = [e, {
    addTransformer: s,
    removeTransformer: d,
    addDraggable: u,
    removeDraggable: v,
    addDroppable: I,
    removeDroppable: m,
    addSensor: D,
    removeSensor: O,
    setOverlay: y,
    clearOverlay: M,
    recomputeLayouts: w,
    detectCollisions: S,
    draggableActivators: T,
    sensorStart: g,
    sensorMove: C,
    sensorEnd: j,
    dragStart: q,
    dragEnd: W,
    onDragStart: G,
    onDragMove: $,
    onDragOver: H,
    onDragEnd: F
  }];
  return Z(oe.Provider, {
    value: se,
    get children() {
      return a.children;
    }
  });
}, B = () => te(oe) || null, be = (t = "pointer-sensor") => {
  const [a, {
    addSensor: e,
    removeSensor: o,
    sensorStart: s,
    sensorMove: d,
    sensorEnd: u,
    dragStart: v,
    dragEnd: f
  }] = B(), I = 250, m = 10;
  X(() => {
    e({
      id: t,
      activators: {
        pointerdown: M
      }
    });
  }), _(() => {
    o(t);
  });
  const p = () => a.active.sensorId === t, D = {
    x: 0,
    y: 0
  };
  let O = null, y = null;
  const M = (S, q) => {
    S.button === 0 && (document.addEventListener("pointermove", j), document.addEventListener("pointerup", T), y = q, D.x = S.clientX, D.y = S.clientY, O = window.setTimeout(C, I));
  }, g = () => {
    O && (clearTimeout(O), O = null), document.removeEventListener("pointermove", j), document.removeEventListener("pointerup", T), document.removeEventListener("selectionchange", w);
  }, C = () => {
    a.active.sensor ? p() || g() : (s(t, D), v(y), w(), document.addEventListener("selectionchange", w));
  }, j = (S) => {
    const q = {
      x: S.clientX,
      y: S.clientY
    };
    if (!a.active.sensor) {
      const W = {
        x: q.x - D.x,
        y: q.y - D.y
      };
      Math.sqrt(W.x ** 2 + W.y ** 2) > m && C();
    }
    p() && (S.preventDefault(), d(q));
  }, T = (S) => {
    g(), p() && (S.preventDefault(), f(), u());
  }, w = () => {
    window.getSelection()?.removeAllRanges();
  };
}, Se = (t) => (be(), le(() => t.children)), z = (t) => ({
  transform: `translate3d(${t.x}px, ${t.y}px, 0)`
}), ve = (t, a = {}) => {
  const [e, {
    addDraggable: o,
    removeDraggable: s,
    draggableActivators: d
  }] = B(), [u, v] = re(null);
  X(() => {
    const p = u();
    p && o({
      id: t,
      node: p,
      layout: R(p),
      data: a
    });
  }), _(() => s(t));
  const f = () => e.active.draggableId === t, I = () => e.draggables[t]?.transform || E();
  return Object.defineProperties((p, D) => {
    const O = D ? D() : {};
    P(() => {
      const y = u(), M = d(t);
      if (y)
        for (const g in M)
          y.addEventListener(g, M[g]);
      _(() => {
        if (y)
          for (const g in M)
            y.removeEventListener(g, M[g]);
      });
    }), v(p), O.skipTransform || P(() => {
      const y = I();
      if (V(y, E()))
        p.style.removeProperty("transform");
      else {
        const M = z(I());
        p.style.setProperty("transform", M.transform ?? null);
      }
    });
  }, {
    ref: {
      enumerable: !0,
      value: v
    },
    isActiveDraggable: {
      enumerable: !0,
      get: f
    },
    dragActivators: {
      enumerable: !0,
      get: () => d(t, !0)
    },
    transform: {
      enumerable: !0,
      get: I
    }
  });
}, pe = (t, a = {}) => {
  const [e, {
    addDroppable: o,
    removeDroppable: s
  }] = B(), [d, u] = re(null);
  X(() => {
    const m = d();
    m && o({
      id: t,
      node: m,
      layout: R(m),
      data: a
    });
  }), _(() => s(t));
  const v = () => e.active.droppableId === t, f = () => e.droppables[t]?.transform || E();
  return Object.defineProperties((m, p) => {
    const D = p ? p() : {};
    u(m), D.skipTransform || P(() => {
      const O = f();
      if (V(O, E()))
        m.style.removeProperty("transform");
      else {
        const y = z(f());
        m.style.setProperty("transform", y.transform ?? null);
      }
    });
  }, {
    ref: {
      enumerable: !0,
      value: u
    },
    isActiveDroppable: {
      enumerable: !0,
      get: v
    },
    transform: {
      enumerable: !0,
      get: f
    }
  });
}, fe = (t, a, e) => {
  const o = t.slice();
  return o.splice(e, 0, ...o.splice(a, 1)), o;
}, ne = ee(), Ae = (t) => {
  const [a] = B(), [e, o] = ae({
    initialIds: [],
    sortedIds: []
  }), s = (v) => v >= 0 && v < e.initialIds.length;
  P(() => {
    o("initialIds", [...t.ids]), o("sortedIds", [...t.ids]);
  }), P(() => {
    a.active.draggableId && a.active.droppableId ? A(() => {
      const v = e.sortedIds.indexOf(a.active.draggableId), f = e.initialIds.indexOf(a.active.droppableId);
      if (!s(v) || !s(f))
        o("sortedIds", [...t.ids]);
      else if (v !== f) {
        const I = fe(e.sortedIds, v, f);
        o("sortedIds", I);
      }
    }) : o("sortedIds", [...t.ids]);
  });
  const u = [e, {}];
  return Z(ne.Provider, {
    value: u,
    get children() {
      return t.children;
    }
  });
}, me = () => te(ne) || null, ye = (t, a) => (e) => {
  t(e), a(e);
}, Me = (t, a = {}) => {
  const [e, {
    addTransformer: o,
    removeTransformer: s
  }] = B(), [d] = me(), u = ve(t, a), v = pe(t, a), f = ye(u.ref, v.ref), I = () => d.initialIds.indexOf(t), m = () => d.sortedIds.indexOf(t), p = (g) => e.droppables[g]?.layout || null, D = () => {
    const g = E(), C = I(), j = m();
    if (j !== C) {
      const T = p(t), w = p(d.initialIds[j]);
      T && w && (g.x = w.x - T.x, g.y = w.y - T.y);
    }
    return g;
  }, O = {
    id: "sortableOffset",
    order: 100,
    callback: (g) => {
      const C = D();
      return {
        x: g.x + C.x,
        y: g.y + C.y
      };
    }
  };
  X(() => o("droppables", t, O)), _(() => s("droppables", t, O.id));
  const y = () => (t === e.active.draggableId && !e.active.overlay ? e.draggables[t]?.transform : e.droppables[t]?.transform) || E();
  return Object.defineProperties((g) => {
    u(g, () => ({
      skipTransform: !0
    })), v(g, () => ({
      skipTransform: !0
    })), P(() => {
      const C = y();
      if (V(C, E()))
        g.style.removeProperty("transform");
      else {
        const j = z(y());
        g.style.setProperty("transform", j.transform ?? null);
      }
    });
  }, {
    ref: {
      enumerable: !0,
      value: f
    },
    transform: {
      enumerable: !0,
      get: y
    },
    isActiveDraggable: {
      enumerable: !0,
      get: () => u.isActiveDraggable
    },
    dragActivators: {
      enumerable: !0,
      get: () => u.dragActivators
    },
    isActiveDroppable: {
      enumerable: !0,
      get: () => v.isActiveDroppable
    }
  });
};
export {
  we as DragDropProvider,
  Se as DragDropSensors,
  Ae as SortableProvider,
  Oe as closestCenter,
  ve as createDraggable,
  pe as createDroppable,
  be as createPointerSensor,
  Me as createSortable,
  ge as mostIntersecting,
  z as transformStyle,
  B as useDragDropContext,
  me as useSortableContext
};
//# sourceMappingURL=index137.js.map
