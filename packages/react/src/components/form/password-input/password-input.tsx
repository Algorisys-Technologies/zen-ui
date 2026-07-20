import * as React from "react";
import { cn } from "../../../lib/cn";

/**
 * PasswordInput — a password field with a show/hide toggle.
 *
 *   <PasswordInput placeholder="Password" autoComplete="current-password" />
 *
 * Every sign-up and sign-in screen needs one, and hand-rolling it means someone
 * forgets the details that matter: the toggle is a real <button> (keyboard
 * reachable, labelled, `aria-pressed` reflecting state) rather than an icon that
 * only a mouse can hit, and toggling never moves focus out of the field.
 *
 * Wraps a native <input>, so every input attribute (`name`, `required`,
 * `autoComplete`, `minLength`, form association) passes straight through. `type`
 * is owned by the component — it flips between "password" and "text" — so it is
 * not accepted as a prop.
 */

export interface PasswordInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  /** Label for the reveal toggle, announced with its pressed state. */
  showLabel?: string;
  hideLabel?: string;
}

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, showLabel = "Show password", hideLabel = "Hide password", disabled, ...props }, ref) => {
    const [visible, setVisible] = React.useState(false);

    return (
      <div className="zen-relative zen-w-full">
        <input
          ref={ref}
          type={visible ? "text" : "password"}
          disabled={disabled}
          className={cn(
            "zen-flex zen-h-10 zen-w-full zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-background zen-ps-3 zen-pe-10 zen-py-2 zen-text-sm",
            "placeholder:zen-text-zen-muted-fg",
            "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2",
            "disabled:zen-cursor-not-allowed disabled:zen-opacity-50",
            className,
          )}
          {...props}
        />
        <button
          type="button"
          disabled={disabled}
          aria-label={visible ? hideLabel : showLabel}
          aria-pressed={visible}
          onClick={() => setVisible((v) => !v)}
          className={cn(
            "zen-absolute zen-top-1/2 -zen-translate-y-1/2 zen-end-2",
            "zen-inline-flex zen-items-center zen-justify-center zen-h-6 zen-w-6 zen-rounded-zen-sm",
            "zen-text-zen-muted-fg hover:zen-text-zen-foreground",
            "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
            "disabled:zen-cursor-not-allowed disabled:zen-opacity-50",
          )}
        >
          {visible ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
              <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
              <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
              <line x1="2" x2="22" y1="2" y2="22" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
      </div>
    );
  },
);
PasswordInput.displayName = "PasswordInput";

export { PasswordInput };
