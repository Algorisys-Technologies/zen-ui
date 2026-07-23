import { type JSX } from "solid-js";
/**
 * Accordion — Solid port built on Kobalte Accordion.
 *
 *   <Accordion collapsible defaultValue={["basic"]}>
 *     <AccordionItem value="basic">
 *       <AccordionTrigger>Basic info</AccordionTrigger>
 *       <AccordionContent>…</AccordionContent>
 *     </AccordionItem>
 *   </Accordion>
 *
 * API delta from Radix: Kobalte uses `collapsible` + `multiple` flags
 * (instead of Radix's `type="single" | "multiple"`). `value` /
 * `defaultValue` are always string[] under Kobalte. Animations use the
 * `data-expanded` / `data-closed` attributes Kobalte sets on the
 * Content element.
 */
export type AccordionProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "class" | "children" | "onChange"> & {
    value?: string[];
    defaultValue?: string[];
    onChange?: (value: string[]) => void;
    /** When true, allows multiple items to be open at the same time. */
    multiple?: boolean;
    /** When true (single mode), the active item can be collapsed. */
    collapsible?: boolean;
    class?: string;
    children?: JSX.Element;
};
export declare const Accordion: (props: AccordionProps) => JSX.Element;
export type AccordionItemProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "class" | "children"> & {
    value: string;
    disabled?: boolean;
    class?: string;
    children?: JSX.Element;
};
export declare const AccordionItem: (props: AccordionItemProps) => JSX.Element;
export type AccordionTriggerProps = Omit<JSX.HTMLAttributes<HTMLButtonElement>, "class" | "children"> & {
    class?: string;
    children?: JSX.Element;
};
export declare const AccordionTrigger: (props: AccordionTriggerProps) => JSX.Element;
export type AccordionContentProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "class" | "children"> & {
    class?: string;
    children?: JSX.Element;
};
export declare const AccordionContent: (props: AccordionContentProps) => JSX.Element;
//# sourceMappingURL=accordion.d.ts.map