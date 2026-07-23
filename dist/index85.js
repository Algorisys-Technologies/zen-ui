import { createComponent as t, mergeProps as z, template as i, insert as a, effect as o, setAttribute as b, memo as v, className as h } from "solid-js/web";
import { splitProps as $, Show as d, For as f } from "solid-js";
import { Checkbox as x } from "./index49.js";
import { Input as _, Textarea as C } from "./index64.js";
import { RadioGroup as q, RadioGroupItem as w } from "./index50.js";
import { Select as F } from "./index61.js";
import { Slider as B } from "./index55.js";
import { Switch as S } from "./index48.js";
import { setValue as c } from "./index146.js";
import { cn as s } from "./index106.js";
var V = /* @__PURE__ */ i('<span aria-hidden class="zen-ml-0.5 zen-text-zen-error">*'), k = /* @__PURE__ */ i("<label>"), y = /* @__PURE__ */ i('<p class="zen-text-xs zen-text-zen-muted-fg">'), L = /* @__PURE__ */ i('<p class="zen-text-xs zen-font-medium zen-text-zen-error"role=alert>'), R = /* @__PURE__ */ i("<div>"), G = /* @__PURE__ */ i("<span class=zen-text-sm>"), I = /* @__PURE__ */ i('<div class="zen-flex zen-items-center zen-gap-2">'), P = /* @__PURE__ */ i('<span class="zen-ml-0.5 zen-text-zen-error">*'), T = /* @__PURE__ */ i('<label class="zen-text-sm zen-font-medium zen-cursor-pointer">'), j = /* @__PURE__ */ i('<span class="zen-text-sm zen-font-medium">'), A = /* @__PURE__ */ i('<p class="zen-m-0 zen-text-xs zen-text-zen-muted-fg">'), M = /* @__PURE__ */ i('<p class="zen-m-0 zen-text-xs zen-font-medium zen-text-zen-error"role=alert>'), N = /* @__PURE__ */ i("<div><div>");
const m = (e) => (() => {
  var r = R();
  return a(r, t(d, {
    get when() {
      return e.label;
    },
    get children() {
      var n = k();
      return a(n, () => e.label, null), a(n, t(d, {
        get when() {
          return e.required;
        },
        get children() {
          return V();
        }
      }), null), o((l) => {
        var u = e.id, g = s("zen-text-sm zen-font-medium zen-leading-none", e.error ? "zen-text-zen-error" : "zen-text-zen-foreground");
        return u !== l.e && b(n, "for", l.e = u), g !== l.t && h(n, l.t = g), l;
      }, {
        e: void 0,
        t: void 0
      }), n;
    }
  }), null), a(r, () => e.children, null), a(r, t(d, {
    get when() {
      return v(() => !!e.description)() && !e.error;
    },
    get children() {
      var n = y();
      return a(n, () => e.description), n;
    }
  }), null), a(r, t(d, {
    get when() {
      return e.error;
    },
    get children() {
      var n = L();
      return a(n, () => e.error), n;
    }
  }), null), o(() => h(r, s("zen-flex zen-flex-col zen-gap-1.5", e.class))), r;
})();
function Y(e) {
  const [r, n] = $(e, ["of", "Field", "name", "label", "description", "required", "fieldClass"]);
  return t(r.Field, {
    get name() {
      return r.name;
    },
    children: (l, u) => {
      const g = `${r.name}-${l.name}`;
      return t(m, {
        id: g,
        get label() {
          return r.label;
        },
        get description() {
          return r.description;
        },
        get error() {
          return l.error;
        },
        get required() {
          return r.required;
        },
        get class() {
          return r.fieldClass;
        },
        get children() {
          return t(_, z({
            id: g,
            get value() {
              return l.value;
            }
          }, u, {
            get "aria-invalid"() {
              return !!l.error || void 0;
            }
          }, n));
        }
      });
    }
  });
}
function Z(e) {
  const [r, n] = $(e, ["of", "Field", "name", "label", "description", "required", "fieldClass"]);
  return t(r.Field, {
    get name() {
      return r.name;
    },
    children: (l, u) => {
      const g = `${r.name}-${l.name}`;
      return t(m, {
        id: g,
        get label() {
          return r.label;
        },
        get description() {
          return r.description;
        },
        get error() {
          return l.error;
        },
        get required() {
          return r.required;
        },
        get class() {
          return r.fieldClass;
        },
        get children() {
          return t(C, z({
            id: g,
            get value() {
              return l.value;
            }
          }, u, {
            get "aria-invalid"() {
              return !!l.error || void 0;
            }
          }, n));
        }
      });
    }
  });
}
function p(e) {
  return t(e.Field, {
    get name() {
      return e.name;
    },
    children: (r) => t(m, {
      get id() {
        return `${e.name}-${r.name}`;
      },
      get label() {
        return e.label;
      },
      get description() {
        return e.description;
      },
      get error() {
        return r.error;
      },
      get required() {
        return e.required;
      },
      get class() {
        return e.fieldClass;
      },
      get children() {
        return t(F, {
          get options() {
            return e.options;
          },
          get value() {
            return r.value ?? void 0;
          },
          onChange: (n) => {
            c(e.of, e.name, n ?? "");
          },
          get placeholder() {
            return e.placeholder;
          },
          get disabled() {
            return e.disabled;
          },
          get errorMessage() {
            return r.error;
          }
        });
      }
    })
  });
}
function ee(e) {
  return t(e.Field, {
    get name() {
      return e.name;
    },
    type: "boolean",
    children: (r) => t(m, {
      get id() {
        return `${e.name}-${r.name}`;
      },
      get label() {
        return e.label;
      },
      get description() {
        return e.description;
      },
      get error() {
        return r.error;
      },
      get required() {
        return e.required;
      },
      get class() {
        return e.fieldClass;
      },
      get children() {
        var n = I();
        return a(n, t(x, {
          get checked() {
            return r.value ?? !1;
          },
          onChange: (l) => {
            c(e.of, e.name, l);
          },
          get disabled() {
            return e.disabled;
          },
          get name() {
            return e.name;
          }
        }), null), a(n, t(d, {
          get when() {
            return e.inlineLabel;
          },
          get children() {
            var l = G();
            return a(l, () => e.inlineLabel), l;
          }
        }), null), n;
      }
    })
  });
}
function re(e) {
  return t(e.Field, {
    get name() {
      return e.name;
    },
    type: "boolean",
    children: (r) => (
      // Settings-row layout, mirroring the React binding: label + description
      // on the left, Switch pushed right. It previously used Frame (label
      // stacked above, switch below-left) like a checkbox, which is not what
      // a switch means and did not match React.
      (() => {
        var n = N(), l = n.firstChild;
        return a(l, t(d, {
          get when() {
            return e.label;
          },
          get children() {
            var u = T();
            return a(u, () => e.label, null), a(u, t(d, {
              get when() {
                return e.required;
              },
              get children() {
                return P();
              }
            }), null), o(() => b(u, "for", `${e.name}-${r.name}`)), u;
          }
        }), null), a(l, t(d, {
          get when() {
            return v(() => !!e.inlineLabel)() && !e.label;
          },
          get children() {
            var u = j();
            return a(u, () => e.inlineLabel), u;
          }
        }), null), a(l, t(d, {
          get when() {
            return e.description;
          },
          get children() {
            var u = A();
            return a(u, () => e.description), u;
          }
        }), null), a(l, t(d, {
          get when() {
            return r.error;
          },
          get children() {
            var u = M();
            return a(u, () => r.error), u;
          }
        }), null), a(n, t(S, {
          get id() {
            return `${e.name}-${r.name}`;
          },
          get checked() {
            return r.value ?? !1;
          },
          onChange: (u) => {
            c(e.of, e.name, u);
          },
          get disabled() {
            return e.disabled;
          },
          get name() {
            return e.name;
          }
        }), null), o(() => h(n, s("zen-flex zen-items-center zen-justify-between zen-gap-3", e.fieldClass))), n;
      })()
    )
  });
}
function ne(e) {
  return t(e.Field, {
    get name() {
      return e.name;
    },
    children: (r) => t(m, {
      get id() {
        return `${e.name}-${r.name}`;
      },
      get label() {
        return e.label;
      },
      get description() {
        return e.description;
      },
      get error() {
        return r.error;
      },
      get required() {
        return e.required;
      },
      get class() {
        return e.fieldClass;
      },
      get children() {
        return t(q, {
          get value() {
            return r.value ?? "";
          },
          onChange: (n) => {
            c(e.of, e.name, n);
          },
          get orientation() {
            return e.orientation;
          },
          get disabled() {
            return e.disabled;
          },
          get children() {
            return t(f, {
              get each() {
                return e.options;
              },
              children: (n) => t(w, {
                get value() {
                  return n.value;
                },
                get children() {
                  return n.label;
                }
              })
            });
          }
        });
      }
    })
  });
}
function te(e) {
  return t(e.Field, {
    get name() {
      return e.name;
    },
    type: "number",
    children: (r) => t(m, {
      get id() {
        return `${e.name}-${r.name}`;
      },
      get label() {
        return e.label;
      },
      get description() {
        return e.description;
      },
      get error() {
        return r.error;
      },
      get required() {
        return e.required;
      },
      get class() {
        return e.fieldClass;
      },
      get children() {
        return t(B, {
          get value() {
            return [r.value ?? 0];
          },
          onChange: (n) => {
            const l = n[0] ?? 0;
            c(e.of, e.name, l);
          },
          get minValue() {
            return e.minValue;
          },
          get maxValue() {
            return e.maxValue;
          },
          get step() {
            return e.step;
          },
          get disabled() {
            return e.disabled;
          }
        });
      }
    })
  });
}
export {
  ee as BoundCheckbox,
  Y as BoundInput,
  ne as BoundRadioGroup,
  p as BoundSelect,
  te as BoundSlider,
  re as BoundSwitch,
  Z as BoundTextarea
};
//# sourceMappingURL=index85.js.map
