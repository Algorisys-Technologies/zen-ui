import { createComponent as i, mergeProps as A } from "solid-js/web";
import { MenuTrigger as a, MenuSubTrigger as p, MenuSubContent as s, MenuSub as m, MenuRadioItem as c, MenuRadioGroup as I, MenuPortal as d, MenuItemLabel as l, MenuItemIndicator as M, MenuItemDescription as b, MenuItem as g, MenuIcon as C, MenuGroupLabel as f, MenuGroup as S, MenuCheckboxItem as R, MenuRoot as h, useMenuRootContext as L, useMenuContext as O, MenuContent as T } from "./index193.js";
import { SeparatorRoot as x } from "./index194.js";
import { PopperArrow as w } from "./index169.js";
import { __export as F } from "./index162.js";
import { mergeDefaultProps as _, focusWithoutScrolling as k } from "./index163.js";
import { createUniqueId as v, splitProps as j } from "solid-js";
var q = {};
F(q, {
  Arrow: () => w,
  CheckboxItem: () => R,
  Content: () => D,
  DropdownMenu: () => U,
  Group: () => S,
  GroupLabel: () => f,
  Icon: () => C,
  Item: () => g,
  ItemDescription: () => b,
  ItemIndicator: () => M,
  ItemLabel: () => l,
  Portal: () => d,
  RadioGroup: () => I,
  RadioItem: () => c,
  Root: () => G,
  Separator: () => x,
  Sub: () => m,
  SubContent: () => s,
  SubTrigger: () => p,
  Trigger: () => a
});
function D(e) {
  const t = L(), r = O(), [u, P] = j(e, ["onCloseAutoFocus", "onInteractOutside"]);
  let n = !1;
  return i(T, A({
    onCloseAutoFocus: (o) => {
      u.onCloseAutoFocus?.(o), n || k(r.triggerRef()), n = !1, o.preventDefault();
    },
    onInteractOutside: (o) => {
      u.onInteractOutside?.(o), (!t.isModal() || o.detail.isContextMenu) && (n = !0);
    }
  }, P));
}
function G(e) {
  const t = `dropdownmenu-${v()}`, r = _({
    id: t
  }, e);
  return i(h, r);
}
var U = Object.assign(G, {
  Arrow: w,
  CheckboxItem: R,
  Content: D,
  Group: S,
  GroupLabel: f,
  Icon: C,
  Item: g,
  ItemDescription: b,
  ItemIndicator: M,
  ItemLabel: l,
  Portal: d,
  RadioGroup: I,
  RadioItem: c,
  Separator: x,
  Sub: m,
  SubContent: s,
  SubTrigger: p,
  Trigger: a
});
export {
  U as DropdownMenu,
  D as DropdownMenuContent,
  G as DropdownMenuRoot,
  q as dropdown_menu_exports
};
//# sourceMappingURL=index133.js.map
