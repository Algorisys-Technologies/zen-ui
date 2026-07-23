import { type JSX } from "solid-js";
/**
 * SelectableCard — radio-as-a-card pattern for onboarding "pick one"
 * questions (goal picker, plan picker, use-case picker). Solid port
 * built on Kobalte's RadioGroup.
 *
 *   <SelectableCardGroup value={goal()} onValueChange={setGoal}>
 *     <SelectableCard value="invoice" title="Send invoices" icon={<I />}>
 *       Bill customers and track payments.
 *     </SelectableCard>
 *     <SelectableCard value="track" title="Track expenses" icon={<E />}>
 *       Log receipts and categorize spending.
 *     </SelectableCard>
 *   </SelectableCardGroup>
 *
 * Kobalte handles exactly-one selection, full keyboard nav (arrows +
 * Home/End), and form submission semantics via a hidden radio input.
 *
 * API delta from the React (Radix) binding: the prop is `onValueChange`
 * on the React side; in Solid we use `onChange` to match Kobalte's
 * idiom across the rest of the binding. Both forms are accepted.
 */
export type SelectableCardGroupProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "class" | "children" | "onChange"> & {
    value?: string;
    defaultValue?: string;
    onChange?: (value: string) => void;
    /** Alias for onChange, for parity with the React `onValueChange` name. */
    onValueChange?: (value: string) => void;
    name?: string;
    disabled?: boolean;
    required?: boolean;
    orientation?: "horizontal" | "vertical";
    class?: string;
    children?: JSX.Element;
};
export declare const SelectableCardGroup: (props: SelectableCardGroupProps) => JSX.Element;
export type SelectableCardProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "class" | "children"> & {
    value: string;
    title?: JSX.Element;
    icon?: JSX.Element;
    /** Trailing badge slot (top-right) — typically a Badge component with
     *  "Most popular" / "Best value" / "5+ users" style copy. */
    badge?: JSX.Element;
    children?: JSX.Element;
    disabled?: boolean;
    class?: string;
};
export declare const SelectableCard: (props: SelectableCardProps) => JSX.Element;
//# sourceMappingURL=card.selectable.d.ts.map