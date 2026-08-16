const o = (e, n, t) => Math.min(t, Math.max(n, e)), l = (e, n, t) => {
  const r = [...e];
  if (r.length === 0) return r;
  const i = o(Math.trunc(n), 0, r.length - 1), c = o(Math.trunc(t), 0, r.length - 1);
  if (i === c) return r;
  const [u] = r.splice(i, 1);
  return r.splice(c, 0, u), r;
}, m = (e, n, t) => {
  if (n.type === "pickup") {
    if (t <= 0) return { picked: null, commit: null };
    const r = o(Math.trunc(n.index), 0, t - 1);
    return { picked: { id: n.id, origin: r, index: r }, commit: null };
  }
  if (!e) return { picked: null, commit: null };
  switch (n.type) {
    case "move":
    case "moveTo": {
      const r = n.type === "move" ? o(e.index + Math.trunc(n.delta), 0, t - 1) : o(Math.trunc(n.index), 0, t - 1);
      return r === e.index ? { picked: e, commit: null } : { picked: { ...e, index: r }, commit: { from: e.index, to: r } };
    }
    case "drop":
      return { picked: null, commit: null };
    case "cancel":
      return {
        picked: null,
        commit: e.index === e.origin ? null : { from: e.index, to: e.origin }
      };
  }
}, d = (e, n, t, r) => {
  if (e === " " || e === "Spacebar" || e === "Enter")
    return t ? { type: "drop" } : { type: "pickup" };
  if (!t) return null;
  if (e === "Escape") return { type: "cancel" };
  if (e === "Home") return { type: "moveTo", index: 0 };
  if (e === "End") return { type: "moveTo", index: Math.max(0, r - 1) };
  const i = n === "vertical" ? "ArrowUp" : "ArrowLeft", c = n === "vertical" ? "ArrowDown" : "ArrowRight";
  return e === i ? { type: "move", delta: -1 } : e === c ? { type: "move", delta: 1 } : null;
}, p = {
  onPickUp: (e, n, t) => `Picked up item ${n + 1} of ${t}.`,
  onMove: (e, n, t) => `Moved from position ${n + 1} to ${t + 1}.`,
  onDrop: (e, n) => `Dropped at position ${n + 1}.`,
  onCancel: () => "Reorder cancelled."
};
export {
  p as DEFAULT_REORDER_ANNOUNCEMENTS,
  d as keyToReorderAction,
  l as moveItem,
  m as reduceReorder
};
//# sourceMappingURL=index114.js.map
