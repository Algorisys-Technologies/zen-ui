export type AggregationType = "sum" | "count" | "avg" | "min" | "max";

export interface PivotValueField {
  id: string;
  aggregation: AggregationType;
}

export interface PivotLayout {
  rows: string[];
  columns: string[];
  values: PivotValueField[];
  filters: Record<string, unknown>;
}

export type ZoneType = "available" | "rows" | "columns" | "values";

/**
 * Creates an empty pivot layout
 */
export function createEmptyLayout(): PivotLayout {
  return {
    rows: [],
    columns: [],
    values: [],
    filters: {},
  };
}

/**
 * Removes a field from any zone it might be in within the layout
 */
export function removeFieldFromLayout(layout: PivotLayout, fieldId: string): PivotLayout {
  return {
    ...layout,
    rows: layout.rows.filter((id) => id !== fieldId),
    columns: layout.columns.filter((id) => id !== fieldId),
    values: layout.values.filter((val) => val.id !== fieldId),
  };
}

/**
 * Adds a field to a specific zone at the end
 */
export function addFieldToZone(
  layout: PivotLayout,
  fieldId: string,
  zone: ZoneType,
  defaultAggregation: AggregationType = "sum",
): PivotLayout {
  // First ensure it's removed from wherever it was
  const cleanLayout = removeFieldFromLayout(layout, fieldId);

  switch (zone) {
    case "rows":
      return { ...cleanLayout, rows: [...cleanLayout.rows, fieldId] };
    case "columns":
      return { ...cleanLayout, columns: [...cleanLayout.columns, fieldId] };
    case "values":
      return {
        ...cleanLayout,
        values: [...cleanLayout.values, { id: fieldId, aggregation: defaultAggregation }],
      };
    case "available":
    default:
      return cleanLayout; // Being available means it's not in the layout configuration
  }
}

/**
 * Moves a field to a specific index within a zone
 */
export function insertFieldIntoZone(
  layout: PivotLayout,
  fieldId: string,
  zone: ZoneType,
  index: number,
  defaultAggregation: AggregationType = "sum",
): PivotLayout {
  const cleanLayout = removeFieldFromLayout(layout, fieldId);

  switch (zone) {
    case "rows": {
      const newRows = [...cleanLayout.rows];
      newRows.splice(index, 0, fieldId);
      return { ...cleanLayout, rows: newRows };
    }
    case "columns": {
      const newCols = [...cleanLayout.columns];
      newCols.splice(index, 0, fieldId);
      return { ...cleanLayout, columns: newCols };
    }
    case "values": {
      const newVals = [...cleanLayout.values];
      newVals.splice(index, 0, { id: fieldId, aggregation: defaultAggregation });
      return { ...cleanLayout, values: newVals };
    }
    case "available":
    default:
      return cleanLayout;
  }
}

/**
 * Reorders a field within the same zone
 */
export function reorderFieldInZone(
  layout: PivotLayout,
  fieldId: string,
  zone: ZoneType,
  newIndex: number,
): PivotLayout {
  let currentIndex = -1;
  
  if (zone === "rows") currentIndex = layout.rows.indexOf(fieldId);
  else if (zone === "columns") currentIndex = layout.columns.indexOf(fieldId);
  else if (zone === "values") currentIndex = layout.values.findIndex((v) => v.id === fieldId);
  
  if (currentIndex === -1 || currentIndex === newIndex) return layout;

  const newLayout = { ...layout };

  if (zone === "rows") {
    newLayout.rows = [...layout.rows];
    const [item] = newLayout.rows.splice(currentIndex, 1);
    newLayout.rows.splice(newIndex, 0, item);
  } else if (zone === "columns") {
    newLayout.columns = [...layout.columns];
    const [item] = newLayout.columns.splice(currentIndex, 1);
    newLayout.columns.splice(newIndex, 0, item);
  } else if (zone === "values") {
    newLayout.values = [...layout.values];
    const [item] = newLayout.values.splice(currentIndex, 1);
    newLayout.values.splice(newIndex, 0, item);
  }

  return newLayout;
}

/**
 * Updates the aggregation type for a field in the values zone
 */
export function updateValueAggregation(
  layout: PivotLayout,
  fieldId: string,
  aggregation: AggregationType,
): PivotLayout {
  return {
    ...layout,
    values: layout.values.map((v) => (v.id === fieldId ? { ...v, aggregation } : v)),
  };
}
