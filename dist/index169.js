import { visuallyHiddenStyles as s } from "./index160.js";
var r = 7e3, o = null, l = "data-live-announcer";
function c(e, t = "assertive", n = r) {
  o || (o = new d()), o.announce(e, t, n);
}
var d = class {
  node;
  assertiveLog;
  politeLog;
  constructor() {
    this.node = document.createElement("div"), this.node.dataset.liveAnnouncer = "true", Object.assign(this.node.style, s), this.assertiveLog = this.createLog("assertive"), this.node.appendChild(this.assertiveLog), this.politeLog = this.createLog("polite"), this.node.appendChild(this.politeLog), document.body.prepend(this.node);
  }
  createLog(e) {
    const t = document.createElement("div");
    return t.setAttribute("role", "log"), t.setAttribute("aria-live", e), t.setAttribute("aria-relevant", "additions"), t;
  }
  destroy() {
    this.node && (document.body.removeChild(this.node), this.node = null);
  }
  announce(e, t = "assertive", n = r) {
    if (!this.node)
      return;
    const i = document.createElement("div");
    i.textContent = e, t === "assertive" ? this.assertiveLog.appendChild(i) : this.politeLog.appendChild(i), e !== "" && setTimeout(() => {
      i.remove();
    }, n);
  }
  clear(e) {
    this.node && ((!e || e === "assertive") && (this.assertiveLog.innerHTML = ""), (!e || e === "polite") && (this.politeLog.innerHTML = ""));
  }
};
export {
  l as DATA_LIVE_ANNOUNCER_ATTR,
  c as announce
};
//# sourceMappingURL=index169.js.map
