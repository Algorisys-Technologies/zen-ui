function f(n, r, { checkForDefaultPrevented: t = !0 } = {}) {
  return function(e) {
    if (n?.(e), t === !1 || !e || !e.defaultPrevented)
      return r?.(e);
  };
}
export {
  f as composeEventHandlers
};
//# sourceMappingURL=index191.js.map
