function N(i, o) {
  const s = (n) => n instanceof Blob ? n.size : n;
  return Array.isArray(i) && Array.isArray(o) ? i.map(s).join() !== o.map(s).join() : i instanceof Date && o instanceof Date ? i.getTime() !== o.getTime() : Number.isNaN(i) && Number.isNaN(o) ? !1 : i !== o;
}
export {
  N as isFieldDirty
};
//# sourceMappingURL=index243.js.map
