import { type JSX } from "solid-js";
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
export interface PasswordInputProps extends Omit<JSX.InputHTMLAttributes<HTMLInputElement>, "type"> {
    /** Label for the reveal toggle, announced with its pressed state. */
    showLabel?: string;
    hideLabel?: string;
}
export declare const PasswordInput: (props: PasswordInputProps) => JSX.Element;
//# sourceMappingURL=password-input.d.ts.map