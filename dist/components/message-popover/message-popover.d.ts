import { type JSX } from "solid-js";
/**
 * MessagePopover — the aggregated validation summary a long form owes its user.
 *
 *   <MessagePopover messages={messages()} />
 *
 * Solid port of the React binding; see that file for the reasoning. The API is
 * identical, and so is the behaviour that matters: clicking a message closes the
 * popover and lands focus on the field it came from.
 */
/** Severity. Mirrors ObjectState minus "none" — a message always has one. */
export type MessageType = "error" | "warning" | "success" | "info";
export interface Message {
    id: string;
    type: MessageType;
    /** The message itself. Keep it short; it is a list row. */
    title: JSX.Element;
    /** Usually the field label, so the user knows WHERE the problem is. */
    subtitle?: JSX.Element;
    /** Longer explanation, shown under the title. */
    description?: JSX.Element;
    /**
     * `id` of the form control this message belongs to. When set, activating the
     * row focuses and scrolls to it.
     */
    targetId?: string;
}
export interface MessagePopoverProps {
    messages: Message[];
    onMessageSelect?: (message: Message) => void;
    /** Turn off the focus/scroll behaviour and handle it entirely yourself. */
    disableNavigation?: boolean;
    emptyMessage?: JSX.Element;
    /** Max scrollable body height. Default 320. */
    maxBodyHeight?: number;
    triggerLabel?: string;
    class?: string;
}
export declare const MessagePopover: (props: MessagePopoverProps) => JSX.Element;
//# sourceMappingURL=message-popover.d.ts.map