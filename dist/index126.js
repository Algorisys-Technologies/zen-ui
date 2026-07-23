import { createComponent as h, mergeProps as K, memo as P } from "solid-js/web";
import { TabsKeyboardDelegate as V } from "./index191.js";
import { createSelectableItem as q, createSelectableCollection as H, createListState as j } from "./index186.js";
import { createDomCollection as A, createDomCollectionItem as N } from "./index188.js";
import { useLocale as $ } from "./index147.js";
import { createControllableSignal as X } from "./index160.js";
import { Polymorphic as M } from "./index161.js";
import { __export as Y } from "./index162.js";
import { mergeDefaultProps as L, composeEventHandlers as p, isWebKit as B, focusWithoutScrolling as G, getFocusableTreeWalker as J } from "./index163.js";
import { createUniqueId as Q, splitProps as w, createSignal as S, createEffect as I, on as T, createContext as Z, onMount as ee, onCleanup as te, Show as oe, createMemo as F, mergeProps as ne, useContext as re } from "solid-js";
import ae from "./index164.js";
import { createResizeObserver as ie } from "./index192.js";
import { mergeRefs as x } from "./index166.js";
import { access as k } from "./index165.js";
import { combineStyle as se } from "./index167.js";
var le = {};
Y(le, {
  Content: () => _,
  Indicator: () => E,
  List: () => W,
  Root: () => z,
  Tabs: () => ue,
  Trigger: () => R,
  useTabsContext: () => D
});
var O = Z();
function D() {
  const l = re(O);
  if (l === void 0)
    throw new Error("[kobalte]: `useTabsContext` must be used within a `Tabs` component");
  return l;
}
function _(l) {
  const [o, n] = S(), r = D(), [e, m] = w(l, ["ref", "id", "value", "forceMount"]), [f, u] = S(0), s = () => e.id ?? r.generateContentId(e.value), i = () => r.listState().selectedKey() === e.value, {
    present: t
  } = ae({
    show: () => e.forceMount || i(),
    element: () => o() ?? null
  });
  return I(T([() => o(), () => t()], ([d, a]) => {
    if (d == null || !a)
      return;
    const c = () => {
      const b = J(d, {
        tabbable: !0
      });
      u(b.nextNode() ? void 0 : 0);
    };
    c();
    const v = new MutationObserver(c);
    v.observe(d, {
      subtree: !0,
      childList: !0,
      attributes: !0,
      attributeFilter: ["tabindex", "disabled"]
    }), te(() => {
      v.disconnect();
    });
  })), I(T([() => e.value, s], ([d, a]) => {
    r.contentIdsMap().set(d, a);
  })), h(oe, {
    get when() {
      return t();
    },
    get children() {
      return h(M, K({
        as: "div",
        ref(d) {
          var a = x(n, e.ref);
          typeof a == "function" && a(d);
        },
        get id() {
          return s();
        },
        role: "tabpanel",
        get tabIndex() {
          return f();
        },
        get "aria-labelledby"() {
          return r.triggerIdsMap().get(e.value);
        },
        get "data-orientation"() {
          return r.orientation();
        },
        get "data-selected"() {
          return i() ? "" : void 0;
        }
      }, m));
    }
  });
}
function E(l) {
  const o = D(), [n, r] = w(l, ["style"]), [e, m] = S({
    width: void 0,
    height: void 0
  }), {
    direction: f
  } = $(), u = () => {
    const a = o.selectedTab();
    if (a == null)
      return;
    const c = {
      transform: void 0,
      width: void 0,
      height: void 0
    }, v = f() === "rtl" ? -1 * (a.offsetParent?.offsetWidth - a.offsetWidth - a.offsetLeft) : a.offsetLeft;
    c.transform = o.orientation() === "vertical" ? `translateY(${a.offsetTop}px)` : `translateX(${v}px)`, o.orientation() === "horizontal" ? c.width = `${a.offsetWidth}px` : c.height = `${a.offsetHeight}px`, m(c);
  };
  ee(() => {
    queueMicrotask(() => {
      u();
    });
  }), I(T([o.selectedTab, o.orientation, f], () => {
    u();
  }, {
    defer: !0
  }));
  const [s, i] = S(!1);
  let t = null, d = null;
  return ie(o.selectedTab, (a, c) => {
    if (d !== c) {
      d = c;
      return;
    }
    i(!0), t && clearTimeout(t), t = setTimeout(() => {
      t = null, i(!1);
    }, 1), u();
  }), h(M, K({
    as: "div",
    role: "presentation",
    get style() {
      return se(e(), n.style);
    },
    get "data-orientation"() {
      return o.orientation();
    },
    get "data-resizing"() {
      return s();
    }
  }, r));
}
function W(l) {
  let o;
  const n = D(), [r, e] = w(l, ["ref", "onKeyDown", "onMouseDown", "onFocusIn", "onFocusOut"]), {
    direction: m
  } = $(), f = new V(() => n.listState().collection(), m, n.orientation), u = H({
    selectionManager: () => n.listState().selectionManager(),
    keyboardDelegate: () => f,
    selectOnFocus: () => n.activationMode() === "automatic",
    shouldFocusWrap: !1,
    // handled by the keyboard delegate
    disallowEmptySelection: !0
  }, () => o);
  return I(() => {
    if (o == null)
      return;
    const s = o.querySelector(`[data-key="${n.listState().selectedKey()}"]`);
    s != null && n.setSelectedTab(s);
  }), h(M, K({
    as: "div",
    ref(s) {
      var i = x((t) => o = t, r.ref);
      typeof i == "function" && i(s);
    },
    role: "tablist",
    get "aria-orientation"() {
      return n.orientation();
    },
    get "data-orientation"() {
      return n.orientation();
    },
    get onKeyDown() {
      return p([r.onKeyDown, u.onKeyDown]);
    },
    get onMouseDown() {
      return p([r.onMouseDown, u.onMouseDown]);
    },
    get onFocusIn() {
      return p([r.onFocusIn, u.onFocusIn]);
    },
    get onFocusOut() {
      return p([r.onFocusOut, u.onFocusOut]);
    }
  }, e));
}
function ce(l) {
  const [o, n] = X({
    value: () => k(l.selectedKey),
    defaultValue: () => k(l.defaultSelectedKey),
    onChange: (i) => l.onSelectionChange?.(i)
  }), r = F(() => {
    const i = o();
    return i != null ? [i] : [];
  }), [, e] = w(l, ["onSelectionChange"]), m = ne(e, {
    selectionMode: "single",
    disallowEmptySelection: !0,
    allowDuplicateSelectionEvents: !0,
    selectedKeys: r,
    onSelectionChange: (i) => {
      const t = i.values().next().value;
      t === o() && l.onSelectionChange?.(t), n(t);
    }
  }), {
    collection: f,
    selectionManager: u
  } = j(m), s = F(() => {
    const i = o();
    return i != null ? f().getItem(i) : void 0;
  });
  return {
    collection: f,
    selectionManager: u,
    selectedKey: o,
    setSelectedKey: n,
    selectedItem: s
  };
}
function z(l) {
  const o = `tabs-${Q()}`, n = L({
    id: o,
    orientation: "horizontal",
    activationMode: "automatic"
  }, l), [r, e] = w(n, ["value", "defaultValue", "onChange", "orientation", "activationMode", "disabled"]), [m, f] = S([]), [u, s] = S(), {
    DomCollectionProvider: i
  } = A({
    items: m,
    onItemsChange: f
  }), t = ce({
    selectedKey: () => r.value,
    defaultSelectedKey: () => r.defaultValue,
    onSelectionChange: (b) => r.onChange?.(String(b)),
    dataSource: m
  });
  let d = t.selectedKey();
  I(T([() => t.selectionManager(), () => t.collection(), () => t.selectedKey()], ([b, y, U]) => {
    let g = U;
    if (b.isEmpty() || g == null || !y.getItem(g)) {
      g = y.getFirstKey();
      let C = g != null ? y.getItem(g) : void 0;
      for (; C?.disabled && C.key !== y.getLastKey(); )
        g = y.getKeyAfter(C.key), C = g != null ? y.getItem(g) : void 0;
      C?.disabled && g === y.getLastKey() && (g = y.getFirstKey()), g != null && b.setSelectedKeys([g]);
    }
    (b.focusedKey() == null || !b.isFocused() && g !== d) && b.setFocusedKey(g), d = g;
  }));
  const a = /* @__PURE__ */ new Map(), c = /* @__PURE__ */ new Map(), v = {
    isDisabled: () => r.disabled ?? !1,
    orientation: () => r.orientation,
    activationMode: () => r.activationMode,
    triggerIdsMap: () => a,
    contentIdsMap: () => c,
    listState: () => t,
    selectedTab: u,
    setSelectedTab: s,
    generateTriggerId: (b) => `${e.id}-trigger-${b}`,
    generateContentId: (b) => `${e.id}-content-${b}`
  };
  return h(i, {
    get children() {
      return h(O.Provider, {
        value: v,
        get children() {
          return h(M, K({
            as: "div",
            get "data-orientation"() {
              return v.orientation();
            }
          }, e));
        }
      });
    }
  });
}
function R(l) {
  let o;
  const n = D(), r = L({
    type: "button"
  }, l), [e, m] = w(r, ["ref", "id", "value", "disabled", "onPointerDown", "onPointerUp", "onClick", "onKeyDown", "onMouseDown", "onFocus"]), f = () => e.id ?? n.generateTriggerId(e.value), u = () => n.listState().selectionManager().focusedKey() === e.value, s = () => e.disabled || n.isDisabled(), i = () => n.contentIdsMap().get(e.value);
  N({
    getItem: () => ({
      ref: () => o,
      type: "item",
      key: e.value,
      textValue: "",
      // not applicable here
      disabled: s()
    })
  });
  const t = q({
    key: () => e.value,
    selectionManager: () => n.listState().selectionManager(),
    disabled: s
  }, () => o), d = (a) => {
    B() && G(a.currentTarget);
  };
  return I(T([() => e.value, f], ([a, c]) => {
    n.triggerIdsMap().set(a, c);
  })), h(M, K({
    as: "button",
    ref(a) {
      var c = x((v) => o = v, e.ref);
      typeof c == "function" && c(a);
    },
    get id() {
      return f();
    },
    role: "tab",
    get tabIndex() {
      return P(() => !s())() ? t.tabIndex() : void 0;
    },
    get disabled() {
      return s();
    },
    get "aria-selected"() {
      return t.isSelected();
    },
    get "aria-disabled"() {
      return s() || void 0;
    },
    get "aria-controls"() {
      return P(() => !!t.isSelected())() ? i() : void 0;
    },
    get "data-key"() {
      return t.dataKey();
    },
    get "data-orientation"() {
      return n.orientation();
    },
    get "data-selected"() {
      return t.isSelected() ? "" : void 0;
    },
    get "data-highlighted"() {
      return u() ? "" : void 0;
    },
    get "data-disabled"() {
      return s() ? "" : void 0;
    },
    get onPointerDown() {
      return p([e.onPointerDown, t.onPointerDown]);
    },
    get onPointerUp() {
      return p([e.onPointerUp, t.onPointerUp]);
    },
    get onClick() {
      return p([e.onClick, t.onClick, d]);
    },
    get onKeyDown() {
      return p([e.onKeyDown, t.onKeyDown]);
    },
    get onMouseDown() {
      return p([e.onMouseDown, t.onMouseDown]);
    },
    get onFocus() {
      return p([e.onFocus, t.onFocus]);
    }
  }, m));
}
var ue = Object.assign(z, {
  Content: _,
  Indicator: E,
  List: W,
  Trigger: R
});
export {
  ue as Tabs,
  _ as TabsContent,
  E as TabsIndicator,
  W as TabsList,
  z as TabsRoot,
  R as TabsTrigger,
  ce as createSingleSelectListState,
  le as tabs_exports,
  D as useTabsContext
};
//# sourceMappingURL=index126.js.map
