/**
 * Reason codes — the pure half of ReasonCodePicker.
 *
 *   bun run check:reason-codes
 *
 * Categories keep the plant's own order (common ones first, on purpose). Search
 * matches label, code and description; every typed word must match somewhere,
 * in any order, ignoring case and accents.
 */
export interface ReasonCode {
    id: string;
    label: string;
    /** The plant's short code ("M12"). Operators who know it type it. */
    code?: string;
    category?: string;
    /** A longer explanation, searched but shown only where there is room. */
    description?: string;
}
/** Categories in the order first listed, with how many reasons each has. */
export declare function reasonCategories(reasons: readonly ReasonCode[]): {
    id: string;
    count: number;
}[];
export declare function filterReasons<R extends ReasonCode>(reasons: readonly R[], options: {
    category?: string;
    query?: string;
}): R[];
