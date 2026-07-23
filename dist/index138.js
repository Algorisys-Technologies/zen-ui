import { createTable as u } from "./index143.js";
import { ColumnFaceting as C, ColumnFiltering as F, ColumnGrouping as b, ColumnOrdering as M, ColumnPinning as h, ColumnSizing as x, ColumnVisibility as G, GlobalFaceting as O, GlobalFiltering as P, Headers as v, RowExpanding as y, RowPagination as A, RowPinning as E, RowSelection as V, RowSorting as k, _getVisibleLeafColumns as z, aggregationFns as H, buildHeaderGroups as N, createCell as T, createColumn as U, createRow as B, defaultColumnSizing as L, expandRows as _, filterFns as j, flattenBy as q, functionalUpdate as D, getCoreRowModel as I, getExpandedRowModel as J, getFilteredRowModel as K, getGroupedRowModel as Q, getMemoOptions as W, getPaginationRowModel as X, getSortedRowModel as Y, isFunction as Z, isNumberArray as $, isRowSelected as ee, isSubRowSelected as te, makeStateUpdater as ne, memo as oe, orderColumns as re, passiveEventSupported as le, reSplitAlphaNumeric as ie, selectRowsFn as ae, shouldAutoRemoveFilter as ue, sortingFns as ge } from "./index143.js";
import { mergeProps as n, createComputed as g, createComponent as s } from "solid-js";
import { createStore as d } from "solid-js/store";
function p(e, o) {
  return e ? typeof e == "function" ? s(e, o) : e : null;
}
function R(e) {
  const o = n({
    state: {},
    // Dummy state
    onStateChange: () => {
    },
    // noop
    renderFallbackValue: null,
    mergeOptions: (l, t) => n(l, t)
  }, e), r = u(o), [i, a] = d(r.initialState);
  return g(() => {
    r.setOptions((l) => n(l, e, {
      state: n(i, e.state || {}),
      // Similarly, we'll maintain both our internal state and any user-provided
      // state.
      onStateChange: (t) => {
        a(t), e.onStateChange == null || e.onStateChange(t);
      }
    }));
  }), r;
}
export {
  C as ColumnFaceting,
  F as ColumnFiltering,
  b as ColumnGrouping,
  M as ColumnOrdering,
  h as ColumnPinning,
  x as ColumnSizing,
  G as ColumnVisibility,
  O as GlobalFaceting,
  P as GlobalFiltering,
  v as Headers,
  y as RowExpanding,
  A as RowPagination,
  E as RowPinning,
  V as RowSelection,
  k as RowSorting,
  z as _getVisibleLeafColumns,
  H as aggregationFns,
  N as buildHeaderGroups,
  T as createCell,
  U as createColumn,
  B as createRow,
  R as createSolidTable,
  u as createTable,
  L as defaultColumnSizing,
  _ as expandRows,
  j as filterFns,
  q as flattenBy,
  p as flexRender,
  D as functionalUpdate,
  I as getCoreRowModel,
  J as getExpandedRowModel,
  K as getFilteredRowModel,
  Q as getGroupedRowModel,
  W as getMemoOptions,
  X as getPaginationRowModel,
  Y as getSortedRowModel,
  Z as isFunction,
  $ as isNumberArray,
  ee as isRowSelected,
  te as isSubRowSelected,
  ne as makeStateUpdater,
  oe as memo,
  re as orderColumns,
  le as passiveEventSupported,
  ie as reSplitAlphaNumeric,
  ae as selectRowsFn,
  ue as shouldAutoRemoveFilter,
  ge as sortingFns
};
//# sourceMappingURL=index138.js.map
