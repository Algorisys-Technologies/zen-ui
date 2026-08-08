import M, { useMemo as A, memo as xn, useReducer as Dn, useState as K, useRef as P, useCallback as U, useEffect as O, useContext as de, createContext as Ne, cloneElement as Cn, forwardRef as Sn } from "react";
import { unstable_batchedUpdates as Be, createPortal as Rn } from "react-dom";
import { useLatestValue as Ae, useUniqueId as Ue, getEventCoordinates as $e, getWindow as J, add as ye, useIsomorphicLayoutEffect as fe, useNodeRef as Ke, getOwnerDocument as me, isKeyboardEvent as lt, subtract as We, useLazyMemo as Me, isHTMLElement as He, canUseDOM as ct, useInterval as En, usePrevious as Xe, findFirstFocusableNode as An, useEvent as ut, CSS as rt, isWindow as dt, isNode as On, isDocument as _t, isSVGElement as Nn } from "./index179.js";
import { useAnnouncement as Mn, HiddenText as Tn, LiveRegion as Ln } from "./index221.js";
const qt = /* @__PURE__ */ Ne(null);
function kn(e) {
  const t = de(qt);
  O(() => {
    if (!t)
      throw new Error("useDndMonitor must be used within a children of <DndContext>");
    return t(e);
  }, [e, t]);
}
function In() {
  const [e] = K(() => /* @__PURE__ */ new Set()), t = U((r) => (e.add(r), () => e.delete(r)), [e]);
  return [U((r) => {
    let {
      type: i,
      event: o
    } = r;
    e.forEach((a) => {
      var s;
      return (s = a[i]) == null ? void 0 : s.call(a, o);
    });
  }, [e]), t];
}
const Pn = {
  draggable: `
    To pick up a draggable item, press the space bar.
    While dragging, use the arrow keys to move the item.
    Press space again to drop the item in its new position, or press escape to cancel.
  `
}, zn = {
  onDragStart(e) {
    let {
      active: t
    } = e;
    return "Picked up draggable item " + t.id + ".";
  },
  onDragOver(e) {
    let {
      active: t,
      over: n
    } = e;
    return n ? "Draggable item " + t.id + " was moved over droppable area " + n.id + "." : "Draggable item " + t.id + " is no longer over a droppable area.";
  },
  onDragEnd(e) {
    let {
      active: t,
      over: n
    } = e;
    return n ? "Draggable item " + t.id + " was dropped over droppable area " + n.id : "Draggable item " + t.id + " was dropped.";
  },
  onDragCancel(e) {
    let {
      active: t
    } = e;
    return "Dragging was cancelled. Draggable item " + t.id + " was dropped.";
  }
};
function Bn(e) {
  let {
    announcements: t = zn,
    container: n,
    hiddenTextDescribedById: r,
    screenReaderInstructions: i = Pn
  } = e;
  const {
    announce: o,
    announcement: a
  } = Mn(), s = Ue("DndLiveRegion"), [l, c] = K(!1);
  if (O(() => {
    c(!0);
  }, []), kn(A(() => ({
    onDragStart(u) {
      let {
        active: h
      } = u;
      o(t.onDragStart({
        active: h
      }));
    },
    onDragMove(u) {
      let {
        active: h,
        over: f
      } = u;
      t.onDragMove && o(t.onDragMove({
        active: h,
        over: f
      }));
    },
    onDragOver(u) {
      let {
        active: h,
        over: f
      } = u;
      o(t.onDragOver({
        active: h,
        over: f
      }));
    },
    onDragEnd(u) {
      let {
        active: h,
        over: f
      } = u;
      o(t.onDragEnd({
        active: h,
        over: f
      }));
    },
    onDragCancel(u) {
      let {
        active: h,
        over: f
      } = u;
      o(t.onDragCancel({
        active: h,
        over: f
      }));
    }
  }), [o, t])), !l)
    return null;
  const d = M.createElement(M.Fragment, null, M.createElement(Tn, {
    id: r,
    value: i.draggable
  }), M.createElement(Ln, {
    id: s,
    announcement: a
  }));
  return n ? Rn(d, n) : d;
}
var N;
(function(e) {
  e.DragStart = "dragStart", e.DragMove = "dragMove", e.DragEnd = "dragEnd", e.DragCancel = "dragCancel", e.DragOver = "dragOver", e.RegisterDroppable = "registerDroppable", e.SetDroppableDisabled = "setDroppableDisabled", e.UnregisterDroppable = "unregisterDroppable";
})(N || (N = {}));
function je() {
}
function no(e, t) {
  return A(
    () => ({
      sensor: e,
      options: t ?? {}
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [e, t]
  );
}
function ro() {
  for (var e = arguments.length, t = new Array(e), n = 0; n < e; n++)
    t[n] = arguments[n];
  return A(
    () => [...t].filter((r) => r != null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [...t]
  );
}
const H = /* @__PURE__ */ Object.freeze({
  x: 0,
  y: 0
});
function ft(e, t) {
  return Math.sqrt(Math.pow(e.x - t.x, 2) + Math.pow(e.y - t.y, 2));
}
function Fn(e, t) {
  const n = $e(e);
  if (!n)
    return "0 0";
  const r = {
    x: (n.x - t.left) / t.width * 100,
    y: (n.y - t.top) / t.height * 100
  };
  return r.x + "% " + r.y + "%";
}
function ht(e, t) {
  let {
    data: {
      value: n
    }
  } = e, {
    data: {
      value: r
    }
  } = t;
  return n - r;
}
function $n(e, t) {
  let {
    data: {
      value: n
    }
  } = e, {
    data: {
      value: r
    }
  } = t;
  return r - n;
}
function ot(e) {
  let {
    left: t,
    top: n,
    height: r,
    width: i
  } = e;
  return [{
    x: t,
    y: n
  }, {
    x: t + i,
    y: n
  }, {
    x: t,
    y: n + r
  }, {
    x: t + i,
    y: n + r
  }];
}
function Kn(e, t) {
  if (!e || e.length === 0)
    return null;
  const [n] = e;
  return n[t];
}
function Pt(e, t, n) {
  return t === void 0 && (t = e.left), n === void 0 && (n = e.top), {
    x: t + e.width * 0.5,
    y: n + e.height * 0.5
  };
}
const oo = (e) => {
  let {
    collisionRect: t,
    droppableRects: n,
    droppableContainers: r
  } = e;
  const i = Pt(t, t.left, t.top), o = [];
  for (const a of r) {
    const {
      id: s
    } = a, l = n.get(s);
    if (l) {
      const c = ft(Pt(l), i);
      o.push({
        id: s,
        data: {
          droppableContainer: a,
          value: c
        }
      });
    }
  }
  return o.sort(ht);
}, io = (e) => {
  let {
    collisionRect: t,
    droppableRects: n,
    droppableContainers: r
  } = e;
  const i = ot(t), o = [];
  for (const a of r) {
    const {
      id: s
    } = a, l = n.get(s);
    if (l) {
      const c = ot(l), d = i.reduce((h, f, x) => h + ft(c[x], f), 0), u = Number((d / 4).toFixed(4));
      o.push({
        id: s,
        data: {
          droppableContainer: a,
          value: u
        }
      });
    }
  }
  return o.sort(ht);
};
function Wn(e, t) {
  const n = Math.max(t.top, e.top), r = Math.max(t.left, e.left), i = Math.min(t.left + t.width, e.left + e.width), o = Math.min(t.top + t.height, e.top + e.height), a = i - r, s = o - n;
  if (r < i && n < o) {
    const l = t.width * t.height, c = e.width * e.height, d = a * s, u = d / (l + c - d);
    return Number(u.toFixed(4));
  }
  return 0;
}
const Xn = (e) => {
  let {
    collisionRect: t,
    droppableRects: n,
    droppableContainers: r
  } = e;
  const i = [];
  for (const o of r) {
    const {
      id: a
    } = o, s = n.get(a);
    if (s) {
      const l = Wn(s, t);
      l > 0 && i.push({
        id: a,
        data: {
          droppableContainer: o,
          value: l
        }
      });
    }
  }
  return i.sort($n);
};
function jn(e, t) {
  const {
    top: n,
    left: r,
    bottom: i,
    right: o
  } = t;
  return n <= e.y && e.y <= i && r <= e.x && e.x <= o;
}
const so = (e) => {
  let {
    droppableContainers: t,
    droppableRects: n,
    pointerCoordinates: r
  } = e;
  if (!r)
    return [];
  const i = [];
  for (const o of t) {
    const {
      id: a
    } = o, s = n.get(a);
    if (s && jn(r, s)) {
      const c = ot(s).reduce((u, h) => u + ft(r, h), 0), d = Number((c / 4).toFixed(4));
      i.push({
        id: a,
        data: {
          droppableContainer: o,
          value: d
        }
      });
    }
  }
  return i.sort(ht);
};
function Yn(e, t, n) {
  return {
    ...e,
    scaleX: t && n ? t.width / n.width : 1,
    scaleY: t && n ? t.height / n.height : 1
  };
}
function Jt(e, t) {
  return e && t ? {
    x: e.left - t.left,
    y: e.top - t.top
  } : H;
}
function Un(e) {
  return function(n) {
    for (var r = arguments.length, i = new Array(r > 1 ? r - 1 : 0), o = 1; o < r; o++)
      i[o - 1] = arguments[o];
    return i.reduce((a, s) => ({
      ...a,
      top: a.top + e * s.y,
      bottom: a.bottom + e * s.y,
      left: a.left + e * s.x,
      right: a.right + e * s.x
    }), {
      ...n
    });
  };
}
const Hn = /* @__PURE__ */ Un(1);
function Vt(e) {
  if (e.startsWith("matrix3d(")) {
    const t = e.slice(9, -1).split(/, /);
    return {
      x: +t[12],
      y: +t[13],
      scaleX: +t[0],
      scaleY: +t[5]
    };
  } else if (e.startsWith("matrix(")) {
    const t = e.slice(7, -1).split(/, /);
    return {
      x: +t[4],
      y: +t[5],
      scaleX: +t[0],
      scaleY: +t[3]
    };
  }
  return null;
}
function _n(e, t, n) {
  const r = Vt(t);
  if (!r)
    return e;
  const {
    scaleX: i,
    scaleY: o,
    x: a,
    y: s
  } = r, l = e.left - a - (1 - i) * parseFloat(n), c = e.top - s - (1 - o) * parseFloat(n.slice(n.indexOf(" ") + 1)), d = i ? e.width / i : e.width, u = o ? e.height / o : e.height;
  return {
    width: d,
    height: u,
    top: c,
    right: l + d,
    bottom: c + u,
    left: l
  };
}
const qn = {
  ignoreTransform: !1
};
function Te(e, t) {
  t === void 0 && (t = qn);
  let n = e.getBoundingClientRect();
  if (t.ignoreTransform) {
    const {
      transform: c,
      transformOrigin: d
    } = J(e).getComputedStyle(e);
    c && (n = _n(n, c, d));
  }
  const {
    top: r,
    left: i,
    width: o,
    height: a,
    bottom: s,
    right: l
  } = n;
  return {
    top: r,
    left: i,
    width: o,
    height: a,
    bottom: s,
    right: l
  };
}
function zt(e) {
  return Te(e, {
    ignoreTransform: !0
  });
}
function Jn(e) {
  const t = e.innerWidth, n = e.innerHeight;
  return {
    top: 0,
    left: 0,
    right: t,
    bottom: n,
    width: t,
    height: n
  };
}
function Vn(e, t) {
  return t === void 0 && (t = J(e).getComputedStyle(e)), t.position === "fixed";
}
function Gn(e, t) {
  t === void 0 && (t = J(e).getComputedStyle(e));
  const n = /(auto|scroll|overlay)/;
  return ["overflow", "overflowX", "overflowY"].some((i) => {
    const o = t[i];
    return typeof o == "string" ? n.test(o) : !1;
  });
}
function gt(e, t) {
  const n = [];
  function r(i) {
    if (t != null && n.length >= t || !i)
      return n;
    if (_t(i) && i.scrollingElement != null && !n.includes(i.scrollingElement))
      return n.push(i.scrollingElement), n;
    if (!He(i) || Nn(i) || n.includes(i))
      return n;
    const o = J(e).getComputedStyle(i);
    return i !== e && Gn(i, o) && n.push(i), Vn(i, o) ? n : r(i.parentNode);
  }
  return e ? r(e) : n;
}
function Gt(e) {
  const [t] = gt(e, 1);
  return t ?? null;
}
function et(e) {
  return !ct || !e ? null : dt(e) ? e : On(e) ? _t(e) || e === me(e).scrollingElement ? window : He(e) ? e : null : null;
}
function Qt(e) {
  return dt(e) ? e.scrollX : e.scrollLeft;
}
function Zt(e) {
  return dt(e) ? e.scrollY : e.scrollTop;
}
function it(e) {
  return {
    x: Qt(e),
    y: Zt(e)
  };
}
var L;
(function(e) {
  e[e.Forward = 1] = "Forward", e[e.Backward = -1] = "Backward";
})(L || (L = {}));
function en(e) {
  return !ct || !e ? !1 : e === document.scrollingElement;
}
function tn(e) {
  const t = {
    x: 0,
    y: 0
  }, n = en(e) ? {
    height: window.innerHeight,
    width: window.innerWidth
  } : {
    height: e.clientHeight,
    width: e.clientWidth
  }, r = {
    x: e.scrollWidth - n.width,
    y: e.scrollHeight - n.height
  }, i = e.scrollTop <= t.y, o = e.scrollLeft <= t.x, a = e.scrollTop >= r.y, s = e.scrollLeft >= r.x;
  return {
    isTop: i,
    isLeft: o,
    isBottom: a,
    isRight: s,
    maxScroll: r,
    minScroll: t
  };
}
const Qn = {
  x: 0.2,
  y: 0.2
};
function Zn(e, t, n, r, i) {
  let {
    top: o,
    left: a,
    right: s,
    bottom: l
  } = n;
  r === void 0 && (r = 10), i === void 0 && (i = Qn);
  const {
    isTop: c,
    isBottom: d,
    isLeft: u,
    isRight: h
  } = tn(e), f = {
    x: 0,
    y: 0
  }, x = {
    x: 0,
    y: 0
  }, g = {
    height: t.height * i.y,
    width: t.width * i.x
  };
  return !c && o <= t.top + g.height ? (f.y = L.Backward, x.y = r * Math.abs((t.top + g.height - o) / g.height)) : !d && l >= t.bottom - g.height && (f.y = L.Forward, x.y = r * Math.abs((t.bottom - g.height - l) / g.height)), !h && s >= t.right - g.width ? (f.x = L.Forward, x.x = r * Math.abs((t.right - g.width - s) / g.width)) : !u && a <= t.left + g.width && (f.x = L.Backward, x.x = r * Math.abs((t.left + g.width - a) / g.width)), {
    direction: f,
    speed: x
  };
}
function er(e) {
  if (e === document.scrollingElement) {
    const {
      innerWidth: o,
      innerHeight: a
    } = window;
    return {
      top: 0,
      left: 0,
      right: o,
      bottom: a,
      width: o,
      height: a
    };
  }
  const {
    top: t,
    left: n,
    right: r,
    bottom: i
  } = e.getBoundingClientRect();
  return {
    top: t,
    left: n,
    right: r,
    bottom: i,
    width: e.clientWidth,
    height: e.clientHeight
  };
}
function nn(e) {
  return e.reduce((t, n) => ye(t, it(n)), H);
}
function tr(e) {
  return e.reduce((t, n) => t + Qt(n), 0);
}
function nr(e) {
  return e.reduce((t, n) => t + Zt(n), 0);
}
function rn(e, t) {
  if (t === void 0 && (t = Te), !e)
    return;
  const {
    top: n,
    left: r,
    bottom: i,
    right: o
  } = t(e);
  Gt(e) && (i <= 0 || o <= 0 || n >= window.innerHeight || r >= window.innerWidth) && e.scrollIntoView({
    block: "center",
    inline: "center"
  });
}
const rr = [["x", ["left", "right"], tr], ["y", ["top", "bottom"], nr]];
class vt {
  constructor(t, n) {
    this.rect = void 0, this.width = void 0, this.height = void 0, this.top = void 0, this.bottom = void 0, this.right = void 0, this.left = void 0;
    const r = gt(n), i = nn(r);
    this.rect = {
      ...t
    }, this.width = t.width, this.height = t.height;
    for (const [o, a, s] of rr)
      for (const l of a)
        Object.defineProperty(this, l, {
          get: () => {
            const c = s(r), d = i[o] - c;
            return this.rect[l] + d;
          },
          enumerable: !0
        });
    Object.defineProperty(this, "rect", {
      enumerable: !1
    });
  }
}
class Se {
  constructor(t) {
    this.target = void 0, this.listeners = [], this.removeAll = () => {
      this.listeners.forEach((n) => {
        var r;
        return (r = this.target) == null ? void 0 : r.removeEventListener(...n);
      });
    }, this.target = t;
  }
  add(t, n, r) {
    var i;
    (i = this.target) == null || i.addEventListener(t, n, r), this.listeners.push([t, n, r]);
  }
}
function or(e) {
  const {
    EventTarget: t
  } = J(e);
  return e instanceof t ? e : me(e);
}
function tt(e, t) {
  const n = Math.abs(e.x), r = Math.abs(e.y);
  return typeof t == "number" ? Math.sqrt(n ** 2 + r ** 2) > t : "x" in t && "y" in t ? n > t.x && r > t.y : "x" in t ? n > t.x : "y" in t ? r > t.y : !1;
}
var X;
(function(e) {
  e.Click = "click", e.DragStart = "dragstart", e.Keydown = "keydown", e.ContextMenu = "contextmenu", e.Resize = "resize", e.SelectionChange = "selectionchange", e.VisibilityChange = "visibilitychange";
})(X || (X = {}));
function Bt(e) {
  e.preventDefault();
}
function ir(e) {
  e.stopPropagation();
}
var D;
(function(e) {
  e.Space = "Space", e.Down = "ArrowDown", e.Right = "ArrowRight", e.Left = "ArrowLeft", e.Up = "ArrowUp", e.Esc = "Escape", e.Enter = "Enter", e.Tab = "Tab";
})(D || (D = {}));
const on = {
  start: [D.Space, D.Enter],
  cancel: [D.Esc],
  end: [D.Space, D.Enter, D.Tab]
}, sr = (e, t) => {
  let {
    currentCoordinates: n
  } = t;
  switch (e.code) {
    case D.Right:
      return {
        ...n,
        x: n.x + 25
      };
    case D.Left:
      return {
        ...n,
        x: n.x - 25
      };
    case D.Down:
      return {
        ...n,
        y: n.y + 25
      };
    case D.Up:
      return {
        ...n,
        y: n.y - 25
      };
  }
};
class sn {
  constructor(t) {
    this.props = void 0, this.autoScrollEnabled = !1, this.referenceCoordinates = void 0, this.listeners = void 0, this.windowListeners = void 0, this.props = t;
    const {
      event: {
        target: n
      }
    } = t;
    this.props = t, this.listeners = new Se(me(n)), this.windowListeners = new Se(J(n)), this.handleKeyDown = this.handleKeyDown.bind(this), this.handleCancel = this.handleCancel.bind(this), this.attach();
  }
  attach() {
    this.handleStart(), this.windowListeners.add(X.Resize, this.handleCancel), this.windowListeners.add(X.VisibilityChange, this.handleCancel), setTimeout(() => this.listeners.add(X.Keydown, this.handleKeyDown));
  }
  handleStart() {
    const {
      activeNode: t,
      onStart: n
    } = this.props, r = t.node.current;
    r && rn(r), n(H);
  }
  handleKeyDown(t) {
    if (lt(t)) {
      const {
        active: n,
        context: r,
        options: i
      } = this.props, {
        keyboardCodes: o = on,
        coordinateGetter: a = sr,
        scrollBehavior: s = "smooth"
      } = i, {
        code: l
      } = t;
      if (o.end.includes(l)) {
        this.handleEnd(t);
        return;
      }
      if (o.cancel.includes(l)) {
        this.handleCancel(t);
        return;
      }
      const {
        collisionRect: c
      } = r.current, d = c ? {
        x: c.left,
        y: c.top
      } : H;
      this.referenceCoordinates || (this.referenceCoordinates = d);
      const u = a(t, {
        active: n,
        context: r.current,
        currentCoordinates: d
      });
      if (u) {
        const h = We(u, d), f = {
          x: 0,
          y: 0
        }, {
          scrollableAncestors: x
        } = r.current;
        for (const g of x) {
          const v = t.code, {
            isTop: y,
            isRight: w,
            isLeft: m,
            isBottom: T,
            maxScroll: C,
            minScroll: S
          } = tn(g), p = er(g), b = {
            x: Math.min(v === D.Right ? p.right - p.width / 2 : p.right, Math.max(v === D.Right ? p.left : p.left + p.width / 2, u.x)),
            y: Math.min(v === D.Down ? p.bottom - p.height / 2 : p.bottom, Math.max(v === D.Down ? p.top : p.top + p.height / 2, u.y))
          }, R = v === D.Right && !w || v === D.Left && !m, k = v === D.Down && !T || v === D.Up && !y;
          if (R && b.x !== u.x) {
            const E = g.scrollLeft + h.x, V = v === D.Right && E <= C.x || v === D.Left && E >= S.x;
            if (V && !h.y) {
              g.scrollTo({
                left: E,
                behavior: s
              });
              return;
            }
            V ? f.x = g.scrollLeft - E : f.x = v === D.Right ? g.scrollLeft - C.x : g.scrollLeft - S.x, f.x && g.scrollBy({
              left: -f.x,
              behavior: s
            });
            break;
          } else if (k && b.y !== u.y) {
            const E = g.scrollTop + h.y, V = v === D.Down && E <= C.y || v === D.Up && E >= S.y;
            if (V && !h.x) {
              g.scrollTo({
                top: E,
                behavior: s
              });
              return;
            }
            V ? f.y = g.scrollTop - E : f.y = v === D.Down ? g.scrollTop - C.y : g.scrollTop - S.y, f.y && g.scrollBy({
              top: -f.y,
              behavior: s
            });
            break;
          }
        }
        this.handleMove(t, ye(We(u, this.referenceCoordinates), f));
      }
    }
  }
  handleMove(t, n) {
    const {
      onMove: r
    } = this.props;
    t.preventDefault(), r(n);
  }
  handleEnd(t) {
    const {
      onEnd: n
    } = this.props;
    t.preventDefault(), this.detach(), n();
  }
  handleCancel(t) {
    const {
      onCancel: n
    } = this.props;
    t.preventDefault(), this.detach(), n();
  }
  detach() {
    this.listeners.removeAll(), this.windowListeners.removeAll();
  }
}
sn.activators = [{
  eventName: "onKeyDown",
  handler: (e, t, n) => {
    let {
      keyboardCodes: r = on,
      onActivation: i
    } = t, {
      active: o
    } = n;
    const {
      code: a
    } = e.nativeEvent;
    if (r.start.includes(a)) {
      const s = o.activatorNode.current;
      return s && e.target !== s ? !1 : (e.preventDefault(), i?.({
        event: e.nativeEvent
      }), !0);
    }
    return !1;
  }
}];
function Ft(e) {
  return !!(e && "distance" in e);
}
function $t(e) {
  return !!(e && "delay" in e);
}
class pt {
  constructor(t, n, r) {
    var i;
    r === void 0 && (r = or(t.event.target)), this.props = void 0, this.events = void 0, this.autoScrollEnabled = !0, this.document = void 0, this.activated = !1, this.initialCoordinates = void 0, this.timeoutId = null, this.listeners = void 0, this.documentListeners = void 0, this.windowListeners = void 0, this.props = t, this.events = n;
    const {
      event: o
    } = t, {
      target: a
    } = o;
    this.props = t, this.events = n, this.document = me(a), this.documentListeners = new Se(this.document), this.listeners = new Se(r), this.windowListeners = new Se(J(a)), this.initialCoordinates = (i = $e(o)) != null ? i : H, this.handleStart = this.handleStart.bind(this), this.handleMove = this.handleMove.bind(this), this.handleEnd = this.handleEnd.bind(this), this.handleCancel = this.handleCancel.bind(this), this.handleKeydown = this.handleKeydown.bind(this), this.removeTextSelection = this.removeTextSelection.bind(this), this.attach();
  }
  attach() {
    const {
      events: t,
      props: {
        options: {
          activationConstraint: n,
          bypassActivationConstraint: r
        }
      }
    } = this;
    if (this.listeners.add(t.move.name, this.handleMove, {
      passive: !1
    }), this.listeners.add(t.end.name, this.handleEnd), t.cancel && this.listeners.add(t.cancel.name, this.handleCancel), this.windowListeners.add(X.Resize, this.handleCancel), this.windowListeners.add(X.DragStart, Bt), this.windowListeners.add(X.VisibilityChange, this.handleCancel), this.windowListeners.add(X.ContextMenu, Bt), this.documentListeners.add(X.Keydown, this.handleKeydown), n) {
      if (r != null && r({
        event: this.props.event,
        activeNode: this.props.activeNode,
        options: this.props.options
      }))
        return this.handleStart();
      if ($t(n)) {
        this.timeoutId = setTimeout(this.handleStart, n.delay), this.handlePending(n);
        return;
      }
      if (Ft(n)) {
        this.handlePending(n);
        return;
      }
    }
    this.handleStart();
  }
  detach() {
    this.listeners.removeAll(), this.windowListeners.removeAll(), setTimeout(this.documentListeners.removeAll, 50), this.timeoutId !== null && (clearTimeout(this.timeoutId), this.timeoutId = null);
  }
  handlePending(t, n) {
    const {
      active: r,
      onPending: i
    } = this.props;
    i(r, t, this.initialCoordinates, n);
  }
  handleStart() {
    const {
      initialCoordinates: t
    } = this, {
      onStart: n
    } = this.props;
    t && (this.activated = !0, this.documentListeners.add(X.Click, ir, {
      capture: !0
    }), this.removeTextSelection(), this.documentListeners.add(X.SelectionChange, this.removeTextSelection), n(t));
  }
  handleMove(t) {
    var n;
    const {
      activated: r,
      initialCoordinates: i,
      props: o
    } = this, {
      onMove: a,
      options: {
        activationConstraint: s
      }
    } = o;
    if (!i)
      return;
    const l = (n = $e(t)) != null ? n : H, c = We(i, l);
    if (!r && s) {
      if (Ft(s)) {
        if (s.tolerance != null && tt(c, s.tolerance))
          return this.handleCancel();
        if (tt(c, s.distance))
          return this.handleStart();
      }
      if ($t(s) && tt(c, s.tolerance))
        return this.handleCancel();
      this.handlePending(s, c);
      return;
    }
    t.cancelable && t.preventDefault(), a(l);
  }
  handleEnd() {
    const {
      onAbort: t,
      onEnd: n
    } = this.props;
    this.detach(), this.activated || t(this.props.active), n();
  }
  handleCancel() {
    const {
      onAbort: t,
      onCancel: n
    } = this.props;
    this.detach(), this.activated || t(this.props.active), n();
  }
  handleKeydown(t) {
    t.code === D.Esc && this.handleCancel();
  }
  removeTextSelection() {
    var t;
    (t = this.document.getSelection()) == null || t.removeAllRanges();
  }
}
const ar = {
  cancel: {
    name: "pointercancel"
  },
  move: {
    name: "pointermove"
  },
  end: {
    name: "pointerup"
  }
};
class an extends pt {
  constructor(t) {
    const {
      event: n
    } = t, r = me(n.target);
    super(t, ar, r);
  }
}
an.activators = [{
  eventName: "onPointerDown",
  handler: (e, t) => {
    let {
      nativeEvent: n
    } = e, {
      onActivation: r
    } = t;
    return !n.isPrimary || n.button !== 0 ? !1 : (r?.({
      event: n
    }), !0);
  }
}];
const lr = {
  move: {
    name: "mousemove"
  },
  end: {
    name: "mouseup"
  }
};
var st;
(function(e) {
  e[e.RightClick = 2] = "RightClick";
})(st || (st = {}));
class cr extends pt {
  constructor(t) {
    super(t, lr, me(t.event.target));
  }
}
cr.activators = [{
  eventName: "onMouseDown",
  handler: (e, t) => {
    let {
      nativeEvent: n
    } = e, {
      onActivation: r
    } = t;
    return n.button === st.RightClick ? !1 : (r?.({
      event: n
    }), !0);
  }
}];
const nt = {
  cancel: {
    name: "touchcancel"
  },
  move: {
    name: "touchmove"
  },
  end: {
    name: "touchend"
  }
};
class ur extends pt {
  constructor(t) {
    super(t, nt);
  }
  static setup() {
    return window.addEventListener(nt.move.name, t, {
      capture: !1,
      passive: !1
    }), function() {
      window.removeEventListener(nt.move.name, t);
    };
    function t() {
    }
  }
}
ur.activators = [{
  eventName: "onTouchStart",
  handler: (e, t) => {
    let {
      nativeEvent: n
    } = e, {
      onActivation: r
    } = t;
    const {
      touches: i
    } = n;
    return i.length > 1 ? !1 : (r?.({
      event: n
    }), !0);
  }
}];
var Re;
(function(e) {
  e[e.Pointer = 0] = "Pointer", e[e.DraggableRect = 1] = "DraggableRect";
})(Re || (Re = {}));
var Ye;
(function(e) {
  e[e.TreeOrder = 0] = "TreeOrder", e[e.ReversedTreeOrder = 1] = "ReversedTreeOrder";
})(Ye || (Ye = {}));
function dr(e) {
  let {
    acceleration: t,
    activator: n = Re.Pointer,
    canScroll: r,
    draggingRect: i,
    enabled: o,
    interval: a = 5,
    order: s = Ye.TreeOrder,
    pointerCoordinates: l,
    scrollableAncestors: c,
    scrollableAncestorRects: d,
    delta: u,
    threshold: h
  } = e;
  const f = hr({
    delta: u,
    disabled: !o
  }), [x, g] = En(), v = P({
    x: 0,
    y: 0
  }), y = P({
    x: 0,
    y: 0
  }), w = A(() => {
    switch (n) {
      case Re.Pointer:
        return l ? {
          top: l.y,
          bottom: l.y,
          left: l.x,
          right: l.x
        } : null;
      case Re.DraggableRect:
        return i;
    }
  }, [n, i, l]), m = P(null), T = U(() => {
    const S = m.current;
    if (!S)
      return;
    const p = v.current.x * y.current.x, b = v.current.y * y.current.y;
    S.scrollBy(p, b);
  }, []), C = A(() => s === Ye.TreeOrder ? [...c].reverse() : c, [s, c]);
  O(
    () => {
      if (!o || !c.length || !w) {
        g();
        return;
      }
      for (const S of C) {
        if (r?.(S) === !1)
          continue;
        const p = c.indexOf(S), b = d[p];
        if (!b)
          continue;
        const {
          direction: R,
          speed: k
        } = Zn(S, b, w, t, h);
        for (const E of ["x", "y"])
          f[E][R[E]] || (k[E] = 0, R[E] = 0);
        if (k.x > 0 || k.y > 0) {
          g(), m.current = S, x(T, a), v.current = k, y.current = R;
          return;
        }
      }
      v.current = {
        x: 0,
        y: 0
      }, y.current = {
        x: 0,
        y: 0
      }, g();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      t,
      T,
      r,
      g,
      o,
      a,
      // eslint-disable-next-line react-hooks/exhaustive-deps
      JSON.stringify(w),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      JSON.stringify(f),
      x,
      c,
      C,
      d,
      // eslint-disable-next-line react-hooks/exhaustive-deps
      JSON.stringify(h)
    ]
  );
}
const fr = {
  x: {
    [L.Backward]: !1,
    [L.Forward]: !1
  },
  y: {
    [L.Backward]: !1,
    [L.Forward]: !1
  }
};
function hr(e) {
  let {
    delta: t,
    disabled: n
  } = e;
  const r = Xe(t);
  return Me((i) => {
    if (n || !r || !i)
      return fr;
    const o = {
      x: Math.sign(t.x - r.x),
      y: Math.sign(t.y - r.y)
    };
    return {
      x: {
        [L.Backward]: i.x[L.Backward] || o.x === -1,
        [L.Forward]: i.x[L.Forward] || o.x === 1
      },
      y: {
        [L.Backward]: i.y[L.Backward] || o.y === -1,
        [L.Forward]: i.y[L.Forward] || o.y === 1
      }
    };
  }, [n, t, r]);
}
function gr(e, t) {
  const n = t != null ? e.get(t) : void 0, r = n ? n.node.current : null;
  return Me((i) => {
    var o;
    return t == null ? null : (o = r ?? i) != null ? o : null;
  }, [r, t]);
}
function vr(e, t) {
  return A(() => e.reduce((n, r) => {
    const {
      sensor: i
    } = r, o = i.activators.map((a) => ({
      eventName: a.eventName,
      handler: t(a.handler, r)
    }));
    return [...n, ...o];
  }, []), [e, t]);
}
var Oe;
(function(e) {
  e[e.Always = 0] = "Always", e[e.BeforeDragging = 1] = "BeforeDragging", e[e.WhileDragging = 2] = "WhileDragging";
})(Oe || (Oe = {}));
var at;
(function(e) {
  e.Optimized = "optimized";
})(at || (at = {}));
const Kt = /* @__PURE__ */ new Map();
function pr(e, t) {
  let {
    dragging: n,
    dependencies: r,
    config: i
  } = t;
  const [o, a] = K(null), {
    frequency: s,
    measure: l,
    strategy: c
  } = i, d = P(e), u = v(), h = Ae(u), f = U(function(y) {
    y === void 0 && (y = []), !h.current && a((w) => w === null ? y : w.concat(y.filter((m) => !w.includes(m))));
  }, [h]), x = P(null), g = Me((y) => {
    if (u && !n)
      return Kt;
    if (!y || y === Kt || d.current !== e || o != null) {
      const w = /* @__PURE__ */ new Map();
      for (let m of e) {
        if (!m)
          continue;
        if (o && o.length > 0 && !o.includes(m.id) && m.rect.current) {
          w.set(m.id, m.rect.current);
          continue;
        }
        const T = m.node.current, C = T ? new vt(l(T), T) : null;
        m.rect.current = C, C && w.set(m.id, C);
      }
      return w;
    }
    return y;
  }, [e, o, n, u, l]);
  return O(() => {
    d.current = e;
  }, [e]), O(
    () => {
      u || f();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [n, u]
  ), O(
    () => {
      o && o.length > 0 && a(null);
    },
    //eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(o)]
  ), O(
    () => {
      u || typeof s != "number" || x.current !== null || (x.current = setTimeout(() => {
        f(), x.current = null;
      }, s));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [s, u, f, ...r]
  ), {
    droppableRects: g,
    measureDroppableContainers: f,
    measuringScheduled: o != null
  };
  function v() {
    switch (c) {
      case Oe.Always:
        return !1;
      case Oe.BeforeDragging:
        return n;
      default:
        return !n;
    }
  }
}
function bt(e, t) {
  return Me((n) => e ? n || (typeof t == "function" ? t(e) : e) : null, [t, e]);
}
function br(e, t) {
  return bt(e, t);
}
function yr(e) {
  let {
    callback: t,
    disabled: n
  } = e;
  const r = ut(t), i = A(() => {
    if (n || typeof window > "u" || typeof window.MutationObserver > "u")
      return;
    const {
      MutationObserver: o
    } = window;
    return new o(r);
  }, [r, n]);
  return O(() => () => i?.disconnect(), [i]), i;
}
function _e(e) {
  let {
    callback: t,
    disabled: n
  } = e;
  const r = ut(t), i = A(
    () => {
      if (n || typeof window > "u" || typeof window.ResizeObserver > "u")
        return;
      const {
        ResizeObserver: o
      } = window;
      return new o(r);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [n]
  );
  return O(() => () => i?.disconnect(), [i]), i;
}
function mr(e) {
  return new vt(Te(e), e);
}
function Wt(e, t, n) {
  t === void 0 && (t = mr);
  const [r, i] = K(null);
  function o() {
    i((l) => {
      if (!e)
        return null;
      if (e.isConnected === !1) {
        var c;
        return (c = l ?? n) != null ? c : null;
      }
      const d = t(e);
      return JSON.stringify(l) === JSON.stringify(d) ? l : d;
    });
  }
  const a = yr({
    callback(l) {
      if (e)
        for (const c of l) {
          const {
            type: d,
            target: u
          } = c;
          if (d === "childList" && u instanceof HTMLElement && u.contains(e)) {
            o();
            break;
          }
        }
    }
  }), s = _e({
    callback: o
  });
  return fe(() => {
    o(), e ? (s?.observe(e), a?.observe(document.body, {
      childList: !0,
      subtree: !0
    })) : (s?.disconnect(), a?.disconnect());
  }, [e]), r;
}
function wr(e) {
  const t = bt(e);
  return Jt(e, t);
}
const Xt = [];
function xr(e) {
  const t = P(e), n = Me((r) => e ? r && r !== Xt && e && t.current && e.parentNode === t.current.parentNode ? r : gt(e) : Xt, [e]);
  return O(() => {
    t.current = e;
  }, [e]), n;
}
function Dr(e) {
  const [t, n] = K(null), r = P(e), i = U((o) => {
    const a = et(o.target);
    a && n((s) => s ? (s.set(a, it(a)), new Map(s)) : null);
  }, []);
  return O(() => {
    const o = r.current;
    if (e !== o) {
      a(o);
      const s = e.map((l) => {
        const c = et(l);
        return c ? (c.addEventListener("scroll", i, {
          passive: !0
        }), [c, it(c)]) : null;
      }).filter((l) => l != null);
      n(s.length ? new Map(s) : null), r.current = e;
    }
    return () => {
      a(e), a(o);
    };
    function a(s) {
      s.forEach((l) => {
        const c = et(l);
        c?.removeEventListener("scroll", i);
      });
    }
  }, [i, e]), A(() => e.length ? t ? Array.from(t.values()).reduce((o, a) => ye(o, a), H) : nn(e) : H, [e, t]);
}
function jt(e, t) {
  t === void 0 && (t = []);
  const n = P(null);
  return O(
    () => {
      n.current = null;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    t
  ), O(() => {
    const r = e !== H;
    r && !n.current && (n.current = e), !r && n.current && (n.current = null);
  }, [e]), n.current ? We(e, n.current) : H;
}
function Cr(e) {
  O(
    () => {
      if (!ct)
        return;
      const t = e.map((n) => {
        let {
          sensor: r
        } = n;
        return r.setup == null ? void 0 : r.setup();
      });
      return () => {
        for (const n of t)
          n?.();
      };
    },
    // TO-DO: Sensors length could theoretically change which would not be a valid dependency
    // eslint-disable-next-line react-hooks/exhaustive-deps
    e.map((t) => {
      let {
        sensor: n
      } = t;
      return n;
    })
  );
}
function Sr(e, t) {
  return A(() => e.reduce((n, r) => {
    let {
      eventName: i,
      handler: o
    } = r;
    return n[i] = (a) => {
      o(a, t);
    }, n;
  }, {}), [e, t]);
}
function ln(e) {
  return A(() => e ? Jn(e) : null, [e]);
}
const Yt = [];
function Rr(e, t) {
  t === void 0 && (t = Te);
  const [n] = e, r = ln(n ? J(n) : null), [i, o] = K(Yt);
  function a() {
    o(() => e.length ? e.map((l) => en(l) ? r : new vt(t(l), l)) : Yt);
  }
  const s = _e({
    callback: a
  });
  return fe(() => {
    s?.disconnect(), a(), e.forEach((l) => s?.observe(l));
  }, [e]), i;
}
function cn(e) {
  if (!e)
    return null;
  if (e.children.length > 1)
    return e;
  const t = e.children[0];
  return He(t) ? t : e;
}
function Er(e) {
  let {
    measure: t
  } = e;
  const [n, r] = K(null), i = U((c) => {
    for (const {
      target: d
    } of c)
      if (He(d)) {
        r((u) => {
          const h = t(d);
          return u ? {
            ...u,
            width: h.width,
            height: h.height
          } : h;
        });
        break;
      }
  }, [t]), o = _e({
    callback: i
  }), a = U((c) => {
    const d = cn(c);
    o?.disconnect(), d && o?.observe(d), r(d ? t(d) : null);
  }, [t, o]), [s, l] = Ke(a);
  return A(() => ({
    nodeRef: s,
    rect: n,
    setRef: l
  }), [n, s, l]);
}
const Ar = [{
  sensor: an,
  options: {}
}, {
  sensor: sn,
  options: {}
}], Or = {
  current: {}
}, Fe = {
  draggable: {
    measure: zt
  },
  droppable: {
    measure: zt,
    strategy: Oe.WhileDragging,
    frequency: at.Optimized
  },
  dragOverlay: {
    measure: Te
  }
};
class Ee extends Map {
  get(t) {
    var n;
    return t != null && (n = super.get(t)) != null ? n : void 0;
  }
  toArray() {
    return Array.from(this.values());
  }
  getEnabled() {
    return this.toArray().filter((t) => {
      let {
        disabled: n
      } = t;
      return !n;
    });
  }
  getNodeFor(t) {
    var n, r;
    return (n = (r = this.get(t)) == null ? void 0 : r.node.current) != null ? n : void 0;
  }
}
const Nr = {
  activatorEvent: null,
  active: null,
  activeNode: null,
  activeNodeRect: null,
  collisions: null,
  containerNodeRect: null,
  draggableNodes: /* @__PURE__ */ new Map(),
  droppableRects: /* @__PURE__ */ new Map(),
  droppableContainers: /* @__PURE__ */ new Ee(),
  over: null,
  dragOverlay: {
    nodeRef: {
      current: null
    },
    rect: null,
    setRef: je
  },
  scrollableAncestors: [],
  scrollableAncestorRects: [],
  measuringConfiguration: Fe,
  measureDroppableContainers: je,
  windowRect: null,
  measuringScheduled: !1
}, un = {
  activatorEvent: null,
  activators: [],
  active: null,
  activeNodeRect: null,
  ariaDescribedById: {
    draggable: ""
  },
  dispatch: je,
  draggableNodes: /* @__PURE__ */ new Map(),
  over: null,
  measureDroppableContainers: je
}, Le = /* @__PURE__ */ Ne(un), dn = /* @__PURE__ */ Ne(Nr);
function Mr() {
  return {
    draggable: {
      active: null,
      initialCoordinates: {
        x: 0,
        y: 0
      },
      nodes: /* @__PURE__ */ new Map(),
      translate: {
        x: 0,
        y: 0
      }
    },
    droppable: {
      containers: new Ee()
    }
  };
}
function Tr(e, t) {
  switch (t.type) {
    case N.DragStart:
      return {
        ...e,
        draggable: {
          ...e.draggable,
          initialCoordinates: t.initialCoordinates,
          active: t.active
        }
      };
    case N.DragMove:
      return e.draggable.active == null ? e : {
        ...e,
        draggable: {
          ...e.draggable,
          translate: {
            x: t.coordinates.x - e.draggable.initialCoordinates.x,
            y: t.coordinates.y - e.draggable.initialCoordinates.y
          }
        }
      };
    case N.DragEnd:
    case N.DragCancel:
      return {
        ...e,
        draggable: {
          ...e.draggable,
          active: null,
          initialCoordinates: {
            x: 0,
            y: 0
          },
          translate: {
            x: 0,
            y: 0
          }
        }
      };
    case N.RegisterDroppable: {
      const {
        element: n
      } = t, {
        id: r
      } = n, i = new Ee(e.droppable.containers);
      return i.set(r, n), {
        ...e,
        droppable: {
          ...e.droppable,
          containers: i
        }
      };
    }
    case N.SetDroppableDisabled: {
      const {
        id: n,
        key: r,
        disabled: i
      } = t, o = e.droppable.containers.get(n);
      if (!o || r !== o.key)
        return e;
      const a = new Ee(e.droppable.containers);
      return a.set(n, {
        ...o,
        disabled: i
      }), {
        ...e,
        droppable: {
          ...e.droppable,
          containers: a
        }
      };
    }
    case N.UnregisterDroppable: {
      const {
        id: n,
        key: r
      } = t, i = e.droppable.containers.get(n);
      if (!i || r !== i.key)
        return e;
      const o = new Ee(e.droppable.containers);
      return o.delete(n), {
        ...e,
        droppable: {
          ...e.droppable,
          containers: o
        }
      };
    }
    default:
      return e;
  }
}
function Lr(e) {
  let {
    disabled: t
  } = e;
  const {
    active: n,
    activatorEvent: r,
    draggableNodes: i
  } = de(Le), o = Xe(r), a = Xe(n?.id);
  return O(() => {
    if (!t && !r && o && a != null) {
      if (!lt(o) || document.activeElement === o.target)
        return;
      const s = i.get(a);
      if (!s)
        return;
      const {
        activatorNode: l,
        node: c
      } = s;
      if (!l.current && !c.current)
        return;
      requestAnimationFrame(() => {
        for (const d of [l.current, c.current]) {
          if (!d)
            continue;
          const u = An(d);
          if (u) {
            u.focus();
            break;
          }
        }
      });
    }
  }, [r, t, i, a, o]), null;
}
function fn(e, t) {
  let {
    transform: n,
    ...r
  } = t;
  return e != null && e.length ? e.reduce((i, o) => o({
    transform: i,
    ...r
  }), n) : n;
}
function kr(e) {
  return A(
    () => ({
      draggable: {
        ...Fe.draggable,
        ...e?.draggable
      },
      droppable: {
        ...Fe.droppable,
        ...e?.droppable
      },
      dragOverlay: {
        ...Fe.dragOverlay,
        ...e?.dragOverlay
      }
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [e?.draggable, e?.droppable, e?.dragOverlay]
  );
}
function Ir(e) {
  let {
    activeNode: t,
    measure: n,
    initialRect: r,
    config: i = !0
  } = e;
  const o = P(!1), {
    x: a,
    y: s
  } = typeof i == "boolean" ? {
    x: i,
    y: i
  } : i;
  fe(() => {
    if (!a && !s || !t) {
      o.current = !1;
      return;
    }
    if (o.current || !r)
      return;
    const c = t?.node.current;
    if (!c || c.isConnected === !1)
      return;
    const d = n(c), u = Jt(d, r);
    if (a || (u.x = 0), s || (u.y = 0), o.current = !0, Math.abs(u.x) > 0 || Math.abs(u.y) > 0) {
      const h = Gt(c);
      h && h.scrollBy({
        top: u.y,
        left: u.x
      });
    }
  }, [t, a, s, r, n]);
}
const qe = /* @__PURE__ */ Ne({
  ...H,
  scaleX: 1,
  scaleY: 1
});
var se;
(function(e) {
  e[e.Uninitialized = 0] = "Uninitialized", e[e.Initializing = 1] = "Initializing", e[e.Initialized = 2] = "Initialized";
})(se || (se = {}));
const ao = /* @__PURE__ */ xn(function(t) {
  var n, r, i, o;
  let {
    id: a,
    accessibility: s,
    autoScroll: l = !0,
    children: c,
    sensors: d = Ar,
    collisionDetection: u = Xn,
    measuring: h,
    modifiers: f,
    ...x
  } = t;
  const g = Dn(Tr, void 0, Mr), [v, y] = g, [w, m] = In(), [T, C] = K(se.Uninitialized), S = T === se.Initialized, {
    draggable: {
      active: p,
      nodes: b,
      translate: R
    },
    droppable: {
      containers: k
    }
  } = v, E = p != null ? b.get(p) : null, V = P({
    initial: null,
    translated: null
  }), G = A(() => {
    var z;
    return p != null ? {
      id: p,
      // It's possible for the active node to unmount while dragging
      data: (z = E?.data) != null ? z : Or,
      rect: V
    } : null;
  }, [p, E]), ee = P(null), [yt, mt] = K(null), [Q, wt] = K(null), ae = Ae(x, Object.values(x)), Je = Ue("DndDescribedBy", a), xt = A(() => k.getEnabled(), [k]), le = kr(h), {
    droppableRects: he,
    measureDroppableContainers: ke,
    measuringScheduled: Dt
  } = pr(xt, {
    dragging: S,
    dependencies: [R.x, R.y],
    config: le.droppable
  }), j = gr(b, p), Ct = A(() => Q ? $e(Q) : null, [Q]), St = wn(), Rt = br(j, le.draggable.measure);
  Ir({
    activeNode: p != null ? b.get(p) : null,
    config: St.layoutShiftCompensation,
    initialRect: Rt,
    measure: le.draggable.measure
  });
  const Y = Wt(j, le.draggable.measure, Rt), Ve = Wt(j ? j.parentElement : null), ce = P({
    activatorEvent: null,
    active: null,
    activeNode: j,
    collisionRect: null,
    collisions: null,
    droppableRects: he,
    draggableNodes: b,
    draggingNode: null,
    draggingNodeRect: null,
    droppableContainers: k,
    over: null,
    scrollableAncestors: [],
    scrollAdjustedTranslate: null
  }), Et = k.getNodeFor((n = ce.current.over) == null ? void 0 : n.id), ue = Er({
    measure: le.dragOverlay.measure
  }), Ie = (r = ue.nodeRef.current) != null ? r : j, ge = S ? (i = ue.rect) != null ? i : Y : null, At = !!(ue.nodeRef.current && ue.rect), Ot = wr(At ? null : Y), Ge = ln(Ie ? J(Ie) : null), te = xr(S ? Et ?? j : null), Pe = Rr(te), ze = fn(f, {
    transform: {
      x: R.x - Ot.x,
      y: R.y - Ot.y,
      scaleX: 1,
      scaleY: 1
    },
    activatorEvent: Q,
    active: G,
    activeNodeRect: Y,
    containerNodeRect: Ve,
    draggingNodeRect: ge,
    over: ce.current.over,
    overlayNodeRect: ue.rect,
    scrollableAncestors: te,
    scrollableAncestorRects: Pe,
    windowRect: Ge
  }), Nt = Ct ? ye(Ct, R) : null, Mt = Dr(te), hn = jt(Mt), gn = jt(Mt, [Y]), ve = ye(ze, hn), pe = ge ? Hn(ge, ze) : null, we = G && pe ? u({
    active: G,
    collisionRect: pe,
    droppableRects: he,
    droppableContainers: xt,
    pointerCoordinates: Nt
  }) : null, Tt = Kn(we, "id"), [ne, Lt] = K(null), vn = At ? ze : ye(ze, gn), pn = Yn(vn, (o = ne?.rect) != null ? o : null, Y), Qe = P(null), kt = U(
    (z, B) => {
      let {
        sensor: F,
        options: re
      } = B;
      if (ee.current == null)
        return;
      const W = b.get(ee.current);
      if (!W)
        return;
      const $ = z.nativeEvent, _ = new F({
        active: ee.current,
        activeNode: W,
        event: $,
        options: re,
        // Sensors need to be instantiated with refs for arguments that change over time
        // otherwise they are frozen in time with the stale arguments
        context: ce,
        onAbort(I) {
          if (!b.get(I))
            return;
          const {
            onDragAbort: q
          } = ae.current, Z = {
            id: I
          };
          q?.(Z), w({
            type: "onDragAbort",
            event: Z
          });
        },
        onPending(I, oe, q, Z) {
          if (!b.get(I))
            return;
          const {
            onDragPending: De
          } = ae.current, ie = {
            id: I,
            constraint: oe,
            initialCoordinates: q,
            offset: Z
          };
          De?.(ie), w({
            type: "onDragPending",
            event: ie
          });
        },
        onStart(I) {
          const oe = ee.current;
          if (oe == null)
            return;
          const q = b.get(oe);
          if (!q)
            return;
          const {
            onDragStart: Z
          } = ae.current, xe = {
            activatorEvent: $,
            active: {
              id: oe,
              data: q.data,
              rect: V
            }
          };
          Be(() => {
            Z?.(xe), C(se.Initializing), y({
              type: N.DragStart,
              initialCoordinates: I,
              active: oe
            }), w({
              type: "onDragStart",
              event: xe
            }), mt(Qe.current), wt($);
          });
        },
        onMove(I) {
          y({
            type: N.DragMove,
            coordinates: I
          });
        },
        onEnd: be(N.DragEnd),
        onCancel: be(N.DragCancel)
      });
      Qe.current = _;
      function be(I) {
        return async function() {
          const {
            active: q,
            collisions: Z,
            over: xe,
            scrollAdjustedTranslate: De
          } = ce.current;
          let ie = null;
          if (q && De) {
            const {
              cancelDrop: Ce
            } = ae.current;
            ie = {
              activatorEvent: $,
              active: q,
              collisions: Z,
              delta: De,
              over: xe
            }, I === N.DragEnd && typeof Ce == "function" && await Promise.resolve(Ce(ie)) && (I = N.DragCancel);
          }
          ee.current = null, Be(() => {
            y({
              type: I
            }), C(se.Uninitialized), Lt(null), mt(null), wt(null), Qe.current = null;
            const Ce = I === N.DragEnd ? "onDragEnd" : "onDragCancel";
            if (ie) {
              const Ze = ae.current[Ce];
              Ze?.(ie), w({
                type: Ce,
                event: ie
              });
            }
          });
        };
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [b]
  ), bn = U((z, B) => (F, re) => {
    const W = F.nativeEvent, $ = b.get(re);
    if (
      // Another sensor is already instantiating
      ee.current !== null || // No active draggable
      !$ || // Event has already been captured
      W.dndKit || W.defaultPrevented
    )
      return;
    const _ = {
      active: $
    };
    z(F, B.options, _) === !0 && (W.dndKit = {
      capturedBy: B.sensor
    }, ee.current = re, kt(F, B));
  }, [b, kt]), It = vr(d, bn);
  Cr(d), fe(() => {
    Y && T === se.Initializing && C(se.Initialized);
  }, [Y, T]), O(
    () => {
      const {
        onDragMove: z
      } = ae.current, {
        active: B,
        activatorEvent: F,
        collisions: re,
        over: W
      } = ce.current;
      if (!B || !F)
        return;
      const $ = {
        active: B,
        activatorEvent: F,
        collisions: re,
        delta: {
          x: ve.x,
          y: ve.y
        },
        over: W
      };
      Be(() => {
        z?.($), w({
          type: "onDragMove",
          event: $
        });
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ve.x, ve.y]
  ), O(
    () => {
      const {
        active: z,
        activatorEvent: B,
        collisions: F,
        droppableContainers: re,
        scrollAdjustedTranslate: W
      } = ce.current;
      if (!z || ee.current == null || !B || !W)
        return;
      const {
        onDragOver: $
      } = ae.current, _ = re.get(Tt), be = _ && _.rect.current ? {
        id: _.id,
        rect: _.rect.current,
        data: _.data,
        disabled: _.disabled
      } : null, I = {
        active: z,
        activatorEvent: B,
        collisions: F,
        delta: {
          x: W.x,
          y: W.y
        },
        over: be
      };
      Be(() => {
        Lt(be), $?.(I), w({
          type: "onDragOver",
          event: I
        });
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [Tt]
  ), fe(() => {
    ce.current = {
      activatorEvent: Q,
      active: G,
      activeNode: j,
      collisionRect: pe,
      collisions: we,
      droppableRects: he,
      draggableNodes: b,
      draggingNode: Ie,
      draggingNodeRect: ge,
      droppableContainers: k,
      over: ne,
      scrollableAncestors: te,
      scrollAdjustedTranslate: ve
    }, V.current = {
      initial: ge,
      translated: pe
    };
  }, [G, j, we, pe, b, Ie, ge, he, k, ne, te, ve]), dr({
    ...St,
    delta: R,
    draggingRect: pe,
    pointerCoordinates: Nt,
    scrollableAncestors: te,
    scrollableAncestorRects: Pe
  });
  const yn = A(() => ({
    active: G,
    activeNode: j,
    activeNodeRect: Y,
    activatorEvent: Q,
    collisions: we,
    containerNodeRect: Ve,
    dragOverlay: ue,
    draggableNodes: b,
    droppableContainers: k,
    droppableRects: he,
    over: ne,
    measureDroppableContainers: ke,
    scrollableAncestors: te,
    scrollableAncestorRects: Pe,
    measuringConfiguration: le,
    measuringScheduled: Dt,
    windowRect: Ge
  }), [G, j, Y, Q, we, Ve, ue, b, k, he, ne, ke, te, Pe, le, Dt, Ge]), mn = A(() => ({
    activatorEvent: Q,
    activators: It,
    active: G,
    activeNodeRect: Y,
    ariaDescribedById: {
      draggable: Je
    },
    dispatch: y,
    draggableNodes: b,
    over: ne,
    measureDroppableContainers: ke
  }), [Q, It, G, Y, y, Je, b, ne, ke]);
  return M.createElement(qt.Provider, {
    value: m
  }, M.createElement(Le.Provider, {
    value: mn
  }, M.createElement(dn.Provider, {
    value: yn
  }, M.createElement(qe.Provider, {
    value: pn
  }, c)), M.createElement(Lr, {
    disabled: s?.restoreFocus === !1
  })), M.createElement(Bn, {
    ...s,
    hiddenTextDescribedById: Je
  }));
  function wn() {
    const z = yt?.autoScrollEnabled === !1, B = typeof l == "object" ? l.enabled === !1 : l === !1, F = S && !z && !B;
    return typeof l == "object" ? {
      ...l,
      enabled: F
    } : {
      enabled: F
    };
  }
}), Pr = /* @__PURE__ */ Ne(null), Ut = "button", zr = "Draggable";
function lo(e) {
  let {
    id: t,
    data: n,
    disabled: r = !1,
    attributes: i
  } = e;
  const o = Ue(zr), {
    activators: a,
    activatorEvent: s,
    active: l,
    activeNodeRect: c,
    ariaDescribedById: d,
    draggableNodes: u,
    over: h
  } = de(Le), {
    role: f = Ut,
    roleDescription: x = "draggable",
    tabIndex: g = 0
  } = i ?? {}, v = l?.id === t, y = de(v ? qe : Pr), [w, m] = Ke(), [T, C] = Ke(), S = Sr(a, t), p = Ae(n);
  fe(
    () => (u.set(t, {
      id: t,
      key: o,
      node: w,
      activatorNode: T,
      data: p
    }), () => {
      const R = u.get(t);
      R && R.key === o && u.delete(t);
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [u, t]
  );
  const b = A(() => ({
    role: f,
    tabIndex: g,
    "aria-disabled": r,
    "aria-pressed": v && f === Ut ? !0 : void 0,
    "aria-roledescription": x,
    "aria-describedby": d.draggable
  }), [r, f, g, v, x, d.draggable]);
  return {
    active: l,
    activatorEvent: s,
    activeNodeRect: c,
    attributes: b,
    isDragging: v,
    listeners: r ? void 0 : S,
    node: w,
    over: h,
    setNodeRef: m,
    setActivatorNodeRef: C,
    transform: y
  };
}
function Br() {
  return de(dn);
}
const Fr = "Droppable", $r = {
  timeout: 25
};
function co(e) {
  let {
    data: t,
    disabled: n = !1,
    id: r,
    resizeObserverConfig: i
  } = e;
  const o = Ue(Fr), {
    active: a,
    dispatch: s,
    over: l,
    measureDroppableContainers: c
  } = de(Le), d = P({
    disabled: n
  }), u = P(!1), h = P(null), f = P(null), {
    disabled: x,
    updateMeasurementsFor: g,
    timeout: v
  } = {
    ...$r,
    ...i
  }, y = Ae(g ?? r), w = U(
    () => {
      if (!u.current) {
        u.current = !0;
        return;
      }
      f.current != null && clearTimeout(f.current), f.current = setTimeout(() => {
        c(Array.isArray(y.current) ? y.current : [y.current]), f.current = null;
      }, v);
    },
    //eslint-disable-next-line react-hooks/exhaustive-deps
    [v]
  ), m = _e({
    callback: w,
    disabled: x || !a
  }), T = U((b, R) => {
    m && (R && (m.unobserve(R), u.current = !1), b && m.observe(b));
  }, [m]), [C, S] = Ke(T), p = Ae(t);
  return O(() => {
    !m || !C.current || (m.disconnect(), u.current = !1, m.observe(C.current));
  }, [C, m]), O(
    () => (s({
      type: N.RegisterDroppable,
      element: {
        id: r,
        key: o,
        disabled: n,
        node: C,
        rect: h,
        data: p
      }
    }), () => s({
      type: N.UnregisterDroppable,
      key: o,
      id: r
    })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [r]
  ), O(() => {
    n !== d.current.disabled && (s({
      type: N.SetDroppableDisabled,
      id: r,
      key: o,
      disabled: n
    }), d.current.disabled = n);
  }, [r, o, n, s]), {
    active: a,
    rect: h,
    isOver: l?.id === r,
    node: C,
    over: l,
    setNodeRef: S
  };
}
function Kr(e) {
  let {
    animation: t,
    children: n
  } = e;
  const [r, i] = K(null), [o, a] = K(null), s = Xe(n);
  return !n && !r && s && i(s), fe(() => {
    if (!o)
      return;
    const l = r?.key, c = r?.props.id;
    if (l == null || c == null) {
      i(null);
      return;
    }
    Promise.resolve(t(c, o)).then(() => {
      i(null);
    });
  }, [t, r, o]), M.createElement(M.Fragment, null, n, r ? Cn(r, {
    ref: a
  }) : null);
}
const Wr = {
  x: 0,
  y: 0,
  scaleX: 1,
  scaleY: 1
};
function Xr(e) {
  let {
    children: t
  } = e;
  return M.createElement(Le.Provider, {
    value: un
  }, M.createElement(qe.Provider, {
    value: Wr
  }, t));
}
const jr = {
  position: "fixed",
  touchAction: "none"
}, Yr = (e) => lt(e) ? "transform 250ms ease" : void 0, Ur = /* @__PURE__ */ Sn((e, t) => {
  let {
    as: n,
    activatorEvent: r,
    adjustScale: i,
    children: o,
    className: a,
    rect: s,
    style: l,
    transform: c,
    transition: d = Yr
  } = e;
  if (!s)
    return null;
  const u = i ? c : {
    ...c,
    scaleX: 1,
    scaleY: 1
  }, h = {
    ...jr,
    width: s.width,
    height: s.height,
    top: s.top,
    left: s.left,
    transform: rt.Transform.toString(u),
    transformOrigin: i && r ? Fn(r, s) : void 0,
    transition: typeof d == "function" ? d(r) : d,
    ...l
  };
  return M.createElement(n, {
    className: a,
    style: h,
    ref: t
  }, o);
}), Hr = (e) => (t) => {
  let {
    active: n,
    dragOverlay: r
  } = t;
  const i = {}, {
    styles: o,
    className: a
  } = e;
  if (o != null && o.active)
    for (const [s, l] of Object.entries(o.active))
      l !== void 0 && (i[s] = n.node.style.getPropertyValue(s), n.node.style.setProperty(s, l));
  if (o != null && o.dragOverlay)
    for (const [s, l] of Object.entries(o.dragOverlay))
      l !== void 0 && r.node.style.setProperty(s, l);
  return a != null && a.active && n.node.classList.add(a.active), a != null && a.dragOverlay && r.node.classList.add(a.dragOverlay), function() {
    for (const [l, c] of Object.entries(i))
      n.node.style.setProperty(l, c);
    a != null && a.active && n.node.classList.remove(a.active);
  };
}, _r = (e) => {
  let {
    transform: {
      initial: t,
      final: n
    }
  } = e;
  return [{
    transform: rt.Transform.toString(t)
  }, {
    transform: rt.Transform.toString(n)
  }];
}, qr = {
  duration: 250,
  easing: "ease",
  keyframes: _r,
  sideEffects: /* @__PURE__ */ Hr({
    styles: {
      active: {
        opacity: "0"
      }
    }
  })
};
function Jr(e) {
  let {
    config: t,
    draggableNodes: n,
    droppableContainers: r,
    measuringConfiguration: i
  } = e;
  return ut((o, a) => {
    if (t === null)
      return;
    const s = n.get(o);
    if (!s)
      return;
    const l = s.node.current;
    if (!l)
      return;
    const c = cn(a);
    if (!c)
      return;
    const {
      transform: d
    } = J(a).getComputedStyle(a), u = Vt(d);
    if (!u)
      return;
    const h = typeof t == "function" ? t : Vr(t);
    return rn(l, i.draggable.measure), h({
      active: {
        id: o,
        data: s.data,
        node: l,
        rect: i.draggable.measure(l)
      },
      draggableNodes: n,
      dragOverlay: {
        node: a,
        rect: i.dragOverlay.measure(c)
      },
      droppableContainers: r,
      measuringConfiguration: i,
      transform: u
    });
  });
}
function Vr(e) {
  const {
    duration: t,
    easing: n,
    sideEffects: r,
    keyframes: i
  } = {
    ...qr,
    ...e
  };
  return (o) => {
    let {
      active: a,
      dragOverlay: s,
      transform: l,
      ...c
    } = o;
    if (!t)
      return;
    const d = {
      x: s.rect.left - a.rect.left,
      y: s.rect.top - a.rect.top
    }, u = {
      scaleX: l.scaleX !== 1 ? a.rect.width * l.scaleX / s.rect.width : 1,
      scaleY: l.scaleY !== 1 ? a.rect.height * l.scaleY / s.rect.height : 1
    }, h = {
      x: l.x - d.x,
      y: l.y - d.y,
      ...u
    }, f = i({
      ...c,
      active: a,
      dragOverlay: s,
      transform: {
        initial: l,
        final: h
      }
    }), [x] = f, g = f[f.length - 1];
    if (JSON.stringify(x) === JSON.stringify(g))
      return;
    const v = r?.({
      active: a,
      dragOverlay: s,
      ...c
    }), y = s.node.animate(f, {
      duration: t,
      easing: n,
      fill: "forwards"
    });
    return new Promise((w) => {
      y.onfinish = () => {
        v?.(), w();
      };
    });
  };
}
let Ht = 0;
function Gr(e) {
  return A(() => {
    if (e != null)
      return Ht++, Ht;
  }, [e]);
}
const uo = /* @__PURE__ */ M.memo((e) => {
  let {
    adjustScale: t = !1,
    children: n,
    dropAnimation: r,
    style: i,
    transition: o,
    modifiers: a,
    wrapperElement: s = "div",
    className: l,
    zIndex: c = 999
  } = e;
  const {
    activatorEvent: d,
    active: u,
    activeNodeRect: h,
    containerNodeRect: f,
    draggableNodes: x,
    droppableContainers: g,
    dragOverlay: v,
    over: y,
    measuringConfiguration: w,
    scrollableAncestors: m,
    scrollableAncestorRects: T,
    windowRect: C
  } = Br(), S = de(qe), p = Gr(u?.id), b = fn(a, {
    activatorEvent: d,
    active: u,
    activeNodeRect: h,
    containerNodeRect: f,
    draggingNodeRect: v.rect,
    over: y,
    overlayNodeRect: v.rect,
    scrollableAncestors: m,
    scrollableAncestorRects: T,
    transform: S,
    windowRect: C
  }), R = bt(h), k = Jr({
    config: r,
    draggableNodes: x,
    droppableContainers: g,
    measuringConfiguration: w
  }), E = R ? v.setRef : void 0;
  return M.createElement(Xr, null, M.createElement(Kr, {
    animation: k
  }, u && p ? M.createElement(Ur, {
    key: p,
    id: u.id,
    ref: E,
    as: s,
    activatorEvent: d,
    adjustScale: t,
    className: l,
    transition: o,
    rect: R,
    style: {
      zIndex: c,
      ...i
    },
    transform: b
  }, n) : null));
});
export {
  Re as AutoScrollActivator,
  ao as DndContext,
  uo as DragOverlay,
  D as KeyboardCode,
  sn as KeyboardSensor,
  at as MeasuringFrequency,
  Oe as MeasuringStrategy,
  cr as MouseSensor,
  an as PointerSensor,
  ur as TouchSensor,
  Ye as TraversalOrder,
  fn as applyModifiers,
  oo as closestCenter,
  io as closestCorners,
  zn as defaultAnnouncements,
  H as defaultCoordinates,
  qr as defaultDropAnimation,
  Hr as defaultDropAnimationSideEffects,
  sr as defaultKeyboardCoordinateGetter,
  Pn as defaultScreenReaderInstructions,
  Te as getClientRect,
  Kn as getFirstCollision,
  gt as getScrollableAncestors,
  so as pointerWithin,
  Xn as rectIntersection,
  Br as useDndContext,
  kn as useDndMonitor,
  lo as useDraggable,
  co as useDroppable,
  no as useSensor,
  ro as useSensors
};
//# sourceMappingURL=index177.js.map
