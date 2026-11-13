import { classifyEntry, createScanBuffer, type KeyAt, type ScanOptions } from "@algorisys/zen-ui-core/scan";
import { cn } from "../../lib/cn";
import { applyProps, Disposer, type BaseProps, type ZenComponent } from "../../lib/component";
import { useLocale } from "../locale/locale";
import { Icon, type IconHandle } from "../icon/icon";

/**
 * ScanInput — a field for a USB barcode scanner, which types like a keyboard.
 *
 *   ScanInput({
 *     onScan: async (code, { source }) => {
 *       const wo = await api.workOrder(code);
 *       if (!wo) return `No work order ${code}`;   // shown as the error
 *       open(wo);                                   // nothing returned: accepted
 *     },
 *   });
 *
 * Enter submits whatever is in the field, and `source` says whether a scanner
 * or a person put it there — judged by timing (a scanner's keys arrive a few
 * milliseconds apart; nobody types that fast). `allowTyping: false` refuses
 * typed codes, for steps where traceability means the label must be scanned.
 *
 * `onScan` returns an error message, or a promise of one, or nothing for
 * accepted; the line under the field says "Checking…", "Scanned …" or the
 * error. The field clears and keeps focus, ready for the next scan.
 *
 * `captureGlobal` also catches scans made while focus is NOT in any field — a
 * station where nobody should have to tap the input first. Keystrokes typed
 * into other fields are left alone. The document listener is attached while
 * `captureGlobal` is on (`update()` turns it on and off) and removed by
 * `destroy()`, together with its pending flush timer.
 *
 * The field is uncontrolled on purpose: the key timings and the text are read
 * together at Enter.
 */

export type ScanSource = "scanner" | "keyboard";

export interface ScanInputProps extends Omit<BaseProps, "children"> {
  onScan: (code: string, info: { source: ScanSource }) => string | void | Promise<string | void>;
  /** Shown above the field. Defaults to "Scan or type a code". */
  label?: string;
  placeholder?: string;
  /** Refuse codes that were typed rather than scanned. Default true (typing allowed). */
  allowTyping?: boolean;
  /** Also catch scans made while focus is not in any field. */
  captureGlobal?: boolean;
  /** Timing thresholds and terminators; see core/scan. Read when the global listener starts. */
  scanOptions?: Partial<ScanOptions>;
  /** Clear the field after a submission. Default true. */
  clearOnScan?: boolean;
  disabled?: boolean;
}

export type ScanInputHandle = ZenComponent<ScanInputProps, HTMLDivElement>;

type Status =
  | { kind: "idle" }
  | { kind: "checking"; code: string }
  | { kind: "accepted"; code: string }
  | { kind: "error"; message: string };

const isEditable = (el: EventTarget | null) =>
  el instanceof HTMLElement &&
  (el.isContentEditable || el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement);

const INPUT_CLASS = [
  "zen-flex zen-h-12 zen-w-full zen-rounded-zen-md zen-border zen-border-solid zen-border-zen-border zen-bg-zen-background zen-ps-11 zen-pe-3 zen-font-mono zen-text-lg",
  "placeholder:zen-font-sans placeholder:zen-text-base placeholder:zen-text-zen-muted-fg",
  "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2",
  "disabled:zen-cursor-not-allowed disabled:zen-opacity-50",
  "aria-[invalid=true]:zen-border-zen-error",
].join(" ");

let uid = 0;

export function ScanInput(props: ScanInputProps): ScanInputHandle {
  let current: ScanInputProps = { ...props };
  const loc = useLocale();
  const disposer = new Disposer();
  const id = `zen-scan-input-${++uid}`;
  const statusId = `${id}-status`;
  let status: Status = { kind: "idle" };
  let keys: KeyAt[] = [];
  let seq = 0;
  let destroyed = false;

  // ── DOM ──────────────────────────────────────────────────────────────
  const el = document.createElement("div");

  const labelEl = document.createElement("label");
  labelEl.htmlFor = id;
  labelEl.className = "zen-text-sm zen-font-medium zen-text-zen-foreground";

  const wrap = document.createElement("div");
  wrap.className = "zen-relative";
  const glyph = document.createElement("span");
  glyph.className =
    "zen-pointer-events-none zen-absolute zen-inset-y-0 zen-start-3 zen-flex zen-items-center zen-text-zen-muted-fg";
  glyph.setAttribute("aria-hidden", "true");
  const glyphIcon = Icon({ name: "scan-barcode", size: 20 });
  glyph.append(glyphIcon.el);
  disposer.add(() => glyphIcon.destroy());

  const input = document.createElement("input");
  input.id = id;
  input.type = "text";
  input.inputMode = "text";
  input.autocomplete = "off";
  input.setAttribute("autocapitalize", "off");
  input.spellcheck = false;
  input.className = INPUT_CLASS;
  input.setAttribute("aria-describedby", statusId);
  wrap.append(glyph, input);

  const line = document.createElement("p");
  line.id = statusId;
  line.setAttribute("role", "status");

  el.append(labelEl, wrap, line);

  let statusIcon: IconHandle | undefined;
  let removeProps: (() => void) | undefined;

  const render = () => {
    const {
      onScan: _onScan,
      label,
      placeholder,
      allowTyping: _allowTyping,
      captureGlobal,
      scanOptions: _scanOptions,
      clearOnScan: _clearOnScan,
      disabled,
      class: className,
      ...rest
    } = current;

    el.className = cn("zen-flex zen-w-full zen-flex-col zen-gap-1.5", className);
    labelEl.textContent = label ?? loc.t("scan.label");

    input.disabled = Boolean(disabled);
    if (placeholder !== undefined) input.placeholder = placeholder;
    else input.removeAttribute("placeholder");
    if (status.kind === "error") input.setAttribute("aria-invalid", "true");
    else input.removeAttribute("aria-invalid");

    line.className = cn(
      "zen-m-0 zen-flex zen-min-h-5 zen-items-center zen-gap-1.5 zen-text-sm",
      status.kind === "error"
        ? "zen-font-medium zen-text-zen-error"
        : status.kind === "accepted"
          ? "zen-text-zen-success-soft-fg"
          : "zen-text-zen-muted-fg",
    );
    statusIcon?.destroy();
    statusIcon =
      status.kind === "accepted"
        ? Icon({ name: "check", size: 16 })
        : status.kind === "error"
          ? Icon({ name: "error", size: 16 })
          : undefined;
    const text =
      status.kind === "checking"
        ? loc.t("scan.checking", { code: status.code })
        : status.kind === "accepted"
          ? loc.t("scan.accepted", { code: status.code })
          : status.kind === "error"
            ? status.message
            : captureGlobal
              ? loc.t("scan.listening")
              : "";
    line.replaceChildren(...(statusIcon ? [statusIcon.el] : []), document.createTextNode(text));

    removeProps?.();
    removeProps = applyProps(el, rest as Record<string, unknown>);
  };

  const setStatus = (next: Status) => {
    status = next;
    if (!destroyed) render();
  };

  const submit = async (raw: string, source: ScanSource) => {
    const code = raw.trim();
    if (!code || current.disabled) return;
    if (current.clearOnScan !== false) input.value = "";
    if (source === "keyboard" && current.allowTyping === false) {
      setStatus({ kind: "error", message: loc.t("scan.typed", { code }) });
      return;
    }
    // A later scan wins: a slow lookup finishing after a newer one must not
    // overwrite its result.
    const mine = ++seq;
    setStatus({ kind: "checking", code });
    let error: string | void;
    try {
      error = await current.onScan(code, { source });
    } catch (e) {
      error = e instanceof Error ? e.message : String(e);
    }
    if (mine !== seq) return;
    setStatus(error ? { kind: "error", message: error } : { kind: "accepted", code });
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const source = classifyEntry(keys, current.scanOptions);
      keys = [];
      void submit(input.value, source);
      return;
    }
    keys.push({ key: e.key, at: e.timeStamp });
  };
  // A field emptied by hand starts a fresh timing record.
  const onInput = () => {
    if (input.value === "") keys = [];
  };
  input.addEventListener("keydown", onKeyDown);
  input.addEventListener("input", onInput);
  disposer.add(() => input.removeEventListener("keydown", onKeyDown));
  disposer.add(() => input.removeEventListener("input", onInput));

  // The document-level listener, while captureGlobal is on. The buffer is
  // built when it starts, from the scanOptions of that moment.
  let stopGlobal: (() => void) | undefined;
  const syncGlobal = () => {
    if (current.captureGlobal && !stopGlobal) {
      const options = current.scanOptions;
      const buffer = createScanBuffer(options);
      let flushTimer: ReturnType<typeof setTimeout> | undefined;
      const gap = options?.maxGapMs ?? 35;
      const onDocKey = (e: KeyboardEvent) => {
        // Off the page, hear nothing. Vanilla has no framework to call
        // destroy() when a caller drops the element (the demo router swaps
        // pages that way), and a detached field still listening would read
        // keystrokes on the next page and swallow the Enter that ends them.
        if (!el.isConnected) return;
        if (e.defaultPrevented || isEditable(e.target)) return;
        const code = buffer.push(e.key, e.timeStamp);
        clearTimeout(flushTimer);
        if (code) {
          e.preventDefault(); // the Enter that ended a scan must not also click a focused button
          void submit(code, "scanner");
        } else if (buffer.pending()) {
          flushTimer = setTimeout(() => {
            const late = buffer.flush(performance.now());
            if (late) void submit(late, "scanner");
          }, gap + 15);
        }
      };
      document.addEventListener("keydown", onDocKey, true);
      stopGlobal = () => {
        document.removeEventListener("keydown", onDocKey, true);
        clearTimeout(flushTimer);
        stopGlobal = undefined;
      };
    } else if (!current.captureGlobal && stopGlobal) {
      stopGlobal();
    }
  };
  disposer.add(() => stopGlobal?.());
  disposer.add(() => removeProps?.());
  disposer.add(() => statusIcon?.destroy());

  render();
  syncGlobal();

  return {
    el,
    update(next) {
      current = { ...current, ...next };
      render();
      syncGlobal();
    },
    destroy() {
      destroyed = true;
      disposer.dispose();
      el.remove();
    },
  };
}
