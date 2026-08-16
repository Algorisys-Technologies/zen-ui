var l = {
  type: "cancelation",
  msg: "operation is manually canceled"
};
function u(n) {
  var a = !1, e = new Promise(function(c, t) {
    n.then(function(r) {
      return a ? t(l) : c(r);
    }), n.catch(t);
  });
  return e.cancel = function() {
    return a = !0;
  }, e;
}
export {
  l as CANCELATION_MESSAGE,
  u as default
};
//# sourceMappingURL=index370.js.map
