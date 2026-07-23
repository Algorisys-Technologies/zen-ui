import { type JSX } from "solid-js";
/**
 * Popover — Solid port built on Kobalte Popover.
 *
 *   <Popover>
 *     <PopoverTrigger as={Button}>Open</PopoverTrigger>
 *     <PopoverContent>…</PopoverContent>
 *   </Popover>
 *
 * Kobalte supplies positioning (via @floating-ui), collision detection,
 * focus trap, click-outside dismissal, Escape-to-close, and ARIA.
 */
export declare const Popover: typeof import("@kobalte/core/popover").Root & {
    Anchor: typeof import("@kobalte/core/popover").Anchor;
    Arrow: typeof import("@kobalte/core/dropdown-menu").Arrow;
    CloseButton: typeof import("@kobalte/core/popover").CloseButton;
    Content: typeof import("@kobalte/core/popover").Content;
    Description: typeof import("@kobalte/core/popover").Description;
    Portal: typeof import("@kobalte/core/popover").Portal;
    Title: typeof import("@kobalte/core/popover").Title;
    Trigger: typeof import("@kobalte/core/popover").Trigger;
};
export declare const PopoverTrigger: typeof import("@kobalte/core/popover").Trigger;
export declare const PopoverAnchor: typeof import("@kobalte/core/popover").Anchor;
export declare const PopoverClose: typeof import("@kobalte/core/popover").CloseButton;
export declare const PopoverPortal: typeof import("@kobalte/core/popover").Portal;
/**
 * Everything except `class`/`children` is forwarded to Kobalte's Content, which
 * mirrors the React binding. It previously accepted only those two props and
 * silently dropped the rest, so `style` never reached the DOM — NotificationsInbox
 * could not widen the panel past the default `w-72` and its content was clipped.
 */
export type PopoverContentProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "class" | "children"> & {
    class?: string;
    children?: JSX.Element;
};
export declare const PopoverContent: (props: PopoverContentProps) => JSX.Element;
//# sourceMappingURL=popover.d.ts.map