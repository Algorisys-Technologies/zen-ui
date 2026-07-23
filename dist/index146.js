const Fe = (e, r) => {
  const o = new Array(e.length + r.length);
  for (let t = 0; t < e.length; t++)
    o[t] = e[t];
  for (let t = 0; t < r.length; t++)
    o[e.length + t] = r[t];
  return o;
}, We = (e, r) => ({
  classGroupId: e,
  validator: r
}), Ae = (e = /* @__PURE__ */ new Map(), r = null, o) => ({
  nextPart: e,
  validators: r,
  classGroupId: o
});
const he = [], Ve = "arbitrary..", je = (e) => {
  const r = De(e), {
    conflictingClassGroups: o,
    conflictingClassGroupModifiers: t
  } = e;
  return {
    getClassGroupId: (l) => {
      if (l.startsWith("[") && l.endsWith("]"))
        return Be(l);
      const u = l.split("-"), b = u[0] === "" && u.length > 1 ? 1 : 0;
      return Ce(u, b, r);
    },
    getConflictingClassGroupIds: (l, u) => {
      if (u) {
        const b = t[l], m = o[l];
        return b ? m ? Fe(m, b) : b : m || he;
      }
      return o[l] || he;
    }
  };
}, Ce = (e, r, o) => {
  if (e.length - r === 0)
    return o.classGroupId;
  const i = e[r], d = o.nextPart.get(i);
  if (d) {
    const m = Ce(e, r + 1, d);
    if (m) return m;
  }
  const l = o.validators;
  if (l === null)
    return;
  const u = r === 0 ? e.join("-") : e.slice(r).join("-"), b = l.length;
  for (let m = 0; m < b; m++) {
    const h = l[m];
    if (h.validator(u))
      return h.classGroupId;
  }
}, Be = (e) => e.slice(1, -1).indexOf(":") === -1 ? void 0 : (() => {
  const r = e.slice(1, -1), o = r.indexOf(":"), t = r.slice(0, o);
  return t ? Ve + t : void 0;
})(), De = (e) => {
  const {
    theme: r,
    classGroups: o
  } = e;
  return $e(o, r);
}, $e = (e, r) => {
  const o = Ae();
  for (const t in e) {
    const i = e[t];
    ie(i, o, t, r);
  }
  return o;
}, ie = (e, r, o, t) => {
  const i = e.length;
  for (let d = 0; d < i; d++) {
    const l = e[d];
    Ue(l, r, o, t);
  }
}, Ue = (e, r, o, t) => {
  if (typeof e == "string") {
    Ye(e, r, o);
    return;
  }
  if (typeof e == "function") {
    qe(e, r, o, t);
    return;
  }
  Xe(e, r, o, t);
}, Ye = (e, r, o) => {
  const t = e === "" ? r : Se(r, e);
  t.classGroupId = o;
}, qe = (e, r, o, t) => {
  if (Je(e)) {
    ie(e(t), r, o, t);
    return;
  }
  r.validators === null && (r.validators = []), r.validators.push(We(o, e));
}, Xe = (e, r, o, t) => {
  const i = Object.entries(e), d = i.length;
  for (let l = 0; l < d; l++) {
    const [u, b] = i[l];
    ie(b, Se(r, u), o, t);
  }
}, Se = (e, r) => {
  let o = e;
  const t = r.split("-"), i = t.length;
  for (let d = 0; d < i; d++) {
    const l = t[d];
    let u = o.nextPart.get(l);
    u || (u = Ae(), o.nextPart.set(l, u)), o = u;
  }
  return o;
}, Je = (e) => "isThemeGetter" in e && e.isThemeGetter === !0, Qe = (e) => {
  if (e < 1)
    return {
      get: () => {
      },
      set: () => {
      }
    };
  let r = 0, o = /* @__PURE__ */ Object.create(null), t = /* @__PURE__ */ Object.create(null);
  const i = (d, l) => {
    o[d] = l, r++, r > e && (r = 0, t = o, o = /* @__PURE__ */ Object.create(null));
  };
  return {
    get(d) {
      let l = o[d];
      if (l !== void 0)
        return l;
      if ((l = t[d]) !== void 0)
        return i(d, l), l;
    },
    set(d, l) {
      d in o ? o[d] = l : i(d, l);
    }
  };
};
const He = [], ke = (e, r, o, t, i) => ({
  modifiers: e,
  hasImportantModifier: r,
  baseClassName: o,
  maybePostfixModifierPosition: t,
  isExternal: i
}), Ke = (e) => {
  const {
    prefix: r,
    experimentalParseClassName: o
  } = e;
  let t = (i) => {
    const d = [];
    let l = 0, u = 0, b = 0, m;
    const h = i.length;
    for (let y = 0; y < h; y++) {
      const A = i[y];
      if (l === 0 && u === 0) {
        if (A === ":") {
          d.push(i.slice(b, y)), b = y + 1;
          continue;
        }
        if (A === "/") {
          m = y;
          continue;
        }
      }
      A === "[" ? l++ : A === "]" ? l-- : A === "(" ? u++ : A === ")" && u--;
    }
    const k = d.length === 0 ? i : i.slice(b);
    let T = k, S = !1;
    k.endsWith("!") ? (T = k.slice(0, -1), S = !0) : (
      /**
       * In Tailwind CSS v3 the important modifier was at the start of the base class name. This is still supported for legacy reasons.
       * @see https://github.com/dcastil/tailwind-merge/issues/513#issuecomment-2614029864
       */
      k.startsWith("!") && (T = k.slice(1), S = !0)
    );
    const B = m && m > b ? m - b : void 0;
    return ke(d, S, T, B);
  };
  if (r) {
    const i = r + ":", d = t;
    t = (l) => l.startsWith(i) ? d(l.slice(i.length)) : ke(He, !1, l, void 0, !0);
  }
  if (o) {
    const i = t;
    t = (d) => o({
      className: d,
      parseClassName: i
    });
  }
  return t;
}, Ze = (e) => {
  const r = /* @__PURE__ */ new Map();
  return e.orderSensitiveModifiers.forEach((o, t) => {
    r.set(o, 1e6 + t);
  }), (o) => {
    const t = [];
    let i = [];
    for (let d = 0; d < o.length; d++) {
      const l = o[d], u = l[0] === "[", b = r.has(l);
      u || b ? (i.length > 0 && (i.sort(), t.push(...i), i = []), t.push(l)) : i.push(l);
    }
    return i.length > 0 && (i.sort(), t.push(...i)), t;
  };
}, eo = (e) => ({
  cache: Qe(e.cacheSize),
  parseClassName: Ke(e),
  sortModifiers: Ze(e),
  postfixLookupClassGroupIds: oo(e),
  ...je(e)
}), oo = (e) => {
  const r = /* @__PURE__ */ Object.create(null), o = e.postfixLookupClassGroups;
  if (o)
    for (let t = 0; t < o.length; t++)
      r[o[t]] = !0;
  return r;
}, ro = /\s+/, to = (e, r) => {
  const {
    parseClassName: o,
    getClassGroupId: t,
    getConflictingClassGroupIds: i,
    sortModifiers: d,
    postfixLookupClassGroupIds: l
  } = r, u = [], b = e.trim().split(ro);
  let m = "";
  for (let h = b.length - 1; h >= 0; h -= 1) {
    const k = b[h], {
      isExternal: T,
      modifiers: S,
      hasImportantModifier: B,
      baseClassName: y,
      maybePostfixModifierPosition: A
    } = o(k);
    if (T) {
      m = k + (m.length > 0 ? " " + m : m);
      continue;
    }
    let L = !!A, v;
    if (L) {
      const I = y.substring(0, A);
      v = t(I);
      const a = v && l[v] ? t(y) : void 0;
      a && a !== v && (v = a, L = !1);
    } else
      v = t(y);
    if (!v) {
      if (!L) {
        m = k + (m.length > 0 ? " " + m : m);
        continue;
      }
      if (v = t(y), !v) {
        m = k + (m.length > 0 ? " " + m : m);
        continue;
      }
      L = !1;
    }
    const D = S.length === 0 ? "" : S.length === 1 ? S[0] : d(S).join(":"), _ = B ? D + "!" : D, F = _ + v;
    if (u.indexOf(F) > -1)
      continue;
    u.push(F);
    const W = i(v, L);
    for (let I = 0; I < W.length; ++I) {
      const a = W[I];
      u.push(_ + a);
    }
    m = k + (m.length > 0 ? " " + m : m);
  }
  return m;
}, so = (...e) => {
  let r = 0, o, t, i = "";
  for (; r < e.length; )
    (o = e[r++]) && (t = Re(o)) && (i && (i += " "), i += t);
  return i;
}, Re = (e) => {
  if (typeof e == "string")
    return e;
  let r, o = "";
  for (let t = 0; t < e.length; t++)
    e[t] && (r = Re(e[t])) && (o && (o += " "), o += r);
  return o;
}, xe = (e, ...r) => {
  let o, t, i, d;
  const l = (b) => {
    const m = r.reduce((h, k) => k(h), e());
    return o = eo(m), t = o.cache.get, i = o.cache.set, d = u, u(b);
  }, u = (b) => {
    const m = t(b);
    if (m)
      return m;
    const h = to(b, o);
    return i(b, h), h;
  };
  return d = l, (...b) => d(so(...b));
}, no = [], f = (e) => {
  const r = (o) => o[e] || no;
  return r.isThemeGetter = !0, r;
}, Ie = /^\[(?:(\w[\w-]*):)?(.+)\]$/i, Pe = /^\((?:(\w[\w-]*):)?(.+)\)$/i, ao = /^\d+(?:\.\d+)?\/\d+(?:\.\d+)?$/, io = /^(\d+(\.\d+)?)?(xs|sm|md|lg|xl)$/, lo = /\d+(%|px|r?em|[sdl]?v([hwib]|min|max)|pt|pc|in|cm|mm|cap|ch|ex|r?lh|cq(w|h|i|b|min|max))|\b(calc|min|max|clamp)\(.+\)|^0$/, co = /^(rgba?|hsla?|hwb|(ok)?(lab|lch)|color-mix)\(.+\)$/, mo = /^(inset_)?-?((\d+)?\.?(\d+)[a-z]+|0)_-?((\d+)?\.?(\d+)[a-z]+|0)/, po = /^(url|image|image-set|cross-fade|element|(repeating-)?(linear|radial|conic)-gradient)\(.+\)$/, G = (e) => ao.test(e), p = (e) => !!e && !Number.isNaN(Number(e)), R = (e) => !!e && Number.isInteger(Number(e)), ne = (e) => e.endsWith("%") && p(e.slice(0, -1)), P = (e) => io.test(e), Ge = () => !0, uo = (e) => (
  // `colorFunctionRegex` check is necessary because color functions can have percentages in them which which would be incorrectly classified as lengths.
  // For example, `hsl(0 0% 0%)` would be classified as a length without this check.
  // I could also use lookbehind assertion in `lengthUnitRegex` but that isn't supported widely enough.
  lo.test(e) && !co.test(e)
), le = () => !1, bo = (e) => mo.test(e), fo = (e) => po.test(e), go = (e) => !s(e) && !n(e), ho = (e) => e.startsWith("@container") && (e[10] === "/" && e[11] !== void 0 || e[11] === "s" && e[16] !== void 0 && e.startsWith("-size/", 10) || e[11] === "n" && e[18] !== void 0 && e.startsWith("-normal/", 10)), ko = (e) => M(e, Le, le), s = (e) => Ie.test(e), E = (e) => M(e, Oe, uo), we = (e) => M(e, So, p), xo = (e) => M(e, Ne, Ge), wo = (e) => M(e, Ee, le), ye = (e) => M(e, Me, le), yo = (e) => M(e, Te, fo), Q = (e) => M(e, _e, bo), n = (e) => Pe.test(e), $ = (e) => N(e, Oe), vo = (e) => N(e, Ee), ve = (e) => N(e, Me), zo = (e) => N(e, Le), Ao = (e) => N(e, Te), H = (e) => N(e, _e, !0), Co = (e) => N(e, Ne, !0), M = (e, r, o) => {
  const t = Ie.exec(e);
  return t ? t[1] ? r(t[1]) : o(t[2]) : !1;
}, N = (e, r, o = !1) => {
  const t = Pe.exec(e);
  return t ? t[1] ? r(t[1]) : o : !1;
}, Me = (e) => e === "position" || e === "percentage", Te = (e) => e === "image" || e === "url", Le = (e) => e === "length" || e === "size" || e === "bg-size", Oe = (e) => e === "length", So = (e) => e === "number", Ee = (e) => e === "family-name", Ne = (e) => e === "number" || e === "weight", _e = (e) => e === "shadow", ze = () => {
  const e = f("color"), r = f("font"), o = f("text"), t = f("font-weight"), i = f("tracking"), d = f("leading"), l = f("breakpoint"), u = f("container"), b = f("spacing"), m = f("radius"), h = f("shadow"), k = f("inset-shadow"), T = f("text-shadow"), S = f("drop-shadow"), B = f("blur"), y = f("perspective"), A = f("aspect"), L = f("ease"), v = f("animate"), D = () => ["auto", "avoid", "all", "avoid-page", "page", "left", "right", "column"], _ = () => [
    "center",
    "top",
    "bottom",
    "left",
    "right",
    "top-left",
    // Deprecated since Tailwind CSS v4.1.0, see https://github.com/tailwindlabs/tailwindcss/pull/17378
    "left-top",
    "top-right",
    // Deprecated since Tailwind CSS v4.1.0, see https://github.com/tailwindlabs/tailwindcss/pull/17378
    "right-top",
    "bottom-right",
    // Deprecated since Tailwind CSS v4.1.0, see https://github.com/tailwindlabs/tailwindcss/pull/17378
    "right-bottom",
    "bottom-left",
    // Deprecated since Tailwind CSS v4.1.0, see https://github.com/tailwindlabs/tailwindcss/pull/17378
    "left-bottom"
  ], F = () => [..._(), n, s], W = () => ["auto", "hidden", "clip", "visible", "scroll"], I = () => ["auto", "contain", "none"], a = () => [n, s, b], z = () => [G, "full", "auto", ...a()], ce = () => [R, "none", "subgrid", n, s], de = () => ["auto", {
    span: ["full", R, n, s]
  }, R, n, s], U = () => [R, "auto", n, s], me = () => ["auto", "min", "max", "fr", n, s], ee = () => ["start", "end", "center", "between", "around", "evenly", "stretch", "baseline", "center-safe", "end-safe"], V = () => ["start", "end", "center", "stretch", "center-safe", "end-safe"], C = () => ["auto", ...a()], O = () => [G, "auto", "full", "dvw", "dvh", "lvw", "lvh", "svw", "svh", "min", "max", "fit", ...a()], oe = () => [G, "screen", "full", "dvw", "lvw", "svw", "min", "max", "fit", ...a()], re = () => [G, "screen", "full", "lh", "dvh", "lvh", "svh", "min", "max", "fit", ...a()], c = () => [e, n, s], pe = () => [..._(), ve, ye, {
    position: [n, s]
  }], ue = () => ["no-repeat", {
    repeat: ["", "x", "y", "space", "round"]
  }], be = () => ["auto", "cover", "contain", zo, ko, {
    size: [n, s]
  }], te = () => [ne, $, E], x = () => [
    // Deprecated since Tailwind CSS v4.0.0
    "",
    "none",
    "full",
    m,
    n,
    s
  ], w = () => ["", p, $, E], Y = () => ["solid", "dashed", "dotted", "double"], fe = () => ["normal", "multiply", "screen", "overlay", "darken", "lighten", "color-dodge", "color-burn", "hard-light", "soft-light", "difference", "exclusion", "hue", "saturation", "color", "luminosity"], g = () => [p, ne, ve, ye], ge = () => [
    // Deprecated since Tailwind CSS v4.0.0
    "",
    "none",
    B,
    n,
    s
  ], q = () => ["none", p, n, s], X = () => ["none", p, n, s], se = () => [p, n, s], J = () => [G, "full", ...a()];
  return {
    cacheSize: 500,
    theme: {
      animate: ["spin", "ping", "pulse", "bounce"],
      aspect: ["video"],
      blur: [P],
      breakpoint: [P],
      color: [Ge],
      container: [P],
      "drop-shadow": [P],
      ease: ["in", "out", "in-out"],
      font: [go],
      "font-weight": ["thin", "extralight", "light", "normal", "medium", "semibold", "bold", "extrabold", "black"],
      "inset-shadow": [P],
      leading: ["none", "tight", "snug", "normal", "relaxed", "loose"],
      perspective: ["dramatic", "near", "normal", "midrange", "distant", "none"],
      radius: [P],
      shadow: [P],
      spacing: ["px", p],
      text: [P],
      "text-shadow": [P],
      tracking: ["tighter", "tight", "normal", "wide", "wider", "widest"]
    },
    classGroups: {
      // --------------
      // --- Layout ---
      // --------------
      /**
       * Aspect Ratio
       * @see https://tailwindcss.com/docs/aspect-ratio
       */
      aspect: [{
        aspect: ["auto", "square", G, s, n, A]
      }],
      /**
       * Container
       * @see https://tailwindcss.com/docs/container
       * @deprecated since Tailwind CSS v4.0.0
       */
      container: ["container"],
      /**
       * Container Type
       * @see https://tailwindcss.com/docs/responsive-design#container-queries
       */
      "container-type": [{
        "@container": ["", "normal", "size", n, s]
      }],
      /**
       * Container Name
       * @see https://tailwindcss.com/docs/responsive-design#named-containers
       */
      "container-named": [ho],
      /**
       * Columns
       * @see https://tailwindcss.com/docs/columns
       */
      columns: [{
        columns: [p, s, n, u]
      }],
      /**
       * Break After
       * @see https://tailwindcss.com/docs/break-after
       */
      "break-after": [{
        "break-after": D()
      }],
      /**
       * Break Before
       * @see https://tailwindcss.com/docs/break-before
       */
      "break-before": [{
        "break-before": D()
      }],
      /**
       * Break Inside
       * @see https://tailwindcss.com/docs/break-inside
       */
      "break-inside": [{
        "break-inside": ["auto", "avoid", "avoid-page", "avoid-column"]
      }],
      /**
       * Box Decoration Break
       * @see https://tailwindcss.com/docs/box-decoration-break
       */
      "box-decoration": [{
        "box-decoration": ["slice", "clone"]
      }],
      /**
       * Box Sizing
       * @see https://tailwindcss.com/docs/box-sizing
       */
      box: [{
        box: ["border", "content"]
      }],
      /**
       * Display
       * @see https://tailwindcss.com/docs/display
       */
      display: ["block", "inline-block", "inline", "flex", "inline-flex", "table", "inline-table", "table-caption", "table-cell", "table-column", "table-column-group", "table-footer-group", "table-header-group", "table-row-group", "table-row", "flow-root", "grid", "inline-grid", "contents", "list-item", "hidden"],
      /**
       * Screen Reader Only
       * @see https://tailwindcss.com/docs/display#screen-reader-only
       */
      sr: ["sr-only", "not-sr-only"],
      /**
       * Floats
       * @see https://tailwindcss.com/docs/float
       */
      float: [{
        float: ["right", "left", "none", "start", "end"]
      }],
      /**
       * Clear
       * @see https://tailwindcss.com/docs/clear
       */
      clear: [{
        clear: ["left", "right", "both", "none", "start", "end"]
      }],
      /**
       * Isolation
       * @see https://tailwindcss.com/docs/isolation
       */
      isolation: ["isolate", "isolation-auto"],
      /**
       * Object Fit
       * @see https://tailwindcss.com/docs/object-fit
       */
      "object-fit": [{
        object: ["contain", "cover", "fill", "none", "scale-down"]
      }],
      /**
       * Object Position
       * @see https://tailwindcss.com/docs/object-position
       */
      "object-position": [{
        object: F()
      }],
      /**
       * Overflow
       * @see https://tailwindcss.com/docs/overflow
       */
      overflow: [{
        overflow: W()
      }],
      /**
       * Overflow X
       * @see https://tailwindcss.com/docs/overflow
       */
      "overflow-x": [{
        "overflow-x": W()
      }],
      /**
       * Overflow Y
       * @see https://tailwindcss.com/docs/overflow
       */
      "overflow-y": [{
        "overflow-y": W()
      }],
      /**
       * Overscroll Behavior
       * @see https://tailwindcss.com/docs/overscroll-behavior
       */
      overscroll: [{
        overscroll: I()
      }],
      /**
       * Overscroll Behavior X
       * @see https://tailwindcss.com/docs/overscroll-behavior
       */
      "overscroll-x": [{
        "overscroll-x": I()
      }],
      /**
       * Overscroll Behavior Y
       * @see https://tailwindcss.com/docs/overscroll-behavior
       */
      "overscroll-y": [{
        "overscroll-y": I()
      }],
      /**
       * Position
       * @see https://tailwindcss.com/docs/position
       */
      position: ["static", "fixed", "absolute", "relative", "sticky"],
      /**
       * Inset
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      inset: [{
        inset: z()
      }],
      /**
       * Inset Inline
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      "inset-x": [{
        "inset-x": z()
      }],
      /**
       * Inset Block
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      "inset-y": [{
        "inset-y": z()
      }],
      /**
       * Inset Inline Start
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       * @todo class group will be renamed to `inset-s` in next major release
       */
      start: [{
        "inset-s": z(),
        /**
         * @deprecated since Tailwind CSS v4.2.0 in favor of `inset-s-*` utilities.
         * @see https://github.com/tailwindlabs/tailwindcss/pull/19613
         */
        start: z()
      }],
      /**
       * Inset Inline End
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       * @todo class group will be renamed to `inset-e` in next major release
       */
      end: [{
        "inset-e": z(),
        /**
         * @deprecated since Tailwind CSS v4.2.0 in favor of `inset-e-*` utilities.
         * @see https://github.com/tailwindlabs/tailwindcss/pull/19613
         */
        end: z()
      }],
      /**
       * Inset Block Start
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      "inset-bs": [{
        "inset-bs": z()
      }],
      /**
       * Inset Block End
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      "inset-be": [{
        "inset-be": z()
      }],
      /**
       * Top
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      top: [{
        top: z()
      }],
      /**
       * Right
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      right: [{
        right: z()
      }],
      /**
       * Bottom
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      bottom: [{
        bottom: z()
      }],
      /**
       * Left
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      left: [{
        left: z()
      }],
      /**
       * Visibility
       * @see https://tailwindcss.com/docs/visibility
       */
      visibility: ["visible", "invisible", "collapse"],
      /**
       * Z-Index
       * @see https://tailwindcss.com/docs/z-index
       */
      z: [{
        z: [R, "auto", n, s]
      }],
      // ------------------------
      // --- Flexbox and Grid ---
      // ------------------------
      /**
       * Flex Basis
       * @see https://tailwindcss.com/docs/flex-basis
       */
      basis: [{
        basis: [G, "full", "auto", u, ...a()]
      }],
      /**
       * Flex Direction
       * @see https://tailwindcss.com/docs/flex-direction
       */
      "flex-direction": [{
        flex: ["row", "row-reverse", "col", "col-reverse"]
      }],
      /**
       * Flex Wrap
       * @see https://tailwindcss.com/docs/flex-wrap
       */
      "flex-wrap": [{
        flex: ["nowrap", "wrap", "wrap-reverse"]
      }],
      /**
       * Flex
       * @see https://tailwindcss.com/docs/flex
       */
      flex: [{
        flex: [p, G, "auto", "initial", "none", s]
      }],
      /**
       * Flex Grow
       * @see https://tailwindcss.com/docs/flex-grow
       */
      grow: [{
        grow: ["", p, n, s]
      }],
      /**
       * Flex Shrink
       * @see https://tailwindcss.com/docs/flex-shrink
       */
      shrink: [{
        shrink: ["", p, n, s]
      }],
      /**
       * Order
       * @see https://tailwindcss.com/docs/order
       */
      order: [{
        order: [R, "first", "last", "none", n, s]
      }],
      /**
       * Grid Template Columns
       * @see https://tailwindcss.com/docs/grid-template-columns
       */
      "grid-cols": [{
        "grid-cols": ce()
      }],
      /**
       * Grid Column Start / End
       * @see https://tailwindcss.com/docs/grid-column
       */
      "col-start-end": [{
        col: de()
      }],
      /**
       * Grid Column Start
       * @see https://tailwindcss.com/docs/grid-column
       */
      "col-start": [{
        "col-start": U()
      }],
      /**
       * Grid Column End
       * @see https://tailwindcss.com/docs/grid-column
       */
      "col-end": [{
        "col-end": U()
      }],
      /**
       * Grid Template Rows
       * @see https://tailwindcss.com/docs/grid-template-rows
       */
      "grid-rows": [{
        "grid-rows": ce()
      }],
      /**
       * Grid Row Start / End
       * @see https://tailwindcss.com/docs/grid-row
       */
      "row-start-end": [{
        row: de()
      }],
      /**
       * Grid Row Start
       * @see https://tailwindcss.com/docs/grid-row
       */
      "row-start": [{
        "row-start": U()
      }],
      /**
       * Grid Row End
       * @see https://tailwindcss.com/docs/grid-row
       */
      "row-end": [{
        "row-end": U()
      }],
      /**
       * Grid Auto Flow
       * @see https://tailwindcss.com/docs/grid-auto-flow
       */
      "grid-flow": [{
        "grid-flow": ["row", "col", "dense", "row-dense", "col-dense"]
      }],
      /**
       * Grid Auto Columns
       * @see https://tailwindcss.com/docs/grid-auto-columns
       */
      "auto-cols": [{
        "auto-cols": me()
      }],
      /**
       * Grid Auto Rows
       * @see https://tailwindcss.com/docs/grid-auto-rows
       */
      "auto-rows": [{
        "auto-rows": me()
      }],
      /**
       * Gap
       * @see https://tailwindcss.com/docs/gap
       */
      gap: [{
        gap: a()
      }],
      /**
       * Gap X
       * @see https://tailwindcss.com/docs/gap
       */
      "gap-x": [{
        "gap-x": a()
      }],
      /**
       * Gap Y
       * @see https://tailwindcss.com/docs/gap
       */
      "gap-y": [{
        "gap-y": a()
      }],
      /**
       * Justify Content
       * @see https://tailwindcss.com/docs/justify-content
       */
      "justify-content": [{
        justify: [...ee(), "normal"]
      }],
      /**
       * Justify Items
       * @see https://tailwindcss.com/docs/justify-items
       */
      "justify-items": [{
        "justify-items": [...V(), "normal"]
      }],
      /**
       * Justify Self
       * @see https://tailwindcss.com/docs/justify-self
       */
      "justify-self": [{
        "justify-self": ["auto", ...V()]
      }],
      /**
       * Align Content
       * @see https://tailwindcss.com/docs/align-content
       */
      "align-content": [{
        content: ["normal", ...ee()]
      }],
      /**
       * Align Items
       * @see https://tailwindcss.com/docs/align-items
       */
      "align-items": [{
        items: [...V(), {
          baseline: ["", "last"]
        }]
      }],
      /**
       * Align Self
       * @see https://tailwindcss.com/docs/align-self
       */
      "align-self": [{
        self: ["auto", ...V(), {
          baseline: ["", "last"]
        }]
      }],
      /**
       * Place Content
       * @see https://tailwindcss.com/docs/place-content
       */
      "place-content": [{
        "place-content": ee()
      }],
      /**
       * Place Items
       * @see https://tailwindcss.com/docs/place-items
       */
      "place-items": [{
        "place-items": [...V(), "baseline"]
      }],
      /**
       * Place Self
       * @see https://tailwindcss.com/docs/place-self
       */
      "place-self": [{
        "place-self": ["auto", ...V()]
      }],
      // Spacing
      /**
       * Padding
       * @see https://tailwindcss.com/docs/padding
       */
      p: [{
        p: a()
      }],
      /**
       * Padding Inline
       * @see https://tailwindcss.com/docs/padding
       */
      px: [{
        px: a()
      }],
      /**
       * Padding Block
       * @see https://tailwindcss.com/docs/padding
       */
      py: [{
        py: a()
      }],
      /**
       * Padding Inline Start
       * @see https://tailwindcss.com/docs/padding
       */
      ps: [{
        ps: a()
      }],
      /**
       * Padding Inline End
       * @see https://tailwindcss.com/docs/padding
       */
      pe: [{
        pe: a()
      }],
      /**
       * Padding Block Start
       * @see https://tailwindcss.com/docs/padding
       */
      pbs: [{
        pbs: a()
      }],
      /**
       * Padding Block End
       * @see https://tailwindcss.com/docs/padding
       */
      pbe: [{
        pbe: a()
      }],
      /**
       * Padding Top
       * @see https://tailwindcss.com/docs/padding
       */
      pt: [{
        pt: a()
      }],
      /**
       * Padding Right
       * @see https://tailwindcss.com/docs/padding
       */
      pr: [{
        pr: a()
      }],
      /**
       * Padding Bottom
       * @see https://tailwindcss.com/docs/padding
       */
      pb: [{
        pb: a()
      }],
      /**
       * Padding Left
       * @see https://tailwindcss.com/docs/padding
       */
      pl: [{
        pl: a()
      }],
      /**
       * Margin
       * @see https://tailwindcss.com/docs/margin
       */
      m: [{
        m: C()
      }],
      /**
       * Margin Inline
       * @see https://tailwindcss.com/docs/margin
       */
      mx: [{
        mx: C()
      }],
      /**
       * Margin Block
       * @see https://tailwindcss.com/docs/margin
       */
      my: [{
        my: C()
      }],
      /**
       * Margin Inline Start
       * @see https://tailwindcss.com/docs/margin
       */
      ms: [{
        ms: C()
      }],
      /**
       * Margin Inline End
       * @see https://tailwindcss.com/docs/margin
       */
      me: [{
        me: C()
      }],
      /**
       * Margin Block Start
       * @see https://tailwindcss.com/docs/margin
       */
      mbs: [{
        mbs: C()
      }],
      /**
       * Margin Block End
       * @see https://tailwindcss.com/docs/margin
       */
      mbe: [{
        mbe: C()
      }],
      /**
       * Margin Top
       * @see https://tailwindcss.com/docs/margin
       */
      mt: [{
        mt: C()
      }],
      /**
       * Margin Right
       * @see https://tailwindcss.com/docs/margin
       */
      mr: [{
        mr: C()
      }],
      /**
       * Margin Bottom
       * @see https://tailwindcss.com/docs/margin
       */
      mb: [{
        mb: C()
      }],
      /**
       * Margin Left
       * @see https://tailwindcss.com/docs/margin
       */
      ml: [{
        ml: C()
      }],
      /**
       * Space Between X
       * @see https://tailwindcss.com/docs/margin#adding-space-between-children
       */
      "space-x": [{
        "space-x": a()
      }],
      /**
       * Space Between X Reverse
       * @see https://tailwindcss.com/docs/margin#adding-space-between-children
       */
      "space-x-reverse": ["space-x-reverse"],
      /**
       * Space Between Y
       * @see https://tailwindcss.com/docs/margin#adding-space-between-children
       */
      "space-y": [{
        "space-y": a()
      }],
      /**
       * Space Between Y Reverse
       * @see https://tailwindcss.com/docs/margin#adding-space-between-children
       */
      "space-y-reverse": ["space-y-reverse"],
      // --------------
      // --- Sizing ---
      // --------------
      /**
       * Size
       * @see https://tailwindcss.com/docs/width#setting-both-width-and-height
       */
      size: [{
        size: O()
      }],
      /**
       * Inline Size
       * @see https://tailwindcss.com/docs/width
       */
      "inline-size": [{
        inline: ["auto", ...oe()]
      }],
      /**
       * Min-Inline Size
       * @see https://tailwindcss.com/docs/min-width
       */
      "min-inline-size": [{
        "min-inline": ["auto", ...oe()]
      }],
      /**
       * Max-Inline Size
       * @see https://tailwindcss.com/docs/max-width
       */
      "max-inline-size": [{
        "max-inline": ["none", ...oe()]
      }],
      /**
       * Block Size
       * @see https://tailwindcss.com/docs/height
       */
      "block-size": [{
        block: ["auto", ...re()]
      }],
      /**
       * Min-Block Size
       * @see https://tailwindcss.com/docs/min-height
       */
      "min-block-size": [{
        "min-block": ["auto", ...re()]
      }],
      /**
       * Max-Block Size
       * @see https://tailwindcss.com/docs/max-height
       */
      "max-block-size": [{
        "max-block": ["none", ...re()]
      }],
      /**
       * Width
       * @see https://tailwindcss.com/docs/width
       */
      w: [{
        w: [u, "screen", ...O()]
      }],
      /**
       * Min-Width
       * @see https://tailwindcss.com/docs/min-width
       */
      "min-w": [{
        "min-w": [
          u,
          "screen",
          /** Deprecated. @see https://github.com/tailwindlabs/tailwindcss.com/issues/2027#issuecomment-2620152757 */
          "none",
          ...O()
        ]
      }],
      /**
       * Max-Width
       * @see https://tailwindcss.com/docs/max-width
       */
      "max-w": [{
        "max-w": [
          u,
          "screen",
          "none",
          /** Deprecated since Tailwind CSS v4.0.0. @see https://github.com/tailwindlabs/tailwindcss.com/issues/2027#issuecomment-2620152757 */
          "prose",
          /** Deprecated since Tailwind CSS v4.0.0. @see https://github.com/tailwindlabs/tailwindcss.com/issues/2027#issuecomment-2620152757 */
          {
            screen: [l]
          },
          ...O()
        ]
      }],
      /**
       * Height
       * @see https://tailwindcss.com/docs/height
       */
      h: [{
        h: ["screen", "lh", ...O()]
      }],
      /**
       * Min-Height
       * @see https://tailwindcss.com/docs/min-height
       */
      "min-h": [{
        "min-h": ["screen", "lh", "none", ...O()]
      }],
      /**
       * Max-Height
       * @see https://tailwindcss.com/docs/max-height
       */
      "max-h": [{
        "max-h": ["screen", "lh", ...O()]
      }],
      // ------------------
      // --- Typography ---
      // ------------------
      /**
       * Font Size
       * @see https://tailwindcss.com/docs/font-size
       */
      "font-size": [{
        text: ["base", o, $, E]
      }],
      /**
       * Font Smoothing
       * @see https://tailwindcss.com/docs/font-smoothing
       */
      "font-smoothing": ["antialiased", "subpixel-antialiased"],
      /**
       * Font Style
       * @see https://tailwindcss.com/docs/font-style
       */
      "font-style": ["italic", "not-italic"],
      /**
       * Font Weight
       * @see https://tailwindcss.com/docs/font-weight
       */
      "font-weight": [{
        font: [t, Co, xo]
      }],
      /**
       * Font Stretch
       * @see https://tailwindcss.com/docs/font-stretch
       */
      "font-stretch": [{
        "font-stretch": ["ultra-condensed", "extra-condensed", "condensed", "semi-condensed", "normal", "semi-expanded", "expanded", "extra-expanded", "ultra-expanded", ne, s]
      }],
      /**
       * Font Family
       * @see https://tailwindcss.com/docs/font-family
       */
      "font-family": [{
        font: [vo, wo, r]
      }],
      /**
       * Font Feature Settings
       * @see https://tailwindcss.com/docs/font-feature-settings
       */
      "font-features": [{
        "font-features": [s]
      }],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      "fvn-normal": ["normal-nums"],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      "fvn-ordinal": ["ordinal"],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      "fvn-slashed-zero": ["slashed-zero"],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      "fvn-figure": ["lining-nums", "oldstyle-nums"],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      "fvn-spacing": ["proportional-nums", "tabular-nums"],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      "fvn-fraction": ["diagonal-fractions", "stacked-fractions"],
      /**
       * Letter Spacing
       * @see https://tailwindcss.com/docs/letter-spacing
       */
      tracking: [{
        tracking: [i, n, s]
      }],
      /**
       * Line Clamp
       * @see https://tailwindcss.com/docs/line-clamp
       */
      "line-clamp": [{
        "line-clamp": [p, "none", n, we]
      }],
      /**
       * Line Height
       * @see https://tailwindcss.com/docs/line-height
       */
      leading: [{
        leading: [
          /** Deprecated since Tailwind CSS v4.0.0. @see https://github.com/tailwindlabs/tailwindcss.com/issues/2027#issuecomment-2620152757 */
          d,
          ...a()
        ]
      }],
      /**
       * List Style Image
       * @see https://tailwindcss.com/docs/list-style-image
       */
      "list-image": [{
        "list-image": ["none", n, s]
      }],
      /**
       * List Style Position
       * @see https://tailwindcss.com/docs/list-style-position
       */
      "list-style-position": [{
        list: ["inside", "outside"]
      }],
      /**
       * List Style Type
       * @see https://tailwindcss.com/docs/list-style-type
       */
      "list-style-type": [{
        list: ["disc", "decimal", "none", n, s]
      }],
      /**
       * Text Alignment
       * @see https://tailwindcss.com/docs/text-align
       */
      "text-alignment": [{
        text: ["left", "center", "right", "justify", "start", "end"]
      }],
      /**
       * Placeholder Color
       * @deprecated since Tailwind CSS v3.0.0
       * @see https://v3.tailwindcss.com/docs/placeholder-color
       */
      "placeholder-color": [{
        placeholder: c()
      }],
      /**
       * Text Color
       * @see https://tailwindcss.com/docs/text-color
       */
      "text-color": [{
        text: c()
      }],
      /**
       * Text Decoration
       * @see https://tailwindcss.com/docs/text-decoration
       */
      "text-decoration": ["underline", "overline", "line-through", "no-underline"],
      /**
       * Text Decoration Style
       * @see https://tailwindcss.com/docs/text-decoration-style
       */
      "text-decoration-style": [{
        decoration: [...Y(), "wavy"]
      }],
      /**
       * Text Decoration Thickness
       * @see https://tailwindcss.com/docs/text-decoration-thickness
       */
      "text-decoration-thickness": [{
        decoration: [p, "from-font", "auto", n, E]
      }],
      /**
       * Text Decoration Color
       * @see https://tailwindcss.com/docs/text-decoration-color
       */
      "text-decoration-color": [{
        decoration: c()
      }],
      /**
       * Text Underline Offset
       * @see https://tailwindcss.com/docs/text-underline-offset
       */
      "underline-offset": [{
        "underline-offset": [p, "auto", n, s]
      }],
      /**
       * Text Transform
       * @see https://tailwindcss.com/docs/text-transform
       */
      "text-transform": ["uppercase", "lowercase", "capitalize", "normal-case"],
      /**
       * Text Overflow
       * @see https://tailwindcss.com/docs/text-overflow
       */
      "text-overflow": ["truncate", "text-ellipsis", "text-clip"],
      /**
       * Text Wrap
       * @see https://tailwindcss.com/docs/text-wrap
       */
      "text-wrap": [{
        text: ["wrap", "nowrap", "balance", "pretty"]
      }],
      /**
       * Text Indent
       * @see https://tailwindcss.com/docs/text-indent
       */
      indent: [{
        indent: a()
      }],
      /**
       * Tab Size
       * @see https://tailwindcss.com/docs/tab-size
       */
      "tab-size": [{
        tab: [R, n, s]
      }],
      /**
       * Vertical Alignment
       * @see https://tailwindcss.com/docs/vertical-align
       */
      "vertical-align": [{
        align: ["baseline", "top", "middle", "bottom", "text-top", "text-bottom", "sub", "super", n, s]
      }],
      /**
       * Whitespace
       * @see https://tailwindcss.com/docs/whitespace
       */
      whitespace: [{
        whitespace: ["normal", "nowrap", "pre", "pre-line", "pre-wrap", "break-spaces"]
      }],
      /**
       * Word Break
       * @see https://tailwindcss.com/docs/word-break
       */
      break: [{
        break: ["normal", "words", "all", "keep"]
      }],
      /**
       * Overflow Wrap
       * @see https://tailwindcss.com/docs/overflow-wrap
       */
      wrap: [{
        wrap: ["break-word", "anywhere", "normal"]
      }],
      /**
       * Hyphens
       * @see https://tailwindcss.com/docs/hyphens
       */
      hyphens: [{
        hyphens: ["none", "manual", "auto"]
      }],
      /**
       * Content
       * @see https://tailwindcss.com/docs/content
       */
      content: [{
        content: ["none", n, s]
      }],
      // -------------------
      // --- Backgrounds ---
      // -------------------
      /**
       * Background Attachment
       * @see https://tailwindcss.com/docs/background-attachment
       */
      "bg-attachment": [{
        bg: ["fixed", "local", "scroll"]
      }],
      /**
       * Background Clip
       * @see https://tailwindcss.com/docs/background-clip
       */
      "bg-clip": [{
        "bg-clip": ["border", "padding", "content", "text"]
      }],
      /**
       * Background Origin
       * @see https://tailwindcss.com/docs/background-origin
       */
      "bg-origin": [{
        "bg-origin": ["border", "padding", "content"]
      }],
      /**
       * Background Position
       * @see https://tailwindcss.com/docs/background-position
       */
      "bg-position": [{
        bg: pe()
      }],
      /**
       * Background Repeat
       * @see https://tailwindcss.com/docs/background-repeat
       */
      "bg-repeat": [{
        bg: ue()
      }],
      /**
       * Background Size
       * @see https://tailwindcss.com/docs/background-size
       */
      "bg-size": [{
        bg: be()
      }],
      /**
       * Background Image
       * @see https://tailwindcss.com/docs/background-image
       */
      "bg-image": [{
        bg: ["none", {
          linear: [{
            to: ["t", "tr", "r", "br", "b", "bl", "l", "tl"]
          }, R, n, s],
          radial: ["", n, s],
          conic: [R, n, s]
        }, Ao, yo]
      }],
      /**
       * Background Color
       * @see https://tailwindcss.com/docs/background-color
       */
      "bg-color": [{
        bg: c()
      }],
      /**
       * Gradient Color Stops From Position
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-from-pos": [{
        from: te()
      }],
      /**
       * Gradient Color Stops Via Position
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-via-pos": [{
        via: te()
      }],
      /**
       * Gradient Color Stops To Position
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-to-pos": [{
        to: te()
      }],
      /**
       * Gradient Color Stops From
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-from": [{
        from: c()
      }],
      /**
       * Gradient Color Stops Via
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-via": [{
        via: c()
      }],
      /**
       * Gradient Color Stops To
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-to": [{
        to: c()
      }],
      // ---------------
      // --- Borders ---
      // ---------------
      /**
       * Border Radius
       * @see https://tailwindcss.com/docs/border-radius
       */
      rounded: [{
        rounded: x()
      }],
      /**
       * Border Radius Start
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-s": [{
        "rounded-s": x()
      }],
      /**
       * Border Radius End
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-e": [{
        "rounded-e": x()
      }],
      /**
       * Border Radius Top
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-t": [{
        "rounded-t": x()
      }],
      /**
       * Border Radius Right
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-r": [{
        "rounded-r": x()
      }],
      /**
       * Border Radius Bottom
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-b": [{
        "rounded-b": x()
      }],
      /**
       * Border Radius Left
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-l": [{
        "rounded-l": x()
      }],
      /**
       * Border Radius Start Start
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-ss": [{
        "rounded-ss": x()
      }],
      /**
       * Border Radius Start End
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-se": [{
        "rounded-se": x()
      }],
      /**
       * Border Radius End End
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-ee": [{
        "rounded-ee": x()
      }],
      /**
       * Border Radius End Start
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-es": [{
        "rounded-es": x()
      }],
      /**
       * Border Radius Top Left
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-tl": [{
        "rounded-tl": x()
      }],
      /**
       * Border Radius Top Right
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-tr": [{
        "rounded-tr": x()
      }],
      /**
       * Border Radius Bottom Right
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-br": [{
        "rounded-br": x()
      }],
      /**
       * Border Radius Bottom Left
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-bl": [{
        "rounded-bl": x()
      }],
      /**
       * Border Width
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w": [{
        border: w()
      }],
      /**
       * Border Width Inline
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-x": [{
        "border-x": w()
      }],
      /**
       * Border Width Block
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-y": [{
        "border-y": w()
      }],
      /**
       * Border Width Inline Start
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-s": [{
        "border-s": w()
      }],
      /**
       * Border Width Inline End
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-e": [{
        "border-e": w()
      }],
      /**
       * Border Width Block Start
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-bs": [{
        "border-bs": w()
      }],
      /**
       * Border Width Block End
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-be": [{
        "border-be": w()
      }],
      /**
       * Border Width Top
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-t": [{
        "border-t": w()
      }],
      /**
       * Border Width Right
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-r": [{
        "border-r": w()
      }],
      /**
       * Border Width Bottom
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-b": [{
        "border-b": w()
      }],
      /**
       * Border Width Left
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-l": [{
        "border-l": w()
      }],
      /**
       * Divide Width X
       * @see https://tailwindcss.com/docs/border-width#between-children
       */
      "divide-x": [{
        "divide-x": w()
      }],
      /**
       * Divide Width X Reverse
       * @see https://tailwindcss.com/docs/border-width#between-children
       */
      "divide-x-reverse": ["divide-x-reverse"],
      /**
       * Divide Width Y
       * @see https://tailwindcss.com/docs/border-width#between-children
       */
      "divide-y": [{
        "divide-y": w()
      }],
      /**
       * Divide Width Y Reverse
       * @see https://tailwindcss.com/docs/border-width#between-children
       */
      "divide-y-reverse": ["divide-y-reverse"],
      /**
       * Border Style
       * @see https://tailwindcss.com/docs/border-style
       */
      "border-style": [{
        border: [...Y(), "hidden", "none"]
      }],
      /**
       * Divide Style
       * @see https://tailwindcss.com/docs/border-style#setting-the-divider-style
       */
      "divide-style": [{
        divide: [...Y(), "hidden", "none"]
      }],
      /**
       * Border Color
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color": [{
        border: c()
      }],
      /**
       * Border Color Inline
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-x": [{
        "border-x": c()
      }],
      /**
       * Border Color Block
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-y": [{
        "border-y": c()
      }],
      /**
       * Border Color Inline Start
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-s": [{
        "border-s": c()
      }],
      /**
       * Border Color Inline End
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-e": [{
        "border-e": c()
      }],
      /**
       * Border Color Block Start
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-bs": [{
        "border-bs": c()
      }],
      /**
       * Border Color Block End
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-be": [{
        "border-be": c()
      }],
      /**
       * Border Color Top
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-t": [{
        "border-t": c()
      }],
      /**
       * Border Color Right
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-r": [{
        "border-r": c()
      }],
      /**
       * Border Color Bottom
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-b": [{
        "border-b": c()
      }],
      /**
       * Border Color Left
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-l": [{
        "border-l": c()
      }],
      /**
       * Divide Color
       * @see https://tailwindcss.com/docs/divide-color
       */
      "divide-color": [{
        divide: c()
      }],
      /**
       * Outline Style
       * @see https://tailwindcss.com/docs/outline-style
       */
      "outline-style": [{
        outline: [...Y(), "none", "hidden"]
      }],
      /**
       * Outline Offset
       * @see https://tailwindcss.com/docs/outline-offset
       */
      "outline-offset": [{
        "outline-offset": [p, n, s]
      }],
      /**
       * Outline Width
       * @see https://tailwindcss.com/docs/outline-width
       */
      "outline-w": [{
        outline: ["", p, $, E]
      }],
      /**
       * Outline Color
       * @see https://tailwindcss.com/docs/outline-color
       */
      "outline-color": [{
        outline: c()
      }],
      // ---------------
      // --- Effects ---
      // ---------------
      /**
       * Box Shadow
       * @see https://tailwindcss.com/docs/box-shadow
       */
      shadow: [{
        shadow: [
          // Deprecated since Tailwind CSS v4.0.0
          "",
          "none",
          h,
          H,
          Q
        ]
      }],
      /**
       * Box Shadow Color
       * @see https://tailwindcss.com/docs/box-shadow#setting-the-shadow-color
       */
      "shadow-color": [{
        shadow: c()
      }],
      /**
       * Inset Box Shadow
       * @see https://tailwindcss.com/docs/box-shadow#adding-an-inset-shadow
       */
      "inset-shadow": [{
        "inset-shadow": ["none", k, H, Q]
      }],
      /**
       * Inset Box Shadow Color
       * @see https://tailwindcss.com/docs/box-shadow#setting-the-inset-shadow-color
       */
      "inset-shadow-color": [{
        "inset-shadow": c()
      }],
      /**
       * Ring Width
       * @see https://tailwindcss.com/docs/box-shadow#adding-a-ring
       */
      "ring-w": [{
        ring: w()
      }],
      /**
       * Ring Width Inset
       * @see https://v3.tailwindcss.com/docs/ring-width#inset-rings
       * @deprecated since Tailwind CSS v4.0.0
       * @see https://github.com/tailwindlabs/tailwindcss/blob/v4.0.0/packages/tailwindcss/src/utilities.ts#L4158
       */
      "ring-w-inset": ["ring-inset"],
      /**
       * Ring Color
       * @see https://tailwindcss.com/docs/box-shadow#setting-the-ring-color
       */
      "ring-color": [{
        ring: c()
      }],
      /**
       * Ring Offset Width
       * @see https://v3.tailwindcss.com/docs/ring-offset-width
       * @deprecated since Tailwind CSS v4.0.0
       * @see https://github.com/tailwindlabs/tailwindcss/blob/v4.0.0/packages/tailwindcss/src/utilities.ts#L4158
       */
      "ring-offset-w": [{
        "ring-offset": [p, E]
      }],
      /**
       * Ring Offset Color
       * @see https://v3.tailwindcss.com/docs/ring-offset-color
       * @deprecated since Tailwind CSS v4.0.0
       * @see https://github.com/tailwindlabs/tailwindcss/blob/v4.0.0/packages/tailwindcss/src/utilities.ts#L4158
       */
      "ring-offset-color": [{
        "ring-offset": c()
      }],
      /**
       * Inset Ring Width
       * @see https://tailwindcss.com/docs/box-shadow#adding-an-inset-ring
       */
      "inset-ring-w": [{
        "inset-ring": w()
      }],
      /**
       * Inset Ring Color
       * @see https://tailwindcss.com/docs/box-shadow#setting-the-inset-ring-color
       */
      "inset-ring-color": [{
        "inset-ring": c()
      }],
      /**
       * Text Shadow
       * @see https://tailwindcss.com/docs/text-shadow
       */
      "text-shadow": [{
        "text-shadow": ["none", T, H, Q]
      }],
      /**
       * Text Shadow Color
       * @see https://tailwindcss.com/docs/text-shadow#setting-the-shadow-color
       */
      "text-shadow-color": [{
        "text-shadow": c()
      }],
      /**
       * Opacity
       * @see https://tailwindcss.com/docs/opacity
       */
      opacity: [{
        opacity: [p, n, s]
      }],
      /**
       * Mix Blend Mode
       * @see https://tailwindcss.com/docs/mix-blend-mode
       */
      "mix-blend": [{
        "mix-blend": [...fe(), "plus-darker", "plus-lighter"]
      }],
      /**
       * Background Blend Mode
       * @see https://tailwindcss.com/docs/background-blend-mode
       */
      "bg-blend": [{
        "bg-blend": fe()
      }],
      /**
       * Mask Clip
       * @see https://tailwindcss.com/docs/mask-clip
       */
      "mask-clip": [{
        "mask-clip": ["border", "padding", "content", "fill", "stroke", "view"]
      }, "mask-no-clip"],
      /**
       * Mask Composite
       * @see https://tailwindcss.com/docs/mask-composite
       */
      "mask-composite": [{
        mask: ["add", "subtract", "intersect", "exclude"]
      }],
      /**
       * Mask Image
       * @see https://tailwindcss.com/docs/mask-image
       */
      "mask-image-linear-pos": [{
        "mask-linear": [p]
      }],
      "mask-image-linear-from-pos": [{
        "mask-linear-from": g()
      }],
      "mask-image-linear-to-pos": [{
        "mask-linear-to": g()
      }],
      "mask-image-linear-from-color": [{
        "mask-linear-from": c()
      }],
      "mask-image-linear-to-color": [{
        "mask-linear-to": c()
      }],
      "mask-image-t-from-pos": [{
        "mask-t-from": g()
      }],
      "mask-image-t-to-pos": [{
        "mask-t-to": g()
      }],
      "mask-image-t-from-color": [{
        "mask-t-from": c()
      }],
      "mask-image-t-to-color": [{
        "mask-t-to": c()
      }],
      "mask-image-r-from-pos": [{
        "mask-r-from": g()
      }],
      "mask-image-r-to-pos": [{
        "mask-r-to": g()
      }],
      "mask-image-r-from-color": [{
        "mask-r-from": c()
      }],
      "mask-image-r-to-color": [{
        "mask-r-to": c()
      }],
      "mask-image-b-from-pos": [{
        "mask-b-from": g()
      }],
      "mask-image-b-to-pos": [{
        "mask-b-to": g()
      }],
      "mask-image-b-from-color": [{
        "mask-b-from": c()
      }],
      "mask-image-b-to-color": [{
        "mask-b-to": c()
      }],
      "mask-image-l-from-pos": [{
        "mask-l-from": g()
      }],
      "mask-image-l-to-pos": [{
        "mask-l-to": g()
      }],
      "mask-image-l-from-color": [{
        "mask-l-from": c()
      }],
      "mask-image-l-to-color": [{
        "mask-l-to": c()
      }],
      "mask-image-x-from-pos": [{
        "mask-x-from": g()
      }],
      "mask-image-x-to-pos": [{
        "mask-x-to": g()
      }],
      "mask-image-x-from-color": [{
        "mask-x-from": c()
      }],
      "mask-image-x-to-color": [{
        "mask-x-to": c()
      }],
      "mask-image-y-from-pos": [{
        "mask-y-from": g()
      }],
      "mask-image-y-to-pos": [{
        "mask-y-to": g()
      }],
      "mask-image-y-from-color": [{
        "mask-y-from": c()
      }],
      "mask-image-y-to-color": [{
        "mask-y-to": c()
      }],
      "mask-image-radial": [{
        "mask-radial": [n, s]
      }],
      "mask-image-radial-from-pos": [{
        "mask-radial-from": g()
      }],
      "mask-image-radial-to-pos": [{
        "mask-radial-to": g()
      }],
      "mask-image-radial-from-color": [{
        "mask-radial-from": c()
      }],
      "mask-image-radial-to-color": [{
        "mask-radial-to": c()
      }],
      "mask-image-radial-shape": [{
        "mask-radial": ["circle", "ellipse"]
      }],
      "mask-image-radial-size": [{
        "mask-radial": [{
          closest: ["side", "corner"],
          farthest: ["side", "corner"]
        }]
      }],
      "mask-image-radial-pos": [{
        "mask-radial-at": _()
      }],
      "mask-image-conic-pos": [{
        "mask-conic": [p]
      }],
      "mask-image-conic-from-pos": [{
        "mask-conic-from": g()
      }],
      "mask-image-conic-to-pos": [{
        "mask-conic-to": g()
      }],
      "mask-image-conic-from-color": [{
        "mask-conic-from": c()
      }],
      "mask-image-conic-to-color": [{
        "mask-conic-to": c()
      }],
      /**
       * Mask Mode
       * @see https://tailwindcss.com/docs/mask-mode
       */
      "mask-mode": [{
        mask: ["alpha", "luminance", "match"]
      }],
      /**
       * Mask Origin
       * @see https://tailwindcss.com/docs/mask-origin
       */
      "mask-origin": [{
        "mask-origin": ["border", "padding", "content", "fill", "stroke", "view"]
      }],
      /**
       * Mask Position
       * @see https://tailwindcss.com/docs/mask-position
       */
      "mask-position": [{
        mask: pe()
      }],
      /**
       * Mask Repeat
       * @see https://tailwindcss.com/docs/mask-repeat
       */
      "mask-repeat": [{
        mask: ue()
      }],
      /**
       * Mask Size
       * @see https://tailwindcss.com/docs/mask-size
       */
      "mask-size": [{
        mask: be()
      }],
      /**
       * Mask Type
       * @see https://tailwindcss.com/docs/mask-type
       */
      "mask-type": [{
        "mask-type": ["alpha", "luminance"]
      }],
      /**
       * Mask Image
       * @see https://tailwindcss.com/docs/mask-image
       */
      "mask-image": [{
        mask: ["none", n, s]
      }],
      // ---------------
      // --- Filters ---
      // ---------------
      /**
       * Filter
       * @see https://tailwindcss.com/docs/filter
       */
      filter: [{
        filter: [
          // Deprecated since Tailwind CSS v3.0.0
          "",
          "none",
          n,
          s
        ]
      }],
      /**
       * Blur
       * @see https://tailwindcss.com/docs/blur
       */
      blur: [{
        blur: ge()
      }],
      /**
       * Brightness
       * @see https://tailwindcss.com/docs/brightness
       */
      brightness: [{
        brightness: [p, n, s]
      }],
      /**
       * Contrast
       * @see https://tailwindcss.com/docs/contrast
       */
      contrast: [{
        contrast: [p, n, s]
      }],
      /**
       * Drop Shadow
       * @see https://tailwindcss.com/docs/drop-shadow
       */
      "drop-shadow": [{
        "drop-shadow": [
          // Deprecated since Tailwind CSS v4.0.0
          "",
          "none",
          S,
          H,
          Q
        ]
      }],
      /**
       * Drop Shadow Color
       * @see https://tailwindcss.com/docs/filter-drop-shadow#setting-the-shadow-color
       */
      "drop-shadow-color": [{
        "drop-shadow": c()
      }],
      /**
       * Grayscale
       * @see https://tailwindcss.com/docs/grayscale
       */
      grayscale: [{
        grayscale: ["", p, n, s]
      }],
      /**
       * Hue Rotate
       * @see https://tailwindcss.com/docs/hue-rotate
       */
      "hue-rotate": [{
        "hue-rotate": [p, n, s]
      }],
      /**
       * Invert
       * @see https://tailwindcss.com/docs/invert
       */
      invert: [{
        invert: ["", p, n, s]
      }],
      /**
       * Saturate
       * @see https://tailwindcss.com/docs/saturate
       */
      saturate: [{
        saturate: [p, n, s]
      }],
      /**
       * Sepia
       * @see https://tailwindcss.com/docs/sepia
       */
      sepia: [{
        sepia: ["", p, n, s]
      }],
      /**
       * Backdrop Filter
       * @see https://tailwindcss.com/docs/backdrop-filter
       */
      "backdrop-filter": [{
        "backdrop-filter": [
          // Deprecated since Tailwind CSS v3.0.0
          "",
          "none",
          n,
          s
        ]
      }],
      /**
       * Backdrop Blur
       * @see https://tailwindcss.com/docs/backdrop-blur
       */
      "backdrop-blur": [{
        "backdrop-blur": ge()
      }],
      /**
       * Backdrop Brightness
       * @see https://tailwindcss.com/docs/backdrop-brightness
       */
      "backdrop-brightness": [{
        "backdrop-brightness": [p, n, s]
      }],
      /**
       * Backdrop Contrast
       * @see https://tailwindcss.com/docs/backdrop-contrast
       */
      "backdrop-contrast": [{
        "backdrop-contrast": [p, n, s]
      }],
      /**
       * Backdrop Grayscale
       * @see https://tailwindcss.com/docs/backdrop-grayscale
       */
      "backdrop-grayscale": [{
        "backdrop-grayscale": ["", p, n, s]
      }],
      /**
       * Backdrop Hue Rotate
       * @see https://tailwindcss.com/docs/backdrop-hue-rotate
       */
      "backdrop-hue-rotate": [{
        "backdrop-hue-rotate": [p, n, s]
      }],
      /**
       * Backdrop Invert
       * @see https://tailwindcss.com/docs/backdrop-invert
       */
      "backdrop-invert": [{
        "backdrop-invert": ["", p, n, s]
      }],
      /**
       * Backdrop Opacity
       * @see https://tailwindcss.com/docs/backdrop-opacity
       */
      "backdrop-opacity": [{
        "backdrop-opacity": [p, n, s]
      }],
      /**
       * Backdrop Saturate
       * @see https://tailwindcss.com/docs/backdrop-saturate
       */
      "backdrop-saturate": [{
        "backdrop-saturate": [p, n, s]
      }],
      /**
       * Backdrop Sepia
       * @see https://tailwindcss.com/docs/backdrop-sepia
       */
      "backdrop-sepia": [{
        "backdrop-sepia": ["", p, n, s]
      }],
      // --------------
      // --- Tables ---
      // --------------
      /**
       * Border Collapse
       * @see https://tailwindcss.com/docs/border-collapse
       */
      "border-collapse": [{
        border: ["collapse", "separate"]
      }],
      /**
       * Border Spacing
       * @see https://tailwindcss.com/docs/border-spacing
       */
      "border-spacing": [{
        "border-spacing": a()
      }],
      /**
       * Border Spacing X
       * @see https://tailwindcss.com/docs/border-spacing
       */
      "border-spacing-x": [{
        "border-spacing-x": a()
      }],
      /**
       * Border Spacing Y
       * @see https://tailwindcss.com/docs/border-spacing
       */
      "border-spacing-y": [{
        "border-spacing-y": a()
      }],
      /**
       * Table Layout
       * @see https://tailwindcss.com/docs/table-layout
       */
      "table-layout": [{
        table: ["auto", "fixed"]
      }],
      /**
       * Caption Side
       * @see https://tailwindcss.com/docs/caption-side
       */
      caption: [{
        caption: ["top", "bottom"]
      }],
      // ---------------------------------
      // --- Transitions and Animation ---
      // ---------------------------------
      /**
       * Transition Property
       * @see https://tailwindcss.com/docs/transition-property
       */
      transition: [{
        transition: ["", "all", "colors", "opacity", "shadow", "transform", "none", n, s]
      }],
      /**
       * Transition Behavior
       * @see https://tailwindcss.com/docs/transition-behavior
       */
      "transition-behavior": [{
        transition: ["normal", "discrete"]
      }],
      /**
       * Transition Duration
       * @see https://tailwindcss.com/docs/transition-duration
       */
      duration: [{
        duration: [p, "initial", n, s]
      }],
      /**
       * Transition Timing Function
       * @see https://tailwindcss.com/docs/transition-timing-function
       */
      ease: [{
        ease: ["linear", "initial", L, n, s]
      }],
      /**
       * Transition Delay
       * @see https://tailwindcss.com/docs/transition-delay
       */
      delay: [{
        delay: [p, n, s]
      }],
      /**
       * Animation
       * @see https://tailwindcss.com/docs/animation
       */
      animate: [{
        animate: ["none", v, n, s]
      }],
      // ------------------
      // --- Transforms ---
      // ------------------
      /**
       * Backface Visibility
       * @see https://tailwindcss.com/docs/backface-visibility
       */
      backface: [{
        backface: ["hidden", "visible"]
      }],
      /**
       * Perspective
       * @see https://tailwindcss.com/docs/perspective
       */
      perspective: [{
        perspective: [y, n, s]
      }],
      /**
       * Perspective Origin
       * @see https://tailwindcss.com/docs/perspective-origin
       */
      "perspective-origin": [{
        "perspective-origin": F()
      }],
      /**
       * Rotate
       * @see https://tailwindcss.com/docs/rotate
       */
      rotate: [{
        rotate: q()
      }],
      /**
       * Rotate X
       * @see https://tailwindcss.com/docs/rotate
       */
      "rotate-x": [{
        "rotate-x": q()
      }],
      /**
       * Rotate Y
       * @see https://tailwindcss.com/docs/rotate
       */
      "rotate-y": [{
        "rotate-y": q()
      }],
      /**
       * Rotate Z
       * @see https://tailwindcss.com/docs/rotate
       */
      "rotate-z": [{
        "rotate-z": q()
      }],
      /**
       * Scale
       * @see https://tailwindcss.com/docs/scale
       */
      scale: [{
        scale: X()
      }],
      /**
       * Scale X
       * @see https://tailwindcss.com/docs/scale
       */
      "scale-x": [{
        "scale-x": X()
      }],
      /**
       * Scale Y
       * @see https://tailwindcss.com/docs/scale
       */
      "scale-y": [{
        "scale-y": X()
      }],
      /**
       * Scale Z
       * @see https://tailwindcss.com/docs/scale
       */
      "scale-z": [{
        "scale-z": X()
      }],
      /**
       * Scale 3D
       * @see https://tailwindcss.com/docs/scale
       */
      "scale-3d": ["scale-3d"],
      /**
       * Skew
       * @see https://tailwindcss.com/docs/skew
       */
      skew: [{
        skew: se()
      }],
      /**
       * Skew X
       * @see https://tailwindcss.com/docs/skew
       */
      "skew-x": [{
        "skew-x": se()
      }],
      /**
       * Skew Y
       * @see https://tailwindcss.com/docs/skew
       */
      "skew-y": [{
        "skew-y": se()
      }],
      /**
       * Transform
       * @see https://tailwindcss.com/docs/transform
       */
      transform: [{
        transform: [n, s, "", "none", "gpu", "cpu"]
      }],
      /**
       * Transform Origin
       * @see https://tailwindcss.com/docs/transform-origin
       */
      "transform-origin": [{
        origin: F()
      }],
      /**
       * Transform Style
       * @see https://tailwindcss.com/docs/transform-style
       */
      "transform-style": [{
        transform: ["3d", "flat"]
      }],
      /**
       * Translate
       * @see https://tailwindcss.com/docs/translate
       */
      translate: [{
        translate: J()
      }],
      /**
       * Translate X
       * @see https://tailwindcss.com/docs/translate
       */
      "translate-x": [{
        "translate-x": J()
      }],
      /**
       * Translate Y
       * @see https://tailwindcss.com/docs/translate
       */
      "translate-y": [{
        "translate-y": J()
      }],
      /**
       * Translate Z
       * @see https://tailwindcss.com/docs/translate
       */
      "translate-z": [{
        "translate-z": J()
      }],
      /**
       * Translate None
       * @see https://tailwindcss.com/docs/translate
       */
      "translate-none": ["translate-none"],
      /**
       * Zoom
       * @see https://tailwindcss.com/docs/zoom
       */
      zoom: [{
        zoom: [R, n, s]
      }],
      // ---------------------
      // --- Interactivity ---
      // ---------------------
      /**
       * Accent Color
       * @see https://tailwindcss.com/docs/accent-color
       */
      accent: [{
        accent: c()
      }],
      /**
       * Appearance
       * @see https://tailwindcss.com/docs/appearance
       */
      appearance: [{
        appearance: ["none", "auto"]
      }],
      /**
       * Caret Color
       * @see https://tailwindcss.com/docs/just-in-time-mode#caret-color-utilities
       */
      "caret-color": [{
        caret: c()
      }],
      /**
       * Color Scheme
       * @see https://tailwindcss.com/docs/color-scheme
       */
      "color-scheme": [{
        scheme: ["normal", "dark", "light", "light-dark", "only-dark", "only-light"]
      }],
      /**
       * Cursor
       * @see https://tailwindcss.com/docs/cursor
       */
      cursor: [{
        cursor: ["auto", "default", "pointer", "wait", "text", "move", "help", "not-allowed", "none", "context-menu", "progress", "cell", "crosshair", "vertical-text", "alias", "copy", "no-drop", "grab", "grabbing", "all-scroll", "col-resize", "row-resize", "n-resize", "e-resize", "s-resize", "w-resize", "ne-resize", "nw-resize", "se-resize", "sw-resize", "ew-resize", "ns-resize", "nesw-resize", "nwse-resize", "zoom-in", "zoom-out", n, s]
      }],
      /**
       * Field Sizing
       * @see https://tailwindcss.com/docs/field-sizing
       */
      "field-sizing": [{
        "field-sizing": ["fixed", "content"]
      }],
      /**
       * Pointer Events
       * @see https://tailwindcss.com/docs/pointer-events
       */
      "pointer-events": [{
        "pointer-events": ["auto", "none"]
      }],
      /**
       * Resize
       * @see https://tailwindcss.com/docs/resize
       */
      resize: [{
        resize: ["none", "", "y", "x"]
      }],
      /**
       * Scroll Behavior
       * @see https://tailwindcss.com/docs/scroll-behavior
       */
      "scroll-behavior": [{
        scroll: ["auto", "smooth"]
      }],
      /**
       * Scrollbar Thumb Color
       * @see https://tailwindcss.com/docs/scrollbar-color
       */
      "scrollbar-thumb-color": [{
        "scrollbar-thumb": c()
      }],
      /**
       * Scrollbar Track Color
       * @see https://tailwindcss.com/docs/scrollbar-color
       */
      "scrollbar-track-color": [{
        "scrollbar-track": c()
      }],
      /**
       * Scrollbar Gutter
       * @see https://tailwindcss.com/docs/scrollbar-gutter
       */
      "scrollbar-gutter": [{
        "scrollbar-gutter": ["auto", "stable", "both"]
      }],
      /**
       * Scrollbar Width
       * @see https://tailwindcss.com/docs/scrollbar-width
       */
      "scrollbar-w": [{
        scrollbar: ["auto", "thin", "none"]
      }],
      /**
       * Scroll Margin
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-m": [{
        "scroll-m": a()
      }],
      /**
       * Scroll Margin Inline
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-mx": [{
        "scroll-mx": a()
      }],
      /**
       * Scroll Margin Block
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-my": [{
        "scroll-my": a()
      }],
      /**
       * Scroll Margin Inline Start
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-ms": [{
        "scroll-ms": a()
      }],
      /**
       * Scroll Margin Inline End
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-me": [{
        "scroll-me": a()
      }],
      /**
       * Scroll Margin Block Start
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-mbs": [{
        "scroll-mbs": a()
      }],
      /**
       * Scroll Margin Block End
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-mbe": [{
        "scroll-mbe": a()
      }],
      /**
       * Scroll Margin Top
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-mt": [{
        "scroll-mt": a()
      }],
      /**
       * Scroll Margin Right
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-mr": [{
        "scroll-mr": a()
      }],
      /**
       * Scroll Margin Bottom
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-mb": [{
        "scroll-mb": a()
      }],
      /**
       * Scroll Margin Left
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-ml": [{
        "scroll-ml": a()
      }],
      /**
       * Scroll Padding
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-p": [{
        "scroll-p": a()
      }],
      /**
       * Scroll Padding Inline
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-px": [{
        "scroll-px": a()
      }],
      /**
       * Scroll Padding Block
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-py": [{
        "scroll-py": a()
      }],
      /**
       * Scroll Padding Inline Start
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-ps": [{
        "scroll-ps": a()
      }],
      /**
       * Scroll Padding Inline End
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pe": [{
        "scroll-pe": a()
      }],
      /**
       * Scroll Padding Block Start
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pbs": [{
        "scroll-pbs": a()
      }],
      /**
       * Scroll Padding Block End
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pbe": [{
        "scroll-pbe": a()
      }],
      /**
       * Scroll Padding Top
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pt": [{
        "scroll-pt": a()
      }],
      /**
       * Scroll Padding Right
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pr": [{
        "scroll-pr": a()
      }],
      /**
       * Scroll Padding Bottom
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pb": [{
        "scroll-pb": a()
      }],
      /**
       * Scroll Padding Left
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pl": [{
        "scroll-pl": a()
      }],
      /**
       * Scroll Snap Align
       * @see https://tailwindcss.com/docs/scroll-snap-align
       */
      "snap-align": [{
        snap: ["start", "end", "center", "align-none"]
      }],
      /**
       * Scroll Snap Stop
       * @see https://tailwindcss.com/docs/scroll-snap-stop
       */
      "snap-stop": [{
        snap: ["normal", "always"]
      }],
      /**
       * Scroll Snap Type
       * @see https://tailwindcss.com/docs/scroll-snap-type
       */
      "snap-type": [{
        snap: ["none", "x", "y", "both"]
      }],
      /**
       * Scroll Snap Type Strictness
       * @see https://tailwindcss.com/docs/scroll-snap-type
       */
      "snap-strictness": [{
        snap: ["mandatory", "proximity"]
      }],
      /**
       * Touch Action
       * @see https://tailwindcss.com/docs/touch-action
       */
      touch: [{
        touch: ["auto", "none", "manipulation"]
      }],
      /**
       * Touch Action X
       * @see https://tailwindcss.com/docs/touch-action
       */
      "touch-x": [{
        "touch-pan": ["x", "left", "right"]
      }],
      /**
       * Touch Action Y
       * @see https://tailwindcss.com/docs/touch-action
       */
      "touch-y": [{
        "touch-pan": ["y", "up", "down"]
      }],
      /**
       * Touch Action Pinch Zoom
       * @see https://tailwindcss.com/docs/touch-action
       */
      "touch-pz": ["touch-pinch-zoom"],
      /**
       * User Select
       * @see https://tailwindcss.com/docs/user-select
       */
      select: [{
        select: ["none", "text", "all", "auto"]
      }],
      /**
       * Will Change
       * @see https://tailwindcss.com/docs/will-change
       */
      "will-change": [{
        "will-change": ["auto", "scroll", "contents", "transform", n, s]
      }],
      // -----------
      // --- SVG ---
      // -----------
      /**
       * Fill
       * @see https://tailwindcss.com/docs/fill
       */
      fill: [{
        fill: ["none", ...c()]
      }],
      /**
       * Stroke Width
       * @see https://tailwindcss.com/docs/stroke-width
       */
      "stroke-w": [{
        stroke: [p, $, E, we]
      }],
      /**
       * Stroke
       * @see https://tailwindcss.com/docs/stroke
       */
      stroke: [{
        stroke: ["none", ...c()]
      }],
      // ---------------------
      // --- Accessibility ---
      // ---------------------
      /**
       * Forced Color Adjust
       * @see https://tailwindcss.com/docs/forced-color-adjust
       */
      "forced-color-adjust": [{
        "forced-color-adjust": ["auto", "none"]
      }]
    },
    conflictingClassGroups: {
      "container-named": ["container-type"],
      overflow: ["overflow-x", "overflow-y"],
      overscroll: ["overscroll-x", "overscroll-y"],
      inset: ["inset-x", "inset-y", "inset-bs", "inset-be", "start", "end", "top", "right", "bottom", "left"],
      "inset-x": ["right", "left"],
      "inset-y": ["top", "bottom"],
      flex: ["basis", "grow", "shrink"],
      gap: ["gap-x", "gap-y"],
      p: ["px", "py", "ps", "pe", "pbs", "pbe", "pt", "pr", "pb", "pl"],
      px: ["pr", "pl"],
      py: ["pt", "pb"],
      m: ["mx", "my", "ms", "me", "mbs", "mbe", "mt", "mr", "mb", "ml"],
      mx: ["mr", "ml"],
      my: ["mt", "mb"],
      size: ["w", "h"],
      "font-size": ["leading"],
      "fvn-normal": ["fvn-ordinal", "fvn-slashed-zero", "fvn-figure", "fvn-spacing", "fvn-fraction"],
      "fvn-ordinal": ["fvn-normal"],
      "fvn-slashed-zero": ["fvn-normal"],
      "fvn-figure": ["fvn-normal"],
      "fvn-spacing": ["fvn-normal"],
      "fvn-fraction": ["fvn-normal"],
      "line-clamp": ["display", "overflow"],
      rounded: ["rounded-s", "rounded-e", "rounded-t", "rounded-r", "rounded-b", "rounded-l", "rounded-ss", "rounded-se", "rounded-ee", "rounded-es", "rounded-tl", "rounded-tr", "rounded-br", "rounded-bl"],
      "rounded-s": ["rounded-ss", "rounded-es"],
      "rounded-e": ["rounded-se", "rounded-ee"],
      "rounded-t": ["rounded-tl", "rounded-tr"],
      "rounded-r": ["rounded-tr", "rounded-br"],
      "rounded-b": ["rounded-br", "rounded-bl"],
      "rounded-l": ["rounded-tl", "rounded-bl"],
      "border-spacing": ["border-spacing-x", "border-spacing-y"],
      "border-w": ["border-w-x", "border-w-y", "border-w-s", "border-w-e", "border-w-bs", "border-w-be", "border-w-t", "border-w-r", "border-w-b", "border-w-l"],
      "border-w-x": ["border-w-r", "border-w-l"],
      "border-w-y": ["border-w-t", "border-w-b"],
      "border-color": ["border-color-x", "border-color-y", "border-color-s", "border-color-e", "border-color-bs", "border-color-be", "border-color-t", "border-color-r", "border-color-b", "border-color-l"],
      "border-color-x": ["border-color-r", "border-color-l"],
      "border-color-y": ["border-color-t", "border-color-b"],
      translate: ["translate-x", "translate-y", "translate-none"],
      "translate-none": ["translate", "translate-x", "translate-y", "translate-z"],
      "scroll-m": ["scroll-mx", "scroll-my", "scroll-ms", "scroll-me", "scroll-mbs", "scroll-mbe", "scroll-mt", "scroll-mr", "scroll-mb", "scroll-ml"],
      "scroll-mx": ["scroll-mr", "scroll-ml"],
      "scroll-my": ["scroll-mt", "scroll-mb"],
      "scroll-p": ["scroll-px", "scroll-py", "scroll-ps", "scroll-pe", "scroll-pbs", "scroll-pbe", "scroll-pt", "scroll-pr", "scroll-pb", "scroll-pl"],
      "scroll-px": ["scroll-pr", "scroll-pl"],
      "scroll-py": ["scroll-pt", "scroll-pb"],
      touch: ["touch-x", "touch-y", "touch-pz"],
      "touch-x": ["touch"],
      "touch-y": ["touch"],
      "touch-pz": ["touch"]
    },
    conflictingClassGroupModifiers: {
      "font-size": ["leading"]
    },
    postfixLookupClassGroups: ["container-type"],
    orderSensitiveModifiers: ["*", "**", "after", "backdrop", "before", "details-content", "file", "first-letter", "first-line", "marker", "placeholder", "selection"]
  };
}, Ro = (e, {
  cacheSize: r,
  prefix: o,
  experimentalParseClassName: t,
  extend: i = {},
  override: d = {}
}) => (j(e, "cacheSize", r), j(e, "prefix", o), j(e, "experimentalParseClassName", t), K(e.theme, d.theme), K(e.classGroups, d.classGroups), K(e.conflictingClassGroups, d.conflictingClassGroups), K(e.conflictingClassGroupModifiers, d.conflictingClassGroupModifiers), j(e, "postfixLookupClassGroups", d.postfixLookupClassGroups), j(e, "orderSensitiveModifiers", d.orderSensitiveModifiers), Z(e.theme, i.theme), Z(e.classGroups, i.classGroups), Z(e.conflictingClassGroups, i.conflictingClassGroups), Z(e.conflictingClassGroupModifiers, i.conflictingClassGroupModifiers), ae(e, i, "postfixLookupClassGroups"), ae(e, i, "orderSensitiveModifiers"), e), j = (e, r, o) => {
  o !== void 0 && (e[r] = o);
}, K = (e, r) => {
  if (r)
    for (const o in r)
      j(e, o, r[o]);
}, Z = (e, r) => {
  if (r)
    for (const o in r)
      ae(e, r, o);
}, ae = (e, r, o) => {
  const t = r[o];
  t !== void 0 && (e[o] = e[o] ? e[o].concat(t) : t);
}, Io = (e, ...r) => typeof e == "function" ? xe(ze, e, ...r) : xe(() => Ro(ze(), e), ...r);
export {
  xe as createTailwindMerge,
  Io as extendTailwindMerge,
  f as fromTheme,
  ze as getDefaultConfig,
  Ro as mergeConfigs,
  so as twJoin
};
//# sourceMappingURL=index146.js.map
