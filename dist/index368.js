var c = function() {
  for (var t = arguments.length, n = new Array(t), r = 0; r < t; r++)
    n[r] = arguments[r];
  return function(u) {
    return n.reduceRight(function(e, o) {
      return o(e);
    }, u);
  };
};
export {
  c as default
};
//# sourceMappingURL=index368.js.map
