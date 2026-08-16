import * as d from "react";
import { styleSingleton as f } from "./index385.js";
import { noScrollbarsClassName as p, zeroRightClassName as g, fullWidthClassName as l, removedBarSizeVariable as v } from "./index374.js";
import { getGapWidth as m } from "./index415.js";
var b = f(), e = "data-scroll-locked", h = function(n, a, o, t) {
  var r = n.left, i = n.top, s = n.right, c = n.gap;
  return o === void 0 && (o = "margin"), `
  .`.concat(p, ` {
   overflow: hidden `).concat(t, `;
   padding-right: `).concat(c, "px ").concat(t, `;
  }
  body[`).concat(e, `] {
    overflow: hidden `).concat(t, `;
    overscroll-behavior: contain;
    `).concat([
    a && "position: relative ".concat(t, ";"),
    o === "margin" && `
    padding-left: `.concat(r, `px;
    padding-top: `).concat(i, `px;
    padding-right: `).concat(s, `px;
    margin-left:0;
    margin-top:0;
    margin-right: `).concat(c, "px ").concat(t, `;
    `),
    o === "padding" && "padding-right: ".concat(c, "px ").concat(t, ";")
  ].filter(Boolean).join(""), `
  }
  
  .`).concat(g, ` {
    right: `).concat(c, "px ").concat(t, `;
  }
  
  .`).concat(l, ` {
    margin-right: `).concat(c, "px ").concat(t, `;
  }
  
  .`).concat(g, " .").concat(g, ` {
    right: 0 `).concat(t, `;
  }
  
  .`).concat(l, " .").concat(l, ` {
    margin-right: 0 `).concat(t, `;
  }
  
  body[`).concat(e, `] {
    `).concat(v, ": ").concat(c, `px;
  }
`);
}, u = function() {
  var n = parseInt(document.body.getAttribute(e) || "0", 10);
  return isFinite(n) ? n : 0;
}, x = function() {
  d.useEffect(function() {
    return document.body.setAttribute(e, (u() + 1).toString()), function() {
      var n = u() - 1;
      n <= 0 ? document.body.removeAttribute(e) : document.body.setAttribute(e, n.toString());
    };
  }, []);
}, C = function(n) {
  var a = n.noRelative, o = n.noImportant, t = n.gapMode, r = t === void 0 ? "margin" : t;
  x();
  var i = d.useMemo(function() {
    return m(r);
  }, [r]);
  return d.createElement(b, { styles: h(i, !a, r, o ? "" : "!important") });
};
export {
  C as RemoveScrollBar,
  e as lockAttribute,
  x as useLockAttribute
};
//# sourceMappingURL=index384.js.map
