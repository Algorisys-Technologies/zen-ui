import { cn } from "../../../lib/cn";
import {
  applyProps,
  Disposer,
  toNodes,
  type BaseProps,
  type ZenComponent,
} from "../../../lib/component";

/**
 * Label — a standalone <label> for a control that is not inside a Form.
 *
 *   const label = Label({ for: "email", children: "Email" });
 *   document.body.append(label.el);
 *
 * FormLabel is the right choice INSIDE a Form: it reads the field context, wires
 * the control id, and turns red on error. This is the other half — the label for
 * a control the form-builder does not own, which every binding was inlining as a
 * bare `<label class="zen-text-sm zen-font-medium">` at each call site.
 *
 * `required` renders the asterisk as decoration and states the requirement in
 * text for assistive tech, because a bare "*" is not a word a screen reader
 * conveys as "required".
 *
 * `for` is spelled as the HTML attribute, not React's `htmlFor`: this binding
 * writes attributes, and PORTING.md keeps the DOM's own name where React only
 * renamed it to dodge a JS reserved word.
 *
 * The `peer-disabled:` rules match React's class list, and like React they need
 * the labelled control to be a genuinely disableable sibling carrying `zen-peer`
 * — which Checkbox and Switch are here. `disabled` is the portable way to dim a
 * label across all four bindings.
 */

const SIZES = {
  sm: "zen-text-xs",
  md: "zen-text-sm",
  lg: "zen-text-base",
} as const;

export interface LabelProps extends BaseProps {
  /** The id of the control this label names. */
  for?: string;
  size?: keyof typeof SIZES;
  /** Appends a decorative asterisk plus screen-reader-only "(required)". */
  required?: boolean;
  /** Dims the label. Does not disable anything — labels take no input. */
  disabled?: boolean;
}

export function Label(props: LabelProps): ZenComponent<LabelProps, HTMLLabelElement> {
  let current: LabelProps = { ...props };
  const el = document.createElement("label");
  const disposer = new Disposer();
  let removeProps: (() => void) | undefined;

  const render = () => {
    const {
      class: className,
      for: htmlFor,
      size,
      required,
      disabled,
      children,
      ...rest
    } = current;

    el.className = cn(
      "zen-font-medium zen-leading-none zen-text-zen-foreground",
      SIZES[size ?? "md"],
      disabled && "zen-cursor-not-allowed zen-opacity-70",
      "peer-disabled:zen-cursor-not-allowed peer-disabled:zen-opacity-70",
      className,
    );

    if (htmlFor) el.htmlFor = htmlFor;
    else el.removeAttribute("for");

    if (disabled) el.setAttribute("data-disabled", "");
    else el.removeAttribute("data-disabled");

    // Rebuilt rather than patched: the asterisk has to stay last, after
    // whatever children the caller passed, and toggling `required` changes the
    // node count.
    el.replaceChildren(...toNodes(children));
    if (required) {
      const star = document.createElement("span");
      star.setAttribute("aria-hidden", "true");
      star.className = "zen-ml-0.5 zen-text-zen-error";
      star.textContent = "*";

      const spoken = document.createElement("span");
      spoken.className = "zen-sr-only";
      spoken.textContent = " (required)";

      el.append(star, spoken);
    }

    removeProps?.();
    removeProps = applyProps(el, rest as Record<string, unknown>);
  };

  render();
  disposer.add(() => removeProps?.());

  return {
    el,
    update(next) {
      current = { ...current, ...next };
      render();
    },
    destroy() {
      disposer.dispose();
      el.remove();
    },
  };
}
