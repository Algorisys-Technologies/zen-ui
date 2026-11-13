import { ScanInput, type ScanSource } from "./scan-input/scan-input";
import { Button } from "./button/button";
import { DemoPage } from "./demo-helpers";

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

const fieldOf = (scan: { el: HTMLElement }) => scan.el.querySelector("input") ?? undefined;

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
        code: `ScanInput({
  onScan: async (code, { source }) => {
    const found = await api.lookup(code);
    if (!found) return \`No work order or lot called \${code}\`;
    open(found);
  },
})`,
        render: () => {
          const log = entryList();
          const scan = ScanInput({
            onScan: async (code, info) => {
              const error = await lookup(code);
              log.add({ code, source: info.source, found: error ? undefined : KNOWN.get(code) });
              return error;
            },
          });
          const buttons = document.createElement("div");
          buttons.className = "zen-flex zen-flex-wrap zen-gap-2";
          buttons.append(
            Button({ variant: "outline", children: "Simulate a scan: WO-10042", onClick: () => void simulateScan("WO-10042", fieldOf(scan)) }).el,
            Button({ variant: "outline", children: "Simulate a scan: WO-99999", onClick: () => void simulateScan("WO-99999", fieldOf(scan)) }).el,
          );
          return column(scan.el, buttons, log.el);
        },
      },
      {
        title: "2. Scanning required",
        codeTitle: "allowTyping: false refuses a typed code",
        codeDescription:
          "For a step where traceability means the label itself must be scanned. Type a code and press Enter: it is refused, and onScan is never called.",
        code: `ScanInput({ label: "Scan the unit's serial label", allowTyping: false, onScan: record })`,
        render: () => {
          const log = entryList();
          const scan = ScanInput({
            label: "Scan the unit's serial label",
            allowTyping: false,
            onScan: (code, { source }) => {
              log.add({ code, source });
            },
          });
          const sim = Button({
            class: "zen-self-start",
            variant: "outline",
            children: "Simulate a scan: PSN-2026-000481",
            onClick: () => void simulateScan("PSN-2026-000481", fieldOf(scan)),
          });
          return column(scan.el, sim.el, log.el);
        },
      },
      {
        title: "3. A station that scans anywhere",
        codeTitle: "captureGlobal catches scans made while no field has focus",
        codeDescription:
          "Nobody should have to tap the field before scanning at a packing station. Click anywhere outside a field, then use the button: the scan lands here. Keys typed into other fields are left alone, and a slow stray key never leaks into a scan.",
        code: `ScanInput({ captureGlobal: true, label: "Packing station", onScan: pack })`,
        render: () => {
          const log = entryList();
          const scan = ScanInput({
            captureGlobal: true,
            label: "Packing station",
            onScan: (code, { source }) => {
              log.add({ code, source });
            },
          });
          const sim = Button({
            class: "zen-self-start",
            variant: "outline",
            children: "Simulate a scan with nothing focused",
            onClick: () => void simulateScan("CARTON-0193"),
          });
          return column(scan.el, sim.el, log.el);
        },
      },
    ],
  });
}
