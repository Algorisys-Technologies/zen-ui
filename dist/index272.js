import { createContext as t, useContext as n } from "react";
const o = t(void 0);
function c() {
  const e = n(o);
  if (e === void 0)
    throw new Error("useDayPicker() must be used within a custom component.");
  return e;
}
export {
  o as dayPickerContext,
  c as useDayPicker
};
//# sourceMappingURL=index272.js.map
