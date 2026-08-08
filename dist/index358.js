function i(e, o, h, r) {
  const { numberOfMonths: f = 1 } = h, n = [];
  for (let t = 0; t < f; t++) {
    const s = r.addMonths(e, t);
    if (o && s > o)
      break;
    n.push(s);
  }
  return n;
}
export {
  i as getDisplayMonths
};
//# sourceMappingURL=index358.js.map
