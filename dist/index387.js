function o(u) {
  return function h() {
    for (var i = this, a = arguments.length, r = new Array(a), t = 0; t < a; t++)
      r[t] = arguments[t];
    return r.length >= u.length ? u.apply(this, r) : function() {
      for (var c = arguments.length, e = new Array(c), n = 0; n < c; n++)
        e[n] = arguments[n];
      return h.apply(i, [].concat(r, e));
    };
  };
}
export {
  o as default
};
//# sourceMappingURL=index387.js.map
