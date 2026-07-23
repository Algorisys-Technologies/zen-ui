import { createComponent as b, mergeProps as p, memo as O } from "solid-js/web";
import { ComboboxPortal as c, ComboboxListbox as d, ComboboxInput as g, ComboboxIcon as f, ComboboxHiddenSelect as C, ComboboxControl as x, ComboboxContent as I, ComboboxBase as _, useComboboxContext as L } from "./index197.js";
import { ListboxSection as D, ListboxItemLabel as v, ListboxItemIndicator as y, ListboxItemDescription as P, ListboxItem as h } from "./index198.js";
import { PopperArrow as T } from "./index172.js";
import { ButtonRoot as k } from "./index177.js";
import { FormControlLabel as R } from "./index156.js";
import { FormControlErrorMessage as V } from "./index158.js";
import { FormControlDescription as w, useFormControlContext as E } from "./index159.js";
import { __export as j } from "./index163.js";
import { splitProps as A, createMemo as m } from "solid-js";
import { mergeDefaultProps as $, callHandler as u } from "./index164.js";
import { mergeRefs as q } from "./index167.js";
var z = {};
j(z, {
  Arrow: () => T,
  Combobox: () => G,
  Content: () => I,
  Control: () => x,
  Description: () => w,
  ErrorMessage: () => V,
  HiddenSelect: () => C,
  Icon: () => f,
  Input: () => g,
  Item: () => h,
  ItemDescription: () => P,
  ItemIndicator: () => y,
  ItemLabel: () => v,
  Label: () => R,
  Listbox: () => d,
  Portal: () => c,
  Root: () => S,
  Section: () => D,
  Trigger: () => M,
  useComboboxContext: () => L
});
function S(l) {
  const [o, e] = A(l, ["value", "defaultValue", "onChange", "multiple"]), i = m(() => o.value != null ? o.multiple ? o.value : [o.value] : o.value), r = m(() => o.defaultValue != null ? o.multiple ? o.defaultValue : [o.defaultValue] : o.defaultValue);
  return b(_, p({
    get value() {
      return i();
    },
    get defaultValue() {
      return r();
    },
    onChange: (n) => {
      o.multiple ? o.onChange?.(n ?? []) : o.onChange?.(n[0] ?? null);
    },
    get selectionMode() {
      return o.multiple ? "multiple" : "single";
    }
  }, e));
}
function M(l) {
  const o = E(), e = L(), i = $({
    id: e.generateId("trigger")
  }, l), [r, a] = A(i, ["ref", "disabled", "onPointerDown", "onClick", "aria-labelledby"]), n = () => r.disabled || e.isDisabled() || o.isDisabled() || o.isReadOnly(), B = (t) => {
    u(t, r.onPointerDown), t.currentTarget.dataset.pointerType = t.pointerType, !n() && t.pointerType !== "touch" && t.button === 0 && (t.preventDefault(), e.toggle(!1, "manual"));
  }, F = (t) => {
    u(t, r.onClick), n() || (t.currentTarget.dataset.pointerType === "touch" && e.toggle(!1, "manual"), e.inputRef()?.focus());
  }, H = () => o.getAriaLabelledBy(a.id, e.triggerAriaLabel(), r["aria-labelledby"]);
  return b(k, p({
    ref(t) {
      var s = q(e.setTriggerRef, r.ref);
      typeof s == "function" && s(t);
    },
    get disabled() {
      return n();
    },
    tabIndex: -1,
    "aria-haspopup": "listbox",
    get "aria-expanded"() {
      return e.isOpen();
    },
    get "aria-controls"() {
      return O(() => !!e.isOpen())() ? e.listboxId() : void 0;
    },
    get "aria-label"() {
      return e.triggerAriaLabel();
    },
    get "aria-labelledby"() {
      return H();
    },
    onPointerDown: B,
    onClick: F
  }, () => e.dataset(), a));
}
var G = Object.assign(S, {
  Arrow: T,
  Content: I,
  Control: x,
  Description: w,
  ErrorMessage: V,
  HiddenSelect: C,
  Icon: f,
  Input: g,
  Item: h,
  ItemDescription: P,
  ItemIndicator: y,
  ItemLabel: v,
  Label: R,
  Listbox: d,
  Portal: c,
  Section: D,
  Trigger: M
});
export {
  G as Combobox,
  S as ComboboxRoot,
  M as ComboboxTrigger,
  z as combobox_exports
};
//# sourceMappingURL=index145.js.map
