import * as React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
/**
 * SelectableCard — radio-as-a-card pattern for onboarding "pick one"
 * questions (goal picker, plan picker, use-case picker). Selectable
 * cards consistently outperform classic radio lists for these
 * questions: bigger tap targets, room for icon + description,
 * decision-feel rather than option-feel.
 *
 *   <SelectableCardGroup value={goal} onValueChange={setGoal}>
 *     <SelectableCard value="invoice" title="Send invoices" icon={<I />}>
 *       Bill customers and track payments.
 *     </SelectableCard>
 *     <SelectableCard value="track" title="Track expenses" icon={<E />}>
 *       Log receipts and categorize spending.
 *     </SelectableCard>
 *   </SelectableCardGroup>
 *
 * Built on Radix RadioGroup so:
 *   - exactly-one selection, native radio-group keyboard nav (arrows +
 *     Home/End), proper form submission semantics,
 *   - controlled (`value` + `onValueChange`) or uncontrolled
 *     (`defaultValue`) state,
 *   - `disabled` works per-item or at the group level.
 *
 * The underlying `<input type="radio">` is visually hidden (Radix's
 * RadioGroupItem renders a button — we wrap its label so the whole
 * card surface is the click target).
 */
declare const SelectableCardGroup: React.ForwardRefExoticComponent<Omit<RadioGroupPrimitive.RadioGroupProps & React.RefAttributes<HTMLDivElement>, "ref"> & React.RefAttributes<HTMLDivElement>>;
export interface SelectableCardProps extends Omit<React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>, "children" | "title"> {
    title?: React.ReactNode;
    icon?: React.ReactNode;
    /** Trailing badge slot (top-right) — typically a Badge with
     *  "Most popular" / "Best value" / "5+ users" style copy. */
    badge?: React.ReactNode;
    children?: React.ReactNode;
}
declare const SelectableCard: React.ForwardRefExoticComponent<SelectableCardProps & React.RefAttributes<HTMLButtonElement>>;
export { SelectableCard, SelectableCardGroup };
//# sourceMappingURL=card.selectable.d.ts.map