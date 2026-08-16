import a from "./index382.js";
import t from "./index383.js";
function i(o) {
  return o || n("configIsRequired"), t(o) || n("configType"), o.urls ? (c(), {
    paths: {
      vs: o.urls.monacoBase
    }
  }) : o;
}
function c() {
  console.warn(r.deprecation);
}
function u(o, e) {
  throw new Error(o[e] || o.default);
}
var r = {
  configIsRequired: "the configuration object is required",
  configType: "the configuration object should be an object",
  default: "an unknown error accured in `@monaco-editor/loader` package",
  deprecation: `Deprecation warning!
    You are using deprecated way of configuration.

    Instead of using
      monaco.config({ urls: { monacoBase: '...' } })
    use
      monaco.config({ paths: { vs: '...' } })

    For more please check the link https://github.com/suren-atoyan/monaco-loader#config
  `
}, n = a(u)(r), d = {
  config: i
};
export {
  d as default,
  n as errorHandler,
  r as errorMessages
};
//# sourceMappingURL=index367.js.map
