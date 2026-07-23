import { createComponent as w, mergeProps as I, template as Te, spread as Pe } from "solid-js/web";
import { stopEventDefaultAndPropagation as M, getNextSortedValues as $, hasMinStepsBetweenValues as N, getClosestValueIndex as Se, linearScale as xe } from "./index203.js";
import { createDomCollection as Ce, createDomCollectionItem as De } from "./index188.js";
import { createNumberFormatter as ye, useLocale as we } from "./index147.js";
import { FORM_CONTROL_FIELD_PROP_NAMES as Z, createFormControlField as ee } from "./index201.js";
import { FormControlLabel as te } from "./index155.js";
import { createFormResetListener as Fe } from "./index156.js";
import { FormControlErrorMessage as ne } from "./index157.js";
import { FormControlDescription as re, FORM_CONTROL_PROP_NAMES as Ee, createFormControl as Me, FormControlContext as Ie, useFormControlContext as Le } from "./index158.js";
import { createControllableArraySignal as Re } from "./index160.js";
import { Polymorphic as B } from "./index161.js";
import { __export as Be } from "./index162.js";
import { createUniqueId as ae, splitProps as k, createSignal as F, createMemo as R, createContext as oe, onMount as ke, createEffect as ze, useContext as ie } from "solid-js";
import { mergeDefaultProps as O, createGenerateId as _e, visuallyHiddenStyles as Ke, snapValueToStep as A, clamp as se, callHandler as C } from "./index163.js";
import { access as Q } from "./index165.js";
import { mergeRefs as q } from "./index166.js";
import { combineStyle as H } from "./index167.js";
var Oe = /* @__PURE__ */ Te("<input type=range>"), Ue = {};
Be(Ue, {
  Description: () => re,
  ErrorMessage: () => ne,
  Fill: () => ue,
  Input: () => de,
  Label: () => te,
  Root: () => ge,
  Slider: () => Ae,
  Thumb: () => ce,
  Track: () => be,
  ValueLabel: () => fe,
  useSliderContext: () => L
});
var le = oe();
function L() {
  const l = ie(le);
  if (l === void 0)
    throw new Error("[kobalte]: `useSliderContext` must be used within a `Slider.Root` component");
  return l;
}
function ue(l) {
  const t = L(), [e, f] = k(l, ["style"]), a = () => t.state.values().map((m) => t.state.getValuePercent(m) * 100), c = () => t.state.values().length > 1 ? Math.min(...a()) : 0, p = () => 100 - Math.max(...a());
  return w(B, I({
    as: "div",
    get style() {
      return H({
        [t.startEdge()]: `${c()}%`,
        [t.endEdge()]: `${p()}%`
      }, e.style);
    }
  }, () => t.dataset(), f));
}
function ce(l) {
  let t;
  const e = L(), f = O({
    id: e.generateId(`thumb-${ae()}`)
  }, l), [a, c, p] = k(f, ["ref", "style", "onKeyDown", "onPointerDown", "onPointerMove", "onPointerUp", "onFocus", "onBlur"], Z), {
    fieldProps: m
  } = ee(c);
  De({
    getItem: () => ({
      ref: () => t,
      disabled: e.state.isDisabled(),
      key: m.id(),
      textValue: "",
      type: "item"
    })
  });
  const g = () => t ? e.thumbs().findIndex((o) => o.ref() === t) : -1, S = () => e.state.getThumbValue(g()), r = () => e.state.getThumbPercent(g()), s = () => e.state.orientation() === "vertical" ? e.inverted() ? "translateY(-50%)" : "translateY(50%)" : e.inverted() ? "translateX(50%)" : "translateX(-50%)";
  let u = 0;
  const V = (o) => {
    C(o, a.onKeyDown), e.onStepKeyDown(o, g());
  }, h = (o) => {
    C(o, a.onPointerDown);
    const v = o.currentTarget;
    o.preventDefault(), o.stopPropagation(), v.setPointerCapture(o.pointerId), v.focus(), u = e.state.orientation() === "horizontal" ? o.clientX : o.clientY, S() !== void 0 && e.onSlideStart?.(g(), S());
  }, x = (o) => {
    if (o.stopPropagation(), C(o, a.onPointerMove), o.currentTarget.hasPointerCapture(o.pointerId)) {
      const T = {
        deltaX: o.clientX - u,
        deltaY: o.clientY - u
      };
      e.onSlideMove?.(T), u = e.state.orientation() === "horizontal" ? o.clientX : o.clientY;
    }
  }, D = (o) => {
    o.stopPropagation(), C(o, a.onPointerUp);
    const v = o.currentTarget;
    v.hasPointerCapture(o.pointerId) && (v.releasePointerCapture(o.pointerId), e.onSlideEnd?.());
  }, P = (o) => {
    C(o, a.onFocus), e.state.setFocusedThumb(g());
  }, E = (o) => {
    C(o, a.onBlur), e.state.setFocusedThumb(void 0);
  };
  return ke(() => {
    e.state.setThumbEditable(g(), !e.state.isDisabled());
  }), w(me.Provider, {
    value: {
      index: g
    },
    get children() {
      return w(B, I({
        as: "span",
        ref(o) {
          var v = q((T) => t = T, a.ref);
          typeof v == "function" && v(o);
        },
        role: "slider",
        get id() {
          return m.id();
        },
        get tabIndex() {
          return e.state.isDisabled() ? void 0 : 0;
        },
        get style() {
          return H({
            display: S() === void 0 ? "none" : void 0,
            position: "absolute",
            [e.startEdge()]: `calc(${r() * 100}%)`,
            transform: s(),
            "touch-action": "none"
          }, a.style);
        },
        get "aria-valuetext"() {
          return e.state.getThumbValueLabel(g());
        },
        get "aria-valuemin"() {
          return e.minValue();
        },
        get "aria-valuenow"() {
          return S();
        },
        get "aria-valuemax"() {
          return e.maxValue();
        },
        get "aria-orientation"() {
          return e.state.orientation();
        },
        get "aria-label"() {
          return m.ariaLabel();
        },
        get "aria-labelledby"() {
          return m.ariaLabelledBy();
        },
        get "aria-describedby"() {
          return m.ariaDescribedBy();
        },
        onKeyDown: V,
        onPointerDown: h,
        onPointerMove: x,
        onPointerUp: D,
        onFocus: P,
        onBlur: E
      }, () => e.dataset(), p));
    }
  });
}
var me = oe();
function Xe() {
  const l = ie(me);
  if (l === void 0)
    throw new Error("[kobalte]: `useThumbContext` must be used within a `Slider.Thumb` component");
  return l;
}
function de(l) {
  const t = Le(), e = L(), f = Xe(), a = O({
    id: e.generateId("input")
  }, l), [c, p, m] = k(a, ["style", "onChange"], Z), {
    fieldProps: g
  } = ee(p), [S, r] = F(""), s = (u) => {
    C(u, c.onChange);
    const V = u.target;
    e.state.setThumbValue(f.index(), Number.parseFloat(V.value)), V.value = String(e.state.values()[f.index()]) ?? "";
  };
  return ze(() => {
    r(f.index() === -1 ? "" : e.state.getThumbValueLabel(f.index()));
  }), (() => {
    var u = Oe();
    return u.addEventListener("change", s), Pe(u, I({
      get id() {
        return g.id();
      },
      get name() {
        return t.name();
      },
      get tabIndex() {
        return e.state.isDisabled() ? void 0 : -1;
      },
      get min() {
        return e.state.getThumbMinValue(f.index());
      },
      get max() {
        return e.state.getThumbMaxValue(f.index());
      },
      get step() {
        return e.state.step();
      },
      get value() {
        return e.state.values()[f.index()];
      },
      get required() {
        return t.isRequired();
      },
      get disabled() {
        return t.isDisabled();
      },
      get readonly() {
        return t.isReadOnly();
      },
      get style() {
        return H({
          ...Ke
        }, c.style);
      },
      get "aria-orientation"() {
        return e.state.orientation();
      },
      get "aria-valuetext"() {
        return S();
      },
      get "aria-label"() {
        return g.ariaLabel();
      },
      get "aria-labelledby"() {
        return g.ariaLabelledBy();
      },
      get "aria-describedby"() {
        return g.ariaDescribedBy();
      },
      get "aria-invalid"() {
        return t.validationState() === "invalid" || void 0;
      },
      get "aria-required"() {
        return t.isRequired() || void 0;
      },
      get "aria-disabled"() {
        return t.isDisabled() || void 0;
      },
      get "aria-readonly"() {
        return t.isReadOnly() || void 0;
      }
    }, () => e.dataset(), m), !1, !1), u;
  })();
}
function Ye(l) {
  let t = !1;
  const e = O({
    minValue: () => 0,
    maxValue: () => 100,
    step: () => 1,
    minStepsBetweenThumbs: () => 0,
    orientation: () => "horizontal",
    isDisabled: () => !1
  }, l), f = R(() => {
    let n = (e.maxValue() - e.minValue()) / 10;
    return n = A(n, 0, n + e.step(), e.step()), Math.max(n, e.step());
  }), a = R(() => e.defaultValue() ?? [e.minValue()]), [c, p] = Re({
    value: () => e.value(),
    defaultValue: a,
    onChange: (n) => e.onChange?.(n)
  }), [m, g] = F(new Array(c().length).fill(!1)), [S, r] = F(new Array(c().length).fill(!1)), [s, u] = F(void 0), V = () => {
    p(a());
  }, h = (n) => (n - e.minValue()) / (e.maxValue() - e.minValue()), x = (n) => n === 0 ? l.minValue() : c()[n - 1] + l.minStepsBetweenThumbs() * l.step(), D = (n) => n === c().length - 1 ? l.maxValue() : c()[n + 1] - l.minStepsBetweenThumbs() * l.step(), P = (n) => S()[n], E = (n) => {
    r((b) => (b[n] = !0, b));
  }, o = (n, b) => {
    if (e.isDisabled() || !P(n)) return;
    const y = A(b, x(n), D(n), e.step()), i = $(c(), y, n);
    N(i, e.minStepsBetweenThumbs() * e.step()) && p((d) => [...W(d, n, y)]);
  }, v = (n, b) => {
    if (e.isDisabled() || !P(n)) return;
    const y = m()[n];
    g((i) => [...W(i, n, b)]), y && !m().some(Boolean) && e.onChangeEnd?.(c());
  }, T = (n) => e.numberFormatter.format(n), U = (n, b) => {
    o(n, z(b));
  }, X = (n) => Math.round((n - e.minValue()) / e.step()) * e.step() + e.minValue(), z = (n) => {
    const b = n * (e.maxValue() - e.minValue()) + e.minValue();
    return se(X(b), e.minValue(), e.maxValue());
  }, _ = (n, b) => {
    const y = c()[n] + b, i = $(c(), y, n);
    N(i, e.minStepsBetweenThumbs() * e.step()) && o(n, A(y, e.minValue(), e.maxValue(), e.step()));
  };
  return {
    values: c,
    getThumbValue: (n) => c()[n],
    setThumbValue: o,
    setThumbPercent: U,
    isThumbDragging: (n) => m()[n],
    setThumbDragging: v,
    focusedThumb: s,
    setFocusedThumb: (n) => {
      n === void 0 && t && (t = !1, e.onChangeEnd?.(c())), u(n);
    },
    getThumbPercent: (n) => h(c()[n]),
    getValuePercent: h,
    getThumbValueLabel: (n) => T(c()[n]),
    getFormattedValue: T,
    getThumbMinValue: x,
    getThumbMaxValue: D,
    getPercentValue: z,
    isThumbEditable: P,
    setThumbEditable: E,
    incrementThumb: (n, b = 1) => {
      t = !0, _(n, Math.max(b, l.step()));
    },
    decrementThumb: (n, b = 1) => {
      t = !0, _(n, -Math.max(b, l.step()));
    },
    step: e.step,
    pageSize: f,
    orientation: e.orientation,
    isDisabled: e.isDisabled,
    setValues: p,
    resetValues: V
  };
}
function W(l, t, e) {
  return l[t] === e ? l : [...l.slice(0, t), e, ...l.slice(t + 1)];
}
function ge(l) {
  let t;
  const e = `slider-${ae()}`, f = O({
    id: e,
    minValue: 0,
    maxValue: 100,
    step: 1,
    minStepsBetweenThumbs: 0,
    orientation: "horizontal",
    disabled: !1,
    inverted: !1,
    getValueLabel: (i) => i.values.join(", ")
  }, l), [a, c, p] = k(f, ["ref", "value", "defaultValue", "onChange", "onChangeEnd", "inverted", "minValue", "maxValue", "step", "minStepsBetweenThumbs", "getValueLabel", "orientation"], Ee), {
    formControlContext: m
  } = Me(c), g = ye(() => ({
    style: "decimal"
  })), {
    direction: S
  } = we(), r = Ye({
    value: () => a.value,
    defaultValue: () => a.defaultValue ?? [a.minValue],
    maxValue: () => a.maxValue,
    minValue: () => a.minValue,
    minStepsBetweenThumbs: () => a.minStepsBetweenThumbs,
    isDisabled: () => m.isDisabled() ?? !1,
    orientation: () => a.orientation,
    step: () => a.step,
    numberFormatter: g(),
    onChange: a.onChange,
    onChangeEnd: a.onChangeEnd
  }), [s, u] = F([]), {
    DomCollectionProvider: V
  } = Ce({
    items: s,
    onItemsChange: u
  });
  Fe(() => t, () => r.resetValues());
  const h = () => S() === "ltr", x = () => h() && !a.inverted || !h() && a.inverted, D = () => !a.inverted, P = () => r.orientation() === "vertical", E = R(() => ({
    ...m.dataset(),
    "data-orientation": a.orientation
  })), [o, v] = F();
  let T = null;
  const U = (i, d) => {
    r.setFocusedThumb(i), r.setThumbDragging(i, !0), r.setThumbValue(i, d), T = null;
  }, X = ({
    deltaX: i,
    deltaY: d
  }) => {
    const K = r.focusedThumb();
    if (K === void 0)
      return;
    const {
      width: he,
      height: pe
    } = o().getBoundingClientRect(), J = P() ? pe : he;
    T === null && (T = r.getThumbPercent(r.focusedThumb()) * J);
    let Y = P() ? d : i;
    (!P() && a.inverted || P() && D()) && (Y = -Y), T += Y;
    const Ve = se(T / J, 0, 1), ve = $(r.values(), T, K);
    N(ve, a.minStepsBetweenThumbs * r.step()) && (r.setThumbPercent(r.focusedThumb(), Ve), a.onChange?.(r.values()));
  }, z = () => {
    const i = r.focusedThumb();
    i !== void 0 && (r.setThumbDragging(i, !1), s()[i].ref().focus());
  }, _ = (i) => {
    const d = r.focusedThumb();
    !m.isDisabled() && d !== void 0 && (M(i), r.setThumbValue(d, r.getThumbMinValue(d)));
  }, j = (i) => {
    const d = r.focusedThumb();
    !m.isDisabled() && d !== void 0 && (M(i), r.setThumbValue(d, r.getThumbMaxValue(d)));
  }, G = (i, d) => {
    if (!m.isDisabled())
      switch (i.key) {
        case "Left":
        case "ArrowLeft":
        case "Down":
        case "ArrowDown":
          M(i), h() ? r.decrementThumb(d, i.shiftKey ? r.pageSize() : r.step()) : r.incrementThumb(d, i.shiftKey ? r.pageSize() : r.step());
          break;
        case "Right":
        case "ArrowRight":
        case "Up":
        case "ArrowUp":
          M(i), h() ? r.incrementThumb(d, i.shiftKey ? r.pageSize() : r.step()) : r.decrementThumb(d, i.shiftKey ? r.pageSize() : r.step());
          break;
        case "Home":
          _(i);
          break;
        case "End":
          j(i);
          break;
        case "PageUp":
          M(i), r.incrementThumb(d, r.pageSize());
          break;
        case "PageDown":
          M(i), r.decrementThumb(d, r.pageSize());
          break;
      }
  }, n = R(() => P() ? D() ? "bottom" : "top" : x() ? "left" : "right"), b = R(() => P() ? D() ? "top" : "bottom" : x() ? "right" : "left"), y = {
    dataset: E,
    state: r,
    thumbs: s,
    setThumbs: u,
    onSlideStart: U,
    onSlideMove: X,
    onSlideEnd: z,
    onStepKeyDown: G,
    isSlidingFromLeft: x,
    isSlidingFromBottom: D,
    trackRef: o,
    minValue: () => a.minValue,
    maxValue: () => a.maxValue,
    inverted: () => a.inverted,
    startEdge: n,
    endEdge: b,
    registerTrack: (i) => v(i),
    generateId: _e(() => Q(c.id)),
    getValueLabel: a.getValueLabel
  };
  return w(V, {
    get children() {
      return w(Ie.Provider, {
        value: m,
        get children() {
          return w(le.Provider, {
            value: y,
            get children() {
              return w(B, I({
                as: "div",
                ref(i) {
                  var d = q((K) => t = K, a.ref);
                  typeof d == "function" && d(i);
                },
                role: "group",
                get id() {
                  return Q(c.id);
                }
              }, E, p));
            }
          });
        }
      });
    }
  });
}
function be(l) {
  const t = L(), [e, f] = k(l, ["onPointerDown", "onPointerMove", "onPointerUp"]), [a, c] = F();
  function p(s) {
    const u = a() || t.trackRef().getBoundingClientRect(), V = [0, t.state.orientation() === "vertical" ? u.height : u.width];
    let h = t.isSlidingFromLeft() ? [t.minValue(), t.maxValue()] : [t.maxValue(), t.minValue()];
    t.state.orientation() === "vertical" && (h = t.isSlidingFromBottom() ? [t.maxValue(), t.minValue()] : [t.minValue(), t.maxValue()]);
    const x = xe(V, h);
    return c(u), x(s - (t.state.orientation() === "vertical" ? u.top : u.left));
  }
  let m = 0;
  return w(B, I({
    as: "div",
    ref(s) {
      var u = q(t.registerTrack, l.ref);
      typeof u == "function" && u(s);
    },
    onPointerDown: (s) => {
      C(s, e.onPointerDown), s.target.setPointerCapture(s.pointerId), s.preventDefault();
      const V = p(t.state.orientation() === "horizontal" ? s.clientX : s.clientY);
      m = t.state.orientation() === "horizontal" ? s.clientX : s.clientY;
      const h = Se(t.state.values(), V);
      t.onSlideStart?.(h, V);
    },
    onPointerMove: (s) => {
      C(s, e.onPointerMove), s.target.hasPointerCapture(s.pointerId) && (t.onSlideMove?.({
        deltaX: s.clientX - m,
        deltaY: s.clientY - m
      }), m = t.state.orientation() === "horizontal" ? s.clientX : s.clientY);
    },
    onPointerUp: (s) => {
      C(s, e.onPointerUp);
      const u = s.target;
      u.hasPointerCapture(s.pointerId) && (u.releasePointerCapture(s.pointerId), c(void 0), t.onSlideEnd?.());
    }
  }, () => t.dataset(), f));
}
function fe(l) {
  const t = L();
  return w(B, I({
    as: "div"
  }, () => t.dataset(), l, {
    get children() {
      return t.getValueLabel?.({
        values: t.state.values(),
        max: t.maxValue(),
        min: t.minValue()
      });
    }
  }));
}
var Ae = Object.assign(ge, {
  Description: re,
  ErrorMessage: ne,
  Fill: ue,
  Input: de,
  Label: te,
  Thumb: ce,
  Track: be,
  ValueLabel: fe
});
export {
  Ae as Slider,
  ue as SliderFill,
  de as SliderInput,
  ge as SliderRoot,
  ce as SliderThumb,
  be as SliderTrack,
  fe as SliderValueLabel,
  Ue as slider_exports,
  L as useSliderContext
};
//# sourceMappingURL=index129.js.map
