import { createComponent as s, mergeProps as b } from "solid-js/web";
import { getItemCount as oe } from "./index200.js";
import { createSelectableList as ne } from "./index185.js";
import { createSelectableItem as re, createListState as ie } from "./index186.js";
import { createRegisterId as P } from "./index159.js";
import { Polymorphic as h } from "./index161.js";
import { __export as se } from "./index162.js";
import { mergeDefaultProps as f, isMac as le, isWebKit as ae, createGenerateId as C, composeEventHandlers as a, callHandler as ce, focusWithoutScrolling as ue } from "./index163.js";
import { createEffect as O, onCleanup as U, splitProps as y, Show as V, createUniqueId as k, createSignal as L, createMemo as w, createContext as K, Switch as de, Match as M, useContext as T } from "solid-js";
import { mergeRefs as E } from "./index166.js";
import { access as l } from "./index165.js";
import { Key as ge } from "./index202.js";
var pe = {};
se(pe, {
  Item: () => R,
  ItemDescription: () => W,
  ItemIndicator: () => _,
  ItemLabel: () => $,
  Listbox: () => me,
  Root: () => N,
  Section: () => A,
  useListboxContext: () => H
});
var z = K();
function H() {
  const o = T(z);
  if (o === void 0)
    throw new Error("[kobalte]: `useListboxContext` must be used within a `Listbox` component");
  return o;
}
var B = K();
function S() {
  const o = T(B);
  if (o === void 0)
    throw new Error("[kobalte]: `useListboxItemContext` must be used within a `Listbox.Item` component");
  return o;
}
function R(o) {
  let n;
  const t = H(), u = `${t.generateId("item")}-${k()}`, e = f({
    id: u
  }, o), [r, c] = y(e, ["ref", "item", "aria-label", "aria-labelledby", "aria-describedby", "onPointerMove", "onPointerDown", "onPointerUp", "onClick", "onKeyDown", "onMouseDown", "onFocus"]), [p, v] = L(), [d, I] = L(), m = () => t.listState().selectionManager(), G = () => m().focusedKey() === r.item.key, i = re({
    key: () => r.item.key,
    selectionManager: m,
    shouldSelectOnPressUp: t.shouldSelectOnPressUp,
    allowsDifferentPressOrigin: () => t.shouldSelectOnPressUp() && t.shouldFocusOnHover(),
    shouldUseVirtualFocus: t.shouldUseVirtualFocus,
    disabled: () => r.item.disabled
  }, () => n), j = () => {
    if (m().selectionMode() !== "none")
      return i.isSelected();
  }, x = w(() => !(le() && ae())), q = () => x() ? r["aria-label"] : void 0, J = () => x() ? p() : void 0, Q = () => x() ? d() : void 0, X = () => {
    if (!t.isVirtualized())
      return;
    const g = t.listState().collection().getItem(r.item.key)?.index;
    return g != null ? g + 1 : void 0;
  }, Y = () => {
    if (t.isVirtualized())
      return oe(t.listState().collection());
  }, Z = (g) => {
    ce(g, r.onPointerMove), g.pointerType === "mouse" && !i.isDisabled() && t.shouldFocusOnHover() && (ue(g.currentTarget), m().setFocused(!0), m().setFocusedKey(r.item.key));
  }, D = w(() => ({
    "data-disabled": i.isDisabled() ? "" : void 0,
    "data-selected": i.isSelected() ? "" : void 0,
    "data-highlighted": G() ? "" : void 0
  })), ee = {
    isSelected: i.isSelected,
    dataset: D,
    generateId: C(() => c.id),
    registerLabelId: P(v),
    registerDescriptionId: P(I)
  };
  return s(B.Provider, {
    value: ee,
    get children() {
      return s(h, b({
        as: "li",
        ref(g) {
          var F = E((te) => n = te, r.ref);
          typeof F == "function" && F(g);
        },
        role: "option",
        get tabIndex() {
          return i.tabIndex();
        },
        get "aria-disabled"() {
          return i.isDisabled();
        },
        get "aria-selected"() {
          return j();
        },
        get "aria-label"() {
          return q();
        },
        get "aria-labelledby"() {
          return J();
        },
        get "aria-describedby"() {
          return Q();
        },
        get "aria-posinset"() {
          return X();
        },
        get "aria-setsize"() {
          return Y();
        },
        get "data-key"() {
          return i.dataKey();
        },
        get onPointerDown() {
          return a([r.onPointerDown, i.onPointerDown]);
        },
        get onPointerUp() {
          return a([r.onPointerUp, i.onPointerUp]);
        },
        get onClick() {
          return a([r.onClick, i.onClick]);
        },
        get onKeyDown() {
          return a([r.onKeyDown, i.onKeyDown]);
        },
        get onMouseDown() {
          return a([r.onMouseDown, i.onMouseDown]);
        },
        get onFocus() {
          return a([r.onFocus, i.onFocus]);
        },
        onPointerMove: Z
      }, D, c));
    }
  });
}
function W(o) {
  const n = S(), t = f({
    id: n.generateId("description")
  }, o);
  return O(() => U(n.registerDescriptionId(t.id))), s(h, b({
    as: "div"
  }, () => n.dataset(), t));
}
function _(o) {
  const n = S(), t = f({
    id: n.generateId("indicator")
  }, o), [u, e] = y(t, ["forceMount"]);
  return s(V, {
    get when() {
      return u.forceMount || n.isSelected();
    },
    get children() {
      return s(h, b({
        as: "div",
        "aria-hidden": "true"
      }, () => n.dataset(), e));
    }
  });
}
function $(o) {
  const n = S(), t = f({
    id: n.generateId("label")
  }, o);
  return O(() => U(n.registerLabelId(t.id))), s(h, b({
    as: "div"
  }, () => n.dataset(), t));
}
function N(o) {
  let n;
  const t = `listbox-${k()}`, u = f({
    id: t,
    selectionMode: "single",
    virtualized: !1
  }, o), [e, r] = y(u, ["ref", "children", "renderItem", "renderSection", "value", "defaultValue", "onChange", "options", "optionValue", "optionTextValue", "optionDisabled", "optionGroupChildren", "state", "keyboardDelegate", "autoFocus", "selectionMode", "shouldFocusWrap", "shouldUseVirtualFocus", "shouldSelectOnPressUp", "shouldFocusOnHover", "allowDuplicateSelectionEvents", "disallowEmptySelection", "selectionBehavior", "selectOnFocus", "disallowTypeAhead", "allowsTabNavigation", "virtualized", "scrollToItem", "scrollRef", "onKeyDown", "onMouseDown", "onFocusIn", "onFocusOut"]), c = w(() => e.state ? e.state : ie({
    selectedKeys: () => e.value,
    defaultSelectedKeys: () => e.defaultValue,
    onSelectionChange: e.onChange,
    allowDuplicateSelectionEvents: () => l(e.allowDuplicateSelectionEvents),
    disallowEmptySelection: () => l(e.disallowEmptySelection),
    selectionBehavior: () => l(e.selectionBehavior),
    selectionMode: () => l(e.selectionMode),
    dataSource: () => e.options ?? [],
    getKey: () => e.optionValue,
    getTextValue: () => e.optionTextValue,
    getDisabled: () => e.optionDisabled,
    getSectionChildren: () => e.optionGroupChildren
  })), p = ne({
    selectionManager: () => c().selectionManager(),
    collection: () => c().collection(),
    autoFocus: () => l(e.autoFocus),
    shouldFocusWrap: () => l(e.shouldFocusWrap),
    keyboardDelegate: () => e.keyboardDelegate,
    disallowEmptySelection: () => l(e.disallowEmptySelection),
    selectOnFocus: () => l(e.selectOnFocus),
    disallowTypeAhead: () => l(e.disallowTypeAhead),
    shouldUseVirtualFocus: () => l(e.shouldUseVirtualFocus),
    allowsTabNavigation: () => l(e.allowsTabNavigation),
    isVirtualized: () => e.virtualized,
    scrollToKey: () => e.scrollToItem
  }, () => n, () => e.scrollRef?.()), v = {
    listState: c,
    generateId: C(() => r.id),
    shouldUseVirtualFocus: () => u.shouldUseVirtualFocus,
    shouldSelectOnPressUp: () => u.shouldSelectOnPressUp,
    shouldFocusOnHover: () => u.shouldFocusOnHover,
    isVirtualized: () => e.virtualized
  };
  return s(z.Provider, {
    value: v,
    get children() {
      return s(h, b({
        as: "ul",
        ref(d) {
          var I = E((m) => n = m, e.ref);
          typeof I == "function" && I(d);
        },
        role: "listbox",
        get tabIndex() {
          return p.tabIndex();
        },
        get "aria-multiselectable"() {
          return c().selectionManager().selectionMode() === "multiple" ? !0 : void 0;
        },
        get onKeyDown() {
          return a([e.onKeyDown, p.onKeyDown]);
        },
        get onMouseDown() {
          return a([e.onMouseDown, p.onMouseDown]);
        },
        get onFocusIn() {
          return a([e.onFocusIn, p.onFocusIn]);
        },
        get onFocusOut() {
          return a([e.onFocusOut, p.onFocusOut]);
        }
      }, r, {
        get children() {
          return s(V, {
            get when() {
              return !e.virtualized;
            },
            get fallback() {
              return e.children?.(c().collection);
            },
            get children() {
              return s(ge, {
                get each() {
                  return [...c().collection()];
                },
                by: "key",
                children: (d) => s(de, {
                  get children() {
                    return [s(M, {
                      get when() {
                        return d().type === "section";
                      },
                      get children() {
                        return e.renderSection?.(d());
                      }
                    }), s(M, {
                      get when() {
                        return d().type === "item";
                      },
                      get children() {
                        return e.renderItem?.(d());
                      }
                    })];
                  }
                })
              });
            }
          });
        }
      }));
    }
  });
}
function A(o) {
  return s(h, b({
    as: "li",
    role: "presentation"
  }, o));
}
var me = Object.assign(N, {
  Item: R,
  ItemDescription: W,
  ItemIndicator: _,
  ItemLabel: $,
  Section: A
});
export {
  me as Listbox,
  R as ListboxItem,
  W as ListboxItemDescription,
  _ as ListboxItemIndicator,
  $ as ListboxItemLabel,
  N as ListboxRoot,
  A as ListboxSection,
  pe as listbox_exports,
  H as useListboxContext
};
//# sourceMappingURL=index198.js.map
