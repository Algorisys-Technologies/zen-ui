import { cn } from "../../lib/cn";
import {
  applyProps,
  Disposer,
  toNodes,
  type BaseProps,
  type ZenComponent,
} from "../../lib/component";
import { controllable } from "../../lib/state";

/**
 * Likert — the vanilla port of the React reference. An n-point agree/disagree
 * scale, the third leg of the survey triplet (Rating · NPS · Likert):
 *
 *   const q = Likert({
 *     question: "The onboarding was easy to follow.",
 *     onValueChange: (v) => console.log(v),
 *   });
 *   document.body.append(q.el);
 *
 * Defaults to the standard 5-point Strongly disagree → Strongly agree scale.
 * Override `options` for variants (3-point, 7-point, frequency scales, etc.).
 *
 * Three layouts — "segmented" (default), "stacked", "scale" — exactly as React.
 * The scale length is `options`, never markup: driving it from data makes a
 * 7-point scale rendered-as-5 unrepresentable.
 *
 * Semantically a radiogroup. `question` renders above the scale and becomes the
 * radiogroup's accessible name. Keyboard nav (Arrow/Home/End) is handled on the
 * container, matching React — the container owns the keydown regardless of which
 * radio holds focus, so selection follows without an explicit focus move.
 */

export interface LikertOption {
  value: string;
  label: string;
  /** Short label used by the segmented layout when the full label is too long.
   *  Falls back to label. */
  shortLabel?: string;
  /** Custom mark for the option — an emoji, icon or number. Replaces the
   *  option's visible text in any layout.
   *
   *  A thunk, not a node, so it is evaluated lazily and can be mirrored across
   *  bindings without eager evaluation.
   *
   *  The output is aria-hidden and `label` stays the accessible name: a screen
   *  reader announcing "slightly smiling face" instead of "Neutral" is not the
   *  answer the respondent gave. */
  renderOption?: () => Node | string | number;
}

const DEFAULT_OPTIONS: LikertOption[] = [
  { value: "strongly_disagree", label: "Strongly disagree", shortLabel: "SD" },
  { value: "disagree", label: "Disagree", shortLabel: "D" },
  { value: "neutral", label: "Neutral", shortLabel: "N" },
  { value: "agree", label: "Agree", shortLabel: "A" },
  { value: "strongly_agree", label: "Strongly agree", shortLabel: "SA" },
];

export interface LikertProps extends BaseProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Renders above the scale + becomes the accessible name. */
  question?: string;
  /** Custom option set. Defaults to the 5-point Strongly disagree →
   *  Strongly agree scale. */
  options?: LikertOption[];
  /** "segmented" (default) — connected pill strip, short labels.
   *  "stacked"  — vertical list, full radio + label per row.
   *  "scale"    — mark above a radio dot; numeric and emoji scales. */
  layout?: "segmented" | "stacked" | "scale";
  /** Caption anchoring the low end, e.g. "Strongly disagree". A bare numeric
   *  scale means nothing without its ends named. Rendered by layout="scale"
   *  only; a caption, not the accessible name — that still comes from
   *  `question`. */
  minLabel?: string;
  /** Caption anchoring the high end, e.g. "Strongly agree". */
  maxLabel?: string;
  disabled?: boolean;
  readOnly?: boolean;
  /** Hidden input name for native form submission. */
  name?: string;
}

interface OptionRef {
  value: string;
  button: HTMLButtonElement;
  /** Repaints the option's selected-dependent styling. */
  setSelected: (selected: boolean) => void;
}

export function Likert(props: LikertProps): ZenComponent<LikertProps> {
  let current: LikertProps = { ...props };
  const el = document.createElement("div");
  const disposer = new Disposer();
  const cleanups = new Disposer();
  let removeProps: (() => void) | undefined;
  let refs: OptionRef[] = [];
  let hiddenInput: HTMLInputElement | undefined;

  const state = controllable<string | undefined>({
    value: current.value,
    defaultValue: current.defaultValue,
    onChange: (v) => {
      if (v !== undefined) current.onValueChange?.(v);
    },
  });

  const optionsOf = () => current.options ?? DEFAULT_OPTIONS;
  const layoutOf = () => current.layout ?? "segmented";

  const onKeyDown = (e: KeyboardEvent) => {
    const { disabled, readOnly } = current;
    const interactive = !disabled && !readOnly;
    if (!interactive) return;
    const options = optionsOf();
    const currentIndex = options.findIndex((o) => o.value === state.get());
    if (currentIndex < 0) return;
    const layout = layoutOf();
    const forward = layout === "stacked" ? "ArrowDown" : "ArrowRight";
    const back = layout === "stacked" ? "ArrowUp" : "ArrowLeft";
    if (e.key === forward) {
      e.preventDefault();
      state.set(options[Math.min(options.length - 1, currentIndex + 1)].value);
    } else if (e.key === back) {
      e.preventDefault();
      state.set(options[Math.max(0, currentIndex - 1)].value);
    } else if (e.key === "Home") {
      e.preventDefault();
      state.set(options[0].value);
    } else if (e.key === "End") {
      e.preventDefault();
      state.set(options[options.length - 1].value);
    }
  };

  const optionMark = (opt: LikertOption): Node => {
    const nodes = toNodes(opt.renderOption ? opt.renderOption() : opt.label);
    if (nodes.length === 1) return nodes[0];
    const frag = document.createDocumentFragment();
    frag.append(...nodes);
    return frag;
  };

  const render = () => {
    const {
      class: className,
      question,
      disabled,
      readOnly,
      name,
      value: _v,
      defaultValue: _dv,
      onValueChange: _ov,
      options: _o,
      layout: _l,
      minLabel: _min,
      maxLabel: _max,
      children: _ch,
      ...rest
    } = current;

    const options = optionsOf();
    const layout = layoutOf();
    const interactive = !disabled && !readOnly;

    cleanups.dispose();
    refs = [];
    hiddenInput = undefined;
    el.replaceChildren();
    el.className = cn("zen-flex zen-flex-col zen-gap-2 zen-max-w-full", className);

    if (question) {
      const p = document.createElement("p");
      p.className = "zen-text-sm zen-font-medium zen-text-zen-foreground zen-m-0";
      p.textContent = question;
      el.append(p);
    }

    const group = document.createElement("div");
    group.setAttribute("role", "radiogroup");
    if (question) group.setAttribute("aria-label", question);
    if (disabled) group.setAttribute("aria-disabled", "true");
    if (readOnly) group.setAttribute("aria-readonly", "true");
    group.className = cn(
      layout === "segmented" &&
        // scroll the scale horizontally on narrow widths (keep corner clip vertically)
        "zen-flex zen-max-w-full zen-items-stretch zen-rounded-zen-md zen-border zen-border-zen-border zen-overflow-x-auto zen-overflow-y-hidden zen-bg-zen-background",
      layout === "stacked" && "zen-flex zen-flex-col zen-gap-1",
      // No border or fill: the marks are the affordance, and the ends are named
      // by the captions underneath rather than by a frame.
      layout === "scale" &&
        "zen-flex zen-max-w-full zen-items-end zen-justify-between zen-gap-1 zen-overflow-x-auto",
      disabled && "zen-opacity-50",
    );
    group.addEventListener("keydown", onKeyDown);
    cleanups.add(() => group.removeEventListener("keydown", onKeyDown));

    options.forEach((opt, i) => {
      const isFirst = i === 0;
      const isLast = i === options.length - 1;

      const button = document.createElement("button");
      button.type = "button";
      button.setAttribute("role", "radio");
      // The mark is decorative; the label is the answer. Explicit rather than
      // inherited from the text: a renderOption mark is aria-hidden, which would
      // otherwise leave this radio with no accessible name at all.
      button.setAttribute("aria-label", opt.label);
      if (layout !== "stacked") button.title = opt.label;
      if (disabled) button.disabled = true;

      const onClick = () => {
        if (interactive) state.set(opt.value);
      };
      button.addEventListener("click", onClick);
      cleanups.add(() => button.removeEventListener("click", onClick));

      let setSelected: (selected: boolean) => void;

      if (layout === "scale") {
        const mark = document.createElement("span");
        mark.setAttribute("aria-hidden", "true");
        mark.append(optionMark(opt));

        const dot = document.createElement("span");
        dot.setAttribute("aria-hidden", "true");
        const inner = document.createElement("span");
        inner.className = "zen-h-1.5 zen-w-1.5 zen-rounded-zen-full zen-bg-zen-primary-fg";
        dot.append(inner);

        button.append(mark, dot);

        setSelected = (selected) => {
          button.className = cn(
            "zen-flex zen-flex-1 zen-flex-col zen-items-center zen-gap-1.5",
            "zen-min-w-[2.5rem] zen-px-1 zen-py-1.5 zen-rounded-zen-sm",
            "zen-bg-transparent zen-border-0 zen-cursor-pointer zen-transition-colors",
            interactive && "hover:zen-bg-zen-muted",
            "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
            (disabled || readOnly) && "zen-cursor-default",
          );
          mark.className = cn(
            "zen-text-base zen-leading-none",
            selected
              ? "zen-text-zen-foreground zen-font-semibold"
              : "zen-text-zen-muted-fg",
          );
          dot.className = cn(
            "zen-inline-flex zen-items-center zen-justify-center",
            "zen-h-4 zen-w-4 zen-rounded-zen-full zen-border",
            selected
              ? "zen-border-zen-primary zen-bg-zen-primary"
              : "zen-border-zen-border zen-bg-zen-background",
          );
          inner.hidden = !selected;
        };
      } else if (layout === "stacked") {
        const dot = document.createElement("span");
        dot.setAttribute("aria-hidden", "true");
        const inner = document.createElement("span");
        inner.className = "zen-h-1.5 zen-w-1.5 zen-rounded-zen-full zen-bg-zen-primary-fg";
        dot.append(inner);

        const labelSpan = document.createElement("span");
        if (opt.renderOption) labelSpan.setAttribute("aria-hidden", "true");
        labelSpan.append(optionMark(opt));

        button.append(dot, labelSpan);

        setSelected = (selected) => {
          button.className = cn(
            "zen-flex zen-items-center zen-gap-2 zen-px-2 zen-py-1.5 zen-rounded-zen-sm",
            "zen-bg-transparent zen-border-0 zen-text-left zen-text-sm zen-cursor-pointer",
            "zen-transition-colors",
            interactive && "hover:zen-bg-zen-muted",
            selected && "zen-bg-zen-primary-soft zen-text-zen-primary-soft-fg",
            "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
            (disabled || readOnly) && "zen-cursor-default",
          );
          dot.className = cn(
            "zen-inline-flex zen-items-center zen-justify-center",
            "zen-h-4 zen-w-4 zen-rounded-zen-full zen-border",
            selected
              ? "zen-border-zen-primary zen-bg-zen-primary"
              : "zen-border-zen-border zen-bg-zen-background",
          );
          inner.hidden = !selected;
        };
      } else {
        // segmented (default)
        if (opt.renderOption) {
          const mark = document.createElement("span");
          mark.setAttribute("aria-hidden", "true");
          mark.append(optionMark(opt));
          button.append(mark);
        } else {
          const full = document.createElement("span");
          full.className = "zen-hidden md:zen-inline";
          full.textContent = opt.label;
          const short = document.createElement("span");
          short.className = "md:zen-hidden";
          short.textContent = opt.shortLabel ?? opt.label;
          button.append(full, short);
        }

        setSelected = (selected) => {
          button.className = cn(
            "zen-flex-1 zen-min-w-[3.5rem] zen-px-3 zen-py-2",
            "zen-inline-flex zen-items-center zen-justify-center",
            "zen-text-xs zen-font-medium",
            "zen-bg-transparent zen-border-0 zen-cursor-pointer zen-transition-colors",
            !isFirst && "zen-border-l zen-border-zen-border",
            "zen-text-zen-muted-fg",
            interactive && "hover:zen-bg-zen-muted hover:zen-text-zen-foreground",
            selected &&
              "zen-bg-zen-primary zen-text-zen-primary-fg hover:zen-bg-zen-primary hover:zen-text-zen-primary-fg",
            "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-inset",
            (disabled || readOnly) && "zen-cursor-default",
            isFirst && "zen-rounded-l-zen-md",
            isLast && "zen-rounded-r-zen-md",
          );
        };
      }

      group.append(button);
      refs.push({ value: opt.value, button, setSelected });
    });

    el.append(group);

    if (layout === "scale" && (current.minLabel || current.maxLabel)) {
      // Captions, not controls: they name the ends of the scale and are not
      // themselves answerable.
      const caps = document.createElement("div");
      caps.className =
        "zen-flex zen-items-start zen-justify-between zen-gap-4 zen-text-xs zen-text-zen-muted-fg";
      const lo = document.createElement("span");
      lo.textContent = current.minLabel ?? "";
      const hi = document.createElement("span");
      hi.className = "zen-text-right";
      hi.textContent = current.maxLabel ?? "";
      caps.append(lo, hi);
      el.append(caps);
    }

    if (name) {
      hiddenInput = document.createElement("input");
      hiddenInput.type = "hidden";
      hiddenInput.name = name;
      el.append(hiddenInput);
    }

    removeProps?.();
    removeProps = applyProps(el, rest as Record<string, unknown>);
  };

  const paint = (value: string | undefined) => {
    const options = optionsOf();
    const currentIndex = options.findIndex((o) => o.value === value);
    refs.forEach((ref, i) => {
      const selected = ref.value === value;
      ref.button.setAttribute("aria-checked", String(selected));
      ref.button.tabIndex = selected || (currentIndex < 0 && i === 0) ? 0 : -1;
      ref.setSelected(selected);
    });
    if (hiddenInput) {
      if (value !== undefined) hiddenInput.value = value;
      else hiddenInput.removeAttribute("value");
    }
  };

  render();
  paint(state.get());
  disposer.add(state.subscribe(paint));
  disposer.add(() => cleanups.dispose());
  disposer.add(() => removeProps?.());

  return {
    el,
    update(next) {
      const structural =
        next.options !== undefined ||
        next.layout !== undefined ||
        next.question !== undefined ||
        next.disabled !== undefined ||
        next.readOnly !== undefined ||
        next.name !== undefined ||
        next.minLabel !== undefined ||
        next.maxLabel !== undefined ||
        next.class !== undefined;
      current = { ...current, ...next };
      if (next.value !== undefined) state.sync(next.value);
      if (structural) render();
      paint(state.get());
    },
    destroy() {
      disposer.dispose();
      el.remove();
    },
  };
}
