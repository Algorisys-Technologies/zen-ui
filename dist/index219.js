import { createLazyMeasurementsView as F } from "./index229.js";
import { memo as _, notUndefined as T, approxEqual as R, debounce as D } from "./index230.js";
let M;
const y = () => {
  if (M !== void 0) return M;
  if (typeof navigator > "u") return M = !1;
  if (/iP(hone|od|ad)/.test(navigator.userAgent)) return M = !0;
  const r = navigator.maxTouchPoints;
  return M = navigator.platform === "MacIntel" && r !== void 0 && r > 0;
}, A = (r) => {
  const { offsetWidth: h, offsetHeight: t } = r;
  return { width: h, height: t };
}, k = (r) => r, W = (r) => {
  const h = Math.max(r.startIndex - r.overscan, 0), e = Math.min(r.endIndex + r.overscan, r.count - 1) - h + 1, s = new Array(e);
  for (let i = 0; i < e; i++)
    s[i] = h + i;
  return s;
}, J = (r, h) => {
  const t = r.scrollElement;
  if (!t)
    return;
  const e = r.targetWindow;
  if (!e)
    return;
  const s = (o) => {
    const { width: n, height: l } = o;
    h({ width: Math.round(n), height: Math.round(l) });
  };
  if (s(A(t)), !e.ResizeObserver)
    return () => {
    };
  const i = new e.ResizeObserver((o) => {
    const n = () => {
      const l = o[0];
      if (l?.borderBoxSize) {
        const d = l.borderBoxSize[0];
        if (d) {
          s({ width: d.inlineSize, height: d.blockSize });
          return;
        }
      }
      s(A(t));
    };
    r.options.useAnimationFrameWithResizeObserver ? requestAnimationFrame(n) : n();
  });
  return i.observe(t, { box: "border-box" }), () => {
    i.unobserve(t);
  };
}, z = {
  passive: !0
}, j = typeof window > "u" ? !0 : "onscrollend" in window, L = (r, h, t) => {
  const e = r.scrollElement;
  if (!e)
    return;
  const s = r.targetWindow;
  if (!s)
    return;
  const i = r.options.useScrollendEvent && j;
  let o = 0;
  const n = i ? null : D(
    s,
    () => h(o, !1),
    r.options.isScrollingResetDelay
  ), l = (u) => () => {
    o = t(e), n?.(), h(o, u);
  }, d = l(!0), f = l(!1);
  return e.addEventListener("scroll", d, z), i && e.addEventListener("scrollend", f, z), () => {
    e.removeEventListener("scroll", d), i && e.removeEventListener("scrollend", f);
  };
}, q = (r, h) => L(r, h, (t) => {
  const { horizontal: e, isRtl: s } = r.options;
  return e ? t.scrollLeft * (s && -1 || 1) : t.scrollTop;
}), V = (r, h, t) => {
  if (t.options.useCachedMeasurements) {
    const e = t.indexFromElement(r), s = t.options.getItemKey(e);
    return t.itemSizeCache.get(s) ?? t.options.estimateSize(e);
  }
  if (h?.borderBoxSize) {
    const e = h.borderBoxSize[0];
    if (e)
      return Math.round(
        e[t.options.horizontal ? "inlineSize" : "blockSize"]
      );
  }
  if (!h) {
    const e = t.indexFromElement(r), s = t.options.getItemKey(e), i = t.itemSizeCache.get(s);
    if (i !== void 0)
      return i;
  }
  return r[t.options.horizontal ? "offsetWidth" : "offsetHeight"];
}, N = (r, {
  adjustments: h = 0,
  behavior: t
}, e) => {
  var s, i;
  (i = (s = e.scrollElement) == null ? void 0 : s.scrollTo) == null || i.call(s, {
    [e.options.horizontal ? "left" : "top"]: r + h,
    behavior: t
  });
}, U = N;
class X {
  constructor(h) {
    this.unsubs = [], this.scrollElement = null, this.targetWindow = null, this.isScrolling = !1, this.scrollState = null, this.measurementsCache = [], this._flatMeasurements = null, this.itemSizeCache = /* @__PURE__ */ new Map(), this.itemSizeCacheVersion = 0, this.laneAssignments = /* @__PURE__ */ new Map(), this.pendingMin = null, this.prevLanes = void 0, this.lanesChangedFlag = !1, this.lanesSettling = !1, this.pendingScrollAnchor = null, this.scrollRect = null, this.scrollOffset = null, this.scrollDirection = null, this.scrollAdjustments = 0, this._iosDeferredAdjustment = 0, this._iosTouching = !1, this._iosJustTouchEnded = !1, this._iosTouchEndTimerId = null, this._intendedScrollOffset = null, this.elementsCache = /* @__PURE__ */ new Map(), this.now = () => {
      var t, e, s;
      return ((s = (e = (t = this.targetWindow) == null ? void 0 : t.performance) == null ? void 0 : e.now) == null ? void 0 : s.call(e)) ?? Date.now();
    }, this.observer = /* @__PURE__ */ (() => {
      let t = null;
      const e = () => t || (!this.targetWindow || !this.targetWindow.ResizeObserver ? null : t = new this.targetWindow.ResizeObserver((s) => {
        s.forEach((i) => {
          const o = () => {
            const n = i.target, l = this.indexFromElement(n);
            if (!n.isConnected) {
              this.observer.unobserve(n);
              for (const [d, f] of this.elementsCache)
                if (f === n) {
                  this.elementsCache.delete(d);
                  break;
                }
              return;
            }
            this.shouldMeasureDuringScroll(l) && this.resizeItem(
              l,
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
      var e, s;
      const i = {
        debug: !1,
        initialOffset: 0,
        overscan: 1,
        paddingStart: 0,
        paddingEnd: 0,
        scrollPaddingStart: 0,
        scrollPaddingEnd: 0,
        horizontal: !1,
        getItemKey: k,
        rangeExtractor: W,
        onChange: () => {
        },
        measureElement: V,
        initialRect: { width: 0, height: 0 },
        scrollMargin: 0,
        gap: 0,
        indexAttribute: "data-index",
        initialMeasurementsCache: [],
        lanes: 1,
        anchorTo: "start",
        followOnAppend: !1,
        scrollEndThreshold: 1,
        isScrollingResetDelay: 150,
        enabled: !0,
        isRtl: !1,
        useScrollendEvent: !1,
        useAnimationFrameWithResizeObserver: !1,
        laneAssignmentMode: "estimate",
        useCachedMeasurements: !1
      };
      for (const c in t) {
        const S = t[c];
        S !== void 0 && (i[c] = S);
      }
      const o = this.options;
      let n = null, l = null, d = !1;
      if (o !== void 0 && o.enabled && i.enabled && i.anchorTo === "end" && this.scrollElement !== null) {
        const c = o.count, S = i.count, a = this.getMeasurements(), v = c > 0 ? ((e = a[0]) == null ? void 0 : e.key) ?? o.getItemKey(0) : null, g = c > 0 ? ((s = a[c - 1]) == null ? void 0 : s.key) ?? o.getItemKey(c - 1) : null;
        if (S !== c || c > 0 && S > 0 && (i.getItemKey(0) !== v || i.getItemKey(S - 1) !== g)) {
          d = !0;
          const m = c > 0 ? this.getVirtualItemForOffset(this.getScrollOffset()) ?? a[0] : null;
          m && (n = [m.key, this.getScrollOffset() - m.start]);
          const b = i.followOnAppend === !0 ? "auto" : i.followOnAppend || null;
          b && S > c && this.isAtEnd(o.scrollEndThreshold) && (c === 0 || i.getItemKey(S - 1) !== g) && (l = b);
        }
      }
      this.options = i, d && (this.pendingMin = 0, this.itemSizeCacheVersion++);
      let f = !1, u = 0;
      if (n && this.scrollOffset !== null) {
        const [c, S] = n, a = this.getMeasurements(), { count: v, getItemKey: g } = this.options;
        let p = 0;
        for (; p < v && g(p) !== c; )
          p++;
        if (p < v) {
          const E = a[p];
          if (E) {
            const m = E.start + S;
            m !== this.scrollOffset && (u = m - this.scrollOffset, this.scrollOffset = m, f = !0);
          }
        }
      }
      (f || l) && (this.pendingScrollAnchor = [
        f ? n[0] : null,
        f ? n[1] : 0,
        l,
        u
      ]);
    }, this.notify = (t) => {
      var e, s;
      (s = (e = this.options).onChange) == null || s.call(e, this, t);
    }, this.maybeNotify = _(
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
        if (this.scrollElement = e, this.scrollElement && "ownerDocument" in this.scrollElement ? this.targetWindow = this.scrollElement.ownerDocument.defaultView : this.targetWindow = ((t = this.scrollElement) == null ? void 0 : t.window) ?? null, this.elementsCache.forEach((i) => {
          this.observer.observe(i);
        }), this.unsubs.push(
          this.options.observeElementRect(this, (i) => {
            this.scrollRect = i, this.maybeNotify();
          })
        ), this.unsubs.push(
          this.options.observeElementOffset(this, (i, o) => {
            if (o && this._intendedScrollOffset === null && i === this.scrollOffset)
              return;
            this._intendedScrollOffset !== null && Math.abs(i - this._intendedScrollOffset) < 1.5 && (i = this._intendedScrollOffset), this._intendedScrollOffset = null, this.scrollAdjustments = 0;
            const n = this.getScrollOffset();
            this.scrollDirection = o ? n === i ? this.scrollDirection : n < i ? "forward" : "backward" : null, this.scrollOffset = i, this.isScrolling = o, this._flushIosDeferredIfReady(), this.scrollState && this.scheduleScrollReconcile(), this.maybeNotify();
          })
        ), "addEventListener" in this.scrollElement) {
          const i = this.scrollElement, o = () => {
            this._iosTouching = !0, this._iosJustTouchEnded = !1, this._iosTouchEndTimerId !== null && this.targetWindow != null && (this.targetWindow.clearTimeout(this._iosTouchEndTimerId), this._iosTouchEndTimerId = null);
          }, n = () => {
            this._iosTouching = !1, !(!y() || this.targetWindow == null) && (this._iosJustTouchEnded = !0, this._iosTouchEndTimerId = this.targetWindow.setTimeout(() => {
              this._iosJustTouchEnded = !1, this._iosTouchEndTimerId = null, this._flushIosDeferredIfReady();
            }, 150));
          };
          i.addEventListener(
            "touchstart",
            o,
            z
          ), i.addEventListener(
            "touchend",
            n,
            z
          ), this.unsubs.push(() => {
            i.removeEventListener("touchstart", o), i.removeEventListener("touchend", n), this._iosTouchEndTimerId !== null && this.targetWindow != null && (this.targetWindow.clearTimeout(this._iosTouchEndTimerId), this._iosTouchEndTimerId = null);
          });
        }
        this._scrollToOffset(this.getScrollOffset(), {
          adjustments: void 0,
          behavior: void 0
        });
      }
      const s = this.pendingScrollAnchor;
      if (this.pendingScrollAnchor = null, s && this.scrollElement && this.options.enabled) {
        const [i, o, n, l] = s;
        i !== null && !n && (y() && (this.isScrolling || this._iosTouching || this._iosJustTouchEnded) ? l !== 0 && (this._iosDeferredAdjustment += l) : this._scrollToOffset(this.getScrollOffset(), {
          adjustments: void 0,
          behavior: void 0
        })), n && this.scrollToEnd({ behavior: n });
      }
    }, this._flushIosDeferredIfReady = () => {
      if (this._iosDeferredAdjustment === 0 || this.isScrolling || this._iosTouching || this._iosJustTouchEnded) return;
      const t = this.getScrollOffset(), e = this.getMaxScrollOffset();
      if (t < 0 || t > e) return;
      const s = this._iosDeferredAdjustment;
      this._iosDeferredAdjustment = 0, this._scrollToOffset(t, {
        adjustments: this.scrollAdjustments += s,
        behavior: void 0
      });
    }, this.rafId = null, this.getSize = () => this.options.enabled ? (this.scrollRect = this.scrollRect ?? this.options.initialRect, this.scrollRect[this.options.horizontal ? "width" : "height"]) : (this.scrollRect = null, 0), this.getScrollOffset = () => this.options.enabled ? (this.scrollOffset = this.scrollOffset ?? (typeof this.options.initialOffset == "function" ? this.options.initialOffset() : this.options.initialOffset), this.scrollOffset) : (this.scrollOffset = null, 0), this.getFurthestMeasurement = (t, e) => {
      const s = /* @__PURE__ */ new Map(), i = /* @__PURE__ */ new Map();
      for (let o = e - 1; o >= 0; o--) {
        const n = t[o];
        if (s.has(n.lane))
          continue;
        const l = i.get(
          n.lane
        );
        if (l == null || n.end > l.end ? i.set(n.lane, n) : n.end < l.end && s.set(n.lane, !0), s.size === this.options.lanes)
          break;
      }
      return i.size === this.options.lanes ? Array.from(i.values()).sort((o, n) => o.end === n.end ? o.index - n.index : o.end - n.end)[0] : void 0;
    }, this.getMeasurementOptions = _(
      () => [
        this.options.count,
        this.options.paddingStart,
        this.options.scrollMargin,
        this.options.getItemKey,
        this.options.enabled,
        this.options.lanes,
        this.options.laneAssignmentMode
      ],
      (t, e, s, i, o, n, l) => (this.prevLanes !== void 0 && this.prevLanes !== n && (this.lanesChangedFlag = !0), this.prevLanes = n, this.pendingMin = null, {
        count: t,
        paddingStart: e,
        scrollMargin: s,
        getItemKey: i,
        enabled: o,
        lanes: n,
        laneAssignmentMode: l
      }),
      {
        key: !1
      }
    ), this.getMeasurements = _(
      () => [this.getMeasurementOptions(), this.itemSizeCacheVersion],
      ({
        count: t,
        paddingStart: e,
        scrollMargin: s,
        getItemKey: i,
        enabled: o,
        lanes: n,
        laneAssignmentMode: l
      }, d) => {
        const f = this.itemSizeCache;
        if (!o)
          return this.measurementsCache = [], this.itemSizeCache.clear(), this.laneAssignments.clear(), [];
        if (this.laneAssignments.size > t)
          for (const a of this.laneAssignments.keys())
            a >= t && this.laneAssignments.delete(a);
        this.lanesChangedFlag && (this.lanesChangedFlag = !1, this.lanesSettling = !0, this.measurementsCache = [], this.itemSizeCache.clear(), this.laneAssignments.clear(), this.pendingMin = null), this.measurementsCache.length === 0 && !this.lanesSettling && (this.measurementsCache = this.options.initialMeasurementsCache, this.measurementsCache.forEach((a) => {
          this.itemSizeCache.set(a.key, a.size);
        }));
        const u = this.lanesSettling ? 0 : this.pendingMin ?? 0;
        if (this.pendingMin = null, this.lanesSettling && this.measurementsCache.length === t && (this.lanesSettling = !1), n === 1) {
          const a = this.options.gap, v = t * 2;
          let g = this._flatMeasurements;
          if (!g || g.length < v) {
            const m = new Float64Array(v);
            g && u > 0 && m.set(g.subarray(0, u * 2)), g = m, this._flatMeasurements = g;
          }
          let p;
          if (u === 0)
            p = e + s;
          else {
            const m = u - 1;
            p = g[m * 2] + g[m * 2 + 1] + a;
          }
          for (let m = u; m < t; m++) {
            const b = i(m), I = f.get(b), x = typeof I == "number" ? I : this.options.estimateSize(m);
            g[m * 2] = p, g[m * 2 + 1] = x, p += x + a;
          }
          const E = F(t, g, i);
          return this.measurementsCache = E, E;
        }
        const c = this.measurementsCache.slice(0, u), S = new Array(n).fill(
          void 0
        );
        for (let a = 0; a < u; a++) {
          const v = c[a];
          v && (S[v.lane] = a);
        }
        for (let a = u; a < t; a++) {
          const v = i(a), g = this.laneAssignments.get(a);
          let p, E;
          const m = l === "estimate" || f.has(v);
          if (g !== void 0 && this.options.lanes > 1) {
            p = g;
            const O = S[p], w = O !== void 0 ? c[O] : void 0;
            E = w ? w.end + this.options.gap : e + s;
          } else {
            const O = this.options.lanes === 1 ? c[a - 1] : this.getFurthestMeasurement(c, a);
            E = O ? O.end + this.options.gap : e + s, p = O ? O.lane : a % this.options.lanes, this.options.lanes > 1 && m && this.laneAssignments.set(a, p);
          }
          const b = f.get(v), I = typeof b == "number" ? b : this.options.estimateSize(a), x = E + I;
          c[a] = {
            index: a,
            start: E,
            size: I,
            end: x,
            key: v,
            lane: p
          }, S[p] = a;
        }
        return this.measurementsCache = c, c;
      },
      {
        key: process.env.NODE_ENV !== "production" && "getMeasurements",
        debug: () => this.options.debug
      }
    ), this.calculateRange = _(
      () => [
        this.getMeasurements(),
        this.getSize(),
        this.getScrollOffset(),
        this.options.lanes
      ],
      (t, e, s, i) => t.length === 0 || e === 0 ? (this.range = null, null) : (this.range = P(
        t,
        e,
        s,
        i,
        // Pass the typed array so binary search + forward-walk can read
        // start/end directly from Float64Array, skipping the Proxy traps.
        i === 1 && this._flatMeasurements != null ? this._flatMeasurements : null
      ), this.range),
      {
        key: process.env.NODE_ENV !== "production" && "calculateRange",
        debug: () => this.options.debug
      }
    ), this.getVirtualIndexes = _(
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
      var s, i;
      if (t < 0 || t >= this.options.count) return;
      let o, n, l;
      const d = this._flatMeasurements;
      if (this.options.lanes === 1 && d !== null)
        l = this.options.getItemKey(t), n = d[t * 2], o = d[t * 2 + 1];
      else {
        const c = this.measurementsCache[t];
        if (!c) return;
        l = c.key, n = c.start, o = c.size;
      }
      const f = this.itemSizeCache.get(l) ?? o, u = e - f;
      if (u !== 0) {
        const c = this.options.anchorTo === "end" && ((s = this.scrollState) == null ? void 0 : s.behavior) !== "smooth" && this.getVirtualDistanceFromEnd() <= this.options.scrollEndThreshold, S = c ? this.getTotalSize() : 0, a = ((i = this.scrollState) == null ? void 0 : i.behavior) !== "smooth" && (this.shouldAdjustScrollPositionOnItemSizeChange !== void 0 ? this.shouldAdjustScrollPositionOnItemSizeChange(
          // The callback expects a VirtualItem; build one lazily only
          // when the consumer actually supplied a custom predicate.
          this.measurementsCache[t] ?? {
            index: t,
            key: l,
            start: n,
            size: o,
            end: n + o,
            lane: 0
          },
          u,
          this
        ) : (
          // Default: adjust when the resize is an above-viewport item.
          // First measurement (!has(key)): always adjust — the item
          // has never been sized, so the estimate→actual delta must
          // be compensated regardless of scroll direction.
          // Re-measurement (has(key)): skip during backward scroll
          // to avoid the "items jump while scrolling up" cascade.
          n < this.getScrollOffset() + this.scrollAdjustments && (!this.itemSizeCache.has(l) || this.scrollDirection !== "backward")
        ));
        (this.pendingMin === null || t < this.pendingMin) && (this.pendingMin = t), this.itemSizeCache.set(l, e), this.itemSizeCacheVersion++, c ? this.applyScrollAdjustment(this.getTotalSize() - S) : a && this.applyScrollAdjustment(u), this.notify(!1);
      }
    }, this.getVirtualItems = _(
      () => [this.getVirtualIndexes(), this.getMeasurements()],
      (t, e) => {
        const s = [];
        for (let i = 0, o = t.length; i < o; i++) {
          const n = t[i], l = e[n];
          s.push(l);
        }
        return s;
      },
      {
        key: process.env.NODE_ENV !== "production" && "getVirtualItems",
        debug: () => this.options.debug
      }
    ), this.getVirtualItemForOffset = (t) => {
      const e = this.getMeasurements();
      if (e.length === 0)
        return;
      const s = this._flatMeasurements, i = this.options.lanes === 1 && s != null, o = C(
        0,
        e.length - 1,
        i ? (n) => s[n * 2] : (n) => T(e[n]).start,
        t
      );
      return T(e[o]);
    }, this.getMaxScrollOffset = () => {
      if (!this.scrollElement) return 0;
      if ("scrollHeight" in this.scrollElement)
        return this.options.horizontal ? this.scrollElement.scrollWidth - this.scrollElement.clientWidth : this.scrollElement.scrollHeight - this.scrollElement.clientHeight;
      {
        const t = this.scrollElement.document.documentElement;
        return this.options.horizontal ? t.scrollWidth - this.scrollElement.innerWidth : t.scrollHeight - this.scrollElement.innerHeight;
      }
    }, this.getVirtualDistanceFromEnd = () => Math.max(
      this.getTotalSize() - this.getSize() - this.getScrollOffset(),
      0
    ), this.getDistanceFromEnd = () => Math.max(this.getMaxScrollOffset() - this.getScrollOffset(), 0), this.isAtEnd = (t = this.options.scrollEndThreshold) => this.getDistanceFromEnd() <= t, this.getOffsetForAlignment = (t, e, s = 0) => {
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
      const [o, n] = i, l = this.now();
      this.scrollState = {
        index: t,
        align: n,
        behavior: s,
        startedAt: l,
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
    }, this.scrollToEnd = ({ behavior: t = "auto" } = {}) => {
      if (this.options.count > 0) {
        this.scrollToIndex(this.options.count - 1, {
          align: "end",
          behavior: t
        });
        return;
      }
      this.scrollToOffset(Math.max(this.getTotalSize() - this.getSize(), 0), {
        behavior: t
      });
    }, this.getTotalSize = () => {
      var t;
      const e = this.getMeasurements();
      let s;
      if (e.length === 0)
        s = this.options.paddingStart;
      else if (this.options.lanes === 1) {
        const i = e.length - 1, o = this._flatMeasurements;
        o != null ? s = o[i * 2] + o[i * 2 + 1] : s = ((t = e[i]) == null ? void 0 : t.end) ?? 0;
      } else {
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
    }, this.takeSnapshot = () => {
      const t = [];
      if (this.itemSizeCache.size === 0) return t;
      const e = this.getMeasurements();
      for (const s of e)
        s && this.itemSizeCache.has(s.key) && t.push({
          index: s.index,
          key: s.key,
          start: s.start,
          size: s.size,
          end: s.end,
          lane: s.lane
        });
      return t;
    }, this._scrollToOffset = (t, {
      adjustments: e,
      behavior: s
    }) => {
      this._intendedScrollOffset = t + (e ?? 0), this.options.scrollToFn(t, { behavior: s, adjustments: e }, this);
    }, this.measure = () => {
      this.pendingMin = null, this.itemSizeCache.clear(), this.laneAssignments.clear(), this.itemSizeCacheVersion++, this.notify(!1);
    }, this.setOptions(h);
  }
  applyScrollAdjustment(h, t) {
    h !== 0 && (process.env.NODE_ENV !== "production" && this.options.debug && console.info("correction", h), y() && (this.isScrolling || this._iosTouching || this._iosJustTouchEnded) ? this._iosDeferredAdjustment += h : (this._scrollToOffset(this.getScrollOffset(), {
      adjustments: this.scrollAdjustments += h,
      behavior: t
    }), this.scrollOffset !== null && (this.scrollOffset += this.scrollAdjustments, this.scrollAdjustments = 0)));
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
    if (!o && R(s, this.getScrollOffset())) {
      if (this.scrollState.stableFrames++, this.scrollState.stableFrames >= i) {
        this.getScrollOffset() !== s && this._scrollToOffset(s, {
          adjustments: void 0,
          behavior: "auto"
        }), this.scrollState = null;
        return;
      }
    } else if (this.scrollState.stableFrames = 0, o) {
      const n = this.getSize() || 600, l = Math.abs(s - this.getScrollOffset()), d = this.scrollState.behavior === "smooth" && l > n;
      this.scrollState.lastTargetOffset = s, d || (this.scrollState.behavior = "auto"), this._scrollToOffset(s, {
        adjustments: void 0,
        behavior: d ? "smooth" : "auto"
      });
    }
    this.scheduleScrollReconcile();
  }
}
const C = (r, h, t, e) => {
  for (; r <= h; ) {
    const s = (r + h) / 2 | 0, i = t(s);
    if (i < e)
      r = s + 1;
    else if (i > e)
      h = s - 1;
    else
      return s;
  }
  return r > 0 ? r - 1 : 0;
};
function K(r, h, t) {
  let e = 0;
  for (; e <= h; ) {
    const s = (e + h) / 2 | 0, i = r[s * 2];
    if (i < t)
      e = s + 1;
    else if (i > t)
      h = s - 1;
    else
      return s;
  }
  return e > 0 ? e - 1 : 0;
}
function P(r, h, t, e, s) {
  const i = r.length - 1;
  if (r.length <= e)
    return { startIndex: 0, endIndex: i };
  if (e === 1 && s !== null) {
    const d = K(
      s,
      i,
      t
    );
    let f = d;
    const u = t + h;
    for (; f < i && s[f * 2] + s[f * 2 + 1] < u; )
      f++;
    return { startIndex: d, endIndex: f };
  }
  let n = C(0, i, (d) => r[d].start, t), l = n;
  if (e === 1)
    for (; l < i && r[l].end < t + h; )
      l++;
  else if (e > 1) {
    const d = Array(e).fill(0);
    for (; l < i && d.some((u) => u < t + h); ) {
      const u = r[l];
      d[u.lane] = u.end, l++;
    }
    const f = Array(e).fill(t + h);
    for (; n >= 0 && f.some((u) => u >= t); ) {
      const u = r[n];
      f[u.lane] = u.start, n--;
    }
    n = Math.max(0, n - n % e), l = Math.min(i, l + (e - 1 - l % e));
  }
  return { startIndex: n, endIndex: l };
}
export {
  X as Virtualizer,
  R as approxEqual,
  D as debounce,
  k as defaultKeyExtractor,
  W as defaultRangeExtractor,
  U as elementScroll,
  V as measureElement,
  _ as memo,
  T as notUndefined,
  q as observeElementOffset,
  J as observeElementRect
};
//# sourceMappingURL=index219.js.map
