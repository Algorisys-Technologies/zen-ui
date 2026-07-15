import type { PivotFilterSelection } from "./pivot-filter-state";

export type PivotZone = "available" | "rows" | "columns" | "values";
export type PivotAggregation = "sum" | "count" | "avg" | "min" | "max";

export type PivotFieldType = "dimension" | "measure";

export interface PivotField {
  key: string;
  label: string;
  type: PivotFieldType;
}

export interface PivotMembersRequest {
  fieldKey: string;
  search?: string;
  offset?: number;
  limit?: number;
  filters?: Record<string, PivotFilterSelection>;
}

export interface PivotMembersResult {
  values: string[];
  hasMore: boolean;
  total?: number;
}

export function fieldLabel(fields: PivotField[], key: string): string {
  const field = fields.find((f) => f.key === key);
  return field?.label ?? key;
}

/**
 * The default aggregation for a field.
 *
 * STUB: returns "sum" for every field, whatever it is — the parameter is here
 * for the signature, not because it is read. So a count-like or average-like
 * measure silently defaults to a sum, which is a plausible number and the wrong
 * one. Left as-is deliberately rather than guessed at: what a field's natural
 * aggregation is depends on the data model, and inventing a rule here would bake
 * in a guess that is harder to find than this comment.
 */
export function defaultAggregationForField(_field: PivotField): PivotAggregation {
  return "sum";
}
