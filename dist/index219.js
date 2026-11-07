function h(t, e, r = 1, i = null) {
  const n = [];
  return t.forEach((d, c) => {
    const o = !!d.children?.length, l = o && e.has(d.id);
    n.push({ node: d, level: r, parentId: i, hasChildren: o, expanded: l, posInSet: c + 1, setSize: t.length }), l && n.push(...h(d.children, e, r + 1, d.id));
  }), n;
}
function f(t, e) {
  for (const r of t) {
    if (r.id === e) return [r];
    if (r.children) {
      const i = f(r.children, e);
      if (i) return [r, ...i];
    }
  }
  return null;
}
function p(t, e) {
  return !t.disabled && !(e && t.children?.length);
}
const u = (t) => t.toLocaleLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "");
function x(t, e) {
  const r = u(e.trim()), i = /* @__PURE__ */ new Set(), n = /* @__PURE__ */ new Set();
  if (!r) return { items: t, expand: i, matches: n };
  const d = (c) => {
    const o = [];
    for (const l of c) {
      const s = u(l.label).includes(r);
      s && n.add(l.id);
      const a = l.children ? d(l.children) : [];
      s ? (o.push(l), a.length && i.add(l.id)) : a.length && (i.add(l.id), o.push({ ...l, children: a }));
    }
    return o;
  };
  return { items: d(t), expand: i, matches: n };
}
function g(t, e, r) {
  if (e.length === 0) return null;
  const i = Math.min(Math.max(r, 0), e.length - 1), n = e[i];
  switch (t) {
    case "ArrowDown":
      return { kind: "move", index: Math.min(i + 1, e.length - 1) };
    case "ArrowUp":
      return { kind: "move", index: Math.max(i - 1, 0) };
    case "ArrowRight":
      return n.hasChildren ? n.expanded ? { kind: "move", index: i + 1 } : { kind: "expand", id: n.node.id } : null;
    case "ArrowLeft": {
      if (n.hasChildren && n.expanded) return { kind: "collapse", id: n.node.id };
      if (n.parentId === null) return null;
      const d = e.findIndex((c) => c.node.id === n.parentId);
      return d >= 0 ? { kind: "move", index: d } : null;
    }
    default:
      return null;
  }
}
export {
  x as filterTree,
  p as isSelectable,
  f as pathTo,
  g as treeKeyTarget,
  h as visibleRows
};
//# sourceMappingURL=index219.js.map
