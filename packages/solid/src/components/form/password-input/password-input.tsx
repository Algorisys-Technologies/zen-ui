import { type JSX, splitProps, createSignal, Show } from "solid-js";
import { cn } from "../../../lib/cn";

/**
 * PasswordInput — a password field with a show/hide toggle. Solid port of the
 * React binding's PasswordInput; same API, same behaviour.
 *
 *   <PasswordInput placeholder="Password" autocomplete="current-password" />
 *
 * The toggle is a real <button> (keyboard reachable, labelled, `aria-pressed`
 * reflecting state), and toggling never moves focus out of the field. Wraps a
 * native <input>, so every input attribute passes through. `type` is owned by
 * the component — it flips between "password" and "text" — so it is not a prop.
 */

export interface PasswordInputProps
  extends Omit<JSX.InputHTMLAttributes<HTMLInputElement>, "type"> {
  /** Label for the reveal toggle, announced with its pressed state. */
  showLabel?: string;
  hideLabel?: string;
}

export const PasswordInput = (props: PasswordInputProps) => {
  const [local, rest] = splitProps(props, ["class", "showLabel", "hideLabel", "disabled"]);
  const [visible, setVisible] = createSignal(false);

  return (
    <div class="zen-relative zen-w-full">
      <input
        type={visible() ? "text" : "password"}
        disabled={local.disabled}
        class={cn(
          "zen-flex zen-h-10 zen-w-full zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-background zen-pl-3 zen-pr-10 zen-py-2 zen-text-sm",
          "placeholder:zen-text-zen-muted-fg",
          "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2",
          "disabled:zen-cursor-not-allowed disabled:zen-opacity-50",
          local.class,
        )}
        {...rest}
      />
      <button
        type="button"
        disabled={local.disabled}
        aria-label={visible() ? local.hideLabel ?? "Hide password" : local.showLabel ?? "Show password"}
        aria-pressed={visible()}
        onClick={() => setVisible((v) => !v)}
        class={cn(
          "zen-absolute zen-top-1/2 -zen-translate-y-1/2 zen-right-2",
          "zen-inline-flex zen-items-center zen-justify-center zen-h-6 zen-w-6 zen-rounded-zen-sm",
          "zen-text-zen-muted-fg hover:zen-text-zen-foreground",
          "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
          "disabled:zen-cursor-not-allowed disabled:zen-opacity-50",
        )}
      >
        <Show
          when={visible()}
          fallback={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          }
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
            <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
            <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
            <line x1="2" x2="22" y1="2" y2="22" />
          </svg>
        </Show>
      </button>
    </div>
  );
};
