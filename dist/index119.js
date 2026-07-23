const l = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i, s = (t) => {
  const n = l.exec(t.trim());
  if (!n) return null;
  const o = n[1].toLowerCase();
  return `#${o.length === 3 ? [...o].map((e) => e + e).join("") : o}`;
}, c = (t) => {
  const n = s(t);
  if (!n) return null;
  const o = Number.parseInt(n.slice(1), 16);
  return { r: o >> 16 & 255, g: o >> 8 & 255, b: o & 255 };
}, u = (t) => {
  const n = c(t);
  if (!n) return 0;
  const o = (r) => {
    const e = r / 255;
    return e <= 0.03928 ? e / 12.92 : ((e + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * o(n.r) + 0.7152 * o(n.g) + 0.0722 * o(n.b);
}, f = (t) => u(t) > 0.179 ? "#000000" : "#ffffff", a = (t) => typeof t == "string" ? { value: t } : t, i = (t) => {
  const n = a(t);
  return n.label ?? s(n.value) ?? n.value;
};
export {
  i as colorLabel,
  f as contrastingInk,
  c as hexToRgb,
  u as luminance,
  s as normalizeHex,
  a as toColorOption
};
//# sourceMappingURL=index119.js.map
