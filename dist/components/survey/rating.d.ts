import * as React from "react";
/**
 * Rating — 5-star (or N-star) rating input. Use for feedback
 * collection: "Rate your experience", "How would you rate this
 * driver?", post-purchase review prompts.
 *
 *   const [stars, setStars] = useState(0);
 *   <Rating value={stars} onValueChange={setStars} label="Rate the support agent" />
 *
 * Semantically a radiogroup (per WAI-ARIA Authoring Practices §
 * "Rating") so screen readers announce "1 of 5", "2 of 5", etc. on
 * arrow-key nav. Hover preview tints stars up to the pointed-at index
 * but doesn't commit until click. Click an already-selected star to
 * clear the rating (skip via `allowClear={false}`).
 *
 * `allowHalf` keeps all of that and doubles the options: each star
 * grows a left and a right hit target, arrows step by 0.5, and the
 * radios announce "2.5 stars". The stars stay whole — it is the
 * options that halve, not the picture.
 */
export interface RatingProps {
    value?: number;
    defaultValue?: number;
    onValueChange?: (value: number) => void;
    /** Number of stars rendered. Default 5. */
    max?: number;
    /**
     * Allow half-star values (0.5, 1, 1.5 …). Each star becomes two
     * options rather than each half becoming a star.
     */
    allowHalf?: boolean;
    /** Accessible name for the radiogroup. Required for a11y. */
    label?: string;
    /** Optional caption rendered next to the stars. */
    showValue?: boolean;
    /** Star size. Default md (24px). */
    size?: "sm" | "md" | "lg";
    /** Click on the currently-selected star clears it. Default true. */
    allowClear?: boolean;
    disabled?: boolean;
    /** Render without click handlers — display-only. */
    readOnly?: boolean;
    className?: string;
    /** Name attached to a hidden input so the rating participates in
     *  native form submission. */
    name?: string;
}
export declare const Rating: React.ForwardRefExoticComponent<RatingProps & React.RefAttributes<HTMLDivElement>>;
//# sourceMappingURL=rating.d.ts.map