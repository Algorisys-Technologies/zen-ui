import * as React from "react";
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
export interface PasswordInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
    /** Label for the reveal toggle, announced with its pressed state. */
    showLabel?: string;
    hideLabel?: string;
}
declare const PasswordInput: React.ForwardRefExoticComponent<PasswordInputProps & React.RefAttributes<HTMLInputElement>>;
export { PasswordInput };
//# sourceMappingURL=password-input.d.ts.map