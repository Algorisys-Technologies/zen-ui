var r = class {
  collection;
  direction;
  orientation;
  constructor(t, e, i) {
    this.collection = t, this.direction = e, this.orientation = i;
  }
  flipDirection() {
    return this.direction() === "rtl" && this.orientation() === "horizontal";
  }
  getKeyLeftOf(t) {
    if (this.flipDirection())
      return this.getNextKey(t);
    if (this.orientation() === "horizontal")
      return this.getPreviousKey(t);
  }
  getKeyRightOf(t) {
    if (this.flipDirection())
      return this.getPreviousKey(t);
    if (this.orientation() === "horizontal")
      return this.getNextKey(t);
  }
  getKeyAbove(t) {
    if (this.orientation() === "vertical")
      return this.getPreviousKey(t);
  }
  getKeyBelow(t) {
    if (this.orientation() === "vertical")
      return this.getNextKey(t);
  }
  getFirstKey() {
    let t = this.collection().getFirstKey();
    return t == null ? void 0 : (this.collection().getItem(t)?.disabled && (t = this.getNextKey(t)), t);
  }
  getLastKey() {
    let t = this.collection().getLastKey();
    return t == null ? void 0 : (this.collection().getItem(t)?.disabled && (t = this.getPreviousKey(t)), t);
  }
  getNextKey(t) {
    let e = t, i;
    do
      if (e = this.collection().getKeyAfter(e) ?? this.collection().getFirstKey(), e == null || (i = this.collection().getItem(e), i == null))
        return;
    while (i.disabled);
    return e;
  }
  getPreviousKey(t) {
    let e = t, i;
    do
      if (e = this.collection().getKeyBefore(e) ?? this.collection().getLastKey(), e == null || (i = this.collection().getItem(e), i == null))
        return;
    while (i.disabled);
    return e;
  }
};
export {
  r as TabsKeyboardDelegate
};
//# sourceMappingURL=index184.js.map
