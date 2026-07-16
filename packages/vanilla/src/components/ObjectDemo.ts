import {
  ObjectStatus,
  ObjectNumber,
  ObjectIdentifier,
  ObjectMarker,
  type ObjectState,
  type ObjectMarkerType,
} from "./object/object";
import { DemoPage } from "./demo-helpers";

const STATES: ObjectState[] = ["none", "success", "warning", "error", "info"];
const MARKERS: ObjectMarkerType[] = ["flagged", "favorite", "draft", "locked", "unsaved"];

/** A flex row, the demo's container for a set of atoms. */
function row(children: Node[], extra?: Partial<CSSStyleDeclaration>): HTMLElement {
  const el = document.createElement("div");
  el.style.display = "flex";
  el.style.gap = "16px";
  el.style.flexWrap = "wrap";
  el.style.alignItems = "center";
  if (extra) Object.assign(el.style, extra);
  el.append(...children);
  return el;
}

export default function ObjectDemo(): HTMLElement {
  return DemoPage({
    title: "Object atoms",
    description:
      "The small semantic display elements object pages, list reports and tables are built out of: ObjectStatus, ObjectNumber, ObjectIdentifier and ObjectMarker. state maps onto the existing --zen-color-{success,warning,error,info} roles, so these retheme with everything else.",
    sections: [
      {
        title: "1. ObjectStatus — states",
        codeTitle: "state drives colour and the default icon",
        codeDescription: "none · success · warning · error · info",
        code: `ObjectStatus({ state: "success", children: "Approved" });
ObjectStatus({ state: "warning", children: "Pending" });
ObjectStatus({ state: "error", children: "Rejected" });
ObjectStatus({ state: "info", children: "In review" });`,
        render: () => row(STATES.map((s) => ObjectStatus({ state: s, children: s }).el)),
      },
      {
        title: "2. ObjectStatus — inverted",
        codeTitle: "A filled pill rather than coloured text",
        code: `ObjectStatus({ inverted: true, state: "success", children: "Approved" });
ObjectStatus({ inverted: true, state: "error", children: "Rejected" });`,
        render: () => row(STATES.map((s) => ObjectStatus({ inverted: true, state: s, children: s }).el)),
      },
      {
        title: "3. ObjectStatus — custom icon, and no icon",
        codeTitle: "icon overrides the state default; icon: null drops it",
        code: `ObjectStatus({ state: "success", icon: "star", children: "Featured" });
ObjectStatus({ state: "info", icon: "clock", children: "Scheduled" });
ObjectStatus({ state: "error", icon: null, children: "Text only" });`,
        render: () =>
          row([
            ObjectStatus({ state: "success", icon: "star", children: "Featured" }).el,
            ObjectStatus({ state: "info", icon: "clock", children: "Scheduled" }).el,
            ObjectStatus({ state: "error", icon: null, children: "Text only" }).el,
          ]),
      },
      {
        title: "4. ObjectStatus — stateAnnouncement (a11y)",
        codeTitle: "Colour alone must not carry meaning",
        codeDescription:
          "stateAnnouncement adds screen-reader-only text naming the state. Inspect the DOM — it renders inside a .zen-sr-only span.",
        code: `ObjectStatus({ state: "error", stateAnnouncement: "Error:", children: "Payment failed" });`,
        render: () =>
          row([
            ObjectStatus({ state: "error", stateAnnouncement: "Error:", children: "Payment failed" }).el,
            ObjectStatus({ state: "success", stateAnnouncement: "Success:", children: "Payment cleared" }).el,
          ]),
      },
      {
        title: "5. ObjectNumber — value, unit, state",
        codeTitle: "value is pre-formatted — this component does not format",
        code: `ObjectNumber({ value: "1,234.56", unit: "EUR" });
ObjectNumber({ value: "847", unit: "pcs", state: "success" });
ObjectNumber({ value: "-92.10", unit: "EUR", state: "error" });`,
        render: () =>
          row([
            ObjectNumber({ value: "1,234.56", unit: "EUR" }).el,
            ObjectNumber({ value: "847", unit: "pcs", state: "success" }).el,
            ObjectNumber({ value: "12", unit: "days", state: "warning" }).el,
            ObjectNumber({ value: "-92.10", unit: "EUR", state: "error" }).el,
            ObjectNumber({ value: "3", unit: "open", state: "info" }).el,
          ]),
      },
      {
        title: "6. ObjectNumber — emphasized",
        codeTitle: "Larger and bolder — for the headline figure on an object page",
        code: `ObjectNumber({ emphasized: true, value: "1,234.56", unit: "EUR", state: "success" });`,
        render: () =>
          row([
            ObjectNumber({ value: "1,234.56", unit: "EUR", state: "success" }).el,
            ObjectNumber({ emphasized: true, value: "1,234.56", unit: "EUR", state: "success" }).el,
          ]),
      },
      {
        title: "7. ObjectIdentifier",
        codeTitle: "The title/subtitle pair that names an object",
        code: `ObjectIdentifier({ title: "Acme Corporation", text: "Customer · 1000473" });
ObjectIdentifier({ title: "Title only" });`,
        render: () =>
          row(
            [
              ObjectIdentifier({ title: "Acme Corporation", text: "Customer · 1000473" }).el,
              ObjectIdentifier({ title: "PO-2024-0917", text: "Purchase order" }).el,
              ObjectIdentifier({ title: "Title only" }).el,
            ],
            { gap: "32px", alignItems: "flex-start" },
          ),
      },
      {
        title: "8. ObjectMarker — types",
        codeTitle: "Icon-only by default; still named for assistive tech",
        codeDescription: "flagged · favorite · draft · locked · unsaved",
        code: `ObjectMarker({ type: "flagged" });
ObjectMarker({ type: "favorite" });
ObjectMarker({ type: "draft" });`,
        render: () => row(MARKERS.map((t) => ObjectMarker({ type: t }).el)),
      },
      {
        title: "9. ObjectMarker — showLabel and custom label",
        codeTitle: "showLabel prints the name; label overrides it",
        code: `ObjectMarker({ type: "draft", showLabel: true });
ObjectMarker({ type: "locked", showLabel: true, label: "Locked by A. Sharma" });`,
        render: () =>
          row([
            ...MARKERS.map((t) => ObjectMarker({ type: t, showLabel: true }).el),
            ObjectMarker({ type: "locked", showLabel: true, label: "Locked by A. Sharma" }).el,
          ]),
      },
      {
        title: "10. In context — a list row",
        codeTitle: "What the atoms are for",
        code: `ObjectIdentifier({ title: "Acme Corporation", text: "1000473" });
ObjectMarker({ type: "favorite" });
ObjectNumber({ emphasized: true, value: "1,234.56", unit: "EUR", state: "success" });
ObjectStatus({ state: "success", children: "Approved" });`,
        render: () => {
          const container = document.createElement("div");
          Object.assign(container.style, {
            display: "flex",
            flexDirection: "column",
            gap: "0",
            width: "100%",
            border: "1px solid var(--zen-color-border)",
            borderRadius: "var(--zen-radius-md)",
          });

          const rows: Array<{
            title: string;
            id: string;
            marker: ObjectMarkerType;
            num: string;
            state: ObjectState;
            label: string;
          }> = [
            { title: "Acme Corporation", id: "1000473", marker: "favorite", num: "1,234.56", state: "success", label: "Approved" },
            { title: "Globex Ltd", id: "1000891", marker: "draft", num: "88.00", state: "warning", label: "Pending" },
            { title: "Initech", id: "1000112", marker: "locked", num: "-92.10", state: "error", label: "Rejected" },
          ];

          rows.forEach((r, i) => {
            const line = document.createElement("div");
            Object.assign(line.style, {
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "16px",
              padding: "0.75rem 1rem",
              borderTop: i === 0 ? "none" : "1px solid var(--zen-color-border)",
            });

            const left = document.createElement("div");
            Object.assign(left.style, { display: "flex", alignItems: "center", gap: "8px" });
            left.append(
              ObjectIdentifier({ title: r.title, text: r.id }).el,
              ObjectMarker({ type: r.marker }).el,
            );

            const right = document.createElement("div");
            Object.assign(right.style, { display: "flex", alignItems: "center", gap: "16px" });
            right.append(
              ObjectNumber({ emphasized: true, value: r.num, unit: "EUR", state: r.state }).el,
              ObjectStatus({ state: r.state, children: r.label }).el,
            );

            line.append(left, right);
            container.append(line);
          });

          return container;
        },
      },
    ],
  });
}
