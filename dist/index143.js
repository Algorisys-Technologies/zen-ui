function I(e, o) {
  return typeof e == "function" ? e(o) : e;
}
function M(e, o) {
  return (t) => {
    o.setState((n) => ({
      ...n,
      [e]: I(t, n[e])
    }));
  };
}
function B(e) {
  return e instanceof Function;
}
function Ce(e) {
  return Array.isArray(e) && e.every((o) => typeof o == "number");
}
function ie(e, o) {
  const t = [], n = (r) => {
    r.forEach((i) => {
      t.push(i);
      const l = o(i);
      l != null && l.length && n(l);
    });
  };
  return n(e), t;
}
function m(e, o, t) {
  let n = [], r;
  return (i) => {
    let l;
    t.key && t.debug && (l = Date.now());
    const u = e(i);
    if (!(u.length !== n.length || u.some((c, S) => n[S] !== c)))
      return r;
    n = u;
    let a;
    if (t.key && t.debug && (a = Date.now()), r = o(...u), t == null || t.onChange == null || t.onChange(r), t.key && t.debug && t != null && t.debug()) {
      const c = Math.round((Date.now() - l) * 100) / 100, S = Math.round((Date.now() - a) * 100) / 100, d = S / 16, s = (f, p) => {
        for (f = String(f); f.length < p; )
          f = " " + f;
        return f;
      };
      console.info(`%c⏱ ${s(S, 5)} /${s(c, 5)} ms`, `
            font-size: .6rem;
            font-weight: bold;
            color: hsl(${Math.max(0, Math.min(120 - 120 * d, 120))}deg 100% 31%);`, t?.key);
    }
    return r;
  };
}
function C(e, o, t, n) {
  return {
    debug: () => {
      var r;
      return (r = e?.debugAll) != null ? r : e[o];
    },
    key: process.env.NODE_ENV === "development" && t,
    onChange: n
  };
}
function Re(e, o, t, n) {
  const r = () => {
    var l;
    return (l = i.getValue()) != null ? l : e.options.renderFallbackValue;
  }, i = {
    id: `${o.id}_${t.id}`,
    row: o,
    column: t,
    getValue: () => o.getValue(n),
    renderValue: r,
    getContext: m(() => [e, t, o, i], (l, u, g, a) => ({
      table: l,
      column: u,
      row: g,
      cell: a,
      getValue: a.getValue,
      renderValue: a.renderValue
    }), C(e.options, "debugCells", "cell.getContext"))
  };
  return e._features.forEach((l) => {
    l.createCell == null || l.createCell(i, t, o, e);
  }, {}), i;
}
function we(e, o, t, n) {
  var r, i;
  const u = {
    ...e._getDefaultColumnDef(),
    ...o
  }, g = u.accessorKey;
  let a = (r = (i = u.id) != null ? i : g ? typeof String.prototype.replaceAll == "function" ? g.replaceAll(".", "_") : g.replace(/\./g, "_") : void 0) != null ? r : typeof u.header == "string" ? u.header : void 0, c;
  if (u.accessorFn ? c = u.accessorFn : g && (g.includes(".") ? c = (d) => {
    let s = d;
    for (const p of g.split(".")) {
      var f;
      s = (f = s) == null ? void 0 : f[p], process.env.NODE_ENV !== "production" && s === void 0 && console.warn(`"${p}" in deeply nested key "${g}" returned undefined.`);
    }
    return s;
  } : c = (d) => d[u.accessorKey]), !a)
    throw process.env.NODE_ENV !== "production" ? new Error(u.accessorFn ? "Columns require an id when using an accessorFn" : "Columns require an id when using a non-string header") : new Error();
  let S = {
    id: `${String(a)}`,
    accessorFn: c,
    parent: n,
    depth: t,
    columnDef: u,
    columns: [],
    getFlatColumns: m(() => [!0], () => {
      var d;
      return [S, ...(d = S.columns) == null ? void 0 : d.flatMap((s) => s.getFlatColumns())];
    }, C(e.options, "debugColumns", "column.getFlatColumns")),
    getLeafColumns: m(() => [e._getOrderColumnsFn()], (d) => {
      var s;
      if ((s = S.columns) != null && s.length) {
        let f = S.columns.flatMap((p) => p.getLeafColumns());
        return d(f);
      }
      return [S];
    }, C(e.options, "debugColumns", "column.getLeafColumns"))
  };
  for (const d of e._features)
    d.createColumn == null || d.createColumn(S, e);
  return S;
}
const $ = "debugHeaders";
function oe(e, o, t) {
  var n;
  let i = {
    id: (n = t.id) != null ? n : o.id,
    column: o,
    index: t.index,
    isPlaceholder: !!t.isPlaceholder,
    placeholderId: t.placeholderId,
    depth: t.depth,
    subHeaders: [],
    colSpan: 0,
    rowSpan: 0,
    headerGroup: null,
    getLeafHeaders: () => {
      const l = [], u = (g) => {
        g.subHeaders && g.subHeaders.length && g.subHeaders.map(u), l.push(g);
      };
      return u(i), l;
    },
    getContext: () => ({
      table: e,
      header: i,
      column: o
    })
  };
  return e._features.forEach((l) => {
    l.createHeader == null || l.createHeader(i, e);
  }), i;
}
const he = {
  createTable: (e) => {
    e.getHeaderGroups = m(() => [e.getAllColumns(), e.getVisibleLeafColumns(), e.getState().columnPinning.left, e.getState().columnPinning.right], (o, t, n, r) => {
      var i, l;
      const u = (i = n?.map((S) => t.find((d) => d.id === S)).filter(Boolean)) != null ? i : [], g = (l = r?.map((S) => t.find((d) => d.id === S)).filter(Boolean)) != null ? l : [], a = t.filter((S) => !(n != null && n.includes(S.id)) && !(r != null && r.includes(S.id)));
      return A(o, [...u, ...a, ...g], e);
    }, C(e.options, $, "getHeaderGroups")), e.getCenterHeaderGroups = m(() => [e.getAllColumns(), e.getVisibleLeafColumns(), e.getState().columnPinning.left, e.getState().columnPinning.right], (o, t, n, r) => (t = t.filter((i) => !(n != null && n.includes(i.id)) && !(r != null && r.includes(i.id))), A(o, t, e, "center")), C(e.options, $, "getCenterHeaderGroups")), e.getLeftHeaderGroups = m(() => [e.getAllColumns(), e.getVisibleLeafColumns(), e.getState().columnPinning.left], (o, t, n) => {
      var r;
      const i = (r = n?.map((l) => t.find((u) => u.id === l)).filter(Boolean)) != null ? r : [];
      return A(o, i, e, "left");
    }, C(e.options, $, "getLeftHeaderGroups")), e.getRightHeaderGroups = m(() => [e.getAllColumns(), e.getVisibleLeafColumns(), e.getState().columnPinning.right], (o, t, n) => {
      var r;
      const i = (r = n?.map((l) => t.find((u) => u.id === l)).filter(Boolean)) != null ? r : [];
      return A(o, i, e, "right");
    }, C(e.options, $, "getRightHeaderGroups")), e.getFooterGroups = m(() => [e.getHeaderGroups()], (o) => [...o].reverse(), C(e.options, $, "getFooterGroups")), e.getLeftFooterGroups = m(() => [e.getLeftHeaderGroups()], (o) => [...o].reverse(), C(e.options, $, "getLeftFooterGroups")), e.getCenterFooterGroups = m(() => [e.getCenterHeaderGroups()], (o) => [...o].reverse(), C(e.options, $, "getCenterFooterGroups")), e.getRightFooterGroups = m(() => [e.getRightHeaderGroups()], (o) => [...o].reverse(), C(e.options, $, "getRightFooterGroups")), e.getFlatHeaders = m(() => [e.getHeaderGroups()], (o) => o.map((t) => t.headers).flat(), C(e.options, $, "getFlatHeaders")), e.getLeftFlatHeaders = m(() => [e.getLeftHeaderGroups()], (o) => o.map((t) => t.headers).flat(), C(e.options, $, "getLeftFlatHeaders")), e.getCenterFlatHeaders = m(() => [e.getCenterHeaderGroups()], (o) => o.map((t) => t.headers).flat(), C(e.options, $, "getCenterFlatHeaders")), e.getRightFlatHeaders = m(() => [e.getRightHeaderGroups()], (o) => o.map((t) => t.headers).flat(), C(e.options, $, "getRightFlatHeaders")), e.getCenterLeafHeaders = m(() => [e.getCenterFlatHeaders()], (o) => o.filter((t) => {
      var n;
      return !((n = t.subHeaders) != null && n.length);
    }), C(e.options, $, "getCenterLeafHeaders")), e.getLeftLeafHeaders = m(() => [e.getLeftFlatHeaders()], (o) => o.filter((t) => {
      var n;
      return !((n = t.subHeaders) != null && n.length);
    }), C(e.options, $, "getLeftLeafHeaders")), e.getRightLeafHeaders = m(() => [e.getRightFlatHeaders()], (o) => o.filter((t) => {
      var n;
      return !((n = t.subHeaders) != null && n.length);
    }), C(e.options, $, "getRightLeafHeaders")), e.getLeafHeaders = m(() => [e.getLeftHeaderGroups(), e.getCenterHeaderGroups(), e.getRightHeaderGroups()], (o, t, n) => {
      var r, i, l, u, g, a;
      return [...(r = (i = o[0]) == null ? void 0 : i.headers) != null ? r : [], ...(l = (u = t[0]) == null ? void 0 : u.headers) != null ? l : [], ...(g = (a = n[0]) == null ? void 0 : a.headers) != null ? g : []].map((c) => c.getLeafHeaders()).flat();
    }, C(e.options, $, "getLeafHeaders"));
  }
};
function A(e, o, t, n) {
  var r, i;
  let l = 0;
  const u = function(d, s) {
    s === void 0 && (s = 1), l = Math.max(l, s), d.filter((f) => f.getIsVisible()).forEach((f) => {
      var p;
      (p = f.columns) != null && p.length && u(f.columns, s + 1);
    }, 0);
  };
  u(e);
  let g = [];
  const a = (d, s) => {
    const f = {
      depth: s,
      id: [n, `${s}`].filter(Boolean).join("_"),
      headers: []
    }, p = [];
    d.forEach((w) => {
      const R = [...p].reverse()[0], h = w.column.depth === f.depth;
      let _, V = !1;
      if (h && w.column.parent ? _ = w.column.parent : (_ = w.column, V = !0), R && R?.column === _)
        R.subHeaders.push(w);
      else {
        const F = oe(t, _, {
          id: [n, s, _.id, w?.id].filter(Boolean).join("_"),
          isPlaceholder: V,
          placeholderId: V ? `${p.filter((v) => v.column === _).length}` : void 0,
          depth: s,
          index: p.length
        });
        F.subHeaders.push(w), p.push(F);
      }
      f.headers.push(w), w.headerGroup = f;
    }), g.push(f), s > 0 && a(p, s - 1);
  }, c = o.map((d, s) => oe(t, d, {
    depth: l,
    index: s
  }));
  a(c, l - 1), g.reverse();
  const S = (d) => d.filter((f) => f.column.getIsVisible()).map((f) => {
    let p = 0, w = 0, R = [0];
    f.subHeaders && f.subHeaders.length ? (R = [], S(f.subHeaders).forEach((_) => {
      let {
        colSpan: V,
        rowSpan: F
      } = _;
      p += V, R.push(F);
    })) : p = 1;
    const h = Math.min(...R);
    return w = w + h, f.colSpan = p, f.rowSpan = w, {
      colSpan: p,
      rowSpan: w
    };
  });
  return S((r = (i = g[0]) == null ? void 0 : i.headers) != null ? r : []), g;
}
const T = (e, o, t, n, r, i, l) => {
  let u = {
    id: o,
    index: n,
    original: t,
    depth: r,
    parentId: l,
    _valuesCache: {},
    _uniqueValuesCache: {},
    getValue: (g) => {
      if (u._valuesCache.hasOwnProperty(g))
        return u._valuesCache[g];
      const a = e.getColumn(g);
      if (a != null && a.accessorFn)
        return u._valuesCache[g] = a.accessorFn(u.original, n), u._valuesCache[g];
    },
    getUniqueValues: (g) => {
      if (u._uniqueValuesCache.hasOwnProperty(g))
        return u._uniqueValuesCache[g];
      const a = e.getColumn(g);
      if (a != null && a.accessorFn)
        return a.columnDef.getUniqueValues ? (u._uniqueValuesCache[g] = a.columnDef.getUniqueValues(u.original, n), u._uniqueValuesCache[g]) : (u._uniqueValuesCache[g] = [u.getValue(g)], u._uniqueValuesCache[g]);
    },
    renderValue: (g) => {
      var a;
      return (a = u.getValue(g)) != null ? a : e.options.renderFallbackValue;
    },
    subRows: [],
    getLeafRows: () => ie(u.subRows, (g) => g.subRows),
    getParentRow: () => u.parentId ? e.getRow(u.parentId, !0) : void 0,
    getParentRows: () => {
      let g = [], a = u;
      for (; ; ) {
        const c = a.getParentRow();
        if (!c) break;
        g.push(c), a = c;
      }
      return g.reverse();
    },
    getAllCells: m(() => [e.getAllLeafColumns()], (g) => g.map((a) => Re(e, u, a, a.id)), C(e.options, "debugRows", "getAllCells")),
    _getAllCellsByColumnId: m(() => [u.getAllCells()], (g) => g.reduce((a, c) => (a[c.column.id] = c, a), {}), C(e.options, "debugRows", "getAllCellsByColumnId"))
  };
  for (let g = 0; g < e._features.length; g++) {
    const a = e._features[g];
    a == null || a.createRow == null || a.createRow(u, e);
  }
  return u;
}, ve = {
  createColumn: (e, o) => {
    e._getFacetedRowModel = o.options.getFacetedRowModel && o.options.getFacetedRowModel(o, e.id), e.getFacetedRowModel = () => e._getFacetedRowModel ? e._getFacetedRowModel() : o.getPreFilteredRowModel(), e._getFacetedUniqueValues = o.options.getFacetedUniqueValues && o.options.getFacetedUniqueValues(o, e.id), e.getFacetedUniqueValues = () => e._getFacetedUniqueValues ? e._getFacetedUniqueValues() : /* @__PURE__ */ new Map(), e._getFacetedMinMaxValues = o.options.getFacetedMinMaxValues && o.options.getFacetedMinMaxValues(o, e.id), e.getFacetedMinMaxValues = () => {
      if (e._getFacetedMinMaxValues)
        return e._getFacetedMinMaxValues();
    };
  }
}, le = (e, o, t) => {
  var n, r;
  const i = t == null || (n = t.toString()) == null ? void 0 : n.toLowerCase();
  return !!(!((r = e.getValue(o)) == null || (r = r.toString()) == null || (r = r.toLowerCase()) == null) && r.includes(i));
};
le.autoRemove = (e) => P(e);
const se = (e, o, t) => {
  var n;
  return !!(!((n = e.getValue(o)) == null || (n = n.toString()) == null) && n.includes(t));
};
se.autoRemove = (e) => P(e);
const ue = (e, o, t) => {
  var n;
  return ((n = e.getValue(o)) == null || (n = n.toString()) == null ? void 0 : n.toLowerCase()) === t?.toLowerCase();
};
ue.autoRemove = (e) => P(e);
const ge = (e, o, t) => {
  var n;
  return (n = e.getValue(o)) == null ? void 0 : n.includes(t);
};
ge.autoRemove = (e) => P(e);
const ae = (e, o, t) => !t.some((n) => {
  var r;
  return !((r = e.getValue(o)) != null && r.includes(n));
});
ae.autoRemove = (e) => P(e) || !(e != null && e.length);
const de = (e, o, t) => t.some((n) => {
  var r;
  return (r = e.getValue(o)) == null ? void 0 : r.includes(n);
});
de.autoRemove = (e) => P(e) || !(e != null && e.length);
const fe = (e, o, t) => e.getValue(o) === t;
fe.autoRemove = (e) => P(e);
const ce = (e, o, t) => e.getValue(o) == t;
ce.autoRemove = (e) => P(e);
const b = (e, o, t) => {
  let [n, r] = t;
  const i = e.getValue(o);
  return i >= n && i <= r;
};
b.resolveFilterValue = (e) => {
  let [o, t] = e, n = typeof o != "number" ? parseFloat(o) : o, r = typeof t != "number" ? parseFloat(t) : t, i = o === null || Number.isNaN(n) ? -1 / 0 : n, l = t === null || Number.isNaN(r) ? 1 / 0 : r;
  if (i > l) {
    const u = i;
    i = l, l = u;
  }
  return [i, l];
};
b.autoRemove = (e) => P(e) || P(e[0]) && P(e[1]);
const x = {
  includesString: le,
  includesStringSensitive: se,
  equalsString: ue,
  arrIncludes: ge,
  arrIncludesAll: ae,
  arrIncludesSome: de,
  equals: fe,
  weakEquals: ce,
  inNumberRange: b
};
function P(e) {
  return e == null || e === "";
}
const _e = {
  getDefaultColumnDef: () => ({
    filterFn: "auto"
  }),
  getInitialState: (e) => ({
    columnFilters: [],
    ...e
  }),
  getDefaultOptions: (e) => ({
    onColumnFiltersChange: M("columnFilters", e),
    filterFromLeafRows: !1,
    maxLeafRowFilterDepth: 100
  }),
  createColumn: (e, o) => {
    e.getAutoFilterFn = () => {
      const t = o.getCoreRowModel().flatRows[0], n = t?.getValue(e.id);
      return typeof n == "string" ? x.includesString : typeof n == "number" ? x.inNumberRange : typeof n == "boolean" || n !== null && typeof n == "object" ? x.equals : Array.isArray(n) ? x.arrIncludes : x.weakEquals;
    }, e.getFilterFn = () => {
      var t, n;
      return B(e.columnDef.filterFn) ? e.columnDef.filterFn : e.columnDef.filterFn === "auto" ? e.getAutoFilterFn() : (
        // @ts-ignore
        (t = (n = o.options.filterFns) == null ? void 0 : n[e.columnDef.filterFn]) != null ? t : x[e.columnDef.filterFn]
      );
    }, e.getCanFilter = () => {
      var t, n, r;
      return ((t = e.columnDef.enableColumnFilter) != null ? t : !0) && ((n = o.options.enableColumnFilters) != null ? n : !0) && ((r = o.options.enableFilters) != null ? r : !0) && !!e.accessorFn;
    }, e.getIsFiltered = () => e.getFilterIndex() > -1, e.getFilterValue = () => {
      var t;
      return (t = o.getState().columnFilters) == null || (t = t.find((n) => n.id === e.id)) == null ? void 0 : t.value;
    }, e.getFilterIndex = () => {
      var t, n;
      return (t = (n = o.getState().columnFilters) == null ? void 0 : n.findIndex((r) => r.id === e.id)) != null ? t : -1;
    }, e.setFilterValue = (t) => {
      o.setColumnFilters((n) => {
        const r = e.getFilterFn(), i = n?.find((c) => c.id === e.id), l = I(t, i ? i.value : void 0);
        if (re(r, l, e)) {
          var u;
          return (u = n?.filter((c) => c.id !== e.id)) != null ? u : [];
        }
        const g = {
          id: e.id,
          value: l
        };
        if (i) {
          var a;
          return (a = n?.map((c) => c.id === e.id ? g : c)) != null ? a : [];
        }
        return n != null && n.length ? [...n, g] : [g];
      });
    };
  },
  createRow: (e, o) => {
    e.columnFilters = {}, e.columnFiltersMeta = {};
  },
  createTable: (e) => {
    e.setColumnFilters = (o) => {
      const t = e.getAllLeafColumns(), n = (r) => {
        var i;
        return (i = I(o, r)) == null ? void 0 : i.filter((l) => {
          const u = t.find((g) => g.id === l.id);
          if (u) {
            const g = u.getFilterFn();
            if (re(g, l.value, u))
              return !1;
          }
          return !0;
        });
      };
      e.options.onColumnFiltersChange == null || e.options.onColumnFiltersChange(n);
    }, e.resetColumnFilters = (o) => {
      var t, n;
      e.setColumnFilters(o ? [] : (t = (n = e.initialState) == null ? void 0 : n.columnFilters) != null ? t : []);
    }, e.getPreFilteredRowModel = () => e.getCoreRowModel(), e.getFilteredRowModel = () => (!e._getFilteredRowModel && e.options.getFilteredRowModel && (e._getFilteredRowModel = e.options.getFilteredRowModel(e)), e.options.manualFiltering || !e._getFilteredRowModel ? e.getPreFilteredRowModel() : e._getFilteredRowModel());
  }
};
function re(e, o, t) {
  return (e && e.autoRemove ? e.autoRemove(o, t) : !1) || typeof o > "u" || typeof o == "string" && !o;
}
const Fe = (e, o, t) => t.reduce((n, r) => {
  const i = r.getValue(e);
  return n + (typeof i == "number" ? i : 0);
}, 0), $e = (e, o, t) => {
  let n;
  return t.forEach((r) => {
    const i = r.getValue(e);
    i != null && (n > i || n === void 0 && i >= i) && (n = i);
  }), n;
}, Ve = (e, o, t) => {
  let n;
  return t.forEach((r) => {
    const i = r.getValue(e);
    i != null && (n < i || n === void 0 && i >= i) && (n = i);
  }), n;
}, Me = (e, o, t) => {
  let n, r;
  return t.forEach((i) => {
    const l = i.getValue(e);
    l != null && (n === void 0 ? l >= l && (n = r = l) : (n > l && (n = l), r < l && (r = l)));
  }), [n, r];
}, Pe = (e, o) => {
  let t = 0, n = 0;
  if (o.forEach((r) => {
    let i = r.getValue(e);
    i != null && (i = +i) >= i && (++t, n += i);
  }), t) return n / t;
}, xe = (e, o) => {
  if (!o.length)
    return;
  const t = o.map((i) => i.getValue(e));
  if (!Ce(t))
    return;
  if (t.length === 1)
    return t[0];
  const n = Math.floor(t.length / 2), r = t.sort((i, l) => i - l);
  return t.length % 2 !== 0 ? r[n] : (r[n - 1] + r[n]) / 2;
}, Ie = (e, o) => Array.from(new Set(o.map((t) => t.getValue(e))).values()), Ee = (e, o) => new Set(o.map((t) => t.getValue(e))).size, ye = (e, o) => o.length, q = {
  sum: Fe,
  min: $e,
  max: Ve,
  extent: Me,
  mean: Pe,
  median: xe,
  unique: Ie,
  uniqueCount: Ee,
  count: ye
}, De = {
  getDefaultColumnDef: () => ({
    aggregatedCell: (e) => {
      var o, t;
      return (o = (t = e.getValue()) == null || t.toString == null ? void 0 : t.toString()) != null ? o : null;
    },
    aggregationFn: "auto"
  }),
  getInitialState: (e) => ({
    grouping: [],
    ...e
  }),
  getDefaultOptions: (e) => ({
    onGroupingChange: M("grouping", e),
    groupedColumnMode: "reorder"
  }),
  createColumn: (e, o) => {
    e.toggleGrouping = () => {
      o.setGrouping((t) => t != null && t.includes(e.id) ? t.filter((n) => n !== e.id) : [...t ?? [], e.id]);
    }, e.getCanGroup = () => {
      var t, n;
      return ((t = e.columnDef.enableGrouping) != null ? t : !0) && ((n = o.options.enableGrouping) != null ? n : !0) && (!!e.accessorFn || !!e.columnDef.getGroupingValue);
    }, e.getIsGrouped = () => {
      var t;
      return (t = o.getState().grouping) == null ? void 0 : t.includes(e.id);
    }, e.getGroupedIndex = () => {
      var t;
      return (t = o.getState().grouping) == null ? void 0 : t.indexOf(e.id);
    }, e.getToggleGroupingHandler = () => {
      const t = e.getCanGroup();
      return () => {
        t && e.toggleGrouping();
      };
    }, e.getAutoAggregationFn = () => {
      const t = o.getCoreRowModel().flatRows[0], n = t?.getValue(e.id);
      if (typeof n == "number")
        return q.sum;
      if (Object.prototype.toString.call(n) === "[object Date]")
        return q.extent;
    }, e.getAggregationFn = () => {
      var t, n;
      if (!e)
        throw new Error();
      return B(e.columnDef.aggregationFn) ? e.columnDef.aggregationFn : e.columnDef.aggregationFn === "auto" ? e.getAutoAggregationFn() : (t = (n = o.options.aggregationFns) == null ? void 0 : n[e.columnDef.aggregationFn]) != null ? t : q[e.columnDef.aggregationFn];
    };
  },
  createTable: (e) => {
    e.setGrouping = (o) => e.options.onGroupingChange == null ? void 0 : e.options.onGroupingChange(o), e.resetGrouping = (o) => {
      var t, n;
      e.setGrouping(o ? [] : (t = (n = e.initialState) == null ? void 0 : n.grouping) != null ? t : []);
    }, e.getPreGroupedRowModel = () => e.getFilteredRowModel(), e.getGroupedRowModel = () => (!e._getGroupedRowModel && e.options.getGroupedRowModel && (e._getGroupedRowModel = e.options.getGroupedRowModel(e)), e.options.manualGrouping || !e._getGroupedRowModel ? e.getPreGroupedRowModel() : e._getGroupedRowModel());
  },
  createRow: (e, o) => {
    e.getIsGrouped = () => !!e.groupingColumnId, e.getGroupingValue = (t) => {
      if (e._groupingValuesCache.hasOwnProperty(t))
        return e._groupingValuesCache[t];
      const n = o.getColumn(t);
      return n != null && n.columnDef.getGroupingValue ? (e._groupingValuesCache[t] = n.columnDef.getGroupingValue(e.original), e._groupingValuesCache[t]) : e.getValue(t);
    }, e._groupingValuesCache = {};
  },
  createCell: (e, o, t, n) => {
    e.getIsGrouped = () => o.getIsGrouped() && o.id === t.groupingColumnId, e.getIsPlaceholder = () => !e.getIsGrouped() && o.getIsGrouped(), e.getIsAggregated = () => {
      var r;
      return !e.getIsGrouped() && !e.getIsPlaceholder() && !!((r = t.subRows) != null && r.length);
    };
  }
};
function Ge(e, o, t) {
  if (!(o != null && o.length) || !t)
    return e;
  const n = e.filter((i) => !o.includes(i.id));
  return t === "remove" ? n : [...o.map((i) => e.find((l) => l.id === i)).filter(Boolean), ...n];
}
const He = {
  getInitialState: (e) => ({
    columnOrder: [],
    ...e
  }),
  getDefaultOptions: (e) => ({
    onColumnOrderChange: M("columnOrder", e)
  }),
  createColumn: (e, o) => {
    e.getIndex = m((t) => [H(o, t)], (t) => t.findIndex((n) => n.id === e.id), C(o.options, "debugColumns", "getIndex")), e.getIsFirstColumn = (t) => {
      var n;
      return ((n = H(o, t)[0]) == null ? void 0 : n.id) === e.id;
    }, e.getIsLastColumn = (t) => {
      var n;
      const r = H(o, t);
      return ((n = r[r.length - 1]) == null ? void 0 : n.id) === e.id;
    };
  },
  createTable: (e) => {
    e.setColumnOrder = (o) => e.options.onColumnOrderChange == null ? void 0 : e.options.onColumnOrderChange(o), e.resetColumnOrder = (o) => {
      var t;
      e.setColumnOrder(o ? [] : (t = e.initialState.columnOrder) != null ? t : []);
    }, e._getOrderColumnsFn = m(() => [e.getState().columnOrder, e.getState().grouping, e.options.groupedColumnMode], (o, t, n) => (r) => {
      let i = [];
      if (!(o != null && o.length))
        i = r;
      else {
        const l = [...o], u = [...r];
        for (; u.length && l.length; ) {
          const g = l.shift(), a = u.findIndex((c) => c.id === g);
          a > -1 && i.push(u.splice(a, 1)[0]);
        }
        i = [...i, ...u];
      }
      return Ge(i, t, n);
    }, C(e.options, "debugTable", "_getOrderColumnsFn"));
  }
}, N = () => ({
  left: [],
  right: []
}), Le = {
  getInitialState: (e) => ({
    columnPinning: N(),
    ...e
  }),
  getDefaultOptions: (e) => ({
    onColumnPinningChange: M("columnPinning", e)
  }),
  createColumn: (e, o) => {
    e.pin = (t) => {
      const n = e.getLeafColumns().map((r) => r.id).filter(Boolean);
      o.setColumnPinning((r) => {
        var i, l;
        if (t === "right") {
          var u, g;
          return {
            left: ((u = r?.left) != null ? u : []).filter((S) => !(n != null && n.includes(S))),
            right: [...((g = r?.right) != null ? g : []).filter((S) => !(n != null && n.includes(S))), ...n]
          };
        }
        if (t === "left") {
          var a, c;
          return {
            left: [...((a = r?.left) != null ? a : []).filter((S) => !(n != null && n.includes(S))), ...n],
            right: ((c = r?.right) != null ? c : []).filter((S) => !(n != null && n.includes(S)))
          };
        }
        return {
          left: ((i = r?.left) != null ? i : []).filter((S) => !(n != null && n.includes(S))),
          right: ((l = r?.right) != null ? l : []).filter((S) => !(n != null && n.includes(S)))
        };
      });
    }, e.getCanPin = () => e.getLeafColumns().some((n) => {
      var r, i, l;
      return ((r = n.columnDef.enablePinning) != null ? r : !0) && ((i = (l = o.options.enableColumnPinning) != null ? l : o.options.enablePinning) != null ? i : !0);
    }), e.getIsPinned = () => {
      const t = e.getLeafColumns().map((u) => u.id), {
        left: n,
        right: r
      } = o.getState().columnPinning, i = t.some((u) => n?.includes(u)), l = t.some((u) => r?.includes(u));
      return i ? "left" : l ? "right" : !1;
    }, e.getPinnedIndex = () => {
      var t, n;
      const r = e.getIsPinned();
      return r ? (t = (n = o.getState().columnPinning) == null || (n = n[r]) == null ? void 0 : n.indexOf(e.id)) != null ? t : -1 : 0;
    };
  },
  createRow: (e, o) => {
    e.getCenterVisibleCells = m(() => [e._getAllVisibleCells(), o.getState().columnPinning.left, o.getState().columnPinning.right], (t, n, r) => {
      const i = [...n ?? [], ...r ?? []];
      return t.filter((l) => !i.includes(l.column.id));
    }, C(o.options, "debugRows", "getCenterVisibleCells")), e.getLeftVisibleCells = m(() => [e._getAllVisibleCells(), o.getState().columnPinning.left], (t, n) => (n ?? []).map((i) => t.find((l) => l.column.id === i)).filter(Boolean).map((i) => ({
      ...i,
      position: "left"
    })), C(o.options, "debugRows", "getLeftVisibleCells")), e.getRightVisibleCells = m(() => [e._getAllVisibleCells(), o.getState().columnPinning.right], (t, n) => (n ?? []).map((i) => t.find((l) => l.column.id === i)).filter(Boolean).map((i) => ({
      ...i,
      position: "right"
    })), C(o.options, "debugRows", "getRightVisibleCells"));
  },
  createTable: (e) => {
    e.setColumnPinning = (o) => e.options.onColumnPinningChange == null ? void 0 : e.options.onColumnPinningChange(o), e.resetColumnPinning = (o) => {
      var t, n;
      return e.setColumnPinning(o ? N() : (t = (n = e.initialState) == null ? void 0 : n.columnPinning) != null ? t : N());
    }, e.getIsSomeColumnsPinned = (o) => {
      var t;
      const n = e.getState().columnPinning;
      if (!o) {
        var r, i;
        return !!((r = n.left) != null && r.length || (i = n.right) != null && i.length);
      }
      return !!((t = n[o]) != null && t.length);
    }, e.getLeftLeafColumns = m(() => [e.getAllLeafColumns(), e.getState().columnPinning.left], (o, t) => (t ?? []).map((n) => o.find((r) => r.id === n)).filter(Boolean), C(e.options, "debugColumns", "getLeftLeafColumns")), e.getRightLeafColumns = m(() => [e.getAllLeafColumns(), e.getState().columnPinning.right], (o, t) => (t ?? []).map((n) => o.find((r) => r.id === n)).filter(Boolean), C(e.options, "debugColumns", "getRightLeafColumns")), e.getCenterLeafColumns = m(() => [e.getAllLeafColumns(), e.getState().columnPinning.left, e.getState().columnPinning.right], (o, t, n) => {
      const r = [...t ?? [], ...n ?? []];
      return o.filter((i) => !r.includes(i.id));
    }, C(e.options, "debugColumns", "getCenterLeafColumns"));
  }
};
function Ae(e) {
  return e || (typeof document < "u" ? document : null);
}
const z = {
  size: 150,
  minSize: 20,
  maxSize: Number.MAX_SAFE_INTEGER
}, k = () => ({
  startOffset: null,
  startSize: null,
  deltaOffset: null,
  deltaPercentage: null,
  isResizingColumn: !1,
  columnSizingStart: []
}), ze = {
  getDefaultColumnDef: () => z,
  getInitialState: (e) => ({
    columnSizing: {},
    columnSizingInfo: k(),
    ...e
  }),
  getDefaultOptions: (e) => ({
    columnResizeMode: "onEnd",
    columnResizeDirection: "ltr",
    onColumnSizingChange: M("columnSizing", e),
    onColumnSizingInfoChange: M("columnSizingInfo", e)
  }),
  createColumn: (e, o) => {
    e.getSize = () => {
      var t, n, r;
      const i = o.getState().columnSizing[e.id];
      return Math.min(Math.max((t = e.columnDef.minSize) != null ? t : z.minSize, (n = i ?? e.columnDef.size) != null ? n : z.size), (r = e.columnDef.maxSize) != null ? r : z.maxSize);
    }, e.getStart = m((t) => [t, H(o, t), o.getState().columnSizing], (t, n) => n.slice(0, e.getIndex(t)).reduce((r, i) => r + i.getSize(), 0), C(o.options, "debugColumns", "getStart")), e.getAfter = m((t) => [t, H(o, t), o.getState().columnSizing], (t, n) => n.slice(e.getIndex(t) + 1).reduce((r, i) => r + i.getSize(), 0), C(o.options, "debugColumns", "getAfter")), e.resetSize = () => {
      o.setColumnSizing((t) => {
        let {
          [e.id]: n,
          ...r
        } = t;
        return r;
      });
    }, e.getCanResize = () => {
      var t, n;
      return ((t = e.columnDef.enableResizing) != null ? t : !0) && ((n = o.options.enableColumnResizing) != null ? n : !0);
    }, e.getIsResizing = () => o.getState().columnSizingInfo.isResizingColumn === e.id;
  },
  createHeader: (e, o) => {
    e.getSize = () => {
      let t = 0;
      const n = (r) => {
        if (r.subHeaders.length)
          r.subHeaders.forEach(n);
        else {
          var i;
          t += (i = r.column.getSize()) != null ? i : 0;
        }
      };
      return n(e), t;
    }, e.getStart = () => {
      if (e.index > 0) {
        const t = e.headerGroup.headers[e.index - 1];
        return t.getStart() + t.getSize();
      }
      return 0;
    }, e.getResizeHandler = (t) => {
      const n = o.getColumn(e.column.id), r = n?.getCanResize();
      return (i) => {
        if (!n || !r || (i.persist == null || i.persist(), j(i) && i.touches && i.touches.length > 1))
          return;
        const l = e.getSize(), u = e ? e.getLeafHeaders().map((R) => [R.column.id, R.column.getSize()]) : [[n.id, n.getSize()]], g = j(i) ? Math.round(i.touches[0].clientX) : i.clientX, a = {}, c = (R, h) => {
          typeof h == "number" && (o.setColumnSizingInfo((_) => {
            var V, F;
            const v = o.options.columnResizeDirection === "rtl" ? -1 : 1, y = (h - ((V = _?.startOffset) != null ? V : 0)) * v, D = Math.max(y / ((F = _?.startSize) != null ? F : 0), -0.999999);
            return _.columnSizingStart.forEach((L) => {
              let [me, ne] = L;
              a[me] = Math.round(Math.max(ne + ne * D, 0) * 100) / 100;
            }), {
              ..._,
              deltaOffset: y,
              deltaPercentage: D
            };
          }), (o.options.columnResizeMode === "onChange" || R === "end") && o.setColumnSizing((_) => ({
            ..._,
            ...a
          })));
        }, S = (R) => c("move", R), d = (R) => {
          c("end", R), o.setColumnSizingInfo((h) => ({
            ...h,
            isResizingColumn: !1,
            startOffset: null,
            startSize: null,
            deltaOffset: null,
            deltaPercentage: null,
            columnSizingStart: []
          }));
        }, s = Ae(t), f = {
          moveHandler: (R) => S(R.clientX),
          upHandler: (R) => {
            s?.removeEventListener("mousemove", f.moveHandler), s?.removeEventListener("mouseup", f.upHandler), d(R.clientX);
          }
        }, p = {
          moveHandler: (R) => (R.cancelable && (R.preventDefault(), R.stopPropagation()), S(R.touches[0].clientX), !1),
          upHandler: (R) => {
            var h;
            s?.removeEventListener("touchmove", p.moveHandler), s?.removeEventListener("touchend", p.upHandler), R.cancelable && (R.preventDefault(), R.stopPropagation()), d((h = R.touches[0]) == null ? void 0 : h.clientX);
          }
        }, w = Oe() ? {
          passive: !1
        } : !1;
        j(i) ? (s?.addEventListener("touchmove", p.moveHandler, w), s?.addEventListener("touchend", p.upHandler, w)) : (s?.addEventListener("mousemove", f.moveHandler, w), s?.addEventListener("mouseup", f.upHandler, w)), o.setColumnSizingInfo((R) => ({
          ...R,
          startOffset: g,
          startSize: l,
          deltaOffset: 0,
          deltaPercentage: 0,
          columnSizingStart: u,
          isResizingColumn: n.id
        }));
      };
    };
  },
  createTable: (e) => {
    e.setColumnSizing = (o) => e.options.onColumnSizingChange == null ? void 0 : e.options.onColumnSizingChange(o), e.setColumnSizingInfo = (o) => e.options.onColumnSizingInfoChange == null ? void 0 : e.options.onColumnSizingInfoChange(o), e.resetColumnSizing = (o) => {
      var t;
      e.setColumnSizing(o ? {} : (t = e.initialState.columnSizing) != null ? t : {});
    }, e.resetHeaderSizeInfo = (o) => {
      var t;
      e.setColumnSizingInfo(o ? k() : (t = e.initialState.columnSizingInfo) != null ? t : k());
    }, e.getTotalSize = () => {
      var o, t;
      return (o = (t = e.getHeaderGroups()[0]) == null ? void 0 : t.headers.reduce((n, r) => n + r.getSize(), 0)) != null ? o : 0;
    }, e.getLeftTotalSize = () => {
      var o, t;
      return (o = (t = e.getLeftHeaderGroups()[0]) == null ? void 0 : t.headers.reduce((n, r) => n + r.getSize(), 0)) != null ? o : 0;
    }, e.getCenterTotalSize = () => {
      var o, t;
      return (o = (t = e.getCenterHeaderGroups()[0]) == null ? void 0 : t.headers.reduce((n, r) => n + r.getSize(), 0)) != null ? o : 0;
    }, e.getRightTotalSize = () => {
      var o, t;
      return (o = (t = e.getRightHeaderGroups()[0]) == null ? void 0 : t.headers.reduce((n, r) => n + r.getSize(), 0)) != null ? o : 0;
    };
  }
};
let O = null;
function Oe() {
  if (typeof O == "boolean") return O;
  let e = !1;
  try {
    const o = {
      get passive() {
        return e = !0, !1;
      }
    }, t = () => {
    };
    window.addEventListener("test", t, o), window.removeEventListener("test", t);
  } catch {
    e = !1;
  }
  return O = e, O;
}
function j(e) {
  return e.type === "touchstart";
}
const Be = {
  getInitialState: (e) => ({
    columnVisibility: {},
    ...e
  }),
  getDefaultOptions: (e) => ({
    onColumnVisibilityChange: M("columnVisibility", e)
  }),
  createColumn: (e, o) => {
    e.toggleVisibility = (t) => {
      e.getCanHide() && o.setColumnVisibility((n) => ({
        ...n,
        [e.id]: t ?? !e.getIsVisible()
      }));
    }, e.getIsVisible = () => {
      var t, n;
      const r = e.columns;
      return (t = r.length ? r.some((i) => i.getIsVisible()) : (n = o.getState().columnVisibility) == null ? void 0 : n[e.id]) != null ? t : !0;
    }, e.getCanHide = () => {
      var t, n;
      return ((t = e.columnDef.enableHiding) != null ? t : !0) && ((n = o.options.enableHiding) != null ? n : !0);
    }, e.getToggleVisibilityHandler = () => (t) => {
      e.toggleVisibility == null || e.toggleVisibility(t.target.checked);
    };
  },
  createRow: (e, o) => {
    e._getAllVisibleCells = m(() => [e.getAllCells(), o.getState().columnVisibility], (t) => t.filter((n) => n.column.getIsVisible()), C(o.options, "debugRows", "_getAllVisibleCells")), e.getVisibleCells = m(() => [e.getLeftVisibleCells(), e.getCenterVisibleCells(), e.getRightVisibleCells()], (t, n, r) => [...t, ...n, ...r], C(o.options, "debugRows", "getVisibleCells"));
  },
  createTable: (e) => {
    const o = (t, n) => m(() => [n(), n().filter((r) => r.getIsVisible()).map((r) => r.id).join("_")], (r) => r.filter((i) => i.getIsVisible == null ? void 0 : i.getIsVisible()), C(e.options, "debugColumns", t));
    e.getVisibleFlatColumns = o("getVisibleFlatColumns", () => e.getAllFlatColumns()), e.getVisibleLeafColumns = o("getVisibleLeafColumns", () => e.getAllLeafColumns()), e.getLeftVisibleLeafColumns = o("getLeftVisibleLeafColumns", () => e.getLeftLeafColumns()), e.getRightVisibleLeafColumns = o("getRightVisibleLeafColumns", () => e.getRightLeafColumns()), e.getCenterVisibleLeafColumns = o("getCenterVisibleLeafColumns", () => e.getCenterLeafColumns()), e.setColumnVisibility = (t) => e.options.onColumnVisibilityChange == null ? void 0 : e.options.onColumnVisibilityChange(t), e.resetColumnVisibility = (t) => {
      var n;
      e.setColumnVisibility(t ? {} : (n = e.initialState.columnVisibility) != null ? n : {});
    }, e.toggleAllColumnsVisible = (t) => {
      var n;
      t = (n = t) != null ? n : !e.getIsAllColumnsVisible(), e.setColumnVisibility(e.getAllLeafColumns().reduce((r, i) => ({
        ...r,
        [i.id]: t || !(i.getCanHide != null && i.getCanHide())
      }), {}));
    }, e.getIsAllColumnsVisible = () => !e.getAllLeafColumns().some((t) => !(t.getIsVisible != null && t.getIsVisible())), e.getIsSomeColumnsVisible = () => e.getAllLeafColumns().some((t) => t.getIsVisible == null ? void 0 : t.getIsVisible()), e.getToggleAllColumnsVisibilityHandler = () => (t) => {
      var n;
      e.toggleAllColumnsVisible((n = t.target) == null ? void 0 : n.checked);
    };
  }
};
function H(e, o) {
  return o ? o === "center" ? e.getCenterVisibleLeafColumns() : o === "left" ? e.getLeftVisibleLeafColumns() : e.getRightVisibleLeafColumns() : e.getVisibleLeafColumns();
}
const Te = {
  createTable: (e) => {
    e._getGlobalFacetedRowModel = e.options.getFacetedRowModel && e.options.getFacetedRowModel(e, "__global__"), e.getGlobalFacetedRowModel = () => e.options.manualFiltering || !e._getGlobalFacetedRowModel ? e.getPreFilteredRowModel() : e._getGlobalFacetedRowModel(), e._getGlobalFacetedUniqueValues = e.options.getFacetedUniqueValues && e.options.getFacetedUniqueValues(e, "__global__"), e.getGlobalFacetedUniqueValues = () => e._getGlobalFacetedUniqueValues ? e._getGlobalFacetedUniqueValues() : /* @__PURE__ */ new Map(), e._getGlobalFacetedMinMaxValues = e.options.getFacetedMinMaxValues && e.options.getFacetedMinMaxValues(e, "__global__"), e.getGlobalFacetedMinMaxValues = () => {
      if (e._getGlobalFacetedMinMaxValues)
        return e._getGlobalFacetedMinMaxValues();
    };
  }
}, qe = {
  getInitialState: (e) => ({
    globalFilter: void 0,
    ...e
  }),
  getDefaultOptions: (e) => ({
    onGlobalFilterChange: M("globalFilter", e),
    globalFilterFn: "auto",
    getColumnCanGlobalFilter: (o) => {
      var t;
      const n = (t = e.getCoreRowModel().flatRows[0]) == null || (t = t._getAllCellsByColumnId()[o.id]) == null ? void 0 : t.getValue();
      return typeof n == "string" || typeof n == "number";
    }
  }),
  createColumn: (e, o) => {
    e.getCanGlobalFilter = () => {
      var t, n, r, i;
      return ((t = e.columnDef.enableGlobalFilter) != null ? t : !0) && ((n = o.options.enableGlobalFilter) != null ? n : !0) && ((r = o.options.enableFilters) != null ? r : !0) && ((i = o.options.getColumnCanGlobalFilter == null ? void 0 : o.options.getColumnCanGlobalFilter(e)) != null ? i : !0) && !!e.accessorFn;
    };
  },
  createTable: (e) => {
    e.getGlobalAutoFilterFn = () => x.includesString, e.getGlobalFilterFn = () => {
      var o, t;
      const {
        globalFilterFn: n
      } = e.options;
      return B(n) ? n : n === "auto" ? e.getGlobalAutoFilterFn() : (o = (t = e.options.filterFns) == null ? void 0 : t[n]) != null ? o : x[n];
    }, e.setGlobalFilter = (o) => {
      e.options.onGlobalFilterChange == null || e.options.onGlobalFilterChange(o);
    }, e.resetGlobalFilter = (o) => {
      e.setGlobalFilter(o ? void 0 : e.initialState.globalFilter);
    };
  }
}, Ne = {
  getInitialState: (e) => ({
    expanded: {},
    ...e
  }),
  getDefaultOptions: (e) => ({
    onExpandedChange: M("expanded", e),
    paginateExpandedRows: !0
  }),
  createTable: (e) => {
    let o = !1, t = !1;
    e._autoResetExpanded = () => {
      var n, r;
      if (!o) {
        e._queue(() => {
          o = !0;
        });
        return;
      }
      if ((n = (r = e.options.autoResetAll) != null ? r : e.options.autoResetExpanded) != null ? n : !e.options.manualExpanding) {
        if (t) return;
        t = !0, e._queue(() => {
          e.resetExpanded(), t = !1;
        });
      }
    }, e.setExpanded = (n) => e.options.onExpandedChange == null ? void 0 : e.options.onExpandedChange(n), e.toggleAllRowsExpanded = (n) => {
      n ?? !e.getIsAllRowsExpanded() ? e.setExpanded(!0) : e.setExpanded({});
    }, e.resetExpanded = (n) => {
      var r, i;
      e.setExpanded(n ? {} : (r = (i = e.initialState) == null ? void 0 : i.expanded) != null ? r : {});
    }, e.getCanSomeRowsExpand = () => e.getPrePaginationRowModel().flatRows.some((n) => n.getCanExpand()), e.getToggleAllRowsExpandedHandler = () => (n) => {
      n.persist == null || n.persist(), e.toggleAllRowsExpanded();
    }, e.getIsSomeRowsExpanded = () => {
      const n = e.getState().expanded;
      return n === !0 || Object.values(n).some(Boolean);
    }, e.getIsAllRowsExpanded = () => {
      const n = e.getState().expanded;
      return typeof n == "boolean" ? n === !0 : !(!Object.keys(n).length || e.getRowModel().flatRows.some((r) => !r.getIsExpanded()));
    }, e.getExpandedDepth = () => {
      let n = 0;
      return (e.getState().expanded === !0 ? Object.keys(e.getRowModel().rowsById) : Object.keys(e.getState().expanded)).forEach((i) => {
        const l = i.split(".");
        n = Math.max(n, l.length);
      }), n;
    }, e.getPreExpandedRowModel = () => e.getSortedRowModel(), e.getExpandedRowModel = () => (!e._getExpandedRowModel && e.options.getExpandedRowModel && (e._getExpandedRowModel = e.options.getExpandedRowModel(e)), e.options.manualExpanding || !e._getExpandedRowModel ? e.getPreExpandedRowModel() : e._getExpandedRowModel());
  },
  createRow: (e, o) => {
    e.toggleExpanded = (t) => {
      o.setExpanded((n) => {
        var r;
        const i = n === !0 ? !0 : !!(n != null && n[e.id]);
        let l = {};
        if (n === !0 ? Object.keys(o.getRowModel().rowsById).forEach((u) => {
          l[u] = !0;
        }) : l = n, t = (r = t) != null ? r : !i, !i && t)
          return {
            ...l,
            [e.id]: !0
          };
        if (i && !t) {
          const {
            [e.id]: u,
            ...g
          } = l;
          return g;
        }
        return n;
      });
    }, e.getIsExpanded = () => {
      var t;
      const n = o.getState().expanded;
      return !!((t = o.options.getIsRowExpanded == null ? void 0 : o.options.getIsRowExpanded(e)) != null ? t : n === !0 || n?.[e.id]);
    }, e.getCanExpand = () => {
      var t, n, r;
      return (t = o.options.getRowCanExpand == null ? void 0 : o.options.getRowCanExpand(e)) != null ? t : ((n = o.options.enableExpanding) != null ? n : !0) && !!((r = e.subRows) != null && r.length);
    }, e.getIsAllParentsExpanded = () => {
      let t = !0, n = e;
      for (; t && n.parentId; )
        n = o.getRow(n.parentId, !0), t = n.getIsExpanded();
      return t;
    }, e.getToggleExpandedHandler = () => {
      const t = e.getCanExpand();
      return () => {
        t && e.toggleExpanded();
      };
    };
  }
}, J = 0, Q = 10, U = () => ({
  pageIndex: J,
  pageSize: Q
}), ke = {
  getInitialState: (e) => ({
    ...e,
    pagination: {
      ...U(),
      ...e?.pagination
    }
  }),
  getDefaultOptions: (e) => ({
    onPaginationChange: M("pagination", e)
  }),
  createTable: (e) => {
    let o = !1, t = !1;
    e._autoResetPageIndex = () => {
      var n, r;
      if (!o) {
        e._queue(() => {
          o = !0;
        });
        return;
      }
      if ((n = (r = e.options.autoResetAll) != null ? r : e.options.autoResetPageIndex) != null ? n : !e.options.manualPagination) {
        if (t) return;
        t = !0, e._queue(() => {
          e.resetPageIndex(), t = !1;
        });
      }
    }, e.setPagination = (n) => {
      const r = (i) => I(n, i);
      return e.options.onPaginationChange == null ? void 0 : e.options.onPaginationChange(r);
    }, e.resetPagination = (n) => {
      var r;
      e.setPagination(n ? U() : (r = e.initialState.pagination) != null ? r : U());
    }, e.setPageIndex = (n) => {
      e.setPagination((r) => {
        let i = I(n, r.pageIndex);
        const l = typeof e.options.pageCount > "u" || e.options.pageCount === -1 ? Number.MAX_SAFE_INTEGER : e.options.pageCount - 1;
        return i = Math.max(0, Math.min(i, l)), {
          ...r,
          pageIndex: i
        };
      });
    }, e.resetPageIndex = (n) => {
      var r, i;
      e.setPageIndex(n ? J : (r = (i = e.initialState) == null || (i = i.pagination) == null ? void 0 : i.pageIndex) != null ? r : J);
    }, e.resetPageSize = (n) => {
      var r, i;
      e.setPageSize(n ? Q : (r = (i = e.initialState) == null || (i = i.pagination) == null ? void 0 : i.pageSize) != null ? r : Q);
    }, e.setPageSize = (n) => {
      e.setPagination((r) => {
        const i = Math.max(1, I(n, r.pageSize)), l = r.pageSize * r.pageIndex, u = Math.floor(l / i);
        return {
          ...r,
          pageIndex: u,
          pageSize: i
        };
      });
    }, e.setPageCount = (n) => e.setPagination((r) => {
      var i;
      let l = I(n, (i = e.options.pageCount) != null ? i : -1);
      return typeof l == "number" && (l = Math.max(-1, l)), {
        ...r,
        pageCount: l
      };
    }), e.getPageOptions = m(() => [e.getPageCount()], (n) => {
      let r = [];
      return n && n > 0 && (r = [...new Array(n)].fill(null).map((i, l) => l)), r;
    }, C(e.options, "debugTable", "getPageOptions")), e.getCanPreviousPage = () => e.getState().pagination.pageIndex > 0, e.getCanNextPage = () => {
      const {
        pageIndex: n
      } = e.getState().pagination, r = e.getPageCount();
      return r === -1 ? !0 : r === 0 ? !1 : n < r - 1;
    }, e.previousPage = () => e.setPageIndex((n) => n - 1), e.nextPage = () => e.setPageIndex((n) => n + 1), e.firstPage = () => e.setPageIndex(0), e.lastPage = () => e.setPageIndex(e.getPageCount() - 1), e.getPrePaginationRowModel = () => e.getExpandedRowModel(), e.getPaginationRowModel = () => (!e._getPaginationRowModel && e.options.getPaginationRowModel && (e._getPaginationRowModel = e.options.getPaginationRowModel(e)), e.options.manualPagination || !e._getPaginationRowModel ? e.getPrePaginationRowModel() : e._getPaginationRowModel()), e.getPageCount = () => {
      var n;
      return (n = e.options.pageCount) != null ? n : Math.ceil(e.getRowCount() / e.getState().pagination.pageSize);
    }, e.getRowCount = () => {
      var n;
      return (n = e.options.rowCount) != null ? n : e.getPrePaginationRowModel().rows.length;
    };
  }
}, X = () => ({
  top: [],
  bottom: []
}), je = {
  getInitialState: (e) => ({
    rowPinning: X(),
    ...e
  }),
  getDefaultOptions: (e) => ({
    onRowPinningChange: M("rowPinning", e)
  }),
  createRow: (e, o) => {
    e.pin = (t, n, r) => {
      const i = n ? e.getLeafRows().map((g) => {
        let {
          id: a
        } = g;
        return a;
      }) : [], l = r ? e.getParentRows().map((g) => {
        let {
          id: a
        } = g;
        return a;
      }) : [], u = /* @__PURE__ */ new Set([...l, e.id, ...i]);
      o.setRowPinning((g) => {
        var a, c;
        if (t === "bottom") {
          var S, d;
          return {
            top: ((S = g?.top) != null ? S : []).filter((p) => !(u != null && u.has(p))),
            bottom: [...((d = g?.bottom) != null ? d : []).filter((p) => !(u != null && u.has(p))), ...Array.from(u)]
          };
        }
        if (t === "top") {
          var s, f;
          return {
            top: [...((s = g?.top) != null ? s : []).filter((p) => !(u != null && u.has(p))), ...Array.from(u)],
            bottom: ((f = g?.bottom) != null ? f : []).filter((p) => !(u != null && u.has(p)))
          };
        }
        return {
          top: ((a = g?.top) != null ? a : []).filter((p) => !(u != null && u.has(p))),
          bottom: ((c = g?.bottom) != null ? c : []).filter((p) => !(u != null && u.has(p)))
        };
      });
    }, e.getCanPin = () => {
      var t;
      const {
        enableRowPinning: n,
        enablePinning: r
      } = o.options;
      return typeof n == "function" ? n(e) : (t = n ?? r) != null ? t : !0;
    }, e.getIsPinned = () => {
      const t = [e.id], {
        top: n,
        bottom: r
      } = o.getState().rowPinning, i = t.some((u) => n?.includes(u)), l = t.some((u) => r?.includes(u));
      return i ? "top" : l ? "bottom" : !1;
    }, e.getPinnedIndex = () => {
      var t, n;
      const r = e.getIsPinned();
      if (!r) return -1;
      const i = (t = r === "top" ? o.getTopRows() : o.getBottomRows()) == null ? void 0 : t.map((l) => {
        let {
          id: u
        } = l;
        return u;
      });
      return (n = i?.indexOf(e.id)) != null ? n : -1;
    };
  },
  createTable: (e) => {
    e.setRowPinning = (o) => e.options.onRowPinningChange == null ? void 0 : e.options.onRowPinningChange(o), e.resetRowPinning = (o) => {
      var t, n;
      return e.setRowPinning(o ? X() : (t = (n = e.initialState) == null ? void 0 : n.rowPinning) != null ? t : X());
    }, e.getIsSomeRowsPinned = (o) => {
      var t;
      const n = e.getState().rowPinning;
      if (!o) {
        var r, i;
        return !!((r = n.top) != null && r.length || (i = n.bottom) != null && i.length);
      }
      return !!((t = n[o]) != null && t.length);
    }, e._getPinnedRows = (o, t, n) => {
      var r;
      return ((r = e.options.keepPinnedRows) == null || r ? (
        //get all rows that are pinned even if they would not be otherwise visible
        //account for expanded parent rows, but not pagination or filtering
        (t ?? []).map((l) => {
          const u = e.getRow(l, !0);
          return u.getIsAllParentsExpanded() ? u : null;
        })
      ) : (
        //else get only visible rows that are pinned
        (t ?? []).map((l) => o.find((u) => u.id === l))
      )).filter(Boolean).map((l) => ({
        ...l,
        position: n
      }));
    }, e.getTopRows = m(() => [e.getRowModel().rows, e.getState().rowPinning.top], (o, t) => e._getPinnedRows(o, t, "top"), C(e.options, "debugRows", "getTopRows")), e.getBottomRows = m(() => [e.getRowModel().rows, e.getState().rowPinning.bottom], (o, t) => e._getPinnedRows(o, t, "bottom"), C(e.options, "debugRows", "getBottomRows")), e.getCenterRows = m(() => [e.getRowModel().rows, e.getState().rowPinning.top, e.getState().rowPinning.bottom], (o, t, n) => {
      const r = /* @__PURE__ */ new Set([...t ?? [], ...n ?? []]);
      return o.filter((i) => !r.has(i.id));
    }, C(e.options, "debugRows", "getCenterRows"));
  }
}, Ue = {
  getInitialState: (e) => ({
    rowSelection: {},
    ...e
  }),
  getDefaultOptions: (e) => ({
    onRowSelectionChange: M("rowSelection", e),
    enableRowSelection: !0,
    enableMultiRowSelection: !0,
    enableSubRowSelection: !0
    // enableGroupingRowSelection: false,
    // isAdditiveSelectEvent: (e: unknown) => !!e.metaKey,
    // isInclusiveSelectEvent: (e: unknown) => !!e.shiftKey,
  }),
  createTable: (e) => {
    e.setRowSelection = (o) => e.options.onRowSelectionChange == null ? void 0 : e.options.onRowSelectionChange(o), e.resetRowSelection = (o) => {
      var t;
      return e.setRowSelection(o ? {} : (t = e.initialState.rowSelection) != null ? t : {});
    }, e.toggleAllRowsSelected = (o) => {
      e.setRowSelection((t) => {
        o = typeof o < "u" ? o : !e.getIsAllRowsSelected();
        const n = {
          ...t
        }, r = e.getPreGroupedRowModel().flatRows;
        return o ? r.forEach((i) => {
          i.getCanSelect() && (n[i.id] = !0);
        }) : r.forEach((i) => {
          delete n[i.id];
        }), n;
      });
    }, e.toggleAllPageRowsSelected = (o) => e.setRowSelection((t) => {
      const n = typeof o < "u" ? o : !e.getIsAllPageRowsSelected(), r = {
        ...t
      };
      return e.getRowModel().rows.forEach((i) => {
        W(r, i.id, n, !0, e);
      }), r;
    }), e.getPreSelectedRowModel = () => e.getCoreRowModel(), e.getSelectedRowModel = m(() => [e.getState().rowSelection, e.getCoreRowModel()], (o, t) => Object.keys(o).length ? K(e, t) : {
      rows: [],
      flatRows: [],
      rowsById: {}
    }, C(e.options, "debugTable", "getSelectedRowModel")), e.getFilteredSelectedRowModel = m(() => [e.getState().rowSelection, e.getFilteredRowModel()], (o, t) => Object.keys(o).length ? K(e, t) : {
      rows: [],
      flatRows: [],
      rowsById: {}
    }, C(e.options, "debugTable", "getFilteredSelectedRowModel")), e.getGroupedSelectedRowModel = m(() => [e.getState().rowSelection, e.getSortedRowModel()], (o, t) => Object.keys(o).length ? K(e, t) : {
      rows: [],
      flatRows: [],
      rowsById: {}
    }, C(e.options, "debugTable", "getGroupedSelectedRowModel")), e.getIsAllRowsSelected = () => {
      const o = e.getFilteredRowModel().flatRows, {
        rowSelection: t
      } = e.getState();
      let n = !!(o.length && Object.keys(t).length);
      return n && o.some((r) => r.getCanSelect() && !t[r.id]) && (n = !1), n;
    }, e.getIsAllPageRowsSelected = () => {
      const o = e.getPaginationRowModel().flatRows.filter((r) => r.getCanSelect()), {
        rowSelection: t
      } = e.getState();
      let n = !!o.length;
      return n && o.some((r) => !t[r.id]) && (n = !1), n;
    }, e.getIsSomeRowsSelected = () => {
      var o;
      const t = Object.keys((o = e.getState().rowSelection) != null ? o : {}).length;
      return t > 0 && t < e.getFilteredRowModel().flatRows.length;
    }, e.getIsSomePageRowsSelected = () => {
      const o = e.getPaginationRowModel().flatRows;
      return e.getIsAllPageRowsSelected() ? !1 : o.filter((t) => t.getCanSelect()).some((t) => t.getIsSelected() || t.getIsSomeSelected());
    }, e.getToggleAllRowsSelectedHandler = () => (o) => {
      e.toggleAllRowsSelected(o.target.checked);
    }, e.getToggleAllPageRowsSelectedHandler = () => (o) => {
      e.toggleAllPageRowsSelected(o.target.checked);
    };
  },
  createRow: (e, o) => {
    e.toggleSelected = (t, n) => {
      const r = e.getIsSelected();
      o.setRowSelection((i) => {
        var l;
        if (t = typeof t < "u" ? t : !r, e.getCanSelect() && r === t)
          return i;
        const u = {
          ...i
        };
        return W(u, e.id, t, (l = n?.selectChildren) != null ? l : !0, o), u;
      });
    }, e.getIsSelected = () => {
      const {
        rowSelection: t
      } = o.getState();
      return ee(e, t);
    }, e.getIsSomeSelected = () => {
      const {
        rowSelection: t
      } = o.getState();
      return Y(e, t) === "some";
    }, e.getIsAllSubRowsSelected = () => {
      const {
        rowSelection: t
      } = o.getState();
      return Y(e, t) === "all";
    }, e.getCanSelect = () => {
      var t;
      return typeof o.options.enableRowSelection == "function" ? o.options.enableRowSelection(e) : (t = o.options.enableRowSelection) != null ? t : !0;
    }, e.getCanSelectSubRows = () => {
      var t;
      return typeof o.options.enableSubRowSelection == "function" ? o.options.enableSubRowSelection(e) : (t = o.options.enableSubRowSelection) != null ? t : !0;
    }, e.getCanMultiSelect = () => {
      var t;
      return typeof o.options.enableMultiRowSelection == "function" ? o.options.enableMultiRowSelection(e) : (t = o.options.enableMultiRowSelection) != null ? t : !0;
    }, e.getToggleSelectedHandler = () => {
      const t = e.getCanSelect();
      return (n) => {
        var r;
        t && e.toggleSelected((r = n.target) == null ? void 0 : r.checked);
      };
    };
  }
}, W = (e, o, t, n, r) => {
  var i;
  const l = r.getRow(o, !0);
  t ? (l.getCanMultiSelect() || Object.keys(e).forEach((u) => delete e[u]), l.getCanSelect() && (e[o] = !0)) : delete e[o], n && (i = l.subRows) != null && i.length && l.getCanSelectSubRows() && l.subRows.forEach((u) => W(e, u.id, t, n, r));
};
function K(e, o) {
  const t = e.getState().rowSelection, n = [], r = {}, i = function(l, u) {
    return l.map((g) => {
      var a;
      const c = ee(g, t);
      if (c && (n.push(g), r[g.id] = g), (a = g.subRows) != null && a.length && (g = {
        ...g,
        subRows: i(g.subRows)
      }), c)
        return g;
    }).filter(Boolean);
  };
  return {
    rows: i(o.rows),
    flatRows: n,
    rowsById: r
  };
}
function ee(e, o) {
  var t;
  return (t = o[e.id]) != null ? t : !1;
}
function Y(e, o, t) {
  var n;
  if (!((n = e.subRows) != null && n.length)) return !1;
  let r = !0, i = !1;
  return e.subRows.forEach((l) => {
    if (!(i && !r) && (l.getCanSelect() && (ee(l, o) ? i = !0 : r = !1), l.subRows && l.subRows.length)) {
      const u = Y(l, o);
      u === "all" ? i = !0 : (u === "some" && (i = !0), r = !1);
    }
  }), r ? "all" : i ? "some" : !1;
}
const Z = /([0-9]+)/gm, Xe = (e, o, t) => pe(E(e.getValue(t)).toLowerCase(), E(o.getValue(t)).toLowerCase()), Ke = (e, o, t) => pe(E(e.getValue(t)), E(o.getValue(t))), Je = (e, o, t) => te(E(e.getValue(t)).toLowerCase(), E(o.getValue(t)).toLowerCase()), Qe = (e, o, t) => te(E(e.getValue(t)), E(o.getValue(t))), We = (e, o, t) => {
  const n = e.getValue(t), r = o.getValue(t);
  return n > r ? 1 : n < r ? -1 : 0;
}, Ye = (e, o, t) => te(e.getValue(t), o.getValue(t));
function te(e, o) {
  return e === o ? 0 : e > o ? 1 : -1;
}
function E(e) {
  return typeof e == "number" ? isNaN(e) || e === 1 / 0 || e === -1 / 0 ? "" : String(e) : typeof e == "string" ? e : "";
}
function pe(e, o) {
  const t = e.split(Z).filter(Boolean), n = o.split(Z).filter(Boolean);
  for (; t.length && n.length; ) {
    const r = t.shift(), i = n.shift(), l = parseInt(r, 10), u = parseInt(i, 10), g = [l, u].sort();
    if (isNaN(g[0])) {
      if (r > i)
        return 1;
      if (i > r)
        return -1;
      continue;
    }
    if (isNaN(g[1]))
      return isNaN(l) ? -1 : 1;
    if (l > u)
      return 1;
    if (u > l)
      return -1;
  }
  return t.length - n.length;
}
const G = {
  alphanumeric: Xe,
  alphanumericCaseSensitive: Ke,
  text: Je,
  textCaseSensitive: Qe,
  datetime: We,
  basic: Ye
}, Ze = {
  getInitialState: (e) => ({
    sorting: [],
    ...e
  }),
  getDefaultColumnDef: () => ({
    sortingFn: "auto",
    sortUndefined: 1
  }),
  getDefaultOptions: (e) => ({
    onSortingChange: M("sorting", e),
    isMultiSortEvent: (o) => o.shiftKey
  }),
  createColumn: (e, o) => {
    e.getAutoSortingFn = () => {
      const t = o.getFilteredRowModel().flatRows.slice(10);
      let n = !1;
      for (const r of t) {
        const i = r?.getValue(e.id);
        if (Object.prototype.toString.call(i) === "[object Date]")
          return G.datetime;
        if (typeof i == "string" && (n = !0, i.split(Z).length > 1))
          return G.alphanumeric;
      }
      return n ? G.text : G.basic;
    }, e.getAutoSortDir = () => {
      const t = o.getFilteredRowModel().flatRows[0];
      return typeof t?.getValue(e.id) == "string" ? "asc" : "desc";
    }, e.getSortingFn = () => {
      var t, n;
      if (!e)
        throw new Error();
      return B(e.columnDef.sortingFn) ? e.columnDef.sortingFn : e.columnDef.sortingFn === "auto" ? e.getAutoSortingFn() : (t = (n = o.options.sortingFns) == null ? void 0 : n[e.columnDef.sortingFn]) != null ? t : G[e.columnDef.sortingFn];
    }, e.toggleSorting = (t, n) => {
      const r = e.getNextSortingOrder(), i = typeof t < "u" && t !== null;
      o.setSorting((l) => {
        const u = l?.find((s) => s.id === e.id), g = l?.findIndex((s) => s.id === e.id);
        let a = [], c, S = i ? t : r === "desc";
        if (l != null && l.length && e.getCanMultiSort() && n ? u ? c = "toggle" : c = "add" : l != null && l.length && g !== l.length - 1 ? c = "replace" : u ? c = "toggle" : c = "replace", c === "toggle" && (i || r || (c = "remove")), c === "add") {
          var d;
          a = [...l, {
            id: e.id,
            desc: S
          }], a.splice(0, a.length - ((d = o.options.maxMultiSortColCount) != null ? d : Number.MAX_SAFE_INTEGER));
        } else c === "toggle" ? a = l.map((s) => s.id === e.id ? {
          ...s,
          desc: S
        } : s) : c === "remove" ? a = l.filter((s) => s.id !== e.id) : a = [{
          id: e.id,
          desc: S
        }];
        return a;
      });
    }, e.getFirstSortDir = () => {
      var t, n;
      return ((t = (n = e.columnDef.sortDescFirst) != null ? n : o.options.sortDescFirst) != null ? t : e.getAutoSortDir() === "desc") ? "desc" : "asc";
    }, e.getNextSortingOrder = (t) => {
      var n, r;
      const i = e.getFirstSortDir(), l = e.getIsSorted();
      return l ? l !== i && ((n = o.options.enableSortingRemoval) == null || n) && // If enableSortRemove, enable in general
      (!(t && (r = o.options.enableMultiRemove) != null) || r) ? !1 : l === "desc" ? "asc" : "desc" : i;
    }, e.getCanSort = () => {
      var t, n;
      return ((t = e.columnDef.enableSorting) != null ? t : !0) && ((n = o.options.enableSorting) != null ? n : !0) && !!e.accessorFn;
    }, e.getCanMultiSort = () => {
      var t, n;
      return (t = (n = e.columnDef.enableMultiSort) != null ? n : o.options.enableMultiSort) != null ? t : !!e.accessorFn;
    }, e.getIsSorted = () => {
      var t;
      const n = (t = o.getState().sorting) == null ? void 0 : t.find((r) => r.id === e.id);
      return n ? n.desc ? "desc" : "asc" : !1;
    }, e.getSortIndex = () => {
      var t, n;
      return (t = (n = o.getState().sorting) == null ? void 0 : n.findIndex((r) => r.id === e.id)) != null ? t : -1;
    }, e.clearSorting = () => {
      o.setSorting((t) => t != null && t.length ? t.filter((n) => n.id !== e.id) : []);
    }, e.getToggleSortingHandler = () => {
      const t = e.getCanSort();
      return (n) => {
        t && (n.persist == null || n.persist(), e.toggleSorting == null || e.toggleSorting(void 0, e.getCanMultiSort() ? o.options.isMultiSortEvent == null ? void 0 : o.options.isMultiSortEvent(n) : !1));
      };
    };
  },
  createTable: (e) => {
    e.setSorting = (o) => e.options.onSortingChange == null ? void 0 : e.options.onSortingChange(o), e.resetSorting = (o) => {
      var t, n;
      e.setSorting(o ? [] : (t = (n = e.initialState) == null ? void 0 : n.sorting) != null ? t : []);
    }, e.getPreSortedRowModel = () => e.getGroupedRowModel(), e.getSortedRowModel = () => (!e._getSortedRowModel && e.options.getSortedRowModel && (e._getSortedRowModel = e.options.getSortedRowModel(e)), e.options.manualSorting || !e._getSortedRowModel ? e.getPreSortedRowModel() : e._getSortedRowModel());
  }
}, be = [
  he,
  Be,
  He,
  Le,
  ve,
  _e,
  Te,
  //depends on ColumnFaceting
  qe,
  //depends on ColumnFiltering
  Ze,
  De,
  //depends on RowSorting
  Ne,
  ke,
  je,
  Ue,
  ze
];
function rt(e) {
  var o, t;
  process.env.NODE_ENV !== "production" && (e.debugAll || e.debugTable) && console.info("Creating Table Instance...");
  const n = [...be, ...(o = e._features) != null ? o : []];
  let r = {
    _features: n
  };
  const i = r._features.reduce((d, s) => Object.assign(d, s.getDefaultOptions == null ? void 0 : s.getDefaultOptions(r)), {}), l = (d) => r.options.mergeOptions ? r.options.mergeOptions(i, d) : {
    ...i,
    ...d
  };
  let g = {
    ...{},
    ...(t = e.initialState) != null ? t : {}
  };
  r._features.forEach((d) => {
    var s;
    g = (s = d.getInitialState == null ? void 0 : d.getInitialState(g)) != null ? s : g;
  });
  const a = [];
  let c = !1;
  const S = {
    _features: n,
    options: {
      ...i,
      ...e
    },
    initialState: g,
    _queue: (d) => {
      a.push(d), c || (c = !0, Promise.resolve().then(() => {
        for (; a.length; )
          a.shift()();
        c = !1;
      }).catch((s) => setTimeout(() => {
        throw s;
      })));
    },
    reset: () => {
      r.setState(r.initialState);
    },
    setOptions: (d) => {
      const s = I(d, r.options);
      r.options = l(s);
    },
    getState: () => r.options.state,
    setState: (d) => {
      r.options.onStateChange == null || r.options.onStateChange(d);
    },
    _getRowId: (d, s, f) => {
      var p;
      return (p = r.options.getRowId == null ? void 0 : r.options.getRowId(d, s, f)) != null ? p : `${f ? [f.id, s].join(".") : s}`;
    },
    getCoreRowModel: () => (r._getCoreRowModel || (r._getCoreRowModel = r.options.getCoreRowModel(r)), r._getCoreRowModel()),
    // The final calls start at the bottom of the model,
    // expanded rows, which then work their way up
    getRowModel: () => r.getPaginationRowModel(),
    //in next version, we should just pass in the row model as the optional 2nd arg
    getRow: (d, s) => {
      let f = (s ? r.getPrePaginationRowModel() : r.getRowModel()).rowsById[d];
      if (!f && (f = r.getCoreRowModel().rowsById[d], !f))
        throw process.env.NODE_ENV !== "production" ? new Error(`getRow could not find row with ID: ${d}`) : new Error();
      return f;
    },
    _getDefaultColumnDef: m(() => [r.options.defaultColumn], (d) => {
      var s;
      return d = (s = d) != null ? s : {}, {
        header: (f) => {
          const p = f.header.column.columnDef;
          return p.accessorKey ? p.accessorKey : p.accessorFn ? p.id : null;
        },
        // footer: props => props.header.column.id,
        cell: (f) => {
          var p, w;
          return (p = (w = f.renderValue()) == null || w.toString == null ? void 0 : w.toString()) != null ? p : null;
        },
        ...r._features.reduce((f, p) => Object.assign(f, p.getDefaultColumnDef == null ? void 0 : p.getDefaultColumnDef()), {}),
        ...d
      };
    }, C(e, "debugColumns", "_getDefaultColumnDef")),
    _getColumnDefs: () => r.options.columns,
    getAllColumns: m(() => [r._getColumnDefs()], (d) => {
      const s = function(f, p, w) {
        return w === void 0 && (w = 0), f.map((R) => {
          const h = we(r, R, w, p), _ = R;
          return h.columns = _.columns ? s(_.columns, h, w + 1) : [], h;
        });
      };
      return s(d);
    }, C(e, "debugColumns", "getAllColumns")),
    getAllFlatColumns: m(() => [r.getAllColumns()], (d) => d.flatMap((s) => s.getFlatColumns()), C(e, "debugColumns", "getAllFlatColumns")),
    _getAllFlatColumnsById: m(() => [r.getAllFlatColumns()], (d) => d.reduce((s, f) => (s[f.id] = f, s), {}), C(e, "debugColumns", "getAllFlatColumnsById")),
    getAllLeafColumns: m(() => [r.getAllColumns(), r._getOrderColumnsFn()], (d, s) => {
      let f = d.flatMap((p) => p.getLeafColumns());
      return s(f);
    }, C(e, "debugColumns", "getAllLeafColumns")),
    getColumn: (d) => {
      const s = r._getAllFlatColumnsById()[d];
      return process.env.NODE_ENV !== "production" && !s && console.error(`[Table] Column with id '${d}' does not exist.`), s;
    }
  };
  Object.assign(r, S);
  for (let d = 0; d < r._features.length; d++) {
    const s = r._features[d];
    s == null || s.createTable == null || s.createTable(r);
  }
  return r;
}
function it() {
  return (e) => m(() => [e.options.data], (o) => {
    const t = {
      rows: [],
      flatRows: [],
      rowsById: {}
    }, n = function(r, i, l) {
      i === void 0 && (i = 0);
      const u = [];
      for (let a = 0; a < r.length; a++) {
        const c = T(e, e._getRowId(r[a], a, l), r[a], a, i, void 0, l?.id);
        if (t.flatRows.push(c), t.rowsById[c.id] = c, u.push(c), e.options.getSubRows) {
          var g;
          c.originalSubRows = e.options.getSubRows(r[a], a), (g = c.originalSubRows) != null && g.length && (c.subRows = n(c.originalSubRows, i + 1, c));
        }
      }
      return u;
    };
    return t.rows = n(o), t;
  }, C(e.options, "debugTable", "getRowModel", () => e._autoResetPageIndex()));
}
function lt() {
  return (e) => m(() => [e.getState().expanded, e.getPreExpandedRowModel(), e.options.paginateExpandedRows], (o, t, n) => !t.rows.length || o !== !0 && !Object.keys(o ?? {}).length || !n ? t : Se(t), C(e.options, "debugTable", "getExpandedRowModel"));
}
function Se(e) {
  const o = [], t = (n) => {
    var r;
    o.push(n), (r = n.subRows) != null && r.length && n.getIsExpanded() && n.subRows.forEach(t);
  };
  return e.rows.forEach(t), {
    rows: o,
    flatRows: e.flatRows,
    rowsById: e.rowsById
  };
}
function et(e, o, t) {
  return t.options.filterFromLeafRows ? tt(e, o, t) : nt(e, o, t);
}
function tt(e, o, t) {
  var n;
  const r = [], i = {}, l = (n = t.options.maxLeafRowFilterDepth) != null ? n : 100, u = function(g, a) {
    a === void 0 && (a = 0);
    const c = [];
    for (let d = 0; d < g.length; d++) {
      var S;
      let s = g[d];
      const f = T(t, s.id, s.original, s.index, s.depth, void 0, s.parentId);
      if (f.columnFilters = s.columnFilters, (S = s.subRows) != null && S.length && a < l) {
        if (f.subRows = u(s.subRows, a + 1), s = f, o(s) && !f.subRows.length) {
          c.push(s), i[s.id] = s, r.push(s);
          continue;
        }
        if (o(s) || f.subRows.length) {
          c.push(s), i[s.id] = s, r.push(s);
          continue;
        }
      } else
        s = f, o(s) && (c.push(s), i[s.id] = s, r.push(s));
    }
    return c;
  };
  return {
    rows: u(e),
    flatRows: r,
    rowsById: i
  };
}
function nt(e, o, t) {
  var n;
  const r = [], i = {}, l = (n = t.options.maxLeafRowFilterDepth) != null ? n : 100, u = function(g, a) {
    a === void 0 && (a = 0);
    const c = [];
    for (let d = 0; d < g.length; d++) {
      let s = g[d];
      if (o(s)) {
        var S;
        if ((S = s.subRows) != null && S.length && a < l) {
          const p = T(t, s.id, s.original, s.index, s.depth, void 0, s.parentId);
          p.subRows = u(s.subRows, a + 1), s = p;
        }
        c.push(s), r.push(s), i[s.id] = s;
      }
    }
    return c;
  };
  return {
    rows: u(e),
    flatRows: r,
    rowsById: i
  };
}
function st() {
  return (e) => m(() => [e.getPreFilteredRowModel(), e.getState().columnFilters, e.getState().globalFilter], (o, t, n) => {
    if (!o.rows.length || !(t != null && t.length) && !n) {
      for (let d = 0; d < o.flatRows.length; d++)
        o.flatRows[d].columnFilters = {}, o.flatRows[d].columnFiltersMeta = {};
      return o;
    }
    const r = [], i = [];
    (t ?? []).forEach((d) => {
      var s;
      const f = e.getColumn(d.id);
      if (!f)
        return;
      const p = f.getFilterFn();
      if (!p) {
        process.env.NODE_ENV !== "production" && console.warn(`Could not find a valid 'column.filterFn' for column with the ID: ${f.id}.`);
        return;
      }
      r.push({
        id: d.id,
        filterFn: p,
        resolvedValue: (s = p.resolveFilterValue == null ? void 0 : p.resolveFilterValue(d.value)) != null ? s : d.value
      });
    });
    const l = (t ?? []).map((d) => d.id), u = e.getGlobalFilterFn(), g = e.getAllLeafColumns().filter((d) => d.getCanGlobalFilter());
    n && u && g.length && (l.push("__global__"), g.forEach((d) => {
      var s;
      i.push({
        id: d.id,
        filterFn: u,
        resolvedValue: (s = u.resolveFilterValue == null ? void 0 : u.resolveFilterValue(n)) != null ? s : n
      });
    }));
    let a, c;
    for (let d = 0; d < o.flatRows.length; d++) {
      const s = o.flatRows[d];
      if (s.columnFilters = {}, r.length)
        for (let f = 0; f < r.length; f++) {
          a = r[f];
          const p = a.id;
          s.columnFilters[p] = a.filterFn(s, p, a.resolvedValue, (w) => {
            s.columnFiltersMeta[p] = w;
          });
        }
      if (i.length) {
        for (let f = 0; f < i.length; f++) {
          c = i[f];
          const p = c.id;
          if (c.filterFn(s, p, c.resolvedValue, (w) => {
            s.columnFiltersMeta[p] = w;
          })) {
            s.columnFilters.__global__ = !0;
            break;
          }
        }
        s.columnFilters.__global__ !== !0 && (s.columnFilters.__global__ = !1);
      }
    }
    const S = (d) => {
      for (let s = 0; s < l.length; s++)
        if (d.columnFilters[l[s]] === !1)
          return !1;
      return !0;
    };
    return et(o.rows, S, e);
  }, C(e.options, "debugTable", "getFilteredRowModel", () => e._autoResetPageIndex()));
}
function ut() {
  return (e) => m(() => [e.getState().grouping, e.getPreGroupedRowModel()], (o, t) => {
    if (!t.rows.length || !o.length)
      return t.rows.forEach((g) => {
        g.depth = 0, g.parentId = void 0;
      }), t;
    const n = o.filter((g) => e.getColumn(g)), r = [], i = {}, l = function(g, a, c) {
      if (a === void 0 && (a = 0), a >= n.length)
        return g.map((f) => (f.depth = a, r.push(f), i[f.id] = f, f.subRows && (f.subRows = l(f.subRows, a + 1, f.id)), f));
      const S = n[a], d = ot(g, S);
      return Array.from(d.entries()).map((f, p) => {
        let [w, R] = f, h = `${S}:${w}`;
        h = c ? `${c}>${h}` : h;
        const _ = l(R, a + 1, h);
        _.forEach((v) => {
          v.parentId = h;
        });
        const V = a ? ie(R, (v) => v.subRows) : R, F = T(e, h, V[0].original, p, a, void 0, c);
        return Object.assign(F, {
          groupingColumnId: S,
          groupingValue: w,
          subRows: _,
          leafRows: V,
          getValue: (v) => {
            if (n.includes(v)) {
              if (F._valuesCache.hasOwnProperty(v))
                return F._valuesCache[v];
              if (R[0]) {
                var y;
                F._valuesCache[v] = (y = R[0].getValue(v)) != null ? y : void 0;
              }
              return F._valuesCache[v];
            }
            if (F._groupingValuesCache.hasOwnProperty(v))
              return F._groupingValuesCache[v];
            const D = e.getColumn(v), L = D?.getAggregationFn();
            if (L)
              return F._groupingValuesCache[v] = L(v, V, R), F._groupingValuesCache[v];
          }
        }), _.forEach((v) => {
          r.push(v), i[v.id] = v;
        }), F;
      });
    }, u = l(t.rows, 0);
    return u.forEach((g) => {
      r.push(g), i[g.id] = g;
    }), {
      rows: u,
      flatRows: r,
      rowsById: i
    };
  }, C(e.options, "debugTable", "getGroupedRowModel", () => {
    e._queue(() => {
      e._autoResetExpanded(), e._autoResetPageIndex();
    });
  }));
}
function ot(e, o) {
  const t = /* @__PURE__ */ new Map();
  return e.reduce((n, r) => {
    const i = `${r.getGroupingValue(o)}`, l = n.get(i);
    return l ? l.push(r) : n.set(i, [r]), n;
  }, t);
}
function gt(e) {
  return (o) => m(() => [o.getState().pagination, o.getPrePaginationRowModel(), o.options.paginateExpandedRows ? void 0 : o.getState().expanded], (t, n) => {
    if (!n.rows.length)
      return n;
    const {
      pageSize: r,
      pageIndex: i
    } = t;
    let {
      rows: l,
      flatRows: u,
      rowsById: g
    } = n;
    const a = r * i, c = a + r;
    l = l.slice(a, c);
    let S;
    o.options.paginateExpandedRows ? S = {
      rows: l,
      flatRows: u,
      rowsById: g
    } : S = Se({
      rows: l,
      flatRows: u,
      rowsById: g
    }), S.flatRows = [];
    const d = (s) => {
      S.flatRows.push(s), s.subRows.length && s.subRows.forEach(d);
    };
    return S.rows.forEach(d), S;
  }, C(o.options, "debugTable", "getPaginationRowModel"));
}
function at() {
  return (e) => m(() => [e.getState().sorting, e.getPreSortedRowModel()], (o, t) => {
    if (!t.rows.length || !(o != null && o.length))
      return t;
    const n = e.getState().sorting, r = [], i = n.filter((g) => {
      var a;
      return (a = e.getColumn(g.id)) == null ? void 0 : a.getCanSort();
    }), l = {};
    i.forEach((g) => {
      const a = e.getColumn(g.id);
      a && (l[g.id] = {
        sortUndefined: a.columnDef.sortUndefined,
        invertSorting: a.columnDef.invertSorting,
        sortingFn: a.getSortingFn()
      });
    });
    const u = (g) => {
      const a = g.map((c) => ({
        ...c
      }));
      return a.sort((c, S) => {
        for (let s = 0; s < i.length; s += 1) {
          var d;
          const f = i[s], p = l[f.id], w = p.sortUndefined, R = (d = f?.desc) != null ? d : !1;
          let h = 0;
          if (w) {
            const _ = c.getValue(f.id), V = S.getValue(f.id), F = _ === void 0, v = V === void 0;
            if (F || v) {
              if (w === "first") return F ? -1 : 1;
              if (w === "last") return F ? 1 : -1;
              h = F && v ? 0 : F ? w : -w;
            }
          }
          if (h === 0 && (h = p.sortingFn(c, S, f.id)), h !== 0)
            return R && (h *= -1), p.invertSorting && (h *= -1), h;
        }
        return c.index - S.index;
      }), a.forEach((c) => {
        var S;
        r.push(c), (S = c.subRows) != null && S.length && (c.subRows = u(c.subRows));
      }), a;
    };
    return {
      rows: u(t.rows),
      flatRows: r,
      rowsById: t.rowsById
    };
  }, C(e.options, "debugTable", "getSortedRowModel", () => e._autoResetPageIndex()));
}
export {
  ve as ColumnFaceting,
  _e as ColumnFiltering,
  De as ColumnGrouping,
  He as ColumnOrdering,
  Le as ColumnPinning,
  ze as ColumnSizing,
  Be as ColumnVisibility,
  Te as GlobalFaceting,
  qe as GlobalFiltering,
  he as Headers,
  Ne as RowExpanding,
  ke as RowPagination,
  je as RowPinning,
  Ue as RowSelection,
  Ze as RowSorting,
  H as _getVisibleLeafColumns,
  q as aggregationFns,
  A as buildHeaderGroups,
  Re as createCell,
  we as createColumn,
  T as createRow,
  rt as createTable,
  z as defaultColumnSizing,
  Se as expandRows,
  x as filterFns,
  ie as flattenBy,
  I as functionalUpdate,
  it as getCoreRowModel,
  lt as getExpandedRowModel,
  st as getFilteredRowModel,
  ut as getGroupedRowModel,
  C as getMemoOptions,
  gt as getPaginationRowModel,
  at as getSortedRowModel,
  B as isFunction,
  Ce as isNumberArray,
  ee as isRowSelected,
  Y as isSubRowSelected,
  M as makeStateUpdater,
  m as memo,
  Ge as orderColumns,
  Oe as passiveEventSupported,
  Z as reSplitAlphaNumeric,
  K as selectRowsFn,
  re as shouldAutoRemoveFilter,
  G as sortingFns
};
//# sourceMappingURL=index143.js.map
