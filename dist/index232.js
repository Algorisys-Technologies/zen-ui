import e from "react";
function s(n) {
  const { size: o = 24, orientation: t = "left", className: l, style: i } = n;
  return e.createElement(
    "svg",
    { className: l, style: i, width: o, height: o, viewBox: "0 0 24 24" },
    t === "up" && e.createElement("polygon", { points: "6.77 17 12.5 11.43 18.24 17 20 15.28 12.5 8 5 15.28" }),
    t === "down" && e.createElement("polygon", { points: "6.77 8 12.5 13.57 18.24 8 20 9.72 12.5 17 5 9.72" }),
    t === "left" && e.createElement("polygon", { points: "16 18.112 9.81111111 12 16 5.87733333 14.0888889 4 6 12 14.0888889 20" }),
    t === "right" && e.createElement("polygon", { points: "8 18.112 14.18888889 12 8 5.87733333 9.91111111 4 18 12 9.91111111 20" })
  );
}
export {
  s as Chevron
};
//# sourceMappingURL=index232.js.map
