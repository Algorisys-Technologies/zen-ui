const u = {
  esc: "Escape",
  escape: "Escape",
  enter: "Enter",
  return: "Enter",
  tab: "Tab",
  space: " ",
  up: "ArrowUp",
  down: "ArrowDown",
  left: "ArrowLeft",
  right: "ArrowRight",
  "↑": "ArrowUp",
  "↓": "ArrowDown",
  "←": "ArrowLeft",
  "→": "ArrowRight",
  arrowup: "ArrowUp",
  arrowdown: "ArrowDown",
  arrowleft: "ArrowLeft",
  arrowright: "ArrowRight",
  pageup: "PageUp",
  pagedown: "PageDown",
  home: "Home",
  end: "End",
  del: "Delete",
  delete: "Delete",
  backspace: "Backspace",
  ins: "Insert",
  insert: "Insert",
  plus: "+"
}, f = (t) => {
  const s = u[t.toLowerCase()];
  return s || (/^f\d{1,2}$/i.test(t) ? t.toUpperCase() : t.length === 1 ? t.toLowerCase() : t);
};
function w(t) {
  const s = t === "+" ? ["+"] : t.split(/\+(?!$)/).map((r) => r.trim()).filter(Boolean), e = { mod: !1, ctrl: !1, alt: !1, shift: !1, meta: !1, key: "" };
  return s.forEach((r, n) => {
    const o = r.toLowerCase();
    if (n === s.length - 1) {
      e.key = f(r);
      return;
    }
    if (o === "mod") e.mod = !0;
    else if (o === "ctrl" || o === "control") e.ctrl = !0;
    else if (o === "alt" || o === "option" || o === "opt") e.alt = !0;
    else if (o === "shift") e.shift = !0;
    else if (o === "meta" || o === "cmd" || o === "command") e.meta = !0;
    else throw new Error(`Unknown modifier "${r}" in "${t}"`);
  }), e;
}
function i(t, s) {
  return {
    ctrl: t.ctrl || t.mod && s === "other",
    meta: t.meta || t.mod && s === "mac",
    alt: t.alt,
    shift: t.shift
  };
}
function m(t, s, e) {
  const r = i(s, e);
  if (t.ctrlKey !== r.ctrl || t.metaKey !== r.meta || t.altKey !== r.alt) return !1;
  const n = s.key;
  if (/^[a-z0-9]$/.test(n)) {
    if (t.shiftKey !== r.shift) return !1;
    const l = t.key.toLowerCase() === n, c = !!t.code && (t.code === `Key${n.toUpperCase()}` || t.code === `Digit${n}`);
    return l || r.alt && c;
  }
  return n.length === 1 ? s.shift && !t.shiftKey ? !1 : t.key === n : t.shiftKey !== r.shift ? !1 : f(t.key) === n;
}
const a = { ctrl: "⌃", alt: "⌥", shift: "⇧", meta: "⌘" }, p = {
  ArrowUp: "↑",
  ArrowDown: "↓",
  ArrowLeft: "←",
  ArrowRight: "→",
  Escape: "Esc",
  " ": "Space",
  PageUp: "PageUp",
  PageDown: "PageDown",
  Delete: "Del",
  Insert: "Ins"
};
function h(t, s) {
  const e = i(t, s), r = [];
  s === "mac" ? (e.ctrl && r.push(a.ctrl), e.alt && r.push(a.alt), e.shift && r.push(a.shift), e.meta && r.push(a.meta)) : (e.ctrl && r.push("Ctrl"), e.meta && r.push("Win"), e.alt && r.push("Alt"), e.shift && r.push("Shift"));
  const n = p[t.key] ?? (t.key.length === 1 ? t.key.toUpperCase() : t.key);
  return [...r, n];
}
function y(t, s) {
  const e = h(t, s);
  return s === "mac" ? e.join("") : e.join("+");
}
function g(t, s) {
  const e = i(t, s), r = [];
  e.ctrl && r.push("Control"), e.alt && r.push("Alt"), e.shift && r.push("Shift"), e.meta && r.push("Meta");
  const n = t.key === " " ? "Space" : t.key.length === 1 ? t.key.toUpperCase() : t.key;
  return r.push(n), r.join("+");
}
function A(t, s) {
  const e = i(t, s), r = s === "mac" ? e.meta : e.ctrl, n = t.key;
  return !!(r && !e.alt && ["t", "n", "w", "l", "r", "q", "h", "j"].includes(n) || r && n === "Tab" || !e.ctrl && !e.meta && !e.alt && ["F5", "F11", "F12"].includes(n) || s === "other" && e.alt && !e.ctrl && (n === "F4" || n === "ArrowLeft" || n === "ArrowRight") || s === "mac" && e.meta && (n === "ArrowLeft" || n === "ArrowRight" || n === "[" || n === "]"));
}
function d(t, s, e) {
  const r = i(t, e), n = i(s, e);
  return r.ctrl === n.ctrl && r.meta === n.meta && r.alt === n.alt && r.shift === n.shift && t.key === s.key;
}
function k(t) {
  const s = t;
  if (!s || typeof s.tagName != "string") return !1;
  const e = s.tagName;
  if (e === "TEXTAREA" || e === "SELECT" || s.isContentEditable) return !0;
  if (e === "INPUT") {
    const r = (s.getAttribute("type") ?? "text").toLowerCase();
    return !["checkbox", "radio", "button", "submit", "reset", "range", "color", "file"].includes(r);
  }
  return !1;
}
export {
  g as ariaKeyshortcut,
  y as chordLabel,
  h as chordParts,
  A as isReservedChord,
  k as isTypingTarget,
  m as matchesChord,
  w as parseChord,
  d as sameChord
};
//# sourceMappingURL=index229.js.map
