import * as o from "react";
import { createTable as u } from "./index184.js";
import { ColumnFaceting as C, ColumnFiltering as S, ColumnGrouping as w, ColumnOrdering as b, ColumnPinning as y, ColumnSizing as F, ColumnVisibility as x, GlobalFaceting as M, GlobalFiltering as h, Headers as O, RowExpanding as E, RowPagination as G, RowPinning as P, RowSelection as v, RowSorting as $, _getVisibleLeafColumns as A, aggregationFns as V, buildHeaderGroups as j, createCell as k, createColumn as z, createRow as H, defaultColumnSizing as N, expandRows as T, filterFns as U, flattenBy as _, functionalUpdate as B, getCoreRowModel as L, getExpandedRowModel as q, getFilteredRowModel as D, getGroupedRowModel as I, getMemoOptions as J, getPaginationRowModel as K, getSortedRowModel as Q, isFunction as W, isNumberArray as X, isRowSelected as Y, isSubRowSelected as Z, makeStateUpdater as ee, memo as te, orderColumns as ne, passiveEventSupported as oe, reSplitAlphaNumeric as re, selectRowsFn as ie, shouldAutoRemoveFilter as ae, sortingFns as le } from "./index184.js";
function f(e, t) {
  return e ? s(e) ? /* @__PURE__ */ o.createElement(e, t) : e : null;
}
function s(e) {
  return c(e) || typeof e == "function" || g(e);
}
function c(e) {
  return typeof e == "function" && (() => {
    const t = Object.getPrototypeOf(e);
    return t.prototype && t.prototype.isReactComponent;
  })();
}
function g(e) {
  return typeof e == "object" && typeof e.$$typeof == "symbol" && ["react.memo", "react.forward_ref"].includes(e.$$typeof.description);
}
function p(e) {
  const t = {
    state: {},
    // Dummy state
    onStateChange: () => {
    },
    // noop
    renderFallbackValue: null,
    ...e
  }, [n] = o.useState(() => ({
    current: u(t)
  })), [i, a] = o.useState(() => n.current.initialState);
  return n.current.setOptions((l) => ({
    ...l,
    ...e,
    state: {
      ...i,
      ...e.state
    },
    // Similarly, we'll maintain both our internal state and any user-provided
    // state.
    onStateChange: (r) => {
      a(r), e.onStateChange == null || e.onStateChange(r);
    }
  })), n.current;
}
export {
  C as ColumnFaceting,
  S as ColumnFiltering,
  w as ColumnGrouping,
  b as ColumnOrdering,
  y as ColumnPinning,
  F as ColumnSizing,
  x as ColumnVisibility,
  M as GlobalFaceting,
  h as GlobalFiltering,
  O as Headers,
  E as RowExpanding,
  G as RowPagination,
  P as RowPinning,
  v as RowSelection,
  $ as RowSorting,
  A as _getVisibleLeafColumns,
  V as aggregationFns,
  j as buildHeaderGroups,
  k as createCell,
  z as createColumn,
  H as createRow,
  u as createTable,
  N as defaultColumnSizing,
  T as expandRows,
  U as filterFns,
  _ as flattenBy,
  f as flexRender,
  B as functionalUpdate,
  L as getCoreRowModel,
  q as getExpandedRowModel,
  D as getFilteredRowModel,
  I as getGroupedRowModel,
  J as getMemoOptions,
  K as getPaginationRowModel,
  Q as getSortedRowModel,
  W as isFunction,
  X as isNumberArray,
  Y as isRowSelected,
  Z as isSubRowSelected,
  ee as makeStateUpdater,
  te as memo,
  ne as orderColumns,
  oe as passiveEventSupported,
  re as reSplitAlphaNumeric,
  ie as selectRowsFn,
  ae as shouldAutoRemoveFilter,
  le as sortingFns,
  p as useReactTable
};
//# sourceMappingURL=index177.js.map
