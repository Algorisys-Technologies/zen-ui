import { createCollection as U } from "./index188.js";
import { useLocale as N } from "./index147.js";
import { createControllableSignal as W } from "./index161.js";
import { focusWithoutScrolling as E, scrollIntoView as O, callHandler as H, getFocusableTreeWalker as _, mergeDefaultProps as q, isAppleDevice as $, isMac as j } from "./index164.js";
import { createMemo as A, createEffect as L, on as C, mergeProps as G, onMount as Z, createComputed as J, createSignal as k } from "solid-js";
import { access as o } from "./index166.js";
import { createEventListener as Q } from "./index189.js";
var b = class R extends Set {
  anchorKey;
  currentKey;
  constructor(t, s, n) {
    super(t), t instanceof R ? (this.anchorKey = s || t.anchorKey, this.currentKey = n || t.currentKey) : (this.anchorKey = s, this.currentKey = n);
  }
};
function X(e) {
  const [t, s] = W(e);
  return [() => t() ?? new b(), s];
}
function V(e) {
  return $() ? e.altKey : e.ctrlKey;
}
function I(e) {
  return j() ? e.metaKey : e.ctrlKey;
}
function B(e) {
  return new b(e);
}
function Y(e, t) {
  if (e.size !== t.size)
    return !1;
  for (const s of e)
    if (!t.has(s))
      return !1;
  return !0;
}
function ee(e) {
  const t = q({
    selectionMode: "none",
    selectionBehavior: "toggle"
  }, e), [s, n] = k(!1), [c, f] = k(), w = A(() => {
    const K = o(t.selectedKeys);
    return K != null ? B(K) : K;
  }), g = A(() => {
    const K = o(t.defaultSelectedKeys);
    return K != null ? B(K) : new b();
  }), [S, p] = X({
    value: w,
    defaultValue: g,
    onChange: (K) => t.onSelectionChange?.(K)
  }), [m, v] = k(o(t.selectionBehavior)), D = () => o(t.selectionMode), T = () => o(t.disallowEmptySelection) ?? !1, x = (K) => {
    (o(t.allowDuplicateSelectionEvents) || !Y(K, S())) && p(K);
  };
  return L(() => {
    const K = S();
    o(t.selectionBehavior) === "replace" && m() === "toggle" && typeof K == "object" && K.size === 0 && v("replace");
  }), L(() => {
    v(o(t.selectionBehavior) ?? "toggle");
  }), {
    selectionMode: D,
    disallowEmptySelection: T,
    selectionBehavior: m,
    setSelectionBehavior: v,
    isFocused: s,
    setFocused: n,
    focusedKey: c,
    setFocusedKey: f,
    selectedKeys: S,
    setSelectedKeys: x
  };
}
function te(e) {
  const [t, s] = k(""), [n, c] = k(-1);
  return {
    typeSelectHandlers: {
      onKeyDown: (w) => {
        if (o(e.isDisabled))
          return;
        const g = o(e.keyboardDelegate), S = o(e.selectionManager);
        if (!g.getKeyForSearch)
          return;
        const p = se(w.key);
        if (!p || w.ctrlKey || w.metaKey)
          return;
        p === " " && t().trim().length > 0 && (w.preventDefault(), w.stopPropagation());
        let m = s((D) => D + p), v = g.getKeyForSearch(m, S.focusedKey()) ?? g.getKeyForSearch(m);
        v == null && ne(m) && (m = m[0], v = g.getKeyForSearch(m, S.focusedKey()) ?? g.getKeyForSearch(m)), v != null && (S.setFocusedKey(v), e.onTypeSelect?.(v)), clearTimeout(n()), c(window.setTimeout(() => s(""), 500));
      }
    }
  };
}
function se(e) {
  return e.length === 1 || !/^[A-Z]/i.test(e) ? e : "";
}
function ne(e) {
  return e.split("").every((t) => t === e[0]);
}
function de(e, t, s) {
  const c = G({
    selectOnFocus: () => o(e.selectionManager).selectionBehavior() === "replace"
  }, e), f = () => s?.() ?? t(), {
    direction: w
  } = N();
  let g = {
    top: 0,
    left: 0
  };
  Q(() => o(c.isVirtualized) ? void 0 : f(), "scroll", () => {
    const i = f();
    i && (g = {
      top: i.scrollTop,
      left: i.scrollLeft
    });
  });
  const {
    typeSelectHandlers: S
  } = te({
    isDisabled: () => o(c.disallowTypeAhead),
    keyboardDelegate: () => o(c.keyboardDelegate),
    selectionManager: () => o(c.selectionManager)
  }), p = () => o(c.orientation) ?? "vertical", m = (i) => {
    H(i, S.onKeyDown), i.altKey && i.key === "Tab" && i.preventDefault();
    const u = t();
    if (!u?.contains(i.target))
      return;
    const l = o(c.selectionManager), y = o(c.selectOnFocus), d = (a) => {
      a != null && (l.setFocusedKey(a), i.shiftKey && l.selectionMode() === "multiple" ? l.extendSelection(a) : y && !V(i) && l.replaceSelection(a));
    }, r = o(c.keyboardDelegate), M = o(c.shouldFocusWrap), h = l.focusedKey();
    switch (i.key) {
      case (p() === "vertical" ? "ArrowDown" : "ArrowRight"): {
        if (r.getKeyBelow) {
          i.preventDefault();
          let a;
          h != null ? a = r.getKeyBelow(h) : a = r.getFirstKey?.(), a == null && M && (a = r.getFirstKey?.(h)), d(a);
        }
        break;
      }
      case (p() === "vertical" ? "ArrowUp" : "ArrowLeft"): {
        if (r.getKeyAbove) {
          i.preventDefault();
          let a;
          h != null ? a = r.getKeyAbove(h) : a = r.getLastKey?.(), a == null && M && (a = r.getLastKey?.(h)), d(a);
        }
        break;
      }
      case (p() === "vertical" ? "ArrowLeft" : "ArrowUp"): {
        if (r.getKeyLeftOf) {
          i.preventDefault();
          const a = w() === "rtl";
          let F;
          h != null ? F = r.getKeyLeftOf(h) : F = a ? r.getFirstKey?.() : r.getLastKey?.(), d(F);
        }
        break;
      }
      case (p() === "vertical" ? "ArrowRight" : "ArrowDown"): {
        if (r.getKeyRightOf) {
          i.preventDefault();
          const a = w() === "rtl";
          let F;
          h != null ? F = r.getKeyRightOf(h) : F = a ? r.getLastKey?.() : r.getFirstKey?.(), d(F);
        }
        break;
      }
      case "Home":
        if (r.getFirstKey) {
          i.preventDefault();
          const a = r.getFirstKey(h, I(i));
          a != null && (l.setFocusedKey(a), I(i) && i.shiftKey && l.selectionMode() === "multiple" ? l.extendSelection(a) : y && l.replaceSelection(a));
        }
        break;
      case "End":
        if (r.getLastKey) {
          i.preventDefault();
          const a = r.getLastKey(h, I(i));
          a != null && (l.setFocusedKey(a), I(i) && i.shiftKey && l.selectionMode() === "multiple" ? l.extendSelection(a) : y && l.replaceSelection(a));
        }
        break;
      case "PageDown":
        if (r.getKeyPageBelow && h != null) {
          i.preventDefault();
          const a = r.getKeyPageBelow(h);
          d(a);
        }
        break;
      case "PageUp":
        if (r.getKeyPageAbove && h != null) {
          i.preventDefault();
          const a = r.getKeyPageAbove(h);
          d(a);
        }
        break;
      case "a":
        I(i) && l.selectionMode() === "multiple" && o(c.disallowSelectAll) !== !0 && (i.preventDefault(), l.selectAll());
        break;
      case "Escape":
        i.defaultPrevented || (i.preventDefault(), o(c.disallowEmptySelection) || l.clearSelection());
        break;
      case "Tab":
        if (!o(c.allowsTabNavigation)) {
          if (i.shiftKey)
            u.focus();
          else {
            const a = _(u, {
              tabbable: !0
            });
            let F, P;
            do
              P = a.lastChild(), P && (F = P);
            while (P);
            F && !F.contains(document.activeElement) && E(F);
          }
          break;
        }
    }
  }, v = (i) => {
    const u = o(c.selectionManager), l = o(c.keyboardDelegate), y = o(c.selectOnFocus);
    if (u.isFocused()) {
      i.currentTarget.contains(i.target) || u.setFocused(!1);
      return;
    }
    if (i.currentTarget.contains(i.target)) {
      if (u.setFocused(!0), u.focusedKey() == null) {
        const d = (M) => {
          M != null && (u.setFocusedKey(M), y && u.replaceSelection(M));
        }, r = i.relatedTarget;
        r && i.currentTarget.compareDocumentPosition(r) & Node.DOCUMENT_POSITION_FOLLOWING ? d(u.lastSelectedKey() ?? l.getLastKey?.()) : d(u.firstSelectedKey() ?? l.getFirstKey?.());
      } else if (!o(c.isVirtualized)) {
        const d = f();
        if (d) {
          d.scrollTop = g.top, d.scrollLeft = g.left;
          const r = d.querySelector(`[data-key="${u.focusedKey()}"]`);
          r && (E(r), O(d, r));
        }
      }
    }
  }, D = (i) => {
    const u = o(c.selectionManager);
    i.currentTarget.contains(i.relatedTarget) || u.setFocused(!1);
  }, T = (i) => {
    f() === i.target && i.preventDefault();
  }, x = () => {
    const i = o(c.autoFocus);
    if (!i)
      return;
    const u = o(c.selectionManager), l = o(c.keyboardDelegate);
    let y;
    i === "first" && (y = l.getFirstKey?.()), i === "last" && (y = l.getLastKey?.());
    const d = u.selectedKeys();
    d.size && (y = d.values().next().value), u.setFocused(!0), u.setFocusedKey(y);
    const r = t();
    r && y == null && !o(c.shouldUseVirtualFocus) && E(r);
  };
  return Z(() => {
    c.deferAutoFocus ? setTimeout(x, 0) : x();
  }), L(C([f, () => o(c.isVirtualized), () => o(c.selectionManager).focusedKey()], (i) => {
    const [u, l, y] = i;
    if (l)
      y && c.scrollToKey?.(y);
    else if (y && u) {
      const d = u.querySelector(`[data-key="${y}"]`);
      d && O(u, d);
    }
  })), {
    tabIndex: A(() => {
      if (!o(c.shouldUseVirtualFocus))
        return o(c.selectionManager).focusedKey() == null ? 0 : -1;
    }),
    onKeyDown: m,
    onMouseDown: T,
    onFocusIn: v,
    onFocusOut: D
  };
}
function ye(e, t) {
  const s = () => o(e.selectionManager), n = () => o(e.key), c = () => o(e.shouldUseVirtualFocus), f = (l) => {
    s().selectionMode() !== "none" && (s().selectionMode() === "single" ? s().isSelected(n()) && !s().disallowEmptySelection() ? s().toggleSelection(n()) : s().replaceSelection(n()) : l?.shiftKey ? s().extendSelection(n()) : s().selectionBehavior() === "toggle" || I(l) || "pointerType" in l && l.pointerType === "touch" ? s().toggleSelection(n()) : s().replaceSelection(n()));
  }, w = () => s().isSelected(n()), g = () => o(e.disabled) || s().isDisabled(n()), S = () => !g() && s().canSelectItem(n());
  let p = null;
  const m = (l) => {
    S() && (p = l.pointerType, l.pointerType === "mouse" && l.button === 0 && !o(e.shouldSelectOnPressUp) && f(l));
  }, v = (l) => {
    S() && l.pointerType === "mouse" && l.button === 0 && o(e.shouldSelectOnPressUp) && o(e.allowsDifferentPressOrigin) && f(l);
  }, D = (l) => {
    S() && (o(e.shouldSelectOnPressUp) && !o(e.allowsDifferentPressOrigin) || p !== "mouse") && f(l);
  }, T = (l) => {
    !S() || !["Enter", " "].includes(l.key) || (V(l) ? s().toggleSelection(n()) : f(l));
  }, x = (l) => {
    g() && l.preventDefault();
  }, K = (l) => {
    const y = t();
    c() || g() || !y || l.target === y && s().setFocusedKey(n());
  }, i = A(() => {
    if (!(c() || g()))
      return n() === s().focusedKey() ? 0 : -1;
  }), u = A(() => o(e.virtualized) ? void 0 : n());
  return L(C([t, n, c, () => s().focusedKey(), () => s().isFocused()], ([l, y, d, r, M]) => {
    l && y === r && M && !d && document.activeElement !== l && (e.focus ? e.focus() : E(l));
  })), {
    isSelected: w,
    isDisabled: g,
    allowsSelection: S,
    tabIndex: i,
    dataKey: u,
    onPointerDown: m,
    onPointerUp: v,
    onClick: D,
    onKeyDown: T,
    onMouseDown: x,
    onFocus: K
  };
}
var ie = class {
  collection;
  state;
  constructor(e, t) {
    this.collection = e, this.state = t;
  }
  /** The type of selection that is allowed in the collection. */
  selectionMode() {
    return this.state.selectionMode();
  }
  /** Whether the collection allows empty selection. */
  disallowEmptySelection() {
    return this.state.disallowEmptySelection();
  }
  /** The selection behavior for the collection. */
  selectionBehavior() {
    return this.state.selectionBehavior();
  }
  /** Sets the selection behavior for the collection. */
  setSelectionBehavior(e) {
    this.state.setSelectionBehavior(e);
  }
  /** Whether the collection is currently focused. */
  isFocused() {
    return this.state.isFocused();
  }
  /** Sets whether the collection is focused. */
  setFocused(e) {
    this.state.setFocused(e);
  }
  /** The current focused key in the collection. */
  focusedKey() {
    return this.state.focusedKey();
  }
  /** Sets the focused key. */
  setFocusedKey(e) {
    (e == null || this.collection().getItem(e)) && this.state.setFocusedKey(e);
  }
  /** The currently selected keys in the collection. */
  selectedKeys() {
    return this.state.selectedKeys();
  }
  /** Returns whether a key is selected. */
  isSelected(e) {
    if (this.state.selectionMode() === "none")
      return !1;
    const t = this.getKey(e);
    return t == null ? !1 : this.state.selectedKeys().has(t);
  }
  /** Whether the selection is empty. */
  isEmpty() {
    return this.state.selectedKeys().size === 0;
  }
  /** Whether all items in the collection are selected. */
  isSelectAll() {
    if (this.isEmpty())
      return !1;
    const e = this.state.selectedKeys();
    return this.getAllSelectableKeys().every((t) => e.has(t));
  }
  firstSelectedKey() {
    let e;
    for (const t of this.state.selectedKeys()) {
      const s = this.collection().getItem(t), n = s?.index != null && e?.index != null && s.index < e.index;
      (!e || n) && (e = s);
    }
    return e?.key;
  }
  lastSelectedKey() {
    let e;
    for (const t of this.state.selectedKeys()) {
      const s = this.collection().getItem(t), n = s?.index != null && e?.index != null && s.index > e.index;
      (!e || n) && (e = s);
    }
    return e?.key;
  }
  /** Extends the selection to the given key. */
  extendSelection(e) {
    if (this.selectionMode() === "none")
      return;
    if (this.selectionMode() === "single") {
      this.replaceSelection(e);
      return;
    }
    const t = this.getKey(e);
    if (t == null)
      return;
    const s = this.state.selectedKeys(), n = s.anchorKey || t, c = new b(s, n, t);
    for (const f of this.getKeyRange(n, s.currentKey || t))
      c.delete(f);
    for (const f of this.getKeyRange(t, n))
      this.canSelectItem(f) && c.add(f);
    this.state.setSelectedKeys(c);
  }
  getKeyRange(e, t) {
    const s = this.collection().getItem(e), n = this.collection().getItem(t);
    return s && n ? s.index != null && n.index != null && s.index <= n.index ? this.getKeyRangeInternal(e, t) : this.getKeyRangeInternal(t, e) : [];
  }
  getKeyRangeInternal(e, t) {
    const s = [];
    let n = e;
    for (; n != null; ) {
      const c = this.collection().getItem(n);
      if (c && c.type === "item" && s.push(n), n === t)
        return s;
      n = this.collection().getKeyAfter(n);
    }
    return [];
  }
  getKey(e) {
    const t = this.collection().getItem(e);
    return t ? !t || t.type !== "item" ? null : t.key : e;
  }
  /** Toggles whether the given key is selected. */
  toggleSelection(e) {
    if (this.selectionMode() === "none")
      return;
    if (this.selectionMode() === "single" && !this.isSelected(e)) {
      this.replaceSelection(e);
      return;
    }
    const t = this.getKey(e);
    if (t == null)
      return;
    const s = new b(this.state.selectedKeys());
    s.has(t) ? s.delete(t) : this.canSelectItem(t) && (s.add(t), s.anchorKey = t, s.currentKey = t), !(this.disallowEmptySelection() && s.size === 0) && this.state.setSelectedKeys(s);
  }
  /** Replaces the selection with only the given key. */
  replaceSelection(e) {
    if (this.selectionMode() === "none")
      return;
    const t = this.getKey(e);
    if (t == null)
      return;
    const s = this.canSelectItem(t) ? new b([t], t, t) : new b();
    this.state.setSelectedKeys(s);
  }
  /** Replaces the selection with the given keys. */
  setSelectedKeys(e) {
    if (this.selectionMode() === "none")
      return;
    const t = new b();
    for (const s of e) {
      const n = this.getKey(s);
      if (n != null && (t.add(n), this.selectionMode() === "single"))
        break;
    }
    this.state.setSelectedKeys(t);
  }
  /** Selects all items in the collection. */
  selectAll() {
    this.selectionMode() === "multiple" && this.state.setSelectedKeys(new Set(this.getAllSelectableKeys()));
  }
  /**
   * Removes all keys from the selection.
   */
  clearSelection() {
    const e = this.state.selectedKeys();
    !this.disallowEmptySelection() && e.size > 0 && this.state.setSelectedKeys(new b());
  }
  /**
   * Toggles between select all and an empty selection.
   */
  toggleSelectAll() {
    this.isSelectAll() ? this.clearSelection() : this.selectAll();
  }
  select(e, t) {
    this.selectionMode() !== "none" && (this.selectionMode() === "single" ? this.isSelected(e) && !this.disallowEmptySelection() ? this.toggleSelection(e) : this.replaceSelection(e) : this.selectionBehavior() === "toggle" || t && t.pointerType === "touch" ? this.toggleSelection(e) : this.replaceSelection(e));
  }
  /** Returns whether the current selection is equal to the given selection. */
  isSelectionEqual(e) {
    if (e === this.state.selectedKeys())
      return !0;
    const t = this.selectedKeys();
    if (e.size !== t.size)
      return !1;
    for (const s of e)
      if (!t.has(s))
        return !1;
    for (const s of t)
      if (!e.has(s))
        return !1;
    return !0;
  }
  canSelectItem(e) {
    if (this.state.selectionMode() === "none")
      return !1;
    const t = this.collection().getItem(e);
    return t != null && !t.disabled;
  }
  isDisabled(e) {
    const t = this.collection().getItem(e);
    return !t || t.disabled;
  }
  getAllSelectableKeys() {
    const e = [];
    return ((s) => {
      for (; s != null; ) {
        if (this.canSelectItem(s)) {
          const n = this.collection().getItem(s);
          if (!n)
            continue;
          n.type === "item" && e.push(s);
        }
        s = this.collection().getKeyAfter(s);
      }
    })(this.collection().getFirstKey()), e;
  }
}, z = class {
  keyMap = /* @__PURE__ */ new Map();
  iterable;
  firstKey;
  lastKey;
  constructor(e) {
    this.iterable = e;
    for (const n of e)
      this.keyMap.set(n.key, n);
    if (this.keyMap.size === 0)
      return;
    let t, s = 0;
    for (const [n, c] of this.keyMap)
      t ? (t.nextKey = n, c.prevKey = t.key) : (this.firstKey = n, c.prevKey = void 0), c.type === "item" && (c.index = s++), t = c, t.nextKey = void 0;
    this.lastKey = t.key;
  }
  *[Symbol.iterator]() {
    yield* this.iterable;
  }
  getSize() {
    return this.keyMap.size;
  }
  getKeys() {
    return this.keyMap.keys();
  }
  getKeyBefore(e) {
    return this.keyMap.get(e)?.prevKey;
  }
  getKeyAfter(e) {
    return this.keyMap.get(e)?.nextKey;
  }
  getFirstKey() {
    return this.firstKey;
  }
  getLastKey() {
    return this.lastKey;
  }
  getItem(e) {
    return this.keyMap.get(e);
  }
  at(e) {
    const t = [...this.getKeys()];
    return this.getItem(t[e]);
  }
};
function ge(e) {
  const t = ee(e), n = U({
    dataSource: () => o(e.dataSource),
    getKey: () => o(e.getKey),
    getTextValue: () => o(e.getTextValue),
    getDisabled: () => o(e.getDisabled),
    getSectionChildren: () => o(e.getSectionChildren),
    factory: (f) => e.filter ? new z(e.filter(f)) : new z(f)
  }, [() => e.filter]), c = new ie(n, t);
  return J(() => {
    const f = t.focusedKey();
    f != null && !n().getItem(f) && t.setFocusedKey(void 0);
  }), {
    collection: n,
    selectionManager: () => c
  };
}
export {
  z as ListCollection,
  b as Selection,
  ie as SelectionManager,
  ge as createListState,
  ee as createMultipleSelectionState,
  de as createSelectableCollection,
  ye as createSelectableItem,
  te as createTypeSelect,
  Y as isSameSelection
};
//# sourceMappingURL=index185.js.map
