import $ from "./index226.js";
import k, { memo as X, useState as U, useRef as l, useCallback as Q, useEffect as E } from "react";
var te = { wrapper: { display: "flex", position: "relative", textAlign: "initial" }, fullWidth: { width: "100%" }, hide: { display: "none" } }, J = te, ne = { container: { display: "flex", height: "100%", width: "100%", justifyContent: "center", alignItems: "center" } }, ie = ne;
function ue({ children: e }) {
  return k.createElement("div", { style: ie.container }, e);
}
var oe = ue, ae = oe;
function le({ width: e, height: n, isEditorReady: u, loading: r, _ref: g, className: p, wrapperProps: v }) {
  return k.createElement("section", { style: { ...J.wrapper, width: e, height: n }, ...v }, !u && k.createElement(ae, null, r), k.createElement("div", { ref: g, style: { ...J.fullWidth, ...!u && J.hide }, className: p }));
}
var ce = le, q = X(ce);
function de(e) {
  E(e, []);
}
var K = de;
function se(e, n, u = !0) {
  let r = l(!0);
  E(r.current || !u ? () => {
    r.current = !1;
  } : e, n);
}
var M = se;
function R() {
}
function O(e, n, u, r) {
  return fe(e, r) || ge(e, n, u, r);
}
function fe(e, n) {
  return e.editor.getModel(ee(e, n));
}
function ge(e, n, u, r) {
  return e.editor.createModel(n, u, r ? ee(e, r) : void 0);
}
function ee(e, n) {
  return e.Uri.parse(n);
}
function pe({ original: e, modified: n, language: u, originalLanguage: r, modifiedLanguage: g, originalModelPath: p, modifiedModelPath: v, keepCurrentOriginalModel: L = !1, keepCurrentModifiedModel: T = !1, theme: w = "light", loading: b = "Loading...", options: m = {}, height: F = "100%", width: I = "100%", className: z, wrapperProps: H = {}, beforeMount: W = R, onMount: j = R }) {
  let [h, y] = U(!1), [S, a] = U(!0), c = l(null), o = l(null), x = l(null), s = l(j), t = l(W), C = l(!1);
  K(() => {
    let i = $.init();
    return i.then((d) => (o.current = d) && a(!1)).catch((d) => d?.type !== "cancelation" && console.error("Monaco initialization: error:", d)), () => c.current ? P() : i.cancel();
  }), M(() => {
    if (c.current && o.current) {
      let i = c.current.getOriginalEditor(), d = O(o.current, e || "", r || u || "text", p || "");
      d !== i.getModel() && i.setModel(d);
    }
  }, [p], h), M(() => {
    if (c.current && o.current) {
      let i = c.current.getModifiedEditor(), d = O(o.current, n || "", g || u || "text", v || "");
      d !== i.getModel() && i.setModel(d);
    }
  }, [v], h), M(() => {
    let i = c.current.getModifiedEditor();
    i.getOption(o.current.editor.EditorOption.readOnly) ? i.setValue(n || "") : n !== i.getValue() && (i.executeEdits("", [{ range: i.getModel().getFullModelRange(), text: n || "", forceMoveMarkers: !0 }]), i.pushUndoStop());
  }, [n], h), M(() => {
    c.current?.getModel()?.original.setValue(e || "");
  }, [e], h), M(() => {
    let { original: i, modified: d } = c.current.getModel();
    o.current.editor.setModelLanguage(i, r || u || "text"), o.current.editor.setModelLanguage(d, g || u || "text");
  }, [u, r, g], h), M(() => {
    o.current?.editor.setTheme(w);
  }, [w], h), M(() => {
    c.current?.updateOptions(m);
  }, [m], h);
  let N = Q(() => {
    if (!o.current) return;
    t.current(o.current);
    let i = O(o.current, e || "", r || u || "text", p || ""), d = O(o.current, n || "", g || u || "text", v || "");
    c.current?.setModel({ original: i, modified: d });
  }, [u, n, g, e, r, p, v]), _ = Q(() => {
    !C.current && x.current && (c.current = o.current.editor.createDiffEditor(x.current, { automaticLayout: !0, ...m }), N(), o.current?.editor.setTheme(w), y(!0), C.current = !0);
  }, [m, w, N]);
  E(() => {
    h && s.current(c.current, o.current);
  }, [h]), E(() => {
    !S && !h && _();
  }, [S, h, _]);
  function P() {
    let i = c.current?.getModel();
    L || i?.original?.dispose(), T || i?.modified?.dispose(), c.current?.dispose();
  }
  return k.createElement(q, { width: I, height: F, isEditorReady: h, loading: b, _ref: x, className: z, wrapperProps: H });
}
var he = pe;
X(he);
function Me(e) {
  let n = l();
  return E(() => {
    n.current = e;
  }, [e]), n.current;
}
var ve = Me, D = /* @__PURE__ */ new Map();
function me({ defaultValue: e, defaultLanguage: n, defaultPath: u, value: r, language: g, path: p, theme: v = "light", line: L, loading: T = "Loading...", options: w = {}, overrideServices: b = {}, saveViewState: m = !0, keepCurrentModel: F = !1, width: I = "100%", height: z = "100%", className: H, wrapperProps: W = {}, beforeMount: j = R, onMount: h = R, onChange: y, onValidate: S = R }) {
  let [a, c] = U(!1), [o, x] = U(!0), s = l(null), t = l(null), C = l(null), N = l(h), _ = l(j), P = l(), i = l(r), d = ve(p), Y = l(!1), A = l(!1);
  K(() => {
    let f = $.init();
    return f.then((V) => (s.current = V) && x(!1)).catch((V) => V?.type !== "cancelation" && console.error("Monaco initialization: error:", V)), () => t.current ? re() : f.cancel();
  }), M(() => {
    let f = O(s.current, e || r || "", n || g || "", p || u || "");
    f !== t.current?.getModel() && (m && D.set(d, t.current?.saveViewState()), t.current?.setModel(f), m && t.current?.restoreViewState(D.get(p)));
  }, [p], a), M(() => {
    t.current?.updateOptions(w);
  }, [w], a), M(() => {
    !t.current || r === void 0 || (t.current.getOption(s.current.editor.EditorOption.readOnly) ? t.current.setValue(r) : r !== t.current.getValue() && (A.current = !0, t.current.executeEdits("", [{ range: t.current.getModel().getFullModelRange(), text: r, forceMoveMarkers: !0 }]), t.current.pushUndoStop(), A.current = !1));
  }, [r], a), M(() => {
    let f = t.current?.getModel();
    f && g && s.current?.editor.setModelLanguage(f, g);
  }, [g], a), M(() => {
    L !== void 0 && t.current?.revealLine(L);
  }, [L], a), M(() => {
    s.current?.editor.setTheme(v);
  }, [v], a);
  let Z = Q(() => {
    if (!(!C.current || !s.current) && !Y.current) {
      _.current(s.current);
      let f = p || u, V = O(s.current, r || e || "", n || g || "", f || "");
      t.current = s.current?.editor.create(C.current, { model: V, automaticLayout: !0, ...w }, b), m && t.current.restoreViewState(D.get(f)), s.current.editor.setTheme(v), L !== void 0 && t.current.revealLine(L), c(!0), Y.current = !0;
    }
  }, [e, n, u, r, g, p, w, b, m, v, L]);
  E(() => {
    a && N.current(t.current, s.current);
  }, [a]), E(() => {
    !o && !a && Z();
  }, [o, a, Z]), i.current = r, E(() => {
    a && y && (P.current?.dispose(), P.current = t.current?.onDidChangeModelContent((f) => {
      A.current || y(t.current.getValue(), f);
    }));
  }, [a, y]), E(() => {
    if (a) {
      let f = s.current.editor.onDidChangeMarkers((V) => {
        let B = t.current.getModel()?.uri;
        if (B && V.find((G) => G.path === B.path)) {
          let G = s.current.editor.getModelMarkers({ resource: B });
          S?.(G);
        }
      });
      return () => {
        f?.dispose();
      };
    }
    return () => {
    };
  }, [a, S]);
  function re() {
    P.current?.dispose(), F ? m && D.set(p, t.current.saveViewState()) : t.current.getModel()?.dispose(), t.current.dispose();
  }
  return k.createElement(q, { width: I, height: z, isEditorReady: a, loading: T, _ref: C, className: H, wrapperProps: W });
}
var we = me, Ee = X(we), Ce = Ee;
export {
  Ee as Editor,
  Ce as default,
  $ as loader
};
//# sourceMappingURL=index185.js.map
