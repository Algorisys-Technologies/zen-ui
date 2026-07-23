import { createComponent as d, mergeProps as f } from "solid-js/web";
import { createSelectableList as L } from "./index185.js";
import { createListState as V, createSelectableItem as j } from "./index186.js";
import { useCollapsibleContext as x, CollapsibleTrigger as q, CollapsibleRoot as G, CollapsibleContent as N } from "./index187.js";
import { createDomCollection as z, createDomCollectionItem as B } from "./index188.js";
import { createRegisterId as h } from "./index159.js";
import { Polymorphic as D } from "./index161.js";
import { __export as J } from "./index162.js";
import { mergeDefaultProps as I, createGenerateId as P, composeEventHandlers as l, callHandler as v } from "./index163.js";
import { createUniqueId as A, splitProps as b, createSignal as w, createContext as M, createEffect as S, onCleanup as F, useContext as k } from "solid-js";
import { mergeRefs as K } from "./index166.js";
import { combineStyle as Q } from "./index167.js";
var X = {};
J(X, {
  Accordion: () => Y,
  Content: () => O,
  Header: () => R,
  Item: () => H,
  Root: () => _,
  Trigger: () => $,
  useAccordionContext: () => y
});
var E = M();
function T() {
  const o = k(E);
  if (o === void 0)
    throw new Error("[kobalte]: `useAccordionItemContext` must be used within a `Accordion.Item` component");
  return o;
}
function O(o) {
  const t = T(), u = t.generateId("content"), c = I({
    id: u
  }, o), [e, s] = b(c, ["id", "style"]);
  return S(() => F(t.registerContentId(e.id))), d(N, f({
    role: "region",
    get "aria-labelledby"() {
      return t.triggerId();
    },
    get style() {
      return Q({
        "--kb-accordion-content-height": "var(--kb-collapsible-content-height)",
        "--kb-accordion-content-width": "var(--kb-collapsible-content-width)"
      }, e.style);
    }
  }, s));
}
function R(o) {
  const t = x();
  return d(D, f({
    as: "h3"
  }, () => t.dataset(), o));
}
var U = M();
function y() {
  const o = k(U);
  if (o === void 0)
    throw new Error("[kobalte]: `useAccordionContext` must be used within a `Accordion.Root` component");
  return o;
}
function H(o) {
  const t = y(), u = `${t.generateId("item")}-${A()}`, c = I({
    id: u
  }, o), [e, s] = b(c, ["value", "disabled"]), [m, r] = w(), [p, n] = w(), g = () => t.listState().selectionManager(), i = () => g().isSelected(e.value), a = {
    value: () => e.value,
    triggerId: m,
    contentId: p,
    generateId: P(() => s.id),
    registerTriggerId: h(r),
    registerContentId: h(n)
  };
  return d(E.Provider, {
    value: a,
    get children() {
      return d(G, f({
        get open() {
          return i();
        },
        get disabled() {
          return e.disabled;
        }
      }, s));
    }
  });
}
function _(o) {
  let t;
  const u = `accordion-${A()}`, c = I({
    id: u,
    multiple: !1,
    collapsible: !1,
    shouldFocusWrap: !0
  }, o), [e, s] = b(c, [
    "id",
    "ref",
    "value",
    "defaultValue",
    "onChange",
    "multiple",
    "collapsible",
    "shouldFocusWrap",
    "onKeyDown",
    "onMouseDown",
    "onFocusIn",
    // TODO: remove next breaking
    "onFocusOut"
  ]), [m, r] = w([]), {
    DomCollectionProvider: p
  } = z({
    items: m,
    onItemsChange: r
  }), n = V({
    selectedKeys: () => e.value,
    defaultSelectedKeys: () => e.defaultValue,
    onSelectionChange: (a) => e.onChange?.(Array.from(a)),
    disallowEmptySelection: () => !e.multiple && !e.collapsible,
    selectionMode: () => e.multiple ? "multiple" : "single",
    dataSource: m
  });
  n.selectionManager().setFocusedKey("item-1");
  const g = L({
    selectionManager: () => n.selectionManager(),
    collection: () => n.collection(),
    disallowEmptySelection: () => n.selectionManager().disallowEmptySelection(),
    shouldFocusWrap: () => e.shouldFocusWrap,
    disallowTypeAhead: !0,
    allowsTabNavigation: !0
  }, () => t), i = {
    listState: () => n,
    generateId: P(() => e.id)
  };
  return d(p, {
    get children() {
      return d(U.Provider, {
        value: i,
        get children() {
          return d(D, f({
            as: "div",
            get id() {
              return e.id;
            },
            ref(a) {
              var C = K((W) => t = W, e.ref);
              typeof C == "function" && C(a);
            },
            get onKeyDown() {
              return l([e.onKeyDown, g.onKeyDown]);
            },
            get onMouseDown() {
              return l([e.onMouseDown, g.onMouseDown]);
            },
            get onFocusIn() {
              return l([
                e.onFocusIn
                // TODO: remove next breaking
              ]);
            },
            get onFocusOut() {
              return l([e.onFocusOut, g.onFocusOut]);
            }
          }, s));
        }
      });
    }
  });
}
function $(o) {
  let t;
  const u = y(), c = T(), e = x(), s = c.generateId("trigger"), m = I({
    id: s
  }, o), [r, p] = b(m, ["ref", "onPointerDown", "onPointerUp", "onClick", "onKeyDown", "onMouseDown", "onFocus"]);
  B({
    getItem: () => ({
      ref: () => t,
      type: "item",
      key: c.value(),
      textValue: "",
      // not applicable here
      disabled: e.disabled()
    })
  });
  const n = j({
    key: () => c.value(),
    selectionManager: () => u.listState().selectionManager(),
    disabled: () => e.disabled(),
    shouldSelectOnPressUp: !0
  }, () => t), g = (i) => {
    ["Enter", " "].includes(i.key) && i.preventDefault(), v(i, r.onKeyDown), v(i, n.onKeyDown);
  };
  return S(() => F(c.registerTriggerId(p.id))), d(q, f({
    ref(i) {
      var a = K((C) => t = C, r.ref);
      typeof a == "function" && a(i);
    },
    get "data-key"() {
      return n.dataKey();
    },
    get onPointerDown() {
      return l([r.onPointerDown, n.onPointerDown]);
    },
    get onPointerUp() {
      return l([r.onPointerUp, n.onPointerUp]);
    },
    get onClick() {
      return l([r.onClick, n.onClick]);
    },
    onKeyDown: g,
    get onMouseDown() {
      return l([r.onMouseDown, n.onMouseDown]);
    },
    get onFocus() {
      return l([r.onFocus, n.onFocus]);
    }
  }, p));
}
var Y = Object.assign(_, {
  Content: O,
  Header: R,
  Item: H,
  Trigger: $
});
export {
  Y as Accordion,
  O as AccordionContent,
  R as AccordionHeader,
  H as AccordionItem,
  _ as AccordionRoot,
  $ as AccordionTrigger,
  X as accordion_exports,
  y as useAccordionContext
};
//# sourceMappingURL=index127.js.map
