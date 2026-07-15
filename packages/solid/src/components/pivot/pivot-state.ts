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

export function defaultAggregationForField(field: PivotField): PivotAggregation {
  return "sum";
}
