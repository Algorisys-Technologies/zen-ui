var n = /* @__PURE__ */ new WeakMap();
function u(e) {
  let t = n.get(e);
  if (t != null)
    return t;
  t = 0;
  for (const r of e)
    r.type === "item" && t++;
  return n.set(e, t), t;
}
export {
  u as getItemCount
};
//# sourceMappingURL=index200.js.map
