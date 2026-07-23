import { createControllableBooleanSignal as n } from "./index160.js";
import { access as t } from "./index165.js";
function g(e = {}) {
  const [a, c] = n({
    value: () => t(e.isSelected),
    defaultValue: () => !!t(e.defaultIsSelected),
    onChange: (l) => e.onSelectedChange?.(l)
  });
  return {
    isSelected: a,
    setIsSelected: (l) => {
      !t(e.isReadOnly) && !t(e.isDisabled) && c(l);
    },
    toggle: () => {
      !t(e.isReadOnly) && !t(e.isDisabled) && c(!a());
    }
  };
}
export {
  g as createToggleState
};
//# sourceMappingURL=index195.js.map
