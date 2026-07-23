import { createComponent as a, mergeProps as n } from "solid-js/web";
import { Meter as s } from "./index196.js";
import { createNumberFormatter as y } from "./index147.js";
import { createRegisterId as w } from "./index159.js";
import { __export as R } from "./index162.js";
import { createUniqueId as T, splitProps as m, createSignal as _, createMemo as E, createContext as M, createEffect as S, onCleanup as W, useContext as $ } from "solid-js";
import { mergeDefaultProps as p, createGenerateId as j, clamp as q } from "./index163.js";
import { combineStyle as D } from "./index167.js";
var G = {};
R(G, {
  Fill: () => b,
  Label: () => x,
  Progress: () => N,
  Root: () => P,
  Track: () => V,
  ValueLabel: () => v,
  useProgressContext: () => l
});
var f = M();
function l() {
  const t = $(f);
  if (t === void 0)
    throw new Error("[kobalte]: `useProgressContext` must be used within a `Progress.Root` component");
  return t;
}
function b(t) {
  const r = l(), [o, e] = m(t, ["style"]);
  return a(s.Fill, n({
    get style() {
      return D({
        "--kb-progress-fill-width": r.progressFillWidth()
      }, o.style);
    }
  }, () => r.dataset(), e));
}
function x(t) {
  const r = l(), o = p({
    id: r.generateId("label")
  }, t), [e, u] = m(o, ["id"]);
  return S(() => W(r.registerLabelId(e.id))), a(s.Label, n({
    get id() {
      return e.id;
    }
  }, () => r.dataset(), u));
}
function P(t) {
  const r = `progress-${T()}`, o = p({
    id: r,
    value: 0,
    minValue: 0,
    maxValue: 100
  }, t), [e, u] = m(o, ["value", "minValue", "maxValue", "indeterminate", "getValueLabel"]), [L, I] = _(), h = y(() => ({
    style: "percent"
  })), c = () => q(e.value, e.minValue, e.maxValue), i = () => (c() - e.minValue) / (e.maxValue - e.minValue), C = () => {
    if (!e.indeterminate)
      return e.getValueLabel ? e.getValueLabel({
        value: c(),
        min: e.minValue,
        max: e.maxValue
      }) : h().format(i());
  }, F = () => e.indeterminate ? void 0 : `${i() * 100}%`, d = E(() => {
    let g;
    return e.indeterminate || (g = i() === 1 ? "complete" : "loading"), {
      "data-progress": g,
      "data-indeterminate": e.indeterminate ? "" : void 0
    };
  }), k = {
    dataset: d,
    value: c,
    valuePercent: i,
    valueLabel: C,
    labelId: L,
    progressFillWidth: F,
    generateId: j(() => u.id),
    registerLabelId: w(I)
  };
  return a(f.Provider, {
    value: k,
    get children() {
      return a(s, n({
        role: "progressbar",
        get indeterminate() {
          return e.indeterminate || !1;
        }
      }, d, o));
    }
  });
}
function V(t) {
  const r = l();
  return a(s.Track, n(() => r.dataset(), t));
}
function v(t) {
  const r = l();
  return a(s.ValueLabel, n(() => r.dataset(), t));
}
var N = Object.assign(P, {
  Fill: b,
  Label: x,
  Track: V,
  ValueLabel: v
});
export {
  N as Progress,
  b as ProgressFill,
  x as ProgressLabel,
  P as ProgressRoot,
  V as ProgressTrack,
  v as ProgressValueLabel,
  G as progress_exports,
  l as useProgressContext
};
//# sourceMappingURL=index122.js.map
