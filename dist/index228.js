function d(t, r, u) {
  const y = new Array(t);
  return new Proxy(y, {
    get(i, n, a) {
      if (typeof n == "string") {
        const c = n.charCodeAt(0);
        if (c >= 48 && c <= 57) {
          const e = +n;
          if (Number.isInteger(e) && e >= 0 && e < t) {
            let s = i[e];
            if (!s) {
              const f = r[e * 2];
              s = i[e] = {
                index: e,
                key: u(e),
                start: f,
                size: r[e * 2 + 1],
                end: f + r[e * 2 + 1],
                lane: 0
              };
            }
            return s;
          }
        }
        if (n === "length") return t;
      }
      return Reflect.get(i, n, a);
    }
  });
}
export {
  d as createLazyMeasurementsView
};
//# sourceMappingURL=index228.js.map
