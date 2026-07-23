import { createControllableBooleanSignal as s } from "./index161.js";
import { access as l } from "./index166.js";
function f(e = {}) {
  const [o, n] = s({
    value: () => l(e.open),
    defaultValue: () => !!l(e.defaultOpen),
    onChange: (c) => e.onOpenChange?.(c)
  }), t = () => {
    n(!0);
  }, a = () => {
    n(!1);
  };
  return {
    isOpen: o,
    setIsOpen: n,
    open: t,
    close: a,
    toggle: () => {
      o() ? a() : t();
    }
  };
}
export {
  f as createDisclosureState
};
//# sourceMappingURL=index176.js.map
