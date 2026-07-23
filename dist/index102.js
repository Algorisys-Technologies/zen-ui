const i = [
  {
    name: "default",
    label: "Default",
    description: "Algorisys brand palette — blue + red",
    preview: ["#1C43B9", "#CE1010", "#F5F5F5"]
  },
  {
    name: "zen-theme",
    label: "Zen",
    description: "Algorisys Zen theme — classic blue + full 10-step shade scale",
    preview: ["#214698", "#E23318", "#F3F3F4"]
  },
  {
    name: "dark",
    label: "Dark",
    description: "Inverted surfaces for low-light environments",
    preview: ["#6B8FE8", "#F26464", "#0F172A"]
  }
], t = "zen-ui-theme", n = "zen:theme-change", a = (e) => e === "default" || e === "zen-theme" || e === "dark";
function o() {
  if (typeof window > "u") return "default";
  const e = window.localStorage.getItem(t);
  return a(e) ? e : "default";
}
function l(e) {
  if (!(typeof document > "u")) {
    document.documentElement.setAttribute("data-theme", e);
    try {
      window.localStorage.setItem(t, e);
    } catch {
    }
    window.dispatchEvent(new CustomEvent(n, { detail: e }));
  }
}
export {
  i as THEMES,
  n as THEME_EVENT_NAME,
  t as THEME_STORAGE_KEY,
  l as applyTheme,
  o as getInitialTheme,
  a as isThemeName
};
//# sourceMappingURL=index102.js.map
