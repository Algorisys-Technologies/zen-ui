import { jsx as S, jsxs as ke, Fragment as kt } from "react/jsx-runtime";
import * as l from "react";
import { useSortable as Lt } from "./index246.js";
import { CSS as Dt } from "./index247.js";
import { useVirtualizer as zt } from "./index244.js";
import { cellKeyTarget as Tt, ownsArrowKeys as Mt, rowKeyTarget as At } from "./index166.js";
import { clampRange as ot, rangeRect as Nt, inRect as rt, pastePlan as Ft, parseTsv as Bt, toTsv as Ht } from "./index464.js";
import { columnCellClass as Pe } from "./index250.js";
import { TableBody as Kt, TableRow as le, TableCell as se, Table as Pt } from "./index104.js";
import { EditableCell as it } from "./index252.js";
import { useLocale as Vt } from "./index90.js";
import { cn as Ie } from "./index199.js";
import { defaultRangeExtractor as qt, measureElement as Ot } from "./index301.js";
const $t = l.createContext(null), st = (v, A) => `${v}\0${A}`, ce = { row: 0, col: 0 };
function rn(v) {
  const A = Vt(), {
    table: R,
    loading: X,
    emptyMessage: P,
    colSpan: V,
    sepCellClass: q,
    pinStyle: M,
    editingCell: D,
    startEdit: Z,
    commitEdit: ee,
    cancelEdit: ae,
    rowClassName: ue,
    renderCell: F,
    expansionEnabled: J,
    renderSubRow: B,
    rowOrderingActive: de,
    keyboard: k,
    selectable: Y,
    onRowActivate: f,
    rowLabel: w,
    cellNav: y,
    virtualize: x,
    rowDrag: z,
    menuTargets: _
  } = v, Ve = R.getRowModel(), ct = R.getState().rowPinning, C = l.useMemo(
    () => v.rowPinning ? [...R.getTopRows(), ...R.getCenterRows(), ...R.getBottomRows()] : Ve.rows,
    // eslint-disable-next-line react-hooks/exhaustive-deps -- getTopRows / getCenterRows / getBottomRows are TanStack memos over exactly these two
    [v.rowPinning, Ve, ct]
  ), H = l.useRef(null), [K, lt] = l.useState(null), at = l.useCallback((e) => {
    H.current = e, lt(e);
  }, []), Le = l.useMemo(() => new Map(C.map((e, t) => [e.id, t])), [C]), ut = R.getAllLeafColumns().length, fe = l.useMemo(() => {
    if (!x) return [];
    const e = [];
    for (const t of C)
      e.push({ kind: "row", row: t }), J && B && t.getIsExpanded() && !t.getIsGrouped() && e.push({ kind: "sub", row: t });
    return e;
  }, [x, C, J, B]), te = l.useMemo(() => {
    const e = /* @__PURE__ */ new Map();
    return fe.forEach((t, n) => t.kind === "row" && e.set(t.row.id, n)), e;
  }, [fe]), ne = l.useRef(null), [dt, De] = l.useState(0), ze = Math.min(dt, Math.max(C.length - 1, 0)), oe = l.useRef(/* @__PURE__ */ new Map()), Te = l.useRef(null), ft = (e) => {
    const t = H.current, n = oe.current.get(e), r = t?.parentElement;
    if (!n || !r || document.activeElement !== n) return;
    const d = t?.tHead?.getBoundingClientRect().bottom ?? r.getBoundingClientRect().top, a = r.getBoundingClientRect().top + r.clientHeight, u = n.getBoundingClientRect();
    u.top < d ? r.scrollTop -= d - u.top : u.bottom > a && (r.scrollTop += u.bottom - a);
  }, me = l.useRef(te);
  me.current = te;
  const Me = (e) => {
    const t = ne.current;
    if (!t) {
      oe.current.get(e)?.focus();
      return;
    }
    const n = me.current.get(e);
    n !== void 0 && t.scrollToItem(n);
    const r = oe.current.get(e);
    r ? r.focus({ preventScroll: !0 }) : Te.current = e, requestAnimationFrame(() => requestAnimationFrame(() => ft(e)));
  }, mt = (e, t, n) => {
    if (e.altKey || Mt(e.target)) return;
    const r = e.target === e.currentTarget, d = At(e.key, n, C.length);
    if (d !== null) {
      e.preventDefault();
      const a = C[d];
      if (!a) return;
      De(d), Me(a.id);
      return;
    }
    r && (e.key === "Enter" && f ? (e.preventDefault(), f(t, e)) : e.key === " " && Y && t.getCanSelect() ? (e.preventDefault(), t.toggleSelected()) : (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "a" && Y && (e.preventDefault(), R.toggleAllPageRowsSelected(!R.getIsAllPageRowsSelected())));
  }, qe = R.getVisibleLeafColumns(), U = l.useMemo(
    () => y ? qe.filter((e) => !e.id.startsWith("__")) : [],
    // eslint-disable-next-line react-hooks/exhaustive-deps -- the visible columns, by identity of their ids
    [y, qe.map((e) => e.id).join("\0")]
  ), Ae = l.useMemo(() => new Map(U.map((e, t) => [e.id, t])), [U]), [Oe, gt] = l.useState(ce), [$e, pt] = l.useState({ anchor: ce, focus: ce }), Ge = l.useRef(Oe), Ne = l.useRef($e), je = (e) => {
    Ge.current = e, gt(e);
  }, O = (e) => {
    Ne.current = e, pt(e);
  }, We = (e, t, n) => ot({ anchor: e, focus: e }, t, n)?.anchor ?? ce, Je = (e, t, n) => {
    const r = ot(e, t, n);
    return r ? Nt(r) : null;
  }, ge = We(Oe, C.length, U.length), $ = Je($e, C.length, U.length), vt = !!$ && ($.top !== $.bottom || $.left !== $.right), pe = l.useRef(/* @__PURE__ */ new Map()), Fe = l.useRef(null), Be = (e) => {
    const t = H.current, n = pe.current.get(e), r = t?.parentElement;
    if (!n || !r || document.activeElement !== n) return;
    const d = r.getBoundingClientRect(), a = n.getBoundingClientRect();
    if (r.scrollHeight > r.clientHeight) {
      const u = t?.tHead?.getBoundingClientRect().bottom ?? d.top, g = d.top + r.clientHeight;
      a.top < u ? r.scrollTop -= u - a.top : a.bottom > g && (r.scrollTop += a.bottom - g);
    } else (a.top < 0 || a.bottom > window.innerHeight) && n.scrollIntoView({ block: "nearest" });
    if (r.scrollWidth > r.clientWidth && getComputedStyle(n).position !== "sticky") {
      let u = d.left, g = d.left + r.clientWidth;
      for (const T of Array.from(n.parentElement?.children ?? [])) {
        if (T === n || getComputedStyle(T).position !== "sticky") continue;
        const L = T.getBoundingClientRect();
        L.right <= a.left + 1 ? u = Math.max(u, L.right) : L.left >= a.right - 1 && (g = Math.min(g, L.left));
      }
      a.left < u ? r.scrollLeft -= u - a.left : a.right > g && (r.scrollLeft += a.right - g);
    }
  }, ve = l.useRef({ rows: C, navCols: U, navColIndex: Ae, rowIndex: Le, editingCell: D, props: v });
  ve.current = { rows: C, navCols: U, navColIndex: Ae, rowIndex: Le, editingCell: D, props: v };
  const he = (e, t) => {
    if (e.getIsGrouped()) return !1;
    const n = t.columnDef.meta;
    return typeof n?.editable == "function" ? n.editable(e.original) : !!n?.editable;
  }, I = l.useRef(null);
  {
    const e = () => ve.current, t = () => e().rows.length, n = () => e().navCols.length, r = () => We(Ge.current, t(), n()), d = () => Je(Ne.current, t(), n()), a = (o) => {
      const i = o?.closest?.("td[data-col]");
      if (!i || !H.current?.contains(i)) return null;
      const s = e().rowIndex.get(i.dataset.row ?? "") ?? -1, c = e().navColIndex.get(i.dataset.col ?? "");
      return s < 0 || c === void 0 ? null : { td: i, at: { row: s, col: c } };
    }, u = (o) => {
      const i = e().rows[o.row], s = e().navCols[o.col];
      if (!i || !s) return;
      const c = st(i.id, s.id), m = ne.current;
      if (m) {
        const h = me.current.get(i.id);
        h !== void 0 && m.scrollToItem(h);
      }
      const p = pe.current.get(c);
      p ? p.focus({ preventScroll: !0 }) : Fe.current = c, Be(c), requestAnimationFrame(() => requestAnimationFrame(() => Be(c)));
    }, g = (o) => {
      je(o), O({ anchor: o, focus: o }), u(o);
    }, T = (o) => {
      O({ anchor: r(), focus: o });
      const i = e().rows[o.row], s = ne.current;
      if (s && i) {
        const c = me.current.get(i.id);
        c !== void 0 && s.scrollToItem(c);
      }
    }, L = (o, i) => {
      const s = o.getValue(i.id);
      return s == null ? "" : s instanceof Date ? s.toISOString() : typeof s == "object" ? JSON.stringify(s) : String(s);
    }, N = (o, i, s) => {
      if (!he(o, i)) return null;
      const c = i.columnDef.meta;
      if (c?.editVariant === "number") {
        const m = s.trim();
        if (m === "") return { value: null };
        const p = Number(m.replace(/[,\s]/g, ""));
        return Number.isFinite(p) ? { value: p } : null;
      }
      if (c?.editVariant === "select") {
        const m = c.editOptions ?? [], p = m.find((h) => h.value === s) ?? m.find((h) => h.label.toLowerCase() === s.trim().toLowerCase());
        return p ? { value: p.value } : null;
      }
      return { value: s };
    }, G = (o, i) => {
      const s = [];
      for (let c = o.top; c <= o.bottom; c++) {
        const m = e().rows[c];
        if (m)
          for (let p = o.left; p <= o.right; p++) {
            const h = e().navCols[p];
            if (!h) continue;
            const b = N(m, h, i(c, p));
            b && s.push({ rowId: m.id, columnId: h.id, value: b.value });
          }
      }
      return s;
    }, Q = (o) => setTimeout(() => g(o)), Ee = (o) => {
      const i = a(o.target);
      if (!i) return;
      const { td: s, at: c } = i;
      if (o.target !== s) {
        if (!e().editingCell) return;
        o.key === "Escape" ? Q(c) : o.key === "Enter" && !o.shiftKey ? Q({ row: Math.min(c.row + 1, t() - 1), col: c.col }) : o.key === "Tab" && (o.preventDefault(), g({ row: c.row, col: Math.min(Math.max(c.col + (o.shiftKey ? -1 : 1), 0), n() - 1) }));
        return;
      }
      if (o.altKey) return;
      const m = o.ctrlKey || o.metaKey, p = getComputedStyle(s).direction === "rtl", h = p && o.key === "ArrowLeft" ? "ArrowRight" : p && o.key === "ArrowRight" ? "ArrowLeft" : o.key, b = Tt(h, o.shiftKey ? Ne.current.focus : c, t(), n(), m);
      if (b) {
        o.preventDefault(), o.shiftKey ? T(b) : g(b);
        return;
      }
      const j = e().rows[c.row], ie = e().navCols[c.col];
      if (!j || !ie) return;
      const W = d(), It = !!W && (W.top !== W.bottom || W.left !== W.right);
      m && h.toLowerCase() === "a" ? (o.preventDefault(), O({ anchor: ce, focus: { row: t() - 1, col: n() - 1 } })) : h === "Escape" && It ? (o.preventDefault(), O({ anchor: c, focus: c })) : (h === "Enter" || h === "F2") && he(j, ie) ? (o.preventDefault(), e().props.startEdit(j.id, ie.id)) : (h === "Delete" || h === "Backspace") && W ? (o.preventDefault(), e().props.editCells?.(G(W, () => ""))) : h.length === 1 && !m && he(j, ie) && (o.preventDefault(), e().props.startEdit(j.id, ie.id, h));
    }, Re = (o) => {
      const i = a(o.target);
      if (!i || e().editingCell) return;
      const s = e().rows[i.at.row], c = e().navCols[i.at.col];
      s && c && he(s, c) && e().props.startEdit(s.id, c.id);
    }, Ce = (o) => {
      if (o.button !== 0) return;
      const i = a(o.target);
      if (!i || e().editingCell && i.td.contains(document.activeElement) && document.activeElement !== i.td) return;
      if (o.shiftKey) {
        o.preventDefault(), T(i.at);
        return;
      }
      je(i.at), O({ anchor: i.at, focus: i.at }), I.current?.stop?.();
      const s = H.current;
      if (!s) return;
      const c = s.style.userSelect, m = (h) => {
        const b = a(h.target);
        b && (s.style.userSelect = "none", O({ anchor: r(), focus: b.at }));
      }, p = () => {
        s.removeEventListener("pointerover", m), window.removeEventListener("pointerup", p), window.removeEventListener("pointercancel", p), s.style.userSelect = c, I.current && (I.current.stop = void 0);
      };
      s.addEventListener("pointerover", m), window.addEventListener("pointerup", p), window.addEventListener("pointercancel", p), I.current && (I.current.stop = p);
    }, Se = (o) => {
      if (e().editingCell || !a(document.activeElement)) return;
      const i = d();
      if (!i || !o.clipboardData) return;
      const s = [];
      for (let c = i.top; c <= i.bottom; c++) {
        const m = e().rows[c];
        if (!m) continue;
        const p = [];
        for (let h = i.left; h <= i.right; h++) {
          const b = e().navCols[h];
          p.push(b ? L(m, b) : "");
        }
        s.push(p);
      }
      o.clipboardData.setData("text/plain", Ht(s)), o.preventDefault();
    }, xe = (o) => {
      if (e().editingCell || !a(document.activeElement)) return;
      const i = o.clipboardData?.getData("text/plain"), s = d();
      if (!i || !s) return;
      o.preventDefault();
      const c = Ft(Bt(i), s, t(), n());
      if (c.length === 0) return;
      const m = new Map(c.map((b) => [`${b.row}:${b.col}`, b.value])), p = Math.max(...c.map((b) => b.row)), h = Math.max(...c.map((b) => b.col));
      e().props.editCells?.(G({ top: s.top, left: s.left, bottom: p, right: h }, (b, j) => m.get(`${b}:${j}`) ?? "")), O({ anchor: { row: s.top, col: s.left }, focus: { row: p, col: h } });
    }, E = (o) => {
      const i = o.target?.closest?.("tr[data-row-id]");
      if (!i || !H.current?.contains(i)) return;
      const s = i.dataset.rowId ?? "", c = e().rowIndex.get(s) ?? -1;
      if (!(c < 0))
        if (e().props.cellNav) {
          const m = a(o.target), p = d();
          m && !(p && rt(p, m.at.row, m.at.col)) && g(m.at);
        } else e().props.keyboard && (De(c), Me(s));
    };
    I.current = { keydown: Ee, dblclick: Re, pointerdown: Ce, copy: Se, paste: xe, focusCell: u, contextmenu: E, stop: I.current?.stop };
  }
  l.useEffect(() => {
    const e = H.current;
    if (!y || !e) return;
    const t = (u) => I.current?.keydown(u), n = (u) => I.current?.dblclick(u), r = (u) => I.current?.pointerdown(u), d = (u) => I.current?.copy(u), a = (u) => I.current?.paste(u);
    return e.addEventListener("keydown", t, !0), e.addEventListener("dblclick", n), e.addEventListener("pointerdown", r), e.addEventListener("copy", d), e.addEventListener("paste", a), () => {
      e.removeEventListener("keydown", t, !0), e.removeEventListener("dblclick", n), e.removeEventListener("pointerdown", r), e.removeEventListener("copy", d), e.removeEventListener("paste", a), I.current?.stop?.();
    };
  }, [y]), l.useEffect(() => {
    const e = K;
    if (!_ || !e) return;
    const t = (n) => I.current?.contextmenu(n);
    return e.addEventListener("contextmenu", t), () => e.removeEventListener("contextmenu", t);
  }, [_, K]);
  const re = l.useRef(!1), Ye = l.useRef(() => {
  });
  Ye.current = () => {
    if (y) I.current?.focusCell(ge);
    else {
      const e = C[ze];
      e && Me(e.id);
    }
  }, l.useEffect(() => {
    const e = H.current;
    if (!(k || y) || !e) return;
    const t = () => re.current = !0, n = (r) => {
      const d = r.relatedTarget;
      if (d) {
        e.contains(d) || (re.current = !1);
        return;
      }
      const a = r.target;
      setTimeout(() => {
        const u = document.activeElement;
        a.isConnected && (!u || u === document.body) && (re.current = !1);
      });
    };
    return e.addEventListener("focusin", t), e.addEventListener("focusout", n), () => {
      e.removeEventListener("focusin", t), e.removeEventListener("focusout", n);
    };
  }, [k, y]), l.useEffect(() => {
    if (!re.current) return;
    const e = setTimeout(() => {
      const t = document.activeElement;
      !re.current || t && t !== document.body || Ye.current();
    });
    return () => clearTimeout(e);
  }, [C]);
  const [we, _e] = l.useState(null), [He, ht] = l.useState(null), Ue = l.useRef(null), be = l.useRef(void 0);
  l.useEffect(() => () => be.current?.(), []);
  const Qe = (e, t) => {
    const n = H.current, r = n?.parentElement, d = ne.current;
    if (t.button !== 0 || !d || !r) return;
    t.preventDefault(), be.current?.();
    const a = (E) => {
      Ue.current = E, ht(E);
    };
    let u = t.clientY, g = 0;
    const T = () => {
      const E = r.getBoundingClientRect(), o = n?.tHead?.getBoundingClientRect().bottom ?? E.top;
      return { rect: E, top: o, bottom: E.top + r.clientHeight };
    }, L = () => {
      const { rect: E, top: o, bottom: i } = T(), s = Math.min(Math.max(u, o), i - 1), c = r.scrollTop + (s - E.top), m = d.itemAt(c);
      m && a(c > (m.start + m.end) / 2 ? m.index + 1 : m.index);
    }, N = 40, G = () => {
      const { top: E, bottom: o } = T(), i = u < E + N ? u - (E + N) : u > o - N ? u - (o - N) : 0;
      i && (r.scrollTop += Math.max(-200, Math.min(200, Math.round(i / 3) || Math.sign(i))), L()), g = requestAnimationFrame(G);
    }, Q = (E) => {
      const o = ve.current.rowIndex.get(e), i = Ue.current;
      if (xe(), !E || o === void 0 || i === null) return;
      const s = i > o ? i - 1 : i;
      s !== o && ve.current.props.onRowMove?.(o, s);
    }, Ee = (E) => {
      u = E.clientY, L();
    }, Re = () => Q(!0), Ce = () => Q(!1), Se = (E) => {
      E.key === "Escape" && (E.preventDefault(), E.stopPropagation(), Q(!1));
    }, xe = () => {
      cancelAnimationFrame(g), window.removeEventListener("pointermove", Ee), window.removeEventListener("pointerup", Re), window.removeEventListener("pointercancel", Ce), window.removeEventListener("keydown", Se, !0), _e(null), a(null), be.current = void 0;
    };
    window.addEventListener("pointermove", Ee), window.addEventListener("pointerup", Re), window.addEventListener("pointercancel", Ce), window.addEventListener("keydown", Se, !0), be.current = xe, _e(e), L(), g = requestAnimationFrame(G);
  }, Xe = (e) => {
    if (He !== null)
      return He === e ? "before" : He === C.length && e === C.length - 1 ? "after" : void 0;
  }, wt = (e) => {
    const t = Xe(e);
    return t ? { boxShadow: `inset 0 ${t === "before" ? 2 : -2}px 0 0 var(--zen-color-primary)` } : void 0;
  }, Ze = l.useRef(Qe);
  Ze.current = Qe;
  const bt = l.useMemo(
    () => ({ active: !!z, start: (e, t) => Ze.current(e, t) }),
    [z]
  ), ye = [];
  if (x) {
    const e = C[y ? ge.row : ze];
    (k || y) && e && ye.push(te.get(e.id) ?? -1), D && ye.push(te.get(D.rowId) ?? -1), we !== null && ye.push(te.get(we) ?? -1);
  }
  const yt = ye.filter((e) => e >= 0).join(","), Et = (e) => (t) => {
    if (!t) {
      pe.current.delete(e);
      return;
    }
    pe.current.set(e, t), Fe.current === e && (Fe.current = null, queueMicrotask(() => {
      t.focus({ preventScroll: !0 }), Be(e);
    }));
  }, Rt = (e, t) => e.getVisibleCells().map((n) => {
    const r = M(n.column), d = D?.rowId === e.id && D?.columnId === n.column.id, a = !n.getIsGrouped() && !n.getIsAggregated() && !n.getIsPlaceholder(), u = F(n), g = y ? Ae.get(n.column.id) : void 0, T = g !== void 0 && t === ge.row && g === ge.col, L = g !== void 0 && !!$ && vt && rt($, t, g);
    let N = z ? { ...r, ...wt(t) } : r;
    return r && L && (N = { ...N, background: "var(--zen-color-primary-soft)" }), /* @__PURE__ */ S(
      se,
      {
        ref: g !== void 0 ? Et(st(e.id, n.column.id)) : void 0,
        className: g === void 0 ? Ie(q, Pe(n.column.columnDef.meta, e)) : Ie(
          q,
          Pe(n.column.columnDef.meta, e),
          "focus:zen-outline focus:zen-outline-2 focus:-zen-outline-offset-2 focus:zen-outline-zen-ring",
          L && "zen-bg-zen-primary-soft"
        ),
        style: N,
        role: y ? "gridcell" : void 0,
        tabIndex: g === void 0 ? void 0 : T ? 0 : -1,
        "aria-selected": g !== void 0 ? L || T ? "true" : "false" : void 0,
        "data-row": g !== void 0 ? e.id : void 0,
        "data-col": g !== void 0 ? n.column.id : void 0,
        "data-column": _ ? n.column.id : void 0,
        children: a ? /* @__PURE__ */ S(
          it,
          {
            cell: n,
            editing: d,
            onStartEdit: () => Z(e.id, n.column.id),
            onCommit: (G) => ee(e.id, n.column.id, G),
            onCancel: ae,
            navigable: g !== void 0,
            seed: d ? D?.seed : void 0,
            children: u
          }
        ) : u
      },
      n.id
    );
  }), [Ke, Ct] = l.useState({
    head: 0,
    foot: 0,
    rows: {}
  }), St = v.rowPinning ? [...R.getTopRows(), ...R.getBottomRows()].map((e) => e.id).join("\0") : "";
  l.useLayoutEffect(() => {
    if (!v.rowPinning || !K || typeof ResizeObserver > "u") return;
    const e = () => {
      const n = K.querySelector("thead")?.getBoundingClientRect().height ?? 0, r = K.querySelector("tfoot")?.getBoundingClientRect().height ?? 0, d = {};
      K.querySelectorAll("tr[data-pinned-row]").forEach((a) => {
        d[a.dataset.pinnedRow] = a.getBoundingClientRect().height;
      }), Ct(
        (a) => a.head === n && a.foot === r && JSON.stringify(a.rows) === JSON.stringify(d) ? a : { head: n, foot: r, rows: d }
      );
    }, t = new ResizeObserver(e);
    return K.querySelectorAll("thead, tfoot, tr[data-pinned-row]").forEach((n) => t.observe(n)), e(), () => t.disconnect();
  }, [v.rowPinning, K, St]);
  const xt = (e) => {
    if (!v.rowPinning || !v.stickyHeaderActive) return;
    const t = e.getIsPinned();
    if (!t) return;
    const n = t === "top" ? R.getTopRows() : R.getBottomRows(), r = n.findIndex((g) => g.id === e.id), d = t === "top" ? n.slice(0, r) : n.slice(r + 1);
    let a = 0;
    for (const g of d) a += Ke.rows[g.id] ?? 0;
    const u = a + (t === "top" ? Ke.head : v.footerSticky ? Ke.foot : 0);
    return {
      position: "sticky",
      ...t === "top" ? { top: `${u}px` } : { bottom: `${u}px` },
      zIndex: 5,
      background: "var(--zen-color-background)"
    };
  }, et = (e, t, n) => /* @__PURE__ */ S(
    le,
    {
      ref: k || n ? (r) => {
        if (n?.measure(r), !!k) {
          if (!r) {
            oe.current.delete(e.id);
            return;
          }
          oe.current.set(e.id, r), Te.current === e.id && (Te.current = null, queueMicrotask(() => r.focus({ preventScroll: !0 })));
        }
      } : void 0,
      "data-index": n?.index,
      "data-pinned-row": v.rowPinning && e.getIsPinned() ? e.id : void 0,
      style: xt(e),
      "aria-rowindex": n ? (v.headerRowCount ?? 1) + n.index + 1 : void 0,
      "data-dragging": z && we === e.id ? "true" : void 0,
      "data-row-id": _ ? e.id : void 0,
      "data-drop": z ? Xe(t) : void 0,
      tabIndex: k ? t === ze ? 0 : -1 : void 0,
      "aria-label": k ? w?.(e) : void 0,
      "aria-selected": k && Y ? e.getIsSelected() ? "true" : "false" : void 0,
      onKeyDown: k ? (r) => mt(r, e, t) : void 0,
      onFocus: k ? () => De(t) : void 0,
      "data-state": e.getIsSelected() ? "selected" : void 0,
      "data-grouped": e.getIsGrouped() ? "true" : void 0,
      className: Ie(
        e.getIsGrouped() && "zen-bg-zen-muted zen-font-medium",
        z && we === e.id && "zen-opacity-50",
        k && "focus-visible:zen-outline focus-visible:zen-outline-2 focus-visible:-zen-outline-offset-2 focus-visible:zen-outline-zen-ring",
        ue?.(e)
      ),
      children: Rt(e, t)
    },
    n ? `row:${e.id}` : void 0
  ), tt = (e, t) => /* @__PURE__ */ S(
    le,
    {
      ref: t?.measure,
      "data-expanded-of": e.id,
      "data-index": t?.index,
      "aria-rowindex": t ? (v.headerRowCount ?? 1) + t.index + 1 : void 0,
      children: /* @__PURE__ */ S(se, { colSpan: e.getVisibleCells().length, className: "zen-p-0 zen-bg-zen-muted", children: B(e) })
    },
    t ? `sub:${e.id}` : void 0
  ), nt = /* @__PURE__ */ S(Kt, { children: X ? /* @__PURE__ */ S(le, { children: /* @__PURE__ */ S(se, { colSpan: V, className: "zen-text-center zen-text-zen-muted-fg zen-py-6", children: A.t("dataTable.loading") }) }) : C.length === 0 ? /* @__PURE__ */ S(le, { children: /* @__PURE__ */ S(se, { colSpan: V, className: "zen-text-center zen-text-zen-muted-fg zen-py-6", children: P }) }) : x ? /* @__PURE__ */ S(
    Gt,
    {
      items: fe,
      tableEl: K,
      estimatedRowHeight: v.estimatedRowHeight,
      colCount: ut,
      keepKey: yt,
      onReady: (e) => ne.current = e,
      children: (e, t) => e.kind === "row" ? et(e.row, Le.get(e.row.id) ?? 0, t) : tt(e.row, t)
    }
  ) : C.map(
    (e, t) => de ? /* @__PURE__ */ S(jt, { id: e.id, selected: e.getIsSelected(), className: ue?.(e), children: e.getVisibleCells().map((n) => {
      const r = D?.rowId === e.id && D?.columnId === n.column.id;
      return /* @__PURE__ */ S(se, { className: Ie(q, Pe(n.column.columnDef.meta, e)), style: M(n.column), children: /* @__PURE__ */ S(
        it,
        {
          cell: n,
          editing: r,
          onStartEdit: () => Z(e.id, n.column.id),
          onCommit: (d) => ee(e.id, n.column.id, d),
          onCancel: ae,
          children: F(n)
        }
      ) }, n.id);
    }) }, e.id) : /* @__PURE__ */ ke(l.Fragment, { children: [
      et(e, t),
      J && e.getIsExpanded() && !e.getIsGrouped() && B ? tt(e) : null
    ] }, e.id)
  ) });
  return /* @__PURE__ */ ke(
    Pt,
    {
      ref: at,
      containerClassName: v.containerClassName,
      containerStyle: x ? (
        // The spacer rows change height as the window moves, and the
        // browser's scroll anchoring "corrects" the scroll for that on its
        // own: a jump to a row far off landed at the top instead.
        { ...v.containerStyle, overflowAnchor: "none" }
      ) : v.containerStyle,
      className: x ? "zen-table-fixed" : void 0,
      "aria-rowcount": x ? (v.headerRowCount ?? 1) + fe.length : void 0,
      role: y ? "grid" : void 0,
      "aria-multiselectable": y ? "true" : void 0,
      children: [
        v.header,
        z ? /* @__PURE__ */ S($t.Provider, { value: bt, children: nt }) : nt,
        v.footer
      ]
    }
  );
}
function Gt({
  items: v,
  tableEl: A,
  estimatedRowHeight: R,
  colCount: X,
  keepKey: P,
  onReady: V,
  children: q
}) {
  const [M, D] = l.useState(0);
  l.useLayoutEffect(() => {
    const f = A?.tHead;
    if (!f) return;
    D(f.offsetHeight);
    const w = new ResizeObserver(() => D(f.offsetHeight));
    return w.observe(f), () => w.disconnect();
  }, [A]);
  const Z = l.useRef(R ?? 40), ee = l.useRef(R !== void 0), ae = l.useCallback(
    (f) => {
      const w = v[f];
      return w ? `${w.kind}:${w.row.id}` : f;
    },
    [v]
  ), ue = l.useCallback(
    (f) => {
      const w = qt(f), y = P ? P.split(",").map(Number) : [], x = [...new Set(y)].filter((z) => z < f.count && !w.includes(z));
      return x.length ? [...w, ...x].sort((z, _) => z - _) : w;
    },
    [P]
  ), F = zt({
    count: v.length,
    getScrollElement: () => A?.parentElement ?? null,
    estimateSize: () => Z.current,
    measureElement: (f, w, y) => {
      const x = Ot(f, w, y);
      return !ee.current && w && x > 0 && (ee.current = !0, queueMicrotask(() => {
        Z.current = x, y.measure();
      })), x;
    },
    getItemKey: ae,
    rangeExtractor: ue,
    scrollMargin: M,
    scrollPaddingStart: M,
    overscan: 8,
    // Rows are measured from their ref, during React's commit: a synchronous
    // re-render from there is what flushSync warns about.
    useFlushSync: !1
  });
  l.useLayoutEffect(() => {
    V({
      scrollToItem: (f) => F.scrollToIndex(f, { align: "auto" }),
      itemAt: (f) => {
        const w = F.getVirtualItemForOffset(f);
        return w && { index: w.index, start: w.start, end: w.end };
      }
    });
  }, [F, V]);
  const J = l.useRef(null);
  if (typeof document < "u") {
    const f = document.activeElement, w = A?.tBodies[0];
    J.current = w && f instanceof HTMLElement && w.contains(f) ? f : null;
  }
  l.useLayoutEffect(() => {
    const f = J.current;
    !f || !f.isConnected || document.activeElement === f || document.activeElement && document.activeElement !== document.body || f.focus({ preventScroll: !0 });
  });
  const B = F.getVirtualItems(), de = (f, w) => /* @__PURE__ */ S("tr", { "aria-hidden": "true", "data-virtual-spacer": "", children: /* @__PURE__ */ S("td", { colSpan: X, style: { height: f, padding: 0, border: 0 } }) }, w), k = B[B.length - 1], Y = k ? F.getTotalSize() - (k.end - M) : 0;
  return /* @__PURE__ */ ke(kt, { children: [
    B.map((f, w) => {
      const y = f.start - (w === 0 ? M : B[w - 1].end), x = v[f.index];
      return /* @__PURE__ */ ke(l.Fragment, { children: [
        y > 0 ? de(y, "gap") : null,
        x ? q(x, { index: f.index, measure: F.measureElement }) : null
      ] }, f.key);
    }),
    Y > 0 ? de(Y, "bottom") : null
  ] });
}
function jt({
  id: v,
  selected: A,
  className: R,
  children: X
}) {
  const { setNodeRef: P, transform: V, transition: q, isDragging: M } = Lt({ id: v });
  return /* @__PURE__ */ S(
    le,
    {
      ref: P,
      "data-state": A ? "selected" : void 0,
      className: R,
      style: {
        transform: Dt.Transform.toString(V),
        transition: q,
        opacity: M ? 0.6 : 1,
        position: M ? "relative" : void 0,
        zIndex: M ? 1 : void 0
      },
      children: X
    }
  );
}
export {
  rn as BodyTable,
  $t as RowDragContext
};
//# sourceMappingURL=index253.js.map
