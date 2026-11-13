import * as React from "react";
/**
 * MessagePopover — the aggregated validation summary a long form owes its user.
 *
 *   <MessagePopover messages={messages} />
 *
 * A form with twenty fields and three errors makes the user hunt for them. This
 * collects the messages into one button, counts them by severity, and lets the
 * user click one to be taken to the field it came from.
 *
 * The severity vocabulary is `ObjectState`'s, deliberately — the same four words
 * Alert, Banner and ObjectStatus already use — so a message reads the same
 * wherever it is rendered. There is no fifth kind of "error" in this library.
 *
 * WHAT THE CALLER OWNS: the messages. This does not read your form, subscribe to
 * a validation library, or decide when a field is invalid — it renders a list
 * you give it. That keeps it usable with react-hook-form, with the FormBuilder
 * in this package, or with a hand-rolled `useState` of errors.
 *
 * NAVIGATION: give a message a `targetId` and clicking it focuses and scrolls to
 * that element, which is the behaviour that makes the component worth having.
 * `onMessageSelect` overrides it if you need to open an accordion or switch a
 * tab first.
 */
/** Severity. Mirrors ObjectState minus "none" — a message always has one. */
export type MessageType = "error" | "warning" | "success" | "info";
export interface Message {
    id: string;
    type: MessageType;
    /** The message itself. Keep it short; it is a list row. */
    title: React.ReactNode;
    /** Usually the field label, so the user knows WHERE the problem is. */
    subtitle?: React.ReactNode;
    /** Longer explanation, shown under the title. */
    description?: React.ReactNode;
    /**
     * `id` of the form control this message belongs to. When set, activating the
     * row focuses and scrolls to it. The element does not need to be focusable —
     * a `tabindex="-1"` is applied for the duration if it is not.
     */
    targetId?: string;
}
export interface MessagePopoverProps {
    messages: Message[];
    /**
     * Called when a row is activated. Return nothing and the default navigation
     * still runs; the two are additive, so you can open a tab AND land on the
     * field.
     */
    onMessageSelect?: (message: Message) => void;
    /** Turn off the focus/scroll behaviour and handle it entirely yourself. */
    disableNavigation?: boolean;
    /** Shown when `messages` is empty. */
    emptyMessage?: React.ReactNode;
    /** Max scrollable body height. Default 320. */
    maxBodyHeight?: number;
    /** aria-label for the trigger. Default describes the counts. */
    triggerLabel?: string;
    className?: string;
}
declare const MessagePopover: React.ForwardRefExoticComponent<MessagePopoverProps & React.RefAttributes<HTMLButtonElement>>;
export { MessagePopover };
//# sourceMappingURL=message-popover.d.ts.map