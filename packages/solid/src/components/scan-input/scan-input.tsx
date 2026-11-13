import { type JSX, Show, createSignal, createUniqueId, onCleanup, onMount, splitProps } from "solid-js";
import { classifyEntry, createScanBuffer, type KeyAt, type ScanOptions } from "@algorisys/zen-ui-core/scan";
import { cn } from "../../lib/cn";
import { useLocale } from "../locale/locale";
import { Icon } from "../icon/icon";

/**
 * ScanInput — a field for a USB barcode scanner, which types like a keyboard.
 *
 *   <ScanInput onScan={async (code, { source }) => {
 *     const wo = await api.workOrder(code);
 *     if (!wo) return `No work order ${code}`;   // shown as the error
 *     open(wo);                                   // nothing returned: accepted
 *   }} />
 *
 * Enter submits whatever is in the field, and `source` says whether a scanner
 * or a person put it there — judged by timing (a scanner's keys arrive a few
 * milliseconds apart; nobody types that fast). `allowTyping={false}` refuses
 * typed codes, for steps where traceability means the label must be scanned.
 *
 * `onScan` returns an error message, or a promise of one, or nothing for
 * accepted; the line under the field says "Checking…", "Scanned …" or the
 * error. The field clears and keeps focus, ready for the next scan.
 *
 * `captureGlobal` also catches scans made while focus is NOT in any field — a
 * station where nobody should have to tap the input first. Keystrokes typed
 * into other fields are left alone.
 */

export type ScanSource = "scanner" | "keyboard";

export type ScanInputProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children" | "onChange"> & {
  onScan: (code: string, info: { source: ScanSource }) => string | void | Promise<string | void>;
  /** Shown above the field. Defaults to "Scan or type a code". */
  label?: string;
  placeholder?: string;
  /** Refuse codes that were typed rather than scanned. Default true (typing allowed). */
  allowTyping?: boolean;
  /** Also catch scans made while focus is not in any field. */
  captureGlobal?: boolean;
  /** Timing thresholds and terminators; see core/scan. */
  scanOptions?: Partial<ScanOptions>;
  /** Clear the field after a submission. Default true. */
  clearOnScan?: boolean;
  disabled?: boolean;
};

type Status =
  | { kind: "idle" }
  | { kind: "checking"; code: string }
  | { kind: "accepted"; code: string }
  | { kind: "error"; message: string };

const isEditable = (el: EventTarget | null) =>
  el instanceof HTMLElement &&
  (el.isContentEditable || el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement);

export const ScanInput = (props: ScanInputProps) => {
  const [local, rest] = splitProps(props, [
    "onScan",
    "label",
    "placeholder",
    "allowTyping",
    "captureGlobal",
    "scanOptions",
    "clearOnScan",
    "disabled",
    "class",
  ]);
  const loc = useLocale();
  const id = createUniqueId();
  const [status, setStatus] = createSignal<Status>({ kind: "idle" });
  let input: HTMLInputElement | undefined;
  let keys: KeyAt[] = [];
  let seq = 0;

  const submit = async (raw: string, source: ScanSource) => {
    const code = raw.trim();
    if (!code || local.disabled) return;
    if (local.clearOnScan !== false && input) input.value = "";
    if (source === "keyboard" && local.allowTyping === false) {
      setStatus({ kind: "error", message: loc.t("scan.typed", { code }) });
      return;
    }
    // A later scan wins: a slow lookup finishing after a newer one must not
    // overwrite its result.
    const mine = ++seq;
    setStatus({ kind: "checking", code });
    let error: string | void;
    try {
      error = await local.onScan(code, { source });
    } catch (e) {
      error = e instanceof Error ? e.message : String(e);
    }
    if (mine !== seq) return;
    setStatus(error ? { kind: "error", message: error } : { kind: "accepted", code });
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const source = classifyEntry(keys, local.scanOptions);
      keys = [];
      void submit(input?.value ?? "", source);
      return;
    }
    keys.push({ key: e.key, at: e.timeStamp });
  };
  // A field emptied by hand starts a fresh timing record.
  const onInput = () => {
    if (input && input.value === "") keys = [];
  };

  onMount(() => {
    if (!local.captureGlobal) return;
    const buffer = createScanBuffer(local.scanOptions);
    let flushTimer: ReturnType<typeof setTimeout> | undefined;
    const gap = local.scanOptions?.maxGapMs ?? 35;
    const onDocKey = (e: KeyboardEvent) => {
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
    onCleanup(() => {
      document.removeEventListener("keydown", onDocKey, true);
      clearTimeout(flushTimer);
    });
  });

  const line = () => {
    const s = status();
    if (s.kind === "checking") return loc.t("scan.checking", { code: s.code });
    if (s.kind === "accepted") return loc.t("scan.accepted", { code: s.code });
    if (s.kind === "error") return s.message;
    return local.captureGlobal ? loc.t("scan.listening") : "";
  };

  return (
    <div class={cn("zen-flex zen-w-full zen-flex-col zen-gap-1.5", local.class)} {...rest}>
      <label for={id} class="zen-text-sm zen-font-medium zen-text-zen-foreground">
        {local.label ?? loc.t("scan.label")}
      </label>
      <div class="zen-relative">
        <span class="zen-pointer-events-none zen-absolute zen-inset-y-0 zen-start-3 zen-flex zen-items-center zen-text-zen-muted-fg" aria-hidden="true">
          <Icon name="scan-barcode" size={20} />
        </span>
        <input
          ref={input}
          id={id}
          type="text"
          inputMode="text"
          autocomplete="off"
          autocapitalize="off"
          spellcheck={false}
          disabled={local.disabled}
          placeholder={local.placeholder}
          aria-invalid={status().kind === "error" ? true : undefined}
          aria-describedby={`${id}-status`}
          class={cn(
            "zen-flex zen-h-12 zen-w-full zen-rounded-zen-md zen-border zen-border-solid zen-border-zen-border zen-bg-zen-background zen-ps-11 zen-pe-3 zen-font-mono zen-text-lg",
            "placeholder:zen-font-sans placeholder:zen-text-base placeholder:zen-text-zen-muted-fg",
            "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2",
            "disabled:zen-cursor-not-allowed disabled:zen-opacity-50",
            "aria-[invalid=true]:zen-border-zen-error",
          )}
          onKeyDown={onKeyDown}
          onInput={onInput}
        />
      </div>
      <p
        id={`${id}-status`}
        role="status"
        class={cn(
          "zen-m-0 zen-flex zen-min-h-5 zen-items-center zen-gap-1.5 zen-text-sm",
          status().kind === "error"
            ? "zen-font-medium zen-text-zen-error"
            : status().kind === "accepted"
              ? "zen-text-zen-success-soft-fg"
              : "zen-text-zen-muted-fg",
        )}
      >
        <Show when={status().kind === "accepted"}>
          <Icon name="check" size={16} />
        </Show>
        <Show when={status().kind === "error"}>
          <Icon name="error" size={16} />
        </Show>
        {line()}
      </p>
    </div>
  );
};
