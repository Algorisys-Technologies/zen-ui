import { useState } from "react";
import { ScanInput, type ScanSource } from "./scan-input/scan-input";
import { Button } from "./button/button";
import { CodeExample } from "./demo-helpers";

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

const fieldOf = (id: string) => document.querySelector<HTMLInputElement>(`[data-demo="${id}"] input`) ?? undefined;

const EntryList = ({ entries }: { entries: Entry[] }) => (
  <ul className="zen-m-0 zen-list-none zen-p-0 zen-text-sm">
    {entries
      .slice(-4)
      .reverse()
      .map((e, i) => (
        <li key={i} className="zen-tabular-nums">
          <code>{e.code}</code> · {e.source}
          {e.found ? ` · ${e.found}` : ""}
        </li>
      ))}
  </ul>
);

const NewScanInputDemo: React.FC = () => {
  const [log, setLog] = useState<Entry[]>([]);
  const [strict, setStrict] = useState<Entry[]>([]);
  const [station, setStation] = useState<Entry[]>([]);
  const checkCode = async (code: string, info: { source: ScanSource }) => {
    const error = await lookup(code);
    setLog((l) => [...l, { code, source: info.source, found: error ? undefined : KNOWN.get(code) }]);
    return error;
  };

  return (
    <div className="demo-page">
      <h1>ScanInput</h1>
      <p className="lede">
        A field for a USB barcode scanner, which types like a keyboard. It tells a scan from
        a person typing by timing — a scanner's keys arrive a few milliseconds apart — and
        checks each code through one callback.
      </p>

      <section className="demo-section">
        <h2>1. Scan, or type and press Enter</h2>
        <CodeExample
          title="onScan returns an error message, a promise of one, or nothing"
          description={
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
          <div className="zen-flex zen-w-full zen-max-w-xl zen-flex-col zen-gap-3" data-demo="one">
            <ScanInput onScan={checkCode} />
            <div className="zen-flex zen-flex-wrap zen-gap-2">
              <Button variant="outline" onClick={() => simulateScan("WO-10042", fieldOf("one"))}>
                Simulate a scan: WO-10042
              </Button>
              <Button variant="outline" onClick={() => simulateScan("WO-99999", fieldOf("one"))}>
                Simulate a scan: WO-99999
              </Button>
            </div>
            <EntryList entries={log} />
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>2. Scanning required</h2>
        <CodeExample
          title="allowTyping={false} refuses a typed code"
          description={
            <>
              For a step where traceability means the label itself must be scanned. Type a code
              and press Enter: it is refused, and <code>onScan</code> is never called.
            </>
          }
          code={`<ScanInput label="Scan the unit's serial label" allowTyping={false} onScan={record} />`}
        >
          <div className="zen-flex zen-w-full zen-max-w-xl zen-flex-col zen-gap-3" data-demo="two">
            <ScanInput
              label="Scan the unit's serial label"
              allowTyping={false}
              onScan={(code, { source }) => {
                setStrict((l) => [...l, { code, source }]);
              }}
            />
            <Button className="zen-self-start" variant="outline" onClick={() => simulateScan("PSN-2026-000481", fieldOf("two"))}>
              Simulate a scan: PSN-2026-000481
            </Button>
            <EntryList entries={strict} />
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>3. A station that scans anywhere</h2>
        <CodeExample
          title="captureGlobal catches scans made while no field has focus"
          description="Nobody should have to tap the field before scanning at a packing station. Click anywhere outside a field, then use the button: the scan lands here. Keys typed into other fields are left alone, and a slow stray key never leaks into a scan."
          code={`<ScanInput captureGlobal label="Packing station" onScan={pack} />`}
        >
          <div className="zen-flex zen-w-full zen-max-w-xl zen-flex-col zen-gap-3">
            <ScanInput
              captureGlobal
              label="Packing station"
              onScan={(code, { source }) => {
                setStation((l) => [...l, { code, source }]);
              }}
            />
            <Button className="zen-self-start" variant="outline" onClick={() => simulateScan("CARTON-0193")}>
              Simulate a scan with nothing focused
            </Button>
            <EntryList entries={station} />
          </div>
        </CodeExample>
      </section>
    </div>
  );
};

export default NewScanInputDemo;
