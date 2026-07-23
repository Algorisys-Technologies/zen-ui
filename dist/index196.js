import { createComponent as a, mergeProps as l, memo as h } from "solid-js/web";
import { createNumberFormatter as M } from "./index147.js";
import { createRegisterId as I } from "./index159.js";
import { Polymorphic as o } from "./index161.js";
import { createUniqueId as y, splitProps as s, createSignal as P, createMemo as C, createContext as w, createEffect as F, onCleanup as k, useContext as R } from "solid-js";
import { mergeDefaultProps as f, createGenerateId as E, clamp as S } from "./index163.js";
import { combineStyle as T } from "./index167.js";
var g = w();
function m() {
  const r = R(g);
  if (r === void 0)
    throw new Error("[kobalte]: `useMeterContext` must be used within a `Meter.Root` component");
  return r;
}
function W(r) {
  const t = m(), [n, e] = s(r, ["style"]);
  return a(o, l({
    as: "div",
    get style() {
      return T({
        "--kb-meter-fill-width": t.meterFillWidth()
      }, n.style);
    }
  }, () => t.dataset(), e));
}
function $(r) {
  const t = m(), n = f({
    id: t.generateId("label")
  }, r), [e, i] = s(n, ["id"]);
  return F(() => k(t.registerLabelId(e.id))), a(o, l({
    as: "span",
    get id() {
      return e.id;
    }
  }, () => t.dataset(), i));
}
function j(r) {
  const t = `meter-${y()}`, n = f({
    id: t,
    value: 0,
    minValue: 0,
    maxValue: 100,
    role: "meter",
    indeterminate: !1
  }, r), [e, i] = s(n, ["value", "minValue", "maxValue", "getValueLabel", "role", "aria-valuetext", "aria-labelledby", "aria-valuemax", "aria-valuemin", "aria-valuenow", "indeterminate"]), [d, x] = P(), p = M(() => ({
    style: "percent"
  })), u = () => S(e.value, e.minValue, e.maxValue), c = () => (u() - e.minValue) / (e.maxValue - e.minValue), v = () => {
    if (!e.indeterminate)
      return e.getValueLabel ? e.getValueLabel({
        value: u(),
        min: e.minValue,
        max: e.maxValue
      }) : p().format(c());
  }, V = () => `${c() * 100}%`, b = C(() => ({})), L = {
    dataset: b,
    value: u,
    valuePercent: c,
    valueLabel: v,
    labelId: d,
    meterFillWidth: V,
    generateId: E(() => i.id),
    registerLabelId: I(x)
  };
  return a(g.Provider, {
    value: L,
    get children() {
      return a(o, l({
        as: "div",
        get role() {
          return e.role || "meter";
        },
        get "aria-valuenow"() {
          return h(() => !!e.indeterminate)() ? void 0 : u();
        },
        get "aria-valuemin"() {
          return e.minValue;
        },
        get "aria-valuemax"() {
          return e.maxValue;
        },
        get "aria-valuetext"() {
          return v();
        },
        get "aria-labelledby"() {
          return d();
        }
      }, b, i));
    }
  });
}
function q(r) {
  const t = m();
  return a(o, l({
    as: "div"
  }, () => t.dataset(), r));
}
function D(r) {
  const t = m();
  return a(o, l({
    as: "div"
  }, () => t.dataset(), r, {
    get children() {
      return t.valueLabel();
    }
  }));
}
var H = Object.assign(j, {
  Fill: W,
  Label: $,
  Track: q,
  ValueLabel: D
});
export {
  H as Meter,
  W as MeterFill,
  $ as MeterLabel,
  j as MeterRoot,
  q as MeterTrack,
  D as MeterValueLabel,
  m as useMeterContext
};
//# sourceMappingURL=index196.js.map
