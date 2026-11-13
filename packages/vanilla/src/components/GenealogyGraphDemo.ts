import { GenealogyGraph, type GenealogyNode } from "./genealogy-graph/genealogy-graph";
import { DemoPage } from "./demo-helpers";

const nodes: GenealogyNode[] = [
  { id: "COIL-5521", label: "COIL-5521", kind: "Steel coil", detail: "1.2 mm · 4.8 t" },
  { id: "LOT-77", label: "LOT-77", kind: "Blanks lot", detail: "2,400 pcs" },
  { id: "PNT-310", label: "PNT-310", kind: "Paint lot", detail: "RAL 7016" },
  { id: "WO-10042", label: "WO-10042", kind: "Work order", detail: "500 × bracket" },
  { id: "WO-10051", label: "WO-10051", kind: "Work order", detail: "800 × hinge plate" },
  { id: "CTN-0091", label: "CTN-0091", kind: "Carton", detail: "250 pcs" },
  { id: "CTN-0092", label: "CTN-0092", kind: "Carton", detail: "250 pcs" },
  { id: "CTN-0140", label: "CTN-0140", kind: "Carton", detail: "400 pcs" },
  { id: "PAL-0007", label: "PAL-0007", kind: "Pallet" },
  { id: "PAL-0011", label: "PAL-0011", kind: "Pallet" },
  { id: "SHP-3301", label: "SHP-3301", kind: "Shipment", detail: "Customer: Acme" },
  { id: "SHP-3307", label: "SHP-3307", kind: "Shipment", detail: "Customer: Zenith" },
];
const edges = [
  { from: "COIL-5521", to: "LOT-77" },
  { from: "LOT-77", to: "WO-10042" },
  { from: "LOT-77", to: "WO-10051" },
  { from: "PNT-310", to: "WO-10042" },
  { from: "WO-10042", to: "CTN-0091" },
  { from: "WO-10042", to: "CTN-0092" },
  { from: "WO-10051", to: "CTN-0140" },
  { from: "CTN-0091", to: "PAL-0007" },
  { from: "CTN-0092", to: "PAL-0007" },
  { from: "CTN-0140", to: "PAL-0011" },
  { from: "PAL-0007", to: "SHP-3301" },
  { from: "PAL-0011", to: "SHP-3307" },
];

/** Section 1: the focus is the page's, so the readout below follows it. */
function traced(): HTMLElement {
  const wrap = document.createElement("div");
  wrap.className = "zen-flex zen-w-full zen-flex-col zen-gap-2";
  const readout = document.createElement("p");
  readout.className = "zen-m-0 zen-text-sm";
  readout.dataset.testid = "focus";
  const show = (id: string) => {
    readout.textContent = "Tracing: " + id;
  };
  show("WO-10042");
  const graph = GenealogyGraph({
    nodes,
    edges,
    focus: "WO-10042",
    "data-testid": "trace",
    onFocusChange: (id) => {
      graph.update({ focus: id });
      show(id);
    },
  });
  wrap.append(graph.el, readout);
  return wrap;
}

export default function GenealogyGraphDemo(): HTMLElement {
  return DemoPage({
    title: "GenealogyGraph",
    description:
      "Trace a lot, order or unit both ways: what it was made from (left) and what it went into (right). The view a recall or a customer complaint starts with.",
    sections: [
      {
        title: "1. A work order, both ways",
        codeTitle: "nodes, edges from input to output, a focus",
        codeDescription:
          "Click any item to trace from it. Trace from the coil and the recall scope appears: the bad coil went into one blanks lot, which went into two work orders, two pallets and two customers' shipments. Depth is cut at 3 levels each way; trace from the coil and the last step is cut — and says so.",
        code: `const graph = GenealogyGraph({
  nodes: [{ id: "LOT-77", label: "LOT-77", kind: "Blanks lot" }, …],
  edges: [{ from: "COIL-5521", to: "LOT-77" }, …],
  focus: "WO-10042",
  onFocusChange: (id) => graph.update({ focus: id }),
});`,
        render: () => traced(),
      },
    ],
  });
}
