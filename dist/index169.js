const j = {
  L: [-1, 7, 10, 15, 20, 26, 18, 20, 24, 30, 18, 20, 24, 26, 30, 22, 24, 28, 30, 28, 28, 28, 28, 30, 30, 26, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
  M: [-1, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24, 28, 28, 26, 26, 26, 26, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28],
  Q: [-1, 13, 22, 18, 26, 18, 24, 18, 22, 20, 24, 28, 26, 24, 20, 30, 24, 28, 28, 26, 30, 28, 30, 30, 30, 30, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
  H: [-1, 17, 28, 22, 16, 22, 28, 26, 26, 24, 28, 24, 28, 22, 24, 24, 30, 28, 28, 26, 28, 30, 24, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30]
}, z = {
  L: [-1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 4, 4, 4, 4, 4, 6, 6, 6, 6, 7, 8, 8, 9, 9, 10, 12, 12, 12, 13, 14, 15, 16, 17, 18, 19, 19, 20, 21, 22, 24, 25],
  M: [-1, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10, 10, 11, 13, 14, 16, 17, 17, 18, 20, 21, 23, 25, 26, 28, 29, 31, 33, 35, 37, 38, 40, 43, 45, 47, 49],
  Q: [-1, 1, 1, 2, 2, 4, 4, 6, 6, 8, 8, 8, 10, 12, 16, 12, 17, 16, 18, 21, 20, 23, 23, 25, 27, 29, 34, 34, 35, 38, 40, 43, 45, 48, 51, 53, 56, 59, 62, 65, 68],
  H: [-1, 1, 1, 2, 4, 4, 4, 5, 6, 8, 8, 11, 11, 16, 16, 18, 16, 19, 21, 25, 25, 25, 34, 30, 32, 35, 37, 40, 42, 45, 48, 51, 54, 57, 60, 63, 66, 70, 74, 77, 81]
}, V = { L: 1, M: 0, Q: 3, H: 2 }, $ = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:";
function F(n) {
  let t = (16 * n + 128) * n + 64;
  if (n >= 2) {
    const r = Math.floor(n / 7) + 2;
    t -= (25 * r - 10) * r - 55, n >= 7 && (t -= 36);
  }
  return t;
}
function P(n, t) {
  return Math.floor(F(n) / 8) - j[t][n] * z[t][n];
}
const Y = { numeric: 1, alphanumeric: 2, byte: 4 }, Z = {
  numeric: [10, 12, 14],
  alphanumeric: [9, 11, 13],
  byte: [8, 16, 16]
}, I = (n, t) => Z[n][t <= 9 ? 0 : t <= 26 ? 1 : 2];
function J(n) {
  return /^[0-9]*$/.test(n) ? "numeric" : [...n].every((t) => $.includes(t)) ? "alphanumeric" : "byte";
}
function W(n, t) {
  const r = [], s = (c, l) => {
    for (let e = l - 1; e >= 0; e--) r.push(c >>> e & 1);
  };
  if (t === "numeric")
    for (let c = 0; c < n.length; c += 3) {
      const l = n.slice(c, c + 3);
      s(Number(l), l.length * 3 + 1);
    }
  else if (t === "alphanumeric")
    for (let c = 0; c < n.length; c += 2)
      c + 1 < n.length ? s($.indexOf(n[c]) * 45 + $.indexOf(n[c + 1]), 11) : s($.indexOf(n[c]), 6);
  else
    for (const c of new TextEncoder().encode(n)) s(c, 8);
  return r;
}
function S(n, t) {
  let r = 0;
  for (let s = 7; s >= 0; s--)
    r = r << 1 ^ (r >>> 7) * 285, r ^= (t >>> s & 1) * n;
  return r & 255;
}
function X(n) {
  const t = new Array(n).fill(0);
  t[n - 1] = 1;
  let r = 1;
  for (let s = 0; s < n; s++) {
    for (let c = 0; c < n; c++)
      t[c] = S(t[c], r), c + 1 < n && (t[c] ^= t[c + 1]);
    r = S(r, 2);
  }
  return t;
}
function v(n, t) {
  const r = new Array(t.length).fill(0);
  for (const s of n) {
    const c = s ^ r.shift();
    r.push(0);
    for (let l = 0; l < t.length; l++) r[l] ^= S(t[l], c);
  }
  return r;
}
function x(n) {
  if (n === 1) return [];
  const t = Math.floor(n / 7) + 2, r = n * 4 + 17, s = n === 32 ? 26 : Math.ceil((n * 4 + 4) / (t * 2 - 2)) * 2, c = [6];
  for (let l = r - 7; c.length < t; l -= s) c.splice(1, 0, l);
  return c;
}
const n1 = [
  (n, t) => (n + t) % 2 === 0,
  (n, t) => t % 2 === 0,
  (n) => n % 3 === 0,
  (n, t) => (n + t) % 3 === 0,
  (n, t) => (Math.floor(n / 3) + Math.floor(t / 2)) % 2 === 0,
  (n, t) => n * t % 2 + n * t % 3 === 0,
  (n, t) => (n * t % 2 + n * t % 3) % 2 === 0,
  (n, t) => ((n + t) % 2 + n * t % 3) % 2 === 0
];
function i1(n, t = {}) {
  const r = t.ecc ?? "M", s = J(n), c = W(n, s), l = s === "byte" ? new TextEncoder().encode(n).length : n.length;
  let e = 0;
  for (let o = Math.max(1, t.minVersion ?? 1); o <= 40; o++)
    if (!(l >= 1 << I(s, o)) && 4 + I(s, o) + c.length <= P(o, r) * 8) {
      e = o;
      break;
    }
  if (!e) return { ok: !1, error: `too long for a QR code at level ${r} (${l} ${s === "byte" ? "bytes" : "characters"})`, code: s === "byte" ? "qrTooLongBytes" : "qrTooLongChars", values: { level: r, count: l } };
  const a = [], w = (o, f) => {
    for (let i = f - 1; i >= 0; i--) a.push(o >>> i & 1);
  };
  w(Y[s], 4), w(l, I(s, e)), a.push(...c);
  const h = P(e, r) * 8;
  w(0, Math.min(4, h - a.length)), w(0, (8 - a.length % 8) % 8);
  for (let o = 236; a.length < h; o ^= 253) w(o, 8);
  const G = [];
  for (let o = 0; o < a.length; o += 8) G.push(a.slice(o, o + 8).reduce((f, i) => f << 1 | i, 0));
  const k = z[r][e], b = j[r][e], A = Math.floor(F(e) / 8), d = k - A % k, m = Math.floor(A / k), U = X(b), B = [];
  for (let o = 0, f = 0; o < k; o++) {
    const i = G.slice(f, f + m - b + (o < d ? 0 : 1));
    f += i.length;
    const p = v(i, U);
    o < d && i.push(0), B.push([...i, ...p]);
  }
  const T = [];
  for (let o = 0; o < B[0].length; o++)
    for (let f = 0; f < B.length; f++)
      (o !== m - b || f >= d) && T.push(B[f][o]);
  const g = e * 4 + 17, C = Array.from({ length: g }, () => new Array(g).fill(!1)), _ = Array.from({ length: g }, () => new Array(g).fill(!1)), M = (o, f, i) => {
    C[f][o] = i, _[f][o] = !0;
  };
  for (let o = 0; o < g; o++)
    M(6, o, o % 2 === 0), M(o, 6, o % 2 === 0);
  for (const [o, f] of [[3, 3], [g - 4, 3], [3, g - 4]])
    for (let i = -4; i <= 4; i++)
      for (let p = -4; p <= 4; p++) {
        const L = o + p, u = f + i, D = Math.max(Math.abs(p), Math.abs(i));
        L >= 0 && L < g && u >= 0 && u < g && M(L, u, D !== 2 && D !== 4);
      }
  const y = x(e), q = y.length - 1;
  for (let o = 0; o < y.length; o++)
    for (let f = 0; f < y.length; f++)
      if (!(o === 0 && f === 0 || o === 0 && f === q || o === q && f === 0))
        for (let i = -2; i <= 2; i++)
          for (let p = -2; p <= 2; p++) M(y[o] + p, y[f] + i, Math.max(Math.abs(p), Math.abs(i)) !== 1);
  const O = (o) => {
    const f = V[r] << 3 | o;
    let i = f;
    for (let u = 0; u < 10; u++) i = i << 1 ^ (i >>> 9) * 1335;
    const p = (f << 10 | i) ^ 21522, L = (u) => (p >>> u & 1) === 1;
    for (let u = 0; u <= 5; u++) M(8, u, L(u));
    M(8, 7, L(6)), M(8, 8, L(7)), M(7, 8, L(8));
    for (let u = 9; u < 15; u++) M(14 - u, 8, L(u));
    for (let u = 0; u < 8; u++) M(g - 1 - u, 8, L(u));
    for (let u = 8; u < 15; u++) M(8, g - 15 + u, L(u));
    M(8, g - 8, !0);
  };
  if (O(0), e >= 7) {
    let o = e;
    for (let i = 0; i < 12; i++) o = o << 1 ^ (o >>> 11) * 7973;
    const f = e << 12 | o;
    for (let i = 0; i < 18; i++) {
      const p = (f >>> i & 1) === 1, L = g - 11 + i % 3, u = Math.floor(i / 3);
      M(L, u, p), M(u, L, p);
    }
  }
  let E = 0;
  for (let o = g - 1; o >= 1; o -= 2) {
    o === 6 && (o = 5);
    for (let f = 0; f < g; f++)
      for (let i = 0; i < 2; i++) {
        const p = o - i, u = (o + 1 & 2) === 0 ? g - 1 - f : f;
        !_[u][p] && E < T.length * 8 && (C[u][p] = (T[E >>> 3] >>> 7 - (E & 7) & 1) === 1, E++);
      }
  }
  const R = (o) => {
    for (let f = 0; f < g; f++) for (let i = 0; i < g; i++) !_[f][i] && n1[o](i, f) && (C[f][i] = !C[f][i]);
  };
  let N = t.mask ?? -1;
  if (N < 0) {
    let o = 1 / 0;
    for (let f = 0; f < 8; f++) {
      R(f), O(f);
      const i = t1(C);
      i < o && (o = i, N = f), R(f);
    }
  }
  return R(N), O(N), { ok: !0, size: g, version: e, ecc: r, mask: N, modules: C };
}
function t1(n) {
  const t = n.length;
  let r = 0;
  const s = (e, a) => (w) => a ? n[w][e] : n[e][w];
  for (const e of [!1, !0])
    for (let a = 0; a < t; a++) {
      const w = s(a, e), h = [0, 0, 0, 0, 0, 0, 0], G = (d) => {
        h[0] === 0 && (d += t), h.pop(), h.unshift(d);
      }, k = () => {
        const d = h[1], m = d > 0 && h[2] === d && h[3] === d * 3 && h[4] === d && h[5] === d;
        return (m && h[0] >= d * 4 && h[6] >= d ? 1 : 0) + (m && h[6] >= d * 4 && h[0] >= d ? 1 : 0);
      };
      let b = !1, A = 0;
      for (let d = 0; d < t; d++)
        w(d) === b ? (A++, A === 5 ? r += 3 : A > 5 && r++) : (G(A), b || (r += k() * 40), b = w(d), A = 1);
      b && (G(A), A = 0), A += t, G(A), r += k() * 40;
    }
  for (let e = 0; e + 1 < t; e++)
    for (let a = 0; a + 1 < t; a++) {
      const w = n[e][a];
      w === n[e][a + 1] && w === n[e + 1][a] && w === n[e + 1][a + 1] && (r += 3);
    }
  let c = 0;
  for (const e of n) for (const a of e) a && c++;
  const l = t * t;
  return r += (Math.ceil(Math.abs(c * 20 - l * 10) / l) - 1) * 10, r;
}
const e1 = "212222 222122 222221 121223 121322 131222 122213 122312 132212 221213 221312 231212 112232 122132 122231 113222 123122 123221 223211 221132 221231 213212 223112 312131 311222 321122 321221 312212 322112 322211 212123 212321 232121 111323 131123 131321 112313 132113 132311 211313 231113 231311 112133 112331 132131 113123 113321 133121 313121 211331 231131 213113 213311 213131 311123 311321 331121 312113 312311 332111 314111 221411 431111 111224 111422 121124 121421 141122 141221 112214 112412 122114 122411 142112 142211 241211 221114 413111 241112 134111 111242 121142 121241 114212 124112 124211 411212 421112 421211 212141 214121 412121 111143 111341 131141 114113 114311 411113 411311 113141 114131 311141 411131 211412 211214 211232 2331112".split(" ");
function o1(n) {
  for (const w of n) if (w.charCodeAt(0) > 127 || w.length > 1) return null;
  const t = (w) => {
    let h = 0;
    for (; w + h < n.length && n[w + h] >= "0" && n[w + h] <= "9"; ) h++;
    return h;
  }, r = (w) => {
    for (let h = w; h < n.length; h++) {
      const G = n.charCodeAt(h);
      if (G < 32) return "A";
      if (G >= 96) return "B";
    }
    return "B";
  }, s = [];
  let c;
  const l = t(0);
  l >= 4 && (l % 2 === 0 || l >= 5) || l === n.length && l >= 2 && l % 2 === 0 ? (c = "C", s.push(105)) : (c = r(0), s.push(c === "A" ? 103 : 104));
  let e = 0;
  for (; e < n.length; ) {
    const w = t(e);
    if (c === "C") {
      if (w >= 2) {
        s.push(Number(n.slice(e, e + 2))), e += 2;
        continue;
      }
      c = r(e), s.push(c === "A" ? 101 : 100);
      continue;
    }
    if (w >= 6 || w >= 4 && e + w === n.length) {
      w % 2 === 1 && (s.push(n.charCodeAt(e) - 32), e++), c = "C", s.push(99);
      continue;
    }
    const h = n.charCodeAt(e);
    if (c === "B" && h < 32) {
      if (e + 1 < n.length && n.charCodeAt(e + 1) >= 32 && r(e + 1) === "B") {
        s.push(98, h + 64), e++;
        continue;
      }
      c = "A", s.push(101);
      continue;
    }
    if (c === "A" && h >= 96) {
      c = "B", s.push(100);
      continue;
    }
    s.push(c === "A" && h < 32 ? h + 64 : h - 32), e++;
  }
  let a = s[0];
  for (let w = 1; w < s.length; w++) a += s[w] * w;
  return s.push(a % 103, 106), s;
}
const H = ["0001101", "0011001", "0010011", "0111101", "0100011", "0110001", "0101111", "0111011", "0110111", "0001011"], K = H.map((n) => [...n].map((t) => t === "1" ? "0" : "1").join("")), r1 = K.map((n) => [...n].reverse().join("")), s1 = ["LLLLLL", "LLGLGG", "LLGGLG", "LLGGGL", "LGLLGG", "LGGLLG", "LGGGLL", "LGLGLG", "LGLGGL", "LGGLGL"];
function c1(n) {
  let t = 0;
  for (let r = 0; r < 12; r++) t += Number(n[r]) * (r % 2 === 0 ? 1 : 3);
  return (10 - t % 10) % 10;
}
const Q = {
  0: "nnnwwnwnn",
  1: "wnnwnnnnw",
  2: "nnwwnnnnw",
  3: "wnwwnnnnn",
  4: "nnnwwnnnw",
  5: "wnnwwnnnn",
  6: "nnwwwnnnn",
  7: "nnnwnnwnw",
  8: "wnnwnnwnn",
  9: "nnwwnnwnn",
  A: "wnnnnwnnw",
  B: "nnwnnwnnw",
  C: "wnwnnwnnn",
  D: "nnnnwwnnw",
  E: "wnnnwwnnn",
  F: "nnwnwwnnn",
  G: "nnnnnwwnw",
  H: "wnnnnwwnn",
  I: "nnwnnwwnn",
  J: "nnnnwwwnn",
  K: "wnnnnnnww",
  L: "nnwnnnnww",
  M: "wnwnnnnwn",
  N: "nnnnwnnww",
  O: "wnnnwnnwn",
  P: "nnwnwnnwn",
  Q: "nnnnnnwww",
  R: "wnnnnnwwn",
  S: "nnwnnnwwn",
  T: "nnnnwnwwn",
  U: "wwnnnnnnw",
  V: "nwwnnnnnw",
  W: "wwwnnnnnn",
  X: "nwnnwnnnw",
  Y: "wwnnwnnnn",
  Z: "nwwnwnnnn",
  "-": "nwnnnnwnw",
  ".": "wwnnnnwnn",
  " ": "nwwnnnwnn",
  "*": "nwnnwnwnn",
  $: "nwnwnwnnn",
  "/": "nwnwnnnwn",
  "+": "nwnnnwnwn",
  "%": "nnnwnwnwn"
};
function f1(n, t) {
  if (n === "") return { ok: !1, error: "nothing to encode", code: "empty" };
  if (t === "code128") {
    const l = o1(n);
    if (!l) return { ok: !1, error: "Code 128 holds ASCII only", code: "code128Ascii" };
    const e = l.flatMap((a) => [...e1[a]].map(Number));
    return { ok: !0, format: t, text: n, widths: e, length: e.reduce((a, w) => a + w, 0) };
  }
  if (t === "ean13") {
    if (!/^\d{12,13}$/.test(n)) return { ok: !1, error: "EAN-13 is 12 digits (the check digit is added) or 13", code: "ean13Digits" };
    const l = c1(n);
    if (n.length === 13 && Number(n[12]) !== l) return { ok: !1, error: `the check digit should be ${l}`, code: "ean13Check", values: { check: l } };
    const e = n.slice(0, 12) + l, a = s1[Number(e[0])];
    let w = "101";
    for (let h = 1; h <= 6; h++) w += (a[h - 1] === "L" ? H : r1)[Number(e[h])];
    w += "01010";
    for (let h = 7; h <= 12; h++) w += K[Number(e[h])];
    return w += "101", { ok: !0, format: t, text: e, widths: l1(w), length: w.length };
  }
  const r = [...n].find((l) => !(l in Q) || l === "*");
  if (r !== void 0) return { ok: !1, error: `Code 39 has no “${r}” (it holds 0–9, A–Z, space and - . $ / + %)`, code: "code39Char", values: { char: r } };
  const s = [], c = `*${n}*`;
  for (let l = 0; l < c.length; l++) {
    for (const e of Q[c[l]]) s.push(e === "w" ? 3 : 1);
    l < c.length - 1 && s.push(1);
  }
  return { ok: !0, format: t, text: n, widths: s, length: s.reduce((l, e) => l + e, 0) };
}
function l1(n) {
  const t = [];
  let r = 1;
  for (let s = 1; s <= n.length; s++)
    s < n.length && n[s] === n[s - 1] ? r++ : (t.push(r), r = 1);
  return t;
}
function w1(n, t = 4) {
  let r = "";
  return n.forEach((s, c) => {
    for (let l = 0; l < s.length; ) {
      if (!s[l]) {
        l++;
        continue;
      }
      let e = 1;
      for (; l + e < s.length && s[l + e]; ) e++;
      r += `M${l + t} ${c + t}h${e}v1h${-e}z`, l += e;
    }
  }), r;
}
export {
  o1 as code128Values,
  c1 as eanCheckDigit,
  f1 as encodeBarcode,
  i1 as encodeQr,
  x as qrAlignmentPositions,
  P as qrDataCodewords,
  J as qrMode,
  w1 as qrPath,
  t1 as qrPenalty,
  F as qrRawModules
};
//# sourceMappingURL=index169.js.map
