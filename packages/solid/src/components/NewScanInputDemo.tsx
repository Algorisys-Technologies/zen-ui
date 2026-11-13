import { For, createSignal } from "solid-js";
import { ScanInput, type ScanSource } from "./scan-input/scan-input";
import { Button } from "./button/button";
import { DemoPage, DemoSection } from "./demo-helpers";

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

const NewScanInputDemo = () => {
  const [log, setLog] = createSignal<Entry[]>([]);
  const [strict, setStrict] = createSignal<Entry[]>([]);
  const [station, setStation] = createSignal<Entry[]>([]);
  const checkCode = async (code: string, info: { source: ScanSource }) => {
    const error = await lookup(code);
    setLog((l) => [...l, { code, source: info.source, found: error ? undefined : KNOWN.get(code) }]);
    return error;
  };
  const fieldOf = (id: string) => document.querySelector<HTMLInputElement>(`[data-demo="${id}"] input`) ?? undefined;
  const list = (entries: Entry[]) => (
    <ul class="zen-m-0 zen-list-none zen-p-0 zen-text-sm">
      <For each={entries.slice(-4).reverse()}>
        {(e) => (
          <li class="zen-tabular-nums">
            <code>{e.code}</code> · {e.source}
            {e.found ? ` · ${e.found}` : ""}
          </li>
        )}
      </For>
    </ul>
  );

  return (
    <DemoPage
      title="ScanInput"
      description={
        <>
          A field for a USB barcode scanner, which types like a keyboard. It tells a scan from
          a person typing by timing — a scanner's keys arrive a few milliseconds apart — and
          checks each code through one callback.
        </>
      }
    >
      <DemoSection
        title="1. Scan, or type and press Enter"
        codeTitle="onScan returns an error message, a promise of one, or nothing"
        codeDescription={
          <>
            Try <code>WO-10042</code> or <code>LOT-77</code>, typed or with the button. Anything
            else comes back as an error from the lookup. The field clears and keeps focus for
            the next scan.
          </>
        }
        code={`<ScanInput
  onScan={async (code, { source }) => {
    const found = await api.lookup(code);
    if (!found) return \`No work order or lot called \${code}\`;
    open(found);
  }}
/>`}
      >
        <div class="zen-flex zen-w-full zen-max-w-xl zen-flex-col zen-gap-3" data-demo="one">
          <ScanInput onScan={checkCode} />
          <div class="zen-flex zen-flex-wrap zen-gap-2">
            <Button variant="outline" onClick={() => simulateScan("WO-10042", fieldOf("one"))}>
              Simulate a scan: WO-10042
            </Button>
            <Button variant="outline" onClick={() => simulateScan("WO-99999", fieldOf("one"))}>
              Simulate a scan: WO-99999
            </Button>
          </div>
          {list(log())}
        </div>
      </DemoSection>

      <DemoSection
        title="2. Scanning required"
        codeTitle="allowTyping={false} refuses a typed code"
        codeDescription={
          <>
            For a step where traceability means the label itself must be scanned. Type a code
            and press Enter: it is refused, and <code>onScan</code> is never called.
          </>
        }
        code={`<ScanInput label="Scan the unit's serial label" allowTyping={false} onScan={record} />`}
      >
        <div class="zen-flex zen-w-full zen-max-w-xl zen-flex-col zen-gap-3" data-demo="two">
          <ScanInput
            label="Scan the unit's serial label"
            allowTyping={false}
            onScan={(code, { source }) => {
              setStrict((l) => [...l, { code, source }]);
            }}
          />
          <Button class="zen-self-start" variant="outline" onClick={() => simulateScan("PSN-2026-000481", fieldOf("two"))}>
            Simulate a scan: PSN-2026-000481
          </Button>
          {list(strict())}
        </div>
      </DemoSection>

      <DemoSection
        title="3. A station that scans anywhere"
        codeTitle="captureGlobal catches scans made while no field has focus"
        codeDescription={
          <>
            Nobody should have to tap the field before scanning at a packing station. Click
            anywhere outside a field, then use the button: the scan lands here. Keys typed into
            other fields are left alone, and a slow stray key never leaks into a scan.
          </>
        }
        code={`<ScanInput captureGlobal label="Packing station" onScan={pack} />`}
      >
        <div class="zen-flex zen-w-full zen-max-w-xl zen-flex-col zen-gap-3">
          <ScanInput
            captureGlobal
            label="Packing station"
            onScan={(code, { source }) => {
              setStation((l) => [...l, { code, source }]);
            }}
          />
          <Button class="zen-self-start" variant="outline" onClick={() => simulateScan("CARTON-0193")}>
            Simulate a scan with nothing focused
          </Button>
          {list(station())}
        </div>
      </DemoSection>
    </DemoPage>
  );
};

export default NewScanInputDemo;
