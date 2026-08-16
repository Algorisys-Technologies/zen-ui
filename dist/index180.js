import q, { useMemo as _, useRef as X, useEffect as k, useContext as pe, useState as be } from "react";
import { useDndContext as ve, useDroppable as he, useDraggable as xe, KeyboardCode as m, closestCorners as Ie, getFirstCollision as me, getScrollableAncestors as we, getClientRect as ye } from "./index179.js";
import { useUniqueId as Re, useIsomorphicLayoutEffect as B, useCombinedRefs as Ce, isKeyboardEvent as Se, CSS as H, subtract as De } from "./index181.js";
function V(e, t, o) {
  const r = e.slice();
  return r.splice(o < 0 ? r.length + o : o, 0, r.splice(t, 1)[0]), r;
}
function Ae(e, t) {
  return e.reduce((o, r, n) => {
    const s = t.get(r);
    return s && (o[n] = s), o;
  }, Array(e.length));
}
function O(e) {
  return e !== null && e >= 0;
}
function Te(e, t) {
  if (e === t)
    return !0;
  if (e.length !== t.length)
    return !1;
  for (let o = 0; o < e.length; o++)
    if (e[o] !== t[o])
      return !1;
  return !0;
}
function Ne(e) {
  return typeof e == "boolean" ? {
    draggable: e,
    droppable: e
  } : e;
}
const E = {
  scaleX: 1,
  scaleY: 1
}, je = (e) => {
  var t;
  let {
    rects: o,
    activeNodeRect: r,
    activeIndex: n,
    overIndex: s,
    index: i
  } = e;
  const a = (t = o[n]) != null ? t : r;
  if (!a)
    return null;
  const d = Oe(o, i, n);
  if (i === n) {
    const c = o[s];
    return c ? {
      x: n < s ? c.left + c.width - (a.left + a.width) : c.left - a.left,
      y: 0,
      ...E
    } : null;
  }
  return i > n && i <= s ? {
    x: -a.width - d,
    y: 0,
    ...E
  } : i < n && i >= s ? {
    x: a.width + d,
    y: 0,
    ...E
  } : {
    x: 0,
    y: 0,
    ...E
  };
};
function Oe(e, t, o) {
  const r = e[t], n = e[t - 1], s = e[t + 1];
  return !r || !n && !s ? 0 : o < t ? n ? r.left - (n.left + n.width) : s.left - (r.left + r.width) : s ? s.left - (r.left + r.width) : r.left - (n.left + n.width);
}
const J = (e) => {
  let {
    rects: t,
    activeIndex: o,
    overIndex: r,
    index: n
  } = e;
  const s = V(t, r, o), i = t[n], a = s[n];
  return !a || !i ? null : {
    x: a.left - i.left,
    y: a.top - i.top,
    scaleX: a.width / i.width,
    scaleY: a.height / i.height
  };
}, L = {
  scaleX: 1,
  scaleY: 1
}, qe = (e) => {
  var t;
  let {
    activeIndex: o,
    activeNodeRect: r,
    index: n,
    rects: s,
    overIndex: i
  } = e;
  const a = (t = s[o]) != null ? t : r;
  if (!a)
    return null;
  if (n === o) {
    const c = s[i];
    return c ? {
      x: 0,
      y: o < i ? c.top + c.height - (a.top + a.height) : c.top - a.top,
      ...L
    } : null;
  }
  const d = Ee(s, n, o);
  return n > o && n <= i ? {
    x: 0,
    y: -a.height - d,
    ...L
  } : n < o && n >= i ? {
    x: 0,
    y: a.height + d,
    ...L
  } : {
    x: 0,
    y: 0,
    ...L
  };
};
function Ee(e, t, o) {
  const r = e[t], n = e[t - 1], s = e[t + 1];
  return r ? o < t ? n ? r.top - (n.top + n.height) : s ? s.top - (r.top + r.height) : 0 : s ? s.top - (r.top + r.height) : n ? r.top - (n.top + n.height) : 0 : 0;
}
const Q = "Sortable", W = /* @__PURE__ */ q.createContext({
  activeIndex: -1,
  containerId: Q,
  disableTransforms: !1,
  items: [],
  overIndex: -1,
  useDragOverlay: !1,
  sortedRects: [],
  strategy: J,
  disabled: {
    draggable: !1,
    droppable: !1
  }
});
function Be(e) {
  let {
    children: t,
    id: o,
    items: r,
    strategy: n = J,
    disabled: s = !1
  } = e;
  const {
    active: i,
    dragOverlay: a,
    droppableRects: d,
    over: c,
    measureDroppableContainers: l
  } = ve(), u = Re(Q, o), f = a.rect !== null, g = _(() => r.map((I) => typeof I == "object" && "id" in I ? I.id : I), [r]), w = i != null, y = i ? g.indexOf(i.id) : -1, v = c ? g.indexOf(c.id) : -1, R = X(g), x = !Te(g, R.current), h = v !== -1 && y === -1 || x, b = Ne(s);
  B(() => {
    x && w && l(g);
  }, [x, g, w, l]), k(() => {
    R.current = g;
  }, [g]);
  const C = _(
    () => ({
      activeIndex: y,
      containerId: u,
      disabled: b,
      disableTransforms: h,
      items: g,
      overIndex: v,
      useDragOverlay: f,
      sortedRects: Ae(g, d),
      strategy: n
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [y, u, b.draggable, b.droppable, h, g, v, d, f, n]
  );
  return q.createElement(W.Provider, {
    value: C
  }, t);
}
const Le = (e) => {
  let {
    id: t,
    items: o,
    activeIndex: r,
    overIndex: n
  } = e;
  return V(o, r, n).indexOf(t);
}, _e = (e) => {
  let {
    containerId: t,
    isSorting: o,
    wasDragging: r,
    index: n,
    items: s,
    newIndex: i,
    previousItems: a,
    previousContainerId: d,
    transition: c
  } = e;
  return !c || !r || a !== s && n === i ? !1 : o ? !0 : i !== n && t === d;
}, ke = {
  duration: 200,
  easing: "ease"
}, Z = "transform", $e = /* @__PURE__ */ H.Transition.toString({
  property: Z,
  duration: 0,
  easing: "linear"
}), ze = {
  roleDescription: "sortable"
};
function Ge(e) {
  let {
    disabled: t,
    index: o,
    node: r,
    rect: n
  } = e;
  const [s, i] = be(null), a = X(o);
  return B(() => {
    if (!t && o !== a.current && r.current) {
      const d = n.current;
      if (d) {
        const c = ye(r.current, {
          ignoreTransform: !0
        }), l = {
          x: d.left - c.left,
          y: d.top - c.top,
          scaleX: d.width / c.width,
          scaleY: d.height / c.height
        };
        (l.x || l.y) && i(l);
      }
    }
    o !== a.current && (a.current = o);
  }, [t, o, r, n]), k(() => {
    s && i(null);
  }, [s]), s;
}
function He(e) {
  let {
    animateLayoutChanges: t = _e,
    attributes: o,
    disabled: r,
    data: n,
    getNewIndex: s = Le,
    id: i,
    strategy: a,
    resizeObserverConfig: d,
    transition: c = ke
  } = e;
  const {
    items: l,
    containerId: u,
    activeIndex: f,
    disabled: g,
    disableTransforms: w,
    sortedRects: y,
    overIndex: v,
    useDragOverlay: R,
    strategy: x
  } = pe(W), h = Xe(r, g), b = l.indexOf(i), C = _(() => ({
    sortable: {
      containerId: u,
      index: b,
      items: l
    },
    ...n
  }), [u, n, b, l]), I = _(() => l.slice(l.indexOf(i)), [l, i]), {
    rect: N,
    node: P,
    isOver: te,
    setNodeRef: Y
  } = he({
    id: i,
    data: C,
    disabled: h.droppable,
    resizeObserverConfig: {
      updateMeasurementsFor: I,
      ...d
    }
  }), {
    active: A,
    activatorEvent: re,
    activeNodeRect: ne,
    attributes: oe,
    setNodeRef: F,
    listeners: ie,
    isDragging: z,
    over: se,
    setActivatorNodeRef: ae,
    transform: ce
  } = xe({
    id: i,
    data: C,
    attributes: {
      ...ze,
      ...o
    },
    disabled: h.draggable
  }), le = Ce(Y, F), S = !!A, K = S && !w && O(f) && O(v), M = !R && z, U = M && K ? ce : null, de = K ? U ?? (a ?? x)({
    rects: y,
    activeNodeRect: ne,
    activeIndex: f,
    overIndex: v,
    index: b
  }) : null, T = O(f) && O(v) ? s({
    id: i,
    items: l,
    activeIndex: f,
    overIndex: v
  }) : b, D = A?.id, p = X({
    activeId: D,
    items: l,
    newIndex: T,
    containerId: u
  }), ue = l !== p.current.items, j = t({
    active: A,
    containerId: u,
    isDragging: z,
    isSorting: S,
    id: i,
    index: b,
    items: l,
    newIndex: p.current.newIndex,
    previousItems: p.current.items,
    previousContainerId: p.current.containerId,
    transition: c,
    wasDragging: p.current.activeId != null
  }), G = Ge({
    disabled: !j,
    index: b,
    node: P,
    rect: N
  });
  return k(() => {
    S && p.current.newIndex !== T && (p.current.newIndex = T), u !== p.current.containerId && (p.current.containerId = u), l !== p.current.items && (p.current.items = l);
  }, [S, T, u, l]), k(() => {
    if (D === p.current.activeId)
      return;
    if (D != null && p.current.activeId == null) {
      p.current.activeId = D;
      return;
    }
    const ge = setTimeout(() => {
      p.current.activeId = D;
    }, 50);
    return () => clearTimeout(ge);
  }, [D]), {
    active: A,
    activeIndex: f,
    attributes: oe,
    data: C,
    rect: N,
    index: b,
    newIndex: T,
    items: l,
    isOver: te,
    isSorting: S,
    isDragging: z,
    listeners: ie,
    node: P,
    overIndex: v,
    over: se,
    setNodeRef: le,
    setActivatorNodeRef: ae,
    setDroppableNodeRef: Y,
    setDraggableNodeRef: F,
    transform: G ?? de,
    transition: fe()
  };
  function fe() {
    if (
      // Temporarily disable transitions for a single frame to set up derived transforms
      G || // Or to prevent items jumping to back to their "new" position when items change
      ue && p.current.newIndex === b
    )
      return $e;
    if (!(M && !Se(re) || !c) && (S || j))
      return H.Transition.toString({
        ...c,
        property: Z
      });
  }
}
function Xe(e, t) {
  var o, r;
  return typeof e == "boolean" ? {
    draggable: e,
    // Backwards compatibility
    droppable: !1
  } : {
    draggable: (o = e?.draggable) != null ? o : t.draggable,
    droppable: (r = e?.droppable) != null ? r : t.droppable
  };
}
function $(e) {
  if (!e)
    return !1;
  const t = e.data.current;
  return !!(t && "sortable" in t && typeof t.sortable == "object" && "containerId" in t.sortable && "items" in t.sortable && "index" in t.sortable);
}
const Pe = [m.Down, m.Right, m.Up, m.Left], Ve = (e, t) => {
  let {
    context: {
      active: o,
      collisionRect: r,
      droppableRects: n,
      droppableContainers: s,
      over: i,
      scrollableAncestors: a
    }
  } = t;
  if (Pe.includes(e.code)) {
    if (e.preventDefault(), !o || !r)
      return;
    const d = [];
    s.getEnabled().forEach((u) => {
      if (!u || u != null && u.disabled)
        return;
      const f = n.get(u.id);
      if (f)
        switch (e.code) {
          case m.Down:
            r.top < f.top && d.push(u);
            break;
          case m.Up:
            r.top > f.top && d.push(u);
            break;
          case m.Left:
            r.left > f.left && d.push(u);
            break;
          case m.Right:
            r.left < f.left && d.push(u);
            break;
        }
    });
    const c = Ie({
      collisionRect: r,
      droppableRects: n,
      droppableContainers: d
    });
    let l = me(c, "id");
    if (l === i?.id && c.length > 1 && (l = c[1].id), l != null) {
      const u = s.get(o.id), f = s.get(l), g = f ? n.get(f.id) : null, w = f?.node.current;
      if (w && g && u && f) {
        const v = we(w).some((I, N) => a[N] !== I), R = ee(u, f), x = Ye(u, f), h = v || !R ? {
          x: 0,
          y: 0
        } : {
          x: x ? r.width - g.width : 0,
          y: x ? r.height - g.height : 0
        }, b = {
          x: g.left,
          y: g.top
        };
        return h.x && h.y ? b : De(b, h);
      }
    }
  }
};
function ee(e, t) {
  return !$(e) || !$(t) ? !1 : e.data.current.sortable.containerId === t.data.current.sortable.containerId;
}
function Ye(e, t) {
  return !$(e) || !$(t) || !ee(e, t) ? !1 : e.data.current.sortable.index < t.data.current.sortable.index;
}
export {
  Be as SortableContext,
  V as arrayMove,
  _e as defaultAnimateLayoutChanges,
  Le as defaultNewIndexGetter,
  $ as hasSortableData,
  je as horizontalListSortingStrategy,
  J as rectSortingStrategy,
  Ve as sortableKeyboardCoordinates,
  He as useSortable,
  qe as verticalListSortingStrategy
};
//# sourceMappingURL=index180.js.map
