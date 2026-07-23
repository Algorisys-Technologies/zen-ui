import { createComponent as y, mergeProps as O } from "solid-js/web";
import { createRegisterId as i } from "./index159.js";
import { Polymorphic as P } from "./index161.js";
import { mergeDefaultProps as m, createGenerateId as D } from "./index163.js";
import { createContext as S, createEffect as q, onCleanup as M, createUniqueId as R, createSignal as n, createMemo as E, useContext as h } from "solid-js";
import { access as t } from "./index165.js";
var T = ["id", "name", "validationState", "required", "disabled", "readOnly"];
function U(r) {
  const o = `form-control-${R()}`, e = m({
    id: o
  }, r), [a, u] = n(), [v, p] = n(), [s, f] = n(), [l, C] = n(), g = (d, x, c) => {
    const F = c != null || a() != null;
    return [
      c,
      a(),
      // If there is both an aria-label and aria-labelledby, add the field itself has an aria-labelledby
      F && x != null ? d : void 0
    ].filter(Boolean).join(" ") || void 0;
  }, I = (d) => [
    s(),
    // Use aria-describedby for error message because aria-errormessage is unsupported using VoiceOver or NVDA.
    // See https://github.com/adobe/react-spectrum/issues/1346#issuecomment-740136268
    l(),
    d
  ].filter(Boolean).join(" ") || void 0, b = E(() => ({
    "data-valid": t(e.validationState) === "valid" ? "" : void 0,
    "data-invalid": t(e.validationState) === "invalid" ? "" : void 0,
    "data-required": t(e.required) ? "" : void 0,
    "data-disabled": t(e.disabled) ? "" : void 0,
    "data-readonly": t(e.readOnly) ? "" : void 0
  }));
  return {
    formControlContext: {
      name: () => t(e.name) ?? t(e.id),
      dataset: b,
      validationState: () => t(e.validationState),
      isRequired: () => t(e.required),
      isDisabled: () => t(e.disabled),
      isReadOnly: () => t(e.readOnly),
      labelId: a,
      fieldId: v,
      descriptionId: s,
      errorMessageId: l,
      getAriaLabelledBy: g,
      getAriaDescribedBy: I,
      generateId: D(() => t(e.id)),
      registerLabel: i(u),
      registerField: i(p),
      registerDescription: i(f),
      registerErrorMessage: i(C)
    }
  };
}
var B = S();
function L() {
  const r = h(B);
  if (r === void 0)
    throw new Error("[kobalte]: `useFormControlContext` must be used within a `FormControlContext.Provider` component");
  return r;
}
function $(r) {
  const o = L(), e = m({
    id: o.generateId("description")
  }, r);
  return q(() => M(o.registerDescription(e.id))), y(P, O({
    as: "div"
  }, () => o.dataset(), e));
}
export {
  T as FORM_CONTROL_PROP_NAMES,
  B as FormControlContext,
  $ as FormControlDescription,
  U as createFormControl,
  L as useFormControlContext
};
//# sourceMappingURL=index158.js.map
