import { slicedToArray as l, objectWithoutProperties as d } from "./index375.js";
import v from "./index376.js";
import g from "./index377.js";
import p from "./index378.js";
import j from "./index379.js";
import w from "./index380.js";
import s from "./index381.js";
var I = ["monaco"], z = v.create({
  config: g,
  isInitialized: !1,
  resolve: null,
  reject: null,
  monaco: null
}), u = l(z, 2), i = u[0], c = u[1];
function S(o) {
  var e = p.config(o), n = e.monaco, r = d(e, I);
  c(function(t) {
    return {
      config: w(t.config, r),
      monaco: n
    };
  });
}
function _() {
  var o = i(function(e) {
    var n = e.monaco, r = e.isInitialized, t = e.resolve;
    return {
      monaco: n,
      isInitialized: r,
      resolve: t
    };
  });
  if (!o.isInitialized) {
    if (c({
      isInitialized: !0
    }), o.monaco)
      return o.resolve(o.monaco), s(f);
    if (window.monaco && window.monaco.editor)
      return m(window.monaco), o.resolve(window.monaco), s(f);
    j(b, M)(P);
  }
  return s(f);
}
function b(o) {
  return document.body.appendChild(o);
}
function h(o) {
  var e = document.createElement("script");
  return o && (e.src = o), e;
}
function M(o) {
  var e = i(function(r) {
    var t = r.config, a = r.reject;
    return {
      config: t,
      reject: a
    };
  }), n = h("".concat(e.config.paths.vs, "/loader.js"));
  return n.onload = function() {
    return o();
  }, n.onerror = e.reject, n;
}
function P() {
  var o = i(function(n) {
    var r = n.config, t = n.resolve, a = n.reject;
    return {
      config: r,
      resolve: t,
      reject: a
    };
  }), e = window.require;
  e.config(o.config), e(["vs/editor/editor.main"], function(n) {
    var r = n.m || n;
    m(r), o.resolve(r);
  }, function(n) {
    o.reject(n);
  });
}
function m(o) {
  i().monaco || c({
    monaco: o
  });
}
function $() {
  return i(function(o) {
    var e = o.monaco;
    return e;
  });
}
var f = new Promise(function(o, e) {
  return c({
    resolve: o,
    reject: e
  });
}), W = {
  config: S,
  init: _,
  __getMonacoInstance: $
};
export {
  W as default
};
//# sourceMappingURL=index226.js.map
