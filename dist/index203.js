const n = {
  blank: 4e3,
  error: 4e3,
  success: 2e3,
  loading: 1 / 0,
  custom: 4e3
}, o = {
  id: "",
  icon: "",
  unmountDelay: 500,
  duration: 3e3,
  ariaProps: {
    role: "status",
    "aria-live": "polite"
  },
  className: "",
  style: {},
  position: "top-right",
  iconTheme: {}
}, e = {
  position: "top-right",
  toastOptions: o,
  gutter: 8,
  containerStyle: {},
  containerClassName: ""
}, t = "16px", i = {
  position: "fixed",
  "z-index": 9999,
  top: t,
  bottom: t,
  left: t,
  right: t,
  "pointer-events": "none"
};
export {
  i as defaultContainerStyle,
  n as defaultTimeouts,
  o as defaultToastOptions,
  e as defaultToasterOptions
};
//# sourceMappingURL=index203.js.map
