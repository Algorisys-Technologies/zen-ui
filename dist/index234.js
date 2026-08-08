import { __spreadArray as N } from "./index223.js";
import * as n from "react";
import { RemoveScrollBar as W } from "./index310.js";
import { styleSingleton as F } from "./index311.js";
import { nonPassive as s } from "./index312.js";
import { locationCouldBeScrolled as B, handleScroll as K } from "./index313.js";
var k = function(e) {
  return "changedTouches" in e ? [e.changedTouches[0].clientX, e.changedTouches[0].clientY] : [0, 0];
}, M = function(e) {
  return [e.deltaX, e.deltaY];
}, X = function(e) {
  return e && "current" in e ? e.current : e;
}, O = function(e, c) {
  return e[0] === c[0] && e[1] === c[1];
}, Q = function(e) {
  return `
  .block-interactivity-`.concat(e, ` {pointer-events: none;}
  .allow-interactivity-`).concat(e, ` {pointer-events: all;}
`);
}, Z = 0, f = [];
function J(e) {
  var c = n.useRef([]), R = n.useRef([0, 0]), m = n.useRef(), h = n.useState(Z++)[0], g = n.useState(F)[0], S = n.useRef(e);
  n.useEffect(function() {
    S.current = e;
  }, [e]), n.useEffect(function() {
    if (e.inert) {
      document.body.classList.add("block-interactivity-".concat(h));
      var t = N([e.lockRef.current], (e.shards || []).map(X), !0).filter(Boolean);
      return t.forEach(function(r) {
        return r.classList.add("allow-interactivity-".concat(h));
      }), function() {
        document.body.classList.remove("block-interactivity-".concat(h)), t.forEach(function(r) {
          return r.classList.remove("allow-interactivity-".concat(h));
        });
      };
    }
  }, [e.inert, e.lockRef.current, e.shards]);
  var C = n.useCallback(function(t, r) {
    if ("touches" in t && t.touches.length === 2 || t.type === "wheel" && t.ctrlKey)
      return !S.current.allowPinchZoom;
    var l = k(t), u = R.current, o = "deltaX" in t ? t.deltaX : u[0] - l[0], i = "deltaY" in t ? t.deltaY : u[1] - l[1], a, v = t.target, d = Math.abs(o) > Math.abs(i) ? "h" : "v";
    if ("touches" in t && d === "h" && v.type === "range")
      return !1;
    var P = window.getSelection(), E = P && P.anchorNode, I = E ? E === v || E.contains(v) : !1;
    if (I)
      return !1;
    var b = B(d, v);
    if (!b)
      return !0;
    if (b ? a = d : (a = d === "v" ? "h" : "v", b = B(d, v)), !b)
      return !1;
    if (!m.current && "changedTouches" in t && (o || i) && (m.current = a), !a)
      return !0;
    var Y = m.current || a;
    return K(Y, r, t, Y === "h" ? o : i);
  }, []), y = n.useCallback(function(t) {
    var r = t;
    if (!(!f.length || f[f.length - 1] !== g)) {
      var l = "deltaY" in r ? M(r) : k(r), u = c.current.filter(function(a) {
        return a.name === r.type && (a.target === r.target || r.target === a.shadowParent) && O(a.delta, l);
      })[0];
      if (u && u.should) {
        r.cancelable && r.preventDefault();
        return;
      }
      if (!u) {
        var o = (S.current.shards || []).map(X).filter(Boolean).filter(function(a) {
          return a.contains(r.target);
        }), i = o.length > 0 ? C(r, o[0]) : !S.current.noIsolation;
        i && r.cancelable && r.preventDefault();
      }
    }
  }, []), w = n.useCallback(function(t, r, l, u) {
    var o = { name: t, delta: r, target: l, should: u, shadowParent: _(l) };
    c.current.push(o), setTimeout(function() {
      c.current = c.current.filter(function(i) {
        return i !== o;
      });
    }, 1);
  }, []), L = n.useCallback(function(t) {
    R.current = k(t), m.current = void 0;
  }, []), T = n.useCallback(function(t) {
    w(t.type, M(t), t.target, C(t, e.lockRef.current));
  }, []), D = n.useCallback(function(t) {
    w(t.type, k(t), t.target, C(t, e.lockRef.current));
  }, []);
  n.useEffect(function() {
    return f.push(g), e.setCallbacks({
      onScrollCapture: T,
      onWheelCapture: T,
      onTouchMoveCapture: D
    }), document.addEventListener("wheel", y, s), document.addEventListener("touchmove", y, s), document.addEventListener("touchstart", L, s), function() {
      f = f.filter(function(t) {
        return t !== g;
      }), document.removeEventListener("wheel", y, s), document.removeEventListener("touchmove", y, s), document.removeEventListener("touchstart", L, s);
    };
  }, []);
  var x = e.removeScrollBar, A = e.inert;
  return n.createElement(
    n.Fragment,
    null,
    A ? n.createElement(g, { styles: Q(h) }) : null,
    x ? n.createElement(W, { noRelative: e.noRelative, gapMode: e.gapMode }) : null
  );
}
function _(e) {
  for (var c = null; e !== null; )
    e instanceof ShadowRoot && (c = e.host, e = e.host), e = e.parentNode;
  return c;
}
export {
  J as RemoveScrollSideCar,
  M as getDeltaXY,
  k as getTouchXY
};
//# sourceMappingURL=index234.js.map
