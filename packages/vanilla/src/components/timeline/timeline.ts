import { cn } from "../../lib/cn";
import { Icon } from "../icon/icon";
import {
  applyProps,
  Disposer,
  toNodes,
  type BaseProps,
  type Child,
  type IconName,
  type ZenComponent,
} from "../../lib/component";

/**
 * Timeline — a sequence of things that happened, in order.
 *
 *   Timeline({ items: events }).el
 *
 * An audit trail, an order's history, a ticket's comments. Data-driven rather
 * than compound: the shape is always the same (a rail, a marker, a time, a
 * body), so compound parts would only let a caller build one that is subtly
 * wrong — a marker with no rail, or two rails.
 *
 * Vanilla port; see the React binding for the reasoning. Same API, same output.
 *
 * It renders an ORDERED list, because the order is the content. A <div> stack
 * would tell a screen-reader user nothing about sequence or length, and this is
 * a component whose entire subject is sequence.
 *
 * Grouping is by a `group` string on the item rather than a `groupBy` function.
 * The caller already knows whether two events belong to the same day — deriving
 * it here would mean guessing at their timezone and their idea of "today".
 */

export type TimelineState = "default" | "info" | "success" | "warning" | "error";

const DOT_CLASS: Record<TimelineState, string> = {
  default: "zen-bg-zen-muted-fg",
  info: "zen-bg-zen-info",
  success: "zen-bg-zen-success",
  warning: "zen-bg-zen-warning",
  error: "zen-bg-zen-error",
};

const ICON_CLASS: Record<TimelineState, string> = {
  default: "zen-text-zen-muted-fg",
  info: "zen-text-zen-info",
  success: "zen-text-zen-success",
  warning: "zen-text-zen-warning",
  error: "zen-text-zen-error",
};

export interface TimelineItem {
  id: string;
  /** What happened. Keep it to a line; the body is for the rest. */
  title: Child;
  description?: Child;
  /**
   * Shown beside the title. A display string, not a Date — formatting a date is
   * a locale and timezone decision the caller has already made elsewhere.
   */
  timestamp?: string;
  /** Machine-readable form for `<time datetime>`, when `timestamp` is prose. */
  dateTime?: string;
  /** Replaces the dot. */
  icon?: IconName;
  state?: TimelineState;
  /** A heading that starts a new run of items — "Today", "March". */
  group?: string;
  /** Anything richer than a description: a diff, a quote, an attachment. */
  children?: Child;
  /**
   * Put `children` behind a disclosure. A history where every entry carries a
   * payload is unreadable fully expanded — the events stop being scannable,
   * which is the one thing a timeline is for.
   */
  collapsible?: boolean;
  /** Starting state when the disclosure is uncontrolled. */
  defaultOpen?: boolean;
  /**
   * Controlled disclosure. Pass it with `onOpenChange` and the caller owns which
   * items are open — the only way to build a single-open accordion, where
   * opening one row closes the others.
   */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /**
   * The disclosure's label. Defaults to "Details". A function receives the
   * current state, for a toggle that reads "Show" / "Hide" rather than one fixed
   * word.
   */
  collapseLabel?: Child | ((open: boolean) => Child);
}

/**
 * The body of one item, disclosed or not.
 *
 * A native <details> rather than the Accordion: it is keyboard-operable and
 * findable by the browser's in-page search with no JS at all, and an audit trail
 * is exactly the place someone hits Ctrl+F expecting to match text inside a
 * collapsed row.
 */
function bodyOf(item: TimelineItem): HTMLElement {
  if (!item.collapsible) {
    const plain = document.createElement("div");
    plain.className = "zen-mt-1";
    plain.append(...toNodes(item.children));
    return plain;
  }

  const open = item.open ?? !!item.defaultOpen;
  const details = document.createElement("details");
  details.className = "zen-mt-1";
  details.open = open;

  const summary = document.createElement("summary");
  summary.className =
    "zen-inline-flex zen-cursor-pointer zen-list-none zen-items-center zen-gap-1 zen-rounded-zen-sm zen-text-xs zen-font-medium zen-text-zen-muted-fg hover:zen-text-zen-foreground focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring";
  summary.append(
    Icon({
      name: "chevron-down",
      size: 14,
      class: cn("zen-transition-transform", open ? undefined : "-zen-rotate-90 rtl:zen-rotate-90"),
    }).el,
  );

  const label =
    item.collapseLabel === undefined
      ? "Details"
      : typeof item.collapseLabel === "function"
        ? item.collapseLabel(open)
        : item.collapseLabel;
  summary.append(...toNodes(label));
  details.append(summary);

  const inner = document.createElement("div");
  inner.className = "zen-mt-2";
  inner.append(...toNodes(item.children));
  details.append(inner);

  /*
   * What WE last put on the element, as opposed to what a user did to it.
   *
   * `toggle` does not distinguish the two: assigning `.open` fires it exactly
   * like a click does — including the assignment above, on a freshly built
   * element. Without this comparison a single-open Timeline never settles. Each
   * rebuild opens the newly-active row, that assignment fires `toggle`, the
   * handler reports it as a user action, the caller re-renders, and round it
   * goes. Measured in the DiffView demo: clicking a second row left the first
   * one open and spun the page until the next navigation timed out.
   */
  let rendered = open;

  details.addEventListener("toggle", () => {
    if (details.open === rendered) return;
    rendered = details.open;
    item.onOpenChange?.(details.open);

    /*
     * A CONTROLLED caller may refuse the change. The usual answer is that they
     * re-render and this element is replaced, so there is nothing to correct —
     * hence the isConnected test, which is what tells "replaced" apart from
     * "refused". Only a still-mounted element that disagrees is pushed back.
     */
    if (item.open !== undefined && details.isConnected && details.open !== item.open) {
      rendered = item.open;
      details.open = item.open;
    }
  });

  return details;
}

export interface TimelineProps extends BaseProps {
  items: TimelineItem[];
  /**
   * `"compact"` drops the description and body and tightens the spacing, for a
   * sidebar or a popover where the timeline is context rather than the subject.
   */
  density?: "default" | "compact";
  /** Message when there is nothing yet. */
  emptyMessage?: Child;
}

/** The marker: an icon if the item names one, otherwise a coloured dot. */
function marker(item: TimelineItem): HTMLElement {
  const state = item.state ?? "default";
  const span = document.createElement("span");
  /* aria-hidden either way: the marker repeats what the title already says, and
     "image, check circle" before every entry is noise. */
  span.setAttribute("aria-hidden", "true");

  if (item.icon) {
    span.className = cn(
      "zen-absolute zen-start-0 zen-top-0.5 zen-flex zen-h-4 zen-w-4 zen-items-center zen-justify-center zen-rounded-zen-full zen-bg-zen-background",
      ICON_CLASS[state],
    );
    span.append(Icon({ name: item.icon, size: 14 }).el);
  } else {
    span.className = cn(
      "zen-absolute zen-start-1 zen-top-1.5 zen-h-2 zen-w-2 zen-rounded-zen-full",
      DOT_CLASS[state],
    );
  }
  return span;
}

function entry(item: TimelineItem, isLast: boolean, compact: boolean): HTMLLIElement {
  const li = document.createElement("li");
  li.className = cn("zen-relative zen-ps-8", compact ? "zen-pb-3" : "zen-pb-6");

  /* The rail. Logical inset so it moves to the right-hand side under RTL rather
     than stranding the markers across the text. Hidden on the last item: a line
     running past the final event reads as "more below", which is exactly wrong
     at the end. */
  if (!isLast) {
    const rail = document.createElement("span");
    rail.setAttribute("aria-hidden", "true");
    rail.className = "zen-absolute zen-top-2 zen-bottom-0 zen-start-[7px] zen-w-px zen-bg-zen-border";
    li.append(rail);
  }

  li.append(marker(item));

  const body = document.createElement("div");
  body.className = "zen-flex zen-flex-col zen-gap-0.5";

  const head = document.createElement("div");
  head.className = "zen-flex zen-flex-wrap zen-items-baseline zen-gap-x-2";
  const title = document.createElement("span");
  title.className = "zen-text-sm zen-font-medium zen-text-zen-foreground";
  title.append(...toNodes(item.title));
  head.append(title);

  if (item.timestamp) {
    const time = document.createElement("time");
    // `datetime` — the DOM attribute is lowercase; `dateTime` is React's spelling.
    if (item.dateTime) time.setAttribute("datetime", item.dateTime);
    time.className = "zen-text-xs zen-text-zen-muted-fg";
    time.textContent = item.timestamp;
    head.append(time);
  }
  body.append(head);

  if (!compact && item.description !== undefined && item.description !== null) {
    const p = document.createElement("p");
    p.className = "zen-m-0 zen-text-sm zen-leading-relaxed zen-text-zen-muted-fg";
    p.append(...toNodes(item.description));
    body.append(p);
  }

  if (!compact && item.children !== undefined && item.children !== null) {
    body.append(bodyOf(item));
  }

  li.append(body);
  return li;
}

export function Timeline(props: TimelineProps): ZenComponent<TimelineProps> {
  let current: TimelineProps = { ...props };
  const disposer = new Disposer();
  let removeProps: (() => void) | undefined;

  /* One stable root the caller can hold across updates.
   *
   * React returns the <ol> directly, or the empty message INSTEAD of it. A
   * factory cannot do that: `el` is handed out once and the caller may already
   * have appended it, so switching between an <ol> and a <p> on update would
   * leave them holding a detached node. The wrapper is the deviation that keeps
   * `update()` honest; the markup inside it matches React element for element,
   * including the rule that the empty state renders no <ol> at all. */
  const el = document.createElement("div");

  const render = () => {
    const { items, density, emptyMessage, class: className, children: _children, ...rest } = current;
    const compact = density === "compact";
    const rows = items ?? [];

    el.replaceChildren();
    el.className = cn(className);

    if (rows.length === 0) {
      const p = document.createElement("p");
      p.className = "zen-m-0 zen-py-6 zen-text-center zen-text-sm zen-text-zen-muted-fg";
      p.append(...toNodes(emptyMessage ?? "Nothing yet"));
      el.append(p);
    } else {
      const ol = document.createElement("ol");
      ol.className = "zen-m-0 zen-list-none zen-p-0";

      rows.forEach((item, i) => {
        if (item.group && item.group !== rows[i - 1]?.group) {
          /* Not an <li>: a heading is not one of the events, and putting it in
             the list would inflate the count a screen reader announces. */
          const heading = document.createElement("p");
          heading.className =
            "zen-mb-2 zen-mt-4 zen-text-xs zen-font-semibold zen-uppercase zen-tracking-wide zen-text-zen-muted-fg first:zen-mt-0";
          heading.textContent = item.group;
          ol.append(heading);
        }
        ol.append(entry(item, i === rows.length - 1, compact));
      });

      el.append(ol);
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
