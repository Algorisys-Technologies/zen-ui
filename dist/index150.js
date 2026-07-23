import { debounce as R, memo as p, notUndefined as M, approxEqual as _ } from "./index151.js";
const I = (l) => {
  const { offsetWidth: a, offsetHeight: t } = l;
  return { width: a, height: t };
}, F = (l) => l, W = (l) => {
  const a = Math.max(l.startIndex - l.overscan, 0), t = Math.min(l.endIndex + l.overscan, l.count - 1), e = [];
  for (let s = a; s <= t; s++)
    e.push(s);
  return e;
}, k = (l, a) => {
  const t = l.scrollElement;
  if (!t)
    return;
  const e = l.targetWindow;
  if (!e)
    return;
  const s = (o) => {
    const { width: n, height: r } = o;
    a({ width: Math.round(n), height: Math.round(r) });
  };
  if (s(I(t)), !e.ResizeObserver)
    return () => {
    };
  const i = new e.ResizeObserver((o) => {
    const n = () => {
      const r = o[0];
      if (r?.borderBoxSize) {
        const u = r.borderBoxSize[0];
        if (u) {
          s({ width: u.inlineSize, height: u.blockSize });
          return;
        }
      }
      s(I(t));
    };
    l.options.useAnimationFrameWithResizeObserver ? requestAnimationFrame(n) : n();
  });
  return i.observe(t, { box: "border-box" }), () => {
    i.unobserve(t);
  };
}, w = {
  passive: !0
}, z = typeof window > "u" ? !0 : "onscrollend" in window, D = (l, a) => {
  const t = l.scrollElement;
  if (!t)
    return;
  const e = l.targetWindow;
  if (!e)
    return;
  let s = 0;
  const i = l.options.useScrollendEvent && z ? () => {
  } : R(
    e,
    () => {
      a(s, !1);
    },
    l.options.isScrollingResetDelay
  ), o = (c) => () => {
    const { horizontal: d, isRtl: v } = l.options;
    s = d ? t.scrollLeft * (v && -1 || 1) : t.scrollTop, i(), a(s, c);
  }, n = o(!0), r = o(!1);
  t.addEventListener("scroll", n, w);
  const u = l.options.useScrollendEvent && z;
  return u && t.addEventListener("scrollend", r, w), () => {
    t.removeEventListener("scroll", n), u && t.removeEventListener("scrollend", r);
  };
}, N = (l, a, t) => {
  if (a?.borderBoxSize) {
    const e = a.borderBoxSize[0];
    if (e)
      return Math.round(
        e[t.options.horizontal ? "inlineSize" : "blockSize"]
      );
  }
  return l[t.options.horizontal ? "offsetWidth" : "offsetHeight"];
}, V = (l, {
  adjustments: a = 0,
  behavior: t
}, e) => {
  var s, i;
  const o = l + a;
  (i = (s = e.scrollElement) == null ? void 0 : s.scrollTo) == null || i.call(s, {
    [e.options.horizontal ? "left" : "top"]: o,
    behavior: t
  });
};
class j {
  constructor(a) {
    this.unsubs = [], this.scrollElement = null, this.targetWindow = null, this.isScrolling = !1, this.scrollState = null, this.measurementsCache = [], this.itemSizeCache = /* @__PURE__ */ new Map(), this.laneAssignments = /* @__PURE__ */ new Map(), this.pendingMeasuredCacheIndexes = [], this.prevLanes = void 0, this.lanesChangedFlag = !1, this.lanesSettling = !1, this.scrollRect = null, this.scrollOffset = null, this.scrollDirection = null, this.scrollAdjustments = 0, this.elementsCache = /* @__PURE__ */ new Map(), this.now = () => {
      var t, e, s;
      return ((s = (e = (t = this.targetWindow) == null ? void 0 : t.performance) == null ? void 0 : e.now) == null ? void 0 : s.call(e)) ?? Date.now();
    }, this.observer = /* @__PURE__ */ (() => {
      let t = null;
      const e = () => t || (!this.targetWindow || !this.targetWindow.ResizeObserver ? null : t = new this.targetWindow.ResizeObserver((s) => {
        s.forEach((i) => {
          const o = () => {
            const n = i.target, r = this.indexFromElement(n);
            if (!n.isConnected) {
              this.observer.unobserve(n);
              return;
            }
            this.shouldMeasureDuringScroll(r) && this.resizeItem(
              r,
              this.options.measureElement(n, i, this)
            );
          };
          this.options.useAnimationFrameWithResizeObserver ? requestAnimationFrame(o) : o();
        });
      }));
      return {
        disconnect: () => {
          var s;
          (s = e()) == null || s.disconnect(), t = null;
        },
        observe: (s) => {
          var i;
          return (i = e()) == null ? void 0 : i.observe(s, { box: "border-box" });
        },
        unobserve: (s) => {
          var i;
          return (i = e()) == null ? void 0 : i.unobserve(s);
        }
      };
    })(), this.range = null, this.setOptions = (t) => {
      Object.entries(t).forEach(([e, s]) => {
        typeof s > "u" && delete t[e];
      }), this.options = {
        debug: !1,
        initialOffset: 0,
        overscan: 1,
        paddingStart: 0,
        paddingEnd: 0,
        scrollPaddingStart: 0,
        scrollPaddingEnd: 0,
        horizontal: !1,
        getItemKey: F,
        rangeExtractor: W,
        onChange: () => {
        },
        measureElement: N,
        initialRect: { width: 0, height: 0 },
        scrollMargin: 0,
        gap: 0,
        indexAttribute: "data-index",
        initialMeasurementsCache: [],
        lanes: 1,
        isScrollingResetDelay: 150,
        enabled: !0,
        isRtl: !1,
        useScrollendEvent: !1,
        useAnimationFrameWithResizeObserver: !1,
        laneAssignmentMode: "estimate",
        ...t
      };
    }, this.notify = (t) => {
      var e, s;
      (s = (e = this.options).onChange) == null || s.call(e, this, t);
    }, this.maybeNotify = p(
      () => (this.calculateRange(), [
        this.isScrolling,
        this.range ? this.range.startIndex : null,
        this.range ? this.range.endIndex : null
      ]),
      (t) => {
        this.notify(t);
      },
      {
        key: process.env.NODE_ENV !== "production" && "maybeNotify",
        debug: () => this.options.debug,
        initialDeps: [
          this.isScrolling,
          this.range ? this.range.startIndex : null,
          this.range ? this.range.endIndex : null
        ]
      }
    ), this.cleanup = () => {
      this.unsubs.filter(Boolean).forEach((t) => t()), this.unsubs = [], this.observer.disconnect(), this.rafId != null && this.targetWindow && (this.targetWindow.cancelAnimationFrame(this.rafId), this.rafId = null), this.scrollState = null, this.scrollElement = null, this.targetWindow = null;
    }, this._didMount = () => () => {
      this.cleanup();
    }, this._willUpdate = () => {
      var t;
      const e = this.options.enabled ? this.options.getScrollElement() : null;
      if (this.scrollElement !== e) {
        if (this.cleanup(), !e) {
          this.maybeNotify();
          return;
        }
        this.scrollElement = e, this.scrollElement && "ownerDocument" in this.scrollElement ? this.targetWindow = this.scrollElement.ownerDocument.defaultView : this.targetWindow = ((t = this.scrollElement) == null ? void 0 : t.window) ?? null, this.elementsCache.forEach((s) => {
          this.observer.observe(s);
        }), this.unsubs.push(
          this.options.observeElementRect(this, (s) => {
            this.scrollRect = s, this.maybeNotify();
          })
        ), this.unsubs.push(
          this.options.observeElementOffset(this, (s, i) => {
            this.scrollAdjustments = 0, this.scrollDirection = i ? this.getScrollOffset() < s ? "forward" : "backward" : null, this.scrollOffset = s, this.isScrolling = i, this.scrollState && this.scheduleScrollReconcile(), this.maybeNotify();
          })
        ), this._scrollToOffset(this.getScrollOffset(), {
          adjustments: void 0,
          behavior: void 0
        });
      }
    }, this.rafId = null, this.getSize = () => this.options.enabled ? (this.scrollRect = this.scrollRect ?? this.options.initialRect, this.scrollRect[this.options.horizontal ? "width" : "height"]) : (this.scrollRect = null, 0), this.getScrollOffset = () => this.options.enabled ? (this.scrollOffset = this.scrollOffset ?? (typeof this.options.initialOffset == "function" ? this.options.initialOffset() : this.options.initialOffset), this.scrollOffset) : (this.scrollOffset = null, 0), this.getFurthestMeasurement = (t, e) => {
      const s = /* @__PURE__ */ new Map(), i = /* @__PURE__ */ new Map();
      for (let o = e - 1; o >= 0; o--) {
        const n = t[o];
        if (s.has(n.lane))
          continue;
        const r = i.get(
          n.lane
        );
        if (r == null || n.end > r.end ? i.set(n.lane, n) : n.end < r.end && s.set(n.lane, !0), s.size === this.options.lanes)
          break;
      }
      return i.size === this.options.lanes ? Array.from(i.values()).sort((o, n) => o.end === n.end ? o.index - n.index : o.end - n.end)[0] : void 0;
    }, this.getMeasurementOptions = p(
      () => [
        this.options.count,
        this.options.paddingStart,
        this.options.scrollMargin,
        this.options.getItemKey,
        this.options.enabled,
        this.options.lanes,
        this.options.laneAssignmentMode
      ],
      (t, e, s, i, o, n, r) => (this.prevLanes !== void 0 && this.prevLanes !== n && (this.lanesChangedFlag = !0), this.prevLanes = n, this.pendingMeasuredCacheIndexes = [], {
        count: t,
        paddingStart: e,
        scrollMargin: s,
        getItemKey: i,
        enabled: o,
        lanes: n,
        laneAssignmentMode: r
      }),
      {
        key: !1
      }
    ), this.getMeasurements = p(
      () => [this.getMeasurementOptions(), this.itemSizeCache],
      ({
        count: t,
        paddingStart: e,
        scrollMargin: s,
        getItemKey: i,
        enabled: o,
        lanes: n,
        laneAssignmentMode: r
      }, u) => {
        if (!o)
          return this.measurementsCache = [], this.itemSizeCache.clear(), this.laneAssignments.clear(), [];
        if (this.laneAssignments.size > t)
          for (const h of this.laneAssignments.keys())
            h >= t && this.laneAssignments.delete(h);
        this.lanesChangedFlag && (this.lanesChangedFlag = !1, this.lanesSettling = !0, this.measurementsCache = [], this.itemSizeCache.clear(), this.laneAssignments.clear(), this.pendingMeasuredCacheIndexes = []), this.measurementsCache.length === 0 && !this.lanesSettling && (this.measurementsCache = this.options.initialMeasurementsCache, this.measurementsCache.forEach((h) => {
          this.itemSizeCache.set(h.key, h.size);
        }));
        const c = this.lanesSettling ? 0 : this.pendingMeasuredCacheIndexes.length > 0 ? Math.min(...this.pendingMeasuredCacheIndexes) : 0;
        this.pendingMeasuredCacheIndexes = [], this.lanesSettling && this.measurementsCache.length === t && (this.lanesSettling = !1);
        const d = this.measurementsCache.slice(0, c), v = new Array(n).fill(
          void 0
        );
        for (let h = 0; h < c; h++) {
          const m = d[h];
          m && (v[m.lane] = h);
        }
        for (let h = c; h < t; h++) {
          const m = i(h), b = this.laneAssignments.get(h);
          let g, S;
          const y = r === "estimate" || u.has(m);
          if (b !== void 0 && this.options.lanes > 1) {
            g = b;
            const f = v[g], O = f !== void 0 ? d[f] : void 0;
            S = O ? O.end + this.options.gap : e + s;
          } else {
            const f = this.options.lanes === 1 ? d[h - 1] : this.getFurthestMeasurement(d, h);
            S = f ? f.end + this.options.gap : e + s, g = f ? f.lane : h % this.options.lanes, this.options.lanes > 1 && y && this.laneAssignments.set(h, g);
          }
          const E = u.get(m), x = typeof E == "number" ? E : this.options.estimateSize(h), A = S + x;
          d[h] = {
            index: h,
            start: S,
            size: x,
            end: A,
            key: m,
            lane: g
          }, v[g] = h;
        }
        return this.measurementsCache = d, d;
      },
      {
        key: process.env.NODE_ENV !== "production" && "getMeasurements",
        debug: () => this.options.debug
      }
    ), this.calculateRange = p(
      () => [
        this.getMeasurements(),
        this.getSize(),
        this.getScrollOffset(),
        this.options.lanes
      ],
      (t, e, s, i) => this.range = t.length > 0 && e > 0 ? T({
        measurements: t,
        outerSize: e,
        scrollOffset: s,
        lanes: i
      }) : null,
      {
        key: process.env.NODE_ENV !== "production" && "calculateRange",
        debug: () => this.options.debug
      }
    ), this.getVirtualIndexes = p(
      () => {
        let t = null, e = null;
        const s = this.calculateRange();
        return s && (t = s.startIndex, e = s.endIndex), this.maybeNotify.updateDeps([this.isScrolling, t, e]), [
          this.options.rangeExtractor,
          this.options.overscan,
          this.options.count,
          t,
          e
        ];
      },
      (t, e, s, i, o) => i === null || o === null ? [] : t({
        startIndex: i,
        endIndex: o,
        overscan: e,
        count: s
      }),
      {
        key: process.env.NODE_ENV !== "production" && "getVirtualIndexes",
        debug: () => this.options.debug
      }
    ), this.indexFromElement = (t) => {
      const e = this.options.indexAttribute, s = t.getAttribute(e);
      return s ? parseInt(s, 10) : (console.warn(
        `Missing attribute name '${e}={index}' on measured element.`
      ), -1);
    }, this.shouldMeasureDuringScroll = (t) => {
      var e;
      if (!this.scrollState || this.scrollState.behavior !== "smooth")
        return !0;
      const s = this.scrollState.index ?? ((e = this.getVirtualItemForOffset(this.scrollState.lastTargetOffset)) == null ? void 0 : e.index);
      if (s !== void 0 && this.range) {
        const i = Math.max(
          this.options.overscan,
          Math.ceil((this.range.endIndex - this.range.startIndex) / 2)
        ), o = Math.max(0, s - i), n = Math.min(
          this.options.count - 1,
          s + i
        );
        return t >= o && t <= n;
      }
      return !0;
    }, this.measureElement = (t) => {
      if (!t) {
        this.elementsCache.forEach((o, n) => {
          o.isConnected || (this.observer.unobserve(o), this.elementsCache.delete(n));
        });
        return;
      }
      const e = this.indexFromElement(t), s = this.options.getItemKey(e), i = this.elementsCache.get(s);
      i !== t && (i && this.observer.unobserve(i), this.observer.observe(t), this.elementsCache.set(s, t)), (!this.isScrolling || this.scrollState) && this.shouldMeasureDuringScroll(e) && this.resizeItem(e, this.options.measureElement(t, void 0, this));
    }, this.resizeItem = (t, e) => {
      var s;
      const i = this.measurementsCache[t];
      if (!i) return;
      const o = this.itemSizeCache.get(i.key) ?? i.size, n = e - o;
      n !== 0 && (((s = this.scrollState) == null ? void 0 : s.behavior) !== "smooth" && (this.shouldAdjustScrollPositionOnItemSizeChange !== void 0 ? this.shouldAdjustScrollPositionOnItemSizeChange(i, n, this) : i.start < this.getScrollOffset() + this.scrollAdjustments) && (process.env.NODE_ENV !== "production" && this.options.debug && console.info("correction", n), this._scrollToOffset(this.getScrollOffset(), {
        adjustments: this.scrollAdjustments += n,
        behavior: void 0
      })), this.pendingMeasuredCacheIndexes.push(i.index), this.itemSizeCache = new Map(this.itemSizeCache.set(i.key, e)), this.notify(!1));
    }, this.getVirtualItems = p(
      () => [this.getVirtualIndexes(), this.getMeasurements()],
      (t, e) => {
        const s = [];
        for (let i = 0, o = t.length; i < o; i++) {
          const n = t[i], r = e[n];
          s.push(r);
        }
        return s;
      },
      {
        key: process.env.NODE_ENV !== "production" && "getVirtualItems",
        debug: () => this.options.debug
      }
    ), this.getVirtualItemForOffset = (t) => {
      const e = this.getMeasurements();
      if (e.length !== 0)
        return M(
          e[C(
            0,
            e.length - 1,
            (s) => M(e[s]).start,
            t
          )]
        );
    }, this.getMaxScrollOffset = () => {
      if (!this.scrollElement) return 0;
      if ("scrollHeight" in this.scrollElement)
        return this.options.horizontal ? this.scrollElement.scrollWidth - this.scrollElement.clientWidth : this.scrollElement.scrollHeight - this.scrollElement.clientHeight;
      {
        const t = this.scrollElement.document.documentElement;
        return this.options.horizontal ? t.scrollWidth - this.scrollElement.innerWidth : t.scrollHeight - this.scrollElement.innerHeight;
      }
    }, this.getOffsetForAlignment = (t, e, s = 0) => {
      if (!this.scrollElement) return 0;
      const i = this.getSize(), o = this.getScrollOffset();
      e === "auto" && (e = t >= o + i ? "end" : "start"), e === "center" ? t += (s - i) / 2 : e === "end" && (t -= i);
      const n = this.getMaxScrollOffset();
      return Math.max(Math.min(n, t), 0);
    }, this.getOffsetForIndex = (t, e = "auto") => {
      t = Math.max(0, Math.min(t, this.options.count - 1));
      const s = this.getSize(), i = this.getScrollOffset(), o = this.measurementsCache[t];
      if (!o) return;
      if (e === "auto")
        if (o.end >= i + s - this.options.scrollPaddingEnd)
          e = "end";
        else if (o.start <= i + this.options.scrollPaddingStart)
          e = "start";
        else
          return [i, e];
      if (e === "end" && t === this.options.count - 1)
        return [this.getMaxScrollOffset(), e];
      const n = e === "end" ? o.end + this.options.scrollPaddingEnd : o.start - this.options.scrollPaddingStart;
      return [
        this.getOffsetForAlignment(n, e, o.size),
        e
      ];
    }, this.scrollToOffset = (t, { align: e = "start", behavior: s = "auto" } = {}) => {
      const i = this.getOffsetForAlignment(t, e), o = this.now();
      this.scrollState = {
        index: null,
        align: e,
        behavior: s,
        startedAt: o,
        lastTargetOffset: i,
        stableFrames: 0
      }, this._scrollToOffset(i, { adjustments: void 0, behavior: s }), this.scheduleScrollReconcile();
    }, this.scrollToIndex = (t, {
      align: e = "auto",
      behavior: s = "auto"
    } = {}) => {
      t = Math.max(0, Math.min(t, this.options.count - 1));
      const i = this.getOffsetForIndex(t, e);
      if (!i)
        return;
      const [o, n] = i, r = this.now();
      this.scrollState = {
        index: t,
        align: n,
        behavior: s,
        startedAt: r,
        lastTargetOffset: o,
        stableFrames: 0
      }, this._scrollToOffset(o, { adjustments: void 0, behavior: s }), this.scheduleScrollReconcile();
    }, this.scrollBy = (t, { behavior: e = "auto" } = {}) => {
      const s = this.getScrollOffset() + t, i = this.now();
      this.scrollState = {
        index: null,
        align: "start",
        behavior: e,
        startedAt: i,
        lastTargetOffset: s,
        stableFrames: 0
      }, this._scrollToOffset(s, { adjustments: void 0, behavior: e }), this.scheduleScrollReconcile();
    }, this.getTotalSize = () => {
      var t;
      const e = this.getMeasurements();
      let s;
      if (e.length === 0)
        s = this.options.paddingStart;
      else if (this.options.lanes === 1)
        s = ((t = e[e.length - 1]) == null ? void 0 : t.end) ?? 0;
      else {
        const i = Array(this.options.lanes).fill(null);
        let o = e.length - 1;
        for (; o >= 0 && i.some((n) => n === null); ) {
          const n = e[o];
          i[n.lane] === null && (i[n.lane] = n.end), o--;
        }
        s = Math.max(...i.filter((n) => n !== null));
      }
      return Math.max(
        s - this.options.scrollMargin + this.options.paddingEnd,
        0
      );
    }, this._scrollToOffset = (t, {
      adjustments: e,
      behavior: s
    }) => {
      this.options.scrollToFn(t, { behavior: s, adjustments: e }, this);
    }, this.measure = () => {
      this.itemSizeCache = /* @__PURE__ */ new Map(), this.laneAssignments = /* @__PURE__ */ new Map(), this.notify(!1);
    }, this.setOptions(a);
  }
  scheduleScrollReconcile() {
    if (!this.targetWindow) {
      this.scrollState = null;
      return;
    }
    this.rafId == null && (this.rafId = this.targetWindow.requestAnimationFrame(() => {
      this.rafId = null, this.reconcileScroll();
    }));
  }
  reconcileScroll() {
    if (!this.scrollState || !this.scrollElement) return;
    if (this.now() - this.scrollState.startedAt > 5e3) {
      this.scrollState = null;
      return;
    }
    const e = this.scrollState.index != null ? this.getOffsetForIndex(this.scrollState.index, this.scrollState.align) : void 0, s = e ? e[0] : this.scrollState.lastTargetOffset, i = 1, o = s !== this.scrollState.lastTargetOffset;
    if (!o && _(s, this.getScrollOffset())) {
      if (this.scrollState.stableFrames++, this.scrollState.stableFrames >= i) {
        this.scrollState = null;
        return;
      }
    } else
      this.scrollState.stableFrames = 0, o && (this.scrollState.lastTargetOffset = s, this.scrollState.behavior = "auto", this._scrollToOffset(s, {
        adjustments: void 0,
        behavior: "auto"
      }));
    this.scheduleScrollReconcile();
  }
}
const C = (l, a, t, e) => {
  for (; l <= a; ) {
    const s = (l + a) / 2 | 0, i = t(s);
    if (i < e)
      l = s + 1;
    else if (i > e)
      a = s - 1;
    else
      return s;
  }
  return l > 0 ? l - 1 : 0;
};
function T({
  measurements: l,
  outerSize: a,
  scrollOffset: t,
  lanes: e
}) {
  const s = l.length - 1, i = (r) => l[r].start;
  if (l.length <= e)
    return {
      startIndex: 0,
      endIndex: s
    };
  let o = C(
    0,
    s,
    i,
    t
  ), n = o;
  if (e === 1)
    for (; n < s && l[n].end < t + a; )
      n++;
  else if (e > 1) {
    const r = Array(e).fill(0);
    for (; n < s && r.some((c) => c < t + a); ) {
      const c = l[n];
      r[c.lane] = c.end, n++;
    }
    const u = Array(e).fill(t + a);
    for (; o >= 0 && u.some((c) => c >= t); ) {
      const c = l[o];
      u[c.lane] = c.start, o--;
    }
    o = Math.max(0, o - o % e), n = Math.min(s, n + (e - 1 - n % e));
  }
  return { startIndex: o, endIndex: n };
}
export {
  j as Virtualizer,
  _ as approxEqual,
  R as debounce,
  F as defaultKeyExtractor,
  W as defaultRangeExtractor,
  V as elementScroll,
  N as measureElement,
  p as memo,
  M as notUndefined,
  D as observeElementOffset,
  k as observeElementRect
};
//# sourceMappingURL=index150.js.map
