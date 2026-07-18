import type { ObjectState, ObjectMarkerType } from "@algorisys/zen-ui-vanilla";
import { DemoPage } from "./demo-helpers";

/**
 * Object atoms demo — the web-components port. <zen-object-status>,
 * <zen-object-number>, <zen-object-identifier> and <zen-object-marker> are the
 * small semantic display elements object pages and list reports are built from.
 * `value` / `unit` / `title` / `text` are Child JS properties; the rest are attrs.
 */

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

function status(opts: {
  state: ObjectState;
  text: string;
  inverted?: boolean;
  icon?: string;
  stateAnnouncement?: string;
}): HTMLElement {
  const el = document.createElement("zen-object-status");
  el.setAttribute("state", opts.state);
  if (opts.inverted) el.setAttribute("inverted", "");
  if (opts.icon != null) el.setAttribute("icon", opts.icon);
  if (opts.stateAnnouncement != null) el.setAttribute("state-announcement", opts.stateAnnouncement);
  el.textContent = opts.text;
  return el;
}

function objNumber(opts: {
  value: string;
  unit?: string;
  state?: ObjectState;
  emphasized?: boolean;
}): HTMLElement {
  const el = document.createElement("zen-object-number");
  if (opts.state) el.setAttribute("state", opts.state);
  if (opts.emphasized) el.setAttribute("emphasized", "");
  (el as unknown as { value: string }).value = opts.value;
  if (opts.unit != null) (el as unknown as { unit: string }).unit = opts.unit;
  return el;
}

function identifier(title: string, text?: string): HTMLElement {
  const el = document.createElement("zen-object-identifier");
  (el as unknown as { title: string }).title = title;
  if (text != null) (el as unknown as { text: string }).text = text;
  return el;
}

function marker(type: ObjectMarkerType, showLabel?: boolean, label?: string): HTMLElement {
  const el = document.createElement("zen-object-marker");
  el.setAttribute("type", type);
  if (showLabel) el.setAttribute("show-label", "");
  if (label != null) el.setAttribute("label", label);
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
        code: `<zen-object-status state="success">Approved</zen-object-status>
<zen-object-status state="warning">Pending</zen-object-status>
<zen-object-status state="error">Rejected</zen-object-status>
<zen-object-status state="info">In review</zen-object-status>`,
        render: () => row(STATES.map((s) => status({ state: s, text: s }))),
      },
      {
        title: "2. ObjectStatus — inverted",
        codeTitle: "A filled pill rather than coloured text",
        code: `<zen-object-status inverted state="success">Approved</zen-object-status>
<zen-object-status inverted state="error">Rejected</zen-object-status>`,
        render: () => row(STATES.map((s) => status({ inverted: true, state: s, text: s }))),
      },
      {
        title: "3. ObjectStatus — custom icon, and no icon",
        codeTitle: "icon overrides the state default",
        codeDescription:
          "icon overrides the state default. To drop the icon entirely, set the JS property el.icon = null (state=\"none\" carries no default icon either).",
        code: `<zen-object-status state="success" icon="star">Featured</zen-object-status>
<zen-object-status state="info" icon="clock">Scheduled</zen-object-status>

const el = document.querySelector("zen-object-status");
el.icon = null;   // no icon`,
        render: () =>
          row([
            status({ state: "success", icon: "star", text: "Featured" }),
            status({ state: "info", icon: "clock", text: "Scheduled" }),
            status({ state: "none", text: "Text only" }),
          ]),
      },
      {
        title: "4. ObjectStatus — stateAnnouncement (a11y)",
        codeTitle: "Colour alone must not carry meaning",
        codeDescription:
          "state-announcement adds screen-reader-only text naming the state. Inspect the DOM — it renders inside a .zen-sr-only span.",
        code: `<zen-object-status state="error" state-announcement="Error:">Payment failed</zen-object-status>`,
        render: () =>
          row([
            status({ state: "error", stateAnnouncement: "Error:", text: "Payment failed" }),
            status({ state: "success", stateAnnouncement: "Success:", text: "Payment cleared" }),
          ]),
      },
      {
        title: "5. ObjectNumber — value, unit, state",
        codeTitle: "value is pre-formatted — this component does not format",
        code: `const el = document.querySelector("zen-object-number");
el.value = "1,234.56";
el.unit = "EUR";`,
        render: () =>
          row([
            objNumber({ value: "1,234.56", unit: "EUR" }),
            objNumber({ value: "847", unit: "pcs", state: "success" }),
            objNumber({ value: "12", unit: "days", state: "warning" }),
            objNumber({ value: "-92.10", unit: "EUR", state: "error" }),
            objNumber({ value: "3", unit: "open", state: "info" }),
          ]),
      },
      {
        title: "6. ObjectNumber — emphasized",
        codeTitle: "Larger and bolder — for the headline figure on an object page",
        code: `<zen-object-number emphasized state="success"></zen-object-number>
el.value = "1,234.56"; el.unit = "EUR";`,
        render: () =>
          row([
            objNumber({ value: "1,234.56", unit: "EUR", state: "success" }),
            objNumber({ emphasized: true, value: "1,234.56", unit: "EUR", state: "success" }),
          ]),
      },
      {
        title: "7. ObjectIdentifier",
        codeTitle: "The title/subtitle pair that names an object",
        code: `const el = document.querySelector("zen-object-identifier");
el.title = "Acme Corporation";
el.text = "Customer · 1000473";`,
        render: () =>
          row(
            [
              identifier("Acme Corporation", "Customer · 1000473"),
              identifier("PO-2024-0917", "Purchase order"),
              identifier("Title only"),
            ],
            { gap: "32px", alignItems: "flex-start" },
          ),
      },
      {
        title: "8. ObjectMarker — types",
        codeTitle: "Icon-only by default; still named for assistive tech",
        codeDescription: "flagged · favorite · draft · locked · unsaved",
        code: `<zen-object-marker type="flagged"></zen-object-marker>
<zen-object-marker type="favorite"></zen-object-marker>
<zen-object-marker type="draft"></zen-object-marker>`,
        render: () => row(MARKERS.map((t) => marker(t))),
      },
      {
        title: "9. ObjectMarker — showLabel and custom label",
        codeTitle: "show-label prints the name; label overrides it",
        code: `<zen-object-marker type="draft" show-label></zen-object-marker>
<zen-object-marker type="locked" show-label label="Locked by A. Sharma"></zen-object-marker>`,
        render: () =>
          row([
            ...MARKERS.map((t) => marker(t, true)),
            marker("locked", true, "Locked by A. Sharma"),
          ]),
      },
      {
        title: "10. In context — a list row",
        codeTitle: "What the atoms are for",
        code: `<zen-object-identifier></zen-object-identifier>
<zen-object-marker type="favorite"></zen-object-marker>
<zen-object-number emphasized state="success"></zen-object-number>
<zen-object-status state="success">Approved</zen-object-status>`,
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
            markerType: ObjectMarkerType;
            num: string;
            state: ObjectState;
            label: string;
          }> = [
            { title: "Acme Corporation", id: "1000473", markerType: "favorite", num: "1,234.56", state: "success", label: "Approved" },
            { title: "Globex Ltd", id: "1000891", markerType: "draft", num: "88.00", state: "warning", label: "Pending" },
            { title: "Initech", id: "1000112", markerType: "locked", num: "-92.10", state: "error", label: "Rejected" },
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
            left.append(identifier(r.title, r.id), marker(r.markerType));

            const right = document.createElement("div");
            Object.assign(right.style, { display: "flex", alignItems: "center", gap: "16px" });
            right.append(
              objNumber({ emphasized: true, value: r.num, unit: "EUR", state: r.state }),
              status({ state: r.state, text: r.label }),
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
