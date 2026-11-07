import { jsx as R, jsxs as xe, Fragment as Et } from "react/jsx-runtime";
import * as l from "react";
import { useSortable as yt } from "./index206.js";
import { CSS as Ct } from "./index207.js";
import { useVirtualizer as Rt } from "./index204.js";
import { cellKeyTarget as St, ownsArrowKeys as xt, rowKeyTarget as It } from "./index127.js";
import { clampRange as Ze, rangeRect as Lt, inRect as et, pastePlan as kt, parseTsv as zt, toTsv as Dt } from "./index417.js";
import { TableBody as Tt, TableRow as ie, TableCell as ce, Table as Mt } from "./index104.js";
import { EditableCell as tt } from "./index212.js";
import { useLocale as At } from "./index90.js";
import { defaultRangeExtractor as Ft, measureElement as Nt } from "./index255.js";
import { cn as nt } from "./index160.js";
const Ht = l.createContext(null), ot = (b, M) => `${b}\0${M}`, se = { row: 0, col: 0 };
function Ut(b) {
  const M = At(), {
    table: A,
    loading: Q,
    emptyMessage: V,
    colSpan: B,
    sepCellClass: $,
    pinStyle: T,
    editingCell: k,
    startEdit: X,
    commitEdit: Z,
    cancelEdit: le,
    rowClassName: ae,
    renderCell: N,
    expansionEnabled: W,
    renderSubRow: H,
    rowOrderingActive: ue,
    keyboard: I,
    selectable: Y,
    onRowActivate: d,
    rowLabel: v,
    cellNav: E,
    virtualize: S,
    rowDrag: z,
    menuTargets: _
  } = b, C = A.getRowModel().rows, K = l.useRef(null), [Ie, rt] = l.useState(null), ct = l.useCallback((e) => {
    K.current = e, rt(e);
  }, []), Le = l.useMemo(() => new Map(C.map((e, t) => [e.id, t])), [C]), st = A.getAllLeafColumns().length, de = l.useMemo(() => {
    if (!S) return [];
    const e = [];
    for (const t of C)
      e.push({ kind: "row", row: t }), W && H && t.getIsExpanded() && !t.getIsGrouped() && e.push({ kind: "sub", row: t });
    return e;
  }, [S, C, W, H]), ee = l.useMemo(() => {
    const e = /* @__PURE__ */ new Map();
    return de.forEach((t, o) => t.kind === "row" && e.set(t.row.id, o)), e;
  }, [de]), te = l.useRef(null), [it, ke] = l.useState(0), ze = Math.min(it, Math.max(C.length - 1, 0)), ne = l.useRef(/* @__PURE__ */ new Map()), De = l.useRef(null), lt = (e) => {
    const t = K.current, o = ne.current.get(e), s = t?.parentElement;
    if (!o || !s || document.activeElement !== o) return;
    const p = t?.tHead?.getBoundingClientRect().bottom ?? s.getBoundingClientRect().top, u = s.getBoundingClientRect().top + s.clientHeight, a = o.getBoundingClientRect();
    a.top < p ? s.scrollTop -= p - a.top : a.bottom > u && (s.scrollTop += a.bottom - u);
  }, fe = l.useRef(ee);
  fe.current = ee;
  const Te = (e) => {
    const t = te.current;
    if (!t) {
      ne.current.get(e)?.focus();
      return;
    }
    const o = fe.current.get(e);
    o !== void 0 && t.scrollToItem(o);
    const s = ne.current.get(e);
    s ? s.focus({ preventScroll: !0 }) : De.current = e, requestAnimationFrame(() => requestAnimationFrame(() => lt(e)));
  }, at = (e, t, o) => {
    if (e.altKey || xt(e.target)) return;
    const s = e.target === e.currentTarget, p = It(e.key, o, C.length);
    if (p !== null) {
      e.preventDefault();
      const u = C[p];
      if (!u) return;
      ke(p), Te(u.id);
      return;
    }
    s && (e.key === "Enter" && d ? (e.preventDefault(), d(t, e)) : e.key === " " && Y && t.getCanSelect() ? (e.preventDefault(), t.toggleSelected()) : (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "a" && Y && (e.preventDefault(), A.toggleAllPageRowsSelected(!A.getIsAllPageRowsSelected())));
  }, Ke = A.getVisibleLeafColumns(), J = l.useMemo(
    () => E ? Ke.filter((e) => !e.id.startsWith("__")) : [],
    // eslint-disable-next-line react-hooks/exhaustive-deps -- the visible columns, by identity of their ids
    [E, Ke.map((e) => e.id).join("\0")]
  ), Me = l.useMemo(() => new Map(J.map((e, t) => [e.id, t])), [J]), [Ve, ut] = l.useState(se), [Be, dt] = l.useState({ anchor: se, focus: se }), $e = l.useRef(Ve), Ae = l.useRef(Be), qe = (e) => {
    $e.current = e, ut(e);
  }, q = (e) => {
    Ae.current = e, dt(e);
  }, Ge = (e, t, o) => Ze({ anchor: e, focus: e }, t, o)?.anchor ?? se, Oe = (e, t, o) => {
    const s = Ze(e, t, o);
    return s ? Lt(s) : null;
  }, me = Ge(Ve, C.length, J.length), G = Oe(Be, C.length, J.length), ft = !!G && (G.top !== G.bottom || G.left !== G.right), pe = l.useRef(/* @__PURE__ */ new Map()), Fe = l.useRef(null), Ne = (e) => {
    const t = K.current, o = pe.current.get(e), s = t?.parentElement;
    if (!o || !s || document.activeElement !== o) return;
    const p = s.getBoundingClientRect(), u = o.getBoundingClientRect();
    if (s.scrollHeight > s.clientHeight) {
      const a = t?.tHead?.getBoundingClientRect().bottom ?? p.top, h = p.top + s.clientHeight;
      u.top < a ? s.scrollTop -= a - u.top : u.bottom > h && (s.scrollTop += u.bottom - h);
    } else (u.top < 0 || u.bottom > window.innerHeight) && o.scrollIntoView({ block: "nearest" });
    if (s.scrollWidth > s.clientWidth && getComputedStyle(o).position !== "sticky") {
      let a = p.left, h = p.left + s.clientWidth;
      for (const D of Array.from(o.parentElement?.children ?? [])) {
        if (D === o || getComputedStyle(D).position !== "sticky") continue;
        const L = D.getBoundingClientRect();
        L.right <= u.left + 1 ? a = Math.max(a, L.right) : L.left >= u.right - 1 && (h = Math.min(h, L.left));
      }
      u.left < a ? s.scrollLeft -= a - u.left : u.right > h && (s.scrollLeft += u.right - h);
    }
  }, ge = l.useRef({ rows: C, navCols: J, navColIndex: Me, rowIndex: Le, editingCell: k, props: b });
  ge.current = { rows: C, navCols: J, navColIndex: Me, rowIndex: Le, editingCell: k, props: b };
  const ve = (e, t) => {
    if (e.getIsGrouped()) return !1;
    const o = t.columnDef.meta;
    return typeof o?.editable == "function" ? o.editable(e.original) : !!o?.editable;
  }, x = l.useRef(null);
  {
    const e = () => ge.current, t = () => e().rows.length, o = () => e().navCols.length, s = () => Ge($e.current, t(), o()), p = () => Oe(Ae.current, t(), o()), u = (n) => {
      const r = n?.closest?.("td[data-col]");
      if (!r || !K.current?.contains(r)) return null;
      const c = e().rowIndex.get(r.dataset.row ?? "") ?? -1, i = e().navColIndex.get(r.dataset.col ?? "");
      return c < 0 || i === void 0 ? null : { td: r, at: { row: c, col: i } };
    }, a = (n) => {
      const r = e().rows[n.row], c = e().navCols[n.col];
      if (!r || !c) return;
      const i = ot(r.id, c.id), f = te.current;
      if (f) {
        const g = fe.current.get(r.id);
        g !== void 0 && f.scrollToItem(g);
      }
      const m = pe.current.get(i);
      m ? m.focus({ preventScroll: !0 }) : Fe.current = i, Ne(i), requestAnimationFrame(() => requestAnimationFrame(() => Ne(i)));
    }, h = (n) => {
      qe(n), q({ anchor: n, focus: n }), a(n);
    }, D = (n) => {
      q({ anchor: s(), focus: n });
      const r = e().rows[n.row], c = te.current;
      if (c && r) {
        const i = fe.current.get(r.id);
        i !== void 0 && c.scrollToItem(i);
      }
    }, L = (n, r) => {
      const c = n.getValue(r.id);
      return c == null ? "" : c instanceof Date ? c.toISOString() : typeof c == "object" ? JSON.stringify(c) : String(c);
    }, F = (n, r, c) => {
      if (!ve(n, r)) return null;
      const i = r.columnDef.meta;
      if (i?.editVariant === "number") {
        const f = c.trim();
        if (f === "") return { value: null };
        const m = Number(f.replace(/[,\s]/g, ""));
        return Number.isFinite(m) ? { value: m } : null;
      }
      if (i?.editVariant === "select") {
        const f = i.editOptions ?? [], m = f.find((g) => g.value === c) ?? f.find((g) => g.label.toLowerCase() === c.trim().toLowerCase());
        return m ? { value: m.value } : null;
      }
      return { value: c };
    }, O = (n, r) => {
      const c = [];
      for (let i = n.top; i <= n.bottom; i++) {
        const f = e().rows[i];
        if (f)
          for (let m = n.left; m <= n.right; m++) {
            const g = e().navCols[m];
            if (!g) continue;
            const w = F(f, g, r(i, m));
            w && c.push({ rowId: f.id, columnId: g.id, value: w.value });
          }
      }
      return c;
    }, U = (n) => setTimeout(() => h(n)), Ee = (n) => {
      const r = u(n.target);
      if (!r) return;
      const { td: c, at: i } = r;
      if (n.target !== c) {
        if (!e().editingCell) return;
        n.key === "Escape" ? U(i) : n.key === "Enter" && !n.shiftKey ? U({ row: Math.min(i.row + 1, t() - 1), col: i.col }) : n.key === "Tab" && (n.preventDefault(), h({ row: i.row, col: Math.min(Math.max(i.col + (n.shiftKey ? -1 : 1), 0), o() - 1) }));
        return;
      }
      if (n.altKey) return;
      const f = n.ctrlKey || n.metaKey, m = getComputedStyle(c).direction === "rtl", g = m && n.key === "ArrowLeft" ? "ArrowRight" : m && n.key === "ArrowRight" ? "ArrowLeft" : n.key, w = St(g, n.shiftKey ? Ae.current.focus : i, t(), o(), f);
      if (w) {
        n.preventDefault(), n.shiftKey ? D(w) : h(w);
        return;
      }
      const P = e().rows[i.row], re = e().navCols[i.col];
      if (!P || !re) return;
      const j = p(), bt = !!j && (j.top !== j.bottom || j.left !== j.right);
      f && g.toLowerCase() === "a" ? (n.preventDefault(), q({ anchor: se, focus: { row: t() - 1, col: o() - 1 } })) : g === "Escape" && bt ? (n.preventDefault(), q({ anchor: i, focus: i })) : (g === "Enter" || g === "F2") && ve(P, re) ? (n.preventDefault(), e().props.startEdit(P.id, re.id)) : (g === "Delete" || g === "Backspace") && j ? (n.preventDefault(), e().props.editCells?.(O(j, () => ""))) : g.length === 1 && !f && ve(P, re) && (n.preventDefault(), e().props.startEdit(P.id, re.id, g));
    }, ye = (n) => {
      const r = u(n.target);
      if (!r || e().editingCell) return;
      const c = e().rows[r.at.row], i = e().navCols[r.at.col];
      c && i && ve(c, i) && e().props.startEdit(c.id, i.id);
    }, Ce = (n) => {
      if (n.button !== 0) return;
      const r = u(n.target);
      if (!r || e().editingCell && r.td.contains(document.activeElement) && document.activeElement !== r.td) return;
      if (n.shiftKey) {
        n.preventDefault(), D(r.at);
        return;
      }
      qe(r.at), q({ anchor: r.at, focus: r.at }), x.current?.stop?.();
      const c = K.current;
      if (!c) return;
      const i = c.style.userSelect, f = (g) => {
        const w = u(g.target);
        w && (c.style.userSelect = "none", q({ anchor: s(), focus: w.at }));
      }, m = () => {
        c.removeEventListener("pointerover", f), window.removeEventListener("pointerup", m), window.removeEventListener("pointercancel", m), c.style.userSelect = i, x.current && (x.current.stop = void 0);
      };
      c.addEventListener("pointerover", f), window.addEventListener("pointerup", m), window.addEventListener("pointercancel", m), x.current && (x.current.stop = m);
    }, Re = (n) => {
      if (e().editingCell || !u(document.activeElement)) return;
      const r = p();
      if (!r || !n.clipboardData) return;
      const c = [];
      for (let i = r.top; i <= r.bottom; i++) {
        const f = e().rows[i];
        if (!f) continue;
        const m = [];
        for (let g = r.left; g <= r.right; g++) {
          const w = e().navCols[g];
          m.push(w ? L(f, w) : "");
        }
        c.push(m);
      }
      n.clipboardData.setData("text/plain", Dt(c)), n.preventDefault();
    }, Se = (n) => {
      if (e().editingCell || !u(document.activeElement)) return;
      const r = n.clipboardData?.getData("text/plain"), c = p();
      if (!r || !c) return;
      n.preventDefault();
      const i = kt(zt(r), c, t(), o());
      if (i.length === 0) return;
      const f = new Map(i.map((w) => [`${w.row}:${w.col}`, w.value])), m = Math.max(...i.map((w) => w.row)), g = Math.max(...i.map((w) => w.col));
      e().props.editCells?.(O({ top: c.top, left: c.left, bottom: m, right: g }, (w, P) => f.get(`${w}:${P}`) ?? "")), q({ anchor: { row: c.top, col: c.left }, focus: { row: m, col: g } });
    }, y = (n) => {
      const r = n.target?.closest?.("tr[data-row-id]");
      if (!r || !K.current?.contains(r)) return;
      const c = r.dataset.rowId ?? "", i = e().rowIndex.get(c) ?? -1;
      if (!(i < 0))
        if (e().props.cellNav) {
          const f = u(n.target), m = p();
          f && !(m && et(m, f.at.row, f.at.col)) && h(f.at);
        } else e().props.keyboard && (ke(i), Te(c));
    };
    x.current = { keydown: Ee, dblclick: ye, pointerdown: Ce, copy: Re, paste: Se, focusCell: a, contextmenu: y, stop: x.current?.stop };
  }
  l.useEffect(() => {
    const e = K.current;
    if (!E || !e) return;
    const t = (a) => x.current?.keydown(a), o = (a) => x.current?.dblclick(a), s = (a) => x.current?.pointerdown(a), p = (a) => x.current?.copy(a), u = (a) => x.current?.paste(a);
    return e.addEventListener("keydown", t, !0), e.addEventListener("dblclick", o), e.addEventListener("pointerdown", s), e.addEventListener("copy", p), e.addEventListener("paste", u), () => {
      e.removeEventListener("keydown", t, !0), e.removeEventListener("dblclick", o), e.removeEventListener("pointerdown", s), e.removeEventListener("copy", p), e.removeEventListener("paste", u), x.current?.stop?.();
    };
  }, [E]), l.useEffect(() => {
    const e = Ie;
    if (!_ || !e) return;
    const t = (o) => x.current?.contextmenu(o);
    return e.addEventListener("contextmenu", t), () => e.removeEventListener("contextmenu", t);
  }, [_, Ie]);
  const oe = l.useRef(!1), Pe = l.useRef(() => {
  });
  Pe.current = () => {
    if (E) x.current?.focusCell(me);
    else {
      const e = C[ze];
      e && Te(e.id);
    }
  }, l.useEffect(() => {
    const e = K.current;
    if (!(I || E) || !e) return;
    const t = () => oe.current = !0, o = (s) => {
      const p = s.relatedTarget;
      if (p) {
        e.contains(p) || (oe.current = !1);
        return;
      }
      const u = s.target;
      setTimeout(() => {
        const a = document.activeElement;
        u.isConnected && (!a || a === document.body) && (oe.current = !1);
      });
    };
    return e.addEventListener("focusin", t), e.addEventListener("focusout", o), () => {
      e.removeEventListener("focusin", t), e.removeEventListener("focusout", o);
    };
  }, [I, E]), l.useEffect(() => {
    if (!oe.current) return;
    const e = setTimeout(() => {
      const t = document.activeElement;
      !oe.current || t && t !== document.body || Pe.current();
    });
    return () => clearTimeout(e);
  }, [C]);
  const [he, je] = l.useState(null), [He, mt] = l.useState(null), We = l.useRef(null), we = l.useRef(void 0);
  l.useEffect(() => () => we.current?.(), []);
  const Ye = (e, t) => {
    const o = K.current, s = o?.parentElement, p = te.current;
    if (t.button !== 0 || !p || !s) return;
    t.preventDefault(), we.current?.();
    const u = (y) => {
      We.current = y, mt(y);
    };
    let a = t.clientY, h = 0;
    const D = () => {
      const y = s.getBoundingClientRect(), n = o?.tHead?.getBoundingClientRect().bottom ?? y.top;
      return { rect: y, top: n, bottom: y.top + s.clientHeight };
    }, L = () => {
      const { rect: y, top: n, bottom: r } = D(), c = Math.min(Math.max(a, n), r - 1), i = s.scrollTop + (c - y.top), f = p.itemAt(i);
      f && u(i > (f.start + f.end) / 2 ? f.index + 1 : f.index);
    }, F = 40, O = () => {
      const { top: y, bottom: n } = D(), r = a < y + F ? a - (y + F) : a > n - F ? a - (n - F) : 0;
      r && (s.scrollTop += Math.max(-200, Math.min(200, Math.round(r / 3) || Math.sign(r))), L()), h = requestAnimationFrame(O);
    }, U = (y) => {
      const n = ge.current.rowIndex.get(e), r = We.current;
      if (Se(), !y || n === void 0 || r === null) return;
      const c = r > n ? r - 1 : r;
      c !== n && ge.current.props.onRowMove?.(n, c);
    }, Ee = (y) => {
      a = y.clientY, L();
    }, ye = () => U(!0), Ce = () => U(!1), Re = (y) => {
      y.key === "Escape" && (y.preventDefault(), y.stopPropagation(), U(!1));
    }, Se = () => {
      cancelAnimationFrame(h), window.removeEventListener("pointermove", Ee), window.removeEventListener("pointerup", ye), window.removeEventListener("pointercancel", Ce), window.removeEventListener("keydown", Re, !0), je(null), u(null), we.current = void 0;
    };
    window.addEventListener("pointermove", Ee), window.addEventListener("pointerup", ye), window.addEventListener("pointercancel", Ce), window.addEventListener("keydown", Re, !0), we.current = Se, je(e), L(), h = requestAnimationFrame(O);
  }, _e = (e) => {
    if (He !== null)
      return He === e ? "before" : He === C.length && e === C.length - 1 ? "after" : void 0;
  }, pt = (e) => {
    const t = _e(e);
    return t ? { boxShadow: `inset 0 ${t === "before" ? 2 : -2}px 0 0 var(--zen-color-primary)` } : void 0;
  }, Je = l.useRef(Ye);
  Je.current = Ye;
  const gt = l.useMemo(
    () => ({ active: !!z, start: (e, t) => Je.current(e, t) }),
    [z]
  ), be = [];
  if (S) {
    const e = C[E ? me.row : ze];
    (I || E) && e && be.push(ee.get(e.id) ?? -1), k && be.push(ee.get(k.rowId) ?? -1), he !== null && be.push(ee.get(he) ?? -1);
  }
  const vt = be.filter((e) => e >= 0).join(","), ht = (e) => (t) => {
    if (!t) {
      pe.current.delete(e);
      return;
    }
    pe.current.set(e, t), Fe.current === e && (Fe.current = null, queueMicrotask(() => {
      t.focus({ preventScroll: !0 }), Ne(e);
    }));
  }, wt = (e, t) => e.getVisibleCells().map((o) => {
    const s = T(o.column), p = k?.rowId === e.id && k?.columnId === o.column.id, u = !o.getIsGrouped() && !o.getIsAggregated() && !o.getIsPlaceholder(), a = N(o), h = E ? Me.get(o.column.id) : void 0, D = h !== void 0 && t === me.row && h === me.col, L = h !== void 0 && !!G && ft && et(G, t, h);
    let F = z ? { ...s, ...pt(t) } : s;
    return s && L && (F = { ...F, background: "var(--zen-color-primary-soft)" }), /* @__PURE__ */ R(
      ce,
      {
        ref: h !== void 0 ? ht(ot(e.id, o.column.id)) : void 0,
        className: h === void 0 ? $ : nt(
          $,
          "focus:zen-outline focus:zen-outline-2 focus:-zen-outline-offset-2 focus:zen-outline-zen-ring",
          L && "zen-bg-zen-primary-soft"
        ),
        style: F,
        role: E ? "gridcell" : void 0,
        tabIndex: h === void 0 ? void 0 : D ? 0 : -1,
        "aria-selected": h !== void 0 ? L || D ? "true" : "false" : void 0,
        "data-row": h !== void 0 ? e.id : void 0,
        "data-col": h !== void 0 ? o.column.id : void 0,
        "data-column": _ ? o.column.id : void 0,
        children: u ? /* @__PURE__ */ R(
          tt,
          {
            cell: o,
            editing: p,
            onStartEdit: () => X(e.id, o.column.id),
            onCommit: (O) => Z(e.id, o.column.id, O),
            onCancel: le,
            navigable: h !== void 0,
            seed: p ? k?.seed : void 0,
            children: a
          }
        ) : a
      },
      o.id
    );
  }), Ue = (e, t, o) => /* @__PURE__ */ R(
    ie,
    {
      ref: I || o ? (s) => {
        if (o?.measure(s), !!I) {
          if (!s) {
            ne.current.delete(e.id);
            return;
          }
          ne.current.set(e.id, s), De.current === e.id && (De.current = null, queueMicrotask(() => s.focus({ preventScroll: !0 })));
        }
      } : void 0,
      "data-index": o?.index,
      "aria-rowindex": o ? (b.headerRowCount ?? 1) + o.index + 1 : void 0,
      "data-dragging": z && he === e.id ? "true" : void 0,
      "data-row-id": _ ? e.id : void 0,
      "data-drop": z ? _e(t) : void 0,
      tabIndex: I ? t === ze ? 0 : -1 : void 0,
      "aria-label": I ? v?.(e) : void 0,
      "aria-selected": I && Y ? e.getIsSelected() ? "true" : "false" : void 0,
      onKeyDown: I ? (s) => at(s, e, t) : void 0,
      onFocus: I ? () => ke(t) : void 0,
      "data-state": e.getIsSelected() ? "selected" : void 0,
      "data-grouped": e.getIsGrouped() ? "true" : void 0,
      className: nt(
        e.getIsGrouped() && "zen-bg-zen-muted/40 zen-font-medium",
        z && he === e.id && "zen-opacity-50",
        I && "focus-visible:zen-outline focus-visible:zen-outline-2 focus-visible:-zen-outline-offset-2 focus-visible:zen-outline-zen-ring",
        ae?.(e)
      ),
      children: wt(e, t)
    },
    o ? `row:${e.id}` : void 0
  ), Qe = (e, t) => /* @__PURE__ */ R(
    ie,
    {
      ref: t?.measure,
      "data-expanded-of": e.id,
      "data-index": t?.index,
      "aria-rowindex": t ? (b.headerRowCount ?? 1) + t.index + 1 : void 0,
      children: /* @__PURE__ */ R(ce, { colSpan: e.getVisibleCells().length, className: "zen-p-0 zen-bg-zen-muted/30", children: H(e) })
    },
    t ? `sub:${e.id}` : void 0
  ), Xe = /* @__PURE__ */ R(Tt, { children: Q ? /* @__PURE__ */ R(ie, { children: /* @__PURE__ */ R(ce, { colSpan: B, className: "zen-text-center zen-text-zen-muted-fg zen-py-6", children: M.t("dataTable.loading") }) }) : C.length === 0 ? /* @__PURE__ */ R(ie, { children: /* @__PURE__ */ R(ce, { colSpan: B, className: "zen-text-center zen-text-zen-muted-fg zen-py-6", children: V }) }) : S ? /* @__PURE__ */ R(
    Kt,
    {
      items: de,
      tableEl: Ie,
      estimatedRowHeight: b.estimatedRowHeight,
      colCount: st,
      keepKey: vt,
      onReady: (e) => te.current = e,
      children: (e, t) => e.kind === "row" ? Ue(e.row, Le.get(e.row.id) ?? 0, t) : Qe(e.row, t)
    }
  ) : C.map(
    (e, t) => ue ? /* @__PURE__ */ R(Vt, { id: e.id, selected: e.getIsSelected(), className: ae?.(e), children: e.getVisibleCells().map((o) => {
      const s = k?.rowId === e.id && k?.columnId === o.column.id;
      return /* @__PURE__ */ R(ce, { className: $, style: T(o.column), children: /* @__PURE__ */ R(
        tt,
        {
          cell: o,
          editing: s,
          onStartEdit: () => X(e.id, o.column.id),
          onCommit: (p) => Z(e.id, o.column.id, p),
          onCancel: le,
          children: N(o)
        }
      ) }, o.id);
    }) }, e.id) : /* @__PURE__ */ xe(l.Fragment, { children: [
      Ue(e, t),
      W && e.getIsExpanded() && !e.getIsGrouped() && H ? Qe(e) : null
    ] }, e.id)
  ) });
  return /* @__PURE__ */ xe(
    Mt,
    {
      ref: ct,
      containerClassName: b.containerClassName,
      containerStyle: S ? (
        // The spacer rows change height as the window moves, and the
        // browser's scroll anchoring "corrects" the scroll for that on its
        // own: a jump to a row far off landed at the top instead.
        { ...b.containerStyle, overflowAnchor: "none" }
      ) : b.containerStyle,
      className: S ? "zen-table-fixed" : void 0,
      "aria-rowcount": S ? (b.headerRowCount ?? 1) + de.length : void 0,
      role: E ? "grid" : void 0,
      "aria-multiselectable": E ? "true" : void 0,
      children: [
        b.header,
        z ? /* @__PURE__ */ R(Ht.Provider, { value: gt, children: Xe }) : Xe,
        b.footer
      ]
    }
  );
}
function Kt({
  items: b,
  tableEl: M,
  estimatedRowHeight: A,
  colCount: Q,
  keepKey: V,
  onReady: B,
  children: $
}) {
  const [T, k] = l.useState(0);
  l.useLayoutEffect(() => {
    const d = M?.tHead;
    if (!d) return;
    k(d.offsetHeight);
    const v = new ResizeObserver(() => k(d.offsetHeight));
    return v.observe(d), () => v.disconnect();
  }, [M]);
  const X = l.useRef(A ?? 40), Z = l.useRef(A !== void 0), le = l.useCallback(
    (d) => {
      const v = b[d];
      return v ? `${v.kind}:${v.row.id}` : d;
    },
    [b]
  ), ae = l.useCallback(
    (d) => {
      const v = Ft(d), E = V ? V.split(",").map(Number) : [], S = [...new Set(E)].filter((z) => z < d.count && !v.includes(z));
      return S.length ? [...v, ...S].sort((z, _) => z - _) : v;
    },
    [V]
  ), N = Rt({
    count: b.length,
    getScrollElement: () => M?.parentElement ?? null,
    estimateSize: () => X.current,
    measureElement: (d, v, E) => {
      const S = Nt(d, v, E);
      return !Z.current && v && S > 0 && (Z.current = !0, queueMicrotask(() => {
        X.current = S, E.measure();
      })), S;
    },
    getItemKey: le,
    rangeExtractor: ae,
    scrollMargin: T,
    scrollPaddingStart: T,
    overscan: 8,
    // Rows are measured from their ref, during React's commit: a synchronous
    // re-render from there is what flushSync warns about.
    useFlushSync: !1
  });
  l.useLayoutEffect(() => {
    B({
      scrollToItem: (d) => N.scrollToIndex(d, { align: "auto" }),
      itemAt: (d) => {
        const v = N.getVirtualItemForOffset(d);
        return v && { index: v.index, start: v.start, end: v.end };
      }
    });
  }, [N, B]);
  const W = l.useRef(null);
  if (typeof document < "u") {
    const d = document.activeElement, v = M?.tBodies[0];
    W.current = v && d instanceof HTMLElement && v.contains(d) ? d : null;
  }
  l.useLayoutEffect(() => {
    const d = W.current;
    !d || !d.isConnected || document.activeElement === d || document.activeElement && document.activeElement !== document.body || d.focus({ preventScroll: !0 });
  });
  const H = N.getVirtualItems(), ue = (d, v) => /* @__PURE__ */ R("tr", { "aria-hidden": "true", "data-virtual-spacer": "", children: /* @__PURE__ */ R("td", { colSpan: Q, style: { height: d, padding: 0, border: 0 } }) }, v), I = H[H.length - 1], Y = I ? N.getTotalSize() - (I.end - T) : 0;
  return /* @__PURE__ */ xe(Et, { children: [
    H.map((d, v) => {
      const E = d.start - (v === 0 ? T : H[v - 1].end), S = b[d.index];
      return /* @__PURE__ */ xe(l.Fragment, { children: [
        E > 0 ? ue(E, "gap") : null,
        S ? $(S, { index: d.index, measure: N.measureElement }) : null
      ] }, d.key);
    }),
    Y > 0 ? ue(Y, "bottom") : null
  ] });
}
function Vt({
  id: b,
  selected: M,
  className: A,
  children: Q
}) {
  const { setNodeRef: V, transform: B, transition: $, isDragging: T } = yt({ id: b });
  return /* @__PURE__ */ R(
    ie,
    {
      ref: V,
      "data-state": M ? "selected" : void 0,
      className: A,
      style: {
        transform: Ct.Transform.toString(B),
        transition: $,
        opacity: T ? 0.6 : 1,
        position: T ? "relative" : void 0,
        zIndex: T ? 1 : void 0
      },
      children: Q
    }
  );
}
export {
  Ut as BodyTable,
  Ht as RowDragContext
};
//# sourceMappingURL=index213.js.map
