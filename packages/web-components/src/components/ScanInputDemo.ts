import type { ScanSource } from "@algorisys/zen-ui-vanilla";
import { DemoPage } from "./demo-helpers";

/**
 * ScanInput demo — the web-components port. <zen-scan-input> fires `zen-scan`
 * with `[code, { source }]` on every submission. A listener cannot refuse a
 * code; the callback that can is the `onScan` PROPERTY, whose returned message
 * (or promise of one) the field shows — section 1. `allowTyping` is a property
 * because it defaults to true; `capture-global` is an attribute.
 */

/**
 * What a USB scanner does: a burst of keydowns a millisecond or two apart, then
 * Enter, into whatever has focus. For a field it also has to put the
 * characters in, since synthetic key events do not type.
 */
const simulateScan = async (code: string, field?: HTMLInputElement) => {
  const target: HTMLElement = field ?? document.body;
  if (field) field.focus();
  else (document.activeElement as HTMLElement | null)?.blur();
  for (const ch of code) {
    target.dispatchEvent(new KeyboardEvent("keydown", { key: ch, bubbles: true, cancelable: true }));
    if (field) field.value += ch;
    await new Promise((r) => setTimeout(r, 2));
  }
  target.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true }));
};

const KNOWN = new Map([
  ["WO-10042", "Work order 10042 — 500 × bracket, Press 4"],
  ["LOT-77", "Material lot 77 — steel coil, 1.2 mm"],
]);
const lookup = (code: string) =>
  new Promise<string | void>((resolve) =>
    setTimeout(() => resolve(KNOWN.has(code) ? undefined : `No work order or lot called ${code}`), 400),
  );

type Entry = { code: string; source: ScanSource; found?: string };
type ScanEl = HTMLElement & Record<string, unknown>;
type ScanDetail = [string, { source: ScanSource }];

/** The last four entries, newest first. Returns the list and a function that adds one. */
const entryList = () => {
  const entries: Entry[] = [];
  const ul = document.createElement("ul");
  ul.className = "zen-m-0 zen-list-none zen-p-0 zen-text-sm";
  const add = (e: Entry) => {
    entries.push(e);
    ul.replaceChildren(
      ...entries
        .slice(-4)
        .reverse()
        .map((x) => {
          const li = document.createElement("li");
          li.className = "zen-tabular-nums";
          const code = document.createElement("code");
          code.textContent = x.code;
          li.append(code, ` · ${x.source}`, x.found ? ` · ${x.found}` : "");
          return li;
        }),
    );
  };
  return { el: ul, add };
};

const column = (...nodes: Node[]) => {
  const box = document.createElement("div");
  box.className = "zen-flex zen-w-full zen-max-w-xl zen-flex-col zen-gap-3";
  box.append(...nodes);
  return box;
};

const scanInput = (attrs: Record<string, string> = {}): ScanEl => {
  const el = document.createElement("zen-scan-input") as ScanEl;
  for (const [name, value] of Object.entries(attrs)) el.setAttribute(name, value);
  return el;
};

const button = (label: string, onClick: () => void, className?: string) => {
  const el = document.createElement("zen-button");
  el.setAttribute("variant", "outline");
  if (className) el.className = className;
  el.textContent = label;
  el.addEventListener("click", onClick);
  return el;
};

const fieldOf = (scan: HTMLElement) => scan.querySelector("input") ?? undefined;

export default function ScanInputDemo(): HTMLElement {
  return DemoPage({
    title: "ScanInput",
    description:
      "A field for a USB barcode scanner, which types like a keyboard. It tells a scan from a person typing by timing — a scanner's keys arrive a few milliseconds apart — and checks each code through one callback.",
    sections: [
      {
        title: "1. Scan, or type and press Enter",
        codeTitle: "onScan returns an error message, a promise of one, or nothing",
        codeDescription:
          "Try WO-10042 or LOT-77, typed or with the button. Anything else comes back as an error from the lookup. The field clears and keeps focus for the next scan.",
        code: `<zen-scan-input id="scan"></zen-scan-input>

// A property, not an event: only a callback can answer with an error.
document.getElementById("scan").onScan = async (code, { source }) => {
  const found = await api.lookup(code);
  if (!found) return \`No work order or lot called \${code}\`;
  open(found);
};`,
        render: () => {
          const log = entryList();
          const scan = scanInput();
          scan.onScan = async (code: string, info: { source: ScanSource }) => {
            const error = await lookup(code);
            log.add({ code, source: info.source, found: error ? undefined : KNOWN.get(code) });
            return error;
          };
          const buttons = document.createElement("div");
          buttons.className = "zen-flex zen-flex-wrap zen-gap-2";
          buttons.append(
            button("Simulate a scan: WO-10042", () => void simulateScan("WO-10042", fieldOf(scan))),
            button("Simulate a scan: WO-99999", () => void simulateScan("WO-99999", fieldOf(scan))),
          );
          return column(scan, buttons, log.el);
        },
      },
      {
        title: "2. Scanning required",
        codeTitle: "allowTyping = false refuses a typed code",
        codeDescription:
          "For a step where traceability means the label itself must be scanned. Type a code and press Enter: it is refused, and zen-scan never fires.",
        code: `<zen-scan-input id="serial" label="Scan the unit's serial label"></zen-scan-input>

const scan = document.getElementById("serial");
scan.allowTyping = false;   // defaults to true, so a property
scan.addEventListener("zen-scan", (e) => record(e.detail[0]));`,
        render: () => {
          const log = entryList();
          const scan = scanInput({ label: "Scan the unit's serial label" });
          scan.allowTyping = false;
          scan.addEventListener("zen-scan", (e) => {
            const [code, { source }] = (e as CustomEvent<ScanDetail>).detail;
            log.add({ code, source });
          });
          const sim = button(
            "Simulate a scan: PSN-2026-000481",
            () => void simulateScan("PSN-2026-000481", fieldOf(scan)),
            "zen-self-start",
          );
          return column(scan, sim, log.el);
        },
      },
      {
        title: "3. A station that scans anywhere",
        codeTitle: "capture-global catches scans made while no field has focus",
        codeDescription:
          "Nobody should have to tap the field before scanning at a packing station. Click anywhere outside a field, then use the button: the scan lands here. Keys typed into other fields are left alone, and a slow stray key never leaks into a scan.",
        code: `<zen-scan-input capture-global label="Packing station"></zen-scan-input>

scan.addEventListener("zen-scan", (e) => pack(e.detail[0]));`,
        render: () => {
          const log = entryList();
          const scan = scanInput({ "capture-global": "", label: "Packing station" });
          scan.addEventListener("zen-scan", (e) => {
            const [code, { source }] = (e as CustomEvent<ScanDetail>).detail;
            log.add({ code, source });
          });
          const sim = button("Simulate a scan with nothing focused", () => void simulateScan("CARTON-0193"), "zen-self-start");
          return column(scan, sim, log.el);
        },
      },
    ],
  });
}
