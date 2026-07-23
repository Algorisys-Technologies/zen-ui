import { createComponent as D, mergeProps as p } from "solid-js/web";
import { DialogContent as s, DialogTrigger as o, DialogTitle as t, DialogRoot as r, DialogPortal as e, DialogOverlay as l, DialogDescription as i, DialogCloseButton as a } from "./index131.js";
import { __export as m } from "./index163.js";
var C = {};
m(C, {
  AlertDialog: () => c,
  CloseButton: () => a,
  Content: () => g,
  Description: () => i,
  Overlay: () => l,
  Portal: () => e,
  Root: () => r,
  Title: () => t,
  Trigger: () => o
});
function g(n) {
  return D(s, p({
    role: "alertdialog"
  }, n));
}
var c = Object.assign(r, {
  CloseButton: a,
  Content: g,
  Description: i,
  Overlay: l,
  Portal: e,
  Title: t,
  Trigger: o
});
export {
  c as AlertDialog,
  g as AlertDialogContent,
  C as alert_dialog_exports
};
//# sourceMappingURL=index132.js.map
